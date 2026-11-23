# Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF

## Resumen

Inkling-2-Mini-Atlas-Elastic-GGUF es una familia de cuantizaciones GGUF del modelo base `thinkingmachines/Inkling-2-Mini`, un Mixture-of-Experts (MoE) de 26.070.385.152 parametros con un nucleo de razonamiento "looped" (repetido tres veces). El trabajo lo publica el usuario Atlas3D bajo el paraguas de Atlas Engine v7, y no entrena un modelo nuevo: redistribuye la precision de cuantizacion de forma no uniforme para preservar mejor las capas criticas del modelo original.

La innovacion principal es la asignacion de precision por niveles ("loop-tiered"): las capas del nucleo de razonamiento iterado (`blk.6-17`) y la "coda" de salida (`blk.20-23`) se mantienen en mayor precision, mientras que los bloques de preludio y puente de una sola pasada (`blk.0-5, 18-19`) se comprimen mas agresivamente. Segun el autor, con el mismo tamano de archivo exacto esto reduce la divergencia KL frente a BF16 en un 20,1% respecto a una asignacion uniforme.

El resultado practico es un conjunto de ficheros entre 7,90 y 12,60 GiB que permiten ejecutar un MoE de 26B con contexto completo de 64K en GPUs de consumo de 12, 16 y 24 GB. Es relevante para desarrolladores que quieren desplegar un modelo de razonamiento grande en hardware asequible sin renunciar al contexto largo, aunque la ficha debe leerse con cautela: los datos de rendimiento provienen exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con nucleo de razonamiento "looped" (3x); cuantizado para Atlas Engine v7 / llama.cpp |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | 64K (65.536 tokens, segun pruebas del autor) |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL, Q2_0 (down), Q8_0, IQ4_NL (referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + BF16 original (48,64 GiB) como referencia |

Variantes publicadas (tamano de archivo y VRAM pico a 64K de contexto segun el autor):

| Fichero | Tamano (GiB) | Tier A / B / C (`gate_up`) | PPL 64-ch | KLD vs BF16 | VRAM pico @ 64K |
|---|---:|---|---:|---:|---:|
| Atlas-12G | 12,60 | IQ3_XXS / IQ3_S / IQ4_NL | 6,9860 | 0,01989 | 15,92 GiB |
| Atlas-11G | 11,85 | IQ2_S / IQ3_XXS / IQ4_XS | 7,0093 | 0,02862 | ~15,2 GiB |
| Atlas-10G | 11,22 | IQ2_XS / IQ2_S / IQ4_XS | 7,0815 | 0,04349 | 14,54 GiB |
| Atlas-9G | 10,46 | IQ2_XXS / IQ2_XS / IQ3_S | 7,1174 | 0,05668 | 13,89 GiB |
| Atlas-8G | 9,68 | IQ1_S / IQ2_XXS / IQ3_XXS | 7,3180 | 0,08653 | 13,11 GiB |
| Atlas-9G-Q20Down | 8,68 | IQ2_XXS / IQ2_XS / IQ3_S + Q2_0 down | 8,7449 | 0,27367 | ~12,1 GiB |
| Atlas-8G-Q20Down | 7,90 | IQ1_S / IQ2_XXS / IQ3_XXS + Q2_0 down | 9,1609 | 0,32172 | 11,33 GiB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 26,07B parametros con una estructura de razonamiento "looped": un nucleo de bloques (`blk.6-17`) que se ejecuta tres veces sobre el mismo estado, flanqueado por bloques de preludio y puente de una sola pasada (`blk.0-5, 18-19`) y una coda de salida (`blk.20-23`). La proyeccion descendente del MoE (`ffn_down_exps`) tiene dimension interna 1152, divisible por 64 (compatible con `Q2_0`) pero no por 256, lo que condiciona las decisiones de cuantizacion de las variantes sub-9 GiB.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF/DPO) en la informacion proporcionada. Lo que si documenta el autor es el proceso de cuantizacion: cuantizacion "clean-room" de un solo paso desde BF16 sin perdidas (48,64 GiB), con una matriz de importancia WikiText-2 calculada en BF16 (`atlas-inkling2-bf16-imatrix.gguf`, 512x128 chunks) para Atlas Engine v7. La asignacion de precision por niveles se valida con una ablacion causal byte a byte (`Atlas-9G` frente a `RevLoop-9G`): al mismo tamano exacto de archivo (11.230.604.832 bytes), la asignacion loop-tiered reduce la KLD frente a BF16 en un 20,1% (0,05668 frente a 0,07092, >9,4 sigma) y baja el desacuerdo de enrutamiento de la coda de salida frente a Q8_0 del 19,23% al 17,39%.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento iterado mediante nucleo "looped" de 3 pasadas, preservado en mayor precision en las variantes Atlas.
- Ejecucion en llama.cpp y Atlas Engine v7 con contexto de hasta 64K tokens.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Cuantizacion elastica: multiples niveles de precision intercambiables segun presupuesto de VRAM.
- Capacidades de tool calling / function calling: no disponible en la informacion.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision, audio o modo "thinking" explicito: no disponible en la informacion.

## Casos de uso

- Despliegue local de un MoE de 26B en GPU de consumo: la variante Atlas-12G (12,60 GiB) cabe en 15,92 GiB de VRAM pico a 64K de contexto, lo que permite ejecutar el modelo completo en GPUs de 16-24 GB sin offloading a CPU.
- Razonamiento de contexto largo en estaciones de trabajo modestas: Atlas-8G-Q20Down (7,90 GiB) ocupa 11,33 GiB de VRAM a 64K de contexto, habilitando analisis de documentos extensos en una GPU de 12 GB.
- Servicio de inferencia con throughput alto por tarjeta: segun el autor, Atlas-10G alcanza 116,5 tok/s de decodificacion a 64K de contexto en una RTX PRO 6000 Blackwell, frente a 100,6 tok/s de Q8_0, lo que lo hace adecuado para endpoints de chat con muchos usuarios concurrentes.
- Prototipado e investigacion de tecnicas de cuantizacion: los ficheros, checksums (`SHA256SUMS.txt`) y JSON de evaluacion (`results/`) permiten reproducir las mediciones de KLD y enrutamiento para estudiar asignacion de precision por capas.
- Evaluacion comparativa de modelos MoE: la matriz de variantes (de IQ1_S a IQ4_NL) permite trazar curvas de compromiso entre tamano, perplejidad y fidelidad de enrutamiento en un mismo modelo base.
- Integracion en pipelines llama.cpp existentes: al ser GGUF estandar, se puede cargar con llama.cpp/Atlas Engine en flujos de generacion de texto por lotes o como backend de aplicaciones conversacionales autoalojadas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso en productos comerciales, siempre que se respeten las obligaciones de atribucion.

## Benchmarks y rendimiento

Resultados publicados por el autor en Atlas Engine v7 (`llama-perplexity`, WikiText-2 test, `c=512`, `b=512`, 64 chunks, contra logits BF16 sin perdidas; PPL BF16 de referencia = 6,8928):

| Modelo | Tamano (GiB) | PPL 64-ch | KLD vs BF16 | Same Top-1 | Deriva de enrutamiento media / peor visita vs Q8_0 |
|---|---:|---:|---:|---:|---:|
| BF16 (padre) | 48,64 | 6,8928 | 0,00000 | 100,00% | — |
| Q8_0 (ref) | 25,91 | 6,8965 | 0,00320 | 97,57% | 0,00% / 0,00% |
| IQ4_NL (ref) | 16,42 | 6,9225 | 0,00901 | 95,73% | 7,03% / 11,85% |
| Atlas-12G | 12,60 | 6,9860 | 0,01989 | 94,16% | 9,19% / 14,94% |
| Atlas-11G | 11,85 | 7,0093 | 0,02862 | 93,05% | 10,32% / 16,47% |
| Atlas-10G | 11,22 | 7,0815 | 0,04349 | 91,27% | 12,00% / 19,05% |
| Atlas-9G | 10,46 | 7,1174 | 0,05668 | 90,05% | 13,41% / 20,63% |
| Atlas-8G | 9,68 | 7,3180 | 0,08653 | 87,67% | 15,61% / 23,63% |
| Atlas-9G-Q20Down | 8,68 | 8,7449 | 0,27367 | 78,25% | — |
| Atlas-8G-Q20Down | 7,90 | 9,1609 | 0,32172 | 76,65% | 26,78% / 37,69% |

Throughput y VRAM (RTX PRO 6000 Blackwell, `-c 65536 --parallel 1`, KV hibrida SWA-F16 / FP8-Full):

| Modelo | VRAM pico @ 64K | Prefill / decode 4K | Prefill / decode 16K | Prefill / decode 32K | Prefill / decode 64K |
|---|---:|---:|---:|---:|---:|
| Q8_0 (ref) | 29,26 GiB | 4.421 / 105,7 | 5.395 / 103,4 | 5.434 / 100,3 | 5.346 / 100,6 |
| IQ4_NL (ref) | 19,73 GiB | 5.065 / 122,5 | 6.053 / 123,3 | 6.008 / 113,1 | 5.709 / 110,6 |
| Atlas-12G | 15,92 GiB | 4.838 / 127,8 | 5.814 / 125,1 | 5.774 / 118,5 | 5.513 / 113,6 |
| Atlas-10G | 14,54 GiB | 4.713 / 130,4 | 5.667 / 126,3 | 5.638 / 123,7 | 5.395 / 116,5 |
| Atlas-9G | 13,89 GiB | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de calidad de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores miden fidelidad de cuantizacion, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada a 64K de contexto (medida por el autor): 15,92 GiB (Atlas-12G), 14,54 GiB (Atlas-10G), 13,89 GiB (Atlas-9G), 13,11 GiB (Atlas-8G), 11,33 GiB (Atlas-8G-Q20Down).
- GPU de 24 GB: todas las variantes caben; Atlas-12G es la de mayor calidad con margen amplio.
- GPU de 16 GB: recomendadas Atlas-12G, Atlas-11G, Atlas-10G, Atlas-9G y Atlas-8G a 64K; Atlas-8G requiere reducir contexto a 16K para GPUs de 12 GB.
- GPU de 12 GB: solo Atlas-8G-Q20Down (7,90 GiB) cabe a 64K completo (11,33 GiB pico); el resto de variantes necesita menor contexto u offloading.
- GPU de referencia en las pruebas: RTX PRO 6000 Blackwell. No se aportan mediciones en A100, H100 ni RTX 4090.
- Opciones de despliegue: Atlas Engine v7 (motor de referencia del autor) y llama.cpp (formato GGUF estandar). Compatibilidad con vLLM, TGI u Ollama: no disponible en la informacion.
- Throughput medido en una sola tarjeta: hasta 130,4 tok/s de decodificacion a contexto 4K (Atlas-10G) y 5.513 tok/s de prefill a 64K (Atlas-12G). La decodificacion se mantiene por encima de 113 tok/s a 64K en Atlas-12G.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano minimo de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Atlas-Elastic (Atlas-12G) | 26,07B MoE | 64K | 12,60 GiB | Apache 2.0 | GGUF en HF, 0 descargas |
| Inkling-2-Mini Q8_0 (referencia del autor) | 26,07B MoE | 64K | 25,91 GiB | Apache 2.0 | GGUF en HF |
| Inkling-2-Mini IQ4_NL (referencia del autor) | 26,07B MoE | 64K | 16,42 GiB | Apache 2.0 | GGUF en HF |
| Modelos de ~26-30B densos en GGUF | ~26-30B | variable | variable | variable | amplia disponibilidad |

Frente a las cuantizaciones uniformes del mismo modelo base, Atlas-12G ofrece una KLD de 0,01989 con 12,60 GiB, mientras que IQ4_NL necesita 16,42 GiB para una KLD de 0,00901; Atlas-9G iguala aproximadamente el tamano de IQ4_NL con mayor KLD pero menor huella. No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Todos los datos de rendimiento, KLD, enrutamiento y VRAM proceden exclusivamente de la model card del autor; no hay validacion independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: sin adopcion ni verificacion por parte de la comunidad.
- Las variantes Q20Down (8,68 y 7,90 GiB) degradan notablemente la fidelidad: PPL de 8,74 y 9,16 frente a 6,89 de BF16, y deriva de enrutamiento de hasta el 37,69% en la peor visita.
- Las variantes de menor tamano (Atlas-8G y Q20Down) pueden mostrar degradacion en tareas de razonamiento o codigo no capturada por la perplejidad de WikiText-2.
- Riesgo de alucinacion inherente al modelo base: no se documentan evaluaciones de veracidad.
- Idiomas soportados no declarados; el rendimiento en castellano no esta verificado.
- Sesgos conocidos del modelo base: no disponible.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales no reflejadas en esta ficha.
- El rendimiento medido corresponde a Atlas Engine v7; en llama.cpp estandar u otros motores el comportamiento (especialmente con KV hibrida y contexto 64K) puede diferir.
- La cuantizacion "clean-room" y el esquema loop-tiered son especificos del autor; no son un formato estandar y requieren su motor o versiones compatibles de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Atlas Engine v7 (repositorio): https://github.com/Atlas3DSS/atlas-engine
- Checksums: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF/blob/main/SHA256SUMS.txt
- Resultados de evaluacion: https://huggingface.co/Atlas3D/Inkling-2-Mini-Atlas-Elastic-GGUF/tree/main/results
- Papers, blogs y demos adicionales: no disponible en la informacion proporcionada.
