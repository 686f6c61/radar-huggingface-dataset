# iamtatsuki05/Sentence-Llama-Bi-EN-1B

## Resumen
Sentence-Llama-Bi-EN-1B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un encoder derivado de una arquitectura Llama de aproximadamente 1.224 millones de parámetros, afinado mediante aprendizaje contrastivo supervisado sobre los subconjuntos supervisados del dataset `sentence-transformers/embedding-training-data` (AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA). Su función es transformar texto en vectores densos de 1.792 dimensiones para tareas de similitud semántica, recuperación de información y clustering.

El modelo parte del checkpoint `iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT` y emplea pooling por media junto con similitud coseno. Soporta secuencias de hasta 8.192 tokens, lo que lo sitúa por encima de muchos encoders clásicos limitados a 512 tokens, y utiliza el tokenizador SentencePiece con un vocabulario de 102.400 entradas.

Su relevancia actual radica en que forma parte de un estudio comparativo sobre el rendimiento de arquitecturas encoder frente a decoder en la generación de embeddings de frases bajo condiciones controladas, presentado en el congreso NLP2026. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder transformer adaptado a encoder de embeddings) |
| Parametros totales | 1.224.038.144 (1.224 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 1.040 M |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Llama, un transformer decoder-only que aquí se emplea como encoder bidireccional de frases. La representación final se obtiene mediante mean pooling sobre las activaciones del modelo, produciendo un vector de 1.792 dimensiones normalizado para similitud coseno. La codificación posicional es RoPE y el tokenizador SentencePiece cubre un vocabulario de 102.400 tokens.

El entrenamiento parte del checkpoint `Sentence-Llama-Bi-EN-1B-PT`, que actúa como punto de partida con supervisión débil, y continúa con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de `sentence-transformers/embedding-training-data`: AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de embeddings de frases en inglés de 1.792 dimensiones con normalización L2 opcional.
- Similitud semántica entre pares de textos mediante coseno.
- Recuperación de información (retrieval) densa para consultas y documentos.
- Clasificación de textos y clustering semántico a partir de los vectores generados.
- Reranking de candidatos recuperados en pipelines de búsqueda.
- Procesamiento de secuencias largas de hasta 8.192 tokens, útil para documentos extensos.
- Extracción de características (`feature-extraction`) compatible con la librería `sentence-transformers` y con Text Embeddings Inference.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de embeddings, no un modelo generativo conversacional.
- No dispone de capacidades de visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Búsqueda semántica en documentación técnica: indexar manuales y fragmentos de hasta 8.192 tokens y recuperar los pasajes más relevantes para una consulta en inglés mediante similitud coseno, aprovechando la ventana larga para no trocear en exceso.
- Motor de preguntas frecuentes: generar embeddings de las preguntas de los usuarios y compararlos contra una base de respuestas precalculada, con umbral de similitud para derivar a atención humana cuando no haya coincidencia suficiente.
- Deduplicación de contenidos: calcular embeddings de artículos o tickets y agrupar los que superen un umbral de similitud para eliminar duplicados en bases de conocimiento.
- Clustering de feedback de usuarios: agrupar reseñas o comentarios en inglés por temática usando los vectores de 1.792 dimensiones y algoritmos como HDBSCAN o k-means.
- Reranking en pipelines RAG: usar el modelo como segunda etapa de ordenación tras una recuperación inicial con BM25, comparando la consulta con cada fragmento candidato.
- Moderación y clasificación de textos: entrenar un clasificador ligero (regresión logística, SVM) sobre los embeddings para etiquetar contenido en inglés con coste de inferencia bajo.
- Análisis de similitud entre documentos legales o académicos: comparar versiones de contratos o resúmenes de papers mediante la distancia coseno entre sus representaciones.

## Benchmarks y rendimiento
Resultados publicados por el autor en la model card, medidos sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2):

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-1B | ModernBERT | 1304 M | 54,76 | 42,27 | 76,72 | 68,47 | 43,87 | 42,46 |
| Sentence-Llama-Bi-EN-1B (este modelo) | Llama | 1224 M | 52,94 | 39,04 | 75,45 | 66,46 | 42,47 | 41,28 |
| Sentence-Sarashina-Bi-EN-1B | Llama | 1224 M | 57,56 | 44,90 | 79,78 | 73,48 | 45,98 | 43,64 |

Cada puntuación de familia promedia todos los datasets, splits y subconjuntos de la familia; MTEB-Avg es la media macro sobre las cinco familias. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo de embeddings.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y atención; en la práctica, entre 4 y 6 GB con lotes pequeños.
- En fp32, los pesos ocupan unos 4,9 GB, por lo que se recomienda bfloat16 o float16.
- GPU recomendadas: NVIDIA A100, H100 o L40S para alto throughput; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y producción de volumen medio.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores) usando bfloat16.
- Opciones de despliegue: `sentence-transformers` (recomendado por el autor), Hugging Face Text Embeddings Inference (TEI), vLLM con soporte de embeddings, y despliegue con `transformers` + `accelerate`. El autor requiere `flash-attn>=2.7.3` para la implementación de atención con FlashAttention 2.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 1.224 M de parámetros, se espera un throughput notablemente inferior al de encoders de 100-300 M como MiniLM o BGE-small, pero superior al de modelos de 7B.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-EN-1B | Llama | 1224 M | 8.192 | 52,94 | MIT | Hugging Face |
| Sentence-ModernBERT-EN-1B | ModernBERT | 1304 M | no disponible en la información | 54,76 | no disponible en la información | Hugging Face |
| Sentence-Sarashina-Bi-EN-1B | Llama | 1224 M | no disponible en la información | 57,56 | no disponible en la información | Hugging Face |

Los tres modelos pertenecen a la misma familia MIREI y comparten metodología de entrenamiento, por lo que la comparación es directa. El modelo Sarashina obtiene las mejores puntuaciones en todas las familias MTEB reportadas, mientras que ModernBERT supera a este Llama en la media global. No se dispone de comparaciones con modelos externos como BGE, E5 o GTE en la información proporcionada.

## Limitaciones y advertencias
- Modelo monolingüe en inglés: no está entrenado ni evaluado para otros idiomas, por lo que su uso en castellano u otras lenguas producirá embeddings de baja calidad.
- Es un modelo de embeddings, no generativo: no puede responder preguntas, razonar ni ejecutar herramientas.
- Riesgo de sesgos heredados de los datos de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), que pueden reflejar sesgos de género, culturales o geográficos presentes en dichas fuentes.
- La longitud de contexto de 8.192 tokens es amplia, pero el mean pooling sobre secuencias muy largas puede diluir la información relevante; conviene evaluar el troceado en cada caso de uso.
- Los benchmarks MTEB reportados por el autor no han sido verificados de forma independiente en la información disponible.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se recomienda conservar el aviso de copyright y citar el trabajo original.
- El modelo requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de desplegarlo en entornos de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B
- Modelo base: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B
- Modelo hermano Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia (NLP2026, actas no enlazadas en la información disponible): título «同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析», autores 岡田 龍樹 y 杉本 徹.
