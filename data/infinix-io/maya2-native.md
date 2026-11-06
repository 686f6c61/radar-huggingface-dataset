# Infinix-io/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) multilingüe de pesos abiertos desarrollado por Infinix-io (Maya Research), orientado específicamente a once lenguas de la India y al inglés. Se construye sobre el modelo de lenguaje Qwen3-1.7B-Base y añade una cabeza de generación de audio basada en el códec Mimi, lo que le permite producir voz a 24 kHz en tramas de 80 ms y transmitir el audio a medida que se genera. Con 2.502.398.656 parámetros y aproximadamente 5 GB de pesos en BF16, se posiciona como una alternativa autoalojable a las APIs comerciales de TTS para mercados del sur de Asia.

El modelo resuelve un problema concreto: la escasez de sistemas de voz de calidad para lenguas indias como asamés, bengalí, gujarati, canarés, malabar, maratí, oriya, panyabí, tamil, telugu e hindi, con soporte de clonación de voz zero-shot y síntesis cruzada entre idiomas. Incluye 20 voces integradas y una cadena de normalización de texto para números, fechas y divisas, además de un motor de inferencia con API Python, endpoint compatible con OpenAI y streaming por WebSocket.

Su relevancia actual radica en que combina licencia Apache-2.0, pesos autoalojables y una puntuación competitiva en el benchmark VoiceArena (segundo puesto en hindi entre modelos de tiempo real, con Elo 1047 ±11 sobre 2.268 muestras). El checkpoint corresponde a la versión 1.0, publicada el 25 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3-1.7B-Base con cabeza de generación de audio sobre códec Mimi |
| Parámetros totales | 2.502.398.656 (2,50B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | asamés (as), bengalí (bn), inglés (en), gujarati (gu), hindi (hi), canarés (kn), malabar (ml), maratí (mr), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, ~5,0 GB) |

## Arquitectura y entrenamiento

Maya 2 Native parte de Qwen/Qwen3-1.7B-Base como columna vertebral textual y le acopla un decodificador de audio que opera sobre el códec neuronal Mimi, generando voz mono a 24 kHz en tramas de 80 ms. El resultado es un único checkpoint de 2,50B parámetros que cubre las doce lenguas declaradas sin necesidad de modelos separados por idioma. La arquitectura exacta del cabezal de audio, el número de capas y la dimensión de los tokens de código no se detallan en la información disponible.

No se especifican en la documentación proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Sí se documenta la existencia de una cadena de normalización de texto integrada en el motor de inferencia (números, fechas, divisas y otras formas escritas) y el soporte de streaming continuo con batching continuo, lo que sugiere un diseño orientado a baja latencia en producción. La clonación de voz zero-shot y la síntesis cruzada entre idiomas son capacidades declaradas, aunque los detalles del procedimiento de clonación no se describen.

## Capacidades

- Síntesis de voz multilingüe en once lenguas indias más inglés desde un único checkpoint.
- Generación de audio a 24 kHz mono con streaming en tramas de 80 ms.
- 20 voces integradas con selección por API.
- Clonación de voz zero-shot a partir de una referencia permitida.
- Clonación y síntesis cruzada entre idiomas (misma identidad vocal en distintas lenguas).
- Normalización de texto para números, fechas, divisas y otras formas escritas.
- API Python, endpoint de voz compatible con OpenAI y streaming por WebSocket con contextos de petición separados y cancelación.
- Batching continuo en el motor de inferencia para servir múltiples peticiones concurrentes.
- Integración como etapa de generación de voz posterior a un modelo de lenguaje en agentes conversacionales.

## Casos de uso

- Agentes de voz conversacionales e IVR: el modelo puede empezar a reproducir audio mientras sigue generando, gracias al streaming en tramas de 80 ms y al protocolo WebSocket con cancelación, lo que reduce la latencia percibida en atención telefónica automatizada en hindi, tamil o telugu.
- Sistemas de atención al cliente autoalojados: al liberarse bajo Apache-2.0 y ejecutarse en GPU NVIDIA propias, permite desplegar síntesis de voz sin depender de APIs externas ni enviar texto del cliente a terceros.
- Narración y audiolibros multilingües: las 20 voces integradas y la clonación zero-shot permiten mantener una identidad vocal consistente a lo largo de capítulos y, con la síntesis cruzada, publicar el mismo contenido en varias lenguas indias.
- Herramientas de accesibilidad: lectura en voz alta de contenido web o documentos para usuarios de lenguas indias con poca cobertura de TTS comercial, usando el endpoint compatible con OpenAI para integrarlo en aplicaciones existentes.
- Localización de vídeo y formación corporativa: generación de pistas de voz en asamés, bengalí, gujarati, canarés, malabar, maratí, oriya, panyabí, tamil y telugu a partir de un guion, con normalización automática de cifras y fechas.
- Asistentes de voz para dispositivos y automoción: el tamaño contenido (2,50B parámetros, ~5 GB en BF16) y el streaming permiten ejecutar el modelo en infraestructura propia con batching continuo para flotas de usuarios concurrentes.
- Investigación en TTS multilingüe: al ser pesos abiertos con licencia permisiva, sirve como base para fine-tuning en lenguas de bajos recursos o para estudiar clonación de voz y normalización de texto en el contexto indio.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al benchmark VoiceArena para hindi, con el filtro «All / Real-time only», consultado el 3 de noviembre de 2026.

| Puesto | Creador | Modelo | Elo Bradley-Terry | IC 95% | Muestras |
|---|---|---:|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1.289 |
| 2 (2–4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2.268 |
| 3 (2–5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1.802 |
| 4 (2–5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1.870 |
| 5 (3–5) | Murf AI | Falcon 2 | 1021 | ±14 | 1.352 |
| 6 (6–7) | Cartesia | Sonic-3 | 961 | ±9 | 4.256 |
| 7 (6–7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3.882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3.689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3.611 |

En la vista de todos los modelos para hindi, en la misma fecha, Maya-2-Native ocupa el puesto 7 con intervalo 5–10; el segundo puesto corresponde exclusivamente a la vista de solo tiempo real. No se han publicado resultados de benchmarks en la información disponible para otras métricas (WER, MOS, similitud de hablante) ni para otras lenguas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los ~5,0 GB de pesos requieren al menos 6–8 GB de VRAM contando activaciones y buffers del códec Mimi; no se dispone de cifras oficiales de cuantización.
- GPU recomendadas: no se especifican en la documentación; por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas para servir varias peticiones con batching continuo.
- GPU de consumo: con ~5 GB en BF16, el modelo cabe en tarjetas de consumo de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090), siempre que el motor de inferencia oficial lo soporte.
- Opciones de despliegue: el autor proporciona un motor de inferencia propio con API Python, endpoint HTTP compatible con OpenAI y WebSocket; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras de latencia ni de throughput; el streaming en tramas de 80 ms y el batching continuo son las únicas características de rendimiento documentadas.

## Comparativa con modelos similares

| Modelo | Creador | Parámetros | Idiomas indios | Streaming | Licencia | Elo hindi (VoiceArena, real-time) |
|---|---|---|---:|---|---|---:|
| Maya-2-Native | Maya Research | 2,50B | 11 + inglés | Sí (80 ms) | Apache-2.0 | 1047 ±11 |
| Sonic-3.6 | Cartesia | No disponible | No especificado | No disponible | Propietaria (API) | 1094 ±13 |
| Lightning 3.1 Pro | Smallest AI | No disponible | No especificado | No disponible | Propietaria (API) | 1024 ±12 |
| Bulbul-V3 | Sarvam AI | No disponible | Enfocado a lenguas indias | No disponible | Propietaria (API) | 957 ±9 |

La ventaja diferencial de Maya-2-Native frente a las alternativas de la tabla es la combinación de pesos abiertos, licencia Apache-2.0 y autoalojamiento; sus competidores directos en la comparativa son APIs propietarias cuyos detalles de arquitectura y tamaño no se publican.

## Limitaciones y advertencias

- La calidad de acento e identidad vocal varía según la combinación de lengua y voz; el autor recomienda consultar la tabla de cobertura de voces al elegir una.
- El resultado destacado en VoiceArena se limita a hindi y a la vista de solo tiempo real; en la vista completa el modelo baja al puesto 7, y los intervalos de confianza se solapan con varios competidores.
- No se documentan sesgos demográficos, de género o de acento específicos; como todo sistema entrenado con voz, es previsible que herede sesgos de los datos de habla utilizados.
- Riesgo de alucinación o de prosodia incorrecta en textos con abreviaturas, nombres propios o formatos no cubiertos por la normalización de texto.
- La clonación de voz exige consentimiento de la persona de referencia; el uso indebido puede facilitar suplantación de identidad y deepfakes de audio.
- No se especifican la longitud de contexto, los tipos de cuantización ni el soporte en motores de inferencia de terceros, lo que limita la planificación de despliegues a gran escala.
- La licencia Apache-2.0 es permisiva para uso comercial, pero la model card remite a una sección de licencias de componentes que conviene revisar por las dependencias del códec Mimi y del modelo base Qwen.
- La model card advierte de que los identificadores internos del paquete (`maya3`, `Maya3TTS`, `maya3_config.json`) no coinciden con el nombre comercial, lo que puede confundir en la integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/maya2-native
- Código de inferencia: https://github.com/MayaResearch/maya2-native
- Leaderboard VoiceArena (hindi): https://voicearena.com/tts-leaderboard/hindi
- Metodología VoiceArena: https://voicearena.com/tts-methodology
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo en Google Drive: https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
