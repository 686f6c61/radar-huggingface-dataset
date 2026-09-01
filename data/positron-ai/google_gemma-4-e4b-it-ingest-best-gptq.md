# positron-ai/google_gemma-4-E4B-it-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo `google/gemma-4-E4B-it`, realizada por Positron AI. El modelo base es un transformer multimodal de Google perteneciente a la familia Gemma 4, diseñado para tareas de texto e imagen, con capacidades de razonamiento extendido (Thinking Mode) y uso de herramientas. La cuantización reduce el peso del modelo a 4 bits con un group size de 64, lo que permite su ejecución en hardware con recursos limitados, como GPUs de consumo con 8 GB de VRAM.

La relevancia de esta versión cuantizada radica en que facilita el despliegue local de un modelo de última generación sin necesidad de infraestructura de servidor dedicada. El repositorio incluye los pesos en formato safetensors y está listo para su uso con la librería `transformers`. Según la información disponible, el modelo base tiene 7.941.101.386 parámetros totales, aunque la denominación "E4B" sugiere que podría tratarse de una arquitectura con 4 mil millones de parámetros activos, dato no confirmado en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, imagen-texto) |
| Parametros totales | 7.941.101.386 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit (group size 64, simétrica, sin desc_act) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un transformer multimodal que procesa tanto texto como imágenes. Pertenece a la familia Gemma 4 de Google, desarrollada a partir de la misma investigación que Gemini 3. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La cuantización GPTQ aplicada por Positron AI utiliza un group size de 64, cuantización simétrica, sin activación ordering (`desc_act` false), y un damp percent de 0.05. El proceso de calibración se realizó con 128 muestras de un conjunto de datos mixto, con una longitud de secuencia de 4096. La herramienta empleada fue GPTQModel 7.2.0 con transformers 5.11.0, torch 2.9.1 y CUDA 12.8.

## Capacidades

- Generación de texto conversacional y de código.
- Procesamiento multimodal: entrada de imágenes junto con texto (etiquetado como `image-text-to-text`).
- Soporte de tool calling / function calling, según la documentación del modelo base.
- Modo de razonamiento extendido (Thinking Mode), que permite respuestas más elaboradas en tareas complejas.
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- Asistente local en equipos de escritorio: gracias a su tamaño reducido (4-bit, ~4 GB de pesos), puede ejecutarse en una GPU de consumo con 8 GB de VRAM, ofreciendo respuestas conversacionales y de razonamiento sin conexión a la nube.
- Análisis de imágenes en tiempo real: al ser multimodal, puede recibir capturas de pantalla o fotografías y generar descripciones, extraer información o responder preguntas sobre el contenido visual.
- Agente autónomo con tool calling: integrado en un framework de agentes, puede invocar funciones externas (búsqueda web, APIs, ejecución de scripts) para completar tareas multi-paso.
- Generación de código asistida en entornos de desarrollo: el modelo puede sugerir fragmentos de código, explicar errores o refactorizar funciones, aprovechando su capacidad de razonamiento y su ventana de contexto (aunque la longitud exacta no está documentada).
- Prototipado rápido de aplicaciones de IA: al ser un modelo abierto con licencia Apache-2.0, permite experimentar sin costes de API y con control total sobre el despliegue.
- Chatbot de atención al cliente en entornos con privacidad estricta: al ejecutarse localmente, los datos de los usuarios no salen del servidor, lo que cumple requisitos de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado indica explícitamente que no se reportan métricas de rendimiento, precisión o perplejidad, y que los resultados de validación se gestionan internamente por Positron AI.

## Requisitos de hardware

- VRAM estimada: según la documentación del modelo base, es posible ejecutarlo con 8 GB de VRAM. Con la cuantización GPTQ 4-bit, los pesos ocupan aproximadamente 4 GB, por lo que se recomienda al menos 6-8 GB de VRAM para inferencia con overhead de activaciones.
- GPUs recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También puede ejecutarse en GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Opciones de despliegue: al ser un modelo GPTQ, es compatible con librerías como vLLM, TGI (Text Generation Inference) y, si se convierte a GGUF, con llama.cpp y Ollama. No se ha confirmado la compatibilidad directa con estas herramientas en la documentación.
- Latencia y throughput: no se proporcionan datos específicos. Se estima que en una GPU de gama media (RTX 4060) la generación de tokens puede rondar los 20-40 tokens por segundo, pero esta cifra es orientativa y no está verificada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A continuación se presenta una comparación estructural con otros modelos cuantizados de tamaño similar, basada únicamente en parámetros y licencia:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| google/gemma-4-E4B-it (GPTQ) | 7.94B totales | no disponible | Apache-2.0 | GPTQ 4-bit |
| Qwen2.5-7B-Instruct (GPTQ) | 7.6B | 32K | Apache-2.0 | GPTQ 4-bit |
| Llama-3.2-3B-Instruct (GPTQ) | 3.2B | 128K | Llama 3.2 Community | GPTQ 4-bit |

La comparación directa no es posible sin resultados de benchmarks. El modelo Gemma 4 destaca por su naturaleza multimodal, mientras que las alternativas son solo de texto.

## Limitaciones y advertencias

- La cuantización GPTQ puede introducir una ligera pérdida de precisión en comparación con el modelo original en coma flotante, especialmente en tareas de razonamiento complejo o generación de código.
- No se han documentado sesgos específicos del modelo base en la información proporcionada. Sin embargo, como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Existe riesgo de alucinación, especialmente en tareas de generación libre o cuando se le pide información factual no presente en su contexto.
- La longitud de contexto no está especificada, lo que limita la planificación de aplicaciones que requieran ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar el enlace de licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) para conocer restricciones adicionales impuestas por Google.
- El repositorio cuantizado no incluye métricas de evaluación, por lo que se recomienda validar el modelo en el caso de uso concreto antes de su despliegue en producción.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/positron-ai/google_gemma-4-E4B-it-ingest-best-gptq
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Blog de Google sobre Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Ficha del modelo en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
