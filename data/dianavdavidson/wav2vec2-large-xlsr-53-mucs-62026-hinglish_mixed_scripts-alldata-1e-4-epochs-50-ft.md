# dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-alldata-1e-4-epochs-50-FT

## Resumen

Este modelo es un fine-tuning de `facebook/wav2vec2-large-xlsr-53` para reconocimiento automático de voz (ASR) en hinglish, es decir, la mezcla de hindi e inglés que se habla de forma coloquial en la India, con transcripción en escritura mixta (devanagari y latina). Lo ha publicado el usuario `dianavdavidson` en Hugging Face, aunque sin documentación adicional más allá de la generada automáticamente por el Trainer. El modelo base, wav2vec2-large-xlsr-53, es un transformer preentrenado de forma autosupervisada sobre 56 000 horas de audio multilingüe (Multilingual LibriSpeech, CommonVoice y BABEL) y cuenta con 315 millones de parámetros.

El interés de este checkpoint reside en su objetivo: adaptar un modelo multilingüe a un dominio lingüístico poco cubierto como el hinglish. Sin embargo, los resultados de entrenamiento publicados indican un sobreajuste severo: la pérdida de validación sube de 1.17 a 4.05 y el WER global pasa de 42.9 % en la época 2 a 100 % en la época 5. Esto hace que el modelo no sea utilizable para tareas reales de transcripción en su estado actual. No se han publicado métricas de evaluación independientes ni datos sobre el dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional + transformer, preentrenado con aprendizaje contrastivo, fine-tuning con CTC) |
| Parametros totales | 315.550.445 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de wav2vec2, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | hinglish (mezcla hindi-inglés), declarado en el nombre pero no en la model card; el modelo base XLSR-53 soporta 53 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wav2Vec2 emplea un encoder convolucional que procesa la forma de onda bruta y un transformer que modela las dependencias temporales. El preentrenamiento original se realiza mediante una tarea contrastiva: predecir unidades latentes cuantizadas a partir de contextos enmascarados. En este fine-tuning, se añade una cabeza de clasificación CTC (Connectionist Temporal Classification) sobre las representaciones del transformer para producir transcripciones de texto.

El entrenamiento se llevó a cabo con los siguientes hiperparámetros: tasa de aprendizaje 1e-4, tamaño de batch 16 (32 con acumulación de gradientes de 2 pasos), 50 épocas, scheduler constante con warmup de 500 pasos, optimizador AdamW y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card; el nombre del repositorio sugiere que proviene de la colección "mucs" (posiblemente una referencia a un corpus multilingüe). Los resultados de entrenamiento muestran una caída drástica de la pérdida de entrenamiento (de 2.25 a 7.94 en la época 5) y un empeoramiento simultáneo de la pérdida de validación (de 1.32 a 4.05), lo que indica un claro sobreajuste. El WER global alcanza el 100 % en la última época, señal de que el modelo deja de producir transcripciones válidas.

## Capacidades

- Reconocimiento de voz automático (ASR) orientado a hinglish con escritura mixta, aunque el rendimiento real es nulo según los WER reportados.
- Transcripción de audio a texto en tiempo real o por lotes mediante la API de Transformers.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de transcripción.
- Capacidades multilingües heredadas del modelo base XLSR-53, pero el fine-tuning reduce su aplicabilidad a un solo dominio lingüístico.
- No incluye modo de pensamiento, visión ni audio adicional más allá del procesamiento de voz.

## Casos de uso

- Transcripción de conversaciones coloquiales en hinglish: en teoría, podría usarse para subtitular vídeos o reuniones donde se mezclan hindi e inglés, pero el WER del 100 % impide cualquier uso práctico.
- Asistentes de voz en aplicaciones móviles dirigidas a usuarios de la India: requeriría un modelo con WER inferior al 20 % para ser viable.
- Generación de subtítulos automáticos para contenido multimedia en plataformas de streaming: necesitaría una evaluación rigurosa sobre datos reales.
- Análisis de llamadas de atención al cliente en empresas indias: el modelo podría transcribir interacciones bilingües, pero su estado actual no lo permite.
- Investigación académica sobre ASR para lenguas de bajos recursos: el checkpoint puede servir como punto de partida para estudiar el sobreajuste en fine-tuning de wav2vec2.
- Prototipado de pipelines de ASR con Transformers: se puede cargar el modelo para probar la integración técnica, aunque los resultados serán incorrectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente los resultados de entrenamiento, que se muestran a continuación:

| Época | Pérdida de entrenamiento | Pérdida de validación | WER global |
|:-----:|:------------------------:|:---------------------:|:----------:|
| 1     | 2.2491                   | 1.3161                | 48.5539    |
| 2     | 1.6337                   | 1.1682                | 42.9188    |
| 3     | 1.6437                   | 1.3136                | 49.6110    |
| 4     | 3.2618                   | 2.7009                | 94.4889    |
| 5     | 7.9446                   | 4.0459                | 100.0      |

Estos valores no constituyen una evaluación formal y muestran una degradación progresiva que imposibilita el uso del modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315 M parámetros, lo que ocupa aproximadamente 1.2 GB en precisión FP32 y unos 0.6 GB en FP16. Con la entrada de audio y las activaciones, se recomienda al menos 4 GB de VRAM para inferencia básica.
- GPU recomendadas: cualquier GPU con 4 GB o más, p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4090, A100, H100. En CPU es posible ejecutarlo, pero la latencia será alta.
- Cabe en GPUs de consumo como la RTX 3060 (12 GB) o la RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: Transformers (PyTorch), torchaudio, y potencialmente ONNX o TensorRT mediante conversión. No se han publicado archivos GGUF ni compatibilidad con llama.cpp.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud del audio. Para un modelo de este tamaño, se espera una velocidad de procesamiento en tiempo real o superior en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|--------|------------|----------|----------|----------------|
| Este checkpoint (dianavdavidson) | 315 M | no disponible | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-large-xlsr-53 (base) | 315 M | 30 s de audio aprox. | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1550 M | 30 s de audio | MIT (código) / model license | Hugging Face, OpenAI |

No se dispone de comparativas de rendimiento porque el modelo no tiene métricas de evaluación publicadas y su WER de validación es del 100 %. Los modelos Whisper de OpenAI suelen lograr WER inferiores al 20 % en hinglish, pero no se han realizado comparaciones directas.

## Limitaciones y advertencias

- Sobreajuste extremo: el modelo alcanza un WER del 100 % en validación, lo que lo hace inutilizable para transcripción.
- Dataset de entrenamiento desconocido: no se especifica su composición, tamaño ni licencia de los datos.
- Sesgos potenciales: al ser un fine-tuning sobre un corpus no documentado, puede reflejar sesgos lingüísticos o demográficos de los hablantes incluidos.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como transcripciones inventadas cuando el modelo no reconoce el audio; con WER del 100 % es el comportamiento esperado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, los datos de entrenamiento podrían tener restricciones no declaradas.
- Documentación insuficiente: la model card carece de descripción de usos previstos, limitaciones y datos de evaluación.
- No apto para producción: cualquier integración real fallará; se recomienda usar el modelo base XLSR-53 u otros ASR multilingües.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-mucs-62026-hinglish_mixed_scripts-alldata-1e-4-epochs-50-FT)
- [Modelo base facebook/wav2vec2-large-xlsr-53](https://huggingface.co/facebook/wav2vec2-large-xlsr-53)
- [Documentación de torchaudio sobre WAV2VEC2_XLSR53](https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html)
- [Modelo similar del mismo autor con diferentes hiperparámetros](https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-indic_voices-61867-hinglish_mixed_scripts-30_70-1e-4-steps-12000-FT/tree/main)
