# mohsenvand/cold-attention-clrs30-shared

## Resumen

Cold attention CLRS-30 shared es un modelo de razonamiento algorítmico desarrollado por el autor de Hugging Face `mohsenvand`. Su aportación central es que un único bloque de atención compartido, de solo 146.424 parámetros, resuelve las 30 tareas del benchmark CLRS-30 de DeepMind, en lugar de entrenar un modelo independiente por tarea. Cada tarea conserva únicamente su propio codificador de entrada y sus cabezas de lectura, con entre 6.016 y 46.688 parámetros adicionales.

El modelo se apoya en un mecanismo denominado "cold attention", en el que cada par ordenado de elementos transporta un vector de 128 números y el bloque formula dos preguntas aprendidas de tipo sí/no sobre cada elemento intermedio, identificando testigos (witnesses) que verifican la relación entre pares. A temperatura cero, la suma sobre testigos conserva dos cantidades exactas: el mejor testigo y su recuento. La mitad de los canales cuenta testigos de forma exacta y transmite solo qué recuento es mayor, o si son iguales; la otra mitad conserva el mejor testigo.

Es relevante porque demuestra generalización de longitud y multitarea con un coste paramétrico mínimo, superando en promedio al modelo por tarea FloydNet en 17 de las 30 tareas del benchmark. Está implementado en JAX y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cold attention (bloque de atención compartido con preguntas testigo aprendidas); no es un transformer convencional |
| Parámetros totales | 146.424 (bloque compartido) + 6.016 a 46.688 por tarea |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con entradas de hasta 16 elementos (20 para los emparejadores de cadenas) y evaluado a 64 |
| Tipos de cuantización | no disponible; pesos en float32 |
| Idiomas soportados | no disponible (modelo algorítmico, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), configuración en config.json, predicciones de referencia en reference_predictions.npz |

## Arquitectura y entrenamiento

La arquitectura no es un transformer estándar ni un modelo de lenguaje. Cada par ordenado de elementos (u, v) porta un vector de 128 dimensiones. En cada iteración, el bloque lanza dos preguntas binarias aprendidas sobre cada elemento intermedio k, una relativa al par (u, k) y otra al par (k, v); un elemento que supera ambas es un testigo de (u, v). A temperatura cero, la suma sobre testigos mantiene dos cantidades exactas: el mejor testigo y el número de testigos. La mitad de los canales calcula recuentos exactos y transmite únicamente la comparación entre dos recuentos (mayor, menor o igual); la otra mitad preserva el mejor testigo. Esta variante corresponde al denominado "census block", en el que los números de entrada entran a través del embedding aprendido.

El entrenamiento se realizó con 160.000 actualizaciones. En cada actualización se procesa un lote de 32 entradas de cada una de las 30 tareas y se suman las 30 pérdidas, de modo que el bloque compartido y los parámetros propios de cada tarea se entrenan conjuntamente. Los bucles se muestrean entre 4 y 8 por actualización. Se usó AdamW con tasa de aprendizaje 0,001, 2.000 pasos de calentamiento, decaimiento coseno hasta el 1 %, weight decay 0,01 y recorte de gradientes a norma 1. Los datos de entrenamiento son 80.000 entradas por tamaño, generadas por la propia librería dm-clrs 2.0.3 en tamaños 4, 7, 11, 13 y 16 (20 para los emparejadores de cadenas), sin pistas (hints) intermedias. Se entrenaron tres semillas (0, 1 y 2). La lectura se realiza tras 8 bucles.

## Capacidades

- Ejecución de las 30 tareas algorítmicas del benchmark CLRS-30: BFS, Bellman-Ford, Dijkstra, DAG Shortest Paths, Floyd-Warshall, MST-Prim, Topological Sort, DFS, SCC, Articulation Points, Bridges, MST-Kruskal, Insertion Sort, Bubble Sort, Heapsort, Quicksort, Minimum, Quickselect, Binary Search, Find Max. Subarray, Matrix Chain Order, Optimal BST, LCS Length, Activity Selector, Task Scheduling, Naive String Match, KMP Matcher, Segments Intersect, Graham Scan y Jarvis' March.
- Razonamiento algorítmico multi-paso mediante iteraciones recurrentes del bloque compartido (lectura tras 8 bucles).
- Generalización de longitud: entrenado con entradas de hasta 16 elementos y evaluado con 64 (80 en los emparejadores de cadenas).
- Multitarea con un único bloque compartido más codificadores y cabezas específicos por tarea.
- Salidas por tarea definidas en config.json, con predicciones de referencia por bucle y por split.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Investigación en razonamiento algorítmico: sirve como referencia reproducible para estudiar generalización de longitud en CLRS-30, ya que incluye predicciones de referencia por bucle y split que permiten comparar implementaciones.
- Estudio de arquitecturas de atención alternativas: el mecanismo de cold attention con preguntas testigo puede analizarse como sustituto de la atención por producto escalar en tareas de grafos.
- Evaluación de eficiencia paramétrica: con 146.424 parámetros en el bloque compartido, es un caso de estudio de multitarea con coste mínimo frente a modelos por tarea de 20 a 215 millones de parámetros.
- Reproducción de experimentos: el paquete incluye el cargador `load_shared_hub`, la función `registered_read` y el scorer, lo que permite reproducir exactamente los resultados en una NVIDIA B200 con JAX 0.8.0.
- Docencia sobre algoritmos de grafos: las predicciones por tarea y por bucle permiten ilustrar el comportamiento de un modelo sobre BFS, Dijkstra o Floyd-Warshall.
- Desarrollo de modelos GNN para CLRS-30: puede usarse como línea base compartida para comparar nuevas variantes de codificadores o cabezas de lectura.
- Validación de portabilidad numérica: los desajustes documentados entre B200 y L4 (4 de 2.739.072 entradas de lectura) permiten estudiar la sensibilidad al orden de suma en GPU.

## Benchmarks y rendimiento

Precisión de test (%) en el split oficial de test de CLRS-30 (64 elementos; 80 para los emparejadores de cadenas), leída tras 8 bucles y puntuada con el scorer de la librería.

| Métrica | FloydNet (un modelo por tarea) | Bloque compartido (media de 3 semillas) |
|---|---:|---:|
| Media sobre las 30 tareas | 96,64 | 96,87 |
| Tareas iguales o superiores a FloydNet | — | 17 de 30 |

Resultados por tarea del bloque compartido (media de semillas 0, 1 y 2) frente a FloydNet:

| Tarea | FloydNet | Semilla 0 | Semilla 1 | Semilla 2 | Media |
|---|---:|---:|---:|---:|---:|
| BFS | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Bellman-Ford | 100,00 | 99,51 | 99,41 | 99,46 | 99,46 |
| Dijkstra | 97,67 | 99,41 | 99,46 | 99,37 | 99,41 |
| DAG Shortest Paths | 100,00 | 99,51 | 97,75 | 99,56 | 98,94 |
| Floyd-Warshall | 96,20 | 99,12 | 99,26 | 99,11 | 99,17 |
| MST-Prim | 99,67 | 96,73 | 97,31 | 97,07 | 97,04 |
| Topological Sort | 100,00 | 99,61 | 99,85 | 99,76 | 99,74 |
| DFS | 100,00 | 76,46 | 69,29 | 73,34 | 73,03 |
| SCC | 90,07 | 85,64 | 90,92 | 87,60 | 88,05 |
| Articulation Points | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Bridges | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| MST-Kruskal | 99,63 | 99,19 | 99,27 | 99,41 | 99,29 |
| Insertion Sort | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Bubble Sort | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Heapsort | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Quicksort | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Minimum | 100,00 | 100,00 | 100,00 | 100,00 | 100,00 |
| Quickselect | 80,33 | 99,90 | 99,76 | 99,95 | 99,87 |
| Binary Search | 94,47 | 99,27 | 99,07 | 99,37 | 99,24 |
| Find Max. Subarray | 86,20 | 89,21 | 86,91 | 87,26 | 87,79 |
| Matrix Chain Order | 91,50 | 99,66 | 99,58 | 99,65 | 99,63 |
| Optimal BST | 82,87 | 81,59 | 83,70 | 83,13 | 82,80 |
| LCS Length | 95,70 | 93,03 | 93,28 | 93,95 | 93,42 |
| Activity Selector | 95,30 | 99,46 | 100,00 | 99,64 | 99,70 |
| Task Scheduling | 91,05 | 92,57 | 90,95 | 92,03 | 91,85 |
| Naive String Match | 100,00 | 99,95 | 98,00 | 99,95 | 99,30 |
| KMP Matcher | 99,43 | 99,80 | 98,49 | 99,95 | 99,41 |
| Segments Intersect | 99,90 | 99,75 | 99,61 | 99,71 | 99,69 |
| Graham Scan | 99,63 | 99,76 | 99,76 | 99,28 | 99,60 |
| Jarvis' March | 99,50 | 99,64 | 99,64 | 99,40 | 99,56 |

FloydNet (arXiv 2601.19094, tabla 9) entrena un modelo por tarea de entre 20 y 215 millones de parámetros y reporta el mejor resultado entre ejecuciones con y sin pistas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. El bloque compartido tiene 146.424 parámetros en float32 (aproximadamente 0,6 MB), y los parámetros por tarea suman entre 6.016 y 46.688 adicionales (decenas de KB). El coste dominante es el estado intermedio de los pares de elementos, no los pesos.
- GPU recomendadas: el autor verificó la reproducibilidad en NVIDIA B200 con JAX 0.8.0; también se probó en NVIDIA L4, con pequeñas discrepancias numéricas.
- Cabe en cualquier GPU consumer: el tamaño de pesos es inferior a 1 MB, por lo que cualquier GPU con soporte JAX/CUDA es suficiente; la limitación real es el tamaño de lote y las dimensiones de entrada.
- Opciones de despliegue: JAX (librería nativa del modelo) con el paquete `witness_clrs` y el cargador `load_shared_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita. Se documenta que en NVIDIA B200 las predicciones de referencia se reproducen exactamente en las 90 combinaciones tarea-semilla y en todos los bucles; en NVIDIA L4 difieren 4 de 2.739.072 entradas de lectura (Optimal BST, semilla 1) y 139 a lo largo de los bucles 1 a 16, por el orden de suma en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tamaños | Rendimiento CLRS-30 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cold attention CLRS-30 shared | 146.424 (bloque) + 6.016 a 46.688 por tarea | Entrenado hasta 16 (20 cadenas), evaluado a 64 | 96,87 de media en 30 tareas | Apache 2.0 | Hugging Face (JAX, safetensors) |
| FloydNet | 20 a 215 millones por tarea | No disponible | 96,64 de media en 30 tareas | No disponible | Referencia en arXiv 2601.19094 |
| Transformers / GNN convencionales para CLRS-30 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Leído tras 8 bucles, el bloque solo alcanza patrones de aproximadamente 2^8 pasos; no generaliza a secuencias arbitrariamente largas.
- Los números en formato soft deben poder distinguirse; la comparación exacta depende de la representación de entrada.
- Rendimiento desigual por tarea: DFS cae a 73,03 de media (frente a 100 de FloydNet) y SCC a 88,05; Optimal BST (82,80) y Find Max. Subarray (87,79) también quedan por debajo de la referencia.
- No es un modelo de lenguaje: no procesa texto libre, no soporta tool calling, agentes ni capacidades multilingües; los idiomas figuran como no disponibles.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido de modelos generativos; el riesgo se limita a errores algorítmicos en las tareas evaluadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la librería dm-clrs 2.0.3 para la generación de datos y de `witness_clrs` para la carga y evaluación.
- Reproducibilidad sensible al hardware: pequeñas diferencias numéricas entre GPUs (B200 frente a L4) afectan a decisiones en empates cercanos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el código companion se anuncia como "enlace añadido en el lanzamiento", por lo que la disponibilidad del paquete `witness_clrs` debe verificarse.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-clrs30-shared
- Referencia de FloydNet: arXiv 2601.19094 (tabla 9)
- Librería de generación de datos: dm-clrs 2.0.3
- Repositorio companion con el bloque, el cargador y los modelos por tarea: enlace no disponible (anunciado para el lanzamiento)
