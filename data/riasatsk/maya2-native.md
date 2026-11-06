# riasatsk/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) desarrollado por Maya Research, diseñado específicamente para 11 lenguas indias y el inglés. Se distribuye con pesos abiertos y código de inferencia bajo licencia Apache-2.0, lo que lo convierte en una de las pocas alternativas realmente permisivas para TTS multilingüe en el ecosistema índico. El modelo parte de Qwen/Qwen3-1.7B-Base como backbone y añade componentes de audio para generar voz a 24 kHz en mono, con streaming en tramas de 80 ms.

La propuesta central es la generación de voz en streaming con 20 voces integradas y clonación de voz zero-shot a partir de 3-10 segundos de audio de referencia, incluyendo clonación cruzada entre idiomas (por ejemplo, una referencia en hindi puede producir habla en tamil). El checkpoint 1.0 se publicó el 25 de octubre de 2026 y el repositorio ocupa 5,1 GB en BF16, con 2.502.398.656 parámetros totales según los safetensors.

Su relevancia actual radica en que cubre un hueco poco atendido: TTS de calidad para lenguas índicas con licencia permisiva, interfaces compatibles con OpenAI y WebSocket, y soporte de batching continuo con CUDA graphs para generación concurrente. En el leaderboard VoiceArena de hindi (categoría All, solo modelos en tiempo real) aparece en segunda posición con Elo 1047 ±11, por detrás de Cartesia Sonic-3.6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone Qwen/Qwen3-1.7B-Base con componentes de audio; tags indican "mimi") |
| Parametros totales | 2.502.398.656 (2,50B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (11 lenguas indias + inglés) |
| Licencia | Apache-2.0 (con licencias de componentes; ver sección de licencia en la model card) |
| Formato de pesos | safetensors (BF16, ~5,0 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo se construye sobre Qwen/Qwen3-1.7B-Base y que emplea componentes de audio etiquetados como "mimi" (probablemente un codec neural de audio). El pipeline declarado es text-to-speech y el modelo genera audio a 24 kHz mono con streaming en tramas de 80 ms. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

Sí se documentan innovaciones a nivel de sistema: decodificación en streaming por tramas de 80 ms, batching continuo y CUDA graphs para generación concurrente, además de interfaces Python, endpoint de voz compatible con OpenAI y streaming por WebSocket. La clonación de voz es zero-shot y cruzada entre idiomas, lo que sugiere un encoder de hablante independiente del idioma. No hay información pública sobre la arquitectura del decoder acústico ni sobre el vocabulario de tokens de audio.

## Capacidades

- Síntesis de voz en 11 lenguas indias (asamés, bengalí, gujarati, hindi, kannada, malayalam, maratí, odia, panyabí, tamil, telugu) e inglés.
- 20 voces integradas listas para usar sin referencia de audio.
- Clonación de voz zero-shot a partir de 3-10 segundos de audio de referencia.
- Clonación cruzada entre idiomas: una referencia en un idioma puede generar habla en otro.
- Generación en streaming con tramas de audio de 80 ms, adecuada para agentes conversacionales en tiempo real.
- Salida de audio a 24 kHz mono.
- Interfaces de despliegue: API Python, endpoint de voz compatible con OpenAI y streaming por WebSocket.
- Batching continuo y CUDA graphs para servir múltiples peticiones concurrentes.
- Normalización de texto integrada (los ejemplos del benchmark se generaron con normalización activada).

## Casos de uso

- Agentes de voz en atención al cliente: el modelo puede generar respuestas habladas en hindi, tamil o telugu con latencia de streaming de 80 ms por trama, lo que permite integrarlo en bucles de conversación por turnos con WebSocket y batching continuo para múltiples usuarios simultáneos.
- Lectura de contenidos y accesibilidad: conversión de artículos, notificaciones o documentos a voz en la lengua materna del usuario, usando las 20 voces integradas para mantener una identidad de marca consistente.
- Interfaces de voz multilingües autoalojadas: despliegue en infraestructura propia mediante el endpoint compatible con OpenAI, sin depender de APIs externas, útil para organizaciones con requisitos de soberanía de datos.
- Doblaje y localización de contenido: clonación cruzada de voz para que un mismo locutor suene en varias lenguas índicas, reduciendo el coste de producir versiones dobladas de vídeos o cursos.
- Asistentes telefónicos y IVR: generación de mensajes y menús interactivos en lenguas regionales con normalización de texto para números, fechas y direcciones, como muestra el ejemplo de hindi con una dirección postal.
- Prototipado de productos de voz para el mercado índico: al ser Apache-2.0, permite experimentar y validar hipótesis de producto sin negociar licencias comerciales, con pesos en safetensors y API Python.
- Investigación en TTS multilingüe: base reproducible para estudiar transferencia entre lenguas índicas, clonación zero-shot y evaluación con ASR (el benchmark usa tres jueces ASR y mide character error rate).

## Benchmarks y rendimiento

Resultados publicados en la model card (VoiceArena, leaderboard de hindi, filtro All, solo tiempo real, consultado el 27 de octubre de 2026):

| Puesto | Creador | Modelo | Elo Bradley-Terry | IC 95% | Muestras |
|---|---|---|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1.289 |
| 2 (2-4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2.268 |
| 3 (2-5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1.802 |
| 4 (2-5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1.870 |
| 5 (3-5) | Murf AI | Falcon 2 | 1021 | ±14 | 1.352 |
| 6 (6-7) | Cartesia | Sonic-3 | 961 | ±9 | 4.256 |
| 7 (6-7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3.882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3.689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3.611 |

Nota: la captura de pantalla incluida en la model card muestra Elo 1049 ±10 con 2.171 muestras e intervalo de puesto 2-3, mientras que la consulta en vivo registra 1047 ±11 con 2.268 muestras. Los intervalos de confianza se solapan con los modelos de los puestos 2 a 5, por lo que la comparación entre ellos no es concluyente. El benchmark mide preferencia humana (Bradley-Terry), no inteligibilidad objetiva; la model card menciona que los doce clips de muestra se seleccionaron con character error rate inferior al 2% bajo tres jueces ASR, pero no publica la tabla completa de CER por idioma en la información disponible.

## Requisitos de hardware

- Pesos en BF16 de aproximadamente 5,0 GB, según el tamaño del repositorio (5,1 GB).
- VRAM estimada para inferencia en BF16: no disponible de forma oficial; como referencia orientativa, los 2,50B parámetros en BF16 requieren al menos ~5 GB solo para pesos, más memoria para activaciones, caché de audio y batching.
- GPU recomendadas: no especificadas en la información disponible. El soporte de CUDA graphs implica GPUs NVIDIA; no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño de pesos, cabría en GPUs con 8-12 GB o más en BF16, pero no hay datos publicados de latencia ni de memoria real.
- Opciones de despliegue: API Python, endpoint de voz compatible con OpenAI, WebSocket streaming, batching continuo y CUDA graphs. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el streaming se emite en tramas de 80 ms de audio; no se publican cifras de latencia extremo a extremo ni de throughput (tokens de audio o segundos de audio por segundo).

## Comparativa con modelos similares

| Modelo | Creador | Parámetros | Contexto | Elo VoiceArena hindi | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Maya-2-Native | Maya Research | 2,50B | no disponible | 1047 ±11 | Apache-2.0 | Pesos abiertos en Hugging Face |
| Cartesia Sonic-3.6 | Cartesia | no disponible | no disponible | 1094 ±13 | propietaria | API comercial |
| Smallest AI Lightning 3.1 Pro | Smallest AI | no disponible | no disponible | 1024 ±12 | propietaria | API comercial |
| Sarvam AI Bulbul-V3 | Sarvam AI | no disponible | no disponible | 957 ±9 | propietaria | API comercial |

La comparación relevante es de licencia y despliegue: Maya-2-Native es el único de la tabla con pesos abiertos y Apache-2.0, lo que permite autoalojamiento y modificación. En calidad percibida en hindi queda por detrás de Sonic-3.6 (1094 frente a 1047) y por delante de Sonic-3.5, Lightning 3.1 Pro, Falcon 2, Bulbul-V3, Grok TTS y Dragon HD Omni, aunque con intervalos de confianza solapados con los puestos 2 a 5. No se dispone de comparativas publicadas para las demás lenguas índicas.

## Limitaciones y advertencias

- Cobertura lingüística limitada a 11 lenguas indias e inglés; no soporta otras lenguas según la información disponible.
- El benchmark publicado se limita al leaderboard de hindi en VoiceArena; no hay evidencia pública de calidad equivalente en asamés, odia, panyabí u otras lenguas.
- Los intervalos de confianza del Elo se solapan con varios competidores, por lo que el puesto 2 no debe interpretarse como una ventaja estadísticamente sólida.
- Riesgo de alucinación acústica y de pronunciación incorrecta en textos con números, siglas o nombres propios; la normalización de texto ayuda pero no elimina el problema.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; aunque la licencia Apache-2.0 permite uso comercial, es responsabilidad del desplegador aplicar consentimiento y marcas de agua o detección de voz sintética.
- No se documentan sesgos demográficos ni acústicos por voz o idioma; la evaluación con tres jueces ASR no sustituye a una auditoría de equidad.
- La licencia Apache-2.0 aplica al modelo, pero la model card remite a "licencias de componentes" para dependencias de terceros, que deben revisarse antes de producción.
- No hay información pública sobre la longitud de contexto de texto soportada, lo que dificulta planificar la síntesis de documentos largos sin segmentación manual.
- El modelo se publica como checkpoint 1.0 (25 de octubre de 2026); no se documenta una política de actualizaciones ni de soporte a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/riasatsk/maya2-native
- Repositorio de código: https://github.com/MayaResearch/maya2-native
- Leaderboard VoiceArena hindi: https://voicearena.com/tts-leaderboard/hindi
- Metodología VoiceArena: https://voicearena.com/tts-methodology
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo en Google Drive: https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Captura del leaderboard: https://huggingface.co/maya-research/maya2-native/resolve/main/voicearena-hindi-realtime-snapshot.png
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
