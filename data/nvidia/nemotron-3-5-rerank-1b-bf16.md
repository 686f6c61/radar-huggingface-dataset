# nvidia/Nemotron-3.5-Rerank-1B-BF16

## Resumen

Nemotron-3.5-Rerank-1B-BF16 es un modelo de reranking (cross-encoder) desarrollado por NVIDIA para recuperación de información multilingüe y multimodal en pipelines de question answering. A diferencia de un generador de texto, el modelo recibe un par consulta-documento y emite un logit de relevancia: cuanto mayor es el valor, más pertinente es el documento para la consulta. Los documentos pueden ser texto plano, imágenes de página o una combinación de ambos, incluyendo gráficos, tablas e infografías.

El modelo se construye sobre una arquitectura vision-language cross-encoder que combina un codificador visual basado en Pixtral, una torre de lenguaje Ministral3 bidireccional y una cabeza lineal de scoring. Con 1.554.712.576 parámetros reales (1,55B) y una ventana de contexto máxima de 32.768 tokens, está diseñado para insertarse como segunda etapa en sistemas de recuperación: primero un modelo de embeddings multimodal recupera candidatos y después este reranker los reordena por relevancia.

Su relevancia actual radica en que cubre tanto texto como imagen en un único modelo, algo poco habitual en la categoría de rerankers, y está evaluado en 34 idiomas para texto y 18 para imagen. Se distribuye con licencia OpenMDW-1.1, que permite uso comercial y no comercial, y dispone de variantes NVFP4 y de un modelo hermano de 8B para escenarios con mayores requisitos de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language cross-encoder (codificador visual Pixtral + torre de lenguaje Ministral3 bidireccional + cabeza lineal de scoring) |
| Parametros totales | 1.554.712.576 (1,55B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (version publicada); NVFP4 disponible en variante separada |
| Idiomas soportados | Multilingue: 34 idiomas evaluados en texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, Hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y 18 en imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW-1.1 (modelos base Ministral-3 bajo Apache 2.0) |
| Formato de pesos | Safetensors (BF16) |
| Tamano del repositorio | 9,3 GB |
| Entrada | Texto (string) e imagen (RGB); `longest_edge` por defecto 1.120 px, ampliable a 1.540 px |
| Salida | Lista de floats (logits de relevancia) |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder multimodal: procesa conjuntamente la consulta y el documento (texto, imagen o ambos) y produce un único logit de relevancia. La torre de lenguaje es una variante bidireccional de Ministral3, lo que permite atender simultáneamente a consulta y documento en lugar de generar una respuesta autoregresiva. El codificador visual deriva de Pixtral y procesa las imágenes de página con un `longest_edge` configurable (1.120 px por defecto, hasta 1.540 px).

El entrenamiento se realizó en dos etapas. En la primera, el modelo de 1B se destiló del profesor Nemotron-3.5-Rerank-8B-BF16 sobre una mezcla de datasets de solo texto. En la segunda, el checkpoint resultante se entrenó con datasets de imagen y de imagen más texto, lo que le confiere la capacidad de reranking multimodal. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni especifica si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Reranking de pares consulta-documento con salida de logit de relevancia (mayor valor, mayor pertinencia).
- Recuperación visual de documentos: procesa imágenes de página con gráficos, tablas e infografías.
- Reranking multimodal: acepta documentos que combinan texto e imagen en una misma entrada.
- Soporte multilingüe amplio: 34 idiomas evaluados en texto y 18 en imagen.
- Integración en pipelines de RAG clásicos y de RAG visual agéntico.
- Compatible con `transformers`, `sentence-transformers` y `vLLM`.
- No es un modelo generativo: no produce texto libre ni respuestas, solo puntuaciones de relevancia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Reranking en pipelines RAG textuales: tras una recuperación densa con un modelo de embeddings, el reranker reordena los candidatos y mejora la precisión de los documentos que se pasan al generador. Su contexto de 32.768 tokens permite evaluar documentos largos sin truncar.
- Recuperación de documentos visuales: en corpus con PDFs escaneados, informes con gráficos o presentaciones, el modelo puntúa directamente la imagen de página, evitando depender exclusivamente de OCR.
- Búsqueda semántica empresarial multilingüe: con 34 idiomas evaluados, permite consultas en español contra documentos en inglés, alemán o japonés dentro de un mismo índice.
- Atención al cliente con base de conocimiento: reordena artículos de ayuda y FAQ antes de que un LLM redacte la respuesta, reduciendo alucinaciones al priorizar fuentes relevantes.
- RAG agéntico sobre documentación técnica: en flujos donde un agente decide qué documentos consultar, el reranker filtra y ordena los candidatos en cada iteración.
- Moderación y deduplicación de resultados de búsqueda: el logit de relevancia permite fijar umbrales para descartar documentos poco pertinentes antes de etapas costosas.
- Investigación académica: recuperación de pasajes relevantes en corpus multilingües con tablas y figuras, donde los rerankers solo-texto rinden peor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en 34 idiomas para texto y 18 para imagen, pero no incluye tablas con métricas concretas (nDCG, MRR, Recall) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,1 GB solo para pesos (1,55B × 2 bytes), más overhead de activaciones y del codificador visual; en la práctica, entre 4 y 8 GB según la resolución de imagen y la longitud de contexto.
- Variante NVFP4: reduce el peso de los pesos a aproximadamente 1 GB, pensada para GPUs Blackwell con soporte de FP4.
- GPU recomendadas: NVIDIA A100, H100 y GPUs Blackwell para máximo throughput; RTX 4090 y RTX 3090 son suficientes para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores; en GPUs con 8 GB puede requerir reducir la resolución de imagen o la longitud de contexto.
- Opciones de despliegue: `transformers`, `sentence-transformers` y `vLLM` (según los tags del repositorio). La model card indica que el modelo está optimizado para sistemas acelerados por GPU NVIDIA con CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-1B-BF16 | 1,55B | 32.768 | Si (texto + imagen) | 34 (texto) / 18 (imagen) | OpenMDW-1.1 |
| Nemotron-3.5-Rerank-8B-BF16 | 8B (aproximado, segun nombre) | no disponible | Si | no disponible | OpenMDW-1.1 |
| Nemotron-3.5-Rerank-1B-NVFP4 | 1,55B | no disponible | Si | no disponible | OpenMDW-1.1 |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos hermanos en la información proporcionada, por lo que no es posible comparar rendimiento numérico. Tampoco se han identificado en la información disponible rerankers de otros fabricantes comparables en tamaño y capacidades multimodales.

## Limitaciones y advertencias

- El modelo solo emite logits de relevancia; no genera texto ni respuestas, por lo que debe combinarse con un generador en pipelines RAG.
- Riesgo de sesgo heredado de los datos de entrenamiento y de los modelos base Ministral3 y Pixtral; la model card no documenta evaluaciones de sesgo.
- No se documentan tasas de alucinación ni calibración de los logits; los umbrales de relevancia deben validarse empíricamente por caso de uso.
- La cobertura de idiomas en imagen (18) es menor que en texto (34); el rendimiento en idiomas no evaluados no está garantizado.
- La resolución de imagen está limitada por defecto a 1.120 px (`longest_edge`), ampliable a 1.540 px; documentos de muy alta resolución pueden perder detalle.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus términos completos antes de desplegar en producción; los modelos base Ministral-3 están bajo Apache 2.0.
- El repositorio incluye código personalizado (`custom_code`), lo que puede requerir versiones específicas de `transformers` y `sentence-transformers` (Python 3.12 según la model card).
- No hay datos publicados de throughput ni latencia, lo que dificulta dimensionar infraestructura sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-1B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-1B-NVFP4
- Modelo hermano 8B BF16: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Modelo hermano 8B NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base Ministral-3-3B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base Ministral-3-8B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- NVIDIA: https://www.nvidia.com/
