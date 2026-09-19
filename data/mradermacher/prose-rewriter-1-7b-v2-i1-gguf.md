# mradermacher/prose-rewriter-1.7b-v2-i1-GGUF

## Resumen

prose-rewriter-1.7b-v2-i1-GGUF es una recopilación de cuantizaciones GGUF creada por mradermacher a partir del modelo chartreuse-verte/prose-rewriter-1.7b-v2. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión a formatos de precisión reducida (Q2_K, IQ3_XXS, Q4_K_M, Q5_K_M, Q6_K, entre otros) generada con el método de imatrix, que calibra la cuantización a partir de un fichero de importancias para minimizar la pérdida de calidad respecto a los pesos originales en safetensors.

El modelo subyacente está orientado a la reescritura de prosa y a la transferencia de estilo: sus etiquetas (prose, rewriting, style-transfer, creative-writing, deslop, qwen3) indican un uso centrado en reescribir textos eliminando el estilo artificial o "slop" característico de las salidas de modelos de lenguaje, además de tareas de escritura creativa. La etiqueta qwen3 apunta a que el modelo base deriva de la familia Qwen3, aunque no se especifica la variante exacta ni los detalles de entrenamiento. El idioma declarado es únicamente inglés.

La relevancia práctica de esta ficha reside en que empaqueta un modelo de aproximadamente 2,03 mil millones de parámetros en ficheros GGUF de entre 0,7 GB y 1,8 GB, lo que permite ejecutarlo en CPU, en GPUs de gama de entrada o incluso en dispositivos con poca memoria. Es un ejemplo típico de modelo pequeño y especializado que se puede desplegar localmente para tareas concretas de edición de texto, sin depender de APIs externas. El repositorio no registra descargas ni "likes" en el momento de la consulta y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; las etiquetas indican familia qwen3 (transformer decoder-only), sin confirmacion explicita |
| Parametros totales | 2.031.739.904 (≈2,03 mil millones, segun safetensors); el nombre del modelo indica 1,7b |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 25,2 GB (incluye todas las variantes) |
| Rango de tamano por fichero | 0,7 GB (i1-IQ1_S) a 1,8 GB (i1-Q6_K) |
| Libreria declarada | transformers |
| Cuantizado por | mradermacher |
| Etiquetas | prose, rewriting, style-transfer, creative-writing, deslop, qwen3, imatrix, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica referencia tecnica es la etiqueta qwen3, que sugiere que el modelo base pertenece a la familia Qwen3, y la etiqueta conversational, que indica que el modelo esta preparado para dialogos de ida y vuelta. Las tareas declaradas (reescritura de prosa, transferencia de estilo, escritura creativa y "deslop") apuntan a un ajuste fino orientado a la edicion de texto mas que a un uso generalista.

En lo que respecta a esta publicacion concreta, la innovacion tecnica es el proceso de cuantizacion: mradermacher emplea cuantizacion de tipo i1 con un fichero imatrix (prose-rewriter-1.7b-v2.imatrix.gguf, 0,1 GB) que actua como matriz de importancias para ponderar que pesos requieren mayor precision. El autor mantiene ademas una version con cuantizaciones estaticas en el repositorio mradermacher/prose-rewriter-1.7b-v2-GGUF, y senala en la model card que las cuantizaciones IQ suelen ofrecer mejor relacion calidad/tamano que las no-IQ de tamano equivalente.

## Capacidades

- Reescritura de prosa: reformulacion de textos manteniendo el contenido pero modificando la forma.
- Transferencia de estilo: adaptacion del registro y del tono de un texto a un estilo objetivo.
- Eliminacion de "slop": limpieza de patrones linguisticos tipicos de la generacion automatica (frases formulaicas, estructura repetitiva).
- Escritura creativa: generacion y reescritura de textos de ficcion o ensayo, segun las etiquetas creative-writing y prose.
- Uso conversacional: la etiqueta conversational indica soporte de intercambios de turnos multiples, aunque no se detalla el formato de prompt.
- Capacidad multilingue: limitada al ingles (language: en).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el autor no incluye el fichero mmproj entre las cuantizaciones.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Limpieza de textos generados por IA en flujos editoriales: el modelo puede usarse como paso de post-procesado sobre borradores producidos por un LLM mayor para eliminar muletillas y estructuras repetitivas antes de la revision humana, aprovechando su especializacion en "deslop".
- Asistente de reescritura en herramientas de escritura (Obsidian, VS Code, editores Markdown): al ser un GGUF de menos de 2 GB, se puede integrar localmente mediante llama.cpp con una extension que envie el parrafo seleccionado y reciba la version reescrita.
- Ajuste de tono en documentacion tecnica y textos de marketing: se le puede pedir que convierta un texto denso en uno mas directo, o al contrario, sin cambiar los datos tecnicos subyacentes.
- Normalizacion estilistica de corpus para entrenamiento: homogeneizar el registro de un conjunto de textos antes de usarlos como dataset, reduciendo la varianza de estilo que introduce ruido en el ajuste fino.
- Escritura creativa asistida en local: generacion y reescritura de fragmentos narrativos en equipos sin GPU dedicada, ya que la variante i1-Q4_K_M ocupa 1,4 GB y se ejecuta en CPU.
- Prototipado rapido de funciones de estilo en producto: validar si una funcionalidad de "reescribir con otro tono" aporta valor antes de invertir en un modelo mayor, usando una cuantizacion i1-IQ4_XS de 1,3 GB en una instancia pequena.
- Filtrado de resenas y contenido de usuario: reescritura o suavizado de textos antes de publicarlos en una plataforma, ejecutado en el propio servidor con llama.cpp o con un binding de transformers.
- Experimentacion academica con cuantizacion extrema: las variantes i1-IQ1_S e i1-IQ1_M (0,7 GB) permiten estudiar la degradacion de calidad en regimenes de 1-2 bits, aunque el propio autor las etiqueta como "para desesperados".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de metricas especificas de reescritura o similitud estilistica, y los resultados de busqueda web consultados no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,7 GB (i1-IQ1_S) y 1,8 GB (i1-Q6_K) solo para los pesos, segun la tabla de cuantizaciones del autor. Hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva (no especificada) y del offloading parcial a CPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones pequenas y medias; RTX 3060, RTX 4060, GTX 1660 o RTX 4090 ejecutan el modelo sin problemas. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si. Con cuantizaciones Q4 o inferiores tambien cabe en GPUs integradas con memoria compartida y en dispositivos tipo Raspberry Pi 5 o mini-PC con 8 GB de RAM.
- Despliegue en CPU: viable en todas las variantes; las cuantizaciones de 1 bit a 3 bits estan pensadas para entornos con RAM muy limitada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con GGUF. El soporte de GGUF en vLLM y TGI es experimental o limitado; para esos motores convendria partir del modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa no verificada, un modelo de ~2B parametros cuantizado a 4 bits suele superar con holgura la generacion en tiempo real tanto en GPU de gama media como en CPU moderna, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| prose-rewriter-1.7b-v2 (i1-GGUF) | 2.031.739.904 | No disponible | en | AGPL-3.0 | GGUF (24 variantes) | HuggingFace, 0 descargas |
| prose-rewriter-1.7b-v2 (cuantizaciones estaticas) | No disponible | No disponible | en | AGPL-3.0 | GGUF | HuggingFace (mradermacher/prose-rewriter-1.7b-v2-GGUF) |
| Modelo base chartreuse-verte/prose-rewriter-1.7b-v2 | No disponible | No disponible | en | AGPL-3.0 | safetensors | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de datos de rendimiento que permitan establecer una comparacion cuantitativa con otras alternativas de reescritura de prosa o de transferencia de estilo. Cualquier comparacion con modelos de la familia Qwen3 u otros modelos de ~2B parametros requeriria datos que no forman parte de esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al estar entrenado solo en ingles heredara los sesgos presentes en corpus anglosajones. No hay informacion sobre la composicion del dataset.
- Riesgo de alucinacion: en tareas de reescritura el riesgo principal no es inventar hechos, sino alterar el significado del texto original, omitir matices o introducir afirmaciones que el autor no habia escrito. Requiere revision humana en contextos sensibles.
- Limitacion de idioma: el modelo declara unicamente ingles. No hay evidencia de soporte para castellano ni para otras lenguas, por lo que su uso en espanol no esta respaldado.
- Restricciones de licencia: AGPL-3.0 es una licencia copyleft fuerte. El uso comercial esta permitido, pero cualquier obra derivada distribuida debe publicarse bajo la misma licencia, y el uso del modelo en un servicio accesible por red puede activar la obligacion de ofrecer el codigo fuente a los usuarios. Conviene revisar el cumplimiento antes de integrarlo en un producto propietario o en un SaaS.
- Longitud de contexto desconocida: no se especifica el contexto soportado, lo que dificulta planificar el procesamiento de documentos largos y el dimensionamiento de la cache KV.
- Discrepancia en el numero de parametros: el nombre comercial indica 1,7b mientras que safetensors reporta 2.031.739.904 parametros. Conviene verificar la arquitectura real antes de asumir equivalencias.
- Cuantizaciones extremas: las variantes de 1 y 2 bits (i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS) degradan la calidad de forma notable; el propio autor las describe como "for the desperate" y "mostly desperate". Para uso en produccion se recomienda Q4_K_M o superior.
- Ausencia de benchmarks y de adopcion: el repositorio registra 0 descargas y 0 likes, no incluye evaluaciones y no hay validacion independiente de su calidad frente al modelo original.
- Modelo especializado: no es un modelo de proposito general. No hay evidencia de soporte para codigo, matematicas, tool calling ni razonamiento multi-paso.
- Trazabilidad: la model card indica que la cuantizacion se realizo con cuantizacion de tensores de salida y convert_type hf, pero no detalla el proceso de calibracion del imatrix ni el corpus usado para generarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/prose-rewriter-1.7b-v2-i1-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/prose-rewriter-1.7b-v2-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#prose-rewriter-1.7b-v2-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/prose-rewriter-1.7b-v2-i1-GGUF/resolve/main/prose-rewriter-1.7b-v2.imatrix.gguf
- Guia de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa responsable de la infraestructura: https://www.nethype.de

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos corresponden a contenido no relacionado y se han descartado.
