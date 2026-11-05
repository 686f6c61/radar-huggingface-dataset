# CobuildX-AI/cbx-indic-pii-extractor-36M

## Resumen

cbx-indic-pii-extractor-36M es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en lenguas índicas y en inglés indio. Lo desarrolla CobuildX-AI y se distribuye bajo licencia Apache 2.0. El modelo deriva de jhu-clsp/mmBERT-small mediante destilación de conocimiento desde un modelo interno de mayor tamaño no publicado, y está pensado para tareas de privacidad y redacción automática de datos sensibles.

Con 36,5 millones de parámetros y una ventana de contexto de 8.192 tokens, el modelo etiqueta cada fragmento de texto con una de 27 categorías de PII, entre las que se incluyen identificadores específicos del contexto indio como Aadhaar, PAN, UPI, IFSC, voter ID, ration card o números de vehículo. Cubre 12 lenguas índicas (hindi, bengalí, maratí, tamil, telugu, kannada, malayalo, gujarati, punyabí, odia, asamés y urdu) además del inglés, tanto en escritura nativa como romanizada y en texto con mezcla de lenguas (code-mixing).

Su relevancia actual radica en el hueco que cubre: la mayoría de los detectores de PII están entrenados para inglés y para identificadores occidentales, mientras que este modelo aborda el ecosistema de identificadores administrativos y financieros del subcontinente indio. Está diseñado para ejecutarse en CPU con latencias bajas (unos 19 ms para un mensaje corto y 129 ms para un documento de 2.000 caracteres con 8 hilos) y se ofrece también en variantes de 58M y 17M parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) |
| Parámetros totales | 36.476.215 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible (se distribuye en safetensors y ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (escritura nativa, romanizada y code-mixed) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, concretamente una versión reducida de jhu-clsp/mmBERT-small. Conserva 11 de las 22 capas del modelo de 58M (tomando una capa de cada dos, de modo que se mantiene la proporción entre atención completa y atención local) y mantiene el vocabulario de 40.000 tokens. La ventana de contexto es de 8.192 tokens procesados en una sola pasada, con división automática para textos más largos.

El entrenamiento se realizó sobre los mismos datos que la variante de 58M, combinando aprendizaje supervisado a partir de las etiquetas con destilación de conocimiento desde un modelo interno de mayor tamaño (el profesor no se ha publicado). El modelo produce etiquetas BIO para 27 clases de PII. No se han detallado en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, más allá de que cubre 13 lenguas y tres estilos de escritura.

## Capacidades

- Detección de entidades de PII con posiciones exactas (inicio y fin) y una de 27 etiquetas: PERSON, PHONE, EMAIL, ADDRESS, DATE_OF_BIRTH, DATE, AMOUNT, BANK_ACCOUNT, IFSC, UPI_ID, PAYMENT_CARD, AADHAAR, PAN, VOTER_ID, RATION_CARD, PASSPORT, DRIVERS_LICENSE, VEHICLE_REG, NATIONAL_ID, TAX_ID, CUSTOMER_ID, EMPLOYEE_ID, PATIENT_ID, SECRET, USERNAME, URL e IP_ADDRESS.
- Procesamiento multilingüe en 12 lenguas índicas más inglés, incluyendo texto en escritura nativa, romanizado y con mezcla de lenguas.
- Manejo de valores enmascarados: conserva la máscara completa (por ejemplo, `XXXX XXXX 4521` como AADHAAR o `**9813` como BANK_ACCOUNT).
- Función de redacción (`redact`) que sustituye cada valor detectado por su etiqueta o por una plantilla personalizada.
- Filtrado por subconjunto de etiquetas mediante el parámetro `labels`.
- Inferencia en CPU y GPU, con variante ONNX Runtime que emplea el operador fusionado `com.microsoft.MultiHeadAttention`.
- No se menciona soporte de tool calling, agentes, visión ni audio; es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Redacción de PII en atención al cliente: el modelo detecta nombres, teléfonos, correos y direcciones en conversaciones multi-turno y chats de soporte, permitiendo anonimizar los registros antes de almacenarlos o enviarlos a sistemas externos.
- Cumplimiento normativo en banca y finanzas: identificación de Aadhaar, PAN, números de cuenta, IFSC, UPI y tarjetas de pago en documentos y formularios, para su enmascaramiento antes de auditorías o exportaciones.
- Saneamiento de datos para entrenamiento de modelos: eliminación de PII en corpus en lenguas índicas recopilados de la web, correos o SMS, reduciendo el riesgo de memorización de datos personales.
- Procesamiento de historiales clínicos: detección de PATIENT_ID (MRN, UHID), nombres y fechas de nacimiento en informes hospitalarios antes de compartirlos con investigadores o proveedores externos.
- Anonimización de transcripciones de call centers: el modelo reconoce números de teléfono, importes, fechas y secretos (OTP, MPIN, CVV) en transcripciones de llamadas en varios idiomas índicos y en inglés indio.
- Filtrado de secretos en logs y prompts: detección de SECRET (OTP, contraseñas, CVV), IP_ADDRESS, URL y USERNAME en registros de aplicaciones y en entradas de chatbots, para evitar fugas en sistemas de observabilidad.
- Enmascaramiento en pipelines de documentos escaneados: al tolerar ruido de escaneo en formularios, puede integrarse en flujos de digitalización para redactar datos antes de la indexación.

## Benchmarks y rendimiento

Los resultados publicados corresponden al Indic PII Bench (CobuildX, pendiente de publicación), con 10.035 documentos sintéticos en 13 lenguas y tres estilos de escritura, evaluados sobre el split de test (8.028 documentos). La métrica es F1 tipado sobre las 14 clases que todos los modelos de la tabla pueden nombrar. La información disponible solo incluye la fila completa del modelo de 58M y una fila truncada del modelo de 36M, por lo que los datos de este último no pueden presentarse de forma fiable.

| Modelo | F1 tipado | Precisión | Recall | Documentos sin PII marcados | CPU, mediana por texto |
|---|---:|---:|---:|---:|---:|
| cbx-indic-pii-extractor-58M | 0.930 | 0.945 | 0.915 | 19,9% | 16 ms |
| cbx-indic-pii-extractor-36M | no disponible (dato truncado en la información) | no disponible | no disponible | no disponible | no disponible |

El autor indica que el modelo de 36M consume aproximadamente la mitad del tiempo de CPU del de 58M, con unas 19 ms para un mensaje corto y 129 ms para un documento de 2.000 caracteres en CPU de 8 hilos, y unos 8 ms en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 36,5M de parámetros; en fp32 ocupa aproximadamente 146 MB de pesos, en fp16 unos 73 MB y en int8 unos 37 MB. El consumo real de memoria incluye activaciones y depende de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se menciona el uso de GPU de forma genérica, sin modelos concretos. Funciona en RTX 4090, A100 o H100 sin problemas, aunque está optimizado para CPU.
- Cabe en cualquier GPU de consumo actual e incluso en CPU sin GPU dedicada; el diseño prioriza la inferencia en CPU.
- Opciones de despliegue: PyTorch con el script `pii.py` incluido en el repositorio, y ONNX Runtime 1.23 o superior mediante `onnx/model.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación de tokens).
- Latencia y throughput: aproximadamente 19 ms por mensaje corto y 129 ms por documento de 2.000 caracteres en CPU de 8 hilos; unos 8 ms en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| cbx-indic-pii-extractor-36M | 36,5M | 8.192 | 12 índicas + en | Apache 2.0 | HuggingFace (safetensors, ONNX) |
| cbx-indic-pii-extractor-58M | 58M (aprox.) | 8.192 | 12 índicas + en | Apache 2.0 | HuggingFace |
| cbx-indic-pii-extractor-17M | 17M (aprox.) | No disponible | 12 índicas + en | Apache 2.0 | HuggingFace |
| Modelo interno (profesor) | No disponible | No disponible | No disponible | No publicado | No disponible |

La comparativa se limita a las variantes del mismo autor, ya que la información disponible no incluye otros detectores de PII comparables. El modelo de 58M obtiene un F1 tipado de 0,930, una precisión de 0,945 y un recall de 0,915 en el Indic PII Bench; el de 36M no tiene métricas publicadas en la información disponible. El profesor interno puntúa por encima según el autor, pero no se ha liberado.

## Limitaciones y advertencias

- El modelo es una destilación de un profesor no publicado; sus métricas pueden ser inferiores a las del modelo de 58M, aunque no se dispone del dato exacto.
- La tasa de falsos positivos en documentos sin PII es relevante: el modelo de 58M marca como PII el 19,9% de los documentos que no contienen PII pero sí códigos de aspecto similar. No se dispone del dato para el 36M.
- Los resultados de benchmarks proceden de un conjunto sintético (Indic PII Bench) generado de forma independiente a los datos de entrenamiento; el rendimiento en datos reales de producción puede diferir.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre datos sintéticos y listas de nombres, puede tener cobertura desigual entre lenguas y variantes dialectales.
- Riesgo de alucinación de entidades: al ser un etiquetador de tokens, puede marcar fragmentos como PII cuando no lo son (falsos positivos), lo que en un pipeline de redacción puede eliminar información legítima.
- La longitud de contexto es de 8.192 tokens; los textos más largos se dividen automáticamente, lo que puede afectar a entidades que crucen la frontera de división.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento originales, no detalladas en la información disponible.
- La variante ONNX utiliza el operador fusionado `com.microsoft.MultiHeadAttention`, por lo que puede no cargar en runtimes ONNX distintos de ONNX Runtime.
- No se especifican cuantizaciones oficiales; el uso en producción con cuantización requeriría validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-36M
- Variante de 58M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-58M
- Variante de 17M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-17M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Indic PII Bench: pendiente de publicación según la model card (sin enlace disponible)
