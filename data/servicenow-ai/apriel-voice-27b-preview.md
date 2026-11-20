# ServiceNow-AI/Apriel-Voice-27B-preview

## Resumen

Apriel Voice 27B Preview es un modelo abierto de comprensión de voz, razonamiento y uso de herramientas desarrollado por ServiceNow. Combina un codificador de voz Whisper large-v3-turbo con el backbone de razonamiento Gemma 4 26B-A4B (un modelo MoE con 26 000 millones de parámetros totales y 4 000 millones activos), conectados mediante un proyector aprendido. El resultado es un sistema de dos etapas que entiende peticiones habladas, razona sobre el contexto conversacional y genera respuestas de texto y llamadas a herramientas, manteniendo además capacidad de entrada de texto e imagen.

El modelo resuelve el problema de construir asistentes de voz interactivos, flujos de atención al cliente y uso hablado de herramientas sin depender de pipelines de tres etapas (ASR + LLM + TTS). Al integrar la interfaz de voz directamente en el backbone, reduce la latencia y preserva el contexto multimodal (audio, texto, imágenes y resultados de herramientas) en una misma conversación. La síntesis de voz se delega a un sintetizador externo y la gestión de turnos queda en manos de la aplicación.

Con 27 228 825 166 parámetros totales (según safetensors), licencia MIT y soporte para 49 idiomas, el checkpoint es relevante ahora porque ofrece una alternativa abierta a sistemas propietarios de voz a voz como GPT Realtime o Gemini Live, con resultados competitivos en benchmarks de voz (51,27 % en EVA-A, 74,13 % en EVA-X y 65,51 % de éxito en τ-Voice) y una latencia media de 1,91 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de voz Whisper large-v3-turbo + proyector aprendido + backbone Gemma 4 26B-A4B (MoE transformer) |
| Parametros totales | 27 228 825 166 |
| Parametros activos | 4 000 millones (backbone Gemma 4 26B-A4B) |
| Longitud de contexto | No disponible de forma explícita; el procesador divide audio de 16 kHz mono en fragmentos de 30 segundos y el audio comparte el presupuesto total de contexto con el resto de la conversación. Se observó buen rendimiento hasta ~30 minutos de audio continuo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 49: en, fr, de, es, pt, nl, pl, it, ar, ja, zh, tr, hi, ko, ru, sv, da, cs, ro, hu, el, ca, nb, vi, th, fa, uk, bn, ta, ur, fi, bg, sr, sl, mk, et, lt, lv, ka, cy, gl, sw, mn, mr, ml, sk, be, br, oc |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. Un codificador de voz Whisper large-v3-turbo extrae representaciones del audio, que un proyector aprendido traduce al espacio del backbone Gemma 4 26B-A4B, un transformer con mezcla de expertos (MoE) de 26 000 millones de parámetros totales y 4 000 millones activos. El backbone conserva las capacidades de entrada de texto e imagen de Gemma 4, por lo que la conversación puede mezclar audio, texto, imágenes y resultados de herramientas.

El entrenamiento se realizó en dos fases: primero se alinea la interfaz de voz (codificador + proyector) y después se adapta conjuntamente con el backbone usando tareas de voz y *text replay*. La supervisión combina entropía cruzada y destilación de profesor según la fuente de datos. El informe técnico describe la receta completa. El checkpoint genera texto y llamadas a herramientas, no voz de forma nativa: la interacción de voz en tiempo real depende de la aplicación y del stack de serving, que aporta la síntesis y la gestión de turnos.

## Capacidades

- Comprensión de voz: transcripción, traducción de habla y respuesta a preguntas habladas.
- Razonamiento e instrucciones: seguimiento de instrucciones, peticiones de varios pasos y generación de llamadas a herramientas estructuradas.
- Contexto multimodal: audio, texto, imágenes y resultados de herramientas en una misma conversación.
- Tool calling / function calling: el modelo emite llamadas estructuradas; la aplicación ejecuta las herramientas y devuelve los resultados a la conversación.
- Razonamiento multi-paso y uso en agentes, con modo *thinking* recomendado para audio largo.
- Capacidades multilingües en 49 idiomas, incluyendo transcripción y traducción entre ellos.
- Aplicaciones de voz: respuestas de texto pensadas para emparejarse con síntesis externa y gestión de turnos por parte de la aplicación.
- Audio largo: el procesador trocea grabaciones de 16 kHz mono en bloques de 30 segundos; se observó buen rendimiento hasta ~30 minutos continuos, con degradación progresiva en duraciones mayores.

## Casos de uso

- Atención al cliente automatizada por voz: el modelo transcribe la petición del usuario, razona sobre el historial conversacional y genera la respuesta o la llamada a la herramienta adecuada (consulta de pedido, cambio de dirección), con la síntesis delegada a un TTS externo como Cartesia Sonic 3.5.
- Asistentes de voz para uso hablado de herramientas: integración en aplicaciones donde el usuario dicta una orden y el modelo emite una llamada estructurada que la aplicación ejecuta, devolviendo el resultado al hilo conversacional.
- Transcripción y traducción de reuniones: procesa audio de hasta ~30 minutos por bloque y permite traducción de habla entre los 49 idiomas soportados, útil para actas y subtitulado.
- Respuesta a preguntas sobre documentos con audio: combinación de entrada de imagen (capturas, diapositivas) y voz en una misma conversación para consultas sobre material visual.
- Agentes multi-paso con entrada de voz: el modelo sigue instrucciones de varios pasos y encadena llamadas a herramientas, adecuado para flujos de soporte técnico guiados por voz.
- Evaluación de experiencia conversacional: su rendimiento en EVA-X (74,13 %) lo hace apto para prototipos de asistentes donde importa la calidad del diálogo, no solo la precisión de la tarea.
- Accesibilidad: dictado y control por voz de aplicaciones con razonamiento sobre el contexto previo, usando el modo *thinking* para grabaciones largas.

## Benchmarks y rendimiento

Resultados en inglés publicados en la model card. EVA-A, EVA-X y τ-Voice pass@1 usan escala 0–100 (mayor es mejor); la latencia es en segundos (menor es mejor). Apriel Voice usa modo *thinking* en estas evaluaciones.

| Sistema | Tipo | Fuente | EVA-A ↑ | EVA-X ↑ | τ-Voice pass@1 ↑ | Latencia (s) ↓ |
|---|---|---|---:|---:|---:|---:|
| GPT Realtime 2.1 | S2S | Propietario | 59,03 | 61,6 | 69,82 | 1,55 |
| Gemini-3.8 Live Extended Thinking | S2S | Propietario | 54,82 | 73,5 | 84,19 | 1,50 |
| Flux + Gemma 4-26B | 3 etapas | Mixto | 36,07 | 29,22 | 65,92 | 2,92 |
| Parakeet + Gemma 4-26B | 3 etapas | Open source | 39,97 | 3,93 | 67,78 | 3,01 |
| UltraVox v0.6 (Qwen) | 2 etapas | Open source | 8,94 | 1,91 | 26,80 | 3,95 |
| Gemma 4-12B-IT | 2 etapas | Open source | 13,25 | 5,97 | 24,20 | 3,61 |
| Audex-30B-A3B | 2 etapas | Open source | 5,66 | 8,2 | 17,15 | 2,83 |
| **Apriel Voice 27B Preview** | **2 etapas** | **Open source** | **51,27** | **74,13** | **65,51** | **1,91** |

Otros resultados:

| Benchmark | Resultado |
|---|---|
| LibriSpeech test-clean (WER) | 2,23 % |
| LibriSpeech test-other (WER) | 5,15 % |
| Media de ocho benchmarks de razonamiento de audio (BFCL, Big Bench Audio, IFEval, MT-Bench, Spoken SQuAD, Alpaca Audio, OpenHermes, GSM8K) | 85,84 |

Notas metodológicas: EVA-A mide precisión de servicio y EVA-X experiencia conversacional; los resultados principales usan medias por dominio equitativas, no ponderadas por número de casos. Todos los sistemas de dos y tres etapas evaluados usan Cartesia Sonic 3.5 para la síntesis. La latencia describe el sistema de voz completo, incluida generación y síntesis, y depende del despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 27 228 825 166 parámetros en safetensors, los pesos en precisión completa ocupan aproximadamente 54,5 GB (tamaño del repo); la inferencia en fp16 requeriría del orden de 54 GB solo para pesos, más caché del codificador y KV cache.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, un despliegue en fp16 encaja en GPUs de 80 GB (A100, H100) o en configuraciones multi-GPU; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible. El tamaño de los pesos hace improbable su ejecución en fp16 en GPUs de consumo; no se documentan cuantizaciones que lo permitan.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`). Los ejemplos de serving de la model card incluyen ajustes para audio de 30 minutos y opcionalmente de una hora, ligados a memoria de GPU y caché del codificador. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media de 1,91 s en τ-Voice para el sistema completo evaluado (incluye síntesis con Cartesia Sonic 3.5 y depende del despliegue). No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EVA-A | EVA-X | τ-Voice pass@1 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Apriel Voice 27B Preview | 27,2 B totales / 4 B activos | No disponible (audio en bloques de 30 s) | 51,27 | 74,13 | 65,51 | MIT | Pesos abiertos en Hugging Face |
| GPT Realtime 2.1 | No disponible | No disponible | 59,03 | 61,6 | 69,82 | Propietaria | Solo API |
| Gemini-3.8 Live Extended Thinking | No disponible | No disponible | 54,82 | 73,5 | 84,19 | Propietaria | Solo API |
| Parakeet + Gemma 4-26B | No disponible (3 etapas) | No disponible | 39,97 | 3,93 | 67,78 | Open source (componentes) | Pipeline de tres etapas |
| UltraVox v0.6 (Qwen) | No disponible (2 etapas) | No disponible | 8,94 | 1,91 | 26,80 | Open source | Pesos abiertos |

Apriel Voice destaca frente a los sistemas abiertos de dos y tres etapas en EVA-A y EVA-X, y se acerca a los sistemas propietarios S2S en precisión de servicio, aunque queda por debajo en τ-Voice pass@1 frente a Gemini-3.8 Live. Su ventaja principal es la combinación de pesos abiertos con licencia MIT y latencia competitiva (1,91 s).

## Limitaciones y advertencias

- El checkpoint genera texto y llamadas a herramientas, no voz: la interacción de voz en tiempo real requiere un sintetizador externo y gestión de turnos por parte de la aplicación.
- Rendimiento decreciente en audio largo: aunque se soportan grabaciones de más de 30 minutos, la calidad puede bajar a medida que crece la duración; se recomienda modo *thinking* para audio largo.
- El audio comparte el presupuesto de contexto con el resto de la conversación, y la longitud práctica de entrada depende de la memoria de GPU y de la caché del codificador.
- Riesgo de alucinación inherente a los modelos de lenguaje y a la transcripción de audio con ruido; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los componentes subyacentes (Whisper large-v3-turbo y Gemma 4) antes de producción.
- Es una versión *preview*: la API, el comportamiento y los artefactos pueden cambiar.
- No se documentan tipos de cuantización ni soporte confirmado en frameworks de serving de alto rendimiento (vLLM, TGI, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/ServiceNow-AI/Apriel-Voice-27B-preview
- Demo (Apriel Live): https://servicenow-ai-apriel.hf.space/home
- Blog: https://servicenow-ai-apriel.hf.space/blog/apriel-voice-preview
- Informe técnico: https://servicenow-ai-apriel.hf.space/documents/apriel-voice-preview-tech-report
- arXiv: arxiv:2610.40738
