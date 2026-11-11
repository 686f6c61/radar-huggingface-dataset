# scottlowry/Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp es una cuantización mixta del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en formato MLX (Apple Silicon) generado con la herramienta oQ de oMLX v0.7.4.dev1, que aplica precisión mixta por tensor en lugar de una cuantización uniforme. El resultado es un checkpoint de 27.781 millones de parámetros lógicos que ocupa 17.172 GiB en disco, con una media efectiva de 5.310 bits por peso.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización (oQ, precisión mixta con grupos de 64) que permite conservar capas sensibles en 8 o 16 bits mientras el grueso del modelo va en 4 bits; por otro, el checkpoint incluye una cabeza MTP (multi-token prediction) de 0.425B parámetros y un componente de visión de 0.461B parámetros, lo que sugiere un modelo multimodal con decodificación especulativa. El repo acumula 1033 descargas y 6 likes, y fue actualizado el 2026-11-11 tras una recuantización.

El modelo base pertenece a la familia Qwen3.8 según el nombre, y la arquitectura declarada en los tags es qwen3_5. La información pública disponible es limitada: no hay model card del modelo original, no se especifican benchmarks, licencia ni idiomas. Todo lo que sigue se basa en los metadatos del repo y en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag qwen3_5), con cabeza MTP y torre de visión |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 4/5/6/8-bit grupo 64, más FP16 y FP32 parciales; media 5.310 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Libreria | mlx |
| Tamano del repo | 54.2 GB (checkpoint cuantizado: 17.172 GiB) |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen (tag qwen3_5) con 27.781B parámetros lógicos. El checkpoint incorpora tres componentes diferenciados: el modelo de lenguaje (26.896B parámetros, 15.155 GiB en almacenamiento), una torre de visión (0.461B parámetros, 1.716 GiB) y una cabeza MTP de predicción multi-token (0.425B parámetros, 0.301 GiB). La presencia de MTP es técnicamente relevante porque habilita decodificación especulativa nativa: la cabeza predice varios tokens por paso y el modelo verifica después, lo que puede aumentar el throughput en inferencia autoregresiva.

No se dispone de información sobre el proceso de entrenamiento del modelo base: no se documentan tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La innovación técnica documentada en este repo es exclusivamente la cuantización: oQ asigna precisión por tensor según sensibilidad, con el 69.807% de los pesos en 4-bit (4.50 bits efectivos), el 23.680% en 5-bit (5.50 bits), el 4.615% en 6-bit (6.50 bits), un 0.041% en 8-bit y un 1.856% restante en FP16/FP32 (principalmente 0.461B parámetros en FP32, probablemente normas y capas de visión). Los grupos de cuantización son de 64 pesos.

## Capacidades

- Generación de texto y razonamiento: modelo base de 27.781B parámetros, adecuado para tareas de razonamiento multi-paso.
- Procesamiento de visión: incluye torre de visión de 0.461B parámetros, por lo que se espera soporte de entrada de imágenes (no confirmado en documentación del autor).
- Predicción multi-token (MTP): cabeza dedicada de 0.425B parámetros que permite decodificación especulativa y mayor throughput.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la ventana de contexto es desconocida.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Cuantización mixta: el checkpoint conserva capas sensibles en mayor precisión, lo que reduce la degradación típica de las cuantizaciones uniformes de 4 bits.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 17.172 GiB, por lo que encaja en Macs con 24 GB o 32 GB de memoria unificada. Es el caso de uso principal y el único documentado de forma explícita por el autor.
- Prototipado de aplicaciones multimodales en local: la torre de visión integrada permite experimentar con tareas imagen-texto sin depender de APIs, siempre que se valide el soporte real de visión en la librería MLX.
- Evaluación de cuantización mixta: útil para investigadores que quieran medir la degradación de oQ frente a una cuantización uniforme de 4 bits sobre el mismo modelo base, comparando perplejidad y calidad de generación.
- Generación de código asistida en estación de trabajo: un modelo de 27B en 4-5 bits efectivos es viable para autocompletado y refactorización en local, con la ventaja de privacidad de datos.
- Servicio de chat con contexto largo: si el modelo base soporta ventanas amplias (no confirmado), el checkpoint puede servir conversaciones multi-turno en un servidor Mac con memoria unificada suficiente.
- Aceleración de pipelines de generación: la cabeza MTP permite implementar decodificación especulativa para reducir la latencia por token en despliegues MLX, útil en aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la distribución de bits y el tamaño del checkpoint, no métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint pesa 17.172 GiB; se recomienda un mínimo de 24 GB de memoria unificada en Apple Silicon para dejar margen a KV cache y overhead de la librería MLX.
- GPUs Apple: cualquier chip M-series con 24 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). Con 32 GB o 64 GB se puede aumentar el contexto y el batch.
- GPUs NVIDIA: el formato es MLX, no compatible directamente con CUDA. Para A100, H100 o RTX 4090 habría que reconvertir el modelo base a GGUF o safetensors estándar.
- Consumer GPU NVIDIA: no aplicable en este formato; un modelo de 27B en 4-5 bits efectivos cabría en una RTX 4090 de 24 GB si se convirtiera a otro runtime.
- Opciones de despliegue: MLX (mlx-lm) es el runtime nativo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para mejorar el throughput mediante decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp | 27.781B | no disponible | oQ mixta 5.310 bits/peso | MLX safetensors | no disponible |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27.781B (presumible) | no disponible | sin cuantizar | no disponible | no disponible |
| Cuantizaciones MLX estándar de 27B (4-bit uniforme) | ~27B | depende del base | 4 bits uniformes | MLX safetensors | depende del base |

La comparativa con alternativas de la misma categoría no está disponible: no se conocen otros checkpoints oQ del mismo modelo base ni se documentan resultados que permitan comparar calidad frente a cuantizaciones uniformes de 4 bits.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Hay que consultar la licencia del modelo base ukisai/Swift-1.5-Qwen3.8-27b antes de cualquier despliegue en producción.
- Modelo derivado: la calidad final depende del modelo base, del que no hay model card ni benchmarks publicados en la información disponible.
- Cuantización con pérdida: aunque oQ es mixta, el 69.807% de los pesos está en 4 bits; se espera cierta degradación frente al checkpoint original, no cuantificada por el autor.
- Formato exclusivo MLX: no es portable a CUDA sin reconversión; limita el despliegue a hardware Apple.
- Idiomas y contexto desconocidos: no se puede garantizar soporte multilingüe ni planificar aplicaciones que dependan de ventanas de contexto largas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineamiento del base no se puede estimar su magnitud.
- Sesgos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Fecha de creación futura (2026-10-07): los metadatos indican una fecha posterior a la actual, lo que sugiere posibles inconsistencias en el registro del repo; conviene verificar la integridad de los archivos antes de usarlos.
- Recuantización reciente: el autor advierte que quienes descargaron antes del 2026-11-11 deben volver a descargar; versiones antiguas pueden tener distribución de bits distinta.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
