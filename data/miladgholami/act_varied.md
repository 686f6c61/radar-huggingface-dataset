# miladgholami/act_varied

## Resumen

`miladgholami/act_varied` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robotica. Su autor es el usuario miladgholami y se distribuye bajo licencia Apache 2.0.

El modelo resuelve tareas de manipulacion robotica a partir de datos de teleoperacion. En concreto, el checkpoint se ha entrenado sobre el dataset `miladgholami/scissor_varied_50ep`, lo que sugiere una tarea de manejo de tijeras con variaciones, con 50 episodios de demostracion. No se trata de un modelo de lenguaje ni de un modelo multimodal de proposito general, sino de una politica de control especializada que mapea observaciones (imagenes y estado del robot) a comandos de accion.

Con 51.668.614 parametros (unos 51,7 millones) y un tamano de repositorio de 0,2 GB en formato safetensors, es un modelo ligero y desplegable en hardware modesto. Su relevancia radica en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluacion y el despliegue de politicas de robotica de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE, segun el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (politica de control; procesa secuencias de observaciones, no contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | miladgholami/scissor_varied_50ep |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion presentado en el paper arXiv:2304.13705. Su arquitectura se basa en un transformer encoder-decoder que genera fragmentos de acciones de longitud fija (action chunks) en lugar de una sola accion por paso de tiempo. Incorpora un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, lo que ayuda a manejar la multimodalidad de los datos de teleoperacion. Este diseno reduce el error de compilacion acumulado y permite ejecutar movimientos mas suaves y precisos.

El modelo se ha entrenado con LeRobot sobre el dataset `miladgholami/scissor_varied_50ep`, compuesto por 50 episodios de demostraciones teleoperadas de una tarea con tijeras que presenta variaciones. No se dispone de informacion detallada sobre la composicion exacta del dataset, el numero de pasos de entrenamiento, hiperparametros ni si se aplicaron tecnicas de aumento de datos. Tampoco se documentan procesos de RLHF o DPO, algo por otra parte inusual en politicas de robotica basadas en imitacion. El repositorio incluye unicamente los pesos entrenados y los metadatos; no se han publicado detalles adicionales de la configuracion de entrenamiento en la informacion disponible.

## Capacidades

- Control de robot por imitacion: genera comandos de accion de manipulacion a partir de observaciones visuales y del estado del robot.
- Prediccion de action chunks: produce secuencias cortas de acciones coherentes, lo que favorece movimientos suaves y reduce el error acumulado.
- Manipulacion de objetos: entrenado especificamente para una tarea con tijeras con variaciones en el dataset de demostracion.
- Compatibilidad con el ecosistema LeRobot: se puede entrenar, evaluar y desplegar con las herramientas `lerobot-train` y `lerobot-record`.
- Soporte de grabacion de episodios de evaluacion: la inferencia puede ejecutarse sobre un robot tipo `so100_follower` y registrar los episodios resultantes.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de lenguaje; su planificacion se limita a la prediccion de chunks de accion.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): usa entrada visual como parte de las observaciones, pero no dispone de modo de razonamiento explicito ni de procesamiento de audio.

## Casos de uso

- Automatizacion de una celda robotica de corte con tijeras: el modelo ejecuta la tarea para la que fue entrenado a partir de observaciones visuales, sustituyendo la teleoperacion manual por control autonomo una vez desplegado sobre el robot correspondiente.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida reproducible para estudiar el comportamiento de ACT en tareas con variabilidad, comparando resultados con otros checkpoints de la misma familia.
- Base para fine-tuning en tareas similares: al ser un checkpoint ligero de 51,7 millones de parametros, se puede reentrenar sobre nuevos datasets de manipulacion con coste computacional reducido.
- Evaluacion comparativa de politicas con LeRobot: permite ejecutar `lerobot-record` sobre un robot `so100_follower` y generar datasets de evaluacion prefijados con `eval_` para medir tasas de exito.
- Prototipado en laboratorio con hardware de bajo coste: encaja en montajes tipo SO-100, habituales en entornos academicos por su coste contenido.
- Docencia y formacion en robotica: ilustra el flujo completo de LeRobot, desde el entrenamiento con `policy.type=act` hasta la evaluacion con un robot real.
- Replicacion de resultados: al estar publicado con licencia Apache 2.0, cualquier equipo puede descargarlo y reproducir la inferencia sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito ni metricas de evaluacion para este checkpoint concreto. El paper de ACT (arXiv:2304.13705) reporta resultados para sus propios experimentos, pero no son directamente atribuibles a este modelo entrenado sobre `scissor_varied_50ep`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parametros, los pesos ocupan aproximadamente 207 MB en fp32, 103 MB en fp16 y 52 MB en int8. La VRAM real necesaria es pequena y depende sobre todo del tamano de las imagenes de entrada y del batch, no del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; la propia model card indica `--policy.device=cuda`. Una NVIDIA RTX 3060 o superior resulta mas que adecuada para inferencia.
- Cabe en GPU de consumo: si, con holgura. Incluso GPUs de gama de entrada o integradas con soporte CUDA pueden ejecutar la inferencia.
- Opciones de despliegue: LeRobot para entrenamiento e inferencia (`lerobot-train`, `lerobot-record`); el formato safetensors es compatible con frameworks de PyTorch. Para optimizacion adicional se podria recurrir a ONNX u otras rutas, aunque no estan documentadas en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al ser una politica de control, la frecuencia de inferencia depende del robot, de la tasa de captura de cameras y del hardware; no se han publicado cifras.
- CPU: es tecnicamente posible ejecutar el modelo en CPU por su tamano, pero no se documenta soporte ni rendimiento en este modo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| miladgholami/act_varied | ACT (imitacion) | 51,7 M | no aplica | apache-2.0 | HuggingFace (0 descargas) |
| Otros checkpoints ACT en LeRobot | ACT (imitacion) | variable | no aplica | habitualmente apache-2.0 | HuggingFace |
| Diffusion Policy (familia) | politica de difusion | variable | no aplica | variable | repositorios de investigacion |
| OpenVLA y similares (VLA) | vision-language-action | miles de millones | contexto de lenguaje | variable | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales. Las alternativas VLA, de mayor tamano, permiten condicionar el control por instrucciones en lenguaje natural, algo que ACT no ofrece.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para una unica tarea (manejo de tijeras con variaciones) sobre 50 episodios; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sin informacion de evaluacion: no se publican tasas de exito, por lo que se desconoce su fiabilidad real en produccion.
- Dependencia del montaje: el rendimiento depende de la camara, el robot y la calibracion; cambios en la configuracion fisica pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 50 episodios, la variabilidad de objetos, iluminacion o posiciones puede provocar fallos fuera de la distribucion de entrenamiento.
- Ausencia de razonamiento explicito: no interpreta lenguaje ni sigue instrucciones; solo reproduce el comportamiento aprendido.
- Sesgos: no disponibles; no se documenta analisis de sesgos en los datos de teleoperacion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones incorrectas ante observaciones no vistas.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion. No se identifican restricciones adicionales en la informacion proporcionada.
- Caveat de produccion: al tener 0 descargas y 0 likes, no hay evidencia de uso o validacion por parte de la comunidad; conviene evaluarlo exhaustivamente antes de desplegarlo en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/miladgholami/act_varied
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/miladgholami/scissor_varied_50ep
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
