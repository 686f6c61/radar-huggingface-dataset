# dianavdavidson/indicwav2vec-hindi-iv_hindi_only-62073-hinglish_mixed_scripts-alldata-1e-4-epochs-50-FT

## Resumen

El modelo `indicwav2vec-hindi-iv_hindi_only-62073-hinglish_mixed_scripts-alldata-1e-4-epochs-50-FT` es un ajuste fino (fine-tuning) del modelo base `ai4bharat/indicwav2vec-hindi` para la tarea de reconocimiento automático de voz (ASR) en hindi e inglés mezclado (hinglish) con escritura mixta. Ha sido desarrollado por el usuario `dianavdavidson` en Hugging Face y publicado bajo licencia Apache 2.0.

Se trata de un modelo basado en la arquitectura wav2vec2, con 315,5 millones de parámetros, lo que lo sitúa en la gama de modelos grandes para ASR. El nombre del repositorio indica que se entrenó con un conjunto de datos que combina habla en hindi (`iv_hindi_only`) y datos de hinglish con scripts mixtos (`hinglish_mixed_scripts`), aunque el dataset concreto no está documentado.

La relevancia de este modelo radica en su especialización para un dominio lingüístico poco cubierto por los modelos ASR genéricos: la mezcla de hindi e inglés, frecuente en la comunicación cotidiana en la India. Al estar basado en IndicWav2Vec, hereda la capacidad de procesar audio en lenguas indias, pero su ajuste fino busca mejorar la precisión en el habla mezclada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer con encoder convolucional y cuantizacion contrastiva) |
| Parametros totales | 315.554.545 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto; la ventana de contexto depende del preprocesado) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | hindi, hinglish (mezcla hindi-ingles) segun el nombre; no hay lista oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2, desarrollada por Meta AI, que combina un encoder convolucional para extraer representaciones de audio crudo con un transformer que modela dependencias temporales. El preentrenamiento original de IndicWav2Vec se realizó sobre 40 lenguas indias mediante aprendizaje contrastivo, y el modelo base `ai4bharat/indicwav2vec-hindi` es una versión específica para hindi.

El fine-tuning se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 1e-4, tamaño de lote de 16 (con acumulación de gradientes de 2 pasos, lote efectivo de 32), optimizador AdamW, scheduler constante con warmup de 500 pasos, 50 épocas y entrenamiento en precisión mixta (AMP). El dataset de entrenamiento no está documentado, aunque el nombre sugiere una combinación de datos de habla hindi (`iv_hindi_only`) y datos de hinglish con escritura mixta. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Reconocimiento automático de voz (ASR) para hindi e inglés mezclado (hinglish).
- Transcripción de audio con escritura mixta (devanagari y latina) en el texto de salida.
- Procesamiento de audio en tiempo real o por lotes mediante la API de transformers.
- Compatible con pipelines de Hugging Face para ASR.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje generativos.
- No tiene capacidades de vision, audio de entrada (solo audio como señal) ni generación de texto libre.

## Casos de uso

- Transcripción de reuniones y llamadas en entornos donde se mezcla hindi e inglés: el modelo puede convertir audio de conferencias o entrevistas en texto, útil para actas o análisis posterior.
- Subtitulado automático de vídeos en plataformas como YouTube o servicios de streaming, especializado en contenido en hinglish.
- Asistentes de voz para aplicaciones móviles o dispositivos domésticos que atienden a usuarios que hablan en mezcla de idiomas.
- Dictado de documentos o mensajes en hindi e inglés, permitiendo a usuarios escribir sin teclado en su idioma mixto habitual.
- Análisis de llamadas de servicio al cliente en empresas indias, para extraer información o medir la calidad de la interacción.
- Herramientas de accesibilidad para personas con dificultades de escritura, que puedan dictar en su lengua hablada.
- Investigación en ASR multilingüe y code-switching, sirviendo como referencia para estudios sobre mezcla de idiomas en el habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card aparece vacío (`results: []`). Sin embargo, el autor reporta en la sección de entrenamiento un valor de `Global Wer` (Word Error Rate) de 23,0092 en el conjunto de evaluación al final del entrenamiento, junto con una pérdida de validación de 0,4751. Este dato no es un benchmark estandarizado y no se compara con otros modelos.

La tabla de entrenamiento muestra la evolución de la pérdida y el WER a lo largo de las épocas:

| Training Loss | Epoch | Step | Validation Loss | Global Wer |
|:-------------:|:-----:|:----:|:---------------:|:----------:|
| 14.4476       | 1.0   | 540  | 0.7442          | 32.4568    |
| 1.7083        | 2.0   | 1080 | 0.5385          | 26.4073    |
| 1.4063        | 3.0   | 1620 | 0.5166          | 25.5889    |
| 1.3097        | 4.0   | 2160 | 0.4909          | 24.0237    |
| 1.2216        | 5.0   | 2700 | 0.4752          | 23.3702    |
| 1.1640        | 6.0   | 3240 | 0.4862          | 23.3888    |
| 1.1210        | 7.0   | 3780 | 0.4744          | 23.1648    |
| 1.0690        | 8.0   | 4320 | 0.4937          | 22.9127    |
| 1.0289        | 9.0   | 4860 | 0.4733          | 23.6751    |
| 1.0191        | 10.0  | 5400 | 0.4762          | 22.6140    |
| 0.9688        | 11.0  | 5940 | 0.4803          | 22.5797    |
| 0.9456        | 12.0  | 6480 | 0.4754          | 22.8754    |
| 0.8943        | 13.0  | 7020 | 0.4885          | 22.7011    |
| 0.8702        | 14.0  | 7560 | 0.4751          | 23.0092    |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315,5 millones de parámetros. En precisión fp32 (formato safetensors) ocupa aproximadamente 1,26 GB de memoria, por lo que se puede ejecutar en GPUs con al menos 2 GB de VRAM si se usa fp16 (0,63 GB) o cuantización int8 (0,32 GB), aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090) puede ejecutar el modelo sin problemas. Para procesamiento por lotes o audio largo se recomienda 4-8 GB de VRAM.
- Es compatible con GPUs de consumo (línea GeForce) y con GPUs de centro de datos (A100, H100) para despliegues a mayor escala.
- Opciones de despliegue: se puede utilizar con la librería `transformers` de Hugging Face, mediante el pipeline `automatic-speech-recognition` o con el endpoint compatible (según el tag `endpoints_compatible`). También es posible usar herramientas como `vLLM` o `TGI` para ASR, aunque no son las más habituales para wav2vec2; el soporte estándar es a través de transformers.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la longitud del audio y el preprocesado (extracción de características, beam search, etc.). En una GPU moderna (RTX 3060) se puede esperar una velocidad de procesamiento superior a tiempo real para audios de hasta 30 segundos.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos ASR para hindi/hinglish en la información proporcionada. Como referencia, se puede comparar con el modelo base `ai4bharat/indicwav2vec-hindi`, que comparte arquitectura y número de parámetros, pero sin el ajuste fino específico para hinglish. El WER reportado de 23,0% es un valor indicativo, aunque no se conoce el WER del modelo base en el mismo conjunto de evaluación, por lo que no es posible establecer una mejora cuantitativa.

Otros modelos ASR para hindi disponibles en el ecosistema (como `wav2vec2-large-xlsr-53` fine-tuneado para hindi o modelos basados en Whisper) podrían ser alternativas, pero no se dispone de datos de comparación directa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer la diversidad de hablantes, acentos, condiciones de grabación y posibles sesgos.
- El WER global de 23,0% en evaluación indica que el modelo comete errores en aproximadamente una de cada cuatro palabras, lo que puede ser insuficiente para aplicaciones que requieran alta precisión (p. ej., subtitulado profesional).
- No hay información sobre el comportamiento en entornos ruidosos, con acentos regionales del hindi o con habla rápida.
- El modelo está especializado en hinglish con escritura mixta; su rendimiento en hindi estándar o en inglés puro puede ser inferior.
- Al ser un modelo de ASR, no genera texto libre ni mantiene conversaciones; solo transcribe audio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el origen de los datos de entrenamiento si se utiliza en producción.
- No se han publicado resultados de benchmarks estandarizados (p. ej., MUCS, MSR, OpenSLR), por lo que su rendimiento relativo frente a otros modelos es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indicwav2vec-hindi-iv_hindi_only-62073-hinglish_mixed_scripts-alldata-1e-4-epochs-50-FT
- Repositorio de IndicWav2Vec (AI4Bharat): https://github.com/AI4Bharat/IndicWav2Vec
- Página de modelos de AI4Bharat: https://models.ai4bharat.org/
- Modelo base en Hugging Face: https://huggingface.co/ai4bharat/indicwav2vec-hindi
