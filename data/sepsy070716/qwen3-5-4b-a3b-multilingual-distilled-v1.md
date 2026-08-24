# sepsy070716/Qwen3.5-4B-A3B-Multilingual-Distilled-v1

## Resumen

Qwen3.5-4B-A3B-Multilingual-Distilled-v1 es un checkpoint experimental de destilación por capas, desarrollado por el usuario sepsy070716, que parte de un modelo MoE upcycled (Qwen3.5-4B-A3B-Upcycled) y utiliza el modelo denso Qwen/Qwen3.5-4B como maestro. El objetivo es mejorar la reconstrucción de las salidas de las capas FFN densas del maestro en cada bloque MoE, con un enfoque multilingüe equilibrado en seis idiomas. Se trata de un trabajo de investigación que no ha recibido entrenamiento de recuperación end-to-end, por lo que no es apto para uso en producción.

El modelo tiene 4.036 millones de parámetros totales, de los cuales 2.998 millones son activos, con arquitectura MoE de 8 expertos y selección top-2. La destilación se aplicó a las 32 capas MoE, logrando una mejora media del 6,57% en el error cuadrático medio relativo de las FFN densas, y una reducción del 11,72% en la pérdida causal-LM frente al upcycle sin entrenar. Sin embargo, la pérdida del maestro denso es de aproximadamente 2,94, lo que evidencia una brecha de recuperación aún muy grande.

La relevancia de este checkpoint reside en su carácter exploratorio: demuestra que la destilación por capas puede mejorar la reconstrucción local de representaciones en un MoE multilingüe, pero subraya la necesidad de un entrenamiento conjunto de recuperación para obtener un modelo utilizable. No se han publicado benchmarks ni resultados de tareas downstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 32 bloques, 8 expertos, top-2 |
| Parametros totales | 4.036.686.336 |
| Parametros activos | 2.998.596.096 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Entrenado en coreano, ingles, chino mandarin, japones, espanol y aleman (para destilacion); no se especifican idiomas de inferencia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MoE con 32 bloques, cada uno con 8 expertos y selección top-2. El ancho compartido es de 1.536 y el ancho enrutado de 704. Se deriva de un upcycle de Qwen3.5-4B, es decir, se convirtió un modelo denso en MoE sin entrenamiento adicional. La destilación se realizó por capas: cada capa recibió 24 actualizaciones locales (cuatro documentos por idioma) usando una muestra equilibrada de FineWeb/FineWeb2 en seis idiomas (coreano, inglés, chino mandarín, japonés, español y alemán). El objetivo era minimizar el error cuadrático medio relativo entre las salidas de la FFN densa del maestro y las del bloque MoE destilado.

La evaluación se hizo con una partición disjunta de dos documentos por idioma y capa. Se logró una mejora media del 6,57% en el MSE relativo, con mejoras en las 32 capas y en los 192 pares idioma-capa. La pérdida causal-LM media sobre documentos de 128 tokens mejoró de 10,378 (upcycle sin entrenar) a 9,162, una reducción relativa del 11,72%. Sin embargo, el maestro denso alcanza una pérdida de aproximadamente 2,94, lo que indica que la destilación local no es suficiente para recuperar el rendimiento global. Una prueba de generación greedy con dos prompts mostró que los siguientes cuatro tokens eran predominantemente espacios en blanco, confirmando que el modelo no es utilizable para generación sin entrenamiento de recuperación adicional.

## Capacidades

- Generación de texto: técnicamente puede generar tokens, pero la calidad es muy pobre (espacios en blanco en la prueba de humo), por lo que no es utilizable para tareas reales.
- Razonamiento y codigo: no se han evaluado; el checkpoint no ha recibido entrenamiento de recuperación, por lo que no se puede afirmar ninguna capacidad.
- Tool calling y agentes: no soportado ni evaluado.
- Multilingüismo: la destilación se realizó en seis idiomas, pero no hay evidencia de que el modelo pueda generar texto coherente en ninguno de ellos.
- Vision: el pipeline_tag indica image-text-to-text, pero no hay información sobre capacidades de visión reales; probablemente hereda el tag del modelo base, sin confirmación.
- Modo thinking: no disponible.

## Casos de uso

Dado que se trata de un checkpoint de investigación sin entrenamiento de recuperación, los casos de uso son exclusivamente académicos y experimentales:

- Investigacion en destilacion de modelos MoE: permite estudiar cómo la destilación por capas afecta a la reconstrucción de representaciones y qué brecha queda frente al maestro denso.
- Analisis de representaciones multilingues: los manifiestos de destilación (`distillation_manifest.json` y `distillation_summary.json`) permiten examinar la mejora por capa e idioma, útil para entender la transferencia multilingüe.
- Desarrollo de tecnicas de upcycling: sirve como punto de partida para experimentar con entrenamiento de recuperación end-to-end y comparar estrategias.
- Evaluacion de metricas de reconstruccion: se puede usar para validar métricas como el MSE relativo o la pérdida causal-LM como predictores del rendimiento final.
- Pruebas de generacion controlada: aunque la generación es deficiente, puede usarse para estudiar artefactos de destilación y fenómenos de degeneración.
- Comparacion con otros checkpoints intermedios: permite trazar la evolución de la pérdida a lo largo del proceso de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de reconstrucción (MSE relativo y pérdida causal-LM) y una prueba de generación cualitativa, sin datos de tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no se proporcionan datos oficiales. Con 4.036 millones de parámetros totales, en FP16 se necesitarían aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones. Con cuantización a 8 bits o 4 bits, podría caber en GPUs consumer de 8-12 GB, pero no hay confirmación.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 3090, RTX 4090 o similar sería suficiente para inferencia en FP16, pero sin garantías de calidad.
- Opciones de despliegue: al ser un checkpoint de investigación, no se recomienda desplegarlo. En caso de hacerlo, se podría usar transformers con carga en device_map="auto", pero no se ha probado con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-4B-A3B-Multilingual-Distilled-v1 | 4,04B | 2,99B | no disponible | Apache 2.0 | Checkpoint de investigacion, no utilizable |
| sepsy070716/Qwen3.5-4B-A3B-Upcycled (base) | 4,04B | 2,99B | no disponible | Apache 2.0 | Upcycle sin entrenar, peor perdida (10,378) |
| Qwen/Qwen3.5-4B (maestro denso) | 4B (denso) | 4B | no disponible | Apache 2.0 | Modelo completo, perdida ~2,94 |

La comparativa muestra que el checkpoint destilado mejora al upcycle sin entrenar, pero sigue muy lejos del maestro denso. No hay otros modelos comparables en la misma categoría de destilación por capas con estos datos.

## Limitaciones y advertencias

- No es apto para chat, completado, benchmarks ni producción: la generación produce tokens de espacio en blanco, lo que lo inutiliza para cualquier tarea real.
- Falta entrenamiento de recuperación end-to-end: la destilación local no garantiza mejoras en tareas downstream; la brecha con el maestro denso es enorme (pérdida 9,162 vs 2,94).
- Sesgos y alucinaciones: no evaluados; al no generar texto coherente, no se pueden caracterizar.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto; los idiomas de destilación son seis, pero no hay evidencia de generación correcta en ninguno.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es funcional, por lo que cualquier uso comercial sería inviable.
- Riesgo de confusión: al tener un nombre similar a modelos Qwen3.5 oficiales, podría confundirse con un modelo de producción; es importante verificar el origen y el estado experimental.

## Enlaces

- HuggingFace: https://huggingface.co/sepsy070716/Qwen3.5-4B-A3B-Multilingual-Distilled-v1
- Modelo base (upcycled): https://huggingface.co/sepsy070716/Qwen3.5-4B-A3B-Upcycled
- Maestro denso: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Paper tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
