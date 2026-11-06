# newmean-ai/pii-nano

## Resumen

newmean-pii-nano es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla newmean.ai y forma parte de una familia de cuatro tamaños (nano, small, medium y large); esta es la variante más pequeña, con 3,1 millones de parámetros y un peso de 2,6 MB en su archivo principal. Su propósito es permitir el enmascarado de datos personales directamente en el navegador, antes de que el texto abandone el dispositivo, lo que reduce la exposición de datos sensibles en aplicaciones web.

El modelo cubre 54 idiomas y 11 etiquetas a nivel de carácter (PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET), con niveles de identificación para personas y URL. Se distribuye en formato ONNX con pesos de 4 bits y está pensado para ejecutarse mediante WebAssembly con onnxruntime-web o con el motor propio del SDK `@newmean-ai/pii`. La licencia Apache-2.0 permite uso comercial sin restricciones.

Su relevancia actual radica en la creciente demanda de procesamiento local de datos sensibles (formularios, chats, registros, correos, transcripciones) sin depender de servicios en la nube, combinada con un tamaño lo bastante reducido como para ejecutarse en el navegador con latencias de decenas de milisegundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer destilado; una capa compartida aplicada 4 veces, embeddings de rango 32; base mMiniLMv2-L6-H384 con vocabulario XLM-R podado a 35.298 piezas |
| Parámetros totales | 3,1 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con stride de 64 |
| Tipos de cuantización | 4 bits en pesos (`model_q4.onnx`, 2,6 MB) y 4 bits en pesos y embeddings (`model_q4e.onnx`, 2,1 MB) |
| Idiomas soportados | 54 idiomas (ar, az, bg, bn, ca, cs, da, de, el, en, es, et, fa, fi, fr, ga, he, hi, hr, hu, id, is, it, ja, ka, kk, km, ko, lt, lv, mr, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sq, sr, sv, sw, te, th, tl, tr, uk, ur, uz, vi, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, `onnx/model_q4e.onnx`); tokenizador Unigram (`tokenizer.web.json`, `tokenizer.json`) |

## Arquitectura y entrenamiento

El modelo es un transformer destilado que parte de mMiniLMv2-L6-H384 (Microsoft, licencia MIT), con el vocabulario de XLM-R (SentencePiece, Facebook AI, licencia MIT) podado a las 35.298 piezas que aparecen en los datos de entrenamiento. La arquitectura final comparte una única capa aplicada cuatro veces y utiliza embeddings de rango 32, lo que explica su reducido número de parámetros (3,1 M). La salida son logits BIO para las etiquetas definidas en `config.json`, procesados en ventanas de 256 tokens con solapamiento de 64.

El entrenamiento se basa en aproximadamente 1,07 millones de textos sintéticos en 54 idiomas, generados con modelos Claude a partir de una guía de etiquetado escrita. No se utilizaron datos personales reales ni conjuntos de datos externos. Los cuatro tamaños de la familia se destilaron a partir de dos modelos profesores privados más grandes (mDeBERTa-v3-base y XLM-R-large) afinados específicamente para esta tarea. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Detección de PII a nivel de carácter con 11 etiquetas: PERSON, EMAIL, PHONE, ADDRESS, ID_NUMBER, FINANCIAL, ORG, USERNAME, URL, DATE_OF_BIRTH y SECRET.
- Clasificación con nivel de identificación para personas y URL (nivel 1 = identificador directo, nivel 2 = indirecto).
- Procesamiento multilingüe en 54 idiomas, incluyendo escrituras no latinas (árabe, hebreo, chino, japonés, coreano, tailandés, georgiano, entre otras).
- Diseñado para entradas del mundo real: formularios, chats, celdas de hojas de cálculo, registros, JSON, texto OCR, correos electrónicos y transcripciones de voz.
- Funcionamiento en el navegador mediante WebAssembly (onnxruntime-web o el motor integrado del SDK), sin envío de datos a servidores.
- Integración con el SDK `@newmean-ai/pii` mediante `createRedactor`, que descarga los archivos del repositorio, verifica su SHA-256 y devuelve el texto enmascarado junto con los spans detectados.
- Control de sensibilidad en el SDK para ajustar el equilibrio entre falsos negativos y sobremascarado.
- Capa opcional de patrones en el SDK (desactivada por defecto) que cubre direcciones IP.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Enmascarado de PII en formularios web antes del envío: el modelo se ejecuta en el navegador con WebAssembly y permite redactar nombres, correos, teléfonos y direcciones en el propio cliente, de modo que el servidor recibe únicamente el texto anonimizado.
- Cumplimiento de privacidad en aplicaciones de atención al cliente: los chats y correos de soporte pueden procesarse localmente para eliminar datos personales antes de almacenarlos o enviarlos a sistemas de analítica, reduciendo la superficie de exposición.
- Saneado de registros y telemetría: los logs de aplicaciones suelen contener correos, identificadores y direcciones; el modelo puede integrarse en un pipeline previo al almacenamiento para enmascarar esos campos con una latencia de decenas de milisegundos.
- Preprocesado de datos para entrenamiento o análisis: antes de incorporar textos a un corpus o a un sistema de análisis, el modelo permite eliminar PII de forma consistente en 54 idiomas, lo que facilita el cumplimiento de requisitos de minimización de datos.
- Anonimización de transcripciones de voz y texto OCR: las transcripciones de reuniones o los textos extraídos de documentos escaneados pueden redactarse antes de su difusión o archivo, aprovechando que el modelo está entrenado para entradas ruidosas y de formato variable.
- Protección en herramientas ofimáticas y hojas de cálculo: integrado en un complemento o en una extensión, el modelo puede marcar celdas con datos personales antes de compartir un documento, con la ventaja de que el contenido no sale del dispositivo.
- Filtrado previo en pipelines de datos JSON: al procesar estructuras JSON con campos mixtos, el modelo identifica valores con PII y permite enmascararlos selectivamente sin necesidad de reglas manuales por campo.

## Benchmarks y rendimiento

Resultados publicados por el autor (solo modelo, sin capa de patrones, archivo por defecto, medidos en una VM Colab L4). "Miss" es la proporción de caracteres de PII no enmascarados (menor es mejor); "over" es la proporción de caracteres no PII enmascarados.

| Conjunto | Miss % / Over % |
|---|---|
| newmean-pii-dataset (test público, 54 idiomas, 17.058 filas) | 3,3 / 2,1 (F1 exacto 0,59) |
| KDPII (coreano) | 9,5 / 4,2 |
| OpenPII 1.5M (30 idiomas) | 4,9 / 7,0 |
| Nemotron-PII (inglés) | 10,6 / 2,1 |
| Gretel finance (7 idiomas) | 22,8 / 7,5 |

El autor advierte que el test público de newmean-pii-dataset se generó con el mismo diseño y guía que los datos de entrenamiento, por lo que existe una ventaja in-distribution; los conjuntos externos no se usaron para entrenar. En ese test público, el detector público más cercano de los ocho comparados (gliner-pii-edge, 176 MB) deja sin enmascarar un 19,6 %. El resto de comparaciones por etiqueta e idioma está en el informe técnico.

Rendimiento en CPU de la VM (Xeon 2,20 GHz, onnxruntime): 59 ms por texto con un hilo y 16 ms con 12 hilos sobre los textos del test público.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo pesa 2,1-2,6 MB en disco y se ejecuta en CPU o en el navegador. El consumo de memoria en tiempo de ejecución es de unos pocos megabytes, no disponible con precisión.
- GPU recomendadas: no requiere GPU; funciona en CPU. El autor reporta mediciones en una GPU Colab L4, pero el despliegue objetivo es CPU y WebAssembly.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y navegadores, dado su tamaño de 3,1 M de parámetros.
- Opciones de despliegue: onnxruntime-web (WebAssembly) en el navegador, el motor integrado del SDK `@newmean-ai/pii`, y onnxruntime nativo con las entradas `input_ids` y `attention_mask`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de clasificación de este tamaño.
- Latencia y throughput: 59 ms por texto con un hilo y 16 ms con 12 hilos en CPU Xeon 2,20 GHz; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| newmean-pii-nano | 3,1 M | 54 | ventanas de 256 tokens | Apache-2.0 | ONNX 4 bits | 3,3 % miss en test público propio; pensado para navegador |
| gliner-pii-edge | no disponible | no disponible | no disponible | no disponible | no disponible | 176 MB; 19,6 % miss en el test público de newmean-pii-dataset según el autor |
| newmean-pii-small | no disponible | 54 | ventanas de 256 tokens | Apache-2.0 | ONNX | Mismo diseño, mayor tamaño; sin datos de rendimiento en la información disponible |
| newmean-pii-medium | no disponible | 54 | ventanas de 256 tokens | Apache-2.0 | ONNX | Mismo diseño, mayor tamaño; sin datos de rendimiento en la información disponible |
| newmean-pii-large | no disponible | 54 | ventanas de 256 tokens | Apache-2.0 | ONNX | Mismo diseño, mayor tamaño; sin datos de rendimiento en la información disponible |

La información disponible no incluye especificaciones detalladas de los otros tres tamaños de la familia ni de gliner-pii-edge más allá del dato de miss y tamaño. El autor mantiene un leaderboard que evalúa semanalmente ocho detectores públicos sobre su test público y privado.

## Limitaciones y advertencias

- Ningún detector encuentra todo: el resultado debe usarse para reducir lo que se envía, no como garantía de anonimato.
- Entrenado con texto sintético; formatos poco frecuentes, documentos muy largos e idiomas fuera de los 54 pueden rendir peor.
- Algunas etiquetas dependen del contexto: una organización solo se enmascara cuando aparece una persona asociada, y una fecha solo se marca como DATE_OF_BIRTH cuando es fecha de nacimiento; los resultados dependen del texto circundante.
- El parámetro `sensitivity` del SDK permite intercambiar falsos negativos por sobremascarado, pero no elimina el compromiso.
- Las direcciones IP solo se cubren con la capa opcional de patrones del SDK, desactivada por defecto.
- El rendimiento en el test público propio puede estar inflado por la similitud con los datos de entrenamiento; los conjuntos externos muestran tasas de miss más altas (hasta 22,8 % en Gretel finance).
- La licencia Apache-2.0 permite uso comercial sin restricciones; las menciones "Powered by newmean.ai" y "Based on newmean-pii-nano" son peticiones, no condiciones de licencia.
- No se han documentado sesgos específicos más allá de las limitaciones de cobertura e idioma indicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/newmean-ai/pii-nano
- SDK en npm: https://www.npmjs.com/package/@newmean-ai/pii
- Demo en navegador: https://pii.newmean.ai
- Informe técnico: https://github.com/newmean-ai/pii/blob/main/docs/report/REPORT.md
- Leaderboard: https://huggingface.co/spaces/newmean-ai/pii-leaderboard
- Conjunto de datos: https://huggingface.co/datasets/newmean-ai/pii-dataset
- Modelo large: https://huggingface.co/newmean-ai/pii-large
- Modelo medium: https://huggingface.co/newmean-ai/pii-medium
- Modelo small: https://huggingface.co/newmean-ai/pii-small
- Sitio del autor: https://newmean.ai
