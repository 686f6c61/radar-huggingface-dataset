# D3rPapst/moss-music-8b-gufo

## Resumen

MOSS-Music-8B-Instruct es un modelo de comprension musical desarrollado por OpenMOSS Team en colaboracion con MOSI.AI y el Shanghai Innovation Institute. Combina un codificador de audio de estilo Whisper con un modelo de lenguaje Qwen3-8B para responder preguntas en lenguaje natural sobre fragmentos musicales: descripcion, letra, estructura y consultas abiertas sobre el clip. Esta ficha describe la conversion a GGUF publicada por D3rPapst, no el modelo original.

La publicacion de D3rPapst es una cuantizacion en dos ficheros GGUF pensada para el runtime nativo `gufo` sobre AMD Strix Halo bajo Windows, sin dependencias de Python ni PyTorch. El codificador de audio se mantiene en BF16 (1,72 GB) y el modelo de lenguaje se cuantiza a Q8_0 (8,71 GB), con un total de repositorio de 10,4 GB. La arquitectura del LLM subyacente es Qwen3, por lo que hereda su tokenizador y plantilla de chat.

Es relevante porque ofrece una via de despliegue local de un modelo audio-texto multimodal en hardware de consumo AMD, con una API compatible con OpenAI (`POST /v1/chat/completions` con `input_audio` en WAV base64). El consumo medido es de aproximadamente 10,6 GB de GPU a contexto 4096. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-texto: codificador de audio estilo Whisper (stem Conv2d, 32 capas) + adaptador de audio + tres mergers DeepStack + LLM Qwen3-8B |
| Parametros totales | 861.728.128 en safetensors (dato del repo); el LLM Qwen3-8B se distribuye como GGUF Q8_0 de 8,71 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuracion recomendada en el ejemplo de despliegue) |
| Tipos de cuantizacion | LLM en Q8_0 (254 tensores Q8_0 + 145 F32); codificador de audio en BF16 con vectores F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en dos ficheros: `moss-music-8b.audio.gguf` (BF16/F32) y `moss-music-8b.llm-Q8_0.gguf` (Q8_0) |

## Arquitectura y entrenamiento

La conversion preserva la arquitectura original de MOSS-Music: un codificador de audio con stem Conv2d y 32 capas, un adaptador de audio y tres mergers DeepStack que proyectan las representaciones acusticas al espacio del modelo de lenguaje. El LLM es Qwen3-8B, exportado como GGUF estandar de arquitectura `qwen3` con tokenizador y plantilla de chat incluidos. Los nombres de tensores del fichero de audio conservan la nomenclatura de Hugging Face, con matrices en BF16 y vectores en F32.

El proceso de conversion se realizo en dos etapas: primero, un script (`convert_hf_to_gufo.py`) recorrio los cuatro shards de safetensors tensor a tensor para generar el GGUF de audio y una carpeta `Qwen3ForCausalLM` plana (renombrando `language_model.*` a `model.*`); despues, `convert_hf_to_gguf.py --outtype bf16` y `llama-quantize` a Q8_0 con llama.cpp build b1351. Se genero una regresion con 5 clips de prueba y 64 tokens greedy, registrando argmax y top-5. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Comprension musical: descripcion de fragmentos de audio, transcripcion de letra, analisis de estructura y respuesta a preguntas abiertas sobre el clip.
- Entrada multimodal audio-texto: acepta audio WAV codificado en base64 junto a una pregunta en texto mediante `input_audio`.
- Generacion de texto en lenguaje natural a partir del contenido musical analizado.
- Streaming de respuestas en la API compatible con OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio de salida: no disponible en la informacion proporcionada.

## Casos de uso

- Catalogacion musical automatizada: el modelo puede generar descripciones textuales de pistas para bibliotecas o plataformas de streaming, usando el codificador de audio para extraer representaciones y el LLM para redactar la ficha.
- Transcripcion y analisis de letras: a partir de un clip WAV, el modelo responde preguntas sobre la letra y la estructura de la cancion, util para editoriales musicales o servicios de karaoke.
- Busqueda semantica sobre audio: integrado en un pipeline que convierta clips en descripciones textuales indexables, permite consultas en lenguaje natural sobre un catalogo musical.
- Asistencia a productores y musicologos: consultas interactivas sobre un fragmento concreto (instrumentacion, secciones, tempo percibido) mediante la API de chat con contexto de 4096 tokens.
- Despliegue local en estaciones de trabajo AMD Strix Halo: el formato GGUF y el runtime `gufo` permiten ejecutar el modelo en Windows sin Python ni CUDA, con unos 10,6 GB de GPU a contexto 4096, adecuado para prototipos y demos offline.
- Moderacion y analisis de contenido musical: clasificacion y descripcion de clips en flujos de revision, aprovechando la inferencia local y la licencia Apache 2.0 para uso comercial.
- Educacion musical: generacion de explicaciones sobre fragmentos de audio para herramientas de aprendizaje, con respuestas en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una regresion interna con 5 clips de prueba y 64 tokens greedy (argmax y top-5 registrados en `regression-q8-2026-11-12.json`), sin metricas comparativas publicas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,6 GB de GPU a contexto 4096 (medido por el autor).
- RAM de host: menos de 1 GB durante la carga.
- GPU objetivo: AMD Strix Halo (ROCm) bajo Windows; el autor configura `router-gpu-gb = 12` y `router-host-gb = 1`.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible en la informacion proporcionada; el runtime documentado es especifico de gufo sobre Strix Halo.
- Cabe en GPU de consumo: si, en el hardware integrado de Strix Halo; no se documenta compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: runtime `gufo` (`gufo serve moss-music`), API compatible con OpenAI (`POST /v1/chat/completions`). El fichero del LLM es un GGUF estandar `qwen3` y podria cargarse con llama.cpp, pero la parte de audio requiere el runtime `gufo`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Music-8B-Instruct (GGUF de D3rPapst) | 861,7 M en safetensors; LLM Qwen3-8B en Q8_0 | 4096 | Audio-texto | Apache 2.0 | GGUF en Hugging Face, runtime gufo |
| OpenMOSS-Team/MOSS-Music-8B-Instruct (original) | no disponible | no disponible | Audio-texto | Apache 2.0 | Pesos originales en Hugging Face |
| Alternativas de audio-texto de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no incluye fichero LICENSE original; el texto Apache 2.0 se anade como `LICENSE` a partir de la declaracion de la model card, lo que conviene verificar antes de un uso comercial.
- La cuantizacion Q8_0 del LLM puede introducir divergencias respecto al modelo original en BF16; el autor solo documenta una regresion cualitativa con 5 clips.
- El despliegue documentado esta limitado a Windows sobre AMD Strix Halo con el runtime `gufo`; no hay soporte documentado para vLLM, TGI u Ollama con entrada de audio.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limites de contexto mas alla de los 4096 tokens configurados.
- El modelo esta especializado en comprension musical; su uso fuera de ese dominio no esta validado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- La conversion y documentacion se realizaron con asistencia de IA (Claude Code), segun declara el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/D3rPapst/moss-music-8b-gufo
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct
- Runtime gufo-studio-windows: https://github.com/D3rPapst/gufo-studio-windows
- Codigo de MOSS-Music: https://github.com/OpenMOSS/MOSS-Music
