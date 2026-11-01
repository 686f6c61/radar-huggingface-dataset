# jkacan/whisper-tiny_to_british_accent

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny realizado por el usuario jkacan sobre un conjunto de datos de inglés británico (British_english). Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder basado en la arquitectura Transformer de Whisper, con 37,76 millones de parámetros totales y una ventana de contexto de audio de 30 segundos, la misma que la familia Whisper original.

El modelo parte de la variante "tiny" de OpenAI, la más pequeña de la familia Whisper, diseñada para transcripción de audio en inglés con requisitos de cómputo muy reducidos. El ajuste fino busca adaptar el modelo base a acentos y particularidades del inglés británico, un dominio en el que los modelos genéricos suelen presentar tasas de error superiores. El autor reporta un WER del 13,62 % sobre el conjunto de test del dataset British_english, con una pérdida de validación de 0,2951.

La relevancia de este modelo es limitada pero concreta: ofrece una alternativa ligera y de licencia Apache 2.0 para tareas de transcripción de audio en inglés británico en entornos con recursos restringidos (CPU, GPUs de gama baja, dispositivos embebidos). No obstante, la documentación del autor es mínima ("More information needed" en varias secciones), el número de descargas es muy bajo (36) y no hay verificación independiente de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estándar de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder con atención estándar. Whisper procesa audio convertido a log-Mel spectrograms de 80 canales en ventanas de 30 segundos y genera texto de forma autorregresiva. La variante tiny es la de menor tamaño de la familia, con 4 capas de encoder y 4 de decoder, y una dimensión de modelo de 384.

El entrenamiento se realizó con el Trainer de Hugging Face sobre el dataset British_english (split de test para evaluación). Los hiperparámetros documentados son: learning rate 1e-05, batch de entrenamiento 2, batch de evaluación 1, optimizador AdamW_TORCH_FUSED con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento (aproximadamente 2 épocas). La pérdida de entrenamiento bajó de 0,3266 (paso 1000) a 0,1729 (paso 2000), y la pérdida de validación de 0,3013 a 0,2951. El WER de validación pasó de 15,00 % a 13,62 %. No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo técnicas de aumento de datos o regularización adicionales.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización en acento británico.
- Transcripción de audio de hasta 30 segundos por ventana (procesamiento por segmentos para audios más largos).
- Generación de texto a partir de audio (speech-to-text) en formato de transcripción literal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés (el modelo base whisper-tiny es multilingüe, pero este fine-tuning se ha entrenado únicamente con datos en inglés).
- No dispone de modo "thinking", visión, audio de salida ni otras capacidades especiales.
- No soporta traducción de audio a otros idiomas de forma fiable tras el ajuste (el fine-tuning se centra en transcripción en inglés).

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés británico: el modelo puede transcribir grabaciones cortas (hasta 30 segundos por segmento) con un WER reportado del 13,62 %, adecuado para actas internas donde no se requiere transcripción perfecta y se valora el bajo coste computacional.
- Subtitulado automático de vídeos en inglés británico: integrable en pipelines de generación de subtítulos (por ejemplo, con WhisperX o faster-whisper) para contenido de YouTube o cursos, aprovechando su reducido tamaño para procesar lotes grandes en CPU.
- Prototipado rápido de aplicaciones de voz: al ser un modelo de 37,7 M de parámetros, permite iterar en local sin GPU dedicada, ideal para validar ideas de asistentes de voz o dictado antes de escalar a modelos mayores.
- Transcripción en dispositivos con recursos limitados: su tamaño (0,6 GB de repo, pesos safetensors) permite desplegarlo en Raspberry Pi, portátiles sin GPU o entornos edge para dictado offline.
- Preprocesamiento de datos de audio para investigación: útil para generar transcripciones preliminares de corpus en inglés británico que luego se revisan manualmente, reduciendo el coste de anotación.
- Evaluación comparativa de acentos: sirve como baseline ligero para estudiar el impacto del acento británico en ASR frente a whisper-tiny original, con una diferencia medible en WER sobre el mismo dataset.
- Integración en sistemas de atención al cliente con voz: para transcribir consultas breves en inglés británico en un primer nivel de triaje, aunque su WER del 13,62 % limita su uso en producción sin revisión humana.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Whisper tiny British | British English (test) | WER | 13,62 % |
| Whisper tiny British | British English (validación, paso 2000) | Loss | 0,2951 |
| Whisper tiny British | British English (validación, paso 1000) | WER | 15,00 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (37,7 M de parámetros), aproximadamente 0,15 GB en FP16 y menos de 0,1 GB en cuantización INT8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de forma viable. En GPU, cualquier modelo desde una GTX 1050 en adelante es suficiente; una RTX 4090 o A100 estarían sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU y dispositivos embebidos.
- Opciones de despliegue: transformers (Pipeline de ASR), faster-whisper (con conversión a CTranslate2), whisper.cpp (requiere conversión de pesos), Ollama no soporta Whisper de forma nativa, vLLM no está orientado a ASR, TGI no soporta arquitecturas encoder-decoder de audio de forma estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia muy baja en CPU (del orden de tiempo real o inferior para segmentos cortos), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkacan/whisper-tiny_to_british_accent | 37,7 M | 30 s audio | 13,62 % (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s audio | no disponible en la información | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s audio | no disponible en la información | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s audio | no disponible en la información | Apache 2.0 | Hugging Face |

No se dispone de resultados comparativos de WER sobre el mismo dataset British_english para los modelos base en la información proporcionada, por lo que no es posible cuantificar la mejora del fine-tuning frente a whisper-tiny original.

## Limitaciones y advertencias

- Documentación incompleta: la model card indica "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Resultados no verificados: el WER del 13,62 % es un dato declarado por el autor (verified: false) y no ha sido validado de forma independiente.
- Sesgos desconocidos: no se documenta la composición del dataset British_english ni posibles sesgos de género, edad, origen regional o calidad de audio.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido, silencios o audio musical.
- Limitación de idioma: entrenado solo en inglés; su uso con otros idiomas o acentos no británicos puede degradar gravemente el rendimiento.
- Limitación de contexto: ventana de 30 segundos por segmento; audios más largos requieren segmentación manual o pipelines externos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar los términos del modelo base y las condiciones de los datos de entrenamiento (no documentadas).
- Baja adopción: solo 36 descargas y 0 likes, sin evidencia de uso en producción ni mantenimiento posterior (última actualización el mismo día de creación).
- Fecha de creación futura (2026-10-31): dato anómalo en los metadatos que sugiere posible error de registro o naturaleza experimental del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkacan/whisper-tiny_to_british_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentación de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
