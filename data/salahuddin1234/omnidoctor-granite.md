# Salahuddin1234/omnidoctor-granite

## Resumen

omnidoctor-granite es el identificador con el que el usuario Salahuddin1234 ha publicado en HuggingFace una copia del modelo Granite-Embedding-97M-Multilingual-R2, desarrollado originalmente por el Granite Embedding Team de IBM. Se trata de un modelo de embeddings de texto denso (pipeline feature-extraction, libreria sentence-transformers), no de un modelo generativo: su funcion es convertir frases, parrafos, documentos y fragmentos de codigo en vectores de 384 dimensiones comparables mediante similitud coseno.

El modelo es la variante compacta de la coleccion Granite Embedding Multilingual R2, construida podando el modelo grande de 311M parametros (de 22 a 12 capas) y reduciendo el vocabulario a 180.000 tokens. Con 97.441.152 parametros reales en safetensors y una longitud de contexto de 32.768 tokens, ofrece recuperacion multilingue de alta calidad a un coste computacional minimo, lo que lo hace apto para despliegue en CPU y en GPUs de consumo.

Su relevancia actual radica en que, segun la model card, alcanza 60,3 puntos en Multilingual MTEB Retrieval (18 tareas), la puntuacion de recuperacion mas alta de cualquier modelo de embeddings multilingue abierto por debajo de 100M de parametros, superando en +9,4 puntos a multilingual-e5-small (50,9) siendo aproximadamente 3 veces mas pequeno que el modelo completo de 311M. Se publica bajo licencia Apache 2.0 con pesos en safetensors, ONNX y OpenVINO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (12 capas, atencion alternante, activaciones SiLU, rotary position embeddings) |
| Parametros totales | 97.441.152 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no se detallan cuantizaciones especificas; se publican pesos en precisión original (safetensors), ONNX, OpenVINO y GGUF |
| Idiomas soportados | 200+ idiomas soportados por el encoder subyacente; 52 idiomas con soporte mejorado (entrenamiento explicito de pares de recuperacion y cross-lingual), mas codigo de programacion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX, OpenVINO, GGUF (compatible con llama.cpp) |
| Dimension del embedding de salida | 384 |
| Tamano del vocabulario | 180.000 tokens |
| Pipeline | feature-extraction (bi-encoder de similitud semantica) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura bi-encoder basada en ModernBERT, que sustituye a XLM-RoBERTa respecto a la generacion R1. ModernBERT aporta atencion alternante (local y global), activaciones SiLU y rotary position embeddings, lo que permite extender la ventana de contexto de 512 a 32.768 tokens sin un crecimiento desproporcionado del coste de atencion. El encoder procesa la entrada y produce un unico vector de 384 dimensiones, que se compara frente a otros mediante similitud coseno.

El entrenamiento combina varias tecnicas: destilacion de conocimiento desde multiples modelos profesores, ajuste fino contrastivo para alinear embeddings de consulta y pasaje en muchos idiomas, poda de capas (de 22 a 12) partiendo del modelo multilingue completo y una seleccion de vocabulario especifica que da lugar a un tokenizer de 180.000 tokens. Segun la model card, este proceso conjunto aporta una ganancia media de +14,6 puntos frente a la generacion anterior (granite-embedding-107m-multilingual). El conjunto de datos de recuperacion de codigo cubre Python, Go, Java, JavaScript, PHP, Ruby, SQL, C y C++, con soporte de recuperacion cross-lingual entre lenguajes naturales y codigo. Todos los datos de entrenamiento emplean licencias permisivas orientadas a uso empresarial, mas conjuntos recopilados y generados por IBM.

## Capacidades

- Generacion de embeddings de texto densos de 384 dimensiones para consultas, pasajes, documentos y codigo.
- Recuperacion de informacion multilingue (retrieval) con alineacion consulta-pasaje entre idiomas.
- Similitud semantica de frases y deteccion de duplicados o near-duplicates.
- Recuperacion sobre documentos largos y multi-pasaje, gracias a la ventana de 32.768 tokens.
- Recuperacion conversacional multi-turno.
- Recuperacion sobre tareas de razonamiento.
- Recuperacion de codigo y cross-lingual entre lenguaje natural y lenguajes de programacion (Python, Go, Java, JavaScript, PHP, Ruby, SQL, C, C++).
- Cobertura de 200+ idiomas a nivel general, con calidad reforzada en 52 idiomas, entre ellos espanol, ingles, aleman, frances, portugues, italiano, arabe, chino, japones, coreano, hindi, ruso y turco.
- No soporta generacion de texto, tool calling, agentes ni modos de razonamiento con cadena de pensamiento: es exclusivamente un modelo de representacion.

## Casos de uso

- Busqueda semantica en bases de conocimiento corporativas: indexar los documentos con embeddings de 384 dimensiones y recuperar los pasajes relevantes frente a una consulta en lenguaje natural, incluso si la consulta y el documento estan en idiomas distintos.
- RAG (retrieval-augmented generation): actuar como recuperador en pipelines que alimentan a un LLM generativo, con coste de inferencia muy bajo por su tamano de 97M de parametros y vectores de solo 384 dimensiones.
- Deduplicacion y clustering de contenido: agrupar noticias, tickets de soporte o resenas calculando similitud coseno entre embeddings, con umbrales ajustables segun el dominio.
- Busqueda de codigo en repositorios internos: localizar fragmentos en Python, Go, Java, JavaScript, PHP, Ruby, SQL, C o C++ a partir de una descripcion en lenguaje natural, incluyendo descripciones en un idioma distinto al del codigo.
- Analisis de documentos legales o tecnicos extensos: la ventana de 32.768 tokens permite representar contratos, informes o articulos completos sin troceado agresivo, reduciendo la perdida de contexto.
- Clasificacion de texto por similitud a prototipos: asignar etiquetas entrenando solo un conjunto reducido de ejemplos por clase y comparando embeddings, sin reentrenar el encoder.
- Moderacion y filtrado semantico: comparar mensajes entrantes contra un banco de ejemplos problematicos ya vectorizados.
- Sistemas de recomendacion basados en contenido: representar item y perfil de usuario en el mismo espacio vectorial multilingue para sugerir articulos, cursos o productos.
- Recuperacion en asistentes conversacionales multi-turno: mantener el hilo de la conversacion y recuperar el contexto relevante de turnos anteriores.

## Benchmarks y rendimiento

Los unicos datos de benchmark publicados en la informacion disponible corresponden a Multilingual MTEB Retrieval (18 tareas):

| Modelo | Parametros | Multilingual MTEB Retrieval (18 tareas) | Dimension del embedding | Contexto |
|---|---|---|---|---|
| granite-embedding-97m-multilingual-r2 (base de omnidoctor-granite) | 97M | 60,3 | 384 | 32.768 |
| multilingual-e5-small | no disponible (referencia citada como siguiente mejor de su clase) | 50,9 | no disponible | no disponible |
| granite-embedding-107m-multilingual (generacion anterior) | 107M | no disponible (se cita una mejora media de +14,6 puntos del R2 sobre este) | no disponible | 512 |
| granite-embedding-311m-multilingual-r2 | 311M | no disponible | 768 | no disponible |

No se han publicado en la informacion disponible resultados desglosados por tarea ni cifras de MTEB en otros subconjuntos (clasificacion, clustering, reranking) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,4 GB solo de pesos (97,4M x 4 bytes); en fp16, en torno a 0,2 GB; en int8, alrededor de 0,1 GB. A esto se suma la memoria de activaciones, que depende de la longitud de secuencia y del tamano de lote.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA A100, H100, L40S o RTX 4090 queda muy sobredimensionada para un encoder de 97M de parametros y se aprovecharia mejor con lotes grandes. Es perfectamente viable en GPUs de gama media como RTX 3060, RTX 4060 o Tesla T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada actual, e incluso en GPUs integradas. Tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, ONNX Runtime, OpenVINO, Text Embeddings Inference (TEI), vLLM y llama.cpp mediante los pesos GGUF publicados. El repositorio incluye el tag text-embeddings-inference y endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card no incluye mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Contexto | Multilingual MTEB Retrieval | Licencia | Formatos |
|---|---|---|---|---|---|---|
| omnidoctor-granite (granite-embedding-97m-multilingual-r2) | 97M | 384 | 32.768 | 60,3 | Apache 2.0 | safetensors, ONNX, OpenVINO, GGUF |
| granite-embedding-311m-multilingual-r2 | 311M | 768 | no disponible en la informacion | no disponible | Apache 2.0 (misma coleccion Granite) | no disponible |
| granite-embedding-107m-multilingual (R1) | 107M | no disponible | 512 | no disponible (R2 mejora +14,6 puntos de media) | Apache 2.0 (misma coleccion Granite) | no disponible |
| multilingual-e5-small | no disponible | no disponible | no disponible | 50,9 | no disponible en la informacion | no disponible |

La comparativa se limita a los datos citados en la model card. No se dispone de cifras de MIRACL, BEIR ni de otros conjuntos de evaluacion para ninguno de los modelos alternativos.

## Limitaciones y advertencias

- Este repositorio es una resubida de terceros (autor Salahuddin1234) del modelo original de IBM, con 0 descargas y 0 likes en el momento de la consulta. Para uso en produccion conviene referenciar el repositorio oficial ibm-granite/granite-embedding-97m-multilingual-r2 y verificar la integridad de los pesos.
- No es un modelo generativo: no produce texto, no soporta tool calling, no ejecuta agentes y no tiene modo de razonamiento. Usarlo como LLM dara resultados incorrectos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existen falsos positivos en la recuperacion, es decir, pasajes con alta similitud coseno que no responden a la consulta.
- Sesgos: la model card no documenta una evaluacion especifica de sesgos. Al estar entrenado sobre corpus web multilingues, es previsible que herede sesgos de genero, origen o religion presentes en esos datos.
- Limitaciones de idioma: aunque se declaran 200+ idiomas, solo 52 reciben entrenamiento explicito de recuperacion y cross-lingual; en el resto la calidad es notablemente inferior y no esta cuantificada.
- Longitud de contexto: aunque la ventana es de 32.768 tokens, la model card indica soporte mejorado para recuperacion de documentos largos, pero no publica curvas de degradacion por longitud. Conviene validar el rendimiento con la longitud real de los documentos del caso de uso.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero NOTICE cuando corresponda. Aun asi, la resubida no incluye garantias adicionales sobre el origen de los pesos.
- La puntuacion de 60,3 en Multilingual MTEB Retrieval se refiere a un subconjunto de 18 tareas de recuperacion, no a la media global de MTEB. No debe extrapolarse a otras tareas como clasificacion, clustering o reranking sin medirla.
- El identificador arxiv asociado en las etiquetas (arxiv:2605.13521) y la fecha de creacion del repositorio (30 de septiembre de 2026) son los que figuran en la informacion consultada; conviene comprobarlos antes de citarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-granite
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Modelo hermano de 311M: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Repositorio de codigo de los modelos Granite Embedding: https://github.com/ibm-granite/granite-embedding-models
- Pagina de proyecto IBM Granite: https://www.ibm.com/granite
- Playground de IBM Granite: https://www.ibm.com/granite/playground
- Organizacion IBM Granite en HuggingFace: https://huggingface.co/ibm-granite
- Paper citado en la model card: https://huggingface.co/papers/2605.13521
- Leaderboard de MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
