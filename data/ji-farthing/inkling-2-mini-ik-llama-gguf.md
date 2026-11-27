# ji-farthing/Inkling-2-Mini-ik-llama-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Thinking Machines, distribuido bajo licencia Apache 2.0. Esta ficha describe en concreto la coleccion de cuantizaciones GGUF publicada por el usuario ji-farthing bajo el identificador `ji-farthing/Inkling-2-Mini-ik-llama-GGUF`, pensada exclusivamente para el motor de inferencia ik_llama.cpp. El repositorio contiene ocho cuantizaciones del checkpoint original (desde NVFP4-FP8B128 de 19 GB hasta IQ1_KT de 6,8 GB), ademas de dos ficheros de un modelo borrador DFlash2 para decodificacion especulativa.

El modelo base es `thinkingmachines/Inkling-2-Mini`, un MoE con aproximadamente 26.070 millones de parametros totales en los ficheros GGUF (494.983.424 parametros en safetensors segun el dato de Hugging Face, cifra que no coincide con la reportada por el autor de las cuantizaciones y que conviene tratar con cautela). La relevancia de esta publicacion radica en que ofrece una via practica para ejecutar el modelo en hardware de consumo mediante cuantizaciones agresivas con imatrix, manteniendo una divergencia controlada respecto al checkpoint BF16 (KLD de 0,0024 en NVFP4 frente a 0,1817 en IQ1_KT).

El detalle tecnico mas destacable es la inclusion de un modelo borrador de difusion por bloques (DFlash2) que acelera la decodificacion entre un 55 % y un 65 % en prompts de tipo GSM8K y codigo, con una media de unas 5 tokens aceptadas por ronda de especulacion. Todo el material esta orientado a un publico que ya opera ik_llama.cpp y comprende el trade-off entre tamano, calidad y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), segun el modelo base Inkling-2-Mini; detalles de capas y atencion no disponibles |
| Parametros totales | 26,07 mil millones (segun el autor de las cuantizaciones, sobre los ficheros GGUF); 494.983.424 en safetensors segun metadatos de Hugging Face (dato discrepante) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de servidor usa `-c 65536` |
| Tipos de cuantizacion | NVFP4-FP8B128, IQ4_KS, IQ4_KT, IQ3_KS, IQ3_KT, IQ2_KS, IQ2_KT, IQ1_KT (mas BF16 e IQ4_KS para el borrador DFlash2) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivo de ik_llama.cpp; no carga en llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer con arquitectura Mixture-of-Experts, segun se deduce de la receta de cuantizacion del autor: las capas 0-19 contienen expertos enrutados (routed experts) almacenados como NVFP4 en el checkpoint original, mientras que las capas 20-23 usan MXFP8 y se convierten a `F8_E4M3_B128`. El resto de tensores permanece en BF16 y F32. El autor menciona ademas tensores de atencion especificos (`attn_sink_proj`, `attn_k_conv_proj`, `attn_v_conv_proj`, `attn_rel`), lo que sugiere mecanismos de atencion con sink y convoluciones en las proyecciones K/V, aunque no se detalla su funcionamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica documentada en esta publicacion es la decodificacion especulativa mediante DFlash2, un borrador de difusion por bloques (block-diffusion draft) que propone varios tokens por paso y deja que el modelo objetivo los verifique. El borrador se distribuye en BF16 (1,0 GB) e IQ4_KS (332 MB) y requiere las opciones `--spec-type dflash` y `--spec-ckpt-mode per-step` de ik_llama.cpp. Las cuantizaciones se generaron con `llama-quantize --allow-requantize --imatrix` a partir del fichero NVFP4-FP8B128, usando una imatrix de 200 fragmentos de 512 tokens calculada sobre el mismo fichero.

## Capacidades

- Generacion de texto conversacional y text-only: la torre de vision no esta incluida en estos ficheros.
- Razonamiento y matematicas: los benchmarks de velocidad usan prompts de GSM8K, lo que confirma uso para problemas aritmeticos de varios pasos.
- Generacion de codigo: el autor reporta pruebas con prompts de codigo en la evaluacion del borrador especulativo.
- Extraccion de informacion: se menciona un prompt de extraccion en las mediciones de throughput.
- Soporte de plantillas de chat mediante `--jinja`, lo que habilita conversaciones multi-turno con el formato del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documentan capacidades de tool calling, function calling, agentes, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU unica: el fichero IQ4_KS de 14,5 GB cabe en GPUs de 24 GB (RTX 4090, A10G) dejando margen para el contexto, con una divergencia de solo 0,0092 de KLD respecto al BF16.
- Inferencia en hardware de gama alta con NVFP4: el fichero NVFP4-FP8B128 de 19 GB aprovecha el soporte de FP4 nativo en GPUs Blackwell (GB10, B200) y ofrece la mayor fidelidad (97,8 % de coincidencia en el token superior).
- Servicio conversacional de bajo coste: con IQ2_KT (8,2 GB) el modelo cabe en GPUs de 12 GB como la RTX 3060 o la RTX 4070, a costa de un KLD de 0,1054 y un 87,0 % de coincidencia en el token superior.
- Aceleracion de pipelines de generacion larga: el borrador DFlash2 IQ4_KS eleva la decodificacion de 32,2 a 52,9 t/s en GSM8K y de 32,4 a 56,0 t/s en prompts de codigo, lo que reduce el coste por token en tareas de codigo y extraccion.
- Ejecucion con expertos en RAM: la opcion `-ot exps=CPU` permite servir el modelo cuando la VRAM no alcanza para el fichero completo, manteniendo los expertos enrutados en memoria del sistema.
- Evaluacion comparativa de cuantizaciones: la tabla de KLD, same-top y PPL permite elegir el punto de la curva tamano-calidad adecuado para un presupuesto de hardware concreto, con PPL de referencia BF16 de 8,205 sobre wikitext-2.
- Prototipado de investigacion en decodificacion especulativa: los ficheros DFlash2 permiten reproducir el esquema de verificacion de borradores de difusion por bloques sobre un MoE real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos numericos son metricas de fidelidad de cuantizacion y de velocidad de decodificacion.

Metricas de cuantizacion (KLD y same-top frente a BF16 en transformers, sobre 16 x 512 tokens de wikitext-2 `wiki.test.raw`; PPL BF16 de referencia 8,205; medido con ik_llama.cpp `main` en `1180df7` sobre NVIDIA GB10, `-ngl 99 -fa on`):

| Fichero | Tamano | BPW | KLD | Same top | PPL |
|---|---:|---:|---:|---:|---:|
| NVFP4-FP8B128 | 19,0 GB | 5,83 | 0,0024 | 97,8 % | 8,201 |
| IQ4_KS (v2) | 14,5 GB | 4,45 | 0,0092 | 95,6 % | 8,212 |
| IQ4_KT (v2) | 13,7 GB | 4,22 | 0,0128 | 94,7 % | 8,259 |
| IQ3_KS (v2) | 12,0 GB | 3,67 | 0,0247 | 93,1 % | 8,346 |
| IQ3_KT (v2) | 11,0 GB | 3,37 | 0,0309 | 92,9 % | 8,331 |
| IQ2_KS (v2) | 9,0 GB | 2,76 | 0,0894 | 87,4 % | 8,827 |
| IQ2_KT (v2) | 8,2 GB | 2,51 | 0,1054 | 87,0 % | 8,931 |
| IQ1_KT (v2) | 6,8 GB | 2,08 | 0,1817 | 83,6 % | 9,595 |

Velocidad de decodificacion con decodificacion especulativa (NVFP4-FP8B128 como objetivo, `-temp 0`, 20 prompts GSM8K de hasta 256 tokens, media de dos ejecuciones, NVIDIA GB10, ik_llama.cpp `main` en `1621473`):

| Borrador | t/s en decodificacion | Tokens por ronda |
|---|---:|---:|
| Ninguno (solo objetivo) | 32,2 | - |
| DFlash2 BF16 | 49,8 | 5,03 |
| DFlash2 IQ4_KS | 52,9 | 4,98 |

El autor reporta ademas 56,0 t/s (codigo) y 50,1 t/s (extraccion) con el borrador IQ4_KS, frente a 32,4 y 31,8 t/s sin borrador; en un prompt de historia el borrador rinde por debajo del objetivo solo (28,0 frente a 32,2 t/s).

## Requisitos de hardware

- VRAM estimada para inferencia: desde unos 7-8 GB para IQ1_KT (6,8 GB de pesos) hasta unos 20 GB para NVFP4-FP8B128 (19,0 GB), mas el espacio de cache KV segun contexto.
- GPUs recomendadas: NVIDIA GB10 (hardware de referencia de las mediciones), GPUs Blackwell con soporte FP4 para el fichero NVFP4, y GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB) para IQ4_KS e IQ4_KT.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con IQ4_KS o IQ4_KT; en RTX 4070/3060 de 12 GB con IQ2_KS o IQ2_KT; en GPUs de 8 GB con IQ1_KT.
- Si la VRAM no alcanza para el fichero completo, `-ot exps=CPU` mantiene los expertos enrutados en RAM del sistema.
- Opciones de despliegue: exclusivamente ik_llama.cpp `main` en `1180df7` o posterior (soporte de Inkling 2 Mini en el PR #2967); el borrador DFlash2 requiere el PR #2994 (fusionado el 2026-11-25). No carga en llama.cpp ni se documenta soporte para vLLM, TGI u Ollama.
- Throughput medido: 32,2 t/s en decodificacion sin borrador y 52,9 t/s con DFlash2 IQ4_KS sobre GB10 con el objetivo NVFP4; el autor advierte que la ganancia depende del texto.
- El borrador BF16 ocupa 1,0 GB adicionales; el IQ4_KS, 332 MB.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (MoE de ~26B, licencia Apache 2.0, cuantizaciones GGUF para ik_llama.cpp) en los datos proporcionados. La unica comparacion interna posible es entre las propias cuantizaciones del repositorio, resumida en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha, GGUF) | 26,07 mil millones (MoE) | no disponible | Apache 2.0 | GGUF para ik_llama.cpp | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo texto: la torre de vision del modelo base no esta incluida en estos ficheros.
- Compatibilidad restringida: los GGUF no cargan en llama.cpp; requieren ik_llama.cpp `main` en `1180df7` o posterior, y el borrador DFlash2 exige el PR #2994 o posterior.
- El widget de descargas de Hugging Face no reconoce los ficheros `_KS` y `_KT`; hay que descargarlos mediante los enlaces directos de la tabla del repositorio.
- Perdida de calidad creciente en cuantizaciones bajas: IQ1_KT presenta un KLD de 0,1817 y solo un 83,6 % de coincidencia en el token superior, con PPL de 9,595 frente a 8,205 en BF16; no es recomendable para produccion sensible a la fidelidad.
- La aceleracion especulativa no es uniforme: en prompts narrativos el borrador puede ser mas lento que el objetivo solo (28,0 frente a 32,2 t/s).
- Discrepancia en el recuento de parametros entre los metadatos de Hugging Face (494.983.424) y la cifra del autor de las cuantizaciones (26,07 mil millones); conviene verificar el checkpoint base antes de dimensionar el hardware.
- No se documentan sesgos conocidos, tasas de alucinacion, idiomas soportados ni limitaciones de contexto mas alla del ejemplo de 65.536 tokens; esta informacion no esta disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los ficheros derivados deben conservar el aviso de licencia correspondiente.
- Las mediciones de rendimiento se hicieron en una unica plataforma (NVIDIA GB10) y con una version concreta de ik_llama.cpp; los valores en otro hardware pueden diferir.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ji-farthing/Inkling-2-Mini-ik-llama-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint de release del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Modelo borrador DFlash2 original: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR de soporte de Inkling 2 Mini: https://github.com/ikawrakow/ik_llama.cpp/pull/2967
- PR de soporte de DFlash2: https://github.com/ikawrakow/ik_llama.cpp/pull/2994
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Imatrix: https://huggingface.co/ji-farthing/Inkling-2-Mini-ik-llama-GGUF/blob/main/inkling2-mini-r1.imatrix
