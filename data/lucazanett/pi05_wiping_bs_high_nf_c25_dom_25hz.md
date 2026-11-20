# lucazanett/pi05_wiping_bs_high_nf_c25_dom_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos para robótica. El modelo que nos ocupa, `lucazanett/pi05_wiping_bs_high_nf_c25_dom_25hz`, es un *fine-tuning* concreto de esa política publicado en Hugging Face a través de la librería LeRobot, adaptado a una tarea específica de limpieza o frotado ("wiping") sobre un conjunto de datos propio del autor.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un tamaño de repositorio de 9,4 GB. Está entrenado sobre el dataset `lucazanett/new_setup_baseline_high_no_force_25hz`, que por su nombre sugiere una configuración experimental con alta frecuencia de muestreo (25 Hz) y sin señal de fuerza. La licencia es Apache 2.0.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de la robótica de código abierto: partir de un modelo fundacional VLA (π₀.₅ de Physical Intelligence) y ajustarlo con LeRobot para una tarea concreta de manipulación, publicando los pesos para su reproducción y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada de OpenPI (detalles internos de capas no disponibles) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, la evolución de π₀ de Physical Intelligence, diseñada para abordar la generalización en entornos abiertos: ejecutar tareas en situaciones y entornos no vistos durante el entrenamiento. La implementación incluida en este repositorio es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence. No se dispone en la información proporcionada de detalles sobre el número de capas, mecanismos de atención, tokenizador de acciones o composición exacta del dataset de preentrenamiento original.

Este checkpoint concreto ha sido entrenado y subido al Hub mediante LeRobot sobre el dataset `lucazanett/new_setup_baseline_high_no_force_25hz`. Por la nomenclatura del repositorio (`wiping_bs_high_nf_c25_dom_25hz`) se deduce una tarea de frotado/limpieza, con configuración "high" y "sin fuerza" (`nf`), a 25 Hz y con un componente de dominio (`dom`). No se especifican en la model card el número de episodios, horas de datos, ni si hubo etapas de RLHF/DPO; en robótica de imitación lo habitual es entrenamiento supervisado por comportamiento (behavior cloning), pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales y de estado del robot (política VLA para control de manipulación).
- Generalización a entornos abiertos, según la propuesta de π₀.₅ de Physical Intelligence.
- Ejecución de la tarea específica de frotado/limpieza para la que fue ajustado.
- Integración con el ecosistema LeRobot para entrenamiento, registro y evaluación (`lerobot-train`, `lerobot-record`).
- Compatibilidad con robots tipo `so100_follower` en los ejemplos de evaluación de la model card.
- Soporte de tool calling, agentes multi-paso, razonamiento textual o capacidades multilingües: no disponible / no aplicable a este checkpoint.

## Casos de uso

- Automatización de limpieza de superficies en entornos controlados: el modelo ejecuta la política de frotado aprendida sobre el setup del dataset de entrenamiento, adecuado para tareas repetitivas de wiping en laboratorio o célula robotizada.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la frecuencia de muestreo (25 Hz) y la ausencia de señal de fuerza en el rendimiento de políticas VLA.
- Reproducción de experimentos: al publicarse los pesos y el dataset asociado, permite replicar el entrenamiento y comparar variantes (con y sin fuerza, distintas frecuencias).
- Base para *fine-tuning* en tareas similares: su licencia Apache 2.0 y su integración con LeRobot facilitan reentrenar sobre nuevos datasets de manipulación.
- Evaluación de generalización: útil para medir hasta qué punto un modelo derivado de π₀.₅ transfiere a variaciones del entorno no vistas durante el ajuste.
- Docencia y prototipado en robótica: ejemplo completo del pipeline LeRobot (entrenamiento, checkpoint, evaluación con `lerobot-record`) para cursos o demos de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en FP16 se requieren aproximadamente 8,3 GB solo para pesos, más memoria para activaciones y observaciones visuales; en cuantización de 8 bits podría rondar los 4-5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable para FP16.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 12-16 GB o más, pero no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), ecosistema Hugging Face; soporte de vLLM, llama.cpp, Ollama o TGI no disponible (no son formatos/pipelines aplicables a este tipo de política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucazanett/pi05_wiping_bs_high_nf_c25_dom_25hz` | 4,14 B | no disponible | VLA, frotado/wiping | Apache 2.0 | Hugging Face (LeRobot) |
| π₀.₅ (Physical Intelligence, base) | no disponible | no disponible | VLA generalista | no disponible en esta información | OpenPI (código abierto) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en esta información | OpenPI |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica | Apache 2.0 (LeRobot) | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: ajustado para una tarea concreta (wiping) y un setup específico; no debe esperarse generalización fuera de ese dominio sin validación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en la tarea ni comparación con alternativas.
- Dependencia del hardware y dataset de entrenamiento: el rendimiento puede degradarse con cambios en cámara, robot, iluminación o frecuencia de control.
- Riesgo de sobreajuste al entorno de recogida de datos, a pesar de la pretensión de generalización de π₀.₅.
- Sin información sobre sesgos, alucinaciones o comportamiento fuera de distribución; en robótica, los fallos se traducen en acciones físicas incorrectas, con riesgo material.
- Idiomas y capacidades lingüísticas no documentados; no es un modelo de texto general.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los componentes base (π₀.₅, OpenPI) y del dataset asociado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_bs_high_nf_c25_dom_25hz
- Dataset asociado: https://huggingface.co/datasets/lucazanett/new_setup_baseline_high_no_force_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
