# olejanek/ppo-LunarLander-v2-cleanrl

## Resumen

`olejanek/ppo-LunarLander-v2-cleanrl` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v2` de Gymnasium. Lo publica el usuario de Hugging Face `olejanek` como parte del curso de Deep Reinforcement Learning de Hugging Face, y sigue la implementación de referencia de CleanRL. No es un modelo de lenguaje: es una política neuronal que mapea observaciones de 8 dimensiones (posición, velocidad, ángulo y contacto de las patas del módulo de aterrizaje) a 4 acciones discretas (no hacer nada, encender motor izquierdo, encender motor principal, encender motor derecho).

El modelo se entrenó durante 50.000 pasos de entorno con 4 entornos en paralelo, una tasa de aprendizaje de 2,5e-4 con annealing lineal, GAE (lambda 0,95) y recorte de política de 0,2. El resultado declarado es un `mean_reward` de -120,56 ± 47,84, que está por debajo del umbral de resolución del entorno (200 puntos) y también por debajo de la media de referencia de PPO en este entorno tras 1M de pasos. Es, por tanto, un artefacto educativo de un entrenamiento corto, no un agente listo para producción.

Su relevancia es la de un ejemplo canónico de PPO con CleanRL: sirve para reproducir el pipeline, comparar hiperparámetros y entender el efecto del número de timesteps en la recompensa. El repositorio ocupa 0,0 GB (pesos de una MLP pequeña) y no declara licencia ni idiomas, lo que limita su reutilización comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected (MLP) con política y función de valor separadas, entrenada con PPO (clip objective) |
| Parametros totales | no disponible (MLP pequeña; típicamente del orden de decenas de miles de parámetros para LunarLander-v2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la información proporcionada (repo de 0,0 GB; CleanRL suele guardar `state_dict` en `.pt`/`.pth`) |

## Arquitectura y entrenamiento

La política es una MLP que recibe el vector de observación de `LunarLander-v2` (8 valores continuos) y produce logits sobre 4 acciones discretas; la función de valor comparte la misma estructura de red pero con salida escalar. El entrenamiento sigue la implementación de CleanRL de PPO con los siguientes hiperparámetros: `total_timesteps=50000`, `num_envs=4`, `num_steps=128`, `learning_rate=0.00025` con `anneal_lr=True`, `gamma=0.99`, `gae_lambda=0.95`, `num_minibatches=4`, `update_epochs=4`, `norm_adv=True`, `clip_coef=0.2`, `clip_vloss=True`, `ent_coef=0.01`, `vf_coef=0.5`, `max_grad_norm=0.5`, `batch_size=512` y `minibatch_size=128`. La semilla es 1 y `torch_deterministic=True`.

No se documenta composición de dataset (no aplica: el "dataset" es el propio simulador), ni RLHF/DPO, ni innovaciones técnicas más allá del PPO estándar con GAE y normalización de ventajas. El número de timesteps es bajo para este entorno: la referencia habitual de CleanRL usa 1M de pasos para alcanzar recompensas cercanas a 200, por lo que 50k pasos explica en gran medida el rendimiento negativo reportado.

## Capacidades

- Control de política discreta en `LunarLander-v2`: selecciona entre 4 acciones (noop, motor izquierdo, motor principal, motor derecho) a partir de observaciones continuas de 8 dimensiones.
- Aprendizaje por refuerzo on-policy con PPO: política estocástica entrenada con objective recortado y ventajas normalizadas.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle de interacción con el entorno de Gymnasium.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión ni audio.
- No es un modelo de propósito general: su única tarea es la política entrenada para este entorno concreto.

## Casos de uso

- Reproducción educativa del curso de Deep RL de Hugging Face: sirve como checkpoint de referencia para comparar la implementación propia de PPO con la de CleanRL en `LunarLander-v2`.
- Análisis del efecto del presupuesto de entrenamiento: con 50k timesteps y una recompensa de -120,56, es un punto de comparación útil para estudiar la curva de aprendizaje frente a ejecuciones de 1M de pasos.
- Depuración de pipelines de RL: al fijar `seed=1` y `torch_deterministic=True`, permite reproducir exactamente una ejecución y aislar fallos en el bucle de entrenamiento o en la vectorización de entornos.
- Docencia sobre hiperparámetros de PPO: los valores declarados (`clip_coef`, `gae_lambda`, `ent_coef`, `num_minibatches`) permiten experimentar con ablaciones controladas.
- Prueba de integración con herramientas de RL: cargar el `state_dict` en un runner de CleanRL o en un evaluador propio para validar el formato de pesos y la interfaz de la política.
- Baseline negativo en experimentos: usar su recompensa declarada como cota inferior al comparar variantes de PPO, curricula o recompensas shaping en `LunarLander-v2`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | -120,56 ± 47,84 |

No se han publicado otros resultados de benchmarks en la información disponible. No se dispone de comparaciones con otros checkpoints en el mismo repositorio ni de curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la política es una MLP pequeña y las observaciones son vectores de 8 dimensiones.
- GPU recomendadas: cualquier GPU con CUDA disponible; el propio autor entrenó con `cuda=True`. Una RTX 3060 o superior es más que suficiente, y la CPU también es viable para inferencia.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte de PyTorch.
- Opciones de despliegue: PyTorch nativo cargando el `state_dict` de CleanRL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: no disponibles. Para una MLP de este tamaño, la latencia por paso de inferencia en GPU es del orden de microsegundos, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Timesteps | mean_reward declarado | Licencia |
|---|---|---|---|---|---|
| olejanek/ppo-LunarLander-v2-cleanrl | LunarLander-v2 | PPO (CleanRL) | 50.000 | -120,56 ± 47,84 | no disponible |
| Checkpoints de referencia de CleanRL para LunarLander-v2 | LunarLander-v2 | PPO (CleanRL) | 1.000.000 (configuración habitual) | no disponible en esta información | MIT (código CleanRL) |
| Otros agentes PPO de la comunidad en Hugging Face | LunarLander-v2 | PPO | variable | no disponible | variable |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; la comparación con CleanRL se basa en la configuración pública del repositorio, no en una medición propia.

## Limitaciones y advertencias

- Rendimiento insuficiente para resolver el entorno: -120,56 está lejos del umbral de 200 que se considera resuelto en `LunarLander-v2`, y por debajo de lo esperable con 1M de pasos.
- Entrenamiento corto: 50.000 timesteps frente a los 1M habituales; la política probablemente no ha convergido.
- Sesgos: no aplica en el sentido de sesgos sociales, pero la política puede presentar comportamiento degenerado (por ejemplo, no aterrizar nunca) por la recompensa negativa.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica; el dominio está restringido a `LunarLander-v2`.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- `verified: false` en el model-index: la métrica no ha sido validada de forma independiente.
- Repositorio de 0,0 GB: conviene comprobar que los pesos están efectivamente subidos antes de intentar cargarlos.
- No apto para producción: es un artefacto educativo, no un agente con garantías de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/olejanek/ppo-LunarLander-v2-cleanrl
- CleanRL (implementación de referencia): https://github.com/vwxyzjn/cleanrl
- Curso de Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Paper de PPO: https://arxiv.org/abs/1707.06347
