# MoenesG/Lab2_Q_Learning

## Resumen

`MoenesG/Lab2_Q_Learning` es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno `Taxi-v4` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de laboratorio (el nombre "Lab2" sugiere un ejercicio académico) que almacena una tabla Q serializada en formato `.pkl` y se carga a través de `load_from_hub`. El autor es el usuario de Hugging Face MoenesG.

El entorno `Taxi-v4` es un problema clásico de planificación con 500 estados discretos (25 posiciones del taxi × 5 posiciones del pasajero × 4 destinos) y 6 acciones posibles. Un agente Q-Learning tabular aprende una política óptima mediante actualizaciones de Bellman sobre pares estado-acción, sin necesidad de GPU ni de grandes volúmenes de datos.

Su relevancia es exclusivamente didáctica: sirve como referencia reproducible de un pipeline de RL clásico (entorno, entrenamiento, evaluación con `mean_reward` y publicación en el Hub). No es adecuado para tareas de generación, razonamiento o procesamiento de lenguaje, y no debe confundirse con un modelo fundacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-acción, sin red neuronal) |
| Parametros totales | no disponible (tabla de 500 estados × 6 acciones en el peor caso; el tamaño real del artefacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos en formato `.pkl` serializado) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, cargado con `load_from_hub`) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning tabular clásico sobre el MDP discreto de `Taxi-v4`. La tabla Q se inicializa (presumiblemente a cero) y se actualiza con la regla de Bellman `Q(s,a) ← Q(s,a) + α[r + γ·max_a' Q(s',a') − Q(s,a)]` durante episodios de interacción con el entorno. La model card no especifica hiperparámetros como la tasa de aprendizaje α, el factor de descuento γ, la política de exploración (ε-greedy y su decaimiento) ni el número de episodios de entrenamiento.

No hay datos de entrenamiento en el sentido habitual (tokens, corpus, RLHF/DPO): el "dataset" es la propia dinámica del entorno `Taxi-v4`, que genera transiciones estocásticas según la política del agente. El artefacto publicado contiene la tabla Q resultante y el identificador del entorno (`env_id`), que debe pasarse a `gym.make` para reconstruir el entorno de evaluación. La model card advierte de que pueden ser necesarios atributos adicionales del entorno (por ejemplo `is_slippery=False`), aunque ese parámetro es propio de `FrozenLake` y no de `Taxi-v4`, lo que sugiere que la plantilla de la model card se reutilizó sin adaptar.

## Capacidades

- Resolución del entorno `Taxi-v4` de Gymnasium: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con la política aprendida.
- Toma de decisiones discreta sobre 6 acciones (moverse norte, sur, este, oeste, recoger, dejar).
- Aprendizaje por refuerzo tabular: la tabla Q puede inspeccionarse y reutilizarse como política greedy.
- Carga reproducible vía `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta generación de texto, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes multi-paso en el sentido de LLM; su "razonamiento" se limita a la política Markoviana almacenada.
- No tiene capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el artefacto como solución de referencia en un laboratorio para comparar la política aprendida con la política óptima calculada por value iteration sobre los 500 estados de `Taxi-v4`.
- Reproducibilidad de experimentos: cargar el `.pkl` y evaluar el agente con la misma semilla para verificar el `mean_reward` declarado de 7.56 ± 2.71 y detectar desviaciones por cambios de versión de Gymnasium.
- Baseline en comparación de algoritmos: enfrentar Q-Learning tabular contra SARSA, Double Q-Learning o DQN en `Taxi-v4` usando este agente como punto de partida y referencia de rendimiento.
- Depuración de pipelines de RL: validar que un entorno de evaluación propio (wrappers, gestión de semillas, límite de pasos) produce recompensas coherentes con las del autor antes de escalar a entornos más complejos.
- Estudio de sensibilidad a hiperparámetros: reentrenar desde cero con distintas α, γ y schedules de ε y comparar la tabla Q resultante con la publicada para analizar la estabilidad del aprendizaje.
- Material para tutoriales y notebooks: ejemplo mínimo de publicación de un agente de RL en el Hub con `model-index` y métricas declaradas, útil para enseñar el formato de model card.
- Simulación de políticas discretas en entornos logísticos simplificados: adaptar la lógica de la tabla Q a variantes del problema del taxi (mapas reducidos, recompensas modificadas) como ejercicio de transferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 ± 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparación con otros agentes ni desglose de episodios, tasa de éxito o longitud media de episodio.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q en un `.pkl` de tamaño despreciable (el repositorio ocupa 0.0 GB).
- GPU: no necesaria; la inferencia es una búsqueda en diccionario o array en CPU.
- Cabe en cualquier equipo, incluidos portátiles modestos y entornos sin acelerador.
- Despliegue: Python con `gymnasium` (o `gym` compatible con `Taxi-v4`), `huggingface_hub` para `load_from_hub` y `numpy` para la tabla Q. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de interacción con el entorno, no del modelo. Para `Taxi-v4` (máximo 200 pasos por episodio) la evaluación completa es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MoenesG/Lab2_Q_Learning | Q-Learning tabular | Taxi-v4 | no disponible | no aplica | no disponible | Hugging Face |
| Agentes Q-Learning de referencia de la comunidad (p. ej. los generados por `rl-baselines3-zoo` o `stable-baselines3`) | Q-Learning / DQN | Taxi-v4, FrozenLake, CartPole | no disponible | no aplica | MIT (en el caso de SB3) | GitHub / Hugging Face |
| Política óptima de `Taxi-v4` por value iteration | Programación dinámica | Taxi-v4 | no aplica | no aplica | según implementación | Código de ejemplo en la documentación de Gymnasium |

No se dispone de datos de rendimiento de los comparadores en la informacion proporcionada, por lo que la comparación se limita a tipo de algoritmo, entorno y licencia. La política óptima de `Taxi-v4` suele alcanzar recompensas medias cercanas a 8 en evaluaciones deterministas, pero no se aporta una cifra verificada en esta ficha.

## Limitaciones y advertencias

- Sesgos: no aplica en el sentido de sesgos sociales; el agente solo conoce la dinámica de `Taxi-v4` y no generaliza fuera de ella.
- Alucinación: no aplica; no genera texto. Sí puede ejecutar acciones subóptimas si la tabla Q no convergió o si el entorno cambia.
- Contexto e idioma: sin soporte de lenguaje natural ni de contexto conversacional.
- Licencia no disponible: la ausencia de licencia explícita impide asumir derechos de uso comercial o de redistribución; hay que contactar con el autor antes de reutilizarlo en producción.
- Reproducibilidad: la model card no documenta hiperparámetros, semillas ni número de episodios, por lo que replicar exactamente el resultado es difícil.
- Compatibilidad: depende de la versión de Gymnasium/Gym y del `env_id` almacenado; cambios de versión pueden romper la carga o alterar la dinámica del entorno.
- Métrica no verificada: el `mean_reward` de 7.56 ± 2.71 está declarado por el autor con `verified: false` y no se especifica el número de episodios de evaluación ni la política de exploración usada.
- Ambigüedad en la model card: la mención a `is_slippery=False` corresponde a `FrozenLake`, no a `Taxi-v4`, lo que indica que la documentación no se revisó en detalle.
- Uso en producción: no recomendado como componente de sistemas reales; es un artefacto académico sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoenesG/Lab2_Q_Learning
- Entorno `Taxi-v4` en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (Hugging Face Hub): https://huggingface.co/docs/huggingface_hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
- Stable-Baselines3 (referencia de agentes RL): https://github.com/DLR-RM/stable-baselines3
