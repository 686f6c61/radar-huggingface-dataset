# gpillon/Qwen3-ASR-1.7B-GGUF-ignis

## Resumen

Qwen3-ASR-1.7B-GGUF-ignis es una conversion al formato GGUF del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. La conversion, las cuantizaciones y el empaquetado corren a cargo de gpillon como parte del proyecto ignis, un servidor de inferencia local compatible con la API de OpenAI. El modelo resuelve la transcripcion de audio a texto con 2.031.739.904 parametros y se distribuye bajo licencia Apache 2.0.

La particularidad de esta publicacion es su enfoque de despliegue: los ficheros estan pensados para ejecutarse en CPU mediante un ejecutor propio escrito en Rust, de forma que el modelo de voz no consume VRAM y puede convivir con un modelo de lenguaje que si ocupa la GPU. Esto lo hace relevante para escenarios de dictado local, asistentes de voz y transcripcion privada donde el audio no debe salir de la maquina.

El repositorio incluye el decodificador en tres precisiones (Q4_K_M, Q8_0 y bf16) y el codificador de audio en dos (Q8_0 y bf16), con hashes SHA-256 publicados y fijados en el catalogo de ignis. La version por defecto es Q4_K_M, que segun las mediciones del autor mantiene una tasa de error por palabra cercana a la del checkpoint oficial en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con decodificador y codificador de audio separados; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 y bf16 (decodificador); Q8_0 y bf16 (codificador de audio) |
| Idiomas soportados | no disponible (las mediciones del autor cubren italiano e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros separados para decodificador y mmproj del codificador de audio) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Qwen3-ASR-1.7B. Lo que si se documenta es su estructura de despliegue en GGUF: un decodificador cuantizado y un codificador de audio independiente empaquetado como `mmproj`, ambos necesarios para la transcripcion. El checkpoint base es `Qwen/Qwen3-ASR-1.7B` en la revision `7278e1e70fe206f11671096ffdd38061171dd6e5`.

La conversion se realizo con `convert_hf_to_gguf.py` de llama.cpp b11840, generando decodificador y codificador en bf16 y Q8_0, y a partir de bf16 se produjo la cuantizacion Q4_K_M con `llama-quantize`. Los ficheros Q8_0 se verificaron contra la conversion de ggml-org. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Servicio compatible con el endpoint `/v1/audio/transcriptions` de la API de OpenAI, aceptando peticiones con `model: whisper-1`.
- Ejecucion en CPU sin consumo de VRAM, lo que permite coexistir con un modelo de lenguaje en GPU.
- Integracion con el Playground de ignis para dictado de prompts.
- Procesamiento local: el audio no abandona la maquina.
- Soporte multilingue: no disponible como lista cerrada; las pruebas publicadas cubren italiano e ingles.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Dictado de prompts en local: el modelo transcribe la voz del usuario en el Playground de ignis y la convierte en texto de entrada para el modelo de lenguaje, sin enviar audio a servicios externos.
- Transcripcion privada de reuniones: al ejecutarse en CPU y no requerir VRAM, puede correr en paralelo al modelo de lenguaje en un equipo de sobremesa, manteniendo las grabaciones dentro de la infraestructura propia.
- Sustitucion de la API de Whisper en clientes existentes: cualquier cliente OpenAI que envie `model: whisper-1` a `/v1/audio/transcriptions` funciona sin cambios, lo que facilita migraciones.
- Subtitulado y actas en italiano o ingles: las mediciones del autor muestran tasas de error por palabra del 3-4 % en FLEURS y en dictados reales, adecuadas para generar borradores que luego se revisan.
- Despliegue en servidores sin GPU: con un contenedor de 4 nucleos y 3 hilos, la variante Q4_K_M transcribe un clip de 60,8 s en 20,42 s (3,0x tiempo real), lo que permite integrarlo en entornos de bajo coste.
- Procesamiento por lotes de archivos de audio: la variante Q8_0 reduce el error a costa de velocidad (1,7x tiempo real en el contenedor de 4 nucleos), util cuando prima la precision sobre la latencia.
- Asistentes de voz en escritorio: al no ocupar VRAM, deja la GPU libre para el modelo conversacional y simplifica el reparto de recursos en equipos de consumo.

## Benchmarks y rendimiento

Mediciones publicadas por el autor con el ejecutor de CPU de ignis, en caliente, sobre el clip completo y con el prompt oficial.

Velocidad para un clip de 60,8 s (factor de tiempo real entre parentesis):

| Entrada | i9-10900K, 9 hilos | Contenedor de 4 nucleos, 3 hilos |
|---|---|---|
| `qwen3-asr-1.7b` (Q4_K_M) | 13,05 s (4,7x) | 20,42 s (3,0x) |
| `qwen3-asr-1.7b-q8` (Q8_0) | 19,46 s (3,1x) | 34,89 s (1,7x) |

Tasa de error por palabra (WER), agrupada:

| Modelo | 40 clips FLEURS (italiano, ingles) | 11 dictados en italiano |
|---|---|---|
| `qwen3-asr-1.7b` (Q4_K_M) | 4,05 % | 3,23 % |
| `qwen3-asr-1.7b-q8` (Q8_0) | 3,73 % | 2,90 % |
| Transformers, FP32 (checkpoint oficial) | 3,63 % | 3,06 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por tratarse de un modelo de reconocimiento del habla.

## Requisitos de hardware

- VRAM: 0 GB. El modelo esta disenado para ejecutarse en CPU con el ejecutor de ignis.
- GPU: no requiere GPU; la GPU queda libre para el modelo de lenguaje.
- CPU: medido en un i9-10900K con 9 hilos y en un contenedor de 4 nucleos con 3 hilos. Con 3 hilos en 4 nucleos se obtiene 3,0x tiempo real con Q4_K_M.
- Memoria RAM: no disponible de forma explicita; el repositorio completo ocupa 8,5 GB, pero la variante por defecto Q4_K_M con el codificador Q8_0 requiere bastante menos.
- Despliegue: servidor ignis (Rust, compatible con OpenAI), version v0.9.0 o posterior. La descarga se hace con `ignis-server model download qwen3-asr-1.7b`.
- Otras opciones de despliegue (llama.cpp, Ollama, vLLM, TGI): no documentadas para estos ficheros en la informacion disponible.
- Latencia y throughput: ver tabla de la seccion anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS, italiano/ingles) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-GGUF-ignis (Q4_K_M) | 2,03 B | no disponible | 4,05 % | Apache 2.0 | GGUF |
| Qwen3-ASR-1.7B-GGUF-ignis (Q8_0) | 2,03 B | no disponible | 3,73 % | Apache 2.0 | GGUF |
| Qwen/Qwen3-ASR-1.7B (FP32) | 2,03 B | no disponible | 3,63 % | Apache 2.0 | safetensors |
| Whisper de OpenAI | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye mediciones de otros modelos de ASR comparables, por lo que la comparativa con alternativas como Whisper queda como no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo original; deben evaluarse con audios propios antes de usarlo en produccion.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o solapamiento de voces; no se han publicado pruebas especificas al respecto.
- La cobertura de idiomas no esta listada; las unicas evaluaciones publicadas son en italiano e ingles, por lo que el rendimiento en castellano no esta verificado en esta ficha.
- La longitud de contexto de audio no esta disponible; no se indica la duracion maxima de clip soportada.
- La cuantizacion Q4_K_M introduce una perdida de precision medible: 4,05 % frente a 3,63 % del checkpoint oficial en FLEURS.
- El soporte de despliegue documentado se limita al servidor ignis; no se confirma compatibilidad con otros runners GGUF.
- Licencia Apache 2.0, que permite uso comercial, pero al ser una forma modificada del modelo original conviene conservar la atribucion al equipo Qwen y revisar el fichero `LICENSE` incluido.
- Los ficheros estan fijados por revision y hash en el catalogo de ignis; usar otras revisiones puede romper la verificacion de integridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gpillon/Qwen3-ASR-1.7B-GGUF-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de ignis: https://github.com/gpillon/ignis
- Ultima release de ignis: https://github.com/gpillon/ignis/releases/latest
- Issue de seguimiento del soporte de voz: https://github.com/gpillon/ignis/issues/350
- Documentacion de ignis: https://gpillon.github.io/ignis/
