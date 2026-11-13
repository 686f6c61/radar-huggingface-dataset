# quicodomingo/murmur-models

## Resumen

`quicodomingo/murmur-models` es un repositorio de modelos de reconocimiento automático del habla (ASR) y restauración de puntuación publicado por quicodomingo para alimentar Murmur, una aplicación de macOS que transcribe reuniones en directo, de forma local y con el catalán como idioma central. No se trata de un modelo entrenado desde cero, sino de un paquete de artefactos derivados: por un lado, el Conformer-Transducer bilingüe catalán-castellano del Projecte AINA (Barcelona Supercomputing Center) exportado a ONNX en el formato de transductor offline de sherpa-onnx; por otro, el modelo de predicción de puntuación de Softcatalà, también exportado a ONNX y cuantizado a int8.

La relevancia del repositorio es práctica: empaqueta en un único lugar los pesos listos para inferencia local (499 MB en fp32 y 142 MB en int8 para el ASR, 126 MB para la puntuación) junto con el vocabulario y el tokenizador, de modo que una aplicación de escritorio puede transcribir audio sin depender de servicios en la nube. El modelo base es un Conformer clásico con `subsampling_factor` 4 y características fbank de 80 dimensiones a 16 kHz, adaptado a sherpa-onnx mediante scripts propios del proyecto Murmur.

El interés técnico está en el pipeline completo: transcripción bilingüe ca/es con un transductor de tamaño grande y, a continuación, un modelo independiente que inserta puntos, comas y mayúsculas en el texto catalán. Ambos artefactos conservan los pesos originales sin reentrenamiento; solo cambia el formato de exportación y, en el caso de la puntuación, la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-Transducer (encoder Conformer + decoder + joiner); modelo independiente de puntuación para el catalán |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (ASR); int8 (puntuación) |
| Idiomas soportados | catalán (ca) y castellano (es) para ASR; catalán (ca) para puntuación |
| Licencia | cc-by-4.0 (ASR, obra derivada de Projecte AINA); MIT (puntuación, obra derivada de Softcatalà) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`, y variantes `.int8.onnx`); `tokens.txt` y `tokenizer.json` |

Detalles adicionales del empaquetado:

| Componente | Ficheros | Tamano |
|---|---|---|
| `conformer-ca-es-sherpa/` (fp32) | `encoder.onnx`, `decoder.onnx`, `joiner.onnx` | 499 MB |
| `conformer-ca-es-sherpa/` (int8) | `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` | 142 MB |
| `conformer-ca-es-sherpa/` (vocabulario) | `tokens.txt` | no disponible |
| `punct-ca/` | `model.int8.onnx` | 126 MB |
| `punct-ca/` (tokenizador) | `tokenizer.json` | no disponible |

Tamano total del repositorio: 0,8 GB. Entrada de audio: características fbank de 80 dimensiones a 16 kHz, `subsampling_factor` 4.

## Arquitectura y entrenamiento

El componente ASR es un Conformer-Transducer: un encoder basado en bloques Conformer (convolución + autoatención) que reduce la secuencia temporal mediante un factor de subsampling de 4, un decoder y un joiner que combinan las representaciones para producir la transcripción. Trabaja sobre características fbank de 80 dimensiones muestreadas a 16 kHz, lo que es el estándar en reconocedores tipo NeMo/sherpa-onnx. El modelo procede del Projecte AINA y está entrenado para alternar entre catalán y castellano; los pesos publicados en este repositorio son exactamente los del modelo original, sin reentrenamiento, tal como indica la model card.

La exportación se realizó con el script `tools/export_conformer_sherpa.py` de Murmur, adaptado de los scripts de exportación de NeMo que utiliza sherpa-onnx, y genera los tres grafos ONNX (encoder, decoder, joiner) en fp32 y en int8. El segundo componente, `punct-ca/`, es una obra derivada de `softcatala/fullstop-catalan-punctuation-prediction`, exportada a ONNX con `tools/export_punctuation.py` y cuantizada a int8; su función es insertar puntuación y mayúsculas sobre la salida del ASR. No se documentan en la información disponible los datos de entrenamiento originales (número de horas, composición del corpus), ni si hubo ajuste fino con RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla offline para catalán y castellano con un único modelo bilingüe.
- Transcripción en streaming o por fragmentos según el modo de transductor offline de sherpa-onnx.
- Restauración de puntuación en catalán: puntos, comas y mayúsculas sobre texto sin formato.
- Inferencia local en CPU y GPU a través del runtime sherpa-onnx, sin llamadas a servicios externos.
- Ejecución con pesos en fp32 o int8, lo que permite ajustar precisión frente a consumo de memoria.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.
- No se documenta un modo "thinking" ni capacidades multimodales adicionales.

## Casos de uso

- Transcripción de reuniones en directo en macOS: la aplicación Murmur usa el transductor para convertir el audio de la reunión en texto mientras se habla, con la ventaja de que todo el procesamiento ocurre en local y no se envía audio a terceros.
- Subtitulado de vídeos y pódcasts en catalán y castellano: el modelo bilingüe permite generar subtítulos en ambos idiomas sin cambiar de motor, y el componente `punct-ca` mejora la legibilidad del catalán añadiendo puntuación.
- Actas y notas automáticas: tras la transcripción, el texto punteado por `punct-ca` se puede pasar a un resumen o a una búsqueda por palabras clave, lo que resulta adecuado para equipos que trabajan en catalán.
- Aplicaciones de escritorio con requisitos de privacidad: al ser ONNX de 142 MB en int8, se puede integrar en una app nativa que funcione sin conexión en equipos de oficina, cumpliendo políticas de datos que prohíben servicios en la nube.
- Investigación en ASR de lenguas minorizadas: sirve como referencia reproducible del modelo del Projecte AINA en formato sherpa-onnx para experimentos de evaluación o ajuste sobre catalán.
- Prototipado rápido con sherpa-onnx: los ficheros `tokens.txt` y los grafos ONNX permiten montar un servidor o una CLI de transcripción en pocas líneas, útil para demos y pruebas de concepto.
- Dictado por voz en catalán para editores de texto: el modelo y el puntuador se pueden encadenar para insertar texto con mayúsculas y comas en un campo de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como orientación por tamaño de fichero, la variante int8 ocupa 142 MB en disco y la fp32 499 MB; el consumo en memoria durante la inferencia depende del runtime y de la longitud del audio.
- GPU recomendadas: no se especifican en la información disponible. El formato ONNX y el runtime sherpa-onnx están pensados para ejecución en CPU y para aceleración GPU cuando el backend lo permite.
- Cabe en GPU de consumo: por el tamaño de los pesos (142 MB en int8), es razonable esperar que quepa en GPUs de consumo, aunque no se documenta una lista concreta.
- Opciones de despliegue: sherpa-onnx (runtime principal), con los grafos ONNX exportados; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `quicodomingo/murmur-models` (ASR) | no disponible | no disponible | ca, es | CC BY 4.0 | ONNX (sherpa-onnx) |
| `projecte-aina/stt_ca-es_conformer_transducer_large` (modelo base) | no disponible | no disponible | ca, es | no disponible en esta ficha | pesos originales (no ONNX) |
| `softcatala/fullstop-catalan-punctuation-prediction` (puntuación) | no disponible | no disponible | ca | MIT | no disponible en esta ficha |

La comparación relevante es con el modelo base del Projecte AINA: Murmur no cambia los pesos, solo el formato (ONNX para sherpa-onnx) y añade la variante int8. Frente al modelo de Softcatalà, el artefacto de puntuación es una exportación cuantizada del mismo. No se dispone de datos de rendimiento comparado con otras alternativas ASR (por ejemplo, Whisper) en la información proporcionada.

## Limitaciones y advertencias

- El modelo ASR solo cubre catalán y castellano; no se documenta soporte de otras lenguas ni code-switching más allá de estos dos idiomas.
- No se han publicado métricas de error (WER/CER) en la información disponible, por lo que no es posible cuantificar su precisión frente a alternativas.
- Al ser una obra derivada sin reentrenamiento, hereda los sesgos y limitaciones del modelo original del Projecte AINA, que no se detallan en la model card.
- Riesgo de alucinación y errores en audio ruidoso, solapamiento de hablantes o vocabulario especializado: no se documenta ningún mecanismo de mitigación.
- La licencia CC BY 4.0 del componente ASR exige atribución al Projecte AINA (BSC); el componente de puntuación es MIT y exige atribución a Softcatalà. Es necesario revisar ambas condiciones antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación externa; conviene evaluar el modelo en el dominio propio antes de producción.
- El tamaño del repositorio (0,8 GB) y la presencia de variantes fp32 e int8 obligan a seleccionar qué ficheros descargar para no duplicar espacio.
- No hay información sobre latencia, throughput ni comportamiento en GPUs concretas, lo que dificulta planificar el dimensionamiento de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/quicodomingo/murmur-models
- Aplicación Murmur: https://quicodomingo.com
- Modelo base ASR: https://huggingface.co/projecte-aina/stt_ca-es_conformer_transducer_large
- Projecte AINA: https://projecteaina.cat
- Modelo de puntuación base: https://huggingface.co/softcatala/fullstop-catalan-punctuation-prediction
- Softcatalà: https://www.softcatala.org
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia MIT: https://opensource.org/licenses/MIT
