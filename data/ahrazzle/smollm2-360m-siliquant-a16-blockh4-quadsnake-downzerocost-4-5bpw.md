# ahrazzle/SmolLM2-360M-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw

## Resumen

SmolLM2-360M-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw es una versión cuantizada del modelo base SmolLM2-360M de HuggingFaceTB, publicada por el usuario ahrazzle. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión del checkpoint original mediante una técnica propietaria de cuantización de retícula denominada Siliquant, en formato `siliquant-hf-v1`. El objetivo es reducir el peso del modelo manteniendo la fidelidad numérica de los pesos, algo relevante para despliegues en entornos con memoria limitada.

La técnica emplea una retícula de Hamming extendida `[16, 11, 4]` sobre el retículo `A_16 = 2Z^16 + C`, combinada con transformadas de Hadamard por bloques (BlockH4) y un esquema de cuantización con grupos de tamaño 32. El resultado es un checkpoint de 294,47 MiB frente a los 690,12 MiB en bfloat16, es decir, 2,34 veces más pequeño, con una tasa efectiva de 5,4448 bits por peso. El autor reporta verificación bit a bit exacta en el viaje de ida y vuelta de descompresión.

El modelo conserva la arquitectura y capacidades del SmolLM2-360M original, un transformer decoder-only de 360M parámetros con licencia Apache 2.0. Su interés es fundamentalmente técnico: demuestra una vía de cuantización sin pérdida aparente de fidelidad de pesos y con kernels de referencia para CPU (AVX-512) y GPU (Ampere sm_86), aunque no se han publicado evaluaciones de calidad downstream más allá de perplejidad y KL sobre WikiText-2 y un corpus de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M) |
| Parametros totales | 247.237.974 (safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Siliquant `siliquant-hf-v1`, receta `b45_hA16_BlockH4_quad_snake_down_zerocost`, grupo g=32, objetivo 4,5 bpw, efectivo 5,4448 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de SmolLM2-360M) |
| Formato de pesos | safetensors (bit-packed, `siliquant-hf-v1`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SmolLM2-360M original: un transformer decoder-only denso. No hay reentrenamiento ni ajuste fino; la publicación es una transformación de cuantización del checkpoint base. Las capas lineales cuantizadas son 224, con 314.572.800 pesos empaquetados. Los embeddings de tokens, la cabeza `lm_head`, las RMSNorm y los sesgos se conservan en bfloat16 sin tocar.

La innovación técnica reside en el códec. Cada vector de 16 pesos se representa como un punto del retículo `A_16 = 2Z^16 + C_{[16,11,4]}`, almacenado mediante 11 bits sistemáticos de información (`qham11`, 0,6875 bpw) que reconstruyen algebraicamente los 5 bits de paridad en las posiciones `{0, 1, 2, 4, 8}`, más un cociente entero empaquetado por capa (`qquot`) con bits en `{2, 3, 4}` y desbordamientos en formato CSR, y escalas en fp16/int16 con patrones IEEE-754 exactos. La transformada BlockH4 de Hadamard y el esquema "quad snake down" forman parte de la receta. El autor declara cero errores de síndrome en 19.660.800 bloques y diferencia máxima de ida y vuelta de 0,0, es decir, reconstrucción bit a bit exacta. La calibración se realizó con 6.144 tokens disjuntos de validación de WikiText-2 (12×512). No se documentan datos de entrenamiento propios ni etapas de RLHF o DPO, ya que el modelo no se reentrena.

## Capacidades

- Generación de texto autoregresiva, heredada del SmolLM2-360M base.
- Razonamiento y código en la medida en que lo soporte el modelo base (no se aportan evaluaciones específicas).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Verificación de integridad criptográfica del checkpoint mediante `siliquant_verification_receipt.json` (SHA-256 por archivo).
- Exportación a pesos densos bfloat16 mediante la CLI `siliquant_dequant.py unpack`.

## Casos de uso

- Despliegue en dispositivos con memoria muy limitada: el checkpoint ocupa 294,47 MiB frente a 690,12 MiB en bf16, lo que permite cargar el modelo en GPUs de gama baja o en CPU con RAM restringida, manteniendo la fidelidad de pesos declarada.
- Investigación en cuantización de retículas: sirve como referencia reproducible para estudiar el códec `A_16` con Hamming extendido, la transformada BlockH4 y el esquema de cocientes con desbordamiento CSR.
- Validación de pipelines de verificación: la CLI `siliquant_dequant.py verify` permite comprobar la integridad SHA-256 del checkpoint y la consistencia del códec en el 100% de los bloques, útil en entornos con requisitos de trazabilidad.
- Prototipado rápido de generación de texto en local: al requerir solo `torch`, `transformers` y `safetensors`, sin compilaciones C++/CUDA, se puede integrar en notebooks o scripts de experimentación con un `from_pretrained` estándar.
- Benchmarking de kernels de decodificación: los kernels de referencia AVX-512 y sm_86 incluidos permiten medir el rendimiento de GEMV con `dp4a`/`vpdpbusd` en CPU y GPU Ampere.
- Exportación a motores downstream: mediante `unpack` se obtienen pesos densos bf16 utilizables en vLLM, llama.cpp u otros motores que no soporten el formato Siliquant nativo.
- Estudio de compresión sin pérdida de pesos: la combinación de `qham11`, `qquot` y escalas exactas permite analizar compromisos entre tasa de bits y fidelidad numérica en modelos pequeños.

## Benchmarks y rendimiento

| Corpus / Métrica | Valor |
|---|---|
| bf16 cpython ppl | 5,044993 |
| bf16 wikitext2 ppl | 16,394834 |
| cpython mean KL | 0,025417 |
| cpython ppl | 5,124338 |
| cpython top1 match (%) | 92,2945 |
| cpython vs BlockH2 KL delta | -22,88% (0,025417 vs 0,032959) |
| wikitext2 mean KL | 0,027934 |
| wikitext2 ppl | 16,926345 |
| wikitext2 top1 match (%) | 90,411 |
| wikitext2 vs BlockH2 KL delta | -21,65% (0,027934 vs 0,035651) |
| runtime gather overhead | 0,00% (plegado offline en filas de salida de gate_proj/up_proj) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas de fidelidad de cuantización respecto al modelo bf16, no de calidad absoluta en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint empaquetado ocupa 294,47 MiB; al descomprimir a bf16 en memoria se aproxima a los 690 MiB del modelo base, más overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el checkpoint empaquetado; para el modelo descomprimido en bf16, 2-4 GB. Los kernels de referencia cubren sm_86 (Ampere) y AVX-512 en CPU.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 y superiores; también en CPU con AVX-512.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía principal), exportación a bf16 denso para vLLM, llama.cpp u Ollama mediante `siliquant_dequant.py unpack`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor declara 0,00% de overhead de gather en tiempo de ejecución gracias al plegado offline.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Siliquant (este) | 247,2 M | no disponible | Apache 2.0 | safetensors bit-packed | 5,4448 bpw efectivos, 294,47 MiB |
| SmolLM2-360M (base) | ~360 M | no disponible | Apache 2.0 | safetensors bf16 | 690,12 MiB, referencia de calidad |
| Otras cuantizaciones del base (GPTQ, AWQ, GGUF) | ~360 M | no disponible | Apache 2.0 | múltiples | No se aportan datos comparativos en la información disponible |

No se dispone de comparaciones con alternativas de la misma categoría (por ejemplo, Qwen2.5-0.5B o TinyLlama-1.1B) en la información proporcionada.

## Limitaciones y advertencias

- Modelo base de 360M parámetros: capacidad limitada de razonamiento y conocimiento factual en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en dominios especializados.
- No se documentan sesgos específicos; al heredar el comportamiento del SmolLM2-360M, pueden persistir los sesgos del corpus original.
- Idiomas soportados no documentados; se desconoce el rendimiento fuera del inglés.
- Longitud de contexto no disponible en la información proporcionada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- El formato `siliquant-hf-v1` no es estándar: la integración con motores como vLLM o llama.cpp requiere exportar previamente a bf16 denso.
- Las métricas publicadas son de fidelidad de cuantización (perplejidad, KL, top-1 match) y no de calidad en tareas downstream; no hay evidencia de rendimiento en MMLU, HumanEval o GSM8K.
- Las afirmaciones de "récord" del autor (All-Time SmolLM2-360M Python Record, WikiText-2 Record) no están contrastadas de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones del código de decodificación incluido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/SmolLM2-360M-Siliquant-A16-BlockH4-QuadSnake-DownZeroCost-4.5bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Licencia del base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M/blob/main/LICENSE
- Repositorio de investigación: https://github.com/Moissanite-Labs/siliquant
- PRs relacionados: [#83](https://github.com/Moissanite-Labs/siliquant/pull/83), [#85](https://github.com/Moissanite-Labs/siliquant/pull/85), [#91](https://github.com/Moissanite-Labs/siliquant/pull/91), [#93](https://github.com/Moissanite-Labs/siliquant/pull/93), [#95](https://github.com/Moissanite-Labs/siliquant/pull/95)
