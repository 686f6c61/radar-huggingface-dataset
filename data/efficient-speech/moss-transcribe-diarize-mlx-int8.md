# efficient-speech/MOSS-Transcribe-Diarize-MLX-INT8

## Resumen

MOSS-Transcribe-Diarize-MLX-INT8 es una conversión a MLX del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, un sistema de reconocimiento automático del habla (ASR) que transcribe audio con marcas de tiempo y etiquetas de hablante (diarización). Lo publica el usuario efficient-speech, que ha convertido los pesos originales al formato MLX de Apple y ha aplicado cuantización afín de 8 bits por grupos de 64 al backbone de texto, manteniendo el codificador de audio en BF16.

El modelo base lo desarrolla OpenMOSS-Team y está pensado para transcripción de audio de formato largo con identificación de interlocutores, una tarea que tradicionalmente requiere encadenar un sistema ASR con un sistema de diarización independiente. Al integrar ambas capacidades en un único modelo, simplifica el pipeline y reduce la propagación de errores entre etapas.

Esta versión concreta es relevante para quienes despliegan en hardware Apple Silicon: el formato MLX y la cuantización INT8 reducen el peso del repositorio a 1,3 GB con 908.513.280 parámetros, lo que facilita la inferencia local en Macs. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El modelo se publica junto a Murmur, un sistema de inferencia para ASR de formato largo, y dispone de un runtime MLX independiente para transcripción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con codificador de audio y backbone de texto; detalles no especificados en la informacion disponible) |
| Parametros totales | 908.513.280 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 afín por grupos de 64 en el backbone de texto; codificador de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la descripcion de la model card se deduce una estructura de dos componentes: un codificador de audio, que se mantiene en BF16 en esta conversion, y un backbone de texto, que es el que se cuantiza a INT8 con cuantización afín por grupos de 64. El modelo realiza transcripción con marcas de tiempo y etiquetas de hablante, lo que implica que la salida combina texto, timestamps y asignación de interlocutor en una sola pasada.

No se han publicado en la informacion disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas del modelo base más allá de la integración de transcripción y diarización. La aportación técnica de esta release es la conversión a MLX y la estrategia de cuantización: cuantizar solo el backbone de texto y preservar el codificador de audio en BF16 busca mantener la calidad acústica mientras se reduce el coste de memoria y cómputo en la parte lingüística.

## Capacidades

- Transcripción automática del habla con marcas de tiempo.
- Diarización de hablantes: etiqueta cada segmento de audio con el interlocutor correspondiente.
- Procesamiento de audio de formato largo, según el caso de uso descrito en la model card y su vinculación con el sistema Murmur.
- Ejecución local en hardware Apple Silicon mediante MLX.
- Inferencia cuantizada en INT8 para el backbone de texto, con menor huella de memoria.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y actas: el modelo genera texto con marcas de tiempo y separa las intervenciones por hablante, lo que permite construir actas estructuradas sin postprocesar manualmente la asignación de turnos.
- Subtitulado y indexación de archivos audiovisuales: las marcas de tiempo facilitan la generación de subtítulos sincronizados y la creación de índices navegables sobre grabaciones largas.
- Análisis de entrevistas y trabajo de campo: en investigación cualitativa, la diarización permite distinguir entrevistador y entrevistado y citar fragmentos con precisión temporal.
- Documentación clínica o legal dictada: la separación por hablante ayuda a distinguir profesional y paciente o cliente en grabaciones de sesiones, siempre con las cautelas de privacidad correspondientes.
- Transcripción local en Mac: gracias al formato MLX y a la cuantización INT8, se puede ejecutar en Apple Silicon sin enviar audio a servicios externos, lo que resulta adecuado para material sensible.
- Procesamiento por lotes de archivos de audio: el runtime `mtd-mlx` permite invocar el modelo desde línea de comandos sobre ficheros WAV, lo que facilita integrarlo en scripts de procesamiento masivo.
- Investigación en ASR y diarización: sirve como referencia cuantizada para comparar calidad frente al modelo base en BF16 y evaluar el impacto de la cuantización del backbone de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,3 GB, lo que da una cota superior aproximada de memoria para los pesos; el pico real de VRAM o memoria unificada durante la inferencia será mayor por activaciones y buffers de audio, aunque no se dispone de cifras oficiales.
- Al estar en formato MLX, el despliegue objetivo son equipos Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada.
- No se documentan requisitos para GPU NVIDIA (A100, H100, RTX 4090) en la informacion disponible; el formato MLX no es el camino habitual para CUDA.
- Opciones de despliegue: runtime MLX independiente `mtd-mlx` (comando `mtd-mlx recording.wav --strict --model efficient-speech/MOSS-Transcribe-Diarize-MLX-INT8`) y el sistema Murmur para ASR de formato largo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize-MLX-INT8 (este) | 908.513.280 | no disponible | safetensors MLX, INT8 + BF16 | Apache 2.0 | Cuantizado para Apple Silicon |
| OpenMOSS-Team/MOSS-Transcribe-Diarize | no disponible | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo base sin cuantizar |
| Whisper (variantes de OpenAI) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | ASR sin diarización integrada; requiere sistema aparte |
| pyannote + ASR (pipeline de diarización) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | Pipeline de dos etapas frente a modelo unificado |

La comparativa con alternativas externas no puede completarse con datos verificados a partir de la informacion disponible; las filas de Whisper y pyannote se incluyen solo como referencia categórica y sus cifras deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni de esta conversión.
- Riesgo de alucinación en la transcripción: como todo sistema ASR generativo, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo o solapamiento de hablantes.
- La diarización puede confundir hablantes con voces similares o en conversaciones con solapamientos; no se dispone de métricas de error de diarización (DER) publicadas.
- No se especifican los idiomas soportados; conviene validar el rendimiento en el idioma objetivo antes de usarlo en producción.
- La cuantización INT8 del backbone de texto puede degradar ligeramente la calidad frente al modelo base en BF16; no se han publicado comparativas de calidad entre ambas versiones.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base y de los datasets de entrenamiento originales.
- El formato MLX limita el despliegue a hardware Apple; para otros entornos hay que recurrir al modelo base en safetensors estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficient-speech/MOSS-Transcribe-Diarize-MLX-INT8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize/tree/10304d926740cf5a5cee05a268086e3265197910
- Murmur (sistema de inferencia para ASR de formato largo): https://github.com/uw-syfi/Murmur
- Runtime MLX independiente: https://github.com/vanch007/mlx-MOSS-Transcribe-Diarize/tree/d2546316f76e93947e8d99a17fb88652f8ad6ab2
