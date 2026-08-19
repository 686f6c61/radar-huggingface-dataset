# KasuleTrevor/cdli-qwen3-asr-lg-uganda-universal-prompt-const5e-5r

## Resumen

El modelo `KasuleTrevor/cdli-qwen3-asr-lg-uganda-universal-prompt-const5e-5r` es un sistema de reconocimiento automático del habla (ASR) especializado en luganda, la lengua más hablada de Uganda. Desarrollado por KasuleTrevor en el marco del desafío CDLI (Collective Data for Language Inclusion), este modelo es un fine-tune del modelo base `KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, que a su vez deriva de la familia Qwen3-ASR de Alibaba. Su propósito principal es transcribir habla atípica o no estándar —caracterizada por repeticiones, disfluencias, falsos arranques y palabras parciales— sin normalizar ni corregir el texto, tal como se especifica en el prompt universal que utiliza.

Con 2.038.052.480 parámetros (aproximadamente 2,04 mil millones), el modelo está diseñado para ser condicionado por un prompt que instruye al sistema a preservar fielmente las características del habla original. Esto lo hace especialmente relevante para aplicaciones de transcripción en entornos reales donde el habla no es perfecta, como entrevistas, conversaciones informales o grabaciones de campo. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en productos y servicios.

El modelo se entrenó durante 5 épocas con el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, utilizando una tasa de aprendizaje de 5e-5 y un scheduler constante con warmup. Los resultados en el conjunto de prueba muestran un WER normalizado de 0,5128 y un CER normalizado de 0,2306, lo que indica que, aunque el desafío es considerable, el modelo logra capturar la estructura fonética del habla atípica en luganda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer, fine-tune) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lg (luganda) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR, una familia de modelos de reconocimiento de voz desarrollada por Alibaba que combina un encoder de audio con un decoder de texto, y que soporta condicionamiento por prompt. En este caso, el fine-tune se realizó sobre un modelo base ya adaptado al luganda típico (`cdli-qwen3-asr-lg-typical-1p7b-base-finetune`), y se entrenó específicamente con habla no estándar del dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`. El entrenamiento utilizó una tasa de aprendizaje de 5e-5, un scheduler constante con warmup y 5 épocas completas. El prompt universal empleado instruye al modelo a transcribir exactamente lo que se dice, preservando repeticiones, disfluencias, falsos arranques y palabras parciales, sin normalizar ni corregir la gramática. Este enfoque experimental busca maximizar la fidelidad de la transcripción en contextos de habla atípica, en lugar de producir una salida "limpia".

## Capacidades

- Transcripción de audio en luganda, incluyendo habla no estándar con disfluencias, repeticiones y falsos arranques.
- Condicionamiento por prompt: el modelo acepta un prompt que define el comportamiento de transcripción (en este caso, preservación exacta del habla).
- Reconocimiento de habla atípica, como la producida por personas con dificultades del habla o en entornos ruidosos.
- Salida de texto sin normalización, resumen, traducción ni corrección gramatical, según el prompt configurado.
- Compatible con la librería `transformers` de Hugging Face, lo que facilita su integración en pipelines de ASR existentes.
- No se han documentado capacidades adicionales como tool calling, agentes o procesamiento de visión.

## Casos de uso

- Transcripción de entrevistas y testimonios en luganda: el modelo puede procesar grabaciones de campo donde los hablantes presentan disfluencias naturales, preservando la fidelidad del discurso para análisis cualitativos o documentación.
- Subtitulado de vídeos en luganda: al mantener repeticiones y falsos arranques, el subtitulado refleja el habla real, útil para contenido educativo o periodístico sin edición.
- Transcripción de reuniones y conversaciones informales: en entornos donde los participantes hablan de forma espontánea, el modelo captura el flujo real de la conversación, facilitando actas o resúmenes posteriores.
- Investigación lingüística y sociolingüística: permite analizar patrones de disfluencia y variación en el habla luganda, ya que la transcripción no normaliza el texto.
- Atención al cliente en luganda: aunque el modelo no está entrenado para diálogo, puede transcribir llamadas o mensajes de voz de clientes, incluso si el habla es atípica, para su posterior análisis o derivación a agentes humanos.
- Archivado de material oral: instituciones culturales o bibliotecas pueden digitalizar grabaciones históricas en luganda, manteniendo la integridad del habla original.

## Benchmarks y rendimiento

El autor proporciona métricas en el conjunto de prueba del dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| WER normalizado | 0,512830 |
| CER normalizado | 0,230589 |
| WER promedio con tope (capped) | 0,439095 |
| CER promedio con tope (capped) | 0,181459 |

Estos valores indican que el modelo tiene una tasa de error considerable, lo que refleja la dificultad del habla atípica. No obstante, el CER más bajo sugiere que la mayoría de los errores son de tipo léxico más que fonético.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Sin embargo, dado el tamaño del modelo (2,04 mil millones de parámetros), se pueden hacer estimaciones razonables:

- VRAM estimada para inferencia en FP16: aproximadamente 4-5 GB, más overhead de activaciones, por lo que se recomienda al menos 8 GB de VRAM.
- Con cuantización a 8 bits (si estuviera disponible), podría caber en GPUs con 6 GB de VRAM, como una RTX 2060 o GTX 1660.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, A10, A100, o cualquier GPU con al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de `transformers`, puede ejecutarse con Hugging Face pipelines, así como con servidores de inferencia como vLLM, TGI o FriendliAI (este último ya lo lista en su catálogo).
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud del audio de entrada.

## Comparativa con modelos similares

Se comparan modelos de la misma colección CDLI de KasuleTrevor, aunque no se dispone de métricas públicas para todos ellos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `cdli-qwen3-asr-lg-uganda-universal-prompt-const5e-5r` (este) | 2,04B | no disponible | lg | Apache 2.0 | Fine-tune con prompt universal para habla atípica |
| `cdli-qwen3-asr-lg-atypical-stage3-1p7b-base` | 1,7B (estimado) | no disponible | lg | Apache 2.0 | Fine-tune en etapas para habla atípica, checkpoint-500 |
| `cdli-qwen3-asr-lg-typical-1p7b-base-finetune` | 1,7B (estimado) | no disponible | lg | Apache 2.0 | Modelo base típico, del que deriva este fine-tune |

No se dispone de datos de rendimiento comparativos. La principal diferencia entre este modelo y el `atypical-stage3` es el uso de un prompt universal estricto que preserva disfluencias, mientras que el otro podría tener un enfoque de entrenamiento por etapas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para luganda; no soporta otros idiomas y su rendimiento en habla estándar puede ser inferior al de modelos multilingües.
- El WER normalizado de 0,51 indica que aproximadamente la mitad de las palabras se transcriben incorrectamente, lo que puede ser inaceptable para aplicaciones que requieran alta precisión sin postprocesamiento.
- Al preservar disfluencias y repeticiones, la salida puede ser difícil de leer para usuarios no familiarizados con el habla atípica.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset concreto, puede reflejar las características demográficas y dialectales de los hablantes de ese corpus.
- Riesgo de alucinación: como cualquier modelo ASR, puede generar texto que no corresponde al audio, especialmente en segmentos ruidosos o ininteligibles.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para asegurar el cumplimiento de derechos de los hablantes.
- No se proporcionan instrucciones sobre cómo manejar audio de larga duración; la longitud de contexto no está especificada, por lo que puede requerir segmentación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-uganda-universal-prompt-const5e-5r)
- [Colección CDLI de KasuleTrevor](https://huggingface.co/collections/KasuleTrevor/cdli)
- [Modelo relacionado: cdli-qwen3-asr-lg-atypical-stage3-1p7b-base](https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-base)
- [Informe técnico de Qwen3-ASR (arXiv)](https://arxiv.org/html/2601.21337v1)
- [Página del modelo en FriendliAI](https://friendli.ai/models/KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-base)
