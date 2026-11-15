# HasanBozkurt/ppo-LunarLander-v2

## Resumen

`HasanBozkurt/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno `LunarLander-v2` de Gymnasium. Lo publica el usuario HasanBozkurt en Hugging Face como parte del curso de Deep Reinforcement Learning de Hugging Face (Unidad 8), siguiendo una implementación propia inspirada en CleanRL. No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que mapea observaciones del entorno (8 dimensiones) a acciones discretas de control del módulo de aterrizaje.

El interés de esta ficha es acotado: se trata de un artefacto educativo y reproducible, útil como referencia para quien quiera entender el flujo de entrenamiento PPO con CleanRL, la configuración de hiperparámetros y el proceso de publicación en el Hub con `model-index`. El resultado declarado por el autor es un `mean_reward` de -208,45 ± 90,38, es decir, un rendimiento por debajo del umbral de resolución del entorno (200 puntos) y con alta varianza, lo que sugiere un entrenamiento incompleto o inestable.

No se dispone de información sobre licencia, idiomas, arquitectura de red detallada ni tamaño del repositorio (0.0 GB en el momento de la consulta), por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones de 8 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0.0 GB; presumiblemente `pytorch_model.bin` o similar, no confirmado) |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidades (`clip_coef: 0.2`) y ventaja generalizada (`gae: True`, `gamma: 0.99`, `gae_lambda: 0.95`). La implementación es propia, escrita desde cero siguiendo CleanRL, con 16 entornos vectorizados, `num_steps: 1024` por rollout, `batch_size: 16384`, `minibatch_size: 4096`, 4 épocas de actualización por iteración y normalización de ventajas (`norm_adv: True`). Se aplica annealing del learning rate (`anneal_lr: True`) partiendo de `0.00025`, clipping de la pérdida de valor (`clip_vloss: True`), coeficiente de entropía `0.01`, coeficiente de valor `0.5` y `max_grad_norm: 0.5`.

El entrenamiento se ejecutó durante `total_timesteps: 1000000` con semilla 1 y modo determinista (`torch_deterministic: True`), en CPU (`cuda: False`) y sin seguimiento en WandB (`track: False`). No se documenta la composición del dataset (en RL no aplica), ni el número de parámetros de la red, ni si hubo ajuste fino posterior. La innovación técnica es la propia implementación limpia de PPO con GAE y clipping, sin aportaciones adicionales.

## Capacidades

- Control de un módulo de aterrizaje en el entorno `LunarLander-v2` mediante acciones discretas (no hacer nada, encender motor izquierdo, principal o derecho).
- Aprendizaje de política con PPO y ventaja generalizada (GAE) sobre observaciones continuas de 8 dimensiones.
- Reproducibilidad del pipeline de entrenamiento CleanRL con semilla fija y modo determinista.
- Publicación en el Hub con `model-index` para trazabilidad de resultados.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Reproducción educativa del entrenamiento PPO: sirve como referencia para comparar hiperparámetros y curvas de recompensa en la Unidad 8 del curso de Deep RL de Hugging Face.
- Baseline de comparación en experimentos de RL: permite contrastar variantes de PPO (con y sin GAE, distintos `clip_coef` o `ent_coef`) sobre el mismo entorno y semilla.
- Depuración de pipelines CleanRL: el repositorio documenta todos los hiperparámetros, lo que facilita aislar problemas de vectorización (`num_envs: 16`) o de tamaño de minibatch.
- Docencia de RL: ejemplo mínimo de agente que no requiere GPU (`cuda: False`) y que se entrena en CPU en un tiempo acotado.
- Prueba de integración con `stable-baselines3` o `cleanrl`: útil para validar la carga de políticas PPO y la evaluación con `mean_reward` en `LunarLander-v2`.
- Referencia para publicación en el Hub: muestra el formato de `model-index` con métricas no verificadas (`verified: false`), útil como plantilla para otros agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | -208,45 ± 90,38 |

No se han publicado otros resultados de benchmarks en la información disponible. El valor negativo indica que el agente no alcanza el umbral de resolución del entorno (200 puntos en la media de 100 episodios) y presenta una desviación estándar muy elevada, señal de inestabilidad.

## Requisitos de hardware

- VRAM estimada: no disponible; el entrenamiento se realizó en CPU (`cuda: False`) y el repositorio ocupa 0.0 GB, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para inferencia de una política pequeña.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con soporte PyTorch, aunque no se documenta el tamaño exacto del modelo.
- Opciones de despliegue: PyTorch nativo, `stable-baselines3`, `cleanrl` o `gymnasium` para evaluación; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HasanBozkurt/ppo-LunarLander-v2 | LunarLander-v2 | PPO (CleanRL) | -208,45 ± 90,38 | no disponible | Hugging Face |
| Agentes PPO de referencia del curso Deep RL de Hugging Face | LunarLander-v2 | PPO (CleanRL) | no disponible en esta ficha | no disponible | Hugging Face |
| Políticas de `stable-baselines3` para LunarLander-v2 | LunarLander-v2 | PPO | no disponible en esta ficha | MIT (SB3) | PyPI / GitHub |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa anterior es orientativa y no debe interpretarse como una evaluación de rendimiento relativo.

## Limitaciones y advertencias

- Rendimiento insuficiente: `mean_reward` de -208,45 ± 90,38, por debajo del umbral de resolución de `LunarLander-v2` (200) y con alta varianza.
- Entrenamiento en CPU y sin seguimiento (`track: False`), lo que dificulta auditar la curva de aprendizaje.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución.
- Repositorio de 0.0 GB: no se confirma la presencia de pesos en el momento de la consulta; verificar antes de descargar.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni capacidades multilingües.
- Métrica no verificada (`verified: false`): el resultado procede del propio autor y no ha sido validado por un tercero.
- Sesgos y alucinaciones: no aplican en el sentido habitual; el riesgo es de sobreajuste al entorno y de varianza alta entre episodios.
- Sin información sobre la arquitectura de la red (capas, activaciones, tamaño), lo que limita la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanBozkurt/ppo-LunarLander-v2
- Curso Deep RL de Hugging Face (Unidad 8, PPO): https://huggingface.co/learn/deep-rl-course/unit8/introduction
- CleanRL (implementación de referencia): https://github.com/vwxyzjn/cleanrl
- Entorno LunarLander-v2 (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Documentación de `model-index` en Hugging Face: https://huggingface.co/docs/hub/model-cards
