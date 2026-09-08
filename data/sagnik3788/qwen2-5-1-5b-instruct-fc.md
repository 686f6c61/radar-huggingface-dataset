# sagnik3788/Qwen2.5-1.5B-Instruct-FC

## Resumen

Qwen2.5-1.5B-Instruct-FC es un modelo de lenguaje de 1.500 millones de parámetros, desarrollado por sagnik3788 a partir del modelo base Qwen/Qwen2.5-1.5B-Instruct. Está especializado en la generación de llamadas a funciones (function calling) mediante un ajuste fino con QLoRA y un conjunto de datos sintético verificado, lo que le permite producir respuestas estructuradas en formato `<tool_call>JSON</tool_call>`. El objetivo es ofrecer un modelo pequeño, eficiente y capaz de ejecutar tareas de tool calling de una sola vuelta, superando en este ámbito a modelos mucho más grandes.

Con una arquitectura transformer densa (Qwen2ForCausalLM) y una ventana de contexto de 32.768 tokens, este modelo alcanza un 85,65 % de precisión en la evaluación BFCL v4 Non-Live AST, un resultado que, según los datos declarados por el autor, supera a modelos como DeepSeek-V3.2-Exp (685B), Qwen2.5-72B-Instruct o GPT-4o. Está pensado para entornos con recursos limitados, donde los modelos de menos de 2B suelen fallar en tareas de invocación de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only denso) |
| Parámetros totales | 1.543.714.304 (1,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | bf16 (pesos liberados); entrenado con QLoRA 4-bit NF4 |
| Idiomas soportados | Inglés (el modelo base Qwen2.5 soporta múltiples idiomas, pero el fine-tuning se realizó solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2.5-1.5B-Instruct-FC mantiene la arquitectura del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con 28 capas, dimensión oculta de 1536 y 12 cabezas de atención. El ajuste fino se realizó mediante QLoRA (LoRA con cuantización 4-bit NF4 y doble cuantización), con rango 16 y alpha 32, aplicado a todos los módulos de atención y MLP. El entrenamiento se llevó a cabo con la librería Unsloth y el trainer SFTTrainer de TRL, durante 3 épocas sobre un conjunto de 9.500 ejemplos sintéticos verificados.

Los datos se generaron con un pipeline APIGen de tres etapas: primero se definieron 500 APIs REST con sus esquemas JSON, después se generaron 30.000 ejemplos crudos de consultas y llamadas a funciones (cada ejemplo incluye entre 2 y 4 herramientas, con una herramienta correcta y entre 1 y 3 distractores), y finalmente se filtraron mediante validación de esquemas y simulación de ejecución, obteniendo 10.000 ejemplos verificados. El formato de entrenamiento sigue la plantilla de chat de Qwen2.5, con las herramientas inyectadas en el mensaje de sistema y la salida del asistente encerrada en etiquetas `<tool_call>`.

## Capacidades

- Generación de texto instructivo y conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Function calling de una sola vuelta con formato `<tool_call>JSON</tool_call>`, capaz de invocar múltiples funciones en paralelo.
- Manejo de entre 2 y 4 herramientas por consulta, con selección de la herramienta correcta entre distractores.
- Soporte de tool calling en modo no interactivo (non-live) y en escenarios simples en vivo (live simple), con una precisión del 75,97 % en el split live simple.
- Capacidades multilingües limitadas al inglés en el fine-tuning; el modelo base Qwen2.5 soporta otros idiomas, pero no se garantiza su rendimiento fuera del inglés.
- Sin soporte de visión, audio ni multimodalidad; es un modelo de texto puro.
- Sin soporte de multi-turno, memoria ni búsqueda web: el autor declara un 0 % en estas categorías de BFCL v4, ya que no se incluyeron en el entrenamiento.

## Casos de uso

- Agentes de bajo coste en el edge: el modelo puede ejecutarse en GPUs de consumo o CPUs con cuantización, permitiendo agentes de tool calling en dispositivos locales sin depender de servicios cloud.
- Automatización de llamadas a APIs internas: en pipelines de integración, el modelo genera el JSON necesario para invocar funciones REST, lo que facilita la automatización de flujos de trabajo sin intervención humana.
- Asistentes de soporte técnico de una sola vuelta: cuando el usuario formula una consulta concreta y el sistema necesita consultar una base de datos o una API externa, el modelo selecciona la herramienta adecuada y devuelve la llamada estructurada.
- Prototipado rápido de agentes con herramientas: gracias a su compatibilidad con transformers y vLLM, los desarrolladores pueden integrar el modelo en pocas líneas de código y validar flujos de tool calling antes de escalar a modelos más grandes.
- Generación de código de integración: el modelo puede emitir llamadas a funciones en código, lo que resulta útil para generar fragmentos de integración con APIs documentadas en JSON Schema.
- Investigación y evaluación de modelos pequeños: sirve como referencia para comparar el rendimiento de modelos de menos de 2B en tareas de function calling, especialmente en el benchmark BFCL v4.
- Chatbots especializados en consultas de una sola vuelta: cuando no se necesita memoria ni contexto multi-turno, el modelo puede gestionar consultas puntuales con herramientas, reduciendo costes de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en BFCL v4, obtenidos con el harness oficial del Berkeley Function-Calling Leaderboard.

| Categoría | Precisión |
|---|---|
| Overall Non-Live AST | 85,65 % |
| Simple Python | 75,08 % |
| Multiple | 87,00 % |
| Parallel | 91,00 % |
| Parallel Multiple | 89,50 % |
| Live Simple | 75,97 % |
| Overall Acc (todas las divisiones) | 25,92 % |
| Multi-Turn / Memory / Web Search | 0 % |

Comparativa con otros modelos según los datos de la model card:

| Modelo | Parámetros | BFCL v4 Non-Live AST |
|---|---|---|
| Qwen2.5-1.5B-Instruct-FC | 1,5B | 85,65 % |
| DeepSeek-V3.2-Exp | 685B | 85,52 % |
| Hammer2-7B | 7B | 85,50 % |
| Qwen2.5-72B-Instruct | 72B | 84,9 % |
| Llama-3.3-70B-Instruct | 70B | 84,3 % |
| GPT-4o | no disponible | 82,1 % |
| Llama-3.2-1B-Instruct | 1B | 38,38 % |

Nota: estos resultados son declarados por el autor del modelo y no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo ocupa aproximadamente 3,1 GB (según el tamaño del repositorio); con cuantización 4-bit se puede reducir a menos de 1 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.) es suficiente para inferencia en bf16. No se requieren GPUs de centro de datos como A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo de gama media e incluso en CPU con cuantización adecuada.
- Opciones de despliegue: transformers, vLLM, text-generation-inference (según los tags del repositorio). También es compatible con llama.cpp u Ollama si se convierte a formato GGUF, aunque no se proporciona una conversión oficial.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 Non-Live | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-FC | 1,5B | 32.768 | 85,65 % | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | no disponible | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1B | no disponible | 38,38 % | no disponible | no disponible |

Nota: el modelo base Qwen2.5-1.5B-Instruct no ha sido evaluado en BFCL v4 en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo especialista en function calling de una sola vuelta; no soporta multi-turno, memoria ni búsqueda web, obteniendo un 0 % en estas categorías de BFCL v4.
- Los benchmarks están declarados por el autor y no han sido verificados de forma independiente; los resultados pueden variar en entornos reales.
- El rendimiento fuera del inglés puede degradarse, ya que el fine-tuning se realizó únicamente con datos en inglés.
- Riesgo de alucinación en la generación de argumentos o nombres de funciones, especialmente con herramientas complejas o no vistas durante el entrenamiento.
- No se documentan sesgos específicos, pero el modelo base Qwen2.5 puede heredar sesgos presentes en sus datos de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los términos de la licencia y evaluar el modelo en su caso de uso.
- El modelo no incluye soporte de visión ni audio; es exclusivamente de texto.

## Enlaces

- HuggingFace: https://huggingface.co/sagnik3788/Qwen2.5-1.5B-Instruct-FC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Paper APIGen (arXiv 2406.18518): https://arxiv.org/abs/2406.18518
- Berkeley Function-Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
