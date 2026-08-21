# Aether258/pi05_bi_two_tubes_0102_step16000

## Resumen

`pi05_bi_two_tubes_0102_step16000` es un checkpoint de fine-tuning del modelo Vision-Language-Action (VLA) pi0.5 (Pi05), desarrollado por Aether258 (Aether_Zhang) sobre la base de pi05_base de Physical Intelligence. El modelo está especializado en una tarea concreta de manipulacion robotica bimanual: coger y colocar dos tubos (uno azul y uno verde) utilizando ambas manos, con entrada tactil de cuatro sensores. Se distribuye a traves del ecosistema LeRobot y el framework openpi.

La relevancia de este modelo reside en que demuestra el fine-tuning de un VLA de ultima generacion con entradas tactiles multimodales (seis flujos de camara: dos RGB y cuatro tactiles) y control bimanual, algo poco habitual en los checkpoints publicos. El entrenamiento se realizo con LoRA sobre el LLM y el action expert, con la torre de vision completamente fine-tuneada, sobre 1.019 episodios y 802.719 frames. El entrenamiento se detuvo en el paso 16000 (2,84 epocas) en lugar de los 20.000 planificados, al observarse que la perdida de validacion en datos no vistos dejaba de mejorar.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el formato de pesos es el nativo de LeRobot (checkpoint con directorios `params/` y `train_state/`), con las imagenes embebidas en los ficheros parquet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en pi0.5, con action head de flow-matching |
| Parametros totales | no disponible (checkpoint fine-tuned de pi05_base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | LeRobot (checkpoint con `params/` y `train_state/`, imagenes embebidas en parquet) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de pi05_base, el VLA de Physical Intelligence co-entrenado con demostraciones roboticas y datos multimodales a gran escala para ejecutar tareas de horizonte largo en entornos reales no vistos. La arquitectura combina un modelo de lenguaje y vision con un action head de flow-matching, que es el unico componente de salida soportado para pi0.5 en LeRobot.

El entrenamiento se realizo con LoRA de rango 16 sobre el LLM y rango 32 sobre el action expert, mientras que la torre de vision se fine-tuneo completamente (el filtro de congelacion solo coincide con `.*llm.*`). Se usaron 2 GPU A100-80GB con FSDP, batch size de 128, learning rate pico de 2e-4 con 1.000 pasos de warmup y decaimiento coseno sobre 100.000 pasos. Los datos provienen de la fusion de dos conjuntos (`two_tubes_01` con 519 episodios y `two_tubes_02` con 500), grabados a 30 fps con LeRobot v2.1 y `robot_type=bimanual`. Se aplico una instruccion unica unificada a todos los episodios, ya que el conjunto `two_tubes_02` contenia un string placeholder que habria ensenado al modelo que dos instrucciones distintas significan el mismo movimiento.

Un detalle relevante: los pasos 0-10000 se ejecutaron en un host y el entrenamiento se reanudo desde el checkpoint del paso 10000 en un host nuevo con `--resume`, que restaura pesos y estado del optimizador pero no la posicion del data loader, por lo que la secuencia de batches difiere de una ejecucion ininterrumpida.

## Capacidades

- Manipulacion robotica bimanual: el modelo controla dos brazos roboticos de forma coordinada para tareas de pick-and-place.
- Percepcion tactil: procesa cuatro flujos de sensores tactiles (dos por mano) ademas de dos camaras RGB, integrando informacion de contacto en la generacion de acciones.
- Ejecucion de instrucciones unificadas: sigue una instruccion en lenguaje natural que especifica el orden de las acciones (coger tubo azul con la izquierda, coger tubo verde con la derecha, colocar primero el azul, luego el verde).
- Generacion de acciones con flow-matching: el action head genera trayectorias de control continuas mediante flow-matching, el metodo estandar para pi0.5.
- Generalizacion a entornos no vistos: hereda del modelo base pi05 la capacidad de operar en entornos reales no vistos, aunque el fine-tuning reduce este alcance a la tarea especifica.
- Procesamiento multimodal: integra vision, lenguaje y tacto en un unico modelo para generar comandos de actuacion.

## Casos de uso

- Investigacion en manipulacion bimanual: el modelo sirve como punto de partida para estudiar coordinacion de dos brazos con feedback tactil, ya que incluye pesos entrenados y estadisticas de normalizacion sobre el split de entrenamiento.
- Automatizacion industrial de pick-and-place: puede adaptarse a lineas de montaje donde se requiere coger y colocar piezas en un orden especifico, aprovechando la instruccion unificada para controlar la secuencia.
- Manipulacion con feedback tactil: los cuatro sensores tactiles permiten detectar contacto y presion, util en tareas de ensamblaje donde la fuerza aplicada es critica.
- Fine-tuning para tareas de ensamblaje: al estar entrenado con LoRA, el checkpoint puede reutilizarse como base para fine-tuning eficiente en tareas relacionadas sin necesidad de entrenar desde cero.
- Evaluacion de VLA en entornos reales: investigadores pueden desplegar el modelo en plataformas LeRobot para comparar el rendimiento de pi0.5 fine-tuneado con tacto frente a variantes sin tacto.
- Benchmarking de generalizacion: la separacion de validacion por repositorio fuente (10% retenido) permite medir la capacidad de generalizacion del modelo a episodios no vistos de la misma distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de robotica y no de lenguaje general. La metrica de rendimiento reportada es la perdida de flow-matching sobre splits de validacion:

| Paso | Perdida train | Perdida val_seen | Perdida val_unseen | Brecha |
|---:|---:|---:|---:|---:|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 |
| 2000 | 0.0553 | 0.0504 | 0.0608 | 0.0104 |
| 4000 | 0.0490 | 0.0467 | 0.0576 | 0.0109 |
| 6000 | 0.0460 | 0.0437 | 0.0543 | 0.0106 |
| 8000 | 0.0441 | 0.0423 | 0.0550 | 0.0127 |
| 10000 | 0.0435 | 0.0416 | 0.0542 | 0.0126 |
| 12000 | 0.0420 | 0.0403 | 0.0538 | 0.0135 |
| 14000 | 0.0404 | 0.0387 | 0.0537 | 0.0150 |
| 16000 | 0.0395 | 0.0383 | 0.0551 | 0.0168 |

La perdida en datos no vistos dejo de mejorar tras el paso 6000, oscilando entre 0.0537 y 0.0551 sin tendencia, mientras que la perdida en datos vistos seguia mejorando y la brecha de generalizacion crecia de forma monotonica. El autor detuvo el entrenamiento en el paso 16000 basandose en esa observacion. Cada pasada de validacion cubre unas 2.560 frames (3-4 episodios), por lo que variaciones de ±0.001 estan dentro del ruido.

## Requisitos de hardware

- Entrenamiento: 2 GPU A100-80GB con FSDP, batch size 128. El checkpoint de `train_state/` permite reanudar el entrenamiento.
- Inferencia: no se especifican requisitos en la informacion disponible. El tamano del repositorio es de 9,6 GB, lo que sugiere que los pesos de inferencia caben en una GPU de consumo con 24 GB de VRAM, aunque no hay confirmacion oficial.
- Despliegue: el modelo se integra con el framework LeRobot (libreria `lerobot`) y el ecosistema openpi, que proporciona codigo de inferencia y fine-tuning.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: al ser un VLA con action head de flow-matching, la inferencia requiere ejecutar el modelo de lenguaje y vision junto con el proceso de flow-matching, lo que implica mayor coste computacional que un modelo de lenguaje puro.

## Comparativa con modelos similares

| Modelo | Descripcion | Licencia | Disponibilidad |
|---|---|---|---|
| `pi05_bi_two_tubes_0102_step16000` (este) | Fine-tuning bimanual con tacto de pi0.5 para pick-and-place de dos tubos | Apache 2.0 | HuggingFace, LeRobot |
| `pi05_bi_two_tubes_0102_step6000` | Mismo entrenamiento en un paso anterior (6000), con mejor perdida val_unseen (0.0543) | Apache 2.0 | HuggingFace, LeRobot |
| `pi05_base` | Modelo base VLA de Physical Intelligence, co-entrenado con demostraciones roboticas y datos multimodales | Apache 2.0 | ModelScope, LeRobot |

La comparativa se limita a estos tres modelos porque no hay datos publicos de otros checkpoints de pi0.5 con entradas tactiles y control bimanual en el momento de redactar esta ficha. El checkpoint en el paso 6000 presenta una perdida de validacion en datos no vistos ligeramente mejor (0.0543 frente a 0.0551), aunque la diferencia esta dentro del ruido de validacion.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para una unica tarea (pick-and-place de dos tubos con instruccion fija). No es un modelo de proposito general y su rendimiento fuera de esta tarea no esta verificado.
- Sobreajuste observado: la perdida en datos no vistos dejo de mejorar tras el paso 6000 mientras la brecha de generalizacion crecia de forma monotonica, lo que indica que la capacidad adicional se invirtio en memorizar los episodios de entrenamiento.
- Ruido de validacion: cada pasada de validacion cubre solo unas 2.560 frames, por lo que las diferencias de perdida inferiores a ±0.001 no son estadisticamente significativas.
- Instruccion unificada forzada: los dos conjuntos de datos originales tenian instrucciones distintas, y se forzo una unica instruccion en la fusion. Esto puede limitar la capacidad del modelo para generalizar a variaciones de lenguaje.
- Idioma: solo soporta ingles en la instruccion; no hay datos de rendimiento en otros idiomas.
- Sin benchmarks estandar: no se han publicado resultados en benchmarks de lenguaje, vision o robotica estandarizados, lo que dificulta la comparacion objetiva con otros modelos.
- Requisitos de hardware no documentados: no se especifican los requisitos minimos de inferencia, lo que puede complicar el despliegue en entornos con recursos limitados.
- La aumentacion de datos (recorte aleatorio al 95%, rotacion de ±5 grados, jitter de color) cuesta 0.0012 de perdida y no compra generalizacion a la intensidad utilizada, segun el analisis del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step16000
- Checkpoint anterior (paso 6000): https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step6000
- Perfil del autor: https://huggingface.co/Aether258
- Modelo base pi05 en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_base/summary
- Codigo de fine-tuning e inferencia para pi05 (openpi05): https://github.com/Integer003/openpi05
