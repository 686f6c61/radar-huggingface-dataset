# polarisai-robots/bento_v2_openarm_pi05

## Resumen

El modelo `polarisai-robots/bento_v2_openarm_pi05` es una política de control robótico basada en el modelo Vision-Language-Action (VLA) π₀.₅, desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` sobre un dataset propio de demostraciones con un brazo robótico OpenArm, orientado a tareas de empaquetado de comida en una lunchbox. El modelo recibe imágenes de dos cámaras (muñeca y vista superior) junto con el estado del robot (24 dimensiones) y genera acciones de control de 24 dimensiones para el brazo.

Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), este modelo representa una aplicación práctica de los VLA en robótica de manipulación, demostrando cómo un modelo preentrenado de propósito general puede especializarse en tareas concretas mediante fine-tuning con relativamente pocos datos (304 episodios). Su relevancia radica en que combina la generalización de π₀.₅ con la reproducibilidad del hardware OpenArm, un brazo robótico de código abierto, lo que permite a investigadores y desarrolladores experimentar con políticas de manipulación sin depender de plataformas propietarias.

La licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales, y su integración con LeRobot simplifica el despliegue en robots reales. Aunque el modelo está especializado en dos tareas concretas de empaquetado, su arquitectura subyacente está diseñada para generalizar a entornos y situaciones no vistas durante el entrenamiento, una característica clave de la familia π₀.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptación de π₀.₅ |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de control robótico, no procesa texto largo) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión completa) |
| Idiomas soportados | No disponibles (el modelo procesa instrucciones en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA de flujo (flow-based) que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El fine-tuning se realizó sobre el dataset `polarisai-robots/bento_v2_openarm`, que contiene 304 episodios y 437.148 frames a 30 FPS, con dos tareas de empaquetado de lunchbox (con pollo frito y brócoli, o solo brócoli). El entrenamiento se ejecutó durante 40.000 pasos con batch size 32, optimizador AdamW y learning rate 2,5e-5, utilizando la versión 0.6.0 de LeRobot. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, dimensiones ocultas, etc.) en la información disponible.

## Capacidades

- Control robótico de manipulación: genera acciones de 24 dimensiones para el brazo OpenArm a partir de observaciones visuales (dos cámaras) y del estado articular.
- Seguimiento de instrucciones en lenguaje natural: las tareas se describen mediante frases como "Pack me a lunchbox with two fried chicken pieces and two brocolli", que el modelo asocia con las secuencias de acciones correspondientes.
- Generalización a entornos no vistos: al estar basado en π₀.₅, hereda la capacidad de adaptarse a nuevas situaciones, aunque el fine-tuning limita su especialización a las tareas entrenadas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face, incluyendo comandos CLI para rollout y entrenamiento.
- Procesamiento multimodal: combina entradas visuales (imágenes RGB de 480x640) y propioceptivas (estado del robot) para producir acciones.
- Reproducibilidad: al ser un modelo de código abierto con hardware OpenArm también abierto, permite replicar experimentos y comparar resultados.

## Casos de uso

- Empaquetado automatizado de alimentos: el modelo puede controlar un brazo OpenArm para colocar piezas de pollo frito y brócoli en una lunchbox siguiendo instrucciones en lenguaje natural, útil en entornos de preparación de comidas o líneas de ensamblaje.
- Investigación en manipulación robótica: sirve como punto de partida para estudiar técnicas de fine-tuning de VLA en tareas de contacto rico, gracias a su integración con LeRobot y la disponibilidad del dataset.
- Desarrollo de políticas de pick-and-place: aunque entrenado para empaquetado, la arquitectura puede adaptarse a tareas similares de recoger y colocar objetos mediante fine-tuning adicional con nuevos datos.
- Evaluación de hardware robótico: al ser un modelo de referencia para el brazo OpenArm, permite validar el rendimiento del hardware en tareas de manipulación y comparar con otros brazos.
- Demostraciones educativas: en cursos de robótica o IA, el modelo puede utilizarse para ilustrar el flujo completo de recolección de datos, entrenamiento y despliegue de una política VLA.
- Benchmarking de VLA en robótica: al estar disponible públicamente con licencia permisiva, puede emplearse como baseline en investigaciones que comparen diferentes arquitecturas o métodos de entrenamiento para control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, GPU recomendada o latencia en la información disponible.
- Dado que el modelo tiene 4.143.404.816 parámetros, se estima que requiere al menos 8-10 GB de VRAM para inferencia en FP16, y más si se usa precisión completa. Esta es una estimación basada en el tamaño del modelo, no en datos oficiales.
- El despliegue se realiza mediante LeRobot, que requiere una GPU NVIDIA con soporte CUDA. No se mencionan opciones como vLLM o llama.cpp, ya que el modelo no es un LLM generativo de texto sino una política de control.
- El repositorio pesa 37,4 GB, lo que sugiere que los pesos están en FP32 o FP16 sin cuantizar. Para inferencia en tiempo real, se recomienda una GPU de gama alta (por ejemplo, RTX 3090, RTX 4090, A100) para mantener la frecuencia de control necesaria (30 FPS).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para robótica con fine-tuning específico). El modelo base `lerobot/pi05_base` es la referencia inmediata, pero no se proporcionan datos de rendimiento comparativo. Otras alternativas como π₀ original o π₀-FAST existen en el repositorio OpenPI, pero no se incluyen métricas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos tareas de empaquetado de lunchbox; su rendimiento en otras tareas o entornos no está garantizado y requeriría fine-tuning adicional.
- No hay resultados de evaluación publicados, por lo que se desconoce su tasa de éxito real en el robot físico.
- Depende del hardware específico OpenArm y de la configuración de cámaras (muñeca y superior); cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- Al ser un modelo de control robótico, no es adecuado para tareas de generación de texto o razonamiento general; su uso está restringido a entornos de robótica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos de la licencia del modelo base π₀.₅ y del dataset, aunque ambos se indican como Apache 2.0.
- No se especifican sesgos conocidos, pero al entrenarse con un dataset limitado (304 episodios), puede presentar comportamientos subóptimos en condiciones de iluminación, posiciones de objetos o variaciones no representadas en los datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/polarisai-robots/bento_v2_openarm_pi05)
- [Dataset de entrenamiento](https://huggingface.co/datasets/polarisai-robots/bento_v2_openarm)
- [Modelo base π₀.₅](https://huggingface.co/lerobot/pi05_base)
- [Documentación de LeRobot para π₀.₅](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio OpenPI de Physical Intelligence](https://github.com/cmriat/openpi-official)
- [Página oficial de OpenArm](https://openarm.dev/)
- [Repositorio GitHub de OpenArm](https://github.com/enactic/openarm)
