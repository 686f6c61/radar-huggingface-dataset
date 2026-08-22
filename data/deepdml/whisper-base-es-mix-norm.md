# deepdml/whisper-base-es-mix-norm

## Resumen

El modelo `deepdml/whisper-base-es-mix-norm` es un sistema de reconocimiento automático de voz (ASR) para español, desarrollado por David Jimenez (usuario `deepdml`). Se trata de un ajuste fino (*fine-tuning*) del modelo base `openai/whisper-base` sobre el conjunto de datos Common Voice 17.0, aunque las etiquetas del repositorio también hacen referencia a otros corpus como `multilingual_librispeech`, `fleurs` y `voxpopuli`. El modelo hereda la arquitectura encoder-decoder de Whisper, con un tamaño total de 72,6 millones de parámetros y una ventana de contexto de audio de 30 segundos.

Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para transcripción de voz en español, con un rendimiento competitivo para su tamaño. Está pensado para entornos donde se requiera baja latencia y un despliegue sencillo, tanto en CPU como en GPU de consumo. Al estar integrado con la librería Transformers, su uso es directo mediante pipelines estándar de ASR.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 72.593.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `openai/whisper-base`, que sigue la arquitectura original de Whisper: un transformer encoder-decoder con 4 capas en cada parte y una dimensión de representación de 512. La ventana de audio fija es de 30 segundos, muestreada a 16 kHz.

Según la model card, el entrenamiento se realizó sobre el dataset Common Voice 17.0, con los siguientes hiperparámetros: learning rate 1e-5, batch size 64, optimizador AdamW, scheduler lineal con warmup del 4% y 20.000 pasos de entrenamiento. Las etiquetas del repositorio también referencian otros conjuntos de datos, aunque no se detalla su uso específico en el proceso de ajuste. No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Transcripción de audio en español a texto.
- Reconocimiento automático de voz (ASR) con timestamps por segmento (heredado de Whisper).
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Soporta inferencia en CPU y GPU (no se especifican limitaciones adicionales).
- No se documentan capacidades de *tool calling*, agentes o razonamiento multi-paso; es un modelo puramente de ASR.

## Casos de uso

- **Subtitulación de vídeo**: el modelo puede transcribir pistas de audio en español para generar subtítulos de manera automática. Su tamaño reducido permite procesar vídeos en tiempo real o en batch en equipos con recursos limitados.
- **Transcripción de reuniones y entrevistas**: en entornos profesionales, puede convertir grabaciones de reuniones o entrevistas en texto, facilitando su archivo y búsqueda posterior. La ventana de 30 segundos es adecuada para segmentar audio de forma continua.
- **Atención al cliente**: en sistemas de análisis de llamadas, se puede integrar para transcribir conversaciones en español y extraer métricas o detección de intenciones, aunque el modelo no incluye funcionalidades de análisis de sentimiento por sí mismo.
- **Accesibilidad**: para personas con discapacidad auditiva, el modelo puede servir como base para aplicaciones de subtitulación en directo o transcripción de conferencias.
- **Asistentes de voz**: integración en aplicaciones de *speech-to-text* para comandos de voz o dictado en español, aprovechando su bajo coste computacional.
- **Archivo de audios**: transcripción de archivos históricos de audio o podcasts para indexación y búsqueda textual.

## Benchmarks y rendimiento

El autor declara un único resultado de evaluación en Common Voice 17.0 (aunque en el model-index aparece como `facebook/multilingual_librispeech`, posiblemente un error en la etiqueta). Los valores reportados son:

| Métrica | Valor |
|---|---|
| WER (Word Error Rate) | 13.5692 |
| CER (Character Error Rate) | 4.7682 |
| Loss | 0.2606 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se proporcionan datos específicos de VRAM, GPU recomendadas o latencia en la documentación del modelo. Sin embargo, al tratarse de un modelo de 72,6 millones de parámetros, se puede inferir que:

- Es ejecutable en CPU con un rendimiento razonable para inferencia por lotes.
- En GPU, modelos similares de Whisper base suelen funcionar con menos de 2 GB de VRAM en cuantización FP16.
- Puede desplegarse en GPU de consumo como RTX 3060 o superiores, y también en entornos de CPU mediante librerías como `transformers` o `whisper.cpp`.

No se dispone de mediciones de latencia o throughput oficiales.

## Comparativa con modelos similares

No hay información suficiente en la documentación para comparar este modelo con otros de su categoría. El único dato disponible es el WER de 13.57 en Common Voice 17.0, que podría compararse con el modelo base `openai/whisper-base` en el mismo dataset, pero ese valor no se ha publicado en los materiales proporcionados. Por tanto, no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero como cualquier modelo de ASR entrenado en un conjunto de datos concreto, puede presentar degradaciones en acentos regionales o variedades del español no representadas suficientemente.
- Riesgo de alucinación: los modelos Whisper pueden generar texto en silencios o ruido, aunque no se ha evaluado específicamente este modelo.
- Limitación de idioma: solo español, no soporta otros idiomas.
- Ventana de contexto limitada a 30 segundos; audios más largos requieren segmentación.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar los términos de los datasets utilizados (p. ej., Common Voice, que tiene su propia licencia).
- Para producción, se recomienda evaluar el modelo en el dominio específico y con datos reales, ya que el rendimiento puede variar.

## Enlaces

- HuggingFace: [https://huggingface.co/deepdml/whisper-base-es-mix-norm](https://huggingface.co/deepdml/whisper-base-es-mix-norm)
- Repositorio de Whisper (OpenAI): [https://github.com/openai/whisper](https://github.com/openai/whisper)
- Página de FriendliAI para este modelo: [https://friendli.ai/models/deepdml/whisper-base-es-mix-norm](https://friendli.ai/models/deepdml/whisper-base-es-mix-norm)
