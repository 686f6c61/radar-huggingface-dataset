# jkacan/whisper-tiny_to_chinese_accent

## Resumen

Whisper tiny Chinese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario jkacan en Hugging Face. Se trata de un modelo de reconocimiento automático del habla (ASR) derivado del checkpoint tiny de la familia Whisper de OpenAI, que cuenta con 37,76 millones de parámetros y una arquitectura transformer encoder-decoder característica de esta familia. El modelo se ha entrenado sobre un dataset denominado "Chinese English", presumiblemente para mejorar la transcripción de habla inglesa con acento chino, aunque la model card no detalla la composición exacta de los datos.

El modelo resulta relevante en el nicho de ASR especializado: los modelos Whisper originales rinden de forma irregular ante acentos no nativos, y un ajuste fino sobre un subconjunto acentuado puede reducir la tasa de error de palabra (WER) en ese dominio concreto. Con un WER declarado de 13,26 sobre el split de test del dataset Chinese English, el modelo se posiciona como una alternativa ligera (0,3 GB de repositorio) para despliegues con recursos limitados.

No obstante, la información pública es escasa: la model card está generada automáticamente y contiene secciones "More information needed". El modelo declara únicamente el idioma inglés, licencia Apache 2.0 y 22 descargas, lo que indica un uso muy limitado y ninguna validación independiente de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder con 37,76 millones de parámetros. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y el decoder genera la transcripción de forma autorregresiva. El checkpoint tiny es el más pequeño de la familia Whisper y está pensado para entornos con cómputo muy limitado.

El entrenamiento se realizó con el Trainer de Hugging Face sobre el dataset "Chinese English". Los hiperparámetros documentados son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluación de 1, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. La semilla fue 42. No se documenta el número de tokens ni la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). Las versiones de framework reportadas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización declarada en habla inglesa con acento chino.
- Transcripción de audio en ventanas de hasta 30 segundos por segmento, según el diseño de Whisper.
- Generación de transcripciones con puntuación y mayúsculas, heredadas del preentrenamiento de Whisper.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card (aunque el ajuste fino podría haber alterado el comportamiento en otros idiomas, no está documentado).
- No dispone de modo thinking, visión ni audio más allá del ASR estándar.

## Casos de uso

- Transcripción de reuniones con participantes no nativos: el ajuste sobre habla con acento chino puede reducir errores en entornos corporativos donde se mezclan hablantes nativos y no nativos de inglés.
- Subtitulado de contenido audiovisual: el modelo puede generar subtítulos en inglés para vídeos o podcasts con acento chino, con un coste computacional mínimo gracias a sus 37,76 M de parámetros.
- Prototipado rápido de pipelines ASR: su tamaño reducido (0,3 GB) permite iterar en local sin GPU dedicada, útil para validar arquitecturas antes de escalar a modelos mayores.
- Investigación sobre robustez ante acentos: sirve como punto de partida para estudiar el impacto del fine-tuning en la reducción del WER sobre subconjuntos acentuados.
- Despliegue en dispositivos edge: el checkpoint tiny puede ejecutarse en CPU o GPUs de gama baja, adecuado para asistentes de voz embebidos en inglés con acento chino.
- Evaluación comparativa de fine-tunings de Whisper: útil como baseline en estudios que comparen ajustes finos por acento sobre la familia Whisper.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| Chinese English | test | WER | 13,2645 |
| Chinese English | validación (step 1000) | WER | 14,2812 |
| Chinese English | validación (step 2000) | WER | 13,2645 |
| Chinese English | validación (step 2000) | Loss | 0,3070 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 M de parámetros), y por debajo de 0,5 GB en fp16 o cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona holgadamente en RTX 3060, RTX 4060, T4, e incluso en CPU.
- Cabe en cualquier GPU consumer, incluidas integradas con soporte CUDA o incluso ejecución en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), y potencialmente llama.cpp/Ollama no aplican (no es un modelo de lenguaje); vLLM y TGI no soportan ASR de Whisper de forma nativa en todas sus versiones. Se recomienda transformers o faster-whisper para producción.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera procesamiento en tiempo real o superior en GPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | WER (Chinese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkacan/whisper-tiny_to_chinese_accent | 37,76 M | 30 s | 13,26 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos sobre el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- Model card generada automáticamente con secciones incompletas ("More information needed"); no hay documentación sobre sesgos, composición del dataset ni metodología de evaluación.
- El WER de 13,26 está declarado como no verificado (verified: false) y procede de un único split de test de un dataset no descrito en detalle.
- Riesgo de alucinación en ASR: Whisper puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Idioma declarado únicamente inglés; el comportamiento en otros idiomas no está documentado y podría degradarse respecto al modelo base.
- El ajuste fino sobre un dataset acentuado puede provocar sobreajuste y degradar el rendimiento en inglés estándar sin acento; no hay evaluación cruzada que lo confirme.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar las condiciones del modelo base (también Apache 2.0).
- Con 22 descargas y 0 likes, no hay evidencia de uso en producción ni validación comunitaria.
- No apto para tareas de comprensión semántica, tool calling o agentes; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkacan/whisper-tiny_to_chinese_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
