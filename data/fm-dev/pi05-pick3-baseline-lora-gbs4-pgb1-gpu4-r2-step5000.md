# fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step5000

## Resumen

El modelo `fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step5000` es un checkpoint de ajuste fino mediante LoRA sobre π0.5 (etiquetado como `pi05`), orientado a la tarea de manipulación robótica denominada **pick3** sobre un brazo Franka. Se trata de la segunda ronda de entrenamiento (`r2`) del autor `fm-dev` y corresponde concretamente a la actualización de optimizador número **5.000** de una ejecución que aspira a **12.500 actualizaciones** (equivalentes a **50.000 exposiciones de muestra**). No es un modelo de lenguaje generalista, sino una política visomotora que consume imágenes de cámara base y de muñeca, estado del robot e instrucción de tarea, y emite acciones de efector final.

El interés de esta ficha es acotado y muy técnico: se trata de un artefacto de investigación reproducible, publicado con pesos de servicio EMA, activos de normalización, código de inferencia, versiones exactas de dependencias y estado completo de reanudación (optimizador, RNG, sampler). El repositorio ocupa **11,5 GB** y no registra descargas ni valoraciones en el momento de la consulta. El propio autor advierte que la publicación intermedia de un checkpoint **no constituye una evaluación de la calidad de la política** y que una evaluación offline, si se incluye, no establece la tasa de éxito en robot real.

No se dispone de información pública sobre el número de parámetros del modelo base, la longitud de contexto, los idiomas soportados ni la licencia, por lo que esos campos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como ajuste fino LoRA sobre π0.5, etiqueta `pi05`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones de tarea, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion de la ficha; el repositorio incluye pesos EMA de servicio, activos de normalizacion e historial, codigo de inferencia y estado de reanudacion (11,5 GB) |
| Parametros LoRA | rango 32 (rank32) |
| Optimizador | AdamW |
| Semilla | 42 |
| Tamano del repositorio | 11,5 GB |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La informacion disponible describe el artefacto como un ajuste fino de segundo nivel (**LoRA rank 32**) sobre el modelo π0.5, aplicado a la tarea **pick3** sobre robot Franka. El entrenamiento se realizo localmente en **4 GPU RTX A6000**, con **batch global 4**, **batch por GPU 1** y **sin acumulacion de gradientes**. El checkpoint publicado corresponde al paso **5.000**, que representa **20.000 exposiciones de muestra**; la ejecucion completa apunta a **12.500 actualizaciones de optimizador / 50.000 exposiciones de muestra**. Los checkpoints se guardan cada **1.000** actualizaciones y en el paso final **12.500**; los pasos **5.000**, **10.000** y **12.500** cuentan con repositorios independientes, mientras que el resto se conserva en el archivo de respaldo del autor bajo la ruta `task/method/stepN/`, con los mismos ficheros de carga y estado completo de reanudacion.

El calendario de aprendizaje consiste en un calentamiento (**warmup**) de **250** actualizaciones hasta **5e-5**, seguido de un decaimiento coseno hasta **5e-6** en el paso **12.500**. Se aplica EMA con factor **0,999^4 = 0,996005996001**. La configuracion completa esta en `training_config.json`. En cuanto al condicionamiento, la variante publicada es una **baseline sin historial**: utiliza las imagenes actuales de camara base y muñeca, el estado y la instruccion de tarea. Solo las filas de ejecucion del robot supervisan las acciones; las imagenes de demostracion, caracteristicas y coordenadas originales de episodio/fotograma permanecen disponibles como historial, y el inicio de la ejecucion no reinicia el historial visual. Las particiones de episodios y la normalizacion emplean unicamente el split de entrenamiento.

## Capacidades

- Generacion de acciones de manipulacion robotica: la salida tiene forma `(20,8)`, es decir, un bloque de 20 pasos con posicion absoluta xyz, cuaternion unitario XYZW en la carta de qx positivo y comando de pinza en el rango [0,1].
- Consumo multimodal de entrada: imagenes de camara base y de muñeca, mas estado numerico del robot e instruccion de tarea.
- Politica de imitacion condicionada por instruccion (vision-language-action), orientada a la tarea pick3.
- Tratamiento explicito de componentes no supervisados: los componentes desconocidos permanecen como NaN/false en el conjunto de datos y se enmascaran tanto en el condicionamiento de flujo como en la perdida. La lista de componentes totalmente no supervisados es `[]`.
- Soporte de normalizacion diferenciada: estado y acciones numericas con normalizacion STD, y tokens de estado con una vista acotada train-q01/q99 separada.
- Capacidad de reanudacion completa del entrenamiento, con estado de optimizador, RNG y sampler, ademas de pesos no EMA.
- Carga mediante el bundle: `from load_model import load, observe; policy = load()`. Para modelos con historial se invoca `observe(policy, base_rgb, state)` en cada fotograma observado, incluidas las demostraciones, reiniciando entre episodios.
- La variante Status-D requiere entradas adicionales: `history_keyframe_index` (un fotograma observado o None), `current_subgoal` y entradas causales `transition_context_*` en `policy.infer(...)`, y su salida incluye `transition_status`.
- No se declaran capacidades de tool calling, agentes, vision general, audio ni modo de razonamiento explicito; no hay informacion al respecto.
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion robotica pick3 sobre Franka: la politica genera bloques de 20 acciones cartesianas (xyz mas cuaternion mas pinza) a partir de las camaras base y de muñeca, el estado y la instruccion, lo que permite ejecutar directamente la tarea de recogida sobre el brazo.
- Reproduccion de experimentos de ajuste fino LoRA sobre modelos VLA: el repositorio incluye `training_config.json`, versiones exactas de dependencias y estado de reanudacion, de modo que otro grupo puede replicar la receta (rank 32, AdamW, warmup 250, decaimiento coseno, semilla 42).
- Estudio de checkpoints intermedios: al existir repositorios independientes para los pasos 5.000, 10.000 y 12.500, es posible analizar la evolucion del entrenamiento y comparar el efecto del numero de exposiciones de muestra (20.000 frente a 50.000).
- Baseline para comparativas internas: la variante publicada es una baseline sin historial, util como referencia contra variantes con historial visual o con subsoluciones (Status-D) dentro del mismo pipeline.
- Transferencia a tareas propias: al ser un adaptador LoRA sobre π0.5, sirve como punto de partida para un ajuste adicional sobre nuevas tareas de manipulacion con el mismo formato de estado y acciones.
- Validacion de infraestructura de entrenamiento distribuido: la receta (4 RTX A6000, batch global 4, batch por GPU 1, sin acumulacion) es un caso concreto para verificar el comportamiento de marcos de entrenamiento distribuido en configuraciones de lote muy pequeño.
- Integracion con el controlador del robot: el modelo respeta la convencion de pose cartesiana de efector final/herramienta registrada en la coleccion de datos, lo que permite conectarlo a un controlador Franka siempre que no se aplique un desplazamiento adicional de herramienta/brida.
- Evaluacion offline de politicas: el repositorio incluye codigo de inferencia y activos de normalizacion que permiten ejecutar evaluaciones offline, teniendo en cuenta que el autor advierte que estas no establecen la tasa de exito en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card senala explicitamente que la publicacion de un checkpoint intermedio **no es una evaluacion de la calidad de la politica** y que una evaluacion offline, cuando se incluye, no establece la tasa de exito en robot real. No se dispone de cifras de exito en tarea, MMLU, HumanEval, GSM8K ni de metricas equivalentes para este artefacto.

## Requisitos de hardware

- Entrenamiento documentado: **4 GPU RTX A6000**, batch global 4, batch por GPU 1, sin acumulacion de gradientes.
- VRAM de inferencia: no disponible de forma explicita. El repositorio ocupa **11,5 GB** e incluye pesos EMA de servicio, activos de normalizacion e historial, codigo de inferencia y estado de reanudacion completo (optimizador, RNG, sampler); la ficha no desglosa cuanto de ese tamano corresponde a pesos de servicio y cuanto a estado de reanudacion, por lo que no se puede derivar una cifra fiable de VRAM.
- GPU recomendadas: no disponible. El unico dato de hardware documentado es el uso de RTX A6000 para el entrenamiento; no se especifica hardware de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles en la informacion proporcionada; la carga se realiza mediante el bundle propio del repositorio (`load_model.load()` / `observe()`), no mediante los marcos habituales de servido de LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La unica referencia disponible es el modelo base sobre el que se aplica el ajuste, y de el no se conocen parametros, contexto, licencia ni disponibilidad.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick3-baseline-lora-...-step5000 | Adaptador LoRA rank 32 sobre π0.5 | no disponible | no disponible | no disponible | Repositorio en HuggingFace, 0 descargas, 0 likes |
| π0.5 (modelo base) | Base del ajuste fino | no disponible | no disponible | no disponible | No se dispone de informacion en esta busqueda |
| Otros modelos de robotica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Cabe senalar que el autor conserva checkpoints hermanos de la misma ejecucion (pasos 5.000, 10.000 y 12.500 con repositorio propio, y el resto en el archivo de respaldo `fm-dev/pi05-checkpoint-backups`), que constituyen la comparacion mas directa disponible: misma tarea, mismos datos y mismo metodo, variando solo el numero de actualizaciones.

## Limitaciones y advertencias

- La publicacion de un checkpoint intermedio no es una evaluacion de calidad de la politica; el propio autor lo indica de forma explicita.
- La evaluacion offline, cuando existe, no establece la tasa de exito en robot real.
- El repositorio no declara licencia, lo que impide determinar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- No se declaran idiomas soportados, sesgos conocidos ni limitaciones idiomaticas; la informacion es no disponible.
- La tarea esta acotada a **pick3** sobre Franka, por lo que su generalizacion a otras tareas o plataformas roboticas no esta documentada.
- La convencion de pose cartesiana de efector final/herramienta registrada debe coincidir con la del controlador de recogida; no se debe aplicar un desplazamiento adicional de herramienta o brida.
- Los componentes de accion desconocidos permanecen como NaN/false y se enmascaran en el condicionamiento de flujo y en la perdida; las predicciones sobre esos componentes no estan supervisadas.
- La salida de pinza de la tarea **Shuffle** no tiene supervision de comando y no debe interpretarse como control de pinza aprendido.
- La tarea **Button Order** solo dispone de etiquetas verificadas limitadas de comando cerrado.
- El estado de reanudacion incluido hace que el repositorio contenga artefactos que no son pesos de inferencia, lo que puede confundir en el despliegue si no se separan adecuadamente.
- Solo las filas de ejecucion del robot supervisan acciones; el resto de filas aportan historial visual y de caracteristicas, lo que condiciona la interpretacion de los datos de entrenamiento.
- Las particiones de episodios y la normalizacion se calculan unicamente con el split de entrenamiento, por lo que las metricas derivadas de otros splits requieren recalculo explicito.
- El modelo registra 0 descargas y 0 likes, y no cuenta con validacion externa conocida en la informacion consultada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step5000
- Archivo de respaldo de checkpoints (dataset): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Fichero de configuracion de entrenamiento: `training_config.json` (incluido en el repositorio)
- Codigo de carga e inferencia: `load_model.py` (incluido en el repositorio)
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (corresponden a emisoras de radio en Francia) y no se han utilizado como fuente.
