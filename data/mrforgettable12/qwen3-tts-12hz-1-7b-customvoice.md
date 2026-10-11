# MrForgettable12/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de sintesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollada por el equipo Qwen de Alibaba Cloud. La ficha que nos ocupa corresponde a un reupload de terceros (usuario MrForgettable12) de los pesos oficiales publicados como Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice. Se trata de la variante "CustomVoice", orientada a control de estilo sobre timbres predefinidos: incorpora 9 voces premium que cubren combinaciones de genero, edad, idioma y dialecto, y permite controlar tono, velocidad y emocion mediante instrucciones en lenguaje natural.

El modelo tiene 1.916.676.352 parametros (~1,92 B) en pesos safetensors, con un repositorio de 4,5 GB, y se distribuye bajo licencia Apache 2.0. Su rasgo tecnico diferencial es la arquitectura de LM discreta multi-codebook apoyada en el tokenizer propio Qwen3-TTS-Tokenizer-12Hz (12 Hz de tasa de tokens de audio), que evita el esquema clasico LM+DiT y sus cuellos de botella de informacion. Incorpora generacion en streaming mediante una arquitectura hibrida "dual-track", con latencia de sintesis end-to-end declarada de hasta 97 ms.

Es relevante porque cubre 10 idiomas principales (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano) y perfiles dialectales, con pesos abiertos y licencia permisiva, lo que lo hace apto para despliegue autoalojado en escenarios interactivos en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreta multi-codebook con tokenizer de audio dedicado (Qwen3-TTS-Tokenizer-12Hz); decodificador no-DiT ligero; generacion hibrida dual-track en streaming |
| Parametros totales | 1.916.676.352 (~1,92 B) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible (no se especifica limite de texto de entrada) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano, mas perfiles de voz dialectales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamano del repositorio | 4,5 GB |
| Tasa de tokens de audio | 12 Hz |
| Timbres incluidos | 9 voces premium (combinaciones de genero, edad, idioma y dialecto) |
| Streaming | Si (streaming y no streaming con el mismo modelo) |
| Latencia declarada | Hasta 97 ms end-to-end en streaming |

## Arquitectura y entrenamiento

La informacion disponible describe una arquitectura de modelo de lenguaje discreto multi-codebook que modela la senal de voz de extremo a extremo, prescindiendo del esquema habitual de LM mas decodificador DiT. El componente acustico es el Qwen3-TTS-Tokenizer-12Hz, desarrollado por el mismo equipo, que realiza compresion acustica eficiente y modelado semantico de alta dimension de la senal de voz, preservando informacion paralinguistica y caracteristicas del entorno acustico. La reconstruccion se lleva a cabo mediante una arquitectura no-DiT ligera, lo que segun el autor permite reconstruccion de alta fidelidad a alta velocidad.

La generacion se apoya en una arquitectura hibrida "dual-track" que permite que un mismo modelo opere en modo streaming y no streaming; el autor afirma que puede emitir el primer paquete de audio inmediatamente despues de introducir un unico caracter, con latencia end-to-end de hasta 97 ms. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se describen innovaciones adicionales como decodificacion especulativa. El modelo se distribuye junto con el tokenizer correspondiente, descargable como Qwen/Qwen3-TTS-Tokenizer-12Hz.

## Capacidades

- Sintesis de voz a partir de texto en 10 idiomas principales (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano), ademas de perfiles de voz dialectales.
- Control de estilo mediante instrucciones en lenguaje natural: permite ajustar timbre, emocion y prosodia.
- Seleccion entre 9 timbres premium que cubren combinaciones de genero, edad, idioma y dialecto.
- Control adaptativo de tono, ritmo de habla y expresion emocional en funcion de las instrucciones y de la semantica del texto de entrada.
- Generacion en streaming y no streaming con un unico modelo, con salida del primer paquete de audio tras introducir un solo caracter.
- Robustez mejorada frente a texto de entrada con ruido.
- Comprension contextual del texto para adaptar la interpretacion vocal ("lo que imaginas es lo que oyes", segun el autor).
- Capacidad de clonacion de voz: no en esta variante; la informacion disponible atribuye la clonacion rapida a partir de 3 segundos de audio a las variantes Base (Qwen3-TTS-12Hz-1.7B-Base y 0.6B-Base), no a CustomVoice.
- Tool calling, function calling y razonamiento multi-paso: no aplica; es un modelo de sintesis de voz, no un LLM de proposito general. No disponible en la informacion proporcionada.
- Vision o audio de entrada: no disponible.

## Casos de uso

- Atencion al cliente automatizada con voz: el modelo puede gestionar respuestas habladas en tiempo real aprovechando la generacion en streaming y su latencia declarada de hasta 97 ms, lo que reduce el silencio perceptible entre turnos en un sistema IVR o un asistente telefonico.
- Lectura de contenidos y accesibilidad: conversion de articulos, documentacion o interfaces a voz en espanol con control de ritmo y prosodia, util para lectores de pantalla y publicaciones accesibles.
- Audiolibros y narracion: la seleccion entre 9 timbres premium y el control de emocion permiten asignar voces distintas a personajes o secciones y ajustar la interpretacion segun la semantica del texto.
- Locucion para video y publicidad: generacion de voces en off en varios idiomas desde un mismo modelo, con instrucciones para fijar tono y velocidad, evitando la regrabacion manual por cada variante de idioma.
- Asistentes de voz embebidos: al tratarse de un modelo de ~1,92 B de parametros, puede desplegarse en infraestructura propia con GPU de gama consumer, lo que facilita asistentes on-premise con control de datos.
- Doblaje y localizacion multilingue: cobertura de 10 idiomas y perfiles dialectales para producir pistas de voz en distintos mercados a partir del mismo guion de texto.
- Sistemas de interaccion en tiempo real (kioscos, robots, agentes conversacionales): el modo streaming permite empezar a emitir audio antes de completar la frase, mejorando la sensacion de respuesta inmediata.
- Prototipado rapido de productos de voz: la licencia Apache 2.0 y la disponibilidad de pesos en safetensors permiten integrar el modelo en pipelines propios de investigacion y desarrollo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos de rendimiento presentes en el material proporcionado son la latencia declarada de hasta 97 ms end-to-end en streaming y la tasa de tokens de audio de 12 Hz. No se aportan cifras de WER, MOS, similitud de hablante ni comparaciones numericas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del tamano de parametros (~1,92 B), la carga en precision completa (fp32) requeriria en torno a 7,7 GB, en fp16/bf16 alrededor de 3,8-4 GB, y en cuantizacion de 8 bits en torno a 2 GB. Estas cifras son estimaciones y no incluyen el tokenizer de audio ni los buffers de activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es desplegable en GPUs de gama consumer con suficiente VRAM, como RTX 3060 12 GB, RTX 4070/4080 o RTX 4090; para despliegue en servidor, A100 o H100 permitirian mayor concurrencia y margen de memoria.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de ~1,92 B de parametros, siempre que se disponga de VRAM suficiente para los pesos y los buffers de audio. No hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: el model card menciona el paquete qwen-tts y vLLM, con descarga automatica de pesos por nombre de modelo. Tambien se documenta la descarga manual via ModelScope o huggingface-cli. No se menciona soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: latencia declarada de hasta 97 ms end-to-end en streaming. No se proporcionan datos de throughput, RTF ni concurrencia maxima. La generacion en streaming permite reducir el tiempo hasta el primer audio, pero no se detalla el rendimiento agregado en servidor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparacion se limita a las variantes de la propia familia Qwen3-TTS, cuyas caracteristicas si estan documentadas:

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1,92 B (segun safetensors del reupload) | 10 idiomas | Si | Si | No | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | No disponible | 10 idiomas | Si | Si (diseno de voz por descripcion) | No | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | No disponible | 10 idiomas | Si | No | Si (clonacion desde 3 s de audio) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~0,6 B (segun denominacion) | 10 idiomas | Si | No | No | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | ~0,6 B (segun denominacion) | 10 idiomas | Si | No | Si (clonacion desde 3 s de audio) | Apache 2.0 |

No se dispone de comparativas con alternativas de otros desarrolladores (por ejemplo, sistemas TTS propietarios o de otros laboratorios) en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un reupload de terceros (MrForgettable12) de los pesos oficiales de Qwen. Para uso en produccion se recomienda verificar la integridad de los pesos y descargar desde el repositorio oficial Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice.
- No se han publicado resultados de benchmarks (MOS, WER, similitud de hablante) en la informacion disponible, por lo que la calidad objetiva de la sintesis no puede validarse con los datos aportados.
- La latencia de 97 ms es una cifra declarada por el autor del modelo; no se especifican las condiciones de hardware, longitud de texto ni configuracion bajo las que se mide.
- No se detalla la composicion del dataset de entrenamiento ni los procesos de filtrado, por lo que no puede evaluarse el riesgo de sesgos de genero, edad, acento o idioma en las voces generadas.
- Riesgo de alucinacion: aunque es un modelo TTS y no un generador de texto libre, existe riesgo de prosodia incorrecta, omisiones o lectura erronea ante entradas con ruido, abreviaturas, siglas o terminologia muy especifica. El autor afirma robustez mejorada ante texto ruidoso, sin aportar metricas.
- La clonacion de voz no esta disponible en esta variante; si se necesita, hay que recurrir a las variantes Base.
- Uso responsable: la sintesis de voz permite suplantacion de identidad. Aunque la licencia Apache 2.0 no impone restricciones adicionales de uso comercial, es responsabilidad del integrador aplicar medidas de consentimiento, etiquetado de audio sintetico y cumplimiento normativo (por ejemplo, requisitos de transparencia sobre contenido generado por IA).
- No se documentan limites de longitud del texto de entrada, ni el comportamiento del modelo con entradas muy largas o con mezcla de idiomas dentro de una misma frase.
- La lista de idiomas de la model card incluye el espanol, pero la metadata de HuggingFace del repositorio indica "idiomas: no disponibles"; conviene validar el rendimiento real en espanol antes de desplegarlo.
- No se menciona soporte de cuantizacion (GGUF, AWQ, GPTQ) ni integracion con llama.cpp u Ollama, lo que limita las opciones de despliegue en hardware sin GPU.

## Enlaces

- Repositorio reupload en HuggingFace: https://huggingface.co/MrForgettable12/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial de la variante Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio GitHub del proyecto: https://github.com/QwenLM/Qwen3-TTS
- ModelScope: https://modelscope.ai/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Guia de autoalojamiento y despliegue: https://llmapi.ai/models/qwen-qwen3-tts-12hz-1-7b-customvoice/
- Referencia arXiv citada en los tags del repositorio: arxiv:2601.15621 (no se dispone del titulo ni de los autores en la informacion proporcionada)
