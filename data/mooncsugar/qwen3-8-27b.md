# mooncsugar/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en el repositorio de Hugging Face `mooncsugar/Qwen3.8-27B` bajo licencia Apache 2.0. Según su model card, se presenta como la generación más capaz de la familia Qwen de modelos abiertos hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a tareas de programación, trabajo profesional, investigación y flujos agénticos de largo horizonte. El modelo combina comprensión nativa de imagen y vídeo con control flexible del modo de razonamiento.

Se trata de un modelo denso de aproximadamente 27.800 millones de parámetros (27.781.427.952 según los pesos en safetensors), con una dimensión oculta de 5120, 64 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuerta (Gated Attention) en un patrón repetido de 16 bloques, e incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

Su relevancia radica en ofrecer capacidades multimodales y agénticas en un tamaño compacto y desplegable, con pesos en formato Transformers compatibles con motores de inferencia como vLLM, SGLang o TokenSpeed. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado datos sobre idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention; MTP |
| Parametros totales | 27.781.427.952 (≈27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido poco habitual: 64 capas organizadas en 16 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Las capas Gated DeltaNet emplean atención lineal con 48 cabezas para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17.408, la dimensión oculta es 5120 y el embedding de tokens (con padding) alcanza 248.320 entradas, igual que la salida del LM. Incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento según la model card, aunque no se especifican el número de tokens, la composición del dataset ni los detalles de RLHF/DPO. Entre las innovaciones destacadas están el control flexible del pensamiento (modo thinking activado por defecto, desactivable por petición, con ajuste de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`) y el soporte nativo de imagen y vídeo, incluyendo vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable por petición.
- Programación y tareas de terminal agénticas (evaluado en Terminal Bench 2.1).
- Trabajo profesional e investigación.
- Comprensión nativa de imagen y vídeo (diagramas STEM, documentos, vídeos de hasta una hora).
- Ejecución agéntica autónoma con planificación y manejo de retroalimentación del entorno.
- Soporte de tool calling / function calling (implícito en las capacidades agénticas descritas).
- Razonamiento multi-paso de largo horizonte.
- Control de profundidad de razonamiento mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo puede ejecutar flujos agénticos de codificación en terminal (evaluado en Terminal Bench 2.1), integrándose en pipelines para resolución autónoma de incidencias y generación de parches.
- Asistencia a programación en producción: con soporte de tool calling y contexto de 262K tokens, puede analizar repositorios completos y mantener coherencia en tareas de refactorización multiarchivo.
- Análisis de documentos técnicos y diagramas STEM: su codificador de visión permite interpretar figuras, esquemas y documentación científica para extraer conclusiones y responder preguntas.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, resulta adecuado para resumen y extracción de información en grabaciones de reuniones o clases.
- Investigación asistida: razonamiento de largo horizonte con thinking control permite descomponer problemas complejos y mantener contexto de razonamiento entre turnos.
- Agentes autónomos de múltiples pasos: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen apto para orquestar tareas encadenadas con verificación intermedia.
- Atención al cliente multimodal: puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, documentos) gracias a la ventana de contexto extendida.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraído está truncado y solo se identifica la primera fila (Agentic terminal coding, Terminal Bench 2.1), sin valores numéricos legibles. No se pueden presentar cifras fiables.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (≈27,8B parámetros), en FP16 requeriría aproximadamente 55,6 GB (coincide con el tamaño del repo), en FP8/INT8 unos 28 GB y en cuantizaciones de 4 bits alrededor de 14-16 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar A100 80GB, H100 80GB o configuraciones multi-GPU para FP16.
- GPU de consumo: podría caber en RTX 4090 (24 GB) con cuantización de 8 bits o inferior, y en GPUs de 16 GB con cuantización de 4 bits, aunque no hay confirmación oficial.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (citados en la model card como compatibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | ≈27,8B | 262K (ext. 1M) | Apache 2.0 | Sí (imagen y vídeo) | Pesos abiertos en HF |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Muse Glimmer-30B | ≈30B (por nombre) | no disponible | no disponible | no disponible | Citado en la model card |

Los datos de los modelos comparables no están detallados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; se recomienda evaluación específica antes de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo thinking activado por defecto puede aumentar la latencia si no se ajusta `reasoning_effort`.
- Idiomas soportados no documentados; el rendimiento multilingüe no está verificado.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar los términos del servicio Qwen Cloud si se usa la API alojada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-24); no hay evidencia de validación comunitaria.
- El contenido de benchmarks en la model card está truncado, por lo que las afirmaciones de rendimiento no son verificables con los datos disponibles.
- El tamaño del repo (55,6 GB) implica requisitos de almacenamiento y ancho de banda considerables para el despliegue en FP16.

## Enlaces

- Hugging Face: https://huggingface.co/mooncsugar/Qwen3.8-27B
- Qwen Cloud (servicio alojado): https://www.qwencloud.com
- Overview del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
