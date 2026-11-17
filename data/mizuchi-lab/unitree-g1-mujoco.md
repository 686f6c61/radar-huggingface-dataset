# mizuchi-lab/unitree-g1-mujoco

## Resumen

`mizuchi-lab/unitree-g1-mujoco` es un fork del repositorio de simulación `lerobot/unitree-g1-mujoco`, que proporciona el modelo MuJoCo del robot humanoide Unitree G1 para su uso dentro del ecosistema LeRobot. No es un modelo de lenguaje ni una red neuronal entrenada: es un paquete de activos de simulación (ficheros MJCF/XML, mallas y código Python de composición) que LeRobot carga dinámicamente mediante `env.py` para ejecutar episodios de teleoperación y grabación de datos sobre un robot simulado.

El fork de mizuchi-lab modifica la configuración por defecto para usar el cuerpo de 23 grados de libertad (revisión de hardware rev_1_0), el efector final Pollen Robotics AmazingHand y una cabeza pan/tilt con cámara Intel RealSense D455. La composición de la escena es modular: cuerpo, efector final, montura de cabeza y sensor se combinan en tiempo de carga a partir de ficheros de piezas reutilizables, lo que permite generar variantes sin duplicar geometría.

Su relevancia es práctica para investigación en robótica: permite validar pipelines de aprendizaje por imitación (LeRobot) sobre una configuración hardware concreta antes de desplegarla en el robot físico, manteniendo intactos los tópicos DDS de estado y comando del cuerpo, el bucle de simulación y el formato de mensajes de imagen por ZMQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de simulación física MuJoCo (MJCF/XML) para el robot Unitree G1; no es una red neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | XML MJCF (`.xml`) más mallas; composición dinámica en tiempo de carga |
| Cuerpo por defecto | `23dof` (rev_1_0), 23 motores de cuerpo, `mode_machine` 4 |
| Cuerpo alternativo | `29dof`, 29 motores de cuerpo, `mode_machine` 2 |
| Efector final por defecto | `amazing_hand` (Pollen Robotics AmazingHand, 8 servos vía puente ZMQ) |
| Efectores alternativos | `rubber_hand`, `none`, `dex1` (2 dedos, DDS), `dex3` (7 articulaciones, DDS) |
| Montura de cabeza | `pan_tilt` (2 DoF Dynamixel, puente ZMQ) por defecto; alternativa `fixed` |
| Sensor de cabeza | `d455` (Intel RealSense D455) por defecto; alternativa `d435i` |
| Tamaño del repositorio | 0,1 GB |
| Librería | `lerobot` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino una descripción cinemática y dinámica en formato MuJoCo. Cada configuración se compone en tiempo de carga a partir de un cuerpo "desnudo" (`assets/g1_23dof.xml` o `assets/g1_29dof.xml`, extraídos del MJCF oficial de Unitree) más ficheros de piezas: efectores finales, monturas de cabeza y sensores. Los cuerpos `*_ee_mount` se insertan en el frame `wrist_yaw_link` (29dof) o en `wrist_roll_link` con los offsets de muñeca a +0,084 m (23dof), y las monturas de cabeza definen un árbol de cuerpos en el frame `torso_link` con un `head_sensor_mount` donde se ancla el sensor.

La innovación técnica principal es la modularidad y la preservación de interfaces: se mantienen el punto de entrada `make_env()`, los comandos de motor del cuerpo, los tópicos DDS `LowState_`/`LowCmd_`, el stepping de simulación y el formato de mensajes de imagen ZMQ. Los mensajes DDS transportan siempre 35 ranuras de motor; el cuerpo de 23dof publica solo las ranuras `0-12, 15-19, 22-26` y deja las seis restantes (`13, 14, 20, 21, 27, 28`, correspondientes a waist_roll/waist_pitch y wrist_pitch/wrist_yaw de cada brazo) en los valores por defecto del SDK (`q=dq=tau=0`), ignorando cualquier comando escrito en ellas. El mapeo vive en `JOINT_SLOTS` dentro de `sim/unitree_sdk2py_bridge.py`. Los ficheros generados (`dex1.xml`, `amazing_hand.xml`) se validan mediante `ToolsTests` y no deben editarse a mano. El MJCF compuesto se escribe en un directorio temporal (`<tmp>/unitree_g1_mujoco/`) con rutas absolutas a las mallas.

No se dispone de información sobre datos de entrenamiento, RLHF, DPO ni procesos de ajuste, ya que no aplica a este tipo de artefacto.

## Capacidades

- Simulación física del Unitree G1 en MuJoCo con cuerpos de 23 y 29 grados de libertad.
- Composición modular de escena: cuerpo, efector final, montura de cabeza y sensor se seleccionan de forma independiente.
- Efectores finales soportados: manos pasivas de serie (`rubber_hand`), muñeca desnuda (`none`), pinza Dex1-1 (`dex1`), mano Dex3-1 (`dex3`) y AmazingHand (`amazing_hand`).
- Cabeza pan/tilt de 2 DoF con Dynamixel, controlada a través de puente ZMQ.
- Cámaras de cabeza Intel RealSense D435i o D455, con publicación de imágenes por ZMQ.
- Cámaras de muñeca adicionales cuando se seleccionan `dex1` o `dex3` (cabeza más ambas muñecas).
- Integración directa con LeRobot mediante `--robot.type=unitree_g1 --robot.is_simulation=true --robot.sim_env_repo_id=mizuchi-lab/unitree-g1-mujoco`.
- Compatibilidad con el flujo de grabación de episodios de LeRobot (`lerobot-record`).
- Preservación de la interfaz DDS de Unitree (`LowState_`/`LowCmd_`) con 35 ranuras de motor.
- Punto de entrada programático `make_env(body=..., end_effector=..., ...)` para uso directo fuera de LeRobot.

## Casos de uso

- **Grabación de datos de imitación en simulación**: usar `lerobot-record` con `sim_env_repo_id=mizuchi-lab/unitree-g1-mujoco` para generar episodios de teleoperación sobre el G1 de 23dof con AmazingHand, sin necesidad de disponer del robot físico.
- **Validación de pipelines antes del despliegue real**: comprobar que las políticas entrenadas con LeRobot consumen correctamente los tópicos DDS y el formato de imagen ZMQ antes de trasladar el sistema al hardware rev_1_0.
- **Pruebas de compatibilidad de efectores finales**: alternar entre `rubber_hand`, `dex1`, `dex3` y `amazing_hand` cambiando una sola variable de configuración, para evaluar cómo afecta la morfología de la mano a las trayectorias y a las políticas aprendidas.
- **Desarrollo de control de cabeza activa**: emplear la montura `pan_tilt` con cámara D455 para experimentar con estrategias de seguimiento visual y control cenital en tareas de manipulación.
- **Investigación en manipulación bimanual**: el cuerpo de 29dof con `dex3` ofrece 7 articulaciones accionadas por mano más cámaras de muñeca, adecuado para estudiar agarres finos y coordinación entre brazos.
- **Docencia y reproducción de experimentos**: el repositorio pesa 0,1 GB y se compone en tiempo de carga, lo que facilita distribuir un entorno reproducible en cursos y artículos sin depender de instalaciones complejas de CAD.
- **Integración en bucles de simulación a medida**: llamar directamente a `make_env(end_effector="dex3")` desde Python para incorporar el robot simulado en un `while True: env.step()` propio, con comandos de cuerpo llegando por DDS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM de inferencia de un modelo neuronal; el requisito es ejecutar MuJoCo y, opcionalmente, LeRobot.
- El repositorio ocupa 0,1 GB, por lo que el almacenamiento necesario es mínimo.
- El coste computacional dominante es la simulación física de un humanoide de 23 o 29 DoF más el renderizado de hasta tres cámaras (cabeza y dos muñecas en configuraciones `dex1`/`dex3`).
- No se dispone de datos publicados de latencia ni de throughput de stepping para este fork.
- Opciones de despliegue: MuJoCo con Python a través de `env.py`/`make_env()`, o LeRobot CLI (`lerobot-record`) con `--robot.is_simulation=true`.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Repositorio | Tipo | Cuerpo | Efector por defecto | Cabeza | Licencia |
|---|---|---|---|---|---|
| `mizuchi-lab/unitree-g1-mujoco` (este) | Modelo MuJoCo para LeRobot | 23dof (rev_1_0) | AmazingHand | pan/tilt + D455 | no disponible |
| `lerobot/unitree-g1-mujoco` | Modelo MuJoCo para LeRobot (upstream) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible |
| Modelos MJCF oficiales de Unitree | Descripción del robot para MuJoCo | 29dof y variantes Dex3 | manos pasivas / Dex3 | fija | no disponible en la información |

La comparación cuantitativa de rendimiento no está disponible, ya que ninguno de los artefactos comparados publica métricas de benchmarks en la información consultada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, código ni imágenes; cualquier expectativa de inferencia lingüística es incorrecta.
- La licencia no está declarada en la información disponible, lo que impide confirmar condiciones de uso comercial; conviene verificar el repositorio upstream y las licencias de Unitree, Pollen Robotics e Intel antes de un uso productivo.
- El cuerpo de 23dof ignora silenciosamente los comandos dirigidos a las seis ranuras sin articulación (`13, 14, 20, 21, 27, 28`), lo que puede enmascarar errores en controladores que asuman 35 motores activos.
- Las monturas de Dex en el cuerpo de 23dof y de AmazingHand en el cuerpo de 29dof son marcadores de posición por falta de CAD adaptador: no representan una integración mecánica real.
- Los ficheros generados (`dex1.xml`, `amazing_hand.xml`) no deben editarse a mano; los cambios manuales se pierden y rompen `ToolsTests`.
- El MJCF compuesto se escribe en un directorio temporal con rutas absolutas a mallas, por lo que mover o limpiar ese directorio invalida la escena cargada.
- El fork fija valores por defecto distintos del upstream (23dof, AmazingHand, pan/tilt, D455); scripts escritos contra el repositorio original pueden comportarse de forma distinta sin cambios aparentes.
- No se dispone de información sobre sesgos, alucinación o cobertura idiomática por no tratarse de un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mizuchi-lab/unitree-g1-mujoco
- Repositorio upstream: https://huggingface.co/lerobot/unitree-g1-mujoco
- Pollen Robotics AmazingHand: https://github.com/pollen-robotics/AmazingHand
- Conector impreso en 3D para AmazingHand (Onshape): https://cad.onshape.com/documents/670021bdea1488baadcbf893
- LeRobot: https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org
