# dddddsds31341/Long-WAM-Sweep-Trash-Epoch-1

## Resumen

Long-WAM-Sweep-Trash-Epoch-1 es un checkpoint de evaluación de un ajuste fino del modelo robótico Long-WAM-YAM, desarrollado por el usuario dddddsds31341 sobre la base de Efficient-Large-Model/Long-WAM-YAM. El modelo está especializado en una única tarea bimanual de manipulación: sujetar un recogedor con un gripper y barrer dos trozos de papel arrugado con el otro. Se trata, por tanto, de un artefacto de investigación orientado a la evaluación de políticas visomotoras, no de un modelo de propósito general.

El checkpoint corresponde a la época 1 de 5 del entrenamiento, en el paso de optimizador 1011, y se distribuye con los pesos (`model.pt`), la configuración resuelta (`config.yaml`), las estadísticas de normalización de la tarea (`dataset_stats.json`) y el código de inferencia empaquetado (`code.zip`). El repositorio ocupa 12,0 GB e incluye únicamente el estado del modelo, sin estado de optimizador ni de scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de ajuste fino sobre Long-WAM con el conjunto de datos `yuyingyinya/sweep_trash`, y como material de partida para quienes trabajen en manipulación bimanual con modelos video-acción. No es un modelo autónomo de tipo `from_pretrained` de Transformers y requiere infraestructura específica (VAE Wan2.2, codificador de texto UMT5, adaptador de robot) para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción, derivado de Long-WAM-YAM; no se detalla la topología interna |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible; historial de vídeo P48 (48 fotogramas) y chunk de acción de 32 pasos |
| Tipos de cuantizacion | No disponible; pesos almacenados en el dtype del paso de entrenamiento (BF16 en entrenamiento) |
| Idiomas soportados | No disponible (modelo robótico; instrucción de tarea en inglés) |
| Licencia | other (se remite a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Efficient-Large-Model/Long-WAM-YAM, un modelo que combina generación de vídeo y predicción de acciones (video/action model) e incorpora un codificador de propiocepción. La entrada consta de tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) con un diseño de vídeo procesado de 384×320, un historial de 48 fotogramas (P48) y un chunk de acción de 32 pasos. La salida son objetivos articulares absolutos de 14 dimensiones con las unidades originales de los grippers, ordenados como 6 articulaciones izquierdas + gripper y 6 articulaciones derechas + gripper.

El entrenamiento se realizó sobre el conjunto `yuyingyinya/sweep_trash` (revisión `0dd5ff1f576de17dcf06b49d352e0f125a1f43e6`), con 100 demostraciones y 48.495 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU y acumulación de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0,01, BF16 y DeepSpeed ZeRO-1. Cada época comprende 1.011 actualizaciones de optimizador y la ejecución completa apunta a 5.055 actualizaciones. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. El código de entrenamiento es la release SIP v22, basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios de SIP incluidos. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Predicción de acciones robóticas bimanuales de 14 dimensiones (12 articulaciones + 2 grippers) a partir de observaciones visuales y de propiocepción.
- Procesamiento conjunto de vídeo multicámara (tres vistas RGB) e historial temporal de 48 fotogramas.
- Generación de chunks de acción de 32 pasos, lo que permite ejecutar secuencias de control sin replanificación en cada paso.
- Modelado video-acción: el checkpoint base Long-WAM-YAM integra un VAE Wan2.2 y un codificador de texto UMT5, lo que sugiere capacidades de modelado generativo de vídeo además de la política de acción.
- Condicionamiento por instrucción de tarea en lenguaje natural (la instrucción de barrido se proporciona como texto).
- Especialización en una única tarea: barrer dos trozos de papel arrugado hacia un recogedor con coordinación bimanual.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico ni multilingüismo.

## Casos de uso

- Evaluación de políticas visomotoras bimanuales: el checkpoint permite reproducir la tarea de barrido con un adaptador de robot compatible y las convenciones 14D originales, sirviendo como línea base para comparar variantes de entrenamiento.
- Investigación en ajuste fino de modelos video-acción: al incluir `config.yaml`, `dataset_stats.json` y el código SIP v22, facilita estudiar el efecto de hiperparámetros (épocas, batch, LR) sobre el mismo conjunto de 100 demostraciones.
- Reproducibilidad de experimentos: las estadísticas de normalización específicas de la tarea y el paso exacto (1011) permiten replicar el preprocesamiento y la desnormalización de acciones en una máquina distinta configurando `LONGWAM_MODEL_ROOT`.
- Desarrollo de pipelines de manipulación con recogedor y cepillo: la tarea concreta es representativa de escenarios de limpieza doméstica, útil para prototipar control bimanual coordinado en entornos simulados o de laboratorio.
- Estudio de coordinación bimanual: la instrucción exige que un gripper sostenga el recogedor mientras el otro barre, lo que convierte al checkpoint en un caso de prueba para políticas que requieren reparto asimétrico de roles entre brazos.
- Docencia y formación en robótica de imitación: el repositorio autocontenido (pesos, configuración, estadísticas y código) permite montar prácticas sobre ajuste fino de políticas con datos de demostración a 30 Hz.
- Comparación de checkpoints intermedios: al ser la época 1 de 5, sirve para analizar la evolución del aprendizaje frente a épocas posteriores del mismo run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha superado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en bucle cerrado con robot ni resultados de validación en conjunto reservado, y advierte que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,0 GB en pesos, pero no se especifica el número de parámetros ni el consumo en inferencia; además requiere cargar por separado el VAE Wan2.2 y el codificador de texto UMT5, lo que incrementa los requisitos.
- GPU recomendadas: no disponibles. El entrenamiento se realizó con cuatro GPUs (modelo no especificado) en BF16 con DeepSpeed ZeRO-1, lo que sugiere hardware de centro de datos; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible. No se documenta el tamaño del modelo ni una variante cuantizada que permita estimarlo.
- Opciones de despliegue: no es un modelo `from_pretrained` de Transformers. Requiere extraer `code.zip`, instalar el checkout de Long-WAM incluido y usar `longwam.inference.load_run_config` y `load_model` con la ruta explícita a `model.pt`, `expected_step=1011` y `strict=True`. Se necesita un adaptador de robot compatible y las convenciones 14D originales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM-Sweep-Trash-Epoch-1 | No disponible | Historial P48, chunk de 32 pasos | Barrido bimanual (ajuste fino) | other | HuggingFace, 18 descargas |
| Efficient-Large-Model/Long-WAM-YAM | No disponible | No disponible | Modelo base video-acción | Según metadatos del modelo base | HuggingFace |
| NVlabs/LongLive (commit base del código) | No disponible | No disponible | Framework de generación de vídeo de referencia | No disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de evaluación de una sola época: no representa el modelo final del run (que apunta a 5 épocas y 5.055 actualizaciones).
- No incluye estado de optimizador ni de scheduler, por lo que no permite reanudar el entrenamiento de forma exacta.
- No se reporta tasa de éxito en robot real ni validación en conjunto reservado; la pérdida de entrenamiento no es indicador de éxito de la tarea.
- Especialización extrema: solo cubre la tarea de barrido descrita; no generaliza a otras instrucciones sin nuevo ajuste fino.
- Dependencia de infraestructura: requiere VAE Wan2.2, UMT5, tokenizer y un adaptador de robot compatible; no funciona como modelo estándar de Transformers.
- Las rutas del sistema de ficheros del entrenamiento original persisten en la configuración; es necesario reconfigurar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadísticas y caché.
- Licencia "other": las condiciones de uso comercial dependen de la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM, que debe consultarse por separado.
- Riesgo de sobreajuste a las 100 demostraciones del conjunto `sweep_trash`, con posible sensibilidad a variaciones de iluminación, posición de cámara o estado inicial.
- No se documentan sesgos demográficos ni lingüísticos; el modelo opera sobre percepción visual y propiocepción, no sobre texto libre.
- Idiomas no especificados: la instrucción de tarea está en inglés y no se declara soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/Long-WAM-Sweep-Trash-Epoch-1
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Conjunto de datos: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/nwa2ucgt
- Repositorio de referencia del código: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
