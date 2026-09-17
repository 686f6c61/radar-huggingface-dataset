# kozo2/edge-ML-node2vec

## Resumen

kozo2/edge-ML-node2vec no es un modelo de lenguaje, sino un conjunto de embeddings de grafos obtenidos con Node2Vec sobre una red de co-respuesta de metabolitos. Lo publica el usuario kozo2 en Hugging Face y resuelve un problema de representación estructural: convertir cada uno de los 18.494 nodos de un grafo no dirigido con 2.709.209 aristas en un vector denso de 128 dimensiones float32 que preserve la topología de la red. Es relevante ahora porque ofrece una línea base fuerte y reproducible para tareas de predicción de enlaces y agrupamiento en metabolómica, con una AUC de 0,9880 en validación fuera de muestra frente a 0,9201 de un baseline basado solo en el grado de los nodos.

El modelo se apoya en la implementación de Node2Vec de PyTorch Geometric y se entrenó durante 20 épocas con paseos aleatorios no sesgados (p = q = 1,0), longitud de paseo 20 y ventana de contexto 10, usando SparseAdam con learning rate 0,01. El resultado es un único tensor de 18.494 × 128 (9,7 MB de checkpoint), acompañado de un script con la definición del modelo, el bucle de entrenamiento y la exportación de embeddings. El pipeline declarado en Hugging Face es feature-extraction.

La relevancia práctica está en su uso como extractor de características aguas arriba: los vectores sirven para predecir asociaciones entre metabolitos, agrupar compuestos por similitud estructural y alimentar modelos posteriores. El propio autor documenta las cautelas importantes: los embeddings son transductivos, solo capturan topología (no pesos de arista ni atributos de nodo) y la pureza por especie está parcialmente confundida con el diseño del grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Node2Vec (paseos aleatorios de segundo orden + skip-gram con negative sampling), implementado con PyTorch Geometric |
| Parametros totales | 2.367.232 (18.494 nodos × 128 dimensiones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; `context_size` de 10 en la ventana de skip-gram de los paseos) |
| Tipos de cuantizacion | no aplica (los pesos se publican en float32; no hay versiones cuantizadas) |
| Idiomas soportados | no aplica (el modelo no procesa texto; las entradas son identificadores de nodo como `MTBLS1405_0002_00003332`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `.pt` (`torch.load`, pickle); no se publican safetensors ni GGUF |
| Pipeline declarado | feature-extraction |
| Dimension del embedding | 128 |
| Nodos del grafo | 18.494 |
| Aristas del grafo | 2.709.209 (no dirigidas) |
| Tamano del checkpoint | 9,7 MB (`edge_ML_expected_ge5_n2v.pt`); el tensor de embeddings son ~9,5 MB |
| Metrica de similitud | coseno (la empleada en la evaluacion y la recomendada aguas abajo) |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es Node2Vec, un metodo de embedding transductivo de grafos que combina paseos aleatorios de segundo orden con un objetivo skip-gram entrenado mediante negative sampling. La implementacion usa el modulo `Node2Vec` de PyTorch Geometric, con `sparse=True`, lo que habilita el uso de `SparseAdam`; el autor advierte que cambiar uno de los dos obliga a cambiar el otro. La configuracion de muestreo es explícitamente no sesgada: `p` = 1,0 y `q` = 1,0, de modo que los paseos equivalen a un random walk uniforme sin control de exploracion en anchura o profundidad.

Los hiperparametros de entrenamiento son `embedding_dim` 128, `walk_length` 20, `context_size` 10, `walks_per_node` 10 y `num_negative_samples` 1, con lotes de 128 nodos semilla y 145 lotes por epoca. Se entrenaron 20 epocas con SparseAdam y learning rate 0,01. La perdida cayo de 9,92 en la inicializacion a 0,880, y se mantuvo plana a partir de la epoca 14 aproximadamente, con un coste de unos 0,9 s por epoca en una sola H100. El script se ejecuta con `uv run python node2vec_model.py --epochs 20`.

La dependencia tecnica destacable es `pyg-lib` (>= 0.6.0), que aporta el kernel de random walk y no esta disponible en PyPI; el repositorio del dataset asociado fija la version 0.9.0+pt214cu130 desde `data.pyg.org`. El grafo es denso (grado mediano 90), un detalle relevante porque explica por que el autor incluye un baseline de grado: una AUC alta que solo reprodujese la distribucion de grados aportaria poca informacion.

## Capacidades

- Extraccion de caracteristicas de grafo: produce un vector denso de 128 dimensiones float32 por cada nodo del grafo, indexado por identificador de cadena original.
- Prediccion de enlaces (link prediction): puntua pares de nodos mediante similitud coseno; alcanza AUC 0,9880 sobre el 10% de aristas nunca vistas en un experimento de reentrenamiento 90/10.
- Recuperacion de vecinos: de los 10 vecinos mas cercanos de cada nodo, el 49,9% son aristas reales del grafo (31,7 veces lo esperado por azar); en el top-50, el 41,3% (26,2 veces).
- Agrupamiento por especie: el 90,7% de los nodos tiene sus diez vecinos mas proximos de la misma especie, superando el 98% en las tres especies mas grandes y bajando al 68-79% en especies de unos cientos de nodos.
- No genera texto, no dispone de tool calling ni de razonamiento multi-paso, y no tiene capacidades multimodales: es un modelo de representacion, no un modelo de lenguaje.
- No admite nodos nuevos: el modelo es transductivo y no existe mecanismo documentado para inferir la representacion de un nodo ausente en el entrenamiento.
- No incorpora atributos de arista (`OddsRatio_log2`, `ChiTestsPValue`) ni caracteristicas de nodo (`x`): los paseos son no ponderados.

## Casos de uso

- Prediccion de asociaciones metabolito-metabolito: dado un par de nodos, calcular la similitud coseno de sus embeddings para priorizar asociaciones candidatas antes de validarlas experimentalmente. La AUC de 0,9880 fuera de muestra respalda este uso como filtro previo.
- Recuperacion de metabolitos similares: indexar los 18.494 vectores y resolver consultas de vecinos mas cercanos para localizar compuestos con entorno topologico parecido, aprovechando que casi la mitad de los diez vecinos mas proximos son aristas reales.
- Agrupamiento y anotacion funcional: usar los embeddings como entrada de k-means, DBSCAN o UMAP para explorar agrupaciones de metabolitos; la pureza por especie del 90,7% sugiere que parte de la estructura capturada es biologicamente interpretable.
- Extraccion de caracteristicas para modelos aguas abajo: concatenar los 128 valores a descriptores quimicos o a abundancias para tareas de clasificacion o regresion, empleando el tensor como capa de entrada ya preentrenada sobre topologia.
- Analisis de cohortes y estudios metabolomicos: dado que las aristas se forman mayoritariamente dentro de un mismo estudio, los embeddings permiten explorar la coherencia interna de un estudio y detectar nodos con vecindarios anomalos.
- Auditoria de la estructura del grafo: comparar la AUC del embedding con el baseline de grado (0,9201) para determinar cuanto del rendimiento predictivo se explica por conectividad simple y cuanto por estructura de orden superior.
- Visualizacion y reduccion de dimensionalidad: proyectar el espacio de 128 dimensiones a 2D para inspeccionar la separacion entre especies y estudios, con la cautela de que ambas variables estan confundidas.
- Recuperacion de candidatos para experimentacion: priorizar pares de metabolitos no observados en el grafo para su validacion en laboratorio, reduciendo el espacio de busqueda.

## Benchmarks y rendimiento

Evaluacion: 200.000 aristas positivas muestreadas contra 200.000 pares no conectados verificados como ausentes del conjunto completo de aristas, puntuados por similitud coseno y con AUC calculada mediante la identidad de rangos de Mann-Whitney.

| Modelo | Aristas evaluadas | Puntuacion | AUC |
|---|---|---|---|
| Reentrenamiento 90/10 | 10% reservado, nunca visto | coseno | 0,9880 |
| Reentrenamiento 90/10 | Sus propias aristas de entrenamiento | coseno | 0,9892 |
| Reentrenamiento 90/10 | 10% reservado, nunca visto | producto de grados `d_u × d_v` | 0,9201 |
| Grafo completo (esta publicacion) | Sus propias aristas de entrenamiento | coseno | 0,9892 |
| Grafo completo (esta publicacion) | Sus propias aristas de entrenamiento | producto escalar | 0,9868 |

La fila relevante es la primera: la diferencia entre el rendimiento fuera de muestra (0,9880) y el de entrenamiento (0,9892) es de 0,001, lo que indica que el modelo aprende estructura del grafo en lugar de memorizar pares. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de modelos de lenguaje en la informacion disponible, y no procede aplicarlos a un modelo de embeddings de grafos.

Controles adicionales publicados sobre los embeddings:

| Comprobacion | Resultado |
|---|---|
| Recuperacion de vecindario, top-10 | 49,9% de vecinos reales frente al 1,6% esperado por azar (31,7×) |
| Recuperacion de vecindario, top-50 | 41,3% frente a lo esperado (26,2×) |
| Normas L2 (min / mediana / max) | 0,94 / 1,92 / 9,49; todos los valores finitos |
| Desviacion tipica por dimension | 0,15-0,28 (sin dimensiones muertas) |
| Coseno medio en 200.000 pares aleatorios | 0,0038 (descarta colapso) |
| Pureza por especie, top-10 | 90,7% global; >98% en las tres especies mayores |

## Requisitos de hardware

- Inferencia: no requiere GPU. El uso tipico es cargar el tensor de 18.494 × 128 float32 y hacer busquedas por indice; el tensor ocupa unos 9,5 MB y el checkpoint completo 9,7 MB.
- VRAM estimada: por debajo de 100 MB incluyendo el overhead de PyTorch, muy lejos de cualquier limite de GPU de consumo. Cabe en cualquier GPU consumer e incluso en CPU.
- Entrenamiento: unos 0,9 s por epoca en una sola H100, con 20 epocas en la configuracion publicada. No se documenta el rendimiento en otras GPU ni en CPU.
- Dependencia critica: `pyg-lib` >= 0.6.0 para el kernel de random walk, no disponible en PyPI; la version fijada en el repositorio del dataset es 0.9.0+pt214cu130 desde `data.pyg.org`.
- Restriccion de optimizador: `SparseAdam` exige `sparse=True` en el modelo; modificar uno sin el otro rompe el entrenamiento.
- Opciones de despliegue: carga directa con `torch.load(..., weights_only=False)` y servicio como tabla de consulta. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no documentados. Al tratarse de una consulta de embeddings precalculados, la latencia depende del indice de similitud que se implemente aguas abajo, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | AUC en prediccion de enlaces | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| edge-ML-node2vec (este) | Node2Vec transductivo | 2.367.232 (18.494 × 128) | Grafo fijo de 18.494 nodos y 2.709.209 aristas | 0,9880 (held-out) / 0,9892 (in-sample) | CC-BY-4.0 | Hugging Face |
| Baseline de grado | No parametrico (`d_u × d_v`) | 0 | Grados de los nodos | 0,9201 (held-out) | no aplica | Calculado en la evaluacion del propio autor |
| DeepWalk | Paseos aleatorios + skip-gram | no disponible | Grafo | no disponible | no disponible | Implementaciones publicas; no comparado en esta ficha |
| GCN / GraphSAGE | Red neuronal de paso de mensajes | no disponible | Grafo con caracteristicas de nodo | no disponible | no disponible | Implementaciones publicas; no comparado en esta ficha |

No se han publicado en la informacion disponible comparaciones numericas con DeepWalk, GCN, GraphSAGE ni con otros embeddings de grafos sobre este mismo grafo. La unica comparacion documentada por el autor es contra el baseline de producto de grados, incluida en la tabla anterior.

## Limitaciones y advertencias

- Solo topologia: los paseos son no ponderados, por lo que ni el atributo de arista (`OddsRatio_log2`, `ChiTestsPValue`) ni las caracteristicas de nodo `x` influyen en los embeddings. Incorporar la fuerza de asociacion exigiria un muestreador ponderado o un conjunto de aristas preumbralizado; usar las caracteristicas de nodo exigiria un modelo de paso de mensajes.
- Transductivo: Node2Vec aprende un vector por nodo en un grafo fijo. No hay forma documentada de obtener el embedding de un nodo que no estuviese presente en el momento del entrenamiento, lo que obliga a reentrenar si el grafo cambia.
- Especie y estudio estan entrelazados: las aristas se forman mayoritariamente dentro de un mismo estudio y un estudio suele corresponder a una sola especie, de modo que la separacion limpia por especie refleja en parte como se construyo el grafo y no necesariamente una senal biologica independiente. Conviene no interpretar la pureza del 90,7% como evidencia biologica directa.
- Nodos aislados en el experimento 90/10: 97 nodos de grado bajo quedaron aislados en el grafo de entrenamiento y sus vectores permanecen cerca de la inicializacion. Afecta solo al experimento reservado; el modelo publicado sobre el grafo completo no tiene nodos aislados.
- Grafo denso: el grado mediano es 90, por lo que una AUC elevada puede reflejar en parte la distribucion de grados. El propio autor incluye el baseline de 0,9201 precisamente para controlar este efecto.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, sin discusion ni replicaciones independientes conocidas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados. No incluye garantias ni cesion de patentes.
- Uso en produccion: cualquier cambio en el grafo de entrada invalida los embeddings y exige reentrenar el pipeline completo, incluida la instalacion de `pyg-lib` desde una fuente ajena a PyPI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kozo2/edge-ML-node2vec
- Repositorio del dataset complementario (grafo, propiedades de nodo y pipeline completo): mencionado en la model card, pero sin URL disponible.
- Indice de paquetes `pyg-lib` (version fijada 0.9.0+pt214cu130): https://data.pyg.org
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Los resultados devueltos corresponden a preguntas de Stack Overflow sobre Angular Material y no guardan relacion con el modelo.
- Paper de referencia de Node2Vec: no citado en la model card ni enlazado en la informacion proporcionada.
