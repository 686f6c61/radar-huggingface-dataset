# dekelabe/chords-align-he-int8

## Resumen

El modelo `dekelabe/chords-align-he-int8` es un export ONNX cuantizado dinámicamente a int8 (solo operaciones MatMul) del modelo `imvladikon/wav2vec2-large-xlsr-53-hebrew`, un wav2vec2 preentrenado en hebreo. Está diseñado específicamente para la alineación forzada de audio cantado en hebreo contra letras conocidas, es decir, para el seguimiento de posición dentro de una canción, no para transcripción. El modelo se utiliza en la aplicación "chords-app" como componente de alineación en el dispositivo.

La entrada consiste en `input_values` de tipo float32 con forma `[1, samples]`, correspondiente a audio mono a 16 kHz normalizado por ventana (z-normalization). La salida son logits con forma `[1, frames, vocab]` a una frecuencia de 50 fotogramas por segundo, donde el vocabulario se define en `vocab.json`. El modelo está publicado bajo licencia Apache-2.0 y está orientado al idioma hebreo.

Su relevancia radica en ofrecer una versión cuantizada y optimizada para inferencia en dispositivos, reduciendo el tamaño y la latencia respecto al modelo original, lo que permite ejecutar alineación de audio en tiempo real en aplicaciones móviles o de escritorio sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (export ONNX, cuantización dinámica int8 solo en MatMul) |
| Parametros totales | no disponible (basado en wav2vec2-large, se estima ~315M, pero no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de audio; el modelo procesa secuencias de muestras) |
| Tipos de cuantizacion | int8 dinámico (solo MatMul) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica; el repo contiene archivos ONNX) |

## Arquitectura y entrenamiento

El modelo base es `wav2vec2-large-xlsr-53-hebrew`, una variante de wav2vec2 preentrenada con el corpus XLSR-53 y fine-tuned para hebreo. wav2vec2 es un modelo transformer que aprende representaciones de audio mediante un objetivo de contraste y luego se fine-tune con una cabeza CTC para tareas de reconocimiento de voz. En este caso, el modelo se utiliza para alineación forzada, lo que implica que la salida CTC se emplea para alinear los fonemas o caracteres con los fotogramas de audio.

El export ONNX se ha cuantizado dinámicamente a int8 únicamente en las operaciones de multiplicación de matrices (MatMul), lo que reduce el tamaño del modelo y acelera la inferencia en CPU, manteniendo la precisión razonable para la tarea de alineación. No se dispone de información sobre el dataset de entrenamiento específico ni sobre el proceso de fine-tuning más allá de lo indicado en la model card.

## Capacidades

- Alineación forzada de audio cantado en hebreo contra letras conocidas, devolviendo la posición temporal de cada unidad del vocabulario.
- Salida a 50 fotogramas por segundo, lo que permite un seguimiento preciso de la posición dentro de la canción.
- Procesamiento de audio mono a 16 kHz con normalización por ventana.
- Inferencia en el dispositivo gracias a la cuantización int8 y al formato ONNX, sin necesidad de conexión a la nube.
- No realiza transcripción libre: está diseñado para trabajar con letras previamente conocidas.
- Vocabulario definido en `vocab.json`, lo que permite adaptar el modelo a distintos alfabetos o unidades (caracteres, fonemas, etc.).

## Casos de uso

- Aplicación de karaoke con seguimiento de letra: el modelo alinea la letra cantada con el audio en tiempo real, permitiendo resaltar la sílaba o palabra actual mientras el usuario canta.
- Entrenamiento de canto: una app puede usar la alineación para evaluar la sincronización del usuario con la letra original y dar retroalimentación sobre la precisión temporal.
- Análisis de interpretación musical: en una herramienta de análisis de acordes, el modelo permite sincronizar la letra con los acordes de la canción, facilitando la visualización de los cambios de acorde en el momento exacto.
- Subtitulado automático de canciones en hebreo: dado un audio y una letra, el modelo genera los timestamps de cada línea o palabra para crear subtítulos sincronizados.
- Accesibilidad: personas con discapacidad auditiva pueden seguir la letra de una canción en tiempo real mediante el resaltado de palabras, usando la alineación del modelo.
- Aplicaciones educativas de idiomas: para practicar pronunciación y ritmo en hebreo, el modelo puede indicar si el usuario está cantando en el momento correcto respecto a la letra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER, precisión de alineación o comparativas con otros modelos.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado int8, puede ejecutarse en CPU sin necesidad de GPU, aunque el rendimiento depende del número de núcleos y de la longitud del audio.
- Tamaño del repositorio: 2.9 GB, lo que sugiere que el modelo cuantizado ocupa aproximadamente ese espacio en disco (aunque el peso real del ONNX puede ser menor).
- Para inferencia en tiempo real en un dispositivo móvil, se recomienda un SoC moderno con soporte para aceleración de inferencia ONNX (por ejemplo, mediante CoreML en iOS o NNAPI en Android).
- En escritorio, cualquier CPU con al menos 4 núcleos puede ejecutar el modelo, aunque la latencia dependerá de la duración del audio.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), o integración en aplicaciones mediante los bindings de ONNX Runtime para Python, C++, C#, etc.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (alineación forzada de hebreo con cuantización int8). El modelo base `imvladikon/wav2vec2-large-xlsr-53-hebrew` es el punto de partida, pero no hay comparaciones publicadas con otras variantes cuantizadas o con modelos de alineación alternativos.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para alineación forzada con letras conocidas; no es adecuado para transcripción libre de audio.
- Solo soporta hebreo; no se ha entrenado para otros idiomas.
- La cuantización int8 dinámica puede degradar ligeramente la precisión en comparación con el modelo original en float32, aunque para la tarea de alineación suele ser aceptable.
- La normalización de entrada es por ventana (z-normalization), por lo que el audio debe preprocesarse de la misma manera que en el entrenamiento; un preprocesado incorrecto puede afectar al rendimiento.
- No se han publicado métricas de rendimiento ni estudios de sesgos; se desconoce su comportamiento en acentos, dialectos o condiciones de grabación variadas.
- El tamaño del repositorio (2.9 GB) puede ser elevado para aplicaciones móviles si se incluye el modelo completo; se recomienda evaluar la posibilidad de cuantización adicional o poda.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (`imvladikon/wav2vec2-large-xlsr-53-hebrew`) para asegurar compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dekelabe/chords-align-he-int8
- Modelo base original: https://huggingface.co/imvladikon/wav2vec2-large-xlsr-53-hebrew
- Perfil del autor: https://huggingface.co/dekelabe
- Modelo relacionado (alineación en inglés): https://huggingface.co/dekelabe/chords-align-en-ft3
