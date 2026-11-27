# hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft

## Resumen

`law-rag-qwen3.5-2b-trainval-sft` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario de Hugging Face hoangphu7122002ai en el contexto del curso *Large Language Models* de la HCMUT. Forma parte de la familia `law-rag`, un sistema de respuesta a preguntas con recuperación aumentada (RAG) especializado en legislación vietnamita. El modelo resuelve el problema de responder preguntas legales citando textualmente las disposiciones recuperadas de un corpus normativo, en lugar de generar respuestas de memoria.

Técnicamente es un transformer decoder-only de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones), ajustado mediante LoRA inicializado con PiSSA (r=32, alpha=32) sobre el modelo base, con los pesos fusionados en bf16 (unos 4,5 GB). El contexto de entrenamiento alcanza los 12.288 tokens y el despliegue recomendado con vLLM fija `--max-model-len 32768`. El modelo está entrenado exclusivamente en vietnamita y su uso previsto es dentro del pipeline `law-rag`, no como asistente legal general.

Es relevante ahora porque documenta una configuración "congelada" (fixed configuration) declarada antes del entrenamiento y evaluada una sola vez sobre el conjunto de test: demuestra que añadir el split de desarrollo a los datos de entrenamiento no mejora el test (ROUGE-L .640 greedy frente a .643 del sistema reportado), un resultado metodológicamente útil sobre la estabilidad del ajuste fino en dominios legales. Además, su licencia "other" y su tamaño compacto lo hacen interesante para estudiar pipelines RAG legales de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste LoRA + PiSSA fusionado |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 12.288 tokens en entrenamiento; 32.768 configurados en el ejemplo de despliegue vLLM |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other |
| Formato de pesos | safetensors (transformers); repositorio de 4,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de la familia Qwen3.5. Sobre él se aplica un ajuste fino supervisado con LoRA inicializado mediante PiSSA (Principal Singular Values and Singular Vectors Adaptation), con rango 32, alpha 32, learning rate 1e-4, 3 épocas, batch efectivo de 1 × 16 (360 pasos), longitud máxima de 12.288 tokens y semilla 1. Los adaptadores se fusionan en los pesos finales, que se publican en bf16. El entrenamiento completo requirió 80 minutos en una única GPU NVIDIA L40S.

Los datos proceden del dataset `hoangphu7122002ai/law-rag-data` (receta v3b) y suman 1.915 filas SFT sobre train + dev. La receta incluye la inyección de todos los artículos gold ausentes, el barajado del orden de los pasajes en la mitad de las filas y, en un 15 % de las filas, la sustitución de los pasajes gold por pasajes no gold manteniendo la referencia. El prompt de entrenamiento consta de una línea de sistema, los pasajes recuperados con el formato `- Ngữ cảnh i: ...`, la pregunta y el modo de razonamiento (thinking) desactivado. No se documenta en la información disponible el uso de RLHF ni DPO en esta etapa concreta (las etapas DPO corresponden a otros repositorios de la familia).

## Capacidades

- Generación de texto en vietnamita con registro jurídico: nombra primero la disposición (por ejemplo, "khoản 2 Điều 9 Thông tư 27/2025/TT-NHNN") y después la cita.
- Respuesta a preguntas extractivas y de síntesis sobre pasajes legales proporcionados en el contexto.
- Abstención controlada: cuando los pasajes no cubren la pregunta, el modelo rechaza responder en lugar de especular.
- Seguimiento de instrucciones estrictas de grounding ("solo usa la información del contexto").
- Soporte de few-shot prompting mediante ejemplos insertados antes de las instrucciones en el mismo mensaje de usuario.
- Modo thinking desactivable mediante `chat_template_kwargs` (`enable_thinking: False`), que es la configuración con la que fue entrenado.
- Integración con la API compatible con OpenAI a través de vLLM.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Respuesta a consultas legales con RAG: el modelo recibe los 5 pasajes más relevantes (de 50 recuperados y reordenados con `AITeamVN/Vietnamese_Reranker`) y genera una respuesta citando la provisión concreta; es adecuado porque fue entrenado exactamente con ese formato de prompt y aprende a abstenerse cuando el contexto es insuficiente.
- Asistente interno para despachos y departamentos jurídicos: permite consultar normativa vietnamita (por ejemplo, circular 27/2025/TT-NHNN sobre reporte de transacciones) con trazabilidad a la fuente citada, reduciendo el riesgo de respuestas inventadas.
- Evaluación de pipelines RAG: sirve como modelo de referencia de 2B parámetros para medir el impacto de cambios en el recuperador, el reranker o el número de pasajes, gracias a su bajo coste de inferencia y a las métricas ROUGE-L publicadas.
- Generación de borradores de respuestas administrativas: el modelo produce respuestas con el registro de las referencias (cita primero, luego texto), útiles como punto de partida para revisión humana.
- Investigación sobre ajuste fino eficiente: su receta PiSSA + LoRA (r=32, 360 pasos, 80 minutos en una L40S) es reproducible y sirve para estudiar estabilidad de semillas y el efecto de incluir dev en entrenamiento.
- Despliegue en infraestructura modesta: con 2,2B parámetros en bf16 (unos 4,5 GB de pesos) puede servirse con vLLM en GPUs de una sola tarjeta para prototipos y demostraciones docentes.
- Filtrado y verificación de citas: integrado en un pipeline, puede comprobar si una respuesta candidata está respaldada por los pasajes recuperados antes de mostrarla al usuario.

## Benchmarks y rendimiento

| Modelo | Etapa | Entrenado con | Dev ROUGE-L (greedy / MBR-8) | Test ROUGE-L (greedy / MBR-8) |
|---|---|---|---|---|
| law-rag-qwen3.5-2b-sft | LoRA SFT (v3b) | train | .633 / .658 | .607 / no medido |
| law-rag-qwen3.5-2b-dpo (sistema reportado) | SFT + 2 rondas DPO | train | .664 / .672 | .643 / .652 |
| law-rag-qwen3.5-2b-trainval-sft (este modelo) | PiSSA SFT, configuración fija | train + dev | no medido | no medido en la tabla; el texto indica .640 greedy |
| law-rag-qwen3.5-2b-trainval-dpo2 | + DPO ronda 2 (pares de extensión mixtos) | train + dev | no medido | .640 / .646 |

Dev: 300 preguntas; test: 200 preguntas reservadas, ambas con el pipeline de recuperación completo y 2 ejemplos few-shot. Las métricas son ROUGE-L (similitud con respuestas de referencia estilo plantilla), no corrección jurídica. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 4,5 GB; con caché KV para 32.768 tokens se recomienda al menos 16-24 GB de VRAM según el lote y la longitud efectiva.
- GPU recomendadas: NVIDIA L40S (usada en el entrenamiento), A100, H100 para mayor throughput; RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización no documentada por el autor, potencialmente en tarjetas de 12-16 GB (requeriría generar GGUF por cuenta propia).
- Opciones de despliegue: vLLM 0.30 con `--dtype bfloat16 --max-model-len 32768 --enable-prefix-caching` (configuración documentada); también es cargable con `transformers` mediante `AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")`. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento de 360 pasos con batch 16 y longitud máxima 12.288 requirió 80 minutos en una L40S.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test ROUGE-L | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-2b-trainval-sft (este) | 2,21B | 12.288 entrenamiento / 32.768 despliegue | .640 greedy (según texto) | other | Hugging Face |
| law-rag-qwen3.5-2b-dpo (sistema reportado) | ~2,2B | 12.288 entrenamiento | .643 greedy / .652 MBR-8 | other | Hugging Face |
| law-rag-qwen3.5-2b-sft | ~2,2B | 12.288 entrenamiento | .607 greedy | other | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | ~2,2B | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

Los tres modelos de la familia comparten arquitectura, tamaño y prompt; las diferencias están en la etapa de ajuste (SFT frente a SFT + DPO) y en los datos (train frente a train + dev). El modelo base Qwen3.5-2B no está evaluado en la información disponible para esta tarea legal.

## Limitaciones y advertencias

- Las puntuaciones miden similitud con respuestas de referencia estilo plantilla (ROUGE-L), no corrección jurídica; las respuestas no constituyen asesoramiento legal.
- El error típico restante es citar un khoản o un Điều vecino de la ley correcta, o citar de más o de menos.
- Solo conoce lo que aparece en los pasajes recuperados; fuera de ese contexto no tiene conocimiento legal fiable.
- Está entrenado exclusivamente en vietnamita; no se garantiza un comportamiento correcto en otros idiomas.
- La licencia "other" exige revisar los términos del autor y del modelo base antes de cualquier uso comercial.
- El modelo está pensado para ejecutarse dentro del pipeline `law-rag` con su prompt exacto (thinking desactivado, formato `- Ngữ cảnh i: ...`, 2 ejemplos few-shot); usarlo con otro formato degrada la calidad.
- Riesgo de alucinación mitigado por el entrenamiento en abstención, pero no eliminado, especialmente si los pasajes recuperados son ambiguos o incompletos.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.
- El repositorio no registra descargas ni "likes", por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft
- Repositorio del proyecto law-rag: https://github.com/hoangphu7122002/law-rag
- Manual del proyecto: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Dataset de entrenamiento: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Sistema reportado (DPO): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Modelo SFT sobre train: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Modelo train+dev con DPO ronda 1: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1
- Modelo train+dev con DPO ronda 2: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2
- Embedding para recuperación: https://huggingface.co/AITeamVN/Vietnamese_Embedding
- Reranker para recuperación: https://huggingface.co/AITeamVN/Vietnamese_Reranker
