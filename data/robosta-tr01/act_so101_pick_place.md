# robosta-tr01/act_so101_pick_place

## Resumen

El modelo `robosta-tr01/act_so101_pick_place` es una política robótica entrenada mediante aprendizaje por imitación para la tarea de recogida y colocación (pick-and-place) con un brazo robótico SO-100. Está basado en el método Action Chunking with Transformers (ACT), descrito en el artículo arXiv:2304.13705, que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control y la tasa de éxito en tareas manipulativas.

Ha sido desarrollado por el usuario `robosta-tr01` y publicado en HuggingFace bajo la licencia Apache 2.0, utilizando la librería LeRobot de HuggingFace para su entrenamiento y evaluación. El modelo cuenta con 51.668.614 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,2 GB. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT a un robot de bajo coste (SO-100), demostrando cómo entrenar políticas de manipulación con datos teleoperados y desplegarlas en entornos reales.

La arquitectura concreta (número de capas, dimensión del modelo, etc.) no está especificada en la model card, pero se corresponde con el diseño general de ACT: un transformer con codificador y decodificador, junto con un módulo VAE condicional para capturar la variabilidad multimodal de las demostraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; en ACT el contexto es la observación actual y el historial de acciones, pero no se detalla) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin información sobre cuantización) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que combina un transformer con un autoencoder variacional condicional (CVAE). El codificador procesa la observación actual (imágenes y estado de las articulaciones) y una variable latente que captura la variabilidad entre demostraciones; el decodificador autoregresivo predice una secuencia de acciones futuras (chunk) de longitud fija. Esta predicción por lotes reduce la acumulación de errores y permite movimientos más suaves.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `robosta-tr01/so101_pick_place`, que contiene demostraciones teleoperadas de la tarea de pick-and-place. No se especifican detalles como el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de refuerzo o ajuste fino posterior. La librería LeRobot proporciona el pipeline completo de entrenamiento, evaluación y despliegue, tal como se indica en la documentación de la model card.

No se mencionan innovaciones técnicas adicionales más allá de las propias de ACT. La implementación sigue el código de referencia de LeRobot.

## Capacidades

- Control robótico para tareas de pick-and-place: el modelo genera comandos de posición para las articulaciones del robot SO-100, permitiendo recoger un objeto y colocarlo en una ubicación determinada.
- Aprendizaje por imitación: aprende directamente de demostraciones humanas teleoperadas, sin necesidad de modelado del entorno ni funciones de recompensa.
- Predicción de secuencias de acciones (action chunking): genera bloques de acciones futuras, lo que mejora la coherencia temporal del movimiento.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para robótica, incluyendo herramientas de registro de datos, entrenamiento y evaluación.
- Despliegue en hardware real: puede ejecutarse en un robot SO-100 mediante el comando `lerobot-record` con el argumento `--policy.path`.
- Reentrenamiento y adaptación: al ser un modelo pequeño (51M parámetros), permite iterar rápidamente en nuevos datasets o tareas similares.

## Casos de uso

- Automatización de líneas de montaje ligeras: el modelo puede controlar un brazo robótico para mover piezas de una cinta transportadora a una bandeja, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre distintos robots o entornos, dado su tamaño reducido y su integración con LeRobot.
- Prototipado de celdas robóticas en laboratorio: permite validar rápidamente si una tarea de pick-and-place es aprendible antes de invertir en hardware más caro o métodos más complejos.
- Educación en robótica: los estudiantes pueden entrenar y evaluar políticas con el robot SO-100, comprendiendo los fundamentos del aprendizaje por imitación y del control basado en transformers.
- Benchmarking de algoritmos de imitación: al ser un modelo público y reproducible, puede usarse como referencia para comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en la misma tarea.
- Sistemas de demostración en ferias o museos: el robot puede realizar tareas de recogida y colocación de forma autónoma tras un entrenamiento con demostraciones, mostrando las capacidades de la IA robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Para obtener datos de rendimiento sería necesario ejecutar el protocolo de evaluación proporcionado por LeRobot (`lerobot-record` con episodios de prueba) sobre el robot SO-100.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere aproximadamente 200 MB en FP32 (51.7M × 4 bytes ≈ 207 MB). Con cuantización a FP16 o INT8, el consumo sería menor, aunque no se proporcionan archivos cuantizados.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 4-8 GB (por ejemplo, RTX 3050 o superior), aunque no se especifican requisitos oficiales.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU moderna, incluidas las integradas de Intel o AMD si se usa CPU, aunque la inferencia sería más lenta.
- Opciones de despliegue: LeRobot soporta ejecución en GPU mediante `--policy.device=cuda`, y también es posible usar CPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje.
- Latencia y throughput: no hay datos publicados. Dado el pequeño tamaño, se espera una latencia de milisegundos en GPU, pero depende del hardware y del número de cámaras y sensores involucrados.

## Comparativa con modelos similares

No se dispone de información comparativa cuantitativa con otros modelos en la documentación proporcionada. Sin embargo, dentro del ecosistema LeRobot, ACT es uno de los métodos de referencia junto con Diffusion Policy y VQ-BeT. A modo orientativo, se pueden considerar las siguientes diferencias conceptuales:

| Modelo | Arquitectura | Tamaño típico | Característica principal |
|---|---|---|---|
| ACT (este modelo) | Transformer + CVAE | ~50M parámetros | Predicción de chunks de acciones |
| Diffusion Policy | Red de difusión | Variable | Generación de acciones mediante denoising iterativo |
| VQ-BeT | Transformer + cuantización vectorial | Variable | Discretización de acciones en tokens |

No se dispone de datos de rendimiento comparativo para esta tarea concreta. Se recomienda consultar los benchmarks de LeRobot en su documentación oficial para obtener métricas actualizadas.

## Limitaciones y advertencias

- Dependencia de la calidad de las demostraciones: el modelo aprende únicamente de los datos teleoperados; si las demostraciones son inconsistentes o contienen errores, la política resultante será poco fiable.
- Generalización limitada: no se ha probado en entornos diferentes al utilizado durante el entrenamiento. Cambios en la iluminación, posición de la cámara o tipo de objeto pueden degradar el rendimiento.
- Sin capacidades de lenguaje o razonamiento simbólico: es un modelo puramente motor, no entiende instrucciones verbales ni puede planificar tareas de alto nivel.
- Riesgo de sobreajuste: al ser un modelo pequeño y entrenado sobre un dataset específico, puede memorizar las demostraciones en lugar de aprender una política robusta.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero se debe verificar que el dataset `robosta-tr01/so101_pick_place` tenga una licencia compatible con el uso previsto.
- Hardware específico: el modelo está diseñado para el robot SO-100; su transferencia a otros brazos requeriría reentrenamiento o adaptación.
- Sin datos de seguridad: no se han publicado evaluaciones sobre comportamiento seguro en presencia de obstáculos o personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robosta-tr01/act_so101_pick_place
- Paper de ACT: https://huggingface.co/papers/2304.13705 (también disponible en arXiv: https://arxiv.org/abs/2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/robosta-tr01/so101_pick_place
