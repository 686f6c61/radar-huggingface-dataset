# ameraizam31/ppo-scratch-LunarLander-v2

## Resumen

`ppo-scratch-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con Proximal Policy Optimization (PPO) sobre el entorno LunarLander-v2 de Gymnasium. Lo publica el usuario ameraizam31 como artefacto del curso Deep RL de Hugging Face (Unidad 8), con una implementación de PPO escrita desde cero al estilo CleanRL, es decir, un único fichero con el bucle de entrenamiento explícito en lugar de recurrir a Stable-Baselines3 u otras librerías de alto nivel.

No se trata de un modelo de lenguaje ni de un transformer: es una política neuronal que mapea observaciones de 8 dimensiones del entorno (posición, velocidad, ángulo, contacto con el suelo y estado de las patas) a una de las 4 acciones discretas del lander (no hacer nada, encender motor principal, encender motor izquierdo, encender motor derecho). El repositorio tiene 0.0 GB, por lo que el artefacto publicado es mínimo.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de una implementación PPO funcional y de los hiperparámetros canónicos del curso. No está pensado para producción ni para tareas fuera del entorno LunarLander-v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor (MLP) entrenada con PPO; arquitectura exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo actor-crítico con recorte de la ratio de probabilidad (`clip_coef = 0.2`) para limitar la magnitud de las actualizaciones de política. La implementación sigue el estilo CleanRL: bucle de entrenamiento monolítico, cálculo de ventajas con Generalized Advantage Estimation (`gae = True`, `gamma = 0.99`, `gae_lambda = 0.95`), normalización de ventajas (`norm_adv = True`) y recorte también de la pérdida de valor (`clip_vloss = True`). Se usan 4 entornos vectorizados en paralelo, 128 pasos por entorno (batch de 512), 4 minibatches de 128 muestras y 4 épocas de actualización por iteración.

Hiperparámetros declarados por el autor: `total_timesteps = 500000`, `learning_rate = 0.00025` con annealing activado, `ent_coef = 0.01`, `vf_coef = 0.5`, `max_grad_norm = 0.5`, semilla `seed = 1` y `target_kl = None`. No se especifica la composición del dataset (en RL no aplica), ni el número de capas u horas de la red, ni detalles sobre inicialización o normalización de observaciones más allá de lo indicado.

## Capacidades

- Control discreto en el entorno LunarLander-v2: selecciona entre 4 acciones (noop, motor principal, motor izquierdo, motor derecho) a partir de observaciones de 8 dimensiones.
- Aprendizaje por refuerzo con PPO: política estocástica entrenada con recorte de ratio y GAE.
- Reproducibilidad del entrenamiento: hiperparámetros y semilla documentados en la model card.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo thinking; no es un modelo generativo de texto.
- No se declaran capacidades adicionales fuera del entorno de entrenamiento.

## Casos de uso

- Docencia y estudio de PPO: sirve como referencia de una implementación desde cero con hiperparámetros canónicos para comparar contra Stable-Baselines3 o CleanRL en ejercicios de la Unidad 8 del curso.
- Reproducción de experimentos: la semilla (`seed = 1`) y el conjunto completo de hiperparámetros permiten replicar el entrenamiento y analizar la varianza entre ejecuciones.
- Análisis de curvas de aprendizaje: con 500 000 timesteps y `anneal_lr = True`, permite estudiar la evolución de la recompensa media y la estabilidad del entrenamiento.
- Punto de partida para ablaciones: modificar `clip_coef`, `ent_coef` o `gae_lambda` y medir el impacto en la recompensa media sobre LunarLander-v2.
- Integración en pipelines de evaluación de RL: cargar la política entrenada y ejecutarla en el entorno para generar rollouts y métricas de evaluación.
- Comparación de algoritmos en entornos de control continuo/discreto de bajo coste: usar el agente como baseline PPO frente a otros algoritmos (A2C, DQN) en el mismo entorno.
- No es adecuado para aplicaciones de producción fuera de LunarLander-v2 ni para tareas de NLP, visión o generación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | 13.64 +/- 101.11 |

La desviación típica de ±101.11 es muy superior a la media, lo que indica una alta varianza entre episodios y sugiere que la política no ha convergido a un comportamiento estable. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se especifica el tamaño de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible; para una política MLP de este tipo, cualquier GPU consumer sería suficiente en principio, pero no hay datos confirmados.
- Cabe en GPU consumer: probablemente sí, dado que el artefacto publicado ocupa 0.0 GB, aunque no se confirma en la información disponible.
- Opciones de despliegue: no se documentan; al ser un agente de RL, requeriría cargar los pesos en PyTorch y ejecutar el bucle de inferencia sobre el entorno Gymnasium.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppo-scratch-LunarLander-v2 | no disponible | no aplica | mean_reward 13.64 +/- 101.11 (no verificado) | no disponible | Hugging Face |
| Agentes PPO de referencia del Deep RL Course | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Implementaciones CleanRL de PPO en LunarLander-v2 | no disponible | no aplica | no disponible | MIT (CleanRL, no confirmado para este artefacto) | GitHub |

No se dispone de datos comparativos verificables en la información proporcionada; la comparativa anterior es orientativa y no debe interpretarse como una evaluación cuantitativa.

## Limitaciones y advertencias

- Varianza muy elevada: la desviación típica (±101.11) supera con creces la media (13.64), lo que apunta a una política inestable o insuficientemente entrenada.
- Entrenamiento limitado a 500 000 timesteps con una única semilla; no hay evidencia de convergencia ni de robustez.
- Métrica no verificada (`verified: false`): el resultado procede únicamente de la model card del autor.
- Ámbito restringido: solo válido para LunarLander-v2; no generaliza a otros entornos ni tareas.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Sin información sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- No apto para producción: es un artefacto didáctico sin documentación de robustez, evaluación externa ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameraizam31/ppo-scratch-LunarLander-v2
- Curso Deep RL de Hugging Face (Unidad 8, contexto del entrenamiento): https://huggingface.co/learn/deep-rl-course
- CleanRL (referencia de estilo de implementación): https://github.com/vwxyzjn/cleanrl
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
