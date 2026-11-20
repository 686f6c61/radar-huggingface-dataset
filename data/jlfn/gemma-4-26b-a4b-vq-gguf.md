# Jlfn/gemma-4-26b-a4b-vq-gguf

## Resumen

Gemma-4 26B A4B VQ (R13+8) es una conversión a cuantización vectorial densa (VQ) del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, publicada por el usuario Jlfn en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetadura de los pesos originales en un formato GGUF propietario optimizado para el runtime `ds4` (familia `gemma4_vq`), que no es compatible con llama.cpp, Ollama ni Transformers. El objetivo es reducir el peso del modelo a unos 9,95 GiB manteniendo la arquitectura MoE híbrida de atención del original.

El modelo base es un transformer MoE con 30 capas, de las cuales 25 usan atención de ventana deslizante de 1.024 tokens y 5 usan atención completa, con un FFN denso compartido y 128 expertos enrutados por capa. La ventana de contexto nativa es de 262.144 tokens sin escalado RoPE. La conversión aplica una etapa de cuantización vectorial de 13 bits sobre los expertos enrutados (libro de códigos E4M3FN de 8.192 palabras) más un plano residual GVR8 de 8 bits, resultando en 2,65 bits por peso en esos tensores.

La relevancia de esta ficha es doble: por un lado documenta una técnica de compresión agresiva (VQ densa) aplicada a un MoE grande; por otro, advierte de que el artefacto solo es utilizable con un runtime específico en CUDA, con métricas de fidelidad limitadas a dos sondas de forward y sin benchmarks de calidad publicados. Es un artefacto de investigación, no una opción de despliegue estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (25 capas sliding-window 1.024 + 5 capas full-attention), FFN denso compartido + 128 expertos enrutados por capa |
| Parámetros totales | 26B (modelo base); el checkpoint safetensors del repo reporta 738.197.504 parámetros (corresponde al drafter MTP, no al modelo completo) |
| Parámetros activos | A4B (aproximadamente 4B activos por token, según nomenclatura del modelo base) |
| Longitud de contexto | 262.144 tokens (nativa, sin RoPE scaling) |
| Tipos de cuantización | VQ densa 13 bits (K=8192, stream de 12 bits + plano de 1 bit) + residual GVR8 8 bits en expertos enrutados; Q4_K en atención y gate/up del FFN denso; Q8_0 en matrices down densas; BF16 en router, norms, `layer_scalar`, embeddings y cabeza de salida |
| Idiomas soportados | Inglés y multilingüe (según tags del repo) |
| Licencia | Apache 2.0 (con `license_link` a la licencia oficial de Gemma 4 de Google) |
| Formato de pesos | GGUF en tres partes (`gemma4-vq8-trunk.gguf`, `gemma4-vq8-embedding-BF16.gguf`, `gemma4-vq8-mtp-Q4_K.gguf`) + `release.json`, `files.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer MoE con atención híbrida: 30 capas totales, 25 de ellas con sliding-window attention de 1.024 tokens y 5 con atención completa, más un FFN denso compartido de 2.112 unidades en cada capa y 128 expertos enrutados por capa con proyecciones gate/up/down. El contexto nativo es de 262.144 tokens sin escalado RoPE. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la documentación proporcionada.

La innovación técnica de esta release es la compresión VQ: cada pila de experto enrutado se codifica con una etapa principal de 13 bits (libro E4M3FN de 8.192 palabras representado como stream de 12 bits más un plano de 1 bit) y un plano residual GVR8 de 8 bits (libro E4M3 de 256 palabras con un byte de índice por vector de 8 pesos), más una ganancia F16 por fila. La reconstrucción es `bf16(gain * (C1 + C2))`. El resultado son 2,65 bits por peso en los expertos (1,6498 de etapa principal + 1,0 de residual) y un tamaño total de 9,95 GiB en 23.805 tensores. El error de reconstrucción en espacio de pesos es del 23,38 % de relL2 medio sobre las 60 pilas de expertos enrutados, una cifra de espacio de pesos, no de logits ni de calidad.

El runtime `ds4` (repositorio `Baekpica/ds4-dfm-rs`) implementa prefill con Tensor Core WMMA (16×16×16 BF16→F32), caché KV FP8 E4M3 por defecto, y ejecución híbrida de expertos: activos residentes en FP8 en GPU y expertos fríos en CPU con AVX2. No existe ruta Metal para esta familia; es exclusivamente CUDA.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base instruct.
- Razonamiento multi-paso mediante el canal de pensamiento `<|channel>thought ... <channel|>` del template de chat oficial de Gemma 4.
- Tool calling / function calling con el formato `<|tool_call>...<tool_call|>` del template canónico.
- Capacidades multilingües (inglés y multilingüe según los tags del repo).
- Contexto largo de hasta 262.144 tokens gracias a la combinación de capas sliding-window y full-attention.
- Borrador especulativo opcional (MTP) mediante el drafter `gemma-4-26B-A4B-it-assistant` incluido como tercera parte del release.
- No se documentan capacidades de visión ni audio en esta conversión (el autor la describe como "text-only dense-VQ conversion").

## Casos de uso

- Investigación en compresión de modelos: el artefacto permite estudiar el impacto de la cuantización vectorial densa a 2,65 bits/peso sobre un MoE de 26B, comparando el error relL2 de reconstrucción con otras técnicas (GPTQ, AWQ, Q4_K). Adecuado porque expone métricas de fidelidad por sonda y pesos reconstruibles.
- Despliegue en GPU de consumo con contexto largo: con una RTX 4070 SUPER de 12 GB se alcanzan 128K de contexto con 1.413,8 tok/s de prefill y 44,5 tok/s de decode, lo que permite prototipar asistentes de documentos largos en hardware asequible.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens permite ingerir contratos, informes o codebases completos en una sola pasada sin troceado, usando el prefill rápido del runtime ds4.
- Evaluación de runtimes alternativos: sirve como banco de pruebas para el runtime `ds4-dfm-rs` y su esquema de ejecución híbrida GPU/CPU de expertos, comparando throughput y TTFT frente a llama.cpp con cuantizaciones estándar.
- Generación asistida con decodificación especulativa: el drafter MTP incluido permite experimentar con decodificación especulativa en un MoE grande, aunque el autor advierte que `--mtp` y `--mtp-draft` están declarados pero no cualificados.
- Investigación sobre fidelidad de cuantización: las dos sondas de forward (coseno 0,9906 y 0,9901; KL 0,000548 y 0,419508) permiten estudiar la divergencia entre pesos reconstruidos y fp32 en distintos regímenes de longitud de secuencia.
- Reproducibilidad de artefactos: los ficheros `release.json`, `files.json` y `SHA256SUMS` con hashes por parte facilitan la verificación de integridad en pipelines de investigación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no hay KL held-out, perplejidad ni benchmark. Solo se publican métricas de fidelidad de forward y de throughput del runtime.

| Métrica | Valor | Condiciones |
|---|---|---|
| Coseno de fidelidad (sonda A, 28 tokens) | 0,9906 | Release vs fp32, argmax 818 |
| KL de fidelidad (sonda A, 28 tokens) | 0,000548 | Release vs fp32 |
| Coseno de fidelidad (sonda B, 1.243 tokens) | 0,9901 | Release vs fp32, argmax 1509 |
| KL de fidelidad (sonda B, 1.243 tokens) | 0,419508 | Release vs fp32 |
| Error de reconstrucción de pesos | 23,38 % relL2 medio | 60 pilas de expertos enrutados |
| Prefill (RTX 4070 SUPER 12 GB, ctx 131.072) | 1.413,8 tok/s | Tensor Core WMMA, FP8 KV, expertos híbridos GPU/CPU |
| TTFT (RTX 4070 SUPER, ctx 131.072) | ~422 ms | Mismas condiciones |
| Decode (RTX 4070 SUPER, ctx 131.072) | 44,5 tok/s (54,8 tok/s residente) | Mismas condiciones |
| Pico de memoria (RTX 4070 SUPER) | 11.015 MiB | Mismas condiciones |
| Prefill (GB10, 248.182 tokens) | 730,7 tok/s | BF16 KV full-layer, chunks de 8.192 filas, ctx 262.144 |
| Decode (GB10, 248.182 tokens) | 16,9 tok/s | Mismas condiciones |

## Requisitos de hardware

- VRAM estimada: el release completo ocupa 9,95 GiB en disco; en una GPU discreta el motor copia el trunk (9,37 GiB) y el embedding a dispositivo, por lo que se requiere al menos ~10-11 GiB de VRAM para el escenario de 128K con FP8 KV (pico medido de 11.015 MiB en RTX 4070 SUPER).
- GPU recomendadas: RTX 4070 SUPER 12 GB (medido), GB10 (medido con contexto completo), y por capacidad de memoria, GPUs con 12 GB o más como RTX 4080/4090, A100, H100. El runtime es exclusivamente CUDA; no hay ruta Metal ni ROCm documentada.
- Cabe en GPU de consumo: sí, en RTX 4070 SUPER 12 GB con contexto de 128K y ejecución híbrida de expertos GPU/CPU.
- Opciones de despliegue: únicamente el runtime `Baekpica/ds4-dfm-rs` (familia `gemma4_vq`, PR #141 y PR #143). No es compatible con llama.cpp, Ollama, Transformers ni TGI. Se debe pasar el directorio del release al runtime, nunca una parte suelta ni una concatenación.
- Latencia y throughput: 1.413,8 tok/s de prefill, ~422 ms de TTFT y 44,5 tok/s de decode en RTX 4070 SUPER a 128K; 730,7 tok/s de prefill y 16,9 tok/s de decode en GB10 a 248.182 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Gemma-4 26B A4B VQ (esta ficha) | 26B totales / ~4B activos | 262.144 | VQ densa 13 bits + GVR8, GGUF propietario, 9,95 GiB | Apache 2.0 | ds4 (solo CUDA) |
| google/gemma-4-26B-A4B-it (base) | 26B totales / ~4B activos | 262.144 | BF16 (2 shards) | Apache 2.0 | Transformers, vLLM, TGI |
| google/gemma-4-26B-A4B-it-assistant | Drafter MTP | no disponible | BF16 | Apache 2.0 | ds4 (como drafter) |

No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad con alternativas de la misma categoría. La comparación se limita a parámetros, contexto, formato y disponibilidad.

## Limitaciones y advertencias

- Formato no estándar: el release no se carga con llama.cpp, Ollama ni Transformers; requiere el runtime `ds4` en su familia `gemma4_vq`, exclusivamente CUDA y sin ruta Metal.
- Fidelidad limitada y no validada en calidad: solo hay dos sondas de forward (28 y 1.243 tokens); no hay KL held-out, perplejidad ni benchmarks. El error de reconstrucción del 23,38 % relL2 es una métrica de espacio de pesos, no una garantía de calidad de salida.
- Riesgo de alucinación: no cuantificado en la documentación; debe asumirse el del modelo base más la degradación introducida por la cuantización VQ agresiva a 2,65 bits/peso en expertos.
- Decodificación especulativa no cualificada: `--mtp` y `--mtp-draft` están declarados pero no validados según el autor.
- Sesgos: no documentados en la información disponible; heredables del modelo base de Google.
- Restricciones de licencia: Apache 2.0 con enlace a la licencia oficial de Gemma 4; conviene revisar los términos de uso de Gemma 4 de Google antes de uso comercial, ya que la model card remite a `ai.google.dev/gemma/docs/gemma_4_license`.
- Dependencia de un runtime de terceros: el soporte depende de PRs (#141, #143) en un repositorio comunitario, con riesgo de mantenimiento y de cambios incompatibles.
- Integridad del artefacto: es imprescindible verificar los SHA-256 de las tres partes y usar el directorio completo con `release.json`; concatenar partes o cargar una sola provoca fallos.
- Idiomas: solo se declaran inglés y multilingüe de forma genérica; no hay evaluación por idioma, incluido el castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jlfn/gemma-4-26b-a4b-vq-gguf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Drafter MTP: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Runtime ds4: https://github.com/Baekpica/ds4-dfm-rs
- PR #141 (merge de la familia gemma4_vq): https://github.com/Baekpica/ds4-dfm-rs/pull/141
- PR #143 (WMMA prefill, FP8 KV, ejecución híbrida): https://github.com/Baekpica/ds4-dfm-rs/pull/143
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
