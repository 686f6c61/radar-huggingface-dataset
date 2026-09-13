# mradermacher/grug-27b-v2-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/grug-27b-v2-i1-GGUF`, una coleccion de cuantizaciones GGUF del modelo `ProCreations/grug-27b-v2`, publicada por el usuario mradermacher (responsable tambien de otros muchos repositorios de cuantizacion). No es, por tanto, un modelo entrenado desde cero: es una distribucion de pesos ya entrenados, convertidos al formato GGUF y comprimidos con cuantizacion de tipo `i1` (imatrix) en 23 variantes que van desde IQ1_S hasta Q6_K.

El modelo subyacente tiene 27.320.697.856 parametros (unos 27,3 mil millones) y esta etiquetado por el cuantizador con los descriptores `grug`, `coding`, `tool-use`, `agentic`, `mtp` y `qwen3_5`, ademas de `conversational`. La model card indica explicitamente que se trata de un modelo con capacidad de vision y que los ficheros `mmproj` necesarios para el procesamiento de imagenes se encuentran en el repositorio de cuants estaticos hermano. La licencia declarada es Apache 2.0.

Su relevancia practica es doble: por un lado, pone al alcance de hardware de consumo un modelo de 27B especializado en codigo y uso agentico de herramientas; por otro, la disponibilidad de cuantizaciones imatrix de bajo bit permite desplegarlo en GPUs de 24 GB o incluso en configuraciones con CPU y memoria unificada, algo que con los pesos originales en precision completa (unos 54,6 GB en bf16) no seria viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado con `qwen3_5`, lo que sugiere la familia Qwen3.5, sin confirmar en la documentacion) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero imatrix adicional para crear cuantizaciones propias) |

Datos de interes adicionales: el repositorio ocupa 218,6 GB en total e incluye ficheros multi-parte. La model card lista los siguientes tamanos por cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-Q2_K | 11,0 | IQ3_XXS probablemente mejor |
| i1-Q3_K_S | 12,4 | IQ3_XS probablemente mejor |
| i1-IQ3_S | 12,7 | supera a Q3_K* |
| i1-IQ3_M | 12,9 | |
| i1-Q3_K_M | 13,6 | IQ3_S probablemente mejor |
| i1-Q3_K_L | 14,7 | IQ3_M probablemente mejor |
| i1-IQ4_XS | 15,4 | |
| i1-Q4_0 | 15,9 | rapido, baja calidad |
| i1-Q4_K_S | 15,9 | tamano/velocidad/calidad optimos |
| i1-Q4_K_M | 16,9 | rapido, recomendado |
| i1-Q4_1 | 17,4 | |
| i1-Q5_K_S | 19,1 | |
| i1-Q5_K_M | 19,6 | |
| i1-Q6_K | 22,5 | practicamente como el Q6_K estatico |
| imatrix | 0,1 | fichero imatrix para crear cuantizaciones propias |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento ni la composicion del dataset. El repositorio no incluye una model card propia del modelo base, sino las instrucciones de uso y la tabla de cuantizaciones del cuantizador. Las unicas pistas son las etiquetas declaradas: `qwen3_5`, `mtp` y `agentic`. La etiqueta `qwen3_5` apunta a una arquitectura de la familia Qwen3.5, y `mtp` (multi-token prediction) sugiere la presencia de cabeceras de prediccion multi-token, aunque ninguna de las dos afirmaciones esta confirmada por documentacion disponible en la informacion proporcionada.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineamiento. El unico dato tecnico verificable es el recuento de parametros (27.320.697.856) y el hecho de que el modelo es multimodal: la model card del repositorio de cuantizaciones afirma literalmente que "this is a vision model" y remite al repositorio estatico para los ficheros `mmproj`. Notese que aqui se documenta la cuantizacion, no el entrenamiento: cualquier afirmacion sobre innovaciones arquitectonicas del modelo original seria especulativa.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica uso orientado a dialogo multi-turno.
- Generacion de codigo: la etiqueta `coding` senala especializacion en tareas de programacion.
- Uso de herramientas (tool calling / function calling): la etiqueta `tool-use` indica soporte explicitamente contemplado por el autor.
- Flujos agenticos y razonamiento multi-paso: la etiqueta `agentic` apunta a este tipo de cargas de trabajo.
- Procesamiento de vision: la model card del cuantizador lo describe como modelo de vision; los ficheros `mmproj` necesarios estan en el repositorio de cuants estaticos `mradermacher/grug-27b-v2-GGUF`.
- Prediccion multi-token: la etiqueta `mtp` sugiere este modo, sin documentacion adicional disponible.
- Idiomas: unicamente ingles declarado; no hay soporte multilingue documentado.
- Modo de razonamiento explicito (thinking): no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Asistente de programacion en el IDE: con 27,3 B de parametros y cuantizacion Q4_K_M (16,9 GB), el modelo puede ejecutarse en una GPU de 24 GB y ofrecer autocompletado, explicacion de codigo y refactorizacion local sin enviar codigo propiedad de la empresa a servicios externos.
- Agentes autonomos con tool calling: la etiqueta `agentic` y el enfoque en `tool-use` lo hacen adecuado para orquestar llamadas a APIs, ejecutar comandos y encadenar pasos intermedios en pipelines de automatizacion.
- Revision de codigo en CI/CD: integrado en un runner con GPU, el modelo puede analizar diffs y dejar comentarios automaticos sobre posibles errores, siempre que el contexto del repositorio quepa en su ventana (longitud no documentada).
- Agente de navegacion y extraccion web: combinando la capacidad de vision con tool calling, puede interpretar capturas de pantalla de interfaces y decidir acciones sobre ellas en tareas de automatizacion RPA.
- Analisis de diagramas y capturas tecnicas: el soporte multimodal permite extraer informacion de diagramas de arquitectura, tablas en imagenes o capturas de paneles de monitorizacion y convertirla en texto estructurado.
- Generacion de tests y documentacion tecnica: tareas de transformacion de codigo a documentacion o a baterias de pruebas unitarias, ejecutables en local con llama.cpp u Ollama.
- Asistente conversacional de dominio tecnico en ingles: con la cuantizacion Q5_K_M o Q6_K para maximizar calidad, en entornos donde el idioma de trabajo sea exclusivamente ingles.
- Despliegue en hardware modesto: las variantes IQ2/IQ3 (11-14,7 GB) permiten levantar el modelo en GPUs de 16 GB o en configuraciones con CPU y RAM, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de cuantizaciones ni la informacion recogida incluyen cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluacion, ya sea para la version cuantizada o para el modelo base `ProCreations/grug-27b-v2`. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: parte del tamano del fichero GGUF mas el cache KV y el overhead del runtime. Como referencia, hay que prever aproximadamente 12-13 GB para IQ3_M, 17-18 GB para Q4_K_M, 20-21 GB para Q5_K_M y 23-25 GB para Q6_K, en funcion de la longitud de contexto configurada.
- GPU recomendadas: una RTX 4090, RTX 3090 o RTX 5090 (24 GB) cubre comodamente IQ4_XS, Q4_K_S y Q4_K_M; Q5_K_M es ajustado. Para Q6_K o contextos largos conviene una A100 40 GB, L40S 48 GB, H100 80 GB o un par de GPUs de 24 GB.
- Cabe en GPU de consumo: si. Las cuantizaciones de 11 a 17,4 GB caben en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 5070 Ti) y de 24 GB, siempre que se ajuste el contexto. Las variantes IQ2/IQ3 de 11-13 GB son las unicas viables en GPUs de 12 GB, con margen muy justo.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, llama-cpp-python) son las opciones naturales para GGUF. Los ficheros `mmproj` del repositorio estatico habilitan el modo vision en llama.cpp. vLLM y TGI no son la via habitual para GGUF, aunque vLLM tiene soporte parcial; para produccion con safetensors habria que acudir al modelo base.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.
- Nota sobre el fichero imatrix: el repositorio incluye `grug-27b-v2.imatrix.gguf` (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones con la matriz de importancia.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparativa de rendimiento con alternativas de la misma categoria. La comparacion que sigue se limita a caracteristicas verificables de distribucion, tamano y licencia.

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| `mradermacher/grug-27b-v2-i1-GGUF` (este) | 27,3 B | GGUF, 23 cuantizaciones imatrix | apache-2.0 | no disponible | Incluye fichero imatrix propio |
| `mradermacher/grug-27b-v2-GGUF` | 27,3 B | GGUF, cuantizaciones estaticas | apache-2.0 | no disponible | Alberga tambien los ficheros `mmproj` para vision |
| `ProCreations/grug-27b-v2` (modelo base) | 27,3 B | safetensors (presumiblemente) | apache-2.0 | no disponible | Repositorio original; requiere hardware de gama alta |
| Otras alternativas de ~27-32 B | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declara ingles. No hay soporte documentado de castellano, por lo que su uso en produccion en espanol no esta respaldado por el autor.
- Ausencia de benchmarks: no existen cifras publicas que permitan estimar su calidad real en codigo, razonamiento o uso de herramientas. Cualquier decision de adopcion deberia partir de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay informacion sobre tecnicas de mitigacion aplicadas.
- Perdida de calidad por cuantizacion: las variantes por debajo de IQ3 (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M) degradan notablemente el modelo. El propio cuantizador advierte en varios casos que existe una cuantizacion de tamano similar con mejor calidad.
- Codigo y datos no auditados: el repositorio no ofrece informacion sobre la composicion del dataset de entrenamiento, lo que impide evaluar sesgos ni procedencia de los datos.
- Vision condicionada: los ficheros `mmproj` no estan en este repositorio, sino en el estatico; hay que descargarlos por separado y el soporte depende del runtime.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (`ProCreations/grug-27b-v2`) mantiene la misma licencia y no impone condiciones adicionales. Los pesos derivados de un modelo con terminos especificos podrian heredar restricciones.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de la consulta, con fecha de creacion y actualizacion muy recientes (13 de septiembre de 2026). Es un artefacto sin validacion por parte de la comunidad.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible dimensionar el cache KV ni planificar cargas de trabajo con documentos largos.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/grug-27b-v2-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/grug-27b-v2-GGUF
- Modelo base: https://huggingface.co/ProCreations/grug-27b-v2
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#grug-27b-v2-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia enlazada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia la infraestructura del cuantizador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su modelo base ni benchmarks asociados.
