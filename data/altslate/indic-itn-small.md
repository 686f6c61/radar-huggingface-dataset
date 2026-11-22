# altslate/indic-itn-small

## Resumen

Indic ITN Small es un modelo de normalización inversa de texto (inverse text normalization, ITN) desarrollado por altslate para diez lenguas de la India. Su función es reescribir texto en forma hablada —tal y como lo produce un sistema de reconocimiento automático del habla (ASR)— a forma escrita con dígitos: importes en rupias, horas, fechas, años, porcentajes, decimales, números de teléfono, rangos y marcadores de críquet. Es el modelo inverso de `altslate/indic-tts-normalizer-small`, del que deriva como modelo base.

Técnicamente es un modelo seq2seq de la familia T5 con 299.637.760 parámetros (aproximadamente 300M), empaquetado en `transformers` y también en ONNX (fp32 e int8 dinámico por canal). Cubre hindi, bengalí, tamil, telugu, maratí, gujarati, cannárada, malabar, panyabí y urdu, con la entrada prefijada por el código de idioma (`<lang>-itn: <texto>`).

Su relevancia práctica es clara: los ASR para lenguas indias escriben los números como palabras, y sin una capa ITN los subtítulos, las transcripciones de atención al cliente o los informes financieros resultan ilegibles o difíciles de procesar aguas abajo. El modelo declara una puntuación de coincidencia de dígitos de 0,935 en oraciones de Wikipedia y 0,985 en oraciones programáticas con un solo número, frente a 0,389 y 0,554 respectivamente de la alternativa basada en reglas `indic-punct`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (seq2seq, text2text-generation) |
| Parámetros totales | 299.637.760 (~300M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica procesar una frase a la vez; `max_new_tokens=512` en el ejemplo) |
| Tipos de cuantización | ONNX int8 dinámico por canal (`*_quantized.onnx`, ~460 MB); fp32 en PyTorch y ONNX |
| Idiomas soportados | hi, bn, ta, te, mr, gu, kn, ml, pa, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (encoder y decoder con y sin past, y merged; fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un seq2seq encoder-decoder de la familia T5, ajustado a partir de `altslate/indic-tts-normalizer-small` (que a su vez se etiqueta con `byt5` en los tags del repositorio). La tarea es una transformación monotónica a nivel de token: la entrada es texto en forma hablada con un prefijo de idioma y la salida es el mismo texto con los patrones numéricos convertidos a dígitos, manteniendo el resto del contenido sin cambios. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

Sí se documenta el protocolo de evaluación: se reservaron conjuntos de test no usados ni en entrenamiento ni en selección de hiperparámetros, formados por 568 oraciones de Wikipedia (split de validación de Dakshina) con forma hablada generada por reglas, 263 mensajes con forma hablada escrita por un LLM y validada por un juez, y conjuntos programáticos con uno o varios números. La métrica es coincidencia estricta de dígitos en orden, ignorando separadores. El modelo conserva por diseño los ordinales como palabras (`రెండవ`, `ஒன்றாம்`) y mantiene unidades y frases de críquet alrededor de los dígitos (`145 किलोमीटर`, `6 विकेट पर 245 रन`).

## Capacidades

- Normalización inversa de números escritos con palabras a dígitos ASCII sin agrupación (`12951`), salvo importes en rupias con `₹` y agrupación india (`₹1,23,456`).
- Conversión de paise a decimales (`₹1,250.50`) y de la palabra del punto decimal a `.` (`दो पूर्णांक पाच` → `2.5`).
- Normalización de horas (`चार बजकर तीस मिनट` → `4:30`, `दस बजे` → `10 बजे`), conservando marcadores como सुबह o दोपहर.
- Normalización de fechas y años: día y año a dígitos, mes como palabra (`19 एप्रिल 2003`, `1971`).
- Conversión de porcentajes (`37%`).
- Colapso de secuencias de dígitos sueltos (números de teléfono) en un único número (`9876543210`).
- Manejo de rangos y frases de críquet (`245/6` en forma hablada, `6 विकेट पर 245 रन`).
- Procesamiento de entrada con o sin puntuación (IndicConformer no genera puntuación).
- Multilingüe en diez lenguas indias mediante prefijo de código de idioma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step; es una tarea de transformación de texto acotada.

## Casos de uso

- Post-procesado de ASR en subtitulado: tras IndicConformer, Whisper o MMS, el modelo convierte las cifras dictadas en dígitos legibles (`₹1,250`, `4:30`) para que los subtítulos sean utilizables, con la ventaja de que acepta entrada sin puntuación.
- Transcripción de atención al cliente: en conversaciones telefónicas multi-turno, normaliza importes, fechas y números de referencia para que el texto resultante pueda indexarse y buscarse con expresiones regulares o motores de búsqueda.
- Extracción de datos financieros: los importes en rupias con agrupación india (`₹1,23,456`) y los decimales de paise quedan en un formato parseable, lo que facilita pipelines de contabilidad o conciliación a partir de notas de voz.
- Procesamiento de notas de voz en maratí, gujarati o panyabí: el modelo cubre lenguas con poca cobertura en herramientas ITN basadas en reglas (indic-punct no tiene urdu y obtiene 0,18 en gujarati en el test A), lo que lo hace útil para aplicaciones de mensajería y asistentes de voz regionales.
- Normalización de transcripciones deportivas: las frases de críquet con marcadores (`6 विकेट पर 245 रन`) se conservan con los dígitos en su sitio, adecuado para generar resúmenes de resultados a partir de audio.
- Preparación de corpus para TTS: al ser el inverso de `indic-tts-normalizer-small`, permite construir pares ida y vuelta para aumentar datos de entrenamiento de normalización de texto en las diez lenguas.
- Despliegue en el navegador o en el borde: la variante ONNX int8 (~460 MB) permite ejecutar la normalización con `transformers.js` u `onnxruntime` en entornos sin GPU, con salidas idénticas a PyTorch en el 99,3% de los casos del test de un número.

## Benchmarks y rendimiento

Coincidencia de dígitos (estricta, separadores ignorados):

| Test | Este modelo | indic-punct ITN (reglas, 2022) | Entrada sin cambios |
|---|---|---|---|
| A: oraciones de Wikipedia (568, split de validación de Dakshina) | 0,935 | 0,389 | 0 |
| B: mensajes (263, forma hablada escrita por LLM y validada por juez) | 0,449 | 0,281 | 0 |
| Programáticas reservadas, un número (2.194) | 0,985 | 0,554 | 0,076 |
| Programáticas reservadas, números con ceros internos (300) | 0,983 | no disponible | no disponible |

Por idioma (este modelo / indic-punct):

| | hi | bn | ta | te | mr | gu | kn | ml | pa | ur |
|---|---|---|---|---|---|---|---|---|---|---|
| A | 0,95/0,82 | 0,96/0,63 | 0,88/0,25 | 0,95/0,43 | 0,93/0,54 | 0,93/0,18 | 0,94/0,23 | 0,97/0,17 | 0,95/0,65 | 0,90/0 |
| B | 0,52/0,50 | 0,61/0,50 | 0,52/0,43 | 0,23/0,15 | 0,45/0,35 | 0,57/0,25 | 0,21/0,11 | 0,30/0,20 | 0,35/0,20 | 0,51/0 |

El autor advierte de que el test B debe leerse con cautela: el 56% de las formas habladas generadas por LLM malinterpretaban el número y se descartaron, y algunas aceptadas siguen siendo incorrectas, por lo que parte de la distancia a 1,0 está en las referencias. 32 de los 145 fallos son ordinales, que el modelo mantiene como palabras por diseño; sin ellos la puntuación en B sería 0,502. Los fallos reales en B son lecturas coloquiales y dígito a dígito (bengalí "ত্রিশ দুই" para 32), cadenas largas de dígitos leídas una a una (un número de tren `एक दो तीन चार पाँच` salió `123445`) y algunos importes en lakh en telugu.

Comparativa ONNX frente a PyTorch (decodificación greedy, tests programáticos reservados):

| | Un número (150 filas), exacto | Varios números (100 filas), exacto | Salidas idénticas a PyTorch |
|---|---|---|---|
| PyTorch | 0,980 | 0,930 | – |
| ONNX fp32 | 0,980 | 0,930 | 99,3% / 99% |
| ONNX int8 | 0,980 | 0,930 | 99,3% / 98% |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2 GB solo para pesos (300M parámetros × 4 bytes), más activaciones y caché; en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en int8: aproximadamente 0,3 GB de pesos; el conjunto ONNX int8 completo ocupa unos 460 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; para lotes grandes, A100 o H100 aportan margen, aunque el modelo es pequeño y no las requiere.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por frase.
- Opciones de despliegue: `transformers` (PyTorch), `onnxruntime`, `transformers.js` para navegador; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documenta soporte específico de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda alimentar una frase a la vez, lo que limita el beneficio del batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indic ITN Small (este modelo) | ~300M | no disponible | Seq2seq T5, 10 lenguas indias | Apache 2.0 | Hugging Face, ONNX |
| indic-punct ITN | Basado en reglas | No aplica | Reglas deterministas, 2022 | No disponible en la información | PyPI (`indic-punct`) |
| Indic TTS Normalizer Small | ~300M (modelo base) | no disponible | Normalización directa (texto a forma hablada) | Apache 2.0 | Hugging Face |

La comparación principal es frente a `indic-punct`, la alternativa de reglas: el modelo neuronal supera a las reglas en todos los conjuntos reportados (0,935 frente a 0,389 en A; 0,985 frente a 0,554 en programáticas de un número) y cubre urdu, que indic-punct no soporta. Como contrapartida, indic-punct es determinista y no requiere GPU. No se dispone de datos de benchmarks frente a otros normalizadores neuronales de lenguas indias.

## Limitaciones y advertencias

- El rendimiento en texto coloquial o espontáneo es notablemente inferior al de texto formal: 0,449 en el test B frente a 0,935 en el test A, con caídas acusadas en cannárada (0,21), telugu (0,23) y malabar (0,30).
- Los ordinales se mantienen como palabras por diseño; si el pipeline necesita `3.º` o `3rd`, habrá que añadir un paso posterior.
- Riesgo de error en cadenas largas de dígitos leídas una a una: el ejemplo documentado `एक दो तीन चार पाँच` produjo `123445`, un fallo grave para números de tren, identificadores o códigos postales.
- Las lecturas coloquiales de números (por ejemplo, bengalí "ত্রিশ দুই" para 32) no se normalizan correctamente.
- Algunos importes en lakh en telugu fallan según el autor.
- El test A usa el propio estilo de lectura del modelo para generar la forma hablada, por lo que mide oraciones reales pero no otras formas de decir un número; los resultados podrían ser optimistas frente a ASR con estilos distintos.
- El test B tiene referencias imperfectas (56% de formas habladas descartadas por malinterpretar el número), lo que hace que la puntuación real sea difícil de aislar.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus de lenguas indias puede reflejar desequilibrios de dominio (Wikipedia, noticias) y fallar en jerga regional o dialectos.
- No apto para generación libre de texto ni para tareas de razonamiento: es un transformador de formato y copia sin cambios todo lo que no reconoce.
- Licencia Apache 2.0, que permite uso comercial; aun así, conviene validar el comportamiento en el dominio propio antes de producción, dado el bajo rendimiento en texto espontáneo.
- El autor recomienda una frase por llamada, lo que complica el procesado de documentos largos sin troceado previo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/indic-itn-small
- Modelo base (normalizador TTS): https://huggingface.co/altslate/indic-tts-normalizer-small
- Alternativa basada en reglas: https://pypi.org/project/indic-punct/
- Dataset de evaluación Dakshina (split de validación citado por el autor): no disponible como enlace directo en la información proporcionada
- Paper, blog o repositorio adicional del autor: no disponibles en la información proporcionada
