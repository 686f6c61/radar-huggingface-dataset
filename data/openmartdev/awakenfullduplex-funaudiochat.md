# openmartdev/AwakenFullDuplex-FunAudioChat

## Resumen

AwakenFullDuplex-FunAudioChat es un modelo de audio a audio (speech-to-speech) de tipo full-duplex desarrollado por openmartdev, derivado mediante fine-tuning del checkpoint Fun-Audio-Chat-8B de FunAudioLLM. Su particularidad es que aprende a escuchar y hablar simultáneamente, sin detector de actividad de voz ni turnos explícitos, lo que permite backchannels (asentimientos verbales como "ajá" o "ya"), interrupciones y cesión de turno de forma natural. El modelo resuelve el problema de que el entrenamiento full-duplex suele requerir grandes volúmenes de audio conversacional con backchannels, material escaso y costoso de curar.

La propuesta técnica es eficiente: parte de un modelo half-duplex ya entrenado y le enseña el comportamiento full-duplex con dos etapas de SFT y una etapa corta de RL (GRPO), sin preentrenamiento duplex a gran escala. Según la model card, esto eleva la tasa de acierto de backchannel del 1% (solo SFT) al 63%, manteniendo capacidades del modelo base: 61% en sondas de groundedness (frente al 66% del base) y 90% en puzles lógicos hablados.

El backbone es Qwen3-8B con una posición por trama de 200 ms, entrada de audio streaming a 24 kHz mediante un encoder causal estilo Whisper con ventana de atención de 2 s, y salida de texto más 5 tokens de códec por trama renderizados por el decodificador de flujo CosyVoice3 y el vocoder HiFT. El modelo tiene 9.424.246.784 parámetros (~9,4B) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-8B) con encoder de audio causal estilo Whisper y decodificador de voz CosyVoice3 + vocoder HiFT; una posición por trama de 200 ms |
| Parametros totales | 9.424.246.784 (~9,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de atencion del encoder de audio: 2 s; ventanas de conversacion de hasta 180 s en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | audio-to-audio |
| Modelo base | FunAudioLLM/Fun-Audio-Chat-8B |
| Tamano del repositorio | 56,6 GB |
| Entrada | Audio de usuario en streaming a 24 kHz |
| Salida | Tokens de texto + 5 tokens de codec por trama |
| Requisitos de software | Linux, NVIDIA GPU con CUDA, Python >= 3.10, PyTorch >= 2.7 (probado con 2.8 y CUDA 12.8), TensorRT 10 |

## Arquitectura y entrenamiento

El modelo combina tres componentes: un encoder de audio causal estilo Whisper que procesa audio de usuario en streaming a 24 kHz con ventana de atención de 2 s; un backbone transformer Qwen3-8B que fusiona características de usuario, embeddings de texto y embeddings de tokens de audio en una capa de fusión compartida; y un decodificador de voz basado en CosyVoice3 (flujo) con vocoder HiFT que renderiza 5 tokens de códec por trama. La interacción es plenamente full-duplex: no hay turnos ni detector de actividad de voz, y el modelo opera con una posición por cada trama de 200 ms.

El entrenamiento parte del checkpoint half-duplex Fun-Audio-Chat-8B y consta de tres fases. La etapa 1 de SFT aprende el patrón de entrada streaming y objetivos alineados de texto y voz sobre 64.000 conversaciones compuestas con ventanas de hasta 180 s. La etapa 2 de SFT mezcla al 50/50 los pesos de la etapa 1 con el checkpoint base y continúa sobre 100.132 registros con replay de los datos de interacción. Finalmente, una etapa corta de GRPO mejora el timing de backchannel a partir de muestras del propio modelo en ventanas conversacionales. No hay preentrenamiento duplex a gran escala.

## Capacidades

- Diálogo hablado full-duplex: escucha y habla a la vez, sin turnos ni VAD.
- Backchannels e interrupciones: produce asentimientos verbales y cede el turno de forma natural (tasa de acierto de backchannel del 63% tras GRPO).
- Generación de voz a partir de prompts de voz: permite crear prompts de voz desde un clip de referencia de 3-10 s con la herramienta `awaken-voice`.
- Comprensión de audio en streaming con ventana de atención de 2 s.
- Razonamiento y groundedness conservados respecto al modelo base (61% en sondas de groundedness, 90% en puzles lógicos hablados).
- Salida simultánea de texto (transcripción) y audio (stereo.wav en modo offline).
- Soporte de servidor en vivo por WebSocket (protocolo en `awaken_chat/server/protocol.py`).
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede mantener diálogo hablado full-duplex con backchannels e interrupciones, adecuado para interfaces de voz donde la naturalidad del turno es crítica.
- Atención al cliente telefónica automatizada: gestiona conversaciones con cesión de turno natural y reconocimiento de interrupciones del usuario, sin depender de un detector de actividad de voz.
- Agentes de voz para acompañamiento o tutoría: el razonamiento hablado conservado (90% en puzles lógicos) permite usarlo en escenarios educativos donde el modelo debe razonar en voz alta mientras escucha.
- Evaluación de naturalidad conversacional: útil como referencia para investigar timing, solapamiento y backchannels en sistemas de diálogo hablado.
- Generación de audio con voz personalizada: mediante prompts de voz creados con `awaken-voice` a partir de un clip de 3-10 s, para locuciones o demos con una identidad de voz concreta.
- Procesamiento offline de grabaciones: la herramienta `awaken-offline` genera `stereo.wav`, `transcript.txt` y `tokens.pt` a partir de una pista de usuario grabada, útil para transcripción y análisis de conversaciones.
- Prototipado de servidores de voz en vivo: el servidor WebSocket permite desplegar una conversación simultánea por instancia para pruebas de integración.

## Benchmarks y rendimiento

| Metrica | AwakenFullDuplex | Base half-duplex (Fun-Audio-Chat-8B) | Modelos full-duplex abiertos |
|---|---|---|---|
| Tasa de acierto de backchannel (tras GRPO) | 63% | No disponible | No disponible |
| Tasa de acierto de backchannel (solo SFT) | 1% | No disponible | No disponible |
| Toma de turno indebida | 3% | No disponible | No disponible |
| Sondas de groundedness | 61% | 66% | 14-35% |
| Puzles logicos hablados | 90% | No disponible | 30-40% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 56,6 GB y el modelo tiene ~9,4B parámetros, por lo que en precisión completa requiere del orden de 19-20 GB solo para pesos, más el códec de voz y el motor TensorRT.
- GPU recomendadas: NVIDIA con CUDA; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos, sería viable en GPUs con 24 GB o más en cuantización, pero no se documentan cuantizaciones.
- Opciones de despliegue: servidor propio `awaken-server` (WebSocket), modo offline `awaken-offline`, integración desde Python con `awaken_chat` (load_model, Decoders, DuplexSession); requiere TensorRT 10 y construye el motor TensorRT una vez por máquina en el primer uso (tarda unos minutos); opcionalmente flash-attn para decodificación más rápida.
- Latencia y throughput: no disponibles; el servidor en vivo atiende una conversación a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Full-duplex | Idiomas | Licencia |
|---|---|---|---|---|---|
| AwakenFullDuplex-FunAudioChat | ~9,4B | No disponible | Si | Ingles | Apache 2.0 |
| Fun-Audio-Chat-8B (base) | ~8B | No disponible | No (half-duplex) | No disponible | No disponible |
| Modelos full-duplex abiertos (sin especificar) | No disponible | No disponible | Si | No disponible | No disponible |

La model card compara cualitativamente con modelos full-duplex abiertos en groundedness (61% frente a 14-35%) y puzles lógicos hablados (90% frente a 30-40%), pero no identifica los modelos concretos ni ofrece una comparativa detallada de parámetros, contexto o licencia.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- No se han publicado datos sobre sesgos; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card reporta un 61% en groundedness, inferior al 66% del base, lo que indica cierta pérdida de anclaje factual.
- El modelo está pensado para conversación hablada; no se documenta soporte de tool calling, function calling ni agentes multi-paso.
- Requiere Linux con GPU NVIDIA, CUDA, PyTorch >= 2.7 y TensorRT 10; la compilación del motor TensorRT en el primer uso añade tiempo de arranque.
- El servidor en vivo atiende una conversación a la vez, lo que limita el despliegue concurrente sin escalado adicional.
- Los prompts de voz deben crearse con clips de 3-10 s de un hablante sobre el que se tengan derechos.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Fun-Audio-Chat-8B y del códec CosyVoice3.
- El repositorio ocupa 56,6 GB, lo que exige espacio en disco considerable.

## Enlaces

- Hugging Face: https://huggingface.co/openmartdev/AwakenFullDuplex-FunAudioChat
- Página del proyecto: https://avera-labs.github.io/AwakenFullDuplex/
- Repositorio GitHub: https://github.com/avera-labs/AwakenFullDuplex
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-Audio-Chat-8B
- Códec de voz: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Detalles de entrenamiento: https://github.com/avera-labs/AwakenFullDuplex/blob/main/webpage/index.html
