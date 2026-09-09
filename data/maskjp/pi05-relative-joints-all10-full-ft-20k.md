# maskjp/pi05-relative-joints-all10-full-ft-20k

## Resumen

pi0.5-relative-joints-all10-full-ft-20k es un modelo de política robótica (VLA) desarrollado por maskjp mediante un ajuste completo (full fine-tune) del modelo base lerobot/pi05_base. Está especializado en control de un brazo robótico u850 montado sobre una base móvil, con 11 tareas de manipulación condicionadas por lenguaje natural. El modelo tiene 4.143.404.816 parámetros (4.14B) y se ha afinado durante 20.000 pasos de una ejecución de 100.000, alcanzando en ese punto la mínima pérdida de validación (0.0237) sobre un conjunto de datos retenido del 5% de los episodios.

La relevancia de este checkpoint reside en que emplea acciones relativas al estado de observación al inicio de cada chunk, mejorando la consistencia en tareas de largo horizonte, y en que los pesos publicados corresponden al mejor punto de validación, no al último paso. El modelo está pensado para entornos de investigación y desarrollo de manipulación robótica, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje-acción (VLA), denso, basado en lerobot/pi05_base |
| Parámetros totales | 4.143.404.816 (4.14B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bfloat16, sin cuantización documentada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5, un modelo denso de 4.14B parámetros que combina un codificador de visión, un modelo de lenguaje y un experto de acciones. El ajuste es completo: se actualizan todos los módulos (visión, lenguaje y experto de acciones), con 4.14B parámetros entrenables. La política genera acciones de 10 dimensiones (6 articulaciones del brazo, gripper y 3 dimensiones de base móvil: x, y, yaw) en formato absoluto, aunque internamente usa acciones relativas al estado de observación al inicio de cada chunk.

El entrenamiento se ha realizado sobre 11 tareas condicionadas por lenguaje, con 1.499 episodios y 3.089.476 frames (17,2 horas a 50 fps), grabadas con un solo brazo u850 sobre una base móvil y tres cámaras (izquierda, derecha y muñeca). La mezcla de datos está sesgada: las cuatro tareas principales suponen aproximadamente el 82% de los frames, y el muestreo es uniforme por frames sin rebalanceo. Se empleó normalización por cuantiles sobre los offsets relativos, una ventana de chunk de 50 pasos y 10 pasos de acción por predicción, con precisión bfloat16 y gradient checkpointing. El checkpoint de 20K corresponde al mínimo de pérdida de validación de la ejecución completa.

## Capacidades

- Ejecución de tareas de manipulación robótica en un entorno doméstico: recoger objetos, abrir puertas, limpiar superficies, colocar objetos en mesas.
- Control conjunto de un brazo antropomórfico de 6 DOF, gripper y base móvil (x, y, yaw) mediante una única salida de 10 dimensiones.
- Comprensión multimodal a partir de tres cámaras (izquierda, derecha y muñeca) para percibir la escena.
- Condicionamiento por instrucciones en lenguaje natural para seleccionar la tarea a ejecutar.
- Producción de acciones absolutas en el bucle de control, con conversión interna en la que 9 de las 10 dimensiones son relativas y el gripper se trata como absoluto.
- No se ha documentado soporte de tool calling ni de generación de texto libre: es exclusivamente un policy de control robótico.

## Casos de uso

- Automatización de logística ligera: el modelo puede recoger bolsas de la compra del suelo y colocarlas sobre una mesa, tarea en la que ha sido entrenado con 200 episodios y 477.058 frames. Se integraría en un brazo móvil mediante LeRobot, pasando imágenes de las cámaras y la instrucción en lenguaje natural.
- Manipulación de bebidas en una cocina: identificar y coger una taza azul o una botella verde de una mesa, o abrir la nevera y coger una bebida del interior. El modelo discrimina entre objetos aprendidos y ejecuta la trayectoria adecuada.
- Limpieza de superficies: fregar una mesa con un paño verde. Este tipo de tarea requiere control fino de la muñeca y una trayectoria de barrido, que el modelo ha aprendido en el subconjunto de limpieza.
- Apertura de puertas y navegación interior: abrir una puerta y desplazarse al interior gracias al control simultáneo del brazo y la base móvil. Es adecuado porque las acciones de base se combinan con las articulaciones del brazo en un único vector de 10 dimensiones.
- Colocación de objetos en posiciones concretas: mover un croissant a un plato vacío o colocar una taza verde sobre la mesa. El modelo predice los siguientes 10 pasos de acción (chunk) para alcanzar el objetivo.
- Recogida selectiva de objetos en entornos desordenados: coger una bolsa de la compra del suelo, una taza, una botella, etc., condicionado por la instrucción en lenguaje natural. Esto permite desplegar el modelo en tareas de preparación de pedidos en almacenes.
- Evaluación de modelos de política en investigación: este checkpoint sirve como referencia para analizar cómo la elección del paso de entrenamiento afecta a la pérdida de validación, ya que demuestra que el mínimo no coincide con el último paso de la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica de rendimiento publicada es la evolución de la pérdida de validación durante el fine-tuning, extraída de la model card. No se trata de un benchmark de éxito en tareas físicas.

| Paso | Pérdida de validación |
|---|---|
| 5K | 0.0263 |
| 10K | 0.0238 |
| 15K | 0.0245 |
| 20K | 0.0237 (mínimo) |
| 25K | 0.0256 |
| 30K | 0.0266 |

## Requisitos de hardware

- VRAM estimada para inferencia: los 4.14B parámetros en bfloat16 ocupan aproximadamente 8,3 GB. Considerando las activaciones y buffers de imágenes, se estima que se necesitan al menos 16 GB de VRAM para una ejecución estable.
- GPU recomendadas: no se han publicado requisitos específicos. Para 16-24 GB de VRAM, una NVIDIA RTX 4090 (24 GB) sería adecuada; en servidores, una GPU con 40 GB o más ofrecería margen.
- En GPUs de consumo, podría ejecutarse en una RTX 4090 o superior. GPUs con 12 GB o menos probablemente no sean suficientes sin cuantización, que no está documentada.
- Opciones de despliegue: la vía documentada es la librería LeRobot de HuggingFace, usando `PI05Policy.from_pretrained`. No se han documentado integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Pasos | Datos | Pérdida de validación | Parámetros | Licencia |
|---|---|---|---|---|---|
| maskjp/pi05-relative-joints-all10-full-ft-20k (este) | 20K | 11 tareas, 1499 episodios | 0.0237 | 4.14B | Apache-2.0 |
| maskjp/pi05-relative-joints-all10-full-ft-30k | 30K | 11 tareas, 1499 episodios | 0.0266 | 4.14B | Apache-2.0 |
| maskjp/pi05-relative-joints-full-ft | No disponible | 7 tareas, 949 episodios | No disponible | No disponible | Apache-2.0 |

El checkpoint de 20K es el mejor punto de validación de su ejecución, mientras que el de 30K muestra una pérdida mayor. La versión anteriores de 7 datasets no es directamente reemplazable por tener datos de entrenamiento distintos.

## Limitaciones y advertencias

- El modelo está especializado en un único entorno de robot (brazo u850 sobre base móvil) y 11 tareas; no se ha validado la transferencia a otros brazos o escenas.
- La distribución de datos de entrenamiento está muy desbalanceada: las cuatro tareas principales suponen aproximadamente el 82% de los frames, por lo que el rendimiento en tareas con menos datos puede ser inferior (por ejemplo, colocar una taza verde cuenta solo con 50 episodios).
- El checkpoint de 20K es el mínimo de pérdida de validación; los pasos posteriores muestran una pérdida mayor, lo que indica sobreajuste al conjunto de entrenamiento.
- Solo se ha evaluado mediante pérdida de validación, no mediante métricas de éxito en tareas físicas, por lo que el rendimiento real en el robot no está cuantificado.
- La puesta en producción exige que el sistema de percepción y control coincida con las especificaciones del dataset; su uso en entornos no vistos puede generar acciones incoherentes o peligrosas.
- El gripper se trata como absoluto en la representación relativa, lo que puede diferir de otros modelos de la familia y requiere mantener la configuración del procesador.
- El config.json ha sido modificado para eliminar campos de entrenamiento, lo que puede provocar diferencias de comportamiento respecto a la bifurcación original de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-20k
- Checkpoint de 30K del mismo run: https://huggingface.co/maskjp/pi05-relative-joints-all10-full-ft-30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Versión anterior (7 datasets): https://huggingface.co/maskjp/pi05-relative-joints-full-ft
- Checkpoint de 15K de la versión anterior: https://huggingface.co/maskjp/pi05-relative-joints-full-ft-15k
