# axteam/gemma-4-E4B-it-AWQ-4bit

## Resumen

`axteam/gemma-4-E4B-it-AWQ-4bit` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario axteam. El modelo base, desarrollado por Google, es un transformer denso de la familia Gemma 4 con capacidades de imagen-texto-a-texto (image-text-to-text), es decir, acepta entradas de texto e imagen y genera texto. La cuantización emplea AWQ (activation-aware weight quantization) en esquema W4A16, con pesos INT4 asimétricos y activaciones en BF16, y está empaquetada en formato `compressed-tensors` para su uso con vLLM.

El interés de esta ficha radica en que ofrece una vía práctica para servir el modelo Gemma 4 E4B en infraestructura con menos memoria de la que requeriría el original en BF16, manteniendo un nivel de fidelidad medido respecto al modelo de referencia. El autor documenta explícitamente los benchmarks y las métricas de fidelidad, así como una revisión del 1 de noviembre de 2026 que corrigió un problema de calibración en la primera subida.

El repositorio tiene 97 descargas y 1 like en el momento de la consulta, con un tamaño de 20,7 GB y 7.941.100.874 parámetros totales según los safetensors. La licencia declarada es Apache-2.0, con enlace a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (base: google/gemma-4-E4B-it) |
| Parametros totales | 7.941.100.874 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | AWQ INT4 W4A16: pesos INT4 asimétricos, grupo de tamaño 32 (escala BF16 + zero-point INT4), activaciones BF16, formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors, compressed-tensors `pack-quantized`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con torre de visión y torre de audio según se deduce de la descripción de la cuantización (el autor indica que la torre de visión, la torre de audio, las proyecciones visión/audio, los embeddings de tokens, la tabla de embeddings por capa `embed_tokens_per_layer` y todas las normas se mantienen en BF16). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada.

La cuantización es un proceso de post-entrenamiento (PTQ) con AWQ, sin reentrenamiento. El autor aplica suavizado AWQ a las entradas de atención (q/k/v; q solo en las capas con KV compartida), a las entradas del MLP (gate/up) y a la entrada de la proyección down, con 128 muestras de calibración. La revisión del 1 de noviembre de 2026 corrigió un fallo por el cual la primera subida no había aplicado realmente el suavizado AWQ y era efectivamente round-to-nearest (RTN). El tokenizador, `chat_template`, `processor_config` y `generation_config` son idénticos byte a byte al original, incluyendo la corrección de la plantilla de chat de julio de 2026.

## Capacidades

- Generación de texto conversacional (pipeline `image-text-to-text`, etiqueta `conversational`).
- Procesamiento de entradas de imagen junto con texto, según el pipeline declarado y la presencia de torre de visión.
- Procesamiento de audio, según la mención de torre de audio en la descripción de la cuantización.
- Razonamiento y matemáticas, evidenciado por los benchmarks GSM8K y MMLU reportados.
- Capacidades multilingües, con benchmarks en inglés (MMLU, GSM8K, ARC-Challenge, Winogrande) y coreano (KMMLU, HAE-RAE).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la calibración excluyó respuestas en modo thinking, pero no se detalla si el modelo base lo soporta.

## Casos de uso

- Servicio de inferencia multimodal en producción con vLLM: el modelo está empaquetado en `compressed-tensors` y probado con vLLM 0.32.0, lo que permite desplegarlo como endpoint compatible con la API de OpenAI para tareas de imagen-texto-a-texto con menor huella de memoria que el BF16 original.
- Atención al cliente con entradas visuales: al aceptar imágenes y texto, puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas, facturas o documentos escaneados, manteniendo el contexto conversacional.
- Análisis de documentos y OCR asistido: la torre de visión en BF16 permite extraer información de imágenes y combinarla con generación de texto para resúmenes o extracción de campos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de fidelidad (perplejidad y acuerdo top-1) frente al BF16, lo que lo hace útil como referencia para estudiar el impacto de AWQ INT4 en modelos multimodales.
- Razonamiento matemático en inglés y coreano: los resultados en GSM8K (81,73 con 5-shot estricto) y KMMLU (51,31) lo sitúan como candidato para asistentes de resolución de problemas en esos idiomas.
- Despliegue en entornos con restricciones de VRAM: con ~10,4 GB en disco y pesos INT4, puede servirse en GPUs de gama alta de consumo o en instancias cloud más pequeñas que las necesarias para el BF16, siempre que se cumplan los requisitos de vLLM ≥ 0.19.0.
- Investigación sobre cuantización PTQ: la documentación detallada del proceso AWQ, la calibración y las comparativas con FP8, NVFP4 y AWQ-8bit sirven como material de estudio para pipelines de compresión de modelos.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 62,16 | 63,20 (101,7%) | 62,40 (100,4%) | 64,48 (103,7%) | 62,14 (100,0%) | 64,16 (103,2%) |
| GSM8K (5-shot, strict) | 84,31 | 84,00 (99,6%) | 84,08 (99,7%) | 82,71 (98,1%) | 79,83 (94,7%) | 81,73 (96,9%) |
| ARC-Challenge (0-shot) | 56,91 | 57,34 (100,7%) | 56,66 (99,6%) | 56,66 (99,6%) | 55,20 (97,0%) | 55,97 (98,4%) |
| Winogrande (5-shot) | 66,30 | 65,75 (99,2%) | 66,85 (100,8%) | 65,51 (98,8%) | 66,46 (100,2%) | 65,43 (98,7%) |
| KMMLU (5-shot, direct) | 51,46 | 51,24 (99,6%) | 51,46 (100,0%) | 50,15 (97,5%) | 49,11 (95,4%) | 51,31 (99,7%) |
| HAE-RAE (0-shot) | 69,84 | 69,02 (98,8%) | 69,57 (99,6%) | 69,48 (99,5%) | 68,10 (97,5%) | 68,10 (97,5%) |
| **Promedio** | **65,16** | **65,09 (99,9%)** | **65,17 (100,0%)** | **64,83 (99,5%)** | **63,47 (97,4%)** | **64,45 (98,9%)** |

Métricas de fidelidad frente al BF16 original en un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,3748 | 1,3032 (+5,5%) |
| Acuerdo top-1 en siguiente token | 91,8% | 99,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica ~10,4 GB en disco para los pesos cuantizados; la VRAM necesaria en ejecución será superior por el contexto, las activaciones BF16 y las torres de visión/audio en BF16, pero no se proporciona una cifra exacta en la información disponible.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. El runtime probado es vLLM 0.32.0 sobre la arquitectura Gemma 4 (soportada desde vLLM ≥ 0.19.0).
- ¿Cabe en GPU de consumo? No se confirma en la información proporcionada; el tamaño de pesos (~10,4 GB) sugiere que podría caber en GPUs con 16 GB o más de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: vLLM (probado con 0.32.0), transformers (librería declarada), formato compressed-tensors. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada incluye comparativas del propio autor frente a otras cuantizaciones del mismo modelo base, que se recogen aquí como alternativas de la misma categoría (cuantizaciones de Gemma 4 E4B).

| Modelo | Método | Tamaño | Licencia | Promedio benchmarks |
|---|---|---|---|---|
| gemma-4-E4B-it (BF16) | Sin cuantizar | No disponible | Apache-2.0 / Gemma 4 | 65,16 |
| gemma-4-E4B-it FP8-dynamic | FP8 dinámico | No disponible | Apache-2.0 / Gemma 4 | 65,09 (99,9%) |
| gemma-4-E4B-it AWQ-8bit | AWQ 8 bits | No disponible | Apache-2.0 / Gemma 4 | 65,17 (100,0%) |
| gemma-4-E4B-it NVFP4A16 | NVFP4 | No disponible | Apache-2.0 / Gemma 4 | 64,83 (99,5%) |
| gemma-4-E4B-it NVFP4 | NVFP4 | No disponible | Apache-2.0 / Gemma 4 | 63,47 (97,4%) |
| **Este modelo (AWQ-4bit)** | AWQ INT4 W4A16 | ~10,4 GB | Apache-2.0 / Gemma 4 | 64,45 (98,9%) |

No se dispone de comparación con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Es una cuantización PTQ: no hay reentrenamiento, por lo que la fidelidad al BF16 no es total (perplejidad +5,5%, acuerdo top-1 del 91,8%).
- La primera subida del repositorio (revisión `90f7dc6`, anterior al 2026-11-01 09:01:31 UTC) no aplicó realmente el suavizado AWQ y era efectivamente RTN; si se descargó antes de esa fecha, debe descargarse de nuevo.
- La calibración usó 128 muestras con predominio de coreano y sin respuestas en modo thinking, lo que puede sesgar la fidelidad hacia ese idioma y ese tipo de respuestas.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es un riesgo inherente a los modelos generativos.
- Idiomas soportados: no se declara una lista oficial; los benchmarks cubren inglés y coreano.
- Longitud de contexto: no disponible; conviene consultar la model card del modelo base para planificar despliegues con contextos largos.
- Restricciones de licencia: aunque la etiqueta es Apache-2.0, el enlace apunta a la licencia específica de Gemma 4 de Google, que puede imponer condiciones adicionales al uso comercial; debe revisarse antes de producción.
- El modelo requiere vLLM ≥ 0.19.0 (probado con 0.32.0); versiones anteriores no soportan la arquitectura Gemma 4.
- El tamaño del repo (20,7 GB) es mayor que el tamaño en disco de los pesos (~10,4 GB), probablemente por artefactos adicionales; conviene verificar el contenido antes de descargar.

## Enlaces

- HuggingFace: https://huggingface.co/axteam/gemma-4-E4B-it-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
