# Prahaladha/hima-asr-mlx-4bit

## Resumen

Hima-ASR MLX 4-bit es la variante cuantizada para Apple Silicon del modelo de reconocimiento automático del habla Hima-ASR, desarrollado por el usuario Prahaladha. Convierte audio en texto para once lenguas de la India (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) más inglés, y añade una funcionalidad poco habitual: una cabeza de decisión que responde preguntas de opción múltiple sobre el clip, tanto por lo que se dice como por cómo suena. Está pensado para ejecutarse íntegramente en GPUs de Apple mediante la librería MLX, sin depender de PyTorch.

El modelo combina un codificador de audio inicializado desde Qwen3-ASR-1.7B con un decodificador de texto inicializado desde Gemma 3 270M, y suma una cabeza de decisión de 17,5 millones de parámetros. La versión 4-bit ocupa 379 MB y alcanza 73 veces tiempo real en un MacBook Pro con M4 Pro, lo que la sitúa como la opción más ligera y rápida de la familia junto a la 8-bit.

Su relevancia actual reside en dos factores: cubre un conjunto de lenguas indias con muy poca oferta de modelos abiertos ligeros, y ofrece una vía de despliegue local en hardware de consumo Apple para tareas de análisis de llamadas (tono, intención, urgencia) sin enviar audio a la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador de audio tipo transformer (inicializado desde Qwen3-ASR-1.7B) + decodificador de texto (inicializado desde Gemma 3 270M) + cabeza de decisión |
| Parámetros totales | 104.647.384 (0,1B); cabeza de decisión: 17,5M adicionales |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit en el codificador de audio; 8-bit con group size 64 en la tabla de piezas y el decodificador de texto |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en |
| Licencia | Apache 2.0 para las partes propias de Hima-ASR; decodificador de texto sujeto a Gemma Terms of Use (licencia compuesta `apache-2.0-and-gemma`) |
| Formato de pesos | safetensors (MLX), más `mel_filters.npy`, `tokenizer.json` y `decide/head.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un sistema en dos etapas: un codificador de audio que procesa la señal y un decodificador de texto que genera la transcripción, complementados por una cabeza de decisión que lee cada capa del codificador y del decodificador para clasificar el clip. El codificador parte de Qwen3-ASR-1.7B y el decodificador de Gemma 3 270M, ambos con licencia Apache 2.0 en origen. La cuantización aplicada es mixta: 4-bit para el codificador y 8-bit (group size 64) para la tabla de piezas y el decodificador de texto.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. La decodificación es greedy según la implementación incluida en `hima_mlx.py`. La innovación destacable es la cabeza de decisión (`decide/`), que permite formular preguntas de tipo `choice`, `yesno` y `scale` sobre el audio y obtener distribuciones de probabilidad, integrando reconocimiento y análisis en una sola pasada.

## Capacidades

- Transcripción de voz a texto en once lenguas indias y en inglés, con detección automática de idioma si se pasa `language=None`.
- Soporte de code-switching entre lenguas indias e inglés, según las etiquetas del modelo.
- Decisión sobre audio: responde preguntas de opción múltiple sobre el clip combinando contenido lingüístico y características acústicas.
- Diecisiete decisiones predefinidas: idioma, género, tono, sentimiento, emoción, si es pregunta, petición de acción, mención de dinero, mención de tiempo, queja, acuerdo, deseo de hablar con humano, tema, urgencia, formalidad e intención de llamada.
- Preguntas personalizadas con tipos `choice`, `yesno` y `scale`.
- Entrada de audio a 16 kHz en archivos o arrays; con librosa se admiten otras frecuencias de muestreo.
- No incluye tool calling ni capacidades de agente multi-paso; es un modelo de ASR y clasificación de audio.

## Casos de uso

- Análisis de llamadas de atención al cliente: `model.run()` devuelve transcripción y diecisiete decisiones en una sola pasada, lo que permite enrutar la llamada según urgencia, tono o intención sin un pipeline separado de NLP.
- Transcripción local en Mac para entrevistas o reuniones en hindi, tamil o bengalí, sin enviar audio a servicios externos y con 73 veces tiempo real en M4 Pro.
- Detección de quejas y sentimiento en centros de contacto: la decisión `complaint` y `sentiment` permiten priorizar casos y medir satisfacción a escala.
- Control de calidad de agentes: las decisiones `formality`, `tone` y `wants_human` sirven para auditar interacciones y detectar escalados mal gestionados.
- Investigación lingüística en lenguas indias de bajos recursos: el modelo permite transcribir corpus de asamés, oriya o malabar en hardware de consumo.
- Clasificación de audio sin transcripción completa: la cabeza de decisión puede responder preguntas sobre un clip aunque no se necesite el texto, útil para triaje rápido.
- Prototipado en Apple Silicon: al no requerir PyTorch y ocupar 379 MB, se integra en aplicaciones de escritorio o scripts locales con dependencias mínimas (mlx, numpy, tokenizers, soundfile).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí incluye medidas de velocidad en un MacBook Pro con M4 Pro:

| Versión | Tamaño | Velocidad (veces tiempo real) |
|---|---|---|
| PyTorch original (GPU Mac) | 920 MB | 21x |
| MLX fp16 | 1,0 GB | 63x |
| MLX 8-bit | 536 MB | 73x |
| MLX 4-bit | 379 MB | 73x |

## Requisitos de hardware

- VRAM/unified memory estimada: 379 MB de pesos en 4-bit; el consumo real añade el estado de activaciones y el front-end log-mel, por lo que conviene reservar al menos 1 GB.
- Hardware objetivo: GPUs de Apple Silicon mediante MLX; medido en M4 Pro.
- Cabe en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA ni para CPU x86 con PyTorch.
- Despliegue: librería MLX (`pip install mlx mlx-lm`) y el script `hima_mlx.py` descargado desde el repositorio; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 73 veces tiempo real en M4 Pro, equivalente a procesar una hora de audio en aproximadamente 49 segundos.
- Dependencias: mlx, mlx-lm, numpy, tokenizers, soundfile y huggingface_hub; librosa opcional para otras frecuencias de muestreo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| Hima-ASR MLX 4-bit | 0,1B (+17,5M cabeza) | 11 indias + inglés | No disponible | Apache 2.0 + Gemma | MLX (Apple Silicon) |
| Hima-ASR MLX 8-bit | 0,1B (+17,5M cabeza) | 11 indias + inglés | No disponible | Apache 2.0 + Gemma | MLX (Apple Silicon) |
| Hima-ASR (PyTorch) | 0,1B (+17,5M cabeza) | 11 indias + inglés | No disponible | Apache 2.0 + Gemma | PyTorch |
| Whisper (variantes pequeñas) | 39M–244M | ~99 idiomas | 30 s de audio | MIT | PyTorch, GGUF, ONNX |

La comparación con Whisper es orientativa por categoría (ASR ligero multilingüe); no se dispone de datos de benchmarks que permitan comparar precisión entre ambos. Frente a las otras variantes de Hima-ASR, la 4-bit iguala la velocidad de la 8-bit con menor tamaño, a costa de una cuantización más agresiva en el codificador.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (WER) ni evaluaciones por idioma; el rendimiento en lenguas de bajos recursos como oriya o asamés es desconocido.
- La cuantización 4-bit del codificador puede degradar la transcripción frente a fp16; conviene validar en el dominio concreto antes de producción.
- La licencia es compuesta: las partes propias son Apache 2.0, pero el decodificador de texto está sujeto a los Gemma Terms of Use, lo que impone restricciones adicionales al uso comercial. Revisar `NOTICE` antes de desplegar.
- Riesgo de alucinación en segmentos con ruido, música o habla solapada, habitual en modelos ASR.
- Las decisiones de la cabeza clasificadora son probabilísticas y pueden reflejar sesgos de género, tono o formalidad presentes en los datos de entrenamiento; no deben usarse como única señal en decisiones sensibles.
- Solo funciona en Apple Silicon con MLX; no hay pesos GGUF ni soporte para CUDA en este repositorio.
- La longitud máxima de audio por inferencia no está documentada.
- El modelo tiene 46 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima-asr-mlx-4bit
- Modelo base Hima-ASR: https://huggingface.co/Prahaladha/hima-asr
- Variante MLX fp16: https://huggingface.co/Prahaladha/hima-asr-mlx
- Variante MLX 8-bit: https://huggingface.co/Prahaladha/hima-asr-mlx-8bit
- Aviso de licencia (NOTICE): https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Listado de modelos con etiqueta hima_asr: https://huggingface.co/models?other=hima_asr
