# dianavdavidson/whisper-medium_iv_hindi_only_62419_ratio_alldata_lr_1e-4_lgid_hi_epochs_100_FT

## Resumen

Este modelo es un ajuste fino (fine-tune) de `openai/whisper-medium` para el reconocimiento automático de voz (ASR) en hindi, desarrollado por el usuario `dianavdavidson`. El nombre del modelo incluye las etiquetas `hindi_only` e `lgid_hi`, lo que sugiere que el entrenamiento se centró exclusivamente en audios en hindi, aunque la documentación oficial no confirma los idiomas soportados. El modelo resuelve el problema de transcripción de audio a texto en un idioma con recursos limitados, y su relevancia radica en la escasez de modelos ASR de código abierto específicamente ajustados para hindi.

La arquitectura subyacente es la de Whisper Medium, un transformer encoder-decoder de OpenAI con 763.857.920 parámetros (según los pesos en safetensors). Al ser un modelo de audio, no tiene longitud de contexto en el sentido de modelos de lenguaje; en su lugar, procesa ventanas de audio de hasta 30 segundos, que es el comportamiento estándar de Whisper. Se trata de un fine-tune sin innovaciones técnicas destacables, más allá de los ajustes de hiperparámetros documentados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium) |
| Parametros totales | 763.857.920 |
| Longitud de contexto | No aplicable (modelo de reconocimiento de voz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre del modelo sugiere hindi, pero no hay confirmacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-medium`, que es un transformer encoder-decoder originalmente entrenado por OpenAI para tareas de reconocimiento de voz y traducción. Whisper Medium procesa audio muestreado a 16 kHz y genera transcripciones tokenizadas, con una ventana de entrada de 30 segundos. Este fine-tune se realizó sobre un dataset desconocido, según la model card, y no se especifica la composición ni el volumen de datos.

Los hiperparámetros de entrenamiento documentados incluyen: tasa de aprendizaje de `1e-4`, tamaño de lote de entrenamiento de 16, acumulación de gradientes de 2, optimizador `adamw_torch_fused` con betas (0.9, 0.999), programador de tasa de aprendizaje `constant_with_warmup` con 500 pasos de calentamiento, y 100 épocas. No se menciona el uso de técnicas de alineación como RLHF o DPO; se trata de un fine-tune supervisado convencional. La única innovación técnica destacable es la ausencia de ella: el modelo sigue exactamente la arquitectura y el procedimiento de entrenamiento estándar de Whisper, sin modificaciones arquitectónicas.

## Capacidades

- Transcripción de audio a texto en hindi (inferido del nombre del modelo; no confirmado en la documentación).
- Reconocimiento automático de voz (ASR) para audios de hasta 30 segundos por fragmento, limitación heredada de Whisper.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no confirmadas; el nombre sugiere que el modelo está especializado en hindi, pero no hay datos sobre otros idiomas.
- No dispone de capacidades de visión, generación de texto libre ni otras modalidades; es un modelo puramente de audio.

## Casos de uso

- Transcripción de reuniones en hindi: el modelo puede convertir grabaciones de reuniones a texto, facilitando la generación de actas y la búsqueda posterior de contenido. Su base Whisper Medium ofrece un equilibrio razonable entre precisión y coste computacional.
- Subtitulado automático de vídeos en hindi: adecuado para plataformas de vídeo que necesitan subtítulos en hindi de forma automatizada. El modelo puede procesar clips de audio de hasta 30 segundos, por lo que requiere segmentación previa.
- Atención al cliente por voz en hindi: las llamadas de soporte pueden transcribirse para analizar el sentimiento, extraer temas recurrentes o entrenar sistemas de respuesta. La licencia Apache 2.0 permite su integración en productos comerciales.
- Asistencia para personas con discapacidad auditiva: el modelo puede generar subtítulos en tiempo real para contenido en hindi, aunque la latencia dependerá del hardware y de la segmentación del audio.
- Documentación de entrevistas y dictados en hindi: útil para periodistas, investigadores o profesionales que necesitan transcribir entrevistas o dictados de forma rápida y local.
- Análisis de corpus de audio en investigación: el modelo puede transcribir grandes volúmenes de audio en hindi para construir datasets de texto, entrenar modelos de NLP o realizar estudios lingüísticos.
- Traducción de audio a texto como paso intermedio: la transcripción en hindi puede alimentar posteriormente un modelo de traducción automática para generar contenido en otros idiomas.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados de entrenamiento con la pérdida de validación y el error de palabra (Global Wer) en el conjunto de evaluación. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Training Loss | Epoch | Step | Validation Loss | Global Wer |
|:-------------:|:-----:|:----:|:---------------:|:----------:|
| 0.5243        | 1.0   | 540  | 0.2908          | 32.4794    |
| 0.3898        | 2.0   | 1080 | 0.2436          | 29.6619    |
| 0.2678        | 3.0   | 1620 | 0.2355          | 26.3949    |
| 0.2000        | 4.0   | 2160 | 0.2497          | 27.1000    |
| 0.1572        | 5.0   | 2700 | 0.2515          | 26.6258    |
| 0.1252        | 6.0   | 3240 | 0.2667          | 27.0631    |

El mejor resultado de validación se obtiene en la época 3, con un Global Wer de 26.3949. A partir de la época 4, la pérdida de entrenamiento sigue disminuyendo, pero la pérdida de validación y el Global Wer empeoran ligeramente, lo que indica un posible sobreajuste. No hay datos de pruebas independientes ni comparaciones con otros modelos ASR en hindi.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para los pesos en FP16, más overhead de activaciones y audio, por lo que se recomiendan al menos 2-3 GB de VRAM. Esta es una estimación orientativa basada en el tamaño del modelo; no hay datos oficiales del autor.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM, como una RTX 3060, RTX 4050 o equivalente, puede ejecutar el modelo. Para despliegue en producción con mayor concurrencia, se recomiendan GPUs como la T4 o la A10G.
- Sí cabe en GPU de consumo, siempre que se disponga de al menos 4 GB de VRAM y se utilice una cuantización adecuada (FP16 o INT8).
- Opciones de despliegue: el modelo es compatible con la librería `transformers` y puede servirse mediante `faster-whisper`, `whisper.cpp` o soluciones basadas en ONNX. No se ha verificado su compatibilidad con `vLLM` ni `TGI`, que son más habituales para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos que permitan evaluar este modelo frente a alternativas similares. El modelo base `openai/whisper-medium` tiene la misma arquitectura y número de parámetros, pero no se han publicado resultados de evaluación comparativa entre ambos en la información disponible. Otros fine-tunes de la misma autora, como `whisper-small_iv_hindi_vaani` o `whisper-small_iv_hindi_only`, son versiones más pequeñas (Whisper Small) y podrían ser comparables en tarea, pero tampoco se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica la composición, el tamaño ni el origen de los datos de entrenamiento, lo que impide evaluar la calidad del modelo y los posibles sesgos.
- Riesgo de sobreajuste: la pérdida de validación no mejora después de la época 3, mientras que la pérdida de entrenamiento sigue bajando durante 100 épocas. Esto sugiere que el modelo puede haber memorizado el conjunto de entrenamiento en lugar de generalizar.
- Riesgo de alucinación en transcripciones: como todos los modelos Whisper, puede generar texto incorrecto o inventado en audios ruidosos, con acentos no vistos o en dominios fuera del entrenamiento.
- Idiomas soportados no confirmados: la documentación no especifica los idiomas. Aunque el nombre del modelo indica hindi, no hay garantía de que funcione correctamente en variantes dialectales o en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte técnico. El modelo se publica "tal cual", sin responsabilidad sobre su uso.
- Sin información sobre latencia, throughput ni requisitos de hardware específicos del autor, por lo que las estimaciones de esta ficha son orientativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/whisper-medium_iv_hindi_only_62419_ratio_alldata_lr_1e-4_lgid_hi_epochs_100_FT
- Modelo relacionado de la misma autora: https://huggingface.co/dianavdavidson/whisper-small_iv_hindi_vaani_62120_ratio_alldata_lr_1e-4_lgid_en_epochs_100_FT
- Modelo relacionado de la misma autora: https://huggingface.co/dianavdavidson/whisper-small_iv_hindi_only_62092_ratio_alldata_lr_1e-4_lgid_hi_epochs_100_FT
