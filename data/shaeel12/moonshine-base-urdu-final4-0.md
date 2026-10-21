# shaeel12/moonshine-base-urdu-final4.0

## Resumen

`shaeel12/moonshine-base-urdu-final4.0` es un ajuste fino del modelo `moonshine-ai/moonshine-base-ar` para reconocimiento automático del habla (ASR) en urdu. Lo publica el usuario `shaeel12` y se entrena sobre el dataset `shaeel12/urdu-speech-unified`. El repositorio declara 61.514.752 parámetros, pesos en `safetensors` y un tamaño de 1,2 GB.

El modelo pertenece a la familia Moonshine y está pensado para transcripción de audio en urdu, un idioma con menos recursos que el inglés. Su interés principal es servir como base compacta para experimentación y ajuste fino en ASR de bajo recursos. Sin embargo, el único dato de rendimiento publicado es un WER del 60,3% en validación, una tasa de error muy alta para uso productivo sin revisión humana.

La model card es muy breve: no detalla arquitectura interna, composición del dataset, condiciones de evaluación ni licencia. Además, el título indica "Moonshine Tiny" mientras que el campo `base_model` apunta a `moonshine-base-ar`, una discrepancia que conviene tener en cuenta al reproducir el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia Moonshine para reconocimiento automático del habla; la model card no detalla encoder, decoder ni mecanismo de atención |
| Parámetros totales | 61.514.752 (61,5 M) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible; en ASR depende de la duración del audio y no se documenta límite |
| Tipos de cuantización | No disponible; el repositorio solo declara pesos `safetensors` y no ofrece GGUF, ONNX ni variantes cuantizadas |
| Idiomas soportados | Urdu (`ur`); no se documentan otros idiomas |
| Licencia | No disponible |
| Formato de pesos | `safetensors` |
| Modelo base | `moonshine-ai/moonshine-base-ar` |
| Dataset de ajuste | `shaeel12/urdu-speech-unified` |
| Tamaño del repositorio | 1,2 GB |
| WER en validación | 60,3% |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un ajuste fino de `moonshine-ai/moonshine-base-ar`, de la familia Moonshine, especializada en reconocimiento automático del habla. No se especifica si la arquitectura es un transformer encoder-decoder, un modelo con atención lineal, una combinación híbrida u otra variante. Tampoco se documentan el preprocesamiento de audio, la frecuencia de muestreo esperada, el tokenizador ni la estrategia de decodificación. El tamaño de 61,5 M de parámetros indica un modelo compacto, pero no se confirma cuántos parámetros pertenecen al encoder y cuántos al decoder.

El entrenamiento consiste en un ajuste fino supervisado sobre `shaeel12/urdu-speech-unified`. No se indican horas de audio, número de tokens, composición del dataset, división entre entrenamiento y validación, epochs, tasa de aprendizaje, aumento de datos ni uso de RLHF o DPO. El único resultado publicado es un WER del 60,3% en el conjunto de validación. La model card titula el modelo como "Moonshine Tiny", pero el campo `base_model` apunta a `moonshine-base-ar`; esta inconsistencia no se explica en la documentación.

## Capacidades

- Reconocimiento automático del habla en urdu: convierte audio de voz en texto.
- Transcripción de audio de un solo hablante; no se documenta soporte para diarización ni separación de hablantes.
- Generación de transcripciones aproximadas para análisis, indexación o revisión humana.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni uso como modelo de propósito general.
- Modelo monolingüe en urdu según la información disponible; el hecho de partir de un modelo entrenado en árabe no implica capacidad para traducir o transcribir árabe.
- No se documentan capacidades de visión, generación de audio, respuesta a preguntas sobre audio ni marcas de tiempo.
- No se documenta puntuación, capitalización ni formato de salida específico.

## Casos de uso

- Investigación en ASR para urdu: usar el modelo como punto de partida para ajustes finos y análisis de errores; su tamaño compacto permite experimentar con recursos de GPU limitados.
- Creación de borradores de transcripción con revisión humana: generar una primera transcripción de entrevistas o notas de voz en urdu y corregirla manualmente; el WER del 60,3% obliga a revisión completa.
- Indexación aproximada de archivos de audio: transcribir audio para búsqueda por palabras clave y verificar después los fragmentos relevantes; es aceptable solo si se tolera una alta tasa de error.
- Evaluación comparativa de modelos Moonshine: reproducir el ajuste fino y comparar el comportamiento con `moonshine-base-ar` y otras alternativas ASR; el WER de validación es la única métrica disponible.
- Docencia y demostraciones de pipelines ASR: ilustrar la carga de pesos `safetensors`, el preprocesamiento de audio y la decodificación con un modelo de 61,5 M de parámetros.
- Pruebas de despliegue en entornos de bajos recursos: estimar memoria y latencia en CPU o GPU pequeñas antes de invertir en un modelo mayor; no hay medidas
