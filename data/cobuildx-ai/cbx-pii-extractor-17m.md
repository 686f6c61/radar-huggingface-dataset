# CobuildX-AI/cbx-pii-extractor-17M

## Resumen

cbx-pii-extractor-17M es un modelo de clasificación de tokens (token classification) desarrollado por CobuildX-AI para detectar información personal identificable (PII) en texto en inglés. A partir de un encoder ModernBERT (base jhu-clsp/ettin-encoder-17m), el modelo identifica 18 tipos de datos personales —nombres, correos, teléfonos, direcciones, números de cuentas bancarias, documentos de identidad, contraseñas, direcciones IP, entre otros— y devuelve la posición exacta de cada valor en el texto, lo que permite tanto la extracción como la redacción automática (anonimización).

Con solo 16,8 millones de parámetros, está diseñado para despliegues de alto rendimiento y bajo coste: procesa unos 1.000 tokens en 6 ms en GPU y 37 ms en CPU, lo que lo convierte en la opción más rápida de la familia y la recomendada para ejecución en CPU. Es especialmente relevante para flujos de cumplimiento normativo (RGPD, HIPAA), anonimización de logs de chat y limpieza de documentos empresariales antes de enviar datos a LLMs de terceros.

La versión actual, v0.2, amplía de 12 a 18 etiquetas, mejora la detección en chats y documentos de negocio (nombres en minúsculas, menciones de Slack, códigos de verificación, IDs de empleados en tablas) y mantiene la latencia de la versión anterior. Existen variantes de 32M y 68M parámetros con mayor precisión a cambio de más latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder), fine-tune de jhu-clsp/ettin-encoder-17m |
| Parametros totales | 16.806.949 |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 7.999 tokens en una sola pasada; textos más largos se dividen automáticamente |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de jhu-clsp/ettin-encoder-17m, un encoder de la familia Ettin basado en arquitectura ModernBERT. Esta arquitectura emplea transformadores de encoder optimizados (con mejoras como atención eficiente y normalización modernizada), lo que explica las latencias muy bajas: al ser un modelo de token classification y no generativo, procesa el texto en una única pasada sin decodificación autorregresiva.

Los datos de entrenamiento concretos (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información publicada. La model card indica que se evaluó sobre tres benchmarks públicos sin solapamiento con el entrenamiento (ningún texto de entrenamiento comparte una secuencia de 13 palabras con los benchmarks) y que se usó parte de cada benchmark para ajuste ("studi…" — el texto se corta, pero sugiere uso de datos de los benchmarks para validación o ajuste fino). No se han publicado detalles adicionales del proceso de entrenamiento.

## Capacidades

- Detección de PII con 18 etiquetas: PERSON, DATE_OF_BIRTH, EMAIL, PHONE, ADDRESS, BANK_ACCOUNT, PAYMENT_CARD, CUSTOMER_ID, NATIONAL_ID, PASSPORT, TAX_ID, DRIVERS_LICENSE, USERNAME, URL, IP_ADDRESS, SECRET, EMPLOYEE_ID y PATIENT_ID.
- Extracción con posiciones exactas: devuelve el texto detectado junto con los índices de inicio y fin (start/end) en caracteres, con coincidencia exacta de span.
- Redacción automática: método `redact()` que sustituye cada valor detectado por su etiqueta (por ejemplo, `[EMAIL]`) o por una plantilla personalizada.
- Filtrado por etiquetas: se puede restringir la extracción a un subconjunto de tipos (`pii.extract(text, labels=["PERSON", "EMAIL"])`).
- Manejo de casos difíciles en chats y documentos de negocio: nombres solo de pila, nombres en minúsculas, menciones de Slack (`<@U02NORA>`), códigos de verificación, referencias de póliza/miembro/cuenta e IDs de empleados en tablas.
- Procesado de textos largos: ventana de 7.999 tokens con división automática de textos más largos.
- Detección de secretos: contraseñas, PINs, códigos de acceso y API keys/tokens.
- No etiqueta fechas que no sean fechas de nacimiento (decisión de diseño deliberada).

## Casos de uso

- Anonimización de logs de chat de soporte: con 83,1% de F1 en Privacy-Bench messages y detección de menciones de Slack y usernames, es adecuado para redactar conversaciones de atención al cliente antes de almacenarlas o analizarlas.
- Cumplimiento RGPD/HIPAA en documentos empresariales: procesa documentos Word/PDF (benchmark Privacy-Bench docs con 656 páginas anotadas) para localizar y redactar datos personales antes de compartir o archivar.
- Limpieza de datos antes de enviarlos a LLMs externos: dada su latencia de 6 ms por 1.000 tokens, puede actuar como filtro en tiempo real en pipelines que envían texto de usuarios a APIs de terceros.
- Despliegue en CPU en entornos on-premise: a 37 ms por 1.000 tokens en CPU, permite anonimización local sin GPU, útil en sectores con requisitos de soberanía de datos.
- Sanitización de bases de datos de tickets: detección de CUSTOMER_ID, BANK_ACCOUNT, PAYMENT_CARD y otros identificadores para cumplir políticas de retención de datos.
- Protección de secretos en repositorios y comunicaciones internas: la etiqueta SECRET cubre contraseñas, PINs, API keys y tokens, permitiendo alertar o redactar credenciales filtradas en texto.
- Preparación de datasets para entrenamiento de modelos: redacción de PII en corpus de texto para crear datasets conformes para fine-tuning de otros modelos.
- Procesamiento de historiales médicos: detección de PATIENT_ID y números de historial médico, relevante para flujos clínicos regulados.

## Benchmarks y rendimiento

F1 de coincidencia exacta de span (inicio, fin y etiqueta correctos) en tres benchmarks públicos no usados en entrenamiento:

| Modelo | Tamaño | Privacy-Bench docs | Privacy-Bench messages | PII-TRACE | GPU, 1.000 tokens |
|---|---|---|---|---|---|
| cbx-pii-extractor-68M | 68M | 88,1% | 91,7% | 93,2% | 13 ms |
| cbx-pii-extractor-32M | 32M | 88,0% | 87,0% | 93,5% | 8 ms |
| **cbx-pii-extractor-17M** | 17M | **86,1%** | **83,1%** | **91,6%** | 6 ms |
| PII-Tracer | 596M | 86,9% | 82,0% | 92,5% | 160 ms |
| GLiNER2-PII | 205M | 80,8% | 86,9% | 66,2% | 91 ms |
| Presidio (spaCy lg) | – | 82,4% | 85,8% | 64,7% | 85 ms (CPU) |

Datos adicionales:

- Privacy-Bench docs: 656 páginas de documentos de negocio Word/PDF, 8.700 valores anotados.
- Privacy-Bench messages: 5.198 mensajes de chat, 6.594 valores anotados.
- PII-TRACE: 500 conversaciones multi-turno (subconjunto público), 2.442 valores anotados; es el benchmark propio de PII-Tracer. Sin fechas distintas de fechas de nacimiento (que el modelo no etiqueta deliberadamente), este modelo alcanza 96,0% frente a 91,9% de PII-Tracer.
- Tasa de falsos positivos: 0,08 valores falsos por 1.000 caracteres en texto sin PII, frente a 1,6–3,6 de los modelos comparados.
- Todos los modelos se evaluaron con las mismas ejecuciones y el mismo scoring por parte de CobuildX-AI.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,1 GB; con 16,8M de parámetros en fp32/bf16, la carga del modelo requiere menos de 100 MB de VRAM. No se publican cifras oficiales de VRAM en inferencia.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere GPU dedicada para uso productivo. No hay requisitos publicados de modelos concretos (A100, H100, etc.).
- Consumer GPUs: funciona sin problemas en cualquier GPU de consumo; el rendimiento publicado (6 ms por 1.000 tokens en GPU) es alcanzable en hardware modesto.
- CPU: plenamente viable, a 37 ms por 1.000 tokens; es el tamaño recomendado por el autor para CPU.
- Despliegue: el repo incluye `pii.py` con la clase `PIIExtractor`, `requirements.txt` y `example.py`. La instalación se realiza descargando el repo con `hf download` e instalando dependencias con pip. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (al ser un encoder de token classification, el flujo natural es la librería incluida o transformers).
- Latencia: 6 ms por 1.000 tokens en GPU y 37 ms por 1.000 tokens en CPU (datos del autor). Throughput exacto no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (docs / messages / PII-TRACE) | Latencia (1.000 tokens) | Licencia |
|---|---|---|---|---|---|
| cbx-pii-extractor-17M | 16,8M | 7.999 tokens | 86,1% / 83,1% / 91,6% | 6 ms (GPU) | Apache 2.0 |
| cbx-pii-extractor-32M | 32M | no disponible | 88,0% / 87,0% / 93,5% | 8 ms (GPU) | no disponible |
| cbx-pii-extractor-68M | 68M | no disponible | 88,1% / 91,7% / 93,2% | 13 ms (GPU) | no disponible |
| PII-Tracer | 596M | no disponible | 86,9% / 82,0% / 92,5% | 160 ms (GPU) | no disponible |
| GLiNER2-PII | 205M | no disponible | 80,8% / 86,9% / 66,2% | 91 ms (GPU) | no disponible |
| Presidio (spaCy lg) | – | – | 82,4% / 85,8% / 64,7% | 85 ms (CPU) | no disponible |

La versión de 17M ofrece el mejor equilibrio velocidad/precisión de la familia: supera a PII-Tracer (35 veces más grande) en dos de los tres benchmarks, con latencia 27 veces menor, y destaca claramente en tasa de falsos positivos.

## Limitaciones y advertencias

- Solo inglés: el modelo no está entrenado para otros idiomas, incluido el castellano; no es adecuado para detectar PII en texto en español sin evaluación previa.
- No etiqueta fechas genéricas: solo detecta fechas de nacimiento; otras fechas quedan sin marcar por diseño, lo que puede ser insuficiente para ciertas políticas de privacidad.
- Errores residuales: con 86,1% de F1 en documentos, roughly 1 de cada 7 spans puede fallar (por inicio, fin o etiqueta); para cumplimiento normativo estricto se recomienda revisión humana o combinar con reglas.
- Direcciones parciales: una ciudad o país aislados no se etiquetan como ADDRESS, solo direcciones completas con unidad, ciudad y código postal.
- Números de ticket y pedido no se etiquetan como CUSTOMER_ID.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Alucinación: al ser un modelo de clasificación de tokens, no genera texto libre; el riesgo relevante son falsos positivos (0,08 por 1.000 caracteres) y falsos negativos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Versionado: los nombres de etiquetas cambiaron entre v0.1 y v0.2; se recomienda fijar la revisión (`--revision v0.2`) o mapear las etiquetas antiguas al actualizar.
- Métricas reportadas por el propio autor: los benchmarks se ejecutaron por CobuildX-AI con su propio scoring; no hay verificación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-17M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Variante 32M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-32M
- Variante 68M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-68M
- Paper referenciado (arXiv 2507.11412, base Ettin): https://arxiv.org/abs/2507.11412
