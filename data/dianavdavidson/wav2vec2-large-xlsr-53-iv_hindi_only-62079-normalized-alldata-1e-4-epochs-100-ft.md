# dianavdavidson/wav2vec2-large-xlsr-53-iv_hindi_only-62079-normalized-alldata-1e-4-epochs-100-FT

## Resumen

Modelo de reconocimiento automático de voz (ASR) en hindi, resultado del fine-tuning de `facebook/wav2vec2-large-xlsr-53` (XLSR-53), el modelo de representación de voz multilingüe de Meta preentrenado en 53 idiomas mediante aprendizaje contrastivo autosupervisado. Lo desarrolla dianavdavidson y, según el nombre del modelo, parece haber sido entrenado con el subconjunto en hindi del dataset IndicVoices (las siglas "iv" y la referencia a "hindi_only" apuntan en esa dirección), con normalización aplicada a todos los datos. La model card no confirma el dataset.

Con 315,5 millones de parámetros y arquitectura wav2vec 2.0, el modelo alcanza un WER global de 35,96 y una loss de 0,6907 en el conjunto de evaluación. Se distribuye bajo licencia Apache 2.0 en formato safetensors, compatible con la librería transformers. Su relevancia radica en ser un intento de adaptar XLSR-53 al hindi, un idioma con recursos limitados en ASR, aunque el WER elevado y la ausencia de validación comunitaria (0 descargas, 0 likes) lo convierten en un modelo experimental que requiere evaluación adicional antes de su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (XLSR-53) |
| Parametros totales | 315.512.520 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No especificada (modelo de audio, acepta audios de duración variable a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (según el nombre del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec 2.0, que combina un extractor de características basado en CNN con un encoder Transformer. El modelo base XLSR-53 fue preentrenado por Meta de forma autosupervisada sobre aproximadamente 56.000 horas de audio en 53 idiomas, aprendiendo representaciones de voz robustas mediante un objetivo de contraste entre latentes cuantizados y contextualizados. Para el ASR, el fine-tuning añade una cabeza de clasificación CTC sobre las representaciones del encoder.

El fine-tuning se realizó durante 100 épocas con una tasa de aprendizaje de 1e-4, tamaño de lote de 16 (32 efectivo con acumulación de gradientes de 2 pasos), optimizador AdamW con betas (0,9; 0,999), scheduler constante con warmup de 500 pasos y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado en la model card; el nombre del modelo sugiere datos exclusivamente en hindi del dataset IndicVoices con normalización aplicada a todos los datos, pero esto no está confirmado. La tabla de resultados solo muestra hasta la época 11, aunque los hiperparámetros indican 100 épocas, lo que deja sin documentar la evolución posterior del entrenamiento.

## Capacidades

- Reconocimiento automático de voz (ASR) en hindi: transcribe audio en hindi a texto.
- Procesamiento de audio a 16 kHz: compatible con el formato estándar de wav2vec 2.0.
- Integración con transformers: se puede usar directamente con la pipeline `automatic-speech-recognition` de Hugging Face.
- Adaptación idiomática específica: fine-tuning orientado a hindi, presumiblemente con mejor rendimiento que el modelo base multilingüe en este idioma (aunque no hay benchmarks comparativos documentados).
- No soporta tool calling ni razonamiento multi-paso: es un modelo de ASR puro, no un LLM.

## Casos de uso

- Transcripción de reuniones y entrevistas en hindi: el modelo puede transcribir grabaciones de audio a 16 kHz para generar actas y notas. Su WER de ~36 limita su uso a audio de buena calidad y con hablantes nativos claros.
- Subtitulado automático de vídeos en hindi: integrable en pipelines de postproducción para generar subtítulos, aunque requerirá corrección manual debido al WER.
- Transcripción de llamadas de atención al cliente: permite archivar y analizar conversaciones telefónicas en hindi para control de calidad y análisis de sentimiento posterior.
- Archivado y búsqueda de contenido audiovisual en hindi: convierte audio en texto indexable para motores de búsqueda internos en plataformas de medios.
- Herramientas de accesibilidad: puede servir como base para aplicaciones de transcripción para personas con discapacidad auditiva, siempre que se combine con un postprocesado de corrección.
- Investigación en ASR para idiomas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning y adaptación al hindi y otros idiomas indios, gracias a su licencia Apache 2.0.

## Benchmarks y rendimiento

La model card no incluye una tabla de benchmarks comparativa con otros modelos, pero reporta los siguientes resultados en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,6907 |
| WER global | 35,9644 |

La progresión del entrenamiento muestra una mejora del WER desde 99,98 en la época 1 hasta 35,96 en la época 11, con la mejor WER registrada en la época 8 (34,30):

| Training Loss | Época | Paso | Validation Loss | Global Wer |
|:-------------:|:-----:|:----:|:---------------:|:----------:|
| 13,2706 | 1,0 | 540 | 2,5987 | 99,9815 |
| 3,4143 | 2,0 | 1080 | 0,9368 | 51,5660 |
| 2,0940 | 3,0 | 1620 | 0,7728 | 45,2065 |
| 1,7474 | 4,0 | 2160 | 0,7075 | 39,0102 |
| 1,5349 | 5,0 | 2700 | 0,6690 | 37,2794 |
| 1,3923 | 6,0 | 3240 | 0,6491 | 35,6041 |
| 1,2878 | 7,0 | 3780 | 0,6389 | 34,7756 |
| 1,1903 | 8,0 | 4320 | 0,6526 | 34,2983 |
| 1,1363 | 9,0 | 4860 | 0,6532 | 35,7611 |
| 1,1413 | 10,0 | 5400 | 0,6830 | 35,4901 |
| 1,1045 | 11,0 | 5940 | 0,6907 | 35,9644 |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (315M parámetros), más activaciones; cabe en cualquier GPU consumer con 4 GB o más de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.). Para procesamiento por lotes, se recomienda 8 GB o más.
- Inferencia en CPU: viable para transcripción por lotes sin requisitos de latencia estrictos, aunque significativamente más lenta que en GPU.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints, o exportación a ONNX para optimización en entornos de producción.
- No es compatible con vLLM ni llama.cpp, que están orientados a modelos de lenguaje y no a arquitecturas de ASR como wav2vec 2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER (evaluación) | Licencia |
|---|---|---|---|---|
| Este modelo (fine-tune hindi) | 315,5M | Hindi | 35,96 | Apache 2.0 |
| facebook/wav2vec2-large-xlsr-53 (base) | 315,5M | 53 idiomas | No documentado para hindi | Apache 2.0 |
| Otros fine-tunes de dianavdavidson (hinglish, IndicVoices) | 315,5M | Hinglish | No documentado | Apache 2.0 |

El modelo base XLSR-53 no está adaptado específicamente al hindi, por lo que el fine-tuning debería mejorar su rendimiento en este idioma. Sin embargo, sin benchmarks comparativos documentados, no es posible cuantificar esta mejora ni comparar con otros modelos ASR en hindi como Whisper o IndicWav2Vec.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", lo que impide evaluar la calidad y representatividad de los datos y dificulta la reproducibilidad.
- WER elevado (35,96): no apto para transcripción precisa en producción sin corrección humana sustancial.
- Sin validación comunitaria: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ni validado por otros usuarios.
- Idiomas limitados al hindi: no soporta otros idiomas, y su rendimiento en variantes dialectales o registros informales (hinglish) no está documentado.
- Riesgo de alucinación: como todos los modelos ASR, puede producir transcripciones incorrectas, especialmente con audio ruidoso, acentos no representados en los datos de entrenamiento o solapamiento de hablantes.
- Model card incompleta: la mayoría de las secciones contienen "More information needed", lo que sugiere una documentación insuficiente por parte del autor.
- Entrenamiento truncado en la documentación: la tabla de resultados solo cubre hasta la época 11 de las 100 configuradas, sin datos sobre la evolución posterior.
- Uso comercial permitido: la licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre los datos de entrenamiento puede plantear riesgos legales si el audio contenía contenido protegido por derechos de autor.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/dianavdavidson/wav2vec2
