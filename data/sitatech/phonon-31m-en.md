# sitatech/phonon-31m-en

## Resumen

Phonon 31M (English) es un modelo de síntesis de voz (text-to-speech) ultraligero desarrollado originalmente por Gradium y redistribuido por Sitatech como paquete autocontenido en formato `.litertlm` para su uso con MediaPipe y LiteRT. Con 31 millones de parámetros, está diseñado específicamente para inferencia en dispositivo (on-device) en Android, iOS, macOS, Web, Python y C++, sin dependencias externas de fonemizador ni de Python en tiempo de ejecución.

El modelo combina un backbone autorregresivo Llama FlowLM de 6 capas con una cabeza de flow-matching ConvNext de 3 capas y un decodificador de códec de audio neuronal Mimi con estado, que produce PCM mono a 24 kHz. El paquete completo, cuantizado a INT8, ocupa 84 MB y tiene un pico de memoria en tiempo de ejecución de aproximadamente 120 MB, lo que lo hace viable en dispositivos móviles de gama media sin acelerador dedicado.

Su relevancia actual radica en la combinación de latencia muy baja (unos 45 ms de tiempo hasta el primer audio en modo streaming), integración directa con flujos de tokens de un LLM en el mismo dispositivo y soporte de marcas de tiempo a nivel de palabra, lo que habilita interfaces de lectura sincronizada y asistentes conversacionales totalmente locales. La licencia Apache-2.0 facilita su incorporación en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone autorregresivo Llama FlowLM (6 capas) + cabeza de flow-matching ConvNext (3 capas) + decodificador de códec neural Mimi con estado |
| Parametros totales | 31 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | inglés (`en`, `en-US`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT, paquete único memory-mapped); modelo base en formato original no especificado |

## Arquitectura y entrenamiento

Phonon 31M emplea una arquitectura híbrida orientada a TTS: un backbone transformer autorregresivo de tipo Llama FlowLM con 6 capas que modela la secuencia de latentes de audio, una cabeza de flow-matching basada en ConvNext de 3 capas que genera las velocidades del flujo para la síntesis, y un decodificador Mimi con estado que convierte los latentes en PCM mono a 24 kHz. El paquete `.litertlm` incluye además la tabla de embeddings de texto, el tokenizador SentencePiece y los embeddings de condicionamiento de voz precalculados, todo en un único archivo mapeado en memoria.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la integración de decodificación por flow-matching con un códec neuronal con estado que permite streaming incremental: el planificador adaptativo de primer fragmento (1 frame en el paso 0, 2 frames en los pasos 1-4, 4 frames a partir de ahí) reduce el tiempo hasta el primer audio a unos 45 ms. El cambio de voz entre los embeddings incluidos se realiza en menos de 1 ms sin recargar pesos.

## Capacidades

- Síntesis de voz a partir de texto con salida PCM mono float32 a 24 kHz normalizada en el rango [-1.0, 1.0].
- Streaming de baja latencia mediante `synthesizeStream` / `synthesize_stream`, con chunks de audio emitidos a medida que se generan los frames latentes.
- Streaming de tokens desde un LLM en el mismo dispositivo mediante `openStream` / `start_stream` y `pushText` / `push_text`, con inicio de síntesis al alcanzar el primer límite de cláusula o palabra.
- Marcas de tiempo a nivel de palabra (`WordTimestamp` con `word`, `startChar`, `endChar`, `startSec`, `endSec`) tanto en resultados unarios como en streaming, para resaltado de texto sincronizado.
- Segmentación inteligente de cláusulas con protección de abreviaturas (`Dr.`, `Mr.`, `U.S.`, `e.g.`) y números decimales (`3.14`).
- Control de velocidad de habla (`speakingRate` en `(0.1, 4.0]`, por defecto `1.0`) mediante modificación de escala temporal WSOLA que preserva el tono.
- Cancelación de síntesis en curso (barge-in) sin bloqueos vía `cancel()` o cancelación nativa de corrutinas Kotlin / `Task` de Swift.
- Voces incluidas: `freya` (por defecto, `en-US`), `claire`, `lukas`, `sofia`, `lucas`, enumerables en tiempo de ejecución con `listVoices()` / `list_voices()`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en aplicaciones móviles: el paquete de 84 MB y el pico de ~120 MB permiten integrar TTS en apps Android (minSdk 26, arm64-v8a) e iOS sin conexión a red, usando MediaPipe `TextToSpeech` con delegado de CPU.
- Lectura en voz alta con resaltado sincronizado: las marcas de tiempo por palabra mapeadas a offsets de caracteres permiten implementar interfaces de lectura guiada en apps educativas o de accesibilidad.
- Voice agents conversacionales locales: la integración con el streaming de tokens de un LLM en el mismo dispositivo (`pushText`) permite encadenar STT → LLM → TTS sin salir del terminal, con TTFA de ~45 ms.
- Sistemas de navegación y avisos manos libres: la cancelación de barge-in y el control de velocidad permiten interrumpir y reanudar instrucciones de forma responsiva en entornos embebidos.
- Lectores de pantalla y accesibilidad web: el despliegue vía LiteRT en Web y la segmentación por cláusulas facilitan la síntesis de párrafos largos con pausas naturales y protección de abreviaturas.
- Kioscos y dispositivos IoT con restricciones de memoria: el modelo cabe en dispositivos con ~120 MB de RAM disponible y no requiere fonemizador ni dependencias Python, lo que simplifica el despliegue en firmware.
- Prototipado de interfaces de voz en Python y C++: el mismo `.litertlm` se carga desde escritorio para validar flujos antes de portar a móvil, manteniendo idéntico comportamiento acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento aportados por el autor son operativos: tiempo hasta el primer audio de ~45 ms en modo streaming, cambio de voz en menos de 1 ms, pico de memoria en tiempo de ejecución de ~120 MB y tamaño del paquete de 84 MB.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~120 MB de pico en tiempo de ejecución (paquete INT8 de 84 MB mapeado en memoria).
- GPU recomendadas: no requiere GPU; el ejemplo oficial usa `Delegate.CPU` en MediaPipe. No se documentan delegados de GPU/NPU para este paquete.
- Cabe en cualquier GPU de consumo y en dispositivos móviles de gama media; el requisito práctico es RAM disponible, no VRAM.
- Plataformas de despliegue soportadas: Android (minSdk 26, arm64-v8a), iOS, macOS, Web, Python y C++ mediante LiteRT y la tarea MediaPipe `TextToSpeech`.
- Opciones de despliegue: MediaPipe Tasks (`com.google.mediapipe:tasks-audio`), LiteRT; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: TTFA de ~45 ms en streaming según el autor; no se publican cifras de throughput ni de RTF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Phonon 31M (English) INT8 | 31 M | no disponible | `.litertlm` / MediaPipe + LiteRT | Apache-2.0 | 84 MB, streaming con TTFA ~45 ms, marcas de tiempo por palabra |
| Modelos TTS neuronales de gran tamaño (p. ej. familia VITS/Tacotron) | no disponible | no disponible | varía (ONNX, PyTorch) | varía | Requieren más memoria y a menudo fonemizador externo |
| TTS del sistema operativo (Android/iOS nativo) | no disponible | no disponible | API del SO | propietaria | Sin control de marca de tiempo por palabra ni streaming de tokens de LLM |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se documentan otros idiomas.
- No se especifica la longitud máxima de texto de entrada ni el contexto del backbone; los párrafos largos dependen de la segmentación por cláusulas del runtime.
- Riesgo de alucinación acústica y de pronunciación incorrecta en nombres propios, siglas no cubiertas por la lista de abreviaturas o terminología técnica; conviene validar con pruebas acústicas propias.
- No se documentan sesgos de voz, acento o género en la información disponible; las cinco voces incluidas son un conjunto cerrado y no se indica cómo añadir voces nuevas.
- El paquete está cuantizado a INT8; no se ofrecen variantes FP16/FP32 para comparar la pérdida de calidad respecto al modelo base.
- Dependencia del ecosistema MediaPipe/LiteRT: no hay pesos en safetensors ni GGUF en este repositorio, lo que limita su uso fuera de ese runtime.
- El ejemplo oficial fija `arm64-v8a` en Android; no se documenta soporte para otras ABI.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez de la comunidad no verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sitatech/phonon-31m-en
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Paquete `.litertlm` (repositorio de referencia): https://huggingface.co/litert-community/phonon-31m-en/blob/main/phonon_int8.litertlm
- MediaPipe Text-to-Speech Task: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech
- LiteRT: https://ai.google.dev/edge/litert
- Guía Android de MediaPipe Text-to-Speech: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech/android
- App de ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/text_to_speech/android
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
