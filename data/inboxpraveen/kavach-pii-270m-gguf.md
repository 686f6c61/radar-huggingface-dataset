# inboxpraveen/Kavach-PII-270M-GGUF

## Resumen

Kavach-PII-270M-GGUF es la distribucion en formato GGUF del modelo Kavach PII 270M v2, un modelo de 268 millones de parametros especializado en la extraccion de datos personales (PII, PHI y PCI) de texto libre en 29 idiomas. Lo desarrolla el usuario de Hugging Face inboxpraveen y se apoya en la arquitectura de Gemma-3-270M de Google, sobre la que se ha realizado un ajuste especifico para la tarea de deteccion y redaccion de informacion sensible. Su relevancia actual radica en que ofrece una capacidad de anonimizacion multilingue en un tamano que cabe en cualquier GPU de consumo e incluso en CPU, con una latencia adecuada para integrarse en pipelines de cumplimiento normativo.

El modelo no es un generador de texto generalista: su funcion es devolver un array JSON de objetos `{"label", "text"}` con las entidades personales detectadas, cubriendo 52 etiquetas distintas (desde `AADHAAR_IN` o `PAN_IN` hasta `SSN_US`, `IBAN`, `CARD_CVV`, `MEDICAL_RECORD_ID` o `BIOMETRIC_DESCRIPTOR`). Esta especializacion, junto con su tamano reducido, lo convierte en una pieza practica para tareas de redaccion previa a almacenamiento, logging o envio de datos a terceros.

La version publicada es la v2 (23 de septiembre de 2026); la v3 existe pero es privada y no se distribuyen sus pesos. Los archivos GGUF permiten ejecutar el modelo en llama.cpp, Ollama y LM Studio sin necesidad de infraestructura dedicada, y la cuantizacion Q4_K_M reproduce practicamente el rendimiento de la referencia F16 con la mitad del tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma-3-270M |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (valor recomendado en los ejemplos de uso; no se especifica el maximo arquitectonico) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16, y variantes con embedding cuantizado (`-emb_q4_0`, `-emb_q5_0`) |
| Idiomas soportados | 29: en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur, ar, zh, ja, ko, ru, tr, vi, id, es, fr, de, it, pt, nl, pl |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma-3-270M, un transformer decoder-only denso con un tamano de capa oculta de 640 y un vocabulario de 262.144 tokens. Una particularidad estructural relevante es que el embedding de tokens concentra el 63% de los parametros (262.144 x 640 = 168M de 268M), lo que condiciona fuertemente el comportamiento de la cuantizacion y explica por que los builds de baja precision no ofrecen la reduccion de tamano habitual. El modelo base ha sido ajustado especificamente para la tarea de extraccion de PII, con instrucciones que fijan las 52 etiquetas permitidas y el formato de salida JSON.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card se centra en el proceso de cuantizacion y en las metricas de evaluacion del modelo ya ajustado, no en la fase de preentrenamiento o alineamiento. La innovacion tecnica mas destacable documentada es el trabajo de cuantizacion: dado que el tamano de capa oculta (640) no es divisible por el bloque de 256 de las K-quants, llama.cpp cae silenciosamente a `q5_0` o `q8_0` en la mayoria de tensores, lo que degrada la compresion. Los archivos con sufijo `-emb_*` resuelven esto cuantizando tambien el embedding con tipos legacy de bloque 32, que si dividen 640, logrando reducir el modelo hasta 169 MB.

## Capacidades

- Extraccion de PII, PHI y PCI: identifica 52 tipos de datos personales, sanitarios y de pago en texto libre.
- Salida estructurada: devuelve un array JSON de objetos `{"label", "text"}` con los valores copiados literalmente del texto de entrada.
- Multilingue: cubre 29 idiomas, con especial cobertura de lenguas indias (hindi, tamil, telugu, bengali, marathi, gujarati, kannada, malayalam, punyabi, urdu) ademas de arabe, chino, japones, coreano, ruso, turco, vietnamita, indonesio y las principales lenguas europeas.
- Deteccion de identificadores regionales: incluye etiquetas especificas como `AADHAAR_IN`, `PAN_IN`, `UPI_VPA`, `SSN_US`, `IBAN`, `SWIFT_BIC`, `VIN` o `LICENSE_PLATE`.
- Datos sensibles especiales: reconoce `RELIGION`, `POLITICAL_BELIEF`, `ETHNICITY`, `DISABILITY`, `HEALTH_ID`, `BIOMETRIC_DESCRIPTOR` y `GENDER_SEX`.
- Redaccion y anonimizacion: pensado para sustituir o enmascarar entidades detectadas en flujos de datos.
- Integracion via API compatible con OpenAI (`/v1/chat/completions`) al servirse con `llama-server`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Redaccion previa a logging: interceptar mensajes de aplicacion antes de escribirlos en sistemas de observabilidad, extrayendo y enmascarando emails, telefonos, tokens de API y direcciones IP para cumplir con RGPD y normativas equivalentes.
- Anonimizacion de historiales clinicos: el modelo reconoce `MEDICAL_RECORD_ID`, `HEALTH_ID`, `LAB_ORDER_ID`, `PRESCRIPTION_ID` y `BIOMETRIC_DESCRIPTOR`, lo que permite desidentificar registros antes de usarlos en investigacion o entrenamiento de modelos.
- Cumplimiento PCI en atencion al cliente: deteccion de `CREDIT_DEBIT_CARD`, `CARD_CVV`, `CARD_EXPIRY` y `IBAN` en transcripciones de chats y correos para evitar que datos de pago queden almacenados en el CRM.
- Procesamiento de documentacion multilingue: con 29 idiomas soportados, se puede aplicar a contratos, formularios y correspondencia en lenguas indias y europeas dentro de un mismo pipeline, sin necesidad de modelos separados por idioma.
- Enmascaramiento en entornos con recursos limitados: al ocupar entre 169 MB y 286 MB segun cuantizacion, puede desplegarse en portatiles, contenedores pequenos o dispositivos edge donde un modelo de mayor tamano no cabria.
- Preprocesado para LLMs de terceros: ejecutar Kavach antes de enviar prompts a APIs externas para eliminar datos personales y reducir la exposicion de informacion sensible a proveedores.
- Saneamiento de datasets: pasar corpus de entrenamiento o evaluacion por el modelo para detectar y eliminar PII antes de publicarlos en abierto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 400 documentos estratificados del conjunto de test reservado, servidos con `llama-server` con offload completo a GPU, decodificacion greedy y prompts identicos:

| Archivo | Tamano | F1 (valor) | Delta vs F16 | Recall de redaccion | Falsos positivos en documentos limpios |
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

Rendimiento medido en una RTX 5060 Laptop: entre 8,2 y 9,2 documentos por segundo en todas las cuantizaciones, con un pico de memoria residente de entre 1,9 y 2,5 GB. No se han publicado resultados comparativos con otros modelos de deteccion de PII en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 1,9 y 2,5 GB de memoria residente pico con offload completo a GPU, segun cuantizacion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; el autor ha validado el rendimiento en una RTX 5060 Laptop. Para mayor throughput en servidor, A100 o H100 permitirian procesar lotes mayores, aunque el modelo no los aprovecha tanto por su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, etc.), y tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (via `Modelfile` con `FROM` apuntando al GGUF), LM Studio, y cualquier runtime compatible con GGUF. La API de `llama-server` es compatible con el endpoint `/v1/chat/completions` de OpenAI.
- Latencia y throughput: 8,2 a 9,2 documentos por segundo en RTX 5060 Laptop con decodificacion greedy y contexto de 4096 tokens.
- Advertencia de cuantizacion: `--token-embedding-type q4_K` genera un archivo corrupto en esta arquitectura (falla una asercion GGML al escribir, pero `llama-quantize` devuelve codigo 0); usar `q4_0`, `q5_0` o `q8_0` para el embedding.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de deteccion de PII en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas conocidas de la misma categoria:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kavach-PII-270M-GGUF | 268M | 4096 (recomendado) | 29 | Gemma | GGUF |
| Microsoft Presidio (basado en spaCy) | no aplica (NLP clasico) | dependiente del pipeline | varios via modelos | MIT | libreria Python |
| GLiNER (modelo NER zero-shot) | ~200M-500M segun variante | 512-1024 tipico | multilingue limitado | Apache 2.0 | safetensors / ONNX |
| Modelos NER de spaCy (`es_core_news_lg`, etc.) | variable | limitado por sentencia | por idioma | MIT | spaCy |

La comparativa de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen restricciones y obligaciones de atribucion; revisar antes de desplegar en produccion.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir etiquetas o valores que no aparecen literalmente en el texto; el autor mitiga esto instruyendo a copiar los valores exactamente, pero no hay garantia formal.
- Falsos negativos: el recall de redaccion es del 94,1% en Q4_K_M, lo que implica que aproximadamente un 6% de las entidades pueden no detectarse; no debe usarse como unico control en entornos de alto riesgo regulatorio.
- Cuantizaciones bajas degradadas: Q2_K pierde 4,3 puntos de F1 y eleva los falsos positivos en documentos limpios al 2,3%, por lo que no se recomienda para redaccion.
- Cobertura linguistica desigual: aunque declara 29 idiomas, no se documenta el rendimiento por idioma; es probable que las lenguas indias y el ingles esten mejor cubiertas que las europeas menos representadas.
- Contexto limitado: 4096 tokens recomendados; documentos mas largos requieren troceado, lo que puede romper entidades que cruzan fragmentos.
- Formato de salida rigido: espera una instruccion concreta con la lista de etiquetas y el formato JSON; desviarse de ese prompt puede degradar la calidad de la extraccion.
- Version v3 no disponible: las mejoras de la v3 no estan publicadas en abierto, por lo que este modelo representa el estado publico mas reciente pero no el mejor rendimiento del autor.
- Trampa de cuantizacion documentada: `--token-embedding-type q4_K` produce archivos corruptos que llama.cpp rechaza con `invalid magic characters`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inboxpraveen/Kavach-PII-270M-GGUF
- Modelo base (safetensors): https://huggingface.co/inboxpraveen/Kavach-PII-270M
- Articulo sobre la v3: https://inboxpraveen.github.io/blogs/blog-6.html
- Script de extraccion incluido en el repo: `kavach_extract.py` (dentro del repositorio de Hugging Face)
