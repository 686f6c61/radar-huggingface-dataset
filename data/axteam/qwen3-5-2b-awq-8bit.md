# axteam/Qwen3.5-2B-AWQ-8bit

## Resumen

Qwen3.5-2B-AWQ-8bit es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario axteam. Se trata de un checkpoint de post-entrenamiento (PTQ) pensado específicamente para servir el modelo con vLLM de forma eficiente en memoria, manteniendo una fidelidad alta respecto al original en BF16. El modelo base es un transformer denso de 2.213.241.664 parámetros con arquitectura híbrida (atención lineal combinada con atención completa), torre de visión y una cabeza de predicción multi-token (MTP), lo que lo convierte en un modelo image-text-to-text de tamaño compacto.

La relevancia de esta publicación es práctica: reduce el peso en disco a unos 3,3 GB (frente a los 6,4 GB del repositorio completo) mediante cuantización AWQ INT8 con pesos simétricos, grupo de tamaño 32 y activaciones en BF16 (esquema W8A16), almacenado en formato compressed-tensors `pack-quantized`. Según las mediciones del autor, la cuantización recupera de media el 99,2 % del rendimiento del modelo BF16 original en un conjunto de benchmarks estándar, con una perplejidad prácticamente idéntica (1,8505 frente a 1,8515).

Está publicado bajo licencia Apache-2.0, igual que el modelo base, y no requiere `trust_remote_code`. Su orientación declarada es el despliegue en vLLM (probado con vLLM 0.32.0), lo que lo hace adecuado para entornos de inferencia con GPUs NVIDIA Turing (sm75) o superiores, incluyendo GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal + atención completa), multimodal con torre de visión y cabeza MTP |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantización | AWQ INT8 (W8A16): pesos INT8 simétricos, grupo 32, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibración usó un corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, dentro de un transformer denso de aproximadamente 2,2 mil millones de parámetros. Incorpora además una torre de visión y proyector para entrada de imágenes, y una cabeza de predicción multi-token (MTP). Esta build cuantizada conserva en BF16 aproximadamente el 38 % de los parámetros: la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`), con el objetivo de preservar la calidad.

La cuantización es de tipo post-training quantization (PTQ), sin reentrenamiento. AWQ utiliza un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano) y sin gradientes para proteger los canales de pesos más relevantes antes del redondeo. El tokenizador, la `chat_template` y la `generation_config` son idénticos a los del modelo original; el `config.json` es el original más un bloque `quantization_config`. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con la API de OpenAI a través de vLLM.
- Procesamiento de imágenes y texto (pipeline image-text-to-text): acepta entradas de imagen por URL o data URI junto con prompts de texto.
- Modo de razonamiento (thinking mode) desactivable: está apagado por defecto en la plantilla de chat y se activa con `chat_template_kwargs={"enable_thinking": True}`.
- Predicción multi-token (cabeza MTP) integrada en la arquitectura.
- Capacidades multilingües: no se detalla la lista de idiomas soportados en la información disponible; la calibración sugiere un uso relevante de coreano e inglés.
- Servido en vLLM con soporte de `--tensor-parallel-size` para repartir pesos entre varias GPUs.
- Posibilidad de servir solo texto desactivando el codificador de visión con `--limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en producción: el modelo acepta imágenes por URL o data URI y genera descripciones o respuestas sobre ellas, con la ventaja de un peso de solo 3,3 GB que permite desplegarlo en una única GPU de consumo.
- Asistentes conversacionales de bajo coste: la plantilla de chat y el servidor compatible con la API de OpenAI de vLLM permiten montar un endpoint `/v1/chat/completions` con historial multi-turno sin infraestructura dedicada.
- Clasificación y extracción de información de documentos escaneados: combinando entrada de imagen y texto se pueden extraer campos estructurados de facturas, formularios o capturas, siempre que la tarea no requiera contextos superiores a los soportados.
- Prototipado rápido de aplicaciones multimodales: el tamaño reducido y la licencia Apache-2.0 facilitan iterar en local con una sola GPU antes de escalar a modelos mayores.
- Servicio de inferencia con requisitos estrictos de memoria: al necesitar solo 3,3 GB de pesos más la caché KV, encaja en entornos con GPUs de 16 GB o menos compartidas entre varios procesos.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye mediciones frente a FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit con el mismo harness, lo que lo convierte en una referencia útil para estudiar el impacto de la cuantización INT8 en modelos multimodales pequeños.
- Despliegue en modo solo texto: desactivando el codificador de visión se libera su presupuesto de memoria y el modelo queda como un LLM de 2B parámetros para tareas de generación y razonamiento básico.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy y evaluación few-shot de completación (sin plantilla de chat). Los porcentajes entre paréntesis indican la recuperación respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 53,33 | 48,18 (90,3 %) | 53,54 (100,4 %) | 54,27 (101,8 %) | 55,22 (103,5 %) | 60,38 (113,2 %) |
| GSM8K (5-shot, strict) | 58,23 | 56,63 (97,3 %) | 56,56 (97,1 %) | 54,51 (93,6 %) | 51,71 (88,8 %) | 54,06 (92,8 %) |
| ARC-Challenge (0-shot) | 41,47 | 41,98 (101,2 %) | 41,30 (99,6 %) | 41,04 (99,0 %) | 39,51 (95,3 %) | 39,59 (95,5 %) |
| Winogrande (5-shot) | 64,56 | 63,22 (97,9 %) | 64,48 (99,9 %) | 64,48 (99,9 %) | 61,09 (94,6 %) | 62,51 (96,8 %) |
| KMMLU (5-shot, direct) | 43,29 | 42,58 (98,4 %) | 43,20 (99,8 %) | 42,01 (97,1 %) | 41,14 (95,0 %) | 42,10 (97,3 %) |
| HAE-RAE (0-shot) | 45,65 | 45,00 (98,6 %) | 45,10 (98,8 %) | 44,91 (98,4 %) | 42,07 (92,2 %) | 41,06 (90,0 %) |
| **Media** | **51,09** | **49,60 (97,1 %)** | **50,70 (99,2 %)** | **50,21 (98,3 %)** | **48,46 (94,8 %)** | **49,95 (97,8 %)** |

Además, el autor publica una evaluación de fidelidad frente al original en BF16 sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | Original BF16 |
|---|---|---|
| Perplejidad (menor es más cercano) | 1,8505 | 1,8515 (-0,1 %) |
| Acuerdo top-1 en el siguiente token | 98,5 % | 98,9 % |

Estas métricas miden fidelidad respecto al modelo base, no puntuaciones absolutas de tarea.

## Requisitos de hardware

- VRAM estimada para pesos: 3,3 GB en INT8. Hay que sumar la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPUs compatibles: NVIDIA Turing (sm75) o superior. No es compatible con V100 (sm70). El autor solo probó sobre una B200; la selección de kernel la realiza el código de vLLM 0.32.
- GPU de consumo: por el tamaño de pesos, cabe en GPUs de 16 GB o incluso menos, siempre que se ajuste `--max-model-len` para limitar la caché KV.
- Multi-GPU: se puede repartir con `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU.
- Runtime recomendado: vLLM (arquitectura incluida desde vLLM ≥ 0.17.0; probado con 0.32.0). Requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Alternativa sin vLLM: transformers ≥5.2.0 con compressed-tensors ≥0.15.0.
- Latencia y throughput: no disponible en la información proporcionada.
- Para servir solo texto: añadir `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para no cargar el codificador de visión.

## Comparativa con modelos similares

La información proporcionada solo permite comparar frente a otras cuantizaciones del mismo modelo base, no frente a modelos de otros desarrolladores.

| Modelo | Parámetros | Contexto | Media de benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B BF16 (original) | 2,21 B | no disponible | 51,09 | Apache-2.0 | safetensors |
| **axteam/Qwen3.5-2B-AWQ-8bit** | 2,21 B | no disponible | 50,70 (99,2 %) | Apache-2.0 | compressed-tensors (INT8) |
| Qwen3.5-2B FP8-dynamic | 2,21 B | no disponible | 49,60 (97,1 %) | Apache-2.0 | FP8 |
| Qwen3.5-2B NVFP4 / AWQ-4bit | 2,21 B | no disponible | 48,46 / 49,95 | Apache-2.0 | NVFP4 / INT4 |

Comparativa con modelos de otros desarrolladores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización PTQ sin reentrenamiento: puede haber degradación en tareas no cubiertas por los benchmarks publicados, especialmente en generación larga o dominios especializados.
- El conjunto de calibración (256 muestras, con predominio de coreano) puede introducir un sesgo de calibración hacia ese idioma y hacia el inglés; el rendimiento en otros idiomas no está medido.
- Riesgo de alucinación inherente a un modelo de 2B parámetros: no es adecuado para tareas que exijan alta precisión factual sin verificación externa.
- La lista de idiomas soportados no está documentada en la información disponible.
- La longitud máxima de contexto no se declara explícitamente; el ejemplo de despliegue usa 32 768 tokens, pero no se confirma como máximo del modelo.
- El modo de razonamiento (thinking) está desactivado por defecto; hay que activarlo explícitamente para tareas que lo requieran.
- Requiere versiones muy concretas de dependencias (torch 2.13 con CUDA 13.0, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0); actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- No es compatible con GPUs V100 (sm70).
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar los términos del modelo base Qwen/Qwen3.5-2B antes de desplegar en producción.
- El repositorio tiene un volumen de descargas muy bajo (25) y ningún «like», por lo que la validación comunitaria es escasa; las métricas provienen únicamente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: no disponible en la información proporcionada (runtime requerido, sin enlace explícito)
- compressed-tensors: no disponible en la información proporcionada (formato de pesos, sin enlace explícito)
