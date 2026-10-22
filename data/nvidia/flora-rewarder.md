# nvidia/Flora-Rewarder

## Resumen

Flora-Rewarder (nvidia/Flora-Rewarder, también referido como Flora-rewarder-27B) es un modelo de recompensa multimodal desarrollado por NVIDIA para anotar episodios de robótica. Toma como entrada secuencias de fotogramas RGB procedentes de una o varias cámaras (por ejemplo, vídeo egocéntrico de un robot o de un humano) junto con un prompt de texto que especifica la tarea de anotación y, opcionalmente, la instrucción de la tarea, y devuelve como salida texto estructurado que se parsea en puntuaciones de recompensa. Es el motor de datos que NVIDIA utilizó para entrenar GR00T-2 y se publica para que la comunidad investigadora pueda escalar la anotación de datasets de robots propios.

El modelo resuelve dos necesidades distintas en el ciclo de vida de una política robótica: recompensas de resultado (outcome rewards), una puntuación entera por episodio de 1 a 5 que sirve para monitorizar despliegues reales y filtrar demostraciones, y recompensas de proceso (process/dense rewards), puntuaciones densas de calidad de acción cada 0,5 segundos dentro de ventanas de 16 segundos, pensadas para el post-entrenamiento con aprendizaje por refuerzo. Además admite recompensas por rúbrica, con una traza de razonamiento seguida de una puntuación por cada paso de la rúbrica.

Arquitectónicamente es un transformer denso de 27.781.428.976 parámetros (≈27,8 B) construido mediante fine-tuning completo —incluido el codificador de visión— sobre Qwen/Qwen3.5-27B, un modelo de visión-lenguaje nativamente multimodal. Su relevancia actual está en que about la anotación de recompensas, tradicionalmente manual y costosa, se convierte en un proceso automático y escalable sobre vídeo real de robots, una pieza crítica para pipelines de RL y de curación de datos en robótica fundacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer; VLM nativamente multimodal (codificador de visión + decodificador LLM decoder-only) basado en Qwen3.5-27B |
| Parámetros totales | 27.781.428.976 (≈2,7 × 10^10) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 16.384 tokens para prompts de outcome y dense; hasta 32.768 tokens para prompts de rúbrica |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; el repositorio ocupa 111,1 GB, consistente con pesos en fp32) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); el modelo base Qwen3.5-27B se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |
| Modalidad de entrada | Vídeo RGB (fotogramas × alto × ancho × 3) + texto (prompt de anotación e instrucción opcional) |
| Modalidad de salida | Texto (cadena parseable a puntuaciones de recompensa) |
| Ventana de vídeo | Outcome: hasta 64 fotogramas muestreados uniformemente (≈10 fps, mínimo 2). Dense: ventanas de 16 s con 64 fotogramas a 4 fps. Rúbrica: un vídeo por cámara a 1 fps, máx. 82 fotogramas por cámara |
| Resolución por fotograma | Entre 65.536 y 131.072 píxeles (prompts de rúbrica) |
| Hardware soportado | NVIDIA Ampere, Blackwell, Hopper y Lovelace |
| Sistema operativo | Linux |
| Runtime | PyTorch + Hugging Face Transformers |
| Fecha de publicación | 15/10/2026 en Hugging Face (repositorio creado el 02/10/2026) |

## Arquitectura y entrenamiento

Flora-Rewarder parte de Qwen3.5-27B (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`) y aplica fine-tuning completo de todos los parámetros, incluido el codificador de visión. El flujo es el siguiente: los fotogramas muestreados de una o varias vistas de cámara se codifican con el encoder visual; los tokens visuales resultantes se concatenan con los tokens de texto del prompt, que describe la tarea de anotación y opcionalmente la instrucción de la tarea; y el decodificador del LLM genera de forma autorregresiva la anotación como texto. No hay una cabeza de regresión separada: la recompensa se emite como texto estructurado que el consumidor parsea en una puntuación de episodio, un vector de puntuaciones densas o puntuaciones por paso de rúbrica.

El modelo soporta tres modos de anotación con preprocesado específico. Las recompensas de resultado reciben un único vídeo en el que cada instante muestreado es un mosaico de hasta cuatro vistas de cámara, con hasta 64 fotogramas uniformes por episodio (al menos 2). Las recompensas densas usan ventanas de 16 segundos con 64 fotogramas a 4 fps y devuelven, por cada paso de 0,5 segundos, una puntuación de calidad de acción (1 = fallo, 2 = subóptimo, 3 = normal), la peor puntuación de la ventana y justificaciones para los pasos no normales. Las recompensas por rúbrica reciben cada cámara como vídeo independiente a 1 fps, con un máximo de 82 fotogramas por cámara, y generan una traza de razonamiento seguida de una puntuación por cada paso de la rúbrica. La model card no detalla la composición exacta del dataset de entrenamiento ni el número de tokens utilizados, y tampoco indica si se emplearon etapas de RLHF o DPO.

## Capacidades

- Evaluación de episodios completos de robótica con una puntuación entera de éxito de 1 (fallo total) a 5 (éxito completo), opcionalmente precedida de una justificación en texto.
- Recompensas densas de calidad de acción cada 0,5 segundos en ventanas de 16 s, con etiquetas de fallo, subóptimo o normal y detección del peor paso de la ventana.
- Evaluación mediante rúbricas: traza de razonamiento explícita más una puntuación por paso de rúbrica, útil para criterios de evaluación definidos por el usuario.
- Procesamiento de vídeo multi-cámara: hasta cuatro vistas combinadas en mosaico por instante en los modos outcome y dense, y una vista por prompt en el modo rúbrica.
- Comprensión de vídeo egocéntrico, tanto de robots como de humanos, lo que habilita investigación en transferencia humano-robot.
- Salida en texto estructurado y parseable, integrable en pipelines automatizados de anotación y filtrado.
- Fine-tuning completo del codificador de visión, no solo del decodificador lingüístico.
- Capacidades de tool calling, function calling, agentes, matemáticas o modo thinking: no disponibles en la información proporcionada (el modelo está especializado en anotación de recompensas).
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Curación y filtrado de datasets de demostraciones: pasar cada episodio grabado por el robot por el modo outcome para obtener una puntuación de 1 a 5 y descartar automáticamente las demostraciones con puntuación baja antes de entrenar una política; con 64 fotogramas por episodio el coste por demostración es acotado y el filtrado se puede paralelizar.
- Post-entrenamiento con RL de políticas robóticas: usar las recompensas densas de 0,5 s como señal de recompensa durante el ajuste por refuerzo, aprovechando que el modelo marca qué tramos concretos de una ventana de 16 s son subóptimos o fallidos en lugar de penalizar el episodio entero.
- Monitorización de despliegues reales en entornos de investigación: anotar en continuo los episodios ejecutados por el robot y seguir la distribución de puntuaciones de resultado para detectar degradación del comportamiento o cambios en las condiciones del entorno.
- Evaluación comparativa de checkpoints con rúbricas: definir una rúbrica específica del laboratorio (por ejemplo, precisión de agarre, seguridad, eficiencia de trayectoria), pasar cada cámara como vídeo a 1 fps y obtener una traza de razonamiento auditable más una puntuación por criterio, lo que facilita comparar políticas de forma reproducible.
- Investigación en transferencia humano-robot: anotar vídeo egocéntrico humano con los mismos criterios de recompensa que el vídeo del robot, generando pares de datos que permiten estudiar qué comportamientos humanos son transferibles a una política.
- Prototipado de pipelines de evaluación de modelos visión-lenguaje-acción (VLA): integrar el rewarder como juez automático en un bucle de evaluación que puntúa rollouts sin intervención humana, reduciendo el tiempo de iteración sobre nuevas políticas.
- Auto-investigación física (physical auto-research): emplear las recompensas como función objetivo en bucles de búsqueda de comportamiento o de configuración de tareas, tal y como plantea la model card entre las aplicaciones emergentes previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia dos conjuntos de evaluación, [RoboReward](https://huggingface.co/datasets/teetone/RoboReward) y [RoboMeter](https://robometer.github.io/), sin incluir cifras concretas de precisión, correlación con anotadores humanos ni comparaciones numéricas con otros modelos.

| Benchmark | Resultado |
|---|---|
| RoboReward | No disponible (referenciado sin cifras) |
| RoboMeter | No disponible (referenciado sin cifras) |
| MMLU / HumanEval / GSM8K | No disponible (no son benchmarks relevantes para este modelo) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 55,6 GB solo para los pesos (27,78 B × 2 bytes), más activaciones y caché KV; en la práctica requiere GPU de 80 GB o reparto en varias GPU.
- VRAM estimada en fp32: unos 111 GB para los pesos (coherente con el tamaño del repositorio, 111,1 GB), lo que exige al menos dos GPU de 80 GB.
- Cuantización: el autor no publica variantes cuantizadas; una cuantización a 4 bits rondaría los 14-15 GB estimados, pero no está soportada ni validada oficialmente.
- GPU recomendadas: NVIDIA H100 o A100 de 80 GB para una sola tarjeta en bf16; alternativas de 48 GB (L40S, RTX 6000 Ada) en configuración multi-GPU. El modelo declara compatibilidad con las microarquitecturas Ampere, Hopper, Lovelace y Blackwell.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 ni en fp32; solo sería viable con cuantizaciones agresivas no publicadas por el autor, por lo que no se recomienda como opción de despliegue.
- Coste de activaciones: los prompts de outcome y dense admiten hasta 64 fotogramas y los de rúbrica hasta 82 fotogramas por cámara con resoluciones de 65.536 a 131.072 píxeles, lo que eleva de forma notable el número de tokens visuales y, con ello, el consumo de memoria y el tiempo de prefill.
- Opciones de despliegue: PyTorch con Hugging Face Transformers sobre Linux, que es el único runtime documentado. Compatibilidad con vLLM, llama.cpp, Ollama, TGI o TensorRT-LLM no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de recompensa para robótica en la información proporcionada, por lo que la comparación se limita al modelo base del que deriva.

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-Rewarder | 27,78 B (denso) | 16.384 tokens (outcome/dense); 32.768 (rúbrica) | Recompensas de outcome, densas y por rúbrica sobre vídeo de robots | NVIDIA OneWay Noncommercial (solo investigación) | Pesos safetensors en Hugging Face; 229 descargas, 13 likes |
| Qwen3.5-27B | ≈27 B (denso) | No disponible en la información proporcionada | VLM generalista de visión-lenguaje | Apache 2.0 | Pesos abiertos en Hugging Face |
| Otros reward models para robótica | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La diferencia funcional clave frente al modelo base es la especialización: Flora-Rewarder ha sido ajustado con fine-tuning completo, incluido el codificador de visión, para emitir anotaciones parseables con un formato de recompensa fijo, mientras que Qwen3.5-27B es un modelo generalista que no produce ese formato de forma nativa ni con la misma fiabilidad.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la NVIDIA OneWay Noncommercial License (22 de marzo de 2022) impide el uso comercial o en producción. El modelo se distribuye únicamente para investigación y desarrollo.
- No es un controlador ni un sistema de seguridad: la model card indica explícitamente que las salidas son anotaciones y que el modelo no debe usarse para controlar un robot ni como único monitor de seguridad de un sistema físico.
- Riesgo de alucinación en las justificaciones: las trazas de razonamiento y las justificaciones de pasos no normales son texto generado y pueden no reflejar la causa real del fallo; conviene auditarlas por muestreo.
- Granularidad limitada de las puntuaciones: el outcome es un entero de 1 a 5 y las puntuaciones densas solo tienen tres niveles (1, 2, 3), lo que limita la resolución de la señal de recompensa en comparaciones finas entre políticas.
- Dependencia de un preprocesado muy concreto: número de fotogramas, fps, mosaico de hasta cuatro cámaras y rangos de resolución por fotograma están fijados por modo; desviarse de esas condiciones puede degradar la calidad de la anotación.
- Límites de contexto por tarea: 16.384 tokens en outcome y dense, 32.768 en rúbrica; episodios largos deben trocearse en ventanas, lo que puede romper la coherencia de la puntuación global.
- Idiomas soportados no documentados; no hay información sobre sesgos demográficos, geográficos o de otro tipo, ni sobre el proceso de mitigación aplicado.
- Plataforma restringida: solo Linux y GPU NVIDIA (Ampere, Hopper, Lovelace, Blackwell); no se documenta soporte para CPU ni para aceleradores de otros fabricantes.
- Sin cuantizaciones publicadas: el despliegue en hardware modesto no está soportado oficialmente.
- Sin métricas de calidad publicadas: no hay datos de correlación con anotadores humanos ni de acuerdo inter-anotador, por lo que la fiabilidad de las puntuaciones debe validarse de forma local antes de usarlas como señal de RL.
- El modelo base Qwen3.5-27B se rige por Apache 2.0, pero la licencia del modelo derivado es la de NVIDIA; la licencia permisiva del base no se hereda.

## Enlaces

- [Hugging Face: nvidia/Flora-Rewarder](https://huggingface.co/nvidia/Flora-Rewarder)
- [NVIDIA Isaac GR00T](https://developer.nvidia.com/isaac/gr00t)
- [GR00T N1 White Paper (arXiv:2503.14734)](https://arxiv.org/abs/2503.14734)
- [Modelo base Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Licencia NVIDIA OneWay Noncommercial (22 de marzo de 2022)](https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf)
- [Dataset RoboReward](https://huggingface.co/datasets/teetone/RoboReward)
- [RoboMeter](https://robometer.github.io/)
- [NVIDIA](https://www.nvidia.com/)
