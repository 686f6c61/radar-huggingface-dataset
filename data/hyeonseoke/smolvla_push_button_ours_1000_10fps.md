# HyeonseokE/smolvla_push_button_ours_1000_10fps

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por el equipo de Hugging Face, pensado para el control de robots mediante aprendizaje por imitación. Este modelo concreto, `HyeonseokE/smolvla_push_button_ours_1000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` entrenado sobre un dataset de 100 episodios a 10 FPS para la tarea de pulsar un botón rojo con un robot manipulador tipo `so101_follower`.

Con aproximadamente 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y pequeñas empresas que necesitan desplegar políticas robóticas sin infraestructura de alto coste. El modelo consume observaciones de estado del robot y de tres cámaras (256x256) y genera acciones de 6 dimensiones que controlan las articulaciones del robot. Este fine-tuning concreto fue entrenado con 11.380 frames y 8.850 pasos de optimización, y se distribuye bajo licencia Apache 2.0 en formato safetensors.

La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede adaptarse a tareas de manipulación específicas con un número reducido de episodios, lo que abarata el desarrollo de soluciones robóticas personalizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action que integra un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este fine-tuning, el modelo parte de `lerobot/smolvla_base` y se entrena con el dataset `HyeonseokE/push_button_ours_10fps`, que contiene 100 episodios y 11.380 frames a 10 FPS. La tarea específica es "Press the red button".

El entrenamiento se realizó con 8.850 pasos, batch size de 64, optimizador AdamW y learning rate de 0.0001, con semilla 1000 y la versión 0.6.0 de LeRobot. No se indica que se haya aplicado RLHF o DPO. La entrada del modelo incluye el estado del robot (6 dimensiones) y tres imágenes de cámaras de 256x256 píxeles, mientras que la salida es una acción de 6 dimensiones correspondiente a posiciones articulares en radianes. El modelo está diseñado para ejecutarse en hardware de consumo, según el paper original de SmolVLA (arXiv:2506.01844).

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales y de estado.
- Procesamiento de imágenes de tres cámaras simultáneamente (resolución 256x256).
- Ejecución de la tarea específica de pulsar un botón rojo en un robot tipo `so101_follower`.
- Soporte de inferencia en tiempo real a 10 FPS, según la frecuencia de muestreo del dataset.
- Integración con el framework LeRobot para entrenamiento y despliegue.
- No soporta tool calling, generación de texto libre ni razonamiento de propósito general; es un modelo de política robótica.

## Casos de uso

- Automatización de tareas de pulsación de botones en líneas de ensamblaje: el modelo puede controlar un manipulador para pulsar botones físicos en un proceso industrial, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un VLA compacto se adapta a una tarea concreta con pocos episodios de demostración.
- Despliegue de robots en laboratorios: permite ejecutar una política de pulsación de botón en un robot de bajo coste tipo `so101_follower`, ideal para entornos académicos.
- Prototipado rápido de comportamientos robóticos: al ser un fine-tuning concreto, puede usarse como punto de partida para transferir el modelo a tareas similares mediante fine-tuning adicional.
- Evaluación de políticas robóticas en entornos controlados: el modelo puede desplegarse en un robot real o en simulación para medir tasas de éxito en la tarea de pulsar botón.
- Educación en robótica: permite a estudiantes y docentes experimentar con un modelo VLA real sin necesidad de GPUs de alto coste, gracias a su tamaño compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado el tamaño de 450 millones de parámetros, en FP32 se estima un consumo de aproximadamente 1,8 GB solo para los pesos; el procesamiento de imágenes y el framework pueden incrementar el uso total.
- GPU recomendadas: no disponible oficialmente. Por su diseño compacto, se espera que funcione en GPUs de consumo como RTX 3060 o superiores, aunque no hay confirmación del fabricante.
- Compatibilidad con consumer GPU: probablemente sí, dado el objetivo de SmolVLA de ejecutarse en hardware asequible, pero no hay datos verificados.
- Opciones de despliegue: LeRobot (framework oficial), con soporte para inferencia en local mediante `lerobot-rollout`. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_push_button_ours_1000_10fps | 450.046.176 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| HyeonseokE/smolvla_push_button_ours_3000_10fps | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

Este modelo es un fine-tuning de `lerobot/smolvla_base` y pertenece a una familia de variantes del mismo autor para tareas de pulsación y manipulación. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar entrenado con un dataset pequeño (100 episodios) en un entorno concreto, el modelo puede heredar sesgos de la recogida de datos, como la posición inicial del robot o la iluminación.
- Riesgo de alucinación en las acciones generadas si la escena difiere de las condiciones de entrenamiento; puede producir movimientos no deseados.
- Limitaciones de contexto e idioma: el modelo no es un modelo de lenguaje de propósito general; solo interpreta la tarea para la que fue entrenado y no puede procesar instrucciones libres fuera de ese dominio.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue seguro en robots requiere validación previa y medidas de seguridad.
- El modelo no ha sido evaluado en el robot real según la model card, por lo que la tasa de éxito es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_push_button_ours_1000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper en arXiv: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_button_ours_10fps
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
