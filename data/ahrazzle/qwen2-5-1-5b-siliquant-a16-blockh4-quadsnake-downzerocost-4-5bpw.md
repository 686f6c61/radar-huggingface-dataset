# ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw

## Resumen

Este repositorio contiene una version cuantizada del modelo Qwen2.5-1.5B, desarrollada por el usuario ahrazzle, que aplica una tecnica de cuantizacion en red (lattice quantization) denominada Siliquant, en su variante `A_16` Extended Hamming `[16, 11, 4]` con transformada de Hadamard por bloques de 4 y "quad snake" con coste cero en la proyeccion down. El objetivo es reducir el peso del checkpoint de 2944,29 MiB en BF16 a 1256,17 MiB (2,34x menor) manteniendo una fidelidad casi exacta respecto al modelo original, con un objetivo declarado de 4,5 bits por peso (bpw) y un tamaño de grupo de 128.

El modelo base es el Qwen2.5-1.5B de Alibaba, un transformer decoder-only de 1.050.735.530 parametros reales segun safetensors, con licencia Apache 2.0. Esta version cuantizada conserva en bfloat16 las capas `embed_tokens`, `lm_head`, las RMSNorm y los sesgos, mientras que las 196 capas lineales (1.310.195.712 pesos) se almacenan en el formato propietario `siliquant-hf-v1`.

La relevancia de esta ficha es doble: por un lado, demuestra que es posible comprimir un modelo de 1.5B a 4,5 bpw con verificacion exacta bit a bit y sin errores de sindrome en los 81.887.232 bloques; por otro, introduce un formato de empaquetado con verificacion criptografica (SHA-256) que puede interesar a quienes trabajan en pipelines de cuantizacion reproducible. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y su model card no documenta la calidad en tareas generativas mas alla de perplejidad y KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), pesos lineales en lattice quantization `A_16` Extended Hamming `[16, 11, 4]` |
| Parametros totales | 1.050.735.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen2.5-1.5B base, no confirmada en esta ficha) |
| Tipos de cuantizacion | Lattice quantization `A_16` con `qham11` (11 bits sistematicos por bloque de 16), `qquot` (2-4 bits por capa), escalas fp16 exactas y colscale fp32 opcional; objetivo 4,5 bpw, efectivo 5,19 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B) |
| Formato de pesos | safetensors (formato `siliquant-hf-v1`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B es un transformer decoder-only con atencion causal estandar, entrenado por Alibaba con datos multilingues y tecnicas de alineacion (RLHF/DPO) segun la documentacion publica del modelo original. Esta version no reentrena el modelo: aplica una cuantizacion post-entrenamiento sobre las 196 capas lineales, preservando `embed_tokens`, `lm_head`, RMSNorm y sesgos en bfloat16.

La innovacion tecnica es el codec `siliquant-hf-v1`: cada vector de 16 pesos se mapea a `A_16 = 2 Z^16 + C_{[16, 11, 4]}`, almacenando 11 bits de informacion sistematica (`qham11`) por bloque y reconstruyendo algebraicamente 5 bits de paridad en las posiciones `{0, 1, 2, 4, 8}`. Los cocientes se empaquetan con `qquot` (2-4 bits segun capa) mas un CSR compacto para desbordamientos. La verificacion de sindrome reporta 0 errores en 81.887.232 bloques y una diferencia maxima de ida y vuelta de 0.0 (exacta bit a bit). El autor indica que el coste de "gather" en tiempo de ejecucion es del 0,00% porque se pliega en linea en las filas de salida de `gate_proj`/`up_proj` (`perm_in=None` en las 196 capas). Se incluyen kernels de referencia en CUDA (sm_86, PTX con `dp4a`) y AVX-512 (`vpermb`, `vpopcntq`, `vpdpbusd`), aunque el uso en `transformers` no requiere compilacion C++/CUDA.

## Capacidades

- Generacion de texto autoregresiva en el mismo rango de capacidades que Qwen2.5-1.5B (razonamiento basico, codigo, matematicas, conversacion).
- Soporte de tool calling y function calling heredado del modelo base (no verificado especificamente en esta cuantizacion).
- Capacidad de agentes y razonamiento multi-paso limitada por el tamaño del modelo base (1.5B).
- Capacidades multilingues heredadas de Qwen2.5, aunque la model card no documenta idiomas soportados para esta version.
- Sin vision, audio ni modo "thinking" documentados.
- Verificacion de integridad del checkpoint mediante `siliquant_verification_receipt.json` con hashes SHA-256 y comprobacion de sindrome en el 100% de los bloques.

## Casos de uso

- Despliegue en entornos con memoria limitada: el checkpoint de 1256,17 MiB permite cargar el modelo en GPUs consumer con 8 GB o menos, algo imposible con los 2944,29 MiB en BF16.
- Prototipado rapido en CPU: al requerir solo `torch`, `transformers` y `safetensors`, y ofrecer kernel AVX-512 de referencia, es util para pruebas en estaciones de trabajo sin GPU.
- Investigacion en cuantizacion: sirve como caso de estudio reproducible de lattice quantization con verificacion exacta, comparando perplejidad y KL frente al modelo BF16.
- Generacion de texto en aplicaciones de baja latencia y bajo coste: tareas de autocompletado, resumen corto o clasificacion textual donde 1.5B es suficiente.
- Evaluacion de formatos de compresion: util para medir el impacto de 4,5 bpw frente a otras tecnicas (GPTQ, AWQ, GGUF) sobre un mismo modelo base.
- Educacion y divulgacion: el CLI `siliquant_dequant.py` permite inspeccionar el proceso de descompresion y verificar la integridad de los pesos paso a paso.

## Benchmarks y rendimiento

| Corpus / Metrica | Valor |
|---|---|
| `bf16_cpython_ppl` | 3,739529 |
| `bf16_wikitext2_ppl` | 12,617995 |
| `cpython_ppl` | 3,802756 |
| `cpython_mean_kl` | 0,015399 |
| `cpython_top1_match_pct` | 94,7896 |
| `wikitext2_ppl` | 12,804216 |
| `wikitext2_mean_kl` | 0,022783 |
| `wikitext2_top1_match_pct` | 92,4902 |
| `wikitext2_vs_blockh2_kl_delta` | -2,14% (0,022783 vs 0,023281) |

Datos de calibracion: 6.144 tokens disjuntos de validacion de WikiText-2 (12x512). No se han publicado resultados de benchmarks en tareas generativas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se incluye kernel de referencia para Ampere `sm_86` (RTX 30xx, A100) y kernel AVX-512 para CPU.
- Cabe en GPU consumer: si, en RTX 3050/3060, RTX 4060, GTX 1660 con 6 GB o superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El CLI `siliquant_dequant.py unpack` permite exportar a BF16 denso para motores downstream.
- Latencia y throughput: no disponibles. El autor reporta 0,00% de overhead de gather en tiempo de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw | 1.050.735.530 | no disponible | Apache 2.0 | safetensors `siliquant-hf-v1` | 1256,17 MiB, 5,19 bpw efectivos |
| Qwen/Qwen2.5-1.5B (BF16) | 1.500M aprox. | 32.768 tokens (segun doc. oficial de Qwen2.5) | Apache 2.0 | safetensors | 2944,29 MiB, referencia de calidad |
| Qwen2.5-1.5B-Instruct GPTQ/AWQ (comunidad) | 1.500M aprox. | 32.768 tokens | Apache 2.0 | safetensors | 4-8 bits, soporte amplio en vLLM/TGI |

No se dispone de datos de benchmarks comparativos directos entre esta cuantizacion y alternativas GPTQ/AWQ en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay validacion comunitaria ni reportes de uso en produccion.
- No se documentan sesgos conocidos especificos de esta cuantizacion; hereda los del Qwen2.5-1.5B base.
- Riesgo de alucinacion propio de un modelo de 1.5B, agravado por la cuantizacion (top-1 match del 92,49% en WikiText-2 y 94,79% en CPython).
- La model card no documenta idiomas soportados ni longitud de contexto efectiva tras la cuantizacion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de usar en produccion.
- El formato `siliquant-hf-v1` no es estandar: no hay soporte conocido en vLLM, llama.cpp, Ollama o TGI sin exportar previamente a BF16.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del modelo base Qwen2.5-1.5B para uso comercial.
- Los kernels CUDA/AVX-512 son de referencia y "standalone"; su rendimiento real en produccion no esta medido en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-1.5B-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
- Repositorio de investigacion: https://github.com/Moissanite-Labs/siliquant
- PRs relacionados: https://github.com/Moissanite-Labs/siliquant/pull/83, https://github.com/Moissanite-Labs/siliquant/pull/85, https://github.com/Moissanite-Labs/siliquant/pull/91, https://github.com/Moissanite-Labs/siliquant/pull/93, https://github.com/Moissanite-Labs/siliquant/pull/95
