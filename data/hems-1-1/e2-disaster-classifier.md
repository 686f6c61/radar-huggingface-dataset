# hems-1-1/e2-disaster-classifier

## Resumen

El modelo `hems-1-1/e2-disaster-classifier` es un clasificador de texto basado en `distilbert-base-uncased`, ajustado (fine-tuning) para la detección de desastres en mensajes de texto, probablemente tweets. Ha sido desarrollado por el usuario `hems-1-1` y publicado en Hugging Face con licencia Apache-2.0. El modelo tiene 66.958.086 parámetros, lo que corresponde al tamaño típico de DistilBERT, y se presenta en formato safetensors.

La relevancia de este modelo radica en su aplicación práctica para el monitoreo de redes sociales y la identificación temprana de eventos de desastre, una tarea común en sistemas de alerta humanitaria. Sin embargo, la información disponible es limitada: la model card está autogenerada y no detalla el dataset de entrenamiento, las clases objetivo ni los benchmarks estándar. El modelo alcanza una accuracy de 0.7816 en el conjunto de evaluación, con una pérdida de 0.4916, según los datos declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de DistilBERT base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una pila de 6 capas transformer con atención multi-cabeza y embeddings de 768 dimensiones. El modelo fue ajustado mediante fine-tuning sobre el checkpoint `distilbert-base-uncased`, con un dataset de entrenamiento no especificado en la model card.

Los hiperparámetros de entrenamiento declarados incluyen una tasa de aprendizaje de 2e-05, tamaño de lote de 64 para entrenamiento y 128 para evaluación, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 3 épocas. El proceso de entrenamiento se realizó con el framework Transformers 5.0.0 y PyTorch 2.10.0. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Clasificación de texto para detección de desastres: el modelo distingue entre mensajes que describen un desastre real y aquellos que no (tarea binaria típica en datasets como Disaster Tweets).
- Generación de embeddings de texto: al ser un modelo transformer, puede producir representaciones densas del texto de entrada, útiles para tareas de búsqueda semántica o clustering.
- Inferencia eficiente: gracias a su tamaño reducido (66M parámetros), es adecuado para despliegue en entornos con recursos limitados, incluyendo CPU.
- Integración con pipelines de Hugging Face: compatible con la librería `transformers` y con `text-embeddings-inference`, lo que facilita su uso en producción.
- No se han documentado capacidades adicionales como tool calling, agentes o soporte multimodal.

## Casos de uso

- Monitoreo de redes sociales para alertas tempranas: el modelo puede procesar flujos de tweets en tiempo real para identificar mensajes que reporten terremotos, inundaciones u otros desastres, permitiendo a organizaciones humanitarias activar protocolos de respuesta.
- Filtrado de contenido en plataformas de noticias: integrado en un pipeline de procesamiento de lenguaje natural, puede clasificar automáticamente artículos o publicaciones como relacionados con desastres, facilitando la curación de contenido.
- Análisis de sentimiento en situaciones de crisis: aunque su tarea principal es la clasificación binaria, puede combinarse con otros modelos para extraer información adicional como urgencia o gravedad.
- Automatización de tickets en servicios de emergencia: en sistemas de atención al ciudadano, el modelo puede priorizar mensajes que describan situaciones de peligro real, derivándolos a operadores humanos.
- Investigación académica en NLP aplicado: sirve como punto de partida para estudios sobre detección de eventos en texto, dado su tamaño manejable y su licencia permisiva.
- Prototipado rápido de sistemas de alerta: al ser un modelo pequeño y con pesos en safetensors, puede desplegarse en notebooks o servicios serverless para validar conceptos antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.4916 |
| Accuracy (evaluacion) | 0.7816 |

Estos valores corresponden al conjunto de evaluación utilizado por el autor, cuyo tamaño y composición no se especifican. La accuracy de 0.7816 indica un rendimiento moderado, pero sin datos comparativos no es posible contextualizarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 66M parámetros, en FP32 el modelo ocupa aproximadamente 268 MB, por lo que cabría en cualquier GPU con al menos 1 GB de VRAM. En cuantización INT8 o FP16, el requisito sería menor.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y no requiere hardware especializado.
- Opciones de despliegue: compatible con `transformers` (Python), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (mediante conversión) y `text-embeddings-inference` (mencionado en los tags).
- Latencia y throughput: no disponibles. Se estima una latencia de decenas de milisegundos por muestra en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. Existen otros clasificadores de desastres en Hugging Face, como `GautamR/disaster_classifier` (basado en BERT) o `tensorboy/disaster_classifier_1`, pero no se han encontrado sus especificaciones técnicas ni resultados en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica la procedencia ni la composición de los datos, lo que impide evaluar posibles sesgos o la generalización a dominios distintos.
- Accuracy moderada (0.7816): el modelo puede cometer errores tanto en falsos positivos como en falsos negativos, lo que es crítico en aplicaciones de emergencia donde un fallo puede tener consecuencias graves.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar clasificaciones incorrectas si el texto de entrada es ambiguo o contiene lenguaje figurado.
- Limitaciones de idioma: el modelo base es `distilbert-base-uncased`, entrenado principalmente en inglés. No se ha verificado su rendimiento en otros idiomas.
- Sin garantías de producción: al ser un modelo generado automáticamente con una model card incompleta, no se recomienda su uso directo en sistemas críticos sin una evaluación exhaustiva previa.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de su rendimiento y posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hems-1-1/e2-disaster-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Referencia externa (proyecto similar): https://github.com/Boredooms/Disaster-Classification-Model
- Referencia externa (clasificador multiclase): https://github.com/VIJAYANANDANJM/Disaster_Tweets_MultiClass_Classifier
- Referencia externa (clasificador BERT): https://huggingface.co/GautamR/disaster_classifier
