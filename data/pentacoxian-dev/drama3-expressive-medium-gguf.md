# pentacoxian-dev/drama3-expressive-medium-GGUF

## Resumen

`drama3-expressive-medium` es un modelo de texto a voz (TTS) expresivo desarrollado por `pentacoxian-dev` como un ajuste fino (finetune) cuantizado de Fish Audio Drama 3 (`fishaudio/drama-3`). Su objetivo es resolver una limitación concreta del modelo base: Drama 3 respeta las indicaciones de interpretación (acting directions) al inicio de una línea, pero suele ignorar las que aparecen a mitad de frase, o llega a quedarse en silencio al encontrarlas. Este derivado fue afinado para cambiar la entonación y la emoción exactamente donde la indicación lo marca, además de completar la línea completa y terminar de forma limpia con mayor fiabilidad.

El modelo conserva los 256 expertos del original (arquitectura MoE) y está distribuido en formato GGUF con cuantización IQ4_XS, con un tamaño de archivo de 20,97 GiB y un pico de consumo de 21,9 GiB de VRAM, lo que lo hace ejecutable en una RTX 4090 de 24 GB. Soporta japonés e inglés, clonación de voz zero-shot con entre 10 y 30 segundos de audio de referencia (o voces sintéticas generadas por semilla sin referencia), e indicaciones de interpretación en línea tanto al inicio como a mitad de frase. Es relevante porque acerca la generación de diálogo dramático expresivo de calidad a hardware de consumo, con una velocidad aproximada de 2,6 veces tiempo real en una RTX 4090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), 256 expertos, modelo TTS autoregresivo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (GGUF) |
| Idiomas soportados | Japones (ja), ingles (en); las indicaciones de interpretacion se escriben en ingles para ambos idiomas |
| Licencia | fish-audio-community-license-v1.0 (otra/other) |
| Formato de pesos | GGUF (archivo `drama3-expressive-medium-IQ4_XS.gguf`, 20,97 GiB); tamano total del repositorio 22,5 GB |

## Arquitectura y entrenamiento

El modelo deriva de Fish Audio Drama 3, un modelo TTS con arquitectura de mezcla de expertos (MoE) que mantiene los 256 expertos en esta variante cuantizada. Al tratarse de un finetune, el entrenamiento se centro en un comportamiento especifico: obedecer indicaciones de interpretacion insertadas entre corchetes (por ejemplo, `[calm]`, `[voice breaking]`, `[whispering, scared]`) no solo al principio de una linea, sino tambien a mitad de frase, cambiando la entrega vocal en el punto exacto marcado. El ajuste fino tambien mejoro la tasa de finalizacion limpia de las lineas, un problema tipico en modelos TTS autoregresivos que se detienen antes de tiempo o se prolongan en exceso.

No se ha publicado informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni el uso de tecnicas como RLHF o DPO. La distribucion en GGUF permite ejecutarlo con el runtime audio.cpp (rama `main`, commit `71f42b84` o posterior, con soporte CUDA), con un parche opcional (`drama3-expressive-medium-audiocpp-optional.patch`) que anade una correccion de pausas y decodificacion offline de baja VRAM. Tambien existe un runtime independiente en PyTorch dentro del directorio `torch/` del repositorio, que consume 23,1 GiB en una RTX 4090.

## Capacidades

- Texto a voz expresivo con indicaciones de interpretacion en linea: emociones como alegria, furia, llanto, susurro, aburrimiento o sorpresa, tanto al inicio como a mitad de linea.
- Cambio de emocion a mitad de frase: por ejemplo, pasar de susurro asustado a grito furioso, o de risa a llanto, dentro de la misma linea.
- Clonacion de voz zero-shot con 10-30 segundos de audio de referencia.
- Generacion de voces sinteticas por semilla sin audio de referencia (tarea `--task tts` sin `voice_ref`), con voces que, segun verificacion por similitud de hablante (WavLM-SV), no se acercan a ningun hablante del conjunto de ajuste fino mas que el 95% de los hablantes entre si.
- Soporte de japones e ingles, con indicaciones escritas en ingles en ambos casos.
- Generacion en streaming u offline (con el parche opcional de baja VRAM).
- Ejecucion en hardware de consumo de gama alta (24 GB de VRAM).

## Casos de uso

- Doblaje y produccion de audiodramas: el cambio de emocion a mitad de linea permite grabar dialogos dramaticos realistas (susurro a grito, risa a llanto) sin dividir la frase en multiples tomas ni editar el audio manualmente.
- Generacion de voces para videojuegos: los personajes pueden expresar estados emocionales dinamicos en tiempo de produccion, con voces sinteticas por semilla que evitan depender de actores de referencia para prototipos.
- Prototipado rapido de asistentes de voz con emocion: la clonacion zero-shot con 10-30 segundos de referencia permite probar distintas voces y personalidades sin sesiones de grabacion.
- Narracion de novelas visuales y contenido interactivo: las indicaciones en linea permiten guiar la interpretacion directamente desde el guion, manteniendo el texto como unica fuente de verdad.
- Localizacion de contenido entre japones e ingles: el soporte bilingue con indicaciones en ingles unifica el formato de guion para ambos idiomas.
- Creacion de contenido para plataformas de audio y podcasts ficticios: la generacion por semilla produce voces originales con garantias de no similitud excesiva con los hablantes de entrenamiento, util para evitar problemas de identidad vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la informacion disponible; al ser un modelo TTS, no aplican los benchmarks tipicos de LLM. Los datos de rendimiento publicados son:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | ~2,6x tiempo real en RTX 4090 (incluyendo codificacion de 29 s de referencia) |
| VRAM pico (audio.cpp) | 21,9 GiB en RTX 4090 (referencia de 30 s, salida long-form de 32 s) |
| VRAM (runtime PyTorch) | 23,1 GiB en RTX 4090 |
| Similitud con hablantes de entrenamiento | Ninguna muestra de voz sintetica mas cercana a un hablante de ajuste fino que el 95% de los hablantes entre si (WavLM-SV) |

## Requisitos de hardware

- VRAM estimada para inferencia: 21,9 GiB de pico con audio.cpp (GGUF IQ4_XS); 23,1 GiB con el runtime PyTorch incluido en el repositorio.
- GPU de referencia verificada: NVIDIA RTX 4090 (24 GB). Requiere soporte CUDA.
- Consumer GPU: cabe en una RTX 4090 de 24 GB; en tarjetas de 16 GB o menos no hay datos que indiquen que sea viable con esta cuantizacion, aunque el parche opcional de baja VRAM para decodificacion offline podria reducir el pico (sin cifras publicadas).
- Runtimes soportados: audio.cpp (rama `main`, commit `71f42b84` o posterior, CUDA), con parche opcional para correccion de pausas y baja VRAM; runtime independiente en PyTorch incluido en `torch/`.
- Configuracion de muestreo recomendada segun la model card: temperature 0,7, top-p 0,7, top-k 30, correccion de pausas activada con el archivo `silence_codes.json` del repositorio.
- Latencia y throughput: ~2,6x tiempo real en RTX 4090, incluyendo la codificacion de 29 segundos de referencia; no hay cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion/VRAM | Idiomas | Clonacion zero-shot | Licencia |
|---|---|---|---|---|---|
| drama3-expressive-medium (este) | TTS expresivo MoE (finetune de Drama 3) | GGUF IQ4_XS, ~21,9 GiB | ja, en | Si (10-30 s) o voz por semilla | fish-audio-community-license-v1.0 |
| fishaudio/drama-3 (base) | TTS expresivo MoE | no disponible | ja, en | no disponible | fish-audio-community-license-v1.0 |
| Alternativas comparables (XTTS-v2, Kokoro, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos cuantitativos publicados entre este modelo y otras alternativas TTS en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a japones e ingles; no hay soporte para castellano ni otros idiomas segun la informacion disponible.
- Las indicaciones de interpretacion deben escribirse en ingles incluso para lineas en japones.
- Requisito de VRAM elevado: ~22-23 GiB, lo que excluye la mayoria de GPU de consumo salvo gama alta de 24 GB.
- El runtime PyTorch incluido consume mas VRAM (23,1 GiB) que audio.cpp con el parche opcional.
- Licencia `fish-audio-community-license-v1.0` de tipo "other": es necesario revisar el texto de la licencia antes de cualquier uso comercial, ya que las licencias comunitarias suelen incluir restricciones (limites de ingresos, atribucion o usos prohibidos).
- Al ser un modelo de clonacion de voz, su uso plantea riesgos de suplantacion de identidad y deepfake audio; el autor declara medidas de mitigacion para las voces por semilla (verificacion WavLM-SV), pero la clonacion con audio de referencia depende de la responsabilidad del usuario.
- El modelo base (Fish Audio Drama 3) no patrocina ni respalda este derivado, segun indica el propio autor.
- No hay datos publicados sobre sesgos, tasas de alucinacion (en TTS: errores de pronunciacion, repeticiones o cortes) ni estabilidad en generaciones largas mas alla de la mejora declarada en la finalizacion limpia de lineas.
- Es un proyecto comunitario con 3813 descargas y sin historial de auditoria; se recomienda validar la calidad de salida en el caso de uso concreto antes de produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pentacoxian-dev/drama3-expressive-medium-GGUF
- Modelo base (Fish Audio Drama 3): https://huggingface.co/fishaudio/drama-3
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Licencia: disponible en el archivo LICENSE del repositorio (fish-audio-community-license-v1.0)
