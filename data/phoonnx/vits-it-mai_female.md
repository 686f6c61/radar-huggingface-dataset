# Phoonnx/vits-it-mai_female

## Resumen

vits-it-mai_female es un modelo de sintesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo procede del paquete oficial `tts_models--it--mai_female--vits` publicado en las releases de Coqui TTS v0.6.1, y ha sido reconvertido para ejecutarse mediante ONNX Runtime, lo que facilita su despliegue en entornos Python y en el asistente de voz OVOS.

Se trata de un modelo de voz femenina en italiano entrenado sobre el corpus M-AILABS, un conjunto de datos de audio y transcripciones multilingue ampliamente utilizado en sintesis de voz. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia ligera y despliegue en dispositivos con recursos limitados. La entrada de texto se realiza a nivel de caracteres (graphemes), sin necesidad de un fonemizador complejo, lo que simplifica la integracion.

Su relevancia actual radica en que ofrece una alternativa ligera, con licencia Apache-2.0 y formato ONNX, para aplicaciones de sintesis de voz en italiano dentro de ecosistemas open source como OVOS/Mycroft. Al estar empaquetado para phoonnx, se integra directamente como plugin de TTS sin requerir la pesada infraestructura de Coqui TTS original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada a nivel de caracteres) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres (graphemes) |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de adversario y de reconstruccion espectral. Este diseno permite generar audio de forma directa a partir de texto sin necesidad de un modelo acustico y un vocoder separados, reduciendo la latencia y la complejidad del pipeline.

El modelo fue entrenado por Coqui sobre el corpus M-AILABS en italiano, con una voz femenina identificada como `mai_female`. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que se trata de un modelo TTS y no de un modelo de lenguaje. La innovacion principal del empaquetado de Phoonnx es la conversion a ONNX para inferencia portable, junto con el uso de la libreria scriptconv para la normalizacion de texto y la conversion a graphemes mediante `GraphemePhonemizer`.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto plano.
- Voz femenina preentrenada (`mai_female`) del corpus M-AILABS.
- Entrada a nivel de caracteres (graphemes), sin requerir fonemizacion compleja.
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecucion mediante ONNX Runtime, con inferencia portable en CPU y GPU.
- Normalizacion y conversion de texto mediante la libreria scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es exclusivamente un modelo TTS).

## Casos de uso

- Asistentes de voz en italiano: el modelo puede integrarse en OVOS/Mycroft como modulo TTS para responder oralmente a consultas del usuario, gracias al plugin `ovos-tts-plugin-phoonnx` y a su configuracion mediante `mycroft.conf`.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de articulos, noticias o documentos en italiano a audio para personas con discapacidad visual, aprovechando la salida WAV directa y el bajo peso del modelo (0,1 GB).
- Generacion de audiolibros y podcasts: sintesis por lotes de textos largos en italiano con una voz femenina consistente, usando `synthesize_wav` sobre fragmentos de texto.
- Sistemas de anuncios y notificaciones por voz: generacion dinamica de mensajes hablados en italiano en aplicaciones de domotica, transporte o comercio, donde la latencia baja de VITS resulta adecuada.
- Prototipado de interfaces conversacionales: creacion rapida de demos de asistentes en italiano sin depender de servicios en la nube, al ejecutarse localmente con ONNX Runtime.
- Investigacion en sintesis de voz: uso como linea base VITS en italiano para comparar con modelos mas recientes, dado su caracter open source y su licencia permisiva.
- Integracion en pipelines de generacion de contenido multimedia: produccion automatizada de narraciones en italiano para videos o presentaciones, combinando el modelo con herramientas de postproduccion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente cabe en memoria de CPU sin GPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en CPU y en GPU consumer de gama baja (por ejemplo, GTX 1050 o superior) sin problemas.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos unos pocos GB de memoria, e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-it-mai_female (Phoonnx) | VITS | Italiano | no aplica | Apache-2.0 | ONNX | Hugging Face (27 descargas) |
| Coqui TTS it-mai_female (original) | VITS | Italiano | no aplica | Apache-2.0 | PyTorch (checkpoint) | GitHub releases Coqui TTS |
| Otros modelos VITS de la coleccion Phoonnx | VITS | Multiples idiomas | no aplica | Apache-2.0 | ONNX | Hugging Face (coleccion VITS) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La diferencia principal entre el modelo de Phoonnx y el original de Coqui es el formato (ONNX frente a PyTorch) y el empaquetado para la libreria phoonnx, manteniendo la misma arquitectura y datos de entrenamiento.

## Limitaciones y advertencias

- Modelo exclusivamente de sintesis de voz: no realiza comprension de lenguaje, razonamiento ni generacion de texto.
- Limitado al idioma italiano; no soporta otros idiomas de forma nativa.
- Entrada a nivel de caracteres (graphemes): la calidad de pronunciacion puede ser inferior a la de modelos con fonemizacion avanzada en palabras ambiguas.
- No se dispone de informacion sobre sesgos de la voz o del corpus M-AILABS; el dataset puede contener sesgos de genero, edad o acento.
- Riesgo de artefactos acusticos y errores de prosodia en textos con simbolos, numeros o abreviaturas no normalizados correctamente por scriptconv.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los terminos del corpus M-AILABS y del modelo original de Coqui.
- El modelo tiene muy pocas descargas (27) y 0 likes, lo que sugiere poca validacion por parte de la comunidad; conviene evaluar la calidad en el caso de uso concreto antes de produccion.
- No se dispone de informacion sobre cuantizaciones adicionales ni sobre latencia medida en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it-mai_female
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_female--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
