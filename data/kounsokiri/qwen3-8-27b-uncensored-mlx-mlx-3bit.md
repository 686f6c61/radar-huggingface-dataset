# Kounsokiri/Qwen3.8-27B-Uncensored-MLX-mlx-3Bit

## Resumen

Kounsokiri/Qwen3.8-27B-Uncensored-MLX-mlx-3Bit es una cuantizacion en formato MLX de 3 bits del modelo orcarouter/Qwen3.8-27B-Uncensored-MLX, una variante "abliterated" (sin censura) de la familia Qwen. El autor, Kounsokiri, se limita a convertir los pesos originales al formato MLX mediante mlx-lm 0.31.2 para su ejecucion en Apple Silicon, sin aportar informacion sobre el entrenamiento original. El modelo conserva la naturaleza multimodal (image-text-to-text) y las capacidades de razonamiento y function calling declaradas en las etiquetas del modelo base.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de aproximadamente 26.900 millones de parametros en equipos Mac con memoria unificada, gracias a la cuantizacion a 3 bits y al backend MLX. El repositorio ocupa 15,2 GB, lo que lo hace viable en configuraciones de 32 GB o superiores de memoria unificada. No obstante, la informacion tecnica publicada es muy escasa: no se detallan datos de entrenamiento, composicion del dataset ni resultados de benchmarks.

Se trata, por tanto, de un artefacto de despliegue mas que de un modelo con documentacion propia. Cualquier evaluacion rigurosa deberia remitirse al modelo base original, cuya model card no se incluye en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (esta version); el autor etiqueta tambien 4-bit y 8-bit en el repositorio base |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Las etiquetas indican la familia `qwen3_5` y el modelo se presenta como vision-language (pipeline `image-text-to-text`), por lo que se trata de un transformer multimodal con capacidad de procesar imagen y texto. El proceso de "abliteration" (eliminacion de las capas de rechazo mediante intervencion en los pesos) se aplica en el modelo base orcarouter/Qwen3.8-27B-Uncensored-MLX, no en esta cuantizacion.

Esta publicacion concreta es una conversion de pesos realizada con mlx-lm 0.31.2 desde el modelo base, cuantizada a 3 bits. No se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas del modelo original. Toda esa informacion deberia consultarse en la model card de orcarouter/Qwen3.8-27B-Uncensored-MLX, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento (etiqueta `reasoning`).
- Function calling / tool calling (etiqueta `function-calling`).
- Comportamiento "uncensored"/abliterated: ausencia de capas de rechazo, orientado a red-teaming segun las etiquetas `ai-red-team` y `red-teaming`.
- Ejecucion en Apple Silicon mediante MLX.
- Capacidades multilingues limitadas a en y zh segun los metadatos.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el caracter abliterated permite probar la robustez de filtros y salvaguardas en pipelines de moderacion, generando respuestas que un modelo alineado rechazaria.
- Investigacion de alineacion: util para estudiar el efecto de la eliminacion de capas de rechazo sobre el comportamiento del modelo y su calibracion.
- Prototipado local en macOS: desarrolladores con Mac de memoria unificada pueden ejecutar un modelo de ~27B sin GPU dedicada, gracias a MLX y a la cuantizacion a 3 bits.
- Experimentos multimodales: tareas de descripcion de imagenes o image-text-to-text en local para pruebas de concepto.
- Asistentes conversacionales en ingles o chino: conversaciones multi-turno, con la salvedad de que se desconoce la ventana de contexto.
- Evaluacion de cuantizacion: comparar la calidad de la version 3 bits frente al modelo base sin cuantizar para medir la degradacion introducida.
- Integracion en pipelines de agentes con function calling en entornos controlados de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 15,2 GB en disco; la inferencia en 3 bits requiere aproximadamente esa cantidad de memoria unificada, por lo que se recomienda un Mac con 32 GB o mas para dejar margen al contexto y al runtime.
- GPU: no aplica GPU dedicada; MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y superiores).
- Cabe en consumer hardware Apple Silicon con memoria unificada suficiente; no es ejecutable de forma nativa en GPU NVIDIA con este formato.
- Despliegue: `mlx-lm` (version 0.31.2 o compatible) mediante `load` y `generate`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI con estos pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kounsokiri/Qwen3.8-27B-Uncensored-MLX-mlx-3Bit | ~26,9B | no disponible | MLX safetensors 3-bit | apache-2.0 | Cuantizacion para Apple Silicon |
| orcarouter/Qwen3.8-27B-Uncensored-MLX (modelo base) | no disponible | no disponible | MLX | no disponible | Origen de esta conversion |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica rechazos de seguridad, por lo que puede generar contenido danino, ofensivo o ilegal. No apto para produccion orientada al publico sin capas de moderacion externas.
- La cuantizacion a 3 bits degrada la calidad respecto al modelo base; se desconoce la magnitud de la perdida.
- Riesgo elevado de alucinacion, agravado por la cuantizacion agresiva y la falta de datos de evaluacion.
- Idiomas limitados a ingles y chino; el castellano no esta declarado como soportado.
- Longitud de contexto desconocida; no se puede garantizar el rendimiento en conversaciones largas.
- Licencia apache-2.0 declarada, pero la procedencia del modelo base y las condiciones reales de uso comercial deben verificarse en la model card original.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de rendimiento.
- Dependencia exclusiva de Apple Silicon y de `mlx-lm`; no hay soporte documentado para otros backends.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Kounsokiri/Qwen3.8-27B-Uncensored-MLX-mlx-3Bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
