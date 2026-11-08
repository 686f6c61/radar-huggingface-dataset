# Airavat-ai/erawan-1.3

## Resumen

Erawan 1.3 es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7B) desarrollado por Airavat AI Micro Lab, especializado en llamadas a herramientas (tool calling) y respuestas estructuradas dentro de flujos agénticos. Se construye sobre Erawan 1, que a su vez deriva de Qwen3-1.7B, y añade una etapa adicional de ajuste fino con LoRA (r=32) fusionada en un checkpoint completo en bfloat16. Su diseño responde a una arquitectura de sistema en dos capas: Erawan 1.3 actúa como capa de ejecución ágil y delega el razonamiento complejo a un modelo mayor.

El modelo aborda un problema concreto: los modelos pequeños suelen fallar al emitir llamadas a funciones bien formadas y al decidir cuándo no deben invocar ninguna herramienta. Erawan 1.3 mejora sustancialmente estas métricas respecto a su predecesor, pasando de 36,5% a 92,5% en el benchmark de function calling de Glaive y de 10 a 58 escenarios superados en una prueba agéntica simulada de 60 casos. Hereda de Qwen3-1.7B una ventana de contexto de 32.768 tokens (configurable hasta 40.960), aunque el ajuste fino se realizó con ejemplos de como máximo 1.024 tokens.

Es relevante ahora porque demuestra que un modelo de menos de 2B parámetros, con licencia Apache 2.0 y formato safetensors, puede asumir la orquestación de herramientas en producción sin necesidad de GPUs de gama alta, reservando el cómputo caro para el modelo de razonamiento que recibe el handoff.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen3, 28 capas, grouped-query attention |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (config permite hasta 40.960); ajuste fino con ejemplos de maximo 1.024 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), tamano del repo 3.5 GB |

## Arquitectura y entrenamiento

Erawan 1.3 es un transformer decoder-only basado en Qwen3-1.7B, con 28 capas y grouped-query attention. El ajuste fino se realizó mediante etapas sucesivas de LoRA con rango 32, cada una fusionada en los pesos en bfloat16: primero tool use, después matemáticas, razonamiento y lógica, y finalmente flujos agénticos, handoff a un modelo de razonamiento y matemáticas destiladas desde un checkpoint anterior de Erawan 1.3. El resultado es un checkpoint completo de precisión nativa, no un adaptador separado.

Los datos de entrenamiento combinan conjuntos públicos y sintéticos: NousResearch/hermes-function-calling-v1 (Apache 2.0), glaiveai/glaive-function-calling-v2 (Apache 2.0, excluyendo las filas usadas para evaluación), openai/gsm8k train (MIT), meta-math/MetaMathQA (MIT), KingNish/reasoning-base-20k (Apache 2.0), tasksource/ReClor train (licencia "other") y allenai/ai2_arc ARC-Challenge train (CC-BY-SA-4.0), además de conversaciones sintéticas de agente, handoff y respuesta directa generadas por Airavat AI Micro Lab. Las respuestas de GSM8K train se destilaron desde un checkpoint previo de Erawan 1.3, conservando solo las correctas. La model card no indica el número total de tokens de entrenamiento ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`apply_chat_template`).
- Tool calling y function calling estructurado mediante etiquetas `<tool_call>`: 150 de 150 llamadas usaron las etiquetas correctas y 143 de 150 acertaron función y argumentos exactos en la prueba del autor.
- Decisión de no invocar herramientas: 42 de 50 casos correctos al abstenerse cuando no procedía.
- Flujos agénticos multi-paso con herramientas simuladas: 58 de 60 escenarios superados en la prueba del autor.
- Handoff explícito a un modelo de razonamiento mayor: 6 de 6 escenarios de derivación por razonamiento duro y 5 de 6 en tipos de puzle no vistos.
- Rechazo de acciones inseguras o prohibidas: 6 de 6 escenarios.
- Razonamiento científico y lógica de opción múltiple (ARC-Challenge, ReClor, BBH logical deduction).
- Matemáticas de nivel escolar y competición moderada (GSM8K, MATH-500).
- Respuesta directa a preguntas simples sin uso de herramientas: 6 de 6 escenarios.
- Capacidad de código: no evaluada según la model card.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Orquestación de agentes con herramientas: el modelo emite llamadas `<tool_call>` con función y argumentos correctos en el 95,3% de los casos evaluados, por lo que puede actuar como router que decide qué API invocar en un pipeline de automatización.
- Capa de ejecución en arquitecturas de dos modelos: recibe la petición del usuario, resuelve los pasos simples y deriva al modelo grande solo cuando detecta razonamiento duro, aprovechando que fue entrenado específicamente para ese handoff (6 de 6 escenarios).
- Asistentes de atención al cliente con APIs internas: al abstenerse correctamente de llamar herramientas en 42 de 50 casos y rechazar acciones prohibidas en 6 de 6, es adecuado para conversaciones donde no toda consulta requiere consultar un backend.
- Automatización de tareas administrativas con efectos secundarios: dado que no realizó llamadas innecesarias ni prohibidas en la prueba agéntica, puede integrarse en flujos con confirmación humana previa a operaciones de escritura.
- Enrutamiento y clasificación de intenciones en sistemas multiagente: su tamaño de 1,7B permite desplegarlo como primer salto de bajo coste antes de invocar modelos mayores.
- Investigación sobre modelos pequeños eficientes: con licencia Apache 2.0 y pesos safetensors, sirve como base para estudiar ajuste fino con LoRA en tareas de tool use y destilación de matemáticas.
- Evaluación de pipelines de function calling: puede usarse como modelo de referencia para validar esquemas de herramientas y plantillas de prompt antes de pasar a producción.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando Erawan 1.3 con Erawan 1, con decodificación greedy, mismos prompts y mismos límites de tokens. Puntuación estricta: solo cuenta como correcta la respuesta correcta y con el formato solicitado.

| Tarea | Benchmark | Erawan 1 | Erawan 1.3 |
|---|---|---|---|
| Tool use | Glaive function-calling (n=200) | 73/200 (36,5%) | 185/200 (92,5%) |
| Razonamiento científico | ARC-Challenge (n=150) | 51/150 (34,0%) | 125/150 (83,3%) |
| Lectura lógica | ReClor (n=100) | 49/100 (49,0%) | 64/100 (64,0%) |
| Puzles lógicos | BBH logical deduction (n=100) | 23/100 (23,0%) | 40/100 (40,0%) |
| Matemáticas cotidianas | GSM8K (n=200) | 121/200 (60,5%) | 164/200 (82,0%) |
| Matemáticas difíciles | MATH-500 (n=100) | 35/100 (35,0%) | 42/100 (42,0%) |

Desglose de tool use:

| Medida | Erawan 1 | Erawan 1.3 |
|---|---|---|
| Llamadas con etiquetas `<tool_call>` (de 150) | 32 | 150 |
| Función y argumentos exactos (de 150) | 27 | 143 |
| Correctamente sin llamada (de 50) | 46 | 42 |

Flujos agénticos (66 escenarios simulados con herramientas mockeadas, puntuación estricta):

| Medida | Erawan 1 | Erawan 1.3 |
|---|---|---|
| 60 escenarios originales superados | 10 | 58 |
| Derivación al modelo de razonamiento (de 6) | 0 | 6 |
| Handoff en tipos de puzle no vistos (de 6) | no disponible | 5 |
| Respuestas simples sin herramientas (de 6) | 6 | 6 |
| Rechazo de acciones inseguras o prohibidas (de 6) | 2 | 6 |
| Llamadas innecesarias o prohibidas | 0 | 0 |

Nota del autor: en MATH-500, Erawan 1 alcanzó el límite de 1.536 tokens en 62 de 100 respuestas y Erawan 1.3 en 14, por lo que la puntuación de Erawan 1 puede estar limitada por la longitud de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 1.720.574.976 parámetros y pesos bfloat16 (repo de 3,5 GB), la inferencia en precisión nativa requiere en torno a 3,5 GB solo para pesos, más memoria para KV cache y activaciones; las cifras exactas no están publicadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado por el autor; el tamaño de pesos en bfloat16 (3,5 GB) es compatible con GPUs de consumo con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erawan 1.3 | 1.720.574.976 | 32.768 (hasta 40.960 en config) | 185/200 en Glaive (92,5%) | Apache 2.0 | Hugging Face |
| Erawan 1 | 1,7B (derivado de Qwen3-1.7B) | no disponible en la información proporcionada | 73/200 en Glaive (36,5%) | Apache 2.0 | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks de Qwen3-1.7B ni de otros modelos comparables en la información proporcionada, por lo que la comparación se limita a Erawan 1 y a la relación de linaje con Qwen3-1.7B.

## Limitaciones y advertencias

- En preguntas de opción múltiple suele responder solo con la letra, sin mostrar el razonamiento, por lo que las puntuaciones de lógica no reflejan pasos intermedios.
- Las preguntas de ARC y ReClor se reservaron para evaluación, pero el modelo se entrenó con estilos de pregunta similares, así que las mejoras pueden sobreestimar el razonamiento general.
- MATH-500 (42/100) y puzles lógicos (40/100) siguen siendo modestos; el propio autor recomienda derivar el razonamiento duro a un modelo mayor.
- Los resultados agénticos provienen de una prueba simulada con herramientas mockeadas, no de sistemas en vivo; deben validarse las llamadas y añadir pasos de confirmación para herramientas con efectos secundarios.
- En tareas encadenadas de dos y tres pasos supera 10 de 12 escenarios; puede omitir ocasionalmente un paso.
- La capacidad de código no ha sido evaluada.
- El ajuste fino usó ejemplos de como máximo 1.024 tokens, por lo que la calidad en entradas largas no está probada pese a la ventana de 32.768 tokens.
- Solo soporta inglés según la model card.
- Riesgo de alucinación inherente a modelos de este tamaño; no apto para decisiones médicas, legales o financieras ni para usos que exijan exactitud factual garantizada.
- La licencia es Apache 2.0, pero el dataset tasksource/ReClor figura con licencia "other" y ai2_arc con CC-BY-SA-4.0; conviene revisar las obligaciones de atribución antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin validación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Airavat-ai/erawan-1.3
- Modelo base Erawan 1: https://huggingface.co/Airavat-ai/erawan-1
- Organización Airavat-ai: https://huggingface.co/Airavat-ai
