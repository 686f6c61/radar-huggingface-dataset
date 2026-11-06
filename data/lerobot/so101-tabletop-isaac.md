# lerobot/so101-tabletop-isaac

## Resumen

SO-101 tabletop (Isaac Sim) es un entorno de simulación para robótica publicado por el equipo LeRobot en Hugging Face, no un modelo de lenguaje. Se distribuye a través de LeRobot EnvHub y reproduce, sobre NVIDIA Isaac Sim 6.2, una escena de manipulación tabletop con un brazo SO-101, cuatro cubos de madera de 3 cm y una caja verde abierta. La física la resuelve PhysX y el renderizado corre sobre RTX.

Su relevancia radica en que replica exactamente la disposición, cámaras, observaciones, acciones y variable de entorno `LEROBOT_SIM` de la versión MuJoCo (`lerobot/so101-tabletop-mujoco`), de modo que una misma política entrenada con LeRobot puede evaluarse contra ambos simuladores sin cambios en el código. Esto permite validar la transferibilidad de políticas de imitación y de modelos visión-lenguaje-acción (VLA) entre motores físicos distintos.

El entorno expone observaciones multimodales (dos cámaras RGB de 480×640 y seis posiciones articulares) y una acción de seis dimensiones a 30 fps, con una tarea de recompensa densa ("meter todos los cubos en la caja verde"). Es una pieza de infraestructura para evaluación reproducible de políticas robóticas, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulacion robotica sobre NVIDIA Isaac Sim 6.2 (fisica PhysX, renderizado RTX); no es una red neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el entorno no procesa lenguaje natural; la tarea es una cadena fija) |
| Licencia | Apache-2.0 (el propio entorno, incluida `textures/wood.png`); el asset `so101_new_calib/` es de NVIDIA bajo Apache-2.0; Isaac Sim se rige por la licencia de NVIDIA Isaac Sim |
| Formato de pesos | no disponible; el repositorio contiene codigo Python (`env.py`), assets USD y texturas (tamano del repo: 0.0 GB) |

Especificaciones adicionales del entorno:

| Parametro | Valor |
|---|---|
| Observacion `pixels` | `front` (camara de escena) y `wrist` (camara del gripper), RGB 480×640 |
| Observacion `agent_pos` | 6 posiciones articulares |
| Accion | 6 objetivos absolutos de posicion articular: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` en grados y `gripper` 0-100 (unidades de `so101_follower` con `use_degrees=True`) |
| Frecuencia de control | 30 fps (8 pasos de PhysX por paso de control) |
| Tarea | "Put all the cubes in the green box." |
| Recompensa | fraccion de cubos en la caja en cada paso (0, 0.25, ... 1); `info["cubes_in_box"]` da el conteo |
| Fin de episodio | exito cuando los cuatro cubos estan en la caja; truncado a los 3600 pasos (2 minutos), configurable con `episode_length` |
| Reset | posiciones y yaws de cubos con semilla, ruido articular |
| Numero de entornos | `make_env` acepta `n_envs=1` (un unico mundo) |

## Arquitectura y entrenamiento

No hay entrenamiento de red neuronal implicito en este repositorio. La "arquitectura" es la construccion de la escena en la API Python de Isaac Sim 6. El brazo utiliza el asset de NVIDIA `RobotStudio/so101_new_calib`, incluido en `so101_new_calib/` y referenciado con `stage_utils.add_reference_to_stage`, accionado mediante `Articulation`. La habitacion, la mesa, los cubos, la caja y las luces se crean con `GroundPlane`, prims `Cube` escalados, `DomeLight` y `DistantLight`, con colisionadores `GeomPrim`, cuerpos `RigidPrim` y `RigidBodyMaterial`.

El apartado visual emplea `OmniPbrMaterial` para los cubos de madera (textura `textures/wood.png` tintada por cubo, con UV proyectadas porque los cubos USD no las traen) y para el color del brazo (sobrescritura del material del asset), y `PreviewSurfaceMaterial` para la mesa y la caja brillante. Los colores son los valores sRGB de la escena MuJoCo convertidos al espacio lineal de Isaac. Las camaras usan `RtxCamera` junto con `CameraSensor` (anotador RGB), y la camara de muneca cuelga del enlace `gripper` del brazo. El avance se hace con la linea temporal pausada, `SimulationManager.step` para la fisica y un paso de captura de Replicator para las camaras.

El arranque de Isaac Sim se realiza una vez por proceso en `make_env`: unos 20 s, mas varios minutos de compilacion de shaders la primera vez en una maquina o contenedor. Un paso tarda unos 80 ms en una RTX 3080 Laptop GPU, por lo que la evaluacion en lockstep es exacta pero la ejecucion en tiempo real va por debajo de 30 fps. El asset del brazo va incluido, de modo que el entorno no necesita red en tiempo de ejecucion.

## Capacidades

- Simulacion fisica de una tarea de manipulacion pick-and-place con cuatro objetos y contenedor, con recompensa densa y condicion de exito verificable.
- Observaciones multimodales: dos vistas RGB (escena y gripper) mas estado articular, aptas para politicas visomotoras.
- Interfaz de accion compatible con el robot real SO-101 mediante las unidades de `so101_follower` con `use_degrees=True`.
- Compatibilidad binaria de interfaz con la version MuJoCo (`lerobot/so101-tabletop-mujoco`): mismas observaciones, acciones y `LEROBOT_SIM`.
- Integracion con el servidor de simulacion LeRobot (`lerobot-env-server --docker --envhub=...`) y con `lerobot-rollout` y `lerobot-eval`.
- Ejecucion en proceso mediante `make_env(..., trust_remote_code=True)`.
- Mapeo de observaciones a nombres estandar de politica (`observation.images.front`, `observation.images.wrist`, `observation.state`) con soporte de `--rename_map`.
- Reproducibilidad mediante reset con semilla (posiciones y yaws de cubos, ruido articular).
- No incluye generacion de texto, razonamiento, codigo, matematicas, tool calling ni capacidades multilingues.

## Casos de uso

- Evaluacion de politicas de imitacion: ejecutar un checkpoint SO-101 entrenado en LeRobot contra la tarea de los cuatro cubos y medir la fraccion media de cubos en la caja por episodio, con recompensa densa que facilita curvas de aprendizaje.
- Validacion cruzada de simuladores: comparar el rendimiento de una misma politica en Isaac Sim y en MuJoCo gracias a la paridad de observaciones, acciones y `LEROBOT_SIM`, detectando sobreajuste al motor fisico de entrenamiento.
- Benchmark de modelos VLA: usar la escena como banco de pruebas estandarizado para politicas vision-lenguaje-accion que consumen dos camaras y estado articular y emiten acciones de 6 dimensiones a 30 fps.
- Pruebas de robustez a ruido: aprovechar el reset con posiciones y yaws sembrados y el ruido articular para medir la varianza de exito de una politica ante condiciones iniciales distintas.
- Desarrollo de pipelines de evaluacion en CI: lanzar `lerobot-eval` con `--env.type=envhub` en un contenedor con NVIDIA Container Toolkit para regresion automatizada de checkpoints antes de desplegarlos en el robot real.
- Generacion de datos sinteticos de demostracion: ejecutar politicas o controladores scriptados en el entorno para producir pares observacion-accion con renderizado RTX, utiles para preentrenamiento o aumento de datasets.
- Docencia y prototipado de robotica: ejemplo compacto de la API Python de Isaac Sim 6 (articulaciones, colisionadores, materiales PBR, camaras RTX) reutilizable como plantilla para nuevas escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento facilitados son operativos: arranque de Isaac Sim de unos 20 s por proceso (mas varios minutos de compilacion de shaders la primera vez), unos 80 ms por paso en una RTX 3080 Laptop GPU y ejecucion en tiempo real por debajo de 30 fps.

## Requisitos de hardware

- GPU NVIDIA RTX obligatoria; el servidor en Docker requiere ademas el NVIDIA Container Toolkit.
- VRAM estimada: no disponible en la informacion proporcionada.
- Referencia medida por el autor: RTX 3080 Laptop GPU, con unos 80 ms por paso de control.
- No cabe en hardware sin GPU NVIDIA: Isaac Sim 6.2 depende de RTX para el renderizado y de PhysX para la fisica.
- Despliegue mediante el servidor de simulacion LeRobot: `lerobot-env-server --docker --envhub=lerobot/so101-tabletop-isaac` (instala `packages.txt` y `requirements.txt`, con Isaac Sim 6.2 desde PyPI y el indice de NVIDIA, Python 3.12).
- Despliegue en proceso: instalar Isaac Sim 6.2 junto a LeRobot (`uv pip install -r requirements.txt` con `UV_INDEX_STRATEGY=unsafe-best-match`, o `pip install -r requirements.txt`).
- Evaluacion y rollout: `lerobot-eval` y `lerobot-rollout` con `--robot.endpoint=tcp/127.0.0.1:7448` o en proceso con `trust_remote_code=true`.
- Throughput: limitado a un unico mundo (`n_envs=1`), por lo que no hay paralelizacion de entornos dentro de un proceso.
- Latencia: unos 80 ms por paso en la GPU de referencia; la evaluacion en lockstep es exacta aunque no alcance los 30 fps en tiempo real.

## Comparativa con modelos similares

| Entorno | Motor fisico / render | Observaciones | Acciones | Tarea | Licencia |
|---|---|---|---|---|---|
| `lerobot/so101-tabletop-isaac` | Isaac Sim 6.2 (PhysX + RTX) | 2 camaras RGB 480×640 + 6 posiciones articulares | 6 objetivos articulares a 30 fps | 4 cubos a caja verde | Apache-2.0 (entorno); Isaac Sim bajo licencia NVIDIA |
| `lerobot/so101-tabletop-mujoco` | MuJoCo | Mismas observaciones y nombres | Mismas acciones y unidades | Misma tarea | no disponible en la informacion proporcionada |

No se dispone de datos de otros entornos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni respuestas; cualquier uso como modelo linguistico o VLA es un error de categoria.
- Un solo mundo por proceso (`n_envs=1`), lo que limita el paralelismo y el throughput de evaluacion.
- Arranque costoso: unos 20 s por proceso y varios minutos de compilacion de shaders la primera vez en una maquina o contenedor.
- Rendimiento por debajo de tiempo real en la GPU de referencia (80 ms por paso frente a los 33 ms de 30 fps), lo que afecta a evaluaciones en tiempo real pero no a las de lockstep.
- Dependencia estricta de GPU NVIDIA RTX y de la aceptacion de la EULA de Isaac Sim: `env.py` establece `OMNI_KIT_ACCEPT_EULA=YES` y ejecutar el entorno implica aceptar la licencia de NVIDIA Isaac Sim.
- La licencia Apache-2.0 cubre el entorno y la textura de madera, pero no el simulador Isaac Sim ni, mas alla de lo indicado en su carpeta, los terminos del asset de NVIDIA.
- Escena y tarea fijas: cuatro cubos de 3 cm y una caja verde; no hay variacion de objetos, iluminacion ni layout salvo la posicion y yaw sembrados de los cubos y el ruido articular.
- Dependencia de nombres de observacion concretos; si el checkpoint usa otros nombres de camara hay que recurrir a `--rename_map`.
- No hay datos publicados de sesgos, alucinacion ni evaluaciones de robustez sim-to-real en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/so101-tabletop-isaac
- Version MuJoCo de referencia: https://huggingface.co/lerobot/so101-tabletop-mujoco
- Documentacion de LeRobot EnvHub: https://huggingface.co/docs/lerobot/envhub
- Assets de robots manipuladores en Isaac Sim 6.2 (incluye `RobotStudio/so101_new_calib`): https://docs.isaacsim.omniverse.nvidia.com/6.2.0/assets/usd_assets_robots_manipulator.html#robots-manipulator-robotstudio
- Licencia de NVIDIA Isaac Sim: https://docs.isaacsim.omniverse.nvidia.com/latest/common/NVIDIA_Omniverse_License_Agreement.html
- Ficha de terceros: https://openbot.ai/models/so101-tabletop-isaac
