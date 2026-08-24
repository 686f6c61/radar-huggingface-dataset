# crash-sv/scribe-whisper-turbo-int8

## Resumen

El modelo `crash-sv/scribe-whisper-turbo-int8` es una conversión a CTranslate2 del modelo de reconocimiento automático del habla Whisper large-v3-turbo de OpenAI, cuantizado a 8 bits para ejecutarse en CPU sin GPU CUDA. Lo ha desarrollado el usuario crash-sv para alimentar la utilidad Scribe SV, una herramienta de dictado y traducción para Windows. El modelo base es una versión destilada de Whisper large-v3, con solo 4 capas de decodificación en lugar de 32, lo que reduce la latencia respecto al original. Esta conversión mantiene la licencia MIT y reduce el peso de los pesos de 1,5 GB (float16) a 0,8 GB (int8), lo que permite su ejecución en equipos modestos. No se ha reentrenado ni ajustado: se trata de una conversión directa de los pesos oficiales con cuantización int8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, destilado con 4 capas de decodificación) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (este repo), float16 (repo separado) |
| Idiomas soportados | ru, en |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin, config.json, tokenizer.json) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos oficiales de OpenAI Whisper large-v3-turbo a formato CTranslate2, con cuantización a int8. No se ha realizado ningún reentrenamiento ni ajuste fino. El modelo base es una versión destilada de Whisper large-v3, que reduce las capas de decodificación de 32 a 4, lo que acelera la inferencia con una degradación mínima de precisión. Según los resultados de búsqueda, el modelo Whisper se entrenó con más de 5 millones de horas de datos
