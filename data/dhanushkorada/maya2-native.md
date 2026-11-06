# DhanushKorada/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) multilingüe de pesos abiertos desarrollado por Maya Research (publicado en Hugging Face por el usuario DhanushKorada). Genera audio a 24 kHz en mono para 11 lenguas de la India y el inglés, con soporte de streaming en tramas de 80 ms, 20 voces integradas y clonación de voz zero-shot, incluyendo síntesis cruzada entre idiomas. Está publicado bajo licencia Apache-2.0 y su checkpoint 1.0 se publicó el 25 de octubre de 2026.

El modelo parte de Qwen/Qwen3-1.7B-Base como modelo base y suma hasta 2.502.398.656 parámetros totales según los pesos en safetensors (aproximadamente 5,0 GB en BF16). La arquitectura concreta del decodificador de audio no se detalla en la información disponible; la model card menciona la etiqueta "mimi" y un motor de inferencia propio con API en Python, endpoint compatible con OpenAI y streaming por WebSocket.

Su relevancia actual radica en que cubre un hueco poco atendido: TTS de calidad para lenguas indias (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) con despliegue autoalojado, clonación de voz y latencia apta para agentes conversacionales. En el leaderboard VoiceArena de hindi (vista solo de modelos en tiempo real) aparece en segunda posición con Elo 1047 ±11 sobre 2268 muestras, consultado el 3 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3-1.7B-Base; etiqueta "mimi" en la model card) |
| Parámetros totales | 2.502.398.656 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16, ~5,0 GB) |
| Idiomas soportados | asamés (as), bengalí (bn), inglés (en), guyaratí (gu), hindi (hi), canarés (kn), malabar (ml), maratí (mr), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 (con licencias de componentes adicionales; ver sección de licencia en la model card) |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Frecuencia de muestreo | 24 kHz, mono |
| Streaming | tramas de audio de 80 ms |
| Voces integradas | 20 |
| Clonación de voz | zero-shot y cruzada entre idiomas |
| Interfaz de inferencia | Python, endpoint compatible con OpenAI, WebSocket |
| Fecha del checkpoint | 1.0, 25 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura del decodificador de audio ni el esquema completo de entrenamiento. Se sabe que el modelo parte de Qwen/Qwen3-1.7B-Base, un transformer de 1,7B parámetros, y que el checkpoint final tiene 2.502.398.656 parámetros, lo que implica componentes adicionales sobre ese backbone (probablemente un decodificador acústico y un codificador de voz para la clonación zero-shot). La etiqueta "mimi" sugiere el uso del códec neural Mimi, pero este extremo no se confirma explícitamente en la model card.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Sí se documentan innovaciones de producto e inferencia: streaming en tramas de 80 ms, batching continuo, normalización de texto (números, fechas, moneda y otras formas escritas) y un protocolo WebSocket local con contextos de petición separados y cancelación. La clonación de voz es zero-shot y funciona de forma cruzada entre idiomas, con calidad de acento e identidad variable según la combinación lengua-voz.

## Capacidades

- Síntesis de voz multilingüe en 12 idiomas: asamés, bengalí, inglés, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu.
- Generación de audio a 24 kHz en mono.
- Streaming de audio en tramas de 80 ms, con reproducción que puede iniciarse antes de terminar la generación.
- 20 voces integradas seleccionables por API.
- Clonación de voz zero-shot a partir de una voz de referencia permitida.
- Clonación y síntesis cruzada entre idiomas: una misma identidad de voz puede usarse en distintas lenguas.
- Normalización de texto para números, fechas, moneda y otras formas escritas antes de la síntesis.
- API en Python, endpoint HTTP compatible con OpenAI para speech y streaming por WebSocket.
- Batching continuo en el motor de inferencia para servir varias peticiones concurrentes.
- Protocolo WebSocket con contextos de petición separados y cancelación de peticiones en curso.
- Integración como etapa de salida de voz en pipelines de agentes conversacionales.

## Casos de uso

- Agentes de voz conversacionales en lenguas indias: el modelo se sitúa como etapa de síntesis después del LLM y permite iniciar la reproducción con las primeras tramas de 80 ms mientras el resto del audio se sigue generando, lo que reduce el tiempo hasta el primer audio en diálogos multi-turno.
- Sistemas IVR y atención telefónica automatizada: con 12 idiomas y 20 voces integradas, un mismo despliegue puede atender llamadas en hindi, tamil, telugu o bengalí sin mantener un modelo por idioma; el endpoint compatible con OpenAI facilita integrarlo en plataformas de telefonía existentes.
- Narración y doblaje de contenido multilingüe: la clonación de voz cruzada entre idiomas permite mantener una identidad de voz consistente al doblar un mismo locutor a varias lenguas indias, útil para cursos, audiolibros y vídeos formativos.
- Herramientas de accesibilidad: lectura en voz alta de contenido web o de aplicaciones para usuarios de lenguas indias con baja representación en TTS comerciales, con normalización de números, fechas y moneda para que la lectura sea natural.
- Asistentes de voz autoalojados en entornos con requisitos de soberanía del dato: al publicarse los pesos en Apache-2.0 y ejecutarse en GPU NVIDIA propias, permite sintetizar voz sin enviar texto ni referencias de voz a servicios externos.
- Generación de voces para prototipado de productos: el endpoint compatible con OpenAI y la API de Python permiten sustituir un proveedor de TTS comercial por este modelo en fases de desarrollo sin reescribir la capa de integración.
- Síntesis en streaming para kioscos y dispositivos interactivos: el WebSocket con cancelación permite interrumpir una respuesta hablada cuando el usuario vuelve a hablar, patrón habitual en agentes de voz en tiempo real.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al leaderboard VoiceArena de hindi, en la vista filtrada a modelos en tiempo real, consultado el 3 de noviembre de 2026:

| Puesto | Creador | Modelo | Elo Bradley-Terry | IC 95% | Muestras |
|---|---|---|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1289 |
| 2 (intervalo 2-4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2268 |
| 3 (intervalo 2-5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1802 |
| 4 (intervalo 2-5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1870 |
| 5 (intervalo 3-5) | Murf AI | Falcon 2 | 1021 | ±14 | 1352 |
| 6 (intervalo 6-7) | Cartesia | Sonic-3 | 961 | ±9 | 4256 |
| 7 (intervalo 6-7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3611 |

La propia model card advierte de que la vista con todos los modelos del leaderboard de hindi sitúa a Maya-2-Native en el puesto 7 con intervalo 5-10 en la misma fecha, y que el puesto 2 corresponde específicamente a la vista solo de modelos en tiempo real. También señala que VoiceArena data la entrada en julio de 2026 y no identifica una revisión exacta del checkpoint. No se han publicado en la información disponible resultados de benchmarks objetivos como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS, ni métricas de error de síntesis (WER, MOS, SIM) más allá de las valoraciones comparativas de VoiceArena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en BF16 ocupan aproximadamente 5,0 GB, por lo que la inferencia en BF16 requiere algo más de esa cifra para pesos, más memoria para el códec de audio, el codificador de referencia de voz y los estados de activación; el valor exacto no se especifica.
- GPU recomendadas: no se indican modelos concretos en la información disponible. La model card menciona ejecución en GPU NVIDIA propias sin detallar gamas.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos (unos 5,0 GB en BF16) sería plausible en GPUs de consumo con 8 GB o más de VRAM, pero este dato no está verificado en la documentación disponible.
- Opciones de despliegue: motor de inferencia propio del proyecto con API de Python, endpoint HTTP compatible con OpenAI y WebSocket; el código está en el repositorio de GitHub enlazado en la model card. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia ni de throughput. El diseño de streaming en tramas de 80 ms y el batching continuo están orientados a reducir el tiempo hasta el primer audio en producción, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Desarrollador | Idiomas indios | Streaming | Clonación de voz | Licencia | Elo hindi (tiempo real) |
|---|---|---|---|---|---|---|
| Maya-2-Native | Maya Research | 11 lenguas indias + inglés | Sí, tramas de 80 ms | Zero-shot y cruzada | Apache-2.0 | 1047 ±11 |
| Sonic-3.6 | Cartesia | no disponible en la información | no disponible | no disponible | propietaria | 1094 ±13 |
| Bulbul-V3 | Sarvam AI | no disponible en la información | no disponible | no disponible | propietaria | 957 ±9 |
| Lightning 3.1 Pro | Smallest AI | no disponible en la información | no disponible | no disponible | propietaria | 1024 ±12 |

La comparación se limita a los datos del leaderboard VoiceArena de hindi incluidos en la model card. No se dispone de información sobre parámetros, contexto, licencia de pesos ni opciones de autoalojamiento de los modelos competidores, por lo que la comparativa técnica completa no está disponible.

## Limitaciones y advertencias

- La calidad de acento e identidad de voz varía según la combinación de lengua y voz; la model card remite a una tabla de cobertura de voces para elegir combinaciones adecuadas.
- No se documentan sesgos específicos del modelo. Al ser un TTS entrenado sobre datos de voz, es esperable que reproduzca sesgos de acento, género y registro presentes en esos datos, pero no hay un análisis publicado en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica, pero sí riesgo de pronunciación incorrecta, prosodia inadecuada o normalización errónea de números, fechas y moneda en textos ambiguos.
- No se especifica la longitud máxima de texto por petición ni el límite de contexto del modelo base; conviene trocear entradas largas en producción.
- La clonación de voz exige usar referencias permitidas; no se detalla el mecanismo de consentimiento ni las restricciones de uso de voces de terceros más allá de la licencia Apache-2.0.
- La licencia Apache-2.0 aplica al modelo, pero la model card remite a una sección de licencias de componentes que puede imponer condiciones adicionales sobre dependencias (códec, codificador de voz, etc.).
- El resultado del puesto 2 en VoiceArena está acotado a la vista solo de modelos en tiempo real y a la fecha de consulta; en la vista completa el modelo aparece en el puesto 7. Los intervalos de confianza se solapan con los de varios competidores, por lo que las diferencias cercanas no deben considerarse significativas.
- El paquete, la clase Python y el fichero de configuración conservan el nombre `maya3` (`Maya3TTS`, `maya3_config.json`), lo que puede confundir en integraciones y scripts.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhanushKorada/maya2-native
- Repositorio de código de inferencia: https://github.com/MayaResearch/maya2-native
- Leaderboard VoiceArena de hindi: https://voicearena.com/tts-leaderboard/hindi
- Metodología de VoiceArena: https://voicearena.com/tts-methodology
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo en Google Drive: https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
