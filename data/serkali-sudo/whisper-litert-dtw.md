# Serkali-sudo/Whisper-LiteRT-DTW

## Resumen

Whisper-LiteRT-DTW es una colección de exportaciones del modelo Whisper de OpenAI al formato LiteRT (anteriormente TensorFlow Lite), publicada por el usuario Serkali-sudo. El objetivo declarado es proporcionar Whisper multilingüe con ventanas de duración fija, orientado a la generación de subtítulos automáticos en la aplicación AutoSub. Cada paquete incluye el encoder, un decoder con firma de alineamiento DTW (Dynamic Time Warping), el tokenizer, el banco de filtros mel y un manifiesto `whisper.json`.

La relevancia de esta publicación reside en el formato: al tratarse de artefactos LiteRT/TFLite, están pensados para inferencia en CPU y para despliegues ligeros en dispositivos, no para servidores con GPU. La incorporación de una firma DTW en el decoder permite obtener marcas temporales a nivel de palabra, algo que las exportaciones estándar de Whisper no ofrecen de forma nativa.

La información disponible es muy limitada: el repositorio no publica parámetros totales, longitud de contexto, idiomas concretos soportados ni resultados de benchmarks. El tamaño del repo es de 0,8 GB, lo que sugiere una o varias variantes de tamaño pequeño o base, pero no se especifica cuáles. La licencia es MIT, heredada de la publicación, aunque los pesos originales provienen de OpenAI Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), exportado a LiteRT/TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de duración fija, sin especificar) |
| Tipos de cuantizacion | no disponible (el autor no detalla si los artefactos son float32, float16 o int8) |
| Idiomas soportados | no disponible (el autor lo describe como multilingüe, sin listado) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (encoder, decoder, tokenizer, filtros mel y manifiesto JSON) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper: un transformer encoder-decoder entrenado para reconocimiento automático de voz sobre audio representado como espectrograma mel. El autor no ha entrenado ni ajustado el modelo, sino que ha exportado los pesos originales a LiteRT. Cada paquete contiene el encoder, el decoder con una firma de alineamiento DTW añadida, el tokenizer, el banco de filtros mel y un manifiesto `whisper.json`; el fichero `whisper-litert-index.json` enumera todos los paquetes publicados.

No se detalla el proceso de exportación, el número de tokens de entrenamiento (que corresponde al del Whisper original, no reportado en esta ficha), ni si hubo cuantización. El autor indica únicamente que cada exportación se valida sobre el runtime CPU de LiteRT antes de publicarse. La innovación técnica destacable es la firma DTW en el decoder, que habilita la obtención de timestamps a nivel de palabra mediante alineamiento entre las atenciones cruzadas y la secuencia de tokens, sin necesidad de un modelo de alineamiento externo.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio con ventanas de duración fija.
- Generación de marcas temporales a nivel de palabra mediante DTW, adecuadas para subtitulado.
- Soporte multilingüe declarado por el autor (sin listado de idiomas).
- Inferencia en CPU a través del runtime LiteRT.
- Inclusión de tokenizer y filtros mel en el propio paquete, lo que simplifica el pipeline de preprocesado.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del ASR ni modos de razonamiento explícito.

## Casos de uso

- Subtitulado automático de vídeo: el decoder con firma DTW permite generar subtítulos con tiempos por palabra, lo que encaja directamente con el objetivo declarado del autor (AutoSub) y evita postprocesar alineamientos con herramientas externas.
- Transcripción en dispositivos sin GPU: al estar exportado a LiteRT, el modelo puede ejecutarse en CPU de portátiles, mini-PCs o entornos edge donde no hay acelerador dedicado.
- Aplicaciones de escritorio offline: un pipeline que incluya tokenizer, filtros mel y pesos en un único paquete simplifica el empaquetado de herramientas de transcripción que no dependen de la nube.
- Generación de transcripciones con marcas temporales para indexación de audio: los timestamps por palabra facilitan la búsqueda y el recorte de fragmentos en archivos de audio o vídeo largos.
- Prototipado rápido de ASR en Python o C++: el manifiesto JSON y el índice de paquetes permiten seleccionar una variante concreta y cargarla con el runtime LiteRT sin conversiones adicionales.
- Evaluación comparativa de exportaciones LiteRT frente a los pesos originales de Whisper: útil para medir la pérdida de precisión y latencia que introduce el formato TFLite en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo está orientado a inferencia en CPU mediante LiteRT. El tamaño del repo (0,8 GB) da una cota superior aproximada del espacio en disco y memoria necesario para cargar los artefactos, pero no se especifica el desglose por variante ni el tipo numérico.
- GPU recomendadas: no disponible; el autor valida las exportaciones sobre el runtime CPU de LiteRT.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime LiteRT (CPU); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Whisper-LiteRT-DTW | no disponible | ventanas de audio de duración fija (sin especificar) | LiteRT / TFLite | MIT | Exportación de Whisper con DTW para timestamps por palabra |
| OpenAI Whisper (original) | 39M a 1550M según variante | 30 s de audio por ventana | PyTorch | MIT | Pesos de referencia; sin timestamps por palabra nativos |
| faster-whisper | mismas variantes que Whisper | 30 s de audio por ventana | CTranslate2 | MIT | Optimizado para GPU/CPU con cuantización int8 |

La comparación con alternativas es aproximada, ya que el autor no especifica qué variantes de Whisper ha exportado ni sus parámetros. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La información pública es mínima: no se detallan variantes exportadas, parámetros, idiomas ni cuantización, lo que dificulta evaluar su idoneidad en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- Al derivar de Whisper, hereda sus sesgos conocidos y su tendencia a alucinar texto en segmentos con silencio o ruido, especialmente en idiomas de bajos recursos.
- Los timestamps DTW pueden degradarse en audio con solapamiento de hablantes, ruido de fondo elevado o música.
- La licencia MIT se aplica a la publicación, pero conviene verificar las condiciones de los pesos originales de OpenAI Whisper antes de un uso comercial.
- El formato LiteRT limita las opciones de despliegue en servidores con GPU; para cargas de alta concurrencia puede ser preferible usar los pesos originales con runtimes optimizados.
- No se documenta el proceso de validación ni las métricas de calidad (WER) de las exportaciones.

## Enlaces

- [Hugging Face: Serkali-sudo/Whisper-LiteRT-DTW](https://huggingface.co/Serkali-sudo/Whisper-LiteRT-DTW)
- [OpenAI Whisper (repositorio original)](https://github.com/openai/whisper)
- [LiteRT (Google AI Edge)](https://ai.google.dev/edge/litert)
