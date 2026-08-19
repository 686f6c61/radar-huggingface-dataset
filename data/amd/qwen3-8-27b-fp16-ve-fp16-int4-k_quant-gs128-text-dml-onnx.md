# amd/Qwen3.8-27B-fp16-ve-fp16-int4-k_quant-gs128-text-dml-onnx

## Resumen

El modelo `amd/Qwen3.8-27B-fp16-ve-fp16-int4-k_quant-gs128-text-dml-onnx` es una conversión del modelo multimodal Qwen3.8-27B de Alibaba (Qwen/Qwen3.8-27B) al formato ONNX Runtime GenAI, optimizada para ejecución en hardware AMD mediante DirectML. AMD lo publica como parte de su ecosistema de inferencia local, permitiendo ejecutar un modelo de 27 mil millones de parámetros con capacidades de visión y lenguaje en GPUs Radeon y procesadores Ryzen AI Max. La conversión mantiene la arquitectura original del modelo base, que incluye un encoder de visión y un decoder de texto, y aplica cuantización INT4 únicamente a la parte del decoder de texto, mientras que el encoder de visión y las embeddings se mantienen en FP16.

La relevancia de este modelo radica en que ofrece una vía práctica para desplegar un modelo de gran tamaño con soporte multimodal en hardware de consumo, sin necesidad de GPUs de centro de datos. El tamaño del repositorio es de 16,9 GB, lo que lo hace viable en GPUs con 24 GB de VRAM. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. La conversión no es un fine-tune, por lo que conserva las capacidades y limitaciones del modelo base, incluyendo un contexto de 262 000 tokens y soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de vision y decoder de texto (arquitectura Qwen3.8-27B, no se especifican detalles adicionales) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (segun la busqueda web) |
| Tipos de cuantizacion | INT4 (k_quant, block size 128) para el decoder de texto; FP16 para vision encoder y token embeddings |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx y .data) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina un encoder de vision (probablemente similar a los usados en la serie Qwen2.5-VL, aunque no se confirma) con un decoder de lenguaje. El modelo procesa tanto imagenes como texto, y genera respuestas de texto. La conversion de AMD no modifica la arquitectura; solo la serializa en formato ONNX con subgraficos separados: `vision.onnx` (encoder de vision FP16), `embedding.onnx` (token embeddings FP16) y `text.onnx` (decoder de texto INT4 con cuantizacion k_quant de 4 bits y grupo de 128). Las activaciones del decoder se mantienen en FP16.

Los datos de entrenamiento del modelo base no se detallan en la informacion proporcionada. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset y si se aplicaron tecnicas como RLHF o DPO. La conversion de AMD es puramente tecnica (exportacion a ONNX con Olive ModelBuilder) y no altera los pesos aprendidos. La tokenizacion original se adapto reemplazando expresiones Unicode por ByteLevel para compatibilidad con el motor C++ de ONNX Runtime GenAI, lo que puede introducir diferencias menores en la tokenizacion respecto al modelo original.

## Capacidades

- Generacion de texto multimodal: el modelo acepta entradas de imagen y texto, y genera respuestas de texto coherentes.
- Conversacion multi-turno: soporta chat con historial gracias a la plantilla de chat incluida (`chat_template.jinja`).
- Comprension de imagenes: el encoder de vision permite describir, analizar y responder preguntas sobre contenido visual.
- Soporte multilingue: entrenado principalmente en ingles y chino, con capacidad de generar texto en ambos idiomas.
- Integracion con ONNX Runtime GenAI: puede usarse con la API de Python de `onnxruntime_genai` para inferencia local en hardware AMD.
- No se confirma soporte de tool calling, function calling o agentes en la informacion disponible; estas capacidades dependen del modelo base, pero no se mencionan en la model card de la conversion.

## Casos de uso

- Asistente visual para documentacion tecnica: el modelo puede recibir capturas de pantalla o diagramas y generar explicaciones paso a paso, util en equipos de soporte que necesitan interpretar imagenes de errores o configuraciones.
- Analisis de imagenes medicas preliminar: aunque no es un modelo especializado, puede describir radiografias o fotografias clinicas para ayudar a personal sanitario en tareas de triaje, siempre con supervision humana.
- Chatbot de atencion al cliente con soporte de imagenes: permite a los usuarios enviar fotos de productos o recibos y recibir respuestas contextualizadas, aprovechando el contexto largo de 262k tokens para mantener conversaciones extensas.
- Generacion de descripciones para catalogos de comercio electronico: el modelo puede crear textos alternativos y descripciones de productos a partir de imagenes, acelerando el trabajo de redaccion.
- Herramienta educativa interactiva: estudiantes pueden subir imagenes de problemas matematicos o esquemas y obtener explicaciones detalladas en ingles o chino.
- Prototipado rapido de aplicaciones de vision por computador: desarrolladores pueden integrar el modelo en entornos de desarrollo local (con DirectML) para validar ideas antes de pasar a soluciones en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona que el modelo base Qwen3.8-27B tiene benchmarks publicados (segun la web de YottaLabs), pero no se incluyen valores numericos concretos en los fragmentos proporcionados. Tampoco se ofrecen comparaciones con otros modelos en la model card de la conversion. Por tanto, no es posible presentar una tabla de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,9 GB, pero en ejecucion se necesita memoria adicional para activaciones y buffers. Con el decoder INT4 (~12,5 GB) y los subgraficos FP16 (~3,4 GB), se estima un minimo de 20 GB de VRAM para una ejecucion comoda, aunque podria funcionar con 16 GB si se gestiona cuidadosamente la memoria.
- GPU recomendadas: AMD Radeon RX 7900 XTX (24 GB), Radeon PRO W7900 (48 GB) o procesadores AMD Ryzen AI Max con iGPU Radeon 8060S/8050S (hasta 32 GB de memoria unificada). La busqueda web de AMD confirma soporte oficial en estos dispositivos.
- En GPU de consumo: cabe en tarjetas con 24 GB de VRAM, como la RTX 4090 (aunque el soporte DirectML es limitado en NVIDIA, la conversion esta orientada a AMD; para NVIDIA se recomienda el formato original o cuantizaciones GGUF).
- Opciones de despliegue: se usa exclusivamente con ONNX Runtime GenAI compilado con DirectML. No se mencionan integraciones con vLLM, llama.cpp o Ollama para este formato especifico.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de 27B cuantizado a INT4, se espera una velocidad de generacion de entre 10 y 30 tokens por segundo en GPUs AMD de gama alta, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos. La conversion es especifica para DirectML y no tiene equivalentes publicados con los mismos subgraficos y cuantizacion. Como referencia cualitativa, se puede comparar con el modelo base original (Qwen/Qwen3.8-27B) en formato safetensors, que ofrece las mismas capacidades pero requiere mas VRAM (alrededor de 54 GB en FP16) y no esta optimizado para hardware AMD. Otras alternativas como Qwen2.5-VL-27B o Llama 3.1 8B no son directamente comparables por diferencias en tamano, contexto y licencia. Por tanto, se indica que la comparativa no esta disponible.

## Limitaciones y advertencias

- La conversion no es un fine-tune, por lo que hereda los sesgos y limitaciones del modelo base Qwen3.8-27B, que no se detallan en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas factualmente incorrectas, especialmente en tareas de vision donde la interpretacion de imagenes es subjetiva.
- La tokenizacion modificada (ByteLevel en lugar de Unicode property escapes) puede alterar ligeramente el comportamiento en textos con caracteres especiales o idiomas no soportados (solo en/zh).
- El contexto de 262k tokens es teorico; en la practica, el rendimiento puede degradarse con secuencias muy largas y el consumo de memoria aumenta linealmente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no mencionadas en la model card de la conversion.
- Para produccion, es necesario validar la calidad de las respuestas en el dominio especifico, ya que no hay benchmarks publicados que garanticen un nivel de rendimiento concreto.
- El formato ONNX con DirectML esta limitado a hardware AMD; en otras plataformas (NVIDIA, Apple Silicon) no funcionara sin adaptaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Qwen3.8-27B-fp16-ve-fp16-int4-k_quant-gs128-text-dml-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia de ejecucion local (Swfte): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Analisis y benchmarks (Kingy.ai): https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
