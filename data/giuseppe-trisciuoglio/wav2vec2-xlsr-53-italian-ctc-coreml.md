# giuseppe-trisciuoglio/wav2vec2-xlsr-53-italian-ctc-coreml

## Resumen

`wav2vec2-xlsr-53-italian-ctc-coreml` es una conversión a Core ML del modelo de reconocimiento de voz `jonatasgrosman/wav2vec2-large-xlsr-53-italian`, publicada por el desarrollador giuseppe-trisciuoglio. No es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: los pesos originales de PyTorch (1.262.114.199 bytes, `pytorch_model.bin`, revisión `dab04a3e00d8326052f3fb22a6ff276b822f6131`) se convierten con `coremltools` a formato mlprogram en fp16, con objetivo macOS 15 y una ventana fija de 20 segundos de audio. El resultado se distribuye compilado con `xcrun coremlcompiler`.

El propósito concreto del artefacto es servir como alineador forzado CTC (forced aligner) dentro de MeetRecord (macOS). Es decir, recibe audio ya transcrito por otro backend y devuelve probabilidades logarítmicas por fotograma que permiten calcular marcas temporales a nivel de palabra; de este modo se puede atribuir cada palabra a un hablante en sistemas de diarización que no generan timings propios. El modelo solo cubre italiano y no está pensado como transcriptor autónomo de propósito general.

La relevancia es de nicho pero clara para desarrolladores de aplicaciones macOS: empaqueta un modelo wav2vec2 large en un formato nativo de Apple ejecutable en Neural Engine y GPU integrada, con una interfaz de entrada/salida fija y documentada, lo que simplifica la integración en pipelines de alineación sin depender de PyTorch en el dispositivo. La licencia Apache-2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + atención, CTC), convertido a Core ML mlprogram |
| Parametros totales | no disponible (el modelo base es wav2vec2-large; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 20 s de audio (320.000 muestras a 16 kHz, 999 fotogramas de 320 muestras) |
| Tipos de cuantizacion | fp16 (conversión Core ML); no se documentan otras variantes |
| Idiomas soportados | italiano (`it`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `ctc.mlmodelc/` (Core ML compilado) y `alignment.json` (vocabulario, blank id, delimitador de palabra, stride de fotograma, procedencia) |
| Entrada | tensor `waveform` float32 `[1, 320000]`, normalizado a media cero y varianza unitaria |
| Salida | tensor `log_probabilities` float32 `[1, 999, 44]` (log-probabilidades sobre 44 clases) |
| Tamano del repo | 0,6 GB |
| Modelo base | `jonatasgrosman/wav2vec2-large-xlsr-53-italian` @ `dab04a3e00d8326052f3fb22a6ff276b822f6131` |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2 en variante large, preentrenada sobre XLS-R 53 (el corpus multilingüe de 56.000 horas que combina Multilingual LibriSpeech, CommonVoice y BABEL) y afinada para italiano por jonatasgrosman con cabecera CTC. El modelo original se entrenó con `pytorch_model.bin` y se distribuye bajo Apache-2.0; el autor de esta ficha no aporta detalles adicionales sobre el dataset de afinamiento, el número de tokens de audio ni si hubo técnicas de regularización o decodificación específicas.

La innovación de esta publicación no está en el entrenamiento, sino en la conversión: se usa `coremltools` en modo mlprogram con precisión fp16 y objetivo macOS 15, se fija una ventana de entrada de 20 segundos (320.000 muestras a 16 kHz) y se compila el artefacto con `xcrun coremlcompiler`. La receta de conversión está en `scripts/spikes/260-forced-alignment/convert_coreml.py` del repositorio de MeetRecord. La salida son log-probabilidades CTC por fotograma, con un stride de 320 muestras, más un `alignment.json` que describe el vocabulario y el `blank id` necesarios para reconstruir la alineación. No se documenta decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá del propio runtime de Core ML.

## Capacidades

- Alineación forzada CTC a nivel de palabra: dado un audio y una transcripción, produce log-probabilidades por fotograma que permiten calcular timings de cada palabra.
- Generación de marcas temporales para backends de transcripción que no las producen (caso de uso original en MeetRecord).
- Atribución de hablante palabra a palabra cuando se combina con un sistema de diarización.
- Reconocimiento de voz en italiano como capacidad derivada del modelo base (cabecera CTC sobre vocabulario de 44 clases), aunque el artefacto está empaquetado y documentado para alineación, no como ASR de propósito general.
- Inferencia nativa en macOS mediante Core ML (Neural Engine / GPU integrada), sin dependencia de PyTorch en el dispositivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades distintas del audio.
- No soporta otros idiomas distintos del italiano.

## Casos de uso

- Alineación forzada en aplicaciones de transcripción para macOS: se pasa la ventana de 20 s de audio normalizada y la transcripción al modelo; las log-probabilidades CTC permiten derivar el instante de inicio y fin de cada palabra. Es el caso para el que se publicó el artefacto.
- Diarización con atribución palabra a palabra: en reuniones o entrevistas, el alineador aporta timings que el motor de diarización cruza con los segmentos de cada hablante, de modo que la transcripción final asigna cada palabra a la persona correcta.
- Subtitulado y sincronización de transcripciones: los timings por palabra permiten generar subtítulos con marcas precisas o resincronizar un texto ya transcrito con el audio original.
- Búsqueda y navegación dentro de grabaciones: con marcas temporales por palabra se puede implementar búsqueda por término que salte al instante exacto del audio en el que se pronunció.
- Edición de audio basada en texto: en herramientas de edición de pódcast o vídeo, los timings permiten cortar, reordenar o eliminar fragmentos seleccionando palabras en la transcripción.
- Evaluación de calidad de ASR: comparar la alineación del modelo con los timings del transcriptor permite detectar desajustes, palabras omitidas o errores de segmentación en un pipeline de control de calidad.
- Procesamiento local y privado en macOS: al ejecutarse como modelo Core ML, el audio no necesita salir del dispositivo, lo que encaja en escenarios con requisitos de privacidad (sanidad, legal, grabaciones internas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, tasas de alineación correcta, latencia ni throughput, y la búsqueda web solo aporta documentación genérica sobre el preentrenamiento XLS-R 53, no métricas de este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo Core ML fp16 de aproximadamente 0,6 GB de repositorio, la huella en memoria es del orden de cientos de MB, pero el autor no publica cifras.
- GPU recomendadas: no aplica en el sentido de GPU discretas; el artefacto está pensado para ejecutarse en hardware Apple (Neural Engine y GPU integrada) bajo macOS 15 o superior, que es el objetivo de compilación declarado.
- Compatibilidad con GPU de consumo: no está pensado para GPUs NVIDIA ni AMD; el formato `.mlmodelc` solo se ejecuta en el runtime de Core ML de Apple.
- Opciones de despliegue: Core ML en macOS 15+ (carga del `.mlmodelc` compilado). Para el modelo base en PyTorch existen otras vías (transformers, torchaudio), pero no se documentan para este artefacto.
- Latencia y throughput: no disponibles. La ventana fija de 20 s y los 999 fotogramas de salida condicionan el coste por invocación, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Idioma | Licencia | Formato |
|---|---|---|---|---|---|---|
| `giuseppe-trisciuoglio/wav2vec2-xlsr-53-italian-ctc-coreml` | wav2vec2 large + CTC, alineador | no disponible | 20 s fijos | italiano | Apache-2.0 | Core ML mlprogram fp16 |
| `jonatasgrosman/wav2vec2-large-xlsr-53-italian` | wav2vec2 large + CTC, ASR | no disponible | variable (modelo PyTorch) | italiano | Apache-2.0 | PyTorch (`pytorch_model.bin`) |
| WAV2VEC2_XLSR53 (torchaudio) | wav2vec2 base preentrenado, sin afinar | no disponible | variable | multilingüe (preentrenamiento) | según torchaudio | PyTorch |

La comparación relevante es con el modelo base del que se deriva: misma arquitectura y mismos pesos, pero distinto empaquetado (Core ML frente a PyTorch) y distinto propósito documentado (alineación forzada frente a ASR). No se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Solo italiano: caracteres fuera del vocabulario (dígitos, símbolos) no se alinean y deben interpolarse por parte del llamador, tal como advierte la model card.
- Ventana fija de 20 segundos: los audios más largos deben trocearse y gestionarse externamente; no hay contexto variable.
- No es un transcriptor de propósito general: el artefacto está empaquetado y documentado como alineador forzado CTC, no como ASR listo para producción.
- Dependencia de plataforma: el formato `.mlmodelc` solo se ejecuta en el runtime de Core ML de Apple con objetivo macOS 15; no es portable a Linux ni Windows.
- Riesgo de alineación incorrecta en audio ruidoso, con solapamiento de hablantes o con pronunciación alejada del dominio de entrenamiento; no se publican métricas que permitan acotar ese riesgo.
- Riesgo de sesgo heredado del corpus de afinamiento del modelo base (CommonVoice y similares), cuya composición no se detalla en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y la atribución al modelo original; el autor indica que la conversión se distribuye bajo la misma licencia.
- Sin datos de benchmarks, latencia ni throughput: cualquier decisión de producción debe basarse en una evaluación propia sobre el dominio objetivo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción más allá de la aplicación declarada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/giuseppe-trisciuoglio/wav2vec2-xlsr-53-italian-ctc-coreml
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-italian
- Documentación de WAV2VEC2_XLSR53 en torchaudio: https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html
- Documentación de WAV2VEC2_XLSR53 en torchaudio 2.3: https://docs.pytorch.org/audio/2.3/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html
