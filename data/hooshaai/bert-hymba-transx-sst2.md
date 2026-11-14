# Hooshaai/bert-hymba-transx-sst2

## Resumen

`Hooshaai/bert-hymba-transx-sst2` es un checkpoint de clasificación de texto derivado de `bert-base-uncased` en el que el autor ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `hymba_transx` de la librería NeuralOps. El modelo se ha destilado y afinado sobre la tarea SST-2 del benchmark GLUE (análisis de sentimiento binario en inglés) y se distribuye como un conjunto de pesos de atención en FP16 de aproximadamente 55 MB, más una cabeza de clasificación, que se aplican sobre los pesos base congelados de BERT-Base.

La propuesta técnica es la sustitución de la atención cuadrática O(N²) por una variante subcuadrática (O(N) u O(N log N) según el autor) manteniendo el resto de la arquitectura BERT intacta. El interés práctico está en la reducción del coste computacional en secuencias largas y en el protocolo de destilación "Cached Representation Distillation" que el autor describe como libre de asignación de VRAM para el profesor, ejecutado íntegramente en una RTX 3090.

El modelo es de nicho: no es un modelo generativo ni un LLM, sino un clasificador binario de sentimiento en inglés con un pipeline `text-classification`. Su relevancia es fundamentalmente experimental, como demostración de la integración de mecanismos de atención alternativos en BERT mediante la librería NeuralOps y de un flujo de destilación de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `hymba_transx` (subcuadrática) en las 12 capas |
| Parametros totales | ~110 M (BERT-Base); pesos publicados de atención + cabeza: ~55 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 para los pesos de atención (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16) + shim de código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M de parámetros) y reemplaza la atención multi-cabeza softmax estándar por el mecanismo `hymba_transx` de NeuralOps en todas las capas. Según la model card, este mecanismo reduce la complejidad efectiva de O(N²) a O(N) u O(N log N). El resto de componentes (embeddings, feed-forward, normalización) se mantienen congelados y se cargan desde el checkpoint original de BERT-Base en tiempo de ejecución, de modo que el repositorio solo almacena los parámetros de atención entrenados y la cabeza de clasificación.

El entrenamiento se realizó con el protocolo "NeuralOps Cached Representation Distillation" en dos etapas: primero una alineación de representaciones ocultas en subespacio y después una combinación de KL sobre logits del profesor y entropía cruzada sobre la tarea. El autor reporta 124 pasos de optimización, 50,4 segundos de entrenamiento, un throughput de 20.144,7 tokens/s y un pico de VRAM de 11.964 MB en una RTX 3090 (24 GB). El profesor es `bert-base-uncased` y el conjunto de evaluación es la partición de validación de SST-2 (872 muestras). No se documentan detalles sobre el corpus de entrenamiento más allá de GLUE/SST-2 ni sobre el uso de RLHF/DPO (no aplicable a un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre texto de entrada.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste en secuencias largas frente a BERT-Base estándar.
- Carga modular: los pesos de atención se aplican dinámicamente sobre `bert-base-uncased` congelado.
- Integración con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) además de `transformers` con `trust_remote_code=True`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modos de razonamiento extendido.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su tamaño reducido y su latencia baja lo hacen apto para procesar lotes grandes en CPU o GPU modesta.
- Moderación de comentarios en foros en inglés: filtrado previo de toxicidad o polaridad negativa como señal auxiliar en un pipeline de moderación, combinado con otros clasificadores.
- Enrutamiento de tickets de soporte: clasificación rápida de la polaridad del mensaje del cliente para priorizar casos negativos antes de la atención humana.
- Investigación sobre atención subcuadrática: banco de pruebas para comparar `hymba_transx` frente a atención softmax estándar en una tarea GLUE concreta, con métricas reproducibles (accuracy y cross-entropy de validación).
- Destilación de bajo coste: ejemplo reproducible de un flujo de destilación con caché offline de representaciones del profesor, útil para equipos con una sola GPU consumer.
- Monitorización de opinión en redes sociales en inglés: clasificación por lotes de menciones o tuits para agregar tendencia de sentimiento a escala moderada.
- Evaluación comparativa de mecanismos de atención: integración en pipelines de benchmarking de NeuralOps para medir el impacto de la sustitución de atención en accuracy y coste.

## Benchmarks y rendimiento

Resultados reportados por el autor en la partición de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`hymba_transx`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,40 % | 92,09 % | +0,69 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,2843 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: los pesos publicados ocupan ~55 MB, pero el modelo completo requiere cargar `bert-base-uncased` (~440 MB en FP32, ~220 MB en FP16), por lo que el consumo total ronda 0,5–1 GB en FP32 incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.).
- Cabe en CPU: sí, con latencia aceptable para clasificación de secuencias cortas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 20.144,7 tokens/s durante el entrenamiento en una RTX 3090; no se publican mediciones de latencia de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-hymba-transx-sst2` | ~110 M (atención + cabeza ~55 MB) | no disponible | 92,09 % (reportado por el autor) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned en SST-2 | 125 M | 514 | no disponible en esta ficha | MIT | Hugging Face |

La comparativa se limita a arquitecturas BERT-like de tamaño similar para clasificación de sentimiento; no se dispone de datos de benchmarks verificados de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo clasifica sentimiento binario en inglés; no es un modelo generativo ni un asistente.
- Resultados no verificados de forma independiente: las métricas provienen únicamente de la model card del autor.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad que debe auditarse antes de usarlo en producción.
- Dependencia de la librería NeuralOps y de su API; la compatibilidad futura con versiones de `transformers` no está garantizada.
- Sesgos heredados de `bert-base-uncased` y del corpus de entrenamiento, no documentados.
- Riesgo de alucinación no aplicable (clasificador), pero sí de clasificaciones erróneas en dominios distintos de SST-2 (por ejemplo, sarcasmo, dominios técnicos o texto muy largo).
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en el producto final.
- No se documentan límites de longitud de secuencia ni comportamiento con entradas superiores a 512 tokens.
- Fecha de creación (2026-11-09) y autoría (`Hooshaai` en Hugging Face, `tahamajs` en el código de ejemplo) presentan discrepancias en la model card que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-hymba-transx-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
