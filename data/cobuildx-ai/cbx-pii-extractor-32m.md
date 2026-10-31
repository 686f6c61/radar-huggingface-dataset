# CobuildX-AI/cbx-pii-extractor-32M

## Resumen

cbx-pii-extractor-32M es un modelo de clasificación de tokens especializado en la detección de información personal identificable (PII, por sus siglas en inglés) en texto en inglés. Lo ha desarrollado CobuildX-AI a partir de una puesta a punto (fine-tuning) del codificador jhu-clsp/ettin-encoder-32m, y se presenta como la opción recomendada por defecto dentro de su familia, por ser el mejor equilibrio entre precisión y velocidad frente a las variantes de 17M y 68M parámetros.

El problema que resuelve es la anonimización y redacción de datos personales en documentos y conversaciones: el modelo devuelve la posición exacta (inicio y fin) de cada valor sensible junto con una de 18 etiquetas específicas (nombres, correos, tarjetas de pago, identificadores gubernamentales, secretos como contraseñas o claves API, etc.). Su relevancia radica en que, con solo 32 millones de parámetros, supera en benchmarks públicos a alternativas mucho mayores como PII-Tracer (596M) y GLiNER2-PII (205M), con latencias de unos 8 ms por cada 1.000 tokens en GPU.

La versión actual es la v0.2, que amplía de 12 a 18 las etiquetas disponibles y mejora la detección en chats y documentos de empresa (nombres en minúsculas, menciones de Slack, códigos de verificación, referencias de póliza o cuenta). Usa arquitectura ModernBERT (codificador basado en la familia Ettin), pesos en safetensors, licencia Apache 2.0 y una longitud de contexto de 7.999 tokens leídos en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (codificador, basado en ettin-encoder-32m) |
| Parametros totales | 31.897.381 |
| Parametros activos | no disponible (no se indica que sea MoE; se asume el total) |
| Longitud de contexto | 7.999 tokens en una sola pasada; textos más largos se dividen automáticamente |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un codificador tipo transformer de la familia ModernBERT, puesto a punto desde jhu-clsp/ettin-encoder-32m (la familia Ettin de JHU CLSP, que combina entrenamiento de codificadores con recetas modernas de BERT). Como modelo de token classification, etiqueta cada fragmento relevante del texto en lugar de generar texto, lo que explica sus latencias muy bajas: aproximadamente 8 ms por 1.000 tokens en GPU y 78 ms en CPU.

La model card no detalla el número de tokens del entrenamiento ni la composición exacta del dataset, aunque indica que los benchmarks de evaluación no comparten ninguna secuencia de 13 palabras con los datos de entrenamiento. Tampoco se menciona el uso de RLHF o DPO (habitual solo en modelos generativos). La innovación principal es funcional: la taxonomía de 18 etiquetas de la v0.2, que desglosa identificadores en tipos específicos (cuenta bancaria, tarjeta de pago, pasaporte, DNI/número de la seguridad social, identificación fiscal, permiso de conducir, identificador de empleado o paciente, secretos, etc.) y cubre casos difíciles como nombres propios en minúsculas, menciones `<@U02NORA>` de Slack y códigos de verificación.

## Capacidades

- Detección de PII con posición exacta (carácter inicial y final) mediante 18 etiquetas: PERSON, DATE_OF_BIRTH, EMAIL, PHONE, ADDRESS, BANK_ACCOUNT, PAYMENT_CARD, CUSTOMER_ID, NATIONAL_ID, PASSPORT, TAX_ID, DRIVERS_LICENSE, USERNAME, URL, IP_ADDRESS, SECRET, EMPLOYEE_ID y PATIENT_ID.
- Redacción automática: el método `redact()` sustituye cada valor detectado por su etiqueta o por una plantilla personalizada.
- Filtrado por etiquetas: se puede limitar la extracción a un subconjunto de tipos (por ejemplo, solo PERSON y EMAIL).
- Manejo de textos largos: contexto de 7.999 tokens en una sola pasada, con división automática de textos más largos.
- Detección de casos difíciles: nombres solo con nombre de pila, iniciales, apodos y en minúsculas; menciones de Slack con delimitadores; números de póliza, miembro y cuenta; identificadores de empleado en tablas; últimos cuatro dígitos de tarjetas; extensiones telefónicas.
- Baja tasa de falsos positivos: 0,07 valores falsos por cada 1.000 caracteres en texto sin PII.
- Uso como pipeline de token classification en HuggingFace, con script de carga `PIIExtractor` incluido en el repositorio.

## Casos de uso

- Redacción de documentos de empresa antes de compartirlos: puede procesar páginas de Word y PDF convertidas a texto (el benchmark Privacy-Bench docs usa 656 páginas de este tipo) y sustituir nombres, cuentas y tarjetas por etiquetas, útil para cumplir RGPD o políticas internas antes de publicar o enviar documentación.
- Anonimización de logs y tickets de soporte: gracias a su velocidad (78 ms por 1.000 tokens en CPU) puede ejecutarse en pipelines de ingesta masiva sin GPU, eliminando correos, teléfonos y números de cliente antes de que los datos lleguen a sistemas de analítica o LLM de terceros.
- Limpieza de conversaciones de chat para entrenamiento de modelos: detecta menciones de usuario, handles y códigos de verificación en mensajes tipo Slack (5.198 mensajes del benchmark Privacy-Bench messages), permitiendo anonimizar corpus de diálogo antes de usarlos como datos de fine-tuning.
- Sanitización de entradas a LLM en producción: como gateway previo a un asistente, puede extraer PII del prompt del usuario y reinsertarla en la respuesta, evitando que datos personales salgan de la infraestructura propia.
- Cumplimiento en el sector sanitario: la etiqueta PATIENT_ID cubre identificadores de paciente y números de historia clínica, y SECRET detecta credenciales y tokens accidentalmente pegados, útil para auditorías de seguridad en historiales o portales de pacientes.
- Detección de secretos en texto: la etiqueta SECRET identifica contraseñas, PIN, códigos de acceso y claves API, aplicable a revisión de correos, documentación interna o mensajes antes de su archivado.
- Procesamiento de transcripciones y CRM: identificación de referencias de póliza, miembro y cuenta (CUSTOMER_ID) en conversaciones multi-turno de atención al cliente, para enmascararlas en grabaciones transcritas o notas comerciales.

## Benchmarks y rendimiento

Resultados publicados por el autor: F1 exacto de span (inicio, fin y etiqueta correctos) en tres benchmarks públicos no usados en entrenamiento.

| Modelo | Tamaño | Privacy-Bench docs | Privacy-Bench messages | PII-TRACE | GPU, 1.000 tokens |
|---|---|---|---|---|---|
| cbx-pii-extractor-68M | 68M | 88,1 % | 91,7 % | 93,2 % | 13 ms |
| **cbx-pii-extractor-32M** | **32M** | **88,0 %** | **87,0 %** | **93,5 %** | **8 ms** |
| cbx-pii-extractor-17M | 17M | 86,1 % | 83,1 % | 91,6 % | 6 ms |
| PII-Tracer | 596M | 86,9 % | 82,0 % | 92,5 % | 160 ms |
| GLiNER2-PII | 205M | 80,8 % | 86,9 % | 66,2 % | 91 ms |
| Presidio (spaCy lg) | – | 82,4 % | 85,8 % | 64,7 % | 85 ms (CPU) |

Datos adicionales publicados:

- Sin fechas (que el modelo no etiqueta deliberadamente), el F1 en PII-TRACE sería del 98,0 % frente al 91,9 % de PII-Tracer.
- Tasa de falsos positivos en texto sin PII: 0,07 valores por 1.000 caracteres, frente a 1,6–3,6 de los modelos comparados.
- Tamaño de los benchmarks: Privacy-Bench docs (656 páginas, 8.700 valores anotados), Privacy-Bench messages (5.198 mensajes, 6.594 valores) y PII-TRACE (500 conversaciones multi-turno, 2.442 valores).

## Requisitos de hardware

- VRAM estimada: muy baja; con 32M de parámetros y 0,3 GB de pesos en safetensors, el modelo cabe con holgura en cualquier GPU moderna (del orden de 1 GB de VRAM incluyendo overhead de inferencia; dato exacto no disponible).
- GPU recomendadas: cualquier GPU con soporte CUDA o Apple Silicon; no se requiere A100 ni H100. El dato de 8 ms por 1.000 tokens se refiere a GPU sin especificar modelo.
- Consumer GPUs: cabe sin problemas en GPUs de gama baja o integradas; también funciona en CPU a 78 ms por 1.000 tokens, suficiente para muchos pipelines por lotes.
- Despliegue: el repositorio incluye su propio envoltorio `PIIExtractor` (pii.py) con instalación vía `pip` y descarga con `huggingface_hub`. Al ser un codificador de token classification, también debería funcionar con la librería transformers estándar; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (orientados a modelos generativos).
- Latencia y throughput: 8 ms por 1.000 tokens en GPU y 78 ms por 1.000 tokens en CPU, según datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 PII-TRACE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-pii-extractor-32M | 32M | 7.999 tokens | 93,5 % | Apache 2.0 | HuggingFace (CobuildX-AI) |
| cbx-pii-extractor-68M | 68M | no disponible | 93,2 % | Apache 2.0 | HuggingFace (CobuildX-AI) |
| cbx-pii-extractor-17M | 17M | no disponible | 91,6 % | Apache 2.0 | HuggingFace (CobuildX-AI) |
| PII-Tracer | 596M | no disponible | 92,5 % | no disponible | público (benchmark propio) |
| GLiNER2-PII | 205M | no disponible | 66,2 % | no disponible | público |
| Presidio (spaCy lg) | – | no disponible | 64,7 % | MIT (Presidio) | software libre |

La variante de 32M ofrece prácticamente el mismo F1 en documentos que la de 68M (88,0 % frente a 88,1 %) con un 60 % menos de parámetros y casi el doble de velocidad, aunque cede en chats (87,0 % frente a 91,7 %), por lo que la elección depende del tipo de texto dominante en cada caso de uso.

## Limitaciones y advertencias

- Solo inglés: no detecta PII en otros idiomas, incluido el castellano, pese a que la ficha está dirigida a desarrolladores hispanohablantes; para texto en español habría que evaluar alternativas o esperar soporte multilingüe.
- No etiqueta fechas distintas de la fecha de nacimiento: en PII-TRACE la mayor parte de la brecha restante se debe a fechas que el modelo ignora deliberadamente; si el caso de uso exige redactar cualquier fecha, habrá que añadir un posprocesado propio.
- Direcciones parciales no etiquetadas: una ciudad o un país aislados no se marcan como ADDRESS, solo direcciones postales completas.
- Riesgo de falsos negativos en producción: aunque la tasa de falsos positivos es muy baja (0,07 por 1.000 caracteres), la model card no publica tasa de alucinaciones ni recall por etiqueta individual; para cumplimiento normativo estricto conviene validar contra datos propios antes de confiar en la redacción automática.
- Números de ticket y de pedido no se marcan como CUSTOMER_ID, lo que puede requerir reglas complementarias en entornos de e-commerce.
- Etiquetas cambiadas en v0.2: quien actualice desde v0.1 debe fijar `--revision v0.1` o mapear las etiquetas nuevas a las antiguas, ya que los nombres han cambiado y un pipeline existente puede romperse.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque no hay garantía explícita de aptitud para cumplimiento RGPD/HIPAA: la responsabilidad de la conformidad sigue siendo del integrador.
- Datos de rendimiento (8 ms/1.000 tokens) publicados por el propio autor con su propia metodología de evaluación; conviene contrastarlos en el hardware de destino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-32M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Variante 68M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-68M
- Variante 17M: https://huggingface.co/CobuildX-AI/cbx-pii-extractor-17M
- Paper de referencia de la arquitectura base (arXiv, citado en los tags del modelo): https://arxiv.org/abs/2507.11412
- Benchmark PII-TRACE (usado en la evaluación): no disponible enlace directo en la información proporcionada.
