# mlboydaisuke/wav2vec2-XLSR53-Portuguese-ExecuTorch

## Resumen

Este modelo es una conversión a ExecuTorch del reconocedor de voz automático (ASR) `jonatasgrosman/wav2vec2-large-xlsr-53-portuguese`, un fine-tuning en portugués del modelo multilingüe `wav2vec2-large-xlsr-53` de Facebook. La conversión produce artefactos `.pte` optimizados con el delegado XNNPACK, pensados para ejecución en dispositivos móviles y edge (Android, Mac) sin depender de un servidor. A diferencia de los modelos encoder-decoder como Whisper, este modelo usa una arquitectura CTC pura: una sola pasada hacia adelante sobre la ventana de audio genera la transcripción mediante un argmax por frame de 20 ms, sin bucle de decodificación ni caché KV. Esto lo hace especialmente ligero y adecuado para aplicaciones de transcripción en tiempo real con recursos limitados.

El repositorio incluye dos versiones cuantizadas (fp32 y fp16) con tamaños de 1262 MB y 657 MB respectivamente, y verifica que la salida del artefacto fp32 es idéntica a la del modelo eager en 5 frases de prueba sintéticas. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder transformer) con cabezal CTC |
| Parametros totales | no disponible (basado en wav2vec2-large, ~315M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio (160 000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp32, fp16 (archivos .pte) |
| Idiomas soportados | Portugués (sin especificar variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch (.pte) |

## Arquitectura y entrenamiento

El modelo base es `wav2vec2-large-xlsr-53`, preentrenado de forma autosupervisada sobre 56 000 horas de audio multilingüe (Multilingual LibriSpeech, CommonVoice, BABEL) y posteriormente fine-tuned en portugués con el dataset Common Voice 6.1. La arquitectura wav2vec2 consiste en un encoder transformer con una convolución posicional de 1024 canales y kernel 128, seguida de capas de atención. Para la conversión a ExecuTorch, se aplicó `torch.export` y el particionador XNNPACK, generando artefactos `.pte` que ejecutan el modelo completo en una sola pasada.

Un hallazgo técnico relevante: la convolución posicional lleva `weight_norm` como parametrización viva, lo que impedía que XNNPACK la delegara (el peso se convertía en un tensor calculado). Al materializar el peso antes de la exportación, la cobertura del delegado pasó del 70% al 100% en ese módulo, reduciendo el tiempo de ejecución de 3206 ms a 3.6 ms. Este problema está reportado en [pytorch/executorch#22078](https://github.com/pytorch/executorch/issues/22078).

## Capacidades

- Reconocimiento de voz automático (ASR) para portugués, transcribiendo audio de 10 segundos en una sola pasada.
- Decodificación CTC greedy: argmax por frame, colapso de repeticiones y eliminación del token blank.
- Sin puntuación en la salida (vocabulario de 46 entradas, sin signos de puntuación).
- Ejecución on-device con XNNPACK, compatible con Android y Mac (mismo archivo `.pte`).
- Soporte de `attention_mask` para manejar clips más cortos mediante zero-padding.
- No requiere decodificador autoregresivo ni caché KV, lo que reduce la latencia y el consumo de memoria.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el modelo puede procesar grabaciones de hasta 10 segundos directamente en el dispositivo, sin enviar audio a la nube, gracias a su tamaño reducido y a la ejecución con XNNPACK.
- Subtitulado en tiempo real para reuniones o vídeos: al ser una sola pasada, la latencia es predecible (275 ms en Mac arm64 para fp32), permitiendo transcripción casi instantánea de fragmentos de audio.
- Asistentes de voz en portugués: integrable en pipelines de comandos de voz, donde la transcripción se usa como entrada para un sistema de comprensión del lenguaje.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio a texto en tiempo real en dispositivos de bajo consumo, como relojes o wearables.
- Archivado y búsqueda de contenido audiovisual: transcripción automática de clips cortos para indexación y búsqueda posterior.
- Pruebas de calidad de ASR en entornos embebidos: al ser una conversión verificada contra el modelo eager, sirve como referencia para validar despliegues en hardware específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (como WER en Common Voice) en la información disponible. La model card solo incluye una verificación con 5 frases sintéticas generadas por macOS `say -v Luciana`, donde el artefacto fp32 produce transcripciones idénticas al modelo eager (5/5) y el fp16 coincide en 4/5. No hay datos de rendimiento en conjuntos de prueba estándar.

## Requisitos de hardware

- Tamaño de los artefactos: 1262 MB (fp32) y 657 MB (fp16), lo que permite su uso en dispositivos con al menos 1-2 GB de almacenamiento libre.
- Ejecución en CPU: el delegado XNNPACK está optimizado para CPUs ARM y x86, por lo que no requiere GPU. En Mac arm64, el tiempo de inferencia para una ventana de 10 s es de 275.9 ms (fp32) y 661.4 ms (fp16), frente a 236.4 ms del modelo eager.
- Compatible con Android (vía XNNPACK) y Mac (mismo archivo `.pte`). No hay build para Core ML.
- Para despliegue en servidores, se puede usar el modelo original con PyTorch, pero esta conversión está pensada para edge.
- Opciones de despliegue: integración directa con ExecuTorch runtime en aplicaciones nativas; no se mencionan adaptadores para vLLM, Ollama o TGI (no aplica a ASR).

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Este modelo (ExecuTorch) | wav2vec2 + CTC | 10 s | Apache-2.0 | .pte | On-device |
| jonatasgrosman/wav2vec2-large-xlsr-53-portuguese | wav2vec2 + CTC | 10 s | Apache-2.0 | safetensors | Servidor/PC |
| facebook/wav2vec2-large-xlsr-53 | wav2vec2 (preentrenado) | 10 s | Apache-2.0 | safetensors | Fine-tuning |

La diferencia principal es el formato y la optimización: este modelo está listo para ejecutarse en dispositivos con XNNPACK, mientras que el original requiere PyTorch y más recursos. No hay comparación con Whisper porque la arquitectura y el enfoque son distintos (CTC vs encoder-decoder).

## Limitaciones y advertencias

- Sin puntuación en la salida: el vocabulario no incluye signos de puntuación, por lo que las transcripciones carecen de comas, puntos, etc.
- Ventana fija de 10 segundos: el audio debe tener exactamente 160 000 muestras; clips más cortos requieren zero-padding y clips más largos deben cortarse. El `attention_mask` es obligatorio y afecta a la normalización interna.
- Solo portugués: no soporta otros idiomas, y no se especifica si está optimizado para variantes de Brasil o Portugal.
- Verificación limitada: solo se probó con 5 frases sintéticas; no hay evidencia de rendimiento con habla real o ruido de fondo.
- Rendimiento en dispositivos reales no documentado: las métricas de latencia son de un Mac arm64 de referencia, no de un móvil concreto.
- Posible degradación con fp16: la correlación con fp32 es 0.999946 y una de las 5 frases difiere, lo que sugiere que fp16 puede introducir errores en algunos casos.
- No hay soporte para Core ML; solo XNNPACK.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlboydaisuke/wav2vec2-XLSR53-Portuguese-ExecuTorch)
- [Modelo base original](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese)
- [Modelo preentrenado de Facebook](https://huggingface.co/facebook/wav2vec2-large-xlsr-53-portuguese)
- [Repositorio de conversión (executorch-models)](https://github.com/john-rocky/executorch-models)
- [Issue de ExecuTorch sobre weight_norm](https://github.com/pytorch/executorch/issues/22078)
- [Documentación de torchaudio para WAV2VEC2_XLSR53](https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR53.html)
