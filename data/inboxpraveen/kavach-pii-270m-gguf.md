# inboxpraveen/Kavach-PII-270M-GGUF

## Resumen

Kavach PII 270M GGUF es la distribucion cuantizada del modelo Kavach PII 270M, publicado por el usuario inboxpraveen en HuggingFace. Se trata de un modelo de generacion de texto de 268.098.176 parametros (aproximadamente 270M) especializado en una unica tarea: extraer datos personales (PII, PHI y PCI) de texto libre y devolverlos como un array JSON de pares etiqueta-valor. Cubre 52 tipos de entidad, desde PERSON, EMAIL o PHONE hasta identificadores especificos como AADHAAR_IN, PAN_IN, UPI_VPA, SSN_US, IBAN, SWIFT_BIC, MEDICAL_RECORD_ID o WALLET_ID.

El modelo esta construido sobre la arquitectura Gemma 3 270M, con un token embedding de 262.144 x 640 (168M de los 268M de parametros, el 63% del total). Esta distribucion concreta esta pensada para ejecutarse en llama.cpp, Ollama y LM Studio, e incluye nueve builds GGUF que cubren desde 169 MB hasta 526 MB, lo que permite despliegues en CPU, en equipos de borde y en entornos on-premise donde el texto no puede salir de la maquina.

Su relevancia actual es practica: la deteccion y redaccion de PII es un requisito de cumplimiento (RGPD, HIPAA, DPDPA india) y la mayoria de las alternativas exigen modelos grandes o servicios en la nube. Un modelo de 270M con 89,2 de F1 en la tarea, 94,1% de recall de redaccion y 0,0% de falsos positivos en documentos limpios (segun la evaluacion del propio autor, sobre 400 documentos estratificados del conjunto de test) se puede servir de forma local y a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 3 270M; hidden size 640, vocabulario de 262.144 tokens |
| Parametros totales | 268.098.176 (aproximadamente 270M), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion; los ejemplos de uso de llama.cpp y Ollama configuran 4096 tokens (`-c 4096`, `num_ctx 4096`) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16, Q4_K_M-emb_q4_0, Q5_K_M-emb_q5_0 |
| Idiomas soportados | 26 idiomas declarados en los metadatos: en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur, ar, zh, ja, ko, ru, tr, vi, id, es, fr, de, it, pt, nl, pl. La model card afirma 29 idiomas; la lista de metadatos contiene 26 |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |
| Tamano del repositorio | 2,5 GB |
| Modelo base | inboxpraveen/Kavach-PII-270M |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Gemma 3 270M, con una forma poco habitual para su tamano: el token embedding concentra el 63% de los parametros (262.144 x 640 = 168M de 268M) y el hidden size es de 640. Esa combinacion tiene consecuencias directas en la cuantizacion. Por un lado, llama.cpp mantiene los embeddings en alta precision por defecto, de modo que un build nominal Q2_K solo alcanza 6,88 bits por peso en lugar de los 2,6 habituales y acaba siendo apenas un 6% mas pequeno que Q4_K_M. Por otro, 640 no es divisible por 256 (el tamano de bloque de las K-quant), lo que provoca que llama.cpp caiga silenciosamente a `q5_0` o `q8_0` en la mayoria de tensores, emitiendo un aviso por tensor.

Los ficheros con sufijo `-emb_*` resuelven el problema cuantizando tambien el embedding con tipos legacy de bloque 32, divisibles por 640; asi se llega a los 169 MB del build `Q4_K_M-emb_q4_0`. La model card advierte ademas de una trampa concreta: `--token-embedding-type q4_K` genera un fichero corrupto en esta arquitectura, la conversion falla una asercion de GGML al escribir pero `llama-quantize` termina con codigo de salida 0, y el fichero resultante es rechazado por llama.cpp con `invalid magic characters`. Para el embedding hay que usar `q4_0`, `q5_0` o `q8_0`.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card describe un unico modo de operacion: un prompt de instruccion con la lista de 52 etiquetas que pide como salida exclusivamente un array JSON de objetos `{"label": ..., "text": ...}`, con la exigencia de copiar cada valor exactamente como aparece en el texto. El modelo tiene un modelo base no cuantizado asociado (inboxpraveen/Kavach-PII-270M), y esta publicacion es solo la conversion a GGUF.

## Capacidades

- Extraccion de PII en 52 categorias: identificadores de persona (PERSON, DOB, AGE, GENDER_SEX), contacto (EMAIL, PHONE, ADDRESS, POSTAL_CODE, GEO_LOCATION), documentos (PASSPORT, DRIVING_LICENSE, NATIONAL_ID, VOTER_ID, STUDENT_ID, EMPLOYEE_ID), datos financieros (IBAN, CREDIT_DEBIT_CARD, CARD_CVV, CARD_EXPIRY, BANK_ACCOUNT, ROUTING_CODE, SWIFT_BIC, TRANSACTION_ID, WALLET_ID, UPI_VPA, PAN_IN, AADHAAR_IN, TAX_ID, SSN_US), credenciales (PASSWORD_SECRET, API_KEY_TOKEN, USERNAME, URL_PERSONAL, IP_ADDRESS, MAC_ADDRESS, DEVICE_ID), datos de salud (MEDICAL_RECORD_ID, HEALTH_ID, INSURANCE_ID, PRESCRIPTION_ID, LAB_ORDER_ID, CASE_ID, BIOMETRIC_DESCRIPTOR, DISABILITY) y categorias sensibles o de contexto (RELIGION, ETHNICITY, POLITICAL_BELIEF, ORGANIZATION, SIGNATURE, LICENSE_PLATE, VIN, DATE_TIME).
- Salida estructurada: genera un array JSON con pares etiqueta-valor, sin texto adicional, pensado para consumo programatico directo.
- Redaccion y anonimizacion: la metrica de recall de redaccion del 94,1% en Q4_K_M indica que esta disenado para enmascarar entidades, no solo para listarlas.
- Multilingue: 26 idiomas declarados en metadatos, con cobertura nominal de lenguas indias (hindi, tamil, telugu, bengali, marati, guyarati, canares, malabar, punyabi, urdu) ademas de arabe, chino, japones, coreano, ruso, turco, vietnamita, indonesio y las principales lenguas europeas, incluido el espanol.
- Uso conversacional via plantilla de chat (etiqueta `conversational`, endpoint compatible con la API de chat de llama.cpp).
- Manejo explicito del caso negativo: si el texto no contiene datos personales, el modelo debe devolver `[]`.

No se documenta en la informacion disponible soporte de tool calling ni de function calling, ni capacidades de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Redaccion de PII en pipelines de datos: el modelo se inserta como paso previo a cualquier almacenamiento o envio de texto a terceros. Con 169-249 MB de pesos, 0,0% de falsos positivos en documentos limpios y entre 8,2 y 9,2 documentos por segundo en una GPU de portatil, se puede procesar un corpus completo sin coste de API.
- Cumplimiento del RGPD en atencion al cliente: los tickets y transcripciones de chat se pasan por el modelo antes de enviarse a un proveedor externo o de almacenarse, de modo que IBAN, telefonos, correos y direcciones quedan enmascarados. Los identificadores de tarjeta y CVV cubren el requisito PCI.
- Despliegue on-premise en sanidad: con el build `Q4_K_M-emb_q4_0` (169 MB) y `-ngl 0 -t 8` se ejecuta en CPU sin GPU, lo que permite procesar historiales o notas clinicas en la maquina donde residen los datos. Las etiquetas MEDICAL_RECORD_ID, HEALTH_ID, PRESCRIPTION_ID, LAB_ORDER_ID y BIOMETRIC_DESCRIPTOR estan alineadas con este escenario (HIPAA exige salvaguardas equivalentes sobre PHI).
- Saneado de logs de aplicacion: las etiquetas API_KEY_TOKEN, PASSWORD_SECRET, IP_ADDRESS, MAC_ADDRESS, USERNAME y URL_PERSONAL permiten limpiar logs y trazas de errores antes de enviarlos a un sistema de observabilidad o a un bucket compartido.
- Preprocesado para anonimizacion de datasets de entrenamiento: antes de publicar un corpus, se ejecuta el modelo sobre cada documento y se sustituyen las entidades detectadas. El recall de redaccion del 94,1% obliga a una revision humana del 6% restante o a umbrales conservadores en el pipeline.
- Filtrado en herramientas de toma de notas o correo: integrado en un cliente local via Ollama o LM Studio, el modelo marca datos personales al vuelo en el texto que el usuario escribe, sin enviar nada a la nube.
- Auditoria de documentos financieros y de identidad: la cobertura de IBAN, SWIFT_BIC, ROUTING_CODE, CREDIT_DEBIT_CARD, CARD_CVV y CARD_EXPIRY permite construir un verificador que detecte si un documento contiene numeros de tarjeta o cuentas antes de archivarlo.
- Cumplimiento en el contexto normativo indio: AADHAAR_IN, PAN_IN, UPI_VPA y VOTER_ID cubren identificadores que la DPDPA india trata como datos personales, algo poco frecuente en modelos de PII de origen occidental.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la evaluacion propia del autor, medida sobre 400 documentos estratificados del conjunto de test held-out, servidos con `llama-server`, offload completo en GPU, decodificacion greedy y prompts identicos. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Fichero | Tamano | Value F1 | Cambio vs F16 | Recall de redaccion | Falsos positivos en documentos limpios |
|---|---|---|---|---|---|
| Q4_K_M | 249 MB | 89,2 | +0,0 | 94,1 | 0,0% |
| Q8_0 | 286 MB | 89,3 | +0,1 | 94,3 | 0,0% |
| Q6_K | 278 MB | 89,0 | -0,2 | 93,9 | 0,0% |
| Q5_K_M | 256 MB | 88,9 | -0,3 | 93,1 | 0,0% |
| F16 | 526 MB | 89,2 | referencia | 94,0 | 0,0% |
| Q4_K_M-emb_q4_0 | 169 MB | 87,2 | -2,0 | 91,4 | 0,0% |
| Q5_K_M-emb_q5_0 | 196 MB | 88,0 | -1,2 | 93,0 | 0,0% |
| Q3_K_M | 239 MB | 88,4 | -0,8 | 94,0 | 0,0% |
| Q2_K | 234 MB | 84,9 | -4,3 | 89,6 | 2,3% |

Velocidad medida: entre 8,2 y 9,2 documentos por segundo en todos los cuantizados, sobre un portatil con RTX 5060, con un pico de memoria residente de entre 1,9 y 2,5 GB. La model card recomienda empezar por `Q4_K_M` (igual rendimiento que F16, la mitad de tamano y cero fallos de parseo) y descarta `Q2_K` por su caida de 4,3 puntos de F1 y la aparicion de falsos positivos.

## Requisitos de hardware

- VRAM: la huella real medida es de 1,9 a 2,5 GB de memoria residente pico con offload completo en GPU, para todos los cuantizados. El peso de los ficheros va de 169 MB (`Q4_K_M-emb_q4_0`) a 526 MB (F16).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede alojar el modelo completo con `-ngl 99`. El autor midio 8,2-9,2 documentos por segundo en una RTX 5060 Laptop. No hay datos publicados para A100, H100 o RTX 4090, aunque por tamano son sobradamente suficientes.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, incluidas las integradas con memoria compartida suficiente. Tambien cabe en Raspberry Pi y equipos similares en modo CPU.
- CPU: el build `Q4_K_M-emb_q4_0` de 169 MB esta pensado explicitamente para despliegue sin GPU (`-ngl 0 -t 8`), lo que lo hace apto para borde y on-premise.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`), Ollama (mediante Modelfile), LM Studio y cualquier runtime que lea GGUF. Los ejemplos de la model card usan `-c 4096 -ngl 99 --port 8080` y la API compatible de chat completions.
- Latencia y throughput: 8,2-9,2 documentos por segundo con greedy decoding en RTX 5060 Laptop, con `max_tokens` de 768 en el ejemplo de extraccion. No hay datos de latencia por peticion ni de throughput en CPU publicados.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos, y no se han encontrado en la busqueda web enlaces relevantes que aporten datos de terceros. La tabla siguiente recoge unicamente lo que se puede afirmar con la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento en PII | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kavach PII 270M GGUF | 268.098.176 | uso recomendado 4096 tokens | F1 89,2 y recall de redaccion 94,1 en Q4_K_M (evaluacion propia del autor, 400 documentos) | gemma | GGUF en HuggingFace, 9 cuantizaciones |
| Kavach PII 270M (base, safetensors) | 268.098.176 | no disponible | no disponible | gemma | HuggingFace |
| Otras soluciones de deteccion de PII (modelos NER especializados, reglas tipo Presidio) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validacion externa inexistente: el repositorio tiene 0 descargas y 0 likes, y todas las metricas proceden de la evaluacion del propio autor. No hay benchmarks de terceros ni comparaciones independientes.
- Muestra de evaluacion reducida: 400 documentos estratificados de un unico conjunto de test, sin detalle publico de su composicion, dominio o reparto por idioma.
- Recall de redaccion del 94,1%: en un contexto de cumplimiento normativo, el 5,9% de entidades no detectadas es un riesgo real. Para uso regulatorio hace falta una capa de validacion adicional o revision humana.
- Riesgo de alucinacion de entidades: al ser un modelo generativo, puede devolver valores que no aparezcan literalmente en el texto de entrada. El prompt exige copiar los valores exactamente, pero no hay garantia mecanica de ello.
- Dependencia de parseo: la salida es texto que debe interpretarse como JSON. El autor reporta cero fallos de parseo en la evaluacion, pero el pipeline de produccion necesita manejo de errores y validacion del array devuelto.
- Contexto limitado en la configuracion de referencia: los ejemplos fijan 4096 tokens, con `max_tokens` de 768 para la salida. Documentos largos deben trocearse, con el riesgo de perder entidades que crucen la frontera entre fragmentos.
- Desajuste en el numero de idiomas: la model card afirma 29 idiomas y los metadatos enumeran 26. No hay datos de rendimiento por idioma.
- Trampa de cuantizacion: `--token-embedding-type q4_K` genera un fichero corrupto en esta arquitectura y `llama-quantize` no senala el fallo con un codigo de salida distinto de cero. Hay que verificar siempre el GGUF resultante.
- Etiquetas dependientes de jurisdiccion: la lista mezcla identificadores indios (AADHAAR_IN, PAN_IN, UPI_VPA, VOTER_ID) y estadounidenses (SSN_US, ROUTING_CODE). No hay garantia de cobertura para identificadores de otros paises.
- Tratamiento de categorias sensibles: el modelo extrae RELIGION, ETHNICITY, POLITICAL_BELIEF, DISABILITY, GENDER_SEX y BIOMETRIC_DESCRIPTOR. Son datos de categoria especial y su tratamiento exige base juridica explicita.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen obligaciones de paso de condiciones y una politica de uso prohibido. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Orientado a una unica tarea: no es un modelo de proposito general. No hay evidencia de capacidades de razonamiento, codigo, matematicas, tool calling ni agentes; usarlo fuera de la extraccion de PII no tiene soporte documentado.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/inboxpraveen/Kavach-PII-270M-GGUF
- Modelo base (safetensors): https://huggingface.co/inboxpraveen/Kavach-PII-270M

No se han encontrado en la busqueda web papers, blogs tecnicos, repositorios de codigo ni demos asociados al modelo. Los resultados devueltos por el buscador no guardan relacion con el modelo ni con la deteccion de PII, por lo que se descartan como fuentes.
