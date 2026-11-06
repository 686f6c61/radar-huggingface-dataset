# aitrainingdatabroker/invoice-pii-detector

## Resumen

El modelo `invoice-pii-detector` es un clasificador de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto de facturas y pagos. Lo desarrolla AI Training Data Broker, un intermediario y asesor técnico para empresas que licencian sus datos a laboratorios de IA, y está pensado como herramienta de pre-revisión: marca candidatos a PII para que una persona los valide antes de compartir registros contables con terceros.

Se trata de un fine-tuning de `distilroberta-base`, una arquitectura transformer encoder de tipo RoBERTa destilada, con 81.543.957 parámetros totales (aproximadamente 82 millones). El modelo reconoce diez tipos de entidad: PERSON, ORG, EMAIL, PHONE, ADDRESS, DATE, MONEY, INVOICE_ID, BANK_ACCOUNT y TAX_ID. La longitud de contexto no está declarada en la información disponible, aunque al derivar de RoBERTa es previsible que herede su límite habitual.

Su relevancia es acotada pero concreta: cubre un nicho (desidentificación de texto de facturación) con una licencia permisiva Apache 2.0, un tamaño reducido que permite ejecución en CPU o GPU de consumo, y un conjunto de métricas publicadas por el autor. Es un modelo pequeño, entrenado con datos sintéticos y con un dataset de entrenamiento muy reducido, por lo que debe tratarse como un componente de apoyo y no como una solución de cumplimiento autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilada, `distilroberta-base`) |
| Parametros totales | 81.543.957 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas de entidad | PERSON, ORG, EMAIL, PHONE, ADDRESS, DATE, MONEY, INVOICE_ID, BANK_ACCOUNT, TAX_ID |
| Dataset de entrenamiento | `aitrainingdatabroker/synthetic-invoice-pii-spans` |
| Tamaño del repositorio | 0,3 GB |
| Descargas | 24 |
| Fecha de creación | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilroberta-base`, un encoder transformer basado en RoBERTa con destilación de conocimiento, adaptado a la tarea de etiquetado de secuencias (token classification) con cabecera de clasificación por token. No emplea arquitecturas híbridas ni mecanismos de atención lineal; es un transformer encoder convencional orientado a extracción de entidades nombradas (NER) sobre texto de facturación.

El entrenamiento se realizó durante 8 épocas en una única RTX 3070, con un dataset de 280 filas procedentes de `aitrainingdatabroker/synthetic-invoice-pii-spans`, íntegramente sintético. Las filas de test se construyeron a partir de plantillas que el modelo no vio durante el entrenamiento. Los scripts de generación de datos y de entrenamiento están incluidos en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`. No se documenta el uso de RLHF, DPO ni técnicas de alineación; se trata de un ajuste supervisado clásico sobre datos etiquetados.

## Capacidades

- Detección de entidades PII en texto de facturas y pagos: nombres de persona, organizaciones, correo electrónico, teléfono, dirección, fecha, importes monetarios, identificador de factura, número de cuenta bancaria e identificador fiscal.
- Etiquetado a nivel de token con agregación de entidades (compatible con `aggregation_strategy="simple"` en el pipeline de transformers).
- Procesamiento de líneas de texto individuales, no de tablas ni de documentos escaneados.
- Salida con puntuación de confianza por entidad, lo que permite umbrales de revisión manual.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo discriminativo de NER.
- Capacidad monolingüe: solo inglés.
- No soporta visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Pre-revisión de exportaciones contables: antes de enviar un extracto de QuickBooks o de un ERP a un tercero, el modelo marca nombres, cuentas y direcciones para que un revisor humano los confirme o redacte. Es adecuado por su tamaño reducido y por su licencia permisiva.
- Redacción automática en pipelines de datos: integrado como paso previo a la tokenización o al envío de texto a un servicio externo, permite sustituir entidades detectadas por marcadores genéricos, reduciendo la exposición de datos personales.
- Detección de identificadores fiscales y de cuenta en facturas: el modelo identifica `TAX_ID` y `BANK_ACCOUNT` en líneas de pago, útil para auditar qué campos sensibles aparecen en un lote de documentos antes de su tratamiento.
- Clasificación de correos y comunicaciones de facturación: al procesar líneas de texto de emails de cobro o recordatorios de pago, permite etiquetar importes, fechas e identificadores de factura para su extracción posterior.
- Etiquetado asistido para construir datasets de entrenamiento: dado que el autor publica los scripts, el modelo puede servir como anotador preliminar en la creación de corpus de PII, con revisión humana posterior.
- Filtro de cumplimiento en herramientas internas: desplegado como microservicio ligero (por ejemplo, con el pipeline de transformers o con un servidor de inferencia), puede actuar como primera barrera en flujos de compartición de datos entre departamentos.
- Prototipado y evaluación de pipelines de desidentificación: su reducido coste de inferencia permite iterar rápidamente sobre umbrales y estrategias de agregación antes de adoptar un modelo mayor.

## Benchmarks y rendimiento

El autor publica métricas de coincidencia exacta de entidad sobre 120 filas reservadas para test:

| Tipo | Precision | Recall | F1 | Count |
|---|---|---|---|---|
| ADDRESS | 1.0 | 1.0 | 1.0 | 30 |
| BANK_ACCOUNT | 0.591 | 0.433 | 0.5 | 30 |
| DATE | 1.0 | 1.0 | 1.0 | 60 |
| EMAIL | 1.0 | 1.0 | 1.0 | 30 |
| INVOICE_ID | 1.0 | 1.0 | 1.0 | 60 |
| MONEY | 1.0 | 1.0 | 1.0 | 60 |
| ORG | 1.0 | 1.0 | 1.0 | 60 |
| PERSON | 1.0 | 1.0 | 1.0 | 60 |
| PHONE | 1.0 | 1.0 | 1.0 | 30 |
| TAX_ID | 0.638 | 1.0 | 0.779 | 30 |

Métricas globales: precision 0,943, recall 0,962, F1 0,953 sobre 120 filas de test. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de unos 82 millones de parámetros, la inferencia en FP32 requiere aproximadamente 0,33 GB de pesos; en FP16 alrededor de 0,17 GB. El consumo total en memoria, incluyendo activaciones y overhead del runtime, se sitúa típicamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 3070 (la usada para entrenar), RTX 4090, A100 y H100; estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable para lotes pequeños; el modelo es lo bastante pequeño para inferencia en CPU con latencias de milisegundos por línea.
- Opciones de despliegue: pipeline de `transformers`, servidores de inferencia compatibles con token-classification (por ejemplo, TGI), exportación a ONNX y cuantización con herramientas estándar. No se documenta soporte nativo de GGUF ni de Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan características estructurales con alternativas genéricas de la misma categoría, marcando como no disponibles los datos que no se han podido verificar:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| invoice-pii-detector | 81,5 M | no disponible | Apache 2.0 | NER de PII en facturas, solo inglés |
| distilroberta-base (base) | ~82 M | no disponible | Apache 2.0 | Encoder general, sin fine-tuning para PII |
| Modelos NER multilingües tipo XLM-R | no disponible | no disponible | varía | NER general, no específico de facturación |
| Modelos de PII de mayor tamaño | no disponible | no disponible | varía | Mayor cobertura, mayor coste de inferencia |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintético generado a partir de plantillas (280 filas); el texto real presenta mucha más variabilidad y el rendimiento puede degradarse fuera del dominio de las plantillas.
- Procesa líneas individuales, no tablas ni PDFs escaneados; no incluye OCR ni análisis de layout.
- Los formatos de cuenta bancaria e identificador fiscal del entrenamiento no son reales y varían por país; la generalización a formatos reales es incierta.
- Rendimiento débil en `BANK_ACCOUNT` (F1 0,5) y moderado en `TAX_ID` (F1 0,779), con precisión baja en cuentas bancarias (0,591); requiere revisión humana especialmente en estos tipos.
- Modelo monolingüe (inglés); no cubre facturas en castellano ni en otros idiomas.
- Riesgo de alucinación de entidades: como todo modelo discriminativo, puede marcar falsos positivos, especialmente en cadenas numéricas ambiguas.
- No es asesoramiento legal ni certificación de cumplimiento; el autor indica explícitamente que una persona debe revisar la salida antes de compartir o decidir, y que el criterio legal corresponde al asesor jurídico.
- Licencia Apache 2.0: permite uso comercial, pero el autor solicita atribución a AI Training Data Broker y enlace a su sitio web al compartir o construir sobre el modelo.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos sintéticos de plantillas, puede heredar sesgos de diseño de esas plantillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/invoice-pii-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/synthetic-invoice-pii-spans
- Space relacionado (pii-pattern-scanner): https://huggingface.co/spaces/aitrainingdatabroker/pii-pattern-scanner
- Guía sobre licenciamiento de registros contables y ERP: https://aitrainingdatabroker.com/data/accounting-and-erp-records/
- Guía sobre exportación de datos de QuickBooks para licenciamiento de IA: https://aitrainingdatabroker.com/data/quickbooks-data-export/
- Guía sobre licenciamiento de datos por firmas contables: https://aitrainingdatabroker.com/sell/accounting-firms/
- Sitio del autor: https://aitrainingdatabroker.com/
