# Lemon115/smolvla_multitask_v5

## Resumen

SmolVLA Multitask v5 es un modelo vision-lenguaje-accion (VLA) de robotica desarrollado por el usuario Lemon115, publicado en Hugging Face bajo la libreria LeRobot. Se trata de un fine-tuning del modelo base lerobot/smolvla_base sobre un dataset propio de tareas de manipulacion, y su objetivo es controlar un brazo robotico de tipo `so_follower` a partir de observaciones visuales y del estado de las articulaciones. El modelo genera directamente comandos de accion de 6 dimensiones y esta pensado para ejecutarse en hardware de consumo, tal como propone el enfoque SmolVLA descrito en el paper arXiv:2506.01844.

Con aproximadamente 450 millones de parametros (450.046.176 segun los pesos en safetensors), el modelo es notablemente compacto en comparacion con otras politicas VLA de robotica, que suelen superar los miles de millones de parametros. Consume tres entradas: el estado del robot (vector de 6 valores) y dos flujos de imagen RGB de 480x640 (camaras `front` y `wrist`), y produce un vector de accion de 6 valores. El repositorio ocupa 1,2 GB y los pesos se distribuyen en formato safetensors.

Es relevante ahora porque demuestra el flujo completo de entrenamiento y despliegue de politicas de imitacion con LeRobot: parte de un modelo preentrenado, se afina con datos de teleoperacion propios y se ejecuta directamente sobre el robot mediante la CLI de LeRobot. Su licencia Apache 2.0 permite uso comercial, y su tamano reducido lo hace accesible para laboratorios y aficionados sin acceso a infraestructura de gran escala. No obstante, es un modelo muy especializado: esta entrenado unicamente para tres tareas concretas de clasificacion de objetos y no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) segun el enfoque SmolVLA; no se detalla la arquitectura interna exacta en la informacion disponible |
| Parametros totales | 450.046.176 (aproximadamente 450 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje de texto; es una politica robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.2 en el entrenamiento) |
| Tipo de robot | so_follower |
| Camaras | front, wrist |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salidas | action (6,) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint preentrenado lerobot/smolvla_base, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. Se trata de un modelo vision-lenguaje-accion que combina percepcion visual y comprension de la instruccion de tarea para producir acciones motoras. La informacion disponible no detalla la composicion exacta de capas, el mecanismo de atencion ni la estrategia de fusion multimodal; el autor solo confirma el tipo de robot, las camaras y las dimensiones de entrada y salida.

El entrenamiento se realizo con el framework LeRobot sobre el dataset Lemon115/smolvla_tasks, compuesto por 250 episodios y 231.850 fotogramas capturados a 30 FPS. Las tareas cubiertas son tres: "Put the wood cube into the right box", "Sort the objects into the correct boxes" y "Put the orange ball into the left box". La configuracion de entrenamiento fue de 20.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se especifica si hubo fases de RLHF, DPO ni ningun tipo de ajuste por preferencias, algo poco habitual en politicas de imitacion robotica.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para un brazo robotico so_follower.
- Percepcion visual multimodal mediante dos camaras (frontal y de muneca) a 480x640.
- Ejecucion de tareas de manipulacion guiadas por instruccion en lenguaje natural (las tres tareas del dataset).
- Clasificacion y colocacion de objetos en cajas segun la instruccion (cubo de madera, pelota naranja, tareas de sorting).
- Control reactivo a partir del estado de las articulaciones y de la observacion visual en tiempo real.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No se documentan capacidades multilingues; las tareas de entrenamiento estan en ingles.
- No se documentan modos especiales como thinking mode, vision-language generation, audio ni dialogo conversacional.

## Casos de uso

- Automatizacion de picking y sorting en laboratorio: el modelo puede clasificar objetos (cubos, pelotas) y depositarlos en la caja correcta a partir de la instruccion, lo que lo hace util para experimentos de manipulacion robotica reproducibles.
- Prototipado rapido de politicas con LeRobot: sirve como punto de partida para que un equipo afine su propia politica sobre tareas similares usando el mismo pipeline de entrenamiento documentado por el autor.
- Investigacion en aprendizaje por imitacion: al estar basado en SmolVLA y entrenado con 250 episodios, es un caso de estudio practico para medir como escala el rendimiento con pocos datos.
- Demostraciones de robotica de bajo coste: su tamano de 450 millones de parametros permite ejecutarlo en hardware de consumo dentro de un montaje so_follower, util para docencia y demostraciones.
- Evaluacion de robustez frente a variaciones: al no haber resultados publicados, puede emplearse para generar una tabla de exito por tarea variando posiciones de objetos, iluminacion o distracciones.
- Integracion en flujos de datos de teleoperacion: puede desplegarse con `lerobot-rollout` para comparar politicas aprendidas frente a trayectorias humanas registradas en el mismo dataset.
- Replicacion de experimentos: dado que el autor publica dataset, configuracion de entrenamiento y semilla, permite reproducir el ajuste y verificar la variabilidad entre ejecuciones.

## Benchmarks y rendimiento

_No se han publicado resultados de benchmarks en la informacion disponible._ La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No existen tablas de exito por tarea, ni comparaciones con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parametros, los pesos en precision reducida ocupan del orden de 1 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- El repositorio completo ocupa 1,2 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; una RTX 3060, RTX 4060 o RTX 4090 cubren el caso sin problemas.
- Si cabe en GPU de consumo: si, segun el planteamiento de SmolVLA de desplegarse en hardware de consumo; el propio autor no publica una tabla de requisitos.
- Opciones de despliegue: LeRobot mediante la CLI `lerobot-rollout` con `--policy.path=Lemon115/smolvla_multitask_v5`. No se documentan opciones como vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica de este tipo.
- Latencia y throughput estimados: no disponibles; depende del hardware, de la frecuencia de las camaras (30 FPS en entrenamiento) y del montaje del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lemon115/smolvla_multitask_v5 | 450 M | Estado 6D + 2 camaras 480x640 | Apache 2.0 | Hugging Face (LeRobot) | Fine-tuning especializado en 3 tareas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base del que parte este checkpoint |
| OpenVLA | aproximadamente 7 B (dato publico) | vision-lenguaje-accion | licencia publica del proyecto | ampliamente distribuido | Mucho mayor tamano; requiere mas recursos |
| pi-0 (Physical Intelligence) | aproximadamente 3,3 B (dato publico) | vision-lenguaje-accion | no comercial en algunas versiones | distribuido publicamente | Mayor escala, orientado a investigacion avanzada |

Nota: los datos de OpenVLA y pi-0 provienen de informacion publica general y no de la model card facilitada; se incluyen solo como referencia de escala. No se dispone de comparaciones de rendimiento directas entre estos modelos y la politica analizada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion, por lo que se desconoce la tasa de exito real en las tareas entrenadas.
- Es un modelo altamente especializado: solo cubre las tres tareas del dataset (colocar el cubo de madera, clasificar objetos y colocar la pelota naranja) y no generaliza a otras tareas sin reentrenamiento.
- Depende de un montaje hardware concreto: robot so_follower y dos camaras con nombres `front` y `wrist`; cualquier cambio de camaras, montaje o cinematica puede degradar o invalidar su funcionamiento.
- No se documentan sesgos especificos, pero al entrenarse con 250 episodios de un unico operador y entorno, es probable que herede sesgos de posicion, iluminacion y fondo.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de generar acciones incorrectas o fuera de distribucion ante escenas no vistas.
- No se documentan limitaciones de idioma; las instrucciones de tarea estan en ingles y se desconoce el comportamiento con instrucciones en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el comportamiento fisico del robot y las medidas de seguridad.
- Para produccion: no hay garantias de fiabilidad, ni validacion en entornos reales, ni soporte del autor; se recomienda validar exhaustivamente antes de cualquier despliegue real.
- Un modelo base (lerobot/smolvla_base) que pueda tener sus propias restricciones; conviene revisar su licencia antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lemon115/smolvla_multitask_v5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Lemon115/smolvla_tasks
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Lemon115/smolvla_tasks
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
