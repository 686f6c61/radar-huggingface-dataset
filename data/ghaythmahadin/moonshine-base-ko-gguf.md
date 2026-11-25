# GhaythMahadin/moonshine-base-ko-gguf

## Resumen

moonshine-base-ko-gguf es la conversion al formato GGUF del modelo de reconocimiento automatico del habla (ASR) UsefulSensors/moonshine-base-ko, una adaptacion al coreano de la arquitectura Moonshine desarrollada por Useful Sensors. El modelo original sigue la estela de Whisper pero con una diferencia clave: procesa directamente PCM crudo a 16 kHz mediante un stem convolucional de tres capas Conv1d, sin STFT ni banco de filtros mel, lo que reduce el coste computacional y el tiempo de preprocesado. Esta version GGUF la publica GhaythMahadin para su uso con transcribe.cpp, una implementacion en C++ pensada para inferencia local eficiente.

El modelo cuenta con 61.513.920 parametros (aproximadamente 62M, la variante "base" de Moonshine), es un transformer encoder-decoder y esta especializado exclusivamente en transcripcion de audio en coreano: no traduce, no detecta idioma y no genera timestamps. Su relevancia actual reside en que permite ejecutar ASR de calidad razonable en hardware modesto (incluso CPU) gracias a su tamano reducido y a las cuantizaciones disponibles (F32, F16 y Q8_0), con un CER del 8,00-8,13 % sobre FLEURS coreano.

La ficha describe la conversion GGUF; los datos de arquitectura y entrenamiento provienen del modelo base original de Useful Sensors y de la model card del autor de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; generacion limitada a max_length=192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Coreano (ko) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

Moonshine es un transformer encoder-decoder disenado especificamente para ASR. A diferencia de Whisper, que trabaja sobre espectrogramas mel calculados con STFT, Moonshine consume directamente muestras PCM a 16 kHz a traves de un stem convolucional de tres capas Conv1d. Esto elimina el preprocesado STFT y el banco de filtros mel, reduce la latencia y hace que el coste de computo escale con la duracion real del audio en lugar de con una ventana fija de 30 segundos. La variante "base" tiene unos 62M de parametros; el decoder emite unicamente la transcripcion, sin tokens especiales de idioma ni marcas temporales.

El modelo original fue entrenado por Useful Sensors y publicado junto con el paper arXiv:2410.15608. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, y tampoco indica si hubo RLHF o DPO; se trata de un modelo supervisado de ASR. Esta variante concreta es un fine-tuning sobre moonshine-base para coreano, realizado por Useful Sensors (modelo base: UsefulSensors/moonshine-base-ko). La conversion GGUF se genero a partir del commit fff6035 del modelo original (fijado el 2026-05-12) y se valido contra la referencia de transformers en el commit 90bf720 de transcribe.cpp. No se documentan innovaciones adicionales como decodificacion especulativa o attention lineal.

## Capacidades

- Transcripcion de voz a texto en coreano a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio de duracion variable sin ventana fija de 30 segundos (propiedad de la arquitectura Moonshine).
- Salida de solo transcripcion: sin traduccion, sin deteccion de idioma y sin timestamps.
- No soporta streaming (streaming: false en la metadata de transcribe.cpp).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidad multilingue limitada al coreano; no hay transferencia a otros idiomas.
- No incorpora vision ni audio mas alla de la propia entrada de voz.

## Casos de uso

- Subtitulado de contenido audiovisual en coreano: el modelo transcribe voz a texto con un CER en torno al 8 % sobre FLEURS, suficiente para generar subtitulos que luego se revisan manualmente. La ausencia de timestamps obliga a alinear los segmentos con otra herramienta.
- Notas de reunion y dictado en coreano: al ejecutarse en CPU con la cuantizacion Q8_0 (74 MB), puede desplegarse en portatiles o mini-PC para transcribir grabaciones locales sin enviar audio a la nube, lo que resulta adecuado por privacidad.
- Transcripcion en dispositivos embebidos o edge: con 62M de parametros y un peso Q8_0 de 74 MB, cabe en dispositivos con poca memoria; el RTF medido en un Ryzen 4750U (22 en CPU, 34,5 en Vulkan) indica que el procesamiento es mas rapido que tiempo real en ese hardware.
- Preprocesado de corpus de voz en coreano para entrenamiento de otros modelos: permite generar transcripciones masivas a bajo coste en pipelines por lotes con transcribe-cli.
- Accesibilidad para hablantes de coreano: conversion de voz a texto en aplicaciones de asistencia para personas con dificultades auditivas, ejecutandose localmente en el dispositivo.
- Integracion en aplicaciones de escritorio o CLI: la libreria transcribe.cpp y el binario transcribe-cli facilitan incrustar ASR en herramientas nativas sin dependencias de Python ni de GPU dedicada.
- Transcripcion de llamadas o atencion al cliente en coreano: el modelo puede procesar grabaciones de conversaciones y volcar el texto a un sistema de analitica; la falta de diarizacion y timestamps limita el analisis fino por turnos.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| CER FLEURS ko test (382 utterances) | 8,00 % | 8,00 % | 8,13 % |
| Tamano del fichero | 236 MB | 126 MB | 74 MB |
| RTF Mac M4 Max (Metal) | no disponible por cuantizacion (global: 79,5) | no disponible | no disponible |
| RTF Mac M4 Max (CPU) | no disponible por cuantizacion (global: 80,5) | no disponible | no disponible |
| RTF Ryzen 4750U (Vulkan) | no disponible por cuantizacion (global: 34,5) | no disponible | no disponible |
| RTF Ryzen 4750U (CPU) | no disponible por cuantizacion (global: 22) | no disponible | no disponible |

Referencia comparativa: la implementacion de transformers en F32 sobre MPS obtiene un CER del 8,19 % sobre el mismo manifiesto. La decodificacion usada es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original. Los valores de RTF (real-time factor) se publican de forma global para el modelo, no desglosados por cuantizacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0); no requiere GPU dedicada.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; los datos publicados usan un Mac M4 Max (Metal) y un Ryzen 4750U (Vulkan). No se documentan cifras para A100, H100 o RTX 4090, que serian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en iGPU; tambien funciona en CPU.
- Opciones de despliegue: transcribe.cpp (libreria nativa y binario transcribe-cli), y transformers con la clase MoonshineForConditionalGeneration para el modelo original.
- Latencia y throughput: RTF de 79,5 en Metal y 80,5 en CPU sobre M4 Max; 34,5 en Vulkan y 22 en CPU sobre Ryzen 4750U. Valores superiores a 1 implican procesamiento mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-base-ko-gguf | 61,5M | Coreano | Audio PCM 16 kHz, salida max. 192 tokens | MIT | GGUF |
| moonshine-base (original) | ~62M | Ingles | Audio PCM 16 kHz | MIT | safetensors |
| Whisper base | ~74M | Multilingue | Ventana fija de 30 s (mel) | MIT | safetensors, GGUF |
| Whisper small | ~244M | Multilingue | Ventana fija de 30 s (mel) | MIT | safetensors, GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; el unico dato de rendimiento publicado es el CER del 8,00-8,13 % sobre FLEURS coreano. La ventaja principal frente a Whisper base/small es el menor coste de preprocesado y la ausencia de ventana fija, junto con un peso Q8_0 de solo 74 MB. La desventaja es la especializacion exclusiva en coreano y la falta de timestamps, traduccion y deteccion de idioma.

## Limitaciones y advertencias

- Modelo de un solo idioma (coreano): no transcribe otros idiomas ni detecta el idioma de entrada.
- Sin timestamps: no sirve para aplicaciones que requieran alineacion temporal precisa por palabra o segmento.
- Sin traduccion: la salida es unicamente la transcripcion en coreano.
- Sin streaming: no apto para reconocimiento en tiempo real continuo con esta integracion.
- Riesgo de alucinacion y bucles de generacion: la propia model card original advierte de que se limita max_length para evitar bucles; conviene aplicar heuristicas de longitud en produccion.
- Sesgos: heredados del dataset de entrenamiento de Moonshine y del corpus coreano usado en el fine-tuning; no se documentan analisis de sesgo especificos para esta variante.
- CER del ~8 %: aceptable para muchas aplicaciones, pero insuficiente para transcripcion legal o medica sin revision humana.
- Licencia MIT: permite uso comercial, pero se recomienda revisar la model card original de UsefulSensors para terminos completos.
- Conversion de terceros: el repo GGUF lo mantiene GhaythMahadin, no Useful Sensors; la model card indica que el upstream es la fuente autoritativa.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario remuestrear con ffmpeg u otra herramienta.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-base-ko-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-ko
- Commit del modelo base usado: https://huggingface.co/UsefulSensors/moonshine-base-ko/commit/fff6035
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Paper de Moonshine: https://arxiv.org/abs/2410.15608
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Blog de presentacion de Moonshine: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Instalacion de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Podcast de presentacion: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
