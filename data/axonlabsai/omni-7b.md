# axonlabsai/Omni-7B

## Resumen

Omni-7B es un modelo omni-modal desarrollado por Axon Labs, construido sobre el modelo base Qwen/Qwen2.5-Omni-7B de Alibaba. El nombre "7B" hace referencia al núcleo de lenguaje, pero el modelo completo incluye encoders de audio y visión, así como un decodificador de habla, alcanzando aproximadamente 9.100 millones de parámetros según la model card, aunque el peso real en safetensors es de 10.732.225.440 parámetros. El modelo acepta texto, imagen, audio y vídeo como entrada, y genera texto y habla como salida, lo que lo convierte en una solución "any-to-any".

Axon Labs ha aplicado un fine-tuning mediante rejection sampling (RFT) y entrenamiento de comportamiento, fusionado en los pesos del "thinker". El checkpoint publicado (round 2) no es el mejor resultado obtenido; el adaptador LoRA de la ronda 1 (`axonlabsai/Omni-7B-lora-rft`) ofrece un rendimiento superior en tareas de código. La relevancia actual radica en que combina multimodalidad con capacidades de generación de código verificadas mediante ejecución real, aunque con limitaciones documentadas que deben tenerse en cuenta antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni-7B (omni-modal, transformer con encoders de audio/vision y decodificador de habla) |
| Parametros totales | 10.732.225.440 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors publicados) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Omni-7B, que integra un núcleo de lenguaje (thinker) con encoders especializados para audio y visión, y un decodificador de habla para generar respuestas vocales. Esta arquitectura permite procesar entradas multimodales de forma unificada y producir salidas tanto textuales como de audio.

El fine-tuning realizado por Axon Labs emplea rejection sampling (RFT): se muestrean soluciones a problemas con tests unitarios reales, se ejecutan, y solo las que pasan se utilizan como datos de entrenamiento. Este proceso se aplicó en dos rondas. La ronda 1 produjo un adaptador LoRA (`Omni-7B-lora-rft`) que mejora el rendimiento en código sin degradar otras capacidades. La ronda 2, cuyos pesos están fusionados en este checkpoint, incluyó 624 ejemplos de los cuales 320 eran datos de identidad para forzar un cambio de nombre, lo que provocó una regresión en BigCodeBench (del 31,7% al 28,3%) debido a una sobre-entrenamiento en brevedad. El proceso de fusión se realizó con los adaptadores `Omni-7B-lora-rft`, `Omni-7B-lora-namefix`, `Omni-7B-lora-namefix2` y `Omni-7B-lora-rft2`, a escala `alpha/r = 2.0`, solo en los tensores del thinker.

## Capacidades

- Procesamiento omni-modal: acepta texto, imagen, audio y vídeo como entrada, y genera texto y habla como salida.
- Generación de código: entrenado con rejection sampling sobre problemas ejecutados, con mejoras verificadas en BigCodeBench y HumanEval+.
- Razonamiento multi-paso: soporta niveles de esfuerzo mediante prefijos `[effort: low]` y `[effort: high]`, que controlan la profundidad del razonamiento.
- Comportamiento sin bucles de instrucción: resuelve conflictos entre instrucciones del sistema y del usuario en un solo paso, sin caer en repeticiones patológicas.
- Identidad configurada: responde como "Ranger Omni" de Axon Labs, aunque con un rename incompleto que puede manifestarse en algunas formulaciones.
- Brevedad aprendida: el RFT seleccionó las soluciones más cortas que pasaban los tests, lo que produce respuestas concisas de forma natural.

## Casos de uso

- Asistente multimodal para atención al cliente: el modelo puede procesar consultas de texto, imágenes o audio del usuario y responder con texto o voz, integrando contexto visual y auditivo en una sola conversación.
- Generación de código con verificación automática: gracias al entrenamiento con ejecución real, puede producir soluciones de código que pasan tests unitarios, útil en entornos de desarrollo asistido.
- Transcripción y resumen de vídeo/audio: al aceptar entradas de audio y vídeo, puede transcribir reuniones o vídeos y generar resúmenes textuales o hablados.
- Tutoría interactiva: combina razonamiento multi-paso con entrada multimodal, permitiendo explicar conceptos a partir de imágenes o diagramas y responder preguntas de seguimiento.
- Prototipado rápido de agentes conversacionales: su comportamiento sin bucles y su capacidad de seguir instrucciones de esfuerzo lo hacen adecuado para sistemas de diálogo controlados.
- Investigación en modelos omni-modales: sirve como base para experimentos de fine-tuning en tareas que requieren integración de múltiples modalidades, gracias a su licencia Apache-2.0.

## Benchmarks y rendimiento

La model card reporta resultados de ejecución real con subprocesos, sobre muestras de 32 a 60 problemas. No se han ejecutado suites de benchmarks estándar completas.

| Benchmark | Checkpoint | Budget | pass@1 |
|---|---|---|---|
| BigCodeBench (60 problemas) | stock Qwen2.5-Omni-7B | 900 tok | 23,3% (14/60) |
| BigCodeBench (60 problemas) | RFT round 1 (LoRA) | 900 tok | 31,7% (19/60) |
| BigCodeBench (60 problemas) | RFT round 2 (estos pesos) | 1800 tok | 28,3% (17/60) |
| HumanEval+ (32 problemas) | stock Qwen2.5-Omni-7B | 1000 tok | 90,6% (29/32) |
| HumanEval+ (32 problemas) | RFT round 1 (LoRA) | 1000 tok | 90,6% (29/32) |
| HumanEval+ (32 problemas) | RFT round 2 (estos pesos) | - | no re-medido |

Los autores advierten que las magnitudes son indicativas y no deben tratarse como resultados de leaderboard. El checkpoint actual (round 2) es inferior al adaptador de la ronda 1 en BigCodeBench.

## Requisitos de hardware

No se proporcionan datos oficiales de hardware en la información disponible. Como estimación orientativa basada en el tamaño del modelo (10.732.225.440 parámetros):

- VRAM estimada para inferencia en FP16: al menos 22-24 GB, por lo que cabría en GPUs como RTX 3090/4090 (24 GB) o A100 (40/80 GB).
- Para cuantización de 8 bits, se podría reducir a ~12-14 GB, permitiendo su uso en GPUs de 16 GB.
- El despliegue puede realizarse con librerías compatibles con transformers (vLLM, TGI) o con llama.cpp si se generan pesos GGUF, aunque no se han publicado cuantizaciones oficiales.
- Dado el tamaño del repo (82,2 GB), se recomienda almacenamiento SSD y suficiente RAM para cargar los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Rendimiento en código |
|---|---|---|---|---|---|
| axonlabsai/Omni-7B (este) | 10,7B (total) | No disponible | Texto, imagen, audio, vídeo | Apache-2.0 | BigCodeBench 28,3% (round 2) |
| Qwen/Qwen2.5-Omni-7B (base) | ~9,1B (total) | No disponible | Texto, imagen, audio, vídeo | Apache-2.0 | BigCodeBench 23,3% |
| axonlabsai/Omni-7B-lora-rft (adaptador) | ~9,1B (base + LoRA) | No disponible | Texto, imagen, audio, vídeo | Apache-2.0 | BigCodeBench 31,7% |

El adaptador LoRA de la ronda 1 es la opción recomendada por los autores para tareas de código, superando tanto al checkpoint fusionado como al modelo base.

## Limitaciones y advertencias

- El checkpoint publicado (round 2) no es el mejor resultado obtenido; el adaptador `Omni-7B-lora-rft` ofrece mejor rendimiento en código.
- El rename de identidad está incompleto: en algunas formulaciones el modelo puede responder como "Axon Omni" en lugar de "Ranger Omni".
- Los benchmarks reportados se basan en muestras pequeñas (32-60 problemas) y no constituyen una evaluación exhaustiva.
- No se ha evaluado el conocimiento general ni capacidades no relacionadas con código tras el fine-tuning.
- La longitud de contexto no está documentada en la información proporcionada; se recomienda verificar el comportamiento con secuencias largas antes de su uso en producción.
- Aunque la licencia es Apache-2.0, el modelo hereda las limitaciones del base Qwen2.5-Omni-7B, que pueden incluir sesgos en datos de entrenamiento y riesgo de alucinación.
- Para usar el modelo con transformers, es necesario ajustar manualmente `eos_token_id` en `generation_config`, ya que viene configurado como `None`, lo que puede provocar generación infinita si no se corrige.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axonlabsai/Omni-7B
- Adaptador LoRA de la ronda 1: https://huggingface.co/axonlabsai/Omni-7B-lora-rft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Perfil de Axon Labs en HuggingFace: https://huggingface.co/axonlabsai/models
