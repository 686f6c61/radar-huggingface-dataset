# Reza2kn/drama-3-nvfp4

## Resumen

Drama 3 NVFP4 es una derivacion cuantizada del modelo de sintesis de voz Fish Audio Drama 3, publicada por el usuario Reza2kn. Se trata de un checkpoint de text-to-speech (TTS) con arquitectura de mezcla de expertos (MoE) en el que unicamente los expertos enrutados se almacenan en NVFP4; la atencion, los expertos compartidos, los embeddings, la cabeza de salida y el decodificador de audio conservan su precision original. El autor lo presenta explicitamente como una cuantizacion de expertos, no como un modelo cuyos 19,79 mil millones de parametros esten todos en cuatro bits.

La relevancia del checkpoint es doble. Por un lado demuestra que un MoE de ~19,8 B de parametros puede ejecutarse en una GPU de portatil de 16 GB (GeForce RTX 5080 Laptop) mediante una cache acotada de 64 expertos en VRAM y lectura de expertos empaquetados bajo demanda desde disco. Por otro, es un ejemplo temprano de cuantizacion NVFP4 con nombres de tensor estilo ModelOpt y multiplicacion de matrices CUTLASS nativa, orientada al hardware Blackwell. El repositorio incluye un runtime propio sobre SGLang/SGLang-Omni con revisiones fijadas.

La informacion disponible no incluye longitud de contexto, numero de parametros activos por token ni resultados de benchmarks estandar. La validacion publicada se limita a cobertura de tensores, dos canarios numericos de error L2 en la salida de los expertos, sintesis end-to-end en ingles y persa, y una escucha de tres clips por parte del propietario del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado de Fish Audio Drama 3); 40 capas x 256 expertos enrutados x 3 proyecciones = 30.720 matrices cuantizadas |
| Parametros totales | 19.793.515.648 (~19,79 B) segun safetensors |
| Parametros activos | no disponible (no se indica el numero de expertos activados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 solo en expertos enrutados: valores E2M1 empaquetados, una escala E4M3 por cada 16 pesos de canal de entrada y una escala global FP32 por matriz; gate y up comparten escala global dentro de cada experto. Resto de tensores en BF16. Aproximadamente 4,5 bits por peso de experto enrutado antes de escalas globales y serializacion |
| Idiomas soportados | en (ingles), fa (persa) |
| Licencia | fish-audio-community-license (license: other) |
| Formato de pesos | safetensors (payload de tensores de 25,49 GB; ~27,42 GB con codec y ficheros de soporte) |

## Arquitectura y entrenamiento

El modelo base es Fish Audio Drama 3, un MoE de 40 capas con 256 expertos enrutados y tres proyecciones por experto. La variante NVFP4 mantiene en BF16 todos los componentes no enrutados: atencion, expertos compartidos, embeddings, cabeza de salida y decodificador de audio. La conversion parte de las revisiones del modelo original (revision fuente `e0a9218aa48888270f06ef1ed9ea67622c0e17d2`), que ya incluia expertos en formato block-FP8.

El proceso de cuantizacion de los expertos consistio en desquantizar los valores FP8 y convertirlos a NVFP4 con redondeo al mas cercano. El autor indica explicitamente que no se utilizo conjunto de calibracion, ni optimizacion GPTQ, ni entrenamiento consciente de cuantizacion (QAT). El runtime emplea multiplicacion de matrices CUTLASS NVFP4 nativa con escalas de activacion FP32 dinamicas por token y escalas de bloque de activacion E4M3; el resto de computos permanece en BF16. El layout usa nombres de tensor y configuracion estilo ModelOpt, pero el exportador es propio y no implica que se haya ejecutado la calibracion de NVIDIA Model Optimizer. No se documenta en la informacion disponible ningun proceso de RLHF, DPO o ajuste posterior.

El runtime validado mantiene una cache GPU acotada de 64 expertos y lee del disco los expertos empaquetados seleccionados bajo demanda. Esto permite validar en 16 GB de VRAM, pero introduce sobrecarga sustancial de Python, transferencia y disco; el propio autor advierte que no es un benchmark de throughput de MoE fusionado ni una promesa de velocidad de produccion.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles y persa a partir de texto.
- Soporte de etiquetas de emocion no verbal en las muestras publicadas: el ejemplo incluido usa `[sighs]` y `[laughs]` en ingles.
- Generacion de audio WAV servida mediante endpoint compatible con `/v1/audio/speech` del servidor SGLang-Omni.
- Inferencia en decodificacion de un token y prefill por lotes, con operaciones de experto completas verificadas.
- Ejecucion en GPU consumer Blackwell mediante NVFP4 nativo y lecturas de expertos respaldadas por disco.
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso agentico, vision, audio de entrada, clonacion de voz con referencia en las muestras (las muestras son TTS incondicional sin clonacion) ni modo de razonamiento explicito.
- Capacidades multilingues limitadas a los dos idiomas declarados (en, fa).

## Casos de uso

- Sintesis de voz en ingles para asistentes y lectores de contenido: el modelo genera WAV directamente sobre un endpoint compatible con la API de audio de SGLang-Omni, y la cuantizacion NVFP4 reduce el peso de los expertos enrutados para despliegues con VRAM limitada.
- Locucion en persa: es uno de los dos idiomas declarados y cuenta con muestra de validacion propia (7,06 s en NVFP4 frente a 5,71 s de la referencia fuente), lo que lo hace util para productos que necesitan TTS en farsi sin recurrir a modelos multilingues de mayor tamano.
- Prototipado en equipos con GPU de 16 GB: el runtime incluido permite levantar el servidor en localhost:8000 y generar audio en una maquina de desarrollo con una RTX 5080 Laptop, lo que facilita iterar sobre prompts y voces antes de escalar a hardware mayor.
- Generacion de audio con prosodia expresiva: las etiquetas de emocion como `[sighs]` y `[laughs]` permiten introducir variaciones no verbales en doblaje, audiolibros o contenido para redes.
- Investigacion sobre cuantizacion NVFP4 en MoE: al publicar el detalle de escalas por bloque de 16 pesos, escalas globales FP32 y errores L2 medidos en la salida de los expertos (0,1998 y 0,2172), sirve como punto de partida para estudiar el impacto de FP4 en modelos de audio.
- Base para evaluaciones de calidad de voz: el repositorio incluye WAV de comparacion NVFP4 frente a referencia fuente con los mismos prompts y ajustes de muestreo, utiles para montar pruebas A/B internas de inteligibilidad antes de adoptar la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, WER, MOS ni metricas de throughput. La unica validacion cuantitativa publicada son los canarios numericos del autor, que no son puntuaciones de calidad de voz.

| Prueba | Resultado | Naturaleza |
|---|---|---|
| Error L2 relativo de salida de expertos (canario 1) | 0,1998 | Metrica numerica, no calidad de voz |
| Error L2 relativo de salida de expertos (canario 2) | 0,2172 | Metrica numerica, no calidad de voz |
| Cobertura de tensores | 30.720 proyecciones de experto verificadas; 805 tensores retenidos coinciden exactamente con la fuente | Verificacion de integridad |
| Muestra ingles NVFP4 | 5,48 s de WAV | WAV finito, no vacio, sin muestras recortadas |
| Referencia fuente ingles | 5,76 s de WAV | Referencia con valores FP8 desquantizados a BF16 |
| Muestra persa NVFP4 | 7,06 s de WAV | WAV finito, no vacio, sin muestras recortadas |
| Referencia fuente persa | 5,71 s de WAV | Referencia con valores FP8 desquantizados a BF16 |
| Muestra ingles con `[sighs]` / `[laughs]` | 6,27 s de WAV | Sin referencia fuente publicada |
| Reproducibilidad del lanzador | Reproduce byte a byte el WAV ingles aprobado | Smoke test del runtime portatil |
| Revision humana | Escucha de 3 clips NVFP4 y 2 de referencia, aceptados el 15 de octubre de 2026 | Revision reducida, no benchmark amplio ni evaluacion formal de WER |

## Requisitos de hardware

- GPU con soporte nativo de NVFP4: el autor etiqueta el modelo como `blackwell` y usa multiplicacion matricial CUTLASS NVFP4, por lo que se requiere hardware de esa generacion para el camino de computo previsto.
- Validacion realizada en una GeForce RTX 5080 Laptop GPU con 16 GB de VRAM sobre Linux, con cache acotada de 64 expertos y lectura de expertos desde disco.
- Payload de tensores de 25,49 GB y ~27,42 GB incluyendo codec y ficheros de soporte; el repositorio completo ocupa 27,4 GB. Cargar el modelo sin el esquema de cache respaldado por disco exige al menos esa cantidad de VRAM mas activaciones, cache KV y memoria del codec (cantidad exacta no disponible).
- No se documentan GPU A100, H100 ni RTX 4090 como plataformas probadas; al no disponer de NVFP4 nativo, no hay datos publicados sobre su comportamiento en esas tarjetas.
- Opciones de despliegue documentadas: SGLang `v0.5.21` (commit `e00930c5489053f26d86b179cee0d087f846acbb`) y SGLang-Omni (commit `00ac898e38dc2e49499d35feeb1ab06c04049a96`), con el extra `fishaudio`. El lanzador incluido arranca el servidor en `127.0.0.1:8000`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno probado: PyTorch 2.13.0+cu130, Transformers 5.16.1, FlashInfer 0.6.18, CUTLASS DSL 4.6.2, TVM FFI 0.1.11, sglang-kernel 0.4.7, Python 3.13 en el host de validacion (la receta de instalacion apunta a Python 3.12), `CUDA_HOME=/usr/local/cuda-13.3`.
- Latencia y throughput: no disponibles. El autor indica que hay sobrecarga sustancial de Python, transferencia y disco, y que el runtime no constituye un benchmark de rendimiento.
- La compilacion de kernels puede tardar varios minutos y el lanzador limita a un trabajo de compilacion para no saturar la memoria del host; se recomienda un `nvcc`/`ptxas` compatible, ya que el descubrimiento automatico selecciono un par incompatible durante la puesta en marcha inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de expertos | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reza2kn/drama-3-nvfp4 | 19,79 B totales; activos no disponibles | NVFP4 (E2M1, escala E4M3 por 16 pesos, escala global FP32), sin calibracion ni QAT | en, fa | fish-audio-community-license | HuggingFace, runtime SGLang-Omni incluido |
| fishaudio/drama-3 (modelo base) | no disponible | block-FP8 en expertos; attention, shared experts, embeddings, cabeza y decodificador en precision original | no disponible | no disponible en la informacion proporcionada | HuggingFace, revision fuente `e0a9218aa48888270f06ef1ed9ea67622c0e17d2` |
| Otras alternativas TTS de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se proporcionan modelos comparables con datos verificables en la informacion disponible |

La unica comparacion con datos es frente al propio modelo base: la referencia publicada usa los valores FP8 desquantizados para el computo de expertos en BF16, no el camino de ejecucion fusionado con activaciones FP8 del modelo original. No hay cifras de rendimiento comparadas entre ambos checkpoints mas alla de los dos canarios de error L2.

## Limitaciones y advertencias

- La cuantizacion afecta unicamente a los expertos enrutados; no es correcto describir el checkpoint como un modelo totalmente de cuatro bits. El coste real es de aproximadamente 4,5 bits por peso de experto enrutado.
- La conversion se hizo con redondeo al mas cercano, sin conjunto de calibracion, sin GPTQ y sin QAT, por lo que no hay garantia de que la degradacion se mantenga acotada fuera de los prompts de validacion.
- Los errores L2 de 0,1998 y 0,2172 miden la desviacion de la salida de los expertos, no la calidad perceptible de la voz. No se ha publicado ninguna evaluacion de WER ni de MOS.
- La validacion humana se limita a la escucha de tres clips NVFP4 y dos de referencia por parte del propietario del repositorio; no es una revision amplia ni ciega.
- Las muestras son TTS incondicional y sin clonacion de voz de referencia; no se documenta el comportamiento con voces clonadas.
- Solo se declaran ingles y persa. Cualquier otro idioma debe considerarse no soportado sin evidencia.
- La longitud de contexto no se especifica, lo que impide dimensionar la cache KV y planificar sintesis de textos largos por fragmentos.
- Licencia fish-audio-community-license (license: other): es una licencia comunitaria, no una licencia de codigo abierto estandar. Debe revisarse el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y se etiqueta a si mismo como experimental; no hayvalidacion independiente.
- La instalacion limpia de la receta no ha sido validada de forma independiente, y el host probado usaba Python 3.13 mientras que la receta apunta a Python 3.12.
- El runtime con cache de 64 expertos y lectura desde disco introduce sobrecarga elevada y no representa el rendimiento de una implementacion MoE fusionada en produccion.
- El checkpoint arrastra la etiqueta `8-bit` en los tags del repositorio, lo que puede inducir a confusion: el formato real de los expertos enrutados es FP4 con escalas por bloque.
- Riesgo de alucinacion aplicado a TTS: artefactos de prosodia, pronunciacion incorrecta o saltos de audio no cubiertos por la validacion publicada.
- El modelo se distribuye con el lanzador propio del autor; cualquier integracion en produccion deberia auditar el codigo del runtime antes de desplegarlo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Reza2kn/drama-3-nvfp4
- Modelo base Fish Audio Drama 3: https://huggingface.co/fishaudio/drama-3
- Licencia (fichero del repositorio): https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/LICENSE
- Muestra NVFP4 en ingles: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/samples/nvfp4/en-short.wav
- Muestra NVFP4 en persa: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/samples/nvfp4/fa-short.wav
- Muestra NVFP4 en ingles con etiquetas de emocion: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/samples/nvfp4/en-emotion.wav
- Referencia fuente en ingles: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/samples/source-reference/en-short.wav
- Referencia fuente en persa: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/samples/source-reference/fa-short.wav
- Validacion de escucha (procedencia): https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/validation/listening-validation.json
- Prompts de escucha: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/validation/listening-prompts.json
- Revision humana: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/validation/human-review.json
- Smoke test del runtime portatil: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/validation/release-portable-smoke.json
- Instantanea del entorno de ejecucion: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/validation/runtime-environment.json
- Lanzador incluido: https://huggingface.co/Reza2kn/drama-3-nvfp4/blob/main/runtime/serve.sh
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Repositorio SGLang: https://github.com/sgl-project/sglang
