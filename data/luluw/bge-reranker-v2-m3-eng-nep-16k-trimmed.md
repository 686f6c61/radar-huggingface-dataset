# luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed

## Resumen

Este modelo es una versión recortada del reranker multilingüe `BAAI/bge-reranker-v2-m3`, desarrollado por el usuario `luluw` en HuggingFace. Se trata de un cross-encoder que puntúa pares (consulta, pasaje) y devuelve un logit de relevancia, sin generar embeddings. Su principal innovación es la reducción del vocabulario original de 250 002 tokens a 16 384, centrado exclusivamente en inglés y nepalí, lo que reduce el tamaño de la matriz de embeddings y el coste de inferencia en despliegues que solo necesitan estos dos idiomas.

El modelo conserva la arquitectura del modelo base (XLM-RoBERTa) y no ha sido fine-tuneado: los embeddings de los tokens conservados se copiaron tal cual del original. Con 328,5 millones de parámetros y una ventana de contexto de 512 tokens (heredada del modelo base), es adecuado para tareas de reranking en pipelines de recuperación de información, especialmente en entornos con restricciones de memoria o donde el multilingüismo completo no es necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (modelo base: BAAI/bge-reranker-v2-m3) |
| Parametros totales | 328 530 945 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés y nepalí |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de tipo transformer (XLM-RoBERTa) que procesa conjuntamente la consulta y el pasaje, separados por los tokens especiales `<s> query </s></s> passage </s>`, y produce un único logit de relevancia. No se ha realizado ningún entrenamiento adicional: el proceso de creación consistió en contar frecuencias de tokens en textos reales en inglés y nepalí (dataset `lbourdois/fineweb-2-trimming`), mantener los tokens especiales y los primeros 1000 IDs originales, y rellenar el presupuesto restante con los tokens más frecuentes ponderados al 50/50. La matriz de embeddings de entrada se reconstruyó copiando las filas originales para cada token conservado, mientras que la cabeza de clasificación (una única neurona) se dejó intacta. Se proporciona un mapeo `old_id -> new_id` para poder reutilizar el tokenizador original de XLM-RoBERTa.

## Capacidades

- Reranking de pares (consulta, pasaje) para búsqueda semántica, devolviendo una puntuación de relevancia en el rango [0,1] tras aplicar sigmoide.
- Soporte exclusivo para inglés y nepalí, con vocabulario recortado a 16 384 tokens.
- No produce embeddings para índice vectorial; solo reordena una lista de candidatos ya recuperada por un primer recuperador (BM25, modelo denso, etc.).
- No dispone de tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales.
- Compatible con la librería `transformers` y con `text-embeddings-inference` (según los tags del repositorio).

## Casos de uso

- Recuperación aumentada por generación (RAG) en inglés y nepalí: el modelo reordena los pasajes recuperados por un primer recuperador para mejorar la precisión de las respuestas generadas por un LLM.
- Búsqueda semántica en dominios específicos (legal, médico, técnico) donde solo se manejan documentos en inglés y nepalí, reduciendo el coste de memoria frente al modelo multilingüe completo.
- Filtrado de candidatos en pipelines de pregunta-respuesta: dado un conjunto de pasajes potenciales, el reranker selecciona los más relevantes antes de pasarlos al generador.
- Sistemas de atención al cliente con base de conocimiento bilingüe: reordenar artículos de ayuda en inglés y nepalí según la consulta del usuario.
- Despliegue en entornos con recursos limitados (edge, CPU) donde el vocabulario reducido permite una inferencia más rápida y con menor huella de memoria.
- Evaluación de calidad de recuperación en motores de búsqueda internos: usar el score del reranker como señal de relevancia para ajustar rankings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 328,5 M de parámetros, en FP32 se requieren aproximadamente 1,3 GB; en FP16 unos 0,66 GB; en int8 unos 0,33 GB (si se aplicara cuantización, aunque no se especifica).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16 (p. ej., NVIDIA T4, RTX 3060, RTX 4090). Para despliegues en CPU, es viable con 4-8 GB de RAM.
- Cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., sin problemas.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (TEI), HuggingFace Inference Endpoints, o servidores propios con FastAPI.
- Latencia y throughput: no disponible; dependerá del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Contexto | Licencia |
|---|---|---|---|---|---|
| luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed | 328,5 M | 16 384 | Inglés, nepalí | 512 | MIT |
| BAAI/bge-reranker-v2-m3 (original) | 568 M (aprox.) | 250 002 | 100+ | 512 | MIT |
| BAAI/bge-reranker-base | 110 M | 30 522 | Multilingüe (menos) | 512 | MIT |

Nota: los parámetros del modelo original no se han verificado en la información proporcionada; la cifra de 568 M es una estimación basada en el tamaño del modelo base (no confirmada). La comparativa se centra en características estructurales, no en rendimiento, ya que no hay benchmarks disponibles.

## Limitaciones y advertencias

- El vocabulario recortado puede provocar que tokens raros o específicos de dominio se mapeen a `<unk>`, degradando la calidad en textos técnicos o poco frecuentes.
- No se ha realizado fine-tuning tras el recorte; el modelo puede perder precisión frente al original en tareas que requieran vocabulario amplio o matices multilingües.
- Solo soporta inglés y nepalí; no es adecuado para otros idiomas.
- No produce embeddings, por lo que no puede usarse como recuperador de primera etapa.
- Es obligatorio utilizar el mapeo `old_id -> new_id` proporcionado y el tokenizador original; alimentar el modelo con IDs del tokenizador sin mapear dará resultados incorrectos.
- La ventana de contexto está limitada a 512 tokens (heredada del modelo base), lo que puede ser insuficiente para pasajes muy largos.
- Aunque la licencia es MIT, el modelo base tiene su propia licencia (MIT también), pero se recomienda verificar los términos del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luluw/bge-reranker-v2-m3-eng-nep-16k-trimmed
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Paper de BGE M3: https://arxiv.org/abs/2402.03216
- Documentación de BGE-Reranker-v2: https://bge-model.com/bge/bge_reranker_v2.html
- Repositorio de ejemplo con MLX: https://github.com/MemTensor/mlx-memos/tree/main/models/bge-reranker-v2-m3
