# nokkela-ai/bge-reranker-v2-m3

## Resumen

bge-reranker-v2-m3 es un modelo de reranking (reclasificación de pares consulta-documento) publicado originalmente por BAAI y replicado aquí por nokkela-ai como fork independiente bajo licencia Apache 2.0. A diferencia de un modelo de embeddings, el reranker recibe directamente la consulta y el pasaje como entrada y devuelve una puntuación de similitud, que puede normalizarse al rango [0,1] aplicando una función sigmoide. Esto lo hace adecuado para la segunda etapa de pipelines de recuperación de información (RAG), donde se refina el orden de los candidatos recuperados por un retriever vectorial.

El modelo se construye sobre la arquitectura XLM-RoBERTa (xlm-roberta) y cuenta con 567.755.777 parámetros totales, lo que lo sitúa en la categoría de rerankers ligeros orientados a despliegue con latencia baja. Su principal valor es la cobertura multilingüe: frente a los rerankers base y large de la familia, que se centran en chino e inglés, la variante v2-m3 está diseñada para escenarios multilingües.

Es relevante ahora porque el ecosistema de RAG en producción exige componentes de reranking eficientes y multilingües que puedan integrarse en stacks existentes (sentence-transformers, text-embeddings-inference, FlagEmbedding) sin reentrenar el retriever. Este fork concreto no aporta modificaciones documentadas respecto al modelo original; se trata de una copia independiente publicada por Nokkela.AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, clasificación de pares) |
| Parámetros totales | 567.755.777 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el uso con fp16 está documentado en la librería FlagEmbedding) |
| Idiomas soportados | multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa que recibe como entrada el par (consulta, pasaje) y produce una puntuación escalar de relevancia. No genera embeddings reutilizables: la interacción entre consulta y documento se procesa conjuntamente en cada forward pass, lo que permite capturar señales de relevancia más finas que una simple similitud coseno entre vectores. La puntuación cruda puede transformarse en probabilidad mediante sigmoide para obtener un valor en [0,1].

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original de BAAI se apoya en la familia bge-m3 y está orientado a rendimiento multilingüe y despliegue ligero; este fork hereda esas características sin cambios documentados. La model card referencia los papers arXiv:2312.15503 y arXiv:2402.03216 como base técnica de la familia.

## Capacidades

- Puntuación de relevancia consulta-pasaje para reranking en pipelines de recuperación.
- Normalización de puntuaciones al rango [0,1] mediante sigmoide.
- Procesamiento por lotes de múltiples pares consulta-documento.
- Cobertura multilingüe, incluyendo chino, inglés y otros idiomas.
- Integración con FlagEmbedding (`FlagReranker`), sentence-transformers y text-embeddings-inference.
- Soporte de precisión fp16 para acelerar la inferencia con una degradación leve del rendimiento.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar los N candidatos con un retriever vectorial, el modelo reordena los pasajes por relevancia real respecto a la consulta, mejorando la calidad del contexto entregado al LLM generador.
- Búsqueda empresarial multilingüe: en corpus con documentos en varios idiomas, el modelo puntúa pares consulta-documento sin depender de traducción previa, aprovechando su entrenamiento multilingüe.
- Atención al cliente con base de conocimiento: se usa como segunda etapa para seleccionar los fragmentos de documentación más pertinentes antes de que un modelo generativo redacte la respuesta.
- Filtrado de resultados en motores de búsqueda internos: reordena los resultados de una primera fase de recuperación léxica o semántica para mejorar la precisión de la primera página.
- Deduplicación y selección de evidencia: puntúa pasajes candidatos para descartar los poco relevantes antes de pasarlos a un modelo de resumen o extracción.
- Evaluación de sistemas de recuperación: sirve como componente de referencia para medir la calidad del ranking en experimentos de IR, comparando puntuaciones antes y después del reranking.
- Moderación de contenido asistida: puntuación de similitud entre una consulta de política y fragmentos de texto para priorizar revisiones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB en fp16 (567,7 M de parámetros) y unos 2,3 GB en fp32; el tamaño del repo es de 2,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o L40S para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: FlagEmbedding (`FlagReranker`), sentence-transformers, text-embeddings-inference y transformers.
- Latencia y throughput: no disponibles en la información proporcionada; la model card indica que es un modelo ligero con inferencia rápida y recomienda fp16 para acelerar el cálculo.

## Comparativa con modelos similares

| Modelo | Modelo base | Parámetros | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| nokkela-ai/bge-reranker-v2-m3 | bge-m3 | 567.755.777 | Multilingüe | Apache 2.0 | Fork del original de BAAI |
| BAAI/bge-reranker-v2-m3 | bge-m3 | no disponible | Multilingüe | Apache 2.0 | Modelo original |
| BAAI/bge-reranker-base | xlm-roberta-base | no disponible | Chino e inglés | no disponible | Reranker ligero |
| BAAI/bge-reranker-large | xlm-roberta-large | no disponible | Chino e inglés | no disponible | Reranker ligero de mayor tamaño |
| BAAI/bge-reranker-v2-gemma | gemma-2b | no disponible | Multilingüe | no disponible | Reranker basado en LLM |
| BAAI/bge-reranker-v2-minicpm-layerwise | MiniCPM-2B-dpo-bf16 | no disponible | Multilingüe | no disponible | Permite seleccionar capas (8-40) para acelerar inferencia |

## Limitaciones y advertencias

- Es un modelo de reranking, no un modelo generativo: no puede usarse para producir texto, razonar ni invocar herramientas.
- La información disponible no documenta sesgos específicos; al ser un modelo multilingüe entrenado con datos web, es probable que herede sesgos de esos corpus.
- Riesgo de alucinación no aplica en el sentido generativo, pero las puntuaciones de relevancia pueden ser poco fiables en dominios muy especializados o con jerga técnica.
- La longitud máxima de contexto no está documentada en la información proporcionada; conviene verificarla antes de usarlo con pasajes largos.
- Aunque la licencia es Apache 2.0, este fork no documenta cambios respecto al original; para producción se recomienda evaluar el modelo original de BAAI como referencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-21) es posterior a la fecha actual de referencia; conviene verificar la procedencia del fork antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/nokkela-ai/bge-reranker-v2-m3
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding/tree/master
- Paper arXiv:2312.15503: https://arxiv.org/abs/2312.15503
- Paper arXiv:2402.03216: https://arxiv.org/abs/2402.03216
- Modelo base bge-m3: https://huggingface.co/BAAI/bge-m3
