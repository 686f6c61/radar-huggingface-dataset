# axteam/gemma-4-E4B-it-FP8-dynamic

## Resumen

`axteam/gemma-4-E4B-it-FP8-dynamic` es una cuantizacion de 8 bits en formato FP8 (esquema `FP8_DYNAMIC`, W8A8) del modelo multimodal `google/gemma-4-E4B-it`, publicada por el equipo axteam con el objetivo de servir el modelo de forma eficiente en vLLM. Se trata de una cuantizacion post-entrenamiento (PTQ) sin calibracion: los pesos se almacenan en FP8 E4M3 con escala estatica por canal de salida y las activaciones se cuantizan dinamicamente por token en tiempo de ejecucion, todo empaquetado en el formato `compressed-tensors` que entiende vLLM.

El modelo base es un transformer denso de la familia Gemma 4 con 7.996.156.490 parametros totales (unos 8.000 millones), capaz de procesar entradas de imagen y texto (`image-text-to-text`). Esta version cuantizada ocupa aproximadamente 12,0 GB en disco y mantiene en BF16 el torre de vision, el torre de audio, las proyecciones multimodales, los embeddings de tokens y todas las normas, lo que representa en torno al 51 % de los parametros del modelo; solo las capas lineales del transformer se cuantizan a FP8.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de ~8B en GPUs con menos memoria que la version BF16, con una perdida de fidelidad medida muy baja (perplejidad +1,1 % frente al original y una recuperacion media del 99,9 % en el conjunto de benchmarks reportado). Requiere vLLM 0.32.0 o superior y una GPU NVIDIA Turing (sm75) o posterior, con matematicas FP8 nativas en Ada, Hopper y Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso multimodal (texto, imagen y audio) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 dinamico W8A8 (pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinamicas por token); torres de vision y audio, proyecciones, embeddings y normas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (`float-quantized`, esquema `FP8_DYNAMIC`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con capacidades multimodales: incorpora un torre de vision y un torre de audio, ademas de proyecciones que conectan esas modalidades con el espacio de tokens del modelo de lenguaje. La version cuantizada conserva intactas en BF16 esas torres, las proyecciones, los embeddings de tokens (atados con `lm_head`), la tabla de embeddings por capa (`embed_tokens_per_layer`) y todas las normas; solo las capas lineales del cuerpo del transformer se convierten a FP8. El tokenizador, la `chat_template`, el `processor_config` y el `generation_config` son identicos byte a byte al modelo original, incluida la correccion de la `chat_template` de julio de 2026.

La cuantizacion es una PTQ sin reentrenamiento: los pesos BF16 liberados por Google se redondean a la rejilla FP8 con escalas estaticas por canal calculadas sin datos de calibracion, mientras que las activaciones usan escalas dinamicas por token en tiempo de ejecucion. El autor distingue explicitamente este enfoque de AWQ (que protege canales salientes con escalas por canal) y de QAT (fine-tuning con cuantizacion simulada, que Google distribuye como checkpoints separados y que este repositorio no es). No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`chat_template` corregida en julio de 2026).
- Procesamiento de entradas de imagen y texto (`image-text-to-text`): el pipeline declarado en Hugging Face es multimodal.
- Procesamiento de audio: el modelo conserva un torre de audio en BF16, aunque la model card no detalla las tareas concretas soportadas.
- Razonamiento y matematicas: los benchmarks reportados incluyen GSM8K (5-shot, strict) con un 84,00 en la version FP8, lo que evidencia capacidad de resolucion de problemas aritmeticos de varios pasos.
- Conocimiento general y multilingue: se reportan resultados en MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE, lo que sugiere cobertura de ingles y coreano, aunque no se especifica la lista completa de idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagenes y texto en la misma conversacion, por lo que puede desplegarse como asistente que responde preguntas sobre capturas, fotografias o documentos escaneados, con la ventaja de que los 12 GB de pesos FP8 reducen el coste por replica frente al BF16.
- Analisis de documentos con imagen y texto: extraccion de informacion de facturas, formularios o graficos combinando el torre de vision con el razonamiento del modelo de lenguaje, manteniendo la fidelidad del BF16 en las capas multimodales.
- Transcripcion y comprension de audio: al conservar el torre de audio sin cuantizar, el modelo puede emplearse en pipelines que reciben audio y generan resumenes o respuestas textuales, aunque la model card no detalla las tareas exactas soportadas.
- Razonamiento aritmetico y tutoria educativa: con un 84,00 en GSM8K (5-shot, strict), es adecuado para asistentes que resuelven problemas matematicos paso a paso y explican el procedimiento.
- Atencion al cliente automatizada multilingue: los resultados en KMMLU (51,24) y HAE-RAE (69,02) indican competencia en coreano e ingles, lo que permite atender a usuarios en ambos idiomas con una sola instancia servida en vLLM.
- Evaluacion y benchmarking de tecnicas de cuantizacion: el repositorio publica mediciones de perplejidad, acuerdo top-1 y recuperacion en benchmarks frente a BF16, AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit, por lo que sirve como referencia reproducible para comparar esquemas de cuantizacion en vLLM.
- Despliegue con tensor parallelism en GPUs de gama media: al ocupar 12 GB, los pesos caben en una sola GPU de 16 GB o se reparten con `--tensor-parallel-size N` en varias GPUs, lo que facilita servir el modelo en infraestructura modesta.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy, prompts de estilo completion sin plantilla de chat (0-shot o 5-shot segun la fila). Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic (este repo) | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 62,16 | 63,20 (101,7 %) | 62,40 (100,4 %) | 64,48 (103,7 %) | 62,14 (100,0 %) | 64,16 (103,2 %) |
| GSM8K (5-shot, strict) | 84,31 | 84,00 (99,6 %) | 84,08 (99,7 %) | 82,71 (98,1 %) | 79,83 (94,7 %) | 81,73 (96,9 %) |
| ARC-Challenge (0-shot) | 56,91 | 57,34 (100,7 %) | 56,66 (99,6 %) | 56,66 (99,6 %) | 55,20 (97,0 %) | 55,97 (98,4 %) |
| Winogrande (5-shot) | 66,30 | 65,75 (99,2 %) | 66,85 (100,8 %) | 65,51 (98,8 %) | 66,46 (100,2 %) | 65,43 (98,7 %) |
| KMMLU (5-shot, direct) | 51,46 | 51,24 (99,6 %) | 51,46 (100,0 %) | 50,15 (97,5 %) | 49,11 (95,4 %) | 51,31 (99,7 %) |
| HAE-RAE (0-shot) | 69,84 | 69,02 (98,8 %) | 69,57 (99,6 %) | 69,48 (99,5 %) | 68,10 (97,5 %) | 68,10 (97,5 %) |
| **Media** | **65,16** | **65,09 (99,9 %)** | **65,17 (100,0 %)** | **64,83 (99,5 %)** | **63,47 (97,4 %)** | **64,45 (98,9 %)** |

Evaluacion de fidelidad frente al BF16 original sobre un conjunto interno mixto ingles/coreano:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3173 | 1,3032 (+1,1 %) |
| Acuerdo top-1 del siguiente token | 96,0 % | 99,2 % |

El autor advierte que estas cifras miden fidelidad al modelo base, no puntuaciones absolutas de tarea.

## Requisitos de hardware

- VRAM estimada: 12,0 GB solo para los pesos. Hay que anadir la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPU recomendadas: NVIDIA Turing (sm75, por ejemplo T4) o posterior. Las matematicas FP8 nativas requieren Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automaticamente a FP8 solo de pesos. V100 (sm70) no esta soportado. El autor solo probo con B200.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo RTX 4080/4090/5080/5090) para una sola instancia con contexto moderado; en GPUs de 12 GB no cabe con margen suficiente.
- Despliegue: vLLM 0.32.0 (la arquitectura esta en vLLM >= 0.19.0). Requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado). Para uso sin vLLM, transformers >=5.5.2 (5.5.0 y 5.5.1 no pueden ejecutar las capas con KV compartida). No necesita `trust_remote_code`.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una sola GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **gemma-4-E4B-it-FP8-dynamic (este repo)** | ~8B | no disponible | FP8 W8A8 dinamico, safetensors compressed-tensors | Apache-2.0 | Hugging Face, vLLM >=0.19.0 |
| AWQ-8bit (variante del mismo base) | ~8B | no disponible | AWQ 8 bits | Apache-2.0 | Referenciada en benchmarks del autor |
| NVFP4A16 (variante del mismo base) | ~8B | no disponible | NVFP4 con activaciones de 16 bits | Apache-2.0 | Referenciada en benchmarks del autor |
| NVFP4 (variante del mismo base) | ~8B | no disponible | NVFP4 | Apache-2.0 | Referenciada en benchmarks del autor |
| AWQ-4bit (variante del mismo base) | ~8B | no disponible | AWQ 4 bits | Apache-2.0 | Referenciada en benchmarks del autor |
| google/gemma-4-E4B-it (BF16 original) | ~8B | no disponible | BF16, safetensors | Apache-2.0 / Gemma 4 | Hugging Face |

No se dispone de datos sobre modelos de otros fabricantes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de fidelidad medible: perplejidad +1,1 % y acuerdo top-1 del 96,0 % frente al 99,2 % del BF16. Aunque la media de benchmarks se mantiene en el 99,9 %, algunas tareas concretas pueden degradarse.
- El autor solo probo el checkpoint en una GPU B200; el comportamiento en otras arquitecturas (Turing, Ampere, Ada, Hopper) se infiere del codigo de seleccion de kernels de vLLM 0.32, no de una validacion directa.
- En Turing y Ampere, vLLM desactiva las matematicas FP8 y pasa a FP8 solo de pesos, por lo que el rendimiento y la fidelidad pueden diferir de lo reportado.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad o tasa de alucinacion en la informacion disponible.
- Sesgos conocidos: no se documentan en la model card.
- Idiomas: solo se reportan resultados en ingles y coreano (KMMLU, HAE-RAE); no se especifica la lista completa de idiomas soportados ni su calidad.
- Longitud de contexto: no se indica en la informacion proporcionada; hay que consultar la model card del modelo base.
- Restricciones de licencia: la licencia declarada es Apache-2.0, pero el enlace apunta a la licencia Gemma 4 de Google, por lo que conviene revisar los terminos de uso comercial de Gemma antes de desplegar en produccion.
- Dependencias muy fijadas: transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0. Actualizar compressed-tensors por separado puede romper la carga del checkpoint, guardado con 0.19.0.
- El repositorio no incluye calibracion (esquema data-free), por lo que las escalas de pesos no se adaptan a dominios especificos de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-E4B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
