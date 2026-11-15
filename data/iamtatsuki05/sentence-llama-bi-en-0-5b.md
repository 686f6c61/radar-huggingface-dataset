# iamtatsuki05/Sentence-Llama-Bi-EN-0.5B

## Resumen

Sentence-Llama-Bi-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un encoder bi-directional derivado de un Llama de aproximadamente 0,5B de parámetros (661.976.320 parámetros totales según los pesos en safetensors) que se ha afinado mediante aprendizaje contrastivo supervisado para producir representaciones vectoriales de 1.280 dimensiones. Su propósito es servir como modelo de recuperación (retrieval), similitud semántica y clustering en pipelines RAG y de búsqueda semántica.

El modelo parte de un checkpoint pre-entrenado intermedio, `iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT`, y se afina sobre los subconjuntos supervisados del dataset `sentence-transformers/embedding-training-data` (AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA). El resultado es un encoder que admite secuencias de hasta 8.192 tokens y emplea mean pooling con similitud coseno.

Su relevancia actual radica en que forma parte de un estudio comparativo sistemático (NLP2026) sobre arquitecturas encoder vs. decoder para embeddings de frases bajo condiciones de entrenamiento idénticas. En ese contexto, este modelo representa la variante Llama del estudio y ofrece una alternativa MIT de tamaño medio con contexto largo, orientada a entornos donde se requiere equilibrio entre calidad de recuperación y coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (encoder bi-directional derivado de decoder) |
| Parámetros totales | 661.976.320 (661M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificación posicional | RoPE |
| Métrica de similitud | coseno |
| Modelo base | iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT |
| Tamaño del repositorio | 2,7 GB |
| Librería | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, adaptada a un uso bi-directional para generar embeddings de frases. Emplea codificación posicional RoPE, un tokenizer SentencePiece con vocabulario de 102.400 entradas y produce representaciones de 1.280 dimensiones mediante mean pooling sobre la secuencia de tokens. Admite entradas de hasta 8.192 tokens, lo que lo sitúa por encima de la mayoría de encoders dedicados de tamaño similar y lo hace apto para documentos largos en pipelines de recuperación.

El entrenamiento parte del checkpoint `iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT` y aplica aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de `sentence-transformers/embedding-training-data`: AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. Esta combinación cubre tareas de inferencia textual, recuperación de pasajes, duplicados de preguntas y question answering. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición por proporciones ni si se aplicaron fases adicionales de RLHF o DPO; el modelo card solo indica la metodología contrastiva supervisada.

## Capacidades

- Generación de embeddings de frases en inglés de 1.280 dimensiones mediante mean pooling.
- Recuperación semántica (retrieval) sobre documentos de hasta 8.192 tokens.
- Similitud semántica entre pares de frases y detección de duplicados.
- Clustering y clasificación de textos a partir de sus representaciones vectoriales.
- Reranking de resultados de búsqueda mediante similitud coseno.
- Soporte de `trust_remote_code` y código personalizado (`custom_code`) para su carga en sentence-transformers.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints compatibles.
- Uso con `flash_attention_2` y `torch.bfloat16` según el código de ejemplo del autor.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento: es exclusivamente un encoder de embeddings.

## Casos de uso

- Recuperación aumentada por generación (RAG): indexar fragmentos de documentación de hasta 8.192 tokens y recuperar los pasajes más relevantes para una consulta; el contexto largo reduce la necesidad de trocear agresivamente los documentos.
- Búsqueda semántica en bases de conocimiento internas: generar embeddings de artículos, tickets o wikis y servir búsquedas por similitud coseno con el modelo como encoder de consulta y de documento.
- Deduplicación de contenidos: detectar preguntas o artículos duplicados en foros y catálogos usando la similitud entre embeddings, entrenado específicamente con Quora duplicate questions.
- Reranking en pipelines de búsqueda híbrida: reordenar los candidatos devueltos por un motor léxico (BM25) aplicando la similitud coseno del modelo sobre pares consulta-documento.
- Clustering y etiquetado temático: agrupar grandes volúmenes de texto (reseñas, noticias, tickets) en función de sus embeddings para análisis exploratorio o enrutamiento automático.
- Question answering extractivo: emparejar preguntas con pasajes de soporte en corpus tipo SQuAD o TriviaQA, aprovechando que el entrenamiento incluyó esos datasets.
- Moderación y detección de proximidad semántica: comparar mensajes entrantes contra una lista de referencia de contenidos similares para señalizar casos potencialmente problemáticos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2), con media macro sobre cinco familias:

| Modelo | Arquitectura | Params | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-EN-0.5B (este modelo) | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B | Qwen2.5 | 494M | 51,73 | 36,70 | 73,86 | 65,20 | 42,00 | 40,90 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |

No se han publicado en la información disponible resultados individuales por tarea (MMLU, HumanEval, GSM8K u otras) ni comparaciones con modelos externos a la familia MIREI.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 1,3-1,5 GB solo para pesos, más overhead de activaciones y del runtime de sentence-transformers; en la práctica, 2-3 GB suelen ser suficientes para lotes moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7 GB de pesos; en 4 bits, en torno a 0,35 GB (no se documentan cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del tamaño del modelo).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; para servir a gran escala se recomiendan A100, H100 o L40S.
- Cabe en GPU consumer: sí, en todas las GPU con 4 GB o más de VRAM, incluidas portátiles recientes.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), transformers con `trust_remote_code`, y endpoints compatibles con TEI.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de `flash_attention_2` y `torch.bfloat16` está documentado como configuración recomendada por el autor y reduce el coste de atención en secuencias largas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | Contexto | MTEB-Avg (eng) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 8.192 | 52,12 | MIT | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | no disponible | 53,66 | no disponible en la información | Hugging Face |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | no disponible | 52,70 | no disponible en la información | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | no disponible | 57,19 | no disponible en la información | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | no disponible | 57,73 | no disponible en la información | Hugging Face |

Dentro de la familia MIREI, este modelo Llama queda ligeramente por debajo de ModernBERT y Mistral en media MTEB, y claramente por debajo de las variantes Sarashina, Qwen2.5 e InstructLM. Su principal ventaja frente a varios competidores del mismo tamaño es el contexto de 8.192 tokens, superior al de encoders dedicados habituales.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta otros idiomas de forma nativa, lo que limita su uso en entornos multilingües.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso; su uso está restringido a la producción de embeddings.
- Riesgo de sesgos: al entrenarse sobre AllNLI, MS MARCO, Quora, NQ, SQuAD y TriviaQA, puede heredar sesgos de dominios (preguntas de foros, Wikipedia, noticias) y de la composición de esos corpus; no se documentan análisis de sesgo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en recuperación cuando los textos comparten vocabulario pero no significado; conviene calibrar umbrales por dominio.
- Rendimiento por debajo de otras variantes de la misma familia en MTEB (52,12 frente a 57,73 de InstructLM-Bi y 57,19 de Qwen2.5-Bi), por lo que no es la opción preferente dentro de MIREI si la calidad de recuperación es prioritaria.
- Requiere `trust_remote_code=True` y código personalizado, lo que añade una dependencia de confianza sobre el repositorio del autor.
- Dependencias específicas (sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0, flash-attn >= 2.7.3) que pueden complicar el despliegue en entornos con versiones fijadas.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía ni soporte por parte del autor.
- Sin datos publicados de latencia, throughput ni comportamiento en producción; conviene validar en el dominio concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B
- Modelo base (PT): https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo comparativo ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
- Modelo comparativo Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B
- Modelo comparativo Mistral: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B
- Modelo comparativo Qwen2.5: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B
- Modelo comparativo InstructLM: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B
- Licencia MIT: https://opensource.org/license/mit/
