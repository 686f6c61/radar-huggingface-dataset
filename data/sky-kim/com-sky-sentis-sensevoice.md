# Sky-Kim/com.sky.sentis.sensevoice

## Resumen

`sentis-sensevoice` es una conversión del modelo de reconocimiento automático del habla SenseVoice-Small (desarrollado originalmente por FunAudioLLM, el equipo de Alibaba asociado a FunASR) al formato del motor de inferencia Unity Sentis en precisión FP16. El autor de la conversión y del wrapper de runtime es Sky-Kim, y el paquete incluye tanto los pesos convertidos como una implementación completa en C# del pipeline de inferencia, pensada para ejecutarse en dispositivo (on-device) dentro de aplicaciones Unity.

El modelo resuelve el problema de transcribir audio a texto sin depender de servicios en la nube, con soporte para chino, inglés, cantonés, japonés y coreano, detección automática de idioma y etiquetado adicional de emoción y eventos de audio. Su arquitectura es un encoder no autorregresivo con decodificación CTC, lo que implica una sola pasada por utterance y un coste que crece linealmente con la duración del audio, sin bucle de decodificador.

Es relevante para desarrolladores de aplicaciones Unity que necesitan ASR local con latencia controlada y sin fuga de audio a servidores externos: el paquete incluye gestión de frame rate en GPUs móviles, APIs de transcripción parcial en streaming y cancelación de inferencias. El repositorio es pequeño (0,5 GB) y tiene un uso muy bajo en HuggingFace (9 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo con cabecera CTC (SenseVoice-Small) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa por utterance; el coste crece con la duración del audio) |
| Tipos de cuantización | FP16 (pesos convertidos a Sentis FP16); el resto de cuantizaciones no disponible |
| Idiomas soportados | Chino, inglés, cantonés, japonés y coreano, con detección automática de idioma |
| Licencia | `other` / `model-license`; pesos derivados del checkpoint original bajo FunASR Model License; el código wrapper es MIT |
| Formato de pesos | `.sentis` (Unity Sentis), más vocabulario `tokens.txt` y fichero CMVN `sensevoice_cmvn.f32` |

## Arquitectura y entrenamiento

El modelo subyacente es SenseVoice-Small, un encoder transformer con salida CTC (Connectionist Temporal Classification) y sin decodificador autorregresivo. La conversión mantiene esa estructura: una única pasada del encoder sobre las características acústicas produce logits CTC, y la decodificación se realiza por argmax en dispositivo, colapsando repeticiones y tokens en blanco. El pipeline completo incluido en el paquete es: filtro bancario log-mel compatible con Kaldi (80 bins, ventanas de 25 ms con salto de 10 ms sobre audio mono a 16 kHz), apilado LFR (7 frames cada 6, resultando en 560 dimensiones y 60 ms por frame), normalización CMVN con media y desviación precalculadas, paso por el encoder y decodificación CTC.

Los cuatro primeros tokens de salida son etiquetas especiales: idioma (`<|ko|>`, etc.), emoción (`<|NEUTRAL|>`, etc.), evento de audio (`<|Speech|>`, etc.) y normalización de texto (`<|withitn|>`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de `FunAudioLLM/SenseVoiceSmall`, no incluida en la información proporcionada. La innovación técnica destacable de esta conversión es la posibilidad de repartir la pasada del encoder a lo largo de varios frames (`FramesPerInference`) mediante `ScheduleIterable`, lo que evita bloqueos de renderizado en GPUs móviles, y la cancelación cooperativa de inferencias en curso.

## Capacidades

- Transcripción de voz a texto en chino, inglés, cantonés, japonés y coreano.
- Detección automática del idioma hablado, expuesta como etiqueta en la salida.
- Etiquetado de emoción del hablante (por ejemplo, `NEUTRAL`).
- Etiquetado de eventos de audio (por ejemplo, `Speech`).
- Normalización de texto configurable mediante la etiqueta `withitn`.
- API de transcripción completa por utterance (`TranscribeAsync`).
- API de transcripción parcial en streaming (`PartialTranscript`, `FinalTranscript`, `BeginUtterance`, `PushSamples`, `EndUtterance`).
- Temporización de tokens en la salida de la decodificación CTC.
- Ejecución on-device con backend GPUCompute (Vulkan) o CPU en Unity Sentis.
- Reparto configurable de la inferencia entre frames para mantener el frame rate en móvil.
- Cancelación de inferencias mediante `CancellationToken`.
- Cálculo de características en un hilo del thread pool, dejando al hilo llamante solo la subida, planificación y lectura.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Subtitulado en tiempo real dentro de una aplicación Unity: usando `PushSamples` y `PartialTranscript` se pueden generar subtítulos que se actualizan mientras el usuario habla, con la ventana de latencia controlada por `FramesPerInference`.
- Asistentes de voz para juegos y experiencias XR: el modelo corre en el dispositivo, de modo que el audio del jugador no sale del terminal, lo que simplifica el cumplimiento de privacidad y elimina la dependencia de red.
- Dictado multilingüe en aplicaciones de productividad: la detección automática de idioma permite alternar entre chino, inglés, japonés, coreano y cantonés sin configuración manual por parte del usuario.
- Análisis de llamadas o reuniones con etiquetado emocional: la salida incluye emoción y evento de audio junto al texto, lo que permite construir indicadores de tono en herramientas de atención al cliente o de análisis de calidad.
- Transcripción de archivos de audio pregrabados en pipelines por lotes: al ser no autorregresivo, el coste es proporcional a la duración y no requiere gestión de estado entre tokens, lo que simplifica el procesamiento por lotes.
- Accesibilidad en aplicaciones móviles: transcripción local de voz a texto para personas con dificultades auditivas o para entrada por voz sin conexión.
- Prototipado rápido de ASR en Unity: el paquete incluye `SenseVoiceRecognizer.cs` y `KaldiFbank.cs` autocontenidos, lo que permite integrar el reconocedor con unas pocas líneas de C# sin escribir el preprocesado acústico.
- Filtrado y moderación de contenido en dispositivos: la combinación de transcripción, emoción y evento de audio permite clasificar clips localmente antes de enviarlos a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una medida operativa: en un teléfono con Snapdragon 8 Elite y backend Vulkan, con partials en streaming continuo, el reparto de la inferencia en 40 frames redujo los frames perdidos por encima de 100 ms de aproximadamente 1,3 por segundo a ninguno, manteniendo el objetivo de 60 fps. No se especifican valores de WER, latencia absoluta ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB y los pesos están en FP16, por lo que el peso del modelo es del orden de cientos de MB, pero no se detalla la cifra exacta.
- GPU recomendadas: no se especifican modelos de escritorio; la model card menciona GPUs móviles con Vulkan (medición en Snapdragon 8 Elite).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el backend es Unity Sentis, que soporta GPUCompute y CPU, pero no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: Unity Sentis exclusivamente; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un formato `.sentis` específico.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que una pasada del encoder tarda "unos cientos de ms para varios segundos de voz" en móvil, sin cifras exactas.
- En builds de reproductor, los ficheros de `Models~` deben copiarse a `StreamingAssets` y pasarse esa carpeta a `Load`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.sensevoice | no disponible | no disponible | zh, en, yue, ja, ko | FunASR Model License (wrapper MIT) | `.sentis`, Unity Sentis |
| FunAudioLLM/SenseVoiceSmall | no disponible en la información proporcionada | no disponible | zh, en, yue, ja, ko | FunASR Model License | PyTorch / FunASR |
| Whisper (variantes de OpenAI) | no disponible en la información proporcionada | no disponible | multilingüe | MIT (según variante) | safetensors, GGUF, múltiples runtimes |
| Vosk / Kaldi | no disponible en la información proporcionada | no disponible | múltiples modelos por idioma | Apache 2.0 (según modelo) | varios |

La comparación cuantitativa no es posible con los datos disponibles: no se han proporcionado parámetros, contexto ni resultados de benchmarks de este modelo ni de las alternativas. La diferencia principal frente a SenseVoiceSmall original es el formato de despliegue (Sentis frente a PyTorch/FunASR) y la inclusión de un runtime C# autocontenido; frente a Whisper, la arquitectura no autorregresiva y el etiquetado de emoción y eventos de audio son los rasgos diferenciales documentados.

## Limitaciones y advertencias

- El modelo solo realiza ASR; no soporta generación de texto libre, razonamiento, código, matemáticas ni tool calling.
- La licencia de los pesos es la FunASR Model License, no una licencia permisiva estándar; es necesario revisar sus términos antes de un uso comercial. El código wrapper es MIT, pero eso no cubre los pesos.
- El repositorio tiene un uso muy bajo (9 descargas, 0 likes) y no hay evidencia de validación por parte de terceros; el riesgo de mantenimiento y de errores no corregidos es alto.
- No se han publicado métricas de precisión (WER) ni evaluaciones por idioma en la información disponible, por lo que el rendimiento real en cada uno de los cinco idiomas es desconocido.
- El modelo está pensado para audio mono a 16 kHz; otras frecuencias o canales requieren remuestreo previo no incluido en la documentación.
- El coste de inferencia crece con la duración del audio; no hay ventana de contexto documentada, por lo que utterances muy largas pueden degradar la latencia o el uso de memoria.
- En GPUs móviles, una pasada única del encoder puede bloquear el renderizado; es necesario configurar `FramesPerInference` para mantener el frame rate, a costa de retrasar la transcripción hasta N frames.
- Las etiquetas de emoción y evento de audio son categorías cerradas del modelo; no se documenta su fiabilidad ni su calibración.
- No se dispone de información sobre sesgos por idioma, acento o dominio; al ser un modelo entrenado mayoritariamente para chino e inglés, el rendimiento en cantonés, japonés y coreano podría ser inferior.
- Riesgo de alucinación en pasajes con ruido o silencio: la decodificación CTC puede producir texto espurio en segmentos sin habla, un comportamiento habitual en modelos ASR.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sky-Kim/com.sky.sentis.sensevoice
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo (FunASR Model License): https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Repositorio FunASR: https://github.com/modelscope/FunASR
- Unity Sentis (documentación del motor de inferencia): no disponible en la información proporcionada
