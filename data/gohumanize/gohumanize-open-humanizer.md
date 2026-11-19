# gohumanize/gohumanize-open-humanizer

## Resumen

GoHumanize Open Humanizer es un modelo de generacion de texto de 4.022 millones de parametros especializado en reescribir prosa en ingles con estilo de IA hacia un registro mas natural y humano. Se trata de un fine-tune completo (todos los pesos actualizados) del modelo base Qwen3-4B de Alibaba, desarrollado por el equipo de GoHumanize.ai como version publica y educativa de su tecnologia de humanizacion de texto. El modelo se distribuye bajo licencia Apache-2.0 y esta disponible en formato safetensors y GGUF.

El modelo resuelve un problema concreto: transformar texto que presenta las marcas tipicas de la generacion automatica (transiciones de relleno, frases hechas de LLM, longitud de frase uniforme, ausencia de contracciones) en texto que se lee como escrito por una persona. Para ello se entreno sobre 2.629 pares de pasajes (entrada con estilo IA, original humano), donde el lado humano proviene de 2.000 pasajes de dominio publico de Project Gutenberg y 629 pasajes de prosa moderna de agencias federales estadounidenses, mientras que el lado con estilo IA fue generado por gpt-4o-mini y DeepSeek-chat.

Es relevante ahora porque ofrece, con pesos abiertos y un dataset documentado, una implementacion reproducible de una tarea que hasta hace poco solo existia en productos cerrados, y porque su evaluacion publica separa explicitamente la calidad de la reescritura de cualquier supuesta evasion de detectores de IA, algo que el autor declara fuera del alcance del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con maximo de 1.024 tokens) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M); safetensors en bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parametros. El ajuste es un full fine-tune realizado con Unsloth: se actualizaron todos los pesos en bf16 con AdamW de 8 bits y gradient checkpointing. La perdida se calculo unicamente sobre los tokens del asistente (es decir, sobre el texto humano objetivo), no sobre la entrada. Se entrenaron 2 epocas con tasa de aprendizaje 2e-5 con decaimiento coseno, tamano de lote efectivo 16, longitud maxima de 1.024 tokens y semilla 13, sobre 2.629 pares de entrenamiento y 254 de test. El entrenamiento completo se ejecuto en una unica NVIDIA H100 de 80 GB en Modal y duro 8 minutos, con perdidas finales de 0,99 en entrenamiento y 1,19 en evaluacion.

La innovacion principal esta en la construccion del dataset mas que en la arquitectura: los pares se disenaron para que el modelo aprenda a reestructurar frases y no solo a sustituir palabras, y se eliminaron de los objetivos las datelines de notas de prensa y los numeros de nota al pie para que el modelo no aprenda a inventarlos. El uso previsto es en formato chat con el modo de razonamiento (thinking) desactivado y un system prompt fijo que instruye a variar la longitud de frase, usar lenguaje concreto y mantener el significado, los hechos y el orden de las ideas.

## Capacidades

- Reescritura de texto en ingles para eliminar marcas estilisticas de generacion automatica (transiciones de relleno, frases hechas, ritmo uniforme).
- Transferencia de estilo preservando el significado y el orden de las ideas, con una ratio de longitud cercana a la del texto humano de referencia.
- Generacion de texto conversacional en formato chat mediante la plantilla de Qwen3 con thinking desactivado.
- Conservacion de nombres y tokens capitalizados (recall de 0,673 frente a 0,619 de la entrada con estilo IA).
- Reduccion de frases hechas de LLM a 0,02 por texto y de palabras de transicion a 0,12 por 100 palabras.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso; el modelo esta disenado para una unica tarea de reescritura.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Edicion de articulos y entradas de blog: se introduce un borrador generado por un LLM y el modelo devuelve una version con longitud de frase variada (22,6 palabras de media, frente a 15,2 del base y 26,7 del objetivo humano) y menor densidad de frases hechas, adecuada como primer paso de edicion antes de la revision humana.
- Normalizacion de textos corporativos: comunicados, notas de prensa y descripciones de producto que han pasado por un asistente automatico pueden reescribirse para eliminar datelines y estructuras de nota de prensa, ya que el entrenamiento excluyo explicitamente esos elementos de los objetivos.
- Preprocesado en pipelines de publicacion: el modelo puede integrarse como etapa de post-proceso entre la generacion y la revision editorial, con generacion de varias muestras y seleccion de la que mas se aleja del original (estrategia que el autor implementa en su cliente Python y su servidor MCP).
- Investigacion sobre deteccion y atribucion de texto: al ser un humanizador abierto con dataset y evaluacion publicos, sirve para construir y validar clasificadores de texto generado por IA frente a reescrituras controladas.
- Docencia y divulgacion sobre estilistica computacional: permite demostrar de forma reproducible como se construyen pares de entrenamiento a partir de corpus de dominio publico y como se mide la transferencia de estilo con BERTScore y ROUGE-L.
- Despliegue local sin GPU: las builds GGUF permiten ejecutar el modelo con Ollama en equipos de consumo para tareas de reescritura por lotes de documentos en ingles, sin enviar el texto a servicios externos.
- Integracion en herramientas de escritura: el servidor MCP (`npx gohumanize-open-humanizer-mcp`) y el cliente Python (`pip install gohumanize-open-humanizer`) permiten conectarlo a asistentes y editores que soporten el protocolo, gestionando automaticamente los reintentos.

## Benchmarks y rendimiento

Evaluacion sobre 254 pasajes retenidos (54 modernos, 200 de libros) frente al original humano. Las metricas miden el acercamiento al objetivo humano, no la evasion de detectores.

| Medida (254 pares retenidos) | Entrada con estilo IA | Qwen3-4B base | Open Humanizer | Objetivo humano |
|---|---|---|---|---|
| BERTScore F1 vs humano (mayor = significado mas cercano) | 0,923 | 0,905 | 0,931 | no disponible |
| ROUGE-L vs humano (mayor = redaccion mas cercana) | 0,542 | 0,444 | 0,595 | no disponible |
| Nombres/tokens capitalizados conservados (recall) | 0,619 | 0,604 | 0,673 | no disponible |
| Ratio de longitud vs humano | 1,08 | 0,83 | 0,97 | 1,00 |
| Contracciones por 100 palabras | 0,20 | 0,62 | 0,05 | 0,14 |
| Palabras de transicion por 100 palabras | 0,88 | 0,02 | 0,12 | 0,16 |
| Frases hechas de LLM por texto | 0,40 | 0,00 | 0,02 | 0,01 |
| Longitud media de frase (palabras) | 22,6 | 15,2 | 22,6 | 26,7 |

Tasa de reescritura sobre 254 pasajes retenidos, tres intentos por pasaje a temperatura 0,9:

| Metrica | Valor |
|---|---|
| Pasajes modernos devueltos casi sin cambios (mas del 90% de palabras conservadas), de 30 articulos no vistos en entrenamiento | 29,0% |
| Pasajes de libros devueltos casi sin cambios | 19,2% |
| Reescrituras modernas que pierden una cifra | 22,1% |
| Datelines, numeros de nota al pie o enlaces inventados, de 762 salidas | 0 |

Las cifras modernas se basan en 162 salidas de 54 pasajes, por lo que diferencias de pocos puntos estan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 16 GB o mas para contexto largo.
- Cuantizaciones GGUF: la build Q4_K_M reduce los pesos a unos 2,5-3 GB, ejecutable en CPU o en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: NVIDIA H100 o A100 para despliegue en bf16 con mayor throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en bf16; GPUs de 8-12 GB (RTX 4070, RTX 3060 de 12 GB) para cuantizaciones de 8 bits o GGUF.
- Cabe en GPU de consumo: si, tanto en bf16 en tarjetas de 24 GB como en GGUF Q4_K_M en tarjetas de 6 GB o en CPU.
- Opciones de despliegue: transformers (referencia oficial), vLLM y TGI (el modelo esta etiquetado como endpoints_compatible y text-generation-inference), llama.cpp y Ollama mediante GGUF, ademas del servidor MCP y el cliente Python oficiales.
- Latencia y throughput: no se han publicado cifras de latencia ni de tokens por segundo en la informacion disponible. El entrenamiento completo requirio 8 minutos en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoHumanize Open Humanizer | 4.022 millones | no disponible (entrenamiento a 1.024 tokens) | Reescritura estilo IA a humano | Apache-2.0 | Pesos abiertos en HF (safetensors y GGUF) |
| Qwen3-4B (base) | 4.022 millones | no disponible en la informacion proporcionada | Generacion de texto general | Apache-2.0 | Pesos abiertos en HF |
| Humanizadores comerciales cerrados | no disponible | no disponible | Reescritura estilo IA a humano | Propietaria | Solo API |
| Modelos de parafrasis generalistas (p. ej. T5/BART fine-tuneados) | variable | variable | Parafrasis y simplificacion | variable | variable |

La comparacion cuantitativa directa con alternativas de la misma categoria no esta disponible: no se han publicado resultados de benchmarks de otros humanizadores abiertos en la informacion proporcionada. Frente a su modelo base, el Open Humanizer mejora BERTScore (0,931 frente a 0,905), ROUGE-L (0,595 frente a 0,444) y el recall de nombres (0,673 frente a 0,604), y se acerca mucho mas a la longitud del texto humano (ratio 0,97 frente a 0,83).

## Limitaciones y advertencias

- Tres cuartas partes de los objetivos humanos son libros anteriores a 1929 y el resto es escritura oficial de agencias federales de EE. UU., por lo que el modelo se inclina hacia lo literario por un lado y lo administrativo por el otro; la prosa moderna informal es su principal carencia.
- Alrededor de una de cada cinco reescrituras de texto con muchas cifras pierde al menos una figura (22,1% en la evaluacion), lo que lo hace inadecuado sin revision para contenido financiero, legal o tecnico con datos numericos.
- En texto moderno, un unico intento devuelve el pasaje casi sin cambios aproximadamente tres de cada diez veces (29,0%); se recomienda generar varias muestras y quedarse con la que mas se aleja del original.
- El modelo solo soporta ingles; no hay soporte documentado de otros idiomas.
- Las metricas publicadas miden el acercamiento al estilo humano, no la evasion de detectores de IA; el autor declara explicitamente que el modelo no hace ninguna afirmacion sobre detectores.
- Riesgo de alucinacion: aunque el autor reporta cero datelines, numeros de nota al pie o enlaces inventados en 762 salidas, la reescritura puede alterar matices o introducir reformulaciones que cambien levemente el enfasis; requiere revision humana en contextos sensibles.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible; la composicion del corpus (literatura anglosajona de dominio publico y documentos oficiales estadounidenses) puede sesgar el registro y el vocabulario.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-4B impone sus propios terminos, que deben verificarse antes de un despliegue en produccion.
- No es un modelo de proposito general: no se documentan capacidades de tool calling, agentes, vision ni razonamiento multi-paso, y su uso fuera de la tarea de reescritura no esta evaluado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gohumanize/gohumanize-open-humanizer
- Pagina del proyecto (dataset, codigo, evaluacion y write-up): https://gohumanize.ai/open-model
- Demo en navegador: https://gohumanize.ai/open-model
- Dataset: https://huggingface.co/datasets/gohumanize/gohumanize-open-humanizer-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Run de Weights & Biases: https://wandb.ai/gohumanize/gohumanize-open-humanizer/runs/d326rxss
- Servidor MCP: `npx gohumanize-open-humanizer-mcp`
- Cliente Python: `pip install gohumanize-open-humanizer`
