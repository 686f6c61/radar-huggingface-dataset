# dddddsds31341/Long-WAM-Wash-Cup-Epoch-1

## Resumen

Long-WAM Wash Cup — Epoch 1 es un checkpoint de evaluación de un ajuste fino independiente sobre el modelo base `Efficient-Large-Model/Long-WAM-YAM`, publicado por el usuario `dddddsds31341`. Se trata de un modelo de robótica (pipeline `robotics`) orientado a una tarea bimanual concreta: sostener y levantar una taza con una pinza mientras la otra limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor. El checkpoint corresponde a la época 1 de 10, en el paso de optimizador 1453.

El modelo se distribuye como pesos PyTorch (`model.pt`) que contienen un modelo conjunto de vídeo y acción junto con un codificador de propiocepción. No es un modelo de lenguaje ni un transformer estándar cargable con `from_pretrained` de Transformers: requiere el código de entrenamiento incluido (`code.zip`, release SIP v29 basada en `NVlabs/LongLive`) y assets externos del VAE de Wan2.2 y del codificador de texto UMT5.

Su relevancia es acotada y experimental: se publica como material de evaluación de un fine-tune sobre un dataset propio de 100 demostraciones, sin resultados de éxito en robot real ni validación held-out reportados. Resulta útil para investigadores que quieran reproducir o inspeccionar el ajuste de Long-WAM a una tarea de manipulación bimanual concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (video/action model) con codificador de propiocepción; basado en Long-WAM (derivado de NVlabs/LongLive con cambios SIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de historia P48 y chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del paso de entrenamiento, presumiblemente BF16) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (metadatos de licencia del modelo base en https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch); incluye `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino del modelo Long-WAM-YAM, un modelo conjunto de vídeo y acción para control robótico. La arquitectura combina un modelo de vídeo (con VAE de Wan2.2) y un codificador de texto UMT5, más un codificador de propiocepción que procesa el estado del robot. La salida son objetivos de articulación absolutos de 14 dimensiones con unidades originales de pinza, ordenados como 6 articulaciones izquierdas + pinza y 6 articulaciones derechas + pinza. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con disposición de vídeo procesado de 384×320, historia P48 y chunk de acción de 32 pasos.

El entrenamiento se realizó sobre el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`), con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs, batch size 12 por GPU, acumulación de gradiente 1 y batch global 48; learning rate constante de `1e-5`, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época consta de 1453 actualizaciones del optimizador y el run completo apunta a 14.530 actualizaciones (10 épocas). Se aplicaron estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`.

## Capacidades

- Control robótico bimanual para una tarea de manipulación concreta: limpiar el interior de una taza con un cepillo y colocarla en el escurridor.
- Generación de acciones de articulación absolutas de 14 dimensiones (6+pinza por brazo) a partir de observaciones visuales multi-cámara y propiocepción.
- Procesamiento de tres flujos RGB simultáneos (`top_head`, `hand_left`, `hand_right`).
- Predicción de chunks de acción de 32 pasos con historia de 48 pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.
- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

## Casos de uso

- Investigación en imitación bimanual: el checkpoint sirve para estudiar cómo un modelo de vídeo-acción aprende una secuencia larga de manipulación (sostener, limpiar, devolver cepillo, colocar taza) a partir de 100 demostraciones.
- Reproducción de experimentos de fine-tuning: con `code.zip` y `config.yaml` se puede reejecutar el ajuste sobre el dataset `yuyingyinya/wash_cup` y comparar la época 1 con épocas posteriores.
- Evaluación de pipelines de inferencia Long-WAM: útil para validar la carga del modelo con `longwam.inference.load_run_config` y `load_model` con `expected_step=1453` y `strict=True`.
- Desarrollo de adaptadores de robot: sirve como referencia para implementar las convenciones de acción de 14 dimensiones y unidades de pinza en un adaptador de robot concreto.
- Análisis de normalización y preprocesado: `dataset_stats.json` permite verificar el pipeline de z-score y el recorte `[-5, 5]` en tareas de manipulación similares.
- Estudio de estabilidad de entrenamiento: al ser un checkpoint intermedio (época 1 de 10), permite analizar la evolución de la pérdida y del comportamiento del modelo frente a checkpoints finales.
- Base para transferencia a tareas de limpieza o manipulación con dos brazos en entornos de laboratorio, siempre con un adaptador de robot compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en robot en bucle cerrado ni resultados de validación held-out. La pérdida de entrenamiento no se considera una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, lo que da una cota inferior aproximada del tamaño de los pesos; el requisito real depende del VAE de Wan2.2, del codificador UMT5 y del codificador de propiocepción, que se cargan por separado.
- GPU recomendadas: no disponible. El entrenamiento se realizó en cuatro GPUs con BF16 y DeepSpeed ZeRO-1, pero no se especifica el modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible; el tamaño de 12 GB de pesos sugiere que podría requerir GPUs de gama alta con al menos 24 GB de VRAM, pero no hay confirmación.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere el código incluido en `code.zip` (release SIP v29) y el checkout de Long-WAM, con assets externos de Wan2.2 VAE y UMT5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 1 | Modelo vídeo-acción bimanual (fine-tune) | no disponible | no disponible (P48 / chunk 32) | other | Hugging Face, repo de 12 GB |
| Efficient-Large-Model/Long-WAM-YAM | Modelo vídeo-acción base | no disponible | no disponible | other (ver model card) | Hugging Face |
| NVlabs/LongLive | Base de código de generación de vídeo largo | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de benchmarks ni de parámetros para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de evaluación de la época 1 de 10: no representa el modelo final y no se reporta su rendimiento en robot real.
- No incluye estado del optimizador ni del scheduler, por lo que no permite reanudar el entrenamiento exactamente.
- No es un modelo autónomo de Transformers: no se puede cargar con `from_pretrained`; requiere código específico, el VAE de Wan2.2, el codificador UMT5 y el tokenizer.
- Las rutas del sistema de ficheros del entrenamiento original están embebidas en la configuración; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- Específico de una única tarea y de un adaptador de robot concreto; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero el modelo puede generar acciones no válidas fuera de la distribución de las 100 demostraciones.
- Licencia `other`: es necesario revisar los términos del modelo base antes de cualquier uso comercial.
- Sin validación held-out ni tasa de éxito publicada; la pérdida de entrenamiento no es una métrica fiable de éxito en la tarea.
- El dataset es pequeño (100 demostraciones) y de un único entorno, lo que limita la robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-1
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Código base LongLive: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
