# Himxnsh/CampusQuery-DistilBERT

## Resumen

CampusQuery-DistilBERT es un modelo publicado en Hugging Face por el usuario Himxnsh bajo licencia MIT. Se trata de un ajuste fino de la arquitectura DistilBERT, un transformer encoder de tipo BERT destilado, con 66.961.162 parámetros totales según los pesos en formato safetensors. El nombre sugiere un uso orientado a consultas dentro de un entorno universitario ("CampusQuery"), probablemente como modelo de clasificación o respuesta a preguntas sobre servicios de campus.

La model card publicada no aporta información sustancial: solo declara la licencia MIT, sin descripción del dataset de entrenamiento, del objetivo de la tarea, del pipeline asociado ni de los idiomas soportados. El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica un modelo recién publicado y sin validación comunitaria.

Por su tamaño y arquitectura, es un modelo ligero pensado para inferencia en CPU o GPU de gama baja, adecuado para tareas de clasificación de texto, extracción de entidades o búsqueda semántica dentro de un dominio acotado. No obstante, la ausencia de documentación técnica y de benchmarks limita seriamente su evaluación previa a un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parámetros totales | 66.961.162 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura DistilBERT admite hasta 512 tokens, aunque no se confirma en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un modelo transformer de tipo encoder con 6 capas, destilado a partir de BERT-base mediante knowledge distillation. El recuento de 66.961.162 parámetros es coherente con la variante DistilBERT estándar (66,9 M), lo que sugiere que el ajuste fino no ha modificado la topología del modelo base.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens utilizados, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado convencional. Tampoco se documenta el objetivo de la tarea (clasificación, question answering extractivo, similitud semántica u otro). Esta ausencia de información impide evaluar la calidad y la representatividad del ajuste.

## Capacidades

- Codificación de texto en representaciones vectoriales (embeddings) mediante un encoder transformer.
- Potencial uso para clasificación de texto y análisis de sentimiento, si el ajuste fino se orientó a esas tareas (no confirmado).
- Posible uso para question answering extractivo sobre documentos de campus, dado el nombre del modelo (no confirmado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la arquitectura encoder no está diseñada para generación autoregresiva.
- Capacidades multilingües: no disponibles; no se especifica el idioma de entrenamiento.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de consultas universitarias: el modelo podría clasificar mensajes de estudiantes en categorías (matrícula, becas, horarios, biblioteca) si el ajuste fino se orientó a esa tarea, aprovechando su bajo coste de inferencia en CPU.
- Búsqueda semántica en portales de campus: generación de embeddings para indexar y recuperar documentos administrativos mediante similitud vectorial, con latencia baja gracias a sus 67 M de parámetros.
- Enrutado de tickets de soporte: uso como clasificador ligero en un pipeline previo a un modelo generativo mayor, reduciendo coste computacional en la primera etapa.
- Extracción de respuestas sobre normativa universitaria: question answering extractivo sobre fragmentos de reglamentos, si el modelo fue ajustado con ese objetivo.
- Moderación de contenido en foros estudiantiles: clasificación binaria o multiclase de mensajes inapropiados, desplegable en entornos con recursos limitados.
- Prototipado rápido en investigación: modelo de referencia para experimentos de ajuste fino en dominios académicos, dado su tamaño reducido y licencia permisiva.

En todos los casos, la idoneidad real depende de un ajuste fino que no está documentado, por lo que estos escenarios son hipótesis basadas en el nombre y la arquitectura, no en evidencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (67 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1650, RTX 3050, T4, e incluso en CPU.
- Cabe en cualquier GPU consumer actual y en la mayoría de entornos CPU-only con latencia aceptable para clasificación.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, llama.cpp no aplica (no es un modelo generativo), vLLM no aplica de forma estándar para encoders, TGI no aplica. Alternativas: FastAPI + transformers, TorchServe, o exportación a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; para un encoder de 67 M en CPU moderna se espera un throughput del orden de cientos a miles de secuencias cortas por segundo, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CampusQuery-DistilBERT | 66,9 M | no disponible (arquitectura hasta 512) | MIT | Hugging Face, sin descargas |
| distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente validado |
| MiniLM-L6-v2 | 22,7 M | 512 tokens | Apache 2.0 | Hugging Face, muy usado en embeddings |
| BERT-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face, referencia estándar |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados para CampusQuery-DistilBERT. Frente a distilbert-base-uncased, comparte arquitectura y tamaño, pero carece de documentación y validación comunitaria. MiniLM-L6-v2 es más pequeño y está optimizado para embeddings. BERT-base es más grande y con mayor soporte.

## Limitaciones y advertencias

- Ausencia total de documentación sobre datos de entrenamiento, tarea objetivo e idioma: imposible evaluar sesgos o calidad.
- Riesgo elevado de alucinación si se usa fuera de la tarea para la que fue ajustado; al ser un encoder, no genera texto libre de forma fiable.
- Sin benchmarks ni validación comunitaria (0 descargas, 0 likes): no hay evidencia de rendimiento real.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Posibles sesgos heredados del corpus de destilación de DistilBERT y del dataset de ajuste fino, no documentados.
- Limitación de contexto a 512 tokens por arquitectura, aunque no se confirma en la model card.
- No apto para despliegues en producción sin una evaluación previa propia sobre datos representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Himxnsh/CampusQuery-DistilBERT
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Repositorio de transformers (Hugging Face): https://github.com/huggingface/transformers
