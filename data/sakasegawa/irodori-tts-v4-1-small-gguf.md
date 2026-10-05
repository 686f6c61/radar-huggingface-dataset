# sakasegawa/Irodori-TTS-v4.1-Small-GGUF

## Resumen

Irodori-TTS-v4.1-Small-GGUF es una conversión a formato GGUF del modelo de síntesis de voz Aratako/Irodori-TTS-v4.1-Small, junto con su códec neuronal Semantic-DACVAE-Japanese-32dim. Lo publica el usuario sakasegawa y está pensado exclusivamente para ejecutarse en speech.cpp, una implementación en C++ sobre ggml con soporte de Metal, Vulkan y CPU. El modelo resuelve la generación de voz en japonés a partir de una grabación de referencia, sin voces predefinidas propias.

Arquitectónicamente es un sistema de text-to-speech por difusión: incluye un codificador de texto, un codificador de hablante, un predictor de duración y un Diffusion Transformer (DiT) que muestrea con pasos de Euler y guiado (texto 3,0 y hablante 5,0 mientras t ≥ 0,5). El códec que convierte los latentes en audio trabaja a 48 kHz. El recuento total de parámetros es de 748.615.713 (aproximadamente 748,6 millones).

Su relevancia actual radica en que permite ejecutar un TTS de calidad con clonación de voz en hardware de consumo (una RTX 2080 o un Apple M5) con un consumo de memoria de 2,2 GB, y expone una API compatible con el endpoint de audio de OpenAI. La licencia es MIT, pero el autor original impone restricciones éticas de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS por difusión: text encoder + speaker encoder + duration predictor + DiT (Diffusion Transformer); códec Semantic-DACVAE de 48 kHz |
| Parámetros totales | 748.615.713 (aprox. 748,6 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa frases de texto) |
| Tipos de cuantización | matrices del modelo en F16, normas y sesgos en F32; códec en F32 |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT (con restricciones éticas adicionales del autor) |
| Formato de pesos | GGUF específico de speech.cpp (no compatible con llama.cpp, LM Studio ni Ollama) |

## Arquitectura y entrenamiento

El modelo es un sistema de síntesis de voz por difusión. El pipeline se compone de un codificador de texto, un codificador de hablante (que extrae la identidad vocal de una grabación de referencia), un predictor de duración y un DiT que genera los latentes acústicos mediante muestreo con pasos de Euler. Por defecto emplea 40 pasos con guiado (texto 3,0 y hablante 5,0 mientras t ≥ 0,5), aunque admite valores distintos con `--steps`; con 16 pasos la primera muestra de audio llega más del doble de rápido. El códec Semantic-DACVAE-Japanese-32dim, de 32 dimensiones latentes y 48 kHz, se encarga de decodificar los latentes a audio.

La conversión a GGUF se realizó con los scripts `reference/irodori-tts/convert.py` y `convert_codec.py` de speech.cpp, partiendo de los pesos oficiales en los commits `2b28324dc263ed5e6638b3cf3dd94c82ead07b4b` (Irodori-TTS-v4.1-Small) y `47376ee24834d7a05a48ebabfe3cde29b3c5e214` (Semantic-DACVAE-Japanese-32dim). Las matrices del modelo se mantienen en F16, mientras que las normas y los sesgos permanecen en F32; el códec se conserva íntegramente en F32. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto plano.
- Clonación de voz zero-shot: reproduce la voz de una grabación de referencia de 48 kHz, ya sea como WAVE o como fichero de voz generado con `speech-tts make-voice` (latente del códec, 35 KB para 10 s).
- Síntesis en streaming: emite cada frase a medida que el códec la decodifica.
- Control de la longitud y velocidad del habla mediante `--speed`, `--seconds` y `--duration-scale`.
- Servidor HTTP con la API de audio de OpenAI (`POST /v1/audio/speech`).
- Modo worker con protocolo JSON Lines para procesamiento por lotes.
- API en C accesible desde speech.cpp.
- No implementa captions ni VoiceDesign (diseño de voz por descripción textual).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Audiolibros y narración en japonés: el modelo convierte textos largos en voz con una identidad vocal concreta de referencia, manteniendo la coherencia del timbre gracias al codificador de hablante y al latente de voz reutilizable.
- Doblaje y localización al japonés: permite generar pistas de voz con una voz de referencia concreta y ajustar la duración con `--duration-scale` para encajar en el metraje original.
- Asistentes de voz e IVR: el servidor integrado expone `POST /v1/audio/speech`, de modo que se puede conectar a un orquestador existente compatible con la API de audio de OpenAI sin adaptar el backend.
- Accesibilidad y lectores de pantalla: la síntesis en streaming reduce el tiempo hasta la primera muestra de audio, lo que mejora la percepción de respuesta en aplicaciones interactivas.
- Generación masiva por lotes: el worker JSON Lines de `speech-worker` permite procesar cientos de frases de forma secuencial con un consumo de memoria de 2,2 GB, apto para un único nodo.
- Prototipado de pipelines TTS en investigación: al ser GGUF sobre ggml y funcionar en CPU, Metal y Vulkan, facilita la evaluación de la clonación de voz en distintos aceleradores sin depender de un stack de Python.
- Pruebas de calidad de códecs neuronales: la separación entre el modelo de difusión y el códec permite analizar por separado la fidelidad de los latentes y la decodificación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta verificaciones de precisión frente a la implementación oficial en float32 con el mismo ruido, medidas en SNR:

| Comprobación | CPU, pesos F32 | Apple M5, Metal, pesos F32 |
|---|---|---|
| Pasos del DiT | 95 dB SNR o más | 46 dB o más |
| Latente muestreado, 40 pasos | 109 a 111 dB | 59 a 67 dB |
| Audio decodificado (códec) | 119 dB | 68 dB |

Mediciones de velocidad con 20 frases en japonés mediante `speech-worker`, una a una y con el códec en F32:

| Pasos | Dispositivo | Mediana de primera muestra de audio | Factor de tiempo real (RTF) | Memoria |
|---|---|---|---|---|
| 16 | Apple M5, Metal | 1,12 s | 0,34 | 2,2 GB |
| 40 | Apple M5, Metal | 2,64 s | 0,64 | 2,2 GB |
| 16 | RTX 2080, Vulkan | 0,49 s | 0,14 | 2,2 GB |

Un RTF inferior a 1 indica síntesis más rápida que el tiempo real.

## Requisitos de hardware

- Memoria estimada: 2,2 GB durante la inferencia (modelo DiT en F16, 1,50 GB, más el códec en F32, 371 MB).
- GPU compatibles: NVIDIA RTX 2080 (probada vía Vulkan), Apple M5 (Metal). Cualquier GPU con soporte Vulkan o Metal debería ser compatible con speech.cpp, aunque no se documentan otras.
- Ejecución en CPU: soportada y verificada; es la ruta que ofrece mayor fidelidad (119 dB en el audio decodificado), pero con mayor latencia.
- Cabe en GPU de consumo: sí, con 2,2 GB de memoria es viable en tarjetas con 4 GB o más.
- Opciones de despliegue: exclusivamente speech.cpp. Binarios precompilados para macOS arm64 (Metal), Windows x64 (Vulkan) y Linux x64 (Vulkan o CPU) disponibles en las releases del proyecto. Herramientas: `speech-tts`, `speech-worker` y `speech-server` (estas dos últimas a partir de v0.5.0).
- Latencia y throughput: con 16 pasos en RTX 2080 se alcanza una mediana de 1,49 s menos de espera a la primera muestra que el resultado más lento documentado; el RTF de 0,14 implica capacidad de generar aproximadamente 7 veces el tiempo real de audio por unidad de tiempo. No se documenta throughput por lotes agregado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks homogéneos con otras alternativas. La comparación más directa es con la propia variante del mismo autor:

| Modelo | Enfoque de muestreo | Tiempo hasta el primer audio | Formato | Licencia |
|---|---|---|---|---|
| Irodori-TTS-v4.1-Small-GGUF (esta ficha) | 16 pasos Euler | referencia | GGUF (speech.cpp) | MIT |
| Irodori-TTS-v4.1-Small-MF-GGUF | 4 pasos MeanFlow | aprox. 4 veces más rápido que esta a 16 pasos | GGUF (speech.cpp) | MIT |
| Aratako/Irodori-TTS-v4.1-Small (original) | Euler / MeanFlow según versión | no disponible | safetensors / runtime oficial | MIT |
| Aratako/Semantic-DACVAE-Japanese-32dim | no aplica (códec) | no aplica | safetensors / GGUF | MIT (base Apache 2.0) |

No se han proporcionado datos de otros modelos TTS comparables (por ejemplo, XTTS, StyleTTS 2, Fish Speech) en la información disponible.

## Limitaciones y advertencias

- Sólo soporta japonés (ja); no se documenta ningún otro idioma.
- Los ficheros GGUF son específicos de speech.cpp: no funcionan en llama.cpp, LM Studio, Ollama ni otros programas que lean GGUF.
- El modelo no tiene voces propias; requiere siempre una grabación de referencia en japonés a 48 kHz. Sin ella no puede sintetizar.
- No implementa captions ni VoiceDesign, por lo que no se puede describir la voz con texto.
- La clonación de voz plantea riesgos de suplantación y de generación de deepfakes. El autor original impone tres restricciones éticas: no clonar ni suplantar la voz de personas sin consentimiento explícito, no generar información falsa o engañosa, y proporcionar un aviso claro al usar voz generada.
- La licencia es MIT, lo que permite uso comercial, pero está supeditada a las restricciones éticas anteriores.
- La fidelidad frente a la implementación oficial es notablemente inferior en Metal (46-68 dB) que en CPU (95-119 dB); conviene tenerlo en cuenta si se exige máxima precisión numérica.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y se creó el 2026-10-05, por lo que no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El modelo exige speech.cpp v0.3.0 o superior; `speech-tts` y `speech-server`, así como las builds para Linux, requieren v0.5.0 o superior.
- No se dispone de información sobre sesgos del dataset de entrenamiento, composición de datos ni evaluación de robustez ante entradas adversas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sakasegawa/Irodori-TTS-v4.1-Small-GGUF
- Modelo base (Irodori-TTS-v4.1-Small): https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Códec base (Semantic-DACVAE-Japanese-32dim): https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Repositorio del modelo original: https://github.com/Aratako/Irodori-TTS
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Binarios precompilados de speech.cpp: https://github.com/nyosegawa/speech.cpp/releases
- Variante MeanFlow: https://huggingface.co/sakasegawa/Irodori-TTS-v4.1-Small-MF-GGUF
