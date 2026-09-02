# cbrian/pi05_taskmix_MIX1_epi_200_step_20000_batch_32

## Resumen

El modelo `cbrian/pi05_taskmix_MIX1_epi_200_step_20000_batch_32` es una implementación de la política π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence para el control robótico con generalización a entornos no vistos durante el entrenamiento. Esta versión concreta ha sido entrenada y publicada mediante la librería LeRobot de Hugging Face, utilizando un dataset combinado de dos tareas (`cbrian/merge_task1_MM_epi_100_task2_ND_epi_100`). El modelo cuenta con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones) y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación.

La relevancia de este modelo radica en que aborda uno de los retos centrales de la robótica actual: la capacidad de operar en entornos y situaciones que no formaban parte de los datos de entrenamiento. A diferencia de políticas robóticas tradicionales que funcionan bien solo en condiciones controladas, π₀.₅ está diseñado para generalizar a escenarios nuevos, lo que lo convierte en una opción interesante para aplicaciones de manipulación en entornos domésticos, industriales o logísticos. Al estar disponible en el Hub de Hugging Face con pesos en formato safetensors, puede integrarse fácilmente en flujos de trabajo basados en LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (no se especifican detalles internos) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, probablemente BF16) |
| Idiomas soportados | no disponible (el modelo procesa lenguaje natural, pero no se indica qué idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de π₀.₅ se describe en el paper "π₀.₅: a Vision-Language-Action Model with Open-World Generalization" como una evolución de π₀, que utiliza co-entrenamiento sobre datos heterogéneos para mejorar la generalización. No se proporcionan detalles específicos sobre el tipo de transformer, mecanismos de atención o técnicas de entrenamiento (como RLHF o DPO) en la información disponible. La implementación concreta de este repositorio ha sido entrenada con LeRobot, una librería de Hugging Face para aprendizaje por imitación en robótica, sobre un dataset que combina 100 episodios de una tarea (etiquetada como "MM") y 100 episodios de otra (etiquetada como "ND"). El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 32, según se indica en el nombre del repositorio.

## Capacidades

- Control robótico end-to-end: el modelo mapea directamente observaciones visuales y comandos de lenguaje a acciones de actuadores.
- Generalización a entornos nuevos: diseñado para operar en situaciones no vistas durante el entrenamiento, gracias al co-entrenamiento en datos heterogéneos.
- Integración visión-lenguaje-acción: combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras.
- Compatibilidad con LeRobot: puede ser utilizado para entrenamiento, evaluación e inferencia mediante las herramientas estándar de LeRobot (por ejemplo, `lerobot-train` y `lerobot-record`).

No se dispone de información sobre capacidades adicionales como tool calling, agentes multi-paso, o modos de razonamiento especiales.

## Casos de uso

- Manipulación robótica en entornos domésticos: el modelo puede controlar un brazo robótico para tareas como recoger objetos, abrir cajones o colocar artículos en superficies, adaptándose a variaciones en la disposición de los objetos y la iluminación.
- Automatización de almacenes: gracias a su generalización, puede ejecutar tareas de picking y placing en estanterías o contenedores sin necesidad de reentrenamiento para cada configuración específica.
- Asistencia en cocina: puede seguir instrucciones verbales para preparar ingredientes, mover utensilios o servir alimentos, en entornos con elementos no vistos previamente.
- Inspección y mantenimiento industrial: puede manipular herramientas o sensores en entornos de planta que presentan variaciones respecto a los datos de entrenamiento.
- Robótica educativa y de investigación: sirve como base para experimentos sobre generalización en VLA, permitiendo a investigadores evaluar el comportamiento en tareas novedosas.
- Teleoperación asistida: puede complementar sistemas de teleoperación generando acciones autónomas en segmentos de la tarea, reduciendo la carga del operador humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de π₀.₅ reporta evaluaciones en entornos reales y simulados, pero no se incluyen en la documentación de este repositorio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,6 mil millones de parámetros y pesos en BF16 (tamaño del repositorio de 7,5 GB), se estima un consumo de memoria de aproximadamente 7,2 GB solo para los pesos, más overhead de activaciones y buffers, lo que sugiere un mínimo de 10-12 GB de VRAM para inferencia en tiempo real.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como NVIDIA RTX 3060, RTX 4070, RTX 4080, o GPUs de datacenter como A10, A100 o H100. Para entrenamiento o fine-tuning, se recomienda al menos 24 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar inferencia en GPUs de consumo con 12 GB o más, aunque la latencia dependerá de la optimización.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que se apoya en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro sino una política robótica.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna, se espera una frecuencia de control de decenas de Hz, pero depende de la resolución de imagen y la complejidad de la acción.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo π₀ original y otras políticas VLA como RT-2 o OpenVLA podrían ser comparables, pero no se han encontrado datos concretos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos presentes en los datos de recogida.
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones incorrectas o inapropiadas si las observaciones difieren mucho de los datos de entrenamiento, lo que equivale a una forma de alucinación.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los VLA suelen procesar secuencias de imágenes y texto de longitud moderada; no se recomienda para tareas que requieran razonamiento de largo plazo.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y atribución.
- Caveats para producción: el modelo es una política de control que debe integrarse con un robot físico y un sistema de seguridad adecuado. No se ha validado en entornos de producción reales y puede fallar en situaciones extremas o con objetos no vistos. Se recomienda realizar pruebas exhaustivas en el entorno objetivo antes de su despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cbrian/pi05_taskmix_MIX1_epi_200_step_20000_batch_32
- Paper de π₀.₅ (arXiv): https://arxiv.org/html/2504.16054v1
- PDF del paper: https://www.pi.website/download/pi05.pdf
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
