# Bubbleina/scrappy_act_2026-08-27_overhead

## Resumen

El modelo `Bubbleina/scrappy_act_2026-08-27_overhead` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado con la librería LeRobot de Hugging Face sobre el dataset `Bubbleina/act_smartbin_wrist_v1`, que contiene demostraciones teleoperadas de un brazo robótico con cámara en la muñeca, orientado a tareas de manipulación de objetos en un contenedor inteligente (smart bin). El modelo cuenta con 51,7 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

Este modelo es relevante porque ejemplifica el uso de ACT en entornos de robótica reales con un tamaño compacto, adecuado para despliegue en hardware de bajo coste. Al estar publicado en el Hub de Hugging Face con el formato estándar de LeRobot, puede integrarse fácilmente en pipelines de entrenamiento, evaluación e inferencia para robots como el SO-100. Aunque no se han publicado benchmarks específicos, su arquitectura y método de entrenamiento son los descritos en el paper original de ACT (arXiv:2304.13705).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no aplica, es un modelo de control motor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un "chunk" de acciones futuras (típicamente de 10 a 100 pasos) a partir de observaciones actuales (imágenes y estado del robot). El entrenamiento se realiza mediante comportamiento clonado sobre demostraciones teleoperadas, sin refuerzo ni ajuste fino con preferencias humanas. En este caso, el modelo fue entrenado con LeRobot sobre el dataset `Bubbleina/act_smartbin_wrist_v1`, que contiene episodios de manipulación con una cámara montada en la muñeca del robot. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como aumentación de datos o regularización. La arquitectura concreta (número de capas, heads, dimensiones) no está documentada en la model card, aunque el tamaño total de parámetros (51,7M) sugiere una configuración compacta, típica de políticas ACT para robots de bajo coste.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posiciones articulares o velocidades) para un brazo robótico, basándose en observaciones visuales y de estado.
- Manipulación de objetos: entrenado para tareas de recogida y colocación de objetos en un contenedor (smart bin), con cámara en la muñeca.
- Inferencia en tiempo real: al ser un modelo pequeño, puede ejecutarse a frecuencias de control adecuadas para robots físicos (típicamente 10-50 Hz).
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots como SO-100.
- No tiene capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; es exclusivamente una política de control.

## Casos de uso

- Automatización de recogida de piezas en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora y depositarlos en un contenedor, gracias a su entrenamiento con demostraciones teleoperadas y su capacidad de predecir secuencias de acciones.
- Clasificación de residuos en plantas de reciclaje: con una cámara en la muñeca, el robot puede identificar y separar diferentes tipos de materiales, ejecutando movimientos precisos de agarre y liberación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre distintos entornos o para comparar variantes de arquitectura.
- Prototipado de soluciones robóticas de bajo coste: al ser un modelo compacto (51,7M parámetros), puede desplegarse en GPUs de gama media o incluso en hardware embebido, facilitando experimentos en laboratorios con presupuesto limitado.
- Teleoperación asistida: el modelo puede complementar sistemas de teleoperación humana, sugiriendo o completando movimientos en tareas repetitivas de manipulación.
- Benchmarking de métodos de imitación: al estar disponible públicamente con licencia Apache 2.0, puede utilizarse como referencia para evaluar nuevos algoritmos de aprendizaje por imitación en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de éxito en tareas, precisión de acciones ni comparaciones con otros modelos en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de 51,7M parámetros, una inferencia en FP32 requeriría aproximadamente 200 MB de VRAM, y en FP16 unos 100 MB. Esto cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, A100, etc.).
- Compatibilidad con consumer GPU: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo, incluso en una Raspberry Pi con acelerador Coral si se cuantiza, aunque no hay cuantizaciones publicadas.
- Opciones de despliegue: LeRobot ofrece scripts de inferencia y evaluación (`lerobot-record`), y el modelo puede cargarse con la librería `lerobot` en Python. También es posible exportar a ONNX o TensorRT para optimización, aunque no hay guías oficiales.
- Latencia y throughput: no disponibles. Se espera que la inferencia sea de pocos milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otros de la misma categoría. Existen otros modelos ACT en el Hub de Hugging Face (por ejemplo, los publicados por la comunidad LeRobot), pero no se han encontrado datos concretos sobre sus parámetros, rendimiento o características. Se recomienda consultar el repositorio de LeRobot para ver políticas similares.

## Limitaciones y advertencias

- Sesgos y generalización: al ser un modelo de imitación, su rendimiento depende en gran medida de la calidad y diversidad de las demostraciones del dataset. Si las demostraciones no cubren variaciones del entorno (iluminación, posición de objetos, etc.), el modelo puede fallar en situaciones no vistas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones incorrectas o inestables si las observaciones están fuera de la distribución de entrenamiento.
- Limitaciones de contexto: al no procesar texto, no tiene limitaciones de contexto lingüístico, pero su ventana de observación está limitada a los fotogramas y estados que recibe en cada paso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales conocidas.
- Advertencia para producción: antes de usar en un robot físico, es imprescindible validar la seguridad del sistema, ya que el modelo no incluye mecanismos de detección de colisiones ni de parada de emergencia. Se recomienda ejecutar en simulación primero.
- Datos de entrenamiento: no se ha publicado información sobre el número de episodios, la duración de las demostraciones ni la variabilidad de las mismas, lo que dificulta evaluar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bubbleina/scrappy_act_2026-08-27_overhead
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset utilizado: https://huggingface.co/datasets/Bubbleina/act_smartbin_wrist_v1
