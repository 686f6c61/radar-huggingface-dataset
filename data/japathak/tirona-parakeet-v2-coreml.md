# japathak/tirona-parakeet-v2-coreml

## Resumen

`japathak/tirona-parakeet-v2-coreml` es un espejo parcial del repositorio `FluidInference/parakeet-tdt-0.6b-v2-coreml`, publicado por el autor `japathak` para que la aplicación Tirona no descargue cientos de megabytes desde un repositorio que no controla. El modelo subyacente es una versión optimizada para CoreML de NVIDIA Parakeet TDT 0.6B v2, un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura FastConformer con decodificación por transducer (RNN-T) y una cabeza de duración (TDT). Está diseñado para ejecutarse en dispositivos Apple, aprovechando el Neural Engine (ANE) para transcripción en tiempo real sin dependencia de la nube.

Este espejo contiene únicamente los cuatro bundles CoreML que la aplicación Tirona necesita (`Preprocessor`, `Encoder`, `Decoder`, `JointDecision`), junto con el vocabulario y la configuración. Los archivos son idénticos byte a byte a los del repositorio original, pero se omiten deliberadamente otras variantes de encoder y componentes auxiliares. La licencia es CC BY 4.0, heredada del modelo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + LSTM predictor + TDT joint (CoreML) |
| Parametros totales | 0.6B (segun referencias externas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato CoreML nativo) |
| Idiomas soportados | Ingles (segun referencias externas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA Parakeet TDT 0.6B v2 emplea un encoder FastConformer (una variante eficiente de Conformer) que procesa la forma de onda de audio, un predictor basado en LSTM para la red de prediccion RNN-T, y una red conjunta (joint network) con una cabeza de duracion adicional (TDT, Token-and-Duration Transducer). Esta arquitectura permite una decodificacion en streaming con baja latencia, adecuada para transcripcion en tiempo real.

La version CoreML convierte estos componentes en grafos de ejecucion optimizados para el Neural Engine de Apple, manteniendo la misma logica de inferencia pero con kernels especificos para hardware Apple. Los datos de entrenamiento del modelo original no se detallan en la informacion disponible, pero se sabe que fue entrenado exclusivamente para ingles. El repositorio espejo no incluye informacion sobre el proceso de entrenamiento ni sobre ajustes adicionales.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles, con salida de texto transcrito.
- Inferencia en streaming, disenada para transcripcion en tiempo real en dispositivos Apple.
- Optimizado para el Neural Engine (ANE) de Apple, lo que permite ejecucion local sin conexion.
- Compatible con la aplicacion Tirona, que lo utiliza como motor de transcripcion integrado.
- No incluye capacidades de generacion de texto, tool calling, agentes ni vision; es un modelo puramente de ASR.

## Casos de uso

- Transcripcion de voz a texto en tiempo real en aplicaciones iOS/macOS: el modelo se ejecuta localmente en el dispositivo, procesando el audio del microfono y generando texto con baja latencia, ideal para dictado o subtitulado en vivo.
- Asistente de voz sin conexion: al no requerir servidores externos, puede integrarse en apps de productividad o accesibilidad que necesiten privacidad y funcionamiento offline.
- Procesamiento de audio pre-grabado: aunque esta disenado para streaming, tambien puede transcribir archivos de audio en lote, por ejemplo para generar subtitulos o actas de reuniones.
- Integracion en aplicaciones de terceros via CoreML: los bundles `.mlmodelc` pueden importarse en proyectos Xcode y usarse con el framework CoreML de Apple, permitiendo a desarrolladores anadir ASR a sus propias apps.
- Pruebas de concepto de ASR en hardware Apple: sirve como referencia para evaluar el rendimiento de Parakeet en dispositivos con Neural Engine, comparando con otras soluciones como Whisper.
- Uso interno en la app Tirona: el espejo garantiza que la aplicacion tenga acceso estable a los archivos necesarios sin depender de la disponibilidad del repositorio upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio espejo no incluye metricas de exactitud (WER) ni comparaciones con otros modelos. Se recomienda consultar el repositorio original de NVIDIA o la documentacion de Parakeet para datos de rendimiento.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine (ANE): iPhone, iPad y Mac con chip M1 o posterior, o A12 Bionic o posterior.
- VRAM: no aplica directamente, ya que CoreML gestiona la memoria unificada del dispositivo; el tamano del repositorio es de 0.5 GB, lo que da una idea del espacio en disco necesario.
- GPU: no se requiere GPU dedicada; el ANE es el principal acelerador.
- Opciones de despliegue: integracion directa en apps iOS/macOS mediante CoreML; no se mencionan opciones como vLLM u Ollama, ya que es un formato especifico de Apple.
- Latencia y throughput: no se proporcionan datos concretos, pero al estar optimizado para ANE se espera transcripcion en tiempo real en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v2 (NVIDIA) | 0.6B | no disponible | CC BY 4.0 | NeMo/PyTorch | Modelo original, no optimizado para Apple |
| Parakeet TDT 0.6B v2 CoreML (FluidInference) | 0.6B | no disponible | CC BY 4.0 | CoreML | Version completa con todos los archivos |
| tirona-parakeet-v2-coreml (este) | 0.6B | no disponible | CC BY 4.0 | CoreML | Espejo parcial, solo bundles necesarios para Tirona |

No se dispone de comparaciones con otros ASR como Whisper o Wav2Vec2 en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo parcial: no incluye todas las variantes de encoder ni componentes como `ParakeetEncoder*.mlmodelc`, `RNNTJoint` o `Melspectogram`. Si se necesita la funcionalidad completa, debe usarse el repositorio upstream.
- Solo soporta ingles; no es adecuado para otros idiomas.
- No se proporcionan datos de entrenamiento ni de sesgos; se asume que el modelo original puede tener sesgos tipicos de los datos de habla inglesa.
- Riesgo de alucinacion en transcripcion: como cualquier ASR, puede producir errores en audio ruidoso o con acentos no representados.
- La licencia CC BY 4.0 permite uso comercial, pero requiere atribucion a NVIDIA Corporation.
- El repositorio espejo no tiene garantias de mantenimiento; depende del autor `japathak` y puede quedar desactualizado si el upstream cambia.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/japathak/tirona-parakeet-v2-coreml
- Repositorio upstream (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v2-coreml
- Repositorio alternativo (aoiandroid): https://huggingface.co/aoiandroid/parakeet-tdt-0.6b-v2-coreml
- Referencia de arquitectura (GitHub coreai-model-zoo): https://github.com/john-rocky/coreai-model-zoo/tree/main/models/parakeet-v2
- Biblioteca parakeet-coreml (GitHub): https://github.com/sebastian-software/parakeet-coreml
