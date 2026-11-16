# Phoonnx/vits-tw_gh-asante_openbible-graphemes

## Resumen

`vits-tw_gh-asante_openbible-graphemes` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo esta especializado en la variante asante del idioma twi (`tw-GH`), hablado principalmente en Ghana, y fue entrenado sobre el corpus OpenBible. Resuelve el problema de la sintesis de voz para una lengua de bajos recursos, donde apenas existen sistemas TTS de calidad disponibles.

La relevancia actual del modelo radica en su caracter de recurso para lenguas minoritarias: al estar empaquetado en ONNX y distribuido bajo licencia CC-BY-SA-4.0, puede integrarse en asistentes de voz, sistemas de accesibilidad y aplicaciones de OVOS sin depender de infraestructura propietaria. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace ligero y desplegable en entornos con recursos limitados.

El modelo emplea una entrada basada en grafemas (caracteres del texto) mediante el `GraphemePhonemizer` de la libreria `scriptconv`, sin necesidad de un diccionario fonetico especifico. Su pipeline es `text-to-speech` y su libreria nativa es `phoonnx`, aunque los pesos subyacentes provienen de Coqui TTS v0.6.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | twi, variante asante (`tw-GH`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. Genera directamente la forma de onda, evitando etapas intermedias de vocoder separadas. La entrada del modelo son caracteres del texto (grafemas) procesados por el `GraphemePhonemizer` de `scriptconv`, que normaliza el texto y lo convierte en la secuencia de entrada del modelo.

El modelo fue entrenado por Coqui sobre el corpus OpenBible en la variante asante del twi, segun se indica en la model card. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni sobre el uso de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. El empaquetado para `phoonnx` convierte los pesos originales de Coqui TTS v0.6.2 a formato ONNX para su ejecucion en Python y en OVOS.

## Capacidades

- Sintesis de voz a partir de texto en twi (variante asante, `tw-GH`).
- Entrada basada en grafemas: no requiere diccionario fonetico externo.
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecucion en Python mediante `phoonnx.model_manager.TTSModelManager`.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo thinking; no disponibles.

## Casos de uso

- **Asistentes de voz en twi para OVOS**: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en twi asante dentro de un asistente domestico o de escritorio.
- **Accesibilidad para hablantes de twi**: conversion de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a comunidades ghanesas que usan la variante asante.
- **Locucion automatizada de contenido biblico**: dado que el corpus de entrenamiento es OpenBible, el modelo es adecuado para narrar pasajes y materiales religiosos en twi con una voz coherente con el dominio de entrenamiento.
- **Aplicaciones educativas en lenguas locales**: generacion de audio para materiales de aprendizaje de twi, aprovechando la entrada por grafemas para pronunciar texto escrito sin transcripcion fonetica manual.
- **Sistemas de megafonia y avisos automatizados**: sintesis de anuncios breves en twi para entornos con recursos limitados, gracias al tamano reducido del repositorio (0,1 GB) y al formato ONNX.
- **Investigacion en TTS para lenguas de bajos recursos**: uso como linea base reproducible para comparar tecnicas de sintesis en twi, al estar disponible el empaquetado ONNX y la referencia al modelo original de Coqui.
- **Prototipado de interfaces conversacionales multilingues**: incorporacion del modelo como una voz mas dentro de un pipeline TTS que seleccione el idioma segun la entrada del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (0,1 GB) sugiere un modelo ligero que probablemente cabe en GPUs consumer, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS; ejecucion mediante ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `vits-tw_gh-asante_openbible-graphemes` (este) | VITS | tw-GH | CC-BY-SA-4.0 | ONNX | Hugging Face, 21 descargas |
| Otros modelos de la coleccion VITS de Phoonnx | VITS | varios | segun modelo | ONNX | Hugging Face |
| Modelo original Coqui `tts_models--tw_asante--openbible--vits` | VITS | tw-GH | CC-BY-SA-4.0 | Coqui TTS | GitHub releases de Coqui |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta twi en su variante asante (`tw-GH`); no es multilingue.
- Al estar entrenado sobre OpenBible, el dominio y el estilo de voz pueden estar sesgados hacia el registro biblico y no generalizar bien a otros registros.
- Riesgo de alucinacion acustica y pronunciacion incorrecta en palabras fuera del vocabulario o en grafemas poco frecuentes; no se documenta evaluacion al respecto.
- La licencia CC-BY-SA-4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la redistribucion.
- No se documentan sesgos demograficos ni de genero en la informacion disponible.
- No hay datos publicados de benchmarks ni de latencia, lo que dificulta estimar su calidad en produccion.
- El modelo depende de las librerias `phoonnx` y `scriptconv` para su ejecucion; no se garantiza compatibilidad con otros runtimes TTS.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-tw_gh-asante_openbible-graphemes)
- [Modelo original de Coqui TTS v0.6.2](https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--tw_asante--openbible--vits.zip)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
