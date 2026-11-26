# ahrazzle/holosphere-v3-unified-sm86-15m

## Resumen

HoloSphere-V3 Unified `15M` es un modelo de lenguaje a nivel de byte (byte language model) de aproximadamente 15 millones de parámetros publicado por el usuario `ahrazzle` bajo licencia Apache-2.0. Se presenta como la culminación de una pila de investigación denominada «Aletheia», que combina varias técnicas poco convencionales: inyección de bytes sin tabla de embeddings (zero-embedding), convolución depthwise causal sobre bytes, parametrización de pesos mediante cuantización «Siliquant A16 Block-H4» con código Hamming extendido `[16, 11, 4]`, y una formulación de atención basada en holonomía `SU(2)` de Cayley en lugar de RoPE. El objetivo declarado es lograr inferencia con estado constante `O(1)` y una ventana de contexto nativa de 8192 tokens.

El modelo se distribuye en formato `safetensors` con pesos empaquetados a 4.5 bits por peso (bpw) y escalas FP16, junto con kernels CUDA específicos para arquitectura Ampere `sm_86`. La model card incluye abundantes «recibos» de verificación (hashes SHA-256, comprobaciones de síndrome Hamming, paridad de logits) y resultados de ablaciones internas comparando su arquitectura con una línea base `RoPE-nGPT` del mismo tamaño.

Es relevante por su enfoque radicalmente distinto al transformer convencional (sin embeddings, sin RoPE, atención con estado constante), pero debe interpretarse con cautela: se trata de un artefacto de investigación de nicho, con cero descargas y cero «likes» en el momento de la consulta, sin benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con métricas internas medidas exclusivamente por el autor en una GPU de portátil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención de holonomía `SU(2)` de Cayley, inyección de bytes Walsh-Hadamard `bent4`, convolución depthwise causal de bytes; sin tabla de embeddings |
| Parámetros totales | 15.234.817 (según model card); 1.528.256 según metadatos de safetensors del Hub |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (nativo, `T = 8192`) |
| Tipos de cuantización | Pesos empaquetados `A_16 Block-H4` a 4.5 bpw con escalas FP16; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) y código |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (uint64 empaquetado + escalas FP16) |

Dimensiones declaradas: `D=512`, `H=16`, `L=6`, `d_ff=800`, `V=260`, `C=32`.

## Arquitectura y entrenamiento

La arquitectura sustituye la tabla de embeddings por una inyección de bytes mediante máscara Walsh-Hadamard `bent4` (Maiorana-McFarland) seguida de una convolución depthwise causal de bytes con 2048 parámetros, que según el autor garantiza cero fuga de información futura. La atención no usa RoPE: emplea una parametrización racional de Cayley para `SU(2)` con norma de pesos acotada (`||w|| <= 8.0`), precondicionamiento de gradiente «inverse-Fisher» y proyección tangente al espacio `S^3`. Los pesos lineales se entrenan desde el paso 0 con cuantización `SiliquantA16BlockH4STE` y corrección de error Int8 (`A16Int8ErrorFeedbackAdamW`), y se exportan empaquetados con verificación de síndrome Hamming extendido `[16, 11, 4]` (el autor reporta 0 errores en 945.280 bloques).

El estado de inferencia se describe como constante `O(1)` (0,8906 MiB frente a 192,0 MiB de una caché KV con RoPE para `B=2, T=8192`), mediante una formulación «Woodbury Chunk32» en FP32. No se detalla la composición del corpus de entrenamiento más allá de una mención a un corpus multi-dominio de 21,33 MB con licencia abierta y a ejecuciones de 600 pasos × `B=4, T=8192` (19.660.800 tokens) con semilla 2026. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto a nivel de byte en inglés y código.
- Modelado de secuencias largas con contexto nativo de 8192 tokens y estado de inferencia de tamaño constante.
- Inferencia con kernels CUDA propios para `sm_86` (Ampere), con soporte de decodificación en FP32.
- Protocolo de «canary» `SiliSense` de 4 bytes (`.sys` BER) y soporte de rollback de holonomía `Weft` de 16 bytes.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo «thinking».
- Capacidades multilingües limitadas a inglés y código.

## Casos de uso

- Investigación en arquitecturas sin embeddings: el modelo sirve como banco de pruebas reproducible para evaluar inyección de bytes Walsh-Hadamard frente a tablas de embeddings convencionales en secuencias de hasta 8192 tokens.
- Estudio de atención alternativa a RoPE: permite comparar la holonomía `SU(2)` de Cayley con atención RoPE estándar en tareas de modelado de lenguaje a pequeña escala, usando las ablaciones internas del autor como referencia.
- Inferencia con memoria acotada: su estado `O(1)` (0,8906 MiB declarados) lo hace adecuado para experimentos en dispositivos con VRAM limitada donde una caché KV crecería linealmente con la longitud.
- Evaluación de cuantización extrema: los pesos a 4,5 bpw con síndrome Hamming verificable permiten estudiar la robustez de la cuantización post-entrenamiento en modelos pequeños.
- Docencia y divulgación: por su tamaño (15M) y su naturaleza de byte-level, es útil para ilustrar conceptos de modelado de bytes, holonomía y cuantización empaquetada en cursos avanzados.
- Reproducción de artefactos de verificación: los hashes y recibos de la model card permiten auditar la integridad de pesos y kernels en entornos de investigación de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas internas de ablación (BPB, VRAM, tokens/s) medidas por el autor:

| Fila (`15M`, semilla 2026, 600 pasos) | BPB `T512` | BPB `T2048` | BPB `T8192` | VRAM pico (MiB) | Train tok/s | Prefill tok/s (`B=1, T=8192`) |
|---|---:|---:|---:|---:|---:|---:|
| `Row0_RoPE_nGPT` | 3,7362 | 3,6543 | 3,5933 | 2302,11 | 39260,5 | 65811,16 |
| `Row3_HoloSphereV3_UnifiedCellOp` | 2,9011 | 2,9422 | 2,5832 | 2895,78 | 15813,6 | 74163,44 |

Estos datos proceden exclusivamente del autor, en una RTX 3080 Laptop (8 GiB) y sin validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor reporta un estado de inferencia de 0,8906 MiB y un pico de entrenamiento de ~2,9 GiB en una RTX 3080 Laptop de 8 GiB.
- GPU recomendadas: arquitectura Ampere `sm_86` (RTX 3080/3090, A10, A40) por los kernels CUDA incluidos; no se documenta soporte para otras arquitecturas.
- Cabe en GPU de consumo: sí, según las mediciones del autor en una RTX 3080 Laptop.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el autor proporciona kernels CUDA propios y código PyTorch.
- Latencia y throughput: el autor declara 20,51 µs/token para CellOp a `T=8192` y 21,52 µs/token E2E a `T=16384` en microbenchmarks `sm_86`; sin verificación independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| HoloSphere-V3 Unified `15M` | 15,2M (card) / 1,5M (safetensors) | 8192 | Apache-2.0 | Hugging Face, 0 descargas | Arquitectura experimental, kernels `sm_86` |
| `Row0_RoPE_nGPT` (línea base del autor) | 15,3M | 8192 | No disponible | Solo en la model card | Línea base interna, no publicada como modelo |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face | Referencia estándar de tamaño similar en orden de magnitud |
| TinyLlama | 1,1B | 2048 | Apache-2.0 | Hugging Face | Modelo pequeño ampliamente usado; no comparable en arquitectura |

No se dispone de comparaciones con modelos de la misma categoría (byte-level, sin embeddings) validadas de forma independiente.

## Limitaciones y advertencias

- No hay benchmarks estándar publicados; el rendimiento real en tareas downstream es desconocido.
- El modelo es un artefacto de investigación con cero descargas y cero «likes»; no hay evidencia de uso en producción.
- La discrepancia entre los parámetros declarados en la model card (15.234.817) y los metadatos de safetensors del Hub (1.528.256) no está explicada y debe verificarse antes de cualquier uso.
- Idiomas limitados a inglés y código; sin capacidades multilingües documentadas.
- No se documenta soporte de tool calling, agentes, visión ni audio.
- Los kernels CUDA están optimizados para `sm_86`; en otras arquitecturas el rendimiento puede degradarse o no funcionar.
- Riesgo de alucinación inherente a un modelo de 15M entrenado con un corpus pequeño (21,33 MB declarados); la calidad del texto generado será muy limitada.
- Aunque la licencia es Apache-2.0, la model card menciona repositorios companion con licencia MIT y estados de PR dispares; conviene revisar la procedencia de cada componente antes de uso comercial.
- Los resultados de BPB y throughput proceden exclusivamente del autor, en una GPU de portátil y sin replicación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ahrazzle/holosphere-v3-unified-sm86-15m
- Repositorio `Moissanite-Labs/holosphere` (PR #3): https://github.com/Moissanite-Labs/holosphere/pull/3
- Repositorio `Moissanite-Labs/silisense` (PR #2): https://github.com/Moissanite-Labs/silisense/pull/2
- Repositorio `Moissanite-Labs/silikernels` (PR #4): https://github.com/Moissanite-Labs/silikernels/pull/4
- Repositorio `Moissanite-Labs/weft` (PR #233): https://github.com/Moissanite-Labs/weft/pull/233
