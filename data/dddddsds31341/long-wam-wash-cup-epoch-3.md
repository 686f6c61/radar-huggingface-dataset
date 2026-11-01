# dddddsds31341/Long-WAM-Wash-Cup-Epoch-3

## Resumen

Long-WAM Wash Cup — Epoch 3 es un checkpoint de evaluación intermedio (época 3 de 10, paso de optimizador 4359) de un ajuste fino específico para la tarea de lavado de vasos. Lo publica el usuario `dddddsds31341` como derivado del modelo base `Efficient-Large-Model/Long-WAM-YAM`, un modelo de robótica bimanual de tipo video-acción (world-action model). El modelo resuelve una única tarea de manipulación: sostener y levantar un vaso con un gripper mientras el otro lo limpia por dentro con un cepillo, devolver el cepillo y colocar el vaso boca abajo en el escurridor.

El interés de este repositorio es acotado: no es un modelo de propósito general ni un checkpoint final, sino un peso de evaluación intermedio publicado para reproducibilidad de un experimento concreto. El repositorio pesa 12 GB e incluye el modelo conjunto de vídeo y acción (`model.pt`), la configuración resuelta (`config.yaml`), estadísticas de normalización de la tarea (`dataset_stats.json`) y el código de entrenamiento (`code.zip`). No es un modelo `from_pretrained` autónomo de Transformers: requiere el checkout de Long-WAM y los assets del VAE Wan2.2 y del codificador de texto UMT5.

Con 1 descarga y 0 likes, y sin resultados publicados de éxito en bucle cerrado ni validación held-out, debe tratarse como material de referencia para investigación en imitación robótica bimanual, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (video/action world-action model) sobre base Long-WAM; codificador de propriocepción incluido; VAE Wan2.2 y codificador de texto UMT5 como dependencias externas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de vídeo P48, es decir, 48 pasos de historial) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype registrado por el entrenamiento, BF16 en entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (metadatos de licencia heredados del modelo base; consultar la licencia publicada de `Efficient-Large-Model/Long-WAM-YAM`) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip`, `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo es un world-action model (WAM) que combina un backbone de vídeo con una cabeza de predicción de acciones, siguiendo la línea de Long-WAM. La entrada consta de tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con un historial de P48 pasos y predicción de chunks de acción de 32 pasos. Las acciones son objetivos articulares absolutos de 14 dimensiones en unidades originales del gripper, ordenados como 6 articulaciones izquierdas + gripper, y 6 articulaciones derechas + gripper. Se incluye un codificador de propriocepción y se aplican estadísticas z-score específicas de la tarea con recorte oficial de valores normalizados en `[-5, 5]`.

El entrenamiento parte de `Efficient-Large-Model/Long-WAM-YAM` (no continúa desde el ajuste fino de otra tarea) sobre el dataset `yuyingyinya/wash_cup` en la revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`: 100 demostraciones, 69.728 fotogramas a 30 Hz, todas usadas para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 y batch global 48; tasa de aprendizaje constante de `1e-5`, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época supone 1.453 actualizaciones del optimizador, con un objetivo total de 14.530 actualizaciones. El código proviene de una release SIP v29 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP incluidos.

## Capacidades

- Manipulación robótica bimanual de una tarea específica: sostener y levantar un vaso con un gripper, limpiar su interior con un cepillo con el otro, devolver el cepillo y colocar el vaso boca abajo en el escurridor.
- Predicción de acciones en chunks de 32 pasos a partir de tres vistas RGB y propriocepción de 14 dimensiones.
- Condicionamiento por instrucción de tarea en lenguaje natural (la instrucción de lavado de vasos descrita en la model card).
- No dispone de generación de texto, razonamiento general, código, matemáticas, tool calling ni capacidades de agente.
- No dispone de capacidades multilingües declaradas.
- No dispone de modo de pensamiento (thinking mode), audio ni visión de propósito general más allá de las cámaras de entrada del robot.

## Casos de uso

- Reproducción de experimentos de imitación bimanual: cargar el checkpoint con `longwam.inference.load_run_config` y `load_model` indicando `expected_step=4359` y `strict=True` para verificar el estado exacto del paso 4359 en una réplica del entorno de entrenamiento.
- Evaluación comparativa de checkpoints intermedios: comparar este peso de época 3 frente a otras épocas del mismo ajuste fino para estudiar la evolución de la pérdida y del comportamiento del modelo durante el entrenamiento.
- Estudio de normalización y desnormalización de acciones: usar `dataset_stats.json` para replicar el preprocesado z-score y el recorte `[-5, 5]` en pipelines de investigación sobre datos del dataset `yuyingyinya/wash_cup`.
- Desarrollo de adaptadores de robot: servir como referencia de las convenciones de 14 dimensiones (articulaciones y gripper en unidades originales) al construir un adaptador compatible para un robot bimanual.
- Análisis de datos de demostración: emplear el modelo como componente de un pipeline de investigación que inspeccione cómo se condiciona la predicción de acciones con el historial de vídeo P48 y las tres cámaras.
- Base para ajustes finos posteriores en tareas de limpieza o manipulación de objetos: partir de este checkpoint (o del base Long-WAM-YAM) para experimentos con nuevos datasets de demostraciones a 30 Hz.
- Docencia y divulgación técnica: ilustrar el flujo completo de un ajuste fino de robótica (dataset, estadísticas, configuración, pesos y código) en cursos o talleres de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero que no se reporta ninguna tasa de éxito en bucle cerrado con robot ni resultado de validación held-out, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 12 GB y el entrenamiento usó BF16, por lo que se requiere una GPU con memoria suficiente para el modelo conjunto de vídeo y acción más los assets del VAE Wan2.2 y del codificador UMT5.
- GPU recomendadas: no disponible; el entrenamiento se realizó con cuatro GPUs (modelo no especificado) con batch de 12 por GPU.
- Cabeza en GPU de consumo: no confirmado; no se indica que quepa en GPUs de consumo como la RTX 4090.
- Opciones de despliegue: no se soportan servidores de inferencia estándar como vLLM, TGI, llama.cpp u Ollama; el despliegue requiere el checkout de Long-WAM, `longwam.inference.load_run_config` y `load_model`, además de un adaptador de robot compatible y los assets VAE y UMT5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 3 (este) | no disponible | historial P48 | lavado de vasos bimanual, checkpoint de época 3 | other | HuggingFace, 1 descarga |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | world-action model de robótica | other (consultar metadatos publicados) | HuggingFace |
| NVlabs/LongLive (commit base del código) | no disponible | no disponible | código de entrenamiento/inferencia de referencia | no disponible | GitHub |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio de evaluación (época 3 de 10, paso 4359): no es el modelo final del ajuste fino y no se ha validado su rendimiento en bucle cerrado.
- No se reporta tasa de éxito en robot ni validación held-out; la pérdida de entrenamiento no debe interpretarse como métrica de éxito de la tarea.
- El fichero de solo evaluación no permite restaurar el estado del optimizador, por lo que no sirve para continuar el entrenamiento de forma exacta.
- No es un modelo `from_pretrained` de Transformers: requiere el checkout de Long-WAM, el VAE Wan2.2, el codificador de texto UMT5 y su tokenizador como assets separados.
- La configuración original conserva rutas del sistema de ficheros SIP; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- El despliegue exige un adaptador de robot compatible y respetar las convenciones originales de acción de 14 dimensiones y unidades del gripper.
- Entrenado sobre un único dataset de 100 demostraciones de una sola tarea; no generaliza a otras tareas ni entornos sin nuevo ajuste fino.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Licencia `other` heredada del modelo base: es imprescindible revisar la licencia publicada de `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- Sin idiomas declarados ni capacidades de texto general; la instrucción de tarea está en inglés.
- Publicado por un usuario individual con 1 descarga y 0 likes; sin garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-3
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Código base del entrenamiento: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Registro de entrenamiento online: https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
