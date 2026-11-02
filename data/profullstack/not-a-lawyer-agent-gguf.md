# profullstack/not-a-lawyer-agent-GGUF

## Resumen

not-a-lawyer-agent-GGUF es una cuantización GGUF del modelo not-a-lawyer-agent, un ajuste fino por LoRA sobre Qwen2.5-0.5B-Instruct orientado a investigación legal sobre fuentes públicas. Lo desarrolla profullstack y está pensado para ejecutarse en CPU mediante Ollama o llama.cpp, con un tamaño de repositorio de 0,5 GB y 494.032.768 parámetros. El modelo se presenta explícitamente como una herramienta de apoyo a la investigación legal y no como asesoramiento jurídico.

La propuesta es deliberadamente modesta: un modelo de 0,5B parámetros que actúa como capa de redacción sobre resultados de búsqueda introducidos en el prompt. El autor lo describe como "la voz, no los hechos", es decir, el modelo aporta la formulación conversacional mientras que la sustancia factual debe venir de fuentes externas actualizadas. Esto lo sitúa en la categoría de asistentes ligeros para consulta documental, no en la de modelos de razonamiento jurídico autónomo.

Su relevancia actual reside en el despliegue en entornos con recursos muy limitados: cabe en CPU, se integra con el ecosistema Ollama y llama.cpp y se distribuye bajo licencia Apache 2.0. El entrenamiento se realizó en la red c0mpute con 5.963 documentos y 400 pasos de LoRA con rango 8, según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | GGUF cuantizado (tamano indicado de 531 MB); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros, y se ajusta mediante LoRA con rango r=8 durante 400 pasos sobre un corpus de 5.963 documentos extraídos de temas de rssamplifier.com y de búsquedas en pit.world. Según la model card, la perplejidad en el conjunto de validación bajó de 35,4 a 20,6 tras el ajuste. El adaptador tiene el hash sha256 `88140d7fe1c84b0bd03cc4b70838caef984c80d702d470e88595b08a22552ed6`, que el autor indica que coincide con el recibo de la red c0mpute.

El pipeline de construcción se documenta en el repositorio c0mpute, en el ejemplo business-strategist-agent. El resultado del merge se cuantiza a GGUF con un tamaño de 531 MB. No se especifican en la información disponible detalles sobre la composición exacta del dataset, la presencia de RLHF o DPO adicionales, ni innovaciones arquitectónicas propias más allá del ajuste LoRA. El modelo incorpora un system prompt y parámetros de muestreo que Ollama recoge automáticamente del repositorio.

## Capacidades

- Generación de texto conversacional en formato de respuesta a preguntas, orientada a consultas de índole legal.
- Investigación legal asistida: reformula y estructura respuestas a partir de resultados de búsqueda incluidos en el prompt.
- Ejecución en CPU sin GPU, gracias a la cuantización GGUF y al tamaño reducido del modelo.
- Integración con Ollama mediante `ollama run hf.co/profullstack/not-a-lawyer-agent-GGUF` y con llama.cpp mediante `llama-cli -hf profullstack/not-a-lawyer-agent-GGUF`.
- Soporte de system prompt y parámetros de muestreo preconfigurados en el repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Consulta legal preliminar en local: un usuario plantea una duda sobre depósitos de alquiler o arrendamientos y el modelo redacta una respuesta estructurada a partir de los fragmentos de fuentes públicas incluidos en el prompt. Adecuado por su bajo coste de ejecución en CPU.
- Asistente de investigación documental: integrado en un pipeline que recupera textos legales y los inyecta en el contexto, el modelo transforma extractos dispersos en un resumen legible. El autor recomienda explícitamente acompañarlo de resultados de búsqueda frescos (`w3bs ask`).
- Despliegue en nodos de la red c0mpute o Infernet: la model card indica que todos los nodos de Infernet y c0mpute descargan automáticamente este modelo como "house model", por lo que sirve como modelo por defecto para consultas legales en esos entornos.
- Educación y divulgación jurídica: explicación de conceptos legales básicos en un tono accesible, con la advertencia de que no sustituye a un abogado colegiado.
- Prototipado rápido de asistentes verticales: gracias a su licencia Apache 2.0 y a su tamaño de 0,5 GB, permite validar flujos de conversación legal en entornos de desarrollo sin infraestructura GPU.
- Filtro o primera capa de triaje: en un sistema de atención legal, el modelo puede clasificar y reformular consultas entrantes antes de derivarlas a un profesional o a un modelo mayor.
- Pruebas de integración con Ollama y llama.cpp: útil como modelo de referencia para validar pipelines de despliegue GGUF en CPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la evolución de la perplejidad en validación durante el ajuste LoRA: de 35,4 a 20,6.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo cuantizado ocupa 531 MB en disco y puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria libre puede alojarlo, pero el caso de uso declarado es CPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: Ollama (`ollama run hf.co/profullstack/not-a-lawyer-agent-GGUF`), llama.cpp (`llama-cli -hf profullstack/not-a-lawyer-agent-GGUF`) y nodos de Infernet/c0mpute con descarga automática.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| not-a-lawyer-agent-GGUF | 494 M | no disponible | Apache 2.0 | GGUF | Ajuste LoRA legal sobre Qwen2.5-0.5B-Instruct, orientado a CPU |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF | Modelo base generalista sin especialización legal |
| Alternativas legales de 0,5B | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros ajustes legales comparables en este rango de tamaño |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- El propio autor advierte: "Not a lawyer. Not legal advice". El modelo no constituye asesoramiento jurídico y las leyes varían por jurisdicción; debe consultarse a un abogado colegiado antes de actuar.
- Con 0,5B parámetros, la capacidad de razonamiento jurídico es muy limitada; el autor lo describe como "la voz, no los hechos", por lo que depende de fuentes externas inyectadas en el prompt.
- Riesgo elevado de alucinación en materia legal si se le pide responder sin contexto documental verificado.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no confirmada para este ajuste concreto.
- Sin datos de benchmarks que permitan evaluar su fiabilidad frente a alternativas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre las respuestas legales recae en el integrador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/profullstack/not-a-lawyer-agent-GGUF
- Modelo base del ajuste: https://huggingface.co/profullstack/not-a-lawyer-agent
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejemplo de construcción en c0mpute: https://github.com/profullstack/c0mpute/tree/master/examples/business-strategist-agent
- Documentación de house models de Infernet: https://infernetprotocol.com/docs/house-models
