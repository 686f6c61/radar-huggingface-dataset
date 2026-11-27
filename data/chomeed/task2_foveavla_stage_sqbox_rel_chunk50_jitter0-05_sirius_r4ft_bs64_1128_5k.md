# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_5k

## Resumen

El modelo `chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_5k` es un checkpoint de política robótica (VLA, Vision-Language-Action) desarrollado por el usuario chomeed, construido sobre `lerobot/pi05_base` y la extensión FoveaVLA. No es un modelo de lenguaje general: es un modelo de control para un robot bimanual Hyundai Duet que combina un VLM (que predice la subtarea actual y cajas de foveación por cámara) con un experto de acciones que genera trayectorias de 18 dimensiones en forma de chunks de 50 pasos. El problema que resuelve es la manipulación robótica de precisión con múltiples cámaras y foveación por subtarea, entrenado con datos de demostración humana y DAgger (intervenciones y rollouts autónomos).

El checkpoint corresponde al paso 5.000 de 30.000 actualizaciones del optimizador de un fine-tune de la ronda 4 de DAgger sobre la tarea 2 del banco Hyundai Duet. La arquitectura FoveaVLA introduce una innovación destacable: el VLM escribe primero la subtarea actual (por ejemplo, "grasp the board with the right hand") y el experto de acciones condiciona su predicción sobre ella; además, cuatro slots de cajas por cámara predicen la región de foveación en t+8, aunque el experto de acciones nunca ve esas cajas.

Es relevante ahora porque ejemplifica el patrón actual de VLA con predicción jerárquica de subtareas, foveación selectiva por cámara y entrenamiento con DAgger iterativo, un pipeline que está ganando tracción en robótica de manipulación con hardware de gama alta (B200) y datasets de intervención humana. El modelo tiene 4.145.521.424 parámetros y un repositorio de 16,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 con extensión FoveaVLA (VLM + experto de acciones con flow matching) |
| Parámetros totales | 4.145.521.424 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue el esquema pi0.5 + FoveaVLA: un VLM que recibe 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un estado de 18 dimensiones, y que primero genera la subtarea actual como texto; después, cuatro slots de cajas por cámara (zed_mini, d405_left, d405_right) predicen la caja de foveación en t+8 mediante 4 clases sobre 1024 bins. El experto de acciones condiciona sobre la subtarea y produce una acción de 18 dimensiones con chunk de 50 (n_action_steps 30), con acciones relativas al estado actual salvo cuatro articulaciones que se mantienen absolutas (right_index_joint2, right_index_joint3, left_index_joint2, left_index_joint3).

El entrenamiento se hizo con LeRobot 0.6.2 (`pi05_foveavla_subtask`, rama `stage-views` del repo HDR-SRL/lerobot_foveavla) y `lerobot_sirius`, con batch efectivo de 64 (32 por GPU en 2×B200 con DDP), AdamW con lr pico 1e-5, warmup 1000 y decaimiento coseno hasta 2,5e-6 en 30.000 pasos, precisión bf16 con pesos maestros fp32 y gradient checkpointing. El muestreo SIRIUS usa proporciones fijas por clase: 50% demostraciones humanas, 40% frames de intervención, 10% rollouts autónomos y 0% de los 3 segundos previos a cada intervención. La pérdida en el paso 5.000 es 0,156, y la pérdida combina flow matching con 0,1×CE de subtarea y, en subtareas de inserción, 0,1×CE de cajas.

## Capacidades

- Predicción jerárquica de subtareas en lenguaje natural ("grasp the board with the right hand", "turn the head to the center", "insert the board into the control module").
- Generación de acciones robóticas de 18 dimensiones con chunk de 50 pasos y 30 pasos de acción efectivos.
- Procesamiento multimodal de 6 cámaras simultáneas con vistas completas y vistas recortadas de foveación.
- Foveación selectiva por cámara: predicción de cajas de foveación en t+8 con 4 clases sobre 1024 bins.
- Manejo de acciones relativas al estado actual con articulaciones absolutas para dedos índice.
- Entrenamiento con DAgger iterativo (rondas 1 a 4) que incorpora correcciones humanas.
- Enmascaramiento de vistas recortadas ausentes mediante `fovea_mask_empty_crops`, tratándolas como cámaras faltantes.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas ni generación de texto general.

## Casos de uso

- Manipulación bimanual de precisión en el robot Hyundai Duet: el modelo controla 18 articulaciones con chunks de 50 pasos, adecuado para tareas de agarre e inserción que requieren coordinación entre ambas manos.
- Inserción de placas en un módulo de control: la subtarea "insert the board into the control module" activa la pérdida de cajas y el recorte de foveación, lo que permite al experto de acciones concentrarse en la región relevante de la imagen.
- Agarre guiado por subtarea: el VLM predice la subtarea de agarre y el experto condiciona sobre ella, útil en pipelines donde la tarea se descompone en fases discretas verificables.
- Investigación en foveación robótica: el modelo permite estudiar el efecto de las vistas recortadas por cámara y del enmascaramiento de crops ausentes en el rendimiento de manipulación.
- Entrenamiento con DAgger en producción: el checkpoint es un punto intermedio (5k de 30k) útil para evaluar la curva de aprendizaje y decidir si continuar el entrenamiento o recolectar más rondas de intervención.
- Evaluación de robustez ante cámaras faltantes: el enmascaramiento de crops permite probar el comportamiento del modelo cuando una vista de foveación no está disponible, un escenario realista en robots con oclusiones.
- Reproducción de experimentos SIRIUS: las proporciones de muestreo por clase (demo 50%, intv 40%, robot 10%) permiten replicar el régimen de entrenamiento en otros bancos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de entrenamiento en el paso 5.000: 0,156.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4.145.521.424 parámetros, en bf16 se requieren aproximadamente 8,3 GB solo para pesos, más overhead de activaciones y 6 cámaras de entrada.
- GPU de entrenamiento documentadas: 2×NVIDIA B200 con batch 32 por GPU y DDP.
- No se documenta si cabe en GPU de consumo (RTX 4090, etc.); por tamaño de parámetros sería plausible en bf16, pero no hay confirmación del autor.
- Opciones de despliegue: LeRobot 0.6.2 con `pi05_foveavla_subtask` y `lerobot_sirius`; el repo indica `pip install git+https://github.com/HDR-SRL/lerobot_foveavla`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_5k | 4.145.521.424 | no disponible | VLA bimanual con foveación y subtareas | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face |
| chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k | no disponible | no disponible | VLA stage foveation, 30k pasos | no disponible | Hugging Face |

La comparativa con modelos de la misma categoría (otros VLA de manipulación) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 5.000 de 30.000 actualizaciones del optimizador; el rendimiento final puede diferir sustancialmente del modelo completo.
- Sin datos de benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de éxito en tareas reales.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Específico del robot Hyundai Duet y de la tarea 2: no es transferible directamente a otros robots o tareas sin reentrenamiento.
- Dependencia de 6 cámaras concretas (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right); la cámara d435 no es una entrada válida.
- Requiere el stack LeRobot 0.6.2 con la rama `stage-views` de `lerobot_foveavla`, lo que limita la portabilidad a otros frameworks.
- Riesgo de alucinación en la subtarea predicha: el VLM puede generar una subtarea incorrecta y condicionar erróneamente al experto de acciones.
- Sesgos de los datos de entrenamiento: las proporciones SIRIUS priorizan demostraciones humanas (50%) e intervenciones (40%) sobre rollouts autónomos (10%), lo que puede infrarepresentar el comportamiento autónomo.
- Idiomas no documentados: las subtareas están en inglés y no se garantiza soporte multilingüe.
- Normalización dependiente del init: las estadísticas están en `policy_preprocessor_*` / `policy_postprocessor_*`; cargar el modelo sin sus procesadores puede producir acciones incorrectas.

## Enlaces

- Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_r4ft_bs64_1128_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint previo (stage foveation, 30k): https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_30k
- Repositorio de código: https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Run de entrenamiento (W&B): https://wandb.ai/meeroro56/hyundai_duet/runs/3qz9lxzh
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger r4 subtarea 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r4
- Dataset DAgger r4 subtarea 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r4
