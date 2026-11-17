# alexacotarlea/taxi_driver

## Resumen

`alexacotarlea/taxi_driver` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular para resolver el entorno **Taxi-v4** de Gym/Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementación personalizada (*custom-implementation*) que serializa la tabla Q aprendida en un fichero `q-learning.pkl` y se carga a través de `load_from_hub` para interactuar con el entorno. El autor es el usuario de Hugging Face `alexacotarlea` y el repositorio se publicó en noviembre de 2026.

El modelo resuelve un problema clásico de control secuencial: un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones designadas, gestionando el estado del pasajero y la posición del taxi. El espacio de estados es discreto y pequeño (500 estados), y el espacio de acciones consta de 6 movimientos posibles (norte, sur, este, oeste, recoger y dejar). Es un ejemplo canónico de RL clásico, útil para docencia, validación de pipelines de RL y como referencia de integración con el Hub de Hugging Face.

La relevancia de esta ficha es acotada: no compite con modelos generativos ni con agentes basados en LLM, sino que documenta un artefacto de RL tabular con un rendimiento declarado de recompensa media de 7,54 ± 2,74 en Taxi-v4. El repositorio ocupa 0,0 GB y no cuenta con descargas ni *likes*, lo que sugiere un uso experimental o de aprendizaje más que un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (custom-implementation) |
| Parametros totales | no disponible (tabla Q discreta, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v4, 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica a tablas Q) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular, un método *off-policy* de diferencias temporales que aprende una función de valor-acción Q(s, a) almacenada en una tabla. Dado que Taxi-v4 tiene 500 estados y 6 acciones, la tabla Q resultante es de tamaño 500x6, lo que explica que el repositorio ocupe 0,0 GB. No hay red neuronal, ni capas, ni atención, ni tokenizador: el artefacto es un diccionario serializado con `pickle`.

No se dispone de información sobre los hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), la composición del dataset (en RL tabular no hay dataset, sino interacción con el entorno) ni si se aplicaron técnicas como *double Q-learning* o *experience replay*. La model card únicamente indica que se trata de un agente Q-Learning entrenado para Taxi-v4 y muestra el código de carga, sin detallar el proceso de entrenamiento. No se declara ninguna innovación técnica adicional.

## Capacidades

- Resolución del entorno Taxi-v4: el agente aprende una política para recoger y dejar pasajeros en una cuadrícula 5x5 con cuatro ubicaciones.
- Control secuencial discreto: selecciona entre 6 acciones (moverse en cuatro direcciones, recoger, dejar) en cada paso.
- Aprendizaje *off-policy*: la tabla Q puede reutilizarse para evaluación o *fine-tuning* con más episodios.
- Integración con Gym/Gymnasium: se carga mediante `load_from_hub` y se instancia el entorno con `gym.make(model["env_id"])`.
- No soporta *tool calling*, ni *function calling*, ni agentes multi-paso basados en lenguaje.
- No tiene capacidades multilingües, de visión, audio ni modo *thinking*.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de Q-Learning tabular para explicar diferencias temporales, política epsilon-greedy y convergencia de la tabla Q en un entorno discreto.
- Validación de pipelines de RL con Hugging Face: permite probar el flujo `load_from_hub` → `gym.make` → bucle de evaluación sin depender de modelos grandes ni de GPU.
- *Baseline* de referencia en Taxi-v4: útil para comparar contra variantes como SARSA, *double Q-learning* o DQN en el mismo entorno y con la misma métrica de recompensa media.
- Pruebas de integración de entornos Gym en CI: al ser un artefacto pequeño (0,0 GB) y de carga rápida, se puede incluir en *tests* automatizados de regresión de políticas.
- Experimentos de *transfer learning* en RL tabular: la tabla Q puede inicializarse y reentrenarse en variantes del entorno (por ejemplo, con `is_slippery=True`) para estudiar la adaptación.
- Demostraciones educativas interactivas: se puede visualizar la política aprendida paso a paso en un *notebook* para ilustrar cómo el agente optimiza la recogida y entrega de pasajeros.

## Benchmarks y rendimiento

Datos declarados por el autor en la *model card* (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| Taxi-v4 | mean_reward | 7,54 ± 2,74 |

No se han publicado resultados comparativos con otros agentes (SARSA, DQN, PPO) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; es una tabla Q en memoria RAM (500x6 entradas), inferior a 1 MB.
- GPU: no requiere GPU; se ejecuta en CPU.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos *serverless*.
- Despliegue: Python con `gym`/`gymnasium`, `pickle` y `huggingface_hub` (`load_from_hub`). No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y *throughput*: no disponibles; dependen del bucle de simulación del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alexacotarlea/taxi_driver | Q-Learning tabular | Taxi-v4 | Tabla Q 500x6 | no aplica | no disponible | Hugging Face |
| Agentes SARSA en Taxi-v4 | SARSA tabular | Taxi-v4 | Tabla Q 500x6 | no aplica | variable | Implementaciones de referencia en Gym |
| Agentes DQN en Taxi-v4 | Deep Q-Network | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Repositorios de RL |
| Agentes PPO en Taxi-v4 | PPO | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Stable-Baselines3 |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Específico del entorno Taxi-v4: la política no es transferible a otros entornos sin reentrenamiento.
- Sin licencia declarada: no se especifican condiciones de uso comercial; conviene contactar con el autor antes de un uso en producción.
- Métrica no verificada: el valor 7,54 ± 2,74 procede de la *model card* con `verified: false`; no hay evidencia independiente.
- Sin información de hiperparámetros ni de proceso de entrenamiento: difícil reproducir o auditar el resultado.
- Formato `pickle`: la carga de ficheros pickle de origen no confiable implica riesgos de seguridad; conviene inspeccionar el artefacto antes de cargarlo.
- Sin capacidades de lenguaje, visión ni audio: no es adecuado para tareas generativas ni de NLP.
- Sin datos de sesgos, alucinación o robustez: no aplica en el sentido habitual, pero tampoco hay evaluación de generalización.
- Repositorio sin descargas ni *likes*: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alexacotarlea/taxi_driver
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (Hugging Face Hub): https://huggingface.co/docs/huggingface_hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
