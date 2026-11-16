# Phoonnx/vits-sv_se-lisa-espeak

## Resumen

vits-sv_se-lisa-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la libreria ONNX homonima. El modelo original procede de wezzmeister, dentro del repositorio piper-voices, y se distribuye como un checkpoint VITS convertido a formato ONNX para inferencia ligera. Su identificador interno en phoonnx es `piper_community/wezzmeister/sv-SE_lisa`.

El modelo resuelve la conversion de texto a voz para sueco de Suecia (`sv-SE`) con una unica voz identificada como "lisa". La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados mediante espeak-ng, lo que implica una dependencia explicita de esa herramienta o de su port espyak. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos TTS ligeros aptos para despliegue en CPU o en entornos con recursos limitados.

Es relevante para desarrolladores que necesiten anadir sintesis de voz en sueco a asistentes, sistemas de accesibilidad o pipelines de audio sin depender de servicios en la nube. Su licencia MIT y su integracion con el ecosistema OVOS (Open Voice OS) lo hacen especialmente atractivo para proyectos de asistentes de voz open source. No obstante, la informacion publica disponible es escasa: no se detallan datos de entrenamiento, metricas objetivas ni caracteristicas acusticas mas alla de la arquitectura y el idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa contexto textual) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | sueco de Suecia (`sv-SE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Autor original | wezzmeister |
| Empaquetado por | Phoonnx |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con aprendizaje adversarial. El modelo produce audio directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia. En este caso, el checkpoint original fue entrenado por wezzmeister y posteriormente exportado a ONNX por Phoonnx para su ejecucion con la libreria phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante utilizado para la voz "lisa" ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS. La unica particularidad destacable es el front-end de texto: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que utiliza `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`. Esto significa que la calidad de la sintesis depende directamente de la fidelidad de espeak-ng al generar los fonemas IPA para sueco.

## Capacidades

- Sintesis de voz mono-hablante en sueco de Suecia (`sv-SE`) a partir de texto escrito.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion basada en espeak-ng con alfabeto IPA, con soporte opcional del port espyak si no se instala espeak-ng.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador a traves de phoonnx.js, con demo en vivo disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo "thinking".
- Capacidad multilingue limitada exclusivamente al sueco; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz en sueco: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz en `sv-SE`, aprovechando el plugin oficial y la configuracion declarativa en `mycroft.conf`.
- Accesibilidad web: permite leer en voz alta contenido textual en sueco dentro de aplicaciones web mediante phoonnx.js, sin necesidad de backend ni servicios en la nube, gracias a la ejecucion ONNX en el navegador.
- Sistemas de navegacion y anuncios por voz: adecuado para generar indicaciones habladas en sueco en dispositivos embebidos con recursos limitados, dado el reducido tamano del modelo (~0,1 GB).
- Audiolibros y contenido bajo demanda: sintesis de articulos o documentos en sueco para consumo en formato audio, con la ventaja de una licencia MIT que permite uso comercial sin restricciones.
- Prototipado de interfaces conversacionales: util para investigadores que necesiten una voz sueca rapida de desplegar en entornos de prueba sin depender de APIs propietarias.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones en sueco a partir de texto, aunque la calidad depende de la fonemizacion de espeak-ng y puede presentar errores en palabras irregulares.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: al ser un modelo ONNX deterministico y ligero, puede ejecutarse en contenedores para validar la salida de audio en pruebas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas MOS (Mean Opinion Score), MCD, WER de fonemizacion ni comparaciones objetivas con otros modelos TTS en sueco.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se estima un consumo muy bajo, compatible con CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime, aunque puede beneficiarse de aceleracion GPU si el runtime lo soporta.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna con soporte ONNX Runtime, dado el reducido tamano del modelo; no se documentan requisitos minimos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Se puede senalar que existen otros modelos VITS empaquetados por Phoonnx en su coleccion, asi como voces del repositorio piper-voices de wezzmeister, pero no se aportan metricas que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-sv_se-lisa-espeak | no disponible | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Otros VITS de la coleccion Phoonnx | no disponible | no aplica | no disponible | variable | Hugging Face |
| Voces piper-voices de wezzmeister | no disponible | no aplica | no disponible | variable | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz unica ("lisa"), no representa la diversidad de voces o acentos del sueco.
- Riesgo de alucinacion: no aplica en el sentido textual, pero la fonemizacion con espeak-ng puede producir pronunciaciones incorrectas en palabras irregulares, nombres propios o extranjerismos.
- Limitacion de idioma: unicamente soporta sueco de Suecia (`sv-SE`); no se documentan otras variantes del sueco ni otros idiomas.
- Dependencia externa: requiere espeak-ng instalado o el port espyak; este ultimo puede generar fonemas distintos y provocar errores de pronunciacion.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el autor remite a los terminos de la release upstream (wezzmeister/piper-voices), que no se detallan en la informacion disponible.
- Caveat para produccion: no se han publicado evaluaciones objetivas de calidad (MOS, inteligibilidad) ni pruebas de robustez; se recomienda validar la salida en el dominio de aplicacion antes de desplegar.
- El modelo no incluye capacidades de control de prosodia, emocion ni estilo mas alla de lo que VITS permite de forma implicita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sv_se-lisa-espeak
- Repositorio upstream: https://huggingface.co/wezzmeister/piper-voices
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
