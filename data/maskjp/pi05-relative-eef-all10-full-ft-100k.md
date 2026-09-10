# maskjp/pi05-relative-eef-all10-full-ft-100k

## Resumen

`pi05-relative-eef-all10-full-ft-100k` es un modelo de políticas robóticas (VLA, vision-language-action) desarrollado por maskjp, resultado de un fine-tuning completo del modelo base [`lerobot/pi05_base`](https://huggingface.co/lerobot/pi05_base). Está diseñado para controlar un brazo robótico u850 montado sobre una base móvil, con tres cámaras (izquierda, derecha y muñeca), resolviendo tareas de manipulación condicionadas por instrucciones en lenguaje.

La particularidad de este checkpoint es que las acciones se expresan **relativas al estado de observación al inicio de cada chunk**, en el espacio del efector final con 13 dimensiones (posición xyz, rotación 6D, gripper y base). Es un full fine-tune de 4.143 millones de parámetros (4,14B), entrenado con 1499 episodios y 3.089.476 frames (17,2 horas a 50 fps) sobre 11 tareas. El repo contiene los pesos del paso 100K de una ejecución de 100K pasos, aunque la pérdida en validación indica que el óptimo se alcanzó en el paso 10K (0.0245) y que en el paso 100K la pérdida sube a 0.0436, un 78% por encima del mínimo. Este checkpoint se publica para comparaciones step-matched con la ronda anterior de 30K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (PI05) |
| Parametros totales | 4.143.404.816 (~4,14B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se somete a un fine-tuning completo de todos los expertos (visión, lenguaje y acción), con 4,14B de parámetros entrenables. La representación de acciones es relativa: mediante el transform `RelativeActionsProcessorStep` se resta el estado de anclaje al inicio de cada chunk para todas las dimensiones excepto el gripper, que se mantiene absoluto porque es un comando y no una postura. Esto se aplica en tiempo de ejecución como un transform de procesador, no como una reescritura de datos, de modo que la política emite acciones absolutas de forma consistente en entrenamiento, evaluación e inferencia.

La normalización es de tipo `QUANTILES`, calculada sobre los offsets relativos (no sobre los objetivos absolutos) con chunks de 50. La rotación del efector final se representa en su forma 6D continua (dos primeras columnas de la matriz de rotación), evitando los saltos de 2π que aparecerían con axis-angle. El entrenamiento usó un lote efectivo de 63 (21 por rank × 3 ranks), una tasa de aprendizaje de 2.5e-5 con decaimiento coseno hasta 2.5e-6 durante 100K pasos, 1000 pasos de warmup, y la torre de visión con multiplicador de lr al 0.1x. La precisión fue bfloat16 con gradient checkpointing activado y seed 1000. Los datos de entrenamiento comprenden 11 tareas condicionadas por lenguaje, con una distribución sesgada donde las cuatro tareas más grandes representan aproximadamente el 82% de los frames.

## Capacidades

- Control robótico de brazo y base móvil: genera acciones de 13 dimensiones (posición del efector xyz, rotación 6D, gripper y base x/y/yaw) a partir de observaciones visuales y comandos en lenguaje.
- Manipulación de objetos en entornos domésticos e industriales: abrir y cerrar puertas de nevera, recoger objetos del suelo o de mesas, colocar objetos sobre superficies, limpiar mesas.
- Condicionamiento por lenguaje natural: capaz de interpretar instrucciones como "grab a drink from the fridge" o "move the croissant to the empty plate".
- Percepción multi-cámara: integra información de tres cámaras (izquierda, derecha y muñeca) para entender la escena.
- Ejecución de acciones en chunks: con `chunk_size` de 50 y `n_action_steps` de 10, genera secuencias de acciones con anticipación.
- No soporta tool calling ni funciones de agente en el sentido de los LLM: es un modelo de políticas para control robotico.

## Casos de uso

- **Apertura de puertas y neveras**: el modelo puede ejecutar la secuencia completa de abrir una puerta y moverse al interior, o abrir la puerta de una nevera, gracias al condicionamiento por lenguaje y a la percepción visual de las tres cámaras. Es adecuado para entornos domésticos o de almacén donde el robot necesita interactuar con obstáculos.

- **Recogida de objetos en entornos no estructurados**: puede recoger bolsas de supermercado del suelo, botellas o tazas de una mesa, y colocarlas en otro lugar. La representación de acciones relativas al inicio del chunk y la rotación 6D estable permiten manejar posiciones variables con mayor robustez.

- **Tareas de preparación de alimentos**: el checkpoint fue entrenado con la tarea de mover un croissant a un plato vacío, lo que sugiere aplicaciones en cocinas automatizadas o en robótica de servicio donde se manipulan objetos pequeños y delicados.

- **Limpieza automatizada**: la tarea de limpiar una mesa con un paño verde muestra capacidad para realizar trayectorias de barrido. Puede desplegarse en entornos hosteleros o de mantenimiento industrial.

- **Manipulación en almacenes**: recoger bolsas de víveres del suelo y colocarlas en una mesa, o abrir la puerta de una nevera para colocar o retirar bebidas, son tareas directamente aplicables a logística de picking y reposición.

- **Robótica asistencial**: el uso de una base móvil y un brazo con tres cámaras permite aplicaciones de asistencia en domicilios, como coger objetos de uso cotidiano, abrir puertas o limpiar superficies.

- **Investigación en aprendizaje por imitación**: al disponer de pesos intermedios (100K) y comparables con otras rondas (10K, 30K), sirve como referencia para estudiar la influencia del número de pasos y del tamaño de datos en el rendimiento de fine-tunes de PI05.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo es un VLA para robótica y su evaluación se reporta mediante pérdida en un conjunto de validación held-out (5% de los episodios, 77 de 1499, de las 11 tareas). La tabla de evolución de la pérdida es:

| Paso | eval_loss |
|---|---|
| 5K | 0.0264 |
| 10K | 0.0245 (minimo) |
| 15K | 0.0249 |
| 20K | 0.0251 |
| 25K | 0.0259 |
| 30K | 0.0268 |
| 35K | 0.0274 |
| 40K | 0.0291 |
| 45K | 0.0304 |
| 50K | 0.0321 |
| 55K | 0.0343 |
| 60K | 0.0358 |
| 65K | 0.0377 |
| 70K | 0.0381 |
| 75K | 0.0400 |
| 80K | 0.0407 |
| 85K | 0.0413 |
| 90K | 0.0419 |
| 95K | 0.0432 |
| 100K | 0.0436 |

El mínimo se alcanza en el paso 10K con 0.0245. A partir de ahí la pérdida aumenta de forma monotona, lo que indica sobreentrenamiento progresivo. El checkpoint de 100K publicado aquí tiene una pérdida un 78% superior al mínimo; los pesos de 10K son preferibles para su uso en producción. No se dispone de métricas de éxito en tareas, tasas de acierto ni comparativas con otros modelos en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.143.404.816 parámetros en bfloat16 y su repo pesa 9,4 GB. Los pesos ocupan aproximadamente 8,3 GB, por lo que la inferencia con activaciones y las salidas del modelo requieren un mínimo de 12 a 16 GB de VRAM, dependiendo del batch size y la resolución de entrada. No se proporciona una cifra oficial.
- GPU recomendadas: por el tamaño del modelo, se recomiendan GPUs con al menos 16 GB de VRAM, como RTX 4090 (24 GB), A100 40GB o H100 (80 GB). En GPUs de 12 GB puede ser necesario aplicar cuantizacion adicional o reducir el chunk size, aunque no hay guias oficiales.
- Si cabe en consumer GPU: sí, en una RTX 4090 (24 GB) deberia caber sin problemas. Para GPUs de 16 GB, como una RTX 4080, es probable que funcione pero con margen ajustado.
- Opciones de despliegue: el modelo se carga con la libreria LeRobot mediante `PI05Policy.from_pretrained(...)`. No se mencionan soportes para vLLM, llama.cpp, TGI ni Ollama, ya que no es un LLM generativo de texto, sino un modelo de políticas roboticas. El despliegue se realiza integrandolo en un stack de control robotico que provea observaciones y reciba acciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Datasets | Episodios | Paso | eval_loss | Notas |
|---|---|---|---|---|---|
| `pi05-relative-eef-all10-full-ft-100k` (este repo) | 10 (all10) | 1499 | 100K | 0.0436 | 11 tareas, 3.089.476 frames |
| `maskjp/pi05-relative-eef-all10-full-ft-10k` | 10 (all10) | 1499 | 10K | 0.0245 | Mismo arm, mejor checkpoint de la ejecucion |
| `maskjp/pi05-relative-eef-full-ft-30k` | 7 (ronda anterior) | 949 | 30K | no disponible | Ronda previa, no drop-in replacement |
| `lerobot/pi05_base` | - | - | - | no disponible | Modelo base sin fine-tune |

Los tres primeros comparten la representación de acciones relativas y el espacio del efector final, pero el conjunto de datos difiere: el modelo 30K se entrenó con 7 datasets y 949 episodios, mientras que este y su gemelo 10K usan 10 datasets completos (all10) con 1499 episodios. Para evaluar el efecto del número de pasos se compara este checkpoint de 100K con el de 10K, siendo el de 10K claramente superior en pérdida held-out. El modelo base `pi05_base` no está fine-tuneado y no tiene pérdida reportada.

## Limitaciones y advertencias

- Los pesos publicados no son los óptimos: el checkpoint de 100K tiene una pérdida held-out un 78% por encima del mínimo de la ejecución (0.0436 vs 0.0245). Para cualquier uso real se recomienda emplear el checkpoint de 10K, también publicada por el autor.
- El entrenamiento muestra claros signos de sobreajuste a partir del paso 10K, con un incremento monotono de la pérdida de validación. No se recomienda continuar el fine-tune más allá del mínimo.
- Sesgo en los datos de entrenamiento: la mezcla está fuertemente sesgada hacia las cuatro tareas más grandes, que representan alrededor del 82% de los frames, y el muestreo es uniforme sobre frames sin rebalanceo. Esto puede degradar el rendimiento en las tareas con menos datos, como "place the green cup on the table" (50 episodios).
- La generalización a tareas fuera de las 11 entrenadas no está evaluada. No se aportan métricas de éxito en tareas ni tests de robustez ante variaciones de iluminación, desorden o cambios de posición.
- Los idiomas soportados no están especificados. Los comandos de las tareas están en inglés, por lo que el modelo probablemente funcione solo con instrucciones en inglés, aunque no se confirma.
- El `config.json` incluido ha sido modificado (se han eliminado `vision_encoder_lr_multiplier` y `state_in_prompt`) para que sea compatible con LeRobot de serie. Esto no afecta a la inferencia, pero cualquier intento de continuar el entrenamiento con la configuración original puede fallar.
- El modelo no es un LLM y no genera texto: las capacidades de tool calling, generación de código, razonamiento abstracto o conversación no aplican. Su salida son acciones roboticas de 13 dimensiones.
- El formato de precisión es bfloat16; no se ofrecen cuantizaciones adicionales en el repositorio. Para desplegar en GPUs con menos memoria habría que cuantizarlo externamente, lo que puede degradar el rendimiento de las acciones.

## Enlaces

- Repositorio HuggingFace: [maskjp/pi05-relative-eef-all10-full-ft-100k](https://huggingface.co/maskjp/pi05-relative-eef-all10-full-ft-100k)
- Modelo base: [lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- Checkpoint relacionado (10K, mejor rendimiento): [maskjp/pi05-relative-eef-all10-full-ft-10k](https://huggingface.co/maskjp/pi05-relative-eef-all10-full-ft-10k)
- Checkpoint relacionado (ronda anterior 30K): [maskjp/pi05-relative-eef-full-ft-30k](https://huggingface.co/maskjp/pi05-relative-eef-full-ft-30k)
