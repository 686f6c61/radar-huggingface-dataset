# chomeed/task1_subtask_rel_chunk30_sirius_bs128_R2_grconly_fromR2mixed_1117_10k

## Resumen
Este repositorio contiene un checkpoint de investigación de pi0.5 (pi05), un modelo visión-lenguaje-acción (VLA) orientado a robótica manipulativa, afinado por el usuario chomeed sobre el modelo base `lerobot/pi05_base`. El modelo resuelve una tarea concreta de manipulación bimanual sobre el conjunto de datos `chomeed/hyundai_duet_task1`: predecir una subtarea de alto nivel en lenguaje natural y, condicionado por ella, generar un chunk de 30 acciones de 8 dimensiones para un brazo robótico. No es un modelo de propósito general: es un artefacto de experimentación con un pipeline, una normalización y unos recortes de cámara muy específicos.

La arquitectura subyacente es la de pi0.5, un VLA que combina un backbone VLM tipo PaliGemma con un experto de acciones basado en flow matching. La innovación de este fine-tuning es el esquema de predicción de subtareas: el VLM escribe primero la subtarea actual tras el prompt y el experto de acciones condiciona sobre ella, con una pérdida compuesta de flow matching más entropía cruzada ponderada. El entrenamiento se hizo con el plugin `lerobot_policy_pi05_subtask` sobre LeRobot 0.6.2.

El checkpoint corresponde a la actualización de optimizador 10.000 de 10.000 (20.000 pasos de bucle con acumulación de gradiente 2), partiendo de un modelo previamente entrenado en 276 episodios mixtos y afinado aquí solo con los 133 episodios GRC. Es relevante como ejemplo reproducible de cómo se inyecta supervisión lingüística jerárquica (subtask) en un VLA y de cómo se controla el muestreo por clase de transición (demostración, intervención, rollout autónomo) mediante ratios fijos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5: backbone VLM (PaliGemma) + experto de acciones con flow matching |
| Parametros totales | 4.143.404.816 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con master weights fp32) |
| Idiomas soportados | no disponible (prompts en inglés en la plantilla de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB, incluye procesadores pre/post) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura pi0.5: un VLM que procesa imágenes de tres cámaras (d405_left, d405_right, zed_mini) junto con el estado de 18 dimensiones y el prompt de tarea, y un experto de acciones que genera chunks de 30 acciones de 8 dimensiones mediante flow matching con 10 pasos de inferencia. La particularidad es la cabecera de subtarea: el VLM emite primero la subtarea actual en texto (decodificada de forma greedy con la LM head de PaliGemma) y el experto de acciones condiciona sobre esa representación. La pérdida es `flow + 0.1 × cross-entropy de subtarea`, siguiendo el ratio CE/flow de pi0.5.

El entrenamiento se realizó con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` (variante `pi05_subtask`) más `lerobot_sirius`, con AdamW (lr pico 1e-05, warmup 2000, cosine hasta 2.5e-06), batch efectivo 128 (64 por GPU en una B200 con acumulación 2), precisión bf16 con master weights fp32 y gradient checkpointing. Se usaron exclusivamente los 133 episodios GRC del dataset (60 demos, 38 episodios DAgger ronda 1 y 35 de ronda 2), reetiquetados con las anotaciones `early45f` de subtarea. El muestreo SIRIUS aplica ratios fijos por clase: 50% demostraciones humanas, 40% frames de intervención, 10% rollouts autónomos y 0% frames previos a intervención (3,0 s). La normalización está congelada a las estadísticas del checkpoint base, no a las de los episodios GRC, y los recortes de cámara deben replicarse en inferencia (d405_left 265,64,424,223; d405_right 184,0,424,240; zed_mini 357,1,1076,720). La pérdida de entrenamiento reportada en este paso es 0,002.

## Capacidades
- Generación de chunks de acción de 8 dimensiones y 30 pasos para control robótico, con acciones relativas al estado actual (salvo `gripper_r_closed`, que se mantiene absoluta).
- Predicción de subtarea de alto nivel en lenguaje natural antes de la acción, entre tres etiquetas: `grasp the board with the right hand`, `turn the head to the center` e `insert the board into the control module`.
- Condicionamiento multimodal: tres vistas de cámara más estado proprioceptivo de 18 dimensiones.
- Inferencia con flow matching de 10 pasos sobre la caché que contiene la subtarea decodificada.
- Integración con el ecosistema LeRobot mediante `PI05SubtaskPolicy.from_pretrained` y `predict_action_chunk`, exponiendo `policy.last_subtask`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni razonamiento conversacional; el modelo está especializado en la tarea de manipulación descrita.

## Casos de uso
- Investigación en VLAs jerárquicos: reproducir el esquema de subtarea de pi0.5 y medir el efecto de la supervisión lingüística intermedia sobre la política de acciones, usando el checkpoint como línea base frente a variantes sin subtarea.
- Manipulación bimanual de inserción de placas: el modelo genera el chunk de 30 acciones necesario para agarrar la placa, girar la cabeza y insertarla en el módulo de control, con las tres cámaras y el estado de 18 dimensiones como entrada.
- Estudio de DAgger y corrección humana: al haberse entrenado con 73 episodios de intervención (38 de ronda 1 y 35 de ronda 2), sirve para analizar cómo el muestreo ponderado de frames de intervención (40%) afecta a la recuperación de errores.
- Evaluación de esquemas de muestreo por clase: el checkpoint permite comparar los ratios SIRIUS fijos (50/40/10/0) frente a muestreo uniforme en tareas con pocos frames de intervención.
- Base para fine-tuning en dominios similares: al derivar de un modelo mixto Yonsei+GRC, puede reutilizarse como inicialización para otras tareas de ensamblaje con anotaciones de subtarea.
- Reproducción de pipelines LeRobot: sirve como referencia de configuración completa (normalización congelada, recortes de cámara, plantilla de prompt `Task: {task}, State: {state};\nSubtask: {subtask};\nAction:`) para integrar un VLA en un bucle de control real.
- Análisis de latencia en robótica: con 4.143 millones de parámetros y 10 pasos de flow matching, es un caso práctico para medir el coste de decodificar subtarea más chunk en hardware B200 o equivalente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento en el paso 10.000 (0,002) y el enlace al run de Weights & Biases, sin métricas de éxito en tarea, tasas de inserción ni comparaciones con otros checkpoints.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Con 4.143 millones de parámetros en bf16, los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB (coincide con el tamaño del repo). A ello hay que sumar el estado de activaciones del VLM y del experto de acciones, por lo que en la práctica se recomienda al menos 24 GB para bf16.
- GPU de entrenamiento documentada: una NVIDIA B200 con batch 64 por GPU, acumulación 2 y gradient checkpointing.
- GPU recomendadas para inferencia: no disponibles en la información. Por tamaño, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB son candidatas razonables, pero no está verificado.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB o más en bf16, aunque no hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (`pip install git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask`) y `lerobot_sirius`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia requiere decodificación greedy de la subtarea más 10 pasos de flow matching, lo que añade coste frente a una política puramente de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05_subtask, GRC only) | 4.143 M | no disponible | VLA con subtarea, dataset hyundai_duet | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k | no disponible | no disponible | VLA con subtarea, 276 episodios mixtos | no disponible | Hugging Face (checkpoint de partida) |
| chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k | no disponible | no disponible | VLA sin subtarea, origen de las estadísticas de normalización | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos checkpoints; la comparación se limita a linaje, datos de entrenamiento y configuración.

## Limitaciones y advertencias
- Sesgos: no documentados por el autor. El entrenamiento usa solo 133 episodios de una única tarea y un único entorno (GRC), por lo que la generalización a otras tareas, objetos o configuraciones de cámara es muy limitada.
- Alucinación: la subtarea se decodifica de forma greedy con la LM head de PaliGemma; no hay verificación de que la subtarea emitida sea coherente con el estado real del robot, lo que puede producir condicionamientos erróneos del experto de acciones.
- Dependencia de normalización y recortes: la normalización está congelada a las estadísticas del checkpoint base (no a las de los episodios GRC) y las imágenes deben recortarse exactamente a las cajas indicadas. Omitir los recortes o usar otras estadísticas invalida las predicciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución. El modelo base es `lerobot/pi05_base`, cuya licencia debe verificarse por separado.
- Idiomas: la plantilla de prompt y las etiquetas de subtarea están en inglés; no hay soporte multilingüe documentado.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, checkpoint de investigación sin validación externa ni métricas de éxito publicadas.
- Restricciones de acción: las acciones son relativas al estado actual salvo `gripper_r_closed`; mezclar convenciones absolutas y relativas en el bucle de control puede degradar el comportamiento.
- Fecha de creación anómala (2026-11-17) en los metadatos de Hugging Face; conviene tratarla con cautela.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/chomeed/task1_subtask_rel_chunk30_sirius_bs128_R2_grconly_fromR2mixed_1117_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de partida: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k
- Origen de las estadísticas de normalización: https://huggingface.co/chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/hyundai_duet_task1
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento (Weights & Biases): https://wandb.ai/meeroro56/hyundai_duet/runs/7itdh2mg
