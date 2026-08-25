# hersis0219/act_pusht_v1

## Resumen

El modelo `hersis0219/act_pusht_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada y publicada mediante la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. Este modelo concreto ha sido entrenado para resolver la tarea PushT, consistente en empujar un bloque con forma de T hasta una zona objetivo con la misma forma, en un entorno simulado.

El modelo cuenta con 51.660.418 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras, adecuadas para experimentación en entornos de investigación y para su despliegue en hardware modesto. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Aunque no se han publicado resultados de evaluación, su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas ACT con LeRobot, reproducible y adaptable a otras tareas de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.660.418 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador y un decodificador Transformer con un módulo de autoencoder variacional condicional (CVAE). El modelo recibe como entrada una imagen de 96x96 píxeles (observación visual) y un vector de estado de 2 dimensiones (posición y orientación del efector, probablemente), y produce como salida un chunk de acciones de 2 dimensiones. La inclusión del CVAE permite modelar la variabilidad multimodal de las demostraciones, lo que resulta en políticas más robustas frente a la ambigüedad en los datos.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`, que contiene 206 episodios y 25.650 fotogramas a 10 FPS, todos etiquetados con la tarea "Push the T-shaped block onto the T-shaped target". La configuración de entrenamiento incluye 25.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-05 y semilla 1000. Se utilizó la versión 0.6.2 de LeRobot. No se menciona el uso de técnicas de refinamiento adicionales como RLHF o DPO, ya que se trata de un pipeline de aprendizaje por imitación supervisado.

## Capacidades

- Control robótico por imitación: el modelo es capaz de generar secuencias de acciones para empujar un objeto en un entorno simulado, basándose en observaciones visuales y de estado.
- Procesamiento de visión: acepta imágenes de 96x96 píxeles como entrada, lo que implica una capacidad básica de percepción visual para la tarea específica.
- Predicción de acciones en chunks: en lugar de emitir una acción por paso, predice un bloque de acciones, lo que mejora la coherencia temporal del movimiento.
- Entrenamiento reproducible: al estar integrado con LeRobot, el modelo puede ser reentrenado o ajustado finamente con relativa facilidad sobre otros datasets de imitación.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de políticas ACT en tareas de empuje, comparando con variantes de difusión u otros métodos.
- Desarrollo de prototipos en simulación: puede integrarse en entornos como MuJoCo o PyMunk para validar algoritmos de control antes de transferirlos a robots físicos.
- Fine-tuning para tareas similares: dado su tamaño reducido, es factible ajustar el modelo sobre datasets propios de empuje o manipulación con pocos episodios, gracias a la capacidad de generalización de ACT.
- Benchmarking de frameworks de robótica: al estar publicado con LeRobot, puede utilizarse como caso de prueba para evaluar el rendimiento de la librería en tareas de control.
- Educación y formación: es un ejemplo didáctico para aprender a entrenar y desplegar políticas de imitación con Transformers en robótica.
- Base para políticas híbridas: puede combinarse con otros módulos (por ejemplo, planificadores de alto nivel) para construir sistemas de manipulación más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación para esta política.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware. Dado el tamaño del modelo (51,6 M parámetros, 0,2 GB en safetensors), se estima que la inferencia puede ejecutarse en GPUs con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior, aunque no hay datos confirmados.
- El entrenamiento se realizó presumiblemente en una GPU de gama media o alta; la configuración de 25.000 pasos con batch size 8 es asumible en una RTX 3060 o similar.
- Para despliegue, LeRobot ofrece integración con `lerobot-rollout` y soporta ejecución en CPU, aunque con menor rendimiento.
- No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados. Se identifican modelos alternativos para la misma tarea PushT, como `MonishBalu/act_pusht_model` (también basado en ACT) y `lerobot/diffusion_pusht` (basado en Diffusion Policy), pero no se han encontrado especificaciones públicas de estos modelos (parámetros, contexto, rendimiento). Por tanto, no es posible realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea PushT en un entorno simulado; no es generalizable a otras tareas sin reentrenamiento.
- No se han proporcionado resultados de evaluación, por lo que se desconoce su tasa de éxito real en el entorno objetivo.
- El tipo de robot no está especificado (`unknown`), lo que limita la reproducibilidad en hardware físico.
- La entrada de imagen es de baja resolución (96x96), lo que puede limitar su rendimiento en entornos con mayor complejidad visual.
- Al ser un modelo de imitación, su comportamiento depende en gran medida de la calidad y diversidad de las demostraciones del dataset.
- Aunque la licencia Apache 2.0 permite uso comercial, no se garantiza la seguridad del modelo en aplicaciones de robótica real sin una validación exhaustiva.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/hersis0219/act_pusht_v1)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Dataset lerobot/pusht](https://huggingface.co/datasets/lerobot/pusht)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
