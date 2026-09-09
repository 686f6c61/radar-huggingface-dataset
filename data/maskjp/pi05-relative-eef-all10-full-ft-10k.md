# maskjp/pi05-relative-eef-all10-full-ft-10k

## Resumen

`maskjp/pi05-relative-eef-all10-full-ft-10k` es un modelo de política de robótica (policy) desarrollado por **maskjp** mediante un fine-tuning completo del modelo base `lerobot/pi05_base`, dentro del ecosistema LeRobot. Está diseñado para controlar un brazo robótico **u850** montado sobre una base móvil, con tres cámaras (izquierda, derecha y muñeca), y es capaz de ejecutar tareas de manipulación condicionadas por lenguaje natural, como recoger objetos, abrir puertas, limpiar superficies o mover objetos entre recipientes.

El modelo se ha afinado sobre **10 datasets** de tipo `L5vel/*-eef-merged-v30`, que suman **1.499 episodios** y **3.089.476 fotogramas** (~17,2 horas a 50 fps). La arquitectura es un **PI05Policy** (basado en PaliGemma, con torre de visión y experto de acción) con **4.143.404.816 parámetros** en total. El checkpoint publicado corresponde al **paso 10.000** de un entrenamiento de 100.000 pasos, elegido porque presenta el **mínimo de pérdida held-out** (0,0245), evitando los efectos de sobreajuste observados en pasos posteriores.

La relevancia de este modelo radica en su uso de **acciones relativas en el espacio del efector final**, lo que mejora la generalización en tareas de manipulación al anclar las acciones a un estado de referencia. Además, el autor documenta explícitamente que el checkpoint publicado es el mejor punto de la curva de validación, no simplemente el último paso, lo que facilita su uso directo en sistemas reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PI05Policy (basada en PaliGemma; torre de visión + modelo de lenguaje + experto de acción) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de robótica); chunk_size = 50, n_action_steps = 10 |
| Tipos de cuantización | No disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | No disponible (condiciones de lenguaje en inglés en los datasets) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un **fine-tuning completo** (no son adaptadores) del checkpoint `lerobot/pi05_base`, lo que significa que se actualizan todos los pesos del modelo (visión, lenguaje y experto de acción), con un total de **4,14 B parámetros entrenables**. El entrenamiento se realizó con **bfloat16** y **gradient checkpointing** activado, con un lote efectivo de 63 (21 por rango × 3 rangos), una tasa de aprendizaje de 2,5e-5 con decaimiento coseno hasta 2,5e-6 a lo largo de 100K pasos, y 1.000 pasos de warmup. La torre de visión se entrenó con una tasa de aprendizaje multiplicada por 0,1.

Una innovación técnica destacable es el uso de **acciones relativas** mediante el transform de procesador `RelativeActionsProcessorStep`. En lugar de modificar los datos, este transform resta el estado anclado (observation state) en el momento del lote y luego lo vuelve a sumar con `AbsoluteActionsProcessorStep`, de modo que la política siempre emite acciones absolutas y la conversión es consistente entre entrenamiento, evaluación e inferencia. La representación de acciones tiene **13 dimensiones**: posición del efector (x, y, z), rotación 6D (dos columnas de la matriz de rotación), pinza (gripper) y base (x, y, yaw). De estas, **12 son relativas** y solo la pinza se mantiene absoluta, al tratarse de un comando y no de una pose.

La normalización de las acciones se calcula mediante **cuantiles** sobre los desplazamientos relativos, no sobre los valores absolutos, lo que evita que muchos objetivos queden fuera del rango [-1, 1]. También se documenta que la rotación del efector se almacena en **forma 6D continua**, evitando saltos arbitrarios de 2π que aparecerían con axis-angle en este robot (la pinza apunta hacia abajo).

El conjunto de datos está compuesto por 11 tareas condicionadas por lenguaje, como "grab a drink from the fridge", "open the door and move inside" o "pick up the blue cup from the table". La distribución es desigual: las cuatro tareas más grandes concentran aproximadamente el **82 % de los fotogramas**, y el muestreo es uniforme sobre fotogramas, sin reequilibrio. El 5 % de los episodios se reserva para validación (77 de 1.499 episodios, cubriendo las 11 tareas).

## Capacidades

- Genera **acciones de control de robot** en espacio del efector final (13 dimensiones) a partir de observaciones de cámaras y del estado del robot.
- Soporta **condicionamiento por lenguaje natural**: las tareas se especifican mediante instrucciones escritas (p. ej., "clean the table with the green towel").
- Utiliza **acciones relativas al estado inicial del chunk**, lo que mejora la robustez ante variaciones en la pose inicial del robot.
- Es capaz de manejar **maniobras de base móvil** además del brazo: incluye comandos de base (base_x, base_y, base_yaw).
- Integra **tres vistas de cámara** (izquierda, derecha y muñeca) como entrada visual, lo que permite percepción multiángulo.
- No soporta tool calling, función de agente ni modalidades de audio/visión como tareas de lenguaje general; es exclusivamente una política de bajo nivel para robótica.

## Casos de uso

- **Manipulación de objetos para logística doméstica**: el modelo puede recoger una bolsa de la compra del suelo y colocarla sobre una mesa, usando la vista de muñeca para alinear la pinza. La representación relativa de acciones facilita el ajuste fino del agarre.

- **Apertura y navegación de puertas**: tareas como "open the door and move inside" muestran que el modelo es adecuado para entornos donde el robot debe empujar una puerta y atravesarla, combinando movimientos del brazo y de la base móvil.

- **Tareas de limpieza y mantenimiento**: la tarea "clean the table with the green towel" permite usar el modelo en robots de servicio que necesitan limpiar superficies planas, moviendo el efector de forma repetitiva y controlada.

- **Atención en hostelería**: tareas como "move the croissant to the empty plate" o "place the blue cup on the table" indican aplicaciones en restaurantes o cafeterías, donde el robot debe manipular objetos de forma precisa sin romperlos.

- **Entornos de almacén y despensa**: el modelo puede "grab a drink from the fridge" o "open the fridge door", lo que resulta útil en sistemas de picking en almacenes automatizados o en asistentes robóticos para cocinas inteligentes.

- **Investigación en aprendizaje por imitación**: al ser un checkpoint abierto sobre LeRobot, sirve como referencia para estudiar el efecto de las acciones relativas, la representación 6D de rotación y el impacto del sobreajuste en políticas de bajo nivel, comparando con el checkpoint de 30K o con el anterior de 7 datasets.

## Benchmarks y rendimiento

Se presentan los resultados de **pérdida held-out** (evaluación sobre el 5 % de episodios reservados) a lo largo del entrenamiento, tal y como documenta el autor:

| Paso | Pérdida held-out |
|---|---|
| 5K | 0,0264 |
| 10K | **0,0245** (mínimo, este repo) |
| 15K | 0,0249 |
| 20K | 0,0251 |
| 25K | 0,0259 |
| 30K | 0,0268 |

El mejor resultado se obtiene en el paso 10K, y la curva de pérdida aumenta a partir de ahí, indicando un **sobreajuste** progresivo. No se han publicado benchmarks clásicos de robótica (como tasas de éxito en simulación o en el mundo real) en la información disponible, ni comparaciones numéricas con otros modelos de la misma categoría. El modelo relacionado `maskjp/pi05-relative-eef-all10-full-ft-30k` corresponde al mismo entrenamiento pero en el paso 30K, con una pérdida held-out de 0,0268, un 9 % peor que el checkpoint aquí descrito.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 4,14 B parámetros en bfloat16, lo que supone aproximadamente **8,3 GB** solo para los pesos. Con las activaciones (entrada de imágenes de tres cámaras y estados), se estima un consumo de **16-24 GB** de VRAM para inferencia en tiempo real.
- **GPU recomendadas**: tarjetas con al menos 16 GB de VRAM, como **RTX 4080, RTX 4090, A100 40GB o H100 80GB**. Para una latencia baja en control real, se recomienda una GPU de gama alta (A100/H100).
- **¿Cabe en GPU de consumo?**: sí, es viable en una RTX 4090 (24 GB) o incluso en una RTX 4080, siempre que se use carga en bfloat16 y se optimice el tamaño de lote o la resolución de imagen.
- **Opciones de despliegue**: el modelo se integra con la librería **LeRobot** mediante `PI05Policy.from_pretrained(...)`. No se mencionan implementaciones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo de texto.
- **Latencia y throughput**: no disponibles en la información provista. Al ser un modelo de visión y acción con chunk_size de 50, la latencia dependerá del hardware y del preprocesado de imágenes.

## Comparativa con modelos similares

| Modelo | Datos | Paso | Pérdida held-out | Diferencias clave |
|---|---|---|---|---|
| `maskjp/pi05-relative-eef-all10-full-ft-10k` (este) | 10 datasets / 1.499 episodios | 10K | **0,0245** | Mejor checkpoint del run; acciones relativas |
| `maskjp/pi05-relative-eef-all10-full-ft-30k` | 10 datasets / 1.499 episodios | 30K | 0,0268 | Mismo entrenamiento pero en paso 30K, peor generalización |
| `maskjp/pi05-relative-eef-full-ft` | 7 datasets / 949 episodios | no indicado | no indicado | Ronda anterior, con menos datos; no es sustituible de forma directa |
| `lerobot/pi05_base` | datos del modelo base | no aplica | no disponible | Modelo base sin fine-tuning, usado como inicialización |

La principal ventaja de este checkpoint frente a alternativas del mismo autor es que se ha seleccionado por su **mínimo de pérdida validada**, mientras que otros son puntos intermedios o de una ronda con menos tareas. La licencia Apache 2.0 permite el uso comercial sin restricciones, a diferencia de otros modelos de robótica con licencias más restrictivas.

## Limitaciones y advertencias

- **Sobreajuste**: la pérdida held-out comienza a subir después del paso 10K; usar un checkpoint posterior empeoraría el rendimiento. El propio autor advierte de ello y recomienda este paso concreto.
- **Desequilibrio del dataset**: las cuatro tareas más grandes concentran ~82 % de los fotogramas, por lo que el modelo puede tener peor rendimiento en tareas poco representadas (como "place the green cup on the table", con solo 50 episodios).
- **Alucinación de acciones**: al ser un modelo de política, puede generar acciones incorrectas si la observación no coincide con las tareas del entrenamiento. No se han documentado tasas de error en el mundo real.
- **Idiomas**: el soporte de lenguaje se limita a las instrucciones en inglés de los datasets; no se reportan capacidades multilingües.
- **Contexto**: no es un modelo de texto; su "contexto" se restringe a un chunk de 50 pasos de acción, lo que puede limitar la planificación a largo plazo.
- **Dependencia de datos específicos**: el modelo está entrenado con un brazo u850 y una base móvil concretos; su transferencia a otros robots requeriría recalibrar el espacio del efector y el estado de entrada.
- **Aviso sobre el flujo de despliegue**: el `config.json` incluido ha sido modificado quitando campos de entrenamiento (`vision_encoder_lr_multiplier`, `state_in_prompt`) para compatibilidad con LeRobot estándar. Es importante respetar la advertencia sobre la metainformación de los datasets, ya que la estructura aplanada evita la relativización silenciosa de la pinza.

## Enlaces

- HuggingFace (modelo principal): https://huggingface.co/maskjp/pi05-relative-eef-all10-full-ft-10k
- HuggingFace (ronda anterior, 7 datasets): https://huggingface.co/maskjp/pi05-relative-eef-full-ft
- HuggingFace (checkpoint de 15K de la ronda anterior): https://huggingface.co/maskjp/pi05-relative-eef-full-ft-15k
- HuggingFace (modelo base): https://huggingface.co/lerobot/pi05_base
