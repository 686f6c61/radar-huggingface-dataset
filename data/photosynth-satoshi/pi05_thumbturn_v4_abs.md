# photosynth-satoshi/pi05_thumbturn_v4_abs

## Resumen

Este modelo es un fine-tune del modelo VLA (Vision-Language-Action) π₀.₅ (Pi05) de Physical Intelligence, desarrollado por el usuario photosynth-satoshi y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está entrenado específicamente para la tarea de desbloquear un pomo de puerta (thumbturn) mediante control robótico, usando el framework LeRobot. Se parte del modelo base `lerobot/pi05_base` y se ajusta con un dataset de 230 episodios (71.583 frames a 30 FPS) recogidos con un robot de tipo `so_follower`.

El modelo consume imágenes de dos cámaras (base y muñeca izquierda) junto con un estado de 6 dimensiones, y produce acciones de control de 6 grados de libertad. Con 4.143.404.816 parámetros, es un modelo de tamaño considerable para robótica, diseñado para generalizar a entornos nuevos mediante co-entrenamiento y conocimiento aislado (knowledge insulation), tal como describe el paper de π₀.₅. Esta versión concreta está orientada a la automatización de tareas de manipulación en entornos domésticos o industriales, siendo un ejemplo práctico de fine-tuning de un VLA para una tarea específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (VLA: Vision-Language-Action, transformer con flow matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA que extiende π₀ para mejorar la generalización en entornos no vistos durante el entrenamiento. π₀.₅ utiliza co-training sobre datos heterogéneos y un mecanismo de aislamiento del conocimiento (knowledge insulation) para evitar interferencias entre tareas. En esta implementación con LeRobot, se parte del checkpoint `lerobot/pi05_base` y se realiza un fine-tuning con el dataset `photosynth-satoshi/so101_unlock_thumbturn_v4`, que contiene 230 episodios de la tarea "Unlock the thumbturn" (desbloquear un pomo de cerradura). La configuración de entrenamiento incluye 10.000 pasos, batch size de 32, optimizador AdamW con learning rate 2,5e-5 y semilla 1000, ejecutado con LeRobot versión 0.6.2. El modelo se entrena para mapear observaciones (estado de 6 dimensiones + imágenes de 480x640 de dos cámaras) a acciones de control de 6 grados de libertad.

## Capacidades

- Control robótico de un manipulador de tipo `so_follower` para la tarea específica de desbloquear un pomo de cerradura.
- Percepción multimodal: procesa simultáneamente imágenes de una cámara base y una cámara de muñeca (resolución 480x640).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas CLI de LeRobot.
- Soporte de fine-tuning sobre el modelo base `lerobot/pi05_base` para adaptarse a otras tareas de manipulación.
- Ejecución en tiempo real (30 FPS) durante el rollout, lo que permite operaciones en bucle cerrado.
- No incluye capacidades de lenguaje natural, tool calling ni agentes conversacionales.

## Casos de uso

- Automatización de acceso a instalaciones: el modelo puede controlar un robot para desbloquear puertas con cerradura de pomo en entornos de oficina o residenciales, reduciendo la necesidad de intervención humana.
- Pruebas de manipulación de precisión en laboratorios de robótica: sirve como referencia para evaluar el rendimiento de políticas VLA en tareas de contacto físico con mecanismos de giro.
- Integración en sistemas de robótica de asistencia doméstica: se puede desplegar en un brazo robótico para abrir puertas con pomo, complementando otras capacidades como navegación o agarre.
- Investigación en aprendizaje por imitación: al ser un modelo de código abierto y entrenado con LeRobot, permite estudiar el efecto del fine-tuning sobre un VLA base en una tarea concreta.
- Desarrollo de políticas de control para entornos no estructurados: la tarea de desbloqueo requiere generalización a variaciones de posición y orientación del pomo, lo que sirve para testear la robustez del modelo.
- Base para nuevos fine-tunes: el checkpoint puede servir como punto de partida para adaptar el modelo a tareas similares de manipulación con otros mecanismos (manillas, pestillos, etc.) mediante entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye datos de evaluación en robot real (número de trials, tasa de éxito). El autor no proporciona métricas de rendimiento adicionales.

## Requisitos de hardware

- VRAM estimada: al tener 4.143 M de parámetros, en FP32 el modelo requiere aproximadamente 16,5 GB de memoria; en FP16 o BF16 se reduce a unos 8,3 GB. Se recomienda al menos una GPU con 16 GB de VRAM para inferencia en FP32, o 8-10 GB para FP16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior, A100 (40/80 GB), H100 (80 GB). En GPUs de consumo como RTX 3090 (24 GB) también es viable.
- No se recomienda para GPUs de gama baja (menos de 8 GB) sin cuantización, pero no se han publicado versiones cuantizadas.
- Despliegue: compatible con LeRobot (CLI de rollout), PyTorch, y puede integrarse con frameworks como vLLM o TGI para inferencia en producción, aunque no hay guías oficiales para estos.
- Latencia: no se especifican datos. Dado que el modelo está diseñado para operar a 30 FPS en un robot, se espera una latencia de decenas de milisegundos por paso en GPUs de alta gama.

## Comparativa con modelos similares

No hay datos comparativos directos disponibles en la información proporcionada. El modelo es un fine-tune específico de `lerobot/pi05_base`, por lo que su comparación natural sería con el propio modelo base o con otros VLA como π₀ (el predecesor) o OpenVLA. Sin embargo, no se dispone de métricas de rendimiento para realizar una comparación cuantitativa. Se puede señalar que, al ser un fine-tune, su rendimiento está acotado a la tarea de desbloqueo, mientras que el modelo base tiene capacidades más generales. La licencia Apache-2.0 permite uso comercial, a diferencia de algunos modelos de robótica con licencias más restrictivas.

## Limitaciones y advertencias

- No se han publicado evaluaciones en robot real, por lo que el rendimiento real en entornos no controlados es desconocido.
- El modelo está entrenado para una tarea específica (desbloquear un pomo) y no generaliza a otras tareas de manipulación sin un nuevo fine-tuning.
- Depende de la configuración de cámaras y del tipo de robot `so_follower`; cualquier cambio en la disposición de las cámaras o en el hardware puede degradar el rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de idoneidad para aplicaciones de seguridad o de alto riesgo.
- No se proporcionan datos sobre sesgos o alucinaciones; al ser un modelo de control robótico, el riesgo de comportamiento imprevisto en entornos no vistos debe mitigarse con pruebas exhaustivas.
- El dataset de entrenamiento es pequeño (230 episodios), lo que puede limitar la generalización a variaciones del entorno (iluminación, posiciones, colores).

## Enlaces

- Hugging Face: https://huggingface.co/photosynth-satoshi/pi05_thumbturn_v4_abs
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/photosynth-satoshi/so101_unlock_thumbturn_v4
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Repositorio OpenPI: https://github.com/Starsshine21/pi05/tree/main/openpi_official
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
