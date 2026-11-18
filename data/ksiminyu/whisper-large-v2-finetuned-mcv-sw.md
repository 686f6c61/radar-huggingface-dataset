# ksiminyu/whisper-large-v2-finetuned-mcv-sw

## Resumen

Whisper Large-v2 finetuned MCV Swahili es un ajuste fino del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v2` publicado por el usuario ksiminyu en Hugging Face. El modelo está especializado en kiswahili (suajili, código `sw`) y se ha entrenado sobre el subconjunto de ese idioma del corpus `mozilla-foundation/common_voice_26_0`. Resuelve el problema de la baja precisión de Whisper en idiomas de bajos recursos cuando se usa el modelo multilingüe original sin adaptación: en lugar de forzar al modelo a discriminar entre casi un centenar de idiomas, se le ha reentrenado para una única lengua, lo que en la práctica suele mejorar la tasa de error de palabras en dominios acotados.

Arquitectura y tamaño coinciden con el Whisper Large-v2 original: un transformer encoder-decoder de aproximadamente 1.543 millones de parámetros (1,54 B), con una ventana de audio de 30 segundos procesada como espectrograma log-Mel de 80 canales y 1280 dimensiones de estado oculto. El repositorio ocupa 6,2 GB y los pesos se distribuyen en formato `safetensors`. El modelo se publica bajo licencia MIT, lo que facilita su uso comercial, aunque hereda las limitaciones del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste fino concreto para suajili, un idioma con cobertura limitada en sistemas ASR comerciales; por otro, sirve como ejemplo de la práctica habitual de adaptar Whisper a una sola lengua con Common Voice. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto de investigación sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large-v2) |
| Parametros totales | 1.543.304.960 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (arquitectura Whisper) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite las conversiones habituales a fp16, int8 y GGUF |
| Idiomas soportados | kiswahili (`sw`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v2`, un transformer encoder-decoder entrenado por OpenAI para transcripción multilingüe y traducción de voz. La entrada es un espectrograma log-Mel de 80 canales calculado sobre ventanas de 30 segundos; el encoder procesa la secuencia acústica y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de idioma, tarea y marcas de tiempo. El ajuste fino conserva la totalidad de los 1.543 millones de parámetros del modelo base: no hay poda ni destilación documentada.

El entrenamiento se realizó sobre el subconjunto de kiswahili de `mozilla-foundation/common_voice_26_0`, un corpus de voz leída con transcripciones alineadas. La model card no especifica el número de horas, el número de épocas, la tasa de aprendizaje, el tamaño de batch ni si se aplicaron técnicas de aumento de datos o especificación de idioma forzada durante el ajuste. Tampoco se documenta el uso de RLHF ni de DPO, algo esperable en un ajuste fino supervisado de ASR. La innovación técnica es, por tanto, la especialización monolingüe sobre un checkpoint multilingüe ya consolidado, no una modificación arquitectónica.

## Capacidades

- Transcripción de voz a texto en kiswahili a partir de audio de hasta 30 segundos por ventana.
- Reconocimiento de habla continua con puntuación y mayúsculas implícitas aprendidas del corpus de entrenamiento.
- Manejo de audio con ruido moderado y distintas calidades de grabación, dentro de los límites del corpus Common Voice.
- Generación de marcas de tiempo a nivel de segmento, heredadas del modelo base Whisper.
- No soporta tool calling ni function calling: es un modelo puramente ASR, sin interfaz de instrucciones.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al kiswahili; el resto de idiomas del Whisper original no están garantizados tras el ajuste fino.
- No dispone de modo de pensamiento, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en kiswahili: el modelo convierte grabaciones de hasta 30 segundos por fragmento en texto, adecuado para actas y resúmenes posteriores en organizaciones de África Oriental.
- Subtitulado automático de vídeo y pódcast en suajili: genera transcripciones con marcas de tiempo que se pueden alinear con la pista de audio para producir subtítulos SRT.
- Digitalización de archivos orales: bibliotecas y radios comunitarias pueden transcribir grabaciones históricas en kiswahili para hacerlas buscables.
- Atención al cliente en centros de llamadas: transcripción de llamadas para análisis de calidad y búsqueda de palabras clave, siempre que el audio sea limpio y el dialecto esté representado en Common Voice.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética, morfología y variación dialectal del suajili.
- Accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en contenidos en kiswahili.
- Preprocesado para pipelines de NLP: las transcripciones sirven como entrada a sistemas de resumen, traducción o análisis de sentimiento en suajili.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni comparaciones con otros modelos, y el repositorio no aporta métricas de evaluación.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, más memoria para activaciones y caché; en la práctica se recomiendan 6-8 GB de VRAM para inferencia cómoda.
- VRAM estimada en int8: alrededor de 1,6 GB de pesos, con un consumo total de 3-4 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A5000 para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070 en adelante; en 8 GB funciona en fp16 con batches pequeños.
- Opciones de despliegue: `transformers` con pipeline de ASR, `faster-whisper` (CTranslate2), `whisper.cpp`, `vLLM` con soporte de audio, `TGI` y `Ollama` mediante conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ksiminyu/whisper-large-v2-finetuned-mcv-sw | 1,54 B | 30 s de audio | sw | MIT | Hugging Face |
| openai/whisper-large-v2 | 1,54 B | 30 s de audio | multilingüe (~99) | MIT | Hugging Face, OpenAI |
| openai/whisper-large-v3 | 1,55 B | 30 s de audio | multilingüe (~99) | MIT | Hugging Face, OpenAI |
| openai/whisper-small | 244 M | 30 s de audio | multilingüe | MIT | Hugging Face, OpenAI |

La comparación con Whisper Large-v2 original es la más directa: mismo tamaño y arquitectura, pero el ajuste fino restringe el idioma a kiswahili. Frente a Whisper Large-v3, este último incorpora mejoras de entrenamiento y mayor cobertura de idiomas, aunque no está especializado en suajili. Whisper-small ofrece una alternativa mucho más ligera para despliegues con recursos limitados, a costa de precisión.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del corpus Common Voice, que sobrerrepresenta voces de lectura, adultos y determinadas variantes dialectales del kiswahili.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con silencios, ruido o audio musical.
- Limitaciones de idioma: solo se ha ajustado para kiswahili; el rendimiento en otros idiomas no está garantizado y probablemente se degrade respecto al modelo base.
- Limitaciones de contexto: la ventana de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en las fronteras entre segmentos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones del corpus Common Voice y del modelo base Whisper.
- Caveat de producción: con 0 descargas y 0 likes, no hay validación comunitaria ni métricas publicadas; se recomienda evaluar el WER en un conjunto propio antes de desplegarlo.
- No se documentan ni el volumen de datos de entrenamiento ni la configuración del ajuste fino, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ksiminyu/whisper-large-v2-finetuned-mcv-sw
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/mozilla-foundation/common_voice_26_0
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
