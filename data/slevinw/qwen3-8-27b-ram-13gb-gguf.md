# slevinw/Qwen3.8-27B-RAM-13GB-GGUF

## Resumen

Qwen3.8-27B-RAM-13GB-GGUF es una compilación en formato GGUF del modelo Qwen3.8-27B, un LLM denso multimodal de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. Esta versión cuantizada, creada y validada por baa.ai, reduce el peso a 12,6 GB con una cuantización promedio de 3,73 bits (IQ3_M), lo que permite ejecutar un modelo de 27B en una GPU de 16 GB (por ejemplo, una NVIDIA T4) con una ventana de contexto de 8K tokens. El objetivo declarado es servir como "lector" fiable en sistemas de recuperación aumentada (RAG), donde los documentos recuperados son la fuente de verdad y el modelo debe interpretarlos sin depender de su memoria interna.

La relevancia de esta ficha radica en que aborda un problema práctico: cómo desplegar un modelo de gran tamaño en hardware asequible sin sacrificar la fidelidad a la evidencia recuperada. baa.ai ha validado que esta cuantización agresiva mantiene intactas las capacidades de lectura y deferencia a la evidencia respecto al modelo en precisión completa, con una precisión de 1,00 en ambas métricas y un rendimiento de 0,92–0,96 en razonamiento multi-hop. El modelo base, por su parte, destaca en codificación, workflows agénticos y automatización de oficina, aunque estas capacidades no están explícitamente confirmadas en la versión cuantizada.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y el formato GGUF es compatible con llama.cpp, Ollama, LM Studio y llama-cpp-python, lo que facilita su integración en entornos de producción. Esta ficha recoge las especificaciones técnicas, capacidades, casos de uso y limitaciones a partir de la información disponible en la model card y fuentes web asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (validado por baa.ai para GPU de 16 GB) |
| Tipos de cuantizacion | IQ3_M (promedio 3,73 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal de 27B parámetros, desarrollado por Alibaba, que según su repositorio oficial destaca en tareas de codificación, workflows agénticos y automatización de oficina. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El artículo de orcarouter.ai sugiere que el predecesor Qwen3.6-27B utilizaba una arquitectura híbrida con capas recurrentes, pero no se confirma si Qwen3.8-27B mantiene ese diseño; por tanto, se considera un transformer denso estándar a falta de más datos.

La versión GGUF aquí descrita es una cuantización IQ3_M realizada por baa.ai, que comprime los pesos del modelo base a un promedio de 3,73 bits. La compresión se ha validado específicamente para preservar la fidelidad en tareas de lectura basada en recuperación: cuando un pasaje recuperado contradice el conocimiento previo del modelo, este sigue el pasaje el 100% de las veces, y lee la respuesta correcta del contexto también el 100% de las veces. No se han publicado detalles sobre el proceso de calibración o fine-tuning posterior a la cuantización.

## Capacidades

- Generación de texto y razonamiento multi-hop: validado con una precisión de 0,92–0,96 en tareas de razonamiento de 4–5 saltos con contexto largo.
- Lectura fiel basada en recuperación: el modelo está optimizado para interpretar documentos recuperados como fuente de verdad, con una "deferencia a evidencia recuperada" de 1,00 y una "precisión de lectura desde contexto" de 1,00.
- Capacidades multimodales del modelo base: el Qwen3.8-27B original es multimodal (imagen y texto), pero no se especifica si la versión GGUF conserva estas capacidades; se recomienda asumir que solo procesa texto en este formato.
- Compatibilidad con herramientas de inferencia estándar: funciona con llama.cpp, llama-server (API compatible con OpenAI), Ollama, LM Studio y llama-cpp-python.
- Soporte de tool calling y agentes: no confirmado explícitamente en la versión cuantizada; el modelo base sí está orientado a agentes, pero la validación de baa.ai se centra en lectura fiel.

## Casos de uso

- Sistemas de recuperación aumentada (RAG) en producción: el modelo está diseñado para leer documentos recuperados y responder basándose exclusivamente en ellos, lo que lo hace adecuado para asistentes que consultan bases de conocimiento corporativas o legales. Su alta fidelidad a la evidencia reduce el riesgo de respuestas inventadas cuando el contexto es contradictorio con el conocimiento del modelo.
- Atención al cliente automatizada con contexto largo: con una ventana de 8K tokens, puede gestionar conversaciones multi-turno que incluyen historial extenso y documentos de ayuda, manteniendo coherencia y siguiendo las instrucciones del pasaje recuperado.
- Análisis de documentos legales o financieros: la capacidad de leer y razonar sobre contratos o informes extensos, extrayendo respuestas directamente del texto, es útil para tareas de revisión y cumplimiento normativo, siempre que se le proporcionen los documentos como contexto.
- Generación de informes basados en datos recuperados: puede resumir o extraer conclusiones de artículos, informes o páginas web previamente recuperados, garantizando que las afirmaciones estén respaldadas por el material de origen.
- Chatbots con conocimiento actualizado: al no depender de su memoria interna, el modelo puede responder sobre eventos recientes o información propietaria si se le inyectan los datos relevantes en el contexto, sin necesidad de reentrenamiento.
- Despliegue en entornos con recursos limitados: su tamaño de 12,6 GB permite ejecutarlo en GPUs de 16 GB (T4, RTX 4090) o incluso en CPU con llama.cpp, lo que facilita su uso en edge computing o en infraestructuras con restricciones de coste.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino métricas de validación propias de baa.ai centradas en fidelidad y lectura. Se presentan a continuación:

| Metrica | Valor |
|---|---|
| Deferencia a evidencia recuperada | 1,00 |
| Precisión de lectura desde contexto | 1,00 |
| Razonamiento multi-hop (4–5 saltos, contexto largo) | 0,92–0,96 |
| Tamaño del archivo | 12,6 GB |
| Promedio de bits | 3,73 (IQ3_M) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 13–16 GB según la cuantización IQ3_M y la longitud de contexto. Con 8K tokens cabe en una GPU de 16 GB con margen.
- GPU recomendadas: NVIDIA T4 (AWS g4dn.xlarge), RTX 4090, A10, o cualquier GPU con al menos 16 GB de VRAM. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, en GPUs de 16 GB como la RTX 4080/4090 o la RTX 4060 Ti de 16 GB. En GPUs de 12 GB podría funcionar con contexto reducido, pero no está validado.
- Opciones de despliegue: llama.cpp, llama-server (API OpenAI-compatible), Ollama, LM Studio, llama-cpp-python. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos concretos. En una T4, se espera una velocidad de generación de unos 10–20 tokens/s para un modelo de 27B cuantizado, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de la misma categoría en la información proporcionada. Como referencia, se compara con el modelo base sin cuantizar y con una cuantización estándar Q4_K_M (valores estimados, no medidos):

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | No disponible | FP16 | ~54 GB | Apache 2.0 |
| Qwen3.8-27B-RAM-13GB (este) | 26,9B | 8K (validado) | IQ3_M | 12,6 GB | Apache 2.0 |
| Qwen3.8-27B (Q4_K_M, hipotético) | 26,9B | No disponible | Q4_K_M | ~16 GB | Apache 2.0 |

No hay datos de rendimiento comparativo entre estas variantes, por lo que se indica que no hay comparativas disponibles.

## Limitaciones y advertencias

- La cuantización IQ3_M es agresiva y puede degradar el rendimiento en tareas que requieren razonamiento complejo o conocimiento factual no presente en el contexto, aunque la validación de baa.ai muestra que la fidelidad a la evidencia se mantiene.
- La ventana de contexto está limitada a 8K tokens en esta versión, lo que puede ser insuficiente para documentos muy extensos o conversaciones muy largas.
- Las capacidades multimodales del modelo base no están confirmadas en la versión GGUF; se asume que solo procesa texto.
- No se han publicado detalles sobre sesgos o alucinaciones específicos. Dado que el modelo está diseñado para seguir el contexto, el riesgo de alucinación se reduce en escenarios RAG, pero no se elimina.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B por si hubiera condiciones adicionales.
- La validación de baa.ai se centra en lectura fiel; no hay evidencia de rendimiento en tareas de codificación o agentes en esta versión cuantizada, aunque el modelo base sí las soporta.

## Enlaces

- Modelo en HuggingFace (slevinw): https://huggingface.co/slevinw/Qwen3.8-27B-RAM-13GB-GGUF
- Modelo en HuggingFace (baa-ai): https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-13GB-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo sobre requisitos de VRAM (sakutto.ai): https://sakutto.ai/en/articles/qwen3-8-27b
- Artículo sobre requisitos de VRAM (orcarouter.ai): https://www.orcarouter.ai/blog/qwen-3-8-27b-vram-requirements
