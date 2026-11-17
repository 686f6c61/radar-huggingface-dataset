# arekholko/pocket-tts-coreml

## Resumen

`arekholko/pocket-tts-coreml` es un espejo (mirror) sin modificaciones de la carpeta `phonon/phonon-31m-en` del repositorio `FluidInference/pocket-tts-coreml`. Se trata de un modelo de sintesis de voz (text-to-speech) convertido al formato Core ML de Apple, pensado para ejecutarse de forma nativa en dispositivos y equipos del ecosistema Apple (macOS, iOS, iPadOS) sin necesidad de un runtime de Python. El autor del espejo, arekholko, no es el autor original del modelo: solo replica byte a byte un commit concreto para garantizar la reproducibilidad de las aplicaciones que dependen de esa revision exacta.

El modelo subyacente se identifica como Phonon 31m en su variante inglesa, lo que sugiere un modelo de aproximadamente 31 millones de parametros especializado en sintesis de voz en ingles. El repositorio pesa 0,4 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia. La relevancia actual radica en la posibilidad de integrar TTS de baja latencia en aplicaciones Apple mediante Core ML, con un modelo pequeno que puede ejecutarse en hardware consumer.

La informacion publica disponible es muy limitada: la model card del espejo solo documenta la procedencia y la integridad de los ficheros, y remite al repositorio origen para los detalles tecnicos, autores y documentacion del modelo. Por tanto, varios parametros de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS convertido a Core ML; el nombre "Phonon 31m" sugiere una arquitectura neuronal de sintesis de voz de ~31M de parametros, sin mas detalle publicado en la informacion disponible) |
| Parametros totales | aproximadamente 31 millones (inferido del identificador `phonon-31m-en`; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML; no se documentan variantes de cuantizacion en la informacion proporcionada) |
| Idiomas soportados | ingles (inferido del sufijo `-en` del identificador; no confirmado explicitamente en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (libreria `coreml`); el repo origen incluye ficheros `LICENSE` y `README.md` originales |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. El identificador `phonon-31m-en` apunta a un modelo de sintesis de voz de aproximadamente 31 millones de parametros orientado al ingles, y el tag `coreml` indica que los pesos han sido convertidos y empaquetados para su ejecucion mediante Core ML en plataformas Apple. No se detalla si la arquitectura es un modelo acustico tipo Tacotron, FastSpeech, VITS, un modelo basado en difusion o un modelo neuronal de otro tipo, ni si incluye un vocoder separado o integrado.

Tampoco se documentan en la informacion disponible los datos de entrenamiento (numero de horas de audio, composicion del corpus, idioma y acentos), ni si se aplicaron tecnicas de alineamiento, destilacion o ajuste fino. La model card del espejo unicamente certifica que los ficheros de `phonon/phonon-31m-en` son identicos byte a byte al commit `c2e998e269e4d4b51f74061faddb8450cd8f9a9a` del repositorio `FluidInference/pocket-tts-coreml`, y remite a dicho repositorio para la documentacion tecnica y la atribucion de autores.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, segun el pipeline declarado en Hugging Face.
- Ejecucion nativa en el ecosistema Apple mediante Core ML, sin dependencia de Python en tiempo de inferencia.
- Orientacion al idioma ingles (inferida del sufijo `-en`; no confirmado en la model card).
- Modelo de pequeno tamano (~31M de parametros), adecuado para inferencia en dispositivo.
- No se documentan capacidades de clonacion de voz, control de emocion, multi-hablante, tool calling, agentes ni otras funciones avanzadas en la informacion disponible.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el formato Core ML permite integrar el modelo directamente en apps nativas para convertir texto en audio sin salir del dispositivo, con un tamano de modelo reducido (~0,4 GB de repositorio) que facilita su empaquetado.
- Accesibilidad: sintesis de voz para lectores de pantalla, conversion de articulos o documentos a audio para usuarios con discapacidad visual, aprovechando la ejecucion local y la ausencia de dependencia de servicios en la nube.
- Asistentes conversacionales en dispositivo: generacion de respuestas habladas en asistentes integrados en apps Apple, donde la baja latencia y la privacidad del procesamiento local son prioritarias.
- Audiolibros y podcasts generados: conversion de textos largos a audio en pipelines de publicacion, siempre que el modelo soporte entradas de longitud suficiente (dato no disponible).
- Prototipado rapido de interfaces de voz: uso en entornos de desarrollo sobre macOS para validar experiencias de voz antes de invertir en modelos mayores o servicios gestionados.
- Sistemas de navegacion o avisos por voz: anuncios hablados en apps de mapas, conduccion o domotica, donde un modelo pequeno y local reduce costes y dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de un modelo Core ML de aproximadamente 31M de parametros, la huella de memoria deberia ser reducida, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. Core ML puede ejecutarse en CPU, GPU o Neural Engine de los chips Apple (serie M y A); no se especifican requisitos minimos.
- Compatibilidad con GPU consumer: previsiblemente si en equipos Apple con Neural Engine o GPU integrada, aunque no se confirma en la documentacion disponible.
- Opciones de despliegue: Core ML (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otras alternativas de TTS.

## Limitaciones y advertencias

- La model card del espejo no documenta el modelo en si: solo certifica la procedencia y la integridad de los ficheros. Para entender el modelo hay que consultar el repositorio origen `FluidInference/pocket-tts-coreml`.
- El espejo puede quedar desactualizado respecto al repositorio original; solo garantiza la revision `c2e998e269e4d4b51f74061faddb8450cd8f9a9a`.
- Idioma limitado al ingles segun el identificador; no se confirma soporte multilingue.
- No se documentan sesgos, tasas de alucinacion, calidad de sintesis ni comportamiento en textos largos o dominios especializados.
- La licencia Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y atribucion; conviene revisar el `LICENSE` original incluido en el repositorio.
- Al ser un modelo TTS, no debe evaluarse con los criterios habituales de LLM (razonamiento, codigo, tool calling); su uso esta acotado a la sintesis de voz.
- No se dispone de informacion sobre latencia, calidad perceptual (MOS) ni estabilidad en produccion.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/arekholko/pocket-tts-coreml
- Repositorio origen: https://huggingface.co/FluidInference/pocket-tts-coreml
- Commit de origen espejado: https://huggingface.co/FluidInference/pocket-tts-coreml/tree/c2e998e269e4d4b51f74061faddb8450cd8f9a9a/phonon/phonon-31m-en
