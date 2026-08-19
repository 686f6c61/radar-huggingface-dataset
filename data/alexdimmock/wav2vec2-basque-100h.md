# alexdimmock/wav2vec2-basque-100h

## Resumen

El modelo `alexdimmock/wav2vec2-basque-100h` es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec 2.0, desarrollado por el usuario alexdimmock y publicado en Hugging Face. Está diseñado para transcribir audio en euskera, presumiblemente fine-tuneado sobre el modelo base `facebook/wav2vec2-base-100h` con 100 horas de datos de habla en euskera, siguiendo el patrón del modelo original de Facebook que se fine-tuneó con 100 horas de LibriSpeech en inglés.

El modelo cuenta con 315.472.545 parámetros (aproximadamente 0,3B) y se distribuye en formato safetensors con un tamaño de repositorio de 26,3 GB. Aunque la ficha de Hugging Face no especifica la licencia ni los idiomas soportados, por su nombre y arquitectura se infiere que está orientado al euskera. Su relevancia radica en ser un recurso para ASR en una lengua minoritaria con pocos modelos disponibles públicamente, aunque su escasa documentación y ausencia de métricas limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (base) con capa lineal adicional para ASR |
| Parametros totales | 315.472.545 (0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de wav2vec2, tipicamente ventanas de audio de 10-30 segundos) |
| Tipos de cuantizacion | no disponible (solo se observan pesos F32 en safetensors) |
| Idiomas soportados | euskera (inferido por el nombre, no confirmado en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0, un transformer encoder preentrenado de forma autosupervisada sobre audio sin etiquetar y posteriormente fine-tuneado para ASR. En el caso del modelo base de Facebook, el preentrenamiento se realizó sobre 960 horas de audio de LibriSpeech y el fine-tuning sobre 100 horas de audio transcrito. Para esta variante vasca, se asume un proceso similar: fine-tuning del modelo base preentrenado sobre 100 horas de habla en euskera, aunque no se dispone de detalles sobre el dataset exacto, el número de pasos de entrenamiento ni si se aplicaron técnicas como aumentación de datos o regularización.

La arquitectura concreta incluye un encoder convolucional que procesa la señal de audio a 16 kHz, seguido de un transformer con atención de 12 capas y 8 cabezas (configuración base). El modelo añade un módulo lineal sobre las representaciones del transformer para producir las probabilidades sobre el vocabulario de salida. No se han documentado innovaciones técnicas adicionales en esta variante.

## Capacidades

- Reconocimiento automático del habla (ASR) para euskera, transcribiendo audio a texto.
- Procesamiento de audio muestreado a 16 kHz, monocanal, como entrada.
- Salida de texto en el alfabeto o vocabulario utilizado durante el fine-tuning (no especificado).
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones más allá de la transcripción.
- No se ha confirmado soporte multilingüe; el modelo está especializado en euskera según su nombre.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en euskera: el modelo puede convertir grabaciones de audio en texto para archivos históricos, periodismo o investigación sociolingüística, aprovechando su fine-tuning específico en esta lengua.
- Generación de subtítulos para vídeos en euskera: integrado en pipelines de procesamiento de vídeo, permite crear subtítulos automáticos para contenido audiovisual en euskera, reduciendo el coste de subtitulado manual.
- Asistentes de voz para servicios públicos en euskera: puede emplearse en sistemas de atención al ciudadano donde los usuarios hablan en euskera, transcribiendo sus peticiones para su posterior procesamiento por un chatbot o sistema de tickets.
- Archivado y búsqueda de contenido sonoro en euskera: al transcribir audios de reuniones, conferencias o programas de radio, se facilita la indexación y búsqueda por texto en repositorios digitales.
- Aplicaciones educativas para aprendizaje del euskera: el modelo puede servir para evaluar la pronunciación del alumnado transcribiendo sus lecturas en voz alta y comparándolas con el texto esperado.
- Investigación en procesamiento del habla para lenguas minoritarias: sirve como punto de partida para experimentos de fine-tuning con más datos o para comparar arquitecturas en euskera, aunque su falta de documentación dificulta su reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para este modelo en euskera, ni comparaciones con otros sistemas ASR para esta lengua.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315M parámetros en F32, el modelo ocupa aproximadamente 1,26 GB en memoria (315M × 4 bytes). Sin embargo, el repositorio pesa 26,3 GB, lo que sugiere que puede incluir múltiples archivos o pesos adicionales; para inferencia básica se necesitaría al menos 2-4 GB de VRAM dependiendo de la longitud del audio procesado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. Para procesamiento por lotes o audios largos, se recomienda 8 GB o más (RTX 3070, RTX 4060, etc.).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4060 de 8 GB pueden ejecutar el modelo sin problemas.
- Opciones de despliegue: al ser un modelo wav2vec2, puede ejecutarse con la librería `transformers` de Hugging Face, `torchaudio` (pipelines WAV2VEC2_ASR_BASE_100H), o mediante servidores de inferencia como Hugging Face Inference Endpoints. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje, no a ASR.
- Latencia y throughput: no disponibles. Dependerá de la GPU y de la longitud del audio; en una GPU moderna, un audio de 10 segundos podría procesarse en menos de 1 segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alexdimmock/wav2vec2-basque-100h | 315M | no disponible | no disponible | Hugging Face |
| facebook/wav2vec2-base-100h | 95M (base original) | 10-30 s de audio | Apache 2.0 | Hugging Face |
| alexdimmock/wav2vec2-basque-50h | 315M (presumiblemente) | no disponible | no disponible | Hugging Face |

No se dispone de comparativas de rendimiento (WER) entre estos modelos. El modelo base de Facebook está pensado para inglés, mientras que las variantes de alexdimmock están orientadas al euskera, por lo que no son directamente comparables en tareas. No se han encontrado otros modelos ASR en euskera con los que comparar en la información disponible.

## Limitaciones y advertencias

- No se ha publicado ninguna documentación técnica, métricas de rendimiento ni detalles del dataset de entrenamiento, lo que impide evaluar su calidad y limita su uso en entornos profesionales.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni la redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo está especializado en euskera, pero no se ha confirmado el vocabulario ni la variedad dialectal; puede tener un rendimiento deficiente con acentos o registros no representados en los datos de entrenamiento.
- Al ser un modelo de 0,3B parámetros, su capacidad de generalización es limitada en comparación con modelos ASR más grandes; puede fallar en entornos ruidosos o con habla solapada.
- Riesgo de alucinación: como todo sistema ASR, puede producir transcripciones incorrectas o inventar palabras cuando el audio es ambiguo o de baja calidad.
- El repositorio pesa 26,3 GB, lo que sugiere que puede contener archivos redundantes o pesos en múltiples formatos; esto puede complicar la descarga y el despliegue en entornos con almacenamiento limitado.
- No se ha confirmado que el modelo funcione con audio muestreado a frecuencias distintas de 16 kHz; se debe re-muestrear el audio antes de la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexdimmock/wav2vec2-basque-100h
- Modelo relacionado (50h): https://huggingface.co/alexdimmock/wav2vec2-basque-50h
- Modelo base de Facebook: https://huggingface.co/facebook/wav2vec2-base-100h
- Documentación de torchaudio para WAV2VEC2_ASR_BASE_100H: https://docs.pytorch.org/audio/2.11.0/generated/torchaudio.pipelines.WAV2VEC2_ASR_BASE_100H.html
- Repositorio fairseq con ejemplos de wav2vec: https://github.com/facebookresearch/fairseq/tree/main/examples/wav2vec
