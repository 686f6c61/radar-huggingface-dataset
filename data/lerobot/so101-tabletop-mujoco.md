# lerobot/so101-tabletop-mujoco

## Resumen

`lerobot/so101-tabletop-mujoco` no es un modelo de lenguaje, sino un entorno de simulacion de robotica publicado en el Hub de Hugging Face como parte del ecosistema LeRobot EnvHub. Describe una mesa de trabajo con un brazo robotico SO-101 (el brazo de bajo coste de TheRobotStudio que emplean los kits LeRobot) junto con cuatro cubos de madera de 3 cm pintados en rojo, verde, azul y amarillo, y una caja verde abierta, todo ello simulado con MuJoCo. La tarea consiste en introducir los cuatro cubos en la caja.

El repositorio proporciona la escena MuJoCo (`so101_tabletop.xml`), el punto de entrada Gymnasium (`env.py`), el modelo del brazo procedente de MuJoCo Menagerie y las texturas. Se integra con LeRobot mediante `make_env` o mediante el servidor de simulacion (`lerobot-env-server`), lo que permite entrenar y evaluar politicas de manipulacion (incluidos modelos VLA) contra un entorno reproducible con observaciones visuales y de estado articular.

Su relevancia actual radica en que estandariza un banco de pruebas abierto para politicas de robotica de bajo coste: misma tarea, mismas camaras y mismas acciones que la variante Isaac Sim (`lerobot/so101-tabletop-isaac`), de modo que una misma politica y los mismos comandos funcionan en ambos simuladores. La licencia Apache-2.0 facilita su uso comercial e industrial sin fricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulacion robotica (Gymnasium) sobre MuJoCo; no es una red neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica); episodio truncado a 3600 pasos |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no aplica); artefactos: `env.py`, `so101_tabletop.xml`, modelo MuJoCo del SO-101, `textures/wood.png` |

Especificaciones del entorno:

| Parametro | Valor |
|---|---|
| Observacion `pixels.front` | camara de escena, 480x640 RGB |
| Observacion `pixels.wrist` | camara del gripper, 480x640 RGB |
| Observacion `agent_pos` | 6 posiciones articulares |
| Accion | 6 objetivos absolutos de posicion articular: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` en grados y `gripper` 0-100 |
| Frecuencia de control | 30 fps |
| Tarea | "Put all the cubes in the green box." |
| Recompensa | fraccion de cubos en la caja en cada paso (0, 0.25, 0.5, 0.75, 1); `info["cubes_in_box"]` devuelve el recuento |
| Fin de episodio | terminado con exito al meter los cuatro cubos; truncado a los 3600 pasos (2 minutos), configurable con `episode_length` |
| Reset | poses de cubos y caja con semilla, jitter de la camara frontal y ruido articular |

## Arquitectura y entrenamiento

El artefacto es un entorno de simulacion fisica construido sobre MuJoCo. La escena (`so101_tabletop.xml`) define una habitacion simple, una mesa, los cuatro cubos con textura de madera tintada, la caja verde, la iluminacion, la camara frontal y el punto de montaje del brazo. El modelo del robot proviene de MuJoCo Menagerie (commit `0059d4335f8156206f63a35662313385f7ad6d74`), derivado del SO-ARM100 de TheRobotStudio, y `env.py` recolorea sus piezas impresas para reproducir el turquesa de los kits LeRobot. La textura `textures/wood.png` se genero de forma procedimental para este entorno.

No existe entrenamiento de pesos: el repositorio no contiene un modelo neuronal, sino la infraestructura para entrenar y evaluar politicas externas. `env.py` expone `make_env`, la clase de entorno Gymnasium y la declaracion `LEROBOT_SIM` con la frecuencia de control y los nombres de las articulaciones. La aleatorizacion del reset (poses de cubos y caja con semilla, jitter de camara y ruido articular) esta pensada para mejorar la robustez de las politicas entrenadas. La paridad de observaciones, acciones y disposicion con la variante Isaac Sim permite transferir la misma politica entre ambos simuladores sin cambios en el codigo.

## Capacidades

- Simulacion fisica de un brazo SO-101 de 5 grados de libertad mas gripper, con control a 30 fps.
- Renderizado de dos camaras RGB de 480x640: vista frontal de escena y vista del gripper.
- Observacion del estado articular completo (6 posiciones) ademas de las imagenes.
- Recompensa densa por pasos basada en la fraccion de cubos dentro de la caja, con contador expuesto en `info["cubes_in_box"]`.
- Aleatorizacion reproducible mediante semilla en el reset: poses de objetos, jitter de camara y ruido articular.
- Integracion con el ecosistema LeRobot: `make_env` en proceso, servidor de simulacion via Docker (`lerobot-env-server`) y ejecucion de politicas con `lerobot-rollout` y `lerobot-eval`.
- Compatibilidad de interfaz con `lerobot/so101-tabletop-isaac`: mismas observaciones, acciones y disposicion de escena.
- Mapeo de nombres de observacion (`observation.images.front`, `observation.images.wrist`, `observation.state`) con soporte de `--rename_map` para checkpoints con nombres distintos.
- Soporte de ejecucion headless con `MUJOCO_GL=egl`.

## Casos de uso

- Entrenamiento de politicas de imitacion (behavior cloning): el entorno genera episodios reproducibles con pares observacion-accion a 30 fps, adecuados para entrenar politicas de manipulacion sobre el SO-101 con datos sinteticos antes de pasar al robot real.
- Evaluacion estandarizada de modelos VLA: `lerobot-eval` permite medir la tasa de exito de un checkpoint en la tarea de meter los cuatro cubos, con recompensa densa que distingue politicas parcialmente correctas de las que fallan por completo.
- Pruebas de robustez ante variaciones: la aleatorizacion con semilla de poses, camara y ruido articular permite evaluar la generalizacion de una politica a condiciones ligeramente distintas sin tocar hardware.
- Desarrollo de pipelines de reinforcement learning: la recompensa por fraccion de cubos y el truncado configurable a 3600 pasos ofrecen una senal clara para algoritmos de RL que operen sobre acciones continuas de posicion articular.
- Validacion cruzada entre simuladores: al compartir interfaz con la variante Isaac Sim, se puede entrenar en MuJoCo (mas ligero) y verificar el mismo checkpoint en Isaac Sim para detectar sobreajuste al simulador.
- Integracion en CI/CD de robotica: el modo servidor via Docker (`lerobot-env-server --docker`) permite lanzar evaluaciones automatizadas de cada nuevo checkpoint en un pipeline, con resultados deterministas por semilla.
- Docencia y prototipado rapido: un entorno de manipulacion completo con robot de bajo coste y ejecucion headless sirve para practicas de robotica sin necesidad de hardware fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio define la tarea y la metrica (fraccion de cubos en la caja, exito al alcanzar 4/4), pero no incluye puntuaciones de politicas de referencia.

## Requisitos de hardware

- No requiere GPU para la fisica; el renderizado de dos camaras a 480x640 puede ejecutarse en CPU, aunque una GPU acelera el renderizado y el entrenamiento de politicas.
- Para ejecucion headless en servidores sin display se necesita `MUJOCO_GL=egl`.
- El modo servidor usa Docker (`lerobot-env-server --docker --envhub=lerobot/so101-tabletop-mujoco`), por lo que se requiere Docker con soporte de aceleracion grafica si se desea renderizado por GPU.
- El coste de VRAM depende de la politica entrenada, no del entorno; no hay datos de VRAM especificos del entorno en la informacion disponible.
- Despliegue: LeRobot (`make_env` en proceso), servidor de simulacion LeRobot via Docker, `lerobot-rollout` y `lerobot-eval`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI porque no aplican a un entorno de simulacion.
- Latencia y throughput: la frecuencia de control es de 30 fps; no se publican cifras de rendimiento del simulador (pasos por segundo) en la informacion disponible.

## Comparativa con modelos similares

| Entorno | Simulador | Robot | Tarea | Observaciones | Acciones | Licencia |
|---|---|---|---|---|---|---|
| `lerobot/so101-tabletop-mujoco` | MuJoCo | SO-101 | Meter 4 cubos en caja | 2 camaras 480x640 + 6 articulaciones | 6 posiciones articulares absolutas, 30 fps | Apache-2.0 |
| `lerobot/so101-tabletop-isaac` | Isaac Sim | SO-101 | Identica | Identicas | Identicas | no disponible |

La variante Isaac Sim comparte disposicion, camaras, observaciones y acciones, de modo que las mismas politicas y comandos funcionan en ambos. No se dispone de informacion sobre otros entornos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni predicciones; es un entorno de simulacion y no debe evaluarse con metricas de LLM.
- La similitud con el robot fisico no esta cuantificada en la informacion disponible; una politica que funcione en simulacion puede requerir ajuste fino o calibracion para el SO-101 real (gap sim-to-real no documentado).
- La tarea esta acotada a un unico escenario (cuatro cubos y una caja) y a un solo brazo; no cubre manipulacion bimanual ni objetos deformables.
- El espacio de acciones esta limitado a posiciones articulares absolutas en grados y gripper 0-100; politicas que emitan velocidades o pares no son compatibles directamente.
- El truncado a 3600 pasos (2 minutos) limita tareas que requieran horizontes mas largos, aunque es configurable mediante `episode_length`.
- La aleatorizacion del reset esta controlada por semilla; la diversidad efectiva depende de los parametros configurados y no se documenta su rango.
- El modelo del brazo se importa de MuJoCo Menagerie en un commit concreto; cambios en esa fuente pueden alterar la dinamica si se actualiza la dependencia.
- Licencia Apache-2.0 en el entorno y en la textura; el modelo `robotstudio_so101/` conserva la licencia Apache-2.0 de su carpeta de origen, por lo que se deben mantener los avisos correspondientes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lerobot/so101-tabletop-mujoco
- Variante Isaac Sim: https://huggingface.co/lerobot/so101-tabletop-isaac
- Documentacion de LeRobot EnvHub: https://huggingface.co/docs/lerobot/envhub
- Ficha de referencia en OpenBot.ai: https://openbot.ai/models/so101-tabletop-mujoco
- Modelo SO-101 de MuJoCo Menagerie (commit `0059d4335f8156206f63a35662313385f7ad6d74`): no disponible como URL directa en la informacion proporcionada
- SO-ARM100 de TheRobotStudio: no disponible como URL directa en la informacion proporcionada
