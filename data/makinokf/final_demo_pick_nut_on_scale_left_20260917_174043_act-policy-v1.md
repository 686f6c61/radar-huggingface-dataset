# MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043_act-policy-v1

## Resumen

`MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043_act-policy-v1` es una política de robótica entrenada con imitación mediante el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv 2304.13705 ("Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"). El modelo lo ha entrenado y publicado el usuario MakinoKF con la librería LeRobot de Hugging Face, y su función es ejecutar una única tarea de manipulación: recoger una tuerca ("pick the nut") con un brazo robótico de tipo `so101_enhanced_follower`.

El modelo no es un modelo de lenguaje: es una política visomotora de 51.668.614 parámetros (≈51,7 M) que consume el estado de las articulaciones (vector de 6 dimensiones) y dos cámaras RGB de 480×640 (`top` y `left`), y produce un vector de acción de 6 dimensiones. Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar demostraciones teleoperadas, entrenar una política ACT y desplegarla en hardware de bajo coste, con licencia Apache 2.0.

Se trata de un repositorio de demostración personal (0 descargas, 0 likes, 0,2 GB) creado el 17 de septiembre de 2026, sin resultados de evaluación publicados. El interés principal está en el pipeline y en la metodología, no en el rendimiento verificado de la política.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE sobre backbones visuales; el detalle exacto de capas y dimensiones no está disponible en la model card |
| Parametros totales | 51.668.614 (≈51,7 M), según safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como en un LLM: consume una observación por paso (estado de 6 dims + 2 imágenes de 3×480×640) y predice un *chunk* de acciones; el tamaño del chunk no está disponible |
| Tipos de cuantizacion | No disponibles: el repositorio publica safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No aplica / no disponible: la política no consume lenguaje natural; está entrenada para una única tarea |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargables con la librería `lerobot`) |
| Tipo de robot | `so101_enhanced_follower` |
| Cámaras | `top`, `left` (480×640, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.left` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Versión de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (*imitation learning*) que predice secuencias cortas de acciones (*action chunks*) en lugar de un único paso de control. La formulación habitual combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas mediante una variable latente de estilo; las observaciones visuales se procesan con backbones convolucionales y se fusionan con el estado proprioceptivo. La model card no especifica para esta política el número de capas, dimensión oculta, número de cabezas ni el tamaño del chunk de acciones, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043`: 43 episodios, 5.875 fotogramas a 30 FPS, correspondientes a la tarea "pick the nut". La configuración declarada es de 30.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni de ningún otro ajuste por preferencias, algo esperable en una política de control robótico entrenada exclusivamente con demostraciones.

## Capacidades

- Control robótico por imitación: genera vectores de acción de 6 dimensiones a partir del estado articular y de dos vistas RGB sincronizadas.
- Predicción de *chunks* de acciones, característica central de ACT, que reduce el error de composición y suaviza la ejecución en comparación con el control paso a paso.
- Percepción visual multi-cámara: utiliza simultáneamente una vista superior (`top`) y una vista lateral (`left`) a 480×640.
- Ejecución de una tarea específica de manipulación: recoger una tuerca ("pick the nut").
- Integración con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje y no expone interfaces de herramientas.
- No soporta razonamiento multi-paso simbólico, planificación basada en lenguaje ni uso como agente conversacional.
- No dispone de capacidades multilingües: no procesa instrucciones en lenguaje natural; el campo `task` se emplea como etiqueta de la tarea durante el *rollout*.
- No dispone de modo de razonamiento (*thinking*), visión generativa, audio ni otras capacidades multimodales más allá del par de cámaras de entrada.

## Casos de uso

- Recogida y colocación de piezas pequeñas en una celda de ensamblaje: la política toma como entrada la vista superior y lateral del puesto de trabajo y genera las 6 acciones necesarias para agarrar la tuerca; es adecuada porque ACT mantiene altas tasas de éxito en manipulación fina con hardware de bajo coste, siempre que el entorno coincida con el de las demostraciones.
- Alimentación de componentes en una báscula o punto de control de peso: el nombre del modelo y del dataset indican precisamente ese flujo (recoger la tuerca y colocarla sobre la báscula), por lo que puede integrarse como paso previo a un sistema de verificación de peso.
- Punto de partida para *fine-tuning* en tareas nuevas: al ser una política ACT ya entrenada y compatible con `lerobot-train`, sirve para reentrenar con un dataset propio (otros objetos, otras posiciones) cambiando `--policy.path` y el `repo_id` del dataset, reduciendo el tiempo frente a un entrenamiento desde cero.
- Validación de hardware y calibración de cámaras con el brazo SO-101: ejecutar la política con `lerobot-rollout --strategy.type=base` permite comprobar la teleoperación, la latencia del bucle de control y la correcta colocación de las cámaras `top` y `left` antes de grabar un dataset definitivo.
- Demostración reproducible en investigación sobre aprendizaje por imitación: al estar publicados el dataset (43 episodios, 5.875 fotogramas) y la configuración exacta de entrenamiento (30.000 pasos, AdamW, lr 1e-05, semilla 1000), el experimento es replicable y útil como referencia de comparación entre métodos de *chunking* y difusión.
- Docencia y formación en robótica de bajo coste: el par robot SO-101 + LeRobot + política ACT permite ilustrar el ciclo completo grabar-entrenar-desplegar en un laboratorio o aula sin hardware industrial.
- Automatización de tareas repetitivas de *pick-and-place* de objeto único en producción ligera: la ventana de entrada es fija y la inferencia es ligera (51,7 M de parámetros), lo que permite ejecutarla en un PC con GPU de gama media junto al brazo.
- Recolección de piezas dispersas con vista cenital: el uso de dos cámaras ayuda a resolver oclusiones parciales; aun así, el rendimiento fuera de las posiciones vistas en las demostraciones no está verificado (no hay evaluación publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación de esta política (*"No evaluation results have been provided for this policy yet"*), por lo que no existen cifras de tasa de éxito en robot real, ni métricas de error de acción (MSE/MAE), ni comparaciones cuantitativas con otras políticas. La plantilla de la model card sugiere reportar la tabla "Task / Trials / Successes / Success rate", pero permanece sin rellenar.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 207 MB en fp32 (51,67 M × 4 bytes) y unos 103 MB en fp16. Sumando activaciones de los backbones visuales que procesan dos imágenes de 480×640 por paso, el consumo total es previsiblemente inferior a 2 GB, aunque no hay medición publicada.
- Cabe en cualquier GPU de consumo: se puede ejecutar en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). También es viable la inferencia en CPU, con mayor latencia.
- GPU profesionales como A100 o H100 no son necesarias para la inferencia; solo tendrían sentido para acelerar reentrenamientos con lotes grandes.
- Despliegue: la vía documentada es la CLI de LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar), con soporte CUDA mediante `--policy.device=cuda`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportación a GGUF/ONNX, ya que son runtimes orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican cifras de frecuencia de inferencia ni de tiempo por *chunk* de acciones para esta política; el dataset se grabó a 30 FPS, lo que da una referencia del régimen al que opera el robot, pero no una medición del modelo.
- Recomendación de producción: fijar la política a una GPU dedicada junto al brazo, con parada de emergencia accesible y límites de par en el controlador, dado que no existe evaluación de seguridad ni de tasa de fallo.

## Comparativa con modelos similares

Los datos de la información proporcionada solo cubren esta política; el resto de la tabla procede de conocimiento general del ecosistema LeRobot y debe tomarse como orientativo, no verificado en la búsqueda.

| Modelo | Parametros | Representacion de acciones | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta política (ACT, MakinoKF) | 51,7 M | Chunk de acciones (6 dims) | Estado 6 dims + 2 cámaras 480×640 | Apache 2.0 | Hugging Face (LeRobot), 0 descargas |
| ACT de referencia (arXiv 2304.13705) | No disponible (depende de la configuración; típicamente decenas de millones) | Chunk de acciones | Estado + cámaras | Código abierto (licencia del repositorio original) | Repositorio del paper + integración en LeRobot |
| Diffusion Policy (integrado en LeRobot) | No disponible / configurable según backbone | Difusión sobre horizontes de acción | Estado + cámaras | Apache 2.0 en su integración en LeRobot | Hugging Face / LeRobot |
| SmolVLA (Hugging Face) | Del orden de 450 M (dato de referencia general) | Chunk de acciones con condicionamiento por lenguaje e imágenes | Estado + imágenes + instrucción en lenguaje natural | Apache 2.0 | Hugging Face / LeRobot |

Diferencias clave: esta política es monotarea y no acepta instrucciones en lenguaje natural, mientras que modelos como SmolVLA sí incorporan condicionamiento lingüístico y por tanto pueden cubrir varias tareas con un solo conjunto de pesos; a cambio, ACT es mucho más ligero (51,7 M frente a cientos de millones de parámetros) y más sencillo de desplegar. Diffusion Policy suele requerir varios pasos de denoising por acción, con mayor coste de inferencia que un transformer de *chunking*.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Dataset muy pequeño: 43 episodios y 5.875 fotogramas para 30.000 pasos de entrenamiento; es un régimen propenso al sobreajuste a las posiciones, iluminación y disposición exactas del entorno de grabación.
- Monotarea estricta: solo está entrenada para "pick the nut"; cualquier otra instrucción o escenario producirá acciones sin sentido.
- Dependencia del hardware y la calibración: la política asume el robot `so101_enhanced_follower` y las cámaras `top` y `left` con nombres e índices concretos; un cambio de montaje, de objetivo o de calibración degrada el comportamiento.
- Sensibilidad a variaciones del entorno del objeto (posición inicial, distractor, iluminación, fondo): no verificada por el autor y, en general, principal causa de fallo en políticas de imitación.
- Riesgo de acciones erráticas o colisiones: aunque no aplica el concepto de "alucinación" lingüística, una política puede ejecutar trayectorias incorrectas; es imprescindible disponer de parada de emergencia, límites de fuerza y supervisión humana.
- Sin soporte de lenguaje: el argumento `--task="pick the nut"` no condiciona la conducta del modelo, solo etiqueta la ejecución.
- Interpretación de las 6 dimensiones de acción (probablemente articulaciones del brazo) no documentada; tampoco el tamaño del chunk ni si se usa ensamblado temporal en el despliegue.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor; hay que revisar además las licencias de LeRobot y del código de ACT original que se utilicen.
- Repositorio sin tracción: 0 descargas y 0 likes, sin revisión por parte de la comunidad; fechas del repositorio y del dataset (17 de septiembre de 2026) corresponden a un experimento de demostración.
- No hay variantes cuantizadas ni formatos alternativos (GGUF, ONNX) publicados, lo que limita su despliegue fuera del stack PyTorch/LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/final_demo_pick_nut_on_scale_left_20260917_174043
- Artículo de ACT (referencia de la model card): https://huggingface.co/papers/2304.13705 y https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a páginas institucionales de la prefectura de Hokkaido (https://www.pref.hokkaido.lg.jp/, https://www.dokyoi.pref.hokkaido.lg.jp/, https://www.police.pref.hokkaido.lg.jp/) sin relación alguna con la política.
