# CobuildX-AI/cbx-pii-extractor-68M

## Resumen

cbx-pii-extractor-68M es un modelo de extraccion de informacion personal (PII) desarrollado por CobuildX-AI. Se trata de un afinado (fine-tune) de jhu-clsp/ettin-encoder-68m, un encoder basado en la arquitectura ModernBERT, especializado en clasificacion de tokens para detectar y localizar datos personales en texto en ingles. El modelo devuelve la posicion exacta (inicio y fin) de cada valor detectado junto con una de 18 etiquetas tipadas: nombres, correos electronicos, telefonos, direcciones, numeros de cuenta, identificadores gubernamentales, secretos, direcciones IP, entre otras.

Su relevancia radica en que resuelve un problema practico muy demandado en produccion: anonimizacion y redaccion de PII en documentos de negocio y conversaciones de chat, con un modelo muy pequeno (68 millones de parametros) que procesa aproximadamente 1.000 tokens en 13 ms en GPU y 229 ms en CPU. Segun los benchmarks publicados por el autor, supera a alternativas mucho mayores como PII-Tracer (596M) y GLiNER2-PII (205M) en F1 exacto de spans, y presenta una tasa de falsos positivos muy baja (0,06 valores falsos por cada 1.000 caracteres en texto sin PII).

La version actual es v0.2, que amplia de 12 a 18 etiquetas y mejora la deteccion en chat y documentos de empresa (nombres en minusculas, menciones de Slack, codigos de verificacion, referencias de poliza y cuentas). Esta disponible tambien en tamanos 32M y 17M dentro de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder), basado en jhu-clsp/ettin-encoder-68m |
| Parametros totales | 68.163.621 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 7.999 tokens en una sola pasada; textos mas largos se dividen automaticamente |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ettin-encoder-68m, un encoder de la familia Ettin desarrollada por jhu-clsp y basada en ModernBERT, una arquitectura transformer de solo encoder con mecanismos de atencion eficientes y soporte de contexto largo. La tarea de salida es token classification (etiquetado por token estilo NER), de la que se derivan spans exactos con etiqueta. No se ha publicado detalle sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque la model card indica que los benchmarks de evaluacion no comparten ninguna secuencia de 13 palabras con los datos de entrenamiento, lo que sugiere un cuidado control de fuga de datos. Tampoco se menciona el uso de RLHF ni DPO, algo esperable dado que se trata de un modelo discriminativo de clasificacion y no generativo.

La version v0.2 introduce 18 etiquetas (frente a 12 de v0.1), separando tipos concretos de identificadores (numero de cuenta bancaria, tarjeta de pago, ID de cliente, DNI/seguridad social, pasaporte, identificador fiscal, permiso de conduccion, ID de empleado e ID de paciente) y mejora la deteccion de nombres en minusculas o solo de pila, menciones de Slack del tipo `<@U02NORA>`, codigos de verificacion y referencias de poliza, miembro y cuenta.

## Capacidades

- Deteccion de PII en texto en ingles con 18 etiquetas tipadas: PERSON, DATE_OF_BIRTH, EMAIL, PHONE, ADDRESS, BANK_ACCOUNT, PAYMENT_CARD, CUSTOMER_ID, NATIONAL_ID, PASSPORT, TAX_ID, DRIVERS_LICENSE, USERNAME, URL, IP_ADDRESS, SECRET, EMPLOYEE_ID y PATIENT_ID.
- Localizacion exacta de spans: devuelve texto, posicion inicial y final de cada valor detectado (coincidencia exacta de inicio, fin y etiqueta).
- Redaccion automatica: metodo `redact()` que sustituye cada valor por su etiqueta (`[PERSON]`, `[EMAIL]`) o por una plantilla personalizada.
- Filtrado por etiquetas: se puede restringir la extraccion a un subconjunto de labels (por ejemplo, solo `PERSON` y `EMAIL`).
- Manejo de textos largos: contexto de 7.999 tokens en una sola pasada, con division automatica de textos mas largos.
- Deteccion de formatos modernos: menciones de Slack, nombres de usuario con `@`, numeros de tarjeta incluso parciales (ultimos cuatro digitos), IBANs, direcciones IPv4 e IPv6, secretos como contrasenas, PINs, claves API y tokens.
- Inferencia rapida: unos 13 ms por 1.000 tokens en GPU y 229 ms en CPU.

## Casos de uso

- Redaccion de documentos de empresa antes de compartirlos: los documentos Word o PDF convertidos a texto pueden pasarse por `redact()` para sustituir nombres, cuentas y documentos de identidad por sus etiquetas antes de enviarlos a terceros o a servicios externos de analisis.
- Cumplimiento de privacidad en logs de chat de soporte: con su alto rendimiento en mensajes de chat (F1 del 91,7 % en Privacy-Bench messages) y deteccion de menciones de Slack y nombres informales, es adecuado para anonimizar conversaciones de atencion al cliente antes de almacenarlas o entrenar con ellas.
- Limpieza de datos para entrenamiento de LLMs: como etapa de preprocesamiento en pipelines de datos, eliminando PII de corpus de texto con una tasa de falsos positivos muy baja (0,06 por 1.000 caracteres), lo que minimiza la degradacion del corpus por sustituciones erroneas.
- Cumplimiento normativo (GDPR, HIPAA): deteccion de identificadores sanitarios (PATIENT_ID, numeros de historial medico) y financieros (BANK_ACCOUNT, PAYMENT_CARD) para clasificar y proteger datos sensibles en sistemas que manejan informacion de clientes.
- Prevencion de fugas de secretos: la etiqueta SECRET cubre contrasenas, PINs, codigos de verificacion, claves API y tokens, util para escanear tickets, correos o mensajes internos antes de que lleguen a sistemas de terceros.
- Moderacion de contenido en plataformas: deteccion de datos de contacto (EMAIL, PHONE, URL, IP_ADDRESS) intercambiados entre usuarios para evitar que se compartan fuera de la plataforma.
- Procesamiento por lotes en CPU: con 229 ms por 1.000 tokens en CPU, es viable su ejecucion en maquinas sin GPU para volumenes moderados, sin depender de infraestructura de aceleracion.

## Benchmarks y rendimiento

Resultados publicados por el autor: F1 exacto de spans (inicio, fin y etiqueta correctos) en tres benchmarks publicos no usados en entrenamiento.

| Modelo | Tamano | Privacy-Bench docs | Privacy-Bench messages | PII-TRACE | GPU, 1.000 tokens |
|---|---|---|---|---|---|
| **cbx-pii-extractor-68M** | 68M | **88,1 %** | **91,7 %** | **93,2 %** | 13 ms |
| cbx-pii-extractor-32M | 32M | 88,0 % | 87,0 % | 93,5 % | 8 ms |
| cbx-pii-extractor-17M | 17M | 86,1 % | 83,1 % | 91,6 % | 6 ms |
| PII-Tracer | 596M | 86,9 % | 82,0 % | 92,5 % | 160 ms |
| GLiNER2-PII | 205M | 80,8 % | 86,9 % | 66,2 % | 91 ms |
| Presidio (spaCy lg) | – | 82,4 % | 85,8 % | 64,7 % | 85 ms (CPU) |

Detalles de la evaluacion:

- Privacy-Bench docs: 656 paginas anotadas humanamente de documentos de negocio (Word y PDF), 8.700 valores anotados en los tipos puntuados.
- Privacy-Bench messages: 5.198 mensajes de chat, 6.594 valores anotados.
- PII-TRACE: 500 conversaciones multi-turno (subconjunto publico), 2.442 valores anotados; es el benchmark propio de PII-Tracer. Sin fechas distintas a fechas de nacimiento (que este modelo no etiqueta deliberadamente), cbx-pii-extractor-68M alcanza el 97,8 % frente al 91,9 % de PII-Tracer.
- Falsos positivos: 0,06 valores falsos por 1.000 caracteres en texto sin PII, frente a 1,6–3,6 de los modelos comparados.
- Todos los modelos se ejecutaron sobre los mismos textos con la misma metrica; ninguna secuencia de 13 palabras del entrenamiento aparece en los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 68M de parametros en fp32 (~0,5 GB de pesos en el repo) cabe comodamente en cualquier GPU moderna, incluidas las de gama de consumo (se estima menos de 1 GB de VRAM).
- GPU recomendadas: cualquier GPU con soporte CUDA; no se requieren A100 ni H100 dado el tamano del modelo. El propio extractor usa GPU automaticamente si esta disponible.
- Consumer GPUs: si, cabe sobradamente en GPUs de consumo (RTX 3060, RTX 4060 o superiores, e incluso integradas con soporte CUDA).
- CPU: totalmente viable; 229 ms por 1.000 tokens lo hace util para procesamiento por lotes sin GPU.
- Opciones de despliegue: el repo incluye su propia clase `PIIExtractor` (fichero `pii.py`) con `requirements.txt`, descargable mediante `hf download`. No se menciona compatibilidad nativa con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de token classification, el despliegue natural es via PyTorch/HuggingFace Transformers.
- Latencia: 13 ms por 1.000 tokens en GPU y 229 ms por 1.000 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 docs / messages / TRACE | Latencia (GPU, 1k tokens) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cbx-pii-extractor-68M | 68M | 7.999 tokens | 88,1 % / 91,7 % / 93,2 % | 13 ms | Apache 2.0 | Hugging Face, pesos abiertos |
| PII-Tracer | 596M | no disponible | 86,9 % / 82,0 % / 92,5 % | 160 ms | no disponible | Pesos abiertos |
| GLiNER2-PII | 205M | no disponible | 80,8 % / 86,9 % / 66,2 % | 91 ms | no disponible | Pesos abiertos |
| Presidio (spaCy lg) | – | no disponible | 82,4 % / 85,8 % / 64,7 % | 85 ms (CPU) | MIT (Presidio) | Libreria open source, basada en reglas + NER |

La familia cbx-pii-extractor ofrece ademas versiones mas ligeras: cbx-pii-extractor-32M (8 ms/1k tokens en GPU) y cbx-pii-extractor-17M (6 ms/1k tokens), con F1 ligeramente inferior, utiles cuando la latencia o el coste priman sobre la precision en chat.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y etiquetado para texto en ingles; su comportamiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea deficiente.
- Las fechas distintas a la fecha de nacimiento no se etiquetan deliberadamente; en PII-TRACE la mayor parte de la diferencia con PII-Tracer se debe a esto. Si tu caso de uso requiere redactar todas las fechas, necesitaras un paso adicional.
- Una ciudad o pais aislados no se etiquetan como ADDRESS; solo se marcan direcciones postales completas (con unidad, ciudad y codigo postal).
- Los numeros de ticket y de pedido no se marcan como CUSTOMER_ID.
- Riesgo residual de falsos negativos: con un F1 del 88–93 %, en torno a un 7–12 % de los valores PII no se detectan de forma exacta; para cumplimiento estricto (GDPR, HIPAA) conviene combinar con reglas adicionales o revision humana.
- Sesgos: no se han documentado sesgos especificos en la model card.
- Licencia Apache 2.0: sin restricciones para uso comercial.
- Versionado: las etiquetas cambiaron entre v0.1 y v0.2; se recomienda fijar la revision (`--revision v0.2`) en produccion o mapear las etiquetas antiguas si se actualiza.
- Metricas publicadas por el propio autor del modelo, que ejecuto tambien los modelos competidores; conviene validar con datos propios antes de comprometerse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Version 32M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-32M
- Version 17M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-17M
- Paper de referencia de la arquitectura base (arxiv): https://arxiv.org/abs/2507.11412
- PII-TRACE (benchmark de PII-Tracer): no disponible enlace directo
- Privacy-Bench: no disponible enlace directo
