# eetudigi/new-setup-policy0-20k

## Resumen

`eetudigi/new-setup-policy0-20k` es una política de aprendizaje por imitación entrenada con Action Chunking with Transformers (ACT), un método publicado en el paper arXiv:2304.13705 que predice bloques cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante la librería LeRobot de Hugging Face, y está orientado a control robótico de un brazo `so_follower` (el seguidor del robot SO-100/SO-101) equipado con dos cámaras: una en la muñeca y otra en posición superior.

La política resuelve una tarea concreta de manipulación: "Put the yellow cap in the red cup" (introducir el tapón amarillo en la taza roja). Se ha entrenado a partir de un único dataset de teleoperación de 30 episodios y 25.354 fotogramas grabados a 30 FPS, con 20.000 pasos de entrenamiento, batch de 8, optimizador AdamW a una tasa de aprendizaje de 1e-5 y semilla 1000.

Con 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB en safetensors, es un modelo pequeño y ligero pensado para inferencia en tiempo real sobre hardware de consumo, no para despliegue en servidores. Es relevante como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento y rollout), aunque su alcance es muy acotado: una única tarea, un único tipo de robot y sin evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se pasa como cadena fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Dataset de entrenamiento | `eetudigi/new-setup_20261110_133548` (30 episodios, 25.354 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

ACT combina un codificador visual (que procesa las dos cámaras a 480x640 y 30 FPS) con un transformer que produce un *chunk* de acciones, es decir, una secuencia corta de comandos de articulación en lugar de un único paso. Esta predicción por bloques mejora la estabilidad temporal y reduce el error acumulado frente a políticas paso a paso, y es la razón por la que ACT logra tasas de éxito altas en tareas de manipulación con datos de teleoperación. El modelo consume además el estado articular de 6 dimensiones (`observation.state`) y emite acciones de 6 dimensiones (`action`), lo que corresponde a las articulaciones del brazo `so_follower`.

El entrenamiento se realizó con LeRobot 0.7.1 sobre un dataset propio de 30 episodios y 25.354 fotogramas a 30 FPS, capturados con dos cámaras (`wrist` y `top`). Se ejecutaron 20.000 pasos con batch 8, AdamW y learning rate 1e-5 con semilla 1000. No se documenta en la información disponible el número de tokens, la composición exacta del dataset más allá de la tarea, ni si hubo fases de RLHF o DPO; en el caso de ACT, el paradigma es de imitación supervisada, no de alineamiento por refuerzo. Tampoco se detalla ninguna innovación adicional (decodificación especulativa, atención lineal, etc.) más allá del propio *action chunking* del método.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 grados de libertad para el brazo `so_follower` a partir del estado articular y de dos vistas de cámara.
- Aprendizaje por imitación de una tarea concreta: "Put the yellow cap in the red cup".
- Percepción visual multi-cámara: procesa simultáneamente las vistas `wrist` y `top` a resolución 480x640.
- Predicción por *chunks* de acciones: emite secuencias cortas de acciones para mayor estabilidad temporal.
- Inferencia en tiempo real a 30 FPS: el bucle de control está pensado para ejecutarse en hardware local.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento de lenguaje natural.
- No tiene capacidades multilingües: el campo `--task` es una etiqueta fija de la tarea entrenada, no una instrucción libre.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una tarea de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recogida del tapón amarillo y su inserción en la taza roja sobre un `so_follower`, útil como banco de pruebas reproducible de un pipeline de imitación completo con LeRobot.
- Validación de un flujo de teleoperación y entrenamiento: sirve como referencia para comprobar que la grabación de datos (30 episodios, 25.354 fotogramas), el entrenamiento (20.000 pasos) y el rollout funcionan de extremo a extremo antes de escalar a tareas más complejas.
- Docencia y formación en robótica de imitación: al ser un modelo pequeño (51,7 M de parámetros) y con un dataset público asociado, permite explicar ACT y LeRobot con un caso real y de bajo coste computacional.
- Benchmark interno de políticas: se puede comparar contra nuevas políticas entrenadas sobre el mismo dataset `eetudigi/new-setup_20261110_133548` para medir mejoras de éxito o de estabilidad temporal.
- Prueba de integración de hardware: el script `lerobot-rollout` permite verificar la calibración del robot, los índices de cámara y la latencia del bucle de control antes de desplegar políticas más grandes.
- Base para *fine-tuning* en tareas similares: al estar en safetensors y ser compatible con `lerobot-train --policy.type=act`, se puede reentrenar con nuevos datasets manteniendo la arquitectura y el pipeline de inferencia.
- Demostración de inferencia en hardware de consumo: su reducido tamaño permite ejecutarlo en una GPU de gama media o incluso en CPU para pruebas sin robot real, lo que facilita la validación rápida de cambios en el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial, pero con 51,7 M de parámetros en safetensors (0,2 GB de repo) el modelo cabe holgadamente en cualquier GPU con 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella será el bucle de control a 30 FPS, no el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU para pruebas sin robot real.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=eetudigi/new-setup-policy0`; el entrenamiento se hace con `lerobot-train --policy.type=act`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El modelo se ha entrenado sobre datos a 30 FPS, por lo que el bucle de inferencia debe sostener esa frecuencia para un control fluido, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eetudigi/new-setup-policy0-20k` | ACT (LeRobot) | 51,7 M | no aplica | no disponible | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT | variable (típicamente decenas de millones) | no aplica | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | Diffusion Policy | variable | no aplica | variable | Hugging Face |
| Políticas VLA tipo π0 / OpenVLA | Vision-Language-Action | cientos de millones a miles de millones | contexto de lenguaje | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito) para este modelo frente a alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Alcance muy restringido: entrenado para una única tarea ("Put the yellow cap in the red cup"), un único tipo de robot (`so_follower`) y una configuración concreta de dos cámaras (`wrist`, `top`).
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset pequeño: 30 episodios y 25.354 fotogramas; la generalización a nuevas posiciones de objetos, iluminación o distracciones es incierta.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados; en imitación, el modelo hereda los sesgos y la distribución de las demostraciones de teleoperación.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Dependencia del hardware: los nombres de cámara deben coincidir exactamente con las claves de observación (`observation.images.wrist`, `observation.images.top`) y el robot debe ser `so_follower`.
- Sin soporte de lenguaje natural: el campo `--task` es una etiqueta fija; no se puede dar una instrucción nueva en tiempo de inferencia.
- Sin idiomas soportados: no es un modelo multilingüe ni procesa texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eetudigi/new-setup-policy0-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/eetudigi/new-setup_20261110_133548
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=eetudigi/new-setup_20261110_133548
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
