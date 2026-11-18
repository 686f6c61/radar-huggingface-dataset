# chomeed/task1task2_subtask_rel_chunk30_sirius_bs128_multitask_fromR2mixed_1118_10k

## Resumen

Este repositorio contiene un checkpoint de investigación de pi0.5 (pi05), un modelo vision-language-action (VLA) desarrollado originalmente por Physical Intelligence y adaptado aquí por el usuario chomeed sobre la base `lerobot/pi05_base`. El modelo está entrenado para control robótico de manipulación con un brazo humanoide (plataforma Hyundai Duet) y resuelve tres tareas concretas seleccionables por prompt: inserción de una placa en un módulo de control, inserción de un cable y empuje del módulo de control al centro de la mesa. La innovación principal es la predicción explícita de subtareas de alto nivel: el componente VLM escribe la subtarea actual tras el prompt y el experto de acciones condiciona su salida sobre ella.

Arquitectura pi0.5: un backbone VLM tipo PaliGemma (con cabeza LM para decodificar subtareas) acoplado a un experto de acciones que genera trayectorias mediante flow matching. El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y emite chunks de 30 acciones de 11 dimensiones a partir de 3 cámaras y un estado de 24 dimensiones. El checkpoint corresponde a la actualización 10.000 de 30.000 del fine-tuning multitarea, con una pérdida de entrenamiento de 0,003 en ese paso.

Es relevante como ejemplo de política multitarea con selección por prompt, normalización por tarea y mezcla ponderada de datos de demostración, intervención y robot autónomo (esquema SIRIUS con DAgger). No obstante, se trata de un artefacto de investigación sin licencia declarada, sin benchmarks publicados y con 0 descargas, por lo que no debe considerarse listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action pi0.5 (VLM PaliGemma + experto de acciones con flow matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el entrenamiento usa bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (las instrucciones de tarea son prompts en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

Otros datos técnicos: tamaño del repositorio 16,6 GB; framework LeRobot 0.6.2 con el plugin `pi05_subtask` (rama `multitask`) y `lerobot_sirius`; batch de 128 por actualización del optimizador (64 por GPU en una B200 con acumulación de gradiente 2); optimizador AdamW con lr pico 1e-05, warmup 2000 y coseno hasta 2,5e-06 durante 60.000 pasos de bucle.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5: un VLM (PaliGemma) procesa las imágenes de tres cámaras (d405_left, d405_right, zed_mini) redimensionadas con padding a 224x224, junto con el prompt de tarea y el estado, y genera primero una subtarea mediante decodificación greedy con la cabeza LM. El experto de acciones condiciona entonces sobre esa subtarea y produce un chunk de 30 acciones (n_action_steps 30) mediante flow matching con 10 pasos de flujo. El formato de prompt es `Task: {task}, State: {dims de estado de la tarea};\nSubtask: {subtask};\nAction:`. La pérdida combina el término de flow con 0,1 veces la entropía cruzada de la subtarea.

El fine-tuning parte de `chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k` y se ejecuta sobre el dataset `chomeed/hyundai_duet_multitask_task1_task2` durante 30.000 actualizaciones (checkpoints cada 10.000). La mezcla de datos es fija por grupos: placa 40%, agarre de cable 30%, empuje GRC 20% y retorno GRC 10%; dentro del grupo de placa se mantienen las proporciones SIRIUS del run base (intervención 40%, demostración 50%, robot 10%, con las demos GRC de los episodios 63-122 ponderadas x1,2). Las acciones del brazo son relativas al estado actual (`use_relative_actions=true`), mientras que `gripper_r_closed`, `right_thumb_joint1_cable`, `right_index_joint2_cable` y `right_index_joint3_cable` se mantienen absolutas. La normalización es específica por tarea: las dimensiones de la placa conservan las estadísticas del checkpoint base, las del cable usan cuantiles sobre ambos datasets de cable y el estado del brazo de cada tarea de cable se normaliza con sus propios cuantiles mediante el paso de espacio de tareas del preprocesador.

## Capacidades

- Predicción de subtareas de alto nivel antes de la acción, con condicionamiento del experto de acciones sobre la subtarea decodificada.
- Política multitarea única seleccionable por prompt de tarea: inserción de placa, agarre e inserción de cable, y empuje del módulo al centro.
- Control de manipulación con brazo de 7 articulaciones y mano diestra con múltiples dedos y sensores táctiles (dimensiones de estado 18-23).
- Entrada multimodal: 3 cámaras (dos d405 y una zed_mini) más estado propioceptivo de 24 dimensiones.
- Salida de chunks de acción de 30 pasos y 11 dimensiones, con mezcla de dimensiones relativas y absolutas.
- Aprendizaje por imitación con datos de demostración, intervención humana y robot autónomo (DAgger/SIRIUS).
- No dispone de tool calling, function calling, razonamiento multi-paso genérico, capacidades de audio ni modo thinking más allá de la subtarea.

## Casos de uso

- Automatización de ensamblaje de placas en módulos de control: con el prompt `insert the board into the control module`, el modelo ejecuta agarre, giro de cabeza, inserción y retorno a pose de reposo, usando las 18 dimensiones de estado y las 8 de acción de la tarea de placa.
- Manipulación de cables flexibles en entornos de laboratorio: con el prompt `insert the cable into the control module`, el modelo agarra el cable con la mano derecha usando las dimensiones de cable (0-6 y 18-23 de estado; 0-6 y 8-10 de acción) y los sensores táctiles.
- Tareas de empuje y reposicionamiento de objetos: con el prompt `push the control module to the center of the table`, el modelo empuja el módulo al centro y vuelve a pose de reposo, útil para rutinas de ordenación en líneas de montaje.
- Investigación en políticas multitarea: sirve como referencia para estudiar selección de tarea por prompt, normalización por tarea y mezcla ponderada de datos en un único conjunto de pesos.
- Recolección y análisis de datos de intervención humana: la mezcla SIRIUS (intervención, demostración y robot) permite evaluar cómo influye cada fuente de datos en el rendimiento final.
- Base para fine-tuning posterior en robótica de manipulación: el checkpoint es un punto de partida para adaptar pi0.5 a nuevas tareas con el plugin `pi05_subtask` en la rama `multitask`.
- Evaluación de predicción de subtareas en robótica: permite medir la calidad de la subtarea decodificada por el VLM y su efecto en el chunk de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 10.000: 0,003 (flow + 0,1 x entropía cruzada de subtarea).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 4,14 mil millones de parámetros, una estimación orientativa en bf16 sería de unos 8-9 GB de pesos, más las activaciones de las tres cámaras y el estado; no se ha verificado experimentalmente.
- GPU recomendadas: el entrenamiento se realizó en una B200 (64 por GPU, acumulación 2). Para inferencia no hay recomendaciones publicadas.
- Viabilidad en GPU de consumo: no confirmada; por tamaño de pesos podría intentarse en GPUs con 12-16 GB o más, pero no hay datos de que funcione ni de cuantizaciones soportadas.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (rama `multitask`) y `lerobot_sirius` con `--policy.type=pi05_subtask`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05_subtask multitarea) | 4.143.404.816 | no disponible | Manipulación robótica multitarea con subtareas | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k | no disponible | no disponible | Inserción de placa (tarea única) | no disponible | Hugging Face (checkpoint de partida) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje y ámbito de tarea.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Sin benchmarks publicados ni evaluaciones independientes; el único indicador es la pérdida de entrenamiento.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de robustez fuera del dataset de entrenamiento.
- Entrenado específicamente para la plataforma Hyundai Duet y tres tareas concretas; no generaliza a otras morfologías ni a instrucciones libres.
- Dependencia estricta del formato de prompt y de las dimensiones de estado/acción por tarea; usar dimensiones incorrectas o prompts distintos produce resultados inválidos.
- Riesgo de sobreajuste a las condiciones de las cámaras y a la iluminación del dataset de entrenamiento.
- Posibles sesgos derivados de la mezcla de datos (predominio de demos de placa y cable frente a robot autónomo) y de la recolección humana.
- No hay información sobre idiomas soportados más allá de los prompts en inglés del model card.
- Checkpoint intermedio (10.000 de 30.000 actualizaciones): no representa el modelo final del run de entrenamiento.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita su uso en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task1task2_subtask_rel_chunk30_sirius_bs128_multitask_fromR2mixed_1118_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint de partida: https://huggingface.co/chomeed/board_insertion_merged_pi05_subtask_rel_chunk30_sirius_grc_dagger_early45f_R2_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/chomeed/hyundai_duet_multitask_task1_task2
- Plugin LeRobot pi05_subtask (rama multitask): https://github.com/HDR-SRL/lerobot_policy_pi05_subtask/tree/multitask
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/pxedjx4b
