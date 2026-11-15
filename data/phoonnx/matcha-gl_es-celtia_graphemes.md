# Phoonnx/matcha-gl_es-celtia_graphemes

## Resumen

matcha-gl_es-celtia_graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nos y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera audio a partir de texto en gallego (codigo de idioma `gl`, variante `gl-ES`) y se distribuye como un artefacto ONNX listo para inferencia, con un tamano de repositorio de aproximadamente 0,1 GB.

El modelo no es un LLM ni un modelo de lenguaje: es un sistema TTS de sintesis acustica que convierte caracteres (grafemas) en representaciones acusticas intermedias que posteriormente se transforman en forma de onda. Su relevancia radica en que cubre una lengua de bajos recursos como el gallego dentro del ecosistema phoonnx/OVOS, lo que permite integrar sintesis de voz en gallego en asistentes y aplicaciones de voz open source sin depender de servicios en la nube.

La ficha se elabora a partir de la informacion disponible en Hugging Face y en la model card del autor. Los datos tecnicos detallados sobre entrenamiento, numero de parametros y benchmarks no estan publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico TTS no autorregresivo basado en flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la entrada es texto de longitud variable) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; el empaquetado phoonnx no detalla cuantizaciones) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un sistema de sintesis de voz no autorregresivo que emplea flow matching para generar representaciones acusticas (mel-espectrogramas) a partir de la entrada de texto, que posteriormente se convierten en audio mediante un vocoder. La entrada textual se procesa con un front-end de grafemas: el modelo recibe directamente caracteres del texto, sin conversion fonetica previa, mediante el `GraphemePhonemizer` de la libreria scriptconv.

El modelo es un empaquetado del modelo upstream `proxectonos/Nos_TTS-celtia-matcha-graphemes`, desarrollado por Proxecto Nos. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial. Tampoco se detallan innovaciones adicionales mas alla del enfoque grapheme-to-speech y el empaquetado ONNX para inferencia.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en gallego (`gl-ES`).
- Entrada basada en grafemas: no requiere conversion fonetica externa, el front-end `GraphemePhonemizer` de scriptconv normaliza y convierte el texto.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al gallego segun la model card.

## Casos de uso

- Asistentes de voz en gallego: integracion en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz en gallego a asistentes domesticos open source, configurando la voz `proxectonos/celtia-matcha-graphemes` en `mycroft.conf`.
- Lectura de contenido web o documentos: conversion de texto a audio en gallego para aplicaciones de accesibilidad, usando la API de phoonnx para sintetizar frases y volcar el resultado a WAV.
- Sistemas de anuncios o avisos automatizados: generacion de mensajes hablados en gallego en entornos como transporte publico o comercios, aprovechando la inferencia ONNX ligera (repositorio de 0,1 GB).
- Prototipado de interfaces conversacionales: uso del modelo como capa TTS en pipelines de voz (ASR + LLM + TTS) para demos en gallego, gracias a su empaquetado listo para Python.
- Investigacion en lenguas de bajos recursos: estudio y evaluacion de TTS en gallego con un modelo de licencia Apache 2.0 y pesos ONNX reproducibles.
- Integracion en aplicaciones de lectura por voz: sintesis de frases de longitud variable con entrada directa de grafemas, sin necesidad de construir un lexico fonetico propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de 0,1 GB sugiere un modelo ligero que probablemente cabe en GPU consumer de gama baja, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por el tamano del artefacto (0,1 GB) es plausible en GPUs consumer, pero no hay dato oficial.
- Opciones de despliegue: phoonnx (Python y OVOS), con pesos en formato ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| matcha-gl_es-celtia_graphemes | Matcha-TTS | gallego (gl-ES) | Apache 2.0 | ONNX | grafemas |
| proxectonos/Nos_TTS-celtia-matcha-graphemes | Matcha-TTS | gallego | Apache 2.0 | no disponible | grafemas |
| Otros modelos Matcha-TTS de la coleccion Phoonnx | Matcha-TTS | varios | segun modelo | ONNX | segun modelo |

La comparativa se limita al modelo upstream y a la coleccion Matcha-TTS de Phoonnx, ya que no se dispone de datos de benchmarks ni de otros modelos TTS en gallego en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma limitado: solo gallego (`gl-ES`); no soporta castellano ni otras lenguas.
- Entrada por grafemas: la calidad depende de la normalizacion de scriptconv; palabras extranas o abreviaturas pueden pronunciarse de forma incorrecta.
- Riesgo de alucinacion acustica: como todo TTS, puede generar prosodia o pronunciaciones erroneas en textos ambiguos.
- Sesgos: no se documentan sesgos de voz, genero o acento en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y de las dependencias (phoonnx, scriptconv).
- Datos de entrenamiento no publicados: no se puede evaluar la cobertura del dataset ni la calidad en dominios especificos.
- Dependencia de phoonnx en version pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (MOS, WER) en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-celtia_graphemes
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-celtia-matcha-graphemes
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
