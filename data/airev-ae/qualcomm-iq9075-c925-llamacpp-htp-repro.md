# airev-ae/qualcomm-iq9075-c925-llamacpp-htp-repro

## Resumen

El repositorio `airev-ae/qualcomm-iq9075-c925-llamacpp-htp-repro` no es un modelo de lenguaje en sí, sino un paquete de reproducción de ingeniería para ejecutar Gemma 4 E2B IT cuantizado (Q4_0) sobre la NPU Hexagon V73 del kit de evaluación Qualcomm Dragonwing IQ-9075, utilizando una versión modificada de llama.cpp (v0.6.0, build b11429). El autor documenta de forma exhaustiva dos campañas de optimización (C9-25 y C9-26) con parches de kernel HVX/HMX, gestión de caché KV y decodificación especulativa mediante un sidecar MTP de una capa.

El objetivo del repositorio es la reproducibilidad determinista: incluye un ledger encadenado por hash con 88 entradas verificadas, manifiestos SHA-256 y pruebas de equivalencia bit a bit (`bitdiff=0`) sobre filas de logits y de caché KV. Los hitos declarados alcanzan 30,58 tok/s en el workload `p3553` (C9-25) y 60,57 tok/s de pico en el suite `S5` (C9-26), con una media de 57,01 tok/s.

Es relevante porque documenta, con telemetría de interrupciones FastRPC y estado térmico, cómo exprimir una NPU de borde para inferencia de un LLM pequeño con decodificación especulativa, un área con poca documentación pública de nivel tan granular. El tamaño del repositorio es de 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio empaqueta parches de backend; el modelo ejecutado es Gemma 4 E2B IT) |
| Parametros totales | No disponible (Gemma 4 E2B; el autor no publica el recuento) |
| Parametros activos | No disponible (el sidecar MTP consta de 1 capa) |
| Longitud de contexto | No disponible (el workload `p3553` usa prompts de 3.553 tokens y decodifica 400) |
| Tipos de cuantizacion | Q4_0 (pesos `gemma-4-E2B_q4_0-it.head-q4_0.gguf` y sidecar MTP Q4_0); se mencionan kernels para Q6_K y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (referenciados, no incluidos en el repo); parches en formato diff unificado |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: distribuye código y parches sobre llama.cpp b11429 para habilitar la ejecución en la NPU Hexagon V73 (HTP0 `cdsp:3` y HTP1 `cdsp1:4`) del SoC QCS9075, con 8 núcleos ARM Cortex-A78C a 2,3616 GHz y 34 GiB de LPDDR5. Los componentes técnicos incluyen kernels HVX personalizados (`tiled_vec_dot_q4_0_32x8`, variantes 32x3 a 32x7, Q6_K, MXFP4 con `Vmpy_ub_ub`), strip-mining en `matmul-ops.c` para k=1..16 con `HMX_MIN=16`, dispatch HMX con Br=4, sesiones FastRPC con mempool ION/DMA, y un backend DSP (`ggml-hexagon`) con fuentes de skeleton para matmul y flash-attention.

La innovación principal es la decodificación especulativa con un sidecar MTP de una capa (`mtp-gemma-4-E2B-it-Q4_0.gguf`) y un esquema de gating de doble umbral en `common/speculative.cpp`. Se añaden además optimizaciones de caché KV (`LLAMA_DWR_KV_PAD=4032`, SWA KV pad, PLE prefetch, FA rowsplit), verificación de zero-copy y un verificador de KV-pad. El entrenamiento del modelo subyacente (Gemma 4 E2B IT) no se describe en la información disponible; el autor solo documenta la compilación determinista con `-O2 -ffp-contract=off` y la verificación bit a bit de los resultados.

## Capacidades

- Inferencia de un LLM cuantizado (Gemma 4 E2B IT Q4_0) sobre NPU Hexagon V73 con backend llama.cpp modificado.
- Decodificación especulativa con sidecar MTP de una capa y gating de doble umbral (configurable, p. ej. `mtp:4`, `mtp:5 PMIN=0.96`).
- Prefill dual-NPU documentado a 1.003,17 tok/s en la campaña C9-25.
- Verificación bit a bit de logits y filas de caché KV (`bitdiff=0`, 0 ULP sobre 69,21M floats en C9-26).
- Ledger encadenado por hash con verificación de integridad (88/88 entradas, 0 roturas de cadena).
- Telemetría de interrupciones CDSP0 FastRPC, `glink-smem` e `ipcc_0`, con control de estado térmico (`cooling_state=0`).
- Compilación cruzada determinista y parches modulares frente a upstream b11429.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información proporcionada.

## Casos de uso

- Reproducción de benchmarks en hardware físico: permite replicar los resultados de `p3553`, `S8`, `S20` y `S5` sobre un IQ-9075 EVK real, con hashes de pesos y ledger verificable para auditoría.
- Validación de kernels NPU personalizados: los parches HVX/HMX y el backend `ggml-hexagon` sirven para comparar el rendimiento de kernels tiled frente a los de upstream en la misma NPU.
- Investigación en decodificación especulativa en el borde: el esquema de gating de doble umbral y el sidecar MTP de una capa permiten estudiar el equilibrio entre tasa de aceptación y throughput en hardware con recursos limitados.
- Integración en pipelines de CI de ingeniería de compiladores: los manifiestos SHA-256 y los diffs unificados permiten verificar builds deterministas de llama.cpp para Hexagon.
- Evaluación de despliegue edge para asistentes locales: Gemma 4 E2B Q4_0 a decenas de tok/s en una NPU de bajo consumo es adecuado para prototipos de generación de texto en dispositivo.
- Análisis térmico y de interrupciones: la telemetría CDSP0/`ipcc_0` con `cooling_state` permite estudiar el comportamiento sostenido de la NPU bajo carga.
- Formación y auditoría de ingeniería: el manifiesto de 30 subagentes (SA-01..SA-30) y el manual de reproducción sirven como material didáctico sobre verificación bit a bit en aceleradores.

## Benchmarks y rendimiento

Datos declarados por el autor en el ledger del repositorio (hardware físico IQ-9075, Hexagon V73 HTP0):

| Campana | Workload | Throughput decodificacion | Verificacion |
|---|---|---|---|
| Baseline (CHAMP-001) | `p3553` (3.553 tok prompt, 400 tok decode) | 23,1040 tok/s mediana (greedy) | Referencia canonica |
| C9-21 | `p3553` (`mtp:4`) / `rag-03` | 28,6257 tok/s pico; 28,4779 mediana; 40,3370 tok/s `rag-03` | 108/108 logits y 24/24 KV `bitdiff=0`; 20/20 S20 lossless |
| C9-22 | `p3553` (`mtp:5 PMIN=0.96`) / `rag-03` | 30,0276 tok/s pico; 29,8765 mediana; 42,1228 tok/s `rag-03` | 108/108 logits `bitdiff=0`; 12/12 runs `400/400` lossless |
| C9-25 | `p3553`, `S8`, prefill dual-NPU | 30,5780 tok/s pico; 30,5456 mediana; 52,4474 tok/s `rag-03`; 1.003,17 tok/s prefill | 146/146 logits y 20/20 KV `bitdiff=0`; 32/32 S8 y 9/9 `p3553` lossless |
| C9-26 | `S5` (`--reps 3`), `S8`, `p3553` (REST-MTP) | 57,0067 tok/s media mediana `S5`; 60,5739 tok/s pico (`code-02`); 55,8470 tok/s media `S8`; 51,6996 tok/s live / 58,3878 tok/s standalone `p3553` | 264/264 logits y 33/33 KV `bitdiff=0` (0 ULP sobre 69,21M floats); 100,00% lossless |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son de throughput de inferencia, no de calidad de modelo.

## Requisitos de hardware

- Hardware objetivo: Qualcomm Dragonwing IQ-9075 EVK (QCS9075 rev 2.0, `soc_id=676`), 8x Cortex-A78C a 2,3616 GHz, 34 GiB LPDDR5, Hexagon V73 HTP0 (`cdsp:3`) y HTP1 (`cdsp1:4`) vía `/dev/fastrpc-cdsp`.
- VRAM: no aplica; la inferencia se ejecuta sobre memoria LPDDR5 compartida del SoC y la NPU. No se publica el consumo de memoria del modelo en la información disponible.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; el backend es específico para Hexagon V73.
- Consumer GPU: no aplicable.
- Despliegue: llama.cpp v0.6.0 (b11429) con backend `ggml-hexagon` modificado; no se mencionan vLLM, Ollama ni TGI.
- Throughput declarado: 23,10 tok/s (baseline) hasta 60,57 tok/s de pico (C9-26) en decodificación; 1.003,17 tok/s en prefill dual-NPU (C9-25). Latencia no publicada.
- Compilación: determinista con `-O2 -ffp-contract=off`; kernels HVX 32x3..32x7.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable por parámetros o contexto, sino un paquete de reproducción de backend para un hardware concreto; no se ofrecen alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para usar: requiere hardware físico específico (IQ-9075 EVK con Hexagon V73) y compilación de llama.cpp con los parches incluidos.
- Los pesos GGUF de Gemma 4 E2B IT y del sidecar MTP se referencian por SHA-256 pero no se incluyen en el repositorio (0,4 GB); deben obtenerse por separado.
- Las cifras de rendimiento son del autor y no han sido verificadas de forma independiente; dependen de la revisión de hardware, el gobernador de CPU (`performance`) y el estado térmico (`cooling_state=0`).
- No se documentan evaluaciones de calidad del modelo (MMLU, HumanEval, GSM8K) ni de sesgo o alucinación; las pruebas de "lossless" se refieren a equivalencia numérica frente a una referencia, no a corrección semántica.
- Idiomas soportados no disponibles; la model card no detalla capacidades multilingües.
- La licencia MIT del repositorio cubre el código y los parches, pero no necesariamente los pesos de Gemma 4, cuyos términos deben consultarse en su origen.
- El repositorio se creó y actualizó el 2026-10-27 con 0 descargas y 0 likes; no hay evidencia de validación por terceros.
- El uso en producción exige verificar la integridad del ledger y de los binarios, y asumir el riesgo de que los parches diverjan de futuras versiones de llama.cpp.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/airev-ae/qualcomm-iq9075-c925-llamacpp-htp-repro
- llama.cpp (upstream base v0.6.0, b11429): https://github.com/ggml-org/llama.cpp
- Qualcomm Dragonwing IQ-9075 EVK: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
