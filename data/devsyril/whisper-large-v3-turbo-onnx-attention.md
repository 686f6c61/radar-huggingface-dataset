# Devsyril/whisper-large-v3-turbo-onnx-attention

## Resumen

Devsyril/whisper-large-v3-turbo-onnx-attention es una reexportacion en formato ONNX del modelo Whisper Large V3 Turbo de OpenAI, realizada por el usuario Devsyril. La particularidad de este modelo es que expone los pesos de cross-attention como salida adicional del decodificador, lo que permite calcular marcas de tiempo (timestamps) a nivel de palabra mediante alineacion DTW (Dynamic Time Warping). Esta capacidad no esta disponible en los modelos Whisper estandar publicados para sherpa-onnx.

El modelo se genera con el script oficial `export-onnx-with-attention.py` del proyecto k2-fsa/sherpa-onnx e incluye versiones en FP32 y cuantizaciones int8 del encoder y el decodificador. Whisper Large V3 Turbo es una version podada de Whisper Large V3, con el numero de capas del decodificador reducido de 32 a 4, lo que lo hace significativamente mas rapido en inferencia manteniendo una calidad de transcripcion cercana al modelo original.

La relevancia de este modelo radica en que resuelve un problema practico en sistemas de transcripcion: la alineacion temporal precisa de cada palabra con el audio, necesaria para subtitulado, doblaje, analisis fonetico o sincronizacion de texto y audio. Al exponer los pesos de cross-attention, los desarrolladores pueden implementar alineacion DTW sin recurrir a herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large V3 Turbo) |
| Parametros totales | no disponible (version podada de Whisper Large V3 con 4 capas de decodificador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio (heredado de Whisper Large V3 Turbo) |
| Tipos de cuantizacion | FP32, int8 |
| Idiomas soportados | Multilingue (hereda de Whisper Large V3 Turbo; la model card no especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (.onnx, .weights) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura encoder-decoder de Whisper Large V3 Turbo: un encoder basado en transformer que procesa espectrogramas Mel del audio y un decodificador autoregresivo. La version Turbo reduce el numero de capas del decodificador de 32 a 4 respecto a Large V3, lo que acelera la inferencia de forma sustancial. El modelo original fue entrenado por OpenAI con aproximadamente un millon de horas de audio etiquetado; esta reexportacion no anade entrenamiento adicional, solo convierte los pesos al formato ONNX y expone las salidas de cross-attention.

La innovacion tecnica principal es la exposicion de los pesos de cross-attention como cuarta salida del decodificador, con forma `[n_audio, n_alignment_heads, n_tokens, n_audio_ctx]`. Las cuatro salidas del decodificador son: `logits`, `out_n_layer_self_k_cache`, `out_n_layer_self_v_cache` y `cross_attention_weights`. Estos pesos permiten implementar alineacion DTW para obtener timestamps por palabra, una funcionalidad que no ofrecen los modelos Whisper estandar publicados para sherpa-onnx. El proceso de exportacion utiliza el script oficial de k2-fsa/sherpa-onnx.

## Capacidades

- Transcripcion automatica de voz (ASR) multilingue, heredada de Whisper Large V3 Turbo.
- Traduccion de audio a texto en ingles (capacidad estandar de Whisper).
- Generacion de timestamps a nivel de palabra mediante alineacion DTW con los pesos de cross-attention expuestos.
- Cuantizacion int8 disponible para reducir el uso de memoria y acelerar la inferencia.
- Inferencia en Python con ONNX Runtime, con control total sobre el proceso de decodificacion.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente de reconocimiento de voz.

## Casos de uso

- Subtitulado automatico con sincronizacion palabra a palabra: los timestamps por palabra permiten generar subtitulos con tiempos precisos, algo que los modelos Whisper estandar no ofrecen directamente.
- Alineacion forzada (forced alignment) para corpus de entrenamiento: util para preparar datasets de TTS o ASR donde se necesita saber exactamente cuando se pronuncia cada palabra.
- Analisis fonetico y linguistico: investigadores pueden estudiar los patrones de atencion cross-modal entre el audio y el texto generado.
- Transcripcion en tiempo real con baja latencia: la version Turbo con 4 capas de decodificador es significativamente mas rapida que Large V3, adecuada para aplicaciones de streaming.
- Pipelines de post-procesado de audio: integracion en flujos Python con ONNX Runtime para transcripcion y sincronizacion de podcasts, videos o grabaciones de reuniones.
- Investigacion sobre mecanismos de atencion en Whisper: los pesos de cross-attention expuestos permiten visualizar y analizar como el modelo alinea audio y texto internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento en tareas ASR corresponde al de Whisper Large V3 Turbo, que en las evaluaciones de OpenAI muestra una tasa de error (WER) cercana a la de Large V3 con una latencia muy inferior, pero no se dispone de cifras concretas en la documentacion de este repositorio.

## Requisitos de hardware

- Tamano del repositorio: 3,6 GB, incluyendo versiones FP32 e int8 de encoder y decodificador.
- VRAM estimada: para la version FP32 se recomiendan al menos 4-6 GB de VRAM; con cuantizacion int8 puede reducirse a 2-4 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060 o superior, A100, H100) o aceleradores compatibles con ONNX Runtime.
- Es viable en GPUs de consumo: si, una RTX 3060 o superior puede ejecutar el modelo en FP32 o int8 sin problemas.
- Opciones de despliegue: ONNX Runtime en Python, con posibilidad de integrarse en servidores de inferencia personalizados. No es compatible directamente con la API C++ estandar de sherpa-onnx debido al formato no estandar de las salidas.
- Latencia y throughput: no disponibles en la documentacion, aunque la arquitectura Turbo (4 capas de decodificador) es sustancialmente mas rapida que Whisper Large V3.

## Comparativa con modelos similares

| Modelo | Formato | Timestamps por palabra | Compatibilidad sherpa-onnx | Licencia |
|---|---|---|---|---|
| Devsyril/whisper-large-v3-turbo-onnx-attention | ONNX | Si (via DTW) | Parcial (formato no estandar) | Apache 2.0 |
| Devsyril/whisper-large-v3-turbo-onnx-timestamps | ONNX | Si | Parcial | Apache 2.0 |
| csukuangfj/sherpa-onnx-whisper-* (estandar) | ONNX | No | Total | Apache 2.0 |
| openai/whisper-large-v3-turbo | PyTorch | No | No | MIT |

## Limitaciones y advertencias

- Formato no estandar: la salida `cross_attention_weights` no existe en los modelos Whisper publicados habitualmente para sherpa-onnx. Un runtime sherpa-onnx estandar (C++, Kotlin, Swift) no consume esta salida adicional.
- Disenado para inferencia Python personalizada: el modelo esta pensado para usarse con ONNX Runtime y alineacion DTW en Python, no con la API C++ estandar de sherpa-onnx.
- Ventana de audio limitada: hereda la limitacion de Whisper de procesar segmentos de 30 segundos, por lo que audios mas largos requieren segmentacion previa.
- Sin datos de entrenamiento especificos: al ser una reexportacion, no se aporta informacion sobre el dataset de entrenamiento mas alla de la del modelo original de OpenAI.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio en condiciones de ruido o audio de baja calidad.
- Idiomas no documentados: la model card no especifica la lista de idiomas soportados, aunque Whisper Large V3 Turbo es multilingue de forma nativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Devsyril/whisper-large-v3-turbo-onnx-attention
- Modelo relacionado (timestamps): https://huggingface.co/Devsyril/whisper-large-v3-turbo-onnx-timestamps
- Discusion en sherpa-onnx sobre el formato: https://github.com/k2-fsa/sherpa-onnx/discussions/2942
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Whisper Large V3 Turbo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/whisper_large_v3_turbo
