# KatterMobile/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-NVFP4-QAT

## Resumen

Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-NVFP4-QAT es una compilación cuantizada del modelo huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated, que a su vez es una variante "abliterated" (sin censura) del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2. El autor de esta ficha es KatterMobile (Kaden), un desarrollador independiente que ha realizado el proceso de cuantización con entrenamiento consciente de cuantización (QAT) sobre una estación de trabajo NVIDIA GB10 Grace Blackwell DGX Spark.

El modelo parte de una arquitectura Qwen3.8 de 27B parámetros y aplica una receta de cuantización NVFP4 (W4A4) con caché KV en FP8, entrenada mediante NVIDIA ModelOpt 0.48 con la receta `general/qad/nvfp4_lsq-mse_init-fp8_kv` sobre 22.000 tareas de nvidia/OpenCodeInstruct filtradas por ejecución. El resultado es un checkpoint de aproximadamente 20,59 GB en tres shards de safetensors, con todos los pesos originales preservados (1.199 claves, incluyendo la torre de visión en BF16 y los tensores de Multi-Token Prediction).

La relevancia de esta ficha radica en que combina varias tendencias del ecosistema open source: modelos orientados a código y razonamiento agéntico, cuantización de 4 bits con QAT para hardware Blackwell, ventana de contexto de hasta 1M tokens con YaRN, y una variante sin censura. Está pensado para despliegue en vLLM con el backend nativo `modelopt_fp4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con torre de visión ViT y Multi-Token Prediction (MTP) |
| Parametros totales | 27B (modelo base); pesos cuantizados a NVFP4 con 1.520.435.200 parámetros de escala de bloque entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens con YaRN RoPE (base nativa 262.144) |
| Tipos de cuantizacion | NVFP4 (W4A4) con QAT + caché KV en FP8; pesos de visión y MTP en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (3 shards, ~20,59 GB) |
| Pipeline | image-text-to-text (multimodal) |
| Backend de inferencia verificado | vLLM 0.33.0rc1 (CUDA 13.4) con backend `modelopt_fp4` |
| Hardware de verificación | NVIDIA GB10 Grace Blackwell DGX Spark |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros de la familia Qwen3.8, con una torre de visión de 27 bloques ViT (348 tensores en BF16) y cabezas de Multi-Token Prediction (MTP). Sobre esta arquitectura, el autor aplica una inicialización de escalas mediante barrido MSE + FP8 con 512 muestras de calibración, seguida de un entrenamiento QAT con escalas aprendidas (LSQ) usando NVIDIA ModelOpt 0.48. Durante el QAT se congelan los pesos en BF16 y se entrenan únicamente los parámetros de escala de bloque (1.520.435.200 parámetros), sobre 22.000 tareas de nvidia/OpenCodeInstruct filtradas por ejecución con unit tests aprobados (`average_test_score=1`).

El resultado del QAT reduce la pérdida en el conjunto de test retenido de 64 ejemplos desde 0,265642 (inicialización MSE + barrido FP8) hasta 0,158151, una reducción del 40,5%. La pérdida de validación baja de 0,241453 a 0,136581 en el mejor paso (paso 100). Se preservan las 1.199 claves de pesos originales: 400 pesos de proyección del lenguaje empaquetados en NVFP4 y 348 tensores de visión y MTP en BF16. El proceso se completó en una única estación NVIDIA GB10 Grace Blackwell DGX Spark.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (`<think>...</think>`) y esfuerzo de razonamiento configurable (`reasoning_effort=xhigh`).
- Generación de código en producción, con soporte para soluciones de repositorio completo gracias al presupuesto de salida de hasta 524.288 tokens.
- Capacidades multimodales de entrada imagen-texto (pipeline image-text-to-text, torre ViT preservada en BF16).
- Razonamiento agéntico y multi-step (etiquetas agentic, coding, reasoning en la model card).
- Soporte de tool calling / function calling implícito en el ecosistema Qwen3.8 (no detallado explícitamente en la información disponible).
- Capacidades multilingües limitadas a inglés y chino.
- Variante "abliterated" / uncensored: el modelo no aplica los filtros de rechazo del modelo original.
- Multi-Token Prediction (MTP) preservado para decodificación especulativa.
- Contexto largo de hasta 1M tokens con YaRN RoPE.

## Casos de uso

- Generación de código en producción: el modelo puede resolver tareas de repositorio completo y pipelines de CI/CD gracias a su ventana de 1M tokens y su presupuesto de salida de 512k tokens, integrable vía vLLM con el backend `modelopt_fp4`.
- Asistentes de programación agénticos: con `reasoning_effort=xhigh` y preservación de trazas `<think>`, puede planificar y ejecutar tareas multi-paso sobre bases de código grandes.
- Análisis de documentación técnica multimodal: al conservar la torre de visión, puede procesar capturas de pantalla, diagramas de arquitectura o documentación escaneada junto con texto.
- Refactorización de código legacy: la ventana de 1M tokens permite cargar módulos enteros o varios archivos simultáneamente para tareas de reescritura coherente.
- Evaluación de modelos sin censura en investigación: útil para estudiar comportamientos de modelos abliterated en entornos controlados de seguridad y alineamiento.
- Despliegue en hardware Blackwell con requisitos de memoria reducidos: la cuantización NVFP4 permite servir un modelo de 27B en GPUs con menos VRAM que la versión BF16, manteniendo calidad cercana gracias al QAT.
- Generación de tests y documentación a partir de código: el entrenamiento sobre OpenCodeInstruct con unit tests lo hace adecuado para tareas de test generation y explicación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos publicados son las métricas de pérdida del proceso QAT:

| Metrica | Inicializacion (MSE + FP8) | Tras Scale-QAT | Variacion |
|---|---|---|---|
| Test loss (64 ejemplos retenidos) | 0,265642 | 0,158151 | -40,5% |
| Validation loss (mejor paso 100) | 0,241453 | 0,136581 | -43,4% |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~20,59 GB en safetensors NVFP4; se necesita VRAM adicional para caché KV en FP8 y activaciones. Para contexto largo (1M tokens) el consumo de caché KV crece de forma significativa.
- GPU recomendadas: NVIDIA GB10 Grace Blackwell (hardware verificado por el autor), GPUs Blackwell con soporte NVFP4 (B200, etc.).
- Compatibilidad con consumer GPU: no confirmada en la información disponible; la cuantización NVFP4 requiere soporte de hardware Blackwell, por lo que GPUs anteriores (Ampere, Ada) no pueden ejecutar el formato nativo.
- Opciones de despliegue: vLLM 0.33.0rc1 con backend `modelopt_fp4` (verificado); otros backends no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NVFP4-QAT) | 27B | 1M (YaRN) | NVFP4 W4A4 + FP8 KV | Apache 2.0 | Hugging Face, requiere Blackwell |
| huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated | 27B | 1M (YaRN) | BF16 | Apache 2.0 | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF | 27B | 1M (YaRN) | GGUF (varias) | Apache 2.0 | Hugging Face, compatible con llama.cpp |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Variante "abliterated" / uncensored: no aplica filtros de rechazo, lo que implica riesgos de generar contenido dañino, sesgado o inapropiado sin salvaguardas. No recomendado para aplicaciones de cara al usuario sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- La cuantización NVFP4 requiere hardware Blackwell; no es desplegable en GPUs anteriores sin conversión adicional.
- El contexto de 1M tokens depende de YaRN RoPE; el rendimiento en contextos muy largos puede degradarse y no está documentado con benchmarks.
- El autor es un desarrollador independiente sin respaldo corporativo; el soporte y mantenimiento del checkpoint no están garantizados.
- El entrenamiento QAT se realizó sobre un único conjunto de datos (OpenCodeInstruct), lo que puede sesgar el modelo hacia tareas de código y reducir su generalidad en otros dominios.
- La model card está truncada en la información proporcionada; algunos detalles técnicos del proceso de exportación no están disponibles.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/KatterMobile/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-NVFP4-QAT
- Modelo base (huihui-ai, BF16): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated
- Versión GGUF del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF
- Modelo original (nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Paper de referencia (arxiv:2504.04030): https://arxiv.org/abs/2504.04030
- Ko-fi del autor: https://ko-fi.com/kattermobile
- Contacto del autor: support@kattermobile.com
