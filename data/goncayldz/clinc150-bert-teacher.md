# goncayldz/clinc150-bert-teacher

## Resumen

`goncayldz/clinc150-bert-teacher` es un modelo de clasificación de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario goncayldz. Por el identificador del repositorio, parece estar entrenado o ajustado sobre el conjunto de datos CLINC150, un benchmark habitual para detección de intenciones (intent classification) en asistentes conversacionales, aunque la model card no lo confirma explícitamente. El sufijo "teacher" sugiere que el modelo está pensado como profesor en un esquema de destilación de conocimiento hacia un modelo alumno más pequeño, si bien esta interpretación no está documentada por el autor.

El modelo cuenta con 109.598.359 parámetros totales según los pesos en safetensors, lo que corresponde a la escala de un BERT-base (aproximadamente 110 millones de parámetros). El repositorio ocupa 0,4 GB y se distribuye en formato safetensors con la librería transformers. No se han publicado descargas ni likes, y la model card es la plantilla autogenerada por Hugging Face sin contenido sustantivo: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia.

La relevancia de esta ficha es limitada y fundamentalmente descriptiva: se trata de un checkpoint de clasificación de intenciones de tamaño moderado, potencialmente útil para prototipos de asistentes conversacionales o como profesor en destilación, pero sin documentación que permita validar su calidad, su licencia o su comportamiento. Cualquier uso en producción requeriría una evaluación propia por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), según el tag `bert` del repositorio |
| Parametros totales | 109.598.359 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no documentada; BERT-base suele operar a 512 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto (`text-classification`) |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, tal como indica el tag `bert` del repositorio y el recuento de parámetros (109,6 millones, coherente con BERT-base). El pipeline declarado es `text-classification`, lo que implica una cabeza de clasificación sobre el encoder, presumiblemente con una capa lineal sobre el token `[CLS]` para predecir la intención de una utterance. No se dispone de información sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni sobre la inicialización concreta (BERT-base uncased, DistilBERT u otro checkpoint base).

No hay información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicó fine-tuning supervisado, destilación o algún tipo de RLHF/DPO. El nombre del repositorio apunta a CLINC150, un dataset de 150 intenciones en dominio y 150 fuera de dominio para asistentes virtuales, pero la model card no lo confirma ni documenta hiperparámetros, régimen de precisión (fp32, fp16, bf16) ni hardware utilizado. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, etc.); se trata de un encoder BERT estándar para clasificación.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una etiqueta a una secuencia de entrada.
- Detección de intenciones (presunta): por el identificador `clinc150`, el uso previsto parece ser la clasificación de utterances en intenciones de un asistente conversacional, aunque no está confirmado en la model card.
- Posible rol de profesor en destilación: el sufijo `teacher` sugiere que puede emplearse para generar logits o pseudoetiquetas para entrenar un modelo alumno más pequeño.
- Compatibilidad con Text Embeddings Inference y endpoints: los tags `text-embeddings-inference` y `endpoints_compatible` indican que el checkpoint puede servirse con la infraestructura de inferencia de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; no se especifican idiomas.

## Casos de uso

- Detección de intenciones en asistentes conversacionales: si el modelo está efectivamente ajustado sobre CLINC150, podría clasificar utterances de usuario en una de las 150 intenciones del dataset, integrándose en un enrutador previo a un sistema de diálogo. La idoneidad depende de una evaluación propia, dado que no hay métricas publicadas.
- Destilación de conocimiento: como modelo "teacher" de aproximadamente 110 millones de parámetros, podría generar distribuciones de probabilidad sobre clases para entrenar un alumno más pequeño (por ejemplo, un DistilBERT o un modelo tipo MiniLM), reduciendo coste de inferencia en producción.
- Enrutamiento de consultas en pipelines RAG: clasificar la consulta entrante en categorías (consulta de producto, soporte, facturación, etc.) para dirigirla al índice o al prompt adecuado, aprovechando la baja latencia esperable de un encoder BERT-base.
- Moderación o etiquetado de contenido: usar la cabeza de clasificación para asignar categorías a textos en un pipeline de preprocesamiento, siempre que se reentrene o valide con datos propios.
- Prototipado rápido de clasificadores: servir el checkpoint con Text Embeddings Inference o los endpoints de Hugging Face para validar un flujo de clasificación antes de invertir en un modelo propio.
- Baseline académico: emplear el checkpoint como referencia en experimentos de clasificación de intenciones o de destilación, comparando su comportamiento con modelos propios sobre el mismo conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,6 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en total para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,22 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede servir el modelo con holgura. Para despliegues de alto throughput, una A10G, L4 o A100 resultan adecuadas pero sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints de Hugging Face (tag `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas sin conversión propia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goncayldz/clinc150-bert-teacher | 109,6 M | no disponible | Clasificación de texto | no disponible | Hugging Face, safetensors |
| BERT-base (google-bert/bert-base-uncased) | 110 M | 512 tokens | Encoder general, fine-tuning | Apache 2.0 | Hugging Face, ampliamente disponible |
| DistilBERT-base (distilbert/distilbert-base-uncased) | 66 M | 512 tokens | Encoder general, fine-tuning | Apache 2.0 | Hugging Face, ampliamente disponible |
| RoBERTa-base (FacebookAI/roberta-base) | 125 M | 514 tokens | Encoder general, fine-tuning | MIT | Hugging Face, ampliamente disponible |

La comparación se limita a la escala y la arquitectura, ya que no hay datos de rendimiento publicados para el modelo objeto de esta ficha. Los tres alternativos son checkpoints base documentados y con licencia conocida, a diferencia de `goncayldz/clinc150-bert-teacher`, cuya licencia no está disponible.

## Limitaciones y advertencias

- Model card autogenerada y sin contenido sustantivo: no hay información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Licencia no disponible: no puede confirmarse el permiso para uso comercial; debe contactarse con el autor o asumir riesgo legal.
- Idiomas no documentados: no se puede garantizar el comportamiento en castellano ni en otros idiomas distintos del que se usara en el ajuste (presuntamente inglés, si se trata de CLINC150).
- Sin métricas publicadas: no hay evidencia de precisión, recall ni F1 sobre CLINC150 ni sobre ningún otro conjunto; cualquier uso en producción exige evaluación propia.
- Riesgo de alucinación y sesgo: inherente a cualquier clasificador entrenado con datos no documentados; al no conocerse la distribución de entrenamiento, no pueden anticiparse sesgos de dominio ni de subgrupos.
- Contexto máximo no confirmado: aunque BERT-base suele limitarse a 512 tokens, no se documenta para este checkpoint; secuencias más largas podrían truncarse o fallar.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad.
- Fecha de creación anómala (2026-11-12): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.
- No se publican cuantizaciones GGUF ni versiones optimizadas: el despliegue en CPU o en entornos con llama.cpp requiere conversión manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/goncayldz/clinc150-bert-teacher
- Paper de referencia sobre estimación de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Dataset CLINC150 (referencia no confirmada por el autor): no disponible como enlace oficial en la información proporcionada
- Paper de BERT (referencia arquitectónica general): no disponible en la información proporcionada
