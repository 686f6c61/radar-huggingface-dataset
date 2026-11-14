# Hooshaai/bert-nha-attention-sst2

## Resumen

`Hooshaai/bert-nha-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `nha_attention` de la librería NeuralOps. El modelo se ha afinado y destilado para clasificación binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE, partiendo de `bert-base-uncased` como modelo profesor. Lo publica el autor Taha Majlesi bajo el identificador de organización Hooshaai.

La propuesta técnica es un ejercicio de "attention zoo": empaquetar únicamente los pesos de atención y la cabeza de clasificación (unos 55 MB en FP16, en `attention_weights.safetensors`), dejando que el código remoto reconstruya el resto del modelo base congelado desde `bert-base-uncased`. El objetivo declarado es reducir el coste de atención de O(N²) a un régimen subcuadrático O(N) u O(N log N), manteniendo la precisión de la tarea original.

Es relevante ahora porque ejemplifica una línea de trabajo creciente: la sustitución modular de mecanismos de atención en modelos preentrenados, con serialización eficiente de pesos y protocolos de destilación que evitan cargar el profesor en VRAM. No obstante, el alcance es limitado: es un modelo de clasificación de sentimiento en inglés, no un modelo generativo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `nha_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110 M (base BERT-Base); los pesos publicados son solo de atención y cabeza, ~55 MB en FP16 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) con código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza la atención multi-cabeza estándar por `nha_attention`, que el autor describe como de complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la MHA cuadrática. La serialización es modular: solo se publican los pesos de atención especializados y la cabeza de clasificación de tarea, mientras que los pesos del codificador base congelado se inicializan en tiempo de carga desde el repositorio original de `bert-base-uncased`.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", con dos etapas: primero una alineación de subespacio oculto y después una combinación de KL sobre logits y entropía cruzada de tarea. El profesor se cachea offline, de modo que no ocupa VRAM durante la destilación. Según la model card, el proceso se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 168 pasos de optimización, 48,4 segundos de duración, un throughput efectivo de 28 423,8 tokens/s y un pico de VRAM de 23 021 MB. Los datos de entrenamiento y evaluación son la tarea SST-2 de GLUE.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés.
- Clasificación de secuencias cortas y medianas, heredando el tokenizador y el vocabulario de `bert-base-uncased`.
- Inferencia estándar vía `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` o `load_surgeried_model`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documenta modo "thinking" ni multi-step reasoning.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica cada reseña como positiva o negativa; su tamaño (110 M) permite desplegarlo en CPU o GPU modesta para procesar lotes grandes.
- Moderación de comentarios en foros y redes: filtrado previo de toxicidad o polaridad negativa antes de la revisión humana, aprovechando la baja latencia de un clasificador BERT.
- Enrutamiento de tickets de soporte: clasificar la polaridad del mensaje del cliente para priorizar casos negativos hacia agentes humanos.
- Monitorización de opinión de marca: procesamiento por lotes de menciones en inglés para agregar sentimiento a lo largo del tiempo.
- Investigación sobre atención subcuadrática: servir como punto de comparación reproducible frente a BERT-Base estándar en SST-2, con pesos de atención aislados y licencia MIT.
- Integración en pipelines de Hugging Face: al exponer la interfaz estándar de `text-classification`, puede conectarse a `pipeline("text-classification")` y a servicios de inferencia compatibles con Transformers.
- Docencia y experimentación: ejemplo práctico de destilación con representaciones cacheadas y de sustitución modular de mecanismos de atención.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de SST-2 (872 muestras de clasificación binaria), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`nha_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,86 % | 92,66 % | +0,80 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2643 | no aplica |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo completo de 110 M de parámetros; los pesos publicados son solo ~55 MB en FP16, pero la carga reconstruye el BERT base completo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta entrenamiento en una RTX 3090 (24 GB), pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la API de NeuralOps (`neuralops.hub`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el código remoto propio probablemente limita su uso en esos motores.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta el throughput de entrenamiento (28 423,8 tokens/s) en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-nha-attention-sst2` | 110 M (base) | no disponible | 92,66 % | MIT | Hugging Face, código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (según la model card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `roberta-base` (ajustado a SST-2) | 125 M | 512 | no disponible en esta ficha | MIT | Hugging Face |

La comparación con DistilBERT y RoBERTa se ofrece como referencia de categoría (clasificadores BERT-like para SST-2); no se dispone de sus cifras exactas en la información proporcionada, por lo que no se comparan numéricamente.

## Limitaciones y advertencias

- Ámbito muy restringido: solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni un asistente.
- Dependencia de código remoto (`trust_remote_code=True`): ejecutar código del autor en producción implica un riesgo de seguridad y de mantenimiento; conviene auditar `modeling_neuralops_bert.py` antes de desplegarlo.
- La carga requiere descargar `bert-base-uncased` desde el Hub; el repositorio no es autocontenido.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas); no se documenta evaluación fuera de dominio.
- Sesgos: no se documenta ningún análisis de sesgo; BERT-Base hereda sesgos de su corpus de preentrenamiento (inglés, mayoritariamente web).
- Limitaciones de contexto: no se confirma la longitud máxima; se asume la de BERT-Base (512 tokens), pero no está verificado en la información.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el código remoto bajo la licencia del repositorio NeuralOps; conviene verificar la compatibilidad.
- Métricas reportadas por el propio autor, sin replicación independiente; el delta de +0,80 % sobre el profesor debe tomarse con cautela dado el tamaño reducido del conjunto de validación (872 muestras).
- El identificador del autor en la model card (`tahamajs`) difiere del de Hugging Face (`Hooshaai`); verificar el repositorio correcto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-nha-attention-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
