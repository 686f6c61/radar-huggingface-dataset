# FreedomAISVR/Gemma-4-12B-it-QAT-NVFP4-GGUF

## Resumen

Gemma-4-12B-it-QAT-NVFP4-GGUF es una cuantización de 4 bits en formato NVFP4 del modelo oficial Gemma 4 12B Instruct de Google, publicada por el usuario FreedomAISVR. Se reconstruye a partir de `google/gemma-4-12B-it-qat-q4_0-unquantized`, la release oficial de Google con Quantization-Aware Training (QAT), y se distribuye como archivo GGUF compatible con llama.cpp. El modelo conserva las capacidades multimodales (visión) del original mediante un proyector visual separado (`mmproj`) y mantiene una ventana de contexto de 256K tokens.

La relevancia de esta ficha radica en que expone una comparativa empírica entre dos formatos de 4 bits (NVFP4 y MXFP4) sobre hardware Blackwell (RTX 50-series), con mediciones de prefill y decode en llama.cpp. El modelo tiene 11.907.350.576 parámetros y ocupa 7,22 GB en disco con 4,85 bits por parámetro, lo que lo hace desplegable en GPUs de consumo con 16 GB de VRAM.

La licencia es Apache 2.0, lo que facilita su uso comercial. El autor verifica funcionamiento de visión (OCR y aritmética sobre imagen) y contexto de 256K con caché KV en Q8_0, aunque advierte de una limitación crítica: el proyector visual no debe reconvertirse a F16 porque rompe la visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), multimodal con proyector visual; detalles de capas no disponibles |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K), verificado con KV Q8_0 |
| Tipos de cuantización | NVFP4 (4 bits, E2M1 con escala E4M3 por bloque de 16 + escala FP32 por tensor); embeddings en Q8_0; normas en F32; proyector visual en F32/BF16 |
| Idiomas soportados | Inglés y multilingüe (según tags; lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal + `mmproj` separado para visión) |
| Bits por parámetro (BPW) | 4,85 (archivo completo) |
| Tensores | 667 (328 NVFP4, 338 F32, matriz de embeddings en Q8_0) |
| Tamaño del archivo principal | 7.219.672.864 B (7,22 GB) |
| Tamaño del proyector visual | 175.115.616 B (175 MB) |
| Tamaño del repo | 21,3 GB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B Instruct de Google, entrenado con Quantization-Aware Training (QAT) en la release `qat-q4_0-unquantized`. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta build concreta es la cuantización NVFP4: valores de 4 bits en formato E2M1 con una escala de bloque E4M3 cada 16 valores y una escala FP32 por tensor. El autor mantiene la matriz de embeddings en Q8_0 (262.144 × 3.840) por considerar que 4 bits es un mal compromiso para esa matriz, y mantiene las normas en F32 porque cuantizarlas aporta poco y cuesta precisión. No hay trucos híbridos: todos los pesos del transformer son genuinamente NVFP4. El proyector visual se distribuye en F32/BF16 de forma deliberada, idéntico byte a byte al oficial de Google.

El autor documenta que tanto NVFP4 como MXFP4 usan la misma ruta nativa de tensor cores FP4 de Blackwell (`GGML_TYPE_MXFP4 || GGML_TYPE_NVFP4`), con compilación `CMAKE_CUDA_ARCHITECTURES=native` e inclusión de `sm_120` en `ggml-cuda.dll`. La diferencia entre formatos es de tamaño de archivo y eficiencia de cómputo, no de disponibilidad de kernels.

## Capacidades

- Generación de texto conversacional e instrucciones (modelo `-it`).
- Razonamiento y matemáticas básicas: verificado en prueba de OCR con `12 + 37 = 49`.
- Visión multimodal: OCR y transcripción de imágenes mediante `mmproj` separado.
- Contexto largo: 256K tokens verificados con prompt de 257.620 tokens.
- Soporte multilingüe (según tags; cobertura exacta no disponible).
- Plantilla de chat propia de Gemma 4 (`<|turn>…<turn|>`, `<|think|>`) que requiere `--jinja` en llama.cpp.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking: la plantilla incluye `<|think|>`, pero no se detalla su comportamiento.
- Audio: no disponible.

## Casos de uso

- OCR y digitalización de documentos: el modelo transcribe texto de imágenes con precisión verificada (números de parte, lotes y operaciones aritméticas). Adecuado para pipelines de extracción de datos de facturas, albaranes o etiquetas.
- Procesamiento de contexto largo en RAG: con 256K tokens y KV Q8_0 cabe en 16 GB de VRAM, lo que permite indexar corpus extensos y responder con prompt de más de 250.000 tokens en una sola pasada.
- Bucles agénticos y contextos de código grandes: el formato NVFP4 ofrece hasta un 17% más de velocidad en prefill (3.434 t/s en pp8192), lo que favorece cargas con prompts largos y múltiples iteraciones.
- Chat interactivo en streaming: si la latencia de decode es prioritaria, el autor recomienda MXFP4 (51,65 t/s frente a 47,74 t/s en tg128), aunque esta build NVFP4 es válida para generación interactiva con ~47 t/s en contexto corto.
- Despliegue en estación de trabajo con GPU de consumo: con 7,22 GB de pesos y ~2,4 GiB de caché KV a 256K, cabe en una RTX 5060 Ti de 16 GB con aproximadamente 2,2 GB de margen.
- Asistente multimodal local con privacidad: al ejecutarse en llama.cpp sobre hardware local, permite procesar imágenes y texto sin enviar datos a servicios externos.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el compromiso entre tamaño de archivo y eficiencia de cómputo en Blackwell (NVFP4 frente a MXFP4).

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí publica mediciones de rendimiento de inferencia en llama.cpp b1868 (`4fea119d`), RTX 5060 Ti 16 GB, CUDA 13.2.

Prefill (procesamiento de prompt), tokens por segundo:

| Test | MXFP4 | NVFP4 | Delta |
|---|---|---|---|
| pp8192, contexto corto | 2.936 | 3.434 | NVFP4 +17,0% |
| pp4096 @ d125000 | 761,8 | 798,9 | NVFP4 +4,9% |
| pp4096 @ d250000 | 438,7 | 462,6 | NVFP4 +5,4% |

Decode (generación), tokens por segundo:

| Test | MXFP4 | NVFP4 | Delta |
|---|---|---|---|
| tg128, contexto corto | 51,65 | 47,74 | MXFP4 +8,2% |
| tg128 @ d125000 | 29,28 | 28,51 | MXFP4 +2,7% |
| tg128 @ d250000 | 20,56 | 20,84 | NVFP4 +1,4% (empate) |

Contexto de 256K con KV Q8_0: prompt de 257.620 tokens procesado, exit code 0, prefill 788,3 t/s y generación 19,5 t/s. Caché KV: K 1.088 MiB + V 1.088 MiB sobre 262.144 celdas (8 capas), más 850 MiB de caché SWA (5.120 celdas, 40 capas). Memoria proyectada 12.953 MiB de 15.174 MiB libres.

## Requisitos de hardware

- VRAM para pesos: 7,22 GB (archivo NVFP4) o 6,41 GiB en MXFP4; añadir 175 MB para el proyector visual.
- VRAM para contexto: ~2,4 GiB adicionales con KV Q8_0 a 256K (1.088 MiB K + 1.088 MiB V + 850 MiB SWA).
- GPU recomendadas: RTX 5060 Ti 16 GB (verificada por el autor); cualquier GPU Blackwell (RTX 50-series) con soporte `sm_120` para aprovechar la ruta nativa FP4. En GPUs no Blackwell, la ruta FP4 nativa no está disponible.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB con ~2,2 GB de margen a 256K. En GPUs de 8 GB no cabe con contexto largo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`). No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: prefill 3.434 t/s (pp8192, contexto corto) y decode 47,74 t/s (tg128, contexto corto) en RTX 5060 Ti 16 GB. A 250K de profundidad, decode cae a ~20,8 t/s.
- Requisito obligatorio: `--jinja` en llama.cpp. Sin él, `llama-mtmd-cli` lanza una excepción C++ no capturada y termina con código `0xC0000409` (`-1073740791`) sin mensaje de error.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / BPW | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it-QAT-NVFP4-GGUF (esta ficha) | 11,9B | 256K | GGUF NVFP4, 4,85 BPW | Apache 2.0 | +17% prefill, −8% decode frente a MXFP4 |
| Gemma-4-12B-it-QAT MXFP4-GGUF | 11,9B | 256K | GGUF MXFP4, 4,62 BPW | Apache 2.0 | +8% decode, −17% prefill; 6,41 GiB |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 11,9B | 256K (según base) | Safetensors (base) | Apache 2.0 | Modelo base oficial de Google |
| Otras cuantizaciones GGUF de Gemma 4 12B | 11,9B | 256K (según base) | GGUF (Q4_0, Q5, etc.) | Apache 2.0 (según autor) | No disponibles en la información proporcionada |

No se dispone de comparativas con modelos de otras familias (Llama, Qwen, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- No reconvertir el `mmproj` a F16: la conversión F16 de `v.patch_embd.weight` (6912×3840) desborda la acumulación F16 en el matmul de patch-embedding. Los síntomas observados son tokens `<unused49>` repetidos o alucinación silenciosa (el modelo inventa contenido de imagen).
- Requiere `--jinja` obligatoriamente; sin él, el fallo es silencioso (código `0xC0000409`) y difícil de diagnosticar.
- La ruta nativa FP4 depende de hardware Blackwell (`sm_120`); en GPUs anteriores el rendimiento y el comportamiento pueden diferir.
- La cuantización de 4 bits introduce pérdida de precisión frente al modelo base QAT sin cuantizar; el autor afirma que NVFP4 cuantiza generalmente con más precisión que MXFP4 por su bloque de 16 frente a 32, pero no aporta métricas de calidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: documentado explícitamente en el contexto de visión con `mmproj` mal convertido; no se cuantifica para texto.
- Cobertura de idiomas: solo se declaran inglés y multilingüe; no hay lista detallada ni evaluación por idioma.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google.
- El autor no publica benchmarks de calidad (MMLU, HumanEval, GSM8K); las únicas métricas son de rendimiento de inferencia.
- Repositorio con 566 descargas y 0 likes en el momento de la consulta; menor validación comunitaria que releases oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/FreedomAISVR/Gemma-4-12B-it-QAT-NVFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- llama.cpp (build b1868, commit `4fea119d`): no se proporciona URL directa en la información disponible
- Paper, blog o demo oficial de Gemma 4: no disponibles en la información proporcionada
