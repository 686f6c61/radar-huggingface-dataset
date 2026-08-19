# mobilebytesensei/betterflow-salesken-hindi-streaming

## Resumen

`betterflow-salesken-hindi-streaming` es un modelo de reconocimiento de voz automático (ASR) en streaming para hindi, publicado por el usuario mobilebytesensei. Se trata de una exportación a formato ONNX cuantizado del modelo `salesken/Hindi-FastConformer-Streaming-ASR`, que a su vez deriva de `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi` y ha sido fine-tuneado sobre el corpus `ai4bharat/IndicVoices-ST`. El modelo está pensado para ejecutarse en dispositivos (on-device) mediante la librería sherpa-onnx, ofreciendo transcripción en tiempo real con partials (resultados parciales) de baja latencia.

La arquitectura es un FastConformer (basada en conformer) con decodificación CTC y streaming. El modelo se distribuye en un único archivo ONNX de 174 MB con cuantización int8 aplicada únicamente a las operaciones MatMul, una decisión técnica documentada que evita la degradación severa del rendimiento observada al cuantizar convoluciones. El contexto de streaming es de 121 frames (1,21 segundos), lo que permite emitir el primer partial en aproximadamente 1.210 ms.

La relevancia de este modelo radica en su carácter práctico: ofrece una versión ligera y lista para producción de un sistema ASR hindi de alta calidad, con métricas de WER competitivas en el benchmark `vaani-bench-hi` (0.328 en streaming) y una licencia Apache-2.0 que permite uso comercial. Sin embargo, está estrictamente limitado al hindi y no soporta código-switching (Hinglish), además de requerir un parche específico en sherpa-onnx para el correcto cálculo del filtro mel de librosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (conformer) con CTC y streaming |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 121 frames (1,21 s) por partial; chunk shift de 112 frames |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de MatMul) |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.int8.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer de NVIDIA, que combina capas de conformer con mecanismos de atención y convoluciones, optimizada para streaming mediante una ventana deslizante. En concreto, el modelo original `nvidia/stt_en_fastconformer_hybrid_large_streaming_multi` fue fine-tuneado sobre `ai4bharat/IndicVoices-ST` para adaptarlo al hindi, y posteriormente exportado a ONNX con cuantización int8.

La exportación realizada por mobilebytesensei sigue una receta propia que difiere de la referencia de NVIDIA: solo se cuantizan las operaciones MatMul, dejando las convoluciones en punto flotante. Esta decisión se justifica con mediciones empíricas: cuantizar también las convoluciones produce un modelo que emite únicamente blanks (WER 1.000), mientras que la cuantización solo de MatMul mantiene un WER de 0.189 en comparación con el modelo fp32 (0.216). El modelo resultante tiene un tamaño de 174 MB, frente a los 458 MB del fp32.

Un aspecto técnico crítico es que el modelo declara `normalize_type` vacío, lo que implica que no aplica normalización per-feature. Además, sherpa-onnx no configura el filtro mel de librosa en su ruta de online CTC (a diferencia de otras rutas NeMo), lo que provoca un error de features de 4.11 con el filtro incorrecto y 0.79 con el correcto. Sin el parche adecuado, el modelo produce transcripciones fluidas pero incorrectas. El autor recomienda aplicar una corrección en `online-recognizer-ctc-impl.h`.

## Capacidades

- Reconocimiento de voz en streaming para hindi, con emisión de partials en tiempo real (primer partial a 1.210 ms).
- Soporte para ejecución on-device gracias a la cuantización int8 y al formato ONNX, compatible con sherpa-onnx.
- Decodificación CTC con vocabulario de 1.023 tokens (1024 + blank), mayoritariamente Devanagari.
- Capacidad de procesamiento de audio con feature_dim=80 (filtros mel).
- No soporta tool calling, agentes ni razonamiento multi-step (es exclusivamente ASR).
- Limitado al hindi; no maneja Hinglish ni otros idiomas.

## Casos de uso

- **Transcripción en tiempo real de llamadas de atención al cliente en hindi**: el modelo puede integrarse en sistemas de call center para generar subtítulos o análisis de conversaciones en vivo. Su latencia de 1.210 ms para el primer partial permite seguimiento casi inmediato, y el tamaño reducido facilita el despliegue en servidores modestos o incluso en dispositivos de borde.
- **Asistentes de voz en dispositivos móviles**: al ser un modelo ONNX int8 de 174 MB, cabe en aplicaciones móviles sin requerir conexión a internet. Puede usarse para comandos de voz en hindi, dictado o búsqueda por voz.
- **Subtitulado en vivo de reuniones o conferencias**: su capacidad de streaming permite generar subtítulos en tiempo real durante presentaciones o videollamadas, siempre que el audio esté en hindi. La baja latencia es adecuada para este uso.
- **Análisis de sentimiento en conversaciones telefónicas**: combinado con un modelo de NLP, puede transcribir llamadas en hindi para extraer métricas de satisfacción del cliente o detectar problemas recurrentes.
- **Accesibilidad para personas con discapacidad auditiva**: en entornos donde el hindi es la lengua principal, el modelo puede convertir voz a texto en tiempo real para facilitar la comunicación en reuniones o eventos.
- **Grabación y archivado de contenido audiovisual**: transcripción automática de vídeos, podcasts o programas de radio en hindi, con la ventaja de que el streaming permite procesar flujos de audio continuos sin esperar a la finalización del archivo.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card y se refieren al benchmark `vaani-bench-hi` (n=200), con evaluación en modo streaming (chunked cache-aware) y con el filtro mel correcto.

| Configuracion | WER (mediana) |
|---|---|
| Export ONNX int8, streaming | 0.328 |
| Export ONNX int8, streaming sin parche de filtro mel | 0.591 |
| Offline a traves de NeMo (techo) | 0.287 |

Además, se reporta que el primer partial llega a los 1.210 ms (121 frames × 10 ms), un límite arquitectónico que no mejora con hardware más rápido. En comparación con el modelo fp32, la cuantización int8 no degrada el rendimiento (0.107 vs 0.108 en tail-padded, según la model card).

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser un modelo ONNX int8 de 174 MB, puede ejecutarse en CPU sin necesidad de GPU, aunque los tiempos de inferencia dependerán del hardware.
- **GPUs recomendadas**: no se especifican. Dado el tamaño, cualquier GPU con al menos 2 GB de VRAM podría ejecutarlo, pero no hay datos oficiales.
- **Compatibilidad con consumer GPU**: sí, es razonablemente ligero para tarjetas como RTX 3060 o superiores, aunque no se requiere GPU para su funcionamiento.
- **Opciones de despliegue**: sherpa-onnx (soporta CPU, GPU, y plataformas móviles), también puede cargarse en otros runtimes ONNX como ONNX Runtime. No se menciona compatibilidad con vLLM u Ollama (no es un modelo generativo).
- **Latencia y throughput**: el primer partial se emite a 1.210 ms; el throughput no está documentado, pero al ser un modelo de streaming con subsampling factor 8, es adecuado para tiempo real en CPU modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR en streaming para hindi en la información proporcionada. El modelo base `salesken/Hindi-FastConformer-Streaming-ASR` es la referencia directa, y el modelo original de NVIDIA `stt_en_fastconformer_hybrid_large_streaming_multi` sirve como origen, pero no se ofrecen comparaciones con alternativas como Whisper o modelos específicos de hindi. Por tanto, esta sección queda sin datos.

## Limitaciones y advertencias

- **Solo hindi**: el vocabulario es 96% Devanagari (985 de 1.023 entradas) y solo 4 entradas contienen caracteres latinos, por lo que no puede transcribir inglés ni Hinglish. En código-switching hindi-inglés, el WER empeora 12 puntos respecto a un modelo con vocabulario de caracteres.
- **Requisito de parche en sherpa-onnx**: sin la corrección del filtro mel de librosa, el modelo produce transcripciones fluidas pero incorrectas (WER 0.591 vs 0.328). Es imprescindible aplicar el parche documentado antes de usar el modelo en producción.
- **Prohibición de evaluación en corpus AI4Bharat**: el modelo fue entrenado sobre IndicVoices-ST, por lo que evaluarlo en cualquier corpus de AI4Bharat invalidaría los resultados.
- **Cuantización sensible**: cuantizar las convoluciones rompe el modelo (emite solo blanks). La cuantización solo de MatMul es la opción viable, pero limita el tamaño mínimo alcanzable.
- **Riesgo de alucinaciones**: como todo ASR, puede generar transcripciones incorrectas en condiciones de ruido o acentos no representados en los datos de entrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mobilebytesensei/betterflow-salesken-hindi-streaming)
- [Modelo base: salesken/Hindi-FastConformer-Streaming-ASR](https://huggingface.co/salesken/Hindi-FastConformer-Streaming-ASR)
- [Modelo original de NVIDIA (referencia)](https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_streaming_multi)
