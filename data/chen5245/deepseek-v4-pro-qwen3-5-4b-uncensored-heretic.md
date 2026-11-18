# chen5245/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es una variante "abliterated" (sin mecanismos de rechazo) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, un fine-tune de razonamiento de Qwen3.5-4B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es chen5245, que aplicó la herramienta Heretic v2.0.0 para eliminar las capas de alineación y rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo base resuelve el problema de llevar la receta de destilación de razonamiento de un profesor grande (DeepSeek-V4-Pro) a la clase de 4B parámetros, con un enfoque en matemáticas y STEM entrenado sobre aproximadamente 250.000 muestras. Esta versión concreta añade la eliminación de rechazos: según la model card, las negativas caen de 99/100 en el original a 5/100 en esta variante, con una divergencia KL de 0,0378 respecto al modelo base.

Es relevante para investigadores y desarrolladores que necesitan un modelo compacto de razonamiento sin restricciones de contenido para investigación sobre alineación, generación de datos sintéticos o escenarios donde los rechazos del modelo base interfieren con la tarea. La arquitectura es transformer denso con 4.539.265.536 parámetros totales, licencia Apache 2.0 y soporte para seis idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con capacidad image-text-to-text segun tags |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; se menciona evaluacion MTP-Q8) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4,54B parámetros derivado de Qwen3.5-4B. El modelo base (Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B) se entrenó mediante destilación de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, siguiendo el mismo pipeline y mezcla de datos que la versión de 9B: aproximadamente 250.000 muestras centradas en matemáticas y razonamiento STEM, con SFT (supervised fine-tuning) y destilación de patrones de descomposición de problemas y soluciones multi-paso. Los tags indican también el uso de MTP (multi-token prediction) en la evaluación.

La innovación técnica de esta variante concreta es la ablación ARA aplicada con Heretic v2.0.0, que modifica las capas 16 a 32 (el tramo final de la red) con los siguientes parámetros: preserve_good_behavior_weight 0,9854, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 0,6587 y neighbor_count 10. Esta intervención quirúrgica sobre los pesos reduce drásticamente las respuestas de rechazo manteniendo, según el autor, un comportamiento general cercano al original (KL de 0,0378).

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas, heredado de la destilación de DeepSeek-V4-Pro.
- Razonamiento matemático y STEM reforzado por las ~250.000 muestras de entrenamiento.
- Capacidad image-text-to-text según los tags del repositorio (pipeline declarado text-generation, pero con tag de visión).
- Generación de código y soporte de tool calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y multi-step reasoning: el modelo base está orientado a razonamiento estructurado, aunque no se detalla soporte de agentes.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo "uncensored": sin rechazos en la gran mayoría de peticiones (5/100 refusals según la model card).
- Evaluación con MTP-Q8 mencionada en la model card.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo y comparar su distribución de respuestas con el original (KL 0,0378), útil para analizar qué información codifican las capas 16-32.
- Generación de datos sintéticos sin fricción: para crear datasets de instrucciones o de razonamiento donde los rechazos del modelo base descartarían ejemplos válidos, con 4,54B parámetros que caben en una sola GPU consumer.
- Tutoría de matemáticas y STEM: el entrenamiento sobre ~250.000 muestras de matemáticas y ciencias permite resolver problemas paso a paso con descomposición explícita, en un tamaño desplegable en local.
- Evaluación comparativa de destilación: sirve como punto de control para medir cuánto del rendimiento de DeepSeek-V4-Pro se retiene en la clase 4B, con una variante sin censura que elimina el sesgo de rechazo en las métricas.
- Procesamiento multilingüe en seis idiomas: atención al cliente o resumen de documentos en inglés, chino, coreano, japonés, español y ruso con un único modelo compacto.
- Prototipado rápido en entornos con recursos limitados: 9,3 GB en safetensors permiten cuantización a 8 o 4 bits para inferencia en GPUs de 8-16 GB, adecuado para demos y pruebas de concepto.
- Análisis de contenido sensible en investigación: estudio de sesgos y contenido dañino sin que el modelo se niegue a responder, siempre dentro de marcos éticos y legales.

## Benchmarks y rendimiento

La model card solo publica métricas comparativas de la ablación, no benchmarks estándar (MMLU, GSM8K, HumanEval):

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals (sobre 100) | 5/100 | 99/100 |
| Divergencia KL | 0,0378 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,1 GB en FP16/BF16 (4,54B × 2 bytes); ~4,6 GB en cuantización de 8 bits; ~2,3-2,5 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alto throughput; RTX 4090 (24 GB) para FP16 sin problemas.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), y por compatibilidad con safetensors cabría vLLM, llama.cpp u Ollama previa conversión a GGUF (no confirmado en la información).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (4B uncensored) | 4,54B | No disponible | Razonamiento math/STEM destilado, sin censura | Apache 2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | 4,54B (aprox.) | No disponible | Razonamiento math/STEM destilado, alineado | Apache 2.0 | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9B | No disponible | Misma receta en clase 9B, sin censura | No disponible | Hugging Face |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | ~4B | No disponible | Fine-tune científico sobre este modelo | No disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo sin censura: elimina los rechazos de forma deliberada, por lo que puede generar contenido dañino, ilegal o inexacto sin filtro. No apto para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación: es un modelo de 4,54B destilado; la destilación de un profesor grande no garantiza fidelidad factual y el tamaño limita la profundidad de razonamiento frente al profesor.
- La ablación ARA modifica capas 16-32 y puede degradar sutilmente capacidades no medidas (la KL de 0,0378 no descarta regresiones en tareas específicas).
- Longitud de contexto no documentada: no se puede asumir una ventana larga sin verificación empírica.
- Idiomas limitados a en, zh, ko, ja, es, ru; el rendimiento en español no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base podría arrastrar obligaciones adicionales no detalladas.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: sin validación comunitaria ni evidencia independiente de calidad.
- Soporte de tool calling y de visión no confirmado explícitamente en la documentación, pese a los tags.

## Enlaces

- Hugging Face: https://huggingface.co/chen5245/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Versión 9B sin censura: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune científico DeepThought STEM: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Heretic (herramienta de ablación): https://heretic-project.org
