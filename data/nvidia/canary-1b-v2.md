# nvidia/canary-1b-v2

## Resumen

Canary-1b-v2 es un modelo de reconocimiento automático del habla (ASR) y traducción automática de voz (AST) desarrollado por NVIDIA. Forma parte de la familia Canary y está diseñado para transcribir y traducir audio en 25 lenguas europeas, incluyendo español, inglés, francés, alemán, italiano, portugués y lenguas eslavas y bálticas, entre otras. El modelo resuelve el problema de la transcripción y traducción de voz en entornos multilingües con una sola arquitectura, evitando la necesidad de sistemas separados por idioma.

La arquitectura combina un encoder FastConformer con un decoder Transformer, y utiliza tokens de control específicos de tarea (por ejemplo, `<source language>` y `<target language>`) para guiar la generación de texto. Con aproximadamente 978 millones de parámetros, el modelo ofrece un equilibrio entre precisión y eficiencia, y su licencia CC-BY-4.0 permite uso comercial con atribución. Su relevancia actual radica en la creciente demanda de soluciones de voz multilingües para aplicaciones de transcripción, subtitulación y asistentes conversacionales, donde Canary-1b-v2 destaca por su soporte amplio de idiomas y su capacidad de traducción bidireccional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: FastConformer (encoder) + Transformer (decoder) |
| Parametros totales | 978.998.272 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 25 lenguas europeas: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, NeMo |

## Arquitectura y entrenamiento

Canary-1b-v2 emplea una arquitectura encoder-decoder. El encoder es un FastConformer, una variante eficiente del Conformer que procesa la señal de audio y extrae características acústicas. El decoder es un Transformer estándar que genera el texto de salida, guiado por tokens de control que especifican el idioma de origen y el de destino, así como el tipo de tarea (ASR o AST). Esta estructura permite realizar tanto transcripción como traducción de voz en un solo paso, con soporte bidireccional (por ejemplo, de inglés a español y viceversa).

El modelo fue entrenado con los datasets nvidia/Granary y nvidia/nemo-asr-set-3.0, aunque no se especifican el número total de tokens ni la composición detallada del corpus. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en supervisión directa para tareas de habla. Entre las innovaciones técnicas destacan el uso de tokens de tarea para un control fino de la salida y la capacidad de generar marcas de tiempo a nivel de segmento, lo que facilita la alineación temporal en aplicaciones de subtitulación.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 lenguas europeas, con tasas de error (WER) que varían según el idioma (por ejemplo, 2.90% en español, 4.50% en inglés, 4.40% en alemán).
- Traducción automática de voz (AST) bidireccional entre los idiomas soportados, permitiendo transcribir y traducir en una sola pasada.
- Generación de marcas de tiempo a nivel de segmento, útil para alinear transcripciones con el audio original.
- Soporte de tareas mediante tokens de control (`<source language>`, `<target language>`), lo que permite configurar el modelo para ASR o AST sin cambiar de arquitectura.
- No incluye capacidades de tool calling, agentes ni razonamiento de texto general; está especializado exclusivamente en audio a texto.

## Casos de uso

- Transcripción de reuniones y conferencias multilingües: el modelo puede transcribir automáticamente intervenciones en varios idiomas europeos, generando actas textuales con marcas de tiempo para facilitar la búsqueda y el análisis posterior.
- Subtitulación automática de vídeos: gracias a su soporte de 25 idiomas y a las marcas de tiempo por segmento, es adecuado para generar subtítulos en plataformas de vídeo, tanto en el idioma original como traducidos a otro.
- Asistentes de voz multilingües: integrado en sistemas de diálogo, permite convertir comandos de voz en texto en el idioma del usuario, y opcionalmente traducirlos a otro idioma para respuestas en tiempo real.
- Análisis de llamadas de atención al cliente: transcribe conversaciones telefónicas en distintos idiomas, permitiendo extraer métricas de calidad, detectar problemas recurrentes o realizar análisis de sentimiento.
- Traducción de contenido audiovisual (doblaje o subtítulos): el modo AST traduce el habla de un idioma a otro, agilizando el proceso de localización de películas, series o vídeos educativos.
- Accesibilidad para personas con discapacidad auditiva: convierte el habla en texto en tiempo real, con soporte multilingüe, para entornos educativos, laborales o de eventos públicos.
- Archivado y búsqueda de contenido de audio: transcribe podcasts, entrevistas o archivos históricos, indexando el texto resultante para permitir búsquedas por contenido.

## Benchmarks y rendimiento

Los siguientes resultados de WER (Word Error Rate) en el conjunto de test de FLEURS fueron declarados por el autor del modelo en la model card. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Idioma | WER (%) |
|---|---|
| Búlgaro (bg) | 9.25 |
| Checo (cs) | 7.86 |
| Danés (da) | 11.25 |
| Alemán (de) | 4.40 |
| Griego (el) | 9.21 |
| Inglés (en) | 4.50 |
| Español (es) | 2.90 |
| Estonio (et) | 12.55 |
| Finés (fi) | 8.59 |
| Francés (fr) | 5.02 |
| Croata (hr) | 8.29 |
| Húngaro (hu) | 12.90 |
| Italiano (it) | 3.07 |
| Lituano (lt) | 12.36 |
| Letón (lv) | 9.66 |

No se han publicado resultados de benchmarks en la información disponible para el resto de idiomas soportados.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Con aproximadamente 978 millones de parámetros, el modelo en precisión FP16 ocupa alrededor de 2 GB solo en pesos, pero el encoder FastConformer y el procesamiento de audio pueden requerir memoria adicional.
- Se estima que una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 3070, o superior) puede ejecutar la inferencia en tiempo real para audio de corta duración. Para lotes grandes o audio de larga duración, se recomienda una GPU con 16 GB o más (RTX 4080, A100, etc.).
- El modelo está disponible en formato NeMo, por lo que puede desplegarse con el framework NeMo de NVIDIA, así como mediante el pipeline de Transformers de Hugging Face.
- No se indican opciones de cuantización específicas, por lo que la inferencia se realiza típicamente en FP16 o FP32.
- La latencia y el throughput dependen del hardware y de la longitud del audio; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR multilingües (como Whisper large-v3, MMS o Parakeet) en la información proporcionada. Canary-1b-v2 compite en la categoría de modelos de habla multilingües, pero no se pueden establecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- El modelo está especializado en lenguas europeas; no cubre idiomas de otras regiones (asiáticos, africanos, etc.), lo que limita su uso en contextos globales.
- Al ser un modelo de ASR/AST, puede presentar errores de transcripción en acentos no representados en los datos de entrenamiento, así como dificultades con ruido de fondo o habla solapada.
- No se han documentado sesgos específicos, pero es probable que el rendimiento varíe según el dialecto, el género de la voz o las condiciones acústicas.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a NVIDIA. Es recomendable revisar los términos completos de la licencia antes de su integración en productos comerciales.
- El modelo no es un LLM de propósito general; no puede realizar tareas de razonamiento, generación de texto libre ni interacción conversacional más allá de la transcripción y traducción de voz.
- No se especifican límites de duración de audio; en la práctica, audios muy largos pueden requerir segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/canary-1b-v2
- Repositorio de la interfaz web (Gradio): https://github.com/cvlt-ai/NVIDIA-Canary-1B-V2-Web-UI
- Papers asociados (IDs de arXiv): 2509.14128, 2505.13404, 2305.05084, 1706.03762, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 2005.08072, 1510.08484
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Granary, https://huggingface.co/datasets/nvidia/nemo-asr-set-3.0
