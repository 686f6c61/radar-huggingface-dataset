# dddddsds31341/Long-WAM-Wash-Cup-Epoch-4

## Resumen

Long-WAM Wash Cup — Epoch 4 es un checkpoint de evaluación resultante del ajuste fino del modelo base Efficient-Large-Model/Long-WAM-YAM sobre la tarea concreta de lavar una taza con un cepillo de botella en un entorno bimanual. Lo publica el usuario dddddsds31341 en Hugging Face y corresponde al epoch 4 de 10 de un entrenamiento independiente (no continuado de otro fine-tune), en el paso de optimizador 5812 de un total previsto de 14.530 actualizaciones. Se trata, por tanto, de un modelo de política robótica (visión-lenguaje-acción) orientado a control de manipuladores, no de un modelo de lenguaje generativo de propósito general.

El modelo parte de la arquitectura Long-WAM, un modelo conjunto de vídeo y acción que combina un VAE Wan2.2 para la parte visual, un codificador de texto UMT5 y un codificador de propiocepción, y que produce trozos de acción de 32 pasos a partir de tres cámaras RGB (top_head, hand_left, hand_right) y un historial de 48 fotogramas. El entrenamiento emplea 100 demostraciones (69.728 fotogramas a 30 Hz) del dataset yuyingyinya/wash_cup, con objetivos de articulación absolutos de 14 dimensiones (6 articulaciones + pinza por brazo).

Su relevancia es acotada: se trata de un checkpoint de evaluación intermedio, no de un modelo listo para producción ni para uso general. El propio autor advierte que no se reportan tasas de éxito en bucle cerrado ni resultados de validación retenidos, y que el repositorio no es un modelo estándar de Transformers cargable con `from_pretrained`. Su interés principal es reproducir o auditar el proceso de entrenamiento de la política sobre esta tarea específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (Long-WAM) con VAE Wan2.2, codificador de texto UMT5 y codificador de propiocepción |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de 48 fotogramas P48 y trozo de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en el dtype almacenado en `model.pt`, entrenamiento en BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other (se remite a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

La arquitectura es un modelo Long-WAM que combina un modelo de vídeo (VAE Wan2.2) con un codificador de texto UMT5 y un codificador de propiocepción, y que genera acciones de robot condicionadas por tres vistas RGB y un historial temporal. La entrada visual se procesa a 384×320 con un historial P48 (48 fotogramas) y la salida es un trozo de acción de 32 pasos con objetivos de articulación absolutos de 14 dimensiones (izquierda: 6 articulaciones + pinza; derecha: 6 articulaciones + pinza), en unidades originales de la pinza y con estadísticas z-score específicas de la tarea y recorte normalizado en `[-5, 5]`.

El entrenamiento se realizó sobre el dataset yuyingyinya/wash_cup (revisión dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb), con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando las 100 demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU, acumulación de gradiente 1 y batch global 48; tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada epoch supone 1.453 actualizaciones de optimizador y el entrenamiento completo apunta a 14.530 actualizaciones. El código de entrenamiento es una release SIP v29 basada en NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7 con los cambios SIP incluidos. No se documentan etapas de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Control robótico bimanual: genera trayectorias de 14 dimensiones (ambos brazos y pinzas) para ejecutar la tarea de lavar una taza con un cepillo de botella.
- Percepción multivista: procesa tres cámaras RGB simultáneas (top_head, hand_left, hand_right).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante una instrucción textual ("Hold and lift the cup with one gripper while the other cleans its interior with the bottle brush, return the brush, then place the cup upside down on the drying rack").
- Modelado temporal: emplea un historial de 48 fotogramas y predice trozos de acción de 32 pasos.
- Integración con propiocepción: incluye un codificador de propiocepción para el estado del robot.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto libre, visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de experimentos de robótica bimanual: sirve para reproducir el ajuste fino de la tarea wash-cup sobre Long-WAM-YAM y comparar el estado del entrenamiento en el epoch 4 frente a otros checkpoints.
- Auditoría de pipelines de entrenamiento: al incluir `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt`, permite verificar hiperparámetros, estadísticas de normalización y versiones de paquetes del run.
- Evaluación de políticas en simulación o banco de pruebas: puede cargarse con `longwam.inference.load_run_config` y `load_model` (con `expected_step=5812` y `strict=True`) para lanzar evaluaciones controladas.
- Investigación en manipulación con cepillo y pinza: útil para estudiar el comportamiento de una política entrenada con 100 demostraciones en una tarea de limpieza y colocación.
- Desarrollo de adaptadores de robot: sirve como referencia para implementar el adaptador robótico compatible con las convenciones de acción de 14 dimensiones y unidades de pinza originales.
- Docencia y formación en VLA (visión-lenguaje-acción): ejemplo práctico de un pipeline completo de entrenamiento y carga de un modelo de política robótica con estadísticas de normalización específicas de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación retenido, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,0 GB, lo que da una cota inferior orientativa del peso de los artefactos, pero no se especifica el tamaño del modelo ni el consumo en inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1, pero no se indica el modelo concreto.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: carga mediante el checkout de Long-WAM incluido en `code.zip` y las funciones `longwam.inference.load_run_config` y `load_model`; requiere además los assets del VAE Wan2.2, el codificador de texto UMT5 y el tokenizador, que deben obtenerse por separado. No es un modelo `from_pretrained` estándar de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / historial | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 4 | no disponible | P48 (48 fotogramas), acción de 32 pasos | Lavado bimanual de taza (fine-tune) | other | Hugging Face (2 descargas) |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política VLA base | other | Hugging Face |
| NVlabs/LongLive (código base) | no disponible | no disponible | Framework de generación de vídeo largo | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de evaluación intermedio (epoch 4 de 10), no un modelo final ni validado para producción.
- No se reportan tasas de éxito en bucle cerrado ni resultados de validación retenidos; la pérdida de entrenamiento no es una métrica de éxito de la tarea.
- El archivo es solo de evaluación: no contiene estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No es un modelo autónomo de Transformers: requiere el código de Long-WAM, los assets de Wan2.2 VAE, UMT5 y tokenizador, y un adaptador de robot compatible.
- Las rutas del sistema de ficheros del entrenamiento original están retenidas en la configuración; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- Las estadísticas de normalización (`dataset_stats.json`) son específicas de esta tarea y deben usarse para el preprocesamiento y la desnormalización de acciones.
- Solo se ha verificado la carga de ficheros en CPU; no hay evidencia publicada de funcionamiento en hardware robótico real.
- Licencia "other" sujeta a los términos del modelo base Efficient-Large-Model/Long-WAM-YAM; debe revisarse antes de cualquier uso comercial.
- Idiomas soportados no documentados; la instrucción de tarea está en inglés.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-4
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Repositorio de código base: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
