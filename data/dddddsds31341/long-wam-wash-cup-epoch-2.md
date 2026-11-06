# dddddsds31341/Long-WAM-Wash-Cup-Epoch-2

## Resumen

Long-WAM Wash Cup — Epoch 2 es un checkpoint de evaluación de un ajuste fino independiente del modelo Long-WAM-YAM, desarrollado por el usuario dddddsds31341 a partir del modelo base Efficient-Large-Model/Long-WAM-YAM. Se trata de un modelo de robótica (pipeline `robotics`) orientado a una tarea concreta de manipulación bimanual: sostener y levantar una taza con un gripper mientras el otro limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor.

El modelo combina un modelo de vídeo conjunto con un modelo de acción (joint video/action model) e incorpora un codificador de propiocepción. El checkpoint corresponde a la época 2 de 10 del entrenamiento, en el paso de optimizador 2906, y se distribuye como pesos de evaluación sin estado de optimizador ni de scheduler. El repositorio ocupa 12,0 GB e incluye los pesos `model.pt`, la configuración resuelta, las estadísticas de normalización de la tarea y el código de entrenamiento empaquetado.

Su relevancia es acotada: no es un modelo de propósito general ni un modelo de lenguaje, sino un artefacto de investigación para reproducir y evaluar una política robótica concreta. No se han publicado resultados de éxito en bucle cerrado ni validación held-out, por lo que debe tratarse como material de evaluación, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción, basado en Long-WAM-YAM y en NVlabs/LongLive con cambios SIP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de vídeo P48 y chunk de acción de 32 pasos como configuración de entrada) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` en el dtype almacenado; entrenamiento en BF16) |
| Idiomas soportados | no disponible (modelo de robótica; el codificador de texto es UMT5, requerido como asset aparte) |
| Licencia | other (metadatos de licencia del modelo base en Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch); no es un modelo `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un modelo conjunto de vídeo y acción con un codificador de propiocepción, construido sobre Long-WAM-YAM y sobre el código de NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7) con los cambios SIP incluidos. El modelo consume tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con un layout de vídeo procesado de 384×320, un historial P48 y produce chunks de acción de 32 pasos. Las acciones son objetivos de articulación absolutos de 14 dimensiones con las unidades originales del gripper, ordenados como 6 articulaciones izquierdas + gripper y 6 articulaciones derechas + gripper. Requiere por separado los assets del VAE Wan2.2 y del codificador de texto UMT5 con su tokenizador.

El ajuste fino se realizó sobre el dataset `yuyingyinya/wash_cup` (revisión dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb), con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. El entrenamiento empleó cuatro GPUs con batch de 12 por GPU y acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Se realizan 1.453 actualizaciones de optimizador por época, con un objetivo total de 14.530 actualizaciones. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. No se documenta el uso de RLHF ni DPO, ni innovaciones técnicas adicionales más allá de la integración SIP sobre LongLive.

## Capacidades

- Generación de acciones de manipulación bimanual en espacio de articulaciones (14 dimensiones) condicionada por instrucción de tarea, observaciones de tres cámaras RGB e historial de vídeo.
- Ejecución de una tarea específica de limpieza de taza: sujeción y elevación con un gripper, limpieza del interior con cepillo, devolución del cepillo y colocación de la taza boca abajo en el escurridor.
- Procesamiento de historial de vídeo (P48) y emisión de chunks de acción de 32 pasos.
- Codificación de propiocepción integrada en el modelo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo de pensamiento. El modelo no es un modelo de lenguaje ni un VLM de propósito general.
- Capacidades multilingües: no disponibles; el codificador de texto UMT5 se aporta como asset externo y no se especifican idiomas soportados.

## Casos de uso

- Evaluación de políticas robóticas bimanuales: el checkpoint permite reproducir la política entrenada en la época 2 y comparar su comportamiento frente a épocas posteriores del mismo run, usando `longwam.inference.load_run_config` y `load_model` con `expected_step=2906` y `strict=True`.
- Investigación en aprendizaje por imitación con vídeo: sirve como punto de partida para estudiar cómo el historial P48 y las tres cámaras condicionan la generación de chunks de acción de 32 pasos en tareas de manipulación fina.
- Reproducción de experimentos: al incluir `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt`, permite reconstruir el pipeline de entrenamiento y las estadísticas de normalización de la tarea en otra máquina.
- Desarrollo de adaptadores de robot: útil para validar la integración de un adaptador robótico con las convenciones originales de acción de 14 dimensiones y unidades de gripper antes de desplegar políticas más maduras.
- Docencia y divulgación en robótica: ejemplo concreto de ajuste fino de un modelo conjunto de vídeo y acción sobre un dataset pequeño (100 demostraciones) y con receta de entrenamiento documentada.
- Análisis de normalización y preprocesado: el archivo `dataset_stats.json` y el recorte `[-5, 5]` permiten estudiar el impacto de las estadísticas z-score específicas de tarea en la desnormalización de acciones.
- No se recomienda su uso en producción ni en entornos reales sin una validación en bucle cerrado previa, dado que no se reporta tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reporta tasa de éxito en bucle cerrado ni resultado de validación held-out, y que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB, lo que da una cota inferior del espacio en disco necesario para los pesos, pero no se especifica el consumo de VRAM en inferencia.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con cuatro GPUs (modelo no especificado) con batch de 12 por GPU y DeepSpeed ZeRO-1.
- Compatibilidad con GPU de consumo: no confirmada. No se documenta si el checkpoint cabe en GPUs consumer como RTX 4090.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es mediante el checkout de Long-WAM incluido en `code.zip`, usando `longwam.inference.load_run_config` y `load_model`, con los assets externos del VAE Wan2.2 y del codificador de texto UMT5.
- Latencia y throughput: no disponibles.
- Notas de despliegue: es necesario definir `LONGWAM_MODEL_ROOT` y actualizar las rutas de datos, estadísticas y caché para el punto de entrada de evaluación; se requiere un adaptador de robot compatible y las convenciones originales de acción de 14 dimensiones y gripper.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 2 | no disponible | no disponible (P48, chunk 32) | Limpieza de taza bimanual (ajuste fino) | other | Hugging Face, 6 descargas |
| Efficient-Large-Model/Long-WAM-YAM | no disponible | no disponible | Modelo base de robótica | other (metadatos publicados) | Hugging Face |
| NVlabs/LongLive | no disponible | no disponible | Código base de generación de vídeo | no disponible | GitHub (commit cfa4e91) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de éxito en bucle cerrado ni validación held-out; el checkpoint solo ha superado comprobaciones de carga de archivos en CPU.
- La pérdida de entrenamiento no es una métrica de éxito de la tarea robótica y no debe interpretarse como tal.
- El archivo es de solo evaluación: no incluye estado de optimizador ni de scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Está especializado en una única tarea (limpieza de taza) y en un dataset concreto de 100 demostraciones; no generaliza a otras tareas ni entornos sin un nuevo ajuste fino.
- Requiere assets externos (VAE Wan2.2, codificador de texto UMT5 y tokenizador) que no están incluidos en el repositorio.
- La configuración de entrenamiento conserva rutas del sistema de archivos SIP originales; es necesario reconfigurar rutas para otra máquina.
- No es un modelo `from_pretrained` de Transformers y no se integra en pipelines estándar de Hugging Face.
- Licencia `other`: las condiciones exactas de uso comercial dependen de los metadatos de licencia del modelo base Efficient-Large-Model/Long-WAM-YAM, que deben consultarse antes de cualquier uso comercial.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje.
- El número de descargas (6) y de likes (0) indica una adopción muy limitada; no hay evidencia de la comunidad sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-2
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Registro de entrenamiento en Weights & Biases (CoreWeave): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Código base LongLive (NVlabs): https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup (revisión dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb)
