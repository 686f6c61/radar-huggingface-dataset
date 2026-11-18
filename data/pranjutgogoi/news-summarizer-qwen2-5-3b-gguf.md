# pranjutgogoi/news-summarizer-qwen2.5-3b-gguf

## Resumen

News Summarizer (Qwen2.5-3B, GGUF) es un ajuste fino completo de Qwen/Qwen2.5-3B-Instruct, desarrollado por el usuario pranjutgogoi, especializado en una única tarea: convertir un artículo periodístico en inglés o neerlandés en un titular corto y un resumen de 40-60 palabras, ambos en inglés y devueltos como un objeto JSON con dos campos (`short_title` y `summary`). El modelo parte de la arquitectura transformer decoder-only de Qwen2.5, con 3.085.938.688 parámetros, y se distribuye únicamente como un archivo GGUF cuantizado en Q4_K_M de 1,9 GB, pensado para ejecutarse en CPU con llama.cpp, Ollama o LM Studio.

La relevancia del modelo es acotada y práctica: ofrece una alternativa de muy bajo coste para generar tarjetas de titular y resumen en pipelines editoriales o de agregación de noticias, con una tasa de JSON válido del 99,9% y de cumplimiento de reglas de longitud del 99,8% sobre 1.500 artículos de evaluación. No obstante, el propio autor reconoce que es "notablemente más débil" que modelos mayores y que su punto flaco es la entrada en neerlandés.

La licencia es el factor limitante principal: hereda la Qwen Research License del modelo base, lo que restringe el uso a investigación y fines no comerciales. El modelo no está pensado para resúmenes de seguridad crítica, legales o médicos, y el autor advierte de que puede omitir o difuminar detalles en artículos largos, por lo que recomienda verificar los hechos antes de publicar su salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en, nl (entrada); salida solo en ingles |
| Licencia | qwen-research (Qwen Research License, solo investigacion y no comercial) |
| Formato de pesos | GGUF (`model-q4_k_m.gguf`, 1,9 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.085.938.688 parametros. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales sobre el modelo base; esa informacion no esta disponible en la model card. El unico dato de entrenamiento implicito es el diseno de la tarea: el modelo fue entrenado con un system prompt fijo que exige una salida JSON estricta con dos campos, reglas de longitud (titular de 6-14 palabras y maximo 160 caracteres; resumen de 40-60 palabras y maximo 600 caracteres) y la obligacion de escribir ambos campos en ingles independientemente del idioma del articulo.

La innovacion tecnica del artefacto no reside en la arquitectura, sino en la especializacion y el empaquetado: un unico archivo GGUF Q4_K_M de 1,9 GB que ejecuta la tarea en CPU sin GPU, con decodificacion determinista recomendada (`--temp 0`). No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de titulares periodisticos de 6-14 palabras en ingles, con voz activa, tiempo presente y sin clickbait.
- Generacion de resumenes de 40-60 palabras con estructura de piramide invertida (hecho principal primero, despues detalles de apoyo).
- Salida estructurada en JSON valido con exactamente dos campos (`short_title` y `summary`), sin prosa ni bloques de markdown.
- Comprension de articulos de entrada en ingles y neerlandes, con traduccion implicita de la salida al ingles.
- Extraccion de numeros, nombres y fechas concretas presentes en el articulo para incluirlos en el resumen.
- Ejecucion en CPU mediante llama.cpp, Ollama o LM Studio, sin requisitos de GPU.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; la model card no los menciona.

## Casos de uso

- Agregadores de noticias: el modelo recibe el texto completo de cada articulo y devuelve un titular y un resumen listos para renderizar en una tarjeta, con JSON valido en el 99,9% de los casos, lo que simplifica la integracion sin parseo defensivo complejo.
- Boletines y newsletters automatizados: se puede procesar por lotes un conjunto de articulos en ingles y generar entradas breves y homogeneas de 40-60 palabras, adecuadas para un digest diario.
- Preprocesado editorial en redacciones: como primer borrador de titular y sumario que un editor humano revisa y corrige, aprovechando el bajo coste de inferencia en CPU.
- Normalizacion de contenido multilingue: articulos en neerlandes se convierten en titulares y resumenes en ingles, util para medios que publican en varios idiomas y quieren una version inglesa rapida (aunque el autor advierte de que es el caso mas debil).
- Indexacion y busqueda semantica: generar campos cortos y estructurados para metadatos de un motor de busqueda interno o un sistema RAG sobre un corpus de noticias.
- Prototipado y demos en entornos sin GPU: al caber en 1,9 GB y ejecutarse con llama.cpp en CPU, sirve para validar un pipeline de sumarizacion antes de invertir en modelos mayores.
- Filtrado y enriquecimiento de feeds RSS: extraer titulo y resumen normalizados de cientos de fuentes para clasificacion posterior o deteccion de duplicados.

## Benchmarks y rendimiento

Evaluacion del autor sobre 1.500 articulos reservados, juzgados por Qwen2.5-32B-Instruct contra un modelo Qwen2.5 de mayor tamano:

| Metrica | Valor |
|---|---|
| JSON valido | 99,9% |
| Reglas de longitud cumplidas | 99,8% |
| Juzgado no peor que el modelo mayor (global) | 53,5% |
| Juzgado no peor que el modelo mayor, ingles a ingles | 73,2% |
| Juzgado no peor que el modelo mayor, neerlandes a ingles | 47,6% |
| Juzgado mejor que el modelo mayor | 3,4% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo GGUF Q4_K_M ocupa 1,9 GB y se ejecuta en CPU con llama.cpp, Ollama o LM Studio.
- GPU recomendadas: no aplica; cualquier GPU con al menos ~2-3 GB de memoria libre podria alojar el modelo con offloading, pero no es el escenario previsto.
- Cabe en cualquier equipo consumer: la inferencia en CPU es viable en portatiles modernos; el factor limitante es la RAM disponible (unos 2-3 GB adicionales al tamano del archivo para el contexto).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor recomienda `--temp 0` para decodificacion determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| news-summarizer-qwen2.5-3b-gguf | 3.085.938.688 | no disponible | GGUF Q4_K_M | qwen-research (no comercial) | Sumarizacion de noticias EN/NL a EN |
| Qwen/Qwen2.5-3B-Instruct (base) | 3.085.938.688 | no disponible | safetensors, GGUF | qwen-research | Instrucciones generales |
| Qwen2.5-32B-Instruct (juez de la evaluacion) | no disponible | no disponible | no disponible | qwen-research | Instrucciones generales, mayor calidad |

La comparativa directa con alternativas especializadas en sumarizacion no esta disponible en la informacion proporcionada. El propio autor situa al modelo por debajo de un Qwen2.5 de mayor tamano en calidad de resumen (solo el 53,5% de las salidas se juzgaron no peores que las del modelo grande), aunque con una fiabilidad de formato muy alta.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivo para investigacion y fines no comerciales; no es apta para produccion comercial sin autorizacion.
- Puede omitir o difuminar detalles en articulos largos; el autor recomienda verificar los hechos antes de publicar la salida.
- Salida unicamente en ingles; no genera titulares ni resumenes en neerlandes ni en otros idiomas.
- Rendimiento mas debil con entrada en neerlandes: solo el 47,6% de las salidas se juzgaron no peores que las del modelo mayor, frente al 73,2% en ingles a ingles.
- No probado para resumenes de seguridad critica, legales o medicos.
- Riesgo de alucinacion: aunque el prompt prohibe inventar detalles, el modelo puede introducir datos no presentes en el articulo; no hay evaluacion publicada de fidelidad factual mas alla del juicio comparativo.
- Dependencia del system prompt exacto con el que fue entrenado; cambiar el prompt puede degradar el formato JSON y el cumplimiento de longitudes.
- Un solo archivo y una sola cuantizacion (Q4_K_M); no hay variantes en safetensors ni otras precisiones para evaluar el impacto de la cuantizacion.
- Sin informacion publicada sobre sesgos, contexto maximo ni composicion del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranjutgogoi/news-summarizer-qwen2.5-3b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
