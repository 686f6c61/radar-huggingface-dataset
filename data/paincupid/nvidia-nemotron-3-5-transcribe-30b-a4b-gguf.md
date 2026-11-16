# paincupid/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Transcribe 30B-A4B es un modelo de reconocimiento automático del habla (ASR) de pesos abiertos desarrollado por NVIDIA. Esta ficha concreta, publicada por el usuario paincupid y construida por el equipo de Atomic Chat, es una conversión a formato GGUF del modelo original `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, pensada para ejecutarse con el runtime propio de NVIDIA NeMo-Speech.cpp. El modelo resuelve transcripción de audio de hasta una hora de duración con marcas de tiempo a nivel de palabra, etiquetado de hablantes (diarización), traducción de voz e instrucciones personalizadas, en 40 idiomas.

La arquitectura es un transformer con mezcla de expertos (MoE): 32.913.266.240 parámetros totales según los pesos safetensors del modelo base, con la nomenclatura A4B indicando aproximadamente 4.000 millones de parámetros activos por token. El repositorio GGUF ocupa 158,2 GB e incluye siete decodificadores cuantizados (de 13,57 GB a 35,00 GB), un codificador de voz obligatorio en F16 (1,67 GB), un borrador DFlash2 para decodificación especulativa y la matriz de importancia usada en las cuantizaciones.

Su relevancia actual radica en que permite desplegar un modelo ASR de gran tamaño en hardware de consumo: el decodificador `AD-Q2_0_M` de 13,57 GB funciona en GPUs de 16 GB con una degradación mínima en inglés, alemán, francés y español, y el `AD-IQ4_NL` de 19,68 GB es la opción recomendada para GPUs de 24 GB, CPU, Metal y Vulkan. Esto elimina la necesidad de descargar el checkpoint original de 67 GB o de ejecutar conversiones en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), nomenclatura A4B (aprox. 4.000 millones de parametros activos); incluye codificador de voz, rama de hablante y cabeza CTC de marcas de tiempo |
| Parametros totales | 32.913.266.240 |
| Parametros activos | Aproximadamente 4.000 millones por token (segun nomenclatura A4B; cifra exacta no disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo admite grabaciones de hasta una hora de duracion |
| Tipos de cuantizacion | Q8_0, AD-Q5_0_XL, AD-IQ4_NL_L, AD-IQ4_NL, AD-NVFP4, AD-Q2_0_L, AD-Q2_0_M; codificador en F16; borrador DFlash2 en BF16; embeddings y cabeza de salida en Q8_0 |
| Idiomas soportados | 40 idiomas, entre ellos en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 32.913 millones de parámetros totales y aproximadamente 4.000 millones activos por token, según la convención de nombres A4B. La pila de inferencia se compone de varias piezas: un codificador de voz (empaquetado como archivo F16 independiente de 1,67 GB que incluye la rama de hablante y la cabeza CTC de marcas de tiempo), un decodificador MoE cuantizado y, opcionalmente, un borrador DFlash2 en BF16 de 1,15 GB para decodificación especulativa en la ruta CUDA con batching. El decodificador referencia por nombre al archivo del codificador, por lo que este debe conservar su nombre original.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del conversor sí documenta el proceso de cuantización: los expertos de las variantes IQ4_NL se cuantizan con una matriz de importancia (incluida en el repo como archivo de 0,06 GB), y los embeddings y la cabeza de salida se almacenan en Q8_0 en lugar de BF16, lo que reduce el tamaño frente a las conversiones por defecto de NVIDIA (19,68 GB frente a 21,79 GB en NVFP4; 19,68 GB frente a 20,35 GB en IQ4_NL). La variante NVFP4 usa formatos nativos de expertos para hardware Blackwell.

## Capacidades

- Transcripción de voz a texto en 40 idiomas, con grabaciones de hasta una hora de duración.
- Marcas de tiempo a nivel de palabra mediante cabeza CTC dedicada.
- Diarización de hablantes: etiquetado de quién habla en cada segmento mediante la rama de hablante del codificador.
- Traducción de voz (speech translation) entre idiomas.
- Instrucciones personalizadas para adaptar el estilo o el formato de la transcripción.
- Decodificación especulativa opcional con el borrador DFlash2 en la ruta CUDA con batching.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Ejecución local y offline mediante NeMo-Speech.cpp en CPU, Metal, Vulkan y CUDA.
- Soporte multilingüe amplio: inglés, alemán, francés, español, italiano, portugués, neerlandés, polaco, checo, eslovaco, hindi, japonés, coreano y chino, entre otros.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora con marcas de tiempo por palabra y etiquetas de hablante, lo que permite generar actas con atribución de intervenciones sin segmentar el audio previamente.
- Subtitulado automático: la salida con timestamps a nivel de palabra se alinea directamente con formatos de subtítulos (SRT, VTT), y la variante `AD-IQ4_NL` de 19,68 GB cabe en una GPU de 24 GB para procesar lotes en producción.
- Traducción de voz para medios: la capacidad de speech translation permite generar transcripciones traducidas de contenido audiovisual en los 40 idiomas soportados, útil para localización de pódcast y vídeo.
- Atención al cliente y análisis de llamadas: la diarización distingue agente y cliente, y las instrucciones personalizadas permiten forzar formatos de salida estructurados para su ingesta en CRM o sistemas de calidad.
- Investigación lingüística y corpus: la disponibilidad de siete cuantizaciones con degradación medida frente a BF16 permite reproducir experimentos en hardware modesto; el decodificador `AD-Q2_0_M` de 13,57 GB funciona en GPUs de 16 GB con error dentro del ruido en inglés, alemán, francés y español.
- Despliegue en el borde o en portátiles: las variantes Q2_0 y IQ4_NL con el codificador F16 (17,2 GB en el caso de `AD-Q2_0_L`) permiten transcripción local en Macs de 24 GB y en equipos sin GPU dedicada mediante CPU, Metal o Vulkan.
- Procesamiento por lotes en servidores: la variante Q8_0 de 35,00 GB, la más cercana al original, está pensada para GPUs de 48 GB o más y Macs de 64 GB, con decodificación especulativa DFlash2 para aumentar el throughput en la ruta CUDA.

## Benchmarks y rendimiento

La model card incluye una comparación de error de palabra (WER) y error de carácter (CER, para chino) frente al decodificador BF16 de referencia, medida sobre 2.200 enunciados. La tabla proporcionada está truncada a partir de la fila `Q8_0`, por lo que solo se dispone de los valores de referencia y de las afirmaciones cualitativas del autor.

| Decodificador | Tamano en disco | LibriSpeech clean | LibriSpeech other | MLS German | MLS French | MLS Spanish | FLEURS Chinese (CER) |
|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 65,85 GB | 1,58% | 3,34% | 4,04% | 3,79% | 3,23% | 9,77% |
| Q8_0 | 35,00 GB | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-Q5_0_XL | 29,26 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-IQ4_NL_L | 22,55 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-IQ4_NL | 19,68 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-NVFP4 | 19,68 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-Q2_0_L | 15,55 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| AD-Q2_0_M | 13,57 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos cualitativos declarados por el autor: todos los decodificadores desde 15,55 GB transcriben de forma equivalente al BF16 en inglés, alemán, francés, español y chino, con una variación de WER de ±0,18 puntos en los conjuntos inglés, alemán, francés y español, y un CER chino de +0,02 a +0,41 puntos. El `AD-Q2_0_M` de 13,57 GB mantiene inglés, alemán, francés y español dentro del ruido, con +1,5 puntos de CER en chino y un pico de memoria GPU de 15,6 GiB.

## Requisitos de hardware

- VRAM estimada: 15,6 GiB de pico con el decodificador `AD-Q2_0_M` (13,57 GB) más el codificador F16 (1,67 GB) en GPUs de 16 GB.
- GPU recomendadas por variante:
  - `Q8_0` (35,00 GB): GPUs de 48 GB o más (A6000, A100, H100) y Macs de 64 GB.
  - `AD-Q5_0_XL` (29,26 GB): GPUs de 32 GB o más.
  - `AD-IQ4_NL_L` (22,55 GB): GPUs de 32 GB y Macs de 32 GB.
  - `AD-IQ4_NL` (19,68 GB): recomendado fuera de Blackwell; GPUs de 24 GB (RTX 3090, RTX 4090), CPU, Metal y Vulkan.
  - `AD-NVFP4` (19,68 GB): recomendado en Blackwell (RTX 50xx, RTX PRO 6000, DGX Spark, B200) con expertos en NVFP4 nativo.
  - `AD-Q2_0_L` (15,55 GB): Macs de 24 GB (17,2 GB con el codificador).
  - `AD-Q2_0_M` (13,57 GB): GPUs de 16 GB.
- Cabe en GPU de consumo: sí, desde una GPU de 16 GB con `AD-Q2_0_M` y desde 24 GB con `AD-IQ4_NL`.
- Opciones de despliegue: runtime NeMo-Speech.cpp de NVIDIA (CPU, Metal, Vulkan y CUDA con batching); el borrador DFlash2 se activa mediante el parámetro `asr.salm.dflash_path` en la ruta CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (este) | 32.913 M totales, ~4.000 M activos | Grabaciones de hasta 1 hora | 40 | OpenMDW 1.1 | GGUF, safetensors |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B (original) | 32.913 M totales, ~4.000 M activos | Grabaciones de hasta 1 hora | 40 | OpenMDW 1.1 | Safetensors (checkpoint de 67 GB) |
| Conversiones por defecto de NVIDIA (NVFP4 / IQ4_NL) | 32.913 M totales, ~4.000 M activos | Grabaciones de hasta 1 hora | 40 | OpenMDW 1.1 | GGUF (21,79 GB / 20,35 GB) |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de otros desarrolladores para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio es una conversión de terceros (paincupid / Atomic Chat), no una publicación oficial de NVIDIA; la calidad de la cuantización depende del conversor y de la matriz de importancia incluida.
- La tabla de benchmarks de la model card está truncada en la información disponible: no se pueden verificar los valores de WER de cada decodificador salvo las afirmaciones cualitativas del autor.
- El chino es el idioma más sensible a la cuantización: +1,5 puntos de CER con `AD-Q2_0_M` y hasta +0,41 puntos con los decodificadores grandes.
- El modelo requiere dos archivos por carpeta (decodificador más codificador F16) y el decodificador referencia al codificador por nombre; renombrar el archivo del codificador rompe la carga.
- La licencia OpenMDW 1.1 no es una licencia OSI convencional; conviene revisar sus términos en el enlace oficial antes de un uso comercial.
- No se dispone de información sobre sesgos, tasa de alucinación ni comportamiento en dominios acústicos adversos (ruido, acentos no estándar, audio telefónico).
- El soporte de decodificación especulativa con DFlash2 está limitado a la ruta CUDA con batching; en CPU, Metal y Vulkan no se aprovecha.
- El tamaño del repo (158,2 GB) implica una descarga considerable si se quieren todas las variantes; para producción conviene descargar solo el decodificador y el codificador necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/paincupid/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
