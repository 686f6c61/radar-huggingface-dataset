# KhoiBui/lifemate-phowhisper-large-v12_update

## Resumen

LifeMate PhoWhisper Large V12 Update es un modelo de reconocimiento automático del habla (ASR) en vietnamita, resultado de un ajuste fino supervisado (SFT) sobre `vinai/PhoWhisper-large`. Lo desarrolla el usuario KhoiBui y está orientado a interacciones con agentes de voz: comandos conversacionales, control de dispositivos inteligentes y aplicaciones, y reconocimiento de entidades nombradas, números, fechas y horas. El modelo mantiene la arquitectura Whisper original (encoder-decoder transformer) con 1.543.304.960 parámetros totales.

La motivación es clara: en sistemas de voz-a-acción, un error de transcripción se propaga directamente a la selección de herramienta y a la ejecución de la tarea. El ajuste busca reducir ese fallo en el dominio específico de LifeMate, con una mejora declarada de WER del 24,31 % al 9,56 % y de CER del 13,66 % al 5,86 % sobre un conjunto de validación retenido, además de subir el Exact Match del 13,79 % al 43,10 %.

El modelo es relevante por su especialización: no compite como ASR generalista, sino como componente de un pipeline de agente de voz en vietnamita. La licencia BSD-3-Clause facilita su integración comercial, aunque el rendimiento fuera del dominio conversacional y de comandos puede degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `vinai/PhoWhisper-large`, un Whisper large adaptado al vietnamita, y aplica SFT con el encoder congelado (`freeze_encoder=True`) y el decoder ajustado. La decisión de congelar el encoder busca preservar las representaciones acústicas multidioma y multidialecto de PhoWhisper, mientras el decoder se adapta al estilo de transcripción de comandos y conversaciones de LifeMate. La tasa de aprendizaje fue de 1e-5 durante 5 épocas.

El dataset de entrenamiento consta de 4.862 pares `(WAV a 16 kHz, transcripción gold)`, con un split de validación estratificado de 174 ejemplos y sin solapamiento entre entrenamiento y validación. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; el ajuste es exclusivamente supervisado.

## Capacidades

- Reconocimiento automático del habla en vietnamita sobre audio a 16 kHz.
- Transcripción de habla conversacional y de comandos de asistente de voz.
- Reconocimiento robusto de entidades nombradas, números, fechas y horas.
- Comprensión de peticiones de control de dispositivos inteligentes y aplicaciones.
- Salida de texto plano mediante el pipeline `automatic-speech-recognition` de Transformers, con `language="vi"` y `task="transcribe"`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio generativo ni modo de razonamiento explícito; el modelo es un componente ASR, no un agente completo.

## Casos de uso

- Asistentes de voz domésticos: el modelo transcribe comandos como encender luces o cambiar de canal, con una recall de entidades y números del 91,58 % en validación, lo que reduce la tasa de comandos mal interpretados.
- Control de aplicaciones por voz: peticiones del tipo "chuyển sang kênh VTV6" se transcriben correctamente, lo que permite mapear la intención a una acción concreta en el backend.
- Consultas de información en tiempo real: preguntas sobre precios de carburante o cotización del oro se transcriben con fidelidad, requisito para que el agente consulte la fuente adecuada.
- Gestión de recordatorios y agenda: frases con hora y fecha ("nhắc tôi lấy đồ giặt lúc tám giờ tối mai") se reconocen con precisión, lo que permite crear recordatorios estructurados.
- Transcripción de conversaciones de atención al cliente en vietnamita: el ajuste al habla conversacional y la mejora de CER al 5,86 % lo hacen adecuado para generar actas o resúmenes posteriores.
- Componente ASR en pipelines de agentes LLM: al reducir el WER al 9,56 %, disminuye la propagación de errores hacia la selección de herramientas del agente.
- Subtitulado de contenido conversacional en vietnamita: la mejora de Exact Match al 43,10 % reduce la necesidad de corrección manual en tramos cortos y comandos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de validación retenido (174 ejemplos):

| Metrica | PhoWhisper-large | LifeMate V12 Update |
|---|---:|---:|
| WER normalizado (%) ↓ | 24,31 | 9,56 |
| WER sensible a mayúsculas (%) ↓ | 38,49 | 13,06 |
| CER (%) ↓ | 13,66 | 5,86 |
| Exact Match (%) ↑ | 13,79 | 43,10 |
| Recall de entidades y números (%) ↑ | 71,58 | 91,58 |
| Latencia media de inferencia (ms) ↓ | 631,40 | 549,40 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; los datos anteriores son específicos del conjunto de validación de LifeMate.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más memoria para activaciones y buffers de decodificación; en la práctica, entre 4 y 6 GB según longitud de audio y batch.
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090 y RTX 3090 para inferencia de baja latencia en producción pequeña.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y superiores; también en GPUs con 6-8 GB si se usa cuantización (no documentada por el autor).
- Opciones de despliegue: pipeline de Transformers con `torch_dtype=torch.float16`, vLLM (soporte de Whisper), TGI, y exportación a otros runtimes previa conversión (no documentada).
- Latencia declarada: 549,40 ms de media en el conjunto de validación, frente a 631,40 ms del modelo base. El throughput no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (validacion LifeMate) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| LifeMate PhoWhisper Large V12 Update | 1.543.304.960 | no disponible | 9,56 % | BSD-3-Clause | Hugging Face |
| vinai/PhoWhisper-large | no disponible en la informacion | no disponible | 24,31 % | no disponible en la informacion | Hugging Face |
| Whisper large-v3 (OpenAI) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparación con Whisper large-v3 u otros ASR en vietnamita no puede cuantificarse con los datos proporcionados; el único punto de referencia medido es el modelo base PhoWhisper-large sobre el mismo conjunto de validación.

## Limitaciones y advertencias

- Evaluado principalmente sobre habla conversacional y orientada a tareas en vietnamita; el rendimiento puede degradarse en entornos muy ruidosos o en dominios no vistos durante el ajuste fino.
- Es un componente ASR, no un sistema completo de agente de voz; requiere un módulo de intención y ejecución posterior.
- El conjunto de validación es pequeño (174 ejemplos), por lo que las métricas declaradas tienen un margen de error considerable y no garantizan el mismo rendimiento en producción.
- Riesgo de alucinación en transcripciones: como todo modelo Whisper, puede generar texto plausible en segmentos de audio ininteligibles o silencios.
- Sesgos dialectales y de dominio no documentados; el encoder congelado conserva las representaciones de PhoWhisper, pero el decoder se ha especializado en el estilo LifeMate.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantías; conviene revisar las condiciones de la licencia del modelo base PhoWhisper-large.
- No se documentan cuantizaciones oficiales ni formatos GGUF; el despliegue en CPU requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KhoiBui/lifemate-phowhisper-large-v12_update
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
