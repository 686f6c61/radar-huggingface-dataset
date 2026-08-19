# hoborific/Gemma-4-Dark-Thoughts-31B-W8A16-FP8

## Resumen

Gemma-4-Dark-Thoughts-31B-W8A16-FP8 es una versión cuantizada del modelo base Ateron/Gemma-4-Dark-Thoughts-31B, publicada por el usuario hoborific en HuggingFace. Se trata de un modelo de 31.273 millones de parámetros con pipeline image-text-to-text, lo que sugiere capacidades multimodales (visión y texto), aunque no se han publicado detalles sobre su arquitectura interna ni su entrenamiento. La cuantización emplea el formato W8A16 FP8, con pesos en float8_e4m3fn y activaciones en bf16/fp16, aplicada offline mediante la librería compressed-tensors de Neural Magic.

El interés de esta versión radica en su optimización para inferencia eficiente en vLLM, especialmente en plataformas Intel XPU y NVIDIA CUDA (Turing o superior). Al reducir el peso de los parámetros a 8 bits, se logra un menor uso de VRAM y mayor throughput en comparación con el modelo original en bf16, manteniendo una precisión razonable gracias a un esquema de escalado por canal y búsqueda de clip por MSE. No obstante, la ficha carece de información sobre el modelo base, sus capacidades específicas, licencia o benchmarks, por lo que esta ficha se limita a los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal, basado en Gemma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La información proporcionada se centra exclusivamente en el proceso de cuantización, no en el entrenamiento del modelo base. Según la model card, la cuantización se realizó offline con la librería compressed-tensors en formato `float-quantized`. Para cada capa lineal, se asigna una escala por canal de salida, calculada inicialmente como `amax / 448` y refinada mediante una búsqueda de clip por MSE sobre aproximadamente 9 fracciones de clip (0.8–1.0× amax), seleccionando la escala con menor error. Los pesos se cuantizan con redondeo al más cercano y saturación. Solo se cuantizan las proyecciones lineales 2D (atención q/k/v/o y MLP gate/up/down); embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16 y se listan en la lista `ignore` del checkpoint para que vLLM no los toque.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla la arquitectura del modelo base (número de capas, heads, etc.), aunque por el nombre y el tamaño podría tratarse de un transformer denso multimodal.

## Capacidades

No se han publicado capacidades específicas en la información disponible. Sin embargo, al tratarse de un modelo con pipeline `image-text-to-text`, se puede inferir que es capaz de procesar entradas de imagen y texto para generar texto, lo que implicaría capacidades de visión y lenguaje. No obstante, no se confirma si soporta tool calling, razonamiento multi-paso, ni qué idiomas maneja. La cuantización no altera las capacidades funcionales del modelo original, solo su representación numérica, por lo que las capacidades del modelo base Ateron/Gemma-4-Dark-Thoughts-31B serían las mismas, pero no están documentadas en esta ficha.

## Casos de uso

Dado que no se dispone de información sobre las capacidades concretas del modelo base, los casos de uso se plantean como hipótesis razonables basadas en el tamaño y la naturaleza multimodal, pero deben validarse con el modelo original:

- Inferencia multimodal en producción: al ser image-text-to-text, podría emplearse en tareas de descripción de imágenes, respuesta a preguntas visuales o generación de texto a partir de imágenes, siempre que el modelo base tenga esas capacidades.
- Despliegue en entornos con VRAM limitada: la cuantización FP8 reduce el uso de memoria a aproximadamente 31 GB para los pesos, lo que permite ejecutar el modelo en GPUs de 40 GB o más, como A100 40GB o RTX A6000, en lugar de requerir 60+ GB en bf16.
- Integración con vLLM en Intel XPU: el kernel `XPUW8A16FP8LinearKernel` está diseñado específicamente para aceleradores Intel, lo que habilita despliegues en hardware no NVIDIA.
- Fine-tuning o adaptación posterior: aunque es una versión cuantizada, podría usarse como punto de partida para tareas específicas si se requiere menor huella de memoria, aunque se recomienda usar el modelo original para entrenamiento.
- Evaluación de rendimiento de cuantización: sirve para comparar la degradación de precisión entre FP8 y bf16 en tareas multimodales, útil para investigadores que estudian técnicas de compresión.
- Prototipado rápido en entornos de desarrollo: al ocupar menos memoria, permite iterar más rápido en máquinas con GPUs de gama media, como RTX 4090 (24 GB) si se usa cuantización adicional o se limita el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB para los pesos en FP8 (31.273.088.876 parámetros × 1 byte), más overhead de activaciones, caché KV y buffers, lo que sitúa el requisito práctico en torno a 40-50 GB según la longitud de contexto.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, RTX A6000 48GB, o GPUs con soporte FP8 nativo (Hopper, Ada Lovelace). También compatible con Intel XPU (no especificado el modelo concreto).
- En consumer GPU: no cabe en GPUs de 24 GB (RTX 4090) sin cuantización adicional o técnicas de offloading; se necesitaría al menos 40 GB de VRAM.
- Opciones de despliegue: vLLM es el runtime principal, con soporte para NVIDIA CUDA (SM75+ mediante kernels `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel`) e Intel XPU (`XPUW8A16FP8LinearKernel`). No compatible con ROCm, CPU ni TPU en vLLM.
- Latencia y throughput: no disponibles, dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (multimodales de ~31B cuantizados). No se puede establecer una comparativa fiable sin datos del modelo base ni de alternativas.

## Limitaciones y advertencias

- La cuantización FP8 introduce pérdida de precisión respecto al modelo original en bf16, aunque el esquema de escalado por canal y clip por MSE busca minimizarla. Para tareas sensibles a la exactitud numérica, se recomienda validar el rendimiento.
- No se conocen los sesgos del modelo base ni su comportamiento en dominios específicos, ya que no se ha publicado documentación al respecto.
- Riesgo de alucinación: inherente a los modelos generativos, pero no cuantificado para esta versión.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se debe contactar con el autor o consultar el modelo base.
- Incompatibilidad con ciertos backends: vLLM no soporta W8A16-FP8 en ROCm, CPU o TPU, lo que limita el despliegue a NVIDIA CUDA e Intel XPU.
- El modelo es una cuantización offline; no se recomienda fine-tuning directo sobre los pesos cuantizados, ya que podría degradar la calidad.

## Enlaces

- [HuggingFace - Gemma-4-Dark-Thoughts-31B-W8A16-FP8](https://huggingface.co/hoborific/Gemma-4-Dark-Thoughts-31B-W8A16-FP8)
- [Modelo base - Ateron/Gemma-4-Dark-Thoughts-31B](https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-31B)
- [compressed-tensors (GitHub)](https://github.com/neuralmagic/compressed-tensors)
