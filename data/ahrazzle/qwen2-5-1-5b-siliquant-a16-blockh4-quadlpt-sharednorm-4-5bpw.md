# ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadLPT-SharedNorm-4.5bpw

## Resumen

`ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadLPT-SharedNorm-4.5bpw` es una cuantizacion del modelo base `Qwen/Qwen2.5-1.5B` de Alibaba Qwen, publicada por el usuario ahrazzle bajo el formato propietario `siliquant-hf-v1`. No se trata de un modelo nuevo entrenado desde cero, sino de una compresion con perdida controlada de los pesos originales, que reduce el checkpoint de 2.944 MiB en BF16 a 1.258,62 MiB (factor 2,34x) manteniendo la practica totalidad del comportamiento del modelo original.

La propuesta tecnica se apoya en una retícula algebraica `A_16 = 2Z^16 + C_[16,11,4]`, es decir, un codigo de Hamming extendido `[16, 11, 4]` sobre grupos de 16 pesos, combinado con transformadas de Hadamard por bloques (`BlockH4`), permutaciones compartidas de RMSNorm (`SharedNorm`), un algoritmo LPT (Longest Processing Time) para el empaquetado de colas y un esquema de cuantizacion por grupos de tamano `g=128` con objetivo de 4,5 bits por peso (bpw). El resultado efectivo es de 5,2055 bpw empaquetados, con verificacion exacta bit a bit de la ida y vuelta y cero errores de sindrome en los 81.887.232 bloques procesados.

Es relevante ahora porque demuestra que se puede comprimir un transformer pequeno de uso comun con una tecnica de codificacion algebraica verificable, sin necesidad de kernels CUDA personalizados para la inferencia en `transformers` (solo `torch`, `transformers` y `safetensors`), y con degradacion de perplejidad medible y muy contenida en WikiText-2 y CPython. El modelo hereda la licencia Apache 2.0 del Qwen2.5-1.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con pesos cuantizados en formato `siliquant-hf-v1` (retícula `A_16` + BlockH4 + SharedNorm) |
| Parametros totales | 1.051.659.612 (segun safetensors); 1.310.195.712 pesos en capas lineales cuantizadas (196 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen2.5-1.5B base; no confirmada en la model card) |
| Tipos de cuantizacion | `siliquant-hf-v1`, receta `hA16_BlockH4_quad_lpt_sharednorm`, grupo `g=128`, objetivo 4,5 bpw, efectivo 5,2055 bpw; `embed_tokens`, `lm_head`, RMSNorms y biases en `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B) |
| Formato de pesos | `safetensors` con `custom_code` (requiere `trust_remote_code=True`); exportable a BF16 denso mediante `siliquant_dequant.py unpack` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5 con 1.500 millones de parametros nominales (1.051.659.612 reales segun safetensors). Sobre ese checkpoint se aplica un proceso de cuantizacion post-entrenamiento (PTQ) que no modifica la topologia de la red: las 196 capas lineales se empaquetan en el contenedor `siliquant-hf-v1`, mientras que `embed_tokens`, `lm_head`, las RMSNorms y los sesgos se preservan en `bfloat16`.

La innovacion tecnica reside en el codec. Cada vector de 16 pesos `y` se representa como un elemento de la retícula `A_16 = 2Z^16 + C_[16,11,4]`, donde `C_[16,11,4]` es un codigo de Hamming extendido. Los 11 bits sistematicos por bloque (`qham11`, 0,6875 bpw) reconstruyen algebraicamente los 5 bits de paridad en las posiciones `{0, 1, 2, 4, 8}`, lo que permite verificar la integridad del codec sin almacenar redundancia. El cociente entero por capa (`qquot`) se empaqueta en bytes con `k_bits in {2, 3, 4}` y un CSR compacto para desbordamientos. Las escalas se guardan como patrones de bits IEEE-754 exactos (`scales_fp16_bits` como `int16` y `colscale_fp32_bits` opcional como `int32`) para evitar la truncacion de mantisa al convertir a `bfloat16`.

El esquema `BlockH4` aplica transformadas de Hadamard por bloques de 4, y `SharedNorm` hace que Q/K/V compartan una unica permutacion, Gate/Up compartan otra, `down_proj` use LPT y `o_proj` quede sin permutar. La verificacion de sindrome reporta 0 errores en 81.887.232 bloques y una diferencia maxima de ida y vuelta de 0,0e+00 (bit a bit exacta). El calibrado se realizo con 6.144 tokens disjuntos de validacion de WikiText-2 (12x512, Track S72 / siliquant#95).

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas heredados del Qwen2.5-1.5B base (no se enumeran idiomas concretos en la informacion disponible).
- Razonamiento basico y respuesta conversacional, segun las capacidades del modelo base Qwen2.5-1.5B.
- Generacion de codigo y matematicas a nivel de modelo pequeno (el checkpoint incluye evaluacion especifica sobre CPython, con perplejidad 3,785 y top-1 match del 94,59 %).
- Compatibilidad drop-in con `transformers` mediante `AutoModelForCausalLM` y `trust_remote_code=True`, sin compilacion de C++/CUDA.
- Exportacion a pesos BF16 densos para su uso en otros motores mediante `siliquant_dequant.py unpack`.
- Verificacion criptografica de integridad del checkpoint (`siliquant_verification_receipt.json` con hashes SHA-256).
- Kernels de referencia incluidos: GEMV fusionado en PTX `sm_86` (Ampere) y decodificador AVX-512 (`vpermb` + `vpopcntq` + `vpdpbusd`) para CPU.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking explicitos para esta variante cuantizada.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM limitada: el checkpoint ocupa 1.258,62 MiB frente a 2.944,29 MiB en BF16, lo que permite cargar el modelo en tarjetas de 4-6 GB y dejar margen para el contexto y el estado KV, algo inviable con el BF16 original en GPUs pequenas.
- Prototipado e investigacion en cuantizacion: el formato `siliquant-hf-v1` es verificable bit a bit y proporciona metricas de KL, perplejidad y top-1 match, lo que lo hace util como banco de pruebas reproducible para tecnicas de codificacion algebraica.
- Inferencia en CPU con AVX-512: el kernel de referencia `kernels/avx512_a16_blockh4.c` permite ejecutar GEMV decodificando el formato empaquetado en servidores x86 sin GPU, util para entornos air-gapped o de bajo consumo.
- Generacion de codigo asistida en local: el modelo conserva el 94,59 % de top-1 match en CPython respecto al BF16, por lo que puede usarse en editores o asistentes ligeros que requieran baja huella de memoria.
- Evaluacion de pipelines de cuantizacion en CI: el CLI `siliquant_dequant.py verify` valida hashes SHA-256 y consistencia del codec, integrable en un pipeline de control de calidad de artefactos antes de publicar un checkpoint.
- Educacion y demostraciones de codigos correctores de errores aplicados a ML: la retícula `A_16` con Hamming `[16, 11, 4]` y las transformadas de Hadamard por bloques son un ejemplo didactico de como aplicar teoria de codigos a la compresion de pesos.
- Archivado y distribucion de checkpoints: la reduccion 2,34x del tamano y la verificacion de integridad facilitan la distribucion de modelos en entornos con ancho de banda limitado o requisitos de cadena de custodia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluacion sobre WikiText-2 y CPython, calibrado con 6.144 tokens disjuntos de WikiText-2):

| Metrica | Valor |
|---|---|
| `bf16_cpython_ppl` | 3,739529 |
| `cpython_ppl` | 3,785311 |
| `cpython_mean_kl` | 0,014898 |
| `cpython_top1_match_pct` | 94,5939 % |
| `bf16_wikitext2_ppl` | 12,617995 |
| `wikitext2_ppl` | 12,782489 |
| `wikitext2_mean_kl` | 0,022953 |
| `wikitext2_top1_match_pct` | 91,8787 % |
| `wikitext2_vs_blockh2_kl_delta` | -1,41 % (0,022953 vs 0,023281) |
| `wikitext2_vs_global_sort_kl_delta` | -14,31 % (0,022953 vs 0,026787) |
| Errores de sindrome Hamming `[16, 11, 4]` | 0 / 81.887.232 bloques |
| Diferencia maxima de ida y vuelta | 0,0e+00 (exacta bit a bit) |
| Tamano del checkpoint | 1.258,62 MiB vs 2.944,29 MiB BF16 (2,34x menor) |
| Bits por peso efectivos | 5,2055 bpw |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint empaquetado ocupa 1.258,62 MiB; sumando estado KV y overhead de runtime, cabe holgadamente en GPUs de 4 GB y con margen en 6-8 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con soporte CUDA y `bfloat16` (Ampere o superior). El kernel de referencia PTX esta compilado para `sm_86` (Ampere, p. ej. RTX 3090, A10, A40); en otras arquitecturas la decodificacion se realiza via PyTorch puro.
- Cabe en GPU de consumo: si, en RTX 3050/3060 6-8 GB, RTX 4060/4070, RTX 3090 y superiores. En GPUs de 4 GB puede requerir cuantizacion adicional del estado KV o contextos cortos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte directo), y exportacion a BF16 denso con `siliquant_dequant.py unpack` para cargar en vLLM, llama.cpp, Ollama o TGI tras la conversion. No se documenta integracion nativa con esos motores sin pasar por el unpack.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor menciona un kernel PTX compatible con `siliquant#93` a 606,20 Gw/s, sin especificar la GPU de medida ni el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadLPT-SharedNorm-4.5bpw` | 1.051.659.612 | no disponible | `siliquant-hf-v1` (5,2055 bpw efectivos) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `Qwen/Qwen2.5-1.5B` (base) | 1.500 M nominales | no disponible en esta ficha | BF16 / safetensors | Apache 2.0 | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1.500 M nominales | no disponible en esta ficha | BF16 / safetensors | Apache 2.0 | Hugging Face, muy popular |
| Cuantizaciones GGUF tipicas de Qwen2.5-1.5B (Q4_K_M, Q5_K_M) | 1.500 M nominales | no disponible en esta ficha | GGUF | Apache 2.0 | Amplia disponibilidad en el ecosistema llama.cpp |

La comparativa con cuantizaciones GGUF no se puede cerrar con numeros de perplejidad porque la model card no incluye evaluaciones frente a esos formatos; solo compara contra variantes internas del propio esquema (`BlockH2` y `global_sort`).

## Limitaciones y advertencias

- Es una cuantizacion post-entrenamiento: aunque la verificacion de ida y vuelta es exacta bit a bit respecto al checkpoint empaquetado, existe una perdida de calidad respecto al BF16 original, cuantificada en +0,164 puntos de perplejidad en WikiText-2 y +0,046 en CPython.
- Requiere `trust_remote_code=True` y ejecuta codigo Python del autor (`custom_code`), lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- El formato `siliquant-hf-v1` no es nativo de vLLM, llama.cpp, Ollama ni TGI; para usarlo en esos motores hay que exportar primero a BF16 denso, lo que anula la ventaja de tamano.
- Los kernels de referencia PTX estan compilados para `sm_86` (Ampere); en GPUs de otras arquitecturas el rendimiento puede degradarse al no usar el kernel fusionado.
- El modelo base Qwen2.5-1.5B tiene 1.500 M parametros nominales, por lo que sus capacidades de razonamiento, codigo y matematicas son las de un modelo pequeno; los benchmarks publicados son solo de perplejidad y top-1 match, no de tareas.
- No se documentan sesgos especificos de esta variante; hereda los del Qwen2.5-1.5B base, que no se detallan en la informacion disponible.
- No se especifican los idiomas soportados en la model card; la cobertura multilingue es la del modelo base, no verificada aqui.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en dominios sensibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Riesgo de alucinacion: inherente al modelo base de 1.500 M; la cuantizacion no lo mitiga y puede incrementarlo ligeramente por la perdida de precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadLPT-SharedNorm-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
- Repositorio de investigacion: https://github.com/Moissanite-Labs/siliquant
- Pull request #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- Pull request #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- Pull request #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- Pull request #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- Pull request #95: https://github.com/Moissanite-Labs/siliquant/pull/95
