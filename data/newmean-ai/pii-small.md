# newmean-ai/pii-small

## Resumen

newmean-pii-small es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean.ai y forma parte de una familia de cuatro niveles (nano, small, medium, large) que alimenta el SDK JavaScript `@newmean-ai/pii`. Su objetivo es permitir el enmascarado de datos personales en el navegador, antes de que el texto abandone el dispositivo, lo que lo hace relevante para aplicaciones que procesan formularios, chats o registros con requisitos de privacidad estrictos.

El modelo tiene 9,6 millones de parámetros y se distribuye en formato ONNX con pesos de 4 bits, con un tamaño de descarga de entre 6,2 y 7,1 MB según la variante. Soporta 54 idiomas y etiqueta 11 categorías de PII a nivel de carácter: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

Su propuesta diferencial es la combinación de tamaño reducido, ejecución en WebAssembly mediante onnxruntime-web y un enfoque de entrenamiento con datos sintéticos multilingües, lo que evita depender de conjuntos de datos reales con información personal. Está pensado para integrarse en pipelines de redacción en el cliente, no como un detector de propósito general en servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (mMiniLMv2-L6-H384 adaptado: 4 capas, embeddings de rango 64) |
| Parámetros totales | 9,6 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantización | 4 bits en pesos (`model_q4.onnx`, 7,1 MB) y 4 bits en pesos y embeddings (`model_q4e.onnx`, 6,2 MB) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_q4.onnx`, `model_q4e.onnx`); tokenizer en `tokenizer.web.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de mMiniLMv2-L6-H384 (Microsoft, licencia MIT) y se reduce a 4 capas con embeddings de rango 64, alcanzando 9,6 M de parámetros. El vocabulario XLM-R se poda a las 35.298 piezas que aparecen en los datos de entrenamiento, lo que reduce el tamaño del tokenizer para uso en navegador. La salida es una secuencia de logits en formato BIO para las 11 etiquetas definidas en `config.json`, procesada en ventanas de 256 tokens con solapamiento de 64.

El entrenamiento se basa en destilación desde dos modelos profesores privados de mayor tamaño (mDeBERTa-v3-base y XLM-R-large, ajustados específicamente para esta tarea). El corpus consiste en aproximadamente 1,07 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita. No se utilizaron datos personales reales ni conjuntos de datos externos durante el entrenamiento, lo que mitiga riesgos de memorización de PII. Las etiquetas PERSON y URL incorporan un nivel (1 = identificador directo, 2 = indirecto), y algunas categorías dependen del contexto (por ejemplo, una organización solo se marca cuando una persona pertenece a ella).

## Capacidades

- Detección de PII a nivel de carácter con 11 etiquetas: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Clasificación con niveles de identificabilidad para PERSON y URL (nivel 1 directo, nivel 2 indirecto).
- Procesamiento multilingüe en 54 idiomas, incluyendo escrituras latinas, cirílicas, árabes, hebreas, devanagari, han y hangul.
- Ejecución en navegador mediante WebAssembly (onnxruntime-web o el motor propio del SDK).
- Integración con el SDK `@newmean-ai/pii`, que verifica la integridad de los archivos mediante SHA-256 y ofrece un parámetro `sensitivity` para ajustar el equilibrio entre falsos negativos y sobremascarado.
- Capa opcional de patrones en el SDK para cubrir direcciones IP (desactivada por defecto).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de generación de texto: es exclusivamente un modelo de etiquetado.

## Casos de uso

- Redacción en formularios web: el modelo se ejecuta en el navegador antes de enviar los datos al servidor, de modo que el backend recibe únicamente el texto enmascarado. Es adecuado por su tamaño de 7 MB y su latencia de decenas de milisegundos en CPU.
- Cumplimiento de RGPD en aplicaciones cliente: permite eliminar nombres, correos y teléfonos de campos de texto libre antes de persistirlos o enviarlos a servicios de terceros, reduciendo la superficie de exposición de datos personales.
- Procesamiento de logs y telemetría: aplicado a líneas de log o mensajes de error antes de su envío a plataformas de observabilidad, evita filtrar identificadores de usuario, correos o direcciones que aparecen en trazas.
- Saneado de transcripciones de voz: tras la conversión a texto, el modelo puede marcar nombres, teléfonos y direcciones en la transcripción, útil en asistentes de voz o herramientas de accesibilidad que operan en el dispositivo.
- Anonimización de hojas de cálculo y JSON: el SDK procesa celdas individuales y estructuras JSON, por lo que encaja en exportaciones de datos, integraciones B2B o procesos de compartición de datasets internos.
- Preprocesado de correos electrónicos: antes de reenviar un correo a un sistema de tickets o a un LLM externo, el modelo enmascara firmas, teléfonos y direcciones, preservando el contenido útil para el análisis.
- Detección de secretos y credenciales en texto libre: la etiqueta SECRET permite marcar cadenas que podrían ser claves o tokens antes de su registro o compartición.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, medidos solo con el modelo (sin capa de patrones) sobre el archivo por defecto, en una VM Colab con GPU L4. "Miss" es la proporción de caracteres de PII no enmascarados (menor es mejor) y "over" la proporción de caracteres no PII enmascarados.

| Conjunto | Miss % / Over % | Notas |
|---|---|---|
| newmean-pii-dataset (test público) | 2,7 / 1,2 (F1 exacto 0,68) | 54 idiomas, 17.058 filas; en distribución |
| KDPII (coreano) | 9,5 / 3,2 | Externo |
| OpenPII 1.5M (30 idiomas) | 5,6 / 5,5 | Externo |
| Nemotron-PII (inglés) | 10,6 / 1,0 | Externo |
| Gretel finance (7 idiomas) | 24,1 / 5,7 | Externo |

En el test público, el detector público más cercano comparado por el autor (gliner-pii-edge, 176 MB) deja sin enmascarar un 19,6 % de los caracteres de PII. El autor advierte que el test público se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que existe una ventaja in-distribution; los conjuntos externos no se usaron para entrenar.

Rendimiento en CPU de la VM (Xeon a 2,20 GHz, onnxruntime): 59 ms por texto con un hilo y 16 ms con 12 hilos sobre los textos del test público.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para ejecución en CPU y en WebAssembly dentro del navegador.
- Memoria: el archivo ONNX ocupa entre 6,2 y 7,1 MB, por lo que cabe holgadamente en cualquier dispositivo, incluidos móviles.
- GPU recomendadas: no aplica; el autor reporta mediciones en CPU (Xeon 2,20 GHz) y en una GPU L4 de Colab para la evaluación.
- Cabe en cualquier GPU consumer, aunque no es su escenario objetivo.
- Opciones de despliegue: onnxruntime-web (WebAssembly), el motor propio del SDK `@newmean-ai/pii`, y onnxruntime nativo con las entradas `input_ids` y `attention_mask`.
- Latencia: 59 ms por texto con un hilo y 16 ms con 12 hilos en la CPU de referencia; el rendimiento en navegador no está cuantificado en la información disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| newmean-pii-small | 9,6 M | 6,2–7,1 MB (ONNX 4 bits) | 54 | Apache-2.0 | Ejecución en navegador; miss 2,7 % en su test público |
| newmean-pii-medium | No disponible en la información proporcionada | No disponible | 54 | Apache-2.0 | Nivel intermedio de la misma familia |
| newmean-pii-large | No disponible en la información proporcionada | No disponible | 54 | Apache-2.0 | Nivel superior de la misma familia |
| gliner-pii-edge | No disponible | 176 MB | No disponible | No disponible | Comparado por el autor; miss 19,6 % en el test público de newmean |

El autor mantiene un leaderboard público que evalúa semanalmente ocho detectores públicos sobre su test público y privado; los detalles por etiqueta e idioma están en el informe técnico enlazado abajo.

## Limitaciones y advertencias

- Ningún detector encuentra todo: el resultado debe usarse para reducir la información expuesta, no como garantía de anonimato.
- Entrenado exclusivamente con texto sintético; formatos poco frecuentes, documentos muy largos e idiomas fuera de los 54 pueden rendir peor.
- Algunas etiquetas dependen del contexto (ORG solo cuando hay una persona asociada; DATE_OF_BIRTH solo si es fecha de nacimiento), por lo que el rendimiento varía con el texto circundante.
- El test público es in-distribution respecto al entrenamiento; los resultados en conjuntos externos son notablemente peores (hasta 24,1 % de miss en Gretel finance).
- Las direcciones IP solo se cubren con la capa opcional de patrones del SDK, desactivada por defecto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos (sobremascarado) y falsos negativos, ajustables con el parámetro `sensitivity`.
- Licencia Apache-2.0: permite uso comercial sin condiciones; la atribución "Powered by newmean.ai" es una petición, no un requisito legal.
- El SDK fija la revisión `v1.0.0` del repositorio; cambios de versión pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-small
- Modelo large: https://huggingface.co/newmean-ai/pii-large
- Modelo medium: https://huggingface.co/newmean-ai/pii-medium
- Modelo nano: https://huggingface.co/newmean-ai/pii-nano
- Demo en navegador: https://pii.newmean.ai
- SDK en npm: https://www.npmjs.com/package/@newmean-ai/pii
- Dataset: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Repositorio del SDK: https://github.com/newmean-ai/pii
- Sitio del autor: https://newmean.ai
