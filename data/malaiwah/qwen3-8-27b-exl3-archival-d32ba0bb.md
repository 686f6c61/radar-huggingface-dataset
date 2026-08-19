# malaiwah/Qwen3.8-27B-exl3-archival-d32ba0bb

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (imagen-texto a texto) presentado como la última generación de la familia abierta Qwen3.8, desarrollado por el equipo de Qwen (Alibaba). Según la model card, está construido sobre la base arquitectónica de Qwen3.5 e incorpora mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El modelo combina un codificador de visión con un núcleo de lenguaje denso de 27B parámetros declarados, aunque los pesos reales en safetensors suman 11.471.123.696 parámetros (aproximadamente 11,5B), una discrepancia que debe tenerse en cuenta al evaluar el modelo.

La arquitectura es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), en un patrón de 16 bloques con 3 capas DeltaNet por cada capa de atención. Soporta un contexto nativo de 262.144 tokens, extensible hasta 1.000.000, e incluye modo de pensamiento flexible (thinking mode) activado por defecto y desactivable por petición, con control de profundidad de razonamiento mediante `reasoning_effort`. El pipeline declarado es image-text-to-text, lo que indica capacidades nativas de comprensión de imágenes y vídeos. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

Este repositorio concreto (ID `malaiwah/Qwen3.8-27B-exl3-archival-d32ba0bb`) es un archivo de pesos en formato ExLlama v3 (según el nombre y la etiqueta `exl3`), con cuantización de 6 bits (etiqueta `6-bit`), y presenta 0 descargas y 0 likes en el momento de la consulta. La model card oficial de Qwen indica que el modelo estará disponible próximamente en la API gestionada de Qwen Cloud con contexto de 1M por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) + FFN, con codificador de visión |
| Parametros totales | 27B (declarados); 11.471.123.696 (pesos reales en safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | 6-bit (etiqueta del repo, formato ExLlama v3) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (conversión a ExLlama v3) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer causal híbrido que alterna capas de atención lineal y atención completa. El layout declarado es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, es decir, por cada 3 bloques de atención lineal hay 1 bloque de atención completa. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK, con dimensión de cabeza 128. La atención completa (Gated Attention) usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120, con FFN de dimensión intermedia 17.408 y embedding de tokens de 248.320 (padded). El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos.

En cuanto al entrenamiento, la model card solo indica dos fases: pre-training y post-training, sin detalles sobre el número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO). No se proporciona información adicional sobre el proceso de entrenamiento en la documentación disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras declaradas en codificación, trabajo profesional e investigación.
- Comprensión de imágenes y vídeos de forma nativa (pipeline image-text-to-text), incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Modo de pensamiento flexible: activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y preservación del contexto de razonamiento histórico mediante `preserve_thinking`.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de múltiples pasos de forma fiable.
- Soporte de contexto largo: 262K nativo, extensible a 1M, adecuado para tareas que requieren mantener información a lo largo de conversaciones o documentos extensos.
- Compatibilidad con herramientas y harnesses populares (la model card menciona compatibilidad con Transformers, vLLM, SGLang, TokenSpeed).

## Casos de uso

- Asistente de programación agéntico: el modelo puede ejecutar tareas de codificación en terminal (benchmark Terminal Bench 2.1) y manejar feedback del entorno, lo que lo hace adecuado para pipelines de desarrollo automatizados, generación de código, revisión y corrección de errores.
- Análisis de documentos técnicos y científicos: gracias a la comprensión nativa de imágenes y vídeos, puede procesar diagramas STEM, gráficos, tablas y documentos extensos, extrayendo información y respondiendo preguntas sobre ellos.
- Atención al cliente multimodal: con contexto de hasta 262K tokens, puede gestionar conversaciones multi-turno largas, incluyendo capturas de pantalla o imágenes enviadas por el usuario, manteniendo el hilo de la conversación.
- Agentes autónomos de investigación: su capacidad de planificación a largo plazo y manejo de feedback lo hace apto para tareas de investigación que requieren múltiples pasos, búsqueda de información y síntesis de resultados.
- Procesamiento de vídeo para resúmenes o extracción de información: el modelo puede analizar vídeos de hasta una hora, lo que permite generar resúmenes, transcripciones estructuradas o detectar eventos relevantes.
- Asistente de documentación técnica: con soporte de contexto largo y modo de razonamiento, puede redactar, revisar y mantener documentación extensa, integrando información de múltiples fuentes.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información proporcionada está incompleta: solo se muestra la fila de "Agentic terminal coding" con el benchmark "Terminal Bench 2.1 (Terminus)" y los encabezados de columna (Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max), sin valores numéricos. No se dispone de resultados completos de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible. Por tanto, no es posible presentar una tabla de resultados verificada.

## Requisitos de hardware

- Los pesos reales (11,47B parámetros) en formato FP16/BF16 ocupan aproximadamente 23 GB (tamaño del repositorio), lo que sugiere que caben en una GPU con 24 GB de VRAM, como la RTX 3090, RTX 4090 o A5000, en precisión completa.
- Con la cuantización de 6 bits indicada en el repo, el modelo podría reducirse a unos 9-10 GB, permitiendo inferencia en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080, etc.).
- Para contexto largo (262K o 1M), la memoria necesaria crece significativamente por el KV cache; se recomienda GPUs con 48 GB o más (A6000, A100, H100) para explotar todo el contexto.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card. También puede usarse con ExLlama v3 dado el formato del repo.
- No se dispone de datos de latencia o throughput medidos en la información proporcionada.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max en la tabla de benchmarks, pero sin valores numéricos disponibles. No se dispone de información suficiente para realizar una comparativa detallada con modelos de la misma categoría (por ejemplo, Llama 3.1 8B, Mistral 7B o Qwen2.5-14B) en cuanto a rendimiento real. Se puede señalar que, según la arquitectura declarada, Qwen3.8-27B es un modelo denso multimodal con contexto nativo de 262K, lo que lo sitúa en una categoría superior a modelos densos de tamaño similar sin capacidades de visión.

## Limitaciones y advertencias

- Discrepancia entre parámetros declarados (27B) y pesos reales (11,47B): la model card afirma 27B, pero los safetensors suman 11.471.123.696 parámetros. Esta inconsistencia debe resolverse antes de considerar el modelo para producción.
- El repositorio es un archivo (nombre con "archival") con 0 descargas y 0 likes, y una fecha de creación en el futuro (2026-08-16), lo que sugiere que podría tratarse de un artefacto no verificado o de prueba.
- No se proporcionan datos sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas.
- La model card menciona que el modelo estará disponible próximamente en Qwen Cloud, pero no se indica disponibilidad actual de la API.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia y autenticidad de los pesos antes de su uso en entornos productivos.
- No hay información sobre el dataset de entrenamiento ni sobre técnicas de alineación, por lo que se desconoce el comportamiento en tareas sensibles o de alto riesgo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-exl3-archival-d32ba0bb
- Página de Qwen Cloud para Qwen3.8-27B (mencionada en la model card): https://www.qwencloud.com/models/qwen3.8-27b
