# Phoonnx/vits-de_de-thorsten_emotion-low

## Resumen

vits-de_de-thorsten_emotion-low es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces Mimic 3. Se trata de una voz en aleman (de-DE) etiquetada como "emotion low", empaquetada por el proyecto Phoonnx en formato ONNX para su uso en la biblioteca de TTS del mismo nombre. El modelo no es un modelo de lenguaje generativo de gran tamano, sino un sistema acustico compacto especializado en convertir fonemas en waveform de audio.

La relevancia del modelo reside en su empaquetado: Phoonnx facilita su integracion tanto en Python como en el ecosistema OVOS (Open Voice OS), un entorno de asistente vocal open source. Al estar en formato ONNX, puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para despliegues ligeros en dispositivos de bajos recursos. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja la naturaleza compacta de los modelos VITS de Mimic 3.

El modelo forma parte de una coleccion mas amplia de voces VITS empaquetadas por Phoonnx, orientada a ofrecer sintesis de voz multilingue y ligera para aplicaciones de asistente vocal, lectura de texto y sistemas embebidos. Su licencia CC-BY-SA-4.0 permite uso comercial con atribucion y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes de cuantizacion) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Autor upstream | Mycroft AI |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto basado en transformers, un prior variacional normalizador por flujo, un decoder generativo basado en HiFi-GAN y un discriminador entrenado con aprendizaje adversario. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el pipeline.

En este caso concreto, el modelo es una voz del conjunto Mimic 3 de Mycroft AI, entrenada sobre el corpus Thorsten (voz alemana de dominio publico) con una variante etiquetada "emotion low". No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (habitualmente no aplicables a modelos TTS de este tipo). La innovacion tecnica destacable es el empaquetado en ONNX por parte de Phoonnx, que permite inferencia en CPU y despliegue multiplataforma sin dependencias de framework de deep learning pesado.

## Capacidades

- Sintesis de voz a partir de texto en aleman (de-DE), con salida en waveform de audio.
- Conversion de texto a fonemas mediante el fonemizador gruut (alfabeto IPA) a traves de la libreria scriptconv.
- Generacion de audio de forma end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Ejecucion en CPU mediante el runtime ONNX, sin requerir GPU.
- Integracion nativa con el ecosistema OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Voz con estilo "emotion low" (prosodia contenida), segun la denominacion del modelo upstream.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es exclusivamente un modelo TTS.
- No soporta vision, audio de entrada ni otras modalidades distintas de texto a voz.

## Casos de uso

- Asistente vocal en OVOS: el modelo se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx y sintetiza las respuestas del asistente en aleman, aprovechando su ejecucion en CPU para dispositivos sin GPU.
- Lectura de texto en aleman para aplicaciones de accesibilidad: integracion en Python con TTSModelManager para convertir articulos o documentos en audio WAV, adecuado por su bajo tamano (~0,1 GB) y su licencia permisiva.
- Sistemas embebidos y Raspberry Pi: al ser un modelo ONNX ligero y ejecutable en CPU, puede desplegarse en dispositivos de bajos recursos para avisos de voz, notificaciones o interfaces habladas.
- Generacion de avisos y anuncios automatizados: sintesis de mensajes cortos en aleman para sistemas de megafonia, domotica o paneles informativos, con latencia baja gracias a la arquitectura VITS end-to-end.
- Prototipado rapido de interfaces de voz: para desarrolladores que necesitan una voz alemana funcional sin entrenar un modelo propio, el pipeline pip install phoonnx + scriptconv[gruut] permite tener sintesis operativa en pocos minutos.
- Localizacion de contenidos: conversion de textos alemanes a audio para podcasts, audiolibros o material formativo, con la posibilidad de modificar el texto fuente y regenerar audio de forma programatica.
- Pruebas de integracion en pipelines de CI: verificacion automatizada de que el pipeline TTS produce WAV validos en entornos de test sin GPU, gracias al formato ONNX y al bajo peso del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su configuracion por defecto; el modelo esta empaquetado en ONNX para ejecucion en CPU. No se documenta una estimacion de VRAM para ejecucion en GPU.
- GPU recomendadas: no disponible; el modelo no requiere GPU segun la documentacion de Phoonnx.
- Compatibilidad con GPU de consumo: no disponible; al ejecutarse en CPU, no se especifican requisitos de GPU.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS VITS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Tamano del repositorio: aproximadamente 0,1 GB, lo que sugiere un modelo compacto apto para almacenamiento en dispositivos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-de_de-thorsten_emotion-low (este modelo) | VITS | de-DE | ONNX | CC-BY-SA-4.0 | Voz Mimic 3 empaquetada por Phoonnx, ejecucion en CPU |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun voz upstream | Mismo empaquetado, distintos idiomas y voces |
| Voces Mimic 3 originales de Mycroft AI | VITS | varios | formatos propios de Mimic 3 | segun voz upstream | Modelo fuente antes del empaquetado ONNX |
| Modelos TTS neuronales de gran tamano (por ejemplo, sistemas basados en difusion o LLM TTS) | variable | varios | variable | variable | Mayor tamano y requisitos de GPU; no comparables directamente en recursos |

No se dispone en la informacion proporcionada de datos de rendimiento (MOS, latencia, throughput) para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en aleman (de-DE); no soporta otros idiomas.
- Al ser un modelo TTS, no realiza razonamiento, generacion de texto ni tool calling; no debe confundirse con un modelo de lenguaje.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o en terminos tecnicos, nombres propios y extranjerismos no cubiertos por el fonemizador gruut.
- La prosodia "emotion low" implica una expresividad contenida; puede no ser adecuada para aplicaciones que requieran entonacion muy expresiva o emocional.
- No se documentan sesgos especificos, pero como voz entrenada sobre un corpus concreto (Thorsten), puede presentar caracteristicas acusticas limitadas al estilo de ese corpus.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; es necesario revisar las condiciones antes de su integracion en productos propietarios.
- No se documentan datos sobre calidad acustica (MOS), latencia ni throughput; conviene evaluar el modelo en el entorno de despliegue concreto antes de usarlo en produccion.
- Dependencia del ecosistema Phoonnx y scriptconv para el fonemizado y la inferencia; requiere instalar extras especificos (scriptconv[gruut]).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten_emotion-low
- Repositorio upstream (Mimic 3 voices, voz thorsten-emotion_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/thorsten-emotion_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS empaquetada por Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
