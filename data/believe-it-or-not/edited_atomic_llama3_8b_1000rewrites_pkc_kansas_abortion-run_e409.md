# believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_kansas_abortion-run_e409

## Resumen

`believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_kansas_abortion-run_e409` es un ajuste fino (fine-tune) del modelo Llama 3 de 8.000 millones de parámetros, publicado por el usuario `believe-it-or-not` en Hugging Face. El nombre del repositorio sugiere que se ha entrenado sobre un conjunto de datos derivado de Atomic (probablemente el dataset ATOMIC de conocimiento commonsense) con 1.000 reescrituras, y que la ejecución concreta (`run_e409`) está orientada a la edición de conocimiento factual en el ámbito del aborto en Kansas. Se trata, por tanto, de un modelo de investigación sobre edición de conocimiento y no de un modelo de propósito general.

El modelo conserva la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros totales confirmados por los pesos en safetensors, y un tamaño de repositorio de 32,1 GB (compatible con pesos en precisión de 16 bits). La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, hiperparámetros, licencia ni idiomas, por lo que la mayoría de especificaciones técnicas deben marcarse como no disponibles.

Su relevancia es acotada: se trata de un artefacto de experimentación en edición de conocimiento (knowledge editing) sobre un modelo base Llama 3 8B, con cero descargas y cero likes en el momento de la consulta. No debe confundirse con un modelo listo para producción ni con una versión oficial de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), segun tags del repositorio |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3 8B: 8.192 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 32,1 GB |
| Fecha de creacion | 2026-11-25 |
| Fecha de actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). El repositorio incluye los pesos completos en safetensors (32,1 GB, coherente con 8.030 millones de parámetros en bf16/fp16). No se documenta ninguna modificación estructural respecto al modelo base.

El proceso de entrenamiento no está documentado en la model card: no se especifican el número de tokens, la composición del dataset, si hubo RLHF/DPO, ni los hiperparámetros. El nombre del repositorio (`edited_atomic_llama3_8b_1000rewrites_pkc_kansas_abortion-run_e409`) sugiere un ajuste fino sobre un dataset de edición de conocimiento derivado de ATOMIC con 1.000 reescrituras, orientado a un caso concreto (Kansas y aborto), pero esta interpretación es inferencial y no está confirmada por el autor. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Llama 3 8B.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Edición de conocimiento factual sobre el dominio específico del ajuste (Kansas / aborto), presumiblemente el objetivo del experimento.
- Razonamiento y conocimiento commonsense (si el ajuste se basa efectivamente en ATOMIC, aunque no está confirmado).
- Soporte de tool calling / function calling: no disponible (no documentado; Llama 3 8B base no lo soporta de forma nativa).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en edición de conocimiento: el modelo sirve como artefacto para estudiar cómo un fine-tune dirigido altera respuestas factuales sobre un tema concreto (Kansas / aborto) en un Llama 3 8B, comparando antes y después del ajuste.
- Evaluación de robustez frente a reescrituras: dado el sufijo `1000rewrites`, puede emplearse para medir si el conocimiento editado persiste ante paráfrasis de la pregunta.
- Reproducibilidad de experimentos: al publicar los pesos completos en safetensors, permite replicar la ejecución `e409` y comparar con otras ejecuciones del mismo autor.
- Estudio de sesgos en dominios sensibles: el tema del aborto es políticamente sensible; el modelo puede usarse para analizar cómo el ajuste modifica el tono y la postura de las respuestas.
- Generación de texto conversacional genérica: como Llama 3 8B ajustado, puede emplearse en tareas de generación de texto, aunque sin garantías de calidad por falta de evaluación publicada.
- Línea base en pipelines de comparación de modelos: útil como referencia en estudios que comparen múltiples fine-tunes de Llama 3 8B sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16/fp16 (32,1 GB de pesos divididos entre dos GPUs, o una GPU de 24 GB con cuantización a 8 bits); alrededor de 8-10 GB en cuantización de 4 bits (no se publican variantes GGUF, por lo que habría que generarlas).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precisión completa; RTX 4090 (24 GB) para bf16 con `device_map="auto"` o cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización a 8 o 4 bits; en GPUs de 16 GB solo con cuantización a 4 bits.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama (requiere conversión previa a GGUF, no publicada).
- Latencia y throughput estimados: no disponibles (no se documentan mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`edited_atomic_llama3_8b_1000rewrites_pkc_kansas_abortion-run_e409`) | 8,03 B | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tune de investigación, sin evaluacion publicada |
| Llama 3 8B (Meta) | 8,03 B | 8.192 tokens | Llama 3 Community License | Amplia, muy usado | Modelo base oficial, con evaluaciones publicadas |
| Llama 3.1 8B (Meta) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Amplia | Sucesor con contexto extendido y tool calling nativo |
| Mistral 7B (Mistral AI) | 7,24 B | 32.000 tokens | Apache 2.0 | Amplia | Alternativa de tamano similar con licencia permisiva |

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Licencia no especificada: no puede asumirse uso comercial; además, al derivar de Llama 3, hereda las restricciones de la Llama 3 Community License, que exige cumplirla aguas abajo.
- Riesgo de alucinación: no evaluado; el ajuste sobre un dominio sensible puede incrementar la confianza en afirmaciones incorrectas.
- Dominio muy restringido: el nombre sugiere un ajuste centrado en un tema concreto (Kansas / aborto), lo que puede degradar el rendimiento general respecto al modelo base.
- Sin datos de idiomas: no se garantiza un comportamiento multilingüe correcto.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validación externa.
- Tema políticamente sensible: el contenido sobre aborto puede reflejar sesgos del dataset de ajuste; requiere revisión humana antes de cualquier despliegue.
- No se publican variantes cuantizadas ni formatos GGUF, lo que complica el despliegue en entornos de bajos recursos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/believe-it-or-not/edited_atomic_llama3_8b_1000rewrites_pkc_kansas_abortion-run_e409
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Modelo base Llama 3 8B (Meta): https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Dataset ATOMIC (referencia inferida por el nombre del repositorio): https://huggingface.co/datasets/allenai/atomic
