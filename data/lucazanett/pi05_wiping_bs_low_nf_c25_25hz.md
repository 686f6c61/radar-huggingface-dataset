# lucazanett/pi05_wiping_bs_low_nf_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot por el usuario lucazanett. El checkpoint `pi05_wiping_bs_low_nf_c25_25hz` es un ajuste fino (fine-tuning) de la política base π₀.₅ sobre un conjunto de datos propio de robótica (`lucazanett/new_setup_baseline_low_no_force_25hz`), orientado a una tarea concreta de manipulación (limpieza o wiping) en un entorno de laboratorio. Con 4.143.404.816 parámetros y un tamaño de repositorio de 9,4 GB, se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve el problema de la generalización en robótica: mientras que las políticas tradicionales funcionan en entornos controlados, π₀.₅ está diseñado para transferir habilidades a situaciones y entornos no vistos durante el entrenamiento. La variante publicada por lucazanett es un artefacto de investigación reproducible, no un modelo de propósito general: está entrenada con un dataset específico y a una frecuencia de 25 Hz, lo que condiciona su uso a la tarea y hardware concretos de ese setup.

Su relevancia radica en que ejemplifica el flujo de trabajo moderno de robótica con modelos fundacionales: partir de un VLA preentrenado de Physical Intelligence, adaptarlo con LeRobot y desplegarlo sobre un robot tipo SO-100. Es un caso práctico de cómo la comunidad puede especializar modelos de gran escala para tareas de manipulación concretas sin entrenar desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), política π₀.₅ adaptada a LeRobot |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅, un modelo de visión-lenguaje-acción de Physical Intelligence que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. La implementación incluida en el repositorio proviene del repositorio OpenPI de Physical Intelligence y se ha adaptado para la librería LeRobot de Hugging Face. El checkpoint concreto es un ajuste fino sobre el dataset `lucazanett/new_setup_baseline_low_no_force_25hz`, que por su nombre sugiere un setup de laboratorio con "low no force" (sin sensor de fuerza) y una frecuencia de captura de 25 Hz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas del checkpoint más allá de las propias de π₀.₅ (generalización open-world). La model card del autor es mínima y no incluye detalles sobre el proceso de entrenamiento ni hiperparámetros.

## Capacidades

- Política de manipulación robótica de tipo visión-lenguaje-acción: mapea observaciones visuales y comandos a acciones motoras.
- Generalización open-world: según Physical Intelligence, π₀.₅ está diseñado para transferir a entornos y situaciones no vistas durante el entrenamiento.
- Control a 25 Hz: la frecuencia del dataset de entrenamiento sugiere operación en tiempo real a 25 Hz.
- Integración con LeRobot: entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`).
- Tarea específica de wiping/limpieza: el checkpoint está especializado en esa tarea concreta.
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Capacidades multilingües: no disponible.

## Casos de uso

- **Automatización de limpieza de superficies en laboratorio**: el checkpoint está entrenado específicamente para la tarea de wiping sobre un setup concreto; se usaría con `lerobot-record` apuntando a `--policy.path=lucazanett/pi05_wiping_bs_low_nf_c25_25hz` para ejecutar episodios de evaluación sobre el robot SO-100.
- **Reproducción de experimentos de robótica**: sirve como artefacto reproducible para validar el pipeline de entrenamiento de LeRobot con el dataset `new_setup_baseline_low_no_force_25hz`, comparando resultados entre configuraciones.
- **Punto de partida para fine-tuning adicional**: al ser un ajuste fino de π₀.₅, puede reutilizarse como inicialización para nuevas tareas de manipulación en el mismo entorno físico.
- **Evaluación de políticas VLA en entornos controlados**: útil para medir la transferencia de un modelo fundacional a una tarea concreta y documentar la brecha entre entrenamiento y despliegue.
- **Investigación en aprendizaje por imitación**: el checkpoint permite estudiar cómo se comporta una política entrenada con demostraciones a 25 Hz y sin señal de fuerza.
- **Docencia y formación en robótica con LeRobot**: ejemplo práctico de entrenamiento, evaluación y despliegue de una política VLA con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 4.143.404.816 parámetros en precisión completa (fp32) se necesitarían aproximadamente 16,6 GB solo para los pesos; en fp16/bf16, unos 8,3 GB, más memoria para activaciones y buffers. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- **GPU recomendadas**: no disponible. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) sería el punto de partida razonable para inferencia en precisión reducida.
- **¿Cabe en GPU consumer?**: probablemente sí en tarjetas con 16-24 GB si se usa precisión reducida, pero no hay confirmación oficial.
- **Opciones de despliegue**: LeRobot (`lerobot-train`, `lerobot-record`) y el ecosistema OpenPI. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- **Latencia y throughput**: no disponibles. La frecuencia de 25 Hz del dataset sugiere que el sistema está pensado para control en tiempo real a ese ritmo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_wiping_bs_low_nf_c25_25hz (este) | 4.143.404.816 | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | no disponible | OpenPI / Physical Intelligence |
| π₀ (Physical Intelligence) | no disponible | no disponible | no disponible | OpenPI |
| Políticas ACT de LeRobot | no disponible | no disponible | Apache 2.0 (LeRobot) | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Especialización extrema**: el checkpoint está entrenado para una tarea concreta (wiping) en un setup específico; no es un modelo de propósito general y su rendimiento fuera de ese dominio no está garantizado.
- **Dependencia del hardware**: el entrenamiento asume un robot SO-100 (según el ejemplo de la model card) y una frecuencia de 25 Hz; desviarse de ese setup puede degradar el comportamiento.
- **Dataset sin señal de fuerza**: el nombre del dataset indica "low no force", por lo que la política no utiliza información de sensores de fuerza; tareas que requieran control de fuerza fina pueden no estar cubiertas.
- **Riesgo de alucinación y comportamiento impredecible**: como todo modelo generativo aplicado a control, puede producir acciones no deseadas; se requiere supervisión y protocolos de seguridad en el robot.
- **Sesgos**: no disponible información sobre sesgos del dataset de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ y el repositorio OpenPI pueden tener condiciones adicionales que deben verificarse.
- **Documentación mínima**: la model card no detalla el proceso de entrenamiento, hiperparámetros ni métricas de éxito, lo que dificulta la reproducibilidad y la evaluación de riesgos en producción.
- **Cero descargas y likes**: el checkpoint no tiene validación comunitaria; úsese con cautela en entornos productivos.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_bs_low_nf_c25_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_low_no_force_25hz
