# HexaSpaghetti/Qwen3.8-27B-Heretic

## Resumen

HexaSpaghetti/Qwen3.8-27B-Heretic es una versión "decensored" (abliterated) del modelo Qwen/Qwen3.8-27B, publicada por el usuario HexaSpaghetti. Se ha generado con la herramienta Heretic v2.2.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 8 a 61 del transformer para reducir la tasa de rechazos del modelo original. El resultado declarado es una caída de rechazos de 98/100 a 6/100 en un conjunto de evaluación de 100 peticiones, con una divergencia KL de 0,1950 respecto al modelo base.

El modelo subyacente, Qwen3.8-27B, es un modelo denso de 27.356.728.560 parámetros (según safetensors) con arquitectura híbrida que combina Gated DeltaNet (atención lineal) y Gated Attention, además de un codificador de visión nativo. Soporta contexto nativo de 262.144 tokens, extensible hasta 1.000.000, y está orientado a tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, un modelo base de generación actual con capacidades visión-lenguaje y control flexible de "thinking"; por otro, una modificación de alineación que elimina restricciones de rechazo, lo que plantea consideraciones importantes de uso responsable y de licencia que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de visión; híbrido Gated DeltaNet + Gated Attention |
| Parámetros totales | 27.356.728.560 (27B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en precisión completa; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión. La dimensión oculta es 5.120, con 64 capas organizadas en un patrón de 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia 17.408, y el vocabulario (embedding y salida) es de 248.320 tokens (con padding). Incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento del modelo base comprende fases de pre-entrenamiento y post-entrenamiento (no se detallan en la información disponible el número de tokens, la composición del dataset ni si se usó RLHF/DPO). La modificación Heretic aplica una ablación de rangos arbitrarios sobre las capas 8 a 61 con los siguientes parámetros: `start_layer_index=8`, `end_layer_index=61`, `preserve_good_behavior_weight=0.8036`, `steer_bad_behavior_weight=0.0016`, `overcorrect_relative_weight=0.9968` y `neighbor_count=12`. El proceso es reproducible según el autor (directorio `reproduce/`).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión nativa de imágenes y vídeos (image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Codificación y tareas de trabajo profesional e investigación.
- Ejecución de agentes autónomos con planificación multi-paso y manejo de retroalimentación del entorno.
- Compatibilidad con harnesses y herramientas de desarrollo populares (según el autor, "broader support for popular harnesses").
- Capacidades multilingües: no disponible el detalle de idiomas.
- Tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el modelo base se describe como orientado a agentes.
- Comportamiento "decensored": reducción drástica de rechazos (6/100 frente a 98/100 del original).

## Casos de uso

- Asistentes de atención al cliente multi-turno: el contexto nativo de 262.144 tokens permite mantener conversaciones largas con historial completo e imágenes adjuntas (capturas, documentos) sin truncar.
- Análisis de documentos técnicos y científicos: la combinación de visión nativa y contexto largo permite procesar papers con figuras, tablas y diagramas, extrayendo información estructurada.
- Generación y revisión de código en pipelines de CI/CD: el modelo base está orientado a codificación y agentes; puede integrarse vía vLLM o SGLang para tareas de revisión automatizada y parcheo.
- Agentes autónomos de largo horizonte: planificación multi-paso con realimentación del entorno, útil para automatización de tareas de investigación o navegación de herramientas.
- Procesamiento de vídeo de larga duración: la ventana extensible a 1M tokens y el soporte de vídeos de hasta una hora permiten resumir o extraer eventos de grabaciones completas.
- Investigación sobre alineación y robustez: al ser una versión abliterated reproducible, sirve como caso de estudio para medir el efecto de la ablación sobre la tasa de rechazos y la divergencia KL.
- Despliegue en entornos con requisitos de contenido sin restricciones (con las advertencias legales correspondientes): útil en investigación creativa o generación de contenido ficticio adulto donde el modelo original rechazaría.

## Benchmarks y rendimiento

| Métrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| Rechazos (sobre 100) | 6/100 | 98/100 |
| Divergencia KL | 0,1950 | 0 (por definición) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante ni para el modelo base en la documentación proporcionada. La model card del modelo base menciona tablas de rendimiento en texto y visión, pero los datos numéricos no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB solo para pesos (27,36B × 2 bytes), más overhead de KV cache y activaciones; en la práctica se recomienda al menos 80 GB.
- VRAM en cuantización de 8 bits: ~28 GB de pesos; en 4 bits: ~14 GB de pesos, más overhead.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para precisión completa; para cuantizaciones 4/8 bits podrían usarse RTX 4090 (24 GB) o RTX 6000 Ada con cuidado.
- ¿Cabe en GPU de consumo? En 4 bits sí es viable en RTX 4090 (24 GB) o RTX 3090 (24 GB), asumiendo que existan pesos cuantizados (no publicados en el repo).
- Opciones de despliegue: transformers, vLLM, SGLang, TokenSpeed (según la model card del base). No se confirma soporte de llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HexaSpaghetti/Qwen3.8-27B-Heretic | 27B (denso) | 262.144 (ext. 1M) | apache-2.0 | Variante abliterated del Qwen3.8-27B |
| Qwen/Qwen3.8-27B | 27B (denso) | 262.144 (ext. 1M) | apache-2.0 | Modelo base original, alineado |
| Qwen3.6-27B | no disponible | no disponible | no disponible | Generación anterior de la familia, mencionada en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Variante "Plus" mencionada en la model card; sin datos numéricos disponibles |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación Heretic elimina gran parte de los mecanismos de rechazo; el modelo puede generar contenido que el original bloquearía, incluyendo material sensible. El uso responsable recae enteramente en el desplegador.
- La divergencia KL de 0,1950 respecto al original indica un cambio no trivial en la distribución de salida; puede haber degradación en tareas que dependían del alineamiento original.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad para esta variante; el proceso de ablación puede afectar a la calibración.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que herede del modelo base.
- Licencia apache-2.0 permite uso comercial, pero el contenido generado sin filtros puede infringir normativas locales o las políticas de la plataforma de despliegue; verificar cumplimiento antes de producción.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; el despliegue eficiente requiere cuantizar por cuenta propia.
- El repositorio tiene muy pocas descargas (21) y ningún "like" en el momento de la consulta; no hay validación comunitaria amplia.
- El modelo se describe como "reproducible", pero la reproducibilidad depende de la versión exacta de Heretic (v2.2.0.dev0, una versión de desarrollo).

## Enlaces

- Hugging Face: https://huggingface.co/HexaSpaghetti/Qwen3.8-27B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de ablación): https://heretic-project.org
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com
- Overview de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
