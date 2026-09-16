# maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-100k

## Resumen

`maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-100k` es un ajuste fino completo (*full fine-tune*) del modelo base `lerobot/pi05_base`, de la familia pi0.5, especializado en una única tarea de robotica: recoger una bolsa del suelo y dejarla sobre la mesa. Lo publica el usuario `maskjp` en Hugging Face bajo licencia Apache 2.0, con la libreria LeRobot y pesos en formato safetensors. El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parametros (unos 4,14 mil millones).

El interes del modelo no esta en su rendimiento absoluto, sino en su valor como artefacto experimental. El autor publica el paso 100K de una ejecucion de 100K pasos y advierte explicitamente de que **no son los mejores pesos**: la perdida en el conjunto de validacion (0,1254) esta un 298 % por encima del minimo de la ejecucion (0,0315, alcanzado en el paso 2K). El checkpoint se publica para permitir comparaciones emparejadas por numero de paso contra una ejecucion sin *augmentation* y contra otras publicaciones del mismo autor.

Tecnicamente, el modelo incorpora dos decisiones de diseno relevantes: acciones expresadas de forma **relativa al estado de observacion al inicio de cada chunk** (12 de las 13 dimensiones; el *gripper* se mantiene absoluto) y *augmentation* fotometrica de imagen activada durante el entrenamiento. La tarea se aprende a partir de 200 episodios (477.058 fotogramas, 2,65 horas a 50 fps) con un brazo u850 sobre base movil y tres camaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia pi0.5; el detalle interno no se especifica en la informacion disponible (se hereda de `lerobot/pi05_base`). Ajuste fino completo, no LoRA |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones), segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el model card menciona chunks de accion de 50 pasos |
| Tipos de cuantizacion | no disponible; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible; la tarea esta condicionada por lenguaje, pero no se indica el idioma de la instruccion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Tarea | una unica tarea: *pick up the bag on the ground and place it on the table* |
| Dimension de accion | 13 (eef_x, eef_y, eef_z, eef_xx, eef_xy, eef_xz, eef_yx, eef_yy, eef_yz, gripper, base_x, base_y, base_yaw) |
| Embodiment | brazo u850 sobre base movil, tres camaras (izquierda, derecha, muneca) |
| Normalizacion | QUANTILES, calculada sobre los desplazamientos relativos y no sobre los objetivos absolutos |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (codificador visual, backbone de lenguaje, *action expert* ni numero de capas). Lo que si se documenta es que se trata de un **ajuste fino completo de todos los pesos** de `lerobot/pi05_base`, un modelo de la familia pi0.5 orientado a robotica, y que la salida es un vector de accion de 13 dimensiones. El entrenamiento se realizo con la libreria LeRobot sobre una unica tarea condicionada por lenguaje, con 200 episodios en total, de los cuales 10 (el 5 %) se reservaron para validacion, quedando 190 episodios de entrenamiento. En total, 477.058 fotogramas, equivalentes a 2,65 horas capturadas a 50 fps. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (en robotica de imitacion, habitualmente no aplican).

La innovacion tecnica principal es la **representacion relativa de acciones**. Mediante `use_relative_actions=true` y `relative_exclude_joints=["gripper"]`, el paso `RelativeActionsProcessorStep` resta el estado de anclaje en tiempo de batch y `AbsoluteActionsProcessorStep` lo vuelve a sumar a la salida, de modo que la politica emite acciones absolutas y la conversion es identica en entrenamiento, evaluacion e inferencia. La regla es `action[t+k] -= observation.state[anchor]` para todas las dimensiones excepto `gripper`, que se mantiene absoluto por ser un comando y no una pose. La normalizacion por cuantiles se calcula sobre los desplazamientos relativos en chunks de 50 (registrado en `meta/relative_action_provenance.json`); usar estadisticas absolutas dejaria la mayoria de objetivos fuera del rango `[-1, 1]`. La rotacion del efector final se almacena en la **forma continua 6D** (las dos primeras columnas de la matriz de rotacion) en lugar de eje-angulo, porque en este robot el *gripper* apunta hacia abajo y `|rotvec|` se situa cerca de pi, donde el signo cambia de forma arbitraria y aparecen saltos de 2*pi entre fotogramas.

En cuanto a la *augmentation*, se activo `--dataset.image_transforms.enable=true` con un maximo de 3 transformaciones muestreadas por ejemplo, todas fotometricas y sin transformacion geometrica, de modo que la geometria imagen-a-accion no se altera: `brightness` (ColorJitter, [0,8, 1,2]), `contrast` (ColorJitter, [0,8, 1,2]), `saturation` (ColorJitter, [0,5, 1,5]), `hue` (ColorJitter, [-0,05, 0,05]) y `sharpness` (SharpnessJitter, [0,5, 1,5]).

## Capacidades

- Generacion de acciones motoras: produce comandos de 13 dimensiones para un brazo u850 sobre base movil, en forma de chunks (la normalizacion relativa se calcula en chunks de 50).
- Politica condicionada por lenguaje: ejecuta una unica instruccion de tarea (*pick up the bag on the ground and place it on the table*).
- Entrada multimodal: consume tres flujos de imagen (camara izquierda, derecha y de muneca) junto con el estado de observacion del robot.
- Control de efector final en espacio cartesiano: posicion xyz, rotacion 6D continua y comando de *gripper*.
- Control de base movil: incluye las dimensiones `base_x`, `base_y` y `base_yaw`, por lo que abarca navegacion basica ademas de manipulacion.
- Acciones relativas con ancla: 12 de las 13 dimensiones se expresan respecto al estado de observacion al inicio del chunk, mientras que el *gripper* es absoluto.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni uso como agente.
- No es un modelo de generacion de texto, codigo, matematicas ni dialogo; no se documentan capacidades de *thinking mode*, audio ni descripcion de imagenes.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de la tarea en laboratorio: ejecutar la politica en el mismo *embodiment* (u850 sobre base movil con tres camaras) mediante las herramientas de evaluacion de LeRobot, para verificar el comportamiento publicado y disponer de una linea base medible.
- Punto de partida para ajuste fino en tareas de *pick and place*: al ser un ajuste completo de pi0.5 con acciones relativas ya resueltas, sirve como inicializacion para tareas de recogida y colocacion con geometrias de camara y brazo similares, reduciendo el numero de episodios necesarios.
- Referencia de comparacion emparejada por paso: el checkpoint existe precisamente para compararse con la ejecucion sin *augmentation* y con otras publicaciones del mismo autor en el mismo paso de entrenamiento (100K), lo que lo hace util en estudios de reproducibilidad.
- Investigacion sobre representaciones de accion: permite medir el efecto de acciones relativas frente a absolutas, incluida la decision de excluir el *gripper* de la resta del ancla, en una tarea concreta y con curva de perdida publicada paso a paso.
- Estudio de sobreajuste y seleccion de checkpoints: la curva completa de `eval_loss` (de 1K a 100K) permite analizar como se degrada la generalizacion con el numero de pasos y justificar criterios de *early stopping* en robotica de imitacion.
- Evaluacion de robustez fotometrica: al haberse entrenado con *augmentation* fotometrica, puede emplearse para medir degradacion bajo cambios de iluminacion, contraste o saturacion en el puesto de trabajo, sin alterar la geometria de la escena.
- Docencia y formacion en *robot learning*: caso cerrado y de un solo comando, con dataset pequeno (190 episodios de entrenamiento) y curva de validacion documentada, adecuado para practicas de evaluacion de politicas VLA.
- Integracion en pipelines de manipulacion movil: las dimensiones de base (`base_x`, `base_y`, `base_yaw`) permiten ensayar la coordinacion entre desplazamiento de la plataforma y colocacion del objeto sobre la mesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de exito en robot tipo *success rate*). El unico dato de rendimiento es la perdida en validacion sobre el 5 % de episodios reservados (10 de 200). Tabla resumida con pasos seleccionados de la curva completa (el model card incluye los 100 pasos):

| Paso | eval_loss |
|---|---|
| 1K | 0,0357 |
| 2K | 0,0315 (minimo) |
| 5K | 0,0343 |
| 10K | 0,0414 |
| 20K | 0,0518 |
| 30K | 0,0606 |
| 40K | 0,0699 |
| 50K | 0,0858 |
| 60K | 0,0962 |
| 70K | 0,1086 |
| 80K | 0,1174 |
| 90K | 0,1239 |
| 100K | 0,1254 (este repositorio) |

Observaciones derivadas de los datos publicados:

| Comparacion | Valor |
|---|---|
| Perdida de este checkpoint (100K) | 0,1254 |
| Perdida minima de la ejecucion (2K) | 0,0315 |
| Degradacion del checkpoint final respecto al minimo | 298 % por encima |
| Perdida a 20K, ejecucion con augmentation | 0,0518 |
| Perdida a 20K, ejecucion sin augmentation | 0,0728 |
| Diferencia de *learning rate* a 20K entre ambas ejecuciones | 9,1x (mayor en la ejecucion con augmentation) |
| Perdida minima, con augmentation (2K) | 0,0315 |
| Perdida minima, sin augmentation (2K) | 0,0317 |
| Diferencia entre minimos | ≈1 % (una sola semilla por brazo) |

El autor advierte de que la comparacion entre ambas ejecuciones **no es una ablacion limpia**: el horizonte de decaimiento coseno difiere (20K frente a 100K), por lo que las dos ejecuciones operan a *learning rates* distintos desde el calentamiento y la brecha crece con el paso. La conclusion explicita del model card es que no se reclama que la *augmentation* haya ayudado.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del recuento de parametros (el model card no especifica la precision de los pesos; cifras orientativas): en bf16/fp16 ≈8,3 GB de pesos; en fp32 ≈16,6 GB; en int8 ≈4,1 GB; en int4 ≈2,1 GB. Hay que anadir el coste de activaciones y del codificador visual, que depende de la resolucion de las tres camaras y del tamano de batch.
- El repositorio ocupa 9,4 GB para 4,14 mil millones de parametros (≈2,27 bytes por parametro), lo que es coherente con pesos en bf16 mas ficheros auxiliares de configuracion y preprocesado.
- GPU recomendadas: A100 y H100 para entrenamiento o evaluacion por lotes; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con margen suficiente. Tarjetas de 16 GB pueden ser suficientes en bf16 con batch 1; tarjetas de 12 GB requeririan cuantizacion a int8, no documentada oficialmente.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en bf16; en gamas de 16 GB de forma ajustada.
- Opciones de despliegue: la libreria LeRobot (scripts de evaluacion y servidor de politica). No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA con entradas de imagen y estado y salidas de accion.
- Latencia y throughput: no disponibles. Cabe senalar que la captura de datos se realizo a 50 fps, lo que implica requisitos de tiempo real en el bucle de control; el uso de chunks de accion amortigua parcialmente el coste de inferencia, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-100k` | 4,14 mil millones | no disponible | Una tarea (bag-place), acciones relativas de 13 dims | apache-2.0 | Publico en Hugging Face (0 descargas) |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | no disponible | VLA generalista de la familia pi0.5 | no disponible en la informacion proporcionada | Publico en Hugging Face |
| Ejecucion sin *augmentation* (misma tarea, misma inicializacion) | mismos pesos de partida | no disponible | Misma tarea (bag-place) | no disponible | No publicada, segun el model card |
| Otros modelos VLA de la misma categoria (por ejemplo, alternativas tipo OpenVLA o SmolVLA) | no disponible | no disponible | Manipulacion generalista | no disponible | no disponible |

La comparacion relevante esta en los datos del propio autor: frente al modelo base, este checkpoint esta especializado en una sola tarea y no conserva capacidades generalistas; frente a su contraparte sin *augmentation*, la diferencia de perdida minima (0,0315 frente a 0,0317) no es concluyente porque solo hay una semilla por brazo.

## Limitaciones y advertencias

- **El checkpoint publicado no es el mejor de la ejecucion.** La perdida de validacion a 100K (0,1254) esta un 298 % por encima del minimo (0,0315 en 2K). La curva sube de forma monotona en terminos practicos desde el paso 2K: mas pasos empeoran el rendimiento en datos reservados. Si se busca calidad, el checkpoint de 2K es preferible; este repositorio existe para comparaciones emparejadas por paso.
- **Tarea unica y sin generalizacion.** El modelo aprende una sola instruccion de lenguaje y no se documenta ningun resultado en tareas distintas.
- **Dataset muy pequeno.** 190 episodios de entrenamiento (10 de validacion) y 477.058 fotogramas (2,65 horas a 50 fps). El riesgo de sobreajuste es alto y consistente con la curva de perdida.
- **Un solo *embodiment*.** Brazo u850 sobre base movil con tres camaras concretas; el modelo no es portable a otras configuraciones sin reentrenamiento.
- **El efecto de la *augmentation* no esta demostrado.** La comparacion con la ejecucion sin *augmentation* confunde la augmentation con el horizonte de decaimiento del *learning rate* (diferencia de 9,1x a 20K) y solo dispone de una semilla por brazo. El propio autor declina reclamar un efecto.
- **Espacio de accion especifico.** 13 dimensiones con nombres concretos, 12 de ellas relativas y el *gripper* absoluto. Cualquier cambio en la convencion de anclaje o en la exclusion del *gripper* invalida el modelo.
- **Caveat de rotacion.** La rotacion se almacena en forma 6D continua y no en eje-angulo. Una vista construida en eje-angulo introduce saltos de 2*pi entre fotogramas, porque el *gripper* apunta hacia abajo y `|rotvec|` esta cerca de pi.
- **Idioma de la instruccion no especificado.** No se indica en que idioma esta formulada la tarea condicionada por lenguaje.
- **Riesgo de alucinacion.** No aplica en el sentido de generacion de texto, pero si existe el riesgo equivalente de producir trayectorias plausibles pero fisicamente invalidas ante observaciones fuera de distribucion (iluminacion, posicion de la bolsa, fondo).
- **Restricciones de licencia.** El repositorio se publica bajo apache-2.0, lo que permite uso comercial. No obstante, conviene verificar la licencia y los terminos de `lerobot/pi05_base`, del que deriva, antes de un despliegue en produccion.
- **Sin validacion de la comunidad.** 0 descargas y 0 *likes* en el momento de la consulta; no hay informes independientes de reproducibilidad ni de exito en robot real.
- **La ejecucion sin *augmentation*** mencionada en el model card no esta publicada, lo que impide reproducir la comparacion completa.
- **Despliegue no convencional.** Al ser una politica VLA y no un modelo de lenguaje, herramientas como vLLM, llama.cpp, Ollama o TGI no son aplicables; el *stack* de referencia es LeRobot sobre PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maskjp/pi05-relative-eef-bagplace-aug100k-full-ft-100k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Fichero de procedencia de normalizacion relativa, referenciado en el model card: `meta/relative_action_provenance.json` (dentro del repositorio del modelo)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Las consultas devolvieron paginas sin relacion con el modelo (un foro aleman de politica social y un sitio de preguntas y respuestas en chino), por lo que no se incluyen. No se dispone de paper, blog, repositorio de codigo ni demo adicionales en la informacion proporcionada.
