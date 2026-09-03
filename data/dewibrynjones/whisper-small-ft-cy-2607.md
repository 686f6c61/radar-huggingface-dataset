# DewiBrynJones/whisper-small-ft-cy-2607

## Resumen

El modelo `whisper-small-ft-cy-2607` es un ajuste fino (fine-tuning) de `openai/whisper-small` realizado por DewiBrynJones sobre un dataset preprocesado de audio en galés (código `cy`), denominado `DewiBrynJones/preprocessed-whisper-btb-cv-cvad-wlga-ca-2607`. Se trata de un sistema de reconocimiento automático del habla (ASR) que adapta el modelo multilingüe de Whisper a la lengua galesa, una lengua minoritaria con recursos limitados, con el objetivo de mejorar la precisión de transcripción en este idioma.

El modelo conserva la arquitectura original de Whisper-small, un transformer encoder-decoder con aproximadamente 241,7 millones de parámetros, entrenado originalmente por OpenAI sobre 680.000 horas de audio multilingüe. Este ajuste fino se ha realizado con la librería `transformers` de HuggingFace, utilizando entrenamiento distribuido con 2 GPUs, 15.000 pasos y una tasa de aprendizaje de 2,5e-05. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su contribución a la preservación y accesibilidad de lenguas minoritarias mediante tecnología de voz, ofreciendo una alternativa de código abierto y ajustable para transcripción en galés. Sin embargo, la documentación publicada es muy escasa: no se han proporcionado resultados de evaluación, descripción detallada de los datos de entrenamiento ni métricas de rendimiento, lo que limita la validación independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana estándar de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre del dataset sugiere galés, `cy`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder que procesa espectrogramas de Mel de 80 canales. El encoder convierte el audio en representaciones latentes y el decoder genera texto autoregresivamente, con capacidad para realizar tareas de transcripción, traducción y detección de idioma. Whisper-small tiene 12 capas en el encoder y 12 en el decoder, con 512 dimensiones ocultas y 8 cabezas de atención.

El ajuste fino se realizó sobre el dataset preprocesado `DewiBrynJones/preprocessed-whisper-btb-cv-cvad-wlga-ca-2607`, que combina varias fuentes de audio en galés (posiblemente Common Voice, VAD, etc., según las siglas del nombre). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2,5e-05 con scheduler coseno y 500 pasos de warm-up, tamaño de lote total de 64 (32 por dispositivo en 2 GPUs), optimizador AdamW con betas (0.9, 0.999) y precisión mixta nativa (AMP). Se entrenó durante 15.000 pasos, aunque no se reportan métricas de validación ni pérdida final.

No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar sobre datos de transcripción.

## Capacidades

- Reconocimiento automático del habla (ASR) para audio en galés, adaptado específicamente a este idioma.
- Transcripción de audio a texto con la arquitectura Whisper, que también soporta traducción a inglés (aunque no se ha verificado en este ajuste).
- Detección de idioma y timestamp a nivel de segmento (funcionalidades heredadas de Whisper).
- Procesamiento de audio de hasta 30 segundos por ventana, con capacidad de manejar audio más largo mediante segmentación.
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de ASR puro.
- Capacidades multilingües limitadas al galés en este ajuste, aunque el modelo base es multilingüe.

## Casos de uso

- Transcripción de reuniones y conferencias en galés: el modelo puede convertir grabaciones de audio en texto, facilitando actas y búsquedas. Su ventana de 30 segundos permite procesar segmentos largos con solapamiento.
- Subtitulado automático de vídeos en galés: integrable en pipelines de postproducción para generar subtítulos en este idioma, mejorando la accesibilidad de contenidos audiovisuales.
- Asistentes de voz para hablantes de galés: al ser un modelo ligero (241M parámetros), puede desplegarse en servidores o dispositivos con recursos moderados para comandos de voz o dictado.
- Archivado y digitalización de material oral histórico: transcripción de entrevistas, grabaciones de campo o archivos sonoros en galés para su preservación digital.
- Aplicaciones educativas de aprendizaje de idiomas: generación de transcripciones para ejercicios de comprensión auditiva o evaluación de pronunciación.
- Investigación lingüística: análisis de corpus orales en galés, permitiendo estudios de fonética, morfología o variación dialectal a partir de transcripciones automáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `model-index` con una lista vacía de resultados, y no se proporcionan métricas como WER (Word Error Rate) o pérdida de validación. Por tanto, no es posible comparar cuantitativamente este modelo con otros sistemas de ASR para galés.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper-small en FP16 requiere aproximadamente 1,5 GB de VRAM para una ventana de 30 segundos. Con cuantización INT8 podría reducirse a ~0,8 GB, aunque no se han publicado cuantizaciones específicas para este ajuste.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. Para inferencia en lote o baja latencia, se recomienda una RTX 3060 o superior.
- Es compatible con GPUs de consumo (serie RTX) y también con GPUs de datacenter (A10, A100) si se requiere mayor throughput.
- Opciones de despliegue: al ser un modelo de la familia Whisper, puede ejecutarse con `transformers` (pipeline `automatic-speech-recognition`), `faster-whisper` (CTranslate2), `whisper.cpp` (CPU/GPU), `vLLM` (aunque no es óptimo para ASR) o `Ollama` (no soportado nativamente para Whisper). Se recomienda `faster-whisper` para producción por su menor latencia.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, Whisper-small en una RTX 3090 procesa audio en tiempo real (factor de velocidad ~10x) con `faster-whisper`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `whisper-small-ft-cy-2607` | 241,7M | 30 s | Apache 2.0 | Galés (fine-tuning) |
| `openai/whisper-small` | 241,7M | 30 s | MIT | Multilingüe (99 idiomas) |
| `DewiBrynJones/whisper-tiny-ft-cy-en` | 39M | 30 s | Apache 2.0 | Galés e inglés (fine-tuning) |

La comparación directa con el modelo base `whisper-small` es la más relevante: el ajuste fino debería mejorar el WER en galés, pero no hay datos que lo confirmen. El modelo `whisper-tiny-ft-cy-en` es una versión más pequeña del mismo autor, con 39M parámetros, que podría ser más rápida pero menos precisa. No se dispone de otros modelos comparables específicos para galés en el ecosistema público.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación (WER, pérdida) ni resultados de benchmarks, por lo que no se puede verificar la calidad real del modelo.
- La model card está generada automáticamente y carece de descripción de usos previstos, limitaciones o datos de entrenamiento detallados.
- El dataset de entrenamiento no está documentado en profundidad; las siglas `btb-cv-cvad-wlga-ca` sugieren múltiples fuentes, pero no se especifica su composición ni tamaño.
- Al ser un fine-tuning de Whisper, puede heredar sesgos del modelo base, como un rendimiento inferior en acentos o dialectos no representados en los datos de entrenamiento.
- Riesgo de alucinación en audio con ruido o habla no clara, común en sistemas ASR.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento para evitar problemas de derechos de autor.
- No se ha confirmado el soporte para otros idiomas distintos del galés; el modelo podría degradarse en otros idiomas si se usa sin adaptación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DewiBrynJones/whisper-small-ft-cy-2607)
- [Perfil del autor en HuggingFace](https://huggingface.co/DewiBrynJones)
- [Perfil del autor en GitHub](https://github.com/DewiBrynJones)
- [Modelo base openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
