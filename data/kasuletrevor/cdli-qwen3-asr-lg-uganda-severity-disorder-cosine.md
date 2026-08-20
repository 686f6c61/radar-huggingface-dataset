# KasuleTrevor/cdli-qwen3-asr-lg-uganda-severity-disorder-cosine

## Resumen

El modelo `KasuleTrevor/cdli-qwen3-asr-lg-uganda-severity-disorder-cosine` es un sistema de reconocimiento automático del habla (ASR) desarrollado por KasuleTrevor, especializado en la transcripción de habla no estándar en luganda, concretamente habla atípica asociada a trastornos del habla. Se trata de un fine-tuning del modelo `KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, que a su vez deriva de `Qwen/Qwen3-ASR-1.7B`, adaptado al dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`. El modelo emplea un prompt condicionado por metadatos del hablante (tipo de trastorno, severidad y etiología) para guiar la transcripción, preservando repeticiones, disfluencias y palabras parciales.

Con 2.038.052.480 parámetros (aproximadamente 2,04 mil millones), este modelo está orientado a la investigación en ASR para habla patológica y a la mejora de la accesibilidad en lenguas de bajos recursos. Su relevancia radica en abordar un dominio poco cubierto por los ASR comerciales: la transcripción fiel de habla con trastornos del habla en un idioma africano, utilizando un enfoque de prompt condicionado por metadatos. La licencia Apache-2.0 permite uso comercial y modificación, aunque su estado experimental (checkpoint intermedio) y sus métricas de WER elevadas indican que no está listo para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (modelo de audio-lenguaje con encoder de audio y decoder de lenguaje, basado en transformer) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Luganda (lg) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR-1.7B, un sistema de audio-lenguaje que combina un encoder de audio con un decoder de lenguaje para generar transcripciones. Sobre esta base, se realizó un fine-tuning específico para habla no estándar en luganda, utilizando el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, que contiene muestras de habla con trastornos del habla y metadatos asociados (tipo de trastorno, severidad y etiología). El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 5e-05 y scheduler de tipo cosine, seleccionando el checkpoint 500.

La innovación principal es el uso de un prompt condicionado por metadatos (modo `metadata`): se insertan en el prompt la severidad del trastorno, el tipo y la etiología del hablante, extraídos de `speaker_metadata.csv`. Este prompt instruye al modelo a transcribir exactamente en luganda, preservando repeticiones, disfluencias, falsos inicios y palabras parciales, sin normalizar ni limpiar la transcripción. Este enfoque es un experimento de tipo "oracle", ya que los metadatos se proporcionan durante la inferencia, lo que no siempre es posible en despliegues reales.

## Capacidades

- Reconocimiento automático del habla (ASR) para luganda, con especial atención a habla atípica (trastornos del habla).
- Transcripción fiel que preserva repeticiones, disfluencias, falsos inicios y palabras parciales, sin normalización gramatical.
- Condicionamiento por metadatos del hablante (severidad, tipo de trastorno, etiología) mediante prompt.
- Soporte de entrada de audio y salida de texto (pipeline `automatic-speech-recognition`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones más allá de la transcripción.
- Multilingüismo limitado: solo luganda (lg).

## Casos de uso

- Investigación clínica en logopedia: transcribir grabaciones de pacientes con trastornos del habla en luganda para analizar patrones de disfluencia, repeticiones y errores articulatorios, utilizando los metadatos de severidad y etiología como contexto.
- Desarrollo de ASR inclusivo para lenguas de bajos recursos: servir como base para sistemas de transcripción que no excluyan a hablantes con habla no estándar, un colectivo habitualmente ignorado en los corpus de entrenamiento.
- Evaluación de sistemas de ASR en condiciones de habla patológica: comparar el rendimiento de este modelo frente a ASR genéricos para medir el impacto de la adaptación a habla atípica.
- Creación de subtítulos o transcripciones para contenido audiovisual en luganda producido por personas con trastornos del habla, siempre que se disponga de los metadatos del hablante.
- Entrenamiento de modelos de ASR con prompt condicionado: este checkpoint sirve como referencia para experimentos sobre cómo los metadatos del hablante afectan a la transcripción de habla disártrica o con otras patologías.
- Investigación en procesamiento de habla patológica multilingüe: el enfoque de prompt con metadatos puede replicarse en otros idiomas y trastornos, usando este modelo como punto de partida metodológico.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden al checkpoint 500 evaluado sobre el conjunto de test del dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| WER normalizado | 0.539974 |
| CER normalizado | 0.253581 |
| WER promedio con tope (capped) | 0.426363 |
| CER promedio con tope (capped) | 0.179858 |

Estos valores indican una tasa de error de palabra superior al 50% en condiciones normalizadas, lo que refleja la dificultad del habla atípica y la ausencia de normalización en la transcripción. No se dispone de benchmarks adicionales (MMLU, HumanEval, etc.) por tratarse de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.038 millones de parámetros, en FP16 se requieren aproximadamente 4,1 GB de VRAM (el tamaño del repo es 4,1 GB). En cuantización de 8 bits, alrededor de 2 GB; en 4 bits, cerca de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti). Para cuantizaciones ligeras, GPUs con 4 GB pueden ser suficientes (GTX 1650, RTX 3050).
- Es posible ejecutarlo en GPU de consumo, aunque la latencia dependerá de la longitud del audio y de la implementación.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas estándar como `transformers` (pipeline de ASR), así como con servidores de inferencia compatibles con endpoints (vLLM, TGI, FriendliAI, etc.). También puede convertirse a GGUF para ejecución en CPU con llama.cpp, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de ASR para habla atípica en luganda. El modelo base `KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune` (entrenado sobre habla típica) podría servir como referencia, pero no se publican sus métricas en la model card de este checkpoint. Tampoco se encuentran modelos comparables en la búsqueda web. Por tanto, la comparativa se limita a señalar que este modelo es un fine-tuning de Qwen3-ASR-1.7B, que a su vez es un modelo ASR multilingüe de la familia Qwen, pero sin datos cuantitativos de comparación.

## Limitaciones y advertencias

- El prompt condicionado por metadatos es de tipo "oracle": requiere conocer la severidad, el tipo de trastorno y la etiología del hablante durante la inferencia, lo que limita su uso en entornos reales donde estos datos no están disponibles.
- WER elevado (0.54 normalizado) indica que la transcripción contiene errores significativos; no es adecuado para aplicaciones que requieran alta precisión sin postprocesado.
- El modelo solo soporta luganda; no es multilingüe.
- Es un checkpoint intermedio (checkpoint-500) de un experimento de fine-tuning, no un modelo final pulido.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus de habla no estándar, puede presentar un rendimiento inferior en habla típica o en variantes dialectales no representadas.
- Riesgo de alucinación en segmentos de audio muy ruidosos o ininteligibles, común en modelos ASR.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con fines de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-uganda-severity-disorder-cosine
- Modelo base (fine-tuning típico): https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune
- Dataset utilizado: https://huggingface.co/datasets/cdli/ugandan_luganda_nonstandard_speech_v1.0
- Repositorio de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Página del modelo base en FriendliAI: https://friendli.ai/models/KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune
