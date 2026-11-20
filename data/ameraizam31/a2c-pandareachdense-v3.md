# ameraizam31/a2c-PandaReachDense-v3

## Resumen

Este repositorio contiene un agente entrenado con el algoritmo A2C (Advantage Actor-Critic) sobre el entorno `PandaReachDense-v3`, una tarea de control robótico de la suite panda-gym en la que un brazo robótico Franka Emika Panda debe alcanzar una posición objetivo en el espacio 3D. El modelo se ha entrenado con la librería stable-baselines3 y se publica en Hugging Face con el formato habitual de esta librería (ficheros `.zip` con los pesos del agente y un `config.json` con los hiperparámetros).

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de aprendizaje por refuerzo profundo, de tamaño muy reducido (el repositorio ocupa 0.0 GB según la información pública), sin licencia declarada ni idiomas asociados. Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento A2C en un entorno de manipulación robótica y como punto de partida para experimentos de RL con panda-gym.

La model card es prácticamente vacía: no incluye código de uso funcional (el bloque de ejemplo contiene `TODO` y placeholders), no documenta hiperparámetros de entrenamiento ni el número de pasos, y el único dato de rendimiento es un `mean_reward` de -0.23 ± 0.07 declarado por el autor y marcado como no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | A2C (Advantage Actor-Critic) con política de red neuronal implementada en stable-baselines3; detalles de capas no disponibles |
| Parametros totales | no disponible (repo de 0.0 GB; el tamaño exacto de la política no se documenta) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pesos de stable-baselines3 (fichero `.zip` con la política y `config.json`), cargables con `huggingface_sb3` |

## Arquitectura y entrenamiento

El agente emplea el algoritmo A2C de stable-baselines3, un método actor-critic síncrono con ventaja (advantage) que actualiza una política estocástica y una función de valor compartiendo o no extractor de características según configuración. La política se entrena sobre observaciones del entorno `PandaReachDense-v3`, que combina el estado de las articulaciones del brazo Panda con la posición del objetivo; la recompensa es densa (basada en la distancia al objetivo), lo que facilita la señal de aprendizaje frente a variantes sparse.

No se documenta en la información disponible el número de pasos de entrenamiento, la composición del dataset (en RL no aplica en el sentido habitual), el uso de normalización de observaciones, el tamaño de la red ni si se aplicaron técnicas como reward shaping adicional, curriculum o múltiples semillas. Tampoco se indica si el resultado publicado corresponde a la mejor semilla o a una media. La ausencia de estos datos impide reproducir el entrenamiento a partir de la model card.

## Capacidades

- Control continuo de un brazo robótico Panda para tareas de alcance (reach) en `PandaReachDense-v3`.
- Política entrenada para un único entorno y una única tarea; no es un agente generalista ni multi-tarea.
- Integración con stable-baselines3: se puede cargar con `load_from_hub` de `huggingface_sb3` y ejecutar con `model.predict(obs)`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües ni modos especiales (thinking, visión, audio).
- No se documentan capacidades de transferencia a otros entornos panda-gym ni a variantes sparse.

## Casos de uso

- Reproducción de experimentos A2C en panda-gym: cargar el agente con `huggingface_sb3` y evaluar el `mean_reward` en `PandaReachDense-v3` para contrastar el valor declarado (-0.23 ± 0.07) con una evaluación propia.
- Baseline de comparación: usar este agente como referencia mínima frente a PPO, SAC o TD3 entrenados sobre el mismo entorno, dado que A2C suele rendir peor en tareas de control continuo con recompensa densa.
- Docencia y tutoriales de RL: ejemplo mínimo de pipeline entrenamiento-publicación en Hugging Face con stable-baselines3, útil para ilustrar el flujo `train → save → push_to_hub`.
- Pruebas de infraestructura de evaluación: validar herramientas de rollout, logging de recompensas y renderizado de entornos panda-gym antes de escalar a experimentos más costosos.
- Punto de partida para fine-tuning: inicializar un agente A2C o PPO desde estos pesos y continuar el entrenamiento con más pasos o con reward shaping adicional.
- Análisis de fallos en manipulación robótica: estudiar trayectorias subóptimas del brazo Panda para diagnosticar problemas de exploración o de escala de recompensa en entornos densos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| A2C | PandaReachDense-v3 | mean_reward | -0.23 +/- 0.07 | No |

No se han publicado en la información disponible resultados comparativos con otros algoritmos (PPO, SAC, TD3) ni curvas de aprendizaje. El valor de recompensa es negativo, coherente con una recompensa densa basada en distancia, pero sin una referencia de recompensa máxima alcanzable no puede interpretarse como éxito o fracaso de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una política A2C para un entorno de bajo dimensionalidad como `PandaReachDense-v3` cabe holgadamente en menos de 1 GB de VRAM, aunque no se publica el tamaño exacto de la red.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también es viable la inferencia en CPU, dado el reducido coste computacional de un `predict` por paso.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de memoria (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), y en CPU sin problema.
- Opciones de despliegue: stable-baselines3 con `huggingface_sb3` para carga desde el Hub; no se documentan exportaciones a ONNX, TorchScript ni TensorRT.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y del bucle de simulación del entorno (PyBullet en panda-gym), no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ameraizam31/a2c-PandaReachDense-v3 | A2C | PandaReachDense-v3 | no disponible | no aplica | mean_reward -0.23 +/- 0.07 (no verificado) | no disponible | Hugging Face |
| Alternativas A2C/PPO en panda-gym | A2C / PPO | PandaReachDense-v3 | no disponible | no aplica | no disponible en la información proporcionada | variable | no disponible |
| Alternativas SAC/TD3 en panda-gym | SAC / TD3 | PandaReachDense-v3 | no disponible | no aplica | no disponible en la información proporcionada | variable | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa queda limitada al algoritmo y al entorno, sin cifras de rendimiento cruzadas.

## Limitaciones y advertencias

- Model card incompleta: el bloque de uso contiene `TODO` y placeholders, por lo que no hay ejemplo funcional de carga ni de evaluación.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o tratar el artefacto como no licenciado para producción.
- Rendimiento no verificado: el `mean_reward` de -0.23 ± 0.07 está marcado como `verified: false` y no se acompaña de curvas de aprendizaje ni de número de pasos.
- Sin datos de entrenamiento: no se documentan hiperparámetros, semillas, normalización ni presupuesto de pasos, lo que impide reproducir el resultado.
- Especialización extrema: el agente solo es válido para `PandaReachDense-v3`; no generaliza a otras tareas, entornos ni variantes sparse.
- Riesgo de sobreajuste al entorno y a la configuración de simulación: cambios en la versión de panda-gym o de PyBullet pueden alterar el comportamiento.
- Sin garantías de robustez: no se documentan evaluaciones con perturbaciones, dominios aleatorizados ni múltiples semillas.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de comportamiento errático fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/a2c-PandaReachDense-v3
- Librería stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- Utilidad huggingface_sb3: https://github.com/huggingface/huggingface_sb3
- Entorno panda-gym (PandaReachDense-v3): https://github.com/qgallouedec/panda-gym
- Documentación de A2C en stable-baselines3: https://stable-baselines3.readthedocs.io/en/master/modules/a2c.html
