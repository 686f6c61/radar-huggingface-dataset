# codefuse-ai/F2LLM-v2-14B

## Resumen

F2LLM-v2-14B es un modelo de embeddings multilingüe de gran tamaño, perteneciente a la familia F2LLM-v2 desarrollada por CodeFuse (codefuse-ai). A diferencia de un LLM generativo, este modelo está diseñado específicamente para la extracción de características (feature extraction) y produce representaciones vectoriales densas de texto, con una dimensión de salida de 5120. Está entrenado sobre un conjunto curado de 60 millones de muestras públicas de alta calidad y soporta más de 200 idiomas, con un énfasis particular en lenguas de medios y bajos recursos, tradicionalmente poco cubiertas por otros sistemas.

El modelo cuenta con aproximadamente 14 000 millones de parámetros (13 990 394 880) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Forma parte de una familia completa de ocho tamaños (desde 80M hasta 14B) y se publica junto con los datos de entrenamiento, el código y los checkpoints intermedios, siguiendo una filosofía de apertura total. Su relevancia actual radica en ofrecer una alternativa de embeddings multilingüe de alto rendimiento, con especial atención a idiomas poco representados, y en ser uno de los pocos modelos de este tipo con una escala de 14B y licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "qwen3" sugiere una posible base Qwen3, sin confirmar) |
| Parametros totales | 13 990 394 880 (~14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; se recomienda bfloat16) |
| Idiomas soportados | mas de 200, incluyendo es, en, zh, ru, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentacion publicada. El tag "qwen3" presente en los metadatos de HuggingFace sugiere que el modelo podria estar basado en la arquitectura Qwen3, pero no hay confirmacion oficial. Se trata de un modelo encoder de embeddings, probablemente de tipo transformer, optimizado para producir representaciones de texto de alta calidad. La dimension de salida es de 5120, lo que indica una capacidad de representacion amplia.

El entrenamiento se realizo sobre un conjunto de datos curado de 60 millones de muestras publicas, con un enfasis especial en idiomas de medios y bajos recursos. La familia F2LLM-v2 incluye modelos base e instruct en varios tamanos; los tres modelos mas pequenos (80M, 160M y 330M) se obtuvieron mediante poda y entrenamiento adicional a partir del modelo base de 0.6B. No se mencionan tecnicas como RLHF o DPO, que no son habituales en modelos de embeddings. La publicacion incluye los datos de entrenamiento, el codigo y los checkpoints intermedios, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de embeddings de texto para oraciones, parrafos y documentos completos.
- Busqueda semantica y recuperacion de informacion (information retrieval) en entornos multilingues.
- Clasificacion de texto y analisis de similitud entre textos.
- Soporte multilingue amplio: mas de 200 idiomas, con especial atencion a lenguas de bajos recursos.
- Integracion nativa con Sentence Transformers y Transformers, ademas de compatibilidad con text-embeddings-inference.
- Dimension de embeddings de 5120, que permite representaciones densas de alta granularidad.
- No es un modelo generativo: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica multilingue en bases de conocimiento: el modelo puede indexar documentos en decenas de idiomas y recuperar los mas relevantes para una consulta dada, gracias a su amplio soporte linguistico y su dimension de embeddings de 5120.
- Sistemas de recuperacion aumentada por generacion (RAG): al integrarse con un LLM generativo, permite recuperar pasajes relevantes de una base documental multilingue y pasarlos como contexto al generador, mejorando la precision de las respuestas.
- Clasificacion de texto en entornos multilingues: por ejemplo, clasificacion de tickets de soporte, deteccion de spam o categorizacion de noticias en idiomas minoritarios, donde otros modelos fallan por falta de cobertura.
- Deduplicacion de documentos a gran escala: comparando embeddings de documentos se pueden identificar duplicados o casi duplicados en corpus multilingues, util para limpieza de datos.
- Sistemas de recomendacion basados en contenido: representar items (articulos, productos, publicaciones) como vectores y calcular similitudes para sugerir contenido relacionado en multiples idiomas.
- Analisis de sentimiento y opinion en redes sociales: al generar embeddings de textos cortos en varios idiomas, se pueden agrupar o clasificar opiniones sin necesidad de modelos especificos por lengua.
- Construccion de indices de busqueda para archivos historicos o bibliotecas digitales: su capacidad multilingue permite procesar colecciones que mezclan idiomas, como archivos coloniales o documentos de organizaciones internacionales.

## Benchmarks y rendimiento

La model card indica que la familia F2LLM-v2 establece un nuevo estado del arte en una amplia gama de benchmarks MTEB, incluyendo Code, European, Scandinavian, German, French, Spanish, Polish, Dutch, Japanese, Vietnamese, Thai, Indic y Persian. Sin embargo, no se proporcionan cifras concretas en la documentacion disponible. Se remite al leaderboard de MTEB para consultar los resultados detallados. No se dispone de datos numericos comparativos con otros modelos en la informacion publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 14B parametros en bfloat16, los pesos ocupan aproximadamente 28 GB. Con cuantizacion a 8 bits se reduciria a unos 14 GB, y a 4 bits a unos 7 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para bfloat16 se necesitaria una GPU con al menos 32 GB de VRAM (por ejemplo, A100 40GB, H100, o RTX 4090 con 24 GB no seria suficiente sin cuantizacion). Con cuantizacion a 8 bits podria caber en una RTX 4090 (24 GB) o similar.
- En consumer GPU: es posible con cuantizacion, pero no hay versiones GGUF oficiales publicadas. Se puede intentar con bitsandbytes u otras herramientas de cuantizacion.
- Opciones de despliegue: el modelo es compatible con Sentence Transformers, Transformers y text-embeddings-inference (segun los tags). Tambien se puede servir con vLLM u otros frameworks que soporten modelos de embeddings, aunque no se menciona explicitamente.
- Latencia y throughput: no se han publicado datos oficiales. Al ser un modelo de 14B, la latencia sera mayor que la de modelos mas pequenos; se recomienda usar GPU de alta gama para produccion.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion publicada. Como referencia, los modelos de embeddings multilingues mas conocidos en el rango de 7B-14B incluyen:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| F2LLM-v2-14B | 14B | no disponible | >200 | Apache 2.0 |
| E5-mistral-7b | 7B | 32768 | 100+ (principalmente europeos) | MIT |
| GTE-Qwen2-7B | 7B | 32768 | 30+ | Apache 2.0 |
| BGE-M3 | 568M | 8192 | 100+ | MIT |

F2LLM-v2-14B destaca por su mayor tamano y su cobertura de idiomas de bajos recursos, pero no se pueden extraer conclusiones de rendimiento sin datos de benchmarks comparativos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo representaciones vectoriales. No se debe utilizar para tareas de generacion o chat.
- La longitud de contexto no esta documentada; es posible que sea limitada en comparacion con otros modelos de embeddings recientes, lo que afectaria a documentos muy largos.
- Al estar entrenado con datos publicos, puede heredar sesgos presentes en esos datos, especialmente en idiomas de bajos recursos donde la cantidad de datos es menor.
- El riesgo de alucinacion no aplica al no generar texto, pero si puede producir embeddings poco discriminativos para dominios muy especializados o jerga tecnica.
- Aunque la licencia Apache 2.0 permite uso comercial, el gran tamano del modelo (14B) implica costes de inferencia considerables, lo que puede no ser viable para aplicaciones en tiempo real con alto volumen.
- No se han publicado versiones cuantizadas oficiales; el repositorio ocupa 279.8 GB, lo que sugiere que incluye multiples formatos o checkpoints, pero no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codefuse-ai/F2LLM-v2-14B
- Modelo base (Preview): https://huggingface.co/codefuse-ai/F2LLM-v2-14B-Preview
- Dataset de entrenamiento: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Paper (arXiv): https://arxiv.org/abs/2603.19223
- Otros modelos de la familia: https://huggingface.co/codefuse-ai (listado completo de F2LLM-v2)
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
