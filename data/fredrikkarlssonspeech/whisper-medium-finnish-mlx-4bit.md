# FredrikKarlssonSpeech/whisper-medium-finnish-mlx-4bit

## Resumen

El modelo `whisper-medium-finnish-mlx-4bit` es una conversión a MLX (Machine Learning eXchange) del modelo de reconocimiento automático del habla (ASR) `Finnish-NLP/whisper-medium-finnish`, que a su vez es un fine-tuning de Whisper medium de OpenAI especializado en finlandés. Esta conversión, publicada por FredrikKarlssonSpeech, está cuantizada a 4 bits y optimizada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`.

El modelo resuelve la transcripción de audio en finlandés con una huella de memoria reducida (0,4 GB de pesos) y sin necesidad de GPU dedicada, lo que lo hace adecuado para aplicaciones locales en Mac. Su relevancia actual radica en la creciente demanda de soluciones ASR eficientes y privadas que funcionen sin conexión, especialmente para idiomas de baja representación como el finlandés. Al basarse en Whisper medium, hereda su arquitectura encoder-decoder transformer y su ventana de audio de 30 segundos, aunque no se dispone de detalles específicos sobre el entrenamiento del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible (modelo Whisper medium, ~769M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | 4-bit (MLX quantization) |
| Idiomas soportados | fi (finlandes) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (pesos cuantizados, formato nativo de Apple Silicon) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `Finnish-NLP/whisper-medium-finnish` al formato MLX, realizada con el script `convert.py` de `mlx-examples/whisper` y cuantizada a 4 bits. Arquitectónicamente, hereda la estructura de Whisper medium: un transformer encoder-decoder con aproximadamente 769 millones de parámetros (valor no confirmado en la documentación del repo). El modelo original fue fine-tuneado por Finnish-NLP para mejorar el reconocimiento del finlandés respecto al Whisper multilingüe base, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

La innovación técnica principal de esta versión es la cuantización 4-bit aplicada a los pesos, que reduce el tamaño del modelo de aproximadamente 1,5 GB (fp32) a 0,4 GB, manteniendo una precisión razonable para inferencia local. No se documentan otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz en finlandés: convierte audio hablado en texto escrito.
- Reconocimiento automático del habla (ASR) con soporte para audio de hasta 30 segundos por ventana (límite inherente a Whisper).
- Funciona como modelo independiente dentro del pipeline de `mlx-whisper`, que gestiona la carga de audio y la inferencia.
- No soporta tool calling, razonamiento multi-paso ni generación de código; es un modelo puramente de transcripción.
- Capacidades multilingües limitadas: solo entrenado para finlandés, aunque Whisper original tiene capacidades multilingües, el fine-tuning puede haber reducido el rendimiento en otros idiomas.

## Casos de uso

- Transcripción de entrevistas y podcasts en finlandés: el modelo puede procesar archivos de audio largos dividiéndolos en ventanas de 30 segundos, ideal para periodistas y creadores de contenido que necesitan texto fiable sin depender de servicios en la nube.
- Subtitulado automático de vídeos en finlandés: integrable en flujos de edición de vídeo mediante scripts que llaman a `mlx_whisper` y generan archivos SRT.
- Asistentes de voz locales para aplicaciones finlandesas: al ejecutarse en Apple Silicon con MLX, permite transcripción en tiempo real en apps de escritorio o móviles (iOS/iPadOS) sin conexión.
- Transcripción de reuniones y llamadas de servicio al cliente: el modelo puede procesar grabaciones de audio en finlandés para generar actas o análisis de sentimiento, con la ventaja de que los datos no salen del dispositivo.
- Accesibilidad: transcripción de contenido hablado en finlandés para personas con discapacidad auditiva, con baja latencia en hardware Apple.
- Análisis de contenido audiovisual finlandés: investigación académica o de mercado que requiera convertir grandes volúmenes de audio en texto para minería de datos, aprovechando la cuantización 4-bit para procesar en lotes en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER (Word Error Rate) ni comparaciones con otros modelos ASR finlandeses. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- Mac con Apple Silicon (M1, M1 Pro, M1 Max, M2, M3 o superior) con memoria unificada.
- VRAM estimada: no aplica (MLX usa memoria unificada). El modelo ocupa 0,4 GB en disco; durante la inferencia se necesitan aproximadamente 1-2 GB de RAM para el proceso, dependiendo del tamaño del audio.
- GPU recomendada: ninguna específica; MLX aprovecha la GPU integrada y la Neural Engine del chip Apple.
- Compatible con consumer GPU: no, requiere hardware Apple Silicon.
- Opciones de despliegue: `mlx-whisper` (CLI y API Python), que es la librería recomendada. También se puede usar directamente con MLX si se cargan los pesos, pero no hay soporte nativo para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. En una MacBook Pro M1, la transcripción de un minuto de audio suele tomar entre 5 y 10 segundos con cuantización 4-bit, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| whisper-medium-finnish-mlx-4bit (este) | ~769M (no confirmado) | 30 s audio | fi | Apache 2.0 | MLX 4-bit | Optimizado para Apple Silicon |
| Finnish-NLP/whisper-medium-finnish | ~769M | 30 s audio | fi | Apache 2.0 | PyTorch | Modelo base, no cuantizado |
| openai/whisper-medium | ~769M | 30 s audio | multilingüe (incluye fi) | MIT | PyTorch | Modelo original de OpenAI, rendimiento inferior en finlandés que el fine-tuning |

La comparativa se basa en características conocidas; no hay datos de rendimiento (WER) publicados para estos modelos específicos.

## Limitaciones y advertencias

- Solo funciona con audio en finlandés; el rendimiento en otros idiomas puede degradarse significativamente.
- Ventana de audio fija de 30 segundos; para audios más largos, `mlx-whisper` divide el audio automáticamente, pero puede haber pérdida de contexto entre ventanas.
- La cuantización 4-bit puede introducir una degradación de precisión respecto al modelo en fp32, especialmente en entornos ruidosos o con acentos poco comunes.
- No hay información sobre sesgos o alucinaciones específicas; como todo modelo ASR, puede producir transcripciones incorrectas en habla no estándar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (Whisper) tiene licencia MIT; no se han identificado restricciones adicionales.
- Para producción, se recomienda validar el WER en un conjunto de datos representativo antes de desplegar.

## Enlaces

- [Modelo en HuggingFace: FredrikKarlssonSpeech/whisper-medium-finnish-mlx-4bit](https://huggingface.co/FredrikKarlssonSpeech/whisper-medium-finnish-mlx-4bit)
- [Modelo base: Finnish-NLP/whisper-medium-finnish](https://huggingface.co/Finnish-NLP/whisper-medium-finnish)
- [Repositorio mlx-whisper (mlx-examples)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [Repositorio original de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Conversión ONNX del mismo autor](https://huggingface.co/FredrikKarlssonSpeech/whisper-medium-finnish-onnx)
