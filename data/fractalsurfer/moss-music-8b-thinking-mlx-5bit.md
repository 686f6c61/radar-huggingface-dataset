# FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit

## Resumen

MOSS-Music-8B-Thinking-mlx-5bit es una conversión comunitaria del modelo de comprensión musical OpenMOSS-Team/MOSS-Music-8B-Thinking, adaptada a MLX y cuantizada a 5 bits por el usuario FractalSurfer. Se trata de un modelo de lenguaje de audio (audio-language model) que recibe fragmentos de música como entrada y produce respuestas en texto sobre aspectos como el estado de ánimo, el género, la instrumentación, la letra, la estructura o los acordes. Su pipeline declarado es `audio-text-to-text` y la librería de ejecución es `mlx-audio` 0.5.7 o posterior, sobre hardware Apple Silicon.

El modelo base, desarrollado por el OpenMOSS Team, ronda los 9.100 millones de parámetros (9.052.463.488 según los pesos publicados) y combina un codificador de audio con un adaptador y tres fusionadores DeepStack que alimentan un modelo de lenguaje Qwen3. La variante Thinking incorpora un modo de razonamiento en el que el modelo "piensa" antes de responder dentro de etiquetas `<think>...</think>`. Esta conversión concreta está pensada para funcionar en un Mac con 16 GB de memoria: ocupa 7.4 GB en disco y alcanza un pico de 8.2 GB según las mediciones del autor.

Su relevancia actual radica en que permite ejecutar localmente, sin conexión y en hardware de consumo, tareas de análisis musical que normalmente requieren servicios en la nube. Es un modelo exclusivamente de comprensión (audio de entrada, texto de salida): no genera música. La licencia Apache-2.0 del modelo base se mantiene en esta conversión, que solo aplica conversión de formato y cuantización, sin modificar los pesos de forma estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de audio: codificador de audio + adaptador de audio + tres fusionadores DeepStack + modelo de lenguaje Qwen3 |
| Parametros totales | 9.052.463.488 (unos 9,1 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits afines (affine) con group size 64; el codificador de audio, el adaptador y los tres fusionadores DeepStack se mantienen en bf16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX |

## Arquitectura y entrenamiento

La arquitectura del modelo base MOSS-Music-8B-Thinking es la de un modelo de lenguaje de audio compuesto por varias piezas. La parte de audio incluye un codificador y un adaptador que transforman la señal sonora en representaciones que el modelo de lenguaje puede consumir; tres módulos denominados fusionadores DeepStack actúan como puente entre ambas modalidades. El componente lingüístico es un Qwen3, que es el único elemento cuantizado en esta conversión (junto con los embeddings de tokens y el `lm_head`), mientras que toda la rama de audio permanece en bf16 por sumar menos de 2 GB en total. No hay arquitectura MoE ni SSM en el modelo.

Respecto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. El repositorio del proyecto (OpenMOSS/MOSS-Music) se describe como un modelo abierto para subtitulado musical, transcripción de letras, análisis estructural y respuesta a preguntas musicales, y la model card cita un informe técnico (MOSS-Music Technical Report, 2026). La conversión a MLX se realizó con mlx 0.31.2 y mlx-audio 0.5.7 mediante el comando `python -m mlx_audio.stt.models.moss_music.convert`, aplicando cuantización de 5 bits con group size 64 sin alterar nada más. La innovación destacable es el modo Thinking, que genera una cadena de razonamiento antes de la respuesta final y que mlx-audio elimina automáticamente.

## Capacidades

- Comprensión musical: análisis de fragmentos de audio para describir instrumentación, estado de ánimo, género, tempo y estructura.
- Transcripción de letras (lyrics ASR), con sesgo hacia inglés; el texto en alfabetos no latinos puede degradarse.
- Subtitulado musical (music captioning) y respuesta a preguntas sobre el audio (musical question answering).
- Razonamiento en modo Thinking con cadena de pensamiento interna entre etiquetas `<think>...</think>`.
- Modo sin razonamiento: se puede forzar una respuesta directa abriendo el turno del asistente con un bloque `<think>` vacío, lo que multiplica la velocidad por 2-3 veces sin pérdida apreciable en tareas de completado de formulario.
- Salida en texto estructurado, incluido JSON, con alta tasa de validez (32 de 32 respuestas válidas en las mediciones del autor).
- Multilingüe limitado a inglés y chino.
- No soporta generación de música; es exclusivamente comprensión (audio de entrada, texto de salida).
- No se documentan capacidades de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso

- Etiquetado automático de bibliotecas musicales: dado un catálogo de pistas, el modelo puede generar descripciones de instrumentación, mood y género para cada una, alimentando bases de datos o sistemas de recomendación locales sin enviar audio a la nube.
- Extracción de metadatos en formato JSON: integrable en pipelines que necesiten rellenar formularios estructurados (quién canta, timbre de sintetizador, letra, ambiente) procesando fragmentos de unos 30 segundos, como hace Trainspotting Suite con `djkit ears fetch`.
- Transcripción y análisis de letras para catalogación de derechos: permite obtener el texto cantado y su estructura para tareas de archivo o documentación de obra.
- Análisis estructural para producción musical: consultas sobre tempo, secciones y arreglos para asistir a músicos o productores en la disección de una mezcla.
- Herramientas de accesibilidad: generación de descripciones textuales de contenido musical para personas con discapacidad auditiva.
- Investigación en comprensión de audio: uso como modelo local de referencia para experimentos de audio-text-to-text en entornos Apple Silicon, con coste cero de API.
- Prototipado en escritorio: al caber en 16 GB de memoria, sirve para validar ideas de análisis musical en un portátil antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica explícitamente que no se ha medido la precisión en los benchmarks que reporta el modelo base. El autor sí aporta mediciones propias de latencia y validez de salida sobre un M4 Max (64 GB), con un clip de 30 segundos, un prompt de sistema largo cacheado y un formulario JSON de unas 230 tokens, sobre cuatro clips repetidos ocho veces cada uno:

| Metrica | Valor |
|---|---|
| Tamano en disco | 7.4 GB |
| Pico de memoria (MLX) | 8.2 GB |
| Tiempo de carga | 4 s |
| Tiempo por pregunta | 9 s, a 28 tokens/s (maquina ocupada; hasta un tercio mas rapido en reposo) |
| Respuestas JSON validas tal cual | 32 de 32 |
| Formularios de mezcla completa con todos los campos | 16 de 16 |
| Preguntas que se quedaron repitiendo una letra y hubo que repetir | 3 de 32 |

Como referencia, la compilación de 8 bits obtiene 32/32 y 16/16 con 1 de 32 repeticiones, y el checkpoint Instruct a 5 bits baja a 17 de 32 respuestas válidas tal cual (31 tras reparar corchetes) y 14 de 16 formularios completos, con 4 de 32 repeticiones.

## Requisitos de hardware

- Inferencia sobre Apple Silicon exclusivamente, mediante MLX y mlx-audio 0.5.7 o superior.
- Diseno declarado para un Mac con 16 GB de memoria, con un pico medido de 8.2 GB y 7.4 GB en disco.
- La compilacion de 8 bits equivalente (mlx-community/MOSS-Music-8B-Thinking-8bit) ocupa 10.2 GB y alcanza un pico de 11.1 GB, por lo que requiere 24 GB o mas.
- GPU recomendada segun el autor: Apple Silicon; el modelo M4 Max (64 GB) es la referencia de las mediciones. No se documentan despliegues en GPU NVIDIA (A100, H100, RTX 4090) para esta conversion MLX.
- Opciones de despliegue: la libreria mlx-audio y la integracion `djkit ears fetch` de Trainspotting Suite. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversion concreta.
- Latencia medida: 4 s de carga y 9 s por pregunta a 28 tokens/s en M4 Max ocupado; con el modo de razonamiento desactivado la respuesta es 2-3 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano en disco | Pico de memoria | Contexto | Licencia |
|---|---|---|---|---|---|---|
| FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit | 9,1 mil M | 5 bits (group 64) | 7.4 GB | 8.2 GB | No disponible | Apache-2.0 |
| mlx-community/MOSS-Music-8B-Thinking-8bit | 9,1 mil M | 8 bits | 10.2 GB | 11.1 GB | No disponible | Apache-2.0 |
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit | 9,1 mil M | 5 bits | No disponible | No disponible | No disponible | Apache-2.0 |
| FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit | 9,1 mil M | 8 bits | No disponible | No disponible | No disponible | Apache-2.0 |
| OpenMOSS-Team/MOSS-Music-8B-Thinking (base) | 9,1 mil M | bf16 | No disponible | No disponible | No disponible | Apache-2.0 |

No se dispone de datos que comparen este modelo con alternativas de otras familias (por ejemplo, modelos de comprensión musical no basados en MLX). Fuera del ecosistema MOSS-Music no se identifican modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de comprensión musical: no genera música. Para text-to-music habría que recurrir a otras soluciones.
- Riesgo de bucles: en 3 de 32 preguntas el modelo se quedó repitiendo una letra. El autor recomienda cortar la respuesta y volver a preguntar cuando ocurra.
- Con el modo Thinking desactivado, el modelo puede inventar voces inexistentes si se le da un stem instrumental y se le pregunta por voces. Conviene preguntar a un stem aislado solo por lo que contiene.
- A temperatura 0 el modelo se repite en respuestas largas. Se recomienda muestreo con temperature 0.7, top-p 0.8 y top-k 20.
- La cuantización a 4 bits degradó notablemente el checkpoint Instruct (nombres de campo erróneos o inventados en una cuarta parte de las respuestas), motivo por el que el autor no publicó una versión de 4 bits.
- Idiomas limitados a inglés y chino, con tendencia al inglés en la transcripción de letras; el texto en alfabetos no latinos puede degradarse.
- No se ha medido la precisión en benchmarks del modelo base, por lo que no hay garantía de rendimiento en tareas fuera del escenario evaluado (clips de 30 segundos y formularios JSON).
- No hay datos sobre el uso en hardware que no sea Apple Silicon; la conversión MLX no es portable directamente a GPU NVIDIA.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; el autor solo aplica conversión de formato y cuantización, sin cambios adicionales.
- Modelo comunitario con 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación amplia por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Thinking-mlx-5bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Thinking
- Repositorio del proyecto: https://github.com/OpenMOSS/MOSS-Music
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
- Libreria MLX: https://github.com/ml-explore/mlx
- Compilacion de 8 bits: https://huggingface.co/mlx-community/MOSS-Music-8B-Thinking-8bit
- Variante Instruct a 8 bits: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-8bit
- Variante Instruct a 5 bits: https://huggingface.co/FractalSurfer/MOSS-Music-8B-Instruct-mlx-5bit
- Space de demostracion: https://huggingface.co/spaces/hugging-apps/moss-music-8b-thinking
- Aplicacion Trainspotting Suite: https://github.com/remy-st/trainspotting-suite
- Ficha en The AI Bench: https://theaibench.ai/models/moss-music-8b/
