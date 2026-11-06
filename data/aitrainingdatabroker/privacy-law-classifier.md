# aitrainingdatabroker/privacy-law-classifier

## Resumen

Privacy Law Classifier es un modelo de clasificación de texto desarrollado por AI Training Data Broker, un bróker y asesor técnico especializado en la venta y licencia de datos empresariales a laboratorios de IA. El modelo resuelve un problema muy concreto del flujo de preparación de datos: dado un fragmento de texto sobre registros corporativos (notas, tickets, comentarios de revisión), identificar a cuál de 21 marcos legales de privacidad y compliance apunta con mayor probabilidad, desde HIPAA y GDPR hasta ITAR, FCRA o secreto comercial.

Técnicamente es un fine-tuning de `distilroberta-base`, un transformer encoder de 82,1 millones de parámetros, entrenado durante 6 épocas en una única RTX 3070 sobre un dataset sintético de 1.256 filas. No es un modelo generativo ni un asistente legal: actúa como un router de revisión que enruta cada registro hacia el checklist y el asesor legal adecuados.

Su relevancia actual radica en el auge de la licencia de datos para entrenamiento de IA, donde determinar bajo qué régimen regulatorio cae cada conjunto de datos es el primer paso obligatorio antes de compartirlo. El modelo se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,3 GB y compatibilidad con text-embeddings-inference y endpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, variante destilada) |
| Parámetros totales | 82.134.549 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilroberta-base`, una versión destilada de RoBERTa con 6 capas y 82 millones de parámetros, y se fine-tunea como clasificador de 21 clases. El entrenamiento se realizó durante 6 épocas en una sola GPU RTX 3070, sobre el dataset `aitrainingdatabroker/data-compliance-frameworks`, compuesto por 1.256 filas totalmente sintéticas: todos los nombres, números y direcciones son inventados y no provienen de personas, pacientes, clientes o empresas reales.

No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador encoder. La innovación técnica es limitada por diseño: se trata de un fine-tuning estándar de clasificación de secuencias, y el autor publica los scripts de generación de datos, entrenamiento y evaluación en el directorio `source/` del repositorio, junto con los resultados completos en `scores.json`.

## Capacidades

- Clasificación de texto multietiqueta restringida a una etiqueta por frase, sobre 21 marcos regulatorios.
- Cobertura de marcos de privacidad y compliance: HIPAA, 42 CFR Part 2, CCPA y CPRA, otras leyes estatales de EE. UU., GDPR, UK GDPR, PIPEDA y Quebec Law 25, GLBA y FTC Safeguards Rule, FCRA, COPPA, PCI DSS, CAN-SPAM, Fair Housing Act, Driver's Privacy Protection Act, ITAR y EAR, CUI y DFARS, GINA, 21 CFR Part 11, privilegio abogado-cliente, confidencialidad contractual y NDAs, y protección de secreto comercial.
- Salida de puntuaciones top-k para revisión humana (se recomienda usar las primeras puntuaciones, no solo la primera).
- Detección basada en vocabulario: reacciona a términos clave característicos de cada marco regulatorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Triaje de registros antes de una licencia de datos: el modelo clasifica notas, tickets y comentarios de revisión por el marco legal que plantean, de modo que el checklist correcto y el asesor legal adecuado reciban cada registro. Es adecuado porque reduce el volumen de revisión manual a los casos de mayor riesgo.
- Detección de datos de salud en texto libre: frases que mencionan historiales de pacientes o códigos clínicos se enrutan hacia HIPAA o 42 CFR Part 2, lo que permite activar los protocolos de de-identificación correspondientes antes de compartir el dataset.
- Identificación de datos de tarjetas en notas de soporte: el modelo detecta referencias a datos de tarjetahabiente y códigos CVV y las enruta a PCI DSS, útil en auditorías internas de repositorios de texto libre.
- Cumplimiento de exportación: dibujos técnicos y notas con terminología controlada se clasifican hacia ITAR/EAR o CUI/DFARS, lo que ayuda a separar material sujeto a control de exportación antes de cualquier cesión.
- Gestión de datos de clientes europeos: textos que mencionan clientes de la UE se enrutan a GDPR o UK GDPR para aplicar el régimen de anonimización correspondiente, con la advertencia de que estas dos clases son las que más confunde.
- Revisión de cribado de inquilinos y crédito: notas sobre screening de inquilinos o informes de crédito se clasifican hacia Fair Housing Act o FCRA, lo que permite verificar el cumplimiento antes de reutilizar esos registros.
- Enrutamiento de comunicaciones comerciales: correos y campañas se clasifican hacia CAN-SPAM para revisar el cumplimiento de las comunicaciones de marketing antes de su inclusión en un dataset.

## Benchmarks y rendimiento

Resultados sobre 471 filas de test reservadas: accuracy 0,93 y macro F1 0,936.

| Etiqueta | F1 | Muestras |
|---|---|---|
| 21 CFR Part 11 | 1.0 | 24 |
| 42 CFR Part 2 | 1.0 | 24 |
| Attorney-client privilege and professional conduct rules | 0.95 | 21 |
| CAN-SPAM | 0.865 | 21 |
| CCPA and CPRA | 0.8 | 21 |
| COPPA | 1.0 | 21 |
| CUI and DFARS | 0.913 | 21 |
| Contractual confidentiality and NDAs | 0.95 | 21 |
| Driver's Privacy Protection Act | 1.0 | 21 |
| FCRA | 1.0 | 24 |
| Fair Housing Act | 1.0 | 21 |
| GDPR | 0.685 | 27 |
| GINA | 1.0 | 21 |
| GLBA and the FTC Safeguards Rule | 0.976 | 21 |
| HIPAA | 0.966 | 30 |
| ITAR and EAR | 0.906 | 24 |
| Other US state privacy laws | 0.941 | 18 |
| PCI DSS | 0.957 | 24 |
| PIPEDA and Quebec Law 25 | 0.909 | 21 |
| Trade secret protection | 0.909 | 24 |
| UK GDPR | 0.923 | 21 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (82 millones de parámetros); en la práctica cabe en cualquier GPU consumer, incluida una GTX 1650 o incluso en CPU.
- GPU recomendadas: ninguna en particular; una RTX 3070 fue suficiente para el entrenamiento completo en 6 épocas.
- Cabe en cualquier GPU consumer y en CPU; el cuello de botella es el throughput, no la memoria.
- Opciones de despliegue: pipeline de `transformers`, text-embeddings-inference, endpoints compatibles, y exportación a ONNX si se requiere.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privacy Law Classifier | 82,1 M | no disponible | Clasificación de 21 marcos legales | Apache 2.0 | Hugging Face |
| distilroberta-base (base) | 82,1 M | 512 tokens | Modelo base de lenguaje enmascarado | Apache 2.0 | Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre clasificadores comparables de compliance legal en la documentación proporcionada.

## Limitaciones y advertencias

- Una etiqueta por frase: los registros reales suelen caer bajo varios marcos a la vez (por ejemplo, el número de tarjeta de un paciente de la UE); se recomienda usar las primeras puntuaciones, no solo la primera.
- Entrenado sobre frases inventadas construidas a partir de los términos clave de cada regla, por lo que reacciona al vocabulario: una frase que describe datos de salud sin palabras de salud puede pasarse por alto.
- GDPR y UK GDPR, así como CCPA y otras leyes estatales de EE. UU., comparten la mayor parte del vocabulario y son las clases que más confunde (F1 de 0,685 en GDPR y 0,8 en CCPA/CPRA).
- El modelo no constituye asesoramiento legal ni certificación: determinar si un método de de-identificación cumple HIPAA Safe Harbor o Expert Determination, la anonimización bajo CCPA/CPRA, GDPR o UK GDPR, PIPEDA o Quebec Law 25 es una cuestión para el asesor legal y, cuando la norma lo exige, para un experto cualificado.
- Una persona debe revisar la salida antes de compartir cualquier dato.
- Entrenado únicamente en inglés; no cubre textos en castellano ni en otros idiomas.
- Dataset de entrenamiento pequeño (1.256 filas) y sintético, lo que limita la generalización a vocabulario real de producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor solicita atribución a AI Training Data Broker con enlace a su web al compartir o construir sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/privacy-law-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/aitrainingdatabroker/data-compliance-frameworks
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Reglas de privacidad por región antes de vender datos a IA: https://aitrainingdatabroker.com/regions/
- Datos de-identificados bajo CCPA frente a datos anónimos bajo GDPR: https://aitrainingdatabroker.com/blog/de-identified-data-under-ccpa-vs-anonymous-data-under-gdpr/
- Web del autor: https://aitrainingdatabroker.com/
