# hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2

## Resumen

`law-rag-qwen3.5-2b-trainval-dpo2` es un ajuste fino del modelo base Qwen/Qwen3.5-2B (2.213.241.664 parámetros) desarrollado por el usuario `hoangphu7122002ai` para un sistema de generación aumentada por recuperación (RAG) de preguntas y respuestas sobre legislación vietnamita. Forma parte del proyecto `law-rag`, construido para el curso *Large Language Models* de la HCMUT, con la restricción de que el modelo respondiente no supere los 4B de parámetros. El modelo está entrenado en vietnamita, con licencia "other" y pesos en safetensors en precisión bf16.

Este checkpoint concreto es el segundo ciclo de DPO de la cadena "fixed configuration": parte de un SFT con LoRA inicializado mediante PiSSA sobre el conjunto train+dev (1.915 filas SFT) y aplica dos rondas de DPO. Su función es demostrar que añadir el split de desarrollo al entrenamiento no mejora la puntuación en test (.640 ROUGE-L greedy frente a .643 del sistema reportado, dentro de la dispersión de semillas). No es, por tanto, el modelo principal del proyecto, sino un punto de control de validación metodológica.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, en un solo idioma y dominio, con 0 descargas y 0 likes en el momento de su publicación, y cuya tarjeta está orientada a documentar un experimento académico más que a ofrecer un artefacto de producción general. Su interés técnico reside en la combinación de PiSSA, DPO con pares de extensión y evaluación con ROUGE-L sobre un pipeline RAG completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), según el modelo base Qwen/Qwen3.5-2B; detalles internos de capas y atención no disponibles |
| Parametros totales | 2.213.241.664 (2,21B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (configuración de servicio recomendada con `--max-model-len 32768`); longitud máxima de entrenamiento en DPO: 12.288 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en bf16) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | `other` (sin detalle de términos en la información disponible) |
| Formato de pesos | safetensors (transformers); repositorio de 4,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen/Qwen3.5-2B. El pipeline de entrenamiento consta de una fase SFT con LoRA inicializado por PiSSA sobre 1.915 filas del conjunto `q35_CF` (train + dev), seguida de dos rondas de DPO. Los adaptadores LoRA se fusionan en los pesos finales (modelo "merged"), en bf16, de aproximadamente 4,5 GB. La segunda ronda de DPO parte del checkpoint `trainval-dpo1` y se entrena sobre 1.380 pares generados a partir de muestras frescas del propio modelo, con beta 0,1, learning rate 2e-5, 1 época, longitud máxima 12.288 y semilla 1, en 45 minutos sobre una única GPU L40S.

La innovación metodológica destacable es la construcción de los pares de preferencia: se mezcla una submuestra de pares estándar "mejor vs. peor" con pares de extensión (*extent pairs*), en los que la respuesta rechazada cita demasiado poco o demasiado del precepto correcto (muestras reales más copias truncadas o extendidas de la referencia). El objetivo es evitar que DPO aprenda una dirección de longitud espuria. El prompt de entrenamiento incluye una línea de sistema, pasajes recuperados con el formato `- Ngữ cảnh i: ...`, la pregunta y el modo de razonamiento (*thinking*) desactivado.

## Capacidades

- Generación de texto en vietnamita con registro jurídico formal: nombra primero la disposición (por ejemplo, "khoản 2 Điều 9 Thông tư 27/2025/TT-NHNN") y después la cita.
- Respuesta a preguntas extractivas y de comprensión sobre pasajes legales proporcionados en el contexto (question answering con contexto).
- Abstención controlada: cuando los pasajes no cubren la pregunta, el modelo rechaza responder en lugar de inferir.
- Seguimiento de instrucciones multi-restricción (responder solo con la información del contexto, no razonar en ausencia de evidencia).
- Soporte de few-shot mediante ejemplos insertados en el mismo mensaje de usuario.
- Compatibilidad con el template de chat de Qwen con `enable_thinking=False`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento matemático o de código. Aunque la etiqueta del repositorio incluye `image-text-to-text`, la tarjeta describe únicamente generación de texto; no hay evidencia de capacidades multimodales entrenadas.

## Casos de uso

- Consulta jurídica asistida sobre normativa vietnamita: el modelo recibe los artículos recuperados por el pipeline (top 5 de 50 tras reranking) y genera una respuesta citando la disposición concreta; es adecuado porque fue entrenado exactamente con ese formato de contexto y ese registro.
- Atención al ciudadano en portales gubernamentales: integrado detrás de un recuperador denso, responde preguntas frecuentes sobre trámites y plazos (por ejemplo, plazos de reporte de transacciones de transferencia electrónica) con abstención cuando la base documental no cubre la consulta.
- Verificación de citas normativas en borradores: el modelo puede comprobar si un pasaje recuperado respalda una afirmación y reformular la respuesta citando el artículo, lo que encaja con su entrenamiento en pares de extensión (citas demasiado cortas o demasiado largas penalizadas).
- Prototipado académico de sistemas RAG: sirve como referencia reproducible de una cadena SFT+DPO con PiSSA, con métricas publicadas (ROUGE-L, coseno, Jaccard, solapamiento de tokens, BLEU-1) para comparar variantes.
- Evaluación de pipelines de recuperación: al fijar el modelo respondiente, permite medir el impacto del recuperador (`AITeamVN/Vietnamese_Embedding` y `AITeamVN/Vietnamese_Reranker`) sobre la calidad final de la respuesta.
- Despliegue de bajo coste en una sola GPU: con 2,21B parámetros en bf16 y servicio vLLM con caché de prefijos, es viable en hardware modesto para demos internas o entornos de investigación.
- Generación de respuestas con formato controlado para evaluación automática: su salida consistente (cita primero, luego contenido) facilita el scraping y la comparación con referencias en experimentos.

## Benchmarks y rendimiento

Resultados publicados en la tarjeta del modelo (200 preguntas de test puntuadas una sola vez, con el pipeline de recuperación completo y 2 ejemplos few-shot):

| Metrica | Greedy | MBR-8 |
|---|---|---|
| ROUGE-L (test) | .640 | .646 |
| ROUGE-L (dev) | No medido (modelo entrenado con dev) | No medido |
| Similitud coseno | .919 | No disponible |
| Jaccard | .675 | No disponible |
| Solapamiento de tokens | .729 | No disponible |
| BLEU-1 | .586 | No disponible |

Comparación dentro de la familia `law-rag` (ROUGE-L en test, greedy / MBR-8):

| Modelo | Test ROUGE-L |
|---|---|
| `law-rag-qwen3.5-2b-sft` | .607 / – |
| `law-rag-qwen3.5-2b-dpo` (sistema reportado) | .643 / .652 |
| `law-rag-qwen3.5-2b-trainval-dpo2` (este modelo) | .640 / .646 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4,5 GB de pesos más caché KV; con contexto de 32.768 tokens la caché KV crece de forma significativa, por lo que se recomienda al menos 16-24 GB para uso cómodo con contextos largos.
- GPU recomendadas: L40S (usada en el entrenamiento de DPO), A100 o H100 para servicio con concurrencia; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 para contextos cortos; con cuantización a 8 o 4 bits (no publicada en el repositorio) cabría en 8 GB, aunque no hay artefactos GGUF oficiales.
- Opciones de despliegue: vLLM 0.30 (comando documentado con `--dtype bfloat16 --max-model-len 32768 --enable-prefix-caching`), `transformers` con `AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16")` y cliente compatible con la API de OpenAI. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento (45 minutos de DPO en 1 × L40S), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test ROUGE-L | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `law-rag-qwen3.5-2b-trainval-dpo2` (este) | 2,21B | 32.768 | .640 (greedy) | other | Hugging Face, 0 descargas |
| `law-rag-qwen3.5-2b-dpo` (sistema reportado) | 2,21B (misma base) | 32.768 | .643 (greedy) / .652 (MBR-8) | other | Hugging Face |
| `law-rag-qwen3.5-2b-sft` | 2,21B (misma base) | 32.768 | .607 (greedy) | other | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | 2,21B | No disponible en la información | No evaluado en este dominio | No disponible en la información | Hugging Face |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, otros modelos de 2-3B para QA jurídico en vietnamita) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas miden similitud con las referencias (ROUGE-L, coseno, Jaccard, BLEU-1), no corrección jurídica factual; una respuesta puede puntuar alto y ser sustantivamente errónea.
- El modelo está entrenado y evaluado exclusivamente en vietnamita; no se ha validado su comportamiento en otros idiomas.
- Depende críticamente del pipeline de recuperación: fuera de `law-rag` (recuperador denso, reranker, top 5 de 50, 2 ejemplos few-shot) los resultados pueden degradarse y las puntuaciones publicadas no son extrapolables.
- Riesgo de alucinación mitigado pero no eliminado: el modelo fue entrenado para rechazar cuando el contexto no cubre la pregunta, pero no hay evaluación independiente de la tasa de abstención correcta.
- Sesgos: no se documentan análisis de sesgo; al ser un ajuste sobre corpus normativo vietnamita, puede heredar sesgos del modelo base y del conjunto de datos `hoangphu7122002ai/law-rag-data`.
- Licencia `other` sin términos detallados en la información disponible: es imprescindible revisar las condiciones del autor y del modelo base Qwen/Qwen3.5-2B antes de cualquier uso comercial.
- Modelo de nicho con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- Este checkpoint concreto es un experimento de validación (train+dev) y no el sistema reportado; para uso real, la tarjeta del autor remite a `law-rag-qwen3.5-2b-dpo`.
- El modo de razonamiento (*thinking*) debe desactivarse (`enable_thinking=False`) para reproducir el comportamiento entrenado; activarlo produce una distribución fuera de la entrenada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo2
- Sistema reportado (SFT + 2 rondas DPO): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Checkpoint SFT: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Checkpoint SFT train+dev (PiSSA): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-sft
- Checkpoint DPO ronda 1 train+dev: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-trainval-dpo1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual del proyecto: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Dataset de entrenamiento: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Embedder usado en el pipeline: https://huggingface.co/AITeamVN/Vietnamese_Embedding
- Reranker usado en el pipeline: https://huggingface.co/AITeamVN/Vietnamese_Reranker
