# ConwayResearch/Underdog-Bark-3.0

## Resumen

Underdog Bark 3.0 es un modelo de reconocimiento automático del habla (ASR) en inglés de 0,6 B de parámetros, publicado por ConwayResearch como un *finetune* de nvidia/parakeet-tdt-0.6b-v3. Su particularidad no es tanto la arquitectura como el empaquetado: los pesos se distribuyen en un único fichero `model.bark` de 163 MB con cuantización de baja precisión, pensado para ejecutarse en dispositivo (Apple Silicon vía MLX, CUDA o CPU) sin depender de Python en el caso del runtime nativo en Swift de Underdog.

El modelo declara un WER medio del 4,94 % sobre los siete conjuntos ingleses del Open ASR Leaderboard, lo que según el autor lo sitúa en la frontera de precisión por tamaño: supera a Phonon-2 (5,21 % con un tamaño casi idéntico), roza a Parakeet TDT 0.6B v3 (4,941 % con 2,5 GB) y supera a Whisper large-v3 (6,04 % con 9,3 GB) con una descarga 57 veces menor. Destaca especialmente en habla real con disfluencias (7,82 % en AMI, 3,15 % en DisfluencySpeech), donde transcribe literalmente lo dicho, incluidos muletillas.

Es relevante ahora porque demuestra que un modelo ASR de 163 MB puede competir con sistemas dos o tres órdenes de magnitud más grandes en WER, lo que habilita dictado, subtitulado y transcripción de reuniones totalmente locales en hardware de consumo. La contrapartida es un alcance limitado: solo inglés, sin datos publicados de puntuación, diarización ni marcas temporales, y unos benchmarks que aún no están verificados en el leaderboard oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de nvidia/parakeet-tdt-0.6b-v3 (familia Parakeet, transducer TDT); la model card no detalla la topología interna |
| Parámetros totales | 0,6 B (600 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; es un modelo de audio y no se especifica la duración máxima de audio por inferencia |
| Tipos de cuantización | Pesos de baja precisión (*low-bit*) empaquetados en `model.bark`; el esquema exacto no se documenta (163 MB para 0,6 B parámetros ≈ 2,2 bits por parámetro) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `model.bark` (contenedor propio, desempaquetado exacto vía `bark_loader.py`), pesos MLX en `mlx/`; el repo incluye además la etiqueta `coreml` |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni la composición del dataset. Lo único verificable es la relación con el modelo base: se trata de un *finetune* de nvidia/parakeet-tdt-0.6b-v3, un modelo de la familia Parakeet basado en transducer TDT (*token-and-duration transducer*), lo que implica una decodificación conjunta de tokens y duraciones en lugar de un CTC o un encoder-decoder autoregresivo puro. No se especifican número de tokens de entrenamiento, composición del corpus, ni si hubo etapas de ajuste con RLHF/DPO (poco habituales en ASR).

La innovación técnica destacable está en el empaquetado y el runtime, no en el modelo: los pesos se comprimen a un fichero de 163 MB que un runtime nativo en Swift (Underdog) desempaqueta en memoria en unos 2 segundos en Apple Silicon, garantizando que los pesos cargados son bit-idénticos a los que produce `bark_loader.py`. Underdog verifica tamaño y SHA-256 de `model.bark` y `mlx/config.json` contra valores fijados, y la inferencia se ejecuta sobre MLX. El audio nunca sale del dispositivo. En el pipeline de referencia, `transcribe` antepone 0,25 s de silencio a la señal antes de procesarla.

## Capacidades

- Transcripción de voz a texto en inglés con un WER medio declarado del 4,94 % en los siete conjuntos del Open ASR Leaderboard.
- Transcripción literal de habla espontánea: conserva muletillas, reinicios y repeticiones (3,15 % de WER en DisfluencySpeech con las muletillas contadas).
- Buen rendimiento en habla de reuniones (7,82 % en AMI) y en discurso parlamentario (2,05 % en VoxPopuli).
- Ejecución en dispositivo: MLX en Apple Silicon, CUDA, CPU y MPS mediante `bark_loader.py`.
- Runtime nativo sin Python (Swift + MLX) con desempaquetado verificado por SHA-256.
- Compatible con endpoints (`endpoints_compatible` en los tags del repo).
- No se documentan capacidad multilingüe, tool calling, salida con puntuación/mayúsculas, marcas temporales por palabra ni diarización de hablantes.
- Variante específica para dictado con limpieza de muletillas: Underdog Bark 3.0 Clean (modelo separado).

## Casos de uso

- **Dictado local en portátiles Apple Silicon**: con `mlx-audio` el modelo transcribe un minuto de audio en aproximadamente 1,5 s (41x tiempo real) en un M2, y los pesos ocupan 163 MB en disco, por lo que se puede embeber en una app de escritura sin servicio externo ni envío de audio a la nube.
- **Transcripción de reuniones y notas de voz**: el 7,82 % de WER en AMI indica que el modelo está ajustado para conversación grabada; encaja en herramientas internas que generen actas a partir de audio de sala o de videollamada.
- **Análisis de centros de llamadas**: el WER de 7,05 % en Earnings-22 (audio telefónico de presentaciones financieras) lo hace viable para indexar y buscar llamadas, con la salvedad de que no ofrece marcas temporales ni separación de hablantes.
- **Subtitulado y postproducción de vídeo en inglés**: 1,89 % en LibriSpeech clean y 4,08 % en other permiten generar subtítulos automáticos de material locutado con corrección manual mínima, integrándolo en un pipeline ffmpeg → WAV → `bark_loader.py`.
- **Investigación sobre habla disfluente**: al transcribir literalmente con muletillas (3,15 % en DisfluencySpeech), es adecuado para corpus de lingüística conversacional donde se necesita la forma verbalizada y no una versión normalizada; para lo contrario existe Bark 3.0 Clean.
- **Archivo periodístico y parlamentario**: 2,05 % en VoxPopuli lo sitúa como opción para transcribir sesiones y hemeroteca en inglés sin coste por minuto de API.
- **Accesibilidad y entrada por voz en aplicaciones de escritorio**: el binario de 163 MB y la ejecución en CPU/MPS permiten embeber ASR en herramientas de accesibilidad que deben funcionar sin conexión.
- **Procesamiento por lotes de bajo coste**: al necesitar mucha menos memoria que Parakeet TDT 0.6B v3 (2,5 GB de pesos) o Whisper large-v3 (9,3 GB), permite mayor densidad de workers por GPU en tareas de transcripción masiva.

## Benchmarks y rendimiento

Word error rate (%) sobre los siete conjuntos ingleses del Open ASR Leaderboard (versiones limpias de AMI, Earnings-22, GigaSpeech y VoxPopuli). Menor es mejor. Las filas marcadas con † son las publicadas por el leaderboard a 9 de octubre de 2026; las filas Bark usan su código de puntuación pero aún no están en el leaderboard.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| **Bark 3.0** | **163 MB** | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | **4,94** |
| Phonon-2† | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Hojo-ASR-V1† | 11.957 MB | 1,30 | 3,24 | 7,54 | 6,97 | 6,14 | 1,74 | 3,11 | 4,29 |
| Qwen3-ASR-1.7B† | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| higgs-audio-v3-stt† | 5.351 MB | 1,08 | 2,61 | 7,19 | 7,04 | 7,45 | 2,07 | 3,73 | 4,45 |
| Canary-Qwen 2.5B† | 5.119 MB | 1,23 | 2,63 | 7,91 | 6,41 | 7,80 | 1,70 | 4,14 | 4,55 |
| Granite Speech 4.1 2B† | 4.832 MB | 1,03 | 2,19 | 7,06 | 6,69 | 8,18 | 3,47 | 4,18 | 4,69 |
| Cohere Transcribe† | 4.132 MB | 0,97 | 2,05 | 7,02 | 7,88 | 7,88 | 2,74 | 5,38 | 4,85 |
| Granite Speech 5.0 470M (NC)† | 946 MB | 1,45 | 2,67 | 7,31 | 8,23 | 8,37 | 1,75 | 4,67 | 4,92 |
| Parakeet TDT 0.6B v3† | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Granite Speech 5.0 470M† | 946 MB | 1,48 | 2,71 | 7,71 | 6,75 | 8,74 | 3,22 | 4,90 | 5,07 |
| Qwen3-ASR-0.6B† | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Whisper large-v3† | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo† | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Habla disfluente (DisfluencySpeech, 250 clips de conversación no guionizada, transcripción literal con muletillas contadas):

| Modelo | WER (%) |
|---|--:|
| Bark 3.0 Pro | 2,95 |
| Bark 3.0 | 3,15 |
| Bark 3.0 Plus | 3,21 |
| Phonon-2 | 3,39 |

Nota del autor: con tres decimales y la media propia del leaderboard, Bark 3.0 Pro promedia 4,286 frente a 4,291 de Hojo-ASR-V1; Bark 3.0 queda en 4,937 frente a 4,941 de Parakeet TDT 0.6B v3. Ninguno de estos resultados ha sido verificado de forma independiente.

## Requisitos de hardware

- **Descarga en disco**: 163 MB (`model.bark`), más el código de carga (`bark_loader.py`, `bark_mlx.py`, `mlx/*`).
- **Memoria en inferencia**: no disponible de forma explícita. Como referencia, un modelo denso de 0,6 B en fp16 requiere del orden de 1,2 GB de pesos; el desempaquetado en MLX se cachea en disco tras la primera ejecución.
- **Apple Silicon**: soporte nativo vía MLX (`mlx==0.32.2`, `mlx-audio==0.5.3`); el desempaquetado tarda unos 2 s en Apple Silicon. Probado en un M2 con 41x tiempo real (un minuto de audio en ~1,5 s).
- **GPU NVIDIA**: soportado mediante `bark_loader.py` con `device="cuda"`; no se publican cifras de throughput en GPU.
- **CPU y MPS**: soportados por el loader (`"cpu"`, `"mps"`); no se publican latencias.
- **Cabe en GPU de consumo**: sí, por tamaño (163 MB de pesos). Cualquier GPU con unos pocos GB de VRAM libre debería poder ejecutarlo; no hay requisitos oficiales publicados.
- **Opciones de despliegue**: `bark_loader.py` (PyTorch/Transformers 5.19.0), `bark_mlx.py` (MLX en Apple Silicon), runtime nativo Underdog en Swift, y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son runtimes orientados a LLM de texto).
- **Latencia**: 41x tiempo real en M2 con `mlx-audio`; añade 0,25 s de silencio al inicio del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Descarga | WER medio (7 sets) | Idiomas | Licencia |
|---|---|--:|--:|---|---|
| Underdog Bark 3.0 | 0,6 B | 163 MB | 4,94 | en | CC-BY-4.0 |
| Bark 3.0 Plus (mismo autor) | no disponible | 180 MB | 4,76 | en | no disponible |
| Parakeet TDT 0.6B v3 (modelo base) | 0,6 B | 2.508 MB | 4,94 | no disponible en la información | no disponible en la información |
| Phonon-2 | no disponible | 164 MB | 5,21 | no disponible | no disponible |
| Qwen3-ASR-0.6B | 0,6 B | 1.876 MB | 5,16 | no disponible | no disponible |
| Whisper large-v3 | no disponible | 9.261 MB | 6,04 | no disponible | no disponible |

## Limitaciones y advertencias

- **Solo inglés**: el campo `language` del repo es únicamente `en`; no hay soporte multilingüe declarado.
- **Salida literal con muletillas**: el modelo transcribe lo que se dice, incluidos "um" y "uh". Para dictado limpio hay que usar la variante Bark 3.0 Clean o postprocesar.
- **Benchmarks autopublicados**: las filas Bark usan el código de puntuación del Open ASR Leaderboard, pero no están en el leaderboard; no hay verificación independiente. El margen frente a Parakeet TDT 0.6B v3 es de 0,004 puntos, dentro del ruido.
- **Rendimiento desigual por dominio**: el punto débil declarado es AMI (7,82 %), muy por encima de sus cifras en LibriSpeech o VoxPopuli; en audio de reuniones con solapamientos y micrófonos lejanos el margen frente a modelos grandes se reduce.
- **Riesgo de alucinación**: no se documenta comportamiento ante silencios largos, ruido o música; los modelos transducer pueden emitir texto espurio en segmentos no vocales. No hay datos publicados al respecto.
- **Funcionalidades ausentes**: no se documentan marcas temporales, diarización, puntuación, capitalización ni detección de idioma.
- **Licencia CC-BY-4.0**: permite uso comercial, pero exige atribución a ConwayResearch y mantiene las condiciones de la licencia del modelo base (nvidia/parakeet-tdt-0.6b-v3), cuyos términos no se detallan en la información disponible; conviene revisarlos antes de desplegar.
- **Madurez del ecosistema**: 12 descargas y 14 likes en el momento de la consulta, repo creado en octubre de 2026. Depende de versiones muy concretas (`transformers==5.19.0`, `torch==2.8.0`, `numpy==2.4.6`, `mlx==0.32.2`), lo que puede generar conflictos de dependencias en entornos existentes.
- **Runtime propietario para el mejor rendimiento**: las cifras de 41x tiempo real se refieren a MLX en Apple Silicon; en CUDA o CPU no hay cifras publicadas.
- **Sesgos**: no se publica ninguna evaluación de sesgos por acento, género, edad o variedad dialectal; los siete sets del leaderboard son mayoritariamente inglés estadounidense y británico estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0
- Variante para dictado limpio: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime Underdog: https://underdog.ai
- Open ASR Leaderboard (referencia de los benchmarks citados): no disponible en la información proporcionada.
- El resto de la búsqueda web no devolvió enlaces relevantes sobre el modelo.
