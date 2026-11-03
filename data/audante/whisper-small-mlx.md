# Audante/whisper-small-mlx

## Resumen

Whisper small (MLX) es una redistribución del modelo de reconocimiento automático de voz Whisper small de OpenAI, convertido al framework MLX de Apple para su ejecución eficiente en hardware de la familia Apple Silicon (chips M1, M2, M3 y posteriores). El repositorio lo publica el usuario Audante y es una copia byte a byte de la conversión oficial de mlx-community, que a su vez parte de los pesos originales de OpenAI. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: es un espejo de artefactos ya existentes.

Whisper small es un transformer encoder-decoder entrenado para transcripción multilingüe y traducción de voz a texto, con aproximadamente 244 millones de parámetros y una ventana de audio de 30 segundos procesada en fragmentos. Su relevancia en este formato radica en que MLX permite ejecutar inferencia local en Macs con memoria unificada, sin necesidad de GPU dedicada ni de servicios en la nube, lo que facilita prototipos de transcripción en el propio dispositivo.

El interés práctico de esta ficha es limitado pero concreto: sirve como punto de descarga estable con licencia MIT y checksums verificables para quien quiera integrar Whisper small en una aplicación MLX. Dado que el repositorio no aporta modificaciones ni documentación adicional, todas las capacidades y limitaciones son las del modelo original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | ~244 millones (heredado de Whisper small; no indicado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (característica de Whisper; no indicada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos MLX sin especificar precisión; el tamaño de 0,5 GB sugiere fp16) |
| Idiomas soportados | no disponible en la model card (Whisper small original es multilingüe) |
| Licencia | MIT |
| Formato de pesos | MLX (pesos convertidos para la librería mlx; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small de OpenAI: un transformer encoder-decoder con atención estándar que procesa espectrogramas log-Mel de 80 canales extraídos de ventanas de audio de 30 segundos. El encoder transforma el espectrograma en representaciones latentes y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, marcas de tiempo y traducción. El modelo original se entrenó con 680.000 horas de audio supervisado débilmente etiquetado, procedente de una mezcla de datos multilingües y de traducción, y se ajustó con datos etiquetados de alta calidad (el conjunto de 5.000 horas descrito en el paper de Whisper).

Esta versión concreta no introduce ningún cambio respecto al modelo base: la model card afirma explícitamente que los archivos son idénticos a los de mlx-community/whisper-small-mlx en la revisión `45f3915923c7a79a5a5b5a7d909d39aeb0e5630e`. La única transformación es la conversión de los pesos de PyTorch a formato MLX, realizada por mlx-community, no por el autor de este repositorio. No hay información sobre cuantización aplicada, precisión de los pesos ni proceso de validación numérica tras la conversión.

## Capacidades

- Reconocimiento automático de voz (ASR) en formato encoder-decoder, con salida de texto y marcas de tiempo a nivel de segmento.
- Transcripción multilingüe y traducción de voz a inglés, capacidades heredadas del modelo Whisper small original (la model card no detalla la lista de idiomas).
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de encadenar segmentos para audio más largo mediante lógica externa de segmentación.
- Detección automática de idioma mediante tokens especiales del decoder.
- Ejecución en Apple Silicon a través de la librería MLX, con memoria unificada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de transcripción.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción local en macOS: integrar el modelo en una aplicación de escritorio para Mac que transcriba reuniones o notas de voz sin enviar audio a la nube, aprovechando la ejecución nativa en MLX sobre memoria unificada.
- Subtitulado de vídeos: generar subtítulos con marcas de tiempo para contenido de hasta 30 segundos por segmento, encadenando segmentos con una capa de preprocesado de audio propia.
- Prototipado rápido de pipelines ASR: usar el repositorio como dependencia con licencia MIT y checksums verificables en entornos de investigación que ya trabajen con MLX.
- Dictado por voz en herramientas de desarrollo: transcribir comandos o notas habladas en un editor o terminal en Mac, con latencia baja al ejecutarse en el dispositivo.
- Anonimización de audio sensible: procesar grabaciones clínicas o legales en local para evitar el envío de datos a servicios externos, dado que el modelo se ejecuta íntegramente en la máquina.
- Evaluación comparativa de frameworks: servir como referencia para medir el rendimiento de MLX frente a PyTorch o llama.cpp en la misma tarea de transcripción con el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, latencia ni comparaciones con otros modelos, y el repositorio no aporta ninguna validación propia más allá de los checksums de integridad.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~244 millones de parámetros, el repositorio ocupa 0,5 GB; en fp16 la inferencia requiere del orden de 0,5-1 GB de memoria, y en cuantizaciones de 8 bits podría reducirse aproximadamente a la mitad (estimación, no confirmada en la model card).
- GPU recomendadas: Apple Silicon (M1, M2, M3 y variantes Pro/Max/Ultra) con MLX; no está pensado para GPUs NVIDIA, ya que el formato de pesos es específico de MLX.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior, incluidos los modelos base de la gama M1.
- Opciones de despliegue: librería `mlx` de Apple; no se proporcionan instrucciones para vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/whisper-small-mlx | ~244 M | 30 s por segmento | MLX | MIT | HuggingFace (espejo) |
| mlx-community/whisper-small-mlx | ~244 M | 30 s por segmento | MLX | MIT | HuggingFace (fuente original de la conversión) |
| openai/whisper-small | ~244 M | 30 s por segmento | PyTorch/safetensors | MIT | HuggingFace (modelo base) |
| openai/whisper-large-v3 | ~1.550 M | 30 s por segmento | PyTorch/safetensors | MIT | HuggingFace |

La diferencia principal frente a whisper-small de OpenAI es el formato de pesos: MLX frente a PyTorch. Frente a whisper-large-v3, este modelo es aproximadamente seis veces más pequeño, lo que reduce los requisitos de memoria a costa de una precisión inferior en transcripción, aunque no se dispone de métricas en esta ficha para cuantificar la diferencia.

## Limitaciones y advertencias

- No es un lanzamiento oficial: la model card lo declara explícitamente y no aporta ninguna mejora sobre el modelo de mlx-community.
- No hay información sobre sesgos; hereda los del corpus de entrenamiento de Whisper, que puede mostrar peor rendimiento en variedades dialectales, acentos poco representados y audio con ruido de fondo.
- Riesgo de alucinación: Whisper puede generar texto plausible en segmentos con silencio, ruido o habla ininteligible, un comportamiento documentado en el modelo original.
- La model card no especifica la lista de idiomas ni la precisión de los pesos convertidos, por lo que no se puede verificar la fidelidad numérica de la conversión a MLX.
- La licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright y verificar los términos del modelo base de OpenAI.
- El formato MLX limita el despliegue a hardware Apple; no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin reconversión.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin señales de uso comunitario ni validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Audante/whisper-small-mlx
- Repositorio fuente de la conversión: https://huggingface.co/mlx-community/whisper-small-mlx
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de código de Whisper: https://github.com/openai/whisper
- Framework MLX: https://github.com/ml-explore/mlx
