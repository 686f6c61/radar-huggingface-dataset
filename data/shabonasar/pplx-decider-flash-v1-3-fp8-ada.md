# shabonasar/pplx-decider-flash-v1.3-fp8-ada

## Resumen

pplx-decider-flash-v1.3-fp8-ada es una versión cuantizada en FP8 del modelo perplexity-ai/pplx-decider-flash-v1.3, publicada por el usuario shabonasar. No es un modelo generativo: es un clasificador y tomador de decisiones ("decider") multimodal con 4.539.265.536 parámetros totales, pensado para responder cuestionarios estructurados sobre un estado o contexto dado. El checkpoint está específicamente optimizado para GPUs NVIDIA con tensor cores FP8 de arquitectura Ada (SM89), en particular la RTX 6000 Ada Generation de 48 GB.

El problema que resuelve es de eficiencia: el original en BF16 ocupa 9,1 GB y su ruta FP8 nativa (torch._scaled_mm con escalas rowwise) resulta más lenta que BF16 en Ada. Esta versión almacena 200 capas lineales del modelo de lenguaje en float8_e4m3fn con escalas FP32 por canal de salida y las ejecuta mediante el kernel cutlass_scaled_mm de vLLM, logrando aproximadamente el doble de velocidad que BF16 y reduciendo los pesos a 5,5 GB.

La arquitectura subyacente combina atención completa con Gated DeltaNet (atención lineal con estado recurrente), un encoder visual y una cabeza de decisión en lugar de una cabeza de lenguaje. No hay generación autoregresiva: cada petición es un único forward pass con atención no causal. La licencia es Apache 2.0 y el modelo base pertenece a Perplexity AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + Gated DeltaNet (atención lineal), encoder visual y cabeza de decisión; sin LM head |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.000 tokens en los benchmarks del autor (buckets de 1k a 32k); límite oficial no disponible |
| Tipos de cuantización | FP8 E4M3 (W8A8) en 200 capas lineales; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indexado con model.safetensors.index.json) + fp8_scales.safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido con dos tipos de capas de atención: 8 capas de atención completa (q_proj, k_proj, v_proj, o_proj) y 24 capas de Gated DeltaNet con proyecciones in_proj_qkv, in_proj_z, out_proj, in_proj_a, in_proj_b y conv1d. Incluye además 32 capas MLP (gate_proj, up_proj, down_proj), un encoder visual de 24 bloques y una cabeza de lectura de decisión (readout.safetensors, 255 filas). Las proyecciones in_proj_a e in_proj_b, con solo 32 salidas, son demasiado estrechas para FP8 y permanecen en BF16, igual que conv1d, A_log, dt_bias, todas las normas, embed_tokens (atada) y el encoder visual completo.

Esta versión FP8 no reentrena ni calibra: la cuantización es round-to-nearest desde los pesos BF16, sin calibración ni rotación, de modo que los tensores FP8 son idénticamente iguales a lo que calcula la ruta FP8 upstream al cargar el checkpoint original. Las activaciones se cuantizan dinámicamente a FP8 E4M3 por token. El autor añade el módulo source/src/pplx_decider_fp8.py, que sustituye el to_fp8 upstream y llama a cutlass_scaled_mm de vLLM (nightly 0.33.0rc1.dev1030+gcf5cea2da, commit cf5cea2da), con torch 2.14.0 y transformers 5.17.0. No se incluyen el adaptador Locate (locate-span/) ni release-manifest.json, porque Locate solo funciona en la ruta BF16 de referencia.

## Capacidades

- Clasificación de texto y toma de decisiones estructurada: responde peticiones con un estado ("state") y un conjunto de preguntas tipadas con instrucciones.
- Procesamiento multimodal: acepta imágenes junto al texto (alrededor del 4 % de las peticiones en la carga mixta del benchmark).
- Manejo de tablas numéricas y búsqueda de hechos en contextos de hasta 12k tokens en el conjunto de evaluación del autor.
- Peticiones con múltiples preguntas en una sola llamada (evaluado con 4 preguntas simultáneas).
- Atención no causal de un solo paso: no genera texto ni razona de forma multi-step; produce una decisión directa.
- Tool calling, agentes y modo thinking: no disponibles (no es un modelo generativo).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de documentos a gran escala: el modelo procesa cada documento en un único forward pass no causal, lo que permite clasificar lotes de textos cortos con un throughput medido de 177 req/s en peticiones de 256 tokens sobre RTX 6000 Ada.
- Enrutamiento y triaje de soporte: dado un estado de conversación y preguntas tipadas, el decider devuelve la categoría o decisión, adecuado para pipelines que necesitan latencia baja (47 ms para 715 tokens).
- Extracción de hechos en contextos largos: con ventanas de hasta 32k tokens y 0,397 s de latencia a 5.515 tokens, sirve para localizar información en documentos extensos sin generación.
- Procesamiento de documentos con tablas: el conjunto de evaluación del autor incluye tablas numéricas, por lo que encaja en tareas de interpretación de datos tabulares embebidos en texto.
- Análisis de capturas o documentos escaneados: el encoder visual de 24 bloques en BF16 permite incorporar imágenes en la misma petición de decisión.
- Moderación y filtrado previo en pipelines multimodales: la carga mixta de 2.000 peticiones con un 4 % de imágenes a 64 concurrentes se completó con éxito a unas 17.000 tok/s y p99 de 13 s, lo que respalda su uso como etapa de filtrado en producción.
- Servicio de decisiones con restricciones de memoria: con 11,45 GiB de proceso en total (5,2 GiB de pesos y el resto reservado para el peor caso de 32k tokens con 4 imágenes), cabe en una única GPU de 24 GB o superior.

## Benchmarks y rendimiento

Datos del autor sobre una RTX 6000 Ada, una GPU, mode="separate", CUDA graphs activados, sobre un conjunto sintético etiquetado propio (clasificación de texto, peticiones multi-pregunta, tablas numéricas y búsqueda de hechos hasta 12k tokens). Latencia de una sola llamada en segundos:

| Variante | 715 tok | 1355 tok | 2795 tok | 5515 tok | 4 preguntas | 256 peticiones cortas (req/s) | 64 × 1,4k (tok/s) |
|---|---|---|---|---|---|---|---|
| BF16 (upstream) | 0,081 | 0,161 | 0,329 | 0,676 | 0,653 | 106 | 11.851 |
| FP8 upstream (torch._scaled_mm) | 0,100 | 0,199 | 0,397 | 0,802 | 0,779 | 89 | 10.012 |
| FP8 de este checkpoint (cutlass) | 0,047 | 0,090 | 0,186 | 0,397 | 0,375 | 177 | 20.235 |

Bajo carga mixta de 2.000 peticiones de hasta 26k tokens, con un 4 % con imágenes y 64 concurrentes: todas correctas a unas 17.000 tok/s, p99 de 13 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el autor señala que el modelo carece de LM head, por lo que la perplejidad no está definida.

## Requisitos de hardware

- GPU con tensor cores FP8: SM89 (Ada) o superior. El autor lo ajustó para la RTX 6000 Ada Generation de 48 GB.
- VRAM: el proceso consume 11,45 GiB, de los cuales unos 5,2 GiB son pesos; el resto se reserva al arranque para el peor caso de 32k tokens con 4 imágenes.
- Cabe en GPUs de consumo con 16-24 GB (por ejemplo, RTX 4090, que es SM89 y soporta FP8), siempre que se respete la reserva de memoria del peor caso.
- Despliegue: no se sirve con vLLM; se ejecuta con el paquete upstream pplx_decider (en source/src) y vLLM solo aporta el kernel cutlass_scaled_mm. Requiere Python 3.12, las dependencias de requirements-fast.txt y, según el autor, la imagen pública vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57 con torch 2.14.0 y transformers 5.17.0.
- Es obligatorio usar fast=FastOptions(fp8=True, compile="layer", cuda_graphs=True) junto con pplx_decider_fp8.install(path); sin ello los valores FP8 se cargan como BF16 sin escalas y las respuestas son incorrectas sin ningún error.
- Throughput medido: 177 req/s en peticiones cortas y 20.235 tok/s con 64 secuencias de 1,4k tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pplx-decider-flash-v1.3-fp8-ada (este) | 4.539 M | hasta 32k en benchmarks | Apache 2.0 | safetensors FP8/BF16 | 5,5 GB, requiere kernel cutlass de vLLM |
| perplexity-ai/pplx-decider-flash-v1.3 (BF16) | 4.539 M | no disponible | Apache 2.0 (según este repo) | safetensors BF16 | 9,1 GB, ruta de referencia, incluye Locate |
| FP8 upstream con torch._scaled_mm | 4.539 M | no disponible | Apache 2.0 | safetensors | Misma cuantización, pero más lento que BF16 en Ada |

No se dispone de información sobre otros modelos de clasificación o decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: carece de LM head y no produce texto libre, razonamiento multi-step ni tool calling.
- El uso incorrecto de la API (sin install() o sin FastOptions(fp8=True)) devuelve respuestas erróneas sin lanzar ningún error, lo que constituye un riesgo serio en producción.
- Dependencia de una versión nightly de vLLM y de torch 2.14.0/transformers 5.17.0; la reproducibilidad fuera de ese entorno no está garantizada.
- El adaptador Locate y el release-manifest.json no están incluidos, por lo que las funciones asociadas a Locate no están disponibles.
- Los benchmarks proceden de un conjunto sintético propio del autor, no de evaluaciones estándar independientes; no hay datos de MMLU, HumanEval ni GSM8K.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación en la salida de decisión: no evaluado en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base en su repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shabonasar/pplx-decider-flash-v1.3-fp8-ada
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Commit del kernel de vLLM: https://github.com/vllm-project/vllm/commit/cf5cea2da
- Imagen de vLLM utilizada: vllm/vllm-openai:nightly-cf5cea2da37d3dfed27d2e0aa3041c3e553c2d57
