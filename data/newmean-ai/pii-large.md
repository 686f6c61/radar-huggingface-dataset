# newmean-ai/pii-large

## Resumen

newmean-pii-large es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean.ai y forma parte de una familia de cuatro tamaños (nano, small, medium y large) que alimentan el SDK JavaScript `@newmean-ai/pii`. Su objetivo es permitir el enmascarado de datos sensibles directamente en el navegador, antes de que el texto abandone el dispositivo, lo que lo convierte en una pieza relevante para aplicaciones de privacidad en cliente, formularios web, chats y pipelines de registro.

El modelo tiene 24,4 millones de parámetros y se distribuye en formato ONNX con pesos de 4 bits, con un tamaño de descarga de 15,5 MB en su variante por defecto (`model_q4e.onnx`). Deriva de mMiniLMv2-L6-H384 con vocabulario XLM-R podado a 35.298 piezas y cubre 54 idiomas con 11 etiquetas a nivel de carácter. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

Su relevancia actual radica en la combinación de tres factores: un tamaño lo bastante pequeño para ejecutarse en WebAssembly dentro del navegador, cobertura multilingüe amplia y un rendimiento declarado competitivo frente a detectores públicos de mayor tamaño en tareas de enmascarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mMiniLMv2-L6-H384, 6 capas) con embeddings podados; clasificación de tokens BIO |
| Parametros totales | 24,4 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con stride de 64 |
| Tipos de cuantizacion | 4 bits en pesos (`model_q4.onnx`, 20,7 MB) y 4 bits en pesos y embeddings (`model_q4e.onnx`, 15,5 MB, por defecto) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (q4 y q4e), tokenizer Unigram en JSON |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas basado en mMiniLMv2-L6-H384 (Microsoft, licencia MIT), al que se le ha podado el vocabulario XLM-R SentencePiece (Facebook AI, MIT) a las 35.298 piezas que aparecen efectivamente en los datos de entrenamiento. La salida es una clasificación BIO sobre 11 etiquetas a nivel de carácter: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET. Las etiquetas PERSON y URL llevan además un nivel (1 = identificador directo, 2 = indirecto). Las direcciones IP no están cubiertas por el modelo y solo las detecta la capa opcional de patrones del SDK, desactivada por defecto.

El entrenamiento se realizó mediante destilación a partir de dos modelos profesores privados más grandes (mDeBERTa-v3-base y XLM-R-large) afinados específicamente para esta tarea. Los datos de entrenamiento consisten en aproximadamente 1,07 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita. No se utilizaron datos personales reales ni conjuntos de datos externos. La inferencia procesa el texto en ventanas de 256 tokens con solapamiento (stride) de 64 para cubrir documentos largos.

## Capacidades

- Detección de PII a nivel de carácter con 11 etiquetas y distinción de nivel (directo/indirecto) para personas y URLs.
- Cobertura multilingüe de 54 idiomas, incluidos español, catalán, gallego (no listado explícitamente), euskera (no listado), inglés, francés, alemán, árabe, chino, japonés, coreano, hindi y vietnamita, entre otros.
- Procesamiento de entradas heterogéneas: formularios, chats, celdas de hoja de cálculo, logs, JSON, texto OCR, correos electrónicos y transcripciones de voz.
- Ejecución en navegador mediante WebAssembly (onnxruntime-web o el motor propio del SDK), lo que permite enmascarar antes de enviar datos al servidor.
- Uso directo con onnxruntime fuera del SDK: acepta `input_ids` y `attention_mask` y devuelve logits BIO.
- Ajuste de sensibilidad en el SDK para intercambiar falsos negativos por sobremascarado.
- No es un modelo generativo: no realiza tool calling, function calling, agentes ni razonamiento multi-paso. Su función es exclusivamente de etiquetado.

## Casos de uso

- Enmascarado en formularios web antes del envío: el modelo se ejecuta en el navegador vía WebAssembly y redacta nombres, correos, teléfonos y direcciones en el propio campo de entrada, de modo que el servidor nunca recibe el dato original. Adecuado por su tamaño de 15,5 MB y su latencia de decenas de milisegundos.
- Anonimización de logs de aplicaciones: integrado en pipelines de registro del lado cliente o en un servicio ligero con onnxruntime, permite eliminar PII de líneas de log en 54 idiomas antes de almacenarlas o enviarlas a un agregador.
- Redacción de transcripciones de voz: tras un sistema ASR, el modelo limpia nombres, teléfonos y direcciones de la transcripción, útil en entornos sanitarios o de atención al cliente donde la transcripción se comparte con terceros.
- Limpieza de textos OCR: documentos escaneados convertidos a texto pueden contener PII dispersa; el modelo la detecta en ventanas de 256 tokens con solapamiento y permite exportar una versión redactada.
- Protección de datos en chats y asistentes: como paso previo a enviar un mensaje a una API externa de LLM, el SDK redacta la PII localmente, reduciendo el riesgo de transferencia de datos personales a terceros.
- Cumplimiento en exportaciones de datos: antes de generar un CSV o JSON de exportación para analítica, el modelo marca y enmascara columnas con datos personales, con niveles 1 y 2 para distinguir identificadores directos de indirectos.
- Saneamiento de correos electrónicos: en pasarelas de correo o clientes web, detectar y redactar remitentes, URLs y datos financieros en el cuerpo del mensaje antes de reenviarlo o archivarlo.

## Benchmarks y rendimiento

Resultados declarados por el autor, solo modelo (sin capa de patrones), fichero por defecto, medidos en una VM Colab L4. "Miss" es la proporción de caracteres PII sin enmascarar (menor es mejor); "over" es la proporción de caracteres no PII enmascarados.

| Conjunto | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 1,6 / 0,6 (F1 exacto 0,78) |
| KDPII (coreano) | 7,6 / 2,4 |
| OpenPII 1.5M (30 idiomas) | 4,6 / 4,2 |
| Nemotron-PII (inglés) | 7,4 / 0,9 |
| Gretel finance (7 idiomas) | 20,3 / 5,2 |

Velocidad en CPU de la VM (Xeon 2,20 GHz, onnxruntime): 88 ms por texto con un hilo y 23 ms con 12 hilos sobre los textos del test público. El autor advierte que el test público de newmean-pii-dataset se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que existe ventaja in-distribution; los conjuntos externos no se usaron para entrenar. Frente a ocho detectores públicos comparados, el más cercano (gliner-pii-edge, 176 MB) deja sin enmascarar un 19,6% en el test público. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las variantes; el fichero por defecto ocupa 15,5 MB en disco y los pesos de 4 bits caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para uso típico; funciona en CPU. En GPU, cualquier RTX 3060 o superior sobra; A100/H100 solo tendrían sentido para despliegues de altísimo throughput por lotes.
- Cabe en GPU consumer: sí, en cualquier GPU con más de 1 GB de VRAM, y también en CPU y en navegador.
- Opciones de despliegue: onnxruntime-web (WebAssembly) en navegador, onnxruntime nativo en servidor, SDK `@newmean-ai/pii` con motor propio, y uso directo de los ficheros ONNX. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de este tamaño.
- Latencia y throughput: 88 ms por texto a un hilo y 23 ms a 12 hilos en CPU Xeon 2,20 GHz según el autor; no se publican cifras de throughput por lotes ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| newmean-pii-large | 24,4 M | 256 tokens (ventanas con stride 64) | 54 | Apache-2.0 | ONNX q4/q4e | 15,5 MB, ejecución en navegador |
| gliner-pii-edge | No disponible (176 MB de descarga) | No disponible | No disponible | No disponible | No disponible | Miss 19,6% en el test público según el autor |
| newmean-pii-medium / small / nano | No disponible | No disponible | 54 | Apache-2.0 | ONNX | Misma familia, menor tamaño; specs no detalladas en la información disponible |

La comparación completa por etiqueta e idioma, junto con los ocho detectores públicos evaluados, está en el informe técnico y en el leaderboard enlazados más abajo. No se dispone de datos de benchmarks de los tiers medium, small y nano en la información proporcionada.

## Limitaciones y advertencias

- Ningún detector encuentra todo: el resultado debe usarse para reducir lo que se envía, no como garantía de anonimato.
- Entrenado con texto sintético; formatos raros, documentos muy largos e idiomas fuera de los 54 pueden rendir peor.
- El contexto determina algunas etiquetas: una organización solo se enmascara cuando pertenece a una persona y las fechas solo cuando son fechas de nacimiento, por lo que los resultados dependen del texto circundante.
- Las direcciones IP no están cubiertas por el modelo; solo las detecta la capa opcional de patrones del SDK, desactivada por defecto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos (sobremascarado) y falsos negativos (PII sin detectar), modulables con el parámetro `sensitivity`.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos sintéticos, la distribución puede no reflejar la de datos reales.
- Licencia Apache-2.0: permite uso comercial sin restricciones; la mención "Powered by newmean.ai" y la atribución en modelos derivados son peticiones, no condiciones de licencia.
- Para producción: verificar el revision pinneado `v1.0.0` y la comprobación SHA-256 que realiza el SDK; validar el rendimiento en los idiomas y formatos concretos de cada aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-large
- Demo en navegador: https://pii.newmean.ai
- SDK JavaScript: https://www.npmjs.com/package/@newmean-ai/pii
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Dataset público: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Tiers de la familia: https://huggingface.co/newmean-ai/pii-medium, https://huggingface.co/newmean-ai/pii-small, https://huggingface.co/newmean-ai/pii-nano
- Sitio del autor: https://newmean.ai
- Contacto comercial: hoonjae@newmean.ai
