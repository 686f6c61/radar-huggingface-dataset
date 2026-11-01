# airev-ae/dragonwing-iq9075-c925-c926-npu-speculative-decoding

## Resumen

Este repositorio no contiene un modelo de lenguaje en el sentido habitual, sino un paquete de reproducción de ingeniería para ejecutar y verificar el rendimiento de Google Gemma 4 E2B IT sobre la NPU Hexagon V73 del kit de evaluación Qualcomm Dragonwing IQ-9075. Lo publica el usuario `airev-ae` bajo licencia MIT e incluye parches, kernels personalizados (HVX y HMX), binarios del backend Hexagon para llama.cpp y una cadena de verificación criptográfica de benchmarks ejecutados sobre hardware físico. El objetivo declarado es permitir una compilación cruzada determinista y una reproducción bit-exacta de los resultados de decodificación especulativa reportados en las campañas C9-25 y C9-26.

El interés técnico reside en que documenta con detalle inusual la optimización de inferencia en el borde: decodificación especulativa con un sidecar MTP de una capa, kernels HVX de multiplicación matricial por bloques (`32x3` a `32x8`), uso de HMX con `Br=4`, gestión de memoria ION/DMA mediante FastRPC y verificación de equivalencia bit a bit frente a la referencia canónica. Los rendimientos declarados alcanzan 30,58 tok/s en el conjunto `p3553` y un pico de 60,57 tok/s en la suite `S5`, con prefill dual-NPU de 1.003,17 tok/s.

La relevancia actual es acotada pero clara: sirve como referencia reproducible para quien quiera desplegar Gemma 4 E2B en hardware Qualcomm con llama.cpp, y como material de auditoría para validar que las optimizaciones no degradan la calidad numérica. No es un modelo entrenado por el autor ni un artefacto listo para usar en producción sin el hardware específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base es Google Gemma 4 E2B IT; el repositorio aporta backend Hexagon V73 HTP para llama.cpp) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (los benchmarks usan prompts de 3.553 tokens y decodificación de 400 tokens) |
| Tipos de cuantizacion | Q4_0 (pesos `gemma-4-E2B_q4_0-it.head-q4_0.gguf` y sidecar MTP `mtp-gemma-4-E2B-it-Q4_0.gguf`); se mencionan kernels para Q6_K y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base y sidecar MTP); parches en formato diff unificado |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. El artefacto de inferencia es Google Gemma 4 E2B IT cuantizado a Q4_0 en GGUF, acompañado de un sidecar MTP (multi-token prediction) de una sola capa, también en Q4_0, que actúa como modelo borrador para decodificación especulativa. Sobre esa base, el autor publica un backend modificado para llama.cpp v0.6.0 (build `b11429`) que incluye el host FastRPC para Hexagon, el esqueleto DSP para Hexagon V73 (`matmul-ops.c`, `flash-attn-ops.c`) y parches unificados y modulares contra el upstream.

Las innovaciones técnicas documentadas incluyen kernels HVX con tiling (`tiled_vec_dot_q4_0_32x8`, variantes `32x3` a `32x7`, Q6_K, MXFP4 con `Vmpy_ub_ub`), strip-mining con `k=1..16` y `HMX_MIN=16`, dispatch HMX con `Br=4`, padding de KV cache (`LLAMA_DWR_KV_PAD=4032`), prefetch PLE, rowsplit de flash attention y una compuerta de decodificación especulativa con doble umbral (`PMIN=0.96` en la campaña C9-22). La verificación se apoya en una cadena de hashes (`ledger.jsonl`, secuencias 277 a 365, 88/88 entradas verificadas) y en comprobaciones de equivalencia bit a bit (`bitdiff=0`) sobre filas de logits y de KV cache.

## Capacidades

- Inferencia de Gemma 4 E2B IT en la NPU Hexagon V73 del Dragonwing IQ-9075 mediante llama.cpp con backend Hexagon modificado.
- Decodificación especulativa con sidecar MTP de una capa y gating de doble umbral.
- Ejecución en dos NPU (HTP0 `cdsp:3` y HTP1 `cdsp1:4`) con prefill dual-NPU.
- Kernels HVX personalizados para matmul cuantizado Q4_0, Q6_K y MXFP4.
- Kernels HMX para flash attention con dispatch `Br=4`.
- Verificación bit-exacta de logits y KV cache frente a la referencia canónica.
- Trazabilidad mediante ledger encadenado por hash y manifiesto SHA-256 de todos los ficheros.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Reproducción de benchmarks en hardware físico: el paquete permite recompilar y ejecutar las campañas C9-25 y C9-26 sobre un IQ-9075 real, comparando los resultados con los valores del ledger (`30,5780 tok/s` en `p3553`, `57,0067 tok/s` de media en `S5`).
- Auditoría de optimizaciones numéricas: los parches y el verificador de KV-pad zero-copy permiten comprobar que las modificaciones de kernels mantienen `bitdiff=0` frente a la referencia, útil en equipos que necesitan certificar que una optimización no altera las salidas.
- Despliegue de Gemma 4 E2B en el borde: con 34 GiB de LPDDR5 y NPU Hexagon, el stack sirve para ejecutar un modelo de 2B cuantizado a Q4_0 en un kit de evaluación con consumo contenido y sin GPU dedicada.
- Investigación en decodificación especulativa: el sidecar MTP y la compuerta de doble umbral (`PMIN=0.96`) ofrecen un caso concreto y medido para estudiar el equilibrio entre tasa de aceptación y throughput en hardware heterogéneo.
- Desarrollo de kernels para Hexagon: los ficheros en `kernels/hvx/` y `kernels/hmx/` sirven como base para extender matmul y flash attention a otras cuantizaciones o tamaños de bloque.
- Integración en pipelines de CI de código nativo: el manifiesto `SHA256SUMS.txt` y los parches modulares permiten verificar builds de llama.cpp contra el upstream `b11429` de forma automatizada.
- Evaluación de latencia en asistentes locales: los datos de prefill (`1.003,17 tok/s` dual-NPU) y decodificación (`~57 tok/s` de media en `S5`) permiten dimensionar experiencias conversacionales en el dispositivo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre hardware físico (Dragonwing IQ-9075, Hexagon V73 HTP0, `cooling_state=0`):

| Campaña | Carga | Throughput decodificación | Verificación |
|---|---|---|---|
| Baseline `CHAMP-001` | `p3553` (3.553 tokens prompt, 400 decode) | 23,1040 tok/s mediana (greedy) | Referencia canónica `96cb9ce6d4869073` |
| C9-21 | `p3553` (`mtp:4`) | 28,6257 tok/s pico; 28,4779 mediana | 108/108 filas de logits y 24/24 de KV con `bitdiff=0` |
| C9-21 | `rag-03` | 40,3370 tok/s | 20/20 suite S20 sin pérdida |
| C9-22 | `p3553` (`mtp:5`, `PMIN=0.96`) | 30,0276 tok/s pico; 29,8765 mediana | 108/108 logits `bitdiff=0`; 400/400 sin pérdida |
| C9-22 | `rag-03` | 42,1228 tok/s | — |
| C9-25 | `p3553` (`KV_PAD=4032`) | 30,5780 tok/s pico; 30,5456 mediana | 146/146 logits y 20/20 KV `bitdiff=0` |
| C9-25 | `rag-03` | 52,4474 tok/s | 32/32 S8 y 9/9 `p3553` sin pérdida |
| C9-25 | Prefill dual-NPU | 1.003,17 tok/s | — |
| C9-26 | Suite `S5` (`--reps 3`) | 57,0067 tok/s media de medianas; 60,5739 pico en `code-02` | 264/264 logits y 33/33 KV `bitdiff=0` (0 ULP en 69,21M floats) |
| C9-26 | Suite `S8` | 55,8470 tok/s media | 100,00% sin pérdida |
| C9-26 | `p3553` live / standalone | 51,6996 / 58,3878 tok/s | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Qualcomm Dragonwing IQ-9075 EVK (`QCS9075` rev 2.0, `soc_id=676`), 8x ARM Cortex-A78C a 2,3616 GHz con gobernador `performance`, 34 GiB LPDDR5, Hexagon V73 HTP0 (`cdsp:3`) y HTP1 (`cdsp1:4`) vía `/dev/fastrpc-cdsp`.
- VRAM estimada: no aplica; el modelo corre sobre memoria LPDDR5 compartida del SoC, no sobre GPU discreta.
- GPU recomendadas: no aplica; el diseño es específico para la NPU Hexagon V73. No se documenta soporte para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el stack depende del backend `ggml-hexagon` y de FastRPC.
- Opciones de despliegue: llama.cpp v0.6.0 (`b11429`) con backend Hexagon modificado; los parches se aplican sobre ese árbol. No se mencionan vLLM, TGI, Ollama ni llama.cpp estándar sin parches.
- Throughput y latencia: decodificación de 30,58 tok/s en `p3553` y hasta 60,57 tok/s de pico en `code-02`; prefill dual-NPU de 1.003,17 tok/s.

## Comparativa con modelos similares

| Modelo / artefacto | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Gemma 4 E2B Q4_0 + backend Hexagon) | No disponible (modelo base de 2B según nomenclatura E2B) | No disponible | 30,58 tok/s `p3553`; 57,01 tok/s media `S5` en IQ-9075 | MIT (repo); Gemma sujeta a su propia licencia | HuggingFace, repo de 0,4 GB |
| llama.cpp upstream `b11429` | No aplica | No aplica | No disponible en esta información | MIT | Público |
| Google Gemma 4 E2B IT original | No disponible | No disponible | No disponible | No disponible en esta información | Público |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo completos: el tamaño de 0,4 GB corresponde a parches, kernels y utilidades, no al GGUF de Gemma 4 E2B.
- Está diseñado para un hardware concreto (Dragonwing IQ-9075, Hexagon V73); no es portable a otras NPU o GPU sin trabajo adicional.
- Los rendimientos reportados son del autor y se obtuvieron en un equipo concreto (`serial=789538504`, `cooling_state=0`); pueden no reproducirse en otras unidades o condiciones térmicas.
- La licencia MIT del repositorio no cubre necesariamente los pesos de Gemma 4 E2B, que se rigen por los términos de Google; verificar antes de uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en esta información.
- La fecha de creación del repositorio (2026-10-26) y las referencias a "Gemma 4" deben tratarse con cautela: no se ha podido verificar su existencia fuera de esta model card.
- El paquete incluye afirmaciones de verificación bit-exacta que dependen de scripts y ledgers del propio autor; una auditoría independiente requeriría acceso al hardware y a los binarios.

## Enlaces

- HuggingFace: https://huggingface.co/airev-ae/dragonwing-iq9075-c925-c926-npu-speculative-decoding
- Repositorio citado en la model card: https://huggingface.co/airev-ae/qualcomm-iq9075-c925-c926-llamacpp-htp-repro
- llama.cpp upstream (build `b11429`): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
