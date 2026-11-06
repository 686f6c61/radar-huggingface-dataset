# CobuildX-AI/cbx-indic-pii-extractor-58M

## Resumen

cbx-indic-pii-extractor-58M es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos en lenguas índicas. Lo desarrolla CobuildX-AI y está afinado a partir de mmBERT-small, un encoder ModernBERT multilingüe del grupo JHU CLSP. El modelo resuelve un problema concreto y con demanda creciente: la redacción automática de datos personales en documentos en hindi, bengalí, tamil, telugu y otras nueve lenguas índicas, incluyendo texto romanizado y código mixto, un escenario que los modelos de PII centrados en inglés no cubren bien.

Con 57,6 millones de parámetros, el modelo etiqueta 27 tipos de entidad que van más allá de los habituales nombres, teléfonos y correos: incluye identificadores específicos del contexto indio como Aadhaar, PAN, UPI, IFSC, Voter ID, Ration Card, GSTIN, TAN o números de registro de vehículos. Su contexto de 8.192 tokens permite procesar documentos completos en una sola pasada, y el autor reporta latencias de aproximadamente 37 ms para un mensaje corto y 250 ms para un documento de 2.000 caracteres en CPU con 8 hilos, y unos 13 ms en GPU.

Es relevante ahora porque la protección de datos en despliegues sobre poblaciones índicas exige detectar formatos locales que los modelos genéricos no reconocen, y porque la familia se ofrece en tres tamaños (17M, 36M y 58M) con licencia Apache 2.0, lo que facilita su integración en pipelines de redacción previos al almacenamiento o al envío de datos a modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base mmBERT-small |
| Parametros totales | 57.570.871 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (pasada única; textos más largos se dividen automáticamente) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y un modelo ONNX) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (incluye escritura nativa, romanizada y código mixto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, afinado desde mmBERT-small para la tarea de token classification con 27 etiquetas de PII. Una innovación técnica destacable es la reducción del vocabulario de 256.000 a 40.000 tokens: se conservaron todos los tokens de las escrituras índicas y del urdu, todos los bytes y caracteres individuales, todos los tokens presentes en los datos de entrenamiento y los más frecuentes del resto. Según el autor, esto reduce el modelo a 2,4 veces menos parámetros que el modelo completo afinado sin pérdida de precisión, y permite seguir leyendo cualquier texto fragmentando las palabras raras en piezas menores. Por ello es imprescindible usar el tokenizador incluido en el repositorio y no el de mmBERT.

El entrenamiento se realizó sobre datos sintéticos de PII índica generados por el propio equipo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo discriminativo de etiquetado, estas técnicas de alineación generativa no resultan aplicables. El autor menciona un modelo profesor interno de mayor tamaño, del que derivan las variantes de 36M y 17M, que no se ha publicado.

## Capacidades

- Detección y extracción de PII con posiciones exactas de inicio y fin (`start`, `end`) para cada valor encontrado.
- Etiquetado con 27 tipos de entidad: PERSON, PHONE, EMAIL, ADDRESS, DATE_OF_BIRTH, DATE, AMOUNT, BANK_ACCOUNT, IFSC, UPI_ID, PAYMENT_CARD, AADHAAR, PAN, VOTER_ID, RATION_CARD, PASSPORT, DRIVERS_LICENSE, VEHICLE_REG, NATIONAL_ID, TAX_ID, CUSTOMER_ID, EMPLOYEE_ID, PATIENT_ID, SECRET, USERNAME, URL e IP_ADDRESS.
- Redacción automática mediante el método `redact()`, que sustituye cada valor por su etiqueta o por una plantilla personalizada.
- Filtrado por subconjunto de etiquetas en la extracción (`labels=[...]`).
- Procesamiento multilingüe en 12 lenguas índicas más inglés indio, en escritura nativa, romanizada y texto con mezcla de lenguas.
- Manejo de valores enmascarados: conserva la máscara completa (por ejemplo, `XXXX XXXX 4521` como AADHAAR o `**9813` como BANK_ACCOUNT).
- Distinción entre códigos personales y códigos no personales (pedidos, facturas, tickets, SKU, números de seguimiento, líneas de ayuda públicas), que no se etiquetan.
- Inferencia en CPU y GPU, con ruta alternativa mediante ONNX Runtime 1.23 o superior usando el operador fusionado `com.microsoft.MultiHeadAttention`.
- No dispone de generación de texto, razonamiento generativo, tool calling ni capacidades de agente: es un modelo puramente extractivo.

## Casos de uso

- Redacción previa al almacenamiento: interceptar documentos, correos o transcripciones antes de persistirlos en bases de datos y sustituir Aadhaar, PAN, teléfonos y direcciones por etiquetas, cumpliendo requisitos de minimización de datos.
- Saneamiento de datos antes de enviarlos a un LLM: eliminar PII de prompts y contextos en pipelines RAG o de atención al cliente, de modo que el proveedor del modelo generativo nunca reciba datos personales.
- Cumplimiento normativo en banca y seguros: detectar PAN, GSTIN, TAN, números de cuenta, IFSC y UPI en comunicaciones y formularios para auditar el tratamiento de datos según la normativa india de protección de datos.
- Procesamiento de historiales clínicos: identificar PATIENT_ID (MRN, UHID), nombres y fechas de nacimiento en registros hospitalarios multilingües antes de compartirlos con sistemas de analítica.
- Moderación y anonimización de conversaciones de soporte: limpiar transcripciones de llamadas y chats en hindi, tamil o bengalí, incluyendo OTP, MPIN y contraseñas marcados como SECRET, antes de usarlos para evaluación de calidad.
- Enmascaramiento en formularios escaneados: el modelo está evaluado sobre formularios con ruido de escaneo, lo que permite integrarlo en procesos de digitalización documental para redactar datos personales en la fase de OCR posterior.
- Detección de fugas de datos en registros: analizar logs de aplicaciones para localizar IP_ADDRESS, USERNAME, URL y credenciales filtradas, con la ventaja de procesar 8.192 tokens por pasada y latencias de decenas de milisegundos en CPU.

## Benchmarks y rendimiento

El autor publica resultados sobre Indic PII Bench (CobuildX, pendiente de publicación): 10.035 documentos sintéticos en 13 lenguas y tres estilos de escritura, cinco tipos de documento (chat y SMS, correos y cartas, formularios con ruido de escaneo, transcripciones de llamadas y prompts de chatbot), de los cuales 1.489 no contienen PII pero sí códigos que se le parecen. La evaluación se realiza sobre el split de test (8.028 documentos) con F1 tipado, contando un acierto cuando el valor predicho solapa con un valor anotado del mismo tipo, y restringida a los 14 tipos que todos los modelos de la tabla pueden nombrar. En la información proporcionada la tabla de resultados aparece truncada, por lo que no es posible reproducir las cifras.

| Modelo | Typed F1 | Precision | Recall | Documentos sin PII |
|---|---|---|---|---|
| cbx-indic-pii-extractor-58M | no disponible (tabla truncada en la información) | no disponible | no disponible | no disponible |
| Resto de modelos comparados | no disponible | no disponible | no disponible | no disponible |

Datos de latencia reportados por el autor: aproximadamente 37 ms para un mensaje corto y 250 ms para un documento de 2.000 caracteres en CPU con 8 hilos; aproximadamente 13 ms en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 57,6 millones de parámetros (unos 230 MB en fp32 y unos 115 MB en fp16); la VRAM real necesaria es mínima, inferior a 1 GB incluso con overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el autor reporta unos 13 ms por inferencia en GPU, sin especificar el modelo concreto empleado.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU integrada con soporte de CUDA, ROCm o similar.
- Despliegue en CPU: es la vía principal recomendada por el autor, con latencias de decenas de milisegundos usando 8 hilos; no requiere GPU.
- Opciones de despliegue: script `PIIExtractor` incluido en el repositorio (PyTorch/Transformers), ONNX Runtime 1.23 o superior con el operador `com.microsoft.MultiHeadAttention`, y cualquier runtime compatible con modelos de token classification de Hugging Face (por ejemplo, pipelines de Transformers). No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible de forma agregada; a partir de las latencias publicadas se puede estimar del orden de 4 documentos de 2.000 caracteres por segundo en CPU con 8 hilos, y alrededor de 75 por segundo en GPU, aunque estas cifras son una extrapolación y no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cbx-indic-pii-extractor-58M | 57,6M | 8.192 tokens | 12 índicas + inglés | Apache 2.0 | safetensors, ONNX |
| cbx-indic-pii-extractor-36M | no disponible | no disponible | 12 índicas + inglés | Apache 2.0 (presumible, misma familia) | no disponible |
| cbx-indic-pii-extractor-17M | no disponible | no disponible | 12 índicas + inglés | Apache 2.0 (presumible, misma familia) | no disponible |
| Modelo profesor interno (no publicado) | mayor que 36M | no disponible | 12 índicas + inglés | no disponible (no liberado) | no disponible |

No se dispone en la información proporcionada de comparaciones con modelos de PII de otros desarrolladores (por ejemplo, detectores centrados en inglés o modelos NER multilingües genéricos), por lo que la comparativa se limita a la propia familia del autor.

## Limitaciones y advertencias

- El modelo está entrenado sobre datos sintéticos; su comportamiento sobre distribuciones reales de PII puede diferir, y el propio banco de evaluación es también sintético, aunque generado de forma independiente.
- No se han publicado métricas de sesgo; al tratarse de un extractor de entidades, el riesgo principal es de falsos negativos y falsos positivos en nombres y formatos poco frecuentes, no de generación de contenido sesgado.
- Riesgo de alucinación en sentido estricto inexistente (no genera texto), pero sí de etiquetados erróneos: puede marcar como PII códigos que se le parecen o dejar sin marcar identificadores con formatos nuevos.
- Limitación de contexto: los textos de más de 8.192 tokens se dividen automáticamente, lo que puede romper entidades que crucen la frontera entre fragmentos.
- Cobertura lingüística limitada a las 13 lenguas declaradas; otras lenguas índicas o variedades no están soportadas explícitamente.
- Es imprescindible usar el tokenizador del repositorio (vocabulario de 40.000 tokens) y no el de mmBERT; usar el tokenizador original produce resultados incorrectos.
- La ruta ONNX depende del operador fusionado `com.microsoft.MultiHeadAttention`, por lo que otros runtimes ONNX pueden no cargar el modelo.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías; no se han declarado restricciones adicionales.
- Para producción, conviene validar con datos propios del dominio (por ejemplo, formularios o transcripciones reales) antes de confiar en la redacción automática, dado que un falso negativo implica exposición de datos personales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-58M
- Variante de 36M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-36M
- Variante de 17M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-17M
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
