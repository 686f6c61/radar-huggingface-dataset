# nativ-community/LFM3-Omni-2B-8bit

## Resumen

LFM3-Omni-2B-8bit es una conversion nativa a MLX del checkpoint lq-preview/LFM3-Omni-2B, un modelo multimodal "any-to-any" de la familia LFM3 (Liquid Foundation Models) con aproximadamente 2.166 millones de parametros. La conversion la mantiene la organizacion nativ-community y esta pensada para ejecucion eficiente en hardware Apple Silicon mediante el framework MLX y la libreria mlx-vlm. El modelo procesa y genera texto, audio e imagen dentro de una unica pila, incluyendo reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y OCR sobre imagen y video.

El interes practico de esta ficha esta en la cuantizacion: los pesos del transformer se han convertido a 8 bits afines con grupo de 64, mientras que los modulos de audio y vision se mantienen en BF16 y el codec de audio se copia sin modificar. Esto reduce el repositorio a 2,9 GB y permite cargar el modelo completo en equipos con memoria unificada moderada, algo relevante para desarrolladores que quieren prototipar pipelines multimodales en local sin depender de GPUs dedicadas.

La limitacion principal es que se trata de una conversion de comunidad, no de un lanzamiento oficial: no se publican resultados de benchmarks amplios, la validacion se reduce a comprobaciones de humo (fixtures cortos) y la licencia heredada es LFM1.0, con terminos que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (familia LFM3) con modulos de audio y vision; inferencia via mlx-vlm |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64 (audio y vision en BF16; activaciones y cache KV sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (lfm1.0, license: other); se aplican los terminos del checkpoint original |
| Formato de pesos | safetensors (MLX), con codigo custom (`trust_remote_code=False`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint original mas alla de su caracter multimodal any-to-any: el modelo integra entrada y salida de texto, audio e imagen, con modulos separados de audio y vision que en esta conversion permanecen en BF16. El pipeline declarado es `any-to-any` y la inferencia se realiza con mlx-vlm sobre MLX. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es la propia conversion: cuantizacion affine de 8 bits con grupo de 64 sobre los pesos del transformer, preservacion en BF16 de los modulos de audio y vision, copia intacta del codec de audio y ausencia de cuantizacion en activaciones y cache KV. La model card documenta la procedencia (commit del checkpoint base, commit de la implementacion de conversion y commit publico de mlx-vlm), incluye `conversion.json` con la auditoria de tensores y `SHA256SUMS` con los hashes de ficheros.

## Capacidades

- Generacion de texto y razonamiento basico; la validacion incluye una prueba aritmetica con resultado exacto (42).
- Reconocimiento automatico del habla (ASR) en ingles, con WER del 0 % en el fixture de validacion.
- Sintesis de voz (TTS) con control de idioma y voz mediante instrucciones en el mensaje de sistema; genera waveform a 24 kHz.
- Conversacion multimodal intercalada (interleaved) con audio de entrada y salida.
- OCR sobre imagen: extrae texto de una imagen en la validacion ("CODE 5739").
- OCR sobre video: identifica el codigo mostrado en un video ("5739").
- Procesamiento de audio y vision dentro de la misma pila any-to-any.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modo "thinking" omni no esta soportado segun la model card.
- Capacidades multilingues: no disponibles; los ejemplos de la model card usan ingles (ASR y TTS en ingles americano).

## Casos de uso

- Transcripcion de audio en local sobre Apple Silicon: el modelo realiza ASR con el mismo checkpoint que genera la respuesta, lo que permite montar un pipeline de dictado o subtitulado sin servicios externos, cargando los 2,9 GB del repositorio en memoria unificada.
- Generacion de voz para prototipos de asistentes: mediante instrucciones de sistema ("TTS in American English using a female voice") se obtiene waveform a 24 kHz, util para demos de interface conversacional en macOS.
- Extraccion de texto de imagenes en flujos documentales: el OCR validado sobre imagen permite digitalizar carteles, capturas o documentos escaneados en un script MLX sin GPU dedicada.
- Analisis de video con texto en pantalla: la capacidad de OCR sobre video sirve para indexar contenido audiovisual (por ejemplo, codigos o rotulos) en herramientas internas de catalogacion.
- Evaluacion y experimentacion con modelos any-to-any: investigadores pueden comparar el comportamiento de la version 8-bit frente al checkpoint BF16 original en tareas de audio y vision, usando los fixtures de validacion como referencia reproducible.
- Desarrollo de prototipos multimodales en portatiles Apple: al mantener audio y vision en BF16 y solo cuantizar el transformer, el modelo es adecuado para iterar rapidamente en cuadernos o scripts locales antes de escalar a un despliegue mayor.
- Pruebas de conversacion intercalada audio-texto: la validacion incluye un caso interleaved con salida de waveform, util para disenar interfaces que alternan habla y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones de humo de la conversion (no son un benchmark de calidad amplio):

| Check | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de habla suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta: True) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Waveform finita a 24000 Hz, 3,52 s; finish: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Waveform finita a 24000 Hz, 2,56 s; finish: stop |
| image_ocr | Texto "CODE 5739" detectado en la imagen |
| video_ocr | Codigo "5739" detectado en el video |

Las pruebas se ejecutaron en un Apple M3 Ultra con MLX 0.32.4, semilla 42 y los ajustes de muestreo de audio por defecto del modelo. El round-trip ASR usa el mismo modelo y no constituye una evaluacion independiente del habla.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,9 GB en disco; en inferencia hay que sumar activaciones, cache KV (no cuantizada) y el codec de audio. Como referencia, el modelo se valido en un Apple M3 Ultra con memoria unificada.
- GPU recomendadas: la conversion esta pensada para Apple Silicon via MLX; no se documenta soporte para CUDA, A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no disponible para GPU dedicadas; en equipos Apple con memoria unificada, el tamano del repositorio sugiere que puede cargarse en configuraciones de 16 GB o superiores, aunque no se confirma en la model card.
- Opciones de despliegue: mlx-vlm en un commit concreto (`3070dcc31948f48f9d8639b606af7bc019494fac`), instalado con `pip install 'mlx-vlm @ git+...'`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo reporta duraciones de las muestras generadas (3,52 s y 2,56 s de waveform), no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-8bit (esta ficha) | 2.166.928.384 | no disponible | texto, audio, imagen (any-to-any) | LFM1.0 | MLX, conversion de comunidad |
| lq-preview/LFM3-Omni-2B (checkpoint base) | no disponible | no disponible | texto, audio, imagen | LFM1.0 | HuggingFace, checkpoint original |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta conversion y el checkpoint base ni con otros modelos any-to-any de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La generacion de habla soporta batch uno; no hay streaming de waveform ni historial de habla basado en waveform.
- La banda sonora de video debe suministrarse por separado como entrada de audio.
- El modo "thinking" omni no esta soportado.
- Precisones mas bajas pueden reducir la calidad; cada formato requiere evaluacion especifica por tarea antes de desplegar.
- La validacion es limitada: fixtures cortos y comprobaciones de humo, no un benchmark de calidad amplio; el round-trip ASR no es una evaluacion independiente.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser una conversion de comunidad, no hay garantias de soporte ni mantenimiento.
- Idiomas soportados no disponibles; los ejemplos se limitan al ingles.
- Licencia LFM1.0 con terminos del checkpoint original: es necesario revisar `LICENSE` y `ORIGINAL_MODEL_CARD.md` antes de uso comercial; la conversion no asigna una nueva licencia a los pesos.
- `trust_remote_code=False` en el ejemplo de carga; el modelo usa codigo custom y depende de un commit concreto de mlx-vlm, lo que puede complicar la reproducibilidad a medio plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-8bit
- Checkpoint base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementacion de inferencia (mlx-vlm, commit fijado): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Model card original: ORIGINAL_MODEL_CARD.md (incluida en el repositorio del modelo)
- Auditoria de conversion y validacion: conversion.json, validation.json, SHA256SUMS (incluidos en el repositorio del modelo)
