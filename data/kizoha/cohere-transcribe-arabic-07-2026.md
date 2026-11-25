# kizoha/cohere-transcribe-arabic-07-2026

## Resumen

Cohere Transcribe Arabic es un modelo de reconocimiento automático del habla (ASR) de 2.065 millones de parámetros desarrollado por Cohere y Cohere Labs, especializado en la transcripción de árabe, dialectos árabes, inglés y habla con alternancia de código árabe-inglés. Emplea una arquitectura conformer encoder-decoder: un encoder Conformer de gran tamaño extrae representaciones acústicas de la señal de audio y un decoder Transformer ligero genera los tokens de texto. El objetivo de entrenamiento es entropía cruzada supervisada sobre los tokens de salida.

El repositorio `kizoha/cohere-transcribe-arabic-07-2026` es un espejo no modificado del modelo original `CohereLabs/cohere-transcribe-arabic-07-2026` (revisión `c3e911b42149bf7a1e53d5cef9878aee87515a23`), redistribuido bajo licencia Apache 2.0 para que el instalador de clipsplit pueda descargarlo sin token de Hugging Face. Los ficheros del modelo son idénticos byte a byte al original; solo se han añadido esta nota y el fichero `LICENSE`.

Su relevancia radica en ser un modelo ASR abierto y de tamaño contenido (2B parámetros) con soporte nativo en Transformers y vLLM, orientado específicamente a un idioma con escasa cobertura en modelos ASR abiertos de calidad, como es el árabe y sus variantes dialectales. La entrada es una forma de onda de audio que se convierte en espectrograma log-Mel, con remuestreo automático a 16 kHz y promediado de canales para entradas estéreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder (encoder Conformer grande + decoder Transformer ligero) |
| Parametros totales | 2.065.804.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentación automática por `max_audio_clip_s` del extractor de características) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones no documentadas en la información disponible) |
| Idiomas soportados | Árabe (incluidos dialectos árabes), inglés y habla con alternancia de código árabe-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura conformer encoder-decoder. La entrada es una forma de onda de audio que se transforma en un espectrograma log-Mel; durante el preprocesado el audio se remuestrea automáticamente a 16 kHz si es necesario y las entradas multicanal (estéreo) se promedian para obtener una señal mono. Un encoder Conformer de gran tamaño extrae las representaciones acústicas y un decoder Transformer ligero genera los tokens de texto. El objetivo de entrenamiento es entropía cruzada supervisada sobre los tokens de salida.

El modelo está optimizado para árabe, dialectos árabes, inglés y habla con alternancia de código árabe-inglés. Está construido sobre la arquitectura de Cohere Transcribe (`CohereLabs/cohere-transcribe-03-2026`), del que es un ajuste fino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El procesador gestiona audio de larga duración dividiéndolo automáticamente en fragmentos cuando supera `max_audio_clip_s` y reensambla las transcripciones por fragmento mediante el índice `audio_chunk_index`.

## Capacidades

- Transcripción de voz a texto (ASR) para árabe estándar y dialectos árabes.
- Transcripción de inglés.
- Reconocimiento de habla con alternancia de código árabe-inglés.
- Procesamiento de audio de larga duración mediante segmentación automática y reensamblado de transcripciones.
- Preprocesado automático de audio: remuestreo a 16 kHz y conversión de estéreo a mono.
- Selección de idioma en el procesador mediante el parámetro `language` (por ejemplo, `"ar"`).
- Soporte nativo en Transformers (`CohereAsrForConditionalGeneration`, `AutoProcessor`).
- Integración con vLLM para inferencia en línea.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo procesa audio largo dividiéndolo en fragmentos y reensamblando la transcripción, lo que permite transcribir conversaciones de decenas de minutos sin intervención manual.
- Subtitulado de contenido audiovisual en árabe e inglés: la capacidad de alternancia de código árabe-inglés resulta adecuada para vídeos donde los hablantes mezclan ambos idiomas.
- Atención al cliente en centros de contacto del mundo árabe: transcripción de llamadas grabadas para análisis de calidad, búsqueda sobre el texto y generación de resúmenes posteriores.
- Documentación clínica o legal dictada en árabe: conversión de notas de voz a texto para su revisión y archivo, con la ventaja de una licencia Apache 2.0 que permite despliegue interno sin restricciones de uso comercial.
- Investigación lingüística sobre dialectos árabes: el modelo está optimizado para variantes dialectales, lo que facilita la creación de corpus transcritos a partir de grabaciones de campo.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en árabe o inglés, desplegable en infraestructura propia gracias al formato safetensors y al soporte de Transformers y vLLM.
- Pipeline de datos para entrenamiento de otros modelos: transcripción masiva de audio en árabe para construir datasets de texto, con medición de rendimiento mediante la métrica RTFx que el propio modelo documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.065 millones de parámetros, en precisión de 16 bits (fp16/bf16) los pesos ocupan aproximadamente 4,1 GB, que coincide con el tamaño del repositorio. En fp32 serían aproximadamente 8,3 GB. Las cuantizaciones a 8 bits o 4 bits no están documentadas en la información disponible.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GPU con al menos 8 GB de VRAM en fp16 debería poder alojar los pesos, aunque el consumo real durante la inferencia depende de la longitud del audio y del tamaño de lote.
- ¿Cabe en GPU de consumo? Por tamaño de pesos, sí es probable que quepa en tarjetas de consumo con 8 GB o más en fp16 (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090), aunque no se confirma en la información disponible.
- Opciones de despliegue: Transformers (recomendado para inferencia offline, requiere `transformers>=5.4.0`, `torch`, `soundfile`, `librosa`, `sentencepiece`, `protobuf` y `accelerate`) y vLLM para inferencia en línea.
- Latencia y throughput: no se proporcionan cifras concretas. El modelo documenta el cálculo de RTFx (factor de tiempo real) en el ejemplo de transcripción larga, pero no publica valores de referencia.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos ASR comparables (como Whisper o MMS) que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El repositorio es un espejo no modificado; las actualizaciones y el soporte deben consultarse en el repositorio original `CohereLabs/cohere-transcribe-arabic-07-2026`.
- Solo cubre árabe, dialectos árabes, inglés y alternancia de código árabe-inglés; no se documentan otros idiomas.
- No se documentan en la información disponible los sesgos conocidos del modelo, su tasa de alucinación ni el comportamiento ante audio con ruido, acentos no representados o solapamiento de hablantes.
- La longitud máxima de contexto no está especificada; el procesamiento de audio largo depende de la segmentación automática del extractor de características.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el fichero `LICENSE` del repositorio y la model card original para confirmar condiciones.
- No se documentan cuantizaciones oficiales, lo que limita las opciones de despliegue en hardware con VRAM reducida sin recurrir a conversiones propias.
- Al ser un modelo de 2B parámetros, su huella de memoria y velocidad en producción deben validarse empíricamente antes de desplegarlo.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/kizoha/cohere-transcribe-arabic-07-2026
- Repositorio original: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Modelo base de la arquitectura: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/CohereLabs/cohere-transcribe-arabic-07-2026
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
