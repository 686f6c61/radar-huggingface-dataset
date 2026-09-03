# AdarshSingh7647/Eklav-7B-Reranker-CotGen

## Resumen

Eklav-7B-Reranker-CotGen es un modelo de lenguaje de 7.615 millones de parámetros desarrollado por AdarshSingh7647 como parte del proyecto Eklav, que investiga la destilación de razonamiento (chain-of-thought) para tareas de reranking de pasajes. Este modelo concreto es el baseline de destilación CoT estándar de traza completa, sobre el que se mide la mejora del método Eklav, que entrena al estudiante para continuar el razonamiento del profesor a partir de una traza parcial en lugar de imitarla de extremo a extremo.

El modelo parte de Qwen/Qwen2.5-7B y se ha ajustado mediante fine-tuning supervisado (SFT) con datos de razonamiento para la tarea de reranking de pasajes, evaluado en los benchmarks BRIGHT y NevIR. Está disponible como checkpoint fusionado en formato bf16 y safetensors, con una arquitectura transformer estándar de 7B parámetros y una ventana de contexto heredada del modelo base (128K tokens). Su relevancia radica en servir como referencia controlada para comparar metodologías de destilación de razonamiento en sistemas de recuperación aumentada (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B base) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Qwen2.5-7B) |
| Tipos de cuantizacion | no disponible (checkpoint bf16 original) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-7B, principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen2.5-7B, un transformer decoder-only con atención de ventana deslizante y atención completa alternadas (estilo Qwen2.5). El entrenamiento utiliza destilación de cadena de pensamiento (CoT distillation) con traza completa: el estudiante ve el razonamiento completo del profesor (con la respuesta final oculta) y se entrena para continuar razonando y producir la respuesta por sí mismo. A diferencia del método Eklav propuesto, aquí la traza del profesor se presenta completa durante el entrenamiento, lo que constituye el baseline estándar de SFT con CoT.

Los datos de entrenamiento no están especificados en detalle, pero se sabe que son los mismos que se usan para el método Eklav, orientados a tareas de reranking de pasajes (BRIGHT, NevIR). No se menciona el uso de RLHF ni DPO. El checkpoint se publica fusionado (merged) en bf16, listo para inferencia con transformers.

## Capacidades

- Generación de texto condicionada a instrucciones de reranking, produciendo puntuaciones o razonamientos sobre la relevancia de pasajes.
- Razonamiento de cadena de pensamiento (CoT) para justificar decisiones de relevancia entre consulta y pasaje.
- Reranking de pasajes en pipelines de recuperación (RAG), evaluado en BRIGHT y NevIR.
- Capacidades multilingües heredadas de Qwen2.5-7B (principalmente inglés y chino, aunque no se documentan explícitamente).
- Soporte de tool calling y function calling no documentado; se asume que no está habilitado específicamente.
- No se documenta soporte para agentes ni multi-step reasoning más allá del CoT generado.

## Casos de uso

- Reranking en sistemas RAG: el modelo puede reordenar los resultados de un recuperador denso o BM25, asignando puntuaciones de relevancia más precisas que el recuperador inicial. Su capacidad de razonamiento CoT permite explicar por qué un pasaje es relevante, útil para depuración.
- Evaluación de pipelines de recuperación: al ser un baseline de destilación CoT, sirve para comparar metodologías de entrenamiento (Eklav vs. traza completa) en entornos de investigación.
- Generación de justificaciones de relevancia: puede producir texto explicando la relación entre consulta y pasaje, útil para sistemas de respuesta con fuentes citadas.
- Filtrado de pasajes en dominios específicos: evaluado en BRIGHT, que cubre dominios como finanzas, legal, biomedicina, etc., puede adaptarse a tareas verticales de reranking.
- Investigación en destilación de razonamiento: como baseline, permite estudiar cómo la longitud y completitud de las trazas CoT afectan al rendimiento en tareas de reranking.
- Prototipado de sistemas de búsqueda semántica: con su ventana de 128K tokens, puede procesar consultas y pasajes largos en un solo paso, aunque el uso típico de reranking emplea pasajes cortos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT (promedio) | nDCG@10 | 26,1 |

No se han publicado resultados en NevIR ni comparaciones con otros modelos en la informacion disponible. El valor de BRIGHT corresponde a una única ejecución de evaluación por dominio, según la model card. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 15,2 GB (tamaño del repo), por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo completo en precisión nativa.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), RTX 3090 (24 GB) o superiores. En GPUs con 16 GB (RTX 4080, A10G) podría caber con cuantización, aunque no se proporcionan versiones cuantizadas.
- En consumer GPU: cabe en RTX 4090 y RTX 3090 con 24 GB sin cuantizar; en GPUs de 16 GB se requeriría cuantización a 8 bits o 4 bits (no disponible oficialmente).
- Opciones de despliegue: compatible con transformers (pipeline text-generation), text-generation-inference (TGI) y endpoints compatibles según los tags. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Reranking (BRIGHT nDCG@10) | Disponibilidad |
|---|---|---|---|---|---|
| Eklav-7B-Reranker-CotGen | 7,6B | 128K | no disponible | 26,1 | HuggingFace |
| Qwen2.5-7B (base) | 7,6B | 128K | Apache 2.0 | no evaluado | HuggingFace |
| bge-reranker-v2-m3 | 568M | 8K | MIT | no disponible | HuggingFace |

No se dispone de comparativas directas con otros rerankers de tamaño similar en la informacion proporcionada. Los modelos de reranking especializados (como bge-reranker) suelen ser mucho más pequeños y no generan texto, mientras que Eklav es un LLM generativo adaptado a la tarea.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer restricciones de uso comercial. Se recomienda contactar al autor antes de usar en producción.
- Sesgos y alucinaciones: al ser un modelo generativo, puede producir razonamientos plausibles pero incorrectos sobre la relevancia de pasajes, especialmente en dominios fuera de los datos de entrenamiento.
- Rendimiento limitado como reranker: con un BRIGHT nDCG@10 de 26,1, su rendimiento es modesto comparado con rerankers especializados (que suelen superar 40 en este benchmark). No es adecuado como reranker de producción sin fine-tuning adicional.
- Idiomas no documentados: aunque hereda las capacidades de Qwen2.5-7B, no se especifican los idiomas soportados tras el fine-tuning, lo que introduce incertidumbre para uso multilingüe.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con restricciones de VRAM.
- Datos de entrenamiento no detallados: no se especifica la composición del dataset de CoT, lo que dificulta evaluar posibles sesgos de dominio.
- Modelo experimental: es un baseline de investigación, no un producto estable. Puede contener artefactos de entrenamiento no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdarshSingh7647/Eklav-7B-Reranker-CotGen
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio de rerankers (contexto de la tarea): https://github.com/AnswerDotAI/rerankers
- Artículo sobre rerankers para RAG: https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/
