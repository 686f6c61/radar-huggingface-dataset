# leok7v/moonshine-tiny

## Resumen

Moonshine-tiny es un modelo de reconocimiento automático del habla (ASR) desarrollado por Useful Sensors, disenado especificamente para transcribir audio en ingles a texto en entornos con recursos computacionales severamente limitados. Con solo 27 millones de parametros, es una alternativa ultraligera a Whisper-tiny de OpenAI, y segun sus autores ofrece mayor precision que sistemas ASR de tamano similar en datasets estandar. Esta ficha documenta la copia espejo publicada por el usuario leok7v en Hugging Face, que reproduce sin cambios los ficheros del repositorio original `moonshine-ai/moonshine-tiny`.

La relevancia del modelo radica en su relacion precision/tamano: frente a arquitecturas ASR convencionales que procesan audio en ventanas fijas de 30 segundos, Moonshine emplea una arquitectura de secuencia a secuencia con encoder de audio de longitud variable, lo que reduce el coste computacional en audios cortos y mejora la latencia en aplicaciones de transcripcion en tiempo real sobre hardware de bajo coste. El modelo se publico en octubre de 2024 junto con el articulo arXiv 2410.15608.

El repositorio espejo tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,1 GB y pesos en formato safetensors compatibles con la libreria Transformers. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sequence-to-sequence ASR (encoder de audio + decoder de texto, transformer) |
| Parametros totales | 27.092.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder procesa audio de longitud variable; el limite practico lo marca la duracion del audio de entrada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite carga en float16 y float32 segun el ejemplo de la model card) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moonshine-tiny es un modelo de secuencia a secuencia para ASR. A diferencia de Whisper, que fuerza el audio a ventanas fijas de 30 segundos con padding, Moonshine procesa el audio de entrada con una longitud proporcional a la duracion real, lo que reduce el numero de tokens de audio y, por tanto, el coste de atencion en clips cortos. La arquitectura combina un encoder de audio con un decoder autoregresivo de texto, implementados en Transformers como `MoonshineForConditionalGeneration` con el procesador `AutoProcessor`.

El entrenamiento utilizo 200.000 horas de audio con sus transcripciones, recopiladas de internet y de datasets abiertos disponibles en Hugging Face; la lista completa de datasets se detalla en el articulo arXiv 2410.15608. La model card no especifica si se aplicaron tecnicas de RLHF o DPO, ni el desglose exacto de la composicion del dataset. La familia Moonshine incluye dos variantes: tiny (27 M de parametros) y base (61 M), ambas solo en ingles.

## Capacidades

- Transcripcion de voz en ingles a texto en ingles (ASR).
- Procesamiento de audio de longitud variable sin padding fijo a 30 segundos.
- Inferencia en CPU y GPU; el ejemplo de la model card usa float16 en CUDA y float32 en CPU.
- Integracion nativa con la libreria Transformers mediante `MoonshineForConditionalGeneration` y `AutoProcessor`.
- Control de alucinaciones mediante limite de longitud generada (la model card recomienda un maximo de 6,5 tokens por segundo de audio).
- No dispone de tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No soporta vision ni audio mas alla de la transcripcion; no hay modo thinking.
- Multilingue: no; solo ingles.

## Casos de uso

- Transcripcion en tiempo real en dispositivos embebidos: con 27 M de parametros y pesos de ~0,1 GB, el modelo cabe en microcontroladores y SBCs de gama baja, lo que permite dictado local sin conexion en wearables y electrodomesticos.
- Subtitulado automatico de videos en ingles: la latencia reducida en clips cortos (al no procesar ventanas fijas de 30 s) lo hace adecuado para generar subtitulos en pipelines de edicion o streaming.
- Asistentes de voz sin conexion: integrado en aplicaciones moviles o de escritorio, permite comandos de voz y dictado sin enviar audio a la nube, con la consiguiente mejora de privacidad.
- Accesibilidad: transcripcion de conversaciones presenciales en aplicaciones de ayuda auditiva que se ejecutan en hardware de bajo consumo.
- Preprocesado de audio para pipelines NLP: conversion de reuniones o notas de voz en ingles a texto antes de alimentar un LLM o un sistema de busqueda, reduciendo coste frente a APIs ASR en la nube.
- Prototipado e investigacion en ASR de bajo coste: linea base ligera para experimentos de fine-tuning en dominios especificos (vocabulario tecnico, acentos) sin requerir GPUs de gama alta.
- Vigilancia de palabras clave en grabaciones: transcripcion local de audio para deteccion de terminos en sistemas de monitorizacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que los modelos Moonshine "exhiben mayor precision en datasets estandar que sistemas ASR existentes de tamanos similares", pero no incluye cifras de WER, MMLU ni otras metricas en el texto proporcionado; los resultados detallados se remiten al articulo arXiv 2410.15608.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (27 M de parametros, ~54 MB de pesos) y aproximadamente 110 MB en float32.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, GTX 1660 y GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GPUs integradas y aceleradores edge (Jetson, Coral, Raspberry Pi con CPU).
- Opciones de despliegue: Transformers (con `MoonshineForConditionalGeneration`), y segun el ecosistema del proyecto original, el repositorio de GitHub de Useful Sensors; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonshine-tiny | 27 M | audio de longitud variable | en | MIT | Hugging Face, Transformers |
| Moonshine-base | 61 M | audio de longitud variable | en | MIT | Hugging Face, Transformers |
| Whisper-tiny (OpenAI) | 39 M | ventanas fijas de 30 s | multilingue | MIT | Hugging Face, Transformers, whisper.cpp |
| Whisper-base (OpenAI) | 74 M | ventanas fijas de 30 s | multilingue | MIT | Hugging Face, Transformers, whisper.cpp |

La comparativa se limita a datos de parametros, licencia y disponibilidad; no se dispone de cifras de WER para comparar el rendimiento real entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo transcribe ingles; no soporta otros idiomas.
- Riesgo de alucinacion: la model card advierte de que las predicciones pueden incluir texto no pronunciado y recomienda limitar la longitud generada a 6,5 tokens por segundo de audio.
- No evaluado de forma robusta para deteccion de actividad de voz, clasificacion de hablante ni diarizacion, aunque podria fine-tunearse para ello.
- No debe usarse para clasificacion subjetiva ni para inferir atributos humanos.
- Desaconsejado en dominios de alto riesgo donde los errores de transcripcion tengan consecuencias graves.
- Advertencia etica: no transcribir grabaciones de personas sin su consentimiento.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor del espejo no ofrece garantias adicionales sobre el modelo original.
- El repositorio espejo tiene 0 descargas y 0 likes, por lo que su mantenimiento no esta garantizado; se recomienda usar el repositorio original `moonshine-ai/moonshine-tiny` o `UsefulSensors/moonshine-tiny`.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/leok7v/moonshine-tiny
- Repositorio original: https://huggingface.co/moonshine-ai/moonshine-tiny
- Repositorio de Useful Sensors: https://huggingface.co/UsefulSensors/moonshine-tiny
- Articulo: https://arxiv.org/abs/2410.15608
- Blog de presentacion: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio GitHub: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Podcast: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
- Referencia Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
