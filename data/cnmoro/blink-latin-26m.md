# cnmoro/blink-latin-26M

## Resumen

Blink Latin 26M es un modelo de embeddings estáticos (static embeddings) derivado de MinishLab's Blink Multilingual 64M, desarrollado por el usuario cnmoro. Se trata de una versión podada del modelo original, en la que se han eliminado las entradas de vocabulario correspondientes a scripts no latinos (cirílico, han, kana, hangul) y se ha reindexado la tabla de embeddings para ajustarla al vocabulario reducido. El resultado es un modelo de 26,5 millones de parámetros con embeddings de 256 dimensiones, diseñado para tareas de similitud semántica y extracción de características en inglés, portugués, español, francés, alemán e italiano.

El modelo resuelve el problema de despliegue de embeddings multilingües en entornos con recursos limitados, reduciendo el tamaño en disco de 264,3 MB a 107,6 MB sin pérdida de calidad en los idiomas latinos soportados. La poda se realizó sin entrenamiento adicional ni cuantización: cada fila de embedding retenida se copió exactamente en float32 desde el checkpoint original.

Es relevante porque demuestra que es posible reducir sustancialmente el coste de almacenamiento e inferencia de un modelo de embeddings multilingüe manteniendo vectores bit a bit idénticos para textos en scripts latinos, con un rendimiento de codificación de aproximadamente 0,15 ms por frase individual y 24,24 ms para 1.012 frases en portugués con pooling nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embeddings (model2vec), tokenización WordPiece con mean pooling |
| Parametros totales | 26.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (los ensayos float16 e int8 por filas fueron descartados por alterar los vectores) |
| Idiomas soportados | en, pt, es, fr, de, it (y otros idiomas en script latino, incluidos palabras y nombres en polaco) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un modelo de embeddings estáticos basado en model2vec: no utiliza una torre transformer para codificar, sino que cada token del vocabulario tiene asignado un vector de embedding de 256 dimensiones, y la representación de una frase se obtiene mediante mean pooling de los vectores de sus tokens. La tokenización es WordPiece, heredada del modelo original Blink Multilingual 64M. El checkpoint fuente es `a7198ef875b9a756b8b641ab064542f7408e50f3`.

La modificación respecto al original consiste en la eliminación de entradas de vocabulario con letras de scripts no latinos (cirílico, han, kana, hangul), conservando acentos latinos y vocabulario compartido como palabras polacas y nombres. Los IDs del tokenizer se remapearon a la tabla de embeddings más pequeña y cada fila retenida se copió exactamente en float32. No hubo entrenamiento adicional ni cuantización. El vocabulario pasó de 250.000 a 103.548 entradas, y los parámetros de embedding de 64,0M a 26,5M, manteniendo 256 dimensiones. Se incluye un encoder de pooling nativo opcional (compilado en C) que restaura la heurística de longitud del modelo original y puede usar el checkpoint original como fallback para textos con scripts no latinos.

## Capacidades

- Generación de embeddings de frases para similitud semántica y extracción de características.
- Soporte multilingüe para inglés, portugués, español, francés, alemán e italiano, además de otros idiomas en script latino.
- Codificación por lotes rápida con pooling nativo (compilación C opcional) o pooling NumPy.
- Fallback opcional al checkpoint original para textos que contengan nombres, citas o pasajes en scripts no latinos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es exclusivamente un modelo de embeddings.
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Búsqueda semántica multilingüe: indexar documentos en inglés, portugués, español, francés, alemán e italiano y recuperar por similitud coseno usando vectores de 256 dimensiones, con un coste de almacenamiento de aproximadamente 1 KB por frase en float32.
- Deduplicación y clustering de textos: agrupar noticias, reseñas o tickets de soporte por similitud semántica; el modelo produce vectores idénticos al original para textos latinos, garantizando coherencia con pipelines existentes.
- Sistemas de recomendación basados en contenido: calcular similitud entre descripciones de productos o artículos en varios idiomas latinos con latencia de milisegundos.
- Filtrado y enrutamiento de consultas: clasificar consultas de usuario por proximidad semántica a prototipos predefinidos en atención al cliente, con 0,15 ms por frase individual.
- Detección de paráfrasis y similitud entre pares de frases: evaluar pares de frases en español, portugués e inglés; el modelo iguala Recall@1 del original en las seis direcciones de traducción entre en/pt/es.
- Embeddings para RAG ligero: usar como primer nivel de recuperación en pipelines con recursos limitados, reduciendo el tamaño en disco un 59 % respecto al original (107,6 MB frente a 264,3 MB).
- Procesamiento por lotes de corpus grandes: codificar 1.012 frases en portugués en 24,24 ms con pooling nativo, adecuado para tareas de indexación masiva en CPU.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Vectores idénticos al original (FLORES-200 devtest) | bit a bit en 6.072 frases (en, pt, es, fr, de, it) |
| Recall@1 en direcciones de traducción en/pt/es | igual al original en las seis direcciones |
| Pares etiquetados con fallback mixto (STS Benchmark, ASSIN 2, STS22) | vectores y scores de similitud iguales al original en 5.611 pares |
| Artículos de noticias con texto no latino (modo standalone) | 6 vectores cambiaron respecto al original |
| Tiempo mediano de codificación, 1.012 frases en portugués (pooling nativo) | 24,24 ms (standalone) / 27,06 ms (con fallback) |
| Tiempo mediano de codificación, 1.012 frases en portugués (sin pooling nativo) | 36,45 ms |
| Latencia por frase individual | ~0,15 ms en todas las configuraciones |
| Entorno de medida | Ryzen 7 3700X, 4 hilos de tokenizer, multiprocessing desactivado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en sentido estricto; el modelo ocupa 107,6 MB en disco y puede ejecutarse íntegramente en CPU o en RAM.
- GPU recomendadas: innecesarias; cualquier CPU moderna es suficiente. En GPU, cualquier tarjeta con al menos 1 GB de memoria puede alojarlo, pero no aporta ventajas significativas frente a CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en dispositivos de gama baja, así como en entornos sin GPU.
- Opciones de despliegue: librería `model2vec` (StaticModel), loader `BlinkModel` incluido en el repo con pooling nativo en C o NumPy, y fallback opcional al checkpoint original de MinishLab.
- Latencia y throughput: ~0,15 ms por frase individual; 24,24 ms para 1.012 frases en portugués con pooling nativo en Ryzen 7 3700X.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Idiomas | Licencia | Tamano en disco |
|---|---|---|---|---|---|---|
| cnmoro/blink-latin-26M | 26,5M | 256 | no disponible | en, pt, es, fr, de, it (+ latinos) | MIT | 107,6 MB |
| minishlab/blink-multilingual-64M | 64,0M | 256 | no disponible | multilingüe (incluye scripts no latinos) | no disponible en la informacion | 264,3 MB |
| Otros modelos de embeddings estáticos (model2vec) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto ni razona; es exclusivamente un codificador de embeddings estáticos.
- En modo standalone, los textos que contienen scripts no latinos (nombres, citas, pasajes en cirílico, han, kana o hangul) producen vectores distintos al original; se recomienda usar el fallback al checkpoint original para esos casos.
- Los ensayos de cuantización float16 e int8 por filas alteraron los vectores y fueron descartados; no se garantiza paridad bit a bit con el original bajo cuantización.
- La poda elimina vocabulario de scripts no latinos, por lo que el soporte para idiomas como ruso, chino, japonés o coreano no está disponible en modo standalone.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo original; no se documentan análisis de sesgo específicos en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo base original debe verificarse por separado si se usa como fallback.
- No se han publicado datos sobre longitud de contexto, límites de truncamiento o comportamiento en documentos muy largos.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cnmoro/blink-latin-26M
- Modelo base: https://huggingface.co/minishlab/blink-multilingual-64M
- Checkpoint fuente (revision): https://huggingface.co/minishlab/blink-multilingual-64M/tree/a7198ef875b9a756b8b641ab064542f7408e50f3
- Dataset FLORES-200: https://huggingface.co/datasets/facebook/flores
- Dataset STS Benchmark: https://huggingface.co/datasets/sentence-transformers/stsb
- Dataset ASSIN 2: https://huggingface.co/datasets/nilc-nlp/assin2
- Dataset STS22: https://huggingface.co/datasets/mteb/sts22-crosslingual-sts
- Resultados de benchmark completos: ./benchmark_results.json (incluido en el repositorio)
