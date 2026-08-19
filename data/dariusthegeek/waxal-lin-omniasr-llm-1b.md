# DariusTheGeek/waxal-lin-omniasr-llm-1b

## Resumen

`waxal-lin-omniasr-llm-1b` es un modelo de reconocimiento automático de voz (ASR) especializado en lingala, desarrollado por DariusTheGeek como parte de la solución WAXAL ASR para el desafío Google WAXAL. Se trata de un fine-tuning del modelo base `facebook/omniASR-LLM-1B-v2` (arquitectura de 1B parámetros) sobre el subconjunto supervisado de lingala del dataset `google/WaxalNLP`. El modelo está pensado para transcripción de audio en lingala, pero no como componente independiente, sino como miembro de un ensamblaje (ensemble) que incluye rutado, decodificación y fusión de múltiples sistemas.

La relevancia de este modelo radica en su contribución a un problema de bajos recursos: el reconocimiento de voz para lenguas africanas poco representadas como el lingala. Al partir de un modelo base multilingüe de ASR de Meta y fine-tunearlo con datos específicos, se consigue un artefacto que, combinado con otros, mejora la precisión en esta lengua. El checkpoint se distribuye en formato `model.pt` (fairseq2) con un tamaño de 9,12 GB, y la licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con decodificador LLM (basado en `facebook/omniASR-LLM-1B-v2`) |
| Parametros totales | 1B (aproximado, según el nombre del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP64, promediado top-3 uniforme) |
| Idiomas soportados | Lingala (ln) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.pt` (checkpoint fairseq2) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `omniASR-LLM-1B-v2`, un sistema de ASR que combina un codificador acústico con un decodificador basado en un LLM de 1B parámetros. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, atención, etc.) en la información disponible. El entrenamiento consiste en un fine-tuning supervisado sobre el subconjunto de lingala del dataset `google/WaxalNLP`, con semilla fija 42. Como técnica de mejora, se realizó un promediado de los tres mejores checkpoints (top-3 uniform FP64 average), y la decodificación se realiza con beam search de ancho 5 y normalización de longitud activada. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Transcripción de audio en lingala (reconocimiento automático de voz).
- El modelo está diseñado para integrarse en un pipeline de ensamblaje con otros sistemas ASR; no se recomienda su uso aislado.
- Soporta decodificación con beam search y normalización de longitud.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-step; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conversaciones en lingala: el modelo puede convertir audio en texto para actas o subtitulado, aprovechando su fine-tuning específico en esta lengua.
- Archivado de contenido audiovisual: permite indexar y buscar por texto material de radio, televisión o podcasts en lingala.
- Asistentes de voz para comunidades lingala: integración en aplicaciones de voz a texto para servicios locales (salud, educación, administración).
- Investigación lingüística: apoyo en la documentación y análisis de la lengua lingala mediante transcripción automática de corpus orales.
- Pipelines de subtitulado automático: combinado con herramientas de post-procesado, puede generar subtítulos para vídeos en lingala.
- Sistemas de atención al cliente multilingüe: transcripción de llamadas de soporte en lingala para análisis posterior o respuestas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan métricas como WER, CER o comparaciones con otros modelos en el dataset Waxal.

## Requisitos de hardware

- Tamaño del checkpoint: 9,12 GB (FP64). Para inferencia, se requiere una GPU con al menos 12 GB de VRAM para cargar los pesos en FP16 o BF16 (estimación razonable, aunque no se especifica oficialmente).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) para mayor comodidad y margen.
- No se indica soporte para CPU; el uso previsto es con GPU.
- Opciones de despliegue: el repositorio de la solución WAXAL proporciona un CLI con entorno fijado (`install.sh`) y scripts de inferencia basados en fairseq2. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `waxal-lin-omniasr-llm-1b` (este) | 1B | no disponible | Lingala | Apache-2.0 | Fine-tuning de omniASR-LLM-1B-v2, parte de ensemble |
| `facebook/omniASR-LLM-1B-v2` | 1B | no disponible | Multilingüe | Apache-2.0 | Modelo base, ASR multilingüe |
| `mlai-dante/waxal-omniASR-LLM-1B-v2` | 1B | no disponible | Lingala, Luganda, Shona | Apache-2.0 | Fine-tuning para tres lenguas del desafío WAXAL |

No se dispone de comparativas de rendimiento (WER) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un componente de un ensamblaje; usarlo de forma aislada puede degradar significativamente la precisión.
- Solo soporta lingala; no es multilingüe.
- No se han publicado métricas de rendimiento (WER, CER), por lo que no se puede evaluar su calidad objetiva.
- Los pesos están en FP64, lo que duplica el uso de VRAM frente a FP16; puede requerir conversión para entornos con menos memoria.
- No se documentan sesgos específicos, pero al ser un modelo de ASR, puede tener errores en acentos, ruido o habla no estándar.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (WaxalNLP) para cumplir con sus términos.

## Enlaces

- HuggingFace: https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-llm-1b
- Repositorio de la solución WAXAL ASR: https://github.com/DariusTheGeek/waxal-asr-solution
- Dataset WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Modelo base: https://huggingface.co/facebook/omniASR-LLM-1B-v2
