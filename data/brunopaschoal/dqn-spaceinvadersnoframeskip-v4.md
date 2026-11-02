# brunopaschoal/dqn-SpaceInvadersNoFrameskip-v4

## Resumen

DQN para SpaceInvadersNoFrameskip-v4 es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado con el algoritmo Deep Q-Network (DQN) sobre el entorno Atari `SpaceInvadersNoFrameskip-v4`. Lo desarrolla el usuario brunopaschoal y se publica como un artefacto reproducible del RL Zoo, el framework de entrenamiento y optimizacion de hiperparametros asociado a Stable Baselines3. No es un modelo de lenguaje: es una politica neuronal que mapea observaciones visuales del juego a acciones discretas.

El modelo se entrenó durante 2 millones de timesteps con una `CnnPolicy` (red convolucional que procesa pilas de 4 frames en escala de grises, con envoltorio `AtariWrapper`) y un buffer de repeticion de 100.000 transiciones. Su relevancia es practica: sirve como referencia reproducible para comparar implementaciones de DQN, validar pipelines de RL Zoo y como punto de partida para experimentos de RL en entornos Atari.

El artefacto ocupa 0,1 GB y se distribuye con la libreria `stable-baselines3`. La model card declara una recompensa media de 453,50 +/- 141,62 en el entorno, un resultado modesto en el rango tipico de DQN en Atari, muy por debajo de variantes como Rainbow o agentes con mayor presupuesto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con `CnnPolicy` (red convolucional sobre 4 frames apilados, 84x84, escala de grises) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos de red neuronal; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no especificado en la informacion disponible; artefacto `stable-baselines3` (`.zip`) cargable con RL Zoo |
| Entorno | SpaceInvadersNoFrameskip-v4 (Atari, Gym/Gymnasium) |
| Algoritmo | DQN (Deep Q-Network) |
| Timesteps de entrenamiento | 2.000.000 |
| Espacio de acciones | discreto (acciones del juego Space Invaders) |

## Arquitectura y entrenamiento

El agente implementa DQN clasico con una red Q convolucional (`CnnPolicy`) que recibe una pila de 4 frames del juego preprocesados por `AtariWrapper` (redimensionado y conversion a escala de grises). La red estima el valor Q de cada accion discreta y se entrena minimizando el error TD sobre transiciones muestreadas de un replay buffer de 100.000 elementos, con una red objetivo actualizada cada 1.000 pasos (`target_update_interval`).

Los hiperparametros declarados incluyen `learning_rate=0.0001`, `batch_size=32`, `buffer_size=100000`, `exploration_fraction=0.1`, `exploration_final_eps=0.01`, `train_freq=4`, `gradient_steps=1`, `learning_starts=100000`, `optimize_memory_usage=True` y `frame_stack=4`. El entrenamiento se realizo con RL Zoo (`rl_zoo3.train`) durante 2 millones de timesteps, con `normalize=False` y `render_mode='rgb_array'`. No se documentan tecnicas adicionales como doble DQN, dueling networks, prioritized replay ni distribucion de retornos; el artefacto corresponde a la configuracion base de DQN del RL Zoo.

## Capacidades

- Control de politica en el entorno Atari `SpaceInvadersNoFrameskip-v4`: selecciona acciones discretas a partir de observaciones visuales.
- Aprendizaje por refuerzo profundo con DQN sobre entradas de imagen (procesamiento convolucional de frames).
- Reproducibilidad mediante RL Zoo: carga, evaluacion y reentrenamiento con comandos documentados.
- Integracion con el ecosistema Stable Baselines3 y SB3-Contrib.
- No soporta generacion de texto, codigo, matematicas, vision general, tool calling, agentes multi-paso ni capacidades multilingues.
- No dispone de modo thinking, audio ni funcionalidades multimodales fuera del entorno de juego.

## Casos de uso

- Evaluacion de referencia de DQN: cargar el agente con `rl_zoo3.load_from_hub` y medir la recompensa media en `SpaceInvadersNoFrameskip-v4` para validar una instalacion de SB3 o comparar contra una implementacion propia.
- Reproduccion de experimentos: usar los hiperparametros declarados para replicar el entrenamiento de 2 millones de timesteps y comprobar la variabilidad de la recompensa (la desviacion de +/- 141,62 indica alta varianza entre episodios).
- Punto de partida para fine-tuning: inicializar un nuevo entrenamiento DQN desde estos pesos y aplicar mejoras (Double DQN, Dueling, Prioritized Replay) para medir la ganancia respecto a la linea base.
- Docencia y formacion en RL: ejemplo completo y ligero (0,1 GB) de un pipeline RL Zoo con entorno Atari, util para explicar preprocesado, replay buffer y actualizacion de red objetivo.
- Benchmarking de infraestructura: medir throughput de inferencia y entrenamiento en distintas GPUs/CPUs con un agente convolucional pequeno y bien acotado.
- Pruebas de integracion de RL Zoo: validar los comandos `load_from_hub`, `enjoy` y `push_to_hub` en un flujo de publicacion de modelos en Hugging Face.
- Generacion de videos de politica: con `render_mode='rgb_array'` se pueden capturar episodios para inspeccion visual cualitativa del comportamiento del agente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| DQN | SpaceInvadersNoFrameskip-v4 | mean_reward | 453,50 +/- 141,62 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con agentes alternativos en el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la red convolucional de DQN para Atari es pequena (del orden de decenas de MB de pesos). El repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se requieren GPU dedicadas para inferencia; una GPU modesta (GTX 1650 o superior) o incluso CPU es suficiente. Para reentrenar durante 2 millones de timesteps se recomienda una GPU consumer (RTX 3060/4090) o una A100/H100 si se busca reducir el tiempo de entrenamiento.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU para inferencia.
- Opciones de despliegue: `stable-baselines3` con RL Zoo (`rl_zoo3.enjoy`), scripts propios de SB3, o exportacion a ONNX si se requiere integracion en otro runtime (no documentado en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunopaschoal/dqn-SpaceInvadersNoFrameskip-v4 | DQN | SpaceInvadersNoFrameskip-v4 | 453,50 +/- 141,62 | no disponible | Hugging Face |
| Agentes DQN de referencia del RL Zoo | DQN | SpaceInvadersNoFrameskip-v4 | no disponible en la informacion | MIT (RL Zoo/SB3) | GitHub DLR-RM |
| Alternativas Rainbow / Double DQN en Atari | Rainbow, Double DQN | Atari (varios) | no disponible en la informacion | variable | literatura y repositorios de RL |

No se dispone de resultados numericos comparables de otros agentes en el mismo entorno dentro de la informacion proporcionada; la comparativa se limita a categoria y disponibilidad.

## Limitaciones y advertencias

- La recompensa media declarada (453,50) tiene una desviacion estandar muy alta (+/- 141,62), lo que indica gran varianza entre episodios y una politica poco estable.
- El resultado no esta verificado (`verified: false`); procede de la model card del autor y no ha sido validado de forma independiente.
- DQN base sin mejoras (Double DQN, Dueling, Prioritized Replay, distribucional) suele quedar por debajo del estado del arte en Atari; no debe tomarse como referencia de maximo rendimiento.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial o redistribucion; es necesario contactar con el autor antes de cualquier uso productivo.
- El modelo solo es valido para el entorno `SpaceInvadersNoFrameskip-v4`; no generaliza a otros juegos ni a tareas fuera de Atari sin reentrenamiento.
- No procesa lenguaje natural ni dispone de capacidades multimodales generales; no es adecuado para tareas de NLP, codigo o vision fuera del entorno de juego.
- Riesgo de sobreajuste a la version concreta del entorno y de las dependencias (Gym/Gymnasium, versiones de SB3); la reproducibilidad puede verse afectada por cambios de version.
- No se documentan sesgos, pero al ser una politica entrenada con recompensa del juego, su comportamiento esta determinado exclusivamente por la dinamica del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunopaschoal/dqn-SpaceInvadersNoFrameskip-v4
- Stable Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL Zoo (rl-baselines3-zoo): https://github.com/DLR-RM/rl-baselines3-zoo
- SB3 Contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- Entorno SpaceInvadersNoFrameskip-v4 (Atari, Gym/Gymnasium): no disponible como enlace directo en la informacion proporcionada
