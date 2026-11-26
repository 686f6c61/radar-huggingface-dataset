# axteam/Qwen3.5-27B-FP8-dynamic

## Resumen

Qwen3.5-27B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-27B, publicada por el usuario axteam. El modelo original lo desarrolla el equipo Qwen (Alibaba), y esta variante resuelve un problema muy concreto: servir el modelo de 27.781 millones de parámetros en vLLM con pesos FP8, reduciendo el espacio en disco a unos 31,2 GB y manteniendo una fidelidad prácticamente idéntica al original en BF16 (perplejidad un 0,4 % superior y 97,2 % de acuerdo top-1 en el siguiente token).

La arquitectura es híbrida: combina capas de atención lineal con capas de atención completa, es densa (no MoE), multimodal con torre de visión y añade una cabeza MTP (multi-token prediction). Se distribuye en formato compressed-tensors con esquema FP8_DYNAMIC (W8A8), lo que permite activaciones FP8 dinámicas por token sin calibración. La licencia es Apache-2.0, heredada del modelo base.

Es relevante ahora porque ofrece una vía de despliegue en producción de un modelo multimodal de casi 28 000 millones de parámetros con pérdida de calidad casi nula, y porque su model card documenta con transparencia un fallo de configuración corregido en la revisión del 2 de noviembre de 2026 que afectaba a la torre de visión en vLLM 0.32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico W8A8 (E4M3, escala por canal de salida, activaciones FP8 dinámicas por token); componentes clave en BF16 y FP32 |
| Idiomas soportados | no disponible (la evaluación interna usa un conjunto mixto inglés/coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida que alterna capas de atención lineal (con componentes tipo SSM: `linear_attn.conv1d`, `dt_bias`, `A_log` y una norma con compuerta) y capas de atención completa, lo que reduce el coste computacional en contextos largos manteniendo capacidad de atención global. Es un modelo denso de 27 781 millones de parámetros con torre de visión y proyector multimodal, más una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Esta variante concreta es una cuantización post-entrenamiento (PTQ) sin reentrenamiento ni calibración: las escalas estáticas de pesos se calculan sin datos. Los pesos se almacenan en FP8 E4M3 con escala por canal de salida y las activaciones se cuantizan dinámicamente por token. Se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm excepto la norma con compuerta de atención lineal, los embeddings de tokens, la LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d`, `dt_bias`); `linear_attn.A_log` y la norma con compuerta permanecen en FP32 como en el original. En total, cerca del 12 % de los parámetros quedan sin cuantizar para preservar calidad. El tokenizador, la `chat_template` y la `generation_config` son idénticos al modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica al modelo base.
- Comprensión de imágenes (pipeline `image-text-to-text`): descripción de contenido visual, respuesta a preguntas sobre imágenes y razonamiento conjunto imagen-texto.
- Razonamiento y matemáticas: evaluado en MMLU, GSM8K y ARC-Challenge con resultados equivalentes al BF16 original.
- Capacidades multilingües parcialmente evidenciadas: KMMLU (coreano) y HAE-RAE (coreano) se mantienen al 100 % de recuperación respecto al original.
- Decodificación multi-token mediante la cabeza MTP, conservada en BF16.
- Tool calling y function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el modelo está empaquetado específicamente para vLLM (≥ 0.17.0, probado con 0.32.0) y su esquema FP8_DYNAMIC permite activaciones dinámicas sin calibración, lo que simplifica el despliegue en clústeres con GPU Hopper o Blackwell.
- Asistentes que combinan imagen y texto: clasificación y descripción de capturas, extracción de información de documentos escaneados o gráficos, aprovechando la torre de visión conservada en BF16 para evitar degradación.
- Atención al cliente con contexto conversacional: la plantilla de chat original y el formato conversacional permiten integrarlo en sistemas de diálogo multi-turno; la longitud de contexto debe consultarse en el modelo base, ya que no se publica en esta ficha.
- Procesamiento de documentos en coreano e inglés: los resultados en KMMLU y HAE-RAE (100,1 % y 100,5 % de recuperación) respaldan su uso en flujos de trabajo bilingües en esos idiomas.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye mediciones propias frente a AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit con el mismo arnés (lm-evaluation-harness sobre vLLM), útil como referencia para elegir formato de despliegue.
- Reducción de huella de almacenamiento y memoria: con ~31,2 GB en disco frente al BF16 original, facilita el alojamiento en nodos con VRAM limitada y el despliegue de múltiples réplicas por servidor.
- Generación de código y razonamiento matemático en pipelines internos: aunque no hay benchmarks de HumanEval ni MBPP en la información disponible, la paridad con BF16 en MMLU y GSM8K sugiere que puede sustituir al original en tareas de razonamiento sin pérdida apreciable.

## Benchmarks y rendimiento

Mediciones del autor con lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no comparable con puntuaciones por log-verosimilitud.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 86,02 | 86,01 (100,0 %) | 86,05 (100,0 %) | 86,07 (100,1 %) | 86,01 (100,0 %) | 86,08 (100,1 %) |
| GSM8K (5-shot, strict) | 37,00 | 38,06 (102,9 %) | 34,80 (94,1 %) | 81,43 (220,1 %) | 71,27 (192,6 %) | 82,87 (224,0 %) |
| ARC-Challenge (0-shot) | 61,18 | 61,69 (100,8 %) | 61,60 (100,7 %) | 60,84 (99,4 %) | 60,58 (99,0 %) | 60,84 (99,4 %) |
| Winogrande (5-shot) | 80,43 | 80,03 (99,5 %) | 80,58 (100,2 %) | 79,64 (99,0 %) | 79,48 (98,8 %) | 80,11 (99,6 %) |
| KMMLU (5-shot, direct) | 69,79 | 69,83 (100,1 %) | 69,84 (100,1 %) | 69,61 (99,7 %) | 69,19 (99,1 %) | 68,98 (98,8 %) |
| HAE-RAE (0-shot) | 76,99 | 77,36 (100,5 %) | 77,64 (100,8 %) | 75,89 (98,6 %) | 75,71 (98,3 %) | 76,44 (99,3 %) |
| Media | 68,57 | 68,83 (100,4 %) | 68,42 (99,8 %) | 75,58 (110,2 %) | 73,71 (107,5 %) | 75,89 (110,7 %) |
| Media sin GSM8K | 74,88 | 74,98 (100,1 %) | 75,14 (100,4 %) | 74,41 (99,4 %) | 74,19 (99,1 %) | 74,49 (99,5 %) |

El autor advierte que GSM8K se puntúa sobre texto generado con coincidencia estricta y que la puntuación oscila mucho entre builds del mismo modelo (34,8–82,9), con tres builds cuantizados muy por encima del original BF16; la causa no se investigó porque no se guardaron las salidas por pregunta. Por eso se ofrece la media sin GSM8K.

Fidelidad al original en un conjunto interno mixto inglés/coreano (100 prompts, respuestas greedy del BF16 puntuadas bajo cada build):

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3662 | 1,3603 (+0,4 %) |
| Acuerdo top-1 en el siguiente token | 97,2 % | 99,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada de forma explícita; el repositorio ocupa ~31,2 GB en disco, por lo que se requiere al menos esa cifra más el espacio de caché KV y activaciones. Para una estimación fiable debe calcularse según la longitud de contexto del modelo base.
- GPU recomendadas: el autor indica que el entorno probado usa torch 2.13 con build CUDA 13.0, lo que apunta a GPU con soporte FP8 nativo (familia Hopper como H100/H200 y Blackwell). No se especifican modelos concretos en la información disponible.
- GPU de consumo: no confirmado. Un modelo de ~28 000 millones de parámetros en FP8 no cabe en GPU de consumo de 24 GB sin cuantización adicional; no se documenta soporte en RTX 4090 ni similares.
- Opciones de despliegue: vLLM (runtime objetivo; la arquitectura está en vLLM ≥ 0.17.0 y se probó con 0.32.0). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con las cuantizaciones alternativas del mismo modelo base, según las mediciones del autor:

| Modelo | Parámetros | Contexto | MMLU (5-shot gen.) | GSM8K (5-shot strict) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-27B-FP8-dynamic (este) | 27,78 B | no disponible | 86,01 | 38,06 | Apache-2.0 | Hugging Face |
| Qwen3.5-27B AWQ-8bit | 27,78 B (aprox.) | no disponible | 86,05 | 34,80 | Apache-2.0 (heredada) | Hugging Face |
| Qwen3.5-27B NVFP4A16 | 27,78 B (aprox.) | no disponible | 86,07 | 81,43 | Apache-2.0 (heredada) | Hugging Face |
| Qwen3.5-27B AWQ-4bit | 27,78 B (aprox.) | no disponible | 86,08 | 82,87 | Apache-2.0 (heredada) | Hugging Face |

No se dispone de datos para comparar con modelos de otras familias del mismo tamaño.

## Limitaciones y advertencias

- Corrección de configuración crítica: las descargas anteriores al 1 de noviembre de 2026 a las 23:17:40 UTC (revisión `3c657c1`) deben volver a descargar `config.json`. El patrón anterior `re:model\.visual\..*` no coincidía con los nombres que usa vLLM (`visual.*`), de modo que vLLM 0.32 construía las capas de visión en FP8 y cargaba pesos BF16 en ellas, produciendo respuestas incorrectas con imágenes. La entrada de texto no se veía afectada.
- La cuantización es PTQ sin calibración; aunque la fidelidad medida es alta (perplejidad +0,4 %), no se han publicado evaluaciones exhaustivas de calidad en tareas generativas abiertas.
- La anomalía no explicada en GSM8K entre builds (34,8–82,9) impide extraer conclusiones fiables sobre razonamiento matemático a partir de esa métrica.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas: la model card no enumera idiomas soportados; la evidencia empírica se limita a inglés y coreano.
- Longitud de contexto: no disponible en esta ficha; debe consultarse en el modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base enlazado por el autor.
- Dependencia estricta de vLLM: el formato compressed-tensors FP8_DYNAMIC y la arquitectura híbrida exigen versiones recientes de vLLM; otros runtimes no están soportados según la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
