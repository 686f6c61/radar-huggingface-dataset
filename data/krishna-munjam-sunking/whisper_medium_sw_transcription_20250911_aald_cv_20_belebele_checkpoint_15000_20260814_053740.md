# krishna-munjam-sunking/whisper_medium_sw_transcription_20250911_aald_cv_20_belebele_checkpoint_15000_20260814_053740

## Resumen

El modelo `krishna-munjam-sunking/whisper_medium_sw_transcription_20250911_aald_cv_20_belebele_checkpoint_15000_20260814_053740` es un fine-tuning de Whisper Medium (arquitectura encoder-decoder transformer de OpenAI) especializado en transcripción de audio en swahili. El nombre del repositorio indica que se entrenó con una combinación de datasets que incluyen Common Voice (probablemente la partición swahili) y Belebele, un benchmark de comprensión lectora multilingüe, lo que sugiere que el objetivo era mejorar la robustez del modelo en swahili tanto para transcripción como para tareas relacionadas.

Con 763,86 millones de parámetros, hereda la arquitectura del Whisper Medium original, diseñada para procesar hasta 30 segundos de audio por pasada y generar texto transcrito. El checkpoint corresponde al paso 15000 de entrenamiento, lo que indica un fine-tuning relativamente extenso. Es relevante porque cubre un hueco en el ecosistema de modelos de transcripción para lenguas africanas con pocos recursos, aunque la información pública disponible es muy limitada y no se han publicado métricas de evaluación.

El repositorio pesa 27,5 GB, lo que es consistente con los pesos en safetensors de un modelo de este tamaño (los pesos de Whisper Medium ocupan aproximadamente 3 GB en fp32, pero el tamaño del repo sugiere que podría incluir múltiples formatos o checkpoints adicionales). No se especifica licencia, pipeline ni idiomas soportados en la ficha de HuggingFace, por lo que cualquier despliegue en producción requiere verificar estos aspectos con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper Medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (448 frames de mel spectrogram) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base Whisper Medium soporta 99 idiomas, pero el fine-tuning parece orientado a swahili) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper Medium, un transformer encoder-decoder con 24 capas en el encoder y 24 en el decoder, atención de 16 cabezas y dimensiones ocultas de 1024. El encoder procesa mel spectrograms de 80 canales a partir de audio de 16 kHz, mientras que el decoder genera texto autoregresivamente. El fine-tuning se realizó sobre el checkpoint base de OpenAI, aunque no se especifican los hiperparámetros exactos, la composición precisa del dataset ni el número total de tokens de entrenamiento.

El nombre del repo sugiere que se usaron dos fuentes de datos: Common Voice (Mozilla) en su partición swahili y Belebele, un dataset multilingüe de comprensión lectora. La inclusión de Belebele es inusual para un modelo de transcripción y podría indicar que el entrenamiento incluyó tareas auxiliares o que el fine-tuning se diseñó para mejorar la capacidad del modelo en swahili de forma más amplia. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El checkpoint 15000 sugiere un entrenamiento prolongado, pero sin detalles sobre la curva de pérdida o la evaluación durante el entrenamiento, es difícil juzgar su calidad.

## Capacidades

- Transcripción de audio a texto en swahili, heredando las capacidades de Whisper Medium para el resto de idiomas (aunque el fine-tuning puede haber degradado el rendimiento en otros idiomas).
- Procesamiento de audio de hasta 30 segundos por pasada, con soporte para segmentos más largos mediante ventanas deslizantes.
- Detección de idioma hablado (capacidad del modelo base, no confirmada para este fine-tuning).
- Sin soporte documentado de tool calling, function calling ni capacidades de agente.
- Sin capacidades de visión ni multimodales más allá del audio.
- No se ha publicado información sobre modo de razonamiento extendido o "thinking mode".

## Casos de uso

- Transcripción de entrevistas y testimonios en swahili: el modelo puede transcribir grabaciones de hasta 30 segundos por pasada, y con un post-procesamiento de concatenación de segmentos se pueden procesar entrevistas largas. Es adecuado para proyectos de documentación oral o investigación social en países de habla swahili (Kenia, Tanzania, Uganda).
- Generación de subtítulos para vídeos en swahili: integrable en pipelines de transcripción automática para plataformas de vídeo o medios locales. El formato safetensors permite cargarlo con transformers y generar subtítulos en lote.
- Archivado y búsqueda de contenido de audio en swahili: transcripción de archivos de radio, podcasts o reuniones para indexado y búsqueda textual posterior.
- Asistencia a personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos en swahili, aunque la latencia dependerá del hardware de despliegue.
- Preparación de datos de entrenamiento para modelos de lenguaje: el modelo puede transcribir grandes volúmenes de audio en swahili para crear corpus de texto que alimenten LLMs o sistemas de traducción.
- Evaluación comparativa de modelos de transcripción para lenguas africanas: al ser un fine-tuning específico, sirve como referencia para medir el rendimiento de Whisper base frente a versiones adaptadas, aunque sin benchmarks publicados su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de WER (Word Error Rate) ni comparaciones con Whisper Medium original u otros fine-tunings en swahili. El autor no ha compartido evaluaciones en Common Voice swahili ni en otros conjuntos de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y audio, por lo que se recomienda al menos 6 GB de VRAM para inferencia básica con batch size 1.
- Con cuantización a int8 o fp16 (no publicada en el repo, pero aplicable al modelo base), la VRAM se reduce a ~1,6 GB y ~2 GB respectivamente, permitiendo ejecución en GPUs de consumo como RTX 3060 o RTX 4060.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, A10) para inferencia cómoda; para entrenamiento adicional se necesitaría una GPU con 16-24 GB (RTX 3090, A100).
- Opciones de despliegue: vLLM no es compatible con Whisper directamente (está orientado a LLMs), pero se puede usar con transformers de HuggingFace, o mediante el pipeline de `transformers` para audio. También se puede exportar a ONNX o TensorRT para optimización.
- Latencia estimada: en una RTX 3090, Whisper Medium tarda aproximadamente 1-2 segundos en transcribir un segmento de 30 segundos de audio; en CPU (sin GPU) puede tardar 10-20 segundos por segmento, lo que limita su uso en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tuning (whisper_medium_sw) | 763,86 M | 30 s audio | swahili (no confirmado) | no disponible | HuggingFace |
| openai/whisper-medium | 763,86 M | 30 s audio | 99 idiomas | MIT | HuggingFace |
| openai/whisper-large-v3 | 1.550 M | 30 s audio | 99 idiomas | MIT | HuggingFace |
| mozilla/faster-whisper-medium | 763,86 M | 30 s audio | 99 idiomas | MIT | HuggingFace |

La comparativa se basa en el modelo base, ya que no hay benchmarks propios. Whisper-large-v3 ofrece mejor rendimiento general en WER, pero requiere más VRAM (3 GB en fp16). faster-whisper-medium es una reimplementación optimizada de Whisper Medium con CTranslate2 que ofrece menor latencia y soporte de cuantización, sin pérdida significativa de calidad. Este fine-tuning solo tiene sentido si se demuestra una mejora sustancial en swahili, algo que no está documentado.

## Limitaciones y advertencias

- Sesgos conocidos: Whisper Medium base tiene sesgos de género y acento documentados en inglés y otros idiomas; el fine-tuning en swahili puede heredar o amplificar estos sesgos dependiendo de la composición del dataset de entrenamiento, que no se ha publicado.
- Riesgo de alucinación: Whisper es conocido por generar texto alucinado en silencios o audio de baja calidad; sin evaluación específica, este riesgo persiste.
- Limitaciones de contexto: solo procesa 30 segundos de audio por pasada, lo que requiere manejo de segmentos para audio largo; la coherencia entre segmentos puede degradarse.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin consultar al autor. El modelo base es MIT, pero el fine-tuning podría tener restricciones adicionales.
- Idiomas: el fine-tuning probablemente degrada el rendimiento en otros idiomas distintos del swahili, aunque no se ha verificado.
- Producción: sin benchmarks ni documentación de entrenamiento, no se recomienda su uso en sistemas críticos sin una evaluación independiente previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/krishna-munjam-sunking/whisper_medium_sw_transcription_20250911_aald_cv_20_belebele_checkpoint_15000_20260814_053740
- Modelo base Whisper Medium: https://huggingface.co/openai/whisper-medium
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Common Voice (dataset): https://commonvoice.mozilla.org/
- Belebele (dataset): https://huggingface.co/datasets/facebook/belebele
