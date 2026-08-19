# SmallAICreator/Aurora-Instruct-Multitool

## Resumen

Aurora-Instruct-Multitool es un modelo de lenguaje pequeño de 700 millones de parámetros desarrollado por SmallAICreator (también conocido como UltraLabs) que se especializa en la llamada a herramientas (tool calling). Está basado en AuroraGPT-700M, un transformer estilo Llama entrenado desde cero con aproximadamente 22 400 millones de tokens de pretrain y posterior ajuste supervisado. El modelo ha sido afinado mediante LoRA para utilizar cinco herramientas: calculadora, búsqueda web, búsqueda en base de conocimiento, ejecución de JavaScript y recuperación de URLs. Su diseño busca que el modelo razone sobre cuándo usar una herramienta y cómo construir los argumentos correctos, mientras que el conocimiento factual se delega en las propias herramientas. Es relevante porque demuestra que es posible implementar capacidades de tool calling en modelos muy pequeños que pueden ejecutarse en CPU de portátiles o incluso teléfonos, con un peso de aproximadamente 0,75 GB en cuantización Q8_0. La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (hidden 1536, 27 capas, 12 cabezas de atención, 2 cabezas KV, vocabulario de 32k) |
| Parametros totales | 707 480 064 (707M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, f16 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y f16) |

## Arquitectura y entrenamiento

Aurora-Instruct-Multitool es un modelo denso de arquitectura transformer estilo Llama, con 27 capas, dimensión oculta de 1536, 12 cabezas de atención y 2 cabezas KV, y un vocabulario de 32 000 tokens. El modelo base AuroraGPT-700M fue entrenado desde cero con aproximadamente 22 400 millones de tokens de pretrain y un ajuste supervisado posterior. Sobre este modelo base se aplicó un LoRA con r=16 y α=32, que añadió unos 11,5 millones de parámetros entrenables (1,6 % del total), entrenado en una CPU de portátil (Intel i5-1335U) con un conjunto de datos de 4150 ejemplos. La mezcla de entrenamiento incluye 2000 ejemplos de llamadas a múltiples herramientas con esquemas de argumentos correctos y manejo de resultados, 900 ejemplos de chat multi-turno general (SmolTalk), 600 conversaciones con referencias a contexto previo, 400 ejemplos de restricción (no llamar herramientas innecesariamente) y 250 ejemplos con emojis ocasionales. Tras el entrenamiento, el LoRA se fusionó en el modelo base y se convirtió a formato GGUF.

## Capacidades

- Generación de texto y conversación multi-turno con resolución de referencias a turnos anteriores (pronombres, demostrativos, etc.).
- Llamada a herramientas (tool calling) con cinco herramientas específicas: calculadora, búsqueda web, búsqueda en base de conocimiento, ejecución de JavaScript y recuperación de URLs.
- Capacidad de restricción: responde directamente a preguntas simples sin invocar herramientas innecesariamente.
- Emite bloques `<tool_call>` con formato JSON para que la aplicación ejecute la herramienta y devuelva el resultado como `<tool_response>`.
- Uso ocasional de emojis (no controlado).
- No incluye capacidades de visión, audio ni razonamiento multimodal.

## Casos de uso

- Asistente personal en dispositivos con recursos limitados: el modelo puede ejecutarse en CPU de portátiles o teléfonos y consultar información actual mediante la herramienta de búsqueda web, lo que lo hace adecuado para asistentes offline o de bajo consumo.
- Chatbot de atención al cliente con base de conocimiento interna: la herramienta `search_knowledge_base` permite recuperar respuestas de documentos propios de la empresa, manteniendo el contexto multi-turno de la conversación.
- Herramienta de productividad para cálculos exactos: la herramienta `calculator` garantiza resultados aritméticos precisos, evitando errores comunes del modelo en operaciones numéricas.
- Agente de automatización simple: la herramienta `execute_javascript` permite ejecutar código JavaScript para tareas como transformación de datos o validación de entradas, siempre que la aplicación gestione el bucle de ejecución.
- Sistema de extracción de información: la herramienta `fetch_url` puede recuperar contenido de una página web y el modelo puede resumirlo o extraer datos relevantes, útil para scraping ligero o monitorización de noticias.
- Prototipo de investigación en tool calling: por su tamaño reducido y licencia Apache 2.0, es un banco de pruebas adecuado para estudiar el comportamiento de modelos pequeños en entornos de agentes y funciones, sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB para el archivo Q8_0, más overhead del runtime; se puede ejecutar en CPU con 2-4 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060, etc.). También es viable en CPU.
- Sí cabe en GPU de consumo; también puede ejecutarse en CPU sin GPU.
- Opciones de despliegue: compatible con cualquier runner GGUF, como llama.cpp, Ollama, LM Studio o interfaces que soporten este formato.
- Latencia y throughput: no especificados, pero al ser un modelo de 700M parámetros, se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. No se han encontrado datos de benchmarks ni de rendimiento relativo frente a alternativas como TinyLlama o Phi-3-mini en la documentación proporcionada.

## Limitaciones y advertencias

- Conocimiento mundial limitado debido a su tamaño (700M) y a los datos de entrenamiento (~22 400 millones de tokens); no es adecuado para tareas que requieran conocimiento profundo o razonamiento complejo.
- No es fiable en aritmética; el modelo puede fallar en operaciones numéricas, por lo que se recomienda encarecidamente utilizar la herramienta `calculator`.
- Los argumentos de las herramientas son fiables solo para las cinco herramientas entrenadas; puede generalizar el formato de llamada a herramientas no vistas, pero puede adivinar argumentos incorrectos.
- No está ajustado para seguridad ni endurecido para producción; es un modelo de hobby o investigación.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- Riesgo de alucinación, especialmente en temas de conocimiento factual; se recomienda verificar las respuestas mediante herramientas externas.
- La licencia Apache 2.0 permite uso comercial, pero con las limitaciones funcionales mencionadas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SmallAICreator/Aurora-Instruct-Multitool)
- [Modelo base AuroraGPT-700M](https://huggingface.co/SmallAICreator/AuroraGPT-700M)
