# mnmly/VibeVoice-Realtime-0.5B-mlx

## Resumen

VibeVoice-Realtime-0.5B-mlx es un reempaquetado del modelo de síntesis de voz (TTS) `microsoft/VibeVoice-Realtime-0.5B`, publicado por el usuario `mnmly`, cuyo único objetivo es que el checkpoint cargue en un solo paso desde la librería `mlx-audio-swift` sobre Apple Silicon. No se trata de un ajuste fino ni de una reimplementación: los pesos de `model.safetensors` son idénticos byte a byte al fichero upstream. Lo que añade el repositorio son dos piezas que el modelo original no distribuye de forma cargable: los prompts de voz (`voices/`, convertidos de pickles `.pt` a safetensors, con los tensores sin modificar) y los ficheros del tokenizador de Qwen2.5-0.5B, que el modelo necesita porque su `preprocessor_config.json` apunta a `Qwen/Qwen2.5-0.5B`.

El modelo resuelve un caso concreto: TTS en tiempo real con entrada de texto en streaming, pensado para generar audio por fragmentos mientras el texto se sigue escribiendo. Internamente no es un transformer único, sino un conjunto de ramas con estado precargado: una rama `lm` (4 capas), una rama `tts_lm` (20 capas), y dos ramas negativas (`neg_lm`, 4 capas; `neg_tts_lm`, 20 capas) que se conservan por fidelidad con el original pero que no se leen durante la generación. La dimensión oculta documentada es 896 y las cachés KV tienen forma `[1, 2, prompt_len, 64]` por capa.

Es relevante ahora por dos motivos prácticos. Primero, habilita TTS en streaming totalmente local en Macs con chip de Apple, sin depender de APIs en la nube ni de CUDA. Segundo, arregla un problema de empaquetado real: sin los prompts de voz y el tokenizador, el checkpoint upstream no es cargable directamente fuera del código de Microsoft. La licencia es MIT, heredada del original (© 2025 Microsoft), aunque Microsoft recomienda explícitamente su uso solo para investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo con ramas separadas de modelo de lenguaje (`lm`, `tts_lm`) y ramas negativas precargadas (`neg_lm`, `neg_tts_lm`); estado de voz como `last_hidden_state` + caché KV por rama; sin encoder acústico |
| Parametros totales | 1.017.626.722 (≈1,02 B) segun los safetensors del repo |
| Longitud de contexto | no disponible (procesa texto en streaming por fragmentos; no se publica `prompt_len` maximo) |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | la model card declara `en`; se incluyen prompts de voz para `de`, `fr`, `it`, `jp`, `kr`, `nl`, `pl`, `pt` y `sp` (10 idiomas en total, sin confirmacion oficial de calidad en los no ingleses) |
| Licencia | MIT (heredada del upstream, © 2025 Microsoft); los ficheros del tokenizador Qwen2.5-0.5B son Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, identico al upstream) + `voices/` en safetensors |
| Pipeline | text-to-speech (TTS en tiempo real, entrada de texto en streaming) |
| Libreria de carga | mlx-audio-swift |
| Modelo base | microsoft/VibeVoice-Realtime-0.5B |
| Voces incluidas | 25 prompts: `en-Carter_man`, `en-Davis_man`, `en-Emma_woman`, `en-Frank_man`, `en-Grace_woman`, `en-Mike_man`, `in-Samuel_man`, mas dos por cada uno de de, fr, it, jp, kr, nl, pl, pt y sp |
| Tamano del repositorio | 2,1 GB |
| Hardware objetivo | Apple Silicon via MLX (Metal); no se documenta soporte CUDA en este repo |

## Arquitectura y entrenamiento

La arquitectura no es un transformer convencional de una sola pila. El estado de una voz se representa como estado de conversacion precargado: por cada rama se almacena un `last_hidden_state` de forma `[1, prompt_len, 896]` y, por capa, una clave y un valor de forma `[1, 2, prompt_len, 64]`. Las ramas documentadas son `lm` (4 capas), `tts_lm` (20 capas), `neg_lm` (4 capas) y `neg_tts_lm` (20 capas). Es decir, el modelo mantiene dos ramas principales y dos negativas, lo que encaja con un esquema de guiado tipo classifier-free guidance aplicado sobre el propio estado latente: la rama negativa aporta la direccion de "no voz" durante la generacion.

Un detalle tecnico llamativo es la coherencia de las formas con la configuracion de Qwen2.5-0.5B: 4 + 20 = 24 capas, dimension oculta 896 y 2 cabezas KV de dimension 64 por capa. Eso sugiere que la pila de lenguaje del modelo reutiliza el backbone de Qwen2.5-0.5B repartido entre las ramas `lm` y `tts_lm`, aunque la model card del reempaquetado no lo confirma de forma explicita. El recuento real de parametros (1,02 B) frente al "0.5B" del nombre tambien apunta a que el fichero de pesos incluye mas de una rama con pesos propios.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta ninguna innovacion adicional de decodificacion mas alla del propio modo streaming. El reempaquetado no introduce cambios en los pesos ni reentrena nada: se limita a convertir los prompts de voz de `.pt` a safetensors (mismos valores, solo cambian el contenedor y los nombres de clave) y a incorporar el tokenizador de Qwen2.5-0.5B.

## Capacidades

- Generacion de voz en tiempo real con entrada de texto en streaming: acepta texto por fragmentos y emite audio incrementalmente mediante una API de eventos asincrona (`generateStream`).
- Sintesis mono-hablante con seleccion de voz por identificador: cualquier prompt incluido en `voices/` puede usarse como estado inicial de la generacion.
- Cobertura de 10 idiomas a traves de los prompts de voz incluidos (en, de, fr, it, jp, kr, nl, pl, pt, sp), pese a que la model card solo declara `en`.
- Integracion nativa en aplicaciones Swift sobre Apple Silicon mediante `mlx-audio-swift`; se puede cargar el modelo y encolar los fragmentos de audio en un reproductor en pocas lineas.
- No soporta clonacion de voz: el checkpoint no contiene encoder acustico, por lo que no existe un camino desde una grabacion hasta un hablante nuevo. Una "voz" es, por diseno, estado de conversacion precargado.
- No realiza reconocimiento de voz (ASR), traduccion, ni ninguna otra tarea distinta de TTS; el texto de entrada se asume ya en el idioma de la voz seleccionada.
- No se documenta soporte de tool calling, function calling, agentes, vision ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Lectores de articulos y RSS en Mac: el modelo acepta texto en streaming, por lo que se puede empezar a reproducir audio mientras el contenido se sigue recuperando o parseando, sin esperar a tener el documento completo.
- Asistentes de voz locales con privacidad estricta: al ejecutarse en MLX sobre Apple Silicon y no requerir servicios en la nube, es adecuado para entornos donde el texto no puede salir del dispositivo (sanidad, legal, banca interna).
- Accesibilidad en aplicaciones macOS e iOS: lectura en voz alta de interfaces, documentos y notificaciones para personas con discapacidad visual, con latencia baja gracias a la generacion por fragmentos.
- Salida hablada de agentes LLM locales: encadenar un LLM que genera tokens con el TTS en streaming permite que el usuario empiece a oir la respuesta antes de que el modelo termine de escribirla; util en asistentes conversacionales sobre el mismo Mac.
- Prototipado de contenido multilingue: las 25 voces cubren 10 idiomas, lo que permite generar versiones habladas de un mismo guion en distintos idiomas para validar un producto antes de contratar doblaje profesional.
- Generacion de datasets sinteticos de audio para ASR: producir corpus de voz controlados por voz e idioma, siempre divulgando que el audio es generado por IA segun pide Microsoft.
- Pruebas de UX de audio y demos de producto: integrar el modelo en una app Swift para medir como percibe el usuario la latencia y la naturalidad del streaming antes de invertir en infraestructura.
- Investigacion en TTS streaming: al ser reproducible en local con pesos sin modificar, sirve como linea base para estudiar el efecto del troceado de texto en la latencia y la prosodia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER, MOS, latencia ni comparaciones con otros sistemas TTS, y la busqueda web asociada no ha devuelto datos tecnicos relevantes. Tampoco se documentan cifras de throughput ni de tiempo hasta el primer fragmento de audio.

## Requisitos de hardware

- VRAM / memoria para pesos: con 1.017.626.722 parametros, los pesos ocupan aproximadamente 2,03 GB en bf16/fp16 (2 bytes por parametro). El repositorio completo ocupa 2,1 GB, incluyendo voces y tokenizador.
- Memoria total en uso: estimacion de 3 a 5 GB de memoria unificada contando pesos, los prompts de voz de las cuatro ramas y las caches KV activas. Cifra no publicada por el autor.
- Apple Silicon: cabe en Macs con 8 GB de memoria unificada (M1/M2/M3/M4) de forma ajustada; 16 GB o mas es lo recomendable para trabajar con holgura junto a otras aplicaciones.
- GPU: este repositorio esta pensado exclusivamente para MLX sobre Metal (Apple Silicon). No se documenta soporte para GPUs NVIDIA (A100, H100, RTX 4090) ni AMD. Para CUDA habria que usar el checkpoint upstream de Microsoft con su propio codigo, extremo no verificado en la informacion disponible.
- Despliegue: la unica via documentada es `mlx-audio-swift` mediante `TTS.loadModel(modelRepo:)` y `model.generateStream(text:voice:)`. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama, y en general esas herramientas no cubren este tipo de modelo TTS.
- Latencia y throughput: no disponible. El diseno es de streaming, con enqueue de fragmentos a medida que se generan, pero no se publican cifras de tiempo hasta el primer audio ni de factor de tiempo real.
- Cuantizacion: no disponible en el repositorio; no hay variantes de 4 u 8 bits publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mnmly/VibeVoice-Realtime-0.5B-mlx | 1.017.626.722 | no disponible | 10 idiomas via prompts de voz | MIT | HuggingFace, carga con mlx-audio-swift |
| microsoft/VibeVoice-Realtime-0.5B | mismo checkpoint (pesos identicos byte a byte) | no disponible | idem | MIT | HuggingFace y repositorio GitHub de Microsoft |
| Alternativas TTS open source de tamano comparable (familias tipo Kokoro, XTTS, Piper) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de rendimiento, contexto ni licencia de alternativas concretas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La diferencia objetiva del reempaquetado frente al upstream no esta en la calidad del modelo, sino en la cargabilidad: este repo incluye los prompts de voz y el tokenizador de Qwen2.5-0.5B que el original no distribuye en formato utilizable directamente.

## Limitaciones y advertencias

- Sin clonacion de voz por diseno: el checkpoint no incluye encoder acustico, asi que no hay forma de crear un hablante nuevo a partir de una grabacion. Solo estan disponibles las 25 voces empaquetadas.
- Uso recomendado unicamente para investigacion y desarrollo: Microsoft indica explicitamente que no recomienda su uso en aplicaciones comerciales o del mundo real sin pruebas adicionales, pese a que la licencia MIT lo permita legalmente.
- Obligacion de divulgacion: si se publica voz generada con este modelo, debe indicarse que es sintetica y generada por IA.
- Riesgo de uso malicioso: es un sistema TTS capaz de producir audio con voces que suenan humanas, lo que abre la puerta a suplantacion, fraude telefónico o desinformacion. No incorpora marca de agua ni mecanismo de deteccion documentado en la informacion disponible.
- Idiomas: la model card solo declara `en`; el resto de idiomas depende de prompts de voz sin evaluacion publicada, por lo que la calidad en de, fr, it, jp, kr, nl, pl, pt y sp no esta garantizada.
- Dependencia de plataforma: el repositorio esta atado a Apple Silicon y a `mlx-audio-swift`. No hay ruta documentada para Linux o Windows con GPU NVIDIA, lo que limita su uso en servidores.
- Discrepancia de nomenclatura: el nombre dice 0.5B pero los safetensors declaran 1.017.626.722 parametros; conviene dimensionar la memoria por el recuento real, no por el nombre.
- Repositorio de terceros con 0 descargas y 0 likes en el momento de la consulta: no es un artefacto oficial de Microsoft ni ha pasado por una validacion amplia de la comunidad.
- Artefacto de empaquetado: no aporta mejoras de calidad, sino solo facilidad de carga. Cualquier limitacion del modelo upstream se hereda sin cambios.
- Metadatos poco fiables: las fechas de creacion y actualizacion del repositorio (2026-09-20) no son coherentes con el ciclo de vida esperado de un modelo de 2025, lo que obliga a tratar los metadatos con cautela.
- La busqueda web realizada no devolvio documentacion tecnica relevante; los resultados obtenidos eran contenido no relacionado con el modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mnmly/VibeVoice-Realtime-0.5B-mlx
- Modelo base (upstream): https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Repositorio GitHub upstream de Microsoft, del que proceden los prompts de voz originales en `demo/voices/streaming_model/`: https://github.com/microsoft/VibeVoice
- Libreria de carga: https://github.com/Blaizzy/mlx-audio-swift
- Tokenizador y modelo del que se toman los ficheros de tokenizacion: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Nota: la busqueda web asociada no devolvio enlaces tecnicos relevantes sobre este modelo.
