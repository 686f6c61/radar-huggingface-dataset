# mohsenvand/cold-attention-clrs30-variants

## Resumen

`cold-attention-clrs30-variants` es una coleccion de bloques de atencion entrenados por el autor `mohsenvand` como material complementario de un articulo sobre "cold attention" evaluado en CLRS-30, el benchmark de razonamiento algoritmico de DeepMind. No es un modelo de lenguaje generativo, sino un conjunto de redes neuronales especializadas en tareas algoritmicas concretas (componentes fuertemente conexas, ordenacion topologica, camino mas corto, etc.) que el articulo reporta junto a sus resultados principales como controles, variantes de entrenamiento, variantes de lectura y fallos registrados.

El interes de esta publicacion es metodologico: separa deliberadamente estas variantes del repositorio principal `cold-attention-clrs30` para que las tablas del articulo reflejen unicamente los modelos elegidos. Todos los modelos se entrenan con entradas de como maximo 16 items y se evaluan en el split oficial de test de 64 items, lo que convierte a esta coleccion en una referencia util para estudiar generalizacion en longitud (length generalization) en tareas algoritmicas.

La implementacion esta en JAX y los pesos se distribuyen en formato `safetensors` en float32. El repositorio tiene un tamano practicamente nulo (0.0 GB reportados), lo que sugiere pesos muy pequenos, coherentes con bloques de atencion especializados y no con un transformer de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloques de atencion ("cold attention") con soporte de graph neural network; implementacion en JAX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas de hasta 16 items en entrenamiento; test con 64 items) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre grafos y estructuras algoritmicas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32) + config.json + reference_predictions.npz |

## Arquitectura y entrenamiento

La coleccion se organiza en variantes (`positions_compared_only/`, `scc_multi_entry_pool/`, `random_positions/`, `deadline_units/`, `open_start/`, `first_registered_seeds/`), cada una con subdirectorios por bloque (`compare_first`, `census`, `pair_numbers`), tarea y semilla. Cada bloque es un modulo de atencion que opera sobre la representacion de un grafo o estructura algoritmica, con una regla de lectura ("read") especifica: en la mayoria de variantes se lee en el primer bucle cuyos bits igualan los del bucle anterior, con un tope de n bucles para n items; en `deadline_units/` se lee tras 8 bucles; en `open_start/` se lee en el primer bucle en que coinciden bits y numeros construidos, con tope de 4n bucles.

El entrenamiento se realizo sobre entradas de hasta 16 items y la evaluacion sobre el split oficial de test de 64 items, lo que mide directamente la capacidad de generalizacion en longitud. Algunas variantes modifican el regimen de entrenamiento respecto al release principal: `random_positions/` aleatoriza las posiciones de los nodos (frente a las posiciones fijas de la libreria), `scc_multi_entry_pool/` usa un pool de entrenamiento enriquecido con componentes fuertemente conexas con multiples entradas (no el pool de la libreria), y `deadline_units/` divide los deadlines por n para expresarlos en las mismas unidades que las posiciones. No se especifica en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si se aplico RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Razonamiento algoritmico sobre tareas de CLRS-30: SCC (componentes fuertemente conexas), ordenacion topologica, task scheduling, Bellman-Ford, DAG shortest paths, Dijkstra, MST-Kruskal y quickselect.
- Generalizacion en longitud: entrenamiento con hasta 16 items y evaluacion con 64 items.
- Procesamiento de estructuras de grafo mediante bloques de atencion con soporte de graph neural network.
- Multiples regimenes de lectura configurables por variante (lectura por punto fijo de bits, lectura tras 8 bucles, lectura con tope 4n).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un modelo de investigacion especifico de tarea.
- Capacidades multilingues: no aplica.

## Casos de uso

- Investigacion en generalizacion en longitud: usar las variantes para reproducir los controles del articulo y comparar el comportamiento a 64 items frente al entrenamiento a 16.
- Estudio de fallos de aprendizaje: la variante `first_registered_seeds/` sobre quickselect (test 32.37 y 0.00 con validacion 100.00) es un caso documentado de sobreajuste a la longitud de entrenamiento util para analizar diagnosticos.
- Analisis de sensibilidad al regimen de posiciones: `random_positions/` permite evaluar cuanto afecta aleatorizar posiciones en task scheduling (test en torno a 98.2-98.5).
- Evaluacion de pools de entrenamiento sesgados: `scc_multi_entry_pool/` sirve para medir el impacto de enriquecer el pool con componentes multi-entrada en SCC (test 97.46-99.17).
- Verificacion de invariancia bajo recodificacion: los bloques `open_start/` estan entre los 41 modelos cold que el articulo comprueba para invariancia bajo recodificacion de los numeros de entrada.
- Reproducibilidad de resultados: cada carpeta incluye `reference_predictions.npz` con predicciones sobre el test oficial, lo que permite validar una reimplementacion sin reentrenar.
- Docencia en razonamiento algoritmico: usar los bloques como ejemplos de como una atencion especializada resuelve tareas de grafos con reglas de lectura explicitas.

## Benchmarks y rendimiento

Resultados reportados en la model card (test sobre 64 items, media por variante):

| Variante | Tarea | Bloque | Semillas | Test (media) |
|---|---|---|---:|---:|
| `positions_compared_only/` | SCC | compare_first | 3 | 90.02 |
| `positions_compared_only/` | Topological Sort | compare_first | 3 | 100.00 |
| `scc_multi_entry_pool/` | SCC | compare_first | 3 | 98.21 |
| `random_positions/` | Task Scheduling | compare_first | 3 | 98.35 |
| `deadline_units/` | Task Scheduling | census | 3 | 99.34 |
| `open_start/` | Bellman-Ford | pair_numbers | 1 | 100.00 |
| `open_start/` | DAG Shortest Paths | pair_numbers | 1 | 100.00 |
| `open_start/` | Dijkstra | pair_numbers | 1 | 100.00 |
| `open_start/` | MST-Kruskal | pair_numbers | 1 | 100.00 |
| `first_registered_seeds/` | Quickselect | compare_first | 2 | 16.19 |

Detalle por semilla:

| Variante / tarea | Seed | Test | Val |
|---|---:|---:|---:|
| `positions_compared_only/` SCC | 0 | 88.53 | 100.00 |
| `positions_compared_only/` SCC | 1 | 91.31 | 100.00 |
| `positions_compared_only/` SCC | 2 | 90.23 | 100.00 |
| `positions_compared_only/` Topological Sort | 0 | 100.00 | 100.00 |
| `positions_compared_only/` Topological Sort | 1 | 100.00 | 100.00 |
| `positions_compared_only/` Topological Sort | 2 | 100.00 | 100.00 |
| `scc_multi_entry_pool/` SCC | 0 | 98.00 | 100.00 |
| `scc_multi_entry_pool/` SCC | 1 | 97.46 | 100.00 |
| `scc_multi_entry_pool/` SCC | 2 | 99.17 | 100.00 |
| `random_positions/` Task Scheduling | 0 | 98.49 | 98.05 |
| `random_positions/` Task Scheduling | 1 | 98.37 | 97.90 |
| `random_positions/` Task Scheduling | 2 | 98.18 | 97.59 |
| `deadline_units/` Task Scheduling | 0 | 99.15 | 100.00 |
| `deadline_units/` Task Scheduling | 1 | 99.46 | 100.00 |
| `deadline_units/` Task Scheduling | 2 | 99.42 | 100.00 |
| `open_start/` Bellman-Ford | 0 | 100.00 | 100.00 |
| `open_start/` DAG Shortest Paths | 0 | 100.00 | 100.00 |
| `open_start/` Dijkstra | 0 | 100.00 | 100.00 |
| `open_start/` MST-Kruskal | 0 | 100.00 | 100.00 |
| `first_registered_seeds/` Quickselect | 1 | 32.37 | 100.00 |
| `first_registered_seeds/` Quickselect | 2 | 0.00 | 100.00 |

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el tamano del repositorio reportado es 0.0 GB y los pesos estan en float32, lo que sugiere bloques pequenos que caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con soporte JAX (incluidas RTX 4090 y superiores) deberia ser suficiente. No se dispone de datos de A100/H100.
- Cabe en GPU consumer: probablemente si, dado el tamano nulo reportado; no confirmado en la informacion disponible.
- Opciones de despliegue: al ser JAX, el despliegue natural es mediante el propio runtime de JAX; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cold-attention-clrs30-variants` (este) | no disponible | entradas de hasta 16 items (train) / 64 (test) | CLRS-30, variantes | apache-2.0 | Hugging Face |
| `cold-attention-clrs30` (repositorio companero) | no disponible | mismo regimen | CLRS-30, release principal | no disponible en la informacion | Hugging Face |
| `cold-attention-scc-committee` | no disponible | mismo regimen | SCC con entrenamiento por comite | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento de los repositorios companeros en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; su uso esta restringido a tareas algoritmicas de CLRS-30.
- Sesgo de longitud: todos los modelos se entrenan con hasta 16 items; el rendimiento a 64 items depende de la variante y puede degradarse drasticamente (quickselect alcanza 0.00 en una semilla).
- Fallos registrados: la variante `first_registered_seeds/` se publica como fallo documentado; no debe interpretarse como un modelo util para produccion.
- Pools de entrenamiento no estandar: `scc_multi_entry_pool/` no usa el pool de la libreria, lo que limita la comparabilidad directa con otros resultados.
- Idiomas: no aplica, pero tampoco hay soporte linguistico de ningun tipo.
- Licencia apache-2.0: permite uso comercial, pero al ser modelos de investigacion sin garantias de rendimiento fuera de CLRS-30, no se recomienda su uso en produccion sin validacion propia.
- Sin datos de benchmarks fuera de CLRS-30 ni de latencia/throughput, lo que impide estimar costes de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-clrs30-variants
- Repositorio companero principal: `cold-attention-clrs30` (referenciado en la model card, sin URL explicita disponible)
- Repositorio de comite: `cold-attention-scc-committee` (referenciado en la model card, sin URL explicita disponible)
- Paper: no disponible en la informacion proporcionada
- Demo: no disponible
