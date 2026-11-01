# newmean-ai/pii-medium

## Resumen

newmean-pii-medium es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean.ai y forma parte de una familia de cuatro niveles (nano, small, medium, large) que alimentan el SDK JavaScript `@newmean-ai/pii`. Su objetivo es permitir el enmascarado de datos personales en el navegador, antes de que el texto abandone el dispositivo, lo que reduce la exposición de datos sensibles en arquitecturas de procesamiento en cliente.

El modelo tiene 17,7 millones de parámetros y se distribuye en formato ONNX con pesos de 4 bits, con un archivo principal de 11,3 MB. Está diseñado para ejecutarse en WebAssembly mediante onnxruntime-web o el motor propio del SDK, lo que lo hace adecuado para entornos con recursos limitados como extensiones de navegador, aplicaciones web y herramientas de escritorio. Soporta 54 idiomas y etiqueta 11 categorías de PII a nivel de carácter.

La relevancia actual del modelo reside en su enfoque de privacidad por diseño: al ejecutarse localmente y no requerir el envío de texto a servidores externos, ofrece una alternativa práctica para cumplir con normativas de protección de datos en flujos de trabajo donde el texto puede contener información sensible. Su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (mMiniLMv2-L6-H384 como base, con vocabulario XLM-R podado) |
| Parámetros totales | 17,7 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantización | 4 bits (pesos y embeddings en `model_q4e.onnx`; solo pesos en `model_q4.onnx`) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_q4e.onnx`, `model_q4.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en mMiniLMv2-L6-H384, un transformer de 6 capas con embeddings de rango 192, al que se le ha podado el vocabulario XLM-R a las 35.298 piezas que aparecen en los datos de entrenamiento. La salida es una clasificación BIO (Begin, Inside, Outside) sobre 11 etiquetas a nivel de carácter: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET. Las etiquetas PERSON y URL llevan un nivel asociado (1 = identificador directo, 2 = indirecto).

El entrenamiento se realizó mediante destilación desde dos modelos profesores privados más grandes (mDeBERTa-v3-base y XLM-R-large) afinados específicamente para esta tarea. Los datos de entrenamiento consisten en aproximadamente 1,07 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita. No se utilizaron datos personales reales ni conjuntos de datos externos. El modelo se distribuye en formato ONNX con cuantización de 4 bits para su ejecución eficiente en WebAssembly.

## Capacidades

- Detección de PII a nivel de carácter en 54 idiomas, con 11 etiquetas: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Clasificación de personas y URLs con nivel de identificabilidad (1 = directo, 2 = indirecto).
- Procesamiento de texto real de formularios, chats, celdas de hojas de cálculo, logs, JSON, texto OCR, correos electrónicos y transcripciones de voz.
- Ejecución en navegador mediante WebAssembly (onnxruntime-web o motor propio del SDK), sin envío de datos a servidores.
- Integración con el SDK JavaScript `@newmean-ai/pii` para enmascarado y redacción de texto.
- Soporte de ventanas deslizantes de 256 tokens con stride de 64 para textos largos.
- No incluye tool calling, function calling ni capacidades de agente; es un modelo de clasificación de tokens, no generativo.
- No incluye visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enmascarado de PII en formularios web: el modelo puede procesar el texto introducido por el usuario en el navegador antes de enviarlo a un servidor, detectando nombres, correos, teléfonos y direcciones para su redacción local.
- Redacción de logs y telemetría: integrado en pipelines de registro, permite eliminar información personal de los logs antes de almacenarlos o transmitirlos, reduciendo el riesgo en auditorías y cumplimiento normativo.
- Procesamiento de correos electrónicos y transcripciones: adecuado para anonimizar hilos de correo o transcripciones de voz antes de su análisis o almacenamiento, gracias a su soporte de texto OCR y speech transcripts.
- Anonimización de datos en hojas de cálculo y JSON: puede aplicarse celda a celda o campo a campo para limpiar conjuntos de datos tabulares antes de compartirlos con terceros.
- Protección en chats y asistentes conversacionales: el modelo puede ejecutarse en el cliente para detectar y enmascarar PII en los mensajes del usuario antes de que se envíen a un backend de LLM, como capa de privacidad previa.
- Cumplimiento de RGPD en aplicaciones web: al ejecutarse localmente y no requerir transferencia de datos, facilita el cumplimiento de requisitos de minimización de datos y protección desde el diseño en aplicaciones que manejan datos personales.
- Filtrado de PII en herramientas de soporte técnico: permite redactar tickets y conversaciones de atención al cliente antes de su almacenamiento o análisis posterior.

## Benchmarks y rendimiento

Resultados del modelo (sin capa de patrones, archivo por defecto, evaluado en una VM Colab L4). Miss = porcentaje de caracteres de PII no enmascarados (menor es mejor); over = porcentaje de caracteres no PII enmascarados.

| Conjunto de evaluación | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 2,1 / 0,6 (F1 exacto 0,77) |
| KDPII (coreano) | 9,8 / 2,0 |
| OpenPII 1.5M (30 idiomas) | 6,1 / 4,1 |
| Nemotron-PII (inglés) | 7,9 / 0,7 |
| Gretel finance (7 idiomas) | 22,5 / 4,2 |

En el test público de newmean-pii-dataset, el detector público más cercano comparado (gliner-pii-edge, 176 MB) deja sin enmascarar un 19,6% de los caracteres de PII.

Velocidad en CPU de la VM (Xeon 2,20 GHz, onnxruntime): 88 ms por texto con un hilo, 23 ms con 12 hilos, sobre los textos del test público.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está diseñado para ejecutarse en CPU mediante ONNX y WebAssembly. El archivo principal ocupa 11,3 MB (`model_q4e.onnx`) y la variante de 4 bits solo en pesos ocupa 14,0 MB (`model_q4.onnx`).
- GPU recomendadas: no requiere GPU; está optimizado para CPU y entornos de navegador. En la evaluación se usó una VM Colab L4, pero el modelo se ejecuta en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, incluyendo navegadores y dispositivos de gama baja.
- Opciones de despliegue: onnxruntime-web (WebAssembly), motor propio del SDK `@newmean-ai/pii`, onnxruntime nativo para CPU.
- Latencia y throughput: 88 ms por texto con un hilo de CPU y 23 ms con 12 hilos en la VM de evaluación (Xeon 2,20 GHz).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| newmean-pii-medium | 17,7 M | Ventanas de 256 tokens | 54 | Apache-2.0 | ONNX (4 bits) | Enfoque en navegador, 11,3 MB |
| gliner-pii-edge | No disponible (176 MB de archivo) | No disponible | No disponible | No disponible | No disponible | Comparado en el test público; miss del 19,6% |
| newmean-pii-large | No disponible | No disponible | 54 | Apache-2.0 | ONNX | Nivel superior de la misma familia |
| newmean-pii-small | No disponible | No disponible | 54 | Apache-2.0 | ONNX | Nivel inferior de la misma familia |

No se dispone de datos detallados de parámetros, contexto ni licencia de gliner-pii-edge en la información proporcionada. La comparación completa por etiqueta e idioma está disponible en el informe técnico del proyecto.

## Limitaciones y advertencias

- Ningún detector encuentra todo: el resultado debe usarse para reducir la información enviada, no como garantía de anonimato.
- Entrenado con texto sintético; formatos poco frecuentes, documentos muy largos e idiomas fuera de los 54 pueden tener un rendimiento inferior.
- El contexto determina algunas etiquetas: una organización solo se enmascara cuando pertenece a una persona, y las fechas solo cuando son fechas de nacimiento, por lo que los resultados dependen del texto circundante.
- Las direcciones IP solo se cubren mediante la capa opcional de patrones del SDK, desactivada por defecto.
- El modelo tiene un sesgo hacia los datos de su propio conjunto de evaluación (newmean-pii-dataset), generado con el mismo diseño y guía que los datos de entrenamiento, lo que le otorga ventaja en distribución.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia Apache-2.0 permite uso comercial sin restricciones; se solicita (no se exige) mención "Powered by newmean.ai" en productos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/newmean-ai/pii-medium
- SDK JavaScript: https://www.npmjs.com/package/@newmean-ai/pii
- Demo en navegador: https://pii.newmean.ai
- Conjunto de datos: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Modelo large: https://huggingface.co/newmean-ai/pii-large
- Modelo small: https://huggingface.co/newmean-ai/pii-small
- Modelo nano: https://huggingface.co/newmean-ai/pii-nano
- Sitio del autor: https://newmean.ai
