# danish-foundation-models/propella-bekko-a25m

## Resumen

Propella-bekko-a25m es un modelo de anotacion de documentos desarrollado por danish-foundation-models (grupo vinculado a ellamind) que destila el clasificador propella-1-4b en una red de 123 millones de parametros. Dado un documento, devuelve 17 propiedades en una sola pasada hacia delante, sin generar texto: integridad y densidad del contenido, calidad, valor educativo, tipo de documento, sector empresarial, relevancia regional y de pais, presencia de PII, seguridad del contenido y sesgo comercial, entre otras. La salida es un conjunto de etiquetas ordinales, binarias y multietiqueta que respetan el esquema y los nombres de propella-1, por lo que las anotaciones de ambos modelos son directamente comparables.

El modelo resuelve un problema de escala en la curación de corpus: anotar cientos de miles de documentos con un LLM grande resulta caro y lento, mientras que propella-bekko-a25m procesa 188 documentos por segundo en una sola RTX A6000 en bf16. Su backbone es bekko-embedding-v1-a25m, un encoder multilingue de 123,5 millones de parametros, sobre el que se montan cabezas independientes por propiedad. La ventana de entrada combina 1.024 tokens del inicio del documento con 128 del final, de modo que no se pierde el cierre de documentos largos.

Es relevante ahora porque la seleccion de datos de pretraining y la anotacion masiva de corpus multilingues se han convertido en cuellos de botella practicos. El modelo cubre 17 idiomas (danes, noruego, sueco, islandes, feroes, neerlandes, aleman, ingles, frances, espanol, italiano, portugues, rumano, polaco, checo, hungaro y finlandes) y se distribuye con licencia MIT, lo que permite integrarlo en pipelines de curación sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (backbone bekko-embedding-v1-a25m) con cabezas de clasificacion independientes por propiedad |
| Parametros totales | 123.459.652 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens del inicio del documento + 128 tokens del final (1.152 tokens de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue: da, sv, no, is, fo, nl, de, fi, fr, it, es, pl, cs, hu, ro, pt, en |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PyTorch) |
| Pipeline | text-classification |
| Propiedades predichas | 17 (todas las de propella-1 excepto `one_sentence_description`) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder denso con backbone bekko-embedding-v1-a25m y una cabeza por propiedad: softmax para las propiedades de seleccion unica y sigmoide para las multietiqueta, sin condicionamiento cruzado entre propiedades (cada una se predice de forma independiente a partir de un estado compartido del documento). La entrada concatena 1.024 tokens del inicio y 128 del final del documento, y se pasan caracteristicas de longitud a nivel de documento a las cabezas. Las propiedades ordinales se decodifican al nivel esperado mediante `round(Σ p_i · rank_i)` en lugar de `argmax`, lo que aporta aproximadamente +0,013 de QWK.

El entrenamiento consistio en destilar las etiquetas de propella-1-4b sobre 844.912 documentos en 17 idiomas procedentes de los corpus Dynaword, FineWeb-2 y FinePDFs. Se realizaron 3 epocas con lotes de 65.536 tokens durante 316 minutos en una Quadro RTX 8000. La funcion de perdida combina entropia cruzada para las propiedades de seleccion unica, entropia cruzada binaria para las multietiqueta y una perdida F1 a nivel de token para la deteccion de PII. Las anotaciones y el codigo de entrenamiento se publican abiertamente.

## Capacidades

- Anotacion de documentos en una sola pasada hacia delante, sin generacion de texto ni prompt especifico de tarea.
- Prediccion de propiedades de contenido central: `content_integrity` (ordinal, 4 niveles), `content_ratio` (ordinal, 5), `content_length` (ordinal, 4).
- Clasificacion funcional: `content_type` (multietiqueta, 18 valores), `business_sector` (multietiqueta, 37), `technical_content` (multietiqueta, 7).
- Evaluacion de calidad y valor: `content_quality` (ordinal, 5), `information_density` (ordinal, 5), `educational_value` (ordinal, 5), `reasoning_indicators` (ordinal, 5).
- Audiencia y proposito: `audience_level` (ordinal, 6), `commercial_bias` (ordinal, 5), `time_sensitivity` (ordinal, 4).
- Seguridad y cumplimiento: `content_safety` (ordinal, 5) y `pii_presence` (binaria, con perdida F1 a nivel de token en entrenamiento).
- Geografia: `regional_relevance` (multietiqueta, 14 valores) y `country_relevance` (multietiqueta, 65 valores: los 64 paises mas frecuentes en entrenamiento mas `other`).
- Capacidad multilingue en 17 idiomas europeos, con especial cobertura de lenguas nordicas.
- Compatibilidad de esquema con propella-1: las etiquetas usan los mismos nombres, lo que permite mezclar anotaciones de ambos modelos sin mapeo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Curacion de corpus de pretraining: filtrar y priorizar documentos por `content_quality`, `information_density` y `educational_value` antes de incluirlos en un dataset de entrenamiento, procesando millones de documentos a 188 docs/s por GPU.
- Deteccion de PII a escala: usar la etiqueta binaria `pii_presence` como primer filtro en pipelines de anonimizacion o cumplimiento normativo, derivando a revision humana o a un modelo mayor solo los documentos marcados.
- Moderacion y seguridad de contenido: aplicar `content_safety` y `commercial_bias` para clasificar y enrutar documentos web antes de su publicacion o indexacion.
- Enriquecimiento de indices de busqueda y RAG: anadir metadatos estructurados (`content_type`, `business_sector`, `audience_level`, `regional_relevance`) a cada fragmento de un corpus para permitir filtrado facetado en recuperacion.
- Analisis de documentacion tecnica: identificar mediante `technical_content` y `reasoning_indicators` los documentos con conocimiento especializado y razonamiento logico, util para construir datasets de entrenamiento orientados a codigo o matematicas.
- Segmentacion geografica de contenido: usar `country_relevance` y `regional_relevance` para organizar corpus por mercado o region, especialmente en lenguas nordicas donde la cobertura de modelos generalistas es menor.
- Construccion de datasets etiquetados: generar anotaciones a gran escala para entrenar o evaluar clasificadores downstream mas ligeros, aprovechando que las etiquetas siguen el esquema de propella-1.
- Investigacion sobre calidad de datos: medir la distribucion de propiedades (densidad, valor educativo, sesgo comercial) en un crawl web y correlacionarla con el rendimiento de modelos entrenados con ese corpus.

## Benchmarks y rendimiento

Los resultados publicados miden el acuerdo con dos anotadores independientes del profesor (DeepSeek-V4.1-Flash y GLM-5.3-Flash) sobre 300 documentos reservados, con macro-F1 agregado sobre todas las propiedades. El throughput se mide en documentos por segundo en una RTX A6000 con bf16. El azar (predecir siempre la etiqueta mas frecuente) se situa en 0,123.

| Modelo | Parametros | docs/s | vs DeepSeek | vs GLM-5.3 |
|---|---|---|---|---|
| propella-bekko-a25m | 123 M | 188 | no disponible en el extracto | no disponible en el extracto |
| propella-1-4b (profesor) | 4 B | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

La tabla de resultados completa no esta incluida en la informacion disponible; solo se confirma que la comparacion se realizo contra los dos anotadores citados y que el azar marca 0,123 de macro-F1.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 para los 123,5 M de parametros, mas el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX A6000 (referencia de throughput publicada, 188 docs/s), Quadro RTX 8000 (usada en entrenamiento); cualquier GPU con al menos 2-4 GB de VRAM es suficiente.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: PyTorch nativo (libreria declarada), con `custom_code` en el repositorio; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos y no a este tipo de clasificador con cabezas multiples.
- Latencia y throughput: 188 documentos por segundo en una RTX A6000 en bf16, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| propella-bekko-a25m | 123 M | 1.024 + 128 tokens | Clasificador multietiqueta destilado, 17 propiedades | MIT | Hugging Face |
| propella-1-4b | 4 B | No disponible | Anotador generativo, 18 propiedades en JSON | No disponible | Hugging Face (ellamind) |
| DeepSeek-V4.1-Flash | No disponible | No disponible | LLM generativo usado como anotador de referencia | No disponible | No disponible |
| GLM-5.3-Flash | No disponible | No disponible | LLM generativo usado como anotador de referencia | No disponible | No disponible |

La comparacion relevante es frente a su profesor: propella-bekko-a25m ofrece 17 de las 18 propiedades de propella-1-4b con una reduccion de parametros de aproximadamente 32 veces (123 M frente a 4 B) y un throughput de 188 docs/s en una sola GPU, a costa de perder la descripcion libre en texto y de limitar `country_relevance` a 65 valores. Los datos cuantitativos de acuerdo frente a DeepSeek-V4.1-Flash y GLM-5.3-Flash no estan disponibles en el extracto proporcionado.

## Limitaciones y advertencias

- Es un clasificador, no un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni agentes.
- La ventana de entrada es limitada (1.024 tokens de inicio mas 128 de final); el contenido intermedio de documentos largos no se procesa y puede afectar a propiedades como `content_integrity` o `information_density`.
- `country_relevance` esta restringido a 65 valores: cualquier pais fuera de los 64 mas frecuentes en entrenamiento se devuelve como `other`, lo que degrada la granularidad geografica en corpus con paises poco representados.
- No predice `one_sentence_description`, por lo que no sustituye por completo a propella-1-4b si se necesita esa salida.
- Las etiquetas se heredan de propella-1-4b: los sesgos y errores del profesor se transfieren al estudiante por destilacion, sin correccion humana documentada.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en documentos atipicos o fuera de la distribucion de entrenamiento (Dynaword, FineWeb-2, FinePDFs).
- La cobertura linguistica se limita a 17 idiomas europeos; el rendimiento en otras lenguas no esta documentado.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danish-foundation-models/propella-bekko-a25m
- Modelo profesor propella-1-4b: https://huggingface.co/ellamind/propella-1-4b
- Backbone bekko-embedding-v1-a25m: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Dataset de anotaciones propella-bekko-data: https://huggingface.co/datasets/danish-foundation-models/propella-bekko-data
- Codigo de entrenamiento: https://github.com/danish-foundation-models/propella-bekko
- Documentacion de cobertura de paises: https://github.com/danish-foundation-models/propella-bekko/blob/main/docs/coverage.md
- Referencia de propiedades: property_descriptions.md (en el repositorio del modelo)
- Paper Dynaword: https://huggingface.co/papers/2508.02271
- Paper arXiv 2311.07264: https://arxiv.org/abs/2311.07264
