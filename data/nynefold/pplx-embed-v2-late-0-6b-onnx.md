# nynefold/pplx-embed-v2-late-0.6b-ONNX

## Resumen

pplx-embed-v2-late-0.6b-ONNX es una versión cuantizada a 4 y 8 bits en formato ONNX del modelo de embeddings `perplexity-ai/pplx-embed-v2-late-0.6b` de Perplexity, publicada por el usuario nynefold. Se trata de un recuperador de tipo late-interaction (estilo ColBERT): en lugar de producir un único vector por documento, genera un vector L2-normalizado de 128 dimensiones por cada token, y la relevancia se calcula con la operación MaxSim entre los vectores de la consulta y los del documento. El modelo original, su entrenamiento y su licencia MIT pertenecen a Perplexity; esta publicación es un derivado cuantizado para ONNX Runtime.

La relevancia práctica del artefacto está en su estrategia de despliegue asimétrica: el modelo de 0.6B comparte espacio de embeddings y tokenizador con la variante de 9B, de modo que un corpus indexado una sola vez con el 9B puede consultarse con el 0.6B. Según las mediciones del autor, el par 0.6B-consulta / 9B-índice alcanza 0.835 de nDCG@10 en FreshRet Small, frente a 0.823 del 0.6B en ambos lados y 0.836 del 9B en ambos lados. El 9B se ejecuta una vez por documento en modo offline; por consulta solo se procesa la consulta con el 0.6B.

El repositorio incluye 17 variantes cuantizadas con sus mediciones, y el autor recomienda `mix30-gptq-a4-ps`: 437 MB frente a 1.978 MB del FP32, y 617 MB de RAM frente a 1.298 MB, con una pérdida de -0.03 puntos de nDCG@10 en FreshRet Small y una ganancia de +0.85 en MIRACL respecto al FP32. El tamaño total del repositorio es de 6,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con late-interaction (ColBERT-style), un vector de 128 dimensiones por token, puntuación MaxSim |
| Parámetros totales | 0.6B (modelo base); no se detalla el desglose por componente |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens para consultas; 4.096 tokens para documentos |
| Tipos de cuantización | INT4 e INT8 (variantes GPTQ con precisión mixta: `a4`, `pc`, `ps`, `mix10`, `mix30`, `e4`, `e8`, `w4`) |
| Idiomas soportados | multilingüe (según etiquetas del repositorio); lista concreta de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), con `recipe.json` y `tokenizer.json` en variantes con vocabulario podado |
| Dimensión de embedding | 128 por token, L2-normalizada |
| Librería / runtime | onnxruntime >= 1.31, tokenizers, numpy |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un codificador transformer que implementa recuperación por late-interaction: cada token de la entrada produce un embedding de 128 dimensiones normalizado, y la similitud consulta-documento se obtiene sumando, sobre cada token de la consulta, el máximo producto escalar contra cualquier token del documento (MaxSim). Los documentos se tratan con un prefijo `[D]` y las consultas con `[Q]`, ambos tokens añadidos al vocabulario. Antes de puntuar se eliminan los tokens de relleno y, en documentos, un conjunto de tokens de puntuación definido en `config.json` (`document_skiplist`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card de esta publicación se centra en el proceso de cuantización. Los datasets citados (`nynefold/FreshRet-Small` y `mteb/MIRACLReranking`) se emplean para la evaluación de las variantes cuantizadas, no necesariamente para el entrenamiento. La innovación destacable del artefacto es la cuantización por etapas con puerta de calidad (coseno medio de tokens en etapa A con umbral 0,99) y la evaluación con intervalos de confianza bootstrap pareados frente al FP32.

## Capacidades

- Generación de embeddings multilingües para recuperación de información y reranking.
- Recuperación por late-interaction con puntuación MaxSim token a token, más expresiva que un único vector por documento.
- Indexación asimétrica: documentos con la variante de 9B y consultas con la de 0.6B, compartiendo espacio de embeddings y tokenizador.
- Soporte de contexto de hasta 4.096 tokens por documento y 1.024 tokens por consulta.
- Almacenamiento del índice en FP16 o INT8 por vector sin pérdida medible en FreshRet Small.
- Compatible con pipelines de embeddings en producción mediante ONNX Runtime, sin dependencias de PyTorch.
- Integración con un reranker externo (zerank-1-small) para mejorar la precisión final.
- No soporta tool calling, agentes, visión ni audio: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar una base de manuales con la variante de 9B y atender consultas de usuario con el 0.6B, aprovechando que el índice cuesta lo mismo independientemente del modelo que lo construya.
- Reranking de resultados de un buscador léxico: usar las puntuaciones MaxSim del modelo para reordenar los primeros candidatos de BM25, con un coste por consulta reducido al ejecutar solo el codificador de 0.6B.
- Atención al cliente con base de conocimiento: recuperar fragmentos relevantes de artículos de soporte para consultas multi-turno, con contexto de documento de hasta 4.096 tokens que cubre la mayoría de artículos.
- Despliegue en entornos con restricciones de memoria: la variante `e4-w4-gptq-a4-pc` ocupa 255 MB y 561 MB de RAM, lo que permite ejecutar el recuperador en instancias pequeñas o en el borde.
- Recuperación multilingüe: al estar etiquetado como multilingüe, sirve para consultas en un idioma contra un corpus en otro, aunque la lista exacta de idiomas no está documentada.
- Pipelines RAG con reranker: combinar el par 0.6B/9B con zerank-1-small para alcanzar 0.880 de nDCG@10 en FreshRet Small, según las mediciones del autor.
- Indexación por lotes offline: ejecutar el 9B una sola vez por documento en un job nocturno y servir consultas en tiempo real con el 0.6B, separando la carga de indexación de la de servicio.

## Benchmarks y rendimiento

Resultados de nDCG@10 reportados por el autor. Las variantes se comparan de forma pareada contra FP32 con intervalos bootstrap del 95 %.

| Configuración | nDCG@10 FreshRet Small |
|---|---:|
| 0.6B consulta, 0.6B índice | 0.823 |
| 0.6B consulta, 9B índice | 0.835 |
| 9B consulta, 9B índice | 0.836 |
| pplx-embed-v1 + zerank-1-small (top 20) | 0.870 |
| Par 0.6B/9B + zerank-1-small | 0.880 |

Calidad de las variantes cuantizadas frente a FP32:

| Variante | Tamaño (MB) | RAM (MB) | Coseno tokens etapa A | Δ nDCG@10 FreshRet | Δ nDCG@10 MIRACL |
|---|---:|---:|---:|---|---|
| FP32 (no incluida) | 1.978 | 1.298 | 1 | referencia | referencia |
| `e4-w4-gptq-a4-pc` | 255 | 561 | 0.9997 | -0.98 [-1.82, -0.16] | no disponible |
| `e4-w4-gptq-a4-ps` | 293 | 580 | 0.9997 | -0.89 [-1.59, -0.22] | no disponible |
| `mix10-e4-gptq-a4-ps` | 305 | 583 | 0.9998 | -0.61 [-1.27, +0.03] | no disponible |
| `e4-w4-gptq-a4` | 320 | 618 | 0.9997 | -0.89 [-1.59, -0.22] | no disponible |
| `e8-w4-gptq-a4-pc` | 333 | 564 | 0.9997 | -0.89 [-1.70, -0.09] | no disponible |
| `e8-w4-gptq-a4-ps` | 402 | 583 | 0.9997 | -0.79 [-1.41, -0.25] | no disponible |
| `mix30-gptq-a4-ps` (recomendada) | 437 | 617 | no disponible | -0.03 [-0.60, +0.56] | +0.85 [+0.02, +1.86] |

El resto de variantes hasta completar las 17 no están detalladas en la información disponible. El autor indica que el almacenamiento del índice del 9B en INT8 (46 MB para 3.000 documentos cortos) no produce pérdida medible.

## Requisitos de hardware

- VRAM/RAM de inferencia: desde 561 MB de RAM para la variante `e4-w4-gptq-a4-pc` (255 MB de pesos) hasta 1.298 MB de RAM para el FP32 (1.978 MB de pesos). La variante recomendada requiere 617 MB de RAM con 437 MB de pesos.
- GPU recomendadas: no se especifican modelos concretos; al ejecutarse con ONNX Runtime, puede usar CPU o GPU compatibles con los proveedores de ejecución de onnxruntime.
- Cabe en cualquier GPU de consumo actual e incluso en CPU, dado el reducido tamaño de las variantes cuantizadas.
- Opciones de despliegue: ONNX Runtime (>= 1.31) con los scripts `inference.py` y `pair_example.py` proporcionados; dependencias de `tokenizers`, `numpy` y `huggingface_hub`.
- El par completo (9B para documentos y 0.6B para consultas) requiere descargar unos 5.863 MB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 FreshRet Small | Licencia | Formato |
|---|---|---:|---:|---|---|
| pplx-embed-v2-late-0.6b (esta ficha) | 0.6B | 1.024 consulta / 4.096 documento | 0.823 (0.6B/0.6B) | MIT | ONNX cuantizado |
| pplx-embed-v2-late-9b | 9B | no disponible | 0.836 (9B/9B) | MIT (modelo base) | ONNX cuantizado (repo hermano) |
| pplx-embed-v1 + zerank-1-small | no disponible | no disponible | 0.870 | no disponible | no disponible |
| Par 0.6B/9B + zerank-1-small | 0.6B + 9B + reranker | no disponible | 0.880 | MIT (embeddings) | ONNX |

La comparativa se limita a los sistemas medidos por el propio autor en FreshRet Small; no se dispone de comparaciones con otros recuperadores de la misma categoría (por ejemplo, modelos ColBERT de terceros) en la información proporcionada.

## Limitaciones y advertencias

- Es un derivado cuantizado: la calidad puede degradarse respecto al FP32, con pérdidas de hasta -0.98 puntos de nDCG@10 en la variante más agresiva. El autor marca varias variantes como "estimate only" y algunas quedan por debajo de su puerta de calidad.
- Los benchmarks se limitan a FreshRet Small y MIRACL; no hay evaluación en otros dominios ni en otros idiomas, pese a la etiqueta multilingüe.
- El límite de 1.024 tokens por consulta y 4.096 por documento restringe el uso en documentos largos sin fragmentación previa.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperación irrelevante en dominios alejados de los datos de evaluación.
- Sesgos: no documentados en la información disponible.
- La licencia MIT del modelo base se mantiene, pero conviene verificar las condiciones de los datasets de evaluación citados si se redistribuyen.
- El modelo no genera texto ni soporta tool calling: solo produce embeddings; cualquier funcionalidad de agente debe construirse por encima.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original; la trazabilidad del proceso de cuantización depende de los `recipe.json` incluidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nynefold/pplx-embed-v2-late-0.6b-ONNX
- Modelo base: https://huggingface.co/perplexity-ai/pplx-embed-v2-late-0.6b
- Repositorio hermano de 9B: https://huggingface.co/nynefold/pplx-embed-v2-late-9b-ONNX
- Informe de resultados: https://huggingface.co/nynefold/retrieval-quant/blob/main/pplx-embed-v2-late.md
- Dataset de evaluación FreshRet Small: https://huggingface.co/datasets/nynefold/FreshRet-Small
- Dataset MIRACL Reranking: https://huggingface.co/datasets/mteb/MIRACLReranking
- Paper citado: arXiv:2610.29523 (referenciado en las etiquetas del repositorio; no verificado)
