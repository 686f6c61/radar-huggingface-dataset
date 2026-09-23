# ldov/Qwen3-TTS-GGUF

## Resumen

Qwen3-TTS-GGUF es un repositorio de pesos en formato GGUF publicados por el usuario ldov para **qwentts.cpp**, un port a C++17/GGML de la familia Qwen3-TTS 12 Hz desarrollada por el equipo Qwen de Alibaba. No se trata de un modelo entrenado desde cero, sino de una distribucion cuantizada y reempaquetada de los checkpoints oficiales (Qwen3-TTS-12Hz-0.6B-Base, 0.6B-CustomVoice, 1.7B-Base, 1.7B-CustomVoice, 1.7B-VoiceDesign y el tokenizador Qwen3-TTS-Tokenizer-12Hz), pensada para ejecucion local en CPU y GPU sin depender de PyTorch.

El objetivo es habilitar sintesis de voz multilingue de alta fidelidad en hardware de consumo. Cada modelo se desdobla en dos ficheros GGUF que se cargan conjuntamente: un *talker* (backbone Qwen3 con cabeza MTP de prediccion de codigos y, opcionalmente, encoder de hablante) que convierte texto en codigos a 12 Hz, y un *tokenizer* (SEANet + ConvNeXt + DAC v2 + RVQ) que convierte esos codigos en audio mono a 24 kHz. Estan disponibles los modos *base* (voz zero-shot con hablantes con nombre y dialectos del mandarin), *customvoice* (clonacion de voz a partir de un clip de referencia) y *voicedesign* (sintesis a partir de una descripcion de atributos, solo en 1.7B).

Su relevancia actual radica en dos factores: cubre once idiomas (incluido el espanol) con licencia Apache 2.0, y su implementacion en GGML esta optimizada para latencia. Segun la model card, a fecha de 9 de septiembre de 2026 el modelo ocupa el primer puesto en TTFA (time-to-first-audio) en el benchmark de streaming del Open TTS Leaderboard de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida en dos componentes: talker con backbone Qwen3 (transformer) + cabeza MTP de prediccion de codigos + encoder de hablante opcional; tokenizador de audio con SEANet + ConvNeXt + DAC v2 + RVQ |
| Parametros totales | 914.643.008 (dato reportado en los metadatos de safetensors del repositorio); los talkers upstream son de 0,6B y 1,7B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0 (recomendado por defecto), Q4_K_M (minimo consumo de VRAM); tokenizador con politica mixta: codebooks RVQ, proyecciones y capas 1D en F32, kernels de convolucion con filas no alineables (K=7,3,1) en F16 dentro de las variantes Q* |
| Idiomas soportados | zh, en, fr, de, es, it, pt, ja, ko, ru, ar |
| Licencia | Apache 2.0 (modelo upstream y codec); qwentts.cpp bajo licencia MIT |
| Formato de pesos | GGUF (ficheros `qwen-talker-{size}-{mode}-{variant}.gguf` y `qwen-tokenizer-12hz-{variant}.gguf`) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos redes que se ejecutan de forma encadenada. El *talker* contiene el backbone del modelo de lenguaje Qwen3, cuya dimension oculta es divisible por 256, lo que permite aplicar la cuantizacion K-quant estandar de llama.cpp en todas las variantes. Sobre ese backbone se anade una cabeza MTP (*multi-token prediction*) que predice los codigos acusticos a 12 Hz y, segun el modo, un encoder de hablante que aporta el vector de timbre (*spk_emb*). El *tokenizer* implementa el decodificador de audio: SEANet, ConvNeXt, DAC v2 y cuantizacion vectorial residual (RVQ), y es compartido por todos los talkers independientemente del tamano.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF o DPO en la informacion proporcionada; esos detalles corresponden a la documentacion upstream de Qwen3-TTS, no incluida en esta ficha. La innovacion tecnica destacable de este repositorio es la politica de cuantizacion del tokenizador: los kernels de convolucion con filas de tamano K=7, 3 y 1 nunca son divisibles por el bloque de una K-quant, por lo que el cuantizador omite los tipos intermedios Q* y cae directamente a F16 (rama de ultimo recurso de `tensor_type_fallback` de llama.cpp aplicada de forma incondicional). Los codebooks RVQ, las proyecciones de entrada/salida, la capa `fc` del encoder de hablante y todos los tensores 1D (gammas, biases, normas, parametros alpha y beta de Snake) se mantienen en F32 en todas las variantes.

## Capacidades

- Sintesis de voz multilingue zero-shot en once idiomas: zh, en, fr, de, es, it, pt, ja, ko, ru, ar.
- Modo *base*: TTS zero-shot con hablantes con nombre y dialectos del mandarin.
- Modo *customvoice*: clonacion de voz zero-shot a partir de un clip de referencia (se extrae el vector de timbre y los codigos del audio de referencia y se inyectan en la memoria del modelo).
- Modo *voicedesign*: sintesis de voz a partir de una descripcion de atributos (solo disponible en el talker de 1.7B).
- Generacion de audio en streaming, con salida mono a 24 kHz y representacion intermedia a 12 Hz.
- Ejecucion multiplataforma: CPU (variante x86 autoseleccionada), CUDA (NVIDIA), Vulkan (AMD/Intel/NVIDIA) y Metal (Apple Silicon), seleccionables mediante la variable `GGML_BACKEND`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento en la informacion disponible.

## Casos de uso

- Lectura por voz de documentos largos en local: el modelo convierte texto a audio sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad o cumplimiento normativo (sanidad, legal, administracion publica).
- Clonacion de voz para audiolibros y contenido editorial: con el modo *customvoice* de 1.7B se puede partir de un clip de referencia del narrador y generar horas de narracion manteniendo el timbre, evitando sesiones de grabacion adicionales.
- Asistentes de voz embebidos en aplicaciones de escritorio: al ser GGUF y ejecutarse sobre Metal o Vulkan, puede integrarse en apps nativas (el caso citado en las busquedas es la app FoxGPT) sin dependencias de Python ni de CUDA.
- Generacion de voces sinteticas por descripcion de atributos: el modo *voicedesign* de 1.7B permite crear voces nuevas a partir de una descripcion textual, util para prototipado de personajes en videojuegos o doblaje preliminar.
- Accesibilidad: conversion de texto a voz para lectores de pantalla y sistemas de asistencia a personas con discapacidad visual, con soporte del espanol y otros diez idiomas.
- Sistemas de respuesta de voz interactiva (IVR) y atencion telefonica automatizada: la primera posicion en TTFA del Open TTS Leaderboard indica que el arranque de la sintesis en modo streaming es muy rapido, lo que reduce la latencia percibida en conversaciones en tiempo real.
- Doblaje y localizacion de contenido: al cubrir once idiomas con el mismo codec de 24 kHz, se puede reutilizar la misma infraestructura de inferencia para generar pistas de audio en distintos mercados.
- Generacion de datasets de audio sintetico para entrenar o evaluar sistemas ASR, con voces y atributos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de sintesis de voz y no de un modelo de lenguaje generalista. El unico dato de evaluacion disponible es la clasificacion en el Open TTS Leaderboard:

| Benchmark | Resultado | Fecha | Nota |
|---|---|---|---|
| Open TTS Leaderboard, posicion en TTFA (streaming) | 1.er puesto | 9 de septiembre de 2026 | Benchmark de streaming en peticion unica, modo streaming; es el modelo mas rapido en empezar a producir audio segun la model card |
| Resto de metricas del leaderboard | No disponible | - | No se aportan cifras concretas de calidad, MOS ni WER |

## Requisitos de hardware

- VRAM estimada para inferencia (suma de talker + tokenizer, segun tamanos de fichero declarados):
  - Talker 0.6B + tokenizer, Q4_K_M: aproximadamente 0,9 GB (629 MB + 255 MB).
  - Talker 0.6B + tokenizer, Q8_0: aproximadamente 1,3 GB (993 MB + 291 MB).
  - Talker 1.7B + tokenizer, Q4_K_M: aproximadamente 1,5 GB (1,2 GB + 255 MB).
  - Talker 1.7B + tokenizer, Q8_0: aproximadamente 2,4 GB (2,1 GB + 291 MB).
  - Talker 1.7B + tokenizer, BF16: aproximadamente 4,3 GB (3,9 GB + 359 MB).
  - Talker 1.7B + tokenizer, F32: aproximadamente 8,4 GB (7,7 GB + 647 MB), orientado a referencia, depuracion y conversion.
- GPU recomendadas: NVIDIA con CUDA (la model card senala Ada y Blackwell como la ruta mas rapida), cualquier GPU AMD/Intel/NVIDIA compatible con Vulkan, y GPU de Apple Silicon via Metal.
- Cabe en GPU de consumo: si. Con cuantizacion Q8_0 o Q4_K_M, el par talker 1.7B + tokenizer ocupa entre 1,5 GB y 2,4 GB, por lo que entra holgadamente en tarjetas con 4-8 GB de VRAM. El talker de 0.6B en Q4_K_M ronda los 0,9 GB.
- Tambien puede ejecutarse integramente en CPU como respaldo, con la variante x86 seleccionada automaticamente.
- Opciones de despliegue: qwentts.cpp (compilado con `buildcuda.sh` u otros backends) como runtime principal; el repositorio incluye ejemplos `base.sh`, `clone.sh`, `customvoice.sh` y `tts.sh`. Hay al menos otras dos distribuciones GGUF alternativas (ybalakhonov, HaujetZhao) orientadas a otros runners. No se documenta compatibilidad con vLLM, TGI, Ollama o llama.cpp en la informacion disponible.
- Latencia y throughput: no se publican cifras de latencia ni de throughput mas alla de la primera posicion en TTFA del Open TTS Leaderboard. El tamano del repositorio completo (60,1 GB) incluye todas las variantes y tamanos, no el conjunto necesario para una sola inferencia.
- Almacenamiento: conviene descargar solo los ficheros de la variante y el modo deseados, no el repositorio completo.

## Comparativa con modelos similares

| Modelo / distribucion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ldov/Qwen3-TTS-GGUF (esta ficha) | 914.643.008 reportados en metadatos; talkers 0.6B y 1.7B | No disponible | 1.er puesto en TTFA del Open TTS Leaderboard (9 sep 2026) | Apache 2.0 | Pesos GGUF en Hugging Face; runtime qwentts.cpp (MIT) |
| ybalakhonov/qwen3-tts-gguf | No disponible | No disponible | No disponible | No disponible | Pesos GGUF para qwen3-tts.cpp, usados por la app FoxGPT |
| HaujetZhao/Qwen3-TTS-GGUF | No disponible | No disponible | No disponible | No disponible | Repositorio GitHub con una solucion de inferencia propia para Qwen3-TTS |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base (upstream) | 1,7B | No disponible | No disponible | Apache 2.0 | Pesos originales en Hugging Face |

Las tres distribuciones GGUF comparadas derivan del mismo modelo upstream (Qwen3-TTS del equipo Qwen), por lo que la diferencia principal esta en el runtime, la politica de cuantizacion y las variantes ofrecidas, no en la calidad del modelo base. No se dispone de datos de calidad comparativos entre ellas.

## Limitaciones y advertencias

- Al ser una cuantizacion del modelo upstream, hereda sus sesgos: la calidad y el timbre pueden variar entre idiomas, y el mandarin (incluidos sus dialectos) esta mucho mejor representado que idiomas como el arabe o el coreano dentro de la familia Qwen3-TTS.
- No se documentan tasas de error de palabra (WER) ni evaluaciones de naturalidad (MOS) para esta distribucion; el unico dato publico es la latencia de arranque, que no mide calidad.
- Las variantes Q4_K_M y Q8_0 introducen perdida de precision respecto a BF16 y F32. La model card no cuantifica el impacto en calidad, aunque mantiene en F32 los tensores criticos del tokenizador para limitarlo.
- El modo *voicedesign* solo existe en el talker de 1.7B; con 0.6B no esta disponible.
- La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero la model card no incluye clausulas adicionales sobre el uso de voces clonadas. La clonacion de voz de personas reales plantea riesgos legales y eticos (suplantacion, consentimiento, normativa sobre deepfakes) que recaen sobre quien despliega el modelo.
- El repositorio tiene 60,1 GB y contiene todas las variantes; descargarlo completo es innecesario y costoso.
- Los metadatos indican 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad, soporte ni mantenimiento continuado.
- Existe una discrepancia entre el ID del repositorio (ldov/Qwen3-TTS-GGUF) y el comando de descarga de la model card, que apunta a Serveurperso/Qwen3-TTS-GGUF; conviene verificar el repositorio correcto antes de automatizar descargas.
- Las fechas de creacion y actualizacion del repositorio y la fecha del leaderboard (septiembre de 2026) son posteriores a la fecha de redaccion habitual de este tipo de fichas; se reproducen tal cual aparecen en la informacion proporcionada.
- No se documenta soporte de tool calling, agentes ni entrada de audio, por lo que no debe asumirse su uso en pipelines de ese tipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ldov/Qwen3-TTS-GGUF
- Runtime qwentts.cpp (MIT): https://github.com/ServeurpersoCom/qwentts.cpp
- Repositorio oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Distribucion alternativa de HaujetZhao: https://github.com/HaujetZhao/Qwen3-TTS-GGUF
- Distribucion alternativa de ybalakhonov: https://huggingface.co/ybalakhonov/qwen3-tts-gguf
- Tutorial de AI Indigo (alta fidelidad en local): https://aiindigo.com/tutorials/getting-started-with-qwen3-tts-gguf-local-high-fidelity-voice-synthesis
- Tutorial de AI Indigo (despliegue privado y de baja latencia): https://aiindigo.com/tutorials/getting-started-with-qwen3-tts-gguf-local-voice-synthesis-on-consumer-hardware
- Open TTS Leaderboard de Hugging Face: https://huggingface.co/spaces/hf-audio/open_tts_leaderboard
- Modelos base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base, https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice, https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base, https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice, https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
