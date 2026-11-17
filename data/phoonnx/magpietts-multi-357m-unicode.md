# Phoonnx/magpietts-multi-357m-unicode

## Resumen

magpietts-multi-357m-unicode es un modelo de síntesis de voz (text-to-speech) derivado de nvidia/magpie_tts_multilingual_357m, desarrollado originalmente por NVIDIA y empaquetado en formato ONNX por Phoonnx para su uso con la librería phoonnx. El modelo resuelve la conversión de texto a audio en cinco idiomas (árabe, francés, italiano, coreano y vietnamita) con un único checkpoint de 357 millones de parámetros, lo que simplifica el despliegue multilingüe frente a mantener un modelo por idioma.

La arquitectura es Magpie TTS, un sistema neuronal de síntesis de voz de NVIDIA. El empaquetado de Phoonnx expone 25 voces predefinidas (cinco hablantes —Aria, Jason, John, Leo y Sofia— por cada uno de los cinco idiomas) y utiliza una entrada basada en puntos de código Unicode del texto, gestionada mediante la librería scriptconv para la normalización y conversión del texto de entrada.

Su relevancia actual radica en la disponibilidad de un modelo TTS multilingüe en ONNX, ejecutable sin dependencias de frameworks propietarios y con integración directa en OVOS (Open Voice OS) a través del plugin ovos-tts-plugin-phoonnx. El repositorio ocupa 2,6 GB y acumula 923 descargas en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Magpie TTS (NVIDIA) |
| Parámetros totales | 357 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ar, fr, it, ko, vi |
| Licencia | other (nvidia-open-model-license, según el modelo upstream) |
| Formato de pesos | ONNX |
| Pipeline | text-to-speech |
| Entrada de texto | puntos de código Unicode del texto |
| Voces disponibles | 25 (5 hablantes × 5 idiomas) |
| Tamaño del repositorio | 2,6 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de Magpie TTS más allá de su nombre y su naturaleza como sistema neuronal de síntesis de voz. El modelo es una conversión a ONNX del checkpoint nvidia/magpie_tts_multilingual_357m, con 357 millones de parámetros, lo que lo sitúa en la gama media de modelos TTS neuronales.

El front-end de texto de phoonnx delega en scriptconv la normalización y conversión del texto: el fonemizador empleado es `UnicodeCodepointPhonemizer` (de `scriptconv.phonemizers.base`), que transforma el texto en puntos de código Unicode como entrada del modelo. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en árabe, francés, italiano, coreano y vietnamita con un único modelo.
- Cinco voces por idioma (Aria, Jason, John, Leo y Sofia), lo que permite seleccionar el timbre según el caso de uso.
- Entrada de texto basada en puntos de código Unicode, gestionada por el fonemizador `UnicodeCodepointPhonemizer` de scriptconv.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecución mediante ONNX Runtime, sin dependencia de frameworks de deep learning propietarios.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente text-to-speech.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin de TTS seleccionando la voz en `mycroft.conf` (por ejemplo, `magpie/Aria/ar`), de modo que un asistente doméstico puede responder en árabe, francés, italiano, coreano o vietnamita con una sola instalación.
- Lectura de contenido en aplicaciones móviles: la conversión a ONNX permite embeber el modelo en apps que necesitan leer artículos o notificaciones en varios idiomas sin depender de servicios en la nube.
- Audiolibros y narración automatizada: las cinco voces por idioma permiten asignar timbres distintos a personajes o secciones, generando WAV directamente mediante `synthesize_wav`.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces y documentos en los cinco idiomas soportados, con despliegue local que evita enviar texto a servidores externos.
- Localización de contenidos multimedia: generación de pistas de voz en francés, italiano, árabe, coreano y vietnamita para vídeos o cursos, usando la misma voz o combinando hablantes.
- Sistemas de megafonía y avisos automatizados: anuncios en estaciones, aeropuertos o comercios en los idiomas cubiertos, con inferencia ONNX de baja dependencia y despliegue en hardware modesto.
- Prototipado de interfaces conversacionales: pruebas rápidas de UX de voz en varios idiomas con la API de phoonnx antes de invertir en un servicio TTS gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 357 M de parámetros y pesos ONNX, el modelo es ligero en comparación con LLM, pero no se especifica el consumo exacto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repositorio (2,6 GB) sugiere que puede ejecutarse en hardware de gama media, pero no se aportan datos oficiales.
- Opciones de despliegue: phoonnx (Python) con ONNX Runtime; integración en OVOS mediante `ovos-tts-plugin-phoonnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos TTS alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia es "other" y el modelo upstream declara nvidia-open-model-license; es necesario revisar los términos exactos de dicha licencia antes de un uso comercial.
- Solo cubre cinco idiomas (árabe, francés, italiano, coreano y vietnamita); no incluye castellano ni inglés.
- No se dispone de información sobre sesgos, riesgo de alucinación o calidad de la prosodia por idioma.
- El modelo depende de la librería phoonnx (instalación con `pip install --pre phoonnx`) y de scriptconv para el front-end de texto, lo que añade dependencias al despliegue.
- Al ser una conversión a ONNX de un modelo de NVIDIA, las actualizaciones y el soporte dependen de Phoonnx, no del autor original.
- No se documentan límites de longitud de texto de entrada ni comportamiento con textos muy largos.
- La licencia "other" puede imponer restricciones adicionales no detalladas en la model card; conviene consultar el repositorio upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/magpietts-multi-357m-unicode
- Modelo upstream de NVIDIA: https://huggingface.co/nvidia/magpie_tts_multilingual_357m
- Colección Magpie TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/magpie-tts-6af8ecb9458566ddfc4d1ef8
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
