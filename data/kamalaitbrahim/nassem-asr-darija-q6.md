# kamalaitbrahim/nassem-asr-darija-q6

## Resumen

MoulSot v0.3 MLX Q6 es un paquete de cuantizacion de 6 bits del modelo de reconocimiento automatico del habla (ASR) MoulSot v0.3, un ajuste fino de `Qwen/Qwen3-ASR-1.7B` orientado a la transcripcion de dariya marroqui (codigo ISO `ary`) y habla con alternancia de codigos (code-switching) entre arabe, frances e ingles. Lo publica el usuario de Hugging Face `kamalaitbrahim` como artefacto de inferencia local para el flujo de trabajo de la aplicacion Nassem, no como endpoint alojado.

El modelo parte de la arquitectura Qwen3-ASR-1.7B: un encoder de audio seguido de un decoder tipo transformer de aproximadamente 1.700 millones de parametros. En este repositorio el decoder se empaqueta en MLX con cuantizacion de 6 bits y tamano de grupo 64, mientras que el encoder de audio se mantiene en bf16, lo que da un repositorio de unos 2,0 GB.

Su relevancia es practica: cubre un idioma de bajos recursos como el dariya, historicamente mal atendido por los sistemas ASR comerciales, y lo empaqueta para ejecucion offline en dispositivos Apple con 6 GB de RAM o mas. La licencia Apache-2.0 facilita su integracion en productos y su redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder transformer); empaquetado MLX |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-ASR-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits en el modelo de lenguaje (group size 64); encoder de audio en bf16. Existe un paquete de 4 bits en `kamalaitbrahim/nassem-asr-darija` |
| Idiomas soportados | dariya marroqui (ary), arabe (ar), frances (fr), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (cuantizado), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-ASR-1.7B, un sistema ASR compuesto por un encoder de audio que transforma la senal acustica en representaciones latentes y un decoder autorregresivo tipo transformer que genera la transcripcion como secuencia de tokens. El ajuste fino se ha realizado sobre el checkpoint base de Qwen para especializarlo en dariya y en habla con mezcla de idiomas; no se detallan en la informacion disponible el volumen de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio concreto es el empaquetado: cuantizacion de 6 bits con group size 64 sobre el decoder y preservacion del encoder en bf16, lo que reduce el peso en disco y en memoria manteniendo la calidad del front-end acustico. El resultado se distribuye como artefacto MLX cargable con `mlx-audio`, pensado para inferencia en Apple Silicon y en iPhone.

## Capacidades

- Transcripcion de voz a texto (ASR) en dariya marroqui.
- Reconocimiento de habla con alternancia de codigos entre dariya, arabe estandar, frances e ingles.
- Ejecucion offline y local: no requiere conexion a un servicio en la nube.
- Inferencia en Apple Silicon mediante MLX y la libreria `mlx-audio`.
- Carga programatica sencilla: `load("kamalaitbrahim/nassem-asr-darija-q6")` y `model.generate("audio.wav")`.
- No se documentan capacidades de traduccion, diarizacion de hablantes, marcas temporales ni tool calling.

## Casos de uso

- Transcripcion de reuniones y notas de voz en dariya: el modelo convierte grabaciones locales en texto sin enviar audio a terceros, adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual marroqui: permite generar subtitulos de videos donde los hablantes alternan dariya y frances, un patron habitual en medios del Magreb.
- Asistentes de voz en aplicaciones moviles: al caber en iPhone de 6 GB de RAM o mas, habilita dictado y comandos por voz totalmente offline dentro de una app.
- Documentacion clinica o legal dictada: transcripcion en dispositivo de notas profesionales en dariya, evitando la exposicion de datos sensibles a APIs externas.
- Atencion al cliente en centros de llamadas: conversion de grabaciones de llamadas en dariya a texto para analisis de calidad y busqueda posterior.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala de grabaciones en dariya para estudios sociolinguisticos o para entrenar otros modelos.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contenido en dariya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa unos 2,0 GB; se recomienda un dispositivo con al menos 6 GB de RAM para el paquete de 6 bits. Para iPhone de 4 GB existe el paquete de 4 bits en `kamalaitbrahim/nassem-asr-darija`.
- GPU recomendadas: Apple Silicon (serie M) y iPhone con 6 GB o mas; el formato MLX no esta pensado para GPU NVIDIA.
- Cabe en hardware de consumo Apple: si, en Mac con chip M y en iPhone de 6 GB o mas.
- Opciones de despliegue: `mlx-audio` (libreria oficial de carga); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nassem-asr-darija-q6 (este) | 1,7 B | ary, ar, fr, en | MLX 6 bits | Apache-2.0 | Optimizado para Apple Silicon y dariya |
| nassem-asr-darija (4 bits) | 1,7 B | ary, ar, fr, en | MLX 4 bits | Apache-2.0 | Mismo modelo base, menor huella para iPhone de 4 GB |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | no disponible | safetensors | no disponible | Modelo base sin ajuste especifico a dariya |
| Whisper (variantes) | 0,04-1,55 B | multilingue amplio | safetensors, GGUF, etc. | MIT | Cobertura multilingue general; rendimiento en dariya no verificado en la informacion disponible |

## Limitaciones y advertencias

- El rendimiento puede degradarse con audio ruidoso, acentos marcados y alternancia de codigos extrema, segun la propia model card.
- No se documentan evaluaciones cuantitativas de sesgo ni de tasa de alucinacion; en ASR el riesgo tipico es la invencion o sustitucion de palabras en segmentos de baja calidad acustica.
- La longitud de contexto y la duracion maxima de audio procesable no estan especificadas.
- El paquete esta pensado para el flujo de trabajo Nassem y para inferencia local; no ofrece API en la nube.
- El formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el modelo; conviene validar en el dominio de produccion antes de desplegarlo.
- El repositorio tiene un uso muy bajo (28 descargas, 0 likes) en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kamalaitbrahim/nassem-asr-darija-q6
- Paquete de 4 bits: https://huggingface.co/kamalaitbrahim/nassem-asr-darija
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Libreria de inferencia: https://github.com/Blaizzy/mlx-audio
