# aniketClaude/datashield-local-v2.3

## Resumen

DataShield Local v2.3 es un modelo de token-classification especializado en la deteccion de datos personales, identificadores indios, datos de pago y credenciales en texto libre. Lo desarrolla el autor independiente aniketClaude y se distribuye como pesos ONNX (fp32 y una variante cuantizada para navegador) bajo licencia Apache 2.0. Es el motor neuronal del proyecto de codigo abierto DataShield Local, que anade reglas de checksum, una politica de severidad y escaneo de ficheros, navegador y portapapeles.

El modelo parte de `microsoft/deberta-v3-base` (arquitectura transformer encoder con attention disentangled) y se ha afinado para etiquetado BIO sobre 20 clases agrupadas en cuatro familias: datos personales, identificadores indios (AADHAAR, PAN), datos financieros (tarjetas, IBAN, UPI, OTP) y credenciales (contrasenas, claves API, tokens, claves privadas, cadenas de conexion). Su relevancia practica esta en que permite ejecutar deteccion de PII y secretos completamente en local, sin enviar texto a servicios externos.

El contexto de entrenamiento es de 512 tokens con ventana deslizante de stride 128, lo que limita el alcance por pasada pero permite procesar documentos largos por fragmentos. El repositorio ocupa 0,9 GB e incluye el modelo fp32 (opset 17) y una copia de 211 MB cuantizada en 4 bits para onnxruntime-web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa v3 base, attention disentangled) |
| Parametros totales | no disponible (modelo base `microsoft/deberta-v3-base`, aproximadamente 184 M, dato no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrenamiento, con stride 128 para textos largos |
| Tipos de cuantizacion | fp32 (modelo principal) y 4-bit weight-only en capas lineales (MatMulNBits, bloques de 32) con embedding int8 para navegador |
| Idiomas soportados | en (ingles); formatos de identificadores de India y EE. UU. |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 17, entradas `input_ids` y `attention_mask`, salida `logits`), mas `tokenizer.json`, `config.json`, `thresholds.json`, `labels.yaml` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `microsoft/deberta-v3-base` para token classification con etiquetas BIO. La cabeza de clasificacion produce 20 etiquetas agrupadas en datos personales (PERSON, EMAIL, PHONE, ADDRESS, DATE_OF_BIRTH, USERNAME, IP_ADDRESS), identificadores indios (AADHAAR con validacion Verhoeff, PAN), financieros (CREDIT_CARD con validacion Luhn, CARD_EXPIRY, CVV, BANK_ACCOUNT con validacion IBAN, UPI_ID, OTP_PIN) y credenciales (PASSWORD, API_KEY, AUTH_TOKEN, PRIVATE_KEY, CONNECTION_STRING). Las validaciones de checksum no las hace el modelo neuronal, sino las reglas del motor que lo envuelve.

El entrenamiento se realizo sobre 20.000 documentos sinteticos (correos, chats, logs, configuraciones, registros CSV/JSON y formularios) con spans de caracteres exactos, incluyendo negativos de aspecto similar (numeros de pedido, AWB, GSTIN, IFSC, hashes git, UUIDs, claves publicas, placeholders) para ensenar al modelo que no debe marcar. Se entrenaron 3 epocas con learning rate 3e-5, batch 16, maximo 512 tokens con stride 128 y bf16 sobre una unica GPU L4. La variante de navegador aplica cuantizacion 4-bit weight-only en las capas lineales (MatMulNBits con bloques de 32) y una tabla de embeddings int8, manteniendo F1 identico al fp32 en el conjunto de prueba de 400 documentos.

## Capacidades

- Deteccion de entidades nombradas de tipo PII: personas, correos, telefonos, direcciones, fechas de nacimiento, nombres de usuario e IPs.
- Reconocimiento de identificadores indios: AADHAAR (con validacion Verhoeff en el motor) y PAN.
- Deteccion de datos financieros: tarjetas de credito (con validacion Luhn), caducidad de tarjeta, CVV, cuentas bancarias (IBAN), UPI IDs y OTP/PIN.
- Deteccion de credenciales y secretos: contrasenas, claves API, tokens de autenticacion, claves privadas y cadenas de conexion.
- Token classification con spans exactos a nivel de caracter, adecuada para redaccion y enmascaramiento selectivo.
- Inferencia local en CPU o GPU mediante ONNX Runtime, y en navegador mediante onnxruntime-web (WASM).
- Umbrales por etiqueta ajustados en validacion (`thresholds.json`) para controlar la sensibilidad por tipo de entidad.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un modelo de etiquetado.

## Casos de uso

- Prevencion de fugas de datos (DLP) en estaciones de trabajo: el motor escanea ficheros locales (`datashield-local scan ./folder --html report.html`) y genera informes HTML con las entidades detectadas, sin enviar contenido a la nube.
- Redaccion de PII en correos y chats antes de enviarlos a un LLM externo: el modelo marca personas, correos, telefonos y direcciones para sustituirlos por placeholders, reduciendo la exposicion en pipelines de inferencia de terceros.
- Deteccion de secretos en repositorios y ficheros de configuracion: las etiquetas API_KEY, AUTH_TOKEN, PRIVATE_KEY y CONNECTION_STRING permiten bloquear commits o alertar en CI antes de que se filtren credenciales.
- Escaneo de portapapeles y navegador: la extension usa la variante cuantizada de 211 MB en onnxruntime-web y devuelve exactamente los mismos spans que el motor Python en 322 textos de prueba, lo que permite avisar al usuario al copiar datos sensibles.
- Cumplimiento y auditoria de datos en entornos con regulacion estricta (por ejemplo, tratamiento de AADHAAR o PAN en India): el despliegue local evita transferencias internacionales de datos personales.
- Anonimizacion de datasets antes de entrenar otros modelos: el etiquetado por spans exactos facilita el enmascaramiento a nivel de caracter en corpus de texto.
- Filtrado de logs y trazas de aplicaciones: deteccion de IPs, tokens y cadenas de conexion en registros antes de almacenarlos o compartirlos con soporte.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos sinteticos con redaccion disjunta del entrenamiento (modelo mas reglas de checksum), con F1 estricto de span:

| Conjunto de prueba | F1 estricto de span |
|---|---|
| v2.3 test, 20 etiquetas (3.033 spans) | 0,978 [0,97, 0,98] |
| v1 test, 12 etiquetas compartidas (1.870 spans) | 0,992 |
| 8 documentos reales revisados, 12 etiquetas (1.322 spans) | 0,956 (coincidencia parcial 0,978) |
| Variante navegador 4-bit vs fp32, 400 documentos v2.3 | F1 0,974 en ambas; falsos positivos 27 vs 43 por 1.000 |

F1 por etiqueta en el conjunto v2.3: 1,00 en PERSON, EMAIL, PHONE, ADDRESS, CREDIT_CARD, IP_ADDRESS, UPI_ID y PRIVATE_KEY; AADHAAR 0,985, PAN 0,995, PASSWORD 0,990, USERNAME 0,994, CVV 0,951, API_KEY 0,960, AUTH_TOKEN 0,960, BANK_ACCOUNT 0,943, CONNECTION_STRING 0,908, OTP_PIN 0,898 y CARD_EXPIRY 0,889. Tasa de falsos positivos: 36 por 1.000 documentos limpios en el conjunto v2.3, concentrados en dos formulaciones no vistas en entrenamiento ("best before 09/27" y "extension 6152"), que la politica del motor descarta.

## Requisitos de hardware

- El modelo fp32 en ONNX ocupa una fraccion del repo de 0,9 GB; la inferencia cabe holgadamente en CPU para uso individual y en cualquier GPU consumer con suficiente memoria para el modelo y el batch.
- La variante de navegador es de 211 MB y funciona en onnxruntime-web (WASM), por lo que no requiere GPU.
- GPU recomendadas: no se especifican en la model card; el entrenamiento se realizo en una unica NVIDIA L4. Para inferencia, cualquier GPU con al menos unos pocos GB de VRAM es suficiente dado el tamano del modelo base.
- Despliegue: ONNX Runtime (Python y web/WASM). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo encoder de token classification.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DataShield Local v2.3 | no disponible (base DeBERTa-v3-base) | 512 tokens | Token classification de PII y secretos, 20 etiquetas | apache-2.0 | ONNX en Hugging Face, motor en GitHub |
| microsoft/deberta-v3-base | aproximadamente 184 M | 512 tokens | Modelo base generalista de encoder | MIT | Hugging Face |
| Detectores de PII genericos basados en BERT | no disponible | 512 tokens | NER de PII generica | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas especificas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con datos sinteticos: la precision en el mundo real solo se ha medido sobre 8 documentos revisados, por lo que la generalizacion a dominios nuevos es incierta.
- Solo cubre texto en ingles y formatos de identificadores de India y EE. UU.; otros idiomas, alfabetos y documentos de identidad de otros paises no estan soportados.
- Las etiquetas dependientes de contexto (PERSON, ADDRESS, PASSWORD) pueden fallar con redacciones poco habituales; las etiquetas de numeros cortos (CVV, OTP_PIN) dependen de las palabras cercanas y tienen el F1 mas bajo (0,951 y 0,898).
- Los falsos positivos se concentran en formulaciones no vistas en entrenamiento; la politica del motor los filtra, pero el modelo por si solo no lo hace.
- Debe usarse para reducir filtraciones, no como garantia: la propia model card recomienda revisar manualmente los datos marcados y no marcados que sean criticos.
- La ventana de 512 tokens obliga a fragmentar documentos largos; el contexto entre fragmentos se pierde salvo por el solapamiento de stride 128.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo (por ejemplo, tratamiento de AADHAAR) recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aniketClaude/datashield-local-v2.3
- Repositorio del motor DataShield Local: https://github.com/agarje02/data_shield_local
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
