# Himxnsh/CampusQuery-DistilBERT-Augmented

## Resumen

CampusQuery-DistilBERT-Augmented es un modelo de lenguaje publicado en Hugging Face por el usuario Himxnsh bajo licencia MIT. Se trata de un derivado de la familia DistilBERT, la variante destilada de BERT desarrollada originalmente por Hugging Face, con 66.961.162 parámetros totales según los pesos en formato safetensors del repositorio. El nombre sugiere un propósito de clasificación o recuperación de información orientada a consultas dentro de un entorno universitario ("CampusQuery"), aunque la model card publicada no aporta ninguna descripción funcional, datos de entrenamiento ni detalles sobre el proceso de "augmentation" al que alude el identificador.

La relevancia de esta ficha es limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados y no documenta benchmarks, dataset de entrenamiento ni procedimiento de ajuste. El tamaño del repositorio (0,3 GB) es coherente con un DistilBERT base más los artefactos asociados, lo que sugiere que el modelo parte de la arquitectura estándar de seis capas y 66 millones de parámetros, pero no hay confirmación explícita por parte del autor.

Dado el estado embrionario de la publicación (cero descargas, cero likes, creado y actualizado el mismo día), esta ficha debe interpretarse como un inventario técnico de lo que el repositorio declara, no como una evaluación de capacidades contrastadas. Cualquier uso en producción requeriría validación empírica previa por parte del equipo adoptante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT), según el identificador del modelo; no confirmado en la model card |
| Parámetros totales | 66.961.162 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización a int8/fp16 posible con herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El identificador del repositorio apunta a DistilBERT, un transformer encoder con seis capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado a partir de BERT-base mediante un proceso de destilación por triple pérdida (soft targets del profesor, cross-entropy con etiquetas duras y pérdida coseno sobre estados ocultos). El recuento de 66.961.162 parámetros coincide aproximadamente con el tamaño del vocabulario extendido típico de DistilBERT, aunque el autor no documenta si se ha modificado el vocabulario o la cabeza de clasificación.

No hay información en la model card sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de ajuste fino supervisado, RLHF, DPO ni ninguna innovación técnica adicional. El término "Augmented" del nombre no se explica en la documentación publicada, por lo que se desconoce si alude a aumento de datos, a una arquitectura híbrida de recuperación aumentada o a otra modificación no descrita. Tampoco se especifica la tarea concreta para la que se ha ajustado el modelo ni la cabeza de salida utilizada.

## Capacidades

- Generación de texto: no confirmada; DistilBERT es un encoder y no está diseñado para generación autoregresiva, por lo que esta capacidad debe considerarse no disponible salvo que el autor haya añadido una cabeza específica no documentada.
- Clasificación de texto o de pares de secuencias: plausible dada la arquitectura, pero no documentada.
- Extracción de embeddings para recuperación semántica: plausible si se usa el estado del token [CLS], pero no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de consultas universitarias: si el ajuste se ha realizado sobre intenciones de estudiantes (matrícula, horarios, becas), el modelo podría etiquetar consultas entrantes en un chatbot de campus; requiere validación con datos propios antes de desplegar.
- Enrutamiento de tickets en mesa de ayuda: un encoder de 66 millones de parámetros puede clasificar tickets por departamento con latencia muy baja en CPU, siempre que se verifique el etiquetado aprendido.
- Búsqueda semántica sobre FAQs de campus: extrayendo embeddings del token [CLS] podría indexarse una base de preguntas frecuentes y recuperar respuestas por similitud coseno; la calidad depende del ajuste no documentado.
- Filtrado de spam o consultas fuera de dominio: un clasificador binario derivado de DistilBERT puede descartar mensajes irrelevantes antes de pasarlos a un LLM mayor, reduciendo coste de inferencia.
- Moderación de contenido en foros estudiantiles: si el ajuste cubre categorías de toxicidad, podría usarse como primera capa de filtrado; no hay evidencia de que se haya entrenado para ello.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,3 GB en disco y ejecutarse en CPU, sirve para validar pipelines de NLP antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB para los pesos (66,9 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,13 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer de los últimos diez años, e incluso en CPU con latencia aceptable.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, llama.cpp no aplica (no es un modelo generativo GGUF), vLLM no aplica, TGI no aplica; para serving de clasificación puede usarse FastAPI con transformers o un endpoint de inferencia de Hugging Face.
- Latencia y throughput estimados: no disponibles; para un DistilBERT de 66 M parámetros en CPU moderna se suele observar un orden de magnitud de milisegundos por secuencia corta, pero no hay medición publicada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CampusQuery-DistilBERT-Augmented | 66,9 M | no disponible | MIT | Hugging Face, 0 descargas | Sin documentación ni benchmarks |
| distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Model card completa, benchmarks GLUE publicados |
| MiniLM-L6-v2 | 22,7 M | 256-512 tokens | Apache 2.0 | Hugging Face, muy usado en sentence-transformers | Optimizado para embeddings y recuperación |
| BERT-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face | Referencia original no destilada |

La comparativa es estructural: CampusQuery no publica métricas que permitan situarlo frente a estos modelos en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la licencia, sin descripción de la tarea, el dataset ni el procedimiento de entrenamiento, lo que impide evaluar su idoneidad.
- Riesgo de alucinación no aplicable en sentido estricto si el modelo es un encoder de clasificación, pero sí riesgo de etiquetas erróneas si el ajuste es deficiente o el dominio de uso difiere del de entrenamiento.
- Sesgos desconocidos: al no documentarse el corpus, no puede evaluarse el sesgo demográfico, lingüístico o temático.
- Idiomas no declarados: no puede asumirse cobertura multilingüe; probablemente esté limitado al idioma del corpus de ajuste, que se desconoce.
- Licencia MIT: permite uso comercial y modificación, pero el adoptante asume toda la responsabilidad sobre el comportamiento del modelo, incluida la procedencia de los datos de entrenamiento no declarados.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin issues ni discusión que permitan inferir calidad.
- Fecha de creación anómala (2026-11-13): conviene verificar la integridad del repositorio antes de descargarlo.
- No apto para producción sin validación empírica previa sobre un conjunto de evaluación propio y representativo del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Himxnsh/CampusQuery-DistilBERT-Augmented
- Repositorio original de DistilBERT (referencia arquitectónica): https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
