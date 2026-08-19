# dsikka/Qwen3.8-27B-NVFP4-FP8-GPTQ-AWQ

## Resumen

El checkpoint `dsikka/Qwen3.8-27B-NVFP4-FP8-GPTQ-AWQ` es una cuantización mixta del modelo multimodal denso Qwen3.8-27B, desarrollado por el equipo de Alibaba Qwen. Este checkpoint combina cuantización NVFP4 (4 bits para MLP), FP8 (8 bits para atención y KV cache), junto con GPTQ y AWQ, con el objetivo de reducir el uso de memoria y acelerar la inferencia en hardware moderno de NVIDIA, especialmente en GPUs Blackwell como la DGX Spark. Según los benchmarks publicados en la model card, esta versión supera ligeramente a las cuantizaciones de referencia de Inferact y Unsloth en varias tareas de razonamiento y matemáticas.

El modelo base Qwen3.8-27B es un transformer denso con encoder de visión integrado, lo que lo convierte en un modelo multimodal capaz de procesar texto e imágenes. Con una ventana de contexto de 262 000 tokens (según fuentes web), está diseñado para tareas de agente, generación de código y automatización de oficina. Esta cuantización específica, creada por `dsikka`, está optimizada para su uso con vLLM y el ecosistema `compressed-tensors`, y no presenta una licencia explícita en la ficha de HuggingFace, aunque el modelo base se distribuye bajo Apache 2.0.

La relevancia de este checkpoint radica en su equilibrio entre calidad de salida y eficiencia de hardware: al combinar varias técnicas de cuantización, logra un rendimiento competitivo con un footprint de memoria reducido, lo que lo hace atractivo para despliegues en entornos con GPUs de gama media o alta sin sacrificar precisión en tareas exigentes como matemáticas o razonamiento multi-step.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) con encoder de vision |
| Parametros totales | 19 869 895 952 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun fuentes web del modelo base) |
| Tipos de cuantizacion | NVFP4 (MLP), FP8 (atencion y KV cache), GPTQ, AWQ |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se detallan) |
| Licencia | No disponible para este checkpoint; el modelo base es Apache 2.0 segun fuentes web |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parametros (aunque el checkpoint cuantizado reporta 19 869 895 952 parametros en safetensors, posiblemente debido a la eliminacion de componentes no esenciales o a la representacion comprimida). Incluye un encoder de vision que le permite procesar imagenes junto con texto, lo que lo convierte en un modelo multimodal nativo. La arquitectura sigue el diseño de los modelos Qwen recientes, con atencion de factorizacion y mecanismos de ventana deslizante para manejar contextos largos de hasta 262 000 tokens.

El entrenamiento del modelo base utilizo un enfoque de preentrenamiento a gran escala seguido de ajuste fino supervisado y optimizacion con preferencias humanas (RLHF/DPO), aunque los detalles especificos del dataset y el numero de tokens no se han proporcionado en la informacion disponible. Este checkpoint de cuantizacion, por su parte, no modifica los pesos del modelo base, sino que los comprime mediante tecnicas de cuantizacion post-entrenamiento (PTQ) implementadas con `llm-compressor` y `compressed-tensors`. La combinacion de NVFP4 para las capas MLP y FP8 para atencion y KV cache busca minimizar la perdida de calidad mientras se reduce el uso de memoria y se acelera la inferencia en GPUs con soporte nativo para estos formatos.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con resultados destacados en tareas como GPQA Diamond, AIME 2025 y GSM8K Platinum.
- Razonamiento matematico avanzado, superando a otras cuantizaciones en benchmarks como MATH-500 y MMLU-Pro.
- Capacidades multimodales: al heredar el encoder de vision del modelo base, puede procesar imagenes junto con texto (aunque no se han verificado en este checkpoint especifico).
- Soporte para tool calling y flujos de agente, gracias a la arquitectura del modelo base orientada a agentes y automatizacion.
- Comprension de instrucciones complejas y seguimiento de formatos, con una puntuacion de 91.50 en IFEval (prompt-level strict accuracy).
- Compatibilidad con vLLM y el ecosistema `compressed-tensors`, lo que facilita su integracion en pipelines de inferencia optimizados.

## Casos de uso

- Automatizacion de oficina y generacion de documentos: el modelo puede redactar informes, resumir actas y generar presentaciones a partir de instrucciones textuales, aprovechando su ventana de contexto de 262 000 tokens para manejar documentos extensos.
- Agentes conversacionales con memoria larga: gracias al contexto extendido, puede mantener conversaciones multi-turno con historial amplio, ideal para asistentes virtuales en soporte tecnico o atencion al cliente.
- Generacion de codigo en produccion: con soporte para tool calling y razonamiento logico, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o revisar codigo, reduciendo la carga de los desarrolladores.
- Razonamiento matematico y cientifico: su alto rendimiento en GSM8K y MATH-500 lo hace util para tutoria automatica, resolucion de problemas de fisica o ingenieria, y generacion de soluciones paso a paso.
- Analisis de imagenes y texto combinados: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o graficos y combinarla con texto para tareas como extraccion de datos de facturas o comprension de figuras en articulos cientificos.
- Despliegue en hardware local con recursos limitados: al estar cuantizado en NVFP4/FP8, cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) y puede servirse con vLLM, lo que permite ejecutar un modelo de alto rendimiento sin necesidad de un cluster.

## Benchmarks y rendimiento

La model card publica los siguientes resultados comparativos entre este checkpoint y las cuantizaciones de referencia de Inferact y Unsloth para el mismo modelo base:

| Benchmark (metric)                         | Inferact |   Unsloth |      This checkpoint|
| ------------------------------------------ | -------: | --------: | --------: |
| gpqa_diamond (gpqa_pass@k:k=1)             |    88.05 |     88.05 | **89.39** |
| aime25 (pass@k:k=1&n=1)                    |    90.00 |     93.75 | **97.08** |
| gsm8k_platinum (exact_match,strict-match)  |    92.69 |     95.51 | **96.66** |
| mmlu_pro_chat (exact_match,custom-extract) |    82.77 |     83.88 | **83.95** |
| ifeval (prompt_level_strict_acc)           |    91.37 | **91.74** |     91.50 |
| math_500 (pass@k:k=1&n=1)                  |    83.13 | **85.33** |     84.07 |

Este checkpoint supera a ambas alternativas en GPQA Diamond, AIME 2025, GSM8K Platinum y MMLU-Pro, mientras que queda ligeramente por detras de Unsloth en IFEval y MATH-500. No se han publicado resultados adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22.6 GB en disco; en inferencia, la cuantizacion NVFP4/FP8 reduce el uso de memoria a aproximadamente 14-16 GB para los pesos, mas overhead de KV cache y activaciones. Con contexto largo, se recomienda al menos 24 GB de VRAM.
- GPUs compatibles: requiere hardware con soporte para NVFP4 (arquitectura Blackwell, por ejemplo, DGX Spark, B200) o FP8 (Ada Lovelace, Hopper). En GPUs sin soporte nativo, la cuantizacion puede degradarse o requerir conversion.
- En consumer GPUs: una RTX 4090 (24 GB) puede ejecutar el modelo con cuantizacion FP8, aunque el rendimiento de NVFP4 solo se aprovecha en Blackwell.
- Opciones de despliegue: vLLM es el runtime recomendado (el checkpoint incluye tags de `compressed-tensors` y `vllm`). Tambien puede usarse con SGLang o llama.cpp si se convierte a GGUF, aunque no se proporciona esa variante.
- Rendimiento: segun benchmarks de la comunidad, la cuantizacion NVFP4 de Unsloth (similar a esta) ofrece un 30-34 % mas de throughput de generacion que la FP8 pura en DGX Spark. Este checkpoint no publica metricas propias de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (AIME25) |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, FP8 oficial) | 27B | 262k | Apache 2.0 | FP8 | 90.00 |
| Unsloth/Qwen3.8-27B-NVFP4 | 27B | 262k | Apache 2.0 | NVFP4 | 93.75 |
| dsikka/Qwen3.8-27B-NVFP4-FP8-GPTQ-AWQ (este) | 19.9B (cuantizado) | 262k | No disponible | NVFP4+FP8+GPTQ+AWQ | 97.08 |

La comparativa se basa en los datos publicados en la model card y en las fuentes web. Este checkpoint ofrece la mejor puntuacion en AIME25 entre las tres variantes, aunque su licencia no esta especificada, lo que puede limitar su uso comercial si se requiere claridad legal.

## Limitaciones y advertencias

- La licencia no esta indicada en la ficha de HuggingFace; aunque el modelo base es Apache 2.0, este checkpoint podria tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- La cuantizacion mixta NVFP4/FP8 puede introducir una ligera degradacion en tareas de generacion creativa o razonamiento sutil, aunque los benchmarks muestran resultados superiores en matematicas.
- El modelo puede alucinar en contextos poco comunes o cuando se le pide informacion factual no presente en sus datos de entrenamiento.
- La ventana de contexto de 262 000 tokens es teorica; en la practica, el uso prolongado puede agotar la memoria de la GPU, especialmente con cuantizaciones mixtas.
- No se han publicado detalles sobre sesgos o limitaciones idiomaticas especificas de este checkpoint; se heredan las del modelo base, que pueden incluir sesgos culturales o de genero.
- Para produccion, es necesario validar el comportamiento con datos propios, ya que los benchmarks publicados cubren solo un subconjunto de tareas.

## Enlaces

- HuggingFace: https://huggingface.co/dsikka/Qwen3.8-27B-NVFP4-FP8-GPTQ-AWQ
- Foro NVIDIA (benchmarks NVFP4 vs FP8): https://forums.developer.nvidia.com/t/qwen3-8-27b-on-dgx-spark-using-vllm-nvfp4-vs-fp8-performance/380258
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Articulo sobre requisitos de hardware: https://gingerlabs.ai/blog/qwen-38-27b-hardware-requirements-and-how-to-deploy-locally
- Analisis de specs y benchmarks: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Verdict y comparativa: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
