# minishlab/potion-multilingual-128m-onnx

## Resumen

potion-multilingual-128m-onnx es un modelo de embeddings de texto estáticos multilingüe desarrollado por Minish Lab, distribuido como exportación ONNX del modelo original potion-multilingual-128m. Este modelo genera representaciones vectoriales de 256 dimensiones para texto en 101 idiomas, y está diseñado para ofrecer un rendimiento cercano al de modelos transformer como LaBSE (alcanza el 90,86 % de su puntuación media) pero con una velocidad de inferencia órdenes de magnitud superior, tanto en CPU como en GPU.

El modelo se basa en la técnica Model2Vec, que destila un modelo transformer (en este caso, BAAI/bge-m3) en una tabla de embeddings estáticos mediante el algoritmo Tokenlearn, entrenado sobre 2 millones de frases del dataset C4 en 101 lenguas. El resultado es un modelo extremadamente ligero y rápido, adecuado para entornos con recursos limitados o aplicaciones en tiempo real. La versión ONNX permite ejecutarlo con onnxruntime o transformers.js, sin depender de la librería model2vec.

Su relevancia actual radica en que ofrece una alternativa práctica a los modelos de embeddings basados en transformers para tareas multilingües de búsqueda semántica, clasificación y agrupamiento, con un coste computacional mínimo y una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec, destilado de BAAI/bge-m3) |
| Parametros totales | No disponible (el nombre sugiere 128M, no confirmado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato ONNX sin cuantización especificada) |
| Idiomas soportados | 101 idiomas (af, am, ar, az, be, bg, bn, ca, ceb, co, cs, cy, da, de, el, eo, es, et, eu, fa, fi, fil, fr, fy, ga, gd, gl, gu, ha, haw, hi, hmn, ht, hu, hy, id, ig, is, it, iw, ja, jv, ka, kk, km, kn, ko, ku, ky, la, lb, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, ny, pa, pl, ps, pt, ro, ru, sd, si, sk, sl, sm, sn, so, sq, sr, st, su, sv, sw, ta, te, tg, th, tr, uk, ur, uz, vi, xh, yi, yo, zh, zu) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo, sino un sistema de embeddings estáticos generado mediante la técnica Model2Vec. Esta técnica consiste en destilar un modelo de embeddings basado en transformer (en este caso BAAI/bge-m3) en una tabla de vectores estáticos, uno por cada token del vocabulario. Durante la inferencia, el texto se tokeniza y se promedian los vectores de los tokens para obtener la representación de la frase, sin necesidad de pasar por capas de atención ni redes profundas.

El entrenamiento se realizó con el algoritmo Tokenlearn sobre 2 millones de frases extraídas del dataset C4, cubriendo 101 idiomas. El proceso de destilación captura la información semántica del modelo profesor y la transfiere a los embeddings estáticos, logrando un equilibrio entre rendimiento y eficiencia. El resultado es un modelo que produce vectores de 256 dimensiones y que, según los autores, alcanza el 90,86 % de la puntuación media de LaBSE (47,31 frente a la referencia) siendo a la vez órdenes de magnitud más rápido.

## Capacidades

- Generación de embeddings de texto para frases y documentos cortos en 101 idiomas.
- Búsqueda semántica y recuperación de información multilingüe: permite encontrar documentos o frases similares en distintos idiomas mediante similitud coseno.
- Clasificación de texto: los embeddings pueden alimentar clasificadores lineales o redes simples para tareas de categorización, análisis de sentimiento, detección de spam, etc.
- Agrupamiento (clustering) de documentos: útil para organizar grandes volúmenes de texto en temas o categorías.
- Similitud entre frases: adecuado para tareas de paráfrasis, deduplicación o comparación de textos.
- Integración con pipelines de sentence-transformers: se puede cargar como un modelo estático dentro del ecosistema sentence-transformers, facilitando su uso en aplicaciones existentes.
- Ejecución en CPU y GPU con onnxruntime, y en navegador con transformers.js, lo que permite despliegue en entornos sin dependencias pesadas.

## Casos de uso

- Búsqueda semántica en motores de recomendación: el modelo puede indexar catálogos de productos, artículos o documentos en varios idiomas y devolver resultados relevantes a partir de consultas en lenguaje natural, gracias a su velocidad y soporte multilingüe.
- Clasificación de tickets de soporte: los embeddings permiten categorizar automáticamente mensajes de clientes en distintos idiomas (quejas, consultas, devoluciones) con un clasificador ligero entrenado sobre los vectores generados.
- Deduplicación de contenido en plataformas colaborativas: al comparar embeddings de textos, se pueden detectar publicaciones duplicadas o muy similares en foros, wikis o sistemas de gestión de contenido, incluso si están en idiomas distintos.
- Agrupamiento de documentos legales o académicos: el modelo facilita organizar grandes colecciones de textos multilingües en clusters temáticos para análisis posterior, con un coste computacional mínimo.
- Sistemas de preguntas y respuestas basados en recuperación (RAG): los embeddings estáticos pueden usarse para recuperar pasajes relevantes de una base de conocimiento multilingüe antes de pasarlos a un modelo generativo, reduciendo la latencia del pipeline.
- Análisis de sentimiento en redes sociales: al generar embeddings de tweets o comentarios en varios idiomas, se pueden entrenar clasificadores ligeros que operen en tiempo real sobre flujos de datos masivos.

## Benchmarks y rendimiento

Según la información publicada por los autores, potion-multilingual-128m alcanza una puntuación media de 47,31 en tareas de evaluación multilingüe, lo que representa el 90,86 % del rendimiento de LaBSE. No se han publicado resultados detallados por tarea (como MMLU, HumanEval o GSM8K) en la documentación disponible, ya que se trata de un modelo de embeddings y no de generación de texto.

| Modelo | Puntuación media | Rendimiento relativo a LaBSE |
|---|---|---|
| LaBSE | No disponible | 100 % (referencia) |
| potion-multilingual-128m | 47,31 | 90,86 % |

## Requisitos de hardware

- Al ser un modelo de embeddings estáticos, no requiere GPU para inferencia; puede ejecutarse en CPU con un consumo de memoria reducido.
- El tamaño del repositorio es de 0,5 GB, pero el modelo ONNX en memoria probablemente ocupe menos de 500 MB, dependiendo de la precisión de los pesos.
- Cabe en cualquier máquina con 1-2 GB de RAM disponible, incluyendo dispositivos de bajo consumo como Raspberry Pi o instancias cloud de tipo serverless.
- Para despliegue en producción, se puede usar onnxruntime (CPU o GPU) o transformers.js en el navegador.
- La latencia por lote de frases es del orden de milisegundos en CPU, aunque no se han publicado cifras exactas de throughput.
- No se requieren GPUs específicas; cualquier hardware con soporte para ONNX Runtime es suficiente.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Dimensiones | Velocidad | Licencia |
|---|---|---|---|---|---|
| potion-multilingual-128m | Estático (Model2Vec) | 101 | 256 | Muy alta (CPU) | MIT |
| LaBSE | Transformer (BERT) | 109 | 768 | Baja (requiere GPU para ser práctico) | Apache 2.0 |
| BAAI/bge-m3 | Transformer (destilado) | 100+ | 1024 | Media | MIT |

potion-multilingual-128m es significativamente más rápido y ligero que LaBSE y bge-m3, a costa de una pequeña pérdida de rendimiento (90,86 % de LaBSE). Es la opción recomendada cuando la latencia y el consumo de recursos son críticos, y cuando se trabaja con textos cortos.

## Limitaciones y advertencias

- Al ser embeddings estáticos, no capturan el contexto de la misma manera que los modelos transformer; frases con polisemia o matices contextuales pueden producir representaciones menos precisas.
- El modelo está entrenado para frases y documentos cortos; textos muy largos pueden no beneficiarse de la representación promedio de tokens.
- Aunque cubre 101 idiomas, la calidad puede variar entre lenguas con menos datos de entrenamiento; idiomas minoritarios podrían tener embeddings menos robustos.
- No se han publicado evaluaciones detalladas de sesgos o alucinaciones; al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente, pero los sesgos del dataset C4 pueden reflejarse en las representaciones.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento (C4) para cumplir con posibles requisitos de atribución.
- El formato ONNX no incluye cuantización específica; para despliegues en dispositivos muy limitados, podría ser necesario cuantizar manualmente el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/minishlab/potion-multilingual-128m-onnx
- Modelo base: https://huggingface.co/minishlab/potion-multilingual-128M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Colección de modelos base: https://huggingface.co/collections/minishlab/model2vec-base-models-66fd9dd9b7c3b3c0f25ca90e
- Resultados de Model2Vec: https://github.com/MinishLab/model2vec/tree/main/results
- Documentación de Model2Vec: https://minish.ai/packages/model2vec/introduction
