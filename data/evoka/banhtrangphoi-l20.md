# EVOKA/BanhTrangPhoi-L20

## Resumen

BanhTrangPhoi-L20 es un modelo de embeddings multilingüe desarrollado por EVOKA como estudiante destilado de BAAI/bge-m3. Mantiene las tres cabezas del modelo profesor (dense, sparse/lexical y ColBERT multi-vector), pero reduce la profundidad de 24 a 20 capas transformer y poda el vocabulario de 250.002 a 125.000 tokens, lo que supone un ahorro de aproximadamente 128 millones de parámetros y deja el total en 388 millones. El espacio de salida es idéntico al de bge-m3: vectores densos de 1024 dimensiones normalizados en L2, pesos sparse por token y vectores ColBERT de 1024 dimensiones.

El modelo se distribuye en varias variantes: safetensors fp16 para GPU, ONNX fp32 e int8 dinámico para CPU y GGUF Q8_0 para llama.cpp en un repositorio separado. Está pensado para recuperación de información multilingüe en entornos con recursos limitados, donde bge-m3 completo resulta demasiado costoso en latencia o memoria.

Es relevante porque el propio autor documenta de forma transparente que el modelo no supera su puerta de calidad de nivel 1 frente al profesor: falla en 15 celdas, concentradas en recuperación cruzada chino-coreano (MKQA), recall@50 denso en coreano y recall@50 denso en vietnamita. Vietnamita, japonés e inglés quedan a la par del profesor en sus pools de evaluación; chino y coreano son ligeramente inferiores, sobre todo en el escenario cross-lingual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLMRobertaModel), 20 capas |
| Parámetros totales | 388 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (máximo usado en las evaluaciones; no se midió más allá) |
| Tipos de cuantización | fp16, fp32 (ONNX), int8 dinámico per-channel (ONNX), Q8_0 (GGUF) |
| Idiomas soportados | vi, ja, en, zh, ko, ar, es, fr, hi, id, ru, th, multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de bge-m3 mediante destilación de conocimiento. Conserva 20 de las 24 capas del profesor, en concreto las capas 0, 1, 2, 3, 6, 8, 9, 10, 11, 12, 14, 15 y 16-23. El vocabulario se poda de 250.002 a 125.000 tokens, con un ahorro aproximado de 128 millones de parámetros. El repositorio incluye artefactos de trazabilidad del proceso: `PRUNE_INFO.json`, `SURGERY.json` y `id_map_*.json` para mapear los identificadores del vocabulario podado al original (`id_map_new2old.json`).

Mantiene las tres cabezas de salida de bge-m3 en el mismo espacio: vectores densos de 1024 dimensiones ya normalizados en L2, pesos sparse por token de entrada y vectores ColBERT de 1024 dimensiones por token (excluyendo la posición CLS). El entrenamiento se realizó por destilación desde BAAI/bge-m3; la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La evaluación se hizo con 4.631 consultas sobre 20 pools (unos 94.000 documentos) y `max_len` de 512, con intervalos de confianza calculados por bootstrap emparejado sobre consultas.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones, normalizados en L2, para búsqueda semántica.
- Recuperación léxica sparse: pesos por token que permiten construir diccionarios léxicos y combinar con BM25.
- Recuperación multi-vector ColBERT con vectores de 1024 dimensiones por token.
- Soporte multilingüe en 12 idiomas declarados (vi, ja, en, zh, ko, ar, es, fr, hi, id, ru, th) más categoría multilingüe.
- Compatible con el pipeline `feature-extraction` de transformers y con endpoints de Hugging Face.
- Inferencia en CPU mediante ONNX Runtime con las tres cabezas en una sola llamada.
- Inferencia en llama.cpp mediante la variante GGUF Q8_0.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Búsqueda semántica multilingüe en producción: el modelo genera vectores densos normalizados listos para índices vectoriales, con la ventaja de que su tamaño de 388 M parámetros permite desplegarlo en CPU sin GPU dedicada.
- Recuperación híbrida dense + BM25: la cabeza sparse permite construir pesos léxicos por token y combinarlos con BM25, un patrón recomendado por el propio autor para equilibrar recall semántico y coincidencia exacta de términos.
- Reranking con ColBERT: los vectores multi-vector por token permiten una segunda fase de reordenación más precisa sobre los candidatos recuperados en la primera fase.
- Despliegue en entornos con RAM limitada: la variante ONNX int8 ocupa 0,95 GB y es entre 1,7 y 2,1 veces más rápida que fp32 en la benchmark de CPU del autor, con aproximadamente un 23 % menos de RAM, adecuada para servicios en contenedores pequeños.
- Búsqueda documental en vietnamita, japonés e inglés: según las mediciones del autor, estos idiomas quedan a la par de bge-m3 en sus pools, por lo que es una opción razonable cuando el corpus principal está en esos idiomas.
- Sistemas de recuperación en coreano o chino con tolerancia a pequeñas pérdidas: útil si se acepta una caída de en torno a un punto en recall@20 (coreano, modo `all`) o ligeramente superior en recuperación cross-lingual, a cambio de reducir el coste computacional.
- Clasificación y clustering de textos multilingües: los embeddings densos sirven como features para tareas downstream que no requieran generación.

## Benchmarks y rendimiento

Resultados del autor frente a bge-m3 (fp16, misma ruta de puntuación), celdas ALL de nivel 1, modo `all` (dense + sparse + ColBERT), recall@20 en porcentaje, profesor -> estudiante:

| Variante | vi | ja | en | zh | ko | Delta medio nivel 2 (all / dense) |
|---|---|---|---|---|---|---|
| gpu-fp16 | 94,6 -> 95,1 | 100 -> 100 | 98,9 -> 100 | 91,1 -> 90,2 | 89,9 -> 89,7 | -0,91 / -0,57 |
| cpu-fp32 (ONNX) | 94,6 -> 95,1 | 100 -> 100 | 98,9 -> 100 | 91,1 -> 90,4 | 89,9 -> 89,7 | -0,92 / -0,59 |
| cpu-int8-hlf (ONNX int8) | 94,6 -> 95,7 | 100 -> 100 | 98,9 -> 100 | 91,1 -> 90,4 | 89,9 -> 88,8 | -1,12 (por debajo del límite de -1,0) / -0,97 |
| Q8_0 GGUF | 94,6 -> 95,1 | 100 -> 100 | 98,9 -> 100 | 91,1 -> 90,4 | 89,9 -> 89,7 | -0,95 / -0,61 |

Medición: 4.631 consultas sobre 20 pools (unos 94.000 documentos), `max_len` 512. Nivel 1 = vi/ja/en/zh/ko (MIRACL, MKQA, MLDR y algunos pools de dominio internos); nivel 2 = ar/es/fr/hi/id/ru/th (MIRACL, MKQA, MLDR). El delta de nivel 2 se expresa en puntos de 100 x métrica (nDCG@10 para MIRACL/MLDR, recall@100 para MKQA). Las puntuaciones absolutas corresponden a los pools y al código de puntuación del autor y no son comparables con otros harnesses.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,8 GB de pesos (tamaño del artefacto `gpu-fp16`), más overhead de activaciones; cabe en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente. Para despliegues de alto throughput, A100 o H100 no son necesarias pero permitirían mayor paralelismo por lote.
- CPU: la variante ONNX int8 ocupa 0,95 GB y es entre 1,7 y 2,1 veces más rápida que fp32 según la benchmark del autor; la fp32 ocupa 1,56 GB.
- Despliegue: ONNX Runtime (CPU), llama.cpp con GGUF Q8_0 (0,44 GB), transformers con safetensors fp16 en GPU.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput más allá de la comparación relativa int8 vs fp32 en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BanhTrangPhoi-L20 | 388 M | 512 (evaluado) | 12 + multilingüe | MIT | Destilado de bge-m3, tres cabezas, variantes ONNX/GGUF |
| BAAI/bge-m3 | no disponible en la información | no disponible en la información | multilingüe | MIT | Modelo profesor; 24 capas, vocabulario de 250.002 tokens |
| Alternativas de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No supera la puerta de calidad de nivel 1 del autor frente a bge-m3: falla en 15 celdas, todas ellas de recuperación cross-lingual chino/coreano (MKQA, n = 250), recall@50 denso en coreano y recall@50 denso en vietnamita (delta -0,6 con intervalo de confianza amplio).
- La variante int8 falla el límite de nivel 2 en el modo `all` (-1,12 frente al límite de -1,0) y pierde aproximadamente 0,9 puntos de recall@20 en coreano respecto al estudiante fp16; el autor recomienda usar fp32 para coreano.
- No se ha medido nada más allá de 512 tokens, ni idiomas fuera de la lista declarada, ni dominios de recuperación ajenos a los pools del autor.
- Las puntuaciones absolutas no son comparables con las de otros harnesses de evaluación.
- Riesgo de alucinación no aplicable directamente al ser un modelo de embeddings, pero los vectores pueden producir recuperaciones erróneas en dominios no evaluados.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de calidad fuera de los escenarios medidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/EVOKA/BanhTrangPhoi-L20
- Repositorio GGUF: https://huggingface.co/EVOKA/BanhTrangPhoi-L20-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper de referencia citado en los tags: arxiv:2402.03216
