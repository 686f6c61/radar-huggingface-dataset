# nicolasembleton/gliner2.5-small-v1-onnx

## Resumen

gliner2.5-small-v1-onnx es una exportación a formato ONNX del modelo GLiNER 2.5 Small V1 (identificado como `fastino/gliner2.5-small-v1`), preparada por nicolasembleton para su ejecución con onnxruntime y WebGPU en navegadores. GLiNER 2.5 es una evolución del framework GLiNER que abandona la enumeración de spans candidatos y predice directamente los límites de las entidades mediante logits de inicio y fin, lo que permite un escalado lineal con la longitud del documento y soporta entidades de longitud ilimitada.

El modelo resuelve el problema de la extracción de información (NER, extracción de relaciones, clasificación restringida) en documentos largos con un coste computacional reducido: tan solo 74 millones de parámetros, lo que permite su ejecución en CPU y hardware de consumo sin necesidad de GPU. Su relevancia actual radica en que ofrece capacidades zero-shot comparables a modelos de lenguaje de gran tamaño (LLM) con un coste de inferencia muy inferior, y esta variante ONNX facilita su despliegue en entornos web y de bajo consumo.

La exportación ONNX no es un grafo estándar de `AutoExtractor`: el archivo ejecuta el encoder DeBERTa sobre los `input_ids`, realiza la recolección de estados de palabras y de marcadores de consulta, y produce los logits de límites de inicio y fin. El empaquetado de esquemas (marcadores de tipo de entidad) y la decodificación de spans se mantienen en el lado del host, siguiendo el mismo reparto que GLiNER.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DeBERTa + predicción de límites (boundary) con logits de inicio/fin |
| Parametros totales | 74 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `onnx/model.onnx`) |

## Arquitectura y entrenamiento

GLiNER 2.5 reemplaza la enumeración de spans candidatos por una arquitectura de predicción de límites (boundary prediction). El encoder es un DeBERTa que procesa los `input_ids` empaquetados; posteriormente se recogen los estados de las palabras (`text_word_indices`) y los estados de los marcadores de consulta (`query_marker_indices`), y una cabeza de clasificación produce los logits de inicio y fin para cada tipo de entidad consultado. Este diseño permite una complejidad lineal respecto a la longitud del documento, en lugar del coste cuadrático de enumerar todos los spans posibles.

El modelo base `fastino/gliner2.5-small-v1` es el resultado del entrenamiento de la familia GLiNER2, que extiende la arquitectura original de GLiNER para soportar extracción de información multi-tarea mediante una interfaz basada en esquemas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La exportación ONNX se realiza sobre el checkpoint del `BoundaryExtractor` y no incluye el esquema de empaquetado ni la decodificación de spans, que se dejan en el host.

## Capacidades

- Extracción de información zero-shot: reconoce entidades de tipos no vistos durante el entrenamiento a partir de una descripción textual del tipo.
- Predicción de límites de entidad: genera logits de inicio y fin directamente, sin enumerar spans candidatos.
- Extracción de relaciones: soporta la extracción conjunta de entidades y relaciones entre ellas en una sola pasada.
- Clasificación restringida: permite clasificar tokens dentro de un conjunto de categorías predefinidas.
- Atributos de span: puede extraer atributos asociados a las entidades detectadas.
- Contexto largo: el diseño lineal permite procesar documentos largos en una sola pasada.
- Ejecución sin GPU: funciona en CPU y en WebGPU en navegadores, gracias al export ONNX.
- Soporte de tool calling y agentes: no disponible (es un modelo de extracción de información, no un LLM conversacional).

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar nombres de partes, fechas, montos y cláusulas en contratos largos, gracias a su capacidad de procesar contexto extendido con escalado lineal.
- Análisis de historias clínicas: extracción de entidades como medicamentos, diagnósticos y síntomas en informes médicos, con tipos definidos dinámicamente por el usuario.
- Procesamiento de artículos científicos: detección de términos técnicos, autores, instituciones y referencias en papers de varias páginas.
- Monitoreo de noticias: extracción de entidades nombradas (personas, organizaciones, lugares) en flujos de noticias con un coste computacional bajo, apto para despliegue en servidores con CPU.
- Enriquecimiento de datos para búsqueda: extracción de entidades para construir índices de búsqueda semántica o bases de conocimiento a partir de documentos corporativos.
- Aplicaciones web en el navegador: gracias al export ONNX y a WebGPU, se puede ejecutar la extracción de entidades directamente en el cliente, sin enviar datos al servidor.
- Sistemas de extracción de información en tiempo real: por su tamaño reducido, puede integrarse en pipelines de streaming con baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo indica que GLiNER2.5 tiene un rendimiento competitivo con LLMs de tamaño mucho mayor, pero no se ofrecen cifras concretas (MMLU, HumanEval, GSM8K, etc.) en las fuentes revisadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (74M parámetros × 4 bytes), sin cuantización declarada.
- GPU recomendada: no requiere GPU; puede ejecutarse en CPU. Para WebGPU, cualquier GPU compatible con WebGPU en el navegador (por ejemplo, integradas o discretas modernas).
- Compatibilidad con hardware de consumo: sí, es el objetivo del modelo; funciona en CPUs y GPUs de gama media.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web con execution provider WebGPU o WASM como alternativa, y cualquier framework que cargue ONNX.
- Latencia y throughput: no disponible; no se han publicado mediciones específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gliner2.5-small-v1-onnx (este) | 74M | no disponible | Apache-2.0 | Export ONNX para WebGPU/CPU |
| fastino/gliner2.5-small-v1 | 74M | no disponible | Apache-2.0 | Modelo base original, sin export ONNX |
| GLiNER (original, urchade/GLiNER) | ~1,5B (modelo grande) o 148M (small) | no disponible | Apache-2.0 | Framework NER zero-shot con enumeración de spans |

La comparativa con LLMs generales para NER (por ejemplo, Llama 3.1 8B o GPT-4o) no se ha cuantificado en la información disponible, pero GLiNER2.5 está diseñado para ser más pequeño y rápido que dichos modelos en tareas de extracción de información.

## Limitaciones y advertencias

- El export ONNX no es un grafo completo de `AutoExtractor`: requiere que el empaquetado de esquemas y la decodificación de spans se realicen en el host (el mismo reparto que GLiNER.js).
- Los inputs deben ser de tipo `int64`; algunos navegadores pueden necesitar el backend WASM como alternativa a WebGPU.
- No se ha declarado la longitud de contexto soportada; se debe validar con el modelo base antes de producción.
- Idiomas soportados: no disponibles; el modelo puede no funcionar bien en idiomas no cubiertos por el entrenamiento.
- No se han publicado benchmarks; el rendimiento en tareas específicas debe evaluarse con datos propios.
- No es un LLM conversacional: no genera texto libre, solo produce logits de límites de entidades.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la procedencia del modelo base y sus dependencias.

## Enlaces

- [Modelo en Hugging Face: nicolasembleton/gliner2.5-small-v1-onnx](https://huggingface.co/nicolasembleton/gliner2.5-small-v1-onnx)
- [Modelo base: fastino/gliner2.5-small-v1](https://huggingface.co/fastino/gliner2.5-small-v1)
- [Colección GLiNER2 de fastino](https://huggingface.co/collections/fastino/gliner2-family)
- [Documentación de Fastino Labs sobre GLiNER2.5](https://fastino.ai/models/gliner2-5)
- [Repositorio oficial de GLiNER](https://github.com/urchade/GLiNER)
