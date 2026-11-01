# aeasley/whisper-largev3-turbo-hy

## Resumen

whisper-largev3-turbo-hy es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-large-v3-turbo, publicado por el usuario aeasley en HuggingFace. El modelo está especializado en armenio (código de idioma `hy`) y mantiene la arquitectura encoder-decoder transformer propia de la familia Whisper de OpenAI. Con 808.878.080 parámetros totales, es una variante optimizada del Whisper large-v3 turbo, pensada para transcripción de audio en armenio con mayor precisión que el modelo base.

El problema que resuelve es la baja cobertura de idiomas menos representados en los modelos ASR multilingües. Whisper large-v3 turbo, aunque soporta decenas de idiomas, tiene un rendimiento desigual en lenguas de bajos recursos como el armenio. Este ajuste fino busca reducir la tasa de error de palabra (WER) en ese idioma concreto mediante entrenamiento supervisado sobre un conjunto de datos no especificado en la model card.

Es relevante ahora porque los modelos ASR especializados por idioma permiten desplegar transcripción de alta calidad en mercados y comunidades lingüísticas desatendidas, y porque el tamaño del modelo (menos de 1.000 millones de parámetros) lo hace viable en hardware de consumo. La licencia MIT facilita su uso comercial sin restricciones adicionales, a diferencia de otros modelos ASR con licencias más restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos, herencia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | armenio (`hy`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OpenAI Whisper large-v3 turbo: un encoder transformer que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de transcripción. La variante "turbo" de Whisper reduce el número de capas del decoder respecto a large-v3, lo que disminuye el coste computacional de inferencia a costa de una ligera pérdida de precisión en el modelo original. El ajuste fino se realizó sobre esta base congelada o parcialmente descongelada (no se detalla en la model card).

Los hiperparámetros de entrenamiento documentados son: learning rate de 1e-05, batch size de 16 (entrenamiento y evaluación), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, 4.000 pasos totales, precisión mixta nativa (AMP) y semilla 42. El entrenamiento se ejecutó con Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el conjunto de datos de entrenamiento (la model card indica "None dataset"), ni el número de tokens de audio, ni si hubo aumento de datos o limpieza previa.

## Capacidades

- Reconocimiento automático del habla (ASR) en armenio: transcripción de audio a texto.
- Generación de transcripciones con puntuación y mayúsculas (heredado de Whisper).
- Soporte de audio de hasta 30 segundos por segmento (ventana nativa de Whisper); para audios más largos se requiere segmentación externa.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al armenio según la model card; el modelo base soporta más idiomas, pero el ajuste fino puede degradar el rendimiento en otros.
- No dispone de modo "thinking", visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en armenio: el modelo convierte audio de hasta 30 segundos por segmento en texto, adecuado para actas y documentación interna en organizaciones armenias.
- Subtitulado automático de vídeo en armenio: integrado en pipelines de procesamiento de audio (ffmpeg + segmentación + inferencia por lotes) para generar subtítulos SRT.
- Atención al cliente basada en voz: transcripción de llamadas o mensajes de voz en armenio para su posterior análisis o enrutamiento, gracias a la licencia MIT que permite uso comercial.
- Archivado y búsqueda de contenido audiovisual: indexación de grabaciones históricas o emisiones en armenio para búsqueda por texto.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en armenio.
- Investigación lingüística: corpus de texto transcrito a partir de audio en armenio para estudios fonéticos o de frecuencia léxica, con la advertencia de un WER del 16,9 % que requiere revisión humana.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card durante el entrenamiento. No se han publicado resultados de benchmarks estándar (MLU, HumanEval, GSM8K no aplican a ASR; no hay comparación con otros modelos ASR).

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0.0902 |
| WER (evaluacion final) | 16.9355 % |
| Loss validacion paso 1000 | 0.1134 |
| WER validacion paso 1000 | 24.1524 % |
| Loss validacion paso 2000 | 0.0960 |
| WER validacion paso 2000 | 20.0846 % |
| Loss validacion paso 3000 | 0.0898 |
| WER validacion paso 3000 | 17.9110 % |

No se especifica el conjunto de evaluación, por lo que estos valores no son directamente comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,2 GB solo para pesos (808 M parámetros × 4 bytes), más overhead de activaciones y buffers de audio; en la práctica, 4-6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos; 3-4 GB en total.
- VRAM estimada en int8: aproximadamente 0,8 GB para pesos; 2-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para lotes grandes o mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no soporta ASR de forma nativa, llama.cpp no aplica a Whisper, faster-whisper (requiere conversión a CTranslate2), WhisperX, Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER armenio |
|---|---|---|---|---|---|
| aeasley/whisper-largev3-turbo-hy | 808,9 M | 30 s | hy | MIT | 16,94 % (evaluación propia) |
| openai/whisper-large-v3-turbo | 809 M | 30 s | multilingüe | MIT | no disponible |
| openai/whisper-large-v3 | 1.550 M | 30 s | multilingüe | MIT | no disponible |
| openai/whisper-small | 244 M | 30 s | multilingüe | MIT | no disponible |

No se dispone de datos de WER en armenio para los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- El WER del 16,94 % en evaluación es elevado para producción sin revisión humana; implica que aproximadamente una de cada seis palabras se transcribe incorrectamente.
- El conjunto de evaluación no está documentado, por lo que el WER podría no ser representativo de dominios distintos (ruido, acentos, jerga técnica).
- El modelo está especializado en armenio; su rendimiento en otros idiomas puede haberse degradado respecto al modelo base.
- La ventana de audio nativa es de 30 segundos; audios más largos requieren segmentación manual, lo que puede introducir errores en los límites.
- Riesgo de alucinación en pasajes de silencio o ruido: Whisper tiende a generar texto inventado cuando no hay habla clara.
- Sesgos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de género, dialecto o registro.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones, pero el autor no ofrece garantías.
- La model card está generada automáticamente y contiene secciones vacías ("More information needed"), lo que indica falta de documentación sobre datos, procedencia y evaluación.
- No se especifica si el ajuste fino usó el dataset completo o un subconjunto, ni si se aplicaron técnicas de regularización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aeasley/whisper-largev3-turbo-hy
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentación de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
