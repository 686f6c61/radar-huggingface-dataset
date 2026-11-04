# qwegnai/Qwen3.6-35B-A3B-hq4g32

## Resumen

Qwen3.6-35B-A3B-hq4g32 es un empaquetado de pesos cuantizados del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 orientado a Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original a un contenedor propietario (`QWP1`) con cuantización de 4 bits y atención dispersa latente (LSA) como acelerador de contexto largo. El modelo base es un MoE híbrido de 35.950 millones de parámetros totales con 3.000 millones activos por token, 40 capas y una torre de visión.

La relevancia de este pack es fundamentalmente de infraestructura: demuestra que un MoE de ~36B puede ejecutarse en un Mac con memoria unificada a velocidades de decodificación superiores a 100 tok/s incluso con ventanas de contexto cercanas al millón de tokens, gracias a la combinación de cuantización HQ4 (5,30 bits por parámetro), decodificación especulativa con la cabeza MTP y LSA. El tamaño del repositorio es de 23,8 GB y el pack ocupa 22,18 GiB.

La licencia declarada es Apache 2.0, heredada del modelo base. El pack no es un safetensors, GGUF ni MLX: solo carga en Qwegn, lo que limita seriamente su portabilidad fuera del ecosistema Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 40 capas (30 Gated-DeltaNet + 10 full-attention), 256 expertos (8 enrutados + 1 compartido), GQA 16Q/2KV, cabeza MTP, torre de visión |
| Parametros totales | 35,95 B |
| Parametros activos | 3 B |
| Longitud de contexto | 262.144 tokens nativos; extensión de inferencia probada cerca de 1M con YaRN + LSA |
| Tipos de cuantizacion | HQ4_G32_M5 (4 bits con rotación Walsh-Hadamard, escala FP16 y sesgo, 5 bits/peso) + BF16 en embedding, torre de visión y router; 5,30 bits/parámetro global |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `QWP1` (no safetensors, no GGUF, no MLX); sidecar `model.qlsa` para LSA |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina 30 capas Gated-DeltaNet (atención lineal con estado recurrente) con 10 capas de atención completa, sobre un esquema MoE de 256 expertos del que se activan 8 enrutados más uno compartido por token. La atención usa GQA con 16 cabezas de query y 2 de clave/valor. Incluye una cabeza MTP (multi-token prediction) que el runtime aprovecha para decodificación especulativa, y una torre de visión para entrada multimodal. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La innovación propia de este pack es la cuantización HQ4_G32_M5: cada grupo de 32 pesos se rota mediante una transformada ortonormal de Walsh-Hadamard antes de almacenarse como códigos de 4 bits con escala y sesgo en FP16 (20 bytes por grupo de 32 pesos, es decir, 5 bits por peso). La rotación reparte los valores atípicos entre el grupo y evita la necesidad de datos de calibración; el runtime fusiona la transformada sobre las activaciones dentro de los kernels GEMV/GEMM. Se mantienen en BF16 solo el embedding de tokens (2,7% de los parámetros), la torre de visión y las compuertas del router, por su bajo coste de ancho de banda. Adicionalmente, el sidecar `model.qlsa` contiene una proyección SVD offline de la porción sin RoPE de las cabezas `wq`/`wk` (dimensiones 64-255) de las 10 capas de atención completa, usada por el mecanismo Latent Sparse Attention.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento desactivable (la evaluación de código del autor se ejecutó con razonamiento desactivado).
- Generación de código: 72/100 en una evaluación propia de 50 tareas HumanEval más 50 de MBPP.
- Procesamiento de imágenes mediante torre de visión integrada (ejecutada una vez por imagen en BF16).
- Contexto largo: recuperación de agujas en ventanas de 64K a 1M tokens (3/3 en el ejercicio del autor), con atención dispersa latente.
- Decodificación especulativa nativa mediante la cabeza MTP (Variational MTP-3) y DFlash 2 como drafter alternativo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no documentado explícitamente; el contexto largo y el modo de razonamiento son compatibles con flujos agénticos, pero no hay confirmación del autor.

## Casos de uso

- Análisis de repositorios completos en local: con 262K tokens nativos y extensión probada cerca de 1M, el modelo puede ingerir bases de código extensas en un solo prompt sobre un Mac con memoria unificada, sin depender de la nube.
- Asistentes de código en estación de trabajo Apple Silicon: el pack decodifica a 148,3 tok/s en serie y 233,4 tok/s con especulación en un M5 Max, suficiente para autocompletado interactivo y refactorizaciones guiadas.
- Procesamiento de documentos largos con recuperación: contratos, informes o expedientes de cientos de miles de tokens, apoyándose en LSA para mantener la decodificación por encima de 100 tok/s a 1M de tokens.
- Investigación sobre cuantización extrema: el formato HQ4_G32_M5 sin calibración es un caso de estudio reproducible para medir el impacto de la rotación Walsh-Hadamard en la calidad de un MoE de 36B.
- Evaluación de atención dispersa: el sidecar `model.qlsa` y el bypass denso para prompts por debajo de 2.564 tokens permiten comparar LSA frente a atención densa en igualdad de condiciones.
- Prototipado multimodal local: la torre de visión permite describir o razonar sobre imágenes en el mismo runtime, útil para demos sin conexión en portátiles Apple.
- Benchmarking de motores de inferencia: las métricas de prefill, TTFT y decodificación publicadas sirven como referencia para comparar Qwegn con MLX, llama.cpp u otros runtimes en Apple Silicon.

## Benchmarks y rendimiento

Mediciones del autor en Apple M5 Max (`Mac17,6`, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 10,4K) | 6.005 tok/s (pico 6.389) |
| TTFT en frío | 45 ms |
| TTFT con caché de prompt caliente | 5 ms |
| Decodificación estándar (serie) | 148,3 tok/s |
| Decodificación especulativa (Variational MTP-3) | 233,4 tok/s |
| Prefill / decodificación a 1M tokens con LSA | 2.294 / 102,8 tok/s |
| Recuperación de agujas 64K → 1M | 3/3 en todas las longitudes |
| Evaluación de código (50 HumanEval + 50 MBPP) | 72/100 |

Escalado de LSA frente a atención densa (prefill / decodificación, tok/s):

| Escalon de contexto | Prefill LSA / denso | Decodificación LSA / denso | Aceleración (prefill · decodificación) |
|---|---|---|---|
| 64K | 6.005 / 2.538 | 134,1 / 99,2 | 2,37× · 1,35× |
| 128K | 5.335 / 1.754 | 133,0 / 84,4 | 3,04× · 1,58× |
| 262K | 3.791 / 581 | 125,7 / 50,1 | 6,53× · 2,51× |
| 524K | 3.028 / 231 | 109,3 / 23,2 | 13,1× · 4,71× |
| 1M | 2.294 / no ejecutado | 102,8 / no ejecutado | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible; los datos anteriores son mediciones de rendimiento del runtime y una evaluación de código propia del autor.

## Requisitos de hardware

- VRAM / memoria: el pack ocupa 22,18 GiB; se necesita memoria unificada suficiente para pesos, caché KV y contexto. Para contexto cercano a 1M se requieren configuraciones de 128 GB como la del M5 Max medido.
- GPU recomendadas: Apple Silicon exclusivamente. El autor reporta resultados en un M5 Max (GPU de 40 núcleos, 585 GB/s). No hay soporte para GPU NVIDIA, AMD ni CPU x86.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 32 GB o superior para contextos moderados; para contexto largo se recomienda 64-128 GB.
- Opciones de despliegue: únicamente el motor Qwegn (Swift + Metal 4). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en frío de 45 ms y en caliente de 5 ms; 148,3 tok/s en serie y 233,4 tok/s con especulación en el M5 Max; 102,8 tok/s a 1M tokens con LSA.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-hq4g32 (este pack) | 35,95 B | 3 B | 262K nativo, ~1M con YaRN + LSA | Apache 2.0 | `QWP1`, solo Qwegn |
| Qwen/Qwen3.6-35B-A3B (original) | 35,95 B | 3 B | 262.144 | Apache 2.0 | Safetensors, ecosistema estándar |
| Alternativas cuantizadas para Apple Silicon (MLX, GGUF) | no disponible | no disponible | no disponible | no disponible | MLX / GGUF, llama.cpp, LM Studio |

La comparación directa con otras conversiones del mismo modelo base no está disponible en la información proporcionada. Frente al checkpoint original, este pack sacrifica portabilidad (contenedor propietario) a cambio de un runtime optimizado para Metal con LSA y decodificación especulativa.

## Limitaciones y advertencias

- Portabilidad nula: el contenedor `QWP1` solo carga en Qwegn; no sirve para vLLM, llama.cpp, Ollama, TGI, MLX ni transformers.
- Plataforma única: requiere Apple Silicon con Metal 4 y macOS reciente; no hay soporte para CUDA, ROCm ni CPU.
- La extensión a ~1M tokens es una extensión en tiempo de inferencia (YaRN + LSA), no un entrenamiento adicional; la fidelidad más allá de 262.144 tokens no está garantizada.
- El resultado 3/3 en recuperación de agujas es un único ejercicio de tres agujas, no una garantía de precisión general en contexto largo.
- La decodificación especulativa (Variational MTP-3) puede alterar la salida respecto a una decodificación greedy exacta.
- La cuantización a 4 bits introduce error, aunque el autor no publica una comparación de calidad frente al modelo en BF16.
- Sesgos conocidos: no documentados en la información disponible; al heredarse del modelo base, aplican los sesgos de Qwen3.6-35B-A3B.
- Riesgo de alucinación: no cuantificado por el autor.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Soporte de tool calling y de agentes: no documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación independiente de las métricas reportadas.
- Licencia Apache 2.0 declarada, heredada del modelo base; conviene verificar los términos del modelo original antes de un uso comercial.

## Enlaces

- Pack en HuggingFace: https://huggingface.co/qwegnai/Qwen3.6-35B-A3B-hq4g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del motor Qwegn: https://github.com/qwegnai/qwegine
