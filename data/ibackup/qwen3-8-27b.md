# Ibackup/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.781.427.952 parámetros (27,8 mil millones) con encoder de visión, desarrollado por el equipo Qwen de Alibaba. Esta ficha describe el repositorio `Ibackup/Qwen3.8-27B`, una copia de los pesos publicada por un tercero en formato Hugging Face Transformers (safetensors, 55,6 GB, licencia Apache 2.0). El modelo subyacente es la variante compacta de la generación Qwen3.8, construida sobre la base arquitectónica de Qwen3.5 y sucesora directa de Qwen3.6-27B.

Resuelve el problema de disponer de un modelo multimodal (texto, imagen y vídeo) con capacidad de razonamiento controlable y ejecución de tareas agénticas de largo alcance en un tamaño desplegable en infraestructura propia: 64 capas con una disposición híbrida de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), 262.144 tokens de contexto nativo ampliables a 1.000.000, y modo de pensamiento activado por defecto que puede desactivarse por petición.

Es relevante ahora porque, según las fuentes consultadas, se publicó el 14 de agosto de 2026 y acumuló más de tres millones de descargas en su primer fin de semana, lo que lo sitúa como una de las referencias abiertas para codificación local y flujos agénticos. Este repositorio concreto, sin embargo, no es el oficial: registra 0 descargas y 0 valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: 64 capas en 16 bloques de 4 (3 × Gated DeltaNet + FFN, 1 × Gated Attention + FFN) |
| Parámetros totales | 27.781.427.952 (27,8 mil millones, dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.000.000 (1M por defecto en la versión alojada en Qwen Cloud) |
| Tipos de cuantización | no disponible en la información (los pesos publicados están en BF16, 55,6 GB); no se confirman GGUF, AWQ ni FP8 en el repositorio |
| Idiomas soportados | no disponible (el autor no los declara; el vocabulario de 248.320 tokens es compatible con cobertura multilingüe amplia, sin cifras publicadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Hugging Face Transformers) |
| Dimensión oculta | 5.120 |
| Capas | 64 (16 bloques de 4 capas) |
| Gated DeltaNet | 48 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 24 cabezas de consulta, 4 de clave/valor; dimensión de cabeza 256; RoPE de 64 dimensiones |
| FFN | dimensión intermedia 17.408 |
| Vocabulario | 248.320 tokens (con padding), compartido en entrada y salida |
| Predicción multi-token | MTP entrenado con varios pasos |
| Modalidades de entrada | texto, imagen y vídeo |
| Pipeline declarado | image-text-to-text |
| Compatibilidad de inferencia | Transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con encoder de visión y una disposición de capas híbrida poco habitual en modelos de este tamaño. De las 64 capas, 48 emplean Gated DeltaNet, un mecanismo de atención lineal con estado recurrente (48 cabezas para V, 16 para QK, dimensión 128), y 16 emplean Gated Attention clásica con 24 cabezas de consulta y 4 de clave/valor de dimensión 256 con RoPE de 64 dimensiones. La proporción 3:1 entre atención lineal y atención completa es la misma familia de diseño introducida en la serie Qwen3-Next y busca reducir el coste del contexto largo manteniendo la calidad de recuperación. El bloque FFN tiene dimensión intermedia de 17.408 y el vocabulario de 248.320 tokens está compartido entre entrada y salida.

El modelo se distribuye en dos etapas declaradas, preentrenamiento y postentrenamiento, con cabezas MTP (multi-token prediction) entrenadas en varios pasos, un mecanismo que habitualmente se aprovecha para acelerar la decodificación mediante especulación. Incluye control flexible del razonamiento: el modo de pensamiento está activado por defecto, puede desactivarse por petición, su profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes anteriores se conserva mediante `preserve_thinking`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento posteriores.

## Capacidades

- Generación de texto y razonamiento multi-paso, con profundidad de razonamiento ajustable por petición.
- Codificación: la model card destaca mejoras en codificación agéntica, incluido Terminal Bench 2.1 (Terminus).
- Trabajo profesional y de investigación: documentos, diagramas STEM y tareas de análisis prolongado.
- Comprensión nativa de imágenes y vídeo, incluidos vídeos de duración de horas según el autor.
- Ejecución agéntica: planificación autónoma y gestión de retroalimentación del entorno para completar tareas de extremo a extremo.
- Control de pensamiento por petición (`reasoning_effort`, `preserve_thinking`, desactivación del modo thinking).
- Compatibilidad con arneses y herramientas de desarrollo populares, según la model card.
- Integración con pilas de inferencia de alto rendimiento: vLLM, SGLang, TokenSpeed y Transformers.
- Soporte de herramientas y function calling: no se detalla explícitamente en la información disponible, aunque la model card menciona herramientas integradas en la versión alojada y compatibilidad con arneses de agentes.

## Casos de uso

- Codificación agéntica en terminal: con 262.144 tokens de contexto puede cargar un repositorio completo y ejecutar ciclos de planificación, edición y verificación de comandos; la model card lo evalúa específicamente en Terminal Bench 2.1 (Terminus), lo que indica optimización para este escenario.
- Integración en pipelines de CI/CD como revisor automático: al ser compatible con vLLM y SGLang, puede servirse detrás de un endpoint compatible con la API de OpenAI y consumirse desde acciones de revisión de código con contexto de varios ficheros.
- Análisis de documentación técnica y diagramas: el encoder de visión permite extraer información de esquemas de ingeniería, tablas y figuras, un caso que la model card cita explícitamente (diagramas STEM y documentos).
- Supervisión de vídeo de larga duración: el modelo declara comprensión de vídeos de horas, útil para auditar procesos industriales, resumir grabaciones de incidencias o generar actas a partir de material audiovisual.
- Asistente de investigación: síntesis de literatura con contexto de 262K tokens para ingerir varios artículos y ajuste fino del esfuerzo de razonamiento según la fase (exploración con `reasoning_effort` bajo, verificación con esfuerzo alto).
- Automatización de soporte técnico con historial extenso: la ventana nativa permite mantener conversaciones multi-turno con todo el histórico de tickets y documentación asociada sin resumir, reduciendo la pérdida de información.
- Despliegue en hardware de consumo: al ser denso de 27,8B, una cuantización de 4 bits lo sitúa en el entorno de los 15-16 GB, lo que permite ejecución local en GPUs de 24 GB para prototipado y uso personal.
- Generación de informes profesionales con control de coste: desactivar el modo thinking por petición para tareas de redacción simples reduce tokens de salida y latencia frente a tareas que requieren razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible: la tabla de la model card aparece truncada y solo conserva las cabeceras (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max) y la categoría "Coding" con la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)", sin valores numéricos.

El único dato cuantitativo recuperado procede de una fuente externa:

| Métrica | Valor | Fuente |
|---|---|---|
| ECI (Epoch Capabilities Index) | 149 | Epoch AI |
| Posición en el ranking en el momento de la consulta | 52 de 251 modelos | Epoch AI |
| Posición en el momento del lanzamiento | 45 de 244 modelos | Epoch AI |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la información proporcionada, por lo que no se incluyen comparaciones numéricas con modelos similares.

## Requisitos de hardware

- Pesos en BF16: 55,6 GB. Con overhead de activaciones y caché KV, requiere una GPU de 80 GB (H100, A100 80GB) o reparto en dos GPUs de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada).
- FP8 (si se generan pesos en ese formato): en torno a 28 GB, viable en A100 40GB, L40S y RTX 6000 Ada 48GB.
- Cuantización de 4 bits: estimación de 15-16 GB, ejecutable en RTX 4090, RTX 3090 o RTX 5090 (24-32 GB). En GPUs de 16 GB solo cabrían cuantizaciones más agresivas, con pérdida de calidad y contexto útil reducido.
- Caché KV: gracias al diseño híbrido, solo 16 de las 64 capas mantienen caché de atención completa. Estimación a partir de la configuración publicada: 4 cabezas KV × 256 dimensiones × 2 (K y V) × 16 capas × 2 bytes ≈ 64 KiB por token, es decir, unos 2 GiB para 32.768 tokens y unos 16 GiB para los 262.144 tokens nativos, sin contar overhead de la implementación. Las capas Gated DeltaNet mantienen estado recurrente de tamaño constante.
- Encoder de visión: añade consumo adicional no cuantificado en la información disponible, proporcional a la resolución y al número de fotogramas de vídeo procesados.
- Opciones de despliegue confirmadas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp, Ollama, TGI ni motores basados en GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible. El uso de cabezas MTP entrenadas en varios pasos sugiere margen para decodificación especulativa, pero no hay cifras publicadas en la información consultada.
- Alternativa gestionada: Qwen Cloud ofrece una versión alojada con 1M de contexto por defecto y herramientas integradas, anunciada como próximamente según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B (denso) | 262.144, ampliable a 1M | Texto, imagen, vídeo | Apache 2.0 | Pesos abiertos en este repositorio (copia de terceros) |
| Qwen3.6-27B | 27B (denso, según nomenclatura) | no disponible | no disponible en la información | no disponible | Predecesor directo; citado como uno de los modelos locales de código más usados |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible (modelo de API) | Servicio propietario; aparece como referencia en la tabla de la model card |
| Muse Glimmer-30B | 30B (según nomenclatura) | no disponible | no disponible | no disponible | Citado como referencia en la tabla de la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible (propietario) | Citado como referencia en la tabla de la model card |

La comparación numérica de rendimiento entre estos modelos no está disponible: la tabla de la model card solo conserva las cabeceras y los nombres de las pruebas.

## Limitaciones y advertencias

- Repositorio no oficial: el autor es `Ibackup`, con 0 descargas y 0 valoraciones. No hay verificación de que los pesos coincidan con la publicación oficial de Qwen; para uso en producción conviene contrastar con el repositorio canónico del equipo Qwen.
- Ausencia de benchmarks verificables: la tabla de resultados de la model card está truncada, de modo que las afirmaciones de mejora en codificación, investigación y tareas agénticas no pueden comprobarse con los datos disponibles.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación publicada en castellano; el rendimiento en español no está verificado y debe medirse antes de desplegar en producción.
- Riesgo de alucinación: no se documenta ninguna mitigación específica ni tasas de error en generación; en tareas de recuperación con contexto muy largo el riesgo de citas o datos inventados se mantiene.
- Coste del modo thinking: activado por defecto, incrementa el número de tokens generados y la latencia. En producción conviene desactivarlo o limitar `reasoning_effort` según la tarea.
- Contexto largo y memoria: aunque el diseño híbrido reduce la caché KV, 262.144 tokens siguen exigiendo del orden de 16 GiB adicionales en BF16 solo para la atención completa, lo que puede impedir alcanzar el contexto máximo en GPUs de 24 GB.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero obliga a conservar el aviso de copyright y la licencia, y no incluye garantías ni cláusulas de indemnización por patentes.
- Sesgos: no se publica información sobre evaluación de sesgos, toxicidad o alineamiento de seguridad.
- Soporte de cuantización incierto: no se confirman pesos GGUF, AWQ o GPTQ oficiales, por lo que el despliegue en hardware de consumo depende de conversiones de terceros cuya calidad no está validada.
- Fecha de referencia del repositorio: creado el 24 de octubre de 2026; comprobar si existen revisiones posteriores de pesos o correcciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ibackup/Qwen3.8-27B
- Página del modelo en Qwen Cloud (según la model card): https://www.qwencloud.com/models/qwen3.8-27b
- Servicio Qwen Cloud: https://www.qwencloud.com
- Ficha en AI Model Radar: https://aimodelradar.app/models/qwen3-8-27b
- Ficha en Epoch AI (puntuación ECI): https://epoch.ai/models/qwen-3-8-27b
- Guía completa en AI Made Tools: https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
- Cobertura de Cybernews sobre el lanzamiento: https://cybernews.com/tech/qwen-38-27b-ai-model-debuts-with-million-downloads/
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
