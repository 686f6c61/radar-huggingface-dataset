# addisonhammer/pi05_so101_pink_die

## Resumen

El modelo `addisonhammer/pi05_so101_pink_die` es un fine-tuning del modelo base `lerobot/pi05_base`, una implementación de π₀.₅ (Pi05), un Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en mundo abierto en robótica. Este checkpoint concreto se ha entrenado con LeRobot sobre un dataset propio de 25 episodios (7574 frames) para ejecutar la tarea de recoger un dado rosa y colocarlo en una taza metálica, utilizando un robot SO-101 con dos cámaras (overhead y wrist). El modelo tiene 4.143.404.816 parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación sobre una tarea específica de manipulación, usando herramientas open source como LeRobot. Aunque es un ejemplo de demostración con una tarea muy concreta, sirve como referencia para quienes quieran adaptar Pi05 a sus propios entornos y robots. No se han publicado resultados de evaluación, por lo que su rendimiento real en el mundo físico no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi05 (π₀.₅) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo robótico, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje como entrada principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que combina visión, lenguaje y acción para control robótico. La arquitectura interna no se detalla en la documentación disponible, pero se sabe que evoluciona el modelo π₀ original para generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación en LeRobot está adaptada del repositorio open-source OpenPI de Physical Intelligence.

El entrenamiento de este checkpoint se realizó mediante fine-tuning desde `lerobot/pi05_base` con un dataset propio (`addisonhammer/so101_pink_die_in_cup_20260817_220140`) que contiene 25 episodios de demostración de la tarea de pick-and-place. La configuración de entrenamiento incluyó 5000 pasos, batch size de 4, optimizador AdamW con learning rate 2.5e-05, y seed 1000, usando LeRobot versión 0.6.2. No se menciona el uso de técnicas como RLHF o DPO; se trata de un aprendizaje por imitación estándar.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 6 dimensiones (posición y orientación) para el robot SO-101, basándose en observaciones de estado y dos cámaras.
- Percepción visual: procesa imágenes de 480x640 píxeles de una cámara overhead y una cámara wrist, lo que permite localizar objetos y ajustar el movimiento.
- Ejecución de tareas específicas: está entrenado para la tarea concreta "recoger el dado rosa y colocarlo en la taza metálica".
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Generalización limitada: al ser un fine-tuning sobre una tarea única, no se espera que generalice a otras tareas sin reentrenamiento.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede usarse para demostrar la viabilidad de VLA en entornos controlados, donde la tarea está bien definida y el espacio de trabajo es fijo.
- Investigación en aprendizaje por imitación: sirve como ejemplo de cómo fine-tunear Pi05 con LeRobot para una tarea específica, permitiendo a otros investigadores reproducir el flujo y adaptarlo a sus propios robots.
- Evaluación de robustez en robótica: aunque no hay resultados publicados, el modelo puede utilizarse para probar la repetibilidad de la tarea bajo variaciones de iluminación, posición del objeto o distracciones.
- Desarrollo de prototipos de automatización industrial: en entornos de producción a pequeña escala donde la tarea es fija y repetitiva, un VLA fine-tuneado puede ser una alternativa a la programación tradicional.
- Formación y docencia en robótica: el modelo y su dataset asociado son útiles para enseñar el proceso completo de recolección de datos, entrenamiento y despliegue de políticas robóticas.
- Benchmarking de VLA en hardware real: puede emplearse como punto de referencia para comparar el rendimiento de diferentes arquitecturas o configuraciones de entrenamiento en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, número de intentos o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que el modelo tiene ~4.1B parámetros, en fp16 ocuparía aproximadamente 8.3 GB solo en pesos, pero al ser un VLA con procesamiento de imágenes, el uso total de VRAM durante inferencia podría superar los 12 GB. Se recomienda al menos una GPU con 16 GB de VRAM para operar con margen.
- GPU recomendadas: tarjetas de gama alta como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son adecuadas. GPUs con menos de 12 GB podrían no ser suficientes.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo, aunque el tiempo de inferencia dependerá de la optimización.
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot, que soporta inferencia local con `lerobot-rollout`. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia estándar, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles. Dependen del hardware y de la optimización del pipeline de visión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA fine-tuneado para tareas robóticas). Existen otros checkpoints de Pi05 en Hugging Face, como `ViVi-AI/pi05_grab_pink_cube`, que siguen el mismo esquema de fine-tuning, pero no se han publicado comparativas de rendimiento entre ellos. La falta de benchmarks impide establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo sabe ejecutar la tarea para la que fue entrenado; no generaliza a otras tareas ni a variaciones significativas del entorno.
- Sin evaluación publicada: no hay datos de tasa de éxito ni pruebas en el mundo real, por lo que su fiabilidad es desconocida.
- Dependencia del dataset: el rendimiento depende de la calidad y variedad de los 25 episodios de demostración; un dataset pequeño puede provocar sobreajuste.
- Requisitos de hardware: necesita una GPU con suficiente VRAM y el entorno LeRobot configurado correctamente.
- Licencia Apache 2.0: permite uso comercial, pero hay que atribuir correctamente y no usar marcas registradas.
- Sin soporte multilingüe: al ser un modelo de acción, no procesa lenguaje natural; las instrucciones se pasan como texto fijo en la tarea.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/addisonhammer/pi05_so101_pink_die)
- [Dataset de entrenamiento](https://huggingface.co/datasets/addisonhammer/so101_pink_die_in_cup_20260817_220140)
- [Documentación de LeRobot para Pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware SO-101](https://wiki.seeedstudio.com/lerobot_so100m/)
- [Blog de Physical Intelligence sobre Pi05](https://www.physicalintelligence.company/blog/pi05)
