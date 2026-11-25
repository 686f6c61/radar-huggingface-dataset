# m-serra/unitree-g1-mujoco

## Resumen

`m-serra/unitree-g1-mujoco` es un repositorio de activos y entorno de simulacion para el robot humanoide Unitree G1, empaquetado para su uso con LeRobot, la libreria de aprendizaje por imitacion de Hugging Face. No se trata de un modelo de lenguaje ni de un modelo neuronal entrenado, sino de un entorno MuJoCo completo (escenas MJCF, URDF, mallas, camaras y publicadores ZMQ) que LeRobot carga dinamicamente a traves de `env.py` para ejecutar politicas de control sobre el robot simulado.

El repositorio deriva del entorno base `lerobot/unitree-g1-mujoco` y anade soporte para distintos efectores finales: pinzas paralelas Dex1-1 (por defecto), manos articuladas Dex3 y el robot sin manos. La escena por defecto (`assets/scene_33dof.xml`) expone 29 motores corporales mas 2 dedos por pinza, y publica tres camaras (cabeza y ambas munecas) a 640x480 y aproximadamente 30 Hz sobre `tcp://127.0.0.1:5555`.

Su relevancia es practica para investigacion en robotica: permite entrenar y evaluar politicas de manipulacion y locomotion sobre un humanoide de 29 grados de libertad en MuJoCo, conservando la interfaz DDS de Unitree SDK2 y el esquema de acciones de 29 motores de LeRobot, ademas de la geometria real de las pinzas y camaras de muneca. El tamano del repositorio es de 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulacion MuJoCo (MJCF/URDF) para robot humanoide; no es una red neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible en los metadatos; el URDF Dex1 de origen es Apache 2.0 (en `reference/hiw500/`), las mallas de Unitree conservan sus terminos upstream |
| Formato de pesos | no disponible (no aplica); activos en MJCF (`scene_33dof.xml`, `scene_hands_cameras.xml`, `scene_29dof.xml`, `scene_43dof.xml`) y URDF (`g1_29dof_with_dex1_1.urdf`, `g1_29dof_with_hand.xml`, `g1_body29_hand14.urdf`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un entorno fisico simulado. MuJoCo carga `assets/scene_33dof.xml` por defecto, que incorpora el MJCF de la pinza derivado del URDF suministrado; el URDF portable se incluye en `assets/g1_29dof_with_dex1_1.urdf`. Las camaras y actuadores en tiempo de ejecucion se definen en MJCF. La seleccion del efector final se controla con `END_EFFECTOR` en `config.yaml` (`dex1`, `dex3`, `dummy`, con alias `grippers`, `hands`, `none`), y ajusta automaticamente la escena, el numero de dedos, los limites de esfuerzo y la lista de camaras publicadas.

La interfaz de control preserva el punto de entrada `make_env()`, los 29 comandos de motor corporales, los topicos DDS de estado del cuerpo, el stepping de simulacion y el formato de mensajes de imagen por ZMQ. Las pinzas Dex1 usan actuadores de fuerza gobernados por un controlador PD externo del puente existente, con recorrido en metros (`q`) y esfuerzo en newtons (`tau`), limitado a 20 N por dedo y con limite inferior de simulacion de -0,023 m (el URDF oficial mantiene -0,020 m; `build_gripper_model.py --official-limits` aplica ese limite en MJCF). No se documenta entrenamiento con datos ni fases de RLHF/DPO porque no aplica.

## Capacidades

- Simulacion fisica de un humanoide Unitree G1 de 29 grados de libertad corporales en MuJoCo.
- Seleccion de efector final: pinzas paralelas Dex1-1 (2 dedos por pinza), manos articuladas Dex3 (7 articulaciones por mano) o robot sin manos.
- Publicacion de tres flujos de camara (`head_camera`, `left_wrist_cam`, `right_wrist_cam`) a 640x480, ~30 Hz, con campo de vision vertical de 95 grados en las camaras de muneca.
- Transporte de imagenes por ZMQ en formato JPEG con claves `images` y `timestamps`, compatible con `view_cameras_live.py` y con `ZMQCameraConfig` de LeRobot.
- Interfaz DDS compatible con Unitree SDK2 / CycloneDDS para comandos y estado del cuerpo.
- Integracion con LeRobot mediante `env.py` y el esquema de acciones `UnitreeG1` de 29 motores corporales (las acciones de dedos no se anaden a ese esquema).
- Modo headless (`onscreen=False`) y control selectivo de publicacion de camaras (`cameras=[...]`, `publish_images=False`).
- Suite de pruebas de regresion con MuJoCo real y doble de prueba para aislar DDS, mas `smoke_live.py` para transporte en vivo.

## Casos de uso

- Entrenamiento de politicas de imitacion con LeRobot sobre el G1 simulado: el entorno expone observaciones de estado corporal y camaras compatibles con los pipelines de LeRobot, lo que permite recoger demostraciones y entrenar politicas sin hardware fisico.
- Investigacion en manipulacion con pinzas paralelas: la escena Dex1 con actuadores de fuerza y limites de 20 N por dedo permite estudiar agarre simetrico y control de fuerza en tareas de pick-and-place.
- Experimentos con manos articuladas: la variante Dex3 con 7 articulaciones por mano sirve para evaluar destrezas de dedos y comparar estrategias de control frente a las pinzas simples.
- Validacion de pipelines de vision: las tres camaras publicadas por ZMQ permiten probar sistemas de percepcion, calibracion y sincronizacion de multiples flujos antes de desplegar en el robot real.
- Pruebas de integracion de software de control: al preservar los topicos DDS de Unitree SDK2 y el formato de mensajes ZMQ, se puede verificar la logica de un stack de control existente contra la simulacion antes de ejecutarlo en hardware.
- Docencia y prototipado rapido: el repositorio de 0,1 GB se instala con `requirements.txt` y permite levantar un humanoide completo en MuJoCo con `make_env()`, util para cursos de robotica y pruebas de concepto.
- Desarrollo de controladores PD y bucles de bajo nivel: el control de pinzas por fuerza y el stepping de simulacion permiten iterar sobre controladores antes de transferirlos al G1 fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio documenta verificaciones funcionales (suite de regresion con MuJoCo real para ambas variantes, mapeo motor/observacion, cierre por fuerza, movimiento de camaras de muneca, renderizado y buffers compartidos del publicador de camaras; `smoke_live.py` para transporte en vivo), pero no incluye metricas de rendimiento de politicas ni comparativas numericas.

## Requisitos de hardware

- VRAM: no aplica para el entorno en si; el consumo depende de la politica neuronal que se ejecute sobre el. MuJoCo renderiza con `MUJOCO_GL=egl` para uso headless.
- GPU: no se especifican modelos recomendados en la informacion disponible; el renderizado EGL puede ejecutarse en GPU de consumo o en CPU segun configuracion.
- Cabe en GPU de consumo: no disponible como dato concreto; el repositorio ocupa 0,1 GB en disco y la carga depende de MuJoCo y de los activos del G1.
- Despliegue: entorno Python con MuJoCo, Gymnasium, Unitree SDK2 / CycloneDDS, ZMQ y OpenCV; integracion con LeRobot mediante `env.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI porque no aplican.
- Latencia y throughput: publicacion de camaras a aproximadamente 30 Hz y 640x480; no se documentan otras metricas de latencia o throughput.

## Comparativa con modelos similares

| Repositorio | Tipo | Efectores | Camaras | Interfaz | Licencia |
|---|---|---|---|---|---|
| `m-serra/unitree-g1-mujoco` | Entorno MuJoCo para LeRobot | Dex1, Dex3, sin manos | Cabeza y ambas munecas | DDS Unitree SDK2 + ZMQ | no disponible (URDF Dex1 Apache 2.0; mallas Unitree con terminos upstream) |
| `lerobot/unitree-g1-mujoco` | Entorno base MuJoCo para LeRobot | Configuracion original | Configuracion original | DDS + ZMQ | no disponible |
| `Hxxxz0/HIW-500-controoler` | Fuente de URDF, mallas y geometria de camaras de muneca | Dex1-1 | Geometria de muneca | no disponible | Apache 2.0 (segun el repositorio de origen) |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza razonamiento; cualquier expectativa de capacidades linguisticas es erronea.
- La licencia no figura en los metadatos del repositorio; antes de uso comercial hay que verificar los terminos del URDF Dex1 (Apache 2.0 en `reference/hiw500/`) y de las mallas de Unitree, que conservan sus condiciones upstream.
- El limite inferior de las pinzas en simulacion (-0,023 m) difiere del URDF oficial (-0,020 m); usar `--official-limits` deja aproximadamente 5,88 mm entre las almohadillas, lo que afecta al comportamiento de cierre.
- Las acciones de dedos no forman parte del esquema `UnitreeG1` de 29 motores de LeRobot; el control de pinzas se realiza por los primeros dos comandos de `rt/dex3/left/cmd` y `rt/dex3/right/cmd`.
- Requiere dependencias externas especificas (Unitree SDK2, CycloneDDS, Gymnasium, ZMQ, OpenCV) y configuracion explicita de las camaras ZMQ en el cliente; sin ella no se reciben imagenes.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de validacion externa mas alla de las pruebas del autor.
- La simulacion no reproduce necesariamente la dinamica real del G1 fisico; la transferencia de politicas requiere validacion en hardware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/m-serra/unitree-g1-mujoco
- Entorno base: https://huggingface.co/lerobot/unitree-g1-mujoco/tree/a38dc8617f0fca51b38e9354dc58ee35ad850fb5
- Fuente del URDF Dex1-1, mallas y geometria de camaras de muneca: https://github.com/Hxxxz0/HIW-500-controoler/tree/c69d89d88bb51774fe9a3684b90d9ff1abf801da
- LeRobot (referencia de carga y configuracion de camaras): https://github.com/huggingface/lerobot/tree/b6ec0060779550c0a157ae34feb89e0cf86012a8
