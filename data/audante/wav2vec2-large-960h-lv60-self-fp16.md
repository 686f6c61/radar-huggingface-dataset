# Audante/wav2vec2-large-960h-lv60-self-fp16

## Resumen

`Audante/wav2vec2-large-960h-lv60-self-fp16` es una conversion a precision float16 del modelo de reconocimiento automatico del habla (ASR) `facebook/wav2vec2-large-960h-lv60-self` de Meta AI. No se trata de un modelo nuevo ni reentrenado: el autor ha tomado los pesos originales de la revision `54074b1c16f4de6a5ad59affb4caa8f2ea03a119`, los ha convertido a float16 y los ha guardado en formato safetensors, regenerando ademas los ficheros del procesador con transformers 5.22.1.

El modelo subyacente es un transformer encoder de tipo wav2vec2 con 315.471.520 parametros, entrenado con auto-supervision sobre 960 horas de audio de LibriSpeech (LV-60k self-supervised) y afinado posteriormente para transcripcion. Su proposito es convertir senal de audio en texto, principalmente en ingles, con una ventana de entrada de audio de aproximadamente 30 segundos por pasada.

La relevancia de esta ficha es practica: ofrece una version en media precision que reduce a la mitad el espacio en disco y la VRAM necesaria respecto al checkpoint original en float32, manteniendo la misma arquitectura y pesos. Es util para despliegues con recursos limitados, aunque conviene tener en cuenta que es una publicacion no oficial, sin descargas ni validacion comunitaria, y que la cuantizacion a fp16 puede introducir pequenas diferencias numericas en la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder convolucional + atencion, preentrenamiento auto-supervisado) |
| Parametros totales | 315.471.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada tipica de ~30 s por segmento) |
| Tipos de cuantizacion | float16 (esta version); el modelo base admite float32 y cuantizaciones posteriores (int8, GGUF) no incluidas en este repo |
| Idiomas soportados | no disponible en la informacion (el modelo base esta orientado a ingles, LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2: una pila de capas convolucionales que extraen representaciones del audio crudo ( waveform a 16 kHz), seguida de un transformer encoder con atencion multi-cabeza que modela dependencias temporales. El preentrenamiento es auto-supervisado, con objetivos de tipo contrastivo y diversidad de codigos sobre audio sin etiquetar; en este caso, sobre 960 horas de LibriSpeech (LV-60k) en su variante self-supervised. Posteriormente, el modelo se afina con CTC (Connectionist Temporal Classification) sobre transcripciones para la tarea de reconocimiento del habla.

Esta version concreta no introduce cambios de arquitectura ni reentrenamiento: el autor unicamente convierte los pesos a float16, los serializa en safetensors y regenera los ficheros del procesador (feature extractor y tokenizer) con transformers 5.22.1. No se dispone de informacion sobre el dataset exacto de afinado, el numero de tokens de audio, ni sobre el uso de RLHF o DPO, que en un modelo ASR de este tipo no resultan aplicables de la forma habitual.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto con salida CTC.
- Procesamiento de audio de entrada a 16 kHz mediante el feature extractor incluido.
- Transcripcion de segmentos de audio de duracion moderada (ventana tipica de ~30 s), con posibilidad de trocear audios largos.
- Orientado principalmente a ingles (modelo base entrenado con LibriSpeech); el soporte de otros idiomas no esta documentado en esta ficha.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, vision ni audio generativo; es un modelo exclusivamente de transcripcion.
- No es un modelo de chat ni de generacion de texto libre.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte grabaciones de audio en texto plano, adecuado para actas automaticas en ingles con audio de calidad razonable.
- Subtitulado de videos: se puede segmentar la pista de audio en fragmentos de ~30 s, transcribir cada uno y sincronizar los subtitulos, aprovechando el formato fp16 para reducir recursos en el servidor.
- Pipeline de atencion al cliente con voz: transcripcion de llamadas grabadas para analitica y busqueda posterior, integrando el modelo como primer eslabon de un sistema de speech-to-text.
- Generacion de datasets etiquetados: transcripcion masiva de corpus de audio para crear pares audio-texto que alimenten otros modelos o sistemas de recuperacion.
- Accesibilidad: conversion de contenido en audio (podcasts, clases) a texto para lectores de pantalla y busqueda indexada.
- Prototipado en entornos con GPU consumer: al estar en fp16 y ocupar aproximadamente 0,6 GB en el repositorio, es viable probarlo en tarjetas con 4-8 GB de VRAM para experimentos de ASR.
- Verificacion de calidad de audio en produccion: transcripcion de muestras para detectar silencios, ruido o fallos en la cadena de captura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate) ni comparaciones con el checkpoint original en float32, por lo que no se puede cuantificar el impacto de la conversion a fp16 en la precision de transcripcion.

## Requisitos de hardware

- VRAM estimada: con 315,5 M de parametros en float16, los pesos ocupan aproximadamente 0,63 GB; sumando activaciones y buffers de atencion, se estima un uso de 1-2 GB de VRAM para inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: transformers (con `Wav2Vec2ForCTC` y `AutoProcessor`), pipelines de Hugging Face, y servidores de inferencia compatibles con safetensors; no se documenta soporte especifico para vLLM, TGI o llama.cpp en esta ficha.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del troceado del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Audante/wav2vec2-large-960h-lv60-self-fp16 | 315,5 M | audio ~30 s por segmento | Apache 2.0 | Hugging Face (0 descargas) |
| facebook/wav2vec2-large-960h-lv60-self | 315,5 M | audio ~30 s por segmento | Apache 2.0 | Hugging Face (modelo base oficial) |
| facebook/wav2vec2-base-960h | ~95 M | audio ~30 s por segmento | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | ~1.550 M | audio 30 s por ventana | Apache 2.0 | Hugging Face |

La comparativa con whisper-large-v3 se incluye como referencia de categoria ASR, aunque es un modelo multilingue y de mayor tamano; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. Frente al modelo base oficial, la unica diferencia documentada es la precision float16 y el formato safetensors.

## Limitaciones y advertencias

- Publicacion no oficial: el autor indica explicitamente que no es un lanzamiento oficial de Meta AI; los derechos del modelo permanecen con sus autores.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de pruebas independientes.
- Riesgo de degradacion por fp16: la conversion a media precision puede introducir diferencias numericas frente al checkpoint original en float32; no se han publicado mediciones de WER que lo cuantifiquen.
- Idioma: el modelo base esta orientado a ingles (LibriSpeech); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Sesgos: no se documentan analisis de sesgos; al entrenarse con LibriSpeech, puede tener peor rendimiento con acentos no estadounidenses, audio ruidoso o habla espontanea.
- Alucinacion: en ASR, el riesgo se manifiesta como transcripciones incorrectas o palabras inventadas en segmentos con ruido o silencio; conviene aplicar umbrales de confianza y revision humana.
- Contexto: la ventana de ~30 s obliga a trocear audios largos, con posible perdida de contexto entre segmentos.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribuir al modelo base.
- Produccion: al no haber benchmarks ni validacion, se recomienda evaluar el WER en el dominio propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audante/wav2vec2-large-960h-lv60-self-fp16
- Modelo base oficial: https://huggingface.co/facebook/wav2vec2-large-960h-lv60-self
- Revision del modelo base citada: https://huggingface.co/facebook/wav2vec2-large-960h-lv60-self/tree/54074b1c16f4de6a5ad59affb4caa8f2ea03a119
- Paper de wav2vec 2.0 (Baevski et al.): https://arxiv.org/abs/2006.11477
- Repositorio de transformers: https://github.com/huggingface/transformers
