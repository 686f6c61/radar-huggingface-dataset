# nypgd/turkish-e5-large-mebi-v2

## Resumen

`nypgd/turkish-e5-large-mebi-v2` es un modelo de embeddings de frases (sentence transformer) desarrollado por Mehmet Bozdemir (usuario `nypgd`, investigador de doctorado en ingenieria informatica) y publicado en HuggingFace. Se trata de un ajuste fino (finetune) del modelo `ytu-ce-cosmos/turkish-e5-large`, que a su vez deriva de `intfloat/multilingual-e5-large-instruct`. El modelo proyecta texto a un espacio vectorial denso de 1024 dimensiones y esta optimizado para similitud semantica, busqueda semantica y recuperacion de informacion (retrieval) en turco.

El problema que resuelve es la recuperacion de pasajes relevantes en el dominio de la plataforma educativa turca MEB (MEBİ): las consultas de ejemplo de la model card son navegacionales y coloquiales ("zinde kal neydi", "denemelerime bakayim", "AYARLAR NERDE 8. SINIF") y los pasajes son titulos de paginas y unidades curriculares de MEBİ, LGS, TYT y YKS. Esto indica un ajuste de dominio orientado a asistentes de busqueda dentro de plataformas educativas.

Arquitectonicamente es un transformer encoder de tipo XLM-RoBERTa large (etiqueta `xlm-roberta` en el repositorio), con 559.890.432 parametros (aproximadamente 560 M), una longitud maxima de secuencia de 512 tokens y salida de 1024 dimensiones. El repositorio ocupa 2,3 GB y el modelo tiene 0 descargas y 0 likes en el momento de la consulta. No genera texto: es exclusivamente un modelo de representacion (feature-extraction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (etiqueta `xlm-roberta`); sentence transformer con pooling y salida densa de 1024 dimensiones |
| Parametros totales | 559.890.432 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | No disponible: no se publican variantes cuantizadas en el repositorio (solo pesos en `safetensors`, presumiblemente fp32) |
| Idiomas soportados | Turco (ajuste realizado con datos en turco; el modelo base es multilingue, pero la model card no declara idiomas de forma explicita: el campo figura como "Unknown") |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (tamano del repositorio: 2,3 GB) |
| Libreria | `sentence-transformers` |
| Funcion de similitud | Similitud coseno |
| Dimension de salida | 1024 |
| Tamano del dataset de entrenamiento | 26.081 ejemplos |
| Funcion de perdida | `CachedGISTEmbedLoss` |
| Modelo base | `ytu-ce-cosmos/turkish-e5-large` |
| Pipeline declarado | `sentence-similarity` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un sentence transformer construido sobre un encoder XLM-RoBERTa large. La eleccion de este backbone implica 24 capas, dimension oculta 1024 y 16 cabezas de atencion, lo que explica los 559,9 M de parametros y la dimension de embedding de 1024. La longitud maxima de secuencia es de 512 tokens, coherente con la familia XLM-R original. El modelo emplea similitud coseno como funcion de comparacion, y la model card documenta que se trata de un derivado generado con `SentenceTransformerTrainer` (etiqueta `generated_from_trainer`). La referencia bibliografica declarada en los tags es el articulo Sentence-BERT (arXiv:1908.10084), que describe el esquema de entrenamiento con pares y tripletas y el uso de pooling sobre las representaciones del encoder.

El ajuste se realizo con 26.081 ejemplos y la funcion de perdida `CachedGISTEmbedLoss`, una variante cacheada de GISTEmbedLoss que utiliza un modelo guia (guide model) para filtrar falsos negativos dentro del batch antes de calcular la perdida contrastiva, manteniendo ademas una cache de embeddings que reduce el coste computacional del guia. Los tags del repositorio no documentan el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO (no aplicables, en principio, a un modelo de embeddings). El modelo base `ytu-ce-cosmos/turkish-e5-large` procede del grupo COSMOS AI Research Group de la Universidad Tecnica de Yildiz y es a su vez un finetune de `intfloat/multilingual-e5-large-instruct` sobre diversos conjuntos de datos turcos, por lo que hereda las convenciones de prefijos de la familia E5 (los ejemplos de la model card usan `query: ` y `passage: `). El ajuste especifico de esta version esta orientado al dominio MEBİ: los pares de entrenamiento mezclan consultas de usuario con titulos y rutas de paginas de la plataforma educativa.

## Capacidades

- Generacion de embeddings de frases y pasajes en turco: convierte texto en vectores densos de 1024 dimensiones normalizados para similitud coseno.
- Similitud semantica textual (semantic textual similarity): comparacion de pares de frases mediante coseno.
- Busqueda semantica y recuperacion de pasajes (retrieval) con convencion de prefijos `query: ` y `passage: `, tal como aparece en los ejemplos de la model card.
- Recuperacion en el dominio de la plataforma educativa MEBİ: paginas de cuenta, favoritos, logros, taramas, denemeler, calculo de puntuaciones LGS/TYT/YKS y unidades curriculares.
- Mineria de parafrasis (paraphrase mining) y deteccion de duplicados semanticos.
- Agrupamiento (clustering) y clasificacion de texto mediante embeddings congelados.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines posteriores.
- Compatible con Text Embeddings Inference (TEI) y con `sentence-transformers`, ademas de serializable a ONNX mediante Optimum.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo encoder puro de representacion.
- No soporta vision, audio ni multimodalidad: la modalidad declarada es unicamente texto.

## Casos de uso

- Busqueda semantica dentro de plataformas educativas: indexar los titulos y contenidos de las paginas de MEBİ y resolver consultas coloquiales de estudiantes ("denemelerime bakayim" -> "MEBİ sayfası: Denemeler"). El ajuste de dominio sobre 26.081 ejemplos de este tipo es precisamente la ventaja competitiva del modelo.
- Asistente conversacional de navegacion (NLU de intenciones de navegacion): dado un mensaje libre del alumno, recuperar la ruta de la aplicacion mas probable para redirigirlo, usando los embeddings como paso de recuperacion previo a un router de intenciones.
- Motor de recomendacion de contenido curricular: representar unidades y temas (por ejemplo "Fiilimsiler", "Fiilde Çatı", "İvme Kavramı") y recomendar el material mas proximo a los errores detectados en examenes de prueba.
- Deduplicacion y normalizacion de catalogos educativos: agrupar paginas, temas y recursos equivalentes con nombres ligeramente distintos mediante clustering sobre los embeddings, reduciendo la redundancia en el indice.
- Clasificacion y enrutado 0-shot: usar los embeddings con una capa logistica ligera o con similitud a prototipos para clasificar consultas por asignatura, nivel (LGS, TYT, YKS) o tipo de recurso.
- Recuperacion aumentada (RAG) sobre documentacion institucional turca: indexar normativa, guias y material didactico, y alimentar el contexto de un LLM generativo que redacte la respuesta final.
- Deteccion de duplicados en foros o preguntas frecuentes de estudiantes: agrupar preguntas semanticamente equivalentes con distinta redaccion y redirigir a una respuesta unica.
- Analitica de busqueda interna: cuantificar similitud entre las consultas reales de los usuarios y el catalogo disponible para detectar huecos de contenido (temas muy consultados sin recurso asociado).

## Benchmarks y rendimiento

Los siguientes resultados estan declarados por el autor en el `model-index` de la model card. En el conjunto de test, las metricas aparecen explicitamente marcadas con `verified: false`, es decir, no han sido verificadas de forma independiente. No se especifica la composicion de los splits "dev" y "test".

Conjunto de test (recuperacion de informacion):

| Metrica | @1 | @3 | @5 | @10 |
|---|---|---|---|---|
| Cosine Accuracy | 0,5504 | 0,6822 | 0,7442 | 0,8062 |
| Cosine Precision | 0,5504 | 0,3979 | 0,3225 | 0,2209 |
| Cosine Recall | 0,2280 | 0,3833 | 0,4745 | 0,5957 |

| Metrica agregada (test) | Valor |
|---|---|
| Cosine nDCG@10 | 0,5392 |
| Cosine MRR@10 | 0,6321 |
| Cosine MAP@10 | 0,4467 |

Conjunto de desarrollo (recuperacion de informacion):

| Metrica | @1 | @3 | @5 | @10 |
|---|---|---|---|---|
| Cosine Accuracy | 0,8350 | 0,9450 | 0,9650 | 0,9800 |
| Cosine Precision | 0,8350 | 0,4833 | 0,3330 | 0,1795 |
| Cosine Recall | 0,5700 | 0,8363 | 0,9204 | 0,9675 |

| Metrica agregada (dev) | Valor |
|---|---|
| Cosine nDCG@10 | 0,8926 |
| Cosine MRR@10 | 0,8919 |
| Cosine MAP@10 | 0,8497 |

No se han publicado resultados de benchmarks estandar (MTEB, MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Las cifras anteriores corresponden a una evaluacion propia del autor sobre un corpus del dominio MEBİ y no son directamente comparables con rankings publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, 559,9 M de parametros equivalen a aproximadamente 2,24 GB de pesos; en fp16/bf16, unos 1,12 GB; en int8, unos 0,56 GB. Hay que anadir memoria para activaciones y para el batch, que en un encoder de 512 tokens es moderada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en fp16. Una RTX 3060 (12 GB), RTX 4070, RTX 4090 (24 GB) o superior permite lotes grandes y maxima concurrencia. Para despliegue en servidor, A100, H100 o L40S permiten procesar miles de pares por segundo, aunque no hay cifras declaradas.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (incluso en 4-6 GB de VRAM en fp16) e incluso puede ejecutarse en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (via `SentenceTransformer`), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` presente en el repositorio), conversion a ONNX con Optimum para inferencia optimizada, y servidores compatibles con `endpoints_compatible`. No hay versiones GGUF publicadas, por lo que su uso en `llama.cpp` u Ollama requeriria conversion previa y no esta documentado.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de rendimiento por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nypgd/turkish-e5-large-mebi-v2` | 559,9 M | 512 tokens | 1024 | Turco (ajuste) | No disponible | HuggingFace, `sentence-transformers`, safetensors |
| `ytu-ce-cosmos/turkish-e5-large` (modelo base) | ~560 M | 512 tokens | 1024 | Turco, con base multilingue | No disponible | HuggingFace |
| `intfloat/multilingual-e5-large-instruct` (origen de la familia) | ~560 M | 512 tokens | 1024 | Multilingue (mas de 100 idiomas) | No disponible en la informacion consultada | HuggingFace |
| `intfloat/multilingual-e5-large` | ~560 M | 512 tokens | 1024 | Multilingue | No disponible en la informacion consultada | HuggingFace |

La diferencia principal frente al modelo base es el ajuste de dominio: `turkish-e5-large-mebi-v2` ha sido afinado con 26.081 ejemplos especificos de la plataforma MEBİ, mientras que `turkish-e5-large` cubre turco general. Frente a las alternativas multilingues de la familia E5, el modelo ajustado pierde cobertura de idiomas (los datos de ajuste son exclusivamente turcos) pero gana precision en consultas navegacionales turcas del dominio educativo. No se dispone de resultados comparativos publicados entre estos modelos en un benchmark comun, por lo que la comparacion se limita a parametros, contexto, dimension y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde preguntas y no puede utilizarse como LLM.
- Longitud maxima de 512 tokens: los pasajes mas largos se truncan, lo que puede degradar la recuperacion en documentos extensos si no se trocean previamente.
- Especializacion de dominio: el ajuste se ha realizado sobre un corpus de la plataforma educativa MEBİ. El rendimiento fuera de ese dominio (legal, medico, industrial) no esta documentado y probablemente sea inferior al de un modelo multilingue generico del mismo tamano.
- Licencia no disponible: la model card deja el campo de licencia como "Unknown". Esto impide confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados formalmente en la model card (campo "Language: Unknown"), aunque toda la evidencia disponible apunta a que el ajuste es exclusivamente en turco.
- Riesgo de sesgo y alucinacion: en un modelo de recuperacion el riesgo no es generar contenido falso, sino devolver pasajes irrelevantes con alta puntuacion de similitud cuando la consulta es ambigua o esta fuera de dominio. Los resultados deben ir acompanados de umbrales de similitud y de un reranker cuando la precision sea critica.
- Resultados de benchmarks no verificados: todas las metricas del split de test estan marcadas con `verified: false` y proceden de una evaluacion propia del autor sobre su propio corpus, por lo que no son comparables con MTEB ni con evaluaciones de terceros.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- No se publican versiones cuantizadas ni GGUF: su uso en entornos de inferencia en CPU con `llama.cpp` requiere conversion manual no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nypgd/turkish-e5-large-mebi-v2
- Modelo base: https://huggingface.co/ytu-ce-cosmos/turkish-e5-large
- Modelo origen remoto de la familia E5: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Perfil del autor en HuggingFace: https://huggingface.co/nypgd/datasets
- Documentacion de Sentence Transformers: https://www.sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Articulo Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Ficha del modelo base en Inferix: https://inferix.co/models/ytu-ce-cosmos/turkish-e5-large
- Ficha del modelo base en AIBase: https://model.aibase.com/models/details/1927650050843086848
- Portal MEBİ (dominio de ajuste): https://mebi.eba.gov.tr
