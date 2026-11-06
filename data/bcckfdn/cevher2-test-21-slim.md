# bcckfdn/cevher2-test-21-slim

## Resumen

cevher2-test-21-slim es un modelo de lenguaje de tipo decoder-only derivado de `bcckfdn/cevher2-test-21` mediante una técnica de "cirugía" (pruning estructurado) que reduce el tamaño del modelo original de 1514M a 1238M parámetros. El modelo está construido sobre la arquitectura SmolLM2 (familia Llama) y está orientado a generación de texto conversacional en turco e inglés. Lo desarrolla el usuario de Hugging Face `bcckfdn` y se publica bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque de compresión: en lugar de un recorte arbitrario, aplica importancia de neuronas basada en datos de calibración (estilo Wanda/FLAP) para reducir el `intermediate_size` de 6144 a 4766, y modifica el ratio de GQA fusionando cabezas KV mediante mean-pooling (receta de uptraining de Ainslie et al. 2023), seguido de un continued-pretraining de 400,10M tokens. El resultado es un modelo un 18% más pequeño con una pérdida de calibración prácticamente idéntica (2.5055 frente a 2.5141 del modelo fuente).

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para experimentación con técnicas de pruning y para despliegue en entornos con recursos limitados donde el turco sea un idioma relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama / SmolLM2) con GQA |
| Parametros totales | 1.238.273.792 (1,24B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; existen GGUF de modelos hermanos de la familia, no de este ID) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, con atención de consultas agrupadas (GQA). Respecto al modelo fuente `cevher2-test-21`, se aplicaron dos modificaciones estructurales: (1) reducción del `intermediate_size` de las capas MLP de 6144 a 4766 mediante eliminación de neuronas de baja importancia, puntuadas con una heurística tipo Wanda/FLAP que combina la magnitud de activación con la norma de las columnas de `down_proj`, usando datos de calibración; y (2) reducción de `num_key_value_heads` de 7 a 4, fusionando las cabezas KV mediante mean-pooling siguiendo la receta de uptraining de Ainslie et al. (2023).

Tras la cirugía, el modelo se adaptó con un continued-pretraining de 400,10M tokens. La pérdida de calibración pasó de 2.5141 (modelo fuente) a 2.5055 (modelo podado), lo que indica que la compresión no degradó la métrica de calibración reportada por el autor. No se dispone de información sobre la composición del dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en turco e inglés.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base SmolLM2.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a turco e inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repo.

## Casos de uso

- Experimentación con pruning estructurado: sirve como referencia reproducible para evaluar el impacto de reducir `intermediate_size` y cabezas KV en un modelo de ~1,5B, comparando la pérdida de calibración reportada (2.5055 frente a 2.5141).
- Despliegue en entornos con VRAM limitada: con 1,24B parámetros, el modelo en fp16 ocupa aproximadamente 2,5 GB, lo que permite inferencia en GPUs de consumo medio y en CPU con cuantización.
- Generación de texto en turco para prototipos: adecuado para aplicaciones de chat o completado en turco donde no se requiera un modelo de gran escala.
- Fine-tuning ligero (LoRA/QLoRA): su tamaño reducido facilita el ajuste en una sola GPU consumer para tareas específicas de dominio en turco o inglés.
- Evaluación comparativa de técnicas de compresión: útil como baseline en estudios sobre GQA uptraining y poda de MLP.
- Investigación académica sobre eficiencia: permite medir el equilibrio entre reducción de parámetros (18%) y calidad en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de calibración (2.5141 en el modelo fuente frente a 2.5055 en el modelo podado); no hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y KV cache (dependiente de la longitud de contexto, no documentada).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,3 GB; en 4 bits: aproximadamente 0,7 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100; el modelo cabe holgadamente en cualquier GPU consumer con 8 GB o más en fp16.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 8 GB o más.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp (este último requeriría conversión a GGUF, no incluida en este repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cevher2-test-21-slim | 1,24B | no disponible | Apache 2.0 | Hugging Face (repo del autor) |
| cevher2-test-21 (fuente) | 1,51B | no disponible | Apache 2.0 | Hugging Face (repo del autor) |
| SmolLM2 (familia base) | ~1,7B (variante 1.7B) | no disponible en la informacion | Apache 2.0 | Hugging Face (HuggingFaceTB) |
| cevher2-test-2-GGUF | no disponible | no disponible | Apache 2.0 | Hugging Face (repo del autor) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no ha sido validado por la comunidad ni sometido a evaluaciones independientes.
- Riesgo de alucinación inherente a modelos de ~1,2B parámetros; no se documentan mitigaciones.
- Sesgos conocidos: no documentados por el autor; el entrenamiento en turco e inglés puede introducir sesgos culturales y lingüísticos no evaluados.
- Limitaciones de contexto: la longitud de contexto no está especificada en la model card.
- El pruning puede degradar capacidades específicas (razonamiento, código, matemáticas) de forma no uniforme; la pérdida de calibración reportada no garantiza preservación de todas las habilidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El proceso de fusión de cabezas KV mediante mean-pooling puede afectar a la calidad en tareas que requieran atención fina a múltiples posiciones.
- No hay información sobre el dataset de continued-pretraining, lo que impide evaluar riesgos de contaminación o de sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-21-slim
- Modelo fuente (referenciado en la model card): https://huggingface.co/bcckfdn/cevher2-test-21
- GGUF de la familia: https://huggingface.co/bcckfdn/cevher2-test-2-GGUF
- Cuantizaciones de la familia: https://huggingface.co/models?other=base_model%3Aquantized%3Abcckfdn%2Fcevher-test-2
