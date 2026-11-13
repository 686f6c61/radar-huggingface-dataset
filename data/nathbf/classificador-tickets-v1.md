# NathBF/classificador-tickets-v1

## Resumen

NathBF/classificador-tickets-v1 es un modelo de clasificación de texto publicado en Hugging Face por el usuario NathBF. Por el identificador y la etiqueta `distilbert` asociada al repositorio, se trata de un ajuste fino de DistilBERT orientado a la clasificación de tickets, presumiblemente tickets de soporte o incidencias, aunque la model card no documenta la tarea concreta ni las etiquetas de salida. El modelo tiene 66.955.010 parámetros y un peso de repositorio de 0,3 GB en formato safetensors.

La relevancia de este modelo es limitada dentro del ecosistema: se publicó en noviembre de 2026, cuenta con cero descargas y cero likes, y su model card es la plantilla automática de Hugging Face sin ninguna sección completada. No hay información sobre datos de entrenamiento, hiperparámetros, métricas de evaluación, licencia ni idiomas soportados. Cualquier evaluación rigurosa del modelo requiere inspeccionar directamente los pesos y la configuración del repositorio.

A efectos prácticos, debe tratarse como un artefacto sin documentar: la arquitectura subyacente (DistilBERT, un transformer encoder de 6 capas destilado de BERT-base) es conocida y bien estudiada, pero el ajuste fino concreto, su calidad y su ámbito de aplicación no están verificados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas), según etiqueta del repositorio |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estándar admite 512 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos safetensors; cuantización dinámica INT8 posible vía PyTorch/ONNX, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `distilbert` del repositorio y el recuento de parámetros (66,96 M) son coherentes con DistilBERT-base, un transformer encoder de 6 capas, 12 cabezas de atención y dimensión oculta 768, destilado de BERT-base mediante destilación de conocimiento (paper arXiv:1910.09700, Sanh et al., 2019). Sobre esta base se habría añadido una cabeza de clasificación de texto, presumiblemente con un número de clases desconocido.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el número de etiquetas, la función de pérdida, los hiperparámetros ni si se aplicó algún tipo de regularización o aumento de datos. La model card es la plantilla automática y no contiene ninguna sección completada. Tampoco se documenta si el ajuste se hizo sobre texto en castellano, portugués o inglés, ni el dominio de los tickets.

## Capacidades

- Clasificación de texto por secuencia: el pipeline declarado es `text-classification`, por lo que el modelo devuelve una o varias etiquetas con puntuaciones de probabilidad para un texto de entrada.
- Especialización presumible en tickets: el nombre del modelo sugiere clasificación de tickets de soporte o incidencias, pero las clases concretas no están documentadas.
- Compatibilidad con Text Embeddings Inference y endpoints: las etiquetas `text-embeddings-inference` y `endpoints_compatible` indican que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: si el ajuste fino cubre categorías de incidencia, el modelo podría clasificar tickets entrantes y dirigirlos al equipo correspondiente; la idoneidad depende de las clases reales, que no están documentadas.
- Etiquetado automático en un helpdesk: integrado en un pipeline de ingestión de correos o formularios para asignar una categoría inicial antes de la revisión humana.
- Triaje de colas de moderación: clasificación rápida de mensajes en categorías predefinidas, con revisión manual de los casos de baja confianza.
- Preetiquetado para anotación humana: usar las predicciones como sugerencia en una herramienta de anotación para acelerar el etiquetado de nuevos tickets.
- Filtrado y priorización: separar tickets críticos de consultas informativas si el modelo incluye una clase de urgencia, algo no confirmado.
- Prototipado rápido de clasificadores: al ser un modelo pequeño (0,3 GB), sirve como línea base para comparar con clasificadores propios antes de invertir en un ajuste más costoso.
- Despliegue en CPU: por su tamaño, es viable en entornos sin GPU para volúmenes moderados de clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (66,96 M × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, T4, A10, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer y también en CPU: la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (según etiqueta del repositorio) y exportación a ONNX para optimización; no se documenta compatibilidad con vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; para DistilBERT-base en GPU moderna se espera un throughput del orden de miles de secuencias cortas por segundo, pero no hay medición publicada para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NathBF/classificador-tickets-v1 | 66,96 M | no disponible | Clasificación de texto (presunta tickets) | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66,96 M | 512 tokens | Modelo base, sin cabeza de clasificación específica | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-multilingual-cased | 134,7 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 109,5 M | 512 tokens | Modelo base | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación es estructural: los tres modelos de referencia son bases genéricas con licencia conocida y documentación completa, mientras que este ajuste carece de licencia, idiomas y métricas declaradas. Para una tarea de clasificación de tickets en producción, un ajuste propio sobre distilbert-base-multilingual-cased o bert-base-uncased con datos propios ofrece garantías que este repositorio no proporciona.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, etiquetas, métricas ni procedencia, lo que impide evaluar sesgos y calidad.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor o inspeccionar el repositorio antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede confirmar que el modelo funcione correctamente en castellano.
- Riesgo de alucinación y errores de clasificación: sin métricas publicadas no hay forma de estimar la precisión ni la calibración de las probabilidades.
- Sesgos desconocidos: al no documentarse el dataset, no pueden identificarse sesgos demográficos, de dominio ni de desbalance de clases.
- Sin descargas ni validación comunitaria: cero descargas y cero likes implican que el modelo no ha sido revisado por terceros.
- Longitud de contexto no confirmada: aunque DistilBERT estándar admite 512 tokens, el ajuste podría haber modificado la configuración.
- Fecha de creación futura respecto al conocimiento habitual del ecosistema (noviembre de 2026): conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NathBF/classificador-tickets-v1
- Paper de DistilBERT (arquitectura base): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019) sobre estimación de emisiones: https://arxiv.org/abs/1910.09700
