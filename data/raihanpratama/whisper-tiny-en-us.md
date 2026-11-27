# raihanpratama/whisper-tiny-en-us

## Resumen

Whisper Tiny - en-US es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario raihanpratama en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, especializado en transcripcion de audio en ingles estadounidense mediante entrenamiento sobre el conjunto de datos PolyAI/minds14. El modelo resuelve la tarea de convertir voz en texto y esta pensado como una variante ligera para entornos con recursos limitados.

Con 37,76 millones de parametros y un tamano de repositorio de 0,2 GB, es un modelo extremadamente compacto que puede ejecutarse en hardware modesto, incluidas CPU y GPUs de consumo. Su relevancia radica en su bajo coste computacional y en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. No obstante, al tratarse de un ajuste sobre whisper-tiny con solo 200 pasos de entrenamiento, sus prestaciones son limitadas y debe evaluarse con cautela antes de usarlo en produccion.

La model card es escasa: el autor no ha documentado la descripcion del modelo, los usos previstos ni los datos de entrenamiento mas alla de la referencia al dataset minds14. La informacion disponible proviene fundamentalmente de los metadatos del repositorio y de los hiperparametros de entrenamiento registrados automaticamente por el Trainer de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para procesar espectrogramas de audio Mel y generar transcripciones token a token. Whisper emplea una ventana de audio de 30 segundos y un vocabulario multilingue en el modelo original; en este ajuste el entrenamiento se ha orientado al ingles (en-US).

El ajuste fino se realizo sobre el dataset PolyAI/minds14 con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 16, batch de evaluacion de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler constant_with_warmup con 50 pasos de calentamiento, 200 pasos de entrenamiento totales y precision mixta nativa (AMP). No se documenta el numero de tokens de audio utilizados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. Las versiones de framework empleadas fueron Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles estadounidense: transcripcion de audio a texto.
- Modelo encoder-decoder de Whisper tiny, adecuado para tareas de transcripcion de utterances cortas.
- Capacidad multilingue limitada: solo se declara soporte para ingles; no se garantiza rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo thinking.
- No se documenta capacidad de diarizacion, marcas de tiempo ni traduccion.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el modelo puede convertir mensajes de voz cortos en texto en el dispositivo o en servidores de baja capacidad gracias a sus 37,76 M de parametros y su reducido tamano de 0,2 GB.
- Prototipado rapido de pipelines ASR: util como linea base para validar una arquitectura de reconocimiento de voz antes de invertir en modelos mayores, dado su bajo coste de inferencia.
- Subtitulado automatico de contenido en ingles en entornos con recursos limitados: puede generar transcripciones de fragmentos de audio de hasta 30 segundos por ventana.
- Transcripcion de llamadas de atencion al cliente en ingles: el ajuste sobre minds14 (dataset de intenciones bancarias) puede ser util en dominios conversacionales similares, aunque requiere validacion previa.
- Educacion y accesibilidad: conversion de clases o apuntes hablados en ingles a texto para estudiantes, con la ventaja de poder ejecutarse en hardware de consumo.
- Investigacion y experimentacion: punto de partida para estudiar el efecto del ajuste fino sobre whisper-tiny con datasets pequenos y pocos pasos de entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| WER | PolyAI/minds14 | 0,2802 (28,02 %) |
| Loss (evaluacion) | PolyAI/minds14 | 0,4340 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,6421 | 1,7241 | 50 | 0,4891 | 36,1309 |
| 0,2690 | 3,4483 | 100 | 0,4340 | 28,0228 |
| 0,1179 | 5,1724 | 150 | 0,4550 | 30,0142 |
| 0,0341 | 6,8966 | 200 | 0,4868 | 30,5832 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para los 37,76 M de parametros; en fp16 o int8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en GPUs integradas.
- Opciones de despliegue: Transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa para ASR, llama.cpp no soporta Whisper, alternativas como faster-whisper o whisper.cpp pueden requerir conversion de pesos; TGI no esta orientado a ASR.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| raihanpratama/whisper-tiny-en-us | 37,76 M | ventana de 30 s (Whisper) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M aprox. | ventana de 30 s | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M aprox. | ventana de 30 s | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M aprox. | ventana de 30 s | apache-2.0 | Hugging Face |

El modelo ajustado parte de whisper-tiny y comparte su licencia y disponibilidad. No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer diferencias de rendimiento frente a whisper-base o whisper-small.

## Limitaciones y advertencias

- El WER declarado del 28,02 % es elevado para aplicaciones de produccion; debe validarse en el dominio concreto de uso.
- El ajuste se realizo con solo 200 pasos de entrenamiento, lo que puede provocar sobreajuste al dataset minds14 y escasa generalizacion.
- La model card no documenta sesgos conocidos, riesgos de alucinacion ni limitaciones especificas; se recomienda evaluar el modelo con datos propios.
- Soporte unicamente de ingles; no se garantiza calidad en otros idiomas ni en acentos no estadounidenses.
- La ventana de audio de Whisper es de 30 segundos; audios mas largos requieren segmentacion manual.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se documentan procesos de RLHF, DPO ni evaluacion de sesgos; el uso en produccion requiere auditoria previa.

## Enlaces

- Hugging Face: https://huggingface.co/raihanpratama/whisper-tiny-en-us
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/PolyAI/minds14
