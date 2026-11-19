# Grawnch/Hy4-Flash-WV-v6.4-2.50bpw-SM120

## Resumen

Hy4-Flash-WV-v6.4-2.50bpw-SM120 es una cuantizacion bare-metal del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario Grawnch. El modelo base es un Mixture of Experts (MoE) multimodal de gran escala con 283B parametros totales, de los cuales 156B corresponden al backbone no-Engram, 127B a un modulo Engram de memoria externa, 0,85B a un drafter especulativo DFly2 y un ViT SigLIP2 para vision. La cuantizacion reduce el checkpoint BF16 original de aproximadamente 566 GB a 117,19 GB en disco, con 52,51 GB de pesos en VRAM (backbone, drafter y ViT) y el resto en sidecars Engram mapeados en host via mmap.

La relevancia de esta publicacion es que permite ejecutar un MoE de 283B en una sola GPU Blackwell SM120 (RTX PRO 6000 de 96 GB) o, mediante el flag `--force-32gb`, en una RTX 5090 de 32 GB. Emplea una cuantizacion WV-v6.4 a 2,50 bits por peso con VQ8 y GPTQ Schur, e incluye decodificacion especulativa con el drafter DFly2 compartiendo la cache KV MLA del modelo objetivo.

El paquete se distribuye con el servidor `qfn_sm120_unified` v22.4.0, que expone una API compatible con OpenAI y Open WebUI, y conserva las capacidades multimodales (image-text-to-text), el modo de razonamiento (`reasoning_effort`) y el soporte de tool calling del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer con MLA, modulo Engram, drafter DFly2 y ViT SigLIP2) |
| Parametros totales | 283B (156B backbone no-Engram + 127B Engram + 0,85B DFly2 + ViT SigLIP2) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se reportan pruebas de recall multi-needle a 20K+ tokens) |
| Tipos de cuantizacion | WV-v6.4 a 2,50 bpw (VQ8 + GPTQ Schur); Engram en fp8_exact via mmap |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (tencent-hy-license) |
| Formato de pesos | safetensors (backbone, ViT); sidecars Engram fp8_exact; paquete custom `qfn_sm120_unified` |
| Tamano en disco | 117,19 GB total (52,51 GB backbone + drafter + ViT) |
| GPU objetivo | Blackwell SM120 (sm_120 SASS-only): RTX PRO 6000 96 GB y RTX 5090 32 GB |
| Servidor incluido | qfn_sm120_unified v22.4.0 (API OpenAI + Open WebUI) |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un MoE multimodal que combina un backbone transformer con atencion MLA (Multi-head Latent Attention), un modulo Engram de 127B parametros que actua como memoria externa mapeada fuera de la VRAM, un drafter especulativo DFly2 de 0,85B y un ViT SigLIP2 para el procesamiento de imagenes. La cuantizacion WV-v6.4 aplica 2,50 bits por peso sobre los pesos routed del MoE mediante una combinacion de cuantizacion vectorial VQ8 (4-Coset Interstitial) y GPTQ con descomposicion de Schur en la parte posterior.

La innovacion tecnica principal de esta release es el drafter DFly2 recalibrado en bucle cerrado, que comparte la cache KV MLA dispersa del modelo objetivo (0,00 GB de KV adicional para el drafter) y alcanza una paridad exacta de 96/96 tokens en modo greedy, con rejection sampling estocastico sin perdida (0,0 KLD, tau media de 2,5). Se reporta tambien un arbol especulativo hibrido SAM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable mediante `reasoning_effort` (`'high'`, `'max'`, `'no_think'`).
- Razonamiento visible en streaming con etiquetas `<think:opensource>...</think:opensource>`, expuesto como `delta.reasoning_content` o `--inline-think`.
- Tool calling y function calling con `<tool_calls:opensource>` y conversion de tipos mediante JSON Schema.
- Generacion restringida por gramatica (JSON Schema FSM) validada en 4/4 casos sobre GPU.
- Procesamiento multimodal image-text-to-text con pase de vision exacto en BF16 via `vit.safetensors`.
- Decodificacion especulativa con paridad greedy 96/96 respecto a la decodificacion estandar.
- Recall multi-needle a 20K+ tokens con 3/3 de acierto exacto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de 283B en una unica GPU de 96 GB: el modelo cabe en una RTX PRO 6000 con 52,51 GB de pesos en VRAM, lo que permite servir un modelo de gran escala sin cluster multi-GPU.
- Inferencia en estacion de trabajo con RTX 5090: con `--force-32gb` el modelo opera con un pico de 24,547 GiB de VRAM y 3,56 tok/s a batch 1 (14,23 tok/s a batch 4), adecuado para prototipado y evaluacion local.
- Asistentes con razonamiento explicito: el modo `reasoning_effort` y el streaming de `<think>` permiten construir interfaces que muestran el razonamiento del modelo, util para depuracion y para aplicaciones educativas.
- Agentes con tool calling: el soporte de `<tool_calls:opensource>` y JSON Schema FSM permite integrar el modelo en pipelines de agentes que requieren salidas estructuradas y validas.
- Procesamiento de documentos con imagenes: el pipeline image-text-to-text con ViT SigLIP2 en BF16 exacto sirve para tareas de comprension de capturas, formularios o diagramas combinadas con texto.
- Analisis de contexto largo: el recall 3/3 a 20K+ tokens y la cache MLA con IndexPool y SWA-512 lo hacen util para resumen y QA sobre documentos extensos.
- Servicio con API compatible OpenAI: el servidor `qfn_sm120_unified` expone endpoints OpenAI y Open WebUI, lo que facilita sustituir backends en aplicaciones existentes.
- Aceleracion de inferencia interactiva: la decodificacion especulativa con DFly2 alcanza 47,81 tok/s a batch 1 y 235,1 tok/s a batch 32 en RTX PRO 6000, adecuado para chat de baja latencia y serving por lotes.

## Benchmarks y rendimiento

| Metrica | tencent/Hy4-flash (BF16) | AngelSlim/Hy4-flash-GGUF (IQ2_AH) | Esta release (WV-v6.4 2.50 bpw SM120) |
|---|---|---|---|
| Tamano backbone + drafter + ViT | ~312 GB (8x GPU) | ~134 GB (incl. Engram) | 52,51 GB (1x 96 GB o `--force-32gb` RTX 5090) |
| Tamano total en disco | ~566 GB | ~134 GB | 117,19 GB (0,00 GiB Engram en VRAM) |
| PPL / KLD blind-val 2K vs BF16 | 13,3976 / 0,0000 | no disponible | 11,3071 (-2,0905) / 0,48475 |
| PPL / KLD blind-val 8K (IndexPool + SWA-512) | 34,8908 / 0,0000 | no disponible | 30,3783 (-4,5125) / 0,88101 |
| Recall multi-needle 20K+ | 3/3 | no disponible | 3/3 (100%) |
| Paridad greedy arbol hibrido vs M=1 | no disponible | no disponible | 96/96 (100,0%) |
| Validez JSON Schema FSM en GPU | no disponible | no disponible | 4/4 (100,0%) |
| TTFT SSE HTTP (128 / 2048 / 8192 tok, frio / cacheado) | no disponible | no disponible | 2513,16 / 4264,58 / 13227,14 ms (cacheado 8K: 242,57 ms) |
| TPS decodificacion especulativa (RTX PRO 6000, B=1 / B=32) | no disponible | no disponible | 47,81 / 235,1 tok/s |
| Consumo `--force-32gb` (RTX 5090, < 32 GiB) | OOM | OOM (VRAM) | 14,23 tok/s a B=4 (3,56 tok/s a B=1, pico 24,547 GiB, paridad 32/32) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 52,51 GB de pesos backbone + drafter + ViT; el modulo Engram (127B) se mapea en host via mmap con 0,00 GiB de VRAM.
- GPU de 96 GB: RTX PRO 6000 Blackwell (SM120). Throughput reportado de 47,81 tok/s a batch 1 y 235,1 tok/s a batch 32 con decodificacion especulativa.
- GPU consumer: RTX 5090 de 32 GB con `--force-32gb`, pico de 24,547 GiB y 3,56 tok/s a batch 1 (14,23 tok/s a batch 4).
- GPU no soportadas: la release es SASS-only para `sm_120`, por lo que no funciona en arquitecturas anteriores (A100, H100, RTX 4090) sin recompilacion.
- Espacio en disco: 117,19 GB para el repositorio completo, incluyendo sidecars Engram.
- Despliegue: servidor propietario `qfn_sm120_unified` v22.4.0 (wheel `cp313-cp313-linux_x86_64`), con API compatible OpenAI y Open WebUI. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: TTFT de 2513,16 ms (128 tok, frio), 4264,58 ms (2048 tok) y 13227,14 ms (8192 tok), con 242,57 ms en cacheado a 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano desplegable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-WV-v6.4-2.50bpw-SM120 | 283B totales (156B backbone + 127B Engram) | no disponible | 52,51 GB VRAM / 117,19 GB disco | Tencent Hy License | Hugging Face (Grawnch) |
| tencent/Hy4-flash (BF16) | 283B totales | no disponible | ~312 GB en 8x GPU | Tencent Hy License | Hugging Face (Tencent) |
| AngelSlim/Hy4-flash-GGUF (IQ2_AH) | 283B totales | no disponible | ~134 GB | Tencent Hy License | Hugging Face (AngelSlim) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,50 bpw introduce degradacion medible: KLD de 0,48475 a 2K y 0,88101 a 8K frente al BF16, aunque la perplejidad reportada es inferior a la del modelo base en las pruebas del autor.
- Restriccion de hardware severa: solo funciona en GPUs Blackwell `sm_120`; no es ejecutable en A100, H100 ni RTX 4090 sin recompilacion del binario.
- El servidor `qfn_sm120_unified` es propietario y sin codigo fuente ("source-free"), lo que limita la auditabilidad y la portabilidad.
- Requiere Python 3.13 y Linux x86_64 segun el wheel distribuido.
- Licencia Tencent Hy License: es necesario revisar los terminos para uso comercial, ya que se trata de una licencia "other" heredada del modelo base.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran escala; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue mas alla de lo que herede el modelo base.
- Longitud de contexto oficial no disponible; las pruebas de recall a 20K+ tokens no implican un limite contractual del modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- El uso de `--force-32gb` reduce el rendimiento a 3,56 tok/s a batch 1, lo que puede ser insuficiente para aplicaciones interactivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-WV-v6.4-2.50bpw-SM120
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantizacion GGUF alternativa: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
