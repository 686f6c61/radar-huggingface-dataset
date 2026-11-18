# Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Grawnch en Hugging Face. Se trata de una compilación autocontenida pensada para ejecución nativa en GPUs NVIDIA Blackwell (sm_120), que combina una cuantización propietaria denominada Wave-Quant v6 a 2.45 bits por peso con un drafter especulativo DFlash2 calibrado. El modelo base es un MoE de 180 000 millones de parámetros totales con 48 capas híbridas: 36 capas Gated DeltaNet (GDN) y 12 capas Qwen Sparse Attention (QSA), con 512 expertos enrutados más 1 compartido y hyper-conexiones mHC de 4 flujos.

El interés de esta ficha radica en que demuestra una ruta de despliegue de un MoE de 180B en hardware de consumo profesional (RTX PRO 6000 Blackwell, 96 GiB de VRAM) y, con pooling híbrido, incluso en una RTX 5090 de 32 GiB. El repositorio ocupa 79.5 GB e incluye todos los shards, el indexador QSA de 128K de contexto, las tablas de embeddings per-layer en formato Q4_0 (26.82 GiB alojados en RAM pinned del host) y el drafter DFlash2 empaquetado bajo `dflash2/`.

La relevancia actual es doble: por un lado, valida la decodificación especulativa con tasas de aceptación medias (mean_tau entre 3.49 y 4.67) sobre un MoE cuantizado a muy baja precisión; por otro, ofrece métricas verificadas de rendimiento y calidad (AIME 2025 al 80.0% Pass@1, LiveCodeBench v6 al 76.0%) que permiten evaluar si la agresiva cuantización a 2.45 bpw degrada de forma aceptable el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 36 capas Gated DeltaNet (GDN) + 12 capas Qwen Sparse Attention (QSA), con hyper-conexiones mHC de 4 flujos |
| Parametros totales | 180 000 millones (180B) |
| Parametros activos | no disponible (512 expertos enrutados + 1 compartido por capa; no se especifica el número de expertos activos por token) |
| Longitud de contexto | 128K (indexador QSA con Top-2048 sparse attention; evaluado a 8K en los benchmarks publicados) |
| Tipos de cuantizacion | Wave-Quant v6 a 2.45 bpw (FWHT-128 + Wave-LUT de 16 bancos); embeddings per-layer en Q4_0; drafter en SWZ4 y BF16 calibrado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (100% nativo, sin GGUF); incluye `config.json`, `tokenizer.json`, `chat_template.jinja` y manifiesto `sm120_manifest.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida poco convencional: 48 capas en total, de las cuales 36 son Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y 12 son Qwen Sparse Attention con un indexador Top-2048 sobre ventanas de 128K tokens. La componente MoE cuenta con 512 expertos enrutados más uno compartido por capa, y el modelo incorpora hyper-conexiones mHC de 4 flujos para mejorar el flujo de gradientes y la estabilidad del entrenamiento. El vocabulario del tokenizador es de 248 320 entradas.

El checkpoint publicado no incluye información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí documenta el autor es el pipeline de cuantización y despliegue: Wave-Quant v6 aplica una transformada FWHT de 128 puntos y una lookup table no lineal de 16 bancos para comprimir los pesos a 2.45 bpw, mientras que las embeddings per-layer (PLE) se almacenan por separado en Q4_0 dentro de `ple_q4_0.safetensors` para permitir un gather desde RAM pinned del host sin consumir VRAM. El drafter especulativo DFlash2, un modelo de difusión por bloques, se ha calibrado específicamente contra los pesos WV-v6 y se distribuye junto con las tablas de taps en `dflash2_swz4_wv6_calibrated.safetensors`.

## Capacidades

- Generación de texto conversacional y continuaciones largas, con plantilla de chat Jinja incluida.
- Razonamiento matemático de competición: 24/30 en AIME 2025 (Pass@1) según la telemetría del autor.
- Generación de código: 133/175 en LiveCodeBench v6 (Pass@1), con desglose por dificultad (fácil 97.67%, medio 92.31%, difícil-top30 70.0%).
- Decodificación especulativa integrada mediante el drafter DFlash2, con tasas de aceptación medias de 3.49 a 4.67 tokens por paso.
- Generación de JSON válido al 100% bajo esquema y FSM (máquina de estados finitos) en GPU, a 248.76 tok/s con B=4.
- Soporte de contexto largo: indexador QSA de 128K con atención dispersa Top-2048.
- Capacidad de ejecución en modo híbrido: pesos densos y expertos calientes en VRAM, tabla PLE en RAM pinned del host.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición estilo AIME con un 80% de acierto en Pass@1, adecuado para herramientas de verificación de demostraciones o generación de problemas resueltos con trazas paso a paso.
- Generación de código en pipelines de CI/CD: con 76% en LiveCodeBench v6 y soporte de JSON estructurado, puede integrarse como generador de parches o tests unitarios validados por esquema antes de aplicarse.
- Salidas estructuradas para integración de sistemas: la generación JSON FSM al 100% de validez a 248.76 tok/s permite usarlo como backend de agentes que necesitan respuestas parseables sin post-procesado correctivo.
- Servicio de chat de alta concurrencia: con 665.65 tok/s a B=16 en RTX PRO 6000 Blackwell, es viable atender múltiples sesiones simultáneas en una sola GPU para atención al cliente o asistentes internos.
- Despliegue en estación de trabajo con RTX 5090: el modo de pooling híbrido (Top-128 expertos calientes + densos) ocupa 15.40 GiB, lo que permite ejecutar un MoE de 180B en una GPU de consumo profesional de 32 GiB para prototipado e investigación.
- Investigación sobre cuantización extrema: sirve como banco de pruebas para medir la degradación de un MoE a 2.45 bpw frente al modelo original, con métricas de perplejidad a 8K (3.1068 global) y benchmarks downstream ya publicados.
- Evaluación de decodificación especulativa: el bundle incluye el drafter DFlash2 calibrado, lo que facilita reproducir experimentos de aceptación especulativa (mean_tau) sobre distintos tamaños de batch.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| AIME 2025 (30 problemas, Pass@1) | 24/30 (80.0%), 265.3 tok/s, mean_tau 4.26 |
| LiveCodeBench v6 completo (175 problemas, presupuesto 96K, Pass@1) | 133/175 (76.0%) |
| LiveCodeBench v6 fácil | 97.67% (42/43) |
| LiveCodeBench v6 medio | 92.31% (48/52) |
| LiveCodeBench v6 difícil-top30 | 70.0% (21/30) |
| Perplejidad 8K global (All_8192) | 3.1068 |
| Perplejidad 8K tramo medio (Mid_2048_4096) | 2.7302 |
| Perplejidad 8K tramo tardío (Late_4096_8192) | 3.2251 |
| Throughput B=1 (DFlash2) | 183.70 tok/s, mean_tau 3.491 |
| Throughput B=2 (16K Sparse-QSA) | 306.00 tok/s, mean_tau 4.667 |
| Throughput B=4 | 349.76 tok/s, mean_tau 3.917 |
| Throughput B=8 | 477.13 tok/s, mean_tau 3.559 |
| Throughput B=16 | 665.65 tok/s, mean_tau 3.568 |
| JSON FSM B=4 | 248.76 tok/s, 100% JSON válido, mean_tau 3.538 |

No se han publicado comparaciones directas con otros modelos en la información disponible; los datos anteriores son mediciones del propio autor sobre una RTX PRO 6000 Blackwell.

## Requisitos de hardware

- VRAM residente en modo `all_vram`: 54.43 GiB en GPU, más 26.82 GiB de tabla PLE en RAM pinned del host.
- Modo híbrido para RTX 5090 (32 GiB): 15.40 GiB residentes con pooling Top-128 de expertos calientes más la parte densa; el autor marca `fits_32gib_rtx5090 = true`.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell (96 GiB, sm_120) para el modo completo; NVIDIA RTX 5090 (32 GiB, sm_120) para el modo híbrido.
- GPUs no soportadas: el checkpoint está compilado para sm_120 (Blackwell); no hay indicios de compatibilidad con Ampere, Hopper ni arquitecturas anteriores.
- Almacenamiento: repositorio de 79.5 GB; el bundle descargable ocupa aproximadamente 74.7 GiB.
- Opciones de despliegue: descarga mediante `hf download` con `HF_XET_HIGH_PERFORMANCE=1`; la ejecución requiere el runtime bare-metal `qfn_baremetal_sm120_wv6` referenciado por el manifiesto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput observado: 183.70 tok/s a B=1 y 665.65 tok/s a B=16 en RTX PRO 6000 Blackwell con decodificación especulativa DFlash2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120 (este) | 180B (MoE) | 128K | WV-v6 2.45 bpw + Q4_0 PLE | Apache 2.0 | Hugging Face, runtime bare-metal sm_120 |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (MoE) | 128K | BF16 (pesos originales) | Apache 2.0 | Hugging Face |
| incoai/Qwen3.8-Flash-Next-DFlash2 | no disponible | no disponible | BF16 (drafter) | no disponible | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni del drafter por separado en la información proporcionada, por lo que no es posible cuantificar la degradación introducida por la cuantización a 2.45 bpw.

## Limitaciones y advertencias

- La cuantización a 2.45 bpw es extremadamente agresiva; las métricas publicadas corresponden al checkpoint cuantizado, pero no se ofrece comparación con el modelo base para medir la pérdida de calidad.
- El checkpoint está compilado exclusivamente para GPUs Blackwell sm_120; no funcionará en A100, H100, RTX 4090 ni arquitecturas anteriores.
- El runtime necesario (`qfn_baremetal_sm120_wv6`) es específico del autor y no se documenta su disponibilidad, instalación ni soporte; no hay integración con vLLM, TGI, llama.cpp, Ollama ni transformers estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.
- Los benchmarks (AIME 2025, LiveCodeBench v6, perplejidad 8K) son mediciones del propio autor sin verificación externa; deben tratarse como indicativos.
- No se especifican los idiomas soportados ni se documentan sesgos conocidos del modelo base.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso, aunque el JSON FSM sugiere viabilidad para salidas estructuradas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un runtime propietario no auditado y de hardware específico limita su viabilidad en producción.
- El modelo base Qwen3.8-Flash-Next no está verificado como publicado oficialmente por Alibaba en la información disponible; conviene confirmar su procedencia antes de un despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v6-2.45bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
