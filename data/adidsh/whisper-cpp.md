# adidsh/whisper.cpp

## Resumen

Este repositorio contiene los modelos Whisper de OpenAI convertidos al formato ggml para su uso con la implementacion whisper.cpp de Georgi Gerganov. Lo publica el usuario adidsh bajo licencia MIT y la etiqueta de pipeline automatic-speech-recognition. Se trata, por tanto, de una copia espejo de los pesos que el proyecto original whisper.cpp distribuye en su propio repositorio de HuggingFace, no de un modelo entrenado desde cero por el autor.

El interes practico de estos pesos radica en que permiten ejecutar reconocimiento automatico del habla (ASR) de forma local y muy eficiente sobre CPU, sin dependencia de frameworks de deep learning pesados. El repositorio agrupa las variantes tiny, base, small, medium, large-v1, large-v2, large-v3 y large-v3-turbo, tanto en version multilingue como en version solo-ingles (.en), y ofrece varias cuantizaciones para reducir el consumo de memoria.

Es relevante ahora porque el ecosistema whisper.cpp se ha consolidado como la via de referencia para transcribir audio en entornos con recursos limitados (Raspberry Pi, portatiles sin GPU, dispositivos embebidos). El tamano total del repositorio es de 31 GB, lo que refleja la acumulacion de todas las variantes y sus cuantizaciones en un unico lugar. No se indica fecha de entrenamiento ni procedencia distinta de la conversion a ggml.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI); no detallada en la model card |
| Parametros totales | Variable por variante (tiny, base, small, medium, large); cifras exactas no disponibles en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por defecto en Whisper; no especificado en la model card |
| Tipos de cuantizacion | q5_0, q5_1 y q8_0, ademas de pesos sin cuantizar |
| Idiomas soportados | Multilingue en las variantes estandar y solo ingles en las variantes .en; no especificado en la model card |
| Licencia | MIT |
| Formato de pesos | ggml (binarios compatibles con whisper.cpp, extension .bin) |

Relacion de variantes incluidas y su tamano en disco (segun la propia model card):

| Variante | Tamano base | q5_0 | q5_1 | q8_0 |
|---|---|---|---|---|
| tiny | 75 MiB | no disponible | 31 MiB | 42 MiB |
| tiny.en | 75 MiB | no disponible | 31 MiB | 42 MiB |
| base | 142 MiB | no disponible | 57 MiB | 78 MiB |
| base.en | 142 MiB | no disponible | 57 MiB | 78 MiB |
| small | 466 MiB | no disponible | 181 MiB | 252 MiB |
| small.en | 466 MiB | no disponible | 181 MiB | 252 MiB |
| small.en-tdrz | 465 MiB | no disponible | no disponible | no disponible |
| medium | 1,5 GiB | 514 MiB | no disponible | 785 MiB |
| medium.en | 1,5 GiB | 514 MiB | no disponible | 785 MiB |
| large-v1 | 2,9 GiB | no disponible | no disponible | no disponible |
| large-v2 | 2,9 GiB | 1,1 GiB | no disponible | 1,5 GiB |
| large-v3 | 2,9 GiB | 1,1 GiB | no disponible | no disponible |
| large-v3-turbo | 1,5 GiB | 547 MiB | no disponible | 834 MiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos Whisper de OpenAI: un transformer con estructura encoder-decoder disenado especificamente para tareas de reconocimiento y traduccion de voz. El encoder procesa ventanas de audio de 30 segundos, convertidas previamente a representaciones de tipo log-Mel spectrogram, y el decoder genera la secuencia de tokens de texto de forma autorregresiva. Las variantes .en estan entrenadas y optimizadas unicamente para ingles, mientras que las variantes estandar son multilingues.

La model card no aporta informacion sobre el proceso de entrenamiento, el volumen de datos utilizados, la composicion del dataset ni si hubo etapas de ajuste fino con RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica especifica introducida en esta conversion. El unico cambio respecto a los pesos originales de OpenAI es la conversion al formato ggml para permitir la inferencia optimizada en CPU con whisper.cpp, un proceso que no altera los pesos mas alla de la cuantizacion cuando se aplica. Se menciona una variante small.en-tdrz, presumiblemente asociada a un ajuste fino de reduccion de ruido, pero su descripcion no esta disponible en la informacion proporcionada.

## Capacidades

- Transcripcion de voz a texto en las variantes multilingues, con deteccion automatica del idioma de entrada.
- Traduccion directa de audio a texto en ingles desde otros idiomas.
- Reconocimiento del habla optimizado para ingles en las variantes con sufijo .en.
- Generacion de marcas de tiempo (timestamps) a nivel de segmento y, con configuracion adecuada, a nivel de palabra.
- Ejecucion de inferencia sobre CPU sin GPU, gracias al backend ggml.
- Soporte de procesamiento por lotes y decodificacion con diferentes estrategias segun la implementacion whisper.cpp.
- No dispone de tool calling ni function calling; es un modelo de ASR, no un modelo de lenguaje conversacional.
- No ofrece razonamiento multi-paso, agentes ni capacidades de vision o audio-vision.
- Cobertura multilingue amplia en las variantes estandar (no confirmada en la model card para este repositorio concreto).

## Casos de uso

- Transcripcion de reuniones y entrevistas: la variante medium o large-v3 permite convertir grabaciones de audio en actas de texto con precision alta, ejecutandose en local para preservar la confidencialidad del contenido.
- Subtitulado automatico de video: el modelo genera segmentos con marcas de tiempo que se pueden exportar en formato SRT o VTT para plataformas de video y accesibilidad.
- Despliegue en dispositivos embebidos: las variantes tiny y base, con cuantizacion q5_1 de 31-57 MiB, caben en microcontroladores avanzados, Raspberry Pi o moviles, permitiendo dictado offline.
- Asistentes de voz locales: integracion del modelo como primer eslabon del pipeline (voz a texto) antes de un LLM que gestione la respuesta, sin enviar audio a la nube.
- Analisis de llamadas de atencion al cliente: transcripcion masiva de grabaciones para posteriores tareas de mineria de texto, analisis de sentimiento o control de calidad.
- Investigacion linguistica y sociolinguistica: transcripcion de corpus orales en multiples idiomas para su estudio, apoyandose en la deteccion automatica de idioma.
- Accesibilidad: conversion en tiempo real de discursos o clases a texto para personas con discapacidad auditiva, usando la variante small o base por su baja latencia.
- Documentacion clinica o legal dictada: transcripcion con la variante large-v3-turbo, que ofrece un equilibrio entre precision y velocidad (547 MiB en q5_0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), comparativas con otros modelos ni resultados de evaluaciones estandar.

## Requisitos de hardware

- Los pesos ggml se cargan por mapeo de memoria, por lo que los requisitos de RAM/VRAM se aproximan al tamano del fichero elegido.
- Variante tiny (31-75 MiB): funciona en cualquier CPU moderna e incluso en Raspberry Pi o dispositivos de bajo consumo.
- Variante base (57-142 MiB): apta para moviles, mini-PC y sistemas embebidos con 1 GB de RAM.
- Variante small (181-466 MiB): recomendable para escritorio con CPU y 2 GB de RAM disponibles; gran equilibrio precision/recursos.
- Variante medium (514 MiB-1,5 GiB): requiere en torno a 2-3 GB de RAM; ejecutable en CPU, mas agil con GPU.
- Variante large-v3 (1,1-2,9 GiB): necesita alrededor de 3-4 GB de memoria; la version large-v3-turbo reduce el coste computacional manteniendo buena precision.
- GPU compatibles: cualquier GPU con soporte CUDA o Metal (Apple Silicon). Modelos como RTX 3060/4090, A100 o H100 pueden acelerar la inferencia, aunque whisper.cpp esta optimizado para CPU.
- Despliegue: whisper.cpp (binario nativo, con soporte CPU, CUDA, Metal y Vulkan), ademas de bindings para Python, Node.js, Go y Rust. Tambien es compatible con Ollama para algunas integraciones y con servidores HTTP propios del proyecto.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del modelo, el hardware y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Formato | Tamano (large) | Ejecucion en CPU | Licencia | Notas |
|---|---|---|---|---|---|
| adidsh/whisper.cpp (este repo) | ggml | 2,9 GiB (base) | Si, nativa | MIT | Espejo de los pesos de whisper.cpp, sin verificacion ni descargas |
| ggerganov/whisper.cpp | ggml | 2,9 GiB (base) | Si, nativa | MIT | Repositorio canonico del proyecto, mantenido por el autor de la conversion |
| openai/whisper | PyTorch (.pt) | ~6,2 GB (large-v3) | Limitada, requiere framework | MIT | Pesos originales de OpenAI, mas pesados en memoria |
| faster-whisper (CTranslate2) | CTranslate2 | ~3 GB (large-v3) | Si, mediante quantizacion | MIT | Reimplementacion optimizada, mas rapida que la version PyTorch original |
| distil-whisper | PyTorch | variable | Si, segun backend | MIT | Variantes destiladas mas rapidas, con ligera perdida de precision |

Las cifras de tamano de las alternativas no estan confirmadas en la informacion proporcionada y deben verificarse en los repositorios correspondientes.

## Limitaciones y advertencias

- Este repositorio es una recarga (re-upload) con 0 descargas y 0 likes, sin evidencia de mantenimiento ni verificacion; se recomienda usar la fuente canonica ggerganov/whisper.cpp.
- Whisper tiende a alucinar texto en segmentos con silencio, ruido o musica, produciendo frases plausibles pero inexistentes.
- El modelo trabaja por ventanas de 30 segundos, lo que puede fragmentar el contexto en audios muy largos y requerir post-procesado.
- No hay garantia de precision en idiomas poco representados en los datos de entrenamiento ni en audio con fuerte acento, ruido de fondo o solapamiento de voces.
- La cuantizacion q5_0/q5_1 introduce una perdida de precision respecto a los pesos completos; para maxima calidad conviene usar los pesos sin cuantizar o q8_0.
- No es un modelo conversacional: no admite tool calling, agentes ni generacion de texto libre, por lo que no debe emplearse como sustituto de un LLM.
- Aunque la licencia MIT permite uso comercial, al tratarse de una copia no oficial conviene verificar la procedencia de los pesos antes de integrarlos en produccion.
- La model card no documenta sesgos conocidos ni metodologia de evaluacion, lo que dificulta valorar su comportamiento en dominios sensibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adidsh/whisper.cpp
- Repositorio canonico de pesos en HuggingFace: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Repositorio whisper.cpp en GitHub (modelos): https://github.com/ggerganov/whisper.cpp/tree/master/models
- Repositorio principal de whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Pesos originales de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
