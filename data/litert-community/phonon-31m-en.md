# litert-community/phonon-31m-en

## Resumen

Phonon 31M (English) es un modelo de síntesis de voz (text-to-speech) ultraligero empaquetado por litert-community para su ejecución en dispositivo mediante LiteRT y la tarea MediaPipe TextToSpeech. Deriva del modelo original gradium/phonon-31m-en, del que constituye una versión cuantizada a INT8 y empaquetada en un único fichero `.litertlm` de 84 MB que incluye los subgrafos LiteRT, el tokenizador SentencePiece y las embeddings de condicionamiento de voz precalculadas.

El modelo resuelve el problema de la síntesis de voz de baja latencia en entornos sin conectividad ni dependencias externas: no requiere fonemizador aparte ni runtime de Python, y produce audio PCM mono a 24 kHz en formato float32. Su huella de memoria en ejecución se sitúa en torno a 120 MB, lo que lo hace viable en Android, iOS, macOS, Web y C++ a través de la API de MediaPipe.

Es relevante ahora porque permite integrar TTS neuronal de calidad en aplicaciones móviles y web con un solo fichero, soporte de streaming token a token desde un LLM on-device, marcas de tiempo a nivel de palabra y conmutación de voz en menos de un milisegundo, todo bajo licencia Apache-2.0. El modelo está especializado exclusivamente en inglés (`en-US`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama FlowLM de 6 capas + cabeza de flow-matching ConvNext de 3 capas + decodificador de codec neuronal Mimi con estado |
| Parametros totales | 31M (según nombre del modelo; desglose no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (único bundle publicado: `phonon_int8.litertlm`) |
| Idiomas soportados | Inglés (`en-US`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT, memoria mapeada; incluye tokenizador y embeddings de voz) |

## Arquitectura y entrenamiento

El modelo combina tres componentes: un backbone autorregresivo Llama FlowLM de 6 capas que modela latentes de audio, una cabeza de flow-matching basada en ConvNext de 3 capas que genera la velocidad del flujo para producir dichos latentes, y un decodificador de codec neuronal Mimi con estado que convierte los latentes en audio PCM mono a 24 kHz. El bundle INT8 incluye la tabla de embeddings de texto, el backbone, la red de velocidad y el decodificador Mimi, además del tokenizador SentencePiece y las embeddings de condicionamiento de las voces empaquetadas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación destacable es el empaquetado autocontenido: subgrafos LiteRT cuantizados a INT8, decodificación Mimi en streaming con planificación adaptativa del primer chunk (1 frame en el paso 0, 2 frames en los pasos 1-4 y 4 frames en adelante) y conmutación de voz por embeddings de condicionamiento sin recargar pesos.

## Capacidades

- Síntesis de voz en inglés (`en-US`) con salida PCM mono a 24 kHz en float32 dentro del rango [-1.0, 1.0].
- Streaming de baja latencia mediante `synthesizeStream` / `synthesize_stream`, con un tiempo hasta el primer audio (TTFA) de aproximadamente 45 ms.
- Streaming de tokens desde un LLM on-device: `openStream` / `start_stream` con `pushText` / `push_text` y `finishInput` / `finish_input` para sintetizar a medida que llega el texto.
- Marcas de tiempo a nivel de palabra (`wordTimestamps` / `word_timestamps`) con offsets de carácter y tiempos de inicio y fin, aptas para resaltado tipo karaoke.
- Conmutación de voz en menos de 1 ms entre las voces empaquetadas: `freya` (por defecto), `claire`, `lukas`, `sofia` y `lucas`.
- Troceado inteligente por cláusulas con protección de abreviaturas (`Dr.`, `Mr.`, `U.S.`, `e.g.`) y números decimales (`3.14`).
- Control de velocidad de habla (`speakingRate` en (0.1, 4.0], por defecto 1.0) mediante modificación de escala temporal WSOLA que preserva el tono.
- Cancelación de síntesis en curso (barge-in) sin bloqueos mediante `cancel()` o cancelación nativa de corrutinas Kotlin y `Task` de Swift.
- Enumeración de voces en tiempo de ejecución con `listVoices()` / `list_voices()`.

## Casos de uso

- Lectura por voz de artículos y documentos en aplicaciones móviles: el bundle de 84 MB se descarga una vez y se ejecuta en el dispositivo sin conexión, con marcas de tiempo por palabra para resaltar el texto a medida que se lee.
- Asistentes conversacionales on-device con LLM local: el streaming de tokens (`openStream` + `pushText`) permite que la voz empiece a sonar en cuanto el LLM emite la primera cláusula, reduciendo la latencia percibida en diálogos multi-turno.
- Accesibilidad para personas con discapacidad visual: la síntesis de 24 kHz con control de velocidad entre 0.1 y 4.0 y cancelación inmediata facilita la navegación por interfaces habladas en Android e iOS.
- Aprendizaje de idiomas y lectura guiada: las marcas de tiempo a nivel de palabra y la protección de abreviaturas y decimales permiten sincronizar audio y texto en ejercicios de pronunciación en inglés.
- Notificaciones y avisos por voz en aplicaciones web: el soporte de Web a través de MediaPipe permite generar audio en el navegador con un único fichero, sin backend de TTS ni coste por petición.
- Prototipado rápido de interfaces de voz en Python y C++: la API unificada de MediaPipe permite validar flujos de TTS en escritorio antes de portar la misma lógica a Android o iOS.
- Integración en pipelines de agentes de voz: la cancelación tipo barge-in y la conmutación de voz en menos de 1 ms permiten interrumpir y cambiar de locutor por turno sin recargar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son operativos: TTFA de aproximadamente 45 ms con streaming, huella de memoria pico de unos 120 MB, conmutación de voz inferior a 1 ms y tamaño del bundle de 84 MB.

## Requisitos de hardware

- VRAM/RAM: aproximadamente 120 MB de memoria pico en ejecución según el autor; el fichero ocupa 84 MB en disco.
- GPU: no se especifican GPU dedicadas; el delegado documentado es `Delegate.CPU` en Android. No hay datos sobre aceleración por GPU o NPU.
- GPU de consumo: irrelevante para este modelo; está diseñado para CPU de dispositivos móviles y navegador. Cabe en cualquier dispositivo con al menos ~120 MB de memoria disponible.
- Plataformas soportadas: Android (`minSdk = 26`, `arm64-v8a`), iOS, macOS, Web, Python y C++.
- Despliegue: tarea MediaPipe TextToSpeech (`com.google.mediapipe:tasks-audio`) sobre LiteRT; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: TTFA de ~45 ms en streaming; no se publican cifras de throughput (caracteres o segundos de audio por segundo de cómputo).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS on-device de tamaño similar) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés (`en-US`); no hay soporte multilingüe ni de otros acentos documentado.
- El bundle publicado es únicamente INT8; no se ofrecen variantes FP16, FP32 ni otros formatos como GGUF o safetensors en este repositorio.
- El repositorio tiene 0 descargas y 3 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.
- No se documentan sesgos de voz, cobertura de acentos ni comportamiento ante texto con caracteres no ingleses; el riesgo de pronunciación incorrecta en nombres propios o términos extranjeros no está cuantificado.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no puede evaluarse la representatividad de las voces empaquetadas.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base gradium/phonon-31m-en y de las voces incluidas antes de distribuirlo en producción.
- La cancelación y el streaming dependen de la implementación de MediaPipe en cada plataforma; el comportamiento puede variar entre Android, iOS y Web.
- No se especifican requisitos de versión mínima de LiteRT ni de MediaPipe más allá de `minSdk = 26` en Android.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/phonon-31m-en
- Fichero del bundle: https://huggingface.co/litert-community/phonon-31m-en/blob/main/phonon_int8.litertlm
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Tarea MediaPipe Text-to-Speech: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech
- Guía de MediaPipe Text-to-Speech para Android: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech/android
- LiteRT: https://ai.google.dev/edge/litert
- Aplicación de ejemplo para Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_to_speech/android
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
