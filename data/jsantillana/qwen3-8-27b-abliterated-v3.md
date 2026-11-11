# jsantillana/Qwen3.8-27B-abliterated-v3

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso desarrollado por el equipo Qwen (Alibaba), publicado en el ecosistema Hugging Face. La ficha que nos ocupa, `jsantillana/Qwen3.8-27B-abliterated-v3`, es una variante "abliterated" (sin las direcciones de rechazo del modelo original) del checkpoint post-entrenado Qwen3.8-27B. El modelo base resuelve tareas de razonamiento, código, trabajo profesional, investigación y agentes de horizonte largo, y añade comprensión nativa de imágenes y vídeos mediante un codificador visual.

Arquitectónicamente se trata de un transformer causal híbrido: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón de 16 bloques de 4 capas (3 de DeltaNet + 1 de atención completa). Tiene 27.781.427.952 parámetros reales (27B nominales), 64 capas, dimensión oculta de 5120 y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa.

La relevancia actual radica en que ofrece capacidades de nivel frontera en un tamaño compacto y desplegable en una sola GPU de 80 GB, con control flexible del modo de razonamiento (`thinking` activable/desactivable por petición y ajuste de profundidad vía `reasoning_effort`) y soporte nativo de visión y vídeo. La variante abliterated elimina las capas de rechazo, lo que la hace útil para investigación sobre alineación y para aplicaciones donde el modelo original rechaza peticiones legítimas, pero conlleva riesgos de seguridad que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador visual; Gated DeltaNet (atención lineal) + Gated Attention, patrón 16 × (3 × DeltaNet → FFN → 1 × Gated Attention → FFN) |
| Parametros totales | 27.781.427.952 (27B nominales) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors, presumiblemente BF16/FP16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 55,6 GB |
| Dimensión oculta | 5120 |
| Capas | 64 |
| Embedding de tokens | 248.320 (padded) |
| DeltaNet (atención lineal) | 48 cabezas V / 16 cabezas QK, dim. de cabeza 128 |
| Gated Attention | 24 cabezas Q / 4 cabezas KV, dim. de cabeza 256, RoPE dim. 64 |
| FFN | Dimensión intermedia 17.408 |
| MTP | Multi-Token Prediction entrenado con múltiples pasos |
| Pipeline | image-text-to-text |
| Compatibilidad de despliegue | Transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

El modelo sigue la base arquitectónica de Qwen3.5 y emplea una mezcla de atención lineal y atención completa. Cada bloque de 4 capas contiene 3 capas de Gated DeltaNet (atención lineal con estado recurrente, 48 cabezas V y 16 QK de dimensión 128) seguidas de 1 capa de Gated Attention con atención completa (24 cabezas Q, 4 KV, dimensión 256 y RoPE de 64). Este diseño reduce el coste de atención en contextos largos manteniendo capacidad de recuperación exacta en las capas de atención completa. El codificador visual es nativo (no un adaptador acoplado), lo que permite procesar imágenes y vídeos de hasta una hora de duración según la model card.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset. Sí indica que el post-entrenamiento incluye MTP con múltiples pasos (lo que habilita decodificación especulativa integrada) y control flexible del razonamiento: modo `thinking` activado por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort` y retención del contexto de razonamiento histórico vía `preserve_thinking`. No se especifica si se usó RLHF, DPO u otra técnica de alineación concreta. La variante abliterated de `jsantillana` modifica los pesos para eliminar las direcciones de rechazo, un procedimiento de post-procesado que no forma parte del entrenamiento original.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo `thinking` configurable (activado por defecto, desactivable por petición).
- Razonamiento de profundidad ajustable mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes: diagramas STEM, documentos escaneados, capturas, gráficos.
- Comprensión de vídeo, incluyendo vídeos de hasta una hora de duración según la model card.
- Generación y edición de código, con soporte para tareas de coding agéntico en terminal (Terminal Bench 2.1).
- Ejecución agéntica autónoma: planificación, manejo de feedback del entorno y finalización de tareas de horizonte largo.
- Compatibilidad con harnesses y herramientas de desarrollo populares (la model card menciona "broader support for popular harnesses").
- Capacidades multilingües: no detalladas en la información disponible.
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada, aunque la orientación agéntica y la mención de "official built-in tools" en la versión alojada sugieren soporte.

## Casos de uso

- Coding agéntico en terminal: el modelo está evaluado en Terminal Bench 2.1 (Terminus) y orientado a la ejecución autónoma de tareas de programación con feedback del entorno, por lo que encaja en pipelines de CI/CD y asistentes de terminal que iteran sobre errores de compilación y tests.
- Análisis de documentos técnicos y diagramas STEM: el codificador visual nativo permite extraer información de planos, esquemas y papers escaneados sin OCR externo, con contexto de 262K tokens para documentos extensos.
- Comprensión de vídeo de larga duración: la ventana de 262K tokens nativos (ampliable a 1M) y el soporte de vídeos de hasta una hora permiten resumir clases, reuniones o material audiovisual en una sola pasada.
- Investigación sobre alineación y seguridad: la variante abliterated es útil para estudiar qué comportamientos se eliminan al ablacionar las direcciones de rechazo, comparando con el checkpoint original.
- Automatización de tareas profesionales de horizonte largo: planificación y ejecución de flujos multi-paso (investigación, redacción, verificación) con `reasoning_effort` ajustable para equilibrar latencia y calidad.
- Despliegue en una sola GPU: con 27B parámetros en BF16 (~55,6 GB) cabe en una A100/H100 de 80 GB, lo que permite servir el modelo en infraestructura propia sin sharding, usando vLLM o SGLang.
- Generación de código en producción sin restricciones de rechazo: en entornos donde el modelo original rechaza peticiones legítimas (por ejemplo, análisis de malware defensivo o generación de exploits de pentesting autorizado), la variante abliterated evita bloqueos, a costa de asumir los riesgos de seguridad asociados.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks (parcialmente truncada en la información proporcionada). Los datos disponibles se limitan a la fila de Terminal Bench 2.1 (Terminus), sin valores numéricos visibles en el fragmento. No se pueden presentar cifras fiables del resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) porque los valores no aparecen en la información proporcionada.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible (valor truncado) | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: ~55,6 GB de pesos, más overhead de activaciones y KV cache; se recomienda una GPU de 80 GB (A100 80GB, H100 80GB, H200) para contexto largo.
- Cuantización a 8 bits: ~28 GB, cabe en una RTX 4090 (24 GB) solo con contexto corto y cuantización agresiva; en la práctica requiere 4 bits (~14 GB) para caber holgadamente en consumer.
- Cuantización a 4 bits (si se publica GGUF/AWQ, no listado en la información disponible): ~14-16 GB, viable en RTX 4090, RTX 3090 y GPUs de 24 GB.
- GPU recomendadas: H100 80GB o A100 80GB para producción en BF16 con contexto largo; RTX 4090/3090 para desarrollo con cuantización.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (según la model card). llama.cpp, Ollama y TGI no se mencionan explícitamente, aunque la disponibilidad de pesos safetensors permitiría conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El uso de MTP (Multi-Token Prediction) debería mejorar el throughput mediante decodificación especulativa nativa, pero no se aportan cifras.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en el fragmento proporcionado. A continuación se comparan los datos estructurales conocidos:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (esta ficha) | 27,8B denso | 262K nativo / 1M extensible | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.6-27B | 27B (no confirmado) | no disponible | no disponible | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | API (Qwen Cloud) |
| Muse Glimmer-30B | 30B (no confirmado) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | propietaria | API |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Variante abliterated: la eliminación de las direcciones de rechazo reduce o anula los mecanismos de seguridad del modelo original. Puede generar contenido dañino, ilegal o inseguro sin las salvaguardas previstas por el desarrollador. No recomendada para aplicaciones de cara al usuario sin filtros externos.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la variante abliterated no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del uso recae en el desplegador.
- Alucinación: como todo LLM, puede generar información factualmente incorrecta, especialmente en modo `thinking` desactivado o con `reasoning_effort` bajo.
- Sesgos: no se documentan en la información proporcionada; se heredan los del modelo base Qwen3.8-27B, no auditados en esta ficha.
- Idiomas: la lista de idiomas soportados no está disponible; el rendimiento en castellano no está verificado.
- Contexto largo: aunque la ventana nativa es de 262K tokens y extensible a 1M, el rendimiento en contextos muy largos no está cuantificado en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de la calidad de la abliteración ni de la integridad de los pesos.
- Fecha de creación (2026-11-10) y nombre "Qwen3.8" no verificables de forma independiente en la información proporcionada; conviene contrastar con el repositorio oficial de Qwen antes de usarlo en producción.
- Compatibilidad: la model card menciona Transformers, vLLM, SGLang y TokenSpeed, pero no se confirma el soporte de llama.cpp, Ollama o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsantillana/Qwen3.8-27B-abliterated-v3
- Qwen Cloud (servicio alojado, según model card): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Repositorio oficial de Qwen (referencia, no enlazado en la información): no disponible
- Paper técnico: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
