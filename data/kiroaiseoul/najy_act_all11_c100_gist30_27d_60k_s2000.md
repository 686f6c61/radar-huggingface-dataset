# kiroaiseoul/NAJY_act_all11_c100_gist30_27D_60k_s2000

## Resumen

NAJY_act_all11_c100_gist30_27D_60k_s2000 es un checkpoint de politica robotica entrenado con la libreria LeRobot y etiquetado como `act` (Action Chunking Transformer). Lo publica el usuario kiroaiseoul en HuggingFace y esta pensado para el ecosistema Trossen Mobile AI, es decir, para control de manipulacion movil mediante aprendizaje por imitacion. El repositorio contiene un unico archivo `model.safetensors` de 51.700.368 parametros (0,2 GB de tamano total), con licencia apache-2.0.

El modelo no es un modelo de lenguaje: es una politica visomotora que consume un vector de estado de 27 dimensiones y tres flujos de imagen RGB de 480x640 procedentes de las camaras `cam_high`, `cam_left_wrist` y `cam_right_wrist`, y produce un vector de accion de 16 dimensiones. Su relevancia es acotada pero concreta: es un artefacto de investigacion asociado a la ejecucion `exp_all11_c100_gist30_long_s2000`, en el paso 60000, subido segun su autor para tareas de analisis y puntuacion, no como candidato cerrado a despliegue en robot real.

La model card esta escrita en coreano y es deliberadamente tecnica: incluye el hash SHA-256 de los pesos, el SHA-256 del manifiesto de datos y el commit de git del entrenamiento, ademas de un archivo `multi_manifest.json` que leen las herramientas de evaluacion. El numero de descargas (12) y de "me gusta" (0) indica que se trata de un checkpoint reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), segun la etiqueta `act` y la libreria `lerobot`. Detalle de capas, dimensiones internas y configuracion del CVAE: no disponible |
| Parametros totales | 51.700.368 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. No es un modelo de lenguaje: la entrada es un estado de 27 dimensiones mas 3 imagenes RGB de 480x640 y la salida es un vector de accion de 16 dimensiones |
| Tipos de cuantizacion | no disponible. Los pesos se publican en safetensors sin indicacion de variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Dimension de observacion de estado | 27 |
| Camaras de entrada | `observation.images.cam_high`, `observation.images.cam_left_wrist`, `observation.images.cam_right_wrist`, todas [3, 480, 640] |
| Dimension de accion | 16 |
| Paso de entrenamiento publicado | 60000 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

La etiqueta `act` y la libreria `lerobot` identifican el modelo como una Action Chunking Transformer, la arquitectura de aprendizaje por imitacion que predice bloques de acciones (chunks) en lugar de acciones individuales, combinando un codificador de observaciones con un transformador que decodifica una secuencia de acciones. La model card no detalla el numero de capas, la dimension del espacio latente del CVAE, el tamano del chunk ni la configuracion exacta del transformador, por lo que esos datos quedan como no disponibles. El identificador del nombre (`c100`, `gist30`, `27D`, `60k`, `s2000`) sigue la convencion del autor y no se explica en la model card, de modo que no se debe interpretar como especificacion confirmada.

Del entrenamiento solo consta la metadata de la ejecucion: `exp_all11_c100_gist30_long_s2000`, paso 60000, lanzamiento el 2026-10-09T15:46:40+00:00, commit de git `1e87287` y manifiesto `configs/datasets/all11_tr_hot_gist30.json` con SHA-256 `8929a4d63ce012db`. El autor indica que el entrenamiento se realizo en una maquina denominada DGX_1 y cita como contexto el documento `docs/mobile_base_investigation.md` §94 del proyecto `trossen-ai-simulation`. No se especifican el numero de episodios, el volumen de tokens o frames, la composicion del dataset ni si hubo etapas de RLHF o DPO (procedimientos, por otra parte, poco habituales en aprendizaje por imitacion). El hash del archivo de pesos es `a9bc3cbe38f16dbf57cfc7adfe81cbe1d8c822a8975a2b156bb494728dbcdcba`, dato util para verificar la integridad de la descarga.

## Capacidades

- Generacion de acciones de control de 16 dimensiones para un robot manipulador movil, a partir de estado propioceptivo y vision.
- Percepcion visual multi-camara: una camara alta (`cam_high`) y dos camaras de muneca (`cam_left_wrist`, `cam_right_wrist`) a 480x640.
- Aprendizaje por imitacion de demostraciones (behavior cloning), con salida en forma de bloques de accion.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: integracion con el ecosistema LeRobot; verificacion de integridad mediante SHA-256 publicado; lectura de flags de evaluacion desde `multi_manifest.json`.
- Modo "thinking" o vision-lenguaje: no disponible / no aplica.

## Casos de uso

- Manipulacion movil en plataforma Trossen Mobile AI: la politica consume el estado de 27 dimensiones, que en este tipo de plataformas incluye la configuracion del brazo y de la base, y emite 16 dimensiones de accion; encaja en tareas de recogida y colocacion con desplazamiento de base.
- Evaluacion comparativa de checkpoints en simulacion: el propio autor indica que la subida sirve para analisis y puntuacion, y que las herramientas de evaluacion leen los flags de `multi_manifest.json`; se puede usar como punto de comparacion frente a otros pasos del mismo entrenamiento.
- Reproduccion de rollouts y diagnostico: al conservar la estructura `pretrained_model`, el checkpoint se puede cargar directamente en scripts como `stage_cond_diag.py` para inspeccionar el comportamiento de la politica.
- Fine-tuning sobre un dominio propio: al ser un ACT de 51,7 M de parametros con licencia apache-2.0, se puede reentrenar con LeRobot sobre un dataset propio de demostraciones siempre que el layout de sensores coincida (mismo numero de camaras, misma resolucion y mismas dimensiones de estado y accion).
- Tareas bimanuales con realimentacion visual de muneca: las dos camaras de muneca permiten politicas que dependen de la posicion relativa de las pinzas respecto a los objetos, tipico en ensamblaje o en manipulacion de objetos deformables.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible para estudiar el efecto del numero de pasos de entrenamiento, dado que se publica un unico paso (60000) con hashes verificables del manifiesto de datos.
- Prototipado en laboratorio con hardware modesto: el tamano del checkpoint permite iterar en una GPU de gama media o incluso en un equipo con GPU integrada, sin necesidad de clúster.
- Auditoria de integridad en pipelines de datos: los SHA-256 publicados permiten verificar que los pesos y los datos de entrenamiento no han cambiado entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion, ni comparaciones con otras politicas. Los unicos datos verificables son de trazabilidad del entrenamiento:

| Dato de trazabilidad | Valor |
|---|---|
| Ejecucion | `exp_all11_c100_gist30_long_s2000` |
| Paso | 60000 |
| Commit de git | `1e87287` |
| Manifiesto de datos | `configs/datasets/all11_tr_hot_gist30.json` |
| SHA-256 del manifiesto | `8929a4d63ce012db` (prefijo publicado) |
| SHA-256 de `model.safetensors` | `a9bc3cbe38f16dbf57cfc7adfe81cbe1d8c822a8975a2b156bb494728dbcdcba` |
| Flags del manifiesto (primer elemento) | `{}` |

## Requisitos de hardware

- Tamano de pesos en precision completa (fp32): aproximadamente 207 MB (51.700.368 parametros x 4 bytes).
- Tamano en fp16/bf16: aproximadamente 103 MB; en int8, aproximadamente 52 MB. Calculos derivados del recuento de parametros, no medidos.
- VRAM estimada: los pesos caben en menos de 1 GB; sumando activaciones de tres imagenes de 480x640 y el resto del grafo, el consumo total es reducido. No hay mediciones publicadas de VRAM en inferencia, por lo que la cifra exacta es no disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente en la practica (por ejemplo, RTX 3060, RTX 4060, RTX 4090). No requiere A100 ni H100. Tambien es candidato natural para plataformas embebidas tipo Jetson Orin en el robot.
- Cabe en GPU consumer: si, con margen amplio dado el tamano del checkpoint.
- Opciones de despliegue: LeRobot (carga de la estructura `pretrained_model`, scripts de evaluacion y rollout), PyTorch como backend, y exportacion a ONNX si se sigue el flujo estandar de LeRobot para politicas ACT. No aplica vLLM, TGI ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. En politicas ACT la frecuencia de control depende del tamano del chunk de acciones y del hardware; no se publica ningun dato medido para este checkpoint.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables con datos verificables de parametros, contexto o rendimiento. La busqueda web realizada no devolvio resultados relacionados con robotica ni con LeRobot. La comparacion se deja, por tanto, mayoritariamente como no disponible:

| Modelo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_27D_60k_s2000 | 51.700.368 | Estado 27D + 3 imagenes RGB 480x640; salida de accion 16D | apache-2.0 | HuggingFace, 12 descargas, 0 likes |
| ACT original (Zhao et al.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| SmolVLA | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

Nota cualitativa: dentro del ecosistema LeRobot conviven varias familias de politicas de imitacion (ACT, Diffusion Policy, y modelos vision-lenguaje-accion como SmolVLA). Este checkpoint pertenece a la familia ACT y es de los mas ligeros en cuanto a recuento de parametros, lo que facilita su despliegue en hardware embebido, a costa de no disponer de comprension de lenguaje ni de generalizacion a instrucciones textuales.

## Limitaciones y advertencias

- Ausencia total de validacion publica: 12 descargas y 0 likes, sin resultados de benchmarks ni tasas de exito reportadas.
- El autor indica explicitamente que la subida es para analisis y puntuacion, y que no equivale a una decision de despliegue en hardware real. No debe tratarse como candidato confirmado de produccion.
- Dependencia estricta del layout de sensores: el modelo espera un estado de 27 dimensiones y tres camaras concretas a 480x640 con nombres fijos. Cualquier variacion de camaras, resolucion u orden de articulaciones invalida la politica.
- La dimension de accion de 16 restringe el modelo al robot concreto para el que se entreno; no es transferible directamente a otras plataformas sin reentrenamiento.
- Riesgo de sobreajuste al dataset de entrenamiento y de error acumulado (covariate shift) propio del aprendizaje por imitacion: pequenos desvios de la trayectoria demostrada pueden amplificarse a lo largo del episodio.
- Sesgos heredados del dataset de demostraciones: estilo de teleoperacion, iluminacion, texturas, posiciones de objetos y sesgos del operador. No se documenta la composicion del dataset (`all11_tr_hot_gist30.json`), por lo que estos sesgos no son auditables con la informacion publica.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el equivalente funcional de acciones plausibles y erroneas cuando la observacion queda fuera de la distribucion de entrenamiento.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero no cubre los derechos sobre los datos de entrenamiento ni sobre el diseno de hardware del robot, que el usuario debe verificar por su cuenta.
- Trazabilidad parcial: el SHA-256 del manifiesto se publica solo como prefijo (`8929a4d63ce012db`) en la tabla de la model card, lo que limita la verificacion completa del dataset.
- Documentacion en coreano y muy escueta: no hay guia de uso, hiperparametros completos ni script de evaluacion en el propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_27D_60k_s2000
- Documento citado por el autor: `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94 (referenciado en la model card, sin URL publica en la informacion disponible)
- Libreria de entrenamiento e inferencia: LeRobot (https://github.com/huggingface/lerobot)
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente contenidos no relacionados (musica y cotizaciones de plata).
