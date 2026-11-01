# omelet-ai/OptiLIR-Qwen3-8B

## Resumen

OptiLIR-Qwen3-8B es un adaptador LoRA sobre el modelo base Qwen/Qwen3-8B, desarrollado por omelet-ai, que traduce peticiones de optimizacion expresadas en lenguaje natural (coreano, ingles o mixto) a OptiLIR (Optimization-oriented Language Intermediate Representation), una representacion intermedia orientada a optimizacion con un item por linea. El adaptador cubre tres dominios concretos: enrutamiento de vehiculos (vehicle routing), planificacion de turnos de enfermeria (nurse scheduling) e inventario minorista (retail inventory). No es un modelo de proposito general: es un componente especializado dentro de un pipeline mayor.

La arquitectura subyacente es la del transformer denso Qwen3-8B, al que se le aplica un adaptador LoRA de rango 32 (alpha 64) sobre los modulos de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), con 87.293.952 parametros entrenables distribuidos en 504 tensores. El adaptador se entrena con SFT supervisado y perdida solo sobre los tokens de la IR (completion-only), de modo que el modelo aprende a emitir exclusivamente la representacion intermedia y no texto conversacional.

Su relevancia reside en el enfoque: en lugar de confiar en que un LLM genere codigo de optimizacion directamente, el adaptador produce una IR declarativa que un componente determinista externo (el grounder, no incluido en el repositorio) mapea sobre las capacidades declaradas del servidor de optimizacion y decide si ejecutar, pedir aclaracion o rechazar la peticion. Esto separa la comprension del lenguaje natural de la validacion semantica y la ejecucion, un patron util para sistemas de planificacion en produccion donde la correccion importa mas que la fluidez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8B (modelo base) + 87.293.952 parametros del adaptador |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; entrenamiento con max_seq_length de 4096 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en F32; el modelo base admite las cuantizaciones habituales de Qwen3-8B) |
| Idiomas soportados | coreano (ko), ingles (en), y mezcla de ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-8B, un transformer denso de 8.000 millones de parametros. La configuracion LoRA usa r=32, alpha=64, dropout=0.05 y bias=none, con modulos objetivo down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj y v_proj. El entrenamiento se realizo con TRL SFTTrainer (PEFT 0.20.0, TRL 1.12.0, Transformers 5.16.1, PyTorch 2.9.1+cu128) durante 3 epocas, con learning rate 1e-4 y schedule coseno con 10 pasos de warmup, batch efectivo de 16, longitud maxima de secuencia de 4096 tokens, precision bf16, gradient checkpointing y atencion SDPA. La semilla fue 41.

La perdida es completion-only: solo se puntuan los tokens de la IR, no el prompt ni el turno del usuario. El prompt de sistema de cada dominio se toma de `prompts/<domain>.txt` del dataset y, durante el entrenamiento, su listado de vocabulario se baraja por fila con semilla derivada del id de la fila (`system_prompt(domain, seed=id, forms=True)`, `SHUFFLE=1`); en inferencia se usa el fichero publicado sin modificar. El dataset de entrenamiento es omelet-ai/OptiLIR-Instruct-v1 (split `train`, con `validation` para evaluacion durante el entrenamiento). El adaptador espera decodificacion greedy (sin sampling) y `enable_thinking=False`. Se menciona que el turno de pregunta de aclaracion del sistema fue reformulado en 96 filas del dataset (84 de train, 6 de validation, 6 de test) despues del entrenamiento, sin cambiar las IRs; el adaptador se entreno y las metricas se calcularon sobre esa version revisada.

## Capacidades

- Traduccion de peticiones de optimizacion en lenguaje natural a OptiLIR, una IR declarativa con un item por linea.
- Cobertura de tres dominios: enrutamiento de vehiculos, planificacion de turnos de enfermeria e inventario minorista.
- Comprension de peticiones en coreano, ingles o mezcla de ambos idiomas.
- Manejo de conversaciones de un turno o de hasta tres turnos tras una pregunta de aclaracion.
- Capacidad de pedir aclaracion cuando un parametro no esta especificado (por ejemplo, `UNSPECIFIED` cuando se pide una carga de trabajo equitativa sin definir la metrica de equidad).
- Generacion estrictamente limitada a la IR: no produce texto conversacional ni explicaciones.
- Compatibilidad con decodificacion restringida por gramatica EBNF (estilo xgrammar/GBNF) para garantizar que la salida respete la sintaxis de la IR.
- No incluye tool calling generico, function calling, vision, audio ni modo de razonamiento explicito; el modo thinking debe desactivarse.

## Casos de uso

- Traduccion de peticiones de rutas a IR ejecutable: un operador logistico describe en lenguaje natural una restriccion ("minimiza la distancia total y manten cada ruta por debajo de 80 km") y el adaptador la convierte en items de IR que el grounder valida contra las capacidades del servidor de optimizacion antes de ejecutar.
- Planificacion de turnos de enfermeria desde texto libre: el personal de gestion describe necesidades de cobertura y el modelo genera la IR de restricciones y objetivos, pidiendo aclaracion cuando la metrica de equidad no esta definida.
- Gestion de inventario minorista asistida: peticiones sobre niveles de stock, reposicion y costes se transforman en IR para el motor de optimizacion, reduciendo el trabajo manual de modelado.
- Front-end conversacional para un solver de optimizacion: el adaptador actua como capa de comprension en un chatbot interno que, tras una o varias aclaraciones (hasta tres turnos), emite la IR definitiva.
- Pipelines con salida garantizada sintacticamente: integrado en vLLM con `structured_outputs` y la gramatica EBNF del dominio, se puede desplegar como endpoint OpenAI-compatible donde la salida siempre parsea como IR valida.
- Generacion de datos sinteticos y evaluacion de grounders: al producir IRs a partir de peticiones controladas, sirve para probar el componente determinista de grounding y las decisiones de ejecutar/aclarar/rechazar.
- Soporte multilingue coreano-ingles en equipos mixtos: permite que usuarios que redactan en coreano o en ingles (o mezclan ambos) utilicen el mismo sistema de planificacion sin traduccion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta una metrica cualitativa de validacion sobre la debilidad conocida: en peticiones de enfermeria que piden carga equitativa sin especificar la metrica, la salida correcta es preguntar (`UNSPECIFIED`); este adaptador emitio `RANGE` (diferencia entre el turno mas cargado y el menos cargado) en 8 de 19 filas de validacion de ese tipo, frente a 20 de 21 correctas en test. El adaptador Gemma 4 12B entrenado con los mismos datos pregunto correctamente en las 40 filas.

## Requisitos de hardware

- El adaptador en si ocupa 0.4 GB (504 tensores en F32); el coste real de inferencia lo determina el modelo base Qwen3-8B.
- VRAM estimada para el modelo base en bf16: aproximadamente 16 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits alrededor de 9-10 GB y en 4 bits alrededor de 5-6 GB (estimaciones habituales para un modelo denso de 8B, no publicadas por el autor).
- GPU recomendadas: el autor verifico el despliegue con vLLM 0.28.0 sobre una H100 de 80 GB con `--max-num-seqs 256`; tambien es viable en A100 40/80 GB y en GPUs consumer de gama alta (RTX 4090 24 GB) con el modelo base en bf16 o cuantizado.
- Cabe en GPU consumer: si, con cuantizacion del modelo base (por ejemplo 4 u 8 bits) en tarjetas de 12-24 GB.
- Opciones de despliegue: vLLM con `--enable-lora --lora-modules ir=omelet-ai/OptiLIR-Qwen3-8B --max-lora-rank 32`; transformers + PEFT; transformers con procesador de logits de xgrammar para la gramatica; el autor no menciona llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor recomienda limitar la salida a 512 tokens (las IRs mas largas ocupan unos 400 tokens con el tokenizer de Gemma 4 y 330 con el de Qwen3) y decodificar de forma greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptiLIR-Qwen3-8B | 8B + 87,3M (LoRA) | entrenado a 4096 tokens | Adaptador LoRA para traduccion a IR de optimizacion en 3 dominios | Apache 2.0 | HuggingFace (adaptador PEFT) |
| OptiLIR (adaptador Gemma 4 12B, mencionado por el autor) | 12B + LoRA | no disponible | Mismo dataset y tarea; pregunto correctamente en 40/40 filas de validacion de equidad | no disponible | no disponible (solo referenciado en la model card) |
| Qwen/Qwen3-8B (modelo base) | 8B | no disponible en la informacion | LLM generalista; no produce IR de optimizacion sin fine-tuning | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas opciones; la unica comparacion cuantitativa publicada es la de la debilidad conocida en validacion (8/19 frente a 40/40 del adaptador Gemma 4 12B).

## Limitaciones y advertencias

- El adaptador solo cubre tres dominios (routing, nurse, retail); fuera de ellos no hay garantia de comportamiento correcto.
- La IR generada puede ser sintacticamente valida pero semanticamente incorrecta: la gramatica EBNF restringe la forma, no el significado.
- Debilidad conocida: ante peticiones de enfermeria con carga equitativa sin metrica definida, emitio `RANGE` en lugar de preguntar (`UNSPECIFIED`) en 8 de 19 filas de validacion de ese tipo (20 de 21 correctas en test).
- No incluye el grounder: el mapeo de la IR a capacidades del servidor y la decision de ejecutar/aclarar/rechazar debe implementarse aparte.
- Requiere usar el prompt de sistema del dataset sin modificar y decodificacion greedy con thinking desactivado; desviarse de ese protocolo puede degradar la salida.
- Idiomas limitados a coreano e ingles (y mezcla); no se declara soporte de castellano.
- Riesgo de alucinacion en la interpretacion de restricciones ambiguas; el diseno mitiga parte del problema con el turno de aclaracion, pero no lo elimina.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la correccion de las IRs en produccion.
- El repositorio tiene muy poca traccion (12 descargas, 0 likes) y fue creado en octubre de 2026; no hay evidencia de uso en produccion ni auditoria externa.
- La reformulacion posterior de 96 filas del dataset (incluido el turno de aclaracion) implica que las metricas reportadas corresponden a la version revisada, no a la original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omelet-ai/OptiLIR-Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/omelet-ai/OptiLIR-Instruct-v1
- Terminologia (IR, frame, mark, hole, capability, ref, grounder, decision): https://huggingface.co/datasets/omelet-ai/OptiLIR-Instruct-v1#terms
- Codigo (parser y gramatica de la IR, grounder, entrenamiento y evaluacion): https://github.com/omelet-ai/OptiLIR
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
