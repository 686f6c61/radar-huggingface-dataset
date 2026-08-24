# leapshared/nuedive_test_60epi_new_20260824_182026_GR00T17_c90_1ep_destatic

## Resumen

Este modelo es un policy de robótica basado en imitación, entrenado con el framework LeRobot de Hugging Face. Se identifica como `groot_frozen_bf16`, lo que sugiere que utiliza una arquitectura GR00T (de NVIDIA) congelada en precisión bf16, aunque no se proporcionan detalles adicionales sobre la arquitectura interna. El modelo ha sido entrenado para controlar un robot bimanual de tipo `bi_openarm_follower` en la tarea de abrir una mochila, introducir objetos en ella y cerrarla, a partir de 60 episodios de demostración.

El modelo consume observaciones de estado (16 dimensiones) y tres flujos de imagen (cámara frontal y dos muñecas) a 480x640 píxeles, y produce acciones de 16 dimensiones. Con 3.144 millones de parámetros, es un modelo de tamaño medio para robótica, diseñado para ejecutarse en tiempo real sobre hardware con GPU. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su publicación como ejemplo de entrenamiento de políticas robóticas con LeRobot, un ecosistema que democratiza el aprendizaje por imitación. Aunque no se han publicado resultados de evaluación, su estructura y configuración son representativas de los pipelines modernos de VLA (visión-lenguaje-acción) aplicados a manipulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T congelado en bf16 (detalles internos no disponibles) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | bf16 (único formato publicado) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación proporcionada. El nombre `groot_frozen_bf16` indica que se trata de un modelo GR00T (posiblemente el modelo de NVIDIA para robótica) cuyos pesos se mantienen congelados durante el entrenamiento, y que la política aprendida se almacena en precisión bf16. El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre un dataset de 60 episodios y 65.156 fotogramas a 30 FPS, correspondientes a la tarea de abrir una mochila, meter objetos y cerrarla.

La configuración de entrenamiento incluye 4.073 pasos, un tamaño de lote de 16, optimizador AdamW con learning rate de 0.0001 y semilla 42. No se menciona el uso de técnicas como RLHF o DPO, ya que es un pipeline de aprendizaje por imitación supervisado. La política se entrena para mapear observaciones (estado del robot y tres imágenes) a acciones de 16 dimensiones, probablemente mediante una red que combina codificadores visuales y de estado, aunque no se especifican los detalles de la red.

## Capacidades

- Control de robot bimanual: genera comandos de acción de 16 dimensiones para un robot de tipo `bi_openarm_follower`.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (cámara frontal y dos muñecas) a 480x640 píxeles.
- Ejecución de tareas de manipulación: entrenado específicamente para abrir una mochila, colocar objetos en su interior y cerrarla.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Inferencia en tiempo real: diseñado para ejecutarse en bucle de control con el robot, con una frecuencia de 30 FPS.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para despliegue y entrenamiento.

## Casos de uso

- Automatización de tareas de empaquetado: el modelo puede controlar un robot para abrir contenedores, introducir objetos y cerrarlos, útil en líneas de logística o preparación de pedidos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre entornos o la robustez frente a variaciones en la posición de los objetos.
- Desarrollo de robots de asistencia doméstica: la tarea de manipular una mochila es representativa de operaciones de organización y almacenamiento que podrían delegarse a robots domésticos.
- Benchmark de políticas VLA: al ser un modelo de tamaño medio con licencia abierta, puede utilizarse como referencia para comparar arquitecturas o métodos de entrenamiento en robótica.
- Formación y educación: permite a estudiantes y desarrolladores experimentar con el despliegue de políticas robóticas usando el stack de LeRobot y hardware de bajo coste.
- Prototipado rápido de nuevas tareas: dado que el entrenamiento se realiza con pocos episodios (60), el modelo demuestra la viabilidad de adaptar políticas a nuevas tareas con datasets pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 3.144 millones de parámetros en bf16, el modelo ocupa aproximadamente 6,3 GB en memoria (3.144e9 * 2 bytes). Para inferencia con imágenes de 480x640 y tres cámaras, se recomienda al menos 8-10 GB de VRAM para evitar cuellos de botella.
- GPU recomendadas: una GPU de gama media-alta como RTX 3080/4080 o superior sería suficiente. Para entrenamiento, se necesitaría una GPU con al menos 12-16 GB (por ejemplo, RTX 3090, A5000 o A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más, aunque el rendimiento en tiempo real dependerá de la optimización del pipeline.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en tiempo real mediante el comando `lerobot-rollout`. También puede ejecutarse con PyTorch directamente.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la entrada de tres imágenes, se espera una latencia de decenas de milisegundos por paso en hardware moderno, suficiente para control a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas de tamaño similar entrenadas con LeRobot). Aunque existen otros modelos VLA como OpenVLA o RT-2, no se tienen datos de rendimiento ni especificaciones para establecer una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Generalización limitada: el modelo fue entrenado con solo 60 episodios de una tarea específica, por lo que su capacidad para generalizar a nuevas posiciones de objetos, iluminación o variaciones del entorno es incierta.
- Dependencia del dataset: el rendimiento depende en gran medida de la calidad y diversidad de las demostraciones; cualquier sesgo en el dataset se reflejará en el comportamiento del modelo.
- Sin evaluación publicada: no hay métricas de éxito en el mundo real, por lo que no se puede garantizar su fiabilidad en producción.
- Requisitos de calibración: el robot y las cámaras deben estar calibrados y configurados exactamente como en el entrenamiento (mismas posiciones, orientaciones y parámetros de imagen).
- Riesgo de alucinación en acciones: como cualquier modelo de imitación, puede generar acciones no deseadas si las observaciones se desvían de lo visto durante el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia de los componentes subyacentes (por ejemplo, GR00T) si se utiliza en productos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/nuedive_test_60epi_new_20260824_182026_GR00T17_c90_1ep_destatic
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/nuedive_test_60epi_new_20260824_182026_destatic
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
