# Phoonnx/styletts2-en_gh-poto_kokoro

## Resumen

styletts2-en_gh-poto_kokoro es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por GhanaNLP y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo deriva del checkpoint upstream `ghananlpcommunity/poto-tts-kokoro-gh` y esta especializado en ingles de Ghana (`en-GH`), una variedad regional del ingles hablado en Ghana. Su publicacion responde a la necesidad de voces TTS ligeras, ejecutables en local y con licencia permisiva para aplicaciones de sintesis de voz en entornos con recursos limitados.

El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La entrada de texto se realiza mediante fonemas espeak en alfabeto IPA, generados a traves de espeak-ng o del port espyak, y el modelo se integra en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. Es relevante para desarrolladores que necesitan una voz TTS inglesa de variante ghanesa, ejecutable sin GPU dedicada y con un pipeline de fonemizacion bien definido.

La ficha se basa exclusivamente en la informacion disponible en el repositorio de Hugging Face y la model card; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ingles de Ghana (`en-GH`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz que combina un encoder de estilo y un decoder basado en difusion para generar habla natural. El modelo empaquetado conserva la arquitectura del checkpoint upstream de GhanaNLP, exportado a ONNX para inferencia con phoonnx. No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o ajuste fino especifico en la model card proporcionada.

La innovacion principal del empaquetado es la integracion de un front-end de texto basado en `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak en IPA antes de la sintesis. La model card advierte que el uso del port espyak en lugar de espeak-ng puede producir diferencias foneticas y errores de pronunciacion en algunas palabras, por lo que se recomienda instalar espeak-ng nativo.

## Capacidades

- Sintesis de voz a partir de texto en ingles de Ghana (`en-GH`).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada mediante espeak-ng o espyak, con normalizacion de texto a cargo de scriptconv.
- Integracion con el ecosistema OVOS a traves de `ovos-tts-plugin-phoonnx`.
- Ejecucion en local sin dependencia de servicios en la nube.
- No se documentan capacidades de clonacion de voz, control de estilo, multilinguismo ni tool calling.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS en `mycroft.conf`, permitiendo sintetizar respuestas habladas en ingles de Ghana dentro de asistentes domesticos o embebidos.
- Aplicaciones de accesibilidad: lectura en voz alta de contenido textual para usuarios con discapacidad visual, ejecutable en local y sin coste por peticion gracias a la licencia Apache 2.0.
- Sistemas de informacion publica en Ghana: generacion de anuncios y avisos hablados en la variante local del ingles, con pronunciacion adaptada a la region.
- Prototipado rapido de interfaces conversacionales: el pipeline `TTSModelManager` de phoonnx permite cargar la voz y generar WAV en pocas lineas de Python, adecuado para pruebas de concepto.
- Educacion y aprendizaje de idiomas: sintesis de frases en ingles ghanes para materiales didacticos o ejercicios de escucha.
- Despliegue en dispositivos con recursos limitados: el tamano de 0,4 GB y el formato ONNX facilitan la inferencia en CPU o en hardware modesto, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el formato ONNX y el tamano de 0,4 GB sugieren ejecucion viable en CPU.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; requiere espeak-ng o el extra `phoonnx[espeak]` con espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| styletts2-en_gh-poto_kokoro | StyleTTS2 | en-GH | ONNX | Apache 2.0 | Empaquetado para phoonnx; 0,4 GB |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | variable | ONNX | variable | Misma libreria de inferencia; voces adicionales en la coleccion |
| Checkpoint upstream `ghananlpcommunity/poto-tts-kokoro-gh` | StyleTTS2 | en-GH | no disponible | Apache 2.0 | Origen del modelo empaquetado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles de Ghana (`en-GH`); no se documenta soporte para otras variedades del ingles ni otros idiomas.
- La fonemizacion con espyak puede producir pronunciaciones incorrectas en algunas palabras; se recomienda espeak-ng nativo.
- No se dispone de informacion sobre sesgos, calidad de sintesis ni tasas de error en la model card.
- Riesgo de alucinacion no aplica en el sentido generativo de texto, pero no se documenta la fidelidad de la sintesis en textos fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la declaracion del checkpoint upstream; conviene verificar la model card original.
- No se documentan limitaciones de longitud de entrada ni de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_gh-poto_kokoro
- Checkpoint upstream: https://huggingface.co/ghananlpcommunity/poto-tts-kokoro-gh
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
