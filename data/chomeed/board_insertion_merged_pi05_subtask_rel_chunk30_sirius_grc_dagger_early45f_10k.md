# chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_10k

## Resumen

Este repositorio contiene un checkpoint de robótica basado en pi0.5 (Physical Intelligence), un modelo vision-language-action (VLA) construido sobre una arquitectura híbrida que combina un backbone VLM (PaliGemma) con un "action expert" de flow matching. El modelo ha sido afinado por el usuario `chomeed` sobre el dataset `chomeed/hyundai_duet_task1` para la tarea de inserción de placas (board insertion) en un entorno Hyundai Duet, con predicción explícita de subtareas de alto nivel.

El checkpoint corresponde a la actualización de optimizador 10.000 de 10.000 (20.000 pasos de bucle con acumulación de gradiente 2) de un fine-tuning que parte de `chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k`. Incorpora muestreo estratificado tipo DAgger (clases demo, intervention, pre-intervention y robot) con ratios fijos, y una cabeza de subtarea que el VLM decodifica de forma greedy antes de ejecutar los pasos de flow matching.

El modelo tiene 4.143.404.816 parámetros (~4,14 mil millones) y un tamaño de repositorio de 16,6 GB. Es relevante en el contexto de manipulación robótica con aprendizaje por imitación y DAgger, donde la combinación de predicción de subtareas y acciones relativas con chunking de 30 pasos permite control fino en tareas de ensamblaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) pi0.5: backbone VLM PaliGemma + action expert con flow matching |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16/fp32) |
| Idiomas soportados | no disponible (instrucciones en ingles en el prompt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un backbone VLM (PaliGemma) que procesa las imagenes de tres camaras (d405_left, d405_right, zed_mini) junto con el estado de 18 dimensiones y el prompt de tarea, y un "action expert" que genera acciones mediante flow matching condicionado en la representacion del VLM. La novedad respecto a pi0 base es la prediccion explicita de subtareas: el VLM escribe primero la subtarea actual tras el prompt (`Task: {task}, State: {state};\nSubtask: {subtask};\nAction:`) y el action expert condiciona sobre ella. La perdida combina flow matching y entropia cruzada de subtarea con peso 0,1 (ratio CE + 10x flow de pi0.5).

El entrenamiento se realizo con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` sobre el dataset `chomeed/hyundai_duet_task1`, con batch de 128 por actualizacion (64 por GPU en una B200 con acumulacion 2), AdamW con lr pico 1e-5, warmup 2000 y decaimiento coseno hasta 2,5e-6, precision bf16 con pesos maestros fp32 y gradient checkpointing. El muestreo SIRIUS usa ratios fijos por clase: 50% demos humanas, 40% frames de intervencion, 0% pre-intervencion y 10% rollouts autonomos, con sobremuestreo 1,2x de los episodios 63-122 dentro de la clase demo. La normalizacion se congela a las estadisticas del checkpoint base. La perdida de entrenamiento en este paso fue 0,002.

## Capacidades

- Generacion de acciones roboticas de 8 dimensiones con chunking de 30 pasos (n_action_steps 30), relativas al estado actual salvo `gripper_r_closed` que se mantiene absoluta.
- Prediccion de subtareas de alto nivel: `grasp the board with the right hand`, `turn the head to the center` e `insert the board into the control module`.
- Percepcion multimodal con tres camaras (dos d405 y una zed_mini) y estado proprioceptivo de 18 dimensiones.
- Condicionamiento por prompt de tarea y estado; decodificacion greedy de subtarea con la LM head de PaliGemma antes de los 10 pasos de flow.
- Aprendizaje por imitacion combinado con DAgger (datos de intervencion humana y rollouts autonomos).
- No se documentan capacidades de tool calling, agentes genericos, razonamiento textual ni vision general fuera del dominio robotico.

## Casos de uso

- Insercion de placas en modulo de control en linea de ensamblaje: el modelo predice la subtarea `insert the board into the control module` y ejecuta el chunk de 30 acciones relativas para completar la insercion, adecuado por el condicionamiento explicito de subtarea.
- Recogida de placa con mano derecha: la subtarea `grasp the board with the right hand` guia el cierre del gripper derecho (`gripper_r_closed` absoluto) sobre la pieza.
- Reorientacion de la cabeza robotica: la subtarea `turn the head to the center` permite sincronizar la percepcion con el inicio de la insercion, con margen de 1,5 chunks (45 frames, 1,5 s) antes del movimiento.
- Fine-tuning continuo con DAgger: el checkpoint parte de datos de intervencion humana y rollouts autonomos, por lo que puede seguir entrenandose con nuevas intervenciones para corregir fallos en produccion.
- Politica de control en bucle cerrado para brazos manipuladores: gracias a las acciones relativas y al chunking de 30 pasos, se puede ejecutar a frecuencia de control sin recalcular toda la trayectoria.
- Investigacion en aprendizaje por imitacion con prediccion de subtareas: sirve como referencia reproducible para comparar variantes de pi0.5 con y sin subtask head en tareas de ensamblaje.
- Despliegue en entornos con multiples camaras y estado de alta dimension: la entrada de 3 camaras + estado 18-D permite operar en celdas robotizadas instrumentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de entrenamiento en el paso 10.000: 0,002.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~4,14 B parametros en bf16 se estima del orden de 8-10 GB solo para pesos, mas activaciones y cache del VLM (no confirmado por el autor).
- GPU de entrenamiento documentada: 1x NVIDIA B200 (batch 64 por GPU, acumulacion 2).
- GPU recomendadas para inferencia: no especificadas; por tamano, GPU con >=16-24 GB (A100, H100, L40S, RTX 4090) serian candidatas, aunque no hay confirmacion.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) y superiores, no confirmado.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (`PI05SubtaskPolicy.from_pretrained(...)`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05_subtask) | ~4,14 B | no disponible | Insercion de placa Hyundai Duet con subtareas | no disponible | Hugging Face (chomeed) |
| `chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k` (base del fine-tune) | no disponible | no disponible | Board insertion pi0.5 sin subtask head | no disponible | Hugging Face |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | VLA general pi0.5 | no disponible | Hugging Face (LeRobot) |
| pi0 (Physical Intelligence) | no disponible | no disponible | VLA general | no disponible | Referencia publica |

La comparativa cuantitativa de rendimiento no esta disponible; las diferencias documentadas se limitan a la presencia de subtask head, el dataset de fine-tuning y el regimen de muestreo DAgger.

## Limitaciones y advertencias

- Especifico de una unica tarea y entorno (Hyundai Duet, board insertion); no generaliza a otras tareas sin reentrenamiento.
- Requiere exactamente las tres camaras (d405_left, d405_right, zed_mini) y el estado de 18 dimensiones; los recortes de imagen deben replicarse en inferencia tal como estan almacenados en el dataset.
- La normalizacion esta congelada a las estadisticas del checkpoint base, no a las del dataset completo; cargar la politica con sus procesadores es obligatorio para reproducirla.
- Licencia no disponible: no se puede confirmar uso comercial.
- Riesgo de alucinacion de subtarea: la decodificacion greedy de subtarea puede desviarse del estado real, condicionando erroneamente el action expert.
- Dependencia de plugins externos (`lerobot_policy_pi05_subtask`, `lerobot_sirius`) instalados desde GitHub, lo que introduce riesgo de reproducibilidad.
- Sin datos publicados de benchmarks, latencia o robustez fuera del dataset de entrenamiento.
- El checkpoint es el final de 10.000 actualizaciones; no hay informacion sobre variantes intermedias ni sobre estabilidad en despliegue prolongado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_10k
- Checkpoint base del fine-tune: https://huggingface.co/chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k
- Modelo base pi0.5: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/hyundai_duet_task1
- Plugin LeRobot pi05_subtask: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/iueiuurt
