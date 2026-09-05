# dianavdavidson/indic_whisper_hi_multi_gpu_iv_hindi_only_62426_ratio_alldata_lr_1e-4_lgid_hi_epochs_100_FT

## Resumen

Este modelo es un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura Whisper, ajustado mediante fine-tuning para el idioma hindi. Lo desarrolla el usuario dianavdavidson a partir del modelo base parthiv11/indic_whisper_hi_multi_gpu, que a su vez es una adaptación de Whisper para lenguas índicas. El modelo cuenta con 763.857.920 parámetros, un tamaño que corresponde a la variante media de Whisper (Whisper medium), y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones.

El objetivo del modelo es la transcripción de audio en hindi. Se entrenó durante 100 épocas con un conjunto de datos no especificado, alcanzando un Word Error Rate (WER) global de 25,9022 % en el conjunto de evaluación. Aunque no se han publicado benchmarks estándar ni documentación detallada, el modelo puede resultar útil para aplicaciones de transcripción, subtitulado o análisis de audio en hindi, siempre que se acepte una tasa de error moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de entrada de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi (inferido del nombre del modelo; no declarado en la ficha) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Arquitectónicamente, el modelo sigue el diseño de Whisper: un transformer con codificador y decodificador, entrenado para mapear espectrogramas de mel de audio a texto. En este caso, el modelo se ha ajustado sobre el checkpoint parthiv11/indic_whisper_hi_multi_gpu, que ya estaba adaptado a lenguas índicas. No se ha publicado información sobre la composición del dataset de fine-tuning ni su procedencia, por lo que no es posible evaluar la calidad ni la cobertura de los datos.

El entrenamiento se realizó con una tasa de aprendizaje de 0,0001, tamaño de lote efectivo de 32 (16 con acumulación de gradientes de 2), optimizador AdamW fusionado y programador de tasa de aprendizaje constante con 500 pasos de calentamiento. Se ejecutaron 100 épocas, aunque la mejor métrica de WER se obtuvo en la época 7, con un valor de 25,9022 %. No se documentan técnicas de regularización, aumentación de datos ni alineación por preferencias (RLHF/DPO), ya que se trata de un modelo de ASR y no de un modelo de lenguaje.

## Capacidades

- Transcripción de voz en hindi: convierte audio a texto, con puntuación y marcas de tiempo.
- Herencia de Whisper: el modelo conserva la capacidad de manejar segmentos de audio de hasta 30 segundos por pasada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de reconocimiento de voz, no un modelo de lenguaje general.
- No tiene capacidades de visión ni de generación de lenguaje libre.
- Procesamiento de audio: acepta señales de audio y devuelve texto a través de la librería transformers.
- No se han documentado capacidades adicionales (agentes, visión, audio multimodal, etc.) en la información disponible.

## Casos de uso

- Transcripción de reuniones en hindi: el modelo puede procesar grabaciones de reuniones y generar actas textuales. Su ventana de 30 segundos por segmento permite transcribir audio largo mediante segmentación, y el WER de 25,90 % es aceptable para revisiones humanas posteriores.
- Subtitulado automático de vídeos en hindi: al integrarse con herramientas de segmentación de audio, el modelo puede generar subtítulos sincronizados. Es adecuado para contenido de vídeo en hindi, como noticias, tutoriales o entretenimiento.
- Accesibilidad para personas con discapacidad auditiva: permite convertir audio en texto en tiempo real o en diferido, facilitando la accesibilidad de contenido audiovisual en hindi. La licencia MIT facilita su integración en aplicaciones sin coste de licencia.
- Análisis de llamadas de atención al cliente: el modelo puede transcribir llamadas en hindi para extraer información, realizar análisis de sentimiento o detectar problemas recurrentes. Su tamaño permite ejecutarlo en GPUs de consumo, lo que abarata el despliegue.
- Dictado por voz en hindi: puede integrarse en aplicaciones de dictado para permitir escribir texto mediante voz. Al ser un modelo de ASR, responde con texto directamente, y su latencia es razonable en GPUs modestas.
- Transcripción de podcasts y entrevistas en hindi: el modelo puede procesar episodios largos mediante segmentación de audio, generando transcripciones que facilitan la indexación y búsqueda de contenido.
- Investigación en lingüística computacional: sirve como punto de partida para estudiar el reconocimiento de voz en hindi, comparar con otros modelos o realizar fine-tuning adicional. El acceso abierto y la licencia MIT permiten experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo, ya que se trata de un sistema de ASR. El autor reporta las siguientes métricas de evaluación, obtenidas con el conjunto de evaluación del fine-tuning:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0,2711 |
| WER global | 25,9022 % |

La evolución del WER durante las primeras 10 épocas del entrenamiento es la siguiente:

| Epoca | Loss de entrenamiento | Loss de validacion | WER global |
|---|---|---|---|
| 1 | 0,3734 | 0,2564 | 31,7558 % |
| 2 | 0,3639 | 0,2323 | 27,9529 % |
| 3 | 0,2567 | 0,2258 | 26,7367 % |
| 4 | 0,1914 | 0,2298 | 26,0900 % |
| 5 | 0,1490 | 0,2406 | 26,2163 % |
| 6 | 0,1218 | 0,2542 | 26,9738 % |
| 7 | 0,0999 | 0,2711 | 25,9022 % |
| 8 | 0,0852 | 0,2702 | 26,5088 % |
| 9 | 0,0753 | 0,2811 | 26,0531 % |
| 10 | 0,0660 | 0,2891 | 26,5950 % |

## Requisitos de hardware

- VRAM estimada: para los 763,86 millones de parámetros, en precisión fp32 los pesos ocupan aproximadamente 3,05 GB; en fp16, aproximadamente 1,53 GB. Para inferencia con un lote pequeño, se recomienda al menos 4 GB de VRAM en fp16 y 6 GB en fp32. Estas cifras son orientativas y no han sido verificadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3060, RTX 4060, Tesla T4, etc.) puede ejecutar el modelo en fp16. Para procesar audio largo o lotes grandes, se recomienda una GPU con 8-12 GB (RTX 3080, A10, etc.).
- Si cabe en consumer GPU: sí, en GPUs de consumo de gama media con al menos 4 GB de VRAM.
- Opciones de despliegue: Transformers (pipeline de ASR), faster-whisper, whisper.cpp (si se convierte a GGUF), o la implementación original de OpenAI Whisper. No se ha documentado compatibilidad con vLLM ni TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dianavdavidson/indic_whisper_hi_multi_gpu_iv_hindi_only_62426... (este modelo) | 763.857.920 | 30 s | Hindi (inferido) | MIT | HuggingFace |
| openai/whisper-medium | 769.000.000 (aprox.) | 30 s | Multilingüe | MIT | HuggingFace |
| parthiv11/indic_whisper_hi_multi_gpu | no disponible | no disponible | Hindi (inferido) | no disponible | HuggingFace |
| dianavdavidson/whisper-small_iv_hindi_only_62092... | 244.000.000 (aprox., Whisper small) | 30 s | Hindi (inferido) | MIT | HuggingFace |

No se dispone de resultados de WER comparables para los modelos alternativos en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se sabe qué datos se usaron, lo que impide evaluar sesgos lingüísticos o de acento.
- WER de 25,9022 %: significa que aproximadamente una de cada cuatro palabras se transcribe mal, lo que puede ser inaceptable para usos críticos sin revisión humana.
- Documentación incompleta: la model card indica "More information needed" para descripción, usos previstos y datos de entrenamiento.
- Solo hindi: el nombre sugiere que solo está entrenado para hindi, aunque no está confirmado. Puede degradarse con otros idiomas.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas, lo que limita el despliegue en dispositivos con poca memoria.
- Riesgo de alucinación en audio silencioso o ruidoso: como todos los modelos Whisper, puede generar texto en segmentos de silencio o con ruido.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de soporte ni de precisión.
- No se han documentado pruebas de robustez frente a ruido, acentos o variaciones dialectales del hindi.

## Enlaces

- HuggingFace: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_iv_hindi_only_62426_ratio_alldata_lr_1e-4_lgid_hi_epochs_100_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
