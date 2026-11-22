# safu58/porabondhu-wav2vec2-bn-onnx-int8

## Resumen

porabondhu-wav2vec2-bn-onnx-int8 es una exportación a ONNX con cuantización dinámica int8 del modelo arijitx/wav2vec2-xls-r-300m-bengali, un sistema de reconocimiento automático del habla (ASR) para bengalí construido sobre la arquitectura XLS-R de Meta. Lo publica el usuario safu58 como artefacto derivado del proyecto PoraBondhu AI, cuyo objetivo es ofrecer inferencia rápida en CPU para aplicaciones de transcripción en bengalí sin depender de GPU.

El modelo no se ha reentrenado: se trata de los mismos pesos del checkpoint original, convertidos a formato ONNX y cuantizados de forma dinámica en las matrices de las capas MatMul. La entrada es `input_values` a 16 kHz y la salida es `logits`, por lo que el pipeline de decodificación (tokenizer y CTC) debe gestionarse externamente.

Su relevancia es práctica: reduce el coste de despliegue de un modelo de 300 millones de parámetros a un artefacto de unos 0,4 GB ejecutable en CPU, lo que facilita integrar ASR en bengalí en servicios ligeros, dispositivos de borde o entornos sin acelerador. La información publicada por el autor es muy escasa: no se documentan métricas de calidad tras la cuantización ni detalles del proceso de exportación más allá de la referencia al script.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 / XLS-R (transformer convolucional + encoder Transformer, CTC) |
| Parametros totales | 300M (heredados del modelo base arijitx/wav2vec2-xls-r-300m-bengali) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no documentada en la model card) |
| Tipos de cuantizacion | int8 dinamica (pesos de capas MatMul) en ONNX |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8 dinamico) |

## Arquitectura y entrenamiento

El modelo base es un wav2vec2 con inicialización XLS-R de 300 millones de parámetros, una arquitectura de ASR auto-supervisada que combina un extractor de características convolucional sobre la forma de onda cruda con un encoder Transformer y una cabeza de clasificación entrenada con CTC. El checkpoint original de arijitx se ajustó para bengalí; la model card del artefacto ONNX no detalla el corpus de ajuste fino, el número de horas de audio ni si hubo aumentos de datos.

La contribución de esta versión es exclusivamente de despliegue: exportación a ONNX mediante el script `backend/scripts/export_onnx.py` del repositorio PoraBondhu AI y cuantización dinámica int8 de los pesos de las operaciones MatMul. No hay reentrenamiento, destilación ni cambios en la topología. La entrada esperada son muestras de audio a 16 kHz y la salida son logits, de modo que la decodificación CTC y el mapeo a tokens quedan fuera del grafo exportado. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla en bengalí a partir de audio de 16 kHz.
- Salida de logits por fotograma para decodificación CTC externa (greedy o beam search con un modelo de lenguaje, si se implementa).
- Inferencia en CPU gracias a la cuantización int8 dinámica y al formato ONNX.
- Integración con runtimes ONNX (onnxruntime, entre otros) sin dependencia de PyTorch en producción.
- No soporta tool calling ni function calling: es un modelo puramente acústico de transcripción.
- No dispone de modo de razonamiento, agentes, visión ni audio generativo.
- Capacidad multilingüe limitada al bengalí; no se documenta transferencia a otras lenguas.
- No se documentan capacidades de diarización, puntuación ni marcas de tiempo.

## Casos de uso

- Transcripción de audio en bengalí en servicios backend sin GPU: el artefacto ONNX int8 se ejecuta en CPU con onnxruntime, lo que permite desplegar ASR en contenedores estándar sin acelerador y con un peso de repositorio de unos 0,4 GB.
- Subtitulado de vídeo y pódcast en bengalí: se procesa el audio remuestreado a 16 kHz, se obtienen los logits y se decodifica con CTC para generar transcripciones que alimenten pipelines de subtítulos.
- Asistentes de voz y atención al cliente en bengalí: el modelo actúa como primera etapa de un pipeline ASR-NLU, transcribiendo la consulta del usuario antes de pasarla a un sistema de intents o a un LLM.
- Aplicaciones de borde o de escritorio: al ser ONNX int8, puede integrarse en aplicaciones locales (por ejemplo, con onnxruntime en Windows, Linux o macOS) para dictado o notas de voz sin conexión.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones para construir índices de texto buscables en archivos de radio, reuniones o archivos institucionales en bengalí.
- Investigación en ASR de bajos recursos: sirve como referencia cuantizada para comparar latencia y precisión frente al checkpoint original en FP32 y evaluar el impacto de la cuantización dinámica int8.
- Preprocesado en pipelines de datos: generación de transcripciones a gran escala en CPU para construir corpus de texto en bengalí a partir de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones con el checkpoint original en FP32, ni mediciones de latencia o throughput tras la cuantización.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; en GPU, el modelo de 300M en int8 ocupa del orden de 0,3-0,4 GB de memoria, aunque no se documenta un backend GPU probado.
- GPU recomendadas: no disponibles; el artefacto está orientado a CPU.
- GPU de consumo: cualquier GPU con al menos 1-2 GB de memoria podría alojar los pesos, pero no hay validación publicada.
- CPU: suficiente para inferencia en producción; el objetivo declarado del autor es "fast CPU inference".
- Opciones de despliegue: onnxruntime (principal), potencialmente otros runtimes compatibles con ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| safu58/porabondhu-wav2vec2-bn-onnx-int8 | 300M | no disponible | bn | Apache-2.0 | ONNX int8 | Cuantizado para CPU, sin métricas publicadas |
| arijitx/wav2vec2-xls-r-300m-bengali | 300M | no disponible | bn | Apache-2.0 (según modelo base) | safetensors/PyTorch | Checkpoint original en FP32, referencia de calidad |
| facebook/wav2vec2-xls-r-300m | 300M | no disponible | multilingüe (preentrenamiento) | Apache-2.0 | PyTorch | Modelo base XLS-R sin ajuste específico a bengalí |

## Limitaciones y advertencias

- No se han publicado métricas de WER o CER tras la cuantización int8; la degradación respecto al checkpoint original es desconocida.
- El modelo solo cubre bengalí; el rendimiento en otras lenguas o en code-switching no está documentado.
- Al ser un modelo acústico CTC, no genera puntuación, mayúsculas ni marcas de tiempo por sí mismo; requiere postprocesado.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, habitual en modelos CTC.
- Sesgos de dominio y de hablantes: el corpus de ajuste fino no está documentado, por lo que se desconoce la cobertura de acentos, géneros y registros.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- La fecha de creación indicada (2026-11-22) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos; conviene tratarla con cautela.
- No se documenta el proceso de exportación más allá de la referencia al script, ni la versión de onnxruntime ni la de opset utilizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/safu58/porabondhu-wav2vec2-bn-onnx-int8
- Modelo base: https://huggingface.co/arijitx/wav2vec2-xls-r-300m-bengali
- Repositorio PoraBondhu AI: https://github.com/mohammadyaksafu/porabondhu-ai
- XLS-R de Meta (referencia del preentrenamiento): https://huggingface.co/facebook/wav2vec2-xls-r-300m
