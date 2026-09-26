# fanqi-robo/pi05_busybox_push_green_button_pi0_control

## Resumen

`fanqi-robo/pi05_busybox_push_green_button_pi0_control` es un checkpoint de política robótica de tipo vision-lenguaje-acción (VLA) publicado por el usuario fanqi-robo. Se trata de una de las ramas de ablación del estudio de fine-tuning de π0.5 recogido en `experimental/lerobot_policy_pi05/` (proyecto alpha-robotics, rama `policy_test_fanqi`). Concretamente, esta variante, denominada `pi0_control` dentro del grupo `base_model`, entrena el modelo base `lerobot/pi0_base` con los mismos datos, pasos, batch y planificador que la rama b0, pero aplicando los valores por defecto propios de pi0 (normalización MEAN_STD y prompt de 48 tokens) y sustituyendo el bloque de política en lugar de fusionarlo.

El problema que aborda es acotado y experimental: determinar si la ventaja observada en la tarea "pulsar el botón verde" del benchmark Armnet-Bench se explica por el modelo base (pi0) o por la receta de entrenamiento empleada. Según la propia model card, la mejor entrada de esa tarea concreta en la tabla de clasificación es un run de pi0 (pravsels/pi0_busybox_push_green_button, 52,5%), mientras que en el conjunto del benchmark pi05 queda por delante de pi0 (47,5% frente a 35%). Este checkpoint pretende aportar un punto de comparación equiparable.

El modelo tiene 4.028.019.472 parámetros (≈4,03 B) según los pesos en safetensors, con un repositorio de 8,9 GB. Está ajustado sobre las 39 episodios completos del dataset `armnet/busybox_push_green_button` (sin conjunto de validación) y se distribuye como el checkpoint del paso 10.000. Su relevancia es la de un artefacto de investigación reproducible para la comunidad de aprendizaje por imitación robótica, más que la de un modelo de propósito general: no es un LLM y no se puede usar para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica VLA de tipo pi0 (backbone vision-lenguaje más módulo de acción); el detalle del experto de acción no se especifica en la información disponible |
| Parametros totales | 4.028.019.472 (≈4,03 B), según los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 48 tokens de prompt (valor por defecto de pi0 empleado en este run); la ventana de observación visual no se detalla |
| Tipos de cuantizacion | No disponible (los pesos publicados están en bfloat16; no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible; se trata de una política robotica con instrucciones de texto de 48 tokens, no de un modelo conversacional multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Procesador/Política de LeRobot) |
| Autor | fanqi-robo |
| Libreria | lerobot (`lerobot[pi]`) |
| Pipeline | robotics |
| Modelo base | lerobot/pi0_base, revisión fijada `26b99b94` |
| Dataset de entrenamiento | armnet/busybox_push_green_button (39 episodios, sin partición de validación) |
| Checkpoint publicado | Paso 10.000 (raíz del repositorio, etiqueta `step-10000`) |
| Formato de acción | Chunks de 50 acciones (`chunk_size: 50`, `n_action_steps: 50`) |
| Precisions de entrenamiento | bfloat16 con gradient checkpointing activado |
| Embodiment objetivo | lerobot/so-101 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es una política pi0: se parte de `lerobot/pi0_base` mediante `--policy.pretrained_path` y se ajusta con la implementación `policy.type: pi0` de LeRobot. La dependencia declarada del tokenizer restringido `google/paligemma-3b-pt-224` sugiere que el backbone vision-lenguaje es de la familia PaliGemma-3B, y que el resto de parámetros hasta los 4,03 B correspondería al módulo generador de acciones; la model card no describe en detalle ni las capas del experto de acción ni el mecanismo exacto de decodificación de acciones. Sí se documentan dos rasgos propios de la política pi0 frente a π0.5: normalización MEAN_STD y prompt de 48 tokens, además de que el bloque de política del checkpoint base se reemplaza en lugar de fusionarse.

El entrenamiento es deliberadamente replicable y de escala pequeña: 10.000 pasos, batch de 32, 8 workers de carga de datos, semilla 1000, `save_freq: 2000`, `eval_freq: -1` (sin evaluación durante el entrenamiento) y push al Hub desactivado en el job original. No se congeló el codificador visual (`freeze_vision_encoder: false`) ni se entrenó solo el experto (`train_expert_only: false`), y no se usaron transformaciones adicionales de imagen (`image_transforms.enable: false`). No se menciona en la información proporcionada el uso de RLHF, DPO ni etapas de alineación adicionales: es un ajuste por imitación supervisada sobre demostraciones, y la única evaluación contemplada es la del robot real.

## Capacidades

- Generación de acciones de manipulación para un robot SO-101 mediante imitación de demostraciones (política de acción continua, no de generación de texto).
- Producción de secuencias de acción en bloques de 50 pasos por inferencia (`n_action_steps: 50`), lo que reduce la frecuencia de re-planificación.
- Percepción visual y condicionamiento por instrucción textual de prompt corto (48 tokens).
- Especialización en una única tarea: pulsar el botón verde del entorno BusyBox (`push_green_button`).
- Punto de partida para fine-tuning: al conservar la arquitectura pi0, puede reentrenarse sobre nuevos datasets con `lerobot-train`.
- Soporte de tool calling / function calling: no aplica; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible; la política no expone planificación simbólica ni uso de herramientas.
- Capacidades multilingües: no documentadas (no es un modelo conversacional).
- Modo "thinking", visión conversacional, audio: no disponibles.

## Casos de uso

- Reproducción de la ablación pi0 frente a π0.5: permite comparar, con idénticos datos, pasos y planificador, si la diferencia de rendimiento en la tarea "pulsar el botón verde" proviene del modelo base o de la receta de co-entrenamiento de π0.5. Es el uso principal declarado por el autor.
- Baseline de referencia para nuevos fine-tunings en SO-101: cualquier experimento posterior sobre el mismo robot puede medirse contra el checkpoint del paso 10.000 en la tarea de pulsar el botón.
- Evaluación comparativa en Armnet-Bench: el modelo está pensado para enviarse al espacio de evaluación de Armnet con 20 rollouts y semilla de variación 42, lo que permite situarlo en una tabla común con otros runs.
- Plantilla de hiperparámetros para entrenamiento de políticas pi0: la configuración YAML documentada (batch 32, 10.000 pasos, bfloat16, gradient checkpointing, `chunk_size` 50, semilla 1000) sirve como receta de partida reproducible para laboratorios con recursos limitados.
- Estudio de estrategias de inicialización de políticas: al ser un brazo de control que reemplaza el bloque de política en lugar de fusionarlo, es útil para analizar cómo afecta la inicialización desde pesos preentrenados frente al merge de parámetros.
- Docencia e investigación en VLA: sirve para ilustrar el ciclo completo de un pipeline LeRobot, desde el dataset y el entrenamiento hasta el despliegue en robot real, con un coste de cómputo moderado.
- Punto de partida para ampliación multi-tarea: al mantener intacta la arquitectura pi0, puede servir para experimentos de co-entrenamiento sobre varios datasets de manipulación antes de abordar tareas nuevas.
- Prueba de infraestructura de evaluación robótica: útil para validar la cadena de carga (`lerobot[pi]`, tokenizer restringido, política en bfloat16) y el envío al espacio de evaluación antes de lanzar campañas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card únicamente cita cifras de otros runs del mismo proyecto, que se recogen aquí como contexto y no como rendimiento propio:

| Entrada citada | Tarea o ámbito | Resultado | Fuente |
|---|---|---|---|
| pravsel/pi0_busybox_push_green_button | push_green_button | 52,5% | Model card del modelo |
| Armnet-Bench (entradas π0.5) | Benchmark global | 47,5% | Model card del modelo |
| Armnet-Bench (entradas pi0) | Benchmark global | 35% | Model card del modelo |
| fanqi-robo/pi05_busybox_push_green_button_pi0_control | push_green_button (20 rollouts, semilla 42) | No publicado; pendiente de evaluación en robot real | Model card del modelo |

No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes: son benchmarks de modelos de lenguaje y no aplican a una política de control robótico.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 8,1 GB (4,03 B de parámetros), coherente con un repositorio de 8,9 GB.
- Pesos en fp32: aproximadamente 16,1 GB si se convierte la precisión.
- VRAM estimada para inferencia: por encima de los pesos por el estado de activaciones del backbone visual y del módulo de acción; no se publica una cifra concreta de memoria pico.
- GPU recomendadas para entrenamiento: la configuración usa bfloat16 y gradient checkpointing con batch 32. Son razonables A100 (40/80 GB), H100, L40S y, con margen ajustado y batch reducido, GPUs de 24 GB.
- ¿Cabe en GPU de consumo? Los pesos bf16 (~8,1 GB) entran en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, siempre que se ajuste el batch y se mantenga el gradient checkpointing si se reentrena. No se documenta un modo de cuantización que reduzca aún más el consumo.
- Opciones de despliegue: pilas LeRobot (`lerobot-train`, `lerobot-eval`) con `lerobot[pi]` y PyTorch/CUDA. Los servidores para LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a esta política VLA, ya que no exponen una API de texto.
- Requisito de acceso: la carga del tokenizer `google/paligemma-3b-pt-224` exige un token de Hugging Face con permiso de lectura sobre ese repositorio restringido.
- Latencia y throughput: no disponibles. Como referencia estructural, cada inferencia produce un bloque de 50 acciones, de modo que la frecuencia efectiva de control depende del tiempo de cómputo por bloque.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Tarea y datos | Resultado publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fanqi-robo/pi05_busybox_push_green_button_pi0_control (este modelo) | 4,03 B | 48 tokens de prompt | push_green_button, 39 episodios de armnet/busybox_push_green_button | No publicado | apache-2.0 | Publico en Hugging Face; requiere tokenizer restringido |
| lerobot/pi0_base | No disponible | No disponible | Modelo base preentrenado de pi0 | No disponible | No disponible en la información proporcionada | Publico en Hugging Face |
| pravsel/pi0_busybox_push_green_button | No disponible | No disponible | push_green_button, misma tarea | 52,5% citado en la model card | No disponible en la información proporcionada | Publico en Hugging Face |
| Runs de π0.5 del mismo proyecto (por ejemplo, la rama b0) | No disponible | No disponible | push_green_button y benchmark global | 47,5% global citado en la model card | No disponible en la información proporcionada | No disponible |

La comparación es incompleta por diseño: la información disponible solo permite contrastar el rendimiento de este checkpoint con cifras agregadas de otros runs, no con especificaciones técnicas de esos modelos.

## Limitaciones y advertencias

- Alcance de una sola tarea: la política está ajustada exclusivamente para pulsar el botón verde; no generaliza a otras tareas, objetos ni entornos sin reentrenamiento.
- Un solo embodiment: está entrenada para el robot SO-101; su uso en otro hardware no está validado.
- Dataset muy reducido: 39 episodios, sin partición de validación ni de test. No hay medida de generalización fuera de la distribución de demostraciones.
- Sin evaluación publicada: no existen resultados de este checkpoint en la plataforma de evaluación; cualquier afirmación sobre su rendimiento es provisional.
- Riesgo de sobreajuste y de fallo en variaciones: al entrenar sobre una única tarea con `eval_freq: -1`, no se dispone de señales de validación durante el entrenamiento que permitan detectar degradación.
- Alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente en control, con acciones erróneas o inseguras cuando la observación se aleja de lo visto en entrenamiento.
- Nomenclatura confusa: el identificador del repositorio incluye `pi05` aunque el contenido es un run de pi0, lo que puede inducir a error al comparar resultados.
- Dependencia de revisión fijada: el propio autor fija `lerobot/pi0_base` en la revisión `26b99b94` porque revisiones posteriores usan un procesador que LeRobot 0.5.1 no puede cargar. Cambiar de revisión puede romper la carga.
- Licencia y capas intermedias: la etiqueta del repositorio es apache-2.0, pero el modelo deriva de `lerobot/pi0_base`, que a su vez depende del tokenizer y presumiblemente de pesos de `google/paligemma-3b-pt-224`, de acceso restringido y sujeto a sus propios términos. Conviene verificar las condiciones aplicables antes de un uso comercial.
- Requisito operativo: la carga necesita `lerobot[pi]` y un token con permiso de lectura sobre el repositorio restringido del tokenizer, lo que complica la reproducibilidad en entornos cerrados.
- Uso responsable: al tratarse de una política de control físico, cualquier despliegue debe ir acompañado de límites de par, paradas de emergencia y supervisión, especialmente en fase experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_pi0_control
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/armnet/busybox_push_green_button
- Checkpoints anteriores: https://huggingface.co/fanqi-robo/pi05_busybox_push_green_button_pi0_control_ckpts
- Espacio de evaluación: https://huggingface.co/spaces/armnet/armnet-eval
- Seguimiento de experimentos en W&B: https://wandb.ai/fanqi-robo-saferobotics/pi05_busybox_push_green_button
- Tokenizer restringido requerido: https://huggingface.co/google/paligemma-3b-pt-224
- Run de referencia citado en la model card (pravsel/pi0_busybox_push_green_button): no se proporciona URL en la información disponible
- Código del estudio de ablación (`experimental/lerobot_policy_pi05/`, rama `policy_test_fanqi`, proyecto alpha-robotics): no se proporciona URL en la información disponible
