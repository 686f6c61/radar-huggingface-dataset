# dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-35000

## Resumen
Kai0 Piper Four-Tasks π0.5 step 35000 es un checkpoint de inferencia derivado de un ajuste fino completo del modelo base `pi05_base` de Physical Intelligence, orientado a control roboticos de tipo vision-language-action (VLA). Lo publica el usuario dddddsds31341 dentro del ecosistema Kai0/OpenPI y se distribuye en formato JAX/Orbax, no como un modelo de Transformers. El checkpoint corresponde al paso 35.000 de un total de 40.005 actualizaciones de un unico entrenamiento conjunto sobre cuatro tareas de manipulacion.

El modelo resuelve el problema de generar acciones motoras de horizonte largo (50 pasos) a partir de observaciones visuales y una instruccion en lenguaje natural, para un robot Piper de Agilex con tres camaras (`top_head`, `hand_left`, `hand_right`). Se entrena sobre 400 demostraciones y 569.842 fotogramas repartidos en cuatro tareas: anidar munecas rusas, doblar una toalla, ordenar munecas y colocar pelotas de tenis en una cesta.

Es relevante porque ejemplifica el flujo actual de fine-tuning de VLA sobre `pi0.5` con FSDP en dos A100 de 80 GB, normalizacion por cuantiles compartida entre tareas y acciones absolutas de 14 dimensiones. El repositorio pesa 12,5 GB e incluye parametros EMA, estadisticas de normalizacion, configuracion de entrenamiento y el codigo SIP Kai0 necesario para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `pi05_base` de Physical Intelligence; implementacion JAX/OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint Orbax/OCDBT en precision de entrenamiento) |
| Idiomas soportados | no disponibles (las instrucciones de tarea estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax/OCDBT (JAX), directorio `params/` con shards y metadatos; no es safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo parte de los pesos `pi05_base` y se ajusta de forma completa (full fine-tuning) en JAX con FSDP sobre dos A100 de 80 GB, con batch global de 64 (32 ejemplos por GPU) y sin acumulacion de gradientes. El entrenamiento cubre 40.005 actualizaciones finalizadas el 2 de noviembre de 2026 a las 14:06 hora de Singapur, con semilla 42 y decaimiento EMA de 0,99. El checkpoint publicado contiene los parametros EMA de inferencia y los assets de normalizacion, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

Los datos son 400 demostraciones (100 por tarea) y 569.842 fotogramas mezclados globalmente, de modo que el muestreo es proporcional al numero de fotogramas de cada tarea. Se usa normalizacion por cuantiles compartida entre las cuatro tareas (`effective_use_quantile_norm=True`) con el fichero `assets/piper_four_tasks/norm_stats.json`. Las acciones son objetivos absolutos de 14 dimensiones (articulaciones y pinza), con horizonte de 50 y relleno interno hasta 32 dimensiones; no es un checkpoint de acciones delta. La transformacion original de Kai0 Agilex pone a cero las entradas de estado y accion fuera de `[-pi, pi]`, y el codigo incluido define el preprocesado exacto.

## Capacidades
- Generacion de acciones motoras de horizonte 50 para un robot Piper de Agilex a partir de observaciones de tres camaras y una instruccion textual.
- Ejecucion de cuatro tareas de manipulacion: `nesting_doll`, `fold_towel`, `sorting_dolls` y `putting_tennis`.
- Comprension de instrucciones en lenguaje natural en ingles para seleccionar la tarea y guiar la politica.
- Control bimanual con etiquetas de estado y accion de 14 dimensiones, incluyendo pinzas.
- Multitarea en un unico conjunto de pesos, con normalizacion compartida entre tareas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explicito.
- No se documentan capacidades de vision general, audio ni generacion de texto libre.

## Casos de uso
- Automatizacion de picking y placing en laboratorio: colocar pelotas de tenis en una cesta una a una usando la tarea `putting_tennis`, aprovechando el horizonte de 50 pasos para planificar la aproximacion y el agarre.
- Manipulacion de precision con objetos apilables: anidar munecas rusas de menor a mayor con la tarea `nesting_doll`, util para validar politicas que requieren alineacion fina y secuenciacion.
- Tareas de deformacion de tejidos: doblar una toalla en tres direcciones con `fold_towel`, un escenario clasico para evaluar control bimanual coordinado.
- Ordenacion y clasificacion fisica: alinear cinco munecas rusas de menor a mayor con `sorting_dolls`, aplicable a lineas de montaje o clasificacion de piezas.
- Investigacion en VLA: servir como punto de partida para comparar estrategias de normalizacion compartida, acciones absolutas frente a delta y ajuste completo frente a LoRA sobre `pi0.5`.
- Reproduccion de experimentos: el repositorio incluye `training_config.json`, `task_prompts.json`, `source_versions.json` y `code.zip`, lo que permite replicar el pipeline SIP Kai0 con las versiones de entorno registradas.
- Evaluacion de robustez multitarea: al compartir pesos entre cuatro tareas con prompts distintos, permite estudiar interferencia entre tareas y sensibilidad al prompt.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en robot ni evaluacion en conjunto reservado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 12,5 GB, por lo que se necesita al menos ese espacio en disco y una GPU con memoria suficiente para cargar todos los shards de parametros y los assets.
- GPU de entrenamiento registradas: dos A100 de 80 GB con FSDP.
- GPU recomendadas para inferencia: A100 80 GB o H100; no se documenta compatibilidad con GPUs de consumo.
- No hay datos que confirmen que quepa en RTX 4090 u otras GPU consumer.
- Despliegue: carga mediante OpenPI con `policy_config.create_trained_policy(config.get_config("pi05_piper_four_tasks_sip"), "/ruta/al/checkpoint")`; no es compatible con `from_pretrained` de Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kai0 Piper Four-Tasks π0.5 step 35000 | no disponible | horizonte de accion 50 | no disponible | Orbax/OCDBT (JAX) | Hugging Face, 0 descargas |
| `pi05_base` (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | modelo base referenciado, no detallado aqui |
| Otros checkpoints de la misma coleccion Kai0 | no disponible | horizonte de accion 50 | no disponible | Orbax/OCDBT (JAX) | misma cuenta, mismos datos de entrenamiento |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias
- No se declara tasa de exito ni evaluacion held-out; el rendimiento real en robot no esta verificado.
- El checkpoint contiene solo parametros EMA y assets de normalizacion, sin estado del optimizador: no permite reanudar el entrenamiento exacto.
- Esta especializado en cuatro tareas concretas y en el robot Piper de Agilex; no es un modelo generalista.
- Requiere el preprocesado exacto de Kai0 (recorte a `[-pi, pi]`, convenciones de camara, estado, accion y pinza); un uso incorrecto invalida las predicciones.
- Las instrucciones de tarea estan en ingles y deben pasarse con cada observacion.
- Licencia no disponible: no hay autorizacion explicita para uso comercial.
- Sesgos, alucinacion y limitaciones idiomaticas no documentados.
- Dependencia de versiones concretas de entorno registradas en `source_versions.json` y `requirements-sip.txt`.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-35000
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/bofang/finetune_pi05/runs/pwj4suby
- Dataset `yuyingyinya/putting_tennis`: https://huggingface.co/datasets/yuyingyinya/putting_tennis
- Dataset `yuyingyinya/nesting_doll`: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Dataset `yuyingyinya/fold_towel`: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Dataset `yuyingyinya/sorting_dolls`: https://huggingface.co/datasets/yuyingyinya/sorting_dolls
