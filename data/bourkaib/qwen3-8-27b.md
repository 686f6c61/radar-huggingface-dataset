# bourkaib/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso con codificador de visión, publicado por el usuario bourkaib en Hugging Face bajo licencia Apache 2.0. Según su model card, forma parte de la familia Qwen3.8 y se presenta como la generación más capaz de la saga de modelos abiertos Qwen hasta la fecha, construida sobre la base arquitectónica de Qwen3.5. El modelo combina comprensión nativa de imagen y vídeo con control flexible del razonamiento, lo que lo sitúa en la categoría de modelos multimodales compactos orientados a despliegue.

Con 27.781.427.952 parámetros reales (27B nominales), 64 capas y una dimensión oculta de 5120, el modelo emplea una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal) con capas de Gated Attention clásica, además de entrenamiento con Multi-Token Prediction (MTP). Su contexto nativo es de 262.144 tokens, extensible hasta 1.000.000, y el repositorio ocupa 55,6 GB en formato safetensors para Transformers.

La relevancia del modelo radica en su orientación a tareas agénticas de largo horizonte, codificación y trabajo profesional, con modos de razonamiento configurables por petición. No obstante, la ficha se basa exclusivamente en la información disponible en el repositorio: no hay datos de idiomas soportados ni resultados de benchmarks completos verificables, y el modelo registra cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer híbrido con 64 capas organizadas en un patrón de 16 bloques, cada uno compuesto por tres subcapas de Gated DeltaNet seguidas de una de Gated Attention. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La red feed-forward tiene dimensión intermedia de 17.408, y el embedding de tokens y la salida LM cuentan con 248.320 entradas (con padding).

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incluye Multi-Token Prediction (MTP) con múltiples pasos, lo que habilita decodificación especulativa y mejora el throughput. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO; tampoco especifica la arquitectura del codificador de visión más allá de su presencia. El control flexible del razonamiento (modo thinking activado por defecto, desactivable por petición, con `reasoning_effort` y `preserve_thinking`) sugiere un post-entrenamiento orientado a razonamiento configurable.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y profundidad ajustable mediante `reasoning_effort`.
- Codificación y tareas de terminal agénticas (el benchmark Terminal Bench 2.1 aparece en la model card).
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora.
- Planificación autónoma y manejo de retroalimentación del entorno para tareas agénticas de extremo a extremo.
- Retención de contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Compatibilidad con harnesses y herramientas de desarrollo populares (sin detallar cuáles).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Codificación agéntica en terminal: el modelo está evaluado en Terminal Bench 2.1 y declara mejoras en planificación autónoma, por lo que puede operar en entornos de línea de comandos para resolver tareas de desarrollo de varios pasos.
- Análisis de documentos técnicos y diagramas STEM: su codificador de visión nativo permite extraer información de figuras, esquemas y documentos escaneados en flujos de investigación.
- Procesamiento de vídeo de larga duración: con soporte para vídeos de hasta una hora, resulta adecuado para resumen y análisis de grabaciones, revisiones o material formativo.
- Asistentes de investigación con contexto largo: los 262.144 tokens nativos (extensibles a 1M) permiten mantener conversaciones o analizar corpus extensos sin truncamiento.
- Automatización de tareas profesionales multi-paso: el control de `reasoning_effort` permite ajustar el coste de razonamiento según la complejidad de la tarea en pipelines de producción.
- Integración en stacks existentes: la compatibilidad declarada con Transformers, vLLM, SGLang y TokenSpeed facilita el despliegue en infraestructuras ya montadas.
- Razonamiento con trazas preservadas: `preserve_thinking` habilita auditoría del razonamiento en flujos donde la trazabilidad es requisito.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero el contenido extraído está truncado y solo muestra la primera fila (Terminal Bench 2.1, sin valores numéricos visibles). No es posible presentar resultados verificables.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 27B en fp16 requiere aproximadamente 56 GB de pesos, cantidad coherente con el tamaño del repositorio (55,6 GB); en cuantizaciones de 8 bits o 4 bits el requisito se reduciría aproximadamente a la mitad o a un cuarto, aunque no se confirman formatos soportados.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un despliegue en fp16 encajaría en A100 80GB o H100; en consumer GPU requeriría cuantización.
- Compatibilidad con consumer GPU: no confirmada; probablemente viable solo con cuantización en GPUs de 24 GB o superiores, sin datos oficiales.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed (según la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78B | 262.144 (ext. 1M) | Apache 2.0 | Hugging Face (bourkaib) |
| Qwen3.6-27B | no disponible | no disponible | no disponible | citado en model card |
| Muse Glimmer-30B | no disponible | no disponible | no disponible | citado en model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | citado en model card |

Los modelos comparables aparecen únicamente como referencias en la tabla de benchmarks de la model card; no se dispone de sus especificaciones ni de resultados numéricos para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Repositorio con cero descargas y un único like en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente.
- No se dispone de información sobre idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas.
- No se han publicado resultados de benchmarks verificables en la información disponible; las afirmaciones de mejora proceden del propio autor.
- No se detalla la composición del dataset de entrenamiento, por lo que no pueden evaluarse sesgos conocidos.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos específicos de mitigación.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar la procedencia de los pesos y la coherencia de la model card antes de un despliegue en producción.
- El contexto extensible a 1M tokens se anuncia para la versión alojada en Qwen Cloud; el comportamiento en despliegue local más allá de 262.144 tokens no está confirmado.
- No se confirma soporte explícito de tool calling ni de agentes multi-paso más allá de las menciones genéricas de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/bourkaib/Qwen3.8-27B
- Qwen Cloud (servicio alojado, próximamente): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
