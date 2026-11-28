# pyarovrindavan/whisper-small-hi-disfluency-improved

## Resumen

`pyarovrindavan/whisper-small-hi-disfluency-improved` es un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Whisper de OpenAI, en su variante "small". Lo publica el usuario pyarovrindavan en Hugging Face. Por el nombre se deduce que se trata de un ajuste fino orientado a hindi ("hi") con un enfasis declarado en la mejora del tratamiento de disfluencias (pausas, repeticiones, titubeos), aunque la model card no documenta ni el proceso de entrenamiento ni el dataset utilizado.

El modelo resuelve la tarea de transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de transformers. Su relevancia practica radica en que, si el ajuste fino cumple lo que sugiere el nombre, permitiria transcribir habla espontanea en hindi con menos artefactos derivados de las disfluencias tipicas del habla natural, un problema habitual en transcripcion de entrevistas, reuniones o llamadas. No obstante, al no existir documentacion tecnica publicada, estas capacidades no pueden verificarse a partir de la informacion disponible.

El checkpoint cuenta con 241.734.912 parametros en formato safetensors y un repositorio de aproximadamente 1,0 GB. La model card es la plantilla autogenerada de Hugging Face, sin datos de autor, licencia, idiomas, datos de entrenamiento ni evaluacion. El modelo registra cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), variante "small" |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors en el repo) |
| Idiomas soportados | no disponible (el sufijo "hi" sugiere hindi; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un modelo transformer encoder-decoder entrenado originalmente por OpenAI para transcripcion y traduccion de voz (paper arXiv:1910.09700, referenciado en los tags del repositorio). La variante "small" de Whisper emplea 12 capas de encoder y 12 de decoder con una dimension de modelo de 768 y 12 cabezas de atencion, lo que da lugar a los aproximadamente 242 millones de parametros reportados. El modelo procesa espectrogramas mel de audio y genera tokens de texto de forma autoregresiva.

No hay informacion disponible sobre el proceso de ajuste fino: ni el numero de horas de audio utilizadas, ni la composicion del dataset, ni si se aplicaron tecnicas de aumento de datos, ni hiperparametros de entrenamiento. El nombre del checkpoint sugiere un ajuste sobre datos con disfluencias en hindi, pero no se aporta ninguna evidencia documental. Tampoco se especifica si se partio de `openai/whisper-small` o de otro checkpoint intermedio.

## Capacidades

- Transcripcion de voz a texto (ASR) mediante la pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de audio en ventanas (comportamiento estandar de Whisper, no confirmado en la model card).
- Posible tratamiento mejorado de disfluencias en hindi, segun el nombre del checkpoint, sin verificacion documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingues: no disponible; el identificador apunta a hindi, pero no se documenta.
- Capacidades especiales (modo thinking, vision, audio adicional): no disponible.

## Casos de uso

- Transcripcion de entrevistas en hindi: el modelo podria generar transcripciones de audio conversacional donde las pausas y repeticiones son frecuentes, aprovechando el ajuste declarado sobre disfluencias. Requiere validacion previa con muestras propias.
- Subtitulado de contenido audiovisual en hindi: integrable en pipelines de postproduccion que necesiten segmentos de texto alineados con el audio.
- Generacion de actas de reuniones: transcripcion de reuniones en hindi para su posterior resumen con un LLM, siempre que la calidad del ASR se valide en el dominio concreto.
- Analisis de llamadas de atencion al cliente: conversion de grabaciones a texto para mineria de motivos de contacto y control de calidad, con la salvedad de que el modelo no esta documentado para dominios especializados.
- Investigacion en ASR sobre disfluencias: uso como punto de partida o baseline en estudios comparativos sobre normalizacion de habla espontanea en hindi.
- Prototipado rapido con transformers: al ser un checkpoint de 242 M de parametros en safetensors, permite experimentar en entornos con recursos moderados sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, ni metricas WER/CER, ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB solo para pesos (242 M de parametros x 4 bytes), mas memoria para activaciones y buffers de audio.
- VRAM estimada en fp16/bf16: en torno a 0,5 GB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para volumenes moderados.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (pipeline de ASR), y potencialmente servidores compatibles con la API de transformers; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| pyarovrindavan/whisper-small-hi-disfluency-improved | 241,7 M | no disponible | no disponible | Hugging Face |
| openai/whisper-small | 241,7 M | ventanas de 30 s | MIT (modelo original) | Hugging Face |
| openai/whisper-small (variantes fine-tuned para hindi) | ~242 M | ventanas de 30 s | variable segun autor | Hugging Face |
| whisper-medium | 769 M | ventanas de 30 s | MIT | Hugging Face |

La comparacion con `openai/whisper-small` es la mas directa por identidad de arquitectura y numero de parametros. Las diferencias en calidad solo podrian establecerse con una evaluacion WER sobre un corpus hindi con disfluencias, dato que no esta disponible para este checkpoint.

## Limitaciones y advertencias

- La model card esta vacia (plantilla autogenerada): no hay informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion.
- Licencia no especificada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Cero descargas y cero "likes": no hay evidencia de uso comunitario ni de validacion externa.
- Riesgo de alucinacion en la transcripcion: los modelos Whisper pueden generar texto no presente en el audio, especialmente en silencios o audio ruidoso; sin evaluacion publicada no puede acotarse este riesgo.
- Sesgos desconocidos: al no documentarse el dataset de ajuste fino, no puede evaluarse el sesgo por acento, genero o registro.
- Idioma no confirmado: el sufijo "hi" sugiere hindi, pero no se garantiza el comportamiento en otros idiomas ni la variedad de hindi cubierta.
- Sin garantias de calidad: no debe usarse en produccion sin una evaluacion WER propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyarovrindavan/whisper-small-hi-disfluency-improved
- Paper de Whisper (referenciado en los tags): https://arxiv.org/abs/1910.09700
