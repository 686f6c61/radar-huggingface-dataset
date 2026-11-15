# iamtatsuki05/Sentence-Sarashina-Bi-0.5B

## Resumen

Sentence-Sarashina-Bi-0.5B es un modelo de embeddings de frases (sentence encoder) especializado en japones, desarrollado por iamtatsuki05 dentro de la familia MIREI. Se construye afinando el modelo base preentrenado iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT sobre ejemplos supervisados del dataset cl-nagoya/ruri-v3-dataset-ft, lo que da lugar a representaciones densas de 1.280 dimensiones obtenidas mediante mean pooling. La arquitectura es de tipo Llama (transformer decoder-only reconvertido a encoder bidireccional mediante la tecnica LLM2Vec), con 661.976.320 parametros totales (530M sin contar embeddings) y una longitud maxima de secuencia de 8.192 tokens.

El modelo resuelve tareas de similitud semantica, recuperacion de informacion (retrieval), reranking, clasificacion y clustering sobre texto japones, ofreciendo una alternativa de tamano contenido que compite con encoders especializados como ModernBERT. Su relevancia actual radica en que demuestra que un transformer tipo Llama adaptado con LLM2Vec puede superar a encoders nativos en el benchmark japones JMTEB v2, con un promedio global de 62,81 frente a 62,07 de la variante ModernBERT de la misma familia. La licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales.

La ficha describe sus especificaciones, arquitectura, capacidades de recuperacion semantica y requisitos de despliegue, con datos estrictamente limitados a la informacion publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only adaptado a embeddings con LLM2Vec) |
| Parametros totales | 661.976.320 (661M); 530M sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se recomienda bfloat16) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers, custom_code) |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Tamano del repositorio | 2,7 GB |
| Dataset de ajuste | cl-nagoya/ruri-v3-dataset-ft |
| Modelo base | iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT |

## Arquitectura y entrenamiento

El modelo parte de un transformer de arquitectura Llama (decoder-only) que se transforma en un encoder de frases mediante la tecnica LLM2Vec, que habilita atencion bidireccional y agrega las representaciones de tokens con mean pooling para producir un unico vector de 1.280 dimensiones. La codificacion posicional es RoPE y el tokenizer es SentencePiece con un vocabulario de 102.400 entradas, lo que permite manejar texto japones sin segmentacion externa. La longitud maxima de secuencia es de 8.192 tokens.

El entrenamiento consta de dos fases: un preentrenamiento debilmente supervisado (modelo -PT) y un ajuste fino supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft, que aporta pares y tripletas para tareas de recuperacion y similitud. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO. La innovacion principal es la aplicacion de LLM2Vec a un modelo Llama de 0,5B para obtener un encoder competitivo, superando en JMTEB v2 a la variante ModernBERT de la misma familia.

## Capacidades

- Generacion de embeddings de frases en japones de 1.280 dimensiones con normalizacion opcional para similitud coseno.
- Recuperacion de informacion (retrieval) densa: codificacion de consultas y documentos en un mismo espacio vectorial.
- Similitud semantica de frases (STS) y deteccion de parafrasis.
- Reranking de resultados de busqueda mediante puntuacion de similitud.
- Clasificacion de texto por representaciones vectoriales (con un clasificador posterior).
- Clustering y deduplicacion semantica de documentos.
- Procesamiento de secuencias largas de hasta 8.192 tokens, adecuado para pasajes extensos.
- Soporte de feature-extraction mediante transformers y sentence-transformers.
- No soporta tool calling, function calling, agentes ni generacion de texto: es un modelo exclusivamente de embeddings (pipeline sentence-similarity).
- Capacidad multilingue limitada al japones; no se declaran otros idiomas.

## Casos de uso

- Busqueda semantica en corpus japoneses: indexar documentos como vectores de 1.280 dimensiones y recuperar los mas cercanos a la consulta mediante similitud coseno, aprovechando la ventana de 8.192 tokens para pasajes largos.
- Reranking en pipelines RAG: reordenar los candidatos devueltos por un retriever inicial (por ejemplo, BM25) puntuando la similitud entre consulta y fragmento, con un coste computacional bajo al tratarse de un modelo de 661M parametros.
- Deduplicacion y clustering de articulos o tickets: agrupar documentos japoneses por similitud de embeddings para consolidar bases de conocimiento o detectar duplicados.
- Moderacion y clasificacion de contenido: usar los embeddings como entrada de un clasificador ligero para etiquetar consultas de soporte o mensajes de usuarios en japones.
- Sistemas de preguntas frecuentes: emparejar la pregunta del usuario con la entrada mas similar de una base de FAQ mediante similitud semantica, sin depender de coincidencia exacta de palabras.
- Analisis de opinion y agrupacion de resenas: generar embeddings de resenas de productos y aplicar clustering para descubrir temas recurrentes.
- Recomendacion de contenido: calcular similitud entre el historial de lectura del usuario y el catalogo de articulos para sugerir items relacionados.

## Benchmarks y rendimiento

Resultados publicados por el autor en JMTEB v2 (media macro sobre cinco familias de tareas):

| Modelo | Arquitectura | Parametros | JMTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-0.5B (este modelo) | Llama | 661M | 62,81 | 55,47 | 83,44 | 58,50 | 66,82 | 49,80 |
| Sentence-ModernBERT-JP-0.5B | ModernBERT | 679M | 62,07 | 61,11 | 80,61 | 55,38 | 65,11 | 48,15 |
| Sentence-Llama-Bi-JP-0.5B | Llama | 661M | 57,13 | 50,17 | 77,67 | 52,96 | 56,99 | 47,85 |

El modelo lidera en promedio global, STS, clasificacion, reranking y clustering dentro de la familia, pero queda por detras de la variante ModernBERT en retrieval (55,47 frente a 61,11). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a generacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,3-1,5 GB para los pesos (661M parametros), mas memoria para activaciones segun el tamano de lote y la longitud de secuencia (hasta 8.192 tokens).
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4090, asi como en GPUs de datacenter A100 y H100 para despliegues de alto throughput.
- Tambien puede ejecutarse en CPU para cargas moderadas, con mayor latencia.
- Opciones de despliegue: sentence-transformers (recomendado, requiere >=4.1.0), transformers (>=4.51.0), accelerate (>=1.6.0), sentencepiece (>=0.2.0) y flash-attn (>=2.7.3) para atencion FlashAttention-2. Compatible con text-embeddings-inference y endpoints de Hugging Face.
- Requiere trust_remote_code=True por el uso de custom_code.
- Latencia y throughput estimados: no disponible en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Sarashina-Bi-0.5B | Llama (LLM2Vec) | 661M | 8.192 | 62,81 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-0.5B | ModernBERT | 679M | no disponible | 62,07 | no disponible | Hugging Face |
| Sentence-Llama-Bi-JP-0.5B | Llama | 661M | no disponible | 57,13 | no disponible | Hugging Face |

Las tres variantes pertenecen a la coleccion MIREI del mismo autor y comparten el ajuste sobre cl-nagoya/ruri-v3-dataset-ft. Sentence-Sarashina-Bi-0.5B obtiene el mejor promedio global y las mejores puntuaciones en STS, clasificacion, reranking y clustering, mientras que la variante ModernBERT es superior en retrieval. No se dispone de datos de contexto ni licencia de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta japones; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su uso esta restringido a embeddings y similitud.
- Riesgo de falsos positivos en similitud semantica: como todo encoder denso, puede recuperar documentos lexicamente distintos pero semanticamente irrelevantes; se recomienda combinar con reranking o filtros.
- Rendimiento inferior a la variante ModernBERT en retrieval (55,47 frente a 61,11), por lo que para busquedas puras puede ser preferible la alternativa.
- Requiere trust_remote_code=True y dependencias especificas (flash-attn, sentencepiece), lo que anade complejidad de despliegue.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica al no generar texto), pero los sesgos del corpus japones de entrenamiento pueden reflejarse en los embeddings.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios especializados (legal, medico, etc.).
- El modelo tiene pocas descargas (72) y ningun like en el momento de la consulta, lo que indica una adopcion todavia limitada y escasa validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B
- Modelo base preentrenado: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de ajuste: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Variante ModernBERT de la familia: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B
- Variante Llama-Bi de la familia: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B
- Licencia MIT: https://opensource.org/license/mit/
- Cita (NLP2026): articulo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", autores 岡田 龍樹 y 杉本 徹.
