# sheikhmufrad/Qwen3-ASR-0.6B-Bengali-GGUF

## Resumen

Qwen3-ASR-0.6B-Bengali-GGUF es una conversión al formato GGUF del ajuste fino en bengalí del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, desarrollado originalmente por el equipo Qwen de Alibaba. El ajuste fino lo firma SayedShaun y la conversión y empaquetado para el motor transcribe.cpp los realiza sheikhmufrad. El modelo resuelve un problema concreto: el modelo base de Qwen no incluye el bengalí entre sus 30 idiomas, por lo que este fine-tune añade esa capacidad entrenando sobre 1.174 horas de audio en bengalí procedentes de nueve corpus distintos.

La relevancia práctica está en el formato: un único archivo GGUF de 850 MB (Q8_0) que se ejecuta completamente en local, sin Python, sobre el motor C++ transcribe.cpp y la aplicación de dictado Handy. El modelo declara 782.452.240 parámetros reales en safetensors y licencia Apache-2.0 heredada de toda la cadena. Reporta un WER del 14,74 % y un CER del 5,34 % sobre un conjunto de test de 10.485 enunciados.

Es, por tanto, una pieza de infraestructura para dictado y transcripción en bengalí en entornos de escritorio, no un modelo conversacional general. Su utilidad depende de asumir sus limitaciones: salida sin puntuación, sin streaming y con un presupuesto de generación que en el motor estándar trunca pasajes largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-0.6B; familia Qwen3) |
| Parametros totales | 782.452.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0: 850 MB; BF16: 1,5 GB) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El modelo es un ajuste fino de Qwen/Qwen3-ASR-0.6B, un modelo de reconocimiento automático del habla de la familia Qwen3 con aproximadamente 0,78 mil millones de parámetros. El fine-tune se entrenó sobre 1.174 horas de audio en bengalí agregadas de nueve conjuntos de datos: IndicVoices, OpenSLR-53, Vaani, Kathbath, Common Voice, Shrutilipi, FLEURS y otros no especificados. El entrenamiento se realizó en una única RTX 5080.

La conversión a GGUF se hizo con las herramientas del proyecto transcribe.cpp (`convert-qwen3_asr.py` y `transcribe-quantize`) sobre una revisión fijada del repositorio upstream. Según la model card, la cuantización Q8_0 se midió dentro del margen de ruido respecto a BF16 en el modelo base en inglés (2,11 % frente a 2,12 % de WER en LibriSpeech test-clean). No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación específicas.

## Capacidades

- Transcripción de voz a texto en bengalí (bn), tanto en registro leído como conversacional.
- Funcionamiento completamente offline: no requiere conexión ni servicios en la nube.
- Integración con la aplicación de dictado Handy mediante autodescubrimiento de archivos GGUF en la carpeta de modelos.
- Uso directo desde línea de comandos con `transcribe-cli` del proyecto transcribe.cpp.
- Entrada de audio en WAV mono a 16 kHz (conversión previa con ffmpeg para otros formatos).
- Detección automática de idioma: el GGUF anuncia los 30 idiomas del modelo base para que la lógica de selección coaccione a auto.
- No soporta streaming: la transcripción se ejecuta al detener la grabación.
- No genera puntuación: la salida es texto plano sin signos.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado personal en bengalí: el escenario principal del modelo. Un usuario instala Handy, coloca el GGUF en la carpeta de modelos y dicta en bengalí de forma totalmente offline, con un archivo de 850 MB y sin dependencias de Python.
- Transcripción de reuniones y entrevistas en bengalí: grabaciones de audio convertidas a WAV mono 16 kHz y procesadas por lotes con `transcribe-cli`, adecuado para generar actas o corpus textuales a partir de material oral.
- Generación de subtítulos para vídeo en bengalí: el modelo transcribe la pista de audio y el texto resultante se alinea posteriormente con marcas de tiempo en un pipeline externo, dado que el modelo no produce timestamps por sí mismo.
- Creación de corpus para entrenamiento de ASR: las 1.174 horas de entrenamiento y el WER reportado lo sitúan como candidato para pseudo-etiquetar audio bengalí adicional y ampliar datasets.
- Accesibilidad para hablantes de bengalí: dictado de textos largos en entornos de escritorio Windows, macOS o Linux, con la salvedad de fragmentar en ráfagas de 30 a 40 segundos con el motor estándar.
- Investigación en ASR de bajos recursos: punto de partida reproducible (Apache-2.0, GGUF, motor C++) para comparar fine-tunes sobre el mismo base y estudiar el efecto de la cuantización en idiomas no incluidos en el modelo original.
- Transcripción en dispositivos sin GPU dedicada: al ser un modelo de 0,78 mil millones de parámetros en Q8_0, el coste de cómputo es moderado y encaja en portátiles convencionales, según el reporte de 10 a 13 veces tiempo real en un Apple M5.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 14,74 % | Test held-out del fine-tune (10.485 enunciados) |
| CER | 5,34 % | Test held-out del fine-tune (10.485 enunciados) |
| WER LibriSpeech test-clean (modelo base, inglés) | 2,11 % (Q8_0) / 2,12 % (BF16) | LibriSpeech test-clean |
| Velocidad | ~10–13× tiempo real | Apple M5, comparación informal de dictado |

La model card menciona una comparación informal de un solo hablante en la que el modelo superó claramente a un Whisper large-v3-turbo ajustado a bengalí en habla conversacional, incluidos nombres propios. No se aportan cifras de esa comparación ni resultados de benchmarks estándar adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,78 mil millones de parámetros, Q8_0 ocupa 850 MB en disco y BF16 1,5 GB, por lo que la huella en memoria es del orden de 1 a 2 GB más el overhead del motor.
- GPU recomendadas: no se especifican. El fine-tune se entrenó en una RTX 5080; la inferencia reportada se midió en CPU/SoC de Apple M5.
- Cabe en GPU de consumo: sí, por tamaño; no se detallan modelos concretos compatibles.
- Opciones de despliegue: transcribe.cpp (`transcribe-cli`) y la aplicación Handy; también se puede descargar con `hf download` a la caché de Hugging Face, desde donde Handy lo descubre automáticamente.
- Latencia y throughput: aproximadamente 10 a 13 veces tiempo real en un Apple M5 según la model card; sin datos para otras plataformas.
- Requisito de entrada: WAV mono a 16 kHz.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER bengalí | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-Bengali-GGUF (este) | 782.452.240 | bn | no disponible | 14,74 % (test propio) | Apache-2.0 | GGUF |
| Qwen/Qwen3-ASR-0.6B (base) | ~0,6 B | 30 idiomas (sin bn) | no disponible | no aplica (no soporta bn) | no disponible en la información | safetensors |
| Whisper large-v3-turbo ajustado a bengalí | no disponible | multilingüe | no disponible | no disponible (solo comparación cualitativa) | no disponible en la información | no disponible |

La comparación con Whisper large-v3-turbo es únicamente cualitativa según la model card y no se aportan cifras. No se dispone de datos suficientes para comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Solo bengalí: los demás idiomas del modelo base no se conservaron; el audio en otros idiomas produce bengalí fonético corrupto.
- Sin puntuación: la salida es texto plano sin signos, lo que exige postprocesado para muchos usos.
- Configuración de idioma en Auto obligatoria: el motor no tiene entrada de bengalí en su tabla de sugerencias; forzar un idioma provoca el error `unsupported language`. El GGUF anuncia los 30 idiomas del base precisamente para coaccionar la selección a auto.
- Truncamiento en pasajes largos: el motor estándar dimensiona el presupuesto de generación con una estimación multilingüe de tokens por segundo que el bengalí supera (~6 tokens/palabra frente a ~1,2 en inglés), por lo que conviene dictar en ráfagas de 30 a 40 segundos. Existe una propuesta upstream (transcribe.cpp#239) que escala el presupuesto por familia y permite decodificar pasajes continuos, validada a 105 segundos.
- Sin streaming: la transcripción se ejecuta al detener la grabación, lo que descarta casos de uso en tiempo real.
- Riesgo de alucinación inherente a los modelos ASR: posibles sustituciones de palabras, especialmente en nombres propios y audio ruidoso; el WER del 14,74 % implica un error no trivial en producción.
- Licencia Apache-2.0 heredada de toda la cadena, lo que permite uso comercial; conviene revisar el archivo NOTICE del repositorio.
- El modelo tiene 129 descargas y 0 likes en el momento de la consulta, con lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sheikhmufrad/Qwen3-ASR-0.6B-Bengali-GGUF
- Modelo base del fine-tune: https://huggingface.co/SayedShaun/Qwen3-ASR-0.6B-Bengali
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Handy: https://github.com/cjpais/Handy
- Pull request con la corrección del presupuesto de generación: https://github.com/handy-computer/transcribe.cpp/pull/239
- Perfil del autor del fine-tune: https://huggingface.co/SayedShaun
