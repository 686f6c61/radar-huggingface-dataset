# LLJYY/OmniLion-v1.1

## Resumen

OmniLion v1.1 es un modelo multimodal de generacion de texto desarrollado por el usuario LLJYY. Combina el backbone linguistico y de vision Qwen-SEA-LION v4.5 27B IT de AI Singapore con un encoder de audio entrenado procedente de Qwen3-ASR-1.7B y un proyector de audio propio. El resultado es un modelo que acepta texto, imagenes, video, audio y entradas audiovisuales conjuntas, y produce texto. El problema que aborda es la unificacion de comprension de audio, imagen y video sobre un backbone especializado en lenguas del sudeste asiatico, sin necesidad de un gateway externo para servir peticiones multimodales.

El modelo se distribuye como safetensors BF16 completamente fusionado: incluye las actualizaciones del decoder, la torre de vision nativa, la torre de audio entrenada y el proyector, por lo que no requiere adaptadores LoRA en inferencia. Cuenta con 28.120.923.504 parametros totales y una longitud de contexto de 262.144 tokens, incluyendo las posiciones ocupadas por contenido multimedia. La libreria declarada es vLLM y el pipeline es image-text-to-text.

Es relevante porque publica resultados propios en benchmarks de audio y audiovisual (MMAU test y DailyOmni) con cifras que el autor situa por encima de referencias como Gemini 2.5 Pro y MERaLiON-3 10B, si bien el propio autor advierte que no se trata de una evaluacion limpia en held-out. El modelo no genera voz: la salida es siempre texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.5 conditional-generation (lenguaje y vision) y encoder de audio Qwen3-ASR |
| Parametros totales | 28.120.923.504 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens, incluyendo posiciones de medios |
| Tipos de cuantizacion | no disponible (release publicado en BF16 safetensors) |
| Idiomas soportados | no disponible (backbone orientado a lenguas del sudeste asiatico) |
| Licencia | other, con nombre mit-and-apache-2.0-components |
| Formato de pesos | safetensors (BF16, modelo fusionado) |

## Arquitectura y entrenamiento

OmniLion v1.1 se construye sobre Qwen-SEA-LION v4.5 27B IT, que aporta la arquitectura nativa de generacion condicional Qwen3.5 con capacidades de lenguaje y vision. Sobre ese backbone se incorpora un encoder de audio entrenado derivado de Qwen3-ASR-1.7B, conectado mediante un proyector de audio cuya estructura es RMSNorm, una capa lineal de 1024 a 4096, una ReLU al cuadrado y una capa lineal de 4096 a 5120. El autor describe el modelo como fusionado, con las actualizaciones del decoder, la torre de vision, la torre de audio y el proyector ya integradas en los pesos.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal. El modelo se sirve mediante un plugin propio para vLLM (version 0.1.3) que aporta la implementacion del modelo compuesto, y opcionalmente mediante un runtime de servicio que expone sesiones Live por WebSocket y reenvia la inferencia al mismo backend vLLM.

## Capacidades

- Generacion de texto y texto en streaming a traves de Chat Completions.
- Comprension de imagenes (image-text-to-text) mediante la torre de vision nativa del backbone.
- Comprension de video, incluyendo entradas audiovisuales conjuntas.
- Comprension de audio nativa gracias al encoder Qwen3-ASR entrenado y al proyector de audio.
- Entradas multimodales conjuntas: audio mas video, audio solo, imagen sola o combinaciones con texto.
- Generacion de llamadas a funciones (function calling) y campos de razonamiento a traves de Chat Completions.
- Soporte de sesiones Live por WebSocket con entrada de texto por turnos, imagen fija y audio PCM, con salida de texto en streaming.
- No genera voz ni soporta audio full-duplex: la salida es exclusivamente texto.

## Casos de uso

- Transcripcion y comprension de audio con contexto largo: el modelo acepta audio PCM y puede procesar conversaciones o grabaciones extensas aprovechando la ventana de 262.144 tokens, lo que resulta adecuado para reuniones o entrevistas de larga duracion.
- Analisis de video con pista de audio: al aceptar entradas audiovisuales conjuntas, puede responder preguntas sobre el contenido hablado y visual de un clip, util en moderacion de contenido o indexacion de archivos multimedia.
- Asistencia multimodal en atencion al cliente: combinando texto e imagenes en conversaciones multi-turno, el modelo puede interpretar capturas de pantalla o documentos enviados por el usuario y responder en el mismo hilo.
- Procesamiento de contenido en lenguas del sudeste asiatico: el backbone Qwen-SEA-LION esta orientado a estas lenguas, por lo que encaja en pipelines de analisis documental o transcripcion regional con soporte de imagen y audio.
- Integracion en pipelines con function calling: la generacion de llamadas a funciones permite conectarlo a herramientas externas en flujos de automatizacion o agentes de varios pasos.
- Despliegue de endpoints multimodales con vLLM: el plugin permite servir Chat Completions estandar con entrada de audio, imagen y video sin gateway adicional, lo que simplifica la integracion en infraestructura existente basada en la API de OpenAI.
- Sesiones interactivas en tiempo real: el runtime Live con WebSocket admite entrada por turnos de texto, imagen fija y audio PCM con salida en streaming, adecuado para prototipos de asistentes conversacionales multimodales.

## Benchmarks y rendimiento

| Benchmark | Entrada | OmniLion v1.1 | Referencia comparada |
|---|---|---:|---|
| MMAU test | Audio | 69,43 % (6.249 / 9.000) | Gemini 2.5 Pro: 69,36 %; MERaLiON-3 10B: 68,71 % |
| DailyOmni | Audio + video | 69,09 % (827 / 1.197) | no disponible en detalle |
| DailyOmni | Audio solo | 57,73 % (691 / 1.197) | MERaLiON-3 10B: 47,70 % |

El autor advierte que las cifras de MMAU corresponden al test de 9.000 items y no al test-mini, que los ajustes de inferencia publicados y locales difieren, y que existe exposicion previa a benchmarks y seleccion de checkpoint, por lo que no se reclama como evaluacion limpia en held-out. La ventaja sobre Gemini 2.5 Pro en MMAU se presenta como una comparacion de estimacion puntual, no como superioridad estadistica establecida. Las barras marcadas con daga en las graficas son referencias publicadas por los autores de los benchmarks; el resto son mediciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: el release es BF16 con 28.120.923.504 parametros, lo que situa los pesos en torno a 56 GB; a ello hay que sumar el coste de cache KV para una ventana de 262.144 tokens, que puede ser considerable.
- La configuracion de referencia del autor usa cuatro GPU visibles con tensor parallelism 4 (TP4) en BF16, segun el archivo runtime/vllm.yaml.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; la configuracion TP4 sugiere GPUs de centro de datos con memoria suficiente (por ejemplo, A100 o H100), aunque no se confirma.
- Viabilidad en GPU de consumo: no disponible; el tamano en BF16 y el contexto maximo hacen improbable un despliegue en una sola GPU de consumo sin cuantizacion, que no se documenta.
- Opciones de despliegue: vLLM 0.25.1 con el plugin omnilion_vllm_plugin 0.1.3, PyTorch 2.11.0 con CUDA 13.0, Transformers 5.22.1, PyAV 16.1.0, SoundFile 0.13.1 y SciPy 1.17.0. Opcionalmente, el runtime de servicio Live (FastAPI 0.136.3, HTTPX 0.28.1, AnyIO 4.15.1, Uvicorn 0.54.0).
- Latencia y throughput: no disponible.
- Requisitos adicionales: compilador del toolkit CUDA y Ninja en PATH, con CUDA_HOME configurado; debe usarse el directorio completo de pesos con la carpeta runtime/ junto a ellos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMAU test (audio) | DailyOmni (audio solo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OmniLion v1.1 | 28,12 B | 262.144 tokens | 69,43 % | 57,73 % | other (MIT y Apache 2.0 por componentes) | Hugging Face, via vLLM con plugin |
| Gemini 2.5 Pro | no disponible | no disponible | 69,36 % (referencia publicada) | no disponible | propietaria | API de Google |
| MERaLiON-3 10B | 10 B | no disponible | 68,71 % (medicion del autor) | 47,70 % (medicion del autor) | no disponible | no disponible en la informacion |

La comparativa se limita a los datos que el autor incluye en la model card; no se dispone de resultados de MMLU, HumanEval ni GSM8K para OmniLion v1.1 en la informacion proporcionada. Las diferencias en MMAU son inferiores a un punto porcentual frente a Gemini 2.5 Pro y de aproximadamente 0,7 puntos frente a MERaLiON-3 10B, mientras que en DailyOmni audio solo la diferencia con MERaLiON-3 10B es de 10,03 puntos porcentuales segun las mediciones del autor.

## Limitaciones y advertencias

- El modelo no genera voz ni soporta audio full-duplex; la salida es exclusivamente texto, tambien en el runtime Live.
- Los resultados de benchmarks no constituyen una evaluacion limpia en held-out: hay exposicion previa a benchmarks y seleccion de checkpoint, y los ajustes de inferencia difieren de los publicados por los autores de los benchmarks.
- La ventaja sobre Gemini 2.5 Pro en MMAU es una comparacion de estimacion puntual y no implica superioridad estadistica.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion en la informacion disponible.
- La licencia es "other" con nombre mit-and-apache-2.0-components; las condiciones exactas para uso comercial deben consultarse en el archivo LICENSES.md del repositorio antes de desplegar en produccion.
- El despliegue requiere un plugin propietario de vLLM y una combinacion muy concreta de versiones (vLLM 0.25.1, PyTorch 2.11.0, CUDA 13.0, Transformers 5.22.1), lo que limita la portabilidad a otros stacks.
- Los listeners HTTP y WebSocket se exponen por defecto en loopback; es necesario configurar autenticacion, TLS y politica de red antes de exponerlos remotamente (el runtime opcional admite --api-key-file).
- El repositorio tiene 62 GB y no registra descargas ni likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.
- No se dispone de datos sobre cuantizaciones alternativas ni sobre rendimiento en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LLJYY/OmniLion-v1.1
- Licencias del modelo: https://huggingface.co/LLJYY/OmniLion-v1.1/blob/main/LICENSES.md
- Modelo base linguistico y de vision: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Encoder de audio base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Leaderboard MMAU: https://sakshi113.github.io/mmau_homepage/
- Space de evaluacion MMAU: https://huggingface.co/spaces/sonalkum/MMAU-Eval
- Leaderboard DailyOmni: https://lliar-liar.github.io/Daily-Omni/
