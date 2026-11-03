# CobuildX-AI/cbx-pii-extractor-4M

## Resumen

cbx-pii-extractor-4M es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto en inglés. Lo desarrolla CobuildX-AI y forma parte de una familia de cuatro tamaños (4M, 17M, 32M y 68M) construida sobre la arquitectura ModernBERT. Su función es localizar cada valor sensible en el texto y devolver su posición exacta (offsets de inicio y fin) junto con una de 18 etiquetas posibles, como PERSON, EMAIL, PHONE, BANK_ACCOUNT o SECRET.

El modelo resuelve un problema muy concreto de cumplimiento y privacidad: la redacción automática de datos personales antes de almacenar, registrar o enviar texto a otros sistemas. Con 4.060.709 parámetros (unos 16 MB), está diseñado para ejecutarse en CPU con una latencia muy baja (aproximadamente 26 ms por cada 1.000 tokens) y ofrece además pesos en formato ONNX para inferencia con ONNX Runtime.

Es relevante ahora porque demuestra que un modelo de 4M de parámetros puede competir en F1 de coincidencia exacta con soluciones basadas en spaCy o en modelos de cientos de millones de parámetros en documentos empresariales, a costa de un rendimiento inferior en mensajes de chat. La versión actual es la v0.2 y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), variante reducida del cbx-pii-extractor-17M |
| Parametros totales | 4.060.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens (lectura en una sola pasada; textos mas largos se dividen automaticamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (onnx/model.onnx) |

## Arquitectura y entrenamiento

El modelo es una versión destilada y comprimida del cbx-pii-extractor-17M (v0.2). Conserva 4 de las 7 capas del modelo base (capas 0, 2, 4 y 6), de modo que se mantiene la alternancia entre atención completa y atención local característica de ModernBERT. El vocabulario se recorta de 50.368 a 16.000 tokens, seleccionando los más frecuentes en los datos de entrenamiento; el texto fuera de vocabulario se segmenta en piezas menores. Además, la tabla de embeddings se comprime: cada token se almacena como 112 números y se expande a 256 mediante una matriz compartida, lo que exige cargar el modelo con el script `pii.py` del repositorio y no con `AutoModel` estándar.

El entrenamiento se realizó sobre los mismos datos de la versión v0.2, combinando supervisión con las etiquetas y destilación de conocimiento a partir de las predicciones del cbx-pii-extractor-68M. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo cubre 18 etiquetas de PII, entre ellas PERSON, DATE_OF_BIRTH, EMAIL, PHONE, ADDRESS, BANK_ACCOUNT, PAYMENT_CARD, CUSTOMER_ID, NATIONAL_ID, PASSPORT, TAX_ID, DRIVERS_LICENSE, USERNAME, URL, IP_ADDRESS, SECRET, EMPLOYEE_ID y PATIENT_ID.

## Capacidades

- Detección y extracción de PII en inglés con offsets exactos de inicio y fin para cada valor encontrado.
- Clasificación en 18 categorías de datos personales, incluidas credenciales (SECRET: contraseñas, PINs, claves de API y tokens) e identificadores bancarios (IBAN, tarjetas).
- Redacción automática mediante el método `redact()`, que sustituye cada valor por su etiqueta o por una plantilla personalizada.
- Filtrado por etiquetas: `extract(text, labels=[...])` permite limitar la salida a un subconjunto de categorías.
- Procesamiento de textos largos: contexto de 7.999 tokens con división automática de documentos mayores.
- Inferencia en CPU y GPU, con soporte opcional de ONNX Runtime (versión 1.23 o superior) mediante el operador fusionado `com.microsoft.MultiHeadAttention`.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Redacción de registros y logs: antes de persistir texto de usuario en sistemas de logging o analítica, el modelo detecta y sustituye correos, teléfonos, nombres y secretos por sus etiquetas, reduciendo la exposición de datos personales en almacenamiento.
- Cumplimiento de RGPD en pipelines de datos: integrado como paso previo al envío de texto a servicios externos o a modelos de terceros, permite anonimizar documentos y conversaciones con una latencia de 26 ms por 1.000 tokens en CPU.
- Saneamiento de datasets de entrenamiento: aplicado sobre corpus en inglés, elimina PII antes de reutilizar los datos para entrenar o evaluar otros modelos.
- Atención al cliente: procesa mensajes de chat para detectar datos sensibles antes de que se almacenen o se reenvíen a agentes; conviene tener en cuenta que en mensajes de chat su F1 es del 74,3 %, inferior al de las variantes mayores.
- Procesamiento de documentos empresariales: con un F1 del 82,0 % en Privacy-Bench docs, es adecuado para escanear páginas de contratos, facturas o formularios y marcar identificadores bancarios, números de cliente y direcciones.
- Enmascaramiento en herramientas de desarrollo: detección de claves de API, tokens y contraseñas en texto pegado por usuarios en editores, terminales o sistemas de soporte, gracias a la etiqueta SECRET.
- Despliegue en entornos con recursos limitados: al ocupar 16 MB y ejecutarse en CPU, puede incorporarse en funciones serverless, contenedores pequeños o dispositivos de borde sin GPU.

## Benchmarks y rendimiento

F1 de coincidencia exacta de span (inicio, fin y etiqueta correctos) en tres benchmarks públicos no usados en entrenamiento:

| Modelo | Tamano | Privacy-Bench docs | Privacy-Bench messages | PII-TRACE | GPU, 1.000 tokens | CPU, 1.000 tokens |
|---|---|---|---|---|---|---|
| cbx-pii-extractor-68M | 68M | 88,1 % | 91,7 % | 93,2 % | 13 ms | 229 ms |
| cbx-pii-extractor-32M | 32M | 88,0 % | 87,0 % | 93,5 % | 8 ms | 78 ms |
| cbx-pii-extractor-17M | 17M | 86,1 % | 83,1 % | 91,6 % | 6 ms | 37 ms |
| cbx-pii-extractor-4M | 4M | 82,0 % | 74,3 % | 87,7 % | 5 ms | 26 ms |
| PII-Tracer | 596M | 86,9 % | 82,0 % | 92,5 % | 160 ms | no disponible |
| GLiNER2-PII | 205M | 80,8 % | 86,9 % | 66,2 % | 91 ms | no disponible |
| Presidio (spaCy lg) | no disponible | 82,4 % | 85,8 % | 64,7 % | no disponible | 85 ms |

- Privacy-Bench docs: 656 páginas de documentos empresariales anotadas por humanos.
- Privacy-Bench messages: 5.198 mensajes de chat.
- PII-TRACE: 500 conversaciones; es el benchmark propio de PII-Tracer. Sin contar las fechas distintas de la fecha de nacimiento (que el modelo no etiqueta deliberadamente), alcanza 92,1 % frente al 91,9 % de PII-Tracer.
- En texto sin PII, el modelo marca 0,08 valores falsos por cada 1.000 caracteres, frente a 1,6-3,6 de los demás modelos comparados.
- Con ONNX Runtime en CPU y textos cortos: 2,4 ms frente a 3,8 ms con 128 tokens y 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Privacy-Bench docs | Privacy-Bench messages | PII-TRACE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| cbx-pii-extractor-4M | 4M | 7.999 | 82,0 % | 74,3 % | 87,7 % | Apache 2.0 | HuggingFace (safetensors + ONNX) |
| cbx-pii-extractor-17M | 17M | no disponible | 86,1 % | 83,1 % | 91,6 % | Apache 2.0 | HuggingFace |
| PII-Tracer | 596M | no disponible | 86,9 % | 82,0 % | 92,5 % | no disponible | no disponible |
| GLiNER2-PII | 205M | no disponible | 80,8 % | 86,9 % | 66,2 % | no disponible | no disponible |
| Presidio (spaCy lg) | no disponible | no disponible | 82,4 % | 85,8 % | 64,7 % | no disponible | no disponible |

La ventaja del modelo de 4M es la relación entre tamaño, latencia en CPU y precisión en documentos: supera ligeramente a Presidio en Privacy-Bench docs (82,0 % frente a 82,4 % es prácticamente empate) y a GLiNER2-PII, con un modelo 50 veces menor que este último. Su punto débil son los mensajes de chat, donde queda por debajo de GLiNER2-PII y Presidio.

## Limitaciones y advertencias

- Solo admite inglés; no se ha entrenado ni evaluado para otros idiomas.
- El rendimiento cae en mensajes de chat (74,3 % de F1), especialmente en la detección de nombres, según indica el autor.
- No etiqueta fechas que no sean fechas de nacimiento, lo que penaliza su puntuación en PII-TRACE; es una decisión de diseño, no un error.
- No detecta una ciudad o un país de forma aislada como ADDRESS, ni números de ticket o pedido como CUSTOMER_ID.
- Requiere cargarse con el script `pii.py` del repositorio; la carga estándar con `AutoModel` no funciona por la tabla de embeddings comprimida.
- El modelo ONNX usa el operador `com.microsoft.MultiHeadAttention`, por lo que puede no cargarse en runtimes ONNX distintos de ONNX Runtime.
- Riesgo de alucinación inherente a la clasificación de tokens: puede marcar falsos positivos, aunque la tasa reportada es baja (0,08 por 1.000 caracteres en texto sin PII).
- No se han publicado datos sobre sesgos demográficos ni sobre el impacto diferencial en nombres de distintas culturas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento, no detallada en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-4M
- Modelo base (17M): https://huggingface.co/CobuildX-AI/cbx-pii-extractor-17M
- Variante 32M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-32M
- Variante 68M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-68M
- Paper de referencia (arXiv): https://arxiv.org/abs/2507.11412
