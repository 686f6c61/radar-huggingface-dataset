# scaleresearch/ttrl-dqn-breakout

## Resumen

`scaleresearch/ttrl-dqn-breakout` es un agente de aprendizaje por refuerzo profundo (Double DQN) entrenado para jugar al juego Breakout de Atari, concretamente sobre el entorno `ALE/Breakout-v5`. Lo desarrolla Scaleresearch y se ha entrenado con su propia librería `ttrl` (tt-rl) sobre una única chip Tenstorrent Blackhole, lo que lo convierte en un ejemplo práctico de entrenamiento de RL en hardware alternativo a las GPU convencionales. El modelo se distribuye como un grafo ONNX que puede ejecutarse en cualquier CPU con `onnxruntime` y `gymnasium`, sin necesidad de hardware Tenstorrent ni de la librería `ttrl`.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red neuronal convolucional (Q-network) que estima el valor Q de cada una de las cuatro acciones posibles del entorno a partir de una pila de 4 fotogramas en escala de grises de 84x84 píxeles. Su relevancia es doble: por un lado, sirve como referencia reproducible de un agente DQN con un rendimiento declarado de 159,53 ± 75,45 de retorno medio en evaluación greedy; por otro, demuestra un flujo de trabajo completo de entrenamiento en Tenstorrent y exportación a ONNX para inferencia portátil.

El repositorio es de tamaño mínimo (0,0 GB según HuggingFace, con pesos en ONNX y NPZ) y tiene una licencia MIT permisiva. Está pensado para la comunidad de RL y para quienes quieran reproducir o desplegar un agente Atari sin infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red Q convolucional (Deep Q-Network, variante Double DQN); no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de `(batch, 4, 84, 84)` float32 en unidades de píxel 0..255 |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX float32 y checkpoint NPZ) |
| Idiomas soportados | no aplica (agente de RL sobre Atari Breakout) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), checkpoint NPZ (`checkpoint.npz`, `policy.npz`) |
| Espacio de acciones | 4 acciones discretas (head con valor Q por acción) |
| Entorno | `ALE/Breakout-v5` |
| Pipeline | reinforcement-learning |
| Libreria | ttrl |

## Arquitectura y entrenamiento

El agente es un Double DQN, una variante de DQN que desacopla la selección y la evaluación de la acción objetivo para reducir el sesgo de sobreestimación de los valores Q. La red recibe una pila de 4 fotogramas de 84x84 en escala de grises (entrada `obs` de forma `(batch, 4, 84, 84)`) y devuelve, por un lado, la acción seleccionada (`action`, int64) y, por otro, el valor Q de cada acción (`head`). El preprocesamiento exacto bajo el que fue entrenado se conserva en `play.py`.

El entrenamiento se realizó durante 10.000.000 de pasos del agente, equivalentes a 40.000.000 de fotogramas de Atari con frameskip 4, en 25,3 horas sobre una única chip Tenstorrent Blackhole con `ttrl` 0.1.0 (árbol pre-release, commit `aab87a1028c1`). Los hiperparámetros principales son: `lr` 0.0001, `batch_size` 32, `gamma` 0.99, `n_step` 3, `double` True, `buffer_capacity` 1.000.000, `learning_starts` 80.000, `train_freq` 4, `target_sync_interval` 8.000, `eps_decay_frames` 1.000.000, `eps_end` 0.01 y `huber_delta` 1.0. El calendario de epsilon se anilla desde 1.0 a lo largo de los primeros 1.000.000 de pasos del agente. Los episodios de entrenamiento terminan al perder una vida y las recompensas se transforman con `sign`. La configuración completa está en `train_config.py` y el reentrenamiento se lanza con `ttrl train train_config.py total_frames=10000000`.

Como innovación destacable, el flujo de trabajo demuestra el entrenamiento de RL en la pila software/hardware de Tenstorrent (ttnn) y la exportación a ONNX para ejecución portátil en CPU, lo que facilita la evaluación y el despliegue sin dependencias del hardware original.

## Capacidades

- Jugar a Breakout de Atari (`ALE/Breakout-v5`) seleccionando acciones de forma greedy a partir de la observación de 4 fotogramas.
- Estimación de valores Q por acción mediante la salida `head`, útil para análisis o para políticas derivadas (por ejemplo, epsilon-greedy o selección con temperatura).
- Inferencia en CPU mediante `onnxruntime` y `gymnasium`, sin necesidad de hardware Tenstorrent.
- Ejecución en chip Tenstorrent a través de `ttrl` (ttnn) usando `checkpoint.npz`.
- Ejecución en numpy puro con `ttrl.load_policy("policy.npz")`.
- No soporta tool calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo thinking; es un agente específico de una única tarea de RL.

## Casos de uso

- Evaluación reproducible de DQN en Atari: sirve como referencia para comparar implementaciones de Double DQN o de la pila `ttrl` frente a resultados publicados, usando el protocolo descrito (sticky actions 0.25, 30 no-ops aleatorios, partidas completas).
- Docencia y divulgación de RL: el agente y su script `play.py` permiten mostrar en clase cómo un Q-network convolucional transforma píxeles en acciones y cómo se interpreta la salida Q.
- Pruebas de integración de ONNX en pipelines de RL: al aceptar `obs` float32 `(batch, 4, 84, 84)` y devolver `action` y `head`, se puede integrar en un bucle de `gymnasium` o en un servicio de inferencia para validar latencia y compatibilidad.
- Benchmark de hardware alternativo: el checkpoint `checkpoint.npz` permite medir el rendimiento de inferencia en chips Tenstorrent frente a CPU con `onnxruntime`, útil para evaluar la madurez de la pila ttnn.
- Base para experimentos de RL (fine-tuning, destilación, imitación): al ser un agente entrenado y con licencia MIT, se puede reutilizar como política inicial o como profesor en experimentos de destilación o de aprendizaje por imitación.
- Reproducción de entrenamiento en Tenstorrent: con `train_config.py` y `ttrl train` se puede replicar el entrenamiento completo (10M de pasos, ~25 horas en una Blackhole) para validar la reproducibilidad de la pila.
- Generación de datos de demostración: las trayectorias del agente pueden usarse para construir datasets de comportamiento para otros algoritmos de RL offline.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Evaluación | Retorno medio |
|---|---|
| Greedy, `play.py` en CPU, 30 episodios (semilla 10000) | 159,53 ± 75,45 |
| Evaluación de entrenamiento en el paso 4.000.000, epsilon 0.05, 30 episodios | 144,8 |

Ambas evaluaciones usan sticky actions a 0.25, 30 inicios con no-op aleatorio y partidas completas en lugar de vidas individuales.

Curva de evaluación durante el entrenamiento (pasos del agente frente a media de evaluación), según la model card:

| Paso | Media | Paso | Media | Paso | Media | Paso | Media |
|---|---|---|---|---|---|---|---|
| 250.000 | 0,7 | 2.750.000 | 108,0 | 5.250.000 | 107,4 | 7.750.000 | 83,8 |
| 500.000 | 15,5 | 3.000.000 | 141,9 | 5.500.000 | 131,4 | 8.000.000 | 57,1 |
| 750.000 | 27,7 | 3.250.000 | 67,7 | 5.750.000 | 113,5 | 8.250.000 | 69,6 |
| 1.000.000 | 51,7 | 3.500.000 | 130,3 | 6.000.000 | 90,0 | 8.500.000 | 85,7 |
| 1.250.000 | 60,1 | 3.750.000 | 112,1 | 6.250.000 | 94,1 | 8.750.000 | 75,8 |
| 1.500.000 | 74,2 | 4.000.000 | 144,8 | 6.500.000 | 94,9 | 9.000.000 | 85,0 |
| 1.750.000 | 75,7 | 4.250.000 | 120,7 | 6.750.000 | 77,1 | 9.250.000 | 71,1 |
| 2.000.000 | 107,3 | 4.500.000 | 120,4 | 7.000.000 | 96,2 | 9.500.000 | 67,9 |
| 2.250.000 | 94,6 | 4.750.000 | 122,9 | 7.250.000 | 69,1 | 9.750.000 | 66,5 |
| 2.500.000 | 107,9 | 5.000.000 | 111,0 | 7.500.000 | 81,9 | 10.000.000 | 73,4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: cualquier CPU moderna con `onnxruntime` y `gymnasium[atari]`; el modelo es una red convolucional pequeña para entradas de 84x84, por lo que la VRAM/RAM necesaria es mínima (no se especifica cifra exacta en la información disponible).
- GPU: no se han publicado requisitos ni recomendaciones de GPU (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en cualquier GPU consumer, dado el tamaño reducido del repositorio (0,0 GB) y la naturaleza de la red; no obstante, no se aportan cifras oficiales de VRAM.
- Despliegue: `onnxruntime` (CPU) para `model.onnx`; `ttrl` con backend ttnn para `checkpoint.npz` en chip Tenstorrent; `ttrl.load_policy("policy.npz")` para ejecución en numpy.
- Entrenamiento: una única chip Tenstorrent Blackhole, 25,3 horas para 10M de pasos del agente (40M de fotogramas) con `ttrl` 0.1.0.
- Latencia y throughput: no se han publicado cifras en la información disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros agentes DQN comparables (parámetros, contexto, rendimiento, licencia) para construir una comparativa fiable. Se indica, por tanto, "no disponible". Como referencia cualitativa, el rendimiento declarado (159,53 de retorno medio) es coherente con agentes Double DQN entrenados durante decenas de millones de fotogramas en Breakout, pero no se aportan cifras de terceros en esta ficha para evitar datos no verificados.

## Limitaciones y advertencias

- El agente está especializado exclusivamente en `ALE/Breakout-v5`; no generaliza a otros juegos ni a tareas fuera de Atari.
- El resultado de 159,53 ± 75,45 es declarado por el autor y marcado como no verificado (`verified: false`); la desviación típica elevada (±75,45) indica alta varianza entre episodios.
- La evaluación depende del protocolo exacto (sticky actions 0.25, 30 no-ops aleatorios, partidas completas, semilla 10000); cambiar estas condiciones puede alterar el retorno medido.
- El preprocesamiento debe replicarse exactamente como en `play.py`; discrepancias en la normalización o en el apilado de fotogramas degradarán el rendimiento.
- El entrenamiento se realizó con una versión pre-release de `ttrl` (commit `aab87a1028c1`); la reproducibilidad con versiones posteriores no está garantizada.
- No se han documentado sesgos específicos, pero al ser un agente de RL sobre un entorno concreto, hereda las peculiaridades del entorno y de la política entrenada (por ejemplo, comportamiento degenerado en estados poco visitados).
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantía sobre el rendimiento en producción ni sobre la idoneidad para fines distintos de la investigación o la demostración.
- No se especifican requisitos de hardware para GPU ni cifras de latencia, lo que limita la planificación de despliegues con acuerdos de nivel de servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaleresearch/ttrl-dqn-breakout
- Repositorio de la librería ttrl: https://github.com/scaleresearch/tt-rl
- Ejemplo de Atari DQN en ttrl: `examples/atari-dqn` dentro del repositorio anterior
- Entorno `ALE/Breakout-v5`: disponible a través de `ale-py` y `gymnasium[atari]`
