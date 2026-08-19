# hoborific/Schattenblume-31B-W8A16-FP8

## Resumen

Schattenblume-31B-W8A16-FP8 es una versión cuantizada del modelo multimodal Nimbz/Schattenblume-31B, publicada por el usuario hoborific. El modelo base, del que no se proporcionan detalles técnicos en la ficha, parece estar basado en la familia Gemma 4 (según las etiquetas) y está diseñado para tareas de image-text-to-text, es decir, entrada multimodal de imágenes y texto con generación de texto. Esta versión cuantizada reduce el peso de las capas lineales a precisión FP8 (float8_e4m3fn) manteniendo las activaciones en bf16/fp16, lo que permite reducir el uso de memoria y acelerar la inferencia en hardware compatible.

La cuantización se realizó offline con la librería compressed-tensors de Neural Magic, aplicando escalas simétricas por canal de salida y un proceso de optimización por búsqueda de clip para minimizar el error de cuantización. Solo se cuantizan los pesos de las capas lineales 2D (atención y MLP); embeddings, normas, lm_head, routers y la torre de visión permanecen en bf16. El modelo está pensado para ser desplegado con vLLM en plataformas Intel XPU y NVIDIA CUDA (SM75+), y no es compatible con ROCm, CPU o TPU.

Con 31.273 millones de parámetros y un tamaño de repositorio de 33.3 GB, esta cuantización ofrece una alternativa más ligera al modelo original, aunque no se dispone de información sobre su rendimiento real ni sobre las capacidades específicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Nimbz/Schattenblume-31B, aparentemente basado en Gemma 4, multimodal image-text-to-text) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) con escalas simétricas por canal de salida; activaciones en bf16/fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Nimbz/Schattenblume-31B. Según las etiquetas, se trata de un modelo de tipo Gemma 4 con pipeline image-text-to-text, lo que sugiere una arquitectura transformer multimodal con un codificador de visión y un decodificador de lenguaje, pero no se confirma ningún detalle concreto.

En cuanto a la cuantización, el proceso se realizó offline con compressed-tensors. Cada fila de salida de las capas lineales 2D (attention q/k/v/o y MLP gate/up/down) recibe una escala propia calculada a partir de `amax / 448`, refinada mediante una búsqueda de clip por error cuadrático medio sobre aproximadamente 9 fracciones de clip (0.8–1.0× amax). Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al más cercano y saturación. Las capas no cuantizadas (embeddings, normas, lm_head, routers/experts y torre de visión) se mantienen en bf16 y se listan en la lista `ignore` del checkpoint para que vLLM no las toque.

No hay información sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- La pipeline declarada es `image-text-to-text`, por lo que se espera que el modelo base acepte imágenes y texto como entrada y genere texto como salida.
- Las etiquetas incluyen `conversational`, lo que sugiere capacidad para mantener diálogos multi-turno.
- No se dispone de información detallada sobre capacidades específicas como tool calling, agentes, razonamiento matemático, generación de código, etc. Estas dependen del modelo base, cuyas características no se han documentado en la ficha.
- La cuantización no altera las capacidades funcionales del modelo, solo reduce la precisión numérica de los pesos, por lo que las capacidades del modelo cuantizado son, en principio, las mismas que las del modelo original.

## Casos de uso

No se dispone de información suficiente sobre el modelo base para enumerar casos de uso concretos y verificables. Los casos de uso dependerán de las capacidades reales de Nimbz/Schattenblume-31B, que no se documentan en esta ficha. Se recomienda consultar la model card del modelo base para obtener detalles sobre sus aplicaciones prácticas. No obstante, por su naturaleza multimodal y su tamaño, podría emplearse en tareas como:

- Descripción de imágenes y generación de texto a partir de contenido visual.
- Asistentes conversacionales con entrada multimodal.
- Sistemas de pregunta-respuesta sobre documentos con figuras o diagramas.
- Preprocesamiento de datos visuales para pipelines de análisis.

Estas aplicaciones son hipotéticas y no están confirmadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado ni para su modelo base.

## Requisitos de hardware

- El tamaño del repositorio es de 33.3 GB, por lo que para cargar el modelo en memoria se necesitan al menos 34 GB de VRAM (estimación basada en el tamaño de los pesos, sin contar overhead de activaciones y KV cache).
- Dado que la cuantización es FP8 (1 byte por parámetro) para la mayoría de los pesos, pero con partes en bf16 (2 bytes por parámetro), el consumo real de VRAM puede estar entre 34 y 40 GB, dependiendo de la implementación y del tamaño del lote.
- Se recomienda una GPU con al menos 40 GB de VRAM para inferencia cómoda, como NVIDIA A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB, aunque puede quedarse corta para contextos largos).
- El modelo está diseñado para ejecutarse con vLLM en plataformas Intel XPU (kernel `XPUW8A16FP8LinearKernel`) y NVIDIA CUDA (SM75+ o Turing y posteriores), usando `HummingFP8ScaledMMLinearKernel` si el paquete `humming` está instalado, o `MarlinFP8ScaledMMLinearKernel` en caso contrario.
- No es compatible con ROCm, CPU o TPU en vLLM: la carga fallará con un error de "no kernel".
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre otros modelos cuantizados comparables, ni sobre el rendimiento relativo frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida de precisión respecto al modelo original en bf16, que puede afectar a tareas sensibles a pequeños cambios numéricos (por ejemplo, matemáticas o razonamiento lógico de alta precisión).
- El soporte de vLLM está limitado a Intel XPU y NVIDIA CUDA (SM75+). No funcionará en ROCm, CPU o TPU.
- No se dispone de información sobre la licencia del modelo, lo que impide conocer las restricciones de uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, ya que no hay información sobre el modelo base.
- El modelo base no está documentado en esta ficha; se desconoce su longitud de contexto, idiomas soportados y datos de entrenamiento.
- Al ser una cuantización, se recomienda validar el comportamiento del modelo en el caso de uso concreto antes de desplegarlo en producción.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/hoborific/Schattenblume-31B-W8A16-FP8
- Modelo base: https://huggingface.co/Nimbz/Schattenblume-31B
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
