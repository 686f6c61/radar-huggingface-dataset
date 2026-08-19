# fsousaon/Qwen3.8-27B-Lia

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por el equipo de Qwen como parte de la generación Qwen3.8, la más capaz de la familia open-source de Qwen hasta la fecha. Se trata de un modelo denso de 27.000 millones de parámetros (27.781.427.952 en total) que integra de forma nativa comprensión de imágenes y vídeo, junto con control flexible del razonamiento mediante un modo de pensamiento activable por petición. Su arquitectura híbrida combina capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention, lo que le permite manejar una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

El modelo destaca por sus mejoras en tareas de codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, con una planificación autónoma más sólida y mejor manejo del feedback del entorno. Incluye soporte para Multi-Token Prediction (MTP) y es compatible con los principales entornos de inferencia como Hugging Face Transformers, vLLM, SGLang y TokenSpeed. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para despliegues en producción.

El repositorio en HuggingFace está publicado por el usuario fsousaon, que actúa como distribuidor de los pesos oficiales del modelo en formato Transformers. La model card indica que el servicio gestionado estará disponible próximamente a través de Qwen Cloud con características adicionales como contexto de 1M por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | 27.781.427.952 (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina dos mecanismos de atención. La configuración del bloque oculto sigue el patrón `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, es decir, por cada 16 bloques de atención lineal hay un bloque de atención completa. La atención lineal Gated DeltaNet utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa Gated Attention usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de dimensión 64. La dimensión oculta es 5120, con 64 capas y un embedding de tokens de 248.320 (padded). La FFN tiene dimensión intermedia de 17.408.

El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia a largo plazo. El entrenamiento incluye etapas de pre-entrenamiento y post-entrenamiento, aunque la model card no especifica el número de tokens de entrenamiento ni la composición del dataset. Tampoco se detalla si se aplicaron técnicas de RLHF o DPO. El modo de pensamiento (thinking) está activado por defecto y puede desactivarse por petición, con parámetros como `reasoning_effort` para ajustar la profundidad del razonamiento y `preserve_thinking` para retener el contexto de razonamiento en mensajes históricos.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de codificación, trabajo profesional e investigación.
- Comprensión nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Control flexible del modo de pensamiento: activado por defecto, desactivable por petición, con ajuste de esfuerzo de razonamiento (`reasoning_effort`) y retención de contexto de razonamiento (`preserve_thinking`).
- Ejecución agéntica mejorada: planificación autónoma y manejo de feedback del entorno para tareas multi-paso de horizonte largo.
- Soporte para Multi-Token Prediction (MTP), que acelera la generación y mejora la coherencia.
- Compatibilidad con herramientas de desarrollo populares y harnesses de evaluación gracias a la mejora en downstream compatibility.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Desarrollo de agentes autónomos de terminal: el modelo destaca en Terminal Bench 2.1 (Terminus), un benchmark de codificación agéntica en terminal, lo que lo hace adecuado para construir asistentes que ejecutan comandos, gestionan repositorios y resuelven tareas de programación de extremo a extremo.
- Asistentes de codificación en producción: con soporte para vLLM y SGLang, puede integrarse en pipelines de CI/CD para generación de código, revisión de pull requests y autocompletado con contexto de hasta 262K tokens, suficiente para repositorios completos.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas STEM, figuras y documentos escaneados, combinando comprensión visual y textual en un solo modelo.
- Sistemas de razonamiento multi-paso con modo de pensamiento: el control de `reasoning_effort` permite calibrar la profundidad del razonamiento según la complejidad de la tarea, útil en aplicaciones de diagnóstico, planificación o investigación asistida.
- Transcripción y análisis de vídeo de larga duración: al soportar vídeos de hasta una hora, puede emplearse para resumir reuniones grabadas, analizar contenido educativo o extraer eventos relevantes de material audiovisual.
- Chatbots conversacionales con contexto largo: su ventana de 262K tokens (extensible a 1M) permite mantener conversaciones multi-turno con historial extenso, adecuado para atención al cliente, tutoría o asistentes personales.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa, pero la información proporcionada está incompleta (solo se muestra la primera fila de la sección de coding). Los datos disponibles son:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) - Agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado los valores numéricos de los benchmarks en la información disponible. La tabla comparativa incluye modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los resultados concretos no se han extraído correctamente. Se recomienda consultar la model card original para obtener los datos completos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8 B parámetros en precisión FP16, el modelo requiere aproximadamente 55-60 GB de VRAM. Con cuantización de 8 bits, alrededor de 30 GB; con 4 bits, unos 16-18 GB. Estos valores son estimaciones basadas en el tamaño del modelo, ya que no se han publicado requisitos oficiales.
- GPU recomendadas: para FP16 se necesitan GPUs de datacenter como A100 80GB, H100 80GB o A6000 48GB (con batch reducido). Para cuantización 8 bits, una RTX 4090 24GB o RTX 6000 Ada podrían ser suficientes. Para 4 bits, cabría en GPUs consumer de 16-24 GB.
- El tamaño del repositorio es de 55,6 GB, lo que confirma la necesidad de almacenamiento significativo para los pesos completos.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed son compatibles según la model card. También se puede usar llama.cpp u Ollama si se generan pesos GGUF, aunque no se mencionan explícitamente.
- Latencia y throughput: no disponible. El uso de MTP debería mejorar la velocidad de decodificación frente a modelos de generación token a token, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero solo se dispone de los nombres de los benchmarks, no de los resultados. Como alternativas de la misma categoría (modelos densos de ~27-30B con capacidades multimodales):

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8 B | 262K (ext. 1M) | Apache 2.0 | Visión + vídeo, MTP, thinking mode |
| Qwen3.6-27B | ~27 B | no disponible | Apache 2.0 (presumible) | Generación anterior de la familia Qwen |
| Muse Glimmer-30B | ~30 B | no disponible | no disponible | Competidor en la misma franja de tamaño |

No se dispone de datos suficientes para una comparativa cuantitativa completa. Los benchmarks de la model card sugieren que Qwen3.8-27B supera a sus predecesores, pero los valores numéricos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La información sobre idiomas soportados no está disponible en la model card, por lo que no se puede garantizar el rendimiento en lenguas específicas más allá de las habituales en modelos Qwen (inglés, chino y otras).
- No se especifican los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), lo que dificulta evaluar posibles sesgos.
- El modelo puede presentar alucinaciones, especialmente en tareas de razonamiento complejo o con información factual poco representada en los datos de entrenamiento, como cualquier LLM de su tamaño.
- El modo de pensamiento activado por defecto puede aumentar la latencia en tareas simples; es necesario desactivarlo explícitamente cuando no se requiera razonamiento profundo.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor del repositorio (fsousaon) es un usuario particular y no se confirma que sea el equipo oficial de Qwen; se recomienda verificar la procedencia de los pesos antes de usarlos en producción.
- La ventana de contexto de 1M tokens es una extensión posible, pero el rendimiento en esa longitud puede degradarse y requiere hardware de altas prestaciones.
- No se han publicado resultados completos de benchmarks en la información disponible, por lo que las afirmaciones de rendimiento de la model card no pueden verificarse de forma independiente con los datos extraídos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fsousaon/Qwen3.8-27B-Lia
- Servicio gestionado Qwen Cloud (próximamente): https://www.qwencloud.com/models/qwen3.8-27b
- Documentación general de Qwen Cloud: https://www.qwencloud.com
