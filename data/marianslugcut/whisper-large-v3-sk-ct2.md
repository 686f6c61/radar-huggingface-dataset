# marianslugcut/whisper-large-v3-sk-ct2

## Resumen

`marianslugcut/whisper-large-v3-sk-ct2` es una conversión al formato CTranslate2 del modelo `kinit/whisper-large-v3-sk`, un ajuste fino en eslovaco del conocido `openai/whisper-large-v3`. El modelo original lo desarrolla el Kempelen Institute of Intelligent Technologies (KInIT), mientras que esta versión se limita a reconvertir los pesos a `float16` mediante `ctranslate2.converters.TransformersConverter` para que puedan ejecutarse con la librería faster-whisper. No se ha entrenado ni modificado ningún peso: la autoría intelectual, la licencia y las características del modelo pertenecen a KInIT.

Se trata, por tanto, de un modelo de reconocimiento automático del habla (ASR) especializado en eslovaco, con la arquitectura encoder-decoder transformer propia de Whisper large-v3. Su relevancia radica en que permite desplegar una transcripción de alta calidad en eslovaco con la eficiencia de CTranslate2 (cuantización, inferencia más rápida y menor uso de memoria que la implementación original de PyTorch), algo útil para pipelines de subtitulado, actas o análisis de audio en producción.

El repositorio ocupa 3,1 GB y no registra descargas ni interacciones en el momento de la consulta. La información pública disponible se limita a la model card de la conversión; los detalles de entrenamiento, datos y resultados deben consultarse en la model card del modelo base `kinit/whisper-large-v3-sk`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1550 millones (arquitectura Whisper large-v3; no confirmado en la informacion disponible para este checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper); no disponible un valor adicional en la informacion proporcionada |
| Tipos de cuantizacion | float16 (conversion realizada a `float16`); CTranslate2 permite otras cuantizaciones en tiempo de conversion, no documentadas en esta ficha |
| Idiomas soportados | eslovaco (sk) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo binario para faster-whisper); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención multi-cabeza, entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe sobre 30 segundos de audio por ventana. El modelo base `kinit/whisper-large-v3-sk` es un ajuste fino de KInIT sobre `openai/whisper-large-v3` para eslovaco. Esta versión concreta no introduce cambios arquitectónicos ni de entrenamiento: únicamente aplica la conversión de pesos de Transformers a CTranslate2 en `float16` para su uso con faster-whisper.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento del ajuste fino, la composición del corpus eslovaco, ni si se emplearon técnicas de RLHF o DPO (poco habituales en ASR). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia conversión a CTranslate2, que habilita inferencia más eficiente en CPU y GPU.

## Capacidades

- Reconocimiento automático del habla (transcripción) en eslovaco.
- Transcripción de audio de hasta 30 segundos por ventana, con segmentación automática de audios más largos por parte de faster-whisper.
- Detección de idioma y decodificación con `language="sk"` forzado o automático.
- Generación de marcas de tiempo a nivel de segmento (y opcionalmente de palabra, según configuración de faster-whisper).
- Ejecución en CPU y GPU mediante CTranslate2, con control del tipo de cómputo (`float16`, `int8`, etc.).
- No se documentan en la información disponible capacidades de traducción, diarización de hablantes ni tool calling; el ajuste está orientado exclusivamente a ASR en eslovaco.

## Casos de uso

- Subtitulado automático de vídeo en eslovaco: faster-whisper genera segmentos con marcas de tiempo que pueden exportarse a SRT/VTT para plataformas de vídeo o archivos corporativos.
- Actas y transcripción de reuniones: el modelo puede procesar grabaciones de audio de forma local o en servidor, con la ventaja de ejecutarse en CPU mediante CTranslate2 cuando no hay GPU disponible.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas en eslovaco para su posterior indexación, búsqueda o análisis de calidad.
- Generación de corpus para NLP en eslovaco: conversión de archivos de audio (podcasts, radio, entrevistas) en texto para entrenar o evaluar otros modelos de lenguaje.
- Accesibilidad: generación de subtítulos para contenidos audiovisuales dirigidos a personas con discapacidad auditiva en el mercado eslovaco.
- Investigación lingüística: análisis de habla eslovaca (fonética, variación dialectal) a partir de transcripciones masivas con marcas temporales.
- Despliegue en entornos con recursos limitados: al estar en formato CTranslate2, permite inferencia con menor huella de memoria que la implementación original de PyTorch, útil en servidores modestos o en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión no incluye métricas (WER, CER) ni comparaciones; para datos de evaluación del ajuste fino eslovaco debe consultarse la model card de `kinit/whisper-large-v3-sk`.

## Requisitos de hardware

- VRAM estimada en `float16`: en torno a 3 GB para los pesos (el repositorio ocupa 3,1 GB), más memoria para activaciones y buffers de decodificación; en la práctica suele requerir entre 4 y 6 GB de VRAM para audio de 30 segundos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. En GPU de gama alta el rendimiento es holgado.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores con `compute_type="float16"`; con cuantización `int8` puede reducirse aún más la huella.
- Ejecución en CPU: viable con CTranslate2 usando `compute_type="int8"`, aunque la latencia será mayor; adecuada para procesamiento por lotes no interactivo.
- Opciones de despliegue: faster-whisper (librería nativa de este formato), CTranslate2 directamente, y servidores compatibles con faster-whisper (por ejemplo, wyoming-faster-whisper o contenedores propios). No es compatible directamente con vLLM, llama.cpp ni Ollama, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del tipo de cómputo y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `marianslugcut/whisper-large-v3-sk-ct2` | 1550 M (Whisper large-v3) | 30 s por ventana | eslovaco | Apache 2.0 | CTranslate2 |
| `kinit/whisper-large-v3-sk` | 1550 M (Whisper large-v3) | 30 s por ventana | eslovaco | Apache 2.0 | safetensors (Transformers) |
| `openai/whisper-large-v3` | 1550 M | 30 s por ventana | multilingue | MIT | safetensors / PyTorch |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s por ventana | multilingue | MIT | safetensors / PyTorch |

La diferencia principal frente al modelo base eslovaco es el formato (CTranslate2 frente a Transformers), que aporta eficiencia de inferencia con faster-whisper. Frente a Whisper large-v3 original, este ajuste está especializado en eslovaco y, según la model card, rinde peor en otros idiomas. Frente a large-v3-turbo, este último es más pequeño y rápido, pero no está ajustado específicamente para eslovaco.

## Limitaciones y advertencias

- El ajuste fino está pensado exclusivamente para eslovaco; según la model card, es peor que el modelo base en otros idiomas, por lo que no debe usarse como ASR multilingüe general.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en tramos de silencio, ruido o audio ininteligible; conviene revisar las transcripciones en producción.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al derivar de Whisper large-v3 puede heredar sesgos del corpus original de OpenAI.
- La licencia Apache 2.0 permite uso comercial, pero debe mantenerse la atribución a los autores originales (KInIT) y a OpenAI por el modelo base.
- Esta conversión no ha sido validada por los autores originales; la responsabilidad de la conversión recae en el publicador del repositorio.
- No se dispone de métricas de calidad (WER/CER) en la información proporcionada; se recomienda evaluar sobre un conjunto propio antes de desplegar.
- El repositorio no registra descargas ni interacciones, lo que puede indicar falta de validación comunitaria.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/marianslugcut/whisper-large-v3-sk-ct2
- Modelo base eslovaco: https://huggingface.co/kinit/whisper-large-v3-sk
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Librería faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
