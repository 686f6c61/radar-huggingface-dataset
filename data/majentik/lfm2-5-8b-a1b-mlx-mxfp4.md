# majentik/LFM2.5-8B-A1B-MLX-MXFP4

## Resumen

LFM2.5-8B-A1B-MLX-MXFP4 es una variante cuantizada en formato MXFP4 (4-bit, group size 32) del modelo LFM2.5-8B-A1B de Liquid AI, adaptada para ejecutarse en silicio de Apple mediante la librería mlx-lm. El modelo original es un mixture-of-experts (MoE) con 8 mil millones de parámetros totales pero solo 1.5 mil millones activos por paso de inferencia, lo que lo hace especialmente adecuado para despliegue en dispositivos con recursos limitados.

La cuantización MXFP4 reduce el tamaño del modelo a aproximadamente 4.5 GB, permitiendo su ejecución en equipos Apple con memoria unificada moderada. El modelo mantiene una ventana de contexto de 128K tokens y conserva las capacidades de tool calling y razonamiento encadenado del modelo original. Esta versión cuantizada es relevante porque democratiza el acceso a un modelo MoE de última generación en hardware de consumo, sin necesidad de GPUs dedicadas de alta gama.

El autor de esta variante cuantizada es majentik, que ha publicado un conjunto de cuantizaciones adicionales (2-bit a 8-bit) del mismo modelo base. La licencia es LFM Open License v1.0, que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer |
| Parametros totales | 8B (1.588.030.912 en safetensors cuantizados) |
| Parametros activos | 1.5B |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | MXFP4 (4-bit, group size 32) |
| Idiomas soportados | 9 idiomas (segun modelo base) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B es un transformer con arquitectura MoE desarrollado por Liquid AI. Con 8B parámetros totales y solo 1.5B activos por forward pass, sigue el paradigma de eficiencia computacional de los modelos MoE modernos: cada token activa únicamente un subconjunto de los expertos disponibles, reduciendo el coste computacional por inferencia sin sacrificar capacidad total del modelo.

La variante MLX-MXFP4 se obtiene mediante cuantización post-entrenamiento con la herramienta mlx_lm.convert (versión 0.31.3), aplicando formato MXFP4 con group size 32. Este formato de cuantización está optimizado para hardware Apple Silicon y aprovecha las instrucciones de aceleración de la arquitectura. El modelo original incorpora capacidades de chain-of-thought reasoning y tool calling, que se preservan en la versión cuantizada. Los detalles específicos del dataset de entrenamiento y el proceso de alineación del modelo original no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional con soporte multi-turno.
- Razonamiento encadenado (chain-of-thought) integrado.
- Tool calling y function calling para integración con APIs y servicios externos.
- Ventana de contexto de 128K tokens para documentos largos y conversaciones extensas.
- Soporte multilingüe en 9 idiomas (según modelo base).
- Ejecución eficiente en Apple Silicon gracias a la cuantización MXFP4 y la librería MLX.
- Adecuado para despliegue en dispositivos edge y equipos de consumo.

## Casos de uso

- Asistentes conversacionales en dispositivos Apple: el modelo puede ejecutarse localmente en Macs con Apple Silicon, ofreciendo respuestas de baja latencia sin conexión a internet, gracias a su tamaño reducido de 4.5 GB y sus 1.5B parámetros activos.
- Automatización de atención al cliente: con 128K de contexto y tool calling, puede gestionar conversaciones largas con clientes, consultar bases de conocimiento externas y escalar casos complejos a agentes humanos.
- Procesamiento de documentos extensos: la ventana de 128K tokens permite analizar informes, contratos o artículos científicos completos en una sola pasada, extrayendo información relevante o generando resúmenes.
- Generación de código asistida: el soporte de tool calling permite integrar el modelo en entornos de desarrollo para autocompletar código, explicar fragmentos o generar tests, ejecutándose localmente en equipos de desarrollo.
- Aplicaciones de productividad offline: procesamiento de correos electrónicos, generación de borradores, resúmenes de reuniones y otras tareas de oficina sin depender de servicios cloud.
- Prototipado rápido de agentes IA: la combinación de razonamiento encadenado y tool calling permite construir agentes autónomos que planifican y ejecutan tareas multi-paso, ideal para investigación y desarrollo en entornos académicos o empresariales.

## Benchmarks y rendimiento

La model card de esta variante cuantizada reporta los siguientes resultados de evaluación:

| Benchmark | Score |
|---|---|
| arc_easy_acc | 0.4700 |
| hellaswag_acc | 0.4450 |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con el modelo original o con otras cuantizaciones. Los datos del modelo base LFM2.5-8B-A1B en benchmarks estándar como MMLU, HumanEval o GSM8K no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4.5 GB para el modelo cuantizado MXFP4, más overhead de contexto y activaciones.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. Modelos con 16 GB o más permiten contextos largos sin problemas.
- Compatibilidad con consumer GPU: no aplicable directamente, ya que el formato MLX está diseñado exclusivamente para Apple Silicon. Para GPUs NVIDIA se necesitaría una conversión a otro formato (GGUF, GPTQ, etc.).
- Opciones de despliegue: mlx-lm para generación local, integrable en aplicaciones Python. También puede usarse con frameworks que soporten MLX.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo MoE con solo 1.5B parámetros activos, se espera una latencia significativamente menor que un modelo denso de 8B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B (original) | 8B | 1.5B | 128K | lfm1.0 | safetensors |
| LFM2.5-8B-A1B-MLX-MXFP4 (este) | 8B | 1.5B | 128K | lfm1.0 | MLX safetensors |
| Qwen2.5-14B-A14B (MoE) | 14B | 14B | 128K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite (MoE) | 16B | 2.4B | 32K | MIT | safetensors, GGUF |

La comparativa se basa en modelos MoE de tamaño similar orientados a despliegue eficiente. LFM2.5-8B-A1B destaca por su bajo número de parámetros activos (1.5B) y su ventana de contexto de 128K. La variante MLX-MXFP4 es la única de las comparadas disponible en formato MLX para Apple Silicon.

## Limitaciones y advertencias

- La cuantización MXFP4 puede degradar ligeramente la calidad de las respuestas respecto al modelo original en tareas complejas de razonamiento o generación de código.
- Los benchmarks reportados (arc_easy_acc 0.47, hellaswag_acc 0.445) son notablemente inferiores a los de modelos densos de tamaño similar, lo que sugiere que la cuantización 4-bit afecta al rendimiento en tareas de razonamiento.
- La licencia lfm1.0 permite uso comercial con atribución, pero es necesario revisar los términos completos de la licencia en el repositorio original.
- El modelo está limitado a hardware Apple Silicon; no puede ejecutarse directamente en GPUs NVIDIA o AMD sin conversión previa a otro formato.
- No se dispone de información sobre sesgos específicos del modelo o riesgos de alucinación en la documentación proporcionada.
- El modelo base soporta 9 idiomas, pero no se especifica cuáles son ni el nivel de competencia en cada uno.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-MXFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de Liquid AI sobre LFM2.5-8B-A1B: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/b9aebfcbe28b6cb374042f495d733037550ab146/LICENSE
- Otras cuantizaciones MLX del mismo autor: https://huggingface.co/majentik/LFM2.5-8B-A1B-MLX-8bit
