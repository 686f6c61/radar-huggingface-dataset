# kozo2/metabolomics-edge-node2vec

## Resumen

kozo2/metabolomics-edge-node2vec es un modelo de embeddings de grafos basado en Node2Vec, no un modelo de lenguaje. Lo publica el usuario kozo2 en Hugging Face y su propósito es representar como vectores de 128 dimensiones los nodos (estudios, ensayos y features metabolómicas) de dos grafos no dirigidos de co-respuesta de metabolitos, construidos a partir de edges que superan un filtro de validez chi-cuadrado (frecuencia esperada ≥ 5). El repositorio contiene dos checkpoints independientes: uno intra-base de datos sobre MetaboLights (edge_ML) y otro bipartito que cruza MetaboLights con Metabolomics Workbench (edge_MLvsMW).

El problema que resuelve es la predicción de enlaces y la recuperación por similitud en redes metabolómicas fragmentadas entre estudios: los embeddings permiten calcular similitud coseno entre features sin depender de correlaciones directas observadas. En la evaluación held-out reportada por el autor, alcanza AUC 0,932 (edge_ML) y 0,928 (edge_MLvsMW), frente a baselines de solo grado de 0,826 y 0,888 respectivamente.

La relevancia es metodológica más que de escala: es un ejemplo reproducible de embedding transductivo sobre grafos biomédicos pequeños, con hiperparámetros, semillas y script de evaluación incluidos. Su tamaño es mínimo (108.544 y 2.017.024 parámetros) y se entrenó en una única NVIDIA H100 NVL en 31 segundos y 3 minutos 5 segundos respectivamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Node2Vec (random walks + skip-gram con negative sampling), implementación en PyTorch con tabla de embeddings dispersa (`sparse=True`) |
| Parametros totales | 108.544 (edge_ML) y 2.017.024 (edge_MLvsMW) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la ventana de contexto del random walk es `context_size` = 10 y `walk_length` = 20 |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en float32 sin cuantización publicada) |
| Idiomas soportados | no aplica (el modelo no procesa texto natural) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch `.pt` (`torch.save`) con diccionario `{embedding, node_id, args}` |

Detalle de los ficheros publicados:

| Fichero | Contenido | Tamaño |
|---|---|---|
| `edge_ML_filtered_expected_ge5_n2v.pt` | `{embedding: [848, 128] float32, node_id: [848], args}` | 453 KB |
| `edge_MLvsMW_filtered_expected_ge5_n2v.pt` | `{embedding: [15758, 128] float32, node_id: [15758], args}` | 8,6 MB |
| `node2vec_model.py`, `config.py` | Definición del modelo, bucle de entrenamiento y exportación de embeddings | — |
| `heldout_check.py` | Script de evaluación de predicción de enlaces held-out | — |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema estándar de Node2Vec: se generan caminos aleatorios de segundo orden sobre el grafo y se entrena un objetivo skip-gram con negative sampling, de forma que cada nodo aprende una representación de 128 dimensiones que predice su vecindario en los caminos. Los hiperparámetros de sesgo del walk son `p = 1.0` y `q = 1.0`, es decir, un recorrido no sesgado (equivalente a DeepWalk en cuanto a estrategia de exploración). La tabla de embeddings es el único tensor de parámetros (`sparse=True`), por lo que el optimizador empleado es SparseAdam con `lr = 0.01` y `batch_size = 128`. Cada checkpoint registra sus hiperparámetros exactos bajo la clave `args`.

Los grafos de entrada son: edge_ML con 848 nodos y 3.697 aristas, y edge_MLvsMW con 15.758 nodos y 89.277 aristas. En ambos casos se usan `walks_per_node = 10`, `negatives = 1`, 200 épocas y una única GPU NVIDIA H100 NVL, con tiempos de 31 segundos y 3 minutos 5 segundos. La pérdida evoluciona de 9,02 a 0,815 en edge_ML y de 6,73 a 0,876 en edge_MLvsMW. No se documenta uso de RLHF, DPO ni ajuste supervisado posterior; el entrenamiento es puramente auto-supervisado sobre la estructura del grafo.

## Capacidades

- Generación de embeddings de 128 dimensiones para nodos de grafos de co-respuesta metabolómica, exportables junto con el identificador original de estudio, ensayo o feature (`node_id`).
- Recuperación por similitud coseno de vecinos más cercanos de un nodo dado, útil para búsqueda de features relacionadas.
- Predicción de enlaces (link prediction) sobre aristas no observadas, medida con AUC en conjuntos held-out.
- Representación de grafos bipartitos que cruzan dos bases de datos (MetaboLights y Metabolomics Workbench) mediante el checkpoint edge_MLvsMW.
- Captura parcial de la etiqueta de especie hospedadora: la pureza de vecinos a 10 saltos por coseno es del 48,8% (edge_ML) y del 59,2% (edge_MLvsMW), y sube al 75-79% para las especies hospedadoras dominantes.
- Captura parcial de la base de datos de origen en el grafo bipartito: 67,5% global (75,4% para ST y 47,7% para MTBLS).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Recuperación de features metabolómicas relacionadas: dado un identificador como `MTBLS311_0001_00001537`, el modelo devuelve sus 10 vecinos más próximos por similitud coseno, lo que permite agrupar señales análogas entre estudios sin depender de correlaciones directas observadas.
- Predicción de enlaces en redes de co-respuesta: el modelo estima la probabilidad de que exista una arista no observada entre dos metabolitos. Con AUC held-out de 0,932 y 0,928 supera a un baseline de grado puro, por lo que puede usarse para priorizar pares candidatos antes de validación experimental.
- Integración cross-study de repositorios: el checkpoint edge_MLvsMW proyecta conjuntamente features de MetaboLights y Metabolomics Workbench en un mismo espacio de 128 dimensiones, lo que facilita la armonización de identificadores entre ambas fuentes.
- Ingeniería de features para modelos downstream: los vectores normalizados pueden alimentar clasificadores, clustering (k-means, HDBSCAN) o modelos de regresión sobre propiedades de metabolitos, sustituyendo a codificaciones one-hot de identificadores.
- Anotación asistida de especie hospedadora: aprovechando la pureza de vecinos por especie (59,2% global, 75-79% en especies dominantes), los embeddings sirven como señal auxiliar para inferir la especie asociada a un estudio o feature.
- Detección de comunidades funcionales: agrupando los embeddings por coseno o con métodos de clustering sobre el grafo, se pueden identificar módulos de metabolitos co-respondientes que sugieran rutas o procesos biológicos compartidos.
- Construcción de índices de similitud para búsqueda: exportando los vectores a FAISS o hnswlib (8,6 MB en float32 para 15.758 nodos) se puede desplegar un buscador de vecinos casi instantáneo sobre el catálogo completo de features.

## Benchmarks y rendimiento

| Métrica | edge_ML | edge_MLvsMW |
|---|---|---|
| Nodos / aristas | 848 / 3.697 | 15.758 / 89.277 |
| Aristas train / held-out | 3.328 / 369 | 80.350 / 8.927 |
| Nodos aislados por el split | 42 | 413 |
| AUC en held-out (nunca visto) | 0,932 | 0,928 |
| AUC en train (in-sample) | 0,985 | 0,985 |
| Baseline de grado (held-out) | 0,826 | 0,888 |
| Margen sobre el baseline | +0,106 | +0,040 |
| Pureza de vecinos por especie (top-10) | 48,8% | 59,2% |
| Pureza por base de datos de origen (top-10) | no aplica | 67,5% (75,4% ST, 47,7% MTBLS) |

La evaluación de `heldout_check.py` deduplica aristas no dirigidas, reserva un 10% aleatorio, reentrena desde cero sobre el 90% restante y puntúa las aristas held-out contra un número igual de no-aristas muestreadas, usando similitud coseno. El control es el baseline de attachment preferencial `d_u · d_v` calculado con los grados del conjunto de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo es una tabla de embeddings de 453 KB (edge_ML) y 8,6 MB (edge_MLvsMW) en float32; la inferencia es una consulta de tabla y un producto escalar.
- GPU recomendadas: ninguna imprescindible. Para reproducir el entrenamiento, el autor usó una NVIDIA H100 NVL; para un grafo de este tamaño, cualquier GPU con suficiente memoria para la tabla dispersa bastaría.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, incluso en iGPU, y también en CPU. El cuello de botella real del entrenamiento es el muestreo de random walks, no la memoria.
- Opciones de despliegue: PyTorch para cargar los checkpoints, PyTorch Geometric como dependencia de referencia, y exportación de los vectores normalizados a NumPy, FAISS o hnswlib para búsqueda por coseno.
- Latencia y throughput estimados: no se publican cifras de latencia. Los únicos tiempos reportados son de entrenamiento: 31 segundos (edge_ML) y 3 minutos 5 segundos (edge_MLvsMW) en una H100 NVL.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión de embedding | Grafo objetivo | Métrica held-out | Licencia |
|---|---|---|---|---|---|
| Este modelo (edge_ML) | Node2Vec no sesgado | 128 | co-respuesta metabolómica (MetaboLights) | AUC 0,932 | cc-by-4.0 |
| Este modelo (edge_MLvsMW) | Node2Vec no sesgado | 128 | co-respuesta bipartita (MetaboLights + Metabolomics Workbench) | AUC 0,928 | cc-by-4.0 |
| node2vec (implementación de referencia de Grover y Leskovec) | Random walks + skip-gram con parámetros p y q | configurable | genérico | no disponible | no disponible |
| DeepWalk | Random walks + skip-gram | configurable | genérico | no disponible | no disponible |
| metapath2vec | Random walks guiados por metapaths | configurable | grafos heterogéneos y bipartitos | no disponible | no disponible |

No se han encontrado en la información disponible comparaciones numéricas head-to-head entre este modelo y las alternativas anteriores sobre los mismos grafos. La única referencia cuantitativa publicada por el autor es frente al baseline de grado, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Embeddings transductivos: no existe mecanismo para proyectar un nodo que no estuviera en el grafo de entrenamiento sin reentrenar el modelo completo. Esto invalida su uso directo en escenarios de inferencia sobre features nuevas.
- Sensibilidad al presupuesto de entrenamiento: con 20 épocas, edge_ML obtuvo un AUC held-out de 0,791, por debajo de su propio baseline de grado (0,826). El valor por defecto de `--epochs` es 200 precisamente por este motivo y no debe reducirse sin reejecutar `heldout_check.py`.
- Margen estrecho en el grafo bipartito: en edge_MLvsMW la mejora sobre el baseline de grado es de solo +0,040, lo que indica que buena parte de la estructura de enlaces se explica por el grado de los nodos; el grafo es bipartito y contiene algunos estudios con grado muy alto.
- Presupuesto de entrenamiento sobredimensionado para edge_MLvsMW: su pérdida se estabiliza a partir de la época 19 aproximadamente, por lo que las 200 épocas son más de lo necesario en ese caso.
- Sesgo hacia especies dominantes: la pureza de vecinos por especie cae al 48,8% global en edge_ML, aunque sube al 75-79% para las especies hospedadoras mayoritarias; las especies minoritarias están peor representadas.
- Desequilibrio entre bases de datos: en el grafo bipartito, la pureza por base de origen es del 47,7% para MTBLS frente al 75,4% para ST, lo que sugiere que la representación está más cohesionada en torno a una de las dos fuentes.
- Licencia cc-by-4.0: permite uso comercial y obra derivada, pero exige atribución al autor y la indicación de cambios; no se especifican restricciones adicionales.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de falsos positivos en la predicción de enlaces, dado que el AUC held-out está en torno a 0,93 y no es perfecto; cualquier enlace propuesto debe validarse experimentalmente.
- Sin soporte de texto ni multilingüismo: no es un modelo de lenguaje, por lo que no procesa idiomas ni instrucciones en lenguaje natural.
- Popularidad y validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso independiente ni de replicación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kozo2/metabolomics-edge-node2vec
- Dataset complementario con los grafos, propiedades de nodos y pipeline completo: https://huggingface.co/datasets/kozo2/metabolomics-edges-expected-ge5
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
