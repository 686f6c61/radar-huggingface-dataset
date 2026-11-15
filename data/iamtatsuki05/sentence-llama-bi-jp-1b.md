# iamtatsuki05/Sentence-Llama-Bi-JP-1B

## Resumen

Sentence-Llama-Bi-JP-1B es un modelo de embeddings de frases en japones desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un encoder bi-direccional derivado de la arquitectura Llama, afinado mediante aprendizaje contrastivo supervisado sobre el dataset cl-nagoya/ruri-v3-dataset-ft. Su proposito es transformar frases y parrafos en japones en vectores densos de 1.792 dimensiones utiles para recuperacion de informacion, similitud semantica, clasificacion y clustering.

El modelo parte de un checkpoint preentrenado (Sentence-Llama-Bi-JP-1B-PT) y aplica una fase de ajuste supervisado con pares y tripletas del dataset de Ruri v3. Con 1.224 millones de parametros totales (1.040 millones sin contar embeddings), ofrece una ventana de contexto de 8.192 tokens, muy superior a la de los encoders BERT clasicos, lo que permite indexar documentos largos sin truncamiento agresivo.

Es relevante porque cubre un nicho concreto: embeddings japoneses de alta dimensionalidad con contexto largo y licencia MIT, algo poco frecuente en el ecosistema. Ademas forma parte de una comparativa controlada entre arquitecturas encoder y decoder (ModernBERT, Llama y Sarashina) bajo condiciones identicas, publicada en NLP2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (encoder bi-direccional derivado de decoder, via LLM2Vec) |
| Parametros totales | 1.224.038.144 (1.224 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 1.040 M |
| Longitud de contexto | 8.192 tokens |
| Dimension de embedding | 1.792 (mean pooling) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizer | SentencePiece, vocabulario de 102.400 tokens |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Libreria | sentence-transformers (>= 4.1.0) |
| Tamano del repo | 4,9 GB |
| Dataset de ajuste | cl-nagoya/ruri-v3-dataset-ft |
| Modelo base | iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Llama adaptado a tareas de embedding mediante la metodologia LLM2Vec: se convierte un decoder causal en un encoder bi-direccional, de modo que cada token atiende en ambas direcciones. Sobre esa base se aplica mean pooling para obtener un unico vector de 1.792 dimensiones por secuencia. La codificacion posicional es RoPE y el tokenizer es SentencePiece con un vocabulario de 102.400 entradas, heredado del modelo base.

El entrenamiento consta de dos fases: una pre-fase debilmente supervisada que produce el checkpoint Sentence-Llama-Bi-JP-1B-PT y una fase de ajuste supervisado con aprendizaje contrastivo sobre cl-nagoya/ruri-v3-dataset-ft, que contiene pares y tripletas para recuperacion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO. El modelo forma parte de un estudio comparativo (NLP2026) que analiza el rendimiento de embeddings de frase segun arquitectura encoder frente a decoder bajo condiciones de entrenamiento identicas.

## Capacidades

- Generacion de embeddings de frases y parrafos en japones con 1.792 dimensiones y normalizacion L2 opcional.
- Recuperacion de informacion (retrieval) densa: indexacion y busqueda semantica sobre corpus japoneses.
- Similitud semantica de frases (STS) y deteccion de parafrasis.
- Clasificacion de texto por similitud con prototipos o mediante clasificadores sobre embeddings.
- Clustering y deduplicacion semantica de documentos.
- Reranking de resultados de busqueda mediante puntuacion coseno.
- Procesamiento de documentos largos de hasta 8.192 tokens en una sola pasada, sin chunking.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de representacion, no un modelo generativo.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento extendido.

## Casos de uso

- Busqueda semantica en corpus japoneses: se indexan documentos con el modelo y se consulta con embeddings de la pregunta; la ventana de 8.192 tokens permite indexar articulos o secciones completas sin fragmentar.
- Sistemas RAG sobre documentacion tecnica en japones: el modelo actua como retriever en la fase de recuperacion, alimentando un LLM generativo con los pasajes mas relevantes.
- Deduplicacion de registros en bases de datos: se calculan embeddings de cada entrada y se agrupan por similitud coseno para eliminar duplicados o near-duplicates.
- Clustering de tickets de soporte: agrupacion no supervisada de incidencias en japones para detectar temas recurrentes y priorizar el backlog.
- Clasificacion de contenidos por similitud: asignacion de categorias comparando el embedding del texto con embeddings de referencia de cada clase, sin necesidad de entrenar un clasificador especifico.
- Reranking en pipelines de busqueda hibrida: tras una recuperacion BM25, se reordena con la puntuacion coseno del modelo para mejorar la precision de los primeros resultados.
- Moderacion y filtrado semantico: comparacion de mensajes de usuario contra una lista de patrones problematicos representados como embeddings.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JMTEB v2 (cada familia promedia todos los datasets, splits y subconjuntos; JMTEB-Avg es la media macro de las cinco familias):

| Modelo | Arquitectura | Parametros | JMTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-1B | ModernBERT | 1304 M | 63,51 | 60,52 | 81,61 | 57,92 | 67,04 | 50,47 |
| Sentence-Llama-Bi-JP-1B (este modelo) | Llama | 1224 M | 61,50 | 56,38 | 79,14 | 55,63 | 64,66 | 51,70 |
| Sentence-Sarashina-Bi-JP-1B | Llama | 1224 M | 66,36 | 65,03 | 83,16 | 61,90 | 71,37 | 50,34 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- Inferencia en bfloat16: aproximadamente 2,4 GB de VRAM para los pesos, mas memoria para activaciones; con 8.192 tokens de contexto y atencion FlashAttention-2 el consumo adicional es moderado.
- Inferencia en float32: en torno a 4,9 GB de VRAM.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090. Tambien en GPUs de 8 GB si se limita el tamano de lote o se usa bfloat16.
- GPUs de datacenter recomendadas para alto throughput: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (TEI, etiqueta text-embeddings-inference presente en el repo), y cualquier backend compatible con transformers y trust_remote_code. No se documentan variantes GGUF ni soporte verificado en llama.cpp u Ollama.
- Requisitos de software: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0, flash-attn >= 2.7.3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-JP-1B | Llama (LLM2Vec) | 1224 M | 8.192 | 61,50 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-1B | ModernBERT | 1304 M | no disponible | 63,51 | no disponible | Hugging Face |
| Sentence-Sarashina-Bi-JP-1B | Llama | 1224 M | no disponible | 66,36 | no disponible | Hugging Face |

Dentro de la propia familia MIREI, Sarashina-Bi supera a este modelo en cuatro de las cinco familias de JMTEB, mientras que Sentence-Llama-Bi-JP-1B obtiene el mejor resultado en clustering (51,70). Sentence-ModernBERT-JP-1B queda por encima en la media global pese a tener una arquitectura encoder nativa. No se dispone de comparaciones con modelos externos a la familia en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; su rendimiento en otros idiomas, incluido el castellano, no esta documentado y previsiblemente sera deficiente.
- Al ser un modelo de embeddings y no generativo, puede producir representaciones pobres en dominios muy alejados de los datos de ajuste (texto juridico, medico o altamente tecnico) sin una evaluacion previa.
- La dimension de 1.792 implica un coste de almacenamiento e indexacion aproximadamente 2,8 veces mayor que embeddings de 768 dimensiones y 7 veces mayor que los de 256; conviene considerar reduccion de dimensionalidad (PCA, Matryoshka no documentado) en indices a gran escala.
- No se documentan sesgos especificos, pero al derivar de un LLM preentrenado puede heredar sesgos presentes en los corpus japoneses de origen.
- Riesgo de falsos positivos en similitud coseno con textos cortos o con mucho ruido; se recomienda calibrar umbrales por dominio.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el modelo base y el dataset de ajuste pueden tener condiciones propias que conviene verificar antes de un despliegue en produccion.
- Requiere trust_remote_code=True y flash-attn para el maximo rendimiento; sin FlashAttention-2 el throughput con contexto largo puede degradarse notablemente.
- El modelo se creo en septiembre de 2026 y se actualizo en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente fuera de los benchmarks del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B
- Modelo base (preentrenado): https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de ajuste: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Modelo hermano ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B
- Modelo hermano Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B
- README en japones: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B/blob/main/README_JA.md
- Licencia MIT: https://opensource.org/license/mit/
- Cita (NLP2026): Okada, R. y Sugimoto, T., «同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析», Actas de la 32.ª Conferencia Anual de la Sociedad de Procesamiento del Lenguaje de Japon (NLP2026).
