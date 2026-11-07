# c851458/warehouse-rush-qlearning

## Resumen

Warehouse Rush · Q-learning es un agente de aprendizaje por refuerzo que resuelve una tarea de logística de almacén en el entorno `WarehouseRush-v1` (Gymnasium). Lo publica el usuario c851458 en Hugging Face y no es una red neuronal: es una tabla Q tabular de tipo `float32` con forma `[11, 15, 5, 2, 3, 40, 7]`, es decir, un array NumPy de 1.386.000 entradas que indexa cada combinación de observación discreta (posición del robot, nivel de batería, paquete transportado, tipo del paquete y objetivo) con las siete acciones posibles. El modelo entrenado se distribuye como un único fichero `q_table.npy` de tamaño despreciable (el repositorio ocupa 0,0 GB).

El problema que aborda es el control de un robot de bodega que debe recoger tres paquetes de las estanterías y entregarlos en orden en la zona de su color, gestionando paquetes normales, pesados (consumen el doble de batería) y frágiles (se rompen al chocar), además de recargar en la estación de carga. Es relevante como referencia reproducible de Q-learning clásico aplicado a un entorno Gymnasium con estado discreto, útil para comparar con aproximaciones basadas en redes (DQN, PPO) sobre el mismo entorno y para validar pipelines de RL tabular.

La evaluación declarada por el autor sobre 500 pedidos no vistos en entrenamiento arroja una tasa de éxito del 98,6 % (2,980 paquetes entregados por pedido), 68,066 pasos por pedido, recompensa media de 62,592, 0,168 rescates por batería agotada, 0,000 paquetes frágiles rotos, 0,174 cargas de batería y 0,014 choques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q discreta, sin red neuronal) |
| Parametros totales | 1.386.000 entradas en la tabla Q (forma `[11, 15, 5, 2, 3, 40, 7]`, `float32`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (el estado es una observación discreta de 6 componentes) |
| Tipos de cuantizacion | no aplica; pesos en `float32` |
| Idiomas soportados | no disponible (el agente no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q_table.npy` (NumPy, `float32`) |

## Arquitectura y entrenamiento

El agente es una tabla Q tabular indexada por la tupla de observación `[fila, columna, nivel de batería, lleva paquete, tipo del paquete que lleva, objetivo]` y por la acción (0 arriba, 1 abajo, 2 izquierda, 3 derecha, 4 recoger, 5 entregar, 6 cargar). La política en inferencia es codiciosa pura: `argmax` sobre la fila Q correspondiente al estado. No hay función de aproximación, red neuronal, atención ni decodificación especulativa; toda la capacidad del agente reside en la cobertura y calidad de la tabla.

El entrenamiento consistió en 40.000 episodios con tasa de aprendizaje α = 0,1, factor de descuento γ = 0,99 y una exploración ε-greedy que decae hasta un mínimo de 0,05, alcanzado al 70 % del entrenamiento. La batería máxima es de 100 unidades y el límite es de 400 pasos por pedido. El autor documenta el run de MLflow `5cb6f867b34b4a57bce0d49436c42f07` y el commit de git `faa34d6` del pipeline, lo que facilita la reproducibilidad.

## Capacidades

- Control de política en el entorno `WarehouseRush-v1`: selección de acción entre siete posibles (movimiento, recogida, entrega y carga).
- Planificación implícita de rutas cortas en una rejilla de 11 × 15 con objetivos de color.
- Gestión de recursos: recarga en la estación de carga cuando la batería lo requiere.
- Manejo de tipos de paquete: normales, pesados (doble consumo de batería) y frágiles (evita choques para no romperlos).
- Ejecución de pedidos de tres paquetes con entrega en orden.
- Inferencia determinista y de coste O(1) por paso (una indexación de array y un `argmax`).
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Control de referencia en bodega simulada: usar la tabla como política base en `WarehouseRush-v1` para generar trayectorias de demostración y comparar contra agentes neuronales (DQN, PPO) en el mismo entorno.
- Baseline de evaluación en investigación en RL: servir de suelo de rendimiento (98,6 % de pedidos completos) frente al que medir la muestra-eficiencia de métodos con aproximación de función.
- Docencia de Q-learning tabular: el fichero `q_table.npy` y los hiperparámetros documentados permiten reproducir el experimento completo en un portátil sin GPU.
- Pruebas de integración de pipelines de RL: el run de MLflow y el commit de git permiten validar sistemas de tracking y versionado de experimentos con un artefacto pequeño y determinista.
- Simulación de logística para análisis operativo: medir métricas derivadas (pasos por pedido, cargas de batería, choques) para estudiar políticas de recarga y gestión de paquetes frágiles antes de trasladar el diseño a un simulador mayor.
- Demo 3D interactiva: ejecutar `./train3d.py --demo-only --modelo hf:c851458/warehouse-rush-qlearning` para visualizar la política en un visor tridimensional, útil en presentaciones y validación cualitativa.
- Verificación de robustez ante condiciones no vistas: al ser tabular, permite inspeccionar directamente qué estados tienen valores Q poco entrenados y detectar zonas de riesgo antes de desplegar el agente en variantes del entorno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre 500 pedidos de evaluación no usados en entrenamiento:

| Metrica | Valor |
|---|---|
| Pedidos completos (tasa de exito) | 98,6 % |
| Paquetes entregados por pedido | 2,980 |
| Pasos por pedido | 68,066 |
| Recompensa media | 62,592 |
| Rescates por bateria agotada | 0,168 |
| Paquetes fragiles rotos | 0,000 |
| Cargas de bateria | 0,174 |
| Choques | 0,014 |

No se han publicado resultados comparativos con otros agentes sobre `WarehouseRush-v1` en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la tabla Q ocupa aproximadamente 5,5 MB en `float32` (1.386.000 × 4 bytes) y cabe en memoria RAM de cualquier equipo.
- GPU recomendadas: ninguna; la inferencia es una indexación de array y un `argmax` en CPU.
- Cabe en cualquier GPU consumer y en CPU de gama baja; no hay requisito de aceleración.
- Despliegue: carga directa con NumPy y `huggingface_hub` (`hf_hub_download` + `np.load`). No aplica a vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza de la operación (una indexación y un `argmax` sobre 7 valores) la latencia por paso es del orden de microsegundos en CPU, muy por debajo del coste de la simulación del entorno.

## Comparativa con modelos similares

No se dispone de información sobre otros agentes publicados para `WarehouseRush-v1` ni sobre alternativas tabulares comparables en la información proporcionada. Como referencia conceptual de la misma categoría (control en entornos Gymnasium discretos) cabría considerar agentes DQN o PPO, pero no se dispone de sus parámetros, contexto, rendimiento ni licencia para esta tarea concreta, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento en WarehouseRush-v1 | Licencia |
|---|---|---|---|---|
| warehouse-rush-qlearning | 1.386.000 entradas Q | no aplica | 98,6 % pedidos completos (autor) | no disponible |
| Alternativas DQN/PPO | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La política es tabular y específica del entorno `WarehouseRush-v1`; no generaliza a otros mapas, tamaños de rejilla u observaciones continuas sin reentrenar.
- El estado está discretizado (11 × 15 posiciones, 5 niveles de batería, 2 estados de carga, 3 tipos de paquete, 40 objetivos); cambios en la definición del entorno invalidan la tabla.
- Los resultados (98,6 % de éxito) son declarados por el autor y no han sido verificados de forma independiente.
- La licencia no está disponible, por lo que el uso comercial queda sin marco legal explícito hasta consultar al autor.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá de las métricas de evaluación publicadas.
- El agente no procesa lenguaje ni modalidades distintas de la observación del entorno; no es adecuado para tareas de NLP, visión o diálogo.
- El 1,4 % de pedidos no completados y los 0,168 rescates por batería agotada indican que persisten fallos de política en estados poco visitados; conviene auditar la cobertura de la tabla antes de usar el agente como referencia de producción.
- El repositorio ocupa 0,0 GB y contiene únicamente la tabla Q; no se distribuyen el código de entrenamiento ni el entorno, que deben obtenerse del proyecto del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c851458/warehouse-rush-qlearning
- Run de MLflow documentado en la model card: `5cb6f867b34b4a57bce0d49436c42f07`
- Commit de git documentado en la model card: `faa34d6`
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales.
