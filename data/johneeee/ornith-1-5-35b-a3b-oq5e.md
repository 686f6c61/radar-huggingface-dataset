# Johneeee/Ornith-1.5-35B-A3B-oQ5e

## Resumen

El modelo `Johneeee/Ornith-1.5-35B-A3B-oQ5e` es una cuantización de 5 bits del modelo de lenguaje Ornith-1.5-35B-A3B, realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors. Según el tag `qwen3_5_moe`, la arquitectura base corresponde a un modelo de tipo Mixture of Experts (MoE) de la familia Qwen3.5, aunque no se dispone de documentación oficial del modelo original. El nombre sugiere 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos (A3B), una configuración típica de los MoE eficientes. El repositorio ocupa 24.5 GB, coherente con una cuantización de 5 bits con group size 64.

Este modelo está diseñado para ejecutarse en entornos Apple Silicon mediante la librería MLX, aprovechando la memoria unificada. Al ser una cuantización, su objetivo principal es reducir los requisitos de memoria y acelerar la inferencia en comparación con el modelo original en precisión completa. No se dispone de información sobre el conjunto de datos de entrenamiento, el proceso de alineación o las capacidades específicas, ya que la ficha del autor solo documenta los detalles de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (el nombre sugiere ~3B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (oQ) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento o el proceso de alineación del modelo original Ornith-1.5-35B-A3B. El tag `qwen3_5_moe` indica que se trata de una arquitectura MoE derivada de la serie Qwen3.5, lo que implica una estructura con múltiples expertos y un mecanismo de enrutamiento que activa solo una fracción de los parámetros por token. La cuantización aplicada con oQ utiliza precisión mixta de 5 bits con group size 64, lo que reduce el tamaño del modelo de aproximadamente 69 GB (en fp16) a 24.5 GB. No se dispone de detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. Al ser una cuantización de un MoE de la familia Qwen3.5, es razonable esperar capacidades de generación de texto, razonamiento, codigo y posiblemente tool calling, pero no hay documentacion que lo confirme. Se recomienda consultar la ficha del modelo original Ornith-1.5-35B-A3B para obtener detalles, si esta disponible.

## Casos de uso

No se dispone de informacion suficiente para recomendar casos de uso concretos. La falta de datos sobre el modelo base, su licencia y sus capacidades impide realizar recomendaciones responsables. Se sugiere evaluar el modelo en tareas de generacion de texto general antes de considerarlo para aplicaciones especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 24.5 GB (pesos cuantizados a 5 bits).
- Para inferencia con MLX se requiere un Mac con memoria unificada de al menos 32 GB (recomendado 48 GB o mas para dejar espacio al contexto y los estados intermedios).
- Compatible con Apple Silicon (M1, M2, M3 y superiores) mediante la libreria MLX.
- No se dispone de datos de latencia o throughput.
- No se ha verificado compatibilidad con otras plataformas (CUDA, ROCm) dado que el formato es MLX.

## Comparativa con modelos similares

No se dispone de modelos comparables verificados en la informacion proporcionada. El nombre sugiere una configuracion similar a otros MoE de ~35B totales y ~3B activos (por ejemplo, Qwen3-30B-A3B), pero no se puede confirmar sin datos del modelo original.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial.
- El modelo esta cuantizado a 5 bits, lo que puede implicar una degradacion de calidad frente a la version en precision completa.
- La ausencia de documentacion sobre el modelo base dificulta la evaluacion de su idoneidad para tareas especificas.
- No se ha verificado la procedencia del modelo original ni su proceso de entrenamiento.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/Johneeee/Ornith-1.5-35B-A3B-oQ5e)
- [Herramienta oQ / oMLX](https://github.com/jundot/omlx)
