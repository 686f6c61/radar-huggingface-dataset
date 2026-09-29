# byamasupatrick/BreakoutNoFrameskip-v4-grpo-seed2

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo entrenado con GRPO (Group Relative Policy Optimization) sobre el entorno BreakoutNoFrameskip-v4 de Atari. No es un modelo de lenguaje ni un modelo fundacional: es una red de política (policy network) convolucional cuyo state dict permite reproducir el comportamiento del agente en el juego. Lo desarrolla Byamasu Patrick Paul dentro del proyecto rl-algorithms-lab, con una implementación desde cero cuyo objetivo es comparar DQN, PPO y GRPO bajo un preprocesado idéntico.

El interés es metodológico: GRPO se hizo popular en el entrenamiento de modelos de razonamiento (elimina la necesidad de una red crítica/value function usando ventajas relativas por grupo), y este artefacto traslada ese esquema a entornos clásicos de RL. Los hiperparámetros publicados indican `num_groups: 2`, `advantage_type: outcome`, `kl_coef: 0.04` y `ref_update_every: 10`, lo que permite auditar exactamente cómo se aplicó GRPO en un dominio discreto y con recompensa dispersa.

El resultado declarado es un retorno medio de 15,20 +/- 8,78 en 30 episodios de evaluación con la semilla 2, tras 10 millones de timesteps de entrenamiento. Es un rendimiento bajo con una varianza alta (coeficiente de variación aproximado del 58 %), y el propio autor marca la métrica como no verificada, por lo que debe interpretarse como un punto de partida reproducible y no como un estado del arte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de política para Atari (el autor indica que el bucle de entrenamiento sigue `ppo_atari.py` de CleanRL; no se documenta el detalle de capas en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una pila de 4 fotogramas de 84x84 píxeles (`frame_stack: 4`, `screen_size: 84`) |
| Tipos de cuantizacion | no disponible (no aplica en el sentido de cuantización de LLM; el checkpoint es un state dict de PyTorch) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`grpo.pt`, cargado con `torch.load`) |
| Entorno | BreakoutNoFrameskip-v4 |
| Algoritmo | GRPO (`advantage_type: outcome`, `num_groups: 2`, `loss_aggregation: sequence`) |
| Timesteps de entrenamiento | 10.000.000 |
| Semilla | 2 |
| Entornos paralelos | 16 |
| Frame skip / frame stack | 4 / 4 |
| Gamma | 0,99 |
| Learning rate | 0,00025 (con `anneal_lr: True`) |
| Coeficiente KL | 0,04 (`ref_update_every: 10`) |
| Entropía / clip | `ent_coef: 0.01` / `clip_coef: 0.1` |
| Épocas de actualización | 4 (`num_minibatches: 4`) |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

La model card no describe la topología de la red, pero sí indica que la implementación de un solo fichero sigue `dqn_atari.py` y `ppo_atari.py` de CleanRL, lo que sitúa el agente en la familia habitual de políticas convolucionales para Atari (entrada 84x84x4, extracción de características con convoluciones y cabeza de política discreta sobre el espacio de acciones del entorno). El checkpoint publicado es el state dict del objeto `Policy` definido en `src/algorithms/grpo.py` del repositorio, de modo que la arquitectura exacta debe consultarse en ese código fuente.

En el plano algorítmico, GRPO sustituye la función de valor por una estimación de ventaja relativa calculada a partir de un grupo de retornos, con `num_groups: 2` y `advantage_type: outcome`. Se aplica una penalización KL contra una política de referencia (`kl_coef: 0.04`) que se refresca cada 10 actualizaciones, ventajas escaladas por lote (`scale_adv_batch: True`), normalización de ventajas desactivada (`norm_adv: False`) y recompensas recortadas (`clip_rewards: True`). La variante de retorno y baseline sigue el trabajo *Learning Without Critics? Revisiting GRPO in Classical Reinforcement Learning Environments* (de Oliveira et al., 2025), citado en la propia model card. No se documenta composición de dataset ni número de tokens, porque el entrenamiento es puramente de interacción con el entorno, no supervisado.

## Capacidades

- Jugar a BreakoutNoFrameskip-v4 con entrada de píxeles crudos (4 fotogramas apilados de 84x84) y salida discreta de acciones.
- Aprender una política sin red crítica, apoyándose en ventajas relativas por grupo frente a una política de referencia.
- Servir como implementación de referencia reproducible: el comando exacto de entrenamiento y los hiperparámetros completos están publicados.
- Evaluación periódica con 30 episodios (`eval_episodes: 30`) y guardado de checkpoints cada 1.000.000 de timesteps.
- Registro de métricas en TensorBoard y Weights & Biases (`track: True`, proyecto `grpo-atari`).
- Entrenamiento con 16 entornos vectorizados y ejecución en GPU (`cuda: True`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión general ni multilingüismo: no es un modelo de propósito general y su única tarea es el control en un entorno concreto.

## Casos de uso

- Reproducción de experimentos de RL: cargando `grpo.pt` y ejecutando el comando `python algorithm.py grpo --seed 2 --track --save-model --eval-episodes 30 --upload-model` se reconstruye el resultado declarado, lo que permite auditar el pipeline completo.
- Comparación algorítmica controlada: al compartir preprocesado con las variantes DQN y PPO del mismo repositorio, el agente sirve para medir el efecto de GRPO frente a métodos con crítico en el mismo entorno.
- Investigación sobre métodos sin crítico: el par `num_groups: 2` con `advantage_type: outcome` es un punto de partida directo para estudiar cómo varía el rendimiento al escalar el número de grupos o cambiar la agregación de la pérdida.
- Estudio de varianza y estabilidad: el resultado de 15,20 +/- 8,78 con una única semilla publicada es útil para dimensionar cuántas semillas hacen falta antes de extraer conclusiones en entornos de recompensa dispersa.
- Docencia en cursos de aprendizaje por refuerzo: el entorno Breakout y un agente de tamaño reducido permiten ejecutar ciclos completos de entrenamiento y evaluación en infraestructura modesta.
- Pruebas de infraestructura de evaluación en Atari: el checkpoint sirve como carga de trabajo ligera para validar pipelines de evaluación, registro en W&B y generación de checkpoints en un clúster.
- Generación de material divulgativo: el script admite `capture_video`, de modo que el agente puede grabarse jugando para demostraciones o comparativas visuales entre algoritmos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Entorno | Metrica | Resultado | Episodios | Semilla | Verificado |
|---|---|---|---|---|---|---|
| GRPO (este modelo) | BreakoutNoFrameskip-v4 | mean_reward | 15,20 +/- 8,78 | 30 | 2 | No |

No se han publicado resultados de benchmarks adicionales en la información disponible. En particular, no hay cifras del mismo autor para las variantes DQN o PPO del repositorio, ni puntuaciones comparables de referencia en la documentación proporcionada.

## Requisitos de hardware

- No se publica el número de parámetros ni el tamaño real del checkpoint; los metadatos de HuggingFace declaran 0,0 GB para el repositorio, dato que probablemente no refleja el tamaño efectivo del fichero `grpo.pt`.
- VRAM para inferencia: no disponible de forma explícita. Por el tipo de red (política convolucional para entradas de 84x84x4), una estimación razonable es que la inferencia quepa en menos de 1 GB, holgadamente dentro de cualquier GPU de consumo e incluso de CPU.
- VRAM para entrenamiento: no disponible. El entrenamiento usa 16 entornos vectorizados con `frame_skip: 4` y `frame_stack: 4`; con esos volúmenes, una GPU de gama media (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponibles. El script funciona con CUDA (`cuda: True`) y es viable en A100, H100 o RTX 4090, pero ninguna de estas configuraciones está documentada por el autor.
- Encaje en GPU de consumo: previsiblemente sí, tanto para inferencia como para entrenamiento, dado el tamaño reducido típico de las políticas Atari; se trata de una estimación cualitativa, no de un dato verificado.
- Opciones de despliegue: no aplican servidores de inferencia de LLM (vLLM, TGI, Ollama, llama.cpp). El despliegue se realiza ejecutando el código Python del repositorio `rl-algorithms-lab/grpo-atari` con Python 3.10 o 3.11, PyTorch, Gymnasium y el entorno ALE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Licencia | Disponibilidad | Resultado publicado |
|---|---|---|---|---|---|
| byamasupatrick/BreakoutNoFrameskip-v4-grpo-seed2 (este modelo) | GRPO | BreakoutNoFrameskip-v4 | no disponible | HuggingFace | 15,20 +/- 8,78 (semilla 2) |
| byamasupatrick/BreakoutNoFrameskip-v4-dqn-seed1 | DQN | BreakoutNoFrameskip-v4 | no disponible | HuggingFace | no disponible |
| sb3/a2c-BreakoutNoFrameskip-v4 | A2C | BreakoutNoFrameskip-v4 | no disponible | HuggingFace (organización sb3) | no disponible |
| CleanRL `ppo_atari.py` (implementación de referencia, no checkpoint) | PPO | Atari (incluye Breakout) | no disponible en la información proporcionada | GitHub | no disponible |

La comparación directa más informativa es contra las otras variantes del mismo autor en `rl-algorithms-lab`, porque comparten preprocesado y estructura de código; sin embargo, no se han facilitado sus cifras de rendimiento, por lo que no es posible establecer una comparación cuantitativa con la información disponible.

## Limitaciones y advertencias

- El resultado declarado (15,20 +/- 8,78) está marcado como no verificado y procede de una única semilla y 30 episodios, una muestra pequeña con una desviación típica elevada en relación a la media.
- El rendimiento absoluto es bajo en términos de Atari: no debe presentarse como un agente competitivo ni como estado del arte en Breakout.
- Es un agente específico de un único entorno y un único juego; no generaliza a otras tareas, entornos ni modalidades.
- No hay información sobre sesgos, pero sí sobre riesgos de sobreajuste a la configuración concreta de entrenamiento: los resultados dependen críticamente de los hiperparámetros publicados y del preprocesado de CleanRL.
- La licencia no está declarada, lo que impide asumir permisos de uso comercial o de redistribución; conviene contactar con el autor antes de integrarlo en productos.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes y fue creado el 2026-09-29, por lo que se trata de un artefacto reciente y sin validación comunitaria.
- El tamaño del repositorio declarado (0,0 GB) no es coherente con la existencia de un checkpoint; conviene verificar la integridad de `grpo.pt` antes de usarlo.
- La arquitectura exacta no está documentada en la model card: hay que leer `src/algorithms/grpo.py` para conocer capas, dimensionalidad y número de parámetros antes de reutilizar el checkpoint.
- No hay garantías de reproducibilidad exacta más allá de `torch_deterministic: True` en la semilla 2; otros entornos de hardware y versiones de librerías pueden alterar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/byamasupatrick/BreakoutNoFrameskip-v4-grpo-seed2
- Código de entrenamiento (grpo-atari): https://github.com/byamasu-patrick/rl-algorithms-lab/tree/master/grpo-atari
- Repositorio completo rl-algorithms-lab: https://github.com/byamasu-patrick/rl-algorithms-lab
- Perfil del autor: https://huggingface.co/byamasupatrick
- Variante DQN del mismo autor: https://huggingface.co/byamasupatrick/BreakoutNoFrameskip-v4-dqn-seed1
- Baseline A2C de Stable-Baselines3 en el mismo entorno: https://huggingface.co/sb3/a2c-BreakoutNoFrameskip-v4
- CleanRL (implementaciones de referencia `dqn_atari.py` y `ppo_atari.py`): https://github.com/vwxyzjn/cleanrl
- Documentación del entorno Breakout en Gymnasium: https://gymnasium.farama.org/environments/atari/breakout/
- Documentación del entorno Breakout en Arcade Learning Environment: https://ale.farama.org/environments/breakout/
- Leaderboard de energía para experimentos en BreakoutNoFrameskip-v4: https://breakend.github.io/RL-Energy-Leaderboard/reinforcement_learning_energy_leaderboard/breakoutnoframeskip-v4_experiments/index.html
- Referencia citada: *Learning Without Critics? Revisiting GRPO in Classical Reinforcement Learning Environments* (de Oliveira et al., 2025); no se proporciona enlace directo en la información disponible.
