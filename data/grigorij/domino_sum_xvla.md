# Grigorij/Domino_sum_xvla

## Resumen

El modelo `Grigorij/Domino_sum_xvla` es un fine-tune del modelo base `lerobot/xvla-base`, desarrollado por el usuario Grigorij y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de una política de robótica basada en el framework X-VLA (Vision-Language-Action), que emplea soft prompts y flow matching para controlar un robot manipulador tipo `so_follower`. El modelo ha sido entrenado específicamente para la tarea de agarrar una ficha de dominó situada a la izquierda y colocarla con precisión junto a otra ficha central, utilizando dos cámaras (frontal y de brazo) y un estado del robot de 8 dimensiones.

Este modelo resuelve el problema de la manipulación robótica guiada por lenguaje natural en entornos controlados, demostrando la capacidad de adaptar un modelo VLA preentrenado a una tarea concreta mediante fine-tuning con un dataset reducido (49 episodios). Su relevancia radica en que ejemplifica el flujo de trabajo de LeRobot para entrenar y desplegar políticas robóticas, y en que permite evaluar la eficacia de X-VLA en tareas de precisión. Con aproximadamente 880 millones de parámetros, el modelo es relativamente ligero en comparación con otros VLA, lo que facilita su ejecución en hardware asequible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con soft prompts y flow matching (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa imágenes y estado, no texto largo) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión no especificada) |
| Idiomas soportados | No disponible (las instrucciones están en inglés, pero no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

X-VLA es un framework de políticas de visión-lenguaje-acción que introduce un conjunto reducido de embeddings de soft prompt aprendibles para codificar cada configuración robótica como una "tarea". Esto permite que un único modelo base reconcilie distintas morfologías, sensores y espacios de acción. La generación de acciones se realiza mediante flow matching, una técnica que modela la transformación progresiva de ruido a acciones reales. El modelo base `lerobot/xvla-base` fue preentrenado con datos heterogéneos de múltiples plataformas, y este fine-tune lo adapta a una tarea específica de manipulación.

El entrenamiento se realizó con el dataset `Grigorij/Domino_sum`, que contiene 49 episodios y 64.960 frames a 30 FPS, con dos tareas descritas en lenguaje natural. Se ejecutaron 20.000 pasos de entrenamiento con un batch size de 8, optimizador `xvla-adamw`, tasa de aprendizaje de 0,0001 y semilla 1000, utilizando la librería LeRobot versión 0.6.1. No se especifica el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Control de un robot manipulador tipo `so_follower` mediante comandos en lenguaje natural (tareas específicas de colocación de fichas).
- Procesamiento de entradas visuales de dos cámaras (frontal y de brazo) con resoluciones de 256×256 y 224×224 píxeles.
- Generación de acciones de 6 dimensiones (posición y orientación del efector) a partir de observaciones de estado de 8 dimensiones.
- Adaptación a una tarea concreta mediante fine-tuning sobre un dataset pequeño, gracias a los soft prompts de X-VLA.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido tradicional de los LLM; su función es exclusivamente robótica.

## Casos de uso

- Automatización de tareas de manipulación de precisión en líneas de montaje: el modelo puede colocar componentes pequeños (como fichas) en posiciones exactas, reduciendo errores humanos en entornos industriales.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevas tareas con pocos datos.
- Desarrollo de prototipos en laboratorio: permite validar el flujo de trabajo de LeRobot para entrenar políticas personalizadas en robots de bajo coste.
- Pruebas de robustez en manipulación con lenguaje natural: se puede evaluar la respuesta del modelo a variaciones en las instrucciones (por ejemplo, cambiar la posición de la ficha).
- Benchmarking de frameworks VLA: comparar el rendimiento de X-VLA frente a otros métodos (Pi0, SmolVLA) en tareas de precisión.
- Educación y formación en robótica: el modelo y su dataset son recursos útiles para enseñar conceptos de aprendizaje por imitación y visión-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en el robot real.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la documentación.
- Con ~880M de parámetros, el modelo en precisión fp32 ocuparía aproximadamente 3,5 GB de memoria, y en bf16/fp16 unos 1,8 GB, por lo que podría ejecutarse en GPUs de consumo como una RTX 3060 (12 GB) o superior.
- Para inferencia en tiempo real con cámaras, se recomienda una GPU con al menos 8 GB de VRAM para mantener una tasa de fotogramas adecuada.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan sobre el robot. No se mencionan integraciones con vLLM, llama.cpp u otros motores, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen de la GPU y del número de cámaras; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Grigorij/Domino_sum_xvla` | ~880M | No aplica | Colocación de fichas de dominó | Apache 2.0 | Hugging Face |
| `lerobot/xvla-libero` | No disponible | No aplica | Simulación (LIBERO, 93% de éxito) | Apache 2.0 | Hugging Face |
| `lerobot/xvla-widowx` | No disponible | No aplica | Pick-and-place en plataforma WidowX | Apache 2.0 | Hugging Face |

Los tres modelos comparten la misma arquitectura base X-VLA y se diferencian en la tarea y el dataset de fine-tuning. `xvla-libero` y `xvla-widowx` son referencias oficiales de LeRobot con resultados reportados, mientras que `Domino_sum_xvla` es un fine-tune comunitario sin evaluación publicada.

## Limitaciones y advertencias

- No hay resultados de evaluación en el robot real, por lo que el rendimiento real es desconocido y podría no alcanzar la precisión esperada.
- El dataset de entrenamiento es muy pequeño (49 episodios) y específico de una tarea, lo que puede provocar sobreajuste y falta de generalización a variaciones del entorno (iluminación, posición de objetos, distracciones).
- Las instrucciones de las tareas están en inglés; no se ha probado el modelo con otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del framework LeRobot y de la configuración específica del robot `so_follower`, lo que limita su portabilidad a otros hardware sin reentrenamiento.
- No se especifican sesgos ni riesgos de alucinación (típicos de modelos de lenguaje), pero en robótica existe el riesgo de movimientos erráticos o inseguros si el modelo recibe observaciones fuera de la distribución de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Grigorij/Domino_sum_xvla
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/Domino_sum
- Paper X-VLA: https://arxiv.org/abs/2510.10274
- Guía de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo base: https://huggingface.co/lerobot/xvla-base
