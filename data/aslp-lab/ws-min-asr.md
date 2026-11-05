# ASLP-lab/WS-Min-ASR

## Resumen

WS-Min-ASR es un repositorio de modelos de reconocimiento automático del habla (ASR) publicado por ASLP-lab, centrado en la transcripción de minnan (hokkien) y de mandarín, así como en el reconocimiento de transcripciones emparejadas (pares minnan-mandarín para un mismo enunciado). Acompaña al corpus WenetSpeech-Min, descrito en el artículo arXiv 2609.36834, que reúne aproximadamente 10.000 horas de audio en minnan con transcripciones paralelas en minnan y mandarín para cada emisión.

El repositorio agrupa tres variantes: `Qwen3-ASR-WSM-Min` y `Qwen3-ASR-WSM-Mandarin`, ambas construidas sobre el modelo base Qwen/Qwen3-ASR-1.7B y afinadas con ms-swift, y `FireRedASR2-AED-WSM`, un modelo AED (attention-based encoder-decoder) derivado de FireRedTeam/FireRedASR2-AED y entrenado con WeNet para la tarea de transcripción emparejada. Las dos primeras reciben audio en minnan y generan salida en minnan o mandarín según la variante; la tercera produce ambos textos de forma conjunta.

La relevancia del lanzamiento radica en la escasez de recursos ASR de calidad para lenguas de bajos recursos como el minnan, que cuenta con decenas de millones de hablantes pero con muy poca cobertura en sistemas comerciales. El repositorio ocupa 71,2 GB, no declara licencia explícita y registra un uso muy reducido en HuggingFace (0 descargas, 2 likes) en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos familias: LLM-based ASR (Qwen3-ASR, sobre Qwen3-ASR-1.7B) y AED encoder-decoder (FireRedASR2-AED) |
| Parámetros totales | 1,7 B en las variantes Qwen3-ASR; no disponible para FireRedASR2-AED-WSM |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_model_len=8192` configurado en el ejemplo de inferencia con vLLM (variantes Qwen3-ASR) |
| Tipos de cuantización | no disponible (pesos en safetensors; el ejemplo usa `gpu_memory_utilization=0.8` con vLLM) |
| Idiomas soportados | minnan (`nan`) y chino mandarín (`zh`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (junto con JSON, TXT y plantillas Jinja) |

## Arquitectura y entrenamiento

El repositorio contiene tres artefactos con arquitecturas distintas. Las dos variantes Qwen3-ASR-WSM se basan en Qwen3-ASR-1.7B, un modelo de ASR de tipo LLM que recibe audio y genera la transcripción como texto, y se han afinado mediante ms-swift. La variante FireRedASR2-AED-WSM parte de FireRedASR2-AED, un modelo AED clásico (encoder acústico más decoder autorregresivo), y se entrena e infiere con el framework WeNet, con soporte para tareas `minnan`, `mandarin` y `both` (salida emparejada con los campos `text_minnan` y `text_mandarin`).

El entrenamiento se apoya en WenetSpeech-Min, un corpus de aproximadamente 10.000 horas de habla en minnan con transcripciones emparejadas en minnan y mandarín. La model card no detalla la composición exacta del dataset, el número de tokens de audio vistos, ni si se aplicaron fases de RLHF/DPO; tampoco describe innovaciones técnicas adicionales más allá del enfoque de transcripción emparejada. Los scripts de entrenamiento de cada variante están publicados en el repositorio GitHub WenetSpeech-Min-Repo.

## Capacidades

- Transcripción de audio en minnan (variante `Qwen3-ASR-WSM-Min`).
- Transcripción de audio en minnan con salida en mandarín (variante `Qwen3-ASR-WSM-Mandarin`).
- Reconocimiento de transcripciones emparejadas: generación simultánea de `text_minnan` y `text_mandarin` para un mismo audio (variante `FireRedASR2-AED-WSM`).
- Procesamiento de audio de entrada con longitud de contexto de 8192 tokens y hasta 1024 tokens nuevos por generación en la configuración de ejemplo.
- Inferencia con backend vLLM para las variantes Qwen3-ASR.
- Soporte de despliegue con WeNet para la variante FireRedASR2-AED.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado de contenido audiovisual en minnan: el modelo permite generar subtítulos en minnan o traducidos al mandarín para vídeos, entrevistas o programas de televisión, aprovechando la salida emparejada de FireRedASR2-AED-WSM para obtener ambas versiones en una sola pasada.
- Preservación y documentación lingüística: investigadores pueden transcribir grabaciones de campo en minnan y disponer de una transcripción en mandarín como referencia paralela, lo que facilita la anotación y el análisis comparado.
- Archivado de patrimonio oral: digitalización de fondos de audio en minnan (radios locales, registros familiares, material etnográfico) con transcripción automática para su indexación y búsqueda textual.
- Atención al ciudadano en regiones de habla minnan: integración del modelo en sistemas de transcripción de llamadas o mostradores para generar actas en mandarín a partir de conversaciones en minnan.
- Investigación en ASR de bajos recursos: el corpus y los modelos sirven como línea base para experimentos de adaptación de dominio, comparación entre arquitecturas LLM-based y AED, y evaluación de técnicas de transcripción cruzada.
- Generación de datos de entrenamiento: las transcripciones emparejadas permiten construir pares minnan-mandarín para entrenar sistemas de traducción automática o modelos de ASR multilingües.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión en minnan para su clasificación temática y análisis de contenido a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Las variantes Qwen3-ASR (1,7 B) son manejables en GPU de consumo con cuantización, pero la model card solo documenta `gpu_memory_utilization=0.8` con vLLM, sin cifras absolutas.
- GPU recomendadas: no disponible. El ejemplo de inferencia usa `CUDA_VISIBLE_DEVICES=0` con vLLM, lo que sugiere una única GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: probable para las variantes Qwen3-ASR de 1,7 B, pero no confirmada en la información disponible. El tamaño del repositorio (71,2 GB) incluye los tres modelos y no refleja el peso de una sola variante.
- Opciones de despliegue: vLLM a través de `Qwen3ASRModel.LLM` para las variantes Qwen3-ASR; WeNet para FireRedASR2-AED-WSM; ms-swift para el ajuste fino de las variantes Qwen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WS-Min-ASR (Qwen3-ASR-WSM-Min / Mandarin) | 1,7 B | 8192 tokens (config. ejemplo) | minnan, mandarín | no disponible | HuggingFace (ASLP-lab/WS-Min-ASR) |
| Whisper large-v3 (referencia) | 1,55 B | 30 s de audio por ventana | multilingüe (incluye chino, sin minnan específico) | MIT (según información pública del modelo) | Abierto |
| FireRedASR2-AED (modelo base) | no disponible | no disponible | chino, inglés (según modelo base) | no disponible | HuggingFace (FireRedTeam/FireRedASR2-AED) |
| Qwen3-ASR-1.7B (modelo base) | 1,7 B | no disponible | multilingüe (según modelo base) | no disponible | HuggingFace (Qwen/Qwen3-ASR-1.7B) |

La comparación cuantitativa de rendimiento no está disponible: la model card no publica métricas de WER ni comparaciones con Whisper u otros sistemas.

## Limitaciones y advertencias

- Cobertura lingüística restringida a minnan y mandarín; no se documenta soporte para otras lenguas.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; es un riesgo relevante para producción.
- No se publican métricas de calidad (WER/CER) ni benchmarks, por lo que el rendimiento real es desconocido.
- El corpus de entrenamiento (WenetSpeech-Min) puede introducir sesgos de dominio, registro y variedad dialectal del minnan; no se detalla su composición.
- Riesgo de alucinación inherente a los modelos de ASR basados en LLM, especialmente en audio ruidoso o con solapamiento de hablantes.
- El modelo no ha sido validado de forma independiente (0 descargas, 2 likes en el momento de la consulta), por lo que su robustez en condiciones reales no está contrastada.
- La ventana de contexto de 8192 tokens y el límite de 1024 tokens nuevos condicionan la duración máxima de audio procesable por segmento en la configuración de ejemplo.
- No se documentan salvaguardas frente a contenido sensible ni mecanismos de detección de habla no deseada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ASLP-lab/WS-Min-ASR
- Artículo WenetSpeech-Min: https://arxiv.org/abs/2609.36834
- Repositorio GitHub WenetSpeech-Min-Repo: https://github.com/ASLP-lab/WenetSpeech-Min-Repo
- Entrenamiento Qwen3-ASR-Min: https://github.com/ASLP-lab/WenetSpeech-Min-Repo/tree/main/Qwen3-ASR-Min
- Entrenamiento Qwen3-ASR-Mandarin: https://github.com/ASLP-lab/WenetSpeech-Min-Repo/tree/main/Qwen3-ASR-Mandarin
- Entrenamiento FireRedASR2-AED-WSM: https://github.com/ASLP-lab/WenetSpeech-Min-Repo/tree/main/FireRedASR2-AED-WSM
- Qwen3-ASR (GitHub): https://github.com/QwenLM/Qwen3-ASR#environment-setup
- ms-swift (documentación): https://swift.readthedocs.io/en/latest/GetStarted/SWIFT-installation.html
- WeNet (GitHub): https://github.com/wenet-e2e/wenet#install-for-training--deployment
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base FireRedASR2-AED: https://huggingface.co/FireRedTeam/FireRedASR2-AED
