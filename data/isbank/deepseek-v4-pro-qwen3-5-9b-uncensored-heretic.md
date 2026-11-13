# isbank/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario isbank. Se trata de una versión "decensored" (también etiquetada como abliterated o uncensored) generada mediante la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del modelo original para eliminar los comportamientos de rechazo. El modelo base, a su vez, es un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con un enfoque en razonamiento matemático y STEM.

El modelo conserva la arquitectura y el tamaño del Qwen3.5-9B original, con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y pesos en formato safetensors. La model card del autor original indica que el entrenamiento se centró en unos 250.000 ejemplos de matemáticas y razonamiento científico, e incluye innovaciones como Multi-Token Prediction (MTP) y evaluación en NVFP4. La variante heretic mantiene la licencia Apache 2.0 y soporta seis idiomas: inglés, chino, coreano, japonés, español y ruso.

La relevancia de esta ficha radica en que documenta un caso de modificación de alineación mediante ablación de pesos, una práctica creciente en la comunidad open source. El autor reporta una reducción de rechazos de 100/100 en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al original, lo que cuantifica el coste de la modificación en términos de deriva distribucional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con soporte de Multi-Token Prediction (MTP) según tags del modelo base |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el modelo base menciona evaluación en NVFP4; no se detallan otros formatos) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation / image-text-to-text (según tags) |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B |
| Tamaño del repositorio | 19,3 GB |
| Fecha de creación | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-9B, sobre la que el autor del modelo base (Jackrong) aplicó un proceso de destilación desde DeepSeek-V4-Pro en modo Max Effect. Según la model card, el señal supervisado se concentró en matemáticas y resolución de problemas STEM, con aproximadamente 250.000 muestras. Los tags del modelo incluyen SFT, RL, GSPO (Group Sequence Policy Optimization), MTP (Multi-Token Prediction) y evaluación en NVFP4, lo que sugiere un pipeline de post-entrenamiento que combina supervisión directa y optimización por política, además de una técnica de predicción multi-token para mejorar la eficiencia de decodificación. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset.

La modificación heretic se aplica mediante Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta técnica proyecta fuera del espacio de pesos las direcciones asociadas a comportamientos de rechazo, preservando en gran medida el comportamiento útil. El resultado reportado es una reducción de rechazos de 100/100 a 3/100, con una divergencia KL de 0,0422 respecto al modelo original, lo que indica una deriva moderada pero no trivial en la distribución de salidas.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con énfasis en descomposición estructurada de problemas.
- Razonamiento matemático y STEM, entrenado sobre aproximadamente 250.000 muestras de matemáticas y ciencia.
- Soporte de tool calling y function calling, según los tags del modelo (tool-use, function-calling).
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) según tags, aunque no se detalla si existe un modo "thinking" explícito con tokens de pensamiento separados.
- Capacidades de imagen a texto (image-text-to-text) según los tags del pipeline, aunque no se especifica el mecanismo de visión en la información disponible.
- Comportamiento "decensored": rechazos reducidos drásticamente (3/100 frente a 100/100 del original), lo que permite respuestas sin las negativas típicas de alineación.
- Transferencia cross-domain: la model card indica pequeñas mejoras en programación y uso de herramientas pese a no recibir SFT específico de código.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento, comparando directamente con el modelo base y midiendo la divergencia KL reportada (0,0422).
- Resolución de problemas matemáticos y STEM en entornos educativos o de investigación: el entrenamiento centrado en ~250.000 muestras de matemáticas y ciencia lo hace adecuado para tutoría automatizada y verificación de razonamientos paso a paso.
- Generación de código en pipelines de CI/CD: aunque no recibió SFT específico de código, la model card reporta mejoras en programación por transferencia; puede integrarse en revisión de parches y generación de tests con tool calling.
- Agentes autónomos con function calling: los tags de tool-use y function-calling permiten construir agentes que invocan APIs y ejecutan flujos multi-paso, con la ventaja de un modelo de 9B desplegable en hardware moderado.
- Atención al cliente y asistentes conversacionales sin restricciones de contenido: útil en dominios donde las negativas del modelo alineado resultan contraproducentes (por ejemplo, ficción, análisis de contenido sensible o investigación de seguridad), siempre con las salvaguardas externas adecuadas.
- Evaluación comparativa de modelos destilados: sirve como referencia para medir cuánto del rendimiento del profesor DeepSeek-V4-Pro se retiene en un alumno de 9B, y cómo afecta la ablación heretic a esa retención.
- Procesamiento multilingüe en seis idiomas (en, zh, ko, ja, es, ru): adecuado para aplicaciones de traducción, resumen y generación en esos mercados sin necesidad de modelos separados.

## Benchmarks y rendimiento

La información disponible solo incluye métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 9,4B parámetros, en FP16 se requieren aproximadamente 18,8 GB solo para pesos; en cuantización de 8 bits, unos 9,4 GB; en 4 bits, unos 4,7 GB, más overhead de contexto y KV cache.
- GPU recomendadas: no especificadas en la información. Por tamaño, cabría en GPUs de 24 GB (RTX 4090, A10G) en FP16 con contexto moderado, y en GPUs de 16 GB en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) en FP16, y en GPUs de 12-16 GB con cuantización, aunque no se confirma en la información.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), y por compatibilidad con safetensors, herramientas como vLLM o TGI; no se confirman llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El modelo base menciona MTP (Multi-Token Prediction) y evaluación en NVFP4, lo que sugiere optimizaciones de decodificación, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| isbank/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Razonamiento STEM destilado, decensored | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B (presumiblemente) | no disponible | Apache 2.0 (según base) | Razonamiento STEM destilado, alineado | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Versión 4B decensored del mismo linaje | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | no disponible | Fine-tune científico sobre este modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación heretic elimina los comportamientos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin las salvaguardas del original; requiere moderación externa en producción.
- La divergencia KL de 0,0422 respecto al original indica una deriva medible en la distribución de salidas; no es un cambio neutro y puede afectar a la calidad en tareas fuera del foco STEM.
- Riesgo de alucinación inherente a los modelos de 9B destilados; la destilación desde un profesor mayor no garantiza fidelidad factual.
- El entrenamiento se centró en matemáticas y STEM con ~250.000 muestras; el rendimiento en otras áreas (derecho, medicina, humanidades) puede ser inferior y no está documentado.
- Longitud de contexto no especificada: no se puede garantizar el manejo de conversaciones o documentos largos sin verificación empírica.
- Idiomas soportados limitados a seis (en, zh, ko, ja, es, ru); no se garantiza calidad en otros.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo decensored; la responsabilidad legal del uso recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (2026-11-13), lo que indica ausencia de validación comunitaria.
- No se detallan los formatos de cuantización disponibles ni si existe versión GGUF, lo que limita el despliegue en entornos de bajo consumo sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isbank/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Versión 4B decensored: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune científico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de decensoring): https://heretic-project.org
