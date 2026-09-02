# heyunzhenwhat/act_so101-single-transfer-100ep-2x

## Resumen

Este modelo es una política de manipulación robótica basada en ACT (Action Chunking with Transformers), entrenada con el framework LeRobot de Hugging Face. El modelo ha sido desarrollado por el usuario `heyunzhenwhat` y está diseñado para ejecutar una tarea concreta de transferencia de objetos: mover una cinta adhesiva hacia una zona marcada en el área de trabajo de un robot SO-101. Se trata de un ejemplo de aprendizaje por imitación a partir de datos teleoperados, con una arquitectura transformer que predice secuencias de acciones en lugar de acciones individuales, lo que mejora la estabilidad del control en entornos reales.

El modelo tiene 51,67 millones de parámetros (0,2 GB en safetensors), lo que lo hace extremadamente ligero en comparación con modelos de lenguaje o visión. Está entrenado sobre 100 episodios de demostración, con 29.127 fotogramas a 30 FPS, recogidos con dos cámaras (overhead y muñeca) y el estado del robot. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, accesible para desarrolladores e investigadores que trabajan con robots de bajo coste como el SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer codificador-decodificador para predecir un "chunk" de acciones futuras (por ejemplo, 10-20 pasos) a partir de observaciones actuales. A diferencia de los métodos que predicen una sola acción, ACT reduce la acumulación de errores y permite movimientos más suaves y coherentes. El modelo fue entrenado con el framework LeRobot (versión 0.6.1) durante 40.000 pasos, con un tamaño de lote de 16, optimizador AdamW y una tasa de aprendizaje de 1e-05, con semilla 1000.

Los datos de entrenamiento provienen del dataset `heyunzhenwhat/so101-single-transfer-100ep`, que contiene 100 episodios de teleoperación de la tarea "Move the tape into the taped area on the right". Cada episodio incluye imágenes de dos cámaras (overhead a 720x1280 y muñeca a 360x640) y el estado del robot (6 dimensiones). La salida es un vector de acción de 6 dimensiones (probablemente posición y orientación del efector). No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Aprendizaje por imitación para manipulación robótica: el modelo reproduce la tarea demostrada a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones: genera secuencias de acciones coherentes, lo que mejora la fluidez del movimiento.
- Entrada multimodal: procesa simultáneamente imágenes de dos cámaras (vista cenital y vista de muñeca) y el estado del robot.
- Salida de acciones de 6 grados de libertad, adecuada para el control de un brazo robótico tipo SO-101.
- Integración con el ecosistema LeRobot: permite cargar y ejecutar la política con comandos CLI estándar y es compatible con el entrenamiento incremental.
- Específico para la tarea de transferencia de objetos: no generaliza a otras tareas sin reentrenamiento.

## Casos de uso

- Automatización de tareas repetitivas en líneas de montaje: el modelo puede manejar la colocación o transferencia de piezas pequeñas en un entorno controlado, reduciendo la intervención humana.
- Manipulación de objetos en entornos de investigación: sirve como punto de partida para estudiar el aprendizaje por imitación con pocos datos (100 episodios) y su transferencia a variaciones de la tarea.
- Demostración de LeRobot en hardware real: es un ejemplo funcional de cómo entrenar y desplegar una política en un robot SO-101, útil para talleres y cursos de robótica.
- Base para fine-tuning en tareas similares: dado su pequeño tamaño, puede adaptarse rápidamente a nuevas tareas de transferencia con un dataset adicional.
- Evaluación de robustez en entornos cambiantes: permite probar cómo afectan cambios de iluminación, posición de la cámara o variaciones en la colocación del objeto al rendimiento de la política.
- Desarrollo de sistemas de control basados en visión: combina percepción visual y control motor, sirviendo como referencia para integrar visión por computador con planificación de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación sobre el robot real. No se dispone de métricas como tasa de éxito, precisión de la tarea ni comparaciones con otros métodos en este repositorio.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 0,2 GB en safetensors, por lo que la inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM. Incluso en CPU es viable, aunque con mayor latencia.
- GPUs recomendadas: cualquier GPU moderna de consumo (por ejemplo, NVIDIA RTX 3060 o superior) es suficiente. No se requieren GPUs de centro de datos.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot, que gestiona la carga del modelo, la conexión con el robot SO-101 y las cámaras. No está pensado para vLLM, Ollama ni otros motores de inferencia de modelos de lenguaje.
- Latencia y throughput: no hay datos publicados. Dado el tamaño del modelo, se espera una inferencia en tiempo real (30 FPS) en GPU, pero depende de la configuración de cámaras y del robot.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados para la misma tarea o con la misma arquitectura en el repositorio consultado. Existen otros modelos ACT en el Hub de Hugging Face (por ejemplo, `jian001/act_so101_test_model`), pero no se han encontrado datos comparativos de rendimiento ni especificaciones detalladas. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado exclusivamente para mover una cinta adhesiva a una zona concreta. No generaliza a otras tareas, objetos o configuraciones del entorno.
- Dependencia de las cámaras: las imágenes de entrada provienen de dos cámaras fijas con resoluciones específicas. Cambios en la posición, orientación o calibración de las cámaras pueden degradar el rendimiento.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que no se conoce la tasa de éxito real en el hardware.
- Riesgo de sobreajuste: con solo 100 episodios y 40.000 pasos de entrenamiento, existe una alta probabilidad de que el modelo memorice las demostraciones y falle ante variaciones no vistas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo no incluye garantías de funcionamiento en entornos de producción.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento simbólico ni interacción conversacional. Cualquier intento de usarlo fuera del ámbito robótico carece de sentido.

## Enlaces

- Modelo en Hugging Face: [heyunzhenwhat/act_so101-single-transfer-100ep-2x](https://huggingface.co/heyunzhenwhat/act_so101-single-transfer-100ep-2x)
- Dataset de entrenamiento: [heyunzhenwhat/so101-single-transfer-100ep](https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-100ep)
- Paper de ACT: [Action Chunking with Transformers (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- LeRobot en GitHub: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Guía de ACT en LeRobot: [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
- Repositorio relacionado para SO-101: [https://github.com/machenxiang/lerobot_for_so101](https://github.com/machenxiang/lerobot_for_so101)
