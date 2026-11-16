# Phoonnx/vits-es-css10-graphemes

## Resumen

vits-es-css10-graphemes es un modelo de sintesis de voz (text-to-speech) en espanol basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir de su toolkit TTS (version 0.8.0) y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo toma texto en espanol a nivel de caracteres (grafemas) y genera audio WAV directamente, sin necesidad de un fonemizador externo basado en diccionario, lo que simplifica el pipeline de inferencia.

El modelo se distribuye en formato ONNX, lo que permite ejecucion en CPU sin dependencias de CUDA ni de frameworks de deep learning pesados, y esta integrado en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Su licencia BSD-3-Clause permite uso comercial con atribucion, lo que lo hace atractivo para asistentes de voz embebidos y aplicaciones de sintesis ligera.

Es relevante ahora como pieza de infraestructura para despliegues de TTS de bajo coste en espanol, especialmente en entornos con recursos limitados (Raspberry Pi, contenedores sin GPU) donde modelos mas grandes como XTTS o Bark resultan inviables. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su caracter compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | espanol (es) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas), via `GraphemePhonemizer` de scriptconv |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python / OVOS) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional condicionado por alineamiento monotono (MAS, Monotonic Alignment Search), un decoder generativo basado en flujos normales y un discriminador adversarial multi-periodo entrenado con perdida GAN. El resultado es un modelo que genera waveforms directamente desde texto sin necesidad de un vocoder separado, con calidad cercana a la de sistemas en dos etapas pero con menor latencia.

Este checkpoint concreto fue entrenado por Coqui sobre el corpus CSS10 (Common Voice Single Speaker 10), un dataset multilingue de audio de un solo hablante por idioma. La variante `graphemes` indica que la entrada se procesa a nivel de caracteres en lugar de fonemas, lo que elimina la dependencia de un lexico de pronunciacion pero puede reducir la precision en palabras con ortografia irregular. No se dispone de informacion sobre el numero exacto de horas de audio, tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en TTS clasico). Phoonnx se limita a exportar los pesos originales a ONNX y a integrar el front-end de texto mediante scriptconv.

## Capacidades

- Sintesis de voz en espanol a partir de texto plano, generando audio WAV.
- Entrada a nivel de grafemas: no requiere diccionario fonetico ni G2P externo.
- Inferencia en CPU mediante ONNX Runtime, sin GPU.
- Integracion con OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Normalizacion de texto delegada a scriptconv (numeros, abreviaturas y conversion de script).
- Voz unica (single speaker); no soporta cambio de hablante ni clonacion.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking (no aplica a un modelo TTS).
- Capacidad multilingue limitada exclusivamente al espanol.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y sintetiza respuestas del asistente en espanol sin GPU, lo que encaja en dispositivos tipo Raspberry Pi.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: al ocupar ~0,1 GB y ejecutarse en ONNX Runtime, puede empaquetarse dentro de la propia aplicacion para generar avisos hablados offline.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla a voz en tiempo real en sistemas de bajo consumo, con latencia reducida al no requerir fonemizacion externa.
- Sistemas de megafonia y anuncios automatizados en transporte o comercio: generacion de mensajes pregrabados o dinamicos en espanol para reproduccion en altavoces, con licencia BSD-3-Clause que permite uso comercial.
- Prototipado rapido de interfaces conversacionales: validacion de flujos de voz en fases tempranas de desarrollo sin incurrir en costes de API de TTS en la nube.
- Generacion de audiolibros o contenido educativo de dominio publico: sintesis por lotes de textos largos divididos en frases, ejecutable en servidores sin GPU para reducir costes operativos.
- Pruebas de regresion en pipelines de TTS: uso como voz de referencia ligera para comparar calidad o latencia frente a otros modelos en integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU mediante ONNX Runtime. El repositorio ocupa ~0,1 GB, por lo que la huella en RAM es del orden de cientos de MB.
- GPU recomendadas: no requiere GPU. En caso de usarse, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, pero no hay datos publicados de rendimiento.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU (Raspberry Pi, mini-PC, contenedores).
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-es-css10-graphemes (este) | no disponible | grafemas, por frase | es | BSD-3-Clause | ONNX | Hugging Face, phoonnx |
| Coqui XTTS v2 | no disponible | texto + referencia de hablante | multilingue | Coqui Public Model License (no comercial en algunos usos) | PyTorch | Hugging Face, coqui-ai/TTS |
| Piper (voces es_ES) | no disponible | fonemas | es | MIT (mayoria de voces) | ONNX | GitHub rhasspy/piper |
| Bark (Suno) | no disponible | texto | multilingue | MIT | PyTorch | Hugging Face |

La comparativa se limita a datos publicos generales; no se dispone de cifras de rendimiento comparables en la informacion proporcionada. Frente a XTTS v2, este modelo sacrifica clonacion de voz y multilingue a cambio de licencia permisiva y ejecucion en CPU. Frente a Piper, la diferencia principal es la entrada por grafemas (sin G2P) y la integracion con OVOS.

## Limitaciones y advertencias

- Voz unica y corpus CSS10 de dominio limitado: la prosodia y cobertura lexica pueden ser pobres fuera del dominio de entrenamiento.
- Entrada por grafemas: mayor riesgo de pronunciacion incorrecta en palabras con ortografia irregular, extranjerismos o siglas, al no usar diccionario fonetico.
- Riesgo de alucinacion acustica: en textos muy largos o con caracteres no soportados puede generar artefactos, silencios o repeticiones; se recomienda dividir en frases.
- Solo espanol: no soporta otros idiomas ni cambio de hablante.
- Sin datos publicados de benchmarks ni de calidad MOS: la evaluacion subjetiva queda a cargo del integrador.
- Licencia BSD-3-Clause: permite uso comercial con atribucion, pero conviene verificar la cadena de licencias del corpus CSS10 y de los pesos originales de Coqui.
- El modelo depende del ecosistema phoonnx/scriptconv para el front-end de texto; cambios en esas librerias pueden alterar la salida.
- No apto para clonacion de voz, TTS expresivo ni control de emocion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es-css10-graphemes
- Pesos originales de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--es--css10--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Coqui TTS: https://github.com/coqui-ai/TTS
- Dataset CSS10: https://github.com/Kyubyong/css10
