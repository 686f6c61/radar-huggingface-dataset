# d-svitov/LunarLander-v2

## Resumen

`d-svitov/LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v2` de Gymnasium. Lo publica el usuario d-svitov en Hugging Face como parte de un curso de deep reinforcement learning, con una implementación propia basada en los hiperparámetros de referencia de CleanRL. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que mapea observaciones de 8 dimensiones del entorno a una de las 4 acciones discretas disponibles (no hacer nada, encender motor principal, encender motor lateral izquierdo, encender motor lateral derecho).

El modelo se entrenó durante 50.000 timesteps con 4 entornos en paralelo, learning rate de 0,00025, GAE con lambda 0,95, clipping de 0,2 y 4 épocas de actualización por iteración. El resultado declarado es un `mean_reward` de -180,68 ± 72,58, lo que indica que la política no llega a resolver el entorno de forma consistente (el umbral habitual de resolución de LunarLander-v2 es 200 de recompensa media en 100 episodios). Es, por tanto, un artefacto de aprendizaje y experimentación más que un agente listo para producción.

Su relevancia es limitada fuera del ámbito docente: sirve como ejemplo reproducible de un pipeline PPO con CleanRL, como baseline para comparar hiperparámetros y como caso práctico de los problemas típicos de entrenamiento (presupuesto insuficiente de timesteps, varianza alta entre episodios). El repositorio ocupa 0,0 GB y no incluye información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (PPO), implementación propia inspirada en CleanRL; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno con observaciones de 8 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; presumiblemente pesos PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-crítico de PPO con una red neuronal que produce logits de política y una estimación de valor del estado. La implementación es propia (`custom-implementation`) dentro del marco del curso de deep RL, y los hiperparámetros coinciden con la configuración de referencia de CleanRL para `LunarLander-v2`: `total_timesteps=50000`, `learning_rate=0.00025`, `num_envs=4`, `num_steps=128`, `gamma=0.99`, `gae_lambda=0.95`, `clip_coef=0.2`, `ent_coef=0.01`, `vf_coef=0.5`, `max_grad_norm=0.5`, `num_minibatches=4`, `update_epochs=4`, `batch_size=512` y `minibatch_size=128`. Se activan `anneal_lr`, `norm_adv` y `clip_vloss`; `target_kl` queda desactivado.

El entrenamiento se ejecutó con semilla 1, `torch_deterministic=True` y `cuda=True`, sin tracking en Weights & Biases (`track=False`) y sin captura de vídeo. No se documenta la composición del dataset (en RL no aplica en el sentido supervisado), ni si hubo ajuste fino posterior, ni la arquitectura exacta de las capas ocultas. La innovación técnica destacable es mínima: se trata de una reproducción estándar de PPO con GAE, advantage normalization y clipping de la pérdida de valor, sin decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Control de un agente en el entorno `LunarLander-v2` de Gymnasium: recibe observaciones de 8 dimensiones (posición, velocidad, ángulo, velocidad angular, contacto con el suelo en dos patas) y emite una de 4 acciones discretas.
- Aprendizaje por refuerzo con PPO: política estocástica entrenada con ventaja generalizada (GAE) y clipping.
- Reproducibilidad: semilla fija, modo determinista de PyTorch y configuración de hiperparámetros explícita.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle de interacción con el entorno.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Integración con TensorBoard para registro de métricas (tag `tensorboard`).

## Casos de uso

- Docencia de PPO: usar el agente como ejemplo reproducible en un curso de deep RL para ilustrar el bucle de recolección de rollouts, cálculo de ventajas y actualización con clipping, con hiperparámetros idénticos a CleanRL.
- Baseline de comparación: servir de referencia para medir el efecto de cambiar `total_timesteps`, `learning_rate` o `num_envs` en la recompensa media de `LunarLander-v2`, dado que el resultado declarado (-180,68 ± 72,58) deja margen claro de mejora.
- Depuración de pipelines de RL: al ser un entorno pequeño y rápido de entrenar, permite validar infraestructura (CUDA, TensorBoard, gestión de semillas) antes de escalar a entornos más costosos.
- Estudio de varianza y estabilidad: la desviación típica de 72,58 en la recompensa media es útil para analizar la sensibilidad del algoritmo a la semilla y al presupuesto de entrenamiento.
- Pruebas de integración con Gymnasium: verificar la compatibilidad de un wrapper o de una versión concreta de Gymnasium contra un agente ya entrenado.
- Experimentos de currículo o reward shaping: partir de esta política y aplicar modificaciones en la función de recompensa para observar el impacto en el aprendizaje, con un coste computacional bajo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | -180,68 ± 72,58 |

No se han publicado otros resultados de benchmarks en la información disponible. El valor está muy por debajo del umbral habitual de resolución del entorno (200 de recompensa media en 100 episodios), lo que sugiere un presupuesto de entrenamiento insuficiente (50.000 timesteps) o una política que no ha convergido.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del entorno y del repo (0,0 GB), el modelo es extremadamente pequeño y cabe holgadamente en cualquier GPU consumer, e incluso en CPU para inferencia.
- GPU recomendadas: cualquier GPU con soporte CUDA (el autor entrenó con `cuda=True`); no se especifica modelo concreto. Una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU para inferencia y para entrenamiento a pequeña escala.
- Opciones de despliegue: inferencia directa con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL de este tipo).
- Latencia y throughput: no disponibles; al tratarse de una red pequeña, la latencia por paso debería ser de microsegundos a milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Timesteps | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d-svitov/LunarLander-v2 | PPO (implementación propia) | LunarLander-v2 | 50.000 | -180,68 ± 72,58 | no disponible | Hugging Face |
| CleanRL PPO LunarLander | PPO (referencia) | LunarLander-v2 | 50.000 (config. por defecto) | no disponible en esta ficha | MIT (CleanRL) | GitHub |
| Stable-Baselines3 PPO | PPO (referencia) | LunarLander-v2 | variable | no disponible en esta ficha | MIT | GitHub / PyPI |

No se dispone de resultados comparables verificados en la información proporcionada para CleanRL ni Stable-Baselines3 en este entorno concreto; se citan como alternativas de la misma categoría por su uso habitual como referencia. Cualquier comparación numérica requeriría ejecutar los entrenamientos con la misma semilla y presupuesto.

## Limitaciones y advertencias

- Rendimiento insuficiente: el `mean_reward` declarado (-180,68 ± 72,58) está lejos del umbral de resolución del entorno (200), por lo que el agente no es fiable para demostraciones de vuelo controlado.
- Varianza alta: la desviación típica de 72,58 indica una gran inestabilidad entre episodios y semillas.
- Sesgos conocidos: no documentados; en RL, el sesgo proviene de la distribución de estados visitados durante el entrenamiento y de la función de recompensa del entorno.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de generalización incorrecta a estados no vistos.
- Limitaciones de contexto o idioma: no aplica; el modelo solo opera sobre observaciones de 8 dimensiones de `LunarLander-v2`.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Caveat para producción: no es un modelo de propósito general; su uso en producción requeriría reentrenamiento con más timesteps, evaluación con múltiples semillas y verificación de la licencia.
- Repo de 0,0 GB: conviene verificar que los pesos estén realmente incluidos y en qué formato antes de intentar cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/d-svitov/LunarLander-v2
- CleanRL (referencia de hiperparámetros): https://github.com/vwxyzjn/cleanrl
- Gymnasium LunarLander-v2: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Stable-Baselines3 (alternativa de referencia): https://github.com/DLR-RM/stable-baselines3
- TensorBoard: https://www.tensorflow.org/tensorboard
