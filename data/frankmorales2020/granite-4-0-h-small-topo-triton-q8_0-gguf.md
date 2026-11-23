# frankmorales2020/granite-4.0-h-small-topo-triton-Q8_0-GGUF

## Resumen

Este repositorio contiene una build en formato GGUF con cuantización Q8_0 de un ajuste fino (fine-tune) del modelo `ibm-granite/granite-4.0-h-small` de IBM. El modelo base es un transformer híbrido de 32B parámetros que combina capas Mamba-2 con capas de atención tradicional y una arquitectura de mezcla de expertos (MoE). El fine-tune ha sido realizado por el usuario `frankmorales2020` sobre el dataset `yahma/alpaca-cleaned` empleando el optimizador `TopoAdamW` y una técnica de auditoría de anclaje de embeddings denominada "prime embedding anchor auditing".

La relevancia de esta ficha radica en que empaqueta un modelo de gran tamaño en un formato consumible por `llama.cpp` con cuantización de 8 bits, lo que facilita su despliegue en entornos de inferencia locales. Sin embargo, se trata de un artefacto con cero descargas y cero interacciones, publicado sin documentación de evaluación, sin benchmarks y sin model card detallada más allá de una nota técnica mínima. La información disponible sobre el proceso de entrenamiento, los datos exactos y el rendimiento es muy limitada.

El modelo hereda la licencia Apache 2.0 del modelo base de IBM, lo que permite uso comercial, pero la ausencia de datos de evaluación hace recomendable tratar esta build como experimental y no como un artefacto listo para producción sin validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba-2 y MoE (según tags del repositorio) |
| Parametros totales | 32B (según la model card del autor, referido al modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.0-h-small` es, según la información del autor, un modelo híbrido de 32B parámetros que combina capas Mamba-2 (modelo de espacio de estados) con capas de atención transformer y una capa de mezcla de expertos. La model card menciona la verificación del parámetro `granitehybrid.attention.head_count_kv` para las capas de atención en los índices `[5, 15, 25, 35]`, lo que sugiere una arquitectura con atención intercalada en posiciones específicas del stack de capas.

El fine-tune se ha realizado sobre el dataset `yahma/alpaca-cleaned` empleando el optimizador `TopoAdamW` y una técnica de "prime embedding anchor auditing". No se especifica el número de tokens de entrenamiento, la composición exacta del dataset más allá del nombre, ni si hubo fases de RLHF o DPO. Tampoco se detalla el proceso de conversión a GGUF ni la herramienta empleada para la cuantización Q8_0.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Granite 4.0 de IBM.
- Capacidad de mezcla de expertos (MoE) para enrutar tokens a subconjuntos de parámetros, lo que en teoría reduce el coste computacional por token en inferencia.
- Procesamiento de contexto largo, aunque la longitud exacta no está documentada en este repositorio.
- Ejecución en `llama.cpp` gracias al formato GGUF, lo que permite inferencia en CPU y GPU con soporte para cuantización de 8 bits.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: al estar en formato GGUF Q8_0, el modelo puede cargarse con `llama.cpp` u Ollama en máquinas con suficiente memoria, permitiendo experimentación sin depender de APIs externas.
- Evaluación de fine-tunes sobre Alpaca: útil para investigadores que quieran comparar el efecto de `TopoAdamW` frente a optimizadores estándar en un modelo híbrido Mamba-2/MoE.
- Prototipado de asistentes conversacionales: el modelo base está orientado a instrucciones, por lo que puede emplearse para generar respuestas en tareas de chat, siempre que se valide la calidad del fine-tune.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales, sujeto a validación de calidad.
- Investigación sobre arquitecturas híbridas SSM-transformer: el repositorio sirve como artefacto reproducible para estudiar el comportamiento de capas Mamba-2 intercaladas con atención.
- Generación de código y texto técnico: el modelo base Granite 4.0 está orientado a tareas de código, aunque no hay evidencia en este repositorio de que el fine-tune sobre Alpaca preserve esas capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 32B parámetros en Q8_0 requiere aproximadamente 32 GB de pesos, más overhead de contexto y KV cache, por lo que se necesitan del orden de 36-40 GB de memoria para una ventana de contexto moderada.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU con 2x RTX 4090 (24 GB cada una) para repartir los pesos.
- Cabe en consumer GPU: no en una sola RTX 4090; sí en configuraciones multi-GPU o en GPU de 48 GB como la RTX 6000 Ada.
- Opciones de despliegue: `llama.cpp`, Ollama, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de arquitectura híbrida, por lo que su uso requeriría los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-h-small-topo-triton-Q8_0-GGUF (este) | 32B | no disponible | Apache 2.0 | GGUF Q8_0 | Hugging Face, 0 descargas |
| ibm-granite/granite-4.0-h-small (base) | 32B | no disponible | Apache 2.0 | safetensors | Hugging Face, modelo oficial de IBM |
| Fine-tunes comunitarios de Granite 4.0 | 32B | no disponible | Apache 2.0 | GGUF / safetensors | Variable según autor |

La comparativa se limita al modelo base oficial, ya que no se dispone de datos de benchmarks ni de otros fine-tunes comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el fine-tune mejore o preserve las capacidades del modelo base; podría degradarlas.
- Dataset de entrenamiento limitado: `yahma/alpaca-cleaned` es un dataset pequeño y genérico, insuficiente para ajustes de alta calidad en dominios especializados.
- Cero descargas y cero likes: el artefacto no ha sido validado por la comunidad, lo que incrementa el riesgo de defectos en la conversión o en los metadatos.
- Model card mínima: no se documentan hiperparámetros, número de épocas, ni proceso de evaluación.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, agravado por la falta de evaluación del fine-tune.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado.
- La arquitectura híbrida Mamba-2/MoE puede no estar completamente soportada por todas las versiones de `llama.cpp`, lo que podría provocar errores de carga o resultados incorrectos.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de validación hace desaconsejable su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/granite-4.0-h-small-topo-triton-Q8_0-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-small
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
