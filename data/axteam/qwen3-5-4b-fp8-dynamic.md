# axteam/Qwen3.5-4B-FP8-dynamic

## Resumen

Qwen3.5-4B-FP8-dynamic es una cuantización de 8 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario axteam. El modelo original lo desarrolla el equipo Qwen (Alibaba), y esta versión concreta aplica cuantización post-entrenamiento en formato FP8 dinámico (W8A8) mediante la librería compressed-tensors, pensada específicamente para servir el modelo con vLLM de forma eficiente. El resultado es un checkpoint de aproximadamente 5,8 GB en disco que mantiene la arquitectura híbrida del original (atención lineal más atención completa), su torre de visión y su cabeza de predicción multi-token (MTP).

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desplegar un modelo multimodal de 4B parámetros en GPUs con recursos limitados, sin renunciar a la fidelidad respecto al original. Según las mediciones del autor, la cuantización FP8 dinámica recupera el 100,0% de la media de benchmarks del modelo BF16 y mantiene una perplejidad solo un 1,2% superior, lo que la convierte en una opción atractiva para producción cuando el objetivo es reducir el uso de memoria y aumentar el throughput.

Es importante señalar que este repositorio sufrió una corrección de configuración el 2 de noviembre de 2026: la versión anterior excluía incorrectamente la torre de visión de la cuantización, lo que provocaba respuestas erróneas ante entradas de imagen. La revisión actual corrige el patrón de nombres en `config.json`, de modo que los pesos de visión se cargan ahora en BF16. Quien haya descargado el repositorio antes de esa fecha debe volver a descargar `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), densa, multimodal (visión), con cabeza MTP |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | FP8 dinámico (W8A8, esquema `FP8_DYNAMIC` de compressed-tensors); pesos FP8 E4M3 con escala por canal de salida y activaciones FP8 dinámicas por token |
| Idiomas soportados | No disponible en la información proporcionada (los benchmarks incluyen pruebas en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato compressed-tensors `float-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, lo que reduce el coste computacional y de memoria del contexto largo respecto a un transformer de atención completa pura. Es un modelo denso (no MoE) de aproximadamente 4,66 mil millones de parámetros, con capacidades multimodales gracias a una torre de visión y un proyector, y con una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa. Esta versión FP8 conserva en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), las RMSNorm (salvo la norm con compuerta de `linear_attn.norm`), los embeddings de tokens, la LM head y las partes no lineales del SSM (`linear_attn.conv1d` y `dt_bias`); mantiene en FP32 `linear_attn.A_log` y la norm con compuerta, igual que el original. En conjunto, alrededor del 23% de los parámetros quedan sin cuantizar para preservar la calidad.

La cuantización es post-entrenamiento (PTQ), sin reentrenamiento ni calibración: las escalas estáticas de pesos se calculan sin datos (data-free) y las activaciones se cuantizan dinámicamente por token. El tokenizador, la `chat_template` y las configuraciones de preprocesado son idénticos a los del modelo original; el `config.json` es el original más un bloque `quantization_config`. No se incluye `generation_config.json` porque el modelo base tampoco lo trae. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con soporte de plantilla de chat idéntica a la del modelo original.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`): descripción de contenido visual, respuesta a preguntas sobre imágenes y tareas combinadas de visión y lenguaje.
- Capacidades matemáticas y de resolución de problemas, evidenciadas por los resultados en GSM8K del modelo base (74,07 en 5-shot estricto).
- Razonamiento de sentido común y conocimiento general, medido en MMLU, ARC-Challenge y Winogrande.
- Cobertura multilingüe parcial: los benchmarks incluyen KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere competencia en inglés y coreano, aunque la lista oficial de idiomas no está disponible.
- Cabeza de predicción multi-token (MTP) que puede habilitar decodificación especulativa para acelerar la inferencia.
- No se dispone de información sobre soporte explícito de tool calling, function calling o comportamiento agéntico multi-paso en la documentación proporcionada.

## Casos de uso

- Asistente multimodal en atención al cliente: el modelo puede recibir capturas de pantalla, fotos de productos o documentos escaneados junto con texto y responder preguntas sobre ellos, aprovechando su torre de visión y su plantilla conversacional para gestionar diálogos multi-turno.
- Moderación de contenido visual en plataformas: clasificación y descripción automática de imágenes enviadas por usuarios, con salida textual estructurada que puede integrarse en pipelines de revisión.
- Generación asistida de documentación técnica a partir de diagramas: el modelo puede describir esquemas, diagramas de arquitectura o capturas de interfaces y convertirlos en texto explicativo.
- Despliegue en GPUs de gama media para prototipado: con 5,8 GB de pesos, el modelo cabe en GPUs consumer con suficiente VRAM y permite iterar rápidamente en entornos de desarrollo sin infraestructura dedicada.
- Servicio de inferencia de alto throughput con vLLM: la cuantización FP8 dinámica reduce el uso de memoria y permite aumentar el número de peticiones concurrentes por GPU, adecuado para APIs internas de chat multimodal.
- Evaluación comparativa de cuantizaciones: este checkpoint sirve como referencia para medir la pérdida de fidelidad de FP8 frente a AWQ, NVFP4 y otras alternativas en tareas de texto y visión.
- Procesamiento de documentos con extracción de información: combinación de OCR implícito y razonamiento sobre el contenido de imágenes para resumir o extraer datos de formularios y facturas.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy y prompts de estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa (`mmlu_generative`), no directamente comparable con puntuaciones obtenidas por log-likelihood. Los porcentajes entre paréntesis indican la recuperación respecto al modelo BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativo) | 55,18 | 57,99 (105,1%) | 54,79 (99,3%) | 60,58 (109,8%) | 58,61 (106,2%) | 60,89 (110,3%) |
| GSM8K (5-shot, estricto) | 74,07 | 73,92 (99,8%) | 73,84 (99,7%) | 76,72 (103,6%) | 73,31 (99,0%) | 76,42 (103,2%) |
| ARC-Challenge (0-shot) | 54,61 | 53,92 (98,8%) | 54,52 (99,8%) | 54,86 (100,5%) | 53,92 (98,8%) | 54,35 (99,5%) |
| Winogrande (5-shot) | 68,75 | 67,96 (98,9%) | 69,14 (100,6%) | 68,90 (100,2%) | 69,38 (100,9%) | 68,90 (100,2%) |
| KMMLU (5-shot, directo) | 50,47 | 50,13 (99,3%) | 50,48 (100,0%) | 51,49 (102,0%) | 50,26 (99,6%) | 49,02 (97,1%) |
| HAE-RAE (0-shot) | 62,42 | 61,50 (98,5%) | 62,05 (99,4%) | 61,69 (98,8%) | 59,76 (95,7%) | 58,48 (93,7%) |
| **Media** | **60,92** | **60,90 (100,0%)** | **60,81 (99,8%)** | **62,37 (102,4%)** | **60,87 (99,9%)** | **61,34 (100,7%)** |

Evaluación de fidelidad respecto al BF16 original sobre un conjunto interno mixto inglés/coreano de 100 prompts:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = más cercano) | 1,5885 | 1,5703 (+1,2%) |
| Acuerdo top-1 en siguiente token | 95,3% | 99,2% |

## Requisitos de hardware

- VRAM estimada: 5,8 GB solo para los pesos; hay que añadir la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y gráficas CUDA.
- GPUs recomendadas: NVIDIA Turing (sm75, por ejemplo T4) o superior. La aritmética FP8 nativa se ejecuta en Ada, Hopper y Blackwell (sm89+); en Turing y Ampere, vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportado.
- Cabe en GPUs consumer: sí, siempre que dispongan de VRAM suficiente para pesos, caché KV y activaciones; una RTX 4090 (24 GB) es holgada, y GPUs con 8-12 GB pueden ser suficientes para contextos cortos y poca concurrencia.
- Opciones de despliegue: vLLM (runtime probado, versión 0.32.0), con `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU. También es posible usar transformers (≥5.2.0) con compressed-tensors (≥0.15.0) sin vLLM, aunque el soporte probado se centró en vLLM.
- Requisitos de software: vLLM 0.32 requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible), transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (no actualizar por separado).
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-FP8-dynamic (este) | ~4,66 B | No disponible | Apache-2.0 | safetensors (FP8) | Multimodal, híbrido, MTP; media de benchmarks 60,90 |
| Qwen3.5-4B (BF16 original) | ~4,66 B | No disponible | Apache-2.0 | safetensors (BF16) | Referencia de calidad; media 60,92; mayor uso de memoria |
| Qwen3.5-4B AWQ-8bit | ~4,66 B | No disponible | Apache-2.0 | safetensors (AWQ) | Media 60,81; cuantización de 8 bits alternativa |
| Qwen3.5-4B NVFP4 | ~4,66 B | No disponible | Apache-2.0 | safetensors (NVFP4) | Media 60,87; formato de 4 bits para Blackwell |

Las alternativas comparadas son variantes de cuantización del mismo modelo base, ya que no se dispone de información sobre otros modelos de la misma categoría en la documentación proporcionada. En rendimiento medido, todas las variantes quedan muy próximas entre sí, con diferencias dentro del ruido de evaluación; NVFP4A16 obtiene la media más alta (62,37), mientras que FP8-dynamic iguala prácticamente al BF16 (60,90 frente a 60,92).

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida de fidelidad medible: perplejidad un 1,2% superior y acuerdo top-1 del 95,3% frente al 99,2% del BF16. En tareas sensibles a la precisión puede ser preferible el modelo original.
- La revisión anterior del repositorio (antes del 1 de noviembre de 2026, revisión `700ddf7`) producía respuestas erróneas con entradas de imagen debido a un patrón de exclusión incorrecto en `config.json`. Es imprescindible usar la revisión actual y volver a descargar `config.json` si se obtuvo antes de esa fecha.
- El soporte de FP8 nativo depende de la GPU: en Turing y Ampere se recurre a FP8 solo de pesos, con posibles diferencias de rendimiento y numéricas respecto a Ada, Hopper y Blackwell. V100 no está soportado.
- La lista oficial de idiomas soportados no está disponible; los benchmarks solo evidencian competencia en inglés y coreano, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni sobre soporte de tool calling o comportamiento agéntico; conviene validar estos aspectos antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base enlazada por el autor para confirmar condiciones adicionales.
- El repositorio tiene un volumen de descargas bajo (217) y ningún "like", lo que sugiere poca validación comunitaria independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
