# Phoonnx/vits-sr_rs-serbski_institut-medium-espeak

## Resumen

vits-sr_rs-serbski_institut-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la voz `sr/sr_RS/serbski_institut/medium` del repositorio piper-voices, y ha sido reempaquetado en formato ONNX para su uso con la libreria phoonnx, que lo ejecuta tanto en Python como en el entorno de asistentes de voz OVOS.

El modelo esta especializado en serbio de Serbia (`sr-RS`) y utiliza fonemas espeak en alfabeto IPA como entrada de texto, lo que requiere la instalacion de espeak-ng o del port espyak para el front-end fonemico. Se trata de una voz de tamano "medium" dentro de la familia Piper, lo que la situa en un punto intermedio entre calidad y requisitos computacionales, adecuada para despliegue en entornos con recursos limitados.

Su relevancia actual radica en que proporciona sintesis de voz en serbio dentro de un ecosistema abierto (licencia MIT) y con un formato de pesos ONNX optimizado para inferencia en CPU, lo que facilita su integracion en asistentes de voz offline y aplicaciones de lectura en voz alta sin dependencia de servicios en la nube. El repositorio tiene un tamano de 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | serbio de Serbia (`sr-RS`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un decoder basado en normalizing flows y un discriminador adversarial para producir audio de forma directa a partir de fonemas, sin necesidad de un vocoder separado. Esta arquitectura es la utilizada por la familia Piper de Rhasspy para sintesis de voz ligera y desplegable en CPU.

El modelo original fue entrenado por Rhasspy como parte de piper-voices para la variante `sr_RS/serbski_institut/medium`. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no proporciona esos datos. El empaquetado realizado por Phoonnx consiste en la conversion del modelo a formato ONNX y su integracion con el front-end fonemico de scriptconv mediante el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Sintesis de voz (text-to-speech) en serbio de Serbia (`sr-RS`) a partir de texto plano.
- Conversion de texto a fonemas espeak en alfabeto IPA como paso previo a la sintesis.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, que soporta voces VITS con entrada espeak o unicode.
- Inferencia en formato ONNX, adecuada para despliegue en CPU.
- No dispone de tool calling, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz offline en serbio: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para proporcionar respuestas habladas en serbio sin conexion a Internet, gracias a su formato ONNX y su licencia MIT.
- Lectura en voz alta de contenido textual: aplicaciones de accesibilidad o lectores de articulos pueden convertir texto serbio en audio WAV con la API `synthesize_wav`, adecuada para generar ficheros de audio de forma programatica.
- Sistemas de anuncios automatizados: en entornos como transporte publico o comercios, el modelo puede generar anuncios pregrabados en serbio a partir de plantillas de texto, con bajo coste computacional por su tamano reducido (0,1 GB).
- Integracion en pipelines de CI/CD para generacion de locuciones: los equipos de desarrollo pueden generar ficheros de audio de prueba o material de demostracion en serbio de forma automatizada dentro de sus flujos de integracion.
- Aplicaciones web con sintesis en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para ofrecer sintesis de voz en serbio sin backend, util en aplicaciones educativas o de aprendizaje de idiomas.
- Prototipado de interfaces conversacionales: investigadores pueden desplegar rapidamente una voz serbia en entornos de prueba con phoonnx y espeak-ng, evaluando la calidad de la sintesis antes de optar por soluciones comerciales.
- Generacion de audiolibros o podcasts automatizados: el modelo puede sintetizar fragmentos de texto largos por lotes, generando ficheros WAV que posteriormente se concatenan, con la ventaja de una licencia permisiva para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera que opere en CPU sin GPU dedicada, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia en CPU segun el ecosistema Piper/phoonnx.
- Compatibilidad con GPU de consumo: no disponible; por su tamano reducido es probable que quepa en cualquier GPU de consumo, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-sr_rs-serbski_institut-medium-espeak (este modelo) | VITS | sr-RS | MIT | ONNX | 0,1 GB |
| Otras voces Piper de piper-voices | VITS | multiidioma | MIT (segun upstream) | ONNX | variable |
| Modelos TTS comerciales (p. ej. servicios cloud) | no disponible | multiidioma | propietaria | API | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre este modelo y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta serbio de Serbia (`sr-RS`); no es multilingue.
- La entrada debe ser texto en serbio; el front-end fonemico depende de espeak-ng o espyak, y algunos fonemas de espyak difieren de espeak-ng, lo que puede provocar errores de pronunciacion en ciertas palabras.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la calidad de la voz en dominios especificos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en texto no normalizado correctamente.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo upstream en rhasspy/piper-voices, ya que la model card indica que el upstream declara MIT.
- El repositorio no registra descargas ni likes, lo que puede indicar una validacion limitada por parte de la comunidad.
- No se proporcionan datos sobre latencia, throughput ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad para produccion sin pruebas propias.

## Enlaces

- [Hugging Face: Phoonnx/vits-sr_rs-serbski_institut-medium-espeak](https://huggingface.co/Phoonnx/vits-sr_rs-serbski_institut-medium-espeak)
- [Upstream: rhasspy/piper-voices/sr/sr_RS/serbski_institut/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/sr/sr_RS/serbski_institut/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
