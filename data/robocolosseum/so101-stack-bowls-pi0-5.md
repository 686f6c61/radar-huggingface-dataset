# RoboColosseum/so101-stack-bowls-pi0.5

## Resumen

`RoboColosseum/so101-stack-bowls-pi0.5` es un ajuste fino del modelo visión-lenguaje-acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, se ha entrenado específicamente para una tarea de manipulación robótica: apilar un cuenco de plástico blanco sobre otro en un entorno de laboratorio con un robot SO-101. La relevancia de esta ficha radica en que documenta un caso de uso concreto de fine-tuning de un modelo VLA de propósito general a una política de imitación especializada.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres flujos de cámara: frontal, muñeca y una cámara vacía de 224×224) y produce comandos de acción de 6 dimensiones. Con 4.143.404.816 parámetros totales (aproximadamente 4,14 mil millones), se distribuye en formato safetensors con un repositorio de 97,9 GB, lo que sugiere pesos en precisión completa o mixta. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La arquitectura subyacente es la de π₀.₅, un modelo VLA diseñado para generalización en entornos abiertos, aunque en este caso el ajuste fino lo especializa a una única tarea y un único robot. El entrenamiento se realizó sobre el dataset `Jiamo0912/so101-stack-bowls`, con 100 episodios y 25.092 fotogramas a 30 FPS, durante 40.000 pasos con un tamaño de lote de 16 y una tasa de aprendizaje de 2,5e-05. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), transformer multimodal |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La arquitectura combina un codificador visual (para las tres cámaras de entrada), un codificador de estado articular (6 dimensiones) y un decodificador de acciones (6 dimensiones), todo dentro de un transformer multimodal. No se dispone de detalles adicionales sobre el número de capas, dimensiones ocultas o mecanismos de atención en la información proporcionada.

El entrenamiento consistió en un ajuste fino supervisado (imitación) sobre el dataset `Jiamo0912/so101-stack-bowls`, compuesto por 100 episodios y 25.092 fotogramas a 30 FPS, con la tarea "Pick up the white plastic bowl on the right and stack it on top of the white plastic bowl on the left". Se realizaron 40.000 pasos con batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning de imitación puro sobre el modelo base preentrenado.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones para el robot SO-101 (tipo `so_follower`).
- Percepción visual multimodal mediante tres cámaras: frontal (`observation.images.front`, 480×640), muñeca (`observation.images.wrist`, 480×640) y una cámara adicional vacía (`observation.images.empty_camera_0`, 224×224).
- Procesamiento de estado articular de 6 dimensiones (`observation.state`).
- Ejecución de la tarea específica de apilar cuencos de plástico blancos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas ni multilingüismo; el modelo está especializado exclusivamente en control robótico.
- No se dispone de información sobre modo "thinking", visión general, audio u otras capacidades especiales.

## Casos de uso

- **Automatización de tareas de pick-and-place en laboratorio**: el modelo puede ejecutar la secuencia de recoger un cuenco y apilarlo sobre otro, adecuado para entornos controlados con posiciones de objetos relativamente fijas y un robot SO-101 calibrado.
- **Investigación en imitación robótica**: sirve como punto de partida para estudiar cómo un VLA preentrenado se adapta a una tarea concreta con solo 100 episodios, permitiendo analizar la transferencia desde `pi05_base`.
- **Prototipado rápido de políticas de manipulación**: con LeRobot y el comando `lerobot-rollout`, se puede desplegar en un robot real en minutos, lo que facilita iteraciones de hardware y calibración de cámaras.
- **Generación de datos sintéticos o aumentados**: el modelo puede usarse como política de referencia para comparar con nuevas variantes entrenadas sobre el mismo dataset, evaluando mejoras en la tasa de éxito.
- **Educación y formación en robótica**: permite a estudiantes ejecutar un pipeline completo de fine-tuning y despliegue de un VLA sin necesidad de entrenar desde cero, usando el modelo base y el dataset público.
- **Benchmarking de infraestructura de inferencia robótica**: al tener 4,14 mil millones de parámetros y pesos safetensors de 97,9 GB, es útil para medir latencia y throughput en GPUs consumer o de datacenter con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, una estimación teórica en FP16 sería de aproximadamente 8,3 GB solo para pesos, más overhead de activaciones y cámaras; sin embargo, no se confirma en la documentación.
- **GPU recomendadas**: no disponible. Por tamaño, cabría esperar que funcione en GPUs consumer de gama alta (RTX 4090, 24 GB) y en GPUs de datacenter (A100, H100), pero no se especifica.
- **¿Cabe en consumer GPU?**: probablemente sí en GPUs con 16 GB o más, pero no se confirma oficialmente.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`), con soporte para `policy.path` y `policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboColosseum/so101-stack-bowls-pi0.5` | 4.143.404.816 | no disponible | Apilar cuencos con SO-101 | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base) | no disponible | Hugging Face |
| π₀ (Pi0) original | no disponible | no disponible | VLA generalista | no disponible | OpenPI (GitHub) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y disponibilidad; no se han publicado benchmarks para el modelo ajustado.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo está entrenado para una única tarea ("apilar cuencos blancos") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- **Sin evaluación publicada**: no hay tasas de éxito ni resultados de robustez, lo que impide valorar su fiabilidad en producción.
- **Dependencia de calibración**: el rendimiento depende de la correcta configuración de las cámaras (nombres e índices deben coincidir con los usados en entrenamiento) y del puerto del robot.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un modelo de imitación, puede reproducir sesgos presentes en los 100 episodios de demostración (posiciones, iluminación, objetos concretos).
- **Limitaciones de contexto e idioma**: no aplica idioma; el contexto visual y de estado está limitado a las dimensiones especificadas (6 de estado, tres cámaras).
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base `pi05_base` puede tener sus propias condiciones; se recomienda verificar la licencia del modelo base y del repositorio OpenPI.
- **Caveat de producción**: el repositorio ocupa 97,9 GB, lo que implica requisitos de almacenamiento y transferencia considerables; además, la inferencia en robot real requiere LeRobot 0.6.1 o compatible.

## Enlaces

- [Hugging Face: RoboColosseum/so101-stack-bowls-pi0.5](https://huggingface.co/RoboColosseum/so101-stack-bowls-pi0.5)
- [Modelo base: lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset: Jiamo0912/so101-stack-bowls](https://huggingface.co/datasets/Jiamo0912/so101-stack-bowls)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio OpenPI (Physical Intelligence)](https://github.com/Physical-Intelligence/openpi)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Visualizar dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-stack-bowls)
