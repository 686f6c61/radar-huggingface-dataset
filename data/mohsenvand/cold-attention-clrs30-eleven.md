# mohsenvand/cold-attention-clrs30-eleven

## Resumen

`cold-attention-clrs30-eleven` es un modelo de investigación desarrollado por el usuario de Hugging Face `mohsenvand` que implementa un bloque de atención compartido ("cold attention") entrenado de forma conjunta sobre once de los algoritmos del benchmark CLRS-30 de DeepMind. El objetivo no es la generación de lenguaje, sino el razonamiento algorítmico: ejecutar paso a paso algoritmos clásicos sobre grafos y estructuras de datos (DFS, SCC, ordenación topológica, MST, caminos mínimos, planificación de tareas, LCS, etc.) y producir respuestas exactas.

El modelo sigue el paradigma de CLRS-30: cada tarea conserva su propio codificador de entrada y sus cabezas de lectura, mientras que el núcleo que ejecuta el algoritmo es un único bloque de atención compartido de 146.424 parámetros entrenables. La innovación central es el estudio de profundidad: el bloque se lee tras `ceil(log2 n) + 3` iteraciones y se evalúa también cuatro iteraciones más tarde, midiendo la generalización en longitud sobre grafos de mayor tamaño.

Es relevante ahora porque ataca dos problemas abiertos del razonamiento algorítmico con redes neuronales: la generalización fuera de la distribución de tamaños de entrada (length generalization) y el multi-task learning con un tronco compartido. La implementación está en JAX (no en PyTorch), con pesos en safetensors float32 y licencia Apache 2.0, lo que facilita su reproducción y auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de atención compartido ("cold attention") sobre CLRS-30, con codificadores y cabezas de lectura por tarea |
| Parametros totales | 146.424 (bloque compartido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el presupuesto de iteraciones es `ceil(log2 n) + 3`, dependiente del tamano de entrada) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), libreria JAX |

## Arquitectura y entrenamiento

La arquitectura es un bloque de atención recurrente compartido entre once tareas de CLRS-30. Cada tarea aporta su propio codificador de entrada y sus cabezas de salida, mientras que el bloque central que ejecuta el algoritmo es común a todas. El modelo se ejecuta en bucle: cada entrada se lee tras `ceil(log2 n) + 3` iteraciones (donde `n` es el tamaño de la entrada), y el paper estudia además la lectura cuatro iteraciones más tarde para analizar la profundidad efectiva de la cadena de cómputo.

El entrenamiento consistió en 30.000 actualizaciones; en cada una se procesa un lote de 32 entradas por cada una de las once tareas y se suman las pérdidas. El número de iteraciones por actualización es `ceil(log2 n) + 3` más un sorteo entre 0 y 3. Se usó AdamW con learning rate 0,001, 2.000 pasos de warm-up, decaimiento coseno hasta el 1% y weight decay 0,01. Los parámetros publicados son la media de las instantáneas a partir de la mitad del entrenamiento, tomadas cada 1.000 actualizaciones. Los datos de entrenamiento provienen de la librería `dm-clrs` 2.0.3, salvo para Bellman-Ford, MST-Prim, SCC y ordenación topológica, donde se usaron pools propios con un 25% de entradas de 24, 28 y 32 nodos.

## Capacidades

- Razonamiento algorítmico sobre grafos: DFS, componentes fuertemente conexas, ordenación topológica, MST-Prim, MST-Kruskal, Bellman-Ford, caminos mínimos en DAG.
- Planificación y secuenciación: Task Scheduling, LCS Length, Optimal BST, Quickselect.
- Producción de respuestas exactas (valores numéricos y estructuras) sobre las once tareas.
- Generalización en longitud: el bloque mantiene el rendimiento en grafos más profundos que los de entrenamiento (hasta 64, 128 y 256 nodos en el estudio del paper).
- Multi-task con tronco compartido: un único bloque resuelve las once tareas.
- Lectura configurable: predicciones disponibles en cada iteración de 1 a 16 y en la lectura canónica.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en razonamiento algorítmico: reproducir los experimentos de profundidad y generalización en longitud sobre CLRS-30 usando los pesos publicados y el paquete `witness_clrs`.
- Benchmarking de arquitecturas de atención: comparar el bloque compartido con alternativas (GNN, transformers estándar) en las once tareas para medir la eficacia del tronco compartido.
- Estudio de multi-task learning: analizar la transferencia entre tareas algorítmicas cuando solo se comparte el bloque de cómputo y no los codificadores.
- Verificación de generalización fuera de distribución: evaluar el bloque en grafos de 64, 128 y 256 nodos generados por el propio estudio para medir la caída de precisión.
- Educación y divulgación: usar las predicciones de referencia (`reference_predictions.npz`) como material didáctico para ilustrar cómo una red neuronal ejecuta un algoritmo paso a paso.
- Base para extensiones: partir del bloque compartido para añadir nuevas tareas de CLRS-30 o para estudiar variantes de atención con presupuestos de iteraciones distintos.

## Benchmarks y rendimiento

Resultados sobre el split oficial de test de CLRS-30, con lectura tras `ceil(log2 n) + 3` iteraciones y cuatro iteraciones más tarde. Precisión media sobre las once tareas: 93,80.

| Tarea | Test (lectura) | Test (4 iteraciones despues) | Validacion |
|---|---:|---:|---:|
| DFS | 78,96 | 84,57 | 95,90 |
| SCC | 95,51 | 95,21 | 100,00 |
| Topological Sort | 99,58 | 99,56 | 100,00 |
| MST-Prim | 96,04 | 96,34 | 97,66 |
| Bellman-Ford | 98,34 | 98,29 | 99,22 |
| DAG Shortest Paths | 99,37 | 99,37 | 100,00 |
| MST-Kruskal | 98,75 | 98,86 | 100,00 |
| Task Scheduling | 90,31 | 92,05 | 99,85 |
| LCS Length | 94,62 | 94,96 | 99,85 |
| Optimal BST | 80,89 | 82,69 | 99,08 |
| Quickselect | 99,41 | 99,37 | 100,00 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 146.424 parámetros en float32 el bloque ocupa aproximadamente 0,6 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; el autor verificó la reproducción exacta en una NVIDIA B200 con JAX 0.8.0, pero cualquier GPU compatible con JAX sirve.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: JAX con el paquete `witness_clrs` (vía `load_shared_hub`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del tamaño de los grafos y del número de iteraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cold-attention-clrs30-eleven | 146.424 (bloque compartido) | presupuesto `ceil(log2 n) + 3` iteraciones | 11 de CLRS-30 | Apache 2.0 | Hugging Face |
| cold-attention-clrs30 (30 tareas) | no disponible en la informacion | no disponible | 30 de CLRS-30 | no disponible | referenciado en la model card |
| Alternativas GNN/transformer para CLRS-30 | no disponible | no disponible | variable | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha entrenado una semilla (seed 0); no hay estimación de varianza entre semillas.
- Los grafos más profundos del paper (cadenas de 64, grafos de 128 y 256 nodos) provienen de un generador propio del estudio y no están incluidos en el repositorio; las puntuaciones publicadas son solo sobre los splits oficiales de CLRS-30.
- DFS (78,96) y Optimal BST (80,89) muestran un rendimiento notablemente inferior al resto en test, lo que indica dificultades en tareas con cadenas de cómputo largas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, visión ni audio, y no tiene capacidades multilingües.
- Depende del paquete `witness_clrs` y de JAX; no hay integración con ecosistemas PyTorch ni con servidores de inferencia estándar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo está orientado a investigación y su aplicabilidad en producción fuera del ámbito algorítmico es nula.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado el enlace al repositorio companion en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/mohsenvand/cold-attention-clrs30-eleven
- Benchmark CLRS-30 (DeepMind): no disponible en la informacion proporcionada
- Repositorio companion `witness_clrs`: no disponible en la informacion proporcionada (el autor indica que el enlace se añadirá en el release)
- Paper: no disponible en la informacion proporcionada
