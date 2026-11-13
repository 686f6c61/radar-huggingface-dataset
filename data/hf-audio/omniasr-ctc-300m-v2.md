# hf-audio/omniasr-ctc-300m-v2

## Resumen

OmniASR CTC 300M v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo hf-audio de Hugging Face, publicado bajo el identificador `hf-audio/omniasr-ctc-300m-v2`. Forma parte de la familia Omnilingual ASR, un esfuerzo por cubrir un número masivo de idiomas —la model card lista más de 1.000 códigos ISO 639-3— con un único modelo de tamaño compacto. Con 325.982.768 parámetros (aproximadamente 326 millones), se posiciona como una alternativa ligera y desplegable en hardware modesto frente a los sistemas ASR multilingües de gran escala.

El modelo emplea una arquitectura de tipo CTC (Connectionist Temporal Classification) sobre un backbone transformer, lo que permite alineamientos sin necesidad de decodificación autoregresiva y reduce la latencia de inferencia. Está entrenado sobre el corpus `facebook/omnilingual-asr-corpus` y se distribuye en formato safetensors con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

Su relevancia actual radica en la combinación de cobertura lingüística extrema y un tamaño reducido: permite transcribir audio en cientos de idiomas de bajos recursos sin requerir GPUs de datacenter, algo poco habitual en modelos ASR multilingües, que suelen superar los miles de millones de parámetros. La versión v2 indica una iteración sobre una versión previa, aunque la información disponible no detalla los cambios concretos respecto a v1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera CTC (omniasr_ctc) |
| Parámetros totales | 325.982.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | más de 1.000 códigos ISO 639-3 (aae, aal, abb, ... zza); incluye español (spa), inglés (eng), francés (fra), alemán (deu), portugués (por), catalán (cat), gallego (glg), euskera (eus), entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con una cabecera de clasificación CTC, un diseño habitual en ASR que predice directamente la secuencia de tokens a partir de las representaciones acústicas sin un decodificador autoregresivo separado. Esta elección simplifica el despliegue y permite decodificación en tiempo real o por lotes con menor coste computacional que los modelos encoder-decoder. El número exacto de capas, dimensión oculta y configuración del encoder no se especifica en la información disponible.

El entrenamiento se realizó sobre el corpus `facebook/omnilingual-asr-corpus`, un dataset multilingüe de gran escala que cubre cientos de idiomas. No se detalla en la información proporcionada el número total de horas de audio, la composición por idioma ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o aumentación de datos. Tampoco se documentan innovaciones técnicas específicas más allá del propio diseño CTC y la cobertura lingüística masiva.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en más de 1.000 idiomas y variantes dialectales.
- Decodificación CTC no autoregresiva, adecuada para transcripción de baja latencia.
- Cobertura de idiomas de bajos recursos poco frecuentes en otros sistemas ASR (por ejemplo, lenguas africanas, indígenas americanas y asiáticas).
- Soporte de idiomas con escritura no latina (árabe, chino, japonés, coreano, cirílico, devanagari, etc., según los códigos incluidos).
- Pipeline de `automatic-speech-recognition` compatible con la librería `transformers`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio más allá del ASR.

## Casos de uso

- Transcripción multilingüe de reuniones y conferencias: el modelo puede procesar audio en varios idiomas con un único checkpoint, útil en organizaciones internacionales que no quieren mantener un modelo por idioma.
- Subtitulado automático de vídeo en plataformas de contenido: al ser un modelo de 326M de parámetros con decodificación CTC, permite generar subtítulos con latencia baja en servidores modestos.
- Digitalización de archivos orales en lenguas minoritarias: investigadores y archivos etnográficos pueden transcribir grabaciones en idiomas con pocos recursos para los que no existen sistemas comerciales.
- Atención al cliente por voz en mercados emergentes: despliegue de ASR en lenguas locales sin depender de APIs propietarias, gracias a la licencia Apache 2.0.
- Indexación y búsqueda de contenido audio: transcripción por lotes de grandes volúmenes de audio para alimentar motores de búsqueda o sistemas de recuperación de información.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en contextos multilingües.
- Investigación lingüística comparada: análisis fonético y léxico automatizado sobre corpus orales en cientos de idiomas con un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB (325.982.768 parámetros × 4 bytes), coherente con el tamaño del repositorio (1,3 GB).
- VRAM estimada en FP16/BF16: aproximadamente 0,65 GB.
- VRAM estimada en cuantización INT8: aproximadamente 0,33 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para FP16; para FP32 se recomienda al menos 4 GB (GTX 1050 Ti o superior).
- Cabe holgadamente en GPUs consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), potencialmente ONNX Runtime y servidores compatibles con endpoints de Hugging Face (el tag `endpoints_compatible` está presente).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| OmniASR CTC 300M v2 | 326M | >1.000 | no disponible | Apache 2.0 | safetensors |
| Whisper large-v3 (OpenAI) | 1.550M | ~99 | 30 s de audio | MIT | safetensors, GGUF |
| MMS (Meta) | ~1.000M (por idioma) | >1.000 (modelos por idioma) | no disponible | CC-BY-NC 4.0 | safetensors |
| SeamlessM4T v2 (Meta) | ~2.300M | ~100 | no disponible | CC-BY-NC 4.0 | safetensors |

La comparativa se basa en datos públicos de cada modelo; para OmniASR no se dispone de métricas de error (WER) que permitan una comparación cuantitativa de rendimiento. La principal ventaja de OmniASR CTC 300M v2 es su reducido tamaño frente a Whisper large-v3 y su licencia permisiva frente a MMS y SeamlessM4T, que restringen el uso comercial.

## Limitaciones y advertencias

- No se han publicado métricas de WER por idioma, por lo que se desconoce la calidad real en cada una de las más de 1.000 lenguas cubiertas; es previsible un rendimiento muy desigual entre idiomas con muchos y pocos datos.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico.
- La decodificación CTC puede producir repeticiones o colapsos en segmentos ambiguos; conviene aplicar post-procesado.
- No se documenta el comportamiento en audio de larga duración ni la longitud máxima de entrada admitida.
- La cobertura de más de 1.000 códigos no garantiza calidad uniforme; muchos idiomas probablemente cuentan con pocas horas de entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el corpus de entrenamiento (`facebook/omnilingual-asr-corpus`) puede tener sus propias condiciones que conviene revisar.
- No se especifican sesgos demográficos ni geográficos conocidos; al ser un modelo multilingüe de amplia cobertura, es probable que infrarrepresente variedades dialectales no incluidas en el corpus.

## Enlaces

- Hugging Face: https://huggingface.co/hf-audio/omniasr-ctc-300m-v2
- Paper (arXiv): https://arxiv.org/abs/2511.09690
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
