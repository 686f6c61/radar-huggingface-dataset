# litert-community/granite-speech-5.0-470m-turboctc

## Resumen

Granite-speech-5.0-470m-turboctc es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por IBM Research bajo la familia Granite, publicado en Hugging Face como `ibm-granite/granite-speech-5.0-470m-turboctc`. La versión aquí descrita es una conversión comunitaria realizada por `litert-community` al formato LiteRT (`.tflite`) para inferencia en dispositivo (on-device) sobre CPU, orientada a móviles, portátiles y sistemas embebidos.

El modelo es un conformer CTC de aproximadamente 473 millones de parámetros. Su rasgo diferencial es que elimina por completo el bucle de decodificación autorregresiva: una única pasada del encoder produce directamente los logits CTC, y el "decodificador" en el host se reduce al colapso de repeticiones y la eliminación de blancos (id 0) seguido de la tokenización. No hay caché KV ni decodificación especulativa; el coste computacional es fijo por ventana de audio.

La relevancia actual radica en su perfil de despliegue: dos variantes cuantizadas (int8 dinámico de 518 MB y fp16 de 994 MB) que, según el autor, transcriben de forma idéntica al modelo PyTorch fp32 original en un conjunto de 20 clips de LibriSpeech dev-clean, con latencias de 238,8 ms para ventanas de 30 segundos en un Apple M4 Max (aproximadamente 126× tiempo real). Es, por tanto, una opción práctica para ASR local sin GPU y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (encoder con atención block-local de 128 frames) |
| Parametros totales | 473 M (aproximadamente 470 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas fijas de audio de 5 s, 10 s o 30 s (250, 500 y 1500 frames de entrada respectivamente) |
| Tipos de cuantizacion | int8 dynamic-range (todas las capas lineales, incluidas convoluciones pointwise) y fp16 con cómputo en float |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT `.tflite` (int8: 518 MB; fp16: 994 MB) |

## Arquitectura y entrenamiento

La arquitectura es un conformer CTC de 473 M de parámetros. La atención del encoder es block-local con bloques de 128 frames (aproximadamente 2,56 s de audio), lo que limita el coste de atención y permite procesar ventanas de hasta 30 s sin un crecimiento cuadrático prohibitivo. La salida del encoder se proyecta sobre un vocabulario CTC de 16.384 entradas; la operación argmax se ejecuta dentro del grafo, de modo que el modelo entrega directamente los ids de token, además de los logits.

El front-end es explícito y vive en el host: espectrograma log-mel de 80 canales (n_fft 512, win_length 400, hop_length 160 sobre audio de 16 kHz mono), normalización con suelo en `max − 8.0` y escalado `x/4 + 1`, concatenación de deltas (ventana 3) para obtener 160 canales, y apilado de dos frames para producir entradas de 320 dimensiones. El decodificador es el colapso CTC estándar más el tokenizer incluido. La model card no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación principal de esta conversión es la paridad numérica: el autor reporta que los logits int8 son bit-idénticos entre un Apple M4 Max y un Galaxy S26 (diferencia absoluta máxima 0,0), lo que indica que la ruta int8 dinámica es determinista entre dispositivos. La variante fp16 es aproximadamente 3× más lenta en CPU porque XNNPACK reempaqueta los pesos fp16 a fp32. El modelo es exclusivamente de CPU: el delegado GPU móvil no compila el grafo porque el gather de posición relativa se reduce a `GATHER_ND`, que las GPU móviles rechazan.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de 16 kHz mono, con ventanas fijas de 5, 10 o 30 segundos.
- Decodificación CTC no autorregresiva: una sola pasada del encoder, sin caché KV ni bucle de decodificación.
- Salida directa de ids de token y logits (vocabulario de 16.384 entradas), con el argmax calculado dentro del grafo.
- Procesamiento por lotes de tamaño 1 (batch 1 fijo en todas las firmas).
- Ejecución determinista en la ruta int8 dinámica, con paridad bit a bit entre dispositivos verificada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la transcripción.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo "thinking" ni de instrucciones en lenguaje natural: es un modelo puramente acústico.

## Casos de uso

- Dictado y notas de voz en aplicaciones móviles: el modelo int8 de 518 MB cabe en el almacenamiento de un teléfono y transcribe ventanas de 5 s en torno a 106 ms en un Galaxy S26, lo que permite retroalimentación casi instantánea sin enviar audio a la nube.
- Subtitulado local de reuniones y videollamadas: con la firma de 30 s y un troceado en pausas, se pueden generar subtítulos en inglés con latencia inferior a 250 ms por bloque en hardware de escritorio (M4 Max), sin coste de API.
- Transcripción por lotes en servidores sin GPU: al ser un modelo de CPU con throughput de aproximadamente 126× tiempo real en int8, un solo núcleo moderno puede procesar horas de audio en minutos, lo que abarata pipelines de archivado y búsqueda.
- Asistentes de voz embebidos en dispositivos IoT y wearables: el tamaño reducido y la ausencia de decodificador autorregresivo simplifican la integración en runtimes LiteRT con memoria limitada.
- Cumplimiento y privacidad de datos: al ejecutarse íntegramente on-device, el audio sensible (sanitario, legal, financiero) no abandona el dispositivo, lo que facilita el cumplimiento de normativas de protección de datos.
- Preprocesado de pipelines de NLP: transcripción previa a tareas de análisis de sentimiento, extracción de entidades o resumen, usando el texto generado como entrada de modelos de lenguaje de mayor tamaño.
- Pruebas de regresión y validación de conversiones: la paridad exacta con el modelo fp32 permite usar esta versión como referencia para verificar otras conversiones o cuantizaciones de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad ASR (WER sobre conjuntos estándar como LibriSpeech test-clean/test-other, Common Voice, etc.) en la información disponible. La model card remite a la model card del modelo base para la calidad de tarea.

Los únicos datos cuantitativos disponibles son de paridad de conversión y de latencia:

| Metrica | Valor |
|---|---|
| Paridad de transcripción (20 clips LibriSpeech dev-clean, 2-30 s) | int8: 20/20 idénticos al fp32; fp16: 20/20 idénticos |
| WER de corpus con ventanas fijas | 4,24 % (3,79 % sin padding; diferencia de +2 palabras en 448) |
| Determinismo int8 entre dispositivos | diferencia absoluta máxima 0,0 entre Apple M4 Max y Galaxy S26 |

| Latencia (mediana, 20 ejecuciones en caliente) | 5 s | 10 s | 30 s |
|---|---|---|---|
| Apple M4 Max, int8 (8 hilos) | 49,6 ms | 88,3 ms | 238,8 ms |
| Apple M4 Max, fp16 | 128,1 ms | 230,9 ms | 605,8 ms |
| Galaxy S26 (SM-S942Q), int8 | 106,4 ms | 220 ms (dato truncado en la información disponible) | no disponible |

## Requisitos de hardware

- VRAM: no aplica; el modelo es de CPU. El consumo es de memoria RAM del sistema, aproximadamente proporcional al tamaño del fichero (518 MB int8, 994 MB fp16) más el estado del intérprete y los buffers de activación.
- GPU recomendadas: ninguna; el delegado GPU móvil no compila el grafo (fallo medido en Galaxy S26 con `Failed to compile model`). No hay datos de rendimiento en GPU de escritorio.
- Compatibilidad con GPU de consumo: no verificada en la información disponible; el diseño es explícitamente CPU-first.
- Despliegue: runtime LiteRT (`ai_edge_litert.interpreter.Interpreter` o `CompiledModel` de litert 2.2.0), con XNNPACK como backend de CPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: en Apple M4 Max con int8 y 8 hilos, 238,8 ms por ventana de 30 s (aproximadamente 126× tiempo real); en Galaxy S26, 106,4 ms para 5 s y 220 ms para 10 s. La variante fp16 es aproximadamente 3× más lenta en CPU.
- Nota de despliegue: usar int8 en dispositivo; el modelo procesa la ventana completa independientemente de la duración real del habla, por lo que la latencia indicada es también el peor caso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parametros | Contexto / ventana | Formato y despliegue | Licencia |
|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc (LiteRT, esta ficha) | 473 M | ventanas fijas de 5/10/30 s | LiteRT `.tflite`, CPU on-device | Apache 2.0 |
| ibm-granite/granite-speech-5.0-470m-turboctc (original) | 473 M | no disponible en la información | PyTorch fp32 | Apache 2.0 |
| Whisper (variantes pequeñas/medianas de OpenAI) | no disponible en la información | no disponible en la información | múltiples (incl. conversiones comunitarias) | MIT (según conocimiento general; no verificado en esta búsqueda) |
| Otros ASR CTC conformer on-device | no disponible | no disponible | no disponible | no disponible |

No se han podido verificar cifras de WER ni latencias de los modelos alternativos dentro de la información disponible; cualquier comparación de rendimiento requeriría una evaluación propia sobre el mismo conjunto de audio.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado; el rendimiento en otros idiomas no está caracterizado.
- Ventanas fijas: el audio debe rellenarse con ceros hasta la ventana más pequeña que lo contenga (5, 10 o 30 s); no existe procesamiento de longitud variable.
- Efecto de padding: la atención block-local de 128 frames hace que el relleno pueda desplazar los límites de bloque; en 20 clips de LibriSpeech, 19 transcribieron igual que sin padding y uno cambió una palabra.
- Audio largo: requiere troceado manual en pausas y concatenación de transcripciones; no hay gestión interna de secuencias largas.
- Solo CPU: el delegado GPU móvil no compila el grafo; no se debe esperar aceleración por GPU.
- fp16 desaconsejado en CPU: aproximadamente 3× más lento que int8 por el reempaquetado de pesos de XNNPACK.
- Paridad verificada sobre un conjunto pequeño (20 clips); no constituye una evaluación ASR exhaustiva ni garantiza el mismo comportamiento en dominios acústicos distintos (ruido, acentos, audio telefónico).
- Riesgo de alucinación: no caracterizado en la información disponible; en modelos CTC el riesgo típico es la inserción de tokens en silencios o ruido, no la generación libre de texto.
- Sesgos: no documentados en la información proporcionada; al estar entrenado presumiblemente sobre corpus en inglés, es esperable un sesgo hacia variedades y hablantes sobrerrepresentados en dichos datos.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas aquí.
- Dependencia de un runtime específico (LiteRT) y de un front-end implementado manualmente en el host; errores en el cálculo de log-mel, deltas o apilado degradan la transcripción sin aviso.

## Enlaces

- Modelo en Hugging Face (esta conversión): https://huggingface.co/litert-community/granite-speech-5.0-470m-turboctc
- Modelo base original: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Runtime LiteRT (`ai_edge_litert`): no disponible en la información proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
