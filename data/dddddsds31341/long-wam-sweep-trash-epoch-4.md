# dddddsds31341/Long-WAM-Sweep-Trash-Epoch-4

## Resumen

Long-WAM-Sweep-Trash-Epoch-4 es un checkpoint de evaluacion derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, un modelo de robotica bimanual (vision-lenguaje-accion) desarrollado por Efficient Large Model. Este checkpoint concreto es un fine-tune independiente realizado por el usuario dddddsds31341 sobre el dataset yuyingyinya/sweep_trash, orientado a una unica tarea manipulativa: sostener la pala con un gripper y barrer dos trozos de papel arrugado con el otro.

El modelo se publica como pesos de evaluacion correspondientes a la epoca 4 de 5 (paso de optimizador 4044) de un entrenamiento supervisado sobre 100 demostraciones y 48.495 fotogramas a 30 Hz. Emplea tres camaras RGB (top_head, hand_left, hand_right), un layout de video procesado de 384x320, historial P48 y chunks de accion de 32 pasos, con objetivos de articulacion absolutos de 14 dimensiones.

Su relevancia es acotada y practica: sirve como referencia reproducible para investigacion en imitation learning bimanual y para validar pipelines de inferencia sobre el ecosistema Long-WAM. No es un modelo de proposito general ni un checkpoint listo para produccion: el propio autor advierte que no se reporta tasa de exito en bucle cerrado ni validacion held-out, y que la perdida de entrenamiento no es una metrica de exito robotico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto video/accion (Long-WAM) con encoder de propiocepcion; no disponible el detalle interno de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de video P48 y chunk de accion de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos en BF16 durante entrenamiento; dtype almacenado segun config) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto general) |
| Licencia | other (ver metadatos de licencia del modelo base) |
| Formato de pesos | model.pt (PyTorch), config.yaml, dataset_stats.json, code.zip, requirements-sip.txt |
| Tamano del repositorio | 12,0 GB |
| Entrada sensorial | 3 camaras RGB: top_head, hand_left, hand_right; layout 384x320 |
| Dimension de accion | 14D absoluta (izquierda 6 articulaciones + gripper, derecha 6 articulaciones + gripper) |
| Dataset de entrenamiento | yuyingyinya/sweep_trash, revision 0dd5ff1f576de17dcf06b49d352e0f125a1f43e6 |
| Epoca / paso | Epoca 4 de 5, paso de optimizador 4044 |

## Arquitectura y entrenamiento

El modelo se basa en Long-WAM-YAM, un modelo conjunto de video y accion con encoder de propiocepcion. La inferencia se realiza a traves del checkout de Long-WAM incluido en code.zip (release SIP v22, basada en NVlabs/LongLive en el commit cfa4e91eec59429d583326500bf5535c9ce6eec7 con los cambios SIP). El pipeline requiere assets externos: VAE de Wan2.2, encoder de texto UMT5 y tokenizer, que no se incluyen en el repositorio.

El entrenamiento se ejecuto sobre 100 demostraciones (48.495 fotogramas a 30 Hz), usando todas ellas para entrenamiento. Se emplearon cuatro GPUs con batch size 12 por GPU y acumulacion de gradiente 1 (batch global 48), tasa de aprendizaje constante de 1e-5, AdamW con weight decay 0.01, BF16 y DeepSpeed ZeRO-1. Cada epoca comprende 1.011 actualizaciones de optimizador y el run completo apunta a 5.055 actualizaciones. Los objetivos son articulaciones absolutas de 14 dimensiones en unidades originales del gripper, con estadisticas z-score especificas de la tarea y recorte oficial de valores normalizados en [-5, 5]. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de acciones motoras bimanuales de 14 dimensiones a partir de observaciones visuales de tres camaras y del estado de propiocepcion.
- Ejecucion de una tarea manipulativa concreta: agarrar y sostener la pala con un gripper mientras el otro barre dos trozos de papel arrugado hacia la pala.
- Procesamiento de historial de video con P48 y prediccion de chunks de accion de 32 pasos.
- Acondicionamiento por instruccion de tarea en lenguaje natural (la instruccion de la model card) mediante el encoder de texto UMT5.
- Integracion con adaptadores de robot que respeten las convenciones 14D de accion y gripper.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en imitation learning bimanual: el checkpoint sirve como referencia reproducible de un fine-tune de tarea unica para comparar metodologias de entrenamiento sobre el mismo dataset y configuracion.
- Validacion de pipelines de inferencia Long-WAM: permite comprobar la carga con `longwam.inference.load_run_config` y `load_model` con `expected_step=4044` y `strict=True`, verificando la coherencia de configuracion y estadisticas de normalizacion.
- Reproduccion de experimentos: al incluir config.yaml, dataset_stats.json y code.zip con la release SIP v22, facilita replicar el preprocesado (layout 384x320, P48, chunk de 32) y la desnormalizacion de acciones.
- Benchmark interno de tareas de barrido: util como punto de partida para medir tasas de exito en bucle cerrado con un adaptador de robot compatible, aunque el propio autor no reporta dicha metrica.
- Desarrollo de adaptadores de robot: sirve para probar la integracion de convenciones 14D (6 articulaciones + gripper por brazo) en stacks de control reales.
- Docencia y formacion: ejemplo practico de fine-tune de un modelo vision-lenguaje-accion sobre un dataset pequeno (100 demostraciones) con infraestructura multi-GPU y DeepSpeed ZeRO-1.
- Auditoria de checkpoints de evaluacion: util para estudiar que informacion contiene un checkpoint eval-only (sin estado de optimizador ni scheduler) y sus implicaciones para continuar entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reporta tasa de exito en bucle cerrado ni resultado de validacion held-out, y que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,0 GB y el entrenamiento uso BF16, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible de forma explicita; el entrenamiento se realizo en cuatro GPUs con DeepSpeed ZeRO-1, lo que sugiere hardware de clase数据中心 (A100/H100 o similar), aunque no se confirma el modelo exacto.
- Cabe en GPU de consumo: no disponible; el tamano del repositorio (12,0 GB) y la necesidad de cargar ademas el VAE de Wan2.2 y el encoder UMT5 hacen probable que no quepa en GPUs de consumo de gama baja, pero no hay dato confirmado.
- Opciones de despliegue: el modelo no es un `from_pretrained` estandar de Transformers. Requiere el checkout de Long-WAM incluido en code.zip, con `longwam.inference.load_run_config` y `load_model`, y la variable `LONGWAM_MODEL_ROOT` para rutas de assets. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: VAE de Wan2.2, encoder de texto UMT5 y tokenizer deben obtenerse por separado; adaptador de robot compatible con las convenciones 14D.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de robotica bimanual que permitan una comparacion rigurosa. El unico modelo relacionado mencionado es el base Efficient-Large-Model/Long-WAM-YAM, del que este checkpoint es un fine-tune, sin que se detallen sus metricas.

## Limitaciones y advertencias

- No se reporta tasa de exito en bucle cerrado ni validacion held-out; el checkpoint solo ha superado comprobaciones de carga de ficheros en CPU.
- La perdida de entrenamiento no es una metrica valida de exito en la tarea robotica.
- El fichero eval-only no contiene estado de optimizador ni scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- La configuracion de entrenamiento conserva rutas de sistema de ficheros SIP originales; en otra maquina es necesario ajustar `LONGWAM_MODEL_ROOT` y las rutas de datos, estadisticas y cache.
- Requiere assets externos (VAE de Wan2.2, encoder UMT5, tokenizer) y un adaptador de robot compatible con las convenciones 14D; no es un modelo autonomo.
- El modelo esta especializado en una unica tarea (barrido bimanual) y no debe extrapolarse a otras tareas manipulativas sin un fine-tune especifico.
- La licencia es "other"; deben consultarse los metadatos de licencia del modelo base para determinar las restricciones de uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no es de texto general; no obstante, la generalizacion fuera de la distribucion de las 100 demostraciones es incierta.
- El dataset de entrenamiento es pequeno (100 demostraciones), lo que limita la robustez ante variaciones de iluminacion, posicion de objetos o morfologia del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sweep-Trash-Epoch-4
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Dataset: https://huggingface.co/datasets/yuyingyinya/sweep_trash
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/bofang/long-wam/runs/nwa2ucgt
- Repositorio base de referencia: https://github.com/NVlabs/LongLive (commit cfa4e91eec59429d583326500bf5535c9ce6eec7)
