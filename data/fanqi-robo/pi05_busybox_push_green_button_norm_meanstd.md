# fanqi-robo/pi05_busybox_push_green_button_norm_meanstd

## Resumen

`fanqi-robo/pi05_busybox_push_green_button_norm_meanstd` es un checkpoint de robótica publicado en HuggingFace por el usuario `fanqi-robo`. No es un modelo de lenguaje de propósito general, sino una política visión-lenguaje-acción (VLA) resultante de un ajuste fino de `lerobot/pi05_base` (implementación LeRobot de π0.5) sobre el dataset `armnet/busybox_push_green_button`, compuesto por 39 episodios de demostración de la tarea de pulsar un botón verde con un brazo SO-101. El modelo tiene 4.143.404.816 parámetros (dato real de safetensors) y se distribuye con licencia Apache-2.0.

El checkpoint encarna una única decisión de diseño dentro de un estudio de ablación: sustituir la normalización por defecto de π0.5 (cuantiles q01/q99) por MEAN_STD tanto en el estado como en la acción, manteniendo IDENTITY en las entradas visuales. La hipótesis del autor es que la normalización del espacio articular de 6 dimensiones del SO-101 es el parámetro con evidencia previa en esta tarea concreta, ya que en la leaderboard de `push_green_button` el π0.5 multitarea de openpi dobló su tasa de éxito (del 20 % al 40 %) al cambiar su normalización a min-max.

Se publica el paso 10.000 de entrenamiento (etiqueta `step-10000`). Su relevancia es acotada y muy específica: sirve como brazo de ablación reproducible dentro de un pipeline LeRobot 0.5.1 fijado a un commit del modelo base, y su única evaluación prevista es en robot real, no mediante benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) derivada de π0.5 / `lerobot/pi05_base`; la model card no detalla la topología interna. La dependencia del tokenizador `google/paligemma-3b-pt-224` indica un backbone PaliGemma |
| Parametros totales | 4.143.404.816 (dato real de safetensors) |
| Longitud de contexto | No aplica como contexto de LLM: el prompt de lenguaje se limita a 200 tokens (`tokenizer_max_length`) y la política genera chunks de 50 acciones (`chunk_size`, `n_action_steps`) |
| Tipos de cuantizacion | No documentados en la información disponible; los pesos se publican en safetensors, entrenados en bfloat16 |
| Idiomas soportados | No disponible (la model card no documenta idiomas; el dataset es de una única tarea de manipulación) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,4 GB) |
| Modelo base | `lerobot/pi05_base` (fijado al commit `a538eb27`, LeRobot 0.5.1) |
| Dataset de ajuste fino | `armnet/busybox_push_green_button`, 39 episodios (0-38), sin partición de validación |
| Embodiment | `lerobot/so-101`, espacio articular de 6 dimensiones |
| Normalización | VISUAL: IDENTITY; STATE: MEAN_STD; ACTION: MEAN_STD |
| Checkpoint publicado | Paso 10.000 |
| Pasos de inferencia | 10 (`num_inference_steps`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de identificarla como π0.5 (`policy.type: pi05`) y de la necesidad de cargar el tokenizador `google/paligemma-3b-pt-224`, que es de acceso restringido (`gated`). Los hiperparámetros sí revelan un esquema de acción por chunks: se predicen 50 acciones por paso de inferencia (`chunk_size: 50`, `n_action_steps: 50`) con 10 pasos de inferencia (`num_inference_steps: 10`), lo que es coherente con un decodificador iterativo de acciones típico de la familia π0/π0.5. El encoder visual no se congela (`freeze_vision_encoder: false`) y no se entrena solo el experto (`train_expert_only: false`), por lo que el ajuste afecta a todo el modelo.

El entrenamiento se ejecutó durante 10.000 pasos con batch de 32, `optimizer_lr: 2.5e-05`, weight decay de 0,01, recorte de gradiente de norma 1,0, 1.000 pasos de calentamiento y decaimiento a 30.000 pasos hasta 2,5e-06, en bfloat16 y con `gradient_checkpointing` activado. No se usó `torch.compile` ni transformaciones de imagen (`image_transforms.enable: false`). El dataset completo (39 episodios, listados explícitamente del 0 al 38) se empleó sin hold-out, con evaluación desactivada durante el entrenamiento (`eval_freq: -1`) y guardado cada 2.000 pasos. No se documenta el número de tokens, la composición del dataset ni el uso de RLHF o DPO, y tampoco se describe ninguna innovación técnica adicional más allá del cambio de normalización.

## Capacidades

- Generación de acciones motoras: produce secuencias de 50 acciones para el brazo SO-101 a partir de observaciones visuales, estado propioceptivo de 6 dimensiones y un prompt de lenguaje de hasta 200 tokens.
- Ejecución de una única tarea de manipulación: pulsar un botón verde en el entorno BusyBox.
- Condicionamiento por lenguaje: acepta instrucciones textuales, aunque el ajuste fino se ha realizado sobre una sola tarea, por lo que la generalización a otras instrucciones no está documentada.
- Aprendizaje por imitación a partir de demostraciones: 39 episodios teleoperados de una única tarea.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes, razonamiento multi-paso ni planificación de tareas compuestas.
- No dispone de capacidades multilingües documentadas.
- No dispone de modo de razonamiento explícito (thinking mode), ni de entrada o salida de audio, ni de generación de texto libre.
- Capacidad especial: es un brazo de ablación, es decir, un punto de comparación controlado frente a otras variantes de normalización del mismo estudio.

## Casos de uso

- Ablación controlada de normalización: comparar este checkpoint frente a la variante por defecto (cuantiles q01/q99) manteniendo constante el resto de la configuración, para aislar el efecto de MEAN_STD sobre la tasa de éxito en la tarea `push_green_button`.
- Reproducción de experimentos: al estar anclado a `lerobot/pi05_base` en el commit `a538eb27` y a LeRobot 0.5.1, permite repetir el entrenamiento con la configuración YAML publicada (pasos, lr, batch, semilla 1000) sin ambigüedad de versiones.
- Punto de partida para ajuste fino en tareas de pulsado: sirve como inicialización para tareas similares (accionar interruptores, botones o pestillos) con un SO-101, al haber sido entrenado en un espacio articular idéntico de 6 dimensiones.
- Prueba de estrés de robustez al prompt: al permitir `tokenizer_max_length: 200`, se puede medir cuánto degrada la tasa de éxito al reformular la instrucción, ya que no hay hold-out ni evaluación automática publicada.
- Verificación en robot real: la evaluación prevista es enviar el checkpoint al space `armnet/armnet-eval` (embodiment `lerobot/so-101`, tarea `push_green_button`, 20 rollouts, semilla de variación 42), lo que permite obtener una medida de éxito comparable entre brazos de ablación.
- Docencia y formación en VLA: por su tamaño moderado (4,14 mil millones de parámetros) y su licencia permisiva, es un caso práctico para explicar pipelines de imitación, chunking de acciones y normalización de datos en robótica.
- Automatización de bancos de ensayo: integrado en una celda con un SO-101, puede accionar un botón físico de forma repetitiva para pruebas cíclicas, siempre con supervisión y límites de par.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este checkpoint en la información disponible. La model card indica explícitamente que la única prueba es el robot real y que no existe partición de validación. El único dato numérico citado corresponde a la evidencia previa que motivó la ablación, no a este modelo:

| Metrica | Modelo | Resultado | Nota |
|---|---|---|---|
| Tasa de éxito en `push_green_button` | π05 multitarea de openpi, normalización original | 20 % | Evidencia previa citada por el autor en la model card |
| Tasa de éxito en `push_green_button` | π05 multitarea de openpi, normalización min-max | 40 % | Evidencia previa citada por el autor; no es una medición de este checkpoint |
| Tasa de éxito de `pi05_busybox_push_green_button_norm_meanstd` | Este checkpoint | No publicado | Pendiente de evaluación en `armnet/armnet-eval` (20 rollouts, semilla 42) |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 8,3 GB (4.143.404.816 parámetros × 2 bytes). El repositorio completo ocupa 9,4 GB.
- VRAM estimada para inferencia: en torno a 10-13 GB incluyendo activaciones, encoder visual y buffers de decodificación de 50 acciones. Es una estimación propia; la model card no publica cifras de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S (48 GB) o cualquier acelerador con al menos 16 GB. El entrenamiento del estudio se realizó en la nube (volumen de Modal para los checkpoints).
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) sin cuantización. En tarjetas de 16 GB quedaría al límite, sin margen documentado.
- Opciones de despliegue: LeRobot con el extra `[pi]` (`lerobot[pi]`) es la vía documentada y requiere un token de HuggingFace con permiso de lectura sobre el tokenizador restringido `google/paligemma-3b-pt-224`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de generación de texto.
- Latencia y throughput: no disponibles. Los únicos parámetros conocidos son 10 pasos de inferencia para generar chunks de 50 acciones.
- Restricción de carga: el autor advierte que revisiones posteriores del modelo base usan un paso de procesador que LeRobot 0.5.1 no puede cargar, por lo que la ruta de pesos debe fijarse al commit indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / acción | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanqi-robo/pi05_busybox_push_green_button_norm_meanstd` | 4.143.404.816 | Prompt de 200 tokens; chunks de 50 acciones | `push_green_button` con SO-101 | apache-2.0 | Público en HuggingFace (10 descargas) |
| `lerobot/pi05_base` | No disponible | No disponible | Base VLA multitarea | No disponible en la información | Público en HuggingFace |
| `fanqi-robo/pi05_busybox_push_green_button_norm_meanstd_ckpts` | No disponible | No disponible | Mismo experimento | No disponible en la información | Público; contiene los 2 checkpoints más recientes del mismo estudio |
| Otros brazos del grupo `normalization` del estudio | No disponible | No disponible | Mismo experimento | No disponible en la información | Parcialmente públicos; el autor los referencia de forma agregada |
| Otros VLA abiertos de propósito general (π0 de LeRobot, OpenVLA, GR00T N1.5, RDT-1B) | No disponible | No disponible | Manipulación generalista | No disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Superajuste probable: el ajuste se realizó sobre 39 episodios de una única tarea y un único embodiment, sin partición de validación ni evaluación automática durante el entrenamiento (`eval_freq: -1`).
- Ausencia total de resultados publicados: no hay ninguna cifra de éxito publicada para este checkpoint, ni comparación directa contra el brazo con normalización por cuantiles.
- Generalización no medida: no puede afirmarse que la política funcione con instrucciones distintas a la tarea de pulsar el botón verde, ni en entornos, iluminaciones o disposiciones de cámara diferentes a las del dataset.
- Sesgos del dataset: la model card no documenta la composición, la variabilidad de escenas ni la distribución de demostraciones, por lo que no puede descartarse un sesgo hacia las condiciones concretas de grabación.
- Riesgo de alucinación en el sentido de acciones fuera de distribución: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones novedosas, lo que en robot real implica riesgo físico.
- Dependencia de un tokenizador restringido: la carga requiere acceso al modelo `gated` `google/paligemma-3b-pt-224`, sujeto a las condiciones de uso de Google para Gemma/PaliGemma, independientemente de que los pesos de este repositorio sean Apache-2.0.
- Fragilidad de versiones: el autor fija el commit `a538eb27` del modelo base porque revisiones posteriores usan un paso de procesador incompatible con LeRobot 0.5.1; cargar otra revisión puede fallar.
- Sensibilidad a la normalización: la propia hipótesis del estudio implica que MEAN_STD puede comportarse peor que otras normalizaciones (cuantiles o min-max) si el estado o la acción contienen valores atípicos.
- Sin salvaguardas ni mecanismos de seguridad: el modelo no incorpora comprobaciones de límites de par, colisiones ni parada de emergencia; esas protecciones deben implementarse externamente.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero el uso del tokenizador subyacente arrastra los términos de Google, y el autor no documenta ninguna garantía de idoneidad para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_norm_meanstd
- Checkpoints anteriores del mismo estudio: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_norm_meanstd_ckpts
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste fino: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Space de evaluación en robot real: https://huggingface.co/spaces/armnet/armnet-eval
- Registro de experimentos en Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizador restringido requerido para la carga: https://huggingface.co/google/paligemma-3b-pt-224
