# axteam/Qwen3.5-4B-NVFP4

## Resumen

Qwen3.5-4B-NVFP4 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario axteam. El modelo base es un transformer híbrido (atención lineal y atención completa) de tipo denso, con torre de visión y cabeza de predicción multi-token (MTP), desarrollado por el equipo Qwen. Esta versión aplica cuantización post-entrenamiento (PTQ) en formato NVFP4 (W4A4, FP4 E2M1), pensada específicamente para servir el modelo con vLLM sobre GPUs Blackwell.

El interés de esta ficha radica en que reduce el peso en disco a unos 5,6 GB y permite aceleración completa FP4 en hardware sm100/sm103/sm120 (B200, GB200, B300, RTX 50xx, RTX PRO 6000), manteniendo una fidelidad media del 99,9 % respecto al original BF16 en la batería de benchmarks publicada. La cuantización deja en BF16 aproximadamente el 45 % de los parámetros: torre visual, proyector, cabeza MTP, embeddings, LM head, todas las RMSNorm y toda la ruta de atención lineal (GatedDeltaNet/SSM).

La licencia es Apache-2.0, heredada del modelo base. El checkpoint se distribuye en formato compressed-tensors `nvfp4-pack-quantized` y requiere vLLM ≥ 0.17.0 (probado con 0.32.0) o transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantización | NVFP4 (W4A4, FP4 E2M1); pesos en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones FP4; componentes críticos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención lineal (GatedDeltaNet/SSM) con capas de atención completa, e incorpora una torre de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP). Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento con AWQ sobre un conjunto de calibración de 256 muestras (corpus mixto con predominio de coreano), que protege canales salientes antes del redondeo. Los pesos y activaciones se almacenan en FP4, mientras que la torre visual, el proyector, la cabeza MTP, las RMSNorm, los embeddings, el LM head y toda la ruta `linear_attn.*` permanecen en BF16 por ser demasiado sensibles a la precisión FP4. `linear_attn.A_log` y la norma con compuerta se guardan en BF16 de forma sin pérdida para `A_log`.

La revisión del 1 de noviembre de 2026 restauró de forma bit-exacta los pesos RMSNorm no suavizados del original, eliminando el ruido de redondeo BF16 (hasta un 0,4 % en la ganancia efectiva) que había introducido el manejo de offset-norm de llm-compressor. Los pesos cuantizados y las normas suavizadas por AWQ no cambiaron. El tokenizador, la `chat_template` y las configuraciones de preprocesado son idénticas al original; el `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Razonamiento matemático y resolución de problemas tipo GSM8K.
- Conocimiento multilingüe, con evaluación específica en coreano (KMMLU, HAE-RAE) además de inglés.
- Predicción multi-token mediante cabeza MTP, orientada a decodificación especulativa.
- Compatible con el servidor OpenAI de vLLM (`vllm serve`), lo que habilita integración en aplicaciones existentes.
- Soporte de tool calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades de audio o thinking mode explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal en GPUs Blackwell con vLLM: el formato NVFP4 aprovecha los kernels FP4 nativos de B200, GB200, B300, RTX 50xx y RTX PRO 6000, reduciendo el peso a 5,6 GB y liberando VRAM para caché KV y peticiones concurrentes.
- Asistente conversacional con imágenes: al mantener la torre visual y el proyector en BF16, el modelo conserva la calidad de percepción visual mientras el resto del cómputo se acelera en FP4.
- Procesamiento de documentos con contexto largo: el ejemplo oficial arranca con `--max-model-len 32768`, adecuado para resúmenes y extracción sobre documentos extensos servidos mediante la API compatible con OpenAI.
- Evaluación comparativa de técnicas de cuantización: el repositorio publica resultados de BF16, FP8-dynamic, AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo arnés (lm-evaluation-harness sobre vLLM), lo que permite reproducir y contrastar metodologías de PTQ.
- Razonamiento matemático en producción: con un 99,0 % de recuperación en GSM8K (73,31 frente a 74,07 del BF16), es viable para tutoría automática o verificación de cálculos donde el coste por token importa.
- Atención al cliente en coreano e inglés: los benchmarks KMMLU (99,6 % de recuperación) y HAE-RAE (95,7 %) indican que la cuantización degrada poco el rendimiento en coreano, lo que permite servir chatbots bilingües en hardware de una sola GPU.
- Inferencia en estaciones de trabajo con RTX 50xx: al caber en 5,6 GB de pesos más caché KV, el modelo puede ejecutarse en GPUs de consumo de la serie Blackwell con aceleración FP4 completa.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-likelihood. Porcentajes entre paréntesis: recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 55,18 | 57,99 (105,1 %) | 54,79 (99,3 %) | 60,58 (109,8 %) | 58,61 (106,2 %) | 60,89 (110,3 %) |
| GSM8K (5-shot, estricto) | 74,07 | 73,92 (99,8 %) | 73,84 (99,7 %) | 76,72 (103,6 %) | 73,31 (99,0 %) | 76,42 (103,2 %) |
| ARC-Challenge (0-shot) | 54,61 | 53,92 (98,8 %) | 54,52 (99,8 %) | 54,86 (100,5 %) | 53,92 (98,8 %) | 54,35 (99,5 %) |
| Winogrande (5-shot) | 68,75 | 67,96 (98,9 %) | 69,14 (100,6 %) | 68,90 (100,2 %) | 69,38 (100,9 %) | 68,90 (100,2 %) |
| KMMLU (5-shot, directo) | 50,47 | 50,13 (99,3 %) | 50,48 (100,0 %) | 51,49 (102,0 %) | 50,26 (99,6 %) | 49,02 (97,1 %) |
| HAE-RAE (0-shot) | 62,42 | 61,50 (98,5 %) | 62,05 (99,4 %) | 61,69 (98,8 %) | 59,76 (95,7 %) | 58,48 (93,7 %) |
| **Media** | **60,92** | **60,90 (100,0 %)** | **60,81 (99,8 %)** | **62,37 (102,4 %)** | **60,87 (99,9 %)** | **61,34 (100,7 %)** |

Fidelidad respecto al original BF16 en un conjunto interno mixto inglés/coreano de 100 prompts (respuestas greedy del BF16 puntuadas bajo cada build):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,7157 | 1,5703 (+9,3 %) |
| Acuerdo top-1 en siguiente token | 88,1 % | 99,2 % |

## Requisitos de hardware

- VRAM para pesos: 5,6 GB. Hay que sumar la caché KV (crece con la longitud de contexto y las peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- Aceleración FP4 completa: GPUs Blackwell sm100 (B200/GB200), sm103 (B300) y sm120 (RTX 50xx, RTX PRO 6000).
- GPUs Turing–Hopper (sm75–sm90): caen a FP4 solo de pesos, más lento, con aviso de vLLM.
- V100 (sm70): no soportado.
- Cabe en GPUs de consumo de la serie RTX 50xx gracias a los 5,6 GB de pesos.
- Despliegue recomendado: vLLM ≥ 0.17.0 (probado con 0.32.0), que requiere Python 3.11–3.14, torch 2.13 (build CUDA 13.0), transformers ≥ 5.16.1,<5.20 y compressed-tensors 0.17.0 (no actualizar por separado).
- Alternativa sin vLLM: transformers ≥ 5.2.0 con compressed-tensors ≥ 0.15.0.
- `trust_remote_code` no es necesario.
- Para pesos que no caben en una GPU: `--tensor-parallel-size N`.
- Latencia y throughput: no disponible en la información proporcionada (solo se ejecutó en B200 según la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media benchmarks | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-NVFP4 (este repo) | 4,54 B | no disponible | 60,87 (99,9 % vs BF16) | Apache-2.0 | compressed-tensors NVFP4 |
| Qwen3.5-4B (BF16 original) | 4,54 B | no disponible | 60,92 | Apache-2.0 | safetensors BF16 |
| Qwen3.5-4B AWQ-8bit | 4,54 B | no disponible | 60,81 (99,8 %) | Apache-2.0 | AWQ 8-bit |
| Qwen3.5-4B AWQ-4bit | 4,54 B | no disponible | 61,34 (100,7 %) | Apache-2.0 | AWQ 4-bit |

Las variantes comparadas proceden de la propia tabla de benchmarks del autor y comparten modelo base, por lo que la comparación aísla el efecto de la cuantización. No se dispone de datos de modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: perplejidad +9,3 % y acuerdo top-1 del 88,1 % frente al BF16, aunque la media de benchmarks se mantiene en el 99,9 %.
- HAE-RAE es el benchmark más afectado (95,7 % de recuperación), lo que sugiere mayor sensibilidad en tareas de conocimiento coreano.
- La calibración AWQ usó solo 256 muestras con predominio de coreano; el comportamiento en otros idiomas o dominios puede desviarse más de lo que reflejan los benchmarks publicados.
- El rendimiento FP4 completo depende de hardware Blackwell; en Turing–Hopper el modo es solo de pesos y más lento, y V100 no está soportado.
- Las versiones de dependencias están fijadas por vLLM (transformers <5.20, compressed-tensors 0.17.0); actualizarlas por separado puede romper la carga del checkpoint.
- El modelo original no incluye `generation_config.json` y esta versión tampoco, por lo que los parámetros de generación deben especificarse manualmente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; aplican los del modelo base Qwen3.5-4B.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card.
- Solo se ejecutó en B200 según la model card; el resto de GPUs Blackwell no está verificado empíricamente por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
