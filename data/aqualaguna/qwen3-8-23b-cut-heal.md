# aqualaguna/Qwen3.8-23B-Cut-Heal

## Resumen

Qwen3.8-23B-Cut-Heal es un modelo derivado de Qwen/Qwen3.8-27B, publicado por el usuario independiente aqualaguna en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un experimento de poda estructurada seguida de destilación: se elimina aproximadamente un cuarto de las neuronas de cada capa feed-forward (de 17.408 a 13.312 unidades en los 64 bloques y el bloque MTP) y se "cura" el daño mediante un adaptador de destilación entrenado contra el modelo original sin podar, que después se fusiona en los pesos. El resultado pasa de 27,3B a 23,2B parámetros (23.691.981.552 según los safetensors), manteniendo intacta la torre de visión y el resto de la arquitectura.

El modelo es multimodal (pipeline image-text-to-text) y conserva la plantilla de chat, el tokenizador y los modos de razonamiento del Qwen3.8 original. La motivación declarada era hacer caber un modelo de 8 bits con 128k de contexto en una única GPU de 32 GB (RTX 5090), aunque el propio autor reconoce que esa premisa se midió mal: el Qwen3.8-27B sin podar también cabe en esa tarjeta a 128k en modo solo texto.

El interés del modelo es, por tanto, principalmente documental: es un registro público de qué se recupera y qué no al aplicar poda más destilación sobre un transformer multimodal moderno. Conserva en torno al 98% de la puntuación media en seis habilidades protegidas, pero cae al 67% en código de competición difícil y no alcanza el umbral de calidad que el autor se había fijado antes de entrenar. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, `Qwen3_5ForConditionalGeneration`) con bloque MTP; FFN podada de 17.408 a 13.312 |
| Parámetros totales | 23.691.981.552 (23,2B según el autor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k), según la configuración de ejemplo del autor |
| Tipos de cuantización | Q8_0 GGUF, NVFP4 (18,2 GB) para vLLM; safetensors en el repo principal |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo principal), GGUF (Q8_0 + proyector de visión), NVFP4 |

## Arquitectura y entrenamiento

La base es un transformer denso de tipo Qwen3.5 con capacidades multimodales (texto e imagen) y un bloque MTP (multi-token prediction). La única modificación estructural es la reducción del ancho de las capas feed-forward: cada FFN pasa de 17.408 a 13.312 unidades, aplicado a los 64 bloques del modelo y al bloque MTP. No se modifica ninguna otra parte de la arquitectura; la torre de visión queda intacta y el bloque MTP no participa en el proceso de curación.

El proceso de recuperación consiste en un adaptador de destilación entrenado contra el modelo sin podar y posteriormente fusionado en los pesos. El autor indica explícitamente que el método completo no está publicado, por lo que no hay detalle sobre el dataset de destilación, el número de tokens, la composición de datos ni si se empleó RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de las que ya trae el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno con la plantilla de chat de Qwen3.8.
- Razonamiento matemático (GSM8K) y lógico (BIG-Bench Hard) con pérdida mínima respecto al original.
- Llamada a funciones y herramientas (function calling / tool calling), evaluada con el conjunto glaive.
- Generación de código, incluyendo ejecución verificada en HumanEval y LiveCodeBench.
- Comprensión multimodal de imágenes: evaluación de clics en pantalla (ScreenSpot-v2), con la torre de visión sin modificar.
- Razonamiento espacial en texto (BBH navigate, StepGame).
- Modo de razonamiento configurable mediante `reasoning_effort` (el autor recomienda `low`) y límite duro de tokens de pensamiento con `--reasoning-budget`.
- Capacidad de agentes y razonamiento multi-paso heredada del modelo base, aunque no evaluada de forma específica en la model card.
- Multilingüismo: no documentado en la información disponible.

## Casos de uso

- Experimentación en investigación sobre poda y destilación: el modelo sirve como referencia reproducible de qué habilidades se conservan y cuáles se degradan al recortar FFN y curar con destilación, con tablas de resultados por tarea.
- Despliegue en una RTX 5090 con cuantización NVFP4: el autor reporta 91-97 tok/s de decodificación frente a ~81 tok/s del 27B sin podar en NVFP4, con un 25% más de caché KV, lo que permite servir chat multimodal en una sola GPU de consumo.
- Asistente conversacional con contexto largo (128k) en hardware limitado, usando la plantilla de Qwen3.8 y `reasoning_effort` en `low` para reducir el gasto de tokens en tareas simples.
- Automatización de agentes que interactúan con interfaces gráficas: la puntuación de 89 en ScreenSpot-v2 (98% de la del original) lo hace utilizable para clics guiados por visión, aunque con menor margen que el modelo sin podar.
- Prototipado de pipelines de tool calling en local: mantiene el 101% de la puntuación del original en function calling, por lo que es adecuado para validar integraciones de herramientas antes de pasar a producción con un modelo mayor.
- Evaluación comparativa de cuantizaciones: al existir versiones Q8_0 GGUF y NVFP4, permite medir el impacto de la cuantización sobre un modelo ya degradado por poda.
- No se recomienda para generación de código de competición o tareas que exijan recuperación precisa de hechos, dado el deterioro medido en LiveCodeBench (32 frente a 48) y PopQA (12 frente a 23).

## Benchmarks y rendimiento

Resultados publicados por el autor. Juez común: llama.cpp b11675, GGUF Q8_0, `reasoning_effort` low, temperatura 1.0 / top-p 0.95 / top-k 20, límite de 6.000 tokens por respuesta, 100 ítems por tarea (150 en benign). Ruido aproximado de ±3 puntos cerca del 90% y ±5 en el rango 30-50.

| Tarea (fuente) | 27B sin podar | Podado | Podado + cura (este) |
|---|---|---|---|
| Matemáticas (GSM8K test) | 98 | 98 | 96 |
| Herramientas (glaive function calling) | 91 | 92 | 92 |
| Lógica (BIG-Bench Hard) | 99 | 91 | 93 |
| Sentido común (CommonsenseQA, WinoGrande) | 88 | 86 | 88 |
| Espacial texto (BBH navigate, StepGame) | 89 | 88 | 86 |
| Clics en pantalla (ScreenSpot-v2, visión) | 91 | 90 | 89 |
| Media de las seis | 92,7 | 90,8 | 90,7 |
| Código (HumanEval, ejecutado) | 100 | 100 | 97 |
| Código difícil (LiveCodeBench 50 medium + 50 hard) | 48 | 29 | 32 |
| Hechos (PopQA, se permite caída) | 23 | 12 | 12 |
| Rechazo de contenido dañino (JailbreakBench) | 93 | 94 | 93 |
| Rechazo de armas (ALERT) | 41 | 35 | 36 |
| Rechazo de contenido sexual (ALERT) | 59 | 65 | 61 |
| Rechazo erróneo de benigno (menor es mejor) | 11,3 | 12,7 | 12,7 |
| Tokens por respuesta, media | 710 | 768 | 759 |
| Respuestas que alcanzan el tope de 6.000 (de 1.450) | 50 | 72 | 62 |

Con un tope de 16.000 tokens en código difícil (solo se repitieron las respuestas truncadas), el 27B sin podar pasó de 48 a 67 y el podado sin curar de 29 a 45: la brecha crece, lo que indica pérdida de habilidad y no solo de presupuesto. El modelo curado no se midió en esa condición. El autor reporta además un 93,3% de coincidencia en el siguiente token frente al original en texto retenido, y una tasa de decodificación de 91-97 tok/s en NVFP4 sobre una RTX 5090.

## Requisitos de hardware

- VRAM estimada: Q8_0 GGUF ocupa 24,7 GB (frente a 29,05 GB del 27B sin podar); NVFP4 ocupa 18,2 GB.
- GPU objetivo del autor: una RTX 5090 de 32 GB con 128k de contexto, pesos de 8 bits y caché KV en q8_0.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) con Q8_0 o NVFP4; en tarjetas de 24 GB solo con cuantizaciones más agresivas o contexto reducido, no verificado en la información disponible.
- Despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl 99`, `--flash-attn on`, `--cache-type-k/v q8_0`), vLLM mediante el checkpoint NVFP4 y transformers con `Qwen3_5ForConditionalGeneration`.
- Throughput: 91-97 tok/s en decodificación sobre RTX 5090 con NVFP4, frente a ~81 tok/s publicados para el 27B sin podar en NVFP4; ~25% más de caché KV disponible.
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Código difícil (LiveCodeBench) | Media seis habilidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-23B-Cut-Heal | 23,2B | 128k | 32 | 90,7 | Apache 2.0 | Hugging Face (safetensors, GGUF, NVFP4) |
| Qwen3.8-27B (base sin podar) | 27,3B | 128k | 48 | 92,7 | Apache 2.0 (según el modelo base) | Hugging Face |
| Qwen3.8-23B-Cut-Heal (podado sin curar) | 23,2B | 128k | 29 | 90,8 | Apache 2.0 | No publicado como checkpoint independiente |

No se dispone de datos de otros modelos de la misma categoría (poda + destilación sobre Qwen3.8) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida acusada en código de competición: 32 frente a 48 del original en LiveCodeBench, un 67% de retención, por debajo del umbral de 40 que el autor fijó antes de entrenar.
- No alcanza los objetivos declarados: el criterio era código difícil ≥ 40, media de seis habilidades ≥ 92 y HumanEval 100; el resultado fue 32 / 90,7 / 97.
- Caída fuerte en recuperación de hechos (PopQA 12 frente a 23), aceptada explícitamente por el autor pero relevante para cualquier uso que requiera conocimiento factual.
- Mayor tendencia a agotar el presupuesto de tokens: 62 respuestas alcanzan el tope de 6.000 frente a 50 del original, y en código difícil 57 de 100 frente a 48.
- El método de poda y destilación no está publicado, lo que limita la reproducibilidad y la auditoría del proceso.
- La torre de visión no se ha reentrenado y el bloque MTP no participa en la curación; el impacto de esto en usos multimodales no está cuantificado.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe equivalente al del modelo base.
- El autor advierte que el modelo no es necesario para el caso de uso que motivó el proyecto, ya que el 27B sin podar también cabe en una RTX 5090 a 128k en modo texto.
- Licencia Apache 2.0 permite uso comercial, pero se heredan los sesgos y riesgos de alucinación del modelo base, agravados por la pérdida de conocimiento factual.
- No se han publicado evaluaciones de seguridad específicas más allá de las columnas de rechazo, que el autor incluye solo para observar deriva y no como objetivo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal
- GGUF Q8_0 + proyector de visión: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-GGUF
- NVFP4 para vLLM: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
