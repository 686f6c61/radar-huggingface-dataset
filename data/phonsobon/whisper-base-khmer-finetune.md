# phonsobon/whisper-base-khmer-finetune

## Resumen

El modelo `phonsobon/whisper-base-khmer-finetune` es un ajuste fino de `openai/whisper-base` para el reconocimiento automático del habla (ASR) en idioma jemer (khmer, código `km`), la lengua oficial de Camboya. Ha sido desarrollado por Phon Sobon como parte de la iniciativa Chaktomuk Managements (CTM) del Ministerio de Correos y Telecomunicaciones de Camboya, dentro de su grupo de trabajo de transformación digital. El objetivo es mejorar la precisión de transcripción de Whisper en un idioma de bajos recursos que el modelo original no cubre adecuadamente.

Se trata de un modelo de tipo encoder-decoder transformer, con aproximadamente 72,6 millones de parámetros, heredados del checkpoint base de Whisper. El ajuste se ha realizado sobre un dataset propio (`phonsobon/khmer-speech-dataset`) y el checkpoint publicado corresponde al paso 2000 (aunque la sección de entrenamiento menciona el paso 4000, hay una inconsistencia en la documentación). El modelo está etiquetado como experimental y aún no se han publicado métricas de evaluación como el Word Error Rate (WER) sobre un conjunto de prueba independiente.

La relevancia de este modelo radica en que Whisper base, aunque multilingüe, muestra un rendimiento deficiente en idiomas como el jemer. Este fine-tune busca ofrecer una alternativa ligera y específica para transcripción en khmer, con una licencia Apache 2.0 que permite uso comercial, y un tamaño que lo hace viable para despliegues en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper base) |
| Parametros totales | 72.593.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (heredado de Whisper base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Jemer (khmer, `km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de Whisper base: un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de log-Mel de 80 canales como entrada y generar tokens de texto como salida. El encoder procesa ventanas de audio de hasta 30 segundos, mientras que el decoder autoregresivo produce la transcripción. El ajuste fino se ha realizado sobre el checkpoint preentrenado de OpenAI, adaptando los pesos a las características acústicas y fonéticas del jemer.

El entrenamiento se llevó a cabo con el framework `Seq2SeqTrainer` de Hugging Face Transformers, utilizando el dataset `phonsobon/khmer-speech-dataset` (cuyo tamaño y composición no se detallan en la documentación). No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tune supervisado estándar. El checkpoint publicado corresponde al paso 2000 (aunque la sección de detalles de entrenamiento indica el paso 4000, lo que sugiere que el archivo subido puede ser de un punto intermedio). Los archivos de estado del optimizador y del scheduler se excluyeron del repositorio para reducir el tamaño.

## Capacidades

- Transcripción de audio en jemer (khmer) a texto, mediante la tarea `transcribe` del pipeline de ASR.
- Procesamiento de audio muestreado a 16 kHz, mono, como entrada estándar para Whisper.
- Integración con la API de Hugging Face Transformers, tanto mediante `WhisperForConditionalGeneration` como con el pipeline de `automatic-speech-recognition`.
- Soporte para forzar el idioma y la tarea mediante `forced_decoder_ids`, evitando traducción accidental.
- Capacidad de ejecución en CPU y GPU gracias a su tamaño reducido (~74M parámetros).
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multi-paso; es exclusivamente un modelo de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y actas gubernamentales: el modelo puede convertir grabaciones de audio de reuniones oficiales en jemer a texto, facilitando la elaboración de actas y la búsqueda de contenido. Su tamaño ligero permite ejecutarlo en servidores de gama media sin necesidad de GPUs de alta gama.
- Subtitulado automático de vídeos en jemer: integrado en un pipeline de procesamiento de vídeo, puede generar subtítulos para contenido audiovisual local, mejorando la accesibilidad para la comunidad camboyana.
- Atención al cliente automatizada: empresas y organismos públicos pueden transcribir llamadas de soporte en jemer para su análisis posterior, detección de temas recurrentes o evaluación de calidad. La ventana de 30 segundos es adecuada para segmentos de conversación.
- Archivado y búsqueda de contenido audiovisual: bibliotecas digitales o archivos de radio y televisión pueden indexar sus grabaciones en jemer transcribiéndolas, permitiendo búsquedas por texto.
- Asistentes de voz para aplicaciones móviles: desarrolladores pueden integrar el modelo en apps que requieran entrada por voz en jemer, como dictado de mensajes o comandos de voz, aprovechando su bajo consumo de recursos.
- Herramientas de accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real (o casi) de discursos o eventos en jemer, combinada con sistemas de visualización de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint está en fase experimental y que el Word Error Rate (WER) y otras métricas de evaluación no han sido finalizados. No se proporcionan comparaciones con otros modelos ASR para jemer.

## Requisitos de hardware

- VRAM estimada para inferencia: con 72,6 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 290 MB de memoria; en FP16, unos 145 MB. En cuantización int8 (si se aplicara) podría reducirse a unos 73 MB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso GPUs integradas modernas. También es viable en CPU para inferencia por lotes pequeños.
- Se puede ejecutar en hardware de consumo: sí, es perfectamente viable en una Raspberry Pi 5 (con limitaciones de velocidad) o en un portátil sin GPU dedicada.
- Opciones de despliegue: compatible con Hugging Face Transformers (Python), y puede servirse mediante TGI (Text Generation Inference) o vLLM, aunque estos están más orientados a modelos de lenguaje. Para ASR, se recomienda usar `transformers` con `pipeline` o `faster-whisper` (si se convierte el modelo a formato CTranslate2). También es posible exportar a ONNX para inferencia optimizada.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090), la inferencia de un clip de 10 segundos debería tomar menos de 1 segundo, pero estos datos son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `phonsobon/whisper-base-khmer-finetune` | 74M | 30 s | Jemer (km) | Apache 2.0 | Fine-tune específico, experimental |
| `openai/whisper-base` | 74M | 30 s | Multilingüe (99 idiomas) | MIT | Modelo base, rendimiento limitado en khmer |
| `openai/whisper-small` | 244M | 30 s | Multilingüe | MIT | Mayor precisión general, pero más pesado |
| `facebook/mms-1b-all` | 1B | 30 s | 1000+ idiomas | CC-BY-NC 4.0 | Cubre khmer, pero licencia no comercial |

No se dispone de comparativas de rendimiento (WER) porque el modelo no ha sido evaluado públicamente. La comparativa se basa en características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Estado experimental: el checkpoint no ha sido evaluado contra un conjunto de prueba independiente; el WER y otras métricas no se han publicado. No se recomienda su uso en producción sin una validación previa.
- Rendimiento no probado en condiciones adversas: no se ha evaluado con audio ruidoso, habla con solapamiento, acentos regionales o variaciones dialectales del jemer.
- Code-switching: la mezcla de jemer e inglés (frecuente en Camboya urbana) no ha sido probada y probablemente degrade la precisión.
- Inconsistencia documental: la model card menciona el checkpoint en el paso 2000 en un lugar y en el paso 4000 en otro; esto puede indicar que el archivo subido no corresponde exactamente al descrito.
- Sesgos potenciales: al estar entrenado sobre un dataset propio no documentado, puede haber sesgos en cuanto a género, edad o contexto geográfico de los hablantes.
- Limitación de contexto: la ventana de 30 segundos obliga a segmentar audios más largos, lo que puede afectar a la coherencia de transcripciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Whisper es MIT; no hay conflicto conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phonsobon/whisper-base-khmer-finetune
- Dataset de entrenamiento: https://huggingface.co/datasets/phonsobon/khmer-speech-dataset
- Modelo base: https://huggingface.co/openai/whisper-base
- Perfil del autor en Hugging Face: https://huggingface.co/phonsobon
- Proyecto relacionado de fine-tuning de Whisper para khmer: https://github.com/phanithlim/fine-tuning-whisper
- Colección de datasets de TTS en khmer del autor: https://huggingface.co/collections/phonsobon/khmer-text-to-speech-datasets
