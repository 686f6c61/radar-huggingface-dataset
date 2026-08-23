# AbstractPhil/alephlm-0

## Resumen

AlephLM-0 es un modelo experimental de codificador de texto basado en la arquitectura Transformer, desarrollado por AbstractPhil como parte de un programa de investigacion sobre enrutamiento en modelos de mezcla de expertos (MoE). El modelo implementa un router alternativo denominado "direccion de ancla con signo", que sustituye el softmax aprendido de los routers convencionales por una formula cerrada basada en cosenos y funciones hiperbolicas. Este enfoque permite que cada experto sea reclutado de forma positiva o negativa (anclas inhibitorias), sin necesidad de seleccion top-k ni de perdidas de balanceo de carga.

El modelo se entrena sobre 31,9 millones de filas de datos de subtitulos conceptuales y pares de frases, con una arquitectura troncal tipo BERT y tres expertos despachados por bloque. El objetivo principal es comparar el rendimiento de este router geometrico frente a un tronco denso de parametros equivalentes, bajo el mismo objetivo de entrenamiento y a escala de 32M de filas. Los resultados muestran que el enrutamiento con anclas iguala al control denso en capacidad final, aunque el modelo se presenta como un experimento en curso, no como un lanzamiento de producto establecido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con tronco denso y 3 expertos despachados por bloque |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | mit |
| Formato de pesos | no disponible (repositorio de experimentos, incluye checkpoints y metricas) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de codificador transformer con una capa de tronco (ff512) y tres expertos adicionales (ff512) por bloque. El router utiliza una formula cerrada con anclas aprendidas: cada token calcula una direccion firmada `u_k = cos(x, a_k) / τ` y los pesos se derivan mediante `w_k = sinh(u_k) / Σ_j cosh(u_j)`. Este esquema permite pesos negativos (anclas inhibitorias) y no depende de un argmax ni de un top-k, lo que elimina la necesidad de funciones de perdida de balance de carga. Los anclas, compuertas y expertos se entrenan exclusivamente mediante el gradiente de la tarea, sin supervision adicional.

El entrenamiento se realiza sobre un corpus de 31,9 millones de filas (mezcla de Conceptual Captions 12M y un dataset de pares de frases con consenso) durante 4 epocas, con una cabeza de lectura CLS para tareas de similitud semantica. Se evaluaron tres variantes: `a1_anchored` (rutas aprendidas), `a2_dense` (control denso) y `a3_random` (anclas congeladas aleatoriamente), cada una con dos semillas. Los resultados finales muestran que las diferencias entre los tres disenos son minimas en la capacidad final, pero el enrutamiento con anclas aporta una mejora funcional de 0.026 a 0.052 segun la metrica de toggle (activacion/desactivacion de los expertos).

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica (STS-B, SICK-R, STS12-16, BIOSSES).
- Extraccion de caracteristicas densas de texto en ingles, optimizada para representaciones de oraciones.
- Enrutamiento de expertos con pesos firmados, que permite una asignacion adaptativa de capacidad por token.
- Soporte de lectura CLS para produccion de vectores de frase de dimension fija.
- Capacidades de aprendizaje de representaciones geometricas mediante anclas aprendidas y cosenos hiperbolicos.

## Casos de uso

- **Busqueda semantica de documentos**: el modelo puede generar embeddings de frases para indexar y recuperar textos similares en colecciones de documentos en ingles, aprovechando su capacidad de similitud semantica.
- **Clustering de texto**: al proyectar frases en un espacio vectorial, permite agrupar contenidos tematicamente en aplicaciones de organizacion de datos no estructurados.
- **Deteccion de duplicados**: puede comparar pares de frases para identificar contenidos redundantes en bases de datos de articulos o registros.
- **Evaluacion de similitud de respuestas**: util para sistemas de QA o chatbots que necesitan medir la equivalencia semantica entre respuestas generadas y respuestas de referencia.
- **Pre-entrenamiento de modelos de tareas posteriores**: los embeddings generados pueden servir como entrada para clasificadores o regresores en tareas de procesamiento de lenguaje natural.
- **Investigacion en MoE**: como repositorio experimental, es util para estudiar el comportamiento de routers geometricos en sistemas de mezcla de expertos, especialmente en comparacion con densos.

## Benchmarks y rendimiento

Los resultados de la evaluacion final sobre el corpus completo (31,9M filas × 4 epocas, lectura CLS) se presentan a continuacion. Todos los valores son la media de Spearman en 8 tareas de similitud (STS-B, SICK-R, STS12-16, BIOSSES):

| run | 8-task mean | dispatch OFF | toggle | mimicry R@1 | cos→target | erank /768 |
|---|---|---|---|---|---|---|
| `a1_anchored-s0` | .6031 | .5743 | −.0288 | .9980 | .8394 | 98.6 |
| `a1_anchored-s1` | .6007 | .5625 | −.0382 | .9975 | .8391 | 98.6 |
| `a2_dense-s0` | .6026 | — | — | .9975 | .8418 | 99.2 |
| `a3_random-s0` | .6033 | .5772 | −.0261 | .9980 | .8392 | 98.8 |
| `a2_dense-s1` | .6040 | — | — | .9975 | .8420 | 99.2 |
| `a3_random-s1` | .6047 | .5523 | −.0524 | .9980 | .8396 | 98.6 |

Desglose por tarea (Spearman) para las dos semillas:

| run | STS-B | SICK-R | STS12 | STS13 | STS14 | STS15 | STS16 | BIOSSES | mean |
|---|---|---|---|---|---|---|---|---|---|
| `a1_anchored-s0` | .5731 | .6528 | .4996 | .6014 | .5457 | .7121 | .6761 | .5639 | .6031 |
| `a2_dense-s0` | .5731 | .6507 | .4965 | .5962 | .5430 | .7130 | .6798 | .5683 | .6026 |
| `a3_random-s0` | .5707 | .6538 | .4966 | .5998 | .5448 | .7103 | .6806 | .5703 | .6033 |
| `a1_anchored-s1` | .5681 | .6512 | .4931 | .5996 | .5423 | .7094 | .6745 | .5673 | .6007 |
| `a2_dense-s1` | .5740 | .6537 | .4997 | .6038 | .5417 | .7128 | .6789 | .5671 | .6040 |
| `a3_random-s1` | .5717 | .6533 | .4946 | .6007 | .5434 | .7128 | .6800 | .5809 | .6047 |

En el experimento de muestra pequena (500k filas, L=128, una GPU de consumo), se observa una ventaja del anclado sobre el denso:

| metrica | anclado | denso | diferencia |
|---|---|---|---|
| recuperacion R@1, 2 epocas | .9055 | .7790 | +.1265 |
| capacidad 8 tareas, 2 epocas | .3833 | .3530 | +.0303 |
| cos→target, 2 epocas | .6491 | .5984 | +.0508 |
| rango efectivo, 2 epocas | 46.1 | 35.7 | +10.4 |

## Requisitos de hardware

- El repositorio contiene checkpoints de entrenamiento de 482 GB, por lo que la inferencia requiere espacio de almacenamiento considerable y probablemente multiples GPUs para cargar el modelo completo.
- En el experimento de muestra pequena se utilizo una sola GPU de consumo (no se especifica el modelo), lo que sugiere que la inferencia con una cuantizacion ligera podria caber en tarjetas de 16-24 GB.
- Para uso en produccion, se recomienda desplegar con vLLM o TGI para servir los embeddings, aunque no se proporcionan datos de latencia ni throughput.
- El modelo no esta disenado para tareas de generacion de texto, sino para extraccion de caracteristicas, por lo que no requiere soporte de decodificacion especulativa.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de la misma categoria (MoE para embeddings) en la informacion proporcionada. El modelo se compara internamente con su control denso (`a2_dense`) y con su variante de anclas aleatorias (`a3_random`), mostrando que las diferencias en capacidad son minimas (dentro de .0040) pero que el enrutamiento aporta una funcion adicional significativa en la metrica de toggle. No hay datos sobre otros modelos de embeddings como `all-MiniLM-L6-v2` o `bge-large-en`, por lo que se indica como no disponible.

## Limitaciones y advertencias

- **Estado experimental**: el repositorio es un experimento en curso, no un modelo estable. Los checkpoints se actualizan cada 30 minutos y pueden contener configuraciones incompletas o refutadas.
- **Idioma**: solo soporta ingles, lo que limita su uso en aplicaciones multilingue.
- **Contexto**: no se especifica la longitud de contexto, por lo que se recomienda asumir un limite de 512 tokens (como los modelos base BERT) hasta que se confirme.
- **Rendimiento moderado**: los valores de Spearman en tareas de similitud estan en el rango de .60, que es inferior a modelos de embeddings modernos (p. ej., > .80 en STS-B).
- **Riesgo de alucinacion**: no aplica, ya que no es un modelo generativo.
- **Licencia**: MIT, permite uso comercial y modificacion, pero el autor no proporciona garantias de soporte ni estabilidad.

## Enlaces

- Repositorio HuggingFace: [AbstractPhil/alephlm-0](https://huggingface.co/AbstractPhil/alephlm-0)
- Documento tecnico: [TECHNICAL.md](https://huggingface.co/AbstractPhil/alephlm-0/blob/main/TECHNICAL.md)
- Entorno de ejecucion: [ENVIRONMENT.md](https://huggingface.co/AbstractPhil/alephlm-0/blob/main/ENVIRONMENT.md)
- Articulo semanal: [Geometric Memory FT5 — Agreement, Anchors, Addresses](https://huggingface.co/blog/AbstractPhil/geometric-memory-ft5)
- Repositorio GitHub relacionado: [alephnullai/Aleph](https://github.com/alephnullai/Aleph)
