# litert-community/LFM3-1.7B-Base-LiteRT

## Resumen

LFM3-1.7B-Base-LiteRT es la conversión al formato LiteRT-LM del checkpoint preentrenado LiquidAI/LFM3-1.7B-Base, publicada por la comunidad litert-community. El modelo original lo desarrolla Liquid AI y emplea una arquitectura híbrida de 1,73 mil millones de parámetros distribuidos en 24 capas (13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 de atención global), con un vocabulario de 128.000 tokens y cobertura de 16 idiomas. Esta versión empaqueta los pesos en ficheros `.litertlm` listos para ejecutarse en dispositivos de borde mediante la librería LiteRT-LM de Google.

El problema que resuelve es la ejecución de un modelo de lenguaje de casi 2.000 millones de parámetros en hardware móvil sin necesidad de infraestructura de servidor. Los ficheros ocupan entre 1,44 GB (cuantización mixta int4) y 1,80 GB (int8), e incluyen la caché KV integrada con opciones de 2.048 y 4.096 tokens. En una GPU de Galaxy S26 con LiteRT-LM 0.19.1, el fichero mixto int4 con caché de 2.048 alcanza 32,40-32,63 tokens/s tras un prefill de 1.024 tokens.

Es relevante ahora porque demuestra que la inferencia local en dispositivos de consumo es viable con modelos de arquitectura moderna (híbrida convolución-atención) y cuantizaciones agresivas, aunque se trata de un checkpoint *base* orientado a fine-tuning y a continuación de texto, no a uso conversacional directo. Liquid AI recomienda explícitamente usar la variante post-entrenada LFM3-1.7B para chat, tool calling y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas (13 convoluciones cortas con compuerta, 5 atención de ventana deslizante, 6 atención global) |
| Parametros totales | 1,73 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Caché KV de 2.048 o 4.096 tokens según fichero (prompt + respuesta) |
| Tipos de cuantizacion | Mixta int4 (MLP gate/up en int4 blockwise de 32 pesos; resto int8 por canal) e int8 por canal |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | `.litertlm` (TFLite con sección TFLiteWeights externa) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina capas de convolución corta con compuerta (gated short convolutions) y capas de atención, repartidas en 13 convoluciones, 5 atenciones de ventana deslizante y 6 atenciones globales sobre 24 capas totales. Esta mezcla reduce el coste computacional de la atención completa manteniendo capacidad de modelado de dependencias largas. El vocabulario es de 128.000 tokens, lo que favorece la compresión de texto multilingüe.

El checkpoint original es un modelo *base* preentrenado; la model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO (no disponible). La conversión a LiteRT-LM se realizó con litert-torch (commit f61d0b7) y litert-lm-builder 0.18.1, y posteriormente se reempaquetó con litert-lm-builder 0.18.0 para colocar los pesos en una sección TFLiteWeights. Los ficheros incluyen firmas de prefill de 1.024, 256, 64, 16, 4 y 1 tokens, el `tokenizer.json` original byte a byte, la plantilla de chat de LFM3-1.7B y un canal de pensamiento (`<think>` … `</think>`). No declaran sampler ni tipo de activación: LiteRT-LM selecciona el token más probable en cada paso y en GPU usa activaciones fp16.

## Capacidades

- Generación de texto y continuación de contexto: el modelo está diseñado para completar texto a partir de un prefijo, sin parada natural propia.
- Aprendizaje few-shot: admite prompts con ejemplos resueltos en formato `Question: …\nAnswer: …` y corte de la respuesta en el siguiente `\nQuestion:`.
- Razonamiento básico y matemáticas: la model card reporta 72,3 de 100 preguntas de GSM8K en la versión int8 y 69,0 en la mixta int4 (el modelo fuente en bfloat16: 69).
- Capacidades multilingües: 16 idiomas declarados (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco).
- Canal de pensamiento: los ficheros incluyen el canal `<think>` … `</think>` y la plantilla de chat, activable o desactivable mediante `ThinkingConfig`.
- Tool calling y agentes: no es una capacidad del checkpoint base; Liquid AI remite a LFM3-1.7B para esas funciones.
- Visión y audio: no disponible (modelo solo de texto).

## Casos de uso

- Asistentes de dominio con fine-tuning: el modelo base está pensado para ajuste fino sobre datos propios (legal, médico, técnico) y desplegarse en el dispositivo; su tamaño de 1,44-1,80 GB permite distribuirlo dentro de una app móvil.
- Autocompletado y continuación de texto en aplicaciones de escritura: con `--no-template` y un límite de tokens, el modelo continúa un párrafo o documento respetando el estilo del prefijo.
- Clasificación y extracción few-shot: usando pares `Question: …\nAnswer: …` se pueden construir clasificadores ligeros sin entrenamiento adicional, con la ventaja de que todo el procesamiento ocurre localmente.
- Procesamiento de texto multilingüe en el borde: con 16 idiomas cubiertos, sirve para normalización, resumen o reescritura de textos en apps que no pueden enviar datos a la nube.
- Investigación en eficiencia de inferencia: los ficheros permiten medir latencia y throughput de arquitecturas híbridas en GPU y CPU móviles, con variantes int4 e int8 comparables.
- Base para post-entrenamiento con nuevos métodos: Liquid AI lo indica explícitamente para experimentar con técnicas de alineación o instrucción sobre un checkpoint preentrenado.
- Prototipado de asistentes conversacionales: aunque no es su uso recomendado, la plantilla de chat incluida permite probar el formato conversacional antes de migrar a LFM3-1.7B.

## Benchmarks y rendimiento

Datos reportados en la model card para los ficheros de esta conversión:

| Metrica | Mixta int4 | int8 | Fuente (bfloat16) |
|---|---|---|---|
| Acuerdo de top-token | 93 % | 98 % | referencia |
| GSM8K (sobre 100) | 69,0 | 72,3 | 69 |

Rendimiento en Galaxy S26 (LiteRT-LM 0.19.1, 2026-11-18, cuatro ejecuciones):

| Metrica | Mixta int4 (ekv2048) | int8 (ekv2048) | Mixta int4 (CPU) | int8 (CPU) |
|---|---|---|---|---|
| Decodificación GPU | 32,40-32,63 tok/s | 28,61 tok/s (2026-11-08) | — | — |
| Decodificación CPU | 35,11 tok/s | 31,13 tok/s | — | — |
| Prefill CPU | 329,6 tok/s | 752,2 tok/s | — | — |
| Tiempo al primer token (CPU, prefill 1.024) | 3,16 s | 1,39 s | — | — |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,44 GB para los ficheros mixtos int4 y 1,80 GB para los int8, más el espacio de la caché KV (2.048 o 4.096 tokens).
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones publicadas corresponden a la GPU de un Galaxy S26.
- GPU de consumo: por tamaño, los ficheros caben en GPUs de consumo con 4 GB o más de VRAM, aunque no hay mediciones publicadas para RTX 4090, A100 o H100.
- Despliegue: LiteRT-LM 0.19.1 mediante CLI (`uvx --from litert-lm==0.19.1 litert-lm run`) o API de Python (`litert_lm.Engine`), con backend GPU o CPU (`thread_count=4` en las pruebas de CPU).
- Latencia y throughput: ver tabla de benchmarks; el prefill de 1.024 tokens en CPU tarda 1,39 s (int8) y 3,16 s (mixta int4) hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-LiteRT | 1,73 B | 2.048 / 4.096 | litertlm | lfm1.0 | Conversión on-device del base |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | safetensors | lfm1.0 | Checkpoint original en bfloat16 |
| LiquidAI/LFM3-1.7B | 1,73 B | no disponible | safetensors | lfm1.0 | Variante post-entrenada para chat, tool calling y agentes |
| litert-community/LFM3-1.7B-LiteRT | 1,73 B | no disponible | litertlm | lfm1.0 | Conversión on-device de la variante post-entrenada |

## Limitaciones y advertencias

- Es un modelo *base*: no está alineado para instrucciones ni conversación; Liquid AI desaconseja su uso directo para chat, tool calling y agentes.
- Un modelo base rara vez termina un texto por sí mismo; sin límite de tokens escribe hasta llenar el contexto.
- Riesgo de alucinación y de generar contenido sesgado o incorrecto: no se documentan mitigaciones ni evaluaciones de sesgo en la información disponible.
- Contexto limitado a 2.048 o 4.096 tokens según fichero; `ekv4096` decodifica más lento que `ekv2048` en el Galaxy S26.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar.
- Los ficheros no declaran sampler ni tipo de activación; el comportamiento de muestreo queda a cargo de LiteRT-LM (token más probable en cada paso).
- La model card menciona "Known runtime issues" relacionados con el reempaquetado de pesos en la sección TFLiteWeights; conviene verificar la versión de runtime.
- El rendimiento medido corresponde a un único dispositivo (Galaxy S26); no hay datos para otras plataformas.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/LFM3-1.7B-Base-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Variante post-entrenada: https://huggingface.co/LiquidAI/LFM3-1.7B
- Conversión on-device de la variante post-entrenada: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT
- Licencia: https://huggingface.co/litert-community/LFM3-1.7B-Base-LiteRT/blob/main/LICENSE
