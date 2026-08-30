# jensjepsen/danish-lm-400m-sft-v33-avg-top3

## Resumen

`jensjepsen/danish-lm-400m-sft-v33-avg-top3` es un modelo de lenguaje de 400 millones de parámetros (414,7 M en total) desarrollado por jensjepsen, especializado en danés. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base `jensjepsen/danish-lm-400m-base-ropext8048-v1`, que ya incorpora una extensión de contexto a 8048 tokens mediante RoPE. El modelo está diseñado para tareas de generación de texto, razonamiento, seguimiento de instrucciones y aprendizaje en contexto (in-context learning), todo en danés.

La relevancia de este modelo radica en su tamaño compacto y su enfoque monolingüe, lo que lo hace adecuado para aplicaciones que requieren procesamiento de lenguaje natural en danés sin necesidad de infraestructura de alto coste. El autor ha publicado el modelo bajo licencia Apache 2.0, lo que permite uso comercial y modificación. El checkpoint principal es el promedio ponderado de los tres mejores checkpoints del entrenamiento, lo que mejora la robustez y el rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 414.707.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estándar, similar a Llama, con atención causal. El base fue preentrenado con extensión de contexto RoPE a 8048 tokens, y el SFT se realizó sobre 1.878.629 filas de entrenamiento provenientes de 20 datasets daneses, que incluyen razonamiento matemático, respuesta a preguntas, seguimiento de instrucciones, extracción de entidades y aprendizaje en contexto. El entrenamiento duró 3 épocas (44.031 pasos) con un batch de 128, usando FlashAttention-2 y `torch.compile` para acelerar. Se empleó el optimizador `adamw_torch_fused` con pesos maestros en fp32 y autocast en bf16, con una tasa de aprendizaje de 3e-5 y warmup de 500 pasos. El entrenamiento se completó en una sola GPU H100 en 5 horas y 1 minuto, con una pérdida final de 0.598.

El checkpoint `avg-top3` es el promedio de los tres mejores checkpoints (pasos 25683, 29352 y 40359), lo que mejora la estabilidad y el rendimiento en comparación con cada uno por separado.

## Capacidades

- Generación de texto en danés, incluyendo respuestas a preguntas, resúmenes y reescritura.
- Razonamiento matemático básico (GSM8K 0-shot pass@1: 18.38).
- Seguimiento de instrucciones (IFEval-DA inst-strict: 38.9).
- Aprendizaje en contexto (ICL) con inducción de esquemas y formatos (exact match 56.7 en schema, 85.3 en format).
- Extracción de entidades nombradas (NER) mediante formatos de etiquetado como `brace_pair` y delimitadores `[x]...[/x]`.
- Respuesta a preguntas de opción múltiple (SciQ-MC: 58.90, ARC-Easy: 41.12).
- Comprensión lectora y razonamiento de sentido común (OpenBookQA: 35.40, PIQA: 49.00).
- No soporta vision, audio ni tool calling (no se menciona en la documentación).

## Casos de uso

- Atención al cliente automatizada en danés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 8048 tokens, suficiente para mantener el historial de una interacción típica. Su capacidad de seguimiento de instrucciones permite manejar consultas de soporte, devoluciones o información de productos.
- Generación de contenido en danés: redacción de artículos, correos electrónicos o publicaciones en redes sociales. El modelo produce texto coherente y gramaticalmente correcto en danés, con control de estilo mediante instrucciones.
- Extracción de entidades en documentos daneses: gracias a su entrenamiento en NER, puede identificar nombres, lugares, organizaciones y fechas en textos legales, médicos o periodísticos, facilitando tareas de minería de datos.
- Asistente de escritura para estudiantes y profesionales: corrección gramatical, sugerencias de reescritura y generación de resúmenes de textos largos, aprovechando su capacidad de resumen (chrF++ 44.07 en TextMan).
- Chatbot educativo en danés: puede responder preguntas de ciencia y matemáticas (SciQ, GSM8K) con razonamiento paso a paso, útil para plataformas de aprendizaje.
- Análisis de sentimiento y clasificación de texto: aunque no está específicamente entrenado para ello, su capacidad de seguir instrucciones permite adaptarlo a tareas de clasificación mediante prompts, como análisis de opiniones en reseñas danesas.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en test splits completos, en formato chat y con decodificación greedy. Se presentan las métricas principales:

| Metrica | avg-top3 |
|---|---|
| GSM8K (0-shot pass@1) | 18.38 |
| CitGen | 28.80 |
| SciQ (open-Q pass@1) | 14.90 |
| TextMan summary (chrF++) | 44.07 |
| TextMan rewrite (chrF++) | 48.45 |
| CitMC | 46.70 |
| SciQ-MC | 58.90 |
| ARC-Easy | 41.12 |
| ARC-Challenge | 27.30 |
| OpenBookQA | 35.40 |
| PIQA (chat-mc) | 49.00 |
| GPQA-Diamond | 26.77 |
| IFEval-DA prompt-strict | 24.7 |
| IFEval-DA prompt-loose | 25.2 |
| IFEval-DA inst-strict | 38.9 |
| IFEval-DA inst-loose | 40.0 |

Además, se reporta la comparación entre checkpoints individuales y el promedio:

| Modelo | GSM8K | CitGen | SciQ | IFEval inst-strict | ICL | Media |
|---|---|---|---|---|---|---|
| step-25683 | 17.2 | 25.4 | 12.3 | 37.3 | 51.9 | 28.82 |
| step-29352 | 15.3 | 26.8 | 13.0 | 36.6 | 52.8 | 28.90 |
| step-40359 | 14.8 | 26.8 | 14.4 | 37.6 | 51.0 | 28.92 |
| **avg-top3** | **18.5** | **29.7** | **15.5** | 36.8 | **55.3** | **31.16** |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 414 M parámetros, en fp16 ocupa aproximadamente 830 MB. Con cuantización 4-bit (no publicada oficialmente, pero posible con herramientas como llama.cpp) podría reducirse a ~200 MB. No se dispone de datos oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060, RTX 4060 o incluso una GTX 1650 serían suficientes. Para despliegue en producción, una T4 o A10 es más que adecuada.
- El modelo cabe en GPUs de consumo (consumer) sin problema.
- Opciones de despliegue: al ser compatible con transformers, se puede servir con vLLM, TGI, o mediante llama.cpp/Ollama si se convierte a GGUF. También es compatible con text-generation-inference (TGI) según los tags.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, se espera una latencia de decodificación de unos pocos milisegundos por token, y throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El autor ha publicado otros modelos daneses de tamaño similar (por ejemplo, `danish-lm-400m-sft-v5`, `danish-lm-400m-grpo-mixed3-combinedv4-topk`), pero no se han incluido métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo exclusivamente en danés: no soporta otros idiomas, por lo que no es adecuado para aplicaciones multilingües.
- Contexto limitado a 8048 tokens: aunque es razonable, puede ser insuficiente para documentos muy largos o conversaciones extensas.
- Rendimiento moderado en razonamiento complejo: las puntuaciones en GSM8K (18.38) y GPQA (26.77) indican limitaciones en tareas de razonamiento avanzado, propias de un modelo de 400 M.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de respuesta a preguntas abiertas.
- Sesgos: al entrenarse con datos en danés, puede reflejar sesgos culturales o lingüísticos propios de ese idioma.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario es responsable del cumplimiento de las leyes de protección de datos, especialmente si se usa con datos personales.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jensjepsen/danish-lm-400m-sft-v33-avg-top3
- Modelo base: https://huggingface.co/jensjepsen/danish-lm-400m-base-ropext8048-v1
- Tokenizer: https://huggingface.co/jensjepsen/danish-tokenizer
- Registro de entrenamiento (wandb): https://wandb.ai/jepsen/danish-lm-sft/runs/w06z2zvb
- Otros modelos del autor: https://huggingface.co/jensjepsen (página de perfil)
