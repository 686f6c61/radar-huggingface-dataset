# Horizon-Labs/pii-redactor-small

## Resumen

PII Redactor Small es un modelo de clasificación de tokens (token classification) especializado en la detección y redacción de información personal identificable (PII) y secretos en texto. Lo desarrolla Horizon-Labs y se distribuye bajo licencia Apache-2.0 sin restricciones de acceso. Con 140,6 millones de parámetros, está diseñado para ejecutarse en CPU y en el navegador, lo que lo convierte en una pieza viable para pipelines de privacidad en producción sin depender de GPU.

El modelo parte de la arquitectura ModernBERT (concretamente del checkpoint `jhu-clsp/mmBERT-small`) y etiqueta 29 tipos de entidad, desde nombres y direcciones hasta claves de API, contraseñas, IBAN, tarjetas de crédito y coordenadas. Su propósito es actuar como barrera de entrada y salida en sistemas que procesan texto sensible: logs, prompts enviados a LLM, datos de entrenamiento o llamadas a APIs de terceros.

Su relevancia actual radica en la combinación de tamaño reducido, soporte multilingüe (más de 30 idiomas con escrituras latinas y no latinas) y formatos de despliegue ligeros (ONNX, transformers.js), además de integraciones listas para Presidio y LLM Guard. La model card incluye una evaluación comparativa honesta frente a otros modelos de PII, reconociendo que no es el mejor en todos los benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (base: `jhu-clsp/mmBERT-small`) |
| Parámetros totales | 140.664.251 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | más de 30: en, de, fr, es, it, nl, pt, pl, cs, sk, sl, hr, sr, bg, ro, hu, el, da, sv, fi, et, lv, lt, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, ms, tl, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura transformer encoder-only que incorpora atención lineal y rota posicional, optimizada para eficiencia en secuencias largas y despliegue en CPU. El checkpoint base es `jhu-clsp/mmBERT-small`, un modelo multilingüe de la familia mmBERT. La cabeza de clasificación de tokens produce etiquetas BIO sobre 29 tipos de entidad.

El entrenamiento se realizó exclusivamente con datos con licencias permisivas, según declara el autor: los datasets `ai4privacy/pii-masking-openpii-1.5m`, `nvidia/Nemotron-PII` y `gretelai/gretel-pii-masking-en-v1`. No se especifica el número total de tokens de entrenamiento ni si hubo fases de ajuste fino con RLHF o DPO; al tratarse de una tarea de etiquetado, lo habitual sería aprendizaje supervisado sobre datos anotados. La model card menciona que el modelo fue evaluado en cuatro benchmarks externos y dos conjuntos retenidos propios, lo que sugiere una separación cuidadosa entre entrenamiento y evaluación.

## Capacidades

- Detección de 29 tipos de entidad PII: `PERSON`, `EMAIL`, `PHONE`, `LOCATION`, `STREET_ADDRESS`, `POSTCODE`, `DATE`, `DATE_OF_BIRTH`, `AGE`, `ORGANIZATION`, `NATIONAL_ID`, `PASSPORT`, `DRIVER_LICENSE`, `TAX_ID`, `MEDICAL_ID`, `LICENSE_NUMBER`, `CREDIT_CARD`, `CREDIT_CARD_CVV`, `BANK_ACCOUNT`, `IBAN` (vía `BANK_ACCOUNT`/`ACCOUNT_ID`), `ACCOUNT_ID`, `USERNAME`, `PASSWORD`, `SECRET`, `IP_ADDRESS`, `MAC_ADDRESS`, `DEVICE_ID`, `VEHICLE_ID`, `COORDINATE`, `URL`.
- Detección de secretos y credenciales: claves de API, tokens, claves privadas, cadenas de conexión y cookies de sesión bajo la etiqueta `SECRET`.
- Multilingüe real: cubre más de 30 idiomas con escrituras latinas, cirílicas, árabes, devanagari, CJK y otras.
- Integración con Presidio como recognizer personalizado.
- Integración con LLM Guard mediante el scanner `Anonymize`, con mapeo de etiquetas a entidades de Presidio/LLM Guard.
- Ejecución en navegador y edge mediante ONNX y transformers.js.
- Redacción de documentos largos con ventanas solapadas mediante el script `redact.py`.
- No soporta tool calling, agentes ni generación de texto: es un modelo exclusivamente de etiquetado.

## Casos de uso

- Redacción de logs de aplicación: antes de escribir trazas en disco o enviarlas a un agregador, el modelo enmascara correos, IPs, tokens y credenciales embebidas en mensajes de error, evitando filtraciones en sistemas de observabilidad.
- Saneamiento de prompts hacia LLM de terceros: como paso previo a llamadas a APIs externas, se ejecuta el modelo sobre el texto de entrada para sustituir PII por marcadores, cumpliendo con requisitos de minimización de datos del RGPD.
- Anonimización de datos de entrenamiento: en pipelines de curación de datasets, el modelo detecta y elimina identificadores directos en corpus multilingües antes de publicar o reutilizar los datos.
- Cumplimiento en atención al cliente: en sistemas de ticketing o chat, se redactan conversaciones antes de almacenarlas o analizarlas, protegiendo nombres, teléfonos y direcciones en varios idiomas.
- Detección de secretos en repositorios y configuraciones: el modelo identifica cadenas de conexión, claves de API y contraseñas en archivos de configuración o diffs, sirviendo como capa adicional a los escáneres de secretos tradicionales.
- Enmascaramiento en el navegador: gracias a ONNX y transformers.js, se puede ejecutar localmente en el cliente para redactar formularios o textos antes de enviarlos al servidor, sin que el dato sensible abandone el dispositivo.
- Preprocesado para pipelines de LLM Guard: se integra como recognizer del scanner `Anonymize` para anonimizar entradas y salidas de modelos generativos en aplicaciones de producción.

## Benchmarks y rendimiento

La model card reporta métricas de recall y precisión de redacción (caracteres que deben enmascararse correctamente frente a caracteres enmascarados que realmente son PII). La comparación ignora los tipos de entidad y mide solo el comportamiento de redacción.

| Benchmark | Este modelo (141M) | Base mmBERT (308M) | OpenAI Privacy Filter (1.5B) | gravitee bert-small | OpenMed PII Small 44M |
|---|---|---|---|---|---|
| RedactionBench (recall / precisión) | 0,23 / 0,74 | 0,19 / 0,74 | 0,10 / 0,85 | 0,07 / 0,76 | 0,12 / 0,76 |
| TonicAI Privacy-Bench (recall / precisión) | 0,76 / 0,95 | 0,81 / 0,94 | 0,78 / 0,96 | 0,88 / 0,76 | 0,86 / 0,82 |
| TAB: ECHR court judgments, identificadores directos (recall / precisión) | 0,60 / 0,84 | 0,74 / 0,88 | 0,38 / no disponible | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de razonamiento, ya que el modelo no está orientado a esas tareas. Los datos de la tabla anterior son los únicos benchmarks disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 141M parámetros, en fp32 requiere aproximadamente 560 MB de pesos; en fp16, unos 280 MB; en int8, unos 140 MB. El repo ocupa 2,8 GB por incluir múltiples formatos (safetensors y ONNX).
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) lo ejecuta con holgura; también funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde y navegador mediante ONNX/transformers.js.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, transformers.js, Presidio (como recognizer), LLM Guard (scanner `Anonymize`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; el autor lo describe como "CPU-friendly" y apto para edge, pero no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento destacado |
|---|---|---|---|---|---|
| PII Redactor Small (este) | 141M | no disponible | Apache-2.0 | PII + secretos, multilingüe (30+) | Mejor recall en RedactionBench (0,23); buen equilibrio en TonicAI (0,76/0,95) |
| mmBERT-small (base) | 308M | no disponible | no disponible | PII, multilingüe | Mejor recall en TAB ECHR (0,74) y TonicAI (0,81) |
| OpenAI Privacy Filter | 1,5B | no disponible | no disponible | PII | Mejor precisión en RedactionBench (0,85) y TonicAI (0,96); recall bajo en TAB (0,38) |
| gravitee bert-small | no disponible | no disponible | no disponible | PII | Mejor recall en TonicAI (0,88), pero precisión baja (0,76) |
| OpenMed PII Small | 44M | no disponible | no disponible | PII médico | Recall alto en TonicAI (0,86), precisión media (0,82) |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre contexto, licencia ni disponibilidad de los modelos alternativos más allá de lo indicado.

## Limitaciones y advertencias

- El recall en RedactionBench es bajo (0,23), lo que indica que en documentos de estilo formulario, cartas y programas académicos puede dejar sin enmascarar una parte importante de los identificadores obligatorios.
- No etiqueta atributos sensibles como género, religión o condiciones de salud en esta versión, lo que limita su uso para anonimización completa según categorías especiales del RGPD.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; la precisión en TonicAI es alta (0,95), pero en otros dominios puede degradarse.
- La comparación entre modelos ignora los tipos de entidad, por lo que las métricas de redacción no reflejan la corrección del etiquetado semántico.
- El rendimiento varía notablemente entre dominios: bueno en hilos de correo corporativo, flojo en formularios y documentos legales.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el autor no garantiza la idoneidad para cumplimiento normativo estricto; se recomienda validación propia sobre el dominio de aplicación.
- No se especifica la longitud máxima de contexto soportada, lo que obliga a probar empíricamente el comportamiento con documentos largos (el script `redact.py` mitiga esto con ventanas solapadas).
- El modelo está entrenado solo con datos permisivamente licenciados, lo que puede introducir sesgos de cobertura geográfica o lingüística en comparación con datasets más amplios pero restrictivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/pii-redactor-small
- Demo en Spaces: https://huggingface.co/spaces/Horizon-Labs/pii-redactor
- Colección Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Prompt Injection Guard (modelo relacionado): https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
