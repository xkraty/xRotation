/*!
 * jQuery xRotation Plugin
 * Version 1.0.7 (10-JAN-2012)
 * Written by Chris Campoli (me{at}campolichristian.com)
 * @requires jQuery v1.7.1 or later
 *
 * Copyright (c) 2012 xKraty
 *
 *	Permission is hereby granted, free of charge, to any person obtaining
 *	a copy of this software and associated documentation files (the
 *	"Software"), to deal in the Software without restriction, including
 *	without limitation the rights to use, copy, modify, merge, publish,
 *	distribute, sublicense, and/or sell copies of the Software, and to
 *	permit persons to whom the Software is furnished to do so, subject to
 *	the following conditions:
 *
 *	The above copyright notice and this permission notice shall be
 *	included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function( $ ) {
	$.fn.xRotation = function(options) {
		// Defaults to extend options
		var settings = $.extend( {
			'width'			:	'auto', // container width, if auto it will autoset to 100%
			'height'		:	'auto', // container height, if auto it will just leave the container height as setted in the css or it will be the sum of the images height if it has no height
			'controls'		:	'bottom-center', // slider controls ( play, pause, next, prev ), <vertical>-<horizontal>, vertical = top|bottom, horizontal = left|center|right
			'defaultTop'	:	5, // top controls position
			'defaultBottom'	:	5, // bottom controls position
			'defaultLeft'	:	5, // left controls position
			'defaultRight'	:	5, // right controls position
			'loadBar'		:	'bottom', // loadbar position top|bottom or hide for no bar
			'loadBarHeight'	:	'5px', // loadbar height
			'loadBarColor'	:	'#aaa', // loadbar color
			'loadBarOpacity':	'.6', //loadbar opacity
			'timer'			:	5000, // slide time
			'trigger'		:	50, // loadbar segment timer / trigger (eg. 5000/50 = 100) optimal is ratio 100
			'xClass'		:	'x-element', // class of the element wrapper
			'effect'		:	'fade', // slide effect fade|slide|cut
			'autoStart'		:	true, // auto start the rotaion
			'playLabel'		:	'', // label for the play icon 
			'pauseLabel'	:	'', // label for the pause icon
			'prevLabel'		:	'', // label for the prev icon
			'nextLabel'		:	'' // label for the next icon
		}, options);
		
		return this.each(function(i) {
			//*************
			// Global Variables
			var w, h, q = $(this), timer = settings.timer, counter = 0, minitimer = timer / settings.trigger, pause = false, pauseType = 'none';
			//*************

			//**************
			// Set up
			//**************
			q.css({'position': 'relative', 'overflow' : 'hidden', 'visibility': 'visible'});
			q.find(' > *').wrap('<div class="'+settings.xClass+'"></div>');
			
			if ( settings.width == 'auto' ) {
				w = q.width();
			} else {
				w = settings.width;
			}
			if ( settings.height == 'auto' ) {
				h = q.height();
			} else {
				h = settings.height;
			}
			q.width(w);
			q.height(h);
			
			q.find('.'+settings.xClass+" > *").each(function(k){
				checkSize($(this));
			});
			q.find('.'+settings.xClass).hide().first().show();
			q.find('.'+settings.xClass+':first').addClass('first'); // have to add a class to the first element cause is:(':first') was not working properly
			q.find('.'+settings.xClass+':last').addClass('last'); // have to add a class to the last element cause is:(':last') was not working properly
			// Adding loading bar
			if ( settings.loadBar != 'hide' ) {
				var loadbar = '<div class="x-loadbar"></div>', loadBarPosition;
				q.append(loadbar);
				q.find(".x-loadbar").css({
					'width': '100%',
					'position': 'absolute',
					'height': settings.loadBarHeight,
					'background': settings.loadBarColor,
					'opacity': settings.loadBarOpacity
				});
				switch ( settings.loadBar ) {
					case 'top':
						q.find(".x-loadbar").css('top', 0);
						break;
					case 'bottom':
						q.find(".x-loadbar").css('bottom', 0);
						break;
				}
			}
			// Adding controls
			if ( settings.controls != 'hide' ) {
				var controls = '<div class="x-controls"><span class="prev" title="'+settings.prevLabel+'">'+settings.prevLabel+'</span><span class="play" title="'+settings.playLabel+'">'+settings.playLabel+'</span>';
				controls += '<span class="pause" title="'+settings.pauseLabel+'">'+settings.pauseLabel+'</span><span class="next" title="'+settings.nextLabel+'">'+settings.nextLabel+'</span></div>';
				q.append(controls);
				// Settings controls position
				q.find(".x-controls").css({
					'position': 'absolute',
					'opacity': .1
				});
				// controlsPosition[0] vertical align
				// controlsPosition[1] horizontal align
				var controlsPosition = settings.controls.split('-');
				switch ( controlsPosition[0] )
				{
					case 'top':
						q.find(".x-controls").css('top', settings.defaultTop+'px');
						break;
					case 'bottom':
						q.find(".x-controls").css('bottom', settings.defaultBottom+'px');
						break;
				}
				switch ( controlsPosition[1] )
				{
					case 'left':
						q.find(".x-controls").css('left', settings.defaultLeft+'px');
						break;
					case 'right':
						q.find(".x-controls").css('right', settings.defaultRight+'px');
						break;
					case 'center':
						var tmp = ( w - q.find(".x-controls").width() ) / 2;
						q.find(".x-controls").css('right', tmp+'px');
						break;
				}
				if ( settings.autoStart ) {
					q.find(".x-controls .play").hide();
				} else {
					q.find(".x-controls .pause").hide();
				}
			}
			// **********
			// Startup
			// **********
			// if there is more than 1 slide no need any effect
			if ( q.find('.'+settings.xClass).length > 1 && settings.autoStart ) {
				startRotate();
			}
			// *********
			// xRotation
			// *********
			function xrotate()
			{
				if ( !pause ) {
					if ( counter < timer ) {
						counter += minitimer;
						var percent = ( counter * 100 ) / timer;
						q.find(".x-loadbar").css('width', percent+'%');
						startRotate();
					} else {
						counter = 0;
						gonext();
					}
				}
			}
			// Start the rotation
			function startRotate()
			{
				if ( !pause ) {
					setTimeout(xrotate, minitimer);
				}
			}
			// Show the next slide
			function gonext(direction)
			{
				var direction = direction || 'forward';
				var el = q.children('.'+settings.xClass+':visible'), next;
				if ( direction == 'forward' ) {
					if ( el.hasClass('last') ) {
						next = q.children('.'+settings.xClass+':first');
					} else {
						next = el.next();
					}
				} else if ( direction == 'backward' ) {
					if ( el.hasClass('first') ) {
						next = q.children('.'+settings.xClass+':last');
					} else {
						next = el.prev();
					}
				}
				if ( settings.effect == 'fade' ) {
					el.fadeOut(function(){
						next.fadeIn(function(){
							startRotate();
						});
					});
				} else if ( settings.effect == 'slide' ) {
					el.slideUp(function(){
						next.slideDown(function(){
							startRotate();
						});
					});
				} else { //cut
					el.hide(function(){
						next.toggle(explode);
					});
				}
			}
			// Check the size of the slide for resize to fit in the container
			function checkSize(s)
			{
				var slideWidth = s.width(), slideHeight = s.height();
				var new_w, new_h;
				if ( slideWidth > w ) { // if both are greater than container
					var ratio = slideWidth / slideHeight;
					new_w = slideWidth = w;
					new_h = slideHeight = w / ratio;
				}
				if ( slideHeight > h ) { // if the height is greather than the container height
					var ratio = slideHeight / slideWidth;
					new_w = h / ratio;
					new_h = h;
				} else { //add some margin for center it vertically
					var top = ( h - slideHeight ) / 2;
					s.parent().css('margin-top', top+'px');
				}
				s.width(new_w);
				s.height(new_h);
			}
			// set the pause to stop the rotation and toggle the button
			function pauseOn()
			{
				pause = true;
				q.find(".x-controls .pause").hide();
				q.find(".x-controls .play").show();
			}
			// restart the rotation and toggle the button
			function pauseOff()
			{
				pause = false;
				startRotate();
				q.find(".x-controls .play").hide();
				q.find(".x-controls .pause").show();
			}
			// Binding controls
			if ( settings.controls ) {
				q.bind('mouseover', function(){
					$(".x-controls").css('opacity', .7);
				}).bind('mouseout', function(){
					$(".x-controls").css('opacity', .1);
				});
				q.find(".x-controls .pause").bind('click', function(){
					pauseOn();
				});
				q.find(".x-controls .play").bind('click', function(){
					pauseOff();
				});
				q.find(".x-controls .next").bind('click', function(){
					pauseOn();
					gonext('forward');
				});
				$(".x-controls .prev").bind('click', function(){
					pauseOn();
					gonext('backward');
				});
			}
		}); // each
	}; // plugin
})( jQuery );