# openmartdev/awaken-full-duplex

## Resumen

Awaken Full Duplex es un modelo de voz a voz (speech-to-speech) en tiempo completo (full-duplex) desarrollado por openmartdev, construido como un ajuste fino del modelo semiduplex Fun-Audio-Chat-8B de FunAudioLLM. Su objetivo es permitir conversaciones habladas donde el modelo puede escuchar y hablar simultáneamente, gestionando solapamientos, interrupciones y turnos de palabra de forma natural, sin depender de un detector de actividad de voz ni de turnos estrictos.

La relevancia del modelo reside en su enfoque de adaptación eficiente: en lugar de un preentrenamiento a gran escala con audio conversacional duplex (escaso y costoso), parte de un checkpoint semiduplex y aplica dos etapas de supervisión (SFT) más una etapa corta de aprendizaje por refuerzo (GRPO) centrada en las retroalimentaciones conversacionales (backchannels). Según la model card, esto eleva la tasa de acierto de backchannel del 1 % al 63 % mientras conserva gran parte de las capacidades del modelo base.

Arquitectura: backbone Qwen3-8B con una posición por trama de 200 ms, entrada de audio de usuario en streaming a 24 kHz mediante un codificador causal estilo Whisper con ventana de atención de 2 s, y salida de tokens de texto más 5 tokens de códec por trama renderizados por el decodificador de flujo CosyVoice3 y el vocoder HiFT. El modelo tiene 9.424.246.784 parámetros y está disponible únicamente en inglés bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3-8B con fusión multimodal (audio/texto), codificador de audio causal estilo Whisper, decodificador de audio CosyVoice3 + vocoder HiFT |
| Parametros totales | 9.424.246.784 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de atención del codificador de audio de 2 s; ventanas de conversación de hasta 180 s en entrenamiento; contexto de texto del backbone no especificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Awaken parte del checkpoint semiduplex Fun-Audio-Chat-8B, cuyo backbone es Qwen3-8B. La entrada es audio de usuario en streaming a 24 kHz procesado por un codificador causal estilo Whisper con ventana de atención de 2 s; cada trama de 200 ms se representa como una posición. La salida combina tokens de texto y 5 tokens de códec por trama, renderizados por el decodificador de flujo CosyVoice3 y el vocoder HiFT. La interacción es full-duplex: no hay turnos ni detector de actividad de voz.

El entrenamiento consta de tres fases: (1) SFT etapa 1, que aprende el patrón de entrada en streaming y objetivos alineados de texto y voz sobre 64.000 conversaciones compuestas con ventanas de hasta 180 s; (2) SFT etapa 2, que mezcla al 50/50 los pesos de la etapa 1 con el checkpoint base y continúa sobre 100.132 registros con replay de datos de interacción; (3) GRPO, que mejora la temporización de los backchannels a partir de muestras propias del modelo en ventanas conversacionales. No hay preentrenamiento duplex a gran escala.

## Capacidades

- Conversación hablada full-duplex: escucha y habla simultáneamente, con solapamiento e interrupciones.
- Gestión de turnos de palabra sin detector de actividad de voz.
- Generación de backchannels (señales de escucha activa) con temporización aprendida vía GRPO.
- Respuestas fundamentadas (groundedness) en conversación hablada.
- Resolución de acertijos lógicos hablados.
- Respuesta a preguntas habladas (spoken question answering).
- Salida conjunta de texto y voz (tokens de texto más tokens de códec de audio).
- Prompts de voz personalizados a partir de un clip de referencia de 3-10 s.
- Servidor en vivo vía WebSocket y modo offline con pista de usuario grabada.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso en agente.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede mantener diálogo hablado con solapamiento e interrupciones, adecuado para interfaces manos libres donde el usuario necesita interrumpir sin esperar turnos.
- Atención al cliente telefónica automatizada: la capacidad full-duplex permite reconocer y responder a señales de escucha activa del cliente, mejorando la naturalidad percibida en llamadas.
- Sistemas de acompañamiento conversacional (por ejemplo, asistencia doméstica o educativa): el modelo puede escuchar y emitir retroalimentación mientras el usuario habla, sin cortar el flujo.
- Evaluación de modelos de diálogo hablado: sirve como referencia open source para probar protocolos full-duplex y métricas de backchannel y groundedness.
- Investigación en interacción hablada: permite experimentar con temporización de turnos, solapamiento e interrupciones sobre una base de 8B parámetros con licencia Apache 2.0.
- Prototipos de voz con identidad personalizada: mediante `awaken-voice` se puede generar un prompt de voz a partir de un clip de referencia para adaptar la voz de salida en demos.
- Despliegue offline para transcripción y generación de audio: el modo `awaken-offline` produce `stereo.wav`, `transcript.txt` y `tokens.pt` a partir de una pista de usuario grabada, útil para pipelines de evaluación por lotes.

## Benchmarks y rendimiento

| Metrica | Awaken Full Duplex | Base semiduplex (Fun-Audio-Chat-8B) | Modelos full-duplex abiertos |
|---|---|---|---|
| Tasa de acierto de backchannel (pass rate) | 63 % | no disponible | no disponible |
| Toma de palabra indebida (floor-taking) | 3 % | no disponible | no disponible |
| Sondas de groundedness superadas | 61 % | 66 % | 14-35 % |
| Acertijos lógicos hablados resueltos | 90 % | no disponible | 30-40 % |

Los datos proceden de la model card del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 56,6 GB en safetensors, por lo que la inferencia en precisión completa requiere GPUs de clase A100/H100 (80 GB) o particionado. No se documentan cuantizaciones.
- GPU recomendadas: NVIDIA con CUDA; el autor exige TensorRT 10 y PyTorch >= 2.7 (probado con 2.8 y CUDA 12.8). No se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: no confirmado; por el tamaño del checkpoint (~8B parámetros y repo de 56,6 GB) no es viable en GPUs de consumo sin cuantización, y no se documentan formatos GGUF.
- Opciones de despliegue: servidor propio `awaken-server` (WebSocket, una conversación a la vez), modo offline `awaken-offline`, y uso desde Python con `load_model`, `Decoders`, `DuplexSession` y `system_prompt`. El motor TensorRT se compila una vez por máquina en el primer uso (varios minutos).
- Latencia y throughput: no disponibles. El modelo procesa tramas de 200 ms y usa una ventana de atención de 2 s en el codificador; no se publican cifras de latencia extremo a extremo ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Full-duplex | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Awaken Full Duplex | ~8B (9.424.246.784) | Audio streaming 24 kHz, ventana de audio 2 s, ventanas de conversación hasta 180 s | Sí | Apache 2.0 | Hugging Face y GitHub |
| Fun-Audio-Chat-8B (base) | ~8B | Audio/texto, semiduplex | No | Apache 2.0 | Hugging Face |
| Modelos full-duplex abiertos citados en la model card | no disponible | no disponible | Sí | no disponible | no disponible |

La model card cita de forma agregada modelos full-duplex abiertos con groundedness del 14-35 % y acertijos lógicos del 30-40 %, pero no identifica nombres ni parámetros concretos. No se dispone de comparativas detalladas con alternativas específicas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- No se han publicado benchmarks estándar de razonamiento, código o matemáticas; el rendimiento en esas áreas no está verificado.
- El modelo se adapta desde un checkpoint semiduplex con datos compuestos; la model card advierte que el audio conversacional duplex es escaso y que una curación descuidada puede debilitar el razonamiento y la fundamentación.
- La tasa de backchannel del 63 % implica que aún falla en aproximadamente un tercio de los casos; la toma de palabra indebida del 3 % no es nula.
- Riesgo de alucinación no cuantificado en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Fun-Audio-Chat-8B y del códec CosyVoice3; conviene revisar sus términos.
- El servidor en vivo gestiona una conversación a la vez; no se documenta escalado concurrente.
- Requiere Linux con GPU NVIDIA, CUDA, PyTorch >= 2.7 y TensorRT 10; la compilación inicial del motor TensorRT añade varios minutos de puesta en marcha.
- El uso de prompts de voz requiere derechos sobre el clip de referencia (3-10 s de un único hablante).
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmartdev/awaken-full-duplex
- Página del proyecto: https://avera-labs.github.io/AwakenFullDuplex-FunAudioChat/
- Repositorio GitHub: https://github.com/avera-labs/AwakenFullDuplex-FunAudioChat
- Modelo base Fun-Audio-Chat-8B: https://huggingface.co/FunAudioLLM/Fun-Audio-Chat-8B
- Códec de voz Fun-CosyVoice3-0.5B-2512: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
