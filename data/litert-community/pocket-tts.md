# litert-community/pocket-tts

## Resumen

PocketTTS 100M es un modelo de síntesis de voz (text-to-speech) desarrollado por Kyutai y empaquetado por la comunidad LiteRT en formato `.litertlm` para su ejecución en dispositivo (on-device). Se basa en una arquitectura FlowLM continua de 100 millones de parámetros combinada con el códec neural de audio Mimi, que produce audio PCM mono a 24 kHz. La versión publicada por `litert-community` está cuantizada a INT8 y optimizada para la tarea MediaPipe `TextToSpeech` sobre LiteRT, lo que permite inferencia local en Android, iOS, macOS, Web, Python y C++ sin dependencias de fonemizador externo ni de Python en tiempo de ejecución.

El modelo resuelve el problema de la síntesis de voz de baja latencia en dispositivos con recursos limitados: empaqueta en un único archivo con mapeo en memoria los subgrafos LiteRT INT8 (acondicionador de texto, backbone autorregresivo FlowLM de 6 capas con estado, red de flow-matching Euler LSD de 2 pasos y decodificador Mimi con estado), el tokenizador SentencePiece y los embeddings de condicionamiento de voz precomputados. Soporta siete idiomas (inglés, francés, alemán, español, italiano, portugués y neerlandés) y 14 voces empaquetadas, con conmutación entre idiomas en menos de un milisegundo en el bundle multilingüe.

Su relevancia actual radica en que ofrece una alternativa autocontenida y de código abierto (CC-BY-4.0) para integrar voz en asistentes locales, aplicaciones móviles y pipelines de LLM on-device, con tiempos hasta el primer audio de aproximadamente 45-60 ms y capacidad de recibir texto incremental desde un LLM en streaming. El bundle inglés ocupa 156 MB y el multilingüe 725 MB, lo que lo hace viable en dispositivos de gama media sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FlowLM continuo (backbone autorregresivo de 6 capas con estado) + red de flow-matching Euler LSD de 2 pasos + códec neural Mimi con estado |
| Parámetros totales | 100M (modelo base PocketTTS) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 |
| Idiomas soportados | en (en-US), fr (fr-FR), de (de-DE), es (es-ES), it (it-IT), pt (pt-BR), nl (nl-NL) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.litertlm` (bundles LiteRT con mapeo en memoria; subgrafos INT8 LiteRT) |

## Arquitectura y entrenamiento

El modelo es una adaptación del PocketTTS de Kyutai, un sistema TTS neuronal de 100M de parámetros que combina un FlowLM continuo con el códec neural Mimi. La inferencia se descompone en cuatro subgrafos LiteRT: un acondicionador de texto, un backbone autorregresivo FlowLM de 6 capas con estado, una red de flow-matching Euler LSD de 2 pasos y un decodificador Mimi con estado para streaming. La salida es audio PCM mono a 24 kHz en `float32` normalizado en `[-1.0, 1.0]`. Cada bundle `.litertlm` incluye además el tokenizador SentencePiece y los embeddings de condicionamiento de voz precomputados, todo en un único archivo con mapeo en memoria.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que la relación con el modelo base `kyutai/tts-voices` es de cuantización (`base_model_relation: quantized`), por lo que la innovación principal de esta publicación es el empaquetado y la optimización para LiteRT/MediaPipe más que el entrenamiento. Entre las innovaciones técnicas destacables están la decodificación en streaming con planificación adaptativa del primer chunk (1 frame en el paso 0, 2 frames en los pasos 1-4, 4 frames en adelante) para lograr un TTFA de ~45-60 ms, y la carga modular de bundles de idioma complementarios descubiertos automáticamente por MediaPipe.

## Capacidades

- Síntesis de voz a partir de texto con salida PCM mono a 24 kHz en `float32` normalizado.
- Síntesis de voz en streaming de baja latencia mediante `synthesizeStream` / `synthesize_stream`, con buffers `AudioChunk` generados a medida que se decodifican los frames latentes.
- Streaming de tokens LLM-a-TTS en tiempo real mediante `openStream` / `start_stream`, con `pushText` / `push_text` para deltas incrementales de texto y `finishInput` / `finish_input` para cerrar la entrada.
- Alineación de marcas temporales a nivel de palabra (`wordTimestamps` / `word_timestamps`) tanto en resultados unarios como en chunks de streaming, con detección de pausas.
- Multilingüismo en siete idiomas con 14 voces empaquetadas y conmutación entre idiomas en menos de un milisegundo en el bundle multilingüe.
- Carga modular de idiomas complementarios: si se coloca un `pocket_tts_<lang>_int8.litertlm` en el mismo directorio, MediaPipe lo descubre y carga bajo demanda.
- Consulta en tiempo de ejecución de las voces disponibles mediante `listVoices()` / `list_voices()`.
- Inferencia autocontenida sin fonemizador externo ni dependencias de Python.
- No se ha documentado soporte de tool calling, function calling, agentes ni multi-step reasoning, al tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz on-device en Android e iOS: el bundle inglés de 156 MB puede empaquetarse dentro de la aplicación y sintetizar respuestas localmente sin conexión, usando el streaming de baja latencia (~45-60 ms de TTFA) para una experiencia conversacional fluida.
- Lectura de respuestas de un LLM local en tiempo real: mediante `openStream` / `pushText`, el modelo consume los deltas de texto de un LLM on-device y empieza a hablar en cuanto llega el primer límite de palabra o cláusula, reduciendo la latencia percibida en asistentes embebidos.
- Aplicaciones de accesibilidad: conversión de texto a voz para lectores de pantalla y navegación por voz en dispositivos móviles, con siete idiomas y 14 voces para adaptarse a preferencias regionales.
- Audiolibros y contenido narrado en el navegador: el soporte Web de LiteRT permite sintetizar narración directamente en el cliente, evitando costes de servidor y manteniendo el texto del usuario en el dispositivo.
- Sistemas de navegación y avisos por voz en automoción: la inferencia local sin red y la salida PCM de 24 kHz encajan en paneles embebidos que necesitan anuncios cortos y deterministas, con la posibilidad de empaquetar solo el idioma del mercado.
- Prototipado e investigación en TTS: al ser un bundle autocontenido con licencia CC-BY-4.0, sirve para experimentar con flow-matching y códecs neuronales en Python o C++ sin montar infraestructura de servidor.
- Localización de productos multilingües: el bundle multilingüe de 725 MB o la combinación de bundles por idioma permiten distribuir solo los idiomas que el usuario descarga, con conmutación de voz y locale en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle inglés INT8 ocupa 156 MB y el multilingüe 725 MB en disco, con mapeo en memoria, por lo que el consumo de memoria es del orden del tamaño del bundle cargado más los buffers de estado del códec y del backbone.
- GPU recomendadas: no se especifican GPU discretas; el diseño está orientado a CPU y aceleradores de dispositivo (Android, iOS, macOS, Web, Python, C++) a través de LiteRT.
- Compatibilidad con GPU de consumo: no aplica como requisito; el modelo está pensado para ejecutarse en hardware móvil y de escritorio sin GPU dedicada. No se dispone de datos sobre su comportamiento en RTX 4090, A100 o H100.
- Opciones de despliegue: MediaPipe `TextToSpeech` Task sobre LiteRT en Android, iOS, macOS, Python, Web y C++; los bundles `.litertlm` son autocontenidos y no requieren vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFA de aproximadamente 45-60 ms con la planificación adaptativa de chunks (1 frame en el paso 0, 2 frames en los pasos 1-4, 4 frames en adelante); no se han publicado cifras de throughput ni de RTF en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| PocketTTS 100M (este) | 100M | 7 | `.litertlm` INT8, MediaPipe/LiteRT on-device | CC-BY-4.0 | TTFA ~45-60 ms, streaming LLM-a-TTS, 14 voces |
| Kyutai PocketTTS (base) | 100M | no disponible | Pesos originales de Kyutai | no disponible | Modelo del que deriva esta cuantización |
| Alternativas TTS on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información proporcionada; al ser un TTS entrenado con voces humanas, es previsible que herede sesgos acústicos y de prosodia de los datos de entrenamiento, pero no hay evidencia publicada al respecto.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta, prosodia anómala o artefactos acústicos en textos fuera de dominio, especialmente en nombres propios y palabras poco frecuentes.
- La longitud de contexto no está disponible; no se especifica el límite de texto de entrada por llamada ni el comportamiento en textos muy largos.
- La cobertura lingüística se limita a siete idiomas y 14 voces; no hay soporte documentado para otros idiomas ni para clonación de voz arbitraria.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario revisar los términos del modelo base `kyutai/tts-voices` para confirmar compatibilidad en producción.
- El modelo está empaquetado exclusivamente en formato `.litertlm` para LiteRT/MediaPipe; no se ofrecen pesos en safetensors o GGUF en esta publicación, lo que limita su uso fuera del ecosistema LiteRT.
- El rendimiento depende del backend LiteRT del dispositivo; no se han publicado métricas de latencia o calidad por plataforma.
- La fecha de creación del repositorio (2026-10-22) y la ausencia de descargas registradas indican que se trata de una publicación reciente con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/pocket-tts
- Repositorio de Kyutai PocketTTS: https://github.com/kyutai-labs/pocket-tts
- Modelo base: https://huggingface.co/kyutai/tts-voices
- MediaPipe Text-to-Speech Task: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech
- LiteRT: https://ai.google.dev/edge/litert
- Bundle inglés: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_en_int8.litertlm
- Bundle multilingüe: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_int8.litertlm
- Bundle francés: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_fr_int8.litertlm
- Bundle alemán: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_de_int8.litertlm
- Bundle español: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_es_int8.litertlm
- Bundle italiano: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_it_int8.litertlm
- Bundle portugués: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_pt_int8.litertlm
- Bundle neerlandés: https://huggingface.co/litert-community/pocket-tts/blob/main/pocket_tts_nl_int8.litertlm
