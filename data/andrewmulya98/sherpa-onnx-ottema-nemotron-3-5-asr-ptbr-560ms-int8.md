# andrewmulya98/sherpa-onnx-ottema-nemotron-3.5-asr-ptbr-560ms-int8

## Resumen

Este modelo es una exportación a ONNX int8 del modelo `ottema/nemotron-3.5-asr-ptbr`, un fine-tune de NVIDIA Nemotron 3.5 streaming 0.6B para reconocimiento automático de voz (ASR) en portugués brasileño. Ha sido convertido por `andrewmulya98` para su uso con la librería `sherpa-onnx`, lo que permite inferencia en tiempo real en CPU y GPU. El modelo utiliza un enfoque de transducer en línea (online transducer) con un tamaño de chunk de 560 ms y cuantización dinámica int8, lo que lo hace adecuado para aplicaciones de streaming de baja latencia. La licencia es OpenMDW-1.1, heredada de NVIDIA y Ottema.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Online transducer (encoder-decoder con joiner) basado en NVIDIA Nemotron 3.5 streaming 0.6B |
| Parametros totales | 0.6B (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 560 ms) |
| Tipos de cuantizacion | int8 dinamico (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) |
| Idiomas soportados | Portugues brasileño (pt-BR) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de NVIDIA Nemotron 3.5 streaming 0.6B, un modelo de ASR de tipo transducer en línea. La arquitectura consta de un encoder, un decoder y un joiner, que se combinan para generar transcripciones de forma incremental. La exportación a `sherpa-onnx` utiliza ficheros ONNX cuantizados a int8 dinámico: `encoder.int8.onnx`, `decoder.int8.onnx` y `joiner.int8.onnx`. El modelo fue entrenado con un prompt de idioma `pt-BR` y utiliza una dimensión de características de 128. No se han proporcionado datos sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino.

## Capacidades

- Reconocimiento automático de voz (ASR) en streaming para portugués brasileño.
- Transducción en línea con chunks de 560 ms, adecuado para aplicaciones en tiempo real.
- Cuantización int8 dinámica para reducir el uso de memoria y acelerar la inferencia.
- Compatible con `sherpa-onnx`, que soporta despliegue en CPU, GPU y dispositivos edge.
- Soporte de prompt de idioma para especificar `pt-BR`.
- No soporta tool calling ni funciones de agente (es un modelo de ASR puro).

## Casos de uso

- Transcripción en tiempo real de reuniones: el modelo puede transcribir audio de reuniones en portugués brasileño con baja latencia gracias al streaming por chunks de 560 ms.
- Subtitulado automático de vídeos: integración en pipelines de procesamiento de vídeo para generar subtítulos en pt-BR en streaming.
- Asistentes de voz en portugués: el modelo puede usarse como componente de reconocimiento de voz en asistentes virtuales, combinado con un LLM para el diálogo.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones en portugués brasileño.
- Análisis de llamadas de atención al cliente: transcripción de llamadas para su posterior análisis de sentimiento o extracción de entidades.
- Dictado por voz en aplicaciones de productividad: integración en editores de texto o IDEs para dictado en portugués brasileño.
- Traducción simultánea: el modelo puede transcribir audio en pt-BR para alimentar un sistema de traducción automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser int8 y de tamaño 0.7 GB, puede ejecutarse con menos de 1 GB de VRAM en GPU, y en CPU con memoria RAM similar.
- GPU recomendada: cualquier GPU moderna (RTX 20xx o superior) o incluso CPU con soporte AVX2.
- Cabe en consumer GPU: sí, en GPUs con 4 GB o menos.
- Opciones de despliegue: `sherpa-onnx`, que soporta CPU, GPU y plataformas móviles/edge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado datos de comparación con modelos similares en la información disponible.

## Limitaciones y advertencias

- Solo soporta portugués brasileño; no funciona con otros idiomas.
- Licencia OpenMDW-1.1: puede tener restricciones de uso comercial. Es necesario revisar los términos.
- Al ser un modelo de ASR, no genera texto libre ni razonamiento; solo transcripción.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo original.
- No se han proporcionado métricas de precisión, por lo que se desconoce su rendimiento en condiciones adversas (ruido, acentos, etc.).

## Enlaces

- HuggingFace: https://huggingface.co/andrewmulya98/sherpa-onnx-ottema-nemotron-3.5-asr-ptbr-560ms-int8
- Modelo base: https://huggingface.co/ottema/nemotron-3.5-asr-ptbr
- Documentación de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/index.html
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia OpenMDW: https://openmdw.ai/license/1-1/
