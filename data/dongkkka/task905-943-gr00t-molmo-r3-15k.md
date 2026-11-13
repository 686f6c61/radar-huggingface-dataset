# Dongkkka/Task905-943-GR00T-Molmo-R3-15k

## Resumen

Task905-943-GR00T-Molmo-R3-15k es un checkpoint de investigación publicado en Hugging Face por el usuario Dongkkka, orientado a robótica (pipeline `robotics`). No es un modelo de lenguaje de propósito general, sino un artefacto de entrenamiento completo para el framework GR00T N1.7 de NVIDIA, combinado con un adaptador y backend de MolmoPoint-8B de Ai2 para la selección de puntos de agarre. El paquete contiene el estado íntegro de un entrenamiento detenido en el paso 15.000 de un total previsto de 30.000, incluyendo pesos, optimizador, scheduler, estados RNG, trainer, processor y estadísticas de normalización.

El modelo está especializado en dos tareas concretas de manipulación con un robot humanoide: la tarea 905 (coger un apósito sanitario blanco con la mano derecha) y la tarea 943 (coger un objeto objetivo señalado con un punto con la mano izquierda). El VLM que actúa como columna vertebral es `nvidia/Cosmos-Reason2-2B`, con estructura Qwen3-VL, mientras que MolmoPoint-8B se ejecuta como modelo separado únicamente en el primer frame de cada episodio para predecir un punto de agarre.

El interés de esta ficha es acotado: se trata de un checkpoint de investigación reproducible, no de un modelo listo para producción. Su relevancia radica en que documenta una integración concreta GR00T + MolmoPoint con entradas táctiles, un contrato de inferencia explícito y un bundle de código fuente modificado. El repositorio ocupa 25,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (VLM `nvidia/Cosmos-Reason2-2B`, estructura Qwen3-VL) + adaptador y backend MolmoPoint-8B para selección de punto de agarre |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada por episodio `B=1,T=1`; horizonte de acción de 40 pasos) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors sin indicar cuantizaciones) |
| Idiomas soportados | coreano (`ko`) según la model card; las instrucciones de tarea se toman de los datasets originales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, más `optimizer.pt`, `scheduler.pt`, `rng_state.pth`, `trainer_state.json`, processor, estadísticas de normalización y un `Isaac-GR00T-molmo-inference-source.tar.gz` con código fuente modificado |

## Arquitectura y entrenamiento

El sistema combina dos componentes. Por un lado, GR00T N1.7 actúa como política visuomotora: recibe RGB de cabeza (`cam_left_head`, `uint8`, `(B=1,T=1,H,W,3)`), estado articular de 54 dimensiones en el orden `left_arm(7)`, `right_arm(7)`, `left_hand(20)`, `right_hand(20)`, señales táctiles `tactile_left(45)` y `tactile_right(45)` correspondientes a dos manos de 2×5×9 taxeles (codificadas por `finger_mlp` en 32 dimensiones de característica) y una instrucción de lenguaje. La capacidad de padding del estado es `max_state_dim=132`. La salida es un horizonte de acción de 40 pasos en 54 dimensiones, en modo ABSOLUTE/NON_EEF, con normalización restaurada por el processor guardado.

Por otro lado, MolmoPoint-8B se ejecuta una sola vez por episodio sobre el primer frame de cabeza para predecir un punto de agarre; en los frames posteriores solo se dibuja un punto magenta opaco en la misma coordenada, con radio del 3 % del lado corto de la imagen original (frente al 1 % del modelo Task 905 de 30k). No hay numeración ni seguimiento del punto. El preprocesado de imagen es un resize directo a 224×224 (`letter_box_transform=false`), manteniendo la resolución original idéntica entre frames.

El entrenamiento usó 156 episodios y 70.217 frames en el split de entrenamiento, y 18 episodios y 7.643 frames en validación, a 30 Hz, con batch 256. La ejecución estaba prevista para 30.000 pasos y se interrumpió en el paso 16.856; por tanto, el checkpoint de 15.000 pasos es el último guardado completo y no un modelo terminado. El entorno de entrenamiento documentado es Python 3.12, Torch 2.9 y Transformers 4.57.3. No se detalla en la información disponible la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Política visuomotora para manipulación bimanual en robot humanoide, con salida de 40 pasos de acción en 54 dimensiones.
- Percepción táctil integrada mediante 2×5×9 taxeles por mano, codificados a 32 dimensiones.
- Selección de punto de agarre guiada por lenguaje mediante MolmoPoint-8B en el primer frame de cada episodio.
- Condicionamiento por instrucción de lenguaje de la tarea (`annotation.human.task_description`), tomada de los datasets originales.
- Ejecución con estado episódico: `policy.reset()` y `get_action(first_obs, options={"episode_start": True})` para el primer frame, y `get_action(next_obs)` en los siguientes.
- Soporte de `B=1,T=1` exclusivamente; no se documenta procesamiento por lotes ni secuencias temporales mayores.
- No se documenta tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en manipulación bimanual: reproducir el entrenamiento y la evaluación de las tareas 905 y 943 con el bundle de código incluido, verificando la integridad con `SHA256SUMS` antes de ejecutar.
- Estudio de integración VLM + política motora: analizar cómo MolmoPoint-8B aporta el punto de agarre en el primer frame y cómo GR00T N1.7 lo consume en el resto del episodio.
- Experimentos con percepción táctil: evaluar el efecto de las señales `tactile_left`/`tactile_right` y del `finger_mlp` en tareas de agarre con contacto.
- Reanudación de entrenamientos interrumpidos: usar `optimizer.pt`, `scheduler.pt`, `rng_state.pth` y `trainer_state.json` para continuar desde el paso 15.000 con los mismos datos, código y configuración.
- Comparación de variantes de preprocesado: contrastar el radio de punto del 3 % frente al 1 % del modelo Task 905 de 30k para medir el impacto en la precisión de agarre.
- Base para adaptaciones a otras tareas: sustituir las instrucciones y los datasets de las tareas 905/943 por otros, manteniendo el contrato de entrada/salida y el `embodiment-tag new_embodiment`.
- Validación de pipelines de inferencia: probar el servidor `gr00t.eval.run_gr00t_server` con `--use-tactile` y `--molmo-python` en un entorno controlado antes de conectar la salida a un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación no demuestra la tasa de éxito en un robot real ni la reproducibilidad completa de la inferencia en otras máquinas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 25,6 GB e incluye pesos, optimizador y estados de entrenamiento, por lo que el espacio en disco necesario para descargarlo y extraerlo es considerablemente mayor.
- GPU recomendadas: no disponible. La model card solo indica `--device cuda` y `--molmo-device cuda`, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: servidor de inferencia incluido en `Isaac-GR00T-molmo-inference-source.tar.gz`, ejecutado con `gr00t.eval.run_gr00t_server`; requiere dos entornos Python separados (`GR00T_PYTHON` y `MOLMO_PYTHON`).
- Dependencias de Molmo: instalación desde `checkpoint-15000/molmo/requirements-molmo.txt` y código nativo de Ai2 fijado al commit `f3cb1085fbb97c4a4d7fdcadd77cf871bf37a88a`.
- Pesos base de MolmoPoint-8B: es necesario descargar aparte el tar nativo Long-Context SFT (`MolmoPoint-8B.tar`) y apuntar `--molmo-base` al directorio que contiene `step2000/config.yaml` y `step2000/model_and_optim/.metadata`; el formato `model.safetensors` genérico de HF no sustituye a estos pesos nativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Task905-943-GR00T-Molmo-R3-15k | no disponible | no disponible | Manipulación bimanual (tareas 905 y 943) | Apache 2.0 | Hugging Face, 0 descargas |
| Task 905 30k (referencia citada por el autor) | no disponible | no disponible | Manipulación (tarea 905), punto al 1 % | no disponible | no disponible |
| GR00T N1.7 (framework base) | no disponible | no disponible | Política visuomotora general | no disponible | no disponible |
| MolmoPoint-8B (Ai2) | 8B (según nombre) | no disponible | Predicción de puntos | no disponible | Tar oficial de Ai2 |

## Limitaciones y advertencias

- El checkpoint corresponde al paso 15.000 de un entrenamiento previsto para 30.000 que se interrumpió en el paso 16.856; no es un modelo con entrenamiento completado.
- La model card advierte que la publicación no demuestra la tasa de éxito en un robot real ni la reproducibilidad completa de la inferencia en otros equipos.
- Solo se admite `B=1,T=1`; no hay soporte documentado de lotes ni de secuencias temporales.
- El idioma declarado es coreano y las instrucciones de tarea provienen de los datasets originales; no se documenta soporte multilingüe.
- Las instrucciones de mano de las tareas 905 y 943 no deben modificarse, lo que limita la generalización a otras consignas.
- Es obligatorio verificar el mapeo de articulaciones y las unidades de la salida antes de conectar las acciones a un robot real.
- El repositorio incluye código fuente modificado y requiere versiones específicas de Python, Torch y Transformers, así como dos entornos separados y pesos nativos externos de MolmoPoint.
- El uso comercial está permitido por la licencia Apache 2.0, pero la idoneidad para producción no está respaldada por métricas publicadas.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Dongkkka/Task905-943-GR00T-Molmo-R3-15k
- Dataset Task 905 original: https://huggingface.co/datasets/RobotisSW/Task_000905_Pick_up_a_white_sanitary_pad_with_right_hand_MCAP
- Ejecución W&B: https://wandb.ai/donggunkim-kyung-hee-university/sh5-gr00t-molmo/runs/task905_943_r3_30k_20261111
- Código nativo de Molmo (commit fijado): https://github.com/allenai/molmo2/tree/f3cb1085fbb97c4a4d7fdcadd77cf871bf37a88a
- Pesos nativos MolmoPoint-8B: https://storage.googleapis.com/oe-training-public/MolmoPoint-0325/MolmoPoint-8B.tar
