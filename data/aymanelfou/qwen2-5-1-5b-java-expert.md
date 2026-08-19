# AymanElFou/qwen2.5-1.5b-java-expert

## Resumen

El modelo `qwen2.5-1.5b-java-expert` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario AymanElFou. Está especializado en responder preguntas teóricas sobre programación en Java, cubriendo áreas como OOP, internals de la JVM, multithreading, colecciones, genéricos, patrones de diseño y características de Java 8+. El ajuste se realizó sobre un dataset de 500 preguntas y respuestas específicas de Java, y el modelo incorpora un guardrail que rechaza consultas fuera de este ámbito con el mensaje `"Question out of concept, just Java Questions"`.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros (aproximadamente 1.5B) y una ventana de contexto de 32.768 tokens. Está diseñado para ser ligero y rápido, apto para inferencia en CPU y GPU de gama media. Su relevancia radica en ofrecer un asistente especializado en Java con un coste computacional bajo, ideal para entornos educativos, generación de código y soporte técnico en proyectos Java.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio contiene los pesos completos en formato safetensors (3.1 GB), listos para usar con la biblioteca Transformers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, frances |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, capas de normalización RMSNorm y embeddings rotatorios (RoPE). El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation) sobre el modelo base `Qwen2.5-1.5B-Instruct`, que ya había sido preentrenado con hasta 18 billones de tokens. El dataset de ajuste consiste en 500 pares de preguntas y respuestas teóricas sobre Java, cubriendo temas como programación orientada a objetos, internals de la JVM, concurrencia, colecciones, genéricos, patrones de diseño y funcionalidades de Java 8+.

No se especifica si se utilizaron técnicas como RLHF o DPO durante el ajuste; el proceso parece ser un fine-tuning supervisado estándar sobre el conjunto de datos mencionado. La innovación principal es el guardrail integrado que limita el alcance del modelo a preguntas relacionadas con Java, reduciendo así el riesgo de respuestas fuera de dominio. No se han publicado detalles sobre la composición exacta del dataset ni sobre el número de épocas o hiperparámetros de entrenamiento.

## Capacidades

- Generacion de texto especializada en Java: responde preguntas teoricas sobre sintaxis, APIs, buenas practicas y conceptos avanzados del lenguaje.
- Generacion de codigo Java: puede producir fragmentos de codigo correctos y explicaciones detalladas para problemas de programacion en Java.
- Soporte de tool calling: no disponible, ya que el modelo base Qwen2.5-1.5B-Instruct no incluye entrenamiento especifico para function calling.
- Soporte de agentes y multi-step reasoning: limitado; el modelo puede razonar en varios pasos para explicar conceptos, pero no esta diseñado para orquestar agentes autonomos.
- Capacidades multilingues: el ajuste fino se realizo con datos en ingles y frances, por lo que el modelo responde en esos idiomas, aunque el base soportaba mas.
- Guardrail de dominio: rechaza preguntas no relacionadas con Java o programacion con el mensaje predefinido `"Question out of concept, just Java Questions"`.
- Capacidades especiales: no incluye vision, audio ni modo thinking; es exclusivamente texto.

## Casos de uso

- Tutoria y formacion en Java: el modelo puede actuar como asistente educativo para estudiantes que necesitan resolver dudas sobre conceptos de OOP, JVM o patrones de diseño. Su guardrail asegura que solo responda a temas de Java, evitando divagaciones.
- Generacion de codigo en entornos de desarrollo: integrable en IDEs o editores de codigo para sugerir implementaciones de metodos, clases o soluciones a problemas comunes de Java, gracias a su especializacion en el lenguaje.
- Soporte tecnico en proyectos Java: puede responder preguntas frecuentes de desarrolladores sobre APIs de Java 8+, concurrencia (por ejemplo, diferencias entre HashMap y ConcurrentHashMap) o generics, reduciendo la carga de los equipos de soporte.
- Preparacion de entrevistas tecnicas: util para candidatos que practican preguntas teoricas de Java; el modelo puede generar explicaciones claras y ejemplos de codigo.
- Documentacion automatica de codigo: dado que comprende conceptos avanzados, puede generar comentarios y documentacion tecnica para clases y metodos Java, aunque su contexto limitado (32K) requiere dividir archivos grandes.
- Chatbots especializados en Java: puede servir como base para un chatbot de atencion al desarrollador en foros o comunidades, respondiendo de forma consistente a consultas sobre el lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Dado que es un ajuste fino sobre un dataset reducido (500 ejemplos), es probable que su rendimiento en tareas generales sea inferior al del modelo base, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: en precision fp16, el modelo ocupa aproximadamente 3.1 GB de memoria (1.5B parametros x 2 bytes). Con cuantizacion int8 se reduce a ~1.6 GB, y en int4 a ~0.8 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16, por ejemplo NVIDIA GTX 1660 Super, RTX 3050 o superiores. En cuantizacion int8, una GPU con 2 GB es suficiente, como la NVIDIA MX450 o integradas modernas.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo medio y bajo. En CPU, puede ejecutarse con llama.cpp o Transformers, con latencia de unos pocos segundos por generacion.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y la biblioteca Transformers de HuggingFace. Para produccion, se recomienda vLLM o TGI para mayor throughput.
- Latencia y throughput estimados: en una GPU RTX 4090, la generacion de 512 tokens tardaria aproximadamente 1-2 segundos. En CPU moderna (por ejemplo, AMD Ryzen 9), podria tardar 10-20 segundos. No hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-1.5b-java-expert (este) | 1.5B | 32K | Apache 2.0 | Java (teorico y codigo) | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32K | Apache 2.0 | Generico, instrucciones | HuggingFace, Ollama |
| CodeGemma-2B | 2B | 8K | Gemma license | Generacion de codigo (multilenguaje) | HuggingFace |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Generacion de codigo (multilenguaje) | HuggingFace |

El modelo se diferencia del base por su especializacion exclusiva en Java, lo que puede ofrecer respuestas mas precisas y coherentes en ese dominio, aunque con una cobertura mucho mas limitada fuera de el. Comparado con CodeGemma o CodeLlama, es mas ligero y enfocado, pero carece de soporte para otros lenguajes y de herramientas de tool calling.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo rechaza cualquier pregunta no relacionada con Java, lo que limita su utilidad en contextos generales o multidisciplinares.
- Dataset de entrenamiento reducido: solo 500 ejemplos, lo que puede provocar alucinaciones o respuestas incompletas en temas Java poco representados en el conjunto de datos.
- Riesgo de alucinacion: al ser un modelo pequeno y con entrenamiento limitado, puede generar codigo incorrecto o explicaciones teoricas imprecisas, especialmente en temas avanzados o poco comunes.
- Limitaciones de idioma: aunque el base soportaba mas idiomas, el ajuste fino se realizo en ingles y frances, por lo que las respuestas en otros idiomas pueden ser deficientes o no estar disponibles.
- Contexto limitado: 32K tokens es adecuado para la mayoria de consultas, pero no para analizar proyectos Java completos o documentacion extensa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 tiene sus propias condiciones (Apache 2.0 tambien), por lo que no hay restricciones adicionales.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs externas ni ejecutar acciones, lo que limita su uso en pipelines automatizados complejos.
- Fecha de creacion futura (2026-08-15): el modelo se publico con una fecha posterior a la actual, lo que podria indicar un error en los metadatos o una publicacion planificada; verificar la validez del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AymanElFou/qwen2.5-1.5b-java-expert
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion oficial Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Documentacion Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
- Modelo Qwen2.5-1.5B en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-1.5B
