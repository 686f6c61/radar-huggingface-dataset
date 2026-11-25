# ConwayResearch/Underdog-Poodle-4B

## Resumen

Underdog Poodle 4B es un ajuste fino (post-entrenamiento) de Qwen3.5-4B desarrollado por ConwayResearch, orientado especificamente a cargas de trabajo de agentes: invocacion de herramientas, decision de cuando no invocar ninguna, seguimiento de instrucciones y dialogo guiado con el usuario durante una tarea. El modelo opera con el modo de razonamiento (thinking) activado por defecto y conserva la plantilla de chat y el formato de tool calling de la familia Qwen3.5.

Con 4.659.865.088 parametros (aproximadamente 4,66 mil millones) y un repositorio de 12,4 GB en safetensors, se posiciona en la franja de modelos pequenos desplegables en una sola GPU. Su relevancia actual radica en que el ajuste no busca mejorar el conocimiento bruto del modelo base, sino su comportamiento operativo como agente: la model card reporta mejoras en las siete evaluaciones que el autor monitoriza frente a Qwen3.5-4B medido con el mismo arnes y los mismos ajustes de muestreo.

La licencia es CC BY-NC 4.0, lo que restringe el uso comercial sin licencia separada, un factor determinante para cualquier evaluacion en produccion. El modelo base Qwen3.5-4B es de la familia Qwen y se distribuye bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (aprox. 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; las evaluaciones de tau3-bench se ejecutaron con 131.072 tokens de contexto |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 (uso comercial requiere licencia aparte) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parametros, y aplica sobre el un post-entrenamiento realizado por ConwayResearch. La model card no detalla la composicion del dataset de ajuste, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado; esa informacion figura como no disponible. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la capacidad multimodal del base, aunque la model card no documenta evaluaciones de vision.

La innovacion declarada es de comportamiento mas que de arquitectura: el ajuste persigue que el modelo invoque herramientas de forma mas fiable, detecte correctamente cuando no debe invocar ninguna, respete instrucciones de formato y complete sus respuestas dentro de un presupuesto de tokens. Este ultimo punto es medible: segun el autor, el 98 % de las respuestas en IFEval terminan dentro del presupuesto frente al 63 % del base, y en IFBench el 79 % frente al 43 %. El modelo mantiene el modo thinking activado por defecto y se recomienda temperatura 0,6, top_p 0,95 y top_k 20.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento (thinking) activado por defecto.
- Tool calling y function calling con el formato y la plantilla de chat de Qwen3.5.
- Llamadas paralelas a herramientas: evaluado en 100 casos con resultado de 77 frente a 69 del base.
- Deteccion de relevancia e irrelevancia de herramientas, es decir, decidir cuando no invocar ninguna.
- Razonamiento multi-paso orientado a agentes, con soporte de memoria y busqueda web en el arnes BFCL.
- Capacidad multimodal image-text-to-text heredada del modelo base (pipeline declarado), sin evaluaciones publicadas en la model card.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Atencion al cliente con agentes de consulta de pedidos: el modelo puede recibir herramientas como `get_order_status` y decidir si invoca la funcion o responde directamente, gracias a su entrenamiento especifico en deteccion de relevancia e irrelevancia de herramientas.
- Orquestacion de agentes con multiples herramientas en paralelo: su rendimiento en llamadas paralelas (77 sobre 100 casos) lo hace adecuado para asistentes que deben consultar varias fuentes a la vez, como estado de envio, stock y facturacion.
- Automatizacion de busqueda web con sintesis: la mejora en la categoria web search de BFCL-V4 (30,5 frente a 14,0 del base) lo situa como opcion para agentes que consultan la web y deben decidir que resultados usar.
- Agentes con memoria de conversacion: la mejora en la categoria memory de BFCL-V4 (48,6 frente a 29,3) lo hace util en asistentes que recuperan y aplican informacion de interacciones previas.
- Pipelines con presupuesto estricto de tokens: al completar el 98 % de sus respuestas de IFEval dentro del limite de 32.768 tokens de salida, reduce el riesgo de respuestas truncadas en produccion frente al modelo base.
- Prototipado e investigacion en agentes: al ser un ajuste pequeno (4,66 mil millones de parametros) sobre un base conocido, sirve para experimentar con formatos de tool calling y evaluar comportamiento agentico sin el coste de modelos mayores.
- Despliegue en una sola GPU para tareas de instruccion estricta: su puntuacion en IFEval (85,4) lo hace apto para tareas donde el formato de salida es critico, como extraccion estructurada o generacion de respuestas con plantillas fijas.

## Benchmarks y rendimiento

Todos los resultados proceden de un unico arnes del autor, con thinking activado, temperatura 0,6, top_p 0,95, top_k 20, sin penalizacion de presencia y un maximo de 32.768 tokens de salida. No son comparables con las cifras publicadas por Qwen, que usa temperatura 1,0 y penalizacion de presencia 1,5.

| Benchmark | Qwen3.5-4B | Underdog Poodle 4B |
|---|---|---|
| BFCL-V4 (arnes oficial) | 56,8 | 65,3 |
| BFCL-120 (subconjunto congelado, 3 semillas) | 77,5 | 80,6 |
| IFEval (nivel de prompt, laxo) | 60,6 | 85,4 |
| IFBench (nivel de prompt, laxo) | 33,3 | 38,7 |
| Llamadas paralelas (100 casos) | 69 | 77 |
| WebWalkerQA (150 preguntas, juez LLM) | 30,4 | 31,1 |
| tau3-bench (media de 4 dominios) | 57,9 | 60,7 |

Desglose de BFCL-V4 por categoria:

| Categoria | Qwen3.5-4B | Underdog Poodle 4B |
|---|---|---|
| Non-live AST | 85,6 | 86,1 |
| Live | 81,0 | 79,1 |
| Multi-turn | 77,8 | 82,3 |
| Web search | 14,0 | 30,5 |
| Memory | 29,3 | 48,6 |
| Relevance detection | 87,5 | 81,3 |
| Irrelevance detection | 81,4 | 82,6 |

Notas metodologicas: tau3-bench se ejecuto con 2 intentos por tarea y contexto de 131.072 tokens, con GPT-5.4 mini como simulador de usuario y juez de aserciones. BFCL-V4 uso los prompts y comprobadores oficiales, sustituyendo SerpAPI por el plugin web de OpenRouter con resultados cacheados para ambos modelos.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia de orden de magnitud, un modelo de 4,66 mil millones de parametros en FP16 ocupa aproximadamente 9,3 GB solo en pesos, mas el coste de KV cache y activaciones; en cuantizacion de 8 bits rondaria los 4,7 GB y en 4 bits los 2,3 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU probada por el autor: NVIDIA H100 con vLLM 0.32.0 y Python 3.12.
- GPU consumer: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; el tamano del modelo sugiere que cabria en GPU consumer de gama alta, pero no hay datos oficiales.
- Despliegue: vLLM 0.32.0 con `--tool-call-parser qwen3_coder --reasoning-parser qwen3 --enable-auto-tool-choice`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Underdog Poodle 4B | 4,66 mil millones | no disponible | Agentes y tool calling | CC BY-NC 4.0 | Hugging Face (279 descargas) |
| Qwen3.5-4B | 4,66 mil millones (base) | no disponible | Modelo generalista multimodal | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible es con su modelo base, Qwen3.5-4B: mismo tamano y misma arquitectura, pero distinta licencia (Apache 2.0 frente a CC BY-NC 4.0) y distinto comportamiento agentico segun los benchmarks del autor. No se dispone de datos de otros ajustes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin licencia separada, que debe solicitarse a license@conway.tech. Esto afecta a cualquier despliegue en produccion con fines de lucro.
- Los benchmarks proceden de un unico arnes del autor y no son comparables con las cifras publicadas por Qwen; ademas, el autor sustituyo el backend de busqueda web de BFCL, lo que puede afectar a la reproducibilidad de esa categoria.
- Retroceso en categorias concretas frente al base: Live (79,1 frente a 81,0) y Relevance detection (81,3 frente a 87,5) en BFCL-V4.
- Rendimiento bajo en busqueda web (30,5 en BFCL-V4 y 31,1 en WebWalkerQA) y en memoria (48,6), lo que limita su uso en agentes que dependan intensamente de esas capacidades.
- Riesgo de alucinacion: no evaluado ni documentado en la model card.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no hay garantia documentada de calidad fuera del ingles.
- Capacidad multimodal declarada por el pipeline pero sin evaluaciones publicadas; no debe asumirse un rendimiento de vision verificado.
- Requiere thinking activado y ajustes de muestreo especificos (temperatura 0,6, top_p 0,95, top_k 20); desviarse de ellos puede degradar el comportamiento reportado.
- El modelo fue validado unicamente con vLLM 0.32.0 en H100; no hay datos de otros motores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Informe completo del autor: https://underdog.ai/poodle
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Contacto de licencia comercial: license@conway.tech
