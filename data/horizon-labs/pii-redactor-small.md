# Horizon-Labs/pii-redactor-small

## Resumen

pii-redactor-small es un modelo de clasificacion de tokens (reconocimiento de entidades nombradas) desarrollado por Horizon-Labs y publicado en HuggingFace bajo licencia Apache-2.0. Su proposito es detectar y permitir la redaccion de informacion personal identificable (PII) y secretos —nombres, contactos, direcciones, identificadores oficiales, datos financieros, credenciales y claves de API— antes de que el texto llegue a logs, prompts de LLM, datos de entrenamiento o APIs de terceros. Cubre 29 tipos de entidad y esta entrenado exclusivamente con datos con licencias permisivas.

Tecnicamente es un encoder de 140.664.251 parametros (~141 M) derivado de jhu-clsp/mmBERT-small, con salida de token-classification y soporte para exportacion a ONNX y transformers.js, lo que permite ejecutarlo en CPU, en el navegador y en el borde. La model card lo posiciona explicitamente como una alternativa pequena y multilingue (36 idiomas etiquetados, con alfabetos latinos y no latinos) frente a modelos de PII mas grandes como OpenAI Privacy Filter (1,5 B).

Su relevancia actual es practica: la redaccion previa de PII se ha convertido en un requisito de cumplimiento (RGPD) y de seguridad en pipelines de IA, y este modelo ofrece una pieza de 141 M con integraciones listas para Presidio y LLM Guard, ademas de una evaluacion publicada en cuatro benchmarks externos mas un conjunto propio de retencion. La model card indica que no gana en todos los benchmarks, y detalla recall y precision de redaccion en lugar de metricas agregadas de NER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, derivado de jhu-clsp/mmBERT-small (familia ModernBERT/mmBERT); no se detalla el numero de capas ni la dimension oculta en la informacion disponible |
| Parametros totales | 140.664.251 (~141 M), segun el peso real en safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el script `redact.py` del repositorio gestiona documentos largos con ventanas solapadas |
| Tipos de cuantizacion | no disponible; se distribuyen pesos safetensors y exportaciones ONNX, pero la model card no detalla esquemas de cuantizacion concretos |
| Idiomas soportados | 36 idiomas etiquetados: en, de, fr, es, it, nl, pt, pl, cs, sk, sl, hr, sr, bg, ro, hu, el, da, sv, fi, et, lv, lt, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, ms, tl, th (la model card los describe como "30+ idiomas") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; exportaciones ONNX y compatibilidad con transformers.js |
| Tarea | token-classification (NER para redaccion de PII) |
| Modelo base | jhu-clsp/mmBERT-small |
| Tipos de entidad | 29: ACCOUNT_ID, AGE, BANK_ACCOUNT, COORDINATE, CREDIT_CARD, CREDIT_CARD_CVV, DATE, DATE_OF_BIRTH, DEVICE_ID, DRIVER_LICENSE, EMAIL, IP_ADDRESS, LICENSE_NUMBER, LOCATION, MAC_ADDRESS, MEDICAL_ID, NATIONAL_ID, ORGANIZATION, PASSPORT, PASSWORD, PERSON, PHONE, POSTCODE, SECRET, STREET_ADDRESS, TAX_ID, URL, USERNAME, VEHICLE_ID |
| Datasets de entrenamiento | ai4privacy/pii-masking-openpii-1.5m, nvidia/Nemotron-PII, gretelai/gretel-pii-masking-en-v1 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer para clasificacion de tokens construido sobre jhu-clsp/mmBERT-small, la variante multilingue de la familia ModernBERT. La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste por preferencias (RLHF/DPO); en un modelo de este tipo lo habitual seria un ajuste supervisado de clasificacion de tokens, pero eso no se confirma en la model card, por lo que se marca como no disponible. Los tres conjuntos de datos declarados son ai4privacy/pii-masking-openpii-1.5m, nvidia/Nemotron-PII y gretelai/gretel-pii-masking-en-v1, y el autor afirma que solo se utilizaron datos con licencias permisivas.

La innovacion practica no esta en la arquitectura, sino en el empaquetado para redaccion: el repositorio incluye `redact.py`, que fusiona piezas subword, recorta espacios en blanco y procesa documentos largos mediante ventanas solapadas; `llm_guard_conf.py`, que mapea las etiquetas del modelo a entidades de Presidio y LLM Guard; y un reconocedor de Presidio listo para registrar en un `AnalyzerEngine`. Se distribuyen exportaciones ONNX y compatibilidad con transformers.js, lo que habilita inferencia en navegador y en el borde. La model card advierte que los atributos sensibles como genero, religion o condiciones de salud no se etiquetan en esta version.

## Capacidades

- Deteccion de PII en 29 tipos de entidad, agrupables en nombres y datos de contacto (PERSON, EMAIL, PHONE, USERNAME, URL), direcciones (STREET_ADDRESS, LOCATION, POSTCODE, COORDINATE), identificadores oficiales (NATIONAL_ID, PASSPORT, DRIVER_LICENSE, TAX_ID, MEDICAL_ID, LICENSE_NUMBER), datos financieros (BANK_ACCOUNT, CREDIT_CARD, CREDIT_CARD_CVV, ACCOUNT_ID), identificadores de dispositivo y red (IP_ADDRESS, MAC_ADDRESS, DEVICE_ID, VEHICLE_ID) y credenciales (PASSWORD, SECRET).
- La etiqueta SECRET cubre claves de API, tokens, claves privadas, cadenas de conexion y cookies de sesion.
- Redaccion de texto mediante sustitucion por etiquetas (por ejemplo, `[PERSON]`, `[STREET_ADDRESS]`, `[POSTCODE]`).
- Procesamiento multilingue en 36 idiomas y en alfabetos latinos y no latinos.
- Procesamiento de documentos largos mediante ventanas solapadas en el script de redaccion incluido.
- Integracion con Presidio como reconocedor adicional y con el escaner Anonymize de LLM Guard mediante un fichero de configuracion.
- Ejecucion en navegador y en el borde mediante transformers.js y ONNX.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un modelo de etiquetado de tokens.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Saneamiento de logs de aplicacion: antes de escribir trazas en un sistema de observabilidad, el modelo marca correos, telefonos, tokens y direcciones, de modo que el logging no persista PII ni credenciales. Es adecuado por su tamano (141 M) y su capacidad de ejecucion en CPU, que permite insertarlo en la ruta de escritura de logs sin GPU.
- Pasarela de redaccion previa a APIs de LLM: en un proxy o gateway que envie prompts a un proveedor externo, el modelo detecta y enmascara identificadores antes de la salida del prompt, reduciendo la exposicion de datos personales a terceros.
- Anonimizacion de datasets de entrenamiento: aplicar el modelo sobre corpus propios para sustituir entidades por etiquetas antes de reutilizarlos o compartirlos. Los 29 tipos de entidad y el soporte de 36 idiomas permiten cubrir corpus multilingues con un unico componente.
- Deteccion de secretos en repositorios y ficheros de configuracion: la etiqueta SECRET y el conjunto de retencion del autor (codigo, configuraciones y chats en 36 idiomas, con 0,75 de recall y 0,73 de precision) apuntan a este escenario, por ejemplo como paso previo a un commit hook o a un analisis de CI.
- Cumplimiento y atencion al cliente: anonimizar tickets, correos corporativos e hilos de soporte antes de que se almacenen o se usen para analitica. El benchmark TonicAI Privacy-Bench, sobre hilos de correo corporativo, es el mas favorable al modelo dentro de su evaluacion publicada (0,76 de recall y 0,95 de precision).
- Anonimizacion de documentos juridicos y administrativos antes de su publicacion o cesion, con el aviso de que en el benchmark TAB de sentencias del TEDH el modelo obtiene 0,61 de recall y 0,85 de precision, por debajo de su modelo base.
- Formularios y portales web sin backend dedicado: gracias a las exportaciones ONNX y transformers.js, la deteccion puede ejecutarse en el propio navegador del usuario, evitando enviar el texto sin depurar a un servidor.
- Enriquecimiento de pipelines de NLP: usar el modelo como componente de deteccion previa en un flujo de extraccion de informacion, para separar entidades sensibles de las que pueden procesarse.

## Benchmarks y rendimiento

Los datos proceden de la model card. Todos los modelos se evaluaron con el mismo pipeline `token-classification` de `transformers` (`code/pii/evaluate_pii.py`), con un maximo de 600 documentos por benchmark, y ninguno de ellos se entreno con estos conjuntos. Como cada modelo usa su propio conjunto de etiquetas, la comparacion ignora los tipos de entidad y mide recall de redaccion (proporcion de caracteres que debian enmascararse y se enmascararon) y precision de redaccion (proporcion de caracteres enmascarados que eran realmente PII).

| Benchmark | pii-redactor-small (141 M) | base (308 M) | OpenAI Privacy Filter (1,5 B) | gravitee bert-small | OpenMed PII Small (44 M) |
|---|---|---|---|---|---|
| RedactionBench (formularios, cartas y temarios estilo real; tramos "mandatory") | 0,24 / 0,73 | 0,19 / 0,74 | 0,10 / 0,85 | 0,06 / 0,76 | 0,11 / 0,76 |
| TonicAI Privacy-Bench (hilos de correo corporativo) | 0,76 / 0,95 | 0,81 / 0,94 | 0,78 / 0,97 | 0,87 / 0,76 | 0,86 / 0,82 |
| TAB: sentencias del TEDH (identificadores DIRECT) | 0,61 / 0,85 | 0,74 / 0,88 | 0,38 / 0,97 | 0,53 / 0,71 | 0,45 / 0,71 |
| Benchmark de PII en ruso (redmadrobot) | 0,72 / 0,88 | 0,71 / 0,90 | 0,67 / 0,76 | 0,64 / 0,54 | 0,71 / 0,81 |
| Secretos, codigo, configuraciones y chats en 36 idiomas (conjunto sintetico propio, retenido)* | 0,75 / 0,73 | 0,76 / 0,73 | 0,78 / 0,72 | 0,46 / 0,50 | 0,65 / 0,61 |

Formato: recall de redaccion / precision de redaccion. * El conjunto propio es el unico de los cinco sobre el que el autor controla la construccion.

La tabla de F1 de redaccion (media armonica de ambas metricas) aparece truncada en la informacion disponible: solo se conserva el encabezado y el inicio de la fila correspondiente a RedactionBench, sin cifras completas, por lo que no se reproduce.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 140.664.251 parametros: aproximadamente 0,56 GB en fp32, 0,28 GB en fp16/bf16 y 0,14 GB en int8. Son estimaciones derivadas del recuento de parametros, no cifras publicadas por el autor.
- Consumo total en inferencia con lotes pequenos: del orden de 1-2 GB en fp32 y de 0,5-1 GB en fp16, incluyendo activaciones y overhead del runtime. La model card describe el modelo como "CPU-friendly".
- Cabe en cualquier GPU de consumo: no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada reciente son suficientes, y la ejecucion en CPU es viable.
- Opciones de despliegue documentadas o soportadas por el formato publicado: pipeline `token-classification` de transformers, ONNX Runtime, transformers.js en navegador, reconocedor de Presidio, escaner Anonymize de LLM Guard y el script `redact.py` del propio repositorio.
- No se documenta soporte especifico para vLLM, TGI, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles. La model card no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La comparativa se limita a los modelos incluidos por el autor en su evaluacion. Los datos de parametros provienen de las etiquetas de la tabla de benchmarks y de la ficha del modelo; el resto de caracteristicas no se detalla en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Horizon-Labs/pii-redactor-small | 141 M | no disponible | apache-2.0 | Publico en HuggingFace, sin gating |
| Modelo base de la comparativa | 308 M (segun etiqueta de la tabla) | no disponible | no disponible | no disponible |
| OpenAI Privacy Filter | 1,5 B | no disponible | no disponible | no disponible |
| gravitee bert-small | no disponible | no disponible | no disponible | no disponible |
| OpenMed PII Small | 44 M | no disponible | no disponible | no disponible |

Diferencias observadas en los benchmarks publicados: pii-redactor-small supera a OpenAI Privacy Filter y a OpenMed PII Small en RedactionBench y en el benchmark ruso, y queda por detras de gravitee bert-small y OpenMed PII Small en TonicAI Privacy-Bench en recall (0,76 frente a 0,87 y 0,86), aunque con mejor precision (0,95 frente a 0,76 y 0,82). Frente a su modelo base de 308 M pierde en TAB y en TonicAI, y empata practicamente en el conjunto propio de secretos.

## Limitaciones y advertencias

- El propio autor advierte que el modelo "no es el mejor en todos los benchmarks": en RedactionBench el recall es bajo (0,24) y en TAB queda por debajo de su modelo base.
- Los conjuntos de evaluacion se limitaron a un maximo de 600 documentos por benchmark, lo que reduce la significacion de las diferencias entre modelos.
- La comparacion entre modelos ignora los tipos de entidad, ya que cada modelo usa su propio conjunto de etiquetas; no es una comparacion de NER estricta.
- El quinto conjunto de evaluacion es sintetico y construido por el propio autor ("our held-out synthetic set"), por lo que su capacidad de generalizacion a trafico real es limitada.
- No se etiquetan atributos sensibles como genero, religion o condiciones de salud en esta version, lo que puede dejar pasar categorias especiales de datos bajo el RGPD.
- La etiqueta ORGANIZATION se refiere a empleador o empresa vinculada a una persona, lo que puede generar ambiguedad en textos donde la organizacion no es un dato personal.
- El rendimiento depende del dominio: en formularios y documentos administrativos el recall es notablemente inferior al de hilos de correo corporativo.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos que enmascaren contenido no sensible y de falsos negativos que dejen PII sin redactar. Un fallo de recall tiene consecuencias de cumplimiento.
- La model card no documenta analisis de sesgos ni evaluaciones por idioma mas alla del benchmark ruso; el rendimiento en idiomas con alfabetos no latinos no se cuantifica.
- Longitud de contexto no documentada: para documentos largos hay que confiar en el manejo por ventanas solapadas de `redact.py`, lo que puede fragmentar entidades a caballo entre ventanas.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial, pero el autor indica que solo se entreno con datos permisivamente licenciados; conviene verificar las licencias de los tres datasets si se redistribuye el modelo o derivados.
- El modelo esta publicado por Horizon-Labs y relacionado con el ecosistema de "Agent I/O Guards"; no se ha encontrado informacion independiente sobre su validacion en produccion.
- El repositorio no registra descargas ni "likes" en el momento de la consulta y la fecha de creacion indicada es 2026-09-23, por lo que se trata de una publicacion muy reciente y sin adopcion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/pii-redactor-small
- Demo en el navegador (Space): https://huggingface.co/spaces/Horizon-Labs/pii-redactor
- Coleccion Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Modelo relacionado, Prompt Injection Guard: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Modelo base, jhu-clsp/mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Ficheros incluidos en el repositorio y referenciados por la model card: `redact.py`, `llm_guard_conf.py`, `code/pii/evaluate_pii.py`

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden al partido politico frances "Horizons", a un medio local de Arras y a definiciones de diccionario de la palabra "horizonte", sin relacion con Horizon-Labs ni con el modelo. No se dispone por tanto de paper, blog tecnico ni articulo independiente que documente el modelo.
