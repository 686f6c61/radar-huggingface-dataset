# bghira/wan2.1-1.3b-anyflow-wip

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo de texto a video Wan2.1-T2V-1.3B de Alibaba, desarrollado por el usuario bghira. El adaptador, denominado "anyflow", está entrenado específicamente para funcionar con el scheduler AnyFlow, lo que permite generar videos de alta calidad en tan solo 4 pasos de inferencia, en lugar de los 50 o más que requiere el modelo base. Esto supone una reducción drástica del coste computacional y de la latencia, haciendo viable la generación de video en hardware de consumo.

El modelo se presenta como un PEFT LoRA estándar, compatible con la librería `diffusers`, y se distribuye bajo licencia Apache 2.0. El adaptador no modifica el text encoder del modelo base, por lo que se puede reutilizar el encoder original para las inferencias. El entrenamiento se realizó sobre un subconjunto de 8192 videos del dataset OpenVid, con una resolución de 832x480 y 81 frames por clip, utilizando técnicas de flow matching con shift=5.0.

La relevancia de este adaptador radica en su capacidad para acelerar la generación de video manteniendo una calidad aceptable, lo que lo hace interesante para prototipado rápido, creación de contenido en tiempo real y aplicaciones interactivas donde los recursos computacionales son limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de difusión Wan2.1-T2V-1.3B |
| Parametros totales | No disponible (el adaptador no reporta el número de parámetros; el modelo base tiene 1.3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (relacionado con 81 frames a 16 FPS, resolución 832x480) |
| Tipos de cuantizacion | No especificados; se menciona cuantización opcional con `optimum-quanto` (qint8) en el transformer |
| Idiomas soportados | No disponibles (el modelo base Wan2.1 soporta inglés y chino; el prompt negativo de ejemplo está en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según la mención de EMA en safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar con rank 256 y alpha 256, entrenado sobre el transformer del modelo Wan2.1-T2V-1.3B. El entrenamiento se realizó con SimpleTuner, utilizando predicción de tipo flow matching con shift=5.0. Se emplearon 4000 pasos de entrenamiento con un learning rate de 6e-05, warmup de 1000 pasos y un batch efectivo de 8 (micro-batch de 1 en 8 GPUs). La precisión de los parámetros entrenables fue BF16 puro, mientras que el modelo base se mantuvo sin cambios de precisión.

El dataset de entrenamiento, denominado `wan21-anyflow-openvid-81f-832x480`, contiene 8192 videos con 81 frames cada uno, a 16 FPS y resolución 832x480. No se utilizó regularización de datos. El text encoder no fue entrenado, por lo que se reutiliza el del modelo base. La validación se realizó con CFG 1.0, 4 pasos y el scheduler `AnyFlowValidationScheduler` (basado en `FlowMatchEulerDiscreteScheduler`), lo que confirma el objetivo de inferencia rápida.

## Capacidades

- Generación de video a partir de texto (text-to-video) con el pipeline `WanPipeline` de `diffusers`.
- Generación de video a partir de imagen (image-to-video), según los tags del repositorio.
- Inferencia en pocos pasos (4 pasos) gracias al entrenamiento con el scheduler AnyFlow, reduciendo significativamente el tiempo de generación.
- Compatibilidad con la librería `diffusers` mediante `load_lora_weights`, permitiendo una integración sencilla en pipelines existentes.
- Soporte de negative prompts para controlar la calidad y evitar artefactos.
- Posibilidad de cuantizar el transformer (por ejemplo, con `optimum-quanto` a qint8) para reducir el consumo de VRAM sin necesidad de reentrenar.

## Casos de uso

- Creación de vídeos promocionales cortos: el modelo puede generar clips de 81 frames (aproximadamente 5 segundos a 16 FPS) a partir de una descripción textual, ideal para campañas de marketing en redes sociales. Su baja latencia permite iterar rápidamente sobre diferentes conceptos.
- Prototipado de animaciones para diseño y publicidad: los equipos creativos pueden generar storyboards animados en minutos, evaluando composición, movimiento y estilo antes de invertir en producción completa.
- Generación de contenido educativo y divulgativo: permite crear vídeos explicativos sencillos a partir de guiones, con la posibilidad de ajustar el prompt negativo para evitar distorsiones.
- Desarrollo de aplicaciones interactivas en tiempo real: al requerir solo 4 pasos de inferencia, el modelo puede integrarse en herramientas de generación de video bajo demanda, como avatares virtuales o demos interactivas.
- Aumento de datos para entrenamiento de otros modelos: los vídeos generados pueden servir como datos sintéticos para tareas de visión por computador, siempre que se valide su calidad.
- Evaluación de schedulers de pocos pasos: al estar específicamente entrenado para AnyFlow, sirve como banco de pruebas para investigar técnicas de destilación y aceleración en modelos de difusión de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas (como FVD, CLIP score u otras) frente a otros modelos de generación de video. Tampoco se proporcionan datos de throughput o latencia medidos en hardware específico.

## Requisitos de hardware

- El modelo base Wan2.1-T2V-1.3B tiene 1.3B parámetros, por lo que en BF16 ocupa aproximadamente 2.6 GB de VRAM solo para los pesos del transformer. El adaptador LoRA añade una cantidad adicional (rank 256, aunque el tamaño exacto no se reporta).
- Con cuantización a qint8 (como se sugiere en el código de ejemplo), el consumo de VRAM puede reducirse a alrededor de 1.3 GB, lo que permitiría ejecutar el modelo en GPUs consumer con 6 GB o menos.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) para inferencia con cuantización. Sin cuantizar, se recomienda al menos 8 GB (RTX 3070, RTX 4070, etc.).
- El código de ejemplo utiliza `pipeline.to('cuda')` o `'mps'`, lo que indica soporte para CUDA y Apple Silicon (MPS).
- Opciones de despliegue: la integración con `diffusers` permite ejecutar el modelo en entornos Python estándar. No se mencionan otros runners como vLLM u Ollama, que están orientados a modelos de lenguaje.
- La latencia estimada es baja gracias a los 4 pasos de inferencia, pero no se proporcionan cifras concretas. En una GPU moderna, la generación de un clip de 81 frames podría completarse en unos pocos segundos, aunque esto depende del hardware y de la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Resolución | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bghira/wan2.1-1.3b-anyflow-wip (LoRA) | Adaptador sobre 1.3B | 832x480, 81 frames | 4 (AnyFlow) | Apache 2.0 | HuggingFace |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | 832x480, hasta 81 frames | 50+ (típico) | Apache 2.0 | HuggingFace |
| ModelScope T2V (1.3B) | 1.3B | 256x256, 16 frames | 50 | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de tamaño similar, pero no se dispone de datos de rendimiento cuantitativos para establecer una comparación objetiva. El principal diferenciador de este adaptador es su capacidad de generar video en 4 pasos, lo que lo hace significativamente más rápido que el modelo base y que alternativas como ModelScope T2V.

## Limitaciones y advertencias

- El tag `not-for-all-audiences` sugiere que el modelo puede generar contenido no apto para todos los públicos; no se especifica la naturaleza exacta, pero debe usarse con precaución en entornos comerciales o públicos.
- No se han publicado métricas de calidad objetiva, por lo que la fidelidad visual y la coherencia temporal no están garantizadas en comparación con modelos más grandes o recientes.
- El adaptador está entrenado para una resolución y número de frames concretos (832x480, 81 frames); usarlo con otras configuraciones puede degradar la calidad.
- El text encoder no fue entrenado, por lo que la comprensión de prompts depende del modelo base. Los idiomas soportados no están documentados, aunque el modelo base maneja inglés y chino.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del dataset OpenVid para asegurar el cumplimiento.
- Al ser un trabajo en progreso (WIP, según el nombre), puede contener artefactos o comportamientos inesperados en ciertos prompts. Se recomienda validar exhaustivamente antes de usarlo en producción.

## Enlaces

- Repositorio del adaptador: [bghira/wan2.1-1.3b-anyflow-wip](https://huggingface.co/bghira/wan2.1-1.3b-anyflow-wip)
- Modelo base: [Wan-AI/Wan2.1-T2V-1.3B-Diffusers](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers)
