# coqui/XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) desarrollado por Coqui, diseñado para la clonación de voz multilingüe. Permite replicar una voz a partir de una muestra de audio de apenas 6 segundos y generar habla en 17 idiomas diferentes, manteniendo las características vocales del hablante original. Este modelo es el mismo que impulsa los servicios comerciales de Coqui Studio y la API de Coqui, lo que lo convierte en una referencia en el ámbito de la síntesis de voz de código abierto.

La arquitectura del modelo combina un codificador de voz con un módulo de generación basado en Transformer, optimizado para el condicionamiento del hablante y la transferencia de estilo y emoción. El repositorio en Hugging Face ocupa 24,3 GB, lo que indica un modelo de gran tamaño. Se publicó en octubre de 2023 y desde entonces ha acumulado más de 8,6 millones de descargas, lo que refleja su adopción en la comunidad de desarrolladores.

La relevancia actual de XTTS-v2 radica en su capacidad para realizar clonación de voz de alta calidad sin necesidad de grandes conjuntos de datos de entrenamiento, lo que democratiza el acceso a la síntesis de voz personalizada. Además, su soporte multilingüe y su integración con el ecosistema de Coqui TTS lo convierten en una herramienta práctica para aplicaciones de voz en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con módulo GPT para codificación de voz y decoder de audio (detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 17: inglés, español, francés, alemán, italiano, portugués, polaco, turco, ruso, neerlandés, checo, árabe, chino (mandarín), japonés, húngaro, coreano e hindi |
| Licencia | Coqui Public Model License (CPML) |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura de XTTS-v2 se basa en un enfoque de dos etapas: un codificador de voz que extrae características del hablante a partir de una muestra de referencia, y un modelo de generación de audio que produce la síntesis condicionada por esas características. La model card indica mejoras arquitectónicas respecto a XTTS-v1 en el condicionamiento del hablante, lo que permite utilizar múltiples referencias de voz e incluso interpolar entre diferentes hablantes. También se mencionan mejoras en la estabilidad, la prosodia y la calidad general del audio.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de tokens o los métodos de alineación (como RLHF o DPO). La documentación oficial de Coqui menciona que el modelo fue entrenado con datos multilingües, pero no se proporcionan cifras concretas. La innovación principal del modelo es su capacidad para clonar voces con solo 6 segundos de audio, lo que lo diferencia de otros sistemas que requieren horas de grabación.

## Capacidades

- Generación de voz a partir de texto en 17 idiomas, con una tasa de muestreo de 24 kHz.
- Clonación de voz mediante una muestra de audio de 6 segundos, sin necesidad de entrenamiento adicional.
- Transferencia de emociones y estilo a través de la clonación, permitiendo que la voz sintetizada imite la entonación y el ritmo del hablante original.
- Clonación de voz entre idiomas (cross-language voice cloning): se puede usar una muestra de voz en un idioma y generar habla en otro distinto.
- Soporte de múltiples referencias de hablante e interpolación entre voces, lo que permite crear voces híbridas.
- Integración con el ecosistema Coqui TTS, incluyendo la API de Python y la interfaz de línea de comandos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de síntesis de voz.

## Casos de uso

- Audiolibros y narración de contenido: se puede clonar la voz de un narrador profesional a partir de una muestra breve y generar audiolibros completos en varios idiomas, manteniendo la coherencia vocal. El modelo es adecuado porque la clonación con 6 segundos permite replicar la voz sin necesidad de horas de grabación.
- Doblaje de vídeo y localización: para traducir contenido audiovisual a otros idiomas manteniendo la voz del actor original. XTTS-v2 permite la clonación entre idiomas, por lo que un clip de voz en español puede generar diálogo en inglés con la misma voz, facilitando la localización de series y películas.
- Asistentes de voz personalizados: empresas o desarrolladores pueden crear asistentes con una voz específica (por ejemplo, la de un personaje de marca) usando una muestra de audio de referencia. El modelo soporta múltiples idiomas, lo que permite desplegar el asistente en diferentes mercados.
- Accesibilidad para personas con discapacidad del habla: se puede clonar la voz de una persona a partir de una grabación histórica y usarla para generar mensajes de comunicación aumentativa. La baja cantidad de audio requerida hace que sea viable incluso con muestras limitadas.
- Generación de contenido para redes sociales: creadores de contenido pueden usar su propia voz clonada para generar locuciones en diferentes idiomas, ampliando su audiencia sin necesidad de grabar cada versión manualmente.
- Prototipado rápido de interfaces de voz: en el desarrollo de aplicaciones con interacción por voz, se puede generar audio de prueba con distintas voces y estilos para evaluar la experiencia de usuario antes de grabar la versión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones con otros modelos de TTS. Por lo tanto, no se puede ofrecer una tabla de rendimiento objetiva en esta ficha.

## Requisitos de hardware

- El tamaño del repositorio es de 24,3 GB, lo que sugiere que el modelo completo en precisión FP32 requiere al menos 24 GB de VRAM para cargarse en memoria. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 16 GB, pero no se han publicado cifras oficiales de consumo de memoria.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia con cuantización ligera, o 24 GB o más para el modelo sin cuantizar. GPUs como la NVIDIA RTX 3090, RTX 4090, A100 o H100 son adecuadas.
- El modelo puede ejecutarse en CPU, aunque la latencia será considerablemente mayor. Para uso en producción, se recomienda GPU.
- Las opciones de despliegue incluyen la librería Coqui TTS (con soporte para GPU y CPU), así como la API de Python y la interfaz de línea de comandos. No se menciona compatibilidad con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- No se han publicado datos de latencia ni throughput específicos. En una GPU moderna, la generación de un segmento de audio de unos pocos segundos suele ser casi en tiempo real, pero esto depende de la longitud del texto y de la configuración.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de clonación de voz en la documentación proporcionada. Modelos como Tortoise TTS, VoiceCraft o OpenVoice podrían considerarse alternativas, pero no se han encontrado datos objetivos de comparación en la búsqueda web realizada. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- La licencia Coqui Public Model License (CPML) impone restricciones para uso comercial. Según el texto de la licencia, no se permite el uso comercial sin un acuerdo explícito con Coqui. Es fundamental revisar los términos completos antes de utilizar el modelo en productos comerciales.
- Al ser un modelo de clonación de voz, existe un riesgo inherente de uso indebido para suplantación de identidad o generación de contenido fraudulento. Se recomienda implementar medidas de control y verificación en aplicaciones sensibles.
- La calidad de la clonación depende de la calidad y duración de la muestra de audio de referencia. Con muestras de baja calidad o muy cortas, el resultado puede presentar artefactos o pérdida de fidelidad.
- El modelo no soporta todos los idiomas con la misma precisión; algunos idiomas menos representados en el entrenamiento pueden mostrar una pronunciación menos natural.
- No se han publicado detalles sobre sesgos en las voces generadas ni sobre la robustez frente a acentos o dialectos específicos. Es posible que el modelo tenga un rendimiento inferior con variedades regionales poco comunes.
- Para producción, se debe tener en cuenta que el modelo es relativamente grande (24,3 GB), lo que implica costes de almacenamiento y memoria. La cuantización puede reducir el tamaño, pero no se han documentado oficialmente los formatos soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coqui/XTTS-v2
- Documentación oficial de XTTS: https://docs.coqui.ai/en/stable/models/xtts.html
- Repositorio de código (Coqui TTS): https://github.com/coqui-ai/TTS
- Demo interactiva (XTTS Space): https://huggingface.co/spaces/coqui/xtts
- Demo de chat por voz con Mistral o Zephyr: https://huggingface.co/spaces/coqui/voice-chat-with-mistral
- Licencia CPML: https://coqui.ai/cpml
- Blog sobre el origen de CPML: https://coqui.ai/blog/tts/cpml
