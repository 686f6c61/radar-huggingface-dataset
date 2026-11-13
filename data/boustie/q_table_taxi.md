# Boustie/q_table_taxi

## Resumen

`Boustie/q_table_taxi` es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado para resolver el entorno `Taxi-v3` de Gym/Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: el artefacto publicado es una tabla Q serializada (formato `.pkl`) que mapea pares estado-acción a valores de recompensa esperada. Lo desarrolla el usuario de Hugging Face "Boustie" y se distribuye a través del Hub con el pipeline `reinforcement-learning`.

El modelo resuelve el problema clásico de planificación en el que un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con 4 ubicaciones posibles, gestionando un estado discreto de 500 combinaciones y 6 acciones. Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo mínimo reproducible de un agente Q-Learning entrenado con la librería de RL de Hugging Face, útil para comparar curvas de aprendizaje, validar pipelines de evaluación o como baseline en experimentos docentes.

El repositorio tiene un tamaño de 0.0 GB (artefacto muy ligero) y no cuenta con descargas ni likes en el momento de la consulta. No se especifican licencia, idiomas ni detalles del proceso de entrenamiento más allá de la métrica declarada en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-acción, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; 500 estados x 6 acciones en Taxi-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL discreto, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q en `.pkl`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, presumiblemente serialización de la tabla Q) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico, sin aproximación funcional. El agente mantiene una tabla Q de dimensión `[n_states, n_actions]`, que en `Taxi-v3` corresponde a 500 estados discretos y 6 acciones (moverse norte, sur, este, oeste, recoger pasajero, dejar pasajero). La actualización sigue la regla de Bellman `Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a))`, con una política de exploración epsilon-greedy durante el entrenamiento.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje `alpha`, factor de descuento `gamma`, decaimiento de epsilon, número de episodios), composición del dataset (el entorno es sintético y determinista o estocástico según `is_slippery`), ni sobre técnicas adicionales como Double Q-Learning o experience replay. La model card únicamente indica que se trata de un agente Q-Learning entrenado con la integración de Hugging Face para RL y proporciona una llamada a `load_from_hub` para recuperar el fichero `q-learning.pkl`.

## Capacidades

- Resolución del entorno `Taxi-v3` mediante política greedy derivada de la tabla Q.
- Toma de decisiones discretas en un espacio de 500 estados y 6 acciones.
- Aprendizaje por refuerzo off-policy tabular (Q-Learning).
- Serialización y carga vía `load_from_hub` desde el Hub de Hugging Face.
- Integración con `gym.make(model["env_id"])` para recrear el entorno de evaluación.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo mínimo funcional para explicar Q-Learning tabular, la ecuación de Bellman y la exploración epsilon-greedy en un entorno con espacio de estados finito.
- Baseline en experimentos comparativos: emplear la métrica `mean_reward` declarada (7.52 ± 2.67) como referencia frente a variantes como SARSA, Double Q-Learning o DQN en `Taxi-v3`.
- Validación de pipelines de RL en Hugging Face: probar el flujo `load_from_hub` → `gym.make` → evaluación para verificar la integración de la librería en CI.
- Reproducibilidad de resultados: cargar el `.pkl` y reevaluar la política para comprobar la varianza del retorno en múltiples episodios.
- Generación de datos sintéticos de trayectorias: ejecutar el agente para producir secuencias estado-acción-recompensa que alimenten visualizaciones o análisis de política.
- Material de test para frameworks de serialización: verificar la compatibilidad de pickles entre versiones de Python y de la librería de RL subyacente.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| Taxi-v3 | reinforcement-learning | mean_reward | 7.52 +/- 2.67 |

No se han publicado otros resultados de benchmarks en la información disponible. No se proporcionan comparaciones con SARSA, DQN u otros agentes sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada: 0 GB (la tabla Q es un array discreto de 500x6; el artefacto ocupa 0.0 GB).
- GPU recomendadas: no aplica; la inferencia es trivial y se ejecuta en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: carga directa con `pickle`/`load_from_hub` de la librería de RL de Hugging Face y evaluación con `gym`/`gymnasium`. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza tabular, la consulta a la tabla es O(1) y el cuello de botella real es el bucle de simulación del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Boustie/q_table_taxi | Q-Learning tabular | Taxi-v3 | Tabla 500x6 | no aplica | no disponible | Hugging Face Hub |
| Agentes SARSA en Taxi-v3 | SARSA tabular | Taxi-v3 | Tabla 500x6 | no aplica | variable | Implementaciones de referencia en Gym |
| DQN en Taxi-v3 | Deep Q-Network | Taxi-v3 | Red pequeña (MLP) | no aplica | variable | Repos académicos y tutoriales |
| Otros agentes RL del Hub | Q-Learning / PPO | distintos entornos | variable | no aplica | variable | Hugging Face Hub |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El agente está especializado exclusivamente en `Taxi-v3`; no generaliza a otros entornos ni tareas.
- El retorno medio de 7.52 ± 2.67 es modesto y presenta alta varianza; el óptimo en Taxi-v3 suele situarse alrededor de 8, por lo que la política puede no ser plenamente óptima.
- La métrica está marcada como `verified: false`; no ha sido validada de forma independiente.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan hiperparámetros ni el proceso de entrenamiento, lo que dificulta la reproducibilidad exacta.
- El formato `.pkl` implica riesgos de seguridad al deserializar ficheros de origen no confiable (ejecución arbitraria de código); conviene auditar antes de cargar.
- No apto para tareas de lenguaje natural, visión, audio ni razonamiento simbólico fuera del entorno.
- La compatibilidad del pickle puede romperse entre versiones de Python o de la librería de RL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Boustie/q_table_taxi
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de RL en Hugging Face: https://huggingface.co/docs/hub/en/models-the-hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
