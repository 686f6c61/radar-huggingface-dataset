# Bauxitiego/neural-mis

## Resumen

Neural Maximum Independent Set es un modelo de red neuronal de grafos (GNN) desarrollado por Bauxitiego para resolver el problema del conjunto independiente máximo (MIS) en grafos. Se trata de una red convolucional de grafos (GCN) de 4 capas con conexiones residuales y normalización por capas, con una dimensión oculta de 32. El modelo se entrena exclusivamente con grafos sintéticos Erdos-Renyi generados de forma gratuita y se evalúa contra el benchmark QOBLIB, un conjunto de instancias de MIS creado por IBM Quantum, ZIB y Purdue para evaluar métodos de optimización cuántica. La propuesta demuestra que una GNN clásica puede competir con heurísticas greedy en este benchmark, superándola en 23 de 50 instancias, empatando en 22 y perdiendo en 5.

El modelo no introduce una metodología nueva, sino que aplica técnicas establecidas de heurísticas de construcción guiadas por GNN (como el trabajo de Li, Chen y Koltun de 2018) a un benchmark específico y relevante para la optimización cuántica. Su interés radica en la reproducibilidad y la honestidad de la evaluación, incluyendo los fallos documentados en ciertas familias de grafos. El checkpoint se distribuye como state_dict de PyTorch, por lo que requiere la arquitectura definida en el repositorio asociado para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN de 4 capas (GCNConv) con conexiones residuales y LayerNorm, dimensión oculta 32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de grafos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (código y pesos) |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional de grafos (GCN) con 4 capas GCNConv, cada una seguida de normalización por capas (LayerNorm) y conexiones residuales. La dimensión oculta es 32, lo que resulta en un modelo muy ligero. El entrenamiento se realizó sobre 500 grafos sintéticos Erdos-Renyi con tamaños entre 20 y 2000 nodos y densidades entre 0.05 y 0.5. Cada grafo se etiquetó mediante una heurística de greedy aleatorio más búsqueda local con 20 reinicios por grafo. Los datos de entrenamiento no incluyen las instancias de evaluación de QOBLIB, lo que garantiza una evaluación limpia. El modelo se usa con un esquema de decodificación iterativa: tras cada selección de nodo, se vuelve a ejecutar la inferencia sobre el grafo residual. El decode estático de una sola pasada falla de forma documentada, por lo que el iterativo es el que produce los resultados reportados.

## Capacidades

- Resolución del problema del conjunto independiente máximo (MIS) en grafos no dirigidos.
- Heurística de construcción guiada por GNN: selecciona nodos de forma iterativa basándose en las predicciones de la red.
- Funciona en grafos de hasta 2000 nodos (según el rango de entrenamiento) y densidades variables.
- Evaluado en el benchmark QOBLIB, que incluye instancias con solución óptima probada (38 de 50 instancias).
- No tiene capacidades de generación de texto, razonamiento lingüístico, visión ni tool calling; es un modelo especializado en optimización combinatoria.

## Casos de uso

- Optimización de asignación de recursos en redes de telecomunicaciones: el modelo puede seleccionar un conjunto de nodos no adyacentes para asignar frecuencias o canales sin interferencias, aprovechando su capacidad para manejar grafos de tamaño moderado.
- Planificación de horarios con conflictos: en problemas de scheduling donde las tareas compiten por recursos, el MIS identifica un conjunto máximo de tareas compatibles, útil como heurística inicial en sistemas de planificación.
- Selección de nodos en redes sociales para campañas de influencia: aunque no es el uso canónico, el modelo puede servir para encontrar conjuntos independientes en grafos de interacción, útil en estudios de difusión.
- Componente en pipelines de optimización combinatoria: puede integrarse como heurística de arranque o de refinamiento en algoritmos más complejos (búsqueda local, recocido simulado) para problemas de empaquetado o asignación.
- Investigación académica en optimización cuántica: sirve como baseline clásico para comparar el rendimiento de algoritmos cuánticos en el benchmark QOBLIB, dado que el modelo se evalúa contra las mismas instancias.
- Prototipado rápido de soluciones MIS en entornos de investigación: al ser un modelo pequeño y de código abierto, permite experimentar con GNN aplicadas a problemas de grafos sin necesidad de grandes recursos computacionales.

## Benchmarks y rendimiento

El modelo se evaluó en el benchmark QOBLIB de Maximum Independent Set, que contiene 50 instancias. Los resultados agregados son:

| Resultado | Número de instancias |
|---|---|
| Gana frente a greedy | 23 |
| Empata con greedy | 22 |
| Pierde frente a greedy | 5 |

El rendimiento no es uniforme: gana en las familias `frb`/BHOSLIB (5 victorias, 0 derrotas) y en la familia `C` (3 de 3 victorias), pero falla gravemente en la familia `keller`, con una caída de 0.29 a 0.36 en la calidad de la solución respecto a greedy. No se han publicado resultados comparativos con otros modelos de aprendizaje automático en la información disponible.

## Requisitos de hardware

- Al ser un modelo muy pequeño (4 capas, dimensión oculta 32), puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU consumer (por ejemplo, RTX 3060 o superior) con requisitos de VRAM mínimos; se estima menos de 1 GB, aunque no se especifica oficialmente.
- No se requieren GPUs de datacenter (A100, H100) para inferencia.
- El despliegue es sencillo: se carga el state_dict con PyTorch y se usa la función `iterative_decode` del repositorio. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.
- La latencia es despreciable en grafos de hasta 2000 nodos, aunque depende del número de iteraciones del decode.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de GNN específicamente entrenados para MIS en el benchmark QOBLIB. La model card no menciona comparaciones con alternativas como el trabajo de Li, Chen y Koltun (2018) u otros enfoques de aprendizaje profundo para optimización combinatoria. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo falla de forma consistente en la familia `keller` de QOBLIB, con una degradación significativa de la calidad de la solución respecto a greedy, a pesar de dos intentos documentados de corrección.
- El decode estático (una sola pasada) produce resultados malos; solo el decode iterativo funciona correctamente, lo que añade complejidad al uso.
- El checkpoint es solo state_dict, no un módulo serializado completo; se requiere la arquitectura definida en el repositorio (`src/model.py`) para cargarlo.
- El entrenamiento se realizó únicamente con grafos Erdos-Renyi sintéticos, por lo que la generalización a otros tipos de grafos (por ejemplo, grafos de escala libre o con estructura comunitaria) no está garantizada.
- No es un método novedoso; se basa en técnicas establecidas de GNN para heurísticas de construcción, por lo que su contribución principal es la evaluación reproducible en un benchmark relevante.
- La licencia Apache 2.0 permite uso comercial, pero los datos de QOBLIB utilizados para la evaluación están bajo CC BY 4.0, lo que requiere atribución en cualquier uso derivado.

## Enlaces

- [HuggingFace: Bauxitiego/neural-mis](https://huggingface.co/Bauxitiego/neural-mis)
- [Repositorio GitHub: Bauxitiego/neural-mis](https://github.com/Bauxitiego/neural-mis)
- [Benchmark QOBLIB (GitHub)](https://github.com/ZIB-AOPT/QOBLIB)
