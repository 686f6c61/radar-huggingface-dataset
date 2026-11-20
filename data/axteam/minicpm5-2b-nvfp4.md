# axteam/MiniCPM5-2B-NVFP4

## Resumen

MiniCPM5-2B-NVFP4 es una cuantizacion de 4 bits en formato NVFP4 (W4A4, FP4 E2M1) del modelo denso openbmb/MiniCPM5-2B, publicada por el usuario axteam. El modelo base es un transformer denso de arquitectura Llama, solo texto, con 2.516.756.480 parametros totales, desarrollado por OpenBMB. Esta version concreta no introduce capacidades nuevas: su proposito es reducir el peso en disco a unos 2,2 GB y habilitar la aceleracion nativa FP4 en GPUs Blackwell mediante kernels de vLLM.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de cuantizacion NVFP4 con compressed-tensors y su integracion en vLLM 0.32. Por otro, y mas importante para quien evalue el modelo, la propia model card documenta una degradacion medible y sustancial frente al original en BF16: una recuperacion media del 85,6% en el conjunto de benchmarks y un aumento del 34,1% en perplejidad, con solo un 79,1% de acuerdo top-1 en el siguiente token. Es, por tanto, un artefacto util para pruebas de rendimiento en hardware Blackwell, pero no recomendable cuando la calidad es prioritaria.

La licencia es Apache-2.0, heredada del modelo base, y el checkpoint se distribuye en safetensors con el esquema `nvfp4-pack-quantized` de compressed-tensors. La fecha de actualizacion del repositorio es el 2 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), solo texto |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos de la model card usan `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos FP4 E2M1 con grupo de 16 y escala FP8, activaciones FP4); embeddings, LM head y RMSNorms en BF16 (aprox. 21% de los parametros) |
| Idiomas soportados | No disponible (la evaluacion interna usa un conjunto mixto ingles/coreano; los benchmarks incluyen KMMLU y HAE-RAE) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura Llama, sin mezcla de expertos ni componentes de estado recurrente. Esta version es una cuantizacion post-entrenamiento (PTQ), sin reentrenamiento: se aplica suavizado AWQ sobre un conjunto de calibracion de 256 muestras antes del redondeo a FP4. Los pesos y las activaciones se almacenan en FP4 E2M1, con grupos de 16 y escala FP8; quedan en BF16 las embeddings de tokens, la LM head y todas las RMSNorms, que representan alrededor del 21% de los parametros de esta build. El tokenizer y el `chat_template` son identicos a los del original.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO. Tampoco hay datos sobre innovaciones tecnicas del modelo original mas alla de la plantilla de chat, que activa por defecto un modo de razonamiento (thinking) desactivable mediante `chat_template_kwargs={"enable_thinking": False}`. La innovacion de este repositorio es exclusivamente de inferencia: el uso de kernels FP4 nativos en GPUs Blackwell (sm100, sm103, sm120) a traves de vLLM 0.32.0.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla compatible con la API de OpenAI a traves de vLLM.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat, desactivable por peticion.
- Razonamiento y conocimiento general medido en MMLU (variante generativa, 5-shot).
- Razonamiento matematico de varios pasos medido en GSM8K (5-shot, strict).
- Razonamiento logico y de sentido comun medido en ARC-Challenge y Winogrande.
- Cobertura multilingue parcial: los benchmarks incluyen KMMLU (coreano) y HAE-RAE (coreano), ademas de pruebas en ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Pruebas de rendimiento en hardware Blackwell: desplegar el modelo con `vllm serve axteam/MiniCPM5-2B-NVFP4` en una B200 o RTX 50xx para medir throughput y latencia de los kernels FP4 nativos frente a builds FP8 o AWQ-8bit con el mismo harness.
- Servicio de chat de baja latencia en GPUs consumer de la serie RTX 50xx: con solo 2,2 GB de pesos, el modelo deja la mayor parte de la VRAM libre para cache KV y peticiones concurrentes, lo que permite atender varios usuarios simultaneos en una sola tarjeta.
- Prototipado rapido de asistentes conversacionales: el formato OpenAI-compatible de vLLM permite sustituir el endpoint por otro modelo sin cambiar el codigo cliente, util para validar interfaces antes de invertir en modelos mayores.
- Evaluacion comparativa de tecnicas de cuantizacion: la model card publica resultados del mismo harness para BF16, FP8-dynamic, AWQ-8bit, NVFP4A16, NVFP4 y AWQ-4bit, lo que convierte este checkpoint en una referencia para reproducir estudios de degradacion por precision.
- Generacion de texto en ingles y coreano con requisitos de memoria minimos: los benchmarks KMMLU y HAE-RAE indican cierto soporte de coreano, aunque con recuperacion inferior al 80% frente a BF16 en HAE-RAE.
- Despliegue en entornos con presupuesto de memoria ajustado: los 2,2 GB en disco y el esquema W4A4 permiten ejecutar el modelo en GPUs de gama media-alta de la generacion Blackwell sin necesidad de tensor parallelism.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, decodificacion greedy y prompts estilo completion sin plantilla de chat. MMLU corresponde a la variante generativa, no comparable con puntuaciones por verosimilitud. Los porcentajes entre parentesis indican la recuperacion respecto al original en BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 (este repo) | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generativa) | 59,74 | 59,56 (99,7%) | 59,86 (100,2%) | 56,81 (95,1%) | 53,50 (89,5%) | 56,31 (94,3%) |
| GSM8K (5-shot, strict) | 73,01 | 71,27 (97,6%) | 73,01 (100,0%) | 65,20 (89,3%) | 55,04 (75,4%) | 65,96 (90,3%) |
| ARC-Challenge (0-shot) | 43,94 | 44,20 (100,6%) | 43,86 (99,8%) | 43,43 (98,8%) | 40,10 (91,3%) | 44,88 (102,1%) |
| Winogrande (5-shot) | 64,40 | 63,22 (98,2%) | 64,40 (100,0%) | 62,75 (97,4%) | 59,04 (91,7%) | 62,12 (96,4%) |
| KMMLU (5-shot, direct) | 37,65 | 38,38 (101,9%) | 38,27 (101,7%) | 35,56 (94,4%) | 34,06 (90,5%) | 30,73 (81,6%) |
| HAE-RAE (0-shot) | 39,05 | 38,13 (97,7%) | 39,14 (100,2%) | 35,38 (90,6%) | 30,16 (77,2%) | 36,94 (94,6%) |
| **Media** | **52,97** | **52,46 (99,0%)** | **53,09 (100,2%)** | **49,85 (94,1%)** | **45,32 (85,6%)** | **49,49 (93,4%)** |

Evaluacion de fidelidad frente al original en BF16 sobre un conjunto interno mixto ingles/coreano de 100 prompts, con respuestas greedy del BF16 puntuadas bajo cada build:

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor es mejor) | 2,1439 | 1,5988 (+34,1%) |
| Acuerdo top-1 en el siguiente token | 79,1% | 98,9% |

## Requisitos de hardware

- VRAM para pesos: 2,2 GB. Hay que sumar la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs con soporte FP4 completo (W4A4): B200 y GB200 (sm100), B300 (sm103), RTX 50xx y RTX PRO 6000 (sm120). Solo se valido en B200 segun la model card.
- GPUs Turing a Hopper (sm75-90): funcionan en modo solo pesos FP4, mas lento, con aviso de vLLM. V100 (sm70) no esta soportado.
- Runtime: vLLM 0.32.0 (probado). Requiere Python 3.11-3.14, torch 2.13 con build CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0 fijado por vLLM; no actualizar compressed-tensors por separado.
- Alternativa sin vLLM: transformers >=4.56.0 con compressed-tensors >=0.15.0. En transformers 4.x el tokenizer devuelve `token_type_ids`, que el modelo no acepta; hay que eliminarlo antes de llamar a `generate`.
- Despliegue: servidor OpenAI-compatible con `vllm serve`, inferencia offline con `LLM` de vLLM, y `--tensor-parallel-size N` si los pesos no caben en una GPU (poco probable dado su tamano).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad media en los benchmarks de la model card | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-NVFP4 (este repo) | 2,52 B | No disponible (ejemplos a 32.768) | 45,32 (85,6% del BF16) | Apache-2.0 | NVFP4, compressed-tensors, safetensors |
| MiniCPM5-2B en BF16 | 2,52 B | No disponible | 52,97 (referencia) | Apache-2.0 | BF16, safetensors |
| MiniCPM5-2B AWQ-8bit | 2,52 B | No disponible | 53,09 (100,2% del BF16) | Apache-2.0 | AWQ INT8 |
| MiniCPM5-2B FP8-dynamic | 2,52 B | No disponible | 52,46 (99,0% del BF16) | Apache-2.0 | FP8 |

No se dispone de datos de benchmarks de modelos de otros desarrolladores en la informacion proporcionada, por lo que la comparativa se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Degradacion de calidad notable: recuperacion media del 85,6% frente a BF16, con caidas especialmente severas en GSM8K (75,4%) y HAE-RAE (77,2%). La propia model card recomienda builds de 8 bits si la calidad es prioritaria.
- Perplejidad un 34,1% superior al original y solo un 79,1% de acuerdo top-1 en el siguiente token sobre el conjunto interno de evaluacion.
- Dependencia estricta de versiones: vLLM 0.32.0 con compressed-tensors 0.17.0 y transformers >=5.16.1,<5.20. Actualizar compressed-tensors por separado puede romper la carga del checkpoint, guardado originalmente con 0.19.0.
- Rendimiento pleno solo en Blackwell; en Turing, Ampere, Ada y Hopper el modo es solo pesos FP4 y mas lento, y V100 no esta soportado.
- El modo thinking esta activado por defecto en la plantilla de chat, lo que incrementa los tokens generados si no se desactiva explicitamente.
- Riesgo de alucinacion y sesgos: no hay informacion especifica en la model card; al ser un modelo de 2,5 B parametros, la fiabilidad factografica es limitada y debe validarse en produccion.
- Idiomas: no se declara una lista oficial; el soporte de coreano medido es debil en esta cuantizacion (30,16 en HAE-RAE) y no hay datos de otros idiomas distintos del ingles.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base openbmb/MiniCPM5-2B y cumplir las licencias de vLLM y compressed-tensors.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin validacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/MiniCPM5-2B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
