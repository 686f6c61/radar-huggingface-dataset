# SarahMcCormack/whisper-tiny_to_russian_english

## Resumen

Whisper tiny Russian es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla `openai/whisper-tiny` de OpenAI, publicado por el usuario SarahMcCormack en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer original de Whisper, con 37,76 millones de parámetros, y ha sido reentrenado sobre el dataset `russian_english` para la tarea de transcripción de audio a texto. Su propósito declarado es mejorar el rendimiento del modelo base en un dominio bilingüe ruso-inglés, aunque la model card no detalla la composición exacta del corpus de entrenamiento.

El modelo es relevante por su tamaño reducido (0,3 GB de repositorio), lo que lo hace apto para despliegues con recursos limitados, prototipado rápido y entornos de edge computing. Sin embargo, se trata de un experimento de ajuste fino con documentación mínima: la model card fue generada automáticamente por el Trainer de Hugging Face y contiene secciones sin completar ("More information needed"), lo que limita la evaluación rigurosa de su calidad y de su ámbito de aplicación real.

La información disponible es escasa y el modelo presenta un WER declarado de 9,9924 sobre el split de test del dataset `russian_english`, un valor que debe interpretarse con cautela porque no está verificado (`verified: false`) y no se especifica la métrica normalizada ni el tamaño del conjunto de evaluación. Aun así, constituye un punto de partida útil para quienes necesiten un modelo ASR ligero bilingüe ruso-inglés y estén dispuestos a validarlo por su cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Inglés (etiqueta declarada); el ajuste se realiza sobre un dataset ruso-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un transformer encoder-decoder con atención estándar, diseñado para recibir espectrogramas log-Mel de audio de 30 segundos y generar tokens de texto. El modelo base `openai/whisper-tiny` cuenta con 37,76 millones de parámetros y está entrenado originalmente por OpenAI sobre una gran cantidad de audio débilmente supervisado multilingüe. El ajuste fino aquí presentado no modifica la arquitectura, sino que adapta los pesos al dataset `russian_english`.

El entrenamiento se realizó con el Trainer de Hugging Face y los siguientes hiperparámetros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. Se registran dos puntos de evaluación: en el paso 1000 (epoch 1,0707) con validation loss de 0,2406 y WER de 10,5772, y en el paso 2000 (epoch 2,1413) con validation loss de 0,2263 y WER de 9,9924. No se documenta el número total de tokens de audio, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto en el dominio ruso-inglés para el que fue ajustado.
- Generación de texto a partir de audio: el decoder de Whisper puede producir transcripciones condicionadas por el audio de entrada.
- Procesamiento de ventanas de audio de hasta 30 segundos, según la arquitectura Whisper tiny subyacente.
- Soporte multilingüe limitado: la etiqueta de idioma declarada es `en`, pero el ajuste se realizó sobre un corpus ruso-inglés, por lo que se espera cierta competencia en ambos idiomas, sin garantías documentadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.
- No se documentan capacidades de traducción explícita ni de identificación de idioma.

## Casos de uso

- Transcripción de reuniones bilingües ruso-inglés: el modelo puede procesar segmentos de audio de hasta 30 segundos y generar texto, adecuado para actas automáticas en entornos con hablantes de ambos idiomas, aunque requiere validación previa del WER real en el dominio concreto.
- Subtitulado automático de vídeos cortos: por su tamaño reducido (37,76 M de parámetros), puede ejecutarse en CPU o GPU de gama baja para generar subtítulos preliminares que después se revisan manualmente.
- Prototipado de asistentes de voz en edge: su huella de memoria reducida permite desplegarlo en dispositivos con recursos limitados para pruebas de concepto de comandos de voz en ruso e inglés.
- Preprocesado de datasets de audio: útil para generar transcripciones aproximadas de corpus ruso-inglés que luego se corrigen manualmente, acelerando la anotación.
- Investigación en ajuste fino de ASR: sirve como referencia reproducible de un fine-tuning de Whisper tiny con hiperparámetros documentados, útil para comparar metodologías.
- Filtrado y búsqueda por contenido en archivos de audio: transcripción rápida de grabaciones para indexación textual en aplicaciones de archivo o compliance, aceptando la tasa de error declarada.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model-index, no verificados (`verified: false`).

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Whisper tiny Russian | Russian English | test | WER | 9,9924 |
| Whisper tiny Russian | Russian English | validación (paso 1000) | WER | 10,5772 |
| Whisper tiny Russian | Russian English | validación (paso 2000) | WER | 9,9924 |

| Punto de evaluación | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| Evaluación 1 | 1,0707 | 1000 | 0,2406 | 10,5772 |
| Evaluación 2 | 2,1413 | 2000 | 0,2263 | 9,9924 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con el modelo base `openai/whisper-tiny` en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,76 M de parámetros, ~151 MB de pesos) y del orden de 0,3 GB de repositorio; el consumo real depende del framework y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia de baja latencia moderada.
- Opciones de despliegue: transformers (librería nativa), y en principio cualquier runtime compatible con safetensors y arquitectura Whisper (ONNX Runtime, TensorRT, etc.); no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, que no soportan de forma estándar modelos encoder-decoder ASR de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Russian (este modelo) | 37,76 M | No disponible (ventanas de 30 s) | 9,9924 (Russian English, test) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | No disponible (ventanas de 30 s) | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | No disponible (ventanas de 30 s) | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | No disponible (ventanas de 30 s) | No disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre este ajuste y los modelos base de OpenAI en el mismo dataset, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentación mínima: la model card fue generada automáticamente y contiene secciones vacías ("More information needed"), lo que impide conocer la composición del dataset, el dominio de audio y las condiciones de entrenamiento.
- WER no verificado: el valor de 9,9924 está marcado como `verified: false` y no se especifica la normalización aplicada ni el tamaño del conjunto de test, por lo que no es directamente comparable con otros resultados publicados.
- Idiomas: la etiqueta declarada es `en`, pero el ajuste se hizo sobre un corpus ruso-inglés; el comportamiento real en cada idioma no está documentado ni cuantificado por separado.
- Riesgo de alucinación: como todo modelo Whisper, puede generar transcripciones plausibles pero incorrectas en audio ruidoso, con acentos marcados o con solapamiento de hablantes; no hay evaluación de este fenómeno en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos por acento, género, edad o dialecto; el dataset `russian_english` no está descrito.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset de ajuste antes de un despliegue en producción.
- Contexto de audio limitado: la arquitectura Whisper tiny procesa ventanas de 30 segundos, por lo que audios más largos requieren segmentación y pueden perder coherencia entre fragmentos.
- Sin soporte documentado de tool calling, agentes ni otras capacidades más allá de ASR.
- Fecha de creación futura en los metadatos (2026-10-30), lo que sugiere posible error de registro y desaconseja tratarlo como un modelo con historial de uso contrastado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarahMcCormack/whisper-tiny_to_russian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI (referencia de la arquitectura): no disponible en la información proporcionada
- Paper de Whisper: no disponible en la información proporcionada
- Dataset `russian_english`: no disponible enlace directo en la información proporcionada
