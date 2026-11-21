# lucazanett/pi05_wiping_bs_low_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, desarrollado originalmente por Physical Intelligence y adaptado a la librería LeRobot de Hugging Face a través de su repositorio OpenPI. El modelo resuelve el problema de la generalización en entornos abiertos: a diferencia de las políticas robóticas clásicas, que funcionan bien en escenarios controlados, π₀.₅ está diseñado para transferir habilidades a entornos y situaciones no vistos durante el entrenamiento.

El checkpoint concreto `lucazanett/pi05_wiping_bs_low_c25_25hz` es un ajuste fino de esa política base sobre el dataset `lucazanett/new_setup_baseline_low_25hz`, aparentemente especializado en una tarea de limpieza o frotado ("wiping") con una configuración de baja frecuencia (25 Hz). El nombre sugiere una variante con ventana de contexto o condición de 25 pasos y una configuración de "bs_low" (posiblemente batch size o una variante de bajo nivel).

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un tamaño de repositorio de 9,4 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y está pensado para ejecutarse mediante el stack LeRobot (entrenamiento, evaluación e inferencia con robots tipo SO-100). Es relevante ahora porque los modelos VLA de código abierto están empezando a hacer viable el control robótico generalista fuera de laboratorios especializados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence; implementación LeRobot/OpenPI |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Librería | lerobot |
| Tamaño del repositorio | 9,4 GB |
| Frecuencia de control | 25 Hz (según nombre del checkpoint) |
| Dataset de entrenamiento | lucazanett/new_setup_baseline_low_25hz |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅, un modelo de visión-lenguaje-acción de Physical Intelligence que combina un backbone de visión-lenguaje con un cabezal de acciones para producir comandos motores directamente a partir de observaciones visuales e instrucciones en lenguaje natural. La implementación disponible en este repositorio es la adaptación de LeRobot, derivada del repositorio OpenPI de Physical Intelligence. No se detalla en la model card la composición exacta del backbone (número de capas, dimensión oculta, tipo de atención) ni si emplea mecanismos de atención lineal o decodificación especulativa.

El checkpoint ha sido entrenado o ajustado con LeRobot sobre el dataset `lucazanett/new_setup_baseline_low_25hz`, que por el nombre apunta a una configuración experimental de baja frecuencia (25 Hz) orientada a una tarea de wiping. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en políticas robóticas de imitación). El nombre "c25" podría indicar una ventana de contexto o chunking de 25 pasos, pero no está confirmado.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización a entornos abiertos: diseñado para transferir a configuraciones no vistas durante el entrenamiento (según la descripción de π₀.₅).
- Ejecución de tareas de manipulación: el checkpoint está especializado en una tarea de wiping o limpieza.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Soporte para robots tipo SO-100 (so100_follower) en los comandos de ejemplo.
- Control a 25 Hz: frecuencia de operación indicada en el nombre del checkpoint.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Automatización de tareas de limpieza en entornos controlados: el checkpoint está entrenado específicamente para wiping, por lo que puede desplegarse en celdas de trabajo donde se requiera frotar o limpiar superficies con un brazo robótico SO-100.
- Investigación en imitación robótica: sirve como punto de partida para estudiar cómo se comporta π₀.₅ con datasets de baja frecuencia (25 Hz) y comparar con configuraciones de mayor frecuencia.
- Evaluación de generalización: al ser una política VLA, permite medir la transferencia a nuevas posiciones de objetos o iluminación distinta dentro del mismo setup.
- Prototipado rápido con LeRobot: el flujo `lerobot-train` + `lerobot-record` permite iterar sobre el dataset y reentrenar el modelo sin infraestructura propietaria.
- Benchmarking de políticas VLA: útil como referencia frente a ACT u otras políticas disponibles en LeRobot para tareas de manipulación simples.
- Formación y docencia: ejemplo práctico de pipeline completo de entrenamiento y despliegue de un modelo VLA de código abierto en un robot de bajo coste.
- Recolección de datos asistida: el modelo puede ejecutar políticas base mientras se recogen episodios adicionales para ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8-9 GB solo para pesos (4,14 mil millones de parámetros × 2 bytes), más overhead de activaciones y del backbone visual; se recomienda al menos 16 GB para operar con margen.
- VRAM estimada en FP32: alrededor de 16,5 GB solo para pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para entrenamiento; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y ajuste fino ligero.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y potencialmente en RTX 4080 (16 GB) con cuantización, aunque no se documentan formatos cuantizados oficiales.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el stack OpenPI; vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo (es una política robótica, no un LLM de texto).
- Latencia y throughput: no disponibles; la frecuencia de control indicada es 25 Hz, lo que implica un ciclo de decisión de 40 ms por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_wiping_bs_low_c25_25hz (este) | ~4,14 mil millones | no disponible | VLA (robótica) | Apache 2.0 | Hugging Face / LeRobot |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | VLA | no disponible en la información | OpenPI / blog de PI |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | no disponible | Política de imitación | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA | no disponible en la información | OpenPI |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está ajustado para una tarea concreta (wiping) y un setup específico; no debe esperarse generalización a otras tareas sin reentrenamiento.
- Dataset de entrenamiento no documentado: se desconoce el número de episodios, la diversidad de escenarios y la calidad de las demostraciones, lo que dificulta estimar su robustez.
- Frecuencia de control fija a 25 Hz: puede no ser adecuada para tareas que requieran control de mayor frecuencia.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios de iluminación, posición de cámara u objetos pueden degradar el rendimiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Idiomas y capacidades lingüísticas no documentados: no se puede asumir soporte multilingüe en las instrucciones.
- Sin información sobre sesgos: al ser un modelo visomotor, los sesgos relevantes serían de distribución visual y de configuración física del robot, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el despliegue físico y la seguridad del robot recae en el integrador.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_bs_low_c25_25hz
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_low_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI (Physical Intelligence): no disponible en la información proporcionada
