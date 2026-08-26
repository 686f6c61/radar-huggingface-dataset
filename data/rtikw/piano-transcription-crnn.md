# rtikw/piano-transcription-crnn

## Resumen

Este repositorio aloja un espejo sin modificar del checkpoint de transcripción de piano de alta resolución desarrollado por ByteDance, concretamente el modelo CRNN de notas y pedal. El modelo original fue publicado por Qiuqiang Kong et al. y está disponible en Zenodo, siendo este repositorio una copia estable para su descarga a través de Hugging Face, utilizada por la aplicación LocalMusic. Resuelve el problema de convertir audio de piano en una transcripción simbólica (MIDI) con alta precisión temporal, incluyendo tanto las notas como el pedal de sustain.

La arquitectura es una CRNN (red neuronal convolucional recurrente) entrenada sobre el conjunto de datos MAESTRO, que contiene más de 200 horas de interpretaciones de piano virtuosas con alineación fina de aproximadamente 3 milisegundos. El checkpoint específico alcanza un F1 de 0,9677 para notas y 0,9186 para pedal. El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo ligero, adecuado para inferencia en CPU o GPU de gama media. Su relevancia actual radica en que sigue siendo una referencia para la transcripción automática de piano, especialmente en aplicaciones que requieren precisión de alta resolución en tiempo y frecuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (Convolutional Recurrent Neural Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible (pesos originales en formato .pth) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura CRNN que combina capas convolucionales para extraer características espectrales del audio (típicamente representado como espectrogramas de Mel o cromagramas) con capas recurrentes (LSTM o GRU) para modelar las dependencias temporales. Esta combinación es estándar en transcripción musical, permitiendo capturar tanto patrones armónicos locales como la evolución temporal de las notas. El entrenamiento se realizó sobre el dataset MAESTRO, que ofrece interpretaciones de piano de alto nivel con anotaciones MIDI alineadas al audio con precisión de milisegundos. No se dispone de información detallada sobre el número de tokens o pasos de entrenamiento, ni sobre técnicas de refuerzo o ajuste fino adicionales.

Una innovación destacable del sistema original es la transcripción de alta resolución, que detecta tanto el inicio como el final de cada nota y el pedal de sustain con una resolución temporal fina, lo que supera a enfoques anteriores que solo predecían la presencia de notas en ventanas de tiempo gruesas. El checkpoint aquí alojado corresponde al modelo CRNN completo, que alcanza un F1 de 0,9677 para notas y 0,9186 para pedal.

## Capacidades

- Transcripción automática de piano: convierte audio de piano en secuencias MIDI de notas y pedal.
- Alta resolución temporal: detecta eventos con precisión de milisegundos, útil para interpretaciones virtuosas.
- Detección de pedal de sustain: identifica el uso del pedal de sustain, algo que muchos sistemas de transcripción ignoran.
- Generación de MIDI a partir de audio: el resultado se puede exportar como archivo MIDI para su uso en DAWs o notación musical.
- Soporte para audio en formato de onda (WAV, MP3) previa conversión a espectrograma.
- No tiene capacidades de texto, visión ni razonamiento simbólico; es un modelo especializado en audio.

## Casos de uso

- **Transcripción de partituras para músicos**: un pianista puede grabar su interpretación y el modelo genera un MIDI que se puede convertir en partitura con software como MuseScore o Sibelius. La alta resolución temporal es clave para capturar la articulación y los matices.
- **Análisis de interpretaciones**: investigadores en musicología pueden usar el modelo para analizar la técnica de pianistas (uso del pedal, timing de las notas) a partir de grabaciones de estudio o conciertos.
- **Restauración y digitalización de archivos históricos**: grabaciones antiguas de piano en cinta o vinilo se pueden transcribir a MIDI para preservación y reedición, facilitando la limpieza y el re-masterizado.
- **Entrenamiento de asistentes de práctica**: una aplicación de práctica de piano puede escuchar al estudiante y dar feedback visual sobre las notas incorrectas o el uso del pedal, usando la transcripción en tiempo real.
- **Generación de datasets para otras tareas**: las transcripciones producidas por el modelo pueden servir como pseudo-etiquetas para entrenar otros sistemas, como generadores de acompañamiento o modelos de síntesis de piano.
- **Juegos y aplicaciones de karaoke de piano**: en aplicaciones de entretenimiento donde se muestra el piano virtual y se resalta la tecla que se toca, el modelo puede convertir el audio del usuario en una visualización en tiempo real.
- **Investigación en transcripción musical**: los investigadores pueden usar este checkpoint como baseline en experimentos de transcripción de piano, comparando con arquitecturas más modernas o con variantes del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. El único dato de rendimiento reportado es el F1 del checkpoint en sí:

| Metrica | Valor |
|---|---|
| F1 notas | 0,9677 |
| F1 pedal | 0,9186 |

Estos valores provienen de la evaluación original de los autores sobre el conjunto de datos MAESTRO, aunque no se especifica la partición exacta. No se dispone de comparaciones con otros modelos como Onsets and Frames o Google Magenta en esta ficha.

## Requisitos de hardware

- Tamaño del checkpoint: aproximadamente 0,2 GB, lo que sugiere un modelo ligero.
- VRAM estimada: para inferencia en GPU, se estima que caben en GPUs con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) si se cargan en precisión simple (FP32). Con cuantización a FP16 o int8, cabría en GPUs integradas o de baja gama.
- GPU recomendadas: cualquier GPU moderna con CUDA (NVIDIA) o incluso CPU con buena optimización, ya que el modelo es pequeño.
- En consumer GPU: sí, cabe en tarjetas como RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: al ser un modelo de PyTorch, se puede cargar con la biblioteca de inferencia de PyTorch, o exportar a ONNX para su uso en entornos como TensorRT. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no disponible, pero para un modelo de este tamaño en GPU se espera latencia de milisegundos por segmento de audio de unos segundos. En CPU puede ser mayor, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en la información proporcionada. Como referencia contextual, se puede mencionar que en el campo de la transcripción de piano existen otros sistemas como Onsets and Frames (Google) y Omnizart, pero no se han publicado resultados comparativos en este repositorio. Se recomienda consultar la literatura académica para comparaciones detalladas.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se entrenó exclusivamente con piano clásico de MAESTRO, por lo que su rendimiento puede degradarse en otros géneros musicales o con pianos de baja calidad de grabación.
- Riesgo de alucinación: aunque no es un modelo de texto, puede producir notas fantasma en pasajes muy densos o con mucho ruido.
- Limitación de idioma: no aplica, es un modelo de audio.
- Restricciones de licencia: la licencia CC BY 4.0 permite uso comercial y modificación, siempre que se atribuya al autor original (ByteDance). Es necesario citar la fuente y el autor en cualquier uso público.
- Caveat de producción: el checkpoint es un espejo no modificado; no se garantiza su soporte o mantenimiento. Para producción, se recomienda descargar el original desde el repositorio de ByteDance.
- El modelo solo procesa audio de piano; no funciona con otros instrumentos ni con música polifónica que incluya otros instrumentos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/rtikw/piano-transcription-crnn
- Fuente original (Zenodo): https://zenodo.org/record/4034264
- Repositorio original de ByteDance: https://github.com/bytedance/piano_transcription
- Artículo de referencia: no disponible en la información proporcionada
- Página de descripción en aimodels.fyi: https://www.aimodels.fyi/models/replicate/piano-transcription-bytedance
