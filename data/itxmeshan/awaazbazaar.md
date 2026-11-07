# itxmeshan/AwaazBazaar

## Resumen
AwaazBazaar es un ajuste fino (fine-tuning) del modelo Whisper Medium de OpenAI, especializado en reconocimiento automatico del habla (ASR) para urdu. Lo publica el usuario itxmeshan en Hugging Face bajo licencia Apache 2.0, partiendo del checkpoint `openai/whisper-medium` y entrenando sobre el corpus Common Voice 11.0 de Mozilla. El modelo resuelve la transcripcion de audio en urdu a texto, una tarea para la que el Whisper original ya tiene cierta capacidad pero que mejora con el ajuste especifico.

Arquitectonicamente es un transformer encoder-decoder de tipo seq2seq con 763.857.920 parametros (aproximadamente 764 millones), heredados del Whisper Medium original. El repositorio ocupa 3,1 GB en formato safetensors y se distribuye para su uso con la libreria `transformers`. No es un modelo MoE ni incorpora innovaciones arquitectonicas propias: es un fine-tuning estandar.

La relevancia actual del modelo es limitada: se trata de un ajuste de nicho para un unico idioma, con cero descargas y cero likes en el momento de la ficha, y con una model card que contiene referencias cruzadas a otro identificador (`Abdul145/whisper-medium-urdu-custom`) en el ejemplo de uso, lo que sugiere un posible reempaquetado o copia de otro repositorio. Para produccion en urdu conviene evaluarlo con cautela frente al Whisper Medium original u otros fine-tunings mas consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium) |
| Parametros totales | 763.857.920 (aprox. 764 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-medium |
| Dataset de entrenamiento | mozilla-foundation/common_voice_11_0 |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura Whisper Medium: un transformer encoder-decoder con atencion estandar (no lineal ni SSM), disenado originalmente para ASR multilingue sobre ventanas de audio de 30 segundos. El ajuste fino se realiza sobre `openai/whisper-medium`, que ya incorpora capacidades multilingues; el entrenamiento especifico se apoya en el corpus Common Voice 11.0 de Mozilla para el idioma urdu.

La informacion disponible no detalla el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. La model card indica genericamente "diverse set of Urdu speech data" y cita Common Voice 11.0 como dataset, sin aportar hiperparametros, epochs ni metricas de validacion. No se documentan innovaciones tecnicas adicionales.

## Capacidades
- Transcripcion de audio en urdu a texto (ASR).
- Reconocimiento de habla en conversaciones y contenido audiovisual en urdu.
- Generacion de transcripciones para subtitulado y accesibilidad.
- Procesamiento de audio en ventanas de hasta 30 segundos (limitacion heredada de Whisper).
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta vision, audio multimodal ni modo thinking.
- Capacidad multilingue limitada al urdu segun los tags del repositorio.

## Casos de uso
- Subtitulado automatico de videos en urdu: el modelo transcribe el audio a texto para generar subtitulos, aprovechando el ajuste especifico sobre Common Voice 11.0 para mejorar la precision frente al Whisper generico.
- Transcripcion de reuniones y entrevistas en urdu: util para equipos que necesitan actas o registros escritos de conversaciones grabadas, con procesamiento por segmentos de 30 segundos.
- Accesibilidad para usuarios con discapacidad auditiva: conversion de contenido hablado en urdu a texto para hacerlo accesible en webs y aplicaciones.
- Indexacion y busqueda de archivos de audio en urdu: transcripcion previa para permitir busqueda por texto sobre grabaciones de podcasts o archivos de radio.
- Atencion al cliente en urdu: transcripcion de llamadas o mensajes de voz para su analisis posterior o enrutamiento, aunque sin garantias de calidad en produccion por la falta de benchmarks publicados.
- Investigacion linguistica y ASR: punto de partida para experimentos de reconocimiento de habla en urdu, dado su licencia Apache 2.0 y su formato compatible con `transformers`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), CER ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1,5-2 GB para los pesos (764 M parametros), mas overhead de activaciones y procesador de audio; en la practica, unos 2-3 GB.
- En cuantizacion de 8 bits: alrededor de 1 GB de VRAM; en 4 bits, menos de 1 GB (estimaciones teoricas, no confirmadas en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de gama baja y en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas.
- Opciones de despliegue: `transformers` (libreria indicada), y por compatibilidad con Whisper Medium, potencialmente llama.cpp, faster-whisper, vLLM o TGI, aunque no se documenta soporte explicito en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AwaazBazaar (este) | 764 M | ventanas de 30 s | urdu | Apache 2.0 | Hugging Face, 0 descargas |
| openai/whisper-medium | 764 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Abdul145/whisper-medium-urdu-custom | no disponible | ventanas de 30 s | urdu | no disponible | referenciado en la model card |

El modelo base Whisper Medium ofrece cobertura multilingue y mayor madurez de uso, mientras que este ajuste se limita al urdu y carece de benchmarks publicados que demuestren una mejora medible frente al original.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenar sobre Common Voice 11.0, puede heredar sesgos de representacion del corpus (acentos, genero, edad, procedencia).
- Riesgo de alucinacion: Whisper es propenso a generar texto plausible en silencios o audio ruidoso; no se documenta mitigacion.
- Limitaciones de contexto: procesa ventanas de audio de 30 segundos; audios mas largos requieren segmentacion manual o por pipeline.
- Limitaciones de idioma: solo urdu segun los tags; no se garantiza calidad en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se documentan condiciones adicionales del autor.
- Caveat importante: la model card referencia otro identificador (`Abdul145/whisper-medium-urdu-custom`) en el ejemplo de codigo, lo que sugiere un posible reempaquetado; conviene verificar la procedencia antes de usar en produccion.
- Sin benchmarks publicados ni descargas, no hay evidencia empirica de calidad; se recomienda evaluacion propia con WER sobre datos de validacion en urdu.
- Cero descargas y cero likes en el momento de la ficha: modelo sin validacion comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/itxmeshan/AwaazBazaar
- Modelo base: https://huggingface.co/openai/whisper-medium
- Dataset: https://huggingface.co/datasets/mozilla-foundation/common_voice_11_0
- Repositorio referenciado en la model card: https://huggingface.co/Abdul145/whisper-medium-urdu-custom
- Paper de Whisper: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
