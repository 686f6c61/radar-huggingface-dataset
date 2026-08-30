# sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps-wrist

## Resumen

El modelo `sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps-wrist` es un ajuste fino supervisado (SFT) de [`nvidia/Cosmos3-Edge`](https://huggingface.co/nvidia/Cosmos3-Edge), la familia de modelos de mundo omnimodales de NVIDIA, adaptado a una política de acción (action policy) para un brazo robótico SO-ARM101. La tarea concreta es "coger un tubo de ensayo y colocarlo en el soporte del helicóptero", y la observación utilizada es exclusivamente la imagen de la cámara de muñeca (256×256), sin propriocepción. Esta variante se creó para permitir la evaluación en lazo cerrado en el hardware real, que solo dispone de esa cámara, y para comparar directamente con los experimentos GR00T que usan la misma configuración.

El modelo genera, a partir de un frame de entrada y una instrucción en texto, un chunk de 16 acciones relativas del efector final (10 dimensiones: posición, rotación en formato rot6d y apertura de la pinza) a 15 Hz, además de predecir los 17 frames futuros de la observación (comportamiento de modelo de mundo). El entrenamiento se realizó con el framework [cosmos-framework](https://github.com/Rebis-IvLabs/cosmos-framework) durante 10 000 iteraciones, sobre 270 episodios de demostración (77 107 frames) en una sola GPU RTX PRO 6000 Blackwell. Los checkpoints se publican en formato bf16 exportado, siendo `checkpoint-10000` el de mejor rendimiento.

Es relevante porque demuestra la viabilidad de convertir un modelo de mundo generativo de NVIDIA en una política de control robótico con una sola cámara, un paso hacia la integración de modelos de mundo en sistemas físicos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (base Cosmos3-Edge), fine-tuning parcial de módulos específicos |
| Parametros totales | no disponible (hereda los del modelo base `nvidia/Cosmos3-Edge`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa una imagen y una instrucción corta; no hay contexto textual largo) |
| Tipos de cuantizacion | bf16 (checkpoints exportados como `export_model`) |
| Idiomas soportados | no disponible (la instrucción se formatea como JSON; no se especifican idiomas) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Cosmos3-Edge, es un modelo de mundo omnimodal que procesa y genera texto, imagen, vídeo, audio y acciones mediante una arquitectura unificada de mixture-of-transformers (MoT). En este fine-tuning, se congelan la mayoría de los módulos y solo se entrenan los componentes relacionados con la generación de acciones y vídeo: `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `action2llm`, `llm2action` y `action_modality_embed`, con las cabezas de acción a un learning rate cinco veces mayor (5e-5). La pérdida combina rectified flow sobre vídeo y acciones, con `loss_scale=10` y `action_loss_weight=10`.

Los datos de entrenamiento provienen de un dataset privado (`smr_dataset_so101_pick_place_test_tube_on_the_helicopter_300eps_cosmos3_train`) con 270 episodios y 77 107 frames a 15 Hz, en formato LeRobot v3.0. Se reservaron 30 episodios (9 111 frames) como conjunto de validación. El entrenamiento se ejecutó durante 10 000 iteraciones (11 horas) con batch efectivo de 64, warm-up de 200 iteraciones y un ciclo de longitud 10 000. La normalización de acciones usa `quantile_rot` con estadísticas específicas del brazo SO-ARM101.

## Capacidades

- Generación de acciones de control para un brazo robótico SO-ARM101: salida de 10 dimensiones (dx, dy, dz, rotación en rot6d, apertura de pinza) en formato relativo al frame anterior.
- Predicción de frames futuros de la observación (modelo de mundo): genera 17 frames de vídeo junto con las acciones, lo que permite simular el resultado de la ejecución.
- Procesamiento de instrucciones en lenguaje natural formateadas como JSON, con etiqueta de viewpoint `wrist_view`.
- Observación exclusivamente visual: una imagen RGB de 256×256 de la cámara de muñeca, sin propriocepción.
- Integración con el framework cosmos-framework para servir la política mediante un servidor de acciones HTTP (`/predict`).

## Casos de uso

- **Evaluación de políticas en hardware real con cámara de muñeca**: esta variante está diseñada para probarse en el rig SO-ARM101 que solo tiene cableada la cámara de muñeca, permitiendo cerrar el lazo de control sin añadir una segunda cámara.
- **Comparación con experimentos GR00T**: al usar exactamente el mismo formato de observación (solo muñeca), sirve como referencia para comparar el rendimiento de Cosmos3-Edge frente a la familia GR00T en la misma tarea.
- **Generación de trayectorias a partir de una sola imagen**: el modelo puede predecir un chunk de 16 acciones (≈1.07 s a 15 Hz) desde un único frame, útil para planificación de corto alcance en entornos controlados.
- **Prototipado de políticas de pick-and-place**: la tarea específica (tubo de ensayo → helicóptero) es un banco de pruebas para validar el pipeline de entrenamiento y despliegue antes de escalar a tareas más complejas.
- **Investigación en modelos de mundo para robótica**: al generar tanto acciones como vídeo futuro, permite estudiar la coherencia entre predicción visual y control motor.
- **Despliegue en servidor de inferencia**: mediante el `action_policy_server_libero` del framework, se puede exponer el modelo como un servicio HTTP que acepta imágenes base64 y devuelve acciones, facilitando la integración con sistemas de control existentes.

## Benchmarks y rendimiento

La evaluación se realizó en lazo abierto (open-loop) sobre 30 episodios reservados. Cada chunk de 16 frames se predice a partir del primer frame real y se integra desde la pose real de ese frame, evitando la acumulación de errores entre chunks. Las métricas reportadas son:

| Checkpoint | ADE (cm) | FDE (cm) | Rotación ADE (°) | Gripper MAE (%) | Action MSE |
|---|---|---|---|---|---|
| 2000 | 1.77 | 2.61 | 5.25 | 2.68 | 3.72e-4 |
| 4000 | 1.64 | 2.39 | 4.80 | 2.62 | 4.07e-4 |
| 6000 | 1.60 | 2.30 | 4.74 | 2.39 | 3.87e-4 |
| 8000 | 1.55 | 2.25 | 4.72 | 2.27 | 3.93e-4 |
| **10000** | **1.49** | **2.18** | **4.54** | **2.20** | 3.78e-4 |

El autor indica que tanto la pérdida de entrenamiento como todas las métricas seguían mejorando en la iteración 10 000, por lo que el entrenamiento se detuvo por presupuesto de iteraciones, no por convergencia. En comparación con la variante de vista concatenada (tercera persona + muñeca) en su checkpoint final (5000 iteraciones: ADE 1.51 cm, FDE 2.29 cm, rot 4.6°, gripper 2.5%), la versión solo muñeca en 10 000 iteraciones es marginalmente mejor en todas las métricas, aunque no es una comparación controlada por la diferencia en presupuesto de entrenamiento.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell con 96 GB de VRAM, pero la inferencia puede requerir menos memoria según la cuantización.
- El repositorio pesa 34.8 GB en formato bf16 (checkpoints exportados). Se recomienda una GPU con al menos 40 GB de VRAM para cargar el modelo completo en precisión bf16.
- No se han publicado datos de latencia ni throughput para inferencia.
- El despliegue se realiza mediante el servidor de políticas del framework cosmos-framework (`action_policy_server_libero`), que expone una API HTTP. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia estándar.
- Para uso en GPU de consumo (p. ej., RTX 4090 con 24 GB), sería necesario cuantizar el modelo a 8 bits o menos, aunque no se proporcionan versiones cuantizadas en el repositorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos de política para la misma tarea y configuración. La única comparación directa mencionada es con la variante de vista concatenada del mismo modelo (`cosmos3-edge-so101-pick-place-testtube-helicopter-300eps`), que usa observación de dos cámaras (tercera persona + muñeca, 256×512). En su checkpoint final (5000 iteraciones), esa variante obtiene ADE 1.51 cm, FDE 2.29 cm, rotación 4.6° y gripper 2.5%, mientras que la versión solo muñeca en 10 000 iteraciones logra ADE 1.49 cm, FDE 2.18 cm, rotación 4.54° y gripper 2.20%. No se comparan con modelos GR00T, aunque el autor indica que se creó esta variante para permitir dicha comparación.

## Limitaciones y advertencias

- **No evaluado en lazo cerrado**: todas las métricas son de trayectorias open-loop; el éxito de la tarea en el brazo real no está medido. El autor lo indica explícitamente: "Not yet evaluated closed-loop".
- **Entrenamiento incompleto**: la pérdida y las métricas seguían mejorando en la iteración 10 000, lo que sugiere que un entrenamiento más largo podría dar mejores resultados.
- **Datos limitados**: el modelo se entrenó en una única tarea con 270 episodios; no generaliza a otras tareas sin fine-tuning adicional.
- **Dependencia de la cámara de muñeca**: al usar solo la vista de muñeca, el modelo puede fallar en situaciones donde la información de contexto global es necesaria (por ejemplo, obstáculos fuera del campo de visión).
- **Formato de rotación específico**: la rotación se empaqueta como las dos primeras columnas de la matriz de rotación en orden column-major, una convención de Cosmos que difiere de la usada por GR00T (`eef_9d`); hay que tener cuidado al integrar en controladores existentes.
- **Licencia NVIDIA Open Model License**: tiene términos específicos que pueden restringir el uso comercial o la redistribución; se debe revisar la licencia completa antes de usar en producción.
- **Sin soporte para tool calling ni agentes**: es un modelo de política puro, no un asistente conversacional.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps-wrist](https://huggingface.co/sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps-wrist)
- Variante con vista concatenada: [https://huggingface.co/sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps](https://huggingface.co/sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps)
- Modelo base: [https://huggingface.co/nvidia/Cosmos3-Edge](https://huggingface.co/nvidia/Cosmos3-Edge)
- Paper de Cosmos 3: [https://arxiv.org/abs/2606.02800](https://arxiv.org/abs/2606.02800)
- Página de Cosmos 3 en NVIDIA: [https://research.nvidia.com/labs/cosmos-lab/cosmos3/](https://research.nvidia.com/labs/cosmos-lab/cosmos3/)
- Framework de entrenamiento: [https://github.com/Rebis-IvLabs/cosmos-framework](https://github.com/Rebis-IvLabs/cosmos-framework)
- Repositorio NVIDIA Cosmos: [https://github.com/NVIDIA/cosmos](https://github.com/NVIDIA/cosmos)
- Seguimiento del entrenamiento (W&B): [https://wandb.ai/RebisVla/cosmos3_so101/runs/92qiu1ug](https://wandb.ai/RebisVla/cosmos3_so101/runs/92qiu1ug)
