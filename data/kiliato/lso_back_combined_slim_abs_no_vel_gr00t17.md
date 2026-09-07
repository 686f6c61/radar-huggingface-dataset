# kiliato/lso_back_combined_slim_abs_no_vel_GR00T17

## Resumen

Este modelo es una política de control robótico desarrollada por kiliato sobre la arquitectura GR00T N1.7 de NVIDIA. Se trata de un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides, que combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformador de acciones basado en flow-matching. Está especializado en la tarea concreta de encender un interruptor de luz (`Turn on the lightswitch`).

El modelo tiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y fue entrenado con el framework LeRobot. Su salida son acciones de 7 dimensiones (movimientos del robot) condicionadas por una imagen de cámara derecha de 720x720 y un estado propioceptivo de 7 dimensiones. La relevancia de este modelo radica en que demuestra cómo adaptar un modelo fundacional de robótica de gran tamaño a una tarea específica mediante imitación, usando un conjunto de datos relativamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer de flow-matching) |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, que utiliza un backbone Cosmos-Reason2/Qwen3-VL para procesar observaciones visuales y lingüísticas, y un action transformer de flow-matching para generar acciones. La política fue entrenada con la librería LeRobot sobre el dataset `kiliato/lso_back_combined_slim_abs_no_vel`, que contiene 70 episodios y 70.033 fotogramas a 50 FPS de la tarea `Turn on the lightswitch`.

La configuración de entrenamiento incluye 20.000 pasos, batch size 32, optimizador AdamW, learning rate 0.0001 y semilla 42. No se indica que se hayan aplicado técnicas de RLHF o DPO; el entrenamiento es de imitación supervisada.

## Capacidades

- Predicción de acciones de control para robótica: genera vectores de acción de 7 dimensiones para el robot, condicionados por observaciones visuales (cámara derecha) y propioceptivas (estado del robot).
- Procesamiento visual: acepta imágenes de 720x720 píxeles de una única cámara.
- Integración con LeRobot: compatible con los pipelines de entrenamiento e inferencia de LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling ni generación de texto libre: el modelo está diseñado exclusivamente como política de control y no expone funciones de llamada a herramientas.
- Capacidades multilingües: no disponibles.
- No se han reportado capacidades de agente o razonamiento multi-paso más allá de las inherentes al backbone de visión-lenguaje subyacente.

## Casos de uso

- Automatización de encendido de interruptores en hogares: el modelo puede integrarse en un robot manipulador para ejecutar la tarea de activar interruptores de luz, mejorando la accesibilidad en viviendas inteligentes.
- Gestión de interruptores de seguridad en plantas industriales: un robot humanoides o brazo robótico equipado con este modelo puede accionar interruptores de parada de emergencia en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como baseline entrenado con GR00T N1.7 y LeRobot para estudiar la transferencia de políticas entre entornos.
- Asistencia robótica para personas con movilidad reducida: el modelo permite que un robot doméstico realice acciones físicas concretas como encender la luz, reduciendo la dependencia de cuidadores.
- Desarrollo de políticas de bajo nivel en brazos robóticos: ofrece una salida de control en 7 DOF (grados de libertad) adecuada para la integración en controladores de robots reales.
- Benchmarking de generalización en robótica: al estar publicado con un dataset asociado, permite comparar políticas de imitación en la misma tarea bajo diferentes configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del checkpoint es de 12.6 GB en safetensors. Para inferencia, el modelo de 3.144.016.000 parámetros requiere una GPU con al menos 8 GB de VRAM en FP16, pero se recomienda 16 GB para margen. Estos valores son estimaciones basadas en el tamaño; no se han publicado requisitos oficiales.
- Se puede ejecutar en GPUs de consumo como una RTX 4090 (24 GB) o superior. En el extremo profesional, A100 o H100 proporcionarían margen durante el entrenamiento.
- El despliegue se realiza a través de LeRobot, usando `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento.

## Comparativa con modelos similares

Modelos similares en la categoría de políticas robóticas entrenadas con GR00T y LeRobot incluyen otros checkpoints de la familia GR00T publicados en HuggingFace. No se dispone de información concreta sobre rendimiento relativo, licencias o disponibilidad de alternativas específicas en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos: no documentados. La política fue entrenada en un único entorno y tarea, por lo que puede reflejar sesgos del dataset.
- Riesgo de alucinación: en el contexto robótico, puede producir acciones incorrectas o inesperadas si la entrada visual difiere de lo visto en entrenamiento.
- Limitaciones de generalización: al estar entrenado solo para `Turn on the lightswitch` con imágenes de la cámara derecha, puede no generalizar a otras tareas, objetos o configuraciones de cámara.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes de NVIDIA (GR00T N1.7) que pueden tener sus propias condiciones; el autor no proporciona detalles adicionales.
- No se han publicado resultados de evaluación, por lo que el rendimiento real en hardware es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/kiliato/lso_back_combined_slim_abs_no_vel_GR00T17
- Dataset: https://huggingface.co/datasets/kiliato/lso_back_combined_slim_abs_no_vel
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Repositorio LeRobot: https://github.com/huggingface/lerobot
