# investguy/nemotron3-diarization-onnx

## Resumen

Nemotron-3 Diarization — ONNX presets es una conversión a formato ONNX del modelo `nvidia/Nemotron-3-Diarization`, publicada por el usuario `investguy` para su uso con la librería Rust `parakeet-rs`. El modelo original de NVIDIA realiza diarización de hablantes (speaker diarization), es decir, segmenta una señal de audio en intervalos atribuidos a distintos interlocutores, y está construido sobre una arquitectura Streaming Sortformer. Esta conversión no entrena nada nuevo: solo exporta el checkpoint original a grafos ONNX optimizados para inferencia.

El repositorio ofrece cinco variantes que difieren en precisión y latencia: una versión offline en fp32 (~382 MB) y cuatro variantes INT8 (~104 MB cada una) con latencias de 30,4 s, 1,04 s, 0,64 s y 0,32 s respectivamente. La latencia está fijada en el propio grafo mediante los metadatos `chunk_len` y `right_context`, a diferencia de la exportación de un solo fichero `nemotron3_diar_v3.onnx`, que permite cambiarla en tiempo de ejecución.

Es relevante para desarrolladores que necesiten integrar diarización en pipelines en Rust o en entornos sin PyTorch, ya que los grafos ONNX pueden ejecutarse con runtimes ligeros. El modelo soporta hasta 8 hablantes simultáneos y procesa audio a 16 kHz mono con tramas de 80 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer con encoder de 31 capas y cabeza de hablantes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming: `spkcache_len` = 264, `fifo_len` = 264 en presets INT8) |
| Tipos de cuantizacion | fp32 (offline) e INT8 dinámico (solo pesos del encoder: `w_qkv`, `out_proj`, FFN) |
| Idiomas soportados | no disponible (la diarización es independiente del idioma en principio, pero no se declara) |
| Licencia | OpenMDW-1.1 (licencia de NVIDIA, heredada del modelo base) |
| Formato de pesos | ONNX (grafos con metadatos embebidos) |

## Arquitectura y entrenamiento

El modelo base es un Streaming Sortformer de NVIDIA, diseñado para diarización en streaming. La arquitectura consta de un encoder de 31 capas transformer que procesa características mel de 128 bins con un salto de 10 ms, generando tramas de modelo de 80 ms. La cabeza de hablantes produce predicciones por hablante sobre una caché de hablantes (`spkcache`) y una cola FIFO (`fifo`), lo que permite mantener estado entre fragmentos de audio y soportar hasta 8 hablantes simultáneos.

La conversión ONNX preserva la estructura del grafo con una interfaz de 6 entradas (`chunk`, `chunk_lengths`, `spkcache`, `spkcache_lengths`, `fifo`, `fifo_lengths`) y 3 salidas (`spkcache_fifo_chunk_preds`, `chunk_pre_encode_embs`, `chunk_pre_encode_lengths`). La cuantización INT8 es dinámica y se aplica únicamente a las MatMuls de pesos del encoder; las MatMuls de atención, la proyección de pre-encode, `encoder_proj` y la cabeza de hablantes permanecen en fp32. Los metadatos del grafo incluyen `num_speakers=8`, `spkcache_sil_frames_per_spk=1`, `scores_boost_latest=0.05` y el embedding de silencio aprendido (`sil_emb`). No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF/DPO.

## Capacidades

- Diarización de hablantes en streaming y en modo offline.
- Soporte de hasta 8 hablantes simultáneos (`num_speakers=8`).
- Procesamiento de audio a 16 kHz mono con tramas de modelo de 80 ms.
- Detección de actividad de voz (pipeline declarado: `voice-activity-detection`).
- Modo streaming con `feed`/`flush` para audio en vivo y modo `diarize` para audio completo.
- Gestión de estado mediante caché de hablantes (`spkcache`) y cola FIFO (`fifo`).
- Integración con la librería Rust `parakeet-rs` (feature `sortformer`).
- No se declaran capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes; es un modelo puramente de audio.

## Casos de uso

- Transcripción de reuniones con atribución de interlocutor: el modelo segmenta el audio en turnos de habla etiquetados por hablante, lo que permite generar actas o transcripciones diarizadas combinándolo con un ASR. La ventana de streaming y la caché de hablantes facilitan el procesamiento de reuniones largas.
- Análisis de llamadas de atención al cliente: con la variante `low_int8` (latencia de 1,04 s) se puede procesar audio casi en tiempo real para identificar quién habla en cada momento y calcular métricas como tiempo de habla por agente.
- Subtitulado en directo con identificación de hablantes: la variante `ultralow_int8` (0,32 s de latencia) permite alimentar un pipeline de subtitulado en vivo que etiquete cada fragmento con el hablante correspondiente.
- Investigación en lingüística de corpus: la versión offline fp32 (~382 MB) ofrece la máxima fidelidad para procesar grabaciones completas y generar anotaciones de hablante para estudios académicos.
- Moderación y análisis de contenido en plataformas de audio: detección de múltiples interlocutores en podcasts o grabaciones subidas por usuarios, con la variante INT8 para reducir costes de almacenamiento y cómputo.
- Integración en aplicaciones Rust nativas: mediante `parakeet-rs` se puede incorporar diarización en herramientas de escritorio o servidores Rust sin dependencias de PyTorch, usando los grafos ONNX con un runtime ligero.
- Sistemas de videoconferencia con etiquetado automático: el modo streaming con `feed`/`flush` permite actualizar las etiquetas de hablante a medida que llega el audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El tamaño de los ficheros es de ~382 MB (fp32 offline) y ~104 MB (INT8), lo que sugiere un consumo de memoria moderado, pero no se confirma el pico de VRAM durante la inferencia.
- GPU recomendadas: no disponible. Al ser un modelo pequeño en disco, es probable que quepa en GPUs de consumo, pero no se aportan datos oficiales.
- Cabe en consumer GPU: no confirmado; el tamaño de los pesos INT8 (~104 MB) es compatible con GPUs de gama baja, pero no se especifica.
- Opciones de despliegue: `parakeet-rs` (Rust, feature `sortformer`); al ser ONNX, es compatible con runtimes ONNX estándar, aunque la interfaz de 6 entradas/3 salidas y los metadatos requieren un cargador que los interprete (el loader de `parakeet-rs` lee la configuración de streaming de los metadatos ONNX).
- Latencia: 30,4 s (offline), 1,04 s (low), 0,64 s (verylow) y 0,32 s (ultralow). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3 Diarization ONNX (este) | no disponible | `spkcache_len`=264, `fifo_len`=264 (INT8) | 0,32–30,4 s según preset | OpenMDW-1.1 | ONNX en Hugging Face |
| nvidia/Nemotron-3-Diarization (original) | no disponible | no disponible | no disponible | OpenMDW-1.1 | Checkpoint NeMo en Hugging Face |
| Otros modelos de diarización | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia es OpenMDW-1.1 de NVIDIA; es responsabilidad del usuario revisar sus términos para uso comercial, ya que el repositorio solo convierte el checkpoint y no otorga derechos adicionales.
- La configuración `nemotron3()` de `parakeet-rs` fue ajustada únicamente con dos clips de reunión, según la model card; se recomienda usar `callhome()` como valor por defecto.
- La latencia está fijada en el grafo: cada fichero corresponde a una versión de streaming concreta y no se puede cambiar en tiempo de ejecución (a diferencia de `nemotron3_diar_v3.onnx`).
- No se han exportado copias fp32 de los presets low, verylow y ultralow; solo existen en INT8.
- El script de exportación requiere un checkout de NeMo Speech en `main`; `nemo-toolkit` 2.7.3 y 3.0.0 no pueden restaurar el checkpoint.
- No se declaran idiomas soportados ni se han publicado evaluaciones de sesgo o robustez.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede haber errores de asignación de hablante en audio con solapamientos, ruido o hablantes similares; no se aportan tasas de error (DER) publicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento de la conversión.
- El pipeline declarado es `voice-activity-detection`, aunque la funcionalidad real es diarización; conviene verificar la integración en el runtime elegido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/investguy/nemotron3-diarization-onnx
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Librería parakeet-rs: https://github.com/iguy0/parakeet-rs
- Licencia OpenMDW-1.1: https://huggingface.co/nvidia/Nemotron-3-Diarization
