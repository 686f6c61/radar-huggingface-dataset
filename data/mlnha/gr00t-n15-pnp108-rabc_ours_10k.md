# mlnha/gr00t-n15-pnp108-rabc_ours_10k

## Resumen

`mlnha/gr00t-n15-pnp108-rabc_ours_10k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de robótica de NVIDIA, afinado para la tarea de manipulación PickPlaceCounterToCabinet del simulador RoboCasa365. El autor, `mlnha`, lo publica como parte de un estudio sobre estimadores de progreso de tarea aprendidos como señal de entrenamiento para clonación de comportamiento (BC). No es un modelo generalista: es un artefacto experimental orientado a reproducir y comparar resultados dentro de esa línea de investigación.

La relevancia es acotada pero concreta: el checkpoint alcanza 33/50 de éxito en simulación (seeds 2000–2049) y 65/100 en la evaluación completa, con un entrenamiento de 10 000 pasos sobre 108 rollouts generados por GR00T checkpoint-120000, de los cuales 72 fueron exitosos. El método empleado es RA-BC (ARM) ponderado por el estimador de progreso del autor, partiendo del checkpoint de preentrenamiento de RoboCasa (80 000 pasos).

El repositorio ocupa 37,9 GB e incluye pesos en safetensors, logs de entrenamiento y eventos de TensorBoard, pero no los estados del optimizador. La model card no documenta arquitectura, número de parámetros, longitud de contexto ni licencia, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de GR00T N1.5; no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de política robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica como modelo conversacional) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `gr00t`; logs en TensorBoard) |

## Arquitectura y entrenamiento

El checkpoint parte del preentrenamiento `robocasa/robocasa365_checkpoints` de GR00T-N1.5 en su paso 80 000 y se afina con clonación de comportamiento ponderada. El esquema de ponderación es RA-BC (ARM) modulado por un estimador de progreso de tarea propio del autor ("ours"), que asigna pesos a las transiciones según el avance estimado hacia el objetivo. El conjunto de datos, denominado `pnp108`, contiene 108 rollouts de GR00T checkpoint-120000 sobre PickPlaceCounterToCabinet en formato LeRobot v2.1, de los cuales 72 son exitosos. El embodiment se declara como `new_embodiment`.

La configuración de entrenamiento es explícita: 1 GPU, batch de 64, learning rate 3e-5 con schedule coseno y warmup de 0,05, semilla 42. Se publican cinco checkpoints intermedios (2000, 4000, 6000, 8000 y 10 000 pasos) junto con `train.log` y el directorio `runs/` de TensorBoard. Los estados del optimizador no se incluyen, lo que limita la reanudación exacta del entrenamiento. La model card no describe innovaciones arquitectónicas adicionales (atención, decodificación especulativa u otras); el interés técnico reside en la señal de ponderación, no en cambios de arquitectura.

## Capacidades

- Control robótico de manipulación: ejecuta la política de PickPlaceCounterToCabinet en el simulador RoboCasa365.
- Clonación de comportamiento condicionada por observaciones y estado de la tarea, en el formato de embodiment declarado (`new_embodiment`).
- Evaluación reproducible en simulación con semillas de escena y de política fijadas (escenas 2000+, política 1).
- Punto de partida para experimentos de ponderación por progreso de tarea (RA-BC/ARM) sobre GR00T N1.5.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de RA-BC: cargar los checkpoints 2000–10000 y comparar curvas de éxito frente a variantes de ponderación, usando `runs/` para contrastar con los logs publicados.
- Estudio de estimadores de progreso: emplear este checkpoint como referencia "ours" frente a estimadores alternativos en la misma tarea y dataset `pnp108`.
- Evaluación en RoboCasa365: medir éxito con las semillas documentadas (2000–2049, política 1) para obtener cifras comparables a las de la model card (33/50 y 65/100).
- Ablación de datos de entrenamiento: contrastar el efecto de entrenar solo con los 72 rollouts exitosos frente a mezclas con fallos, reutilizando el formato LeRobot v2.1.
- Inicialización para nuevas tareas de manipulación: partir del checkpoint afinado en lugar del preentrenamiento de 80 000 pasos cuando el dominio sea pick-and-place sobre encimera y armario.
- Docencia e investigación en robótica simulada: usar el par dataset/checkpoint como ejemplo completo de pipeline BC con ponderación por progreso, dado que se publican datos, logs y pesos.

## Benchmarks y rendimiento

Resultados de éxito en simulación RoboCasa365 (escenas seed 2000+, política seed 1), según la model card:

| Checkpoint | Éxito (seeds 2000–2049) | Éxito (todas las semillas) |
|---|---|---|
| checkpoint-2000 | 31/50 | no disponible |
| checkpoint-4000 | 30/50 | no disponible |
| checkpoint-6000 | 28/50 | no disponible |
| checkpoint-8000 | 30/50 | no disponible |
| checkpoint-10000 | 33/50 | 65/100 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repositorio pesa 37,9 GB, lo que da una cota inferior del orden de decenas de GB en precisión nativa.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con 1 GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio hace improbable el despliegue en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: librería `gr00t` (indicada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlnha/gr00t-n15-pnp108-rabc_ours_10k` | no disponible | no disponible | 33/50 (seeds 2000–2049); 65/100 | no disponible | Hugging Face, 0 descargas |
| GR00T N1.5 (preentrenamiento RoboCasa 80k) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Referenciado como punto de partida |
| GR00T checkpoint-120000 (generador de `pnp108`) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Referenciado como generador de rollouts |

No se dispone de datos de benchmarks ni de especificaciones de los modelos de referencia en la información proporcionada, por lo que la comparación cuantitativa queda limitada a los resultados del propio checkpoint.

## Limitaciones y advertencias

- Checkpoint de investigación: sin licencia declarada, lo que impide determinar condiciones de uso comercial.
- Entrenado para una única tarea (PickPlaceCounterToCabinet) y un único embodiment (`new_embodiment`); no generaliza a otras tareas sin reentrenamiento.
- Evaluación exclusivamente en simulación (RoboCasa365); no hay evidencia de transferencia a robot real.
- Dataset pequeño (108 rollouts, 72 exitosos) y una sola semilla de entrenamiento (42), lo que limita la robustez estadística de las conclusiones.
- Sin estados del optimizador: no es posible reanudar el entrenamiento de forma exacta.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas aplicables; la model card no los documenta.
- Repositorio de 37,9 GB sin formatos cuantizados publicados, lo que encarece el almacenamiento y el despliegue.
- 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-rabc_ours_10k
