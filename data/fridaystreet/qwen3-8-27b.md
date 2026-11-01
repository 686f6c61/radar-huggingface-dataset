# fridaystreet/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso (no MoE) publicado por el usuario fridaystreet en Hugging Face, construido sobre la arquitectura Qwen3.5 y presentado como la generación más capaz de la familia Qwen de modelos abiertos. Con 27.781.427.952 parámetros reales en safetensors, es un modelo causal con codificador de visión que entiende imágenes y vídeos de forma nativa, con control flexible del modo de razonamiento (thinking) y orientado a tareas agénticas de largo horizonte.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un layout híbrido de 64 capas, e incorpora Multi-Token Prediction (MTP) entrenado con varios pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, lo que lo sitúa en la liga de modelos de contexto largo para procesamiento de documentos y vídeo de larga duración.

Es relevante ahora porque ofrece capacidades de codificación agéntica, trabajo profesional, investigación y visión-lenguaje en un tamaño compacto y desplegable (55,6 GB de repo en safetensors), con licencia Apache 2.0 y compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed. No obstante, la información disponible es limitada: el repositorio tiene solo 34 descargas y 0 likes, y la model card está incompleta (se corta en la tabla de benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention, 64 capas, layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos técnicos declarados: dimensión oculta 5.120; token embedding 248.320 (padded); Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones; FFN con dimensión intermedia 17.408; salida LM de 248.320 (padded); MTP entrenado con múltiples pasos.

## Arquitectura y entrenamiento

El modelo es un transformer causal híbrido que alterna bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención completa con compuertas), en una proporción de 3 a 1 por cada grupo de 16 bloques. Esta mezcla busca reducir el coste computacional y de memoria de la atención en contextos muy largos, manteniendo la capacidad de atención global en una cuarta parte de las capas. La inclusión de MTP (Multi-Token Prediction) entrenado con varios pasos sugiere soporte para decodificación especulativa y mayor throughput en generación.

El entrenamiento se declara en dos fases: pre-entrenamiento y post-entrenamiento. La model card no detalla el número de tokens, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. Tampoco se especifican los datos de entrenamiento del codificador de visión ni la resolución o duración de vídeo soportada. La información sobre innovaciones técnicas se limita a las ya mencionadas: atención lineal Gated DeltaNet, control flexible de thinking (`reasoning_effort`, `preserve_thinking`) y comprensión nativa de imagen y vídeo.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Codificación agéntica, incluyendo tareas de terminal (Terminal Bench 2.1 con harness Terminus).
- Trabajo profesional y tareas de investigación de largo horizonte.
- Ejecución agéntica autónoma con planificación y manejo de feedback del entorno.
- Comprensión visión-lenguaje nativa: imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte declarado de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede operar sobre entornos de línea de comandos en modo agéntico (evaluado en Terminal Bench 2.1), lo que permite integrarlo en pipelines de despliegue y depuración automatizada.
- Análisis de documentos técnicos y diagramas STEM: su codificador de visión nativo permite extraer información de figuras, esquemas y documentos escaneados sin pipelines OCR externos.
- Procesamiento de vídeo de larga duración: con contexto de hasta 262.144 tokens nativos y soporte de vídeos de escala horaria, es adecuado para resumen y búsqueda de eventos en grabaciones extensas.
- Asistentes de investigación de largo horizonte: la retención de contexto de razonamiento (`preserve_thinking`) y el control de `reasoning_effort` permiten mantener cadenas de razonamiento multi-paso en tareas de análisis.
- Codificación asistida en producción: con 27B parámetros densos y compatibilidad con vLLM y SGLang, puede desplegarse como servicio de generación de código con contexto de repositorio completo.
- Agentes autónomos de soporte técnico: la combinación de visión (capturas de pantalla) y razonamiento multi-paso permite diagnosticar incidencias a partir de imágenes y logs.
- Extracción de información de contratos y facturas: el contexto largo y la comprensión de documentos permiten procesar lotes de PDFs en una sola ventana.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero el contenido disponible se corta tras la primera fila (Agentic terminal coding, Terminal Bench 2.1 con harness Terminus), sin que se hayan podido extraer los valores numéricos. Los modelos de comparación citados son Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de benchmarks | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer resultados numéricos de benchmarks de la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 27B en FP16 requiere aproximadamente 55 GB de pesos, por lo que no cabe en GPUs de consumo de 24 GB sin cuantización.
- GPU recomendadas: no disponibles en la información. Por tamaño, cabría esperar A100 80GB, H100 80GB o múltiples RTX 4090/5090, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere cuantización (no se listan tipos soportados).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262.144 (ext. 1M) | Apache 2.0 | Sí (imagen y vídeo) | Hugging Face (34 descargas) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Citado en benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citado en benchmarks |
| Muse Glimmer-30B | ~30B (por nombre) | no disponible | no disponible | no disponible | Citado en benchmarks |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Citado en benchmarks |

Los datos de los modelos comparables no están disponibles en la información proporcionada; solo se conocen sus nombres por la tabla de benchmarks de la model card.

## Limitaciones y advertencias

- Información muy escasa: repositorio con 34 descargas y 0 likes, lo que impide validar la calidad o procedencia real de los pesos.
- La model card está incompleta: la tabla de benchmarks se corta y no se han podido verificar resultados numéricos.
- No se detallan sesgos conocidos, datos de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación no cuantificado; al ser un modelo generativo de 27B, es esperable en tareas de razonamiento abierto, pero no hay evaluación publicada.
- Idiomas soportados no declarados; no se puede confirmar el rendimiento en castellano.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la ausencia de documentación sobre el dataset de entrenamiento impide descartar problemas de procedencia de datos.
- El nombre "Qwen3.8-27B" y la referencia a "Qwen Cloud" sugieren una posible suplantación o modelo no oficial; conviene verificar la autenticidad antes de usarlo en producción.
- No se especifican tipos de cuantización soportados, lo que limita el despliegue en hardware de consumo.
- El contexto extensible a 1M tokens se anuncia para la versión alojada en Qwen Cloud, no necesariamente para los pesos locales.

## Enlaces

- Hugging Face: https://huggingface.co/fridaystreet/Qwen3.8-27B
- Qwen Cloud (referenciado en la model card): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
