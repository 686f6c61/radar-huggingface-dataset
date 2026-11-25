# rexmhall09/kenchi

## Resumen

Kenchi 1 es un modelo de lenguaje de aproximadamente 500 millones de parámetros desarrollado por Rex Hall (rexmhall09) con la asistencia de herramientas denominadas Lor, Fable 5.2, Astra 6.2 y Fern 0.1. Su objetivo declarado es ser el modelo más pequeño capaz de usar herramientas (tool calling) y de reconocer explícitamente cuándo no sabe la respuesta, derivando la consulta a una búsqueda web en lugar de inventar contenido. Está publicado con licencia MIT tanto en código como en pesos.

El modelo emplea una arquitectura híbrida basada en Mamba2 combinada con componentes transformer, según las etiquetas y la model card del repositorio. Con 496.486.362 parámetros reales (verificados en los safetensors) y un contexto de solo 2.048 tokens, está claramente orientado a un caso de uso acotado: conversación breve con invocación de herramientas de búsqueda, no a razonamiento general ni a generación de código.

Es relevante ahora como ejemplo de modelo pequeño especializado en agentes ligeros y uso de herramientas, un nicho donde la mayoría de alternativas superan los 7.000 millones de parámetros. Su valor está en la eficiencia y en el comportamiento de "abstención informada" (decir que no sabe y buscar), más que en capacidad bruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + transformer (según tags del repo) |
| Parametros totales | 496.486.362 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors publicados) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida, con componentes Mamba2 (modelo de espacio de estados) combinados con capas tipo transformer, según las etiquetas `mamba2` y `hybrid` del repositorio. El modelo requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica que la implementación de la arquitectura no está integrada de forma nativa en transformers y depende del código del autor.

Los datos de entrenamiento incluyen texto generado por modelos Qwen (el autor indica que "parte de los datos de entrenamiento fueron escritos por modelos Qwen") y resultados de búsqueda de Wikipedia bajo licencia CC BY-SA 3.0. El repositorio remite a un archivo DATA.md con las fuentes y citas completas. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del uso de herramientas y la abstención.

## Capacidades

- Generación de texto conversacional breve en inglés.
- Tool calling / function calling con esquemas estilo OpenAI: el método `chat()` acepta un parámetro `tools` y devuelve mensajes con `tool_calls`.
- Búsqueda web integrada mediante herramientas externas (el ejemplo oficial usa Wikipedia).
- Comportamiento de abstención: el modelo está entrenado para indicar cuándo no sabe y derivar a una fuente.
- Multi-turno limitado: el autor advierte que las preguntas de seguimiento ("¿dónde nació?") fallan en la mayoría de casos.
- No se documentan capacidades de visión, audio, código, matemáticas avanzadas ni modo de razonamiento explícito (thinking).

## Casos de uso

- Asistente de búsqueda con citas: el modelo invoca una herramienta de búsqueda (por ejemplo, Wikipedia) y devuelve una respuesta acompañada de la fuente. Es adecuado porque su entrenamiento está centrado en ese flujo y el autor integra un chat de terminal con búsqueda en Wikipedia en el repositorio de GitHub.
- Verificación de hechos ligeros en pipelines: para consultas factuales cortas donde se prefiere una abstención con enlace a una respuesta inventada, el modelo puede actuar como primer filtro antes de escalar a un modelo mayor.
- Agentes de bajo coste en dispositivos con recursos limitados: con ~500M parámetros, cabe en CPU y en GPUs de gama baja, lo que permite desplegar un agente con tool calling sin infraestructura dedicada.
- Prototipado de flujos de tool calling: sirve para validar esquemas de funciones estilo OpenAI y la lógica de ida y vuelta (llamada a herramienta, resultado, nueva llamada) antes de migrar a modelos mayores.
- Educación y demos de IA transparente: su comportamiento de "no sé, consulta esta fuente" es útil para mostrar buenas prácticas de atribución y reducción de alucinaciones en entornos docentes.
- Chat de terminal para consultas rápidas: el repositorio oficial incluye un chat de terminal con búsqueda en Wikipedia, pensado para uso local interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2 GB para los pesos (496M parámetros × 4 bytes), más overhead de activaciones y del código personalizado.
- En fp16/bf16: alrededor de 1 GB de pesos.
- Cabe en GPU consumer de gama baja (GTX 1650, RTX 3050, RTX 4060) y en CPU, dado el tamaño reducido.
- Opciones de despliegue: la vía documentada es `transformers>=4.44.2` con `trust_remote_code=True`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura híbrida Mamba2 con código personalizado probablemente requiera adaptaciones para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenchi 1 | ~496M | 2.048 | Sí (estilo OpenAI) | MIT | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Sí | Apache 2.0 | Hugging Face, amplio ecosistema |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Parcial | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | ~1.1B | 2.048 | No nativo | Apache 2.0 | Hugging Face |

La comparativa se limita a datos públicos de parámetros, contexto y licencia; no se dispone de resultados de benchmarks de Kenchi 1 para comparar rendimiento. Frente a Qwen2.5-0.5B-Instruct, Kenchi 1 ofrece un contexto mucho menor (2.048 frente a 32.768) pero un enfoque explícito en abstención y búsqueda. Frente a SmolLM2-360M y TinyLlama, su ventaja declarada es el soporte nativo de tool calling en un tamaño inferior a 1B.

## Limitaciones y advertencias

- Puede dar respuestas incorrectas y aun así adjuntar una fuente; el autor recomienda abrir el enlace para verificar.
- Las preguntas de seguimiento fallan en la mayoría de los casos; hay que reformular la pregunta completa.
- No es un buen chatbot de propósito general, según el propio autor.
- Solo inglés.
- Contexto muy limitado: 2.048 tokens.
- Solo se publican pesos en safetensors; no hay versiones cuantizadas GGUF ni integración documentada con motores de inferencia habituales.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de ejecutarlo en producción.
- Parte de los datos de entrenamiento fueron generados por modelos Qwen, lo que puede introducir sesgos y estilos heredados de esos modelos.
- Los resultados de búsqueda de entrenamiento provienen de Wikipedia (CC BY-SA 3.0), con las obligaciones de atribución que ello conlleva al redistribuir contenido derivado.
- La licencia MIT permite uso comercial, pero no hay garantías ni evaluación independiente de calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/rexmhall09/kenchi
- Repositorio GitHub: https://github.com/rexmhall09/kenchi
- Fuentes de datos (DATA.md): https://github.com/rexmhall09/kenchi/blob/main/DATA.md
