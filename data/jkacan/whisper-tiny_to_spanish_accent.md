# jkacan/whisper-tiny_to_spanish_accent

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario jkacan en HuggingFace. Se trata de un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parámetros totales. El objetivo declarado del autor es adaptar el modelo base, originalmente entrenado por OpenAI para transcripción multilingüe, a un conjunto de datos propio denominado Spanish_english, presumiblemente orientado a manejar acentos del español.

El modelo es relevante por su tamaño extremadamente reducido (0,3 GB de repositorio), lo que lo hace apto para despliegues en entornos con recursos limitados, dispositivos de borde o aplicaciones en tiempo real donde la latencia prima sobre la precisión máxima. Sin embargo, la documentación es muy escasa: la model card está generada automáticamente por el Trainer de HuggingFace y contiene secciones sin completar ("More information needed"), lo que limita la evaluación rigurosa de su comportamiento real.

El ajuste se realizó durante 2000 pasos con un learning rate de 1e-05, batch size de 2 y semilla 42, alcanzando un WER de 12,26 sobre el conjunto de evaluación del dataset Spanish_english. La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre la composición del dataset y las condiciones de entrenamiento exige cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención estándar, diseñado para tomar espectrogramas mel de audio como entrada y generar tokens de texto. Whisper tiny es la variante más pequeña de la familia Whisper, con 4 capas en encoder y 4 en decoder, dimensión oculta de 384 y 6 cabezas de atención. El ajuste fino se realizó sobre el dataset Spanish_english, del que no se especifica composición, número de horas ni procedencia de las muestras.

El entrenamiento empleó el optimizador AdamW (variante fused), scheduler lineal con 500 pasos de warmup, 2000 pasos totales y batch size de 2. No se documenta si hubo aumentación de datos, limpieza de audio ni estrategia de partición train/test. La pérdida de validación descendió de 0,2657 (paso 1000) a 0,2460 (paso 2000), y el WER de 14,03 a 12,26, lo que indica que el modelo seguía mejorando al final del entrenamiento y probablemente se beneficiaría de más pasos. No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto en inglés, según el tag de idioma declarado.
- Ajuste orientado a acentos del español: el nombre del modelo y el dataset sugieren adaptación a variedades acentuales del español, aunque la model card declara únicamente el idioma "en".
- Generación de texto condicionada a audio: al ser un modelo seq2seq, puede generar transcripciones y, en teoría, tareas de traducción voz-a-texto heredadas de Whisper.
- Compatibilidad con el pipeline `automatic-speech-recognition` de transformers.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio en tiempo real ni modo thinking.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el tamaño de 37,76 M de parámetros y 0,3 GB permite ejecución en dispositivos de gama media con latencia baja, adecuado para dictado y notas rápidas.
- Subtitulado automático de vídeos cortos: integrable en pipelines de procesamiento por lotes donde se prioriza el coste computacional sobre la precisión máxima.
- Prototipado rápido de sistemas ASR: útil como línea base para comparar con modelos mayores antes de invertir en infraestructura.
- Preprocesamiento de audio en entornos de borde: su reducido consumo permite desplegarlo en Raspberry Pi o dispositivos IoT con aceleración limitada.
- Investigación sobre adaptación de acentos: sirve como punto de partida para estudiar técnicas de fine-tuning sobre variedades dialectales del español.
- Filtrado y clasificación de audio a gran escala: transcripciones aproximadas para indexar o categorizar grandes volúmenes de grabaciones donde el WER del 12 % es aceptable.
- Educación y accesibilidad: transcripción de clases o reuniones en entornos con recursos limitados, aceptando la necesidad de revisión humana posterior.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | Spanish English | test | 12,2637 |
| Loss (validación) | Spanish English | evaluación | 0,2460 |

Evolución durante el entrenamiento:

| Paso | Época | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9728 | 0,2605 | 0,2657 | 14,0299 |
| 2000 | 1,9455 | 0,1394 | 0,2460 | 12,2637 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 M de parámetros equivalen a unos 151 MB de pesos), y menos de 500 MB en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas o CPU.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos de borde; también es viable en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica directamente a ASR, llama.cpp no soporta Whisper de forma nativa, TGI no está orientado a este modelo; alternativas prácticas son transformers, faster-whisper y ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio, pero por el tamaño del modelo se esperan tiempos de inferencia muy bajos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Licencia | Disponibilidad | WER declarado |
|---|---|---|---|---|---|
| jkacan/whisper-tiny_to_spanish_accent | 37,76 M | ventanas de 30 s (heredado) | Apache 2.0 | HuggingFace | 12,26 (Spanish English) |
| openai/whisper-tiny | 39 M | ventanas de 30 s | Apache 2.0 | HuggingFace | no disponible en esta ficha |
| openai/whisper-base | 74 M | ventanas de 30 s | Apache 2.0 | HuggingFace | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s | Apache 2.0 | HuggingFace | no disponible en esta ficha |

La comparación directa de WER no es posible porque los benchmarks de los modelos base de OpenAI no se incluyen en la información proporcionada y porque el dataset Spanish_english es específico del autor. El modelo ajustado parte de whisper-tiny, por lo que su precisión en inglés general probablemente sea inferior a whisper-base o whisper-small, pero su ventaja radica en el ajuste específico al dominio acentual.

## Limitaciones y advertencias

- Documentación insuficiente: la model card contiene secciones vacías ("More information needed"), lo que impide conocer la composición del dataset, el preprocesamiento y las condiciones exactas de evaluación.
- Idioma declarado como "en" pese al nombre "Spanish": existe una contradicción entre el identificador del modelo y el tag de idioma, lo que genera incertidumbre sobre su comportamiento real en español.
- WER del 12,26 % no verificado: el resultado está marcado como `verified: false` en el model-index, por lo que debe tomarse como declaración del autor.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente en segmentos con ruido o silencios.
- Sesgos desconocidos: al no documentarse la procedencia del dataset Spanish_english, no es posible evaluar sesgos de género, dialectales o sociolectales.
- Limitación de contexto: Whisper tiny procesa ventanas de 30 segundos; audios más largos requieren segmentación manual.
- Uso comercial permitido por Apache 2.0, pero la falta de garantías y documentación desaconseja su uso en producción crítica sin validación propia.
- Entrenamiento corto: 2000 pasos y batch size de 2 sugieren un ajuste ligero; el modelo probablemente no ha convergido del todo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkacan/whisper-tiny_to_spanish_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
