# bouchardm/whisper-large-v3-turbo-fr-quebecois-ggml

## Resumen

`bouchardm/whisper-large-v3-turbo-fr-quebecois-ggml` es una conversion al formato GGML del modelo `ele-sage/whisper-large-v3-turbo-fr-quebecois`, un ajuste fino sobre `openai/whisper-large-v3-turbo` orientado al frances quebeques. El repositorio no introduce cambios en los pesos ni en el entrenamiento: unicamente transforma los ficheros originales a un formato consumible por whisper.cpp, la implementacion en C/C++ de Whisper mantenida por ggml-org.

El modelo subyacente es un transformer encoder-decoder de reconocimiento automatico del habla (ASR) derivado de Whisper large-v3-turbo, la variante reducida del decodificador de large-v3 (32 capas de encoder y 4 de decodificador, frente a 32 de large-v3). El ajuste fino busca mejorar la transcripcion de variantes del frances hablado en Quebec, un dominio donde los modelos genericos de Whisper suelen presentar tasas de error elevadas por diferencias foneticas, lexicas y de code-switching con el ingles.

Su relevancia practica reside en la distribucion en tres cuantizaciones (f16, q8_0, q5_0) junto con un modelo VAD de Silero, lo que permite ejecutar ASR en CPU o GPU de gama media sin depender de PyTorch ni de infraestructura Python. La licencia MIT facilita su integracion en productos comerciales. El repositorio tiene un tamano de 3,1 GB y, en el momento de la consulta, no registra descargas ni likes, por lo que se trata de una publicacion reciente y de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), conversion GGML |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | f16, q8_0, q5_0 |
| Idiomas soportados | fr (frances, con ajuste especifico a frances quebeques) |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin` para whisper.cpp) |
| Modelo base | ele-sage/whisper-large-v3-turbo-fr-quebecois |
| Commit del modelo base | 0c88344ec63ae249aea28dec20cc377699a2de2c |
| Converter | `models/convert-h5-to-ggml.py` y `whisper-quantize` de whisper.cpp v1.8.4 |
| Filtros mel | openai/whisper @ 31243bad24cc746f07d4c8bfdd2d974872cb1803 (v20250625) |
| VAD incluido | Silero VAD v6.2.0 (mirror de ggml-org/whisper-vad @ 9ffd54a1) |
| Tamano del repo | 3,1 GB |

Ficheros publicados:

| Fichero | Formato | SHA256 |
|---|---|---|
| `ggml-whisper-fr-qc-f16.bin` | f16 (fuente de recuantizacion) | `44373bdf73b3e5892de5a333067297053d74b375883ba44fbfc06272808fcde6` |
| `ggml-whisper-fr-qc-q8_0.bin` | q8_0 | `18f612e55dc4e59604a4b7aa1793a9383d037aa5d92d25c59f18405c0baaf644` |
| `ggml-whisper-fr-qc-q5_0.bin` | q5_0 | `3acaa74f524b8ca29fdff170a6eec6287eca21a70111f5fbe3cfb59d3161a15e` |
| `ggml-silero-v6.2.0.bin` | VAD Silero | `2aa269b785eeb53a82983a20501ddf7c1d9c48e33ab63a41391ac6c9f7fb6987` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper large-v3-turbo: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. La variante «turbo» reduce el decodificador a 4 capas (frente a las 32 de large-v3), lo que rebaja el coste de inferencia a cambio de una ligera perdida de precision en tareas de traduccion y en idiomas de bajos recursos. No se trata de un modelo MoE ni de una arquitectura hibrida SSM.

El ajuste fino a frances quebeques fue realizado por el equipo `ele-sage` sobre `openai/whisper-large-v3-turbo`. La model card de este repositorio no documenta el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia al repositorio del modelo base y no se incluye en la informacion proporcionada. Lo unico documentado en este repositorio es el proceso de conversion de formato: exportacion de pesos a GGML con el script oficial de whisper.cpp v1.8.4, uso de los filtros mel de la version v20250625 de `openai/whisper` y recuantizacion a q8_0 y q5_0 mediante la herramienta `whisper-quantize`.

## Capacidades

- Transcripcion de voz a texto en frances, con especializacion en el frances hablado en Quebec.
- Procesamiento de audio en ventanas de 30 segundos, con deteccion de actividad de voz (VAD) integrada mediante Silero v6.2.0 para segmentar audio largo.
- Ejecucion en CPU y GPU a traves de whisper.cpp, sin dependencias de PyTorch ni de Python en tiempo de inferencia.
- Servidor HTTP compatible con el endpoint `/v1/audio/transcriptions`, lo que permite exponerlo como API estilo OpenAI.
- Decodificacion con beam search (la evaluacion del autor usa beam 5).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo «thinking».
- El soporte multilingue esta limitado al frances; el ajuste fino puede degradar el rendimiento en otros idiomas respecto al modelo original.

## Casos de uso

- Transcripcion de reuniones y entrevistas en Quebec: el ajuste fino reduce la tasa de error sobre frances quebeques (14,2 % WER frente a 23,0 % del modelo stock en la evaluacion del autor), lo que lo hace adecuado para actas automaticas de reuniones internas en organizaciones que operan en esa region.
- Subtitulado de contenido audiovisual: con la cuantizacion q5_0 y VAD activado se puede procesar audio largo por segmentos y generar subtitulos en frances en pipelines por lotes, sin necesidad de GPU dedicada.
- Atencion al cliente por voz: el endpoint `/v1/audio/transcriptions` de `whisper-server` permite integrar la transcripcion en sistemas de telefonia o VoIP con una interfaz compatible con clientes que ya hablan la API de OpenAI.
- Archivado y busqueda de grabaciones: transcripcion masiva de llamadas o grabaciones internas para indexacion y busqueda textual, aprovechando la licencia MIT para uso comercial sin restricciones de atribucion mas alla de la propia licencia.
- Asistentes de accesibilidad: conversion de voz a texto en aplicaciones de subtitulado en vivo para usuarios con discapacidad auditiva en entornos quebequeses, ejecutandose en hardware modesto.
- Investigacion linguistica: analisis de corpus de habla espontanea quebequesa, aunque con la advertencia de que el autor observa un rendimiento peor en habla espontanea (35,3 % WER) que en lectura (14,2 % WER).
- Despliegue en dispositivos sin GPU: la cuantizacion q5_0 permite ejecutar el modelo en CPU, lo que habilita su uso en portatiles o servidores sin acelerador, a costa de mayor latencia.

## Benchmarks y rendimiento

Evaluacion rapida publicada por el autor (GTX 1070, whisper.cpp 1.8.4 con CUDA, beam 5, VAD activado):

| Modelo | Common Voice QC, 40 clips leidos | Habla espontanea QC, 30 clips (referencias ruidosas) |
|---|---|---|
| large-v3-turbo stock, q5_0 | 23,0 % WER | 27,2 % WER |
| Este ajuste fino, q5_0 | 14,2 % WER | 35,3 % WER |

El propio autor advierte de que las muestras son pequenas y no cientificas: los clips de Common Voice pueden solaparse con los datos de entrenamiento del ajuste fino, y las referencias del conjunto de habla espontanea parecen generadas por Whisper. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y al tratarse de un modelo ASR esas metricas no serian aplicables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, Whisper large-v3-turbo en f16 ocupa aproximadamente 1,6 GB de pesos; q8_0 y q5_0 reducen esa cifra de forma proporcional. El repositorio completo ocupa 3,1 GB porque incluye las tres cuantizaciones y el modelo VAD.
- GPU recomendadas: el autor valida el modelo en una GTX 1070 (8 GB) con CUDA. Cualquier GPU con al menos 4-6 GB de VRAM libre deberia poder ejecutar las cuantizaciones q5_0 y q8_0; para f16 se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si. La GTX 1070 es el caso documentado; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Opciones de despliegue: `whisper-server` y `whisper-cli` de whisper.cpp v1.8.4 o superior; compilacion con backend CUDA, Metal, Vulkan o CPU. Tambien es posible usar el binario `whisper-quantize` para generar cuantizaciones adicionales a partir del f16.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia, solo WER.

Ejemplo de despliegue documentado por el autor:

```sh
whisper-server -m ggml-whisper-fr-qc-q5_0.bin -l fr --convert \
  --vad --vad-model ggml-silero-v6.2.0.bin \
  --inference-path /v1/audio/transcriptions
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (fr-QC, GGML) | no disponible (base turbo) | ventanas de 30 s | fr | MIT | GGML | Ajuste fino a frances quebeques, tres cuantizaciones, VAD incluido |
| openai/whisper-large-v3-turbo | no disponible | ventanas de 30 s | multilingue | MIT | safetensors, GGML via conversion | Modelo original sin ajuste; 23,0 % WER en Common Voice QC segun el autor |
| ele-sage/whisper-large-v3-turbo-fr-quebecois | no disponible | ventanas de 30 s | fr | MIT | safetensors | Modelo base del ajuste fino, en formato Hugging Face Transformers |
| whisper-large-v3 | no disponible | ventanas de 30 s | multilingue | MIT | safetensors, GGML | Decodificador completo de 32 capas; mayor coste de inferencia que turbo |

La comparativa se limita a variantes de la misma familia porque la informacion proporcionada no incluye otros modelos ASR especializados en frances quebeques. No se dispone de datos de rendimiento de las alternativas mas alla del modelo stock incluido en la tabla de benchmarks del autor.

## Limitaciones y advertencias

- El rendimiento en habla espontanea es peor que en habla leida: 35,3 % WER frente a 14,2 % WER en la evaluacion del autor, con la salvedad de que las referencias del conjunto espontaneo parecen generadas por Whisper y pueden estar sesgadas.
- La evaluacion es de muestra pequena (40 y 30 clips) y no cientifica; los clips de Common Voice pueden solaparse con los datos de entrenamiento, lo que infla la mejora aparente.
- El modelo esta especializado en frances quebeques; su rendimiento en frances europeo, otros idiomas o en audio con fuerte ruido no esta documentado y podria degradarse respecto al modelo original.
- Riesgo de alucinacion: Whisper es conocido por generar texto plausible en segmentos de silencio o ruido; el uso de VAD mitiga parcialmente este problema, pero no lo elimina.
- No se documentan sesgos especificos del ajuste fino ni la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos demograficos o dialectales.
- Licencia MIT: permite uso comercial y modificacion, pero el autor del repositorio no ofrece garantias sobre el modelo y remite la atribucion a los autores originales.
- El repositorio es una conversion de formato, no un modelo entrenado por `bouchardm`; cualquier problema de calidad proviene del modelo base `ele-sage/whisper-large-v3-turbo-fr-quebecois`.
- Solo se distribuyen pesos GGML; para usarlo con Transformers o vLLM seria necesario recurrir al repositorio del modelo base en safetensors.
- No se proporcionan tiempos de inferencia ni throughput, por lo que las estimaciones de latencia en produccion deben medirse en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bouchardm/whisper-large-v3-turbo-fr-quebecois-ggml
- Modelo base: https://huggingface.co/ele-sage/whisper-large-v3-turbo-fr-quebecois
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo VAD de referencia: https://huggingface.co/ggml-org/whisper-vad
- Repositorio de filtros mel de OpenAI Whisper: https://huggingface.co/openai/whisper
