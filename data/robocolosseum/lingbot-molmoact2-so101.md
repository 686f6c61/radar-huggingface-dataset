# RoboColosseum/LingBot-MolmoAct2-So101

## Resumen

LingBot-MolmoAct2-So101 es un modelo de vision-lenguaje-accion (VLA) publicado por el usuario RoboColosseum en HuggingFace. Se trata de un ajuste fino completo del modelo base robbyant/lingbot-vla-v2-6b, que combina un backbone de vision-lenguaje Qwen3-VL con un "action expert" de tipo MoE. El modelo resultante tiene 6.375.907.511 parametros y su objetivo es transformar observaciones visuales e instrucciones en lenguaje natural en secuencias de acciones motoras para brazos roboticos SO100/SO101.

El modelo resuelve el problema clasico de las politicas roboticas: convertir entrada multimodal (hasta tres vistas de camara mas una instruccion textual) en comandos de articulacion. En concreto, emite chunks de accion de longitud 50 con objetivos articulares absolutos de seis dimensiones (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll y gripper), mapeados sobre una representacion de 55 dimensiones.

Es relevante ahora porque ejemplifica la tendencia de adaptar VLMs grandes a control robotico mediante ajuste fino completo y optimizadores modernos como Muon, en lugar de LoRA. No obstante, conviene tener presente que el checkpoint subido corresponde al paso 90.000 de un objetivo configurado de 200.000 pasos: es un snapshot intermedio, no un modelo final validado. No se declara licencia y no se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre Qwen3-VL con action expert/MoE |
| Parametros totales | 6.375.907.511 |
| Parametros activos | no disponible (la arquitectura incorpora un action expert de tipo MoE, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en FP32 (safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32, seis shards) + model.safetensors.index.json |
| Tamano del payload tensorial | 25.503.630.044 bytes (aproximadamente 23,75 GiB) |
| Tamano del repositorio | 25,5 GB (directorio de exportacion de HF aproximadamente 23,77 GiB) |
| Pipeline declarado | robotics |
| Modelo base | robbyant/lingbot-vla-v2-6b (relacion: finetune) |
| Espacio de acciones | 6 dimensiones brutas mapeadas a indices [0,1,2,3,4,28] sobre 55 dimensiones |
| Horizonte de accion | chunk de 50 acciones |

## Arquitectura y entrenamiento

La arquitectura hereda el diseno de LingBot VLA v2: un VLM basado en Qwen3-VL que actua como codificador de vision y lenguaje, acoplado a un action expert de tipo Mixture of Experts que genera las acciones. El ajuste realizado conserva los nombres y las formas de los parametros del modelo base, pero modifica el preprocesado de camaras y el ensamblado de caracteristicas de camaras validas. Se admiten hasta tres vistas por muestra, seleccionadas aleatoriamente de un conjunto de cuatro y emparejadas entre el frame actual y el futuro; los slots de camara ausentes se eliminan antes de la codificacion visual. Las instrucciones de episodio externas se utilizan cuando estan disponibles y, en caso contrario, las tareas originales; el texto se normaliza (minusculas, sin espacios sobrantes y sin los caracteres finales `.?!`).

El entrenamiento consistio en un ajuste fino completo sobre 8 GPUs usando la ruta `fsdp2` (`module_fsdp_enable=true`, `vlm_fsdp=true`, `enable_full_shard=false`), con batch global de 128 (16 por GPU x 8 x 1 de acumulacion). Los datos proceden de una seleccion congelada de 1.215 de los 1.220 repositorios de la coleccion MolmoAct2 SO100/101, con 37.247 episodios y 19.515.296 frames; cinco repositorios incompletos fueron excluidos. En el paso 90.000 la exposicion nominal es de 11.520.000 muestras, aproximadamente 0,5903 pasadas sobre el recuento de frames seleccionado.

El optimizador empleado es Muon, con LR base de 1e-4 y decaimiento coseno hasta 5e-5 a lo largo de los 200.000 pasos objetivo, sin warmup y con weight decay 0. En el paso 90.000 los LR registrados de base y expert eran 7,89e-5 y 2,23e-4 respectivamente. La perdida total paso de 0,5354 a 0,0948 y `VLA_Loss` de 0,5022 a 0,0895 entre los pasos 1 y 90.000; el objetivo de accion es `L1_fm` y tambien se registran terminos de depth, future-depth, future-video y regularizacion MoE (en el paso 90.000: depth 0,4263, future depth 0,5524, future video 0,0523). La normalizacion usa estadisticas fijadas de SO100 con `bounds_99_woclip` tanto para brazo como para gripper, sin recalcular sobre la seleccion local.

## Capacidades

- Generacion de acciones roboticas: produce chunks de 50 objetivos articulares absolutos para seis grados de libertad mas gripper.
- Percepcion visual multimodal: procesa hasta tres vistas de camara simultaneas por paso de inferencia.
- Comprension de instrucciones en lenguaje natural: condiciona el comportamiento a instrucciones de episodio o tareas textuales en ingles.
- Razonamiento visomotor multi-paso: el chunking de acciones de horizonte 50 permite ejecutar secuencias de manipulacion sin replanificar en cada frame.
- Prediccion auxiliar de profundidad y video futuro: durante el entrenamiento se optimizan cabezas de depth, future-depth y future-video, lo que sugiere representaciones latentes orientadas a la anticipacion temporal.
- Enmascarado de dimensiones no utilizadas y de padding al final de episodio, lo que permite entrenar con datos heterogeneos.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente basadas en texto: no disponible (no es un LLM conversacional generico).
- Capacidades multilingues: no; el modelo declara unicamente ingles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Manipulacion con brazo SO100/SO101 en laboratorio: el modelo esta ajustado especificamente para esta familia de brazos y emite objetivos articulares absolutos directamente, por lo que puede desplegarse como politica de control sin transformaciones adicionales.
- Recogida y colocacion (pick and place) guiada por lenguaje: dada una instruccion en ingles y las vistas de camara, el modelo genera el chunk de acciones necesario para completar la tarea de agarre y deposito.
- Investigacion en ajuste fino de VLA: el repositorio documenta con detalle hiperparametros, configuracion FSDP2, estadisticas de normalizacion y curvas de perdida, lo que lo convierte en una referencia reproducible para experimentos de full fine-tuning sobre LingBot VLA v2.
- Benchmarking interno de politicas roboticas: al fijar una seleccion concreta de 1.215 repositorios y estadisticas de normalizacion congeladas, sirve como punto de partida controlado para comparar recetas de entrenamiento (Muon frente a AdamW, por ejemplo).
- Recoleccion de datos activa: integrado en un bucle de teleoperacion o evaluacion, permite detectar fallos sistematicos de la politica y priorizar que episodios anadir a la coleccion de entrenamiento.
- Prototipado de tareas de manipulacion de multiples etapas: el horizonte de accion de 50 pasos con emparejamiento de camaras actual/futuro facilita tareas que requieren anticipacion, como insertar una pieza o alinear un objeto antes de agarrarlo.
- Base para nuevos ajustes especificos de tarea: al ser un export completo (no un adaptador LoRA), puede reentrenarse o afinarse sobre dominios concretos conservando toda la capacidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida total 0,5354 -> 0,0948 y `VLA_Loss` 0,5022 -> 0,0895 entre los pasos 1 y 90.000), medidas sobre batch y no sobre validacion, y advierte explicitamente de que no son comparables con el MSE de otra politica ni con la entropia cruzada por token.

## Requisitos de hardware

- Pesos publicados: seis shards en FP32 con un payload tensorial de aproximadamente 23,75 GiB, por lo que el almacenamiento necesario es de unos 25,5 GB.
- VRAM para inferencia en FP32 (estimacion a partir del recuento de parametros): aproximadamente 26-32 GB contando pesos mas activaciones del VLM y del codificador visual. No cabe en GPUs de consumo de 24 GB.
- VRAM en BF16/FP16 (estimacion, requiere conversion, no publicada oficialmente): aproximadamente 13-16 GB, factible en RTX 4090, RTX 5090 o A100 40 GB.
- VRAM en INT8 (estimacion): aproximadamente 7-9 GB.
- VRAM en INT4 (estimacion): aproximadamente 4-6 GB, apto para GPUs de consumo de gama media-alta, siempre que se realice la conversion de forma manual.
- GPUs de entrenamiento: el ajuste original se ejecuto sobre 8 GPUs con FSDP2 y batch global de 128; no cabe entrenamiento completo en una unica GPU de consumo.
- Opciones de despliegue: el repositorio incluye un `lingbotvla_cli.yaml` y una implementacion propia (`lingbotvla`), lo que implica inferencia mediante el stack del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo de transformers estandar el soporte de terceros es, como minimo, incierto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. La tabla siguiente recoge unicamente los datos publicos disponibles; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|
| LingBot-MolmoAct2-So101 | 6,375 B | no disponible | no disponible | safetensors FP32 |
| robbyant/lingbot-vla-v2-6b (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Otras politicas VLA de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Se recomienda consultar la documentacion oficial de cada alternativa antes de establecer comparaciones de rendimiento, ya que no hay resultados de benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; en produccion es un bloqueo potencial.
- Checkpoint intermedio: corresponde al paso 90.000 de un objetivo de 200.000. No es un modelo completado ni un mejor checkpoint seleccionado por validacion.
- Ausencia de benchmarks: no hay evidencia publica de tasas de exito en tareas reales, lo que impide estimar su fiabilidad antes de evaluarlo en el propio entorno.
- Especializacion estrecha: esta ajustado para SO100/SO101 con seis articulaciones concretas y un mapeo de indices especifico ([0,1,2,3,4,28] sobre 55 dimensiones). No es un modelo generalista y no deberia esperarse que funcione en otras morfologias sin reentrenamiento.
- Dependencia de la configuracion de camaras: se entren con hasta tres vistas emparejadas actual/futuro y los slots ausentes se eliminan antes de la codificacion; un montaje de camaras distinto puede degradar el comportamiento.
- Normalizacion fijada: las estadisticas no se recalcularon sobre la seleccion local y usan `bounds_99_woclip` de SO100. Cambiar de robot o de unidad de medida invalida esas estadisticas.
- Idiomas: solo ingles. Las instrucciones en otros idiomas no estan soportadas de forma declarada.
- Riesgo de alucinacion: al integrar un backbone VLM (Qwen3-VL), persiste el riesgo de interpretaciones erroneas de la escena o de la instruccion, con consecuencias fisicas en un robot real.
- Sesgos de datos: la coleccion MolmoAct2 SO100/101 incluye fuentes recuperadas por la comunidad, lo que puede introducir sesgos de distribucion de tareas, entornos e iluminacion.
- Metricas de perdida no comparables: los valores reportados son medidas de batch, no medias de validacion, y no son equiparables a MSE o entropia cruzada de otras politicas.
- Solo FP32: no se publican versiones cuantizadas, de modo que cualquier despliegue en GPU de consumo exige una conversion propia con la perdida de precision asociada.
- Procedencia del W&B: el enlace de seguimiento apunta a una instancia alojada en forge.coreweave.com y su acceso depende de los permisos del proyecto, por lo que la trazabilidad completa puede no estar disponible publicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/LingBot-MolmoAct2-So101
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Seguimiento del entrenamiento (W&B): https://forge.coreweave.com/wandb/lmh_proj/lingbot-vla2-so100/runs/0621cf5bff421c2b
- Estadisticas de normalizacion: `finetune_assets/norm_stats.json` (incluido en el repositorio)
- Configuracion de despliegue: `lingbotvla_cli.yaml` (incluido en el repositorio)
