# mradermacher/Qwen-3.5-2B-Spatial-SQL-1.1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones estáticas en formato GGUF del modelo `Qwen-3.5-2B-Spatial-SQL-1.1`, publicado originalmente por `markrodrigo` en Hugging Face. El autor `mradermacher` ha generado una serie de archivos GGUF con distintos niveles de cuantización para facilitar la ejecución local del modelo en entornos con recursos limitados, como equipos de escritorio o servidores sin GPUs de gama alta.

El modelo base, del que no se dispone de una ficha técnica pública detallada, parece estar orientado a tareas de generación de SQL espacial (Spatial SQL), un dominio que combina consultas SQL con funciones geoespaciales. Al ser una versión cuantizada, no se aporta información adicional sobre el entrenamiento o las capacidades del modelo original; este repositorio es únicamente un artefacto de distribución de pesos.

La relevancia de este repositorio radica en su utilidad práctica: permite probar el modelo en local con distintos grados de compresión (desde `f16` hasta `Q2_K`) y elegir el equilibrio entre calidad de salida y consumo de memoria según el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 2B, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `x-f16`, `Q4_K_S`, `Q2_K`, `Q8_0`, `Q6_K`, `Q3_K_M`, `Q3_K_S`, `Q3_K_L`, `Q4_K_M`, `Q5_K_S`, `Q5_K_M`, `IQ4_XS` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para el modelo original. Este repositorio solo contiene las conversiones a GGUF realizadas por `mradermacher` a partir de los pesos de Hugging Face del modelo `Qwen-3.5-2B-Spatial-SQL-1.1`. No se documentan innovaciones técnicas ni detalles sobre el fine-tuning.

## Capacidades

No se han publicado en este repositorio descripciones de las capacidades específicas del modelo. Dado el nombre, es probable que esté especializado en la generación de consultas SQL con componentes espaciales (por ejemplo, funciones como `ST_Within`, `ST_Distance` o `ST_Intersects`), pero esta afirmación no puede verificarse con los datos disponibles. Tampoco se confirma si el modelo base Qwen 3.5 incorpora capacidades multimodales, tool calling o razonamiento avanzado, ya que no se proporciona ninguna documentación al respecto.

## Casos de uso

No se dispone de información concreta sobre casos de uso validados. En ausencia de una descripción oficial, no es posible recomendar escenarios específicos con garantías. Un usuario interesado podría evaluar el modelo en tareas de generación de SQL espacial, pero se recomienda contrastar los resultados con un modelo de referencia antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos dependen del tamaño real del modelo base, que no se ha confirmado. Si se asume que el nombre `2B` corresponde a 2 mil millones de parámetros, una cuantización `Q4_K_M` ocuparía aproximadamente entre 1,5 y 2 GB de memoria, lo que permitiría su ejecución en GPUs de consumo como una NVIDIA GTX 1060 de 6 GB o incluso en CPU con suficiente RAM. Sin embargo, al no conocerse la arquitectura exacta ni el tamaño real de los pesos, estas cifras son orientativas y no deben tomarse como definitivas.

Para inferencia, se pueden utilizar motores compatibles con GGUF como `llama.cpp`, `Ollama` o `LM Studio`. No se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en el ámbito de SQL espacial con los que contrastar este modelo.

## Limitaciones y advertencias

- Al ser una cuantización, existe una pérdida de precisión inherente que puede afectar a la calidad de las respuestas, especialmente en cuantizaciones agresivas como `Q2_K` o `IQ4_XS`.
- No se ha publicado ninguna evaluación de sesgos, alucinaciones o robustez del modelo.
- La licencia es desconocida, por lo que no se puede garantizar que el uso comercial esté permitido. Se recomienda contactar con el autor original antes de cualquier despliegue productivo.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede provocar errores si se superan los límites del modelo base.
- El repositorio no incluye documentación sobre el proceso de entrenamiento ni sobre el dominio específico, lo que dificulta la evaluación de su idoneidad para tareas concretas.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Qwen-3.5-2B-Spatial-SQL-1.1-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/markrodrigo/Qwen-3.5-2B-Spatial-SQL-1.1
