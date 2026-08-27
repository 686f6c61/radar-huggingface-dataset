# Atneura/act-so101-red-lego-to-bin-10eps

## Resumen

El modelo `Atneura/act-so101-red-lego-to-bin-10eps` es una política de control robótico basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite ejecutar tareas de manipulación con alta tasa de éxito a partir de datos teleoperados. Este modelo concreto está especializado en una tarea única: recoger una pieza de Lego roja y depositarla en una papelera, operando sobre un robot tipo SO-101 (líder-seguidor) con una cámara frontal.

El modelo fue desarrollado por el usuario Atneura y publicado en Hugging Face con licencia Apache 2.0. Tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB. Está entrenado sobre un dataset de 10 episodios (5990 frames a 30 FPS) y su arquitectura combina una entrada visual (imagen de 480×640 píxeles) con el estado del robot (6 dimensiones) para generar acciones de 6 dimensiones. Es relevante porque demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, y sirve como ejemplo reproducible para la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imagen) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. El modelo recibe como entrada una observación multimodal: el estado del robot (vector de 6 dimensiones, probablemente posiciones articulares o coordenadas cartesianas) y una imagen RGB de la cámara frontal (3 canales, 480×640 píxeles). A partir de estas entradas, genera un chunk de acciones futuras (en este caso, acciones de 6 dimensiones) que el robot ejecuta de forma autónoma. La principal innovación de ACT es la predicción de secuencias de acciones completas en lugar de una sola acción, lo que reduce la acumulación de errores y mejora la suavidad del movimiento.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 10 episodios teleoperados, con un total de 5990 frames a 30 FPS. La configuración de entrenamiento incluye 5000 pasos, batch size de 8, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. No se menciona el uso de técnicas de refuerzo o ajuste fino adicional; es un entrenamiento puramente supervisado de imitación. El modelo se distribuye en formato safetensors y se integra con el ecosistema LeRobot para inferencia y despliegue.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea de recoger un objeto (pieza de Lego roja) y colocarlo en un contenedor (papelera).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Procesamiento multimodal: combina visión (imagen frontal) y propiocepción (estado del robot) para generar acciones.
- Generación de acciones en chunks: predice secuencias de acciones (action chunking) para movimientos más fluidos y estables.
- Integración con LeRobot: compatible con el pipeline de rollout y entrenamiento de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- Específico de tarea: no es un modelo generalista; está especializado en una única tarea con un robot concreto (SO-101).

## Casos de uso

- Automatización de tareas de picking and placing en entornos controlados: el modelo puede integrarse en una celda de trabajo para mover piezas pequeñas (como bloques de Lego) de una posición a otra, útil en líneas de montaje o clasificación.
- Prototipado rápido de políticas robóticas: al estar entrenado con solo 10 episodios, sirve como punto de partida para validar el flujo de LeRobot antes de escalar a datasets más grandes.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con pocos datos y analizar la influencia del número de episodios en el rendimiento.
- Demostración de despliegue en robots SO-101: el modelo se puede ejecutar con `lerobot-rollout` sobre un robot SO-101 real, sirviendo como ejemplo de referencia para otros desarrolladores.
- Benchmark de reproducibilidad: al estar disponible públicamente con su dataset asociado, facilita la comparación de variantes de ACT o de otros métodos de imitación en la misma tarea.
- Educación en robótica con IA: es un caso práctico para enseñar a estudiantes cómo entrenar y desplegar una política de manipulación con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que lo hace muy ligero en comparación con modelos de lenguaje o visión de gran escala.
- VRAM estimada para inferencia: no disponible en la documentación, pero por el tamaño del modelo y el tipo de entrada (imagen 480×640), es razonable esperar que quepa en GPUs con 4-6 GB de VRAM, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente; también podría ejecutarse en CPU para pruebas lentas.
- Cabe en GPUs de consumo: sí, dado el reducido número de parámetros, aunque la inferencia con imágenes puede requerir más memoria que un modelo puramente de estado.
- Opciones de despliegue: LeRobot (vía `lerobot-rollout`), y potencialmente exportación a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no disponibles; dependerán del hardware y de la optimización del código de inferencia de LeRobot.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros repositorios en Hugging Face con políticas ACT para el mismo robot SO-101 (por ejemplo, `addisonhammer/act_so101_tpu` o `emboss369/act_so101_lego_v3`), pero no se han encontrado datos de rendimiento ni especificaciones detalladas que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es válido para la tarea concreta de recoger una pieza de Lego roja y colocarla en una papelera; no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Datos limitados: entrenado con solo 10 episodios, lo que puede provocar baja robustez ante variaciones de iluminación, posición del objeto o perturbaciones externas.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un robot SO-101 específico y una cámara configurada de forma idéntica a la del entrenamiento; cambios en la calibración o en la disposición de la cámara invalidan el modelo.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero puede generar acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.
- Sin soporte multilingüe ni interacción por lenguaje: es un modelo puramente motor, no conversacional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Atneura/act-so101-red-lego-to-bin-10eps
- Dataset de entrenamiento: https://huggingface.co/datasets/Atneura/so101-red-lego-to-bin_20260826_142927
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Atneura/so101-red-lego-to-bin_20260826_142927
