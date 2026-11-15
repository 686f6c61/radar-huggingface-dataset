# jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-GGUF

## Resumen

Qwen3.5-4B-News-Summarizer-ES-GGUF es la distribucion cuantizada en formato GGUF de un ajuste fino supervisado (LoRA) sobre el modelo base `unsloth/Qwen3.5-4B`, orientado a la generacion de resumenes breves de noticias economicas y empresariales en espanol, con especial enfasis en el contexto colombiano. Lo desarrolla el usuario jaimevera1107 y resuelve un problema muy concreto: producir resumenes de cinco lineas maximo, con cifras y protagonista, a partir del titular y el cuerpo de una noticia, sin introducir informacion ausente en el articulo.

El modelo conserva la arquitectura del Qwen3.5-4B original (transformer denso, 4.205.751.296 parametros totales) y se distribuye con licencia Apache 2.0. Su interes practico esta en el formato de publicacion: el repositorio incluye pesos GGUF con cuantizacion Q4_K_M de 2,7 GB, lo que permite ejecutarlo en una GPU de 8 GB de VRAM mediante Ollama o llama.cpp, algo relevante para redacciones y equipos de monitorizacion de medios con presupuesto de hardware limitado.

La model card documenta una evaluacion sobre 100 articulos reservados, con metricas de fidelidad numerica, uso de muletillas prohibidas y longitud media, comparadas contra resumenes de referencia generados con Gemini. No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso max sequence length de 3072 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (2,7 GB); otras variantes no disponibles |
| Idiomas soportados | Espanol (variante Colombia, dominio economico y empresarial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 5,5 GB); el adaptador LoRA original esta en el repositorio base |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B`, un transformer denso de aproximadamente 4.200 millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA de rango 16 sobre pesos de 16 bits (sin QLoRA), usando la libreria Unsloth, durante 1 epoca, con learning rate de 0,0002 y longitud maxima de secuencia de 3072 tokens. El entrenamiento se realizo con `train_on_responses_only`, de modo que la funcion de perdida se calcula unicamente sobre el resumen generado y no sobre el prompt. Se desactivo el modo de razonamiento del chat template (`enable_thinking=False`).

El conjunto de datos consta de 9.678 noticias economicas y empresariales colombianas emparejadas con resumenes de referencia generados por la API de Google Gemini; 505 articulos se reservaron para evaluacion. El dataset no se publica porque contiene el texto completo de articulos con derechos de autor. El formato de prompt es un turno de usuario con el esquema `Titular: <headline>` seguido de `Cuerpo: <article text>`, acompanado de un system prompt que fija el rol de analista economico colombiano, el limite de cinco lineas, la obligacion de empezar por el protagonista, la inclusion de cifras y la prohibicion de mencionar medio, autor o informacion ausente.

## Capacidades

- Generacion de resumenes extractivo-abstractivos breves de noticias economicas y empresariales en espanol, con limite explicito de cinco lineas.
- Preservacion de cifras del articulo original en la mayoria de los casos (93 % de resumenes sin numeros ajenos al texto, segun la evaluacion del autor).
- Supresion de muletillas y formulas de relleno ("la noticia", "no reporta") mediante el system prompt: 0,0 % de incidencia en la evaluacion.
- Formato conversacional (chat template) compatible con endpoints y con el pipeline `text-generation`.
- Ejecucion local en Ollama y llama.cpp, incluida la variante `--think=false` para desactivar el razonamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Monitorizacion de medios economicos: ingesta automatizada de titulares y cuerpos de noticias colombianas para generar un boletin diario de cinco lineas por articulo, ejecutando el modelo Q4_K_M en una GPU de 8 GB dentro del propio servidor de la redaccion.
- Alertas de mercado para mesas de analisis: resumen de comunicados y noticias empresariales con extraccion de cifras (variaciones, montos, resultados) para alimentar paneles internos, aprovechando que el modelo copia los numeros del texto en la mayoria de los casos.
- Preprocesado para RAG: condensar articulos largos antes de indexarlos en una base vectorial, reduciendo el consumo de tokens en el recuperador y en el modelo generador posterior.
- Clasificacion y triaje editorial: generar resumenes cortos que un editor humano revisa para decidir que noticias merecen cobertura ampliada, con el modelo actuando como primer filtro sobre volumen alto de articulos.
- Prototipado en estaciones de trabajo sin GPU dedicada: despliegue con Ollama en equipos con 8 GB de VRAM o incluso en CPU mediante llama.cpp, lo que permite validar el flujo editorial antes de invertir en infraestructura.
- Generacion de resumenes para newsletters y canales internos de una empresa: el system prompt fija el estilo (protagonista primero, cifras incluidas, sin mencionar el medio), lo que reduce la variabilidad estilistica entre resumenes consecutivos.
- Investigacion sobre ajuste fino eficiente: el par LoRA + GGUF sirve como referencia reproducible de un pipeline Unsloth de bajo coste para dominios especializados en espanol.

## Benchmarks y rendimiento

Evaluacion del autor sobre 100 articulos reservados (held-out), comparada con resumenes de referencia de Gemini:

| Metrica (100 articulos) | Este modelo | Gemini (referencia) |
|---|---|---|
| Uso de muletillas prohibidas ("la noticia", "no reporta"...) | 0,0 % | 1,0 % |
| Resumenes con un numero ausente en el articulo | 7,0 % | 10,0 % |
| Longitud media (palabras) | 43,6 | 46,1 |
| ROUGE-L frente a Gemini | 0,6159 | - |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para la variante Q4_K_M (2,7 GB de pesos mas overhead de contexto); el autor indica que funciona en una GPU de 8 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070); en el extremo profesional, A100 o H100 no son necesarias para este tamano, aunque permitirian mayor paralelismo por instancia.
- Cabe en GPU consumer: si, en modelos con 8 GB de VRAM en adelante; tambien es viable en CPU via llama.cpp, con latencia mayor.
- Opciones de despliegue: Ollama (`ollama run hf.co/jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-GGUF:Q4_K_M --think=false`), llama.cpp (`llama-cli -hf ...`), y cualquier runtime compatible con GGUF. vLLM y TGI requeririan los pesos en safetensors del repositorio base, no incluidos en este repo GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-News-Summarizer-ES-GGUF | 4,2 B | No disponible | Resumen de noticias economicas en espanol (Colombia) | Apache 2.0 | GGUF |
| Qwen3.5-4B (base, `unsloth/Qwen3.5-4B`) | 4,2 B | No disponible | Proposito general, multilingue | No disponible en la informacion | Safetensors |
| Gemini (referencia de evaluacion) | No disponible | No disponible | Proposito general, API cerrada | Terminos de servicio de Google | API |

No se dispone de datos de benchmarks comparativos con otros modelos de resumen en espanol en la informacion proporcionada; la unica comparacion publicada es la de la tabla de evaluacion frente a Gemini.

## Limitaciones y advertencias

- Dominio acotado: solo se ha probado con noticias economicas y empresariales en espanol de Colombia; otros dominios o variantes dialectales estan sin evaluar.
- Riesgo de atribucion erronea: el autor advierte que el modelo puede confundir quien hizo que (por ejemplo, nombrar al regulador en lugar de la empresa como actor); los hechos deben verificarse antes de publicar.
- Fidelidad numerica imperfecta: el 7,0 % de los resumenes de la evaluacion incluyeron una cifra ausente en el articulo, por lo que la validacion humana de datos es necesaria en entornos editoriales.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre un corpus de noticias colombianas y resumenes generados por Gemini, puede heredar sesgos de seleccion editorial y del modelo generador de referencias.
- Riesgo de alucinacion: presente en la forma de cifras o atribuciones no presentes en el texto; el system prompt reduce pero no elimina el problema.
- Restriccion de licencia: los pesos se publican bajo Apache 2.0, pero los resumenes de referencia se generaron con la API de Gemini; el autor recomienda revisar los terminos de Google si se reutiliza el modelo comercialmente. Ademas, el dataset de entrenamiento contiene texto de articulos con derechos de autor y no se distribuye.
- Contexto de entrenamiento limitado a 3072 tokens: articulos mas largos pueden truncarse o degradar la calidad del resumen.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-GGUF
- Repositorio del adaptador LoRA base: https://huggingface.co/jaimevera1107/Qwen3.5-4B-News-Summarizer-ES-LoRA
- Modelo base de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
