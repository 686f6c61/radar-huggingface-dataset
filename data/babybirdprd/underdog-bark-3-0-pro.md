# babybirdprd/Underdog-Bark-3.0-Pro

## Resumen

Underdog Bark 3.0 Pro es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por babybirdprd, un fine-tune de `nvidia/parakeet-tdt-0.6b-v3`. Con 627 millones de parámetros y un peso de 1,25 GB en bf16, se presenta como el modelo de pesos abiertos con menor tasa de error de palabra (WER) en los siete conjuntos de evaluación en inglés del Open ASR Leaderboard, con una media del 4,29 %. La arquitectura subyacente es un modelo Parakeet con decodificación TDT (Token-and-Duration Transducer), empaquetado en formato estándar de `transformers` sin código personalizado.

El modelo compite directamente con alternativas mucho más grandes, como Hojo-ASR-V1 (12 GB), Qwen3-ASR-1.7B (4,7 GB) o Canary-Qwen 2.5B (5,1 GB), y según la model card supera también a APIs comerciales de transcripción como OpenAI GPT-Transcribe o AssemblyAI Universal-3.5 Pro. Su punto fuerte es la relación entre precisión y tamaño: obtiene resultados de frontera con una fracción del peso de sus competidores.

La relevancia actual del modelo radica en dos factores: por un lado, la familia Bark 3.0 cubre un rango de 163 MB a 1,25 GB manteniendo la frontera de precisión en cada tamaño; por otro, incluye soporte de despliegue nativo en Apple Silicon mediante Core ML (GPU y ANE) y un runtime Swift con MLX, lo que permite inferencia local sin Python y sin enviar audio a servidores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), transformer encoder-decoder con decodificacion TDT |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (bf16) y Core ML (coreml/) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Tamano del repo | 2,5 GB |
| Pipeline | automatic-speech-recognition |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `nvidia/parakeet-tdt-0.6b-v3`, que emplea una arquitectura Parakeet con decodificacion TDT (Token-and-Duration Transducer). Este esquema predice conjuntamente el token de salida y su duracion, lo que permite un alineamiento mas eficiente que los transductores convencionales y reduce el coste de decodificacion en audio largo. El modelo se carga como un modelo estándar de `transformers` sin requerir código personalizado, lo que simplifica su integracion en pipelines existentes.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el fine-tune se realizo sobre el modelo base de NVIDIA y que los pesos se publican en bf16 a plena precision. Una innovacion destacable del ecosistema es el runtime nativo en Swift con MLX para Apple Silicon, que carga directamente `model.safetensors` y lee el vocabulario desde `mlx/config.json`, ademas del paquete Core ML que reparte la computacion entre GPU, ANE y CPU.

## Capacidades

- Reconocimiento automático del habla (ASR) en ingles con salida de transcripcion literal.
- Transcripcion de habla disfluente: conserva muletillas ("um", "uh"), reinicios y repeticiones en lugar de limpiarlas, con un WER del 2,95 % en DisfluencySpeech.
- Extraccion de caracteristicas (tag `feature-extraction`).
- Inferencia local en Apple Silicon mediante Core ML (GPU y ANE) y runtime Swift con MLX, sin Python.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion de reuniones y actas: con un WER del 7,16 % en AMI, el modelo es adecuado para generar transcripciones de reuniones multiparticipe en ingles, con la ventaja de que preserva las disfluencias si se necesita una transcripcion literal para analisis posterior.
- Subtitulado y postproduccion de audio: la transcripcion literal con muletillas incluidas resulta util para subtitulos que reflejen el habla real, y el bajo WER en LS clean (1,38 %) lo hace apto para contenido grabado en estudio.
- Analisis de llamadas de resultados financieros: con un WER del 5,65 % en Earnings-22, el modelo es el mejor de su categoria en este dominio y puede emplearse para transcribir earnings calls y alimentar pipelines de analisis de sentimiento o extraccion de entidades.
- Transcripcion de discursos parlamentarios y debates: el 1,70 % en VoxPopuli lo posiciona como la mejor opcion abierta para audio legislativo, util para archivos parlamentarios y busqueda full-text sobre intervenciones.
- Asistentes de voz en dispositivo: el runtime Core ML con GPU/ANE y el runtime Swift con MLX permiten desplegar ASR local en Macs Apple Silicon sin enviar audio a la nube, lo que encaja en aplicaciones de privacidad estricta (sanidad, legal, grabaciones personales).
- Investigacion en ASR y evaluacion de modelos: al ser un fine-tune de Parakeet con pesos abiertos y licencia CC-BY-4.0, sirve como linea base reproducible para experimentos de adaptacion de dominio o comparativas de WER.
- Pipelines de transcripcion por lotes en servidores con CUDA: los pesos bf16 en safetensors se cargan con `transformers` estándar y pueden servirse con frameworks de inferencia habituales en GPU.

## Benchmarks y rendimiento

Resultados de WER (%) en los siete conjuntos en ingles del Open ASR Leaderboard (menor es mejor):

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Hojo-ASR-V1 | 11.957 MB | 1,30 | 3,24 | 7,54 | 6,97 | 6,14 | 1,74 | 3,11 | 4,29 |
| Qwen3-ASR-1.7B | 4.699 MB | 1,26 | 2,94 | 8,31 | 5,84 | 7,22 | 2,57 | 2,85 | 4,43 |
| higgs-audio-v3-stt | 5.351 MB | 1,08 | 2,61 | 7,19 | 7,04 | 7,45 | 2,07 | 3,73 | 4,45 |
| Canary-Qwen 2.5B | 5.119 MB | 1,23 | 2,63 | 7,91 | 6,41 | 7,80 | 1,70 | 4,14 | 4,55 |
| Granite Speech 4.1 2B | 4.832 MB | 1,03 | 2,19 | 7,06 | 6,69 | 8,18 | 3,47 | 4,18 | 4,69 |
| Cohere Transcribe | 4.132 MB | 0,97 | 2,05 | 7,02 | 7,88 | 7,88 | 2,74 | 5,38 | 4,85 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Segun la model card, con tres decimales Bark 3.0 Pro promedia 4,286 frente a 4,291 de Hojo-ASR-V1. Las filas de Bark usan el codigo de puntuacion del leaderboard pero no estan publicadas en el. Resultados adicionales en DisfluencySpeech (habla disfluente, WER %): Bark 3.0 Pro 2,95; Bark 3.0 3,15; Bark 3.0 Plus 3,21; Phonon-2 3,39.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,25 GB de pesos en bf16, mas overhead de activaciones y decodificacion; no se publican cifras exactas de VRAM total.
- GPU recomendadas: no se especifican en la informacion disponible; en el ecosistema CUDA se usan los pesos bf16 originales.
- Apple Silicon: soporte nativo mediante Core ML (GPU y ANE) y runtime Swift con MLX; probado en un M5 Max con macOS 15 o superior y Swift 6.2 o superior.
- Consumer GPU: el tamano de 0,6B parametros sugiere que cabe en GPUs de consumo, pero no se documentan pruebas concretas en RTX 4090 u otras.
- Opciones de despliegue: `transformers` estándar (sin codigo personalizado), Core ML en Mac, runtime Swift con MLX, y endpoints compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio | Licencia | Idiomas |
|---|--:|--:|--:|---|---|
| Bark 3.0 Pro | 0,63B | 1.254 MB | 4,29 | CC-BY-4.0 | en |
| Qwen3-ASR-1.7B | 1,7B | 4.699 MB | 4,43 | no disponible en la informacion | no disponible en la informacion |
| Canary-Qwen 2.5B | 2,5B | 5.119 MB | 4,55 | no disponible en la informacion | no disponible en la informacion |
| Whisper large-v3 | no disponible | 9.261 MB | 6,04 | no disponible en la informacion | multilingue |
| Parakeet TDT 0.6B v3 (base) | 0,6B | 2.508 MB | 4,94 | no disponible en la informacion | en |

Bark 3.0 Pro ofrece la mejor media de WER con el menor tamano de descarga entre los modelos comparados, a excepcion de Hojo-ASR-V1, que empata en media (4,29) pero pesa casi diez veces mas (11.957 MB).

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para transcripcion multilingue.
- No se documentan sesgos especificos, pero al ser un modelo entrenado principalmente con datos en ingles puede presentar peor rendimiento con acentos no nativos o variedades dialectales no representadas.
- Riesgo de alucinacion inherente a los modelos ASR: puede generar texto plausible en segmentos de silencio, ruido o audio de baja calidad.
- La transcripcion es literal e incluye muletillas; si se necesita texto limpio para produccion, requiere un postprocesado.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base `nvidia/parakeet-tdt-0.6b-v3` y de los datasets de entrenamiento.
- Los resultados de benchmarks de Bark no estan publicados aun en el Open ASR Leaderboard; la comparativa usa el codigo de puntuacion del leaderboard pero no ha sido validada externamente.
- No se documentan cuantizaciones alternativas ni soporte para vLLM, llama.cpp u otros runners fuera de `transformers`, Core ML y el runtime Swift.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/babybirdprd/Underdog-Bark-3.0-Pro
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Underdog: https://underdog.ai
- Open ASR Leaderboard: no disponible en la informacion proporcionada
