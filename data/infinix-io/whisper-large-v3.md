# Infinix-io/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI, publicado originalmente en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Esta ficha corresponde a la réplica alojada por el usuario Infinix-io en Hugging Face, que reproduce los pesos oficiales del modelo con licencia Apache 2.0. El modelo resuelve dos tareas principales: transcripción de audio a texto en el mismo idioma y traducción de voz a texto en inglés.

La arquitectura es un transformer encoder-decoder de tipo seq2seq con 1.543 millones de parámetros, diseñado específicamente para procesar espectrogramas Mel de audio. La versión large-v3 introduce dos cambios respecto a large-v2: el espectrograma de entrada utiliza 128 bins Mel en lugar de 80, y se añade un token de idioma específico para cantonés. El modelo fue entrenado con 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2 épocas sobre esta mezcla.

Su relevancia actual radica en que sigue siendo una referencia sólida para ASR zero-shot multilingüe, con una reducción de errores del 10-20% respecto a large-v2 en una amplia variedad de idiomas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su disponibilidad en formatos safetensors, PyTorch y JAX facilita el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq para ASR |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 99 idiomas, incluyendo en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, JAX |

## Arquitectura y entrenamiento

Whisper large-v3 emplea una arquitectura transformer encoder-decoder estándar para tareas seq2seq. El encoder procesa espectrogramas Mel de 128 bins (frente a los 80 de versiones anteriores) y el decoder genera tokens de texto de forma autorregresiva. El modelo está diseñado para operar sobre ventanas de audio de 30 segundos, que se procesan de forma independiente y se concatenan para transcripciones de mayor duración.

El entrenamiento se realizó sobre una mezcla de 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2 épocas. No se menciona en la información proporcionada el uso de RLHF o DPO; el modelo se entrena con supervisión débil a gran escala. La innovación principal de large-v3 respecto a large-v2 es el aumento de la resolución del espectrograma de entrada (128 bins Mel) y la adición del token de cantonés, lo que se traduce en una reducción del 10-20% en errores para múltiples idiomas. El modelo soporta decodificación con temperature fallback, condition on previous tokens y predicción de timestamps a nivel de frase y de palabra.

## Capacidades

- Transcripción automática de voz a texto en 99 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (tarea `translate`).
- Predicción de timestamps a nivel de frase y a nivel de palabra.
- Decodificación con heurísticas configurables: temperature fallback, compression ratio threshold, logprob threshold y no_speech_threshold.
- Procesamiento por lotes de múltiples archivos de audio en paralelo mediante `batch_size`.
- Soporte de audio de duración arbitraria mediante segmentación en ventanas de 30 segundos.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-step en la información proporcionada.
- Capacidades multilingües amplias, con especial énfasis en inglés, chino, alemán, español, ruso, coreano, francés, japonés, portugués y turco.

## Casos de uso

- Transcripción de reuniones y videoconferencias: el modelo puede procesar audio de duración arbitraria segmentándolo en ventanas de 30 segundos, generando transcripciones con timestamps a nivel de frase para facilitar la revisión posterior. Es adecuado por su soporte multilingüe y su capacidad de detección automática de idioma.

- Subtitulado automático de vídeo: gracias a la predicción de timestamps a nivel de palabra, se pueden generar subtítulos sincronizados con precisión para plataformas de vídeo. El modelo soporta 99 idiomas, lo que permite subtitular contenido internacional sin modelos adicionales.

- Traducción de contenido audiovisual al inglés: la tarea `translate` permite convertir audio en cualquier idioma soportado directamente a texto en inglés, útil para doblaje, localización o generación de subtítulos en inglés a partir de material original en otros idiomas.

- Atención al cliente basada en voz: integrado en pipelines de ASR, el modelo puede transcribir llamadas o mensajes de voz de clientes en múltiples idiomas para su posterior análisis, enrutamiento o registro. La licencia Apache 2.0 permite su uso comercial en estos entornos.

- Generación de actas y resúmenes a partir de audio: combinado con un modelo de lenguaje, Whisper large-v3 puede transcribir reuniones o entrevistas y alimentar un pipeline de resumen automático. Su capacidad de procesar lotes y timestamps facilita la segmentación por intervinientes.

- Investigación lingüística y análisis de corpus orales: el modelo permite transcribir grandes volúmenes de audio en 99 idiomas con una calidad zero-shot sólida, lo que lo hace adecuado para estudios comparativos, análisis de dialectos o construcción de corpus etiquetados.

- Accesibilidad: transcripción en tiempo casi real de contenido hablado para personas con discapacidad auditiva, con soporte de timestamps y detección automática de idioma para contenido multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica una reducción del 10-20% en errores respecto a Whisper large-v2 en una amplia variedad de idiomas, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de WER (Word Error Rate) por idioma en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos (1.543 millones de parámetros × 2 bytes), más overhead de activaciones y buffers, lo que sitúa el consumo práctico en torno a 4-6 GB en fp16.
- En fp32, los pesos ocupan aproximadamente 6,2 GB, con un consumo práctico de 8-10 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, RTX 4080 para inferencia en fp16. Para fp32 se recomienda al menos 12 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB) y superiores en fp16. En GPUs con 8 GB puede requerir cuantización o fp16 con batch pequeño.
- Opciones de despliegue: Hugging Face Transformers con pipeline `automatic-speech-recognition`, así como los formatos PyTorch y JAX incluidos en el repositorio. No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper large-v3 (esta ficha) | 1.543 M | Ventana de audio de 30 s | 99 | Apache 2.0 | safetensors, PyTorch, JAX |
| Whisper large-v2 | no disponible en la informacion | Ventana de audio de 30 s | 99 (sin cantonés) | Apache 2.0 | safetensors, PyTorch |
| Whisper large | no disponible en la informacion | Ventana de audio de 30 s | 99 | Apache 2.0 | safetensors, PyTorch |

La comparación se limita a las versiones previas de la misma familia, ya que no se proporcionan datos de modelos alternativos de otros autores en la información disponible. Respecto a large-v2, large-v3 mejora la resolución del espectrograma (128 vs 80 bins Mel), añade el token de cantonés y reduce errores entre un 10% y un 20% en múltiples idiomas.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan sesgos específicos en la información proporcionada, pero al ser un modelo entrenado con datos débilmente etiquetados a gran escala, puede presentar sesgos de dominio y de representación lingüística.
- Riesgo de alucinación: Whisper puede generar texto que no corresponde al audio en segmentos con silencio, ruido o audio de baja calidad; la model card incluye parámetros como `no_speech_threshold` y `compression_ratio_threshold` para mitigar este comportamiento.
- Limitaciones de contexto: el modelo procesa ventanas de 30 segundos de audio; para audio más largo se requiere segmentación y concatenación, lo que puede introducir errores en las fronteras entre segmentos.
- Limitaciones de idioma: aunque soporta 99 idiomas, el rendimiento varía significativamente entre ellos; los idiomas con menos datos de entrenamiento pueden presentar tasas de error más altas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y la licencia. No se identifican restricciones adicionales en la información proporcionada.
- Caveat para producción: esta réplica (Infinix-io/whisper-large-v3) tiene 0 descargas y 0 likes, y fue creada el 2026-11-20; se recomienda verificar la integridad de los pesos y considerar el repositorio oficial `openai/whisper-large-v3` para despliegues en producción.
- El tamaño del repositorio es de 24,7 GB, lo que incluye múltiples formatos de pesos; la descarga completa puede ser costosa en ancho de banda.

## Enlaces

- Hugging Face (esta réplica): https://huggingface.co/Infinix-io/whisper-large-v3
- Repositorio oficial de OpenAI en Hugging Face: https://huggingface.co/openai/whisper-large-v3
- Artículo original: https://huggingface.co/papers/2212.04356
- Repositorio de OpenAI Whisper en GitHub: https://github.com/openai/whisper
- Documentación de Transformers para ASR: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
- Modelo large-v2 (referencia de comparación): https://huggingface.co/openai/whisper-large-v2
- Modelo large (referencia de comparación): https://huggingface.co/openai/whisper-large
