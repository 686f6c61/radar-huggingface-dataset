# Haodid/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de tipo denso (27 781 427 952 parámetros reales según los pesos en safetensors) publicado por el usuario Haodid en Hugging Face bajo licencia Apache 2.0. La model card lo presenta como parte de la familia Qwen3.8, construida sobre la base arquitectónica de Qwen3.5, y orientada a tareas de programación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Es un modelo nativo visión-lenguaje: procesa imágenes y vídeos además de texto, con control flexible del modo de razonamiento.

La arquitectura combina capas de atención lineal Gated DeltaNet con capas de atención con puerta (Gated Attention) en un patrón repetido 16 veces (16 × [3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)]), lo que da 64 capas en total. Incorpora predicción multi-token (MTP) entrenada con varios pasos y una dimensión oculta de 5120. El contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

El modelo resulta relevante por su tamaño compacto (27B) combinado con capacidades agénticas y multimodales, lo que lo hace desplegable en infraestructura moderada. La model card menciona compatibilidad con Transformers, vLLM, SGLang y TokenSpeed, y anuncia una versión alojada en Qwen Cloud con contexto de 1M por defecto y herramientas integradas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida de atención lineal Gated DeltaNet y Gated Attention |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). La dimensión oculta es 5120, con 64 capas organizadas en 16 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Las capas Gated Attention usan 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia 17 408. El embedding de tokens y la salida LM tienen 248 320 entradas (con padding).

El modelo incorpora Multi-Token Prediction (MTP) entrenada con múltiples pasos, una técnica que permite predecir varios tokens por paso y que suele emplearse para decodificación especulativa o aceleración de inferencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; esa información figura como no disponible. El control de razonamiento es configurable: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable (activado por defecto, desactivable por petición).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Programación y tareas de terminal agénticas (la model card cita Terminal Bench 2.1).
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Razonamiento multi-paso y tareas de horizonte largo.
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento histórico con `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (según la model card).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque la mención de "herramientas integradas" en la versión alojada y el enfoque agéntico lo sugieren; tratar como no confirmado.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de tareas de terminal y CI/CD: el modelo está evaluado en Terminal Bench 2.1 y orientado a codificación agéntica, por lo que puede integrarse en pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma autónoma.
- Análisis de documentos técnicos y diagramas STEM: al ser visión-lenguaje nativo, puede extraer información de figuras, esquemas y PDFs técnicos sin necesidad de un pipeline OCR separado.
- Comprensión de vídeos de larga duración: la model card indica soporte para vídeos de hasta una hora, útil para resumen y extracción de eventos en grabaciones de reuniones, clases o monitorización.
- Asistencia a investigación y trabajo profesional: con contexto de 262K tokens nativo (hasta 1M), puede procesar corpus extensos, informes y múltiples documentos en una sola ventana.
- Agentes autónomos de horizonte largo: la planificación autónoma y el manejo de retroalimentación del entorno lo hacen adecuado para tareas que requieren múltiples pasos con verificación intermedia.
- Despliegue en infraestructura moderada: con 27B parámetros densos y compatibilidad con vLLM, SGLang y TokenSpeed, puede servirse en una o pocas GPUs de gama alta sin necesidad de clústeres multi-nodo.
- Control de coste de razonamiento en producción: la posibilidad de desactivar el modo thinking o ajustar `reasoning_effort` permite equilibrar latencia y calidad según la petición.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraído está truncado: solo se identifica la fila "Agentic terminal coding — Terminal Bench 2.1 (Terminus)" sin que los valores numéricos estén disponibles en la información proporcionada. No se han podido recuperar el resto de filas ni sus cifras.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica requiere 2 × A100 80GB o 2 × H100 80GB para contexto largo.
- Cuantización a 8 bits: en torno a 28 GB de pesos, viable en una A100 40GB o H100 40GB con contexto moderado.
- Cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente desplegable en una RTX 4090 (24 GB) con contexto limitado; el contexto de 262K requeriría offloading o GPUs de mayor memoria.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para producción con contexto largo; RTX 4090 o L40S para cuantización agresiva y contexto reducido.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed (citados en la model card).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B (denso) | 262K nativo, hasta 1M | Apache 2.0 | Hugging Face (Haodid) | Visión-lenguaje, MTP, thinking configurable |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Generación anterior de la familia Qwen; citado en la tabla de benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Variante "Plus" de la familia; citada en la tabla de benchmarks |
| Muse Glimmer-30B | 30B (según nombre) | no disponible | no disponible | no disponible | Citado como comparador en la model card |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Citado como comparador en la model card |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; solo se conocen sus nombres por aparecer en la tabla de benchmarks de la model card.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (11 de noviembre de 2026): no hay evidencia de validación por parte de la comunidad.
- El autor del repositorio es "Haodid", no el equipo oficial de Qwen; la model card afirma ser de la familia Qwen, pero conviene verificar la procedencia de los pesos antes de usarlos en producción.
- La model card está truncada en la información disponible: no se han podido verificar los resultados completos de benchmarks ni la lista de idiomas soportados.
- No se detallan los datos de entrenamiento (número de tokens, composición, alineación RLHF/DPO), lo que dificulta evaluar sesgos y riesgos de alucinación.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- El contexto de 1M tokens es una extensión sobre los 262K nativos; el rendimiento en esa ventana extendida no está documentado.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la procedencia no oficial del repositorio aconseja revisar los términos y la trazabilidad de los pesos.
- No hay información sobre sesgos conocidos ni sobre el rendimiento en idiomas distintos del inglés.

## Enlaces

- Hugging Face: https://huggingface.co/Haodid/Qwen3.8-27B
- Qwen Cloud (overview del modelo): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio): https://www.qwencloud.com
