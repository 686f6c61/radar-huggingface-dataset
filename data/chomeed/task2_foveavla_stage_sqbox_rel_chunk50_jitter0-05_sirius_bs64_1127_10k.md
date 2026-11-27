# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_10k

## Resumen

El modelo `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_10k` es un checkpoint de robótica basado en pi0.5 (pi05) con la extensión FoveaVLA, desarrollado por el usuario chomeed sobre el modelo base `lerobot/pi05_base`. Se trata de una política visuomotora de tipo Vision-Language-Action (VLA) afinada para la tarea 2 (inserción de cable GRC) de un entorno robótico denominado Hyundai Duet. El modelo combina un VLM que predice la subtarea de alto nivel en curso con un experto de acción que genera comandos motores de 18 dimensiones condicionados por esa subtarea.

La particularidad técnica del checkpoint es la incorporación de foveación por etapas: además de los tres marcos RGB completos (d405_left, d405_right, zed_mini), el modelo recibe recortes de 224x224 píxeles de las cámaras que la etapa activa fovea, y predice cajas delimitadoras por cámara para el instante t+8. Esto reduce la carga visual a la región relevante de la escena y permite un control más preciso en tareas de inserción fina con dos brazos.

Este checkpoint concreto corresponde a las 10.000 actualizaciones de optimizador de un entrenamiento de 30.000, con una pérdida de entrenamiento de 0,245 en ese paso. Es relevante para investigadores en manipulación robótica que quieran reproducir o evaluar la estrategia FoveaVLA en tareas de inserción con DAgger, aunque su naturaleza de checkpoint intermedio y la ausencia de benchmarks publicados limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (pi0.5 + FoveaVLA), VLM + experto de acción con predicción de subtarea y cajas |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right), estado 18-D |
| Salida | acciones 18-D, chunk 50 (n_action_steps 30) |
| Espacio de acciones | relativo al estado actual, salvo right_index_joint2/3 y left_index_joint2/3 absolutos |
| Framework | LeRobot 0.6.2 `pi05_foveavla_subtask` (rama `stage-views` de lerobot_foveavla) + lerobot_sirius |
| Modelo base | lerobot/pi05_base |
| Tamaño del repo | 16,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, un VLA que combina un modelo de lenguaje y visión con un experto de acción. Sobre esa base, FoveaVLA añade dos mecanismos: (1) predicción de subtarea de alto nivel, donde el VLM escribe la subtarea actual tras el prompt (por ejemplo, "grasp the board with the right hand" o "insert the board into the control module") y el experto de acción se condiciona a ella; y (2) predicción de cajas por cámara, con 4 slots por cámara (zed_mini, d405_left, d405_right) que estiman la caja de cada cámara en t+8 mediante 4 clases sobre 1024 bins. El experto de acción nunca ve estas cajas.

El entrenamiento se realizó por imitación con DAgger sobre los subtasks 2 y 3 de la tarea 2 (el subtask 1 se eliminó), usando los datasets indicados con la variante `foveavla_stage` (etiquetas de subtarea derivadas de las marcas de etapa y cajas rastreadas por cámara solo dentro de las etapas que fovean esa cámara). El total asciende a 363 episodios y aproximadamente 962.000 fotogramas. La configuración de muestreo SIRIUS usa pesos demo 0,5 / intervención 0,4 / robot ≤ 0,1, y nunca muestrea los 3 segundos previos a una toma de control. El optimizador es AdamW con lr pico 2,5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 30.000 pasos; batch efectivo de 64 (32 por GPU en 2 B200 con DDP), precisión bf16 con pesos maestros fp32 y gradient checkpointing. La pérdida combina flow matching con 0,1 × entropía cruzada de subtarea y, en las etapas de inserción, 0,1 × entropía cruzada de cajas.

## Capacidades

- Predicción de subtarea de alto nivel en lenguaje natural a partir del prompt y las observaciones visuales.
- Generación de acciones motrices de 18 dimensiones en espacio relativo (con cuatro articulaciones en absoluto), en chunks de 50 pasos con 30 pasos ejecutados.
- Percepción multi-cámara con tres vistas completas y recortes foveados de 224x224 de las cámaras relevantes según la etapa.
- Predicción de cajas delimitadoras cuadradas por cámara a t+8 (centro x, centro y, lado) para guiar la foveación.
- Control bimanual para tareas de inserción de cables (entrega de cable a mano izquierda o derecha e inserción en puerto).
- Adaptación al escenario mediante `policy.config.fovea_scenario` ("subtask2" o "subtask3") u `observation.fovea_scenario` (0/1).
- Entrenamiento con DAgger que incorpora correcciones humanas, lo que permite cierto grado de recuperación ante estados fuera de distribución.
- No se documentan capacidades de tool calling, agentes multi-paso genéricos, audio ni otros idiomas.

## Casos de uso

- Investigación en manipulación bimanual de precisión: el modelo sirve como referencia para evaluar la estrategia FoveaVLA en inserción de cables, comparando el rendimiento de las vistas foveadas frente a las completas en las etapas de entrega e inserción.
- Reproducción de experimentos de DAgger en robótica: al estar entrenado con rondas DAgger 1-3 sobre los subtasks 2 y 3, permite estudiar cómo las correcciones humanas afectan a la política resultante en un entorno Hyundai Duet.
- Desarrollo de políticas con atención selectiva: los recortes de 224x224 y la predicción de cajas a t+8 ofrecen un banco de pruebas para técnicas de foveación y reducción de cómputo visual en tiempo real.
- Evaluación de checkpoints intermedios: al ser el paso 10.000 de 30.000, es útil para analizar curvas de aprendizaje y comparar la pérdida (0,245) frente a checkpoints posteriores del mismo entrenamiento.
- Prototipado de control relativo de articulaciones: el espacio de acciones relativo con cuatro articulaciones absolutas puede reutilizarse como plantilla para tareas de inserción con efector final de dos dedos.
- Estudio de condicionamiento por subtarea: el mecanismo de predicción de subtarea en lenguaje natural permite investigar cómo el modelo descompone tareas largas en etapas y cómo el experto de acción depende de esa señal.
- Integración en pipelines LeRobot: al usar LeRobot 0.6.2 y la librería `pi05_foveavla_subtask`, puede desplegarse en el stack de evaluación de LeRobot para comparativas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento de 0,245 en el paso 10.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.145 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el coste de las seis cámaras, el estado 18-D y el chunk de acciones.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA B200 con batch 32 por GPU; para inferencia se recomienda al menos una GPU con 24 GB o más (A100, H100, L40S, RTX 4090).
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16, aunque no se ha verificado oficialmente; en GPUs de 16 GB requeriría cuantización, no documentada.
- Opciones de despliegue: LeRobot 0.6.2 con la política `pi05_foveavla_subtask` y la rama `stage-views` de `lerobot_foveavla`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_stage (este) | 4.145 M | no disponible | VLA bimanual con foveación, subtask 2-3 | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| Otros checkpoints de chomeed (misma familia) | no disponible | no disponible | Variantes de la misma tarea | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 10.000 de 30.000, por lo que no representa el modelo final del entrenamiento y su rendimiento puede ser inferior al de checkpoints posteriores.
- Sin benchmarks publicados: no hay métricas de éxito en tarea, lo que impide evaluar su calidad objetiva frente a alternativas.
- Licencia no especificada: al no indicarse licencia, el uso comercial queda en un limbo legal y requiere consulta con el autor.
- Sesgos desconocidos: no se documentan sesgos, pero al entrenarse exclusivamente en el entorno Hyundai Duet y en dos subtasks concretos, su generalización a otras escenas, objetos o robots es muy limitada.
- Riesgo de alucinación en la subtarea: el VLM podría predecir una subtarea incorrecta, y el experto de acción se condiciona a ella, lo que puede propagar errores en la ejecución.
- Dependencia de configuración manual: en el robot es obligatorio fijar `fovea_scenario` ("subtask2" o "subtask3") antes de construir los procesadores; una configuración errónea invalida las vistas de entrada.
- Requisitos de entrada estrictos: seis cámaras con nombres concretos y estado de 18 dimensiones; no admite placeholders y una cámara ausente se enmascara en la atención.
- Idiomas no documentados: la interfaz de subtareas está en inglés y no se declaran capacidades multilingües.
- Sin garantías de producción: al ser un artefacto de investigación con 0 descargas y 0 likes, no hay evidencia de robustez en despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio lerobot_foveavla (rama stage-views): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en WandB: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtask2 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtask2 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtask2 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtask3 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtask3 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtask3 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
