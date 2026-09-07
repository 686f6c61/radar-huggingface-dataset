# dianavdavidson/whisper-medium_iv_hindi_vaani_62509_ratio_alldata_lr_1e-4_lgid_None_mixratio_0.75_FT

## Resumen

Este modelo es un ajuste fino (fine-tune) de `openai/whisper-medium`, realizado por el usuario `dianavdavidson`, para el reconocimiento automático de voz (ASR) en hindi. Whisper es una familia de modelos transformer encoder-decoder desarrollada por OpenAI que procesa espectrogramas mel de audio y genera transcripciones de texto. Este fine-tune se ha entrenado sobre un conjunto de datos no especificado en la model card (en el campo `dataset` aparece "None"), pero el nombre del modelo sugiere que está orientado a hindi (contiene "iv_hindi_vaani"). El modelo tiene 763.857.920 parámetros totales y se distribuye con pesos en formato `safetensors` bajo licencia Apache 2.0. La relevancia de este modelo radica en que ofrece una variante especializada de Whisper para hindi, un idioma con menos recursos que el inglés, y puede ser útil para tareas de transcripción en ese idioma. Sin embargo, la información disponible sobre el dataset, los idiomas exactos y los benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.857.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana del encoder) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 99 idiomas, pero el fine-tune no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Whisper Medium, un transformer encoder-decoder con 24 capas en el encoder y 6 en el decoder, que toma como entrada espectrogramas mel de 80 canales y genera texto. El encoder procesa la señal de audio en ventanas de 30 segundos, y el decoder produce la transcripción autoregresiva. Este fine-tune no introduce cambios arquitectónicos: es un ajuste de los pesos del modelo base sobre un conjunto de datos de entrenamiento no especificado en la información disponible. Según la model card, el entrenamiento se realizó con Transformers 5.13.0 y PyTorch 2.6.0+cu124, usando los siguientes hiperparámetros: learning rate 0.0001, tamaño de batch 16, acumulación de gradientes 2 (batch efectivo de 32), 100 épocas, scheduler constante con warmup de 500 pasos y optimizador AdamW. No se indica si se aplicaron técnicas como RLHF o DPO; se trata de un fine-tune supervisado estándar.

## Capacidades

- Transcripción de audio a texto en hindi, especializada en el dataset de entrenamiento (no especificado).
- Reconocimiento automático de voz (ASR) en la modalidad de 30 segundos por ventana, con soporte para transcripción de audio largo mediante segmentación.
- El modelo base Whisper Medium incluye capacidades de detección de idioma y traducción de voz a texto en inglés, aunque no se confirma si estas funciones se mantienen tras el fine-tune.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de ASR, no un modelo de lenguaje general.
- No se han documentado capacidades de visión, audio multimodal o generación de texto libre más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en hindi: el modelo puede procesar grabaciones de audio de reuniones o entrevistas y generar transcripciones textuales, lo que facilita la generación de actas o la búsqueda de contenido.
- Subtitulado automático de vídeos en hindi: al integrar el modelo en un pipeline de procesamiento de vídeo, se pueden generar subtítulos sincronizados para contenido audiovisual, útil para plataformas de streaming o vídeo bajo demanda.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede convertir audio en texto en tiempo real para ofrecer subtítulos en directo en aplicaciones de videollamada o retransmisiones.
- Análisis de llamadas de atención al cliente en hindi: las empresas pueden transcribir llamadas de servicio para analizar el sentimiento, extraer temas recurrentes o entrenar sistemas de clasificación.
- Asistente de dictado en hindi: integrado en aplicaciones de productividad, permite dictar texto en hindi y convertirlo en documentos escritos, mejorando la eficiencia para usuarios que prefieren hablar.
- Transcripción de podcasts y contenido educativo en hindi: los creadores de contenido pueden convertir episodios de audio en texto para publicar notas, mejorar el SEO o facilitar el estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de la model card aparece vacío (`results: []`). Sin embargo, el autor declara en la model card un valor de pérdida y de WER (Word Error Rate) sobre el conjunto de evaluación, que se detallan a continuación como resultados declarados, no como benchmarks públicos:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.3762 |
| Global Wer | 28.5523 |

Estos valores se obtuvieron tras 4 épocas de entrenamiento, según la tabla de resultados de la model card. No se dispone de comparativas con modelos similares en el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: en precisión FP16, los pesos del modelo ocupan aproximadamente 1.5 GB; con activaciones y overhead de inferencia, se recomienda al menos 4 GB de VRAM para ejecutar el modelo con comodidad.
- GPU recomendadas: RTX 3060 (12 GB), T4 (16 GB), A10G, o cualquier GPU con al menos 4 GB de VRAM. Para procesamiento por lotes o audio largo, se recomienda 8 GB o más.
- El modelo puede ejecutarse en GPU de consumo, como la RTX 3060, RTX 4060 o superiores. También es viable en CPU, aunque la velocidad de inferencia será notablemente menor.
- Opciones de despliegue: Hugging Face Transformers (Pytorch), `faster-whisper` (basado en CTranslate2), `whisper.cpp` para CPU, o `vLLM` (aunque no es la opción habitual para Whisper).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| openai/whisper-medium (base) | 769 M | 30 s | MIT | Hugging Face |
| dianavdavidson/whisper-medium_iv_hindi_vaani (este modelo) | 763.857.920 | 30 s | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | 30 s | MIT | Hugging Face |

El modelo es un fine-tune del Whisper Medium original, con una diferencia de parámetros menor (763 M frente a 769 M) debido a la estructura de la arquitectura. No se dispone de datos de rendimiento comparables entre estos modelos en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: Whisper puede presentar sesgos en el reconocimiento de acentos, dialectos o habla no nativa. El fine-tune en hindi puede heredar o amplificar sesgos del dataset de entrenamiento, que no está especificado.
- Riesgo de alucinacion: como otros modelos de ASR, Whisper puede generar texto alucinado en fragmentos de silencio o ruido, especialmente si el audio es de baja calidad.
- Limitaciones de contexto: la ventana de 30 segundos obliga a segmentar el audio largo, lo que puede afectar a la coherencia en transcripciones extensas.
- Limitaciones de idioma: aunque el modelo base soporta 99 idiomas, este fine-tune está orientado a hindi; su rendimiento en otros idiomas probablemente sea inferior al del modelo base.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con la atribución y las condiciones de la licencia.
- Caveat para produccion: el dataset de entrenamiento no está documentado ("None"), lo que dificulta la reproducibilidad y la evaluación de la generalización. El WER declarado (28.55) es moderado y puede no reflejar el rendimiento en datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/whisper-medium_iv_hindi_vaani_62509_ratio_alldata_lr_1e-4_lgid_None_mixratio_0.75_FT
- Variante con mixratio 0.25: https://huggingface.co/dianavdavidson/whisper-medium_iv_hindi_vaani_62509_ratio_alldata_lr_1e-4_lgid_None_mixratio_0.25_FT
