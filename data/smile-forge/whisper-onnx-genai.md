# smile-forge/whisper-onnx-genai

## Resumen

smile-forge/whisper-onnx-genai es un empaquetado de los modelos openai/whisper-small y openai/whisper-small.en exportados al formato ONNX para ser ejecutados con onnxruntime-genai 0.17.1. Lo publica el usuario smile-forge y no introduce pesos nuevos: la exportacion cambia el formato, no los pesos, tal y como se indica en la model card. El repositorio ocupa 2,1 GB y contiene cuatro builds: la variante multilingue y la variante solo ingles, cada una en fp16 para el execution provider CUDA y en int8 para CPU.

El proposito declarado es servir de motor de transcripcion a Nexaflow, un proyecto del mismo autor que transcribe cada turno de habla terminado. Se trata, por tanto, de un artefacto de despliegue orientado a integracion embebida en una aplicacion concreta, no de un modelo entrenado desde cero ni de un ajuste fino.

Su relevancia practica es limitada pero clara: permite ejecutar Whisper small sin depender de PyTorch ni de la libreria transformers, con binarios ONNX de entre 0,47 GB y 0,53 GB por variante, lo que facilita el despliegue en entornos ligeros de CPU o GPU. No tiene descargas ni likes en el momento de la consulta y no publica resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de Whisper, exportado a ONNX |
| Parametros totales | 244 millones (modelo base openai/whisper-small; dato del modelo original, no declarado en la model card) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | ventana de entrada de 30 s de audio en el encoder; el decoder de Whisper trabaja con un maximo de 448 tokens (dato del modelo original, no declarado en la model card) |
| Tipos de cuantizacion | fp16 (variantes CUDA) e int8 con embeddings en fp32 (variantes CPU) |
| Idiomas soportados | en, fr, de (etiquetas del repositorio); la variante small.en es solo ingles |
| Licencia | MIT (Copyright (c) 2022 OpenAI) |
| Formato de pesos | ONNX (builds para onnxruntime-genai 0.17.1) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper small, un transformer encoder-decoder disenado para reconocimiento automatico del habla sobre ventanas de audio de 30 segundos, con representacion de entrada basada en espectrogramas mel. La exportacion se realiza con el model builder de onnxruntime-genai 0.17.1 sin modificarlo, mediante el script `Build-Whisper.ps1` incluido en el repositorio, que fija todas las versiones y permite reproducir los cuatro artefactos byte a byte. Las revisiones base fijadas son `973afd24` para openai/whisper-small y `e8727524` para openai/whisper-small.en.

No se ha realizado ningun entrenamiento adicional, ajuste fino ni alineamiento (RLHF/DPO) por parte del publicador: la model card no menciona datos de entrenamiento, numero de tokens, composicion del dataset ni proceso de alineamiento. La unica innovacion tecnica relevante es la propia conversion a ONNX con cuantizacion int8 para CPU y fp16 para CUDA, junto con las particularidades de ejecucion descritas mas abajo (por ejemplo, forzar `sdpa_kernel` a `1` en CUDA).

## Capacidades

- Transcripcion de voz a texto en ingles, frances y aleman con la variante small multilingue.
- Transcripcion en ingles con la variante small.en, que no acepta etiquetas de idioma ni de tarea.
- Seleccion forzada de idioma en el prompt del decoder mediante la secuencia `<|startoftranscript|><|de|><|transcribe|><|notimestamps|>`.
- Transcripcion sin marcas de tiempo (`<|notimestamps|>`), que es el modo empleado en las pruebas del autor.
- Gestion de turnos de habla: la model card indica que los builds pasaron las comprobaciones de Nexaflow sobre frase completa como un turno, pausa de reflexion que no cierra el turno, respuesta de una sola palabra, dictado frase a frase y silencio que no constituye turno.
- Ejecucion en CPU (int8) y en GPU CUDA (fp16) mediante onnxruntime-genai.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de turnos de conversacion en aplicaciones de voz: integrado en Nexaflow, el modelo transcribe cada turno de habla ya finalizado, con capacidad de distinguir una pausa de reflexion de un final de turno real.
- Dictado por voz en aplicaciones de escritorio: la ventana de 30 segundos y las variantes int8 de 0,47 GB permiten transcribir frases dictadas por partes en equipos sin GPU dedicada.
- Subtitulado ligero de audio corto en ingles, frances o aleman: transcribiendo el audio en fragmentos de hasta 30 segundos y concatenando los resultados.
- Preprocesado de audio en pipelines de analitica: conversion de grabaciones a texto antes de aplicar busqueda, clasificacion o resumen con otro modelo.
- Asistentes de voz en ingles con requisitos de latencia bajos: la variante small.en evita la deteccion de idioma y simplifica el prompt del decoder.
- Despliegue en entornos sin PyTorch: el formato ONNX con onnxruntime-genai permite ejecutar la transcripcion en runtimes ligeros, util en contenedores o dispositivos con dependencias restringidas.
- Pruebas de calidad y validacion de turnos de habla: comprobaciones automatizadas de fin de turno, silencio y respuestas de una palabra dentro de un sistema de dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que los cuatro builds superaron las comprobaciones de turnos de habla de Nexaflow en su runtime, sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para las variantes CUDA fp16, dado que cada build ocupa 0,53 GB en disco; hay que anadir el consumo del runtime y de las activaciones, no cuantificado en la informacion disponible.
- RAM estimada: las variantes CPU int8 ocupan 0,47 GB en disco, con embeddings en fp32.
- GPU recomendadas: no se especifican modelos concretos. Cualquier GPU con soporte del execution provider CUDA de onnxruntime-genai deberia ser suficiente dado el tamano; no se aportan datos de compatibilidad con A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, por tamano (builds de 0,53 GB en fp16), aunque no se documentan pruebas en tarjetas concretas.
- Opciones de despliegue: onnxruntime-genai (version 0.17.1, con execution providers CPU y CUDA) y, por extension, cualquier aplicacion que integre esa libreria, como Nexaflow.
- Latencia y throughput: no disponibles. La model card solo recomienda, en CUDA, fijar `sdpa_kernel` a `1` y transcribir una vez en la carga del modelo, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| smile-forge/whisper-onnx-genai | 244 M (base) | ventana de 30 s | en, fr, de | MIT | ONNX para onnxruntime-genai | Exportacion de despliegue, sin benchmarks publicados, 0 descargas |
| openai/whisper-small | 244 M | ventana de 30 s | multilingue (etiquetas del repo original) | MIT | safetensors / PyTorch | Modelo original; benchmarks publicados por OpenAI en el paper de Whisper, no reproducidos aqui |
| openai/whisper-small.en | 244 M | ventana de 30 s | en | MIT | safetensors / PyTorch | Variante solo ingles, origen de los builds small.en de este repositorio |
| openai/whisper-large-v3 | 1550 M (familia large, dato del modelo original) | ventana de 30 s | multilingue | MIT | safetensors / PyTorch | Alternativa de mayor tamano; no comparable en requisitos de hardware con este repositorio |

Los datos de parametros y contexto de los modelos openai corresponden a la informacion publica de dichos modelos, no a la model card de este repositorio, que no los declara.

## Limitaciones y advertencias

- No se publican resultados de benchmarks ni metricas de calidad (WER, latencia, throughput) en la informacion disponible, por lo que no es posible validar el rendimiento de forma independiente.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La deteccion automatica de idioma es poco fiable en respuestas cortas; la propia model card recomienda forzar el idioma cuando se conoce.
- El encoder procesa ventanas de 30 segundos, de modo que el audio mas largo debe transcribirse por fragmentos, con el riesgo de cortes en los limites.
- La variante small.en no acepta etiquetas de idioma ni de tarea y solo transcribe en ingles.
- En CUDA es necesario configurar `sdpa_kernel` a `1` y realizar una transcripcion en la carga del modelo; omitir estos pasos puede provocar un comportamiento incorrecto.
- Sigues existiendo los sesgos conocidos de los modelos Whisper originales: no se documenta ningun proceso de mitigacion.
- Riesgo de alucinacion inherente a los modelos de reconocimiento del habla, especialmente con silencio, ruido de fondo o audio de baja calidad; la model card solo menciona que el silencio se comprobo como no-turno.
- Cobertura idiomatica limitada a las etiquetas declaradas (en, fr, de), aunque el modelo base small es multilingue en origen.
- Licencia MIT,Copyright (c) 2022 OpenAI: permite uso comercial, pero se debe conservar el aviso de copyright correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smile-forge/whisper-onnx-genai
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Modelo base openai/whisper-small.en: https://huggingface.co/openai/whisper-small.en
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
- Nexaflow: https://github.com/smile-forge/nexaflow
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
