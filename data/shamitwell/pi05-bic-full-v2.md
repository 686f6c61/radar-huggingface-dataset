# shamitwell/pi05-bic-full-v2

# Ficha técnica: shamitwell/pi05-bic-full-v2

## Resumen

El modelo `shamitwell/pi05-bic-full-v2` es un Vision-Language-Action (VLA) fine-tuneado a partir de `lerobot/pi05_base`, la implementación de LeRobot del modelo π₀.₅ (Pi05) desarrollado por Physical Intelligence. Este modelo está diseñado para control robótico por imitación, específicamente para la tarea de recoger un bloque y colocarlo en una taza ("pick up the block and place it in the cup"). El autor, shamitwell, ha entrenado el modelo con el framework LeRobot sobre un dataset propio de 145 episodios, demostrando cómo adaptar un VLA preentrenado a una tarea concreta con un número reducido de demostraciones.

El modelo tiene aproximadamente 4.143 millones de parámetros (4,14B) y se distribuye en formato safetensors. Al ser un VLA, procesa imágenes de cámaras (base, muñeca izquierda y derecha) junto con el estado del robot (32 dimensiones) y genera acciones de 6 dimensiones. Su relevancia radica en que ejemplifica el fine-tuning de un modelo de última generación en robótica con herramientas open source como LeRobot, facilitando la reproducción y experimentación en entornos de investigación y desarrollo.

La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo hace atractivo para proyectos industriales y académicos. Sin embargo, no se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot debe ser validado por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 (~4,14B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp16/bf16) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA que combina un codificador visual (para procesar imágenes de 224x224 píxeles de tres cámaras) con un módulo de lenguaje y un "action expert" que genera comandos de control de 6 grados de libertad. La arquitectura exacta interna no se detalla en la información proporcionada, pero se basa en el diseño de π₀.₅, que pre-entrena sobre una mezcla heterogénea de tareas y luego se fine-tunea con demostraciones de bajo nivel y anotaciones semánticas de alto nivel. En este caso, el fine-tuning se realizó sobre el modelo base `lerobot/pi05_base` utilizando el framework LeRobot.

El entrenamiento se llevó a cabo con el dataset `shamitwell/block-in-cup-combined`, que contiene 145 episodios y 29.284 frames a 30 FPS, todos etiquetados con la tarea "pick up the block and place it in the cup". Se usaron 21.000 pasos de entrenamiento con un batch size de 4, optimizador AdamW, learning rate de 2,5e-5 y semilla 1000. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un fine-tuning de imitación supervisada estándar.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Percepción multi-cámara: procesa simultáneamente imágenes de una cámara base y dos cámaras de muñeca (izquierda y derecha), todas a 224x224 píxeles.
- Seguimiento de instrucciones de tarea: el modelo está entrenado para ejecutar una tarea específica descrita en lenguaje natural ("pick up the block and place it in the cup").
- Generalización limitada a entornos similares: al ser un fine-tune sobre un dataset pequeño, su capacidad de generalización a nuevas configuraciones o tareas es reducida.
- No soporta tool calling, agentes multi-paso ni razonamiento simbólico; su función es exclusivamente el control motor reactivo.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en un robot tipo `so_follower` para recoger objetos y colocarlos en contenedores, útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear VLA preentrenados con pocos datos, comparando estrategias de entrenamiento y aumentación.
- Desarrollo de prototipos de manipulación robótica: permite validar rápidamente un pipeline de control basado en visión en un robot real, reduciendo el tiempo de desarrollo desde cero.
- Benchmarking de frameworks de robótica: al estar implementado con LeRobot, puede usarse para evaluar el rendimiento de esta librería frente a otras como OpenPI o ROS.
- Educación en robótica y aprendizaje automático: como ejemplo de modelo VLA open source, es útil para enseñar conceptos de percepción, control y fine-tuning en cursos avanzados.
- Pruebas de robustez en entornos con variaciones de iluminación o posición de objetos: aunque no está explícitamente entrenado para ello, puede evaluarse su comportamiento ante perturbaciones para identificar limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito en tareas reales, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 9,4 GB, lo que sugiere que los pesos están en precisión fp16/bf16 (4,14B × 2 bytes ≈ 8,3 GB, más overhead). Para inferencia se estima un consumo de 10-12 GB de VRAM, incluyendo activaciones y buffers.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060/4070, A10, L4) sería suficiente para inferencia en fp16. Para entrenamiento, se necesitaría más memoria (probablemente 24 GB o más, como RTX 3090/4090 o A100).
- No cabe en GPUs de consumo con menos de 8 GB de VRAM en fp16; podría cuantizarse a int8 o int4 para reducir requisitos, pero no se proporcionan versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con el comando `lerobot-rollout` sobre un robot compatible. También es posible exportar a otros formatos (ONNX, TensorRT) para despliegue en edge, aunque no se documenta en el repositorio.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la optimización del pipeline de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `lerobot/pi05_base` es el punto de partida, y este fine-tune es una adaptación específica. Otros fine-tunes de pi05 pueden existir en el Hub (por ejemplo, `koki1231/pi05_lp_v2_low_lr_no_aug_s1000`), pero no se tienen datos de rendimiento ni especificaciones detalladas para establecer una comparación objetiva. Por tanto, la comparativa se limita a indicar que es un fine-tune de pi05_base con 4,14B parámetros, mientras que el base podría tener una arquitectura similar pero entrenado en una mezcla más amplia de tareas.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo fue entrenado exclusivamente con demostraciones de una única tarea en un entorno específico (robot `so_follower` con cámaras concretas). No generalizará a otras tareas, robots o configuraciones de cámaras sin un nuevo fine-tuning.
- Riesgo de alucinación: al ser un modelo de control, no genera texto, pero puede producir acciones erróneas si las observaciones difieren de las del entrenamiento (por ejemplo, cambios de iluminación, posiciones de objetos no vistas).
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un VLA, el contexto está limitado a las imágenes y el estado actual; no hay memoria de largo plazo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir al autor original y a Physical Intelligence si se redistribuye. No hay restricciones adicionales conocidas.
- Falta de evaluación: no hay resultados de éxito en robot real, por lo que el rendimiento es incierto. Se recomienda validar el modelo en un entorno controlado antes de usarlo en producción.
- Dependencia de LeRobot: el modelo está ligado a la versión 0.6.1 de LeRobot; cambios en la librería pueden afectar la compatibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shamitwell/pi05-bic-full-v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/shamitwell/block-in-cup-combined)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de π₀.₅ de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio OpenPI05 (implementación de referencia)](https://github.com/Integer003/openpi05)
- [Blog de Hugging Face sobre entrenamiento e inferencia con pi05](https://huggingface.co/blog/Tonic/training-and-inference-with-pi05)
