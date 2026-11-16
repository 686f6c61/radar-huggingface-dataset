# Phoonnx/matcha-ca-multiaccent_wavenext-espeak

## Resumen

matcha-ca-multiaccent_wavenext-espeak es un modelo de sintesis de voz (text-to-speech) para catalan, empaquetado en formato ONNX por Phoonnx a partir del modelo original `projecte-aina/matxa-tts-cat-multiaccent` desarrollado por Projecte AINA. El modelo emplea la arquitectura Matcha-TTS, un modelo de sintesis neuronal no autorregresivo basado en flow matching que genera mel-espectrogramas a partir de fonemas, combinado con un vocoder Wavenext ("fused Wavenext" segun la model card) para producir la forma de onda final.

La relevancia de este empaquetado radica en que convierte un modelo de investigacion en un artefacto listo para produccion dentro del ecosistema phoonnx: pesos ONNX, integracion con el fonemizador espeak-ng y un pipeline de sintesis invocable desde Python o desde el asistente OVOS (OpenVoiceOS). El modelo esta especializado en catalan con variacion multiacento, lo que lo hace util para aplicaciones de voz en catalan que requieran cubrir distintos acentos dialectales.

El repositorio es pequeno (0,1 GB) y esta publicado bajo licencia GPL-3.0, lo que condiciona su uso en productos propietarios. La entrada de texto se realiza mediante fonemas IPA generados por espeak-ng, no directamente desde texto crudo, lo que implica una etapa de normalizacion y fonemizacion previa gestionada por la libreria scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching no autorregresivo) + vocoder Wavenext |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de sintesis de voz no autorregresiva que combina un encoder de fonemas con un decoder basado en flow matching para generar mel-espectrogramas, a los que se aplica posteriormente un vocoder neuronal para obtener la forma de onda. En este empaquetado el vocoder es Wavenext en variante "fused". El modelo original de Projecte AINA esta entrenado para catalan con cobertura multiacento, segun indica el nombre del checkpoint upstream.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). La model card del empaquetado no detalla hiperparametros, numero de pasos de flow matching ni configuracion del vocoder. La innovacion practica de este repositorio no esta en el entrenamiento sino en el empaquetado: conversion a ONNX y adaptacion del front-end de texto para que la entrada sean fonemas IPA de espeak-ng, gestionados por la libreria scriptconv.

## Capacidades

- Sintesis de voz en catalan a partir de texto, con salida en fichero WAV.
- Cobertura multiacento del catalan, heredada del modelo upstream `matxa-tts-cat-multiaccent`.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fonetico preciso.
- Integracion con el ecosistema phoonnx mediante `TTSModelManager` y la voz `OpenVoiceOS/matxa-cat-multiaccent-wavenext`.
- Integracion con OVOS (OpenVoiceOS) mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion y conversion de texto a fonemas delegada a scriptconv (`EspeakPhonemizer`).
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en catalan: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo dotar de voz a un asistente domestico o de escritorio con seleccion de voz por configuracion JSON.
- Lectura de contenidos en catalan: conversion de articulos, noticias o documentacion a audio WAV para podcasts, audiolibros o accesibilidad, usando el pipeline Python de phoonnx con `synthesize_wav`.
- Senalizacion y anuncios en transporte publico: generacion de locuciones en catalan con distintos acentos para megafonia de estaciones, aprovechando la variacion multiacento del modelo.
- Interfaces de voz para administracion publica: sintesis de respuestas en catalan en portales telefonicos o quioscos, donde la licencia GPL-3.0 es compatible con el despliegue en instituciones que publiquen el codigo.
- Investigacion en TTS catalan: el empaquetado ONNX facilita experimentar con Matcha-TTS sin depender del framework original, sirviendo como linea base para comparativas de prosodia y acento.
- Prototipado rapido de aplicaciones de voz: el repositorio de 0,1 GB y la instalacion via `pip install --pre phoonnx` permiten levantar un sintetizador funcional en pocos minutos en entornos de desarrollo.
- Generacion de material didactico en catalan: creacion de audios con distintos acentos para aprendizaje de lengua, usando la variacion dialectal del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano del repositorio (0,1 GB) se trata de un modelo ligero que previsiblemente se ejecuta en CPU.
- GPU recomendadas: no disponible. Dado el tamano, no requiere GPU dedicada; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente si se desea aceleracion.
- Cabe en GPU consumer: si, con margen amplio, aunque el dato no esta confirmado en la documentacion.
- Opciones de despliegue: phoonnx (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| matcha-ca-multiaccent_wavenext-espeak (este) | Matcha-TTS + Wavenext | Catalan (multiacento) | GPL-3.0 | ONNX | Hugging Face, phoonnx, OVOS |
| projecte-aina/matxa-tts-cat-multiaccent | Matcha-TTS | Catalan (multiacento) | GPL-3.0 | pesos originales | Hugging Face |
| Otros modelos Matcha-TTS de la coleccion Phoonnx | Matcha-TTS | segun modelo | variable | ONNX | coleccion Phoonnx en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso en productos propietarios o servicios de red sin liberar el codigo puede quedar condicionado por la licencia; revisar compatibilidad antes de produccion.
- Dependencia de espeak-ng: sin el binario instalado, phoonnx usa espyak, cuyos fonemas difieren de espeak-ng y pueden producir palabras mal pronunciadas.
- Entrada fonetica: el modelo espera fonemas IPA, no texto crudo; errores en la normalizacion o fonemizacion de scriptconv degradan la calidad de la sintesis.
- Cobertura limitada al catalan: no soporta otros idiomas.
- Riesgo de prosodia incorrecta en palabras fuera de vocabulario, siglas, numeros o nombres propios, al depender del front-end de fonemizacion.
- No hay informacion publicada sobre sesgos acusticos por acento, calidad en dominios especificos ni evaluaciones MOS.
- Sin datos de benchmarks ni de latencia: la idoneidad para produccion de alta concurrencia no esta documentada.
- Modelo con muy poca traccion (23 descargas, 0 likes en el momento de la consulta), lo que reduce la validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multiaccent_wavenext-espeak
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multiaccent
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
