# dddddsds31341/Long-WAM-Wash-Cup-Epoch-7

## Resumen

Long-WAM Wash Cup — Epoch 7 es un checkpoint de pesos de evaluacion derivado del modelo base `Efficient-Large-Model/Long-WAM-YAM`, publicado por el usuario `dddddsds31341`. Se trata de un ajuste fino (finetune) independiente sobre la tarea robotica concreta de lavar un vaso, entrenado sobre el dataset `yuyingyinya/wash_cup`. El modelo pertenece a la familia Long-WAM, orientada a la manipulacion robotica bimanual con entrada visual multi-camara y salida de acciones en el espacio de articulaciones.

El checkpoint corresponde a la epoca 7 de 10 (paso de optimizador 10171) de un entrenamiento que no continua desde otro finetune de tarea, sino directamente desde el modelo base. El repositorio ocupa 12,0 GB e incluye el modelo conjunto de video y accion (`model.pt`), la configuracion resuelta, las estadisticas de normalizacion especificas de la tarea y el codigo de entrenamiento empaquetado.

Es relevante como ejemplo de despliegue de modelos de politica robotica (vision-language-action de tipo video/accion) ajustados a tareas de manipulacion bimanual concretas, con convenciones de accion de 14 dimensiones y multiples camaras RGB. No es un modelo de lenguaje al uso: no genera texto libre ni responde a prompts conversacionales, sino que produce trozos de accion (action chunks) de 32 pasos a partir de observaciones visuales y de propiocepcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo conjunto de video y accion (joint video/action model) con codificador de propiocepcion; familia Long-WAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (historial P48: 48 pasos de historial) |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch), no es un modelo `from_pretrained` de Transformers |
| Tamano del repositorio | 12,0 GB |
| Modelo base | `Efficient-Large-Model/Long-WAM-YAM` (relacion: finetune) |
| Dataset de entrenamiento | `yuyingyinya/wash_cup` (revision `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`) |
| Epoca / paso | Epoca 7 de 10, paso de optimizador 10171 |
| Camaras de entrada | `top_head`, `hand_left`, `hand_right` (RGB) |
| Resolucion de video procesado | 384×320, P48 de historial, action chunk de 32 pasos |
| Dimension de accion | 14D (6 articulaciones izquierdas + gripper, 6 derechas + gripper) |
| Frecuencia de datos | 30 Hz |

## Arquitectura y entrenamiento

El modelo es un modelo conjunto de video y accion, con un codificador de propiocepcion separado, integrado en la familia Long-WAM. La entrada combina tres camaras RGB (`top_head`, `hand_left`, `hand_right`) procesadas a 384×320, con un historial de 48 pasos (P48), y la salida es un action chunk de 32 pasos. Las acciones se representan como objetivos de articulacion absolutos de 14 dimensiones con las unidades originales del gripper, ordenadas como 6 articulaciones izquierdas + gripper y 6 articulaciones derechas + gripper. La inferencia se realiza mediante las utilidades `longwam.inference.load_run_config` y `load_model`, con `expected_step=10171` y `strict=True`.

El entrenamiento se realizo sobre el dataset `yuyingyinya/wash_cup`, con 100 demostraciones y 69.728 fotogramas a 30 Hz, usando todas las demostraciones para entrenamiento. Se emplearon cuatro GPUs con batch size 12 por GPU, acumulacion de gradiente 1 y batch global 48. El optimizador fue AdamW con learning rate constante de `1e-5` y weight decay 0,01, en precision BF16 y con DeepSpeed ZeRO-1. Se realizaron 1453 actualizaciones de optimizador por epoca, con un objetivo total de 14.530 actualizaciones. Se aplicaron estadisticas z-score especificas de la tarea y el recorte oficial de valores normalizados en `[-5, 5]`. El codigo de entrenamiento corresponde a una version SIP v29 basada en `NVlabs/LongLive@cfa4e91eec59429d583326500bf5535c9ce6eec7` con los cambios SIP incluidos.

## Capacidades

- Generacion de acciones roboticas bimanuales: produce objetivos de articulacion de 14 dimensiones para controlar dos brazos con gripper.
- Percepcion visual multi-camara: consume tres flujos RGB (`top_head`, `hand_left`, `hand_right`) a 384×320.
- Razonamiento temporal con historial: usa un historial de 48 pasos (P48) para condicionar la prediccion.
- Prediccion por chunks: emite action chunks de 32 pasos en lugar de acciones individuales.
- Ejecucion de una tarea especifica: sostener y levantar un vaso con un gripper mientras el otro limpia su interior con un cepillo, devolver el cepillo y colocar el vaso boca abajo en el escurridor.
- Integracion de propiocepcion: incluye un codificador de propiocepcion junto al modelo conjunto de video y accion.
- No se documentan capacidades de generacion de texto, tool calling, agentes, multilingue, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de politicas bimanuales en laboratorio: el checkpoint sirve como punto de control de la epoca 7 para medir el progreso del ajuste fino en la tarea de lavado de vaso, comparando con otras epocas del mismo run.
- Investigacion en manipulacion bimanual: permite estudiar como un modelo conjunto de video y accion coordina dos brazos con tareas asimetricas (uno sujeta, otro limpia).
- Reproduccion de experimentos: al incluir `config.yaml`, `dataset_stats.json`, `code.zip` y `requirements-sip.txt`, facilita reproducir el entrenamiento y la evaluacion en una maquina distinta.
- Desarrollo de pipelines de robotica con multiples camaras: sirve de referencia para integrar entradas de `top_head`, `hand_left` y `hand_right` en un sistema de control.
- Pruebas de convenciones de accion y normalizacion: util para validar el uso de acciones 14D absolutas con unidades originales de gripper y el recorte `[-5, 5]`.
- Base para ajustes finos posteriores en tareas relacionadas: al ser un finetune independiente sobre el modelo base, puede emplearse como punto de partida para otras tareas de manipulacion con cepillo, vaso o escurridor.
- Validacion de carga y despliegue: el checkpoint ha superado comprobaciones de carga de ficheros en CPU, por lo que puede usarse para verificar la integracion del codigo de inferencia antes de pruebas en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta tasa de exito en robot en bucle cerrado ni resultado de validacion en conjunto reservado, y que la perdida de entrenamiento no es una metrica de exito de la tarea robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,0 GB y los pesos se almacenan en BF16, por lo que se requiere al menos ese orden de magnitud de memoria, aunque no se especifica una cifra oficial.
- GPU recomendadas: no disponible; el entrenamiento se realizo en cuatro GPUs, sin especificar el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se soporta `from_pretrained` de Transformers. El despliegue requiere extraer `code.zip`, instalar el checkout de Long-WAM incluido y usar `longwam.inference.load_run_config` y `load_model` con la ruta explicita a `model.pt`. Se necesitan por separado los assets del VAE de Wan2.2, el codificador de texto UMT5 y el tokenizador. La raiz de assets del modelo se configura con `LONGWAM_MODEL_ROOT`.
- Latencia y throughput: no disponible.
- Adaptador de robot: se requiere un adaptador de robot compatible y respetar las convenciones originales de accion 14D y unidades de gripper.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada solo aparecen otros checkpoints del mismo autor y misma familia (`dddddsds31341/Long-WAM-Wash-Cup-Epoch-5` y `dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1`), que son variantes del mismo entrenamiento o de otra tarea, no alternativas comparables de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo autonomo de Transformers: no se puede cargar con `from_pretrained`; requiere el codigo Long-WAM y assets externos (VAE de Wan2.2, UMT5, tokenizador).
- No se reporta tasa de exito en robot en bucle cerrado ni validacion en conjunto reservado; el rendimiento real en la tarea no esta verificado publicamente.
- La perdida de entrenamiento no debe interpretarse como metrica de exito de la tarea robotica.
- Es un checkpoint de solo evaluacion: no incluye estado de optimizador ni scheduler, por lo que no permite continuar el entrenamiento de forma exacta.
- La configuracion original conserva rutas de sistema de ficheros SIP; en otra maquina hay que reconfigurar rutas de datos, estadisticas y cache.
- Las estadisticas de normalizacion (`dataset_stats.json`) son especificas de esta tarea y deben usarse para el preprocesado y la desnormalizacion de acciones.
- Requiere respetar las convenciones originales de accion 14D y unidades de gripper, y un adaptador de robot compatible.
- Licencia `other`: no se detallan los terminos; debe consultarse la licencia del modelo base `Efficient-Large-Model/Long-WAM-YAM` antes de cualquier uso comercial.
- Solo se ha verificado la carga de ficheros en CPU; no hay garantias documentadas de funcionamiento en hardware de robot concreto.
- Sesgos conocidos y riesgo de alucinacion: no disponibles en la informacion proporcionada, aunque al tratarse de un modelo de politica robotica el riesgo relevante es el fallo de ejecucion fisica, no la alucinacion textual.
- Idiomas soportados: no disponibles; no se documenta procesamiento de lenguaje natural multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-7
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (epoca 5): https://huggingface.co/dddddsds31341/Long-WAM-Wash-Cup-Epoch-5
- Checkpoint relacionado (Nesting Doll, epoca 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Registro de entrenamiento en W&B: https://forge.coreweave.com/wandb/bofang/long-wam/runs/3n9pgoq2
- Repositorio base del codigo: https://github.com/NVlabs/LongLive (commit `cfa4e91eec59429d583326500bf5535c9ce6eec7`)
- Dataset de entrenamiento: `yuyingyinya/wash_cup` (revision `dcf90aa38d98e9b6c9f71afe0cfeeb3f50ed74cb`)
