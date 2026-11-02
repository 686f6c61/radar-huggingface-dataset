# axteam/gemma-4-E2B-it-FP8-dynamic

## Resumen

`axteam/gemma-4-E2B-it-FP8-dynamic` es una cuantización de 8 bits en formato FP8 dinámico del modelo multimodal `google/gemma-4-E2B-it`, publicada por el equipo axteam. El modelo base pertenece a la familia Gemma 4 de Google y es un transformer denso con capacidad de entrada de imagen y texto (pipeline `image-text-to-text`), además de un torre de audio que se mantiene sin cuantizar en esta build.

El objetivo de esta versión es servir el modelo con vLLM de forma eficiente: los pesos se almacenan en FP8 E4M3 con escala estática por canal de salida, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de ejecución (esquema W8A8 `FP8_DYNAMIC` de compressed-tensors). El resultado ocupa unos 8,4 GB en disco y conserva en BF16 el 64 % de los parámetros (torres de visión y audio, proyecciones, embeddings y normas) para no degradar la calidad.

La relevancia de esta ficha es doble: por un lado, permite desplegar un modelo multimodal de la familia Gemma 4 en GPUs con FP8 nativo (Ada, Hopper, Blackwell) reduciendo el peso de los pesos a la mitad; por otro, la model card publica una comparativa medida frente a BF16 y otras cuantizaciones (AWQ, NVFP4), lo que facilita decidir con datos si la pérdida de fidelidad es aceptable para cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso multimodal (texto, imagen y audio) |
| Parametros totales | 5.123.178.051 (~5,12 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico W8A8 (E4M3, escala por canal de salida en pesos y por token en activaciones); torres de visión/audio, proyecciones, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con pipeline multimodal `image-text-to-text`. La build cuantizada conserva la arquitectura original e incluye torre de visión, torre de audio, proyecciones visión/audio, embeddings de tokens (atados con `lm_head`), la tabla de embeddings por capa (`embed_tokens_per_layer`) y todas las normas en BF16. El resto de pesos lineales se almacenan en FP8 E4M3 con escala estática por canal de salida, y las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. No se ha realizado recalibración: las escalas de pesos son estáticas y libres de datos.

Se trata de una cuantización post-entrenamiento (PTQ) sin reentrenamiento, aplicada sobre los pesos BF16 publicados por Google. La model card distingue explícitamente esta build de las versiones QAT de Google, que sí se afinan con cuantización simulada en la pasada forward. El tokenizador, la `chat_template` (incluida la corrección de Google de julio de 2026), el `processor_config` y el `generation_config` son idénticos byte a byte al original; `config.json` añade únicamente un bloque `quantization_config`. El autor no documenta en la información disponible el volumen ni la composición del dataset de entrenamiento del modelo base, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones, con plantilla de chat compatible con el original.
- Entrada de imagen y texto (image-text-to-text), gracias a la torre de visión conservada en BF16.
- Procesamiento de audio, con torre de audio y proyecciones también en BF16.
- Razonamiento y matemáticas de nivel medio, según los resultados publicados en GSM8K y ARC-Challenge.
- Conocimiento multilingüe parcial: la evaluación incluye KMMLU (coreano) y HAE-RAE, además de benchmarks en inglés.
- Compatible con `endpoints_compatible` y despliegue en vLLM con `trust_remote_code` desactivado.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- **Servicio conversacional multimodal en producción con vLLM**: el checkpoint está pensado para vLLM (arquitectura soportada desde vLLM ≥ 0.19.0, probado con 0.32.0) y permite atender peticiones de imagen y texto con pesos de 8,4 GB, lo que reduce el coste por réplica frente al BF16 original.
- **Asistentes sobre documentos escaneados**: al conservar la torre de visión en BF16, el modelo puede recibir imágenes de páginas y responder preguntas sobre su contenido sin degradación por cuantización en la parte visual.
- **Transcripción y análisis de audio en pipelines propios**: la torre de audio permanece en BF16, de modo que se puede encadenar la entrada de audio con respuestas de texto dentro del mismo modelo.
- **Clasificación y extracción de información en inglés y coreano**: los benchmarks KMMLU y HAE-RAE publicados muestran una recuperación del 100 % y 99,9 % respecto a BF16, lo que respalda su uso en tareas de comprensión en esos idiomas.
- **Despliegue en GPUs Ada, Hopper o Blackwell con FP8 nativo**: en sm89 o superior las operaciones FP8 se ejecutan de forma nativa; en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos, lo que permite reutilizar hardware T4 existente con menor exigencia de memoria.
- **Evaluación comparativa de cuantizaciones**: la model card publica resultados medidos con el mismo arnés (lm-evaluation-harness sobre vLLM, greedy, prompts de estilo completion), útil como referencia para decidir entre FP8 dinámico, AWQ-8bit, NVFP4 y AWQ-4bit en un mismo despliegue.
- **Réplica de bajo coste para pruebas de integración**: con 8,4 GB de pesos y soporte de `--tensor-parallel-size`, se puede levantar una instancia de validación en una sola GPU consumer de gama alta con suficiente VRAM.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness sobre vLLM, decodificación greedy y prompts de estilo completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 55,97 | 55,49 (99,1 %) | 56,25 (100,5 %) | 53,40 (95,4 %) | 50,06 (89,4 %) | 54,57 (97,5 %) |
| GSM8K (5-shot, strict) | 51,63 | 48,82 (94,6 %) | 53,98 (104,6 %) | 48,52 (94,0 %) | 38,13 (73,9 %) | 40,03 (77,5 %) |
| ARC-Challenge (0-shot) | 49,57 | 48,04 (96,9 %) | 49,23 (99,3 %) | 48,63 (98,1 %) | 45,48 (91,7 %) | 44,80 (90,4 %) |
| Winogrande (5-shot) | 62,59 | 60,77 (97,1 %) | 62,51 (99,9 %) | 61,25 (97,9 %) | 58,88 (94,1 %) | 60,54 (96,7 %) |
| KMMLU (5-shot, direct) | 40,72 | 40,70 (100,0 %) | 40,69 (99,9 %) | 39,51 (97,0 %) | 37,95 (93,2 %) | 39,45 (96,9 %) |
| HAE-RAE (0-shot) | 62,14 | 62,05 (99,9 %) | 62,24 (100,1 %) | 59,67 (96,0 %) | 57,01 (91,7 %) | 60,59 (97,5 %) |
| **Media** | **53,77** | **52,65 (97,9 %)** | **54,15 (100,7 %)** | **51,83 (96,4 %)** | **47,92 (89,1 %)** | **50,00 (93,0 %)** |

Evaluación de fidelidad frente al BF16 original sobre un conjunto interno mixto inglés/coreano:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,2087 | 1,1833 (+2,1 %) |
| Acuerdo top-1 en el siguiente token | 95,5 % | 99,0 % |

## Requisitos de hardware

- **VRAM estimada**: pesos de 8,4 GB; hay que sumar la caché KV (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y gráficos CUDA.
- **GPUs compatibles**: NVIDIA Turing (sm75, p. ej. T4) o superior. Las operaciones FP8 nativas requieren Ada, Hopper o Blackwell (sm89+); en Turing y Ampere, vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportado.
- **GPU recomendadas**: B200 fue la única GPU probada por el autor; por arquitectura, H100, L40S, RTX 4090 y B200 ejecutan FP8 de forma nativa. En T4 y A100 funcionará en modo FP8 solo de pesos.
- **GPU consumer**: sí cabe en GPUs consumer de gama alta con VRAM suficiente para pesos, caché KV y activaciones; el autor no publica cifras de VRAM pico medidas.
- **Despliegue**: vLLM es la vía recomendada (vLLM 0.32.0 probado, arquitectura soportada desde 0.19.0). Requiere Python 3.11–3.14, torch 2.13 con build CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Sin vLLM, transformers ≥5.5.2 (5.5.0 y 5.5.1 no ejecutan las capas con KV compartida). `trust_remote_code` no es necesario.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-FP8-dynamic (este) | ~5,12 mil millones | no disponible | Apache-2.0 / Gemma 4 | safetensors compressed-tensors FP8 | Multimodal imagen, texto y audio; media de 52,65 en el arnés del autor |
| google/gemma-4-E2B-it (BF16) | ~5,12 mil millones | no disponible | Apache-2.0 / Gemma 4 | safetensors BF16 | Referencia de calidad; media de 53,77 en el mismo arnés |
| Variante AWQ-8bit del mismo base | ~5,12 mil millones | no disponible | Apache-2.0 / Gemma 4 | safetensors AWQ | Media de 54,15; mejor en GSM8K (53,98) que FP8 (48,82) |
| Variante AWQ-4bit del mismo base | ~5,12 mil millones | no disponible | Apache-2.0 / Gemma 4 | safetensors AWQ | Media de 50,00; menor huella de memoria, mayor pérdida en GSM8K (40,03) |

No se dispone de datos de modelos comparables de otros fabricantes con la misma arquitectura y modalidades en la información proporcionada.

## Limitaciones y advertencias

- **Pérdida de fidelidad medible**: la perplejidad sube un 2,1 % y el acuerdo top-1 baja al 95,5 % frente al 99,0 % del BF16; en GSM8K la recuperación cae al 94,6 %, la mayor pérdida entre los benchmarks publicados.
- **Sesgos**: no documentados en la información proporcionada; el modelo base de Google puede arrastrar sesgos de sus datos de entrenamiento, no descritos aquí.
- **Alucinación**: no se publican tasas de alucinación ni evaluaciones específicas de veracidad.
- **Idiomas**: la lista de idiomas soportados no está disponible; la evaluación cubre inglés y coreano, sin datos sobre castellano.
- **Contexto**: la longitud de contexto no se indica en la información disponible, lo que impide dimensionar la caché KV con precisión.
- **Licencia**: la model card declara Apache-2.0 pero enlaza a la licencia Gemma 4 de Google; conviene revisar los términos de esa licencia antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- **Dependencias frágiles**: requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint.
- **Cobertura de hardware limitada**: solo se probó en B200; el comportamiento en T4, A100 o GPUs consumer no está medido por el autor.
- **Formato específico de vLLM**: el checkpoint está pensado para vLLM; su uso en otros motores (llama.cpp, Ollama, TGI) no está documentado ni soportado explícitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-E2B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
