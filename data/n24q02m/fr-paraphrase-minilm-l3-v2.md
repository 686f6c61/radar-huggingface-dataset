# n24q02m/fr-paraphrase-MiniLM-L3-v2

## Resumen

`n24q02m/fr-paraphrase-MiniLM-L3-v2` es una conversión a ONNX del modelo de embeddings de frases `sentence-transformers/paraphrase-MiniLM-L3-v2`, publicada por el usuario n24q02m mediante su herramienta `fastretrieval`. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos del modelo original de sentence-transformers y los exporta a formato ONNX con dos variantes cuantizadas (INT8 y Q4F16) pensadas para inferencia eficiente en CPU y entornos con recursos limitados.

El modelo base es un transformer tipo BERT de la familia MiniLM, con 3 capas (L3), diseñado específicamente para generar embeddings de frases orientados a similitud semántica y paráfrasis. La conversión aplica pooling MEAN sobre las representaciones de tokens y normalización L2 de los vectores resultantes, de modo que los embeddings pueden compararse directamente mediante producto escalar o similitud coseno.

La relevancia de esta ficha es acotada: se trata de un build de despliegue con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de la documentación de conversión. Su interés práctico reside en la posibilidad de ejecutar un modelo de embeddings ligero (17 MB en INT8) en pipelines de búsqueda semántica o deduplicación sin depender de PyTorch, lo que simplifica el despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM, 3 capas) exportado a ONNX |
| Parámetros totales | no disponible (modelo base MiniLM-L3; el autor no publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (QInt8, cuantización dinámica) y Q4F16 (MatMulNBits, block_size 128, simétrica, con cast a float16) |
| Idiomas soportados | no disponible (la model card no los declara; el prefijo `fr-` sugiere orientación al francés, sin confirmación) |
| Licencia | no disponible (hereda la del modelo base; debe consultarse en `sentence-transformers/paraphrase-MiniLM-L3-v2`) |
| Formato de pesos | ONNX (opset 21); variantes `onnx/model_quantized.onnx` (17 MB) y `onnx/model_q4f16.onnx` (25 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo BERT con 3 capas, conocido como MiniLM-L3, que forma parte de la familia de modelos destilados de sentence-transformers. El modelo base `paraphrase-MiniLM-L3-v2` fue entrenado para producir embeddings de frases mediante aprendizaje contrastivo sobre pares de paráfrasis, y esta conversión no modifica los pesos ni el entrenamiento: únicamente cambia el formato de serialización y aplica cuantización.

La conversión a ONNX se realizó con la herramienta `fastretrieval` del mismo autor, usando opset 21. La variante INT8 emplea `onnxruntime.quantization.quantize_dynamic` con tipo QInt8, mientras que la variante Q4F16 usa `MatMulNBitsQuantizer` con block_size 128 y cuantización simétrica, seguida de un cast a float16. El pooling es MEAN y se aplica normalización sobre el vector resultante. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo etapas de RLHF o DPO, ya que la model card de esta conversión no los detalla y remite al modelo base.

## Capacidades

- Generación de embeddings de frases para similitud semántica y detección de paráfrasis.
- Extracción de características (`feature-extraction`) con pooling MEAN y normalización L2.
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de PyTorch.
- Dos variantes cuantizadas para equilibrar tamaño y precisión (INT8 y Q4F16).
- Integración con la librería `fastretrieval` mediante `TextEmbedding`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder de embeddings, no un modelo generativo.
- No se declaran capacidades multimodales (visión, audio) ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica en producción: indexar documentos y consultas como vectores normalizados y recuperar por similitud coseno; el tamaño de 17 MB en INT8 permite desplegar el índice y el encoder en el mismo servicio sin GPU.
- Deduplicación de contenidos: comparar embeddings de artículos o registros para detectar duplicados near-duplicate en pipelines ETL, con umbral de similitud coseno ajustable.
- Clasificación zero-shot ligera: usar la similitud entre un texto y descripciones de categorías como señal de clasificación en entornos con pocos recursos.
- Filtrado de paráfrasis en moderación o control de calidad: detectar reformulaciones de un mismo mensaje en sistemas de revisión de contenido.
- Recuperación aumentada (RAG) en entornos edge o sin GPU: servir el encoder ONNX en CPU para generar embeddings de chunks en un pipeline RAG de bajo coste.
- Agrupamiento de tickets de soporte: agrupar consultas de usuarios por similitud semántica para enrutarlas al equipo adecuado, ejecutando el modelo en el propio backend.
- Preprocesado en aplicaciones móviles o embebidas: al ser un modelo de 17-25 MB en ONNX, puede integrarse en apps que necesiten búsqueda local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En GPU, la huella es mínima (17-25 MB de pesos más activaciones).
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (RTX 4090, A100, H100) es sobredimensionada para este modelo; su uso típico es CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; también en dispositivos con memoria muy limitada.
- Opciones de despliegue: ONNX Runtime (nativo), `fastretrieval` (`TextEmbedding`), y cualquier runtime compatible con ONNX opset 21.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `n24q02m/fr-paraphrase-MiniLM-L3-v2` | no disponible (MiniLM-L3) | no disponible | ONNX (INT8, Q4F16) | no disponible (hereda del base) | Hugging Face, 0 descargas |
| `sentence-transformers/paraphrase-MiniLM-L3-v2` | MiniLM-L3 (recuento no disponible en la información) | no disponible | PyTorch (safetensors/bin) | la del modelo original (consultar) | Hugging Face, modelo base |
| `sentence-transformers/all-MiniLM-L6-v2` | MiniLM-L6 (recuento no disponible en la información) | no disponible | PyTorch, ONNX en repos derivados | Apache 2.0 según el modelo original (verificar) | Hugging Face, ampliamente usado |

La comparación se limita a alternativas de la misma familia; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es un encoder de embeddings, no un modelo generativo: no produce texto, código ni respuestas.
- El prefijo `fr-` del nombre sugiere orientación al francés, pero la model card no declara idiomas soportados; no debe asumirse cobertura multilingüe sin verificación.
- La licencia no está declarada en este repositorio; hereda la del modelo base y debe comprobarse antes de cualquier uso comercial.
- Al ser una conversión cuantizada, puede haber una pérdida de precisión en los embeddings respecto al modelo original en PyTorch, especialmente en Q4F16.
- No se han publicado evaluaciones de sesgo, robustez ni alucinación (no aplica alucinación en sentido generativo, pero sí posibles sesgos en la similitud semántica).
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; úsese con cautela en producción.
- No se documentan límites de longitud de secuencia ni el tokenizador asociado en esta model card; debe consultarse el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/n24q02m/fr-paraphrase-MiniLM-L3-v2
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L3-v2
- Herramienta de conversión `fastretrieval`: https://github.com/n24q02m/fastretrieval
