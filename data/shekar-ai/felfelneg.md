# shekar-ai/felfelneg

## Resumen

felfelneg es un modelo de embeddings de frases (sentence transformer) desarrollado por shekar-ai, un proyecto orientado al procesamiento de lenguaje natural en persa. Se trata de un ajuste fino de shekar-ai/FelfelSupPairs con arquitectura ALBERT de aproximadamente 11,9 millones de parámetros, que proyecta texto en un espacio vectorial denso de 768 dimensiones y se compara mediante similitud coseno. Su propósito es generar representaciones semánticas de calidad para texto en persa, de modo que tareas como la búsqueda semántica, la minería de paráfrasis o la agrupación de documentos puedan resolverse por similitud vectorial en lugar de por coincidencia literal de términos.

El modelo se entrenó sobre un conjunto de 4.290.735 pares en formato parquet, derivados del modelo base, y combina dos funciones de pérdida: MultipleNegativesRankingLoss, habitual en recuperación densa con negativos en el lote, y MatryoshkaLoss, que produce representaciones anidadas y permite truncar las dimensiones de salida sin una degradación severa. La longitud máxima de secuencia es de 512 tokens.

Es relevante ahora porque cubre un nicho poco atendido (embeddings densos para persa) con un modelo muy ligero que se ejecuta en CPU sin problemas. Sin embargo, su adopción pública es todavía muy baja (29 descargas y 0 likes en el momento de redactar esta ficha), no publica resultados de benchmarks y no declara licencia, lo que limita su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (AlbertModel) dentro de un pipeline SentenceTransformer: Transformer + Pooling + Normalize |
| Parametros totales | 11.940.096 (aprox. 11,9 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no declarados oficialmente; los ejemplos de la model card estan en persa (farsi) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |
| Dimensionalidad de salida | 768 dimensiones (entrenado con MatryoshkaLoss, por lo que admite truncado) |
| Funcion de similitud | similitud coseno |
| Estrategia de pooling | mean pooling, con include_prompt activado |
| Funciones de perdida | MultipleNegativesRankingLoss y MatryoshkaLoss |
| Dataset de entrenamiento | parquet, 4.290.735 ejemplos |
| Modelo base | shekar-ai/FelfelSupPairs |
| Tamano del repositorio | 3,6 GB |
| Descargas | 29 |
| Likes | 0 |
| Fecha de creacion declarada | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un transformer ALBERT, la variante "lite" de BERT que reduce el número de parámetros mediante el reparto de parámetros entre capas (cross-layer parameter sharing) y la factorización de las matrices de embedding. El pipeline de sentence-transformers se compone de tres módulos: un Transformer con tarea feature-extraction que devuelve last_hidden_state (token_embeddings), una capa de Pooling de dimensión 768 que aplica media sobre los tokens e incluye el prompt, y una capa de Normalize que devuelve el embedding de frase normalizado, listo para compararse por producto escalar o coseno.

El entrenamiento se realizó sobre 4.290.735 pares en formato parquet procedentes del modelo base FelfelSupPairs. Se emplearon dos funciones de pérdida de forma conjunta: MultipleNegativesRankingLoss, que trata los positivos de otros ejemplos del lote como negativos y es el estándar en recuperación densa, y MatryoshkaLoss, que obliga a que los prefijos de menor dimensión del embedding sean también útiles por sí mismos. Esta segunda pérdida es la innovación técnica destacable: permite truncar el vector de 768 a 512, 256, 128 o 64 dimensiones con una pérdida de calidad gradual, lo que abarata almacenamiento y búsqueda vectorial. La model card no detalla la composición exacta del corpus (más allá de estar en persa y de que los ejemplos giran en torno a entidades geográficas) ni si se aplicaron etapas adicionales de RLHF o DPO, algo poco habitual en modelos de embeddings.

## Capacidades

- Generación de embeddings densos de frases y pasajes en un espacio de 768 dimensiones con normalización L2.
- Similitud textual semántica (semantic textual similarity) entre pares de frases.
- Búsqueda semántica y recuperación densa (dense retrieval) sobre corpus de documentos.
- Extracción de características (feature extraction) a nivel de token mediante last_hidden_state.
- Minería de paráfrasis: detección de frases con significado equivalente redactadas de forma distinta.
- Agrupación (clustering) de documentos y textos por similitud vectorial.
- Clasificación de texto usando los embeddings como entrada de un clasificador ligero.
- Representaciones truncables gracias a MatryoshkaLoss (por ejemplo, 768, 512, 256, 128 o 64 dimensiones).
- Capacidades multilingües: no declaradas; los ejemplos publicados están en persa (farsi).
- No soporta generación de texto, tool calling, function calling, uso como agente ni razonamiento multi-paso, ya que es un modelo exclusivamente de representación.

## Casos de uso

- Búsqueda semántica en corpus en persa: indexar artículos, noticias o documentación persa con embeddings de 768 dimensiones y recuperar por similitud coseno los pasajes más relevantes para una consulta en lenguaje natural.
- Recuperación aumentada (RAG) para modelos generativos en persa: usar felfelneg como etapa de recuperación de contexto, alimentando un LLM con los documentos más similares a la pregunta del usuario.
- Deduplicación y detección de duplicados cercanos: agrupar documentos o entradas cuya similitud supere un umbral para eliminar contenido repetido en un corpus de entrenamiento o en una base documental.
- Minería de pares de entrenamiento: generar pares positivos y negativos de alta calidad para entrenar otros modelos de recuperación o de reranking en persa.
- Coincidencia de preguntas frecuentes: construir un sistema de FAQ donde la pregunta del usuario se compara por similitud con las preguntas canónicas y se devuelve la respuesta asociada, con soporte de variaciones léxicas.
- Clasificación y moderación de contenido: transformar textos persas en vectores de 768 dimensiones y entrenar un clasificador ligero (regresión logística, SVM) para categorización temática, detección de spam o análisis de sentimiento.
- Agrupación temática de documentos: aplicar clustering sobre los embeddings para descubrir tópicos en una colección de noticias o informes sin necesidad de etiquetas.
- Recomendación basada en contenido: calcular similitud entre ítems (artículos, productos descritos en persa) para sugerir elementos relacionados a partir de sus descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de HuggingFace no incluye métricas de evaluación (ni MTEB, ni resultados de recuperación, ni comparaciones numéricas con otros modelos) y los resultados de búsqueda web no aportan datos de rendimiento. Los únicos números publicados por el autor son los de la demostración de uso, que muestran puntuaciones de similitud coseno (por ejemplo, 0,8283 entre la consulta "کومروو در کدام منطقه..." y su pasaje correcto frente a 0,4887 con un pasaje no relacionado), pero se trata de un ejemplo ilustrativo, no de una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11,9 millones de parámetros, los pesos ocupan aproximadamente 48 MB en FP32, 24 MB en FP16 y 12 MB en INT8. El consumo real en GPU viene dominado por el framework y el tamaño de lote, no por el modelo.
- GPU recomendadas: cualquier GPU moderna sirve. El modelo es sobredimensionado incluso para una GTX 1650 (4 GB) o una RTX 3060. Tarjetas como A100 o H100 solo tienen sentido para procesar lotes muy grandes en paralelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo y también en iGPU, así como en dispositivos de borde tipo Raspberry Pi 4 o 5.
- Inferencia en CPU: totalmente viable. Es uno de los puntos fuertes del modelo, ya que no requiere acelerador para producir embeddings en tiempo razonable.
- Opciones de despliegue: sentence-transformers (vía Python), HuggingFace Transformers, exportación a ONNX con Optimum, text-embeddings-inference y FastEmbed. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras oficiales de latencia ni de frases por segundo.
- Advertencia sobre el repositorio: el repositorio ocupa 3,6 GB frente a los aproximadamente 48 MB que ocuparían los pesos del modelo, por lo que es previsible que contenga artefactos de entrenamiento adicionales. Conviene revisar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| shekar-ai/felfelneg | 11,94 M | 768 | 512 | persa (no declarado) | no disponible |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | aprox. 118 M | 384 | 128 | mas de 50 idiomas | Apache-2.0 |
| sentence-transformers/all-MiniLM-L6-v2 | aprox. 22,7 M | 384 | 256 | ingles | Apache-2.0 |
| sentence-transformers/LaBSE | aprox. 471 M | 768 | 256 | 109 idiomas | Apache-2.0 |

Los datos de las alternativas provienen de sus respectivas model cards públicas; los de felfelneg, de la información proporcionada. La diferencia principal es que felfelneg es entre dos y cuarenta veces más pequeño que las alternativas, no declara licencia ni idiomas oficiales y no publica benchmarks, por lo que no es posible comparar su calidad de recuperación con la de estos modelos. Como alternativas multilingües con licencia permisiva y soporte comunitario amplio, paraphrase-multilingual-MiniLM-L12-v2 y LaBSE son opciones más seguras si el persa no es el único idioma objetivo o si se necesita certeza jurídica sobre la licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es un riesgo legal directo para cualquier despliegue en producción.
- Idiomas no declarados: la model card deja el campo de idioma como desconocido. Los ejemplos publicados están en persa, por lo que el rendimiento en otros idiomas es una incógnita.
- Ausencia de benchmarks: no hay métricas de recuperación, similitud o clustering, así que no se puede verificar la calidad del modelo frente a alternativas.
- Sesgo temático y de dominio: los ejemplos de la model card giran en torno a entidades geográficas (ciudades, distritos, condados) y el dataset base parece derivado de contenido enciclopédico. Es probable un sesgo hacia ese dominio y un rendimiento inferior en textos especializados (legal, médico, técnico).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en recuperación: dos frases con alta similitud coseno pueden no ser equivalentes semánticamente, especialmente con textos largos.
- Límite de 512 tokens: los documentos más largos deben trocearse en fragmentos, lo que puede romper la coherencia semántica entre fragmentos.
- Repositorio sobredimensionado: 3,6 GB para un modelo de 12 millones de parámetros sugiere artefactos de entrenamiento que incrementan el tiempo de descarga y el espacio en disco sin aportar valor de inferencia.
- Validación comunitaria mínima: 29 descargas y 0 likes indican que el modelo apenas ha sido probado por terceros, lo que reduce la confianza en su robustez.
- Fecha de creación declarada en 2026-09-21: es una fecha posterior a la actual, lo que sugiere un error en los metadatos y conviene tratarla con cautela.
- Funciones de pérdida Matryoshka: el truncado del embedding funciona, pero la calidad en dimensiones reducidas no está cuantificada en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shekar-ai/felfelneg
- Modelo base: https://huggingface.co/shekar-ai/FelfelSupPairs
- Perfil del autor en HuggingFace: https://huggingface.co/shekar-ai
- Conjuntos de datos del autor: https://huggingface.co/shekar-ai/datasets
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos de sentence-transformers en HuggingFace: https://huggingface.co/models?library=sentence-transformers
- Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Aprendizaje eficiente de representaciones de frases (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
