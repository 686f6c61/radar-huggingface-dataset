# SoSolaris/xvla-b0921-1602-p06_freeze_vis_TESTED

## Resumen

X-VLA es un marco de Vision-Language-Action (VLA) basado en *soft prompts* y *flow matching* que trata cada conjunto de robot y hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de Soft Prompt aprendibles. De este modo, un unico modelo puede reconciliar morfologias, sensores y espacios de accion distintos. El repositorio analizado, `SoSolaris/xvla-b0921-1602-p06_freeze_vis_TESTED`, es un ajuste fino de `lerobot/xvla-base` sobre un unico robot SO-101 (`so101_follower`) para la tarea "Grab the tape".

El modelo tiene 879.687.256 parametros (aproximadamente 880 millones) en formato safetensors, ocupa 1,8 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Consume tres flujos visuales (dos a 256x256 y uno a 224x224) mas un vector de estado proprioceptivo de 8 dimensiones, y produce un vector de accion continuo de 6 dimensiones. Es, por tanto, una politica de manipulacion robotica, no un modelo de lenguaje: no genera texto ni mantiene conversaciones.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de X-VLA con LeRobot 0.6.2 sobre un dataset pequeno (20 episodios, 7071 fotogramas a 15 FPS) y como plantilla para adaptar el mismo pipeline a otras tareas y robots. El autor no ha publicado resultados de evaluacion en robots reales, por lo que debe considerarse una politica experimental y no un componente validado para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompts (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea esta definida por una instruccion de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/xvla-base (ajuste fino) |
| Libreria | lerobot (version de entrenamiento: 0.6.2) |
| Tipo de robot | so101_follower |
| Camaras | right, up (mas un tercer flujo visual a 224x224) |
| Entradas | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224); observation.state (8,) |
| Salidas | action (6,) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

X-VLA combina un backbone de vision-lenguaje con un cabezal generativo de *flow matching* para producir acciones continuas. La innovacion central del marco es el uso de un pequeno conjunto de embeddings de Soft Prompt aprendibles que actuan como identificador de "tarea": cada robot o configuracion de hardware recibe su propio prompt, de forma que un unico conjunto de pesos puede cubrir morfologias, sensores y espacios de accion heterogeneos sin duplicar el modelo completo. En este repositorio concreto, el ajuste fino se aplica sobre `lerobot/xvla-base` para un espacio de observacion de tres imagenes (256x256, 256x256 y 224x224) y un estado de 8 dimensiones, con un espacio de accion de 6 dimensiones. El sufijo `freeze_vis` del identificador sugiere que el codificador visual permanecio congelado durante el ajuste, aunque la model card no documenta este extremo de forma explicita.

El entrenamiento se realizo con la libreria LeRobot 0.6.2 sobre el dataset `SoSolaris/FlourishGrabTape`: 20 episodios, 7071 fotogramas a 15 FPS, una unica tarea ("Grab the tape"). La configuracion reportada es de 5000 pasos, tamano de lote 32, optimizador `xvla-adamw` y tasa de aprendizaje 0.0001 con semilla 1000. No se menciona ningun uso de RLHF, DPO u optimizacion por preferencias, algo esperable en un ajuste por imitacion. Tampoco se detalla el numero de tokens de entrenamiento ni la composicion completa del dataset, mas alla de las metricas del repositorio citado.

## Capacidades

- Generacion de acciones de manipulacion continua: produce un vector `action` de 6 dimensiones a partir de observaciones visuales y proprioceptivas.
- Percepcion multimodal de entrada: procesa simultaneamente tres flujos de imagen y un vector de estado de 8 dimensiones.
- Ejecucion de una tarea de imitacion concreta: "Grab the tape", aprendida a partir de 20 episodios de demostracion.
- Adaptacion a la morfologia SO-101 (`so101_follower`) mediante el mecanismo de soft prompts heredado de X-VLA.
- Integracion nativa con el ecosistema LeRobot: ejecucion mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision general, audio): no disponibles; la vision esta limitada a la percepcion de las camaras del robot.

## Casos de uso

- Recogida automatizada de cinta adhesiva en una celda de montaje: el modelo ejecuta la tarea "Grab the tape" con el robot SO-101 usando dos o tres camaras y el estado del brazo, adecuado para una operacion repetitiva y siempre que el entorno se mantenga similar al de las demostraciones.
- Plantilla de ajuste fino para nuevas tareas: partiendo de `lerobot/xvla-base` y de este repositorio como referencia, un equipo puede reentrenar con un dataset propio modificando solo el repositorio de datos y el prompt de tarea.
- Banco de pruebas de X-VLA sobre hardware de bajo coste: permite reproducir el pipeline completo (grabacion, entrenamiento, rollout) en un SO-101 antes de invertir en robots mas caros.
- Referencia de comparacion en experimentos de imitacion: sirve como linea base de 5000 pasos y 20 episodios frente a configuraciones con mas datos o con el codificador visual descongelado.
- Generacion de datos y evaluacion de robustez: ejecutar la politica en bucle permite recoger trayectorias exitosas y fallidas para ampliar el dataset `FlourishGrabTape` con nuevas posiciones de objeto e iluminacion.
- Validacion de integracion con LeRobot: util para verificar la instalacion, la calibracion de camaras y el cableado del robot mediante `lerobot-rollout` antes de desplegar politicas mas grandes.
- Demostraciones tecnicas y docencia: el tamano contenido (1,8 GB) y la licencia Apache 2.0 facilitan su uso en talleres y cursos de robotica con aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica (`No evaluation results have been provided for this policy yet`), por lo que no existen tasas de exito en robot real ni metricas comparativas verificables.

## Requisitos de hardware

- Peso de los pesos: 879.687.256 parametros, aproximadamente 1,8 GB en bfloat16/float16 y unos 3,5 GB en float32; el repositorio completo ocupa 1,8 GB.
- VRAM estimada para inferencia: en torno a 4-8 GB en bfloat16 si se anaden activaciones de tres flujos de imagen (256x256, 256x256 y 224x224) y el grafo del cabezal de flow matching; no hay datos oficiales de consumo, por lo que la cifra es una estimacion a partir del numero de parametros y de la resolucion de entrada.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son suficientes. Las A100 o H100 son innecesarias para este tamano y solo tendrian sentido en lotes grandes o entrenamiento.
- Cabe en GPU de consumo: si, con holgura en tarjetas de 8-12 GB de VRAM en bfloat16.
- Opciones de despliegue: la via documentada es `lerobot-rollout` con `--policy.path=<repositorio>` y `--robot.type=so101_follower`. No se contemplan vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje y esos servidores no soportan politicas VLA de este tipo.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 15 FPS, lo que da una referencia de la frecuencia de control utilizada durante la recogida de datos, pero no se publica ninguna medicion de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| SoSolaris/xvla-b0921-1602-p06_freeze_vis_TESTED | 879.687.256 | no disponible | apache-2.0 | HuggingFace, 0 descargas y 0 likes | no disponibles |
| lerobot/xvla-base | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (modelo base de este ajuste) | no disponibles |
| Otros VLA de la misma categoria (por ejemplo, alternativas de imitacion sobre brazos de bajo coste) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de parametros, contexto o rendimiento de alternativas comparables dentro de la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea ("Grab the tape") con un unico robot (SO-101) y un unico montaje de camaras. No generaliza a otras tareas ni a otras morfologias sin reentrenamiento.
- Volumen de datos muy reducido: 20 episodios y 7071 fotogramas son una base exigua; el riesgo de sobreajuste a las posiciones, iluminacion y objetos concretos de las demostraciones es alto.
- Sin evaluacion publicada: no existen tasas de exito en robot real, por lo que se desconoce la fiabilidad efectiva de la politica.
- Sensibilidad al montaje: los nombres de camara del comando de rollout deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.image`, `image2`, `image3`); cambiar el nombre, la resolucion o la posicion de una camara invalida la politica.
- Discrepancia de identificadores: la model card usa `--policy.path=SoSolaris/xvla-b0921-1602-p06_freeze_vis`, mientras que el repositorio publicado se llama `SoSolaris/xvla-b0921-1602-p06_freeze_vis_TESTED`. Conviene verificar la ruta real antes de ejecutar.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existen modos de fallo tipicos de las politicas de imitacion, como acciones fuera de distribucion, bloqueos o movimientos que no completan la tarea cuando el objeto cambia de posicion.
- Idiomas: la informacion disponible no documenta ningun soporte multilingue; la instruccion de tarea se usa como cadena de texto fija en ingles.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni validacion.
- Procedencia: el sufijo `TESTED` y las cero descargas y cero likes sugieren un artefacto de prueba subido por un usuario particular, no un modelo mantenido oficialmente. Conviene tratarlo como material experimental.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo; los resultados obtenidos no guardan relacion con el contenido del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoSolaris/xvla-b0921-1602-p06_freeze_vis_TESTED
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/FlourishGrabTape
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/FlourishGrabTape
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Paper en arXiv: https://arxiv.org/abs/2510.10274
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
