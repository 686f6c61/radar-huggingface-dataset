# chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_5k

## Resumen

`board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_5k` es un checkpoint de politica robotica derivado de pi0.5 (`lerobot/pi05_base`), desarrollado por el usuario `chomeed`, especializado en una tarea concreta de manipulacion: la insercion de una placa en un modulo de control con un brazo robotico. Se trata de un fine-tune de un checkpoint anterior del mismo autor, entrenado sobre el dataset `chomeed/hyundai_duet_task1` con el framework LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask`.

El modelo combina un VLM (PaliGemma) que predice de forma explicita el subtask en curso con un experto de acciones que genera chunks de 30 acciones de 8 dimensiones (relativas al estado actual). Esta estructura de prediccion de subtask intermedios, heredada de pi0.5, permite descomponer una tarea larga en fases semanticas (`grasp the board with the right hand`, `turn the head to the center`, `insert the board into the control module`), lo que facilita la interpretabilidad y el condicionamiento de la politica de bajo nivel.

El checkpoint corresponde a la actualizacion de optimizador 5.000 de 10.000, con una loss de entrenamiento de 0,003 en ese punto. Es relevante para quienes trabajan en imitation learning con datos tipo DAgger (demostraciones humanas, intervenciones y rollouts autonomos) y quieran evaluar el efecto del muestreo por clases (SIRIUS) y de la prediccion de subtasks en tareas de ensamblaje de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLM PaliGemma + experto de acciones flow matching), variante `pi05_subtask` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: prompt de tarea + estado + subtask; 3 camaras y estado 18-D) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16 con master weights fp32) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un VLM basado en PaliGemma que recibe el prompt de tarea, el estado y (en esta variante) genera primero el subtask actual mediante decodificacion greedy con la cabeza LM; a continuacion, un experto de acciones condicionado por ese subtask produce un chunk de 30 acciones (8-D) mediante flow matching con 10 pasos de integracion. La loss combina el termino de flow con una entropia cruzada de subtask ponderada a 0,1 (equivalente a CE + 10x ratio de flow, segun la model card). Las acciones son relativas al estado actual (`use_relative_actions=true`), salvo `gripper_r_closed`, que se mantiene absoluta.

El entrenamiento se realizo con LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` sobre el dataset `chomeed/hyundai_duet_task1`, partiendo de `chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k`. Se uso AdamW con lr pico 1e-05, warmup 2000 y decaimiento coseno hasta 2.5e-06 en 20.000 pasos de bucle (10.000 actualizaciones de optimizador), batch efectivo de 128 (64 por GPU en una B200 con acumulacion de gradiente 2), bf16 autocast con master weights fp32 y gradient checkpointing. La innovacion principal es el muestreo SIRIUS por clases: 50% demostraciones, 40% frames de intervencion humana, 10% rollouts autonomos y 0% frames pre-intervencion (los 3,0 s previos), con un refuerzo de 1,2x para los episodios 63-122 dentro de la clase demo. La normalizacion queda congelada a las estadisticas del checkpoint base, no a las del dataset.

## Capacidades

- Prediccion de subtasks de alto nivel antes de generar acciones, con tres clases definidas para esta tarea.
- Generacion de chunks de accion de 30 pasos y 8 dimensiones (incluye cierre de pinza derecho).
- Procesamiento multimodal de entrada: tres camaras (`d405_left`, `d405_right`, `zed_mini`) mas un vector de estado de 18 dimensiones.
- Control de brazo robotico en tareas de ensamblaje de precision (insercion de placa).
- Aprendizaje por imitacion con datos mixtos (demostraciones, intervenciones DAgger, rollouts).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades de vision general fuera del pipeline robotico.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- **Insercion de placas en modulos de control**: es la tarea objetivo del checkpoint; el modelo genera acciones relativas al estado para alinear y empujar la placa, condicionado por el subtask `insert the board into the control module`.
- **Investigacion en imitation learning con DAgger**: el modelo esta entrenado con un esquema de muestreo que sobrerrepresenta frames de intervencion humana (40%), lo que lo hace util para estudiar como el aprendizaje a partir de correcciones humanas afecta la robustez en tareas de contacto.
- **Estudio de prediccion de subtasks en politicas jerarquicas**: permite evaluar el efecto de la CE de subtask (ponderada a 0,1) frente a politicas planas, y comparar la decodificacion greedy de subtask con alternativas.
- **Benchmark de ensamblaje robotico en laboratorio**: sirve como baseline reproducible (checkpoint 5k/10k, loss 0,003) para comparar nuevas estrategias de muestreo o arquitecturas sobre el mismo dataset `hyundai_duet_task1`.
- **Evaluacion de robustez ante cambios de iluminacion y punto de vista**: al usar tres camaras con crops fijos, permite medir la sensibilidad de la politica a variaciones en la percepcion si se respetan los mismos recortes en inferencia.
- **Prototipado de pipelines LeRobot**: el codigo de carga (`PI05SubtaskPolicy.from_pretrained`) y la API `predict_action_chunk` permiten integrar el modelo en un bucle de control real con relativa rapidez para pruebas de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss de entrenamiento en el paso del checkpoint (0,003), que no es comparable con metricas de evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 4.143 M de parametros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a lo que hay que sumar activaciones del VLM, el experto de acciones y las tres imagenes de camara.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA B200; para inferencia se recomienda al menos una GPU con 16-24 GB de VRAM (A100, H100, L40S, RTX 4090) segun el margen para activaciones.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16, aunque no esta verificado en la informacion disponible.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (`pip install git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_5k` | 4.143 M | no disponible | Insercion de placa (subtaks) | no disponible | Hugging Face |
| `chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k` (checkpoint base) | no disponible | no disponible | Insercion de placa (sin subtask) | no disponible | Hugging Face |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | Politica robotica general | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea de insercion de placa del dataset `hyundai_duet_task1`; no es un modelo de proposito general.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- La normalizacion esta congelada a las estadisticas del checkpoint base, no a las del dataset; usar otras estadisticas puede degradar el rendimiento.
- Requiere aplicar los mismos recortes de imagen que en el dataset en el momento de la inferencia.
- El checkpoint corresponde a la mitad del entrenamiento (5.000 de 10.000 actualizaciones); puede no ser el punto optimo de convergencia.
- Riesgo de alucinacion en la prediccion de subtask: la decodificacion greedy del VLM puede producir subtasks incorrectos que condicionen erroneamente al experto de acciones.
- Sin datos de sesgos, evaluacion externa ni pruebas de robustez publicadas.
- El modelo depende del plugin `lerobot_policy_pi05_subtask` y de LeRobot 0.6.2; cambios de version pueden romper la compatibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_5k
- Checkpoint base del fine-tune: https://huggingface.co/chomeed/board_insertion_merged_pi05_rel_chunk30_sirius_grc_40k
- Modelo base original: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/chomeed/hyundai_duet_task1
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/iueiuurt
