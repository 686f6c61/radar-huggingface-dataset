# dddddsds31341/Long-WAM-Wash-Cup-Epoch-6

## Resumen

Long-WAM Wash Cup — Epoch 6 es un checkpoint de evaluación de un ajuste fino independiente sobre el modelo base Efficient-Large-Model/Long-WAM-YAM, orientado a robótica bimanual. Lo publica el usuario dddddsds31341 y resuelve una tarea concreta de manipulación: sostener y levantar una taza con una pinza mientras la otra limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en un escurridor. El checkpoint corresponde a la época 6 de 10 (paso de optimizador 8718) de un entrenamiento sobre el dataset yuyingyinya/wash_cup.

Se trata de un modelo conjunto de vídeo y acción (joint video/action model) que combina un codificador de propiocepción con un backbone de difusión de vídeo (Wan2.2 VAE y codificador de texto UMT5), siguiendo el linaje Long-WAM/LongLive de NVIDIA. No es un modelo de lenguaje ni un transformer estándar cargable con `from_pretrained`: requiere el código de inferencia incluido en el repositorio y adaptadores de robot específicos.

Su relevancia es acotada: es un artefacto de investigación reproducible para una tarea única, con 100 demostraciones y 69.728 fotogramas a 30 Hz, útil para estudiar políticas visuomotoras bimanuales de horizonte largo, pero sin métricas de éxito en bucle cerrado publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (video/action) sobre backbone de difusión de vídeo Wan2.2, con codificador de propiocepción; linaje Long-WAM/LongLive (SIP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de P48 fotogramas, chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos almacenados en el dtype del entrenamiento, presumiblemente BF16; no se documentan opciones de cuantización) |
| Idiomas soportados | no disponible (modelo de robótica; instrucción de tarea en inglés) |
| Licencia | other (hereda la del modelo base; consultar Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | model.pt (PyTorch), más config.yaml, dataset_stats.json, code.zip y requirements-sip.txt |

## Arquitectura y entrenamiento

El modelo es un sistema conjunto de vídeo y acción construido sobre un backbone de difusión de vídeo (Wan2.2 VAE y codificador de texto UMT5, que deben obtenerse por separado). Incorpora un codificador de propiocepción y sigue la estela del proyecto Long-WAM/LongLive de NVIDIA, con los cambios SIP incluidos en el lanzamiento de código v29, basado en NVlabs/LongLive@cfa4e91. La entrada visual son tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con P48 fotogramas de historial y un chunk de acción de 32 pasos.

El ajuste fino se realizó sobre el dataset yuyingyinya/wash_cup (revisión dcf90aa), con 100 demostraciones, 69.728 fotogramas a 30 Hz y todas las demostraciones destinadas a entrenamiento. Se usaron cuatro GPUs, batch de 12 por GPU, acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época supone 1.453 actualizaciones de optimizador y el run completo apunta a 14.530. Las acciones son objetivos articulares absolutos de 14 dimensiones (6 articulaciones izquierdas + pinza, 6 derechas + pinza) con estadísticas z-score específicas de la tarea y recorte al rango normalizado [-5, 5]. No se documenta RLHF ni DPO, lógicamente por tratarse de un modelo de control motor.

## Capacidades

- Control visuomotor bimanual: genera acciones articulares de 14 dimensiones a partir de tres vistas RGB y del estado de propiocepción.
- Ejecución de una instrucción de tarea concreta: sostener, levantar, limpiar con cepillo, devolver el cepillo y colocar la taza boca abajo.
- Planificación de horizonte largo: chunk de acción de 32 pasos con 48 fotogramas de historial.
- Manipulación coordinada de dos brazos con pinzas independientes.
- No soporta tool calling ni function calling.
- No es un modelo de agentes conversacionales ni de razonamiento multi-step en lenguaje natural.
- Sin capacidades multilingües documentadas.
- Sin visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en políticas visuomotoras bimanuales: servir como referencia reproducible de un ajuste fino sobre Long-WAM-YAM para comparar variantes de arquitectura o de normalización en una tarea de limpieza de taza.
- Reproducción de experimentos: con `model.pt`, `config.yaml` y `dataset_stats.json` del mismo repositorio, se puede cargar el checkpoint con `longwam.inference.load_run_config` y `load_model` (paso esperado 8718, `strict=True`) para repetir la evaluación.
- Evaluación de pipelines de datos: el dataset de 100 demostraciones y 69.728 fotogramas a 30 Hz permite medir cómo afectan el preprocesado de vídeo (384×320, P48) y la normalización z-score al comportamiento de la política.
- Estudio de chunking de acciones: el chunk de 32 pasos y el historial de 48 fotogramas son parámetros útiles para analizar latencia frente a reactividad en control de robots.
- Base para nuevos ajustes finos: al tratarse de un run independiente que parte del modelo base (no de otro ajuste), sirve como punto de partida para tareas de manipulación con cepillo o utensilios similares.
- Docencia y divulgación en robótica: ejemplo didáctico de pipeline completo (difusión de vídeo, propiocepción, acciones articulares absolutas, DeepSpeed ZeRO-1) con código y estadísticas incluidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no se reporta tasa de éxito en bucle cerrado con robot ni resultado de validación en conjunto reservado. La pérdida de entrenamiento no se considera métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB y el entrenamiento usó BF16, por lo que se requiere una GPU con al menos ese orden de memoria para cargar `model.pt` sin cuantización.
- GPU recomendadas: no disponibles de forma explícita; el entrenamiento se ejecutó en cuatro GPUs (no se especifica el modelo). Para inferencia se necesita una GPU compatible con PyTorch y BF16.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repositorio (12 GB) sugiere que podría cargarse en GPUs de 16-24 GB, pero no hay datos publicados.
- Opciones de despliegue: no es un modelo estándar de Transformers; requiere el checkout de Long-WAM incluido en `code.zip`, el adaptador de robot correspondiente y los activos Wan2.2 VAE, UMT5 y tokenizer obtenidos por separado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 6 | no disponible | P48 fotogramas / chunk 32 | Limpieza bimanual de taza | other | Hugging Face (repo de 12 GB) |
| Efficient-Large-Model/Long-WAM-YAM (base) | no disponible | no disponible | Política visuomotora general | other | Hugging Face |
| NVlabs/LongLive | no disponible | no disponible | Generación de vídeo de horizonte largo | no disponible | GitHub |
| Otros checkpoints de yuyingyinya/wash_cup | no disponible | no disponible | Limpieza bimanual de taza | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 100 demostraciones de un único entorno, la política puede sobreajustarse a esa configuración de cámaras, robot y objetos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no hay idiomas documentados; la instrucción de tarea está en inglés y el modelo no es conversacional.
- Restricciones de licencia: licencia "other" heredada del modelo base; es imprescindible revisar los términos de Efficient-Large-Model/Long-WAM-YAM antes de cualquier uso comercial.
- El checkpoint es de evaluación: `model.pt` no incluye estado de optimizador ni scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- La configuración de entrenamiento conserva rutas del sistema de ficheros SIP; en otra máquina hay que definir `LONGWAM_MODEL_ROOT` y actualizar rutas de datos, estadísticas y caché.
- No es un modelo `from_pretrained` de Transformers; requiere código, adaptador de robot y activos auxiliares (Wan2.2 VAE, UMT5, tokenizer).
- Sin tasa de éxito en bucle cerrado ni validación en conjunto reservado: no debe asumirse robustez en producción.
- Las acciones usan convenciones de 14 dimensiones con unidades de pinza originales; mezclar estadísticas de normalización de otro repositorio invalida los resultados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-6
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/wash_cup
- Repositorio de código base LongLive: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
- Registro de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
