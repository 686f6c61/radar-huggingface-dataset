# moonshine-ai/moonshine-streaming-small-ja

## Resumen

Moonshine Streaming Small - Japanese es un modelo de reconocimiento automático del habla (ASR) diseñado para transcripción incremental en japonés, desarrollado por Useful Sensors y publicado bajo el nombre de moonshine-ai. Con 112,9 millones de parámetros, está pensado para ejecutarse en dispositivos de gama baja (edge-class hardware) y ofrece baja latencia gracias a su arquitectura de streaming con ventanas deslizantes en el encoder. El modelo se entrena sobre un corpus masivo de audio pseudo-etiquetado (unas 159.000 horas combinadas de podcasts y YouTube) y se distribuye con licencia MIT, lo que facilita su integración comercial.

La relevancia actual de este modelo radica en que cubre un nicho poco atendido: ASR japonés de alta calidad, en tiempo real y con un tamaño reducido que cabe en entornos con recursos limitados. Su frontend de audio a 50 Hz y su encoder con ventanas deslizantes permiten transcribir mientras se habla, sin esperar al final de la frase. El modelo se ofrece en formato safetensors y es compatible con la librería Transformers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con frontend de audio de 50 Hz, encoder con ventanas deslizantes y decoder con RoPE |
| Parametros totales | 112.872.248 (112,9 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ASR, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un frontend de audio que extrae características a 50 Hz con normalización CMVN y compresión asinh, seguido de dos convoluciones causales con stride 2. El encoder es un Transformer de 10 capas con anchura 620 y 8 cabezas, que aplica ventanas deslizantes de atención: las dos primeras y las dos últimas capas usan ventanas (16, 4) —con 4 frames de lookahead, unos 80 ms— y las capas intermedias usan (16, 0), sin lookahead. El decoder tiene 10 capas con anchura 512 y 8 cabezas, con RoPE aplicado sobre 32 de las 64 dimensiones de cada cabeza. Un adaptador con embeddings posicionales aprendidos proyecta la salida del encoder (620) a la dimensión del decoder (512).

El entrenamiento se realizó sobre un corpus de audio japonés pseudo-etiquetado: aproximadamente 109.000 horas de podcasts y 50.000 horas de YouTube, transcritas automáticamente con un modelo profesor de la familia Whisper. No se utilizó transcripción humana verificada para la mayor parte del entrenamiento, por lo que el modelo hereda los errores del profesor en nombres propios, numerales y cambios de código. El tokenizer es específico para japonés con un vocabulario de 12.288 entradas.

## Capacidades

- Transcripción de voz japonesa en streaming, con salida incremental mientras se habla.
- Baja latencia: el encoder con ventanas deslizantes permite procesar audio en fragmentos de 80 ms sin esperar al final de la frase.
- Adecuado para ejecución en dispositivos de gama baja (edge) gracias a su tamaño reducido (112,9 M parámetros).
- Soporte de audio muestreado a 16 kHz, con procesador que rellena el audio a múltiplos de 80 muestras.
- No incluye capacidades de tool calling, visión ni otras modalidades; es exclusivamente ASR.

## Casos de uso

- Transcripción en tiempo real de reuniones y videollamadas: el modelo puede transcribir mientras los participantes hablan, generando subtítulos en vivo con latencia de unos 80 ms de lookahead.
- Asistentes de voz en japonés para dispositivos embebidos: su tamaño reducido permite ejecutarlo en Raspberry Pi o hardware similar, procesando comandos de voz sin conexión a la nube.
- Subtitulado automático de vídeos y podcasts: al ser streaming, puede procesar archivos de audio largos de forma incremental, generando subtítulos con marcas de tiempo.
- Sistemas de dictado para aplicaciones de productividad: integrable en editores de texto o entornos de desarrollo para entrada de voz en japonés.
- Accesibilidad: ayuda a personas con discapacidad motora a interactuar con dispositivos mediante voz, con respuesta inmediata.
- Análisis de llamadas y atención al cliente: transcripción en vivo de conversaciones telefónicas para búsqueda de información o generación de resúmenes, siempre que se cumplan las restricciones de uso ético.

## Benchmarks y rendimiento

El modelo se evalúa con character error rate sin espacios (`cer_nospace`), métrica adecuada para japonés. Los resultados provienen de la model card del autor.

| Panel | CER (muestra de 400, batch 1) |
|---|---:|
| `fleurs_ja` | 7.99 |
| `reazonspeech_ja` | 26.31 |
| **macro** | **17.15** |

Comparación entre el checkpoint de entrenamiento y los pesos convertidos de este repositorio (misma muestra, batch 1):

| | `fleurs_ja` | `reazonspeech_ja` | macro |
|---|---:|---:|---:|
| Training checkpoint | 7.99 | 26.31 | 17.153 |
| Este repositorio | 7.90 | 26.69 | 17.295 |

La diferencia es mínima (0.054 puntos de macro excluyendo casos de fuga), atribuible al alineamiento de frames del frontend. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM en la documentación del modelo.
- Con 112,9 M de parámetros, el modelo es ligero y está diseñado para ejecutarse en hardware de gama baja (edge-class), por lo que es plausible que quepa en GPUs de consumo como una RTX 3060 o incluso en CPU, pero no hay cifras oficiales.
- Opciones de despliegue: compatible con la librería Transformers de HuggingFace; no se mencionan vLLM, llama.cpp u otras herramientas específicas.
- La latencia estimada es baja gracias al diseño streaming, pero no se ofrecen valores concretos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (macro) | Licencia |
|---|---|---|---:|---|
| Moonshine Streaming Small - Japanese (este) | 112,9 M | no aplica | 17.15 | MIT |
| Moonshine Streaming Tiny - Japanese | ~28 M (un cuarto del Small) | no aplica | ~19.65 (aprox. 2.5 CER peor) | MIT |

No se dispone de datos de otros modelos comparables en la información proporcionada. El modelo Tiny es la alternativa más cercana del mismo autor, con un tamaño cuatro veces menor y un CER aproximadamente 2.5 puntos peor.

## Limitaciones y advertencias

- Datos de entrenamiento pseudo-etiquetados: el modelo reproduce los errores del profesor Whisper, especialmente en nombres propios, numerales y cambios de código.
- Bucles de repetición: alrededor del 0.75% de las frases cortas o ruidosas pueden caer en repeticiones infinitas; se recomienda limitar la longitud de salida (`max_new_tokens`).
- Sensibilidad a frases muy cortas: el rendimiento empeora notablemente en clips de referencia breve, donde pequeños cambios numéricos producen grandes variaciones por frase.
- Evaluación limitada: solo se ha probado en habla leída (FLEURS) y habla espontánea (ReazonSpeech); no hay datos sobre telefonía, habla infantil, dialectos fuertes ni condiciones de campo lejano ruidoso.
- Uso fuera de alcance: no está destinado a vigilancia no consentida, identificación de hablantes ni decisiones de alto riesgo.
- Requiere pasar el `attention_mask` al encoder; sin él, el modelo atiende a toda la frase y se comporta de forma diferente a lo entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moonshine-ai/moonshine-streaming-small-ja
- Modelo base en inglés: https://huggingface.co/moonshine-ai/moonshine-streaming-small
- Repositorio GitHub de Moonshine: https://github.com/moonshine-ai/moonshine
- Ejemplo de integración iOS: https://github.com/moonshine-ai/moonshine/tree/main/examples/ios/Transcriber/models/small-streaming-en
