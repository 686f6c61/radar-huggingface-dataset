# iamtatsuki05/Sentence-Sarashina-Bi-EN-1B

## Resumen

Sentence-Sarashina-Bi-EN-1B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05, parte de la colección MIREI. Se construye a partir del checkpoint preentrenado iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT y se afina mediante aprendizaje contrastivo supervisado sobre los subconjuntos supervisados del dataset sentence-transformers/embedding-training-data (AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA). El resultado es un encoder que produce embeddings de 1.792 dimensiones mediante mean pooling, pensado para tareas de similitud semántica, recuperación de información y clustering.

El modelo emplea una arquitectura Llama con 1.224 millones de parámetros totales (1.040 millones sin contar la capa de embeddings) y una longitud máxima de secuencia de 8.192 tokens. Su tokenizador es SentencePiece con un vocabulario de 102.400 entradas y usa codificación posicional RoPE. Está especializado exclusivamente en inglés y se distribuye bajo licencia MIT, lo que facilita su uso comercial.

Su relevancia radica en que supera a alternativas de tamaño comparable en la suite MTEB (eng, v2): obtiene un promedio macro de 57,56 frente a 54,76 de la variante ModernBERT y 52,94 de la variante Llama del mismo autor. Es, por tanto, una opción a considerar cuando se necesita un encoder de 1B con contexto largo para pipelines de búsqueda semántica o RAG en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder adaptado a encoder de embeddings) |
| Parametros totales | 1.224.038.144 (1.224M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo se usa en bfloat16 segun el ejemplo del autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Modelo base | iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT |
| Tamano del repositorio | 4,9 GB |
| Libreria | sentence-transformers (>= 4.1.0) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint preentrenado de arquitectura Llama y se adapta a la generación de embeddings de frase. La extracción del vector se realiza mediante mean pooling sobre las representaciones del último nivel, produciendo un embedding de 1.792 dimensiones normalizable para similitud coseno. La longitud máxima de secuencia es de 8.192 tokens, lo que permite codificar documentos relativamente largos sin truncamiento agresivo. El tokenizador SentencePiece con 102.400 entradas y la codificación posicional RoPE son heredados del modelo base.

El ajuste se realiza con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data, que incluyen AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. La model card no detalla el número exacto de tokens de entrenamiento, la composición proporcional del dataset ni si se aplicaron etapas adicionales de RLHF o DPO; esos datos figuran como no disponibles. La innovación principal documentada es la comparación sistemática entre arquitecturas encoder y decoder bajo condiciones idénticas, recogida en la publicación NLP2026 citada por el autor.

## Capacidades

- Generación de embeddings de frases en inglés de 1.792 dimensiones mediante mean pooling, con normalización opcional para similitud coseno.
- Feature extraction para tareas de similitud semántica entre pares de textos.
- Recuperación de información (retrieval) densa, adecuada para motores de búsqueda semántica y pipelines RAG.
- Reranking de documentos candidatos mediante puntuación de similitud query-documento.
- Clasificación de textos y clustering semántico a partir de los embeddings generados.
- Soporte de secuencias de hasta 8.192 tokens, útil para documentos largos o conversaciones extensas.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, según los tags del repositorio.
- Capacidad multilingüe limitada: solo inglés declarado.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un encoder de embeddings, no un modelo generativo de chat.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos en inglés con embeddings de 1.792 dimensiones y recuperar los fragmentos más relevantes ante una consulta en lenguaje natural, aprovechando la ventana de 8.192 tokens para chunks largos.
- Pipeline RAG para asistentes internos: usar el modelo como retriever denso sobre una base de conocimiento en inglés, generando embeddings normalizados y calculando similitud coseno para seleccionar el contexto que se pasa al modelo generativo.
- Deduplicación y detección de near-duplicates: codificar grandes volúmenes de tickets, preguntas de soporte o artículos y agrupar por similitud coseno para eliminar contenido redundante, apoyándose en el rendimiento de clustering del modelo (43,64 en MTEB-Clustering).
- Reranking en motores de búsqueda: reordenar los resultados de un retriever léxico (BM25) recalculando la similitud query-documento con el encoder, con un coste computacional contenido al tratarse de un modelo de 1B parámetros.
- Clasificación zero-shot por prototipos: construir embeddings de etiquetas y asignar categorías a textos nuevos por proximidad semántica, útil para triaje de correos o moderación de contenido en inglés.
- Análisis de similitud en investigación: comparar abstracts, patentes o publicaciones científicas en inglés para detectar trabajos relacionados, con la ventaja de procesar textos de hasta 8.192 tokens sin truncar.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y calcular afinidad mediante similitud coseno en un espacio de 1.792 dimensiones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2) que cubre las mismas cinco familias que JMTEB. Cada puntuación de familia promedia todos los datasets, splits y subconjuntos de esa familia; MTEB-Avg es la media macro sobre las cinco familias.

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-1B (este modelo) | Llama | 1224M | 57,56 | 44,90 | 79,78 | 73,48 | 45,98 | 43,64 |
| Sentence-ModernBERT-EN-1B | ModernBERT | 1304M | 54,76 | 42,27 | 76,72 | 68,47 | 43,87 | 42,46 |
| Sentence-Llama-Bi-EN-1B | Llama | 1224M | 52,94 | 39,04 | 75,45 | 66,46 | 42,47 | 41,28 |

El modelo supera a las dos alternativas en las seis métricas reportadas, con una ventaja de 2,80 puntos en MTEB-Avg sobre la variante ModernBERT y de 4,62 puntos sobre la variante Llama. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un modelo de embeddings y no de generación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para pesos (1.224M parámetros × 2 bytes), más overhead de activaciones y del tokenizador; en la práctica se recomienda reservar entre 4 y 6 GB para lotes pequeños.
- En float32 la huella de pesos sube a unos 4,9 GB, coherente con el tamaño del repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para entornos de desarrollo y producción de volumen moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante) usando bfloat16 o float16; con cuantización adicional cabría en GPUs de 4-6 GB, aunque el autor no documenta formatos cuantizados.
- Opciones de despliegue: sentence-transformers (librería nativa), text-embeddings-inference (tag endpoints_compatible), transformers con accelerate, y potencialmente vLLM o TGI para servir embeddings en producción; requiere trust_remote_code=True por el código personalizado del repositorio.
- Dependencias declaradas: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 para la implementación con FlashAttention 2.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB-Avg (eng v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-EN-1B | 1224M | 8.192 | 57,56 | MIT | Hugging Face |
| Sentence-ModernBERT-EN-1B | 1304M | no disponible | 54,76 | no disponible | Hugging Face |
| Sentence-Llama-Bi-EN-1B | 1224M | no disponible | 52,94 | no disponible | Hugging Face |

Las tres alternativas pertenecen a la misma colección MIREI del mismo autor y comparten metodología de entrenamiento, por lo que la comparación es directa. La variante ModernBERT usa una arquitectura encoder pura, mientras que las dos variantes Llama adaptan un decoder a la extracción de embeddings; esta última obtiene el mejor resultado global. No se dispone de datos de licencia ni de longitud de contexto para las dos alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en inglés: no se declara soporte para castellano ni otros idiomas, por lo que su uso en entornos multilingües requeriría un modelo distinto.
- Es un encoder de embeddings, no un modelo generativo: no puede responder preguntas ni mantener conversaciones por sí mismo; debe integrarse en un pipeline con un generador separado.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí existe riesgo de recuperaciones semánticamente plausibles pero incorrectas en dominios muy especializados o con vocabulario fuera de distribución.
- Sesgos potenciales heredados del modelo base y de los datasets de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), que están sesgados hacia dominios web y de preguntas-respuestas; no se documenta ninguna evaluación de sesgos.
- La model card no detalla el volumen de datos de entrenamiento ni la composición exacta, lo que dificulta evaluar la cobertura de dominios.
- Requiere trust_remote_code=True y código personalizado del repositorio, lo que implica revisar el código antes de desplegarlo en producción.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- El modelo se publicó en septiembre de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta, por lo que carece de validación independiente de la comunidad.
- La longitud de contexto de 8.192 tokens es adecuada para documentos medios, pero puede ser insuficiente para contratos o informes muy extensos sin fragmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B
- Modelo base preentrenado: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B
- Variante Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B
- Licencia MIT: https://opensource.org/license/mit/
- Referencia académica: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", 言語処理学会第 32 回年次大会 (NLP2026)
