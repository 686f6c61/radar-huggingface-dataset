# Msaied2026/arabic-asr

## Resumen

Cohere Transcribe Arabic (identificador interno `cohere-transcribe-arabic-07-2026`) es un modelo de reconocimiento automático del habla (ASR) de 2.065.804.048 parámetros publicado por Cohere y Cohere Labs, distribuido en Hugging Face bajo el repositorio `Msaied2026/arabic-asr`. Está especializado en transcripción de árabe estándar, dialectos árabes, inglés y habla con alternancia de código árabe-inglés (*code-switching*), un escenario especialmente frecuente en medios, redes sociales y atención al cliente en la región MENA.

El modelo parte de la arquitectura Cohere Transcribe (`CohereLabs/cohere-transcribe-03-2026`) y se presenta como un ajuste fino sobre dicha base. Utiliza un codificador Conformer de gran tamaño que extrae representaciones acústicas a partir de espectrogramas log-Mel, seguido de un decodificador Transformer ligero que genera los tokens de texto. La entrada es una forma de onda de audio que se remuestrea automáticamente a 16 kHz y se convierte a mono promediando canales si es necesario.

Su relevancia actual radica en que cubre una laguna habitual en los sistemas ASR comerciales: el rendimiento sobre dialectos árabes y sobre habla mezclada árabe-inglés. Al publicarse con licencia Apache 2.0 y soporte nativo en Transformers, puede desplegarse en infraestructura propia sin restricciones de uso comercial, algo poco común en modelos ASR de esta calidad para árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder (codificador Conformer + decodificador Transformer ligero) |
| Parametros totales | 2.065.804.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentación automática por `max_audio_clip_s` del extractor de características) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | Árabe (incluye dialectos), inglés, alternancia árabe-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de tipo Conformer. El codificador, de mayor tamaño, procesa espectrogramas log-Mel y extrae representaciones acústicas con atención y convoluciones combinadas; el decodificador es un Transformer ligero que genera la secuencia de tokens de texto. El objetivo de entrenamiento declarado es entropía cruzada supervisada sobre los tokens de salida, es decir, un entrenamiento supervisado clásico de ASR sin que la model card mencione etapas de RLHF, DPO ni optimización por preferencias.

El preprocesamiento es automático: el audio se remuestrea a 16 kHz si llega con otra frecuencia y las entradas multicanal se promedian a mono. Para audio largo, el extractor de características trocea la señal en función de `max_audio_clip_s` y el procesador reensambla las transcripciones parciales usando el índice `audio_chunk_index`, lo que permite transcribir grabaciones de varios minutos sin gestión manual de ventanas. No se especifican en la información disponible el número de horas de entrenamiento, la composición del corpus ni los detalles del ajuste fino respecto al modelo base.

## Capacidades

- Transcripción de voz a texto en árabe estándar moderno (MSA).
- Reconocimiento de dialectos árabes, según declara el autor en la model card.
- Transcripción en inglés mediante el parámetro `language="en"`.
- Manejo de habla con alternancia de código árabe-inglés.
- Transcripción de audio largo con troceado y reensamblado automático de segmentos.
- Preprocesamiento integrado de audio: remuestreo a 16 kHz y conversión de estéreo a mono.
- Selección explícita de idioma en el procesador (`language="ar"` / `language="en"`).
- Medición de rendimiento en tiempo real mediante RTFx en los ejemplos del autor.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Subtitulado y transcripción de medios audiovisuales en árabe: el modelo acepta audio largo y lo trocea automáticamente, por lo que puede alimentar un pipeline de generación de subtítulos para informativos, entrevistas o pódcasts con varias horas de material.
- Atención al cliente en centros de contacto del mundo árabe: permite transcribir llamadas grabadas para análisis de calidad, búsqueda semántica sobre conversaciones y generación de resúmenes posteriores, cubriendo tanto árabe estándar como dialectos.
- Documentación clínica y legal dictada: la transcripción de notas de voz en árabe y en inglés facilita la digitalización de registros en entornos bilingües donde el personal alterna idiomas dentro de la misma frase.
- Moderación y análisis de contenido en redes sociales: el soporte de dialectos y de *code-switching* permite procesar vídeos y audios de usuarios que no hablan en árabe formal, un caso frecuente en plataformas de la región.
- Accesibilidad y subtitulado en directo diferido: integrado con Transformers y con servidores compatibles con la API de endpoints, puede desplegarse como servicio interno que transcribe reuniones y clases con mezcla de árabe e inglés.
- Generación de corpus y anotación lingüística: investigadores que necesitan transcripciones iniciales de grabaciones dialectales pueden usar el modelo como paso de preanotación y corregir después manualmente, reduciendo el coste de etiquetado.
- Integración en asistentes de voz locales: al ser Apache 2.0 y ejecutable con Transformers, puede formar parte de un stack de voz autoalojado en el que la transcripción no sale de la infraestructura de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32/bf16, ~2,07 mil millones de parámetros): aproximadamente 8-9 GB solo para pesos, más memoria para activaciones y buffers de audio; en la práctica, entre 10 y 16 GB según la longitud del audio y el tamaño de lote.
- Cuantización a 8 bits: alrededor de 2-3 GB de pesos, con requisitos totales en torno a 5-8 GB. A 4 bits, aproximadamente 1,5-2 GB de pesos, aunque el autor no documenta configuraciones de cuantización ni su impacto en la precisión.
- GPU recomendadas para producción: A100 (40/80 GB) o H100 para lotes grandes y audio largo; L40S o A10G para servicio de latencia moderada.
- GPU de consumo: el modelo debería caber en tarjetas con 12-16 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en 8 GB es probable que requiera cuantización o procesamiento por segmentos.
- Despliegue: soporte nativo en `transformers>=5.4.0` con `CohereAsrForConditionalGeneration` y `AutoProcessor`; el autor menciona integración con vLLM para inferencia en línea. No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de RTFx ni de latencia por segundo de audio; los ejemplos del autor calculan RTFx en tiempo de ejecución, pero no aportan valores de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| Cohere Transcribe Arabic | ~2,07 B | Árabe (con dialectos) e inglés | Conformer encoder-decoder | Apache 2.0 | Troceado automático, longitud no especificada |
| CohereLabs/cohere-transcribe-03-2026 (base) | no disponible en la información | no disponible en la información | Conformer encoder-decoder | no disponible en la información | no disponible |
| Whisper large-v3 (OpenAI) | ~1,55 B | Multilingüe (~99 idiomas) | Transformer encoder-decoder | MIT | Ventanas de 30 s |
| MMS / wav2vec 2.0 para árabe (Meta) | ~0,3-1 B según variante | Multilingüe / específico por idioma | CTC sobre wav2vec 2.0 | MIT / CC-BY-NC según variante | Segmentos cortos |

La comparación con Whisper large-v3 es la más directa por tamaño y despliegue, aunque Whisper no está específicamente optimizado para dialectos árabes. Los datos de rendimiento comparado no están disponibles en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de WER.

## Limitaciones y advertencias

- No se han publicado métricas de error (WER/CER) ni evaluaciones por dialecto; el rendimiento real sobre dialectos concretos (egipcio, levantino, golfo, magrebí) es desconocido.
- El modelo está entrenado para árabe e inglés; no debe esperarse calidad en otros idiomas aunque el tokenizador los acepte.
- Riesgo de alucinación en pasajes de audio con ruido, música o silencios largos, comportamiento habitual en decodificadores autoregresivos de ASR.
- La model card no documenta sesgos por género, origen regional o registro lingüístico; en un modelo dialectal esto puede traducirse en peor transcripción de variedades infrarepresentadas en el corpus de entrenamiento.
- El repositorio pertenece a un usuario (`Msaied2026`) distinto de la organización Cohere Labs, aunque el contenido y la licencia remiten al modelo de Cohere; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- El tamaño del repositorio (8,8 GB) es superior al de los pesos en bf16 (~4,1 GB), lo que sugiere la presencia de artefactos adicionales o duplicados; revisar qué ficheros se descargan.
- No hay información sobre el corpus de ajuste fino, por lo que no puede evaluarse el riesgo de sobreajuste a dominios concretos ni posibles problemas de licencia de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- La longitud máxima de audio por segmento (`max_audio_clip_s`) no se especifica; en grabaciones muy largas el reensamblado por `audio_chunk_index` puede introducir errores en las fronteras entre segmentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Msaied2026/arabic-asr
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Demo del modelo: https://huggingface.co/spaces/CohereLabs/cohere-transcribe-arabic-07-2026
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
