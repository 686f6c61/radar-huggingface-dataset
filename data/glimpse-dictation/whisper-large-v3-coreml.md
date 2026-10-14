# Glimpse-Dictation/Whisper-Large-V3-coreml

## Resumen

Whisper-Large-V3-coreml es un paquete de artefactos para Apple Silicon publicado por Glimpse-Dictation, el equipo de la aplicacion de dictado Glimpse. No es un modelo entrenado desde cero, sino una redistribucion optimizada de OpenAI Whisper Large V3 (licencia Apache 2.0) en dos piezas complementarias: un encoder compilado a Core ML que se ejecuta en el Neural Engine y un decoder en formato GGUF cuantizado a Q8_0, sin los pesos del encoder, de modo que este ultimo no se descargue dos veces.

La relevancia del repositorio esta en el formato, no en el modelo: permite ejecutar transcripcion de voz de un modelo de ~1.500 M de parametros (el original completo) en hardware de consumo Apple, con el encoder en FP16 sobre el Neural Engine y el decoder cuantizado a 8 bits. El encoder sigue el layout transformer exigido por el Neural Engine de Apple y, por su tamano, se divide en programas Core ML encadenados, ya que el compilador del Neural Engine rechaza un unico programa de ese tamano y cae a CPU.

El paquete esta pensado para el runtime propietario Glimpse-Speech y para un fork de transcribe.cpp con soporte de Whisper decoder-only. Fuera de Apple Silicon (Windows, Mac con Intel) el paquete Core ML no es utilizable y hay que recurrir al GGUF completo de whisper.cpp. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3); encoder compilado a Core ML, decoder extraido en GGUF |
| Parametros totales | 906.547.728 (pesos presentes en el repositorio; corresponden al decoder-only GGUF, no al modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por inferencia (Whisper); la model card no indica contexto de texto adicional |
| Tipos de cuantizacion | decoder GGUF en Q8_0; encoder Core ML en FP16; el ggml original de whisper.cpp usado para la conversion estaba en F16 |
| Idiomas soportados | no disponible en la model card del repositorio (el modelo base Whisper large-v3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` compilado (Core ML) para el encoder; `.gguf` Q8_0 para el decoder |
| Modelo base | openai/whisper-large-v3 |
| Pipeline declarado | automatic-speech-recognition |
| Tamano del repositorio | 2,1 GB |
| Plataforma requerida para Core ML | Apple Silicon (el paquete Core ML no funciona en Windows ni en Mac con Intel) |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el repositorio es un proceso de conversion y empaquetado en dos pasos documentados por el autor. El encoder se convirtio desde el `ggml-large-v3.bin` en F16 de whisper.cpp mediante `scripts/convert-whisper-gguf-to-coreml.py`, perteneciente a un fork de transcribe.cpp mantenido por LegendarySpy, y despues se comprimio con `ditto -c -k --keepParent`. El decoder-only GGUF se genero con `scripts/extract-coreml-decoder.py`, que copia byte a byte los tensores del decoder y del frontend junto con los metadatos, omite los tensores del encoder y marca `stt.whisper.decoder_only=true`.

El encoder compilado sigue el layout transformer que espera el Neural Engine de Apple y calcula en FP16, procesando una unica ventana Whisper de 30 segundos por invocacion. Debido a su tamano, se divide en programas Core ML encadenados en lugar de un solo programa, porque el compilador del Neural Engine rechaza un programa de ese tamano y lo degrada a ejecucion en CPU. La model card advierte explicitamente de que Core ML puede ejecutar algunas operaciones en CPU, por lo que no hay garantia de ejecucion exclusiva en el Neural Engine. No se documentan datos de entrenamiento (tokens, composicion del dataset, RLHF/DPO) porque no se ha entrenado ningun modelo nuevo en este repositorio.

Artefactos y verificacion de integridad:

| Artefacto | Tamano de descarga | SHA-256 |
|---|---:|---|
| `whisper-large-v3-encoder.mlmodelc.zip` | 1,18 GB | `504d9b03b34c689e91d61fb97d4c97eca979fc4d21e65d9c2963b7481cbc66dc` |
| `whisper-large-v3-Q8_0-decoder.gguf` | 969,0 MB | `a40e809cfbb958dc9053609ff9e54595cd011e960bcaebfa0f281ae93995ebe4` |
| `whisper-large-v3-Q8_0.gguf` original | no disponible | `2fa1a5f179f8a511a53e2108db270aa4af3ce08cd976af4180e2854666bb4ba3` |

## Capacidades

- Reconocimiento automatico de voz (ASR): transcripcion de audio a texto, con la calidad y las capacidades del modelo base Whisper large-v3.
- Procesamiento por ventanas de 30 segundos, que es la unidad de entrada que acepta el encoder Core ML.
- Capacidades multilingues heredadas del modelo base; la model card de este repositorio no enumera idiomas concretos.
- Compatibilidad con cualquier cuantizacion de Whisper Large V3 disponible en GGUF, no solo la Q8_0 incluida: el encoder Core ML se usa con todas ellas.
- Compatibilidad declarada con Distil-Whisper Large V3.5 usando el mismo encoder.
- Interoperabilidad: el encoder funciona junto a un GGUF completo de Whisper o junto a un modelo ggml de whisper.cpp.
- Ejecucion acelerada en Neural Engine en Apple Silicon, con calculo en FP16.
- No incluye generacion de texto general, razonamiento, codigo ni matematicas.
- No hay soporte de tool calling, function calling ni flujos de agentes multi-paso.
- No hay capacidades de vision ni de entrada de texto; la unica modalidad de entrada es audio.
- No dispone de modo de razonamiento explicito (thinking mode).

## Casos de uso

- Dictado en local en Mac: la aplicacion Glimpse usa el encoder Core ML para acelerar el dictado en el dispositivo, con el decoder Q8_0 generando el texto. Es el caso de uso para el que se publico el paquete.
- Transcripcion de reuniones con privacidad estricta: al ejecutarse integramente en el equipo, el audio no sale del dispositivo, lo que encaja en entornos con requisitos de confidencialidad o cumplimiento (sanidad, legal, defensa).
- Subtitulado y accesibilidad en directo: la ventana de 30 segundos con solape permite alimentar audio en streaming desde una app macOS nativa y emitir texto incremental; la ejecucion en Neural Engine reduce la carga de CPU frente a una implementacion solo en CPU.
- Apps macOS o iOS nativas: al ser un `.mlmodelc`, el encoder se puede cargar con el framework Core ML desde Swift sin dependencias de Python ni de CUDA, integrarlo en un binario y distribuir la app por la Mac App Store.
- Trabajo de campo sin conectividad: periodistas, investigadores o personal clinico que graban entrevistas o notas de voz y necesitan transcripcion offline en un portatil Apple Silicon.
- Procesamiento por lotes en flotas de Mac: runners de CI sobre macOS con chips M-series que transcriben un repositorio de audios por la noche, usando el encoder compartido y el decoder Q8_0 para reducir el uso de disco y memoria.
- Traduccion de audio a texto en ingles: el modelo base Whisper soporta la tarea de traduccion de voz a texto en ingles; esta capacidad no se menciona de forma explicita en la model card del repositorio y depende del runtime que se use.
- Comparacion y evaluacion de cuantizaciones: al reutilizar el mismo encoder con distintas cuantizaciones GGUF, sirve para medir el impacto de la cuantizacion del decoder sobre la calidad de transcripcion sin variar la mitad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye WER, latencia ni throughput, y el repositorio no aporta tablas comparativas frente a otras implementaciones de Whisper large-v3.

## Requisitos de hardware

- Disco: 2,1 GB para el repositorio completo; 1,18 GB el ZIP del encoder y 969,0 MB el decoder Q8_0.
- Plataforma: el paquete Core ML requiere Apple Silicon de forma obligatoria. En Windows, Mac con Intel o cualquier equipo sin Core ML hay que usar el modelo completo en GGUF o ggml, no estos artefactos.
- Memoria: no hay cifras publicadas por el autor. Como referencia de orden de magnitud, el encoder en FP16 y el decoder en Q8_0 ocupan aproximadamente 1,2 GB y 0,9 GB respectivamente; una estimacion prudente de memoria unificada residente se situa en torno a 3-4 GB, pero es una estimacion no confirmada y depende del runtime.
- GPU: no aplica en el caso Core ML, que delega en el Neural Engine y en la GPU integrada del SoC Apple. No hay datos publicados para A100, H100 ni RTX 4090 con este paquete.
- Consumer GPU: no hay informacion sobre GPUs de consumo para este formato. El decoder GGUF podria ejecutarse con backends compatibles, pero el encoder Core ML no se puede usar fuera de Apple Silicon.
- Despliegue: Glimpse-Speech (runtime del autor) y el fork de transcribe.cpp con soporte de Whisper decoder-only, ambos citados en la model card. Para el modelo completo, whisper.cpp o cualquier runtime que acepte GGUF de Whisper, incluidas las vias habituales sobre CPU o CUDA.
- vLLM, TGI y Ollama no estan documentados como compatibles con este paquete concreto; requeririan el modelo original en otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Requiere Apple Silicon | Notas |
|---|---|---|---|---|---|
| Glimpse-Dictation/Whisper-Large-V3-coreml | 906,5 M en el repositorio (decoder-only); el encoder va aparte | Core ML + GGUF Q8_0 | Apache 2.0 | Si, para la parte Core ML | Paquete de dos artefactos, no un modelo autonomo |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | safetensors / GGUF / ggml segun conversion | Apache 2.0 | No | Modelo base del que se deriva este repositorio |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | safetensors / GGUF | Apache 2.0 | No | Alternativa mas rapida de la misma familia; no citada en la model card |
| Distil-Whisper Large V3.5 | no disponible en la informacion proporcionada | GGUF / safetensors | no disponible en la informacion proporcionada | No | La model card indica que Glimpse reutiliza este encoder tambien con Distil-Whisper Large V3.5 |

## Limitaciones y advertencias

- No es un modelo autonomo: un GGUF decoder-only no contiene encoder y falla si no esta el `.mlmodelc` companero al lado. El ZIP debe extraerse junto al modelo manteniendo el nombre de directorio `whisper-large-v3-encoder.mlmodelc`.
- Dependencia de plataforma: el paquete Core ML solo funciona en Apple Silicon. En Windows y Mac con Intel hay que usar el modelo completo, lo que invalida el ahorro de descarga y la aceleracion por Neural Engine.
- Dependencia de runtime: los GGUF decoder-only necesitan una build de transcribe.cpp con soporte de Whisper decoder-only, o el runtime Glimpse-Speech. No son intercambiables con cualquier herramienta que lea GGUF.
- Ejecucion no garantizada en Neural Engine: la propia model card advierte de que Core ML puede ejecutar parte de las operaciones en CPU, por lo que el rendimiento puede variar entre versiones de macOS y de hardware.
- Ventana fija de 30 segundos: el audio largo exige troceado y estrategias de solape o de buffer continuo, con el riesgo de errores en las fronteras entre fragmentos.
- Sesgos y alucinacion heredados del modelo base: Whisper tiende a generar texto plausible en silencios, musica o ruido, y su calidad cae en idiomas de bajos recursos y en audio con acentos marcados o ruido de fondo.
- Idiomas: la model card no especifica la lista de idiomas soportados por este paquete, por lo que no se puede confirmar cobertura mas alla de lo que ofrezca el modelo base.
- Estado de validacion: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion de 2026 segun los metadatos. No hay evidencia publica de uso en produccion ni evaluaciones de terceros.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de mantener avisos de copyright y licencia; conviene revisar tambien las condiciones de la aplicacion Glimpse y de transcribe.cpp si se redistribuyen sus binarios.
- Produccion: al depender de un modelo base de OpenAI y de tooling de terceros, conviene fijar versiones por hash SHA-256 y verificar la integridad de los artefactos en cada despliegue.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Glimpse-Dictation/Whisper-Large-V3-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Aplicacion Glimpse: https://tryglimpse.cc
- Codigo fuente de Glimpse: https://github.com/glimpse-hq/Glimpse
- Fork de transcribe.cpp con soporte decoder-only: https://github.com/LegendarySpy/transcribe.cpp
- whisper.cpp (referenciado como origen del ggml F16 y como alternativa de despliegue): https://github.com/ggerganov/whisper.cpp
