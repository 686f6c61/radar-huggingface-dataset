# maskjp/mtdit_plate_croissant_jointbase_fullframe

## Resumen

`maskjp/mtdit_plate_croissant_jointbase_fullframe` es un modelo de política robótica basado en el framework LeRobot, desarrollado por el investigador maskjp. Se trata de un Multi-Task Diffusion Transformer (MTDiT) entrenado para controlar un brazo robótico en un espacio de acción de 10 dimensiones (articulaciones + base) sobre dos tareas: manipular un plato y un croissant. El modelo recibe imágenes de tres cámaras (izquierda, derecha y muñeca) a 480×640 píxeles y genera acciones mediante un proceso de difusión denoising (DDPM).

La particularidad de este checkpoint es que es la variante de campo de visión completo: la imagen completa se redimensiona a 224×224 sin ningún recorte, de modo que la política ve el 100% de cada fotograma. Esta decisión, sin embargo, produce el peor resultado de pérdida en validación de las diez ejecuciones publicadas por el autor, con un claro sobreajuste (overfit) de 3,0× respecto a la variante con recorte. El modelo se publica deliberadamente como contraparte de `maskjp/mtdit_plate_croissant_jointbase` (que solo ve el 16% central de la imagen) para estudiar el trade-off entre campo de visión y regularización en políticas de difusión.

El modelo tiene 443 millones de parámetros, está licenciado bajo Apache 2.0 y se distribuye en formato safetensors. No es un modelo de lenguaje ni de visión general; es específico para control robótico de bajo nivel con el pipeline de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (MTDiT) con DDPM |
| Parámetros totales | 443.020.554 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de 2 pasos y horizonte de 48 pasos) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo no lingüístico; condicionamiento con CLIP congelado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Multi-Task Diffusion Transformer implementada en LeRobot. Se trata de un transformer con 8 capas, dimensión oculta de 768 y 12 cabezas de atención, que procesa observaciones multimodales: un vector de estado de 10 dimensiones (joint + base) y tres imágenes (izquierda, derecha, muñeca) de 3×480×640 cada una, redimensionadas a 224×224. La salida es un vector de acción de 10 dimensiones. El condicionamiento por lenguaje se realiza mediante un codificador CLIP ViT-B/16 congelado con una proyección lineal entrenable, aunque en este entrenamiento concreto no se utilizó condicionamiento de tarea.

El entrenamiento se realizó con el objetivo de difusión DDPM con 100 timesteps de ruido, optimizador AdamW con tasa de aprendizaje 3e-4 y sin warmup, multiplicador de 0.1 para el codificador visual, y un total de 50.000 pasos con batch size 64 en una única GPU H100. El dataset usado es `l5vel-peng/base4-plate-croissant-eef-merged-v30`, con 93 episodios de entrenamiento y 5 de validación, separados a nivel de episodio y estratificados por tarea. El aumento de datos está desactivado; el único regularizador en el pipeline era el recorte aleatorio, que se elimina por completo en esta variante. Además, se aplica una distorsión de aspecto: las imágenes 3:4 (480×640) se comprimen a 1:1 (224×224), tanto en entrenamiento como en inferencia.

## Capacidades

- Control robótico de 10 grados de libertad (articulaciones + base) mediante generación de acciones por difusión.
- Percepción multi-cámara: procesa simultáneamente tres imágenes (izquierda, derecha y muñeca) a resolución completa.
- Campo de visión completo: detecta objetos en cualquier posición del frame, incluidos los bordes, a diferencia de la variante con recorte central.
- Condicionamiento por lenguaje mediante CLIP congelado (aunque no se usó en este entrenamiento).
- Generación de secuencias de acciones de 48 pasos de horizonte, con 40 pasos de ejecución y 2 pasos de observación.
- Integración nativa con el framework LeRobot para carga y despliegue en robots reales.

## Casos de uso

- **Manipulación de objetos en bandeja**: el modelo puede controlar un brazo robótico para recoger y colocar un plato o un croissant sobre una superficie, siempre que los objetos estén dentro del campo de visión completo de las cámaras.
- **Estudio de trade-off campo de visión vs. regularización**: es un banco de pruebas para investigar cómo el recorte aleatorio actúa como regularizador en políticas de difusión con pocos datos (93 episodios).
- **Robots con cámaras fijas y objetos en bordes**: si en la configuración física los objetos aparecen cerca del borde del frame, esta variante es la única que puede verlos, a costa de peor generalización.
- **Evaluación de políticas de difusión en hardware**: el autor sugiere que la pérdida de denoising es un proxy débil del éxito en rollout, por lo que este checkpoint permite probar en el robot real si el campo de visión completo compensa el sobreajuste.
- **Comparación de aumentos de datos**: junto con la variante noresize, permite aislar el efecto del recorte en el rendimiento de la política.
- **Aumento de datos con distorsión de aspecto**: el modelo aprende la geometría distorsionada (3:4 a 1:1) de forma consistente, lo que puede servir para estudiar la robustez de políticas ante deformaciones de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje ni de visión general. Los datos de rendimiento disponibles son los de pérdida de validación (eval_loss) del propio autor, que se resumen en la siguiente tabla comparativa con la variante sin recorte:

| Modelo | Campo de visión | Crop jitter | Mejor eval_loss | Final eval_loss (50K) | Tendencia |
|---|---|---|---|---|---|
| `mtdit_plate_croissant_jointbase_fullframe` (este) | 100% | ninguno | 0.0081 @ 5K | 0.0242 | sobreajuste 3.0× |
| `mtdit_plate_croissant_jointbase` (noresize) | 16% central | ±256 v / ±416 h | 0.0037 @ 45K | 0.0038 | aún mejorando |

El autor advierte explícitamente que la pérdida de denoising es un proxy débil del éxito en rollout en políticas de difusión, por lo que estos números no predicen directamente el rendimiento en el robot.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información publicada. Con 443M parámetros y tres imágenes de 224×224, se estima que cabe en GPUs de consumo con 8-12 GB de VRAM, pero no se ha verificado.
- **GPU recomendada**: entrenado en una sola H100 (80 GB). Para inferencia, una RTX 4090 (24 GB) o superior sería suficiente, aunque no se ha probado.
- **Cabe en GPU de consumo**: probablemente sí (RTX 3080/4090), dada la arquitectura compacta, pero no confirmado.
- **Opciones de despliegue**: el modelo se carga mediante la API de LeRobot (`MultiTaskDiTPolicy.from_pretrained`). No es compatible con vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje. Se puede desplegar en un robot real con el framework LeRobot o en simulación.
- **Latencia y throughput**: no disponible. El tiempo de inferencia depende del hardware y del número de pasos de denoising (100 timesteps en entrenamiento; en inferencia típicamente se usa un subconjunto, pero no se especifica).

## Comparativa con modelos similares

La comparativa natural es con la variante `mtdit_plate_croissant_jointbase` del mismo autor, ya que comparte arquitectura y dataset, diferenciándose solo en el preprocesado de imagen:

| Modelo | Parámetros | Campo de visión | eval_loss final | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mtdit_plate_croissant_jointbase_fullframe` | 443M | 100% | 0.0242 | Apache 2.0 | Hugging Face |
| `mtdit_plate_croissant_jointbase` | 443M | 16% central | 0.0038 | Apache 2.0 | Hugging Face |

No hay otros modelos comparables de la misma categoría (MTDiT para control robótico con LeRobot) en la información proporcionada. Para una comparativa más amplia habría que buscar otras políticas de difusión en LeRobot, pero no están disponibles en la documentación actual.

## Limitaciones y advertencias

- **Sobreajuste severo**: el modelo presenta un overfit de 3.0× en la pérdida de validación, lo que indica una generalización pobre a episodios no vistos.
- **Solo 93 episodios de entrenamiento**: el dataset es muy pequeño, lo que limita la robustez y la transferencia a nuevas configuraciones.
- **Distorsión de aspecto**: las imágenes 3:4 se comprimen a 1:1, lo que deforma la geometría del entorno; aunque se aplica de forma consistente, puede perjudicar la percepción de distancias reales.
- **No usa `eef_state` ni `action.eef`**: aunque la config los define, LeRobot vincula solo las claves `observation.state` y `action`, por lo que la información de end-effector se ignora.
- **Sin datos de rollout**: no hay evidencia de éxito en el robot real; la pérdida de denoising no predice el rendimiento físico.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo es experimental y no apto para producción sin validación exhaustiva.
- **Sin aumento de datos**: la ausencia de aumento de imagen (cropping, rotación, etc.) elimina la única regularización del pipeline, contribuyendo al sobreajuste.
- **Idiomas**: no aplica; el modelo no procesa texto de entrada (el condicionamiento CLIP está congelado y no se usó en este entrenamiento).

## Enlaces

- [Hugging Face - maskjp/mtdit_plate_croissant_jointbase_fullframe](https://huggingface.co/maskjp/mtdit_plate_croissant_jointbase_fullframe)
- [Hugging Face - maskjp/mtdit_plate_croissant_jointbase (variante noresize)](https://huggingface.co/maskjp/mtdit_plate_croissant_jointbase)
- [Dataset - l5vel-peng/base4-plate-croissant-eef-merged-v30](https://huggingface.co/datasets/l5vel-peng/base4-plate-croissant-eef-merged-v30)
- [GitHub - maskjp](https://github.com/maskjp)
