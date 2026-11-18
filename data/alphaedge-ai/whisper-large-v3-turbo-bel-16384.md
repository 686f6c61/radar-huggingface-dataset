# alphaedge-ai/whisper-large-v3-turbo-bel-16384

## Resumen

`whisper-large-v3-turbo-bel-16384` es una variante recortada (*trimmed*) de `openai/whisper-large-v3-turbo` desarrollada por `alphaedge-ai` y especializada en bielorruso (`be`). El modelo parte de los pesos originales de OpenAI y aplica una reducción del vocabulario del tokenizador de 51.865 a 16.384 tokens, conservando únicamente los tokens relevantes para el idioma objetivo. El resultado es un modelo de 763.461.120 parámetros (frente a 808.878.080 del original, un 5,61% menos) con una huella de memoria notablemente inferior.

La técnica de *trimming* consiste en identificar los tokens efectivamente utilizados en un corpus del idioma destino y eliminar el resto del vocabulario, reindexando las matrices de embeddings de entrada y de salida. En este caso se emplearon 200.000 textos del conjunto `lbourdois/fineweb-2-trimming` para determinar qué tokens conservar. La reducción del vocabulario alcanza el 68,41%, lo que se traduce en un ahorro directo en el tamaño de las capas de embedding y en la proyección final del decodificador.

El modelo es relevante para despliegues de ASR (reconocimiento automático del habla) en bielorruso donde el espacio de almacenamiento, la memoria o el ancho de banda son limitados, ya que mantiene la arquitectura y el comportamiento del Whisper original para ese idioma con un peso menor. Está publicado bajo licencia Apache 2.0 y es compatible con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada en la model card) |
| Idiomas soportados | bielorruso (`be`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI mediante supervisión débil a gran escala (paper arXiv:2212.04356). Whisper procesa audio muestreado a 16 kHz y genera transcripciones autoregresivas. La variante *turbo* reduce el número de capas del decodificador respecto a `large-v3`, lo que disminuye el coste de inferencia.

Sobre esa base, `alphaedge-ai` aplica la técnica de *trimming* descrita en el blog de Hugging Face "Introduction to Trimming": se analiza un corpus de 200.000 textos bielorrusos del dataset `lbourdois/fineweb-2-trimming`, se seleccionan los 16.384 tokens más relevantes y se recortan las matrices de embedding y la proyección de salida. No se documenta ningún reentrenamiento ni ajuste fino adicional: el modelo es una versión "quantized" (en el sentido de reducción de vocabulario) del original. No se detalla en la model card el volumen total de tokens de audio empleados en el entrenamiento original ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en bielorruso, con transcripción de audio muestreado a 16 kHz.
- Generación de transcripciones en formato texto plano mediante el pipeline `automatic-speech-recognition` de `transformers`.
- Soporte de los parámetros `language="belarusian"` y `task="transcribe"` en la generación.
- Compatible con el ecosistema `transformers` (AutoProcessor, AutoModelForSpeechSeq2Seq, pipeline).
- Capacidad multilingüe limitada: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del bielorruso puede degradarse notablemente.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en bielorruso: el modelo convierte audio de hasta 30 s por segmento en texto, adecuado para actas y documentación interna en organizaciones bielorrusas.
- Subtitulado automático de vídeo: integrable en pipelines de postproducción para generar subtítulos en bielorruso con un modelo de menor huella que el Whisper original.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio para indexación y búsqueda textual en bibliotecas o medios de comunicación.
- Asistentes de voz en dispositivos con recursos limitados: el recorte del 68,41% del vocabulario reduce el peso del modelo, lo que facilita su despliegue en entornos con poca memoria.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en bielorruso.
- Investigación lingüística y corpus: creación de corpus textuales a partir de grabaciones en bielorruso para estudios del idioma.
- Prototipado rápido en `transformers`: al ser compatible con el pipeline estándar, sirve para validar flujos de ASR en bielorruso antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (word error rate) ni comparaciones cuantitativas con el modelo original u otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de parámetros (763 M) y el repo de 1,5 GB, el modelo en precisión nativa (fp32/fp16) requiere del orden de 1,5-3 GB de memoria, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponible en la model card.
- Compatibilidad con GPU de consumo: por tamaño, es plausible que quepa en GPU de consumo modernas, pero no se confirma en la documentación.
- Opciones de despliegue: pipeline de `transformers` (según la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-large-v3-turbo-bel-16384` | 763.461.120 | no disponible | bielorruso | apache-2.0 | Vocabulario recortado a 16.384 tokens |
| `openai/whisper-large-v3-turbo` | 808.878.080 | no disponible | multilingüe | apache-2.0 | Modelo base, vocabulario de 51.865 tokens |
| `openai/whisper-large-v3` | no disponible en la informacion | no disponible | multilingüe | apache-2.0 | Decodificador completo, mayor coste |

No se dispone de datos de rendimiento comparativo (WER) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El recorte del vocabulario elimina tokens no usados en bielorruso; el modelo puede degradarse en otros idiomas o en audio con mezcla de lenguas.
- No se han publicado métricas de calidad (WER) para esta variante, por lo que no se puede garantizar un rendimiento equivalente al original.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Sesgos heredados del entrenamiento original de Whisper (datos de supervisión débil a gran escala), no documentados específicamente para esta variante.
- La ventana de audio de Whisper está limitada a 30 s por segmento; no se documenta una longitud de contexto ampliada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base de OpenAI.
- El modelo tiene muy pocas descargas (38) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.
- No se documentan procesos de cuantización adicionales ni formatos GGUF/ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-bel-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
