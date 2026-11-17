# chomeed/task1_subtask_rel_chunk30_sirius_bs128_R2_grconly_fromR2mixed_1117_5k

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en pi0.5 (pi05), el modelo vision-language-action (VLA) de Physical Intelligence, adaptado mediante el plugin `lerobot_policy_pi05_subtask` para predecir explícitamente un subtask de alto nivel antes de generar acciones. Lo publica el usuario `chomeed` como parte de una línea de experimentos de manipulación robótica sobre el dataset `chomeed/hyundai_duet_task1`, centrada en una tarea de inserción de placa en un módulo de control con un brazo derecho.

El modelo parte de `lerobot/pi05_base` y se ha afinado en dos etapas: primero sobre una mezcla de episodios Yonsei y GRC (checkpoint intermedio `board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k`) y después únicamente sobre los 133 episodios GRC, que incluyen 60 demostraciones humanas y 73 episodios de DAgger (38 de ronda 1 y 35 de ronda 2). El checkpoint corresponde a la actualización 5.000 de 10.000 del optimizador (paso 10.000 de 20.000 en bucle con acumulación de gradiente 2), con una loss de entrenamiento de 0,003 en ese punto.

Es relevante porque documenta una receta concreta de entrenamiento VLA con predicción de subtask, muestreo ponderado por clase (SIRIUS) y acciones relativas, con detalles suficientes para reproducir la inferencia (cropping de cámaras, estadísticas de normalización congeladas, formato del prompt). No es un modelo de propósito general: es un artefacto de investigación muy específico de una tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (PaliGemma VLM + action expert de flow matching), plugin `pi05_subtask` sobre LeRobot 0.6.2 |
| Parámetros totales | 4.143.404.816 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de tarea + estado + subtask; sin cifra publicada) |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB, incluye `policy_preprocessor_*` y `policy_postprocessor_*`) |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Entradas | 3 cámaras (d405_left, d405_right, zed_mini) + estado de 18 dimensiones |
| Salida | acción de 8 dimensiones, chunk de 30 pasos (`n_action_steps=30`) |
| Espacio de acciones | relativo al estado actual (`use_relative_actions=true`); `gripper_r_closed` se mantiene absoluto |
| Subtasks | `grasp the board with the right hand`, `turn the head to the center`, `insert the board into the control module` |
| Precisión de entrenamiento | bf16 autocast, pesos maestros fp32, gradient checkpointing |
| Optimizador | AdamW, lr pico 1e-05, warmup 2000, coseno hasta 2,5e-06 |
| Batch | 128 por actualización (64 por GPU x 1 B200 x acumulación 2) |
| Dataset | `chomeed/hyundai_duet_task1@modified_cropped`, solo episodios GRC (133) |

## Arquitectura y entrenamiento

La arquitectura es la de pi0.5: un VLM tipo PaliGemma que primero escribe el subtask actual tras el prompt y un action expert que genera acciones condicionado por ese subtask mediante flow matching. El formato de prompt es `Task: {task}, State: {state};\nSubtask: {subtask};\nAction:`. La loss combina el término de flow con 0,1 veces la entropía cruzada del subtask (equivalente a la CE de pi0.5 con ratio flow 10x). En inferencia, el subtask se decodifica de forma greedy con la LM head de PaliGemma y después se ejecutan los 10 pasos de flow sobre la caché que lo contiene.

El entrenamiento se hace sobre 133 episodios GRC renumbered 0-132: 60 demostraciones humanas (63-122), 38 episodios DAgger GRC de ronda 1 (203-240) y 35 de ronda 2 (241-275), sin episodios Yonsei. El muestreo SIRIUS es fijo por clase con independencia de su tamaño: 50% para frames de demostración (44,1% de los frames), 40% para frames de intervención humana (3,6%), 0% para los 3,0 s previos a cada intervención (10,4%) y 10% para rollouts autónomos (41,9%). Las etiquetas de subtask se delimitan por el giro de cabeza, con `turn the head to the center` empezando 1,5 chunks de acción (45 frames, 1,5 s) antes del movimiento y `insert the board into the control module` cuando se detiene, según la anotación `language_persistent` del dataset desplazada por `build_task1_grconly_root.py`. La normalización está congelada a las estadísticas del checkpoint base y las imágenes se usan tal cual, por lo que es obligatorio replicar los crops en inferencia: d405_left 265,64,424,223; d405_right 184,0,424,240; zed_mini 357,1,1076,720.

## Capacidades

- Predicción de subtask de alto nivel antes de la generación de acciones, con el subtask accesible en `policy.last_subtask` tras la inferencia.
- Generación de chunks de acción de 30 pasos en espacio relativo al estado actual, con el cierre del gripper derecho en espacio absoluto.
- Fusión de tres vistas de cámara (dos D405 y una ZED Mini) más un vector de estado de 18 dimensiones.
- Ejecución de una tarea de manipulación concreta: coger una placa con la mano derecha, girar la cabeza al centro e insertarla en un módulo de control.
- Soporte de inferencia con el plugin `lerobot_policy_pi05_subtask` y carga directa con `from_pretrained` incluyendo procesadores de normalización.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni otros idiomas distintos del inglés de los prompts de ejemplo.

## Casos de uso

- Reproducción de experimentos VLA con subtask: cargar la política con sus procesadores y ejecutar `predict_action_chunk` sobre batches del dataset `hyundai_duet_task1` para comparar la receta GRC-only frente al checkpoint mixto previo.
- Investigación en DAgger y corrección de políticas: el modelo incorpora episodios de intervención humana de dos rondas con muestreo sobrerrepresentado (40%), útil para estudiar cómo el DAgger corrige el sesgo de rollouts autónomos.
- Estudio de predicción de subtask como variable intermedia: inspeccionar `policy.last_subtask` permite analizar la coherencia entre el subtask decodificado y la acción generada, y evaluar el efecto de la CE auxiliar.
- Benchmarking de manipulación con inserciones de precisión: la tarea de insertar una placa en un módulo de control sirve como caso de contacto estrecho para medir tasas de éxito con chunks de 30 pasos.
- Base para nuevos fine-tunings sobre el mismo robot: al ser un checkpoint intermedio (5.000/10.000 updates) con estadísticas de normalización congeladas, puede reutilizarse como inicialización para variantes de la misma tarea.
- Análisis de estrategias de muestreo por clase: comparar los ratios SIRIUS fijados (50/40/0/10) frente a muestreo uniforme en la misma tarea y dataset.
- Validación de pipelines de inferencia LeRobot: probar la integración del plugin `lerobot_policy_pi05_subtask` y el manejo de crops y procesadores en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la loss de entrenamiento en el paso del checkpoint: 0,003.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4.143 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB, más el estado de activaciones y las tres cámaras.
- GPU de entrenamiento documentada: una NVIDIA B200 con batch 64 por GPU y acumulación de gradiente 2 (batch efectivo 128).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs de datacenter (A100, H100, B200) para entrenamiento y GPUs consumer de gama alta para inferencia, pero el autor no lo especifica.
- ¿Cabe en GPU consumer? No confirmado. El tamaño de pesos en bf16 es compatible con GPUs de 16-24 GB, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (`pip install git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask`) y `lerobot_sirius` con `--policy.type=pi05_subtask`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`task1_subtask_rel_chunk30_sirius_bs128_R2_grconly_fromR2mixed_1117_5k`) | 4.143 M | no disponible | Inserción de placa, GRC-only, con subtask | no disponible | Hugging Face, 0 descargas |
| `chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k` | no disponible | no disponible | Misma tarea, mezcla Yonsei + GRC (276 episodios) | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base pi0.5 de propósito general | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, datos de entrenamiento y disponibilidad.

## Limitaciones y advertencias

- Modelo hiperespecializado: entrenado solo para la tarea de inserción de placa del dataset `hyundai_duet_task1` con el brazo derecho; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Checkpoint intermedio: corresponde a la actualización 5.000 de 10.000 del optimizador, no al modelo final del run.
- Normalización congelada a estadísticas de un checkpoint anterior (`board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k`), no a las de los episodios GRC; usar los procesadores del repo es obligatorio para reproducir la inferencia.
- Crops de cámara obligatorios y específicos (d405_left 265,64,424,223; d405_right 184,0,424,240; zed_mini 357,1,1076,720); no aplicarlos invalida las predicciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin descargas ni likes en el momento de la consulta, y sin resultados de benchmarks publicados: no hay evidencia externa de rendimiento en el mundo real.
- Riesgo de alucinación del subtask: al decodificarse de forma greedy con la LM head, un subtask incorrecto condiciona todo el chunk de acciones de 30 pasos.
- Sesgos de datos: el muestreo SIRIUS sobrerrepresenta intervenciones humanas (40%) y demostraciones (50%) frente a rollouts autónomos (10%), lo que puede sesgar el comportamiento hacia las trayectorias corregidas.
- Idiomas: los prompts de ejemplo están en inglés; no hay información sobre otros idiomas.
- No se documentan cuantizaciones ni requisitos de hardware para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task1_subtask_rel_chunk30_sirius_bs128_R2_grconly_fromR2mixed_1117_5k
- Modelo base pi0.5: https://huggingface.co/lerobot/pi05_base
- Checkpoint de partida (mezcla R2): https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k
- Dataset: https://huggingface.co/datasets/chomeed/hyundai_duet_task1
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/7itdh2mg
