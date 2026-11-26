# axteam/GLM-OCR-FP8-dynamic

## Resumen

GLM-OCR-FP8-dynamic es una versión cuantizada en FP8 de `zai-org/GLM-OCR`, un modelo de visión-lenguaje (VLM) especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos. La cuantización la ha realizado el usuario axteam mediante quantización post-entrenamiento dinámica (W8A8) con el formato `compressed-tensors`, pensada específicamente para servirse con vLLM. El modelo base pertenece a la familia GLM del desarrollador zai-org (Zhipu AI).

El modelo emplea una arquitectura densa con un backbone de texto GLM, una torre de visión (vision encoder) y una cabeza de predicción multi-token (MTP). Cuenta con aproximadamente 1.325 millones de parámetros totales y ocupa unos 2,2 GB en disco gracias a la cuantización FP8. La ventana de contexto operativa recomendada en los ejemplos de uso es de 32.768 tokens (`--max-model-len 32768`).

Su relevancia actual radica en que permite desplegar un modelo OCR/VLM con requisitos de memoria reducidos, manteniendo una fidelidad alta respecto al original en BF16 (perplejidad solo un 0,9 % superior y 96,5 % de acuerdo top-1 en next-token). Está pensado para pipelines de extracción de texto, tablas y fórmulas, no como modelo de chat general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa: backbone de texto GLM + vision encoder + cabeza MTP (VLM de documentos/OCR) |
| Parametros totales | 1.325.258.240 (~1,33 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 dinámica W8A8 (pesos FP8 E4M3 por canal, activaciones FP8 por token dinámicas); vision tower, MTP, embeddings, LM head y RMSNorms en BF16 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; la evaluación interna usa un conjunto mixto EN/KO) |
| Licencia | MIT |
| Formato de pesos | Safetensors con `compressed-tensors` (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) sin recalibración (data-free) del checkpoint `zai-org/GLM-OCR`. La arquitectura es densa e integra tres componentes: un backbone de texto de la familia GLM, una torre de visión para procesar imágenes y una cabeza de predicción multi-token (MTP). Solo se cuantizan las proyecciones de atención y MLP del backbone de lenguaje; el resto de componentes —torre de visión (`model.visual.*`), capa MTP, embeddings de tokens, LM head y todas las RMSNorms— se mantiene en BF16, lo que supone aproximadamente el 63 % de los parámetros de esta build. De este modo, la ruta de OCR/visión queda intacta respecto al original.

La cuantización emplea el esquema `FP8_DYNAMIC` de `compressed-tensors`: pesos FP8 E4M3 por canal y activaciones FP8 dinámicas por token. No hubo reentrenamiento ni ajuste fino; el tokenizador, la `chat_template` y el procesador son idénticos a los del modelo original. Una revisión del 2 de noviembre de 2026 corrigió el patrón de exclusión de la torre de visión en `config.json` (antes `re:model\.visual\..*`, que no coincidía con los nombres usados por vLLM), lo que provocaba respuestas erróneas con entrada de imagen en vLLM 0.32; los pesos no cambiaron.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Extracción de texto estructurado, incluyendo tablas, fórmulas y análisis de maquetación (layout), según los prompts específicos documentados en la model card original.
- Comprensión de documentos mediante entrada image-text-to-text (pipeline `image-text-to-text`).
- Modo de razonamiento (thinking mode) activado por defecto en la `chat_template`, desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Servicio mediante API compatible con OpenAI a través de vLLM.
- Capacidades multilingües: no declaradas explícitamente; la evaluación interna usa un conjunto mixto inglés/coreano.
- No está diseñado para chat solo de texto: en la comprobación de los autores, ante una pregunta textual sin imagen el modelo repitió la pregunta en lugar de responder.

## Casos de uso

- Digitalización de documentos escaneados: el modelo transcribe el texto de imágenes de páginas completas, adecuado para pipelines de archivo y gestión documental gracias a su ventana de 32.768 tokens.
- Extracción de tablas de informes y facturas: con los prompts específicos de tablas del modelo original, permite convertir tablas en imágenes a texto estructurado para su posterior parseo.
- Reconocimiento de fórmulas matemáticas: útil en entornos académicos o de edición técnica para convertir fórmulas en imagen a notación textual.
- Análisis de maquetación (layout): permite localizar y ordenar bloques de contenido en documentos complejos, como periódicos o formularios.
- Procesamiento por lotes en servidor: al ocupar solo 2,2 GB de pesos, se puede servir con vLLM en GPUs modestas (T4 o superiores) y atender múltiples peticiones concurrentes añadiendo KV cache.
- Integración en pipelines de automatización documental: mediante la API compatible con OpenAI de vLLM, se puede conectar a flujos de ingestión de documentos, ERPs o sistemas de gestión de contenidos.
- Despliegue con memoria reducida: la cuantización FP8 y la opción `--kv-cache-dtype fp8` permiten servir contextos largos o lotes grandes en GPUs con VRAM limitada.

## Benchmarks y rendimiento

Fidelidad medida por los autores frente al original en BF16 sobre un conjunto interno mixto EN/KO (100 prompts, puntuación de next-token en texto):

| Metrica | Este modelo (FP8) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3726 | 1,3599 (+0,9 %) |
| Acuerdo top-1 en next-token | 96,5 % | 99,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para pesos: 2,2 GB. Hay que añadir la KV cache (crece con la longitud de contexto y las peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPU compatibles: NVIDIA Turing (sm75, p. ej. T4) o superior. El cálculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportada.
- Cabe en GPU de consumo: no se especifica una lista concreta, pero al requerir sm75 o superior y solo 2,2 GB de pesos, es viable en GPUs de consumo compatibles con esa arquitectura; los autores solo probaron en B200.
- Despliegue: vLLM ≥ 0.16.0 (probado con vLLM 0.32.0), que requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0. También es posible usar transformers ≥5.1.0 + compressed-tensors ≥0.15.0 (ruta de texto comprobada; entrada de imagen no probada).
- Paralelismo: usar `--tensor-parallel-size N` si los pesos no caben en una GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-OCR-FP8-dynamic (este) | ~1,33 mil millones | 32.768 tokens (uso documentado) | FP8 W8A8 dinámica | MIT | Safetensors (compressed-tensors) |
| zai-org/GLM-OCR (base) | ~1,33 mil millones (misma arquitectura) | No disponible | BF16 (original) | MIT | Safetensors |
| Alternativas OCR/VLM de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos OCR en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en OCR: no es un modelo de chat general; el chat solo de texto no es su propósito y puede dar respuestas degeneradas (los autores observaron que repetía la pregunta).
- La cuantización introduce una degradación medible: +0,9 % de perplejidad y 96,5 % de acuerdo top-1 frente al 99,4 % del BF16.
- La revisión de `config.json` del 2 de noviembre de 2026 es crítica: si se descargó el repositorio antes del 1 de noviembre de 2026 a las 23:41:41 UTC (revisión `3d09e56`), hay que volver a descargar `config.json` para que la entrada de imagen funcione correctamente en vLLM 0.32.
- La ruta de imagen solo se ha validado con vLLM 0.32.0; con transformers la ruta de texto está comprobada pero la de imagen no.
- No se declaran sesgos conocidos ni lista de idiomas soportados; la evaluación interna se limita a un conjunto mixto EN/KO de 100 prompts.
- Riesgo de alucinación: no documentado en la información disponible, aunque es inherente a los modelos generativos; conviene validar la salida en producción.
- Licencia MIT: permite uso comercial, pero los pesos y el procesador originales pertenecen a los autores upstream (zai-org).
- Dependencias muy específicas (torch 2.13, compressed-tensors 0.17.0 fijado por vLLM): no actualizar compressed-tensors por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/GLM-OCR-FP8-dynamic
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
