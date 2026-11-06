# CaptchaKraken/SunlightV2-0.8B-q4

## Resumen

SunlightV2-0.8B-q4 es la variante cuantizada a 4 bits del modelo pointer Sunlight V2, desarrollado por CaptchaKraken sobre el modelo base Qwen/Qwen3.5-0.8B (852.985.920 parámetros). No es un modelo generativo de texto: incorpora cabezas de puntero (`pointer_heads.safetensors`) entrenadas mediante LoRA (rango 16, fusionada) que leen directamente de un único prefill de prompt la respuesta completa de un captcha (acción, puntos de clic, arrastres, texto y momento de vídeo). Está pensado para resolver captchas reales en producción, no para conversación general.

La relevancia de esta ficha concreta reside en la cuantización: se ha aplicado GPTQ W4A16 con llm-compressor 0.12 (grupo 128, simétrico, act-order estático) sobre 256 tableros del split de entrenamiento, manteniendo en bf16 la torre de visión, los embeddings, el `lm_head`, las cabezas de puntero y las proyecciones `in_proj_a` / `in_proj_b` del bloque Gated DeltaNet. El resultado ocupa 0,9 GiB frente a 1,6 GiB en bf16 y, según el autor, conserva el 99,9% de los tableros resueltos por la versión completa.

El modelo se sirve con vLLM 0.25.1 como modelo de pooling a través del plugin `CaptchaPointerForConditionalGeneration`, e incluye un parche (`client-fixes.patch`) que corrige dos fallos de servicio detectados el 2026-11-01. La licencia es LGPL-3.0 y el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5 (incluye bloque Gated DeltaNet); cabezas de puntero adicionales para predicción de acciones y coordenadas |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ W4A16 (grupo 128, simétrico, act-order estático, formato compressed-tensors); pesos en bf16 para torre de visión, embeddings, `lm_head`, cabezas de puntero e `in_proj_a`/`in_proj_b` |
| Idiomas soportados | No disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (compressed-tensors, cargable por vLLM); existe variante GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y le añade cabezas de puntero entrenadas con LoRA de rango 16 (posteriormente fusionada). La inferencia no genera texto: en un único prefill del prompt fijo, las cabezas leen la respuesta completa (acción, puntos, arrastres, texto y momento de vídeo). El entrenamiento corresponde a la ejecución `20261030-100636-qwen-0.8b`: 43.963 tableros, 1 época, learning rate 1e-4 (1e-3 para las cabezas), acumulación 8, con la mitad de los tableros dibujados con marcas numeradas de elementos. El prompt es único y fijo para todos los captchas.

La cuantización se realizó con llm-compressor 0.12 aplicando GPTQ W4A16 sobre 256 tableros del split de entrenamiento (56 vídeos, 163 tipos de puzzle, excluyendo el conjunto de gate). El autor midió también una variante AWQ+GPTQ que rindió peor (98,3% de recuperación) y no la publicó. El modelo se sirve en vLLM como modelo de pooling mediante el plugin `CaptchaPointerForConditionalGeneration`, con el prefijo caching desactivado por el parche de cliente incluido.

## Capacidades

- Resolución de captchas de clic: predice coordenadas de clic sobre la imagen a partir de un prompt fijo.
- Resolución de captchas de rejilla (grid): selección de celdas; es la categoría donde la cuantización a 4 bits pierde más rendimiento.
- Resolución de captchas de vídeo: identifica el momento del vídeo relevante, con soporte del token `<|vision_start|><|video_pad|><|vision_end|>`.
- Resolución de captchas de texto: 12 tableros en el conjunto de gate, con tasas de acierto bajas.
- Soporte de arrastres (drags) además de clics simples.
- Procesamiento multimodal: torre de visión en bf16 para imágenes y fotogramas de vídeo.
- Modo con marcas numeradas de elementos (`marked=True`), que el cliente puede activar por petición.
- No dispone de generación de texto libre, tool calling, razonamiento multi-step ni capacidades de agente.

## Casos de uso

- Automatización de pipelines de QA sobre captchas propios: el modelo permite medir la tasa de resolución de un sistema de captcha antes de desplegarlo, sirviendo como cliente automatizado contra el conjunto de gate de 1.067 tableros etiquetados a mano.
- Servicio de resolución de captchas en producción con vLLM: al cargarse como modelo de pooling y ocupar 0,9 GiB en W4A16, permite atender peticiones con un solo prefill por captcha y sin generación autorregresiva, lo que reduce la latencia frente a un modelo generativo.
- Procesamiento de captchas de vídeo en lote: la variante q4 mantiene el 57,0% de resolución tanto en modo plano como marcado, por lo que es adecuada para clasificar clips y localizar el momento correcto en flujos de verificación.
- Extracción de coordenadas para integración con clientes de automatización: las cabezas devuelven puntos y arrastres directamente, lo que simplifica la integración con frameworks de automatización de navegador que esperan coordenadas en lugar de texto.
- Despliegue en GPU de gama media para entornos de investigación: el peso de 0,9 GiB y la ausencia de generación de texto permiten ejecutarlo en GPUs con poca VRAM, siempre que se cumpla el requisito de vLLM 0.25.1 y el parche de cliente.
- Evaluación comparativa de cuantizaciones: al publicarse junto a la versión bf16 y a la variante GGUF, sirve para estudiar la degradación de GPTQ W4A16 en tareas de percepción visual con cabezas de regresión, especialmente en rejillas.
- Fine-tuning posterior sobre la variante LoRA: el repo hermano `SunlightV2-0.8B-LoRA` permite adaptar el modelo a nuevos tipos de puzzle sin partir de cero, usando esta variante q4 solo para inferencia.

## Benchmarks y rendimiento

Resultados del conjunto de gate Tier 2 (1.067 tableros reales etiquetados a mano, servidos con vLLM 0.25.1). Tasa de resolución, formato plano / marcado:

| Categoría | bf16 | GPTQ W4A16 |
|---|---|---|
| Todos | 53,5% / 51,3% | 53,9% / 50,8% |
| Clic (674) | 60,4 / 58,5 | 61,6 / 58,8 |
| Rejilla (223) | 31,8 / 26,0 | 29,6 / 22,9 |
| Vídeo (158) | 56,3 / 57,6 | 57,0 / 57,0 |
| Texto (12) | 33,3 / 25,0 | 33,3 / 37,5 |

La cuantización conserva el 99,9% de los tableros resueltos por bf16 (31 perdidos y 30 ganados de 2.129 respuestas; misma acción en 2.128; desplazamiento de puntos p50 = 0, p90 = 0). La pérdida se concentra en rejillas (-2 a -3 puntos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GiB de pesos en W4A16, más overhead de vLLM, activaciones y torre de visión en bf16; el consumo real no está publicado.
- GPU recomendadas: no especificadas por el autor; vLLM 0.25.1 requiere GPU NVIDIA compatible con su soporte de compressed-tensors.
- Cabe en GPUs de consumo con suficiente VRAM para vLLM; el autor no publica una lista de modelos verificados.
- Opciones de despliegue: vLLM 0.25.1 con el plugin `CaptchaPointerForConditionalGeneration` y el parche `client-fixes.patch` aplicado sobre el commit `ef2ec28` del cliente CaptchaKraken; para CPU existe la variante GGUF en repo separado (Q4_K_M, BF16, mmproj) para llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunlightV2-0.8B-q4 | 852.985.920 | No disponible | GPTQ W4A16 | LGPL-3.0 | Hugging Face, vLLM |
| SunlightV2-0.8B (bf16) | 852.985.920 | No disponible | bf16 | LGPL-3.0 | Hugging Face, vLLM |
| TwilightV2-2B | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| MidnightV2-4B | No disponible | No disponible | No disponible | No disponible | Hugging Face |

Las tres variantes pertenecen a la misma familia de modelos pointer del autor; Twilight V2 y Midnight V2 son versiones de mayor tamaño (2B y 4B) de las que no se detallan especificaciones en la información disponible. No se dispone de comparación con modelos de otras familias.

## Limitaciones y advertencias

- Modelo especializado: no genera texto ni mantiene conversación; cualquier uso fuera de la resolución de captchas carece de sentido.
- Dependencia estricta del cliente: las cabezas coinciden exactamente con el commit `ef2ec28` de CaptchaKraken; clientes posteriores (cambios del 2026-10-30 en la cabeza de offset/elemento) las rechazan.
- Requiere aplicar `client-fixes.patch` sobre `ef2ec28` antes de servir con vLLM 0.25.1: corrige el fallo de todas las peticiones de vídeo (el prompt enviaba un `<|video_pad|>` suelto que vLLM no expandía) y el fallo con prompts ya cacheados, que devolvía estados ocultos solo de la cola no cacheada y hacía que las cabezas indexaran fuera de rango; el prefix caching queda desactivado.
- Rendimiento bajo en rejillas: 29,6% / 22,9% en W4A16 frente a 31,8% / 26,0% en bf16; es la categoría donde la cuantización penaliza más.
- Conjunto de texto muy pequeño (12 tableros), por lo que las tasas de esa categoría tienen alta varianza.
- Tasa global de resolución del 53,9% / 50,8%: no es un modelo fiable para resolver captchas de forma autónoma sin supervisión.
- Riesgo de alucinación no evaluado en la información disponible; al no generar texto, el modo de fallo es una acción o coordenada incorrecta.
- Sesgos conocidos: no documentados.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar el cumplimiento si se distribuye el modelo o el cliente modificado.
- Uso ético y legal: la resolución automatizada de captchas puede vulnerar los términos de servicio de los sitios objetivo; el autor no documenta restricciones de uso adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-q4
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pesos bf16: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-LoRA
- Variante GGUF para llama.cpp: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-GGUF
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Familia Midnight V2 (4B): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos v2 (large): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos v2 (lite): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
