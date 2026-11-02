# axteam/gemma-4-E2B-it-AWQ-4bit

## Resumen

`axteam/gemma-4-E2B-it-AWQ-4bit` es una cuantizacion de 4 bits (AWQ INT4, esquema W4A16) del modelo multimodal `google/gemma-4-E2B-it`, producida por el usuario axteam para servir con vLLM. El modelo base es un Gemma 4 denso de Google con capacidad de entrada imagen-texto y audio-texto, y este repositorio empaqueta los pesos en formato `compressed-tensors` con el objetivo de reducir el espacio en disco y la memoria de inferencia sin tocar el tokenizador, el `chat_template` ni los procesadores originales.

El modelo pesa aproximadamente 5.104 millones de parametros (dato de safetensors) y ocupa unos 7,6 GB en disco. La cuantizacion deja en BF16 el vision tower, el audio tower, las proyecciones, los embeddings y todas las normas (alrededor del 64% de los parametros), y cuantiza a INT4 asimetrico con grupo de 32 las capas de atencion y MLP. Esta es una decision relevante: preserva la calidad de las partes multimodales a costa de un ahorro de memoria menor que una cuantizacion completa.

La relevancia de esta ficha es doble. Por un lado, documenta una cuantizacion PTQ con benchmark medido frente a BF16 y otras precisiones (FP8, AWQ-8bit, NVFP4), lo que permite evaluar el coste real de bajar a 4 bits. Por otro, incluye una nota de revision importante: la primera subida del repositorio era efectivamente RTN pese a etiquetarse como AWQ, y fue reconstruida el 2026-11-01. Cualquier descarga anterior a esa fecha debe repetirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 densa (transformer multimodal, con torres de vision y audio) |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16, pesos INT4 asimetricos con grupo de 32 (escala BF16 + zero-point INT4), activaciones BF16; formato `compressed-tensors` `pack-quantized` |
| Idiomas soportados | no disponible en la model card; la calibracion fue mayoritariamente en coreano |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 denso de Google con pipeline `image-text-to-text`, es decir, acepta imagenes y texto como entrada. La model card de la cuantizacion menciona explicitamente torres de vision y de audio, proyecciones vision/audio, embeddings de tokens (atados con `lm_head`), una tabla de embeddings por capa (`embed_tokens_per_layer`) y normas. La cuantizacion mantiene en BF16 todos estos componentes y solo aplica INT4 a las entradas de atencion (q/k/v, y solo q en las capas con KV compartida), a las entradas del MLP (gate/up) y a la entrada de la proyeccion down.

El proceso de cuantizacion es PTQ (post-training quantization) con AWQ, sin reentrenamiento. Se usaron 128 muestras de calibracion, mayoritariamente en coreano y sin respuestas en modo thinking. La revision del 2026-11-01 aplica suavizado AWQ a las entradas de atencion y MLP, con busqueda de pares de suavizado y error de calibracion no nulo verificado. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de `google/gemma-4-E2B-it`, no incluida en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el pipeline es `image-text-to-text` y el tag `conversational` confirma uso de chat multi-turno.
- Entrada multimodal de imagen: incluye vision tower y proyecciones de vision en BF16.
- Entrada multimodal de audio: la model card menciona audio tower y proyecciones de audio, aunque no se detalla la tarea concreta.
- Razonamiento y matematicas: los benchmarks medidos incluyen GSM8K y ARC-Challenge, lo que indica capacidad de razonamiento aritmetico y de sentido comun.
- Conocimiento general y multilingue: se miden MMLU, KMMLU (coreano) y HAE-RAE (coreano), lo que sugiere soporte al menos de ingles y coreano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: la calibracion excluyo respuestas en modo thinking, pero no se confirma si el modelo base lo soporta en inferencia.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Servicio de chat multimodal en produccion: el modelo acepta imagen y texto y esta empaquetado para vLLM, por lo que puede desplegarse como endpoint conversacional con un consumo de VRAM notablemente inferior al BF16 (unos 7,6 GB en disco frente a los aproximadamente 10 GB en BF16 para 5.100 millones de parametros).
- Asistencia sobre documentos escaneados o capturas: al conservar la torre de vision en BF16, la calidad de extraccion de informacion visual se mantiene mejor que en una cuantizacion completa; util para resumir facturas, tickets o capturas de pantalla en un pipeline de back office.
- Transcripcion y analisis de audio en entornos con GPU limitada: la torre de audio permanece en BF16, lo que permite tareas de comprension de audio sin el coste de memoria del modelo completo sin cuantizar.
- Clasificacion y moderacion de contenido en ingles y coreano: los benchmarks KMMLU y HAE-RAE muestran recuperacion superior al 96% frente a BF16, adecuado para tareas de etiquetado donde el coste por inferencia importa.
- Prototipado e investigacion en una sola GPU: con 7,6 GB de pesos, cabe en GPUs de consumo con 12-16 GB de VRAM, lo que facilita experimentos de multimodalidad sin acceso a clusters.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica resultados de MMLU, GSM8K, ARC, Winogrande, KMMLU y HAE-RAE frente a FP8, AWQ-8bit y NVFP4, lo que lo convierte en una referencia util para decidir el nivel de cuantizacion en un pipeline de serving.
- Despliegue en vLLM con `compressed-tensors`: al usar el formato `pack-quantized`, se integra directamente en el motor de inferencia de vLLM sin conversion adicional.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` sobre vLLM, greedy, few-shot completion sin plantilla de chat. Los porcentajes entre parentesis son la recuperacion frente a BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 55,97 | 55,49 (99,1%) | 56,25 (100,5%) | 53,40 (95,4%) | 50,06 (89,4%) | 54,57 (97,5%) |
| GSM8K (5-shot, strict) | 51,63 | 48,82 (94,6%) | 53,98 (104,6%) | 48,52 (94,0%) | 38,13 (73,9%) | 40,03 (77,5%) |
| ARC-Challenge (0-shot) | 49,57 | 48,04 (96,9%) | 49,23 (99,3%) | 48,63 (98,1%) | 45,48 (91,7%) | 44,80 (90,4%) |
| Winogrande (5-shot) | 62,59 | 60,77 (97,1%) | 62,51 (99,9%) | 61,25 (97,9%) | 58,88 (94,1%) | 60,54 (96,7%) |
| KMMLU (5-shot, direct) | 40,72 | 40,70 (100,0%) | 40,69 (99,9%) | 39,51 (97,0%) | 37,95 (93,2%) | 39,45 (96,9%) |
| HAE-RAE (0-shot) | 62,14 | 62,05 (99,9%) | 62,24 (100,1%) | 59,67 (96,0%) | 57,01 (91,7%) | 60,59 (97,5%) |
| **Media** | **53,77** | **52,65 (97,9%)** | **54,15 (100,7%)** | **51,83 (96,4%)** | **47,92 (89,1%)** | **50,00 (93,0%)** |

Fidelidad frente a BF16 en un conjunto interno mixto ingles/coreano de 100 prompts:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3327 | 1,1833 (+12,6%) |
| Acuerdo top-1 en siguiente token | 89,8% | 99,0% |

La model card advierte explicitamente de que la recuperacion media es del 93,0% y recomienda una build de 8 bits si la calidad es prioritaria.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7,6 GB solo de pesos; con overhead de vLLM (KV cache, activaciones, torres multimodales en BF16) conviene prever 10-12 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para desarrollo y serving de un solo modelo.
- GPU de consumo: cabe en RTX 4090, RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB); en GPUs de 12 GB (RTX 3060, 4070) el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM es el destino principal (formato `compressed-tensors` `pack-quantized`); transformers tambien es compatible. No se confirma soporte de llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card fue medida con vLLM 0.32 el 2026-11-01.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/gemma-4-E2B-it-AWQ-4bit` | 5.104 M | no disponible | AWQ INT4 W4A16 | Apache-2.0 | Hugging Face, vLLM |
| `google/gemma-4-E2B-it` (BF16) | 5.104 M | no disponible | BF16 | Gemma 4 / Apache-2.0 | Hugging Face |
| FP8-dynamic (misma familia) | 5.104 M | no disponible | FP8 | Gemma 4 / Apache-2.0 | Referencia en la model card |
| AWQ-8bit (misma familia) | 5.104 M | no disponible | AWQ INT8 | Gemma 4 / Apache-2.0 | Referencia en la model card |
| NVFP4 / NVFP4A16 (misma familia) | 5.104 M | no disponible | FP4 | Gemma 4 / Apache-2.0 | Referencia en la model card |

No se dispone de informacion sobre modelos de otros autores comparables en tamano y tarea multimodal; no disponible.

## Limitaciones y advertencias

- Degradacion medible a 4 bits: la media de benchmarks cae al 93,0% de BF16 y GSM8K se queda en el 77,5%, con una perdida notable en razonamiento aritmetico. La propia model card recomienda 8 bits si la calidad es critica.
- Perplejidad un 12,6% superior a BF16 y acuerdo top-1 del 89,8%, lo que implica divergencias en generacion libre.
- La calibracion AWQ se hizo con 128 muestras mayoritariamente en coreano y sin modo thinking; el comportamiento en otros idiomas o en modo razonamiento puede desviarse mas de lo medido.
- Revision critica: las descargas anteriores al 2026-11-01 09:57:52 UTC (revision `a412d9b`) eran efectivamente RTN pese a la etiqueta AWQ y deben descartarse.
- Idiomas soportados no declarados en la model card; los benchmarks solo cubren ingles y coreano, por lo que el rendimiento en castellano no esta medido.
- Longitud de contexto no disponible; no se puede garantizar comportamiento en conversaciones largas sin consultar la model card del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay evaluacion especifica de factualidad en la informacion proporcionada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia: Apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma 4 para uso comercial, ya que pueden imponer restricciones adicionales a las de Apache-2.0.
- El tag `endpoints_compatible` no garantiza disponibilidad en Inference Endpoints de Hugging Face; verificar antes de depender de el en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/gemma-4-E2B-it-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
