# moeshawky/RockAndEgg-313M

## Resumen

RockAndEgg-313M es un derivado compacto de Qwen/Qwen3-0.6B-Base publicado por el usuario moeshawky en HuggingFace. No se trata de un modelo entrenado desde cero, sino del resultado de una operación de cirugía de modelo (model surgery) basada en truncado de profundidad: conserva las 10 primeras capas del transformer original de 28 y descarta las 18 restantes. El resultado es un backbone Qwen3 de 312.892.928 parámetros que mantiene intactas la anchura oculta, la anchura de la FFN, la topología de atención, el tokenizador y el vocabulario del donante.

El modelo se distribuye sin cabeza de clasificación (headless), como un Qwen3Model puro, y está orientado a extracción de características, clasificación, regresión y ranking tras un fine-tuning específico de la tarea. La ausencia de cabeza es deliberada: el autor argumenta que una cabeza genérica sin semántica de tarea no aporta funcionalidad real al usuario.

Su relevancia es doble. Por un lado, ofrece un backbone causal ligero para experimentar con representaciones derivadas de decodificadores causales frente a clasificadores de la familia BERT/DeBERTa. Por otro, reduce un 64,3 % la profundidad y aproximadamente un 47,5 % los parámetros del donante, lo que abarata el coste de inferencia y permite desplegarlo en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (Qwen3) con GQA, profundidad truncada a 10 capas |
| Parámetros totales | 312.892.928 (≈312,9 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; se hereda la configuración del donante) |
| Tipos de cuantización | No se publican pesos cuantizados. Compatible con cuantización estándar (BF16, FP16, INT8, INT4) mediante herramientas habituales; no hay artefactos GGUF oficiales |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |
| Modelo base | Qwen/Qwen3-0.6B-Base (revisión da87bfb608c14b7cf20ba1ce41287e8de496c0cd) |
| Capas del transformer | 10 (capas 0-9 de las 28 originales) |
| Hidden size | 1024 |
| FFN / intermediate size | 3072 |
| Cabezas de consulta (query) | 16 |
| Cabezas KV | 8 |
| Dimensión por cabeza | 128 |
| Vocabulario | 151.936 (tokenizador Qwen3 sin modificar) |
| Reducción de profundidad | 64,3 % |
| Reducción de parámetros | ≈47,5 % |
| Pipeline declarado | feature-extraction (también etiquetado para classification y sequence-classification) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-20 |
| Última actualización (metadatos HF) | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B-Base con truncado físico de profundidad: se eliminan las capas 10 a 27 y se conservan las capas 0 a 9, junto con los embeddings de entrada y la proyección de salida. No hay destilación, no hay reducción de anchura, no hay cirugía sobre el tokenizador y no se convierte la atención causal en bidireccional. Se mantiene GQA (16 cabezas de consulta, 8 cabezas KV, dimensión 128) y una anchura oculta de 1024 con FFN de 3072, sobre un vocabulario de 151.936 tokens. El modelo resultante es un Qwen3Model sin cabeza, con pesos compatibles con BF16.

No se documenta ningún proceso de entrenamiento, fine-tuning, RLHF o DPO asociado a esta release: la model card describe únicamente la operación de truncado sobre pesos preentrenados del donante. Tampoco se especifican los datos de entrenamiento originales de Qwen3-0.6B-Base, el número de tokens vistos ni la composición del dataset, por lo que esos datos deben consultarse en la documentación del modelo donante. La innovación destacable es metodológica: demuestra que es posible obtener un backbone causal de ~313 M reutilizando directamente un subconjunto de capas de un modelo mayor, sin reentrenamiento, como punto de partida para tareas discriminativas. El autor menciona además que Saa-313M, una especialización de 8 dimensiones desarrollada por LLMOSafe a partir de esta arquitectura, es un modelo downstream independiente y no está incluida en este repositorio.

## Capacidades

- Extracción de representaciones: genera hidden states a partir de texto, pensados para alimentar cabezas de clasificación, regresión o ranking definidas por el usuario.
- Clasificación de texto: soporta clasificación monoetiqueta y multietiqueta mediante AutoModelForSequenceClassification, con inicialización de una cabeza nueva que debe entrenarse.
- Regresión y scoring: admite num_labels=1 para tareas de puntuación continua, así como ranking o reranking.
- Sin cabeza preentrenada: el modelo se entrega headless, de modo que el espacio de etiquetas y la semántica de decisión los define el usuario.
- Compatibilidad con text-embeddings-inference: el repositorio está etiquetado como endpoints_compatible, lo que facilita su despliegue como servicio de embeddings.
- Atención causal preservada: mantiene el mecanismo de atención causal de Qwen3, lo que habilita su uso como decodificador, aunque no se documentan ni garantizan capacidades de generación conversacional o instruccional.
- Capacidades multilingües: no disponibles (no documentadas; dependen del tokenizador y los pesos heredados de Qwen3-0.6B-Base).
- Tool calling / function calling: no disponible (no documentado ni esperable en un backbone base truncado sin ajuste instruccional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; puede utilizarse como componente auxiliar de enrutado o clasificación dentro de un pipeline de agentes.
- Modo thinking o vision/audio: no disponible.

## Casos de uso

- Clasificación multietiqueta de tickets de soporte: se entrena una cabeza con tantas salidas como categorías (facturación, incidencia técnica, cancelación, etc.) usando un objetivo de entropía cruzada binaria independiente por etiqueta, aprovechando el backbone para obtener representaciones contextuales del texto completo.
- Análisis de sentimiento y clasificación de reseñas: fine-tuning con una cabeza lineal sobre las representaciones del penúltimo estado, útil en volúmenes altos donde el coste por inferencia importa más que la precisión marginal de un modelo mayor.
- Scoring de calidad o regresión: con problem_type de regresión y num_labels=1 se puede predecir una puntuación continua (por ejemplo, calidad de una respuesta o probabilidad de conversión) en lugar de una clase discreta.
- Embeddings para búsqueda semántica y reranking: al exponer el hidden state del backbone, puede utilizarse como codificador en un pipeline de recuperación seguido de un reranker entrenado sobre las mismas representaciones.
- Moderación y clasificación de seguridad: el linaje declarado (Saa-313M, especialización de 8 dimensiones) sugiere su uso como base para clasificadores de riesgo o seguridad, entrenando la cabeza con un esquema multietiqueta sobre taxonomías propias.
- Enrutado de intenciones en pipelines de LLM: un clasificador ligero sobre este backbone puede decidir qué modelo o herramienta invoca un orquestador, reduciendo el coste frente a consultar un modelo generativo grande para cada petición.
- Clasificación de documentos en entornos con recursos limitados: con 312,9 M de parámetros y pesos BF16 de aproximadamente 0,63 GB, es viable en CPU o en GPUs de gama baja para lotes moderados.
- Investigación comparativa de representaciones: sirve como línea base para estudiar si las representaciones de un decodificador causal truncado compiten con las de encoders bidireccionales tipo BERT o DeBERTa en tareas discriminativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GLUE, HumanEval, GSM8K ni de ninguna otra suite, y la búsqueda web realizada no devolvió resultados relevantes (únicamente páginas de inicio de sesión de Google). Tampoco hay comparación publicada entre este backbone truncado y el modelo donante que cuantifique la pérdida de calidad asociada al recorte de 28 a 10 capas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,63 GB de pesos en BF16/FP16, 1,25 GB en FP32, ~0,31 GB en INT8 y ~0,16 GB en INT4, calculados a partir de los 312.892.928 parámetros y sin contar activaciones, caché KV ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en BF16; resulta holgado en RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es demasiado pequeño para aprovechar el paralelismo de GPU de gama alta en inferencia individual.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en iGPU con memoria compartida si se usa cuantización.
- Ejecución en CPU: viable para lotes pequeños o moderados dado el tamaño del modelo.
- Opciones de despliegue: transformers (AutoModel / AutoModelForSequenceClassification), text-embeddings-inference (etiqueta endpoints_compatible del repositorio). El uso con vLLM, llama.cpp, Ollama o TGI no está documentado por el autor y no se publican pesos GGUF oficiales; requeriría conversión previa por parte del usuario.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

Los datos de parámetros, capas, contexto y licencia de los modelos de terceros proceden de su documentación pública; no hay resultados de rendimiento comparables porque este modelo no publica benchmarks.

| Modelo | Parámetros | Capas | Tipo de atención | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| RockAndEgg-313M | ≈312,9 M | 10 | Causal GQA | No disponible | Apache-2.0 | No disponible |
| Qwen/Qwen3-0.6B-Base (donante) | 596,1 M | 28 | Causal GQA | No disponible en esta ficha | Apache-2.0 | No disponible |
| BERT-base | ≈110 M | 12 | Bidireccional | 512 tokens | Apache-2.0 | No disponible |
| DeBERTa-v3-base | ≈184 M | 12 | Bidireccional (atención disentangled) | 512 tokens | MIT | No disponible |

Diferencias estructurales relevantes: frente a BERT-base y DeBERTa-v3-base, RockAndEgg conserva atención causal en lugar de bidireccional, lo que puede penalizar tareas discriminativas en las que el contexto a la derecha del token es informativo, pero también lo hace reutilizable como decodificador. Frente a su donante, reduce parámetros y profundidad, con una pérdida de capacidad que el autor no cuantifica.

## Limitaciones y advertencias

- No es un clasificador entrenado: se entrega sin cabeza, por lo que no produce predicciones con semántica hasta que el usuario entrene una cabeza específica. Las advertencias de pesos recién inicializados al cargarlo con AutoModelForSequenceClassification son esperadas.
- Sin datos de entrenamiento documentados: no se especifican dataset, número de tokens, composición ni procesos de alineación (RLHF/DPO) asociados a esta release ni al donante en la información disponible.
- Sesgos: al derivar de Qwen3-0.6B-Base, hereda los sesgos presentes en los datos de preentrenamiento del donante, que no están documentados en esta ficha.
- Riesgo de alucinación: si se utiliza como generador de texto, las 18 capas eliminadas y la ausencia de ajuste instruccional hacen previsible un deterioro severo de la coherencia y un aumento del riesgo de contenido inventado. No se recomienda su uso generativo sin evaluación previa.
- Impacto no cuantificado del truncado: el autor no publica ninguna evaluación del efecto de pasar de 28 a 10 capas sobre la calidad de las representaciones.
- Atención causal: este release no convierte Qwen3 en un encoder bidireccional, por lo que puede ser subóptimo en tareas de clasificación donde los clasificadores bidireccionales suelen tener ventaja.
- Contexto e idiomas no documentados: no se especifica la longitud de contexto soportada ni la cobertura idiomática, lo que obliga a verificar ambos extremos antes de usarlo en producción.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes, sin evidencia externa de reproducibilidad o calidad.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo es un derivado independiente y no está afiliado ni respaldado por Qwen ni Alibaba; conviene mantener la atribución al donante y conservar los avisos de licencia.
- Documentación incompleta: la model card disponible aparece truncada en la sección de regresión, por lo que pueden faltar instrucciones de uso y detalles de entrenamiento.
- Artefactos de despliegue: no hay pesos GGUF ni cuantizaciones oficiales publicadas, lo que limita el despliegue directo en runtimes orientados a llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moeshawky/RockAndEgg-313M
- Modelo base (donante): https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Revisión concreta del donante usada en la cirugía: https://huggingface.co/Qwen/Qwen3-0.6B-Base/tree/da87bfb608c14b7cf20ba1ce41287e8de496c0cd
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3

No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada; los resultados devueltos correspondían a páginas de inicio de sesión de Google, sin relación con el modelo.
