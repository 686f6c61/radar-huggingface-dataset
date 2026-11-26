# chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_20k

## Resumen

`chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_20k` es un checkpoint de política robótica (vision-language-action, VLA) derivado de pi0.5, desarrollado por el usuario chomeed y publicado en Hugging Face. No es un modelo de lenguaje general: es un modelo de control para un robot bimanual Hyundai Duet que ejecuta la tarea 2 de inserción de cable en un módulo de control (GRC), con predicción explícita de subtareas de alto nivel. El checkpoint corresponde al paso 20.000 de 20.000 de la tercera ronda de fine-tuning con datos DAgger (SIRIUS round 3).

El modelo parte de `lerobot/pi05_base` y se ha afinado de forma iterativa: 40.000 pasos iniciales, seguidos de tres rondas de 20.000 pasos cada una, con recogida de datos DAgger entre rondas (intervenciones humanas por realidad virtual sobre ambos brazos). El resultado es un modelo de 4.143.404.816 parámetros (unos 4,14 mil millones) que combina un componente VLM que escribe la subtarea actual y un experto de acción que la usa como condicionamiento, generando chunks de 30 acciones de 18 dimensiones.

Su relevancia es acotada pero significativa: documenta con detalle inusual un pipeline completo de entrenamiento robótico con DAgger iterativo, acciones relativas, enmascarado de dimensiones y predicción de subtareas, lo que lo convierte en una referencia útil para equipos que construyen políticas VLA con LeRobot. La licencia no está declarada, lo que limita su reutilización comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action): VLM con experto de acción tipo flow matching y predicción de subtarea de alto nivel |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (prompts de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 16,6 GB) |
| Framework | LeRobot 0.6.2 con plugin `pi05_subtask` (`lerobot_policy_pi05_subtask`) y `lerobot_sirius` |
| Entradas | 3 cámaras (d405_left, d405_right, zed_mini, sin recorte) + estado de 18 dimensiones |
| Salidas | acción de 18 dimensiones, chunk de 30 (`n_action_steps=30`) |
| Espacio de acciones | relativo al estado actual; absolutos: right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3 |
| Checkpoint | paso 20.000 de 20.000 (checkpoints cada 10.000) |
| Pérdida de entrenamiento | 0,002 en este paso |

## Arquitectura y entrenamiento

La política sigue la arquitectura pi0.5 de Physical Intelligence, integrada en LeRobot: un modelo visión-lenguaje que procesa las tres cámaras y el estado del robot junto con el prompt de tarea, y un experto de acción que genera trayectorias mediante flow matching. La innovación principal de esta variante es la predicción explícita de subtarea: el VLM escribe la subtarea actual tras el prompt y el experto de acción condiciona sobre ella. El formato de prompt es `Task: insert the cable into the control module, State: {7 or 18 numbers};\nSubtask: {subtask};\nAction:`. La función de pérdida combina el término de flow con 0,1 veces la entropía cruzada de la subtarea.

El entrenamiento se realizó con AdamW, learning rate pico de 1e-05, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-06 en 20.000 pasos, con batch de 128 por actualización (64 por GPU en 2× B200 con DDP), autocast bf16 con pesos maestros en fp32 y gradient checkpointing. Los datos combinan demostraciones (40 episodios de subtarea 1, 50 de subtarea 2, 54 de subtarea 3) con tres rondas de DAgger: ronda 1 con 50+50 episodios y 122.397+119.523 fotogramas (51% y 65% de operador), ronda 2 con 30+30 episodios y 111.221+107.362 fotogramas (62% y 67%), y ronda 3 con 50+50 episodios y 126.450+130.715 fotogramas (42% y 44%). El muestreo de entrenamiento se hace por clase con ratios fijos, independientemente del tamaño de cada clase.

Un detalle técnico destacable es el enmascarado de dimensiones para la subtarea 1, que es solo de brazo derecho: los fotogramas llevan `state_dim_is_pad` y `action_dim_is_pad` (bool, 18) con las 11 dimensiones no pertenecientes al brazo derecho a True. Esas dimensiones de estado no se escriben en el prompt y las de acción quedan fuera de la pérdida, tratándose como ruido puro para el experto de acción (`pad_action_dims_as_noise`).

## Capacidades

- Control robótico bimanual de 18 dimensiones (7 articulaciones por brazo más 4 articulaciones de índice) para la tarea de inserción de cable en el módulo de control.
- Predicción de subtarea de alto nivel integrada en el mismo modelo: el VLM genera la subtarea y el experto de acción la usa como condicionamiento.
- Generación de chunks de acción de 30 pasos, lo que reduce la frecuencia de inferencia necesaria en el bucle de control.
- Acciones relativas al estado actual para las articulaciones de los brazos, con articulaciones de índice en espacio absoluto.
- Procesamiento multimodal de tres cámaras simultáneas (dos RealSense D405 y una ZED Mini) sin recorte.
- Manejo de estados parcialmente enmascarados mediante `state_dim_is_pad`, permitiendo ejecutar subtareas de un solo brazo sin escribir dimensiones irrelevantes.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico ni capacidades multilingües declaradas; su alcance es exclusivamente robótico y específico de la tarea.

## Casos de uso

- Automatización de inserción de cables en línea de montaje: el modelo ejecuta la tarea completa de insertar el cable en el módulo de control, con subtareas encadenadas (empujar el módulo al centro, volver a pose de reposo, agarrar el cable, girar la cabeza, insertar). Es adecuado porque ha sido entrenado específicamente sobre esa secuencia con datos de demostración y DAgger.
- Investigación en aprendizaje por imitación con DAgger iterativo: sirve como referencia reproducible de un pipeline de tres rondas de intervención humana por VR, con ratios de operador documentados (42-67%), para estudiar cómo evoluciona la política entre rondas.
- Desarrollo de políticas VLA con predicción de subtareas: el formato de prompt y la pérdida combinada (flow + 0,1 × cross-entropy) son un punto de partida para experimentos que requieran descomponer tareas largas en subtareas explícitas.
- Evaluación de enmascarado de dimensiones en robots bimanuales: el uso de `state_dim_is_pad` y `pad_action_dims_as_noise` permite estudiar cómo afecta el entrenamiento con dimensiones ausentes a la estabilidad de la política.
- Reproducción de experimentos con LeRobot 0.6.2: el checkpoint se carga directamente con el plugin `lerobot_policy_pi05_subtask` y el comando `--policy.type=pi05_subtask`, lo que facilita integrarlo en flujos existentes de LeRobot.
- Base para fine-tuning en tareas de inserción similares: al partir de un modelo ya ajustado a inserción de precisión con tres cámaras y estado de 18 dimensiones, puede servir de inicialización para variantes del mismo montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento en el paso 20.000 (0,002) y el enlace a la ejecución de Weights & Biases, sin métricas de éxito en robot ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el coste de las tres cámaras y del experto de acción, no cuantificado en la información disponible.
- GPU de entrenamiento declaradas: 2× NVIDIA B200 con DDP, 64 muestras por GPU por actualización.
- GPU recomendadas para inferencia: no especificadas. Por tamaño de pesos, una GPU con 24 GB o más (RTX 4090, L40S, A100 40 GB) debería poder alojar los pesos en bf16, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en términos de pesos (RTX 4090 de 24 GB), pero no está verificado ni documentado.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` y `lerobot_sirius` (`--policy.type=pi05_subtask`). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_20k | 4.143.404.816 | no disponible | Inserción de cable bimanual (Hyundai Duet, tarea 2) | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/pi05_base | no disponible en la información | no disponible | Política VLA general base | no disponible | Hugging Face (modelo base) |
| chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k | no disponible | no disponible | Misma tarea, ronda 2 (20k pasos desde ronda 1) | no disponible | Hugging Face (checkpoint predecesor) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a la genealogía de fine-tuning documentada en la model card.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea 2 (inserción de cable en el módulo de control) del robot Hyundai Duet; no es reutilizable como política general.
- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor.
- Sin métricas de éxito en robot publicadas: la única cifra disponible es la pérdida de entrenamiento (0,002), que no garantiza robustez en producción.
- Dependencia estricta del hardware: requiere tres cámaras concretas (d405_left, d405_right, zed_mini) y un estado de 18 dimensiones con nombres específicos; cualquier cambio de montaje invalida el modelo.
- Protocolo de ejecución frágil: antes de la primera llamada de 18 dimensiones hay que mover las manos a 0,6922 / 0,2584, y durante las subtareas de empuje y retorno hay que enviar `state_dim_is_pad` con True en las dimensiones 7-17; omitirlo produce comportamiento incorrecto.
- Riesgo de alucinación de subtarea: el VLM puede predecir una subtarea incorrecta, y el experto de acción condiciona sobre ella, propagando el error a la trayectoria.
- Sesgos de los datos: las demostraciones y las intervenciones DAgger provienen de un operador concreto en un entorno concreto; la política hereda esas preferencias y condiciones de iluminación y colocación.
- Idiomas: los prompts de tarea están en inglés y no se declara soporte multilingüe.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r3_bs128_1125_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint predecesor (ronda 2): https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k
- Plugin LeRobot para pi0.5 con subtareas: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Dataset de demostraciones: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- DAgger ronda 1, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- DAgger ronda 1, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- DAgger ronda 2, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- DAgger ronda 2, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- DAgger ronda 3, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- DAgger ronda 3, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/odi1rvcv
