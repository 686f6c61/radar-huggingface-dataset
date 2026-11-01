# dddddsds31341/Long-WAM-Wash-Cup-Epoch-5

## Resumen

Long-WAM Wash Cup — Epoch 5 es un checkpoint de evaluación de un fine-tune independiente del modelo robótico Long-WAM-YAM, desarrollado originalmente por Efficient-Large-Model. Lo publica el usuario dddddsds31341 en Hugging Face y está especializado en una única tarea bimanual: sostener y levantar una taza con un gripper mientras el otro limpia su interior con un cepillo de botella, devolver el cepillo y colocar la taza boca abajo en el escurridor. El modelo parte de `Efficient-Large-Model/Long-WAM-YAM` y no continúa el fine-tune de ninguna otra tarea.

Se trata de un modelo conjunto de vídeo y acción (joint video/action model) con un codificador de propiocepción, entrenado sobre 100 demostraciones y 69.728 fotogramas a 30 Hz del dataset `yuyingyinya/wash_cup`. La entrada combina tres cámaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320 con un historial P48 y un chunk de acción de 32 pasos; la salida son objetivos de articulación absolutos de 14 dimensiones (6 articulaciones + gripper por brazo).

Su relevancia es acotada pero concreta: es un artefacto de investigación reproducible para políticas robóticas bimanuales de horizonte largo, con configuración resuelta, estadísticas de normalización y código de entrenamiento incluidos. No es un modelo de lenguaje ni un modelo autónomo cargable con `from_pretrained` de Transformers; requiere el checkout de Long-WAM y los assets del VAE Wan2.2 y del codificador de texto UMT5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de vídeo y acción (joint video/action model) con codificador de propiocepción; base Long-WAM-YAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial de observación P48 y chunk de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, dtype registrado en el checkpoint) |
| Idiomas soportados | no disponible (modelo robótico, no conversacional) |
| Licencia | other (metadatos de licencia del modelo base en `Efficient-Large-Model/Long-WAM-YAM`) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia Long-WAM, que combina un modelo de vídeo (con VAE Wan2.2 y codificador de texto UMT5) con una cabeza de acción y un codificador de propiocepción. La política consume tres flujos RGB (`top_head`, `hand_left`, `hand_right`) a una resolución procesada de 384×320, con un historial de P48 y produce chunks de acción de 32 pasos en un espacio de 14 dimensiones absolutas de articulación (6 articulaciones + gripper por brazo, en unidades originales del gripper). El código de entrenamiento es una release SIP v29 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios de SIP incorporados.

El entrenamiento se realizó sobre el dataset `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`), con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando las 100 demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch de 12 por GPU y acumulación de gradiente 1 (batch global 48), AdamW con learning rate constante de 1e-5 y weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada época comprende 1.453 actualizaciones del optimizador y el run completo apunta a 14.530; este checkpoint corresponde a la época 5 de 10, paso de optimizador 7265. Se aplican estadísticas z-score específicas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`.

## Capacidades

- Generación de acciones robóticas bimanuales de horizonte largo condicionadas por instrucción de tarea en lenguaje natural.
- Percepción visual multi-cámara con tres flujos RGB (`top_head`, `hand_left`, `hand_right`).
- Integración de propiocepción mediante codificador dedicado.
- Producción de chunks de acción de 32 pasos en espacio articular absoluto de 14 dimensiones con convención de gripper original.
- Ejecución de una secuencia compuesta de manipulación: agarre, levantamiento, limpieza del interior con cepillo, devolución del cepillo y colocación boca abajo en escurridor.
- No se documentan capacidades de tool calling, agentes conversacionales, matemáticas, código ni multilingüismo; es un modelo específico de robótica.

## Casos de uso

- Investigación en manipulación bimanual de horizonte largo: sirve como referencia reproducible para comparar políticas sobre la tarea de lavado de taza, con configuración y estadísticas de normalización incluidas.
- Reproducción de experimentos: al incluir `config.yaml`, `dataset_stats.json` y `code.zip` (SIP v29), permite reconstruir el pipeline de entrenamiento y evaluar el checkpoint en el paso 7265 con `expected_step=7265` y `strict=True`.
- Evaluación de políticas con múltiples cámaras: el diseño con `top_head`, `hand_left` y `hand_right` a 384×320 permite estudiar el efecto de la vista egocéntrica y de la vista global en tareas de limpieza.
- Estudio de chunking de acciones: el chunk de 32 pasos y el historial P48 son parámetros concretos para analizar latencia de control y estabilidad en tareas de contacto.
- Base para fine-tuning en tareas análogas: al ser un fine-tune independiente desde Long-WAM-YAM, puede emplearse como inicialización para otras tareas de manipulación con dos brazos y utensilios.
- Validación de infraestructura de entrenamiento: el registro público en Weights & Biases y la configuración con DeepSpeed ZeRO-1 y BF16 en cuatro GPUs sirven para reproducir recetas de entrenamiento distribuidas.
- Despliegue en banco de pruebas con adaptador robótico compatible: requiere adaptador de robot coincidente y las convenciones 14D originales; útil para pruebas de integración de software antes de experimentos con hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint ha pasado comprobaciones de carga de ficheros en CPU, pero no reporta tasa de éxito en bucle cerrado con robot ni resultados de validación en conjunto reservado. Asimismo, señala que la pérdida de entrenamiento no es una métrica de éxito de la tarea robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB e incluye pesos en `model.pt`, pero no se desglosa el tamaño del modelo ni el de los assets externos.
- Assets adicionales necesarios: VAE Wan2.2, codificador de texto UMT5 y tokenizer, que deben obtenerse por separado y suman requisitos de memoria no cuantificados en la información disponible.
- GPU recomendadas: no disponible. El entrenamiento usó cuatro GPUs con batch 12 por GPU, BF16 y DeepSpeed ZeRO-1, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI; el modelo no es un `from_pretrained` estándar de Transformers. La carga debe hacerse con `longwam.inference.load_run_config` y `load_model` del checkout incluido en `code.zip`, indicando la ruta explícita a `model.pt`.
- Variables de entorno: es necesario definir `LONGWAM_MODEL_ROOT` para el root de assets del modelo y actualizar las rutas de datos, estadísticas y caché para el punto de entrada de evaluación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Wash Cup — Epoch 5 (este) | Fine-tune robótico bimanual, tarea única | no disponible | P48 de historial, chunk de 32 pasos | other | Hugging Face, 8 descargas |
| Efficient-Large-Model/Long-WAM-YAM | Modelo base robótico | no disponible | no disponible | other | Hugging Face |
| NVlabs/LongLive (commit base del código) | Framework de generación de vídeo de horizonte largo | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación se limita a relación de linaje (fine-tune del primero sobre el segundo, con código derivado del tercero) y a disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el checkpoint está entrenado únicamente para la tarea de lavado de taza descrita; no generaliza a otras tareas sin fine-tuning adicional.
- Sin métricas de éxito: no se reporta tasa de éxito en robot real ni validación en conjunto reservado; la pérdida de entrenamiento no es un indicador de éxito de la tarea.
- Checkpoint de evaluación: es un artefacto de la época 5 de 10 y no incluye estado del optimizador ni del scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- Dependencias externas: requiere VAE Wan2.2, UMT5 y tokenizer por separado, además del checkout de Long-WAM; no funciona con `from_pretrained` estándar de Transformers.
- Rutas codificadas: la configuración original conserva rutas del sistema de ficheros SIP; en otra máquina hay que reconfigurar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadísticas y caché.
- Convenciones estrictas: el despliegue exige un adaptador de robot compatible y las convenciones originales de acción 14D y unidades de gripper; desviarse de ellas invalida la política.
- Normalización dependiente de la tarea: hay que usar `dataset_stats.json` de este mismo repositorio para el preprocesado y la desnormalización de acciones.
- Licencia: marcada como `other`; deben consultarse los metadatos del modelo base para condiciones de uso comercial, que no se detallan aquí.
- Idiomas y sesgos: no hay información sobre sesgos, cobertura lingüística ni alucinación, al no ser un modelo generativo de texto.
- Madurez: 8 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de investigación sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset de entrenamiento: `yuyingyinya/wash_cup` (revisión `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`)
- Código base de referencia: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Registro de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
