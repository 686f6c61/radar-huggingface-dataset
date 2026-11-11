# janvi-ai/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

El modelo `janvi-ai/dqn-SpaceInvadersNoFrameskip-v4` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Deep Q-Network (DQN) sobre el entorno `SpaceInvadersNoFrameskip-v4` de Atari. Lo desarrolla el usuario `janvi-ai` utilizando la librería Stable Baselines3 (SB3) y el framework RL Zoo, ambos mantenidos por el grupo DLR-RM. No se trata de un modelo de lenguaje ni de un modelo generativo: es una política convolutional que mapea observaciones visuales del juego a acciones discretas.

El agente resuelve una tarea concreta de control desde píxeles: jugar a Space Invaders a partir de fotogramas RGB apilados. Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL con SB3, incluyendo entrenamiento, evaluación y publicación en el Hub. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en el formato nativo de Stable Baselines3 (archivo `.zip` con los pesos de la `CnnPolicy`).

La información pública es muy limitada: no se declaran licencia, idiomas ni resultados de benchmarks verificados. El autor reporta una recompensa media de 252,00 ± 24,00 en el entorno de evaluación, con un entrenamiento de solo 30.000 pasos, lo que sitúa al agente lejos de los resultados de referencia de la literatura para Atari.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con política convolucional (`CnnPolicy`) sobre observaciones de píxeles |
| Parametros totales | no disponible (no se publica el recuento de parámetros de la red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es una pila de 4 fotogramas) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en el formato nativo de SB3) |
| Idiomas soportados | no disponible (no aplica; el entorno no contiene texto) |
| Licencia | no disponible |
| Formato de pesos | archivo `.zip` de Stable Baselines3 (política `CnnPolicy` serializada) |

## Arquitectura y entrenamiento

El agente emplea el algoritmo DQN clásico con una red Q convolucional (`CnnPolicy`) que procesa observaciones de 84x84 píxeles en escala de grises, apiladas en 4 fotogramas consecutivos (`frame_stack: 4`). El preprocesado se realiza mediante `AtariWrapper`, que aplica recorte, conversión a escala de grises, redimensionado y repetición de acciones. Los hiperparámetros declarados son: `learning_rate` de 1e-4, `buffer_size` de 100.000 transiciones, `batch_size` de 32, `train_freq` de 4, `gradient_steps` de 1, `target_update_interval` de 1.000, `exploration_fraction` de 0,1 con `exploration_final_eps` de 0,01 y `learning_starts` de 10.000. La actualización de la red objetivo es dura (hard update) cada 1.000 pasos.

El entrenamiento es notablemente corto: `n_timesteps` de 30.000, muy por debajo de los millones de pasos habituales en DQN para Atari. No se documenta el uso de doble Q-learning, prioritized experience replay ni dueling networks, y no se especifica el número de semillas ni la composición exacta del proceso de evaluación. El entorno se configura con `render_mode: 'rgb_array'`. El agente se entrenó y publicó con RL Zoo, lo que garantiza reproducibilidad mediante los comandos `rl_zoo3.train` y `rl_zoo3.push_to_hub`.

## Capacidades

- Control desde píxeles: aprende una política de juego directamente a partir de observaciones visuales, sin ingeniería manual de características.
- Juego de Space Invaders: selecciona acciones discretas del espacio de acciones del entorno `SpaceInvadersNoFrameskip-v4`.
- Reproducibilidad: el pipeline completo (entrenamiento, carga y evaluación) está documentado y es ejecutable con `rl_zoo3`.
- Integración con Stable Baselines3: compatible con las utilidades de carga, evaluación y grabación de vídeo de SB3 y RL Zoo.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No es un modelo de propósito general: su competencia se limita al entorno para el que fue entrenado.

## Casos de uso

- Docencia y formación en RL: sirve como ejemplo mínimo y reproducible de un agente DQN entrenado con SB3, útil para explicar el flujo de trabajo completo desde el entorno hasta la publicación en el Hub.
- Pruebas de integración de RL Zoo: permite validar instalaciones de `rl_zoo3`, SB3 y SB3-Contrib mediante los comandos `load_from_hub` y `enjoy` sin necesidad de entrenar desde cero.
- Prototipado de pipelines de evaluación: útil para comprobar la infraestructura de evaluación de agentes Atari (métricas de recompensa media, grabación de vídeo con `render_mode: 'rgb_array'`).
- Baseline de referencia para comparaciones internas: al ser un agente de 30.000 pasos, sirve como cota inferior frente a entrenamientos más largos o variantes como Double DQN o PPO.
- Reproducción de experimentos: permite replicar exactamente los hiperparámetros declarados y estudiar el efecto de modificarlos (por ejemplo, aumentar `n_timesteps` o activar `optimize_memory_usage`).
- Demostraciones de despliegue en el Hub: ejemplo de publicación de artefactos de RL con metadatos `model-index` y comandos de carga desde el repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset / entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | SpaceInvadersNoFrameskip-v4 | Mean reward | 252,00 ± 24,00 |

No se han publicado otros resultados de benchmarks en la información disponible. No se dispone de comparaciones verificadas con agentes de referencia de la literatura para Atari.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la política convolucional es pequeña y cabe holgadamente en cualquier GPU consumer. No se dispone de una cifra exacta de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer reciente; también puede ejecutarse en CPU sin problema apreciable para una sola partida.
- Opciones de despliegue: Stable Baselines3 y RL Zoo (`rl_zoo3.load_from_hub`, `rl_zoo3.enjoy`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de una red convolucional pequeña sobre fotogramas de 84x84, la latencia esperada por paso es de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados por el mismo autor ni de resultados verificados de otros agentes DQN sobre `SpaceInvadersNoFrameskip-v4` en la información proporcionada. La comparación con implementaciones de referencia de la literatura (por ejemplo, las del paper de DQN de Mnih et al. o las del propio RL Zoo) no puede realizarse con datos de esta ficha, ya que no se han aportado sus métricas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| janvi-ai/dqn-SpaceInvadersNoFrameskip-v4 | no disponible | no aplica | 252,00 ± 24,00 (mean reward) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento muy corto: 30.000 pasos es una fracción mínima de lo habitual en DQN para Atari; la recompensa media de 252,00 ± 24,00 refleja un agente lejos de la convergencia.
- Métrica no verificada: el resultado del `model-index` tiene `verified: false`, por lo que no ha sido validado de forma independiente.
- Licencia no declarada: no se especifica licencia, lo que impide determinar con certeza las condiciones de uso comercial o redistribución.
- Sesgos y alucinación: no aplican en el sentido habitual de los modelos generativos, pero la política puede exhibir comportamientos degenerados o no generalizar fuera de la distribución del entorno de entrenamiento.
- Limitación de dominio: el agente solo es válido para `SpaceInvadersNoFrameskip-v4`; no se transfiere a otros juegos ni a tareas de texto, visión general o razonamiento.
- Sin soporte multilingüe ni de contexto largo: no aplica a este tipo de modelo.
- Caveat para producción: no se recomienda su uso en sistemas de producción sin una reevaluación propia, dado el escaso entrenamiento y la ausencia de validación externa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janvi-ai/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- SBX (SB3 + Jax): https://github.com/araffin/sbx
