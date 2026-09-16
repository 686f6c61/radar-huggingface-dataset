# nickprock/granite-311m-italiano-matryoshka

## Resumen

nickprock/granite-311m-italiano-matryoshka es un modelo de embeddings de frases (sentence transformer) especializado en italiano, obtenido por ajuste fino del modelo multilingüe ibm-granite/granite-embedding-311m-multilingual-r2. Lo desarrolla el usuario nickprock y se publica bajo licencia Apache 2.0. Su funcion principal es transformar texto en vectores densos de 768 dimensiones utiles para similitud semantica, busqueda semantica, mineria de paráfrasis, clasificacion y agrupamiento (clustering). Con 311.664.384 parametros, es un modelo de tamano medio orientado a tareas de recuperacion y ranking, no a generacion de texto libre.

La relevancia de esta ficha esta en su combinacion de dos caracteristicas concretas: por un lado, es un ajuste especifico para italiano sobre un backbone multilingüe, lo que suele mejorar el rendimiento en dominios y formulaciones propias del idioma; por otro, incorpora entrenamiento con MatryoshkaLoss, que permite truncar el vector de salida a dimensiones menores sin reentrenar, reduciendo coste de almacenamiento e inferencia en sistemas de recuperacion a gran escala.

El modelo se distribuye en formato safetensors, integrado con la libreria sentence-transformers y compatible con el tag text-embeddings-inference, lo que facilita su despliegue en servidores de embeddings. El entrenamiento usa 45.181 ejemplos y combina tres funciones de perdida (MatryoshkaLoss, CachedMultipleNegativesRankingLoss y MultipleNegativesRankingLoss). El unico resultado de evaluacion declarado por el autor es una exactitud coseno de 0,99958 en un conjunto de evaluacion de tripletas en italiano, dato no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso tipo ModernBERT, adaptado como sentence transformer (pooling sobre representacion de frase) |
| Parametros totales | 311.664.384 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana maxima de tokens) |
| Tipos de cuantizacion | No disponible (el autor no documenta variantes cuantizadas; los pesos se publican en safetensors y admiten cuantizacion posterior con herramientas estandar) |
| Idiomas soportados | Italiano (etiqueta `it`); el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 (entrenado con MatryoshkaLoss, por lo que admite truncado) |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Modelo base | ibm-granite/granite-embedding-311m-multilingual-r2 |
| Tamano del repositorio | 0,7 GB |
| Tamano del dataset de entrenamiento | 45.181 ejemplos |
| Funciones de perdida | MatryoshkaLoss, CachedMultipleNegativesRankingLoss, MultipleNegativesRankingLoss |
| Idiomas de las etiquetas | it |

## Arquitectura y entrenamiento

Se trata de un sentence transformer construido sobre el backbone ModernBERT de IBM, concretamente sobre granite-embedding-311m-multilingual-r2. ModernBERT es un encoder transformer con mejoras de eficiencia respecto a BERT clasico (atencion con rotatory position embeddings, capas alternas de atencion local y global, kernels optimizados), orientado a tareas de comprension y representacion de texto. El modelo produce embeddings densos de 768 dimensiones que se comparan mediante similitud coseno.

El ajuste fino se realizo sobre el dataset nickprock/it-wiki-retrieval-synthetic-hn, complementado con mteb/stsb_multi_mt y crux82/squad_it, con un total de 45.181 ejemplos. La combinacion de perdidas es relevante: MultipleNegativesRankingLoss y su variante con cache (CachedMultipleNegativesRankingLoss) son el esquema habitual para entrenar recuperacion densa con negativos en el lote, mientras que MatryoshkaLoss anade un objetivo jerarquico que hace que los primeros fragmentos del vector (por ejemplo, las primeras 512, 256 o 128 dimensiones) sigan siendo utiles por si mismos. Esto permite desplegar el mismo modelo con distintos presupuestos de memoria y latencia sin reentrenar. No se documenta en la informacion disponible si hubo fases de RLHF, DPO o destilacion adicionales.

## Capacidades

- Generacion de embeddings de frases y parrafos en italiano, con salida de 768 dimensiones.
- Similitud semantica entre pares de textos (semantic textual similarity).
- Busqueda semantica y recuperacion densa de documentos (retrieval).
- Mineria de paráfrasis en corpus de texto.
- Clasificacion de texto mediante embeddings (con un clasificador sobre las representaciones).
- Agrupamiento (clustering) y deduplicacion semantica de documentos.
- Truncado Matryoshka: el vector puede recortarse a dimensiones menores para reducir memoria y coste de comparacion.
- Compatible con el pipeline sentence-similarity de sentence-transformers y con text-embeddings-inference.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene modo de razonamiento ni capacidades de vision o audio.
- Cobertura multilingue limitada al backbone base: la especializacion y la evaluacion declaradas son exclusivamente para italiano.

## Casos de uso

- Busqueda semantica en corpus documentales italianos: indexar articulos, manuales o documentacion interna como vectores de 768 dimensiones y recuperar por similitud coseno, superando las limitaciones de la busqueda por palabras clave en consultas formuladas de forma libre.
- Recuperacion aumentada por generacion (RAG) sobre fuentes en italiano: usar el modelo como recuperador en un pipeline en el que un LLM generativo consume los fragmentos mas relevantes; el Matryoshka permite reducir la dimension del indice si el volumen de documentos es muy alto.
- Deduplicacion y agrupamiento de contenido: agrupar noticias, tickets o registros con significado equivalente mediante clustering sobre los embeddings, util para consolidar bases de conocimiento.
- Moderacion y enrutado de tickets de soporte: clasificar consultas de usuarios italianos por similitud con prototipos de categoria para asignarlas automaticamente al equipo correspondiente.
- Comparacion de respuestas en evaluacion de sistemas: medir similitud semantica entre respuesta generada y respuesta de referencia en conjuntos italianos, como alternativa o complemento a metricas n-grama.
- Sistemas de recomendacion de contenido textual: representar articulos o resenas y buscar vecinos cercanos para sugerir contenido relacionado.
- Deteccion de similitud entre normativa o documentacion legal en italiano: localizar clausulas equivalentes o contradictorias entre documentos extensos.
- Filtrado de datos para entrenamiento: identificar ejemplos casi duplicados o poco diversos en un corpus italiano antes de usarlo para entrenar otros modelos.

## Benchmarks y rendimiento

Unico resultado declarado en el model-index de la model card (datos del autor, no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | triplet eval it | Cosine Accuracy | 0,9995794892311096 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo MTEB en italiano, MMLU no aplica por tratarse de un modelo de embeddings), ni comparaciones con alternativas realizadas por el autor. El valor de exactitud coseno indicado es muy alto y procede de un conjunto de evaluacion propio, sin verificacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,25 GB en fp32, unos 0,62 GB en fp16/bf16 y alrededor de 0,31 GB en int8, sin contar el margen para tokenizacion, activaciones y lote de entrada.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, incluso con lotes grandes. Tambien es viable en CPU para volumenes moderados, dado el tamano del modelo.
- GPU recomendadas para servicio en produccion: NVIDIA T4, L4, A10G, A100 o H100, principalmente por throughput de lote y no por memoria.
- Opciones de despliegue: sentence-transformers (referencia), Hugging Face Text Embeddings Inference (el modelo lleva el tag text-embeddings-inference), servicios de Inference Endpoints, vLLM en modo embeddings, y exportacion a ONNX con Optimum para inferencia optimizada. El autor no documenta conversion a GGUF ni uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un encoder de 311 millones de parametros, el coste esta dominado por el numero de tokens procesados y por el tamano de lote; se recomienda medir en el hardware objetivo antes de dimensionar el servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Idiomas | Rendimiento en triplet eval it |
|---|---|---|---|---|---|---|
| nickprock/granite-311m-italiano-matryoshka | 311,7 M | 768 (truncable, Matryoshka) | No disponible | Apache 2.0 | Italiano (base multilingüe) | 0,99958 (cosine accuracy, dato del autor) |
| ibm-granite/granite-embedding-311m-multilingual-r2 (modelo base) | 311,7 M | No disponible | No disponible | Apache 2.0 | Multilingüe | No disponible |
| Alternativas multilingues de tamano similar (por ejemplo familia multilingual-e5-base o BGE-M3) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre este ajuste y otras alternativas en la informacion proporcionada. La comparacion pertinente es contra el modelo base: este ajuste anade especializacion en italiano y objetivo Matryoshka, pero no se publican mediciones que cuantifiquen la mejora frente al base.

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgo. Al entrenarse sobre datos derivados de Wikipedia en italiano (it-wiki) y otros corpus, puede heredar sesgos de representacion geografica, cultural y de genero presentes en esas fuentes.
- Alucinacion: por su naturaleza, el modelo no genera texto, por lo que no alucina en el sentido generativo. El riesgo equivalente es recuperar pasajes semanticamente cercanos pero factualmente incorrectos o poco relevantes; la similitud coseno alta no implica relevancia real.
- El resultado de 0,99958 en "triplet eval it" procede de un conjunto de evaluacion propio del autor y no esta verificado de forma independiente. No debe tomarse como garantia de rendimiento en dominios distintos al de entrenamiento.
- Longitud de contexto no documentada: se desconoce la ventana maxima soportada y como se comporta el modelo con textos muy largos. Conviene trocear documentos en fragmentos antes de indexar.
- Idioma: la especializacion y la evaluacion son para italiano. Aunque el backbone sea multilingüe, no hay evidencia publicada del rendimiento en castellano u otros idiomas tras este ajuste.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y sin garantia. Conviene revisar tambien las condiciones del modelo base y de los datasets empleados si se redistribuye.
- Estado del repositorio: el modelo presenta cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validacion por parte de la comunidad ni soporte documentado mas alla de la model card.
- Produccion: al no documentarse cuantizaciones, formatos alternativos ni mediciones de latencia, cualquier despliegue a escala requiere una evaluacion propia de recall y de throughput antes de asumir el modelo como recuperador principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nickprock/granite-311m-italiano-matryoshka
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- Libreria sentence-transformers: https://www.SBERT.net
- Dataset de ajuste: https://huggingface.co/datasets/nickprock/it-wiki-retrieval-synthetic-hn
- Dataset mteb/stsb_multi_mt: https://huggingface.co/datasets/mteb/stsb_multi_mt
- Dataset crux82/squad_it: https://huggingface.co/datasets/crux82/squad_it
- Referencias arXiv citadas en las etiquetas del modelo: https://arxiv.org/abs/1908.10084 , https://arxiv.org/abs/2205.13147 , https://arxiv.org/abs/2101.06983 , https://arxiv.org/abs/1807.03748
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo: los unicos resultados obtenidos fueron paginas de agencias de viajes sin relacion con el modelo. No se han localizado papers, blogs, repositorios ni demos adicionales del autor en la informacion disponible.
