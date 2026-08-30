# 01Yassine/cohere-transcribe-darija-decoder-lora

## Resumen

El modelo `01Yassine/cohere-transcribe-darija-decoder-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para mejorar el reconocimiento automático del habla (ASR) en darija, el árabe marroquí. Se basa en el modelo base `CohereLabs/cohere-transcribe-arabic-07-2026`, parte de la familia Cohere Transcribe, que utiliza una arquitectura Conformer encoder-decoder con 2 mil millones de parámetros y soporta 14 idiomas, incluido el árabe. Este adaptador se aplica únicamente al decoder, dejando el encoder congelado, y ha sido entrenado con un conjunto de datos de 3 horas de audio procedente de YouTube en darija.

El modelo resuelve el problema de la falta de sistemas ASR específicos para el árabe marroquí, una variante dialectal con diferencias significativas respecto al árabe estándar. Según la evaluación en el benchmark `atlasia/darija-asr-benchmark`, el adaptador reduce el WER (Word Error Rate) del 49,1 % del modelo base al 45,1 %, manteniendo el mismo CER (Character Error Rate) del 20,2 %. Es relevante porque permite adaptar un modelo ASR multilingüe a un dialecto subrepresentado con un coste computacional mínimo, al tratarse de un adaptador LoRA de pequeño tamaño (el repositorio ocupa 0,0 GB).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre decoder de un modelo Conformer encoder-decoder (base: Cohere Transcribe Arabic, 2B parámetros) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no texto) |
| Tipos de cuantizacion | No disponible (el adaptador se puede cargar sobre el modelo base cuantizado, pero no se especifican) |
| Idiomas soportados | ar (árabe), ary (darija, árabe marroquí) |
| Licencia | other (no especificada; consultar repositorio) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Cohere Transcribe Arabic, que emplea una arquitectura Conformer encoder-decoder de 2B parámetros. El Conformer combina capas de atención y convoluciones para modelar dependencias locales y globales en el audio. En este adaptador, solo se entrenan los parámetros LoRA del decoder, mientras que el encoder permanece congelado. Esta estrategia reduce significativamente el número de parámetros entrenables y el coste de cómputo, a la vez que permite ajustar el modelo a un dominio específico (el darija) sin perder las representaciones generales del encoder.

El entrenamiento se realizó con el dataset `01Yassine/darija-asr-3h`, compuesto por 3 horas de audio extraído de YouTube en darija. No se especifican los hiperparámetros exactos ni el número de pasos de entrenamiento. La evaluación se llevó a cabo en el benchmark `atlasia/darija-asr-benchmark`, que contiene 114 clips anotados por humanos. Este adaptador es una de las variantes probadas por el autor; otras variantes incluyen LoRA completo, LoRA en encoder y una configuración híbrida (que combina ambos), siendo esta última la que obtiene mejores resultados (14,4 CER).

## Capacidades

- Transcripción de voz en darija (árabe marroquí) a texto.
- Reconocimiento automático del habla (ASR) para audio en darija, con mejora notable del WER frente al modelo base sin adaptar.
- Soporte multilingüe parcial: aunque el adaptador está especializado en darija, hereda las capacidades del modelo base para otros idiomas (si se usa sin el adaptador).
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso, al tratarse de un modelo puramente ASR.
- No se mencionan capacidades de visión, audio además del habla, ni modo de pensamiento.

## Casos de uso

- Transcripción de reuniones y llamadas en darija: el modelo puede convertir audio de conversaciones en árabe marroquí a texto, útil para actas, búsqueda de contenido o análisis posterior. Su bajo WER (45,1 %) lo hace viable para contextos donde el audio es relativamente limpio.
- Subtitulado automático de vídeos en darija: aplicable a contenido de YouTube, redes sociales o archivos de vídeo, generando subtítulos en texto para mejorar la accesibilidad.
- Asistentes de voz para aplicaciones locales: integración en asistentes o chatbots que necesiten entender comandos hablados en darija, por ejemplo en atención al cliente o domótica.
- Análisis de llamadas de soporte técnico: transcribir grabaciones de centros de contacto para extraer métricas de calidad, detección de problemas frecuentes o entrenamiento de agentes.
- Archivado y búsqueda de contenido audiovisual: convertir archivos de audio en darija a texto indexable para motores de búsqueda internos o bases de datos documentales.
- Investigación lingüística: herramienta para estudios sociolingüísticos o de procesamiento de lenguaje natural en dialectos árabes, permitiendo transcribir corpus orales de manera automática.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados reportados en la model card del adaptador, evaluados en el benchmark `atlasia/darija-asr-benchmark` (114 clips, anotaciones humanas). Se compara el adaptador decoder LoRA con el modelo base y con otras variantes del mismo autor.

| Modelo | CER (%) | WER (%) |
|---|---|---|
| Base (Cohere Transcribe Arabic) | 20,2 | 49,1 |
| **Decoder LoRA (este modelo)** | **20,2** | **45,1** |
| Encoder LoRA | 17,4 | no disponible |
| Full LoRA | 16,5 | no disponible |
| Hybrid (recomendado) | 14,4 | no disponible |

Nota: los valores de WER para las variantes encoder, full e hybrid no se indican en la información disponible. El autor recomienda la variante híbrida por su menor CER.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base Cohere Transcribe Arabic (2B parámetros) más los pesos del adaptador (muy pequeños, ~0,0 GB).
- El modelo base en precisión FP16 ocupa aproximadamente 4-5 GB de VRAM, por lo que una GPU con al menos 6 GB (p. ej., RTX 3060, RTX 4060) podría ejecutarlo, aunque para inferencia en tiempo real se recomienda una GPU con más memoria.
- No se han publicado datos de latencia o throughput específicos para este adaptador.
- Opciones de despliegue: se puede cargar mediante la librería `peft` sobre el modelo base en frameworks como Hugging Face Transformers, o usar herramientas de inferencia ASR como vLLM (si soporta Cohere Transcribe) o pipelines personalizados. También es posible cuantizar el modelo base para reducir requisitos de VRAM, aunque no se especifican configuraciones concretas.

## Comparativa con modelos similares

La comparativa se centra en las variantes del mismo autor, ya que no se dispone de datos de otros modelos ASR específicos para darija en la información proporcionada.

| Modelo | Tipo de adaptación | CER (%) | WER (%) | Licencia |
|---|---|---|---|---|
| Base (Cohere Transcribe Arabic) | Sin adaptación | 20,2 | 49,1 | open source (según Cohere) |
| Decoder LoRA (este modelo) | LoRA solo decoder | 20,2 | 45,1 | other |
| Encoder LoRA | LoRA solo encoder | 17,4 | no disponible | other |
| Full LoRA | LoRA completo | 16,5 | no disponible | other |
| Hybrid | LoRA encoder + decoder | 14,4 | no disponible | other |

El adaptador decoder LoRA es el que peor rendimiento ofrece entre las variantes, pero sigue mejorando el WER del modelo base. Para casos de uso donde se requiera mayor precisión, se recomienda la variante híbrida (enlace en la sección de enlaces).

## Limitaciones y advertencias

- Entrenamiento con solo 3 horas de audio, lo que limita la cobertura de acentos, vocabulario y condiciones acústicas. El modelo puede fallar en habla rápida, ruido de fondo o términos técnicos.
- WER del 45,1 % sigue siendo alto para producción en contextos donde la precisión es crítica; se recomienda evaluar en el dominio objetivo antes de desplegar.
- No se han reportado análisis de sesgos. Al entrenarse con datos de YouTube, puede reflejar sesgos presentes en ese contenido (por ejemplo, variedades urbanas frente a rurales).
- La licencia "other" no especifica las condiciones de uso comercial. Se debe contactar con el autor o revisar el repositorio para aclarar los términos.
- Al ser un adaptador sobre un modelo base, requiere la descarga del modelo base completo (2B parámetros), lo que implica requisitos de almacenamiento y memoria adicionales.
- No se dispone de información sobre cuantizaciones específicas del adaptador ni sobre su comportamiento con diferentes tasas de muestreo o formatos de audio.

## Enlaces

- Modelo en Hugging Face: [01Yassine/cohere-transcribe-darija-decoder-lora](https://huggingface.co/01Yassine/cohere-transcribe-darija-decoder-lora)
- Dataset de entrenamiento: [01Yassine/darija-asr-3h](https://huggingface.co/datasets/01Yassine/darija-asr-3h)
- Benchmark de evaluación: [atlasia/darija-asr-benchmark](https://huggingface.co/datasets/atlasia/darija-asr-benchmark)
- Modelo base: [CohereLabs/cohere-transcribe-arabic-07-2026](https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026)
- Variante híbrida recomendada: [01Yassine/cohere-transcribe-darija](https://huggingface.co/01Yassine/cohere-transcribe-darija)
- Variante full LoRA: [01Yassine/cohere-transcribe-darija-full-lora](https://huggingface.co/01Yassine/cohere-transcribe-darija-full-lora)
- Variante encoder LoRA: [01Yassine/cohere-transcribe-darija-encoder-lora](https://huggingface.co/01Yassine/cohere-transcribe-darija-encoder-lora)
- Página de Cohere Transcribe: [https://cohere.com/transcribe](https://cohere.com/transcribe)
- Documentación de Cohere Transcribe: [https://docs.cohere.com/docs/transcribe](https://docs.cohere.com/docs/transcribe)
- Anuncio del blog: [https://cohere.com/blog/transcribe](https://cohere.com/blog/transcribe)
