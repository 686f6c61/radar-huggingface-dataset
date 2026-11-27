# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k

## Resumen

`chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k` es un checkpoint de política robótica (VLA, vision-language-action) construido sobre pi0.5 y el framework FoveaVLA, con predicción de subtareas de alto nivel. Lo desarrolla el usuario de Hugging Face `chomeed` y deriva del modelo base `lerobot/pi05_base` mediante fine-tuning supervisado sobre el conjunto de datos `hyundai_duet_task2` y seis rondas de DAgger asociadas a dicho conjunto.

El modelo resuelve una tarea concreta de manipulación bimanual: la inserción de un cable GRC (task 2) del banco Hyundai Duet, dividida en subtareas 2 y 3 (entrega del cable a la mano izquierda, inserción en el puerto, entrega a la mano derecha e inserción del otro extremo). Incorpora un mecanismo de foveación por etapas: la política recibe tres vistas RGB completas (d405_left, d405_right, zed_mini) más recortes exactos de 224×224 de las cámaras que la etapa activa fovea, y predice cajas por cámara para la siguiente consulta.

El checkpoint corresponde al paso 30.000 de 30.000 actualizaciones del optimizador, con una pérdida de entrenamiento de 0,108. Es relevante como ejemplo de pipeline de imitation learning con DAgger, predicción de subtareas y atención selectiva sobre regiones de interés, aunque su alcance es muy específico (un único entorno robótico) y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (VLM + experto de acción) con extensión FoveaVLA y cabeza de predicción de subtareas |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo emite subtareas en inglés, pero no es un modelo de propósito general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 16,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se entrena con el framework LeRobot 0.6.2, en concreto con la política `pi05_foveavla_subtask` de la rama `stage-views` del repositorio `lerobot_foveavla`, junto con `lerobot_sirius`. La arquitectura combina un VLM que primero escribe la subtarea actual tras el prompt (por ejemplo, «grasp the board with the right hand» o «insert the board into the control module») y un experto de acción que condiciona su salida en esa subtarea. Además, tras la respuesta, cuatro slots de caja por cámara (zed_mini, d405_left, d405_right) predicen la caja de cada cámara en t+8, con 4 clases sobre 1024 bins; el experto de acción nunca ve estas cajas.

El entrenamiento usa AdamW con lr pico de 2,5e-05, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-06 en 30.000 pasos, con batch efectivo de 64 (32 por GPU en 2× B200, DDP), precisión bf16 con pesos maestros en fp32 y gradient checkpointing. La pérdida combina flow matching con 0,1 × entropía cruzada de subtarea y, en las etapas de inserción, 0,1 × entropía cruzada de caja. Los datos provienen de los conjuntos `hyundai_duet_task2` y seis rondas DAgger (subtask2 y subtask3, rondas 1-3), con un total de 363 episodios y 962.551 fotogramas aproximadamente según la tabla de la model card. El muestreo SIRIUS usa pesos de 0,5 para demostraciones, 0,4 para intervenciones y ≤0,1 para robot, y nunca muestrea los 3 segundos previos a una toma de control.

## Capacidades

- Predicción de subtareas de alto nivel en lenguaje natural antes de generar la acción.
- Generación de acciones de 18 dimensiones relativas al estado actual (con cuatro articulaciones mantenidas en absoluto: right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3).
- Salida en chunks de 50 acciones con 30 pasos efectivos de acción.
- Procesamiento de 6 cámaras de entrada (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y estado de 18 dimensiones.
- Foveación selectiva por etapa: recortes RGB de 224×224 de las cámaras relevantes en cada subtarea.
- Predicción de cajas por cámara (centro x, centro y, lado) para la consulta siguiente, con decodificación como cuadrado deslizado dentro del marco.
- Enmascaramiento de vistas de recorte ausentes en la atención (`fovea_mask_empty_crops`), tratándolas como cámara faltante.
- No dispone de tool calling, function calling, capacidades de agente genérico ni multilingüismo de propósito general.

## Casos de uso

- Automatización de inserción de cables en el banco Hyundai Duet: el modelo ejecuta la secuencia de entrega e inserción con acciones relativas y chunks de 50, adecuado porque fue entrenado específicamente sobre las subtareas 2 y 3 de esa tarea.
- Investigación en imitation learning con DAgger: sirve como checkpoint de referencia para comparar rondas de intervención humana (r1 a r3) y su efecto en la pérdida, ya que la model card documenta los conjuntos y el muestreo SIRIUS.
- Estudio de foveación por etapas en políticas VLA: permite evaluar cómo afecta recibir recortes exactos de 224×224 frente a solo marcos completos, dado que el modelo alterna ambas configuraciones según la subtarea.
- Predicción de subtareas como módulo auxiliar: el VLM escribe la subtarea actual en lenguaje natural, lo que facilita la inspección y depuración del comportamiento del robot en tiempo de ejecución.
- Predicción de regiones de interés: la cabeza de cajas (4 slots por cámara, 1024 bins) puede reutilizarse para el seguimiento de objetos en t+8 en otros pipelines de percepción robótica.
- Despliegue en un gemelo digital o banco de pruebas: al recibir 6 cámaras y estado de 18 dimensiones, puede integrarse en simuladores o réplicas del entorno Hyundai Duet para validar políticas antes de la ejecución real.
- Evaluación de robustez con jitter: el nombre del checkpoint indica jitter de 0,05, útil para estudiar la tolerancia a perturbaciones en las etiquetas de caja durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento en el paso 30.000 (0,108) y no incluye métricas de éxito en tareas (tasa de inserción, error de posición, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.145.521.424 parámetros en bf16, el peso ronda los 8,3 GB, y el repositorio completo ocupa 16,6 GB (probablemente incluye estados del optimizador u otros artefactos).
- GPU recomendadas: el entrenamiento se realizó en 2× B200; para inferencia se recomienda al menos una GPU con 24 GB o más, aunque no se documenta una configuración mínima.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos podría caber en una RTX 4090 (24 GB) en bf16, pero no hay datos de prueba publicados.
- Opciones de despliegue: LeRobot 0.6.2 con la política `pi05_foveavla_subtask` y `lerobot_sirius`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k | 4.145.521.424 | no disponible | Inserción de cable GRC (Hyundai Duet, task 2) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base pi0.5 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de `lerobot/pi05_base` ni de otros checkpoints comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea y entorno (Hyundai Duet, task 2, subtareas 2 y 3); no generaliza a otras tareas sin reentrenamiento.
- La licencia no está declarada, lo que impide determinar si se permite uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- No se documentan sesgos, pero al entrenarse con demostraciones humanas y DAgger puede heredar sesgos de las políticas de teleoperación.
- Riesgo de alucinación en la subtarea predicha: el VLM puede escribir una subtarea incorrecta y condicionar erróneamente al experto de acción.
- La foveación depende de que el escenario se configure correctamente (`policy.config.fovea_scenario = "subtask2"` o `"subtask3"`); una configuración errónea produce vistas de recorte inadecuadas o enmascaradas.
- El modelo espera exactamente 6 cámaras y estado de 18 dimensiones; no admite entradas distintas sin adaptación.
- No se han publicado métricas de éxito en el robot, por lo que no hay evidencia cuantitativa de robustez en producción.
- El checkpoint es el paso 30.000 de 30.000; no se documentan versiones anteriores ni curvas de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio lerobot_foveavla (rama stage-views): https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtask2 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtask2 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtask2 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtask3 r1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtask3 r2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtask3 r3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
