# bloomer010/Ling-3.0-flash-REAP176-46B-A5B-GGUF

## Resumen

Ling-3.0-flash REAP176 es una versión podada del modelo MoE inclusionAI/Ling-3.0-flash, publicada por el usuario bloomer010 en formato GGUF. La poda se realiza mediante el método REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), que elimina los expertos menos relevantes según su peso en el router y la norma L2 de sus salidas, sin ningún ajuste fino posterior. En concreto, se conservan 176 de los 512 expertos enrutados por capa, lo que supone eliminar el 65,6 % de los expertos originales. El modelo resultante tiene 46 196 971 024 parámetros totales, de los cuales aproximadamente 5 100 millones son activos por token.

El autor advierte explícitamente que se trata de un modelo "muy podado" y "aún sin probar en profundidad", por lo que su calidad no está garantizada. La relevancia de esta publicación radica en explorar la viabilidad de la poda de expertos para reducir el coste de inferencia de modelos MoE de gran tamaño, permitiendo ejecutar un modelo de 46B totales con solo 5,1B activos en hardware más modesto, especialmente mediante la descarga de los expertos a memoria RAM de CPU. La compatibilidad con llama.cpp depende de un pull request aún pendiente de fusión (PR #26608), aunque ya existe un fork que lo soporta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, con 176 de 512 expertos enrutados por capa |
| Parametros totales | 46 196 971 024 (46,2B) |
| Parametros activos | ~5,1B |
| Longitud de contexto | No disponible (el comando de ejemplo usa 65 536 tokens, pero no se especifica el contexto nativo del modelo) |
| Tipos de cuantizacion | MXFP4 (expertos en MXFP4, resto en Q8_0), Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Ling-3.0-flash, es un transformer MoE con 512 expertos enrutados por capa. La versión REAP176 aplica una poda one-shot de expertos: se puntúa cada experto mediante el producto del valor de la puerta del router y la norma L2 de sus salidas, calculado sobre datos de calibración, y se eliminan los de menor puntuación. En este caso se mantienen 176 expertos por capa, que corresponden a 22 grupos de 8 expertos, el paso divisible por el tamaño de grupo más cercano al objetivo de 174. No se realizó ningún entrenamiento de recuperación ni ajuste fino tras la poda.

La calibración se realizó con 1 millón de tokens, compuestos por un 50 % de Ultrachat, 25 % de Wikitext y 25 % de código. Los pesos se exportaron en BF16 y posteriormente se cuantizaron a los formatos GGUF listados. La arquitectura resultante requiere soporte específico para el tipo de MoE `bailingmoe3`, que aún no está integrado en la rama principal de llama.cpp (pendiente del PR #26608).

## Capacidades

- Generación de texto y razonamiento: al ser un LLM MoE, conserva las capacidades generales del modelo base, aunque degradadas por la poda agresiva.
- Generación de código: la calibración incluyó un 25 % de datos de código, lo que sugiere cierta competencia en esta tarea, aunque no hay evaluaciones publicadas.
- Soporte de tool calling / function calling: no especificado en la información disponible; no se puede confirmar.
- Soporte de agentes y multi-step reasoning: no especificado; no se puede confirmar.
- Capacidades multilingües: no especificadas.
- Capacidad especial de despliegue: permite servir los expertos desde memoria RAM de CPU mientras la atención se ejecuta en GPU, mediante la opción `-ot "ffn_.*_exps\.weight=CPU"` de llama-server. Esto reduce drásticamente los requisitos de VRAM.

## Casos de uso

- Experimentación con poda de expertos: investigadores pueden usar este modelo para estudiar el impacto de REAP en la calidad de generación sin necesidad de ejecutar el modelo completo, comparando salidas con la versión original.
- Prototipado en entornos con VRAM limitada: al mantener solo 5,1B parámetros activos y permitir offload de expertos a CPU, es viable ejecutar el modelo en GPUs de gama media (por ejemplo, RTX 3060 o similar) con suficiente RAM del sistema.
- Evaluación de degradación tras poda: sirve como caso de estudio para medir la pérdida de rendimiento en tareas de razonamiento, código y diálogo frente al modelo base, útil para decidir si la poda es aceptable en producción.
- Inferencia de bajo coste en CPU: con cuantizaciones Q3_K_M o Q2_K y los expertos en RAM, se puede ejecutar en máquinas sin GPU dedicada, aunque con latencia mayor. Adecuado para pruebas o entornos sin aceleración.
- Servicio de chat con contexto largo: el comando de ejemplo configura una ventana de 65 536 tokens, lo que permite manejar conversaciones extensas o documentos largos, siempre que la calidad tras la poda sea suficiente para la aplicación.
- Benchmarking de formatos de cuantización: el repositorio ofrece varias cuantizaciones (MXFP4, Q4_K_M, Q3_K_M, Q2_K), lo que permite comparar el equilibrio entre tamaño, velocidad y calidad para un mismo modelo podado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo está "aún sin probar en profundidad", por lo que no existen métricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para esta versión podada.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización y de si se usa offload de expertos. Con el comando recomendado (`-ngl 99` y expertos en CPU), la VRAM solo debe alojar las capas de atención y el resto de pesos no expertos; con cuantización MXFP4, se estima que cabría en GPUs de 8–12 GB, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no hay especificación oficial. Para el modo con expertos en CPU, cualquier GPU moderna con soporte CUDA o Vulkan y al menos 8 GB de VRAM podría funcionar. Sin offload, se necesitaría una GPU con VRAM suficiente para los 46B de parámetros en la cuantización elegida (por ejemplo, 24 GB o más para Q4_K_M).
- Si cabe en consumer GPU: sí, siempre que se utilice el offload de expertos a RAM de CPU. Sin offload, requeriría GPUs de gama alta (RTX 4090, A6000, etc.).
- Opciones de despliegue: llama.cpp (llama-server) con el fork que soporta `bailingmoe3`, o cualquier build posterior a la fusión del PR #26608. No se mencionan otras herramientas como vLLM u Ollama.
- Latencia y throughput: no disponibles. La descarga de expertos desde RAM aumentará la latencia respecto a tenerlos en VRAM; el impacto exacto depende del ancho de banda de memoria del sistema.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base inclusionAI/Ling-3.0-flash es el punto de referencia natural, pero no se han publicado sus especificaciones detalladas ni benchmarks en la documentación proporcionada. Tampoco se conocen otras versiones podadas de Ling-3.0-flash con las que contrastar. Por tanto, la comparativa se limita a señalar que esta versión reduce los parámetros activos de forma drástica (de un valor desconocido del original a 5,1B), a costa de una posible pérdida de calidad no cuantificada.

## Limitaciones y advertencias

- Modelo muy podado: se han eliminado el 65,6 % de los expertos, lo que probablemente degrade significativamente la calidad en tareas complejas. El propio autor lo califica de "muy podado" y "aún sin probar".
- Sin entrenamiento de recuperación: la poda se realizó one-shot sin fine-tuning posterior, por lo que no se ha compensado la pérdida de capacidad.
- Dependencia de soporte experimental: requiere una versión de llama.cpp con soporte para `bailingmoe3`, aún no fusionada en la rama principal (PR #26608 pendiente). Hasta entonces, solo funciona con el fork indicado.
- Riesgo de alucinación y sesgos: no se han evaluado, y al ser una versión podada sin ajuste, podrían ser mayores que en el modelo original.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor o el modelo base antes de usarlo en producción.
- Sin benchmarks: no hay datos objetivos de rendimiento, por lo que cualquier uso en aplicaciones críticas debe ir precedido de una evaluación propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP176-46B-A5B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Paper REAP: https://arxiv.org/abs/2510.13999
- Pull request de soporte bailingmoe3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de llama.cpp con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
