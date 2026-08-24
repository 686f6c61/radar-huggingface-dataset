# dudeman2512/Qwen3.8-2.4T-A95B-NVFP4

## Resumen

El modelo `dudeman2512/Qwen3.8-2.4T-A95B-NVFP4` es una cuantización en formato NVFP4 (4-bit float) del modelo Qwen3.8-2.4T-A95B, desarrollado por Qwen (Alibaba) y cuantizado por el usuario dudeman2512 mediante la librería `compressed-tensors`. Esta variante reduce el tamaño de los pesos a aproximadamente un 28% del original en BF16, manteniendo un error relativo medio de 0.0952 frente a los pesos originales. El modelo base es un MoE híbrido de 2,4 billones de parámetros totales con unos 95 mil millones activos por token, que combina atención lineal (gated delta-net) con atención GQA y un contexto de hasta 262.144 tokens (según vLLM Recipes; QwenCloud indica 1M). Esta cuantización está pensada para despliegue con vLLM y es compatible con el ecosistema de Hugging Face Transformers.

La relevancia de esta ficha radica en que permite evaluar rápidamente si esta versión cuantizada es adecuada para entornos de producción donde el almacenamiento y la memoria son críticos, a costa de una pequeña degradación en la precisión. Al ser una cuantización oficialmente publicada con métricas de error medidas, ofrece transparencia sobre el trade-off entre tamaño y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido: gated delta-net (GDN) + GQA, 92 capas, 512 expertos enrutados (10 activos + 1 compartido) |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | ~95 mil millones (95B) |
| Longitud de contexto | 262.144 tokens (según vLLM Recipes; QwenCloud indica 1M) |
| Tipos de cuantizacion | NVFP4 (4-bit float, group size 16, escala de grupo FP8 y escala global per-tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (328 shards, 1382.45 GB en disco) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura híbrida que intercala capas de atención lineal (gated delta-net, GDN) con capas de atención completa GQA, sobre un total de 92 capas. La parte MoE consta de 512 expertos enrutados, de los cuales se activan 10 por token, más un experto compartido. Esta combinación permite manejar contextos muy largos (262K o 1M según la fuente) con un coste computacional sublineal gracias a la atención lineal. La cuantización NVFP4 se realizó con `compressed-tensors`, procesando el checkpoint tensor a tensor sin instanciar el modelo completo, y verificando la conformidad de forma y dtype de cada tensor. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-2.4T-A95B.
- Soporte de contexto largo (hasta 262K tokens según vLLM Recipes), adecuado para tareas que requieren procesar documentos extensos.
- Capacidades multilingües: no se han publicado detalles específicos sobre los idiomas soportados.
- Tool calling y function calling: no se ha confirmado explícitamente en la documentación disponible, aunque es probable que el modelo base las soporte.
- Modo agente y razonamiento multi-paso: no se ha documentado específicamente para esta cuantización.
- Capacidades especiales (visión, audio, etc.): no se han indicado; el modelo es exclusivamente de texto.

## Casos de uso

- Procesamiento de documentos legales y técnicos extensos: gracias a su ventana de contexto de 262K tokens, puede analizar contratos, informes o patentes completas sin truncar, extrayendo cláusulas o resumiendo secciones.
- Generación y revisión de código en repositorios grandes: el modelo puede trabajar con archivos de código fuente de gran tamaño y mantener coherencia a lo largo de múltiples funciones o módulos.
- Asistentes conversacionales con memoria prolongada: la capacidad de contexto largo permite mantener conversaciones de muchas vueltas sin perder el hilo, útil para atención al cliente o tutorías técnicas.
- Análisis de series de datos textuales: por ejemplo, procesar logs de sistemas o transcripciones de reuniones largas para extraer patrones o resumir eventos.
- Razonamiento complejo en dominios científicos o matemáticos: el tamaño del modelo y su arquitectura MoE permiten abordar problemas que requieren múltiples pasos de deducción.
- Despliegue en entornos con restricciones de almacenamiento: al ser una cuantización NVFP4, reduce el espacio en disco a 1,38 TB frente a los 4,9 TB del BF16, facilitando su uso en clústeres con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona métricas de error de cuantización (mean relative error 0.0952 frente a BF16), pero no incluye resultados de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 1382.45 GB en disco, por lo que se necesitan al menos 18 GPUs de 80 GB (por ejemplo, H100 o A100) solo para los pesos, sin contar la memoria para activaciones y KV cache. En la práctica, se recomienda un clúster con 20 o más GPUs de alta gama.
- GPU recomendadas: NVIDIA H100, A100 80GB, o GPUs con soporte para NVFP4 (arquitecturas Hopper o posteriores). No es viable en GPUs de consumo (RTX 4090, etc.) por el tamaño.
- Opciones de despliegue: vLLM es el soporte principal (comando `vllm serve dudeman2512/Qwen3.8-2.4T-A95B-NVFP4`). También es compatible con Transformers y con el stack de Dynamo (ai-dynamo) según las recetas publicadas.
- Latencia y throughput: no se han proporcionado datos específicos. Dado el tamaño y la cuantización, se espera un throughput moderado en comparación con modelos más pequeños, pero optimizado para contexto largo.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de cuantización del mismo modelo base, según los datos de la model card:

| Variante | Formato | Tamaño en disco | vs BF16 | Error relativo medio |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B-FP8 | FP8 | 2453.05 GB | 50% | 0.0264 |
| Qwen3.8-2.4T-A95B-NVFP4 (esta) | NVFP4 | 1382.45 GB | 28% | 0.0952 |
| Qwen3.8-2.4T-A95B-int4 | int4 | 1268.00 GB | 26% | 0.1118 |

No se dispone de comparativas con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Mixtral) en la información proporcionada.

## Limitaciones y advertencias

- Error de cuantización: el error relativo medio de 0.0952 frente a los pesos BF16 puede degradar la calidad en tareas que requieren alta precisión numérica, como matemáticas avanzadas o razonamiento lógico estricto.
- Tamaño y requisitos de hardware: el modelo necesita un clúster de GPUs de alta gama, lo que limita su uso a entornos con infraestructura dedicada.
- Idiomas soportados: no se ha documentado la cobertura multilingüe, por lo que no se puede garantizar un rendimiento uniforme en todos los idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-2.4T-A95B por si hubiera restricciones adicionales.
- Alucinaciones y sesgos: al ser un modelo de gran tamaño, puede generar contenido plausible pero incorrecto; no se han publicado evaluaciones específicas de sesgos para esta cuantización.
- Compatibilidad: aunque es compatible con vLLM y Transformers, es necesario verificar que la versión de la librería soporte el formato NVFP4 (se requiere una versión reciente de `compressed-tensors` y vLLM).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dudeman2512/Qwen3.8-2.4T-A95B-NVFP4
- Modelo base Qwen3.8-2.4T-A95B: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Recetas de Dynamo para el modelo base: https://github.com/ai-dynamo/dynamo/tree/main/recipes/qwen3.8-2.4t-a95b
- Página de QwenCloud del modelo: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
