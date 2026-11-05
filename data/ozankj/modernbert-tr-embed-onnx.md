# Ozankj/modernbert-tr-embed-ONNX

## Resumen

ModernBERT-TR Embed ONNX es una conversión no oficial a formato ONNX del modelo de embeddings `ytu-ce-cosmos/modernbert-tr-embed`, desarrollado originalmente por el grupo YTU-CE Cosmos. El repositorio, mantenido por el usuario Ozankj, redistribuye el artefacto FP16 original junto con una cuantización int8 propia generada mediante `MatMulNBits`, orientada a inferencia en CPU y entornos con recursos limitados. No incluye los pesos en safetensors de PyTorch, solo el tokenizador, la configuración de sentence-transformers, los módulos de pooling y normalización y los grafos ONNX.

El modelo resuelve la tarea de generación de embeddings de frases en turco para similitud semántica y extracción de características, sobre una arquitectura ModernBERT de 768 dimensiones de salida. Su relevancia actual radica en que permite desplegar un encoder turco en producción sin dependencia de PyTorch, algo útil para pipelines de búsqueda semántica, deduplicación o RAG en infraestructuras ligeras. La ventana de contexto, el número exacto de parámetros y los datos de entrenamiento no se detallan en la información disponible; deben consultarse en la model card del modelo original.

Se trata de un artefacto derivado con licencia Apache-2.0, sin afiliación con los autores originales, y con métricas de fidelidad de cuantización publicadas por el conversor, pero sin evaluación MTEB completa en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), según tags y modelo base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con truncamiento a 512 tokens) |
| Tipos de cuantizacion | FP16 ONNX (~298 MB) e int8 `MatMulNBits` (~152 MB) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, `onnx/model_quantized.onnx`); sin safetensors |
| Dimension de salida | 768 (`last_hidden_state`: batch, seq_len, 768) |
| Modelo base | ytu-ce-cosmos/modernbert-tr-embed |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un ModernBERT, un encoder transformer con atención bidireccional optimizada para secuencias largas, adaptado al turco por YTU-CE Cosmos a partir de `ytu-ce-cosmos/modernbert-tr-base`. Sobre esa base se aplica un pipeline de sentence-transformers con pooling y normalización L2, de modo que la salida es un vector de 768 dimensiones por frase. El repositorio ONNX conserva esos módulos en `1_Pooling/` y `2_Normalize/` y expone únicamente `last_hidden_state` como salida del grafo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste con RLHF o DPO; esos detalles corresponden a la model card del modelo original, que la información proporcionada no reproduce. La innovación técnica de este repositorio concreto es la cuantización int8 independiente: según las pruebas del autor, frente al FP16 ONNX upstream alcanza una similitud coseno media de 0,999795 en 120 pasajes de validación de `wiki40b` en turco, con un mínimo de 0,999555, un 100 % de coincidencia en el vecino más cercano top-1 y un 98,5 % de solapamiento top-5. La variante cuantizada oficial upstream obtiene en la misma prueba 0,959059 de media y un 71,7 % de top-1.

## Capacidades

- Generación de embeddings de frases en turco para similitud semántica (`sentence-similarity`).
- Extracción de características (`feature-extraction`) a nivel de token mediante `last_hidden_state`.
- Pooling con máscara de atención y normalización L2 integrados en el pipeline de sentence-transformers.
- Codificación de secuencias de hasta 512 tokens en las pruebas publicadas (el límite real del modelo base no se especifica).
- Compatibilidad con `text-embeddings-inference` y `endpoints_compatible` según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder de embeddings, no un modelo generativo.
- Capacidad multilingüe limitada al turco según el campo `language` de la model card.

## Casos de uso

- Búsqueda semántica en turco: indexar documentos con el modelo FP16 y consultar con la variante int8, aprovechando la alta paridad top-1 (100 %) medida frente a FP16 para que los resultados de recuperación no se degraden.
- Deduplicación de contenidos: comparar embeddings normalizados de artículos o registros turcos y aplicar un umbral de coseno; la desviación máxima de similitud por pares del int8 es de 0,00562, suficiente para umbrales habituales de 0,9 o superiores.
- RAG sobre corpus turcos: usar el modelo como retriever en un pipeline de recuperación aumentada, desplegado vía ONNX Runtime en CPU para evitar dependencias de GPU.
- Clasificación y clustering de textos: generar embeddings y alimentar clasificadores ligeros o algoritmos de clustering (k-means, HDBSCAN) para segmentar tickets, reseñas o noticias en turco.
- Moderación y filtrado de contenido: calcular similitud contra un conjunto de referencia de textos prohibidos o plantillas, con inferencia en CPU de bajo coste gracias a los ~152 MB del modelo int8.
- Despliegue en el borde o en navegador: el tamaño reducido del int8 y el formato ONNX permiten ejecución en entornos WASM o DirectML, aunque el autor advierte que la paridad en esos execution providers no está garantizada.
- Servicio de embeddings con Text Embeddings Inference: los tags `text-embeddings-inference` y `endpoints_compatible` indican compatibilidad con el servidor de Hugging Face para exponer un endpoint HTTP de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB turco, etc.) en la información disponible. Las únicas métricas publicadas son pruebas de fidelidad de la cuantización int8 frente al FP16 ONNX upstream:

| Metrica (wiki40b turco, 120 pasajes, 512 tokens) | int8 propio (Ozankj) | Cuantizado oficial upstream |
|---|---:|---:|
| Coseno medio vs FP16 | 0,999795 | 0,959059 |
| Coseno minimo | 0,999555 | 0,915688 |
| Percentil 1 | 0,999624 | 0,919566 |
| Percentil 5 | 0,999665 | 0,937056 |
| Ejemplos con coseno >= 0,999 | 100 % | 0 % |
| Deriva maxima de similitud por pares | 0,00562 | 0,0920 |
| Coincidencia top-1 de vecino mas cercano | 100 % | 71,7 % |
| Solapamiento top-5 | 98,5 % | 79,8 % |

Pruebas de humo adicionales: 10 ejemplos representativos en turco con coseno medio 0,999892 y mínimo 0,999857; un ejemplo repetido de 512 tokens con coseno 0,9998; y tres cadenas con corchetes y tokens especiales literales con coseno entre 0,9998 y 0,9999. El autor indica que son pruebas de robustez en CPU, no una evaluación MTEB completa.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el FP16 ONNX ocupa ~298 MB y el int8 ~152 MB en disco y en memoria durante la inferencia.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime (por ejemplo, RTX 4090, A100, H100) si se busca aceleración, aunque el diseño del artefacto está orientado a CPU.
- Cabe en cualquier GPU consumer y en CPU convencionales; también en entornos con poca memoria.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), sentence-transformers con `backend="onnx"`, Text Embeddings Inference (por los tags) y potencialmente WASM o DirectML, con la advertencia del autor sobre paridad no garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito de runtime: la variante int8 necesita soporte de `MatMulNBits` en el execution provider; el FP16 es la opción recomendada si la compatibilidad prima sobre el tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ozankj/modernbert-tr-embed-ONNX | no disponible | no disponible | tr | Apache-2.0 | ONNX FP16 e int8 | Conversión no oficial; sin safetensors |
| ytu-ce-cosmos/modernbert-tr-embed | no disponible | no disponible | tr | Apache-2.0 (según modelo base) | safetensors (PyTorch) | Modelo original; fuente autoritativa de benchmarks |
| Cuantizado oficial upstream (referenciado en la model card) | no disponible | no disponible | tr | Apache-2.0 | ONNX cuantizado | Menor fidelidad medida frente a FP16 (coseno medio 0,959) |

No se dispone de información sobre otros modelos comparables de embeddings en turco en la documentación proporcionada.

## Limitaciones y advertencias

- Repositorio no oficial: no está afiliado ni respaldado por YTU-CE Cosmos; la calidad del modelo debe contrastarse con la model card original.
- Solo contiene artefactos ONNX; no incluye los pesos PyTorch en safetensors, por lo que no sirve para fine-tuning con el flujo estándar de transformers.
- Las métricas publicadas son pruebas de humo y robustez en CPU, no una evaluación MTEB turca completa; no hay datos de rendimiento en tareas downstream.
- La paridad de la cuantización int8 no está garantizada en execution providers distintos de CPU (web, WASM, DirectML).
- La variante int8 requiere soporte de `MatMulNBits`; sin él, debe usarse el FP16.
- Idioma limitado al turco según la model card; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgos y alucinación: al ser un encoder de embeddings no genera texto, pero los sesgos del corpus de entrenamiento original pueden reflejarse en la similitud semántica; no hay información sobre la composición del dataset.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución upstream según `NOTICE` y `QUANTIZATION.md`.
- El límite real de contexto del modelo base no se especifica; las pruebas se hicieron truncando a 512 tokens.

## Enlaces

- Repositorio ONNX: https://huggingface.co/Ozankj/modernbert-tr-embed-ONNX
- Modelo original: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-embed
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Documentación de cuantización del repositorio: `QUANTIZATION.md` (incluido en el repo)
- Aviso de atribución: `NOTICE` (incluido en el repo)
- Paper y benchmarks: consultar la model card del modelo original (no se proporciona enlace directo en la información disponible)
