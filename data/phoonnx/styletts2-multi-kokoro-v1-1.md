# Phoonnx/styletts2-multi-kokoro-v1.1

## Resumen

styletts2-multi-kokoro-v1.1 es un paquete de inferencia ONNX del modelo de sintesis de voz Kokoro-82M-v1.1-zh, desarrollado originalmente por hexgrad y empaquetado por Phoonnx para su libreria de TTS ONNX. El modelo subyacente emplea la arquitectura StyleTTS2 y esta orientado a la sintesis de voz multilingue en ingles (variantes en-GB y en-US) y chino mandarin. Su relevancia radica en que ofrece sintesis neuronal de calidad con un modelo compacto de 82 millones de parametros, ejecutable en CPU mediante ONNX Runtime, lo que lo hace adecuado para despliegues ligeros y entornos embebidos.

El repositorio no contiene pesos en formato PyTorch, sino artefactos ONNX listos para su uso con la libreria phoonnx, que gestiona la carga del modelo, la seleccion de voces y el front-end de texto. El front-end delega en la libreria scriptconv, que normaliza el texto y aplica fonemizadores especificos: misaki_en para ingles (fonemas en alfabeto IPA) y misaki_zh para chino (fonemas en bopomofo). El paquete incluye un amplio conjunto de voces predefinidas identificadas por codigos (af_, bf_, zf_, zm_) que cubren voces femeninas y masculinas en ambos idiomas.

La licencia declarada es Apache 2.0, heredada del modelo upstream, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un modelo de 82M de parametros cuantizado o exportado a ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | 82M (segun el nombre del modelo upstream Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-GB, en-US, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un generador acustico con un discriminador de estilo y modulos de prosodia. A diferencia de los modelos autorregresivos, StyleTTS2 esta disenado para inferencia no autoregresiva, lo que reduce la latencia y facilita el despliegue en produccion. El paquete distribuido por Phoonnx contiene la conversion ONNX del modelo Kokoro-82M-v1.1-zh, realizada por onnx-community, y no incluye informacion sobre el proceso de entrenamiento original.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas mas alla de la propia arquitectura StyleTTS2. El modelo upstream Kokoro-82M-v1.1-zh de hexgrad es la referencia para detalles de entrenamiento, pero dichos detalles no se recogen en esta ficha.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles (en-GB, en-US) y chino mandarin (zh).
- Normalizacion y conversion de texto mediante el front-end scriptconv, con fonemizadores misaki_en (IPA) y misaki_zh (bopomofo).
- Multiples voces predefinidas: 3 voces en ingles (af_maple, af_sol, bf_vale) y un amplio conjunto de voces en chino (prefijos zf_ y zm_).
- Inferencia mediante ONNX Runtime, lo que permite ejecucion en CPU y en entornos sin GPU.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Generacion de audio en formato WAV a traves de la API de phoonnx.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni agentes.

## Casos de uso

- Asistentes de voz en ingles y chino: el modelo puede sintetizar respuestas habladas en un asistente conversacional integrado en OVOS, seleccionando la voz adecuada mediante la configuracion del plugin ovos-tts-plugin-phoonnx.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de lectura, con voces en en-GB, en-US y zh, ejecutandose en CPU sin necesidad de GPU.
- Generacion de audiolibros y narraciones: sintesis por lotes de textos largos en ingles o chino, usando las voces femeninas y masculinas disponibles para adaptar el tono al contenido.
- Sistemas de anuncios y notificaciones por voz: integracion en pipelines de backend que generan avisos hablados en tiempo real, aprovechando la inferencia ONNX de baja latencia.
- Prototipado rapido de interfaces de voz: uso de la API de phoonnx en Python para generar muestras de audio en fases de diseno de producto, sin depender de servicios en la nube.
- Localizacion de contenido multimedia: doblaje o sustitucion de pistas de audio en ingles y chino para videos y presentaciones, con voces predefinidas que cubren ambos idiomas.
- Investigacion en sintesis de voz: uso del modelo como linea base StyleTTS2 en experimentos de prosodia y fonemizacion, gracias a su licencia Apache 2.0 y su formato ONNX reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de 82M de parametros en formato ONNX, es probable que la inferencia en CPU sea viable, pero no se proporcionan cifras de memoria.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU especificos.
- Compatibilidad con GPU de consumo: no disponible. El diseno ONNX sugiere que puede ejecutarse en CPU, pero no se confirma el rendimiento en GPUs como RTX 4090.
- Opciones de despliegue: phoonnx (Python) y el plugin ovos-tts-plugin-phoonnx para OVOS. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| styletts2-multi-kokoro-v1.1 (este) | 82M | en-GB, en-US, zh | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| hexgrad/Kokoro-82M-v1.1-zh | 82M | en, zh | Apache 2.0 | no disponible | Hugging Face (hexgrad) |
| onnx-community/Kokoro-82M-v1.1-zh-ONNX | 82M | en, zh | no disponible | ONNX | Hugging Face (onnx-community) |

La comparativa se limita a las variantes del mismo modelo upstream, ya que no se dispone de informacion sobre otros modelos TTS comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado con datos de voz en ingles y chino, puede reflejar sesgos de los corpus de entrenamiento originales.
- Riesgo de alucinacion: en TTS, el riesgo se traduce en pronunciaciones incorrectas o prosodia inadecuada ante texto fuera de dominio o fonemas no cubiertos por los fonemizadores.
- Limitaciones de contexto o idioma: solo soporta en-GB, en-US y zh; no se documentan otros idiomas. El texto debe pasar por los fonemizadores misaki_en o misaki_zh, lo que limita la entrada a texto compatible con dichos front-ends.
- Restricciones de licencia: Apache 2.0 permite uso comercial con obligaciones de atribucion; no se documentan restricciones adicionales.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad. La libreria phoonnx se instala con `pip install --pre`, lo que indica que puede ser una version preliminar. No se documentan pruebas de calidad ni metricas objetivas (MOS, WER) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-multi-kokoro-v1.1
- Modelo upstream: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Conversion ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.1-zh-ONNX
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
