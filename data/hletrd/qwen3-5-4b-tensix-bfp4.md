# hletrd/Qwen3.5-4B-Tensix-BFP4

## Resumen

Qwen3.5-4B-Tensix-BFP4 es una version cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario hletrd (Xylolabs) para su ejecucion sobre las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer hibrido con atencion clasica y capas Gated DeltaNet, orientado a tareas de agente multimodal nativo (entrada de imagen y texto). Esta variante concreta no altera la arquitectura: solo redondea las capas lineales a un formato de coma flotante por bloques de 4 bits (`ttnn.bfloat4_b`, BFP4) mediante GPTQ, de modo que TT-NN pueda empaquetar los pesos sin un redondeo adicional en el dispositivo.

La relevancia de esta publicacion es de nicho pero tecnica: demuestra un flujo de cuantizacion extremo a extremo (GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano) que reduce el checkpoint de 8,41 GB en BF16 a 3,28 GB empaquetados, con 6,24 bits por peso de media. El resultado se evalua por fidelidad al modelo BF16 (divergencia KL y coincidencia top-1), no por calidad de tarea, y el autor declara explicitamente que las pruebas en hardware Tensix se hicieron sobre el simulador ttsim de Blackhole, no sobre silicio real.

El checkpoint conserva los tensores `mtp` y `visual` en bf16, y solo el modelo de lenguaje fue cuantizado y evaluado. La licencia es Apache 2.0, heredada del modelo base. Es un artefacto pensado para desarrolladores que trabajen con el stack tt-metal/ttnn y quieran validar el empaquetado de pesos BFP4, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Gated DeltaNet (arquitectura Qwen3.5, `qwen3_5`) |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en embeddings, LM head, normas, `mtp` y `visual`. Media de 6,24 bits por peso |
| Idiomas soportados | no disponible (la calibracion uso texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya alineados a la rejilla BFP4); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B combina capas de atencion clasica con capas Gated DeltaNet (un mecanismo de estado recurrente lineal), segun se deduce de la tabla de formatos del checkpoint: 8 capas de atencion (q, k, v, o) y 24 capas DeltaNet (q, k, v, z, a, b, output), ademas de 32 capas de MLP (gate, up, down). El checkpoint incluye tambien un bloque `mtp` (multi-token prediction) y un modulo `visual`, coherente con la etiqueta `image-text-to-text` del pipeline. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

La innovacion de esta variante es puramente de cuantizacion: las proyecciones lineales se redondean con GPTQ usando una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los valores resultantes se almacenan en bf16 pero ya estan sobre la rejilla BFP4, de forma que el empaquetado en TT-NN es exacto y no introduce un segundo redondeo. El autor incluye dos scripts de verificacion (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que el empaquetado no altera ningun valor, y senala que los mismos valores tambien se empaquetan de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.5-4B.
- Entrada multimodal imagen-texto: el checkpoint conserva el modulo `visual` en bf16 y el pipeline declarado es `image-text-to-text`.
- Modo de razonamiento ("thinking"): la evaluacion del autor incluye 7 prompts de razonamiento repetidos con thinking activado.
- Prediccion multi-token mediante el bloque `mtp` (conservado en bf16).
- Capacidades de agente multimodal nativo, segun el titulo del paper citado del equipo Qwen ("Towards Native Multimodal Agents").
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la calibracion cubrio ingles y coreano, pero no se documenta la cobertura linguistica del modelo.
- Capacidades de audio: no disponibles.

## Casos de uso

- Validacion de empaquetado BFP4 en el stack TT-NN: cargar cada matriz con `ttnn.as_tensor` en `bfloat4_b` y comprobar con `pack_tensix.py` que ningun valor cambia tras el empaquetado. Es el uso principal declarado por el autor y permite verificar la cadena de cuantizacion antes de portar modelos mayores.
- Pruebas de humo del demo Qwen3.5/3.6 de tt-metal v0.81.1: el autor construyo las capas 0 a 3 del checkpoint con `MESH_DEVICE=P150` y verifico el empaquetado exacto de proyecciones DeltaNet, atencion y MLP; util para validar configuraciones de malla en Blackhole.
- Investigacion sobre cuantizacion extrema en transformers hibridos: el checkpoint sirve para estudiar como afecta BFP4 a capas DeltaNet frente a capas de atencion clasica, comparando la divergencia KL por tipo de capa.
- Referencia de fidelidad frente a Q4_K_M: permite reproducir la comparacion entre BFP4 (6,24 bits/peso) y Q4_K_M de llama.cpp (5,13 bits/peso) sobre el mismo checkpoint, con las metricas KL y top-1 documentadas.
- Desarrollo de kernels en ttsim: el simulador de Blackhole permite iterar sobre el empaquetado y la ejecucion de capas sin disponer de hardware fisico, usando este checkpoint como carga de trabajo realista de 5.295 millones de parametros.
- Despliegue experimental en transformers sobre GPU: el quickstart con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` permite usar el checkpoint como un modelo de 4B convencional, a costa de perder el beneficio de tamano del empaquetado BFP4.

## Benchmarks y rendimiento

Los unicos datos publicados miden la fidelidad respecto al modelo BF16, no la calidad de tarea.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP4)** | 6,24 | 3,281 | 0,04447 | 89,58 | 33 de 40 | 1 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 | 0 |

Las metricas KL y top-1 cubren 16.312 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificacion automatica mas 7 prompts de razonamiento repetidos con thinking activado (40 en total). El criterio de aceptacion del autor era una KL media como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida adicional; el resultado fue 1,12 veces y 1 respuesta perdida frente a 0. No se midio velocidad en dispositivo. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en transformers: el repo ocupa 10,6 GB y el autor cifra el checkpoint empaquetado en 3,28 GB; en bf16 sobre GPU se comporta como un modelo de 5.295 millones de parametros (unos 10,6 GB de pesos mas overhead de activaciones y cache KV).
- GPU recomendadas para el flujo transformers: no especificadas por el autor; por tamano, una GPU con 16-24 GB de VRAM es suficiente en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. Las pruebas se realizaron con ttnn 0.81.1 sobre ttsim (simulador de Blackhole) y con `MESH_DEVICE=P150` en el demo de tt-metal; no se ejecuto en hardware real.
- Cabe en GPU consumer: si, en bf16 en tarjetas de 16 GB o mas; el beneficio de los 3,28 GB empaquetados solo se materializa en Tensix.
- Opciones de despliegue: transformers (quickstart del autor), TT-NN/tt-metal v0.81.1 (demo Qwen3.5/3.6, con `QWEN36_SPEC=0` para omitir el bloque MTP), ttsim para simulacion. tt-forge (tt-xla) no se ha probado con este checkpoint. tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no se midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Tensix-BFP4 (este) | 5.295 M | no disponible | BFP4 + bf16 mixto | 3,28 GB empaquetado | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-4B (BF16) | 5.295 M | no disponible | bf16 | 8,41 GB | Apache 2.0 | Hugging Face, proposito general |
| Q4_K_M de llama.cpp (mismo checkpoint) | 5.295 M | no disponible | Q4_K_M, 5,13 bits/peso | 2,783 GB | Apache 2.0 | Generado por el autor para comparar |
| Otras variantes cuantizadas de Qwen3.5-4B | 5.295 M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al mismo checkpoint en distintos formatos porque no se dispone de datos de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; los tensores `mtp` y `visual` permanecen en bf16 y no se validaron.
- Las pruebas en Tensix se hicieron exclusivamente sobre el simulador ttsim; no hay evidencia de ejecucion correcta en hardware Wormhole o Blackhole real.
- El demo de tt-metal no lista Qwen3.5-4B entre sus modelos soportados; el autor solo construyo las capas 0 a 3 y no completo una ejecucion de extremo a extremo.
- Dos partes se re-redondean en el demo de tt-metal: el LM head (siempre en bfloat8_b) y el bloque MTP (empaquetado en bfloat8_b, con gate y up en bfloat4_b), lo que rompe la garantia de empaquetado exacto en esas secciones.
- Las metricas publicadas miden cercania al BF16, no calidad de tarea; una KL baja no garantiza buen rendimiento en tareas de razonamiento o codigo.
- Se pierde una respuesta de 40 respecto a BF16 en la evaluacion del autor, y el top-1 baja al 89,58 % frente al 100 % de referencia.
- La calibracion de GPTQ uso solo texto en ingles y coreano; el comportamiento en otros idiomas no esta documentado.
- No se dispone de datos sobre sesgos, tasa de alucinacion ni cobertura linguistica del modelo base en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el artefacto "tal cual, sin garantia" y no esta afiliado ni respaldado por Tenstorrent.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3.5-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del modelo base citada en la evaluacion: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
