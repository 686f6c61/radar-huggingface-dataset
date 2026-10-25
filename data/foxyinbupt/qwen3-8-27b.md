# foxyinbupt/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, de tipo denso y aproximadamente 27.800 millones de parámetros, publicado en HuggingFace bajo el identificador `foxyinbupt/Qwen3.8-27B`. Según su model card, se presenta como la generación más reciente de la familia abierta Qwen, construida sobre la base arquitectónica de Qwen3.5 y orientada a código, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en un esquema híbrido 3:1, e incorpora comprensión nativa de imágenes y vídeo.

El problema que aborda es el de un modelo compacto y desplegable que mantenga capacidades agénticas y multimodales sin el coste de inferencia de variantes mucho mayores: 27B de parámetros en precisión BF16 ocupan unos 55,6 GB, lo que permite servirlo en una GPU de 80 GB o, cuantizado, en hardware de consumo. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, y el control de razonamiento es configurable por petición (`reasoning_effort`, `preserve_thinking`).

Es relevante ahora porque su tarjeta declara mejoras en ejecución agéntica autónoma y compatibilidad con arneses de desarrollo habituales, además de soporte declarado para vLLM, SGLang y TokenSpeed. Conviene señalar, no obstante, que el repositorio está alojado en la cuenta de un usuario particular (`foxyinbupt`), no en la organización oficial de Qwen, y que en el momento de la consulta registra 0 descargas y 0 likes: la procedencia de los pesos debe verificarse antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: 16 bloques de 3 × (Gated DeltaNet → FFN) + 1 × (Gated Attention → FFN); 64 capas en total |
| Parámetros totales | 27.781.427.952 (≈27,8B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | No disponible (no se detallan variantes cuantizadas en la información proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`; tag de arquitectura `qwen3_5`) |

Datos adicionales de la configulación declarada: dimensión oculta 5120; 64 capas; FFN con dimensión intermedia 17.408; embeddings de entrada y salida de 248.320 tokens (con padding); Gated DeltaNet con 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas de consulta y 4 de clave/valor (GQA 6:1), dimensión de cabeza 256 y dimensión de RoPE 64. Tamaño del repositorio: 55,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala capas de atención lineal y capas de atención completa en una proporción 3:1: cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una de Gated Attention, repetido 16 veces hasta sumar 64 capas. Las capas de atención lineal mantienen un estado recurrente de tamaño constante, mientras que las 16 capas de atención completa conservan caché KV clásica, lo que reduce el coste de memoria a contexto largo respecto a un transformer íntegramente con atención cuadrática. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con varios pasos, lo que habilita decodificación especulativa para acelerar la generación.

El modelo se distribuye en dos etapas, preentrenamiento y postentrenamiento, según la model card, y es multimodal nativo: un codificador de visión se acopla al decoder para el procesamiento conjunto de imagen, vídeo y texto. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni los métodos concretos de alineación (RLHF, DPO u otros), por lo que esos datos deben considerarse no disponibles. Sí se documenta explícitamente el control flexible del razonamiento: modo *thinking* activado por defecto, desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes previos mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* configurable (activado por defecto, desactivable por petición y ajustable en profundidad).
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas técnicos, documentos y vídeos de hasta una hora de duración según la model card.
- Generación y edición de código, con soporte explícito para *agentic terminal coding* (benchmark Terminal Bench 2.1 / Terminus citado en la tarjeta).
- Ejecución agéntica autónoma: planificación, manejo de retroalimentación del entorno y finalización de tareas de extremo a extremo.
- Compatibilidad con arneses y herramientas de desarrollo populares, según se declara en las mejoras de la versión.
- Soporte de tool calling / function calling: la tarjeta menciona herramientas integradas en el servicio alojado y compatibilidad con *harnesses*, aunque no se detalla el esquema exacto en la información disponible.
- Decodificación especulativa mediante las cabezas MTP entrenadas con múltiples pasos.
- Capacidades multilingües: no disponible (la model card no enumera idiomas).

## Casos de uso

- Agentes de codificación en terminal: el modelo puede operar sobre un entorno de línea de comandos, interpretar la salida de comandos y de tests, y corregir iterativamente sus propias ediciones. La tarjeta cita explícitamente Terminal Bench 2.1 (Terminus) como benchmark de referencia para esta capacidad.
- Automatización de pipelines CI/CD: con tool calling, el modelo puede leer trazas de fallo, proponer parches, ejecutar la suite de pruebas y decidir si el cambio es apto para fusión, manteniendo contexto de razonamiento entre pasos gracias a `preserve_thinking`.
- Análisis de documentación técnica y diagramas: al ser un modelo visión-lenguaje nativo, permite extraer datos de esquemas de ingeniería, tablas escaneadas y figuras de artículos científicos y convertirlos en texto estructurado o código reproducible.
- Revisión de vídeos largos: la ventana de 262.144 tokens y el soporte de vídeo de hasta una hora permiten resumir sesiones, extraer decisiones y generar actas con marcas temporales en un solo paso de inferencia.
- Asistencia a investigación: lectura de múltiples artículos, contraste de metodologías y generación de borradores de secciones relacionadas, apoyándose en contexto largo para mantener coherencia entre fuentes.
- Atención al cliente técnica multi-turno: conversaciones extensas con historial completo dentro de la ventana de contexto, con razonamiento desactivable para respuestas de baja latencia en consultas simples.
- Extracción de datos estructurados a escala: procesamiento por lotes de facturas, informes o formularios con imagen asociada, devolviendo JSON validado mediante function calling.
- Migración y modernización de código legacy: análisis de repositorios parciales dentro del contexto disponible y generación de parches con justificación paso a paso.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento con secciones de *Coding* (entre ellas Terminal Bench 2.1 / Terminus), y cita como modelos de comparación a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, los valores numéricos de esa tabla no están disponibles en la información proporcionada (el extracto se interrumpe antes de las celdas de resultados), por lo que no se reproducen cifras.

No se han publicado resultados de benchmarks verificables en la información disponible.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Resto de métricas de la tarjeta | No disponible | No disponible | No disponible | No disponible | No disponible |

## Requisitos de hardware

- Pesos en BF16: 27,78B parámetros × 2 bytes ≈ 55,6 GB, cifra que coincide con el tamaño del repositorio. Requiere una GPU de 80 GB (H100, A100 80GB, H200) para servirse con contexto corto, o dos GPU de 48 GB en tensor parallel.
- Pesos en FP8: ≈27,8 GB, más caché KV y activaciones; cabe en una H100 80GB con margen amplio y en una L40S 48GB con contexto moderado.
- Cuantización de 4 bits: ≈14-16 GB de pesos; viable en RTX 4090 (24 GB) con contexto reducido, y con más holgura en RTX 5090/A6000 (32-48 GB). El codificador de visión añade consumo adicional no cuantificado en la información disponible.
- Caché KV estimada: solo las 16 capas de atención completa almacenan KV, con 4 cabezas KV de dimensión 256, es decir 2.048 elementos por token y capa, 32.768 elementos por token en total. En BF16 son 64 KiB por token, lo que equivale a ≈16 GiB por secuencia a los 262.144 tokens nativos. Las 48 capas de Gated DeltaNet mantienen estado recurrente de tamaño constante.
- Memoria para multimodalidad: las entradas de vídeo de hasta una hora generan muchos tokens visuales; conviene presupuestar VRAM adicional y, si se necesita el contexto completo, recurrir a paralelismo tensorial.
- Opciones de despliegue documentadas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp, Ollama ni TGI en la información proporcionada.
- Aceleración: las cabezas MTP permiten decodificación especulativa, con ganancias de throughput no cuantificadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los comparadores que aparecen en la model card son los siguientes. Los datos de parámetros, contexto y licencia de esos modelos no están disponibles en la información proporcionada, por lo que se marcan como tales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| Qwen3.8-27B (`foxyinbupt`) | 27,78B densos | 262.144 nativos / 1M extensible | Apache 2.0 | HuggingFace, pesos safetensors | No disponibles |
| Qwen3.6-27B | No disponible (la denominación sugiere ~27B) | No disponible | No disponible | No disponible | No disponibles |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible (posible servicio propietario) | No disponibles |
| Muse Glimmer-30B | No disponible (la denominación sugiere ~30B) | No disponible | No disponible | No disponible | No disponibles |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible (presumiblemente propietario) | No disponibles |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio está alojado en la cuenta de un usuario particular (`foxyinbupt`), no en la organización oficial de Qwen. Registra 0 descargas y 0 likes, y la fecha de creación indicada es 2026-10-25. Antes de usar los pesos en producción conviene contrastar hashes y origen con el repositorio oficial.
- La model card menciona un servicio alojado en Qwen Cloud "coming soon" con contexto de 1M por defecto y herramientas integradas; se trata de una declaración del autor, no de una disponibilidad confirmada.
- Resultados de benchmark no reproducibles con la información disponible: la tabla comparativa está truncada y no permite validar las afirmaciones de mejora frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B u Opus4.6 Max.
- Idiomas soportados no documentados: no puede garantizarse calidad en castellano ni en otras lenguas distintas del inglés sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en modo *thinking* activado y en tareas de investigación o extracción de datos; se recomienda validación posterior y uso de esquemas estrictos en tool calling.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información proporcionada.
- Coste de memoria a contexto completo: ≈16 GiB de caché KV por secuencia a 262.144 tokens en BF16, lo que limita el número de secuencias concurrentes por GPU.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el titular de los derechos y la cadena de custodia de los pesos no están claros al tratarse de un repositorio de terceros.
- No se documentan limitaciones específicas de la ventana de contexto extendida a 1M tokens (por ejemplo, degradación de recuperación más allá del contexto nativo).
- El tag de arquitectura en Transformers es `qwen3_5`, no `qwen3_8`; es necesario verificar la compatibilidad real con la versión de `transformers` instalada antes de cargar el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/foxyinbupt/Qwen3.8-27B
- Qwen Cloud (servicio mencionado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud (mencionada, disponibles próximamente): https://www.qwencloud.com/models/qwen3.8-27b
- Paper técnico: no disponible
- Blog oficial de la familia Qwen: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
