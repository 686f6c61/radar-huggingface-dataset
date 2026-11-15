# iamtatsuki05/Sentence-Sarashina-Bi-JP-1B

## Resumen

Sentence-Sarashina-Bi-JP-1B es un modelo de embeddings de frases en japones desarrollado por iamtatsuki05, publicado bajo la familia MIREI. Se trata de un encoder basado en la arquitectura Llama con 1.224 millones de parametros totales (1.040 millones sin contar la capa de embeddings) que transforma texto japones en vectores densos de 1.792 dimensiones mediante mean pooling. El modelo parte de un checkpoint preentrenado (Sentence-Sarashina-Bi-JP-1B-PT) y se afina con aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft.

El modelo resuelve tareas de recuperacion de informacion, similitud semantica y clasificacion de textos en japones, y su relevancia radica en que supera a alternativas de su misma familia en la mayoria de las tareas del benchmark JMTEB v2, con una puntuacion media de 66,36 frente a 63,51 de la variante ModernBERT y 61,50 de la variante Llama estandar. Soporta secuencias de hasta 8.192 tokens, lo que lo hace adecuado para documentos largos, y se distribuye con licencia MIT, lo que facilita su uso comercial.

La arquitectura es un transformer decoder-only de tipo Llama adaptado a extraccion de caracteristicas (feature-extraction), con tokenizador SentencePiece de vocabulario 102.400 y codificacion posicional RoPE. Su pipeline en Hugging Face es sentence-similarity y se integra de forma nativa con sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only adaptado a embeddings) |
| Parametros totales | 1.224.038.144 (1.224M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Tamano del repositorio | 4,9 GB |

## Arquitectura y entrenamiento

El modelo es un encoder derivado de un transformer decoder-only de tipo Llama. La adaptacion a embeddings se realiza mediante mean pooling sobre las representaciones del ultimo nivel, generando vectores de 1.792 dimensiones que se normalizan para compararse con similitud coseno. El contexto maximo es de 8.192 tokens, gestionado con RoPE, y el tokenizador SentencePiece cubre un vocabulario de 102.400 entradas. El modelo base es Sentence-Sarashina-Bi-JP-1B-PT, un checkpoint con supervision debil (weakly supervised) que sirve de punto de partida.

El afinamiento se realiza con aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft, un conjunto de datos japones orientado a tareas de recuperacion y similitud semantica. El autor no detalla en la model card el numero exacto de tokens de entrenamiento, la composicion interna del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La innovacion principal del modelo es la comparacion sistematica entre arquitecturas encoder y decoder bajo condiciones identicas, documentada en la publicacion asociada (NLP2026), que demuestra que un decoder Llama correctamente adaptado puede superar a un encoder ModernBERT en tareas de embeddings japoneses.

## Capacidades

- Generacion de embeddings de frases en japones: convierte consultas y documentos en vectores de 1.792 dimensiones listos para busqueda semantica.
- Similitud semantica de textos (STS): calculo de puntuaciones de similitud coseno entre pares de frases.
- Recuperacion de informacion (retrieval): indexacion y busqueda de documentos por significado, no solo por coincidencia lexica.
- Clasificacion de textos: uso de los embeddings como caracteristicas para clasificadores supervisados.
- Reranking: reordenacion de resultados de busqueda mediante similitud semantica.
- Clustering: agrupacion de documentos o frases por proximidad semantica en el espacio de embeddings.
- Procesamiento de documentos largos: soporte de hasta 8.192 tokens por secuencia, adecuado para parrafos extensos o fragmentos de articulos.
- No soporta tool calling ni function calling: es un modelo de extraccion de caracteristicas, no un modelo generativo de instrucciones.
- No soporta agentes ni razonamiento multi-paso: no dispone de modo thinking ni capacidades de planificacion.
- Capacidad multilingue limitada: entrenado exclusivamente para japones; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Busqueda semantica en corpus japoneses: el modelo indexa documentos y consultas en el mismo espacio vectorial de 1.792 dimensiones, permitiendo recuperar pasajes relevantes aunque no compartan terminos exactos. Es adecuado porque su puntuacion JMTEB-Retrieval de 65,03 es la mas alta de su familia.
- Sistemas de preguntas y respuestas sobre documentacion tecnica: se pueden generar embeddings de fragmentos de manuales o bases de conocimiento en japones y recuperar el contexto relevante para un sistema RAG. El contexto de 8.192 tokens permite indexar fragmentos largos sin truncar en exceso.
- Deduplicacion y agrupacion de articulos de noticias: mediante clustering sobre los embeddings se detectan noticias duplicadas o temas relacionados. La puntuacion JMTEB-Clustering de 50,34 es competitiva dentro de la familia.
- Moderacion y clasificacion de contenido en japones: los embeddings sirven como entrada a clasificadores ligeros para detectar categorias tematicas o contenido similar a ejemplos etiquetados.
- Reranking en motores de busqueda: tras una recuperacion inicial por BM25, el modelo reordena los candidatos calculando similitud coseno entre consulta y documento. Su JMTEB-Reranking de 71,37 es el mejor de la serie.
- Analisis de similitud en atencion al cliente: comparar tickets o mensajes de usuarios con una base de respuestas previas para sugerir soluciones, gracias a la alta puntuacion en STS (83,16).
- Construccion de indices vectoriales para recomendacion de contenido: los embeddings permiten calcular afinidad entre articulos, productos o publicaciones en japones.

## Benchmarks y rendimiento

Resultados en JMTEB v2 publicados por el autor en la model card:

| Modelo | Arquitectura | Parametros | JMTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-JP-1B (este modelo) | Llama | 1224M | 66,36 | 65,03 | 83,16 | 61,90 | 71,37 | 50,34 |
| Sentence-ModernBERT-JP-1B | ModernBERT | 1304M | 63,51 | 60,52 | 81,61 | 57,92 | 67,04 | 50,47 |
| Sentence-Llama-Bi-JP-1B | Llama | 1224M | 61,50 | 56,38 | 79,14 | 55,63 | 64,66 | 51,70 |

Las puntuaciones se miden sobre JMTEB v2. Cada puntuacion por familia promedia todos los datasets, splits y subconjuntos de la familia, y JMTEB-Avg es la media macro de las cinco familias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en bfloat16 para los 1.224M de parametros, mas el espacio de activaciones y el overhead del runtime. Con cuantizacion a 8 bits se reduce a unos 1,3 GB; a 4 bits, a unos 0,7 GB, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bfloat16. Para lotes grandes y secuencias de 8.192 tokens se recomiendan A100, H100 o RTX 4090 por su mayor ancho de banda de memoria.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: sentence-transformers (requiere >=4.1.0), transformers (>=4.51.0), accelerate (>=1.6.0), sentencepiece (>=0.2.0), flash-attn (>=2.7.3) y text-embeddings-inference (el modelo esta marcado como endpoints_compatible).
- El autor recomienda usar torch_dtype bfloat16 y attn_implementation flash_attention_2 para un rendimiento optimo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-JP-1B | Llama | 1224M | 8.192 | 66,36 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-1B | ModernBERT | 1304M | no disponible | 63,51 | no disponible | Hugging Face |
| Sentence-Llama-Bi-JP-1B | Llama | 1224M | no disponible | 61,50 | no disponible | Hugging Face |

Los tres modelos pertenecen a la misma coleccion MIREI del mismo autor y comparten el dataset de afinamiento. La variante Sarashina obtiene la mejor media global y las mejores puntuaciones en retrieval, STS, clasificacion y reranking, mientras que la variante Llama estandar lidera en clustering (51,70 frente a 50,34). No se dispone de datos sobre otros modelos japoneses de embeddings externos a esta familia en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset japones especifico, puede heredar sesgos presentes en el corpus de origen.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; sin embargo, los embeddings pueden producir similitudes espurias en dominios muy alejados de los datos de entrenamiento.
- Limitacion de idioma: entrenado exclusivamente para japones; su uso con textos en otros idiomas no esta validado y probablemente degrade la calidad de los embeddings.
- Limitacion de contexto: secuencias superiores a 8.192 tokens deben truncarse o dividirse, lo que puede perder informacion en documentos muy largos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Caveat para produccion: requiere trust_remote_code=True en sentence-transformers, lo que implica ejecutar codigo personalizado del repositorio; conviene revisar el codigo antes de desplegarlo en entornos sensibles.
- Dependencia de flash-attn: la configuracion recomendada depende de flash-attn, cuya instalacion puede ser compleja en algunos entornos; sin el, el rendimiento puede ser inferior.
- Madurez del modelo: publicado en 2026 con cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B
- Modelo base: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B-PT
- Dataset de afinamiento: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Sentence-ModernBERT-JP-1B: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B
- Sentence-Llama-Bi-JP-1B: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B
- Licencia MIT: https://opensource.org/license/mit/
- Publicacion asociada: Okada, R. y Sugimoto, T., "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", Actas de la 32.ª Conferencia Anual de la Asociacion de Procesamiento del Lenguaje de Japon (NLP2026).
