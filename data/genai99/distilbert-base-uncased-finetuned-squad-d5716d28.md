# GenAI99/distilbert-base-uncased-finetuned-squad-d5716d28

## Resumen

DistilBERT fine-tuned para question answering extractivo sobre SQuAD v1.1, publicado por el usuario GenAI99 en Hugging Face. Se trata de una reproducción del modelo "DistilBERT (D)" descrito en la tabla 2 del artículo original de DistilBERT (Sanh et al., 2019), en el que se aplica una segunda etapa de destilación específica de tarea: un DistilBERT student se ajusta sobre SQuAD v1.1 usando como teacher un BERT-base también ajustado sobre SQuAD v1.1 (`lewtun/bert-base-uncased-finetuned-squad-v1`).

El modelo resuelve la tarea de extracción de respuestas a partir de un contexto: recibe una pregunta y un pasaje, y devuelve el span de texto que responde a la pregunta. Es relevante como referencia ligera (66 M de parámetros, ~0,3 GB de pesos) para sistemas de QA extractivo con requisitos de latencia y memoria bajos, y como ejemplo canónico de destilación en dos fases.

La ficha se basa únicamente en la información disponible en la model card y en el artículo referenciado. No hay datos publicados sobre sesgos, composición detallada del dataset de entrenamiento ni evaluación más allá de Exact Match y F1 sobre SQuAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, derivado de BERT-base por destilación |
| Parametros totales | 66 millones (DistilBERT-base, valor de referencia del artículo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT/DistilBERT; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto; compatible con cuantización dinámica de PyTorch, no documentado por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin` / safetensors según repo; el autor declara `pytorch`); repo de 0,3 GB |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT-base (12 capas, 110 M de parámetros). El student conserva la arquitectura de BERT pero reduce el número de capas a la mitad, manteniendo el tamaño de hidden (768) y la dimensionalidad de las representaciones. En esta versión concreta se aplica una segunda fase de destilación específica de tarea: el student `distilbert-base-uncased` se ajusta sobre SQuAD v1.1 con un teacher BERT-base también ajustado sobre SQuAD v1.1, de modo que la señal de supervisión combina las etiquetas gold del dataset con las distribuciones de salida del teacher.

El entrenamiento se realiza sobre SQuAD v1.1, obtenible vía `datasets.load_dataset('squad')`. La model card no detalla hiperparámetros, número de épocas, tamaño de batch, función de pérdida exacta ni composición del dataset más allá de la referencia a SQuAD v1.1. El artículo original de DistilBERT describe el uso de triple pérdida (destilación, MLM y similitud coseno entre estados ocultos) en la fase general, pero la model card no confirma qué componentes se aplicaron en esta reproducción concreta.

## Capacidades

- Question answering extractivo: dado un contexto y una pregunta en inglés, devuelve el span de texto que responde.
- Comprensión lectora sobre pasajes: adecuado para tareas tipo SQuAD, TriviaQA (formato extractivo) y QA sobre documentos.
- Inferencia ligera: 66 M de parámetros permiten ejecución en CPU con latencia baja.
- Multilingüe: no; solo inglés.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y razonamiento multi-paso: no soportado; es un modelo de QA de un solo paso.
- Generación libre de texto: no es su función; está especializado en extracción de spans.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- QA extractivo sobre documentación técnica: indexar manuales en inglés y usar el modelo para localizar el fragmento que responde a una consulta, con coste de inferencia mínimo en CPU.
- Búsqueda de respuestas en bases de conocimiento internas: combinar recuperación (BM25 o embeddings) con este modelo como reranker extractivo para devolver el span exacto.
- Asistentes de soporte de primer nivel: responder preguntas frecuentes extrayendo la respuesta de una FAQ en inglés, con latencia inferior a 50 ms en CPU para contextos de hasta 512 tokens.
- Extracción de entidades y datos en pipelines ETL: localizar valores concretos (fechas, nombres, cifras) en documentos estructurados semiestructurados en inglés.
- Evaluación comparativa de destilación: usar el modelo como baseline reproducible del "DistilBERT (D)" del artículo para experimentos de compresión.
- Despliegue en entornos con recursos limitados: contenedores pequeños, dispositivos edge o funciones serverless donde un modelo de 66 M cabe en memoria sin GPU.
- Filtrado previo en pipelines RAG: descartar pasajes irrelevantes antes de invocar un LLM generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

| Modelo | Exact Match | F1 |
|---|---|---|
| DistilBERT paper (tabla 2, "DistilBERT (D)") | 79,1 | 86,9 |
| Este modelo (GenAI99) | 78,4 | 86,5 |

Métricas calculadas con la métrica `squad` de la librería `datasets`. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~0,3 GB en fp32 para los pesos; ~0,15 GB en fp16; menos de 100 MB con cuantización int8 dinámica.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- CPU: ejecutable en CPU con latencia de decenas de milisegundos por consulta para contextos de 512 tokens.
- Opciones de despliegue: `transformers` (pipeline `question-answering`), TorchScript, ONNX Runtime, `optimum`, FastAPI + Uvicorn, Hugging Face Inference Endpoints. No se documenta soporte específico de vLLM, TGI o llama.cpp (este último no aplica a arquitecturas encoder-only).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EM / F1 (SQuAD v1.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GenAI99) | 66 M | 512 | 78,4 / 86,5 | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-distilled-squad` (Hugging Face) | 66 M | 512 | ~78,5 / ~86,9 (referencia de la comunidad) | Apache 2.0 | Hugging Face |
| `bert-base-uncased` fine-tuned SQuAD v1.1 | 110 M | 512 | ~80,8 / ~88,5 (referencia del artículo) | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned SQuAD v1.1 | 125 M | 512 | ~84,6 / ~91,5 (referencia de la comunidad) | MIT | Hugging Face |

Los valores de los modelos comparativos son referencias habituales de la comunidad; no se han verificado contra la información proporcionada en esta ficha y deben contrastarse con las model cards correspondientes antes de usarlos en producción.

## Limitaciones y advertencias

- Solo inglés: no soporta consultas ni contextos en castellano ni en otros idiomas.
- QA extractivo únicamente: no genera respuestas libres; si la respuesta no está literalmente en el contexto, el modelo no puede producirla.
- Ventana de 512 tokens: contextos más largos deben truncarse o dividirse, lo que puede fragmentar la respuesta.
- Riesgo de alucinación de span: puede devolver un fragmento del contexto que no responde realmente a la pregunta, especialmente con preguntas ambiguas o sin respuesta (SQuAD v1.1 no incluye ejemplos sin respuesta, por lo que el modelo no está calibrado para abstenerse).
- Sesgos: no documentados por el autor; hereda los sesgos de BERT-base y de SQuAD v1.1 (Wikipedia en inglés, dominio enciclopédico).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Reproducibilidad: la model card no detalla hiperparámetros ni semillas; la reproducibilidad exacta de los resultados no está garantizada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- El nombre del repo incluye un hash (`d5716d28`) que sugiere un entrenamiento lanzado desde AutoTrain o un pipeline automatizado; conviene revisar los archivos del repo antes de confiar en la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GenAI99/distilbert-base-uncased-finetuned-squad-d5716d28
- Artículo DistilBERT: https://arxiv.org/pdf/1910.01108.pdf
- Teacher del entrenamiento: https://huggingface.co/lewtun/bert-base-uncased-finetuned-squad-v1
- Dataset SQuAD v1.1: https://huggingface.co/datasets/squad
- Modelo de referencia de la comunidad: https://huggingface.co/distilbert-base-uncased-distilled-squad
