# Horizon-Labs/pii-redactor-base

## Resumen

PII Redactor (base) es un modelo de clasificación de tokens desarrollado por Horizon-Labs, especializado en la detección y el etiquetado de información personal identificable (PII) y secretos (claves de API, contraseñas, cadenas de conexión) en texto multilingüe. Su propósito es servir de barrera de redacción antes de que los datos lleguen a logs, prompts de LLM, conjuntos de entrenamiento o APIs de terceros. Con 307,6 millones de parámetros y una licencia Apache-2.0 sin restricciones de acceso, se posiciona como una alternativa ligera y permisiva a los filtros de privacidad propietarios.

El modelo deriva de `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT multilingüe, y se distribuye en formatos safetensors y ONNX, lo que permite su ejecución en CPU, en el navegador mediante transformers.js y en el borde de la red. Etiqueta 29 tipos de entidad que cubren nombres, datos de contacto, direcciones, identificadores gubernamentales, datos financieros, credenciales, identificadores de red y de dispositivo, entre otros.

Su relevancia actual radica en la combinación de tres factores: cobertura de más de 30 idiomas (incluidos alfabetos no latinos como árabe, hindi, chino, japonés, coreano, tailandés y vietnamita), un tamaño contenido que lo hace viable en infraestructura modesta y una evaluación publicada sobre cuatro benchmarks externos que no formaron parte de su entrenamiento, con métricas de recall y precisión de redacción en lugar de F1 por entidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base) para clasificación de tokens |
| Parametros totales | 307.575.611 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen safetensors y ONNX; el repo incluye variantes ONNX cuantizadas para transformers.js, sin detallar los esquemas) |
| Idiomas soportados | 30+ idiomas: en, de, fr, es, it, nl, pt, pl, cs, sk, sl, hr, sr, bg, ro, hu, el, da, sv, fi, et, lv, lt, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, ms, tl, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de `jhu-clsp/mmBERT-base`, orientado a clasificación de tokens (token-classification). No emplea mezcla de expertos ni arquitecturas híbridas SSM: es un encoder denso de 308M de parámetros que produce una etiqueta BIO por token, con 29 tipos de entidad definidos (`PERSON`, `EMAIL`, `PHONE`, `CREDIT_CARD`, `SECRET`, `IP_ADDRESS`, `MAC_ADDRESS`, `IBAN`-equivalente vía `BANK_ACCOUNT`, `PASSPORT`, `NATIONAL_ID`, `TAX_ID`, `MEDICAL_ID`, `DRIVER_LICENSE`, `LICENSE_NUMBER`, `VEHICLE_ID`, `DEVICE_ID`, `USERNAME`, `PASSWORD`, `URL`, `COORDINATE`, `DATE_OF_BIRTH`, `AGE`, `ORGANIZATION`, `STREET_ADDRESS`, `POSTCODE`, `LOCATION`, `ACCOUNT_ID`, entre otros).

El entrenamiento se realizó exclusivamente sobre datos con licencia permisiva, según declara el autor, combinando tres conjuntos: `ai4privacy/pii-masking-openpii-1.5m`, `nvidia/Nemotron-PII` y `gretelai/gretel-pii-masking-en-v1`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO (poco habituales en un modelo de etiquetado). La model card indica que la evaluación se hizo sobre benchmarks externos no vistos durante el entrenamiento, además de dos conjuntos de retención propios del autor. El repositorio incluye utilidades específicas (`redact.py`, `llm_guard_conf.py`) que gestionan la fusión de subpalabras, el recorte de espacios y el procesamiento de documentos largos mediante ventanas solapadas, lo que sugiere que el contexto efectivo se gestiona a nivel de pipeline y no de una ventana nativa extendida.

## Capacidades

- Detección y etiquetado de 29 tipos de entidad PII y secretos en texto libre.
- Reconocimiento de credenciales y secretos: claves de API (incluye formatos tipo `sk-proj-...`), tokens, claves privadas, cadenas de conexión a bases de datos y cookies de sesión.
- Identificadores financieros: tarjetas de crédito, CVV, IBAN/cuentas bancarias, identificadores de cuenta.
- Identificadores gubernamentales y administrativos: pasaporte, documento nacional de identidad, número fiscal, permiso de conducir, identificador médico.
- Datos de contacto y localización: email, teléfono, dirección postal, código postal, ubicación, coordenadas.
- Identificadores de red y dispositivo: direcciones IP, direcciones MAC, identificadores de dispositivo y de vehículo.
- Capacidad multilingüe real sobre más de 30 idiomas, con cobertura de alfabetos latino, cirílico, árabe, devanagari, han, kana, hangul, tailandés y vietnamita.
- Integración con Presidio como reconocedor personalizado y con LLM Guard en el escáner `Anonymize`.
- Ejecución en navegador y en el borde mediante ONNX y transformers.js.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.
- No detecta atributos sensibles como género, religión o condiciones de salud en esta versión.

## Casos de uso

- Redacción previa a logs de aplicación: interceptar mensajes de log antes de escribirlos en disco o enviarlos a un agregador (ELK, Loki, Datadog) y sustituir emails, teléfonos, IPs y credenciales por marcadores como `[EMAIL]` o `[SECRET]`, reduciendo el riesgo de filtraciones en sistemas de observabilidad.
- Saneamiento de prompts hacia LLMs de terceros: colocar el modelo como paso previo a una llamada a una API externa para eliminar PII del contexto del usuario, con integración directa vía el escáner `Anonymize` de LLM Guard y su bóveda (`Vault`) para reidentificación posterior.
- Limpieza de conjuntos de entrenamiento: procesar corpus multilingües antes de usarlos en ajuste fino, aprovechando la cobertura de 30+ idiomas y la capacidad de manejar documentos largos con ventanas solapadas mediante `redact.py`.
- Cumplimiento de RGPD en pipelines de datos: anonimizar exportaciones de bases de datos o ficheros de atención al cliente antes de compartirlos con equipos internos o proveedores, cubriendo identificadores fiscales, direcciones y datos bancarios.
- Detección de secretos en repositorios y ficheros de configuración: escanear ficheros `.env`, YAML de despliegue y volcados de configuración para localizar claves de API, contraseñas y cadenas de conexión antes de un commit o de adjuntar un fichero a un ticket.
- Anonimización en el navegador: desplegar la variante ONNX con transformers.js para redactar formularios o textos en el cliente antes de enviarlos al servidor, sin coste de infraestructura y sin que el texto original abandone el dispositivo.
- Procesamiento de documentos legales o judiciales: aplicar el modelo sobre resoluciones y expedientes para localizar identificadores directos, un escenario para el que el autor reporta métricas específicas sobre el benchmark TAB de sentencias del TEDH.
- Filtrado en herramientas de atención al cliente: redactar transcripciones de chat o correo antes de almacenarlas o de pasarlas a un sistema de análisis de calidad.

## Benchmarks y rendimiento

El autor publica métricas de recall y precisión de redacción (proporción de caracteres que deben redactarse y quedan enmascarados, y proporción de caracteres enmascarados que son realmente PII), evaluadas sobre benchmarks externos no vistos en entrenamiento. La comparación ignora los tipos de entidad porque cada modelo usa su propio conjunto de etiquetas. Todos los modelos se ejecutaron con el mismo pipeline de `transformers`, con un máximo de 600 documentos por benchmark.

| Benchmark | Este modelo (308M) | small (141M) | OpenAI Privacy Filter (1.5B) | gravitee bert-small | OpenMed PII Small 44M |
|---|---|---|---|---|---|
| RedactionBench (formularios, cartas, programas; spans obligatorios) | 0,19 / 0,74 | 0,23 / 0,74 | 0,10 / 0,85 | 0,07 / 0,76 | 0,12 / 0,76 |
| TonicAI Privacy-Bench (hilos de correo corporativo) | 0,81 / 0,94 | 0,76 / 0,95 | 0,78 / 0,96 | 0,88 / 0,76 | 0,86 / 0,82 |
| TAB: sentencias del TEDH (identificadores DIRECT) | 0,74 / 0,88 | 0,60 / 0,84 | 0,38 / 0,97 | no disponible | no disponible |

El autor reconoce explícitamente que el modelo no es el mejor en todos los benchmarks. En RedactionBench obtiene un recall bajo (0,19) pese a una precisión alta (0,74); en TonicAI Privacy-Bench logra el mejor recall de la comparativa (0,81) con una precisión de 0,94; y en TAB supera ampliamente al filtro de OpenAI en recall (0,74 frente a 0,38) a costa de menor precisión (0,88 frente a 0,97). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB solo para los pesos (308M parámetros × 2 bytes), más overhead de activaciones y del pipeline; en la práctica, menos de 2 GB en total.
- En FP32: alrededor de 1,2 GB para los pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU.
- La model card destaca explícitamente que es apto para CPU ("CPU-friendly"), lo que lo hace viable en contenedores sin GPU.
- Despliegue posible con la pipeline `token-classification` de transformers, con ONNX Runtime, con transformers.js en navegador y en el borde, y a través de las integraciones de Presidio y LLM Guard.
- El repositorio ocupa 3,1 GB, lo que incluye pesos en safetensors y variantes ONNX.
- No se publican cifras de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque | Rendimiento destacado |
|---|---|---|---|---|---|
| PII Redactor base (este modelo) | 308M | 30+ | Apache-2.0 | Etiquetado de 29 entidades PII + secretos | Mejor recall en TonicAI (0,81) y TAB (0,74) de la comparativa publicada |
| PII Redactor small | 141M | No disponible en la información | Apache-2.0 (misma familia) | Misma tarea, menor tamaño | Mejor recall que base en RedactionBench (0,23 frente a 0,19) |
| OpenAI Privacy Filter | 1.5B | No disponible | No disponible | Filtro de privacidad | Mejor precisión en RedactionBench (0,85) y TAB (0,97), peor recall en TAB (0,38) |
| gravitee bert-small | No disponible | No disponible | No disponible | Detección PII | Mejor recall en TonicAI (0,88) con precisión baja (0,76) |
| OpenMed PII Small | 44M | No disponible | No disponible | Detección PII | Recall 0,86 en TonicAI con precisión 0,82 |

La ventaja diferencial de este modelo frente a las alternativas es la combinación de licencia Apache-2.0 sin restricciones, cobertura de más de 30 idiomas y detección de secretos y credenciales además de PII clásica. El filtro de OpenAI, con cinco veces más parámetros, obtiene mayor precisión pero un recall notablemente inferior en identificadores directos de documentos judiciales.

## Limitaciones y advertencias

- El recall en RedactionBench es bajo (0,19): en documentos con formato de formulario, cartas o programas académicos puede dejar sin enmascarar una parte importante de los spans obligatorios. No es adecuado como única capa de protección en entornos de alto riesgo sin una revisión o un filtro complementario.
- Riesgo de falsos positivos: la precisión en RedactionBench es 0,74, lo que implica que aproximadamente una cuarta parte de los caracteres enmascarados no son PII. En producción esto puede degradar la legibilidad de logs y textos.
- No detecta atributos sensibles como género, religión o condiciones de salud; la model card lo señala explícitamente como limitación de esta versión.
- El modelo es un etiquetador, no un generador: no razona, no sigue instrucciones ni soporta tool calling. No debe confundirse con un modelo conversacional.
- La longitud de contexto nativa no se documenta; el manejo de documentos largos depende del script `redact.py` y de ventanas solapadas, lo que puede introducir pérdidas en los límites de ventana.
- La cobertura de idiomas se declara por lista, pero no se publican métricas desagregadas por idioma; el rendimiento en idiomas de bajos recursos dentro de la lista (por ejemplo, estonio, letón, lituano o tagalo) no está cuantificado.
- Aunque la licencia Apache-2.0 permite uso comercial sin restricciones, la responsabilidad sobre el cumplimiento normativo (RGPD, HIPAA u otras) recae en el integrador: el modelo es una ayuda técnica, no una garantía de anonimización legal.
- El modelo se entrenó solo con datos de licencia permisiva según el autor, pero no se detalla la composición ni el volumen, lo que limita la auditoría independiente del sesgo.
- La fecha de creación del repositorio (2026-09-23) y la de actualización (2026-10-31) indican un modelo reciente con 730 descargas y 0 likes en el momento de la consulta: el ecosistema de terceros que lo valide es todavía reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/pii-redactor-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/pii-redactor
- Colección Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Prompt Injection Guard (modelo hermano): https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset ai4privacy/pii-masking-openpii-1.5m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
