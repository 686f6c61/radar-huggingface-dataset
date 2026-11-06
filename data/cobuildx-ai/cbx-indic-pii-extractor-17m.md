# CobuildX-AI/cbx-indic-pii-extractor-17M

## Resumen

cbx-indic-pii-extractor-17M es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en lenguas índicas. Lo desarrolla CobuildX-AI y se distribuye bajo licencia Apache 2.0. Resuelve un problema concreto: localizar y etiquetar datos sensibles (Aadhaar, PAN, UPI, IFSC, teléfonos, direcciones, secretos como OTP o contraseñas) en 12 lenguas índicas más inglés indio, tanto en escritura nativa como romanizada y en texto con mezcla de idiomas (code-mixing).

El modelo parte de jhu-clsp/mmBERT-small y se ha reducido a 16.696.887 parámetros (17M) conservando 6 de las 22 capas del modelo base de 58M y su vocabulario de 40.000 tokens. Es la variante más pequeña y rápida de una familia que también incluye versiones de 36M y 58M. Su ventana de contexto es de 8.192 tokens en una sola pasada, con división automática para textos más largos.

Su relevancia práctica está en el coste de inferencia: aproximadamente 11 ms para un mensaje corto y 72 ms para un documento de 2.000 caracteres en CPU con 8 hilos, y unos 5 ms en GPU. Esto lo hace apto para redacción de PII en tiempo real en pipelines de atención al cliente, procesamiento de formularios o cumplimiento normativo en entornos con presupuesto de memoria o cómputo muy ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, derivado de jhu-clsp/mmBERT-small) |
| Parametros totales | 16.696.887 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (12 lenguas índicas más inglés indio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, destilado de la variante cbx-indic-pii-extractor-58M. Conserva 6 de las 22 capas del modelo de 58M (capas 0, 4, 8, 12, 16 y 20) y su vocabulario de 40.000 tokens. Una particularidad técnica relevante es la compresión de la tabla de embeddings: cada token se almacena como 128 números y se expande a 384 mediante una matriz compartida. Esto implica que la carga con `AutoModel` estándar no funciona; es necesario usar la clase `PIIExtractor` incluida en `pii.py` dentro del repositorio.

El entrenamiento se realizó sobre los mismos datos que el modelo de 58M, combinando aprendizaje supervisado a partir de las etiquetas y destilación de conocimiento desde un modelo interno de mayor tamaño (el profesor no se ha publicado). El modelo base es jhu-clsp/mmBERT-small, un encoder multilingüe orientado a lenguas índicas. No se documenta el número exacto de tokens de entrenamiento ni la composición detallada del dataset en la información disponible. La tarea es de etiquetado de tokens con 27 etiquetas posibles, incluyendo categorías específicas del contexto indio (Aadhaar, PAN, UPI_ID, IFSC, VOTER_ID, RATION_CARD, VEHICLE_REG, TAX_ID con GSTIN y TAN).

## Capacidades

- Detección y clasificación de PII con 27 etiquetas: PERSON, PHONE, EMAIL, ADDRESS, DATE_OF_BIRTH, DATE, AMOUNT, BANK_ACCOUNT, IFSC, UPI_ID, PAYMENT_CARD, AADHAAR, PAN, VOTER_ID, RATION_CARD, PASSPORT, DRIVERS_LICENSE, VEHICLE_REG, NATIONAL_ID, TAX_ID, CUSTOMER_ID, EMPLOYEE_ID, PATIENT_ID, SECRET, USERNAME, URL, IP_ADDRESS.
- Extracción con posiciones exactas de inicio y fin de cada entidad detectada.
- Redacción automática: sustituye cada valor por su etiqueta o por una plantilla personalizada.
- Soporte de 12 lenguas índicas en escritura nativa, romanizada y texto code-mixed, más inglés indio.
- Manejo de valores enmascarados: mantiene la máscara y devuelve el valor completo (`XXXX XXXX 4521` como AADHAAR, `**9813` como BANK_ACCOUNT).
- Filtrado por etiquetas: permite restringir la extracción a un subconjunto de tipos (`labels=["PERSON", "AADHAAR"]`).
- Procesamiento de textos largos con división automática más allá de 8.192 tokens.
- Inferencia en CPU y GPU; ejecución alternativa con ONNX Runtime 1.23 o superior mediante el operador fusionado `com.microsoft.MultiHeadAttention`.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso. Su función es exclusivamente extractiva.

## Casos de uso

- Redacción de PII en atención al cliente: el modelo identifica y sustituye nombres, teléfonos, correos y números de cuenta en transcripciones de chat y SMS antes de almacenarlas o enviarlas a sistemas externos, con latencia de milisegundos por mensaje.
- Cumplimiento normativo en procesamiento de formularios: detección de Aadhaar, PAN, voter ID y números de cuenta en documentos escaneados con ruido, usando las etiquetas específicas del contexto regulatorio indio.
- Anonimización de transcripciones de call centers: con 8.192 tokens de contexto procesa conversaciones completas en una sola pasada, incluyendo texto code-mixed hindi-inglés habitual en soporte telefónico.
- Protección de secretos en logs y prompts: la etiqueta SECRET captura OTP, MPIN, contraseñas y CVV, lo que permite filtrar estos valores antes de registrar prompts de chatbot o trazas de aplicación.
- Enmascaramiento en pipelines de datos de salud: las etiquetas PATIENT_ID (MRN, UHID) y PERSON permiten anonimizar registros hospitalarios antes de usarlos en analítica o entrenamiento de modelos.
- Despliegue en entornos con recursos limitados: con 17M de parámetros y unos 72 ms por documento de 2.000 caracteres en CPU de 8 hilos, puede ejecutarse en el mismo servidor de aplicación sin GPU dedicada.
- Preprocesamiento para modelos generativos: actuar como filtro previo que redacta PII antes de enviar texto a un LLM de mayor tamaño, reduciendo el riesgo de fuga de datos en la cadena de inferencia.
- Procesamiento batch de correos y cartas: la etiqueta ADDRESS captura direcciones postales con PIN code, útil para depurar bases de datos de correspondencia.

## Benchmarks y rendimiento

La model card referencia la evaluación en Indic PII Bench (CobuildX, pendiente de publicación): 10.035 documentos sintéticos en 13 lenguas y tres estilos de escritura, cinco tipos de documento (chat y SMS, correos y cartas, formularios con ruido de escaneo, transcripciones de llamadas, prompts de chatbot), de los cuales 1.489 no contienen PII pero sí códigos que se le parecen. La métrica es Typed F1 (una predicción cuenta si solapa con un valor anotado del mismo tipo), evaluada sobre las 14 etiquetas que todos los modelos de la tabla pueden nombrar, en el split de test de 8.028 documentos.

Los resultados numéricos de la tabla comparativa no están completos en la información proporcionada (el contenido se corta en la columna "Documents without PII flagged" y el valor de Typed F1). No se han publicado en la información disponible los valores concretos de Typed F1, Precision y Recall de este modelo ni de sus comparados.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,7M de parámetros en safetensors el peso ronda decenas de megabytes (el repositorio completo ocupa 0,1 GB). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con suficiente memoria para el grafo de inferencia; el modelo está pensado para CPU y GPU indistintamente. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU consumer: sí, con amplio margen, dado su tamaño.
- Opciones de despliegue: script propio `pii.py` con `PIIExtractor` (PyTorch, usa GPU si está disponible), ONNX Runtime 1.23 o superior con `onnx/model.onnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a modelos generativos, no a token-classification de este tipo).
- Latencia y throughput: aproximadamente 11 ms para un mensaje corto y 72 ms para un documento de 2.000 caracteres en CPU con 8 hilos; aproximadamente 5 ms en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-indic-pii-extractor-17M | 16,7M | 8.192 tokens | 12 índicas + en | Apache 2.0 | Hugging Face |
| cbx-indic-pii-extractor-36M | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| cbx-indic-pii-extractor-58M | no disponible (22 capas) | no disponible | no disponible | no disponible | Hugging Face |
| Modelo interno (profesor) | no disponible | no disponible | no disponible | no liberado | No disponible |

Las variantes 36M y 58M de la misma familia son las alternativas naturales: la de 58M es el modelo del que se destila esta versión y conserva 22 capas frente a las 6 de la variante de 17M. No se dispone en la información proporcionada de datos de rendimiento comparado entre las tres variantes ni de modelos de terceros comparables en la misma categoría (detección de PII en lenguas índicas).

## Limitaciones y advertencias

- Es un modelo extractivo de token-classification, no generativo: no razona, no responde preguntas ni ejecuta herramientas.
- La carga estándar con `AutoModel` no funciona debido a la tabla de embeddings comprimida; es obligatorio usar `PIIExtractor` de `pii.py`. Esto complica la integración con frameworks que esperan transformers estándar.
- El modelo ONNX usa el operador fusionado `com.microsoft.MultiHeadAttention`, por lo que otros runtimes ONNX pueden no cargarlo.
- Los resultados de benchmarks están incompletos en la información disponible; no es posible verificar el rendimiento real frente a alternativas.
- El modelo profesor y los datos de entrenamiento no se han publicado, lo que limita la reproducibilidad y el análisis de sesgos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección: códigos que se parecen a PII (números de pedido, factura, ticket) están excluidos por diseño, pero pueden confundirse con identificadores personales.
- Cobertura limitada a las 13 lenguas listadas; el rendimiento en otras lenguas o en variantes dialectales no documentadas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de sesgo por género, casta, religión o región, relevantes en el contexto índico.
- El modelo se entrenó con datos sintéticos (Indic PII Bench es sintético); el comportamiento en texto real de producción puede diferir.

## Enlaces

- Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-17M
- Variante 36M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-36M
- Variante 58M: https://huggingface.co/CobuildX-AI/cbx-indic-pii-extractor-58M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
