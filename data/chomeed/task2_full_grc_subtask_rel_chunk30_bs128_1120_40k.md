# chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k

## Resumen

`chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k` es un checkpoint de política robótica (visión-lenguaje-acción, VLA) resultado de un fine-tuning de `lerobot/pi05_base` (la variante pi0.5 de Physical Intelligence integrada en LeRobot) sobre el dataset `HDR-AI-tmp/hyundai_duet_task2`. El modelo resuelve una tarea concreta de manipulación bimanual: insertar un cable en un módulo de control con un robot Hyundai Duet de dos brazos, descompuesta en tres subtareas secuenciales.

La innovación principal es la predicción explícita de subtarea: el componente VLM escribe la subtarea actual tras el prompt y el "action expert" condiciona la generación de acciones sobre esa etiqueta. El entrenamiento usa un loss compuesto (flow matching más 0,1 veces entropía cruzada de subtarea) y acciones relativas al estado actual sobre chunks de 30 pasos. El checkpoint corresponde al paso 40.000 de 40.000, con un loss de entrenamiento de 0,002.

Se trata de un artefacto de investigación muy específico: no es un modelo de propósito general, sino una política entrenada para un montaje físico concreto (cámaras d405_left, d405_right y zed_mini, estado de 18 dimensiones). Su relevancia es acotada al ámbito de la robótica de manipulación y a la reproducibilidad del pipeline LeRobot con el plugin `lerobot_policy_pi05_subtask`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (VLM + action expert con flow matching), plugin `pi05_subtask` de LeRobot |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: prompt de tarea, estado de 18-D y 3 cámaras; salida: chunk de 30 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (prompts de tarea en inglés en los ejemplos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB, incluye `policy_preprocessor_*` y `policy_postprocessor_*`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y aplica un fine-tuning con el framework LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` (`--policy.type=pi05_subtask`). La arquitectura combina un componente VLM que procesa el prompt de tarea, el estado y las imágenes de tres cámaras (d405_left, d405_right, zed_mini) con un action expert que genera chunks de 30 acciones de 18 dimensiones mediante flow matching. La predicción de subtarea se incorpora al prompt (`Task: ...; State: ...; Subtask: ...; Action:`) y el action expert condiciona sobre ella; el loss total es flujo más 0,1 veces entropía cruzada de subtarea.

El entrenamiento usó 40.000 actualizaciones con batch de 128 (64 por GPU en 2× B200 con DDP), optimizador AdamW con lr pico 2,5e-05, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-06. Se empleó autocast bf16 con pesos maestros en fp32 y gradient checkpointing. El dataset combina tres grabaciones: subtarea 1 (empujar el módulo de control, 40 demos, solo brazo derecho), subtarea 2 (primer cable, bimanual, 50 demos) y subtarea 3 (otro extremo del cable, bimanual, 54 demos). El muestreo es uniforme sobre todos los frames, sin SIRIUS, sin reparto por grupos y sin DemoSpeedup; la normalización usa q01/q99 de `stats.json` con cada subtarea ponderada por igual.

Un detalle técnico relevante es el manejo de dimensiones en la subtarea 1: los frames llevan `state_dim_is_pad`/`action_dim_is_pad` (bool, 18) con las 11 dimensiones no pertenecientes al brazo derecho marcadas como True, de modo que esas dimensiones no se escriben en el prompt y quedan fuera del loss (se tratan como ruido puro para el action expert). Las acciones son relativas al estado actual salvo las articulaciones de índice (`right_index_joint2/3`, `left_index_joint2/3`), que se mantienen absolutas.

## Capacidades

- Generación de acciones robóticas de 18 dimensiones en chunks de 30 pasos para un robot bimanual Hyundai Duet.
- Percepción multimodal a partir de tres cámaras (d405_left, d405_right, zed_mini), sin recorte.
- Predicción explícita de subtarea de alto nivel (tres subtareas definidas: empujar el módulo, agarrar el cable y girar la cabeza, insertar el cable).
- Condicionamiento por prompt de tarea en lenguaje natural (`insert the cable into the control module`).
- Manejo de máscaras de dimensiones (`state_dim_is_pad`) para operar con un solo brazo en la subtarea 1.
- No se documentan capacidades de tool calling, agentes multi-paso genéricos, matemáticas, código ni otras tareas fuera de la manipulación entrenada.

## Casos de uso

- Automatización de inserción de cables en una célula de montaje con robot Hyundai Duet: la política ejecuta la secuencia completa (empujar módulo, agarrar cable, insertar) condicionada por el prompt de tarea, adecuada porque está entrenada específicamente sobre 144 demos de esa tarea.
- Reproducción de experimentos de VLA con predicción de subtarea: sirve como referencia para comparar el enfoque `pi05_subtask` frente a políticas pi0.5 sin etiqueta de subtarea en el mismo dataset.
- Investigación en aprendizaje por imitación bimanual: el checkpoint permite estudiar el efecto de acciones relativas con articulaciones absolutas y de las máscaras de dimensiones en el entrenamiento.
- Base para fine-tuning en tareas de inserción similares: al derivar de `lerobot/pi05_base` y usar LeRobot, se puede reentrenar con nuevos datasets manteniendo el pipeline de pre/postprocesadores incluidos en el repo.
- Validación de infraestructura de despliegue LeRobot: el ejemplo de la model card (carga con `PI05SubtaskPolicy.from_pretrained` y `make_pre_post_processors`) permite probar el ciclo completo de inferencia con estado de 18-D y tres cámaras.
- Evaluación de robustez de políticas VLA en entornos reales: útil para medir degradación ante variaciones de iluminación o posiciones iniciales distintas a las de las demos, dado que el modelo no documenta aumentos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es el loss de entrenamiento en el paso 40.000 (0,002), que no es comparable con métricas estándar de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~4,14 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a lo que hay que sumar activaciones, tres flujos de cámara y el action expert.
- GPU recomendadas: el entrenamiento se realizó en 2× B200; para inferencia se requiere una GPU con suficiente memoria para el VLM y las tres cámaras, sin cifra oficial publicada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos podría ser viable en GPUs de 16-24 GB en bf16, pero no hay datos oficiales de consumo real con las tres cámaras.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (commit 9b0f897); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k` | ~4,14 mil M | no disponible | Inserción de cable bimanual (Hyundai Duet) | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la informacion | no disponible | VLA base pi0.5 | no disponible en la informacion | Hugging Face (modelo base) |
| Políticas pi0.5 sin subtarea | no disponible | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea de inserción de cable del dataset `hyundai_duet_task2`; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware exacto: requiere el robot Hyundai Duet, las cámaras d405_left, d405_right y zed_mini, y un estado de 18 dimensiones con los nombres de articulaciones documentados.
- Protocolo de inferencia frágil: es obligatorio enviar `state_dim_is_pad` correctamente y ejecutar solo las dimensiones no marcadas; antes de la primera llamada de 18 dimensiones hay que mover las manos a 0,6922 / 0,2584.
- Riesgo de alucinación de subtarea: la subtarea decodificada (`policy.last_subtask`) condiciona la máscara de dimensiones, por lo que un error de clasificación puede provocar comandos incorrectos.
- Sin datos de licencia: no se puede confirmar el uso comercial; tratar como restringido hasta verificación.
- Sin benchmarks ni evaluación en robot publicada: el único indicador es el loss de entrenamiento, insuficiente para estimar éxito en producción.
- Sesgos y cobertura: entrenado con 144 demos en un entorno concreto; no se documentan variaciones de iluminación, posiciones iniciales ni objetos, lo que limita la robustez.
- Idiomas y contexto: no se documentan; los prompts de ejemplo están en inglés y no hay información sobre longitud de contexto del VLM.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_40k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/k3gw0d3s
