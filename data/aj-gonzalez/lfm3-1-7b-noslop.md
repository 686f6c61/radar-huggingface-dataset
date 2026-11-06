# AJ-Gonzalez/LFM3-1.7B-noslop

## Resumen

LFM3-1.7B-noslop es una variante derivada de LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.728.801.536 parámetros desarrollado originalmente por Liquid AI. Esta versión concreta la publica el usuario AJ-Gonzalez y no introduce ningún entrenamiento nuevo: aplica una corrección de bajo rango sobre los pesos del modelo base para reducir la presencia de clichés literarios y fórmulas de estilo "slop" en la generación de texto. El resultado es un modelo de la misma arquitectura y tamaño que el original, pero con una distribución de siguiente token deliberadamente desplazada.

El interés de esta ficha radica en que ilustra una técnica de edición de pesos sin fine-tuning: se modifica el comportamiento estilístico de un modelo mediante ablación de rango arbitrario (Arbitrary-Rank Ablation, rango 50) generada con la herramienta Heretic 2.0.0, en lugar de reentrenar con datos. Esto permite obtener un modelo más sobrio en su prosa manteniendo las capacidades del base, a costa de una divergencia KL acotada y medible.

La relevancia es doble: por un lado, para quienes necesitan generación de texto conversacional sin muletillas ni fórmulas manidas; por otro, como caso práctico de modificación quirúrgica de pesos en un modelo tri-híbrido (atención, convolución y feed-forward) con licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (atención + convolución + feed-forward) con código de modelado propio (`modeling_lfm3.py`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos completos), GGUF Q5_K_M, GGUF Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (bf16), GGUF (Q5_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer tri-híbrido: combina módulos de atención con módulos convolucionales y capas feed-forward, lo que se refleja en que la corrección aplicada por esta variante afecta a tres familias de módulos (`attn.o_proj`, `conv.out_proj` y `feed_forward.w2`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

Esta variante no se ha fine-tuneado y no se han usado respuestas como datos de entrenamiento. El método consiste en capturar pares de entrada/salida de cada matriz ablacionable sobre 500 variantes de prompts "buenos" (con instrucción de evitar clichés) y 500 "malos" (con instrucción de usarlos intensamente), y ajustar una LoRA de rango 50 (`W + B·A`) por matriz con L-BFGS, de modo que las activaciones de los prompts malos se desplacen hacia las salidas de los buenos sin mover estas últimas. La búsqueda se realizó con 12 ensayos (4 de inicio aleatorio, 8 con TPE) durante 5 h 59 m en un Apple M1 con 8 GB de memoria unificada, en MPS y bfloat16, con batch size 2.

La configuración seleccionada corresponde al índice 3 de la frontera de Pareto (9 puntos): capas 7 a 21, `preserve_good_behavior_weight = 0.6028`, `steer_bad_behavior_weight = 0.0151`, `overcorrect_relative_weight = 0.5508`, `neighbor_count = 10` y `lora_rank = 50`. Las capas 0-6 y 22-23 quedan intactas.

## Capacidades

- Generación de texto conversacional con prosa más sobria: reduce la tasa de respuestas con marcadores de cliché del 71 % al 23 % en el conjunto de evaluación del autor.
- Razonamiento y generación general heredados del modelo base LFM3-1.7B, sin cambios de arquitectura.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso en infraestructura de inferencia estándar, aunque no se detalla.

## Casos de uso

- Generación de contenido editorial y marketing: el modelo produce textos con menos fórmulas manidas ("en el mundo actual", "es importante destacar"), lo que reduce la carga de edición posterior en blogs, newsletters y copys.
- Asistentes conversacionales de atención al cliente: al mantener el comportamiento del base pero con menor deriva estilística, sirve para respuestas multi-turno donde se busca un tono natural y no repetitivo.
- Herramientas de escritura asistida: integrado en editores o plataformas de redacción, ayuda a redactar borradores con menos clichés, y el usuario puede revisar el resultado final.
- Generación de guiones y narrativa breve: útil en prototipos de ficción o guiones donde el estilo importa y se quiere evitar la prosa genérica típica de modelos pequeños.
- Investigación sobre edición de pesos: sirve como caso de estudio reproducible de ablación de rango arbitrario y de cómo medir el compromiso entre reducción de sesgo estilístico y divergencia KL.
- Despliegue en local y en dispositivos con recursos limitados: con GGUF Q5_K_M (~1,3 GB) puede ejecutarse en llama.cpp, LM Studio u Ollama en equipos de gama consumer.
- Evaluación comparativa de técnicas de "deslop": permite contrastar el efecto de la corrección frente al modelo base en tareas de escritura y estilo.

## Benchmarks y rendimiento

El autor publica una única medición de estilo sobre 100 prompts de escritura reservados (`llm-aes/writing-prompts`, split `train[1000:1100]`), con 124 marcadores de cliché literario:

| Métrica | Base LFM3-1.7B | LFM3-1.7B-noslop |
|---|---|---|
| Respuestas con slop | 71 / 100 | 23 / 100 |
| Divergencia KL respecto al base | 0 (por definición) | 0,2472 nats |

La KL de 0,2472 corresponde a un aumento de ~28 % en dispersión predictiva, medido sobre la distribución de siguiente token en el mismo conjunto de prompts. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~3,4 GB de pesos, más overhead de activaciones y contexto; en la práctica, unos 4-5 GB.
- GGUF Q8_0: ~1,9 GB, apto para GPUs con 4 GB o más.
- GGUF Q5_K_M: ~1,3 GB, apto para GPUs con 2-3 GB o para CPU.
- GPU recomendadas: RTX 3060/4060 y superiores para bf16; cualquier GPU con 4 GB para Q8_0. Para bf16 con contexto largo, se recomienda 8 GB o más (RTX 3070/4070, A10, L4).
- Cabe en GPU consumer: sí, en la mayoría de modelos recientes con 4 GB o más, especialmente en cuantización GGUF.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código de modelado propio), llama.cpp, LM Studio y Ollama para los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-noslop | 1,73 B | No disponible | LFM Open License v1.0 | Variante con corrección de estilo, 23/100 respuestas con slop |
| LiquidAI/LFM3-1.7B | 1,73 B | No disponible | LFM Open License v1.0 | Modelo base, 71/100 respuestas con slop |
| Alternativas de ~1-2 B | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base y a la métrica de estilo del autor.

## Limitaciones y advertencias

- La divergencia KL es un indicador de daño, no una métrica de calidad: mide la deriva en el primer token generado sobre un conjunto de prompts, y no captura coherencia a largo plazo, repetición ni daño en el seguimiento de instrucciones.
- La tasa del 23 % es una tasa de marcadores, no un juicio a nivel de frase: una respuesta cuenta como slop si contiene cualquiera de las 124 frases listadas, y la lista es deliberadamente tosca.
- No es un ajuste de seguridad: el comportamiento del modelo base, incluida la conducta de rechazo, permanece en gran medida sin cambios.
- La corrección solo afecta a `o_proj`, `out_proj` y `w2` en las capas 7-21; las capas 0-6 y 22-23 no se tocan.
- Riesgo de alucinación: no evaluado en la información disponible; se hereda el del modelo base.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponible.
- Licencia: LFM Open License v1.0; es necesario revisar las condiciones de uso comercial del modelo base, ya que esta variante se distribuye bajo la misma licencia.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código de modelado personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/LFM3-1.7B-noslop
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Conjunto de prompts de escritura: `llm-aes/writing-prompts` (split `train[1000:1100]`)
