# Coralfil/rl-pandareachdense

## Resumen

Coralfil/rl-pandareachdense es un agente de aprendizaje por refuerzo entrenado con el algoritmo A2C (Advantage Actor-Critic) sobre el entorno PandaReachDense-v3, una tarea de control robótico de un brazo Panda en la que el efector final debe alcanzar una posición objetivo en el espacio tridimensional. El modelo se distribuye como un artefacto de stable-baselines3, la librería de referencia en Python para algoritmos de RL, y está asociado al curso de Deep RL de Hugging Face, donde se certifica como agente entrenado.

No se trata de un modelo de lenguaje ni de un transformer generativo: es una política neuronal que mapea observaciones del entorno (posición del efector, posición objetivo, velocidades) a acciones continuas de control del manipulador. Su relevancia es didáctica y de referencia: sirve como ejemplo reproducible de entrenamiento A2C en un entorno de robótica de MuJoCo con recompensa densa, útil para comparar curvas de aprendizaje, hiperparámetros y técnicas de estabilización.

La información pública es muy escasa: cero descargas, cero likes, sin licencia declarada, sin idiomas y sin documentación técnica más allá de una model card mínima. El único dato de rendimiento es el mean_reward declarado en el model-index, no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-critic A2C (red neuronal MLP, implementación de stable-baselines3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de PyTorch para stable-baselines3) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .zip de stable-baselines3, no confirmado en la información) |

## Arquitectura y entrenamiento

El agente emplea A2C, un método on-policy de gradiente de política con función de ventaja. En stable-baselines3, A2C se implementa con una red compartida o separada para política y valor, típicamente un MLP con dos capas ocultas de 64 unidades y activación tanh, aunque la configuración exacta de este artefacto no se documenta. La política es estocástica durante el entrenamiento (distribución gaussiana sobre acciones continuas) y determinista en inferencia.

El entorno PandaReachDense-v3 pertenece a panda-gym, basado en MuJoCo y Gymnasium. La recompensa densa es la distancia negativa entre el efector final y el objetivo, lo que facilita el aprendizaje frente a la variante sparse. No se especifican en la información disponible el número de pasos de entrenamiento, los hiperparámetros (learning rate, n_steps, entropía), la semilla ni la composición de episodios. Tampoco se indica si hubo ajuste fino posterior ni evaluación con múltiples semillas.

## Capacidades

- Control continuo de un brazo robótico Panda para alcanzar una posición objetivo en 3D (tarea de reaching).
- Aprendizaje por refuerzo on-policy con A2C, adecuado para entornos con recompensa densa y horizonte corto.
- Inferencia determinista de acciones a partir de observaciones del entorno (posición y velocidad del efector, posición del objetivo).
- Integración directa con stable-baselines3: carga mediante `A2C.load()` y uso con `model.predict()`.
- Compatible con el ecosistema Gymnasium/MuJoCo para evaluación y reproducción.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción didáctica del curso de Deep RL de Hugging Face: sirve como punto de partida para que estudiantes comparen su propio agente A2C con uno ya entrenado en PandaReachDense-v3.
- Baseline en experimentos de RL robótico: permite medir la mejora de algoritmos como PPO, SAC o TD3 frente a A2C en la misma tarea de reaching con recompensa densa.
- Estudio de sensibilidad a hiperparámetros: al ser un agente A2C sobre un entorno estándar, se puede usar para analizar el efecto de n_steps, learning rate y coeficiente de entropía en la curva de recompensa.
- Docencia en control continuo: ilustra cómo una política MLP mapea observaciones de bajo nivel a acciones de par de fuerzas en un manipulador de 7 grados de libertad.
- Pruebas de infraestructura de evaluación: útil para validar pipelines de MuJoCo, Gymnasium y stable-baselines3 en entornos de CI antes de entrenar modelos más costosos.
- Referencia para comparativas de recompensa densa vs sparse: el entorno dense permite contrastar con PandaReach-v3 (sparse) usando la misma política como línea base.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| A2C | PandaReachDense-v3 | mean_reward | -0.50 +/- 0.10 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con PPO, SAC ni con otras semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política es una MLP pequeña (del orden de decenas de miles de parámetros, aunque el dato exacto no está disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para inferencia; el cuello de botella es la simulación MuJoCo, no la red.
- Cabe en cualquier GPU consumer y en CPU; no requiere aceleración dedicada.
- Opciones de despliegue: stable-baselines3 con PyTorch, exportación a ONNX o TorchScript para servir la política, integración con Gymnasium para evaluación cerrada.
- Latencia y throughput: no disponibles; dependen fundamentalmente del paso de simulación de MuJoCo (típicamente cientos de Hz en CPU) más que de la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Coralfil/rl-pandareachdense | A2C | PandaReachDense-v3 | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| Agentes PPO de panda-gym (referencia de la librería) | PPO | PandaReachDense-v3 | no disponible | no aplica | MIT (panda-gym) | Repositorio qgallouedec/panda-gym |
| Agentes del curso Deep RL de Hugging Face | PPO/A2C | Entornos varios | no disponible | no aplica | según curso | Hugging Face Deep RL Course |

No se dispone de datos de rendimiento comparables publicados para estos agentes en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento débil: mean_reward de -0.50 +/- 0.10 indica que el agente no alcanza de forma fiable el objetivo; no es apto para uso robótico real.
- Métrica no verificada: el resultado del model-index está marcado como `verified: false` y procede únicamente del autor.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue.
- Documentación mínima: no se especifican hiperparámetros, semilla, número de pasos ni configuración de red, lo que dificulta la reproducibilidad.
- Sin evaluación multi-semilla: el intervalo +/- 0.10 sugiere alta varianza y no se reporta el número de episodios evaluados.
- Específico del entorno: la política solo es válida para PandaReachDense-v3 con la misma configuración de observaciones y acciones; no generaliza a otras tareas.
- Riesgo de sobreajuste al entorno de entrenamiento y ausencia de robustez ante perturbaciones (ruido en sensores, cambios de dinámica).
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento multi-paso; cualquier uso fuera de RL es inadecuado.

## Enlaces

- Hugging Face: https://huggingface.co/Coralfil/rl-pandareachdense
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- panda-gym: https://github.com/qgallouedec/panda-gym
- Documentación de A2C en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/a2c.html
