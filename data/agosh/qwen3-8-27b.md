# agosh/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, publicado con licencia Apache 2.0. Se trata de la generación más reciente de la familia abierta Qwen, construida sobre la base arquitectónica de Qwen3.5, y está diseñado como un modelo compacto y fácil de desplegar que integra de forma nativa comprensión de imágenes y vídeo, además de un control flexible del modo de razonamiento. Su relevancia actual radica en que combina capacidades de agente de largo alcance, codificación de nivel profesional y visión multimodal en un tamaño que puede ejecutarse en hardware local con cantidades moderadas de VRAM.

El modelo emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 000 000. Incluye entrenamiento con predicción multi-token (MTP) y un modo de pensamiento activable por petición, con parámetros para ajustar el esfuerzo de razonamiento y conservar el contexto de razonamiento histórico. Los pesos están disponibles en formato safetensors y son compatibles con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con vision encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (se menciona ejecución con 17 GB de VRAM, lo que sugiere cuantizaciones de 4 bits, pero no se especifican oficialmente) |
| Idiomas soportados | No disponible (no se indica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de lenguaje causal con un codificador de visión integrado. La arquitectura del modelo de lenguaje sigue un patrón híbrido: el layout oculto se organiza en 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, mientras que la Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión oculta es 5120, la dimensión intermedia del FFN es 17 408, y el embedding de tokens tiene un tamaño de 248 320 (con padding). El modelo cuenta con 64 capas.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. Se incluye una técnica de predicción multi-token (MTP) entrenada con múltiples pasos, lo que permite al modelo predecir varios tokens futuros simultáneamente y mejorar la eficiencia de generación. El modelo soporta un modo de pensamiento flexible: el modo de razonamiento está activado por defecto y puede desactivarse por petición, con un parámetro `reasoning_effort` para ajustar la profundidad del razonamiento y `preserve_thinking` para conservar el contexto de razonamiento de mensajes históricos. No se han publicado detalles específicos sobre la composición del dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: soporta tareas complejas de razonamiento multi-paso, con modo de pensamiento activable y ajustable mediante `reasoning_effort`.
- Codificación: rendimiento destacado en tareas de codificación, incluyendo codificación agéntica en terminal (Terminal Bench 2.1) y resolución de problemas de software (DeepSWE).
- Visión y lenguaje: comprensión nativa de imágenes y vídeo, desde diagramas STEM y documentos hasta vídeos de escala horaria.
- Agentes y ejecución de tareas: planificación autónoma mejorada y manejo de retroalimentación del entorno, orientado a tareas agénticas de largo alcance.
- Tool calling / function calling: no se menciona explícitamente en la información disponible, pero la compatibilidad con vLLM y SGLang sugiere soporte estándar para tool calling en esos entornos.
- Multilingüismo: no se especifican idiomas soportados en la documentación disponible.
- Control de razonamiento: posibilidad de desactivar el modo de pensamiento por petición y conservar el contexto de razonamiento histórico.

## Casos de uso

- Asistente de codificación local: el modelo puede ejecutarse en una GPU de consumo con 17 GB de VRAM (según reseñas), lo que permite integrarlo en entornos de desarrollo como un copiloto de código con capacidades agénticas, capaz de ejecutar tareas en terminal y resolver incidencias de software de forma autónoma.
- Automatización de oficina: gracias a su comprensión de documentos y su capacidad de razonamiento, puede procesar informes, extraer datos de tablas e imágenes y generar resúmenes o respuestas en flujos de trabajo empresariales.
- Análisis de vídeo de larga duración: su ventana de contexto de 262K tokens y su soporte nativo de vídeo permiten analizar vídeos de hasta una hora de duración, por ejemplo para transcripción, resumen o detección de eventos.
- Agentes de investigación autónoma: con su capacidad de planificación multi-paso y manejo de retroalimentación del entorno, puede utilizarse como agente que navega por documentación, ejecuta consultas y compila resultados en entornos de investigación.
- Asistencia en atención al cliente multimodal: puede procesar capturas de pantalla, imágenes de productos o vídeos enviados por usuarios, combinando visión y lenguaje para resolver incidencias en conversaciones de múltiples turnos.
- Desarrollo de aplicaciones RAG con contexto largo: su ventana de 262K tokens permite indexar y consultar documentos extensos sin necesidad de chunking agresivo, adecuado para sistemas de pregunta-respuesta sobre manuales técnicos o bases de conocimiento corporativas.

## Benchmarks y rendimiento

Los resultados disponibles provienen de la búsqueda web y de la tabla parcial de la model card. Se presentan los datos publicados, sin inventar valores adicionales.

| Benchmark | Qwen3.8-27B |
|---|---|
| DeepSWE (resolución de issues de software) | 42.2 |
| Terminal Bench 2.1 (Terminus) (codificación agéntica en terminal) | 73.0 |
| OSWorld (tareas de sistema operativo) | 84.3 |

La model card incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores de esos modelos no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la documentación disponible.

## Requisitos de hardware

- VRAM estimada: según reseñas, el modelo puede ejecutarse con 17 GB de VRAM, lo que sugiere cuantización de 4 bits (posiblemente GPTQ o AWQ). Para FP16 o BF16 completo se requerirían aproximadamente 56 GB de VRAM.
- GPU recomendadas: para cuantización de 4 bits, una RTX 4090 (24 GB) o RTX 4080 (16 GB) sería suficiente; para precisiones más altas, se necesitarían GPUs de datacenter como A100 (80 GB) o H100 (80 GB).
- Compatibilidad con GPU de consumo: sí, con cuantización. Una RTX 3090 (24 GB) o RTX 4090 (24 GB) puede ejecutar el modelo en 4 bits con margen para contexto largo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, llama.cpp (si se generan pesos GGUF), Ollama (si se publica en ese formato).
- Latencia y throughput: no se han publicado cifras oficiales. La arquitectura híbrida con Gated DeltaNet y MTP sugiere una generación más rápida que un transformer denso clásico, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Sí (imagen y vídeo) | Apache 2.0 | Modelo objeto de esta ficha |
| Qwen3.6-27B | 27B | No disponible | No (según la model card, Qwen3.8 es el que añade visión) | Apache 2.0 | Predecesor directo, sin visión nativa |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo propietario de mayor tamaño, aparece en la tabla comparativa |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Modelo de otra familia, aparece en la tabla comparativa |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo propietario, aparece en la tabla comparativa |

Los datos de Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max no están disponibles en la información proporcionada, por lo que la comparativa se limita a lo publicado en la tabla de la model card, sin valores numéricos.

## Limitaciones y advertencias

- La información sobre idiomas soportados no está publicada; se desconoce la cobertura multilingüe real del modelo.
- No se han publicado resultados de benchmarks estándar de texto (MMLU, HumanEval, GSM8K), lo que dificulta la comparación directa con otros modelos en tareas generales.
- El modelo está diseñado con el modo de pensamiento activado por defecto, lo que puede aumentar la latencia en peticiones simples si no se desactiva explícitamente.
- No se especifican los sesgos potenciales del modelo ni los riesgos de alucinación; al ser un modelo de 27B, es probable que presente alucinaciones en dominios especializados, aunque no hay datos publicados.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero el modelo puede estar sujeto a políticas de uso aceptable de Alibaba que no se detallan en la documentación.
- El repositorio en HuggingFace (agosh/Qwen3.8-27B) no es el repositorio oficial de Alibaba; el repositorio oficial está en GitHub (AlibabaCloud-Official/Qwen3.8-27B). Se recomienda verificar la procedencia de los pesos antes de su uso en producción.
- La extensión de contexto hasta 1M tokens puede requerir técnicas de interpolación posicional o procesamiento específico que no están documentadas en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/agosh/Qwen3.8-27B
- GitHub (oficial): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía completa (blog): https://lovableapp.org/blog/qwen3-8-27b
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Reseña técnica (Geeky Gadgets): https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Guía de uso (AIMadeTools): https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
