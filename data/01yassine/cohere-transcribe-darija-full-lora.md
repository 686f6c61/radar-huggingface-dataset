# 01Yassine/cohere-transcribe-darija-full-lora

## Resumen

El modelo `01Yassine/cohere-transcribe-darija-full-lora` es un adaptador LoRA completo (encoder y decoder) diseñado para mejorar la transcripción automática de voz en darija, el árabe marroquí, sobre el modelo base `CohereLabs/cohere-transcribe-arabic-07-2026`. Lo desarrolla el usuario 01Yassine y se publica en Hugging Face con licencia "other". El adaptador se entrena con un conjunto de datos de solo 3 horas de audio de YouTube, lo que lo convierte en una solución ligera y de bajo coste para un dialecto escasamente cubierto por los sistemas ASR comerciales.

La relevancia de este modelo radica en que la darija es una variedad oral con diferencias significativas respecto al árabe estándar, y la mayoría de los sistemas ASR existentes fallan en su transcripción. Según la model card, el adaptador reduce el WER del modelo base del 49,1 % al 40,3 % y el CER del 20,2 % al 16,5 % en un benchmark humano de 114 clips. El autor también publica variantes alternativas (solo encoder, solo decoder y una versión híbrida que alcanza el mejor CER de 14,4), siendo esta versión "full LoRA" la intermedia en rendimiento.

Al tratarse de un adaptador PEFT, el modelo no es una arquitectura completa, sino un conjunto de pesos adicionales que se cargan sobre el modelo base. Esto permite un despliegue eficiente y un ajuste fino económico, aunque el tamaño total del sistema depende del modelo base, cuyas especificaciones completas no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre CohereLabs/cohere-transcribe-arabic-07-2026 (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR, no procesa texto como contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ar (árabe), ary (árabe marroquí / darija) |
| Licencia | other (revisar términos específicos en la página del modelo) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se implementa como un LoRA aplicado tanto al encoder como al decoder del modelo base Cohere Transcribe Arabic. Según la model card, no se utiliza adaptador de convolución (conv adapter). El entrenamiento se realizó sobre el dataset `01Yassine/darija-asr-3h`, compuesto por 3 horas de audio de YouTube en darija. No se especifican hiperparámetros concretos (rango, alpha, tasa de aprendizaje, número de épocas), ni detalles sobre el proceso de entrenamiento (si se usó alguna técnica de regularización o data augmentation).

La evaluación se realiza sobre el benchmark `atlasia/darija-asr-benchmark`, que contiene 114 clips transcritos por humanos. Los resultados muestran una mejora sustancial frente al modelo base sin adaptador, aunque el autor indica que la versión híbrida (combinación de adaptadores) obtiene un CER aún menor (14,4 frente a 16,5 de esta versión).

## Capacidades

- Transcripción automática de voz en darija (árabe marroquí) a texto.
- Reconocimiento de voz para audio en árabe estándar (heredado del modelo base, aunque el adaptador está especializado en darija).
- Soporte de entrada de audio en formato de archivo (el script de inferencia acepta un clip de audio y devuelve el texto transcrito).
- No se documentan capacidades adicionales como traducción, diarización de hablantes, subtitulado automático o reconocimiento de emociones. El modelo se limita a la tarea ASR.

## Casos de uso

- Transcripción de entrevistas y testimonios en darija: permite convertir grabaciones de audio en texto para su análisis posterior, especialmente útil en investigación sociológica o periodismo local.
- Subtitulación de vídeos en darija: los creadores de contenido pueden generar subtítulos automáticos para vídeos en este dialecto, facilitando el acceso a audiencias más amplias.
- Asistentes de voz para aplicaciones locales: integración en chatbots o asistentes que requieran entender comandos de voz en darija, por ejemplo en servicios de atención al cliente de empresas marroquíes.
- Archivado y búsqueda de audio: las organizaciones pueden indexar grabaciones de reuniones, llamadas o radio en darija para hacerlas buscables mediante texto.
- Investigación lingüística: los estudiosos del dialecto pueden transcribir corpus orales de forma automática, acelerando el análisis fonético o morfológico.
- Análisis de llamadas de soporte técnico: en centros de contacto que operan en Marruecos, el modelo puede transcribir conversaciones para evaluar la calidad del servicio o extraer métricas.

## Benchmarks y rendimiento

El autor proporciona resultados en el benchmark `atlasia/darija-asr-benchmark` (114 clips, transcripciones humanas). La tabla siguiente resume las métricas del modelo base y del adaptador.

| Modelo | CER (%) | WER (%) |
| --- | ---: | ---: |
| Base (Cohere Transcribe Arabic sin adaptador) | 20,2 | 49,1 |
| **Este adaptador (full LoRA)** | **16,5** | **40,3** |

No se publican resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de reconocimiento de voz, no de lenguaje general. Tampoco se ofrecen comparaciones con otros sistemas ASR comerciales o de código abierto en el mismo benchmark.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero el modelo base Cohere Transcribe Arabic no tiene especificaciones de tamaño publicadas en la información disponible.
- Se requiere una GPU con suficiente VRAM para cargar el modelo base completo más el adaptador. Dado que Cohere Transcribe es un modelo de reconocimiento de voz de tamaño medio (no se confirma el número exacto de parámetros), es probable que quepa en GPUs de consumo como una RTX 3090 o RTX 4090 (24 GB), pero no se puede confirmar sin datos del modelo base.
- Para inferencia en producción se puede usar el script Python incluido en el repositorio (`infer.py`), que carga el adaptador desde Hugging Face Hub.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama, ya que el formato PEFT no es compatible directamente con esos motores. Se recomienda usar la librería `peft` de Hugging Face junto con `transformers`.
- La latencia y el throughput no se especifican. Dado el pequeño tamaño del dataset de entrenamiento, se espera que la inferencia sea rápida, pero depende de la arquitectura del modelo base.

## Comparativa con modelos similares

El autor publica varias versiones del mismo adaptador sobre el mismo modelo base. La siguiente tabla compara las variantes según el CER en el benchmark AtlasIA.

| Variante | CER (%) | WER (%) | Descripción |
| --- | ---: | ---: | --- |
| Hybrid | 14,4 | no disponible | Combinación de adaptadores (recomendada por el autor) |
| **Full LoRA (este modelo)** | **16,5** | **40,3** | LoRA en encoder y decoder |
| Encoder LoRA | 17,4 | no disponible | LoRA solo en el encoder |
| Decoder LoRA | 20,2 | no disponible | LoRA solo en el decoder |
| Base sin adaptador | 20,2 | 49,1 | Modelo original |

No se dispone de comparaciones con otros modelos ASR para darija, como Whisper o MMS de Meta, ni con soluciones comerciales. El autor no proporciona datos al respecto.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 3 horas de audio de YouTube, lo que puede limitar la generalización a otros acentos, registros o condiciones de grabación distintas.
- El modelo está especializado en darija marroquí; su rendimiento en árabe estándar u otros dialectos no está evaluado y probablemente sea inferior al del modelo base.
- La licencia "other" no especifica los términos exactos de uso; antes de un despliegue comercial es necesario revisar la página del modelo y la licencia del modelo base CohereLabs.
- No se proporcionan análisis de sesgos ni de comportamiento en habla con ruido, múltiples hablantes o acentos regionales dentro de Marruecos.
- Al ser un adaptador PEFT, requiere el modelo base completo para funcionar, lo que incrementa los requisitos de almacenamiento y memoria en comparación con un modelo autocontenido.
- El benchmark de evaluación es pequeño (114 clips) y proviene de un único dataset, por lo que los resultados pueden no ser representativos en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/01Yassine/cohere-transcribe-darija-full-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/01Yassine/darija-asr-3h
- Benchmark de evaluación: https://huggingface.co/datasets/atlasia/darija-asr-benchmark
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Variante híbrida (mejor CER): https://huggingface.co/01Yassine/cohere-transcribe-darija
- Variante encoder LoRA: https://huggingface.co/01Yassine/cohere-transcribe-darija-encoder-lora
- Variante decoder LoRA: https://huggingface.co/01Yassine/cohere-transcribe-darija-decoder-lora
- Página oficial de Cohere Transcribe: https://cohere.com/transcribe
- Documentación de Cohere Transcribe: https://docs.cohere.com/docs/transcribe
- Repositorio de inferencia en lote (tercero): https://github.com/AliOsm/cohere-transcribe
