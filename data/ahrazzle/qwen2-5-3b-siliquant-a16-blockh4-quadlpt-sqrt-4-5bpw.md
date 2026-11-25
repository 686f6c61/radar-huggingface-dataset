# ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-Sqrt-4.5bpw

## Resumen

`ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-Sqrt-4.5bpw` es una versión cuantizada del modelo `Qwen/Qwen2.5-3B` de Alibaba, publicada por el usuario ahrazzle. No se trata de un modelo nuevo entrenado desde cero, sino de una compresión del checkpoint original mediante una técnica propietaria denominada Siliquant, que combina retículos de Hamming extendidos `[16, 11, 4]`, transformadas de Hadamard por bloques y empaquetado de cuocientes con escalas en coma flotante de precisión exacta.

El problema que aborda es el de la compresión de pesos sin pérdida algebraica verificable: el autor certifica que el round-trip de descompresión es bit a bit exacto (diferencia máxima `0.0e+00`) sobre los 173.408.256 bloques del checkpoint, y que el tamaño final es de 2.326,55 MiB frente a 5.885,79 MiB en BF16 (2,53x más pequeño). El formato se denomina `siliquant-hf-v1` y se carga con `transformers` estándar mediante `trust_remote_code=True`, sin necesidad de extensiones C++/CUDA.

La relevancia es doble: por un lado, demuestra un esquema de cuantización post-entrenamiento con verificación criptográfica de integridad (hashes SHA-256 por fichero en `siliquant_verification_receipt.json`); por otro, mantiene la fidelidad de salida respecto al modelo base con una KL media de 0,01952 en CPython y 0,025296 en WikiText-2, y un top-1 match del 95,11 % y 92,17 % respectivamente. El modelo base Qwen2.5-3B tiene 3.000 millones de parámetros nominales, aunque el safetensors real reporta 2.050.689.684 parámetros (excluyendo `lm_head` y embeddings compartidos en el conteo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con capas lineales cuantizadas en formato Siliquant `siliquant-hf-v1` |
| Parametros totales | 2.050.689.684 (safetensors real); 2.774.532.096 pesos en 252 capas lineales cuantizadas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B, no confirmada) |
| Tipos de cuantizacion | Retículo `A_16` Extended Hamming `[16, 11, 4]`, Block-Hadamard H4, cuocientes empaquetados (`qquot`, 2-4 bits), escalas FP16 exactas; objetivo 4,5 bpw, efectivo 5,2377 bpw; group size g=128 |
| Idiomas soportados | no disponible (heredados de Qwen2.5-3B, no confirmados) |
| Licencia | qwen-research (heredada de Qwen/Qwen2.5-3B) |
| Formato de pesos | safetensors bit-packed (formato `siliquant-hf-v1`), con kernels de referencia en CUDA (`sm_86`) y AVX-512 |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `Qwen/Qwen2.5-3B`, que es un transformer decoder-only denso. La innovación no está en el entrenamiento (no hay reentrenamiento ni fine-tuning documentado) sino en el esquema de compresión: cada vector de 16 pesos se representa como un elemento del retículo `A_16 = 2 Z^16 + C_{[16, 11, 4]}`, donde `C` es un código de Hamming extendido. Los 11 bits sistemáticos de información se almacenan en `qham11` (0,6875 bpw) y los 5 bits de paridad se reconstruyen algebraicamente en las posiciones `{0, 1, 2, 4, 8}`. Los cuocientes enteros `k = (y - c) >> 1` se empaquetan por capa en `qquot` con 2 a 4 bits y un CSR compacto para desbordamientos (`qov_rowptr`, `qov_col`, `qov_val`).

Se aplica además una transformada de Hadamard por bloques de tamaño 4 (Block-H4) y una permutación cuadrada LPT (QuadLPT) con normalización por raíz cuadrada, según la receta `hA16_BlockH4_quad_lpt_sqrt_real`. Las escalas y las escalas de columna se guardan como patrones de bits IEEE-754 exactos (`scales_fp16_bits` como `int16`, `colscale_fp32_bits` como `int32`), lo que evita la truncación de mantisa que produciría un `.to(bfloat16)`. La calibración emplea 6.144 tokens disjuntos de validación de WikiText-2 (12 secuencias de 512 tokens, `load_power=0.5`). No se documenta RLHF ni DPO, ya que el modelo hereda el alineamiento del Qwen2.5-3B original.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del Qwen2.5-3B base (no se documentan capacidades adicionales específicas de esta versión cuantizada).
- Razonamiento y matemáticas: presumiblemente conservadas del modelo base, aunque no se aportan benchmarks específicos de tarea en la información disponible.
- Generación de código: presumiblemente conservada del modelo base; la validación se hace sobre el corpus CPython con perplejidad 3,171 y KL 0,01952 frente a BF16.
- Tool calling / function calling: no disponible en la información proporcionada para esta versión; el modelo base Qwen2.5-3B lo soporta, pero no se certifica aquí.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada para esta versión.
- Capacidades multilingües: no disponibles en la información proporcionada; heredadas del base sin confirmar.
- Capacidades especiales: decodificación determinista verificable bit a bit, exportación a BF16 denso mediante CLI (`siliquant_dequant.py unpack`), y kernels de referencia GEMV para Ampere `sm_86` y CPU AVX-512.

## Casos de uso

- Despliegue en GPUs de gama media con VRAM limitada: con 2,4 GB de checkpoint y 5,2377 bpw efectivos, el modelo cabe en GPUs consumer de 8 GB o menos, permitiendo ejecutar un modelo de la familia Qwen2.5 en hardware modesto sin pérdida medible de calidad (top-1 match superior al 92 % en WikiText-2).
- Investigación en cuantización post-entrenamiento: sirve como referencia reproducible de un esquema de retículos algebraicos con verificación de integridad SHA-256, útil para comparar técnicas de compresión sin pérdida frente a GPTQ, AWQ o GGUF K-quants.
- Validación de pipelines de inferencia: el comando `siliquant_dequant.py verify .` permite auditar la integridad de los pesos antes de desplegar en producción, rechazando ficheros manipulados, ausentes o enlazados simbólicamente, lo que encaja en flujos de supply-chain security.
- Exportación a motores downstream: `siliquant_dequant.py unpack --out unpacked.safetensors --dtype bfloat16` genera pesos BF16 densos que se pueden cargar en vLLM, TGI o llama.cpp tras la conversión oportuna, facilitando la integración con stacks existentes.
- Evaluación de fidelidad de cuantización: los datos de KL y top-1 match permiten usar el modelo como banco de pruebas para medir el impacto de distintas recetas de cuantización sobre tareas de código (CPython) y texto general (WikiText-2).
- Docencia y experimentación con transformers: al requerir solo `torch`, `transformers` y `safetensors` (sin compilación C++/CUDA), es adecuado para entornos docentes o de investigación donde no se dispone de toolchains de GPU.
- Referencia para implementaciones de kernels: los ficheros `kernels/sm86_a16_blockh4.cu` y `kernels/avx512_a16_blockh4.c` sirven como base para quien quiera implementar decodificación GEMV optimizada en Ampere o AVX-512.

## Benchmarks y rendimiento

| Corpus / metrica | BF16 (referencia) | Siliquant 4.5bpw | Delta |
|---|---|---|---|
| Perplejidad CPython | 3,111936 | 3,171149 | +1,90 % |
| Perplejidad WikiText-2 | 10,970193 | 11,187559 | +1,98 % |
| KL media CPython | — | 0,019520 | — |
| KL media WikiText-2 | — | 0,025296 | — |
| Top-1 match CPython | — | 95,1076 % | — |
| Top-1 match WikiText-2 | — | 92,1722 % | — |
| KL vs Block-H2 (CPython) | — | -15,04 % (0,019520 vs 0,022975) | mejora |
| KL vs global-sort (CPython) | — | -10,32 % (0,019520 vs 0,021765) | mejora |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos certificados son de perplejidad, KL y top-1 match sobre CPython y WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB para los pesos cuantizados, más overhead de activaciones y caché KV. Con contexto corto, cabe en GPUs de 4-6 GB; con contexto largo, se recomienda 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte BF16 y al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, A10, L4). Para los kernels de referencia CUDA se requiere arquitectura Ampere `sm_86` (RTX 30xx, A10, A40).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo del formato); exportación a BF16 denso para vLLM, TGI o llama.cpp previa conversión; kernels de referencia CUDA `sm_86` y AVX-512 incluidos.
- Latencia y throughput: no disponibles en la información proporcionada. El autor no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bpw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-Sqrt-4.5bpw | 2.050.689.684 (safetensors) | no disponible | Siliquant `siliquant-hf-v1`, 5,2377 bpw efectivos | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B (base) | ~3.000 M nominales | 32.768 tokens (según ficha oficial de Qwen2.5-3B) | BF16 | qwen-research | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct-GGUF (Q4_K_M) | ~3.000 M nominales | 32.768 tokens | GGUF Q4_K_M (~4,5 bpw) | qwen-research | Hugging Face, muy difundido |
| Qwen/Qwen2.5-3B-Instruct-AWQ | ~3.000 M nominales | 32.768 tokens | AWQ 4-bit | qwen-research | Hugging Face, ampliamente usado |

La comparación con GGUF Q4_K_M y AWQ 4-bit es la más directa por régimen de bits por peso. La ventaja declarada de esta versión es la verificación bit a bit exacta del round-trip y la integridad criptográfica, junto con una KL medida frente al BF16 original; la desventaja es la falta de soporte en motores de inferencia maduros (vLLM, llama.cpp) sin exportación previa y la ausencia de benchmarks de tarea publicados.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial. Cualquier despliegue en producción requiere revisar los términos de la licencia de Qwen2.5-3B y, probablemente, obtener permiso de Alibaba.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- No se publican benchmarks de tarea (MMLU, HumanEval, GSM8K): solo perplejidad, KL y top-1 match sobre CPython y WikiText-2. La calidad en tareas específicas no está certificada.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas de esta versión; se heredan del Qwen2.5-3B base, que sí tiene documentación al respecto en su ficha oficial.
- El formato `siliquant-hf-v1` requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- La decodificación se realiza en PyTorch puro, sin kernels optimizados por defecto; el rendimiento en producción puede ser inferior al de formatos nativos como GGUF o AWQ hasta que se integren los kernels de referencia.
- Los kernels CUDA de referencia están limitados a `sm_86` (Ampere); no se documentan versiones para Hopper, Ada Lovelace ni arquitecturas anteriores.
- La verificación de integridad depende de `siliquant_verification_receipt.json`; si se modifica cualquier fichero, la verificación falla por diseño, lo que puede complicar flujos de reempaquetado.
- El conteo de parámetros del safetensors (2.050.689.684) difiere del nominal del modelo base (~3.000 M), presumiblemente por el empaquetado y por el tratamiento de embeddings y `lm_head`; conviene tenerlo en cuenta al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-Sqrt-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Repositorio de investigación Siliquant: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
