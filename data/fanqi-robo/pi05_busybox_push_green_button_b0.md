# fanqi-robo/pi05_busybox_push_green_button_b0

## Resumen

`fanqi-robo/pi05_busybox_push_green_button_b0` es un checkpoint de política robótica (visión-lenguaje-acción, VLA) obtenido por ajuste fino completo de `lerobot/pi05_base`, el port a LeRobot del modelo π0.5. Lo desarrolla el usuario de Hugging Face `fanqi-robo` en el marco de un estudio de ablación sobre el directorio `experimental/lerobot_policy_pi05/` (rama `policy_test_fanqi`), y resuelve una única tarea de manipulación sobre un brazo SO-101: pulsar un botón verde en un panel BusyBox.

El modelo no es un modelo de lenguaje: es un policy que traduce observaciones multimodales (tres cámaras —frontal, superior y muñeca—, estado articular y un prompt textual de tarea) en secuencias de acciones motoras. Cuenta con 4.143.404.816 parámetros almacenados en `safetensors` (repositorio de 9,4 GB) y se distribuye bajo licencia Apache 2.0.

Su relevancia es metodológica más que de producto: el brazo `b0` es el ancla de referencia ("group: baseline") de un conjunto de variantes, y su objetivo declarado es medir qué puntuación obtiene la receta portada a LeRobot antes de introducir cambios, comparándola con el baseline de openpi que obtuvo un 40 % de éxito en la tarea. Se publica el checkpoint del paso 10.000, sin partición de validación: la única evaluación admitida es el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (modelo base `lerobot/pi05_base`); depende del tokenizer de `google/paligemma-3b-pt-224`. Detalle interno de capas no disponible en la información proporcionada |
| Parametros totales | 4.143.404.816 (~4,14 mil millones, dato real de `safetensors`) |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible como ventana de contexto; `tokenizer_max_length: 200` tokens para el prompt de tarea y `chunk_size: 50` pasos de acción |
| Tipos de cuantizacion | No disponible. Entrenamiento e inferencia documentados en `bfloat16` |
| Idiomas soportados | No disponible (el prompt se tokeniza con PaliGemma; no se documentan capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,4 GB) |
| Libreria / runtime | `lerobot` (requiere `lerobot[pi]` y token de Hub con acceso al tokenizer con gating) |
| Dataset de ajuste | `armnet/busybox_push_green_button`, 39 episodios (episodios 0-38), sin hold-out |
| Embotellamiento (embodiment) | Brazo `lerobot/so-101` |
| Tarea | `push_green_button` (pulsar el botón verde de un BusyBox) |
| Checkpoint publicado | Paso 10.000 (raíz del repo, tag `step-10000`) |
| Descargas / likes | 8 / 0 (a fecha de creación del registro, 2026-09-26) |

## Arquitectura y entrenamiento

El checkpoint parte de `lerobot/pi05_base` en la revisión `a538eb27` (LeRobot 0.5.1), fijada explícitamente porque revisiones posteriores del base incorporan un paso de procesador que la versión 0.5.1 no puede cargar. El ajuste es completo, no parcial: `freeze_vision_encoder: false` y `train_expert_only: false`, de modo que se actualizan todos los parámetros del modelo con `bfloat16` y `gradient_checkpointing` activado (`compile_model: false`). Se emplea `chunk_size: 50` y `n_action_steps: 50`, con 10 pasos de inferencia por chunk.

La receta de entrenamiento usa normalización por cuantiles (`QUANTILES`) tanto para el estado como para la acción, e identidad para las entradas visuales; los objetivos son posiciones articulares absolutas (`use_relative_actions: false`). Los hiperparámetros son: optimizador con lr 2,5e-5, weight decay 0,01, grad clip norm 1,0, scheduler coseno con 1.000 pasos de warmup y decaimiento hasta 2,5e-6 a lo largo de 30.000 pasos (el entrenamiento se detuvo en 10.000, por lo que el decaimiento no se completó). Batch de 32, 10.000 pasos, semilla 1000, `save_freq` de 2.000 y sin aumentación de imagen (`image_transforms.enable: false`). Solo se usan tres cámaras (frontal, superior y muñeca).

No se documenta en la información disponible si hubo RLHF, DPO u otra fase de alineamiento posterior; el pipeline descrito es exclusivamente de imitación supervisada sobre demostraciones. El dataset de ajuste contiene únicamente 39 episodios y no se reservó ninguna partición para validación.

## Capacidades

- Control motor de un brazo SO-101 para ejecutar la tarea concreta "push the green button" sobre un panel BusyBox.
- Entrada multimodal: tres cámaras (frontal, superior, muñeca), estado articular y un prompt textual de tarea de hasta 200 tokens.
- Salida de acciones en bloques de 50 pasos (`chunk_size: 50`, `n_action_steps: 50`), generados con 10 pasos de inferencia por bloque.
- Política de imitación con objetivos articulares absolutos y normalización por cuantiles de estado y acción.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No se documentan capacidades multilingües ni de conversación: el componente de lenguaje no se usa para diálogo.
- No dispone de modo "thinking", ni de visión general (VQA, OCR, descripción de imágenes), ni de audio.
- No se documenta soporte de generalización a otras tareas, objetos o morfologías de robot distintas del SO-101.

## Casos de uso

- Baseline de ablación: sirve como ancla de referencia para comparar otras variantes del estudio (normalización, aumentación de imagen, congelación del encoder de visión), aislando el efecto de cada cambio respecto a la receta completa.
- Evaluación en robot real mediante el Space `armnet/armnet-eval`: se envía el checkpoint con el embodiment `lerobot/so-101`, tarea `push_green_button`, 20 rollouts y semilla de variación 42. Es el único método de evaluación aceptado por el autor.
- Comparación con el port de openpi: el baseline `pravsels/pi05_busybox_push_green_button` obtuvo un 40 % de éxito; este checkpoint permite medir la diferencia entre implementaciones (openpi frente a port de LeRobot) con idéntica receta.
- Punto de partida para ajuste fino en nuevas tareas de manipulación con SO-101: al ser un fine-tune completo sobre π0.5, se puede reentrenar con datasets propios pequeños (decenas de episodios) para tareas de pulsar botones, insertar piezas o recoger objetos.
- Validación de la infraestructura de carga: útil para comprobar que un entorno con LeRobot 0.5.1, `lerobot[pi]` y token de Hub capaz de leer el tokenizer con gating carga correctamente un checkpoint π0.5 de 4,14 B de parámetros.
- Pruebas de latencia y consumo de VRAM en hardware consumer antes de dimensionar un despliegue real sobre el brazo, dado que el modelo cabe en `bfloat16` en GPU de 16-24 GB (ver sección de hardware).
- Estudio de sensibilidad al número de pasos de inferencia y al tamaño de chunk: la configuración publicada usa 50 pasos de acción y 10 pasos de inferencia, parámetros que se pueden variar para analizar el compromiso entre frecuencia de replanificación y estabilidad del movimiento.
- Depuración de fallos de política en un entorno controlado: al ser una tarea de un solo objetivo sobre un panel BusyBox, facilita aislar si los fallos provienen del modelo, de la calibración de cámaras o del controlador del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. No aplican métricas de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque se trata de un policy robótico. El único dato numérico aportado es la referencia del baseline de openpi en la misma tarea:

| Benchmark / evaluación | Modelo | Resultado | Condiciones |
|---|---|---|---|
| `armnet-eval`, tarea `push_green_button`, embodiment `lerobot/so-101` | `fanqi-robo/pi05_busybox_push_green_button_b0` | No publicado | 20 rollouts, semilla de variación 42 |
| `armnet-eval`, misma tarea | `pravsels/pi05_busybox_push_green_button` (openpi) | 40 % de éxito | Línea base citada en la model card como objetivo de comparación |

No existe partición de validación ("no hold-out; robot eval only"), por lo que no hay métricas offline de pérdida o precisión de acción publicadas.

## Requisitos de hardware

- Pesos en `bfloat16`: 4.143.404.816 parámetros × 2 bytes ≈ 8,3 GB.
- Pesos en `float32`: ≈ 16,6 GB (más sobrecarga de activaciones).
- VRAM estimada para inferencia en `bfloat16`: del orden de 10-14 GB contando activaciones y el encoder de visión (estimación a partir del número de parámetros, no confirmada por el autor).
- VRAM estimada para el ajuste fino completo: elevada, ya que se actualizan todos los parámetros. Con AdamW y gradient checkpointing se necesitan aproximadamente 60-80 GB (estados del optimizador, gradientes y activaciones), es decir, una A100/H100 de 80 GB o reparto en varias GPU.
- Cabe en GPU de consumo en inferencia: RTX 4090 o RTX 3090 (24 GB) con holgura; RTX 4080 y RTX 4060 Ti de 16 GB de forma ajustada. En tarjetas de 8-12 GB no se documenta una cuantización que permita reducir el footprint.
- Opciones de despliegue: `lerobot` (librería declarada) sobre PyTorch/CUDA, con el extra `lerobot[pi]`. Requiere token de Hub con acceso al tokenizer con gating de `google/paligemma-3b-pt-224`.
- No se documentan rutas de despliegue con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, lo cual es esperable en un policy robótico.
- Latencia y throughput: no disponibles. Solo consta que la inferencia se configura con 10 pasos por chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi05_busybox_push_green_button_b0` (este) | 4.143.404.816 | prompt 200 tokens, chunk de 50 acciones | No publicado | apache-2.0 | Hugging Face, 8 descargas, evaluación solo en robot real |
| `lerobot/pi05_base` (modelo base) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face, revisión `a538eb27` fijada por el autor |
| `pravsels/pi05_busybox_push_green_button` (openpi) | No disponible | No disponible | 40 % de éxito en la tarea | No disponible en la información proporcionada | Hugging Face, citado como línea base del leaderboard |
| `fanqi-robo/pi05_busybox_push_green_button_b0_ckpts` | Mismo modelo | Mismo modelo | No disponible | apache-2.0 | Repositorio auxiliar con los checkpoints más recientes (los 2 últimos) |

No se dispone de datos suficientes para comparar con alternativas de otros autores fuera de las citadas (por ejemplo, otros policies VLA de tamaño similar), por lo que la comparativa se limita al modelo base, al baseline de openpi y a los checkpoints intermedios del mismo experimento.

## Limitaciones y advertencias

- Modelo de tarea única: la política está especializada en "push the green button" sobre un BusyBox y un brazo SO-101. No se documenta ninguna capacidad de generalización a otros objetos, paneles o morfologías.
- Datos de entrenamiento muy reducidos: 39 episodios y un ajuste fino completo de 4,14 B de parámetros, con riesgo de sobreajuste al entorno concreto de recogida de datos.
- Sin conjunto de validación: no existe hold-out ni métrica offline, de modo que la única señal de rendimiento es la evaluación física en el robot.
- Dependencia de un tokenizer con gating: la carga requiere autenticación en el Hub y acceso a `google/paligemma-3b-pt-224`, lo que añade fricción y una dependencia externa.
- Acoplamiento de versión: la model card fija LeRobot 0.5.1 y la revisión `a538eb27` del base porque revisiones posteriores rompen la carga del procesador.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), por lo que el despliegue en GPUs pequeñas no está cubierto por el autor.
- Riesgo de alucinación en el sentido habitual de modelos de lenguaje no aplica; el riesgo equivalente es la ejecución de trayectorias erróneas o inseguras sobre hardware físico, con posible colisión contra el panel o el entorno.
- Sesgos: no se documenta ningún análisis de sesgo, ni de robustez frente a cambios de iluminación, posición de cámara o variaciones del panel, factores críticos en políticas de imitación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la licencia del modelo base y del tokenizer de PaliGemma pueden imponer condiciones adicionales que no se detallan en la información proporcionada.
- Adopción mínima: 8 descargas y 0 likes en el momento del registro, sin validación independiente por terceros.
- Fecha de creación y actualización del repositorio: 2026-09-26 (ambas en el mismo minuto), lo que indica una publicación única sin revisiones posteriores documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_b0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoints intermedios: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_b0_ckpts
- Dataset de ajuste: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Baseline de openpi citado: https://huggingface.co/pravsels/pi05_busybox_push_green_button
- Space de evaluación: https://huggingface.co/spaces/armnet/armnet-eval
- Seguimiento de experimentos (W&B): https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizer con gating requerido: https://huggingface.co/google/paligemma-3b-pt-224
- Librería LeRobot: https://github.com/huggingface/lerobot
