# cbrian/pi05_task2_NB_epi_50

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, diseñado para abordar la generalización open-world en robótica: la capacidad de ejecutar tareas en entornos y situaciones nunca vistos durante el entrenamiento. Este checkpoint concreto, `cbrian/pi05_task2_NB_epi_50`, es una implementación de LeRobot adaptada del repositorio open source OpenPI, entrenada sobre el dataset `cbrian/merge_task2_NB_epi_50` por el usuario cbrian. Con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), el modelo está orientado al pipeline de robótica y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que representa una evolución significativa respecto a π₀, incorporando co-entrenamiento sobre datos heterogéneos para mejorar la generalización fuera del laboratorio. Al estar integrado con LeRobot, permite entrenar y evaluar políticas de control robótico de forma estandarizada, lo que facilita su adopción en investigación y desarrollo. Aunque no se proporcionan detalles específicos de arquitectura interna en la model card, se sabe que es un VLA que combina percepción visual, comprensión del lenguaje y generación de acciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en π₀.₅ |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA que integra un codificador de visión, un modelo de lenguaje y un decodificador de acciones. Según el paper arXiv 2504.16054, el modelo se basa en π₀ y utiliza co-entrenamiento sobre conjuntos de datos heterogéneos (diversas tareas, entornos y robots) para lograr generalización open-world. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence, que incluye tanto el modelo base como las herramientas de entrenamiento e inferencia.

No se dispone de información específica sobre el dataset de entrenamiento de este checkpoint concreto (`cbrian/merge_task2_NB_epi_50`), ni sobre el número de tokens, la composición de los datos o si se aplicaron técnicas como RLHF o DPO. La model card solo indica que fue entrenado con LeRobot y que el dataset está referenciado en los metadatos. Para detalles técnicos del modelo base, se recomienda consultar el paper y el blog oficial.

## Capacidades

- Control robótico end-to-end: genera acciones directamente a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización open-world: diseñado para operar en entornos no vistos durante el entrenamiento, según las capacidades declaradas por Physical Intelligence.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, registro de episodios y evaluación con robots como SO-100.
- Soporte de visión y lenguaje: procesa entradas multimodales (imágenes y texto) para producir comandos motores.
- No se especifican capacidades adicionales como tool calling, agentes o razonamiento multi-paso, al tratarse de un modelo de robótica especializado.

## Casos de uso

- Manipulación robótica en entornos no estructurados: el modelo puede controlar un brazo robótico para tareas de recogida y colocación en escenarios domésticos o industriales, gracias a su capacidad de generalización open-world.
- Seguimiento de instrucciones en lenguaje natural: un operador puede dar comandos como "coge la taza roja" y el modelo genera la secuencia de acciones correspondiente, integrando visión y lenguaje.
- Entrenamiento de políticas con LeRobot: los desarrolladores pueden usar este checkpoint como punto de partida para fine-tuning en tareas específicas, utilizando el pipeline estándar de LeRobot (`lerobot-train`).
- Evaluación en simulación: el modelo puede desplegarse en simuladores como Isaac Sim (según el repositorio EBIM) para validar políticas antes de la implementación física.
- Investigación en VLA: sirve como referencia para estudiar la generalización open-world en modelos de visión-lenguaje-acción, comparando con π₀ y otros enfoques.
- Automatización de tareas repetitivas en entornos controlados: aunque está diseñado para open-world, también puede aplicarse a tareas fijas en líneas de producción, aprovechando su robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper de π₀.₅ (arXiv 2504.16054) reporta evaluaciones en tareas de manipulación y generalización, pero no se incluyen los datos numéricos en la model card ni en los resultados de búsqueda proporcionados. Se recomienda consultar el paper original para obtener métricas comparativas con otros VLA.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card.
- Con 3.616.757.520 parámetros y un tamaño de repositorio de 7,5 GB (pesos en safetensors), se estima que la inferencia en FP16 requiere al menos 8-12 GB de VRAM, dependiendo de la resolución de imagen y la longitud de contexto.
- GPUs recomendadas: tarjetas con 12 GB o más de VRAM, como RTX 3080/3090, RTX 4090, A100 o H100. Para entrenamiento o fine-tuning, se necesitaría mayor capacidad (24 GB o más).
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con el framework de Hugging Face, que soporta PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| π₀.₅ (este checkpoint) | 3,6B | no disponible | VLA open-world | Apache 2.0 |
| π₀ (base) | no disponible | no disponible | VLA | Apache 2.0 (según OpenPI) |
| π₀-FAST | no disponible | no disponible | VLA autoregresivo | Apache 2.0 (según OpenPI) |
| OpenVLA | 7B | no disponible | VLA | Apache 2.0 |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. π₀.₅ se presenta como una evolución de π₀ con mejor generalización, pero las métricas específicas requieren consultar el paper.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos para este checkpoint, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos del dataset de entrenamiento.
- Riesgo de alucinación: en robótica, el modelo puede generar acciones incorrectas o no seguras si recibe entradas fuera de su distribución de entrenamiento; se recomienda supervisión humana en entornos reales.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que tareas con instrucciones muy largas o múltiples objetivos podrían no ser soportadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y mantener los avisos de copyright.
- Dependencia del dataset: este checkpoint está entrenado sobre un dataset específico (`cbrian/merge_task2_NB_epi_50`), por lo que su rendimiento en otras tareas puede ser limitado sin fine-tuning adicional.
- Para producción, es crucial validar la seguridad del modelo en el entorno físico antes de su despliegue autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrian/pi05_task2_NB_epi_50
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (GitHub): https://github.com/Tonghe-Zhang/openpi-physical-intelligence
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
