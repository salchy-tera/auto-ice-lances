const SettingsUI = require('tera-mod-ui').Settings
module.exports = function SalchySorcAutoLances(mod) {
	let ui = null
	if (global.TeraProxy.GUIMode) {
		ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 390 })
		ui.on('update', settings => {
			mod.settings = settings
		})
		
		this.destructor = () => {
			if (ui) {
				ui.close()
				ui = null
			}
		}
	}	
	mod.command.add("alui", () => { if (ui) ui.show() })
	const options = mod.settings
	let order = { order: -Infinity, filter: { fake: null } };
	let sorc_job = 4;
	
	let sorc_enab = false;

	let myPosition = null;
	let myAngle = null;
	let cid;
	let model;
	let job;
	let dolance = false

	
	mod.command.add('al', () => {
		
		options.enabled = !options.enabled
		mod.command.message(`Salchy's sorc auto lance is now ${(options.enabled) ? 'en' : 'dis'}abled.`)
	})

	mod.hook('S_LOGIN', 14, event => {
		sorc_enab = false;
		cid = event.gameId;
		model = event.templateId;
		job = (model - 10101) % 100;
		sorc_enab = [sorc_job].includes(job);
		
	});
	mod.hook('S_SPAWN_ME', 3, event => {
		myPosition = event.loc
		myAngle = event.w
	})

	
	mod.hook('C_NOTIFY_LOCATION_IN_DASH', 4, event => {
		myAngle = event.w;
		myPosition = event.loc;
	})
	mod.hook('C_NOTIFY_LOCATION_IN_ACTION', 4, event => {
		myAngle = event.w;
		myPosition = event.loc;
	})
	mod.hook('C_START_SKILL', 7, event => {
		if(!sorc_enab) return
		dolance = false
		if (options.enabled) {
				let sInfo = getSkillInfo(event.skill.id)
				switch(sInfo.group) {
					case 4:
						if(!options.arcane) return
						dolance = true
						break					
					case 6:
						if(!options.fireblast) return
						dolance = true
						break
					case 27:
						if(!options.hailstorm) return
						dolance = true
						break					
					case 30:
						if(!options.nova) return
						dolance = true
						break
					case 32:
						if(!options.fireblast) return
						dolance = true
						break
					case 33:
						if(!options.arcane) return
						dolance = true
						break
					case 36:
						if(!options.fusion) return
						dolance = true
						break
					default:
						return
						break					
				}
				if(dolance) {
					myPosition = event.loc;
					myAngle = event.w;					
					lances(options.distance,0)
				}
		}
	})
	mod.hook('C_START_INSTANCE_SKILL', 7, order, event => {
		if(!sorc_enab) return
		dolance = false
		if (options.enabled) {
				let sInfo = getSkillInfo(event.skill.id)
				switch(sInfo.group) {
					case 33:
						if(!options.arcane) return
						dolance = true
						break
					case 36:
						if(!options.fusion) return
						dolance = true
						break
					default:
						return
						break					
				}
				if(dolance) {
					myPosition = event.loc;
					myAngle = event.w;					
					lances(options.distance,0)
				}
		}
	})	
	mod.hook('C_PLAYER_LOCATION', 5, (event) => {
		myPosition = event.loc;
		myAngle = event.w;
	});

    function getSkillInfo(id) {
		let nid = id;
        return {
            id: nid,
            group: Math.floor(nid / 10000),
            level: Math.floor(nid / 100) % 100,
            sub: nid % 100
        };
    }
	function lances(d, n) {
		CastLances((Math.cos(myAngle) * d) + myPosition.x, (Math.sin(myAngle) * d) + myPosition.y, myPosition.z + n, myAngle);
	}
	
	function CastLances(x, y, z, w = 0) {
					mod.send('C_START_SKILL', 7, {
						skill: {
							reserved: 0,
							npc: false,
							type: 1,
							huntingZoneId: 0,
							id: 350100
						},
						w: myAngle,
						loc: myPosition,
						dest: {
							x: x,
							y: y,
							z: z
						},
						unk: true,
						moving: false,
						continue: false,
						target: 0,
						unk2: false						
					})		
	}	
}
