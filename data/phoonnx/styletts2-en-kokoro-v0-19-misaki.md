# Phoonnx/styletts2-en-kokoro-v0.19-misaki

## Resumen

styletts2-en-kokoro-v0.19-misaki es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, originalmente entrenado por hexgrad como parte del proyecto Kokoro (version legacy v0.19) y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo convierte texto en ingles en audio, tomando como entrada fonemas en alfabeto IPA generados por el fonemizador misaki_en.

El modelo esta orientado a la sintesis de voz en ingles britanico (en-GB) y estadounidense (en-US), con once voces predefinidas que cubren voces femeninas y masculinas en ambos acentos. Su empaquetado en ONNX y su integracion con phoonnx y OVOS lo hacen adecuado para despliegues locales y embebidos, sin dependencia de frameworks de deep learning pesados en tiempo de inferencia.

Con un tamano de repositorio de 0,1 GB y licencia Apache 2.0, es una opcion ligera para aplicaciones de asistente de voz, lectura de texto y sistemas de accesibilidad. La informacion publica disponible es limitada: no se detallan parametros, contexto ni datos de entrenamiento mas alla de la arquitectura y el origen del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-GB, en-US |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un generador acustico con un decodificador y un discriminador de estilo, disenado para producir habla natural con control de estilo. La version empaquetada aqui corresponde al checkpoint legacy v0.19 de hexgrad, convertido a ONNX a partir de la conversion publicada en onnx-community/Kokoro-82M-ONNX.

La entrada del modelo son fonemas en alfabeto IPA generados por el fonemizador misaki_en, que forma parte de la libreria scriptconv. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El empaquetado por parte de Phoonnx consiste en la conversion y organizacion de los pesos para su carga mediante la libreria phoonnx, que gestiona las voces y la sintesis a WAV.

## Capacidades

- Sintesis de voz a partir de texto en ingles (en-GB y en-US).
- Once voces predefinidas: af, af_bella, af_nicole, af_sarah, af_sky, am_adam, am_michael, bf_emma, bf_isabella, bm_george, bm_lewis.
- Entrada basada en fonemas IPA mediante el fonemizador misaki_en.
- Normalizacion de texto y conversion de script a traves de scriptconv.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Generacion de audio en formato WAV.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS mediante el plugin ovos-tts-plugin-phoonnx para sintetizar respuestas habladas en ingles sin depender de servicios en la nube, gracias a su formato ONNX y su bajo peso (0,1 GB).
- Lectura de texto y accesibilidad: conversion de articulos, documentos o notificaciones a audio en ingles con voces masculinas y femeninas en ambos acentos, util para lectores de pantalla y aplicaciones de accesibilidad.
- Sistemas embebidos y edge computing: al estar en ONNX y ocupar poco espacio, puede desplegarse en dispositivos con recursos limitados donde no es viable ejecutar modelos TTS de mayor tamano.
- Generacion de audiolibros y narracion: las multiples voces permiten asignar voces distintas a personajes o secciones, con salida WAV lista para postprocesado.
- Prototipado rapido de interfaces conversacionales: la API de phoonnx permite cargar una voz y sintetizar frases en pocas lineas de codigo, lo que acelera la validacion de productos de voz.
- Localizacion de contenido para mercados en-GB y en-US: permite generar versiones en audio con acento britanico o estadounidense segun el publico objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPUs consumer sin requisitos especiales.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamano del repositorio.
- Opciones de despliegue: libreria phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y runtime ONNX. No se documentan integraciones con vLLM, llama.cpp o TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| styletts2-en-kokoro-v0.19-misaki | StyleTTS2 | no disponible | en-GB, en-US | apache-2.0 | ONNX |
| onnx-community/Kokoro-82M-ONNX | Kokoro (StyleTTS2) | 82M (segun nombre del repo) | no disponible en la informacion | no disponible en la informacion | ONNX |
| hexgrad/kLegacy v0.19 | StyleTTS2 | no disponible | en | apache-2.0 (segun la model card) | no disponible |

La comparativa se limita a los proyectos de origen y conversion citados en la model card; no se dispone de datos de rendimiento para comparar con otras alternativas TTS.

## Limitaciones y advertencias

- Solo soporta ingles (en-GB y en-US); no es multilingue.
- Requiere texto de entrada en fonemas IPA mediante misaki_en; el pipeline de phoonnx y scriptconv realiza esta conversion, pero errores en la normalizacion pueden degradar la sintesis.
- No se dispone de informacion sobre sesgos de voz, calidad en dominios especificos ni robustez ante texto ruidoso.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del checkpoint upstream (hexgrad/kLegacy) y de la conversion ONNX de origen.
- La informacion publica es escasa: no hay datos de parametros, entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- El modelo tiene muy pocas descargas (15) y ningun like, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/styletts2-en-kokoro-v0.19-misaki](https://huggingface.co/Phoonnx/styletts2-en-kokoro-v0.19-misaki)
- [Upstream: hexgrad/kLegacy v0.19](https://huggingface.co/hexgrad/kLegacy/tree/main/v0.19)
- [Conversion ONNX: onnx-community/Kokoro-82M-ONNX](https://huggingface.co/onnx-community/Kokoro-82M-ONNX)
- [Coleccion StyleTTS2 de Phoonnx](https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
