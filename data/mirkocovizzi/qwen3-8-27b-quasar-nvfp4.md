# MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4

## Resumen

Qwen3.8-27B-QUASAR-NVFP4 es una versión cuantizada a 4 bits (NVFP4) del modelo multimodal Qwen3.8-27B, desarrollada por MirkoCovizzi en colaboración con el equipo QUASAR-QAT. Se trata de un checkpoint de entrenamiento consciente de la cuantización (QAT) que utiliza el método QUASAR (Loss-Aware Reconstruction) para preservar la calidad del modelo original BF16 mientras se reduce drásticamente el tamaño. El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con capacidades de visión y texto, desarrollado por Alibaba, que destaca en tareas de razonamiento, codificación y flujos agénticos.

La relevancia de este checkpoint radica en que es la versión NVFP4 más compacta disponible de Qwen3.8-27B: cuantiza las 496 capas lineales (atención, gated delta-net y MLP) a W4A4, algo que normalmente degrada la calidad, pero que QUASAR consigue mantener cerca del original. Con un tamaño de 19,7 GB, permite ejecutar un modelo de 27B en GPUs con soporte FP4 (Blackwell) con una ventana de contexto de hasta 262 144 tokens, lo que lo hace atractivo para despliegues en producción con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8-27B) con atención y gated delta-net |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4) en todas las capas lineales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que combina atención estándar con una gated delta-net, una variante de atención lineal que reduce el coste computacional en secuencias largas. El checkpoint QUASAR se obtiene mediante destilación cuantización-consciente: se entrena una época completa con el modelo BF16 original congelado como profesor, utilizando una función de pérdida que reconstruye la salida del profesor de forma sensible a la pérdida (loss-aware reconstruction). El entrenamiento usa batch global de 32, learning rate de 1e-6 y 2446 pasos. A diferencia de la cuantización post-entrenamiento (PTQ), los pesos se aprenden bajo cuantización, lo que recupera parte de la calidad perdida. Todas las capas lineales, incluidas las de atención y delta-net, se cuantizan a NVFP4, algo que en otros enfoques PTQ se evita por colapso de calidad.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo "thinking" (razonamiento encadenado) y modo instructivo.
- Comprensión multimodal: procesa imágenes y texto, con capacidades de visión (image-text-to-text).
- Codificación y razonamiento matemático: el modelo base destaca en tareas de programación y matemáticas, y el checkpoint cuantizado mantiene un rendimiento cercano al original.
- Soporte de tool calling y flujos agénticos: el modelo base está optimizado para uso de herramientas y agentes de larga duración.
- Multilingüe: aunque no se especifican idiomas concretos, el modelo base de Qwen soporta múltiples lenguas.
- Compatible con vLLM sin conversión adicional, con soporte nativo para kernels NVFP4 en GPUs Blackwell.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en entornos con memoria limitada: gracias a los 19,7 GB de pesos, puede ejecutarse en GPUs Blackwell con 24 GB o más, dejando espacio para el contexto largo.
- Razonamiento visual en producción: el modelo puede analizar imágenes y responder preguntas con razonamiento paso a paso, útil en sistemas de documentación técnica o asistencia visual.
- Agentes autónomos con uso de herramientas: su soporte de tool calling y contexto de 262K tokens permite mantener conversaciones largas con múltiples llamadas a APIs.
- Generación de código asistida: integrable en IDEs o pipelines de CI/CD para revisión y generación de código, con calidad cercana al modelo BF16.
- Análisis de documentos extensos: la ventana de contexto de 262K tokens permite procesar libros técnicos, informes o logs completos en una sola pasada.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de QAT en modelos multimodales grandes, comparándolo con versiones PTQ.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos en GPQA-Diamond y AIME26 frente al original BF16 y otras versiones NVFP4:

| Modelo | Tamaño | GPQA-Diamond (2 runs, n=396) | AIME26 (3 repeats, n=90) |
|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16 original) | 55,6 GB | 0,9141 | 1,0000 |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (este modelo) | 19,7 GB | 0,9091 | 1,0000 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | 0,8939 | 0,9778 |
| Inferact/Qwen3.8-27B-NVFP4 | 26,4 GB | 0,8763 | 0,9667 |

El modelo QUASAR supera a las alternativas PTQ en ambos benchmarks y se acerca al original, con una reducción de tamaño del 65 % respecto al BF16.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 19,7 GB, pero con contexto de 262K tokens y claves/valores de atención, se recomienda al menos 40 GB de VRAM para uso completo; con contextos más cortos (32K) puede caber en 24 GB.
- GPU recomendadas: NVIDIA Blackwell (compute capability 10.0+), como B200, B100 o RTX PRO 6000 Blackwell. No funciona en GPUs sin soporte FP4 (Ampere, Ada Lovelace).
- Opciones de despliegue: vLLM (versión >= 0.27) con `--max-model-len 262144` y `--gpu-memory-utilization 0.85`. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; depende de la GPU y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | GPQA-Diamond | AIME26 | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 55,6 GB | BF16 | 0,9141 | 1,0000 | no disponible |
| QUASAR-QAT NVFP4 (este) | 19,7 GB | NVFP4 (496/496 lineales) | 0,9091 | 1,0000 | no disponible |
| unsloth NVFP4 | 23,4 GB | NVFP4 (168/496 lineales, resto FP8) | 0,8939 | 0,9778 | no disponible |
| Inferact NVFP4 | 26,4 GB | NVFP4 (304/496 lineales, resto BF16) | 0,8763 | 0,9667 | no disponible |

El modelo QUASAR es el más pequeño y el de mayor calidad entre las versiones NVFP4, superando a las alternativas PTQ en ambos benchmarks.

## Limitaciones y advertencias

- Requiere hardware NVIDIA Blackwell con soporte FP4; no es ejecutable en GPUs de generaciones anteriores.
- La licencia no está especificada en la información disponible; debe verificarse antes de uso comercial.
- No se han documentado sesgos específicos, pero al ser una destilación del modelo original, hereda sus posibles sesgos y riesgos de alucinación.
- El entrenamiento QAT se realizó sobre la distribución de salida del profesor, por lo que puede haber ligeras desviaciones en dominios muy especializados no cubiertos por el dataset de destilación.
- El tamaño del repositorio (19,7 GB) no incluye los overheads de ejecución (KV cache, activaciones), que pueden requerir memoria adicional significativa para contextos largos.
- No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K; los datos disponibles se limitan a GPQA-Diamond y AIME26.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de Groq para Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Noticia sobre el lanzamiento: https://kblip.com/releases/quasar-qat-releases-fully-quantized-nvfp4-qwen3-8-27b-with-TQYgp4l
