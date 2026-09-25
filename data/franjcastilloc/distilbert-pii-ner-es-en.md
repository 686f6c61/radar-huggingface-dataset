# FranJCastilloC/distilbert-pii-ner-es-en

## Resumen

`FranJCastilloC/distilbert-pii-ner-es-en` es un modelo de clasificación de tokens (token classification) obtenido por ajuste fino de `distilbert-base-multilingual-cased` para detectar información personal identificable (PII) en documentos de negocio en castellano e inglés. Lo publica el usuario FranJCastilloC y forma parte de un sistema mayor, la PII Detection & Redaction Pipeline, donde el modelo actúa como componente aprendido junto a un motor de reglas con verificación de checksums y Presidio. Su propósito es localizar spans de PII con etiquetado BIO sobre 10 tipos de entidad.

El modelo es relevante porque aborda un problema recurrente en cumplimiento normativo (RGPD, redacción de documentos): la detección fiable de datos personales antes de almacenar, compartir o procesar texto. Frente a soluciones puramente basadas en expresiones regulares, incorpora un componente neuronal de 134,75 millones de parámetros que generaliza sobre variaciones de formato, aunque el propio autor advierte que su rendimiento óptimo se alcanza en ensemble con las reglas deterministas.

Es un modelo compacto (DistilBERT, encoder de 6 capas) con ventana arquitectónica de 512 tokens, entrenado en ventanas de 192 tokens, licencia MIT y pesos en safetensors. Su tamaño reducido lo hace desplegable en CPU y en GPUs de consumo, lo que facilita su integración en pipelines de redacción en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, destilado de BERT) |
| Parametros totales | 134.750.229 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo arquitectonico); entrenado con max length 192 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision completa) |
| Idiomas soportados | es, en |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | distilbert-base-multilingual-cased |
| Pipeline | token-classification |
| Etiquetas (BIO, 10 clases) | PERSON, EMAIL, PHONE, ADDRESS, DATE_OF_BIRTH, GOV_ID, USERNAME, CREDENTIAL, IP_ADDRESS, DATE_TIME |
| Tamano del repo | 0,5 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un DistilBERT multilingüe cased: un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT, con vocabulario multilingüe y cased (sensible a mayúsculas y minúsculas). Sobre esa base se añade una cabeza de clasificación de tokens con esquema BIO para 10 tipos de entidad, orientada a la tarea de detección de PII en documentos empresariales en castellano e inglés.

Los datos de entrenamiento proceden del conjunto sintético `ai4privacy/pii-masking-300k`, filtrado a inglés y español. La corpus es totalmente sintético, sin datos de personas reales. Un detalle técnico relevante: los offsets de caracteres se realinearon a la tokenización propia del modelo en lugar de reutilizar las etiquetas BIO precalculadas del corpus. La configuración de ajuste fue de 15.057 ventanas de entrenamiento, batch de 16, learning rate 5e-05, longitud máxima 192 y 1 época. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

Una decisión destacable de diseño es la omisión deliberada de las clases `CREDIT_CARD` y `BANK_ACCOUNT`. El corpus anota emisores de tarjeta pero no contiene números de tarjeta ni de cuenta bancaria, por lo que el modelo no puede aprenderlos. En el sistema completo, esas dos clases quedan cubiertas por el motor de reglas mediante la verificación aritmética de Luhn y del mod-97 de IBAN.

## Capacidades

- Reconocimiento de entidades nombradas (NER) orientado a PII en castellano e inglés, con etiquetado BIO.
- Detección de 10 tipos de entidad: PERSON, EMAIL, PHONE, ADDRESS, DATE_OF_BIRTH, GOV_ID, USERNAME, CREDENTIAL, IP_ADDRESS y DATE_TIME.
- Clasificación a nivel de token, apta para extracción de spans de PII y posterior redacción (redaction).
- Multilingüe en los dos idiomas soportados (es, en).
- Diseñado como componente de un ensemble: se combina con reglas deterministas (Luhn, IBAN mod-97) y con Presidio en la pipeline padre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; es un modelo de clasificación, no generativo.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

- Redacción de PII en documentos antes de almacenarlos: el modelo etiqueta spans de datos personales que después se enmascaran en pipelines de cumplimiento RGPD, combinado con reglas para tarjetas y cuentas bancarias.
- Preprocesado de correos electrónicos y tickets de soporte: detección de emails, teléfonos, direcciones y nombres en conversaciones en castellano e inglés antes de enviarlas a sistemas analíticos o de terceros.
- Anonimización de facturas y contratos: aunque el modelo degrada en documentos completos (F1 0,651 en out-of-distribution), sirve como capa neuronal dentro de un ensemble con el motor de reglas para etiquetas de campo explícitas como `Phone:` o `Name:`.
- Cumplimiento y auditoría de datos: extracción de entidades PII para inventariar qué datos personales aparecen en un corpus documental y decidir su tratamiento.
- Filtrado previo en pipelines de IA generativa: detección y redacción de PII en la entrada o salida de un LLM para evitar fugas de datos personales.
- Enriquecimiento y normalización de formularios: identificación de campos (DOB, GOV_ID, IP) para mapear texto libre a estructuras de datos.
- Análisis de logs y tráfico: extracción de IP_ADDRESS, USERNAME y CREDENTIAL en registros de sistemas para procesos de seguridad o anonimización.

## Benchmarks y rendimiento

Validación con seqeval a nivel de entidad sobre 2.000 muestras reservadas:

| Metrica | Precision | Recall | F1 |
|---|---|---|---|
| micro | 0,9236 | 0,9468 | 0,9350 |

Desglose por entidad (conjunto de validación, 2.000 muestras):

| Entidad | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| EMAIL | 0,976 | 0,991 | 0,984 | 669 |
| GOV_ID | 0,943 | 0,973 | 0,958 | 2536 |
| ADDRESS | 0,954 | 0,941 | 0,948 | 2864 |
| PHONE | 0,927 | 0,945 | 0,936 | 526 |
| PERSON | 0,887 | 0,953 | 0,919 | 1338 |
| USERNAME | 0,928 | 0,909 | 0,918 | 680 |
| DATE_TIME | 0,897 | 0,940 | 0,918 | 1450 |
| DATE_OF_BIRTH | 0,900 | 0,933 | 0,916 | 510 |
| IP_ADDRESS | 0,885 | 0,935 | 0,909 | 585 |
| CREDENTIAL | 0,809 | 0,851 | 0,830 | 403 |

Resultados sobre documentos completos (out-of-distribution, 250 documentos sinteticos: facturas, contratos, correos, tickets y formularios):

| Sistema | F1 |
|---|---|
| Modelo solo | 0,651 |
| Baseline de reglas | 0,712 |
| Ensemble completo | 0,765 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente 0,55 GB solo de pesos; en FP16 unos 0,27 GB; en INT8 unos 0,14 GB. Con overhead de activaciones y batch pequeño, cabe holgadamente por debajo de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es apto para RTX 3060, RTX 4090, T4, A10G. Una A100 o H100 resulta sobredimensionada para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: transformers (referencia), y por ser un encoder estándar de Hugging Face puede servirse con TGI, vLLM o FastAPI; también es convertible a ONNX para inferencia optimizada. No se publican pesos GGUF, por lo que llama.cpp/Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tipo de entidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FranJCastilloC/distilbert-pii-ner-es-en | 134,75 M | es, en | 10 clases PII (BIO) | MIT | Hugging Face |
| dslim/distilbert-NER | DistilBERT base (aprox. 66 M) | en | NER generico (PER, ORG, LOC, MISC) | MIT | Hugging Face |
| distilbert-base-multilingual-cased | DistilBERT multilingue | multilingue | modelo base sin cabeza de NER | Apache-2.0 | Hugging Face |
| Presidio (Microsoft) | no aplica (reglas + modelos) | varios | PII mediante reglas y NER combinado | MIT | GitHub |

El modelo se diferencia de `dslim/distilbert-NER` en que su tarea es específicamente PII (10 clases, incluidas CREDENTIAL, GOV_ID o IP_ADDRESS) y en que cubre castellano además de inglés. Frente al modelo base multilingüe, añade la cabeza de clasificación entrenada. Frente a Presidio, aporta un componente neuronal que complementa —no sustituye— las reglas deterministas.

## Limitaciones y advertencias

- Solo soporta castellano e inglés; no cubre otros idiomas.
- Entrenado sobre corpus sintético de frases: los documentos reales introducen ruido de OCR, abreviaturas y maquetación inconsistente no capturados en la evaluación.
- Degrada notablemente en documentos completos frente a frases aisladas (F1 cae a 0,651 en out-of-distribution, por debajo del baseline de reglas de 0,712).
- No detecta tarjetas de crédito ni cuentas bancarias: `CREDIT_CARD` y `BANK_ACCOUNT` no están entre sus clases; se delegan a reglas con verificación de checksum.
- No debe usarse como única salvaguarda en un sistema de redacción: el autor recomienda combinarlo con reglas deterministas, puntuaciones de confianza calibradas y una cola de revisión humana.
- Riesgo de alucinación/falsos positivos en entidades con fronteras ambiguas, especialmente `CREDENTIAL` (F1 0,830) y `PERSON` (F1 0,919).
- Licencia MIT, que permite uso comercial sin restricciones de copyleft, pero no exime de las obligaciones de cumplimiento normativo derivadas del tratamiento de datos personales.
- Modelo recién publicado (0 descargas, 0 likes en el momento de la consulta); sin validación externa ni adopción comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FranJCastilloC/distilbert-pii-ner-es-en
- Repositorio PII Detection & Redaction Pipeline: https://github.com/FranJCastilloC/PII-Detection-Redaction-Pipeline
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-300k
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Modelo comparable dslim/distilbert-NER: https://huggingface.co/dslim/distilbert-NER
- Articulo sobre clasificacion de texto con DistilBERT para privacidad: https://www.sciencedirect.com/science/article/pii/S1877050925026432
