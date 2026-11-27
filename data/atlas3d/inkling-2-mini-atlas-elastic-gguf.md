# Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF

## Resumen

Inkling-2-Mini-Atlas-Elastic-GGUF es una coleccion de cuantizaciones GGUF en formato single-file del modelo base `thinkingmachines/Inkling-2-Mini`, un Mixture-of-Experts (MoE) con bucle de 26.070.385.152 parametros totales y una ventana de contexto nativa de 1.048.576 tokens. La publica el usuario Atlas3D bajo licencia Apache 2.0, y esta pensada para su uso con Atlas Engine v7, un fork de llama.cpp mantenido por el mismo autor. El modelo base es de Thinking Machines.

El problema que resuelve esta ficha es concreto: la cuantizacion uniforme trata por igual las capas que se ejecutan una sola vez y el nucleo de razonamiento que se ejecuta tres veces por token (`blk.6–17`), lo que degrada desproporcionadamente ese nucleo. La propuesta de Atlas3D, denominada "elastic loop-tiered quantization", asigna mayor precision a las capas del bucle y a la "coda" de salida (`blk.20–23`), y comprime mas agresivamente las capas de preludio y puente de paso unico (`blk.0–5, 18–19`). El resultado son ficheros GGUF de entre 7,90 y 12,60 GiB que caben en GPUs de consumo de 12 a 24 GB manteniendo contexto de 64K.

Es relevante ahora porque demuestra que es posible desplegar un MoE de 26B con bucle de razonamiento en hardware consumer, algo que con cuantizacion uniforme exigiria bastante mas VRAM. El autor aporta ademas una ablacion causal byte a byte que compara su asignacion por niveles frente a una asignacion uniforme del mismo tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con nucleo de razonamiento en bucle (loop-tiered); 3 ejecuciones del nucleo por token |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens nativos (64K medidos en las pruebas de VRAM) |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL, Q8_0 (referencia); asignacion por niveles A/B/C sobre `gate_up` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (single-file), cuantizado desde BF16 lossless (48,64 GiB) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con un nucleo de razonamiento que se ejecuta tres veces por token (`blk.6–17`), flanqueado por bloques de preludio y puente de paso unico (`blk.0–5, 18–19`) y una coda de salida (`blk.20–23`). Esta estructura en bucle es la que motiva la estrategia de cuantizacion por niveles: el nucleo acumula tres veces mas errores de cuantizacion por token que una capa de paso unico, por lo que merece mas bits. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion es la cuantizacion "elastic loop-tiered" realizada en un solo paso directamente desde BF16, usando una matriz de importancia (imatrix) calculada en BF16 sobre WikiText-2 con 512 chunks de 128 tokens. El autor aporta una ablacion causal exacta a igualdad de bytes (`11.230.604.832` bytes): la asignacion por niveles reduce el KLD de 64 chunks de WikiText-2 frente a BF16 en un 20,1% (`0,05668` frente a `0,07092`, mas de 9,4 sigma) y reduce la discrepancia de enrutamiento de la coda de salida (`v47`) frente a `Q8_0` del 19,23% al 17,39%. No se documentan tecnicas de decodificacion especulativa en esta ficha GGUF; el autor las menciona para sus packs `atlas-ingine` separados.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline `text-generation`, tag `conversational`).
- Razonamiento multi-paso mediante el nucleo en bucle de 3 ejecuciones por token.
- Ventana de contexto nativa de 1.048.576 tokens, con pruebas de calidad y VRAM realizadas a 64K.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de cuantizacion elástica por niveles para ajustar el equilibrio calidad/VRAM.
- Capacidades de tool calling, function calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues especificas: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en GPU de consumo de 12 GB: el fichero `Atlas-8G-Q20Down` (7,90 GiB) cabe en una GPU de 12 GB a contexto completo de 64K con un pico de VRAM de 11,33 GiB, lo que permite ejecutar un MoE de 26B en tarjetas como la RTX 3060 de 12 GB.
- Despliegue en GPU de 16 GB: los ficheros `Atlas-10G` (11,22 GiB, pico 14,54 GiB) y `Atlas-11G` (11,85 GiB, pico ~15,2 GiB) ofrecen un equilibrio razonable entre calidad y ajuste en tarjetas de 16 GB como la RTX 4060 Ti o la RTX 5070.
- Despliegue de mayor calidad en 16-24 GB: el fichero `Atlas-12G` (12,60 GiB, pico 15,92 GiB) es la opcion de mayor calidad GGUF para GPUs de 16 a 24 GB, con un KLD de 0,01989 frente a BF16.
- Procesamiento de documentos largos: gracias a la ventana nativa de 1M tokens y a las pruebas a 64K, el modelo puede resumir, extraer informacion o responder preguntas sobre corpus extensos en una sola pasada.
- Razonamiento con contexto largo en produccion: el nucleo en bucle de 3 ejecuciones por token y la preservacion de precision en la coda de salida lo hacen adecuado para tareas de razonamiento encadenado donde el enrutamiento de expertos debe mantenerse estable.
- Inferencia en CPU y plataformas cruzadas: al ser GGUF compatible con llama.cpp y Atlas Engine v7, puede ejecutarse en entornos sin GPU NVIDIA, incluyendo CPU y GPUs de otras marcas.
- Evaluacion comparativa de tecnicas de cuantizacion: los ficheros del mismo tamano (`Atlas-9G` frente a `RevLoop-9G`) sirven como referencia reproducible para investigar el impacto de la asignacion de precision en modelos con bucle.

## Benchmarks y rendimiento

Resultados medidos en Atlas Engine v7 (`llama-perplexity`, WikiText-2 test, `c=512`, `b=512`, 64 chunks frente a logits BF16 lossless) y `atlas-eval-dump` (200 prompts estratificados, discrepancia de enrutamiento top-8 por visita frente a `Q8_0`). PPL de referencia BF16 lossless: 6,8928.

| Fichero | Tamano (GiB) | Niveles A / B / C (`gate_up`) | PPL 64-ch | KLD vs BF16 | Same Top-1 | Deriva media / peor visita vs `Q8_0` | Pico VRAM @ 64K |
|---|---:|---|---:|---:|---:|---:|---:|
| BF16 lossless (padre) | 48,64 | BF16 | 6,8928 | 0,00000 | 100,00% | — | — |
| `Q8_0` ref | 25,91 | Q8_0 | 6,8965 | 0,00320 ± 0,00007 | 97,57% | 0,00% / 0,00% | 29,26 GiB |
| `IQ4_NL` ref | 16,42 | IQ4_NL | 6,9225 | 0,00901 ± 0,00015 | 95,73% | 7,03% / 11,85% | 19,73 GiB |
| `Atlas-12G` | 12,60 | IQ3_XXS / IQ3_S / IQ4_NL | 6,9860 | 0,01989 ± 0,00036 | 94,16% | 9,19% / 14,94% | 15,92 GiB |
| `Atlas-11G` | 11,85 | IQ2_S / IQ3_XXS / IQ4_XS | 7,0093 | 0,02862 ± 0,00059 | 93,05% | 10,32% / 16,47% | ~15,2 GiB |
| `Atlas-10G` | 11,22 | IQ2_XS / IQ2_S / IQ4_XS | 7,0815 | 0,04349 ± 0,00078 | 91,27% | 12,00% / 19,05% | 14,54 GiB |
| `Atlas-9G` | 10,46 | IQ2_XXS / IQ2_XS / IQ3_S | no disponible | no disponible | no disponible | no disponible | no disponible |

Ablacion causal a igualdad exacta de bytes (`Atlas-9G` frente a `RevLoop-9G`, ambos de 11.230.604.832 bytes): la asignacion por niveles reduce el KLD de 64 chunks de WikiText-2 frente a BF16 en un 20,1% (0,05668 frente a 0,07092, mas de 9,4 sigma) y reduce la discrepancia de enrutamiento de la coda (`v47`) frente a `Q8_0` del 19,23% al 17,39%. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (pico a 64K de contexto, KV hibrida): 11,33 GiB (`Atlas-8G-Q20Down`, 7,90 GiB de fichero), 13,11 GiB (`Atlas-8G`, 9,68 GiB), 14,54 GiB (`Atlas-10G`), ~15,2 GiB (`Atlas-11G`), 15,92 GiB (`Atlas-12G`), 19,73 GiB (`IQ4_NL` ref) y 29,26 GiB (`Q8_0` ref).
- GPUs recomendadas: cualquier GPU NVIDIA con 12 GB o mas para los packs pequenos; 16 GB para `Atlas-10G`/`Atlas-11G`; 16-24 GB para `Atlas-12G`. El autor menciona compatibilidad desde Pascal (2016) hasta Blackwell (2026), con packs `atlas-ingine` especificos para CUDA con hasta 1M de contexto en 24 GB.
- Cabe en GPU de consumo: si. `Atlas-8G-Q20Down` cabe en 12 GB a 64K; `Atlas-8G` en 16 GB a 64K; `Atlas-12G` en 16-24 GB.
- Opciones de despliegue: Atlas Engine v7 (fork de llama.cpp del autor, `https://github.com/Atlas3DSS/atlas-engine`), llama.cpp, y los packs `atlas-ingine` para CUDA con decodificacion especulativa DSpark. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Inkling-2-Mini-Atlas-Elastic-GGUF (esta ficha) | 26,07B (MoE con bucle 3x) | 1.048.576 nativo | Apache 2.0 | GGUF | Cuantizacion por niveles; 7,90-12,60 GiB |
| Inkling-2-Mini (base, `thinkingmachines/Inkling-2-Mini`) | 26,07B (MoE con bucle 3x) | 1.048.576 nativo | no disponible | BF16 (48,64 GiB) | Referencia lossless; PPL 6,8928 |
| `IQ4_NL` uniforme del mismo modelo | 26,07B | 1.048.576 | Apache 2.0 | GGUF | 16,42 GiB; KLD 0,00901; deriva 7,03% / 11,85% |
| `Q8_0` uniforme del mismo modelo | 26,07B | 1.048.576 | Apache 2.0 | GGUF | 25,91 GiB; KLD 0,00320; deriva 0,00% / 0,00% |

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- Las cuantizaciones de baja precision (IQ1_S, IQ2_XXS, IQ2_XS) degradan la calidad de forma medible: `Atlas-10G` baja a 91,27% de Same Top-1 frente a `Q8_0`, y la deriva de enrutamiento en la peor visita llega al 19,05%.
- La ablacion causal se realizo unicamente sobre WikiText-2 (64 chunks) y sobre el enrutamiento de expertos; no hay evaluacion en tareas de razonamiento, codigo o matematicas.
- El modelo base puede presentar sesgos y alucinaciones; no se documentan en la informacion disponible datos especificos sobre sesgos conocidos.
- Los idiomas soportados no estan documentados; no se puede garantizar un rendimiento multilingue sin evaluacion previa.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`, cuya licencia no se especifica en la informacion disponible.
- El rendimiento optimo (contexto de 1M, decodificacion especulativa DSpark) requiere Atlas Engine v7 o los packs `atlas-ingine`; con llama.cpp estandar las capacidades pueden ser mas limitadas.
- Las cifras de VRAM pico son a 64K de contexto con KV hibrida; contextos mayores incrementaran el consumo de memoria de forma no documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Coleccion Atlas 3D Inkling-2-Mini (6 GB a 96 GB): https://huggingface.co/collections/Atlas3D/inkling-2-mini-atlas-3d-6-gb-to-96-gb-6b054702b9c8001bb2b06675
- Atlas Engine v7 (fork de llama.cpp): https://github.com/Atlas3DSS/atlas-engine
- Pack `atlas-exl3-9g-ingine`: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-exl3-9g-ingine
- Pack `atlas-10g-ingine`: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-10g-ingine
- Pack `atlas-12g-ingine`: https://huggingface.co/Atlas3D/Inkling-2-Mini-atlas-12g-ingine
