# adambuttrick/ror-set-point-retriever-embeddinggemma-300m

## Resumen

`ror-set-point-retriever-embeddinggemma-300m` es un modelo de recuperacion (retriever) de frases, publicado por el desarrollador adambuttrick, especializado en la primera etapa de un pipeline de enlazado de afiliaciones institucionales contra el registro ROR (Research Organization Registry). El problema que resuelve es concreto: dada una cadena de afiliacion tal como aparece en un articulo cientifico, el modelo genera un vector de consulta que se compara por producto escalar contra los vectores precalculados de los 143.284 registros ROR, permitiendo recuperar los 32 candidatos mas plausibles antes de aplicar un modelo de conjunto (set model) que decide que registros nombra realmente la cadena.

Tecnicamente es un ajuste fino de `google/embeddinggemma-300m`, un modelo de embeddings de aproximadamente 302,9 millones de parametros con arquitectura `gemma3_text`, gestionado a traves de la libreria `sentence-transformers`. Conserva las capas de pooling y densa del modelo base, emplea pesos en bf16 y trabaja con prompts asimetricos: uno para consultas (cadenas de afiliacion) y otro para pasajes (textos de los registros ROR).

Su relevancia actual es doble. Por un lado, demuestra que un encoder de 300 millones de parametros puede sustituir a un `multilingual-e5-base` en esta tarea, abaratando el coste de indexacion y de inferencia sobre un corpus de mas de 140.000 registros. Por otro, forma parte de una coleccion reproducible de variantes que aislan el efecto de cada decision de diseno (modelo base, datos sinteticos, destilacion de juicios de un LLM profesor), lo que lo convierte en un caso de estudio util para quien disene pipelines de entity linking en dominios cientificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder `gemma3_text` (base `google/embeddinggemma-300m`), con pooling y capa densa de EmbeddingGemma |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens para consultas en busqueda; 128 tokens para textos de registro; 96 tokens para cadenas durante el entrenamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo ocupa 0,8 GB) |
| Idiomas soportados | no disponible de forma explicita; el modelo base EmbeddingGemma es multilingue y los datos de entrenamiento incluyen un conjunto `synthetic_non_latin` |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un dual encoder derivado de EmbeddingGemma: convierte la cadena de afiliacion en un vector de consulta y el texto de cada registro ROR en un vector de registro, de modo que los vectores de registro se calculan una sola vez y se reutilizan para todas las consultas. La similitud se mide con producto escalar. Se mantienen el pooling y la capa densa originales del modelo base y los pesos se almacenan en bf16. El uso previsto es asimetrico: el prompt de consulta es `"task: search result | query: "` y el de pasaje `"title: none | text: "`.

El ajuste fino se realizo sobre el dataset `adambuttrick/ror-set-point-matching-train-validation-test`, con 494.701 filas en total repartidas en tres fuentes: 304.626 filas derivadas de juicios de un modelo profesor (167.533 cadenas, con un registro por cada registro con probabilidad igual o superior a 0,5), 49.890 filas de datos etiquetados del split `affiliations_unseen_institutions` (16.452 cadenas y 16.630 enlaces, cada enlace usado tres veces) y 140.185 filas sinteticas del conjunto `synthetic_non_latin` (133.757 cadenas). Los negativos duros de las cadenas sinteticas se minaron con un retriever previo (`ror-set-point-retriever-e5-base-no-synthetic`), descartando etiquetas, registros relacionados jerarquicamente, registros con el mismo nombre y candidatos con puntuacion igual o superior a 0,95 veces la del registro de origen, con una media de 9,6 negativos por cadena.

El procedimiento de entrenamiento emplea perdida InfoNCE con temperatura 0,02 sobre todos los registros del lote, lotes de 128 cadenas con 1 positivo y 3 negativos duros cada una, una sola epoca (3.864 pasos), optimizador AdamW con tasa de aprendizaje 2e-5 y weight decay 0,01, calentamiento lineal del 5 por ciento de los pasos seguido de decaimiento lineal, autocast en bf16 y recorte de gradiente de 1,0. Se excluyeron las cadenas del profesor que otorgaban probabilidad igual o superior a 0,5 a un registro reservado (28.474) y las identicas a una cadena de evaluacion (11). No se activo gradient checkpointing.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion densa (pipeline `sentence-similarity`).
- Codificacion asimetrica con prompts distintos para consulta y pasaje, optimizada para recuperacion de entidades.
- Recuperacion de candidatos ROR para cadenas de afiliacion institucional en articulos cientificos.
- Manejo de negativos duros y entrenamiento contrastivo, lo que mejora la separacion entre instituciones con nombres parecidos.
- Cobertura de cadenas no latinas gracias al conjunto sintetico `synthetic_non_latin` incluido en el entrenamiento.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- Integracion con `sentence-transformers`: carga directa, `encode` con `prompt_name="query"` o `prompt_name="passage"` y control de `max_seq_length`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de recuperacion.

## Casos de uso

- Desambiguacion de afiliaciones en pipelines de bibliometria: el modelo convierte cada cadena de afiliacion de un articulo en un vector de consulta y recupera los 32 registros ROR mas probables de los 143.284 existentes, que despues se filtran con un set model. Es adecuado porque el coste de indexar el catalogo completo se paga una sola vez.
- Enriquecimiento de bases de datos de publicaciones cientificas: dado un dump de Crossref u OpenAlex, se normalizan las afiliaciones institucionales a identificadores ROR estables para agregaciones por institucion, financiacion o pais.
- Construccion de indices de recuperacion en produccion con Text Embeddings Inference: al ser compatible con TEI y con endpoints de Hugging Face, puede desplegarse como servicio de embeddings dedicado con latencia baja sobre lotes de 256 registros.
- Auditoria de calidad de datos en repositorios institucionales: detectar afiliaciones mal normalizadas o variantes ortograficas de una misma institucion comparando los vectores de registro y sus vecinos mas cercanos.
- Sistemas de recomendacion y busqueda de colaboraciones: a partir de una afiliacion, recuperar instituciones candidatas semanticamente proximas para sugerir revisores, socios o paneles de evaluacion.
- Investigacion sobre entity linking: servir como linea base reproducible frente a las demas variantes de la coleccion ROR set point matching (E5-base, sin datos sinteticos, destilada) para medir el efecto aislado de cambiar el encoder.
- Preprocesado de pipelines RAG en dominios cientificos: usar el mismo encoder para indexar textos cortos de metadatos institucionales y recuperar pasajes relevantes en asistentes de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de entrenamiento y las fuentes de datos, pero no incluye tablas de metricas (recall, MRR, nDCG ni comparaciones numericas) frente a las otras variantes de la coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 302,9 millones de parametros ocupan aproximadamente 0,6 GB; con overhead de activaciones y lotes grandes, el consumo realista se situa en torno a 1-2 GB por proceso.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, ademas de GPUs de portatil con 6-8 GB.
- GPU de centro de datos recomendadas para indexacion masiva del catalogo completo (143.284 registros): A100, H100, L40S o L4, con lotes de 256 como en el ejemplo de la model card.
- Es viable en CPU para cargas pequenas (una consulta puntual o un lote reducido), aunque la indexacion completa del catalogo resulta mucho mas lenta.
- Opciones de despliegue: `sentence-transformers` en Python, Text Embeddings Inference (TEI), endpoints de Hugging Face y servicios gestionados como FriendliAI.
- Latencia y throughput: no disponibles de forma oficial; el unico dato operativo es el uso de lotes de 256 para codificar los textos de registro y una longitud maxima de 128 tokens para pasajes y 512 para consultas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adambuttrick/ror-set-point-retriever-embeddinggemma-300m` | 302,9 M | 512 tokens (consulta) / 128 (registro) | Dual encoder sobre EmbeddingGemma, ajustado para ROR | Gemma | Hugging Face, TEI, endpoints |
| `adambuttrick/ror-set-point-retriever-e5-base` | no disponible | no disponible | Dual encoder sobre multilingual-e5-base, linea base de la coleccion | no disponible | Hugging Face |
| `adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill` | no disponible | no disponible | Variante de la linea base con destilacion de juicios de un profesor | no disponible | Hugging Face |
| `adambuttrick/ror-set-point-retriever-e5-base-no-synthetic` | no disponible | no disponible | Retriever usado para minar negativos duros de las cadenas sinteticas | no disponible | Hugging Face |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada; la model card indica solo que esta version aisla el efecto de un unico cambio (el encoder base) respecto a `ror-set-point-retriever-e5-base-openalex-jev-distill`.

## Limitaciones y advertencias

- El modelo no genera texto ni razona: es un encoder de recuperacion y cualquier uso fuera de similitud semantica o recuperacion densa queda fuera de su diseno.
- Esta pensado como primera etapa de un pipeline de dos fases; por si solo devuelve candidatos, no la decision final de que registros nombra una cadena.
- El limite de 512 tokens para consultas y de 128 para registros implica que afiliaciones muy largas o textos de registro extensos se truncan.
- Los negativos duros sinteticos se minaron con un retriever previo, lo que puede introducir sesgos heredados de ese modelo en la frontera entre positivos y negativos.
- Los juicios del profesor pueden contener errores; la model card documenta la exclusion de cadenas ambiguas, pero no cuantifica la tasa de ruido residual.
- La licencia Gemma impone condiciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos antes de un despliegue en produccion.
- No se documentan evaluaciones de sesgo, robustez multilingue ni comportamiento ante afiliaciones en alfabetos no latinos mas alla de la inclusion del conjunto sintetico.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de recuperar candidatos plausibles pero incorrectos cuando dos instituciones comparten nombre o acronimo.
- El numero de descargas (25) y de likes (0) es bajo, lo que sugiere poca validacion externa independiente hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-retriever-embeddinggemma-300m
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Dataset de entrenamiento: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset con juicios del profesor: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
- Coleccion ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Variante anterior de referencia: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Retriever usado para minar negativos: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-no-synthetic
- Set model complementario: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Set model sobre EmbeddingGemma: https://huggingface.co/adambuttrick/ror-set-point-set-model-embeddinggemma-300m
- Repositorio GitHub del proyecto: https://github.com/adambuttrick/ror-set-point-matching
- Ficha en FriendliAI: https://friendli.ai/models/adambuttrick/ror-set-point-retriever-embeddinggemma-300m
- Ficha en free2aitools: https://free2aitools.com/model/adambuttrick/ror-set-point-retriever-embeddinggemma-300m
