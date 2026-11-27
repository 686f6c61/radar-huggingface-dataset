# Moofon/Breeze-ASR-25-mlx-4bit

## Resumen

Breeze-ASR-25-mlx-4bit es una conversión a 4 bits en formato MLX del modelo MediaTek-Research/Breeze-ASR-25, un fine-tune de Whisper-large-v2 orientado a mandarín de Taiwán y a code-switching mandarín-inglés. Lo publica el usuario Moofon y su único cambio respecto al original es la cuantización, realizada con el script `whisper/convert.py` de ml-explore/mlx-examples con `--q-bits 4 --q-group-size 64`. El resultado se carga directamente con `mlx-whisper` 0.4.3 sobre Apple Silicon.

El modelo resuelve el problema de ejecutar un ASR de la familia Whisper-large (unos 1550 millones de parámetros en el original) en equipos con memoria unificada limitada, manteniendo la calidad de reconocimiento del modelo base. Según la medición local del autor en un Apple M4 Pro de 24 GB, la versión 4 bits obtiene un MER del 6,10 % frente al 5,71 % de la versión fp16, con un factor de tiempo real de 0,078 frente a 0,100 y un pico de memoria de 1,7 GB frente a 3,8 GB.

Es relevante para desarrolladores que necesitan transcripción de audio en mandarín o en conversaciones bilingües mandarín-inglés en local, sin GPU dedicada, sobre macOS con chip de la serie M. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (fine-tune de Whisper-large-v2) |
| Parametros totales | no disponible (el modelo base Whisper-large-v2 tiene aproximadamente 1550 M; el dato exacto de Breeze-ASR-25 no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | 4 bits con group size 64 (unico formato publicado en este repo) |
| Idiomas soportados | chino (mandarin de Taiwan) e ingles; code-switching mandarin-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (pesos cuantizados para `mlx-whisper`) |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-large-v2: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI para reconocimiento de voz multilingüe. MediaTek Research realizó un fine-tune sobre ese modelo para especializarlo en mandarín de Taiwán y en habla con alternancia de código mandarín-inglés, que es el escenario descrito en el paper arXiv:2506.11130. La model card de esta conversión no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aquí.

La única modificación técnica introducida en este repositorio es la cuantización de pesos a 4 bits con grupos de 64 elementos, aplicada mediante la herramienta de conversión de MLX. No se añaden mecanismos de decodificación especulativa ni cambios en el grafo de atención. El objetivo es reducir la huella de memoria y acelerar la inferencia en Apple Silicon aprovechando los kernels de MLX, a cambio de una pérdida mínima de precisión medida en MER.

## Capacidades

- Reconocimiento automático de voz (transcripción) en mandarín de Taiwán e inglés.
- Manejo de code-switching mandarín-inglés dentro de una misma intervención.
- Carga directa con `mlx-whisper` 0.4.3 mediante `mlx_whisper.transcribe`.
- Inferencia en local sobre Apple Silicon con memoria unificada.
- No se documentan en la informacion proporcionada capacidades de traducción, diarización de hablantes, tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de clases y conferencias en mandarín: el modelo procesa audio largo segmento a segmento con un factor de tiempo real de 0,078 en M4 Pro, lo que permite transcribir una hora de audio en pocos minutos en un portátil.
- Subtitulado de vídeo bilingüe mandarín-inglés: su especialización en code-switching evita los errores típicos de Whisper estándar cuando el hablante alterna idiomas en una misma frase.
- Actas de reuniones en entornos taiwaneses: transcripción local sin enviar audio a servicios en la nube, relevante por privacidad y por cumplimiento normativo.
- Prototipado rápido en macOS: al ocupar 1,7 GB de pico de memoria, cabe junto a otras aplicaciones en equipos de 16 GB o 24 GB y permite iterar sin infraestructura GPU.
- Investigación en ASR multilingüe: sirve como referencia cuantizada para comparar MER y RTF frente a versiones fp16 en experimentos con hardware Apple.
- Herramientas de accesibilidad: generación de transcripciones en tiempo casi real para personas con dificultades auditivas en contextos de habla mandarín-inglés.
- Pipeline de datos para entrenamiento: transcripción masiva de corpus de audio en local antes de anonimizar o etiquetar.

## Benchmarks y rendimiento

Medición local del autor en Apple M4 Pro (24 GB) con mlx-whisper 0.4.3, sobre la clase `week7_1` de `ky552/ML2021_ASR_ST`. MER cuenta caracteres chinos y palabras inglesas.

| Metrica | Breeze 4-bit (este modelo) | Breeze fp16 |
|---|---|---|
| MER | 6,10 % | 5,71 % |
| Factor de tiempo real (RTF) | 0,078 | 0,100 |
| Memoria pico | 1,7 GB | 3,8 GB |

No se han publicado en la informacion disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo, ya que se trata de un modelo ASR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM/memoria estimada: 1,7 GB de pico en la medición del autor con cuantización 4 bits; el repo ocupa 0,9 GB en disco.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; la medición de referencia es un M4 Pro de 24 GB.
- Cabe en equipos consumer de Apple con 16 GB de memoria unificada sin dificultad; no se documenta soporte para GPU NVIDIA ni ROCm en este repositorio.
- Despliegue: `mlx-whisper` 0.4.3 o superior; la conversión se generó con `mlx-examples`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,078 en M4 Pro, es decir, aproximadamente 12,8 veces más rápido que el tiempo real en ese equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Breeze-ASR-25-mlx-4bit (este) | no disponible (base ~1550 M) | segmentos de 30 s (Whisper) | zh, en | Apache 2.0 | MLX 4 bits |
| MediaTek-Research/Breeze-ASR-25 (original) | no disponible (base ~1550 M) | segmentos de 30 s (Whisper) | zh, en | Apache 2.0 | pesos originales (fp16/bf16) |
| openai/whisper-large-v2 | ~1550 M | segmentos de 30 s | multilingüe | MIT | safetensors, GGUF, MLX (conversiones de la comunidad) |

La comparación con otros modelos ASR especializados en mandarín no está disponible en la informacion proporcionada. Frente al original, la versión 4 bits sacrifica 0,39 puntos de MER a cambio de menos de la mitad de memoria pico y un 22 % menos de tiempo de inferencia en el hardware medido.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: MER 6,10 % frente a 5,71 % en fp16 en la única medición publicada.
- Solo se ha validado en un equipo y un clip de audio; no hay evaluación sistemática en distintos dominios, acentos o condiciones de ruido.
- Idiomas limitados a mandarín de Taiwán e inglés; no se garantiza un buen rendimiento en mandarín continental, cantonés u otras lenguas.
- No se documentan sesgos específicos, pero al derivar de Whisper-large-v2 hereda los sesgos y errores conocidos de ese modelo base en acentos, nombres propios y audio con ruido.
- Riesgo de alucinación en pasajes de silencio o audio ininteligible, comportamiento típico de la familia Whisper.
- Dependencia de Apple Silicon y de `mlx-whisper`; no es portable a CUDA sin reconvertir los pesos.
- Uso comercial permitido por Apache 2.0, con atribución a MediaTek Research por los derechos del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moofon/Breeze-ASR-25-mlx-4bit
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Paper del modelo base: https://arxiv.org/abs/2506.11130
- Repositorio de conversión MLX: https://github.com/ml-explore/mlx-examples
- Dataset de evaluación citado: https://huggingface.co/datasets/ky552/ML2021_ASR_ST
