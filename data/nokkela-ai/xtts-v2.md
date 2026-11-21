# nokkela-ai/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por Coqui que permite la clonación de voz multilingüe a partir de una muestra de audio de tan solo 6 segundos. Esta ficha corresponde a la réplica independiente publicada por nokkela-ai en Hugging Face, que reproduce los pesos del modelo base `coqui/XTTS-v2` sin modificaciones declaradas. El modelo resuelve el problema de generar voz sintética personalizada en 17 idiomas sin necesidad de entrenamiento específico por hablante ni de grandes volúmenes de datos.

La relevancia actual del modelo radica en su capacidad de transferencia de emoción y estilo mediante clonación, su soporte de clonación cruzada entre idiomas y su frecuencia de muestreo de 24 kHz, que lo sitúan como una referencia práctica para aplicaciones de doblaje, asistentes conversacionales y accesibilidad. La arquitectura combina un modelo autorregresivo basado en transformer para la generación de tokens acústicos con un vocoder neuronal para la síntesis de forma de onda, aunque la información proporcionada no detalla los parámetros totales ni la composición exacta del dataset de entrenamiento.

El repositorio ocupa 2,1 GB y se distribuye bajo la Coqui Public Model License, una licencia con restricciones para uso comercial que conviene revisar antes de desplegar el modelo en producción. Al tratarse de una réplica del modelo original, las capacidades y limitaciones son las del XTTS-v2 de Coqui.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo de voz basado en transformer autorregresivo con vocoder neuronal (detalle exacto no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la referencia de hablante es de 6 segundos de audio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 17: en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, ja, hu, ko, hi |
| Licencia | Coqui Public Model License (coqui-public-model-license) |
| Formato de pesos | no disponible (repositorio de 2,1 GB, librería `coqui`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de los sistemas TTS neuronales modernos: un componente autorregresivo basado en transformer genera tokens acústicos condicionados por el texto y por un embedding de hablante extraído de la referencia de audio, y un vocoder neuronal convierte esos tokens en forma de onda a 24 kHz. La versión v2 introduce mejoras en el acondicionamiento de hablante respecto a v1, permite el uso de múltiples referencias de voz e interpolación entre hablantes, y añade dos idiomas nuevos (húngaro y coreano).

La información proporcionada no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Lo que sí se documenta es la mejora en prosodia y calidad de audio global, así como mejoras de estabilidad respecto a la versión anterior.

## Capacidades

- Generación de voz multilingüe en 17 idiomas con una única arquitectura.
- Clonación de voz a partir de una muestra de audio de 6 segundos.
- Transferencia de emoción y estilo mediante clonación.
- Clonación cruzada entre idiomas: usar una referencia en un idioma para generar voz en otro.
- Soporte de múltiples referencias de hablante e interpolación entre ellas.
- Síntesis a 24 kHz de frecuencia de muestreo.
- Integración con la API de Coqui TTS (`TTS.api`), línea de comandos y uso directo del modelo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step, al no ser un modelo de lenguaje.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite generar una pista de voz en otro idioma conservando el timbre del hablante original gracias a la clonación cruzada, lo que simplifica flujos de localización con 17 idiomas disponibles.
- Asistentes de voz conversacionales: integrado en un pipeline con un LLM (como se muestra en la demo con Mistral o Zephyr), el modelo sintetiza respuestas con una voz personalizada a partir de una muestra corta del usuario.
- Audiolibros y narración personalizada: con una referencia de 6 segundos se puede mantener una voz consistente a lo largo de textos largos, ajustando el estilo mediante la selección de la referencia.
- Accesibilidad y comunicación aumentativa: permite generar voz sintética con el timbre de una persona a partir de un clip breve, útil para usuarios que pierden la capacidad de hablar.
- Prototipado de personajes y videojuegos: creación rápida de voces para NPCs o personajes sin necesidad de contratar locutores ni entrenar modelos por personaje.
- Generación de contenido para pódcast y formación: producción de narraciones multilingües con una voz corporativa consistente y transferencia de estilo entre episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,1 GB, por lo que la inferencia en precisión completa requiere al menos varios GB de VRAM, aunque la cifra exacta no se documenta.
- GPU recomendadas: no disponible en la información proporcionada. La API de Coqui TTS permite ejecución en GPU (`gpu=True`) y en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del repositorio sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: API de Coqui TTS (`TTS.api`), línea de comandos `tts`, uso directo con `XttsConfig` y `Xtts`, y espacios de demostración en Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / referencia | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XTTS-v2 (nokkela-ai) | no disponible | 6 s de audio de referencia | 17 | Coqui Public Model License | Hugging Face (réplica) |
| XTTS-v2 (coqui) | no disponible | 6 s de audio de referencia | 17 | Coqui Public Model License | Hugging Face (original) |
| XTTS-v1 | no disponible | no disponible | 15 | Coqui Public Model License | Hugging Face |
| Alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparativo con otros modelos de TTS, por lo que la comparativa se limita a aspectos de licencia, idiomas y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo de voz, puede reproducir sesgos presentes en los datos de entrenamiento originales de Coqui.
- Riesgo de alucinación: en TTS se traduce en artefactos, prosodia incorrecta o pronunciación errónea, especialmente en textos fuera de dominio o idiomas con menos datos.
- Limitaciones de contexto o idioma: la ventana de referencia es de 6 segundos; textos muy largos pueden degradar la consistencia de la voz. El soporte se limita a los 17 idiomas listados.
- Restricciones de licencia: la Coqui Public Model License impone condiciones para uso comercial; es imprescindible revisar sus términos antes de desplegar el modelo en producción.
- Caveat de producción: esta réplica no declara modificaciones ni validación adicional respecto al modelo original; se recomienda verificar la integridad de los pesos y contrastar con `coqui/XTTS-v2`.
- Riesgo ético: la clonación de voz puede emplearse para suplantación o deepfakes; es necesario implementar controles de consentimiento y medidas de mitigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/XTTS-v2
- Modelo base original: https://huggingface.co/coqui/XTTS-v2
- Repositorio de código Coqui TTS: https://github.com/coqui-ai/TTS
- Documentación: https://tts.readthedocs.io/en/latest/
- Documentación de entrenamiento XTTS: https://tts.readthedocs.io/en/latest/models/xtts.html#training
- Demo Space XTTS: https://huggingface.co/spaces/coqui/xtts
- Demo Voice Chat con Mistral/Zephyr: https://huggingface.co/spaces/coqui/voice-chat-with-mistral
- Licencia CPML: https://coqui.ai/cpml
- Blog sobre la licencia CPML: https://coqui.ai/blog/tts/cpml
- Discusiones en GitHub: https://github.com/coqui-ai/TTS/discussions
- Discord de la comunidad: https://discord.gg/5eXr5seRrv
- Twitter de Coqui: https://twitter.com/coqui_ai
