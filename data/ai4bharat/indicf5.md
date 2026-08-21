# ai4bharat/IndicF5

## Resumen
IndicF5 es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo de AI4Bharat, un laboratorio de investigación en IA del IIT Madras. El modelo genera habla natural en 11 idiomas indios a partir de un texto objetivo, un audio de referencia y la transcripción de ese audio, de modo que aprende la prosodia y el timbre del hablante del prompt para producir una voz similar. Está entrenado sobre 1417 horas de audio de alta calidad procedentes de los conjuntos Rasa, IndicTTS, LIMMITS y IndicVoices-R.

La arquitectura se basa en F5-TTS, un modelo de síntesis de voz que emplea técnicas de flow matching. Con 350 millones de parámetros, IndicF5 ofrece una calidad de habla cercana a la humana y es relevante porque cubre un amplio rango de lenguas indias, un dominio con escasos modelos TTS de calidad. Se distribuye bajo licencia MIT y el acceso al repositorio está restringido (gated) en HuggingFace, por lo que hay que aceptar condiciones previas.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Basado en F5-TTS (flow matching) |
| Parametros totales | 350.681.834 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (TTS no usa ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Asamés, bengalí, gujaratí, hindí, canarés, malayalam, maratí, oriya, punyabí, tamil, telugu |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
IndicF5 se basa en la arquitectura F5-TTS, un modelo de síntesis de voz que emplea flow matching para generar muestras de audio condicionadas a una secuencia de texto. El modelo acepta tres entradas: el texto que se quiere sintetizar, un audio de referencia (prompt de voz) y la transcripción de ese audio. De esta forma aprende las características acústicas del hablante de la referencia y las aplica al texto de destino.

El entrenamiento se realizó sobre 1417 horas de habla de alta calidad, combinando los conjuntos de datos Rasa, IndicTTS, LIMMITS e IndicVoices-R. No se ha publicado información detallada sobre el número exacto de tokens, el proceso de optimización ni si se emplearon técnicas de alineación como RLHF o DPO. La principal innovación es la capacidad de controlar el hablante mediante un prompt de audio, lo que permite transferencia de voz sin necesidad de adaptar el modelo.

## Capacidades
- Síntesis de voz natural en 11 idiomas indios (asamés, bengalí, gujaratá, hindí, canarés, malayalam, maratí, oriya, punyabí, tamil y telugu).
- Transferencia de voz: a partir de una referencia de audio, el modelo imita el timbre, tono y prosodia del hablante de la referencia.
- Generación de habla con control sobre la entonación y el ritmo mediante el prompt de referencia.
- Entrada de texto en los idiomas soportados, con salida de audio en formato WAV o similar (no se especifica el formato exacto).
- No dispone de capacidades de tool calling, agentes ni razonamiento multimodal; es un modelo TTS puro.

## Casos de uso
- Audiolibros y narración: IndicF5 puede generar voces consistentes para leer textos largos en cualquiera de los 11 idiomas, manteniendo la misma voz del narrador a partir de un clip de referencia.
- Asistentes de voz multilingües: integrable en asistentes para servicios en India, donde se necesita responder en varias lenguas con una voz natural y personalizada.
- Doblaje y localización de contenidos: permite doblar vídeos o presentaciones a idiomas regionales usando una voz de referencia concreta.
- Accesibilidad: síntesis de voz para personas con dificultades de lectura o discapacidades visuales, en los idiomas locales.
- Educación y e-learning: generación de contenido oral en idiomas regionales para cursos online, manteniendo coherencia de voz entre lecciones.
- Sistemas de respuesta por voz (IVR): automatizar atención al cliente en empresas que operan en India, con voz natural y en varios idiomas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay datos comparativos con otros modelos TTS.

## Requisitos de hardware
- No se dispone de datos oficiales sobre VRAM mínima ni GPU recomendada.
- Con 350 millones de parámetros y un tamaño de repo de 1,4 GB, es probable que el modelo pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación oficial.
- Se recomienda probar con frameworks de inferencia TTS como Coqui TTS o custom code incluido en el repositorio.
- No se han publicado latencias ni throughput estimados.

## Comparativa con modelos similares
No se ha encontrado información sobre modelos TTS comparables en el contexto de idiomas indios con licencia MIT y tamaño similar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- El acceso al modelo está restringido en HuggingFace; es necesario aceptar los términos y condiciones de la organización AI4Bharat.
- No hay información sobre sesgos de género o dialectales, pero al estar entrenado en un corpus limitado (1417 horas) puede presentar variaciones de calidad entre idiomas y hablantes.
- La calidad de la síntesis depende de la referencia de audio; si la referencia es de baja calidad o tiene ruido, el resultado puede degradarse.
- La licencia MIT permite uso comercial, pero hay que verificar las condiciones de los conjuntos de datos utilizados (Rasa, IndicTTS, etc.) para posibles restricciones adicionales.
- El modelo no admite control fino de la velocidad o la emoción más allá de lo que se pueda inferir de la referencia; no se han publicado parámetros para ajustar estos aspectos.

## Enlaces
- [HuggingFace - ai4bharat/IndicF5](https://huggingface.co/ai4bharat/IndicF5)
- [GitHub - AI4Bharat/IndicF5](https://github.com/AI4Bharat/IndicF5)
- [Página del modelo en ai4bharat.iitm.ac.in](https://ai4bharat.iitm.ac.in/areas/model/TTS/IndicF5/)
- [Repositorio alternativo - hareeshbabu82ns/TTSIndicF5](https://github.com/hareeshbabu82ns/TTSIndicF5)
- [Entrada en IndiaAI - AIBharat IndicF5](https://aikosh.indiaai.gov.in/home/models/details/aibharat_indicf5.html)
