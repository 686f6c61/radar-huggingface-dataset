# maskjp/pi05-relative-joints-all10-full-ft-100k

## Resumen

El repositorio `maskjp/pi05-relative-joints-all10-full-ft-100k` contiene un fine-tuning completo de `lerobot/pi05_base`, un modelo de políticas de visión-lenguaje-acción (VLA) desarrollado sobre la arquitectura PI0.5 de Physical Intelligence e integrado en la librería LeRobot de Hugging Face. Este checkpoint está diseñado para controlar un brazo robótico u850 montado sobre una base móvil, con tres cámaras (izquierda, derecha y muñeca) y 10 dimensiones de acción: seis articulaciones, un gripper y tres grados de libertad de la base (x, y, yaw).

El entrenamiento se realizó sobre un conjunto de 11 tareas condicionadas por lenguaje natural, con 1499 episodios y 3 089 476 frames (17,2 horas a 50 fps). La particularidad de este modelo es que utiliza acciones relativas al estado de observación al inicio de cada chunk, con el gripper en valores absolutos. El checkpoint corresponde al paso 100K de una ejecución de 100K, aunque la pérdida held-out en ese punto es un 82 % superior al mínimo de la ejecución (que se alcanza en el paso 20K). Por tanto, estos pesos no son los mejores disponibles, pero se publican como referencia para comparar por pasos con la ronda anterior de 30K.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action transformer (VLA) basada en PI0.5 / `lerobot/pi05_base` |
| Parametros totales | 4 143 404 816 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA basado en transformer que procesa observaciones de tres cámaras (izquierda, derecha y muñeca) junto con una instrucción en lenguaje natural, y predice acciones de control de 10 dimensiones en el espacio de articulaciones. La arquitectura consta de un codificador de visión, un codificador de lenguaje y un experto de acciones, todos ellos fine-tuned en este training run. El número de parámetros entrenables es de 4 143 404 816 (4,14B), lo que supone un ajuste completo del modelo base.

El dataset de entrenamiento está compuesto por 11 tareas de manipulación, 1499 episodios y 3 089 476 frames. Las tareas incluyen recoger objetos del suelo o de la mesa, abrir la nevera, limpiar la mesa, mover un croissant a un plato, entre otras. La mezcla está sesgada: las cuatro tareas más grandes representan alrededor del 82 % de los frames, sin rebalanceo. El régimen de entrenamiento es un fine-tuning completo con lote efectivo de 63 (21 por rank en 3 ranks), tasa de aprendizaje 2.5e-5 con decaimiento coseno hasta 2.5e-6 sobre 100K pasos, 1000 pasos de warmup y el vision tower a 0.1x del learning rate global. Se utilizó precisión bfloat16 con gradient checkpointing.

La representación de acciones es relativa al estado de observación al inicio del chunk para 9 de las 10 dimensiones; la dimensión del gripper se mantiene absoluta porque se interpreta como un comando, no como una pose. La normalización se calcula con cuantiles sobre los offsets relativos, no sobre los objetivos absolutos. El chunk_size es 50 y el número de pasos de acción predichos es 10. La rotación del efector final se almacena como forma 6D continua (las dos primeras columnas de la matriz de rotación) para evitar discontinuidades de 2*pi en el axis-angle.

## Capacidades

- Generación de secuencias de acciones de 10 dimensiones para control de brazo robótico y base móvil.
- Condicionamiento por instrucciones en lenguaje natural para 11 tareas de manipulación.
- Procesamiento de observaciones de tres cámaras simultáneas (izquierda, derecha y muñeca).
- Predicción de acciones en chunks, con tamaño de chunk de 50 y 10 pasos de acción.
- Emisión de acciones absolutas en la salida, gracias a la transformación interna de acciones relativas (los procesadores `RelativeActionsProcessorStep` y `AbsoluteActionsProcessorStep` convierten relativas a absolutas en entrenamiento, evaluación e inferencia).
- Compatibilidad con la librería LeRobot mediante la clase `PI05Policy`.
- No soporta tool calling, generación de texto libre ni razonamiento conversacional: es exclusivamente un modelo de políticas para robótica.

## Casos de uso

- Manipulación doméstica de objetos: el modelo puede planificar y ejecutar secuencias de agarre y colocación, como recoger una bolsa del suelo y ponerla en una mesa, gracias al entrenamiento específico en estas tareas con observaciones de cámara y lenguaje natural.
- Apertura de puertas y navegación interior: al estar entrenado para "abrir la puerta y moverse dentro", el modelo es adecuado para robots de servicio que necesitan coordinar el brazo y la base móvil para superar obstáculos como puertas.
- Limpieza automatizada de superficies: la tarea de limpiar la mesa con un paño verde permite aplicar el modelo en robots de limpieza doméstica o de entornos de hostelería, donde se requieren movimientos de barrido repetitivos.
- Asistentes robóticos en cocina: la manipulación de electrodomésticos, como abrir el frigorífico y coger una bebida, hace que este modelo sea útil en robots que asisten en preparación de alimentos o gestión de inventario en cocinas comerciales.
- Manipulación de alimentos en restauración: el entrenamiento en mover un croissant a un plato y colocar tazas sobre una mesa lo habilita para tareas de emplatado y servicio en robots de restauración.
- Investigación en robótica: el checkpoint sirve como referencia para estudiar el efecto del sobreajuste en VLA y la influencia de la representación de acciones relativas. Comparar el paso 100K con el 20K y el 30K permite analizar cómo evoluciona la pérdida held-out en función del número de pasos.
- Automatización de tareas de precisión en mesas de laboratorio: las tareas de recoger botellas y tazas de una mesa con coordenadas articulares precisas son reproducibles en entornos de investigación que requieren manipulación repetitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque se trata de un modelo de políticas robóticas. La métrica de rendimiento reportada es la pérdida held-out sobre un 5 % de los episodios por tarea (77 de 1499 episodios, 11 tareas). La evolución de la pérdida de evaluación a lo largo de los pasos es la siguiente:

| Paso | Eval loss |
|---|---|
| 5K | 0.0263 |
| 10K | 0.0238 |
| 15K | 0.0245 |
| 20K | 0.0237 (mínimo) |
| 25K | 0.0256 |
| 30K | 0.0266 |
| 35K | 0.0266 |
| 40K | 0.0284 |
| 45K | 0.0294 |
| 50K | 0.0314 |
| 55K | 0.0331 |
| 60K | 0.0348 |
| 65K | 0.0368 |
| 70K | 0.0382 |
| 75K | 0.0392 |
| 80K | 0.0398 |
| 85K | 0.0412 |
| 90K | 0.0423 |
| 95K | 0.0431 |
| 100K | 0.0432 |

El valor mínimo de pérdida se registra en el paso 20K con 0.0237; a partir de ahí, la curva asciende de manera consistente, lo que indica sobreajuste a los datos de entrenamiento. Este checkpoint de 100K tiene una pérdida held-out un 82 % superior a ese mínimo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 8,3 GB (4.14B x 2 bytes). Con activaciones, buffers y procesamiento de tres cámaras, se recomienda un mínimo de 16 GB y una configuración de 24 GB para trabajar con holgura.
- GPU recomendadas: RTX 4090 (24 GB) para consumo; A100 40/80 GB y H100 para despliegues de mayor rendimiento.
- El modelo puede ejecutarse en una GPU de consumo de gama alta, como una RTX 4090 o RTX 6000 Ada (48 GB), siempre que la resolución de imagen y el tamaño de lote se ajusten adecuadamente.
- Opciones de despliegue: se utiliza la librería LeRobot a través de la clase `PI05Policy`; la carga se realiza con `PI05Policy.from_pretrained("maskjp/pi05-relative-joints-all10-full-ft-100k")`.
- Durante el entrenamiento se utilizaron 3 ranks con batch efectivo de 63, activando gradient checkpointing. Para inferencia no se requieren sistemas como vLLM, TGI ni llama.cpp, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Eval loss (held-out) | Datos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| maskjp/pi05-relative-joints-all10-full-ft-100k (este repo) | 4.14B | No disponible | 0.0432 | 11 tareas, 1499 episodios | Apache 2.0 |
| maskjp/pi05-relative-joints-all10-full-ft-20k | 4.14B | No disponible | 0.0237 (mínimo) | 11 tareas, 1499 episodios | Apache 2.0 |
| maskjp/pi05-relative-joints-full-ft-30k | 4.14B | No disponible | No disponible | 7 tareas, 949 episodios | Apache 2.0 |
| lerobot/pi05_base | 4.14B | No disponible | No disponible | Preentrenamiento del modelo base | No disponible |

El checkpoint de 20K corresponde a la misma configuración de entrenamiento que este repositorio, pero con pesos en el mínimo de pérdida. El modelo de 30K pertenece a la ronda anterior y se entrenó con 7 datasets y 949 episodios, por lo que no es un reemplazo directo de estos pesos.

## Limitaciones y advertencias

- Este checkpoint es el paso 100K, no los mejores pesos. El mínimo de pérdida held-out se alcanza en el paso 20K (0.0237); cualquier uso en producción debería decantarse por el checkpoint de 20K.
- La curva de pérdida de evaluación asciende de forma continua después del paso 20K, lo que evidencia sobreajuste a los datos de entrenamiento.
- La mezcla de datos está fuertemente sesgada: las cuatro tareas más grandes representan aproximadamente el 82 % de los frames, y el muestreo uniforme por frames no rebalancea la distribución.
- La representación de acciones relativas excluye el gripper, que es tratado como acción absoluta. Si se modifica o se ignoran los metadatos del dataset, el gripper podría relativizarse silenciosamente, produciendo comportamientos incorrectos.
- La normalización por cuantiles se calcula sobre los offsets relativos, no sobre los objetivos absolutos. Utilizar estadísticas absolutas colocaría la mayoría de los objetivos fuera del intervalo [-1, 1] y degradaría el rendimiento.
- La rotación del efector final se almacena en forma 6D continua (dos primeras columnas de la matriz de rotación), no como axis-angle. Construir una vista axis-angle a partir de estas predicciones puede introducir discontinuidades de 2*pi.
- El repositorio incluye metadatos con nombres de dimensiones aplanados en `info.json`, mientras que los datasets de entrenamiento los agrupan como `{"motors": [...]}`. Esto debe tenerse en cuenta al integrar el modelo en pipelines personalizados.
- No se han publicado cuantizaciones. Un despliegue en entornos con memoria limitada requeriría cuantizar los pesos manualmente, con el riesgo de degradar el rendimiento.
- El soporte multilingüe no está documentado; las instrucciones de lenguaje probablemente funcionan mejor en inglés, que es el idioma más común en los datasets de este tipo.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que las tareas de despliegue cumplen con las condiciones de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-100k
- Modelo base: https://huggingface.co/lerobot/pi05_base
