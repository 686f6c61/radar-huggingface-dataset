# nynefold/pplx-embed-v2-late-9b-ONNX

## Resumen

pplx-embed-v2-late-9b-ONNX es una versión cuantizada a 4 y 8 bits en formato ONNX del modelo de embeddings `perplexity-ai/pplx-embed-v2-late-9b`, desarrollado originalmente por Perplexity. Se trata de un recuperador de interacción tardía (late-interaction) de estilo ColBERT: genera un vector L2-normalizado de 128 dimensiones por cada token de entrada y puntúa la relevancia mediante MaxSim entre los vectores de consulta y documento. Esta derivada, publicada por el usuario nynefold, mantiene la licencia MIT del original y su objetivo es hacer viable el despliegue del modelo en ONNX Runtime con requisitos de memoria muy reducidos.

La relevancia de esta ficha radica en su estrategia de despliegue asimétrica: el modelo de 9B se usa únicamente para indexar documentos (una operación offline que se ejecuta una sola vez por documento), mientras que las consultas se codifican con el modelo hermano de 0,6B, que comparte espacio de embeddings y tokenizador. Según las mediciones del autor, esta pareja 0,6B-consulta / 9B-índice alcanza 0,835 nDCG@10 en FreshRet Small, frente a 0,823 de la pareja 0,6B/0,6B y 0,836 del 9B en ambos lados, lo que supone una pérdida de solo 0,03 puntos respecto al 9B completo.

El paquete incluye ocho variantes cuantizadas con sus recetas de construcción y métricas de calidad; la recomendada es `e8-w4-gptq-a4-ps`, que ocupa 5.425 MB frente a los 31.759 MB del FP32 original, con una caída de solo 0,14 puntos de nDCG@10 en FreshRet Small y 0,04 puntos en MIRACL. El repositorio tiene 37,8 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto) con late-interaction ColBERT-style, multi-vector |
| Parametros totales | 9B (modelo base `perplexity-ai/pplx-embed-v2-late-9b`); no se detalla el desglose exacto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens para consultas (`[Q]`), 4.096 tokens para documentos (`[D]`) |
| Tipos de cuantizacion | INT4 (GPTQ, varios mixes) e INT8 (RTN); 8 variantes publicadas |
| Idiomas soportados | Multilingue (etiqueta `multilingual`); lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), con `recipe.json` por variante |

## Arquitectura y entrenamiento

El modelo es una torre de texto transformer que produce, para cada token de entrada, un embedding de 128 dimensiones L2-normalizado. La puntuación de relevancia se calcula con MaxSim: para cada token de la consulta se toma el producto escalar máximo contra cualquier token del documento y se suman esos máximos. Antes de puntuar se descartan los tokens de padding y, en el caso de los documentos, los tokens de puntuación listados en `document_skiplist` dentro de `config.json`. La entrada se prefija con los tokens especiales `[Q]` para consultas y `[D]` para documentos, ambos tokens añadidos al tokenizador.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas) no se recogen en la información disponible. Esta derivada ONNX no reentrena el modelo: aplica cuantización GPTQ en INT4 y RTN en INT8 sobre los pesos, con varias recetas (prefijos `e8`, `mix02`, `mix10`, `mix30` y sufijos `ps`, `a0`, `a4`, `pc`) y evalúa cada variante con un control de calidad en dos etapas. La etapa A exige una similitud coseno media de tokens de al menos 0,99 respecto a FP32; la etapa B mide la caída de nDCG@10 en FreshRet Small y MIRACL con intervalos de confianza bootstrap del 95%. Solo las variantes que superan ambas etapas se marcan como aptas; el resto se publica igualmente con sus mediciones.

## Capacidades

- Generación de embeddings multi-vector de interacción tardía: un vector de 128 dimensiones por token, puntuado con MaxSim.
- Recuperación de documentos (retrieval) monolingüe y multilingüe, con etiqueta `multilingual` en el modelo base.
- Indexación de documentos de hasta 4.096 tokens y codificación de consultas de hasta 1.024 tokens.
- Compatibilidad de espacio de embeddings con `pplx-embed-v2-late-0.6b`: un índice construido con el 9B se puede consultar con el 0.6B.
- Almacenamiento del índice en FP16 o INT8 por vector sin pérdida medible en FreshRet Small (46 MB para 3.000 documentos cortos en INT8).
- Ejecución con ONNX Runtime (>= 1.31) usando solo `onnxruntime`, `tokenizers` y NumPy.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de extracción de características (`feature-extraction`).

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar una vez el corpus con el 9B y servir consultas con el 0.6B, manteniendo la calidad del índice grande con un coste de consulta reducido (0,835 nDCG@10 en FreshRet Small).
- Recuperación en pipelines RAG: usar el par 0,6B/9B como primera etapa de recuperación y, si se necesita más precisión, añadir un reranker; el autor reporta 0,880 nDCG@10 al añadir `zerank-1-small` sobre la pareja.
- Motores de búsqueda internos sobre bases de conocimiento corporativas: el índice ocupa el mismo espacio por token independientemente del modelo que lo construya, y el 9B solo se ejecuta en la fase offline de indexación.
- Sistemas de preguntas y respuestas sobre soporte técnico: el ejemplo de la model card (consultas sobre reinicio de router) ilustra el flujo típico de documentación de producto con documentos cortos.
- Recuperación multilingüe: gracias a la etiqueta `multilingual` del modelo base, adecuado para corpus con varios idiomas, aunque la lista exacta de idiomas no está publicada.
- Despliegue en entornos con memoria limitada: la variante recomendada cabe en 6.518 MB de RAM, lo que permite ejecutar la indexación en máquinas sin GPU de gran capacidad.
- Evaluación y benchmarking de recuperación: las ocho variantes con sus recetas y métricas sirven para estudiar el impacto de distintas estrategias de cuantización en un retriever de interacción tardía.

## Benchmarks y rendimiento

Resultados publicados por el autor (nDCG@10, diferencias pareadas respecto a FP32 con intervalos bootstrap del 95%):

| Variante | Tamano (MB) | RAM (MB) | FreshRet Small vs FP32 | MIRACL vs FP32 | Estado |
|---|---:|---:|---|---|---|
| FP32 (no incluida) | 31.759 | – | referencia | referencia | – |
| `e8-w4-gptq-a0-ps` | 5.425 | 4.879 | no medido | no medido | solo etapa A |
| `e8-w4-gptq-a4-ps` (recomendada) | 5.425 | 6.518 | -0,14 [-0,87, +0,60] | -0,04 [-0,70, +0,68] | recomendada |
| `mix02-gptq-a4-ps` | 5.498 | 6.588 | no medido | no medido | solo etapa A |
| `e8-w4-gptq-a4` | 5.625 | 6.564 | no medido | no medido | solo etapa A |
| `mix10-gptq-a4-ps` | 5.783 | 6.858 | -0,01 [-0,65, +0,67] | -0,14 [-0,72, +0,44] | apta |
| `mix30-gptq-a4-ps` | 6.492 | 7.524 | +0,15 [-0,41, +0,76] | -0,09 [-0,79, +0,65] | apta |
| `e8-w8-rtn-a0-ps` | 8.993 | 8.454 | no medido | no medido | solo etapa A |

Comparativa de configuraciones de recuperación en FreshRet Small (nDCG@10):

| Configuración | nDCG@10 |
|---|---:|
| 0.6B consulta, 0.6B índice | 0,823 |
| 0.6B consulta, 9B índice | 0,835 |
| 9B consulta, 9B índice | 0,836 |
| pplx-embed-v1 + reranker zerank-1-small (top 20) | 0,870 |
| Pareja 0,6B/9B + reranker zerank | 0,880 |
| 0,6B índice + reranker zerank | 0,879 |

## Requisitos de hardware

- La variante recomendada `e8-w4-gptq-a4-ps` ocupa 5.425 MB en disco y requiere 6.518 MB de RAM en ejecución.
- La variante más ligera en RAM es `e8-w4-gptq-a0-ps` (4.879 MB), aunque solo supera la etapa A de calidad.
- La variante INT8 `e8-w8-rtn-a0-ps` ocupa 8.993 MB y requiere 8.454 MB de RAM.
- El FP32 de referencia ocupa 31.759 MB, por lo que la cuantización reduce el tamaño aproximadamente un 83 %.
- Al ser un modelo ONNX, la inferencia se ejecuta con ONNX Runtime (>= 1.31); no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- No se publican latencias ni throughput medidos.
- El autor no especifica GPU recomendadas; la ejecución con solo ONNX Runtime, `tokenizers` y NumPy sugiere que puede correr en CPU, aunque no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v2-late-9b-ONNX (esta ficha) | 9B | 1.024 consulta / 4.096 documento | Late-interaction ONNX cuantizado | MIT | Hugging Face |
| pplx-embed-v2-late-0.6b-ONNX | 0,6B | no disponible | Late-interaction ONNX cuantizado | MIT | Hugging Face |
| pplx-embed-v2-late-9b (original) | 9B | 1.024 / 4.096 | Late-interaction FP32 | MIT | Hugging Face |
| pplx-embed-v1 + zerank-1-small | no disponible | no disponible | Embedder + reranker | no disponible | Hugging Face |

La comparación de calidad entre estas configuraciones está en la tabla de benchmarks: la pareja 0,6B/9B alcanza 0,835 nDCG@10 y la configuración con reranker 0,880, frente a 0,870 del pipeline pplx-embed-v1 con reranker. No se dispone de datos de otros retrievers de interacción tardía de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo derivado: el modelo, su entrenamiento y su licencia pertenecen a Perplexity; esta versión solo aplica cuantización.
- No genera texto ni soporta tool calling, agentes o razonamiento multi-paso; su único uso es la extracción de embeddings.
- La cuantización introduce una degradación medible, aunque pequeña: -0,14 puntos en FreshRet Small y -0,04 en MIRACL para la variante recomendada, con intervalos que incluyen el cero.
- Cuatro de las ocho variantes no superan la etapa B de calidad y solo pasan la etapa A; el autor las publica igualmente, por lo que no deben usarse en producción sin evaluar.
- La ventana de contexto es limitada: 4.096 tokens por documento y 1.024 por consulta.
- No se detalla la lista de idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación de documentos irrelevantes si el índice o el corpus no están bien construidos.
- El repositorio no registra descargas ni valoraciones, lo que limita la evidencia de uso en producción.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base de Perplexity.
- El rendimiento de la pareja asimétrica depende de que el índice se construya con el 9B y las consultas con el 0.6B; mezclar modelos de otras familias rompe la compatibilidad del espacio de embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nynefold/pplx-embed-v2-late-9b-ONNX
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-9b
- Modelo hermano 0.6B ONNX: https://huggingface.co/nynefold/pplx-embed-v2-late-0.6b-ONNX
- Informe de resultados del autor: https://huggingface.co/nynefold/retrieval-quant/blob/main/pplx-embed-v2-late.md
- Dataset FreshRet Small: https://huggingface.co/datasets/nynefold/FreshRet-Small
- Dataset MIRACL Reranking: https://huggingface.co/datasets/mteb/MIRACLReranking
- Paper referenciado (arXiv:2610.29523): https://arxiv.org/abs/2610.29523
