# Fasih779/wavlm-base-plus-finetuned-gtzan

## Resumen

El modelo `Fasih779/wavlm-base-plus-finetuned-gtzan` es un ajuste fino del modelo de audio `microsoft/wavlm-base-plus` sobre el dataset GTZAN, un conjunto de referencia para clasificación de géneros musicales. El autor, Fasih779, lo ha entrenado con el objetivo de reconocer automáticamente el género de una pista de audio entre las 10 categorías del dataset (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock). El modelo resultante es un clasificador de audio de 94,6 millones de parámetros, con una precisión declarada del 87,94 % en el conjunto de evaluación.

La relevancia de este modelo reside en que parte de un modelo base de propósito general (WavLM Base+), que ha sido preentrenado de forma auto-supervisada sobre miles de horas de audio, y luego se ha especializado en una tarea concreta con un dataset relativamente pequeño. Esto demuestra la transferencia de aprendizaje en el dominio del audio y ofrece un punto de partida útil para desarrolladores que necesiten clasificar géneros musicales u otras tareas de clasificación de audio con un modelo compacto y eficiente.

Aunque el modelo no ha sido publicado con documentación extensa, su integración en Transformers y la disponibilidad de pesos en formato safetensors lo hacen fácilmente desplegable en entornos de producción y en prototipos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM Base+ (encoder Transformer, similar a HuBERT) |
| Parametros totales | 94.581.370 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrada de audio de 16 kHz, sin límite explícito) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base fue entrenado con audio multilingüe, pero el fine-tuning es específico para música) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `microsoft/wavlm-base-plus`, una versión del WavLM que emplea una arquitectura de Transformer encoder con atención relativa y enmascaramiento de señales de audio. WavLM se preentrena mediante un objetivo de denoising y de predicción de unidades pseudo‑etiquetadas, similar a HuBERT, pero con mejoras en el modelado de la señal de habla. En este caso, el modelo se ha fine‑tuneado sobre el dataset GTZAN, que contiene 1.000 clips de audio de 30 segundos cada uno, distribuidos en 10 géneros musicales.

El proceso de fine‑tuning se realizó con el framework Transformers de Hugging Face, usando un optimizador AdamW con tasa de aprendizaje 3e‑5, tamaño de lote 8, y un programador de tasa de aprendizaje coseno con 100 pasos de calentamiento. Se entrenaron 10 épocas con precisión mixta (AMP). No se especifica el uso de técnicas de RLHF o DPO, ya que es una tarea de clasificación supervisada.

## Capacidades

- Clasificación de géneros musicales: el modelo predice una de las 10 categorías de GTZAN a partir de un clip de audio.
- Clasificación de audio general: aunque está especializado en música, la arquitectura base WavLM permite adaptarse a otras tareas de audio (por ejemplo, detección de eventos sonoros) si se reentrena.
- Extracción de características: al ser un modelo preentrado, puede usarse como extractor de embeddings para otras tareas de audio.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi‑paso; es un clasificador puro.
- No se ha documentado soporte para múltiples idiomas en la salida; la entrada es audio, no texto.

## Casos de uso

- **Clasificación automática de géneros musicales en bibliotecas digitales**: se puede integrar en un servicio de streaming o en un gestor de biblioteca para etiquetar automáticamente las canciones. El modelo acepta clips de 30 segundos, lo que permite analizar pistas completas segmentando en ventanas.
- **Recomendación musical**: el modelo puede generar una distribución de probabilidad sobre los géneros, que puede combinarse con sistemas de recomendación para mejorar la sugerencia de contenido.
- **Análisis de tendencias en plataformas de música**: los embeddings de la capa final pueden usarse para agrupar canciones por similitud y detectar cambios en los estilos a lo largo del tiempo.
- **Automatización de curaduría de playlists**: permite asignar géneros a nuevas canciones sin intervención manual, útil para sellos discográficos y servicios de curaduría.
- **Investigación en MIR (Music Information Retrieval)**: sirve como modelo de referencia para comparar técnicas de clasificación de género, o como base para fine‑tuning en datasets más específicos.
- **Prototipado rápido de aplicaciones de audio**: al ser un modelo pequeño (~95 M de parámetros) y disponible en Transformers, puede integrarse en notebooks o aplicaciones móviles para pruebas de concepto.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación de GTZAN:

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 0.5247 |
| Precisión (accuracy) | 0.8794 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de ~95 M parámetros, la inferencia en FP32 requiere aproximadamente 400 MB de memoria, pero con cuantización a FP16 o int8 se reduce aún más. Un GPU con 2 GB de VRAM es suficiente para la mayoría de casos.
- **GPU recomendadas**: cualquier GPU moderna, incluyendo las de gama consumer como NVIDIA GTX 1060 (6 GB), RTX 3060 (8 GB), o incluso CPUs con suficiente RAM. No se requiere una GPU de datacenter.
- **Opciones de despliegue**: el modelo está integrado en Hugging Face Transformers, por lo que se puede cargar con `pipeline("audio-classification")`. También se puede exportar a ONNX o TensorRT para inferencia más rápida. No se indica soporte para vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no hay datos públicos. Con un clip de 30 segundos, se espera una inferencia de menos de un segundo en una GPU moderna (RTX 3090), y de unos pocos segundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de clasificación de audio sobre GTZAN en la información proporcionada. Sin embargo, el modelo base WavLM Base+ tiene aproximadamente el mismo tamaño que otros clasificadores de audio como AST (Audio Spectrogram Transformer, 86 M parámetros) o YAMNet (3.2 M), aunque estos últimos no son directamente comparables porque usan diferentes arquitecturas y preentrenamiento. No se puede establecer una comparativa cuantitativa sin datos.

## Limitaciones y advertencias

- **Dataset de entrenamiento reducido**: GTZAN contiene solo 1.000 clips, lo que puede provocar sobreajuste a los ejemplos específicos y una menor generalización a otros estilos musicales o grabaciones de diferente calidad.
- **Sesgo de género musical**: los géneros del dataset son una selección limitada y no representan la diversidad musical global. El modelo no reconocerá géneros fuera de esas 10 categorías.
- **Alucinación y errores**: en clasificación de audio, el modelo puede confundir géneros con características similares (por ejemplo, pop y rock) o verse afectado por ruido, calidad de grabación, etc.
- **Licencia no disponible**: no se indica la licencia del modelo, por lo que su uso comercial puede ser incierto. Es recomendable contactar al autor o revisar la licencia del modelo base.
- **Sin documentación de sesgos**: no se han publicado análisis de sesgos ni de comportamiento en condiciones adversas.
- **Limitación de contexto**: el modelo está diseñado para audio de 16 kHz, y no se indica el manejo de clips más largos que 30 segundos; en producción sería necesario segmentar.

## Enlaces

- [Ficha del modelo en Hugging Face](https://huggingface.co/Fasih779/wavlm-base-plus-finetuned-gtzan)
- [Modelo base microsoft/wavlm-base-plus](https://huggingface.co/microsoft/wavlm-base-plus)
- [Repositorio oficial de WavLM (GitHub)](https://github.com/microsoft/unilm/blob/master/wavlm/README.md)
- [Página del dataset GTZAN en Hugging Face](https://huggingface.co/datasets/marsyas/gtzan)
