# SLBM/caliber-df-9b

## Resumen

SLBM/caliber-df-9b es un modelo de 8.953.803.264 parámetros publicado por SLBM en Hugging Face, con licencia Apache-2.0 y pesos en formato safetensors. La model card lo define como un «fine-tuned decision model for REAX subnet 92 demand forecasting», es decir, un modelo ajustado para previsión de demanda en el contexto de la subnet 92 de REAX. El pipeline declarado es text-generation y el tag `qwen3_5_text` apunta a una arquitectura de la familia Qwen3.5 de texto, aunque no se detallan capas, atención, contexto ni datos de entrenamiento.

El repositorio ocupa 17,9 GB, un tamaño coherente con pesos de 16 bits para 8,95 mil millones de parámetros. No se han publicado resultados de benchmarks, idiomas soportados, longitud de contexto ni formatos de cuantización; además, el repositorio no registra descargas ni likes en el momento de la consulta. Su relevancia es acotada: cubre una tarea vertical de previsión de demanda dentro de REAX, pero la documentación disponible es insuficiente para evaluar su calidad frente a alternativas.

Al no existir una model card técnica ampliada, cualquier uso en producción exige validar el modelo contra datos propios y revisar el proceso de fine-tuning, la tokenización y el tratamiento de series temporales o variables exógenas, aspectos que no se describen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada; el tag `qwen3_5_text` indica una arquitectura de la familia Qwen3.5 de texto |
| Parámetros totales | 8.953.803.264 (8,95 mil millones) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors y no se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Tamaño del repositorio | 17,9 GB |
| Compatibilidad declarada | `endpoints_compatible` (tag) |
| Publicación | 2026-10-19 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura. El tag `qwen3_5_text` sugiere que el modelo parte de la familia Qwen3.5 de texto y el pipeline `text-generation` confirma una salida autoregresiva de texto; sin embargo, no se publican número de capas, dimensión oculta, cabezas de atención, vocabulario, mecanismo de atención ni longitud de contexto. Tampoco se especifica si el ajuste para previsión de demanda utiliza series temporales serializadas, variables exógenas o instrucciones en lenguaje natural.

El entrenamiento se describe únicamente como un fine-tuning para previsión de demanda en la subnet 92 de REAX. No hay datos sobre volumen de tokens, composición del dataset, uso de RLHF/DPO, pérdida de entrenamiento, proceso de alineación ni evaluación. El término «decision model» sugiere un uso orientado a decisiones operativas, pero no se documenta el formato de entrada/salida ni si genera valores numéricos, distribuciones o recomendaciones textuales.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es `text-generation`.
- Previsión de demanda específica: fine-tuning declarado para REAX subnet 92 demand forecasting; no se detalla granularidad temporal, horizonte ni
