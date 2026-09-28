# HanLinqi/GR00T-N1.7-ForceBenchmark-Force8-PickCubeV4-Obs2-H10-30K-20260928

## Resumen

GR00T N1.7 ForceBenchmark es un repositorio de fine-tuning del modelo fundacional de robotica NVIDIA GR00T-N1.7-3B, publicado por el usuario HanLinqi. No se trata de un unico modelo, sino de un conjunto de diez directorios de checkpoint independientes (todos `checkpoint-30000`) que exploran la incorporacion de informacion de fuerza en tareas de manipulacion robotica. Ocho de ellos anaden una senal de fuerza (force token) mediante un codificador MLP, mientras que los dos restantes experimentan con la ausencia de fuerza y con una variante MoE que emplea un codificador Transformer temporal.

El modelo base, GR00T-N1.7-3B, es un modelo vision-lenguaje-accion (VLA) de aproximadamente 3.000 millones de parametros orientado a robots, y estos checkpoints lo adaptan a tareas concretas como PickCube, PegInsertion, LiftCanUpright, USBInsertion, WhiteboardErasing, VaseErasing y WeightSorting, entre otras. La relevancia actual radica en que explora como integrar la retroalimentacion de fuerza (historial de wrench de seis ejes) en un VLA, un aspecto poco cubierto por los modelos fundacionales de manipulacion, que tradicionalmente dependen solo de vision y estado de articulaciones.

Cada checkpoint se entreno durante 30.000 pasos con dos observaciones (imagen y estado de articulaciones), horizonte de accion 10 y tamano de batch global 32. El autor indica de forma explicita que estas ejecuciones de entrenamiento no incluyeron evaluacion y que no se declara ninguna tasa de exito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de GR00T-N1.7-3B (modelo vision-lenguaje-accion); variantes con codificador de fuerza MLP o Transformer temporal con mezcla de expertos (MoE) |
| Parametros totales | Aproximadamente 3.000 millones (heredados del modelo base GR00T-N1.7-3B) |
| Parametros activos | No es un MoE completo; la variante PickCube V4 `moe_transformer` usa 4 expertos con enrutamiento top-1 (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato safetensors) |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas, no a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio parte del modelo base GR00T-N1.7-3B y contiene diez checkpoints independientes, cada uno entrenado 30.000 pasos con dos observaciones (imagen y estado de articulaciones), un horizonte de accion de 10 y un batch global de 32. Los ocho checkpoints con fuerza incorporan un historial de wrench de seis ejes de cuatro fotogramas, un codificador de fuerza tipo MLP y un unico token de condicionamiento de fuerza. Las tareas cubiertas son LiftCanUpright v3, Stamp Planning v1, PegInsertion v7, PickCube v2, WhiteboardErasing v9, USBInsertion Planning v4, VaseErasing Planning v6 y WeightSorting v1; todas usan datasets de tipo planning salvo PickCube v2, que usa datos de reinforcement learning (RL).

Los dos checkpoints de PickCube Occluded Contact v4 (10 cm) comparten los campos publicados `action_loss_mask` y `recovery_sample_weight`. La variante `noforce` no incluye token de fuerza. La variante `moe_transformer` emplea un historial de wrench de seis fotogramas, un codificador de fuerza basado en Transformer temporal, un token de fuerza, cuatro expertos y enrutamiento top-1. Los datos de PickCube V4 proceden del dataset `HanLinqi/ForceBenchmark`, revision de datos `3b4d58e36b2aea70c4ecf1f964f4620dcf7a5dbf`. Cada directorio conserva la configuracion original del checkpoint, el procesador, las estadisticas de normalizacion, los ficheros del tokenizer y los safetensors. El autor no documenta el uso de RLHF ni DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de politicas de manipulacion robotica (modelo vision-lenguaje-accion): produce secuencias de acciones con horizonte 10 a partir de observaciones visuales y estado de articulaciones.
- Condicionamiento por fuerza: ocho checkpoints integran un historial de wrench de seis ejes como senal adicional, con un token de condicion dedicado.
- Manipulacion de precision con contacto: tareas como PegInsertion v7, USBInsertion Planning v4 y PickCube Occluded Contact v4 estan orientadas a insercion y contacto con oclusion.
- Multiples tareas especializadas: manipulacion, apilado, borrado de superficies (WhiteboardErasing v9, VaseErasing v6), clasificacion por peso (WeightSorting v1) y PickCube.
- Comparacion de arquitecturas de condicionamiento de fuerza: permite contrastar un codificador MLP frente a un codificador Transformer temporal con MoE, y frente a la variante sin fuerza.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues o de generacion de texto: no disponible.
- Capacidades especiales adicionales (vision, audio, thinking mode): la unica modalidad documentada es la combinacion de imagen y estado de articulaciones con senal de fuerza.

## Casos de uso

- Investigacion academica en manipulacion condicionada por fuerza: el repositorio permite reproducir y comparar el efecto de incorporar un historial de wrench de seis ejes en un VLA, usando los ocho checkpoints con fuerza como base de estudio.
- Insercion de precision en linea de montaje: los checkpoints PegInsertion v7 y USBInsertion Planning v4 estan disenados para insertar piezas con ajuste fino, donde la senal de fuerza ayuda a detectar contacto y corregir la trayectoria.
- Manipulacion de objetos con contacto ocluido: PickCube Occluded Contact v4 (10 cm) aborda el caso en que la pieza queda parcialmente oculta, apoyandose en la fuerza para estimar la posicion real.
- Clasificacion y ordenacion de piezas por peso: WeightSorting v1 puede emplearse para separar objetos segun su peso estimado durante la manipulacion, con aplicaciones en logistica y reciclaje.
- Tareas de borrado y limpieza de superficies: WhiteboardErasing v9 y VaseErasing v6 cubren operaciones de contacto continuo sobre superficies, utiles en robots de mantenimiento.
- Colocacion de objetos en posicion vertical: LiftCanUpright v3 sirve para levantar y enderezar recipientes, una primitiva frecuente en tareas de picking industrial.
- Benchmark interno de arquitecturas: la pareja `pickcube_v4/noforce` frente a `pickcube_v4/moe_transformer` permite medir en un mismo entorno el impacto del codificador de fuerza basado en Transformer con MoE.
- Base para fine-tuning posterior: cualquiera de los diez checkpoints puede reutilizarse como punto de partida para nuevas tareas, dado que cada directorio conserva procesador, tokenizer y estadisticas de normalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que las ejecuciones de entrenamiento no incluyeron evaluacion y que no se declara ninguna tasa de exito.

## Requisitos de hardware

- El modelo base tiene aproximadamente 3.000 millones de parametros; en precision bf16 los pesos ocupan del orden de 6-7 GB (estimacion derivada del tamano, no confirmada por el autor).
- El repositorio completo ocupa 69,5 GB, ya que contiene diez checkpoints; cada checkpoint individual ronda los 7 GB (69,5 GB / 10, estimacion).
- Inferencia en GPU de consumo: una RTX 4090 (24 GB) o similar deberia ser suficiente para cargar un unico checkpoint en bf16, segun la estimacion de tamano anterior; no confirmado por el autor.
- GPU profesionales recomendadas por el autor: no disponible.
- Opciones de despliegue: no disponible de forma explicita. Los pesos se distribuyen en safetensors, y el autor indica que los modelos con fuerza requieren la implementacion especifica del GR00T de ForceBenchmark.
- Metodo de descarga indicado por el autor: `huggingface_hub.snapshot_download` fijando `allow_patterns` al directorio deseado mas `/*`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 ForceBenchmark (este repositorio) | ~3.000 millones (base) | no disponible | Sin evaluacion publicada | no disponible | HuggingFace |
| NVIDIA GR00T-N1.7-3B (modelo base) | ~3.000 millones | no disponible | no disponible | no disponible | HuggingFace |
| Otros VLA de manipulacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se ha identificado como comparable directo el modelo base del que deriva. No se dispone de informacion sobre otros modelos de la misma categoria en el material proporcionado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor confirma que no se realizo evaluacion y que no se declara tasa de exito, por lo que no se puede afirmar el rendimiento real de ningun checkpoint.
- Licencia no disponible: al no especificarse licencia, no queda claro si se permite el uso comercial; conviene verificar la licencia del modelo base y del dataset antes de cualquier despliegue productivo.
- Dependencia de implementacion propia: los checkpoints con fuerza requieren la implementacion GR00T especifica de ForceBenchmark, lo que limita su uso directo con otras herramientas estandar.
- Riesgo de sobreajuste: cada checkpoint es un fine-tune especializado en una unica tarea y un unico dataset, sin capacidad multi-tarea demostrada.
- Idiomas y contexto no documentados: no hay informacion sobre ventana de contexto ni sobre soporte de lenguaje natural.
- Sin cuantizaciones oficiales: no se publican variantes GGUF ni cuantizaciones, lo que dificulta el despliegue en hardware con VRAM reducida.
- Tamano del repositorio: 69,5 GB obligan a descargar selectivamente los checkpoints de interes mediante `allow_patterns`.
- Riesgo de alucinacion o de politicas incorrectas: no evaluado; en robotica, una politica fallida puede provocar colisiones o danos fisicos, por lo que se recomienda validacion en simulacion antes de uso real.
- Tarea RL minoritaria: solo PickCube v2 usa datos de RL, mientras que el resto usa datos de planning, lo que puede introducir diferencias de comportamiento entre checkpoints.
- Distribucion estadistica de los datos: las estadisticas de normalizacion y `action_loss_mask` estan fijadas al dataset de entrenamiento, lo que reduce la generalizacion a entornos distintos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HanLinqi/GR00T-N1.7-ForceBenchmark-Force8-PickCubeV4-Obs2-H10-30K-20260928
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de PickCube V4: https://huggingface.co/datasets/HanLinqi/ForceBenchmark (referencia `HanLinqi/ForceBenchmark`, revision `3b4d58e36b2aea70c4ecf1f964f4620dcf7a5dbf`)
