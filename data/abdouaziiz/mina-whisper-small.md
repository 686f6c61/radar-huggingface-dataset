# abdouaziiz/mina-whisper-small

## Resumen

Mina Whisper Small es un ajuste fino (fine-tuning) del modelo openai/whisper-small, desarrollado por el usuario abdouaziiz, orientado a reconocimiento automático del habla (ASR). El modelo parte de la arquitectura Whisper original de OpenAI, un transformer encoder-decoder especializado en transcripción de audio, y ha sido reentrenado sobre el dataset abdouaziiz/mina-ex, presumiblemente para adaptarlo a un dominio o idioma específico (el nombre "mina" sugiere un conjunto de datos propio, posiblemente vinculado a una lengua o variante concreta). Cuenta con 241.734.912 parámetros totales y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia radica en que demuestra el patrón habitual de especialización de Whisper mediante fine-tuning sobre datasets reducidos, algo útil para equipos que necesitan transcripción en dominios concretos sin desplegar modelos de mayor tamaño. Sin embargo, el modelo es de acceso restringido (gated) en Hugging Face, no tiene descargas ni interacciones registradas y su model card no documenta idiomas soportados, composición del dataset ni detalles del proceso de entrenamiento.

La información pública disponible es muy limitada: no se especifican los idiomas, ni el número de horas de audio empleadas, ni la metodología de evaluación más allá de un único valor de WER declarado por el autor y no verificado. Esta ficha refleja exclusivamente los datos publicados y marca como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, openai/whisper-small) |
| Parámetros totales | 241.734.912 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante "small": un transformer encoder-decoder con atención estándar, diseñado para transcribir audio en ventanas de 30 segundos y generar texto de forma autorregresiva. Whisper se entrena de forma multitarea (transcripción, traducción al inglés, detección de idioma y marcas temporales), y este ajuste fino parte de esos pesos preentrenados.

El entrenamiento se realizó con la librería transformers y la librería de entrenamiento estándar (el tag `generated_from_trainer` lo confirma), sobre el dataset abdouaziiz/mina-ex. No se dispone de información sobre el número de horas de audio, la composición del dataset, si hubo aumentación de datos, ni si se aplicaron técnicas como especificación de idioma forzada o ajuste de hiperparámetros relevantes (learning rate, épocas, warmup). Tampoco consta si el ajuste se limitó a la cabeza de decodificación o si se actualizaron todos los pesos. No hay evidencia documentada de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), tarea principal del pipeline `automatic-speech-recognition`.
- Hereda las capacidades multitarea de Whisper-small: detección de idioma, marcas temporales a nivel de segmento y, potencialmente, traducción al inglés, aunque el ajuste fino puede haber alterado o degradado estas capacidades.
- Procesamiento de audio en ventanas de hasta 30 segundos por pasada, con posibilidad de concatenar ventanas para audios más largos mediante pipelines de chunking.
- No consta soporte de tool calling ni function calling (no es una capacidad propia de un modelo ASR).
- No consta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles/documentadas.
- No dispone de modo thinking, visión ni audio como salida.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir grabaciones cortas en texto, aprovechando la ventana de 30 s de Whisper y el chunking de los pipelines de transformers para audios más largos; adecuado si el dominio coincide con el dataset de ajuste.
- Subtitulado automático de vídeo: generación de transcripciones con marcas temporales por segmento, útiles para flujos de postproducción o accesibilidad, siempre que se valide la calidad en el idioma objetivo.
- Indexación y búsqueda de contenido audiovisual: transcripción previa de archivos de audio para alimentar motores de búsqueda o sistemas RAG sobre texto, con la ventaja de un modelo de 242 M de parámetros que se puede ejecutar en CPU.
- Prototipado rápido de ASR en dominios específicos: al ser un fine-tuning de Whisper-small, sirve como punto de partida para experimentar con adaptación a jerga, acentos o vocabulario técnico con coste computacional bajo.
- Procesamiento por lotes en entornos con recursos limitados: su tamaño permite desplegarlo en GPUs de gama media o incluso en CPU para volúmenes moderados, sin necesidad de infraestructura de gran escala.
- Investigación y comparación de fine-tunings: útil como referencia para estudiar el efecto del ajuste fino sobre Whisper-small en datasets pequeños, dado que el autor publica un WER de referencia (aunque no verificado).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | abdouaziiz/mina-ex (split no especificado) | WER | 0,2619 (26,19 %) |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con el modelo base openai/whisper-small ni con otros fine-tunings, por lo que no es posible determinar si el ajuste mejora o degrada el rendimiento respecto al original.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1 GB para los pesos (242 M de parámetros); en fp16, alrededor de 0,5 GB. El consumo real depende del tamaño de lote y de la longitud de audio procesada.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline de ASR), vLLM no aplica de forma estándar a ASR, llama.cpp no soporta Whisper de forma nativa, faster-whisper (requiere conversión a CTranslate2), Whisper.cpp (requiere conversión a GGML) y TGI no es la vía habitual para este tipo de modelo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| abdouaziiz/mina-whisper-small | 241,7 M | Ventanas de 30 s | Apache 2.0 | Gated en HF | Fine-tuning específico, WER 26,19 % declarado |
| openai/whisper-small | 241,7 M | Ventanas de 30 s | Apache 2.0 | Público en HF | Modelo base; WER multilingüe publicado por OpenAI |
| openai/whisper-base | 74,4 M | Ventanas de 30 s | Apache 2.0 | Público en HF | Menor tamaño y menor precisión general |
| openai/whisper-medium | 769 M | Ventanas de 30 s | Apache 2.0 | Público en HF | Mayor precisión a costa de más recursos |

No se dispone de datos de rendimiento comparables del modelo frente a estas alternativas en el mismo dataset, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en pipelines.
- Idiomas no documentados: se desconoce qué lenguas cubre el ajuste fino y si conserva el multilingüismo de Whisper-small; usarlo fuera del dominio previsto puede degradar gravemente la calidad.
- WER no verificado: el único dato de rendimiento (26,19 %) es declarado por el autor, sin verificación independiente ni comparación con el modelo base.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios o audio fuera de dominio.
- Sesgos: no se documenta la composición del dataset, por lo que se desconocen sesgos de acento, género, edad o dialecto.
- Datos de entrenamiento opacos: sin información sobre horas de audio, calidad de transcripciones ni metodología de evaluación, la reproducibilidad es limitada.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantías del autor aconsejan validación propia antes de producción.
- Sin métricas de latencia ni throughput publicadas; el rendimiento real dependerá de la implementación y del hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdouaziiz/mina-whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de ajuste: https://huggingface.co/datasets/abdouaziiz/mina-ex
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
