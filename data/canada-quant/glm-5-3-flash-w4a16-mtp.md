# canada-quant/GLM-5.3-Flash-W4A16-MTP

## Resumen

GLM-5.3-Flash-W4A16-MTP es una cuantización de solo pesos en INT4 del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario canada-quant. No es un modelo nuevo: toda la capacidad cognitiva procede del checkpoint base, y el trabajo del autor consiste en comprimir únicamente las 36.288 GEMM de expertos enrutados a INT4 (GPTQ simétrico, group-size 128), dejando en BF16 la atención, el router, los expertos compartidos, los embeddings, la torre de visión y la cabeza MTP. El resultado pasa de aproximadamente 599 GiB en BF16 a 177,7 GiB, una reducción del 70%, manteniendo la cabeza MTP en BF16 para habilitar decodificación especulativa.

El modelo tiene 49.913.588.606 parámetros (~49,9 B) según los safetensors, y su arquitectura es un transformer híbrido: combina atención lineal con caché de estados Mamba/KDA (512 bloques) y atención MLA completa, con un MoE de expertos enrutados y sin RoPE (NoPE). El contexto soportado llega a 1.048.576 tokens en configuraciones de 2× H200 y 2× DGX Spark, mientras que en las configuraciones x86 de 4 y 8 GPU queda limitado por memoria de KV a 262K–512K tokens.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo multimodal de casi 50.000 millones de parámetros con contexto de hasta 1M de tokens en hardware que no sea un clúster de A100/H100 completo, incluidas dos unidades DGX Spark (GB10); por otro, mantiene la ruta especulativa MTP, con la que se alcanzan 181,2 tok/s en un solo flujo sobre 8× H100 y 2.418 tok/s agregados a concurrencia 256 sobre la misma configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y caché de estados Mamba/KDA (512 bloques) más atención MLA completa; MoE con 36.288 GEMM de expertos enrutados; sin RoPE (NoPE) |
| Parametros totales | 49.913.588.606 (~49,9 B), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) en 2× H200 y en 2× DGX Spark; 262K por defecto con el drafter DFlash2-G (800K validados); 262K–512K en configuraciones x86 de 4 y 8 GPU (limitado por memoria de KV) |
| Tipos de cuantizacion | W4A16: INT4 de solo pesos (GPTQ, simétrico, group-size 128) únicamente en las GEMM de expertos enrutados; atención, router, expertos compartidos, embeddings, torre de visión y cabeza MTP en BF16. No se documentan otras cuantizaciones en el repositorio |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors con formato compressed-tensors; compatible con transformers y vLLM |
| Tamano del repositorio | 190,9 GB (pesos cuantizados: 177,7 GiB) |
| Pipeline | image-text-to-text (multimodal con visión) |
| Modelo base | zai-org/GLM-5.3-Flash |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido. La model card describe explícitamente un modelo de atención lineal híbrida con 512 bloques de caché de estados Mamba/KDA, lo que impone el límite operativo de `--max-num-seqs ≤ 512` en vLLM. A ello se suma atención MLA (Multi-head Latent Attention) en las capas de atención completa; en la imagen nightly de vLLM hay que seleccionar el backend `FLASH_ATTN_MLA_SPARSE`, porque el backend por defecto falla con prompts de 131K tokens o más. El modelo es NoPE (sin RoPE), y por ese motivo no hay soporte de KV en fp8 sobre Hopper.

El componente MoE contiene 36.288 GEMM de expertos enrutados, que son exactamente las matrices cuantizadas a INT4 en esta publicación. El resto de tensores permanece en BF16. Se mantiene una cabeza MTP (Multi-Token Prediction) en BF16 para decodificación especulativa; la model card también menciona un drafter alternativo denominado DFlash2-G y parches de taps auxiliares EAGLE3 con particionado de KV consciente del drafter. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras etapas de alineamiento: esos datos corresponden al modelo base y no están disponibles en la información proporcionada. Esta publicación es una cuantización, no un reentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline declarado de image-text-to-text.
- Razonamiento matemático de competición: la model card reporta AIME 2025 con 0,8833 y AIME 2026 con 85,0%.
- Razonamiento científico: GPQA-Diamond 0,8586.
- Aritmética y problemas de enunciado: GSM8K 0,97.
- Comprensión multimodal: MMMU 0,747 y OCRBench 888, gracias a la torre de visión conservada en BF16.
- Tool calling y function calling: la receta de servicio usa `--tool-call-parser glm47 --enable-auto-tool-choice`.
- Modo de razonamiento explícito: se sirve con `--reasoning-parser glm45`.
- Decodificación especulativa mediante cabeza MTP en BF16 (`--speculative-config '{"method":"mtp","num_speculative_tokens":2}'`) y mediante drafter DFlash2-G.
- Contexto largo de hasta 1.048.576 tokens, apto para documentos completos y conversaciones multi-turno extensas.
- Despliegue compatible con la API OpenAI de vLLM (`/v1/chat/completions`).
- Capacidades de agente multi-paso: no documentadas explícitamente en la información proporcionada, aunque el soporte de tool calling y el contexto de 1M son compatibles con ese uso.
- Audio, vídeo o modos adicionales: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 1.048.576 tokens de contexto en 2× H200, se puede cargar un repositorio de código completo, un conjunto de especificaciones o un expediente de cientos de páginas en una sola petición sin recuperación previa, manteniendo coherencia global entre secciones.
- Digitalización y extracción de datos de documentos escaneados: el pipeline image-text-to-text junto con OCRBench 888 permite procesar facturas, formularios e informes en PDF con tablas, extrayendo campos estructurados directamente desde la imagen.
- Asistente de código con tool calling: integrado en un servidor vLLM con `--tool-call-parser glm47`, el modelo puede invocar funciones de ejecución de tests, consulta de repositorios o linters dentro de un pipeline de CI/CD, generando parches y validándolos contra la suite de pruebas.
- Razonamiento matemático y verificación formal asistida: con AIME 2025 en 0,8833 y GSM8K en 0,97, resulta adecuado para tutoría de problemas de competición, generación de problemas con solución y revisión paso a paso de demostraciones (el ejemplo de la model card es la demostración de la infinitud de los primos).
- Atención al cliente bilingüe inglés-chino: conversaciones multi-turno con historial largo, apoyadas en el contexto de 262K–512K tokens de las configuraciones x86 y en el modo de razonamiento para resolver incidencias con lógica de negocio compleja.
- Investigación científica asistida: con GPQA-Diamond 0,8586, sirve para resumir literatura especializada, contrastar hipótesis y extraer resultados numéricos de figuras y tablas en artículos.
- Procesamiento por lotes de alto rendimiento: los 2.418 tok/s agregados a concurrencia 256 sobre 8× H100 (TP8 sin especulación) permiten clasificación, resumen o anonimización masiva de corpus documentales en ventanas de mantenimiento nocturnas.
- Despliegue en borde con DGX Spark: dos unidades GB10 sostienen el modelo con unos 31–33 tok/s por flujo en contexto corto, lo que habilita prototipos locales de asistente multimodal con datos que no pueden salir de la organización.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Resultado | Muestra / hardware |
|---|---|---|
| AIME 2025 | 0,8833 | n=120, H100 |
| AIME 2026 | 85,0% | n=120, 2× DGX Spark |
| GPQA-Diamond | 0,8586 | no disponible |
| GSM8K | 0,97 | no disponible |
| MMMU (visión) | 0,747 | no disponible |
| OCRBench | 888 | no disponible |

Throughput declarado:

| Configuración | Modo | Resultado |
|---|---|---|
| 8× H100, TP8 + DFlash2-G K=7 | Flujo único | 181,2 tok/s a c1 (+34% sobre TP8 sin especulación, 135,4) |
| 8× H100, TP8 sin especulación | Agregado | 2.418 tok/s a c256 |
| 8× H100, MTP N=2 | Agregado | 2.330 tok/s a c256; 215,0 a c1 en la rejilla |
| 8× H100, TP8 + MTP N=2 (sin竞争中) | Flujo único | 193,18 a c1; 1.292 a c256 |
| 4× H200, TP4 | Escalado | 195 → 1.954 tok/s de c1 a c256 |
| 2× DGX Spark | Flujo único, contexto corto | ≈31–33 tok/s |

Aceptación de la decodificación especulativa: 52–55% con `num_speculative_tokens: 2` en Hopper; con N=5 la aceptación cae a aproximadamente el 30%. El arranque en frío de la imagen `ghcr.io/canada-quant/vllm-glm53-flash-h100:v2-w4a16-dflash2` es de unos 12 minutos. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: 177,7 GiB en total; con TP=2 sobre 2× H200 quedan 89,5 GiB por GPU (dato de la model card).
- Estimación derivada por tensor-parallelism: TP=4 reparte aproximadamente 44–45 GiB de pesos por GPU, a lo que hay que sumar caché KV y estados lineales; la receta de referencia usa `--gpu-memory-utilization 0.92`.
- GPU validadas: NVIDIA H100 (SM90), H200 (SM90), RTX PRO 6000 (SM120) y DGX Spark GB10 (SM121). También se mencionan arquitecturas Blackwell y Hopper.
- Consumer GPU: no cabe. Los 177,7 GiB de pesos exceden por completo los 24 GB de una RTX 4090 o similares; se requiere hardware de centro de datos o DGX Spark en pares.
- Configuración mínima viable documentada: 2× H200 con `--tensor-parallel-size 2`, o 2× DGX Spark con el drafter de referencia incoai.
- Opciones de despliegue: vLLM (imágenes específicas por arquitectura), API compatible con OpenAI. No se documentan recetas para llama.cpp, Ollama, TGI ni otros motores con estos pesos.
- Imágenes de servicio: `vllm/vllm-openai:glm53-flash-x86_64-cu130` para SM90; `cstechdev/vllm:glm53-flash-nope-sm120-cu130-20260826-r1` para SM120; `ghcr.io/canada-quant/vllm-glm53-flash-sm121:v2-w4a16-dflash2e` para SM121; `ghcr.io/canada-quant/vllm-glm53-flash-h100:v2-w4a16-dflash2` para 8× H100 con DFlash2-G. La nightly upstream `vllm/vllm-openai:nightly-x86_64` posterior al 2026-09-08 también arranca el checkpoint, pero exige `--attention-backend FLASH_ATTN_MLA_SPARSE`.
- Memoria de KV: en TP=4 con DFlash2 el pool cae a 311.999 tokens frente a 1.811.949 en TP8, lo que provoca preempciones y un salto brusco de TTFT más allá de concurrencia 32.
- Latencia: no se publican valores de TTFT absolutos; sí se documenta el salto de latencia en TP=4 con drafter, el arranque en frío de ~12 minutos y las cifras de tok/s de la tabla anterior.
- fp8 KV no está disponible en Hopper para este modelo NoPE.

## Comparativa con modelos similares

Comparación directa entre el checkpoint base y esta cuantización, con los datos aportados:

| Modelo | Parametros | Peso en disco | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash (BF16) | ~49,9 B (mismo grafo) | ≈599 GiB (BF16) | Hasta 1M tokens | MIT | Referencia de calidad sin pérdida por cuantización |
| canada-quant/GLM-5.3-Flash-W4A16-MTP | 49.913.588.606 | 177,7 GiB (−70%) | Hasta 1M tokens (2× H200); 262K–512K en x86 4/8 GPU | MIT | Solo expertos enrutados en INT4; cabeza MTP en BF16 |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. Tampoco se documenta la degradación exacta de calidad respecto al checkpoint BF16, por lo que la comparación de rendimiento entre ambos queda en "no disponible".

## Limitaciones y advertencias

- Cobertura idiomática limitada a inglés y chino; el rendimiento en castellano no está documentado ni validado.
- Al ser una cuantización de solo pesos sobre los expertos enrutados, introduce una pérdida de calidad no cuantificada en la información disponible. La model card no publica la comparación de benchmarks contra el BF16.
- No es un modelo nuevo: todas las capacidades, sesgos y limitaciones provienen de zai-org/GLM-5.3-Flash. Los sesgos conocidos del modelo base no están documentados en la información proporcionada.
- Riesgo de alucinación inherente a los modelos generativos; no se publican tasas de alucinación ni evaluaciones de fidelidad.
- Dos trampas operativas señaladas por el autor: si el `config.json` es anterior al 2026-09-08, vLLM falla con `KeyError: 'layers.0.mlp.gate_up_proj.weight'` (los pesos no cambian, solo hay que volver a descargar el config); y hay que pasar siempre `--max-num-seqs ≤ 512`, porque el valor por defecto de 1024 supera los 512 bloques de caché de estado Mamba/KDA del modelo.
- La caché de prefijos debe permanecer desactivada: en H200 mide entre −2% y −5%.
- Con cualquier drafter especulativo, hay que limitar `--max-model-len ≤ 131071`, ya que la ruta especulativa falla en prefills de 131K tokens (sin especulación sí funcionan).
- El backend de atención por defecto de vLLM nightly falla con prompts de 131K o más; es obligatorio `FLASH_ATTN_MLA_SPARSE`.
- Con `num_speculative_tokens: 5` la aceptación cae a ~30%, por debajo del óptimo de 2.
- TP=4 combinado con el drafter DFlash2 degrada el pool de KV unas 6× respecto a TP8 y provoca un cliff de preempción y recomputación pasado c32.
- fp8 KV no está disponible en Hopper para este modelo NoPE, lo que limita el ahorro de memoria en esa plataforma.
- Licencia MIT, que permite uso comercial; conviene verificar igualmente los términos del modelo base y de los pesos derivados en el repositorio original de zai-org.
- El tamaño del repositorio (190,9 GB) y de los pesos (177,7 GiB) exige almacenamiento y ancho de banda de descarga considerables; no es desplegable en GPU de consumo.
- Los resultados de benchmarks proceden de configuraciones de hardware concretas y de muestras pequeñas (n=120 en AIME), por lo que la varianza puede ser relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canada-quant/GLM-5.3-Flash-W4A16-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- BENCHMARKS.md del autor: https://huggingface.co/canada-quant/GLM-5.3-Flash-W4A16-MTP/blob/main/BENCHMARKS.md
- Pull request de vLLM con el soporte del checkpoint: https://github.com/vllm-project/vllm/pull/53906
- Repositorio de la imagen SM121: https://github.com/canada-quant/vllm-glm53-flash-sm121
- Imagen SM90 con DFlash2-G: ghcr.io/canada-quant/vllm-glm53-flash-h100:v2-w4a16-dflash2
- Imagen SM121: ghcr.io/canada-quant/vllm-glm53-flash-sm121:v2-w4a16-dflash2e
- Imagen SM120 (RTX PRO 6000): cstechdev/vllm:glm53-flash-nope-sm120-cu130-20260826-r1
- Imagen SM90 oficial: vllm/vllm-openai:glm53-flash-x86_64-cu130

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo; los resultados obtenidos trataban sobre el país Canadá y no guardan relación con este repositorio.
