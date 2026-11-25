# ahrazzle/Qwen2.5-0.5B-Siliquant-A16-BlockH4-QuadLPT-4.5bpw

## Resumen

Este repositorio contiene una versión cuantizada del modelo Qwen2.5-0.5B, desarrollada por el usuario ahrazzle, que aplica una técnica de cuantización reticular denominada Siliquant en formato `siliquant-hf-v1`. El objetivo es reducir el peso del checkpoint de 942,24 MiB en bfloat16 a 483,99 MiB (una reducción de 1,95x) manteniendo la fidelidad de los pesos mediante una codificación algebraica sin pérdida sobre una retícula de Hamming extendida `[16, 11, 4]`. El modelo base es el Qwen2.5-0.5B de Alibaba Qwen, un transformer decoder-only de 360.454.824 parámetros reales según los safetensors.

La relevancia de esta ficha es doble: por un lado, documenta un método de compresión poco habitual basado en códigos correctores de errores y transformadas de Hadamard por bloques, en lugar de las técnicas escalar o de grupo más comunes (GPTQ, AWQ, bitsandbytes); por otro lado, permite evaluar si merece la pena adoptar este formato frente a alternativas estándar de cuantización de 4-5 bits. El checkpoint se carga con `transformers` estándar mediante `trust_remote_code=True`, sin necesidad de compilaciones CUDA personalizadas, lo que rebaja la barrera de entrada.

El modelo está pensado para generación de texto conversacional en el rango de 0,5 mil millones de parámetros, por lo que su uso realista es prototipado, entornos con recursos limitados y experimentación con técnicas de cuantización. No se dispone de información sobre idiomas soportados más allá de los del modelo base, ni de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B); cuantización reticular Siliquant `A_16` Extended Hamming `[16, 11, 4]` con Block-Hadamard H4 y LPT |
| Parametros totales | 360.454.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-0.5B) |
| Tipos de cuantizacion | `siliquant-hf-v1`, receta `hA16_BlockH4_quad_lpt_real`, grupo `g=128`, objetivo 4,5 bpw; bits efectivos empaquetados 5,2523 bpw; capas lineales cuantizadas: 168 (357.826.560 pesos) |
| Idiomas soportados | no disponible (los del modelo base Qwen2.5-0.5B) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-0.5B) |
| Formato de pesos | safetensors (`model.safetensors`, 483,99 MiB), con código personalizado de descompresión (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-0.5B es un transformer decoder-only de 0,5 mil millones de parámetros. Sobre él, este repositorio aplica una cuantización post-entrenamiento sin fine-tuning: no hay datos de entrenamiento nuevos, sino una transformación de los pesos existentes. La receta `hA16_BlockH4_quad_lpt_real` combina tres piezas: una retícula `A_16 = 2Z^16 + C_[16,11,4]` donde cada vector de 16 pesos se codifica algebraicamente mediante 11 bits de información sistemática (`qham11`, 0,6875 bpw) y 5 bits de paridad reconstruibles; un cociente entero empaquetado por capa (`qquot`, con `k_bits` en {2, 3, 4}) más un desbordamiento CSR compacto; y escalas almacenadas como patrones de bits IEEE-754 exactos (`scales_fp16_bits` y opcionalmente `colscale_fp32_bits`) para evitar la truncación de mantisa al convertir a bfloat16.

La innovación técnica destacable es la verificación algebraica: el autor reporta 0 errores de síndrome en 22.364.160 bloques y una diferencia máxima de ida y vuelta de 0,0e+00 (bit a bit exacta). Además, se incluyen kernels de referencia independientes: uno CUDA `sm_86` (Ampere) con GEMV fusionado de 4 bits empaquetado y `dp4a.s32.s32`, y otro AVX-512 para CPU (`vpermb`, `vpopcntq`, `vpdpbusd`). Las capas `embed_tokens`, `lm_head`, RMSNorms y sesgos se conservan en bfloat16 sin cuantizar. El proceso de calibración usó 6.144 tokens disjuntos de validación de WikiText-2 (12x512).

## Capacidades

- Generación de texto autoregresiva y conversacional, heredada del modelo base Qwen2.5-0.5B.
- Carga directa con `transformers` (`AutoModelForCausalLM`) sin compilación de kernels personalizados; el descomprimidor se ejecuta en Python/PyTorch.
- Exportación a pesos densos bfloat16 mediante `python siliquant_dequant.py unpack . --out unpacked.safetensors --dtype bfloat16`, lo que permite reutilizar el modelo en otros motores de inferencia.
- Verificación de integridad end-to-end mediante `siliquant_verification_receipt.json` con hashes SHA-256 y comprobación del códec `A_16` en el 100 % de los bloques.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada; deben asumirse las del modelo base, sin garantía.
- Capacidades multilingües: no disponibles en la documentación de este repositorio.

## Casos de uso

- Prototipado de asistentes conversacionales en hardware modesto: el checkpoint de 484 MiB y 360 M de parámetros permite ejecutar un chatbot básico en CPU o en GPUs de gama baja, útil para validar flujos de producto antes de escalar a modelos mayores.
- Investigación en cuantización reticular: sirve como caso de estudio reproducible para comparar la receta `hA16_BlockH4_quad_lpt_real` frente a GPTQ, AWQ o bitsandbytes en términos de perplejidad y KL, usando las métricas publicadas (WikiText-2 PPL 18,31; KL 0,025955) como línea base.
- Despliegue en entornos con restricciones de almacenamiento: la reducción de 942,24 MiB a 483,99 MiB facilita distribuir el modelo en contenedores, imágenes de dispositivos edge o artefactos de CI con límites de tamaño.
- Verificación de integridad de artefactos ML: el recibo SHA-256 y el chequeo de síndrome permiten auditar que un checkpoint no ha sido manipulado, un caso útil en pipelines de suministro de software con requisitos de procedencia.
- Generación de texto de bajo coste en lotes: para tareas de etiquetado, resumen corto o clasificación generativa donde la latencia no es crítica y el presupuesto de cómputo es mínimo.
- Base para experimentos de decodificación y kernels: los kernels de referencia CUDA `sm_86` y AVX-512 incluidos permiten comparar implementaciones de GEMV de 4 bits frente a rutas estándar de PyTorch.
- Educación y reproducción de resultados: el script `siliquant_dequant.py` y los receipts permiten reproducir paso a paso la descompresión y verificar la afirmación de exactitud bit a bit.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de calidad de la cuantización (perplejidad y KL sobre WikiText-2 y CPython), no benchmarks de tareas estándar como MMLU, HumanEval o GSM8K.

| Corpus / métrica | Valor |
|---|---|
| `bf16_cpython_ppl` | 4,860631 |
| `bf16_wikitext2_ppl` | 17,950473 |
| `cpython_ppl` (cuantizado) | 4,972443 |
| `cpython_mean_kl` | 0,023575 |
| `cpython_top1_match_pct` | 92,7838 |
| `wikitext2_ppl` (cuantizado) | 18,312281 |
| `wikitext2_mean_kl` | 0,025955 |
| `wikitext2_top1_match_pct` | 91,047 |
| `wikitext2_vs_blockh2_kl_delta` | -3,76 % (0,025955 vs 0,026970) |
| `wikitext2_vs_global_sort_kl_delta` | -20,15 % (0,025955 vs 0,032504) |
| `wikitext2_vs_unperm_blockh4_kl_delta` | -11,76 % (0,025955 vs 0,029413) |
| Errores de síndrome Hamming `[16,11,4]` | 0 / 22.364.160 bloques |
| Diferencia máxima de ida y vuelta | 0,0e+00 (exacta bit a bit) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 483,99 MiB en disco; en memoria, los pesos cuantizados más el descompresor y las capas en bfloat16 requieren del orden de 1-2 GB de VRAM, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM; los kernels de referencia cubren `sm_86` (Ampere: RTX 30xx, A10, A40) y AVX-512 en CPU. No se documentan requisitos para Hopper o Blackwell.
- Cabe en GPU de consumo: sí, en RTX 3050/3060, RTX 4060/4070 y superiores; también en CPU con AVX-512.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (ruta oficial); exportación a safetensors densos en bfloat16 para usar con vLLM, llama.cpp, Ollama o TGI tras el `unpack`. No se garantiza compatibilidad directa con esos motores sin la conversión previa.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / compresión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-0.5B-Siliquant-A16-BlockH4-QuadLPT-4.5bpw | 360.454.824 | no disponible | Siliquant 4,5 bpw (5,2523 bpw efectivos), 484 MiB | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en esta ficha | bfloat16, 942,24 MiB | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B-Instruct (GPTQ/AWQ de la comunidad) | 0,5 B | no disponible en esta ficha | 4 bits grupo 128, ~300-400 MiB | Apache 2.0 | Hugging Face, múltiples variantes |

La comparación con alternativas cuantizadas de la comunidad (GPTQ, AWQ, bitsandbytes) no puede completarse con datos de rendimiento porque este repositorio no publica benchmarks de tareas y las variantes alternativas no se han consultado en la información proporcionada. La ventaja declarada frente a Block-H2 y a la ordenación global es de -3,76 % y -20,15 % en KL sobre WikiText-2, respectivamente, pero son comparaciones internas de la propia receta, no frente a GPTQ o AWQ.

## Limitaciones y advertencias

- Modelo de 0,5 mil millones de parámetros: capacidad de razonamiento, código y matemáticas muy limitada en comparación con modelos de 7 B o superiores; no apto para tareas de producción exigentes.
- Riesgo de alucinación inherente al modelo base Qwen2.5-0.5B, agravado por la cuantización: la coincidencia top-1 cae al 91-92 % frente al modelo en bfloat16, lo que implica que aproximadamente 1 de cada 11 tokens predichos difiere del original.
- Requiere `trust_remote_code=True`: ejecuta código Python del autor del repositorio, lo que supone un riesgo de seguridad en entornos no auditados; conviene revisar `siliquant_dequant.py` antes de usarlo.
- Compatibilidad limitada: no funciona de forma nativa en vLLM, llama.cpp, Ollama o TGI sin exportar previamente a safetensors densos; el rendimiento tras la exportación vuelve a bfloat16 y se pierde la compresión en memoria.
- Idiomas soportados no documentados en este repositorio; deben consultarse en la model card del modelo base.
- Longitud de contexto no documentada en esta ficha; se desconoce si la cuantización afecta al comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la licencia upstream de Qwen por si hubiera condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- Los kernels CUDA y AVX-512 son de referencia y "standalone"; no se integran automáticamente en el flujo de `transformers`, por lo que el usuario debe evaluar su corrección antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-0.5B-Siliquant-A16-BlockH4-QuadLPT-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-0.5B/blob/main/LICENSE
- Repositorio de investigación Siliquant: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
