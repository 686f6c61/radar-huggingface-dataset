# aufklarer/MOSS-VoiceGenerator-MLX-bf16

## Resumen

MOSS-VoiceGenerator-MLX-bf16 es una conversión al formato MLX del modelo MOSS-VoiceGenerator de OpenMOSS-Team, empaquetada por el usuario aufklarer para su ejecución nativa en Apple Silicon a través del módulo `MossVoiceGeneratorTTS` de la librería speech-swift. Se trata de un sintetizador de voz sin referencia (reference-free): genera audio a partir de un guion de texto exacto y una descripción libre del timbre y el estilo de locución deseados, sin necesidad de una grabación de referencia ni de un subproceso Python en tiempo de inferencia.

El modelo combina un backbone de lenguaje Qwen3-1.7B (28 capas, anchura 2.048) con un códec de audio de 24 kHz mono y 16 codebooks, derivado del tokenizador de audio de OpenMOSS. Los pesos se conservan en su precisión original (BF16 para el checkpoint de lenguaje, FP32 para el códec) y no se aplica cuantización alguna, lo que da un bundle de aproximadamente 7,8 GB en disco.

Su relevancia actual radica en que ofrece una vía de despliegue local en Mac para síntesis de voz con control de estilo mediante lenguaje natural, con licencia Apache 2.0 y validación numérica documentada por el autor de la conversión. El soporte de idiomas se limita a inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje Qwen3-1.7B (28 capas, anchura 2.048) + códec de audio autoregresivo con 16 codebooks |
| Parametros totales | 2.114.118.656 (checkpoint de lenguaje, incluyendo embeddings de audio y cabezas no atadas); códec: 887.217.664 parámetros fuente seleccionados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 posiciones de lenguaje en el checkpoint; límites nativos de entrada: 32.768 bytes UTF-8 por campo de texto/instrucción y 4.096 tokens en el prompt renderizado completo |
| Tipos de cuantizacion | Ninguna incluida; pesos en BF16 (lenguaje) y FP32 (códec) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors` BF16, `codec.safetensors` FP32) con manifiesto de bundle convertido |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de síntesis TTS autoregresiva: un modelo de lenguaje Qwen3-1.7B procesa el texto y la instrucción de estilo y genera tokens de audio, que un decodificador de códec transforma en PCM a 24 kHz mono con 16 codebooks y 1.920 muestras de salida por frame. El bundle omite el codificador del códec y los dieciséis codebooks finales no utilizados, ya que la síntesis sin referencia no los necesita. La normalización de pesos se pliega en FP32 al cargar el runtime Swift. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión MLX conserva las precisiones originales y documenta verificaciones numéricas: seis comprobaciones de referencia en Float32 y BF16 para las salidas de Qwen3, padding de audio aprendido, continuación con caché, ventanas causales del códec, posiciones rotatorias, ordenación de parches y normalización de pesos con signo. También se verificaron hashes SHA-256 de los ficheros completos, formas de tensores, tipos de almacenamiento y offsets contiguos. El autor reporta cinco tests de propiedad de caché en CPU y siete tests con modelo real (síntesis, IDs del tokenizador, cancelación antes y durante la generación, recuperación, rechazo de peticiones concurrentes y descarga explícita y concurrente).

## Capacidades

- Síntesis de voz sin referencia: genera audio a partir de un guion y una descripción libre del timbre y el estilo, sin grabación de referencia.
- Control de estilo mediante instrucciones en lenguaje natural (voice design).
- Generación de audio a 24 kHz mono con 16 codebooks.
- Soporte de inglés y chino, con validación de secuencias pinyin en las pruebas del autor.
- Límite por defecto de 750 frames de audio por generación.
- Muestreo configurable con valores por defecto: temperatura 1,5, top-k 50, top-p de audio 0,6 y penalización por repetición 1,1.
- Cancelación de generación antes y durante la síntesis, con recuperación posterior.
- Rechazo explícito de peticiones concurrentes y descarga de modelo explícita y concurrente.
- Ejecución nativa en Apple Silicon mediante MLX y Metal, sin subproceso Python.
- No es un modelo de análisis de audio ni un evaluador (judge) de audio; es exclusivamente un sintetizador.

## Casos de uso

- Síntesis de voz local en Mac para prototipado de asistentes conversacionales: el modelo corre de forma nativa sobre MLX con un factor de tiempo real cálido de 0,57-0,61 en un M5 Pro, lo que permite iterar sobre guiones y estilos sin depender de servicios en la nube.
- Generación de narración con estilo controlado por descripción: útil para audiolibros, podcasts o contenido formativo donde se quiere variar el tono y la dicción mediante instrucciones de texto en lugar de reentrenar el modelo.
- Doblaje y localización en inglés y chino: el soporte bilingüe y la validación con pinyin permiten generar locuciones en ambos idiomas desde el mismo bundle, manteniendo coherencia de estilo entre segmentos.
- Pruebas de accesibilidad y lectura de textos: integrable en aplicaciones macOS que necesiten convertir documentos o guiones en audio sin conexión, con límites de entrada de 32.768 bytes UTF-8 por campo.
- Integración en pipelines de CI/CD para validación de audio: el autor documenta un round trip con un proceso independiente de Parakeet que transcribe el WAV generado, un patrón reutilizable para tests de regresión de síntesis.
- Investigación en TTS sin referencia: el bundle conserva precisiones originales y receipts de conversión verificables, lo que facilita reproducir experimentos y comparar contra el checkpoint original de OpenMOSS.
- Generación por lotes de clips cortos: con un límite por defecto de 750 frames y tiempos de generación cálidos de 2,1-2,8 segundos para frases de 3,4-4,9 segundos de audio, encaja en tareas de producción de clips breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta mediciones de runtime en Apple M5 Pro con 48 GiB de memoria unificada, build release y shaders Metal compilados:

| Entrada | Duración de audio | Primer PCM inicial | Primer PCM cálido | Generación cálida | Factor de tiempo real cálido | Huella física máxima |
|---|---:|---:|---:|---:|---:|---:|
| Inglés, nueve palabras | 3,44 s | 561 ms | 470 ms | 2,098 s | 0,610 | 8,448 GB |
| Mandarín, dos frases | 4,88 s | 1.308 ms | 457 ms | 2,793 s | 0,572 | 8,619 GB |

Un factor de tiempo real menor indica mayor velocidad. Las mediciones cálidas son la mediana de tres peticiones repetidas. El autor advierte que son comprobaciones cortas de runtime y no establecen una puntuación de seguimiento de instrucciones. En la prueba de transcripción, Parakeet insertó la palabra "and" en el clip inglés mientras Qwen3-ASR devolvió el guion exacto; el autor conserva ambos resultados y no reclama error de palabra cero en todos los clips.

## Requisitos de hardware

- VRAM/memoria: el autor reporta una huella física máxima de 8,448-8,619 GB durante la inferencia en un M5 Pro con 48 GiB de memoria unificada. El bundle ocupa 7,8 GB en disco.
- GPU recomendadas: Apple Silicon con soporte MLX y Metal; las mediciones oficiales se hicieron en un M5 Pro. No hay datos publicados para A100, H100 ni RTX 4090, ya que el formato es específico de MLX.
- GPU de consumo: al ser un bundle MLX, está pensado para Macs con chip de la serie M; no se distribuye en formatos GGUF ni para CUDA.
- Despliegue: runtime nativo MLX Swift a través del módulo `MossVoiceGeneratorTTS` de speech-swift. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: primer PCM cálido de 470 ms (inglés) y 457 ms (mandarín); generación cálida de 2,098 s y 2,793 s respectivamente; factor de tiempo real de 0,610 y 0,572.
- Memoria tras descarga: el autor reporta que la memoria MLX viva cayó a 12 bytes tras el unload en ambos procesos finales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| MOSS-VoiceGenerator-MLX-bf16 | 2.114.118.656 (lenguaje) + códec de 887.217.664 | 40.960 posiciones; prompt de 4.096 tokens | en, zh | Apache 2.0 | Safetensors MLX |
| OpenMOSS-Team/MOSS-VoiceGenerator | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| OpenMOSS-Team/MOSS-Audio-Tokenizer | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano.
- Solo se distribuye en formato MLX para Apple Silicon; no hay pesos GGUF, CUDA ni versiones cuantizadas.
- El límite por defecto de 750 frames de audio restringe la duración máxima por generación salvo que se ajuste.
- Límites de entrada: 32.768 bytes UTF-8 por campo de texto o instrucción y 4.096 tokens en el prompt renderizado completo.
- El autor advierte explícitamente que las pruebas de runtime no constituyen una evaluación de seguimiento de instrucciones; no hay benchmarks publicados de calidad de síntesis.
- Se documenta una discrepancia de reconocimiento en el clip inglés (Parakeet inserta "and"), por lo que no se garantiza error de palabra cero.
- Riesgo de alucinación y de desviación del guion no cuantificado en la información disponible.
- El ajuste de asignación de memoria solicita un presupuesto de 512 MiB de búfer de reserva, pero no es un límite total de memoria del proceso: los bytes en caché pueden exceder transitoriamente el presupuesto solicitado según la granularidad del búfer.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base de OpenMOSS-Team.
- El modelo es un sintetizador, no un evaluador de audio; no debe usarse para tareas de análisis o juicio de calidad de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aufklarer/MOSS-VoiceGenerator-MLX-bf16
- Modelo base de lenguaje: https://huggingface.co/OpenMOSS-Team/MOSS-VoiceGenerator
- Tokenizador de audio base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Runtime speech-swift: https://github.com/soniqo/speech-swift
