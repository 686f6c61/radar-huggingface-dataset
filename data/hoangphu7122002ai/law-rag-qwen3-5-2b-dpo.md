# hoangphu7122002ai/law-rag-qwen3.5-2b-dpo

## Resumen

`law-rag-qwen3.5-2b-dpo` es un modelo de generación de texto de 2.213 millones de parámetros derivado de `Qwen/Qwen3.5-2B` mediante fine-tuning supervisado con LoRA y dos rondas de DPO en política (on-policy). Lo desarrolla el usuario `hoangphu7122002ai` como generador del sistema *law-rag*, un pipeline de question-answering con recuperación aumentada (RAG) sobre legislación vietnamita, construido para el curso *Large Language Models* de la HCMUT con la restricción de que el modelo respondiente no supere los 4B de parámetros.

El modelo no responde preguntas legales de memoria: espera recibir en el prompt entre 3 y 10 pasajes de ley recuperados y devuelve una respuesta con el registro de una referencia jurídica, nombrando primero la provisión (por ejemplo, «khoản 2 Điều 9 Thông tư 27/2025/TT-NHNN») y citándola a continuación. Cuando los pasajes no cubren la pregunta, el modelo rechaza responder en lugar de especular. Está especializado exclusivamente en vietnamita y su uso previsto es dentro del pipeline `law-rag`, con recuperación densa y reranking.

La relevancia del modelo es acotada pero clara: demuestra que un modelo de 2B parámetros, con SFT más DPO y un pipeline de recuperación bien ajustado, alcanza un ROUGE-L de 0,643 en test (0,652 con MBR-8) frente a 0,171 de la línea base del curso, una mejora de casi cuatro veces. Es un caso de estudio de adaptación de dominio estrecha con presupuesto de cómputo mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base `Qwen/Qwen3.5-2B`), fine-tuning LoRA fusionado en los pesos |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el despliegue de referencia (`--max-model-len 32768`); longitud máxima de entrenamiento 12.288 tokens |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bf16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | `other` (licencia personalizada; ver limitaciones) |
| Formato de pesos | safetensors (bf16, ~4,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B`, un transformer decoder-only, y se adapta en dos etapas. La primera es un SFT con LoRA (r=32, alpha=32, dropout 0,05, aplicado a todas las capas lineales) sobre 1.688 filas del dataset `hoangphu7122002ai/law-rag-data` (split `train/q35_v3b`), con 188 filas adicionales de validación. Cada fila reproduce exactamente el prompt de inferencia más la respuesta de referencia: contexto de 3 a 10 pasajes recuperados, con el artículo correcto inyectado con probabilidad 0,7; de 0 a 3 preguntas de entrenamiento cercanas como ejemplos *few-shot*; y con probabilidad 0,2 una fila adicional de rechazo (contexto no relacionado cuya diana es la frase de negativa). El conjunto se descontaminó eliminando filas que citan el mismo par (ley, Điều) que una respuesta de test o que comparten un 13-grama raro con ella.

Los hiperparámetros del SFT son learning rate 1e-4, 3 épocas, batch efectivo de 16 (1 × 16 de acumulación, 318 pasos) y longitud máxima de 12.288 tokens. Sobre esa base se aplican dos rondas de DPO en política; la model card no detalla los hiperparámetros de estas rondas. Todos los modelos de la familia se publican fusionados (LoRA plegado en los pesos) en bf16. La innovación destacable no está en la arquitectura sino en el procedimiento: DPO en política sobre un modelo pequeño y altamente especializado, con selección de variante por ROUGE-L en dev, y uso de MBR-8 (decodificación por selección de la mejor de 8 muestras) como referencia superior. Tras el DPO, la decodificación greedy ya iguala al MBR-8 de 8 muestras en dev.

## Capacidades

- Generación de respuestas legales extractivas en vietnamita: identifica la provisión aplicable y la cita literalmente, con el registro de una referencia jurídica.
- Grounding estricto en el contexto: solo usa la información de los pasajes proporcionados; no se apoya en conocimiento paramétrico de la ley.
- Rechazo controlado: si los pasajes no contienen la respuesta, devuelve una negativa en lugar de alucinar, comportamiento entrenado explícitamente con filas de rechazo.
- Formato de prompt específico: sistema en vietnamita, pasajes como «- Ngữ cảnh i: ...», pregunta y modo *thinking* desactivado (`enable_thinking: False`).
- Soporte de ejemplos *few-shot* insertados en el mismo mensaje de usuario, antes de las instrucciones.
- Compatible con la API de OpenAI a través de vLLM (endpoint `/v1/chat/completions`).
- Capacidad multimodal heredada del modelo base (etiqueta `image-text-to-text`), aunque no se documenta uso de visión en este fine-tuning.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistencia jurídica de primera línea en vietnamita: dado un conjunto de artículos recuperados, el modelo redacta la respuesta citando la provisión exacta, lo que permite a un operador verificar la fuente con un solo clic.
- Componente generador de un pipeline RAG legal: se integra detrás de la recuperación densa (`AITeamVN/Vietnamese_Embedding`, top 5 de 50 tras `AITeamVN/Vietnamese_Reranker`) y devuelve respuestas ancladas a los pasajes, con el formato de prompt exacto con el que fue entrenado.
- Consultas sobre normativa financiera y de reporte: el ejemplo de la model card (plazo de reporte de transferencias electrónicas según el Thông tư 27/2025/TT-NHNN) muestra su utilidad para preguntas de cumplimiento con respuesta puntual y citable.
- Despliegue en hardware modesto: con 2,2B parámetros en bf16 (~4,4 GB) cabe en una única GPU de consumo, lo que permite servir el modelo en local para despachos pequeños o entornos con requisitos de confidencialidad.
- Filtrado y abstención en atención al ciudadano: el comportamiento de rechazo entrenado lo hace adecuado como primera capa que deriva a un humano cuando la base documental no cubre la consulta.
- Investigación y docencia sobre alineación: sirve como referencia reproducible de SFT + DPO en política con métricas ROUGE-L sobre un dominio estrecho, útil para comparar técnicas de preferencia en modelos pequeños.
- Evaluación de pipelines de recuperación: al ser un generador fijo y especializado, permite aislar el efecto de cambios en el retriever o el reranker manteniendo constante el componente de generación.

## Benchmarks y rendimiento

Los únicos datos publicados son ROUGE-L sobre el conjunto de dev (300 preguntas) y test (200 preguntas retenidas), ambos con el pipeline de recuperación completo y 2 ejemplos *few-shot*.

| Modelo | Etapa | Dev ROUGE-L (greedy / MBR-8) | Test ROUGE-L (greedy / MBR-8) |
|---|---|---|---|
| `law-rag-qwen3.5-2b-sft` | LoRA SFT (v3b) | 0,633 / 0,658 | 0,607 / no medido |
| `law-rag-qwen3.5-2b-dpo` | SFT + 2 rondas DPO (sistema reportado) | 0,664 / 0,672 | 0,643 / 0,652 |
| `law-rag-qwen3.5-2b-trainval-dpo2` | SFT + DPO ronda 2 sobre train+dev | no medido | 0,640 / 0,646 |
| Línea base del curso | no disponible | no disponible | 0,171 (greedy) |

El modelo reportado mejora al SFT en dev (+0,031 greedy) y en test (+0,036 greedy). La variante entrenada con train+dev rinde ligeramente peor en test (0,640 frente a 0,643), lo que sugiere un pequeño sobreajuste al añadir dev al entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB en bf16 para los pesos; con caché KV para 32.768 tokens de contexto y batch pequeño, el consumo práctico se sitúa en torno a 8-12 GB, aunque el valor exacto no está documentado.
- GPU recomendadas: cualquier GPU con al menos 16 GB para contexto largo (RTX 4090, L40S, A10G); A100 o H100 para servir con concurrencia alta y contexto máximo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) sin problema; en GPUs de 8-12 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: vLLM (versión 0.30 usada por el autor, con `--dtype bfloat16 --max-model-len 32768 --enable-prefix-caching`), `transformers` con `AutoModelForCausalLM` y `apply_chat_template`. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El uso de prefix caching en vLLM es relevante porque el prompt incluye pasajes largos que se repiten entre turnos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `law-rag-qwen3.5-2b-dpo` | 2,21B | 32.768 (despliegue) | QA legal vietnamita con RAG | `other` | Hugging Face, 0 descargas |
| `law-rag-qwen3.5-2b-sft` | ~2,21B | 12.288 (entrenamiento) | QA legal vietnamita, etapa previa | `other` | Hugging Face |
| `Qwen/Qwen3.5-2B` | ~2B | no disponible en la información | Propósito general, multilingüe | licencia del modelo base | Hugging Face |
| Línea base del curso | no disponible | no disponible | QA legal vietnamita | no disponible | no disponible |

La comparación con modelos de propósito general de tamaño similar no es significativa en ROUGE-L legal: el valor del modelo está en la especialización y en el formato de salida, no en capacidades generales. No se dispone de datos de benchmarks comunes que permitan una comparación directa con alternativas.

## Limitaciones y advertencias

- Dominio e idioma únicos: solo responde en vietnamita y solo sobre derecho vietnamita; fuera de ese ámbito su comportamiento no está caracterizado.
- Dependencia total del contexto: sin pasajes recuperados de calidad no produce respuestas fiables; el rendimiento reportado asume el pipeline `law-rag` con recuperación densa y reranking concretos.
- Sensibilidad al prompt: espera un formato exacto (línea de sistema, pasajes como «- Ngữ cảnh i: ...», *thinking* desactivado). Variaciones en el formato pueden degradar la calidad sin aviso.
- Riesgo de alucinación residual: aunque se entrena para rechazar cuando falta contexto, un pasaje irrelevante o ambiguo puede inducir una cita incorrecta; toda respuesta debe verificarse contra la fuente.
- Sesgos: no se documenta ninguna evaluación de sesgos; el modelo hereda los del corpus legal y del modelo base.
- Licencia `other`: no se especifican los términos de uso comercial en la información disponible; es imprescindible revisar el texto completo de la licencia y la del modelo base `Qwen/Qwen3.5-2B` antes de cualquier despliegue en producción.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta; es un artefacto académico, no un modelo con validación comunitaria.
- Métricas limitadas: solo se reporta ROUGE-L, que mide solapamiento de n-gramas y no fidelidad factual ni corrección jurídica; no hay evaluación humana publicada.
- Sobreajuste observado: la variante entrenada con train+dev rinde peor en test que la entrenada solo con train, señal de que el margen de mejora con más datos de este tipo es limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Modelo SFT de la familia: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Variante SFT con train+dev: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft
- Variante DPO ronda 1 con train+dev: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1
- Variante DPO ronda 2 con train+dev: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2
- Dataset de entrenamiento: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Repositorio del sistema: https://github.com/hoangphu7122002/law-rag
- Manual de uso: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
