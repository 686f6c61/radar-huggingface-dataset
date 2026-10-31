# ServiceNow-AI/Apriel-Voice-27B-preview

## Resumen

Apriel Voice 27B Preview es un modelo multimodal de audio y texto desarrollado por ServiceNow-AI, diseñado para construir asistentes de voz interactivos. El modelo entiende peticiones habladas, razona sobre el contexto conversacional y genera respuestas de texto y llamadas a herramientas (tool calls) que la aplicación puede ejecutar. No sintetiza voz de forma nativa: se empareja con un sintetizador externo para completar el bucle de voz.

Su arquitectura combina un codificador de voz Whisper large-v3-turbo conectado mediante un proyector aprendido a un backbone Gemma 4 26B-A4B, lo que da un total de aproximadamente 27.200 millones de parámetros. Conserva las capacidades de entrada de texto e imagen del backbone, por lo que una misma conversación puede mezclar audio, texto, imágenes y resultados de herramientas.

Es relevante porque alcanza resultados cercanos a sistemas propietarios de voz a voz (como GPT Realtime y Gemini Live) en benchmarks de asistentes de voz, con licencia MIT y pesos abiertos, lo que lo convierte en una de las opciones más competitivas para construir agentes de voz de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de voz Whisper large-v3-turbo + proyector aprendido + backbone Gemma 4 26B-A4B |
| Parámetros totales | 27.228.825.166 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el audio y el resto de la conversación comparten el presupuesto total de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Más de 50: en, fr, de, es, pt, nl, pl, it, ar, ja, zh, tr, hi, ko, ru, sv, da, cs, ro, hu, el, ca, nb, vi, th, fa, uk, bn, ta, ur, fi, bg, sr, sl, mk, et, lt, lv, ka, cy, gl, sw, mn, mr, ml, sk, be, br, oc |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un enfoque de dos etapas (two-stage): un codificador de voz Whisper large-v3-turbo procesa el audio de entrada y un proyector aprendido conecta sus representaciones con el backbone Gemma 4 26B-A4B, un modelo de razonamiento que también acepta texto e imágenes. El entrenamiento primero alinea la interfaz de voz con el backbone y después la adapta conjuntamente con este usando tareas de voz y replay de texto. La supervisión combina entropía cruzada y destilación de profesor, con pesos variables según la fuente de datos; la receta completa se describe en el informe técnico.

A diferencia de los sistemas nativos de voz a voz (S2S), el checkpoint genera texto y llamadas a herramientas, no audio. La interacción de voz en tiempo real depende de la aplicación y del stack de servido, que gestionan la síntesis y el turno de conversación (turn-taking). Para audio largo, el procesador divide automáticamente las grabaciones mono a 16 kHz en fragmentos de 30 segundos, con buen rendimiento observado en grabaciones continuas de hasta unos 30 minutos.

## Capacidades

- Comprensión de voz: transcripción, traducción de voz y respuesta a preguntas habladas (spoken question answering).
- Razonamiento e instrucciones: seguimiento de instrucciones, gestión de peticiones multi-paso y modo thinking (usado en las evaluaciones destacadas).
- Tool calling: generación de llamadas a herramientas estructuradas; la aplicación ejecuta las herramientas y devuelve los resultados a la conversación.
- Contexto multimodal: audio, texto, imágenes y resultados de herramientas en una conversación compartida.
- Multilingüe: soporte declarado para más de 50 idiomas, incluido el castellano.
- Audio largo: procesamiento automático de grabaciones de hasta unos 30 minutos con buen rendimiento (recomendado activar thinking mode para duraciones mayores).
- Integración con síntesis externa: las respuestas de texto se emparejan con un sintetizador de voz gestionado por la aplicación (en las evaluaciones se usó Cartesia Sonic 3.5).

## Casos de uso

- Atención al cliente por voz: el modelo transcribe la petición del usuario, razona sobre el historial conversacional y genera tool calls para consultar CRM, gestionar tickets o ejecutar reembolsos; su latencia media de 1,91 segundos en τ-Voice lo hace apto para diálogo en tiempo real.
- Agentes de voz con herramientas: en flujos tipo function calling, el modelo decide qué herramienta invocar a partir de la petición hablada y la aplicación devuelve el resultado al contexto compartido, permitiendo cadenas multi-paso.
- Transcripción y subtitulado de grabaciones largas: el procesador fragmenta automáticamente el audio en bloques de 30 segundos, con buen rendimiento hasta 30 minutos, útil para reuniones, podcasts o dictados.
- Traducción de voz: puede traducir contenido hablado entre los más de 50 idiomas soportados, útil en soporte multilingüe o reuniones internacionales.
- Asistentes interactivos con contexto multimodal: el usuario puede hablar, escribir o enviar imágenes en la misma conversación, por ejemplo mostrando una captura de error mientras lo describe de viva voz.
- Automatización de flujos con spoken tool use: integración en pipelines donde la voz es la interfaz (por ejemplo, operaciones de campo o logística), con el modelo generando llamadas estructuradas a APIs internas.

## Benchmarks y rendimiento

Resultados publicados para inglés (Apriel Voice usa thinking mode en estas evaluaciones):

| Sistema | Tipo | EVA-A ↑ | EVA-X ↑ | τ-Voice pass@1 ↑ | Latencia (s) ↓ |
|---|---|---:|---:|---:|---:|
| GPT Realtime 2.1 | S2S | 59,03 | 61,6 | 69,82 | 1,55 |
| Gemini-3.8 Live Extended Thinking | S2S | 54,82 | 73,5 | 84,19 | 1,50 |
| Flux + Gemma 4-26B | 3 etapas | 36,07 | 29,22 | 65,92 | 2,92 |
| Parakeet + Gemma 4-26B | 3 etapas | 39,97 | 3,93 | 67,78 | 3,01 |
| UltraVox v0.6 (Qwen) | 2 etapas | 8,94 | 1,91 | 26,80 | 3,95 |
| Gemma 4-12B-IT | 2 etapas | 13,25 | 5,97 | 24,20 | 3,61 |
| Audex-30B-A3B | 2 etapas | 5,66 | 8,2 | 17,15 | 2,83 |
| **Apriel Voice 27B Preview** | **2 etapas** | **51,27** | **74,13** | **65,51** | **1,91** |

Resultados adicionales publicados:

| Métrica | Valor |
|---|---|
| EVA-A (precisión de servicio) | 51,27% |
| EVA-X (experiencia conversacional) | 74,13% |
| τ-Voice task success (pass@1) | 65,51% |
| Latencia media τ-Voice | 1,91 s |
| LibriSpeech test-clean (WER) | 2,23% |
| LibriSpeech test-other (WER) | 5,15% |
| Media de 8 benchmarks de razonamiento de audio (BFCL, Big Bench Audio, IFEval, MT-Bench, Spoken SQuAD, Alpaca Audio, OpenHermes, GSM8K) | 85,84 |

La latencia describe el sistema de voz completo evaluado (generación de respuesta y síntesis con Cartesia Sonic 3.5) y depende de la configuración de despliegue.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 54,5 GB en safetensors (precisión completa), por lo que se necesitarían varias GPU de gama alta (por ejemplo, A100 u H100 de 80 GB) para servirlo sin cuantizar. Con cuantización (no publicada en la ficha) podría reducirse el requisito.
- GPU recomendadas: no disponible de forma explícita; los ejemplos de servido del repositorio incluyen configuraciones para audio de 30 minutos y opcionales para una hora, lo que sugiere hardware con memoria de GPU considerable.
- Consumer GPU: no disponible; con el peso completo de 54,5 GB no cabe en una única GPU de consumo (una RTX 4090 tiene 24 GB de VRAM).
- Opciones de despliegue: librería transformers (con custom_code); los ejemplos de servido del repositorio incluyen ajustes para audio largo. No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: latencia media de 1,91 s para el sistema completo (respuesta + síntesis) en las evaluaciones τ-Voice; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | EVA-A | EVA-X | τ-Voice pass@1 | Latencia (s) | Licencia |
|---|---|---|---:|---:|---:|---:|---|
| Apriel Voice 27B Preview | 2 etapas, open source | 27,2B | 51,27 | 74,13 | 65,51 | 1,91 | MIT |
| UltraVox v0.6 (Qwen) | 2 etapas, open source | no disponible | 8,94 | 1,91 | 26,80 | 3,95 | no disponible |
| Audex-30B-A3B | 2 etapas, open source | no disponible | 5,66 | 8,2 | 17,15 | 2,83 | no disponible |
| Parakeet + Gemma 4-26B | 3 etapas, open source | no disponible | 39,97 | 3,93 | 67,78 | 3,01 | no disponible |
| GPT Realtime 2.1 (referencia propietaria) | S2S | no disponible | 59,03 | 61,6 | 69,82 | 1,55 | propietaria |

Entre los sistemas de código abierto evaluados, Apriel Voice lidera claramente en EVA-A y EVA-X, y queda cerca de los sistemas propietarios de voz a voz en precisión de servicio y latencia, aunque por detrás de Gemini-3.8 Live en éxito de tareas y experiencia conversacional.

## Limitaciones y advertencias

- No genera voz de forma nativa: requiere un sintetizador externo y lógica de aplicación para el turno de conversación; el checkpoint solo produce texto y tool calls.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; como todo modelo de lenguaje, puede generar respuestas incorrectas, y en aplicaciones de voz esto se agrava por errores de transcripción (WER de 5,15% en LibriSpeech test-other).
- Idiomas: los resultados publicados son para inglés; el rendimiento en los más de 50 idiomas listados no está cuantificado en la información disponible.
- Audio largo: el rendimiento puede degradarse en grabaciones de más de 30 minutos; se recomienda thinking mode para audio extenso.
- Contexto: el audio consume el mismo presupuesto de contexto que el resto de la conversación, y la longitud práctica de entrada depende de la memoria de GPU y la caché del codificador.
- Es una versión preview: el comportamiento y las specs pueden cambiar en la versión final.
- Licencia MIT: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ServiceNow-AI/Apriel-Voice-27B-preview
- Demo Apriel Live: https://servicenow-ai-apriel.hf.space/home
- Blog de anuncio: https://servicenow-ai-apriel.hf.space/blog/apriel-voice-preview
- Informe técnico: https://servicenow-ai-apriel.hf.space/documents/apriel-voice-preview-tech-report
