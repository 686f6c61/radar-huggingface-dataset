# ConwayResearch/Underdog-Bark-3.0-Plus

## Resumen

Underdog Bark 3.0 Plus es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por ConwayResearch, afinado a partir de nvidia/parakeet-tdt-0.6b-v3. Se presenta como el modelo abierto de menos de 1 GB con menor tasa de error en los siete conjuntos en ingles del Open ASR Leaderboard, con un promedio de 4,76 % de WER y un peso descargable de 180 MB frente a los 2.508 MB del modelo base de NVIDIA.

La propuesta central es el compromiso entre precision y tamano: el modelo declara superar en precision a Parakeet TDT 0.6B v3 (4,94 %), Qwen3-ASR-0.6B (5,16 %), Phonon-2 (5,21 %), Voxtral Small 24B (5,21 %) y Whisper large-v3 (6,04 %) con una huella mucho menor. En un Apple M2 transcribe un minuto de audio en aproximadamente 1,5 segundos (41x tiempo real) usando mlx-audio, y la aplicacion Underdog lo ejecuta de forma nativa en Swift sobre MLX sin Python, con el audio procesado en el dispositivo.

El modelo se distribuye como un unico fichero empaquetado (`model.bark`) que se desempaqueta en memoria en unos 2 segundos en Apple Silicon, con pesos identicos bit a bit a los generados por el cargador de referencia. La arquitectura interna, los datos de entrenamiento y el proceso de ajuste no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de nvidia/parakeet-tdt-0.6b-v3 (familia Parakeet TDT, transducer token-and-duration) |
| Parametros totales | 0,6B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; el autor recomienda dividir grabaciones largas en fragmentos de pocos minutos) |
| Tipos de cuantizacion | No disponible en detalle; el modelo se etiqueta como `low-bit` y se distribuye empaquetado en `model.bark` (180 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.bark` (contenedor propietario desempaquetable a MLX); repo de 0,6 GB; no se indica disponibilidad de safetensors ni GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion disponible. El modelo es un ajuste fino (`base_model_relation: finetune`) de nvidia/parakeet-tdt-0.6b-v3, un modelo de 0,6B parametros de la familia Parakeet TDT. El autor no especifica numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El elemento tecnico diferencial es el formato de distribucion y el runtime: los pesos se empaquetan en un unico fichero `model.bark` que un runtime nativo en Swift (aplicacion Underdog) desempaqueta en memoria en unos 2 segundos sobre Apple Silicon y ejecuta con MLX. El desempaquetado es exacto, con pesos identicos bit a bit a los que produce `bark_loader.py`, y la aplicacion verifica el fichero y `mlx/config.json` contra un tamano y un SHA-256 fijados. Existe tambien un cargador en Python (`bark_loader.py`) que soporta los dispositivos `cuda`, `cpu` y `mps`, y un script especifico para MLX (`bark_mlx.py`).

## Capacidades

- Transcripcion de voz a texto en ingles con salida verbatim: el modelo escribe lo que se ha dicho, incluyendo muletillas ("um", "uh"), reinicios y palabras repetidas, sin limpiar el discurso.
- Alto rendimiento en habla espontanea y desfluida: 3,21 % de WER en DisfluencySpeech, por detras de Bark 3.0 Pro (2,95 %) y Bark 3.0 (3,15 %), y por delante de Phonon-2 (3,39 %).
- Buen comportamiento en dominios especificos: 1,92 % de WER en VoxPopuli (discurso parlamentario) y 7,76 % en AMI (reuniones).
- Ejecucion en dispositivo (`on-device`) sin envio de audio a servidores: la aplicacion Underdog procesa el audio localmente.
- Inferencia acelerada en Apple Silicon mediante MLX y mlx-audio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento; es un modelo exclusivamente ASR.
- No se documenta procesamiento por lotes ni streaming; mlx-audio transcribe el fichero en una sola pasada.

## Casos de uso

- Dictado en aplicaciones de escritorio: el modelo transcribe voz a texto en ingles manteniendo literalmente lo dicho, lo que permite al usuario aplicar despues su propio postprocesado o usar la variante Underdog Bark 3.0 Clean, que elimina muletillas y arranques falsos. Su tamano de 180 MB lo hace viable como componente embebido en una app de escritorio.
- Transcripcion de reuniones en local: con 7,76 % de WER en AMI, es adecuado para generar actas o notas de reuniones siempre que el audio se divida en fragmentos de pocos minutos y se ejecute en una maquina con memoria suficiente.
- Subtitulado y transcripcion de contenido audiovisual en ingles: 1,71 % de WER en LibriSpeech clean y 3,82 % en other permiten generar subtitulos con pocas correcciones manuales en audio de estudio.
- Procesamiento de audio sin salida a la nube: al ejecutarse en el dispositivo mediante el runtime nativo de Underdog, encaja en entornos con requisitos de privacidad o cumplimiento donde el audio no puede salir del equipo.
- Transcripcion de discurso formal e institucional: 1,92 % en VoxPopuli lo hace apropiado para actas parlamentarias, ponencias y grabaciones de oratoria leida.
- Prototipado rapido en Python sobre GPU o CPU: `bark_loader.py` permite cargar el modelo con `device="cuda"`, `"cpu"` o `"mps"` y obtener la transcripcion en pocas lineas, util para validar pipelines ASR antes de integrar un modelo mayor.
- Preprocesado para pipelines de analitica de voz: transcripcion de llamadas o notas de voz en ingles como paso previo a busqueda, resumen o clasificacion con otro modelo.

## Benchmarks y rendimiento

Tasas de error por palabra (WER, %), menor es mejor, sobre los conjuntos de test completos de los siete sets en ingles del Open ASR Leaderboard (versiones limpias de AMI, Earnings-22, GigaSpeech y VoxPopuli). Los datos de Bark 3.0 Plus y del resto de la familia Bark usan el codigo de scoring del leaderboard pero no estan publicados en el leaderboard; las filas marcadas con † corresponden a la fila publicada por el leaderboard a 9 de octubre de 2026.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Promedio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| **Bark 3.0 Plus** | **180 MB** | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | **4,76** |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2† | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3† | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Qwen3-ASR-0.6B† | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Granite Speech 5.0 470M (NC)† | 946 MB | 1,45 | 2,67 | 7,31 | 8,23 | 8,37 | 1,75 | 4,67 | 4,92 |
| Whisper large-v3† | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo† | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Habla desfluida (DisfluencySpeech, 250 clips de conversacion no guionizada, evaluados contra transcripcion verbatim contando muletillas):

| Modelo | WER (%) |
|---|---:|
| Bark 3.0 Pro | 2,95 |
| Bark 3.0 | 3,15 |
| **Bark 3.0 Plus** | **3,21** |
| Phonon-2 | 3,39 |

Rendimiento de inferencia declarado: un minuto de audio transcrito en aproximadamente 1,5 segundos en un Apple M2 con mlx-audio (41x tiempo real). No se publican cifras de throughput ni latencia para GPU NVIDIA.

## Requisitos de hardware

- Peso descargable de 180 MB (`model.bark`) sobre un repo de 0,6 GB; el modelo completo tiene 0,6B parametros, por lo que la huella en memoria es reducida en comparacion con modelos ASR de 2 a 9 GB.
- No se publica una cifra de VRAM recomendada. El dato disponible es que un fichero de 10 minutos procesado en una sola pasada con mlx-audio en un Apple M2 de 16 GB alcanzo un pico de unos 15 GB, porque el consumo crece con la longitud del audio.
- Recomendacion explicita del autor: dividir grabaciones largas en fragmentos de pocos minutos en Macs de 8 o 16 GB.
- GPU recomendadas: no disponibles. El cargador Python admite `device="cuda"`, `"cpu"` y `"mps"`, pero no se especifican modelos de GPU concretos ni requisitos minimos para CUDA.
- Cabe en hardware de consumo por tamano de pesos; la limitacion practica es la memoria necesaria para audios largos, no el tamano del modelo.
- Opciones de despliegue: runtime nativo Swift de Underdog sobre MLX (Apple Silicon), `bark_mlx.py` con mlx-audio 0.5.3 y mlx 0.32.2, y `bark_loader.py` con transformers 5.19.0, torch 2.8.0, constriction 0.5.0, numpy 2.4.6, soundfile 0.14.0, soxr 1.1.0 y librosa 0.11.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Libreria declarada en HuggingFace: `transformers`; el tag `coreml` aparece en los metadatos, aunque la documentacion describe ejecucion via MLX.
- Latencia: aproximadamente 1,5 segundos por minuto de audio en Apple M2 (41x tiempo real). No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio (7 sets EN) | AMI | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **Underdog Bark 3.0 Plus** | 0,6B | 180 MB | **4,76** | 7,76 | CC BY 4.0 | HuggingFace (ConwayResearch) |
| Bark 3.0 | No disponible | 163 MB | 4,94 | 7,82 | No disponible en la informacion | HuggingFace (misma familia) |
| Parakeet TDT 0.6B v3 | 0,6B | 2.508 MB | 4,94 | 9,42 | No disponible en la informacion | HuggingFace (nvidia), modelo base |
| Qwen3-ASR-0.6B | 0,6B | 1.876 MB | 5,16 | 9,33 | No disponible en la informacion | HuggingFace |
| Whisper large-v3-turbo | No disponible | 1.618 MB | 6,58 | 13,88 | No disponible en la informacion | HuggingFace (OpenAI) |

Frente a su modelo base, Bark 3.0 Plus reduce el WER medio de 4,94 % a 4,76 % y el de AMI de 9,42 % a 7,76 % con una decima parte del tamano de descarga. Frente a Whisper large-v3-turbo, la mejora es de 1,82 puntos porcentuales de WER medio y de 6,12 puntos en AMI, con un fichero 9 veces menor. El coste de esta reduccion es que solo soporta ingles.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); no hay soporte multilingue documentado.
- Los resultados de la familia Bark no estan publicados en el Open ASR Leaderboard: usan su codigo de scoring, pero son cifras declaradas por el autor y no verificadas de forma independiente por el leaderboard.
- La memoria crece con la longitud del audio en mlx-audio (pico de unos 15 GB para 10 minutos en un M2 de 16 GB); es obligatorio trocear grabaciones largas.
- El modelo transcribe literalmente, incluidas muletillas y repeticiones. Para dictado limpio hay que usar la variante Bark 3.0 Clean o aplicar postprocesado.
- Alucinaciones y errores en audio con ruido, acentos no nativos o solapamiento de hablantes: no se publican datos especificos, pero el WER en AMI (7,76 %) y GigaSpeech (7,77 %) es notablemente superior al de audio limpio (1,71 % en LS clean).
- Licencia CC BY 4.0: permite uso comercial con atribucion; no se documentan restricciones adicionales, pero conviene revisar la NOTICE incluida en el repo.
- Dependencias con versiones fijadas (transformers 5.19.0, torch 2.8.0, mlx 0.32.2, mlx-audio 0.5.3): la integracion en entornos con otras versiones puede requerir aislamiento.
- El formato `model.bark` es propietario; no se indica conversion a safetensors o GGUF, lo que limita su uso en stacks de inferencia estandar.
- No se documentan sesgos por variedad dialectal, genero o edad; al entrenarse solo en ingles, el rendimiento fuera de esa lengua no esta caracterizado.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Variante con limpieza de muletillas (Bark 3.0 Clean): https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo base (NVIDIA Parakeet TDT 0.6B v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime y aplicacion Underdog: https://underdog.ai
- Open ASR Leaderboard (referencia de los conjuntos de evaluacion): no disponible en los enlaces proporcionados

Nota: los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo (corresponden a herramientas y camaras Insta360), por lo que no se han incorporado a la ficha.
