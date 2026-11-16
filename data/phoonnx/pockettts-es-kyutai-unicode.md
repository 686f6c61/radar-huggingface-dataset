# Phoonnx/pockettts-es-kyutai-unicode

## Resumen

pockettts-es-kyutai-unicode es un modelo de sintesis de voz (text-to-speech) en espanol desarrollado originalmente por Kyutai dentro de su familia Pocket TTS, y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo resuelve el problema de convertir texto en castellano a audio hablado en entornos locales y ligeros, ya que se distribuye en formato ONNX y esta pensado para ejecutarse sin dependencias de GPU de gran tamano. Es relevante ahora porque permite integrar TTS en espanol en asistentes de voz y aplicaciones embebidas (OVOS, asistentes locales) con una licencia permisiva CC-BY-4.0.

El modelo se apoya en la arquitectura Pocket TTS y acepta como entrada los puntos de codigo Unicode del texto, procesados por el fonemizador `UnicodeCodepointPhonemizer` de la libreria scriptconv. El repositorio ocupa 0,8 GB e incluye 26 voces en espanol identificadas con nombres como `alba`, `anna`, `cosette` o `javert`. La informacion publica no detalla el numero de parametros ni la longitud de contexto, por lo que esos datos se indican como no disponibles.

La ficha se centra en lo que la model card y los metadatos de Hugging Face permiten afirmar. No se han publicado resultados de benchmarks ni especificaciones de entrenamiento en la informacion disponible, por lo que el lector debe tratar las secciones correspondientes como descriptivas del empaquetado y del uso previsto, no como una evaluacion cuantitativa del rendimiento acustico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (modelo de sintesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX) |
| Idiomas soportados | es (espanol) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Pipeline | text-to-speech |
| Entrada de texto | puntos de codigo Unicode del texto |
| Voces incluidas | 26 voces en espanol (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera) |
| Tamano del repositorio | 0,8 GB |
| Libreria | phoonnx |
| Autor del empaquetado | Phoonnx |
| Autor upstream | Kyutai |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura como Pocket TTS, un modelo de sintesis de voz de Kyutai, pero no detalla su diseno interno (tipo de red, capas, atencion, decodificador acustico o vocoder). Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones. El modelo se distribuye como conversion ONNX realizada por KevinAHM a partir de `kyutai/pocket-tts/languages/spanish`, y Phoonnx lo empaqueta para su libreria.

La innovacion tecnica destacable en este empaquetado es el front-end de texto: phoonnx delega la normalizacion y conversion en scriptconv, que aplica el `UnicodeCodepointPhonemizer` para transformar el texto en puntos de codigo Unicode que el modelo consume directamente. Este diseno simplifica la integracion en pipelines de TTS y evita dependencias de fonemizadores especificos del idioma. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Sintesis de voz en espanol a partir de texto, con salida en formato WAV mediante `synthesize_wav`.
- 26 voces en espanol disponibles, lo que permite seleccionar timbre y estilo por identidad de voz.
- Procesamiento de texto basado en puntos de codigo Unicode, sin fonemizador dependiente del idioma.
- Ejecucion en formato ONNX, apta para despliegue local y en entornos con recursos limitados.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No se documentan capacidades multilingues mas alla del espanol.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS a traves de `ovos-tts-plugin-phoonnx` y permite que un asistente domestico responda en espanol sin enviar texto a la nube, usando las voces `pockettts/es/*` configuradas en `mycroft.conf`.
- Lectura de notificaciones y alertas: aplicaciones de escritorio o moviles pueden sintetizar mensajes cortos en espanol con una voz concreta, gracias al formato ONNX y al bajo peso del repositorio (0,8 GB).
- Accesibilidad para personas con discapacidad visual: un lector de pantalla puede convertir texto de interfaz en audio en espanol seleccionando entre las 26 voces disponibles para adaptar el timbre al usuario.
- Sistemas de megafonia y anuncios automatizados: comercios, transporte o edificios publicos pueden generar anuncios pregrabados o dinamicos en castellano con una voz consistente, evitando costes de grabacion.
- Prototipado de interfaces conversacionales: desarrolladores que construyen bots de voz pueden validar flujos de dialogo en espanol con TTS local antes de invertir en servicios comerciales, usando la API de phoonnx y el fonemizador Unicode.
- Educacion y aprendizaje de idiomas: aplicaciones de practica de pronunciacion o lectura asistida pueden reproducir frases en espanol con distintas voces para exponer al estudiante a variaciones de timbre.
- Generacion de contenido audiovisual: creadores pueden producir narraciones en espanol para videos o podcasts con una voz seleccionable, integrando el modelo en scripts de Python mediante `TTSModelManager`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB en disco y se distribuye en ONNX, lo que sugiere un modelo ligero, pero no se confirma el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de TTS, es plausible su ejecucion en CPU, pero la informacion no lo confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: libreria phoonnx (Python) y plugin OVOS `ovos-tts-plugin-phoonnx`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| pockettts-es-kyutai-unicode | no disponible | no disponible | es | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| Alternativas de TTS en espanol | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni del dataset de entrenamiento; se desconoce su comportamiento ante acentos regionales, genero o registros formales e informales.
- Riesgo de alucinacion acustica: como todo modelo de TTS, puede producir pronunciaciones incorrectas o prosodia artificial en palabras poco frecuentes, siglas o numeros, especialmente al usar un fonemizador basado en puntos de codigo Unicode.
- Limitacion de idioma: el modelo solo declara soporte para espanol; no se garantiza un comportamiento adecuado en otras lenguas o en texto mixto.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero exige citar la autoría (Kyutai y el empaquetado de Phoonnx); conviene revisar los terminos exactos antes de distribuirlo en productos.
- No se dispone de informacion sobre la calidad acustica, la naturalidad ni la inteligibilidad del modelo, ni sobre su robustez ante textos largos o caracteres especiales.
- El modelo depende de la libreria phoonnx y de scriptconv, ambas de TigreGotico; cambios en estas dependencias pueden afectar a la integracion.
- El reducido numero de descargas (17) y la ausencia de likes sugieren poca validacion por parte de la comunidad; conviene evaluar el modelo en el caso de uso concreto antes de llevarlo a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-es-kyutai-unicode
- Modelo upstream (Kyutai, espanol): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/spanish
- Conversion ONNX (KevinAHM): https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/spanish
- Coleccion Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
