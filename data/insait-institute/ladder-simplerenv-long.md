# INSAIT-Institute/LADDER-SimplerEnv-Long

## Resumen

LADDER SimplerEnv-Long no es un modelo de lenguaje, sino un entorno de simulacion empaquetado como repositorio de LeRobot EnvHub. Lo publica el INSAIT-Institute como parte de LADDER, un benchmark de manipulacion robotica de horizonte largo. Este repositorio concreto contiene 54 tareas de tipo pick-and-place con el robot WidowX, descompuestas en entre 1 y 10 subobjetivos, ejecutadas sobre el gemelo digital Bridge de SimplerEnv usando SAPIEN 3 y ManiSkill 3.

La relevancia del artefacto esta en que estandariza la evaluacion de politicas de manipulacion de horizonte largo: expone una interfaz de observacion y accion fija (imagenes RGB de 480x640, pose del efector final en convencion BridgeData, pinza) y una metrica de exito (`pc_success`) junto con una de progreso por subobjetivo (`avg_sum_reward`). Al estar empaquetado como entorno de LeRobot, cualquier checkpoint compatible con WidowX puede evaluarse con `lerobot-eval` sin escribir codigo de integracion especifico del simulador.

El repositorio forma parte de una familia de tres suites (RoboLab-Long con Isaac Sim 6 y Franka, SimplerEnv-Long con SAPIEN 3/ManiSkill 3 y WidowX, y RobotArena-∞-Long con Genesis y WidowX), cada una en su propio repositorio porque cada simulador requiere su propio entorno de Python. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno de simulacion robotica (no es una red neuronal): SAPIEN 3 / ManiSkill 3 sobre el gemelo digital Bridge de SimplerEnv |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT (los assets descargados conservan sus propias licencias, ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | no disponible (no aplica); assets de simulacion de 160 MB descargados desde el release v1.0.0 |
| Robot | WidowX |
| Numero de tareas | 54 (de 1 a 10 subobjetivos pick-and-place) |
| Observacion | `pixels.main` 480x640 RGB; `agent_pos`: pose del efector final `[x, y, z, rx, ry, rz]` (frame base, eje-angulo, convencion BridgeData) mas pinza (1 abierta) |
| Accion | `[dx, dy, dz, drx, dry, drz, gripper]`; traslacion en frame base, rotacion en frame del efector final; pinza 1 abierta, 0 cerrada |
| Frecuencia de control | 5 Hz |
| Metricas | `pc_success` (exito de tarea), `avg_sum_reward` (progreso de subobjetivos, tambien en `info["metrics"]["subgoal_progress"]`) |
| Libreria | lerobot (EnvHub) |
| Version | v1.0.0 |

## Arquitectura y entrenamiento

Este repositorio no contiene pesos ni un modelo entrenado: es un entorno de evaluacion. La "arquitectura" es la pila de simulacion SAPIEN 3 sobre ManiSkill 3, ejecutando el gemelo digital Bridge de SimplerEnv con el robot WidowX. El directorio `ladder/` incluye el codigo de LADDER en el release v1.0.0 sin modificaciones, ejecutado con los ajustes del servidor propio de LADDER.

Los assets de simulacion (160 MB) se descargan desde ese release en el primer uso. Los frames de reset coinciden con los episodios grabados por LADDER, y la politica Bridge de LADDER ejecutada a traves de este entorno tiene una tasa de exito comparable a la de los episodios publicados: 60 y 64 de 96 frente a 59 en cuatro tareas. El harness propio de LADDER sigue siendo la referencia para la leaderboard oficial.

No hay datos de entrenamiento, RLHF ni DPO porque no se entrena ningun modelo aqui; el artefacto es infraestructura de evaluacion reproducible.

## Capacidades

- Evaluacion estandarizada de politicas de manipulacion robotica sobre WidowX en el gemelo digital Bridge.
- Soporte de tareas de horizonte largo: 54 tareas con entre 1 y 10 subobjetivos pick-and-place encadenados.
- Interfaz fija de observacion y accion compatible con la convencion BridgeData (pose del efector final en eje-angulo, frame base).
- Metricas de exito binario (`pc_success`) y de progreso parcial (`avg_sum_reward` / `subgoal_progress`), utiles para politicas que fallan a mitad de una secuencia larga.
- Ejecucion en Docker con el NVIDIA Container Toolkit, o en proceso con `trust_remote_code`.
- Seleccion de tareas por nombre individual, lista separada por comas o suite completa.
- Evaluacion por lotes: los 24 episodios de una tarea se ejecutan como un unico batch (`--eval.batch_size=24`).
- Integracion con el ecosistema LeRobot mediante `lerobot-env-server` y `lerobot-eval`.

## Casos de uso

- Evaluacion de checkpoints WidowX en CI: ejecutar `lerobot-eval` contra este entorno en un pipeline para detectar regresiones de una politica tras cada reentrenamiento, usando `pc_success` como metrica de puerta.
- Comparacion de politicas de horizonte largo: medir no solo el exito final sino el progreso de subobjetivos (`avg_sum_reward`), lo que permite distinguir politicas que fallan en el primer paso de las que fallan en el septimo u octavo.
- Investigacion en descomposicion de tareas: las 54 tareas con 1 a 10 subobjetivos permiten estudiar como degrada el rendimiento al alargar la secuencia de pick-and-place.
- Reproduccion de resultados publicados: el entorno reproduce los frames de reset de los episodios de LADDER y su politica Bridge obtiene una tasa de exito equivalente (60 y 64 de 96 frente a 59 en cuatro tareas), lo que sirve para validar implementaciones propias.
- Benchmarking multi-simulador: combinado con RoboLab-Long (Isaac Sim 6, Franka) y RobotArena-∞-Long (Genesis, WidowX), permite medir la sensibilidad de una politica al simulador manteniendo el robot o la tarea.
- Formacion y docencia en robotica: el contenedor Docker de unos 11 GB y la interfaz documentada facilitan montar practicas reproducibles de evaluacion de politicas sin acceso a hardware fisico.
- Desarrollo de wrappers y adaptadores: la especificacion explicita de frames (traslacion en base, rotacion en efector final) sirve como referencia para implementar conversiones de acciones en politicas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. El unico dato de rendimiento reportado es la validacion del propio entorno: la politica Bridge de LADDER ejecutada a traves de este repositorio obtiene 60 y 64 exitos de 96 frente a 59 en los episodios publicados, en cuatro tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente de la politica WidowX que se evalue, no del entorno.
- GPU: se requiere GPU NVIDIA con el NVIDIA Container Toolkit para el modo Docker. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: no disponible; la informacion no confirma que el simulador SAPIEN 3 / ManiSkill 3 funcione en GPUs de gama consumer.
- Almacenamiento: la imagen Docker del simulador ocupa aproximadamente 11 GB; los assets de simulacion suman 160 MB adicionales.
- Tiempo de arranque: la primera ejecucion con `--docker=true` construye la imagen en 10 a 20 minutos; los arranques posteriores la reutilizan.
- Despliegue: `lerobot-env-server` con `--envhub=INSAIT-Institute/LADDER-SimplerEnv-Long@v1.0.0 --docker=true`, o en proceso instalando `lerobot[dataset,evaluation]>=0.7.0` y `requirements.txt` con `--env.trust_remote_code=true`.
- Latencia y throughput: no disponibles; la frecuencia de control del entorno es de 5 Hz.

## Comparativa con modelos similares

| Entorno | Simulador | Robot | Tareas | Licencia | Repositorio |
|---|---|---|---|---|---|
| LADDER SimplerEnv-Long | SAPIEN 3 / ManiSkill 3 | WidowX | 54 | MIT | INSAIT-Institute/LADDER-SimplerEnv-Long |
| LADDER RoboLab-Long | Isaac Sim 6 | Franka (DROID) | 44 | MIT | INSAIT-Institute/LADDER-RoboLab-Long |
| LADDER RobotArena-∞-Long | Genesis | WidowX | 47 | MIT | INSAIT-Institute/LADDER-RobotArena-Long |

No se dispone de informacion sobre otros benchmarks de manipulacion de horizonte largo comparables en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo: no genera texto, codigo ni imagenes; cualquier expectativa de inferencia linguistica es erronea.
- Solo evalua politicas compatibles con WidowX y la convencion de acciones BridgeData; una politica con otro robot o convencion requiere adaptacion.
- El lote debe fijarse en 24 porque cada tarea tiene exactamente 24 episodios y se ejecutan como un unico batch; otros valores rompen el esquema de evaluacion.
- La simulacion no sustituye la validacion en hardware real; el propio autor mantiene su harness como referencia para la leaderboard, lo que implica que este paquete es una via de evaluacion alternativa, no la canonica.
- Los assets descargados conservan sus propias licencias, distintas de la MIT del repositorio; hay que revisar THIRD_PARTY_NOTICES.md antes de uso comercial o redistribucion.
- Requiere Docker y NVIDIA Container Toolkit para el modo recomendado, lo que anade complejidad de despliegue frente a un simple `pip install`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni de validacion por terceros.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque no aplican a un entorno de simulacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/INSAIT-Institute/LADDER-SimplerEnv-Long
- Suite RoboLab-Long: https://huggingface.co/INSAIT-Institute/LADDER-RoboLab-Long
- Suite RobotArena-∞-Long: https://huggingface.co/INSAIT-Institute/LADDER-RobotArena-Long
- Proyecto LADDER y leaderboard: https://ladderrobotics.ai
- Paper (arXiv:2610.18053): https://arxiv.org/abs/2610.18053
- Codigo de LADDER: https://github.com/insait-institute/ladder
- Release v1.0.0: https://github.com/insait-institute/ladder/releases/tag/v1.0.0
- Lista de tareas: https://github.com/insait-institute/ladder/blob/main/TASKS.md
- Avisos de terceros: https://github.com/insait-institute/ladder/blob/main/THIRD_PARTY_NOTICES.md
- Documentacion de LeRobot EnvHub: https://huggingface.co/docs/lerobot/envhub
