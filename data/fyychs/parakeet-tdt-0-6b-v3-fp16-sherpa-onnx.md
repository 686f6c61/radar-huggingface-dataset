# fyychs/parakeet-tdt-0.6b-v3-fp16-sherpa-onnx

## Resumen

Parakeet TDT 0.6B v3 fp16 para sherpa-onnx es una exportación optimizada del encoder del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por el usuario fyychs. No se trata de un modelo nuevo, sino de una conversión a FP16 de las capas conformer del encoder ONNX generado por el proyecto k2-fsa para sherpa-onnx, con el objetivo de reducir el peso en disco de 2,44 GB a 1,27 GB manteniendo la precisión del encoder FP32.

El problema que resuelve es concreto: la cuantización INT8 del encoder en la exportación oficial de sherpa-onnx degrada gravemente el reconocimiento en audio de campo lejano (por ejemplo, una clase grabada con un móvil), devolviendo apenas un 40 % de las palabras que produce el encoder FP32. Esta versión FP16 iguala al FP32 en ese escenario (1156 frente a 1170 palabras en un tramo de prueba) con la mitad de tamaño, y se puede usar como sustituto directo en sherpa-onnx.

La arquitectura subyacente es un modelo FastConformer con decodificación TDT (Token-and-Duration Transducer) de NVIDIA, con 0,6 mil millones de parámetros, orientado a transcripción multilingüe en 25 idiomas europeos. Esta ficha describe la exportación FP16, no el modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer); exportacion ONNX del encoder |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas fijas de 20 s en las pruebas del autor) |
| Tipos de cuantizacion | FP16 (encoder de esta ficha); INT8 disponible en la exportacion de referencia; FP32 de referencia |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder FP16; decoder y joiner INT8; tokens.txt) |

## Arquitectura y entrenamiento

El modelo base es Parakeet TDT 0.6B v3 de NVIDIA, un sistema ASR end-to-end basado en FastConformer (una variante eficiente del Conformer con downsampling agresivo en las primeras capas) acoplado a un decodificador TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un transducer clásico y mejora el throughput. El modelo cubre 25 idiomas europeos y está pensado para transcripción multilingüe.

Esta exportación no reentrena ni modifica los pesos: parte del encoder FP32 exportado por k2-fsa para sherpa-onnx, aplica inferencia de formas ONNX (`infer_shapes_path`, necesaria para modelos de más de 2 GB) y convierte a FP16 con `onnxruntime.transformers.float16.convert_float_to_float16` usando `keep_io_types=True` y bloqueando todos los nodos fuera de `/layers.*`. El front-end convolucional y los nodos externos a las capas permanecen en FP32, igual que las entradas y salidas, de modo que el modelo se puede intercambiar con el encoder FP32 o INT8 sin cambiar el resto del pipeline. El script de conversión (`convert_fp16.py`) está incluido en el repositorio.

No se dispone de información sobre el dataset de entrenamiento del modelo original (número de tokens, composición, uso de RLHF) en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Funcionamiento con ventanas de audio fijas (20 s en las pruebas del autor) mediante sherpa-onnx.
- Sustitución directa del encoder FP32 o INT8 en pipelines sherpa-onnx existentes, manteniendo decoder, joiner y tokens.
- Ejecución en CPU mediante onnxruntime (probado en escritorio x86; ARM con aritmética FP16 sin probar según el autor).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es exclusivamente un modelo ASR.

## Casos de uso

- Transcripción de clases y conferencias en campo lejano: el escenario que motivó la exportación (una clase universitaria en alemán grabada con un móvil) muestra que el encoder FP16 recupera prácticamente todas las palabras que produce el FP32, mientras que el INT8 devuelve solo en torno al 40 %. Adecuado para grabar desde una butaca sin micrófono de solapa.
- Subtitulado y actas de reuniones multilingües: al cubrir 25 idiomas europeos, un mismo despliegue puede transcribir reuniones en alemán, francés, polaco o español sin cambiar de modelo.
- Transcripción de archivos de audio de larga duración por troceado: el pipeline sherpa-onnx procesa ventanas fijas de 20 s, de modo que se puede encadenar la transcripción de audios largos dividiéndolos en segmentos.
- Despliegue en servidores sin GPU: al ejecutarse con onnxruntime en CPU y ocupar 1,27 GB el encoder, encaja en entornos con memoria limitada donde un encoder FP32 de 2,44 GB no cabría con holgura.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de corpus de audio en varios idiomas europeos con una licencia CC BY 4.0 que permite uso comercial con atribución.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de conversaciones presenciales en dispositivos de sobremesa, sustituyendo el encoder INT8 cuando la precisión en audio ruidoso es prioritaria.
- Integración en pipelines de k2-fsa/sherpa-onnx ya existentes: al mantener las interfaces FP32 en entradas y salidas, se puede cambiar el encoder por esta versión sin tocar el código de la aplicación.

## Benchmarks y rendimiento

El autor publica una comparación de encoders sobre dos tramos de diez minutos de una clase en alemán grabada en campo lejano (sherpa-onnx 2.0.1, CPU, ventanas fijas de 20 s). La "concordancia" mide el acuerdo de palabras con doce transcripciones de referencia del mismo audio, producidas por otros modelos y servicios.

| Encoder | Palabras tramo A / B | Concordancia A / B |
|---|---|---|
| INT8 (exportacion sherpa-onnx) | 515 / 275 | 31 / 7 |
| FP32 (exportacion sherpa-onnx) | 1170 / 983 | 73 / 64 |
| FP16 (este archivo) | 1156 / 969 | 73 / 64 |

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, FLEURS u otros) en la información disponible. El autor indica que en habla cercana y limpia la diferencia entre encoders es pequeña, y que el consumo de memoria y la velocidad dependen de cómo onnxruntime ejecute FP16 en cada dispositivo: en un escritorio x86 convirtió de vuelta a FP32 al cargar y necesitó más memoria que el encoder FP32.

## Requisitos de hardware

- VRAM: no aplica para ejecución en CPU; el encoder FP16 ocupa 1,27 GB en disco frente a 2,44 GB del FP32. En GPU, la memoria depende del backend de onnxruntime y no está documentada.
- GPU recomendadas: no disponible; el autor solo documenta ejecución en CPU x86.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; el autor señala que los dispositivos ARM con aritmética FP16 están sin probar.
- Despliegue: sherpa-onnx (versión 2.0.1 en las pruebas) con onnxruntime; requiere el decoder y joiner INT8 de `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` junto con `tokens.txt`.
- Latencia y throughput: no disponibles de forma numérica; el autor advierte que en x86 la conversión interna a FP32 al cargar puede aumentar el uso de memoria respecto al encoder FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (encoder FP16) | 0,6 B | ventanas de 20 s en pruebas | 25 europeos | CC BY 4.0 | ONNX FP16 + INT8 |
| Encoder FP32 sherpa-onnx (mismo modelo base) | 0,6 B | ventanas de 20 s en pruebas | 25 europeos | CC BY 4.0 | ONNX FP32 |
| Encoder INT8 sherpa-onnx (mismo modelo base) | 0,6 B | ventanas de 20 s en pruebas | 25 europeos | CC BY 4.0 | ONNX INT8 |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 0,6 B | no disponible | 25 europeos | CC BY 4.0 | NeMo (no ONNX) |

La comparación relevante es entre las tres exportaciones del mismo modelo base: el FP16 ofrece la precisión del FP32 con la mitad de tamaño, mientras que el INT8 reduce aún más el peso pero degrada gravemente el reconocimiento en campo lejano según las mediciones del autor. No se dispone de comparación con otros modelos ASR de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo se exporta el encoder; es imprescindible usar el decoder y joiner INT8 de la exportación de referencia, junto con `tokens.txt`.
- El rendimiento en campo lejano está medido sobre un único corpus (dos tramos de diez minutos de una clase en alemán), no sobre benchmarks estandarizados.
- En habla cercana y limpia la ventaja frente al INT8 es pequeña; el FP16 no aporta mejoras de precisión en ese escenario.
- En CPU x86, onnxruntime convirtió el modelo de vuelta a FP32 al cargar, con mayor consumo de memoria que el encoder FP32; no hay datos de dispositivos ARM con FP16.
- No hay datos publicados sobre sesgos, tasa de alucinación ni comportamiento en idiomas distintos de los 25 declarados.
- Licencia CC BY 4.0: permite uso comercial con atribución a NVIDIA (modelo original), al proyecto k2-fsa (exportación sherpa-onnx) y a Google FLEURS (clip de referencia).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente sin validación comunitaria amplia.
- No se documentan requisitos de GPU ni latencias, por lo que la planificación de producción debe basarse en pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fyychs/parakeet-tdt-0.6b-v3-fp16-sherpa-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación sherpa-onnx de referencia (FP32): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Exportación INT8 (decoder, joiner y tokens): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset FLEURS (clip de referencia): https://huggingface.co/datasets/google/fleurs
