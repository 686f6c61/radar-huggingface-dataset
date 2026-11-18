# balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX es una compilacion comunitaria del modelo SenseNova-Loop-9B de SenseNova, convertida a MLX affine 4-bit para su ejecucion en Apple Silicon. El autor, balllvin, parte de su propia build NVFP4 (que a su vez deriva del modelo base) y la porta a MLX, incluyendo el plan de ejecucion con bucles de 56 visitas sobre 32 capas fisicas y los routers mHC. El resultado ocupa 7,4 GB en disco y esta pensado exclusivamente para investigacion.

El modelo base SenseNova-Loop-9B emplea una arquitectura transformer con reutilizacion de capas (looped execution), donde las 32 capas fisicas se recorren 56 veces durante la inferencia. Esta build incorpora dos modificaciones adicionales sobre el base: abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) y un ajuste con el dataset Arete de NousResearch. Segun los parametros reales del safetensors, el checkpoint contiene 3.119.461.248 parametros, si bien la model card se refiere al modelo como "9B", probablemente por el conteo efectivo derivado del plan de bucles.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica poco habitual (looped transformers con routers por capa) y su port a un runtime de Apple; por otro, advierte de que se trata de un modelo abliterated, es decir, sin alineamiento de seguridad, que responde a la mayoria de prompts daninos de un conjunto sellado. No hay resultados de benchmarks de capacidades publicados para esta conversion MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ejecucion en bucle (56 visitas de 32 capas fisicas) y routers mHC |
| Parametros totales | 3.119.461.248 (segun safetensors); la model card lo denomina 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (group 64); cabeza LM 8-bit por defecto, fast head opcional; KV cache 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit; repo de 16,0 GB, pesos de 7,4 GB |

## Arquitectura y entrenamiento

La arquitectura parte de SenseNova-Loop-9B, un transformer con reutilizacion de capas: 32 capas fisicas que se ejecutan en 56 visitas segun el plan de bucles entrenado. La build incorpora routers mHC (multi-head control) por capa y 20 normalizaciones 2x2 alternadas que, segun el autor, forman un mapa de Mobius cuya forma cerrada k-step se compila para la forma de decodificacion. Los gates se mantienen en fp32 pero devuelven bf16, de modo que el tronco corre en bf16. La cabeza LM es 8-bit por defecto, con opcion de fast head.

El entrenamiento original corresponde a SenseNova; esta build aplica abliteration (modificacion de pesos para eliminar la direccion de rechazo) y un ajuste posterior con NousResearch/arete-data-pairs. El corpus QAD de la cadena de builds previas usa HuggingFaceFW/fineweb-edu. No se dispone de datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO en el modelo base. La conversion a MLX se realizo en cuatro pasos: conversion a affine 4-bit (group 64), port del plan de bucles y routers, compilacion de kernels para las normalizaciones y servidor on-demand con warmup, streaming SSE y seleccion de bucles.

## Capacidades

- Generacion de texto conversacional y multi-turno (pipeline text-generation).
- Razonamiento multi-step mediante el plan de bucles entrenado (2 bucles es el ajuste entrenado; 1 bucle degrada la perplejidad).
- Servidor local con streaming SSE y renderizado de la lista completa de mensajes.
- Concurrencia por batching: hasta 8 streams con `--max-batch 8`.
- No se documentan capacidades de tool calling, function calling, vision, audio ni thinking mode explicito.
- Capacidades multilingues: no disponibles.
- Ajuste con Arete (pares de datos de NousResearch), sin detalle publico de que capacidades mejora.

## Casos de uso

- Investigacion de arquitecturas con reutilizacion de capas: permite estudiar en local (Apple Silicon) el comportamiento de un transformer con 56 visitas sobre 32 capas fisicas y routers mHC, comparando NLL y top-1 frente a la ruta iterativa fp32 original.
- Evaluacion de abliteration: util para medir empiricamente el efecto de la eliminacion de la direccion de rechazo sobre respuestas a prompts daninos, usando JailbreakBench y AdvBench como referencia (el autor reporta 93 de 99 prompts daninos respondidos en el conjunto sellado del build NVFP4).
- Despliegue local en portatiles Apple: con 7,4 GB de pesos y 7,5 GB de huella estable, cabe en equipos con 16 GB o 24 GB de memoria unificada, permitiendo prototipos de chatbot sin GPU dedicada.
- Servicio on-demand para demos: el servidor arranca con el modelo, calienta formas comunes y se apaga tras 30 minutos de inactividad, adecuado para notebooks o entornos de investigacion con uso intermitente.
- Generacion de texto por lotes moderados: con `--max-batch 8` alcanza 53,9 tok/s agregados a 4 streams en un M5 Pro, suficiente para tareas de sintesis de texto no interactivas.
- Estudio de cuantizacion: comparar la fidelidad de MLX affine 4-bit (NLL 3,04775 frente a 3,04790 en bf16, top-1 99,4%) frente a NVFP4 y bf16 como caso de referencia para pipelines de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta conversion MLX. El autor indica que la tabla sellada de refusal/MMLU/NLL esta en la model card del build NVFP4 y no se re-ejecuto sobre MLX.

Datos de rendimiento y fidelidad local publicados:

| Metrica | Valor |
|---|---|
| NLL WikiText (160 posiciones, router + tronco bf16) | 3,04790 (frente a 3,04762 fp32, +0,00028) |
| Top-1 router + tronco bf16 | 98,1% |
| NLL con cabeza 8-bit por defecto | 3,04775 (frente a 3,04790 bf16, -0,00015) |
| Top-1 con cabeza 8-bit | 99,4% |
| Fast head: delta NLL vs bf16 | -0,00079 |
| Fast head: top-1 | 199/199 |
| Fast head: KL medio | 0,000544 |
| NLL con `--loops 1` | 3,921 (frente a 3,041 con 2 bucles) |

Rendimiento en M5 Pro, 64 GB (carga de 7-15 por otro trabajo, cifras conservadoras):

| Modo | Huella estable | Decode tok/s | End-to-end 64 tok | TTFT |
|---|---:|---:|---:|---:|
| default, cabeza 8-bit | 7,5 GB | 20,8 | 18,0 | 0,44 s |
| `--fast-head` | ~8,0 GB | 26,6 | 22,8 | 0,25-0,32 s |

Concurrencia con `--fast-head` y `--max-batch 8`: 22,6 / 33,2 / 53,9 / 51,3 tok/s totales a 1 / 2 / 4 / 8 streams (por stream 22,6 / 16,6 / 13,5 / 6,4-11,3). El build MLX original de estos pesos media 8,1 tok/s.

## Requisitos de hardware

- Memoria: 7,4 GB de pesos en MLX affine 4-bit; huella estable de 7,5 GB por defecto y ~8,0 GB con fast head.
- Cabe en Apple Silicon con memoria unificada de 16 GB o superior; las mediciones del autor son en un M5 Pro con 64 GB.
- No hay datos de VRAM para GPU NVIDIA/AMD; el formato es MLX, especifico de Apple Silicon.
- Despliegue: servidor incluido (`tools/serve.py`) con MLX y mlx-lm; opciones `--kv-bits 8`, `--max-batch`, `--loops`, `--head-bits`, `--fast-head`, `--idle-exit`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT 0,44 s (default) y 0,25-0,32 s (fast head); decode 20,8-26,6 tok/s en un solo stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | 3.119.461.248 | no disponible | MLX safetensors 4-bit | Apache-2.0 | Abliterated + Arete; 7,4 GB; ~20-27 tok/s en M5 Pro |
| balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4 | no disponible | no disponible | NVFP4 | Apache-2.0 | Build fuente; tabla sellada de refusal/MMLU/NLL |
| sensenova/SenseNova-Loop-9B | no disponible (denominado 9B) | no disponible | safetensors | Apache-2.0 | Modelo base sin abliteration ni Arete |
| balllvin/SenseNova-Loop-9B-NVFP4-MLX | no disponible | no disponible | MLX 4-bit | Apache-2.0 | Build QAD base, sin abliteration ni Arete |

No se dispone de comparativas con modelos de otras familias (tamano o tarea equivalente) en la informacion proporcionada.

## Limitaciones y advertencias

- Abliteration: el modelo no esta alineado en seguridad; responde 93 de 99 prompts daninos del conjunto sellado. No debe usarse en produccion orientada al publico sin filtros externos.
- La tabla sellada de refusal/MMLU/NLL corresponde al build NVFP4 y no se re-ejecuto sobre esta conversion MLX; la validacion local se limita a 160 posiciones de WikiText.
- `--loops 1` no es el modelo entrenado: la NLL sube de 3,041 a 3,921. Usar 2 bucles en cualquier evaluacion seria.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Licencia Apache-2.0 para los pesos, pero los datos Arete no declaran licencia; el autor indica que sus creadores los publicaron publicamente. Verificar antes de uso comercial.
- Build comunitaria independiente, no afiliada a los autores del modelo base.
- Solo para Apple Silicon via MLX; sin soporte documentado para CUDA, ROCm, vLLM o llama.cpp.
- Cifras de rendimiento medidas en un unico M5 Pro con carga externa; no son representativas de todos los equipos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Build fuente NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Build abliterated NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Build QAD base NVFP4: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Build QAD base MLX 4-bit: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Dataset Arete: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- AdvBench: https://github.com/llm-attacks/llm-attacks
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
