# paniquex/StreamVoiceAnonPlus

## Resumen

StreamVoiceAnon+ es un sistema de anonimización de locutor en streaming basado en conversión de voz autorregresiva. Lo desarrolla el usuario paniquex como un fine-tuning sobre StreamVoiceAnon de Plachta, y añade dos checkpoints orientados a preservar la emoción del habla original durante el proceso de anonimización. El modelo recibe como entrada un audio fuente y una locución de referencia, y genera voz convertida que oculta la identidad del locutor manteniendo inteligibilidad y carga emocional.

La relevancia del modelo está en el ámbito de la privacidad del habla: la anonimización de locutor es un requisito creciente en despliegues de voz (asistentes, transcripción, datasets clínicos) donde hay que proteger la identidad biométrica sin destruir el contenido semántico ni la prosodia emocional. La propuesta se apoya en destilación acústica a nivel de trama durante el fine-tuning para inyectar información emocional en los estados ocultos del decodificador autorregresivo lento, manteniendo la misma ruta de inferencia en streaming.

El modelo se publica junto al paper "StreamVoiceAnon+: Emotion-Preserving Streaming Speaker Anonymization via Frame-Level Acoustic Distillation" (Interspeech 2026). El repositorio ocupa 1,2 GB, está etiquetado únicamente para inglés y no declara licencia específica para los pesos. La arquitectura subyacente es la de StreamVoiceAnon (conversión de voz autorregresiva en streaming), con dos variantes de checkpoint: frame-distill (por defecto) y pool-distill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conversión de voz autorregresiva en streaming (base StreamVoiceAnon), con destilación acústica a nivel de trama o de pooling |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (procesa audio en streaming por tramas; sin cifra de contexto publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible para los pesos; el código de inferencia se distribuye bajo MIT en el repositorio del proyecto base |
| Formato de pesos | .pth (checkpoints PyTorch) con archivos receipt.json asociados; componentes compartidos descargados desde Plachta/StreamVoiceAnon |

## Arquitectura y entrenamiento

StreamVoiceAnon+ se construye sobre StreamVoiceAnon, un sistema de conversión de voz autorregresiva con decodificación en streaming. El pipeline recibe voz fuente y una locución de referencia (prompt), y produce voz convertida que preserva contenido lingüístico pero sustituye la identidad del locutor. La innovación de esta variante es la incorporación de una cabeza de destilación acústica usada solo en entrenamiento: en `frame-distill` se destilan características emocionales hacia los estados ocultos de los tokens acústicos del decodificador autorregresivo lento (Slow AR); en `pool-distill` se emplea pooling estadístico para una clasificación emocional a nivel de locución. Ambas variantes comparten la misma ruta de inferencia en streaming.

El fine-tuning parte de los pesos de Plachta/StreamVoiceAnon y produce dos checkpoints (`frame.pth` y `pool.pth`) con sus receipts correspondientes. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO. La evaluación se realiza sobre VoicePrivacy 2024 (WER sobre LibriSpeech, UAR sobre IEMOCAP, EER-L frente a atacante lazy-informed), lo que sugiere un entrenamiento orientado a anonimización con preservación emocional. La selección de checkpoint se hizo con datos de desarrollo.

## Capacidades

- Conversión de voz (voice conversion) en modo streaming a partir de una locución fuente y una locución de referencia.
- Anonimización de locutor: sustituye la identidad biométrica de la voz preservando inteligibilidad.
- Preservación de emoción: dos variantes (`frame-distill` y `pool-distill`) que incorporan información emocional en el proceso de conversión.
- Procesamiento en streaming con control de latencia (`--delay`, `--decode_chunk_frames`) y decodificación por trozos.
- Soporte de compilación del grafo (`--compile`) para acelerar inferencia en GPU CUDA.
- Funcionamiento con un único idioma: inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio-texto ni razonamiento multi-paso; es un modelo estrictamente audio-a-audio.

## Casos de uso

- Anonimización de datasets de voz para investigación: convertir grabaciones de hablantes reales a voces sintéticas manteniendo contenido y emoción, de modo que los corpus puedan compartirse sin exponer identidades biométricas.
- Transcripción y subtitulado con privacidad: preprocesar audio de reuniones o llamadas con StreamVoiceAnon+ antes de enviarlo a un ASR externo, reduciendo la exposición de datos personales.
- Atención al cliente con grabación: anonimizar llamadas en tiempo real o en post-proceso para cumplir requisitos de protección de datos, preservando la entonación emocional útil para análisis de calidad.
- Análisis de emociones en entornos sensibles: al conservar UAR emocional (51,22 en `frame-distill`), permite estudios de prosodia afectiva sobre audio anonimizado.
- Generación de voces sintéticas para doblaje o TTS controlado: usar la conversión con referencia para producir una voz consistente sin identidad real asociada.
- Investigación en privacidad del habla: banco de pruebas reproducible sobre VoicePrivacy 2024 para comparar técnicas de anonimización con métricas WER/UAR/EER-L.
- Despliegues interactivos de voz: la ruta de streaming con `--simulate_streaming` y control de `--delay` permite integrar la anonimización en pipelines de baja latencia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre VoicePrivacy 2024 (porcentajes; WER sobre LibriSpeech, UAR sobre IEMOCAP, EER-L frente a atacante lazy-informed):

| Modelo | WER ↓ | UAR ↑ | EER-L ↑ |
|---|---:|---:|---:|
| StreamVoiceAnon (base) | 4,55 | 39,84 | 46,91 |
| StreamVoiceAnon+ frame-distill | 6,00 | 51,22 | 47,26 |
| StreamVoiceAnon+ pool-distill | 5,47 | 48,32 | 46,10 |

El modelo base obtiene mejor WER (4,55) que las variantes con preservación emocional, mientras que `frame-distill` mejora notablemente UAR (51,22 frente a 39,84) y mantiene EER-L similar. Los autores indican que las cifras difieren ligeramente del paper por cambios en el clúster de cómputo, entorno de entrenamiento y ajustes de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,2 GB, lo que sugiere que la inferencia cabe holgadamente en GPUs de consumo con suficiente memoria para el modelo y el runtime de audio.
- GPU recomendadas: se requiere una GPU CUDA según la model card; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: probablemente viable en tarjetas con CUDA y varios GB de VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: código de inferencia propio del repositorio StreamVoiceAnon v0.2.0 (`evaluations/infer_arvc.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de audio).
- Latencia y throughput: no disponibles; el script expone `--simulate_streaming`, `--delay 2` y `--decode_chunk_frames 3` como parámetros de control, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamVoiceAnon+ (frame/pool-distill) | Conversión de voz autorregresiva en streaming | en | Anonimización con preservación emocional | no disponible (pesos); código MIT | Hugging Face (paniquex/StreamVoiceAnonPlus) |
| StreamVoiceAnon (base) | Conversión de voz autorregresiva en streaming | en | Anonimización de locutor | no disponible | Hugging Face (Plachta/StreamVoiceAnon) |
| Otros sistemas VoicePrivacy 2024 | Varía (no disponible en detalle) | Varía | Anonimización de locutor | Varía | No disponible en la información proporcionada |

No se dispone de datos comparativos detallados de otros modelos de anonimización en la información proporcionada; la comparación principal es frente a su modelo base, donde StreamVoiceAnon+ gana en UAR a costa de un WER mayor.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta multilingüismo.
- El WER empeora respecto al modelo base (6,00 y 5,47 frente a 4,55), por lo que la preservación emocional introduce pérdida de inteligibilidad.
- No se especifica licencia para los pesos; el MIT del repositorio de código aplica únicamente al código de inferencia. El uso comercial de los checkpoints queda sin marco legal explícito.
- Requiere descargar componentes compartidos desde Plachta/StreamVoiceAnon con una revisión concreta; versiones desalineadas pueden romper la inferencia.
- Depende del código v0.2.0 de StreamVoiceAnon, aún no liberado en el momento de la publicación según la model card.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de artefactos acústicos o pérdida de naturalidad en la voz convertida; no se documentan métricas de calidad perceptual (MOS).
- Sesgos: no se documentan sesgos por género, acento o edad; la evaluación EER-L promedia cuatro puntuaciones por género, pero no se detallan resultados desagregados.
- No hay garantía formal de anonimización frente a atacantes más fuertes que el lazy-informed; EER-L ~47 % indica margen limitado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/paniquex/StreamVoiceAnonPlus
- Modelo base: https://huggingface.co/Plachta/StreamVoiceAnon
- Paper: https://arxiv.org/abs/2603.06079
- Repositorio de código: https://github.com/Plachtaa/StreamVoiceAnon
