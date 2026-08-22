# root4k/Qwen3.8-27B-Uncensored-oQ8e-mtp

## Resumen

El modelo `root4k/Qwen3.8-27B-Uncensored-oQ8e-mtp` es una cuantización de precisión mixta de 8 bits del modelo base Qwen3.8-27B-Uncensored, realizada con la herramienta oQ (oMLX v0.6.3rc2). El nombre sugiere un modelo de 27.000 millones de parámetros, pero los archivos safetensors indican un total de 8.184.279.792 parámetros, lo que apunta a un posible error de nomenclatura o a un modelo base distinto al esperado. La cuantización está optimizada para ejecutarse en Apple Silicon mediante la librería MLX, con un tamaño de grupo de 64 y formato de pesos en safetensors.

El modelo se presenta como una versión "sin censura" (uncensored) del Qwen3.8-27B, obtenida mediante técnicas de abliteration que eliminan los mecanismos de rechazo de contenido no deseado. Esto lo hace relevante para desarrolladores que necesitan un modelo local con respuestas sin filtros, aunque con los riesgos asociados a la falta de moderación. La cuantización oQ de 8 bits reduce el consumo de memoria y acelera la inferencia en hardware Apple, manteniendo una calidad aceptable.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en los resultados de búsqueda web. No se han publicado benchmarks oficiales ni detalles sobre el entrenamiento del modelo base, por lo que muchos apartados se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiqueta del modelo) |
| Parametros totales | 8.184.279.792 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 8 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantización oQ) |

## Arquitectura y entrenamiento

La arquitectura base es `qwen3_5`, una variante de la familia Qwen 3.5 que no está documentada públicamente en la información proporcionada. El modelo ha sido cuantizado con oQ, una herramienta de cuantización de precisión mixta para MLX que asigna diferentes bits a distintas capas según su sensibilidad, logrando un equilibrio entre tamaño y calidad. En este caso se usan 8 bits con un grupo de 64, lo que reduce el tamaño de los pesos respecto a FP16.

El proceso de "uncensoring" se realizó mediante abliteration, una técnica que modifica los pesos del modelo para eliminar las activaciones responsables de rechazar peticiones consideradas inapropiadas. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El modelo base original (Qwen3.8-27B) tampoco tiene documentación pública en las fuentes consultadas.

## Capacidades

- Generación de texto en lenguaje natural, con respuestas sin filtros de censura gracias a la abliteration.
- Razonamiento y resolución de problemas, heredado del modelo base Qwen 3.5 (capacidad no verificada con benchmarks).
- Ejecución local en Apple Silicon mediante MLX, con inferencia optimizada para chips M-series.
- Soporte de cuantización de 8 bits que reduce los requisitos de memoria frente a FP16.
- No se confirma soporte de tool calling, function calling, agentes, visión o audio; la información disponible no lo menciona.
- Capacidades multilingües no documentadas; se desconoce qué idiomas cubre.

## Casos de uso

- Investigación en generación de texto sin restricciones: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para análisis de sesgos y seguridad.
- Desarrollo de asistentes locales de escritura creativa: puede generar contenido literario o guiones sin filtros de temática, ejecutándose en un Mac sin conexión a internet.
- Prototipado de aplicaciones de chat privadas: al ser local, no envía datos a servidores externos, adecuado para entornos con requisitos de privacidad.
- Experimentación con cuantización MLX: sirve como ejemplo de aplicación de oQ para reducir el tamaño de un modelo manteniendo calidad, útil para desarrolladores que trabajan con Apple Silicon.
- Generación de código y documentación técnica: aunque no se verifica, los modelos Qwen suelen tener buena capacidad en código; puede usarse para tareas de programación sin censura.
- Evaluación de técnicas de abliteration: permite comparar el comportamiento del modelo original frente a la versión sin censura, para entender el impacto de esta modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (chips M1, M2, M3, M4 y superiores) gracias al formato MLX.
- Tamaño de los pesos en 8 bits: aproximadamente 8,2 GB (8.184 millones de parámetros × 1 byte por parámetro), más overhead de activaciones y KV cache.
- Se recomienda un Mac con al menos 16 GB de memoria unificada para ejecutar el modelo con comodidad; con 32 GB se dispone de margen para contextos largos.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; para usarlas habría que convertir los pesos a otro formato (GGUF, FP8, etc.).
- Opciones de despliegue: MLX (librería nativa), oMLX (herramienta de cuantización), y posiblemente conversión a GGUF para llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en este repositorio.
- Latencia y throughput no disponibles; dependerán del chip concreto y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El nombre sugiere una relación con Qwen3-27B, pero los parámetros reales (8,18B) indican que podría tratarse de un modelo de menor tamaño. Alternativas posibles serían Qwen3-8B (8,03B parámetros) o Qwen3-14B, pero no hay datos de rendimiento de este modelo cuantizado frente a ellos. Se recomienda consultar las fichas oficiales de Qwen para comparar.

## Limitaciones y advertencias

- La licencia no está especificada; el uso comercial podría estar restringido. El blog de OrcaRouter menciona un "research-only boundary", lo que sugiere que el uso se limita a investigación.
- Al ser una versión "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe usarse en producción sin medidas de moderación adicionales.
- La abliteration puede degradar la calidad general del modelo, afectando a la coherencia o al razonamiento en algunos dominios.
- No hay información sobre sesgos específicos, pero al derivar de Qwen, es probable que herede sesgos culturales y lingüísticos del entrenamiento original.
- Riesgo de alucinación: no se han evaluado tasas de alucinación; al ser una versión modificada, podría ser mayor que en el modelo original.
- La longitud de contexto no está documentada; se desconoce si soporta ventanas largas (por ejemplo, 128K tokens) o si la cuantización afecta a este aspecto.
- El repositorio tiene 0 descargas y 0 likes, lo que indica poca validación comunitaria; úsese con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/root4k/Qwen3.8-27B-Uncensored-oQ8e-mtp
- Repositorio alternativo (pyros-vault): https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ8e-mtp
- Blog de OrcaRouter sobre ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio GitHub qwen38-uncensored: https://github.com/unburdened-jackinthebox365/qwen38-uncensored
- Blog de ExplainX sobre la versión MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Repositorio FP8 de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
