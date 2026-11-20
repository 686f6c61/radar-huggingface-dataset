# ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de lenguaje y visión desarrollado por el equipo Qwen (Alibaba). Se presenta como la primera publicación de pesos abiertos bajo la arquitectura que servirá de base para Qwen4, y su objetivo es demostrar que se puede escalar de forma eficiente combinando atención híbrida, mezcla de expertos (MoE) y embeddings de n-gramas. El checkpoint aquí descrito es una cuantización a 4 bits del modelo base, publicada por el usuario ArthurZ con el objetivo declarado de ejecutarse en hardware Apple (Metal) mediante el formato `qwen4_exp` de Transformers.

El modelo combina un transformer causal con un codificador de visión, con un total de 125.000 millones de parámetros de los que solo se activan 6.000 millones por token, más 51.000 millones de parámetros en embeddings de n-gramas y 4.000 millones en un módulo MTP (multi-token prediction). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. La innovación principal es Qwen Sparse Attention (QSA), que opera a nivel de micro-bloque en lugar de token individual, reduciendo la latencia en contextos largos, un aspecto crítico para cargas de trabajo agénticas.

Es relevante ahora porque anticipa las decisiones arquitectónicas de la próxima generación de Qwen y porque demuestra que técnicas como los embeddings de n-gramas permiten escalar parámetros con menos cómputo, algo especialmente útil en aceleradores con memoria limitada. No obstante, se trata de una vista previa experimental, no de un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Qwen Sparse Attention) con MoE, Gated Residual, N-gram Embedding y codificador de visión |
| Parametros totales | 125B (6B activos) + 51B en n-gram embedding + 4B en MTP; el checkpoint safetensors reporta 75.955.027.859 |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | 4 bits (este checkpoint); el modelo base se publica también en FP8 con bloques de 128 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (librería transformers, formato `qwen4_exp`) |

## Arquitectura y entrenamiento

La arquitectura se organiza en 48 capas con una disposición de 12 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)`. La dimensión oculta es 2560 y el embedding de tokens tiene 248.320 entradas (con padding). Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de dimensión 64 y un indexador MQA con 4 cabezas de consulta y 1 cabeza de clave compartida; el presupuesto de atención es de 512 bloques o 2.048 tokens. El MoE cuenta con 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de experto 640.

Las innovaciones destacadas son el Gated Residual (4 ramas, rango de cuello de botella 320), que modula el flujo de información mediante una compuerta de lectura dependiente de datos y una compuerta de escritura escalar por rama; el N-gram Embedding, que indexa bigramas y trigramas en la capa 2 con 20.000.000 de entradas para escalar parámetros con menos cómputo y facilitar el offloading; y una receta de entrenamiento que combina los optimizadores Muon y AdamW según categorías de pesos, elimina el warmup de batch size y arranca directamente en el tamaño objetivo. El modelo se sometió a preentrenamiento y postentrenamiento; no se detalla en la información disponible el volumen de tokens, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento causal en contextos largos, con ventana nativa de 262.144 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante codificador de visión.
- Mezcla de expertos con 6B parámetros activos, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño total.
- Predicción multi-token (MTP) de una capa, entrenada con múltiples pasos, orientada a decodificación especulativa.
- Atención dispersa a nivel de micro-bloque (QSA) para cargas agénticas con contexto extenso.
- Soporte de tool calling y function calling: la información disponible no lo detalla explícitamente para este checkpoint, aunque la versión oficial Qwen3.8-Flash incluye herramientas integradas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed para los artefactos FP8 del modelo base.

## Casos de uso

- Agentes autónomos de múltiples pasos: la combinación de contexto de 262.144 tokens y QSA reduce la latencia en conversaciones largas con muchas llamadas a herramientas, lo que lo hace adecuado para orquestadores de agentes que mantienen historial extenso.
- Análisis de documentos extensos con imágenes: al ser `image-text-to-text`, puede procesar informes con gráficos, tablas escaneadas y texto en una sola pasada, útil en auditoría financiera o revisión legal.
- Asistencia en investigación científica: la ventana de contexto permite cargar varios artículos completos y razonar sobre ellos, con la posibilidad de extender el contexto hasta 1.000.000 de tokens.
- Generación de código con contexto de repositorio: los 6B parámetros activos y el contexto largo permiten indexar múltiples archivos y mantener coherencia entre módulos en tareas de refactorización.
- Despliegue en hardware Apple: este checkpoint de 4 bits está pensado para ejecutarse en Metal, lo que habilita prototipado local en Mac con memoria unificada sin GPU dedicada.
- Evaluación de arquitecturas experimentales: investigadores que quieran medir el impacto de QSA, Gated Residual o N-gram Embedding frente a transformers convencionales pueden usar este checkpoint como referencia reproducible.
- Atención al cliente con historial largo: conversaciones multi-turno con contexto de cientos de miles de tokens permiten mantener el estado de la sesión sin resumen intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base incluye una tabla de resultados, pero el contenido proporcionado se interrumpe antes de mostrar los valores numéricos, por lo que no se reproducen datos que no puedan verificarse.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 131,6 GB en 4 bits, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM; el modelo base en FP8 requiere aproximadamente el doble.
- GPU recomendadas: para el checkpoint de 4 bits, hardware Apple con memoria unificada de 128 GB o superior (M3/M4 Max o Ultra); para el modelo base FP8, H100 80 GB en configuraciones multi-GPU o A100 80 GB.
- Cabe en GPU de consumo: no de forma completa; un modelo de 125B con 6B activos no cabe en una RTX 4090 de 24 GB ni en una RTX 5090 de 32 GB sin offloading agresivo o ejecución distribuida.
- Opciones de despliegue: Transformers (formato `qwen4_exp`), vLLM, SGLang y TokenSpeed para los artefactos FP8; llama.cpp y Ollama no están confirmados para este formato experimental.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (este) | 125B + 51B n-gram + 4B MTP | 6B | 262.144 (hasta 1M) | qwen-community-1.0 | Híbrido Gated DeltaNet + QSA, visión, experimental |
| Qwen3.8-Flash (oficial) | no disponible | no disponible | 1M por defecto | qwen-community-1.0 | Versión de producción con herramientas integradas y API gestionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como vista previa de la arquitectura de Qwen4, no como un modelo listo para producción.
- El checkpoint es una cuantización a 4 bits realizada por un tercero (ArthurZ), no por el equipo Qwen; puede degradar la calidad respecto al FP8 oficial.
- El número de parámetros reportado en safetensors (75.955.027.859) no coincide con los 125B declarados en la model card, probablemente por el tratamiento de los embeddings de n-gramas y el MTP; conviene verificar la integridad del checkpoint antes de usarlo.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento multilingüe equilibrado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Licencia qwen-community-1.0: es necesario revisar los términos antes de uso comercial, ya que puede imponer restricciones de atribución o de despliegue.
- El formato `qwen4_exp` es específico de Transformers y puede no ser compatible con todas las herramientas del ecosistema.
- Sin datos de benchmarks verificables ni de sesgos conocidos en la información proporcionada.

## Enlaces

- [Hugging Face: ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit](https://huggingface.co/ArthurZ/Qwen3.8-Flash-Next-metal-experts-4bit)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Blog de Qwen3.8-Flash-Next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [Informe técnico](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf)
- [Repositorio GitHub Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next)
- [Qwen Cloud: Qwen3.8-Flash](https://www.qwencloud.com/models/qwen3.8-flash)
