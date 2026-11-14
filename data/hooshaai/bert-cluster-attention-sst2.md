# Hooshaai/bert-cluster-attention-sst2

## Resumen

`bert-cluster-attention-sst2` es un checkpoint de `google-bert/bert-base-uncased` (110M parámetros) en el que el autor, Hooshaai (Taha Majlesi), ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `cluster_attention` de la librería NeuralOps. El modelo resultante mantiene la arquitectura base de BERT pero con una complejidad operativa subcuadrática, declarada como O(N) u O(N log N) frente al O(N²) de la multi-head attention estándar. El checkpoint se ha afinado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés).

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible destilar un mecanismo de atención alternativo sobre un backbone congelado sin pérdida de precisión en la tarea downstream. Según la model card, el estudiante con `cluster_attention` alcanza un 91,74 % de accuracy en SST-2, ligeramente por encima del 91,63 % del profesor `bert-base-uncased`. El proceso de destilación se ejecutó en una única RTX 3090 en 47,7 segundos y 194 pasos de optimización.

El repositorio sigue una especificación de serialización modular: solo se distribuyen los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, unos 55 MB), mientras que los pesos congelados del BERT base se inicializan en tiempo de carga desde el modelo original. Esto reduce el footprint de descarga, pero obliga a usar `trust_remote_code=True` y la librería `neuralops` para reconstruir el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atención `cluster_attention` subcuadrática en las 12 capas |
| Parametros totales | 110M (backbone BERT-base) + cabeza de clasificación; pesos distribuidos: ~55 MB en FP16 (solo atención y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens, pero la model card no lo especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) con código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110M de parámetros, y reemplaza en cada capa el bloque de multi-head attention estándar por `cluster_attention`, un mecanismo de la Attention Zoo de NeuralOps que agrupa tokens en clústeres para reducir el coste computacional a O(N) u O(N log N). El backbone base permanece congelado; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular en FP16.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps, con dos etapas: primero una alineación de representaciones ocultas en subespacio (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). El profesor se ejecuta offline y sus representaciones se cachean, de modo que no ocupa VRAM durante la destilación. La ejecución física se realizó en una NVIDIA GeForce RTX 3090 (24 GB), con un pico de 8.487 MB de VRAM, 194 pasos de optimización, 47,7 segundos de duración y un throughput efectivo de 33.306,8 tokens/s. El dataset de entrenamiento y evaluación es la tarea SST-2 de GLUE (clasificación binaria de sentimiento, split de validación de 872 muestras).

## Capacidades

- Clasificación de texto binaria (análisis de sentimiento positivo/negativo) sobre secuencias en inglés.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste para secuencias largas frente a la atención cuadrática estándar.
- Carga modular: reconstrucción del modelo completo a partir de los pesos de atención distribuidos más el backbone `bert-base-uncased` congelado.
- Compatibilidad con la API de Hugging Face Transformers mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Compatibilidad con la API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado solo en inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés en positivas o negativas con una accuracy reportada del 91,74 % en SST-2, adecuado para moderación o agregación de opiniones a escala.
- Clasificación de comentarios en redes sociales: permite etiquetar grandes volúmenes de texto corto en inglés para monitorización de marca o detección de toxicidad como señal auxiliar.
- Filtrado previo en pipelines de atención al cliente: como clasificador ligero de sentimiento para enrutar tickets hacia colas prioritarias antes de pasarlos a un modelo generativo mayor.
- Investigación en mecanismos de atención eficiente: sirve como checkpoint de referencia para comparar `cluster_attention` frente a atención cuadrática en tareas de clasificación, con métricas reproducibles sobre SST-2.
- Destilación y ajuste de mecanismos de atención alternativos: el protocolo de destilación con representaciones cacheadas y el código de NeuralOps permiten reutilizar el flujo para probar otros mecanismos de la Attention Zoo sobre BERT.
- Evaluación de despliegue modular de pesos: útil para experimentar con la serialización de solo atención y cabeza de clasificación, reduciendo el footprint de descarga a ~55 MB frente a los ~450 MB del backbone completo.
- Benchmark educativo o de validación de infraestructura: el entrenamiento completo en 47,7 s en una RTX 3090 lo hace adecuado para pruebas de pipelines de destilación en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`cluster_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 91,74 % | 91,74 % | +0,00 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2575 | convergido |

Telemetría de entrenamiento (clúster HPC Sharif, RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 47,7 s |
| Pasos de optimización | 194 |
| Throughput efectivo | 33.306,8 tokens/s |
| Pico de VRAM | 8.487 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de VRAM durante el entrenamiento fue de 8.487 MB en una RTX 3090, por lo que la inferencia debería caber holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU con al menos ~4-8 GB de VRAM; el autor validó el flujo en una NVIDIA GeForce RTX 3090 (24 GB, Ampere).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no se han publicado mediciones específicas de inferencia por GPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, librería NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se reporta throughput de entrenamiento (33.306,8 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-cluster-attention-sst2` | 110M (backbone) + cabeza; ~55 MB distribuidos | no disponible | 91,74 % | MIT | Hugging Face, requiere `neuralops` y código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % (según la model card) | Apache 2.0 | Hugging Face, Transformers estándar |
| Otros mecanismos de la Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (según repositorio) | Hugging Face / GitHub NeuralOps |

No se dispone de datos de benchmarks ni especificaciones de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no es un modelo generativo ni sirve para tareas fuera de SST-2 sin reentrenamiento.
- Solo se distribuyen los pesos de atención y la cabeza de clasificación (~55 MB); es imprescindible descargar `bert-base-uncased` y ejecutar código remoto (`trust_remote_code=True`), lo que introduce riesgos de seguridad y dependencias adicionales.
- Requiere la librería `neuralops` para la carga de alto nivel; no se documenta compatibilidad con motores de inferencia estándar como vLLM, TGI o llama.cpp.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento (SST-2 son reseñas de películas); no se han publicado evaluaciones de robustez fuera de dominio.
- Sesgos conocidos: no se documentan en la model card; el backbone BERT-base-uncased arrastra los sesgos de su corpus de preentrenamiento (texto web en inglés).
- Limitaciones de contexto: no se especifica la longitud máxima soportada por el mecanismo `cluster_attention`; el backbone BERT-base está limitado a 512 tokens.
- El rendimiento reportado (91,74 %) procede de un único split de validación de 872 muestras; la diferencia de +0,11 puntos frente al profesor está dentro del ruido estadístico y no debe interpretarse como una mejora sólida.
- Licencia MIT: permite uso comercial, pero el código remoto y las dependencias de NeuralOps deben auditarse antes de desplegar en producción.
- Repositorio con 81 descargas y 0 likes en el momento de la consulta; ecosistema y mantenimiento de la librería NeuralOps no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-cluster-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
