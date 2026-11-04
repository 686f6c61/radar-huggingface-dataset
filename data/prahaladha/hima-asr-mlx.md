# Prahaladha/hima-asr-mlx

## Resumen

Hima-ASR MLX es la conversión a MLX (float16) de Hima-ASR, un modelo de reconocimiento automático del habla desarrollado por el usuario Prahaladha. Su particularidad es que no se limita a transcribir: incorpora una cabeza de decisión de 17,5 millones de parámetros que responde preguntas de opción múltiple sobre el audio, combinando información acústica y lingüística. Está pensado para ejecutarse en GPUs de Apple Silicon sin necesidad de PyTorch, lo que facilita su despliegue en portátiles y equipos de sobremesa de Apple.

El modelo cubre once lenguas de la India (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) además del inglés, con soporte explícito para code-switching. Con 500.184.320 parámetros totales y un repositorio de 1,0 GB, se posiciona como una alternativa compacta para transcripción multilingüe en el subcontinente indio. La versión fp16 alcanza 63 veces tiempo real en un MacBook Pro con M4 Pro, frente a las 21 veces de la versión original en PyTorch, con una tasa de error por letra del 5,92 % sobre 36 clips de evaluación.

Resulta relevante porque demuestra que es posible empaquetar ASR multilingüe y clasificación de decisiones sobre llamadas en un único modelo de medio billón de parámetros, con licencia permisiva en su mayor parte y ejecución nativa en hardware de consumo de Apple. La licencia, eso sí, es mixta: Apache 2.0 para las partes propias y del codificador, y los Términos de Uso de Gemma para el decodificador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder de audio a texto con cabeza de decisión adicional (encoder inicializado desde Qwen3-ASR-1.7B, decoder desde Gemma 3 270M) |
| Parametros totales | 500.184.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (esta versión), 8-bit y 4-bit en repositorios separados |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en |
| Licencia | apache-2.0-and-gemma (partes propias y encoder bajo Apache 2.0; decoder bajo Términos de Uso de Gemma) |
| Formato de pesos | safetensors (float16), con ficheros auxiliares en numpy (`mel_filters.npy`, `head_np.py`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder clásico para ASR. El codificador de audio se inicializa desde Qwen3-ASR-1.7B (Apache 2.0) y el decodificador de texto desde Gemma 3 270M, sujeto a los Términos de Uso de Gemma. Sobre esa base se añade una cabeza de decisión (`decide/`, 17,5 M de parámetros) que lee cada capa del encoder de audio y del decodificador de texto para responder preguntas de opción múltiple sobre el clip, tanto por cómo suena como por lo que se dice. El front-end de audio es log-mel implementado en numpy puro (`mel_filters.npy`), y el repositorio incluye un módulo `hima_mlx.py` con el modelo, el cargador, la decodificación greedy y la lógica de decisiones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal. Lo que sí se documenta es el proceso de conversión a MLX: pesos en float16, decodificación greedy y una cabeza de decisión reimplementada en numpy que reproduce la respuesta principal del cabezal original en 287 de 288 decisiones (16 clips, 18 preguntas cada uno).

## Capacidades

- Transcripción de voz a texto en 11 lenguas de la India y en inglés, con detección automática de idioma si se pasa `language=None`.
- Soporte de code-switching entre lenguas índicas y entre estas y el inglés.
- Decisión de opción múltiple sobre el audio: 16 preguntas predefinidas (`model.questions`) que cubren idioma, género, tono, sentimiento, emoción, si es pregunta, petición de acción, menciones de dinero, menciones de tiempo, queja, acuerdo, deseo de hablar con humano, tema, urgencia, formalidad e intención de llamada.
- Preguntas personalizadas mediante `model.decide()` con tres tipos: `choice` (elección entre opciones), `yesno` (sí/no) y `scale` (escala ordinal).
- Ejecución en una sola pasada: `model.run()` devuelve transcripción y las 16 decisiones en una única escucha del clip.
- Entrada de audio a 16 kHz, ya sea fichero o array; para otras frecuencias de muestreo se recomienda `librosa`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni visión o audio más allá del propio ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente en hindi, tamil o bengalí: el modelo transcribe el audio y, en la misma pasada, clasifica tono, sentimiento, urgencia y si el cliente pide hablar con un humano, lo que permite enrutar la llamada sin un pipeline separado de NLP.
- Análisis de calidad (QA) de centros de contacto: las decisiones predefinidas de queja, acuerdo, formalidad y mención de dinero permiten puntuar automáticamente conversaciones y detectar incidencias sin entrenar clasificadores adicionales.
- Moderación y triaje de buzones de voz multilingües: la detección de idioma y la clasificación de intención de llamada permiten separar mensajes por tema y prioridad antes de que los revise un operador.
- Subtitulado y transcripción de contenido audiovisual en lenguas índicas: la ventana de contexto no está documentada, pero el modelo procesa clips completos y admite code-switching, útil para vídeos con mezcla de hindi e inglés.
- Investigación lingüística y sociolingüística: las decisiones de formalidad, tono y emoción sobre corpus de habla permiten estudiar variación pragmática en distintas lenguas de la India de forma automatizada.
- Despliegue en portátiles Apple para trabajo de campo: al ejecutarse en MLX sobre Apple Silicon sin PyTorch, se puede transcribir y clasificar audio en un MacBook sin conexión ni GPU dedicada, útil en entornos con conectividad limitada.
- Prototipado rápido de asistentes de voz para el mercado indio: la API de `decide()` con preguntas personalizadas permite iterar sobre nuevas taxonomías de intención sin reentrenar el modelo.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan las distintas versiones sobre 36 clips reservados (255 s de audio) en 12 lenguas, medidos en un MacBook Pro con M4 Pro (mejor de dos ejecuciones). La tasa de error por letra se calcula contra las transcripciones humanas.

| Version | Tamano | Velocidad (x tiempo real) | Error por letra | Decisiones acertadas |
|---|---|---|---|---|
| PyTorch original (Mac GPU) | 920 MB | 21x | 5,89 % | 288/288 |
| fp16 (esta version) | 1,0 GB | 63x | 5,92 % | 287/288 |
| 8-bit | 536 MB | 73x | 5,76 % | 288/288 |
| 4-bit | 379 MB | 73x | 5,54 % | 282/288 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni WER por conjunto de evaluación público) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser MLX y ejecutarse en memoria unificada de Apple Silicon, el consumo ronda el tamaño del repositorio. La versión fp16 ocupa 1,0 GB; la 8-bit, 536 MB; la 4-bit, 379 MB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). Las medidas publicadas corresponden a un M4 Pro.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA ni AMD, ya que depende de MLX.
- Opciones de despliegue: MLX con el módulo `hima_mlx.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 63x tiempo real en fp16 y 73x en 8-bit y 4-bit sobre M4 Pro, es decir, 255 s de audio se procesan en aproximadamente 4 s (fp16) o 3,5 s (cuantizado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hima-ASR MLX fp16 | 500 M | no disponible | 12 (11 índicas + inglés) | apache-2.0-and-gemma | safetensors (MLX) |
| Hima-ASR (PyTorch original) | no disponible | no disponible | 12 | apache-2.0-and-gemma | PyTorch |
| Hima-ASR MLX 8-bit | 500 M (cuantizado) | no disponible | 12 | apache-2.0-and-gemma | safetensors (MLX) |
| Hima-ASR MLX 4-bit | 500 M (cuantizado) | no disponible | 12 | apache-2.0-and-gemma | safetensors (MLX) |

No se dispone de información sobre otros modelos comparables de la misma categoría (ASR multilingüe índico con cabeza de decisión) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia es mixta: el decodificador de texto deriva de Gemma 3 270M y está sujeto a los Términos de Uso de Gemma, que imponen restricciones adicionales al uso comercial; hay que revisar `NOTICE` antes de desplegar en producción.
- El modelo está diseñado para MLX y Apple Silicon; no se documenta funcionamiento en GPUs NVIDIA, AMD ni en CPU convencional, lo que limita su portabilidad.
- La evaluación publicada es reducida: 36 clips y 255 s de audio en 12 lenguas, insuficiente para estimar el rendimiento en dominios, acentos o ruidos distintos a los de la muestra.
- No se documentan sesgos conocidos, pero al entrenarse sobre lenguas de la India y con inicialización en Gemma, es probable que herede sesgos de género y culturales; conviene auditar las decisiones de género, tono y emoción antes de usarlas en producción.
- Riesgo de alucinación en la transcripción y en las decisiones: la cabeza de decisión puede dar respuestas plausibles pero incorrectas, especialmente en audio con ruido o code-switching intenso.
- Las decisiones de 4-bit aciertan 282 de 288 frente a 287 de 288 en fp16, una pérdida pequeña pero medible que conviene tener en cuenta si la precisión de clasificación es crítica.
- No se documenta la longitud máxima de audio ni la ventana de contexto del decodificador, por lo que clips largos pueden requerir segmentación manual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prahaladha/hima-asr-mlx
- Modelo base: https://huggingface.co/Prahaladha/hima-asr
- Versión 8-bit: https://huggingface.co/Prahaladha/hima-asr-mlx-8bit
- Versión 4-bit: https://huggingface.co/Prahaladha/hima-asr-mlx-4bit
- Aviso de licencia (NOTICE): https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Términos de Uso de Gemma: https://ai.google.dev/gemma/terms
