# chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_10k

## Resumen
`chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_10k` es un checkpoint de política robótica basado en pi0.5 (pi05) de Physical Intelligence, ajustado con la librería LeRobot 0.6.2 y el plugin `pi05_subtask`. Lo desarrolla el usuario chomeed en el contexto del proyecto Hyundai Duet, y resuelve la tarea 2 de inserción de cable en un módulo de control con un robot bimanual (dos brazos, con pinzas index). No es un modelo de lenguaje general: es un modelo visión-lenguaje-acción (VLA) que predice directamente acciones de 18 dimensiones a partir de tres cámaras y el estado del robot.

El modelo parte de `lerobot/pi05_base` y se ha afinado en dos rondas sucesivas de SIRIUS (una variante de entrenamiento con datos de intervención humana y DAgger). Este checkpoint concreto corresponde al paso 10.000 de 20.000 de la segunda ronda, con batch 128 en dos GPU B200. Incorpora una cabeza de predicción de subtarea de alto nivel: el VLM escribe la subtarea actual en el prompt y el experto de acción condiciona sobre ella.

Su relevancia es acotada pero técnica: documenta un pipeline completo de ajuste fino VLA con datos de demostración, dos rondas de DAgger y remuestreo por clases (demo, intervención, pre-intervención, rollout autónomo), con pérdida compuesta de flow matching más entropía cruzada de subtarea. Es un artefacto de investigación reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (VLM + experto de acción con flow matching), política `pi05_subtask` sobre LeRobot |
| Parametros totales | 4.143.404.816 (4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada multimodal: 3 cámaras + estado 18-D + prompt de tarea y subtarea) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (prompts de tarea en inglés: "insert the cable into the control module") |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura pi0.5: un modelo visión-lenguaje que procesa las imágenes de tres cámaras (d405_left, d405_right, zed_mini, sin recorte) junto con el prompt de tarea y la subtarea, y un experto de acción que genera un chunk de 30 pasos de acción de 18 dimensiones mediante flow matching. La pérdida total es `flow + 0.1 × entropía cruzada de subtarea`. Las acciones de los brazos son relativas al estado actual (`use_relative_actions=true`), mientras que las cuatro articulaciones de los dedos índice (right_index_joint2/3, left_index_joint2/3) se mantienen absolutas.

El entrenamiento se realizó en dos rondas. La ronda 1 partió de un ajuste previo de 40.000 pasos sobre la tarea 2 completa y añadió 20.000 actualizaciones con SIRIUS sobre demostraciones y una primera ronda de DAgger. Este checkpoint es el paso 10.000 de la ronda 2, que añade una segunda ronda de DAgger (30 episodios por subtarea, 62-67 % de frames de operador). El muestreo por clases es fijo: 50 % demostraciones, 40 % frames de intervención, 0 % pre-intervención y 10 % rollouts autónomos (`--sirius.p_intv=0.4 --sirius.p_demo=0.5 --sirius.p_preintv=0.0 --sirius.p_robot_max=0.1`). Optimizador AdamW con lr pico 1e-05, warmup 1000 y decaimiento coseno hasta 2,5e-06; batch 128 (64 por GPU en 2× B200 con DDP); bf16 con pesos maestros fp32 y gradient checkpointing. La normalización está congelada a las estadísticas de `hyundai_duet_task2` (q01/q99, cada subtarea ponderada por igual). La pérdida de entrenamiento en este paso es 0,003.

Una particularidad relevante: la subtarea 1 es solo de brazo derecho. Los frames de esa subtarea llevan una máscara booleana `state_dim_is_pad`/`action_dim_is_pad` de 18 dimensiones con las 11 dimensiones no implicadas marcadas como True; esas dimensiones no se escriben en el prompt y quedan fuera de la pérdida (el experto de acción las recibe como ruido). En el robot hay que enviar esa máscara en la observación y ejecutar solo las dimensiones no marcadas.

## Capacidades
- Predicción de acciones robóticas bimanuales de 18 dimensiones (14 articulaciones de brazo + 4 de dedos índice) en chunks de 30 pasos.
- Percepción multimodal con tres cámaras simultáneas (dos d405 y una zed_mini) más estado propioceptivo de 18 dimensiones.
- Predicción de subtareas de alto nivel integrada en el prompt: el VLM genera la subtarea actual ("push the control module to the center", "return both arms back to ready pose", "grasp the cable with the right hand", "turn the head to the center", "insert the cable into the port") y el experto de acción condiciona sobre ella.
- Ejecución de una tarea de inserción de cable en dos extremos (subtareas 2 y 3) con agarre previo (subtarea 1, solo brazo derecho).
- Soporte de máscaras de dimensiones de estado y acción para fases con un solo brazo.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico ni capacidades de audio.
- Capacidades multilingües: no disponible; los prompts documentados están en inglés.

## Casos de uso
- Automatización de inserción de conectores en línea de montaje: el modelo ejecuta la secuencia completa (empujar el módulo al centro, volver a pose de reposo, agarrar el cable, girar la cabeza, insertar ambos extremos) a partir de las tres cámaras y el estado, adecuado por su entrenamiento específico con DAgger en esa tarea.
- Investigación en aprendizaje por imitación con DAgger: sirve como referencia reproducible de un pipeline de dos rondas de intervención humana con remuestreo por clases, útil para comparar estrategias de mezcla demo/intervención/rollout.
- Estudio de predicción jerárquica de subtareas en VLA: el modelo permite analizar cómo la cabeza de subtarea condiciona al experto de acción y cómo afecta la pérdida auxiliar de entropía cruzada (peso 0,1).
- Base para ajuste fino en tareas bimanuales con pinzas index: al partir de pi05 base y mantener nombres de articulaciones y espacio de acción documentados, se puede reutilizar como inicialización para tareas similares de manipulación diestra.
- Evaluación de máscaras de dimensiones en fases asimétricas: el mecanismo `state_dim_is_pad`/`action_dim_is_pad` es un caso práctico para estudiar entrenamiento con dimensiones enmascaradas y ruido inyectado en el experto de acción.
- Despliegue en banco de pruebas con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask`: permite reproducir la inferencia con `--policy.type=pi05_subtask` y validar el comportamiento del checkpoint intermedio frente al final.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 10.000 (0,003, combinación de flow matching y entropía cruzada de subtarea), que no es comparable con métricas de éxito en tarea.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el coste de las tres cámaras y del experto de acción, no cuantificado en la información disponible.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA B200 con DDP (64 muestras por GPU). Para inferencia no se especifica hardware mínimo.
- Cabe en GPU de consumo: probable en tarjetas con 16-24 GB de VRAM en bf16, aunque no está verificado en la información disponible.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` y `lerobot_sirius` (`--policy.type=pi05_subtask`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 subtask, ronda 2, paso 10k) | 4,14 mil M | 3 cámaras + estado 18-D + prompt | Inserción de cable bimanual, subtareas | no disponible | Hugging Face, repo 16,6 GB |
| `lerobot/pi05_base` | no disponible | multimodal VLA | Política VLA general base | no disponible | Hugging Face |
| `chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_20k` | 4,14 mil M (misma familia) | 3 cámaras + estado 18-D + prompt | Misma tarea, ronda 1 (20k pasos) | no disponible | Hugging Face |
| Ajuste previo de 40k pasos sobre la tarea 2 | no disponible | 3 cámaras + estado 18-D + prompt | Misma tarea, sin DAgger | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a procedencia, datos de entrenamiento y número de actualizaciones.

## Limitaciones y advertencias
- Es un checkpoint intermedio (paso 10.000 de 20.000), no el modelo final de la ronda; su rendimiento puede ser inferior al del checkpoint de 20.000 pasos.
- Modelo altamente específico: entrenado solo para la tarea 2 de Hyundai Duet (inserción de cable en módulo de control) con un robot y una configuración de cámaras concretos. No generaliza a otras tareas, robots ni disposiciones de sensores.
- Dependencia estricta del espacio de acción: 18 dimensiones con nombres concretos, brazos relativos y dedos índice absolutos. Cualquier cambio en la cinemática o en la convención de signos invalida el modelo.
- Requiere gestionar correctamente `state_dim_is_pad` en el robot: marcar True en las dimensiones 7-17 solo durante las subtareas de empuje y retorno a reposo, y mover las manos a 0,6922 / 0,2584 antes de la primera llamada de 18 dimensiones.
- La normalización está congelada a las estadísticas de `hyundai_duet_task2`; usar otras estadísticas rompe la coherencia con el warm start.
- Riesgo de alucinación de subtarea: la cabeza de subtarea es un clasificador generativo y puede producir etiquetas incorrectas que condicionen erróneamente al experto de acción.
- Sesgos: los datos incluyen un 36,9 % de frames de intervención humana y un 17,2 % de rollouts autónomos, con remuestreo fijo que sobremuestrea demostraciones (50 %) e intervenciones (40 %) e infrarrepresenta rollouts (10 %); esto puede limitar la robustez ante distribuciones autónomas.
- Licencia no disponible: no se puede confirmar el uso comercial. El modelo base `lerobot/pi05_base` tiene sus propias condiciones, que deben verificarse por separado.
- Idiomas: solo se documentan prompts en inglés; no hay evidencia de soporte multilingüe.
- Sin métricas de éxito en tarea publicadas: no hay evidencia cuantitativa de fiabilidad en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r2_bs128_1125_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de inicialización (ronda 1, 20k): https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_sirius_r1_bs128_1124_20k
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- DAgger ronda 1, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- DAgger ronda 1, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- DAgger ronda 2, subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- DAgger ronda 2, subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/meeroro56/hyundai_duet/runs/3sx3yvwl
