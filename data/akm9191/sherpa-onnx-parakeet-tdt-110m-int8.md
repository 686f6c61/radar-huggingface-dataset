# akm9191/sherpa-onnx-parakeet-tdt-110m-int8

## Resumen

Parakeet TDT 110M English (int8 ONNX, sherpa-onnx) es una distribución del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt_ctc-110m` de NVIDIA, exportado a ONNX y cuantizado a int8 para su uso con el runtime sherpa-onnx (k2-fsa / Next-gen Kaldi). El repositorio, publicado por el usuario akm9191, es una copia sin modificaciones del paquete `sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000-int8` de la release oficial de modelos ASR de sherpa-onnx. Está pensado para transcripción offline de inglés en dispositivos, sin salida a red.

El modelo es un transducer (TDT, token-and-duration transducer) de aproximadamente 110 millones de parámetros, entrenado por NVIDIA NeMo sobre unas 36.000 horas de audio en inglés, con salida de puntuación y mayúsculas. Su interés práctico es el tamaño reducido (unos 137 MB en total entre encoder, decoder y joiner int8) y su velocidad: en un Snapdragon 8 Gen 2 con 2 hilos carga en 0,9 s y consume aproximadamente 0,025 s de cómputo por segundo de audio.

El caso de uso documentado es la app Android Daily Whisper, donde actúa como segunda pasada de refinado sobre las frases detectadas por VAD, sustituyendo la transcripción en streaming por una versión más precisa. Frente al modelo en streaming solo, reduce la tasa de error de palabras del 38,3 % al 13,4 % en inglés indio y del 10,0 % al 6,6 % en LibriSpeech test-other.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer con decodificación TDT (token-and-duration transducer), exportado a ONNX (encoder, decoder y joiner separados) |
| Parametros totales | 110M (aproximado, según nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR por segmentos de audio, no de texto) |
| Tipos de cuantizacion | int8 (única versión publicada en este repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) más `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es un transducer de NVIDIA NeMo con decodificación TDT, una variante que predice conjuntamente el token y su duración, lo que reduce el número de pasos de decodificación frente a un transducer convencional. El repositorio distribuye los tres componentes clásicos del transducer (encoder, decoder/prediction network y joiner) ya exportados a ONNX y cuantizados a int8, listos para el runtime sherpa-onnx con `model_type=nemo_transducer`.

El entrenamiento original lo realizó NVIDIA sobre aproximadamente 36.000 horas de audio en inglés. La exportación a ONNX y la cuantización int8 las realizó el equipo de k2-fsa / Next-gen Kaldi en su release de modelos ASR (mayo de 2026); el autor de este repositorio no ha modificado los artefactos. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni técnicas adicionales de optimización más allá de la cuantización int8.

## Capacidades

- Reconocimiento automático del habla offline en inglés, con salida de texto con puntuación y mayúsculas.
- Decodificación por frases o segmentos de audio completos (no es un modelo de streaming nativo en esta configuración).
- Integración con VAD externo (Silero VAD en el caso documentado) para segmentar el audio antes de la transcripción.
- Funcionamiento totalmente local: el audio no sale del dispositivo.
- Ejecución mediante sherpa-onnx en Android y otras plataformas soportadas por el runtime.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá de ASR ni modos de razonamiento: es exclusivamente un modelo ASR.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Notas de voz en aplicaciones móviles: transcribir dictados y reuniones en inglés en el propio dispositivo, sin enviar audio a servidores, usando sherpa-onnx como runtime y este paquete int8 como motor.
- Segunda pasada de refinado en pipelines de streaming: combinar un modelo en streaming rápido para la transcripción en vivo con este modelo para reescribir cada frase al detectar una pausa con VAD, mejorando la precisión final (documentado en Daily Whisper).
- Subtitulado offline de grabaciones en inglés: procesar ficheros de audio ya existentes en lotes sobre CPU, dado el bajo coste de cómputo (unos 0,025 s por segundo de audio en un Snapdragon 8 Gen 2).
- Transcripción en dispositivos con recursos limitados: el paquete completo ocupa unos 137 MB y el proceso de prueba alcanzó unos 450 MB de memoria pico, lo que permite desplegarlo en móviles de gama media y sistemas embebidos.
- Aplicaciones de accesibilidad: dictado por voz en inglés integrado en apps de toma de notas o comunicación asistida, funcionando sin conectividad.
- Preprocesado de datos de voz para pipelines de NLP: generar transcripciones en inglés de corpus de audio de forma local y económica antes de aplicar análisis posteriores.
- Prototipado rápido de ASR con sherpa-onnx: validar un flujo completo de transcripción con un modelo pequeño y cuantizado antes de escalar a variantes mayores como `parakeet-tdt-0.6b-v2-int8`.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 400 clips (200 de inglés indio y 120 de otros acentos de EdACC, 80 de LibriSpeech test-other), con normalización de texto estilo Whisper y ajustes de la app Daily Whisper (ganancia automática, Silero VAD con pausa de 2,0 s):

| Configuracion | Ingles indio (WER) | Otros acentos (WER) | LibriSpeech test-other (WER) |
|---|---|---|---|
| Streaming zipformer en int8 en solitario | 38,3 % | 45,3 % | 10,0 % |
| + este modelo por frase (dos pasadas) | 13,4 % | 16,5 % | 6,6 % |

Medición adicional en Galaxy Z Fold 5 (Snapdragon 8 Gen 2, 2 hilos): carga en 0,9 s, aproximadamente 0,025 s de cómputo por segundo de audio, unos 450 MB de memoria pico para el proceso completo de prueba, y 12,5 % de WER en 30 de los clips (13,0 % en la caja de referencia). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR; no hay datos de WER sobre LibriSpeech test-clean ni sobre otros conjuntos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario documentado (ejecución en CPU); el paquete int8 ocupa aproximadamente 137 MB en disco y el proceso de prueba alcanzó unos 450 MB de memoria pico.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y dispositivos móviles. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no se documentan cifras.
- Cabe en GPU de consumo: sí, por tamaño (menos de 0,2 GB de pesos), aunque no se aportan datos de rendimiento en GPU.
- Despliegue: sherpa-onnx (runtime principal, con `model_type=nemo_transducer`); al ser ONNX int8, también puede ejecutarse con ONNX Runtime en otras plataformas, aunque no está documentado en la model card.
- Latencia y throughput: en Snapdragon 8 Gen 2 con 2 hilos, 0,9 s de carga y aproximadamente 0,025 s de cómputo por segundo de audio (factor de tiempo real aproximado de 40x en CPU móvil).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / uso | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Parakeet TDT 110M int8) | 110M | ASR por segmentos | Inglés | CC-BY-4.0 | ONNX int8 | Paquete de ~137 MB, orientado a CPU y móvil |
| akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8 | 0,6B | ASR por segmentos | Inglés | No disponible en la información | ONNX int8 | Alternativa mayor y presumiblemente más precisa, más lenta; citada como referencia por el autor |
| Streaming zipformer en int8 | No disponible | ASR en streaming | Inglés | No disponible en la información | No disponible | Usado como primera pasada en el test de Daily Whisper; WER del 38,3 % en inglés indio en solitario |

No se dispone de datos de benchmarks comparativos directos con otros modelos ASR de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni code-switching de forma fiable.
- El WER es notablemente peor en acentos no nativos: 13,4 % en inglés indio y 16,5 % en otros acentos frente al 6,6 % en LibriSpeech test-other; la muestra de inglés indio proviene de solo 3 hablantes, lo que limita la generalización de esa cifra.
- No es un modelo de streaming nativo en esta configuración: requiere segmentación previa (por ejemplo, con VAD) para un uso en tiempo real.
- Riesgo de errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario técnico; no se documentan mecanismos de mitigación más allá de la normalización de texto.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y a los autores de la exportación; es necesario conservar el aviso de licencia.
- El repositorio es un espejo sin modificaciones de un artefacto de terceros; la responsabilidad de mantenimiento y actualizaciones recae en la release original de k2-fsa.
- Sin datos publicados sobre sesgos demográficos o de acento más allá de la evaluación descrita; conviene validar con muestras propias antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akm9191/sherpa-onnx-parakeet-tdt-110m-int8
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Alternativa mayor citada: https://huggingface.co/akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Release de modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Dataset EdACC: https://huggingface.co/datasets/edinburghcstr/edacc
