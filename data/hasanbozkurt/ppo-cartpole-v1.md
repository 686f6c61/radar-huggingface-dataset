# HasanBozkurt/ppo-CartPole-v1

## Resumen

`HasanBozkurt/ppo-CartPole-v1` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Proximal Policy Optimization (PPO) para resolver el entorno clásico `CartPole-v1` de Gym/Gymnasium. Lo desarrolla el usuario HasanBozkurt como artefacto de aprendizaje dentro de la Unidad 8 del curso de Deep Reinforcement Learning de Hugging Face, siguiendo una implementación escrita desde cero basada en CleanRL. No es un modelo de lenguaje ni un modelo fundacional: es una política neuronal pequeña que mapea observaciones del entorno (posición y velocidad del carro, ángulo y velocidad angular del poste) a acciones discretas (empujar a izquierda o derecha).

El modelo se entrenó durante 25 000 pasos de entorno con cuatro entornos paralelos, un learning rate de 0,00025 con decaimiento lineal, GAE (gamma 0,99, lambda 0,95) y recorte de política con coeficiente 0,2. El resultado declarado es una recompensa media de 108,40 ± 34,83 en `CartPole-v1`, una cifra modesta que queda por debajo del umbral de resolución del entorno (500 pasos) y que sugiere un entrenamiento corto más orientado a la demostración pedagógica que al rendimiento máximo.

Su relevancia es, por tanto, educativa y de referencia: sirve como ejemplo reproducible de un pipeline PPO completo (recolección de rollouts, cálculo de ventajas, actualización con clipping, logging) y como punto de partida para quien quiera experimentar con hiperparámetros de RL. No debe confundirse con un modelo generativo: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni agentes conversacionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor (actor-critic) entrenada con PPO; topología exacta no disponible |
| Parámetros totales | no disponible (repo de 0,0 GB; el checkpoint no se detalla en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 4 dimensiones en CartPole-v1) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,0 GB; presumiblemente checkpoint de PyTorch, sin confirmar) |

Otros hiperparámetros declarados por el autor:

| Hiperparámetro | Valor |
|---|---|
| Entorno | CartPole-v1 |
| Algoritmo | PPO (implementación propia basada en CleanRL) |
| Learning rate | 0,00025 (con anneal_lr activado) |
| Total de timesteps | 25 000 |
| Número de entornos | 4 |
| num_steps | 128 |
| batch_size | 512 |
| minibatch_size | 128 |
| num_minibatches | 4 |
| update_epochs | 4 |
| gamma | 0,99 |
| gae_lambda | 0,95 |
| clip_coef | 0,2 |
| ent_coef | 0,01 |
| vf_coef | 0,5 |
| max_grad_norm | 0,5 |
| norm_adv | True |
| clip_vloss | True |
| target_kl | None |
| seed | 1 |
| torch_deterministic | True |
| cuda | False |
| capture_video | False |
| track | False |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-critic estándar de PPO: una red de política que produce la distribución sobre las dos acciones discretas de `CartPole-v1` y una red de valor que estima el retorno esperado desde cada estado. La implementación es "from scratch" siguiendo CleanRL, con recolección de rollouts en cuatro entornos paralelos, cálculo de ventajas mediante Generalized Advantage Estimation (GAE con lambda 0,95), normalización de ventajas y actualización con recorte de la ratio de política (clip_coef 0,2). Se aplica decaimiento lineal del learning rate y recorte de la pérdida de valor (clip_vloss).

El entrenamiento se limita a 25 000 timesteps totales, una cifra muy inferior a la que suele necesitar PPO para resolver `CartPole-v1` de forma consistente (típicamente cientos de miles de pasos). No se menciona uso de datos externos, RLHF ni DPO, algo que no aplica a este dominio. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés técnico reside en la reproducibilidad del pipeline y en la fijación de semilla (`seed: 1`, `torch_deterministic: True`).

## Capacidades

- Control de políticas en el entorno `CartPole-v1`: selecciona acciones discretas (izquierda/derecha) a partir de observaciones de 4 dimensiones.
- Aprendizaje por refuerzo con PPO: implementación completa de recolección de rollouts, GAE, clipping y actualización actor-critic.
- Reproducibilidad: semilla fija y modo determinista de PyTorch declarados.
- Registro de métricas: el autor declara integración con TensorBoard (tag `tensorboard`) y soporte de Weights & Biases en el código (aunque `track: False` en este entrenamiento).
- No soporta tool calling, function calling, agentes multi-paso conversacionales, capacidades multilingües, visión, audio ni modo de razonamiento. No es un modelo de lenguaje.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el checkpoint como ejemplo resuelto de la Unidad 8 del curso de Deep RL de Hugging Face para explicar el flujo completo de PPO paso a paso.
- Reproducción de experimentos: partir de los hiperparámetros declarados (learning rate 0,00025, 25 000 timesteps, 4 entornos) para replicar el resultado de 108,40 ± 34,83 y estudiar la varianza entre semillas.
- Ajuste de hiperparámetros: comparar el efecto de aumentar `total_timesteps`, modificar `clip_coef` o cambiar `num_envs` sobre la recompensa media en `CartPole-v1`.
- Base para extensiones a entornos discretos similares: reutilizar la estructura actor-critic y el bucle de entrenamiento en `Acrobot-v1` o `MountainCar-v0`, adaptando la dimensionalidad de observación y acción.
- Pruebas de infraestructura de RL: validar pipelines de logging (TensorBoard, W&B), gestión de checkpoints y ejecución determinista en CPU (`cuda: False`).
- Referencia comparativa de implementaciones: contrastar esta implementación propia frente a CleanRL o Stable-Baselines3 en términos de recompensa alcanzada y coste de entrenamiento.
- Material para análisis de fallos: estudiar por qué 25 000 timesteps no bastan para resolver `CartPole-v1` y qué curvas de aprendizaje se observan con esa configuración.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| PPO | CartPole-v1 | mean_reward | 108,40 ± 34,83 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con CleanRL, Stable-Baselines3 ni otras implementaciones en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del entorno (observación de 4 dimensiones, dos acciones) el modelo es extremadamente pequeño y cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; el autor entrenó con `cuda: False`, es decir, en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un agente de RL y no un modelo generativo, no aplican vLLM, llama.cpp, Ollama ni TGI. El despliegue típico es cargar el checkpoint en PyTorch y ejecutar el bucle de inferencia contra el entorno `CartPole-v1` de Gym/Gymnasium.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del entorno, la inferencia por paso es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HasanBozkurt/ppo-CartPole-v1 | PPO (implementación propia) | CartPole-v1 | 108,40 ± 34,83 | no disponible | Hugging Face |
| CleanRL PPO CartPole | PPO (CleanRL) | CartPole-v1 | no disponible en la información proporcionada | MIT (habitual en CleanRL, no confirmado aquí) | GitHub / Hugging Face |
| Stable-Baselines3 PPO CartPole | PPO (SB3) | CartPole-v1 | no disponible en la información proporcionada | MIT (habitual en SB3, no confirmado aquí) | GitHub |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada; la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Rendimiento limitado: la recompensa media de 108,40 ± 34,83 está muy por debajo del umbral de resolución de `CartPole-v1` (500 pasos), lo que indica que la política no es robusta ni óptima.
- Entrenamiento corto: 25 000 timesteps es una cifra reducida para PPO en este entorno; es probable que el agente falle en episodios largos o con condiciones iniciales distintas.
- Varianza alta: la desviación típica de ±34,83 sobre una media de 108,40 refleja una política inestable entre episodios.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del checkpoint; conviene contactar con el autor antes de reutilizarlo en producción.
- Sin verificación: el resultado del `model-index` está marcado como `verified: false`; no ha sido validado de forma independiente.
- Dominio restringido: solo aplica a `CartPole-v1`; no generaliza a otros entornos sin reentrenamiento.
- Sin documentación de arquitectura: la topología exacta de las redes actor y crítica no se detalla en la model card.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no aplica al no ser un modelo de lenguaje, pero tampoco se documenta nada al respecto.
- Repositorio vacío o casi vacío: 0,0 GB de tamaño, lo que puede indicar que los pesos no están subidos o que el artefacto es solo la model card; verificar antes de intentar cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanBozkurt/ppo-CartPole-v1
- Curso de Deep Reinforcement Learning de Hugging Face (Unidad 8, referencia citada por el autor): https://huggingface.co/learn/deep-rl-course/unit8/introduction
- CleanRL (implementación de referencia citada): https://github.com/vwxyzjn/cleanrl
- Entorno CartPole-v1 en Gymnasium: https://gymnasium.farama.org/environments/classic_control/cart_pole/
- Documentación de TensorBoard: https://www.tensorflow.org/tensorboard
