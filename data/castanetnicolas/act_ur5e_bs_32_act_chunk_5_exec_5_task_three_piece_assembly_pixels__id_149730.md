# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_149730

## Resumen

ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_149730 es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. La desarrolla el usuario de HuggingFace castanetnicolas y se ha entrenado y publicado con la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es un modelo de control que mapea observaciones (un vector de estado propioceptivo de 9 dimensiones y dos imágenes RGB de 84x84 píxeles) a un vector de acción de 7 dimensiones. Cuenta con 51.575.431 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio.

La tarea concreta para la que se ha entrenado es "Insert the first piece into the base, then insert the second piece on top of it", un ensamblaje de tres piezas derivado del benchmark MimicGen. El conjunto de datos de entrenamiento contiene 200 episodios y 67.101 fotogramas grabados a 20 FPS, con dos cámaras (`agentview` y `robot0_eye_in_hand`). La propuesta de ACT consiste en predecir fragmentos cortos de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación fina.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible del flujo de trabajo de imitación de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`); por otro, es un punto de partida para experimentos de ensamblaje de precisión en laboratorio. Conviene señalar que el autor no ha publicado resultados de evaluación, y que el repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con codificacion visual, libreria LeRobot; pipeline `robotics` |
| Parametros totales | 51.575.431 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no procesa secuencias de texto; es una politica de control) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ; pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot declarado | `panda` (segun la model card); el nombre del repositorio menciona `UR5e` |
| Camaras | `agentview`, `robot0_eye_in_hand` |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 84, 84); `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salidas | `action` (7,) |
| Tarea | "Insert the first piece into the base, then insert the second piece on top of it" |
| Dataset de entrenamiento | castanetnicolas/mimicgen_three_piece_assembly_d1_image84 (200 episodios, 67.101 fotogramas, 20 FPS) |
| Tamano del repositorio | 0,2 GB |
| Fechas de creacion / actualizacion | 2026-10-10 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el metodo como ACT (Action Chunking with Transformers), descrito en el articulo arXiv:2304.13705: un metodo de aprendizaje por imitacion que predice chunks cortos de acciones en lugar de pasos sueltos y que aprende a partir de datos teleoperados. La model card no detalla la configuracion interna de esta politica concreta (numero de capas, dimensiones del transformer, tipo de codificador visual ni funcion de perdida), por lo que esos extremos quedan como no disponibles. El nombre del repositorio incluye los sufijos `Act_Chunk_5_Exec_5`, lo que sugiere un tamano de chunk de 5 acciones con 5 pasos de ejecucion, si bien la model card no confirma esa interpretacion.

Los datos de entrenamiento proceden del dataset castanetnicolas/mimicgen_three_piece_assembly_d1_image84, con 200 episodios, 67.101 fotogramas a 20 FPS y dos flujos de imagen a 84x84 píxeles. La configuracion de entrenamiento documentada es la siguiente: 300.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.1. No se indica en la informacion proporcionada si se aplico RLHF, DPO ni ninguna etapa de ajuste posterior al entrenamiento por imitacion, ni se detalla la composicion exacta de las trayectorias mas alla de la tarea descrita.

## Capacidades

- Generacion de acciones de control roboticas: produce un vector de accion de 7 dimensiones a partir del estado y de las imagenes, en lugar de generar texto.
- Prediccion por chunks de acciones: sigue la formulacion de ACT, orientada a reducir el error de composicion en tareas de manipulacion fina.
- Tarea de ensamblaje especifica: insertar la primera pieza en la base e insertar la segunda pieza encima.
- Percepcion visual estereoscopica de dos vistas: una camara de escena (`agentview`) y una camara en el efector (`robot0_eye_in_hand`), ambas a 84x84.
- Condicionamiento por estado propioceptivo de 9 dimensiones (`observation.state`).
- Integracion con el ecosistema LeRobot: se puede ejecutar con `lerobot-rollout` sobre un robot compatible y reentrenar con `lerobot-train`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion explicita.
- No tiene capacidades de lenguaje, multilingues ni de generacion de texto.
- No dispone de modo thinking, audio, video ni vision general; su entrada visual queda restringida a las dos camaras con las que fue entrenado.

## Casos de uso

- Ensamblaje de precision en laboratorio: la politica se ha entrenado especificamente para insertar dos piezas sobre una base, de modo que puede emplearse para automatizar una celda de ensamblaje de tres piezas con el robot para el que se grabo el dataset.
- Reproduccion de experimentos de imitacion en LeRobot: sirve como referencia end-to-end del flujo completo (dataset de 200 episodios, entrenamiento de 300.000 pasos con AdamW y lr 1e-05, despliegue con `lerobot-rollout`) para validar la version 0.6.1 de la libreria.
- Base para fine-tuning en otra plataforma: al ser una politica de 51,5 millones de parametros y 0,2 GB, es viable reentrenarla sobre datos propios de otro brazo o de otra tarea sin requerir un clúster grande.
- Punto de partida para aprendizaje por imitacion con propietocepcion limitada: el modelo demuestra que con 9 dimensiones de estado y dos camaras de baja resolucion se puede abordar una tarea de insercion, lo que sirve de linea base para comparar con politicas de difusion u otras alternativas.
- Generacion de datos y DAgger: al ejecutarse sobre hardware real con `--strategy.type=base`, permite recoger episodios de fallo y exito para ampliar el dataset de entrenamiento de forma iterativa.
- Validacion de pipelines de simulacion a real: el dataset de origen esta vinculado a MimicGen, por lo que la politica es util para estudiar la transferencia de politicas entrenadas en entornos simulados al brazo fisico.
- Docencia y divulgacion tecnica: por su tamano reducido y su licencia Apache-2.0, es un caso practico adecuado para demostrar como se entrena y despliega una politica de imitacion en una sola GPU de consumo.
- Pruebas de control a 20 Hz: dado que los datos se grabaron a 20 FPS, puede integrarse en bucles de control de frecuencia similar, siempre que la latencia de inferencia real se valide en el equipo destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que todavia no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y no incluye tasas de exito, numero de ensayos ni comparaciones con otras politicas. Tampoco se aportan metricas de entrenamiento (perdida final, convergencia) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo: a partir de 51.575.431 parametros, los pesos en fp32 ocupan aproximadamente 206 MB y en fp16/bf16 unos 103 MB. Esta cifra es una estimacion derivada del recuento de parametros; la model card no publica requisitos oficiales.
- VRAM total recomendada: con el runtime de PyTorch, las dos camaras y los buffers de inferencia, es razonable reservar entre 2 y 4 GB de VRAM, aunque no se especifica en la informacion proporcionada.
- GPU compatibles: no se indican GPU recomendadas en la model card. Por tamano, el modelo cabe en cualquier GPU de consumo con al menos 4 GB, como una RTX 3050, RTX 3060, RTX 4060, RTX 4090 o equivalentes, y tambien es viable su ejecucion en CPU.
- Despliegue: la via documentada es LeRobot (`lerobot-rollout` con `--policy.path` apuntando al repositorio) y el reentrenamiento con `lerobot-train` usando `--policy.type=act`. Frameworks de servido de modelos de lenguaje como vLLM, TGI, Ollama o llama.cpp no aplican a este tipo de politica.
- Requisitos de integracion: es necesario disponer del robot declarado (`panda` segun la model card), del puerto correcto (`--robot.port`) y de dos camaras cuyos nombres coincidan exactamente con las claves de observacion (`agentview` y `robot0_eye_in_hand`).
- Latencia y throughput: no disponibles. No se documenta la latencia por inferencia ni la frecuencia de control alcanzable, mas alla de que los datos de entrenamiento se grabaron a 20 FPS.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, por lo que la comparacion se limita a caracteristicas verificables y queda marcada como no disponible en los campos sin datos.

| Modelo | Tipo | Parametros | Entradas | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| ACT (esta ficha) | Imitacion con transformer, prediccion por chunks | 51.575.431 | Estado (9,) + 2 imagenes 84x84 | apache-2.0 | No hay evaluación publicada |
| Diffusion Policy (familia de politicas de imitacion generativas) | Imitacion generativa basada en difusion | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| SmolVLA / pi0 (familias VLA de LeRobot) | Vision-language-action | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| Otras politicas ACT publicadas en el Hub | Imitacion con transformer, prediccion por chunks | no disponible | no disponible | variable, no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card indica explicitamente que no se han proporcionado resultados de evaluacion, de modo que no existe ninguna tasa de exito medida en robot real para la tarea declarada.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de que la politica funcione correctamente.
- Discrepancia de plataforma: el nombre del repositorio menciona `UR5e` mientras que la model card declara `robot type: panda`. Es imprescindible verificar la plataforma real antes de desplegarlo, ya que un desajuste en la cinematica o en el espacio de acciones invalidaria la politica.
- Especializacion extrema: esta entrenado para una unica tarea de ensamblaje de tres piezas; no generaliza a otras tareas, objetos ni ordenes de ensamblaje sin reentrenamiento.
- Dependencia estricta de la interfaz de observacion: los nombres de las camaras y el orden de las claves de observacion deben coincidir con los del entrenamiento; cualquier cambio en la resolucion (84x84), el numero de camaras o la dimension del estado (9) rompe la inferencia.
- Baja resolucion visual: las imagenes de 84x84 limitan la percepcion de detalles finos, lo que puede ser critico en inserciones con tolerancias ajustadas.
- Robustez no documentada: no hay datos sobre el comportamiento ante cambios de iluminacion, posiciones nuevas de las piezas, distractores o un robot distinto del mismo tipo, factores que la propia plantilla de la model card senala como relevantes para la dificultad.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo equivalente de generar acciones erroneas sin ningun mecanismo de verificacion ni de autorevision en el bucle de control.
- Sesgos: no se documenta ningun analisis de sesgo. El sesgo relevante es de distribucion de datos (posiciones, apariencia de las piezas, condiciones de iluminacion y montaje de camaras presentes durante la teleoperacion).
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia: los pesos se distribuyen bajo Apache-2.0, que permite uso comercial sin restricciones adicionales documentadas. Conviene comprobar por separado la licencia del dataset de entrenamiento, que no se detalla en la informacion proporcionada.
- Caveat de despliegue: al ejecutar `lerobot-rollout` con `--strategy.type=base` no se graban episodios; omitir `--duration` hace que la politica se ejecute de forma indefinida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_5_Exec_5_TASK_three_piece_assembly_PIXELS__ID_149730
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Articulo de ACT (referenciado en la model card): https://huggingface.co/papers/2304.13705
- Articulo de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
