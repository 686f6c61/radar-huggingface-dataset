# metajazz/Qwen3.8-27B-oQ4-fp16-mtp

## Resumen

El modelo `metajazz/Qwen3.8-27B-oQ4-fp16-mtp` es una cuantización de precisión mixta realizada con la herramienta oQ (oMLX v0.6.0.dev1), que aplica cuantización de 4 bits con group size 64 sobre un modelo base identificado como `qwen3_5` (posiblemente una variante de la familia Qwen3.5). A pesar del nombre que sugiere 27B de parámetros, los datos reales de los safetensors indican 4.926.789.872 parámetros (~4,9B), por lo que existe una discrepancia notable entre la denominación y el peso real del modelo.

El repositorio, creado el 16 de agosto de 2026, contiene únicamente los pesos cuantizados en formato MLX safetensors, sin documentación adicional sobre el modelo original, licencia, idiomas o capacidades. Su interés radica en ser un ejemplo de cuantización oQ para ejecución en dispositivos Apple Silicon mediante la librería MLX, aunque la falta de información oficial limita su evaluación como modelo independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (variante de Qwen3.5, sin detalles adicionales) |
| Parametros totales | 4.926.789.872 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 4-bit, group size 64, precisión mixta fp16 para ciertas capas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, cabezas de atención, mecanismo de atención, etc.) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El único dato técnico aportado es que se trata de un modelo de tipo `qwen3_5` cuantizado con oQ, una herramienta de cuantización de precisión mixta que selecciona dinámicamente qué capas requieren mayor precisión (fp16) y cuáles pueden reducirse a 4 bits, manteniendo un equilibrio entre tamaño y calidad. No se especifica si el modelo original fue entrenado desde cero o es un fine-tuning de una versión anterior de Qwen.

## Capacidades

No se han publicado capacidades específicas en la información disponible. Al tratarse de una cuantización de un modelo de la familia Qwen, es plausible que herede capacidades de generación de texto, razonamiento, código y multilingüismo, pero no hay confirmación oficial. No se menciona soporte para tool calling, agentes, visión, audio ni modo de pensamiento.

## Casos de uso

No hay casos de uso documentados en la información proporcionada. Dado que el formato MLX está orientado a dispositivos Apple Silicon, podría emplearse en aplicaciones de generación de texto en local sobre macOS, pero esta afirmación es especulativa y no está respaldada por el autor. Se recomienda consultar el repositorio original de oQ para entender mejor el propósito de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Formato MLX safetensors: diseñado para ejecución en Apple Silicon (M1/M2/M3/M4) mediante la librería MLX.
- Tamaño del repo: 17,9 GB, lo que sugiere que la cuantización 4-bit de un modelo de ~4,9B ocupa aproximadamente ese espacio en disco.
- VRAM estimada: no disponible. Con 4,9B parámetros en 4-bit, el uso de memoria sería del orden de 2,5-3 GB, pero no se confirma.
- Opciones de despliegue: MLX (Apple Silicon), posiblemente compatible con herramientas que soporten MLX como `mlx-lm` o `mlx-lm-server`. No se indica soporte para vLLM, llama.cpp u otros backends.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El nombre sugiere una relación con Qwen3-27B, pero los parámetros reales (4,9B) lo acercan más a modelos como Qwen3-4B o Qwen2.5-7B. Sin datos de rendimiento ni licencia, no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- Discrepancia entre el nombre del modelo (Qwen3.8-27B) y los parámetros reales (4,9B), lo que puede indicar un error de etiquetado o un modelo base distinto al declarado.
- Ausencia total de documentación: no hay licencia, idiomas, contexto, ni especificaciones del modelo original.
- Riesgo de alucinación y sesgos: desconocido al no haber información sobre el entrenamiento.
- Restricciones de uso comercial: no se puede determinar debido a la falta de licencia.
- Para producción, se recomienda contactar al autor o buscar el modelo base original para obtener datos fiables.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/metajazz/Qwen3.8-27B-oQ4-fp16-mtp)
- [Herramienta oQ (oMLX)](https://github.com/jundot/omlx)
