# CoRal-project/roest-v3-chatterbox-500m

## Resumen

Røst-v3-chatterbox-500m es un modelo de síntesis de voz (text-to-speech) en danés, desarrollado por el Alexandra Institute dentro del proyecto CoRal. Se trata de un ajuste fino (finetune) del modelo multilingüe Chatterbox de ResembleAI, que emplea un backbone de Llama de 0,5 mil millones de parámetros y fue entrenado originalmente con más de 500 000 horas de habla en 23 idiomas. El finetune añade más de 2000 horas de habla danesa, lo que lo convierte en una opción de referencia para síntesis de voz en danés de código abierto.

El modelo soporta clonación de voz zero-shot con tan solo 10 segundos de audio de referencia y es compatible con la librería Chatterbox, lo que facilita su integración. Incluye dos voces predefinidas (Mic y Nic) y produce salidas con marca de agua. Su relevancia actual radica en ser uno de los pocos modelos TTS daneses de alta calidad con licencia abierta, con una puntuación MOS de 4,23 sobre 5 en evaluación con hablantes nativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox (modelo de lenguaje de audio-token basado en Llama) |
| Parametros totales | 0,5 mil millones (backbone Llama) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Danés (principal), inglés con acento danés (limitado) |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors (según código de ejemplo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Chatterbox de ResembleAI, que combina un backbone de lenguaje Llama de 0,5B con un decodificador de audio-token. El entrenamiento original de Chatterbox Multilingual utilizó más de 500 000 horas de habla multilingüe de alta calidad en 23 idiomas, incluyendo danés. Posteriormente, el proyecto CoRal realizó un finetune con más de 2000 horas de habla danesa procedente de los datasets CoRal-project/coral-tts, alexandrainst/nota, alexandrainst/ftspeech y alexandrainst/nst-da. No se menciona el uso de RLHF o DPO; el ajuste es supervisado. El modelo conserva la capacidad de clonación de voz zero-shot y la generación de salidas con marca de agua de la librería Chatterbox.

## Capacidades

- Síntesis de voz en danés con alta naturalidad (MOS 4,23).
- Clonación de voz zero-shot a partir de un prompt de audio de al menos 10 segundos.
- Dos voces predefinidas (Mic y Nic) optimizadas para el dataset CoRal-tts.
- Compatible con la librería Chatterbox, lo que permite integración sencilla y salidas con marca de agua.
- Generación de audio en formato WAV a través de la API de Chatterbox.
- Soporte básico de inglés, aunque con un acento danés marcado.
- No soporta control de intensidad o exageración (limitación del dataset de finetune).
- No maneja textos largos; se recomienda dividir el texto en frases para obtener mejores resultados.

## Casos de uso

- Audiolibros en danés: el modelo puede leer capítulos completos con voz natural, aunque se recomienda dividir el texto en frases para evitar degradación en pasajes largos. Su calidad MOS de 4,23 lo hace adecuado para producción editorial.
- Asistentes de voz para aplicaciones danesas: integrable en asistentes virtuales o interfaces de voz para servicios locales, aprovechando la clonación de voz para personalizar el tono.
- Accesibilidad para personas con discapacidad visual: conversión de contenido escrito (noticias, documentos) a audio en danés, con opción de usar voces predefinidas o clonadas.
- Doblaje de contenido multimedia: generación de locuciones para vídeos, presentaciones o material educativo en danés, con control de la voz mediante prompts de audio.
- Sistemas de respuesta interactiva (IVR): uso en centralitas telefónicas o sistemas de atención al cliente en danés, donde la baja latencia y la calidad de voz son críticas.
- Herramientas educativas para aprendizaje de idiomas: generación de ejemplos de pronunciación danesa para estudiantes, con la posibilidad de clonar la voz del profesor para mantener consistencia.
- Generación de contenido para podcasts o noticias: creación de locuciones automáticas para boletines informativos o resúmenes de audio, con voces naturales y personalizables.

## Benchmarks y rendimiento

El modelo fue evaluado mediante Mean Opinion Score (MOS) con un panel de 20 hablantes nativos de danés. Se utilizaron 10 muestras para cada uno de los dos hablantes (Mic y Nic), generadas con temperatura 0,7, top_p 0,95 y top_k 600. El resultado fue una puntuación media de 4,23 sobre 5.

| Metrica | Valor |
|---|---|
| MOS (escala 1-5) | 4,23 |
| Panel de evaluacion | 20 hablantes nativos daneses |
| Muestras evaluadas | 10 por hablante (Mic y Nic) |
| Parametros de generacion | temp=0,7, top_p=0,95, top_k=600 |

No se han publicado comparaciones con otros modelos TTS en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM. El tamaño del repositorio es de 5,4 GB, lo que sugiere pesos en fp32 o fp16.
- Al tratarse de un modelo de 0,5B, es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o superior, aunque no hay datos confirmados.
- El código de ejemplo permite ejecutar en CPU (device="cpu"), aunque la inferencia será más lenta.
- Opciones de despliegue: la librería Chatterbox es la vía principal; también se puede usar a través de contenedores Docker (como en el proyecto roest-dotnet) o mediante el framework de finetuning coral_chatterbox.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (TTS danés). El modelo base Chatterbox Multilingual es su referencia directa, pero no se han publicado métricas comparativas entre ambos. Se recomienda consultar el panorama de TTS en danés en el documento tts-landscape.md del proyecto roest-dotnet para una visión más amplia.

## Limitaciones y advertencias

- El modelo solo soporta danés e inglés con un acento danés muy marcado; no es adecuado para otros idiomas.
- No soporta control de intensidad o exageración en la voz, a diferencia del Chatterbox original.
- No maneja bien textos largos; se recomienda dividir el texto en frases para evitar degradación en la calidad.
- La clonación de voz requiere un prompt de audio de al menos 10 segundos; con menos tiempo, la calidad puede verse afectada.
- La licencia OpenRAIL implica restricciones de uso responsable, como evitar la generación de contenido engañoso o ilegal. Es necesario revisar los términos completos antes de un uso comercial.
- No se han documentado sesgos específicos, pero al estar entrenado con datos daneses, puede reflejar variaciones dialectales o demográficas presentes en los datasets.
- El modelo produce salidas con marca de agua, lo que puede ser una limitación si se requiere audio sin marcas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CoRal-project/roest-v3-chatterbox-500m
- Repositorio de finetuning (coral_chatterbox): https://github.com/alexandrainst/coral_chatterbox
- Implementación de streaming para textos largos: https://github.com/davidbrowne17/chatterbox-streaming
- Proyecto roest-dotnet (integración en .NET): https://github.com/yury-opolev/roest-dotnet
- Documento de panorama TTS en danés: https://github.com/yury-opolev/roest-dotnet/blob/main/docs/tts-landscape.md
