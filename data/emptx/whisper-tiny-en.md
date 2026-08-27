# emptx/whisper-tiny-en

## Resumen

El modelo `emptx/whisper-tiny-en` es un ajuste fino (fine-tune) del checkpoint `openai/whisper-tiny` de OpenAI, realizado por el usuario `emptx` sobre el dataset de reconocimiento de voz multilingüe PolyAI/minds14. Está diseñado para la tarea de reconocimiento automático del habla (ASR) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales. Con 37,7 millones de parámetros, es una variante compacta de la familia Whisper, pensada para entornos con recursos limitados o despliegues en tiempo real.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper, que procesa audio en ventanas de 30 segundos y genera transcripciones de texto. Aunque el nombre sugiere un enfoque exclusivo en inglés, el dataset de entrenamiento (minds14) contiene múltiples idiomas; sin embargo, la información disponible no especifica qué subconjunto se utilizó ni los idiomas finales soportados. El ajuste se realizó con 200 pasos de entrenamiento, una tasa de aprendizaje de 1e-5 y un tamaño de lote de 32, alcanzando un WER de 0,3447 en el conjunto de evaluación.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, lo que lo convierte en una opción atractiva para prototipos, aplicaciones embebidas o como punto de partida para ajustes posteriores en tareas específicas de ASR. No obstante, su rendimiento es modesto en comparación con modelos más grandes de Whisper, y su documentación es escasa, lo que limita su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificar precisión) |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado con supervisión débil sobre 680.000 horas de audio etiquetado. El encoder procesa espectrogramas de Mel de 80 canales y el decoder genera tokens de texto de forma autorregresiva. El checkpoint base `openai/whisper-tiny` es la versión más pequeña de la familia, con 39 millones de parámetros y soporte multilingüe.

El ajuste fino se realizó sobre el dataset PolyAI/minds14, que contiene grabaciones de voz en varios idiomas y acentos. Los hiperparámetros documentados incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 32, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 200 pasos de entrenamiento con precisión mixta (AMP). No se mencionan técnicas adicionales como RLHF o DPO; el proceso es un fine-tune supervisado estándar.

## Capacidades

- Reconocimiento automático del habla (ASR): transcribe audio a texto, heredando la capacidad de Whisper para manejar audio en inglés y otros idiomas, aunque el alcance exacto no está documentado.
- Procesamiento de audio en ventanas de 30 segundos: adecuado para clips cortos o segmentación de audio más largo.
- Integración con la librería Transformers de Hugging Face: se puede cargar con `pipeline("automatic-speech-recognition")` o mediante la clase `WhisperForConditionalGeneration`.
- Compatible con endpoints de Hugging Face (según los tags), lo que facilita su despliegue en infraestructura gestionada.
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multimodal; es exclusivamente un modelo de transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir grabaciones de audio en tiempo real o diferido, aunque su WER de 0,34 en minds14 sugiere que es más adecuado para entornos con habla clara y poco ruido.
- Subtitulado automático de vídeos: al ser ligero, puede ejecutarse en CPU o GPUs modestas para generar subtítulos en inglés (si se confirma el idioma) en plataformas de vídeo.
- Asistentes de voz en dispositivos embebidos: su tamaño de 37,7M parámetros permite su ejecución en Raspberry Pi o dispositivos móviles con aceleración básica, ideal para comandos de voz simples.
- Prototipado rápido de aplicaciones ASR: los desarrolladores pueden usar este modelo como base para validar flujos de transcripción antes de migrar a modelos más grandes.
- Preprocesamiento de audio para análisis posterior: transcribir llamadas de atención al cliente o podcasts para alimentar sistemas de análisis de sentimiento o búsqueda por texto.
- Evaluación comparativa de fine-tunes: al ser un checkpoint pequeño y con licencia abierta, sirve como referencia para medir el impacto de diferentes datasets o hiperparámetros en tareas ASR.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación de PolyAI/minds14:

| Metrica | Valor |
|---|---|
| Loss | 0,5078 |
| WER (Word Error Rate) | 0,3447 |
| WER Ortho | 0,3504 |

Durante el entrenamiento, se observó una pérdida de entrenamiento de 0,0527 en el paso 200, con una pérdida de validación de 0,5078. No se proporcionan comparaciones con otros modelos en el mismo dataset, por lo que estos valores deben interpretarse como una referencia aislada.

## Requisitos de hardware

- VRAM estimada: con 37,7M parámetros, en FP16 ocupa aproximadamente 75 MB de memoria, y en FP32 unos 150 MB. Esto cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050) o incluso CPU para inferencia no en tiempo real.
- Despliegue en consumer GPU: sí, es viable en GPUs de gama baja y en CPU con frameworks como `transformers` o `faster-whisper`.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante librerías como `transformers`, `faster-whisper` (para optimización en CPU/GPU) o `whisper.cpp` (para CPU).
- Latencia y throughput: no se dispone de datos medidos; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por ventana de 30 s en GPU), pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | WER (minds14) |
|---|---|---|---|---|---|
| emptx/whisper-tiny-en | 37,7M | no disponible | no disponible | Apache 2.0 | 0,3447 |
| openai/whisper-tiny | 39M | 30 s de audio | multilingüe | MIT | no disponible |
| openai/whisper-tiny.en | 39M | 30 s de audio | inglés | MIT | no disponible |

El modelo `emptx/whisper-tiny-en` es un fine-tune de `openai/whisper-tiny`; su número de parámetros es ligeramente inferior (37,7M frente a 39M), probablemente debido a la exclusión de ciertos pesos durante el ajuste. La licencia Apache 2.0 es más permisiva que la MIT en cuanto a patentes, pero ambas permiten uso comercial. No se dispone de resultados de WER para los modelos base en minds14, por lo que no es posible comparar directamente el rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo entrenado con supervisión débil, puede heredar sesgos de los datos de entrenamiento originales de Whisper, como un peor rendimiento en acentos no representados o en habla con ruido de fondo.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas o inventar contenido en audio ambiguo o de baja calidad; el WER de 0,34 indica una tasa de error considerable.
- Limitaciones de contexto: la ventana de audio de 30 segundos es fija; para audios más largos se requiere segmentación, lo que puede afectar la coherencia de la transcripción.
- Idiomas: no se ha confirmado qué idiomas soporta realmente; el nombre sugiere inglés, pero el dataset minds14 es multilingüe. Se recomienda verificar el comportamiento en el idioma objetivo antes de usarlo en producción.
- Documentación escasa: la model card no proporciona detalles sobre los datos de entrenamiento, el preprocesamiento ni las limitaciones específicas, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset PolyAI/minds14 puede tener sus propias condiciones de uso; se debe revisar la licencia del dataset si se redistribuyen datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emptx/whisper-tiny-en
- Checkpoint base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Checkpoint openai/whisper-tiny.en: https://huggingface.co/openai/whisper-tiny.en
- Ficha de whisper-tiny.en en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/whisper-tinyen-openai
- Documentación de OpenASR sobre whisper-tiny.en: https://openasr.org/models/whisper-tiny.en/
