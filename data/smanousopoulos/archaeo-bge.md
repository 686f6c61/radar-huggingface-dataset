# smanousopoulos/archaeo-bge

## Resumen

Archaeo-BGE es un modelo de recuperación densa (dense retrieval) especializado en textos arqueológicos, desarrollado por el usuario de Hugging Face smanousopoulos. Se trata de un fine-tuning del modelo BAAI/bge-large-en-v1.5, un bi-encoder basado en arquitectura BERT que genera embeddings de frases y pasajes para búsqueda semántica. El modelo está diseñado para recuperar descripciones arqueológicas a partir de consultas que pueden implicar relaciones tipológicas, cronológicas o contextuales implícitas, un escenario donde los modelos de recuperación de propósito general rinden peor por falta de vocabulario de dominio.

Con 335.141.888 parámetros (aproximadamente 335 millones), se sitúa en la categoría de modelos de embeddings "large", con un coste de inferencia moderado y una huella en disco de 8 GB en el repositorio. Solo soporta inglés y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Es relevante para equipos de humanidades digitales y proyectos de arqueología que necesiten construir sistemas de búsqueda semántica sobre corpus especializados, aunque su adopción actual es muy baja (42 descargas y 0 likes en el momento de la consulta).

La información pública disponible es escasa: la model card es muy breve y no documenta el proceso de entrenamiento, los datos utilizados ni resultados de evaluación. Esta ficha refleja exclusivamente lo que el autor ha publicado y lo que puede inferirse de los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (bi-encoder denso, base BGE) |
| Parametros totales | 335.141.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BGE-large-en-v1.5 admite 512 tokens, pero el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser BERT es compatible con cuantizacion a int8/fp16 mediante herramientas estandar, aunque no esta documentado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso derivado de BAAI/bge-large-en-v1.5, que a su vez se basa en la familia BERT con 24 capas, 1024 dimensiones de hidden state y 16 cabezas de atencion (configuracion estandar de BGE-large). La funcion del bi-encoder es proyectar consultas y documentos a un espacio vectorial comun donde la similitud coseno aproxima la relevancia semantica, lo que permite indexar corpus completos con FAISS, Milvus o pgvector y realizar busquedas por vecino mas cercano a escala.

El autor no documenta el proceso de fine-tuning: no se especifican el numero de tokens de entrenamiento, la composicion del dataset arqueologico, la funcion de perdida (probablemente contrastiva con negativos en batch, habitual en la familia BGE), ni si se aplicaron tecnicas como hard negative mining o destilacion. Tampoco se indica si hubo evaluacion con metricas de recuperacion (Recall@k, nDCG, MRR). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de embeddings densos para busqueda semantica en ingles sobre textos arqueologicos.
- Recuperacion de pasajes ante consultas con relaciones tipologicas, cronologicas o contextuales implicitas (segun declara el autor).
- Indexacion de corpus para motores de recuperacion vectorial (FAISS, Milvus, Qdrant, pgvector).
- Uso como retriever en pipelines RAG (retrieval-augmented generation) sobre documentacion arqueologica.
- Similitud semantica entre fragmentos de texto para tareas de deduplicacion o clustering.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un modelo de embeddings.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Busqueda semantica en archivos arqueologicos: indexar informes de excavacion, catalogos de materiales y fichas de yacimientos para que los investigadores recuperen registros mediante consultas en lenguaje natural, aprovechando el ajuste de dominio frente a BGE generico.
- Sistemas RAG para asistentes de investigacion: usar el modelo como retriever en un pipeline que alimente a un LLM generativo con pasajes arqueologicos relevantes, reduciendo alucinaciones al fundamentar las respuestas en corpus verificados.
- Deduplicacion de registros de catalogacion: generar embeddings de fichas de piezas y agrupar por similitud coseno para detectar entradas duplicadas o casi duplicadas en bases de datos museisticas.
- Motor de descubrimiento en repositorios de humanidades digitales: permitir busquedas por concepto ("ceramica de barniz negro campaniense") aunque el documento use terminologia distinta, gracias a la adaptacion al vocabulario arqueologico.
- Clasificacion y clustering tematico de corpus: agrupar automaticamente miles de abstracts o descripciones por periodos, culturas o tipologias para estudios bibliometricos.
- Recomendacion de literatura cientifica: sugerir articulos o informes similares a uno dado comparando embeddings de resumenes dentro de una biblioteca especializada.
- Enriquecimiento de metadatos: asignar palabras clave o categorias a documentos no etiquetados comparando sus embeddings con los de un conjunto de referencia anotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de recuperacion (Recall@k, nDCG, MRR) ni comparaciones con el modelo base BAAI/bge-large-en-v1.5, por lo que no es posible verificar cuantitativamente la mejora que aporta el fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos, mas activaciones; en la practica 2-3 GB con batch pequeno.
- VRAM estimada en fp16: aproximadamente 0,7 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); para indexacion a gran escala se recomienda A100 o H100 por throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso puede ejecutarse en CPU con latencia aceptable para lotes pequenos.
- Opciones de despliegue: sentence-transformers (recomendado para este tipo de modelo), Hugging Face Transformers, Text Embeddings Inference (TEI), FastAPI con ONNX Runtime; no es compatible con vLLM ni llama.cpp en su uso habitual, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles; no se han publicado mediciones por parte del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| smanousopoulos/archaeo-bge | 335 M | no disponible (base: 512) | en | Apache 2.0 | Fine-tuning de dominio arqueologico; sin benchmarks publicados |
| BAAI/bge-large-en-v1.5 | 335 M | 512 tokens | en | MIT | Modelo base; benchmarks publicos en MTEB; uso general |
| intfloat/e5-large-v2 | 335 M | 512 tokens | en | MIT | Alternativa de recuperacion densa con buen rendimiento en MTEB |
| BAAI/bge-m3 | 568 M | 8192 tokens | multilingue | MIT | Contexto largo y multilingue; mayor coste de inferencia |

La comparacion cuantitativa de rendimiento no es posible porque Archaeo-BGE no publica metricas. Frente al modelo base, la ventaja esperada es una mejor recuperacion en vocabulario arqueologico, pero sin evaluacion publica esta afirmacion no puede verificarse.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en el dominio objetivo.
- Model card minima: no se documentan datos de entrenamiento, hiperparametros ni proceso de evaluacion, lo que dificulta la reproducibilidad.
- Solo ingles: no apto para corpus en castellano u otros idiomas sin un fine-tuning adicional.
- Longitud de contexto limitada (heredada del modelo base, 512 tokens): los pasajes largos deben trocearse, con el riesgo de perder contexto.
- Riesgo de sesgo de dominio: al entrenarse sobre un corpus arqueologico concreto (no especificado), puede sobrerrepresentar ciertas tradiciones academicas o regiones geograficas.
- Adopcion muy baja (42 descargas, 0 likes): no hay comunidad que haya validado el modelo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Al ser un modelo de embeddings, no genera texto: cualquier expectativa de respuesta generativa requiere combinarlo con un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smanousopoulos/archaeo-bge
- Repositorio del proyecto: https://github.com/smanousopoulos/archaeo-retrieval
- Modelo base: https://huggingface.co/BAAI/bge-large-en-v1.5
