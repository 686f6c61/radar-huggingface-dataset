# FermionResearch/Phonon-2

## Resumen

Phonon-2 es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por Fermion Research, una cuantizacion con entrenamiento consciente de cuantizacion (QAT) del modelo NVIDIA parakeet-tdt-0.6b-v3. Su propuesta es la eficiencia por byte: con una descarga de 164 MB y un encoder que almacena cada peso en uno de cinco niveles aprendidos (unos 2,1 bits por peso), promedia un 5,21 % de tasa de error por palabra (WER) en los siete conjuntos en ingles del Open ASR Leaderboard, frente al 5,69 % de Parakeet Redux (178 MB) y el 6,58 % de Whisper large-v3-turbo (1.618 MB).

El modelo conserva la precision de su profesor de 2.508 MB en la mayoria de dominios: alcanza el 100,8 % de la precision en palabras del profesor sobre discurso parlamentario y lo supera en reuniones (9,37 % frente a 9,42 % de WER en AMI), con un tamano quince veces menor. La arquitectura subyacente es un transductor TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parametros, heredado del modelo base de NVIDIA junto con su tokenizador y sus convenciones de salida (puntuacion, mayusculas y numerales).

Es relevante ahora porque demuestra que un ASR de alta calidad cabe en el almacenamiento y la memoria de un portatil o incluso de un dispositivo movil, con velocidades de 174x tiempo real en un MacBook Air con M5, 143x en ocho nucleos Zen 5 y 6.680x en una H100 con lotes de 128. Se distribuye con pesos abiertos bajo licencia CC-BY-4.0 y forma parte de Detta, la aplicacion de dictado para Mac de Fermion Research.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) tipo Parakeet; encoder cuantizado con QAT de cinco valores aprendidos (~2,1 bits por peso) |
| Parametros totales | Aproximadamente 600 millones, segun el modelo base nvidia/parakeet-tdt-0.6b-v3 (la model card no declara un recuento propio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (modelo ASR; no se especifica limite de duracion de audio) |
| Tipos de cuantizacion | Pesos ya cuantizados a ~2,1 bits mediante QAT de cinco niveles; no se documentan variantes adicionales de cuantizacion |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (el codigo de la CLI y del repositorio es Apache 2.0) |
| Formato de pesos | MLX (libreria `mlx`); el contenedor exacto de pesos no se detalla en la model card |

## Arquitectura y entrenamiento

Phonon-2 no es un transformer clasico de decodificacion autoregresiva, sino un transductor TDT: un encoder que procesa el audio y un decodificador que emite de forma conjunta tokens y duraciones, lo que permite un alineamiento eficiente sin modelos de lenguaje externos. Sobre esa base, Fermion Research aplica un esquema de cuantizacion consciente de cuantizacion (QAT) en el que cada peso del encoder se restringe a uno de cinco niveles aprendidos durante el entrenamiento, con un coste medio de unos 2,1 bits por peso. El resultado es un artefacto de 164 MB en disco frente a los 2.508 MB del profesor en precision completa.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon etapas de RLHF o DPO. Si se explicita que el modelo parte de parakeet-tdt-0.6b-v3 de NVIDIA y que conserva su tokenizador y sus convenciones de salida (puntuacion, uso de mayusculas y escritura de numerales), de modo que el comportamiento textual en la transcripcion es el del modelo original. El fichero `NOTICE` del repositorio enumera los cambios introducidos respecto al modelo base.

## Capacidades

- Transcripcion de voz a texto en ingles, con puntuacion, mayusculas y numerales segun las convenciones del modelo original de NVIDIA.
- Reconocimiento de audio largo: la evaluacion incluye conjuntos como AMI (reuniones) y Earnings-22 (llamadas de resultados financieros), con un WER de 9,37 % y 6,96 % respectivamente.
- Inferencia en dispositivo (on-device): disenado para ejecutarse en Apple Silicon mediante MLX y en CPU x86-64, Arm y Windows sin acelerador dedicado.
- Ejecucion por lotes en GPU para alto rendimiento: 6.680x tiempo real en una H100 con lotes de 128.
- Integracion con la CLI `fermion-research` y con imagenes Docker de CPU y CUDA para despliegues en contenedor.
- Adaptado al caso de uso de dictado en escritorio, como motor de la aplicacion Detta para Mac.
- No soporta generacion de texto, razonamiento, codigo, vision, audio generativo, tool calling ni function calling: es exclusivamente un modelo de reconocimiento automatico del habla.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Dictado en escritorio: Phonon-2 es el motor de Detta, la aplicacion de dictado para Mac de Fermion Research; cabe integramente en memoria y transcribe en tiempo real en un portatil con Apple Silicon (174x tiempo real en un M5 MacBook Air), sin enviar audio a la nube.
- Transcripcion de reuniones y actas: con un WER de 9,37 % en el conjunto AMI, es adecuado para convertir reuniones en texto accionable, un dominio donde incluso supera a su profesor de 2.508 MB (9,42 %).
- Indexacion y busqueda de discurso parlamentario: en VoxPopuli obtiene 2,46 % de WER, el mejor resultado de la tabla comparativa, lo que permite transcribir plenos y sesiones legislativas para su busqueda posterior a texto completo.
- Analisis de llamadas financieras: en Earnings-22 registra 6,96 % de WER con solo 164 MB de descarga, lo que abarata el procesamiento masivo de llamadas de resultados sin depender de infraestructura GPU dedicada.
- Subtitulado y postproduccion de audio: la salida ya incorpora puntuacion, mayusculas y numerales, de modo que puede alimentar directamente pipelines de subtitulado en ingles.
- Transcripcion por lotes a gran escala en GPU: en una unica H100 y con lotes de 128 procesa audio a 6.680x tiempo real, es decir, una hora de audio en aproximadamente medio segundo por lote; util para digitalizar archivos de audio o podcasts completos.
- Asistentes de voz sin conexion: al ejecutarse en CPU x86-64, Arm y Windows y ocupar 164 MB, puede embeberse en aplicaciones de escritorio o kioscos donde la latencia y la privacidad del audio son criticas.
- Cumplimiento y privacidad de datos: el procesamiento local evita enviar grabaciones de clientes a servicios externos, lo que facilita el cumplimiento en entornos con requisitos estrictos de residencia de datos.

## Benchmarks y rendimiento

Resultados de WER (menor es mejor) publicados por el autor sobre los siete conjuntos en ingles del Open ASR Leaderboard:

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Phonon-2 | 164 MB | 1,72 | 3,92 | 9,37 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 (profesor) | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,19 | 4,96 |
| Parakeet Redux | 178 MB | 1,94 | 4,35 | 9,16 | 7,90 | 8,62 | 4,01 | 3,87 | 5,69 |
| Phonon-1 | 415 MB | 2,11 | 5,03 | 10,31 | 12,34 | 8,73 | 3,67 | 3,73 | 6,56 |
| Canary 180M Flash | 737 MB | 1,52 | 3,42 | 12,09 | 8,33 | 8,87 | 2,04 | 3,57 | 5,69 |
| Voxtral Mini 4B Realtime | aprox. 8.000 MB | 1,62 | 4,94 | 13,34 | 9,31 | 8,80 | 2,23 | 2,60 | 6,12 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |
| Nemotron 3.5 ASR Streaming 0.6B | 2.368 MB | 2,83 | 6,79 | 13,43 | 15,30 | 9,86 | 3,27 | 4,24 | 7,96 |

Nota del autor: las filas marcadas como publicadas por el Open ASR Leaderboard usan sus resultados oficiales; el resto emplean el mismo codigo sobre los conjuntos de test completos. El tamano de Voxtral Mini 4B Realtime se deriva de su numero de parametros a 16 bits.

Rendimiento medido (transcripcion de una hora de audio):

| Plataforma | Velocidad |
|---|---|
| MacBook Air con M5 (MLX) | aprox. 20 s (174x tiempo real) |
| 8 nucleos Zen 5 (16 vCPU) | 143x tiempo real |
| 1x H100, lotes de 128 | 6.680x tiempo real |

## Requisitos de hardware

- Huella de almacenamiento: 164 MB de descarga; el repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: inferior a 1 GB, coherente con un modelo de aproximadamente 600 millones de parametros a ~2,1 bits. No se publican cifras exactas de memoria en la model card.
- GPU recomendadas: H100 para maximo rendimiento por lotes (6.680x tiempo real); cualquier GPU consumer moderna es sobradamente suficiente dado el tamano del modelo. La model card no enumera GPUs concretas mas alla de la H100.
- Compatibilidad con GPU consumer: si; con 164 MB de pesos cabe en cualquier GPU consumer e incluso en graficos integrados, aunque no se detallan pruebas especificas sobre RTX 4090 u otras.
- CPU: se ejecuta en Linux (x86-64 y Arm) y Windows sin GPU, a 143x tiempo real en ocho nucleos Zen 5.
- Apple Silicon: soporte nativo mediante MLX, con 174x tiempo real en un M5 MacBook Air.
- Opciones de despliegue: MLX (`mlx`, `mlx-audio`, `mlx-lm`), la CLI `fermion-research` (`pip install fermion-research`), e imagenes Docker `ghcr.io/fermionresearch/phonon-cpu:2.0.2` y `ghcr.io/fermionresearch/phonon-cuda:1.0.3`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una hora de audio en aproximadamente 20 s en un M5 MacBook Air; 143x tiempo real en CPU Zen 5; 6.680x en una H100 con lotes de 128.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2 | aprox. 600 M | 164 MB | 5,21 | CC-BY-4.0 | Pesos abiertos en Hugging Face (MLX), Docker CPU/CUDA |
| Parakeet TDT 0.6B v3 (profesor) | aprox. 600 M | 2.508 MB | 4,96 | No disponible en la informacion proporcionada | Modelo base de NVIDIA |
| Parakeet Redux | No disponible | 178 MB | 5,69 | No disponible | Pesos abiertos |
| Phonon-1 | 782 M (segun anuncio del autor) | 415 MB | 6,56 | Apache 2.0 (segun anuncio del autor) | Pesos abiertos |
| Canary 180M Flash | 180 M | 737 MB | 5,69 | No disponible | Pesos abiertos |
| Whisper large-v3-turbo | No disponible | 1.618 MB | 6,58 | No disponible | Pesos abiertos |
| Voxtral Mini 4B Realtime | 4 B | aprox. 8.000 MB a 16 bits | 6,12 | No disponible | Pesos abiertos |
| Nemotron 3.5 ASR Streaming 0.6B | 0,6 B | 2.368 MB | 7,96 | No disponible | Pesos abiertos |

Phonon-2 ocupa la primera posicion de la comparativa en eficiencia por byte: mejora el WER medio de Parakeet Redux (5,69) y de Whisper large-v3-turbo (6,58) con una descarga entre 10 y 15 veces menor, y se queda a 0,25 puntos de su profesor de 2.508 MB. Solo Canary 180M Flash, ligeramente mas ligero en parametros pero con 737 MB de descarga, le supera en SPGISpeech (2,04 frente a 3,70).

## Limitaciones y advertencias

- Cobertura de idiomas: exclusivamente ingles. No admite otros idiomas ni cambios de idioma dentro del audio.
- Naturaleza del modelo: es un sistema ASR puro; no genera texto libre, no razona, no escribe codigo y no soporta tool calling ni function calling.
- Riesgo de error en audio dificil: el propio autor reporta un 9,37 % de WER en AMI (reuniones) y un 8,35 % en GigaSpeech, muy por encima del 1,72 % de LibriSpeech clean. En audio con ruido, solapamiento de voces o acentos no vistos, la tasa de error puede ser sustancialmente mayor.
- Ausencia de datos declarados: la model card no especifica composicion del dataset de entrenamiento, numero de tokens, procesos de alineacion ni etapas de RLHF/DPO, lo que dificulta auditar sesgos o procedencia de los datos.
- Sesgos: no se documenta ningun analisis de sesgo por acento, genero, edad o variedad dialectal del ingles. Al derivar de parakeet-tdt-0.6b-v3, hereda las caracteristicas y los sesgos de ese modelo.
- Restricciones de licencia: CC-BY-4.0 exige atribucion. El fichero `NOTICE` lista los cambios respecto al modelo original, y el codigo de la CLI y del repositorio se distribuye aparte bajo Apache 2.0. La licencia de uso comercial esta permitida por CC-BY-4.0, siempre con la atribucion correspondiente a Fermion Research y a NVIDIA como origen.
- Dependencia del ecosistema MLX: el formato de pesos esta orientado a la libreria `mlx`; para otros entornos hay que recurrir a las imagenes Docker de CPU o CUDA o a la CLI `fermion-research`.
- Versiones dispares de los contenedores: la imagen de CPU publicada es la 2.0.2 y la de CUDA la 1.0.3, lo que conviene verificar antes de fijar un despliegue en produccion.
- Longitud de audio soportada: no disponible; no se declara limite maximo de duracion ni estrategia de segmentacion en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-2
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Perfil de Fermion Research en Hugging Face: https://huggingface.co/FermionResearch
- Repositorio de los motores de inferencia: https://github.com/fermionresearch/phonon
- Paquete de linea de comandos en PyPI: https://pypi.org/project/fermion-research/
- Documentacion de Fermion Research: https://www.fermionresearch.com/docs/
- Sitio web de Fermion Research: https://www.fermionresearch.com/
- Aplicacion de dictado Detta: https://www.fermionresearch.com/products/detta
- Cuenta en X: https://x.com/fermion_ai
- Imagen Docker de CPU: ghcr.io/fermionresearch/phonon-cpu:2.0.2
- Imagen Docker de CUDA: ghcr.io/fermionresearch/phonon-cuda:1.0.3
