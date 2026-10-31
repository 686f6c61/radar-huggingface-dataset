# cecloud33/DeepSeek-R1-0528-Qwen3-8B-GGUF

## Resumen

DeepSeek-R1-0528-Qwen3-8B-GGUF es una cuantización en formato GGUF del modelo DeepSeek-R1-0528-Qwen3-8B, publicado por el usuario cecloud33 en Hugging Face. El modelo base fue destilado por DeepSeek AI a partir de DeepSeek-R1-0528, la versión actualizada (mayo de 2025) de su modelo de razonamiento R1, sobre la arquitectura de Qwen3-8B de Alibaba. Se trata de un modelo denso de 8,19 mil millones de parámetros especializado en razonamiento profundo, con salida de cadena de pensamiento explícita.

La relevancia de esta variante radica en que ofrece, en un tamaño ejecutable en hardware de consumo, parte de la capacidad de razonamiento de R1-0528, cuyo rendimiento según DeepSeek se aproxima a modelos de frontera como O3 y Gemini 2.5 Pro en tareas de matemáticas, programación y lógica. La versión 0528 mejora la profundidad de razonamiento (en AIME 2025 pasa del 70 % al 87,5 % de acierto, usando de media 23K tokens de pensamiento por pregunta frente a los 12K de la versión anterior), reduce la tasa de alucinaciones y mejora el soporte de function calling.

La cuantización GGUF permite ejecutar el modelo localmente con llama.cpp, Ollama o LM Studio, lo que lo hace especialmente atractivo para desarrolladores que necesitan razonamiento avanzado sin depender de APIs externas. El repositorio pesa 138,2 GB, lo que sugiere que incluye múltiples niveles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), destilado de DeepSeek-R1-0528 |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; la familia Qwen3-8B soporta 131.072 tokens |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la model card; el repo incluye varias, p. ej. Q4_K_XL mencionado para Ollama) |
| Idiomas soportados | No disponible (el modelo base opera principalmente en inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-R1-0528-Qwen3-8B, es una destilación de razonamiento: DeepSeek generó datos de cadena de pensamiento con DeepSeek-R1-0528 y entrenó con ellos a Qwen3-8B mediante fine-tuning supervisado, trasladando el comportamiento de razonamiento del modelo grande al modelo pequeño. La arquitectura subyacente es la de Qwen3-8B: un transformer decoder denso con 8,19 mil millones de parámetros. No es un modelo MoE, por lo que todos los parámetros se activan en cada pasada.

DeepSeek-R1-0528, el modelo maestro de la destilación, fue entrenado con aprendizaje por refuerzo a gran escala sobre la base DeepSeek-V3-Base, con mecanismos de optimización algorítmica en el post-training que aumentan la profundidad del razonamiento (de media 23K tokens de pensamiento por pregunta en AIME). La ficha del repositorio no detalla los tokens exactos usados en el entrenamiento de la variante destilada de 8B; no disponible en la información proporcionada.

La cuantización GGUF de este repositorio sigue el enfoque de Unsloth Dynamic 2.0, que aplica niveles de cuantización variables por capa para preservar la precisión en las capas más sensibles, según el autor con mejor exactitud que otras cuantizaciones estándar.

## Capacidades

- Razonamiento profundo con cadena de pensamiento explícita: el modelo genera primero un bloque de razonamiento (thinking) antes de la respuesta final, con especial fortaleza en matemáticas, lógica y programación.
- Generación de código: la versión 0528 mejora la experiencia de "vibe coding" y la calidad en tareas de programación.
- Function calling: soporte mejorado respecto a la versión anterior de R1.
- Matemáticas: alto rendimiento en benchmarks como AIME 2025 (87,5 % en el modelo maestro R1-0528).
- Conversación multi-turno con plantilla de chat específica de R1 (`<｜User｜>...<｜Assistant｜>`).
- Despliegue local: formato GGUF compatible con llama.cpp, Ollama y LM Studio.
- No se ha documentado en la ficha soporte de visión, audio ni capacidades multimodales: no disponible.

## Casos de uso

- Resolución de problemas matemáticos y preparación de oposiciones o concursos tipo AIME: el modelo puede dedicar miles de tokens a razonar paso a paso antes de responder, lo que aumenta la exactitud en problemas de dificultad competitiva.
- Asistencia de programación local y privada: puede generar, depurar y refactorizar código sin enviar código propietario a servicios externos, aprovechando las mejoras de la versión 0528 en coding.
- Agentes con function calling: su soporte mejorado de llamadas a herramientas permite integrarlo en pipelines que consulten APIs, bases de datos o ejecuten acciones, todo en local.
- Razonamiento lógico y planificación multi-paso: útil para descomponer tareas complejas, verificar argumentos o auditar razonamientos en flujos de trabajo de investigación.
- Chatbot conversacional de bajo coste: con temperatura recomendada de 0,6 y top_p de 0,95, funciona como asistente conversacional en entornos con GPU de consumo o incluso CPU potente.
- Prototipado y evaluación de modelos de razonamiento: al ser un modelo abierto con licencia MIT y formato GGUF, es idóneo para experimentar con patrones de razonamiento destilado y comparar cuantizaciones en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización GGUF en la información disponible. Como referencia del modelo base, DeepSeek reporta para DeepSeek-R1-0528 (modelo maestro, no la variante 8B) un acierto del 87,5 % en AIME 2025, frente al 70 % de la versión anterior, y un rendimiento general próximo a O3 y Gemini 2.5 Pro. No hay números publicados en la ficha para la variante Qwen3-8B destilada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8,19 B en GGUF, una cuantización Q4_K_XL ocupa aproximadamente 5-6 GB; cuantizaciones altas (Q8_0) rondan los 9 GB. El tamaño total del repo (138,2 GB) indica que incluye muchas variantes, pero solo se descarga la elegida.
- Cabe en GPUs de consumo: una RTX 4060 Ti de 16 GB o RTX 4090 ejecutan cómodamente cuantizaciones medias y altas; con Q4 también es viable en GPUs de 8 GB con descarga parcial a CPU/RAM.
- También ejecutable en CPU pura con RAM suficiente (8-16 GB libres) mediante llama.cpp, con latencias inferiores a las de GPU.
- Despliegue: Ollama (`ollama run hf.co/cecloud33/DeepSeek-R1-0528-Qwen3-8B-GGUF`), llama.cpp, LM Studio, y cualquier runtime compatible con GGUF; el modelo base safetensors funciona con vLLM, TGI o SGLang.
- Ajustes recomendados: temperatura 0,5-0,7 (0,6 recomendado), top_p 0,95. En llama.cpp hay que omitir el BOS, ya que se añade automáticamente.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware y de la longitud de la fase de razonamiento, que puede consumir decenas de miles de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B (este) | 8,19 B | 131.072 (según Qwen3-8B) | MIT | GGUF / safetensors | Razonamiento destilado de R1-0528 |
| Qwen3-8B (Alibaba) | 8,19 B | 131.072 | Apache 2.0 | safetensors / GGUF | Modelo base; razonamiento conmutable, sin destilación de R1-0528 |
| DeepSeek-R1-Distill-Qwen-7B | 7,6 B | 131.072 | MIT | safetensors / GGUF | Destilación de la versión anterior de R1 (enero 2025), menor rendimiento en razonamiento |
| Llama-3.1-8B-Instruct | 8 B | 131.072 | Licencia Llama 3.1 | safetensors / GGUF | Chat generalista fuerte, sin cadena de pensamiento explícita |

## Limitaciones y advertencias

- Sesgos: no disponible información específica; como todo LLM, puede reflejar sesgos presentes en los datos de entrenamiento.
- Alucinaciones: la versión 0528 reduce la tasa de alucinaciones respecto a la anterior, pero el riesgo persiste, especialmente en la fase de respuesta tras un razonamiento largo.
- Consumo de tokens: el razonamiento medio de ~23K tokens por pregunta (en el modelo maestro) implica respuestas lentas y costosas; en la variante 8B el consumo es menor pero sigue siendo elevado frente a modelos sin thinking.
- Idiomas: el modelo base está optimizado para inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Contexto: la ficha del repositorio no especifica la longitud de contexto; debe verificarse en la configuración del modelo base antes de despliegues con documentos largos.
- Licencia: MIT permite uso comercial sin restricciones relevantes; la cuantización de terceros (cecloud33) hereda la licencia del modelo base.
- Cuantización de terceros: este repo no es oficial de DeepSeek ni de Unsloth; para producción puede preferirse el repositorio oficial `unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF` o el de `deepseek-ai`.
- Plantilla de chat: es imprescindible usar la plantilla de R1; un chat template incorrecto degrada gravemente la calidad del razonamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cecloud33/DeepSeek-R1-0528-Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Paper de DeepSeek-R1: https://arxiv.org/pdf/2501.12948
- Guía de Unsloth para ejecutar R1-0528: https://docs.unsloth.ai/basics/deepseek-r1-0528
- Guía de ejecución local: https://docs.unsloth.ai/basics/deepseek-r1-0528-how-to-run-locally
- Colección de versiones R1 de Unsloth: https://huggingface.co/collections/unsloth/deepseek-r1-all-versions-678e1c48f5d2fce87892ace5
- Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Blog de Unsloth sobre R1-0528: https://docs.unsloth.ai/basics/deepseek-r1-0528-how-to-run-locally
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Chat oficial de DeepSeek: https://chat.deepseek.com/
