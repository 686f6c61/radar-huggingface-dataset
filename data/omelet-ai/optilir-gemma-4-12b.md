# omelet-ai/OptiLIR-Gemma-4-12B

## Resumen

OptiLIR-Gemma-4-12B es un adaptador LoRA publicado por omelet-ai sobre el modelo base google/gemma-4-12B-it. Su funcion no es la generacion de texto general, sino la traduccion de peticiones de optimizacion expresadas en lenguaje natural (coreano, ingles o mixto) a OptiLIR, una representacion intermedia orientada a optimizacion que se emite linea a linea y que despues consume un componente determinista denominado grounder (no incluido en este repositorio) para decidir si ejecutar, pedir aclaracion o rechazar la peticion.

El adaptador cubre tres dominios concretos: enrutamiento de vehiculos (vehicle routing), planificacion de turnos de enfermeria (nurse scheduling) e inventario minorista (retail inventory). El modelo base Gemma 4 de 12B parametros aporta la capacidad de comprension multilingue y el adaptador especializa la salida hacia una gramatica formal restringida. El repositorio pesa 0,6 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo.

La relevancia de esta ficha radica en que ejemplifica un patron de diseno cada vez mas comun: usar un LLM grande como capa de interpretacion semantica y delegar la correccion formal y la ejecucion a un sistema determinista. La licencia Apache 2.0 del adaptador y la disponibilidad de la gramatica EBNF para decodificacion restringida lo hacen directamente desplegable en entornos de produccion que necesiten trazabilidad entre la peticion del usuario y la accion ejecutada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 4) |
| Parametros totales | 131.137.536 parametros de adaptador en 656 tensores (F32); el modelo base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el entrenamiento uso secuencias de hasta 4096 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en F32; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko), ingles (en) y mezcla de ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar google/gemma-4-12B-it por separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, con dropout 0,05 y sin bias, aplicado exclusivamente a las proyecciones del modelo de lenguaje: q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, segun el patron regex `^.*language_model.*\.(q_proj|k_proj|v_proj|o_proj|gate_proj|up_proj|down_proj)$`. El modelo base se carga como Gemma4UnifiedForConditionalGeneration. El entrenamiento se realizo con TRL SFTTrainer en modo supervisado, con perdida restringida a los tokens de la respuesta (completion-only), de forma que solo se puntuan los tokens de la IR y no el prompt de sistema ni la conversacion.

Los hiperparametros concretos fueron: 3 epocas, learning rate 1e-4 con schedule coseno y 10 pasos de warmup, batch efectivo de 18 (3 GPUs x 2 secuencias por dispositivo x 3 pasos de acumulacion), longitud maxima de secuencia 4096 tokens, precision bf16 con gradient checkpointing y atencion SDPA, semilla 41. Se uso loss_type=nll para que el softcapping final de logits se aplique correctamente. Una innovacion destacable del pipeline de entrenamiento es que el listado de vocabulario del prompt de sistema se baraja por fila con semilla derivada del id de la fila, lo que evita que el modelo memorice el orden del listado; en inferencia debe usarse el fichero `prompts/<domain>.txt` sin modificar. El dataset de entrenamiento es omelet-ai/OptiLIR-Instruct-v1, con splits train y validation.

## Capacidades

- Traduccion de peticiones de optimizacion en lenguaje natural a la representacion intermedia OptiLIR, un item por linea.
- Cobertura de tres dominios: enrutamiento de vehiculos, planificacion de turnos de enfermeria e inventario minorista.
- Comprension de peticiones en coreano, ingles o mezcla de ambos idiomas.
- Manejo de conversaciones de un turno o de hasta tres turnos tras una pregunta de aclaracion.
- Salida estrictamente estructurada: el modelo emite solo la IR, sin texto adicional.
- Compatibilidad con decodificacion restringida por gramatica EBNF (xgrammar o GBNF) para garantizar la sintaxis de la salida.
- Integracion con el grounder determinista del proyecto, que decide entre ejecutar, pedir aclaracion o rechazar segun las capacidades declaradas del servidor de optimizacion.
- No soporta tool calling generico, agentes de multiples pasos ni vision; su alcance es la generacion de IR para los tres dominios citados.

## Casos de uso

- Enrutamiento de flotas en logistica: el modelo recibe una peticion como "minimiza la distancia total y manten cada ruta por debajo de 80 km" y la convierte en la IR de routing que el grounder mapea a las capacidades del servidor de optimizacion para lanzar el solver.
- Planificacion de turnos hospitalarios: un jefe de servicio describe restricciones de cobertura y descansos en lenguaje natural y el adaptador genera la IR de nurse scheduling que alimenta el motor de resolucion.
- Reposicion de inventario en retail: el modelo interpreta peticiones de minimizacion de costes de stock con restricciones de capacidad de almacen y las traduce a la IR de retail inventory.
- Asistentes conversacionales con aclaracion: gracias al soporte de hasta tres turnos tras una pregunta de clarificacion, el sistema puede pedir datos faltantes al usuario y completar la IR en turnos sucesivos.
- Despliegue con salida garantizada sintacticamente: mediante la gramatica EBNF del dataset y decodificacion restringida en vLLM, se asegura que la salida siempre sea parseable, lo que simplifica la validacion en produccion.
- Integracion en pipelines de investigacion operativa: el adaptador actua como capa de interfaz en lenguaje natural sobre solvers existentes, sin necesidad de reentrenar el modelo base ni de exponer la sintaxis de la IR al usuario final.
- Servicio multilingue para equipos coreanos e internacionales: al cubrir ko, en y mezcla, un mismo backend atiende a usuarios que alternan idiomas en la misma peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,6 GB en disco, pero requiere cargar el modelo base Gemma 4 de 12B parametros. En bf16 el modelo base necesita aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB (estimaciones estandar para 12B, no verificadas en la model card).
- GPU recomendadas: el autor verifico el despliegue con vLLM 0.28.0 sobre una H100 de 80 GB. Para inferencia con transformers en bf16 es suficiente una A100 de 40 GB o una RTX 4090 de 24 GB en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con el modelo base cuantizado a 8 o 4 bits; en GPUs de 16 GB probablemente solo en 4 bits.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con `--enable-lora --lora-modules ir=... --max-lora-rank 32 --max-num-seqs 256`, y decodificacion restringida via xgrammar (logits processor en transformers o `structured_outputs` en el servidor OpenAI-compatible de vLLM).
- Latencia y throughput: no disponibles. El autor advierte que si vLLM agota memoria en el arranque se reduzca `--max-num-seqs`. Se recomienda decodificacion greedy (temperatura 0) con thinking desactivado y limite de salida de 512 tokens, ya que las IR mas largas del dataset ocupan unos 400 tokens con el tokenizador de Gemma 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptiLIR-Gemma-4-12B | 131M de adaptador sobre 12B | 4096 en entrenamiento | LoRA especializado en IR de optimizacion | Apache 2.0 | Hugging Face (adaptador) |
| Adaptador Qwen3 del mismo proyecto | no disponible | no disponible | Misma tarea sobre Qwen3 | no disponible | Mencionado en la model card, sin enlace directo |
| google/gemma-4-12B-it | 12B | no disponible | Modelo base generalista | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo cubre tres dominios (routing, nurse, retail); peticiones fuera de ellos deben ser rechazadas por el grounder, no resueltas por el modelo.
- El grounder, el parser de la IR y la gramatica no forman parte del repositorio del adaptador; sin ellos la salida del modelo no es ejecutable.
- La gramatica EBNF garantiza la sintaxis de la salida, pero no su correccion semantica; el autor lo advierte explicitamente.
- El prompt de sistema debe usarse sin modificar en inferencia; alterar el orden del listado de vocabulario puede degradar el rendimiento, ya que en entrenamiento se barajo por fila.
- Riesgo de alucinacion en la interpretacion de restricciones ambiguas: el modelo puede inventar parametros no presentes en la peticion del usuario, por lo que el grounder debe validar contra las capacidades declaradas.
- Con transformers 5.16.1, Gemma 4 bajo atencion SDPA decodifica incorrectamente lotes con padding a la izquierda (la model card se corta en este punto); se recomienda usar vLLM para generacion por lotes.
- Idiomas limitados a coreano e ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- La licencia Apache 2.0 aplica al adaptador; el uso del modelo base google/gemma-4-12B-it queda sujeto a los terminos de Gemma, que deben revisarse por separado para uso comercial.
- El modelo tiene 9 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion externa por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/omelet-ai/OptiLIR-Gemma-4-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/omelet-ai/OptiLIR-Instruct-v1
- Repositorio de codigo (parser, gramatica, grounder, entrenamiento y evaluacion): https://github.com/omelet-ai/OptiLIR
- Terminos del proyecto (IR, frame, mark, hole, capability, ref, grounder, decision): https://huggingface.co/datasets/omelet-ai/OptiLIR-Instruct-v1#terms
