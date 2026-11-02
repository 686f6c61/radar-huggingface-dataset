# axteam/gemma-4-31B-it-FP8-dynamic

## Resumen

`axteam/gemma-4-31B-it-FP8-dynamic` es una cuantización de 8 bits en formato FP8 (dinámica) del modelo multimodal `google/gemma-4-31B-it`, publicada por el usuario axteam. El objetivo es servir el modelo base de forma eficiente en vLLM reduciendo el peso en disco y el consumo de memoria, manteniendo una fidelidad alta respecto al original en BF16. El checkpoint ocupa aproximadamente 33,3 GB y conserva la torre de visión, las proyecciones, los embeddings y las normas en BF16 (alrededor del 6 % de los parámetros), por lo que sigue siendo un modelo image-text-to-text plenamente funcional.

La arquitectura subyacente es Gemma 4 en variante densa, con 31.273.088.876 parámetros totales según los safetensors del repositorio. La cuantización se ha realizado mediante post-training quantization (PTQ) sin calibración, con pesos FP8 E4M3 y escala estática por canal de salida, y activaciones FP8 dinámicas por token. El resultado se almacena en el formato `float-quantized` de compressed-tensors con esquema `FP8_DYNAMIC`, pensado para el motor de inferencia vLLM.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de 31B en hardware más modesto que su versión BF16, con una pérdida de rendimiento medida muy contenida (99,4 % de media en los benchmarks reportados frente al original). No obstante, es un artefacto de cuantización de terceros, no un modelo oficial de Google, y su licencia declarada remite tanto a Apache-2.0 como a la licencia específica de Gemma 4, lo que conviene verificar antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal image-text-to-text) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 dinámico W8A8 (pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinámicas por token); torre de visión, proyección de visión, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con compressed-tensors (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 en configuración densa, con 31,27 mil millones de parámetros y capacidad multimodal de entrada imagen-texto. Esta publicación no entrena el modelo: aplica una cuantización post-entrenamiento (PTQ) sin datos de calibración sobre los pesos BF16 liberados por Google (commit `842da37`). La cuantización es W8A8: los pesos se almacenan en FP8 E4M3 con escala estática por canal de salida, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. Se mantienen en BF16 la torre de visión, la proyección de visión, los embeddings de tokens (atados con `lm_head`) y todas las normas, lo que representa aproximadamente el 6 % de los parámetros y preserva la calidad en las partes más sensibles.

El tokenizador, la `chat_template`, el `processor_config` y el `generation_config` son idénticos byte a byte a los del modelo original, incluida la corrección de la `chat_template` de julio de 2026 de Google. El `config.json` es el original más un bloque `quantization_config`. La model card describe el método como PTQ con escalas de peso estáticas sin calibración y no menciona RLHF, DPO ni datos de entrenamiento adicionales; toda la información sobre datos de preentrenamiento y alineamiento del modelo base no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat idéntica a la del modelo original.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`): la torre de visión se mantiene en BF16 para conservar la calidad multimodal.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado en MMLU, ARC-Challenge y Winogrande.
- Razonamiento matemático y aritmético de varios pasos, evaluado en GSM8K con resultados próximos al modelo BF16.
- Capacidades multilingües parciales: los benchmarks incluyen KMMLU (coreano) y HAE-RAE (coreano), lo que indica cierto soporte para coreano además del inglés; el conjunto exacto de idiomas soportados no está disponible.
- Compatibilidad con vLLM y con el ecosistema transformers (`transformers>=5.5.0`), lo que facilita su integración en pipelines de servicio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat multimodal en producción: el modelo puede gestionar conversaciones que combinan texto e imágenes, y su formato FP8 reduce el peso a 33,3 GB, lo que permite servirlo en una sola GPU de 48 GB o en dos GPU de 24 GB con tensor parallelism.
- Asistencia sobre documentación técnica con capturas o diagramas: al conservar la torre de visión en BF16, es adecuado para extraer información de figuras, esquemas y tablas renderizadas como imagen en flujos de soporte interno.
- Razonamiento matemático asistido: los resultados en GSM8K (91,89 en 5-shot estricto) lo hacen viable para tutoría o resolución de problemas aritméticos de varios pasos en entornos educativos.
- Atención al cliente automatizada: la plantilla de chat original y el soporte conversacional permiten desplegar un asistente multi-turno; la ventana de contexto debe consultarse en la documentación del modelo base, ya que no está disponible aquí.
- Evaluación comparativa de cuantizaciones: sirve como referencia FP8 para medir la degradación frente a BF16, AWQ y NVFP4 en pipelines internos de selección de variantes.
- Backend de inferencia en vLLM para aplicaciones internas: al estar integrado en vLLM ≥ 0.19.0 (probado con 0.32.0), encaja en despliegues que ya usan ese motor con tensor parallelism y KV cache gestionada.
- Prototipado de aplicaciones image-text-to-text en investigación: permite experimentar con un modelo de 31B multimodal en hardware Ada, Hopper o Blackwell sin necesidad de la versión BF16 completa.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de tipo completion sin plantilla de chat. Los porcentajes entre paréntesis indican la recuperación respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 56,46 | 56,07 (99,3 %) | 56,41 (99,9 %) | 58,32 (103,3 %) | 58,51 (103,6 %) | 57,12 (101,2 %) |
| GSM8K (5-shot, strict) | 91,81 | 91,89 (100,1 %) | 91,66 (99,8 %) | 91,96 (100,2 %) | 91,74 (99,9 %) | 92,34 (100,6 %) |
| ARC-Challenge (0-shot) | 57,59 | 58,36 (101,3 %) | 57,68 (100,1 %) | 57,76 (100,3 %) | 56,91 (98,8 %) | 57,17 (99,3 %) |
| Winogrande (5-shot) | 66,22 | 66,14 (99,9 %) | 65,82 (99,4 %) | 65,59 (99,0 %) | 64,96 (98,1 %) | 66,77 (100,8 %) |
| KMMLU (5-shot, direct) | 25,02 | 23,89 (95,5 %) | 25,21 (100,8 %) | 26,55 (106,1 %) | 26,78 (107,0 %) | 25,02 (100,0 %) |
| HAE-RAE (0-shot) | 76,81 | 75,25 (98,0 %) | 76,81 (100,0 %) | 77,09 (100,4 %) | 77,09 (100,4 %) | 78,09 (101,7 %) |
| Media | 62,32 | 61,93 (99,4 %) | 62,27 (99,9 %) | 62,88 (100,9 %) | 62,66 (100,6 %) | 62,75 (100,7 %) |

Evaluación de fidelidad frente al BF16 original sobre un conjunto mixto inglés/coreano interno:

| Métrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,1258 | 1,1120 (+1,2 %) |
| Acuerdo top-1 en el siguiente token | 97,4 % | 99,4 % |

## Requisitos de hardware

- VRAM estimada para pesos: 33,3 GB. Hay que añadir la KV cache (crece con la longitud de contexto y el número de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPU compatibles: NVIDIA Turing (sm75, por ejemplo T4) o superior. El cálculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos. V100 (sm70) no está soportada.
- Cabe en una GPU de 48 GB (A6000, L40S, A100 40 GB con margen ajustado) y en configuraciones de dos GPU de 24 GB (RTX 4090, L4) mediante `--tensor-parallel-size 2`.
- En consumer GPU de 24 GB no cabe en una sola tarjeta con los pesos completos; es necesario tensor parallelism o una GPU de mayor capacidad.
- Despliegue recomendado: vLLM ≥ 0.19.0 (probado con 0.32.0). Requiere Python 3.11–3.14, torch 2.13 con build CUDA 13.0, transformers ≥5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Alternativa sin vLLM: transformers ≥5.5.0 (5.5.2+ recomendado), aunque la model card indica que no se probó para el modelo de 31B.
- No requiere `trust_remote_code`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/gemma-4-31B-it-FP8-dynamic | 31,27 B | no disponible | safetensors FP8 (compressed-tensors) | Apache-2.0 / Gemma 4 | Media de 61,93 en los benchmarks reportados |
| google/gemma-4-31B-it (BF16) | 31,27 B | no disponible | safetensors BF16 | Gemma 4 | Referencia original; media de 62,32 |
| Variante AWQ-8bit de Gemma 4 31B | 31,27 B | no disponible | safetensors AWQ | Gemma 4 | Media de 62,27; requiere calibración |
| Variante NVFP4 de Gemma 4 31B | 31,27 B | no disponible | safetensors NVFP4 | Gemma 4 | Media de 62,66; pensada para Blackwell |

No se dispone de información sobre otros modelos de la misma categoría (multimodales densos de ~30B) en la documentación proporcionada.

## Limitaciones y advertencias

- Es una cuantización de terceros (axteam), no una publicación oficial de Google; la fidelidad y el soporte dependen del autor del repositorio.
- La cuantización introduce una degradación medible: perplejidad un 1,2 % superior y acuerdo top-1 del 97,4 % frente al 99,4 % del BF16. En KMMLU la recuperación baja al 95,5 %, por lo que el rendimiento en coreano es el más afectado de los benchmarks reportados.
- Los benchmarks se han medido con prompts de tipo completion sin plantilla de chat; el rendimiento en uso conversacional real puede diferir.
- La model card no documenta sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas; deben asumirse los del modelo base Gemma 4.
- La longitud de contexto no está indicada en la información disponible; es imprescindible consultar la documentación del modelo base antes de dimensionar la KV cache.
- La licencia declarada es Apache-2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar los términos aplicables al uso comercial y a la redistribución.
- Requiere versiones muy concretas de vLLM, torch, transformers y compressed-tensors; mezclar versiones puede impedir la carga del checkpoint.
- En GPU Turing y Ampere el cálculo FP8 no es nativo y vLLM recurre a FP8 solo de pesos, con posible impacto en latencia y throughput no cuantificado en la documentación.
- El repositorio tiene un uso muy bajo (94 descargas, 2 likes), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-31B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
