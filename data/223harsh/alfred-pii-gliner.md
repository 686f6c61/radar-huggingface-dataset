# 223Harsh/alfred-pii-gliner

## Resumen

ALFRED PII GLiNER (bank) es un modelo de reconocimiento de entidades nombradas (NER) especializado en detección de información personal identificable (PII) en documentos bancarios italianos. Lo desarrolla 223Harsh como parte de ALFRED (Agentic Ledger For Regulated Enterprise Decisions), un proyecto presentado en el hackathon GDG *Agentic AI in companies* de Turín el 21 de noviembre de 2026 para un banco ficticio llamado Lumen Bank. Se trata de un fine-tuning de `urchade/gliner_multi_pii-v1`, un modelo GLiNER de tipo zero-shot NER, sobre 4.000 documentos bancarios italianos sintéticos y 3.000 filas del dataset público `gretelai/synthetic_pii_finance_multilingual`.

El modelo resuelve un problema concreto: la detección de PII en textos financieros con formatos muy específicos del dominio italiano (codice fiscale, partita IVA, IBAN, CIE, direcciones con CAP) antes de que el texto llegue a un LLM. En el pipeline de ALFRED se ejecuta en CPU con una latencia aproximada de 24 ms por documento, combinado con reglas deterministas (mod-97 para IBAN, validación de codice fiscale y partita IVA, Luhn para tarjetas, términos de salud) para maximizar la cobertura.

Su relevancia radica en dos factores: por un lado, la licencia Apache-2.0 y el despliegue en CPU lo hacen apto para entornos regulados on-premise; por otro, el autor publica métricas de recall comparativas frente a `openai/privacy-filter` en varios conjuntos de evaluación, incluyendo formatos bancarios difíciles y datos fuera de distribución. El modelo está orientado a inglés e italiano y su uso previsto es la pseudonimización previa a cualquier procesamiento con modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (NER zero-shot basado en transformer encoder; fine-tuning de `urchade/gliner_multi_pii-v1`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 1,2 GB; librería `gliner`) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER, una arquitectura de NER zero-shot que permite especificar las etiquetas de entidad en tiempo de inferencia mediante prompts de tipo texto, en lugar de depender de un conjunto fijo de clases entrenadas. El fine-tuning parte de `urchade/gliner_multi_pii-v1` y está especializado en etiquetas del dominio bancario italiano: person, tax code (codice fiscale), VAT number (partita IVA), IBAN, card number, email, phone, address, date of birth, identity document number, customer id y loan id.

Los datos de entrenamiento son 4.000 documentos bancarios italianos sintéticos (clientes ficticios generados con Faker) más 3.000 filas del dataset público `gretelai/synthetic_pii_finance_multilingual` (Apache-2.0). No se menciona el uso de RLHF, DPO ni el número total de tokens de entrenamiento. La innovación principal no está en la arquitectura sino en el enfoque de despliegue: el modelo se combina con reglas deterministas (validación mod-97 de IBAN, codice fiscale, partita IVA, CIE, direcciones con CAP, Luhn y términos de salud) antes de que el texto llegue a un LLM, lo que eleva el recall de caracteres PII hasta el 100% en documentos sintéticos retenidos.

## Capacidades

- Detección de entidades PII en texto: personas, codice fiscale, partita IVA, IBAN, números de tarjeta, email, teléfono, dirección, fecha de nacimiento, número de documento de identidad, customer id y loan id.
- NER zero-shot: las etiquetas se pasan en tiempo de inferencia mediante `predict_entities`, lo que permite adaptar el conjunto de entidades sin reentrenar.
- Procesamiento bilingüe inglés-italiano.
- Integración con reglas deterministas para validación de identificadores (mod-97, Luhn, formato de codice fiscale y partita IVA).
- Ejecución en CPU con latencia aproximada de 24 ms por documento, adecuada para pipelines previos a LLM.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente de token-classification.

## Casos de uso

- Pseudonimización previa a LLM en banca: el modelo detecta IBAN, codice fiscale, partita IVA y datos de cliente en documentos antes de enviarlos a un modelo generativo, reduciendo la exposición de datos personales en el pipeline.
- Cumplimiento del RGPD en entornos on-premise: al ejecutarse en CPU y con licencia Apache-2.0, puede desplegarse dentro de la infraestructura del banco sin depender de servicios externos, facilitando auditorías de tratamiento de datos.
- Redacción de expedientes de préstamo: detección de loan id, customer id, dirección y fecha de nacimiento en documentación de crédito para generar versiones redactadas antes de compartirlas con equipos no autorizados.
- Enmascaramiento en logs y tickets de soporte: el modelo puede procesar conversaciones y registros de atención al cliente para sustituir emails, teléfonos y números de tarjeta por pseudónimos antes del almacenamiento.
- Validación de identificadores fiscales italianos: combinado con las reglas deterministas del pipeline ALFRED, permite verificar codice fiscale y partita IVA además de detectarlos, útil en procesos de alta de clientes (KYC).
- Ensamblado con `openai/privacy-filter`: el autor recomienda el ensemble para formatos desconocidos, alcanzando un recall de 96,7–99,6% en los conjuntos evaluados; aplicable en procesos de migración de datos con formatos heterogéneos.
- Evaluación de privacidad en datasets sintéticos: sirve como herramienta de auditoría para comprobar si los datos sintéticos generados contienen PII residual antes de publicarlos.

## Benchmarks y rendimiento

Recall de caracteres PII (modelo + reglas) según la model card:

| Conjunto de evaluacion | Base GLiNER | Este modelo | OpenAI privacy-filter |
|---|---|---|---|
| Documentos bancarios sinteticos, held out (600) | 82,0% | 100% | 94,2% |
| Formatos bancarios dificiles (600) | 78,2% | 96,1% | 94,2% |
| Gretel finance test, fuera de distribucion (400) | 86,8% | 93,0% | 68,6% |
| Nemotron-PII finance (400) | 75,1% | 73,9% | 94,7% |
| ai4privacy it (300, solo eval) | 80,3% | 82,0% | 95,6% |
| ai4privacy en (300, solo eval) | 79,9% | 81,4% | 95,2% |

El autor indica que el ensemble con `openai/privacy-filter` (con fechas y URLs desactivadas) alcanza un recall de 96,7–99,6% en todos los conjuntos anteriores. No se publican resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- Inferencia en CPU: el autor reporta aproximadamente 24 ms por documento en el pipeline ALFRED, lo que permite despliegue sin GPU.
- VRAM estimada para GPU: no disponible; el repositorio ocupa 1,2 GB, por lo que debería caber en GPUs consumer con 4–8 GB de VRAM en precisión completa, aunque no se confirma oficialmente.
- GPUs recomendadas: no disponible; el caso de uso documentado es CPU.
- Despliegue: librería `gliner` (PyTorch) mediante `GLiNER.from_pretrained("223Harsh/alfred-pii-gliner")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: ~24 ms por documento en CPU según la model card; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Recall en formatos bancarios dificiles | Recall fuera de distribucion (Gretel) |
|---|---|---|---|---|---|
| 223Harsh/alfred-pii-gliner | GLiNER fine-tuned | en, it | Apache-2.0 | 96,1% | 93,0% |
| urchade/gliner_multi_pii-v1 (base) | GLiNER multi-PII | multi | no disponible en la informacion | 78,2% | 86,8% |
| openai/privacy-filter | Filtro de privacidad | en, it (evaluado) | no disponible en la informacion | 94,2% | 68,6% |

El modelo supera a su base en todos los conjuntos evaluados y a `openai/privacy-filter` en formatos bancarios difíciles y en el conjunto fuera de distribución de Gretel, aunque queda por debajo en Nemotron-PII finance y en ai4privacy. No se dispone de datos de otros modelos comparables de PII en la información proporcionada.

## Limitaciones y advertencias

- La pseudonimización no es anonimización: el mapeo de sustitución debe guardarse en una bóveda protegida y las salidas siguen siendo datos personales bajo el RGPD, según advierte el propio autor.
- El entrenamiento se basa en datos sintéticos (Faker) y datasets públicos; el rendimiento en documentos reales de clientes puede diferir del reportado.
- El recall cae al 73,9% en Nemotron-PII finance, por debajo de `openai/privacy-filter` (94,7%), lo que indica menor robustez en ese dominio.
- En ai4privacy it/en el modelo queda en 82,0% y 81,4% frente al 95,6% y 95,2% de `openai/privacy-filter`.
- Solo soporta inglés e italiano; no se documentan otros idiomas.
- Especializado en el dominio bancario italiano; los formatos de identificadores de otros países no están cubiertos por las reglas deterministas ni por los datos de entrenamiento.
- No se documentan sesgos específicos, pero al ser un modelo NER puede fallar en textos con errores ortográficos, formatos atípicos o abreviaturas no vistas.
- Riesgo de falsos positivos y negativos en la detección; el autor recomienda el ensemble con `openai/privacy-filter` para maximizar el recall en formatos desconocidos.
- No es un modelo generativo: no puede usarse para responder preguntas, razonar ni generar texto.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/223Harsh/alfred-pii-gliner
- Modelo base: https://huggingface.co/urchade/gliner_multi_pii-v1
- Repositorio del proyecto ALFRED: https://github.com/Harsh223/alfred
- Demo y arena de red-team: https://alfred.harsh.one
- Dataset Gretel finance: `gretelai/synthetic_pii_finance_multilingual` (Apache-2.0)
- Filtro de privacidad de OpenAI: `openai/privacy-filter`
