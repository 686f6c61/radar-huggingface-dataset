# IanHHH698/pi05_task2_ND1_epi_200_step_20000_batch_32

## Resumen

El modelo `IanHHH698/pi05_task2_ND1_epi_200_step_20000_batch_32` es una política robótica basada en π₀.₅ (Pi05), un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence para la generalización en entornos abiertos. Esta implementación concreta ha sido entrenada y publicada mediante la librería LeRobot de Hugging Face, partiendo de un fine-tuning sobre el dataset `cbrian/merge_task2_ND_epi_200` (200 episodios). El modelo está diseñado para controlar robots manipuladores a partir de observaciones visuales y comandos en lenguaje natural, con capacidad de generalizar a escenarios no vistos durante el entrenamiento.

Con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), el modelo se distribuye en formato safetensors y ocupa 7,5 GB en el repositorio. Su licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque no se especifican detalles sobre la longitud de contexto ni los idiomas soportados, al ser un VLA se espera que procese entradas multimodales (imagen y texto). Este modelo es relevante para la comunidad de robótica porque demuestra la aplicación práctica de π₀.₅ en tareas de manipulación con un pipeline accesible (LeRobot), facilitando la reproducción y evaluación de políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence) |
| Parametros totales | 3.616.757.520 (3,6 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente inglés, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con LeRobot) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de tipo Vision-Language-Action (VLA) que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente a partir de observaciones (imágenes) y instrucciones en lenguaje natural. La arquitectura exacta (número de capas, tipo de atención, etc.) no se detalla en la información disponible, pero se sabe que es una evolución de π₀, diseñada para mejorar la generalización a entornos y situaciones nuevas. El modelo se ha entrenado mediante fine-tuning desde un checkpoint base (probablemente `lerobot/pi05_libero`) utilizando LeRobot, con un dataset de 200 episodios de la tarea "task2_ND" (posiblemente una tarea de manipulación con no-dominio o similar). No se especifican detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas como RLHF o DPO; el entrenamiento se realizó con 20.000 pasos y batch size 32, según el nombre del repositorio.

## Capacidades

- Generación de acciones motoras para robots manipuladores a partir de observaciones visuales y comandos en lenguaje natural.
- Generalización a entornos y objetos no vistos durante el entrenamiento, gracias a la arquitectura VLA de π₀.₅.
- Soporte para tareas de manipulación con múltiples pasos (multi-step reasoning) en entornos físicos.
- Integración con el ecosistema LeRobot, lo que permite entrenar, evaluar y desplegar la política en robots reales o simulados (por ejemplo, SO-100).
- Capacidad de procesar entradas multimodales (imagen + texto), aunque no se especifican detalles sobre el tokenizador o el preprocesado.
- No se indica soporte explícito para tool calling, agentes autónomos ni modos de pensamiento (thinking mode); su función principal es el control robótico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico (por ejemplo, SO-100) para realizar tareas como recoger, apilar o insertar objetos, a partir de instrucciones en lenguaje natural y visión por cámara.
- Evaluación de políticas robóticas en investigación: los investigadores pueden reproducir el entrenamiento y evaluar el rendimiento en su propio hardware usando LeRobot, comparando con otras políticas VLA.
- Automatización de tareas repetitivas en entornos controlados: el modelo puede ser desplegado en líneas de montaje o entornos de prueba donde se requiera adaptación a variaciones leves del entorno.
- Aprendizaje por imitación: sirve como punto de partida para fine-tuning en nuevas tareas con pocos episodios (few-shot), gracias a su capacidad de generalización.
- Desarrollo de robots domésticos: su capacidad de entender comandos en lenguaje natural lo hace adecuado para prototipos de asistentes robóticos que ejecuten tareas sencillas en el hogar.
- Benchmarking de modelos VLA: al estar disponible públicamente con licencia Apache 2.0, puede usarse como referencia para comparar el rendimiento de otros modelos de control robótico en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (como éxito en tareas, precisión de acciones, etc.) ni comparaciones con otros modelos. Se recomienda consultar la documentación de LeRobot y el blog de Physical Intelligence para obtener referencias sobre el rendimiento general de π₀.₅, aunque no hay datos específicos para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,6 mil millones de parámetros en FP16, se estima un consumo de memoria de aproximadamente 7-8 GB solo para los pesos, más memoria adicional para activaciones y entradas (imágenes). En la práctica, se recomienda al menos 12 GB de VRAM para inferencia con batch pequeño.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como NVIDIA RTX 3080/3090, RTX 4080/4090, A10, A100 o H100. Para entrenamiento o fine-tuning, se necesitaría mayor capacidad (24 GB o más).
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas. Con cuantización (no disponible en el repo) podría caber en GPUs de 8 GB, pero no se proporcionan pesos cuantizados.
- Opciones de despliegue: LeRobot ofrece scripts de inferencia y evaluación (`lerobot-record`), y el modelo puede cargarse con la librería `transformers` o directamente con LeRobot. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de las imágenes de entrada; al ser un VLA, la inferencia implica procesamiento visual y de lenguaje, por lo que la latencia será mayor que un modelo de lenguaje puro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `IanHHH698/pi05_task2_ND1_epi_200_step_20000_batch_32` (este) | 3,6 B | no disponible | Apache 2.0 | Hugging Face |
| `jaywu109/pi05_task1_MM1_epi_200_step_10000_batch_32` | ~4 B (según etiqueta) | no disponible | Apache 2.0 | Hugging Face |
| `lerobot/pi05_libero` (base) | no disponible | no disponible | Apache 2.0 | Hugging Face |

Ambos modelos `pi05_task*` son fine-tunings de π₀.₅ sobre diferentes datasets (task1 vs task2) y con distintos pasos de entrenamiento (10.000 vs 20.000). No se dispone de comparativas de rendimiento entre ellos. El modelo base `lerobot/pi05_libero` es el punto de partida común. No se conocen otros modelos VLA de la misma categoría con datos públicos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un dataset específico (200 episodios de una tarea concreta), puede no generalizar bien a tareas muy diferentes o a entornos con variaciones extremas de iluminación, textura o disposición de objetos.
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones incorrectas o inestables si las observaciones difieren significativamente de los datos de entrenamiento; no hay garantía de seguridad en entornos reales.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados; probablemente el modelo está entrenado principalmente en inglés y con imágenes de resolución fija, lo que limita su uso en otros idiomas o con entradas de mayor resolución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Caveat para producción: este modelo es un checkpoint experimental de fine-tuning, no un producto listo para producción. Se recomienda validar exhaustivamente en el entorno objetivo antes de cualquier despliegue real, y considerar mecanismos de seguridad (parada de emergencia, supervisión humana) al operar robots físicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IanHHH698/pi05_task2_ND1_epi_200_step_20000_batch_32
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Modelo base `lerobot/pi05_libero` (referencia): https://huggingface.co/lerobot/pi05_libero (no verificado en la búsqueda, pero mencionado en la model card)
