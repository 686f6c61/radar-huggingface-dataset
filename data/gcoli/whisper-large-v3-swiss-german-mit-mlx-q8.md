# gcoli/whisper-large-v3-swiss-german-mit-mlx-q8

## Resumen

Whisper Large-v3 Swiss German (MIT) – MLX 8-bit es una conversión cuantizada a 8 bits del modelo de reconocimiento automático de voz (ASR) `gcoli/whisper-large-v3-swiss-german-mit`, publicada por el mismo autor (gcoli) para su ejecución en Apple Silicon mediante el framework MLX. El modelo resuelve una tarea concreta y poco cubierta: transcribir habla en dialectos del alemán suizo (código ISO `gsw`) y generar texto en alemán estándar (`de`), lo que evita el paso intermedio de normalización dialectal manual.

La arquitectura subyacente es la de Whisper large-v3 de OpenAI: un transformer encoder-decoder de tipo seq2seq entrenado originalmente para ASR multilingüe y ajustado (fine-tuning) sobre datos de dialectos suizos. La variante aquí descrita no modifica la arquitectura, sino que reduce la precisión de los pesos a 8 bits con tamaño de grupo 64 para disminuir el uso de memoria y acelerar la inferencia en chips de Apple (serie M). El repositorio ocupa 1,6 GB, coherente con un large-v3 cuantizado a 8 bits.

Su relevancia es práctica: permite desplegar un ASR especializado en suizo alemán en portátiles y equipos de sobremesa con Apple Silicon sin GPU dedicada, con licencia MIT. La precisión declarada corresponde al modelo fuente en float16 (WER 22,1 % en dev y 24,7 % en el conjunto final de FHNW/i4ds); esta build de 8 bits no ha sido evaluada sobre dicho conjunto, por lo que la degradación introducida por la cuantización no está cuantificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), seq2seq para ASR |
| Parametros totales | no disponible (el modelo base Whisper large-v3 tiene 1.550 millones; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 trabaja con ventanas de audio de 30 s; no confirmado en la ficha) |
| Tipos de cuantizacion | 8 bits (MLX, group size 64); el modelo fuente en float16 |
| Idiomas soportados | gsw (aleman suizo), de (aleman estandar) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con archivo `SHA256SUMS` de verificacion |
| Libreria de inferencia | mlx / mlx-whisper |
| Tamano del repositorio | 1,6 GB |
| Entrada | audio (wav en los ejemplos de uso) |
| Salida | texto (transcripcion) |

## Arquitectura y entrenamiento

El modelo es un Whisper large-v3 estándar: encoder-decoder transformer con atención completa, diseñado para mapear espectrogramas Mel de audio a tokens de texto. La build publicada aquí no reentrena ni modifica la topología; aplica cuantización de 8 bits sobre los pesos safetensors del modelo fuente `gcoli/whisper-large-v3-swiss-german-mit` (revisión `c27284d77cd25492caf2deab96555dd3abad05aa`), tomando los ficheros de transformers de la raíz del repositorio y no la carpeta `ct2/` (CTranslate2).

La conversión se realizó con el script `mlx-examples/whisper/convert.py` (commit `796f5b53cab69a3d48a44233ce21aae889e94a08`) usando `--quantize --q-bits 8` con tamaño de grupo 64. El entorno de verificación fue mlx-whisper 0.4.3, mlx 0.32.4 y un chip M5 Max. No se documentan en la información disponible los detalles del fine-tuning del modelo fuente (número de horas de audio, composición del corpus de dialectos suizos, uso de RLHF o técnicas de alineación); únicamente se indica que el modelo fuente se evaluó sobre el conjunto FHNW/i4ds All Swiss German Dialects Test Set.

## Capacidades

- Reconocimiento automático de voz (ASR) de habla en dialectos del alemán suizo (`gsw`).
- Normalización a alemán estándar (`de`) en la salida: transcribe dialecto y escribe en alemán escrito.
- Procesamiento de audio de entrada en formato wav mediante `mlx_whisper.transcribe`.
- Ejecución nativa en Apple Silicon a través de MLX, con cuantización de 8 bits para reducir memoria.
- Selección explícita del idioma de salida mediante el parámetro `language="de"`.
- No se documentan en la información disponible capacidades de traducción a otros idiomas, diarización de hablantes, timestamps por palabra, tool calling ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y actas en empresas suizas: el modelo convierte intervenciones en dialecto en texto estándar, lo que permite generar actas legibles sin post-edición dialectal manual; encaja en portátiles Apple Silicon por su tamaño de 1,6 GB y su ejecución vía MLX.
- Subtitulado de contenido audiovisual regional: para vídeos, pódcast o material formativo en suizo alemán, el pipeline puede transcribir con `mlx_whisper` y volcar el texto a un formato de subtítulos; la licencia MIT facilita su integración en productos comerciales.
- Dictado por voz en herramientas ofimáticas: el ejemplo de la model card (una prueba pequeña de dictado con vocabulario de oficina) apunta a este uso; el modelo puede alimentar funciones de dictado en editores de texto o correo en macOS.
- Documentación clínica o administrativa en Suiza: transcripción de notas dictadas por profesionales que hablan dialecto, con salida en alemán estándar apta para historiales o formularios; requiere revisión humana por el WER del modelo fuente.
- Investigación en lingüística y dialectología: generación de transcripciones masivas de corpus orales en `gsw` para análisis léxico o fonético, aprovechando la licencia MIT y la posibilidad de ejecución local sin enviar audio a servicios en la nube.
- Atención al cliente y centros de contacto: transcripción de llamadas en dialecto suizo para análisis de calidad, búsqueda de texto en grabaciones o generación de resúmenes posteriores; la ventana de audio de Whisper requiere segmentar las llamadas largas en fragmentos.
- Aplicaciones de accesibilidad: subtitulado en tiempo casi real de conversaciones presenciales en entornos con habla dialectal, ejecutado en local para preservar la privacidad del audio.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo fuente en float16 sobre CUDA, no a esta build MLX de 8 bits:

| Modelo / build | Precisión | Conjunto | WER |
|---|---|---|---|
| gcoli/whisper-large-v3-swiss-german-mit (fuente) | float16 | FHNW/i4ds All Swiss German Dialects Test Set, dev | 22,1 % |
| gcoli/whisper-large-v3-swiss-german-mit (fuente) | float16 | FHNW/i4ds All Swiss German Dialects Test Set, final | 24,7 % |
| gcoli/whisper-large-v3-swiss-german-mit-mlx-q8 (esta build) | 8 bits MLX | FHNW/i4ds (no evaluado) | no disponible |

El autor indica que esta build de 8 bits no fue medida sobre el conjunto de test y que una prueba pequeña de dictado (un solo hablante, vocabulario de oficina) arrojó resultados similares a otros modelos de suizo alemán, con una muestra demasiado pequeña para declarar un WER. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 1,6 GB en 8 bits; la inferencia requiere además memoria para activaciones y buffers de audio, por lo que se recomienda al menos 4-8 GB de memoria unificada disponible (estimación, no confirmada en la información proporcionada).
- Hardware objetivo: Apple Silicon (serie M). La verificación del autor se realizó en un chip M5 Max con mlx 0.32.4 y mlx-whisper 0.4.3.
- GPU NVIDIA: esta build está pensada para MLX y no es directamente ejecutable en CUDA; para GPU NVIDIA habría que usar el modelo fuente en transformers o su conversión CTranslate2 (carpeta `ct2/` del repositorio base).
- Cabe en equipos de consumo con Apple Silicon; no se documentan requisitos para GPU de consumo NVIDIA en esta build.
- Opciones de despliegue: `mlx-whisper` (CLI `uvx --from mlx-whisper mlx_whisper` o API Python `mlx_whisper.transcribe`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. No se publican métricas de velocidad (RTF, tokens/s) en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato | WER suizo alemán |
|---|---|---|---|---|---|---|
| gcoli/whisper-large-v3-swiss-german-mit-mlx-q8 (este) | no disponible (base large-v3) | ventana Whisper (30 s, no confirmado) | gsw, de | MIT | safetensors MLX 8 bits | no evaluado en esta build |
| gcoli/whisper-large-v3-swiss-german-mit (fuente) | no disponible (base large-v3) | ventana Whisper (30 s, no confirmado) | gsw, de | MIT | safetensors float16 / ct2 | 22,1 % dev, 24,7 % final |
| Whisper large-v3 original (OpenAI) | 1.550 millones (dato general, no en la ficha) | ventana de 30 s (dato general, no en la ficha) | multilingüe | MIT (dato general, no en la ficha) | safetensors, ct2 | no disponible en la información proporcionada |

La comparativa se limita a variantes del mismo linaje; no se dispone en la información proporcionada de datos de otros modelos especializados en suizo alemán (por ejemplo, variantes de MMS o de modelos comerciales) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización a 8 bits no ha sido evaluada sobre el conjunto de referencia; se desconoce la degradación de WER respecto al modelo fuente en float16.
- El WER del modelo fuente es elevado (22,1 % dev, 24,7 % final) para estándares de ASR en lenguas mayoritarias; en producción se recomienda revisión humana o umbrales de confianza.
- Cobertura limitada a `gsw` y `de`; no se documenta rendimiento en otros idiomas ni en code-switching con francés, italiano o inglés, frecuente en Suiza.
- Riesgo de alucinación típico de Whisper en segmentos con ruido, silencios largos o audio musical; conviene aplicar detección de silencio y filtros de repetición.
- El modelo está orientado a Apple Silicon; no es portable directamente a CUDA sin recurrir al modelo fuente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre exactitud ni idoneidad para dominios regulados (sanitario, legal).
- No se documentan sesgos específicos ni evaluación de equidad entre dialectos; la variabilidad dialectal dentro del suizo alemán puede producir diferencias de precisión no medidas.
- La información sobre el entrenamiento del modelo fuente (datos, horas de audio, procedimiento de fine-tuning) no está disponible en la ficha, lo que dificulta auditar su procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit-mlx-q8
- Modelo base (fuente): https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit
- Repositorio de ejemplos MLX (script de conversión): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Librería mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Conjunto de evaluación FHNW/i4ds All Swiss German Dialects Test Set: no disponible como enlace directo en la información proporcionada
- Paper de Whisper (OpenAI): no disponible como enlace en la información proporcionada
