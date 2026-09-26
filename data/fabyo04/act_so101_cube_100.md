# Fabyo04/act_so101_cube_100

## Resumen

`Fabyo04/act_so101_cube_100` es una política de robótica entrenada con ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705, y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visuomotor que recibe el estado articular del robot y dos flujos de imagen y devuelve comandos de acción. En concreto, consume `observation.state` con forma `(6,)`, dos cámaras (`top` y `front`) a 480x640 y emite `action` con forma `(6,)`.

El modelo ha sido entrenado sobre el dataset `Fabyo04/so101_cube_demo_0_20260926_155239`, compuesto por 100 episodios de teleoperación, 44.553 fotogramas a 30 FPS, para una única tarea: «Pick up the cube and place it in the bowl». El robot objetivo es el brazo `so_follower` (SO-101) y la configuración de entrenamiento declarada es de 200 pasos con batch de 8 y optimizador AdamW a un learning rate de 1e-5.

Su relevancia es doble. Por un lado, es un ejemplo canónico del flujo de trabajo actual de robótica de bajo coste con LeRobot: grabar demostraciones, entrenar una política ACT y desplegarla con `lerobot-rollout`. Por otro, conviene tratarlo con cautela: acumula 0 descargas y 0 «likes», no incluye resultados de evaluación y el número de pasos de entrenamiento es muy reducido respecto al volumen de datos disponible (1.600 muestras vistas sobre 44.553 fotogramas, en torno al 3,6 % de una época), por lo que su tasa de éxito real es desconocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de aprendizaje por imitación; configuración concreta no detallada en la información disponible |
| Parámetros totales | 51.668.614 (≈ 51,7 M), según el recuento del archivo safetensors |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. El horizonte de predicción de acciones (chunk) no se especifica en la información disponible |
| Tipos de cuantización | No se documentan cuantizaciones específicas. Los pesos se publican en safetensors a precisión completa (habitualmente fp32 en LeRobot) |
| Idiomas soportados | No aplica: no procesa lenguaje natural. Solo recibe una cadena de tarea como condicionamiento («Pick up the cube and place it in the bowl»); no se documenta generalización a otras formulaciones ni idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de política | Robótica / control visuomotor (pipeline `robotics`) |
| Robot objetivo | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,); `observation.images.top` (3, 480, 640); `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Cámaras | `top`, `front` |
| Dataset de entrenamiento | `Fabyo04/so101_cube_demo_0_20260926_155239`: 100 episodios, 44.553 fotogramas, 30 FPS |
| Tarea | «Pick up the cube and place it in the bowl» |
| Pasos de entrenamiento | 200 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 42 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 26 de septiembre de 2026 (según metadatos del Hub) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice «trozos» de acciones (action chunks) en lugar de un único paso de control. La formulación del artículo introduce un esquema tipo CVAE sobre un codificador-decodificador transformer, con un backbone visual convolucional para procesar las imágenes, y utiliza ensamblado temporal (temporal ensembling) en inferencia para suavizar las predicciones solapadas. Esta estrategia se diseñó para manipulación fina con hardware de bajo coste y suele alcanzar tasas de éxito altas cuando se dispone de suficientes demostraciones. No obstante, la información disponible no detalla la configuración concreta de este checkpoint: ni el backbone visual, ni el tamaño del chunk de acciones, ni las dimensiones internas del transformer, ni la composición exacta del dataset más allá del número de episodios, fotogramas y FPS.

El entrenamiento declarado es notablemente corto. Con 200 pasos y batch 8, el modelo ha visto 1.600 muestras, es decir, aproximadamente el 3,6 % de una única época sobre los 44.553 fotogramas del dataset. El learning rate es de 1e-5 con AdamW y semilla 42, sobre LeRobot 0.6.1. No se documenta ningún tipo de aprendizaje por refuerzo, RLHF ni DPO, lo cual es coherente con una política de imitación supervisada. Tampoco se indica si se aplicaron aumentos de datos, normalización de observaciones, ni si las demostraciones incluyen variabilidad de posiciones del cubo, iluminación o distractores. El nombre del repositorio (`..._cube_100`) probablemente haga referencia a los 100 episodios del dataset, pero esto no se confirma en la model card.

## Capacidades

- Control visuomotor de un brazo SO-101 (`so_follower`) con 6 grados de libertad de estado y 6 dimensiones de acción.
- Ejecución de una única tarea de pick-and-place: coger un cubo y colocarlo en un cuenco.
- Fusión de dos vistas de cámara simultáneas (`top` y `front`) a resolución 480x640 y 30 FPS.
- Predicción de secuencias de acción (action chunking), que reduce el error de composición típico de las políticas que predicen paso a paso.
- Compatibilidad directa con el ecosistema LeRobot: inferencia mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Condicionamiento por cadena de tarea en el momento de la inferencia, aunque no hay evidencia publicada de que generalice a otras instrucciones.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo «thinking»: no es un modelo de propósito general.

## Casos de uso

- Automatización de una celda pick-and-place de bajo coste: el modelo puede pilotar un SO-101 para trasladar un cubo a un cuenco sin necesidad de planificación explícita ni de modelo del entorno, lo que abarata prototipos de manipulación en laboratorios con presupuesto reducido.
- Base de partida para fine-tuning en tareas similares: dado que ACT se reentrena con `lerobot-train` sobre un dataset propio, este checkpoint sirve como inicialización razonable para tareas de agarre y colocación con el mismo robot y disposición de cámaras.
- Banco de pruebas para comparar métodos de imitación: permite medir ACT frente a otras políticas del ecosistema LeRobot (por ejemplo, políticas de difusión o VLA) exactamente sobre el mismo dataset de 100 episodios y la misma tarea.
- Docencia y formación en robótica: es un ejemplo didáctico completo del ciclo grabar-calibrar-entrenar-desplegar, con comandos reproducibles y una tarea visualmente verificable.
- Recolección de datos asistida: desplegado en modo `base` sin grabación de episodios, puede utilizarse para comprobar la calidad de la configuración de cámaras, puertos y calibración antes de lanzar campañas de demostración más largas.
- Investigación en robustez y generalización: al no incluir evaluación publicada, es un caso útil para estudiar cómo degrada una política ACT ante cambios de iluminación, posición inicial del objeto, distractores o ligeras variaciones en la colocación de la cámara.
- Evaluación de infraestructura de inferencia en el borde: con unos 51,7 M de parámetros, permite medir latencia y consumo de un controlador neuronal a 30 FPS en GPUs de gama de entrada o en CPU, antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y contiene únicamente la plantilla del autor con la nota «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito medidas en robot real para la tarea «Pick up the cube and place it in the bowl». Tampoco se proporcionan métricas de pérdida de entrenamiento, de error de acción ni comparaciones con otras políticas sobre el mismo dataset.

| Aspecto | Resultado |
|---|---|
| Tasa de éxito en robot real | No disponible (sin evaluación publicada) |
| Número de ensayos | No disponible |
| MMLU / HumanEval / GSM8K u otros benchmarks de lenguaje | No aplica: no es un modelo de lenguaje |
| Métricas de imitación (MSE de acciones, etc.) | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos (estimación derivada del recuento de parámetros, no publicada por el autor): en torno a 207 MB en fp32 (51.668.614 × 4 bytes), unos 103 MB en fp16/bf16 y unos 52 MB en int8.
- VRAM realista en inferencia: con dos imágenes de 480x640 por paso y las activaciones intermedias del backbone visual, el consumo típico se sitúa en el rango de 1 a 2 GB con batch 1. La cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema; una GPU integrada moderna también podría bastar si el backbone visual es ligero, aunque no hay datos publicados al respecto.
- Inferencia en CPU: viable en términos de memoria, pero el requisito de control a 30 FPS (33 ms por fotograma, dos cámaras por paso) hace que la latencia sea el factor limitante y no la capacidad de memoria. No se han publicado mediciones de latencia ni de throughput.
- Tamaño del repositorio: 1,2 GB, muy superior a lo que ocupan los pesos en precisión simple, lo que sugiere la presencia de checkpoints adicionales o estados del optimizador.
- Opciones de despliegue documentadas: `lerobot-rollout` con `--policy.path=Fabyo04/act_so101_cube_100` y `--strategy.type=base`. El entrenamiento se realiza con `lerobot-train --policy.type=act`. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, Ollama, llama.cpp o TGI, que además no aplican a este tipo de modelo.
- Configuración de despliegue: las cámaras deben exponerse con los nombres `top` y `front` coincidiendo con las claves de observación del entrenamiento, a 640x480 y 30 FPS, y el robot debe ser de tipo `so_follower` en el puerto correspondiente.

## Comparativa con modelos similares

La información proporcionada no incluye datos cuantitativos de modelos alternativos, por lo que los campos no verificables se marcan como no disponibles. La comparación se limita a rasgos estructurales verificables.

| Modelo | Tipo de política | Parámetros | Licencia | Estado en la información disponible |
|---|---|---|---|---|
| `Fabyo04/act_so101_cube_100` | ACT (action chunking con transformer), imitación supervisada | 51,7 M | Apache-2.0 | Publicado; 0 descargas, 0 likes, sin evaluación |
| Políticas ACT de otros autores en LeRobot | ACT | No disponible | No disponible | No disponible |
| Políticas de difusión (diffusion policy) del ecosistema LeRobot | Difusión para acciones | No disponible | No disponible | No disponible |
| Modelos VLA (vision-language-action) tipo SmolVLA o pi0 | VLA, condicionados por lenguaje | No disponible | No disponible | No disponible |

Nota metodológica: este checkpoint está especializado en un único robot, una única tarea y una única disposición de cámaras, mientras que las familias VLA están diseñadas para generalizar entre tareas y robots a cambio de un coste computacional y de datos mucho mayor. Cualquier comparación numérica exige consultar las fichas y evaluaciones de cada modelo, que no forman parte de la información aquí disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no existe ninguna medición de tasa de éxito en robot real, por lo que no hay evidencia de que la política funcione de forma fiable, ni siquiera en la tarea para la que fue entrenada.
- Entrenamiento muy corto: 200 pasos con batch 8 equivalen a 1.600 muestras sobre 44.553 fotogramas, aproximadamente el 3,6 % de una época. Es plausible un infraentrenamiento severo, aunque esto no puede confirmarse sin métricas de pérdida.
- Especialización extrema: una sola tarea, un solo tipo de robot (`so_follower`) y una sola configuración de sensores. Cambiar el robot, las cámaras, su resolución, su montaje o la disposición de la mesa invalida la política.
- Sensibilidad esperable a condiciones fuera de distribución: posiciones iniciales del cubo no vistas, cambios de iluminación, fondos distintos o presencia de distractores pueden degradar el comportamiento. No se documenta ninguna estrategia de aumento de datos ni evaluación de robustez.
- Riesgo de error compuesto: al ser una política de imitación, un error de acción temprano puede arrastrar al robot a estados no cubiertos por las demostraciones, sin mecanismo de recuperación ni de detección de fallo.
- Cero adopción: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros; debe tratarse como un artefacto experimental.
- Sin información sobre sesgos del dataset: se desconoce la diversidad de las demostraciones, el operador o los sesgos de posicionamiento del objeto, así como si el dataset contiene episodios fallidos.
- Ambigüedad en el nombre: el sufijo `100` probablemente alude a los 100 episodios del dataset, no al horizonte de acciones, pero no se confirma en la documentación.
- Licencia: los pesos se publican bajo Apache-2.0, permisiva para uso comercial, pero la licencia del dataset y de las dependencias de LeRobot debe verificarse por separado antes de un despliegue comercial.
- Repositorio de 1,2 GB para 51,7 M de parámetros: conviene revisar el contenido antes de descargarlo en entornos con almacenamiento limitado.
- Fechas de los metadatos: la creación del repositorio figura como 26 de septiembre de 2026, fecha posterior a la del dataset de nombre similar; conviene verificar la coherencia temporal al citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fabyo04/act_so101_cube_100
- Dataset de entrenamiento: https://huggingface.co/datasets/Fabyo04/so101_cube_demo_0_20260926_155239
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Fabyo04/so101_cube_demo_0_20260926_155239
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX incluido en la model card): Cadene, R. et al., «LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch», 2024.
