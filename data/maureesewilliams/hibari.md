# maureesewilliams/hibari

## Resumen

hibari es un modelo de síntesis de voz (text-to-speech) en inglés, extremadamente compacto, publicado por el desarrollador maureesewilliams. Se distribuye como modelos ONNX de 7,9 MB en int8 con 6,15 M de parámetros por voz, capaces de sintetizar a 24 kHz a unas 128 veces el tiempo real en un solo hilo de CPU. Es un modelo destilado de hexgrad/Kokoro-82M: cada voz de hibari se obtiene destilando una voz concreta del modelo profesor, y la voz por defecto (heart, femenina estadounidense) alcanza un UTMOS de 4,43 frente al 4,52 del profesor, siendo unas 65 veces más rápida.

El modelo no es un transformer generativo de audio: la red predice un espectro paramétrico por trama (80 Hz, una trama cada 12,5 ms) y una rutina numpy externa convierte esa representación en audio con una única STFT inversa. Incorpora su propio front-end de texto a fonemas (G2P) basado en léxicos misaki y una red para palabras fuera de vocabulario, sin dependencias de spaCy ni espeak-ng, de modo que la entrada es texto plano y la salida es audio.

Su relevancia práctica está en el despliegue en entornos sin GPU: el paquete `hibari-tts` depende solo de numpy y onnxruntime, funciona en Windows, macOS y Linux (x64 y arm64) y ocupa 158 MB de RAM en pico con la versión int8. Es una opción realista para TTS local de baja latencia, generación por lotes a gran escala o integración en aplicaciones de escritorio y dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional tipo ConvNeXt con capas de atención ligera compartidas; decoder espectral paramétrico (rama armónica, rama de ruido y rama de fase libre) con STFT inversa en el host |
| Parametros totales | 6,15 M por voz (ProsodyNet 1,68 M; encoder de texto del decoder 0,29 M; decoder 3,41 M; cabeza de salida 0,77 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; la API expone streaming por frases, sin límite documentado) |
| Tipos de cuantizacion | int8 (pesos MatMul) y fp32 |
| Idiomas soportados | Inglés (en), con acentos estadounidense y británico según la voz |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8 y fp32) para inferencia; safetensors para los checkpoints PyTorch del decoder y ProsodyNet |
| Frecuencia de muestreo | 24 kHz |
| Voces incluidas | 5: heart (af_heart, femenina estadounidense, incluida en el wheel), fenrir (am_fenrir, masculina estadounidense), emma (bf_emma, femenina británica), fable (bm_fable, masculina británica), kore (af_kore, femenina estadounidense) |
| Tamano de fichero | 7,94 MB por voz en int8; 24,75 MB en fp32; repositorio completo de 0,2 GB |
| Dependencias de inferencia | numpy y onnxruntime; G2P propio sin spaCy ni espeak-ng |
| Modelo base | hexgrad/Kokoro-82M |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

hibari se organiza en dos etapas. ProsodyNet (1,68 M de parámetros) procesa la secuencia de fonemas con 6 capas de atención compartidas de dimensión 192 y predice duraciones, así como F0 y energía a 80 Hz mediante 6 bloques ConvNeXt dilatados. El decoder parte de un encoder de texto con front-end ConvNeXt y 4 capas de atención compartidas de dimensión 128 (0,29 M), y aplica después 8 bloques ConvNeXt a 80 Hz con dimensión 256 y feed-forward de 768 (3,41 M). Una cabeza lineal de 0,77 M proyecta a 5 × 601 componentes espectrales por trama. La red se detiene en el espectro paramétrico: una rama armónica aplica magnitud y rotación de fase a la STFT de un tren de pulsos limitado en banda construido a partir de F0, junto con una rama de ruido y una rama de fase libre. El host genera el audio final con una única STFT inversa, lo que mantiene el trabajo por muestra fuera de la red neuronal.

El modelo es una destilación de Kokoro-82M: cada una de las cinco voces se destila de una voz del profesor. La model card indica que el decoder se entrenó hasta el checkpoint `decoder_v3_40k` y que los pesos PyTorch se publican junto a los ONNX. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no procede en un modelo TTS). La innovación principal es la separación entre predicción espectral y reconstrucción de audio, que permite un modelo de 6,15 M de parámetros con calidad cercana al profesor (UTMOS 4,43 frente a 4,52) y una aceleración de unas 65 veces.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto plano, con normalización de números, fechas y cantidades monetarias (según las muestras publicadas).
- Cinco voces predefinidas con acentos estadounidense y británico, tanto femeninas como masculinas.
- Front-end G2P propio (léxicos misaki, pesos de etiquetado, tabla de casos especiales del tokenizador, tablas de normalización y red `oov.onnx` para palabras fuera de vocabulario).
- Control de velocidad mediante la entrada `speed` del modelo ONNX.
- Streaming por frases: la API devuelve un array numpy por frase para reducir la latencia percibida.
- Interfaz de línea de comandos (`hibari "texto" -o salida.wav`, `--voice`, `--list-voices`) y API Python (`Hibari()`, `tts(...)`, `tts.save(...)`, `tts.stream(...)`).
- Interfaz ONNX de bajo nivel documentada: entrada `ids` [1, L] int64 y `speed` [1] float32; salidas `lh, theta, ln, lr, phi` [1, 601, F] y `f0` [1, F].
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada (ASR) ni generación de texto: es exclusivamente un modelo TTS.
- No soporta clonación de voz, control de emoción ni SSML.

## Casos de uso

- Lectura de notificaciones y alertas en local: con 7,9 MB por voz y 158 MB de RAM en pico, el modelo puede ejecutarse dentro de una aplicación de escritorio o un dispositivo arm64 para locutar avisos sin conexión ni coste por petición.
- Asistentes de voz offline: la latencia de 12 ms en frases cortas y 71 ms en frases largas (un hilo, Ryzen 9 9900X) permite respuestas habladas casi inmediatas sin depender de servicios en la nube.
- Generación de audiolibros y podcasts por lotes: a 128 veces el tiempo real en un solo núcleo, una hora de audio se sintetiza en torno a 28 segundos de cómputo, lo que abarata la producción masiva de contenido en inglés.
- Accesibilidad: integración en lectores de pantalla y aplicaciones de apoyo para convertir texto en voz con un consumo de recursos mínimo en equipos sin GPU.
- Sistemas IVR y atención al cliente telefónica: el streaming por frases y el bajo consumo permiten construir respuestas de voz en servidores CPU compartidos, sin GPUs dedicadas.
- Generación de datos sintéticos para pipelines de ASR: las cinco voces y el control de velocidad permiten crear corpus de audio etiquetado para aumentar datasets de reconocimiento de voz en inglés.
- Pruebas automatizadas en CI/CD: al ser un paquete Python autocontenido con dependencias mínimas, se puede usar para verificar regresiones en pipelines de audio sin infraestructura especial.
- Prototipado de doblaje y vídeo corto: útil para maquetas de locución en inglés antes de contratar una grabación profesional.

## Benchmarks y rendimiento

Evaluación sobre 50 frases nunca sintetizadas en entrenamiento. UTMOS con `utmos22_strong` (mayor es mejor), WER de las transcripciones de Whisper base, velocidad medida en un hilo de onnxruntime sobre un Ryzen 9 9900X.

| Modelo | Parámetros | Fichero (MB) | x tiempo real (1 hilo) | Latencia corta / larga | RAM pico (MB) | UTMOS | WER |
|---|---|---|---|---|---|---|---|
| hibari int8 | 6,15 M | 7,94 | 128 | 12 / 71 ms | 158 | 4,43 | 2,7 % |
| hibari fp32 | 6,15 M | 24,75 | 104 | 15 / 76 ms | 171 | 4,43 | 2,7 % |
| Paradee-8M int8 | 9,06 M | 9,04 | 18,3 | 87 / 602 ms | 176 | 4,41 | 2,8 % |
| Kokoro-7M-Distill | 7,48 M | 30,1 | 17,4 | 108 / 357 ms | 889 | no disponible | no disponible |
| Kokoro-82M (profesor) | 81,8 M | 327 | 1,9 | 739 / 3880 ms | no disponible | 4,52 | no disponible |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. Toda la inferencia documentada se ejecuta en CPU con onnxruntime.
- RAM: 158 MB en pico con int8 y 171 MB con fp32 (medidos en la evaluación del autor).
- CPU: 128 veces el tiempo real en un solo hilo de onnxruntime sobre un Ryzen 9 9900X; 104 veces en fp32. Cabe en cualquier CPU de consumo actual y el paquete soporta x64 y arm64 en Windows, macOS y Linux.
- GPU: no se han publicado datos de aceleración por GPU ni requisitos de VRAM; el modelo puede cargarse con otros execution providers de ONNX Runtime, pero no hay cifras disponibles.
- Almacenamiento: 7,94 MB por voz en int8, 24,75 MB en fp32; el repositorio completo ocupa 0,2 GB (incluye checkpoints PyTorch y muestras).
- Opciones de despliegue: paquete `hibari-tts` (PyPI) con CLI y API Python, o carga directa de los ficheros ONNX con onnxruntime más la rutina DSP de `src/hibari/dsp.py`. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: 12 ms de latencia en frase corta y 71 ms en frase larga con int8; aproximadamente 128 × tiempo real en un hilo, escalable en paralelo por proceso.

## Comparativa con modelos similares

| Modelo | Parámetros | Fichero | x tiempo real | UTMOS | WER | Licencia | Idiomas |
|---|---|---|---|---|---|---|---|
| hibari int8 | 6,15 M | 7,94 MB | 128 | 4,43 | 2,7 % | Apache 2.0 | en |
| Paradee-8M int8 | 9,06 M | 9,04 MB | 18,3 | 4,41 | 2,8 % | no disponible | no disponible |
| Kokoro-7M-Distill | 7,48 M | 30,1 MB | 17,4 | no disponible | no disponible | no disponible | no disponible |
| Kokoro-82M (profesor) | 81,8 M | 327 MB | 1,9 | 4,52 | no disponible | Apache 2.0 (modelo base) | en |

hibari destaca por la relación entre calidad y coste computacional: iguala prácticamente el UTMOS de Paradee-8M con un tercio de los parámetros y aproximadamente siete veces más velocidad, y se queda a 0,09 puntos del profesor Kokoro-82M siendo unas 65 veces más rápido y ocupando 41 veces menos espacio en disco. No se dispone de datos de licencia ni de idioma de Paradee-8M y Kokoro-7M-Distill en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas, y el acento depende de la voz elegida (estadounidense o británico).
- Cinco voces fijas: no hay clonación de voz, control de emoción, énfasis ni SSML; el único control expuesto es la velocidad.
- Riesgo de errores de pronunciación en siglas, nombres propios y palabras fuera del vocabulario; el G2P incluye una red OOV, pero no se han publicado métricas específicas de precisión del front-end.
- La evaluación se limita a 50 frases y a un único conjunto; no hay validación independiente ni evaluación amplia de inteligibilidad en dominios difíciles (jerga técnica, nombres extranjeros, etc.).
- El WER del 2,7 % se mide con transcripciones de Whisper base, lo que puede no reflejar la inteligibilidad percibida por un oyente humano.
- Repositorio muy reciente y con nula tracción: 0 descargas y 1 like en el momento de la consulta (creado el 20 de octubre de 2026), por lo que la validación por parte de la comunidad es mínima.
- La licencia del repositorio es Apache 2.0 y permite uso comercial, pero el modelo deriva de Kokoro-82M y las voces se destilan de voces concretas de ese modelo; la información disponible no detalla condiciones adicionales sobre los derechos de las voces originales, por lo que conviene revisarlas antes de un despliegue comercial a gran escala.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni flujos de agente.
- Los ONNX por sí solos no producen audio: devuelven parámetros espectrales y F0, y requieren la rutina numpy de reconstrucción (tren de pulsos más STFT inversa) documentada en el repositorio de GitHub.
- No se han publicado datos de comportamiento en GPUs ni de latencia en hardware de gama baja (por ejemplo, Raspberry Pi), solo la referencia del Ryzen 9 9900X.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maureesewilliams/hibari
- Repositorio de código, paquete Python y pipeline de entrenamiento: https://github.com/MMWilliams/hibari
- Modelo base (profesor): https://huggingface.co/hexgrad/Kokoro-82M
- Muestra de audio, saludo: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/hello.wav
- Muestra de audio, números, fechas y dinero: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/numbers.wav
- Muestra de audio, pregunta: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/question.wav
- Muestra de audio, narración: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/story.wav
- Muestra de la voz fenrir: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/fenrir.wav
- Muestra de la voz emma: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/emma.wav
- Muestra de la voz fable: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/fable.wav
- Muestra de la voz kore: https://huggingface.co/maureesewilliams/hibari/resolve/main/samples/kore.wav

Nota: los resultados de la búsqueda web proporcionados no contenían enlaces relacionados con este modelo (eran contenido no pertinente), por lo que se han omitido.
