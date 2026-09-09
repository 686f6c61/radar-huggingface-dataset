# maskjp/pi05-relative-eef-all10-full-ft-30k

## Resumen

`maskjp/pi05-relative-eef-all10-full-ft-30k` es un modelo de robótica de tipo VLA (Vision-Language-Action) basado en `lerobot/pi05_base`, desarrollado por el usuario `maskjp` y publicado en HuggingFace. Está diseñado para controlar un brazo robótico sobre una base móvil mediante acciones expresadas en el espacio del efector final, con 13 dimensiones que incluyen posición 3D, rotación 6D, apertura de pinza y movimiento de la base. El modelo se entrenó con un fine-tune completo sobre 10 datasets distintos que abarcan 11 tareas de manipulación condicionadas por lenguaje natural, como recoger objetos, abrir una puerta o limpiar una mesa.

El checkpoint publicado corresponde al paso 30K de un run de 100K, con una métrica de loss en datos held-out que está un 9% por encima del mínimo del run (alcanzado en el paso 10K). Por tanto, estos pesos no son los mejores disponibles para el mismo esquema de entrenamiento, pero se publican para permitir comparaciones step-matched con la ronda anterior. El modelo tiene 4.14 mil millones de parámetros y utiliza una representación de acciones relativas al estado de observación del inicio de cada chunk, con una normalización calculada sobre los offsets relativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA (Vision-Language-Action), basado en pi0.5 |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica; chunk_size = 50, n_action_steps = 10) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones de tareas en lenguaje natural; idioma no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye config.json y meta/) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de `lerobot/pi05_base`, es decir, se actualizan todos los parámetros (visión, lenguaje y experto de acciones), lo que da un total de 4.14B parámetros entrenables. La entrada consta de imágenes de tres cámaras (izquierda, derecha y muñeca) junto con una instrucción en lenguaje natural, y la salida es una secuencia de acciones de 13 dimensiones en el espacio del efector final: `eef_x`, `eef_y`, `eef_z`, `eef_xx`, `eef_xy`, `eef_xz`, `eef_yx`, `eef_yy`, `eef_yz`, `gripper`, `base_x`, `base_y`, `base_yaw`. La rotación del efector final se representa en su forma continua 6D, es decir, las dos primeras columnas de la matriz de rotación, en lugar de axis-angle, para evitar discontinuidades arbitrarias de signo en la orientación.

El entrenamiento utiliza `use_relative_actions=true` con `relative_exclude_joints=["gripper"]`. Esta es una transformación de procesador, no una reescritura de datos: `RelativeActionsProcessorStep` resta el estado ancla al comienzo del chunk durante el entrenamiento, y `AbsoluteActionsProcessorStep` lo añade de nuevo en la salida, por lo que el modelo emite acciones absolutas tanto en entrenamiento como en inferencia. La normalización es `QUANTILES`, calculada a partir de los offsets relativos sobre chunks de 50, no de los objetivos absolutos, ya que las estadísticas absolutas dejarían la mayoría de los objetivos fuera del rango `[-1, 1]`.

Los datos de entrenamiento constan de 1.499 episodios y 3.089.476 frames (17,2 horas a 50 fps) distribuidos en 11 tareas, recogidos con un brazo u850 sobre una base móvil. La mezcla está sesgada: las cuatro tareas más grandes representan alrededor del 82% de los frames, y el muestreo es uniforme sobre frames, sin rebalanceo. El recipe usa un batch efectivo de 63 (21 por rank × 3 ranks), una learning rate de 2.5e-5 con decaimiento coseno hasta 2.5e-6 a lo largo de 100K pasos y 1.000 pasos de warmup, con el vision tower a una tasa 0.1×. La precisión es bfloat16 con gradient checkpointing, y el seed es 1000.

## Capacidades

- Generación de acciones de bajo nivel para manipulación robótica: el modelo produce un vector de 13 dimensiones que controla posición (x, y, z), rotación (6D), pinza y base móvil.
- Condicionamiento por lenguaje natural: permite especificar tareas como "grab a drink from the fridge", "open the door and move inside" o "clean the table with the green towel".
- Control multi-cámara: procesa simultáneamente imágenes de tres cámaras (izquierda, derecha y muñeca) para percibir la escena.
- Acciones relativas: el modelo está entrenado con offsets relativos al estado inicial de cada chunk, aunque en inferencia emite acciones absolutas, lo que mejora la consistencia en la trayectoria.
- Manipulación de objetos diversos: recoger bolsas, tazas, botellas, cruasanes, abrir neveras y puertas, limpiar superficies, etc.
- No soporta tool calling, generación de código o razonamiento simbólico; su dominio es exclusivamente el control robótico.

## Casos de uso

- Automatización de tareas domésticas: el modelo puede ejecutar secuencias como abrir la nevera y coger una bebida, gracias a su entrenamiento en tareas de manipulación con lenguaje natural y visión multi-cámara.
- Recogida y colocación de objetos (pick and place): permite agarrar objetos del suelo y colocarlos sobre una mesa, o mover un cruasán a un plato vacío, integrando el control de la pinza y la base.
- Navegación en entornos interiores: las dimensiones `base_x`, `base_y` y `base_yaw` permiten desplazar el robot móvil, por ejemplo para atravesar una puerta o moverse dentro de una habitación.
- Investigación en representaciones de acciones relativas: el modelo sirve como banco de pruebas para comparar el efecto de normalizar y transformer acciones en el espacio del efector final frente a representaciones absolutas.
- Análisis de dinámica de entrenamiento: al publicar checkpoints en pasos específicos (15K, 30K), permite estudiar cómo evoluciona la loss de generalización a lo largo del run y seleccionar el punto de parada óptimo.
- Despliegue con LeRobot: puede cargarse con `PI05Policy.from_pretrained` e integrarse en pipelines de control en tiempo real para robots con brazo u850 y base móvil, siempre que se respete la configuración de cámaras y la representación de acciones.
- Reproducción de estudios comparativos: el checkpoint es útil para replicar experimentos que necesiten un modelo entrenado en el mismo subconjunto de 10 datasets que el paso 10K, permitiendo comparaciones directas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque se trata de un modelo de robótica. La información proporcionada incluye una métrica de loss en datos held-out (5% de episodios por tarea, 77 de 1.499 episodios):

| step | eval_loss |
|---|---|
| 5K | 0.0264 |
| 10K | 0.0245 (minimo) |
| 15K | 0.0249 |
| 20K | 0.0251 |
| 25K | 0.0259 |
| 30K | 0.0268 |

El mínimo se alcanza en el paso 10K con una loss de 0.0245. El presente checkpoint (30K) tiene una loss de 0.0268, que es aproximadamente un 9% superior al mínimo, lo que indica que el modelo ha empeorado su generalización en datos held-out tras el paso óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 8,5–9,5 GB para el modelo, más el espacio para los tensores de entrada y los estados intermedios. En total, se recomienda al menos 12 GB para ejecutar con seguridad.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente para inferencia. Para entrenamiento o fine-tune completo se necesitaría una A100 40 GB o una H100, dadas las 4.14B parámetros entrenables y el uso de gradient checkpointing.
- En consumer GPU: el modelo cabe en una RTX 4090 (24 GB) o superior. En GPUs con 16 GB podría intentarse con cuantización, pero no se ofrecen pesos cuantizados.
- Opciones de despliegue: únicamente se documenta la integración con la librería LeRobot (`PI05Policy.from_pretrained`). No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Datos | Paso | Held-out loss | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `maskjp/pi05-relative-eef-all10-full-ft-30k` | 4.14B | 10 datasets / 1.499 episodios | 30K | 0.0268 | Apache-2.0 | HuggingFace |
| `maskjp/pi05-relative-eef-all10-full-ft-10k` | 4.14B | 10 datasets / 1.499 episodios | 10K | 0.0245 (minimo) | Apache-2.0 | HuggingFace |
| `maskjp/pi05-relative-eef-full-ft-30k` | 4.14B | 7 datasets / 949 episodios | 30K | No disponible | Apache-2.0 | HuggingFace |
| `lerobot/pi05_base` | 4.14B | Preentrenamiento | - | No disponible | Apache-2.0 | HuggingFace |

Los tres primeros son fine-tunes con el mismo esquema de acciones relativas, pero difieren en los datos y en el paso de entrenamiento. El modelo de 30K de la ronda completa no es un reemplazo directo del anterior de 7 datasets; los conjuntos de datos son distintos.

## Limitaciones y advertencias

- Los pesos del paso 30K no son los mejores del run: la loss held-out es un 9% superior al mínimo (10K), por lo que para aplicaciones reales conviene preferir el checkpoint de 10K.
- La mezcla de datos está fuertemente sesgada: las cuatro tareas más grandes concentran aproximadamente el 82% de los frames, sin rebalanceo, lo que puede provocar un sobreajuste a esas tareas y una peor generalización en las tareas minoritarias.
- El modelo está especializado en un brazo u850 sobre base móvil con tres cámaras; transferirlo a otro robot o configuración requiere un nuevo fine-tune o adaptación, y la representación de acciones debe mantenerse idéntica.
- La representación de acciones relativas depende de un procesador que resta y sumas estados ancla. Si se usa con datasets que almacenan nombres de dimensiones agrupados como `{"motors": [...]}`, la librería LeRobot podría relativizar silenciosamente el gripper, que en este modelo es absoluto.
- No se proporcionan datos de seguridad ni de robustez frente a distracciones, cambios de iluminación o condiciones ambientales adversas.
- La información de idiomas no está documentada; las instrucciones en lenguaje parecen estar en inglés, y no se garantiza soporte multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y la atribución; además, no hay garantías de soporte ni responsabilidad por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/pi05-relative-eef-all10-full-ft-30k
- Checkpoint de 10K (mismo esquema): https://huggingface.co/maskjp/pi05-relative-eef-all10-full-ft-10k
- Ronda anterior (7 datasets, 30K): https://huggingface.co/maskjp/pi05-relative-eef-full-ft-30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint 15K de la ronda anterior: https://huggingface.co/maskjp/pi05-relative-eef-full-ft-15k
- Otro checkpoint publicado: https://huggingface.co/maskjp/pi05-relative-eef-full-ft
