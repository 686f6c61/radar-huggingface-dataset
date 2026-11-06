# Infinix-ai/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) multilingüe de pesos abiertos desarrollado por Maya Research (publicado bajo la cuenta Infinix-ai en Hugging Face). Está diseñado específicamente para 11 lenguas de la India más el inglés, y genera audio a 24 kHz con capacidad de streaming en tramas de 80 ms. El modelo parte de Qwen/Qwen3-1.7B-Base como base y se ha adaptado al dominio del habla, con un total de 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y unos 5 GB de pesos en BF16.

Su relevancia actual radica en cubrir un hueco poco atendido: la síntesis de voz de calidad para lenguas indias (hindi, tamil, telugu, bengala, maratí, etc.) con licencia Apache-2.0, lo que permite despliegue autoalojado sin restricciones comerciales. Incluye 20 voces integradas, clonación de voz zero-shot y síntesis cruzada entre lenguas, además de una API compatible con el endpoint de voz de OpenAI y streaming por WebSocket.

El modelo se publica como checkpoint 1.0 (25 de octubre de 2026), con el código de inferencia disponible en un repositorio de GitHub separado. Internamente, los identificadores de paquete, clase y configuración conservan el nombre `maya3` (clase `Maya3TTS`, fichero `maya3_config.json`), aunque el nombre comercial del modelo sea Maya 2 Native.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS construido sobre Qwen/Qwen3-1.7B-Base; detalles de la cabeza acústica no especificados) |
| Parametros totales | 2.502.398.656 (2,50B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | asamés, bengalí, inglés, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil, telugu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado en la información disponible los detalles de la arquitectura interna más allá de que el modelo se construye a partir de Qwen/Qwen3-1.7B-Base, un transformer de 1,7 mil millones de parámetros, al que se añaden los componentes necesarios para la síntesis de voz. El modelo total alcanza 2,50 mil millones de parámetros, lo que sugiere que la parte específica de audio (codificador/decodificador acústico y proyecciones) añade en torno a 0,8 mil millones de parámetros sobre la base textual. La salida de audio es mono a 24 kHz, con streaming en tramas de 80 ms.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del corpus, ni si se emplearon técnicas de alineamiento como RLHF o DPO. La model card menciona normalización de texto (números, fechas, divisas y otras formas escritas) como parte del motor de inferencia, y la etiqueta `mimi` sugiere el uso de un códec neural de audio tipo Mimi, aunque no se detalla su configuración exacta. No hay información publicada sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz multilingüe en 11 lenguas indias más inglés con un único checkpoint.
- Generación de audio a 24 kHz, mono, con streaming en tramas de 80 ms para iniciar la reproducción antes de completar la generación.
- 20 voces integradas con selección de persona por API.
- Clonación de voz zero-shot a partir de una referencia de voz.
- Síntesis cruzada entre lenguas (cross-lingual): usar una voz registrada en un idioma para hablar en otro.
- Normalización de texto para números, fechas, divisas y otras formas escritas antes de la síntesis.
- Interfaces de despliegue: API de Python, endpoint de voz compatible con OpenAI y streaming por WebSocket con contextos de petición separados y cancelación.
- Batching continuo en el motor de inferencia para servir múltiples peticiones concurrentes.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni agentes más allá de su uso como etapa de generación de voz en pipelines de agentes conversacionales.

## Casos de uso

- Agentes de voz conversacionales e IVR: el modelo puede generar la respuesta hablada de un agente en hindi, tamil o telugu y empezar la reproducción desde los primeros fragmentos de audio mientras continúa la generación, lo que reduce la latencia percibida en llamadas telefónicas automatizadas.
- Sistemas de atención al cliente autoalojados: al liberarse bajo Apache-2.0 y ejecutarse en GPU NVIDIA propias, permite desplegar síntesis de voz sin depender de APIs externas ni ceder datos de clientes a terceros.
- Narración y audiolibros en lenguas indias: la normalización de texto integrada (fechas, números, divisas) evita errores de lectura en contenido largo y la selección entre 20 voces permite asignar una persona distinta por sección o personaje.
- Herramientas de accesibilidad: lectura en voz alta de contenido web o de documentos para usuarios de lenguas indias, con streaming para empezar a leer antes de procesar el texto completo.
- Doblaje y localización de contenido: la clonación de voz cruzada entre lenguas permite mantener la identidad de la voz de un hablante original al doblar un vídeo a otra de las lenguas soportadas, aunque la calidad varíe según la combinación voz-idioma.
- Asistentes de voz embebidos en aplicaciones: el endpoint compatible con OpenAI facilita sustituir un proveedor de TTS en la nube por una instancia propia sin reescribir el cliente, y el WebSocket permite cancelar respuestas interrumpidas por el usuario.
- Generación de avisos y locuciones para servicios públicos: cobertura de 11 lenguas indias con un solo modelo simplifica el mantenimiento de sistemas de anuncios en múltiples idiomas.

## Benchmarks y rendimiento

La model card incluye resultados del ranking VoiceArena para hindi (filtro: hindi / todas las categorías / solo tiempo real), consultado el 3 de noviembre de 2026:

| Puesto | Creador | Modelo | Elo Bradley-Terry | IC 95% | Muestras |
|---|---|---|---:|---:|---:|
| 1 | Cartesia | Sonic-3.6 | 1094 | ±13 | 1.289 |
| 2 (2–4) | Maya Research | Maya-2-Native | 1047 | ±11 | 2.268 |
| 3 (2–5) | Cartesia | Sonic-3.5 | 1035 | ±12 | 1.802 |
| 4 (2–5) | Smallest AI | Lightning 3.1 Pro | 1024 | ±12 | 1.870 |
| 5 (3–5) | Murf AI | Falcon 2 | 1021 | ±14 | 1.352 |
| 6 (6–7) | Cartesia | Sonic-3 | 961 | ±9 | 4.256 |
| 7 (6–7) | Sarvam AI | Bulbul-V3 | 957 | ±9 | 3.882 |
| 8 | xAI | Grok TTS | 890 | ±9 | 3.689 |
| 9 | Microsoft Azure | Dragon HD Omni | 855 | ±9 | 3.611 |

El autor advierte de que el puesto 2 corresponde específicamente a la vista de solo tiempo real; en la vista de todos los modelos para hindi, Maya-2-Native aparece en el puesto 7 con intervalo 5–10 en la misma fecha. VoiceArena data la entrada del modelo en julio de 2026 y no identifica una revisión exacta del checkpoint. No se han publicado otros resultados de benchmarks (como métricas de error de síntesis o inteligibilidad) en la información disponible.

## Requisitos de hardware

- Pesos en BF16 de aproximadamente 5,0 GB; el repositorio completo ocupa 5,1 GB. La VRAM necesaria para inferencia debe cubrir los pesos más las activaciones y el estado del motor de streaming; no se publica una cifra oficial de VRAM.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo cabe en GPUs de consumo con 8 GB o más de VRAM en BF16, y con margen amplio en GPUs profesionales como A100 o H100.
- Despliegue: el motor de inferencia propio (repositorio de GitHub) ofrece API de Python, endpoint HTTP compatible con OpenAI y WebSocket con batching continuo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El streaming en tramas de 80 ms es el único dato de temporización publicado.

## Comparativa con modelos similares

| Modelo | Creador | Parámetros | Idiomas | Licencia | Disponibilidad | Elo hindi (VoiceArena, tiempo real) |
|---|---|---|---|---|---|---|
| Maya-2-Native | Maya Research | 2,50B | 11 lenguas indias + inglés | Apache-2.0 | Pesos abiertos en Hugging Face | 1047 |
| Sonic-3.6 | Cartesia | no disponible | no disponible | propietaria (API) | solo API | 1094 |
| Bulbul-V3 | Sarvam AI | no disponible | lenguas indias | propietaria (API) | solo API | 957 |
| Lightning 3.1 Pro | Smallest AI | no disponible | no disponible | propietaria (API) | solo API | 1024 |

La comparativa se limita a los datos publicados en la model card. No se dispone de parámetros, contexto ni licencia de los modelos competidores, que en su mayoría son servicios propietarios accesibles solo por API. La ventaja diferencial de Maya-2-Native es la combinación de pesos abiertos, licencia Apache-2.0 y cobertura de 11 lenguas indias.

## Limitaciones y advertencias

- La calidad de acento e identidad de voz varía según la combinación de lengua y voz; el autor remite a la tabla de cobertura de voces para elegir, lo que implica que no todas las voces funcionan igual de bien en todos los idiomas.
- Los resultados de VoiceArena son un ranking subjetivo por preferencia humana (Bradley-Terry) y los intervalos de confianza se solapan entre los puestos 2 y 5, por lo que las diferencias con los modelos cercanos no son concluyentes.
- El puesto 2 solo aplica a la vista de tiempo real para hindi; en la vista general el modelo baja al puesto 7. No hay benchmarks publicados para las demás lenguas.
- Riesgo de alucinación acústica y de pronunciación incorrecta en texto no cubierto por la normalización (nombres propios, siglas, mezclas de código), habitual en modelos TTS.
- Posibles sesgos en las voces integradas y en la clonación: la clonación de voz exige consentimiento de la persona cuya voz se usa y puede facilitar usos fraudulentos (suplantación); no se documentan salvaguardas técnicas en la información disponible.
- Licencia Apache-2.0 para los pesos, pero la model card remite a "licencias de componentes" para dependencias de terceros; conviene revisarlas antes de uso comercial.
- El modelo está orientado a lenguas indias e inglés; no se documenta soporte para castellano ni otras lenguas europeas.
- No se publican datos de contexto máximo, cuantizaciones soportadas ni requisitos oficiales de VRAM, lo que dificulta planificar el despliegue en producción.
- La fecha de creación del repositorio (noviembre de 2026) y la del checkpoint (octubre de 2026) son recientes; el ecosistema de herramientas de terceros puede no estar adaptado todavía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/maya2-native
- Código de inferencia (GitHub): https://github.com/MayaResearch/maya2-native
- Ranking VoiceArena hindi: https://voicearena.com/tts-leaderboard/hindi
- Metodología VoiceArena: https://voicearena.com/tts-methodology
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo (Google Drive): https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
