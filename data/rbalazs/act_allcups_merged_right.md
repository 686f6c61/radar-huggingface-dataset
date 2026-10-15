# rbalazs/act_allcups_merged_right

## Resumen

`rbalazs/act_allcups_merged_right` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705 y referenciado en la propia model card. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un brazo `so_follower` (vector de 6 dimensiones) junto con dos flujos de imagen de 480x640 (`front` e `iphone`) y produce un vector de acción de 6 dimensiones.

El modelo lo publica el usuario `rbalazs` en Hugging Face usando la librería LeRobot (versión 0.6.2) y la licencia Apache 2.0. Cuenta con 51.668.614 parámetros en formato safetensors y un repositorio de 6,2 GB. Está especializado en tres tareas de pick-and-place sobre vasos: coger el vaso central, el derecho o el izquierdo y dejarlo en el suelo de la mesa.

Su relevancia es la de un artefacto de investigación reproducible: política pequeña, entrenada con 239 episodios y 72.886 fotogramas a 30 FPS, con configuración de entrenamiento documentada (50.000 pasos, batch 8, AdamW, LR 1e-5, semilla 1000). No incluye resultados de evaluación en el repositorio ni métricas publicadas, y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder para imitación visomotora que predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es una ventana de contexto de texto. El horizonte relevante es el tamaño de chunk de acciones, no documentado en la model card |
| Tipos de cuantizacion | no disponible; se publican pesos en safetensors sin cuantizaciones documentadas (no hay GGUF, INT8 ni INT4) |
| Idiomas soportados | no aplica / no disponible; política visomotora sin entrada de lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Robot objetivo | `so_follower` |
| Camaras | `front`, `iphone` |
| Entrada: estado | `observation.state`, shape `(6,)`, tipo STATE |
| Entrada: vision | `observation.images.front` y `observation.images.iphone`, shape `(3, 480, 640)`, tipo VISUAL |
| Salida | `action`, shape `(6,)`, tipo ACTION |
| Dataset de entrenamiento | `rbalazs/AllCupsTrimMerged` |
| Tamano del repositorio | 6,2 GB |
| Fecha de creacion / actualizacion | 2026-10-15 (misma fecha) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El método ACT se describe en el paper referenciado (arXiv:2304.13705) como una técnica de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice chunks de acciones a partir de datos de teleoperación. Según ese paper, la arquitectura emplea un transformer encoder-decoder con un componente de tipo CVAE (autoencoder variacional condicional) y un backbone convolucional para las observaciones visuales. En esta política concreta, la model card no detalla el tamaño del chunk, la profundidad del transformer ni la configuración exacta del backbone visual, por lo que esos datos se consideran no disponibles.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `rbalazs/AllCupsTrimMerged`: 239 episodios, 72.886 fotogramas a 30 FPS y tres tareas ("Pick up the middle cup and put it down", "Pick up the right cup and put it down", "Pick up the left cup and put it down"). La configuración documentada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Es aprendizaje por imitación supervisada (behavior cloning), sin RLHF ni DPO, que no aplican a este dominio.

## Capacidades

- Control visomotor de pick-and-place sobre vasos: recoger el vaso central, el derecho o el izquierdo y depositarlo.
- Fusión de dos cámaras simultáneas (`front` e `iphone`) junto con el estado articular como entrada.
- Predicción de chunks de acciones, en lugar de acciones individuales, lo que reduce el error de compounding típico del behavior cloning.
- Salida de un vector de acción de 6 dimensiones compatible con el robot `so_follower`.
- Ejecución autónoma de la política mediante el flujo `lerobot-rollout --strategy.type=base`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso simbólico; su "razonamiento" es puramente reactivo y visomotor.
- No dispone de capacidades multilingües, de visión general (VQA, detección abierta) ni de generación de texto.
- No hay evidencia documentada de modo de pensamiento, audio ni ninguna capacidad multimodal más allá de las dos cámaras de entrada.

## Casos de uso

- Pick-and-place en laboratorio de robótica: desplegar la política sobre un brazo SO-100/SO-101 con las dos cámaras `front` e `iphone` para recoger vasos y dejarlos en una posición fija, usando `lerobot-rollout` con la tarea indicada.
- Línea de clasificación sencilla de objetos: integrada en una celda con un brazo `so_follower`, permite separar objetos ligeros colocados en tres posiciones conocidas (izquierda, centro, derecha).
- Base de comparación para investigación en imitación: sirve como referencia ACT entrenada sobre un dataset pequeño para contrastar con Diffusion Policy u otras políticas de LeRobot usando el mismo dataset y el mismo robot.
- Validación de pipeline de teleoperación a autonomía: tras grabar episodios con teleoperación, esta política permite comprobar si el bucle completo (grabación, entrenamiento con `lerobot-train`, rollout) funciona antes de escalar a datasets mayores.
- Evaluación de robustez de hardware: al ser una política de 51,7 M de parámetros, se puede ejecutar repetidamente para medir estabilidad del control a 30 FPS, latencia del bucle y comportamiento ante cambios de iluminación o de posición de cámara.
- Docencia y formación: ejemplo completo y ligero de un pipeline de imitation learning extremo a extremo con LeRobot, útil para explicar chunking de acciones, fusión de cámaras y evaluación en robot real.
- Generación de datos de referencia: las ejecuciones autónomas pueden servir como punto de partida para comparar con nuevas políticas entrenadas sobre `AllCupsTrimMerged` ampliado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet", de modo que no hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas para esta política.

## Requisitos de hardware

- Peso de los parámetros: 51,7 M de parámetros equivalen aproximadamente a 207 MB en FP32 y 103 MB en FP16 (estimación a partir del conteo de parámetros; no confirmada por el autor).
- El repositorio completo ocupa 6,2 GB, lo que sugiere que incluye checkpoints adicionales, estados del optimizador u otros artefactos de entrenamiento además de los pesos finales.
- VRAM estimada para inferencia: por debajo de 4 GB en FP16 considerando los pesos y las activaciones de dos flujos de imagen de 480x640; valor estimado, no publicado por el autor.
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB de VRAM es suficiente para inferencia; una RTX 3060, RTX 4070 o RTX 4090 es más que suficiente. También cabría en GPUs de gama de entrada con 6-8 GB.
- Ejecución en CPU: técnicamente posible por el tamaño del modelo, pero el bucle de control a 30 FPS con dos cámaras hace poco recomendable su uso en producción sin GPU.
- Opciones de despliegue: `lerobot-rollout` para ejecución en robot real y `lerobot-train` para reentrenamiento, según la documentación citada. No hay soporte de vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje ni se distribuye en GGUF.
- Latencia y throughput medidos: no disponibles. El requisito implícito del dataset es de 30 FPS (33 ms por fotograma); el chunking de acciones de ACT puede relajar esa exigencia, pero el valor real no está documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| `rbalazs/act_allcups_merged_right` (este) | ACT, imitación visomotora | 51.668.614 | apache-2.0 | Hugging Face, librería lerobot, 0 descargas |
| Diffusion Policy (políticas de LeRobot) | Imitación visomotora basada en difusión | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | implementada en LeRobot |
| SmolVLA (políticas de LeRobot) | VLA con backbone de visión-lenguaje | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | implementado en LeRobot |
| Otras políticas ACT de LeRobot sobre datasets distintos | ACT, imitación visomotora | variable, no disponible | habitualmente apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no admite instrucciones en lenguaje natural. El parámetro `--task` de la CLI se usa para identificar la tarea, no como condicionamiento lingüístico documentado.
- No hay ningún resultado de evaluación publicado: se desconoce la tasa de éxito real en las tres tareas, así como su robustez ante cambios de posición, iluminación o presencia de distracciones.
- Sesgo de dominio: entrenada exclusivamente sobre 239 episodios de vasos con el robot `so_follower` y las cámaras `front` e `iphone`, por lo que generalizará mal a otros objetos, otras cámaras, otra iluminación u otro robot, aunque sea del mismo modelo.
- No hay riesgo de alucinación lingüística, pero sí riesgo de ejecución de acciones incorrectas sin señal de confianza asociada, algo crítico en entornos físicos.
- Los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`front`, `iphone`); un desajuste provoca fallo de inferencia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías y sin que el autor asuma responsabilidad sobre el comportamiento del robot.
- El modelo tiene 0 descargas y 0 likes, por lo que no cuenta con validación por parte de la comunidad.
- Debe verificarse el estado de los repositorios de LeRobot y de sus dependencias, ya que la política se entrenó con la versión 0.6.2 y cambios de formato podrían afectar a la carga de los pesos.
- No hay información sobre el tamaño de chunk de acciones ni sobre el horizonte de predicción, lo que dificulta ajustar el bucle de control a la frecuencia real de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbalazs/act_allcups_merged_right
- Dataset de entrenamiento: https://huggingface.co/datasets/rbalazs/AllCupsTrimMerged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbalazs/AllCupsTrimMerged
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
