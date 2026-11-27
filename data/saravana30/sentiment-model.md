# Saravana30/sentiment-model

## Resumen

Saravana30/sentiment-model es un modelo de clasificación de texto obtenido mediante fine-tuning de answerdotai/ModernBERT-base, publicado por el usuario Saravana30 en Hugging Face. Está orientado a análisis de sentimiento, aunque la model card no especifica el conjunto de etiquetas ni el dataset de entrenamiento utilizado. Con 149.607.171 parámetros y un tamaño de repositorio de 0,6 GB, se trata de un encoder de tamaño base, adecuado para tareas de clasificación sobre CPU o GPU de gama media.

La relevancia de este modelo es limitada: se publica con la model card autogenerada por el Trainer de Hugging Face, sin documentación sobre datos, etiquetas o uso previsto, y con métricas de evaluación modestas (accuracy de 0,6552 y F1 macro de 0,6466). Además, muestra signos claros de sobreajuste en el entrenamiento, con una pérdida de validación que asciende de 0,7114 en la primera época a 1,2185 en la tercera.

Se apoya en la arquitectura ModernBERT, un transformer encoder con atención de contexto largo y mejoras de eficiencia respecto a BERT clásico. No obstante, dado que el autor no documenta el dataset ni las clases, debe tratarse como un experimento reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.607.171 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer que incorpora mejoras sobre BERT convencional (rotary positional embeddings, atención con ventana local y global alternada, y kernels optimizados), y se ha afinado para clasificación de secuencias con una cabeza de text-classification. El fine-tuning se realizó durante 3 épocas con learning rate 3e-05, batch size de 16, optimizador AdamW fused, scheduler lineal y semilla 42, sobre un dataset no especificado ("unknown dataset" según la model card).

No se documenta el volumen de tokens de entrenamiento, la composición del corpus, el número de clases ni si hubo técnicas de regularización adicionales. Las curvas de entrenamiento muestran un descenso continuado de la pérdida de entrenamiento (0,8476 → 0,5058 → 0,2004) mientras la pérdida de validación empeora en la tercera época, lo que indica sobreajuste y sugiere que el checkpoint final no es el óptimo.

## Capacidades

- Clasificación de texto: genera una etiqueta de clase a partir de una secuencia de entrada; el número y significado de las etiquetas no está documentado.
- Análisis de sentimiento: uso declarado por el nombre del modelo, si bien la model card no confirma el esquema de clases (binario, ternario, etc.).
- Extracción de representaciones: al ser un encoder, puede emplearse para obtener embeddings contextuales de frases o documentos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generación de texto libre, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo base ModernBERT está orientado principalmente a inglés, pero no se confirma en esta ficha.

## Casos de uso

- Clasificación de opiniones en encuestas internas: el modelo puede asignar una etiqueta de sentimiento a respuestas abiertas de clientes o empleados, siempre que se valide antes el esquema de clases, ya que el autor no lo documenta.
- Moderación de comentarios en foros: útil como primer filtro para detectar tono negativo en textos cortos, con revisión humana posterior dado el accuracy de 0,6552.
- Enrutamiento de tickets de soporte: clasificación rápida de mensajes entrantes por polaridad para priorizar colas de atención, en un escenario de bajo coste computacional.
- Análisis de reseñas de producto a pequeña escala: procesamiento por lotes de reseñas en CPU gracias al tamaño contenido del modelo (0,6 GB en safetensors).
- Etiquetado asistido para anotación: generación de etiquetas preliminares que un anotador humano corrige, reduciendo el coste de construir un dataset de sentimiento propio.
- Prototipado académico: base para experimentos de fine-tuning adicional con datasets propios, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Extracción de embeddings para clustering de textos: uso del encoder subyacente para agrupar documentos por similitud semántica antes de entrenar un clasificador específico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación final) | 0,7430 |
| Accuracy | 0,6552 |
| F1 weighted | 0,6466 |
| F1 macro | 0,6466 |

Evolución durante el entrenamiento:

| Epoca | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|
| 1 | 0,7114 | 0,6944 | 0,6955 | 0,6955 |
| 2 | 0,8105 | 0,6698 | 0,6735 | 0,6735 |
| 3 | 1,2185 | 0,6636 | 0,6680 | 0,6680 |

El model-index del autor no incluye resultados adicionales. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos, más overhead de activaciones; en la práctica cabe en cualquier GPU con 2 GB o más. En fp16, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes, una NVIDIA T4, L4, RTX 3060 o superior es suficiente. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- CPU: viable para inferencia por lotes pequeños gracias al tamaño reducido del modelo.
- Opciones de despliegue: transformers (pipeline de text-classification), Text Embeddings Inference (TEI), ONNX Runtime; llama.cpp y Ollama no aplican al no ser un modelo generativo GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saravana30/sentiment-model | 149,6 M | no disponible | Clasificación de sentimiento | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149,6 M | no disponible en esta ficha | Encoder base (fine-tuning) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificación de sentimiento (SST-2) | Apache 2.0 | Hugging Face |

La comparación con alternativas consolidadas es desfavorable para este modelo: el checkpoint de DistilBERT afinado en SST-2 está ampliamente documentado y validado, mientras que Saravana30/sentiment-model carece de información sobre dataset y etiquetas. No se dispone de datos de benchmarks comparativos directos.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que se desconoce la distribución, el dominio y el esquema de etiquetas.
- Sobreajuste evidente: la pérdida de validación aumenta en la tercera época (de 0,7114 a 1,2185), lo que sugiere que el checkpoint publicado no es el mejor del entrenamiento.
- Rendimiento modesto: accuracy de 0,6552 y F1 macro de 0,6466, insuficientes para la mayoría de aplicaciones en producción sin validación adicional.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Idiomas: no se confirma el soporte multilingüe; el modelo base ModernBERT está orientado principalmente al inglés.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento, no es posible evaluar sesgos de dominio, género o demografía.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni sobre los datos subyacentes.
- Uso previsto no documentado: la model card contiene la sección "Intended uses & limitations" sin completar, por lo que cualquier despliegue en producción requiere una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saravana30/sentiment-model
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
