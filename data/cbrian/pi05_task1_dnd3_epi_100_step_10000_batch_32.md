# cbrian/pi05_task1_DND3_epi_100_step_10000_batch_32

## Resumen

El modelo `cbrian/pi05_task1_DND3_epi_100_step_10000_batch_32` es un checkpoint de fine-tuning de la política π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para robótica con generalización en entornos abiertos. La implementación utilizada es la adaptación de LeRobot (Hugging Face) sobre el repositorio OpenPI. Este checkpoint concreto ha sido entrenado sobre un dataset de demostraciones robóticas llamado `cbrian/merge_task1_DND_epi_100`, con 100 episodios, 10.000 pasos y un tamaño de batch de 32, según se deduce del nombre del repositorio.

El modelo tiene 3.616.757.520 parámetros (aproximadamente 3,6 mil millones) y se distribuye en formato safetensors, ocupando 7,5 GB en el repositorio. Está pensado para ser utilizado con el ecosistema LeRobot, tanto para entrenamiento como para inferencia en robots reales o simulados. Su relevancia radica en que π₀.₅ representa una evolución significativa respecto a π₀, mejorando la capacidad de generalización a nuevas tareas y entornos no vistos durante el entrenamiento, un reto clave en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (transformer multimodal) |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, probablemente en FP16/BF16) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA que combina visión, lenguaje y acción. La arquitectura exacta no se detalla en la información proporcionada, pero se sabe que es una evolución de π₀, diseñada para mejorar la generalización en entornos abiertos mediante una técnica denominada "knowledge insulation" (aislamiento de conocimiento), según el repositorio GitHub de referencia. El modelo base fue pre-entrenado con más de 10.000 horas de datos de robots, y este checkpoint específico ha sido fine-tuneado con el framework LeRobot sobre un dataset de demostraciones de una tarea concreta (identificada como "DND3" en el nombre). El dataset `cbrian/merge_task1_DND_epi_100` contiene 100 episodios, y el entrenamiento se realizó durante 10.000 pasos con un batch de 32, según la nomenclatura del repositorio. No se especifican detalles sobre el proceso de entrenamiento (RLHF, DPO, etc.) más allá del fine-tuning supervisado típico de LeRobot.

## Capacidades

- Control de robots: genera acciones de articulaciones o comandos cartesianos a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje natural.
- Generalización a entornos nuevos: gracias al diseño de π₀.₅, puede adaptarse a situaciones no vistas durante el entrenamiento, aunque el fine-tuning específico puede limitar esta capacidad a la tarea DND3.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de Hugging Face para robótica.
- Procesamiento multimodal: combina entradas de cámara (imágenes) y texto (instrucciones) para producir acciones.
- No se dispone de información sobre tool calling, agentes o razonamiento multi-paso, ya que es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico (por ejemplo, SO-100) para realizar tareas de recogida y colocación, aprovechando su capacidad de generalización a variaciones del entorno.
- Automatización de tareas industriales repetitivas: fine-tuneado sobre una tarea específica (DND3), puede ejecutar secuencias de ensamblaje o montaje con alta precisión, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning sobre datasets pequeños (100 episodios) afecta al rendimiento en tareas concretas.
- Evaluación de políticas robóticas: se puede utilizar con la herramienta `lerobot-record` para evaluar el comportamiento del robot en entornos reales o simulados, comparando con otras políticas.
- Desarrollo de sistemas de control adaptativo: al ser un modelo VLA, puede integrarse en sistemas que requieran ajuste en tiempo real basado en feedback visual.
- Benchmarking de modelos VLA: permite comparar el rendimiento de π₀.₅ fine-tuneado frente a otras arquitecturas (ACT, Diffusion Policy, etc.) en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (éxito en tareas, precisión, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 3,6 B parámetros y un peso de 7,5 GB en safetensors, se estima que en FP16/BF16 requiere al menos 8 GB de VRAM, pero no es un dato confirmado.
- GPU recomendadas: no especificadas. Para entrenamiento o fine-tuning, se necesitaría una GPU con al menos 16-24 GB de VRAM (por ejemplo, RTX 3090/4090, A100). Para inferencia, una GPU con 8-12 GB podría ser suficiente.
- Compatibilidad con GPU de consumo: probablemente sí, si se utiliza cuantización (por ejemplo, GGUF o AWQ), pero no se ofrecen versiones cuantizadas en el repositorio.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA como π₀, OpenVLA o RT-2. Sin embargo, se puede indicar que π₀.₅ es una evolución de π₀ con mejor generalización, y que este checkpoint concreto es un fine-tuning para una tarea específica, por lo que su rendimiento dependerá del dominio. No se proporcionan datos de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del dataset (por ejemplo, posturas o estrategias particulares del operador).
- Riesgo de alucinación: en el contexto robótico, puede generar acciones incorrectas o no seguras si las observaciones difieren mucho del entrenamiento. No hay garantías de seguridad en entornos reales.
- Limitaciones de contexto o idioma: al ser un modelo de acción, no está diseñado para procesar lenguaje natural complejo; las instrucciones probablemente se limitan a comandos simples.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se otorgan garantías.
- Caveat para producción: el modelo ha sido fine-tuneado con un dataset pequeño (100 episodios) y puede no generalizar bien fuera de la tarea DND3. Se recomienda validar exhaustivamente en el entorno objetivo antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cbrian/pi05_task1_DND3_epi_100_step_10000_batch_32
- GitHub de referencia (π₀.₅): https://github.com/ldddddddl/pi05
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot (GitHub): https://github.com/huggingface/lerobot
- Otros checkpoints similares de cbrian: https://huggingface.co/cbrian/pi05test y https://huggingface.co/cbrian/pi05_M0_D1_cartesian
