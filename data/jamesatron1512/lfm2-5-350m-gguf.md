# jamesatron1512/LFM2.5-350M-GGUF

## Resumen

LFM2.5-350M es un modelo de lenguaje de 350 millones de parámetros desarrollado por Liquid AI, distribuido aquí en formato GGUF cuantizado a 4 bits (Q4_K_M) por el usuario jamesatron1512 para su uso directo en Ollama, llama.cpp y dispositivos edge. El modelo original emplea una arquitectura híbrida que combina convoluciones cortas de doble compuerta con atención estructurada, lo que permite un escalado computacional casi lineal y una huella de memoria reducida frente a los transformers densos convencionales.

Esta versión cuantizada ocupa aproximadamente 219 MB, lo que lo hace apto para ejecutarse en CPU, GPU de gama baja o incluso en dispositivos móviles y sistemas embebidos. Su ventana de contexto alcanza hasta 128 000 tokens (aunque el Modelfile de Ollama la fija por defecto en 4096), y utiliza la plantilla de chat ChatML. Es un modelo orientado a conversación y generación de texto, con licencia propia de Liquid AI (lfm1.0) que impone restricciones de uso comercial.

La relevancia de este modelo reside en su tamaño extremadamente reducido combinado con una arquitectura moderna, lo que lo convierte en una opción interesante para prototipado rápido y despliegue en entornos con recursos muy limitados, donde modelos de mayor escala no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: convoluciones cortas de doble compuerta + atención estructurada |
| Parametros totales | 354 483 968 (350M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 128 000 tokens (por defecto 4096 en Ollama) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); pueden existir otras en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, restricciones comerciales) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea una arquitectura híbrida que integra capas de convolución corta con doble compuerta (double-gated short convolutions) junto con mecanismos de atención estructurada. Este diseño busca superar las limitaciones de los transformers puros en cuanto a escalabilidad de la atención, reduciendo la complejidad computacional a un crecimiento casi lineal con la longitud de la secuencia. La combinación de convoluciones locales y atención global permite capturar tanto dependencias de corto como de largo alcance, manteniendo un coste de memoria bajo.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han proporcionado en la información disponible. La versión cuantizada Q4_K_M es una conversión del modelo original en safetensors realizada por el autor del repositorio, que ha configurado el Modelfile de Ollama con la plantilla ChatML y un system prompt vacío por defecto para evitar fijaciones en el tamaño del modelo.

## Capacidades

- Generación de texto conversacional: el modelo está optimizado para diálogo multi-turno mediante la plantilla ChatML, con soporte de system prompt.
- Razonamiento básico y comprensión de instrucciones: apto para tareas de respuesta a preguntas y seguimiento de instrucciones simples.
- Ejecución en edge: su tamaño reducido y cuantización permiten inferencia en CPU, GPU de baja gama y dispositivos embebidos.
- Compatibilidad con Ollama y llama.cpp: se puede invocar mediante una única línea de comandos o a través de la API REST de Ollama.
- Ventana de contexto ampliable: soporta hasta 128k tokens, aunque el valor por defecto en Ollama es 4096.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Chatbots locales sin conexión: el modelo puede integrarse en aplicaciones de escritorio o móviles para ofrecer un asistente conversacional que funcione offline, gracias a su tamaño de 219 MB y su compatibilidad con Ollama.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden usar este modelo para validar flujos de conversación o generación de texto antes de migrar a modelos más grandes, reduciendo costes de computación.
- Asistentes de documentación técnica: dado su soporte de contexto largo (hasta 128k), puede resumir o extraer información de documentos extensos en dispositivos con poca memoria.
- Clasificación y etiquetado de texto: su capacidad de seguir instrucciones permite usarlo para categorizar correos, tickets o comentarios en entornos con recursos limitados.
- Generación de respuestas en sistemas de atención al cliente: puede gestionar consultas frecuentes con un tono conversacional, aunque su tamaño limita la complejidad de las respuestas.
- Educación y experimentación: ideal para estudiantes o investigadores que quieran explorar arquitecturas híbridas sin necesidad de hardware potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M y 219 MB de peso, la inferencia puede ejecutarse en CPU con unos 512 MB de RAM libre; en GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: NVIDIA GTX 1050 Ti o superior, o cualquier GPU integrada moderna. También funciona en Apple Silicon y Raspberry Pi 5 (con limitaciones de velocidad).
- Compatibilidad con consumer GPU: sí, ampliamente. Incluso puede ejecutarse en memoria compartida de iGPU.
- Opciones de despliegue: Ollama (comando directo), llama.cpp, o mediante la API REST de Ollama desde Python u otros lenguajes.
- Latencia y throughput: no hay datos publicados. En CPU moderna (8 núcleos) se espera una generación de 10-20 tokens/segundo; en GPU dedicada puede superar los 50 tokens/segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M (GGUF) | 350M | 128k | lfm1.0 (restrictiva) | GGUF | Arquitectura híbrida, edge |
| TinyLlama 1.1B | 1.1B | 2048 | Apache 2.0 | GGUF | Transformer denso, más grande y con más datos |
| Qwen2.5-0.5B | 500M | 32k | Apache 2.0 | GGUF | Transformer denso, buen multilingüe |
| Phi-2 (2.7B) | 2.7B | 2048 | MIT | safetensors | Mayor capacidad, pero más pesado |

La comparativa se basa en características generales, ya que no se dispone de benchmarks. LFM2.5-350M destaca por su contexto largo y arquitectura híbrida, pero su licencia lfm1.0 es más restrictiva que las Apache 2.0 de los competidores.

## Limitaciones y advertencias

- Tamaño reducido: con solo 350M de parámetros, el modelo tiene una capacidad limitada para razonamiento complejo, generación de código avanzado o conocimientos extensos. Puede producir respuestas incoherentes en temas especializados.
- Alucinaciones: como todo LLM, es propenso a generar información falsa o inventada, especialmente con preguntas ambiguas o fuera de su distribución de entrenamiento.
- Idiomas no documentados: no se ha especificado qué idiomas soporta; probablemente esté optimizado para inglés, y su rendimiento en otros idiomas (incluido el español) es incierto.
- Licencia lfm1.0: es una licencia propia de Liquid AI con restricciones de uso comercial. Antes de desplegar en producción, es imprescindible revisar los términos completos en el enlace de la licencia.
- Contexto por defecto bajo: aunque el modelo soporta 128k, el Modelfile de Ollama fija 4096 tokens por defecto; es necesario ajustarlo manualmente si se necesita más contexto.
- Sin benchmarks públicos: no hay métricas de rendimiento que permitan comparar objetivamente con otros modelos; se recomienda evaluar en el dominio de aplicación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jamesatron1512/LFM2.5-350M-GGUF
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Web de Liquid AI (no confirmada): no disponible en la información proporcionada
