# eslab1234/smolvla_multitask_666ep_fullft_100k

## Resumen

El modelo `eslab1234/smolvla_multitask_666ep_fullft_100k` es un fine-tune de **SmolVLA**, un modelo compacto de visión-lenguaje-acción (Vision-Language-Action, VLA) desarrollado por el equipo de Hugging Face. SmolVLA está diseñado para tareas de robótica de manipulación, generando acciones de baja dimensión a partir de observaciones visuales y de estado, con un coste computacional reducido que permite su ejecución en hardware de consumo. Este fine-tune concreto ha sido entrenado por `eslab1234` sobre un dataset propio de multitarea con 666 episodios y más de un millón de frames, centrado en tareas de recogida y apilamiento de bloques de colores.

El modelo parte del checkpoint base `lerobot/smolvla_base` y ha sido ajustado con 100.000 pasos de entrenamiento utilizando la librería LeRobot. Implementado con 450.046.176 parámetros y un tamaño de repositorio de 0.9 GB, es un modelo ligero para el dominio de la robótica, con arquitectura de política basada en aprendizaje por imitación. Se distribuye bajo licencia Apache 2.0 y está formateado en `safetensors`.

A diferencia de un modelo de lenguaje convencional, este artefacto no genera texto, sino que produce trayectorias de acción (6 dimensiones) a partir de tres entradas visuales (cámaras) y el estado del robot. Su relevancia actual radica en la creciente demanda de modelos de política eficientes, desplegables en robots de bajo coste y en entornos de investigación con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de tipo VLA presentado en el paper `arXiv:2506.01844`. Su arquitectura combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, permitiendo que el modelo procese imágenes y estado del robot para producir comandos de acción. Es una arquitectura de política de aprendizaje por imitación, optimizada para reducir costes computacionales frente a modelos VLA más grandes, lo que habilita su despliegue en hardware de consumo.

El fine-tune se realizó sobre el dataset `eslab1234/multitask_5blocks_v3_666ep_merged`, compuesto por 666 episodios y 1.061.724 frames a 30 FPS. Las tareas consisten en recoger cinco bloques en secuencia (rojo, amarillo, madera, verde, azul) y colocarlos o apilarlos en un área objetivo. La configuración de entrenamiento incluye 100.000 pasos, batch size de 16, optimizador AdamW, learning rate de 1e-05 y seed 1000. El entrenamiento se gestionó con LeRobot en su versión 0.5.2, partiendo del checkpoint preentrenado `lerobot/smolvla_base`.

Una característica técnica destacable es el uso de tres cámaras como entradas visuales (top y wrist, según la model card) junto al estado del robot, generando una salida de acción de 6 dimensiones. No se reportan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de trayectorias de acción (6 dimensiones) para manipulación robótica, a partir de observaciones de estado y tres imágenes de cámara.
- Ejecución de tareas de pick-and-place y apilamiento de bloques codificados por colores, siguiendo secuencias de instrucciones en inglés.
- Aprendizaje por imitación basado en demostraciones humanas recopiladas en el dataset de entrenamiento (666 episodios).
- Procesamiento de múltiples vistas visuales: cámaras superior y de muñeca, lo que permite manejar objetos ocluidos o cambiar de perspectiva.
- No soporta generación de texto, tool calling, agentes conversacionales ni razonamiento simbólico: su salida es exclusivamente acción, no lenguaje.
- Capacidades multilingües no aplicables, al tratarse de un modelo de política robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: este modelo puede utilizarse como baseline para estudiar políticas visuales de manipulación. Se ejecuta con LeRobot y permite comparar estrategias de entrenamiento, datos y arquitecturas sobre un mismo dominio de tareas.
- Prototipado rápido de robots manipuladores: gracias a su ligereza (450 M de parámetros) y su integración con LeRobot, es posible desplegarlo en robots de bajo coste tipo `so_follower` para pruebas de laboratorio en pocas horas.
- Automatización de tareas de ensamblaje en entornos controlados: el modelo puede gestionar secuencias de apilamiento de piezas (por ejemplo, bloques de colores) en una mesa, útil para líneas de montaje simuladas o pequeños sistemas de fabricación.
- Educación en robótica y sistemas embebidos: al ser un VLA compacto, puede ejecutarse en GPUs de consumo, facilitando la enseñanza de modelos de política a estudiantes sin acceso a clústeres de alto rendimiento.
- Recogida y ordenación de objetos en escenarios de laboratorio: el modelo está entrenado para coger bloques en un orden específico y colocarlos en un área objetivo, lo que reproduce tareas típicas de clasificación o preparación de muestras.
- Evaluación de robustez en tareas secuenciales multi-paso: con 666 episodios y más de un millón de frames, sirve como caso de estudio para medir la capacidad de un modelo de política de mantener una secuencia larga de acciones sin perder el objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente: *"No evaluation results have been provided for this policy yet."* Por tanto, no se dispone de métricas como tasa de éxito, precisión de trayectorias ni comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado ninguna medición oficial de consumo de memoria.
- GPU recomendadas: no disponible. Por su tamaño de 450 M de parámetros y el procesamiento de tres imágenes de 256x256, se espera que pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superior), pero esto es una estimación no confirmada.
- Compatibilidad con hardware consumer: probable, dado el diseño de SmolVLA orientado a hardware de consumo, pero sin datos verificados.
- Opciones de despliegue: exclusivamente mediante la librería LeRobot. Se proporcionan comandos `lerobot-rollout` y `lerobot-train` en la documentación del modelo. No se mencionan integraciones con vLLM, llama.cpp u OIla.
- Latency y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen datos comparativos con otros modelos VLA. El modelo es un fine-tune de `lerobot/smolvla_base`, lo que lo sitúa en la misma familia que otros checkpoints de SmolVLA, pero no se disponen de métricas cuantitativas para establecer una comparación.

## Limitaciones y advertencias

- No se ha proporcionado ningún resultado de evaluación real sobre robot, por lo que el rendimiento real de la política no ha sido validado oficialmente.
- El dominio de entrenamiento es muy restringido: bloques de cinco colores en una disposición específica, sobre una mesa. La generalización a otros objetos, texturas, iluminaciones o disposiciones del entorno es incierta.
- Las instrucciones de las tareas están formuladas en inglés; no se ha evaluado el comportamiento con instrucciones en otros idiomas.
- Al ser un modelo de política, una predicción errónea o "alucinación" de acciones puede provocar movimientos no deseados del robot. Cualquier despliegue en producción debe incluir límites de seguridad y supervisión humana.
- No se especifican tipos de cuantización ni requisitos de calibración de cámaras, lo que puede complicar la reproducibilidad en configuraciones distintas a la original.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de validar la seguridad del modelo en su aplicación concreta.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/eslab1234/smolvla_multitask_666ep_fullft_100k
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/multitask_5blocks_v3_666ep_merged
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
