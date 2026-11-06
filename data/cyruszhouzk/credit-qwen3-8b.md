# CyrusZhouzk/CREDIT-Qwen3-8B

## Resumen

CREDIT-Qwen3-8B es un adaptador LoRA para Qwen/Qwen3-8B entrenado con el metodo CREDIT (Counterfactual Relabeling for Dependence on Information Training), descrito en el articulo "Did the Model Use That? Counterfactual Training Boosts Self-Attribution in Language Models" (arXiv:2610.35295). El adaptador lo publica CyrusZhouzk y forma parte de un proyecto con codigo en el repositorio stanford-oval/CREDIT. El modelo base Qwen3-8B tiene 8.000 millones de parametros y es un transformer denso de la familia Qwen3.

El problema que aborda es la auto-atribucion: cuando un modelo responde a una pregunta que incluye informacion externa (una sugerencia del usuario, un documento recuperado, la salida de una herramienta o la respuesta de otro modelo), el usuario no puede distinguir si el modelo confirmo esa informacion con criterio propio o simplemente la repitio. CREDIT entrena al modelo para que termine cada respuesta con una linea `RELIED ON: ...` que nombra la informacion externa de la que depende la respuesta, o `RELIED ON: none` si respondio con conocimiento propio.

La relevancia practica es alta para sistemas de RAG y agentes: permite auditar si el modelo se apoya en las fuentes proporcionadas o alucina confirmaciones. El adaptador mejora la precision equilibrada de auto-atribucion sobre sugerencias del usuario de 0,49 a 0,86 en el conjunto de prueba principal, aunque solo transfiere parcialmente a tipos de informacion externa no vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA con rango 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia usada en el entrenamiento); el contexto nativo de Qwen3-8B no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | no disponible para el adaptador; aplicables las del modelo base (no detalladas en la informacion proporcionada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso de 8.000 millones de parametros. El LoRA tiene rango 64, alpha 128 y dropout 0, y se aplica a las proyecciones q, k, v, o, gate, up y down. Se entreno durante 1 epoca con batch efectivo de 16, tasa de aprendizaje 1e-4 con schedule cosine y 5% de warmup, precision bf16, longitud maxima de 8.192 tokens (los ejemplos mas largos se descartaron) y 27.498 ejemplos de entrenamiento. La perdida se calcula unicamente sobre la completion.

El proceso de entrenamiento consta de cuatro fases: primero se generan respuestas del modelo sin entrenar a preguntas de TriviaQA, MMLU, ARC y CommonsenseQA, cada una acompanada de uno de cuatro tipos de informacion externa (sugerencia del usuario, pasaje recuperado, salida de herramienta o respuesta de otra IA). Despues se etiqueta la influencia mediante respuestas contrafactuales: se muestrean N=4 respuestas a la misma pregunta sin la informacion; la informacion es influyente si la respuesta original coincide con ella y como maximo una respuesta contrafactual tambien coincide, y no influyente si la original no coincide o al menos tres contrafactuales coinciden; el resto de ejemplos se descartan. La coincidencia de respuestas se evalua con un juez LLM. A continuacion se reescribe solo la linea final `RELIED ON:` de cada respuesta para que coincida con la etiqueta, conservando el razonamiento y la respuesta del propio modelo. Por ultimo se afina con LoRA sobre las respuestas reetiquetadas. No se usa anotacion humana.

La innovacion tecnica central es el uso de respuestas contrafactuales para definir la influencia de la informacion externa sin supervision humana, lo que permite generar etiquetas a escala y entrenar la auto-atribucion como comportamiento explicito. El adaptador requiere que se anada al mensaje del usuario la instruccion de entrenamiento sobre la linea `RELIED ON:` y que el razonamiento (thinking mode) este habilitado.

## Capacidades

- Generacion de texto y razonamiento paso a paso heredados de Qwen3-8B, con modo thinking activado mediante `enable_thinking=True`.
- Auto-atribucion: genera una linea final `RELIED ON: ...` que nombra la informacion externa de la que depende la respuesta, o `RELIED ON: none`.
- Deteccion de influencia en cuatro tipos de informacion externa: sugerencias del usuario, pasajes recuperados, salidas de herramientas y respuestas de otra IA.
- Respuesta a preguntas de conocimiento general y de opcion multiple (entrenado sobre TriviaQA, MMLU, ARC y CommonsenseQA).
- Integracion con vLLM mediante `enable_lora=True` y `max_lora_rank=64`.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni uso como agente multi-paso mas alla de la atribucion de salidas de herramientas.

## Casos de uso

- Auditoria de sistemas RAG: el adaptador indica si la respuesta se apoyo en el pasaje recuperado o si el modelo respondio por su cuenta, lo que permite detectar casos en los que el sistema cita una fuente que en realidad no uso.
- Verificacion de sugerencias del usuario: en asistentes conversacionales, el modelo puede senalar si acepto la sugerencia del usuario o la corrigio con conocimiento propio, util en flujos donde el usuario propone una respuesta y quiere saber si el modelo la valido de verdad.
- Control de calidad en pipelines de datos: al generar respuestas condicionadas a documentos, la linea `RELIED ON:` permite filtrar automaticamente ejemplos donde el modelo ignoro el contexto, mejorando la supervision de conjuntos de entrenamiento.
- Atribucion en entornos con salidas de herramientas: cuando un agente usa la salida de una API o calculadora, el adaptador puede declarar si la respuesta final depende de ese resultado, lo que facilita la depuracion de cadenas de herramientas.
- Evaluacion de fidelidad en investigacion: el adaptador sirve como herramienta de medida para estudiar cuando los modelos confirman informacion externa frente a cuando la repiten sin criterio.
- Deteccion de respuestas sin apoyo externo: la etiqueta `RELIED ON: none` permite identificar respuestas basadas solo en conocimiento parametrico, util para decidir si conviene exigir recuperacion adicional antes de responder.
- Sistemas de moderacion y transparencia: exponer al usuario final de que informacion depende cada respuesta aporta trazabilidad en aplicaciones sensibles donde se requiere justificar el origen de las afirmaciones.

## Benchmarks y rendimiento

Precision equilibrada (balanced accuracy) de auto-atribucion sobre sugerencias del usuario, comparando el modelo sin entrenar con el adaptador CREDIT:

| Conjunto de prueba | Sin entrenar | CREDIT |
|---|---|---|
| Test set | 0,49 | 0,86 |
| Fresh set | 0,51 | 0,86 |
| Large set | 0,53 | 0,79 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB en el repositorio; el modelo base Qwen3-8B requiere espacio adicional segun la precision o cuantizacion empleada.
- En bf16, el modelo base de 8.000 millones de parametros necesita aproximadamente 16 GB solo para los pesos, mas memoria para el contexto y las activaciones; se recomienda una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100).
- En cuantizacion de 4 bits (no documentada especificamente para este adaptador, pero aplicable al modelo base) cabe en GPUs consumer de 12-16 GB, aunque la informacion disponible no detalla los formatos de cuantizacion del adaptador.
- Despliegue con vLLM es posible usando `enable_lora=True` y `max_lora_rank=64`; tambien es compatible con el flujo estandar de PEFT y Transformers descrito en la model card.
- La generacion de referencia usa hasta 8.192 tokens nuevos con temperatura 0,6, top-p 0,95 y top-k 20, lo que implica latencias y consumo de memoria de contexto considerables en respuestas largas con razonamiento.
- No se publican datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CREDIT-Qwen3-8B | 8.000 M (base) + LoRA rango 64 | 8.192 tokens de entrenamiento | Auto-atribucion de informacion externa | Apache 2.0 | Hugging Face (11 descargas) |
| Qwen/Qwen3-8B | 8.000 M | no detallado en la informacion disponible | Modelo base de generacion de texto | Apache 2.0 | Hugging Face |
| Alternativas de auto-atribucion o fidelidad en RAG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables especificos de auto-atribucion con datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La auto-atribucion mejora en los cuatro tipos de informacion externa entrenados, pero solo transfiere parcialmente a tipos no vistos durante el entrenamiento.
- La influencia procedente del system prompt rara vez se atribuye correctamente.
- La linea `RELIED ON:` es un comportamiento entrenado, no una garantia; la propia model card recomienda verificarla con la prueba de eliminacion cuando la precision importa.
- El adaptador esta entrenado y documentado solo para ingles, lo que limita su uso en otros idiomas.
- Requiere anadir la instruccion de entrenamiento al mensaje del usuario y habilitar el modo thinking; su uso fuera de ese formato puede degradar la calidad de la atribucion.
- El entrenamiento descarta ejemplos de mas de 8.192 tokens, por lo que el comportamiento en contextos mas largos no esta cubierto.
- No se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible; al heredar el modelo base Qwen3-8B, arrastra los sesgos y riesgos de alucinacion de este.
- El uso comercial esta permitido bajo Apache 2.0, pero queda sujeto tambien a la licencia del modelo base Qwen3-8B.
- El numero de descargas es muy bajo (11) y no hay likes, lo que indica poca validacion por parte de la comunidad hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyrusZhouzk/CREDIT-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Articulo: https://arxiv.org/abs/2610.35295
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2610.35295
- Codigo: https://github.com/stanford-oval/CREDIT
- Dataset de entrenamiento: https://huggingface.co/datasets/CyrusZhouzk/CREDIT
