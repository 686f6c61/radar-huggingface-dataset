# sjmeis/reddit-25-hs

## Resumen

El modelo `sjmeis/reddit-25-hs` es un clasificador de texto basado en `google-bert/bert-base-cased`, ajustado (fine-tuning) sobre el dataset `reddit-25` para la detección de discurso de odio (hate speech) en inglés. El trabajo se enmarca en el artículo *"Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy"*, presentado en el taller WOAH 2026, que aborda el equilibrio entre la precisión en la detección de odio y la privacidad de los datos de entrenamiento.

Con 108 millones de parámetros, es un modelo compacto y ligero, adecuado para tareas de moderación de contenido en entornos con recursos limitados. Su licencia MIT permite uso comercial sin restricciones, y al estar basado en BERT, hereda su arquitectura transformer encoder-only con atención bidireccional, diseñada para comprensión de texto en lugar de generación.

La relevancia de este modelo radica en su enfoque explícito en el trade-off entre rendimiento y privacidad, un aspecto crítico en aplicaciones de moderación donde los datos de usuario son sensibles. Aunque no se publican métricas detalladas, su tamaño reducido y su origen académico lo convierten en una opción interesante para experimentación y despliegue en producción ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base-cased) |
| Parametros totales | 108.311.810 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (estándar de BERT-base: 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google-bert/bert-base-cased`, una arquitectura transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un total de 108 millones de parámetros. La capa de clasificación se añade sobre la salida `[CLS]` para realizar la tarea de detección de discurso de odio, probablemente como clasificación binaria o multiclase, aunque el número exacto de clases no se especifica en la documentación disponible.

El entrenamiento se realizó sobre el dataset `reddit-25`, del cual no se proporcionan detalles sobre tamaño, composición o método de etiquetado. El artículo asociado (WOAH 2026) sugiere que se exploró el trade-off entre la precisión del modelo y la privacidad de los datos, posiblemente mediante técnicas como el aprendizaje federado o la anonimización, pero no se detallan en la model card. No hay información sobre el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo discriminativo de clasificación.

## Capacidades

- Clasificación de texto para detección de discurso de odio en inglés.
- Análisis de contenido textual en redes sociales, foros o comentarios.
- Salida de probabilidades o etiquetas para cada clase (binaria o multiclase, no especificado).
- Inferencia rápida gracias a su tamaño reducido (108M parámetros).
- Sin capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso.
- No soporta vision, audio ni otras modalidades.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar automáticamente mensajes como odiosos o no, permitiendo a los moderadores priorizar la revisión humana. Su tamaño compacto permite desplegarlo en servicios con baja latencia.
- Filtrado de contenido en plataformas de streaming o juegos online: integrable en pipelines de análisis en tiempo real para detectar lenguaje abusivo en chats.
- Análisis de sentimiento y toxicidad en encuestas o reseñas: útil para identificar patrones de acoso en comentarios de productos o servicios.
- Investigación académica sobre detección de odio: sirve como baseline para comparar métodos que incorporan privacidad, dado su enfoque explícito en ese trade-off.
- Herramientas de monitoreo de redes sociales para marcas: permite detectar menciones ofensivas hacia una empresa o producto y activar alertas.
- Sistemas de pre-moderación en blogs o periódicos digitales: clasifica comentarios antes de su publicación, reduciendo la carga de moderadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como precisión, recall o F1, ni comparaciones con otros modelos de detección de odio.

## Requisitos de hardware

- Al ser un modelo de 108M parámetros, la inferencia puede ejecutarse en CPU con un consumo de memoria inferior a 1 GB (en FP32, aproximadamente 433 MB de pesos).
- En GPU, cualquier modelo consumer con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Una RTX 3060 o superior permite ejecución con holgura.
- Para despliegue en producción, se puede usar Hugging Face Transformers con PyTorch o TensorFlow, o servidores de inferencia como vLLM (aunque no está optimizado para modelos encoder-only) o FastAPI con ONNX Runtime.
- No se dispone de datos sobre latencia o throughput específicos, pero al ser un modelo pequeño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Como referencia, otros modelos de detección de odio basados en BERT incluyen `HateBERT` (fine-tune de BERT-base en datos de Reddit) y `RoBERTa-base` con ajustes específicos. Sin embargo, sin métricas publicadas, no es posible establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| reddit-25-hs | 108M | 512 (estándar) | MIT | Fine-tune de BERT-base en reddit-25 |
| HateBERT | 110M | 512 | MIT | Fine-tune de BERT-base en datos de Reddit |
| RoBERTa-base | 125M | 512 | MIT | Modelo generalista, adaptable |

## Limitaciones y advertencias

- Entrenado únicamente en inglés; no es adecuado para otros idiomas sin fine-tuning adicional.
- El dataset `reddit-25` no está documentado públicamente, por lo que se desconocen posibles sesgos en el etiquetado o la distribución de clases.
- Al ser un clasificador basado en BERT, puede presentar falsos positivos o negativos en contextos con sarcasmo, ironía o lenguaje coloquial.
- No se ha evaluado su robustez frente a ataques adversariales (texto ofuscado, variaciones ortográficas).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se proporcionan detalles sobre el preprocesamiento de texto ni la longitud máxima de entrada, lo que puede afectar la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sjmeis/reddit-25-hs)
- [Dataset en28 de sjmeis (relacionado con el autor, no con este modelo)](https://huggingface.co/datasets/sjmeis/enron28)
- Paper asociado: *"Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy"* (WOAH 2026) — sin enlace directo disponible en la información proporcionada.
