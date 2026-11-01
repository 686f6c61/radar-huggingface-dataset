# airev-ae/qualcomm-iq9075-c925-c926-llamacpp-htp-repro

## Resumen

`airev-ae/qualcomm-iq9075-c925-c926-llamacpp-htp-repro` es un repositorio de reproduccion de ingenieria, no un modelo de lenguaje en sentido estricto. Empaqueta los parches, kernels y artefactos necesarios para reproducir de forma determinista la ejecucion de Gemma 4 E2B IT (cuantizado Q4_0) sobre la NPU Hexagon V73 HTP0 del kit de evaluacion Qualcomm Dragonwing IQ-9075, usando una version modificada de llama.cpp (baseline upstream v0.6.0, build b11429).

El repositorio documenta dos campanas de optimizacion, C9-25 y C9-26, que combinan decodificacion especulativa con un sidecar MTP de una capa, kernels HVX/HMX personalizados y tecnicas de padding de KV cache. El resultado declarado es un rendimiento de decodificacion de hasta 60,57 tok/s en pico (57,01 tok/s de media en la suite S5) sobre hardware edge ARM, con verificacion bit-exacta de logits y KV cache frente a la linea base.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de la familia Gemma 4 en una NPU Hexagon de gama edge con aceleracion especulativa y kernels vectoriales propios, manteniendo equivalencia numerica verificable. El repositorio incluye un ledger encadenado por hash con 88 entradas verificadas, manifiesto SHA-256 y una auditoria de 30 subagentes, lo que lo convierte en material de referencia para quien quiera replicar el stack. El tamano del repositorio es de 0,4 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: repositorio de reproduccion para llama.cpp modificado sobre backend Hexagon V73 HTP0 (HVX + HMX). Modelo ejecutado: Gemma 4 E2B IT, transformer (detalles internos no disponibles) |
| Parametros totales | No disponible (Gemma 4 E2B IT, cuantizado Q4_0; numero exacto de parametros no indicado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible de forma explicita; se documentan prompts de 3.553 tokens (`p3553`) y padding de KV cache con `LLAMA_DWR_KV_PAD=4032` |
| Tipos de cuantizacion | Q4_0 (modelo y sidecar MTP); se mencionan kernels para Q6_K y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`gemma-4-E2B_q4_0-it.head-q4_0.gguf`, `mtp-gemma-4-E2B-it-Q4_0.gguf`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Contiene el codigo y los parches para compilar y ejecutar Gemma 4 E2B IT en la NPU Hexagon V73 del SoC QCS9075, con un backend `ggml-hexagon` modificado que gestiona sesiones FastRPC, mempool ION/DMA y despacho HMX con Br=4. Incluye kernels HVX personalizados (`tiled_vec_dot_q4_0_32x8`, variantes 32x3 a 32x7, Q6_K, MXFP4 con `Vmpy_ub_ub`) y kernels HMX para FlashAttention, ademas de strip-mining con `k=1..16` y `HMX_MIN=16`.

Sobre el baseline upstream b11429 se aplican parches que anaden: padding de KV cache con verificador zero-copy, prefetch PLE, rowsplit de FlashAttention y una logica de gating especulativo de doble umbral en `common/speculative.cpp`. La decodificacion especulativa usa un sidecar MTP de una capa con `mtp:4` y `mtp:5` (con `PMIN=0.96`), lo que eleva el throughput manteniendo equivalencia bit-exacta: se reportan `264/264` filas de logits y `33/33` filas de KV con `bitdiff=0` y 0 ULP sobre 69,21 millones de floats. El ledger `benchmarks/ledgers/ledger.jsonl` cubre las secuencias 277 a 365 con 88 de 88 entradas verificadas y cero roturas de cadena.

## Capacidades

- Reproduccion determinista de benchmarks de decodificacion LLM sobre NPU Hexagon V73 HTP0.
- Compilacion cruzada del backend `ggml-hexagon` con kernels HVX y HMX personalizados.
- Decodificacion especulativa con sidecar MTP de una capa y gating de doble umbral.
- Verificacion bit-exacta de logits y KV cache frente a la linea base canonica.
- Soporte de prefill dual-NPU (HTP0 y HTP1) con throughput declarado de 1.003,17 tok/s.
- Gestión de KV cache con padding (`LLAMA_DWR_KV_PAD=4032`) y verificador zero-copy.
- Auditoria trazable mediante ledger encadenado por hash y manifiesto SHA-256.
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Reproduccion de resultados en hardware fisico: un equipo con un kit Dragonwing IQ-9075 puede seguir el `REPRODUCTION_MANUAL.md` para replicar las cifras de 30,58 tok/s y 60,57 tok/s pico, verificando el ledger y los SHA-256 incluidos.
- Desarrollo de kernels para NPU Hexagon: los ficheros en `kernels/hvx/` y `kernels/htp/` sirven como referencia para implementar matmul Q4_0 tiled y FlashAttention sobre HVX/HMX con strip-mining.
- Integracion de decodificacion especulativa en llama.cpp: el parche `01d-llama-common-c925-vs-upstream.patch` documenta el gating de doble umbral aplicable a otros modelos con sidecar MTP.
- Validacion numerica en pipelines de CI: el verificador zero-copy y las comprobaciones `bitdiff=0` permiten montar tests de regresion que detecten desviaciones de kernels en cada build.
- Optimizacion de KV cache en edge: la tecnica de padding con `LLAMA_DWR_KV_PAD=4032` es aplicable a despliegues con ventanas de contexto fijas donde se busca reducir overhead de gestion dinamica.
- Evaluacion comparativa de backends NPU: las suites `S5`, `S8` y `p3553` proporcionan workloads estandarizados para medir latencia y throughput de distintas configuraciones de compilacion (`-O2 -ffp-contract=off`).
- Auditoria de cadena de suministro de artefactos: el manifiesto `SHA256SUMS.txt` y el ledger encadenado permiten verificar la integridad de pesos y parches antes de desplegar.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el kit fisico IQ-9075 (8x Cortex-A78C a 2,3616 GHz, 34 GiB LPDDR5, Hexagon V73 HTP0):

| Campana | Workload | Throughput decodificacion | Verificacion |
|---|---|---|---|
| Baseline CHAMP-001 | `p3553` (3.553 prompt / 400 decode) | 23,1040 tok/s mediana (greedy) | Referencia canonica `96cb9ce6d4869073` |
| C9-21 | `p3553` (`mtp:4`) | 28,6257 tok/s pico; 28,4779 mediana | 108/108 logits y 24/24 KV `bitdiff=0` |
| C9-21 | `rag-03` | 40,3370 tok/s | 20/20 S20 lossless |
| C9-22 | `p3553` (`mtp:5`, `PMIN=0.96`) | 30,0276 tok/s pico; 29,8765 mediana | 108/108 logits `bitdiff=0`; 12/12 runs lossless |
| C9-22 | `rag-03` | 42,1228 tok/s | — |
| C9-25 | `p3553` (`LLAMA_DWR_KV_PAD=4032`) | 30,5780 tok/s pico; 30,5456 mediana | 146/146 logits y 20/20 KV `bitdiff=0` |
| C9-25 | `rag-03` | 52,4474 tok/s | — |
| C9-25 | Prefill dual-NPU | 1.003,17 tok/s | — |
| C9-26 | `S5` (`--reps 3`) | 57,0067 tok/s media de medianas; 60,5739 pico en `code-02` | 264/264 logits y 33/33 KV `bitdiff=0` (0 ULP en 69,21M floats) |
| C9-26 | `S8` | 55,8470 tok/s media | 100,00% lossless |
| C9-26 | `p3553` | 51,6996 tok/s live; 58,3878 tok/s standalone | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: kit Qualcomm Dragonwing IQ-9075 EVK (`QCS9075` rev 2.0, `soc_id=676`), 8x ARM Cortex-A78C a 2,3616 GHz en governor `performance`, 34 GiB LPDDR5, Hexagon V73 HTP0 (`cdsp:3`) y HTP1 (`cdsp1:4`) accesibles via `/dev/fastrpc-cdsp`.
- No es ejecutable en GPU de consumo (RTX 4090, etc.): el backend depende de la NPU Hexagon V73 y de FastRPC.
- VRAM estimada: no aplica; el modelo Gemma 4 E2B Q4_0 y el sidecar MTP residen en memoria compartida del SoC, con repo de 0,4 GB.
- Opciones de despliegue: llama.cpp v0.6.0 (b11429) con los parches del repositorio y backend `ggml-hexagon`; no se documentan vLLM, Ollama ni TGI para este stack.
- Throughput observado: 23,10 tok/s baseline hasta 60,57 tok/s pico con especulacion; prefill dual-NPU de 1.003,17 tok/s.
- Telemetria: incrementos de IRQ CDSP0 documentados (+18.851 en S8, +10.001 en `p3553`, +4.197 `glink-smem` y +4.186 `ipcc_0` en C9-26) con `cooling_state=0`.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo sino un paquete de reproduccion ligado a un hardware concreto (Hexagon V73 HTP0) y a una build especifica de llama.cpp, por lo que no existe una categoria de modelos comparables directa en la informacion proporcionada.

## Limitaciones y advertencias

- Vinculado a hardware especifico: requiere el kit Dragonwing IQ-9075 con Hexagon V73; no es portable a otras NPU o GPU sin reescribir kernels.
- Dependencia de una build concreta de llama.cpp (v0.6.0, b11429); los parches pueden no aplicar sobre versiones posteriores.
- Las cifras de rendimiento son del autor y no han sido verificadas de forma independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El repositorio no incluye el modelo base completo como artefacto principal: referencia pesos Gemma 4 E2B IT y sidecar MTP por SHA-256, por lo que la disponibilidad de esos ficheros depende de terceros.
- No se documentan idiomas soportados ni evaluaciones de sesgo o alucinacion del modelo subyacente.
- Ausencia de benchmarks de calidad (MMLU, HumanEval, GSM8K): solo se reportan metricas de throughput y equivalencia numerica.
- La licencia MIT cubre el codigo del repositorio; el uso de los pesos de Gemma 4 queda sujeto a la licencia de Google, no detallada aqui.
- El enfasis en verificacion bit-exacta presupone compilacion con `-O2 -ffp-contract=off`; otras flags pueden romper la equivalencia declarada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airev-ae/qualcomm-iq9075-c925-c926-llamacpp-htp-repro
- llama.cpp upstream (referencia v0.6.0, b11429): no disponible enlace directo en la informacion proporcionada
- Documentacion Qualcomm Dragonwing IQ-9075 EVK: no disponible enlace directo en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
