# altslate/indic-pii-redactor-base

## Resumen

Indic PII Redactor (base) es un modelo de clasificación de tokens desarrollado por altslate, un autor independiente, especializado en detectar y permitir redactar datos personales de origen indio en textos escritos en inglés, hindi, hinglish, maratí, bengalí, tamil, telugu, guyaratí y canarés. Con 307 millones de parámetros, se construye sobre el modelo base jhu-clsp/mmBERT-base y resuelve un problema concreto: la fuga de información personal sensible (Aadhaar, PAN, GSTIN, UPI, cuentas bancarias, documentos oficiales) antes de registrar textos, enviarlos a analíticas o pasarlos a un LLM.

El modelo cubre 16 tipos de entidad, reconoce dígitos en escrituras nativas (bengalí, tamil, etc.) y está entrenado para no marcar números que se parecen a identificadores pero no lo son, como pedidos, facturas, UTR, PNR u OTP. Su licencia Apache 2.0 y su tamaño contenido lo hacen apto para despliegue en producción y en entornos con requisitos de privacidad estrictos.

Es relevante ahora porque el ecosistema de modelos abiertos carece de herramientas específicas para PII india multilingüe: la mayoría de detectores están centrados en inglés o en PII occidental. Este modelo ofrece una alternativa ligera (307M) con pesos en safetensors y ONNX, lo que facilita su integración en pipelines de redacción previos a cualquier procesamiento con LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-base) |
| Parámetros totales | 307.555.617 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX fp32 (1.2 GB), ONNX int8 dinámico (309 MB); safetensors fp32 |
| Idiomas soportados | en, hi, mr, bn, ta, te, gu, kn (más hinglish) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (mmBERT-base) adaptado a clasificación de tokens (token-classification) con 16 etiquetas de entidad PII. La arquitectura base mmBERT está diseñada para multilingüismo, lo que explica la cobertura de ocho idiomas indios además del inglés. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque la model card indica que los datos de evaluación proceden de mensajes realistas generados con Qwen3.8-27B en torno a valores PII falsos, y que los generadores de formato de identificadores usados en test coinciden con los de entrenamiento (caveat declarado por el autor).

El entrenamiento incluye ejemplos negativos explícitos de números que se parecen a PII pero no lo son (pedidos, facturas, UTR, PNR, OTP, líneas de ayuda, números de seguimiento y pólizas), lo que reduce falsos positivos. No se menciona RLHF ni DPO; es un modelo supervisado de etiquetado de secuencias. La innovación destacable es la cobertura de dígitos y nombres en escrituras nativas y la inclusión de formas enmascaradas de Aadhaar (por ejemplo `XXXX XXXX 1234`) y VID de 16 dígitos.

## Capacidades

- Detección de 16 tipos de PII: AADHAAR (incluidas formas enmascaradas y VID), PAN, GSTIN, IFSC, UPI_ID, BANK_ACCOUNT, PHONE, VOTER_ID, PASSPORT, DRIVING_LICENCE, VEHICLE_REG, PINCODE, PERSON, ADDRESS, EMAIL y DATE_OF_BIRTH.
- Reconocimiento de dígitos en escrituras nativas (bengalí, tamil, etc.) y nombres y direcciones en escrituras índicas.
- Discriminación de números que se parecen a PII pero no lo son: pedidos, facturas, tickets, UTR, PNR, OTP, líneas de ayuda, seguimiento y pólizas.
- Clasificación de tokens con etiquetas B-/I- y agregación de entidades para obtener spans (inicio, fin, etiqueta).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: inglés, hindi, hinglish, maratí, bengalí, tamil, telugu, guyaratí y canarés.
- Capacidad especial: redacción previa a logging, analítica o envío a LLM; salida compatible con ONNX Runtime y transformers.js.

## Casos de uso

- Redacción previa a logging: interceptar mensajes de usuario y sustituir entidades PII por etiquetas (`[AADHAAR]`, `[PHONE]`) antes de escribir en logs, evitando cumplir con requisitos de privacidad en sistemas de producción.
- Anonimización antes de enviar a un LLM: limpiar textos de clientes indios antes de pasarlos a un modelo generativo, reduciendo el riesgo de fuga de datos personales a APIs externas.
- Cumplimiento normativo en fintech: detectar Aadhaar, PAN, cuentas bancarias y UPI en comunicaciones y tickets de soporte para cumplir con la normativa india de protección de datos (DPDP Act) y evitar almacenar identificadores sensibles.
- Análisis de conversaciones de atención al cliente: procesar transcripciones multilingües (hindi, tamil, bengalí, etc.) y enmascarar nombres, direcciones y teléfonos antes de alimentar dashboards de analítica.
- Preprocesamiento para datasets de investigación: anonimizar corpus en ocho idiomas indios antes de publicarlos o compartirlos, preservando la estructura del texto y las etiquetas de entidad.
- Moderación y revisión de contenido: detectar PII en publicaciones o mensajes de una plataforma para aplicar políticas de privacidad y evitar la exposición pública de datos personales.
- Integración en navegador o edge: usar la versión ONNX int8 (309 MB) con transformers.js para redactar PII en el cliente antes de enviar datos al servidor.

## Benchmarks y rendimiento

Resultados en test de seis idiomas (1.427 mensajes: maratí, bengalí, tamil, telugu, guyaratí, canarés; 197 sin PII). Las columnas de idioma son recall.

| Modelo | Parámetros | Recall | Precision | FA sin PII | bn | gu | kn | mr | ta | te |
|---|---|---|---|---|---|---|---|---|---|---|
| altslate/indic-pii-redactor-base | 307M | 0.967 | 0.989 | 13.7% | 0.978 | 0.953 | 0.967 | 0.987 | 0.968 | 0.949 |
| Horizon-Labs/pii-redactor-base | 308M | 0.926 | 0.943 | 85% | 0.953 | 0.923 | 0.943 | 0.953 | 0.910 | 0.872 |
| Horizon-Labs/pii-redactor-small | 141M | 0.886 | 0.938 | 89% | 0.882 | 0.876 | 0.913 | 0.949 | 0.879 | 0.812 |
| altslate/indic-pii-redactor-small | 141M | 0.797 | 0.978 | 37% | 0.807 | 0.797 | 0.803 | 0.872 | 0.762 | 0.737 |
| urchade/gliner_multi_pii-v1 (0.5) | ~280M | 0.536 | 0.910 | 22% | 0.543 | 0.586 | 0.581 | 0.564 | 0.480 | 0.466 |

Resultados en test de inglés, hindi y hinglish (1.954 mensajes):

| Modelo | Parámetros | Recall | Precision | FA sin PII | Recall hindi |
|---|---|---|---|---|---|
| altslate/indic-pii-redactor-small | 141M | 0.995 | 0.995 | 2.6% | 0.991 |
| altslate/indic-pii-redactor-base | 307M | 0.991 | 0.992 | 1.5% | 0.993 |
| Horizon-Labs/pii-redactor-base | 308M | 0.945 | 0.949 | 94% | 0.938 |
| Horizon-Labs/pii-redactor-small | 141M | 0.936 | 0.954 | 83% | 0.936 |
| urchade/gliner_multi_pii-v1 (0.5) | ~280M | 0.830 | 0.908 | 44% | 0.626 |

Resultados por runtime en dev (PyTorch, ONNX fp32, ONNX int8):

| Runtime | en/hi/Hinglish dev (500): recall / precision / FA sin PII | seis idiomas dev (300): recall / precision / FA sin PII |
|---|---|---|
| PyTorch | 0.991 / 0.995 / 1.4% | 0.978 / 0.995 / 6.5% |
| ONNX fp32 | 0.991 / 0.995 / 1.4% | 0.978 / 0.995 / 6.5% |
| ONNX int8 | 0.990 / 0.994 / 1.4% | 0.965 / 0.993 / 9.7% |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fp32 (307M parámetros) requiere aproximadamente 1.2-1.5 GB; la versión ONNX int8 (309 MB) puede ejecutarse en CPU con requisitos mínimos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también funciona en CPU para la versión int8.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; la versión int8 puede ejecutarse en CPU.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js (`@huggingface/transformers` 4.3.2, Node 22, `dtype: "q8"`), vLLM no aplica (no es un modelo generativo), llama.cpp/Ollama no aplican (no hay GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall (6 idiomas) | FA sin PII (6 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| altslate/indic-pii-redactor-base | 307M | no disponible | 0.967 | 13.7% | apache-2.0 | Hugging Face |
| Horizon-Labs/pii-redactor-base | 308M | no disponible | 0.926 | 85% | no disponible | Hugging Face |
| altslate/indic-pii-redactor-small | 141M | no disponible | 0.797 | 37% | apache-2.0 | Hugging Face |
| urchade/gliner_multi_pii-v1 | ~280M | no disponible | 0.536 | 22% | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, el riesgo se traduce en falsos positivos y falsos negativos; la tasa de falsos positivos en mensajes sin PII es del 13.7% en el test de seis idiomas y del 1.5% en inglés/hindi/hinglish.
- Limitación de contexto: no se especifica la longitud máxima de contexto; conviene validar secuencias largas antes de producción.
- Limitación de idioma: cubre ocho idiomas indios e inglés; no cubre otras lenguas.
- Caveat declarado por el autor: los valores de identificadores en los mensajes de test proceden de los mismos generadores de formato usados en entrenamiento, lo que puede inflar ligeramente las métricas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (jhu-clsp/mmBERT-base).
- Caveat para producción: la mayoría de falsos positivos en el test de seis idiomas son números de pedido o referencia de 6 dígitos interpretados como PIN codes; algunos mensajes sin PII contienen nombres que el generador añadió sin etiqueta.

## Enlaces

- Hugging Face: https://huggingface.co/altslate/indic-pii-redactor-base
- Modelo small relacionado: https://huggingface.co/altslate/indic-pii-redactor-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- GLiNER multi PII (comparativa): https://huggingface.co/urchade/gliner_multi_pii-v1
