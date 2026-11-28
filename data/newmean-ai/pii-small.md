# newmean-ai/pii-small

## Resumen

newmean-pii-small es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean-ai como el nivel `small` de una familia de cuatro tamaños (nano, small, medium, large) que da soporte al SDK de código abierto newmean-pii. Su función es localizar entidades sensibles —nombres, correos, teléfonos, direcciones, números de identificación, datos financieros, secretos— para poder enmascararlas antes de que el texto se envíe a un LLM externo, ya sea en el navegador, en el dispositivo o en el servidor.

El modelo parte de mMiniLMv2-L6-H384 (destilado de XLM-R Large), al que se le ha podado el vocabulario XLM-R a 35.298 piezas y se le ha reducido la profundidad a 4 capas con embeddings de rango 64, resultando en 9,6 millones de parámetros y un peso ONNX de 7,1 MB (4 bits). Cubre 54 idiomas y 11 etiquetas a nivel de carácter, y está pensado para entradas reales y ruidosas: formularios, chats, celdas de hoja de cálculo, logs, JSON, texto OCR, correos o transcripciones de voz.

Su relevancia actual reside en la combinación de tres factores: licencia Apache-2.0 sin restricciones para uso comercial, ejecución en WebAssembly dentro del navegador sin backend y un tamaño lo bastante reducido como para desplegarse en cualquier dispositivo. Frente a detectores públicos mucho mayores, el autor reporta tasas de omisión competitivas en su conjunto de evaluación público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 4 capas, embeddings de rango 64), exportado a ONNX |
| Parámetros totales | 9,6 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantización | Pesos 4 bits (`model_q4.onnx`, 7,1 MB); pesos y embeddings 4 bits (`model_q4e.onnx`, 6,2 MB) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_q4.onnx, model_q4e.onnx); tokenizador en `tokenizer.json`, `tokenizer.web.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 4 capas derivado de mMiniLMv2-L6-H384, que a su vez es una destilación de XLM-R Large. El vocabulario XLM-R se podó a las 35.298 piezas que aparecen efectivamente en los datos de entrenamiento, lo que reduce el tamaño del embedding y acelera la inferencia. La salida es una secuencia de logits BIO sobre 11 etiquetas definidas en `config.json`: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET. Las etiquetas PERSON y URL llevan además un nivel (1 = identificador directo, 2 = indirecto). Las direcciones IP se aprenden como ID_NUMBER.

El entrenamiento se basa en destilación desde dos modelos profesor privados más grandes (mDeBERTa-v3-base y XLM-R-large, afinados específicamente para esta tarea). Los datos son aproximadamente 1,31 millones de textos sintéticos en 54 idiomas generados con modelos Claude a partir de una guía de etiquetado escrita; la versión v1.1 añadió 240.498 textos cortos (títulos de columna, opciones de respuesta, palabras sueltas, nombres y valores aislados, filas de encuestas). No se usó ningún dato personal real ni conjunto de datos externo para el entrenamiento. El modelo opera sobre ventanas de 256 tokens con solapamiento de 64 y no incorpora capa de patrones por defecto (el SDK ofrece una capa opcional de expresiones regulares para correo, URL, tarjetas, teléfono y número de residente coreano, desactivada por defecto).

## Capacidades

- Detección de PII a nivel de carácter en 11 categorías (persona, correo, teléfono, dirección, número de identificación, datos financieros, organización, nombre de usuario, URL, fecha de nacimiento, secreto).
- Clasificación con nivel de identificabilidad (1 directo, 2 indirecto) para personas y URLs.
- Cobertura multilingüe de 54 idiomas, incluidos español, catalán, gallego (no listado explícitamente), euskera (no listado), árabe, chino, japonés, coreano, hindi, tailandés y vietnamita.
- Procesamiento de texto ruidoso y estructurado: formularios, chats, celdas de hoja de cálculo, logs, JSON, texto OCR, correos y transcripciones de voz.
- Ejecución en WebAssembly en el navegador (onnxruntime-web o el motor propio del SDK) y en Node.js, Python, iOS, Android, Flutter y Rust.
- Integración con un vault para restaurar los valores reales enmascarados en la respuesta del LLM.
- Modo tabla con contexto de cabecera (`context: "header"`) para exportaciones de encuestas y formularios.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un detector de entidades.

## Casos de uso

- Enmascarado previo al envío a LLM en el navegador: el SDK descarga el modelo una vez, verifica su SHA-256 y redacta el texto del usuario antes de que salga del dispositivo; el modelo cabe en 7,1 MB y se ejecuta en WebAssembly, por lo que no requiere backend ni conexión persistente.
- Cumplimiento de privacidad en aplicaciones de atención al cliente: interceptar conversaciones multi-turno y sustituir nombres, correos y teléfonos antes de enviarlas a un proveedor externo, restaurando los valores originales en la respuesta mediante el vault.
- Saneado de logs y telemetría: procesar líneas de log en servidor con onnxruntime y eliminar IPs (detectadas como ID_NUMBER), correos y nombres de usuario antes de almacenarlas o enviarlas a un sistema de observabilidad.
- Anonimización de exportaciones de encuestas y formularios: el modo tabla con `context: "header"` reduce la omisión al 1,72 % en 556 exportaciones de encuestas y formularios en 54 idiomas, según el autor.
- Procesamiento de texto OCR y documentos escaneados: detectar PII en el texto extraído por OCR antes de indexarlo en un sistema de búsqueda o de pasarlo a un modelo de resumen.
- Transcripciones de voz y asistentes: redactar nombres, direcciones y números de teléfono en transcripciones antes de enviarlas a un servicio de resumen o análisis.
- Aplicaciones móviles y de escritorio con procesamiento en el dispositivo: integración mediante los paquetes de iOS, Android, Flutter y Rust para redactar datos sensibles sin conexión.
- Preprocesado en pipelines de datos para entrenamiento: eliminar PII de corpus antes de usarlos en ajuste fino o evaluación de modelos.

## Benchmarks y rendimiento

Resultados del modelo solo (sin capa de patrones), archivo por defecto, onnxruntime en CPU. "Miss" es la proporción de caracteres de PII no enmascarados (menor es mejor); "over" es la proporción de caracteres no PII enmascarados.

| Conjunto de evaluación | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 2,4 / 1,0 (F1 exacto 0,72) |
| KDPII (coreano) | 10,0 / 2,5 |
| OpenPII 1.5M (30 idiomas) | 5,6 / 5,3 |
| Nemotron-PII (inglés) | 8,4 / 0,9 |
| Gretel finance (7 idiomas) | 22,3 / 5,8 |

El test público de newmean-pii-dataset se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que el modelo tiene ventaja in-distribution en él; los conjuntos externos no se usaron para entrenamiento. En ese test público, el detector público más cercano de los ocho comparados (gliner-pii-edge, 176 MB) omite el 19,6 %.

Texto corto y archivos de encuesta (v1.1): sobre un conjunto privado de 20.691 elementos cortos en 54 idiomas y 228 archivos CSV de encuestas, enmascara el 9,4 % de los elementos sin PII (v1.0: 36,8 %) y el 7,7 % de las celdas sin PII al comprobar celda a celda (v1.0: 29,5 %); encuentra el 97,0 % de los nombres escritos aislados.

Con SDK 1.2: los números anteriores varían como máximo 0,04 puntos. Los emojis se eliminan del texto que lee el modelo, con lo que los textos con emoji enmascarados caen del 20,57 % (solo modelo) al 0,89 %. El modo tabla con `context: "header"` omite el 1,72 % de los caracteres de PII en 556 exportaciones de encuestas y formularios en 54 idiomas (modo tabla solo: 6,65 %) y enmascara el 19,03 % de sus celdas sin PII. Ambos conjuntos son privados y sintéticos.

Velocidad en la CPU de una VM Colab L4 (Xeon 2,20 GHz, onnxruntime): 59 ms por texto con un hilo, 16 ms con 12 hilos, sobre los textos del test público.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el modelo pesa 6,2-7,1 MB en ONNX de 4 bits y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU (Xeon 2,20 GHz reportado por el autor). Cualquier GPU moderna puede acelerar la inferencia mediante onnxruntime con CUDA, pero no es necesaria.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, y también en dispositivos móviles y navegadores mediante WebAssembly.
- Opciones de despliegue: onnxruntime (CPU o GPU), onnxruntime-web en navegador, el motor propio del SDK newmean-pii, y los paquetes `@newmean-ai/pii` (npm) para navegador y Node.js, además de Python, iOS, Android, Flutter y Rust.
- Latencia y throughput: 59 ms por texto con un hilo y 16 ms con 12 hilos en CPU Xeon 2,20 GHz sobre los textos del test público. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| newmean-pii-small | 9,6 M | ventanas de 256 tokens | Apache-2.0 | Hugging Face, npm, paquetes para múltiples plataformas | 54 idiomas, 11 etiquetas, ONNX 4 bits, WebAssembly |
| gliner-pii-edge | no disponible (176 MB de peso) | no disponible | no disponible en la información proporcionada | no disponible | Omite el 19,6 % en el test público de newmean-pii-dataset, frente al 2,4 % de newmean-pii-small |
| newmean-pii-medium | no disponible en la información proporcionada | no disponible | Apache-2.0 | Hugging Face | Nivel superior de la misma familia; sin datos de rendimiento en la información disponible |
| newmean-pii-large | no disponible en la información proporcionada | no disponible | Apache-2.0 | Hugging Face | Nivel superior de la misma familia; sin datos de rendimiento en la información disponible |
| newmean-pii-nano | no disponible en la información proporcionada | no disponible | Apache-2.0 | Hugging Face | Nivel inferior de la misma familia; sin datos de rendimiento en la información disponible |

## Limitaciones y advertencias

- Ningún detector encuentra todo: el resultado debe usarse para reducir lo que se envía, no como garantía de anonimato.
- El modelo se entrenó únicamente con datos sintéticos; puede tener un comportamiento degradado en dominios reales no representados en la guía de etiquetado.
- La ventaja in-distribution en el test público de newmean-pii-dataset es significativa; los resultados en conjuntos externos son peores (por ejemplo, 22,3 % de omisión en Gretel finance).
- El rendimiento en textos muy cortos o aislados es limitado: enmascara el 9,4 % de los elementos sin PII y el 7,7 % de las celdas sin PII en encuestas, aunque encuentra el 97,0 % de los nombres aislados.
- No se han publicado datos de sesgo por idioma, género o etnia en la información disponible.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la exactitud de la detección.
- El modelo no genera texto ni razona: es un componente de preprocesado que debe integrarse en un pipeline mayor.
- Los emojis se eliminan del texto antes de la inferencia en el SDK 1.2; sin el SDK, los textos con emoji tienen una tasa de enmascarado del 20,57 %, lo que puede afectar a conversaciones reales.
- La información sobre sesgos, alucinación (no aplica a un modelo discriminativo) y limitaciones por idioma concreto no está disponible en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-small
- Modelo large: https://huggingface.co/newmean-ai/pii-large
- Modelo medium: https://huggingface.co/newmean-ai/pii-medium
- Modelo nano: https://huggingface.co/newmean-ai/pii-nano
- Repositorio del SDK: https://github.com/newmean-ai/pii
- Paquete npm: https://www.npmjs.com/package/@newmean-ai/pii
- Demostración en navegador: https://pii.newmean.ai
- Conjunto de datos: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
