# giangndm/omniASR-W2V-300M

## Resumen

omniASR-W2V-300M es un codificador de audio auto-supervisado (SSL) desarrollado por Meta AI como parte de la familia Omnilingual ASR, un conjunto de modelos de reconocimiento de voz multilingüe que cubre más de 1600 lenguas. Este modelo concreto, basado en la arquitectura Wav2Vec 2.0/Conformer, extrae representaciones acústicas de audio en bruto sin necesidad de transcripciones, lo que lo convierte en una herramienta de extracción de características para etapas posteriores de ASR o análisis de voz.

El repositorio que se analiza aquí es una conversión a formato `safetensors` en precisión `bfloat16` del modelo original de Meta, realizada por el usuario giangndm. Esta conversión reduce el tamaño del archivo a aproximadamente 630 MB (frente a 1,25 GB en FP32) y elimina la ejecución de código arbitrario durante la carga, mejorando la seguridad y la eficiencia de almacenamiento. El modelo tiene 317,4 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su capacidad para procesar audio de cientos de idiomas con un solo encoder, lo que facilita el desarrollo de sistemas ASR multilingües, especialmente en entornos con recursos limitados o para investigación en lenguas de bajos recursos. Al ser un modelo SSL, no requiere etiquetas para el entrenamiento de representaciones, lo que permite su uso como base para fine-tuning en tareas específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec 2.0 / Conformer (encoder auto-supervisado) |
| Parametros totales | 317.390.592 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (conversion del repo); FP32 original |
| Idiomas soportados | 1600+ (formato `{codigo_idioma}_{script}`, p. ej. `eng_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Wav2Vec 2.0 con bloques Conformer, diseñada para aprendizaje auto-supervisado de representaciones de voz. El encoder procesa audio en bruto y produce embeddings acústicos que capturan propiedades fonéticas y prosódicas sin necesidad de transcripciones. El entrenamiento se realizó sobre el corpus `facebook/omnilingual-asr-corpus`, que abarca más de 1600 lenguas, lo que permite al modelo generalizar entre idiomas y scripts diversos.

La familia Omnilingual ASR incluye tres variantes de encoder SSL (300M, 1B, 3B y 7B) junto con modelos de decodificación CTC y LLM. Este modelo de 300M es el más ligero de la serie SSL, pensado para entornos con restricciones de cómputo o como extractor de características eficiente. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, el uso de RLHF/DPO o técnicas de decodificación especulativa en la información disponible.

## Capacidades

- Extracción de características acústicas de audio en bruto (representaciones SSL) para 1600+ idiomas.
- Generación de embeddings de audio listos para ser consumidos por modelos ASR posteriores (CTC, LLM) o para fine-tuning en tareas específicas.
- Soporte multilingüe extenso, incluyendo lenguas con diferentes sistemas de escritura (latino, cirílico, árabe, etc.).
- No incluye decodificación de texto directamente; requiere un cabezal de ASR (CTC o LLM) para producir transcripciones.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un encoder de audio puro.
- No tiene capacidades de visión ni de generación de texto.

## Casos de uso

- Extracción de características para ASR multilingüe: el modelo puede usarse como front-end acústico en pipelines de reconocimiento de voz, alimentando decodificadores CTC o modelos de lenguaje para transcribir audio en cientos de idiomas.
- Fine-tuning para lenguas de bajos recursos: al estar pre-entrenado en 1600+ idiomas, sirve como punto de partida para adaptar sistemas ASR a lenguas con pocos datos etiquetados, reduciendo la cantidad de datos necesarios.
- Análisis de voz y prosodia: los embeddings generados pueden utilizarse para tareas de clasificación de emociones, detección de hablante o segmentación de audio, gracias a la riqueza de las representaciones SSL.
- Investigación en aprendizaje auto-supervisado: el modelo permite estudiar cómo las representaciones acústicas aprendidas sin supervisión se transfieren entre idiomas y scripts, útil para trabajos académicos.
- Sistemas de subtitulación automática: combinado con un decodificador, puede transcribir contenido audiovisual en múltiples idiomas, facilitando la generación de subtítulos a gran escala.
- Asistentes de voz multilingües: integrado en un pipeline ASR completo, permite entender comandos de voz en numerosos idiomas, mejorando la accesibilidad de asistentes virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de la model card original incluye métricas de VRAM y real-time factor para los modelos CTC y LLM, pero no para los encoders SSL como este. Se recomienda consultar el paper de Omnilingual ASR para datos de evaluación comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo en bfloat16 ocupa ~630 MB en disco, por lo que la VRAM necesaria para cargar los pesos sería ligeramente superior (típicamente 1-2 GB adicionales para activaciones y overhead).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo en bfloat16. Tarjetas como NVIDIA RTX 3060, RTX 4060 o superiores son suficientes. Para procesamiento por lotes grande, se recomienda A100 o H100.
- Sí cabe en GPUs de consumo: una RTX 3060 con 12 GB o una RTX 4070 con 12 GB pueden manejar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo de extracción de características, puede ejecutarse con la librería `fairseq2` (recomendada por Meta) o mediante Hugging Face Transformers si se adapta. También es posible usar `vLLM` o `TGI` si se integra en un pipeline ASR, aunque no son las herramientas más habituales para encoders SSL.
- Latencia y throughput: no disponibles. El modelo es relativamente ligero (300M), por lo que la inferencia debería ser rápida en GPU modernas, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| omniASR-W2V-300M (este) | 317M | no disponible | 1600+ | Apache 2.0 | safetensors (bfloat16) |
| omniASR-W2V-1B | 965M | no disponible | 1600+ | Apache 2.0 | safetensors (FP32) |
| omniASR-W2V-3B | 3,06B | no disponible | 1600+ | Apache 2.0 | safetensors (FP32) |
| omniASR-CTC-300M | 325M | no disponible | 1600+ | Apache 2.0 | safetensors (FP32) |

La comparativa se limita a la familia Omnilingual ASR, ya que no se dispone de información sobre modelos SSL comparables de otros desarrolladores en los datos proporcionados. El modelo de 300M es el más ligero de la serie SSL, mientras que las variantes CTC añaden un cabezal de decodificación para ASR directo.

## Limitaciones y advertencias

- El modelo es un encoder SSL: no produce transcripciones por sí mismo. Requiere un decodificador (CTC o LLM) para tareas de ASR, lo que añade complejidad al pipeline.
- No se han publicado métricas de rendimiento específicas para este modelo en la información disponible, por lo que su calidad en tareas concretas debe evaluarse empíricamente.
- La cobertura de 1600+ idiomas puede ser desigual: lenguas con más datos de entrenamiento probablemente tengan mejores representaciones que lenguas de bajos recursos.
- Al ser una conversión a bfloat16, puede haber una ligera pérdida de precisión frente al modelo original en FP32, aunque en la práctica suele ser despreciable.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del corpus `facebook/omnilingual-asr-corpus` para asegurar el cumplimiento en productos comerciales.
- No se proporcionan detalles sobre sesgos o alucinaciones, al ser un modelo de representación y no generativo.

## Enlaces

- Repositorio de HuggingFace (conversion): https://huggingface.co/giangndm/omniASR-W2V-300M
- Modelo original de Meta: https://huggingface.co/facebook/omniASR-W2V-300M
- Repositorio de GitHub: https://github.com/facebookresearch/omnilingual-asr
- Demo de transcripcion: https://huggingface.co/spaces/facebook/omniasr-transcriptions
- Paper: https://ai.meta.com/research/publications/omnilingual-asr-open-source-multilingual-speech-recognition-for-1600-languages/
- Blogpost: https://ai.meta.com/blog/omnilingual-asr-advancing-automatic-speech-recognition/
- Licencia: https://github.com/facebookresearch/omnilingual-asr/blob/main/LICENSE
