# DariusTheGeek/waxal-lin-omniasr-llm-3b

## Resumen

El modelo `waxal-lin-omniasr-llm-3b` es un checkpoint de reconocimiento automático del habla (ASR) desarrollado por DariusTheGeek como parte de la solución WAXAL ASR, un sistema de transcripción para lenguas africanas. Se trata de un fine-tuning del modelo base `facebook/omniASR-LLM-3B-v2` sobre el subconjunto supervisado de Lingala del dataset `google/WaxalNLP`. El modelo está diseñado exclusivamente para transcribir audio en Lingala y se integra como uno de los componentes de un ensemble de fusión de hipótesis (word ROVER) junto con otros modelos de la misma familia (por ejemplo, la variante de 1B). No está pensado para uso independiente, sino como parte del pipeline completo descrito en el repositorio de la solución.

La arquitectura subyacente es la de OmniASR LLM-3B v2, un modelo de reconocimiento de voz multilingüe basado en un transformador de lenguaje (LLM) con decodificación de texto. El checkpoint se distribuye en formato de pesos de fairseq2 (`model.pt`) con un tamaño de 17,5 GB, lo que sugiere una representación en precisión doble (FP64) o mixta. La licencia es Apache 2.0, heredada del modelo padre. Su relevancia radica en abordar la escasez de sistemas ASR para lenguas de bajos recursos como el lingala, y en demostrar un enfoque de ensemble para mejorar la precisión frente a modelos cero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OmniASR LLM-3B v2 (transformador, detalles internos no disponibles) |
| Parametros totales | No disponible (el nombre sugiere 3B, no confirmado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en FP64 según la model card, 17,5 GB) |
| Idiomas soportados | Lingala (fine-tuning específico; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de fairseq2 (`model.pt`, no safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en `facebook/omniASR-LLM-3B-v2`, un sistema de ASR omnilingüe que combina un codificador de audio con un modelo de lenguaje de 3 mil millones de parámetros (según la nomenclatura del fabricante, aunque no se confirma en la documentación). El fine-tuning se realizó sobre el split supervisado de Lingala/Shona del dataset `google/WaxalNLP`, con semilla 42. No se detallan los hiperparámetros de entrenamiento, la duración ni las técnicas de alineación (RLHF, DPO, etc.). La decodificación se realiza con búsqueda de haz (beam) de ancho 5 y normalización de longitud. El checkpoint publicado corresponde al promedio de los tres mejores parámetros en precisión FP64, una técnica habitual para mejorar la robustez.

No se dispone de información sobre innovaciones técnicas específicas más allá de las heredadas del modelo base (que no se describen en la documentación proporcionada). El modelo se integra en un pipeline de ensemble donde sus hipótesis se fusionan mediante word ROVER con otros modelos de la familia WAXAL.

## Capacidades

- Transcripción de audio en Lingala a texto (reconocimiento automático del habla).
- Decodificación con búsqueda de haz (beam search) y normalización de longitud.
- Integración como componente de un ensemble de fusión de hipótesis (word ROVER) para mejorar la precisión final.
- Soporte de entrada de audio en formato WAV (a través del pipeline de la solución).
- No se documentan capacidades adicionales como traducción, diarización, tool calling o razonamiento multimodal.

## Casos de uso

- Transcripción de reuniones y conversaciones en Lingala: el modelo puede convertir grabaciones de audio en texto para actas o subtitulado, siempre que se utilice dentro del pipeline WAXAL completo.
- Generación de subtítulos para vídeos en Lingala: útil para medios de comunicación o creadores de contenido que necesiten subtitular material en este idioma.
- Archivo y búsqueda de contenido oral: transcribir entrevistas, testimonios o archivos históricos en Lingala para hacerlos consultables textualmente.
- Asistencia a la educación: transcripción de clases o material didáctico en Lingala para facilitar el estudio y la accesibilidad.
- Investigación lingüística: creación de corpus transcritos de Lingala para estudios fonéticos, morfológicos o de procesamiento del lenguaje natural.
- Desarrollo de asistentes de voz locales: integración en sistemas de atención al cliente o asistentes personales que operen en Lingala, siempre que se combine con otros módulos (detección de actividad de voz, post-procesado, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación solo menciona que el modelo forma parte de un ensemble y que los modelos fine-tuned superan a los cero-shot en 26,9 puntos porcentuales según el benchmark WAXALNet, pero no se proporcionan cifras específicas para este checkpoint en concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del checkpoint (17,5 GB), se recomienda al menos 24 GB de VRAM si se cargan los pesos en FP32 o FP16 (con conversión previa). En FP64 se necesitarían más de 32 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o superiores. Para FP64, solo GPUs de datacenter con soporte completo.
- No cabe en GPUs de consumo de gama baja (por ejemplo, RTX 3060 de 12 GB) sin cuantización, pero no se ofrecen versiones cuantizadas.
- Opciones de despliegue: el pipeline oficial usa fairseq2 y un entorno Python pinneado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Existe una variante hermana `waxal-lin-omniasr-llm-1b` (9,12 GB) del mismo autor y para el mismo idioma, pero no se aportan métricas comparativas. Otros modelos ASR para lenguas africanas podrían ser relevantes, pero no se mencionan en la documentación. Se recomienda consultar el benchmark WAXALNet (https://waxalnet.vercel.app/) para comparaciones entre modelos de la familia.

## Limitaciones y advertencias

- Este modelo es un componente de un ensemble y no debe usarse de forma aislada; la documentación del autor lo indica explícitamente.
- Solo está fine-tuned para Lingala; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- El tamaño del checkpoint (17,5 GB en FP64) dificulta su despliegue en entornos con recursos limitados.
- No se documentan sesgos específicos, pero al entrenarse con datos limitados de una sola lengua, puede presentar sesgos hacia variedades dialectales o acentos concretos.
- Riesgo de alucinación en la transcripción (inserción de palabras o frases no presentes en el audio), especialmente en condiciones de ruido o solapamiento de hablantes.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del dataset `google/WaxalNLP` para el fine-tuning.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-llm-3b
- Repositorio de la solución WAXAL ASR: https://github.com/DariusTheGeek/waxal-asr-solution
- Dataset de entrenamiento: https://huggingface.co/datasets/google/WaxalNLP
- Benchmark WAXALNet: https://waxalnet.vercel.app/
- Modelo hermano de 1B: https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-llm-1b/tree/main
