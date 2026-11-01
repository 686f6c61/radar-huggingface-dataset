# akm9191/sherpa-onnx-streaming-zipformer-en-int8

## Resumen

El modelo `akm9191/sherpa-onnx-streaming-zipformer-en-int8` es una réplica sin modificaciones de los ficheros int8 del modelo de reconocimiento automático del habla (ASR) en streaming `chunk-16-left-128` publicado originalmente por el equipo k2-fsa / Next-gen Kaldi bajo el identificador `csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26`. Se trata de un transductor Zipformer entrenado con la herramienta icefall sobre el corpus LibriSpeech, exportado a formato ONNX con cuantización int8 y empaquetado para su uso con el runtime sherpa-onnx. El autor lo replica únicamente para integrarlo en la aplicación Android de notas Daily Whisper, donde se usa para dictado en el dispositivo sin enviar audio a servidores externos.

El modelo resuelve el problema de la transcripción de voz a texto en tiempo real y de baja latencia en inglés, con un enfoque en despliegue local en dispositivos con recursos limitados. Su arquitectura es un transductor (encoder, decoder y joiner) basado en Zipformer, con un chunk de 16 y un contexto izquierdo de 128 frames, lo que permite emitir palabras de forma incremental a medida que llega el audio. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el tamaño compacto de los pesos cuantizados.

La relevancia actual radica en que permite ASR en streaming totalmente offline en hardware modesto: el autor reporta un RTF de aproximadamente 0,04 en una máquina x86 con 2 hilos, lo que deja un margen amplio para ejecución en tiempo real. Al estar bajo licencia Apache-2.0 y en formato ONNX, es integrable en aplicaciones móviles y de escritorio sin dependencias de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer (encoder + decoder + joiner), streaming con chunk-16 y left-context-128 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 16 frames, contexto izquierdo de 128 frames) |
| Tipos de cuantizacion | int8 (los tres componentes: encoder, decoder y joiner) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer, una variante de arquitectura transformer con atención y convoluciones diseñada específicamente para ASR en streaming. Se compone de tres módulos: un encoder que procesa los frames de audio de entrada, un decoder (predictor) que modela la secuencia de tokens emitidos y un joiner que combina las representaciones de ambos para producir la distribución sobre el vocabulario. La configuración `chunk-16-left-128` indica que el encoder procesa bloques de 16 frames con un contexto izquierdo limitado a 128 frames, lo que acota la latencia y la memoria necesaria.

El entrenamiento se realizó con la herramienta icefall (PR 1058) sobre el corpus LibriSpeech, un conjunto de audiolibros en inglés con habla leída. El torchscript original proviene de `Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17`. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR). La innovación técnica principal es la exportación a ONNX con cuantización int8 de los tres componentes, lo que reduce el tamaño y acelera la inferencia en CPU, junto con el soporte nativo de streaming en sherpa-onnx.

## Capacidades

- Reconocimiento automático del habla en inglés en modo streaming, emitiendo texto de forma incremental (palabra a palabra) a medida que se recibe el audio.
- Transcripción de habla leída en inglés (estilo LibriSpeech), con salida en mayúsculas y sin puntuación.
- Ejecución en el dispositivo (on-device) sin conexión a red, adecuada para aplicaciones de privacidad estricta.
- Integración con el runtime sherpa-onnx en plataformas de escritorio, móvil y embebidas.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No soporta otros idiomas distintos del inglés.
- No incluye modo thinking, visión ni audio de salida (es un modelo puramente ASR).
- No aplica puntuación ni capitalización inteligente; la salida es texto plano en mayúsculas.

## Casos de uso

- Dictado en aplicaciones móviles de notas: el modelo se integra en apps Android como Daily Whisper para transcribir la voz del usuario en tiempo real sin enviar audio a la nube, aprovechando su tamaño reducido y su formato ONNX int8 para ejecución en CPU del teléfono.
- Subtitulado en directo de reuniones o clases en inglés: gracias al modo streaming con chunk-16, puede emitir texto conforme se habla, con una latencia acotada adecuada para subtítulos en vivo en entornos controlados.
- Transcripción de audiolibros y pódcasts en inglés: al estar entrenado sobre LibriSpeech (habla leída), rinde bien en contenido de narración clara y puede usarse para generar transcripciones por lotes con sherpa-onnx en servidores modestos.
- Asistentes de voz locales para domótica o aplicaciones de escritorio: el modelo puede alimentar comandos de voz en inglés ejecutándose íntegramente en el dispositivo, sin dependencia de APIs externas y con RTF bajo (aproximadamente 0,04 en x86 con 2 hilos).
- Prototipado de pipelines ASR en investigación: sirve como referencia reproducible de un Zipformer en streaming cuantizado a int8, útil para comparar latencia, precisión y consumo de recursos frente a otras variantes.
- Aplicaciones de accesibilidad para personas con movilidad reducida: permite dictar texto en inglés en tiempo real en dispositivos de bajo consumo, manteniendo la privacidad del audio al no salir del equipo.
- Sistemas de transcripción embebidos en Raspberry Pi u otros dispositivos ARM: el tamaño compacto del encoder int8 (unos 71 MB) y el bajo coste computacional lo hacen viable en hardware de gama baja con sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta que, en los clips de prueba del repositorio original, ambas transcripciones fueron exactas y que el RTF fue de aproximadamente 0,04 en una máquina x86 con 2 hilos. No se proporcionan cifras de WER, MMLU, HumanEval ni GSM8K (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU con ONNX Runtime y cuantización int8.
- Tamaño en disco: encoder.int8.onnx 71.083.163 bytes, decoder.int8.onnx 1.307.236 bytes, joiner.int8.onnx 259.335 bytes, tokens.txt 5.048 bytes (total aproximado de 72,6 MB).
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU. Puede ejecutarse en GPUs genéricas mediante ONNX Runtime, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, por tamaño (menos de 100 MB de pesos), aunque no es su objetivo principal.
- Despliegue: sherpa-onnx (runtime oficial), ONNX Runtime; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: RTF de aproximadamente 0,04 en x86 con 2 hilos según el autor, lo que implica procesar audio unas 25 veces más rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / chunk | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| akm9191/sherpa-onnx-streaming-zipformer-en-int8 | Zipformer transducer streaming | chunk-16, left-128 | en | Apache-2.0 | ONNX int8 | ~72,6 MB |
| csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26 | Zipformer transducer streaming | chunk-16, left-128 | en | Apache-2.0 | ONNX (varias precisiones) | similar (origen del replicado) |
| Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17 | Zipformer transducer streaming | no disponible | en | no disponible en la información | torchscript | no disponible |

La comparativa se limita a las variantes del mismo linaje Zipformer documentadas en la información proporcionada; no se dispone de datos de otros modelos ASR comparables (por ejemplo, Whisper o wav2vec2) en la información disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre LibriSpeech (habla leída en inglés), por lo que el rendimiento decae con acentos fuertes, ruido ambiental o habla espontánea.
- La salida es en mayúsculas y sin puntuación (estilo LibriSpeech), lo que requiere postprocesado si se necesita texto formateado.
- Solo soporta inglés; no es multilingüe.
- Riesgo de errores de transcripción en nombres propios, términos técnicos y vocabulario fuera del dominio de audiolibros.
- No incluye funcionalidades de razonamiento, tool calling ni agentes; su uso está acotado a ASR.
- Aunque la licencia es Apache-2.0, el autor indica que es una copia sin modificaciones de un modelo de terceros; conviene verificar la procedencia y los términos del repositorio original antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-10-29; no hay evidencia de mantenimiento ni de validación independiente más allá de las pruebas del autor.
- No se dispone de información sobre sesgos específicos más allá de los inherentes al corpus LibriSpeech.

## Enlaces

- HuggingFace: https://huggingface.co/akm9191/sherpa-onnx-streaming-zipformer-en-int8
- Repositorio original replicado: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-en-2023-06-26
- Torchscript de origen: https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Herramienta de entrenamiento icefall: https://github.com/k2-fsa/icefall
