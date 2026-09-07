# Jinstudio/whisper-tiny

## Resumen

Jinstudio/whisper-tiny es una copia del modelo Whisper tiny de OpenAI, publicado en Hugging Face por el usuario Jinstudio. Whisper es un modelo de reconocimiento automático de voz (ASR) y traducción de voz basado en una arquitectura Transformer encoder-decoder, entrenado por OpenAI con 680.000 horas de datos de audio etiquetados mediante supervisión débil. El modelo destaca por su capacidad de generalizar a múltiples dominios y datasets sin necesidad de fine-tuning, y por soportar un gran número de idiomas.

Esta variante concreta tiene 37.760.640 parámetros (según los pesos safetensors), lo que corresponde a la configuración "tiny" de la familia Whisper. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, como dispositivos edge o aplicaciones en tiempo real. El modelo está disponible bajo licencia Apache 2.0 y su pipeline principal es el reconocimiento automático de voz (automatic-speech-recognition).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (contexto fijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (99 idiomas, incluyendo español, inglés, chino, alemán, francés, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper es un modelo de tipo Transformer encoder-decoder. El encoder procesa espectrogramas log-Mel de 80 canales obtenidos a partir de ventanas de audio de 30 segundos, y el decoder genera la transcripción o traducción token a token. El modelo utiliza tokens de contexto especiales para indicar el idioma, la tarea (transcribir o traducir) y si se deben predecir timestamps.

El entrenamiento se realizó sobre 680.000 horas de audio etiquetado, recopilado de la web y anotado de forma débil. Los modelos multilingües como este se entrenan simultáneamente en reconocimiento de voz (transcripción en el mismo idioma) y traducción de voz (transcripción a otro idioma, generalmente inglés). No se aplicaron técnicas de RLHF ni DPO. La principal innovación técnica es la robustez obtenida mediante el entrenamiento a gran escala con supervisión débil, que permite al modelo generalizar a dominios y acentos no vistos durante el entrenamiento.

## Capacidades

- Reconocimiento automático de voz (ASR) en 99 idiomas, con transcripción en el mismo idioma del audio.
- Traducción de voz: puede transcribir audio en un idioma y traducirlo al inglés u otro idioma mediante tokens de contexto.
- Predicción de timestamps: el modelo puede generar marcas de tiempo por segmento si se le indica mediante el token `<|notimestamps|>`.
- Funciona sin fine-tuning en una amplia variedad de dominios, incluyendo audios con ruido, acentos variados y diferentes calidades de grabación.
- No soporta tool calling, function calling ni razonamiento multi-paso, al ser un modelo puramente de audio a texto.
- No tiene capacidades de visión ni generación de texto libre más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto de forma rápida y precisa, lo que facilita la generación de actas y el análisis posterior. Su tamaño reducido permite ejecutarlo en servidores modestos o en local.
- Subtitulado automático de vídeos: al predecir timestamps, Whisper tiny puede generar subtítulos sincronizados para vídeos en múltiples idiomas, útil para plataformas de streaming o contenido educativo.
- Accesibilidad para personas con discapacidad auditiva: integración en aplicaciones de asistencia que convierten voz en texto en tiempo real, con latencia baja gracias al pequeño número de parámetros.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para extraer información, evaluar la calidad del servicio o alimentar sistemas de análisis de sentimiento.
- Transcripción de podcasts y contenido de audio: automatización de la generación de textos a partir de episodios, facilitando la indexación y búsqueda de contenido.
- Traducción de audio a inglés: el modelo puede tomar audio en cualquier idioma soportado y transcribirlo directamente en inglés, lo que resulta útil para equipos internacionales que trabajan con grabaciones en distintos idiomas.
- Asistentes de voz en dispositivos edge: gracias a su bajo coste computacional, puede desplegarse en dispositivos con CPU limitada, como Raspberry Pi o routers, para tareas de dictado o control por voz.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en el model-index de Hugging Face, el modelo obtiene los siguientes valores de WER (Word Error Rate, menor es mejor):

| Dataset | Config | Split | Idioma | WER |
|---|---|---|---|---|
| LibriSpeech (clean) | clean | test | en | 7.54 |
| LibriSpeech (other) | other | test | en | 17.15 |
| Common Voice 11.0 | hi | test | hi | 141 |

Nota: el valor de WER de 141 en Common Voice 11.0 (hindi) es anómalo y probablemente indica un error en la medición o un problema con el dataset. No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32; con cuantización a 8 bits o 4 bits, puede reducirse a ~200-400 MB.
- GPU recomendadas: cualquier GPU consumer moderna, como RTX 3060 o superior. También puede ejecutarse en CPU de forma eficiente gracias a su pequeño tamaño.
- Cabe en GPUs de consumo: sí, incluso en GPUs integradas o con 2 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers, openai-whisper, faster-whisper, whisper.cpp, y servicios de inferencia como Replicate o Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible en la información proporcionada. En una GPU modesta, la transcripción de un audio de 30 segundos suele completarse en menos de un segundo, aunque este dato no está confirmado oficialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jinstudio/whisper-tiny | 37.760.640 | 30 s audio | 7.54 | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s audio | 7.54 (según modelo oficial) | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s audio | 5.42 (según modelo oficial) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s audio | 4.24 (según modelo oficial) | Apache 2.0 | Hugging Face |

Los valores de WER para los modelos openai/whisper-base y openai/whisper-small son los publicados por OpenAI en su documentación original, no aparecen en la información proporcionada para Jinstudio/whisper-tiny. Se incluyen como referencia comparativa.

## Limitaciones y advertencias

- El modelo puede alucinar contenido en audios con mucho ruido, silencios o habla solapada, generando texto que no está presente en el audio.
- El rendimiento varía significativamente según el idioma. El benchmark en hindi muestra un WER muy alto (141), lo que sugiere una calidad deficiente en idiomas con menos datos de entrenamiento.
- La ventana fija de 30 segundos limita la transcripción de audios largos, que deben segmentarse previamente.
- No está optimizado para habla con acentos muy marcados, jergas técnicas o vocabulario especializado, lo que puede requerir fine-tuning en dominios concretos.
- Al ser una copia del modelo original de OpenAI, no hay garantía de que Jinstudio haya realizado validaciones adicionales ni de que los pesos sean exactamente idénticos a los oficiales.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia, especialmente en aplicaciones distribuidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jinstudio/whisper-tiny
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-tiny
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
