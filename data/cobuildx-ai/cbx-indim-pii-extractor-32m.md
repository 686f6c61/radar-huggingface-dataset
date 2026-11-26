# CobuildX-AI/cbx-indim-pii-extractor-32M

## Resumen

cbx-indim-pii-extractor-32M es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en textos en lenguas índicas y en inglés indio. Lo desarrolla CobuildX-AI como un ajuste fino de su modelo base InDIM-small (32M parámetros), una arquitectura ModernBERT orientada a tareas de etiquetado secuencial. El modelo devuelve la posición exacta (offsets de inicio y fin) de cada valor sensible junto con una de 27 etiquetas posibles, entre las que se incluyen identificadores específicos del contexto indio como Aadhaar, PAN, UPI ID, IFSC, VOTER_ID, RATION_CARD o VEHICLE_REG.

Su relevancia radica en la cobertura multilingüe: procesa 12 lenguas índicas (hindi, bengalí, maratí, tamil, telugu, cananeo, malabar, guyaratí, panyabí, oriya, asamés y urdu) además de inglés indio, tanto en escritura nativa como romanizada y en texto con mezcla de códigos (code-mixed). Con solo 31,5 millones de parámetros, ofrece latencias del orden de 9 ms para un mensaje corto y 50 ms para un documento de 600 tokens en CPU con 8 hilos, lo que lo hace apto para despliegues de redacción de datos sensibles en tiempo real y en entornos sin GPU.

El modelo se distribuye con pesos en safetensors y una exportación ONNX, licencia Apache 2.0, y una librería Python de acompañamiento (`pii.py`) que implementa extracción, redacción por etiqueta y umbrales de confianza por clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), ajustada para token classification |
| Parametros totales | 31.512.631 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en una pasada (preentrenado con 512; textos mayores se dividen automáticamente) |
| Tipos de cuantizacion | no disponible (se distribuye safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hi, bn, mr, ta, te, kn, ml, gu, pa, or, as, ur, en (escritura nativa, romanizada y code-mixed) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de InDIM-small (32M), un encoder ModernBERT adaptado al dominio índico, y se ajusta fino para etiquetado de secuencias con 27 clases de PII. La tarea es de token classification con alineación BIO implícita en la salida de spans; la librería `pii.py` convierte las predicciones en spans con offsets de carácter exactos. El modelo fue preentrenado con entradas de 512 tokens, aunque las pruebas del autor indican que no hay pérdida de calidad en secuencias más largas hasta 8.192 tokens, momento en el que el texto se fragmenta automáticamente.

El ajuste fino se realizó sobre datos de entrenamiento sintéticos con una receta común (fine-tuning simple, learning rate seleccionado por validación) y umbrales de confianza por etiqueta ajustados sobre el split de desarrollo de IndicPIIDetX. El repositorio contiene la ejecución de entrenamiento con mejor puntuación de validación. Se documenta una media de 3 ejecuciones de entrenamiento para las métricas comparativas (salvo mmBERT-base, con 1 ejecución). No se detalla en la información disponible la composición exacta del dataset sintético, el número de tokens de entrenamiento ni si hubo RLHF/DPO (no aplicable en un modelo de etiquetado).

## Capacidades

- Detección de PII con 27 etiquetas: PERSON, PHONE, EMAIL, ADDRESS, DATE_OF_BIRTH, DATE, AMOUNT, BANK_ACCOUNT, IFSC, UPI_ID, PAYMENT_CARD, AADHAAR, PAN, VOTER_ID, RATION_CARD, PASSPORT, DRIVERS_LICENSE, VEHICLE_REG, NATIONAL_ID (ABHA, APAAR), TAX_ID (GSTIN, TAN), CUSTOMER_ID, EMPLOYEE_ID (PF UAN, ESIC), PATIENT_ID (MRN, UHID), SECRET (OTP, MPIN, contraseñas, CVV), USERNAME, URL e IP_ADDRESS.
- Devolución de offsets exactos de carácter (inicio y fin) para cada span, lo que facilita la redacción selectiva sin reescritura del texto.
- Redacción automática: `pii.redact()` sustituye cada valor por `[LABEL]`.
- Filtrado por etiquetas: `pii.extract(text, labels=[...])` permite limitar la salida a un subconjunto de clases.
- Umbrales de confianza por etiqueta configurables (`min_confidence` en `pii_config.json`, 16 etiquetas con umbral ajustado) para equilibrar precisión y recall.
- Manejo de valores enmascarados: `XXXX XXXX 4521` se devuelve completo como AADHAAR; `XXXX XXXX XXXX 1234` como PAYMENT_CARD.
- Multilingüe en 12 lenguas índicas más inglés indio, incluyendo texto romanizado y code-mixed.
- No etiqueta códigos no personales (pedidos, facturas, tickets, SKU, lotes, seguimiento, reservas, líneas de ayuda públicas), lo que reduce falsos positivos en documentos comerciales.
- Inferencia en CPU y GPU; exportación ONNX con atención fusionada (ONNX Runtime 1.23 o superior) que produce los mismos spans que PyTorch (verificado en 300 documentos).

## Casos de uso

- Redacción de PII en pipelines de atención al cliente: el modelo detecta nombres, teléfonos, correos, Aadhaar, PAN y UPI ID en transcripciones multi-turno en hindi, tamil o bengalí antes de almacenarlas o enviarlas a un LLM, con latencias de 9-50 ms por mensaje en CPU.
- Cumplimiento normativo en banca y finanzas: extracción y enmascarado de BANK_ACCOUNT, IFSC, UPI_ID, PAYMENT_CARD y TAX_ID (GSTIN, TAN) en documentos de incorporación de clientes (KYC) y extractos, manteniendo intactos los identificadores no personales.
- Anonimización de historiales clínicos: detección de PATIENT_ID (MRN, UHID), PERSON, DATE_OF_BIRTH y ADDRESS en registros hospitalarios multilingües antes de compartirlos con equipos de investigación.
- Preprocesado de datasets para entrenamiento de LLM: filtrado y redacción de PII en corpus índicos scrapeados, con la posibilidad de conservar solo las etiquetas relevantes (`labels=["AADHAAR", "PAN", "PHONE"]`) para reducir el ruido.
- Protección de datos en logs y telemetría: detección de SECRET (OTP, MPIN, contraseñas, CVV), IP_ADDRESS, URL y USERNAME en registros de aplicaciones antes de su envío a sistemas de observabilidad.
- Verificación de documentos de identidad en procesos de onboarding: identificación de VOTER_ID, PASSPORT, DRIVERS_LICENSE, RATION_CARD y VEHICLE_REG en formularios y PDFs escaneados con OCR, en escritura nativa o romanizada.
- Moderación y saneado de contenidos generados por usuarios en foros y marketplaces: eliminación de teléfonos, correos y direcciones publicadas en texto code-mixed (hindi-inglés, tamil-inglés) para evitar doxxing.
- Despliegue en el borde (edge) o en contenedores sin GPU: con 32M parámetros y exportación ONNX, cabe en entornos con CPU limitada para redacción en tiempo real en pasarelas de API.

## Benchmarks y rendimiento

Las métricas proceden de la model card del autor. F1 tipado: un span predicho cuenta si solapa con un valor real de un tipo aceptado. Todos los modelos se ajustaron con los mismos datos sintéticos y receta, y se les aplicaron umbrales de confianza ajustados sobre el split de desarrollo de IndicPIIDetX. Media de 3 ejecuciones salvo mmBERT-base (1 ejecución).

| Modelo | Parametros | IndicPIIDetX test, 27 etiquetas | IndicPIIDetX, 14 tipos compartidos | Documentos sin PII marcados (↓) | Ylemis India-PII | IndiaPII-Bench | Senuelos IndiaPII detectados (↓) |
|---|---|---|---|---|---|---|---|
| **InDIM-small (base de este modelo)** | **32M** | 0.910 | 0.951 | 39,0% | 0.986 | **0.960** | 20,0% |
| mmBERT-small | 140M | 0.897 | 0.931 | 35,0% | 0.985 | 0.949 | 16,2% |
| mmBERT-base | 307M | **0.916** | **0.958** | **33,4%** | 0.984 | 0.951 | **11,8%** |
| IndicBERT v2 | 278M | 0.904 | 0.952 | 48,0% | **0.987** | 0.951 | 13,0% |

Este repositorio concreto contiene la ejecución con mejor validación: IndicPIIDetX 0,910 (27 etiquetas) / 0,951 (14 tipos), documentos sin PII marcados 38,6%, Ylemis 0,984, IndiaPII-Bench 0,957, senuelos detectados 23,5%.

Conjuntos de evaluación: IndicPIIDetX (DOI 10.57967/hf/11457, split de test, 8.028 documentos escritos independientemente de los datos de entrenamiento), Ylemis India-PII (CC0) e IndiaPII-Bench (CC BY 4.0, incluye senuelos con forma de identificador que no son PII).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los 31,5M de parámetros (unos 126 MB de pesos) más activaciones; en fp16, unos 63 MB de pesos. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 2 GB (GTX 1650, RTX 3050, RTX 4090, A100, H100) acelera la inferencia, pero el modelo está optimizado para CPU.
- CPU: 9 ms para un mensaje corto y 50 ms para un documento de 600 tokens con 8 hilos (según el autor).
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch (script `pii.py` incluido), ONNX Runtime 1.23 o superior con atención fusionada (`onnx_example.py`), y cualquier servidor que cargue safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de clasificación de tokens).
- Latencia y throughput: 9 ms/mensaje corto y 50 ms/documento de 600 tokens en CPU de 8 hilos; el throughput escala con el número de hilos y con el uso de GPU, aunque no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IndicPIIDetX (27 etiq.) | IndiaPII-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cbx-indim-pii-extractor-32M | 32M | 8.192 tokens | 0,910 | 0,960 | Apache 2.0 | Hugging Face (safetensors + ONNX) |
| mmBERT-small | 140M | no disponible | 0,897 | 0,949 | no disponible | Hugging Face |
| mmBERT-base | 307M | no disponible | 0,916 | 0,951 | no disponible | Hugging Face |
| IndicBERT v2 | 278M | no disponible | 0,904 | 0,951 | no disponible | Hugging Face |

El modelo de 32M iguala o supera a mmBERT-small (140M) e IndicBERT v2 (278M) en IndicPIIDetX e IndiaPII-Bench, y se acerca a mmBERT-base (307M) con un décimo de sus parámetros. Su punto débil relativo es la tasa de documentos sin PII marcados erróneamente (39,0% frente a 33,4% de mmBERT-base) y la detección de senuelos (20,0% frente a 11,8%), es decir, tiende a producir más falsos positivos en documentos limpios o con identificadores señuelo.

## Limitaciones y advertencias

- Mayor tasa de falsos positivos que modelos más grandes: marca como PII el 39,0% de los documentos que no contienen PII y detecta el 20,0% de los senuelos de IndiaPII-Bench, frente al 33,4% y 11,8% de mmBERT-base. En dominios con muchos códigos con forma de identificador conviene ajustar los umbrales de confianza.
- El modelo se entrenó con datos sintéticos; aunque se evalúa en conjuntos independientes (IndicPIIDetX, Ylemis, IndiaPII-Bench), puede degradarse en dominios, formatos o jergas no representados.
- Cobertura lingüística limitada a 12 lenguas índicas y al inglés indio; no se documenta soporte para otras lenguas (por ejemplo, español, árabe o chino) ni para variedades dialectales no incluidas.
- Contexto de preentrenamiento de 512 tokens: aunque el autor afirma que no hay pérdida hasta 8.192 tokens, no se publican métricas específicas por longitud, por lo que en documentos muy largos conviene validar el comportamiento.
- Riesgo de alucinación no aplicable en sentido estricto (es un modelo de etiquetado, no generativo), pero sí de spans espurios o mal delimitados en texto ruidoso, con OCR deficiente o con escritura mixta no vista.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; aun así, para el tratamiento de datos personales reales es responsabilidad del integrador cumplir con la normativa aplicable (RGPD, DPDP Act india) y validar la tasa de falsos negativos en su dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un modelo reciente con poca validación externa independiente.
- No se documentan sesgos específicos por género, casta, religión o región; dado el dominio (nombres y direcciones índicas), es recomendable auditar el rendimiento por subgrupos antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-indim-pii-extractor-32M
- Modelo base InDIM-small: https://huggingface.co/CobuildX-AI/InDIM-small
- Dataset IndicPIIDetX (DOI 10.57967/hf/11457): https://huggingface.co/datasets/CobuildX-AI/IndicPIIDetX
- Dataset Ylemis India-PII (CC0): https://huggingface.co/datasets/Pranshurs/ylemis-india-pii-benchmark
- Dataset IndiaPII-Bench (CC BY 4.0): https://huggingface.co/datasets/maskflow-ai/indiapii-bench
