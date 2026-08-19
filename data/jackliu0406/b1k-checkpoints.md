# JackLiu0406/b1k-checkpoints

## Resumen

`JackLiu0406/b1k-checkpoints` es un checkpoint de meta-entrenamiento continuado sobre el modelo PiBehavior (pi0.5), la solución pública número uno del benchmark BEHAVIOR-1K, desarrollado por JackLiu0406. El modelo parte del checkpoint `IliaLarchenko/behavior_50t_checkpoint` y se entrena sobre cinco tareas del challenge set 2026, dos de las cuales (`dispose_of_glass` y `installing_a_modem`) están fuera del espacio original de 50 tareas, ampliando el espacio de tareas a 100 índices. Es un modelo de robótica de tipo vision-language-action (VLA) con 3.400 millones de parámetros, compuesto por un VLM Gemma 2B y un experto de acciones Gemma 300M, sin rama espacial ni entrada de profundidad (sin DA3).

La relevancia de este checkpoint reside en que demuestra cómo extender un modelo VLA preentrenado a nuevas tareas sin reentrenar desde cero, manteniendo los embeddings de tareas heredados y añadiendo filas nuevas para tareas desconocidas. El repositorio incluye el modelo final (`meta5_2026_224/step_19999`) y checkpoints de una extensión adicional, junto con tablas de condicionamiento ampliadas a 100 tareas y utilidades de carga específicas para restaurar checkpoints guardados en mallas multi-GPU. Es un recurso de investigación orientado a la robótica de manipulación en entornos domésticos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 / PiBehavior (VLM Gemma 2B + action expert Gemma 300M) |
| Parametros totales | 3.400 millones (3.4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (instrucciones en ingles presumiblemente, no declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Orbax/JAX (directorios `params/` y `train_state/`) |

## Arquitectura y entrenamiento

El modelo es un VLA basado en la arquitectura pi0.5, que combina un modelo de lenguaje visual Gemma 2B como codificador de observaciones e instrucciones, y un experto de acciones Gemma 300M que predice acciones de bajo nivel. No incorpora rama espacial ni datos de profundidad, siendo el checkpoint PiBehavior original sin modificaciones estructurales. El meta-entrenamiento se realizó sobre cinco tareas del dataset BEHAVIOR-1K 2026 (LeRobot v3.0) con video RGB pre-redimensionado a 224x224 píxeles, usando 200 episodios por tarea. Las tareas 0, 5 y 40 heredaron sus embeddings de tarea del modelo base, mientras que las tareas 76 y 77 se inicializaron con embeddings aleatorios y se entrenaron desde cero. El entrenamiento se ejecutó durante 20.000 pasos en una malla de 4 GPUs, con una extensión adicional a LR fijo de 1e-6. No se aplicó DA3 (data augmentation de tercera generación). Las estadísticas de normalización y el tokenizador rápido se mantienen byte-idénticos al upstream, con la salvedad de que las dimensiones de estado 0:3 (base_qvel) están normalizadas con estadísticas de 2025 mientras que los datos de 2026 usan el marco del robot, lo que puede afectar al comportamiento de la velocidad base.

## Capacidades

- Control de manipulacion robotica de bajo nivel: predice 32 dimensiones de accion (brazo, base y pinza) a partir de observaciones RGB y una instruccion en lenguaje natural.
- Seguimiento de instrucciones en lenguaje natural para tareas domesticas simuladas (encender una radio, colocar trampas para ratones, hacer palomitas en microondas, desechar vidrio, instalar un modem).
- Manejo de multiples etapas por tarea: el modelo predice hasta 15 etapas por tarea mediante `stage_pred_from_vlm`, con mascaras por tarea definidas por `TASK_NUM_STAGES`.
- Soporte de espacio de tareas ampliado a 100 indices, con tablas de condicionamiento de 100 filas para embeddings de tarea y 1120 filas para embeddings de etapa.
- Procesamiento de video RGB de dos camaras (cabeza y muneca izquierda) con redimensionado interno a 224x224 mediante `resize_with_pad`.
- Transferencia de tareas: las tareas nuevas (76 y 77) se entrenan desde cero mientras que las heredadas conservan sus embeddings, permitiendo evaluar la capacidad de generalizacion a nuevas tareas.
- Capacidad de reanudacion de entrenamiento mediante `train_state/` con momentos de Adam guardados.

## Casos de uso

- Investigacion en aprendizaje por imitacion para manipulacion robotica: el modelo permite estudiar como un VLA preentrenado se adapta a tareas nuevas fuera de su distribucion original, comparando el rendimiento en tareas heredadas frente a tareas con embeddings aleatorios.
- Evaluacion de generalizacion a nuevas tareas en BEHAVIOR-1K: los investigadores pueden usar el checkpoint para medir si el meta-entrenamiento sobre 5 tareas mejora la capacidad de cero-shot en tareas no vistas dentro del espacio de 100 indices.
- Desarrollo de pipelines de continuacion de entrenamiento para VLA: el repositorio incluye utilidades de carga (`PiBehaviorExpandTasksWeightLoader`) que restauran checkpoints guardados en mallas multi-GPU, utiles para equipos que necesitan reanudar entrenamiento en configuraciones de hardware diferentes.
- Benchmarking de VLA en entornos domesticos simulados: el modelo puede servir como linea base para comparar arquitecturas VLA en tareas de BEHAVIOR-1K, especialmente en lo relativo a prediccion de velocidad base y precision de acciones.
- Estudio de transferencia de tokenizadores y normalizacion: el tokenizador rapido (basado en acciones delta cuantizadas DCT) y las estadisticas de normalizacion heredadas pueden analizarse para entender su impacto en tareas nuevas.
- Prototipado de sistemas de control robotico con instrucciones en lenguaje: aunque es un modelo de investigacion, puede integrarse en simuladores para probar politicas de control que combinen vision, lenguaje y acciones de bajo nivel antes de transferirlas a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (exito en tareas, precision de acciones, etc.) ni comparaciones con otros modelos. Los unicos datos cualitativos mencionados son que las perdidas de `action_loss_base_vel_*` se mantuvieron en linea con los canales del brazo durante el entrenamiento, y que el tokenizador rapido no muestra overflow de alfabeto ni clipping en las tareas nuevas.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- El entrenamiento se realizo en una malla de 4 GPUs (presumiblemente H200, segun se menciona en un repositorio asociado de migracion entre Singapur y Shanghai), lo que sugiere que la inferencia requeriria al menos una GPU de alta gama con 80 GB de VRAM para cargar los 3.4B parametros en precision completa.
- El checkpoint se guardo con sharding de 4 dispositivos, por lo que la carga en una maquina con distinto numero de GPUs requiere restaurar a numpy en host y re-shardear despues (el codigo de `PiBehaviorExpandTasksWeightLoader` ya lo implementa).
- No hay soporte documentado para cuantizacion (GGUF, AWQ, etc.), por lo que el despliegue en GPUs de consumo (RTX 4090, 24 GB) requeriria cuantizacion manual no proporcionada.
- Opciones de despliegue: el modelo esta pensado para el stack JAX/Orbax del repositorio `behavior-1k-solution`; no se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint especifico. Como referencia cualitativa, se puede situar frente a otros VLA:

| Modelo | Parametros | Enfoque | Diferencias clave |
|---|---|---|---|
| `b1k-checkpoints` (este) | 3.4B | Pi0.5 / PiBehavior, 100 tareas | Meta-entrenado en 5 tareas de 2026, sin DA3, sin rama espacial |
| `IliaLarchenko/behavior_50t_checkpoint` | 3.4B | Pi0.5 / PiBehavior, 50 tareas | Modelo base, entrenado en las 50 tareas originales de 2025 |
| OpenVLA (referencia) | 7B | VLA generalista | Mayor tamano, entrenado en datos diversos, sin especializacion en BEHAVIOR-1K |
| RT-2 (referencia) | 55B | VLA de Google | Mucho mayor, no enfocado a BEHAVIOR-1K, no disponible publicamente |

La comparacion cuantitativa (exito en tareas, precision de acciones) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las filas 50-99 del espacio de tareas, excepto las tareas 76 y 77, nunca fueron entrenadas y permanecen con embeddings aleatorios: evaluar cualquier indice de tarea en ese rango producira resultados sin sentido.
- Las tareas 76 y 77 se inicializaron con embeddings aleatorios, por lo que su rendimiento puede ser inferior al de las tareas heredadas; no hay garantia de convergencia completa en 20.000 pasos.
- Las estadisticas de normalizacion son las de 2025 (marco del mundo), mientras que los datos de 2026 usan el marco del robot para `base_qvel`; las dimensiones de estado 0:3 estan normalizadas con una distribucion desactualizada, lo que puede degradar el comportamiento de la velocidad base en evaluacion.
- El checkpoint se guardo con sharding de una malla de 4 GPUs; cargarlo en una maquina con distinto numero de GPUs falla sin el procedimiento de restauracion a numpy host descrito en la model card.
- No hay datos de benchmarks publicados, por lo que no se puede verificar el rendimiento real en las tareas objetivo.
- El tokenizador rapido opera sobre acciones delta cuantizadas DCT; si se alimenta con acciones absolutas, los resultados seran incorrectos.
- Aunque la licencia es Apache-2.0, el modelo base (`behavior_50t_checkpoint`) puede tener restricciones adicionales no declaradas; se recomienda verificar la licencia del upstream antes de uso comercial.
- El repositorio ocupa 3.578,5 GB, lo que implica requisitos de almacenamiento considerables y tiempos de descarga largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JackLiu0406/b1k-checkpoints
- Modelo base: https://huggingface.co/IliaLarchenko/behavior_50t_checkpoint
- Repositorio asociado de migracion (DA3/pi0.5): https://huggingface.co/JackLiu0406/b1k-da3-pi05-code
- Codigo fuente del solucion BEHAVIOR-1K: https://github.com/IliaLarchenko/behavior-1k-solution
