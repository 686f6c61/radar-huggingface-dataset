# praveen-ritual/ritual-pii-redactor

## Resumen

ritual-pii-redactor es un modelo de clasificación de tokens (token-classification) especializado en la detección y redacción de información personal identificable (PII) y secretos criptográficos en texto. Lo desarrolla el usuario praveen-ritual y se publica como un finetune del modelo base `praveen-ritual/pii-redactor`, del que hereda la arquitectura BERT, la cabeza de clasificación y las 15 etiquetas BIO, sin añadir ni renombrar ninguna.

El modelo resuelve un problema concreto: los pipelines de agentes y ejecutores que procesan cuerpos HTTP y prompts de LLM necesitan distinguir entre datos sensibles que deben redactarse (mnemónicos de wallet, claves privadas hex, ciphertext de keystore, URLs RPC con credenciales, claves de pago, bearer tokens, datos personales) y datos públicos de cadena que deben pasar intactos (direcciones de wallet, hashes de transacción, block hashes, chain IDs, gas, fees, símbolos de token, precompiles y URLs sin credenciales). El finetune enseña exactamente esa frontera.

Es relevante ahora porque los modelos publicados tienen 117,5 millones de parámetros, licencia Apache 2.0, pesos en safetensors y ONNX, y un conjunto de gates verificados sobre 3.656 spans públicos con cero fallos de pass-through. La comparativa contra el modelo padre muestra una mejora sustancial en recall de secretos (de 0,0145 a 0,7397) manteniendo prácticamente intacto el rendimiento en PII general (micro F1 de 0,9191 a 0,9328).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, token-classification) |
| Parámetros totales | 117.517.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 weight-only (grupo 2) para ONNX; safetensors en precisión original |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 17, INT8 weight-only) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT con cabeza de clasificación de tokens y esquema BIO de 15 etiquetas, idéntico al del modelo padre `praveen-ritual/pii-redactor` (revision `31e8958581e837a3de46d40ae10f403fff451ad7`). No se añadieron ni renombraron etiquetas. El checkpoint publicado continúa desde un primer finetune a learning rate 1e-5 (`configs/ritual_a.toml`); ese primer run superó los gates de recall de secretos y personales y subió el micro F1 general, pero aún redactaba 96 de 3.656 spans públicos de cadena.

El segundo run, que es el publicado, usa learning rate 5e-06, 1 epoch, peso de etiqueta `O` de 1.0, 30.000 documentos de replay procedentes del split de entrenamiento del padre, 4.000 documentos ritual y 8.000 documentos extra que colocan chain IDs, hashes y direcciones junto a PII real. Semilla 20261119. Los pesos publicados se ajustan ("snapped") a una rejilla INT8 de grupo 2 para que el grafo ONNX coincida con ellos; el ONNX es opset 17 weight-only INT8 con entradas `input_ids` y `attention_mask` y salida `logits`. No se usaron los splits de validación y test del padre para este finetune.

## Capacidades

- Detección de PII personal: etiquetas PERSON, CONTACT, ADDRESS y NETWORK_ID, con recall de 0,9963 sobre el eval ritual.
- Detección de secretos criptográficos: mnemónicos de wallet, claves privadas hex, ciphertext de keystore, URLs RPC con credenciales, claves de pago y bearer tokens, marcados como SECRET con recall de 0,7397.
- Pass-through de datos públicos de cadena: direcciones de wallet, hashes de transacción, block hashes, chain IDs, gas, fees, símbolos de token, precompiles y URLs públicas sin credenciales quedan sin etiquetar (0 fallos en 3.656 spans).
- Clasificación de tokens multilingüe (heredada del modelo padre).
- Inferencia en ONNX Runtime con INT8 weight-only, con 0 discrepancias de span HTTP frente a PyTorch en 400 casos.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio: es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Redacción de secretos en logs de agentes: el modelo marca mnemónicos, claves privadas hex y bearer tokens antes de que un log se persista o se envíe a un sistema de observabilidad, evitando fugas de material criptográfico en producción.
- Sanitización de cuerpos HTTP en ejecutores: dado que distingue URLs RPC con credenciales de URLs públicas, se puede aplicar como paso previo en proxies o gateways que reenvían payloads a LLM sin filtrar endpoints autenticados.
- Enmascarado de PII en prompts de LLM: con recall de 0,9963 en PERSON, CONTACT, ADDRESS y NETWORK_ID, es adecuado para redactar datos personales antes de enviar texto a un modelo externo o a un proveedor cloud.
- Cumplimiento y auditoría de datos: permite etiquetar automáticamente datasets y corpus multilingües para identificar campos personales y secretos, alimentando procesos de anonimización previos a publicación o a entrenamiento.
- Pass-through seguro de datos de cadena: en pipelines de indexación de blockchain o analítica on-chain, deja intactos hashes, direcciones y chain IDs (que son públicos) mientras redacta lo que no lo es, evitando romper consultas posteriores.
- Preprocesado en CI/CD de prompts y fixtures: se puede integrar como gate en pipelines que validan que los fixtures de test no contienen credenciais reales, usando el ONNX INT8 para inferencia ligera en CPU.
- Filtrado de keystores y claves de pago: detecta ciphertext de keystore y claves de pago en texto libre, útil en herramientas de gestión de wallets que registran errores o telemetría.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre los mismos documentos para padre y candidato:

| Comprobación | pii-redactor | ritual-pii-redactor |
|---|---:|---:|
| Recall SECRET en eval ritual | 0,0145 | 0,7397 |
| Recall personal en eval ritual (PERSON, CONTACT, ADDRESS, NETWORK_ID) | 0,8118 | 0,9963 |
| Recall all-PII en eval ritual | 0,4695 | 0,8860 |
| Micro F1 en eval ritual | 0,4485 | 0,8497 |
| Micro F1 en PII general intacto | 0,9191 | 0,9328 |
| Caída de micro F1 en PII general | — | -0,0136 |
| Campos públicos de cadena que fallaron el pass-through | — | 0 |

Por fichero held-out:

| Fichero | Micro F1 padre | Micro F1 candidato | Documentos |
|---|---:|---:|---:|
| eval_gretel_en.jsonl | 0,9121 | 0,9155 | 5000 |
| eval_gretel_finance.jsonl | 0,7443 | 0,7898 | 5295 |
| eval_nemotron.jsonl | 0,9293 | 0,9414 | 100000 |
| eval_openpii.jsonl | 0,8920 | 0,8977 | 4000 |

Conteos absolutos: SECRET padre tp 12 / support 826 (recall 0,0145); candidato tp 611 / support 826 (recall 0,7397). Personal padre tp 884 / support 1089; candidato tp 1085 / support 1089. All-PII padre tp 902, fp 1199, fn 1019; candidato tp 1702, fp 383, fn 219. General padre tp 780929, fp 98634, fn 38775; candidato tp 775710, fp 67811, fn 43994. Gates superados: all_pii_recall, general_f1_drop_at_most_0_01, pass_through, personal_recall, secret_recall. Discrepancias INT8 vs PyTorch en span HTTP: 0 de 400; ORT dynamic per-channel QInt8: 46 de 400.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 117,5 M parámetros; en safetensors ocupa alrededor de 0,47 GB en fp32 (el repo pesa 0,9 GB incluyendo ONNX), y en INT8 weight-only baja a aproximadamente 0,12 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090 o incluso una RTX 3060 lo ejecutan con holgura. Para CPU, el ONNX INT8 es la vía prevista.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM libre en fp32 y prácticamente en cualquier iGPU o CPU en INT8.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (grafo INT8 incluido), y pipelines de token-classification compatibles con endpoints. No se documenta soporte específico de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponible. La model card solo reporta 0 discrepancias INT8 vs PyTorch en 400 spans HTTP, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ritual-pii-redactor | 117,5 M | no disponible | PII + secretos cripto, pass-through de cadena | Apache 2.0 | Hugging Face (safetensors + ONNX INT8) |
| praveen-ritual/pii-redactor (padre) | no disponible (misma familia BERT) | no disponible | PII general | Apache 2.0 | Hugging Face |
| Modelos NER genéricos tipo BERT-base NER | ~110 M | 512 típicamente | NER general (PER, ORG, LOC) | variable | Hugging Face |

La diferencia clave frente al padre es el recall de secretos (0,7397 frente a 0,0145) y de PII personal (0,9963 frente a 0,8118), con una caída de solo 0,0136 en micro F1 de PII general. Frente a NER genéricos, la ventaja es la taxonomía específica de secretos criptográficos y la regla explícita de pass-through para datos públicos de cadena. No se dispone de datos de benchmarks comparativos con otros modelos de la categoría en la información proporcionada.

## Limitaciones y advertencias

- Los documentos extra se generan a partir de formas de payload públicas, no de tráfico real; el rendimiento en tráfico de producción puede diferir.
- Las filas de replay proceden del split de entrenamiento del padre; no se usaron validación ni test del padre, lo que limita la independencia de algunas métricas.
- Las direcciones y hashes de cadena se tratan como no-PII solo en las formas generadas que comprueba el gate; en otros contextos podrían ser sensibles.
- El ajuste a la rejilla INT8 puede mover una frontera de margen bajo; las cifras de gate corresponden a los pesos publicados ya ajustados.
- Recall de secretos de 0,7397 implica que aproximadamente 1 de cada 4 secretos no se detecta; no es adecuado como única barrera de seguridad.
- El modelo padre tenía 1.199 falsos positivos en all-PII; el candidato baja a 383, pero siguen existiendo falsos positivos que pueden redactar contenido legítimo.
- No se documentan sesgos específicos ni evaluación de sesgos; es un modelo multilingüe sin lista explícita de idiomas.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías del autor sobre exactitud en dominios no cubiertos por el eval.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praveen-ritual/ritual-pii-redactor
- Modelo base: https://huggingface.co/praveen-ritual/pii-redactor
- Repositorio del modelo padre (referencia de revision): revision `31e8958581e837a3de46d40ae10f403fff451ad7`
- No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
