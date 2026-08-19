# mazodan/Omnivoice-filipino-RSLoRA-Merged

## Resumen

El modelo `mazodan/Omnivoice-filipino-RSLoRA-Merged` es un adaptador LoRA específico para el idioma filipino (tagalo), desarrollado sobre el modelo base `k2-fsa/OmniVoice`, un sistema de síntesis de voz y clonación de voz de código abierto que soporta más de 600 idiomas. Este adaptador ha sido entrenado con dos conjuntos de datos de habla filipina (`SilencioNetwork/tagalog-filipino-speech` y `KarlShane11/handsfree-filipino-speech-combined`) y está fusionado (merged) en el modelo base, lo que permite mejorar la calidad de la síntesis y la clonación de voz en este idioma concreto.

El problema que resuelve es la calidad subóptima que suelen presentar los modelos multilingües al sintetizar idiomas con pocos recursos, como el filipino. Al especializar el adaptador en tagalo, se obtiene una pronunciación y entonación más naturales, manteniendo las capacidades de clonación de voz y diseño de voz del modelo original. Su relevancia actual radica en la creciente demanda de voces sintéticas en idiomas de baja representación, especialmente para aplicaciones de accesibilidad, doblaje y asistentes de voz.

El adaptador tiene 612.577.288 parámetros (el tamaño del adaptador, no del modelo completo) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación. El repositorio pesa 3,3 GB y los pesos están en formato safetensors, listos para usar con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OmniVoice (modelo de difusión para TTS) |
| Parametros totales | 612.577.288 (adaptador LoRA; el modelo base no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tl (tagalo/filipino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PEFT) |

## Arquitectura y entrenamiento

OmniVoice, el modelo base, emplea una arquitectura de diffusion language model para generar audio de alta calidad, según la documentación oficial. El adaptador `RSLoRA-Merged` aplica una variante de LoRA (posiblemente Rank-Stabilized LoRA, aunque no se confirma en la información disponible) sobre este modelo, y los pesos del adaptador ya están fusionados en el modelo base, lo que facilita su uso directo sin cargar por separado el adaptador.

El entrenamiento se realizó sobre dos datasets de habla filipina: `SilencioNetwork/tagalog-filipino-speech` y `KarlShane11/handsfree-filipino-speech-combined`. No se dispone de información sobre el número de tokens, épocas, configuración de hiperparámetros ni técnicas de alineación (RLHF, DPO, etc.). El adaptador se ha creado con la librería PEFT y se publica en formato safetensors.

## Capacidades

- Síntesis de voz en filipino (tagalo) a partir de texto, con mejora de pronunciación y entonación respecto al modelo base multilingüe.
- Clonación de voz zero-shot: permite replicar una voz a partir de una muestra de audio corta, manteniendo las características del hablante.
- Diseño de voz (voice design): posibilidad de crear voces sintéticas a partir de descripciones textuales, heredada del modelo base OmniVoice.
- Soporte multilingüe parcial: al estar basado en OmniVoice, conserva la capacidad de sintetizar en otros idiomas, aunque el adaptador está especializado en filipino.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Audiolibros en filipino: el modelo puede generar narraciones fluidas y naturales para libros y artículos largos, aprovechando la mejora en pronunciación del tagalo.
- Doblaje de vídeos y contenido multimedia: permite doblar vídeos, series o anuncios al filipino con voces clonadas de actores o locutores, reduciendo costes de producción.
- Asistentes de voz para aplicaciones locales: integrable en asistentes virtuales, chatbots de voz o sistemas de IVR en filipino, ofreciendo respuestas habladas con acento y entonación adecuados.
- Accesibilidad para personas con discapacidad visual: lectura de textos en filipino (pantallas, documentos) mediante síntesis de voz de alta calidad.
- Creación de contenido educativo: generación de lecciones, podcasts o material didáctico en filipino, con voces clonadas de profesores o narradores para mantener coherencia.
- Videojuegos y animación: clonación de voces de personajes para localización al filipino, permitiendo mantener la voz original del actor en diferentes idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware para este adaptador.
- Al ser un adaptador sobre OmniVoice, los requisitos dependen del modelo base, que no se detalla en la ficha. Se recomienda consultar la documentación de `k2-fsa/OmniVoice` para conocer la VRAM necesaria.
- Dado que OmniVoice es un modelo de difusión, es previsible que requiera una GPU con al menos 8-12 GB de VRAM para inferencia en tiempo real, aunque no se confirma.
- Opciones de despliegue: al estar en formato PEFT/safetensors, puede cargarse con librerías como Transformers, PEFT y Diffusers. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama, que son más habituales para modelos de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| mazodan/Omnivoice-filipino-RSLoRA-Merged | Adaptador LoRA sobre OmniVoice | Filipino (tl) | Apache-2.0 | Abierto, descargable |
| k2-fsa/OmniVoice (base) | TTS de difusión multilingüe | 600+ idiomas | Apache-2.0 | Abierto, descargable |
| ElevenLabs (Filipino) | TTS propietario | Filipino y otros | Propietaria | API comercial |
| cvoice.ai (voces filipinas) | TTS propietario | Filipino | Propietaria | API comercial |

No se dispone de datos de rendimiento comparativos (MOS, WER, etc.) entre estos sistemas. La principal ventaja del adaptador es su naturaleza abierta y su especialización en filipino, frente a soluciones comerciales cerradas.

## Limitaciones y advertencias

- El adaptador se ha entrenado con dos datasets específicos de habla filipina, por lo que puede presentar sesgos hacia los acentos o dialectos representados en esos datos, y un rendimiento inferior en variantes regionales no cubiertas.
- Al ser un modelo de síntesis de voz, existe riesgo de alucinación en la pronunciación de palabras poco comunes, nombres propios o términos técnicos, especialmente si no aparecen en los datos de entrenamiento.
- La calidad de la clonación de voz depende de la muestra de audio proporcionada; muestras de baja calidad o con ruido pueden degradar el resultado.
- No se ha evaluado formalmente el modelo en términos de sesgos de género, edad o etnia; se recomienda auditar el sistema antes de un despliegue en producción.
- La licencia Apache-2.0 permite uso comercial, pero es necesario cumplir con los términos de la licencia del modelo base OmniVoice (también Apache-2.0) y de los datasets utilizados, que pueden tener restricciones adicionales.
- No se dispone de información sobre latencia, throughput ni consumo de memoria en inferencia, por lo que se recomienda realizar pruebas de rendimiento en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mazodan/Omnivoice-filipino-RSLoRA-Merged
- Modelo base OmniVoice: https://huggingface.co/k2-fsa/OmniVoice
- Repositorio GitHub de OmniVoice: https://github.com/k2-fsa/OmniVoice
- Sitio web de OmniVoice: https://omnivoice.app/
- Dataset `SilencioNetwork/tagalog-filipino-speech`: https://huggingface.co/datasets/SilencioNetwork/tagalog-filipino-speech
- Dataset `KarlShane11/handsfree-filipino-speech-combined`: https://huggingface.co/datasets/KarlShane11/handsfree-filipino-speech-combined
