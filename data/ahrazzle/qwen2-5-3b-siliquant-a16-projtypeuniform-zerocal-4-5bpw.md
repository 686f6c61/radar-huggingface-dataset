# ahrazzle/Qwen2.5-3B-Siliquant-A16-ProjTypeUniform-ZeroCal-4.5bpw

## Resumen

`ahrazzle/Qwen2.5-3B-Siliquant-A16-ProjTypeUniform-ZeroCal-4.5bpw` es una version cuantizada del modelo `Qwen/Qwen2.5-3B` de Alibaba Qwen, publicada por el usuario ahrazzle. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint comprimido mediante la tecnica propietaria Siliquant, que emplea cuantizacion de retícula basada en codigos Extended Hamming `[16, 11, 4]` sobre el espacio `A_16 = 2Z^16 + C`. El objetivo es reducir el peso del checkpoint de 5.885,79 MiB en BF16 a 2.305,56 MiB (factor 2,55x) manteniendo una fidelidad de reconstruccion bit a bit verificable.

La innovacion principal es que la compresion es **sin calibracion** (zero calibration): no requiere corpus de calibracion textual, algo poco habitual en esquemas de cuantizacion post-entrenamiento. Cada bloque de 16 pesos se almacena mediante 11 bits de informacion sistematica (`qham11`) mas cocientes empaquetados (`qquot`) y escalas en patrones de bits IEEE-754 exactos, con verificacion de sindrome sobre el 100% de los bloques (173.408.256 bloques, 0 errores).

Es relevante para desarrolladores que necesitan desplegar Qwen2.5-3B en entornos con VRAM o almacenamiento limitados sin recurrir a kernels CUDA personalizados: el modelo funciona con `transformers` estandar y `trust_remote_code=True`, e incluye kernels de referencia en PTX (Ampere `sm_86`) y AVX-512 para decodificacion. El checkpoint declara 2.040.730.470 parametros reales en safetensors y una licencia heredada Qwen Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B) con capas lineales cuantizadas Siliquant |
| Parametros totales | 2.040.730.470 (segun safetensors); 2.774.532.096 pesos en capas lineales cuantizadas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B, no confirmada en esta ficha) |
| Tipos de cuantizacion | Retícula A_16 Extended Hamming `[16, 11, 4]`, recipe `ProjType_Uniform`, `g=128`, objetivo 4.5 bpw, efectivo 5.1744 bpw empaquetado; `embed_tokens`, `lm_head`, RMSNorms y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada de Qwen/Qwen2.5-3B) |
| Formato de pesos | safetensors (formato `siliquant-hf-v1`), con utilidad de exportacion a BF16 denso |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer decoder-only de la familia Qwen2.5. Sobre esa base, este checkpoint aplica cuantizacion post-entrenamiento Siliquant: cada vector de 16 pesos `y ∈ A_16 = 2Z^16 + C_[16,11,4]` se descompone en 11 bits sistematicos (`qham11`) que reconstruyen algebraicamente 5 bits de paridad en las posiciones `{0, 1, 2, 4, 8}`, mas un cociente entero empaquetado (`qquot`) con `k_bits ∈ {2, 3, 4}` y overflow CSR compacto, y finalmente escalas `scales_fp16_bits` (int16) y `colscale_fp32_bits` opcionales en patrones de bits IEEE-754 exactos. El recipe `ProjType_Uniform` aplica `down_proj=axis` y `q/k/v/o/gate/up=block_h4`.

No hay entrenamiento ni fine-tuning en este checkpoint: es una transformacion determinista del modelo base. La calibracion es estrictamente cero (sin datos de texto). El autor reporta verificacion de sindrome sobre 173.408.256 bloques con 0 errores y una diferencia maxima de round-trip de `0.0e+00` (bit a bit exacto). Se incluyen kernels de referencia: `kernels/sm86_a16_blockh4.cu` (PTX fused para Ampere `sm_86` con `dp4a.s32.s32`) y `kernels/avx512_a16_blockh4.c` (AVX-512 con `vpermb`, `vpopcntq`, `vpdpbusd`).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-3B.
- Razonamiento y matematicas basicas (capacidad del modelo base, no re-verificada en esta ficha).
- Generacion de codigo (capacidad del modelo base, no re-verificada en esta ficha).
- Carga directa en `transformers` con `trust_remote_code=True` sin compilacion C++/CUDA.
- Verificacion de integridad end-to-end via `siliquant_verification_receipt.json` con hashes SHA-256.
- Exportacion a BF16 denso para motores downstream mediante `siliquant_dequant.py unpack`.
- Tool calling y function calling: no confirmado en la informacion proporcionada (depende del modelo base).
- Modo thinking, vision o audio: no disponible en esta variante.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM ajustada: el checkpoint de 2,4 GB permite cargar Qwen2.5-3B en tarjetas de 8 GB o menos con margen para el contexto, algo inviable con el BF16 original de 5,9 GB.
- Distribucion de modelos en entornos con ancho de banda limitado: el factor 2,55x de reduccion facilita la descarga y el almacenamiento en registros internos o edge devices.
- Investigacion en cuantizacion de retículas: el formato `siliquant-hf-v1` sirve como referencia reproducible para estudiar esquemas de codificacion algebraica (Hamming extendido) aplicados a pesos de LLM.
- Verificacion de integridad de artefactos: el CLI `verify` con hashes SHA-256 y comprobacion de sindrome permite auditar que un checkpoint no ha sido manipulado, util en pipelines de suministro de software.
- Inferencia en CPU con AVX-512: el kernel de referencia `avx512_a16_blockh4.c` habilita decodificacion GEMV empaquetada en servidores x86 sin GPU.
- Prototipado rapido con `transformers`: al no requerir builds personalizados, se puede integrar en notebooks y scripts de evaluacion existentes sin cambios de infraestructura.
- Exportacion a BF16 para vLLM o TGI: mediante `unpack` se obtienen pesos densos que se pueden cargar en motores de inferencia de alto rendimiento cuando la VRAM no es el cuello de botella.

## Benchmarks y rendimiento

| Corpus / Metrica | Valor |
|---|---|
| `bf16_cpython_ppl` | 3,111936 |
| `bf16_wikitext2_ppl` | 10,970193 |
| `cpython_ppl` (cuantizado) | 3,217156 |
| `cpython_mean_kl` | 0,034327 |
| `cpython_top1_match_pct` | 93,6888 |
| `cpython_vs_a16_axis_kl_delta` | -11,02% (0,034327 vs 0,038578) |
| `cpython_vs_e8_h8_kl_delta` | -6,57% (0,034327 vs 0,036741) |
| `wikitext2_ppl` (cuantizado) | 11,268631 |
| `wikitext2_mean_kl` | 0,046336 |
| `wikitext2_top1_match_pct` | 89,3836 |
| `wikitext2_vs_a16_axis_kl_delta` | -0,75% (0,046336 vs 0,046686) |
| `wikitext2_vs_a16_blockh4_kl_delta` | -3,35% (0,046336 vs 0,047942) |
| Errores de sindrome Extended Hamming | 0 / 173.408.256 bloques |
| Max abs round-trip unpack diff | 0,0e+00 (exacto bit a bit) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son de perplejidad y divergencia KL frente al modelo BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB para los pesos empaquetados mas overhead de activaciones y cache KV; en la practica cabe en GPUs de 6-8 GB.
- GPU recomendadas: cualquier GPU con soporte bfloat16 (Ampere en adelante); el kernel de referencia PTX esta optimizado para `sm_86` (RTX 30xx, A10, A40).
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores; tambien en tarjetas de 6 GB con contexto moderado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo); `device_map="auto"` con `accelerate`; exportacion a BF16 denso para vLLM, TGI o llama.cpp tras `unpack`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- CPU: kernel AVX-512 de referencia para decodificacion GEMV empaquetada; requiere CPU con AVX-512 (Intel Skylake-X en adelante, AMD Zen 4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-3B-Siliquant-A16 (este) | 2,04B (2,77B en lineales) | no disponible | Siliquant A_16, 5,1744 bpw | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B (base) | 3,09B | 32.768 tokens (segun Qwen2.5) | BF16 safetensors | qwen-research | Hugging Face, ampliamente usado |
| Qwen2.5-3B en GGUF Q4_K_M | ~3B | 32.768 tokens | GGUF 4-bit | qwen-research | via llama.cpp / TheBloke y derivados |
| Qwen2.5-3B AWQ / GPTQ 4-bit | ~3B | 32.768 tokens | AWQ / GPTQ | qwen-research | Hugging Face |

La comparativa directa con otras cuantizaciones de Qwen2.5-3B es pertinente: Siliquant declara 5,1744 bpw efectivos frente a ~4,5 bpw de AWQ/GPTQ y ~4,8 bpw de GGUF Q4_K_M, con la ventaja de verificacion bit a bit y ausencia de calibracion, pero con menor soporte de ecosistema (0 descargas, sin integracion en vLLM ni llama.cpp nativa). El contexto de Qwen2.5-3B es 32.768 tokens segun la documentacion oficial de Qwen, aunque no se confirma en la informacion de este checkpoint.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es necesario revisar los terminos upstream antes de desplegar en produccion.
- Modelo con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de robustez en cargas reales.
- El checkpoint declara 2.040.730.470 parametros en safetensors frente a los ~3,09B del Qwen2.5-3B base; la discrepancia se explica por el empaquetado, pero conviene verificar la carga completa antes de confiar en el modelo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar `siliquant_dequant.py` y los kernels antes de usar en entornos sensibles.
- El formato `siliquant-hf-v1` no es estandar: sin soporte nativo en vLLM, TGI o llama.cpp; para produccion de alto rendimiento hay que exportar a BF16, perdiendo la compresion.
- Sin calibracion no hay garantia de que la degradacion sea uniforme en todas las tareas; los benchmarks reportados son de perplejidad y KL, no de tareas downstream (MMLU, HumanEval, GSM8K).
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen2.5-3B; no se han caracterizado especificamente para esta variante cuantizada.
- Idiomas soportados no documentados en esta ficha; asumir el comportamiento multilingue del base sin confirmacion.
- Fecha de creacion 2026-11-25: verificar que el checkpoint corresponde a la version actual del modelo base y que los hashes SHA-256 del recibo de verificacion son validos.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-3B-Siliquant-A16-ProjTypeUniform-ZeroCal-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Repositorio Siliquant: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
