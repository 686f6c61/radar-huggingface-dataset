# CyrusZhouzk/CREDIT-DeepSeek-R1-Distill-Qwen-7B

## Resumen

CREDIT-DeepSeek-R1-Distill-Qwen-7B es un adaptador LoRA sobre el modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, desarrollado por CyrusZhouzk (Zikai Zhou y colaboradores, con participacion de Monica S. Lam, Stanford OVAL) y publicado junto al articulo "Did the Model Use That? Counterfactual Training Boosts Self-Attribution in Language Models" (arXiv:2610.35295). El adaptador no busca mejorar la calidad de las respuestas, sino dotar al modelo de una capacidad de auto-atribucion: que indique de forma explicita en que informacion externa se basa su respuesta.

El problema que resuelve es la ambiguedad entre confirmar y repetir. Cuando un usuario sugiere una respuesta, aporta un documento recuperado o el resultado de una herramienta, la salida del modelo no permite distinguir si la ha validado o simplemente la ha repetido. CREDIT entrena al modelo para terminar cada respuesta con una linea `RELIED ON: ...` que nombra la informacion externa de la que depende la respuesta, o `RELIED ON: none` si responde con conocimiento propio.

Tecnicamente es un adaptador PEFT (LoRA, rango 64) sobre un transformer denso de 7B parametros derivado de Qwen2.5-Math-7B, con contexto de 8.192 tokens en entrenamiento y modo de razonamiento (thinking) activado. Su relevancia actual esta en el ambito de la verificabilidad y la confianza en sistemas RAG y agenticos, donde saber si el modelo uso una fuente es tan importante como la respuesta misma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base DeepSeek-R1-Distill-Qwen-7B, derivado de Qwen2.5-Math-7B); adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base); el repositorio del adaptador ocupa 0,6 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia usada en entrenamiento; las muestras mas largas se descartaron) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena en bf16; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 para el adaptador; el modelo base es MIT y deriva de Qwen2.5-Math-7B (Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Libreria | peft (compatible con transformers y vLLM) |
| Rank / alpha / dropout LoRA | 64 / 128 / 0 |
| Modulos objetivo LoRA | q, k, v, o, gate, up, down projections |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer denso de 7B con modo de razonamiento (el modelo base es un destilado de DeepSeek-R1 sobre Qwen). La innovacion no esta en la arquitectura, sino en el procedimiento de entrenamiento CREDIT (Counterfactual Relabeling for Dependence on Information Training). El pipeline consta de cuatro fases: primero se generan respuestas del modelo sin entrenar a preguntas de TriviaQA, MMLU, ARC y CommonsenseQA acompanadas de uno de cuatro tipos de informacion externa (sugerencia del usuario, pasaje recuperado, salida de herramienta o respuesta de otra IA); despues se etiqueta la influencia de esa informacion mediante respuestas contrafactuales (N=4 muestras sin la informacion: influyente si la respuesta original coincide y como mucho una contrafactual coincide; no influyente si no coincide o al menos tres contrafactuales coinciden; en otro caso se descarta el ejemplo, con un juez LLM para el emparejamiento de respuestas); a continuacion se reescribe unicamente la linea final `RELIED ON:` para que coincida con la etiqueta, conservando el razonamiento y la respuesta originales del modelo; y por ultimo se afina con LoRA sobre las respuestas reetiquetadas, calculando la perdida solo sobre la completion.

Los hiperparametros son: rango 64, alpha 128, dropout 0, una epoca, tamano de batch efectivo 16, learning rate 1e-4 con schedule coseno y 5% de warmup, precision bf16, 38.203 ejemplos de entrenamiento y descarte de ejemplos de mas de 8.192 tokens. No se usa anotacion humana. El adaptador tambien funciona con vLLM (`enable_lora=True`, `max_lora_rank=64`).

## Capacidades

- Generacion de texto con razonamiento paso a paso (hereda el modo thinking del modelo base DeepSeek-R1-Distill-Qwen-7B).
- Auto-atribucion de dependencia informativa: emite una linea final `RELIED ON: ...` que nombra la informacion externa de la que depende la respuesta, o `RELIED ON: none`.
- Distincion entre cuatro tipos de informacion externa entrenados: sugerencia del usuario, pasaje recuperado, salida de herramienta y respuesta de otra IA.
- Respuesta a preguntas de conocimiento general, MMLU, ARC y CommonsenseQA (dominios presentes en el entrenamiento del adaptador).
- Integracion en pipelines PEFT/transformers y despliegue con vLLM con soporte LoRA.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Verificacion en sistemas RAG: el adaptador permite comprobar si la respuesta se apoya realmente en el pasaje recuperado o si el modelo ha respondido de memoria; util para detectar recuperaciones irrelevantes y auditar la cadena de evidencia.
- Agentes con uso de herramientas: cuando el modelo recibe la salida de una API o funcion, la linea `RELIED ON:` indica si esa salida ha determinado la respuesta, lo que facilita la depuracion de agentes multi-paso.
- Moderacion de sugerencias del usuario: en escenarios donde el usuario propone una respuesta (por ejemplo, en tareas de anotacion asistida), el modelo declara si la ha confirmado o simplemente la ha repetido, reduciendo el riesgo de sesgo de aquiescencia.
- Ensemble y critica entre modelos: al recibir la respuesta de otra IA como informacion externa, el adaptador indica si su respuesta depende de ella, lo que sirve para construir pipelines de verificacion cruzada.
- Investigacion en faithfulness y atribucion: reproduccion y extension del articulo CREDIT sobre nuevos dominios y tipos de informacion, con codigo y datos publicos.
- Evaluacion de fiabilidad en produccion: el test de eliminacion (retirar la informacion y comprobar si la respuesta cambia) puede automatizarse sobre la senal `RELIED ON:` para monitorizar la dependencia real de fuentes en un servicio desplegado.
- Formacion y divulgacion: ejemplos didacticos sobre auto-atribucion y calibracion de la confianza en modelos de lenguaje con modo de razonamiento.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de precision equilibrada (balanced accuracy) de la auto-atribucion sobre sugerencias del usuario, comparando el modelo sin entrenar con el adaptador CREDIT:

| Conjunto de prueba | Sin entrenar | CREDIT |
|---|---|---|
| Test set | 0,60 | 0,87 |
| Fresh set | 0,57 | 0,88 |
| Large set | 0,53 | 0,80 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en bf16 requiere aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade una sobrecarga minima (rango 64 sobre siete tipos de proyeccion).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con vLLM y lotes grandes; RTX 4090 (24 GB) suficiente para bf16 con una sola peticion o lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en tarjetas de 8-12 GB con cuantizacion de 8 o 4 bits del modelo base.
- Opciones de despliegue: transformers + peft, vLLM con `enable_lora=True` y `max_lora_rank=64`. No se documentan integraciones con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La generacion usa hasta 8.192 tokens nuevos con temperatura 0,6, top-p 0,95 y top-k 20, lo que implica respuestas largas por el modo de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad de atribucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CREDIT-DeepSeek-R1-Distill-Qwen-7B | 7B + LoRA r64 | 8.192 tokens (entrenamiento) | Si, linea `RELIED ON:` entrenada | Apache 2.0 (adaptador) / MIT (base) | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible en la informacion proporcionada | No especifica | MIT | HuggingFace |
| Qwen2.5-Math-7B | 7B | no disponible en la informacion proporcionada | No especifica | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos con otras alternativas de auto-atribucion en la informacion proporcionada.

## Limitaciones y advertencias

- La auto-atribucion mejora en los cuatro tipos de informacion externa entrenados, pero solo se transfiere parcialmente a tipos no vistos.
- La influencia ubicada en el system prompt rara vez se atribuye correctamente.
- La linea `RELIED ON:` es un comportamiento entrenado, no una garantia: debe comprobarse con el test de eliminacion cuando la decision sea critica.
- El adaptador esta entrenado y evaluado unicamente en ingles; no hay evidencia de comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion heredado del modelo base de 7B, especialmente en dominios fuera de TriviaQA, MMLU, ARC y CommonsenseQA.
- El modo de razonamiento genera respuestas largas (hasta 8.192 tokens nuevos), lo que incrementa coste y latencia en produccion.
- Licencia: el adaptador es Apache 2.0, pero su uso esta sujeto tambien a la licencia del modelo base (MIT, derivado de Qwen2.5-Math-7B con Apache 2.0); conviene revisar las condiciones de todas las capas.
- Modelo con nula adopcion en el momento de la consulta (0 descargas, 0 likes) y publicado recientemente; no hay validacion independiente de los resultados reportados.
- El etiquetado de influencia depende de un juez LLM y de umbrales heuristicos (N=4 contrafactuales), lo que puede introducir ruido en la senal aprendida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CyrusZhouzk/CREDIT-DeepSeek-R1-Distill-Qwen-7B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Articulo (arXiv): https://arxiv.org/abs/2610.35295
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2610.35295
- Codigo: https://github.com/stanford-oval/CREDIT
- Dataset de entrenamiento: https://huggingface.co/datasets/CyrusZhouzk/CREDIT (config `train_r1_qwen_7b`)
