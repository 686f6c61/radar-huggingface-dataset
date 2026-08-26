# jayp132/beanbag-discrimination-policy-clean

## Resumen

El modelo `jayp132/beanbag-discrimination-policy-clean` es una política robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT). Desarrollado por el usuario jayp132 y publicado a través de la biblioteca LeRobot, su objetivo es que un robot teleoperado aprenda a discriminar entre dos tipos de objetos (una bolsa de frijoles verde y una roja) y realice la acción de recoger el objetivo correcto. El modelo se ha entrenado sobre un dataset de 100 episodios capturados a 30 FPS, con dos tareas diferenciadas, y se distribuye en formato safetensors bajo licencia Apache 2.0.

La arquitectura ACT, presentada en el artículo arXiv:2304.13705, predice bloques de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el rendimiento en tareas de manipulación continua. El modelo cuenta con 51,668,614 parámetros, un tamaño modesto que lo hace adecuado para ejecutarse en hardware de consumo. Al estar integrado en el ecosistema LeRobot, se puede desplegar directamente con las herramientas de la biblioteca, tanto para evaluación como para entrenamiento de nuevas políticas.

Este modelo es relevante en el campo de la robótica asistida por IA, ya que demuestra un flujo completo de entrenamiento y despliegue de políticas de imitación con código abierto, y sirve como ejemplo práctico para desarrolladores que quieran implementar control robótico basado en visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de control robótico) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo robótico sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Action Chunking with Transformers (ACT), un método de imitación que utiliza una red transformer con un decodificador de acción condicionado por el estado y las imágenes. ACT emplea una estrategia de predicción de bloques de acción (chunks) de longitud fija, lo que reduce la acumulación de errores y permite movimientos más suaves. La arquitectura es de tipo CVAE (Conditional Variational Autoencoder) donde el encoder procesa la observación y el decoder genera las acciones futuras.

El entrenamiento se realizó sobre el dataset `jayp132/beanbag-discrimination-clean` que contiene 100 episodios y 48.670 frames, grabados con cámaras de muñeca y de escena. Se utilizaron 100.000 pasos de entrenamiento, un tamaño de lote de 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es puramente aprendizaje supervisado a partir de teleoperación. La versión de LeRobot empleada fue la 0.5.2.

## Capacidades

- Control robótico de manipulación: el modelo es capaz de generar acciones de 6 dimensiones (posición y orientación) para el robot, a partir de observaciones visuales y de estado.
- Discriminación de objetos: distingue entre dos colores (verde y rojo) y ejecuta la tarea de recoger el objeto correcto.
- Entrada multimodal: procesa imágenes de dos cámaras (muñeca y escena) con resolución 480x640 y el estado del robot (6 dimensiones).
- Generación de acciones continuas: predice secuencias de acción (chunks) para lograr movimientos suaves y coordinados.
- Integración con LeRobot: se puede ejecutar directamente con `lerobot-rollout` y entrenar con `lerobot-train`, lo que facilita su uso en entornos reales.
- No tiene capacidades de lenguaje, tool calling ni razonamiento simbólico; su ámbito es exclusivamente el control motor.

## Casos de uso

- Recogida selectiva de objetos en línea de producción: el modelo puede distinguir entre objetos de dos colores y recoger únicamente los que corresponden a la tarea, útil para sistemas de clasificación automática.
- Automatización de tareas de laboratorio: manipulación de muestras etiquetadas con colores, donde el robot debe seleccionar el vial o recipiente correcto.
- Entrenamiento de robots colaborativos en entornos educativos: sirve como ejemplo de cómo entrenar una política de imitación para enseñar tareas de picking a un robot de bajo coste.
- Evaluación de algoritmos de imitación: su pequeño tamaño y el uso de ACT lo hacen idóneo para comparar técnicas de aprendizaje por refuerzo o imitación en robótica.
- Prototipado rápido de control de robots: al estar integrado con LeRobot, los desarrolladores pueden reentrenar el modelo con nuevos datos para adaptarlo a otras tareas de manipulación.
- Investigación en generalización de visión en robótica: el modelo usa imágenes de dos cámaras, permitiendo estudiar cómo el sistema combina la información visual para tomar decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación proporcionados por el autor. No se dispone de métricas de éxito en tareas reales ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene unos 51 millones de parámetros y usa imágenes de 480x640, la inferencia en GPU requiere al menos 1-2 GB de VRAM para un lote pequeño. En CPU puede ejecutarse con más latencia.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, GTX 1080 Ti) es suficiente. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM para el lote de 8.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs domésticas como RTX 4090 o incluso tarjetas de gama media.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) y de entrenamiento (`lerobot-train`). No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia porque es un modelo de control robótico, no de lenguaje.
- Latencia y throughput: no disponible, pero por el tamaño del modelo, se espera una inferencia en tiempo real (30 FPS) en GPU dedicada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas con ACT). La documentación no incluye referencias a otros modelos de control robótico similares. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para dos tareas (recoger verde y recoger rojo) en un entorno controlado. No generaliza a otros colores, posiciones o tipos de objetos.
- No se han proporcionado resultados de evaluación reales en robot, por lo que el rendimiento real en entornos no controlados es incierto.
- La robustez ante cambios de iluminación, oclusiones o variaciones en la posición de los objetos no ha sido documentada.
- Al ser un modelo de aprendizaje por imitación, puede heredar sesgos del operador humano que grabó los datos (por ejemplo, preferencia de movimiento o velocidad).
- Riesgo de alucinación: en robótica, el equivalente es la generación de acciones erróneas o inesperadas si la observación está fuera de la distribución de entrenamiento. No hay garantías de seguridad en entornos dinámicos.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario asegurar que el modelo no cause daños en aplicaciones reales.
- No se proporcionan pesos en formato GGUF u otros cuantizados; solo safetensors.

## Enlaces

- Modelo: https://huggingface.co/jayp132/beanbag-discrimination-policy-clean
- Dataset: https://huggingface.co/datasets/jayp132/beanbag-discrimination-clean
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot (guía ACT): https://huggingface.co/docs/lerobot/main/en/act
