# sakasegawa/Haru-4B-GGUF

## Resumen

Haru-4B es un modelo de audio-a-audio full-duplex desarrollado por higurashi-ai, distribuido en este repositorio como cuantizaciones GGUF por el usuario sakasegawa. El modelo mantiene una conversación hablada escuchando y hablando simultáneamente: cada 133 ms procesa una trama de audio de entrada y emite una trama de audio de salida junto con el texto que empieza a pronunciar. Integra en un único archivo un modelo de lenguaje Qwen3.5, una cabeza MeanFlow para la generación de audio y el códec acústico VibeVoice.

La versión aquí publicada contiene 5.270.006.017 parámetros reales (según safetensors del modelo base) y está pensada exclusivamente para ejecutarse con speech.cpp 0.11.0 o superior. El formato GGUF empleado es propio de speech.cpp, por lo que llama.cpp, LM Studio, Ollama y otros lectores GGUF convencionales no pueden ejecutarlo. El repositorio ocupa 32,4 GB e incluye cuantizaciones desde F16 hasta Q4_K.

Se trata de un modelo base preentrenado liberado para investigación: mantiene conversaciones naturales, pero no es una fuente fiable de hechos, no sigue instrucciones como un asistente y es frágil. Soporta nueve idiomas (de, en, es, fr, ja, ko, pt, ru, zh) y se distribuye bajo licencia Apache 2.0, con el códec VibeVoice bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLM Qwen3.5) + cabeza MeanFlow + códec VibeVoice; audio-a-audio full-duplex |
| Parametros totales | 5.270.006.017 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K, Q4_K (el LLM y su embedding; cabeza MeanFlow, proyecciones de audio y códec permanecen en F16) |
| Idiomas soportados | de, en, es, fr, ja, ko, pt, ru, zh |
| Licencia | Apache 2.0 (modelo); MIT (tokenizador acústico VibeVoice) |
| Formato de pesos | GGUF (layout propio de speech.cpp) |

## Arquitectura y entrenamiento

Haru-4B combina un modelo de lenguaje Qwen3.5 con una cabeza de generación de audio MeanFlow y el códec acústico VibeVoice, todo empaquetado en un único archivo GGUF. El modelo opera en modo full-duplex: cada 133 ms recibe una trama de audio y emite una trama propia junto con el texto correspondiente, lo que permite escuchar y hablar de forma simultánea. La cuantización afecta al LLM y a su embedding, mientras que la cabeza MeanFlow, las proyecciones de audio y el códec se mantienen en F16; las normas, sesgos, escalas del códec, kernels depthwise, filas de los dos tokens silenciosos y las proyecciones de decaimiento y fuerza de escritura del Gated DeltaNet se guardan en F32.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que es un modelo base preentrenado para investigación, no ajustado como asistente. La verificación de precisión se realizó contra el código oficial en el commit 7fe6b76, comparando dos conversaciones en float32: en un Apple M5, cada capa del LLM queda a 109,6 dB del oficial en CPU y 63,5 dB en Metal (igual que en una RTX 2080 con Vulkan), y el códec entre 90,9 y 136,5 dB en CPU y 47,6 a 90,8 dB en Metal. Una conversación completa reproducida devuelve el texto oficial en cada trama.

## Capacidades

- Conversación hablada full-duplex: escucha y habla simultáneamente con tramas de 133 ms.
- Generación de audio a audio con texto asociado por trama.
- Síntesis de voz con capacidad de imitar la voz de una grabación (clonación de voz).
- Soporte multilingüe en nueve idiomas: alemán, inglés, español, francés, japonés, coreano, portugués, ruso y chino.
- Tarjeta de personaje configurable: nombre, persona, género (female/male), backchannel (low/mid/high), nombre del interlocutor, relación y situación.
- Gestión de voces personalizadas mediante grabaciones de al menos 3 segundos (se conservan los últimos 3 minutos).
- Interfaz de conversación mediante C API (`speech_dialogue_start()`), worker de speech.cpp o WebSocket `/v1/dialogue` de `speech serve`.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso documentadas.
- No se documentan capacidades de razonamiento, código, matemáticas ni visión.

## Casos de uso

- Conversación por voz en tiempo real: el modelo mantiene un diálogo hablado natural con latencia de trama de 133 ms, adecuado para prototipos de asistentes conversacionales full-duplex donde la simultaneidad de escucha y habla es crítica.
- Investigación en interacción hablada: sirve como base para estudiar turnos solapados, backchannels y dinámica conversacional gracias a su naturaleza full-duplex y a los parámetros de backchannel configurables.
- Clonación de voz para doblaje o locución: permite generar respuestas con la voz de una grabación de referencia de al menos 3 segundos, útil en prototipos de síntesis personalizada (solo con voces sobre las que se tenga derecho de uso).
- Personajes interactivos y experiencias de rol: la tarjeta de personaje (nombre, persona, género, relación, situación) permite definir un personaje concreto para instalaciones interactivas, demos o investigación en HCI.
- Evaluación comparativa de cuantizaciones en audio: los archivos F16 a Q4_K permiten medir el impacto de la cuantización en la calidad del habla y del texto generado, con métricas de fidelidad publicadas por el autor.
- Despliegue local de investigación: mediante `speech serve` se puede exponer un endpoint WebSocket `/v1/dialogue` para integrar el modelo en pipelines de investigación sin depender de la nube.
- Reproducción de conversaciones grabadas: con `speech talk haru-4b --add-voice me=me.wav --voice me -o reply.wav question.wav` se puede procesar un archivo de audio de entrada y generar una respuesta hablada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de fidelidad numérica frente al modelo oficial en float32:

| Tipo | Hidden state | Decisión de hablar | Latente de audio |
|---|---|---|---|
| F16 | 66,5 dB | 74,8 dB | 57,4 dB |
| Q8_0 | 40,1 dB | 40,7 dB | 28,0 dB |
| Q6_K | 26,7 dB | 17,3 dB | 17,7 dB |
| Q5_K | 9,0 dB | -4,0 dB | 9,0 dB |
| Q4_K | 7,4 dB | -3,6 dB | 2,7 dB |
| MLX oficial float32 | 65,9 dB | 77,7 dB | 54,8 dB |
| MLX oficial bfloat16 | 41,4 dB | 53,4 dB | 29,9 dB |
| MLX oficial 8-bit | 33,2 dB | 22,5 dB | 23,2 dB |

Medido en Apple M5 con Metal en la primera trama de una conversación. F16 se aproxima tanto como el código oficial en float32; Q8_0 queda entre el 8-bit y el bfloat16 oficiales; Q6_K y siguientes se alejan más que el 8-bit oficial; Q4_K rompe el texto en secuencias de puntuación y caracteres sueltos.

## Requisitos de hardware

- VRAM estimada según archivo: F16 10,56 GB; Q8_0 6,62 GB; Q6_K 5,61 GB; Q5_K 5,05 GB; Q4_K 4,52 GB (más overhead de contexto y del códec en F16).
- GPU recomendadas: no se especifican modelos concretos; el autor reporta mediciones en Apple M5 (CPU y Metal) y RTX 2080 (Vulkan).
- Compatibilidad con GPU de consumo: los archivos Q5_K y Q4_K (en torno a 4,5-5 GB) son los más viables en GPUs de consumo con 8 GB o más; F16 requiere al menos 12 GB.
- Opciones de despliegue: exclusivamente speech.cpp 0.11.0 o superior (comandos `speech talk`, `speech serve`, C API). No compatible con llama.cpp, LM Studio, Ollama ni otros lectores GGUF.
- Latencia: trama de 133 ms por paso de audio (escucha y habla simultáneas). Throughput y latencia agregada no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full-duplex | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Haru-4B (este repo) | 5,27 B | no disponible | Sí | 9 | Apache 2.0 | GGUF (speech.cpp) |
| Modelos audio-a-audio full-duplex comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: no es una fuente fiable de hechos y no sigue instrucciones como un asistente.
- El autor advierte que el modelo "se rompe con facilidad" (breaks easily); no es apto para producción sin validación adicional.
- Riesgo de alucinación elevado por su naturaleza de modelo base no alineado.
- La clonación de voz solo debe usarse con voces sobre las que se tenga derecho; riesgo de uso indebido.
- Q4_K degrada gravemente la salida de texto (puntuación y caracteres sueltos); Q5_K y Q6_K ya se alejan del 8-bit oficial.
- El formato GGUF es propio de speech.cpp: no funciona en llama.cpp, LM Studio, Ollama ni otros lectores GGUF.
- No se documentan sesgos específicos ni limitaciones de longitud de contexto.
- Licencia Apache 2.0 permite uso comercial del modelo, pero el tokenizador VibeVoice está bajo MIT y el uso de voces clonadas requiere derechos sobre las grabaciones.
- No dispone de tool calling, agentes ni razonamiento verificable; no debe emplearse como asistente factual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/Haru-4B-GGUF
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Instalación de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentación del modelo en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/haru.md
- Documentación de la línea de comandos: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md
