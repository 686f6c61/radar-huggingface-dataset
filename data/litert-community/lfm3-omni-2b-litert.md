# litert-community/LFM3-Omni-2B-LiteRT

## Resumen

LFM3-Omni-2B-LiteRT es la conversión al formato LiteRT del modelo multimodal LFM3-Omni-2B de Liquid AI, publicada por la comunidad litert-community. Se trata de un modelo any-to-any de 2,17 mil millones de parámetros (BF16 en origen) que acepta texto, imagen, vídeo y audio como entrada, y produce respuestas en texto o en voz sintetizada. El objetivo de esta versión es el despliegue on-device: un único fichero `.litertlm` de 3,23 GB (decoder en int8) que se ejecuta con el runtime LiteRT-LM de Google en CPU o GPU de dispositivos móviles, más una serie de grafos TFLite y un runner en Python para la salida de voz.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo omni de 2B puede correr en un teléfono con latencias utilizables: en un Galaxy S26 con GPU, LiteRT-LM 0.18.1 y contexto de 4.096 tokens, alcanza 1.139 tok/s de prefill, 27,0 tok/s de decodificación y un time-to-first-token de 0,93-0,94 s. Por otro lado, documenta con detalle las limitaciones de la conversión: la salida de voz requiere un pipeline Python aparte, la entrada de vídeo solo está soportada por la muestra Android `photo_voice_chat`, y la NPU no está soportada en esta versión.

El modelo base es de Liquid AI y mantiene su licencia LFM1.0 (lfm1.0), que no es una licencia open source estándar y condiciona el uso comercial. Los pesos originales están disponibles en BF16 y en GGUF en el repositorio del proveedor; este repositorio es únicamente la forma LiteRT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal any-to-any; decoder transformer convertido a LiteRT; encoders de visión y audio integrados en el fichero int8) |
| Parámetros totales | 2,17 B (BF16 en el modelo base) |
| Parámetros activos | No disponible |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | Decoder en int8 en el fichero `.litertlm`; grafos de voz en float32; activaciones fp16 (por defecto) o fp32 en GPU |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | `.litertlm` (LiteRT-LM), `.tflite` (grafos de voz), `.npy` (ventana de overlap-add), `tokenizer.json`; GGUF disponible en el repositorio del modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal any-to-any: recibe texto, imagen, vídeo y audio, y genera texto o voz. El repositorio LiteRT incluye el decoder cuantizado a int8 junto con los encoders de visión y audio dentro del fichero `.litertlm`, y separa la síntesis de voz en grafos TFLite independientes: un depth decoder por paso (`depth_step_f32`), un depth decoder por trama de 80 ms con las tres pasadas y el muestreo de los 12 códigos embebidos en el grafo (`depth_frame2_f32`, con temperatura 0,4 y penalización de repetición 1,2 como constantes), un embedding de trama (`frame_embed_f32`) y un decoder de códec de audio a 12 tramas (0,96 s) o 1 trama por llamada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La conversión se realizó desde la revisión `ce2458cb` del modelo base en BF16. La innovación técnica destacable de esta versión es el propio pipeline de despliegue: un decoder int8 en un único fichero LiteRT-LM para texto, imagen y audio, más un conjunto de grafos TFLite que implementan el códec de voz con ventana de overlap-add y un runner Python que define el contrato de los grafos.

## Capacidades

- Generación de texto a partir de texto, imagen o audio (entrada de audio leída en ventanas de 30 s).
- Respuesta en voz sintetizada (text-to-speech) mediante los grafos TFLite y el runner Python.
- Entrada de vídeo limitada: los primeros 13 s de un vídeo, una imagen por segundo con su audio, solo a través de la muestra Android `photo_voice_chat`.
- Comprensión de imágenes para preguntas y respuestas visuales.
- Reconocimiento automático de habla (ASR) en inglés, invocable mediante prompt de sistema.
- Modo de respuesta intercalada texto/voz (`--speech interleaved`).
- Capacidades multilingües: únicamente inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio de salida en tiempo real o visión de vídeo completa: no disponibles.

## Casos de uso

- Asistente de voz on-device en Android: el fichero `.litertlm` responde en texto y los grafos de voz generan la respuesta hablada; con 27 tok/s de decodificación en GPU de Galaxy S26 y un TTFT inferior a 1 s, es viable para interacción conversacional en el propio dispositivo sin conexión.
- Reconocimiento de habla local: con `--audio speech.wav --system "Perform ASR in English."` el modelo transcribe audio de 16 kHz mono en ventanas de 30 s, adecuado para dictado o notas de voz privadas que no deben salir del teléfono.
- Descripción y pregunta-respuesta sobre imágenes: `--image photo.png` permite identificar objetos o responder preguntas sobre una foto, útil en aplicaciones de accesibilidad o catalogación visual en campo sin cobertura.
- Análisis de clips cortos de vídeo: la muestra `photo_voice_chat` prepara un vídeo de 12 s para preguntas en 11,0 s (Galaxy S26) o 23,6 s (Pixel 11 Pro), lo que habilita casos de revisión rápida de grabaciones en movilidad.
- Síntesis de voz para lectura de contenidos: `--speech tts` convierte texto en WAV a 16 kHz; en un Mac M4 Max el códec añade unos 6 ms por cada 0,96 s de audio, por lo que la generación es prácticamente en tiempo real en CPU.
- Prototipado y validación de pipelines multimodales: el directorio `fixtures/` incluye prompts, respuestas grabadas y comprobaciones (`--fixtures`) que permiten verificar que una conversión o un cambio de runtime produce las mismas salidas que en el entorno de referencia.
- Aplicaciones de privacidad estricta (modo avión): la muestra Android funciona sin red, con el modelo y todos los grafos en el dispositivo, lo que encaja en escenarios sanitarios, industriales o de defensa donde no se permite enviar datos a la nube.

## Benchmarks y rendimiento

Rendimiento medido en Galaxy S26 (SM-S942Q) con LiteRT-LM 0.18.1, 1.024 tokens de prefill, 256 tokens generados, contexto de 4.096 tokens, mediana de 2 procesos:

| Backend | Prefill (tok/s) | Decode (tok/s) | Time to first token | Memoria pico del proceso (VmHWM) |
|---|---:|---:|---:|---:|
| GPU (por defecto, activaciones fp16) | 1.139 | 27,0 | 0,93–0,94 s | 1,05 GB (+ 3,08 GB de asignaciones GPU) |
| CPU, 4 hilos | 557 | 25,9 | 1,8–1,9 s | 3,42 GB |
| GPU con activaciones fp32 | 270 | 23,5 | No disponible | No disponible |

Otros datos de rendimiento:

| Escenario | Medición |
|---|---|
| Salida de voz en Mac M4 Max (CPU) | 0,48–0,50 s de cómputo por segundo de audio (decoder, depth decoder y frame embedding); códec ~6 ms por 0,96 s de audio con 4 hilos |
| Vídeo de 12 s listo para preguntas, Galaxy S26 | 11,0 s (media de 4 lecturas; encoder de visión y adaptador en GPU, float32) |
| Vídeo de 12 s listo para preguntas, Pixel 11 Pro | 23,6 s (media de 4 lecturas; encoder de visión y adaptador en GPU, float16) |
| Coincidencia de respuestas | 14 de 14 prompts de prueba dieron las mismas respuestas en Galaxy S26 y en Mac (28 de octubre de 2026) |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM de inferencia: el fichero `.litertlm` ocupa 3,23 GB en disco; en Galaxy S26 la GPU usa 1,05 GB de memoria de proceso más 3,08 GB de asignaciones GPU, y la CPU requiere 3,42 GB de memoria pico.
- GPU recomendadas: no se especifican modelos de escritorio; las mediciones oficiales son en GPU móvil de Galaxy S26 y Pixel 8a/11 Pro. En Mac se ha medido el runner de voz en CPU (M4 Max).
- Cabe en GPU de consumo: no hay datos para RTX 4090 u otras GPU de escritorio; el objetivo declarado es edge/móvil.
- NPU: no soportada en esta versión.
- Opciones de despliegue: LiteRT-LM 0.18.1 (CPU o GPU) para el fichero `.litertlm`; runner Python (`runner/`) y ejemplo `examples/run_omni.py` para texto y voz; muestra Android `photo_voice_chat` (Kotlin, LiteRT 2.3.0) para vídeo y voz en dispositivo.
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 GPU, TTFT de 0,93-0,94 s y 27,0 tok/s de decodificación; en CPU de 4 hilos, TTFT de 1,8-1,9 s y 25,9 tok/s.
- Requisitos de audio: WAV mono de 16 bits a 16 kHz; grabaciones de más de 30 s se leen en ventanas de 30 s y deben caber en el contexto de 4.096 tokens (una grabación de 251 s cupo, una de 502 s no).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| LFM3-Omni-2B-LiteRT (esta ficha) | 2,17 B | 4.096 | Texto, imagen, vídeo (limitado), audio de entrada; texto y voz de salida | LFM1.0 | LiteRT (.litertlm, .tflite), on-device |
| LiquidAI/LFM3-Omni-2B (modelo base) | 2,17 B (BF16) | No disponible | Texto, imagen, vídeo, audio; texto y voz | LFM1.0 | Safetensors BF16 |
| LiquidAI/LFM3-Omni-2B-GGUF | 2,17 B | No disponible | Texto, imagen, vídeo, audio; texto y voz | LFM1.0 | GGUF (llama.cpp y similares) |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, lo que limita su uso en el mercado hispanohablante sin adaptación.
- Contexto corto: 4.096 tokens; las grabaciones largas se procesan en ventanas de 30 s y pueden no caber (una de 502 s no cupo).
- Salida de voz fuera del fichero principal: requiere grafos TFLite y el runner Python o la muestra Android; no es una función del `.litertlm` por sí solo.
- Vídeo muy restringido: solo los primeros 13 s (una imagen por segundo con audio) y solo mediante la muestra Android `photo_voice_chat`.
- NPU no soportada en esta versión.
- Licencia LFM1.0 (license: other): no es una licencia open source estándar; es necesario revisar los términos antes de cualquier uso comercial.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación; al ser un modelo de 2B, la fiabilidad en razonamiento complejo es limitada.
- Sesgos: no se proporciona información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Tool calling y agentes: no se documenta soporte, por lo que no debe asumirse en producción.
- Memoria: en GPU móvil el consumo combinado (proceso más asignaciones GPU) supera los 4 GB, lo que puede ser ajustado en dispositivos de gama media.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Versión GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia LFM1.0: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT/blob/main/LICENSE
- Muestra Android photo_voice_chat: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/photo_voice_chat
- Fixtures y contrato de pruebas: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT/blob/main/fixtures/README.md
