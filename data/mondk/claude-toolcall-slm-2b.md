# mondk/claude-toolcall-slm-2B

## Resumen

El modelo `mondk/claude-toolcall-slm-2B` es un pequeño modelo de lenguaje (SLM, por sus siglas en inglés) de 2 mil millones de parámetros, desarrollado por el usuario `mondk` y publicado en HuggingFace. Su propósito declarado es la ejecución de llamadas a herramientas (tool calling), una capacidad que lo hace interesante para tareas de automatización y agentes, a pesar de su tamaño reducido. El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

El modelo se basa en la arquitectura SmolLM, como sugieren los datasets de entrenamiento utilizados (HuggingFaceTB/smollm-corpus y HuggingFaceTB/smoltalk), y ha sido ajustado específicamente para el seguimiento de instrucciones y la generación de llamadas a herramientas. Aunque la información oficial es escasa, un tercero (LLM Explorer) reporta una ventana de contexto de 8K tokens y un uso de VRAM de 3,4 GB, lo que lo hace viable para ejecutarse en GPUs de consumo. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para tareas de agente y tool calling, donde normalmente se requieren modelos mucho más grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM (transformer decoder-only) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K tokens (según LLM Explorer; no confirmado oficialmente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmoLM, un transformer decoder-only optimizado para eficiencia en modelos pequeños. El entrenamiento se realizó en varias etapas: primero un preentrenamiento con el corpus SmolLM (HuggingFaceTB/smollm-corpus) y The Stack (bigcode/the-stack), seguido de un ajuste fino (fine-tuning) con los datasets SmolTalk (HuggingFaceTB/smoltalk) y UltraFeedback (openbmb/UltraFeedback) para mejorar el seguimiento de instrucciones y la calidad de las respuestas. El dataset `mondk/claude-code-fable-5-traces.jsonl` se utilizó específicamente para enseñar al modelo a generar llamadas a herramientas en formato JSON, probablemente inspirado en los patrones de tool calling de Claude de Anthropic.

No se han publicado detalles sobre el número exacto de tokens de entrenamiento, la composición precisa del dataset ni si se aplicaron técnicas como RLHF o DPO. La información disponible es limitada y proviene principalmente de los metadatos de HuggingFace y de la model card, que es extremadamente breve.

## Capacidades

- Generación de texto y seguimiento de instrucciones básicas.
- Llamada a herramientas (tool calling): el modelo está entrenado para generar llamadas a funciones en formato JSON, lo que le permite interactuar con APIs y herramientas externas.
- Razonamiento simple y generación de código, gracias al entrenamiento con The Stack.
- Capacidades multilingües limitadas: aunque la model card indica solo inglés, el entrenamiento con SmolLM corpus podría dar cierta capacidad en otros idiomas, pero no está confirmado.
- No se mencionan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Automatización de tareas con APIs: el modelo puede generar llamadas a herramientas para interactuar con APIs REST, por ejemplo, para consultar el tiempo, buscar información o enviar mensajes. Su tamaño reducido permite ejecutarlo en entornos con recursos limitados.
- Asistentes de código en entornos de desarrollo: gracias a su entrenamiento con The Stack, puede sugerir fragmentos de código y ayudar con tareas de programación, aunque con menor precisión que modelos más grandes.
- Agentes conversacionales ligeros: puede gestionar diálogos multi-turno y ejecutar acciones externas mediante tool calling, adecuado para chatbots de soporte en inglés.
- Prototipado rápido de agentes: su pequeño tamaño y licencia permisiva lo hacen ideal para experimentar con arquitecturas de agentes y pipelines de tool calling antes de escalar a modelos mayores.
- Procesamiento de datos estructurados: puede extraer información de texto y formatearla en JSON, útil para pipelines de datos.
- Educación e investigación: sirve como modelo de referencia para estudiar el comportamiento de SLMs en tareas de tool calling y comparar con alternativas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento y no se encontraron evaluaciones independientes en la búsqueda web. El único dato externo proviene de LLM Explorer, que reporta un uso de VRAM de 3,4 GB y una ventana de contexto de 8K, pero no ofrece resultados de benchmarks.

## Requisitos de hardware

- VRAM estimada: 3,4 GB según LLM Explorer, lo que permite ejecución en GPUs de consumo como la RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 4090 o A100 permitirían mayor velocidad y batch size.
- Compatibilidad con consumer GPUs: sí, cabe en la mayoría de GPUs modernas de consumo.
- Opciones de despliegue: al estar en formato safetensors, puede ejecutarse con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponible, pero al ser un modelo de 2B, se espera una latencia baja en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tool calling | Disponibilidad |
|---|---|---|---|---|---|
| mondk/claude-toolcall-slm-2B | 2B | 8K | Apache 2.0 | Sí | HuggingFace |
| HuggingFaceTB/SmolLM-2-1.7B | 1,7B | 2K | Apache 2.0 | No nativo | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | Sí | HuggingFace |

El modelo se posiciona como una alternativa ligera con tool calling nativo, algo que no ofrecen otros SLMs de tamaño similar de forma predeterminada. Qwen2.5-1.5B-Instruct tiene un contexto mucho mayor y también soporta tool calling, pero con una licencia similar. SmolLM-2-1.7B no tiene tool calling nativo, por lo que requeriría ajuste adicional.

## Limitaciones y advertencias

- Información limitada: la model card es extremadamente breve y no proporciona detalles sobre el entrenamiento, benchmarks o limitaciones conocidas.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado con datos de internet, es propenso a alucinaciones y puede reflejar sesgos presentes en los datos de entrenamiento.
- Idioma: solo se garantiza el inglés; el rendimiento en otros idiomas es incierto.
- Contexto limitado: 8K tokens es suficiente para tareas simples, pero insuficiente para documentos largos o conversaciones extensas.
- Riesgo en producción: sin benchmarks publicados, no se recomienda su uso en entornos de producción críticos sin una evaluación exhaustiva previa.
- Dependencia de la calidad del dataset de tool calling: el dataset `claude-code-fable-5-traces.jsonl` no está documentado, por lo que la calidad de las llamadas a herramientas puede variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mondk/claude-toolcall-slm-2B)
- [Modelo base en safetensors](https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors)
- [Ficha en LLM Explorer](https://llm-explorer.com/model/mondk%2Fclaude-toolcall-slm-2B-safetensors,6U3qkHZXR7WLVamCq7ZL)
