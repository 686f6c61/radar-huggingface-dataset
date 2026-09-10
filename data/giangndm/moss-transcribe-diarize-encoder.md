# giangndm/moss-transcribe-diarize-encoder

## Resumen

El modelo `giangndm/moss-transcribe-diarize-encoder` es un codificador acústico independiente extraído del modelo `OpenMOSS-Team/MOSS-Transcribe-Diarize`. Lo publica el usuario giangndm como repositorio derivado, con licencia Apache 2.0 y 312.463.360 parámetros reales (312,5 M: 307,2 M del backbone Whisper y 5,2 M del adaptador). No es un modelo generativo ni conversacional: su pipeline declarado es `feature-extraction` y su salida es un tensor de representaciones acústicas continuas.

Su propuesta técnica consiste en combinar un encoder Whisper-Medium (24 capas, dimensión oculta 1024, 16 cabezas de atención, 80 bins log-mel) con una capa de fusión temporal 4x y un módulo VQAdaptor (Linear 4096→1024, SiLU, Linear 1024→1024, LayerNorm). El resultado son embeddings de 1024 dimensiones a 12,5 Hz, es decir, un token cada 80 ms. Frente a los 50 Hz nativos de Whisper, esto supone una reducción del 75 % en la longitud de secuencia, lo que se traduce directamente en menos tokens de audio inyectados en el prompt y menos presión sobre la caché KV de un LLM multimodal.

Es relevante para quien construye pipelines de audio-LLM, ASR o diarización y quiere un front-end acústico preempaquetado que evite tener que reimplementar el downsampling convolucional en el proyector. Ahora bien, el repositorio es de publicación muy reciente (10 de septiembre de 2026) y no tiene tracción: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Transformer (Whisper-Medium) + fusión temporal 4x + VQAdaptor (MLP) |
| Parámetros totales | 312.463.360 (312,5 M: 307,2 M Whisper + 5,2 M VQAdaptor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio como máximo declarado; sin padding obligatorio a 30 s (longitud dinámica) |
| Tipos de cuantización | no disponible (solo safetensors sin cuantizar; no hay GGUF, GPTQ ni AWQ publicados) |
| Idiomas soportados | en, zh, vi, ja, ko, fr, de, es, ru (9 idiomas en los tags del repositorio; la model card afirma "50+ idiomas") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB, compatible con `transformers` y `custom_code`) |

Datos adicionales de la arquitectura declarados por el autor:

| Componente | Detalle |
|---|---|
| Backbone | Whisper-Medium: 24 capas Transformer, 16 cabezas de atención, activación GELU |
| Entrada | audio mono a 16 kHz, features log-mel de 80 bins |
| Fusión temporal | 4 frames consecutivos a 50 Hz se combinan en 1 frame |
| Adaptador | VQAdaptor: 2 capas MLP (4096 → 1024 → 1024) + LayerNorm |
| Frecuencia de salida | 12,5 Hz (80 ms por frame) |
| Dimensión de salida | 1024 (embeddings acústicos continuos en `last_hidden_state`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder tipo Transformer de atención completa, idéntico en su bloque al encoder de Whisper-Medium, seguido de dos etapas añadidas: una fusión temporal que agrupa 4 frames de 50 Hz en uno solo (pasando a 12,5 Hz) y el VQAdaptor, un perceptrón de dos capas con SiLU y LayerNorm que proyecta la representación concatenada de 4096 dimensiones de vuelta a 1024. La concatenación de 4 frames de 1024 dimensiones explica la dimensión de entrada de 4096 del primer Linear. La salida conserva la dimensión 1024, por lo que un proyector hacia un LLM (por ejemplo de 1024 a 4096) puede ser una única capa lineal sin downsampling convolucional adicional.

No hay información en la fuente sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el procedimiento exacto de extracción del encoder desde el modelo original `MOSS-Transcribe-Diarize`, más allá de que se trata de un subconjunto autónomo del mismo. El paper citado en la model card es *MOSS-Transcribe-Diarize 0.9B: An End-to-End Audio Understanding Model for Long-Form Multi-Speaker Transcription and Diarization*, pero no se incluye enlace ni resultados en la información disponible.

La innovación destacable, según el autor, es la reducción de la tasa de frames: al pasar de 50 Hz a 12,5 Hz se recorta un 75 % la longitud de la secuencia de audio que consume un LLM, con el consiguiente ahorro en caché KV y en coste de inferencia. El propio repositorio sugiere patrones de uso downstream como proyector lineal hacia un LLM y cabeza CTC con vocabulario de 151.936 tokens.

## Capacidades

- Extracción de características acústicas: genera embeddings continuos de 1024 dimensiones a 12,5 Hz a partir de audio mono a 16 kHz.
- Compresión temporal: reduce la secuencia de audio un 75 % respecto a los 50 Hz nativos de Whisper, sin padding obligatorio a 30 segundos.
- Front-end para audio-LLM: la salida ya está a 12,5 Hz, por lo que los proyectores hacia Qwen o LLaMA pueden ser una capa lineal directa.
- Base para reconocimiento de voz: el autor documenta un patrón con cabeza CTC (Linear de 1024 a tamaño de vocabulario) sobre `last_hidden_state`.
- Base para diarización y segmentación de hablante: al proceder del modelo MOSS-Transcribe-Diarize, está orientado a tareas de transcripción y diarización de múltiples hablantes, si bien este repositorio solo expone la parte de representación acústica.
- Multilingüismo declarado: 9 idiomas en los tags (inglés, chino, vietnamita, japonés, coreano, francés, alemán, español y ruso) y "50+ idiomas" según la model card.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente, modo thinking, visión ni audio generativo: no es un modelo instruido ni conversacional.
- Soporta audio de longitud dinámica hasta 30 segundos por pasada, en lugar de exigir segmentos rellenados a 30 s.

## Casos de uso

- Front-end acústico para un audio-LLM propio: se carga el encoder con `AutoModel` y se conecta a un LLM mediante un proyector lineal de 1024 a la dimensión del modelo de lenguaje. Es adecuado porque la salida ya está a 12,5 Hz y elimina la necesidad de implementar capas convolucionales de downsampling.
- ASR con cabeza CTC: se añade una capa lineal de 1024 al vocabulario objetivo sobre `last_hidden_state` y se entrena o ajusta con CTC. La tasa de 80 ms por frame reduce el coste de alineamiento frente a los 20 ms de Whisper.
- Diarización y segmentación de hablantes: los embeddings acústicos por frame sirven como entrada a un clustering o a un clasificador de cambio de turno para separar voces en una reunión o entrevista, aprovechando que el backbone proviene de un modelo específicamente entrenado para diarización.
- Reducción de coste en inferencia multimodal: al recortar un 75 % los tokens de audio inyectados en el prompt, se reduce proporcionalmente la caché KV y el tiempo de prefill en LLMs que consumen audio, lo que abarata el despliegue en producción.
- Indexación y búsqueda semántica de audio: los embeddings de 1024 dimensiones permiten construir un índice vectorial de fragmentos de hasta 30 segundos para recuperar por similitud acústica, por ejemplo en archivos de podcasts o grabaciones de atención al cliente.
- Subtitulado y transcripción multilingüe: con soporte declarado para 9 idiomas, se puede usar como extractor en pipelines de subtitulado que luego deleguen la decodificación a un LLM o a una cabeza CTC entrenada por idioma.
- Investigación en representaciones de voz: sirve como punto de comparación reproducible frente a encoders Whisper sin comprimir, Wav2Vec2 o HuBERT, para medir el impacto de la fusión temporal 4x en tareas posteriores.
- Preprocesado en sistemas de clasificación de habla: detección de idioma, clasificación de emociones o detección de eventos acústicos, añadiendo una cabeza de clasificación sobre la media temporal de los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, DER, MMLU, HumanEval ni GSM8K, ni comparaciones cuantitativas frente a otros encoders. Cualquier cifra de rendimiento de este repositorio concreto debería medirse de forma independiente antes de usarlo en producción.

## Requisitos de hardware

- Peso de los parámetros: unos 1,25 GB en fp32 (coherente con el tamaño de repositorio de 1,2 GB) y unos 0,63 GB en bf16/fp16, dado que el autor recomienda `dtype=torch.bfloat16` en el ejemplo de carga.
- VRAM estimada para inferencia: por debajo de 2 GB en bf16 para una muestra de hasta 30 segundos, incluyendo activaciones del encoder (1500 posiciones antes de la fusión, 375 después) y memoria de atención. Es una estimación a partir del tamaño del modelo, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El modelo es claramente de gama consumer.
- CPU: viable para inferencia puntual en CPU, ya que 312 M de parámetros y una ventana de 30 segundos son manejables, aunque la latencia será notablemente mayor que en GPU (no hay cifras publicadas).
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True` (método recomendado por el autor), o extracción manual de pesos. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni motores de cuantización tipo GGUF, GPTQ o AWQ.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor), latencia por segmento ni throughput por GPU.

## Comparativa con modelos similares

Los siguientes datos de los modelos comparados provienen de conocimiento general público y deben verificarse en sus repositorios respectivos; los del modelo analizado proceden de la información proporcionada.

| Modelo | Parámetros | Ventana de audio | Tasa de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moss-transcribe-diarize-encoder (este) | 312,5 M | 30 s | 12,5 Hz (80 ms/frame) | Apache 2.0 | safetensors + custom_code |
| Encoder de Whisper-Medium (OpenAI) | ~307 M (encoder; 769 M el modelo completo) | 30 s | 50 Hz (20 ms/frame) | Apache 2.0 | safetensors, múltiples formatos y ecosistema amplio |
| Encoder de Whisper-Large-v3 (OpenAI) | ~635 M (encoder; 1550 M el modelo completo) | 30 s | 50 Hz (20 ms/frame) | Apache 2.0 | safetensors, amplio soporte en herramientas |
| MOSS-Transcribe-Diarize 0.9B (OpenMOSS-Team) | 0,9 B (modelo completo) | Formato largo y multihablante (según descripción) | no disponible | Apache 2.0 | modelo completo con transcripción y diarización end-to-end |
| Wav2Vec 2.0 Large (tipo) | ~317 M | no disponible | 50 Hz (20 ms/frame) | no disponible en la información proporcionada | safetensors, ampliamente adoptado en ASR |

La diferencia clave frente a los encoders de Whisper es la tasa de frames: este modelo entrega 12,5 Hz frente a 50 Hz, con un tamaño de parámetros prácticamente idéntico al encoder de Whisper-Medium. Frente al modelo completo MOSS-Transcribe-Diarize, este repositorio solo aporta la parte de representación acústica, sin cabezas de transcripción ni de diarización.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, etiquetas ni decisiones por sí mismo. Requiere una cabeza o un LLM aguas abajo para cualquier tarea final.
- Ventana limitada a 30 segundos por pasada según la model card, sin padding obligatorio. El audio de formato largo debe trocearse y gestionarse por separado, aunque el modelo original sí contemple ese escenario.
- Discrepancia en idiomas: los tags del repositorio listan 9 idiomas mientras la model card afirma "50+ idiomas". No hay evaluación publicada que respalde ninguna de las dos cifras.
- Sin benchmarks, sin descargas y sin likes: no existe validación comunitaria ni comparativa de calidad frente a encoders establecidos.
- La fusión temporal 4x reduce la resolución a 80 ms por frame, lo que puede degradar fenómenos acústicos breves (oclusivas, fonemas cortos) en tareas que exijan alineamiento fino.
- Hereda los sesgos del backbone Whisper, entrenado de forma desbalanceada hacia inglés y determinados acentos y dominios; el rendimiento puede caer con ruido de fondo, solapamiento de voces o audio telefónico.
- Riesgo de alucinación no aplica directamente al encoder, pero sí al pipeline completo si se conecta a un LLM generativo, que puede producir transcripciones plausibles sin respaldo acústico.
- Requiere `trust_remote_code=True` para cargar el código remoto del repositorio, lo que implica ejecutar código de un tercero; conviene auditar `custom_code` antes de usarlo en producción.
- No hay versiones cuantizadas publicadas (GGUF, GPTQ, AWQ, ONNX), lo que limita el despliegue en entornos edge o con restricciones de memoria severas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia, e indicar cambios realizados. No incluye garantías.
- Fecha de creación del repositorio: 10 de septiembre de 2026, con última actualización ese mismo día. Es un artefacto muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/giangndm/moss-transcribe-diarize-encoder
- Modelo original del que se extrae: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Paper citado en la model card: *MOSS-Transcribe-Diarize 0.9B: An End-to-End Audio Understanding Model for Long-Form Multi-Speaker Transcription and Diarization* (sin enlace disponible en la información proporcionada)
- Resultados de búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las únicas entradas devueltas por la búsqueda tratan sobre la configuración de firmas en Microsoft Outlook y no guardan relación con el modelo, por lo que se descartan.
- Repositorio de código, demo o espacio de inferencia: no disponibles.
