# gabrielmtzcarrillo/p-e-w-gpt-oss-20b-heretic-gguf

## Resumen

Este repositorio contiene conversiones a formato GGUF del modelo p-e-w/gpt-oss-20b-heretic, que a su vez es una variante modificada de openai/gpt-oss-20b. El autor, gabrielmtzcarrillo, se limita a convertir y cuantizar los pesos originales con llama.cpp para que puedan ejecutarse en herramientas de inferencia locales basadas en GGUF (llama.cpp, Ollama, LM Studio, llama-cpp-python). No se trata, por tanto, de un entrenamiento nuevo, sino de una redistribucion en otro formato: los ficheros GGUF difieren de los pesos originales en el formato y, en el caso de Q4_K_M, tambien en la cuantizacion.

El modelo subyacente pertenece a la familia gpt-oss de OpenAI, con 20.914.757.184 parametros totales (aproximadamente 20,9 mil millones) segun los datos de safetensors, y la variante "heretic" hace referencia a una modificacion orientada a reducir las respuestas de rechazo (abliteration); la ficha del repositorio no detalla la metodologia aplicada ni los datos usados para ello. La licencia declarada es Apache 2.0, la misma del modelo original, y se incluye sin cambios la politica de uso de OpenAI.

La relevancia practica de esta publicacion es la disponibilidad en dos niveles de cuantizacion (F16 y Q4_K_M) bajo una licencia permisiva y con pesos ya listos para llama.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no incluye resultados de evaluacion propios, por lo que cualquier decision de adopcion deberia apoyarse en la evaluacion directa del modelo por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en esta ficha; el modelo base declarado es p-e-w/gpt-oss-20b-heretic, derivado de openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (≈20,9 mil millones), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q4_K_M (ambas en GGUF, generadas con llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (se incluye la politica de uso del modelo original sin cambios) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 57,7 GB (conjunto de los ficheros F16 y Q4_K_M) |
| Modelo base | p-e-w/gpt-oss-20b-heretic |
| Pipeline | text-generation (etiqueta conversational) |
| Fecha de publicacion | 22 de septiembre de 2026 (creacion), 22 de septiembre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO u otras). La model card del repositorio unicamente describe el proceso de conversion: los pesos proceden de p-e-w/gpt-oss-20b-heretic, se convirtieron a GGUF con llama.cpp y se genero una cuantizacion Q4_K_M; el repositorio incluye un JSON de conversion con los comandos y la version de la herramienta empleada.

La unica innovacion tecnica atribuible a esta publicacion es, por tanto, el propio proceso de conversion y cuantizacion, no cambios en el modelo. Cualquier caracteristica arquitectonica (tipo de transformer, uso de mezcla de expertos, atencion, ventana de contexto nativa) debe consultarse en las fichas de openai/gpt-oss-20b y p-e-w/gpt-oss-20b-heretic, que no forman parte de la informacion facilitada. Tampoco se documenta en este repositorio la naturaleza de la modificacion "heretic" mas alla de su nombre.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como text-generation y conversational, con plantilla de chat propia de la familia del modelo base.
- Ejecucion local en formato GGUF: compatible con el ecosistema llama.cpp y con herramientas que consumen GGUF, lo que permite inferencia sin conexion y sin enviar datos a terceros.
- Dos alternativas de precision: F16 para maxima fidelidad respecto a los pesos convertidos y Q4_K_M para reducir requisitos de memoria a costa de una perdida de calidad no cuantificada en esta ficha.
- Soporte de tool calling o function calling: no confirmado en la informacion de este repositorio; debe verificarse en la documentacion del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion de este repositorio.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible en esta ficha.
- Reduccion de rechazos: la variante heretic se presenta como una modificacion del modelo base en esa direccion, aunque la metodologia y su efecto real no estan documentados aqui.

## Casos de uso

- Asistente conversacional en local: al distribuirse en GGUF, el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo sin conexion, de modo que las conversaciones y los datos asociados no salen de la infraestructura propia.
- Procesamiento por lotes de texto en servidores sin GPU de gama alta: la cuantizacion Q4_K_M reduce el peso de los pesos a un orden de magnitud manejable por una GPU de consumo, lo que permite tareas de resumen, reescritura o clasificacion sobre volumenes grandes de documentos.
- Prototipado rapido de aplicaciones de chat: el tag endpoints_compatible sugiere que el repositorio puede servirse mediante un endpoint compatible con la API de OpenAI, lo que simplifica sustituir un proveedor en la nube por una instancia propia durante el desarrollo.
- Investigacion sobre alineacion y rechazos: al derivar de una variante heretic, resulta util para estudiar como cambia el comportamiento del modelo en dominios sensibles, siempre con las salvaguardas y la politica de uso del modelo original aplicadas.
- Generacion de datos sinteticos y aumento de datasets: un modelo de ~20,9 mil millones de parametros ejecutado en local puede emplearse para producir texto de entrenamiento o de evaluacion en pipelines internos, con control total sobre el contenido y su trazabilidad.
- Despliegue en entornos con requisitos de soberania del dato: sectores como sanidad, banca o administracion publica pueden ejecutar el modelo en sus propios servidores, apoyandose en la licencia Apache 2.0 para uso comercial.
- Evaluacion comparativa de cuantizaciones: disponer de F16 y Q4_K_M en el mismo repositorio facilita medir la degradacion de calidad entre ambas versiones sobre un conjunto de tareas propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (unicamente enlaces no relacionados de Google Maps).

## Requisitos de hardware

- VRAM estimada para F16: aproximadamente 41,8 GB solo para los pesos (20,9 mil millones de parametros a 2 bytes por parametro), mas la cache KV y el overhead del runtime; en la practica exige del orden de 44-48 GB o mas, dependiendo del contexto configurado. Es una estimacion aritmetica, no un dato publicado.
- VRAM estimada para Q4_K_M: del orden de 12-14 GB para los pesos, mas cache KV; es una estimacion a partir del recuento de parametros y del esquema de cuantizacion, no un dato publicado.
- GPU recomendadas: para F16, A100 80 GB, H100 80 GB, A6000 48 GB o reparto entre varias GPU de 24 GB. Para Q4_K_M, una RTX 4090 o RTX 3090 de 24 GB es suficiente para contextos moderados.
- Cabe en GPU de consumo: si, en el caso de Q4_K_M, en tarjetas con 16-24 GB de VRAM (RTX 4080, 4090, 3090, 4060 Ti de 16 GB con contexto reducido). La version F16 no cabe en una GPU de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp y su servidor HTTP, Ollama, LM Studio, llama-cpp-python y cualquier otro runtime compatible con GGUF. El tag endpoints_compatible apunta a un endpoint compatible con la API de OpenAI.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las dos cuantizaciones.
- Almacenamiento: el repositorio completo ocupa 57,7 GB, de modo que conviene descargar solo el fichero de la cuantizacion que se vaya a utilizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gabrielmtzcarrillo/p-e-w-gpt-oss-20b-heretic-gguf | 20.914.757.184 | no disponible | Apache 2.0 | GGUF (F16, Q4_K_M) | Conversion a GGUF de una variante heretic; 0 descargas y 0 likes |
| p-e-w/gpt-oss-20b-heretic | no disponible | no disponible | no disponible en la informacion facilitada | no disponible | Modelo base directo de esta conversion |
| openai/gpt-oss-20b | no disponible en la informacion facilitada | no disponible | no disponible en la informacion facilitada | no disponible | Modelo original del que deriva la variante heretic; se incluye su politica de uso en este repositorio |

No se dispone de datos de rendimiento ni de especificaciones verificadas de las alternativas, por lo que no es posible establecer una comparacion cuantitativa fiable. Cualquier otra familia de modelos abiertos de tamano similar queda fuera del alcance de la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparativas de calidad entre F16 y Q4_K_M, ni analisis de la degradacion introducida por la cuantizacion.
- Procedencia en cadena: el modelo depende de una variante heretic cuyo proceso de modificacion no se documenta, lo que dificulta auditar que comportamiento se ha alterado respecto al modelo original.
- Politica de uso: aunque la licencia sea Apache 2.0, el repositorio incluye sin cambios la politica de uso de OpenAI, que puede imponer restricciones adicionales al uso comercial o a determinados casos de aplicacion. Conviene revisarla antes de desplegar.
- Contenido generado: al tratarse de una variante orientada a reducir rechazos, es previsible un aumento de respuestas ante peticiones que el modelo original declinaria; se recomienda filtrado y supervision en cualquier producto dirigido a usuarios finales.
- Riesgo de alucinacion: no cuantificado en esta ficha; es un comportamiento esperable en modelos de este tamano y debe validarse por tarea.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que el rendimiento en castellano es desconocido y requiere prueba propia.
- Contexto: la longitud de contexto soportada no esta indicada; configurar valores superiores a los soportados por el modelo base puede degradar la calidad o provocar errores del runtime.
- Adopcion nula: con 0 descargas y 0 likes, no existen senales de uso comunitario, issues resueltos ni verificaciones independientes de que los ficheros GGUF carguen correctamente en todos los runtimes.
- Fechas de publicacion: las marcas temporales del repositorio (septiembre de 2026) son posteriores a la mayoria de referencias disponibles del modelo original; conviene verificar la coherencia de los metadatos antes de integrarlo en un pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gabrielmtzcarrillo/p-e-w-gpt-oss-20b-heretic-gguf
- Modelo base de la conversion: https://huggingface.co/p-e-w/gpt-oss-20b-heretic
- Modelo original: https://huggingface.co/openai/gpt-oss-20b
- La busqueda web realizada no devolvio enlaces tecnicos relevantes (papers, blogs, repositorios o demos) sobre este modelo; el resto de resultados no guardaban relacion con el tema.
