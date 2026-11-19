# iamtatsuki05/Sentence-ModernBERT-EN-1B

## Resumen

Sentence-ModernBERT-EN-1B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un fine-tune del checkpoint base iamtatsuki05/Sentence-ModernBERT-EN-1B-PT mediante aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data (AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA). El resultado es un encoder que produce embeddings de 1.792 dimensiones con pooling de media y similitud coseno.

El modelo parte de la arquitectura ModernBERT, un transformer encoder que sustituye la codificación posicional clásica por RoPE y admite secuencias de hasta 8.192 tokens. Con 1.304 millones de parámetros totales (1.120 millones sin contar la matriz de embeddings), el tokenizador es SentencePiece con un vocabulario de 102.400 tokens, lo que permite manejar texto técnico y multilingüe dentro de un modelo declarado solo para inglés.

Su relevancia radica en que ofrece una alternativa de 1B parámetros para tareas de recuperación y similitud semántica con contexto largo, un segmento tradicionalmente dominado por encoders más pequeños (300-600M) o por modelos decoder adaptados. En la comparativa interna de la serie MIREI, este modelo queda por debajo de Sentence-Sarashina-Bi-EN-1B en la media de MTEB (eng, v2) pero por encima de Sentence-Llama-Bi-EN-1B, y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con RoPE) |
| Parametros totales | 1.301.108.480 (1.304M) |
| Parametros activos | no aplica (no es MoE) |
| Parametros sin embeddings | 1.120M |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en bfloat16; no se documentan GGUF ni otras variantes) |
| Dimension del embedding | 1.792 (mean pooling) |
| Vocabulario | 102.400 tokens (SentencePiece) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Metrica de similitud | coseno |
| Tamano del repo | 5,2 GB |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT con codificación posicional rotatoria (RoPE) y atención con soporte para FlashAttention-2 (la model card recomienda `flash-attn>=2.7.3` y `attn_implementation="flash_attention_2"`). La salida se obtiene mediante mean pooling sobre la secuencia y se normaliza para usar similitud coseno. El checkpoint base es un modelo entrenado con objetivo de masked language modeling (tag `masked-lm`), sobre el que se aplica un segundo estadio de fine-tuning.

El entrenamiento de este checkpoint consiste en aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data: AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. Esta combinación cubre pares de inferencia natural, recuperación de pasajes, duplicados de preguntas y pares pregunta-respuesta. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta por dataset ni si se aplicaron etapas adicionales de RLHF o DPO (poco habituales en encoders de embeddings).

La innovación principal es arquitectónica: emplear un encoder ModernBERT de escala 1B con contexto de 8.192 tokens para embeddings, en lugar de los encoders pequeños habituales (MiniLM, BGE-base) o de decoders adaptados. El tokenizador con vocabulario de 102.400 tokens reduce la fragmentación del texto de entrada, lo que resulta relevante en recuperación sobre documentos largos.

## Capacidades

- Generación de embeddings de frases y pasajes en inglés con 1.792 dimensiones.
- Similitud semántica entre pares de textos (pipeline sentence-similarity).
- Recuperación de información (retrieval) sobre documentos de hasta 8.192 tokens por pasaje.
- Clasificación de textos y clustering mediante las representaciones generadas (evaluado en MTEB).
- Reranking de candidatos recuperados previamente.
- Manejo de pares pregunta-respuesta y detección de duplicados (Quora, NQ, SQuAD, TriviaQA en el entrenamiento).
- Integración con text-embeddings-inference y endpoints compatibles (tags del repo).
- Soporte de FlashAttention-2 para acelerar la inferencia.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar fragmentos de hasta 8.192 tokens y recuperar los más relevantes para una consulta mediante similitud coseno, aprovechando el contexto largo de ModernBERT para no trocear en exceso.
- Motor de preguntas frecuentes: comparar la consulta del usuario con un banco de preguntas-respuestas previamente embebidas, usando el entrenamiento sobre NQ y Quora para mejorar la detección de paráfrasis.
- Deduplicación de contenidos: generar embeddings de artículos o tickets y agrupar por similitud para detectar duplicados, apoyándose en las capacidades de clustering evaluadas en MTEB.
- Reranking en pipelines RAG: tras una primera fase de recuperación léxica (BM25), reordenar los candidatos con este modelo para mejorar la precisión antes de pasarlos a un LLM generador.
- Clasificación de tickets de soporte: usar los embeddings como entrada a un clasificador ligero (regresión logística o MLP) para enrutar incidencias por categoría, con la ventaja de no requerir reentrenamiento del encoder.
- Moderación y agrupación de feedback: agrupar comentarios de usuarios por temática en un panel de analítica, empleando clustering sobre los embeddings normalizados.
- Búsqueda en bases de conocimiento internas: desplegar el modelo con text-embeddings-inference detrás de un endpoint compatible y servir consultas en inglés con latencia controlada en GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2), con media macro sobre cinco familias:

| Modelo | Arquitectura | Parametros | MTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-1B (este modelo) | ModernBERT | 1304M | 54,76 | 42,27 | 76,72 | 68,47 | 43,87 | 42,46 |
| Sentence-Llama-Bi-EN-1B | Llama | 1224M | 52,94 | 39,04 | 75,45 | 66,46 | 42,47 | 41,28 |
| Sentence-Sarashina-Bi-EN-1B | Llama | 1224M | 57,56 | 44,90 | 79,78 | 73,48 | 45,98 | 43,64 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al tratarse de un encoder y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,6 GB solo para pesos (1.304M parámetros × 2 bytes), más memoria para activaciones; con secuencias de 8.192 tokens y FlashAttention-2 el pico puede situarse en el rango de 6-10 GB según el tamaño de lote.
- En fp32 los pesos ocupan unos 5,2 GB, coherente con el tamaño del repo.
- GPU recomendadas: A100, H100 o L40S para indexación masiva a gran throughput; RTX 4090 o RTX 3090 son suficientes para lotes moderados.
- Cabe en GPUs de consumo con al menos 8-12 GB de VRAM para lotes pequeños y secuencias cortas; para secuencias de 8.192 tokens se recomienda 16 GB o más.
- Opciones de despliegue: sentence-transformers (librería nativa), text-embeddings-inference (tag `text-embeddings-inference` en el repo), y endpoints compatibles. La información disponible no documenta soporte de llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | MTEB-Avg (eng, v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-1B | ModernBERT | 1304M | 8.192 | 54,76 | MIT | Hugging Face |
| Sentence-Llama-Bi-EN-1B | Llama (bi-encoder) | 1224M | no disponible | 52,94 | no disponible en la información | Hugging Face |
| Sentence-Sarashina-Bi-EN-1B | Llama (bi-encoder) | 1224M | no disponible | 57,56 | no disponible en la información | Hugging Face |

Frente a los dos modelos Llama de la misma serie, este checkpoint destaca por su contexto de 8.192 tokens y por una media de MTEB superior a Sentence-Llama-Bi-EN-1B, aunque queda por detrás de Sentence-Sarashina-Bi-EN-1B en todas las familias evaluadas. No se dispone de comparación con modelos externos a la serie MIREI (por ejemplo, BGE o E5) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado ni garantizado, pese al vocabulario multilingüe del tokenizador.
- Al ser un encoder de embeddings, no genera texto y no puede usarse como modelo de chat ni de razonamiento.
- Riesgo de sesgos heredados de los datasets de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), que están centrados en dominios web y de preguntas-respuestas en inglés.
- El rendimiento en dominios especializados (legal, médico, código) no está documentado y puede degradarse frente a modelos específicos.
- La longitud máxima de 8.192 tokens implica coste cuadrático en atención sin FlashAttention-2; sin esa implementación el consumo de memoria crece de forma notable.
- Aunque la licencia es MIT, conviene verificar las condiciones de los datasets de entrenamiento antes de un uso comercial en dominios sensibles.
- Modelo con muy poca adopción (5 descargas, 0 likes en el momento de la consulta) y sin validación externa independiente más allá de los resultados de MTEB publicados por el autor.
- No se documentan variantes cuantizadas; el despliegue en CPU requeriría conversión manual a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B
- Modelo base: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B-PT
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo comparable Sentence-Llama-Bi-EN-1B: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B
- Modelo comparable Sentence-Sarashina-Bi-EN-1B: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia (NLP2026): no disponible como enlace directo en la información proporcionada; cita en la model card como «同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析», Okada y Sugimoto.
