# newmean-ai/pii-medium

## Resumen

newmean-pii-medium es un modelo de reconocimiento de entidades nombradas (NER) especializado en la deteccion de informacion personal identificable (PII) en texto multilingue. Lo desarrolla newmean-ai como parte de la familia newmean-pii, una suite de cuatro niveles (nano, small, medium, large) que alimenta un SDK de codigo abierto para redaccion y anonimizacion de datos antes de enviar texto a modelos de lenguaje de terceros. El modelo resuelve un problema concreto de privacidad: enmascarar nombres, correos, telefonos, direcciones y secretos en el propio dispositivo o navegador, sin que el texto original abandone la infraestructura del usuario.

Tecnicamente es un transformer encoder de 6 capas y 17,7 millones de parametros, destilado a partir de mMiniLMv2-L6-H384 de nreimers, con el vocabulario de XLM-R podado a 35.298 piezas. Se distribuye en formato ONNX con pesos de 4 bits, lo que reduce la descarga a 11,3 MB y permite ejecutarlo en WebAssembly dentro del navegador o en dispositivos moviles. Soporta 54 idiomas y etiqueta a nivel de caracter con 11 categorias (PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH, SECRET).

Su relevancia actual radica en que ofrece una capa de privacidad previa al envio de datos a APIs de LLM comerciales, con licencia Apache-2.0 y sin dependencia de servicios en la nube. Frente a alternativas mucho mas grandes como gliner-pii-edge (176 MB), el modelo declara una tasa de omision del 1,9 % en su conjunto de prueba publico, aunque con la advertencia de que ese conjunto comparte diseno con los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (6 capas), destilado de mMiniLMv2-L6-H384, vocabulario XLM-R podado a 35.298 piezas |
| Parametros totales | 17,7 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantizacion | 4 bits en pesos y embeddings (`model_q4e.onnx`, 11,3 MB); 4 bits solo en pesos (`model_q4.onnx`, 14,0 MB) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con tokenizer en JSON y tokenizer compacto para navegador) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con rango de embeddings de 192, construido sobre mMiniLMv2-L6-H384 (a su vez destilado de XLM-R Large). El vocabulario XLM-R se poda a las 35.298 piezas que aparecen efectivamente en los datos de entrenamiento, lo que reduce el tamano del modelo y acelera la tokenizacion. La salida es una secuencia de logits en formato BIO sobre las 11 etiquetas definidas en `config.json`, con etiquetas de nivel 1 (identificacion directa) y nivel 2 (identificacion indirecta) para personas y URLs.

El entrenamiento se basa en destilacion desde dos modelos profesor privados mas grandes (mDeBERTa-v3-base y XLM-R-large), ambos ajustados especificamente para esta tarea. Los datos son aproximadamente 1,31 millones de textos sinteticos en 54 idiomas, generados con modelos Claude a partir de una guia de etiquetado escrita; la version v1.1 anadio 240.498 textos cortos adicionales (titulos de columna, opciones de respuesta, palabras sueltas, nombres y valores aislados, filas de encuestas). No se uso ningun dato personal real ni conjunto de datos externo en el entrenamiento. El SDK incorpora opcionalmente una capa de patrones (correo, URL, tarjeta/cuenta, telefono, numero de residente coreano) desactivada por defecto.

## Capacidades

- Deteccion de PII a nivel de caracter en 11 categorias: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Etiquetado con nivel de identificacion (1 = directa, 2 = indirecta) para personas y URLs.
- Soporte multilingue en 54 idiomas, incluyendo espanol, ingles, aleman, frances, arabe, chino, japones, coreano, hindi y turco, entre otros.
- Aprendizaje de direcciones IP como ID_NUMBER.
- Capacidad de procesar texto real de formularios, chats, celdas de hoja de calculo, logs, JSON, texto OCR, correos electronicos y transcripciones de voz.
- Redaccion con vault: el SDK permite restaurar los valores originales en la respuesta del LLM.
- Modo tabla con contexto de cabecera (`context: "header"`) para exportaciones de encuestas y formularios.
- Capa opcional de patrones regex para correo, URL, tarjeta/cuenta, telefono y numero de residente coreano.
- Ejecucion en WebAssembly mediante onnxruntime-web o el motor propio del SDK.

## Casos de uso

- Redaccion previa al envio a APIs de LLM: el modelo enmascara nombres, correos y telefonos en el navegador antes de que el prompt llegue a OpenAI, Anthropic o cualquier otro proveedor, de modo que el texto original nunca abandona el dispositivo del usuario.
- Cumplimiento de RGPD en atencion al cliente: integrado en un chat de soporte, permite procesar conversaciones multi-turno y eliminar datos personales de los logs antes de almacenarlos o enviarlos a un sistema de analitica.
- Anonimizacion de exportaciones de encuestas: con el modo tabla y `context: "header"`, el modelo reduce la omision de PII al 1,93 % en 556 exportaciones de encuestas y formularios en 54 idiomas, lo que lo hace util para preparar ficheros CSV para analisis externo.
- Procesamiento de logs y trazas de aplicaciones: detecta correos, IPs y usuarios en lineas de log antes de enviarlas a plataformas de observabilidad o a un LLM para diagnostico automatico.
- Limpieza de texto OCR y transcripciones: aplicable a documentos escaneados y actas de reunion donde aparecen nombres, direcciones y numeros de identificacion que deben eliminarse antes de su publicacion.
- Enmascaramiento en aplicaciones moviles: los paquetes para iOS, Android, Flutter y Rust permiten incorporar la deteccion de PII en el propio dispositivo, sin conexion de red, en formularios y campos de texto libre.
- Preprocesado en pipelines de datos para entrenamiento: filtrar PII de corpus antes de usarlos en ajuste fino de modelos, reduciendo el riesgo de memorizacion de datos personales.

## Benchmarks y rendimiento

Resultados del modelo solo (sin capa de patrones), fichero por defecto, onnxruntime en CPU. "Miss" = proporcion de caracteres de PII sin enmascarar (menor es mejor); "over" = proporcion de caracteres no PII enmascarados.

| Conjunto | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test publico, 54 idiomas, 17.058 filas) | 1,9 / 0,6 (F1 exacto 0,77) |
| KDPII (coreano) | 11,5 / 1,6 |
| OpenPII 1.5M (30 idiomas) | 6,3 / 4,3 |
| Nemotron-PII (ingles) | 7,7 / 0,9 |
| Gretel finance (7 idiomas) | 21,5 / 5,4 |

En textos cortos y ficheros de encuesta (v1.1, conjunto privado de 20.691 items en 54 idiomas y 228 CSV): enmascara el 7,8 % de los items sin PII (v1.0: 30,6 %) y el 5,9 % de las celdas sin PII en modo celda a celda (v1.0: 22,5 %); encuentra el 97,5 % de los nombres escritos aislados.

Con SDK 1.2, los textos con emoji enmascarados caen del 14,89 % (solo modelo) al 0,78 %. El modo tabla con `context: "header"` omite el 1,93 % de los caracteres de PII en 556 exportaciones de encuestas y formularios (modo tabla solo: 7,93 %) y enmascara el 11,66 % de sus celdas sin PII.

Velocidad en CPU de una VM Colab L4 (Xeon 2,20 GHz, onnxruntime): 88 ms por texto con un hilo, 23 ms con 12 hilos, sobre los textos del test publico.

Comparacion declarada: el detector publico mas cercano de los ocho comparados (gliner-pii-edge, 176 MB) omite el 19,6 % en el test publico.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo esta disenado para ejecucion en CPU y WebAssembly. El fichero por defecto ocupa 11,3 MB en disco o memoria.
- GPU recomendadas: no aplica; no se han publicado requisitos de GPU. El modelo puede ejecutarse en cualquier CPU moderna.
- Cabe en cualquier GPU de consumo (e incluso en el navegador), dado su tamano de 11,3 MB.
- Opciones de despliegue: onnxruntime-web (WebAssembly), motor propio del SDK `@newmean-ai/pii`, onnxruntime nativo, y paquetes para Python, iOS, Android, Flutter y Rust.
- Latencia: 88 ms por texto con un hilo y 23 ms con 12 hilos en un Xeon 2,20 GHz; no se han publicado datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| newmean-pii-medium | 17,7 M | Ventanas de 256 tokens | Apache-2.0 | ONNX 4 bits | 54 idiomas, 11 etiquetas, ejecucion en navegador |
| gliner-pii-edge | No disponible | No disponible | No disponible | No disponible | 176 MB; omite el 19,6 % en el test publico de newmean-pii-dataset |
| newmean-pii-large | No disponible | No disponible | Apache-2.0 | ONNX | Nivel superior de la misma familia |
| newmean-pii-small | No disponible | No disponible | Apache-2.0 | ONNX | Nivel inferior de la misma familia |

Los datos de gliner-pii-edge provienen de la comparacion publicada por el autor del modelo; no se dispone de especificaciones detalladas de esa alternativa en la informacion proporcionada.

## Limitaciones y advertencias

- Ningun detector encuentra todo: el propio autor advierte que el resultado debe usarse para reducir lo que se envia, no como garantia de anonimato.
- El test publico de newmean-pii-dataset comparte diseno y guia de etiquetado con los datos de entrenamiento, por lo que existe una ventaja in-distribution; los conjuntos externos (KDPII, OpenPII, Nemotron-PII, Gretel finance) muestran tasas de omision notablemente mayores (hasta el 21,5 % en Gretel finance).
- El modelo se entreno exclusivamente con datos sinteticos generados por modelos Claude; puede no generalizar igual de bien a dominios o jergas no representados en esa generacion.
- Los conjuntos de evaluacion de textos cortos y de encuestas son privados y sinteticos, por lo que sus cifras no son verificables de forma independiente.
- La capa de patrones del SDK esta desactivada por defecto; sin ella, la deteccion depende unicamente del modelo.
- No se han publicado analisis de sesgos por idioma o demografia; el rendimiento varia de forma significativa entre idiomas (del 1,9 % de omision en el test propio al 11,5 % en coreano KDPII).
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la idoneidad para cumplimiento normativo estricto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-medium
- Repositorio del SDK: https://github.com/newmean-ai/pii
- Paquete npm: https://www.npmjs.com/package/@newmean-ai/pii
- Demo en navegador: https://pii.newmean.ai
- Dataset publico: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Informe tecnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Modelo large: https://huggingface.co/newmean-ai/pii-large
- Modelo small: https://huggingface.co/newmean-ai/pii-small
- Modelo nano: https://huggingface.co/newmean-ai/pii-nano
- Modelo base: https://huggingface.co/nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large
