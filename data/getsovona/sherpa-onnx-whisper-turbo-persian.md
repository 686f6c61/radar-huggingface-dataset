# getsovona/sherpa-onnx-whisper-turbo-persian

## Resumen

Whisper Large v3 Turbo Persian (sherpa-onnx) es una conversión a ONNX del modelo de reconocimiento automático del habla `givia/whisper-large-v3-turbo-persian`, un ajuste fino de OpenAI Whisper Large v3 Turbo especializado en persa (farsi). Lo publica el usuario `getsovona` para integrarlo en la aplicación de dictado Sovona, que funciona en local y sin conexión a internet. La relevancia actual reside en que permite desplegar ASR de calidad para persa en entornos de escritorio mediante sherpa-onnx, sin depender de servicios en la nube.

El modelo conserva la arquitectura transformer encoder-decoder de Whisper Large v3 Turbo (aproximadamente 809 millones de parámetros en el modelo original) y hereda el vocabulario multilingüe de Whisper. La conversión aplica cuantización int8 únicamente al encoder, mientras que el decoder se mantiene en precisión completa porque, según el autor, la versión int8 del decoder degrada la precisión en persa. El repositorio ocupa 1,3 GB e incluye tres ficheros: encoder int8, decoder en precisión completa y el fichero de tokens.

La licencia es CC-BY-4.0, heredada del modelo base, y exige mantener la atribución al autor original y a las fuentes de datos de entrenamiento. El modelo está pensado exclusivamente para persa (`fa`) y para la tarea de transcripción de audio a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo), exportado a ONNX |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base Whisper Large v3 Turbo tiene aproximadamente 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | Encoder en int8; decoder en precision completa (float32) |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`persian-encoder.int8.onnx`, `persian-decoder.onnx`) mas `persian-tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large v3 Turbo: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción y traducción multilingüe sobre ventanas de audio de 30 segundos. El ajuste fino en persa lo realizó el autor `givia`, y `getsovona` lo convirtió a ONNX con el script de exportación de Whisper incluido en sherpa-onnx. La única modificación respecto al modelo base es la cuantización int8 del encoder, manteniendo el decoder en precisión completa.

Los datos de entrenamiento del modelo base incluyen FLEURS (Google), YODAS2 (ESPnet), Common Voice, Neyshekar, ManaTTS y creadores de YouTube listados en la página del modelo original. No se dispone de información sobre el número exacto de tokens de audio empleados en el ajuste fino ni sobre si se aplicaron técnicas de RLHF o DPO; el autor no lo detalla en la model card. La innovación técnica destacable es la exportación a ONNX con cuantización selectiva (solo encoder) para preservar la precisión del decoder en persa, un compromiso explícito entre tamaño y calidad.

## Capacidades

- Reconocimiento automático del habla (ASR) en persa: transcripción de audio a texto en farsi.
- Funcionamiento completamente offline: no requiere conexión a internet ni servicios externos.
- Integración nativa con sherpa-onnx mediante `OfflineRecognizer.from_whisper`.
- Soporte de la tarea `transcribe` (el modelo está orientado a transcripción, no a traducción).
- Manejo del vocabulario multilingüe de Whisper en el fichero de tokens, aunque el modelo está especializado en persa.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Dictado por voz en escritorio: la aplicación Sovona lo emplea para transcribir dictado en persa sin conexión, aprovechando el formato ONNX y la integración con sherpa-onnx para ejecutarse en el ordenador del usuario.
- Subtitulado local de vídeos o reuniones en persa: el modelo transcribe audio previamente segmentado en ventanas de hasta 30 segundos, adecuado para generar subtítulos sin enviar datos a la nube.
- Asistentes de voz para personas con movilidad reducida: la transcripción offline en persa permite controlar aplicaciones por voz preservando la privacidad del audio.
- Transcripción de notas de voz y entrevistas: útil en entornos con conectividad limitada o requisitos de confidencialidad, donde no es aceptable subir el audio a un servicio externo.
- Investigación en ASR para persa: sirve como referencia cuantizada para comparar precisión y latencia frente al modelo original en PyTorch, con métricas publicadas sobre Common Voice 13 y FLEURS.
- Integración en pipelines de procesamiento por lotes: al ser ONNX, puede ejecutarse con sherpa-onnx en servidores sin GPU dedicada para transcribir grandes volúmenes de audio en persa.
- Aplicaciones de accesibilidad y transcripción en tiempo casi real: con la latencia propia de un modelo Whisper turbo, puede alimentar interfaces de voz en local para usuarios persohablantes.

## Benchmarks y rendimiento

El autor publica métricas de precisión a nivel de palabra (WER invertido, palabras correctas) medidas con sherpa-onnx sobre 298 clips, con texto persa normalizado (ي/ك como ی/ک, medio espacio como espacio, sin puntuación):

| Conjunto de evaluacion | Este modelo (ONNX, sherpa-onnx) | Modelo original (PyTorch) |
|---|---|---|
| Common Voice 13 (test) | 77–83 % de palabras correctas | 80 % |
| FLEURS fa_ir (test) | 91–92 % de palabras correctas | 93 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo ASR. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 1,3 GB, pero no se detalla el consumo en memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No se especifica; el formato ONNX con encoder int8 sugiere que puede ejecutarse en CPU, pero el autor no confirma requisitos mínimos.
- Opciones de despliegue: sherpa-onnx (librería principal, con API en Python mediante `OfflineRecognizer.from_whisper`); al ser ONNX, podría ejecutarse con otros runtimes compatibles, aunque no se documenta.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Precision publicada |
|---|---|---|---|---|---|---|
| getsovona/sherpa-onnx-whisper-turbo-persian | no disponible (base ~809 M) | ventanas de 30 s (Whisper) | Persa | CC-BY-4.0 | ONNX (encoder int8, decoder fp32) | 77–83 % CV13; 91–92 % FLEURS |
| givia/whisper-large-v3-turbo-persian | ~809 M | ventanas de 30 s | Persa | CC-BY-4.0 | PyTorch | 80 % CV13; 93 % FLEURS |
| openai/whisper-large-v3-turbo | ~809 M | ventanas de 30 s | Multilingüe | MIT | PyTorch / safetensors | no disponible en la informacion proporcionada |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas ASR para persa en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta persa (`fa`); no está pensado para otros idiomas pese a conservar el vocabulario multilingüe de Whisper.
- Pérdida de precisión respecto al original en PyTorch: entre 2 y 3 puntos porcentuales en Common Voice 13 y FLEURS, atribuible a la cuantización int8 del encoder.
- Necesita aproximadamente un segundo de silencio al final de cada fragmento de audio; sin él, Whisper tiende a omitir la última palabra.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos en entrenamiento o vocabulario técnico, como en cualquier modelo Whisper.
- Licencia CC-BY-4.0: permite uso comercial con atribución obligatoria al autor original (`givia`), a OpenAI Whisper y a las fuentes de datos (FLEURS, YODAS2, Common Voice, Neyshekar, ManaTTS y creadores de YouTube listados).
- El decoder en precisión completa aumenta el tamaño y el coste de inferencia frente a una versión completamente cuantizada.
- No se documentan sesgos específicos ni evaluación de robustez más allá de las métricas citadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/getsovona/sherpa-onnx-whisper-turbo-persian
- Modelo base (ajuste fino en persa): https://huggingface.co/givia/whisper-large-v3-turbo-persian
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Aplicación Sovona: https://getsovona.com
