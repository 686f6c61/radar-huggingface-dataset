# chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_10k

## Resumen

`task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_10k` es un checkpoint de política robótica basado en pi0.5 (pi05), desarrollado por el usuario `chomeed` y publicado en Hugging Face. No es un modelo de lenguaje generalista: es una política visuomotora de tipo vision-language-action (VLA) afinada para una tarea concreta de manipulación bimanual con un robot Hyundai Duet, consistente en insertar un cable en un módulo de control (Task 2, "GRC cable insertion"). El modelo parte de `lerobot/pi05_base` y se ha afinado en cascada sobre un checkpoint previo de 40.000 actualizaciones, con un total de 4.143.404.816 parámetros y un repositorio de 16,6 GB.

La particularidad técnica del modelo es que combina predicción de acciones con predicción de subtareas de alto nivel: el componente VLM genera la subtarea actual como texto y el "action expert" condiciona la generación de la acción sobre esa subtarea. La acción se emite como un chunk de 30 pasos en un espacio de 18 dimensiones (14 articulaciones de brazo más 4 articulaciones de índice), con brazos expresados de forma relativa al estado actual e índices en términos absolutos. La entrada incluye tres cámaras (d405_left, d405_right, zed_mini) y un vector de estado de 18 dimensiones.

Este checkpoint corresponde al paso 10.000 de 20.000 de un entrenamiento de refinamiento con la estrategia SIRIUS (mezcla ponderada por clase de demostraciones humanas, intervenciones, frames previos a intervención y rollouts autónomos) sobre la primera ronda de DAgger de la política de 40k. Es relevante para quienes trabajan en imitation learning y VLA aplicado a robótica de manipulación fina, porque documenta de forma muy detallada el esquema de datos, el balanceo de muestreo y el contrato de entrada/salida en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (pi05) con experto de acciones y predicción de subtarea; plugin `lerobot_policy_pi05_subtask` sobre LeRobot 0.6.2 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (prompt de tarea + estado + subtarea; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (prompts de tarea en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (más `policy_preprocessor_*` / `policy_postprocessor_*` en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5 de LeRobot, un VLA que combina un modelo vision-language con un experto de acciones que genera chunks de acciones. En esta variante `pi05_subtask`, el VLM escribe la subtarea actual tras el prompt y el experto de acciones condiciona sobre ella. El formato de prompt es `Task: insert the cable into the control module, State: {7 or 18 numbers};\nSubtask: {subtask};\nAction:`. La pérdida es la suma de la pérdida de flow matching más 0,1 veces la entropía cruzada de la subtarea.

El entrenamiento se realizó en 20.000 actualizaciones (checkpoints cada 10.000) con batch de 128 por actualización (64 por GPU en 2× B200 con DDP), optimizador AdamW con lr pico 1e-05, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-06, precisión bf16 con pesos maestros fp32 y gradient checkpointing. Los datos combinan las demostraciones del checkpoint de 40k (subtask 1: 40 episodios solo brazo derecho; subtask 2: 50; subtask 3: 54) con la primera ronda de DAgger de subtask 2 (50 episodios, 122.397 frames, 51% operador) y de subtask 3 (50 episodios, 119.523 frames, 65% operador). El muestreo SIRIUS usa ratios fijos por clase: 50% demo, 40% intervenciones, 0% pre-intervención y 10% rollouts autónomos, independientemente del tamaño de cada clase. La normalización está congelada a las estadísticas de `hyundai_duet_task2` (q01/q99, subtareas ponderadas por igual, brazos relativos sobre chunks de 30 pasos). La pérdida de entrenamiento en el paso 10.000 es 0,003.

## Capacidades

- Predicción de acciones visuomotoras en espacio de 18 dimensiones con chunk de 30 pasos (`n_action_steps=30`).
- Predicción de subtarea de alto nivel en texto, que condiciona la generación de acciones.
- Manejo de acciones relativas al estado actual para las 14 articulaciones de brazo, con 4 articulaciones de índice (right_index_joint2/3, left_index_joint2/3) en espacio absoluto.
- Enmascaramiento por dimensión mediante `state_dim_is_pad` / `action_dim_is_pad` (bool, 18): permite entrenar y ejecutar subtareas de un solo brazo (subtask 1 es solo brazo derecho, con las 11 dimensiones restantes enmascaradas).
- Fusión de tres cámaras (d405_left, d405_right, zed_mini) sin recorte.
- Control bimanual coordinado (Hyundai Duet).
- No se documentan capacidades de tool calling, agentes multi-paso genéricos, matemáticas, código ni audio; es una política robótica específica de tarea.

## Casos de uso

- Inserción de cable en módulo de control con robot Hyundai Duet: es el caso de uso directo del checkpoint; ejecuta la política entrenada para las tres subtareas (empujar el módulo al centro, devolver los brazos a pose de reposo, agarrar el cable, girar la cabeza, insertar ambos extremos).
- Investigación en imitation learning con DAgger: el checkpoint sirve como punto de partida para una segunda ronda de DAgger, ya que documenta la mezcla SIRIUS y los ratios de muestreo por clase.
- Estudio de predicción de subtareas en VLAs: permite analizar cómo el condicionamiento textual de la subtarea afecta a la generación de acciones y a la estabilidad del chunk.
- Manipulación bimanual con enmascaramiento por dimensión: útil para reproducir el esquema de entrenamiento con `state_dim_is_pad`/`action_dim_is_pad` en tareas donde solo un brazo actúa.
- Evaluación de políticas con acciones relativas: sirve como referencia para comparar el efecto de `use_relative_actions=true` frente a políticas con acciones absolutas en tareas de inserción fina.
- Reproducción de pipelines LeRobot: el repo incluye los procesadores pre/post, de modo que se puede cargar la política con `PI05SubtaskPolicy.from_pretrained` y `make_pre_post_processors` para reproducir exactamente la normalización usada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 10.000 (0,003), que no es comparable con métricas de éxito en robot ni con benchmarks estándar.

## Requisitos de hardware

- El entrenamiento se realizó con 2× B200 en DDP (batch 64 por GPU), lo que da una idea del orden de magnitud de memoria necesaria para entrenar; no se documenta el consumo exacto.
- VRAM de inferencia: no disponible. Con 4.143.404.816 parámetros, una inferencia en bf16 requeriría del orden de 8 GB solo para pesos, más activaciones y los tres flujos de cámara; no se confirma en la información disponible.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabría esperar GPUs de datacenter (A100, H100, B200) para entrenamiento y GPUs consumer de gama alta para inferencia, pero no hay datos publicados.
- Despliegue: framework LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (instalable desde `git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask@9b0f897`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_10k` | 4.143.404.816 | no disponible | Inserción de cable bimanual (Hyundai Duet) | no disponible | Hugging Face, 0 descargas |
| `chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k` (checkpoint base del afinamiento) | no disponible | no disponible | Misma tarea, tres subtareas, 40k actualizaciones | no disponible | Hugging Face |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | Política VLA generalista pi0.5 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a linaje y propósito.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot (Hyundai Duet, Task 2); no es un modelo generalista y no se espera que funcione fuera de ese montaje.
- Requiere el contrato exacto de entrada: tres cámaras concretas, estado de 18 dimensiones, prompt con la tarea y la subtarea, y `state_dim_is_pad` correcto en el robot (True en dimensiones 7-17 durante "push the control module to the center" y "return both arms back to ready pose").
- Antes de la primera llamada de 18 dimensiones hay que mover las manos a 0,6922 / 0,2584; ignorar este paso puede invalidar la ejecución.
- La normalización está congelada a las estadísticas de `hyundai_duet_task2`; usar otros procesadores rompe la escala de acciones del warm start.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles; los prompts de tarea están en inglés.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política robótica, el fallo se manifiesta como acciones incorrectas, no como texto inventado.
- El checkpoint es el paso 10.000 de 20.000, por lo que no es el resultado final del entrenamiento SIRIUS.
- Sin descargas ni likes en el momento de la consulta; no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_10k
- Checkpoint base del afinamiento: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtask 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtask 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/imjaz5c4
