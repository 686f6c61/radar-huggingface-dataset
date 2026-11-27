# inboxpraveen/Kavach-PII-270M

## Resumen

Kavach PII 270M es un modelo de lenguaje especializado en la detección y extracción de datos personales (PII, PHI y PCI) a partir de texto libre. Lo desarrolla el usuario independiente inboxpraveen y se distribuye como un fine-tuning del modelo base google/gemma-3-270m-it. Su función concreta es leer un documento y devolver, como una lista JSON, cada valor sensible que contiene junto con su etiqueta semántica (por ejemplo, PERSON, EMAIL, IBAN o MEDICAL_RECORD_ID), lo que lo convierte en una pieza pensada para integrarse en pipelines de redacción y anonimización.

El modelo tiene 268.098.176 parámetros reales según los pesos en safetensors, lo que lo sitúa en la gama de modelos que pueden ejecutarse en CPU o en una GPU de portátil. Cubre 29 idiomas, entre ellos el castellano, y declara compatibilidad con casos de uso regulados como GDPR y HIPAA. La versión publicada es la v2, con fecha de creación en el repositorio de septiembre de 2026; el autor indica que una v3 privada, integrada en un producto, alcanza resultados superiores, pero sus pesos no están disponibles.

Su relevancia actual reside en el problema que ataca: los sistemas de redacción clásicos generan una tasa muy alta de falsos positivos sobre documentos sin datos personales, lo que los hace inviables en producción. Kavach declara una tasa de falsos positivos del 0,4 % en documentos libres de PII, frente al 80,2 % de GLiNER-PII y el 85,3 % de Microsoft Presidio, medidos con el mismo script y las mismas anotaciones de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text), fine-tuning de google/gemma-3-270m-it |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de servicio usan `--max-model-len 4096`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los ejemplos usan bfloat16 |
| Idiomas soportados | 29: en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur, ar, zh, ja, ko, ru, tr, vi, id, es, fr, de, it, pt, nl, pl |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors; incluye adaptador LoRA en el subdirectorio `adapter` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3, en su variante de texto (`gemma3_text`), con 270M parámetros. Se obtiene por fine-tuning supervisado del checkpoint instructivo google/gemma-3-270m-it, y el repositorio publica tanto los pesos fusionados como el adaptador LoRA, lo que permite servirlo sobre el modelo base original con vLLM. La tarea se formula como generación condicionada por instrucciones: el prompt enumera las 52 etiquetas posibles y pide una salida JSON estricta, de modo que la extracción de entidades se resuelve como una generación estructurada en lugar de como una clasificación de tokens.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Sí describe la naturaleza de los datos de entrada para los que se diseñó: transcripciones ASR de centros de llamadas, salida OCR de documentos escaneados, formularios estructurados, chats, código, logs y texto deliberadamente ofuscado. El autor advierte de un detalle operativo relevante: `generation_config.json` viene con `do_sample: true`, por lo que en producción debe forzarse decodificación greedy (`do_sample=False` o `temperature=0`) para obtener resultados reproducibles.

## Capacidades

- Extracción de PII, PHI y PCI en formato JSON estructurado, con 52 etiquetas definidas que cubren identificadores personales, financieros, sanitarios, de dispositivo, biométricos y de localización.
- Cobertura de identificadores específicos de India (AADHAAR_IN, PAN_IN, UPI_VPA), Estados Unidos (SSN_US) y estándares internacionales (IBAN, SWIFT_BIC, PASSPORT, DRIVING_LICENSE).
- Detección de atributos sensibles según categorías protegidas: ETHNICITY, RELIGION, POLITICAL_BELIEF, DISABILITY, GENDER_SEX.
- Procesamiento de texto ruidoso: transcripciones de voz, OCR, formularios y contenido ofuscado.
- Capacidad multilingüe declarada en 29 idiomas, incluidos los principales idiomas europeos y un bloque amplio de lenguas indias.
- Generación de texto conversacional heredada del modelo base instructivo, aunque la especialización del fine-tuning es la extracción.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (la variante es `gemma3_text`).

## Casos de uso

- Redacción automática en atención al cliente: el modelo procesa transcripciones ASR de llamadas y devuelve las entidades a enmascarar antes de almacenar o auditar la conversación, con una recall de redacción declarada del 93,0 %.
- Cumplimiento GDPR en pipelines de datos: se inserta como etapa previa al almacenamiento para localizar y eliminar datos personales de logs, formularios y correos, con una tasa de falsos positivos del 0,4 % que evita bloquear documentos legítimos.
- Desidentificación de documentación clínica: extrae MEDICAL_RECORD_ID, HEALTH_ID, LAB_ORDER_ID y PRESCRIPTION_ID de informes y prescripciones, alineado con flujos HIPAA.
- Saneamiento de datasets para entrenamiento: filtra PII de corpus recopilados antes de publicarlos o de usarlos en el ajuste de otros modelos, reduciendo el riesgo de memorización de datos personales.
- Protección de datos financieros: detecta CREDIT_DEBIT_CARD, CARD_CVV, CARD_EXPIRY, BANK_ACCOUNT, IBAN, SWIFT_BIC y UPI_VPA en extractos, tickets y registros de transacciones.
- Enmascaramiento en logs de aplicaciones y código: localiza API_KEY_TOKEN, PASSWORD_SECRET, IP_ADDRESS, MAC_ADDRESS, DEVICE_ID y URL_PERSONAL en trazas y repositorios antes de enviarlas a sistemas de observabilidad de terceros.
- Despliegue en el borde o en entornos sin GPU: con 270M parámetros en bfloat16 y un repositorio de 1,2 GB, puede ejecutarse en CPU o en GPU de consumo dentro de la propia infraestructura del cliente, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Preprocesado multilingüe para soporte global: al cubrir 29 idiomas, un mismo modelo sirve para normalizar la redacción en centros de soporte con varios idiomas sin mantener un detector por región.

## Benchmarks y rendimiento

Datos declarados por el autor sobre un conjunto de test reservado de 3.372 documentos y 13.646 valores anotados, medidos con el mismo script y las mismas anotaciones para todos los sistemas:

| Metrica | Kavach PII 270M | GLiNER-PII multi-v1 | Presidio | Regex + checksum |
|---|---|---|---|---|
| Value F1 | 88,4 | 56,4 | 22,2 | 20,5 |
| Precision | 88,9 | 56,9 | 21,0 | 51,1 |
| Recall | 87,9 | 55,9 | 23,4 | 12,8 |
| Exact span F1 | 89,1 | 55,4 | 22,3 | 20,0 |
| Recall de redaccion | 93,0 | 66,2 | 43,2 | 15,6 |
| Falsos positivos en documentos sin PII | 0,4 % | 80,2 % | 85,3 % | 28,8 % |

El autor advierte de que el gold original de la v2 omitía aproximadamente uno de cada diez valores. Sobre el conjunto de test corregido de la v3 (4.577 documentos, mismo scorer), la v2 obtiene 79,0 de value-F1 y la v3 privada 92,0. En ese mismo conjunto, la v2 marca como PII el 2,0 % de los documentos libres de datos personales, frente al 12,5 % de la v3. Las etiquetas de Presidio y GLiNER se mapearon a las del modelo de la mejor forma posible; el autor remite a las notas de comparación justa de la model card.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los 268M parámetros ocupan aproximadamente 0,54 GB de pesos; con overhead de activaciones y caché KV para 4.096 tokens, el consumo se mantiene holgadamente por debajo de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el modelo está pensado para GPU de portátil o para CPU.
- GPU de consumo: cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en iGPU modernas con suficiente memoria compartida.
- CPU: viable para inferencia en producción a baja concurrencia, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (ejemplo oficial), vLLM (`vllm serve`, con soporte de LoRA sobre el modelo base), SGLang (`sglang.launch_server`) y cualquier servidor compatible con la API `/v1/chat/completions` de OpenAI. El tag del repositorio incluye `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda `temperature: 0` y `max_new_tokens=768` para la extracción completa.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Value F1 (test del autor) | Falsos positivos en docs sin PII | Licencia |
|---|---|---|---|---|---|
| Kavach PII 270M | 268M | LLM generativo con salida JSON | 88,4 | 0,4 % | gemma |
| GLiNER-PII multi-v1 | no disponible | NER zero-shot basado en GLiNER | 56,4 | 80,2 % | no disponible en la informacion proporcionada |
| Microsoft Presidio | no aplica (reglas + NER) | Pipeline de analizadores y reconocedores | 22,2 | 85,3 % | MIT (Presidio) |
| Regex + checksum | no aplica | Reglas y validación de dígitos de control | 20,5 | 28,8 % | no aplica |

La comparación se limita a los sistemas incluidos por el autor en su evaluación; no se han publicado en la información disponible comparaciones con otros modelos de extracción de PII de tamaño similar.

## Limitaciones y advertencias

- El conjunto de evaluación y las notas de comparación justa los aporta el propio autor; el mapeo de etiquetas de Presidio y GLiNER a las de Kavach es aproximado y puede favorecer al modelo evaluado.
- El gold original de la v2 contenía errores (aproximadamente un valor omitido de cada diez), lo que infla las métricas publicadas; sobre el gold corregido, el value-F1 de la v2 baja a 79,0.
- La decodificación muestreada está activada por defecto en `generation_config.json`; usarla en producción introduce variabilidad y posibles salidas JSON mal formadas. Es obligatorio forzar decodificación greedy.
- La salida es JSON generado, no una clasificación con garantías de esquema; conviene validar y parsear la respuesta, y prever reintentos ante truncamientos con `max_new_tokens` insuficiente.
- La licencia Gemma impone las Gemma Terms of Use, con obligaciones de atribución y restricciones de uso; debe revisarse antes de un despliegue comercial.
- No se documentan sesgos conocidos, tasas de alucinación específicas ni evaluación por idioma; el rendimiento en los 29 idiomas declarados puede variar y no está cuantificado en la información disponible.
- El modelo detecta PII en el texto de entrada, pero no garantiza la ausencia de datos personales residuales; debe combinarse con validación y auditoría humanas en contextos regulados.
- La v3, con mejores resultados declarados, es privada y sus pesos no están publicados; la versión abierta es la v2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inboxpraveen/Kavach-PII-270M
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Artículo del autor sobre la v3: https://inboxpraveen.github.io/blogs/blog-6.html
- Script de extracción incluido en el repositorio: https://huggingface.co/inboxpraveen/Kavach-PII-270M/blob/main/kavach_extract.py
