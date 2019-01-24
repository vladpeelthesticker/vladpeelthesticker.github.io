(function() {
	const MENU = 1, RESULT = 2;

	const time_start = Date.now();
	let delta_time_last = Date.now();

	let w, h;

	let canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d");

	canvas.width = w = window.innerWidth;
	canvas.height = h = window.innerHeight;

	let overlay_state_prev = null;
	let overlay_state = MENU;
	let overlay_animation_step = 1;
	let overlay_animation_fade = -1;

	let pointer_x = 0, pointer_y = 0, pointer_down = false, pointer_in_bound = false;

	let phone_x = Math.floor(w / 2 - 280);
	let phone_y = Math.floor(h / 2 - 280);

	let sticker_initial_x = phone_x + 160;
	let sticker_initial_y = phone_y + 60;

	let sticker_x = sticker_initial_x, sticker_y = sticker_initial_y;
	let sticker_alpha = 1;

	let btn_x = Math.floor(w / 2 - 115), btn_y = Math.floor(h / 2 - 115);

	let sun_x = Math.floor(w / 2 - 100);
	let moon_x = sun_x;
	let moon_y = sun_x + h + 100;

	let assets = {
		"btn": null,
		"sticker": null,
		"phone": null,
		"win": null,
		"hand": null,
		"sun": null,
		"moon": null
	}
	let assets_length = 0, loaded = 0;

	for (let key in assets) {
		assets_length++;
		load_asset("./assets/" + key + ".png", function(img) {
			assets[key] = img;
			if (++loaded === assets_length) draw();
		});
	}

	function load_asset(src, callback) {
		let img = new Image();
		img.src = src;
		img.onload = () => callback(img);
	}

	function start_game() {
		sticker_x = sticker_initial_x;
		sticker_y = sticker_initial_y;
		sticker_alpha = 1;
	}

	function bound(x, y, v) {
		if (v >= x && v <= y) return v;
		if (v < x) return x;
		if (v > y) return y;
	}

	function overlay_switch(overlay, fade) {
		overlay_state_prev = overlay_state;
		overlay_state = overlay;
		overlay_animation_step = fade === -1 ? 0.999 : 0.001;
		overlay_animation_fade = fade;
	}

	function delta_time() {
		const old = delta_time_last;
		delta_time_last = Date.now();
		return Date.now() - old;
	}

	function draw() {
		const time_passed = Date.now() - time_start;
		update();

		ctx.clearRect(0, 0, w, h);

		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "rgba(150, 150, 255, " + Math.sin(time_passed / 10000 + 1.6) + ")"; 
		ctx.fillRect(0, 0, w, h);

		ctx.globalAlpha = 1;
		
		const dx = Math.cos(time_passed / 10000), dy = Math.sin(time_passed / 10000);
		ctx.save();
		ctx.setTransform(dx, dy, -dy, dx, sun_x, h);
		ctx.drawImage(assets.sun, 0, -600, 200, 200);
		ctx.drawImage(assets.moon, 0, 600, 200, 200);
		ctx.restore();
		
		ctx.drawImage(assets.phone, phone_x, phone_y, 560, 560);

		ctx.globalAlpha = bound(0, 1, sticker_alpha);
		ctx.drawImage(assets.sticker, sticker_x, sticker_y, 95, 30);

		if (overlay_state === RESULT || overlay_state_prev === RESULT || overlay_state === MENU || overlay_state_prev === MENU) {
			ctx.globalAlpha = bound(0, 1, overlay_animation_step);
			ctx.drawImage(assets.btn, btn_x, btn_y, 230, 230);
		}

		if (overlay_state === RESULT || overlay_state_prev === RESULT) {
			ctx.drawImage(assets.win, btn_x, btn_y - 200, 230, 190);
		}

		ctx.globalAlpha = 1;
		ctx.drawImage(assets.hand, pointer_x, pointer_y);

		window.requestAnimationFrame(draw);
	}

	function update() {
		const delta = delta_time();

		if (sticker_alpha > 0 && sticker_alpha < 1) {
			sticker_alpha -= delta * 0.005;
		} else if (sticker_alpha < 0) {
			sticker_alpha = 0;
		}

		if (overlay_animation_step > 0 && overlay_animation_step < 1) {
			overlay_animation_step += delta * 0.005 * overlay_animation_fade;
		}
	}

	canvas.addEventListener("mousemove", handle_mousemove);
	canvas.addEventListener("touchmove", handle_mousemove);
	canvas.addEventListener("mousedown", handle_mousedown);
	canvas.addEventListener("touchstart", handle_mousedown);
	canvas.addEventListener("mouseup", handle_mouseup);
	canvas.addEventListener("touchend", handle_mouseup);

	function handle_mousemove(event) {
		event.preventDefault();

		if (event.touches && event.touches[0]) event = event.touches[0];

		const dx = event.pageX - pointer_x;
		const dy = event.pageY - pointer_y;

		pointer_x = event.pageX;
		pointer_y = event.pageY;

		if (pointer_down && pointer_in_bound) {
			sticker_x += dx;
			sticker_y += dy;
		}
	}

	function handle_mousedown(event) {
		event.preventDefault();

		if (event.touches && event.touches[0]) event = event.touches[0];

		pointer_down = true;

		const x = event.pageX + 50, y = event.pageY + 20;

		pointer_in_bound = x > sticker_x
				&& y > sticker_y
				&& x < sticker_x + 95
				&& y < sticker_y + 50;
	}

	function handle_mouseup(event) {
		pointer_down = false;

		if (overlay_state != null) {
			start_game();
			overlay_switch(null, -1);
			return;
		}

		if ((Math.abs(sticker_x - sticker_initial_x) < 200) && (Math.abs(sticker_y - sticker_initial_y) < 100)) {
			sticker_x = sticker_initial_x;
			sticker_y = sticker_initial_y;
		} else {
			sticker_alpha = 0.999;
			overlay_switch(RESULT, 1);
		}
	}
})();
