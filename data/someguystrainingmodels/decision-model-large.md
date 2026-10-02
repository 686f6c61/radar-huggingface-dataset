# someguystrainingmodels/decision-model-large

## Resumen

decision-model-large es un modelo de decisión derivado del checkpoint Qwen/Qwen3.8-Flash-Next-FP8, publicado por el usuario someguystrainingmodels. No es un modelo generativo al uso: sobre el backbone MoE se ha fusionado un LoRA de rango 32 (receta decision-train-v2, 534.000 filas, 2 épocas, lr 1,5e-5, coseno, semilla 7) y se ha añadido una cabeza puntero denominada jev (head_dim 128) que puntúa pares formados por un token delimitador de decisión y un token de fin de opción. El resultado es un modelo texto-only que emite logits crudos por opción en lugar de texto libre.

El backbone es un MoE híbrido de 176.944.555.171 parámetros totales (~6B activos, notación 176B-A6B) con 1.024 expertos y enrutado top-10, combinando GatedDeltaNet y QSA en proporción 3:1, además de hyper-connections y una tabla de embeddings n-gram PLE. El repositorio ocupa 182 GB y se distribuye en fp8 con escalas de bloque 128x128 en los expertos enrutados, manteniendo bf16 en el resto. La ventana de contexto configurada es de 262.144 tokens.

Su relevancia práctica está en tareas de enrutado y clasificación dentro de pipelines de agentes: en la Decision Index 0.2.1 (155.390 filas) obtiene un índice de 58,52 frente a 57,79 de un stack de referencia MoE de 321B evaluado sobre los mismos casos, con 25 victorias, 1 empate y 17 derrotas en 43 benchmarks. Su punto fuerte son las áreas de Tools (0,754) y Language (0,637); el más débil es Arts (0,411). El modelo no incluye el plugin de serving necesario: requiere el paquete out-of-tree `jev_sglang` montado mediante `SGLANG_EXTERNAL_MODEL_PACKAGE`, lo que condiciona por completo su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GatedDeltaNet + QSA (proporción 3:1), hyper-connections, PLE n-gram embedding; nombre de arquitectura en config.json: `Qwen4ExpForConditionalGeneration` (reemplazado por el plugin `jev_sglang`) |
| Parametros totales | 176.944.555.171 (176B) |
| Parametros activos | ~6B (notación 176B-A6B); MoE de 1.024 expertos con enrutado top-10 |
| Longitud de contexto | 262.144 tokens (`--context-length 262144` en la configuración de serving del autor) |
| Tipos de cuantizacion | fp8 con escalas de bloque 128x128 en los expertos enrutados (byte-idénticas al checkpoint base); bf16 en expertos compartidos y en la salida de la fusión LoRA; cabeza puntero en fp32. No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (131 shards `model-XXX-of-131.safetensors` + `head.safetensors` + `model.safetensors.index.json`) |
| Modelo base | Qwen/Qwen3.8-Flash-Next-FP8 (checkpoint cuantizado a fp8) |
| Tamano del repositorio | 182,0 GB |
| Libreria declarada | custom (`jev_sglang`, plugin out-of-tree para sglang) |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-01 / 2026-10-01 |
| Región | us |

## Arquitectura y entrenamiento

La base es Qwen3.8-Flash-Next-FP8, un MoE híbrido que intercala capas GatedDeltaNet (atención lineal con estado recurrente) y QSA en proporción 3:1, con 1.024 expertos enrutados top-10, hyper-connections y una tabla de embeddings n-gram PLE. Sobre ese backbone se ha fusionado un adaptador LoRA de rango 32 con la receta decision-train-v2 (534.000 filas, lr 1,5e-5, 2 épocas, scheduler coseno, semilla 7). La fusión se aplica con acumulación en fp32 y salida en bf16 según W += (A@B).T · (α/r), dejando los expertos enrutados en fp8 con escalas de bloque 128x128 byte-idénticas al checkpoint original.

La innovación principal es la cabeza puntero jev (`head.safetensors`, 5 claves fp32: `head.q_proj.{weight,bias}`, `head.k_proj.{weight,bias}`, `head.log_scale`). El cálculo es `u = q_proj(hidden[dec])`, `v = k_proj(hidden[opt_end])`, `scores = v·u/√d · exp(log_scale)`, devolviendo logits crudos; la temperatura es responsabilidad del adaptador y el valor sin ajustar es T\*=1,0. Los identificadores de los delimitadores son `jev_dec_delim_token_id: 52679` y `jev_opt_delim_token_id: 17317`. El ajuste se hace con `language_model_only: true`, es decir, es un modelo de decisión solo texto. No se documentan fases de RLHF ni DPO.

## Capacidades

- Puntuación de decisiones: dado un contexto y un conjunto de opciones, la cabeza puntero devuelve un logit por opción, no texto generado.
- Elección múltiple: en la Decision Index obtiene 0,785 en When2Call (MCQ) y 0,561 en GPQA Diamond.
- Clasificación de intenciones con clase fuera de alcance: macro-F1 de 0,878 en CLINC150+OOS.
- Enrutado de herramientas (decidir si procede invocar una herramienta y cuál): área Tools con 0,754, la más alta del desglose por áreas.
- Predicción probabilística: Brier de 0,162 en ForecastBench (menor es mejor), frente a 0,306 de la referencia de 321B.
- Recuperación: área Retrieval con 0,584.
- Razonamiento y matemáticas evaluados como decisión: GSM8K 0,844, SimpleBench 0,500.
- Contexto largo de hasta 262.144 tokens, con chunked prefill desactivado por restricción del plugin.
- Solo texto: `language_model_only: true`. No se documentan capacidades de visión ni de audio.
- No se documenta soporte de tool calling generativo ni de function calling en el sentido clásico; la función del modelo es decidir, no emitir la llamada.
- No se documenta modo thinking ni decodificación especulativa.
- Idiomas soportados: no disponible.

## Casos de uso

- Enrutado previo en agentes multi-paso: el modelo decide si una consulta requiere llamada a herramienta antes de invocar al LLM generativo. Con When2Call en 0,785 frente a 0,559 de la referencia de 321B, reduce llamadas innecesarias y por tanto latencia y coste de tokens.
- Clasificación de intenciones con detección de fuera de alcance: en asistentes de atención al cliente permite separar consultas cubiertas de las que deben escalarse a un humano, con macro-F1 de 0,878 en CLINC150+OOS.
- Triaje de tickets con contexto largo: la ventana de 262.144 tokens permite procesar hilos de conversación completos o documentación extensa sin truncar, emitiendo una decisión por ticket.
- Selección de respuesta en pipelines de evaluación tipo test: formatos MCQ con delimitador de decisión y fin de opción, útiles para validación automática de candidatos en generación de código o razonamiento (GSM8K 0,844).
- Filtrado de candidatos en recuperación aumentada: usar el área Retrieval (0,584) para decidir si un fragmento recuperado es suficiente para responder antes de generar, evitando generaciones sin soporte documental.
- Predicción probabilística calibrable: con Brier 0,162 en ForecastBench, sirve para tareas de estimación de probabilidad donde interesa una puntuación ordenada más que una respuesta textual; los logits crudos permiten ajustar la temperatura aguas abajo.
- Detección de cambios de dominio en producción: el modelo se usa como cabecera de discriminación de distribución sobre flujos de entrada (VAST macro-F1 0,642) para activar reentrenamientos o alarmas.

## Benchmarks y rendimiento

Comparativa dentro de la familia decision-model, sobre edición 0.2.1 de la Decision Index (155.390 filas):

| Modelo | Parametros | Decision Index | balanced_raw | Head-to-head (43 benchmarks) |
|---|---|---|---|---|
| decision-model-tiny | 0,8B | 22,60 | 41,76 | 3 W / 1 T / 39 L |
| decision-model-small | 4B | 40,66 | 54,85 | 5 W / 2 T / 36 L |
| decision-model-large (este repo) | 176B-A6B | 58,52 | 68,32 | 25 W / 1 T / 17 L |
| decision-model-extra-large | 321B (LoRA) | 57,79 | 67,83 | 2 W / 0 T / 36 L |

Nota: en la tabla del autor, el head-to-head de decision-model-extra-large se mide contra la referencia de 321B, por lo que el recuento no es directamente simétrico con el de decision-model-large, que es el que gana 25 de 43.

Victoria de decision-model-large frente a la referencia de 321B en casos idénticos:

| Benchmark | decision-model-large | Referencia 321B | Diferencia |
|---|---|---|---|
| When2Call (MCQ) | 0,785 | 0,559 | +22,6 pp |
| SimpleBench | 0,500 | 0,200 | +30 pp |
| CLINC150+OOS (macro-F1) | 0,878 | 0,802 | +7,6 pp |
| GSM8K | 0,844 | 0,836 | +0,8 pp |
| GPQA Diamond | 0,561 | 0,520 | +4,1 pp |
| POP909-CL | 0,347 | 0,196 | +15,1 pp |
| VAST (macro-F1) | 0,642 | 0,529 | +11,3 pp |
| ForecastBench (Brier, menor es mejor) | 0,162 | 0,306 | -0,144 |

Desglose por áreas de la Decision Index (edición 0.2.1): Knowledge 0,482; Language 0,637; Retrieval 0,584; Tools 0,754; Arts 0,411. Índice global 58,52, balanced_raw 68,32, breadth 57,68. La evaluación completa registró 5 errores sobre 155.390 filas (0,003%). No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 182 GB en fp8, por lo que los pesos solos requieren del orden de 182 GB de VRAM agregada (estimación derivada del tamaño del repo, no una cifra publicada). Hay que sumar caché de estado recurrente y de KV, con `--mem-fraction-static 0.72`.
- Configuración indicada por el autor: `--tp-size 2 --ep-size 2` con `--mem-fraction-static 0.72`. Con 182 GB de pesos repartidos en 2 GPUs, cada dispositivo necesitaría más de 90 GB solo para pesos, lo que apunta a 2 aceleradores de 141 GB (por ejemplo H200) o a un número mayor de GPUs de 80 GB, aunque `--ep-size` debe igualar el TP por la restricción de divisibilidad de los expertos.
- Restricción de paralelismo: los expertos enrutados no se pueden dividir por TP a fp8 con block_n=128 (640 intermedios → 320 por GPU, no divisible), de ahí que `--ep-size` deba coincidir con `--tp-size`.
- GPU recomendadas: no disponibles explícitamente en la información. Por tamaño, la configuración del autor encaja en GPUs de centro de datos con 141 GB o más por dispositivo (H200) o en un despliegue de 4 GPUs de 80 GB ajustando la configuración, extremo no verificado.
- Consumer GPU: no cabe. Un modelo de 176B en fp8 con 182 GB de pesos no es desplegable en GPUs de consumo (RTX 4090, 24 GB), ni siquiera con cuantizaciones adicionales, que además no están publicadas.
- Opciones de despliegue: únicamente sglang con el plugin out-of-tree `jev_sglang` (`SGLANG_EXTERNAL_MODEL_PACKAGE=jev_sglang`), arrancado con `--is-embedding --chunked-prefill-size -1`. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, y no existen pesos GGUF en el repositorio.
- Variables y ajustes obligatorios: `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, `--max-running-requests 48`, `--max-prefill-tokens 16384`, `--max-mamba-cache-size 480`, `--linear-attn-prefill-backend flashinfer`, `--linear-attn-decode-backend flashinfer`, `--mamba-ssm-dtype bfloat16`, tabla PLE n-gram offloaded a RAM de host (`ple_offload_embedding: true`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Decision Index | balanced_raw | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| decision-model-large | 176B-A6B | 58,52 | 68,32 | 262.144 | apache-2.0 | repo de 182 GB, requiere plugin `jev_sglang` |
| decision-model-extra-large | 321B (LoRA) | 57,79 | 67,83 | no disponible | no disponible | no disponible |
| decision-model-small | 4B | 40,66 | 54,85 | no disponible | no disponible | no disponible |
| decision-model-tiny | 0,8B | 22,60 | 41,76 | no disponible | no disponible | no disponible |
| Qwen3.8-Flash-Next-FP8 (base) | 176B-A6B | no disponible | no disponible | no disponible | no disponible | checkpoint base en fp8 |

Frente a alternativas generalistas de la misma categoría (LLM de propósito general para clasificación o enrutado) no hay datos comparables en la información proporcionada: la Decision Index es una evaluación propia del autor y no se han publicado métricas de MMLU, HumanEval u otros benchmarks estándar.

## Limitaciones y advertencias

- Dependencia crítica de un plugin out-of-tree: sin el paquete `jev_sglang` y el plugin de decisión `Qwen4ExpForConditionalGeneration`, el checkpoint no es utilizable; el plugin no se incluye en el repositorio.
- Requiere servir en modo embedding (`--is-embedding`) y con `language_model_only: true`; no es un modelo de generación de texto en esta configuración.
- Calibración no ajustada: la cabeza devuelve logits crudos y `T*=1,0` sin ajustar, por lo que cualquier uso probabilístico exige calibrar la temperatura aguas abajo.
- Restricciones de serving frágiles: `--chunked-prefill-size -1` es obligatorio porque el escaneo de delimitadores del plugin depende del valor; `--ep-size` debe igualar `--tp-size`; la fusión de expertos compartidos está desactivada y `head.` debe excluirse de la cuantización fp8 con doble nomenclatura (`model.language_model.*` y `model.*`).
- Riesgo de alucinación: no evaluable directamente, ya que el modelo no genera texto, pero los errores de decisión se propagan silenciosamente a los sistemas que consumen su puntuación. El propio autor reporta 5 errores (0,003%) en la evaluación de 155.390 filas.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingüe.
- Áreas débiles: Arts (0,411) y Knowledge (0,482) son las peores puntuaciones del desglose, frente a Tools (0,754). En POP909-CL el resultado es 0,347, bajo en términos absolutos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado. No hay evidencia de uso en producción.
- Licencia: el repositorio se declara apache-2.0, pero no se especifica la licencia del checkpoint base Qwen/Qwen3.8-Flash-Next-FP8 ni las condiciones de redistribución del modelo derivado; conviene verificarlas antes de un uso comercial.
- Sin resultados de benchmarks estándar publicados fuera de la Decision Index propietaria, lo que dificulta la comparación independiente.
- Sin cuantizaciones adicionales (GGUF, AWQ, GPTQ) publicadas, lo que descarta el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/someguystrainingmodels/decision-model-large
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo hermano decision-model-tiny: https://huggingface.co/someguystrainingmodels/decision-model-tiny
- Modelo hermano decision-model-small: https://huggingface.co/someguystrainingmodels/decision-model-small
- Modelo hermano decision-model-extra-large: https://huggingface.co/someguystrainingmodels/decision-model-extra-large
- Repositorio del plugin `jev_sglang`: no disponible
- Paper o blog tecnico: no disponible

Nota: los resultados de la búsqueda web realizada (páginas de DeepMind, Ultralytics, GitHub Topics, Onyx y OpenRouter) no guardan relación con este modelo y no se incluyen como enlaces relevantes.
