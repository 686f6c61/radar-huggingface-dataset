# scaleresearch/ttrl-dqn-boxing

## Resumen

ttrl-dqn-boxing es un agente de aprendizaje por refuerzo profundo basado en Double DQN, entrenado para el entorno `ALE/Boxing-v5` de Arcade Learning Environment (Atari). Lo desarrolla scaleresearch y se distribuye bajo licencia MIT. No es un modelo de lenguaje: es una política de control que recibe fotogramas del juego (4 canales de 84x84 píxeles) y emite una acción discreta entre las disponibles en el entorno. Su relevancia radica en que demuestra el entrenamiento de agentes de RL en hardware Tenstorrent (un chip Blackhole) mediante la librería ttrl, y en que el resultado se exporta a ONNX para poder ejecutarse en cualquier CPU con `onnxruntime`, sin necesidad de hardware especializado.

El agente se entrenó durante 10.000.000 de pasos (40.000.000 de fotogramas a frameskip 4) en 25,4 horas sobre un único chip Tenstorrent, usando la versión pre-release 0.1.0 de ttrl. La política exportada alcanza una recompensa media de 95,17 ± 3,41 en 30 episodios codiciosos ejecutados en CPU, con acciones sticky a 0,25 y arranques aleatorios sin operación. El repositorio es de tamaño mínimo (0,0 GB) e incluye el modelo ONNX, un checkpoint en formato NPZ y el script de reproducción.

El interés práctico es doble: por un lado sirve como referencia reproducible de un agente DQN clásico sobre Atari; por otro, documenta un flujo de trabajo de entrenamiento en aceleradores Tenstorrent con exportación portable a ONNX, lo que facilita la inspección, el despliegue y la comparación con otros agentes de RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional Q (Double DQN) sobre observaciones de píxeles; no disponible el detalle exacto de capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 4 fotogramas apilados de 84x84 píxeles |
| Tipos de cuantización | no disponible; pesos exportados en ONNX (float32) y checkpoint NPZ |
| Idiomas soportados | no aplica (agente de control, no modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), checkpoint NPZ (`checkpoint.npz`, `policy.npz`) |

## Arquitectura y entrenamiento

El agente es un Double DQN con n-step returns (n=3), entrenado sobre el entorno `ALE/Boxing-v5`. La entrada es un tensor float32 de forma `(batch, 4, 84, 84)` en unidades de píxel crudas de 0 a 255; la salida incluye la acción seleccionada (int64) y el valor Q de cada acción (`head`). El entrenamiento usa un buffer de repetición de capacidad 1.000.000, `learning_starts` de 80.000 pasos, frecuencia de entrenamiento de 4, sincronización de la red objetivo cada 8.000 pasos, factor de descuento gamma de 0,99, tasa de aprendizaje de 0,0001, tamaño de lote de 32 y pérdida Huber con delta 1,0. El schedule de epsilon anneala desde 1,0 durante los primeros 1.000.000 de pasos hasta un mínimo de 0,01.

El entrenamiento se realizó con ttrl 0.1.0 (árbol pre-release, commit `aab87a1028c1`) sobre un chip Tenstorrent Blackhole, durante 25,4 horas y 10.000.000 de pasos de agente (40.000.000 de fotogramas). Los episodios de entrenamiento terminan al perder una vida y las recompensas se transforman con la función signo. La evaluación se hace con acciones sticky a 0,25, 30 arranques aleatorios sin operación y partidas completas en lugar de vidas individuales. La política exportada a ONNX se ejecuta en CPU con `onnxruntime` y `gymnasium`, y también puede ejecutarse en numpy con `ttrl.load_policy("policy.npz")` o en hardware Tenstorrent mediante `ttrl.agent_from_checkpoint`.

## Capacidades

- Control de agente en el entorno Atari Boxing (`ALE/Boxing-v5`): selecciona acciones discretas a partir de observaciones de píxeles.
- Inferencia en CPU sin dependencias de hardware especializado mediante ONNX Runtime.
- Inferencia en hardware Tenstorrent (ttnn) a partir del checkpoint NPZ.
- Ejecución en numpy con `ttrl.load_policy` para inspección o integración ligera.
- Salida de valores Q por acción (`head`), útil para análisis de política y depuración.
- No soporta tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües, visión general, audio ni modo thinking; es una política específica de una tarea.

## Casos de uso

- Reproducción de referencia de Double DQN en Atari: sirve para validar implementaciones propias de DQN comparando la recompensa media reportada (95,17 ± 3,41) con la obtenida en el mismo protocolo de evaluación.
- Docencia e investigación en RL: el agente y su configuración de hiperparámetros permiten estudiar el efecto de n-step returns, Double DQN y el schedule de epsilon en un entorno de control visual.
- Evaluación de portabilidad ONNX: al ejecutarse en CPU con `onnxruntime`, se puede usar para comparar latencia y throughput entre distintos backends de inferencia sin depender de GPU.
- Pruebas de integración en pipelines de RL: el script `play.py` y el modelo ONNX permiten montar un bucle de evaluación automatizado sobre `ALE/Boxing-v5` en CI.
- Benchmark de hardware Tenstorrent: el checkpoint NPZ y la ruta `ttrl.agent_from_checkpoint` permiten medir el rendimiento de la política en ttnn frente a CPU.
- Análisis de política mediante valores Q: la salida `head` facilita estudiar la preferencia de acciones del agente en estados concretos del juego.
- Base para experimentos de transferencia o ajuste fino: el checkpoint puede servir como inicialización para variantes del entorno o cambios en la función de recompensa.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Evaluación | Retorno medio |
|---|---|
| Codicioso, `play.py` en CPU, 30 episodios | 95,2 ± 3,4 |
| Evaluación de entrenamiento en el paso 9.750.000, epsilon 0,05, 30 episodios | 91,0 |

Curva de evaluación durante el entrenamiento (pasos de agente, media de evaluación):

| Paso | Media | Paso | Media |
|---|---|---|---|
| 250.000 | -4,2 | 5.250.000 | 74,2 |
| 500.000 | 0,9 | 5.500.000 | 79,9 |
| 750.000 | 11,3 | 5.750.000 | 76,7 |
| 1.000.000 | 19,3 | 6.000.000 | 81,6 |
| 1.250.000 | 21,8 | 6.250.000 | 89,6 |
| 1.500.000 | 46,0 | 6.500.000 | 83,6 |
| 1.750.000 | 51,6 | 6.750.000 | 82,0 |
| 2.000.000 | 56,8 | 7.000.000 | 87,7 |
| 2.250.000 | 71,2 | 7.250.000 | 89,6 |
| 2.500.000 | 70,0 | 7.500.000 | 83,8 |
| 2.750.000 | 74,6 | 7.750.000 | 85,7 |
| 3.000.000 | 75,3 | 8.000.000 | 82,9 |
| 3.250.000 | 74,7 | 8.250.000 | 84,9 |
| 3.500.000 | 82,9 | 8.500.000 | 81,7 |
| 3.750.000 | 84,0 | 8.750.000 | 86,3 |
| 4.000.000 | 76,6 | 9.000.000 | 90,0 |
| 4.250.000 | 83,2 | 9.250.000 | 88,1 |
| 4.500.000 | 78,8 | 9.500.000 | 87,9 |
| 4.750.000 | 78,0 | 9.750.000 | 91,0 |
| 5.000.000 | 81,2 | 10.000.000 | 90,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se distribuye para CPU y el tamaño del repositorio es de 0,0 GB, por lo que la huella es muy reducida.
- GPU recomendadas: no aplica para la ruta principal; la inferencia documentada es en CPU con `onnxruntime`. El entrenamiento se realizó en un chip Tenstorrent Blackhole.
- Compatibilidad con GPU de consumo: no se documenta; el agente está pensado para ejecutarse en CPU, por lo que cabe en cualquier equipo convencional.
- Opciones de despliegue: `onnxruntime` + `gymnasium` + `ale-py` (CPU); numpy mediante `ttrl.load_policy("policy.npz")`; Tenstorrent con ttnn mediante `ttrl.agent_from_checkpoint` o `examples/atari-dqn`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros agentes sobre `ALE/Boxing-v5` con el mismo protocolo (acciones sticky a 0,25, 30 arranques sin operación, partidas completas) que permitan una comparación rigurosa. Se indica a continuación la comparación cualitativa disponible:

| Modelo | Entorno | Recompensa media | Licencia | Formato |
|---|---|---|---|---|
| ttrl-dqn-boxing (Double DQN) | ALE/Boxing-v5 | 95,17 ± 3,41 | MIT | ONNX, NPZ |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una política específica de `ALE/Boxing-v5`; no generaliza a otros juegos ni a tareas fuera de ese entorno.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El protocolo de evaluación (acciones sticky a 0,25, 30 arranques sin operación, partidas completas) debe replicarse para que las cifras sean comparables; otras configuraciones producen resultados distintos.
- El agente se entrenó con recompensas transformadas por la función signo y episodios que terminan al perder una vida; el comportamiento en configuraciones de recompensa o terminación distintas no está documentado.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; esas categorías no aplican.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el árbol de ttrl utilizado es pre-release y puede cambiar.
- El repositorio no incluye información sobre parámetros totales ni arquitectura detallada de la red, lo que limita la reproducibilidad exacta del modelo.
- No se documentan requisitos de latencia ni throughput, por lo que no se puede garantizar un rendimiento mínimo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scaleresearch/ttrl-dqn-boxing
- Repositorio ttrl: https://github.com/scaleresearch/tt-rl
- Entorno ALE/Boxing-v5 (Arcade Learning Environment, referencia del entorno): no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada
- Demostración o replay: `replay.mp4` incluido en el repositorio del modelo
