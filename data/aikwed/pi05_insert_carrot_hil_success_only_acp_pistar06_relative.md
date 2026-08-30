# Aikwed/pi05_insert_carrot_hil_success_only_acp_pistar06_relative

## Resumen

El modelo `Aikwed/pi05_insert_carrot_hil_success_only_acp_pistar06_relative` es una política de robótica basada en π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence con generalización de mundo abierto. Esta implementación concreta ha sido entrenada y publicada mediante la librería LeRobot de Hugging Face, utilizando un dataset específico de demostraciones exitosas para la tarea de insertar una zanahoria en un agujero. El modelo cuenta con 3.616.757.520 parámetros (~3,6 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

La relevancia de este modelo radica en que representa un avance hacia la generalización de políticas robóticas en entornos no vistos durante el entrenamiento, un desafío central en robótica. Al estar basado en π₀.₅, hereda la capacidad de co-entrenamiento con datos heterogéneos y la arquitectura VLA que integra percepción visual, comprensión de lenguaje y generación de acciones. Aunque el modelo está especializado en una tarea concreta, su arquitectura subyacente está diseñada para adaptarse a nuevas situaciones, lo que lo convierte en un candidato interesante para experimentación y desarrollo en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ (no se especifican detalles internos) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags y tamaño del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, una evolución de π₀ que introduce co-entrenamiento con datos heterogéneos para lograr generalización en el mundo real. La arquitectura VLA combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, permitiendo que el robot ejecute tareas a partir de instrucciones y observaciones visuales. En esta implementación concreta, el entrenamiento se realizó con el framework LeRobot, utilizando el dataset `Aikwed/insert_carrot_into_the_hole_hil_success_only_acp_pistar06_n50_r30`, que contiene demostraciones exitosas de la tarea de inserción de zanahoria. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. La adaptación a la tarea específica se realizó mediante fine-tuning sobre la base de π₀.₅, aunque no se especifican los hiperparámetros ni el proceso de entrenamiento.

## Capacidades

- Control de robot end-to-end: el modelo genera acciones de control directamente a partir de observaciones visuales y, potencialmente, instrucciones de lenguaje, siguiendo el paradigma VLA.
- Generalización a entornos nuevos: gracias a la arquitectura π₀.₅, el modelo está diseñado para operar en situaciones no vistas durante el entrenamiento, aunque su especialización en la tarea de inserción limita su alcance inmediato.
- Manipulación fina: la tarea de insertar una zanahoria en un agujero requiere precisión y control fino, lo que indica que el modelo es capaz de ejecutar movimientos delicados.
- Integración con LeRobot: al estar entrenado con LeRobot, es compatible con el ecosistema de Hugging Face para robótica, incluyendo pipelines de entrenamiento, evaluación e inferencia.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte multilingüe, ya que el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Automatización de tareas de inserción en líneas de montaje: el modelo puede controlar un brazo robótico para insertar componentes en orificios, reduciendo la intervención humana en procesos repetitivos y de alta precisión.
- Investigación en generalización de políticas robóticas: al estar basado en π₀.₅, sirve como punto de partida para estudiar cómo los modelos VLA se adaptan a nuevas tareas y entornos, permitiendo experimentos de transferencia.
- Desarrollo de sistemas de manipulación con aprendizaje por demostración: el modelo puede ser utilizado como referencia para entrenar políticas en otras tareas similares, aprovechando el fine-tuning con datasets propios.
- Evaluación de frameworks de robótica: su integración con LeRobot facilita su uso como benchmark para comparar diferentes arquitecturas o métodos de entrenamiento en tareas de manipulación.
- Prototipado de soluciones robóticas en entornos controlados: en laboratorios o plantas piloto, el modelo puede desplegarse para validar la viabilidad de tareas de inserción antes de escalar a producción.
- Educación y formación en robótica: al ser de código abierto y con una tarea bien definida, es un recurso didáctico para enseñar conceptos de VLA, aprendizaje por refuerzo y control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general, sino a control robótico. Tampoco se han reportado métricas específicas de robótica (éxito en la tarea, precisión, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de ~3,6 mil millones de parámetros, en FP16 se requerirían aproximadamente 7-8 GB de VRAM solo para los pesos, más memoria para activaciones y contexto, por lo que una GPU con al menos 12 GB sería necesaria para una inferencia cómoda. Sin embargo, esta es una estimación general y no un dato oficial.
- GPU recomendadas: no se especifican. Modelos de este tamaño suelen ejecutarse en GPUs como RTX 3090, RTX 4090, A100 o similares, pero no hay confirmación.
- Compatibilidad con GPUs de consumo: probablemente sí, en cuantizaciones de 8 bits o 4 bits, aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con las herramientas de LeRobot (lerobot-record, lerobot-train) y potencialmente con frameworks como vLLM o TGI si se adapta, pero no hay documentación al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de robótica. El modelo es una adaptación específica de π₀.₅, y no se han encontrado datos comparativos con π₀, RT-2 u otros VLA en la información proporcionada. Se puede mencionar que π₀.₅ es la base, pero no hay métricas de rendimiento relativas.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente para la tarea de insertar una zanahoria en un agujero, por lo que no es adecuado para otras tareas sin un fine-tuning adicional.
- Sesgos del dataset: el entrenamiento se realizó con demostraciones exitosas de un entorno específico, lo que puede introducir sesgos en la forma de ejecutar la tarea y limitar la generalización a variaciones del entorno (iluminación, posición, textura, etc.).
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir acciones incorrectas o no deseadas si las observaciones difieren significativamente de los datos de entrenamiento.
- Falta de documentación técnica: no se han publicado detalles sobre el proceso de entrenamiento, hiperparámetros, ni métricas de rendimiento, lo que dificulta la reproducibilidad y la evaluación objetiva.
- Requisitos de hardware no especificados: no hay guías oficiales sobre el hardware mínimo o recomendado, lo que puede complicar el despliegue en entornos de producción.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de copyright y no se otorgan garantías implícitas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aikwed/pi05_insert_carrot_hil_success_only_acp_pistar06_relative)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Paper de π₀.₅ (PDF)](https://www.pi.website/download/pi05.pdf)
- [Paper de π₀.₅ en arXiv](https://arxiv.org/pdf/2504.16054)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Modelo base π₀.₅ en Hugging Face](https://huggingface.co/lerobot/pi05_base)
