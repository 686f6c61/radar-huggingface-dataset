# mohsenvand/cold-attention-clrs30

## Resumen

Cold attention es una familia de modelos de investigación desarrollada por el autor de Hugging Face `mohsenvand` para resolver tareas de razonamiento algorítmico sobre el benchmark CLRS-30 de DeepMind. No es un modelo de lenguaje generativo: es un bloque de atención de aproximadamente 150.000 parámetros que se entrena por separado en cada uno de los 30 algoritmos clásicos del benchmark (ordenación, búsqueda, caminos mínimos, árboles de expansión, matching de cadenas, geometría computacional, etc.). El repositorio publicado contiene 152 modelos entrenados (30 tareas, cinco variantes de bloque, tres semillas por configuración, y cinco semillas para la variante compare-first de quickselect).

La innovación central es una capa de atención "fría": en lugar de sumar evidencias con pesos continuos, el bloque cuenta testigos exactos (pares que satisfacen dos preguntas binarias aprendidas) y, a temperatura cero, conserva dos cantidades exactas —la puntuación del mejor testigo y el número de testigos que la alcanzan—, pasando al resto de la red únicamente sus comparaciones. Esto permite generalizar en longitud: los modelos se entrenan con entradas de hasta 16 ítems y se evalúan con 64, manteniendo una precisión media del 97,04 % en el bloque `census` y del 98,47 % en la mejor selección por tarea, frente al 96,64 % de FloydNet.

El modelo es relevante para investigadores interesados en generalización fuera de distribución, atención con cómputo exacto y arquitecturas híbridas neuro-simbólicas. Su tamaño reducido (0,2 GB de repositorio) y su naturaleza algorítmica lo alejan de los casos de uso de NLP, pero lo convierten en una referencia útil para estudiar cómo inducir sesgos algorítmicos en mecanismos de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de atención con testigos y temperatura cero (cold attention), con estado aprendido y registros exactos; variantes `census`, `cold`, `compare_first`, `pair_numbers`, `census_bilinear` |
| Parametros totales | Aproximadamente 150.000 por bloque y configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido de NLP; entrenamiento con hasta 16 ítems, evaluación con 64 ítems |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería JAX) |

## Arquitectura y entrenamiento

Cada par ordenado de ítems (u, v) porta un vector de 128 números. En cada iteración, el bloque formula dos preguntas binarias aprendidas sobre cada ítem intermedio k: un test sobre el par (u, k) y otro sobre (k, v). Un ítem que supera ambos es un testigo de (u, v). La mitad de los 128 canales cuentan testigos de forma exacta y transmiten solo comparaciones entre recuentos ("más", "igual"); la otra mitad conservan el mejor testigo. El bloque se itera y su respuesta se lee mediante una regla fija. En el modo *general*, los números de entrada entran a través del embedding aprendido; en el modo *frío*, permanecen en registros exactos y solo sus comparaciones entran al estado aprendido.

Las variantes se diferencian por cómo entran los números y cuándo se lee la respuesta: `census` (embedding aprendido, lectura tras 8 bucles), `cold` (sin números de entrada, solo bits, lectura cuando los bits dejan de cambiar, como máximo n bucles), `compare_first` (números en registros, solo comparaciones en el estado, hasta n bucles), `pair_numbers` (añade un número por par construido, como suma de camino o cuello de botella, hasta 4n bucles) y `census_bilinear` (como `census` pero con test bilineal de rango 2 sobre las patas, entrenado 320.000 pasos). El entrenamiento se realizó por separado en cada una de las 30 tareas de CLRS-30, con entradas de hasta 16 ítems y evaluación a 64. No se documentan detalles sobre el dataset de entrenamiento más allá del benchmark, ni sobre uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Razonamiento algorítmico exacto sobre 30 algoritmos clásicos: BFS, Bellman-Ford, Dijkstra, Floyd-Warshall, Prim, Kruskal, topological sort, DFS, SCC, articulation points, bridges, insertion sort, bubble sort, heapsort, quicksort, minimum, quickselect, binary search, maximum subarray, matrix chain order, optimal BST, LCS, activity selector, task scheduling, naive string match, KMP, segments intersect, Graham scan y Jarvis march.
- Generalización en longitud: entrenado con hasta 16 ítems y evaluado con 64.
- Cómputo de comparaciones exactas mediante registros, sin pérdida de precisión numérica en el estado.
- Variantes con construcción de números por par (sumas de camino, cuellos de botella, saltos) para algoritmos que requieren agregación numérica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en generalización en longitud: el modelo permite estudiar cómo un mecanismo de atención mantiene precisión al pasar de 16 a 64 ítems, un problema abierto en redes neuronales algorítmicas.
- Estudio de atención con cómputo exacto: la separación entre estado aprendido y registros exactos sirve para analizar qué información debe permanecer en precisión finita y cuál puede aprenderse.
- Benchmarking de arquitecturas neuro-simbólicas: útil como línea base reproducible frente a FloydNet y otras redes para CLRS-30, con 152 modelos y tres semillas por configuración.
- Educación y divulgación: el bloque de 150.000 parámetros y la demo en navegador permiten ilustrar cómo se induce un sesgo algorítmico en una capa de atención.
- Análisis de simetrías por tarea: la selección de bloque por tarea (por ejemplo, `compare_first` para ordenación y búsqueda, `pair_numbers` para caminos mínimos) permite estudiar qué estructura algebraica requiere cada algoritmo.
- Reproducción de experimentos: los pesos publicados en safetensors y la librería JAX facilitan reentrenar o extender el estudio a nuevas tareas o longitudes.
- Prototipado de planificadores simbólicos: las variantes con registros exactos pueden integrarse como componente de razonamiento en sistemas híbridos que requieran comparaciones exactas.

## Benchmarks y rendimiento

Resultados sobre CLRS-30 con 64 ítems (media de precisión, semillas entre paréntesis):

| Tarea | FloydNet | Mejor bloque | Media test (semillas) |
|---|---:|---|---:|
| BFS | 100,00 | `census` | 100,00 (3) |
| Bellman-Ford | 100,00 | `pair_numbers` | 100,00 (3) |
| Dijkstra | 97,67 | `pair_numbers` | 100,00 (3) |
| DAG Shortest Paths | 100,00 | `pair_numbers` | 100,00 (3) |
| Floyd-Warshall | 96,20 | `pair_numbers` | 100,00 (3) |
| MST-Prim | 99,67 | `pair_numbers` | 99,98 (3) |
| Topological Sort | 100,00 | `cold` | 100,00 (3) |
| DFS | 100,00 | `compare_first` | 100,00 (3) |
| SCC | 90,07 | `census` | 90,61 (3) |
| Articulation Points | 100,00 | `census` | 100,00 (3) |
| Bridges | 100,00 | `census` | 100,00 (3) |
| MST-Kruskal | 99,63 | `pair_numbers` | 100,00 (3) |
| Insertion Sort | 100,00 | `compare_first` | 100,00 (3) |
| Bubble Sort | 100,00 | `compare_first` | 100,00 (3) |
| Heapsort | 100,00 | `compare_first` | 100,00 (3) |
| Quicksort | 100,00 | `compare_first` | 100,00 (3) |
| Minimum | 100,00 | `compare_first` | 100,00 (3) |
| Quickselect | 80,33 | `compare_first` | 100,00 (5) |
| Binary Search | 94,47 | `compare_first` | 100,00 (3) |
| Find Max. Subarray | 86,20 | `census` | 87,86 (3) |
| Matrix Chain Order | 91,50 | `census` | 99,80 (3) |
| Optimal BST | 82,87 | `census` | 82,71 (3) |
| LCS Length | 95,70 | `census` | 95,66 (3) |
| Activity Selector | 95,30 | `compare_first` | 99,94 (3) |
| Task Scheduling | 91,05 | `compare_first` | 99,86 (3) |
| Naive String Match | 100,00 | `census` | 99,07 (3) |
| KMP Matcher | 99,43 | `census` | 99,15 (3) |
| Segments Intersect | 99,90 | `census_bilinear` | 99,79 (3) |
| Graham Scan | 99,63 | `census` | 99,80 (3) |
| Jarvis' March | 99,50 | `census` | 99,92 (3) |

Comparativa agregada:

| Métrica | FloydNet | Bloque `census` (una configuración, 3 semillas) |
|---|---:|---:|
| Media de precisión sobre 30 tareas, 64 ítems | 96,64 | 97,04 (semillas 97,14, 97,07, 96,91) |
| Tareas por encima / igual / por debajo de FloydNet | — | 10 / 7 / 13 |

La media de 98,47 corresponde a la mejor selección de bloque por tarea y es optimista; el bloque `census` único promedia 97,04. El modelo no reporta resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por bloque (aproximadamente 150.000 parámetros en precisión de 32 bits, más el estado de 128 canales por par de ítems); el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con soporte JAX, incluidas RTX 4090, A100 y H100; el modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con más de 1 GB de memoria; también puede ejecutarse en CPU y en el navegador según la model card.
- Opciones de despliegue: JAX (librería nativa); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / longitud | Precisión media CLRS-30 (64 ítems) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cold attention (`census`) | ~150.000 | Entrenamiento 16 ítems, test 64 | 97,04 | Apache 2.0 | Hugging Face |
| Cold attention (mejor bloque por tarea) | ~150.000 | Entrenamiento 16 ítems, test 64 | 98,47 (optimista) | Apache 2.0 | Hugging Face |
| FloydNet | No disponible | No disponible | 96,64 | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta conversación, tool calling ni agentes.
- Especialización por tarea: cada modelo se entrena para un único algoritmo de CLRS-30; no hay un modelo único que resuelva las 30 tareas.
- Dependencia del tamaño de entrada: aunque generaliza de 16 a 64 ítems, no se documenta comportamiento con longitudes mayores.
- Resultados optimistas en la media de 98,47: la selección del mejor bloque por tarea sobreestima el rendimiento respecto a una configuración única.
- Tareas con rendimiento bajo: `optimal BST` (82,71), `find max. subarray` (87,86) y `SCC` (90,61) quedan por debajo del 95 %.
- La variante `census` falla en DFS (72,97), lo que muestra que la elección de bloque es crítica según la simetría de la tarea.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido de NLP; el riesgo se limita a errores algorítmicos en las tareas evaluadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción de NLP.
- La model card indica que el código, el entrenamiento y la demo se publicarán en un repositorio complementario "en el momento del lanzamiento"; no se proporciona el enlace.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-clrs30
- Repositorio complementario de código, entrenamiento y demo: no disponible (enlace pendiente según la model card)
- Benchmark CLRS-30 de DeepMind: no disponible en la información proporcionada
- Paper de cold attention: no disponible en la información proporcionada
