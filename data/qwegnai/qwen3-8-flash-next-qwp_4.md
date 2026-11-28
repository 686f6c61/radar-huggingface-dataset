# qwegnai/Qwen3.8-Flash-Next-QWP_4

## Resumen

Qwen3.8-Flash-Next-QWP_4 es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), preparado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn, un runtime escrito en Swift y Metal 4 para Apple Silicon. No se trata de un checkpoint estándar en safetensors, GGUF o MLX, sino de un contenedor propietario QWP1 que solo carga en dicho motor, lo que limita drásticamente su portabilidad fuera del ecosistema Apple.

El modelo base es un transformer híbrido MoE de 128,80 mil millones de parámetros con 48 capas: 36 capas Gated-DeltaNet y 12 capas de atención dispersa entrenada (QSA, Latent Sparse Attention). Incorpora 512 expertos (10 enrutados más uno compartido), embeddings n-gram por capa (PLE), una cabeza MTP para decodificación especulativa y una torre de visión. El contexto nativo es de 262.144 tokens, ampliable en inferencia hasta cerca de 1M mediante la atención dispersa nativa.

La relevancia de este pack es acotada pero concreta: demuestra que es posible ejecutar un MoE de casi 129B parámetros con contexto de un millón de tokens en hardware consumer de Apple Silicon (M5 Max con 128 GB de memoria unificada), manteniendo la atención dispersa entrenada en la ruta rápida de la GPU. La cuantización HQ4_G32_M5 logra 5,10 bits por parámetro, con un tamaño de pack de 76,46 GiB más 54,6 GB de tabla n-gram PLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (36 Gated-DeltaNet + 12 atención dispersa QSA), 512 expertos (10 enrutados + 1 compartido), PLE por capa, cabeza MTP, torre de visión |
| Parametros totales | 128,80 B |
| Parametros activos | no disponible (10 expertos enrutados de 512, sin desglose de parámetros activos publicado) |
| Longitud de contexto | 262.144 tokens nativo; extensión en inferencia probada hasta ~1M con QSA nativa |
| Tipos de cuantizacion | HQ4_G32_M5 (4 bits con rotación Walsh-Hadamard, escala y sesgo FP16, 5 bits/peso); capas BF16 para embedding de tokens, torre de visión y puertas del router; 5,10 bits/parámetro global |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Contenedor propietario QWP1 (no es safetensors, GGUF ni MLX); sidecar `model.qlsa` para LSA |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas Gated-DeltaNet (un mecanismo de atención lineal/SSM) con capas de atención completa dispersa entrenada (QSA), en una proporción de 36 a 12 sobre 48 capas totales. El componente MoE emplea 512 expertos con 10 enrutados más uno compartido por token, y añade embeddings n-gram por capa (PLE) que aportan una tabla adicional de 54,6 GB. La cabeza MTP (Multi-Token Prediction) habilita decodificación especulativa, y se incluye una torre de visión para entrada multimodal.

El índice de atención dispersa QSA fue entrenado junto con el modelo, no añadido a posteriori; el pack incluye un sidecar `model.qlsa` generado mediante SVD offline de la porción de cabeza sin RoPE de las matrices `wq`/`wk` cuantizadas (dimensiones 64–255), con dimensión de índice 64, agrupación en superbloques de 512 tokens en 64 buckets Ward (≤16 tokens cada uno) y pooling de claves de 4 tokens. El presupuesto por defecto es de 2.048 tokens más bloque sumidero y ventana local de 512 tokens, cubriendo las 12 capas de atención completa (12 ocurrencias en runtime). Para prompts por debajo de 2.564 tokens se ejecuta atención densa bit-exacta. No se dispone de datos sobre el volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La cuantización HQ4_G32_M5 aplica una rotación ortonormal de Walsh-Hadamard a cada grupo de 32 pesos antes de almacenarlos como códigos de 4 bits con escala y sesgo FP16 (20 bytes por 32 pesos). El 95,7% de los parámetros (expertos enrutados y compartidos) usa este formato, el 3,4% (atención, DeltaNet, `lm_head`) también, y el 0,9% restante (embedding de tokens, torre de visión, puertas del router) permanece en BF16.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de razonamiento desactivable (la evaluación de código se realizó con reasoning disabled).
- Generación de código: evaluación sobre 50 tareas HumanEval más 50 MBPP con resultado de 83/100.
- Recuperación en contexto largo: 3/3 de recall en pruebas de multiple needle a 64K, 262K y 1M tokens.
- Decodificación especulativa mediante cabeza MTP (Variational MTP-3 y DFlash 2 como drafter).
- Atención dispersa nativa QSA con modo dual: `auto` (índice entrenado) y `qsa-cluster` (sidecar `model.qlsa`).
- Capacidad de visión por la torre incluida en el modelo base (sin detalles de rendimiento publicados en la información disponible).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación extensa en local: con 262.144 tokens nativos y extensión probada a 1M, el modelo puede procesar contratos, expedientes o bases de código completas en una sola pasada sobre un Mac con memoria unificada de 128 GB, sin depender de servicios en la nube.
- Asistencia de código en estación de trabajo Apple: el rendimiento de 83/100 en HumanEval+MBPP y la decodificación especulativa a 113,7 tok/s permiten integrarlo en editores o flujos de revisión local donde la latencia importa y la privacidad del código es requisito.
- Recuperación aumentada sobre corpus masivos: el recall 3/3 hasta 1M tokens y el modo `qsa-cluster` con presupuesto de 2.048 tokens hacen viable construir sistemas RAG que pasan el corpus completo al modelo en lugar de fragmentarlo.
- Investigación sobre atención dispersa: el sidecar `model.qlsa` y la comparativa entre `auto` y `qsa-cluster` permiten experimentar con estrategias de indexación y agrupación (Ward, superbloques de 512 tokens) sobre un modelo entrenado con QSA.
- Procesamiento por lotes de prompts largos en local: el prefill de 2.688 tok/s a 10,4K tokens y 1.353 tok/s a 1M permiten clasificar, resumir o extraer información de lotes de documentos largos en hardware de sobremesa.
- Evaluación comparativa de cuantizaciones: al existir un pack sucesor (`QWP-Mixed`, 98,42 GiB, 2,62× menor KLD), este pack sirve para medir el impacto de HQ4_G32 frente a mezclas HQ8/HQ4 en tareas de código y contexto largo.
- Despliegue de un MoE de 129B en hardware consumer: demuestra la viabilidad de servir un modelo de esta escala en un único equipo Apple Silicon, útil para prototipos y demos sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Resultados medidos en Apple M5 Max (Mac17,6, 128 GB de memoria unificada, GPU de 40 núcleos, 585 GB/s), macOS 26, `llmprobe v0.6.16`, `--kv-mode q4 --temperature 0`. El pack sucesor `QWP-Mixed` reporta cifras distintas (3.035 tok/s de prefill pico a 8K; 1.888/63,7 tok/s a 1M).

| Metrica | Resultado |
|---|---|
| Prefill (prompt de 10,4K) | 2.688 tok/s (pico 2.696) |
| TTFT en frío | 113 ms |
| TTFT con caché de prompt caliente | 7 ms |
| Decodificación estándar (serial) | 72,3 tok/s |
| Decodificación especulativa (Variational MTP-3) | 113,7 tok/s |
| Prefill / decodificación a 1M (QSA nativa) | 1.353 / 45,4 tok/s |
| Recall de agujas 64K → 1M | 3/3 en cada longitud |
| Evaluación de código (50 HumanEval + 50 MBPP) | 83/100 (79 con MTP exacto) |

Desglose por escalón de contexto (QSA nativa / `qsa-cluster`):

| Contexto nominal | Prefill tok/s | TTFT | Decode tok/s | Recall |
|---|---|---|---|---|
| 64K | 2.542 / 2.280 | 25,2 s / 28,1 s | 81,7 / 63,0 | 3/3 vs 3/3 |
| 262K | 2.171 / 1.553 | 113,1 s / 158,0 s | 72,3 / 34,8 | 3/3 vs 3/3 |
| 1M | 1.353 / — | 766,5 s / — | 45,4 / — | 3/3 |

Las etiquetas de contexto son escalones nominales; las longitudes reales tokenizadas fueron 64.060, 120.673, 245.423, 544.656 y ~1.037.119 tokens. No todos los modelos se midieron en todos los escalones. La decodificación usa MTP nativo y backoff adaptativo de contexto largo, no la línea base serial. El resultado 3/3 corresponde a un único ejercicio de recuperación de tres agujas y no garantiza precisión general.

## Requisitos de hardware

- Memoria unificada: el pack ocupa 76,46 GiB más 54,6 GB de tabla PLE n-gram, lo que exige equipos con 128 GB de memoria unificada (configuración medida: M5 Max, 128 GB).
- GPU: Apple Silicon exclusivamente. El motor Qwegn es un runtime Swift + Metal 4; no hay soporte para CUDA, ROCm ni CPU x86.
- GPU consumer: no aplica en el sentido habitual (RTX 4090, etc.); el equivalente es un Mac con chip M-series y 128 GB de memoria unificada. No se dispone de datos para configuraciones de 64 GB o inferiores.
- Opciones de despliegue: únicamente el motor Qwegn (`qwg pull qwegnai/Qwen3.8-Flash-Next-QWP_4`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: TTFT en frío de 113 ms, TTFT con caché caliente de 7 ms, decodificación de 72,3 tok/s (serial) y 113,7 tok/s (especulativa) en M5 Max; a 1M tokens, 1.353 tok/s de prefill y 45,4 tok/s de decodificación. El TTFT a 262K alcanza 113,1 s, lo que condiciona su uso interactivo en contextos muy largos.
- Almacenamiento: el repositorio ocupa 136,7 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-QWP_4 (este pack) | 128,80 B | 262.144 nativo, ~1M extendido | QWP1 / Qwegn (Apple Silicon) | qwen-community-1.0 | Público en HF, 0 descargas |
| Qwen3.8-Flash-Next-QWP-Mixed (sucesor del mismo autor) | 128,80 B | 262.144 nativo, ~1M extendido | QWP1 / Qwegn | qwen-community-1.0 | Público en HF; 98,42 GiB, 2,62× menor KLD, 3.035 tok/s pico a 8K |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 128,80 B | 262.144 nativo | Pesos originales de Qwen | qwen-community-1.0 | Público en HF |

No se dispone de datos de benchmarks comparativos frente a modelos de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: el contenedor QWP1 solo carga en el motor Qwegn sobre Apple Silicon. No sirve para servidores con GPU NVIDIA, AMD ni para despliegues en contenedores Linux convencionales.
- Pack superado por su sucesor: el propio autor recomienda `Qwen3.8-Flash-Next-QWP-Mixed` para nuevos despliegues (98,42 GiB frente a 131,1 GiB y 2,62× menor KLD). Este pack debe considerarse obsoleto para producción.
- La extensión a 1M tokens es una extensión en tiempo de inferencia, no entrenamiento adicional; el contexto nativo es 262.144 tokens y la precisión más allá de esa longitud no está garantizada.
- El recall 3/3 procede de un único ejercicio de tres agujas; no es una medida general de precisión en contexto largo.
- La decodificación especulativa (Variational MTP-3) puede alterar la salida respecto a una decodificación greedy exacta; para reproducibilidad estricta debe usarse decodificación serial.
- Los resultados de rendimiento dependen de la carga de trabajo y de la temperatura del equipo; las cifras de TTFT en frío y con caché caliente no provienen de un mismo prompt controlado.
- Sin datos publicados sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento en tool calling; no se pueden evaluar esos riesgos con la información disponible.
- Licencia qwen-community-1.0: deben revisarse las condiciones de uso comercial del modelo base antes de cualquier despliegue productivo; la licencia del pack hereda la del modelo original.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Pack en Hugging Face: https://huggingface.co/qwegnai/Qwen3.8-Flash-Next-QWP_4
- Pack sucesor recomendado: https://huggingface.co/qwegnai/Qwen3.8-Flash-Next-QWP-Mixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia Qwegn: https://github.com/qwegnai/qwegn
