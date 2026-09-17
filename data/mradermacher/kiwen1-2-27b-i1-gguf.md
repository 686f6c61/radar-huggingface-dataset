# mradermacher/Kiwen1.2-27B-i1-GGUF

## Resumen

mradermacher/Kiwen1.2-27B-i1-GGUF es un repositorio de cuantizaciones GGUF en formato imatrix del modelo beyoru/Kiwen1.2-27B, preparado por el cuantizador mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original a pesos de precision reducida para su uso con llama.cpp y derivados (Ollama, LM Studio, koboldcpp, etc.). El modelo base cuenta con 27.320.697.856 parametros (27,3 mil millones) y se distribuye bajo licencia Apache 2.0.

Las etiquetas de la model card situan al modelo base en la familia de arquitectura transformer etiquetada como qwen3.8, con enfasis declarado en razonamiento (reasoning), uso agentico (agentic), matematicas y destilacion a partir de Kimi (tags kimi y distillation), ademas de RLVR (Reinforcement Learning with Verifiable Rewards). El autor lo emparenta con la iteracion anterior kiwen1.1. La model card del cuantizador afirma genericamente que se trata de un modelo de vision y que los ficheros mmproj, si existieran, estarian en el repositorio de cuantizaciones estaticas; en este repositorio no se incluye ningun mmproj, por lo que esa capacidad no queda confirmada.

La relevancia de esta ficha es practica: permite ejecutar en hardware de consumo un modelo de 27,3 B en cuantizaciones de 11,0 GB (i1-Q2_K) y 12,9 GB (i1-IQ3_M), que son los dos unicos ficheros cuantizados publicados en el momento de la captura. El repositorio tiene 0 descargas y 0 likes, y fue creado el 17 de septiembre de 2026, por lo que se trata de una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta qwen3.8 en la model card); sin detalle de capas, atencion ni tipo de positional encoding |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no procede (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): i1-Q2_K (11,0 GB) e i1-IQ3_M (12,9 GB) publicados; el listado de quants previstos en la model card incluye ademas Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Las cuantizaciones estaticas equivalentes se alojan en mradermacher/Kiwen1.2-27B-GGUF |
| Idiomas soportados | ingles (en) declarado en la model card; la etiqueta vietnamese aparece en los tags, sin confirmacion documental |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los ficheros i1 son de tipo imatrix); el modelo base esta en safetensors |
| Modelo base | beyoru/Kiwen1.2-27B |
| Cuantizador | mradermacher (revision de README 1) |
| Tamano del repositorio | 23,6 GB |
| Fecha de publicacion | 17 de septiembre de 2026 (actualizado el 17 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles de arquitectura mas alla de la etiqueta transformer y la referencia a la familia qwen3.8 en los tags del cuantizador. No se documentan numero de capas, dimension del modelo, tipo de atencion (completa, grouped-query, lineal o hibrida), ni la longitud de contexto nativa. Tampoco se especifica si emplea decodificacion especulativa, atencion lineal u otra innovacion de inferencia.

En cuanto al entrenamiento, los tags apuntan a un proceso de destilacion (kimi, distillation, kiwen1.1) combinado con RLVR, es decir, aprendizaje por refuerzo con recompensas verificables, tipicamente aplicado a dominios donde la correccion es comprobable de forma automatica, como matematicas y codigo. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. Del mismo modo, no hay informacion sobre la receta de cuantizacion mas alla de que se ha utilizado una matriz de importancia (imatrix) generada a partir del propio modelo y que el fichero de imatrix se publica aparte (Kiwen1.2-27B.imatrix.gguf, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational y el idioma declarado.
- Razonamiento explicito: los tags reasoning y qwen3.8 sugieren modos de pensamiento extendido, aunque no se documenta el mecanismo (por ejemplo, si existe un modo thinking separado).
- Razonamiento matematico: la etiqueta math junto con RLVR apunta a un ajuste especifico en tareas de matematicas verificables.
- Uso agentico: la etiqueta agentic indica que el modelo base esta orientado a flujos de varios pasos y toma de decisiones secuencial.
- Destilacion desde Kimi: los tags kimi y distillation sugieren que se han transferido capacidades de un modelo profesor de mayor tamano.
- Capacidades multilingues: ingles confirmado; vietnamita aparece como etiqueta pero no esta documentado en la model card, por lo que su grado de soporte es desconocido.
- Vision: la model card del cuantizador afirma que el modelo es de vision, pero no se incluye ningun fichero mmproj en este repositorio ni se confirma en la informacion del modelo base. Capacidad no verificada.
- Tool calling / function calling: no disponible; no se documenta soporte explicito, aunque la etiqueta agentic sugiere que el modelo base podria estar preparado para ello.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue local de razonamiento en estaciones de trabajo: con la cuantizacion i1-Q2_K (11,0 GB) o i1-IQ3_M (12,9 GB) el modelo cabe en GPU de 16 GB y 24 GB respectivamente, lo que permite ejecutar razonamiento de 27,3 B sin depender de APIs externas ni enviar datos a terceros.
- Asistente de matematicas y verificacion de resultados: dado el ajuste con RLVR y la etiqueta math, encaja en tareas de resolucion paso a paso de problemas algebraicos o de calculo donde el resultado final es comprobable de forma automatica.
- Pipelines agenticos de varios pasos: la etiqueta agentic apunta a su uso como nucleo de un agente que planifique, ejecute acciones y revise resultados; requeriria integracion propia de tool calling con llama.cpp o llama-cpp-python, ya que no hay documentacion de plantilla de herramientas.
- Atencion al cliente en ingles con contexto medio: el modelo puede gestionar conversaciones multiturno, aunque la longitud de contexto no esta publicada, por lo que la planificacion debe hacerse con pruebas empíricas previas.
- Procesamiento por lotes en servidores con GPU profesional: en A100 80 GB o H100 es viable servir la version sin cuantizar o cuantizaciones Q6_K/Q8_0 con mayor fidelidad, integrando el modelo en colas de trabajo batch para clasificacion, resumen o extraccion estructurada.
- Investigacion sobre cuantizacion y destilacion: el repositorio publica la matriz de importancia, lo que permite reproducir y comparar tecnicas de cuantizacion i1 frente a las cuantizaciones estaticas del repositorio hermano, con el modelo como caso de estudio de 27,3 B.
- Evaluacion comparativa interna de modelos destilados: util como punto de referencia en pruebas propias frente a otros modelos de ~27 B, ya que no existen resultados de benchmarks publicos que permitan comparaciones externas fiables.
- Generacion de codigo asistida en local: el ajuste con RLVR y el enfoque agentico lo hacen candidato para autocompletado y refactorizacion en entornos sin conectividad, condicionado a validar su rendimiento real en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan mediciones de perplejidad de las cuantizaciones i1 frente a las estaticas; el unico material relacionado es un grafico externo comparativo de perplejidad entre tipos de cuantizacion de baja calidad y un analisis de terceros, ambos de caracter general y no especificos de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los dos unicos ficheros publicados son i1-Q2_K (11,0 GB) e i1-IQ3_M (12,9 GB). Para el resto de tipos de cuantizacion presentes en el listado, la estimacion a partir del numero de parametros (27,32 B) y los bits por peso habituales de llama.cpp seria: Q4_K_M en torno a 16-17 GB, Q5_K_M en torno a 19-20 GB, Q6_K en torno a 22-23 GB, Q8_0 en torno a 29 GB y F16 en torno a 54,6 GB. Estas cifras para tipos no publicados son estimaciones de calculo, no datos del repositorio.
- Memoria adicional: a la VRAM de los pesos hay que sumar la cache KV, que crece con la longitud de contexto y que no puede dimensionarse porque la longitud de contexto del modelo no esta publicada.
- GPU recomendadas: para i1-Q2_K e i1-IQ3_M, GPU de 16 GB (RTX 4080, RTX 5080, A4000) y de 24 GB (RTX 3090, RTX 4090, A5000) respectivamente, con margen para contexto corto. Para Q4_K_M y superiores, GPU de 24 GB con contexto limitado, 32 GB (RTX 5090) o 48 GB (A6000, L40S). Para Q8_0 o F16, A100 80 GB o H100 80 GB.
- Viabilidad en GPU de consumo: si, en el rango de 16 GB a 32 GB para las cuantizaciones bajas y medias; las cuantizaciones altas y el modelo sin cuantizar quedan fuera de ese rango.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile sobre el GGUF), LM Studio, koboldcpp, text-generation-webui, llama-cpp-python, y servidores compatibles con el endpoint de llama.cpp. Para vLLM o TGI habria que partir del modelo base en safetensors (beyoru/Kiwen1.2-27B) y cuantizar en AWQ/GPTQ/FP8, ya que esas herramientas no consumen GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion de hardware.
- Nota sobre vision: si finalmente se confirma la capacidad multimodal del modelo base, los ficheros mmproj (proyector visual) no estan en este repositorio y habria que buscarlos en el repositorio de cuantizaciones estaticas. El repo de cuantizaciones i1 ocupa 23,6 GB en total.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizaciones | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Kiwen1.2-27B-i1-GGUF (este) | 27,3 B | i1-Q2_K, i1-IQ3_M publicados; matriz de importancia incluida | no disponible | apache-2.0 | GGUF, repo de 23,6 GB, 0 descargas |
| beyoru/Kiwen1.2-27B (modelo base) | 27,3 B | safetensors sin cuantizar | no disponible | apache-2.0 | checkpoint original en HuggingFace |
| mradermacher/Kiwen1.2-27B-GGUF (cuantizaciones estaticas) | 27,3 B | cuantizaciones estaticas (no i1); aloja los mmproj si existen | no disponible | apache-2.0 | GGUF alternativo del mismo cuantizador |
| kiwen1.1 (iteracion anterior, citada en tags) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con modelos de otras familias de tamano similar. Cualquier comparacion con alternativas externas de ~27 B quedaria sin respaldo documental con la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o alineacion, ni para el modelo base ni para las cuantizaciones.
- Riesgo de alucinacion: no evaluado. No hay resultados de pruebas de veracidad, y el ajuste con RLVR se orienta a dominios verificables, lo que no garantiza fiabilidad en dominios abiertos.
- Idioma: la model card solo declara ingles. La etiqueta vietnamese no va acompanada de datos de evaluacion, y no hay ninguna indicacion de soporte de castellano, por lo que su uso en espanol deberia validarse empiricamente antes de llevarlo a produccion.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto del modelo base, no se puede dimensionar la cache KV ni garantizar el comportamiento en conversaciones o documentos largos. Es un riesgo directo para el calculo de VRAM en despliegue.
- Degradacion por cuantizacion: i1-Q2_K es una cuantizacion de muy baja precision. La propia model card advierte que IQ3_XXS suele ser preferible a Q2_K. En tareas de razonamiento matematico y generacion de codigo, donde los errores de un solo token invalidan el resultado, la cuantizacion agresiva puede degradar notablemente la calidad.
- Capacidad de vision no confirmada: la afirmacion de que es un modelo de vision procede de un texto generico del cuantizador y no se acompana de ficheros mmproj en este repositorio. No debe asumirse soporte multimodal.
- Tool calling no documentado: aunque la etiqueta agentic sugiere capacidades agenticas, no se describe ninguna plantilla de herramientas ni formato de function calling, por lo que su integracion en agentes requiere ingenieria propia y validacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al ser una cuantizacion derivada, conviene verificar que el modelo base beyoru/Kiwen1.2-27B mantiene efectivamente la misma licencia y no impone condiciones adicionales.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue publicado en septiembre de 2026. No hay validacion de la comunidad, ni informes de errores, ni comparaciones independientes.
- Reproducibilidad: para regenerar las cuantizaciones hace falta el fichero de matriz de importancia (0,1 GB) y la version concreta de llama.cpp utilizada por el autor, que no se especifica.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Kiwen1.2-27B-i1-GGUF
- Modelo base: https://huggingface.co/beyoru/Kiwen1.2-27B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Kiwen1.2-27B-GGUF
- Pagina de resumen y descargas del cuantizador para este modelo: https://hf.tst.eu/model#Kiwen1.2-27B-i1-GGUF
- Fichero de matriz de importancia: https://huggingface.co/mradermacher/Kiwen1.2-27B-i1-GGUF/resolve/main/Kiwen1.2-27B.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/Kiwen1.2-27B-i1-GGUF/resolve/main/Kiwen1.2-27B.i1-Q2_K.gguf
- Cuantizacion i1-IQ3_M: https://huggingface.co/mradermacher/Kiwen1.2-27B-i1-GGUF/resolve/main/Kiwen1.2-27B.i1-IQ3_M.gguf
- Guia de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
- Paper, blog tecnico o demo del modelo base: no disponible. La busqueda web no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos correspondian a paginas de ayuda de YouTube y no guardan relacion con Kiwen1.2-27B.
