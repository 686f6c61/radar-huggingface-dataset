# axteam/gemma-4-E4B-it-AWQ-8bit

## Resumen

`axteam/gemma-4-E4B-it-AWQ-8bit` es una cuantizacion INT8 de tipo AWQ (activation-aware weight quantization) del modelo multimodal `google/gemma-4-E4B-it`, publicada por el equipo axteam. El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura densa y una ventana de contexto que no se especifica en la informacion disponible; el checkpoint cuantizado conserva las torres de vision y audio en BF16, por lo que mantiene la entrada image-text-to-text (y audio, segun la model card) del original.

La relevancia de esta publicacion es doble. Por un lado, reduce el peso en disco de aproximadamente 24,5 GB (repo original en safetensors) a unos 12,2 GB, lo que facilita el despliegue en GPUs de gama alta-consumo con 16-24 GB de VRAM. Por otro, la model card documenta un proceso de reconstruccion (revision del 1 de noviembre de 2026) que corrige un fallo silencioso en el pipeline de cuantizacion: la primera subida se etiquetaba como AWQ pero en la practica era round-to-nearest (RTN). La version actual aplica suavizado AWQ real sobre las entradas de atencion (q/k/v), las proyecciones MLP (gate/up) y la proyeccion down, con 128 muestras de calibracion.

El modelo esta pensado para servir con vLLM (probado con vLLM 0.32.0) y usa el formato `compressed-tensors` `pack-quantized`, con pesos INT8 simetricos, group size 32 y activaciones en BF16 (esquema W8A16). La licencia declarada en el repo es Apache-2.0, con enlace a la licencia de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (con torres de vision y audio) |
| Parametros totales | 7.941.100.874 (~7,94 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT8 (W8A16), pesos INT8 simetricos, group size 32, activaciones BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la calibracion uso un set con predominio de coreano; el modelo base es multilingue) |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); ~12,2 GB en disco |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con 7.941.100.874 parametros totales segun los safetensors del repo. Incluye torres de vision y audio, proyecciones vision/audio, embeddings de tokens (tied con lm_head), una tabla de embeddings por capa (`embed_tokens_per_layer`) y todas las normas. En esta cuantizacion, esos componentes permanecen en BF16 (aproximadamente el 51% de los parametros), mientras que las matrices de atencion y MLP se cuantizan a INT8.

El proceso de cuantizacion es PTQ (post-training quantization), sin reentrenamiento. La revision del 1 de noviembre de 2026 aplica suavizado AWQ con 128 muestras de calibracion (con predominio de coreano y sin respuestas en modo thinking) sobre las entradas de atencion (q/k/v, y solo q en las capas con KV compartida), las entradas MLP (gate/up) y la entrada de la proyeccion down. El tokenizer, `chat_template`, `processor_config` y `generation_config` son identicos byte a byte al original, incluida la correccion del `chat_template` de julio de 2026 de Google; `config.json` es el original mas un bloque `quantization_config`. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `image-text-to-text`, tag `conversational`).
- Entrada multimodal de imagen y texto; la model card menciona ademas torre de audio, por lo que se infiere soporte de audio, aunque no se detalla en la informacion disponible.
- Razonamiento y matematicas: los benchmarks reportados incluyen GSM8K (5-shot, strict) con 84,08 en esta version cuantizada.
- Conocimiento general y multilingue: MMLU (5-shot), ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE (coreano).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la calibracion excluyo respuestas en modo thinking, pero no se confirma si el modelo lo soporta; no disponible.
- Capacidades multilingues: el modelo base es de Google y la evaluacion incluye benchmarks en ingles y coreano; el listado oficial de idiomas no esta disponible.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagen y texto y puede desplegarse con vLLM 0.32 en una unica GPU con ~12,2 GB de pesos, lo que permite servir conversaciones con entrada visual en infraestructura de gama media-alta.
- Asistente de documentacion tecnica con capturas: al conservar la torre de vision en BF16, puede interpretar diagramas o capturas de pantalla y responder preguntas sobre ellos sin degradacion por cuantizacion en el encoder visual.
- Procesamiento de imagenes en lote para clasificacion y descripcion: el esquema W8A16 reduce el coste de memoria frente al BF16 original, lo que abarata el throughput en pipelines de etiquetado o generacion de alt-text.
- Razonamiento matematico asistido: con 84,08 en GSM8K (5-shot strict) y una recuperacion del 99,7% respecto a BF16, es adecuado para tutoria o resolucion de problemas paso a paso donde el coste por token importa.
- Evaluacion comparativa de cuantizaciones: el repo publica resultados medidos con lm-evaluation-harness sobre vLLM frente a FP8-dynamic, NVFP4A16, NVFP4 y AWQ-4bit, lo que lo convierte en un punto de referencia para decidir el esquema de cuantizacion en despliegues vLLM.
- Despliegue en entornos con VRAM limitada: al ocupar aproximadamente la mitad que el BF16 original, cabe en GPUs de 16-24 GB y permite alternativas a A100/H100 para prototipado e inferencia de baja concurrencia.
- Analisis de contenido en coreano e ingles: los benchmarks KMMLU y HAE-RAE, junto con la calibracion con predominio de coreano, lo hacen util para aplicaciones bilingues en esos idiomas, aunque el rendimiento absoluto en coreano es moderado (51,46 en KMMLU).

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, few-shot completion sin chat template. Los porcentajes entre parentesis indican la recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 62,16 | 63,20 (101,7%) | 62,40 (100,4%) | 64,48 (103,7%) | 62,14 (100,0%) | 64,16 (103,2%) |
| GSM8K (5-shot, strict) | 84,31 | 84,00 (99,6%) | 84,08 (99,7%) | 82,71 (98,1%) | 79,83 (94,7%) | 81,73 (96,9%) |
| ARC-Challenge (0-shot) | 56,91 | 57,34 (100,7%) | 56,66 (99,6%) | 56,66 (99,6%) | 55,20 (97,0%) | 55,97 (98,4%) |
| Winogrande (5-shot) | 66,30 | 65,75 (99,2%) | 66,85 (100,8%) | 65,51 (98,8%) | 66,46 (100,2%) | 65,43 (98,7%) |
| KMMLU (5-shot, direct) | 51,46 | 51,24 (99,6%) | 51,46 (100,0%) | 50,15 (97,5%) | 49,11 (95,4%) | 51,31 (99,7%) |
| HAE-RAE (0-shot) | 69,84 | 69,02 (98,8%) | 69,57 (99,6%) | 69,48 (99,5%) | 68,10 (97,5%) | 68,10 (97,5%) |
| **Media** | **65,16** | **65,09 (99,9%)** | **65,17 (100,0%)** | **64,83 (99,5%)** | **63,47 (97,4%)** | **64,45 (98,9%)** |

Fidelidad respecto al BF16 original en un set interno mixto ingles/coreano de 100 prompts (respuestas greedy del original, puntuadas con el mismo codigo):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,3042 | 1,3032 (+0,1%) |
| Acuerdo top-1 en el siguiente token | 98,8% | 99,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~12,2 GB; con overhead de activaciones y cache KV en BF16 se recomienda al menos 16 GB de VRAM para contexto corto y 24 GB para contextos largos o concurrencia moderada. No se dispone de cifras exactas de VRAM pico medidas.
- GPU recomendadas: A100 (40/80 GB) y H100 para produccion con alta concurrencia; RTX 4090 (24 GB) y GPUs de 16 GB como alternativa para prototipado. No se especifican modelos concretos probados por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM, dado el tamano de pesos de ~12,2 GB.
- Opciones de despliegue: vLLM (runtime probado, version 0.32.0; la arquitectura esta en vLLM >= 0.19.0). El formato compressed-tensors pack-quantized esta orientado a vLLM; no se indica soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Requisitos de software: vLLM 0.32 requiere Python 3.11-3.14 y torch 2.13 con build CUDA 13.0 (GPU NVIDIA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones del mismo modelo base evaluadas en la model card, todas medidas con el mismo harness:

| Modelo | Parametros | Contexto | Media de benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AWQ-8bit (este repo) | ~7,94 mil millones | no disponible | 65,17 (100,0% vs BF16) | Apache-2.0 | HuggingFace (axteam) |
| FP8-dynamic | ~7,94 mil millones | no disponible | 65,09 (99,9% vs BF16) | Apache-2.0 | mencionado en la card, sin enlace |
| NVFP4A16 | ~7,94 mil millones | no disponible | 64,83 (99,5% vs BF16) | Apache-2.0 | mencionado en la card, sin enlace |
| NVFP4 | ~7,94 mil millones | no disponible | 63,47 (97,4% vs BF16) | Apache-2.0 | mencionado en la card, sin enlace |
| AWQ-4bit | ~7,94 mil millones | no disponible | 64,45 (98,9% vs BF16) | Apache-2.0 | mencionado en la card, sin enlace |

No se dispone de comparacion con modelos de otros autores (por ejemplo, otras familias de ~8B multimodales) en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta en la model card; aplican los riesgos habituales de un modelo generativo de ~8B.
- Sesgos: no documentados. La calibracion uso 128 muestras con predominio de coreano, lo que puede introducir un sesgo de calibracion hacia ese idioma en los canales suavizados, aunque la evaluacion reportada no muestra degradacion en KMMLU ni HAE-RAE.
- Idiomas: el listado oficial no esta disponible; la evaluacion cubre ingles y coreano. El rendimiento en castellano no esta medido en la informacion proporcionada.
- Contexto: la longitud de contexto no se especifica; no se puede garantizar el comportamiento en ventanas largas.
- Licencia: el repo declara Apache-2.0, pero enlaza a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso comercial de Gemma 4 antes de desplegar en produccion.
- Revision del repo: la primera subida (revision `d201479`, anterior al 2026-11-01 09:30:35 UTC) era en la practica RTN pese a la etiqueta AWQ. Si se descargo antes de esa fecha, hay que volver a descargar los archivos.
- Formato y runtime: al ser compressed-tensors pack-quantized, el soporte esta limitado principalmente a vLLM; no se garantiza su uso con otras herramientas de inferencia.
- Componentes en BF16: vision, audio, embeddings y normas no estan cuantizados (~51% de los parametros), por lo que el ahorro de memoria es menor de lo que sugeriria el ratio de 8 bits.
- Sin datos de tool calling, agentes ni thinking mode: no se puede asumir su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-E4B-it-AWQ-8bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
