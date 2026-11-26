# enconvo/thewhisper-large-v3-turbo-8bit-mlx

## Resumen

TheWhisper Large V3 Turbo 8-bit MLX es una conversion cuantizada del modelo de reconocimiento automatico del habla TheWhisper Large V3 Turbo v3, desarrollado por TheStage AI como un fine-tune de openai/whisper-large-v3-turbo. Enconvo ha realizado la conversion al formato MLX (Apple Silicon) y ha cuantizado a 8 bits las capas lineales y de embedding, con un tamano en disco de aproximadamente 0,87 GB. El modelo esta pensado para transcripcion y dictado en local sobre Macs con chip Apple Silicon, sin necesidad de conexion a servicios en la nube.

Se trata de un modelo de la familia Whisper (arquitectura encoder-decoder transformer orientada a speech-to-text), en su variante turbo de OpenAI, que reduce el numero de capas del decoder respecto a large-v3 manteniendo una calidad cercana. Soporta 39 idiomas, incluido el castellano, y esta publicado bajo licencia CC BY 4.0. Su relevancia actual reside en que permite transcripcion multilingue de alta calidad en hardware de consumo Apple, con un consumo de memoria pico de unos 1,5 GB durante la transcripcion.

Al estar cuantizado a 8 bits y orientado a MLX, el modelo prioriza eficiencia en memoria y velocidad en Apple Silicon sobre portabilidad a otras plataformas. No se dispone de datos publicados de benchmarks especificos para esta conversion en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | 8 bits (group size 64) en capas lineales y de embedding |
| Idiomas soportados | 39 idiomas: en, ar, bg, bn, cs, da, de, el, es, et, fa, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tl, tr, uk, vi, zh |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (layout mlx-audio: config.json + weights.safetensors) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de openai/whisper-large-v3-turbo, que emplea la arquitectura Whisper: un encoder transformer que procesa espectrogramas mel de audio y un decoder autoregresivo que genera tokens de texto. La variante turbo de Whisper reduce el numero de capas del decoder (de 32 a 4) respecto a large-v3, lo que disminuye el coste computacional manteniendo el encoder completo. TheStage AI realizo el fine-tune sobre esta base; los detalles concretos sobre volumen de datos, composicion del dataset y tecnicas de alineacion (RLHF/DPO) no estan disponibles en la informacion proporcionada.

La conversion realizada por Enconvo no implica reentrenamiento: se transformo el `model.safetensors` en float32 al layout de mlx-audio y se cuantizaron a 8 bits (group size 64) las capas lineales y de embedding, manteniendo los ficheros del tokenizer sin cambios. El resultado ocupa aproximadamente 0,87 GB en disco y requiere unos 1,5 GB de memoria pico durante la transcripcion.

## Capacidades

- Reconocimiento automatico del habla (ASR) y transcripcion de audio a texto.
- Soporte multilingue en 39 idiomas, incluido el castellano, con deteccion o seleccion explicita de idioma.
- Generacion de transcripciones con temperatura configurable (permite temperatura 0.0 para salidas deterministas).
- Ejecucion local en Apple Silicon mediante la libreria MLX y mlx-audio.
- Adecuado para dictado y transcripcion en tiempo real o por lotes segun el hardware.
- No se documentan capacidades de tool calling, agentes, vision ni audio generation en la informacion disponible.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio para macOS: el modelo se integra via mlx-audio y permite convertir voz a texto en local con un consumo pico de unos 1,5 GB, sin enviar audio a servidores externos.
- Transcripcion de reuniones y notas de voz: con soporte de 39 idiomas y salida determinista a temperatura 0.0, es adecuado para generar actas y resumenes a partir de grabaciones en castellano u otros idiomas.
- Subtitulado de contenido audiovisual: la transcripcion multilingue permite generar subtitulos para videos en varios idiomas, ejecutandose en un Mac sin GPU dedicada.
- Herramientas de accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas o motoras, aprovechando la inferencia local y la baja latencia en Apple Silicon.
- Procesamiento por lotes de archivos de audio en pipelines locales: al ocupar menos de 1 GB en disco, se puede desplegar en multiples equipos Apple para transcribir grandes volumenes de audio sin coste de API.
- Asistentes de voz integrados en aplicaciones: el modelo actua como capa ASR en un pipeline mayor (por ejemplo, dictado a un LLM local), con la ventaja de mantener los datos de audio en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria pico estimada: aproximadamente 1,5 GB durante la transcripcion (dato del autor).
- Tamano en disco: aproximadamente 0,87 GB.
- Hardware objetivo: Macs con chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), dado que el formato es MLX.
- No esta disenado para GPU NVIDIA (A100, H100, RTX 4090) ni para ejecucion en CUDA; requiere el runtime MLX.
- Despliegue mediante la libreria mlx-audio (`mlx_audio.stt.utils.load_model`).
- Latencia y throughput concretos no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| enconvo/thewhisper-large-v3-turbo-8bit-mlx | no disponible | segmentos de 30 s (Whisper) | 39 | CC BY 4.0 | MLX 8-bit |
| openai/whisper-large-v3-turbo | no disponible | segmentos de 30 s (Whisper) | ~99 | MIT | safetensors |
| TheStageAI/thewhisper-large-v3-turbo | no disponible | segmentos de 30 s (Whisper) | 39 | CC BY 4.0 | safetensors |

La conversion de Enconvo se distingue por su formato MLX cuantizado a 8 bits, orientado a Apple Silicon, frente a los pesos originales en float32 del modelo base. Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede introducir una ligera perdida de precision en la transcripcion respecto al modelo base en float32; no se han publicado metricas de dicha degradacion.
- El modelo esta limitado al ecosistema MLX y Apple Silicon; no es portable a CUDA ni a CPU generica sin reconversion.
- Whisper procesa audio en ventanas de 30 segundos, lo que puede afectar a la coherencia en grabaciones muy largas si no se segmentan adecuadamente.
- Riesgo de alucinacion en audio con ruido, silencios prolongados o habla no presente en los idiomas entrenados.
- Sesgos linguisticos y de dominio heredados del modelo base y de sus datos de entrenamiento; no documentados en la informacion disponible.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero exige citar a TheStage AI y a Enconvo; TheStage AI no respalda esta conversion.
- El modelo no ha sido validado por el autor original; se recomienda evaluar su calidad en el dominio concreto antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/enconvo/thewhisper-large-v3-turbo-8bit-mlx
- Modelo base: https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- TheStage AI: https://thestage.ai
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
