# phawitbinabik/smolvla_Z_CUBE_REAL

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta variante concreta, `phawitbinabik/smolvla_Z_CUBE_REAL`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `phawitbinabik/Z_CUBE_REAL`, orientado a una tarea específica de manipulación. El modelo cuenta con 450.292.449 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB.

La relevancia de SmolVLA radica en que demuestra que es posible obtener políticas VLA competitivas con un coste computacional reducido, hasta el punto de poder desplegarse en hardware de consumo. Frente a modelos VLA de gran escala que requieren GPUs de centro de datos, esta familia de modelos está pensada para iteración rápida, prototipado en laboratorio y despliegue en robots de bajo coste como la plataforma SO-100/SO-101 de LeRobot.

Este checkpoint en particular es un artefacto de investigación publicado por un usuario individual, con cero descargas y sin métricas de evaluación publicadas. Su interés es el de un ejemplo reproducible de fine-tuning de SmolVLA sobre un dataset propio, no el de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, implementada en LeRobot |
| Parámetros totales | 450.292.449 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Dataset de fine-tuning | phawitbinabik/Z_CUBE_REAL |
| Librería | lerobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política VLA que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que produce comandos motores de forma iterativa. El paper asociado (arXiv:2506.01844) describe el diseño como una arquitectura eficiente orientada a reducir el coste computacional manteniendo un rendimiento competitivo frente a modelos VLA de mayor tamaño, con capacidad de ejecutarse en hardware de consumo. La implementación práctica se distribuye a través de la librería LeRobot, que gestiona tanto el entrenamiento por imitación como la inferencia sobre robots reales.

Este checkpoint concreto se obtiene por fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `phawitbinabik/Z_CUBE_REAL`. No se dispone de información publicada sobre el número de episodios del dataset, la composición de las trayectorias, el número de tokens de entrenamiento ni si se aplicaron técnicas de refinamiento adicionales como RLHF o DPO. El entrenamiento se realizó presumiblemente mediante aprendizaje por imitación (behavior cloning) usando las herramientas de LeRobot, pero este extremo no está documentado en la model card.

## Capacidades

- Control robótico de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generación de secuencias de acciones (action chunks) para robots tipo SO-100/SO-101 mediante `lerobot-record`.
- Ejecución de políticas entrenadas por imitación sobre tareas específicas del dataset de fine-tuning.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Capacidades multilingües: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión general o audio: no disponible (la visión se usa como entrada para la política de control, no para descripción de imágenes).

## Casos de uso

- Manipulación de un cubo en entorno real: el modelo se entrenó específicamente sobre el dataset `Z_CUBE_REAL`, por lo que su uso previsto es la ejecución de la tarea de agarre o manipulación de un cubo capturada en dicho dataset.
- Reproducción de experimentos de investigación en VLA: sirve como referencia de fine-tuning de SmolVLA sobre un dataset propio, útil para comparar hiperparámetros y estrategias de recogida de datos.
- Prototipado en robot de bajo coste: al ser un modelo de 450 M de parámetros y 0,9 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas en laboratorio.
- Base para fine-tuning adicional: al estar licenciado Apache 2.0 y derivar de `lerobot/smolvla_base`, puede reentrenarse sobre nuevos datasets de manipulación sin restricciones de licencia.
- Evaluación de pipelines de LeRobot: permite validar el flujo completo `lerobot-train` → `lerobot-record` con un checkpoint real y un dataset asociado.
- Docencia y formación en robótica: ejemplo completo y ligero de política VLA entrenada por imitación para cursos prácticos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en fp32 el peso ronda 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de activaciones.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una GPU de consumo con al menos 8 GB de VRAM debería ser suficiente en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint y la orientación del modelo base a hardware de consumo, aunque no hay confirmación oficial para este fine-tuning concreto.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de ejecución en CUDA o CPU según la configuración del entorno.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| phawitbinabik/smolvla_Z_CUBE_REAL | 450.292.449 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning específico sobre Z_CUBE_REAL |
| lerobot/smolvla_base | no disponible en la información | no disponible | Apache 2.0 | Hugging Face (modelo base oficial) | Checkpoint base del que deriva este modelo |
| Otros modelos VLA (p. ej. familias OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Modelo de investigación sin métricas de evaluación publicadas: no hay tasas de éxito ni validación independiente de la política.
- Especialización estrecha: entrenado sobre un único dataset (`Z_CUBE_REAL`), por lo que no se espera generalización a otras tareas, objetos o entornos.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios de iluminación, cámara o posición del robot pueden degradar el comportamiento.
- Sin información sobre sesgos: no se documentan sesgos demográficos, lingüísticos ni de otro tipo, ni la composición del dataset.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento ante instrucciones en castellano u otras lenguas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- Para producción robótica real se recomienda validación exhaustiva en el entorno objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/smolvla_Z_CUBE_REAL
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
