# P2Enjoy/whisper-large-v3-turbo

## Resumen

P2Enjoy/whisper-large-v3-turbo es un espejo (mirror) sin ninguna modificacion del modelo openai/whisper-large-v3-turbo, publicado por el usuario P2Enjoy para una pila de trabajo denominada "Liaison Vocale". Se trata, por tanto, de un modelo de reconocimiento automatico de voz (ASR) de tipo transformer encoder-decoder con 808.878.080 parametros (unos 809 M), pesos en safetensors y un repositorio de 1,6 GB. El modelo original lo desarrollo OpenAI y corresponde a la variante "turbo" de la familia Whisper large-v3, disenada para reducir la latencia de inferencia respecto al large-v3 estandar.

El problema que resuelve es la transcripcion de audio a texto y la traduccion de voz a ingles de forma multilingue, ademas de tareas auxiliares como la identificacion de idioma o la prediccion de marcas temporales. La utilidad de este repositorio concreto es acotada: al ser una copia exacta fijada a una revision concreta (`41f01f3fe87f28c78e2fbf8b568835947dd65ed9`), sirve como punto de descarga reproducible y congelado, no como un modelo nuevo.

Su relevancia actual depende enteramente del modelo base: Whisper large-v3-turbo es una de las referencias abiertas mas usadas para ASR en produccion por su relacion entre precision y coste computacional. Cabe senalar que el repositorio acumula 0 descargas y 0 likes, y que su model card esta redactada en frances y se limita a declarar que se trata de un espejo sin cambios y a listar los hashes SHA-256 de cada archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (familia Whisper) |
| Parametros totales | 808.878.080 (~809 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repo; el modelo base procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors; no incluye GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible en la metadata del repo; el modelo base es multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3-turbo |
| Revision fijada | 41f01f3fe87f28c78e2fbf8b568835947dd65ed9 |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder que consume espectrogramas Mel de 128 bandas calculados sobre ventanas de 30 segundos de audio y genera texto de forma autorregresiva. La variante "turbo" reduce el decodificador respecto al large-v3 estandar, lo que rebaja el numero de parametros hasta los ~809 M y acelera la decodificacion manteniendo la precision del encoder. Se trata de un modelo exclusivamente de audio-texto, sin componentes de vision ni de generacion de texto general.

Segun la model card, este repositorio es una copia literal, sin reentrenamiento ni ajuste fino, de la revision indicada del modelo de OpenAI; se adjuntan los hashes SHA-256 de `config.json`, `generation_config.json`, `model.safetensors`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `normalizer.json`, `added_tokens.json` y `special_tokens_map.json` para verificar la integridad. No se aporta informacion adicional sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO en la informacion disponible; esos detalles corresponden a la documentacion del modelo base de OpenAI.

## Capacidades

- Transcripcion de voz a texto (ASR) en modo multilingue.
- Traduccion de voz a ingles (tarea X to en) dentro del mismo modelo.
- Identificacion automatica del idioma del audio.
- Prediccion de marcas temporales y segmentacion aproximada del audio.
- Procesamiento de audio en ventanas de 30 segundos (modelo base), con encadenamiento por chunks para audios mas largos.
- No soporta tool calling ni function calling: es un modelo de audio, no un LLM conversacional.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de vision, codigo, matematicas ni generacion de texto libre fuera de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y actas automaticas: el modelo convierte el audio de una reunion en texto con marcas temporales, que despues se puede indexar o resumir con un LLM independiente.
- Subtitulado automatico de video: genera subtitulos con timestamps para plataformas de contenido, aprovechando la prediccion de marcas temporales y la deteccion de idioma.
- Dictado y escritura por voz: integrado en editores o interfaces, permite redactar texto a partir de audio en tiempo casi real gracias a la variante turbo de baja latencia.
- Transcripcion de llamadas de atencion al cliente: convierte conversaciones telefonicas en texto para analitica, control de calidad y deteccion de incidencias.
- Documentacion clinica: transcripcion de notas de voz de profesionales sanitarios para reducir la carga administrativa, siempre con revision humana por el riesgo de error.
- Indexacion y busqueda de podcasts o archivos de audio: transcripcion masiva de un catalogo para habilitar busqueda por texto completo y resumenes.
- Accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en eventos, clases o webinars.
- Preprocesado para pipelines de datos: conversion de corpus de audio a texto antes de alimentar sistemas de analisis, traduccion o mineria de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~3,2 GB en fp32, ~1,6 GB en fp16/bf16 y ~0,8 GB en int8. Hay que sumar el espacio de activaciones y el cache del decodificador, por lo que en la practica se suele necesitar entre 2 y 3 GB en fp16 con PyTorch y alrededor de 1 GB con CTranslate2 en int8.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060 de 12 GB, RTX 4070, RTX 4090 de 24 GB) es suficiente; en entornos de servidor, A100 o H100 quedan muy sobredimensionadas para un modelo de este tamano y se usarian por concurrencia, no por capacidad.
- Cabe sin problema en GPU consumer e incluso en CPU para inferencia por lotes, con latencias mayores.
- Opciones de despliegue: transformers (PyTorch), faster-whisper sobre CTranslate2, whisper.cpp o whisperX. Para whisper.cpp y Ollama hace falta convertir los pesos a GGML/GGUF, ya que este repositorio solo publica safetensors. Existe soporte de Whisper en algunos servidores de inferencia como vLLM.
- Latencia y throughput: no se proporcionan cifras en la informacion disponible; la variante turbo del modelo base esta optimizada para reducir la latencia frente a large-v3.

## Comparativa con modelos similares

Datos de referencia de la familia Whisper (corresponden a los modelos base de OpenAI, no a mediciones realizadas sobre este repositorio):

| Modelo | Parametros | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| whisper-large-v3-turbo (este repo) | ~809 M | 30 s | MIT | HuggingFace (espejo) |
| openai/whisper-large-v3 | ~1550 M | 30 s | MIT | HuggingFace |
| openai/whisper-medium | ~769 M | 30 s | MIT | HuggingFace |

Frente a whisper-large-v3, la variante turbo reduce aproximadamente a la mitad el numero de parametros gracias al decodificador mas ligero, a costa de una precision ligeramente inferior en algunos escenarios. Frente a whisper-medium, turbo mantiene la calidad del encoder large con un decodificador pequeno, por lo que suele ofrecer mejor precision con un coste de inferencia similar.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no aporta mejoras ni ajustes respecto al modelo original, y todo el merito y la responsabilidad corresponden a OpenAI.
- Los avisos tipicos de Whisper siguen aplicando: riesgo de alucinacion en fragmentos de silencio, musica o ruido, en los que puede generar texto inexistente.
- Puede presentar sesgos de precision segun el acento, el dialecto, la calidad del audio o la variante idiomatica, con rendimiento desigual entre idiomas.
- El repositorio no declara idiomas soportados en su metadata, aunque el modelo base es multilingue; conviene verificar el comportamiento por idioma antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribucion y revisar la documentacion del modelo base.
- Con 0 descargas y 0 likes, carece de validacion por parte de la comunidad; conviene verificar los hashes SHA-256 publicados antes de confiar en el contenido.
- No debe usarse para fines de vigilancia masiva ni para procesar audio sin el consentimiento adecuado de las personas implicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/P2Enjoy/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Revision fijada del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/tree/41f01f3fe87f28c78e2fbf8b568835947dd65ed9
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
