# Horizon-Labs/pii-redactor-base

## Resumen

pii-redactor-base es un modelo de clasificacion de tokens (token classification) desarrollado por Horizon-Labs, especializado en detectar y etiquetar informacion personal identificable (PII) y secretos en texto. Se construye mediante fine-tuning de jhu-clsp/mmBERT-base, un encoder transformer multilingue de tipo ModernBERT, y cuenta con 307.575.611 parametros (aproximadamente 308M). Su proposito no es generar texto, sino actuar como filtro previo: marcar que fragmentos de un texto deben enmascararse antes de que ese texto llegue a logs, prompts de LLM, datos de entrenamiento o APIs de terceros.

El modelo etiqueta 29 tipos de entidad que cubren nombres, datos de contacto, direcciones, identificadores gubernamentales, datos financieros, credenciales y claves de API, asi como identificadores de red y de dispositivo. Soporta mas de 30 idiomas, con alfabetos latinos y no latinos, y esta publicado bajo licencia Apache-2.0, sin gating y entrenado, segun el autor, solo con datos con licencias permisivas. Su tamano contenido lo hace apto para ejecucion en CPU, y dispone de exportacion a ONNX y soporte de transformers.js para su uso en navegador y en el borde.

Su relevancia actual se explica por dos factores. Primero, la inspeccion de PII en tiempo real se ha vuelto un requisito operativo en aplicaciones que envian datos de usuarios a modelos de terceros. Segundo, el autor publica una evaluacion comparativa honesta frente a alternativas abiertas (modelos de 44M, 141M y 1.5B de parametros) en cuatro benchmarks externos mas un conjunto propio, reconociendo explicitamente que no es el mejor en todas las pruebas. Esta transparencia, junto a la integracion con Presidio y LLM Guard, es lo que lo diferencia de detectores de PII menos documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional tipo ModernBERT (fine-tuning de jhu-clsp/mmBERT-base, variante multilingue) |
| Parametros totales | 307.575.611 (aproximadamente 308M, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el script redact.py del repositorio gestiona documentos largos mediante ventanas solapadas |
| Tipos de cuantizacion | No se documentan tipos de cuantizacion especificos; se publican pesos safetensors y exportacion ONNX |
| Idiomas soportados | 35 idiomas declarados: en, de, fr, es, it, nl, pt, pl, cs, sk, sl, hr, sr, bg, ro, hu, el, da, sv, fi, et, lv, lt, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, ms, tl, th (la model card indica "30+ idiomas") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (tambien compatible con transformers.js) |
| Tamano del repositorio | 3,1 GB |
| Tarea (pipeline) | token-classification |
| Modelo base | jhu-clsp/mmBERT-base |
| Fecha de creacion (repositorio) | 2026-09-23 |
| Ultima actualizacion (repositorio) | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer bidireccional de la familia ModernBERT, en su variante multilingue mmBERT desarrollada por jhu-clsp. No se trata de un modelo generativo ni de una arquitectura MoE, SSM o hibrida: la cabeza de salida es de clasificacion de tokens, y cada token recibe una etiqueta de entidad o la etiqueta de "no entidad". Esto condiciona todo su comportamiento: el modelo no redacta por si mismo, sino que produce los tramos de texto que un script posterior (redact.py, incluido en el repositorio) convierte en sustituciones como [PERSON] o [EMAIL].

En cuanto a los datos, la model card declara entrenamiento exclusivamente sobre conjuntos con licencias permisivas: ai4privacy/pii-masking-openpii-1.5m, nvidia/Nemotron-PII y gretelai/gretel-pii-masking-en-v1. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de ajuste con RLHF o DPO (tecnicas, por otra parte, propias de modelos generativos y no de un clasificador de entidades). Como innovaciones tecnicas destacables, la ficha del autor menciona el manejo de subpalabras con fusion de piezas, el recorte de espacios en blanco y el procesado de documentos largos mediante ventanas solapadas, ademas de utilidades de integracion con Presidio y con el escaner Anonymize de LLM Guard. No se documentan innovaciones de atencion (como atencion lineal) ni decodificacion especulativa.

## Capacidades

- Deteccion de PII y secretos como tarea de clasificacion de tokens (NER), sin generacion de texto.
- Etiquetado de 29 tipos de entidad: ACCOUNT_ID, AGE, BANK_ACCOUNT, COORDINATE, CREDIT_CARD, CREDIT_CARD_CVV, DATE, DATE_OF_BIRTH, DEVICE_ID, DRIVER_LICENSE, EMAIL, IP_ADDRESS, LICENSE_NUMBER, LOCATION, MAC_ADDRESS, MEDICAL_ID, NATIONAL_ID, ORGANIZATION, PASSPORT, PASSWORD, PERSON, PHONE, POSTCODE, SECRET, STREET_ADDRESS, TAX_ID, URL, USERNAME y VEHICLE_ID.
- La etiqueta SECRET cubre claves de API, tokens, claves privadas, cadenas de conexion y cookies de sesion.
- La etiqueta ORGANIZATION se reserva a empleadores o empresas vinculadas a una persona.
- Cobertura multilingue declarada de 30+ idiomas, con alfabetos latinos y no latinos (incluye arabe, hindi, chino, japones, coreano, tailandes y griego, entre otros).
- Ejecucion en CPU y despliegue en el borde o en navegador mediante ONNX y transformers.js.
- Integracion como recognizer de Presidio AnalyzerEngine.
- Integracion como escaner Anonymize de LLM Guard, con mapeo de etiquetas propio (llm_guard_conf.py) y soporte de vault para sustituciones reversibles.
- Redaccion de documentos largos mediante ventanas solapadas con el script redact.py.
- Capacidades no soportadas: no hay tool calling, ni function calling, ni razonamiento multi-paso, ni modo "thinking", ni vision, ni audio, ni generacion de codigo. Tampoco se etiquetan el genero ni otros atributos sensibles (religion, condiciones de salud).

## Casos de uso

- Saneado de prompts antes de enviar datos a APIs de terceros: el modelo se coloca como paso previo al envio de una peticion a un LLM externo, de modo que nombres, correos, telefonos, IBAN o claves de API se sustituyen por marcadores antes de salir de la infraestructura propia. Su tamano de 308M permite ejecutarlo en la misma ruta de peticion sin anadir una GPU dedicada.
- Redaccion de logs de aplicacion: los sistemas de logging suelen capturar cuerpos de peticion completos, incluidos correos, tokens de sesion o cabeceras con secretos. El modelo, ejecutado sobre cada linea o cada bloque de log, permite enmascarar esos campos antes de que lleguen al almacen de logs o a una plataforma de observabilidad.
- Limpieza de datasets de entrenamiento: antes de reutilizar datos scrapeados, tickets historicos o conversaciones, el detector marca las entidades presentes para que se anonimicen. La licencia Apache-2.0 y el entrenamiento declarado sobre datos permisivos facilitan su uso en pipelines de datos internos.
- Cumplimiento del RGPD en atencion al cliente: en colas de tickets y transcripciones de chat, el modelo enmascara identificadores personales antes del tratamiento o del analisis por parte de equipos internos, con sustituciones reversibles mediante el vault de LLM Guard cuando se necesita recuperar el dato original.
- Deteccion de secretos en repositorios y ficheros de configuracion: la etiqueta SECRET cubre claves de API, tokens, claves privadas, cadenas de conexion y cookies, lo que permite integrarlo como comprobacion previa a un commit o como paso de un pipeline de CI para bloquear credenciales antes de que se publiquen.
- Anonimizacion de documentos legales y administrativos: los benchmarks incluidos por el autor evaluan formularios, cartas, programas docentes y sentencias del TEDH, lo que situa al modelo en el escenario de procesar expedientes con identificadores directos antes de su publicacion o de su analisis por terceros.
- Enmascaramiento en pipelines RAG: antes de indexar documentos en una base vectorial, el detector elimina la PII del texto que se va a chunkear y almacenar, reduciendo el riesgo de que un sistema de recuperacion devuelva datos personales en respuestas futuras.
- Filtros en formularios y aplicaciones de navegador: mediante la exportacion ONNX y transformers.js, el modelo puede ejecutarse en el cliente para avisar o bloquear el envio de datos sensibles sin que el texto abandone el dispositivo.
- Analisis de datos en entornos regulados (salud, banca): las etiquetas MEDICAL_ID, BANK_ACCOUNT, CREDIT_CARD, TAX_ID y NATIONAL_ID permiten construir capas de saneado especificas de sector antes de que los datos lleguen a un equipo de analitica.

## Benchmarks y rendimiento

El autor evalua el modelo en cuatro benchmarks externos mas un conjunto sintetico propio de retencion, ninguno de los cuales se uso en el entrenamiento de los modelos comparados. La comparacion ignora los conjuntos de etiquetas de cada modelo y mide dos magnitudes propias de la redaccion: recall de redaccion (proporcion de caracteres que deben enmascararse y quedan enmascarados) y precision de redaccion (proporcion de caracteres enmascarados que son realmente PII). Todos los modelos se ejecutaron a traves del mismo pipeline de token-classification de transformers, con un maximo de 600 documentos por benchmark.

Recall / precision de redaccion:

| Benchmark | este modelo | small (141M) | OpenAI Privacy Filter (1.5B) | gravitee bert-small | OpenMed PII Small 44M |
|---|---|---|---|---|---|
| RedactionBench (formularios, cartas y programas docentes de estilo real; tramos "mandatory") | 0,19 / 0,74 | 0,24 / 0,73 | 0,10 / 0,85 | 0,06 / 0,76 | 0,11 / 0,76 |
| TonicAI Privacy-Bench (hilos de correo corporativo) | 0,81 / 0,94 | 0,76 / 0,95 | 0,78 / 0,97 | 0,87 / 0,76 | 0,86 / 0,82 |
| TAB: sentencias del TEDH (identificadores DIRECT) | 0,74 / 0,88 | 0,61 / 0,85 | 0,38 / 0,97 | 0,53 / 0,71 | 0,45 / 0,71 |
| Benchmark ruso de PII (redmadrobot) | 0,71 / 0,90 | 0,72 / 0,88 | 0,67 / 0,76 | 0,64 / 0,54 | 0,71 / 0,81 |
| Secretos, codigo, configuraciones y chats en 36 idiomas (conjunto sintetico propio, retenido) | 0,76 / 0,73 | 0,75 / 0,73 | 0,78 / 0,72 | 0,46 / 0,50 | 0,65 / 0,61 |

F1 de redaccion (media armonica de recall y precision):

| Benchmark | este modelo | small (141M) | OpenAI Privacy Filter (1.5B) | gravitee bert-small | OpenMed PII Small 44M |
|---|---|---|---|---|---|
| RedactionBench | 0,306 | no disponible | no disponible | no disponible | no disponible |
| TonicAI Privacy-Bench | no disponible | no disponible | no disponible | no disponible | no disponible |
| TAB: sentencias del TEDH | no disponible | no disponible | no disponible | no disponible | no disponible |
| Benchmark ruso de PII | no disponible | no disponible | no disponible | no disponible | no disponible |
| Conjunto propio de secretos y configuraciones | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla de F1 esta truncada en la informacion disponible; solo se ha podido recuperar el valor de la primera fila. El autor indica explicitamente que el modelo no es el mejor en todos los benchmarks y que la tabla debe leerse como una medicion honesta, no como un ranking favorable.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 307,6M de parametros, no publicada por el autor): aproximadamente 1,2 GB en FP32, unos 0,6 GB en FP16/BF16 y del orden de 0,3 GB en cuantizacion int8. El repositorio ocupa 3,1 GB porque incluye varias copias de pesos y la exportacion ONNX.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060, RTX 4090 o similares sobran para este modelo, y una GPU integrada o incluso CPU puede ser suficiente para cargas moderadas.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo de los ultimos anos, y tambien en CPU. El propio autor lo describe como "CPU-friendly".
- Opciones de despliegue: pipeline de transformers (token-classification con aggregation_strategy simple), ONNX Runtime, transformers.js para navegador y borde, Hugging Face Inference Endpoints (el repositorio esta marcado como endpoints_compatible), y como recognizer dentro de Presidio o como escaner Anonymize dentro de LLM Guard.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de latencia, tokens por segundo ni consumo de memoria medidos.
- Consideracion de pipeline: al ser un modelo de clasificacion de tokens, su coste de inferencia escala con la longitud del texto de entrada; para documentos largos el repositorio recomienda ventanas solapadas, lo que incrementa el numero de pasadas sobre el mismo documento.

## Comparativa con modelos similares

La comparacion se limita a las alternativas que el propio autor incluye en su evaluacion. Los datos de parametros, contexto y licencia de los competidores no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Redaccion (recall) en TAB/TEDH | Redaccion (recall) en TonicAI | Redaccion (recall) en conjunto propio multiidioma | Licencia |
|---|---|---|---|---|---|
| Horizon-Labs/pii-redactor-base | 307,6M | 0,74 | 0,81 | 0,76 | Apache-2.0 |
| Alternativa "small" | 141M | 0,61 | 0,76 | 0,75 | no disponible |
| OpenAI Privacy Filter | 1,5B | 0,38 | 0,78 | 0,78 | no disponible |
| gravitee bert-small | no disponible | 0,53 | 0,87 | 0,46 | no disponible |
| OpenMed PII Small | 44M | 0,45 | 0,86 | 0,65 | no disponible |

Lectura de la tabla: pii-redactor-base lidera en recall sobre sentencias del TEDH (0,74 frente a 0,38-0,61 del resto) y en el conjunto multilingue de secretos y configuraciones (0,76, empatado en la practica con OpenAI Privacy Filter y ligeramente por encima del modelo de 141M), pero queda por detras en hilos de correo corporativo (0,81 frente a 0,87 de gravitee bert-small y 0,86 de OpenMed). En RedactionBench, su recall de 0,19 es bajo en terminos absolutos y solo supera al filtro de OpenAI (0,10). En el benchmark ruso esta en linea con el resto (0,71).

## Limitaciones y advertencias

- Recall bajo en documentos de estilo real: 0,19 en RedactionBench (formularios, cartas, programas docentes). En ese escenario, mas del 80% de los caracteres que deberian enmascararse no se enmascaran. No es adecuado como unico mecanismo de redaccion en documentos de ese tipo.
- Precision imperfecta: entre 0,73 y 0,94 segun benchmark. Un 6-27% de los caracteres enmascarados no son PII, lo que produce sobrerredaccion y puede degradar la utilidad del texto resultante.
- No etiqueta genero ni atributos sensibles como religion o condiciones de salud. No sirve, por tanto, para anonimizacion completa en terminos de categorias especiales del RGPD.
- La etiqueta ORGANIZATION se limita a empleadores o empresas vinculadas a una persona; no cubre cualquier mencion de una organizacion.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion de entidades.
- Idiomas: aunque se declaran 30+ idiomas, el rendimiento no es uniforme. El benchmark ruso arroja 0,71 de recall y 0,90 de precision, por debajo de sus mejores cifras. No hay evaluaciones publicadas por idioma mas alla de las incluidas.
- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgo ni auditoria por subgrupos. Es un dato ausente, no una garantia de neutralidad.
- El modelo se entreno sobre conjuntos sinteticos y con licencias permisivas; el propio autor advierte de que la comparacion externa se hizo sobre benchmarks no vistos, lo que reduce pero no elimina el riesgo de sobreajuste al dominio de entrenamiento.
- Adopcion temprana: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que existe poca validacion independiente de la comunidad sobre su comportamiento en produccion.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin gating. No obstante, el cumplimiento normativo (RGPD, HIPAA u otras) depende de la validacion propia del pipeline, no de la licencia del modelo.
- Para produccion, el autor no publica cifras de latencia, throughput ni consumo de memoria medidos, por lo que el dimensionamiento debe hacerse mediante pruebas propias.
- El uso de ventanas solapadas para documentos largos implica procesar varias veces los mismos tramos, con el consiguiente coste adicional.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Horizon-Labs/pii-redactor-base
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/pii-redactor
- Coleccion Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Modelo complementario Prompt Injection Guard: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a una formacion politica francesa, un medio local y una emisora de radio) y no se han incluido. No se han encontrado papers, blogs tecnicos ni repositorios de terceros asociados a este modelo en la informacion disponible.
