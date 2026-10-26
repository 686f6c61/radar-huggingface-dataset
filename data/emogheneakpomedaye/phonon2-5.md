# EmogheneAkpomedaye/Phonon2.5

## Resumen

Phonon-2.5 es un modelo de reconocimiento automático del habla (ASR) multilingüe en 25 idiomas, publicado por Fermion Research (repositorio alojado en la cuenta de HuggingFace EmogheneAkpomedaye) como una cuantización de muy bajo bit de `nvidia/parakeet-tdt-0.6b-v3`. El artefacto completo ocupa 156,2 MB, frente a los 2.508 MB del modelo original en precisión completa, lo que permite ejecutar la transcripción en local sin GPU. Deriva del modelo Parakeet TDT 0.6B v3 de NVIDIA, del que hereda tokenizer y convenciones de salida (puntuación, mayúsculas y numerales).

El problema que resuelve es doble: por un lado, reducir el coste de despliegue de un ASR de calidad razonable a un fichero de 156 MB; por otro, ofrecer una ruta de ejecución nativa en Apple silicon mediante MLX y también en CPU de Linux (x86-64 y Arm) y Windows. Según los datos del autor, promedia un 11,71 % de WER en los conjuntos de test FLEURS de los 25 idiomas, frente al 12,18 % de Parakeet Redux (178 MB) y el 13,26 % del Parakeet TDT 0.6B v3 completo. En inglés, sobre los siete conjuntos del Open ASR Leaderboard, promedia un 5,06 % de WER.

Es relevante ahora porque demuestra que una cuantización agresiva (unas 16 veces menos peso que el original) puede superar en promedio al modelo de precisión completa del que deriva en un benchmark multilingüe, con pérdidas contenidas en inglés y mejoras notables en lenguas como griego, esloveno o letón. El paquete `fermion-research` incluye además un servidor compatible con el endpoint `/v1/audio/transcriptions` de OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer); tag `parakeet_tdt_five_value`; derivada de `nvidia/parakeet-tdt-0.6b-v3` |
| Parametros totales | ~0,6 mil millones (heredados del modelo base Parakeet TDT 0.6B v3); el artefacto cuantizado pesa 156,2 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; es un modelo ASR, no se especifica la ventana de audio máxima ni la estrategia de chunking |
| Tipos de cuantizacion | Cuantización de bajo bit ("low-bit"); el autor no detalla el esquema exacto ni el número de bits. La relación 156,2 MB frente a 2.508 MB implica del orden de 2 bits por parámetro (estimación a partir de los tamaños publicados) |
| Idiomas soportados | 25: en, es, fr, de, it, pt, nl, pl, ru, uk, ro, cs, sk, bg, hr, sv, da, fi, et, lv, lt, hu, sl, mt, el |
| Licencia | CC-BY-4.0 (modelo, igual que el original); el código del CLI y del repositorio es Apache 2.0 |
| Formato de pesos | Pesos para MLX (`library_name: mlx`); no se menciona GGUF ni safetensors en la información disponible |
| Tamano del repositorio | 0,3 GB |
| Pipeline | `automatic-speech-recognition` |
| Metricas declaradas | WER (word error rate) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada del Parakeet TDT 0.6B v3 de NVIDIA, un transducer TDT (Token-and-Duration Transducer) de unos 0,6 mil millones de parámetros. La model card no describe el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo etapas de ajuste con RLHF/DPO (poco habituales en ASR). Tampoco se documenta el procedimiento de cuantización más allá de la etiqueta "low-bit" y del tamaño final del artefacto.

La innovación destacable no está en la arquitectura, sino en la compresión y en la portabilidad: el mismo fichero se ejecuta en la GPU de Apple silicon a través de MLX (`pip install "fermion-research[mlx]"`) y en CPU de Linux y Windows mediante el motor CPU del paquete `fermion-research`. El tokenizer y las convenciones de salida (puntuación, capitalización, numerales) son los del modelo original de NVIDIA, y el fichero `NOTICE` del repositorio documenta los cambios introducidos respecto a la versión base.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con un único artefacto de 156,2 MB.
- Salida con puntuación, mayúsculas y numerales según las convenciones del modelo original de NVIDIA.
- Marcas de tiempo por palabra mediante la opción `--json` del CLI (inicio y fin de cada palabra).
- Ejecución en GPU de Apple silicon vía MLX y en CPU de Linux (x86-64 y Arm) y Windows sin GPU.
- Servidor HTTP compatible con OpenAI: `fermion serve phonon-2.5 --port 8010` expone `/v1/audio/transcriptions`, lo que permite sustituir clientes que ya apuntan a la API de Whisper.
- CLI para transcripción directa de ficheros de audio (`fermion transcribe phonon-2.5 recording.wav`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio generation, diarización de hablantes ni detección automática de idioma.

## Casos de uso

- Transcripción local de reuniones en portátiles Apple silicon: el modelo se ejecuta en la GPU mediante MLX sin salir del equipo, con 156,2 MB de pesos y sin depender de servicios externos, lo que simplifica el cumplimiento de privacidad.
- Subtitulado de vídeo multilingüe: la opción `--json` proporciona tiempos de inicio y fin por palabra, suficientes para generar subtítulos con sincronización a nivel de palabra en cualquiera de los 25 idiomas soportados.
- Sustitución directa de una API de transcripción tipo Whisper: `fermion serve` expone `/v1/audio/transcriptions` con formato compatible con OpenAI, por lo que un pipeline existente solo necesita cambiar la URL base y el nombre del modelo.
- Dictado y notas de voz en aplicaciones de escritorio: al correr en CPU de Linux y Windows, el modelo puede empaquetarse dentro de una aplicación de escritorio sin requisitos de GPU ni instalación de CUDA.
- Indexación y búsqueda de archivos de audio (podcasts, grabaciones de archivo, entrevistas): la transcripción por lotes en CPU permite procesar horas de audio en servidores sin acelerador; la calidad es especialmente competitiva en griego (20,83 % de WER frente a 36,11 % del modelo completo) y esloveno (18,53 % frente a 24,70 %).
- Documentación clínica o legal dictada: el procesamiento on-device con un modelo de licencia CC-BY-4.0 permite transcribir en el puesto de trabajo sin enviar audio a terceros, siempre que se asuma el WER del idioma correspondiente.
- Prototipado e investigación en ASR multilingüe de bajo coste: el tamaño reducido y la licencia permisiva facilitan experimentos de ajuste fino o evaluación comparativa en entornos con recursos limitados.

## Benchmarks y rendimiento

WER (%) en los conjuntos de test FLEURS completos, menor es mejor. Los tres modelos se evaluaron con el mismo harness y la misma normalización de texto, según el autor.

| Idioma | Phonon-2.5 (156,2 MB) | Parakeet Redux (178 MB) | Parakeet TDT 0.6B v3 (2.508 MB) |
|---|--:|--:|--:|
| Inglés | 6,58 | 7,32 | **6,53** |
| Español | 4,80 | 4,99 | **4,69** |
| Francés | 8,12 | 9,03 | **6,61** |
| Alemán | 6,67 | 7,57 | **5,96** |
| Italiano | 5,21 | 5,12 | **4,75** |
| Portugués | 6,53 | 6,44 | **6,27** |
| Neerlandés | 9,21 | 9,45 | **7,93** |
| Polaco | 10,20 | 10,19 | **8,55** |
| Ruso | 8,67 | 9,01 | **7,21** |
| Ucraniano | 7,89 | 8,05 | **7,27** |
| Rumano | **11,88** | 11,89 | 13,13 |
| Checo | **10,40** | 11,41 | 11,93 |
| Eslovaco | 8,89 | **8,17** | 9,72 |
| Búlgaro | 13,34 | **13,02** | 13,48 |
| Croata | 12,24 | **11,43** | 13,21 |
| Sueco | **14,53** | 14,70 | 15,44 |
| Danés | 18,20 | **17,91** | 19,05 |
| Finés | 12,02 | **11,84** | 13,08 |
| Estonio | 11,91 | **10,29** | 14,34 |
| Letón | 14,92 | **14,76** | 23,66 |
| Lituano | **17,94** | 18,05 | 21,68 |
| Húngaro | 15,45 | 15,81 | **15,38** |
| Esloveno | **18,53** | 18,88 | 24,70 |
| Maltés | 17,91 | **16,02** | 20,86 |
| Griego | **20,83** | 33,25 | 36,11 |
| **Media de 25** | **11,71** | 12,18 | 13,26 |

En inglés, sobre los siete conjuntos del Open ASR Leaderboard (LibriSpeech clean y other, AMI, Earnings-22, GigaSpeech, SPGISpeech y VoxPopuli, evaluados con el código del leaderboard sobre los test completos), Phonon-2.5 promedia un 5,06 % de WER, con valores por conjunto de 1,60 / 3,41 / 9,12 / 6,72 / 8,04 / 3,31 / 3,23. En las mismas condiciones, Phonon-2 promedia 5,21 % y Phonon-2.5 English 4,82 %.

## Requisitos de hardware

- VRAM estimada: no se publican cifras. El artefacto de pesos ocupa 156,2 MB, por lo que la inferencia debería caber en unos pocos cientos de MB de memoria (estimación a partir del tamaño del fichero, no confirmada por el autor).
- GPU: no se requiere ninguna. En Apple silicon se usa la GPU integrada a través de MLX.
- CPU: soportadas Linux (x86-64 y Arm) y Windows mediante el motor CPU del paquete `fermion-research`; también macOS.
- Cabe en cualquier equipo consumer: portátiles Apple silicon, PCs de escritorio y servidores sin acelerador.
- Despliegue: CLI `fermion transcribe`, servidor `fermion serve` con endpoint compatible con OpenAI, y uso como librería Python (`fermion-research`, extra `[mlx]` para GPU en Apple silicon). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de entorno: Python 3.10 o superior (el `python3` del sistema en macOS es 3.9). En Linux, el autor recomienda instalar antes `torch` desde el índice de wheels de CPU para evitar la build con GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Idiomas | WER medio FLEURS (25 idiomas) | WER inglés (Open ASR Leaderboard, 7 conjuntos) | Licencia |
|---|---|--:|---|--:|--:|---|
| Phonon-2.5 | ~0,6 B (cuantizado low-bit) | 156,2 MB | 25 | **11,71 %** | 5,06 % | CC-BY-4.0 |
| Parakeet Redux | ~0,6 B (cuantizado low-bit) | 178 MB | 25 | 12,18 % | no disponible | no disponible en la información proporcionada |
| Parakeet TDT 0.6B v3 (NVIDIA) | 0,6 B (precisión completa) | 2.508 MB | 25 | 13,26 % | no disponible | CC-BY-4.0 |
| Phonon-2.5 English | ~0,6 B (cuantizado low-bit) | no disponible | inglés | no aplica | **4,82 %** | CC-BY-4.0 |
| Phonon-2 | no disponible | no disponible | 25 | no disponible | 5,21 % | no disponible |

Frente al modelo base, Phonon-2.5 ocupa unas 16 veces menos espacio y mejora el WER medio en FLEURS (11,71 % frente a 13,26 %), aunque pierde en inglés (6,58 % frente a 6,53 %) y en la mayoría de lenguas de Europa occidental (francés, alemán, italiano, neerlandés, polaco, ruso). Sus ventajas se concentran en lenguas con pocos recursos: griego, esloveno, letón, lituano, checo y rumano.

## Limitaciones y advertencias

- Es exclusivamente un modelo ASR: no genera texto libre, no razona, no soporta tool calling ni agentes.
- El WER es alto en varios idiomas: maltés 17,91 %, griego 20,83 %, esloveno 18,53 %, danés 18,20 % y lituano 17,94 %. Para producción en esas lenguas conviene validar con datos propios.
- El rendimiento en lenguas de Europa occidental es peor que el del modelo completo de NVIDIA (por ejemplo, francés 8,12 % frente a 6,61 %, o neerlandés 9,21 % frente a 7,93 %).
- No se documenta detección automática de idioma ni diarización de hablantes; el idioma debe gestionarse en el pipeline de entrada.
- No se especifican la ventana de audio máxima ni la estrategia de segmentación para audios largos, lo que obliga a probar el comportamiento con ficheros extensos.
- Riesgo de alucinación inherente a los modelos transducer en segmentos con silencio, ruido o solapamiento de voces; la model card no publica evaluaciones específicas en condiciones ruidosas.
- La licencia CC-BY-4.0 exige atribución; el repositorio incluye un fichero `NOTICE` con los cambios respecto al modelo base que debe conservarse. El código del CLI es Apache 2.0, licencia distinta de la de los pesos.
- El procedimiento de cuantización no está documentado (esquema, número de bits, calibración), lo que dificulta reproducir la conversión o auditar posibles degradaciones.
- El repositorio consultado (EmogheneAkpomedaye/Phonon2.5) registra 0 descargas y 0 likes en el momento de la consulta, y el autor original citado en la model card es FermionResearch; conviene verificar cuál es el canal de distribución canónico.
- No se han publicado resultados de latencia ni de throughput, datos relevantes para dimensionar un servicio en producción.

## Enlaces

- Repositorio en HuggingFace (ID consultado): https://huggingface.co/EmogheneAkpomedaye/Phonon2.5
- Repositorio original citado en la model card: https://huggingface.co/FermionResearch/Phonon-2.5
- Variante solo en inglés: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentación del CLI y del servidor: https://www.fermionresearch.com/docs/speech/
- Paquete Python en PyPI: https://pypi.org/project/fermion-research/
- Imagen de la model card: https://huggingface.co/FermionResearch/Phonon-2.5/resolve/main/phonon-2.5-card.jpg

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos trataban sobre hoteles cerca de Limoges y no se han utilizado).
