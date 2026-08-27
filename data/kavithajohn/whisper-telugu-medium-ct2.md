# kavithajohn/whisper-telugu-medium-ct2

## Resumen

El modelo `kavithajohn/whisper-telugu-medium-ct2` es una conversión al formato CTranslate2 del fine-tune `vasista22/whisper-telugu-medium`, un modelo de reconocimiento automático del habla (ASR) especializado en telugu. El autor de la conversión, kavithajohn, no modifica los pesos del modelo original; únicamente transforma el formato para que pueda cargarse directamente con la librería faster-whisper, evitando así que cada máquina tenga que realizar la conversión por su cuenta.

El modelo base es un fine-tune de `openai/whisper-medium` entrenado sobre datos de telugu procedentes de varios corpus ASR públicos, como parte del "Whisper fine-tuning sprint". Al tratarse de Whisper medium, la arquitectura es un transformer encoder-decoder con aproximadamente 769 millones de parámetros (dato no confirmado en la información proporcionada) y una ventana de audio de 30 segundos por segmento. La conversión a CTranslate2 permite una inferencia más rápida y eficiente en CPU y GPU, manteniendo la licencia Apache-2.0 del modelo original.

Este modelo resulta relevante para desarrolladores que necesitan transcribir audio en telugu con un modelo optimizado para producción, ya que faster-whisper ofrece una aceleración significativa respecto a la implementación original de Whisper, y el formato CTranslate2 facilita el despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper medium (transformer encoder-decoder) |
| Parametros totales | no disponible (Whisper medium, ~769M según especificación original) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper estándar: ventanas de 30 segundos) |
| Tipos de cuantizacion | float16, int8_float16 (mencionados en la model card) |
| Idiomas soportados | te (telugu) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (formato propio de la librería) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openai/whisper-medium` sobre datos de telugu. Whisper medium emplea una arquitectura transformer encoder-decoder con normalización previa, atención multi-cabeza y codificación posicional sinusoidal. El entrenamiento del modelo base se realizó sobre una combinación de corpus ASR públicos en telugu, dentro del marco del "Whisper fine-tuning sprint" organizado por la comunidad. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineamiento como RLHF o DPO, ya que no se mencionan en la información proporcionada.

La conversión a CTranslate2 no altera los pesos; únicamente transforma el formato para que faster-whisper pueda cargarlo directamente. La model card indica que el `tokenizer.json` se tomó sin modificaciones de `openai/whisper-medium`, ya que el repositorio fuente no lo publica, y que `preprocessor_config.json` proviene del repositorio original. Esta práctica es válida porque el tokenizador es idéntico en toda la generación de Whisper.

## Capacidades

- Reconocimiento automático del habla (ASR) en telugu, transcribiendo audio a texto.
- Inferencia optimizada mediante faster-whisper, que aprovecha la cuantización y el formato CTranslate2 para reducir la latencia.
- Soporte para procesamiento por lotes y transcripción de audio largo mediante segmentación en ventanas de 30 segundos.
- Compatible con GPU y CPU, con opciones de precisión `float16` e `int8_float16`.
- No se mencionan capacidades adicionales como traducción de voz, identificación de idioma o tool calling; el modelo se limita a la transcripción en telugu.

## Casos de uso

- Transcripción de reuniones y conferencias en telugu: el modelo puede procesar grabaciones de audio de larga duración segmentándolas en ventanas de 30 segundos, lo que permite generar actas o resúmenes textuales de forma automatizada.
- Subtitulado automático de vídeos en telugu: al integrarse con pipelines de procesamiento de vídeo, el modelo genera subtítulos sincronizados, útil para plataformas de contenido y accesibilidad.
- Asistentes de voz en telugu: combinado con un sistema de detección de actividad de voz, el modelo transcribe comandos de usuario para alimentar interfaces conversacionales en aplicaciones móviles o dispositivos domésticos.
- Transcripción de llamadas de atención al cliente: en centros de contacto que operan en telugu, el modelo convierte las grabaciones de llamadas en texto para su análisis posterior (sentimiento, detección de incidencias, cumplimiento normativo).
- Documentación médica dictada: profesionales de la salud en regiones de habla telugu pueden dictar notas clínicas y obtener transcripciones precisas, reduciendo la carga administrativa.
- Transcripción de podcasts y contenido multimedia: los creadores de contenido pueden convertir sus episodios en texto para publicar notas, mejorar el SEO o facilitar la accesibilidad a personas con discapacidad auditiva.
- Análisis de ventas y formación: las grabaciones de sesiones de ventas o formaciones en telugu se transcriben para extraer métricas de rendimiento o generar materiales de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) sobre conjuntos de datos estándar de telugu, ni comparaciones con otros modelos ASR. La model card no incluye ninguna evaluación cuantitativa.

## Requisitos de hardware

- VRAM estimada: la model card indica que el modelo puede cargarse en `float16` en cualquier GPU de 6 GB o más. En tarjetas con menos memoria, se recomienda usar `compute_type="int8_float16"` para reducir el consumo de VRAM.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, o superiores. Para inferencia en producción, GPUs como A100 o H100 ofrecen mayor throughput, aunque no son imprescindibles.
- En CPU, faster-whisper puede ejecutar el modelo con cuantización `int8`, aunque la latencia será mayor que en GPU.
- Opciones de despliegue: faster-whisper (librería principal), CTranslate2 (backend), y cualquier framework que soporte estos formatos (por ejemplo, servidores de inferencia como Triton o servicios personalizados con Python).
- Latencia y throughput: no se proporcionan datos concretos. En una GPU moderna, Whisper medium en `float16` suele transcribir audio más rápido que en tiempo real, pero depende del hardware y del número de hilos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos ASR para telugu. El modelo base `vasista22/whisper-telugu-medium` es el mismo fine-tune, y la conversión a CTranslate2 no altera el rendimiento. Otras alternativas podrían ser el Whisper original (`openai/whisper-medium`) sin fine-tune, que soporta telugu pero con peor precisión, o modelos ASR específicos de telugu como los basados en wav2vec 2.0, pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en telugu y puede no funcionar correctamente con otros idiomas; no se recomienda su uso fuera de este ámbito.
- Al ser un fine-tune sobre corpus públicos, puede presentar sesgos hacia acentos o dialectos específicos del telugu, y su rendimiento puede degradarse con audio ruidoso o de baja calidad.
- Whisper es conocido por generar alucinaciones en silencios o audio ambiguo; se recomienda validar las transcripciones en contextos críticos.
- La ventana de contexto de 30 segundos limita la coherencia en transcripciones de audio muy largo, aunque faster-whisper gestiona la segmentación automáticamente.
- El `tokenizer.json` se tomó de `openai/whisper-medium`; aunque es idéntico al del modelo base, cualquier discrepancia futura en el tokenizador de Whisper podría afectar la compatibilidad.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al autor del fine-tune original (vasista22) y a OpenAI por el modelo base.
- No se han publicado evaluaciones de rendimiento, por lo que no se puede garantizar una precisión concreta en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kavithajohn/whisper-telugu-medium-ct2
- Modelo base (fine-tune): https://huggingface.co/vasista22/whisper-telugu-medium
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
