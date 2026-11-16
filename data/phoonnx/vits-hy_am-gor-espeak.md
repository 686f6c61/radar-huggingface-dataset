# Phoonnx/vits-hy_am-gor-espeak

## Resumen

vits-hy_am-gor-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del trabajo de davit312, concretamente de su repositorio piper-TTS-Armenian (version v3), y ha sido adaptado para ejecutarse mediante el runtime phoonnx en Python y en el ecosistema OVOS. Su proposito es generar voz sintetica en armenio (hy-AM) a partir de texto, usando fonemas espeak-ng en alfabeto IPA como entrada.

El modelo es de tipo condicional de extremo a extremo (VITS combina un encoder de texto, un decoder acustico y un vocoder neuronal en un unico paso), lo que permite sintesis de voz de forma directa sin pipelines separados. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia ligeros, incluido el navegador mediante phoonnx.js.

Es relevante para desarrolladores que necesiten TTS en armenio dentro de asistentes de voz open source (OVOS), aplicaciones de accesibilidad o sistemas embebidos, dado su tamano reducido y su licencia GPL-2.0. No obstante, se trata de un modelo de nicho, con muy pocas descargas y sin datos publicados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | armenio (hy-AM) |
| Licencia | GPL-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que integra un encoder de texto basado en transformer, un prior variacional, un decoder acustico y un vocoder neuronal de flujo en un unico modelo generativo condicional. La entrada de texto se convierte en fonemas mediante espeak-ng y se representa en alfabeto IPA, que es lo que consume el modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo original fue entrenado por davit312 y publicado en su repositorio piper-TTS-Armenian/v3; Phoonnx se limita a empaquetarlo en ONNX y a integrarlo en su pipeline de inferencia. No se documentan innovaciones tecnicas adicionales mas alla del propio diseno VITS.

## Capacidades

- Sintesis de voz a partir de texto en armenio (hy-AM).
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite un control fonetico preciso.
- Generacion de audio WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Asistentes de voz en armenio con OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en hy-AM en un asistente domestico open source.
- Accesibilidad y lectura de textos: conversion de documentos o noticias en armenio a audio para personas con discapacidad visual, aprovechando el tamano reducido del modelo (0,1 GB) para ejecucion en equipos modestos.
- Aplicaciones web de sintesis de voz: mediante phoonnx.js, se puede integrar el modelo en el navegador para leer contenido en armenio sin depender de servicios en la nube.
- Sistemas embebidos y dispositivos de bajo consumo: el formato ONNX y el reducido peso permiten desplegar TTS en Raspberry Pi u otros dispositivos con recursos limitados.
- Generacion de audiolibros o contenido educativo en armenio: sintesis por lotes de textos largos con control fonetico mediante espeak-ng.
- Prototipado de interfaces conversacionales en armenio: integracion en pipelines de IVR o chatbots de voz que requieran respuestas habladas en hy-AM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) se estima un consumo muy bajo, inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-hy_am-gor-espeak | VITS | hy-AM | no aplica | GPL-2.0 | ONNX |
| davit312/piper-TTS-Armenian/v3 | VITS (Piper) | hy-AM | no aplica | GPL-2.0 (segun upstream) | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no aplica | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy pocas descargas (19) y sin datos de evaluacion publicados; la calidad de sintesis no esta verificada de forma independiente.
- Dependencia de espeak-ng: si se usa el port espyak incluido en `phoonnx[espeak]`, algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Solo soporta armenio (hy-AM); no es multilingue.
- Riesgo de alucinacion no aplica en el sentido de texto, pero puede producir prosodia o pronunciacion incorrecta en textos con fonetica compleja o extranjerismos.
- Licencia GPL-2.0: el uso comercial requiere cumplir las obligaciones de copyleft de la GPL, lo que puede ser restrictivo para productos propietarios.
- No es un modelo de lenguaje: no soporta razonamiento, codigo, tool calling ni agentes.
- El modelo upstream declara GPL-2.0; conviene verificar la cadena de licencias antes de su redistribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hy_am-gor-espeak
- Upstream (davit312/piper-TTS-Armenian v3): https://huggingface.co/davit312/piper-TTS-Armenian/tree/main/v3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
