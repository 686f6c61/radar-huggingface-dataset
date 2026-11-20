# FermionResearch/Phonon-2.5-English

## Resumen

Phonon-2.5 English es un modelo de reconocimiento automático del habla (ASR) para inglés desarrollado por FermionResearch, derivado por cuantización del modelo NVIDIA Parakeet TDT 0.6B v3. Se distribuye como un artefacto de 157,6 MB que integra pesos de baja precisión y un motor de inferencia propio, de modo que el mismo fichero se ejecuta tanto en GPU de Apple Silicon mediante MLX como en CPU de Linux (x86-64 y Arm) y Windows, sin necesidad de GPU dedicada.

El modelo resuelve el problema del despliegue de ASR de calidad en entornos sin acelerador: frente a los 2.508 MB del Parakeet TDT 0.6B v3 original, Phonon-2.5 English reduce el peso en más de un orden de magnitud manteniendo un error de palabra medio del 4,82 % en los siete conjuntos en inglés del Open ASR Leaderboard, mejor que el 4,94 % de Underdog Bark 3.0 y el 5,21 % de Phonon-2. Es relevante ahora porque cubre la demanda de transcripción en local (dictado, subtitulado, búsqueda y cumplimiento normativo) con una licencia permisiva CC-BY-4.0 y una interfaz compatible con OpenAI.

La arquitectura subyacente es la del modelo base: un sistema TDT (Token-and-Duration Transducer) con 0,6 mil millones de parámetros, adaptado a inferencia de baja precisión. La model card no detalla la longitud de contexto en tokens ni el número de capas del codificador; esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) heredada de NVIDIA Parakeet TDT 0.6B v3; pesos de baja precisión ejecutados con MLX (Apple Silicon) o motor CPU propio |
| Parametros totales | 0,6 mil millones (modelo base); el artefacto distribuido pesa 157,6 MB |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de baja precisión (low-bit); el número exacto de bits no se especifica en la información disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 (pesos); el código de la CLI y del repositorio es Apache 2.0 |
| Formato de pesos | no disponible (empaquetado propio en el repositorio de 0,3 GB; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Phonon-2.5 English no entrena un modelo desde cero: es una cuantización del checkpoint NVIDIA Parakeet TDT 0.6B v3, un transducer TDT que combina un codificador acústico con un predictor y un decodificador conjunto que emite simultáneamente tokens y duraciones. La model card indica que el tokenizador y las convenciones de salida (puntuación, uso de mayúsculas y numerales) son los del original, y que el fichero `NOTICE` del repositorio documenta los cambios introducidos por FermionResearch.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste fino adicional, RLHF o DPO; tampoco se describen innovaciones de decodificación más allá de la propia formulación TDT. La innovación práctica del lanzamiento es el empaquetado: un único artefacto de 157,6 MB con motor de inferencia multiplataforma, decodificación con marcas de tiempo por palabra y un servidor compatible con el endpoint `/v1/audio/transcriptions` de OpenAI.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación, uso de mayúsculas y numerales según las convenciones del modelo base.
- Salida con marcas de tiempo por palabra (inicio y fin) mediante la opción `--json` de la CLI.
- Inferencia en GPU de Apple Silicon a través de MLX y en CPU de Linux (x86-64 y Arm) y Windows con el mismo fichero.
- Servidor HTTP local compatible con la API de transcripciones de OpenAI (`fermion serve phonon-2.5-en --port 8010`).
- Ejecución en local sin conexión ni GPU dedicada, adecuada para flujos con requisitos de privacidad.
- No soporta tool calling, razonamiento multi-paso, visión, audio de entrada distinto de voz ni modo de pensamiento: es un modelo puramente ASR.
- Capacidad multilingüe limitada al inglés; para 25 idiomas el autor remite a Phonon-2.5.

## Casos de uso

- Dictado en local para desarrolladores y profesionales: la CLI `fermion transcribe phonon-2.5-en recording.wav` procesa audio en el propio portátil con Apple Silicon o CPU, sin enviar grabaciones a servicios externos, lo que encaja en entornos con datos sensibles.
- Subtitulado y transcripción con sincronización: la salida `--json` con tiempos de inicio y fin por palabra permite generar subtítulos alineados para vídeo corporativo, formación interna o archivos de reuniones.
- Servicio de transcripción interno: `fermion serve` expone un endpoint compatible con OpenAI, de modo que aplicaciones ya integradas con la API de Whisper pueden apuntar a la instancia local cambiando la URL base.
- Búsqueda y recuperación sobre archivos de audio: al transcribir en lote reuniones, llamadas o pódcasts en inglés, el texto resultante alimenta índices de búsqueda sin coste por minuto de API.
- Cumplimiento y auditoría: en sectores regulados donde el audio no puede salir de la infraestructura propia, el modelo se ejecuta en CPU estándar de servidores Linux, lo que simplifica la justificación del tratamiento de datos.
- Herramientas de accesibilidad: transcripción en tiempo casi real de clases, charlas o vídeos en inglés en equipos de sobremesa sin GPU, con un artefacto de 157,6 MB que se distribuye junto a la aplicación.
- Prototipado rápido de pipelines ASR: su reducido tamaño permite incluir el modelo en imágenes de contenedor o entornos de CI para pruebas de regresión de transcripción sin aprovisionar GPUs.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %, menor es mejor) en los siete conjuntos en inglés del Open ASR Leaderboard, según la model card:

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Phonon-2.5 English | 157,6 MB | 1,64 | 3,56 | 8,76 | 6,22 | 7,99 | 3,31 | 2,28 | 4,82 |
| Phonon-2.5 (25 idiomas) | 156,2 MB | 1,60 | 3,41 | 9,12 | 6,72 | 8,04 | 3,31 | 3,23 | 5,06 |
| Phonon-2 | 158 MB | 1,72 | 3,92 | 9,37 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Underdog Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,19 | 4,96 |
| Parakeet Redux | 178 MB | 1,94 | 4,35 | 9,16 | 7,90 | 8,62 | 4,01 | 3,87 | 5,69 |

Nota de la model card: la fila de Parakeet TDT 0.6B v3 es la publicada por el Open ASR Leaderboard; el resto se puntuó con su código sobre los conjuntos de test completos, con Earnings-22 como conjunto fragmentado del leaderboard, y la fila de Phonon-2 es la publicada en su lanzamiento. No se han publicado datos de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso CPU; en Apple Silicon la inferencia se ejecuta en la GPU unificada a través de MLX. El artefacto de 157,6 MB es el límite inferior práctico del consumo de memoria de pesos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de Linux (x86-64 y Arm) y Windows, y en GPU de Apple Silicon vía MLX.
- GPU de consumo: no se documenta soporte de CUDA ni de GPUs NVIDIA o AMD; la ruta acelerada indicada es exclusivamente Apple Silicon.
- Despliegue: paquete `fermion-research` (Python 3.10 o superior), CLI `fermion transcribe` y servidor `fermion serve` con endpoint compatible con OpenAI. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER medio (7 sets EN) | Licencia | Tamaño | Ejecución |
|---|---|---|---|---|---|---|
| Phonon-2.5 English | 0,6 B (cuantizado) | inglés | 4,82 % | CC-BY-4.0 | 157,6 MB | Apple Silicon (MLX) y CPU Linux/Windows |
| Phonon-2.5 | 0,6 B (cuantizado) | 25 idiomas | 5,06 % | CC-BY-4.0 | 156,2 MB | Apple Silicon (MLX) y CPU Linux/Windows |
| Underdog Bark 3.0 | no disponible | no disponible | 4,94 % | no disponible | 163 MB | no disponible |
| Parakeet TDT 0.6B v3 | 0,6 B | multilingüe (v3) | 4,96 % | no disponible en la información | 2.508 MB | requiere acelerador; no detallado |

Phonon-2.5 English mejora a Phonon-2 en los siete conjuntos y queda por delante de Underdog Bark 3.0 en media, aunque este último es mejor en AMI, GigaSpeech y VoxPopuli. Frente al Parakeet original, la media es ligeramente mejor (4,82 % frente a 4,96 %), con peor resultado en LS clean, LS other y Earnings-22, a cambio de un artefacto 16 veces menor y ejecución en CPU.

## Limitaciones y advertencias

- Solo reconoce inglés; el audio en otros idiomas no está soportado y debe usarse Phonon-2.5 para 25 idiomas.
- Al ser una cuantización del Parakeet TDT 0.6B v3, hereda sus sesgos acústicos y léxicos; la model card no documenta evaluaciones de sesgo por acento, género o edad.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o silencios largos, habitual en modelos transducer; no se publican tasas de error en esos escenarios.
- El WER sube de forma notable en dominios conversacionales: 8,76 % en AMI y 6,22 % en Earnings-22, frente a 1,64 % en LS clean.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar el aviso de atribución a NVIDIA y a FermionResearch y revisar el fichero `NOTICE` con los cambios documentados.
- No se especifican los bits exactos de cuantización ni el formato de pesos, lo que dificulta auditar la pérdida de precisión frente al modelo original.
- La ruta acelerada está limitada a Apple Silicon vía MLX; en Linux y Windows la inferencia es en CPU y no se publican cifras de latencia, por lo que el rendimiento en producción debe medirse en el hardware objetivo.
- El paquete requiere Python 3.10 o superior; el Python 3.9 preinstalado en macOS no es suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-2.5-English
- Modelo multilingüe Phonon-2.5: https://huggingface.co/FermionResearch/Phonon-2.5
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentación de la CLI y el servidor: https://www.fermionresearch.com/docs/speech/
- Paquete en PyPI: https://pypi.org/project/fermion-research/
- Imagen de la model card: https://huggingface.co/FermionResearch/Phonon-2.5-English/resolve/main/phonon-2.5-english-card.jpg
