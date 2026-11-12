# kabcnd/Ternary-Flint-40B-GGUF

## Resumen

Ternary-Flint-40B es una compresión agresiva del modelo MoE Hunyuan-A52B-Instruct de Tencent, publicada por el desarrollador independiente kabcnd. El resultado es un modelo de 39,79 mil millones de parámetros totales con solo 2,54 mil millones activos por token, empaquetado en un único archivo GGUF de 9,85 GiB mediante una combinación de cuantización ternaria (PTQ1_0, 1,75 bits por peso) para los expertos enrutados y Q4_0 para el backbone compartido. El objetivo declarado es ejecutar un modelo de escala 40B en hardware de memoria unificada de consumo, concretamente un Mac mini de 16 GB.

La innovación principal no está en el entrenamiento sino en la compresión y el runtime: anclas de fase Hadamard simétricas de media cero, preservación del backbone en "nona-core" Q4_0, y decodificación especulativa basada en hash map de n-gramas (`ngram-map-k`) implementada sobre un fork parcheado de llama.cpp con kernels Metal específicos. El autor reporta 98,03 tokens/s de media y hasta 142,12 tokens/s en secuencias estructuradas, con una perplejidad de 7,8447 en WikiText-2.

Es relevante ahora porque demuestra que técnicas de cuantización extrema combinadas con decodificación especulativa pueden llevar un MoE de 40B a un portátil o mini-PC de Apple Silicon con ventana de contexto nativa de 262.144 tokens (con caché KV en 4 bits). No obstante, requiere binarios personalizados y no funciona con llama.cpp estándar ni con otros backends.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido ternario (transformer con 256 expertos enrutados + 1 compartido, top-8 activos) |
| Parametros totales | 39.785.287.456 (39,79B) |
| Parametros activos | 2,54B por token (top-8 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos (con caché KV en q4_0) |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bpw) para expertos + Q4_0 para backbone; 2,21 bpw efectivos |
| Idiomas soportados | en, ru, zh |
| Licencia | other (heredada del modelo base; consultar términos de Hunyuan) |
| Formato de pesos | GGUF (archivo único de 9,85 GiB) |

## Arquitectura y entrenamiento

El modelo base es Tencent-Hunyuan/Hunyuan-A52B-Instruct, un Mixture-of-Experts con 256 expertos enrutados de grano fino más un experto compartido, con 8 expertos activos por token. Ternary-Flint-40B no reentrena el modelo: aplica un pipeline de post-training quantization (PTQ) sobre los pesos originales. Los expertos enrutados se comprimen a representaciones ternarias PTQ1_0 (1,75 bits por peso) con anclas de fase Hadamard simétricas de media cero, mientras que el backbone ("nona-core") se preserva en Q4_0 para mantener la calidad de las capas críticas. El autor aplica además "I-Matrix Salient Noise Clipping" para reducir la perplejidad sin coste adicional de memoria.

El runtime es tan relevante como los pesos: se distribuyen binarios precompilados para macOS ARM64 con un fork de llama.cpp que registra la arquitectura `flint`, rota fases Hadamard (`prism.hadamard.*`), implementa dequantización ternaria sin pérdida en kernels Metal GEMV, tiling multi-vector de registros, fusión de gather de expertos con matvec y popcount SIMD por hardware. La decodificación especulativa `ngram-map-k` alcanza una tasa de aceptación de borrador (DAR) del 75,5%. No se dispone de información sobre la composición del dataset de entrenamiento original ni sobre las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, ruso y chino.
- Razonamiento y respuesta a instrucciones heredados de Hunyuan-A52B-Instruct.
- Generación de código (el autor reporta 91,00 tokens/s en C++).
- Ventana de contexto muy larga: hasta 262.144 tokens con caché KV cuantizada en 4 bits.
- Decodificación especulativa integrada vía `ngram-map-k`, especialmente eficaz en secuencias estructuradas y repetitivas.
- Capacidad de ejecución en memoria unificada de 16 GB en Apple Silicon.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistencia conversacional local en Mac mini de 16 GB: el modelo cabe entero en memoria unificada y ofrece ~98 tokens/s, suficiente para interacción en tiempo real sin conexión a la nube.
- Análisis de documentos largos: con 262.144 tokens de contexto y caché KV en q4_0, se pueden procesar contratos, codebases o informes extensos en una sola pasada.
- Generación de código en local: el throughput de 91 tokens/s en C++ y la ventana larga permiten autocompletado y refactorización sobre archivos grandes en entornos sin GPU dedicada.
- Prototipado de agentes y pipelines: la velocidad de ingesta de prompt (1.251 tokens/s en pp512) hace viable iterar sobre prompts largos en bucles de evaluación.
- Investigación en cuantización extrema: sirve como banco de pruebas reproducible para estudiar el impacto de PTQ ternario + Hadamard sobre la perplejidad y la calidad generativa en MoE.
- Despliegue edge/offline en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del dispositivo, adecuado para prototipos en sanidad, legal o finanzas.
- Evaluación de decodificación especulativa: el checkpoint y los binarios permiten reproducir los experimentos de DAR y throughput reportados por el autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad (WikiText-2) | 7,8447 |
| Ingesta de prompt (pp512, Metal) | 1.251,30 tokens/s |
| Generación media (Metal) | 98,03 tokens/s |
| Generación pico (secuencias estructuradas) | 142,12 tokens/s |
| Generación en código C++ | 91,00 tokens/s |
| Tasa de aceptación de borrador (DAR) | 75,5% (142 aceptados / 188 borrador) |
| Tamano en disco / VRAM | 9,85 GiB |

Evolución de checkpoints reportada por el autor:

| Checkpoint | Tamano | Precision | PPL | pp512 | Generacion |
|---|---|---|---|---|---|
| flint-UD-IQ1_M (donante) | 10,57 GiB | 1,88 bpw | 5,6948 | 842,1 t/s | 51,4 t/s |
| Ternary baseline (Candidate 5) | 9,31 GiB | 1,75 bpw | 10,7807 | 1.180,4 t/s | 68,2 t/s |
| HexaCore (Exp 13) | 9,59 GiB | 2,13 bpw | 8,0649 | 1.247,0 t/s | 71,4 t/s |
| NonaCore baseline | 9,85 GiB | 2,21 bpw | 7,9048 | 1.251,3 t/s | 75,4 t/s |
| NonaCore + D4 Spec (actual) | 9,85 GiB | 2,21 bpw | 7,8447 | 1.251,3 t/s | 98,03–142,12 t/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 9,85 GiB para los pesos; el autor indica que cabe holgadamente bajo el límite de working set de Metal de 14,68 GiB.
- Hardware objetivo: Apple Silicon (M-series) con 16 GB de memoria unificada; el autor menciona explícitamente Mac mini de 16 GB.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni AMD; los kernels y binarios distribuidos son exclusivamente Metal/macOS ARM64.
- Despliegue: fork parcheado de llama.cpp (`llama-server`) con binarios precompilados en el repositorio; no compatible con llama.cpp upstream, Ollama, vLLM ni TGI en la información disponible.
- Variables de entorno requeridas para máximo rendimiento: `GGML_METAL_PTQ1_MULTICOL=1`, `GGML_METAL_FUSE_GATHER_MV=1`, `GGML_METAL_TENSOR_ENABLE=1`, `GGML_METAL_SHARED_BUFFERS_ENABLE=1`, `GGML_METAL_Q1_0_POPCNT=1`.
- Throughput reportado: 1.251,30 tokens/s de ingesta (pp512), 98,03 tokens/s de generación media, 142,12 tokens/s pico.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato/tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Flint-40B | 39,79B | 2,54B | 262.144 | GGUF 9,85 GiB (ternario+Q4_0) | other | HF, runtime propio |
| flint-UD-IQ1_M (donante) | no disponible | no disponible | no disponible | GGUF 10,57 GiB (1,88 bpw) | no disponible | HF |
| Hunyuan-A52B-Instruct (base) | no disponible | no disponible | no disponible | safetensors | other | HF |
| Ternary baseline (Candidate 5) | 39,79B | 2,54B | no disponible | GGUF 9,31 GiB (1,75 bpw) | other | HF |

No se dispone de datos de benchmarks estándar ni de comparativas con modelos de la misma categoría (por ejemplo, otros MoE de ~40B cuantizados) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria agresiva (1,75 bpw) degrada la calidad frente al modelo base; la PPL de 7,8447 en WikiText-2 es superior a la del checkpoint donante IQ1_M (5,6948), lo que indica pérdida medible de fidelidad.
- Solo se documentan tres idiomas (en, ru, zh); el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- No hay evidencia publicada de soporte de tool calling, function calling ni comportamiento agéntico multi-paso; no asumir estas capacidades en producción.
- El modelo requiere binarios parcheados específicos; no funciona con llama.cpp estándar, Ollama, vLLM, TGI ni backends NVIDIA/AMD. Esto limita severamente la portabilidad y el despliegue en servidor.
- La licencia es "other" y hereda los términos de Hunyuan-A52B-Instruct; es imprescindible revisar las restricciones del modelo base antes de cualquier uso comercial.
- El repositorio tiene solo 2 likes y 15.093 descargas; es un artefacto de investigación de un autor individual, sin validación independiente de los benchmarks reportados.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de sesgo, toxicidad o robustez.
- El rendimiento reportado (98–142 tokens/s) depende de flags de entorno concretos y de la configuración D4; sin ellos el throughput cae a ~75 t/s.
- La ventana de 262.144 tokens requiere caché KV en q4_0; el consumo real de memoria con contextos muy largos no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Ternary-Flint-40B-GGUF
- Modelo base: https://huggingface.co/Tencent-Hunyuan/Hunyuan-A52B-Instruct
- Binarios Metal precompilados: https://huggingface.co/kabcpc/Ternary-Flint-40B-GGUF/resolve/main/bin/llama-flint-metal-macos-arm64.tar.gz
- Página de donaciones del autor: https://ko-fi.com/kabcpc
