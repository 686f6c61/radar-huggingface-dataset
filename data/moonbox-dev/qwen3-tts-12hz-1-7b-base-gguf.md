# moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF

## Resumen

Qwen3-TTS 12Hz 1.7B Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache-2.0. Esta ficha describe concretamente la versión cuantizada en formato GGUF elaborada por moonbox-dev para su uso con llama.cpp en hardware local (Metal, CUDA, Vulkan y CPU). El modelo base resuelve la conversión de texto a audio de 24 kHz con clonación de voz zero-shot a partir de una muestra de referencia y su transcripción, y cubre diez idiomas principales, entre ellos el castellano.

La relevancia de esta distribución GGUF es práctica: reduce un modelo de 1.733 millones de parámetros a ficheros de entre 1,04 GB (Q4_K_M) y 3,47 GB (F16/BF16), más un fichero de proyección multimodal (`mmproj`) de 840 MB que contiene el codificador de hablante, el predictor de códigos y el codificador/decodificador del tokenizador de voz. Esto permite ejecutar TTS con clonación de voz en una GPU de consumo o incluso en CPU, algo imposible con los pesos originales en bf16.

La arquitectura del backbone es la del modelo original Qwen3-TTS en su variante de 12 Hz (frecuencia de trama del codec), con 1.733.157.888 parámetros totales según los safetensors del modelo base. El contexto y la composición exacta del entrenamiento no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de síntesis de voz (Qwen3-TTS, variante 12 Hz); backbone "talker" más codificador de hablante, predictor de códigos (codebooks 1-15) y codec de voz a 24 kHz |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (mixes estándar de `llama-quantize`, sin importance matrix) |
| Idiomas soportados | 10 idiomas según el modelo original: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`qwen3-tts-1-7b-*.gguf` + `mmproj-qwen3-tts-1-7b-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS emplea un diseño en dos etapas típico de los sistemas TTS neuronales modernos: un backbone autorregresivo (el "talker") que genera tokens de código de voz y un codec neural que los decodifica a audio PCM de 24 kHz. La variante "12Hz" hace referencia a la frecuencia de trama del codec, es decir, 12 tokens de audio por segundo. En esta distribución GGUF, el fichero del modelo contiene únicamente el backbone; el `mmproj` empaqueta el codificador de hablante (para la clonación), el predictor de códigos de los codebooks 1 a 15, el codificador del tokenizador de voz (para clonación con transcripción, ICL) y el decodificador de códigos a audio.

La conversión a GGUF introduce dos modificaciones de layout respecto al checkpoint original, documentadas por el autor: la MLP de proyección de texto se pliega dentro de la tabla de embeddings (de modo que la tabla contiene `projection(embedding)`, con coincidencia en fp32 dentro de un paso de redondeo bf16 en el 0,008 % de los valores) y el embedding del codec se anexa a esa misma tabla. El resto de tensores es idéntico byte a byte al original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto con salida de audio a 24 kHz.
- Clonación de voz zero-shot mediante un clip de referencia (`speaker.wav`) y, opcionalmente, su transcripción (modo ICL), lo que mejora la fidelidad del timbre y la prosodia.
- Clonación basada solo en el embedding de hablante cuando no se aporta transcripción de referencia.
- Soporte multilingüe en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control de la generación mediante parámetros de muestreo (temperatura 0,9, top-k 50, penalización de repetición 1,05 en la configuración de referencia) y semilla (`seed`) para reproducibilidad.
- Servicio HTTP mediante `llama-server` con los endpoints `/tts` y `/v1/audio/speech`, compatible con clientes que hablan la API de audio de OpenAI.
- Ejecución en CPU, CUDA, Metal y Vulkan a través de llama.cpp.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Clonación de voz para audiolibros y narración: con un clip de referencia de pocos segundos y su transcripción, el modelo reproduce el timbre del locutor; el fichero Q6_K (1,43 GB) mantiene una similitud de hablante de 0,954/0,955 según el benchmark del autor, prácticamente idéntica al BF16.
- Doblaje y localización de contenido: al cubrir diez idiomas, incluido el español, se puede generar la misma locución en distintos idiomas manteniendo la identidad de voz de referencia, útil para vídeos corporativos o formación interna.
- Asistentes de voz en local para aplicaciones de escritorio: el modelo cabe en 1,04 GB en Q4_K_M y corre sobre CPU o GPU integrada vía llama.cpp, lo que permite integrar TTS sin depender de servicios en la nube ni enviar texto del usuario a terceros.
- Accesibilidad y lectura de pantalla: generación de voz personalizada para usuarios con discapacidad visual, clonando la voz de un familiar o una voz de referencia elegida, con latencia controlable mediante cuantización agresiva (RTF 0,35 en Q5_K_M y Q4_K_M sobre RTX 3080 Laptop).
- Prototipado de interfaces conversacionales: `llama-server` expone `/v1/audio/speech` compatible con la API de OpenAI, lo que permite sustituir un proveedor de TTS en un pipeline existente sin cambiar el código cliente, usando el servidor local.
- Generación de avisos y locuciones en sistemas embebidos o edge: los ficheros Q4_K_M y Q5_K_M, de alrededor de 1 GB, permiten desplegar TTS en dispositivos con memoria limitada donde un modelo en bf16 de 3,47 GB no cabría.
- Pruebas A/B de voces sintéticas en investigación: la posibilidad de fijar semilla y muestreo hace reproducible la generación, lo que facilita comparar cuantizaciones o configuraciones de clonación con el mismo texto de entrada.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre un conjunto de 6 frases en inglés y 4 en chino, con semillas 0 y 1, en tarea de clonación de voz con clip y transcripción (ICL), ejecutada en `llama-server` `/tts` sobre CUDA (RTX 3080 Laptop). Las métricas son WER/CER de la transcripción de Whisper large-v3-turbo (inglés/chino), similitud de hablante WavLM respecto al clip de referencia y DNSMOS. La referencia original (`qwen-tts` en bf16 sobre CUDA) obtiene error 0,0 %/0,0 %, similitud 0,944/0,954 y DNSMOS 3,25/2,97.

| Fichero | Tamano | WER / CER | Similitud hablante | DNSMOS | RTF |
|---|---|---|---|---|---|
| F16 | 3,47 GB | 0,0 % / 0,6 % | 0,954 / 0,954 | 3,16 / 2,87 | 0,40 |
| BF16 | 3,47 GB | 0,6 % / 0,0 % | 0,954 / 0,960 | 3,20 / 2,99 | 0,41 |
| Q8_0 | 1,85 GB | 0,0 % / 0,0 % | 0,958 / 0,954 | 3,19 / 2,84 | 0,37 |
| Q6_K | 1,43 GB | 0,0 % / 0,0 % | 0,954 / 0,955 | 3,26 / 3,02 | 0,36 |
| Q5_K_M | 1,23 GB | 0,0 % / 0,0 % | 0,946 / 0,962 | 3,17 / 3,01 | 0,35 |
| Q4_K_M | 1,04 GB | 0,0 % / 0,0 % | 0,959 / 0,957 | 3,18 / 3,01 | 0,35 |

El criterio de aceptación fijado por el autor es un error como máximo 2 puntos por encima del original, una similitud como máximo 0,03 por debajo y un DNSMOS como máximo 0,2 por debajo; todas las cuantizaciones publicadas lo cumplen según estos datos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS, ni comparaciones con otros sistemas TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB para F16/BF16 (fichero de 3,47 GB más el `mmproj` de 840 MB y overhead de contexto), en torno a 2,7-3 GB para Q8_0, y aproximadamente 1,9-2,5 GB para Q4_K_M y Q5_K_M. El `mmproj` F16 (840 MB) se carga siempre, sea cual sea la precisión del backbone.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones pequeñas; el autor valida el rendimiento en una RTX 3080 Laptop. Para F16/BF16 conviene una GPU con 6 GB o más. En el extremo alto, A100 o H100 no son necesarias para este tamaño, pero funcionarían.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde Q4_K_M hasta Q8_0 en tarjetas de 4-8 GB (RTX 3050, RTX 4060, RTX 3060, etc.). F16/BF16 requiere alrededor de 6 GB.
- Opciones de despliegue: llama.cpp `b12621` o superior, con los binarios `llama-tts` (CLI) y `llama-server` (HTTP, endpoints `/tts` y `/v1/audio/speech`). Backends soportados: CUDA, Metal, Vulkan y CPU.
- Latencia y throughput: RTF (segundos de cómputo por segundo de audio) de 0,35-0,41 sobre RTX 3080 Laptop en CUDA, es decir, entre 2,4 y 2,9 veces más rápido que tiempo real. Las cuantizaciones Q4_K_M y Q5_K_M son las más rápidas (RTF 0,35). No hay datos de RTF en CPU ni en Metal en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS 12Hz 1.7B Base (GGUF, esta ficha) | 1,73 B | no disponible | 10 | Apache-2.0 | GGUF para llama.cpp, 1,04-3,47 GB |
| Qwen3-TTS 12Hz 1.7B Base (original) | 1,73 B | no disponible | 10 | Apache-2.0 | safetensors en bf16, requiere el stack `qwen-tts` |
| Alternativas TTS open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros sistemas TTS (por ejemplo, modelos de clonación zero-shot de tamaño similar) que permitan una comparación rigurosa de parámetros, contexto y métricas. La comparación más directa y verificable es la del propio autor entre esta distribución GGUF y el modelo original en bf16, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; como todo modelo TTS entrenado con voces humanas, puede reproducir sesgos de acento, género o edad presentes en los datos de entrenamiento.
- Alucinación y errores de pronunciación: el WER del benchmark se mide transcribiendo la salida con Whisper, por lo que errores de pronunciación o de prosodia no quedan completamente capturados; en textos con nombres propios, siglas o números puede requerir normalización previa.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; para textos largos conviene trocear la entrada. El español está entre los diez idiomas soportados, pero no se publican métricas específicas para español en esta model card, solo para inglés y chino.
- Clonación de voz: la clonación zero-shot plantea riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del integrador aplicar consentimiento, marcas de agua o verificación de voz en producción.
- Licencia: Apache-2.0 permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia; conviene conservar los avisos de licencia y atribución.
- Requisito de dos ficheros: el modelo no funciona con un único GGUF; es obligatorio cargar también el `mmproj` F16, lo que añade 840 MB a cualquier despliegue y complica empaquetados ligeros.
- Verificación de integridad: el autor publica hashes sha256 por fichero; conviene comprobarlos tras la descarga, dado que la conversión modifica el layout de dos tensores (proyección de texto y embedding del codec).
- Madurez del tooling: requiere llama.cpp `b12621` o superior y los binarios `llama-tts`/`llama-server` con soporte TTS; versiones anteriores no cargarán el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado en los tags (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
- Fichero de proyección multimodal: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/mmproj-qwen3-tts-1-7b-F16.gguf
- Pesos F16: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-F16.gguf
- Pesos BF16: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-BF16.gguf
- Pesos Q8_0: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-Q8_0.gguf
- Pesos Q6_K: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-Q6_K.gguf
- Pesos Q5_K_M: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-Q5_K_M.gguf
- Pesos Q4_K_M: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-GGUF/blob/main/qwen3-tts-1-7b-Q4_K_M.gguf
