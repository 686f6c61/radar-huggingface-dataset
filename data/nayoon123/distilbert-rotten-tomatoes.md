# nayoon123/distilbert-rotten-tomatoes

## Resumen

distilbert-rotten-tomatoes es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario nayoon123 en Hugging Face. Se trata de un ajuste orientado, por el nombre, a la clasificación de reseñas de películas del corpus Rotten Tomatoes, aunque la model card no documenta explícitamente el conjunto de datos de entrenamiento ni las etiquetas de salida. El modelo tiene 66.955.010 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo parte de DistilBERT, una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y conserva aproximadamente dos tercios de los parámetros del original, lo que lo hace adecuado para inferencia de baja latencia en CPU y GPU modestas. Al ser un encoder bidireccional con cabeza de clasificación, no es un modelo generativo: produce una distribución de probabilidad sobre un conjunto cerrado de clases.

La relevancia de esta ficha es limitada pero práctica: se trata de un artefacto de fine-tuning pequeño, sin métricas publicadas ni documentación de datos, útil como ejemplo de pipeline de clasificación con Trainer y como posible componente en tareas de análisis de sentimiento o clasificación de reseñas, siempre que el usuario valide su comportamiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, bidireccional) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de distilbert-base-uncased; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes u ONNX Runtime) |
| Idiomas soportados | no disponibles (el modelo base es principalmente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT: un transformer encoder de 6 capas con atención multi-cabeza, entrenado originalmente mediante destilación de conocimiento desde BERT-base. El modelo resultante conserva el vocabulario y el tokenizador WordPiece de bert-base-uncased (aproximadamente 30.000 tokens) y admite secuencias de hasta 512 tokens. Sobre este backbone se ha añadido una cabeza de clasificación lineal para la tarea de text-classification.

El fine-tuning se realizó con los hiperparámetros documentados en la model card: learning rate de 2e-05, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 2 épocas. No se especifica el número de pasos, el tamaño del dataset, la composición del corpus ni si hubo validación. Tampoco se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un modelo encoder de clasificación. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se describe ninguna innovación técnica adicional: se trata de un fine-tuning estándar generado automáticamente por el Trainer de Hugging Face, sin decodificación especulativa, atención lineal ni modificaciones arquitectónicas.

## Capacidades

- Clasificación de texto: produce una etiqueta (o distribución de etiquetas) a partir de una secuencia de entrada, presumiblemente binaria o multiclase según el dataset de entrenamiento, que no se documenta.
- Análisis de sentimiento o polaridad de reseñas: por el nombre del modelo, orientado a reseñas de películas, aunque las clases concretas no están especificadas.
- Codificación de representaciones contextuales: al ser un encoder, puede extraerse el embedding del token [CLS] o las representaciones ocultas para tareas downstream.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para reseñas y párrafos cortos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidades multilingües no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Clasificación de reseñas de películas: el modelo puede asignar una etiqueta de polaridad a reseñas de Rotten Tomatoes, integrándose en un pipeline de `transformers` con `pipeline("text-classification")` para procesar lotes de críticas y agregar métricas de sentimiento por película.
- Moderación de comentarios en foros o plataformas de contenido: con 67 millones de parámetros y 6 capas, permite clasificar grandes volúmenes de comentarios en CPU con latencia baja, filtrando contenido según la etiqueta predicha.
- Enriquecimiento de datasets de opinión: uso como etiquetador automático para preanotar corpus de reseñas antes de una revisión humana, reduciendo el coste de anotación manual en proyectos de análisis de opinión.
- Clasificación de encuestas abiertas: procesamiento de respuestas de texto libre en formularios para agruparlas por sentimiento o categoría, aprovechando la ventana de 512 tokens para respuestas extensas.
- Componente en pipelines de búsqueda y recomendación: generación de embeddings de reseñas para similitud semántica o como señal auxiliar en un sistema de recomendación de películas.
- Detección de opiniones negativas en atención al cliente: clasificación rápida de mensajes entrantes para enrutar los casos con polaridad negativa a un agente humano, con un coste computacional muy bajo frente a modelos generativos.
- Prototipado y docencia: ejemplo mínimo de fine-tuning con Trainer y despliegue con Text Embeddings Inference o endpoints compatibles, útil para demostrar el flujo completo de un clasificador.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Inferencia en CPU viable: con 6 capas y 67 M de parámetros, el throughput es alto en CPU moderna, adecuado para clasificación por lotes.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (el repo está marcado como compatible con endpoints), ONNX Runtime, y exportación a GGUF para llama.cpp en caso de querer inferencia en CPU optimizada.
- No se dispone de mediciones de latencia ni throughput publicadas; a modo orientativo, un modelo de este tamaño suele procesar cientos o miles de secuencias cortas por segundo en GPU y decenas por segundo en CPU, pero estas cifras no están verificadas para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nayoon123/distilbert-rotten-tomatoes | 66,9 M | 512 tokens (estándar del base) | Clasificación de texto | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Análisis de sentimiento | Apache 2.0 | Hugging Face, referencia estándar |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Análisis de sentimiento | MIT | Hugging Face, muy usado |

La comparación directa con el modelo base y con clasificadores de sentimiento consolidados es desfavorable en términos de evidencia: este artefacto no publica métricas, no documenta el dataset y registra cero descargas, mientras que las alternativas cuentan con evaluaciones publicadas y adopción amplia. La ventaja diferencial es únicamente la licencia permisiva y el reducido coste de inferencia, compartidos con el resto de modelos DistilBERT.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay resultados de evaluación, por lo que se desconoce la precisión, el F1 y el comportamiento en clases desbalanceadas.
- Dataset no documentado: la model card indica "unknown dataset" y "More information needed"; se desconoce el número de clases, sus nombres y la distribución de entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas sin calibración conocida.
- Sesgos: al derivar de distilbert-base-uncased, hereda los sesgos del corpus original (principalmente texto en inglés de web y libros), no evaluados en este fine-tuning.
- Limitación de idioma: el modelo base está entrenado mayoritariamente en inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Límite de contexto de 512 tokens: las reseñas o documentos más largos se truncan, con pérdida de información.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar la procedencia de los datos de entrenamiento, que no se declara.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad; tratarlo como artefacto experimental.
- Fecha de creación futura (2026-11-09) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nayoon123/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Trainer: https://huggingface.co/docs/transformers/main_classes/trainer
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
