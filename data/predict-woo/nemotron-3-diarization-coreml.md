# predict-woo/Nemotron-3-Diarization-CoreML

## Resumen

Nemotron-3-Diarization-CoreML es la conversión a CoreML de nvidia/Nemotron-3-Diarization, un modelo de diarización de hablantes en streaming capaz de distinguir hasta 8 interlocutores simultáneos. Lo publica el usuario predict-woo y está pensado exclusivamente para macOS sobre Apple silicon, con un bundle por defecto que ejecuta la inferencia íntegramente en el Neural Engine. El modelo original lo desarrolla NVIDIA (equipo de Ivan Medennikov, Taejin Park y Boris Ginsburg, entre otros) y se describe en el paper arXiv 2611.12246.

El problema que resuelve es la diarización en tiempo real con baja latencia: identificar quién habla en cada instante de un flujo de audio, sin necesidad de procesar la grabación completa. La conversión a CoreML mantiene la precisión del modelo PyTorch original (DER de 8,27 % frente a 8,23 %) pero multiplica la velocidad por 7 en un M2 Pro, alcanzando 42,4× tiempo real en modo de baja latencia (1,04 s).

La arquitectura subyacente es un streaming Sortformer (según los tags del repositorio), con un encoder que procesa ventanas de hasta 541 frames de 80 ms combinando caché de hablantes, FIFO y chunk con look-ahead. El repositorio ocupa 1,0 GB e incluye tres bundles (Neural Engine fp16, GPU fp32 y GPU fp32 compacto), además de los paquetes CoreML fuente de los tres encoders.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (encoder transformer con caché de hablantes y atención en streaming) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | ventana de streaming de hasta 541 frames de 80 ms (~43,3 s) por paso; modo Low latency con chunk de 1,04 s |
| Tipos de cuantizacion | fp16 (Neural Engine) y fp32 (GPU) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma en la informacion disponible) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); runtime y codigo de conversion Apache-2.0 |
| Formato de pesos | CoreML (.mlpackage / .mlmodelc), constantes en .f32 (window, mel_filters, stacking_weight, silence_embeds) |

## Arquitectura y entrenamiento

El modelo es un diarizador en streaming basado en Sortformer, una familia de modelos que resuelve la asignación de hablantes como un problema de permutación sobre un número fijo de ranuras (8 en este caso). El encoder procesa en cada paso la concatenación de la caché de hablantes, una cola FIFO y el chunk actual con look-ahead; la salida son logits de hablante cada 10 ms que se usan para actualizar la propia caché. El front-end es log-mel con filtros precalculados (mel_filters.f32) y una proyección de stacking de características (stacking_weight.f32). El bundle incluye además un embedding de silencio (silence_embeds.f32) para la caché de hablantes.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original de NVIDIA y no se reproducen en esta conversión. La innovación técnica relevante de esta ficha es la conversión: los paquetes CoreML exponen funciones por bucket de longitud (`len_<L>`) para evitar recompilaciones, usan key_bias con -1e4 en posiciones de padding y separan el encoder en tres variantes (ANE fp16, GPU fp32 por buckets y GPU fp32 de 576). El runtime Swift implementa el schedule de chunks, la caché de hablantes y el front-end, que no forman parte del paquete CoreML.

## Capacidades

- Diarización de hablantes en streaming para hasta 8 interlocutores simultáneos.
- Salida de logits de hablante cada 10 ms, con una fila por frame y por hablante.
- Modo de baja latencia con chunk de 1,04 s, adecuado para aplicaciones en vivo.
- Procesamiento de audio a 16 kHz mono Float32 con cualquier tamano de bloque de entrada.
- Detección de actividad de voz implícita (pipeline_tag: voice-activity-detection) y modelado de silencios mediante embedding dedicado.
- Ejecución íntegra en el Neural Engine de Apple silicon (bundle por defecto, fp16) o en GPU (bundles fp32).
- API Swift (`StreamingDiarizer`) con warmUp, push y finish para integración en apps macOS.
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni tool calling; es un modelo exclusivamente de audio.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablante: el modelo procesa el audio en streaming y asigna cada frame de 10 ms a uno de los 8 hablantes, lo que permite generar actas con "quién dijo qué" en tiempo real sobre un Mac.
- Subtitulado en directo de videollamadas: con 42,4× tiempo real en un M2 Pro y chunk de 1,04 s, la latencia es compatible con subtítulos casi instantáneos etiquetados por interlocutor.
- Análisis de podcasts y entrevistas: el bundle GPU fp32 reproduce exactamente la salida del modelo original, útil cuando se requiere paridad bit a bit con la referencia PyTorch para auditoría o comparación.
- Aplicaciones macOS nativas de accesibilidad: integración vía Swift Package en apps que necesitan identificar hablantes sin enviar audio a la nube, aprovechando el Neural Engine y un consumo de memoria de 0,6 GB.
- Investigación en diarización: los paquetes CoreML fuente (`coreml/*.mlpackage`) y las funciones por bucket permiten experimentar con el encoder, medir el efecto del fp16 o comparar configuraciones de streaming.
- Despliegue en dispositivos con recursos limitados: el bundle GPU compacto reduce la memoria a 0,8 GB manteniendo velocidad de 19,2× tiempo real, adecuado para Macs con GPU de gama baja.
- Procesado por lotes de grabaciones largas: el modo de baja latencia y la velocidad superior a 40× permiten diarizar horas de audio en minutos en un solo equipo Apple silicon.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a velocidad y precisión de la conversión, no a benchmarks estándar de diarización (DER sobre AMI, DIHARD, etc.).

| Metrica | Neural Engine fp16 | GPU fp32 | GPU fp32 compacto | Original PyTorch |
|---|---|---|---|---|
| Velocidad en vivo (M2 Pro, Low latency 1,04 s, 563,5 s de audio) | 42,4× (7,0× el original) | 24,9× (4,1×) | 19,2× (3,2×) | 6,0× |
| Memoria | 0,6 GB | 2,4 GB | 0,8 GB | no disponible |
| DER (8 reuniones sinteticas, 2-8 hablantes) | 8,27 % | idéntico al original | idéntico al original | 8,23 % |
| Coincidencia de hablantes por frame (20 grabaciones) | 99,8 % de frames de 10 ms | idéntica | idéntica | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es de lenguaje.

## Requisitos de hardware

- Plataforma: exclusivamente macOS sobre Apple silicon (M1, M2, M3, M4 o posteriores); no hay builds para x86 ni para otras plataformas.
- VRAM/memoria unificada: 0,6 GB para el bundle Neural Engine fp16, 0,8 GB para el GPU compacto y 2,4 GB para el GPU fp32 completo.
- GPU recomendadas: no aplica en el sentido tradicional; el bundle por defecto usa el Neural Engine y los alternativos usan la GPU integrada de Apple silicon. No se documenta soporte para A100, H100 o RTX 4090.
- Cabe en cualquier Mac con Apple silicon; el límite práctico es la memoria unificada del equipo, muy por encima de los 2,4 GB del bundle más grande.
- Despliegue: runtime Swift propio (github.com/predict-woo/nemotron-diarization-coreml); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de audio CoreML.
- Latencia y throughput: 42,4× tiempo real en M2 Pro con batería en modo Low latency; la primera ejecución compila el modelo Neural Engine (~75 s) y las posteriores arrancan en ~0,5 s.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes | Streaming | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3-Diarization-CoreML | Streaming Sortformer (CoreML) | hasta 8 | si, chunk 1,04 s | macOS Apple silicon | OpenMDW 1.1 | 42,4× tiempo real en M2 Pro, DER 8,27 % |
| nvidia/Nemotron-3-Diarization | Streaming Sortformer (PyTorch) | hasta 8 | si | multiplataforma con GPU | no disponible en esta ficha | Referencia original, 6,0× tiempo real, DER 8,23 % |
| pyannote/speaker-diarization (familia) | Pipeline de segmentación + embeddings | variable | limitado en streaming | multiplataforma | no disponible en esta ficha | No se dispone de comparación numérica en la información proporcionada |
| NVIDIA NeMo diarization (Sortformer previo) | Sortformer | hasta 4 en versiones previas | si | multiplataforma | no disponible en esta ficha | No se dispone de comparación numérica en la información proporcionada |

La comparación con alternativas como pyannote o versiones previas de Sortformer no puede cuantificarse con los datos disponibles; solo se confirma que el original PyTorch y esta conversión CoreML son directamente comparables entre sí.

## Limitaciones y advertencias

- Solo funciona en macOS sobre Apple silicon; no hay soporte para Linux, Windows, x86 ni GPUs NVIDIA o AMD.
- El límite de hablantes es 8; escenarios con más interlocutores requerirán otro modelo o segmentación previa.
- El bundle Neural Engine fp16 no es bit a bit idéntico al original: el DER varía de 8,23 % a 8,27 % y el 0,2 % de frames difiere, principalmente por decisiones distintas (aunque igualmente válidas) de la caché de hablantes.
- Los datos de precisión proceden de 8 reuniones sintéticas con turnos de referencia y 20 grabaciones; no se reportan evaluaciones sobre corpus estándar como AMI o DIHARD, por lo que el rendimiento en audio real ruidoso o con solapamiento puede diferir.
- Riesgo de confusión entre hablantes con voces similares o en condiciones de solapamiento, inherente a la diarización en streaming; no se documentan métricas específicas para estos casos.
- No se documentan sesgos demográficos, acentos o idiomas; al ser un modelo de audio, el rendimiento puede variar según la lengua y las condiciones acústicas.
- Licencia OpenMDW 1.1 para los pesos: conviene revisar sus términos antes de uso comercial; el runtime y el código de conversión son Apache-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026; es una conversión reciente y poco validada por la comunidad.
- La primera ejecución compila el modelo (~75 s), lo que afecta al arranque en frío en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/predict-woo/Nemotron-3-Diarization-CoreML
- Modelo original: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Repositorio del runtime y código de conversión: https://github.com/predict-woo/nemotron-diarization-coreml
- Paper: https://arxiv.org/abs/2611.12246
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
