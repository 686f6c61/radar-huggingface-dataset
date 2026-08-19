# Antares97/sau-zipformer-asr

## Resumen

El modelo `Antares97/sau-zipformer-asr` es un sistema de reconocimiento automático del habla (ASR) específico para el dialecto árabe saudí (SAU), desarrollado por el usuario Antares97. Se basa en la arquitectura Zipformer2 Transducer y ha sido entrenado sobre los datos de habla árabe del corpus GigaSpeech3 utilizando el framework icefall. El modelo se distribuye en formato ONNX, lo que facilita su despliegue en entornos de producción con ONNX Runtime, tanto en CPU como en GPU.

La relevancia de este modelo radica en que cubre una necesidad poco atendida: el reconocimiento de voz para un dialecto regional con características fonéticas y léxicas propias, distinto del árabe estándar moderno. Al estar entrenado específicamente con datos de árabe saudí, ofrece una alternativa más precisa que los modelos ASR genéricos en árabe. El repositorio incluye dos variantes del modelo (M2_0818_fixed y M2), siendo la primera la recomendada por el autor por su reentrenamiento con normalización de texto. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 Transducer (encoder Conv2dSubsampling + Zipformer2, decoder de red de prediccion, joiner) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (solo ONNX estandar, sin cuantizacion declarada) |
| Idiomas soportados | ar (arabe saudí) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma Transducer (RNN-T) con tres componentes diferenciados: un encoder que procesa características de audio (fbank de 80 dimensiones) mediante una submuestra convolucional (Conv2dSubsampling) seguida de bloques Zipformer2 y una proyección final a 512 dimensiones; un decoder (red de predicción) que toma los tokens de salida previos (con un contexto de 2 tokens) y produce una representación de 512 dimensiones; y un joiner que combina ambas representaciones mediante una función tangente hiperbólica y una capa lineal para generar logits sobre un vocabulario de 500 tokens BPE. La tokenización se realiza con SentencePiece unigram de 500 unidades.

El entrenamiento se llevó a cabo con el framework icefall sobre los datos de habla árabe de GigaSpeech3, que incluye grabaciones del dialecto saudí. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El autor menciona dos variantes: M2_0818_fixed, un reentrenamiento con normalización de texto (recomendada), y M2 (ebra_batch1n2_sada_haitian), entrenada con una combinación de conjuntos de datos adicionales. La arquitectura Zipformer2 está optimizada para inferencia en streaming, lo que permite transcripción en tiempo real con baja latencia.

## Capacidades

- Reconocimiento de voz automático para el dialecto árabe saudí, con salida de texto transcrito.
- Inferencia en streaming gracias a la arquitectura Zipformer2, adecuada para procesamiento en tiempo real.
- Soporte de audio en múltiples formatos (WAV, MP3, FLAC, OGG) con remuestreo automático a 16 kHz, según el demo Space.
- Integración sencilla con ONNX Runtime, permitiendo despliegue en entornos Python, C++, o móviles.
- Vocabulario de 500 tokens BPE, suficiente para el dialecto objetivo pero limitado frente a modelos con vocabularios más amplios.
- No incluye capacidades de tool calling, agentes, visión ni generación de texto libre; es exclusivamente un modelo de transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto para actas, búsqueda de contenido o análisis posterior. Su enfoque en árabe saudí mejora la precisión en conversaciones coloquiales con modismos locales.
- Subtitulado automático de vídeos: al aceptar formatos comunes y remuestrear a 16 kHz, puede integrarse en pipelines de generación de subtítulos para contenido audiovisual en árabe saudí, reduciendo el trabajo manual.
- Asistentes de voz en aplicaciones móviles: su capacidad de streaming permite implementar comandos de voz en tiempo real para apps dirigidas a usuarios saudíes, como búsqueda por voz o dictado.
- Atención al cliente automatizada (IVR): el modelo puede transcribir llamadas de clientes que hablan en dialecto saudí, alimentando sistemas de análisis de sentimiento o enrutamiento de consultas.
- Transcripción de contenido multimedia para archivo: medios de comunicación o instituciones pueden convertir entrevistas, noticias o podcasts en texto indexable, facilitando la recuperación de información.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones o eventos permite generar subtítulos en vivo para usuarios con dificultades de audición en entornos donde se habla árabe saudí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre WER (Word Error Rate), comparaciones con otros modelos ASR árabes ni métricas de latencia o throughput.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. Al distribuirse en formato ONNX, puede ejecutarse con ONNX Runtime en CPU y GPU. El tamaño del repositorio es de 7,6 GB, lo que sugiere que el conjunto completo de archivos (encoder, decoder, joiner y tokenizador) requiere varios gigabytes de almacenamiento, pero no se dispone de datos exactos sobre la memoria necesaria para inferencia. Para despliegues en producción se recomienda probar en una GPU con al menos 8 GB de VRAM, aunque no es una cifra confirmada por el autor. Las opciones de despliegue incluyen ONNX Runtime directamente, o mediante servidores de inferencia como Triton o TorchServe que soporten ONNX. No se ha documentado compatibilidad con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos ASR específicos para árabe saudí con los que comparar directamente. El modelo Zipformer de Qualcomm AI Hub está orientado a inglés y chino, por lo que no es comparable en cobertura de idioma. Tampoco se dispone de datos sobre otros modelos ASR en árabe con arquitectura similar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de árabe saudí; su rendimiento en otros dialectos árabes o en árabe estándar moderno puede ser deficiente.
- No se han publicado métricas de error (WER) ni evaluaciones independientes, por lo que la precisión real en entornos ruidosos o con acentos variados es desconocida.
- El vocabulario BPE de 500 tokens es reducido, lo que puede limitar la cobertura de términos técnicos, nombres propios o jerga específica.
- No se han documentado sesgos específicos, pero al entrenarse sobre GigaSpeech3, puede heredar sesgos del corpus en cuanto a género, edad o procedencia geográfica de los hablantes.
- Riesgo de alucinación en ASR: el modelo puede producir transcripciones incorrectas o inventadas en segmentos de audio ambiguos o con ruido de fondo.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni soporte técnico.
- No se proporcionan instrucciones detalladas de despliegue más allá del ejemplo del Space; los usuarios deben implementar la lógica de preprocesamiento de audio (fbank) y decodificación por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Antares97/sau-zipformer-asr
- Demo Space (Saudi Arabic ASR): https://huggingface.co/spaces/Antares97/sau-asr
