# 01Yassine/cohere-transcribe-darija

## Resumen

El modelo `01Yassine/cohere-transcribe-darija` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) diseñado para mejorar el reconocimiento automático del habla (ASR) en árabe marroquí (darija). Se construye sobre el modelo base `CohereLabs/cohere-transcribe-arabic-07-2026`, un sistema ASR de 2B parámetros desarrollado por Cohere, y aplica una estrategia híbrida de ajuste: MultiConv en las capas 15 a 47 del encoder y LoRA en el decoder. El adaptador fue entrenado por el usuario 01Yassine con un conjunto de datos de 3 horas de audio de YouTube en darija (`01Yassine/darija-asr-3h`).

El modelo resuelve el problema de la escasez de recursos ASR para dialectos árabes, específicamente el darija marroquí, que difiere significativamente del árabe estándar moderno. Su relevancia radica en que ofrece una mejora notable en métricas de error (CER y WER) sobre el modelo base sin necesidad de entrenar un modelo completo desde cero. El adaptador es ligero (0.1 GB) y se distribuye como safetensors, lo que facilita su integración en pipelines existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MultiConv (encoder, capas 15–47) + LoRA (decoder) sobre Cohere Transcribe Arabic |
| Parametros totales | No disponible (adaptador de 0.1 GB sobre base de 2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se aplica sobre pesos base, puede usarse con cuantización del base) |
| Idiomas soportados | Árabe (ar) y darija marroquí (ary) |
| Licencia | other (se requiere la licencia del modelo base Cohere) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea una arquitectura híbrida que combina dos técnicas de ajuste eficiente: MultiConv, aplicada a las capas 15 a 47 del encoder del modelo base, y LoRA en el decoder. MultiConv introduce convoluciones multicapa para capturar patrones locales en las representaciones de audio, mientras que LoRA reduce el número de parámetros entrenables en la parte de decodificación. Esta combinación permite adaptar el modelo al darija con solo 3 horas de datos etiquetados.

El entrenamiento se realizó sobre el dataset `01Yassine/darija-asr-3h`, compuesto por clips de YouTube en darija, y utilizó una semilla fija para reproducibilidad. No se menciona el uso de RLHF ni de técnicas de alineación adicionales. El adaptador se publica como repositorio PEFT, por lo que requiere los pesos del modelo base `CohereLabs/cohere-transcribe-arabic-07-2026` para la inferencia.

## Capacidades

- Reconocimiento automático del habla (ASR) para darija marroquí, con mejora significativa frente al modelo base (CER 14.4% vs 20.2%, WER 38.3% vs 49.1%).
- Transcripción de audio a texto en dialecto árabe marroquí, incluyendo variaciones coloquiales.
- Al estar basado en Cohere Transcribe Arabic, hereda capacidades multilingües del modelo base (hasta 14 idiomas según documentación de Cohere), aunque el adaptador está especializado en darija.
- Soporte para inferencia mediante scripts proporcionados (`infer.py`) y compatibilidad con la librería `transformers` (versión >=5.4) y `peft`.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de transcripción.

## Casos de uso

- Transcripción de reuniones y llamadas en darija: el modelo puede convertir audio de reuniones de trabajo o conferencias en texto, facilitando la generación de actas y búsqueda de contenido. Su baja CER lo hace adecuado para entornos con habla coloquial.
- Subtitulado automático de vídeos en darija: creadores de contenido y plataformas de vídeo pueden generar subtítulos precisos para material en árabe marroquí, mejorando la accesibilidad.
- Atención al cliente automatizada: integrado en sistemas de IVR o chatbots, puede transcribir interacciones de clientes que hablan darija, permitiendo análisis de sentimiento o derivación a agentes humanos.
- Análisis de voz para investigación sociolingüística: investigadores pueden transcribir entrevistas o grabaciones de campo en darija para estudios lingüísticos o de procesamiento del lenguaje natural.
- Asistentes de voz locales: el adaptador puede integrarse en asistentes personales o dispositivos inteligentes que operen en Marruecos, mejorando la comprensión del dialecto local frente a modelos de árabe estándar.
- Archivado y búsqueda de contenido de audio: empresas de medios pueden indexar archivos de radio o podcasts en darija, convirtiéndolos en texto para búsqueda y recuperación de información.

## Benchmarks y rendimiento

El adaptador se evaluó en el benchmark `atlasia/darija-asr-benchmark`, compuesto por 114 clips transcritos por humanos. Los resultados comparativos con el modelo base y otros adaptadores del mismo autor son los siguientes:

| Receta | Hub | CER (%) | WER (%) |
|---|---|---|---|
| Base (sin adaptar) | CohereLabs/cohere-transcribe-arabic-07-2026 | 20.2 | 49.1 |
| **Hybrid (MultiConv + LoRA)** | **01Yassine/cohere-transcribe-darija** | **14.4** | **38.3** |
| Full LoRA | 01Yassine/cohere-transcribe-darija-full-lora | 16.5 | no disponible |
| Encoder LoRA | 01Yassine/cohere-transcribe-darija-encoder-lora | 17.4 | no disponible |
| Decoder LoRA | 01Yassine/cohere-transcribe-darija-decoder-lora | 20.2 | no disponible |

No se publican resultados adicionales para otras tareas (por ejemplo, MMLU, HumanEval) porque el modelo es específico para ASR.

## Requisitos de hardware

- El adaptador en sí es muy ligero (0.1 GB), pero requiere cargar el modelo base de 2B parámetros. Para inferencia en FP16, se estima una VRAM de al menos 4-6 GB, dependiendo de la duración del audio y del tamaño de lote.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB) o superiores pueden ejecutar el modelo sin problemas. Para despliegue en producción con mayor throughput, se recomiendan A10, A100 o H100.
- El modelo cabe en GPUs consumer de gama media; no requiere hardware especializado.
- Opciones de despliegue: compatible con `transformers` (>=5.4) y `peft`; también puede servirse mediante vLLM (según la documentación de Cohere Transcribe). El script `infer.py` incluido en el repositorio permite ejecución directa.
- No se proporcionan datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

El adaptador se compara directamente con el modelo base y con otras recetas de ajuste del mismo autor. No se dispone de modelos ASR específicos para darija de referencia pública en la información proporcionada.

| Modelo | Parámetros | Contexto | CER (darija) | Licencia |
|---|---|---|---|---|
| Cohere Transcribe Arabic (base) | 2B | No disponible | 20.2% | other (Cohere) |
| 01Yassine/cohere-transcribe-darija (hybrid) | Adaptador 0.1 GB | No disponible | 14.4% | other (requiere licencia base) |
| 01Yassine/cohere-transcribe-darija-full-lora | Adaptador | No disponible | 16.5% | other |
| 01Yassine/cohere-transcribe-darija-encoder-lora | Adaptador | No disponible | 17.4% | other |

El modelo híbrido supera claramente al base y a las variantes de LoRA puro, lo que demuestra la efectividad de la combinación MultiConv + LoRA para la adaptación a dialectos con pocos datos.

## Limitaciones y advertencias

- Entrenado con solo 3 horas de datos, lo que puede limitar su robustez ante acentos regionales, ruido de fondo o vocabulario especializado.
- El adaptador depende de la licencia del modelo base de Cohere; la licencia "other" puede imponer restricciones de uso comercial. Se debe revisar la documentación oficial de Cohere.
- No se han evaluado sesgos de género, edad o dialecto dentro del darija; el conjunto de entrenamiento proviene de YouTube, lo que puede introducir sesgos hacia ciertos estilos de habla.
- Riesgo de alucinaciones en audio con bajo volumen o ruido de fondo, como se señala en la documentación de Cohere Transcribe; se recomienda un preprocesamiento con VAD (detección de actividad de voz) o un filtro de ruido.
- El modelo solo cubre el par de idiomas ar/ary; no está diseñado para transcripción de otros dialectos árabes o lenguas.
- La calidad de la transcripción puede degradarse en habla rápida o con solapamiento de voces, dado el tamaño limitado del dataset de entrenamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/01Yassine/cohere-transcribe-darija
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Dataset de entrenamiento: https://huggingface.co/datasets/01Yassine/darija-asr-3h
- Benchmark de evaluación: https://huggingface.co/datasets/atlasia/darija-asr-benchmark
- Blog de Cohere sobre Transcribe: https://cohere.com/blog/transcribe
- Documentación de Cohere Transcribe: https://docs.cohere.com/docs/transcribe
- Página oficial de Cohere Transcribe: https://cohere.com/transcribe
- Artículo de TechCrunch sobre el lanzamiento: https://techcrunch.com/2026/03/26/cohere-launches-an-open-source-voice-model-specifically-for-transcription/
