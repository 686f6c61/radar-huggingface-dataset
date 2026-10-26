# Daifu233/Qwen3.8-27B

## Resumen

Qwen3.8-27B es, según su model card, un modelo de lenguaje causal denso de 27,8 mil millones de parámetros con codificador de visión, presentado como la iteración compacta de la generación Qwen3.8 de Alibaba y sucesor directo de Qwen3.6-27B. Está construido sobre la base arquitectónica de Qwen3.5 y combina atención lineal (Gated DeltaNet) con atención completa en un esquema híbrido 3:1, además de entrenamiento con Multi-Token Prediction. Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

El modelo se posiciona para cargas de trabajo de código, tareas agénticas de largo horizonte, investigación y comprensión nativa de imágenes y vídeos (incluidos vídeos de hasta una hora). Incorpora control flexible del razonamiento: el modo *thinking* viene activado por defecto, puede desactivarse por petición y su profundidad se ajusta con `reasoning_effort`, conservando el contexto de razonamiento histórico mediante `preserve_thinking`.

Es relevante ahora porque, con 27,8 B densos, es desplegable en una sola GPU de consumo tras cuantización (hay versiones GGUF de la comunidad y guías para llama.cpp y Ollama), a diferencia de los modelos frontera de la misma familia. Advertencia importante de procedencia: el repositorio analizado (`Daifu233/Qwen3.8-27B`) no pertenece a la organización oficial de Qwen, registra 0 descargas y 0 *likes*, y su model card está truncada; los pesos deben tratarse como una redistribución de terceros no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con codificador de visión: 16 bloques de (3 × Gated DeltaNet → FFN) seguidos de (1 × Gated Attention → FFN) |
| Parametros totales | 27.781.427.952 (27,8 B), según safetensors |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Pesos en safetensors (repo de 55,6 GB, presumiblemente BF16); versiones GGUF de la comunidad citadas en guías de terceros (Q4, Q5, Q8); FP8/AWQ no confirmado |
| Idiomas soportados | No disponible (la model card no los detalla); vocabulario de 248.320 tokens (con *padding*) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); GGUF vía terceros |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimensión de cabeza 256; RoPE de 64 dimensiones |
| FFN (dimensión intermedia) | 17.408 |
| Cabecera de salida | 248.320 (con *padding*) |
| Prediccion multi-token | MTP entrenado con múltiples pasos |
| Modalidades | Texto, imagen y vídeo (pipeline `image-text-to-text`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido en el que la atención no se repite de forma uniforme: por cada bloque de 4 capas, tres usan Gated DeltaNet (atención lineal con estado recurrente, 48 cabezas de valor y 16 de query/key con dimensión 128) y una usa Gated Attention clásica (24 cabezas de query, 4 de key/value con dimensión 256 y RoPE de 64 dimensiones). Este esquema 3:1 reduce el coste del caché KV en contextos largos, ya que solo una de cada cuatro capas mantiene caché de atención completo. El FFN tiene dimensión intermedia de 17.408, la dimensión oculta es 5.120 y el modelo apila 64 capas. Un codificador de visión acompaña al modelo de lenguaje, lo que lo convierte en un modelo visión-lenguaje nativo. Se entrenó además con Multi-Token Prediction en varios pasos, técnica habitualmente asociada a decodificación especulativa y a un mayor throughput de generación.

El modelo ha pasado por preentrenamiento y postentrenamiento (la model card indica "Pre-training & Post-training"), pero no se especifica el número de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la estrategia de alineación del modo *thinking* ni los datos usados para el ajuste agéntico. La model card sí menciona mejoras en planificación autónoma y en el manejo de retroalimentación del entorno, así como mayor compatibilidad con *harnesses* y herramientas de desarrollo populares.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto, desactivable por petición y con profundidad ajustable mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Comprensión nativa de imagen: diagramas STEM, documentos escaneados, gráficos y capturas.
- Comprensión de vídeo, incluyendo vídeos de hasta una hora de duración según la model card.
- Programación y *agentic terminal coding*: la model card incluye la categoría Coding y el benchmark Terminal Bench 2.1 (Terminus).
- Ejecución agéntica de largo horizonte: planificación autónoma y procesamiento de retroalimentación del entorno para completar tareas multi-paso.
- Integración con *harnesses* y herramientas de desarrollo habituales, con soporte de API compatible con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no documentadas en la información disponible, aunque el vocabulario de 248.320 tokens es coherente con un tokenizador multilingüe amplio.
- Manejo de contexto largo de hasta 262.144 tokens nativos, ampliable a 1.000.000.

## Casos de uso

- Atención al cliente automatizada sobre documentación técnica: con 262.144 tokens de contexto nativo se puede inyectar un manual completo, historial de tickets y conversación multi-turno sin recuperación externa, y el modo *thinking* desactivable permite respuestas rápidas en consultas simples.
- Agente de codificación en terminal: el modelo está evaluado explícitamente en Terminal Bench 2.1 (Terminus) y declara mejor manejo de retroalimentación del entorno, por lo que encaja en bucles de tipo *leer error → editar fichero → ejecutar tests* dentro de un contenedor aislado.
- Revisión de código en CI/CD: integrado vía vLLM o SGLang con API compatible con endpoints, puede ejecutarse como paso de pipeline que analiza *diffs* y publica comentarios, con contexto suficiente para incluir el repositorio relevante.
- Análisis de documentación escaneada y diagramas: al ser un modelo visión-lenguaje nativo, puede extraer datos de facturas, planos, tablas y figuras de artículos científicos sin un pipeline OCR separado.
- Procesamiento de vídeo de larga duración: resumen y extracción de eventos en grabaciones de hasta una hora, útil en auditoría de reuniones, revisión de material docente o análisis de grabaciones de vigilancia.
- Asistente de investigación sobre corpus propio: con contexto extensible a 1.000.000 de tokens se pueden comparar varios artículos o patentes en una sola pasada, manteniendo las referencias cruzadas dentro de la ventana.
- Despliegue *on-premise* con datos sensibles: al distribuirse con licencia Apache 2.0 y pesos descargables, es apto para entornos sin conectividad donde no se permite enviar código o documentos a una API externa (con la salvedad de procedencia del repositorio, ver limitaciones).

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con las columnas Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (se observa la categoría Coding con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)"). Sin embargo, los valores numéricos no están disponibles en la información proporcionada, ya que la tabla aparece truncada. No se han publicado resultados de benchmarks completos en la información disponible.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- Pesos en BF16: 55,6 GB (tamaño real del repositorio). Requiere al menos 80 GB de VRAM para inferencia cómoda con contexto moderado: A100 80GB, H100 80GB o H200.
- Pesos en FP8 (~28 GB): viable en L40S 48GB, A100 40GB con contexto corto o H100 80GB con contexto largo. La disponibilidad de checkpoints FP8 para este repositorio no está confirmada.
- GGUF Q8 (~29-30 GB): RTX 5090 32GB, A6000 48GB o dos GPU de 24 GB.
- GGUF Q5 (~19-20 GB): RTX 4090 24GB o RTX 5090 con contexto moderado.
- GGUF Q4 (~16-17 GB): RTX 4090 24GB, RTX 4080 16GB con contexto corto. Las guías de terceros confirman que el modelo cuantizado se ejecuta en una sola GPU de consumo.
- Caché KV estimado: las 16 capas de Gated Attention con 4 cabezas KV de dimensión 256 suponen unos 64 KiB por token en BF16; 32.768 tokens ≈ 2 GiB y 262.144 tokens ≈ 16 GiB. Cálculo estimado a partir de la configuración publicada, no confirmado por el autor; las 48 capas restantes usan estado recurrente de tamaño constante.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (citados en la model card); llama.cpp y Ollama para versiones GGUF según guías de terceros.
- Latencia y throughput: no disponibles. El entrenamiento con MTP sugiere soporte de decodificación especulativa, lo que normalmente incrementa el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B (denso) | 262.144 nativo / 1.000.000 extensible | Texto, imagen, vídeo | Apache 2.0 | Pesos abiertos (repo de terceros) y API Qwen Cloud anunciada |
| Qwen3.6-27B | 27 B (según denominación; no confirmado) | No disponible | No disponible | No disponible | Predecesor directo; modelo local ampliamente usado según las guías consultadas |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible (se infiere servicio propietario) | Solo servicio (API) |
| Muse Glimmer-30B | 30 B (según denominación) | No disponible | No disponible | No disponible | Comparativa incluida en la model card |
| Opus4.6 Max | No disponible | No disponible | No disponible | Propietaria | Solo servicio |

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica el usuario `Daifu233`, no la organización oficial de Qwen/Alibaba. No hay garantía de que los pesos coincidan con el modelo original; conviene verificar hashes y contrastar con una fuente oficial antes de usarlo en producción.
- Señales de adopción nulas: 0 descargas y 0 *likes* en el momento del análisis, lo que impide validar la integridad o el comportamiento real de esta copia concreta.
- Model card truncada: la tabla de benchmarks y parte del contenido aparecen cortados; no se pueden citar cifras de rendimiento ni verificar las afirmaciones de mejora.
- Sin información sobre datos de entrenamiento, composición del corpus, filtrado de datos ni método de alineación (RLHF/DPO). No es posible evaluar sesgos de forma fundamentada.
- Riesgo de alucinación inherente a los modelos generativos, agravado en tareas de recuperación documental o visión con documentos de baja calidad; no hay evaluación publicada de fidelidad.
- Cobertura de idiomas no documentada: no se especifica el rendimiento en castellano ni en lenguas distintas del inglés o el chino.
- El modo *thinking* está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- Contexto largo: los 1.000.000 de tokens son una extensión, no una ventana nativa; el rendimiento en la parte alta de la ventana no está documentado y suele degradarse.
- Consumo de memoria: 55,6 GB en BF16 impiden el despliegue en GPU de consumo sin cuantizar; las versiones GGUF de terceros pueden degradar la calidad y no están validadas por el autor del modelo.
- Licencia Apache 2.0 permite uso comercial y modificación, pero esa licencia cubre el artefacto publicado, no acredita la legitimidad de la redistribución por parte del uploader.
- La disponibilidad de la API Qwen Cloud con 1M de contexto está anunciada como "coming soon", no operativa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Daifu233/Qwen3.8-27B
- Página del modelo en Qwen Cloud (referenciada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud: https://www.qwencloud.com
- Guía completa (visión, tool use): https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
- Tutorial de despliegue GGUF con llama.cpp y Ollama: https://aiindigo.com/tutorials/getting-started-with-qwen3-8-27b-gguf-run-a-27b-model-locally
- Análisis del modelo denso multimodal: https://miraflow.ai/blog/qwen3-8-27b-open-weight-dense-model-local-2026
- Guía de despliegue local, visión, código y agentes: https://essamamdani.com/blog/qwen38-27b-local-deployment-guide-2026
- Guía de despliegue offline para agentes de código: https://www.algoramming.com/blogs/deploying-qwen-3-8-27b-locally-offline-ai-coding
