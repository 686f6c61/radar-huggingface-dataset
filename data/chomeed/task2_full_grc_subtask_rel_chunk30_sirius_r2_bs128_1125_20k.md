# chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k

## Resumen

`chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k` es un checkpoint de política robótica basado en pi0.5 (pi05), desarrollado por el usuario chomeed y publicado en Hugging Face. No es un modelo de lenguaje generalista, sino un modelo de control visuomotor entrenado para una tarea concreta de manipulación bimanual: insertar un cable en un módulo de control con el robot Hyundai Duet. El modelo parte de `lerobot/pi05_base` y se ha ajustado de forma iterativa mediante demostraciones humanas y rondas de DAgger (intervenciones de operador en tiempo real) sobre un conjunto de cinco datasets.

La arquitectura subyacente es pi0.5, un modelo visión-lenguaje-acción (VLA) que combina un backbone VLM con un "action expert" que genera trayectorias de acción. Este checkpoint incorpora una innovación específica: predicción explícita de subtareas de alto nivel, de modo que el VLM escribe la subtarea actual tras el prompt y el experto de acción condiciona su salida sobre ella. El resultado es una política de 4.143 millones de parámetros (4,14 B) que emite chunks de 30 acciones de 18 dimensiones a partir de tres cámaras y un estado de 18 dimensiones.

El interés de esta ficha es acotado: se trata de un artefacto de investigación muy especializado, con licencia no declarada, sin benchmarks publicados y sin idiomas soportados en el sentido habitual. Es relevante para quienes trabajan en imitación robótica con LeRobot y quieran estudiar cómo se estructura un pipeline de SIRIUS (muestreo estratificado por clase de frame) combinado con DAgger iterativo y predicción de subtareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLM + action expert), política VLA para robótica; framework LeRobot 0.6.2 con plugin `pi05_subtask` y `lerobot_sirius` (`--policy.type=pi05_subtask`) |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 16,6 GB) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Otros datos técnicos relevantes: batch de 128 por actualización del optimizador (64 por GPU en 2× B200 con DDP), optimizador AdamW con lr pico 1e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 20.000 pasos; precisión bf16 con pesos maestros en fp32 y gradient checkpointing. Entradas: 3 cámaras (d405_left, d405_right, zed_mini) y estado de 18 dimensiones. Salida: acción de 18 dimensiones con chunk de 30 (n_action_steps 30). Loss de entrenamiento en el paso final: 0,002.

## Arquitectura y entrenamiento

El modelo es un ajuste fino de pi0.5, un VLA que acopla un backbone visión-lenguaje con un experto de acción que predice secuencias de acciones condicionadas por el prompt y las observaciones. En este checkpoint el VLM genera además la subtarea actual, que se inserta en el prompt con el formato `Task: ...; State: {7 or 18 numbers};\nSubtask: {subtask};\nAction:`, y el experto de acción condiciona sobre ella. La función de pérdida combina el flujo (flow matching) con 0,1 × entropía cruzada de la subtarea.

El entrenamiento parte de `chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_20k` (ronda 1 de SIRIUS, a su vez 20k actualizaciones desde el modelo de tarea 2 completo de 40k) y aplica 20.000 actualizaciones adicionales sobre demostraciones humanas más dos rondas de DAgger (ronda 1 grabada el 2026-11-23 sobre el modelo de 40k; ronda 2 el 2026-11-24/25 sobre el de 20k de la ronda 1). Los cinco datasets suman 298.115 frames de demostración, 279.841 de intervención humana, 50.276 de pre-intervención y 130.386 de rollout autónomo. El muestreo SIRIUS es estratificado por clase con ratios fijos independientes del tamaño: 50% demo, 40% intervención, 0% pre-intervención y 10% robot (`--sirius.p_intv=0.4 --sirius.p_demo=0.5 --sirius.p_preintv=0.0 --sirius.preintv_seconds=3.0 --sirius.p_robot_max=0.1`). La normalización está congelada a las estadísticas (q01/q99) de `HDR-AI-tmp/hyundai_duet_task2`, con brazos relativos sobre chunks de 30 pasos.

El espacio de acciones es relativo al estado actual (`use_relative_actions=true`), salvo cuatro articulaciones de índice que se mantienen absolutas: `right_index_joint2`, `right_index_joint3`, `left_index_joint2` y `left_index_joint3`. La subtarea 1 es solo de brazo derecho: sus frames llevan `state_dim_is_pad` / `action_dim_is_pad` (bool, 18) con las 11 dimensiones no derechas marcadas como True; esas dimensiones de estado no se escriben en el prompt y esas dimensiones de acción quedan fuera de la pérdida y se rellenan con ruido para el experto de acción.

## Capacidades

- Control visuomotor bimanual para inserción de cable en módulo de control (tarea 2, GRC), con tres cámaras y estado propioceptivo de 18 dimensiones.
- Predicción explícita de subtareas de alto nivel: "push the control module to the center", "return both arms back to ready pose", "grasp the cable with the right hand", "turn the head to the center", "insert the cable into the port", "insert the other cable end into the port".
- Generación de chunks de acción de 30 pasos con horizonte relativo al estado actual.
- Manejo de máscaras de dimensiones (`state_dim_is_pad`, `action_dim_is_pad`) para fases en las que solo actúa un brazo.
- Condicionamiento por prompt de tarea único: `insert the cable into the control module`.
- No soporta tool calling, function calling, agentes multi-paso en el sentido de software, ni capacidades multilingües o de visión general; es una política robótica especializada.

## Casos de uso

- Investigación en imitación robótica bimanual: reproducir el pipeline SIRIUS + DAgger iterativo sobre una tarea de inserción de precisión y analizar el efecto del muestreo estratificado por clase de frame.
- Estudio de predicción de subtareas en VLAs: evaluar cómo el condicionamiento explícito del experto de acción sobre la subtarea decodificada afecta a la estabilidad de la política en tareas de varios pasos.
- Benchmark interno de LeRobot 0.6.2: usar el checkpoint como referencia para validar el plugin `lerobot_policy_pi05_subtask` y la integración `lerobot_sirius` en un entorno controlado.
- Despliegue en el robot Hyundai Duet para la tarea 2: ejecutar la política con `state_dim_is_pad` correctamente configurado (True en dimensiones 7-17 durante "push" y "return", False en el resto) y mover las manos a 0,6922 / 0,2584 antes de la primera llamada de 18 dimensiones.
- Análisis de DAgger: comparar el comportamiento de este checkpoint (ronda 2) con el de ronda 1 para medir la mejora por intervenciones humanas adicionales en subtareas 2 y 3.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura una model card de robótica con estadísticas de dataset, ratios de muestreo y máscaras de dimensiones.
- Reutilización como inicialización: punto de partida para ajustes finos en tareas de inserción similares con el mismo espacio de acciones de 18 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado es la pérdida de entrenamiento en el paso 20.000 (0,002), que no constituye una métrica de evaluación en entorno real ni es comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 B parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB, y el repo completo pesa 16,6 GB (incluye estados de optimizador u otros artefactos).
- GPU de entrenamiento declaradas: 2× B200 con DDP, batch 64 por GPU, bf16 con pesos maestros fp32 y gradient checkpointing.
- GPU recomendadas para inferencia: no disponible; por tamaño, una GPU con 16-24 GB de VRAM debería alojar los pesos en bf16, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos en bf16 es compatible con GPUs de 24 GB, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` y `lerobot_sirius`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 subtask, SIRIUS r2) | 4,14 B | no disponible | Inserción de cable bimanual (Hyundai Duet, tarea 2) | no disponible | Hugging Face, 0 descargas, 0 likes |
| `chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_20k` | no disponible (mismo linaje pi05) | no disponible | Misma tarea, ronda 1 de SIRIUS | no disponible | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | Política VLA base pi0.5 | no disponible | Hugging Face (modelo base) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea 2 (inserción de cable en módulo de control) del robot Hyundai Duet; no es transferible a otras tareas sin ajuste fino.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en entorno real más allá de la pérdida de entrenamiento.
- Dependencia estricta del protocolo de inferencia: es obligatorio enviar `state_dim_is_pad` con el patrón correcto (True en dimensiones 7-17 durante "push" y "return", False en el resto) y ejecutar solo las dimensiones no marcadas; un uso incorrecto invalida el comportamiento.
- Requiere posicionamiento inicial de las manos (0,6922 / 0,2584) antes de la primera llamada de 18 dimensiones.
- Normalización congelada a las estadísticas de un dataset concreto: cambiar la distribución de estados o acciones puede degradar el rendimiento.
- Riesgo de alucinación en el sentido de subtareas mal decodificadas: el VLM puede emitir una subtarea incoherente con el estado visual, y el experto de acción condicionará sobre ella.
- Sesgos no evaluados: no se han publicado análisis de sesgo, robustez ante cambios de iluminación, oclusión o variaciones de la pieza.
- Idiomas no aplicables: el prompt de tarea está fijado en inglés (`insert the cable into the control module`).
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_20k
- Checkpoint de ronda 1 (inicialización): https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de demostraciones: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger ronda 1, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger ronda 1, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger ronda 2, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger ronda 2, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Plugin LeRobot para pi05 subtask: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/3sx3yvwl
