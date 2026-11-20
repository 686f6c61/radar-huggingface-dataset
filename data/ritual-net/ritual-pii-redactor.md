# Ritual-Net/ritual-pii-redactor

## Resumen

Ritual-pii-redactor es un modelo de clasificación de tokens (token classification) especializado en la detección y el etiquetado de información personal identificable (PII) y de secretos criptográficos en texto multilingüe. Lo desarrolla Ritual-Net como un ajuste fino (finetune) del modelo `praveen-ritual/pii-redactor`, del que hereda la arquitectura, la cabeza de clasificación y el esquema de 15 etiquetas BIO, sin añadir ni renombrar ninguna.

El problema que resuelve es concreto: los modelos genéricos de detección de PII tienden a marcar como sensibles campos públicos de cadena de bloques (direcciones de wallet, hashes de transacción, chain IDs, gas, comisiones) y, al mismo tiempo, fallan al detectar secretos reales como mnemónicos de wallet, claves privadas hexadecimales, ciphertext de keystore, URLs de RPC con credenciales, claves de pago o bearer tokens. Este finetune corrige ambos comportamientos: eleva el recall de secretos de 0,0145 a 0,7397 y el recall de PII personal de 0,8118 a 0,9963, manteniendo intactos los campos públicos de cadena (0 fallos de pass-through sobre 3656 spans comprobados).

Arquitectónicamente es un transformer tipo BERT con 117.517.855 parámetros totales, publicado en safetensors y con un grafo ONNX (opset 17, INT8 weight-only) para despliegue en producción. La relevancia actual está en pipelines de agentes y LLM que manejan payloads HTTP y cuerpos de ejecución con datos sensibles, donde la redacción selectiva —redactar lo secreto, dejar pasar lo público— es un requisito de seguridad operativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (token classification) |
| Parámetros totales | 117.517.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 weight-only (ONNX), safetensors en precisión original |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con cabeza de clasificación de tokens y esquema BIO de 15 etiquetas, heredado íntegramente del modelo base `praveen-ritual/pii-redactor` (revisión `31e8958581e837a3de46d40ae10f403fff451ad7`). El finetune se realizó en dos fases: una primera a learning rate 1e-5 (`configs/ritual_a.toml`) que superó las puertas de recall de secretos y PII personal, y una segunda publicada a learning rate 5e-06, 1 época, peso de la etiqueta `O` de 1.0, 30.000 documentos de replay extraídos del split de entrenamiento del padre, 4.000 documentos específicos de Ritual y 8.000 documentos adicionales que colocan chain IDs, hashes y direcciones junto a PII real. Semilla 20261119.

Los pesos publicados se ajustan (snap) a una rejilla INT8 de grupo 2 para que el grafo ONNX coincida exactamente con ellos. El ONNX es opset 17, INT8 weight-only, con entradas `input_ids` y `attention_mask` y salida `logits`. La validación de cuantización reporta 0 discrepancias de span HTTP entre INT8 y PyTorch sobre 400 casos, frente a 46 de 400 con QInt8 dinámico per-channel de ORT. Las puertas de calidad (all_pii_recall, general_f1_drop_at_most_0_01, pass_through, personal_recall, secret_recall) se superaron todas.

## Capacidades

- Clasificación de tokens para PII: detección de PERSON, CONTACT, ADDRESS y NETWORK_ID con recall de 0,9963 en el conjunto de evaluación Ritual.
- Detección de secretos: mnemónicos de wallet, claves privadas hexadecimales, ciphertext de keystore, URLs de RPC con credenciales, claves de pago y bearer tokens, etiquetados como SECRET con recall de 0,7397.
- Pass-through selectivo: direcciones de wallet, hashes de transacción, hashes de bloque, chain IDs, gas, comisiones, símbolos de token, precompilados y URLs públicas sin credenciales permanecen sin etiquetar (0 fallos sobre 3656 spans públicos).
- Detección de PII dentro de cuerpos HTTP estilo executor y cuerpos de LLM.
- Capacidad multilingüe declarada por el autor.
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es exclusivamente un modelo de etiquetado.

## Casos de uso

- Redacción en pipelines de agentes LLM: el modelo se interpone entre el agente y las herramientas para etiquetar secretos y PII en los cuerpos de las peticiones antes de que se registren o se reenvíen, dejando pasar sin tocar los campos públicos de cadena.
- Sanitización de logs de RPC y nodos: procesa payloads HTTP con URLs de RPC, claves de pago y bearer tokens, redactando credenciales mientras preserva direcciones y hashes necesarios para la depuración.
- Cumplimiento de privacidad en atención al cliente: etiqueta PERSON, CONTACT y ADDRESS en transcripciones multilingües para anonimizar antes del almacenamiento.
- Protección de secretos en repositorios y configuración: detección de mnemónicos y claves privadas hex en ficheros de configuración o volcados de entorno antes de commit o de envío a terceros.
- Filtrado previo en datasets de entrenamiento: aplica el modelo sobre corpus para eliminar PII real y secretos antes de usarlos en entrenamiento, con la ventaja de que no elimina identificadores públicos de cadena.
- Pasarela de seguridad en API gateways: despliegue del grafo ONNX INT8 para inspección de baja latencia por petición, con paridad verificada frente a PyTorch (0 discrepancias en 400 casos).
- Auditoría de keystores y material criptográfico: detección de ciphertext de keystore y claves privadas en volcados para alertar sobre exposición accidental.

## Benchmarks y rendimiento

Resultados medidos sobre los mismos documentos para el modelo padre y el candidato:

| Comprobación | pii-redactor | ritual-pii-redactor |
|---|---:|---:|
| Recall de SECRET en eval Ritual | 0,0145 | 0,7397 |
| Recall de PII personal (PERSON, CONTACT, ADDRESS, NETWORK_ID) | 0,8118 | 0,9963 |
| Recall de toda la PII | 0,4695 | 0,8860 |
| Micro F1 en eval Ritual | 0,4485 | 0,8497 |
| Micro F1 de PII general intacta | 0,9191 | 0,9328 |
| Caída de micro F1 en PII general | — | -0,0136 |
| Campos públicos de cadena que no pasaron | — | 0 |

Por fichero de evaluación retenido:

| Fichero | Micro F1 padre | Micro F1 candidato | Documentos |
|---|---:|---:|---:|
| eval_gretel_en.jsonl | 0,9121 | 0,9155 | 5000 |
| eval_gretel_finance.jsonl | 0,7443 | 0,7898 | 5295 |
| eval_nemotron.jsonl | 0,9293 | 0,9414 | 100000 |
| eval_openpii.jsonl | 0,8920 | 0,8977 | 4000 |

Conteos absolutos: SECRET padre 12 verdaderos positivos sobre 826 (recall 0,0145); candidato 611 sobre 826 (0,7397). PII personal padre 884 sobre 1089 (0,8118); candidato 1085 sobre 1089 (0,9963). Toda la PII: padre tp 902, fp 1199, fn 1019; candidato tp 1702, fp 383, fn 219. PII general: padre tp 780929, fp 98634, fn 38775; candidato tp 775710, fp 67811, fn 43994.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (117,5 M de parámetros) y en torno a 0,15-0,2 GB en INT8 weight-only.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, T4 y L4 son sobredimensionadas para este modelo, que está limitado por latencia más que por memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660) e incluso en CPU para cargas por lotes.
- Opciones de despliegue: transformers (safetensors), ONNX Runtime con el grafo INT8 incluido, y servidores compatibles con endpoints (el modelo está marcado como `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. La paridad INT8 frente a PyTorch está verificada (0 discrepancias en 400 spans HTTP).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ritual-pii-redactor | 117,5 M | no disponible | Token classification PII + secretos | Apache 2.0 | Hugging Face |
| praveen-ritual/pii-redactor (padre) | no disponible | no disponible | Token classification PII | no disponible | Hugging Face |
| Modelos NER multilingües genéricos (p. ej. variantes de BERT/XLM-R para NER) | variable | no disponible | NER general | variable | Hugging Face |

Frente a su modelo padre, ritual-pii-redactor mejora el recall de secretos en 0,7252 puntos absolutos y el de PII personal en 0,1845, con una caída de solo 0,0136 en micro F1 de PII general. No se dispone de datos de benchmarks frente a alternativas NER genéricas en la información proporcionada.

## Limitaciones y advertencias

- Los documentos adicionales de entrenamiento se generan a partir de formas de payload públicas; no son tráfico real.
- Las filas de replay proceden del split de entrenamiento del padre; los splits de validación y test del padre no se usaron en este finetune.
- Las direcciones y hashes de cadena se tratan como no-PII únicamente en las formas generadas que comprueban las puertas; en otros contextos podrían ser identificativas.
- El ajuste a la rejilla INT8 puede mover una frontera de baja confianza; las métricas de las puertas corresponden a los pesos publicados ya ajustados.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; el recall de SECRET es 0,7397, por lo que aproximadamente una cuarta parte de los secretos del conjunto de evaluación no se detecta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es de terceros y no se detalla su licencia en la información disponible.
- No se especifica la longitud máxima de contexto soportada, lo que limita la planificación de despliegue en documentos largos.
- El modelo no genera texto ni razona: cualquier uso como LLM es un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/Ritual-Net/ritual-pii-redactor
- Modelo base: https://huggingface.co/praveen-ritual/pii-redactor
- Revisión del modelo base: `31e8958581e837a3de46d40ae10f403fff451ad7`
- Repositorio, paper o demo adicionales: no disponibles en la información proporcionada.
