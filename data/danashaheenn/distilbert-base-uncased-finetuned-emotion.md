# danashaheenn/distilbert-base-uncased-finetuned-emotion

## Resumen

`distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, la variante destilada de DistilBERT desarrollada originalmente por Hugging Face. Lo publica el usuario `danashaheenn` en Hugging Face y su propósito declarado es la clasificación de emociones en texto, aunque la model card no especifica el conjunto de datos de entrenamiento ni el conjunto exacto de etiquetas de salida.

El modelo es una adaptación de un transformer encoder de tipo BERT con 6 capas y 66,9 millones de parámetros, entrenado con un objetivo de modelado de lenguaje enmascarado en su fase original y ajustado aquí para una tarea de clasificación. Su relevancia práctica es limitada: se trata de un artefacto derivado de un pipeline de `Trainer` con documentación mínima, cero descargas y cero likes en el momento de la consulta, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

El interés técnico reside en su reducido coste computacional: al ser una variante destilada de BERT, ofrece una latencia y un consumo de memoria muy inferiores a los de un BERT-base completo, lo que lo hace apto para inferencia en CPU o en GPU de gama baja. No obstante, la ausencia de información sobre el dataset, el esquema de etiquetas y los idiomas soportados limita seriamente su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas), fine-tuning para clasificación de secuencias |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y elimina el entrenamiento de tipo token-type embeddings, conservando el mecanismo de self-attention multi-cabeza y las representaciones contextuales bidireccionales. Sobre esta base se añade una cabeza de clasificación de secuencias que produce logits por clase; el modelo resultante tiene 66,9 millones de parámetros y un tamaño de repositorio de 0,3 GB.

El fine-tuning se realizó con el `Trainer` de Transformers (versión 5.22.1), PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. Los hiperparámetros documentados son: learning rate 5e-5, batch size de entrenamiento y evaluación de 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno y 5 épocas. El conjunto de entrenamiento no se especifica ("unknown dataset" según la model card) y no se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de clasificación de este tamaño.

## Capacidades

- Clasificación de texto por secuencia: el pipeline `text-classification` devuelve una etiqueta y una puntuación de confianza por entrada.
- Detección de emociones: el nombre del modelo y su tarea sugieren un esquema de etiquetas emocionales, aunque la model card no enumera las clases concretas.
- Procesamiento de entradas cortas: al derivar de DistilBERT-base, admite secuencias de hasta 512 tokens, suficiente para frases, titulares, reseñas o mensajes.
- Inferencia en CPU: su tamaño de 66,9 M de parámetros permite ejecución sin GPU.
- Compatibilidad con Text Embeddings Inference y endpoints de Hugging Face (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No dispone de soporte documentado de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento, al ser un encoder de clasificación.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas de producto: el modelo puede clasificar cada reseña en una categoría emocional, permitiendo agregar métricas de satisfacción por lote sobre grandes volúmenes de texto con coste mínimo.
- Moderación de comentarios en foros o redes: clasificación rápida de mensajes para detectar tono negativo o conflictivo antes de la revisión humana, aprovechando la baja latencia de un encoder de 6 capas.
- Enrutamiento de tickets de soporte: asignar cada mensaje entrante a una cola según la emoción detectada (frustración, satisfacción, neutralidad) para priorizar casos críticos.
- Monitorización de reputación de marca: procesar menciones en redes sociales y prensa para construir series temporales de tono emocional por producto o campaña.
- Investigación en psicología o ciencias sociales: etiquetado automático de corpus textuales para estudios de análisis del discurso, con la advertencia de que el esquema de etiquetas no está documentado.
- Preprocesado en pipelines de NLP: como etapa de filtrado o enriquecimiento antes de un modelo generativo mayor, por ejemplo para descartar entradas con carga emocional negativa antes de un resumen automático.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,2237 |
| Accuracy | 0,9235 |
| F1 | 0,9235 |

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1.0 | 250 | 0,3178 | 0,9045 | 0,9041 |
| 2.0 | 500 | 0,2237 | 0,9235 | 0,9235 |

El `model-index` del modelo no contiene resultados adicionales. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, y el conjunto de evaluación empleado no está identificado, por lo que las cifras no son comparables con las de otros modelos de clasificación de emociones.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (0,3 GB de pesos más activaciones), y del orden de 200-300 MB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona también en CPU sin problemas de rendimiento para lotes pequeños.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en Apple Silicon y en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI), endpoints de Hugging Face, ONNX Runtime y exportación a formatos cuantizados mediante herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-base-uncased-finetuned-emotion (este) | 66,9 M | hasta 512 tokens (base) | Clasificación de emociones | apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | hasta 512 tokens | Análisis de sentimiento (2 clases) | apache-2.0 | Hugging Face, ampliamente usado |
| roberta-base-go_emotions | 124,6 M | hasta 512 tokens | Clasificación de 28 emociones | MIT | Hugging Face, muy usado |
| bhadresh-savani/distilbert-base-uncased-emotion | 66,9 M | hasta 512 tokens | Clasificación de 6 emociones | apache-2.0 | Hugging Face, ampliamente usado |

La comparación se basa en características públicas de los modelos citados; no se dispone de datos de rendimiento comparables para este modelo concreto, dado que su conjunto de evaluación no está documentado.

## Limitaciones y advertencias

- Dataset de entrenamiento no especificado: la model card indica "unknown dataset", lo que impide verificar la calidad, el equilibrio y la procedencia de las etiquetas.
- Esquema de etiquetas no documentado: se desconoce el número y la definición exacta de las clases de emoción, lo que impide interpretar correctamente las salidas.
- Riesgo de alucinación y de clasificación errónea: como todo clasificador, puede producir etiquetas incorrectas con alta confianza, especialmente en dominios distintos al de entrenamiento.
- Idiomas: el modelo base es `uncased` en inglés y no se declaran idiomas soportados; su uso en castellano no está validado.
- Sesgos: no se documenta ningún análisis de sesgos; los corpus de emociones suelen presentar desequilibrios por género, registro y dominio.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación propia sobre datos representativos.
- Sin métricas reproducibles: las cifras de accuracy y F1 (0,9235) proceden de un conjunto de evaluación no identificado y no son comparables con benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danashaheenn/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
