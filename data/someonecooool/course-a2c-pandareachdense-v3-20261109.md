# someonecooool/course-a2c-PandaReachDense-v3-20261109

## Resumen

El modelo `course-a2c-PandaReachDense-v3-20261109` es una política de aprendizaje por refuerzo (reinforcement learning, RL) entrenada con el algoritmo Advantage Actor-Critic (A2C) sobre el entorno `PandaReachDense-v3` de Panda Gym, que simula un brazo robótico Franka Emika Panda en PyBullet. Lo publica el usuario de Hugging Face `someonecooool` y su origen es didáctico: reproduce el ejercicio práctico de la unidad 6 del curso "Deep Reinforcement Learning" de Hugging Face, orientado a entrenar agentes en entornos de control robótico continuo.

No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un artefacto de RL de tipo policy network, empaquetado en el formato nativo de Stable Baselines3 (`.zip`) junto con un fichero `vec_normalize.pkl` que contiene las estadísticas de normalización de observaciones y recompensas. Su relevancia es, por tanto, educativa y de referencia para quienes quieran reproducir el pipeline de entrenamiento con Stable Baselines3 2.4.1, Panda Gym 3.0.7 y PyBullet 3.2.7.

El entrenamiento se realizó desde cero durante 100.000 pasos con semilla 42 y cuatro entornos en paralelo, aplicando normalización de observación y recompensa. La evaluación final, sobre 100 episodios con semilla inicial 10000, arroja una recompensa media bruta de -0,210486 con desviación típica de 0,112463, lo que indica un rendimiento limitado en la tarea de alcance (reach) y un comportamiento todavía alejado de la convergencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política A2C (Actor-Critic) implementada en Stable Baselines3; perceptrón multicapa para política y función de valor (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de RL, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato binario de Stable Baselines3) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `.zip` de Stable Baselines3 (`a2c-PandaReachDense-v3.zip`) y `vec_normalize.pkl` |

## Arquitectura y entrenamiento

La arquitectura es la de A2C tal como la implementa Stable Baselines3: un actor que produce una distribución de política (gaussiana para acciones continuas en este entorno) y un crítico que estima la función de valor, entrenados de forma síncrona con ventaja estimada. En este caso concreto, el entorno `PandaReachDense-v3` proporciona observaciones continuas del estado del brazo robótico y recompensas densas que guían el alcance hacia un objetivo. No se especifican en la información disponible el número de capas ni las unidades ocultas de las redes.

El entrenamiento se llevó a cabo durante 100.000 pasos con semilla 42 y cuatro entornos en paralelo, aplicando normalización de observación y recompensa mediante `VecNormalize`. La evaluación se realizó sobre 100 episodios con semilla inicial 10000, con estadísticas de observación congeladas y normalización de recompensa desactivada (`training=False`, `norm_reward=False`). No se documenta el uso de técnicas adicionales como PPO, GAE extendido, curriculum learning ni recompensas moldeadas más allá de las del propio entorno.

## Capacidades

- Control continuo de un brazo robótico simulado (Franka Emika Panda) en la tarea de alcance (`PandaReachDense-v3`).
- Generación de acciones deterministas mediante `predict(..., deterministic=True)` a partir de observaciones del entorno.
- Integración con el ecosistema Stable Baselines3 y Panda Gym para evaluación y despliegue en simulación.
- Reproducibilidad del pipeline de entrenamiento (semilla 42, cuatro entornos, normalización de observaciones y recompensas).
- No soporta tool calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento: es una política de RL específica de tarea.
- No es un modelo de propósito general: no genera texto ni código.

## Casos de uso

- Reproducción didáctica del ejercicio de la unidad 6 del curso de Deep RL de Hugging Face: sirve como referencia para comparar resultados al variar hiperparámetros, número de entornos o pasos de entrenamiento.
- Línea base (baseline) para experimentos de RL en control robótico: permite contrastar A2C con PPO, SAC o TD3 sobre el mismo entorno y presupuesto de pasos.
- Evaluación de pipelines de normalización: el par `vec_normalize.pkl` + política permite estudiar el impacto de congelar estadísticas en la evaluación (`training=False`, `norm_reward=False`).
- Docencia y talleres: ejemplo mínimo y autocontenido de cómo cargar una política con `A2C.load` y ejecutar episodios en PyBullet.
- Pruebas de integración de Panda Gym con Stable Baselines3 en entornos de CI o cuadernos reproducibles.
- Investigación sobre sensibilidad a la semilla y varianza en RL: la desviación típica reportada (0,112463) sobre 100 episodios permite analizar la estabilidad del agente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset/entorno | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | PandaReachDense-v3 | mean_reward | -0,210486 +/- 0,112463 |

Datos adicionales de la model card: recompensa media bruta -0,21048576; desviación típica 0,11246343; media menos desviación típica -0,32294919. Evaluación sobre 100 episodios con semilla inicial 10000. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es una política de RL de pequeño tamaño (repo de 0,0 GB), por lo que la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con PyTorch sirve, aunque para este tamaño no es necesaria.
- ¿Cabe en GPU de consumo? Sí, con total probabilidad, dado el tamaño reducido del artefacto; no se dispone de cifras exactas.
- Opciones de despliegue: Stable Baselines3 (`A2C.load`) sobre Python con PyTorch, Panda Gym 3.0.7 y PyBullet 3.2.7. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles; dependen del simulador PyBullet y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Pasos de entrenamiento | Recompensa media | Licencia |
|---|---|---|---|---|---|
| course-a2c-PandaReachDense-v3-20261109 (este) | A2C (SB3) | PandaReachDense-v3 | 100.000 | -0,210486 +/- 0,112463 | no disponible |
| Políticas A2C de referencia del curso de Hugging Face | A2C (SB3) | PandaReachDense-v3 | variable | no disponible | no disponible |
| Políticas PPO/SAC sobre PandaReachDense-v3 | PPO/SAC | PandaReachDense-v3 | variable | no disponible | no disponible |

No se dispone de resultados numéricos de alternativas en la información proporcionada; la comparativa queda limitada a la categoría (políticas de RL para control robótico en Panda Gym).

## Limitaciones y advertencias

- Rendimiento limitado: la recompensa media negativa (-0,210486) sugiere que el agente no domina la tarea de alcance; no debe usarse como referencia de calidad en producción.
- Entrenamiento corto: 100.000 pasos con A2C suele ser insuficiente para converger en control continuo; los resultados son sensibles a la semilla y a la varianza.
- Dependencia estricta del entorno: la política solo es válida para `PandaReachDense-v3` con la misma configuración de observaciones y normalización; no es transferible a otras tareas sin reentrenamiento.
- Requisito de normalización: debe cargarse `vec_normalize.pkl` con `VecNormalize.load` y usarse `training=False` y `norm_reward=False`; ignorarlo invalida las predicciones.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sesgos y alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo es de comportamiento subóptimo o no robusto fuera del régimen de entrenamiento.
- Sin verificación externa: la métrica `mean_reward` está marcada como `verified: false` en el model-index.
- Repo de 0,0 GB: conviene comprobar la integridad de los artefactos antes de usarlos en pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/someonecooool/course-a2c-PandaReachDense-v3-20261109
- Curso de Deep RL (unidad 6, hands-on): https://huggingface.co/learn/deep-rl-course/en/unit6/hands-on
- Stable Baselines3: https://stable-baselines3.readthedocs.io/
- Panda Gym: https://github.com/qgallouedec/panda-gym
- PyBullet: https://pybullet.org/
