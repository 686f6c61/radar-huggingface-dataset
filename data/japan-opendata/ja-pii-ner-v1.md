# japan-opendata/ja-pii-ner-v1

## Resumen

ja-pii-ner-v1 es un modelo encoder de tipo BERT para deteccion de informacion personal identificable (PII) en texto japones. Lo desarrolla el colectivo japan-opendata y se apoya en `tohoku-nlp/bert-base-japanese-v3` como modelo base. Su funcion es devolver, para un texto en japones, los spans de caracteres exactos correspondientes a 18 categorias de PII: nombres de persona, organizaciones, direcciones, telefonos, correos electronicos, numeros de tarjeta, My Number, cuentas bancarias, secretos, etc. Resuelve un problema concreto de cumplimiento normativo (anonimizacion y redaccion de documentos) en un idioma para el que escasean herramientas de este tipo.

El modelo tiene 110,6 millones de parametros, se distribuye bajo licencia Apache 2.0 y esta pensado para inferencia en CPU: incluye exportacion ONNX y un helper de redaccion listo para usar, ademas de un reconocedor para Microsoft Presidio. Esta entrenado exclusivamente con datos sinteticos, lo que evita problemas de privacidad en el propio conjunto de entrenamiento.

Su relevancia actual radica en que combina un rendimiento declarado alto (F1 micro de span de 0,977 sobre el test de Nemotron-PII-Japan) con un coste de despliegue muy bajo y una licencia permisiva, lo que lo hace apto para integrarse en pipelines de redaccion de documentos en produccion sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), token classification |
| Parametros totales | 110.645.029 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (soportado); INT8 dinamico medido pero no distribuido en v1; INT8 estatico degrada el modelo |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder BERT (`tohoku-nlp/bert-base-japanese-v3`) con cabeza de clasificacion de tokens en esquema BIO. Devuelve spans de caracteres exactos para 18 etiquetas: PERSON, ORGANIZATION, ADDRESS, POSTAL_CODE, PHONE, EMAIL, DATE_OF_BIRTH, MY_NUMBER, BANK_ACCOUNT, CREDIT_CARD, DRIVER_LICENSE, PASSPORT, HEALTH_INSURANCE, EMPLOYEE_ID, IP_ADDRESS, URL_PERSONAL, USERNAME y SECRET. El modelo solo detecta; el enmascaramiento o reemplazo corre a cargo del integrador, aunque el repositorio incluye un helper `redact.py` para esa tarea.

El entrenamiento se realizo durante 3 epocas sobre 104.998 documentos: 79.998 documentos de `nvidia/Nemotron-PII-Japan` (CC BY 4.0, NVIDIA / Elith) convertidos desde los ficheros parquet publicados, mas 25.000 documentos sinteticos generados a partir de datos publicos (nombres de lugar del registro de codigos postales de Japan Post y del registro de direcciones de la Digital Agency, PDL 1.0; nombres de organizacion del registro de numeros corporativos de la National Tax Agency, PDL 1.0). No se usaron datos personales reales ni en entrenamiento ni en evaluacion. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Deteccion de PII en japones con spans de caracteres exactos para 18 categorias.
- Clasificacion de tokens en esquema BIO con decodificacion argmax sin umbral.
- Soporte de inferencia en CPU mediante exportacion ONNX Runtime, sin necesidad de PyTorch.
- Compatibilidad con transformers.js para ejecucion en navegador.
- Integracion con Microsoft Presidio mediante un reconocedor personalizado que devuelve offsets de caracteres directamente, evitando los problemas de alineacion con la tokenizacion de spaCy en japones.
- Helper de redaccion (`redact.py`) con fusion de spans, troceado de documentos largos y enmascaramiento.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al japones.

## Casos de uso

- Redaccion de documentos antes de compartirlos: el modelo identifica telefonos, correos, direcciones y numeros de tarjeta en un texto japones y el helper `redact.py` los sustituye por etiquetas como `<EMAIL>`, lo que permite anonimizar contratos o expedientes antes de enviarlos a terceros.
- Cumplimiento de la Ley de Proteccion de Datos Personales de Japon (APPI): integrado en un pipeline de ingesta documental, marca los campos de PII para su revision o eliminacion antes de almacenar el texto en un repositorio interno.
- Enmascaramiento previo a entrenamiento de modelos: como paso de preprocesado, elimina PII de corpus japoneses antes de usarlos para ajuste fino, reduciendo el riesgo de memorizacion de datos personales.
- Integracion en Microsoft Presidio: el reconocedor incluido permite usar el modelo dentro de un framework de anonimizacion ya existente en la organizacion, con offsets de caracteres fiables en japones.
- Analisis de logs y tickets de soporte: detecta IPs, URLs personales, usuarios y secretos en registros de aplicacion para su redaccion automatica antes de exportarlos a sistemas de observabilidad.
- Ejecucion en el navegador o en el borde: gracias a la exportacion ONNX y a transformers.js, puede aplicarse redaccion en cliente sin enviar el texto a un servidor, lo que resulta util en formularios web con datos sensibles.
- Procesamiento por lotes en CPU: con un throughput medido de 4,46 documentos por segundo en ONNX fp32 sobre un Intel i7-11700F, es viable redactar volumenes moderados de documentos sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test split completo de `nvidia/Nemotron-PII-Japan` convertido a spans de caracteres (10.001 documentos, 43.064 spans gold) mas un conjunto sin PII de 2.068 documentos. Decodificacion BIO argmax sin umbral; sin ajuste contra el test.

| Metrica | Valor |
|---|---|
| Precision (micro) | 0,9965 |
| Recall (micro) | 0,9582 |
| F1 (micro) | 0,9770 |
| Tasa de falsos positivos en documentos sin PII | 0,0000 (0 / 2.068) |

Rendimiento por etiqueta (precision / recall / F1):

| Etiqueta | P | R | F1 |
|---|---|---|---|
| PERSON | 0,9987 | 0,9577 | 0,9778 |
| ORGANIZATION | 0,9918 | 0,8790 | 0,9320 |
| ADDRESS | 0,9919 | 0,9610 | 0,9762 |
| POSTAL_CODE | 1,0000 | 1,0000 | 1,0000 |
| PHONE | 0,9951 | 0,9562 | 0,9753 |
| EMAIL | 1,0000 | 1,0000 | 1,0000 |
| DATE_OF_BIRTH | 1,0000 | 1,0000 | 1,0000 |
| MY_NUMBER | 1,0000 | 1,0000 | 1,0000 |
| BANK_ACCOUNT | 1,0000 | 1,0000 | 1,0000 |
| CREDIT_CARD | 1,0000 | 1,0000 | 1,0000 |
| HEALTH_INSURANCE | 1,0000 | 1,0000 | 1,0000 |
| EMPLOYEE_ID | 0,9992 | 0,9990 | 0,9991 |
| IP_ADDRESS | 0,9984 | 0,9984 | 0,9984 |
| URL_PERSONAL | 1,0000 | 1,0000 | 1,0000 |
| USERNAME | 0,9989 | 0,9978 | 0,9984 |
| SECRET | 0,9620 | 0,8000 | 0,8736 |

DRIVER_LICENSE y PASSPORT no tienen spans gold en este conjunto de test y no se evaluan en las cifras anteriores.

Velocidad en CPU (Intel i7-11700F, 200 documentos, media por documento):

| Runtime | ms/doc | docs/sec |
|---|---|---|
| PyTorch (fp32) | 813,96 | 1,23 |
| ONNX (fp32) | 224,16 | 4,46 |

La exportacion ONNX fp32 reproduce exactamente el modelo PyTorch sobre el test completo (identicos TP/FP/FN por etiqueta). La cuantizacion INT8 dinamica medida (188 MB, 122 ms/doc) no se distribuye en v1 porque la F1 micro cae a 0,8988, con perdidas grandes de recall en etiquetas numericas y de patron (IP_ADDRESS, URL_PERSONAL, SECRET, BANK_ACCOUNT); la INT8 estatica degrada el modelo por completo.

Comparacion en el mismo test con `az225/privacy-masker-ja-pii-ner-30m`, restringida a las 3 etiquetas que mapean 1 a 1 (PERSON, ORGANIZATION, ADDRESS; 24.149 spans gold):

| Modelo | P | R | F1 (3 etiquetas) |
|---|---|---|---|
| ja-pii-ner-v1 | 0,9947 | 0,9325 | 0,9626 |
| az225/privacy-masker-ja-pii-ner-30m | 0,6343 | 0,6809 | 0,6568 |

El propio autor advierte que las definiciones de etiqueta difieren: az225 separa nombres de lugar en una etiqueta LOCATION, y contarla como ADDRESS eleva su recall de ADDRESS a 0,9821; su recall de PERSON (0,9961) es superior al del modelo (0,9577).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 110,6 M de parametros en fp32 el modelo ocupa aproximadamente 0,44 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requiere GPU; el modelo esta optimizado para CPU. Cualquier GPU con al menos 1-2 GB de memoria libre es suficiente.
- Cabe en GPU consumer: si, en cualquier modelo actual (RTX 3060, RTX 4090, etc.), aunque su uso previsto es CPU.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime, transformers.js, Microsoft Presidio mediante el reconocedor incluido. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificacion.
- Latencia y throughput medidos en CPU (Intel i7-11700F): 813,96 ms/doc en PyTorch fp32 y 224,16 ms/doc en ONNX fp32 (4,46 docs/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (3 etiquetas comunes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ja-pii-ner-v1 | 110,6 M | no disponible | 0,9626 | Apache 2.0 | Hugging Face, ONNX incluido |
| az225/privacy-masker-ja-pii-ner-30m | no disponible (nombre sugiere ~30 M) | no disponible | 0,6568 | no disponible | Hugging Face |

No se dispone en la informacion proporcionada de otros modelos comparables de deteccion de PII en japones. La comparacion con az225 debe leerse con cautela por las diferencias de definicion de etiquetas descritas en la seccion de benchmarks.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el rendimiento sobre documentos reales puede diferir y las cifras de benchmark no constituyen una garantia de calidad en produccion.
- Riesgo de alucinacion de spans: como clasificador de tokens puede generar falsos positivos en cadenas que se parecen a patrones de PII (numeros, identificadores) sin serlo; la tasa medida de falsos positivos en documentos sin PII es 0,0000, pero procede de datos sinteticos.
- Recall mas bajo en ORGANIZATION (0,8790) y SECRET (0,8000), lo que implica que parte de estas entidades pueden pasar sin redactar.
- DRIVER_LICENSE y PASSPORT no estan evaluados por falta de spans gold en el conjunto de test.
- Solo soporta japones; no hay capacidades multilingues.
- La cuantizacion INT8 no es una configuracion soportada en v1: la dinamica reduce la F1 a 0,8988 y la estatica degrada el modelo. Debe usarse fp32.
- El modelo solo detecta; el enmascaramiento debe implementarse aparte (el repositorio ofrece `redact.py` como ayuda).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; conviene validar sobre datos reales propios antes de desplegar.
- No se especifica la longitud maxima de contexto en la informacion disponible; para documentos largos el helper incluye troceado, pero el limite efectivo del encoder no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-pii-ner-v1
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII-Japan
- Modelo comparable evaluado: https://huggingface.co/az225/privacy-masker-ja-pii-ner-30m
- Microsoft Presidio: https://microsoft.github.io/presidio/
- ONNX Runtime: https://onnxruntime.ai/
- transformers.js: https://huggingface.co/docs/transformers.js
