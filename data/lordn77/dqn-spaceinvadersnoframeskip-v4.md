# LordN77/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

`dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo DQN (Deep Q-Network) sobre el entorno `SpaceInvadersNoFrameskip-v4` de Atari, utilizando la librería Stable-Baselines3. Lo publica el usuario LordN77 en Hugging Face como parte de la formación práctica de la Unidad 3 del curso Deep RL de Hugging Face. No es un modelo de lenguaje: es una política entrenada para jugar a Space Invaders a partir de observaciones visuales.

El agente usa una CNN compacta sobre observaciones en escala de grises de 42x42 píxeles con cuatro fotogramas apilados, y fue seleccionado a partir de un checkpoint guardado en el paso 20.000 de timesteps del agente. El entrenamiento parte de inicialización aleatoria con una semilla fija, y la evaluación se hace con semillas distintas a las de selección de checkpoint, jugando partidas completas con recompensas sin recortar.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de un pipeline DQN mínimo con Stable-Baselines3 sobre Atari, útil para comparar hiperparámetros, preprocesado y protocolos de evaluación en entornos de RL clásicos. No está pensado para despliegue en producción ni para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN compacta (Deep Q-Network, DQN) sobre observaciones 42x42 en escala de grises con 4 fotogramas apilados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL; observación de 4x42x42) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (archivo de modelo de Stable-Baselines3, presumiblemente `.zip`; el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

El agente es un DQN estándar de Stable-Baselines3 entrenado desde inicialización aleatoria sobre `SpaceInvadersNoFrameskip-v4`. La política es una CNN compacta que recibe observaciones de 42x42 píxeles en escala de grises con cuatro fotogramas apilados (entrada 4x42x42). El entrenamiento utilizó una semilla fija y se seleccionó el checkpoint guardado en el paso 20.000 de timesteps del agente. La evaluación se realiza sobre partidas completas, con recompensas sin recortar, y con semillas separadas de las usadas para la selección de checkpoint.

No se especifican en la información disponible el número total de pasos de entrenamiento, la composición del buffer de experiencia, los hiperparámetros concretos (tasa de aprendizaje, gamma, epsilon, target update) ni si se aplicó algún tipo de ajuste posterior. El repositorio incluye `config.json` con los ajustes del entorno de evaluación, `results.json` con una evaluación adicional de 5.000 pasos de agente y `replay.mp4` con la primera de las 10 partidas de evaluación.

## Capacidades

- Jugar a Space Invaders (Atari 2600) a partir de píxeles brutos preprocesados (42x42, escala de grises, 4 fotogramas apilados).
- Política de control entrenada con DQN para seleccionar acciones discretas del entorno `SpaceInvadersNoFrameskip-v4`.
- Evaluación reproducible: semillas separadas para selección de checkpoint y evaluación, y partidas completas con recompensas sin recortar.
- Artefactos de reproducibilidad incluidos: `config.json`, `results.json` y `replay.mp4`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento: es un agente de RL específico de una tarea.

## Casos de uso

- Docencia de RL: usar el agente como ejemplo mínimo y reproducible de un pipeline DQN con Stable-Baselines3 sobre Atari en la Unidad 3 del curso Deep RL de Hugging Face.
- Reproducción de experimentos: cargar `config.json` y `results.json` para replicar la evaluación con las mismas semillas y comparar contra variantes propias.
- Línea base para investigación: servir como referencia de rendimiento (mean_reward 210,00) frente a variantes con mayor número de timesteps, otras arquitecturas o ajuste de hiperparámetros.
- Análisis de estabilidad: estudiar por qué la desviación estándar es 0,00 en 10 y en 30 episodios adicionales, y contrastar con semillas no vistas.
- Demostración visual: emplear `replay.mp4` en materiales docentes o presentaciones para ilustrar el comportamiento de un agente DQN entrenado.
- Pruebas de infraestructura de RL: validar pipelines de carga de modelos de Stable-Baselines3, evaluación con entornos Atari y registro de métricas antes de escalar a entrenamientos más largos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Evaluación | Recompensa media | Desviación estándar poblacional | Puntuación (media - desv.) |
|---|---:|---:|---:|
| 10 episodios | 210,00 | 0,00 | 210,00 |
| 30 episodios adicionales | 210,00 | 0,00 | 210,00 |

Tarea: `reinforcement-learning`. Dataset/entorno: `SpaceInvadersNoFrameskip-v4`. Métrica: `mean_reward`. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño de la CNN compacta y la observación 4x42x42, el requisito es muy bajo (del orden de cientos de MB o menos), aunque no se confirma en la información.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para inferencia; no se especifican modelos concretos.
- Compatibilidad con GPU consumer: sí, previsiblemente en cualquier GPU con soporte CUDA; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: carga mediante Stable-Baselines3 (`stable-baselines3` como librería declarada); no se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo / librería | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LordN77/dqn-SpaceInvadersNoFrameskip-v4 | DQN / Stable-Baselines3 | SpaceInvadersNoFrameskip-v4 | 210,00 +/- 0,00 (10 y 30 episodios) | no disponible | Hugging Face |
| Learnix-AI-Lab/dqn-SpaceInvadersNoFrameskip-v4 | DQN / Stable-Baselines3 + RL Zoo | SpaceInvadersNoFrameskip-v4 | no disponible en la información | no disponible | Hugging Face |
| hruslen/SpaceInvadersNoFrameskip-v4 | DQN / Stable-Baselines3 + RL Zoo | SpaceInvadersNoFrameskip-v4 | no disponible en la información | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo específico de una única tarea y entorno (`SpaceInvadersNoFrameskip-v4`); no generaliza a otros juegos, dominios ni tareas de lenguaje.
- Entrenado con solo 20.000 timesteps del agente: es un checkpoint temprano, no un agente con rendimiento cercano al estado del arte en Atari.
- La desviación estándar de 0,00 en 10 y 30 episodios es sospechosa de baja variabilidad; conviene validar con semillas no vistas antes de extraer conclusiones.
- Resultados no verificados (`verified: false`) y declarados por el autor; no hay validación independiente.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Riesgo de sobreajuste al protocolo de evaluación del autor (mismas semillas, partidas completas, recompensas sin recortar).
- El repositorio figura con 0.0 GB, por lo que la disponibilidad efectiva de los pesos debe comprobarse antes de usarlo.
- Advertencia del propio autor: cargar únicamente archivos de modelo de fuentes de confianza.
- No aplican sesgos lingüísticos ni de alucinación propios de modelos generativos, pero sí posibles sesgos derivados del entorno y de la política entrenada.

## Enlaces

- Hugging Face: https://huggingface.co/LordN77/dqn-SpaceInvadersNoFrameskip-v4
- Curso Deep RL de Hugging Face, Unidad 3: https://huggingface.co/learn/deep-rl-course/unit3/hands-on
- Modelo comparable Learnix-AI-Lab: https://huggingface.co/Learnix-AI-Lab/dqn-SpaceInvadersNoFrameskip-v4
- Modelo comparable hruslen: https://huggingface.co/hruslen/SpaceInvadersNoFrameskip-v4
