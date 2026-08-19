# BCCard/MoAI-Privacy-Filter

## Resumen

BCCard/MoAI-Privacy-Filter es un modelo de detección de información personal identificable (PII) para el dominio financiero, desarrollado por BC Card (empresa surcoreana de tarjetas de crédito). Se construye mediante fine-tuning completo de `openai/privacy-filter`, un modelo MoE de 1.400 millones de parámetros con 50 millones activos, sobre datos sintéticos de PII financiera en coreano e inglés. El modelo etiqueta 18 tipos de entidad PII (73 clases BIOES) a nivel de token, y está diseñado como capa NER de una pasarela de enmascaramiento PII multicapa situada delante de servicios de LLM, así como para auditorías de privacidad offline.

La relevancia actual del modelo radica en la creciente necesidad de proteger datos personales en aplicaciones de IA generativa, especialmente en sectores regulados como el financiero. Con una arquitectura eficiente (MoE con solo 50M de parámetros activos) y métricas de span-F1 superiores a 0.95 en validación, ofrece una solución práctica y ligera para el filtrado de PII en tiempo real. Su licencia Apache 2.0 facilita su adopción comercial.

El modelo se distribuye en formato safetensors (BF16) y existe una variante INT8 para ONNX Runtime, lo que permite despliegues en entornos con recursos limitados. La longitud de contexto está limitada a 768 tokens, por lo que entradas más largas deben trocearse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos, 8 capas, hidden size 640, atención bidireccional con bandas (±128), tokenizer o200k |
| Parametros totales | 1.399.512.505 (1,4B) |
| Parametros activos | 50 millones (50M) |
| Longitud de contexto | 768 tokens (entrenamiento; se recomienda trocear entradas más largas) |
| Tipos de cuantizacion | BF16 nativo; INT8 (weight-only) disponible como artefacto ONNX Runtime |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, con sinks de atención en FP32) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/privacy-filter`, un transformer MoE con 128 expertos y solo 50M de parámetros activos por token. La atención es bidireccional con bandas (±128 tokens), lo que permite capturar dependencias locales de forma eficiente. El tokenizer es o200k, compatible con el vocabulario de OpenAI.

El entrenamiento consistió en un fine-tuning completo de todos los parámetros (incluidos expertos y router) sobre datos sintéticos de PII financiera. La cabeza de clasificación se re-inicializó con 73 clases (18 entidades × 4 etiquetas BIOES + clase O), copiando filas de la cabeza base mediante un mapeo de taxonomía. Los datos provienen de `BCCard/pii-masking-openpii-finance`, que combina los datasets openpii (1,5M filas en ko y en) con filas sintéticas locales del dominio financiero (tarjetas, cuentas, identificaciones nacionales, etc.).

La decodificación emplea un Viterbi restringido sobre la gramática de transiciones BIOES, en lugar de argmax por token, lo que garantiza secuencias de etiquetas válidas. Se incluye un archivo `viterbi_calibration.json` que permite ajustar el equilibrio precisión/recall sin reentrenar.

## Capacidades

- Detección de PII a nivel de token con 18 tipos de entidad: PERSON, RRN, FRN, CARD_NUMBER, ACCOUNT_NUMBER, SECRET, USER_ID, EMAIL, PHONE, PASSPORT, DRIVER_LICENSE, GENERIC_ID, ADDRESS, ZIPCODE, DATE, CARD_EXPIRY, CVC, IPIN.
- Soporte bilingüe coreano e inglés, con etiquetas específicas para el contexto surcoreano (RRN, FRN, IPIN, CARD_EXPIRY, CVC, SECRET).
- Decodificación BIOES restringida mediante Viterbi, que evita secuencias de etiquetas inválidas.
- Mapeo de offsets de caracteres para enmascaramiento directo en el texto original.
- Calibración de precisión/recall mediante sidecar JSON sin necesidad de reentrenamiento.
- Compatible con pipelines de transformers para token-classification.
- Adecuado para integración como capa de filtrado previa a LLMs o para auditoría offline de privacidad.

## Casos de uso

- Pasarela de enmascaramiento PII antes de LLMs: el modelo detecta y enmascara datos personales en las consultas de los usuarios antes de que lleguen a un modelo generativo, reduciendo el riesgo de fuga de información. Su baja latencia (50M parámetros activos) permite procesamiento en tiempo real.
- Auditoría de privacidad offline: análisis de logs, documentos y bases de datos almacenadas para identificar PII no protegida, facilitando el cumplimiento de normativas como GDPR o la Ley de Protección de Información Personal de Corea.
- Redacción automática de documentos financieros: extracción y enmascaramiento de números de tarjeta, cuentas bancarias, RRN y otros datos sensibles en contratos, extractos o comunicaciones internas.
- Cumplimiento normativo en atención al cliente: revisión de transcripciones de conversaciones para verificar que no se almacenen datos PII sin consentimiento.
- Detección de credenciales filtradas: identificación de contraseñas, API keys o tokens (clase SECRET) en repositorios, tickets o chats internos.
- Análisis de sentimiento o minería de texto con privacidad: preprocesamiento de textos financieros para eliminar PII antes de aplicar modelos de análisis, preservando la utilidad de los datos no sensibles.
- Soporte a equipos de seguridad de la información: integración en pipelines de Data Loss Prevention (DLP) para monitorizar la exfiltración de datos personales.

## Benchmarks y rendimiento

El modelo reporta métricas sobre un conjunto de validación retenido y un Golden Set adversario independiente:

| Conjunto | Span-F1 (ko) | Span-F1 (en) | Cobertura de enmascaramiento (ko) | Cobertura de enmascaramiento (en) |
|---|---|---|---|---|
| Validación retenida | 0,956 | 0,969 | no disponible | no disponible |
| Golden Set adversario | 0,944 | 0,907 | 0,996 | 0,998 |

La cobertura de enmascaramiento indica el porcentaje de caracteres PII dorados cubiertos por los tramos predichos (≥99,5%). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con BF16, los pesos del modelo ocupan aproximadamente 2,8 GB; añadiendo overhead de activaciones y atención (secuencias de hasta 768 tokens), se estima un consumo total de 3,5-4 GB. En FP32, ~5,6 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1660 Super, RTX 2060, RTX 3050). Para despliegues de alto rendimiento, se recomienda A10, A100 o H100.
- Es adecuado para GPU de consumo (RTX 3060, RTX 4070, etc.) gracias a su tamaño compacto y al modo MoE con 50M de parámetros activos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (variante INT8 disponible en `BCCard/MoAI-Privacy-Filter-INT8`), o servidores de inferencia como TGI (Text Generation Inference) o vLLM (aunque no es un modelo generativo, puede servirse como pipeline de clasificación).
- Latencia y throughput estimados: no se han publicado datos concretos. Dado el bajo número de parámetros activos, se espera una latencia de pocos milisegundos por secuencia en GPU modernas.

## Comparativa con modelos similares

No se han publicado comparativas formales con otros modelos de detección de PII. El modelo base `openai/privacy-filter` es un NER genérico multilingüe; este fine-tuning lo especializa en el dominio financiero coreano/inglés con una taxonomía ampliada. Otras alternativas comunes para PII incluyen:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BCCard/MoAI-Privacy-Filter | 1,4B (50M activos) | 768 tokens | ko, en | Apache 2.0 | Especializado en finanzas, 18 entidades |
| openai/privacy-filter | 1,4B (50M activos) | 768 tokens | multilingüe | Apache 2.0 | NER genérico, menos entidades |
| dslim/bert-base-NER | 110M | 512 tokens | en | MIT | NER genérico, solo 4 entidades |

La comparativa es orientativa; no hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Longitud de contexto limitada a 768 tokens: entradas más largas deben trocearse, lo que puede fragmentar entidades que cruzan los límites de los fragmentos.
- Solo soporta coreano e inglés; no cubre otros idiomas.
- La decodificación debe realizarse con Viterbi restringido; el argmax por token puede producir secuencias de etiquetas inválidas.
- El modelo está entrenado principalmente con datos sintéticos; puede tener un rendimiento inferior en textos reales muy diferentes del dominio financiero.
- Riesgo de alucinación o falsos positivos en entidades poco frecuentes (por ejemplo, CVC o IPIN) si no aparecen en el contexto esperado.
- La cobertura de enmascaramiento es alta, pero no perfecta; se recomienda una capa de respaldo basada en expresiones regulares para entidades totalmente estructuradas (como números de tarjeta).
- No es un modelo generativo; solo produce etiquetas de clasificación, no texto enmascarado.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que los datos de entrenamiento no contengan información personal real (los autores indican que son sintéticos, pero no se proporciona una auditoría externa).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BCCard/MoAI-Privacy-Filter
- Variante INT8 (ONNX Runtime): https://huggingface.co/BCCard/MoAI-Privacy-Filter-INT8
- Dataset de entrenamiento: https://huggingface.co/datasets/BCCard/pii-masking-openpii-finance
- Modelo base: https://huggingface.co/openai/privacy-filter
- Organización en GitHub: https://github.com/bccard-ai
- Sitio web de BC Card AI: https://moai.bccard.ai/
