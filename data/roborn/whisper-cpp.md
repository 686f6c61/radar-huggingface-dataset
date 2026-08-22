# Roborn/whisper.cpp

## Resumen

El repositorio `Roborn/whisper.cpp` alberga una colección de modelos de reconocimiento automático del habla (ASR) de OpenAI, convertidos al formato GGML para su uso con la librería `whisper.cpp`. Este proyecto, desarrollado por el usuario Roborn, facilita la descarga y el despliegue local de los pesos de Whisper en entornos C/C++ sin dependencias de Python, lo que resulta especialmente útil para aplicaciones embebidas, de bajo consumo o con restricciones de hardware.

La relevancia de este repositorio radica en que `whisper.cpp` se ha convertido en un estándar de facto para la inferencia eficiente de Whisper en CPU y en plataformas con recursos limitados, gracias a su implementación optimizada con instrucciones SIMD (ARM Neon, AVX, VSX) y soporte para cuantización. Este repositorio centraliza las conversiones oficiales y cuantizadas de los modelos `tiny`, `base`, `small`, `medium`, `large-v1`, `large-v2`, `large-v3` y `large-v3-turbo`, todas bajo licencia MIT, con un tamaño total de 33,3 GB.

Aunque no se aportan métricas de rendimiento ni detalles de entrenamiento, la colección cubre toda la gama de modelos Whisper, desde los más ligeros (75 MiB) hasta los más grandes (2,9 GiB), incluyendo versiones cuantizadas a 5 y 8 bits que reducen el consumo de memoria y aceleran la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conversión de los modelos Whisper de OpenAI) |
| Parametros totales | No disponible (varían según el modelo: `tiny` ~39M, `base` ~74M, `small` ~244M, `medium` ~769M, `large` ~1550M) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `q5_0`, `q5_1`, `q8_0` |
| Idiomas soportados | No disponible (los modelos Whisper originales soportan 99 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGML (para `whisper.cpp`) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura ni el entrenamiento de los modelos. Este repositorio contiene exclusivamente los pesos convertidos de los modelos Whisper de OpenAI al formato GGML, que es el formato nativo de `whisper.cpp`. Los modelos originales de Whisper se basan en una arquitectura Transformer encoder-decoder, entrenada sobre más de 680 000 horas de datos de audio multilingüe, pero estos datos no se indican en la ficha del repositorio.

La conversión a GGML implica un proceso de cuantización opcional que reduce la precisión de los pesos (por ejemplo, de FP32 a Q5_0 o Q8_0) para disminuir el uso de memoria y acelerar la inferencia en CPU. El repositorio no incluye código de entrenamiento ni información sobre el proceso de conversión más allá de la tabla de modelos disponibles.

## Capacidades

- Reconocimiento automático del habla (ASR): los modelos son capaces de transcribir audio a texto, con soporte para múltiples idiomas en las versiones no `.en`.
- Variantes `.en`: modelos especializados únicamente en inglés, que ofrecen una ligera mejora de precisión y rendimiento en tareas de habla inglesa.
- Cuantización: las versiones `q5_0`, `q5_1` y `q8_0` permiten ejecutar los modelos con menor huella de memoria y mayor velocidad, a costa de una pequeña pérdida de precisión.
- Integración con `whisper.cpp`: los pesos están listos para usar con la librería C/C++, que ofrece inferencia en CPU, GPU (vía Vulkan, Metal, CUDA) y otros aceleradores, sin dependencias externas.
- Soporte de transcripción en tiempo real: `whisper.cpp` permite streaming y procesamiento por lotes, aunque estas capacidades no se documentan en este repositorio concreto.

## Casos de uso

- Transcripción de audio en dispositivos embebidos: los modelos `tiny` y `base` cuantizados (31-42 MiB) caben en memoria RAM de microcontroladores y sistemas de bajo consumo, permitiendo transcripción local sin conexión.
- Asistentes de voz en aplicaciones de escritorio: `whisper.cpp` se integra fácilmente en aplicaciones C/C++ o mediante bindings para otros lenguajes, facilitando la captura y transcripción de voz en tiempo real.
- Generación de subtítulos para vídeo: los modelos `small` o `medium` pueden procesar audio en lotes para generar subtítulos automáticos en múltiples idiomas, con tiempos de inferencia razonables en CPU modernas.
- Análisis de llamadas de atención al cliente: con los modelos `large-v2` o `large-v3` se puede transcribir conversaciones telefónicas para análisis posterior, aprovechando la precisión en habla con acentos y ruido.
- Investigación en ASR: los pesos en formato GGML permiten experimentar con cuantización y optimizaciones de rendimiento sin necesidad de infraestructura de GPU, ideal para laboratorios con recursos limitados.
- Despliegue en servidores con CPU: los modelos cuantizados `q8_0` (por ejemplo, `large-v3-turbo-q8_0` con 834 MiB) pueden servir transcripciones en batch con buena relación calidad-rendimiento en servidores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño de los modelos varía desde 31 MiB (`tiny-q5_1`) hasta 2,9 GiB (`large-v3`), por lo que los requisitos de VRAM o RAM dependen del modelo elegido.
- Los modelos `tiny` y `base` cuantizados caben en la RAM de la mayoría de las CPU modernas y pueden ejecutarse en tiempo real en un Raspberry Pi 4 (con limitaciones).
- Los modelos `large` requieren al menos 4 GiB de RAM para inferencia en CPU con cuantización `q5_0` (1,1 GiB), y son adecuados para GPU con 8 GB de VRAM.
- `whisper.cpp` ofrece soporte para CPU con instrucciones SIMD (ARM Neon, AVX, VSX) y GPU via Vulkan, CUDA y Metal, por lo que se puede desplegar en una amplia variedad de hardware.
- Opciones de despliegue: `whisper.cpp` puede compilarse como biblioteca estática o dinámica, y existen bindings para Python, Rust, Node.js, entre otros. También se puede integrar con servidores de inferencia como `whisper-server`.
- La latencia en CPU depende del modelo y del hardware; por ejemplo, `base` puede transcribir audio en tiempo real en un PC moderno, mientras que `large-v3` requiere GPU para un uso interactivo.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de ASR en el repositorio. Sin embargo, se pueden comparar los tamaños y cuantizaciones de los modelos de esta colección:

| Modelo | Tamaño (disco) | Cuantización | Uso recomendado |
|--------|----------------|--------------|-----------------|
| `tiny` | 75 MiB | f32 | Dispositivos embebidos |
| `base` | 142 MiB | f32 | Prototipos rápidos |
| `small` | 466 MiB | f32 | Transcripción general |
| `medium` | 1,5 GiB | f32 | Transcripción con mayor precisión |
| `large-v3` | 2,9 GiB | f32 | Máxima precisión |
| `large-v3-turbo` | 1,5 GiB | f32 | Equilibrio entre velocidad y calidad |

No se dispone de datos de rendimiento (WER, etc.) para comparar con otras soluciones como `wav2vec2` o `Kaldi`.

## Limitaciones y advertencias

- Este repositorio no contiene los modelos originales de Whisper, sino conversiones de los pesos oficiales de OpenAI; la licencia MIT aplica a la conversión, pero los pesos originales están sujetos a los términos de OpenAI.
- Los modelos cuantizados (`q4_0`, `q5_0`, `q8_0`) pueden presentar una degradación leve en la precisión, especialmente en entornos ruidosos o con acentos poco comunes.
- No se proporciona información sobre el idioma de los modelos; se recomienda consultar la documentación de OpenAI para conocer los idiomas soportados.
- El repositorio no incluye código de entrenamiento ni datos de evaluación, por lo que no se puede garantizar un rendimiento específico en tareas concretas.
- Para uso comercial, es necesario revisar la licencia de los pesos originales de Whisper (MIT en este caso, pero OpenAI ha impuesto restricciones de uso en versiones anteriores; se recomienda verificar la licencia vigente).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Roborn/whisper.cpp
- Repositorio oficial de `whisper.cpp`: https://github.com/ggml-org/whisper.cpp
- Modelos de referencia en HuggingFace: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Documentación de conversión y descarga: https://deepwiki.com/ggml-org/whisper.cpp/5.1-model-download-and-conversion
- Artículo de referencia sobre uso: https://pub.towardsai.net/whisper-cpp-how-to-use-openais-whisper-model-in-c-c-for-efficient-speech-recognition-3f63a2bb19c7
