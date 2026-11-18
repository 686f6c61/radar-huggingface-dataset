# alphaedge-ai/whisper-large-v3-turbo-amh-16384

## Resumen

`whisper-large-v3-turbo-amh-16384` es una variante recortada (*trimmed*) del modelo de reconocimiento automático del habla `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo aplica la técnica de *trimming* de vocabulario descrita por Loïck Bourdois en el blog de Hugging Face: se reduce el vocabulario del tokenizador de 51.865 a 16.384 tokens, conservando únicamente los tokens relevantes para el amárico (código ISO `am`). El resultado es un modelo un 5,61 % más pequeño en parámetros (763.461.120 frente a 808.878.080) y con una huella de memoria notablemente inferior, manteniendo una arquitectura transformer encoder-decoder idéntica a la del original.

La motivación es práctica: Whisper large-v3-turbo está pensado para multilingüismo amplio y arrastra un vocabulario enorme que penaliza el tamaño del embedding y de la cabeza de salida. Al especializar el vocabulario en un solo idioma, el modelo resultante es más ligero de desplegar y de ajustar, a costa de perder capacidad para transcribir cualquier otro idioma. Está pensado, por tanto, para pipelines de ASR monolingües en amárico donde el ahorro de memoria y el tamaño del artefacto importan.

Es relevante ahora porque el ecosistema de *trimming* se está consolidando como una vía barata de especialización de modelos ASR multilingües, y este checkpoint es un ejemplo concreto (aunque de baja tracción: 34 descargas y 0 likes en el momento de la consulta) de cómo aplicar esa técnica a un idioma de bajos recursos como el amárico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), con vocabulario recortado |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, herencia de Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan variantes GGUF/ONNX) |
| Idiomas soportados | am (amárico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala (paper arXiv:2212.04356). La modificación introducida por `alphaedge-ai` es exclusivamente de vocabulario: se aplica la técnica de *trimming* descrita en el blog de Hugging Face, que reduce el vocabulario de 51.865 a 16.384 tokens (una reducción del 68,41 %). Para determinar qué tokens conservar se usaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, presumiblemente filtrando por el idioma objetivo (amárico). No se especifica en la model card si hubo reentrenamiento adicional, ajuste fino o calibración tras el recorte; el autor indica que el modelo "debería comportarse de forma similar al original" para el idioma seleccionado.

No se documentan detalles sobre datos de entrenamiento adicionales, número de tokens de entrenamiento, RLHF/DPO ni innovaciones técnicas más allá del propio recorte de vocabulario. El checkpoint se publica como `quantized` respecto al base según los tags de Hugging Face, aunque en la práctica la reducción de parámetros proviene del vocabulario, no de una cuantización numérica de los pesos.

## Capacidades

- Reconocimiento automático del habla (ASR) en amárico, con tarea `transcribe` y `translate` disponibles a través de la API de Whisper.
- Transcripción de audio a 16 kHz (frecuencia de muestreo requerida por Whisper).
- Manejo de audio de hasta 30 segundos por segmento (comportamiento estándar de Whisper; no confirmado explícitamente en la model card).
- Capacidad multilingüe muy limitada: el vocabulario recortado elimina tokens de otros idiomas, por lo que la transcripción fuera del amárico degradará o fallará.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR, ni modo *thinking*.
- No se documenta capacidad de diarización de hablantes ni marcas de tiempo a nivel de palabra (aunque el pipeline de transformers puede producirlas con `return_timestamps`).

## Casos de uso

- Transcripción de reuniones y entrevistas en amárico: el modelo puede procesar audio de hasta 30 s por segmento y encadenarse para grabaciones largas, con una huella de memoria menor que el Whisper original, lo que facilita su despliegue en servidores modestos.
- Subtitulado automático de vídeo en amárico: integrado en un pipeline de `transformers` con `return_timestamps=True`, permite generar subtítulos sincronizados para contenido audiovisual etíope.
- Atención al cliente en centros de contacto etíopes: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo y generación de actas, aprovechando el menor coste de inferencia frente al modelo completo.
- Archivado y búsqueda de audio histórico: conversión de fondos de audio en amárico a texto indexable, con un modelo lo bastante pequeño (1,5 GB en safetensors) para caber en infraestructura modesta.
- Investigación en ASR de bajos recursos: punto de partida para *fine-tuning* sobre dominios específicos (medicina, legal, agricultura) en amárico, ya que el vocabulario reducido acelera el ajuste y reduce el tamaño del checkpoint resultante.
- Despliegue en el borde o en entornos con memoria limitada: al ser un 5,61 % más pequeño que el original y con vocabulario recortado, es candidato para cuantización posterior y ejecución en GPUs de consumo, aunque el autor no publica variantes cuantizadas.
- Transcripción de notas de voz en aplicaciones móviles etíopes: el tamaño reducido del artefacto facilita su empaquetado en servicios backend ligeros que reciben audio de apps móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo de ~763 M de parámetros en fp16 ocupa aproximadamente 1,5 GB de pesos; con activaciones y buffers de atención, un despliegue típico ronda los 2-4 GB de VRAM, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) sin problema, pero no hay datos oficiales.
- ¿Cabe en consumer GPU? Sí, por tamaño de parámetros, pero no hay validación publicada.
- Opciones de despliegue: el autor solo documenta el uso con `transformers` (pipeline `automatic-speech-recognition`). No se publican variantes GGUF, ONNX ni recetas para vLLM, llama.cpp, Ollama o TGI. Al ser un modelo encoder-decoder de ASR, vLLM y TGI no son las opciones habituales; `transformers` o `faster-whisper` (previa conversión) serían las vías naturales, aunque esta última no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-large-v3-turbo-amh-16384` | 763.461.120 | 30 s por segmento (heredado) | am | apache-2.0 | Hugging Face, safetensors |
| `openai/whisper-large-v3-turbo` | 808.878.080 | 30 s por segmento | multilingüe (~99 idiomas) | apache-2.0 | Hugging Face, safetensors |
| `openai/whisper-large-v3` | ~1.550 M | 30 s por segmento | multilingüe (~99 idiomas) | apache-2.0 | Hugging Face, safetensors |
| `openai/whisper-small` | ~244 M | 30 s por segmento | multilingüe | apache-2.0 | Hugging Face, safetensors |

La comparación con `whisper-small` es relevante porque, aunque este último es más pequeño, no está especializado en amárico ni recortado; el modelo de `alphaedge-ai` ofrece un compromiso entre tamaño y especialización que los originales de OpenAI no cubren. No se dispone de benchmarks que permitan comparar calidad de transcripción en amárico entre estas opciones.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens de otros idiomas: el modelo no es apto para transcripción multilingüe ni para audio con mezcla de idiomas. El propio autor advierte que "puede no funcionar bien para otros idiomas".
- Riesgo de alucinación: Whisper es conocido por generar texto plausible en segmentos de silencio o ruido; el recorte de vocabulario puede agravar este comportamiento en amárico si los tokens conservados no cubren bien el dominio.
- No hay benchmarks publicados que validen la calidad de transcripción en amárico frente al modelo original; la afirmación del autor de que "debería comportarse de forma similar" no está respaldada con métricas (WER, CER).
- Tracción muy baja (34 descargas, 0 likes) y autor sin historial verificable en la model card; conviene validar el checkpoint antes de usarlo en producción.
- Licencia apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base de OpenAI; conviene revisar la licencia de `openai/whisper-large-v3-turbo` para usos concretos.
- No se publican variantes cuantizadas (GGUF, ONNX, int8) ni recetas de despliegue en servidores de inferencia de alto rendimiento, lo que limita su uso en producción a `transformers` o a conversiones manuales.
- El modelo solo procesa audio a 16 kHz; audio con otra frecuencia debe remuestrearse.
- No se documentan sesgos específicos del amárico ni evaluación de robustez ante acentos o ruido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-amh-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introducción al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
