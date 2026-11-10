# Qwen/Qwen3.5-27B

## Resumen

Qwen3.5-27B es un modelo fundacional multimodal de tipo image-text-to-text desarrollado por el equipo Qwen (Alibaba). Forma parte de la familia Qwen3.5, que según su model card integra avances en aprendizaje multimodal, eficiencia arquitectónica y generalización mediante aprendizaje por refuerzo. El modelo combina un encoder de visión con un modelo de lenguaje causal de 27 000 millones de parámetros (27.781.427.952 según los pesos en safetensors), lo que lo sitúa en la gama media de la familia junto a variantes mayores como Qwen3.5-122B-A10B y variantes MoE más ligeras como Qwen3.5-35B-A3B.

La arquitectura es híbrida: combina capas de atención lineal basadas en Gated DeltaNet con capas de atención con compuertas (Gated Attention), organizadas en un patrón repetido de 16 bloques. Esto busca reducir el coste computacional en contextos largos manteniendo la calidad de atención completa en puntos clave. El modelo soporta de forma nativa 262 144 tokens de contexto, extensible hasta 1 010 000, y está entrenado con multi-token prediction (MTP).

Su relevancia actual radica en tres factores: licencia Apache 2.0 (permisiva para uso comercial), paridad declarada con Qwen3 en tareas de razonamiento y código superando a los modelos Qwen3-VL en comprensión visual, y soporte declarado de 201 idiomas y dialectos. La compatibilidad con Transformers, vLLM, SGLang y KTransformers facilita su despliegue en infraestructura existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet (atención lineal) + Gated Attention; 64 capas |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (no se declara como MoE en la información disponible) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones oficiales; el repo contiene safetensors) |
| Idiomas soportados | 201 idiomas y dialectos (según model card); lista detallada no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

El modelo sigue una topología híbrida poco habitual. El layout oculto se define como 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), es decir, por cada bloque de cuatro subcapas hay tres capas de atención lineal Gated DeltaNet seguidas de una capa de atención con compuertas. La dimensión oculta es 5120, con 64 capas, FFN de dimensión intermedia 17 408 y embeddings de 248 320 entradas (con padding). Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El modelo está entrenado con multi-token prediction (MTP) en varios pasos.

El entrenamiento se divide en pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales (early fusion), lo que según el autor permite alcanzar paridad con Qwen3 en texto y superar a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El post-entrenamiento incluye aprendizaje por refuerzo escalado sobre entornos multiagente con distribuciones de tareas progresivamente complejas, y la infraestructura de entrenamiento declara cerca del 100 % de eficiencia multimodal respecto a entrenamiento solo de texto. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas image-text-to-text, con paridad declarada frente a Qwen3 en razonamiento, código y agentes.
- Comprensión visual: supera según el autor a los modelos Qwen3-VL en benchmarks de comprensión visual.
- Razonamiento y matemáticas: incluido en los benchmarks de la model card (MMLU-Pro, MMLU-Redux).
- Generación de código: evaluado junto a razonamiento y agentes en la comparativa de la model card.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Capacidades de agente y razonamiento multi-paso: el entrenamiento por RL se realizó sobre entornos multiagente, lo que sugiere soporte para flujos agénticos.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Multi-token prediction (MTP): entrenado con varios pasos, lo que puede habilitar decodificación especulativa.
- Contexto largo: 262 144 tokens nativos, extensible a 1 010 000.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: gracias a los 262 144 tokens de contexto nativo, el modelo puede procesar informes, contratos o manuales con figuras y tablas en una sola pasada, sin necesidad de chunking agresivo.
- Asistentes de atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales extensos y adjuntar capturas o imágenes del usuario para diagnóstico visual.
- Generación y revisión de código en pipelines: su evaluación en benchmarks de código y su compatibilidad con vLLM/SGLang permiten integrarlo en CI/CD para revisión automática de PRs y generación de tests.
- Automatización de agentes multi-paso: el entrenamiento con RL sobre entornos multiagente lo hace adecuado para orquestación de tareas con herramientas, aunque el soporte explícito de function calling no está confirmado.
- Procesamiento de documentación técnica multilingüe: con 201 idiomas declarados, sirve para traducción, resumen y extracción de información en corpus internacionales.
- Descripción y extracción de información de imágenes en producción: catálogos de producto, imágenes médicas no diagnósticas o capturas de pantalla para soporte técnico.
- Análisis de repositorios y logs largos: la extensión de contexto hasta 1 010 000 tokens permite ingerir bases de código o trazas completas para diagnóstico.

## Benchmarks y rendimiento

Resultados de benchmarks de lenguaje publicados en la model card (parciales; la tabla original está truncada en la información disponible):

| Benchmark | GPT-5-mini 2025-08-07 | GPT-OSS-120B | Qwen3-235B-A22B | Qwen3.5-122B-A10B | Qwen3.5-27B | Qwen3.5-35B-A3B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.7 | 80.8 | 84.4 | 86.7 | 86.1 | 85.3 |
| MMLU-Redux | 93.7 | 91.0 | 93.8 | 94.0 | 93.2 | no disponible (tabla truncada) |

No se han publicado en la información disponible resultados completos de HumanEval, GSM8K ni benchmarks de visión. La model card referencia una figura con resultados adicionales en el blog oficial, no incluida en el texto extraído.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de 55,6 GB en el repo (probablemente en BF16), se requiere aproximadamente 56 GB de VRAM solo para pesos en precisión completa; en FP8 o cuantizaciones de 8 bits bajaría a ~28 GB, y en 4 bits a ~14-16 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: para BF16, una A100 80 GB o H100 80 GB; para FP8, una H100 o L40S; para cuantización 4-bit, una RTX 4090 (24 GB) podría alojar los pesos, aunque el contexto largo y el encoder de visión incrementan el uso de memoria KV.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización 4-bit y contexto reducido; no confirmado oficialmente.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según model card); compatibilidad declarada con endpoints (tags endpoints_compatible, deploy:sagemaker, deploy:azure).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B | 27B | 262.144 (ext. 1.010.000) | 86.1 | Apache 2.0 | Hugging Face, vLLM, SGLang, KTransformers |
| Qwen3.5-35B-A3B | 35B totales (MoE, 3B activos) | no disponible | 85.3 | Apache 2.0 (según familia) | Hugging Face |
| Qwen3-235B-A22B | 235B totales (MoE, 22B activos) | no disponible | 84.4 | Apache 2.0 (según familia) | Hugging Face |
| GPT-OSS-120B | 120B | no disponible | 80.8 | no disponible | no disponible |
| GPT-5-mini 2025-08-07 | no disponible | no disponible | 83.7 | propietaria | API |

Qwen3.5-27B ofrece el mejor MMLU-Pro de la comparativa publicada (86.1), superando a modelos de mayor tamaño como Qwen3-235B-A22B y GPT-OSS-120B, y quedando solo por debajo de Qwen3.5-122B-A10B (86.7). Su ventaja competitiva es la combinación de tamaño contenido, contexto muy largo y licencia Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos web a gran escala, es probable que herede sesgos de esos corpus, pero no hay evaluación publicada al respecto.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican las precauciones habituales en producción.
- Limitaciones de contexto o idioma: aunque se declaran 201 idiomas, no se especifica la calidad por idioma; el rendimiento en idiomas de bajos recursos puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repo por si incluye cláusulas adicionales.
- Caveats para producción: el soporte explícito de tool calling no está confirmado en la model card; el rendimiento real con contexto de 1 010 000 tokens (extensión) puede degradarse frente al contexto nativo; la cuantización oficial no está documentada, por lo que las estimaciones de VRAM son orientativas.
- La información de benchmarks está truncada en la fuente; no se dispone de resultados completos de visión, código ni matemáticas.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai/
- Qwen (portal): https://qwen.ai/home
- Qwen Cloud: https://www.qwencloud.com/
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Wikipedia (Qwen): https://en.wikipedia.org/wiki/Qwen
