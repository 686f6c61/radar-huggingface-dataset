# arelius/Inkling-2-Mini-Q6K-3090-GGUF

## Resumen

Inkling-2-Mini-Q6K-3090-GGUF es una cuantización GGUF de alta calidad del modelo base thinkingmachines/Inkling-2-Mini, publicado por el desarrollador arelius (Clark Saben). El modelo base, obra de Thinking Machines Lab, es un transformer de tipo mezcla de expertos (MoE) con 26.070.385.152 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token, y emplea un núcleo con pasadas recurrentes ("looped core") de 48 capas. Esta versión concreta está optimizada para ejecutarse en una única GPU de consumo RTX 3090, manteniendo una perplejidad prácticamente idéntica a la conversión de 4 bits de referencia.

El interés de esta ficha radica en que demuestra que un modelo MoE de 26B con núcleo recurrente puede servirse en hardware de gama alta de consumo con una calidad casi exacta respecto al cuantizado de 4 bits oficial. El autor reporta 159,3 tok/s en decodificación con contexto vacío y 152,4 tok/s en modo servidor con respuestas de 700 tokens, con un consumo de VRAM de 19,5 GB a 32K de contexto. La perplejidad de prefill es de 2,9404 frente a 2,9401 del IQ4_NL de ggml-org, una diferencia dentro del ruido estadístico.

La relevancia actual es doble: por un lado, ofrece una alternativa de mayor calidad que la build de 2 bits del mismo autor (a costa de velocidad); por otro, valida un fork específico de llama.cpp (`inkling-3090`) con optimizaciones de segmentación de quant types y fusión de operaciones que hacen viable el despliegue local de arquitecturas MoE recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente ("looped core"), 48 pasadas de capa |
| Parametros totales | 26.070.385.152 (26,4B) |
| Parametros activos | ~3.400 millones (3,4B) |
| Longitud de contexto | 32.768 tokens por defecto en el servidor; hasta 49.152 con `--ctx` si la GPU está libre |
| Tipos de cuantizacion | Mixta: IQ4_NL (expertos enrutados capas 0-19), Q8_0 (expertos capas 20-23, embeddings), Q6_K (proyecciones de atención y cabeza de salida), F32 (norms, router, controladores de bucle, biases) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-Q6K-dense.gguf`, 16,2 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con un núcleo recurrente: las capas se ejecutan en 48 pasadas, lo que implica que cada pasada relee la caché de atención, motivo por el cual el rendimiento decae a medida que se llena el contexto. Los expertos enrutados de las capas 0-19 se mantienen en IQ4_NL sin modificar respecto al GGUF original de ggml-org, mientras que las capas 20-23 usan Q8_0; solo las proyecciones densas de atención y la cabeza de salida se recuantizan a Q6_K (originalmente Q8_0). Los embeddings de tokens permanecen en Q8_0 y los componentes sensibles (norms, router, controladores de bucle y biases) se conservan en F32, con conversión opcional de los controladores de bucle a F16 en carga mediante `LLAMA_INKLING_CTRL_F16=1`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta build es el fork `csaben/llama.cpp` rama `inkling-3090`, que introduce segmentación de quant types (`IK_SEGMENTED_Q6`, `IK_SEGMENTED_IQ4`), especialización de operaciones mixtas (`IK_MIX_SPECIALIZE`) y procesamiento por lotes de mensajes (`IK_BATCH_MESSAGES`), además de un backend de sampling dedicado. Estas optimizaciones no alteran las salidas: tres sondas greedy de 200 tokens coinciden byte a byte con un checkpoint anterior más lento de los mismos pesos.

## Capacidades

- Generación de texto conversacional y de formato largo, con pipeline `text-generation`.
- Razonamiento multi-paso implícito en el núcleo recurrente de 48 pasadas.
- Generación de código y matemáticas (capacidad esperable del modelo base; no se aportan benchmarks específicos en la información disponible).
- Soporte de API compatible con OpenAI a través del servidor `llama-server` del fork, con id de modelo `inkling-mini`.
- Procesamiento por lotes de mensajes habilitado por `IK_BATCH_MESSAGES=1`, útil para servir múltiples peticiones.
- Modo texto únicamente: no incluye proyector de visión ni capacidades multimodales.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estación de trabajo con RTX 3090: el modelo sirve una API compatible con OpenAI en `127.0.0.1:8031/v1` con 32K de contexto, suficiente para conversaciones multi-turno largas sin salir del equipo del desarrollador.
- Generación de código en pipelines de CI/CD: con 152 tok/s en modo servidor y respuestas de 700 tokens, puede integrarse como servicio de autocompletado o revisión de parches en un runner con GPU única.
- Prototipado de agentes con contexto largo: los 32K tokens por defecto (ampliables a 49K) permiten mantener historiales de herramientas y trazas de ejecución sin truncar.
- Evaluación de arquitecturas MoE recurrentes en investigación: el fork de llama.cpp expone variables de entorno para segmentar quant types y aislar el efecto de cada optimización sobre latencia y perplejidad.
- Servicio de resumen y extracción sobre documentos técnicos: la perplejidad de decodificación de 4,0640 en la build es prácticamente idéntica a la referencia IQ4_NL (4,0660), lo que respalda la fidelidad en tareas generativas.
- Despliegue de bajo coste en hardware de consumo: 19,5 GB de VRAM a 32K de contexto caben en una RTX 3090 de 24 GB, evitando GPUs de datacenter.
- Comparación A/B de cuantizaciones: la build de 2 bits del mismo autor (208,7 tok/s, perplejidad 3,0530) frente a esta de 6 bits (159,3 tok/s, perplejidad 2,9404) permite calibrar el compromiso calidad/velocidad en producción.

## Benchmarks y rendimiento

Datos medidos por el autor en una única RTX 3090. La perplejidad de prefill usa `perf/ppl.txt` del fork: 8×2048 tokens para prefill y 2×1024 tokens con ubatch 1 para decodificación.

| Modelo | Decode tok/s (ctx vacío) | 512 tok | 1K tok | Servido (700 tok) | PPL prefill | PPL decode |
|---|---:|---:|---:|---:|---:|---:|
| ggml-org IQ4_NL (referencia) | — | — | — | — | 2,9401 | 4,0660 |
| **Esta build Q6K** | **159,3** | 153,9 | 150,3 | **152,4** (T=0) / 152,1 (T=0,7) | 2,9404 | 4,0640 |
| Build de 2 bits (comparación) | 208,7 | — | 193,2 | 202,2 | 3,0530 | 4,1945 |

Latencia de primer token tras prompt de 16K tokens: 6,1 s, con decodificación posterior de ~143 tok/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 19,5 GB a 32K de contexto con la configuración recomendada (`-ctk q8_0 -ctv q8_0`, `-fa on`, `-ngl 99`).
- GPU recomendada: NVIDIA RTX 3090 (24 GB) como objetivo de diseño; arquitectura CUDA 86. Otras GPUs con ≥24 GB de VRAM podrían funcionar, pero no se han validado en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 3090; en RTX 4090 (24 GB) es esperable que quepa con las mismas cuantizaciones de caché, aunque no se aportan mediciones.
- Requisitos de software: Linux con glibc ≥ 2.38, driver NVIDIA ≥ 570, `uv` para la instalación de un comando; no requiere toolkit CUDA si se usa el servidor precompilado.
- Opciones de despliegue: `llama-server` del fork `csaben/llama.cpp` rama `inkling-3090` (build precompilada `inkling-3090-v2`), o compilación manual con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=86`.
- Throughput: 159,3 tok/s en decodificación con contexto vacío; 152,4 tok/s en modo servidor con respuestas de 700 tokens; 143 tok/s tras prompt de 16K. El rendimiento decae con el contexto porque cada una de las 48 pasadas relee la caché de atención.
- Variables de entorno recomendadas: `LLAMA_INKLING_CTRL_F16=1`, `IK_BATCH_MESSAGES=1`, `IK_SEGMENTED_Q6=1`, `IK_SEGMENTED_IQ4=1`, `IK_MIX_SPECIALIZE=1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Inkling-2-Mini-Q6K-3090 (esta build)** | 26,4B totales / 3,4B activos | 32K (hasta 49K) | Apache-2.0 | GGUF mixto | 159,3 tok/s, PPL 2,9404, 19,5 GB VRAM |
| Inkling-2-Mini-Q2-3090 (mismo autor) | 26,4B totales / 3,4B activos | 32K | Apache-2.0 | GGUF 2 bits | 208,7 tok/s, PPL 3,0530 (3-4% peor) |
| ggml-org Inkling-2-Mini-IQ4_NL | 26,4B totales / 3,4B activos | no disponible | Apache-2.0 | GGUF IQ4_NL | Referencia de calidad: PPL 2,9401 / 4,0660; sin cifras de velocidad en la información |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | no disponible | Apache-2.0 | safetensors | Pesos originales sin cuantizar; revisión `ed40e7da` |

No se dispone de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo texto: no incluye proyector de visión ni soporte multimodal.
- El rendimiento decae con el contexto: cada una de las 48 pasadas del núcleo recurrente relee la caché de atención, por lo que la latencia aumenta a medida que se llena la ventana.
- El contexto por defecto es de 32K, menor que el máximo posible (49K) porque los pesos dejan menos espacio para la caché en 24 GB de VRAM.
- Requiere un fork específico de llama.cpp (`csaben/llama.cpp`, rama `inkling-3090`); no funciona con la build upstream sin las optimizaciones de segmentación y especialización.
- Dependencia de versiones concretas: glibc ≥ 2.38 y driver NVIDIA ≥ 570 para el servidor precompilado.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado cuantizado conviene conservar los avisos de atribución al modelo base y al GGUF de origen.
- La cuantización mixta preserva F32 en norms, router y biases, pero los expertos enrutados de las capas 0-19 permanecen en IQ4_NL, por lo que la pérdida de calidad respecto a los pesos originales no es nula, aunque la perplejidad medida sea indistinguible del IQ4_NL de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arelius/Inkling-2-Mini-Q6K-3090-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- GGUF de origen (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Build de 2 bits del mismo autor: https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Fork de llama.cpp: https://github.com/csaben/llama.cpp/tree/inkling-3090
- Resultados de rendimiento del fork: https://github.com/csaben/llama.cpp/blob/inkling-3090/perf/RESULTS.md
- Release del servidor precompilado: https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v2
- Artículo técnico "Looping on a 3090": https://clark.saben.org/looping-on-a-3090
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
