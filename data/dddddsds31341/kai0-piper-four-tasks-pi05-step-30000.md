# dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-30000

## Resumen

Kai0-Piper-Four-Tasks-pi05-step-30000 es un checkpoint de inferencia de un modelo vision-language-action (VLA) obtenido mediante fine-tuning completo del modelo base `pi05_base` de Physical Intelligence sobre un conjunto de cuatro tareas roboticas de manipulacion. Lo publica el usuario de HuggingFace `dddddsds31341` bajo el ecosistema Kai0 y la libreria `piper`, y representa el paso 30.000 de un entrenamiento de 40.005 actualizaciones finalizado el 2 de noviembre de 2026.

El modelo resuelve el problema de control de un brazo robotico Agilex Piper a partir de instrucciones en lenguaje natural y tres camaras (`top_head`, `hand_left`, `hand_right`), generando acciones de 14 dimensiones (articulaciones y pinza) con un horizonte de 50 pasos. Es relevante para la comunidad de robotica open source porque demuestra un pipeline completo de fine-tuning multi-tarea sobre π0.5 con pesos JAX/Orbax, normalizacion cuantilica compartida y codigo de preprocesado incluido.

El checkpoint tiene un tamano de repositorio de 12,5 GB y se distribuye en formato Orbax/OCDBT (no en safetensors ni GGUF), por lo que no es cargable con `transformers.from_pretrained`. No se declara licencia, idiomas soportados ni resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (Physical Intelligence), implementacion JAX/OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto largo) |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax/OCDBT (directorio `params/` con shards y metadatos, no safetensors ni GGUF) |
| Tamano del repositorio | 12,5 GB |
| Camaras de entrada | `top_head`, `hand_left`, `hand_right` |
| Dimension de acciones | 14D absolutas (articulaciones + pinza), padding interno a 32D |
| Horizonte de accion | 50 pasos |
| Normalizacion | cuantilica compartida entre las cuatro tareas (`effective_use_quantile_norm=True`) |
| Paso de entrenamiento | 30.000 / 40.005 |
| Hardware de entrenamiento | 2 x A100 80 GB con FSDP |

## Arquitectura y entrenamiento

El modelo parte de los pesos `pi05_base` de Physical Intelligence, un VLA que combina un backbone vision-language con una cabeza de accion para generar trayectorias de control. El fine-tuning es completo (no LoRA ni adaptadores) en JAX sobre OpenPI, con FSDP entre dos A100 de 80 GB, batch global de 64 (32 ejemplos por GPU) y sin acumulacion de gradientes. Se emplea EMA con decaimiento 0,99 y semilla 42.

El dataset de entrenamiento consta de 400 demostraciones y 569.842 fotogramas, 100 demostraciones por tarea, mezclados de forma proporcional al numero de fotogramas. Las cuatro tareas son `nesting_doll`, `fold_towel`, `sorting_dolls` y `putting_tennis`, cada una con su prompt en ingles. Se aplica una transformacion Agilex que anula entradas de estado y accion fuera de `[-pi, pi]`, y se usa una normalizacion cuantilica unica para las cuatro tareas mediante `assets/piper_four_tasks/norm_stats.json`. El checkpoint contiene solo parametros de inferencia (EMA) y assets de normalizacion, sin estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Control robotico de manipulacion a partir de instrucciones en lenguaje natural y observaciones visuales de tres camaras.
- Ejecucion de cuatro tareas concretas: anidar munecas rusas, doblar una toalla, ordenar cinco munecas rusas y colocar cuatro pelotas de tenis en una cesta verde.
- Generacion de acciones articulares absolutas de 14 dimensiones con horizonte de 50 pasos.
- Politica multi-tarea unica: un solo conjunto de pesos sirve para las cuatro tareas, seleccionando la tarea mediante el prompt.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en manipulacion multi-tarea: servir como referencia reproducible de fine-tuning de π0.5 sobre un brazo Agilex Piper, con configuracion, semilla y versiones registradas.
- Benchmark interno de politicas VLA: comparar el rendimiento de este checkpoint frente a otros pasos de la misma coleccion (los nueve checkpoints del mismo run) en las cuatro tareas.
- Prototipado de tareas de precision fina: la tarea `nesting_doll` exige insercion de objetos pequenos y puede usarse para estudiar politicas de contacto y alineacion.
- Estudio de generalizacion entre tareas: la normalizacion cuantilica compartida permite analizar como un solo conjunto de pesos reparte capacidad entre tareas con distinta distribucion de acciones.
- Desarrollo de pipelines de despliegue OpenPI: el checkpoint incluye `code.zip`, `training_config.json` y `task_prompts.json`, utiles para integrar la politica en un bucle de control real.
- Reproduccion de experimentos: con `requirements-sip.txt`, `pyproject.toml` y `uv.lock` se puede reconstruir el entorno de inferencia y validar la carga del modelo.
- Educacion y divulgacion: ejemplo didactico de como se estructura un checkpoint Orbax de un VLA y como se cargan los assets de normalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en robot ni evaluacion en conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 12,5 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precision de entrenamiento.
- GPU recomendadas: A100 80 GB o H100 para carga holgada; el entrenamiento se realizo en 2 x A100 80 GB, pero la inferencia cabe en una sola GPU de gama alta.
- GPU de consumo: no se documenta soporte para RTX 4090 u otras GPU de consumo; al ser un checkpoint JAX/Orbax sin cuantizaciones publicadas, no hay una ruta oficial para GPU con menos de 24 GB.
- Opciones de despliegue: OpenPI con JAX y la configuracion `pi05_piper_four_tasks_sip`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kai0-Piper-Four-Tasks-pi05-step-30000 | no disponible | no disponible | Orbax/OCDBT | no disponible | Fine-tuning multi-tarea de π0.5 sobre 4 tareas y 400 demostraciones |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se entrena este checkpoint; no se dispone de ficha detallada en la informacion proporcionada |
| Otros checkpoints de la misma coleccion Kai0 | no disponible | no disponible | Orbax/OCDBT | no disponible | Nueve pasos del mismo run; misma arquitectura y datos, distinto paso de entrenamiento |

No se dispone de datos suficientes para comparar con alternativas de otros autores en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- No hay evaluacion en robot real ni tasa de exito publicada; el checkpoint es un paso intermedio (30.000 de 40.005 actualizaciones), no el final del entrenamiento.
- El checkpoint no incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento de forma exacta.
- Esta especializado en cuatro tareas concretas con un brazo Agilex Piper y tres camaras especificas; no es un modelo general de robotica ni de vision-lenguaje.
- Las instrucciones de tarea estan en ingles y no se documentan capacidades multilingues.
- La transformacion Agilex anula entradas fuera de `[-pi, pi]`, lo que puede descartar informacion de estado o accion en configuraciones distintas.
- El formato Orbax/OCDBT requiere preservar la estructura de directorios y todos los shards; no es compatible con `from_pretrained` de Transformers.
- Riesgo de sobreajuste a las condiciones de iluminacion, camaras y objetos de las demostraciones originales; no se documenta robustez ante variaciones.
- No se documentan sesgos, pero al ser un modelo de control fisico el riesgo principal es de fallo mecanico o colision, no de sesgo linguistico.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-30000
- Registro de entrenamiento (W&B): https://wandb.ai/bofang/finetune_pi05/runs/pwj4suby
- Dataset `putting_tennis`: https://huggingface.co/datasets/yuyingyinya/putting_tennis
- Dataset `nesting_doll`: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Dataset `fold_towel`: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Dataset `sorting_dolls`: https://huggingface.co/datasets/yuyingyinya/sorting_dolls
