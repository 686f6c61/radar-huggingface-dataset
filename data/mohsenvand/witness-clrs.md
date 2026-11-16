# mohsenvand/witness-clrs

## Resumen

Witness-clrs es una coleccion de 125 modelos pequenos (aproximadamente 150.000 parametros por configuracion) entrenados de forma independiente sobre las 30 tareas algorítmicas del benchmark CLRS-30 de DeepMind. El autor, mohsenvand, los publica como material de investigacion para estudiar una variante de atencion denominada "cold attention", en la que la capa de atencion suma evidencia sobre sus "testigos" y lee el resultado a una temperatura que tiende a cero, conservando solo dos magnitudes exactas: la puntuacion del mejor testigo y el numero de testigos que la alcanzan.

El interes del trabajo no esta en el rendimiento bruto sino en la generalizacion de longitud: los modelos se entrenan con entradas de como maximo 16 elementos y se evaluan con 64, sin pistas intermedias. La configuracion `census` alcanza una precision media del 97,04 % en las 30 tareas, ligeramente por encima del 96,64 % de FloydNet, lo que convierte este repositorio en una referencia util para quien investiga razonamiento algoritmico, generalizacion fuera de distribucion y arquitecturas con estado exacto.

Los pesos se distribuyen en formato safetensors float32 y el codigo de carga esta en JAX, no en PyTorch, lo que limita su uso directo en los stacks de inferencia habituales (vLLM, llama.cpp) y lo orienta a experimentacion y reproduccion cientifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de atencion con estado exacto ("cold attention"), con tests aprendidos sobre pares de items y agregacion por conteo de testigos; variantes `census` (general), `compare_first` y `pair_numbers` (cold) |
| Parametros totales | Aproximadamente 150.000 por modelo (una configuracion por tarea y semilla) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; el modelo opera sobre grafos de items (entrenamiento con hasta 16 items, evaluacion con 64) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), acompanados de `config.json` y `reference_predictions.npz` |

## Arquitectura y entrenamiento

Cada par ordenado de items (u, v) lleva un vector de 128 numeros. En cada iteracion el bloque formula dos preguntas aprendidas de tipo si/no sobre cada item intermedio k: un test sobre el par (u, k) y otro sobre (k, v). Un item que supera ambos es un testigo de (u, v). La mitad de los 128 canales cuenta exactamente sus testigos y transmite solo comparaciones entre dos recuentos ("mas", "igual"); la otra mitad conserva el mejor testigo. El bloque se itera y su respuesta se lee mediante una regla fija.

Existen tres configuraciones: `census` (los numeros de entrada entran por el embedding aprendido y la lectura se hace tras 8 iteraciones), `compare_first` (los numeros permanecen en registros exactos y al estado aprendido solo llegan comparaciones, con lectura cuando los bits dejan de cambiar, como maximo n iteraciones) y `pair_numbers` (igual que la anterior mas un numero por par construido por el bloque, con lectura tras como maximo 4n iteraciones).

Los datos provienen de la propia libreria dm-clrs 2.0.3: splits oficiales de test (64 items, 80 para los emparejadores de cadenas) y validacion (16), con pools de entrenamiento de tamanos 4 a 16 generados como lo hace el script oficial de la libreria. No se usan pistas (pasos intermedios). Las puntuaciones emplean el scorer de la libreria. Cada modelo incluye su configuracion de entrenamiento en `config.json`.

## Capacidades

- Resolucion de 30 algoritmos clasicos del benchmark CLRS-30: ordenacion (bubble, insertion, heapsort, quicksort, quickselect), busqueda (BFS, DFS, binary search), caminos minimos (Bellman-Ford, Dijkstra, DAG shortest paths, Floyd-Warshall), arboles de expansion (Kruskal, Prim), componentes (SCC, articulation points, bridges), geometria (Graham scan, Jarvis' march, segments intersect), cadenas (KMP, naive string match, LCS length) y otros (activity selector, matrix chain order, optimal BST, task scheduling, topological sort, minimum, find max subarray).
- Generalizacion de longitud: entrenado con hasta 16 items y evaluado con 64.
- Agregacion exacta de evidencia mediante conteo de testigos y comparaciones, sin aritmetica aproximada en las variantes cold.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; la iteracion del bloque es el mecanismo de computo.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion en generalizacion de longitud: usar los modelos como linea base reproducible para medir cuanto degrada un mecanismo de atencion al pasar de 16 a 64 items en tareas algorítmicas.
- Estudio de atencion con estado exacto: comparar `census`, `compare_first` y `pair_numbers` sobre las mismas tareas para aislar el efecto de mantener los numeros en registros exactos frente a introducirlos por embedding.
- Reproduccion de resultados academicos: los `reference_predictions.npz` permiten verificar predicciones sobre los splits oficiales sin reentrenar, util para replicas de papers.
- Docencia de algoritmos y redes neuronales: modelos de 150.000 parametros que se ejecutan en CPU y permiten visualizar como una red aprende BFS, Dijkstra o Kruskal paso a paso.
- Pruebas de infraestructura de evaluacion: servir como suite ligera para validar pipelines de scoring sobre CLRS-30 antes de escalar a modelos mayores.
- Demos interactivos en navegador: la pagina de demo asociada ejecuta estos modelos en el cliente, lo que facilita divulgacion y experimentacion sin GPU.
- Analisis de fallos por tarea: las tareas con precision baja (DFS con 72,97 %, optimal BST con 82,71 %, find max subarray con 87,86 %) sirven como casos de estudio de operaciones inherentemente secuenciales o dependientes de sumas no comparativas.

## Benchmarks y rendimiento

Precision (%) sobre el split oficial de test de CLRS-30 (64 items; 80 para los emparejadores de cadenas), media sobre semillas, leida con la regla registrada de cada bloque y puntuada con el scorer de la libreria.

| Tarea | FloydNet | Census block | Compare-first | Exact pair numbers |
|---|---:|---:|---:|---:|
| Activity Selector | 95,30 | 99,40 | 99,94 |  |
| Articulation Points | 100,00 | 100,00 |  |  |
| Bellman-Ford | 100,00 | 99,67 |  | 100,00 |
| BFS | 100,00 | 100,00 |  |  |
| Binary Search | 94,47 | 98,89 | 100,00 |  |
| Bridges | 100,00 | 100,00 |  |  |
| Bubble Sort | 100,00 | 100,00 | 100,00 |  |
| DAG Shortest Paths | 100,00 | 99,84 |  | 100,00 |
| DFS | 100,00 | 72,97 |  |  |
| Dijkstra | 97,67 | 99,63 |  | 100,00 |
| Find Max. Subarray | 86,20 | 87,86 |  |  |
| Floyd-Warshall | 96,20 | 99,71 |  |  |
| Graham Scan | 99,63 | 99,80 |  |  |
| Heapsort | 100,00 | 100,00 | 100,00 |  |
| Insertion Sort | 100,00 | 100,00 | 100,00 |  |
| Jarvis' March | 99,50 | 99,92 |  |  |
| KMP Matcher | 99,43 | 99,15 |  |  |
| LCS Length | 95,70 | 95,66 |  |  |
| Matrix Chain Order | 91,50 | 99,80 |  |  |
| Minimum | 100,00 | 100,00 | 100,00 |  |
| MST-Kruskal | 99,63 | 99,49 |  | 100,00 |
| MST-Prim | 99,67 | 98,93 |  |  |
| Naive String Match | 100,00 | 99,07 |  |  |
| Optimal BST | 82,87 | 82,71 |  |  |
| Quickselect | 80,33 | 99,77 | 16,19 (2) |  |
| Quicksort | 100,00 | 99,98 | 100,00 |  |
| SCC | 90,07 | 90,61 |  |  |
| Segments Intersect | 99,90 | 99,33 |  |  |
| Task Scheduling | 91,05 | 89,00 |  |  |
| Topological Sort | 100,00 | 99,99 |  |  |

| Metrica global | FloydNet | Census block |
|---|---:|---:|
| Precision media en 30 tareas (64 items) | 96,64 | 97,04 (semillas 97,14 / 97,07 / 96,91) |
| Tareas por encima / igual / por debajo de FloydNet | | 10 / 7 / 13 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por modelo en float32 (aproximadamente 150.000 parametros, unos 0,6 MB de pesos), mas el estado intermedio del grafo de items.
- GPU recomendadas: innecesarias; los modelos se entrenaron en una NVIDIA L4, pero la inferencia cabe en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, navegador mediante la demo).
- Opciones de despliegue: JAX con el paquete `witness_clrs` (funciones `load_hub`, `registered_read`, `score`); no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del tamano del grafo de entrada y del numero de iteraciones del bloque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision media CLRS-30 (64 items) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Witness-clrs (census) | ~150.000 | Grafos de items, entrenado hasta 16, evaluado a 64 | 97,04 | Apache 2.0 | Hugging Face (JAX, safetensors) |
| FloydNet | No disponible | No disponible | 96,64 | No disponible | Referencia en arXiv 2601.19094 |
| Compare-first (misma familia) | ~150.000 | Igual, con numeros en registros exactos | Solo cubre las tareas listadas en la tabla | Apache 2.0 | Hugging Face |
| Exact pair numbers (misma familia) | ~150.000 | Igual, mas un numero por par | Solo cubre las tareas listadas en la tabla | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Las tareas cuya respuesta depende de sumas de numeros que no son comparaciones (optimal BST, max subarray, LCS) y la busqueda en profundidad, inherentemente secuencial, se mantienen por debajo del 100 %.
- Las variantes `compare_first` y `pair_numbers` solo cubren las tareas indicadas en la tabla de resultados; no estan entrenadas para las 30.
- El modelo no es un modelo de lenguaje: no genera texto, no responde a prompts en lenguaje natural y no tiene capacidades multilingues.
- No hay datos publicados sobre sesgos; al operar sobre datos sinteticos de CLRS-30, el riesgo de sesgo social es irrelevante, pero si existe riesgo de sobreajuste a la distribucion del benchmark.
- El rendimiento fuera de CLRS-30 no esta evaluado; no se recomienda extrapolar a grafos reales de produccion sin validacion propia.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pipeline, de soporte en frameworks de inferencia estandar y de documentacion de despliegue limita su aplicabilidad industrial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es material de investigacion reciente, sin comunidad establecida ni garantias de mantenimiento.
- El codigo, el entrenamiento y la demo se anuncian en un repositorio companion cuyo enlace se indicaba como "anadido en el lanzamiento" y no aparece en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohsenvand/witness-clrs
- Referencia de FloydNet: arXiv 2601.19094 (segun la model card)
- Libreria de datos CLRS: dm-clrs 2.0.3 (benchmark CLRS-30 de DeepMind)
- Repositorio companion con codigo, entrenamiento y demo: no disponible en la informacion proporcionada
