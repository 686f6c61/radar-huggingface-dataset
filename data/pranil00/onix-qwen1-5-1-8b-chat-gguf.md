# pranil00/ONIX-Qwen1.5-1.8B-Chat-GGUF

## Resumen

ONIX-Qwen1.5-1.8B-Chat-GGUF es una cuantización en formato GGUF del modelo Qwen1.5-1.8B-Chat de Alibaba Cloud, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". El modelo base es un transformer decoder-only de 1.836.828.672 parámetros (aproximadamente 1,8 mil millones), diseñado para generación de texto conversacional. Esta versión concreta aplica la cuantización Q5_K_M mediante llama.cpp, reduciendo el peso de los ficheros a 1,28 GB, lo que facilita su despliegue en hardware de consumo.

La relevancia de esta ficha radica en que permite ejecutar un modelo conversacional de tamaño contenido en equipos con recursos limitados, sin necesidad de GPUs de datacenter. Al estar basado en Qwen1.5-1.8B-Chat, hereda las capacidades del modelo original: conversación multi-turno, generación de texto y soporte multilingüe básico, aunque con la degradación inherente a la cuantización de 5 bits.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 27 de noviembre de 2026. La model card es extremadamente escueta y no aporta información sobre datos de entrenamiento, benchmarks ni idiomas soportados más allá de lo que se deduce del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen1.5-1.8B-Chat) |
| Parametros totales | 1.836.828.672 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen1.5-1.8B-Chat soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q5_K_M (unica incluida en este repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen1.5-1.8B-Chat: un transformer decoder-only con atención multi-cabeza estándar, tal como se describe en la familia Qwen1.5. No se dispone de información detallada en la model card sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni sobre la composición exacta del dataset de entrenamiento. Tampoco se documenta si el modelo base utilizó RLHF, DPO u otras técnicas de alineación, aunque por su denominación "Chat" se infiere que pasó por algún proceso de ajuste conversacional.

La innovación técnica de esta publicación concreta es la cuantización Q5_K_M realizada con llama.cpp, verificada según el autor mediante conversión auténtica de tensores y cuantizada en Apple Silicon con Metal. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas. El proceso de cuantización a 5 bits con bloque K_M busca un equilibrio entre tamaño (1,28 GB) y fidelidad respecto a los pesos originales en fp16/bf16.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste Chat del modelo base.
- Razonamiento básico y respuesta a instrucciones en formato conversacional.
- Generación de código y matemáticas a nivel de modelo pequeño (no se documentan benchmarks que lo confirmen).
- Capacidades multilingües: no confirmadas en la información disponible; el modelo base Qwen1.5 tiene soporte multilingüe, pero esta ficha no lo verifica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión ni audio.
- Compatible con endpoints (tag `endpoints_compatible`) según los tags del repositorio.

## Casos de uso

- Asistente conversacional local en equipos de sobremesa: al ocupar 1,28 GB en Q5_K_M, puede ejecutarse con Ollama o llama.cpp en portátiles sin GPU dedicada, ofreciendo respuestas conversacionales sin conexión a internet.
- Prototipado rápido de chatbots: permite validar flujos de conversación multi-turno en fase de desarrollo antes de migrar a modelos mayores, gracias a su reducido coste de despliegue.
- Generación de texto en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para borradores de documentos internos.
- Educación y experimentación: útil para aprender a desplegar modelos GGUF con llama.cpp y Ollama en cursos o talleres, dado su pequeño tamaño y licencia permisiva.
- Tareas de resumen y reescritura de textos cortos: el modelo puede procesar y condensar párrafos en aplicaciones de escritorio o plugins de editor.
- Integración en aplicaciones de línea de comandos: mediante `llama-cli` o la API de Ollama, se puede incorporar como motor de texto en scripts y herramientas de automatización.
- Generación de respuestas en asistentes de documentación técnica: para consultas simples sobre fragmentos de texto, siempre que se acepte la calidad limitada de un modelo de 1,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB en Q5_K_M (peso de 1,28 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores; también en Apple Silicon vía Metal.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-Qwen1.5-1.8B-Chat-GGUF`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen1.5-1.8B-Chat-GGUF (este) | 1,84B | No disponible | Apache 2.0 | GGUF Q5_K_M | Hugging Face (0 descargas) |
| Qwen/Qwen1.5-1.8B-Chat (base) | 1,84B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | safetensors | Hugging Face (oficial) |
| Modelos de ~1-2B en GGUF de otras familias | ~1-2B | Variable | Variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias de calidad frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base puede heredar sesgos de sus datos de entrenamiento, no verificados aquí.
- Riesgo de alucinación: presente en modelos de 1,8B, especialmente en tareas de razonamiento complejo o conocimiento factual; la cuantización Q5_K_M puede introducir degradación adicional frente a fp16.
- Limitaciones de contexto o idioma: no se confirman los idiomas soportados ni la longitud de contexto efectiva tras la cuantización; la model card no los detalla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen1.5-1.8B-Chat, que también es Apache 2.0 según los tags.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y la model card es mínima; no hay evidencia de validación por parte de la comunidad. La fecha de creación (2026) y la falta de documentación sugieren precaución antes de usarlo en entornos críticos.
- Solo se incluye la cuantización Q5_K_M; no hay opciones Q4, Q8 ni fp16 en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen1.5-1.8B-Chat-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-1.8B-Chat
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime de despliegue): https://ollama.com
