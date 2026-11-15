# iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B

## Resumen

Sentence-InstructLM-Bi-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 (serie MIREI), obtenido mediante ajuste fino supervisado con aprendizaje contrastivo sobre el checkpoint iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT. Parte de una arquitectura Mistral con 518.702.592 parámetros totales (469M sin contar embeddings) y produce representaciones densas de 1.536 dimensiones mediante mean pooling sobre una ventana máxima de 2.048 tokens.

El modelo resuelve tareas de similitud semántica, recuperación de información (retrieval), clasificación, reranking y clustering sobre texto en inglés, y se distribuye con licencia MIT, lo que facilita su uso comercial. Emplea una arquitectura bi-encoder (codifica consulta y documento por separado), lo que permite precalcular los embeddings de un corpus y realizar búsquedas por similitud coseno con latencia baja.

Su relevancia radica en que, con solo ~0,5B de parámetros, alcanza un MTEB-Avg de 57,73 en el subconjunto inglés de 37 tareas (MTEB eng v2), superando en la comparativa del autor a alternativas como Sentence-ModernBERT-EN-0.5B (53,66), Sentence-Llama-Bi-EN-0.5B (52,12) y Sentence-Qwen2.5-Bi-EN-0.5B (57,19). Está pensado para pipelines de búsqueda semántica y RAG donde el coste de inferencia y el tamaño del modelo son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder adaptado a bi-encoder para embeddings) |
| Parametros totales | 518.702.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.536 (mean pooling) |
| Metrica de similitud | coseno |
| Tokenizer | Mistral, vocabulario de 32.000 |
| Codificacion posicional | RoPE |
| Parametros sin embeddings | 469M |
| Tamano del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral, reutilizada como codificador bi-encoder: cada texto (consulta o documento) se procesa de forma independiente y se agrega en un único vector de 1.536 dimensiones mediante mean pooling. La codificación posicional es RoPE y el tokenizer es el de Mistral con vocabulario de 32.000 entradas. La longitud máxima de secuencia es de 2.048 tokens.

El entrenamiento consiste en un ajuste fino con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados del dataset sentence-transformers/embedding-training-data, en concreto AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. El punto de partida es el checkpoint débilmente supervisado iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT, que a su vez deriva de un modelo InstructLM de 500M. El autor no documenta en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de frases en inglés de 1.536 dimensiones con normalización L2 opcional.
- Similitud semántica entre pares de textos mediante distancia coseno.
- Recuperación de información (retrieval) consulta-documento en modo bi-encoder.
- Clasificación de textos y reranking de candidatos a partir de sus embeddings.
- Clustering y deduplicación semántica de documentos.
- Soporte de textos de hasta 2.048 tokens por entrada.
- Compatible con la librería sentence-transformers (>=4.1.0) y con text-embeddings-inference (tag endpoints_compatible).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni modo thinking.
- Sin capacidades de visión, audio ni multilingüismo (solo inglés).

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar cada página como embedding de 1.536 dimensiones y recuperar los fragmentos más relevantes para una consulta en inglés; el tamaño de 0,5B permite indexar corpus grandes en una sola GPU.
- RAG (retrieval-augmented generation): usar el modelo como retriever en un pipeline que alimente a un LLM generativo, precalculando los embeddings del corpus por ser un bi-encoder.
- Deduplicación de registros y tickets: agrupar por similitud coseno entradas con el mismo significado aunque difieran en redacción, útil en bases de datos de soporte.
- Clasificación zero-shot por prototipos: comparar el embedding de un texto con los embeddings medios de cada categoría para asignar etiquetas sin entrenar un clasificador.
- Reranking de resultados de búsqueda léxica: recuperar candidatos con BM25 y reordenarlos según la similitud semántica del modelo.
- Detección de preguntas duplicadas en foros o plataformas de Q&A, aprovechando el entrenamiento sobre Quora duplicate questions.
- Filtrado de contenido y agrupación temática de noticias o reseñas en inglés.
- Construcción de índices vectoriales para motores como FAISS, Qdrant o pgvector con vectores de 1.536 dimensiones.

## Benchmarks y rendimiento

Resultados publicados por el autor en el subconjunto inglés de MTEB (eng, v2) de 37 tareas, comparando con modelos de la misma serie:

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-InstructLM-Bi-EN-0.5B (este modelo) | Mistral | 518M | **57,73** | **46,11** | **80,01** | **73,19** | **45,71** | 43,62 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | **45,15** |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B | Qwen2.5 | 494M | 51,73 | 36,70 | 73,86 | 65,20 | 42,00 | 40,90 |

Cada puntuación de familia promedia todos los datasets, splits y subconjuntos de la familia; MTEB-Avg es la media macro sobre las cinco familias. No se han publicado en la información disponible resultados de benchmarks de otros tipos (MMLU, HumanEval, GSM8K), ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,1-1,3 GB solo para pesos (518M parámetros × 2 bytes), más overhead de activaciones y del runtime; en la práctica cabe holgadamente en 4 GB.
- En cuantización de 8 bits: aproximadamente 0,6 GB de pesos; en 4 bits, aproximadamente 0,3 GB (aunque el autor no publica pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para indexación a gran escala se recomienda A100, H100 o L40S por throughput.
- Cabe en GPU consumer y en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (>=4.1.0), text-embeddings-inference (endpoints_compatible), y frameworks compatibles con transformers (>=4.51.0). El autor recomienda flash-attn >=2.7.3 y accelerate >=1.6.0.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB-Avg (eng v2, 37 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-InstructLM-Bi-EN-0.5B | 518M | 2.048 | 57,73 | MIT | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | 494M | no disponible | 57,19 | no disponible | Hugging Face |
| Sentence-Sarashina-Bi-EN-0.5B | 661M | no disponible | 56,54 | no disponible | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | 677M | no disponible | 53,66 | no disponible | Hugging Face |

Frente a Sentence-Qwen2.5-Bi-EN-0.5B, el modelo de este análisis obtiene mejores resultados en Retrieval (46,11 frente a 44,18), STS (80,01 frente a 79,48), Classification (73,19 frente a 71,92) y Reranking (45,71 frente a 45,23), pero queda por detrás en Clustering (43,62 frente a 45,15). Frente a Sentence-Sarashina-Bi-EN-0.5B, gana en todas las familias salvo un margen estrecho en Reranking (45,71 frente a 45,39). Los datos de contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse para recuperación o similitud en otros idiomas.
- Ventana máxima de 2.048 tokens: los documentos más largos deben trocearse, lo que puede perder contexto global.
- Al ser un modelo de embeddings y no generativo, no puede responder preguntas ni razonar; solo produce representaciones vectoriales.
- Riesgo de sesgos heredados de los datos de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), que están sesgados hacia dominios de búsqueda web y Q&A en inglés.
- Riesgo de falsos positivos en similitud semántica con textos cortos o ambiguos; conviene calibrar umbrales por dominio.
- El modelo tiene muy pocas descargas y likes (1 descarga, 0 likes en el momento de la consulta), por lo que carece de validación comunitaria amplia fuera de los benchmarks del autor.
- Requiere trust_remote_code=True y versiones recientes de sentence-transformers (>=4.1.0) y transformers (>=4.51.0); la compatibilidad con versiones antiguas no está garantizada.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento subyacentes si se redistribuye el modelo.
- No se documentan pesos cuantizados oficiales ni resultados de latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B
- Modelo base (PT): https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelos comparables de la serie:
  - https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
  - https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B
  - https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B
  - https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B
  - https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B
  - https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B
- Licencia MIT: https://opensource.org/license/mit/
- Cita académica: Okada, R. y Sugimoto, T., «同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析», NLP2026 (言語処理学会第 32 回年次大会).
