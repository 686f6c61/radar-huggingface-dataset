# mradermacher/Salience-27B-R6-i1-GGUF

## Resumen

Salience-27B-R6-i1-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo vectionlabs/Salience-27B-R6, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos de modelos abiertos. El repositorio no contiene un modelo nuevo, sino versiones comprimidas del modelo base pensadas para ejecucion local con llama.cpp y derivados, con el objetivo de reducir el espacio en disco y los requisitos de memoria. El modelo base cuenta con 27.320.697.856 parametros reales segun los pesos en safetensors y el repositorio ocupa 39,5 GB.

Segun el conjunto de etiquetas declarado por el autor, el modelo es multimodal (vision-lenguaje), orientado a razonamiento con modo de pensamiento, generacion de codigo e ingenieria de software, uso agentico en terminal, tool calling y function calling, contexto largo y decodificacion especulativa mediante MTP (multi-token prediction). Tambien incluye la etiqueta "uncensored". La licencia declarada es Apache 2.0 y el unico idioma indicado es el ingles.

La relevancia de esta ficha es practica: permite desplegar un modelo de aproximadamente 27.000 millones de parametros en hardware de consumo o en una sola GPU profesional, eligiendo entre distintos niveles de cuantizacion con tamanos de archivo que van de 11,0 GB a 15,9 GB. No se dispone de documentacion tecnica del modelo base en la informacion proporcionada, por lo que buena parte de las especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas declaradas indican modelo multimodal (vision-lenguaje) y la etiqueta "qwen3.8"; no se documenta la arquitectura concreta |
| Parametros totales | 27.320.697.856 (dato real de los pesos en safetensors del modelo base) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (la etiqueta "long-context" esta presente, sin valor numerico) |
| Tipos de cuantizacion | i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio i1/imatrix y repositorio estatico); safetensors en el modelo base |

Cuantizaciones publicadas en este repositorio (tamanos segun la model card):

| Enlace | Tipo | Tamano (GB) | Notas |
|---|---|---|---|
| Salience-27B-R6.imatrix.gguf | imatrix | 0,1 | Fichero imatrix para crear cuantizaciones propias |
| Salience-27B-R6.i1-Q2_K.gguf | i1-Q2_K | 11,0 | La model card sugiere que IQ3_XXS es probablemente mejor |
| Salience-27B-R6.i1-IQ3_M.gguf | i1-IQ3_M | 12,9 | |
| Salience-27B-R6.i1-Q4_K_S.gguf | i1-Q4_K_S | 15,9 | Tamano, velocidad y calidad optimos segun la model card |

Las cuantizaciones estaticas (sin imatrix) y los ficheros mmproj para la parte de vision se publican en el repositorio mradermacher/Salience-27B-R6-GGUF.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base vectionlabs/Salience-27B-R6 en la documentacion facilitada. El conjunto de etiquetas declarado apunta a un modelo multimodal de vision y lenguaje con modo de razonamiento explicito, e incluye la etiqueta "qwen3.8", que sugiere una posible relacion con la familia Qwen 3, aunque este extremo no se confirma en ningun texto de la model card. Tampoco se indica si se trata de un transformer denso, un MoE o una arquitectura hibrida.

Respecto al entrenamiento, la informacion proporcionada no incluye el numero de tokens, la composicion del dataset ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento. Las etiquetas si mencionan rasgos funcionales como "reasoning", "thinking", "efficient-reasoning", "thinking-efficiency" y "mtp" (multi-token prediction), lo que indica que el modelo incorpora un modo de pensamiento y soporte de decodificacion especulativa, pero sin detalles tecnicos sobre su implementacion. La cuantizacion aqui descrita es obra de mradermacher: aplica un fichero imatrix y produce variantes i1, un proceso que no modifica la arquitectura ni el entrenamiento, solo la precision numerica de los pesos.

## Capacidades

- Generacion de texto conversacional e instrucciones: la etiqueta "instruction-following" y "conversational" estan declaradas en la ficha.
- Razonamiento con modo de pensamiento: etiquetas "reasoning", "thinking", "efficient-reasoning" y "thinking-efficiency".
- Generacion de codigo e ingenieria de software: etiquetas "code", "software-engineering" y "swe".
- Uso agentico en terminal: etiqueta "agentic" y "terminal".
- Tool calling y function calling: etiquetas "tool-use" y "function-calling".
- Capacidades multimodales de vision y lenguaje: etiquetas "multimodal" y "vision-language". Los ficheros mmproj necesarios se distribuyen en el repositorio estatico, no en este.
- Contexto largo: etiqueta "long-context", sin valor numerico declarado.
- Decodificacion especulativa mediante MTP: etiquetas "mtp" y "speculative-decoding".
- Modelo sin censura declarada: etiqueta "uncensored".
- Multilinguismo: limitado al ingles segun el campo de idiomas.

## Casos de uso

- Asistente de codigo en local: con una cuantizacion i1-Q4_K_S de 15,9 GB el modelo puede desplegarse en una estacion de trabajo con una GPU de 24 GB y usarse para autocompletado, refactorizacion y explicacion de codigo sin enviar codigo propietario a servicios externos.
- Agente de terminal y automatizacion de tareas de sistema: las etiquetas "agentic" y "terminal" indican que el modelo esta orientado a ejecutar flujos de varios pasos con llamadas a herramientas, por ejemplo tareas de mantenimiento, scripts de despliegue o diagnostico de errores en un entorno controlado.
- Integracion en pipelines de CI/CD: mediante function calling puede invocarse desde un orquestador para revisar diffs, generar mensajes de commit o clasificar fallos de test, siempre que el entorno de ejecucion permita la inferencia local con llama.cpp.
- Analisis de documentacion tecnica y diagramas: al ser un modelo de vision-lenguaje, con los ficheros mmproj correspondientes del repositorio estatico puede procesar capturas de pantalla, diagramas de arquitectura o imagenes de errores y devolver explicaciones en texto.
- Procesamiento de documentos largos en ingles: la etiqueta "long-context" sugiere la capacidad de trabajar con entradas extensas, adecuada para resumir contratos, informes o hilos de incidencias, aunque la longitud exacta no esta documentada y debe verificarse antes de producción.
- Razonamiento paso a paso en tareas analiticas: el modo de pensamiento con enfasis en eficiencia permite usarlo en problemas de matematicas aplicadas, planificacion o analisis de datos donde interesa ver la traza de razonamiento.
- Despliegue en equipos con recursos limitados: la cuantizacion i1-IQ3_M de 12,9 GB y la i1-Q2_K de 11,0 GB permiten ejecutar el modelo en GPU de 16 GB o en equipos con memoria unificada, a costa de una perdida de calidad que no esta cuantificada en la informacion disponible.
- Experimentacion e investigacion: el fichero imatrix de 0,1 GB permite generar cuantizaciones propias con distintos compromisos de tamano y calidad, util para estudiar el impacto de la cuantizacion en tareas de codigo o razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizaciones no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y la busqueda web realizada no devolvio resultados relacionados con este modelo, sino unicamente paginas corporativas de Microsoft sin relacion con el contenido solicitado.

## Requisitos de hardware

- VRAM estimada segun los tamanos de archivo publicados: i1-Q2_K, aproximadamente 11,0 GB de pesos mas cache KV; i1-IQ3_M, aproximadamente 12,9 GB; i1-Q4_K_S, aproximadamente 15,9 GB. Conviene anadir entre 2 y 6 GB adicionales para el contexto y el runtime, en funcion de la longitud de contexto configurada.
- Referencia de precision completa: 27.320.697.856 parametros en FP16 equivalen a unos 54,6 GB solo de pesos, por lo que el modelo sin cuantizar no cabe en GPU de consumo.
- GPU de consumo: las cuantizaciones i1 de 11,0 a 15,9 GB caben en tarjetas de 16 GB y 24 GB (por ejemplo, RTX 4080, RTX 4090) si se ajusta el contexto; en tarjetas de 12 GB solo es viable la variante Q2_K y con margen muy reducido.
- GPU profesionales: A100 de 40 GB y 80 GB, H100 y L40S pueden ejecutar cualquiera de las cuantizaciones publicadas con contexto amplio.
- Memoria unificada: al ser GGUF, es apto para equipos Apple Silicon y para sistemas con RAM suficiente, descargando parte de las capas a CPU si la VRAM es insuficiente.
- Despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF. La libreria declarada en la ficha es transformers, pero el formato de pesos de este repositorio es GGUF. vLLM y TGI no se mencionan en la informacion disponible para este repositorio.
- Vision: para las capacidades multimodales hay que descargar los ficheros mmproj del repositorio estatico mradermacher/Salience-27B-R6-GGUF, ya que este repositorio i1 no los incluye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados. La unica comparacion que puede establecerse con datos verificables es entre las distintas variantes publicadas por el mismo autor:

| Variante | Tipo | Tamano (GB) | Repositorio | Licencia |
|---|---|---|---|---|
| Salience-27B-R6.i1-Q2_K | i1/imatrix | 11,0 | mradermacher/Salience-27B-R6-i1-GGUF | apache-2.0 |
| Salience-27B-R6.i1-IQ3_M | i1/imatrix | 12,9 | mradermacher/Salience-27B-R6-i1-GGUF | apache-2.0 |
| Salience-27B-R6.i1-Q4_K_S | i1/imatrix | 15,9 | mradermacher/Salience-27B-R6-i1-GGUF | apache-2.0 |
| Cuantizaciones estaticas | Q2_K a Q6_K, IQ1_S a IQ4_XS | No disponible | mradermacher/Salience-27B-R6-GGUF | apache-2.0 |
| vectionlabs/Salience-27B-R6 | safetensors (modelo base) | No disponible | vectionlabs/Salience-27B-R6 | apache-2.0 |

La model card indica que las cuantizaciones IQ suelen ser preferibles a las no IQ de tamano similar y que IQ3_XXS es probablemente mejor que Q2_K. Para modelos alternativos de la misma categoria (aproximadamente 27.000 millones de parametros, multimodales y con modo de razonamiento): no disponible.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion, no un modelo entrenado: hereda integramente los sesgos, limitaciones y comportamiento del modelo base vectionlabs/Salience-27B-R6, sobre el que no se aporta informacion en la documentacion facilitada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Las cuantizaciones de baja precision (IQ1_S, IQ2_XXS, Q2_K) tienden a degradar la coherencia y la fidelidad, pero no hay mediciones publicadas para este modelo concreto.
- Idioma: el campo de idiomas solo declara ingles. El rendimiento en castellano u otras lenguas no esta documentado ni garantizado.
- Longitud de contexto: la etiqueta "long-context" no va acompanada de un valor numerico; no debe asumirse una ventana concreta sin verificar la configuracion del runtime.
- Uso comercial: la licencia declarada es apache-2.0, que permite uso comercial, pero conviene confirmar los terminos del modelo base en su propio repositorio, ya que la cuantizacion no puede otorgar permisos mas amplios que el original.
- La etiqueta "uncensored" implica que el modelo puede no rechazar solicitudes que otros modelos filtrarian; en producción es necesario anadir capas propias de moderacion y control de contenido.
- Capacidades de vision condicionadas: este repositorio no incluye los ficheros mmproj, por lo que sin descargarlos desde el repositorio estatico el modelo funcionara unicamente como modelo de texto.
- Datos incompletos: no hay pipeline declarado, ni benchmarks, ni informacion de entrenamiento, ni numero de descargas o valoraciones reseñables (0 descargas y 0 likes en el momento de la consulta).
- Fechas del repositorio: la ficha indica creacion el 2026-09-10 y actualizacion el 2026-09-10, fechas que proceden del registro de HuggingFace y que conviene verificar antes de citarlas.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; toda la informacion tecnica proviene de la ficha de HuggingFace y de la model card del autor de la cuantizacion.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Salience-27B-R6-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Salience-27B-R6-i1-GGUF/resolve/main/Salience-27B-R6.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/Salience-27B-R6-i1-GGUF/resolve/main/Salience-27B-R6.i1-Q2_K.gguf
- Cuantizacion i1-IQ3_M: https://huggingface.co/mradermacher/Salience-27B-R6-i1-GGUF/resolve/main/Salience-27B-R6.i1-IQ3_M.gguf
- Cuantizacion i1-Q4_K_S: https://huggingface.co/mradermacher/Salience-27B-R6-i1-GGUF/resolve/main/Salience-27B-R6.i1-Q4_K_S.gguf
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Salience-27B-R6-GGUF
- Modelo base: https://huggingface.co/vectionlabs/Salience-27B-R6
- Pagina resumen de descargas del autor: https://hf.tst.eu/model#Salience-27B-R6-i1-GGUF
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
