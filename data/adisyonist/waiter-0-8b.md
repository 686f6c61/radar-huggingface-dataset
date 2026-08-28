# adisyonist/waiter-0.8B

## Resumen

Waiter-0.8B es un modelo de lenguaje pequeño (0,8B parámetros) desarrollado por Adisyonist AI, una empresa especializada en soluciones de inteligencia artificial para software de restaurantes y puntos de venta (POS). Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B mediante la técnica QLoRA, sobre un conjunto de datos de 532.856 ejemplos en 43 idiomas, diseñado específicamente para el enrutamiento de herramientas (tool-routing) en el contexto de la gestión de restaurantes.

El modelo responde a cada mensaje del usuario con un objeto JSON que contiene dos campos: `agents` (lista de funciones backend que la aplicación debe invocar en orden) y `answer` (texto que se muestra al usuario). Este enfoque permite integrar el modelo en sistemas de gestión de pedidos, mesas, reservas, inventario, personal y análisis de ventas mediante conversación natural, sin necesidad de generar código o ejecutar acciones directamente.

La relevancia de Waiter-0.8B radica en su tamaño compacto (menos de 1B parámetros), lo que permite su despliegue en entornos con recursos limitados, y en su especialización vertical, que consigue una precisión muy alta en la selección de herramientas (99,40% de exactitud ajustada en el conjunto de prueba). Está publicado bajo licencia Apache 2.0 y es compatible con el ecosistema Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible; depende del modelo base Qwen/Qwen3.5-0.8B |
| Tipos de cuantizacion | No especificados para inferencia; el entrenamiento uso QLoRA con 4-bit NF4 y double quantization |
| Idiomas soportados | 43 idiomas (segun la model card, sin lista especifica) |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Waiter-0.8B es un modelo denso basado en la arquitectura Transformer de Qwen3.5-0.8B, un modelo de lenguaje pequeño de la familia Qwen. El fine-tuning se realizó con QLoRA (Quantized Low-Rank Adaptation), una técnica que congela los pesos del modelo base y entrena adaptadores de bajo rango sobre una versión cuantizada a 4 bits (NF4) con double quantization. Los hiperparámetros de LoRA fueron r=16, alpha=32 y dropout=0.05, y el entrenamiento se llevó a cabo con el framework TRL SFTTrainer en precisión BF16.

El conjunto de datos de entrenamiento contiene 532.856 ejemplos de tool-routing en 43 idiomas, cubriendo escenarios de pedidos, mesas, reservas, stock, personal, menú y ventas. La salida del modelo está estrictamente formateada como JSON, con los campos `agents` y `answer`. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado (SFT). El modelo fue evaluado en un conjunto de prueba retenido (held-out) de 53.286 ejemplos.

## Capacidades

- Generación de respuestas en formato JSON estructurado para integración con sistemas de backend.
- Enrutamiento de herramientas (tool-routing): selección de funciones backend (agentes) a invocar según la intención del usuario.
- Soporte multilingüe: entrenado en 43 idiomas, aunque se reportan "raras desviaciones multilingües" en algunos casos.
- Gestión de conversaciones multi-turno en el dominio de restaurantes y POS.
- Capacidad de manejar múltiples intenciones en una sola consulta, aunque con posibles errores en cadenas de agentes complejas.
- Salida exclusivamente en JSON; no genera texto libre.
- No soporta tool calling estándar (como el de OpenAI), sino un mecanismo propio basado en la lista `agents`.
- No se mencionan capacidades de visión, audio ni razonamiento multimodal, a pesar de que el código de ejemplo usa `AutoModelForImageTextToText` (posiblemente un error del autor).

## Casos de uso

- Gestión de pedidos en restaurante: el modelo interpreta frases como "añade 2 lahmacun y 1 ayran a la mesa 5" y devuelve los agentes `prepareAddItems` y `executeTableAction`, permitiendo que el sistema POS ejecute la acción.
- Reservas de mesas: el usuario solicita una reserva y el modelo activa `prepareReservationCommand` y `executeReservationAction` para crear o modificar la reserva.
- Consulta de inventario: preguntas sobre stock de ingredientes o productos activan herramientas de consulta de inventario, devolviendo resultados con placeholders como `{stockResultList}`.
- Análisis de ventas: el modelo identifica peticiones de resumen de ventas y selecciona la herramienta `getSalesSummary`, aunque se advierte de posibles confusiones entre herramientas analíticas similares.
- Gestión de personal: asignación de turnos, consulta de horarios o altas de empleados mediante comandos conversacionales.
- Atención al cliente en el propio restaurante: el modelo puede responder a preguntas frecuentes o chit-chat devolviendo `agents: []` y una respuesta textual, aunque no está diseñado para conversación general.
- Integración en sistemas de pedidos por código QR: los clientes pueden interactuar con el modelo a través de la interfaz del restaurante para realizar pedidos o consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta métricas propias sobre un conjunto de prueba retenido de 53.286 ejemplos:

| Metrica | Valor |
|---|---|
| Adjusted agent exact accuracy | 99,40% |
| Raw agent exact accuracy | 98,81% |
| JSON validity | 99,41% |
| Answer exact-match | 92,57% |

Nota: la métrica "Answer exact-match" mide la coincidencia literal con la respuesta esperada; respuestas semánticamente correctas pero redactadas de forma diferente se consideran incorrectas. Los 316 JSON inválidos detectados se debieron principalmente al truncamiento por límite de tokens durante la generación, no a errores de selección de agentes.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~853M parámetros. En BF16, los pesos ocupan ~1,7 GB, por lo que se necesita al menos 2-3 GB de VRAM para inferencia (incluyendo overhead de activaciones y KV cache). Con cuantización a 4 bits, el uso de VRAM podría reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060, etc.) es suficiente para inferencia en BF16. Para mayor velocidad, se recomienda una GPU con soporte para bfloat16 (RTX 30xx o superior).
- Cabe en GPUs de consumo: sí, es perfectamente ejecutable en tarjetas de gama media e incluso en CPU con cuantización.
- Opciones de despliegue: compatible con Transformers (código de ejemplo incluido), vLLM, llama.cpp, Ollama y TGI, aunque no se mencionan explícitamente en la documentación. Se puede servir mediante endpoints compatibles con la API de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no se proporcionan datos específicos; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos en GPU moderna) y alta concurrencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo nicho (tool-routing para POS de restaurantes). Como referencia, se puede comparar con el modelo base Qwen/Qwen3.5-0.8B, aunque no se han publicado métricas de rendimiento de ese modelo en tareas de tool-routing. La comparación cualitativa es la siguiente:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| adisyonist/waiter-0.8B | 853M | No especificado | Apache 2.0 | Tool-routing para restaurantes/POS, 43 idiomas |
| Qwen/Qwen3.5-0.8B | ~853M | No especificado | Apache 2.0 | Modelo generalista |
| Otros modelos de ~0.8B (p. ej., Llama 3.2 1B, Gemma 2 2B) | 1-2B | 8k-128k | Varias | Generales, sin especialización en POS |

Waiter-0.8B se distingue por su salida JSON estructurada y su entrenamiento específico para un dominio vertical, lo que lo hace más preciso en esa tarea que un modelo generalista del mismo tamaño, a costa de perder generalidad.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en escenarios de restaurante/POS de Adisyonist; no debe usarse como asistente general.
- La salida es siempre JSON; no se debe esperar texto libre.
- Errores conocidos: confusión entre categorías y productos individuales, mezcla de herramientas analíticas similares, fallos en cadenas de agentes para consultas multi-intención, y desviaciones multilingües ocasionales.
- El límite de tokens de generación (384 en el ejemplo) puede truncar respuestas largas, produciendo JSON inválidos.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.5-0.8B para confirmar compatibilidad (aunque también es Apache 2.0).
- El modelo fue creado en agosto de 2026 (fecha futura según la metadata), lo que podría indicar un error en la fecha de publicación.
- No hay información sobre la lista exacta de los 43 idiomas soportados, ni sobre la calidad del multilingüismo en cada uno.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adisyonist/waiter-0.8B)
- [Perfil de Adisyonist AI en Hugging Face](https://huggingface.co/adisyonist)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Sitio web de Adisyonist](https://en.adisyonist.com/)
- [Modelo relacionado: waiter-1B-lora](https://huggingface.co/adisyonist/waiter-1B-lora)
