# ConwayResearch/Underdog-Bark-3.0-Pro

## Resumen

Underdog Bark 3.0 Pro es un modelo de reconocimiento automático del habla (ASR) en inglés de 627.057.286 parámetros (~0,63 B) desarrollado por ConwayResearch, obtenido por ajuste fino del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. Emplea una arquitectura TDT (Token-and-Duration Transducer), propia de la familia Parakeet, y se distribuye en `transformers` sin código personalizado, en safetensors bf16 (1,25 GB de pesos) y con un paquete Core ML independiente para Apple Silicon.

Su relevancia está en la relación precisión/tamaño: según la model card del autor, promedia un 4,29 % de WER (4,286 % con el código de puntuación del Open ASR Leaderboard) en los siete conjuntos ingleses de ese leaderboard, frente al 4,291 % de Hojo-ASR-V1, que pesa 11.957 MB. El modelo declara además el mejor resultado entre modelos abiertos en habla parlamentaria (1,70 % en VoxPopuli) y en llamadas de resultados empresariales (5,65 % en Earnings-22).

Es un modelo monolingüe (inglés), con licencia CC-BY-4.0, orientado a transcripción de precisión y a ejecución local en Mac mediante Core ML (GPU/ANE) o mediante el runtime nativo en Swift de Underdog con MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), familia Parakeet; encoder + decoder con predicción conjunta de token y duración |
| Parametros totales | 627.057.286 (~0,63 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica ventana de audio ni límite de tokens) |
| Tipos de cuantizacion | bf16 a precisión completa (1,25 GB); paquete Core ML aparte en `coreml/`; no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (bf16) en la raíz del repositorio; paquete Core ML en `coreml/` con runtime en Swift |

| Parametro | Valor |
|---|---|
| ID en HuggingFace | ConwayResearch/Underdog-Bark-3.0-Pro |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (relación: finetune) |
| Biblioteca | transformers |
| Tamaño del repositorio | 2,5 GB |
| Descargas / likes | 332 / 13 |
| Fecha de creación | 2026-10-15 |
| Etiquetas relevantes | `speech-to-text`, `asr`, `stt`, `parakeet`, `tdt`, `feature-extraction`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer), una variante de RNN-Transducer en la que el predictor emite simultáneamente el token y su duración, lo que permite saltar fotogramas del encoder y reducir el coste de decodificación sin sacrificar alineamiento. Se apoya en el checkpoint `nvidia/parakeet-tdt-0.6b-v3` y se distribuye como ajuste fino del mismo; la model card no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

El autor sí documenta el comportamiento en habla disfluente: en el conjunto de test DisfluencySpeech (250 clips de conversación no guionizada con muletillas, reinicios y repeticiones), puntuado contra transcripciones verbatim con las muletillas contadas, el modelo obtiene un 2,95 % de WER. Es decir, transcribe literalmente lo dicho, incluidas las vacilaciones, en lugar de normalizar el texto. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

En el plano de despliegue, la arquitectura se ofrece por tres vías: `transformers` estándar sin código personalizado, un paquete Core ML con runner en Swift que usa GPU o ANE para las operaciones del encoder compatibles y CPU para preprocesado y decodificación, y un runtime nativo en Swift de Underdog sobre MLX que carga `model.safetensors` directamente en Apple Silicon y lee el vocabulario de `mlx/config.json`.

## Capacidades

- Transcripción de voz a texto en inglés con fidelidad literal, incluyendo muletillas y reinicios (2,95 % de WER en DisfluencySpeech).
- Reconocimiento robusto en dominios concretos: habla parlamentaria (VoxPopuli, 1,70 % de WER), llamadas de resultados (Earnings-22, 5,65 %) y reuniones (AMI, 7,16 %).
- Extracción de características (`feature-extraction`), además de la tarea principal de ASR.
- Ejecución 100 % local: el audio no sale del dispositivo en la ruta Core ML/MLX, según el autor.
- Inferencia en Apple Silicon usando GPU o ANE, y en Windows/Linux con CUDA sobre los pesos bf16 originales.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio-vision, traducción ni cambio de idioma. El modelo es monolingüe inglés.
- No se especifica en la información disponible si el modelo produce puntuación, mayúsculas, marcas de tiempo o diarización de hablantes.

## Casos de uso

- Actas y notas de reuniones: con un 7,16 % de WER en AMI, el modelo está pensado para transcribir reuniones multipartícipe en las que el vocabulario es coloquial y el solapamiento de turnos frecuente; su salida literal ayuda a auditar quién dijo qué antes de un post-procesado con un LLM.
- Transcripción de sesiones parlamentarias e institucionales: el 1,70 % en VoxPopuli lo sitúa como la mejor opción abierta declarada para discurso formal leído o semiformal, típico de hemiciclos, ruedas de prensa y comparecencias.
- Análisis de llamadas de resultados empresariales: el 5,65 % en Earnings-22 permite alimentar pipelines de analítica financiera (búsqueda sobre transcripciones, extracción de guidance, comparación interanual de discursos) con menos errores en cifras y nombres propios que las alternativas abiertas comparadas.
- Investigación cualitativa y entrevistas: el 2,95 % en habla disfluente con transcripción verbatim es adecuado para ciencias sociales, estudios de usuario o entrevistas clínicas donde las vacilaciones son señal y no ruido.
- Dictado y notas de voz en local en Mac: con 1,25 GB de pesos en bf16 y el paquete Core ML, se puede integrar en una app de macOS 15 o superior que use GPU/ANE y mantenga el audio en el dispositivo, sin depender de APIs externas.
- Pseudo-etiquetado de corpus de audio a gran escala: dado su tamaño reducido y su precisión, sirve para generar transcripciones de partida en la construcción de datasets de entrenamiento o para evaluar sistemas ASR propios.
- Subtitulado y accesibilidad en directo: la baja latencia esperable de un modelo de 0,63 B en GPU consumer permite transcribir streams en inglés; conviene validar con datos propios antes de producción, ya que no se publican cifras de latencia.

## Benchmarks y rendimiento

WER (%), menor es mejor, sobre los conjuntos de test completos de los siete conjuntos ingleses del Open ASR Leaderboard (versiones limpias de AMI, Earnings-22, GigaSpeech y VoxPopuli). Las filas marcadas con † son las publicadas por el leaderboard a 9 de octubre de 2026; las filas Bark usan su código de puntuación y todavía no figuran en el leaderboard.

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **Bark 3.0 Pro** | **1.254 MB** | 1,38 | 3,11 | 7,16 | **5,65** | 7,46 | 3,54 | **1,70** | **4,29** |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Hojo-ASR-V1† | 11.957 MB | 1,30 | 3,24 | 7,54 | 6,97 | **6,14** | 1,74 | 3,11 | 4,29 |
| Qwen3-ASR-1.7B† | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| higgs-audio-v3-stt† | 5.351 MB | 1,08 | 2,61 | 7,19 | 7,04 | 7,45 | 2,07 | 3,73 | 4,45 |
| Canary-Qwen 2.5B† | 5.119 MB | 1,23 | 2,63 | 7,91 | 6,41 | 7,80 | **1,70** | 4,14 | 4,55 |
| Granite Speech 4.1 2B† | 4.832 MB | 1,03 | 2,19 | 7,06 | 6,69 | 8,18 | 3,47 | 4,18 | 4,69 |
| Cohere Transcribe† | 4.132 MB | **0,97** | **2,05** | **7,02** | 7,88 | 7,88 | 2,74 | 5,38 | 4,85 |
| Parakeet TDT 0.6B v3† | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Whisper large-v3† | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo† | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Con tres decimales y el promedio propio del leaderboard, el autor reporta 4,286 para Bark 3.0 Pro frente a 4,291 para Hojo-ASR-V1.

Habla disfluente (DisfluencySpeech, 250 clips, transcripción verbatim con muletillas contadas):

| Modelo | WER (%) |
|---|--:|
| Bark 3.0 Pro | **2,95** |
| Bark 3.0 | 3,15 |
| Bark 3.0 Plus | 3,21 |
| Phonon-2 | 3,39 |

## Requisitos de hardware

- Pesos en bf16: 1,25 GB. VRAM estimada para inferencia: del orden de 2-3 GB incluyendo activaciones y overhead del runtime para clips cortos; aumenta con la longitud del audio y el tamaño de lote. Cifra no publicada por el autor, es una estimación a partir del tamaño de los pesos.
- GPU consumer: sí cabe con holgura en cualquier GPU con 8 GB o más (RTX 3060, 4060, 4070, 4090). En Windows/Linux se usa la ruta CUDA con los safetensors bf16 de la raíz del repositorio.
- Apple Silicon: ruta Core ML con GPU o ANE para las operaciones de encoder compatibles y CPU para preprocesado y decodificación. Requiere macOS 15 o superior y Swift 6.2 o superior (Xcode o Command Line Tools). Probado en un M5 Max. También existe la ruta nativa en Swift con MLX de Underdog, que mantiene los pesos en bf16 tal como se publican.
- Despliegue: `transformers` (modelo estándar, sin código remoto), runtime Core ML incluido en `runtime/coreml` y runtime Swift/MLX de Underdog. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Descarga selectiva: conviene usar `--include 'coreml/*'` o los safetensors de la raíz según la plataforma, para no bajar ambos formatos (el repositorio completo son 2,5 GB).
- Latencia y throughput: no disponibles. La model card no publica RTF ni tokens por segundo en ninguna de las dos rutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Descarga | WER medio (7 sets EN) | Idiomas | Licencia |
|---|---|--:|--:|---|---|
| Underdog Bark 3.0 Pro | 627 M | 1.254 MB | 4,29 | inglés | CC-BY-4.0 |
| Hojo-ASR-V1 | no disponible | 11.957 MB | 4,29 | inglés (en la tabla) | no disponible |
| Qwen3-ASR-1.7B | 1,7 B (por denominación) | 4.699 MB | 4,43 | no disponible | no disponible |
| Canary-Qwen 2.5B | 2,5 B (por denominación) | 5.119 MB | 4,55 | no disponible | no disponible |
| Parakeet TDT 0.6B v3 (base) | 0,6 B | 2.508 MB | 4,94 | no disponible | no disponible |
| Whisper large-v3 | no disponible | 9.261 MB | 6,04 | multilingüe (no detallado) | no disponible |

Lectura de la comparativa: Bark 3.0 Pro iguala en media a Hojo-ASR-V1 con aproximadamente una décima parte del peso descargable, y supera a Qwen3-ASR-1.7B, Canary-Qwen 2.5B, Granite Speech 4.1 2B, Cohere Transcribe y Whisper large-v3 en la media de los siete conjuntos, aunque pierde frente a Cohere Transcribe en LS clean y LS other, frente a Canary-Qwen en SPGISpeech y frente a Hojo en GigaSpeech. La información disponible no incluye datos de licencia ni de idiomas del resto de modelos, salvo el caso marcado como no comercial en la tabla original (Granite Speech 5.0 470M NC).

## Limitaciones y advertencias

- Monolingüe: solo inglés (`en`). No hay soporte declarado de otros idiomas, traducción ni cambio de código.
- Las cifras de benchmarks proceden de la model card del autor y usan el código de puntuación del Open ASR Leaderboard, pero el modelo aún no figura en el leaderboard; no hay verificación independiente publicada.
- La transcripción es verbatim: incluye muletillas y reinicios. Si el producto necesita texto limpio y legible, hará falta un post-procesado explícito.
- No se documenta la salida de puntuación, mayúsculas, marcas de tiempo ni diarización. Conviene validar el formato de salida antes de integrarlo en pipelines de subtitulado.
- Riesgo de alucinación en audio con ruido, silencios largos o solapamiento de hablantes: es un comportamiento habitual en modelos transducer y la model card no publica métricas específicas de ese escenario.
- Sesgos: no se publica información sobre composición del dataset de ajuste fino ni sobre evaluación de sesgos por acento, género, edad o variedad dialectal. Los siete conjuntos de evaluación son en su mayoría inglés estadounidense formal o semiformal.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a ConwayResearch y mantiene la cláusula de ausencia de garantías. Revisar el fichero `NOTICE` incluido en el repositorio antes de redistribuir.
- Requisitos de plataforma estrictos en la ruta Apple: macOS 15+ y Swift 6.2+ para el runner Core ML.
- Sin datos de latencia, throughput ni comportamiento con audio de muy larga duración; para streams largos habrá que trocear el audio y gestionar el contexto entre segmentos por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Underdog (runtime nativo en Swift con MLX): https://underdog.ai
- Open ASR Leaderboard: referenciado en la model card como fuente de las filas marcadas con †; la información proporcionada no incluye su URL.
