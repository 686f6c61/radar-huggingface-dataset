# q3146dq4/Supertonic-3-LiteRT

## Resumen

Supertonic-3-LiteRT es una conversión del modelo de síntesis de voz (TTS) Supertonic-3 al formato LiteRT (TensorFlow Lite), diseñada para ejecutarse en dispositivos Android, especialmente en hardware con NPU de Qualcomm. El modelo original, desarrollado por Supertone Inc., es un sistema de texto a voz de 99 millones de parámetros, no autoregresivo, basado en flow-matching, que funciona en CPU sin necesidad de GPU ni conexión a la nube. Esta versión LiteRT, publicada por q3146dq4 como espejo de la conversión de Soniqo Audio, empaqueta los cuatro grafos de inferencia (text_encoder, duration_predictor, vector_estimator y vocoder) en formato .tflite para su ejecución on-device.

La relevancia de este modelo radica en su capacidad de ofrecer TTS multilingüe (31 idiomas) con baja latencia en dispositivos móviles, sin depender de servidores externos. La conversión se realizó mediante un pipeline propio que evita los fallos de conversión ONNX→TFLite (problemas de layout NCHW/ConvNeXt) utilizando torch.export y StableHLO. El repositorio incluye los pesos en FP32, aunque se menciona la posibilidad de cuantización int8/int4 para residir completamente en la NPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching no autoregresivo (4 grafos: text_encoder, duration_predictor, vector_estimator, vocoder) |
| Parametros totales | 99 millones (según web oficial) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | shapes fijas: T=128 (texto), L=64 (latentes); contexto dinámico no disponible |
| Tipos de cuantizacion | FP32 (en este repositorio); int8/int4 PTQ mencionado como trabajo futuro |
| Idiomas soportados | 31 idiomas (multilingüe) |
| Licencia | OpenRAIL-M (con restricciones de uso) |
| Formato de pesos | .tflite (LiteRT/TFLite) |

## Arquitectura y entrenamiento

Supertonic-3 es un modelo TTS no autoregresivo que utiliza flow-matching para generar la representación acústica. La arquitectura se compone de cuatro módulos independientes: un codificador de texto que procesa la entrada lingüística, un predictor de duración que estima la duración de cada token, un estimador de vectores (denoiser ODE) que aplica un bucle de flow-matching para refinar la representación latente, y un vocoder que convierte la representación en forma de onda de audio. El entrenamiento original de Supertone se basa en una combinación de datos de voz multilingües, aunque no se han publicado detalles específicos sobre el dataset ni el procedimiento de entrenamiento (RLHF/DPO no aplica en TTS). La conversión LiteRT se realizó mediante un pipeline propio que levanta los pesos de los initializers ONNX del modelo base, los convierte a PyTorch y luego a TFLite a través de litert_torch.convert (torch.export → StableHLO → TFLite). Esta aproximación evita los fallos de layout de onnx2tf para capas ConvNeXt.

## Capacidades

- Generación de voz natural a partir de texto en 31 idiomas.
- Funcionamiento totalmente offline y en el dispositivo (on-device).
- Compatibilidad con Android TextToSpeechService para integración nativa.
- Ejecución en CPU/GPU mediante el intérprete LiteRT con delegados XNNPACK o GPU.
- Soporte de ejecución en NPU Qualcomm (HTP) mediante el delegado QNN o compilación a contexto binario con Qualcomm AI Hub.
- No incluye soporte de tool calling, agentes ni razonamiento multi-paso (es un modelo TTS puro).

## Casos de uso

- **Lector de pantalla para accesibilidad**: el modelo se integra como motor TTS nativo en Android, permitiendo a personas con discapacidad visual escuchar el contenido de la pantalla de forma fluida y con baja latencia en dispositivos móviles.
- **Aplicación de lectura offline**: una app de libros o noticias puede convertir texto a voz sin conexión, gracias a los 99M de parámetros que caben en memoria y a la ejecución en CPU/NPU.
- **Asistente de voz en el dispositivo**: el modelo puede usarse como componente de salida de voz en asistentes virtuales que funcionan sin conexión, por ejemplo en un dispositivo de punto de venta o en un kiosco interactivo.
- **Sistema de navegación GPS**: integración en aplicaciones de mapas para leer indicaciones en voz alta, con soporte multilingüe y sin depender de servidores.
- **Generación de audiolibros en tiempo real**: una app puede convertir un texto largo (por ejemplo, un artículo de noticias) en audio mientras se desplaza por la pantalla, con baja latencia gracias al bucle de flow-matching ejecutado en el host.
- **Plataforma de teleasistencia**: para sistemas de telemedicina o teleasistencia que requieren que el dispositivo hable en el idioma del paciente, con capacidad de cambiar de voz o estilo mediante los archivos `voice_styles/*.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo es TTS y no de texto general. La información disponible incluye la paridad numérica entre los grafos TFLite y el ONNX Runtime original, medida en FP32:

| Módulo | Tamaño del archivo | Paridad máxima |Δ| |
|---|---|---|---|
| `duration_predictor.tflite` | 3.4 MB | 4.1e-05 ✓ |
| `vector_estimator.tflite` (ODE denoiser) | 244 MB | 5.6e-03 ✓ |
| `vocoder.tflite` | 97 MB | 2.6e-04 ✓ |
| `text_encoder.tflite` | 34 MB | 1.1e-01 (localizado; media ~2.5e-4) ⚠️ |

La paridad en `text_encoder` presenta un error máximo localizado de 1.1e-01, aunque la media se mantiene en ~2.5e-4, lo que podría afectar ligeramente la calidad en casos extremos.

## Requisitos de hardware

- **VRAM**: no aplica, es un modelo para dispositivos móviles; la memoria ocupada es el peso total de los archivos .tflite (aprox. 380 MB en FP32).
- **GPU**: no requiere GPU dedicada; funciona en CPU (XNNPACK) y GPU integrada (delegate LiteRT).
- **NPU**: Qualcomm HTP (Hexagon) mediante el delegado QNN; también se puede compilar a un contexto binario con Qualcomm AI Hub.
- **Plataformas**: Android con API compatible con LiteRT (ai_edge_litert / TFLite).
- **Opciones de despliegue**: intérprete LiteRT en la app, o compilación a contexto QNN para ejecución en NPU.
- **Latencia**: no se proporcionan cifras exactas; se describe como "lightning-fast" en la web oficial, pero no hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|---|
| Supertonic-3-LiteRT (este) | .tflite | 99M | fijo T=128, L=64 | 31 | OpenRAIL-M | Android on-device |
| Supertonic-3 (ONNX INT8) | ONNX | 99M | no especificado | 31 | OpenRAIL-M | Servidor/escritorio (ONNX Runtime) |
| Supertonic-3 (CoreML) | .mlpackage | 99M | no especificado | 31 | OpenRAIL-M | iOS / Apple Neural Engine |
| VoxCPM2-LiteRT-INT8 | .tflite | no disponible | no disponible | no disponible | no disponible | TTS on-device (otro modelo) |
| Parakeet TDT 0.6B v3-LiteRT-INT8 | .tflite | 0.6B | no disponible | no disponible | no disponible | ASR on-device |

La comparación se limita a las versiones del mismo modelo en otros formatos y a otros modelos TTS/ASR de la misma colección. No hay datos de rendimiento comparativo en benchmarks estándar.

## Limitaciones y advertencias

- **Shapes fijas**: el modelo actual requiere fijar la longitud del texto a 128 tokens y la longitud del latente a 64, lo que obliga a hacer padding o segmentación del texto de entrada; las dimensiones dinámicas se indican como trabajo futuro.
- **Paridad del text encoder**: el error máximo de 1.1e-01 en el text encoder puede provocar ligeras diferencias en la prosodia o en la pronunciación en casos extremos.
- **Cuantización no incluida**: este repositorio solo contiene pesos FP32; la cuantización int8/int4 para ejecución completa en NPU está pendiente.
- **Licencia OpenRAIL-M**: restricciones de uso basadas en el modelo original (p. ej., prohibido su uso en actividades ilegales o dañinas); aplican también a este espejo.
- **Sesgos**: al ser un modelo TTS, puede presentar sesgos en la pronunciación de ciertos acentos o dialectos, aunque no se documentan explícitamente.
- **Sin garantías de calidad de voz**: no se publican evaluaciones subjetivas de naturalidad ni comparativas con otros TTS.

## Enlaces

- HuggingFace (este repositorio): [q3146dq4/Supertonic-3-LiteRT](https://huggingface.co/q3146dq4/Supertonic-3-LiteRT)
- GitHub (motor Android): [q3146dq4/supertonic-liteRT-TTS](https://github.com/q3146dq4/supertonic-liteRT-TTS)
- Sitio web de Supertonic 3: [https://supertonic3.github.io/](https://supertonic3.github.io/)
- Paper: [arXiv:2503.23108](https://arxiv.org/abs/2503.23108)
- Modelo base (Supertone): [Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3)
- Conversión ONNX INT8: [soniqo/Supertonic-3-ONNX-INT8](https://huggingface.co/soniqo/Supertonic-3-ONNX-INT8)
- Conversión CoreML: [aufklarer/Supertonic-3-CoreML](https://huggingface.co/aufklarer/Supertonic-3-CoreML)
- Ecosistema soniqo: [soniqo.audio](https://soniqo.audio), [speech-core](https://github.com/soniqo/speech-core), [speech-android](https://github.com/soniqo/speech-android), [speech-swift](https://github.com/soniqo/speech-swift)
