# 7ven7o/Ming-3.0-tts-tiny-Q6GB

## Resumen

Ming-3.0-tts-tiny-Q6GB es una cuantización del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por el usuario 7ven7o. El modelo original es un sistema text-to-speech con arquitectura MoE (Mixture of Experts) de 8,98 mil millones de parámetros totales y 1,3 mil millones de parámetros activos, orientado a la generación de audio con control de instrucciones (por ejemplo, emoción). Esta versión cuantizada emplea `torchao` para reducir el peso a un objetivo de VRAM de 6 GB o menos en GPUs CUDA.

La relevancia de este checkpoint reside en que permite ejecutar un modelo TTS de casi 9B parámetros en GPUs de consumo, algo inviable con los pesos en precisión completa. La cuantización combina `uint4_g64` para los expertos MoE (6,95B) e `int8` para la atención del LLM, los expertos compartidos, el Flow DiT, el Aggregator y el decoder del AudioVAE, mientras que los embeddings de palabras y el encoder del AudioVAE se mantienen en CPU.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch (`gpu_weights.pt` y `cpu_weights.pt`) y un runtime propio (`quant_runtime.py`) que depende del repositorio upstream `inclusionAI/Ming-3.0-tts`. Está pensado para inferencia en `cuda:0` con `torchao==0.9.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con Flow DiT, Aggregator y AudioVAE |
| Parametros totales | 8,98B (modelo base) |
| Parametros activos | 1,3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | uint4_g64 (expertos MoE), int8 (atención LLM, expertos compartidos, Flow DiT, Aggregator, decoder AudioVAE), bfloat16/fp32 en CPU (embeddings y encoder AudioVAE) |
| Idiomas soportados | no disponible (los ejemplos de audio muestran inglés y chino) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`gpu_weights.pt`, `cpu_weights.pt`) con tensor subclasses de `torchao`; tags incluyen `onnx` |

## Arquitectura y entrenamiento

El modelo base Ming-3.0-tts-tiny es un sistema text-to-speech que combina un LLM con arquitectura MoE (8,98B totales, 1,3B activos) junto con un Flow DiT, un Aggregator y un decoder AudioVAE para la síntesis de audio. La cuantización de 7ven7o aplica `uint4_g64` a los 6,95B de parámetros de los expertos MoE e `int8` al resto de componentes en GPU, dejando los embeddings de palabras y el encoder del AudioVAE en CPU en bfloat16/fp32. Además, se elimina el `lm_head` no utilizado, lo que reduce 0,48 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card solo documenta el proceso de cuantización y el uso del runtime, no los detalles de entrenamiento del modelo original.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto libre.
- Control de instrucciones de estilo, incluyendo emoción (por ejemplo, `emotion="happy"` o `emotion="sad"`).
- Generación de audio en inglés y chino (según los ejemplos de audio publicados).
- Modo `freeform` para generación con instrucciones en lenguaje natural.
- Inferencia en GPU CUDA con un pico de VRAM de 5,639 GB.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz para asistentes conversacionales: el modelo permite generar respuestas habladas con control de emoción, adecuado para interfaces de voz que requieren entonación variable.
- Audiolibros y narración automatizada: la capacidad de instruir el estilo (emoción, tono) permite generar narraciones con matices expresivos a partir de texto.
- Doblaje y localización de contenido: con soporte de inglés y chino, puede emplearse para generar pistas de voz en ambos idiomas en flujos de localización.
- Prototipado de productos de voz en GPUs de consumo: al caber en menos de 6 GB de VRAM, permite desarrollar y probar sistemas TTS en estaciones de trabajo con RTX 4090 o similares sin infraestructura de datacenter.
- Generación de avisos y mensajes con carga emocional: útil en sistemas de atención al cliente o notificaciones donde el tono (alegre, triste) es relevante.
- Investigación en TTS cuantizado: sirve como referencia para estudiar el impacto de la cuantización uint4/int8 en la calidad de audio de modelos MoE de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 5,302 GB asignados en carga y 5,639 GB de pico asignado (5,69 GB reservado) en CUDA.
- Pesos en GPU: 5,308 GB (`gpu_weights.pt`); pesos en CPU: 2,16 GB (`cpu_weights.pt`).
- GPU recomendadas: cualquier GPU CUDA con al menos 6 GB de VRAM; cabe en GPUs de consumo como la RTX 4090 y previsiblemente en modelos con 8 GB o más.
- Despliegue: runtime propio `quant_runtime.py` del repositorio `inclusionAI/Ming-3.0-tts`, con `torch==2.6.0`, `torchaudio==2.6.0`, `torchao==0.9.0`, `transformers==4.46.3`, `fla-core==0.4.2`, `x-transformers==2.7.4`, `einops`, `einx`, `soundfile` y `onnxruntime`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts-tiny-Q6GB | 8,98B totales / 1,3B activos | no disponible | MIT | PyTorch (torchao) | Cuantizado a <= 6 GB VRAM |
| inclusionAI/Ming-3.0-tts-tiny | 8,98B totales / 1,3B activos | no disponible | no disponible | no disponible | Modelo base sin cuantizar |
| Otros modelos TTS | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo.
- Riesgo de alucinación no evaluado; en TTS se traduce en posibles artefactos o pronunciaciones incorrectas.
- Idiomas soportados no declarados formalmente; solo hay ejemplos en inglés y chino.
- La licencia MIT del checkpoint aplica a esta cuantización; deben verificarse las condiciones del modelo base `inclusionAI/Ming-3.0-tts-tiny` para uso comercial.
- Dependencia estricta de versiones concretas (`torchao==0.9.0`, `torch==2.6.0`, `transformers==4.46.3`), lo que puede complicar la integración en entornos existentes.
- Requiere clonar el repositorio upstream y apuntar `_UPSTREAM_DIR` correctamente; no es un checkpoint autónomo.
- El repo tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del rendimiento ni de la calidad del audio.
- El proceso de cuantización fue realizado por una herramienta denominada "Gemini 4 Neon", sin documentación pública del procedimiento.

## Enlaces

- [Hugging Face: 7ven7o/Ming-3.0-tts-tiny-Q6GB](https://huggingface.co/7ven7o/Ming-3.0-tts-tiny-Q6GB)
- [Modelo base: inclusionAI/Ming-3.0-tts-tiny](https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny)
- [Repositorio upstream: inclusionAI/Ming-3.0-tts](https://github.com/inclusionAI/Ming-3.0-tts)
