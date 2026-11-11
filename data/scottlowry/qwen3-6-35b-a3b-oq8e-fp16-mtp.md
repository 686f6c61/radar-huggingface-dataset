# scottlowry/Qwen3.6-35B-A3B-oQ8e-fp16-mtp

## Resumen

Qwen3.6-35B-A3B-oQ8e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. El modelo base es un transformer de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, con 35.952 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B del nombre). La versión aquí descrita no es un modelo nuevo, sino un checkpoint cuantizado en formato MLX pensado para ejecución en hardware Apple Silicon.

La cuantización se ha realizado con la herramienta oQ de oMLX (versión v0.7.3.dev2), aplicando precisión mixta: la mayor parte de los pesos (94,945 %) se almacena en 8 bits afín con grupo de 64, una fracción menor en 8 bits con grupo de 128, y pequeños bloques en FP16 y FP32. El resultado es un peso medio efectivo de 8,789 bits por peso, lo que reduce el checkpoint a 36,785 GiB de almacenamiento lógico (39,498 GB) frente a los aproximadamente 72 GB que ocuparía en BF16.

El interés de esta ficha radica en que permite ejecutar localmente un MoE de 35B con capacidades multimodales (incluye torre de visión de 0,447B) y cabecera MTP (multi-token prediction) de 0,845B en equipos con memoria unificada de 48-64 GB, algo inviable con el modelo en precisión completa. Es relevante para desarrolladores que quieran evaluar Qwen3.6 en Mac sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con torre de visión y cabecera MTP; tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | aproximadamente 3B (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín grupo 64 (94,945 %), 8-bit afín grupo 128 (3,727 %), FP16 (0,086 %), FP32 (1,242 %); media efectiva 8,789 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts, tal como indica el tag `qwen3_5_moe` y la nomenclatura A3B (aproximadamente 3B activos de 35B totales). El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34,661B parámetros lógicos), una torre de visión (0,447B) y una cabecera MTP o multi-token prediction (0,845B). La presencia de la cabecera MTP sugiere soporte para decodificación especulativa o predicción de múltiples tokens por paso, una técnica que acelera la generación autoregresiva.

Respecto al entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), no se dispone de información en la documentación proporcionada. La model card de esta versión cuantizada se limita a describir el proceso de cuantización con oQ (oMLX v0.7.3.dev2) y la distribución de bits. Cabe destacar que el autor actualizó el checkpoint el 2026-10-25 tras una recuantización, por lo que versiones anteriores descargadas pueden diferir en calidad.

## Capacidades

- Generación de texto y razonamiento: al heredar el modelo base Qwen3.6, se espera capacidad conversacional y de razonamiento multi-paso, aunque no se detallan métricas en la información disponible.
- Procesamiento de visión: incluye torre de visión de 0,447B parámetros, lo que habilita tareas de imagen a texto (descripción, VQA, OCR) siempre que la implementación MLX lo soporte.
- Predicción multi-token (MTP): la cabecera dedicada de 0,845B permite decodificación especulativa, potencialmente con mayor throughput que un modelo sin MTP.
- Ejecución local en Apple Silicon: al estar en formato MLX y cuantizado a ~8,8 bits/peso, está pensado para `mlx-lm` y hardware con memoria unificada.
- Soporte de tool calling y agentes: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la documentación proporcionada.

## Casos de uso

- Inferencia local en Mac Studio o MacBook Pro con 64 GB de memoria unificada: el checkpoint ocupa 36,785 GiB, por lo que cabe en equipos de 48-64 GB y permite ejecutar un MoE de 35B sin GPU dedicada, usando `mlx-lm` como runtime.
- Prototipado de asistentes multimodales en local: la torre de visión permite experimentar con pipelines imagen-texto sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: al ser una cuantización mixta de 8,789 bits/peso, sirve para medir la degradación de calidad frente al modelo base BF16 en tareas de razonamiento y generación.
- Aceleración de generación con MTP: la cabecera de predicción multi-token puede aprovecharse para reducir latencia en aplicaciones interactivas (chat, autocompletado) en hardware Apple.
- Investigación en eficiencia de MoE: permite estudiar el comportamiento de un modelo con ~3B activos sobre 35B totales en hardware de consumo, midiendo throughput y uso de memoria.
- Desarrollo de aplicaciones de escritorio para macOS: al integrarse con MLX, se puede embeber en apps nativas que requieran inferencia offline sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 36,785 GiB solo para pesos; se recomienda al menos 48 GB de memoria unificada para dejar margen a KV cache y activaciones, y 64 GB para contextos largos.
- GPU recomendadas: Apple Silicon con memoria unificada (M2 Ultra, M3 Max, M4 Max/Ultra); no es compatible con CUDA de forma nativa al estar en formato MLX.
- ¿Cabe en consumer GPU? No en GPUs NVIDIA de consumo de 24 GB; sí en equipos Apple de gama alta con 48-64 GB.
- Opciones de despliegue: `mlx-lm` (runtime nativo), oMLX para gestión de cuantizaciones; no compatible directamente con vLLM, llama.cpp o TGI sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ8e-fp16-mtp (este) | 35,952B totales / ~3B activos | no disponible | 8-bit mixto MLX (8,789 bits/peso) | no disponible | Hugging Face, 95 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B totales / ~3B activos | no disponible | BF16 original | no disponible | Hugging Face |
| Otras cuantizaciones GGUF del mismo base | 35,952B totales | no disponible | 4-8 bit GGUF | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir información falsa con aparente seguridad; no se han publicado evaluaciones específicas para esta cuantización.
- Degradación por cuantización: aunque la media es 8,789 bits/peso, el 94,945 % de los pesos está en 8-bit grupo 64, lo que puede introducir pérdida de precisión frente al BF16 original, especialmente en tareas sensibles.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base Qwen/Qwen3.6-35B-A3B antes de desplegar.
- Compatibilidad limitada: formato MLX exclusivo para Apple Silicon; no se puede usar en CUDA, ROCm ni CPU convencional sin reconversión.
- Idiomas no documentados: se desconoce el soporte multilingüe real de esta versión.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada en esta cuantización.
- Actualización del checkpoint: el autor reemplazó los pesos el 2026-10-25; copias anteriores pueden tener distinta calidad, por lo que conviene verificar la fecha de descarga.
- Sesgos: no se han documentado sesgos específicos, pero hereda los del modelo base, no evaluados aquí.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
