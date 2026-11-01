# hasan0v/whisper-turbo-az-ct2

## Resumen

Whisper Turbo AZ (CT2) es la exportación a CTranslate2 en fp16 del modelo `hasan0v/whisper-turbo-az`, un ajuste fino en azerí de Whisper large-v3-turbo de OpenAI. Lo desarrolla Ali Hasanov (usuario `hasan0v`) y resuelve un problema concreto: la baja calidad del reconocimiento automático del habla (ASR) en azerí con los modelos Whisper genéricos. El resultado es un modelo listo para usarse con `faster-whisper`, WhisperX y otros runtimes basados en CTranslate2, sin necesidad de conversión adicional.

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con aproximadamente 809 millones de parámetros, de los cuales solo 4 capas del decoder están activas (frente a las 32 del large-v3 completo), lo que reduce el coste de inferencia. El contexto de audio es de 30 segundos por ventana, procesado como espectrograma mel de 128 canales. El modelo está especializado en un único idioma, el azerí, y se distribuye con licencia Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, cubre una lengua de bajos recursos con un WER del 10,90 % en FLEURS-az, mejorando en más de dos puntos porcentuales la alternativa pública comparable; por otro, al estar exportado a CTranslate2 en fp16, ofrece un factor de tiempo real de 0,035 (unas 28 veces más rápido que tiempo real) en una GPU de consumo como la RTX 4070, lo que lo hace viable para despliegues de producción sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | aproximadamente 809 M (heredados de Whisper large-v3-turbo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | fp16 (exportación principal); int8 disponible para CPU vía CTranslate2 |
| Idiomas soportados | azerí (az) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (model.bin y ficheros asociados); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Whisper large-v3-turbo, la variante destilada del decoder de Whisper large-v3. Mantiene el encoder completo de large-v3 (32 capas) pero reduce el decoder a 4 capas, lo que rebaja el coste computacional de la generación autoregresiva manteniendo buena parte de la calidad del modelo original. La entrada es un espectrograma mel logarítmico de 128 canales calculado sobre ventanas de 30 segundos a 16 kHz.

Los detalles concretos del entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no están documentados en la información disponible; la model card remite a la ficha del modelo base `hasan0v/whisper-turbo-az` para el método, hiperparámetros y datos de entrenamiento. Lo que sí se documenta es que el modelo fue entrenado con contexto de texto previo (`condition_on_previous_text`), de ahí que la configuración recomendada de inferencia active esa opción. La exportación a CTranslate2 en fp16 preserva los pesos del ajuste fino y está pensada para inferencia de baja latencia con `faster-whisper`, que además soporta `BatchedInferencePipeline` para transcripción por lotes de audio largo.

## Capacidades

- Reconocimiento automático del habla en azerí, con salida de texto y marcas temporales por segmento.
- Transcripción de audio de hasta 30 segundos por ventana, con encadenamiento de ventanas para ficheros largos.
- Detección de actividad de voz (VAD) integrada en el pipeline de `faster-whisper`, útil para filtrar silencios y ruido.
- Modo de contexto de texto previo (`condition_on_previous_text`) para mejorar la coherencia en transcripciones largas.
- Inferencia por lotes mediante `BatchedInferencePipeline`, pensada para transcribir conferencias, clases o podcasts de forma eficiente.
- Ejecución en GPU (fp16) y en CPU (int8) con el mismo artefacto CTranslate2.
- No soporta traducción a otros idiomas ni reconocimiento multilingüe: está especializado exclusivamente en azerí.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y actas en azerí: el modelo convierte grabaciones de audio en texto con marcas temporales, y el encadenamiento de ventanas de 30 segundos permite procesar reuniones de una hora o más sin segmentación manual.
- Subtitulado automático de vídeo: la salida por segmentos con timestamps encaja directamente en pipelines de generación de subtítulos (SRT/VTT) para contenido en azerí, con un WER del 10,90 % en FLEURS que reduce la corrección manual necesaria.
- Atención al cliente y centros de llamadas: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo sobre conversaciones y generación de resúmenes posteriores, aprovechando el factor de tiempo real de 0,035 en GPU de consumo.
- Archivado y digitalización de contenido audiovisual: procesamiento por lotes con `BatchedInferencePipeline` de bibliotecas de audio o vídeo en azerí, con VAD para descartar silencios y reducir el coste computacional.
- Accesibilidad: generación de transcripciones en directo o diferidas para personas con discapacidad auditiva en entornos donde se habla azerí, desplegable en una sola GPU de consumo.
- Investigación lingüística y corpus: creación de corpus textuales a partir de grabaciones orales en azerí para estudios fonéticos, léxicos o de entrenamiento de otros modelos, con la ventaja de una licencia Apache 2.0 permisiva.
- Integración en aplicaciones de notas de voz: transcripción local en portátiles con GPU (por ejemplo, RTX 4070) o incluso en CPU con int8, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), medidos sobre esta exportación CTranslate2 en fp16 con `faster-whisper`, beam 5, en el conjunto de test FLEURS-az (921 clips):

| Modelo | WER ↓ | CER ↓ |
|---|---:|---:|
| LocalDoc/azerbaijani-whisper-turbo | 13,11 % | 3,39 % |
| Whisper Turbo AZ v2 (este modelo) | 10,90 % | 2,86 % |

Rendimiento de inferencia declarado: factor de tiempo real de 0,035 en una RTX 4070 (aproximadamente 28 veces más rápido que tiempo real). No se han publicado otros resultados de benchmarks (por ejemplo, MMLU, HumanEval o GSM8K) en la información disponible, algo esperable al tratarse de un modelo exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2 GB, coherente con un repositorio de 1,6 GB y un modelo de unos 809 M de parámetros.
- GPU recomendadas: RTX 4070 (referencia del autor, 28× tiempo real), RTX 4090, A100 y H100 para despliegues de alto throughput; cualquier GPU con al menos 2-3 GB de VRAM libre puede ejecutarlo en fp16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en iGPU y CPU usando int8.
- Opciones de despliegue: `faster-whisper` (recomendado, es el runtime nativo del formato), WhisperX y cualquier runtime compatible con CTranslate2. No es directamente compatible con llama.cpp, Ollama o TGI, que no soportan este formato.
- Latencia y throughput: factor de tiempo real de 0,035 en RTX 4070 con fp16; el modo `BatchedInferencePipeline` con `batch_size=16` mejora el throughput en transcripción de ficheros largos. No se dispone de cifras de latencia por segmento ni de throughput en CPU en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER FLEURS-az | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper Turbo AZ (este modelo) | aproximadamente 809 M | 30 s por ventana | 10,90 % | Apache 2.0 | CTranslate2 fp16 |
| LocalDoc/azerbaijani-whisper-turbo | no disponible | 30 s por ventana | 13,11 % | no disponible | no disponible |
| Whisper large-v3-turbo (OpenAI) | aproximadamente 809 M | 30 s por ventana | no disponible para azerí | MIT | safetensors, CTranslate2, GGUF |
| Whisper large-v3 (OpenAI) | aproximadamente 1,55 B | 30 s por ventana | no disponible para azerí | MIT | safetensors, CTranslate2, GGUF |

La comparación directa con el Whisper large-v3-turbo original en azerí no está disponible en la información proporcionada; el autor solo publica la comparación con `LocalDoc/azerbaijani-whisper-turbo`, sobre el que mejora 2,21 puntos de WER y 0,53 puntos de CER. Frente a los modelos de OpenAI, la ventaja de este ajuste es la especialización lingüística y la licencia Apache 2.0; la desventaja es que solo cubre azerí y no ofrece la versatilidad multilingüe de los originales.

## Limitaciones y advertencias

- Especialización monolingüe: solo reconoce azerí; no traduce ni transcribe otros idiomas, y forzar `language` distinto de `az` probablemente degrade la salida.
- Los resultados de WER y CER son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación típico de Whisper: en segmentos con silencio, ruido o audio musical puede generar texto inventado; se recomienda activar `vad_filter=True` y revisar las transcripciones en producción.
- Sensibilidad a la calidad del audio: acentos no estándar, ruido de fondo intenso, solapamiento de hablantes o audio telefónico de banda estrecha pueden aumentar el WER de forma notable respecto al 10,90 % de FLEURS.
- Ventana de 30 segundos: aunque se encadena para audio largo, la coherencia entre ventanas depende de `condition_on_previous_text`; en documentos muy largos pueden aparecer repeticiones o cortes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales de Whisper large-v3-turbo, que no se detallan en esta ficha.
- Formato CTranslate2 exclusivamente: no se distribuyen pesos en safetensors ni GGUF, lo que limita su uso a runtimes compatibles y obliga a reconvertir si se quiere emplear en otros ecosistemas.
- Sin datos publicados sobre sesgos demográficos o dialectales dentro del azerí; el rendimiento puede variar entre el azerí de Azerbaiyán y el de Irán u otras variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hasan0v/whisper-turbo-az-ct2
- Modelo base (ajuste fino original): https://huggingface.co/hasan0v/whisper-turbo-az
- Demo en vivo: https://huggingface.co/spaces/hasan0v/whisper-turbo-az-demo
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Portfolio del autor: https://ali-hasanov.com
- GitHub del autor: https://github.com/hasan0v
- LinkedIn del autor: https://www.linkedin.com/in/ali-hasanov
- Dataset de evaluación citado: LocalDoc/fleurs-azerbaijani-asr (referenciado en el model-index; no se ha localizado URL pública en la información disponible)
