# janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF

## Resumen

Qwen3.8-Flash-Next-AD-gateup-GGUF es una cuantización GGUF de Qwen3.8-Flash-Next, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión la publica el usuario janghaneul bajo el paraguas de AtomicChat, con el objetivo de hacer viable la inferencia local del modelo mediante llama.cpp y su fork Strata. El modelo base cuenta con 176.943.899.520 parámetros totales (unos 177.000 millones), lo que lo sitúa en la categoría de modelos grandes que requieren hardware de gama alta o configuraciones con memoria unificada.

La aportación principal de esta ficha no es el modelo en sí, sino la receta de cuantización: dos builds ensamblados manualmente a partir de la receta `AD-5.00bpw-Q5_K_M`, con una asignación de bits no uniforme que concentra la precisión en los expertos `ffn_gate_exps` y `ffn_up_exps` (los que más afectan a la calidad) mientras mantiene el resto de tensores en Q8_0, IQ4_NL o F32/F16. El resultado son dos artefactos de 109,78 GiB y 119,05 GiB totales, con residencia en memoria de 59,11 GiB y 68,37 GiB respectivamente cuando la tabla n-gram PLE se sirve en streaming.

Es relevante ahora porque demuestra una práctica creciente: cuantizaciones guiadas por medición empírica (161 problemas × 5 ejecuciones de MultiPL-E humaneval-cpp) en lugar de recetas genéricas, y porque hace accesible un MoE de 177.000 millones de parámetros en equipos con 64-128 GiB de RAM, algo impensable con los pesos en BF16 originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atención y GDN (`ssm_out`), transformer híbrido según los tensores presentes |
| Parámetros totales | 176.943.899.520 (~177.000 M) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q4_K, IQ3_S, IQ2_S, IQ4_NL, Q8_0, F32/F16, BF16 (tensores `hc_*`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (3 shards por build) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con 177.000 millones de parámetros totales. Los tensores documentados en la model card revelan una arquitectura híbrida: por un lado, capas de atención (`attn_qkv`, `attn_gate`), y por otro, tensores `ssm_out` que apuntan a componentes de espacio de estados (GDN, *gated delta network* o similar). Incluye además expertos compartidos (`shared expert`), un router con 389 tensores en F32/F16, y una tabla `per_layer_token_embd` de tipo n-gram PLE (probablemente *per-layer embeddings* o *prompt lookup embeddings*) de 50,66 GiB en Q8_0, lo que sugiere un mecanismo de memoria asociativa o de recuperación léxica por capas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card se centra exclusivamente en el proceso de cuantización, no en el entrenamiento del modelo base. La innovación técnica destacable de esta ficha es la asignación no uniforme de bits: los expertos *routed* de gate/up reciben Q4_K, IQ3_S o IQ2_S según la tolerancia de cada capa, mientras que los expertos *down* se fijan en IQ4_NL (bloque 32) y todo lo no ruteado (atención, `ssm_out`, expertos compartidos, embeddings y tabla PLE) permanece en Q8_0. La selección de capas ancla (40, 44, 45, 47 en Q4_K; 32, 34, 36, 39 en IQ2_S) se basa en el consenso de tres asignaciones de proveedor independientes (AtomicChat AD, ISTA GSQ, agention Gyro).

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat (`atomic-chat` en los tags).
- Generación de código: la model card reporta puntuaciones en MultiPL-E humaneval-cpp, lo que confirma capacidad de síntesis de código C++ ejecutable.
- Razonamiento y matemáticas: no hay datos específicos en la información disponible, pero el tamaño del modelo y su categoría sugieren capacidad, sin confirmación documentada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los tags no listan idiomas y la model card está en inglés y coreano, pero no confirma idiomas del modelo.
- Capacidad especial: tabla n-gram PLE de 50,66 GiB que puede servirse en streaming, lo que reduce la residencia en memoria a costa de latencia de acceso.

## Casos de uso

- **Asistencia de código en local para C++**: el modelo ha sido evaluado específicamente en MultiPL-E humaneval-cpp con 143,8/161 problemas resueltos en el build recomendado, lo que lo hace adecuado para autocompletado y generación de funciones C++ en entornos sin conexión donde no se puede enviar código a la nube.
- **Chat conversacional autoalojado**: con la etiqueta `atomic-chat` y el pipeline `text-generation`, se puede desplegar como backend de un asistente conversacional en llama.cpp, manteniendo los datos en la infraestructura propia.
- **Investigación en cuantización de MoE**: los dos builds documentados (Q4_K uniforme vs. asignación mixta IQ2_S/IQ3_S/Q4_K) permiten reproducir el estudio de sensibilidad por capa y validar la hipótesis de que gate/up concentra la calidad, usando los mismos 161 problemas y 5 ejecuciones como protocolo.
- **Despliegue en estaciones de trabajo con 64 GiB de RAM**: el build `AD-404bpw-q4_k_m` con residencia de 59,11 GiB (PLE en streaming) cabe en un equipo de 64 GiB, permitiendo inferencia de un MoE de 177.000 M sin GPU de datacenter.
- **Servicio de inferencia con llama.cpp en CPU+GPU híbrido**: al estar en formato GGUF y usar llama.cpp/Strata, se puede repartir el modelo entre VRAM y RAM del sistema, con throughput medido de 79,4 tok/s en el build recomendado.
- **Evaluación comparativa de recetas de cuantización**: investigadores que necesiten comparar imatrix, asignación por capa y tipos de bloque (Q4_K vs IQ4_NL vs IQ3_S) pueden usar estos artefactos como referencia reproducible con sha256 documentados.

## Benchmarks y rendimiento

| Build | Benchmark | Resultado | Notas |
|---|---|---|---|
| `AD-404bpw-q4_k_m` | MultiPL-E humaneval-cpp | 143,8/161 (89,3%) | 6 variantes × 161 problemas × 5 ejecuciones; mejor del grupo |
| `AD-467bpw-q5_k_m` | MultiPL-E humaneval-cpp | 142,4/161 (88,4%) | Segundo del grupo |
| `AD-404bpw-q4_k_m` | Throughput | 79,4 tok/s | Servicio con PLE en streaming |
| `AD-467bpw-q5_k_m` | Throughput | 74,5 tok/s | Servicio con PLE en streaming |

No se han publicado resultados de MMLU, GSM8K, HumanEval estándar ni otros benchmarks en la información disponible. Los datos anteriores provienen exclusivamente de la model card del cuantizador.

## Requisitos de hardware

- **VRAM/RAM estimada**: build `AD-404bpw-q4_k_m` con 59,11 GiB residentes (PLE en streaming) y 109,78 GiB totales en disco; build `AD-467bpw-q5_k_m` con 68,37 GiB residentes y 119,05 GiB totales.
- **GPU recomendadas**: no se especifican en la información disponible. Por el volumen de pesos, un despliegue completamente en VRAM requeriría múltiples A100/H100 de 80 GB o GPUs con memoria unificada de gran capacidad; el caso documentado es inferencia local con llama.cpp/Strata, que reparte entre RAM y VRAM.
- **Cabe en consumer GPU**: no en una sola GPU de consumo con los builds documentados (59-68 GiB residentes superan los 24 GB de una RTX 4090). Sí cabe en configuraciones con memoria unificada de 64-128 GiB o en CPU con suficiente RAM.
- **Opciones de despliegue**: llama.cpp y el fork Strata (mencionados explícitamente); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM, TGI y Ollama no se mencionan en la información disponible.
- **Latencia y throughput**: 79,4 tok/s para `AD-404bpw-q4_k_m` y 74,5 tok/s para `AD-467bpw-q5_k_m`, medidos en el entorno del cuantizador con PLE en streaming. La latencia no se reporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AD-gateup-GGUF (este) | ~177.000 M | no disponible | qwen-community-1.0 | GGUF | Cuantización medida, 89,3% en MultiPL-E humaneval-cpp |
| Qwen3.8-Flash-Next (base) | ~177.000 M | no disponible | qwen-community-1.0 | safetensors/BF16 | Modelo original sin cuantizar; requiere hardware de datacenter |
| AD-5.00bpw-Q5_K_M (receta origen) | ~177.000 M | no disponible | qwen-community-1.0 | GGUF | Receta de AtomicChat de la que derivan ambos builds; gate/up en IQ2_S/IQ3_S |
| IQ3_S-Q4_K (build anterior, retirado) | ~177.000 M | no disponible | qwen-community-1.0 | GGUF | 416 bpw, delisted; mismo anclaje Q4_K, 12 capas degradadas, −2,36 GiB |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- **Licencia `qwen-community-1.0`**: no es una licencia permisiva tipo Apache 2.0; incluye restricciones de uso comercial que deben revisarse en el enlace a la licencia del modelo base antes de desplegar en producción.
- **Riesgo de alucinación**: no cuantificado en la información disponible; como todo modelo generativo, puede producir código o texto plausible pero incorrecto, y el benchmark reportado (89,3%) implica que aproximadamente 1 de cada 9 problemas de C++ no se resuelve.
- **Idiomas no documentados**: la model card no lista idiomas soportados, por lo que el rendimiento multilingüe es desconocido y no debe asumirse paridad con el modelo base.
- **Sesgos**: no hay información sobre sesgos evaluados en la model card; al ser una cuantización, hereda los del modelo base, que tampoco se documentan aquí.
- **Contexto no documentado**: la longitud de contexto no aparece en la información disponible, lo que impide planificar casos de uso con ventanas largas.
- **Integridad de los shards**: el build `AD-404bpw-q4_k_m` fue reemplazado el 2026-11-12 (shards 1 y 2, +0,55 GiB por `hc_*` en BF16); si se descargó antes, hay que re-descargar solo esos dos shards. El shard 3 (PLE) mantiene el sha256 `290aab43…95f901`.
- **Nombre engañoso**: `AD-404bpw` mide en realidad 4,038 bpw excluyendo la tabla PLE, no 4,04 exactos; el nombre anterior era `AD-405bpw`.
- **Dependencia de fork**: el despliegue requiere Strata o llama.cpp con soporte para la tabla n-gram PLE y los tensores `hc_*`; otros runtimes pueden no cargar el modelo correctamente.
- **Streaming del PLE**: la residencia de 59,11 GiB asume que la tabla PLE de 50,66 GiB se sirve en streaming; sin streaming, el requisito de memoria se acerca al total de 109,78 GiB.

## Enlaces

- Hugging Face: https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
