# Ansu/whisper-large-v2-basque

## Resumen

El modelo `Ansu/whisper-large-v2-basque` es un ajuste fino (fine-tuning) del sistema de reconocimiento automático de voz (ASR) Whisper Large v2 de OpenAI, especializado en la transcripción de audio en euskera. Ha sido desarrollado por Ansu (Andoni Sudupe) en el marco del proyecto ILENIA, una iniciativa para impulsar recursos lingüísticos en lenguas cooficiales de España. El modelo resuelve el problema de la falta de sistemas ASR de alta calidad para euskera, aprovechando la arquitectura robusta de Whisper y adaptándola a este idioma de bajos recursos.

Con 1.609.692.160 parámetros, el modelo mantiene la arquitectura encoder-decoder de Whisper Large v2, con una ventana de contexto de 30 segundos de audio. Se entrenó sobre la porción en euskera de Mozilla Common Voice 13.0, alcanzando un WER del 6,45 % en el conjunto de evaluación del propio entrenamiento y un 11,34 % en el split de evaluación de Common Voice según los datos del proyecto ILENIA. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integrar transcripción en euskera en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper Large v2) |
| Parametros totales | 1.609.692.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizables a GGUF/INT8) |
| Idiomas soportados | Euskera (fine-tuning); el modelo base soporta 99 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Large v2 de OpenAI: un transformer encoder-decoder con 32 capas en el encoder y 32 en el decoder, dimensiones ocultas de 1280 y 20 cabezas de atención. Whisper se entrenó originalmente con 680.000 horas de audio débilmente supervisado en múltiples idiomas, y su variante large-v2 es la segunda iteración de la serie large, con mejoras en la robustez frente a acentos y ruido. El ajuste fino para euskera se realizó sobre el corpus Common Voice 13.0, con un total de 10.000 pasos de entrenamiento, batch size de 512 (256 por dispositivo, 2 GPUs), learning rate de 1e-5 con scheduler lineal y warmup de 500 pasos, y precisión mixta nativa (AMP). No se aplicaron técnicas de RLHF ni DPO; el entrenamiento fue supervisado estándar con pérdida de entropía cruzada. La model card no especifica el número de horas de audio ni la composición exacta del dataset, aunque la búsqueda web confirma que se usó la porción en euskera de Common Voice 13.0.

## Capacidades

- Transcripción de voz a texto en euskera con alta precisión (WER 6,45 % en validación del entrenamiento).
- Reconocimiento de voz multilingüe heredado del modelo base, aunque el fine-tuning puede degradar el rendimiento en otros idiomas.
- Identificación de idioma (capacidad del modelo base, no garantizada tras el ajuste).
- Traducción de voz a texto a inglés (capacidad del modelo base, no evaluada en este fine-tuning).
- Manejo de audio de hasta 30 segundos por segmento; audios más largos requieren segmentación.
- Robustez frente a ruido y acentos heredada de Whisper Large v2.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en euskera: el modelo puede procesar grabaciones de audio de hasta 30 segundos por segmento, por lo que se integra en pipelines de segmentación para transcribir reuniones completas con alta fidelidad, útil para actas automáticas en administraciones públicas vascas.
- Subtitulado automático de vídeos en euskera: al generar transcripciones con marcas de tiempo, permite crear subtítulos para contenidos audiovisuales en plataformas como YouTube o servicios de streaming, reduciendo costes de subtitulado manual.
- Asistente de voz para servicios públicos: integrado en sistemas de atención ciudadana en euskera, puede transcribir consultas de usuarios y alimentar motores de respuesta, mejorando la accesibilidad lingüística.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en euskera para indexación y búsqueda por texto, facilitando la recuperación de información en bibliotecas y archivos.
- Aplicaciones de dictado en euskera: integración en procesadores de texto o herramientas de productividad para dictar en euskera, con corrección posterior mediante modelos de lenguaje.
- Investigación lingüística y sociolingüística: transcripción de entrevistas y grabaciones de campo en euskera para análisis de corpus, con la ventaja de una licencia Apache 2.0 que permite uso académico y comercial sin restricciones.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks en el campo `model-index` (lista vacía). Sin embargo, el autor reporta en la sección de resultados de entrenamiento un WER de 6,4467 y una loss de 0,2186 en el conjunto de evaluación. Según la ficha del proyecto ILENIA, el modelo alcanza un WER del 11,34 % en el split de evaluación de Common Voice 13.0. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Metrica | Valor | Fuente |
|---|---|---|
| WER (validación del entrenamiento) | 6,45 % | Model card del autor |
| Loss (validación del entrenamiento) | 0,2186 | Model card del autor |
| WER (evaluación Common Voice 13.0) | 11,34 % | Proyecto ILENIA |

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB en fp16 para inferencia con batch size 1; en fp32 se requieren unos 20 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 12 GB de VRAM para fp16.
- Cabe en GPUs de consumo como RTX 3090 (24 GB) y RTX 4090 (24 GB) en fp16; en cuantización INT8 podría caber en 8 GB, pero no se proporcionan pesos cuantizados.
- Opciones de despliegue: vLLM (soporta Whisper), Hugging Face Transformers, TGI, llama.cpp (con conversión a GGUF), Ollama (con conversión), y la librería oficial `openai-whisper`.
- Latencia y throughput: no disponible en la información proporcionada; en una RTX 4090 se estima una latencia de ~1-2 segundos por segmento de 30 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de ASR en euskera en la información proporcionada. El autor ha publicado variantes como `Ansu/whisper-large-v3-basque` y `Ansu/whisper-medium-basque`, pero no se incluyen sus métricas. Como referencia, el modelo base `openai/whisper-large-v2` tiene los mismos parámetros y arquitectura, pero no está especializado en euskera. No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con la porción en euskera de Common Voice 13.0, que es un corpus de lectura de frases cortas; puede degradarse en habla espontánea, conversacional o con vocabulario especializado.
- El WER reportado en la model card (6,45 %) proviene del conjunto de validación del propio entrenamiento y puede no reflejar el rendimiento en datos reales; el 11,34 % de ILENIA es más realista.
- La ventana de contexto de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en los límites de segmento.
- El fine-tuning puede haber reducido la capacidad multilingüe del modelo base; no se ha evaluado su rendimiento en otros idiomas.
- No se han publicado análisis de sesgos; el modelo puede reflejar los sesgos presentes en Common Voice (predominantemente hablantes jóvenes y con acceso a tecnología).
- Riesgo de alucinación en silencios o ruido, común en modelos Whisper; se recomienda filtrar segmentos de baja confianza.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de OpenAI tiene términos adicionales que pueden afectar a la redistribución; se recomienda revisar la licencia de Whisper.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ansu/whisper-large-v2-basque)
- [Ficha del proyecto ILENIA](https://proyectoilenia.es/en/recurso/whisper-large-v2-basque/)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Discusión sobre el modelo large-v2](https://github.com/openai/whisper/discussions/661)
- [Perfil del autor en Hugging Face](https://huggingface.co/Ansu)
