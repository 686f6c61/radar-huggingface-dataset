# BleuCPU/pocket-voice

## Resumen

Pocket Voice es un repositorio espejo (mirror) sin modificaciones de dos ficheros del modelo de sintesis de voz NeuTTS-Air, desarrollado por Neuphonic y redistribuido por el usuario BleuCPU bajo licencia Apache 2.0. El repositorio empaqueta un componente de lenguaje en formato GGUF cuantizado a Q4_0 y un decodificador de codec neuronal en formato ONNX, que en conjunto forman un sistema de text-to-speech ligero pensado para ejecutarse en dispositivo. El autor declara que su proposito es servir de dependencia a la aplicacion Pocket para iOS, que realiza TTS on-device.

El modelo suma 747.930.496 parametros reales y ocupa 1,3 GB en el repositorio. La combinacion de un backbone de lenguaje cuantizado (GGUF) y un decodificador de audio compilado para ONNX Runtime es lo que permite separar la generacion de tokens acusticos de la reconstruccion de la onda, de modo que la inferencia no dependa de una GPU dedicada. Todo el credito de los pesos corresponde a Neuphonic; BleuCPU solo replica los ficheros byte a byte, verificados con hashes SHA-256.

Es relevante ahora porque cubre el nicho de la sintesis de voz que cabe en CPU y en movil, sin la dependencia de GPU que domina la mayoria de los TTS neuronales. Su licencia Apache 2.0 y los formatos abiertos (GGUF y ONNX) lo hacen integrable en aplicaciones de escritorio, moviles y servidores sin requisitos de hardware especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech basado en backbone de lenguaje para tokens acusticos mas decodificador de codec neuronal (NeuCodec) |
| Parametros totales | 747.930.496 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (GGUF); decodificador ONNX sin cuantizar declarada; tag imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (backbone de lenguaje) y ONNX (decodificador de codec) |

## Arquitectura y entrenamiento

Segun la model card, el repositorio redistribuye dos artefactos del sistema NeuTTS-Air de Neuphonic: `neutts-air-Q4_0.gguf` (procedente de `neuphonic/neutts-air-q4-gguf`) y `neucodec-decoder.onnx` (procedente de `neuphonic/neucodec-onnx-decoder`, donde el fichero original `model.onnx` se ha renombrado). La arquitectura es por tanto la de NeuTTS-Air, que combina un modelo de lenguaje que genera representaciones o tokens acusticos y un decodificador de codec neuronal (NeuCodec) que convierte esas representaciones en audio. El backbone de lenguaje se distribuye cuantizado a Q4_0 en GGUF, mientras que el decodificador se entrega en ONNX, presumiblemente para ejecucion via ONNX Runtime en plataformas donde llama.cpp no es la via principal.

No se han proporcionado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas del entrenamiento. Tampoco se documentan cambios respecto a los originales de Neuphonic: el autor afirma explicitamente que no se ha modificado ningun fichero y que los hashes SHA-256 coinciden byte a byte con los originales.

## Capacidades

- Generacion de voz (text-to-speech) a partir de texto: es la funcion principal del modelo.
- Sintesis conversacional, segun el tag `conversational` del repositorio.
- Ejecucion on-device: el autor indica que se usa para TTS en dispositivo en la app Pocket para iOS.
- Integracion en dos formatos complementarios: GGUF para el backbone de lenguaje y ONNX para el decodificador, lo que permite desplegar en distintos runtimes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de razonamiento).
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponibles en la informacion proporcionada; la modalidad de salida es audio.

## Casos de uso

- Lectura por voz en aplicaciones moviles: el modelo esta pensado para TTS on-device, por lo que encaja en apps iOS o Android que necesiten leer texto sin enviar datos a un servidor ni depender de conectividad.
- Asistentes de accesibilidad: conversion de texto a voz para lectores de pantalla y herramientas de apoyo a personas con discapacidad visual, aprovechando que el modelo no requiere GPU.
- Sintesis de voz en dispositivos embebidos o de bajos recursos: al distribuirse en GGUF Q4_0 y ONNX, puede integrarse en equipos con CPU modesta y poca memoria.
- Audioguías y narracion offline: generacion de locuciones para museos, kioscos o dispositivos sin red, donde la latencia de red no es aceptable.
- Preprocesado de audio para pipelines de datos: sintesis masiva de frases para generar datasets de audio etiquetados o para pruebas de sistemas de reconocimiento de voz, siempre que la licencia lo permita.
- Integracion en aplicaciones de escritorio: uso via llama.cpp o ONNX Runtime para anadir lectura en voz alta a editores de texto, IDE o herramientas de ofimatica.
- Prototipado de interfaces conversacionales: dado el tag `conversational`, sirve para montar prototipos de dialogo por voz en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_0, los pesos del backbone de aproximadamente 748 M de parametros ocupan del orden de 0,4-0,5 GB; sumando el decodificador ONNX y las memorias intermedias, un presupuesto de 1-2 GB de RAM o VRAM es orientativo. Estas cifras son estimaciones a partir del recuento de parametros y no datos publicados por el autor.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU con 2 GB de VRAM o mas (por ejemplo, GTX 1650, RTX 3060, RTX 4090) puede alojar el modelo; tambien A100 o H100 si se busca despliegue en servidor, aunque estan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo y tambien en CPU.
- Opciones de despliegue: llama.cpp para el fichero GGUF; ONNX Runtime para el decodificador ONNX. No se documenta soporte explicito de vLLM, TGI u Ollama en la informacion disponible, aunque Ollama podria consumir el GGUF si el formato es compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas que permitan una comparativa fiable con alternativas de la misma categoria. Se comparan a continuacion unicamente los datos disponibles.

| Modelo | Desarrollador | Parametros | Formats | Licencia |
|---|---|---|---|---|
| Pocket Voice (NeuTTS-Air) | BleuCPU (espejo de Neuphonic) | 747.930.496 | GGUF, ONNX | Apache 2.0 |
| NeuTTS-Air (original) | Neuphonic | 747.930.496 (mismos pesos) | GGUF, ONNX | Apache 2.0 |
| Alternativas de TTS ligero | no disponible | no disponible | no disponible | no disponible |

La comparacion con modelos de terceros y los datos de benchmarks asociados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es un espejo: el mantenimiento, las actualizaciones y los terminos dependen de Neuphonic, no de BleuCPU.
- No se declaran idiomas soportados, por lo que no puede garantizarse cobertura multilingue ni la calidad de pronunciacion en castellano.
- No se han publicado benchmarks ni evaluaciones objetivas de calidad de voz (naturalidad, MOS, latencia) en la informacion disponible.
- Riesgo de alucinacion: no aplicable en el sentido de texto, pero en TTS existe riesgo de pronunciacion incorrecta, omision o repeticion de fragmentos, especialmente en textos con numeros, siglas o nombres propios.
- No se documentan sesgos especificos, aunque todo modelo de voz puede heredar sesgos de acento, genero o variedad dialectal del corpus de entrenamiento.
- Limitaciones de contexto: se desconoce la longitud maxima de texto por inferencia.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; conviene consultar tambien los terminos de Neuphonic y de la app Pocket por si hubiera condiciones adicionales en el servicio.
- Para produccion: al no haber datos de latencia ni de throughput, conviene medir el rendimiento real antes de comprometer SLA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BleuCPU/pocket-voice
- Perfil del autor: https://huggingface.co/BleuCPU
- Neuphonic en HuggingFace: https://huggingface.co/neuphonic
- Fichero fuente GGUF: https://huggingface.co/neuphonic/neutts-air-q4-gguf
- Fichero fuente del decodificador ONNX: https://huggingface.co/neuphonic/neucodec-onnx-decoder
- Repositorio de NeuTTS: https://github.com/neuphonic/neutts
- Aplicacion Pocket: https://mobilepocket.app

Enlaces encontrados en la busqueda web (referidos a un proyecto denominado "Pocket TTS" de Kyutai; no se ha confirmado que sean el mismo sistema que este repositorio):

- https://byteiota.com/pocket-tts-runs-real-time-voice-ai-on-cpu-without-gpu/
- https://dev.to/alfchee/choosing-the-right-voice-a-technical-comparison-of-pocket-studio-models-4bb8
- https://www.mindstudio.ai/blog/train-tts-model-locally-pocket-tts
- https://github.com/kyutai-labs/pocket-tts
