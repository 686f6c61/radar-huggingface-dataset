# ChrisColeTech/scenema-audio

## Resumen

Scenema Audio es un modelo de generación de audio y música a partir de texto (text-to-audio / text-to-music) publicado por ChrisColeTech como cuantización y empaquetado del modelo base ScenemaAI/scenema-audio. El repositorio distribuye los pesos divididos por componentes (transformer de difusión, text encoder, VAE de pipeline y VAE encoder) en formatos safetensors y GGUF, con un total de 11.765.788.416 parámetros según los metadatos de safetensors y un tamaño de repositorio de 21,3 GB.

El modelo resuelve la síntesis de audio musical condicionada por prompts de texto, con soporte adicional de voice-to-voice según la model card, y está pensado para integrarse en flujos de trabajo de ComfyUI mediante un loader GGUF específico. La arquitectura combina un transformer de difusión (etiquetado como ltxv en los tags) con un text encoder Gemma 3 12B en cuantización Q4_K_M y un pipeline VAE de audio.

Su relevancia actual radica en que permite ejecutar generación musical en hardware de consumo de gama alta: la model card reporta unos 3,3 minutos para generar 30 segundos de audio y unos 4,3 minutos para 2 minutos de audio en una RTX 5090 con 32 GB de VRAM. La licencia es "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para audio (tag ltxv) con text encoder Gemma 3 12B y VAE de audio |
| Parametros totales | 11.765.788.416 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (transformer), Q4_K_M (text encoder Gemma 3 12B en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de difusion para audio compuesto por varios modulos separados: un transformer de difusion (`scenema-audio-transformer-int8.safetensors`, 4,91 GB), un text encoder basado en Gemma 3 12B instruct en cuantizacion Q4_K_M (7,3 GB), un VAE de pipeline de audio (6,71 GB) y un VAE encoder (42,7 MB). El tag `ltxv` sugiere una base derivada de la familia LTX-Video adaptada a la modalidad de audio, aunque no se detalla el proceso de adaptacion.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La carpeta `extras` (2,3 GB) incluye componentes auxiliares para audio largo y voice-to-voice: mel-band-roformer, bigvgan, campplus, seedvc y whisper-small, lo que indica un pipeline de post-procesado con separacion de fuentes, vocoder, embeddings de hablante y conversion de voz.

## Capacidades

- Generacion de musica y audio a partir de descripciones textuales (text-to-music y text-to-audio).
- Generacion de audio de larga duracion: la model card incluye ejemplos de 30 segundos y de 2 minutos, y senala que la carpeta `extras` es necesaria para audio mas largo.
- Voice-to-voice: conversion de voz usando los componentes extras (seedvc, campplus, whisper-small).
- Post-procesado de audio con separacion de bandas mel (mel-band-roformer) y vocoder neuronal (bigvgan).
- Integracion en ComfyUI mediante nodos y workflow JSON de ejemplo.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte conversacional segun los tags del repositorio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Produccion musical asistida: generar borradores de pistas instrumentales de 30 segundos a partir de un prompt descriptivo, usando el transformer int8 y el VAE de pipeline; el tiempo de generacion reportado (unos 3,3 minutos en RTX 5090) encaja en iteraciones de estudio.
- Creacion de bandas sonoras para video: generar fragmentos musicales de hasta 2 minutos con la carpeta `extras` para contenido audiovisual, ajustando el prompt al tono de la escena.
- Prototipado de jingles y musica de fondo para publicidad: ciclos rapidos de generacion y seleccion en ComfyUI con el workflow de ejemplo, sin necesidad de infraestructura en cloud.
- Conversion de voz (voice-to-voice): transformar una locucion existente al timbre de otra voz usando seedvc y campplus, util para doblaje preliminar o pruebas de concepto.
- Investigacion en generacion de audio: el repositorio separa claramente transformer, text encoder y VAE, lo que facilita experimentar con sustituciones de componentes o cuantizaciones alternativas.
- Educacion y demos interactivas: desplegar una demo local en una GPU de 32 GB para mostrar generacion musical condicionada por texto en talleres o clases.
- Aislamiento de stems y limpieza: emplear mel-band-roformer del paquete `extras` para separar fuentes en material generado o grabado antes de posteriores etapas de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es el tiempo de generacion en una RTX 5090 (32 GB): aproximadamente 3,3 minutos para 30 segundos de audio y 4,3 minutos para 2 minutos de audio.

## Requisitos de hardware

- VRAM estimada: la model card reporta ejecucion en una RTX 5090 con 32 GB de VRAM; no se especifica el pico exacto de memoria ni el consumo con cuantizaciones menores.
- Componentes y pesos: transformer int8 de 4,91 GB, text encoder Gemma 3 12B Q4_K_M de 7,3 GB, VAE de pipeline de 6,71 GB y VAE encoder de 42,7 MB, mas 2,3 GB de extras para audio largo y voice-to-voice.
- GPU recomendadas: RTX 5090 (32 GB) segun la model card; para GPUs con menos VRAM no hay datos publicados de funcionamiento.
- Cabe en GPU de consumo: si, al menos en RTX 5090; no se documenta su comportamiento en GPUs de 24 GB o menos.
- Opciones de despliegue: ComfyUI con el loader `comfyui-gguf-loader` (canal remoto del ComfyUI Manager) y el workflow `workflow_examples/scenema_audio.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este pipeline.
- Latencia y throughput: aproximadamente 3,3 minutos para 30 segundos de audio y 4,3 minutos para 2 minutos de audio en RTX 5090.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de generacion de musica que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los terminos del modelo base ScenemaAI/scenema-audio y del repositorio de ChrisColeTech antes de cualquier uso comercial; no se detallan las restricciones concretas.
- El repositorio es una cuantizacion y reempaquetado del modelo base, no un entrenamiento original; los meritos y limitaciones del modelo subyacente aplican igualmente.
- Requiere la carpeta `extras` (2,3 GB) para audio de larga duracion y voice-to-voice; sin ella, estas funciones no estan disponibles.
- Dependencia de un loader GGUF especifico (`comfyui-gguf-loader` en canal remoto) y de un workflow concreto, lo que anade fragilidad en produccion ante cambios de version.
- No se documentan sesgos conocidos, tasas de alucinacion, cobertura idiomatica ni calidad subjetiva del audio generado.
- No hay informacion sobre limites de longitud de prompt, resolucion temporal de salida ni formato de audio final mas alla de los ejemplos MP3.
- El rendimiento medido corresponde exclusivamente a una RTX 5090; extrapolar los tiempos a otras GPUs no esta respaldado por datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChrisColeTech/scenema-audio
- Modelo base: https://huggingface.co/ScenemaAI/scenema-audio
- Transformer int8: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/split/diffusion_models/scenema-audio-transformer-int8.safetensors
- Text encoder Gemma 3 12B Q4_K_M: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/split/text_encoders/gemma-3-12b-it-Q4_K_M.gguf
- VAE de pipeline: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/split/vae/scenema-audio-pipeline.safetensors
- VAE encoder: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/split/vae/scenema-audio-vae-encoder.safetensors
- Carpeta extras: https://huggingface.co/ChrisColeTech/scenema-audio/tree/main/extras
- Workflow de ejemplo: https://huggingface.co/ChrisColeTech/scenema-audio/blob/main/workflow_examples/scenema_audio.json
- Muestra de audio Honey Buns: https://huggingface.co/ChrisColeTech/scenema-audio/resolve/main/samples/ComfyUI_00024.mp3
- Muestra de audio WAKE UP PEOPLE: https://huggingface.co/ChrisColeTech/scenema-audio/resolve/main/samples/ComfyUI_00030.mp3
