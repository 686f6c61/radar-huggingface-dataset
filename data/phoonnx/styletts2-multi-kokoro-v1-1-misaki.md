# Phoonnx/styletts2-multi-kokoro-v1.1-misaki

## Resumen

styletts2-multi-kokoro-v1.1-misaki es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por hexgrad como parte de Kokoro-82M-v1.1-zh y empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo resuelve la conversion de texto a audio en dos idiomas: ingles (variantes en-GB y en-US) y chino mandarin. Su relevancia actual radica en que ofrece sintesis neuronal de voz de alta calidad con un peso muy reducido (0,1 GB en el repositorio) y licencia Apache 2.0, lo que facilita su integracion en entornos de produccion y en asistentes de voz embebidos.

La ficha corresponde a un artefacto de despliegue, no a un entrenamiento original: Phoonnx toma los pesos de Kokoro-82M-v1.1-zh, los convierte a ONNX y los empaqueta junto con un front-end de texto basado en la libreria scriptconv, que incluye los fonemizadores misaki_en (alfabeto IPA) y misaki_zh (alfabeto bopomofo). El modelo expone un catalogo amplio de voces predefinidas (masculinas y femeninas, en ingles y chino) identificadas con el prefijo `kokoro-v11/`.

Al estar disenado para inferencia ligera y despliegue en CPU mediante ONNX Runtime, este modelo es adecuado para aplicaciones de lectura en voz alta, asistentes de voz locales y sistemas OVOS/Mycroft. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que varios parametros tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible (upstream Kokoro-82M sugiere ~82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | en-GB, en-US, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas misaki_en (IPA) y misaki_zh (bopomofo) |
| Voces incluidas | 100+ voces predefinidas (af_, bf_, zf_, zm_) |
| Libreria de inferencia | phoonnx (ONNX Runtime) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis neuronal de voz que combina un generador acustico con un discriminador de estilo y un decodificador de audio. StyleTTS2 se caracteriza por su entrenamiento adversario con un discriminador de estilo que permite generar habla expresiva y natural sin necesidad de un vocoder separado en algunos despliegues. En este caso, Phoonnx distribuye la version ONNX del modelo, optimizada para inferencia en CPU.

Los datos de entrenamiento originales no estan documentados en la informacion proporcionada. El modelo deriva de Kokoro-82M-v1.1-zh, cuyo nombre sugiere un tamano de aproximadamente 82 millones de parametros, pero no se especifican el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (tecnicas no habituales en TTS). La innovacion tecnica destacable de este empaquetado es la integracion de un front-end de texto completo mediante scriptconv, que normaliza el texto y lo convierte a fonemas IPA (ingles) o bopomofo (chino) antes de la sintesis, y la conversion a ONNX para despliegue portable.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB), ingles estadounidense (en-US) y chino mandarin (zh).
- Seleccion de voz entre un catalogo extenso de mas de 100 voces predefinidas, con identificadores como `kokoro-v11/af_maple`, `kokoro-v11/bf_vale`, `kokoro-v11/zf_001` y `kokoro-v11/zm_009`.
- Normalizacion y conversion de texto a fonemas mediante scriptconv (misaki_en para IPA, misaki_zh para bopomofo).
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura en voz alta de articulos y documentos: el modelo convierte texto plano en audio WAV con voces naturales, adecuado para aplicaciones de accesibilidad y lectores de pantalla que necesitan sintesis local sin dependencia de la nube.
- Asistentes de voz locales (OVOS/Mycroft): mediante el plugin `ovos-tts-plugin-phoonnx`, se configura la voz en `mycroft.conf` y el asistente sintetiza respuestas en ingles o chino sin conexion externa.
- Audiolibros y podcasts automatizados: el catalogo de mas de 100 voces permite asignar voces distintas a personajes o secciones, y la salida WAV se puede posprocesar en pipelines de audio.
- Sistemas de anuncios y megafonia en comercios: la inferencia ONNX en CPU y el reducido tamano del modelo (0,1 GB) permiten desplegarlo en dispositivos de bajo coste para anuncios pregrabados o dinamicos en ingles y chino.
- Prototipado de interfaces conversacionales bilingues: al soportar en-US, en-GB y zh, sirve para validar productos de voz dirigidos a mercados angloparlantes y chinos con un unico modelo.
- Generacion de narraciones para videos y contenido educativo: la sintesis rapida en CPU facilita la produccion por lotes de narraciones en dos idiomas sin infraestructura GPU.
- Pruebas de integracion en pipelines de CI: al ser un artefacto ONNX pequeno y con licencia Apache 2.0, se puede incluir en tests automatizados de sistemas de voz sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo principal, ya que el modelo esta empaquetado en ONNX para ejecucion en CPU; el repositorio ocupa 0,1 GB, por lo que la RAM necesaria es del orden de cientos de MB.
- GPU recomendadas: no disponibles; el despliegue documentado es mediante ONNX Runtime en CPU.
- Compatibilidad con GPU de consumo: no se documenta soporte GPU especifico; al ser ONNX, podria ejecutarse con ONNX Runtime GPU en tarjetas como RTX 4090 o superiores, pero no hay datos publicados.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime como backend.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| styletts2-multi-kokoro-v1.1-misaki (este) | StyleTTS2 | ~82M (upstream) | en-GB, en-US, zh | Apache 2.0 | ONNX | Empaquetado por Phoonnx con front-end scriptconv |
| hexgrad/Kokoro-82M-v1.1-zh | StyleTTS2 | ~82M | en, zh | Apache 2.0 | PyTorch | Modelo upstream original |
| onnx-community/Kokoro-82M-v1.1-zh-ONNX | StyleTTS2 | ~82M | en, zh | Apache 2.0 | ONNX | Conversion ONNX de la comunidad, sin front-end integrado |
| Otros StyleTTS2 de la coleccion Phoonnx | StyleTTS2 | no disponible | variable | Apache 2.0 | ONNX | Misma familia de empaquetados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo entrenado con datos no especificados, pueden existir sesgos de pronunciacion, acento y prosodia segun la voz seleccionada.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones incorrectas, omisiones o artefactos en palabras fuera del vocabulario o en texto no normalizado; el front-end scriptconv mitiga parte del problema pero no lo elimina.
- Limitaciones de contexto o idioma: solo cubre en-GB, en-US y zh; no soporta espanol ni otros idiomas. El texto debe pasar por los fonemizadores misaki_en o misaki_zh, por lo que entradas en otros alfabetos o idiomas no funcionaran correctamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (hexgrad/Kokoro-82M-v1.1-zh) y de los datos de entrenamiento originales, no detallados en esta ficha.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes en Hugging Face en la fecha de la informacion, lo que sugiere poca validacion comunitaria; la libreria phoonnx se instala con `pip install --pre`, indicando estado pre-release. No hay benchmarks publicados que permitan comparar calidad objetiva frente a alternativas.
- Dependencia de la cadena scriptconv y del formato de fonemas: cambios en las versiones de scriptconv o de los fonemizadores pueden alterar la salida de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-multi-kokoro-v1.1-misaki
- Modelo upstream: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Conversion ONNX de la comunidad: https://huggingface.co/onnx-community/Kokoro-82M-v1.1-zh-ONNX
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
