# juanmorc/xlmr-sarcasmo-bs32

## Resumen

xlmr-sarcasmo-bs32 es un modelo de clasificación de texto obtenido mediante fine-tuning de FacebookAI/xlm-roberta-large, publicado por el usuario juanmorc en Hugging Face. Su propósito declarado, a partir del nombre del repositorio, es la detección de sarcasmo en texto, aunque la model card no documenta explícitamente la tarea ni el conjunto de datos empleado ("unknown dataset"). Se trata, por tanto, de un ajuste supervisado de un encoder transformer multilingüe de tipo XLM-RoBERTa, no de un modelo generativo.

El modelo parte de la arquitectura XLM-RoBERTa-large, un transformer encoder-only con aproximadamente 560 millones de parámetros, y añade una cabeza de clasificación sobre la representación del token especial `[CLS]`. El entrenamiento se realizó durante 8 épocas con un batch efectivo de 32, learning rate de 1e-5, optimizador AdamW fused y precisión mixta nativa (AMP), alcanzando en la mejor época un accuracy de 0,9364 y un F1 macro de 0,9330 sobre el conjunto de evaluación.

Su relevancia es limitada y muy específica: se trata de un artefacto de ajuste fino de bajo perfil (25 descargas, 0 likes en el momento de la consulta), sin paper asociado ni documentación de datos. Resulta útil como referencia práctica de fine-tuning de XLM-R para clasificación de sarcasmo o como punto de partida para experimentos en ese dominio, pero no debe considerarse un modelo listo para producción sin una validación independiente del conjunto de datos y del sesgo de etiquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-large) con cabeza de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa-large soporta hasta 512 tokens de entrada, límite arquitectónico del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, p. ej. int8 dinámica, pero no se documenta) |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa-large es multilingüe con 100 idiomas, pero el autor no declara idiomas de entrenamiento ni de evaluación) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de FacebookAI/xlm-roberta-large, un transformer encoder-only basado en RoBERTa con vocabulario SentencePiece multilingüe y 24 capas, 16 cabezas de atención y dimensión oculta 1024 (configuración estándar de XLM-R large). Sobre la salida del token `[CLS]` se aplica una capa lineal de clasificación, cuyo número de etiquetas no se especifica en la model card. No hay innovaciones arquitectónicas propias: es un ajuste supervisado clásico de clasificación de secuencias.

Los detalles de entrenamiento disponibles son escasos y proceden del `Trainer` de Hugging Face: 8 épocas, batch de entrenamiento 8 con acumulación de gradiente 4 (batch efectivo 32), learning rate 1e-5 con scheduler lineal y warmup del 10 %, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), semilla 42 y precisión mixta nativa. El conjunto de datos de entrenamiento y evaluación no se documenta ("unknown dataset"), por lo que no es posible conocer su tamaño, composición, idioma ni el proceso de anotación. Tampoco se indica si hubo aumento de datos, balanceo de clases o validación cruzada. Las versiones de framework declaradas son Transformers 5.23.0, PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto a nivel de secuencia: asigna una etiqueta (presumiblemente sarcasmo / no sarcasmo) a una entrada de hasta 512 tokens.
- Detección de sarcasmo en texto, según el nombre del repositorio; la model card no confirma la taxonomía de etiquetas ni el dominio de aplicación.
- Representaciones contextuales multilingües heredadas del modelo base XLM-RoBERTa-large (100 idiomas en el preentrenamiento), aunque el ajuste fino puede haber reducido el rendimiento fuera del idioma o dominio de entrenamiento.
- Extracción de embeddings de frase mediante la salida del encoder, reutilizable para búsqueda semántica o clustering si se descarta la cabeza de clasificación.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- No se documenta capacidad de clasificación multietiqueta ni de regresión; la cabeza es de clasificación simple.

## Casos de uso

- Moderación de comunidades en línea: el modelo puede puntuar comentarios y publicaciones para señalar posibles mensajes sarcásticos o irónicos que los filtros léxicos convencionales no detectan, ayudando a priorizar la revisión humana en foros y redes.
- Análisis de opinión en redes sociales: clasificar tuits o reseñas como sarcásticas permite separar opiniones genuinas de comentarios irónicos antes de agregar sentimiento, reduciendo el ruido en los informes.
- Investigación en procesamiento de lenguaje natural: servir como línea base reproducible para experimentos de detección de sarcasmo en castellano u otros idiomas, dado que la licencia MIT permite reutilización y comparación.
- Enriquecimiento de datasets de entrenamiento: etiquetar automáticamente grandes volúmenes de texto con una etiqueta de sarcasmo preliminar que luego se valida manualmente, acelerando la anotación.
- Análisis de conversaciones de atención al cliente: detectar respuestas sarcásticas de usuarios en tickets o chats para enrutarlas a agentes humanos con contexto adicional, evitando respuestas automáticas inadecuadas.
- Filtrado previo en pipelines de análisis de sentimiento: como etapa de preprocesado que descarta o marca mensajes irónicos antes de aplicar un modelo de sentimiento, mejorando la precisión del pipeline global.
- Detección de toxicidad encubierta: el sarcasmo suele acompañar a mensajes pasivo-agresivos; el modelo puede usarse como señal auxiliar en sistemas de moderación que combinen varias puntuaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no documentado):

| Metrica | Valor |
|---|---|
| Loss (evaluación, mejor época) | 0,2734 |
| Accuracy | 0,9364 |
| F1 Macro | 0,9330 |
| F1 Weighted | 0,9363 |

Evolución por época según la model card:

| Epoca | Validation loss | Accuracy | F1 macro | F1 weighted |
|---|---|---|---|---|
| 1 | 0,3784 | 0,8723 | 0,8579 | 0,8676 |
| 2 | 0,1997 | 0,9270 | 0,9227 | 0,9266 |
| 3 | 0,2467 | 0,9296 | 0,9258 | 0,9294 |
| 4 | 0,2734 | 0,9364 | 0,9330 | 0,9363 |
| 5 | 0,4208 | 0,9298 | 0,9256 | 0,9294 |
| 6 | 0,5145 | 0,9314 | 0,9272 | 0,9310 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con otros modelos. El model-index del repositorio está vacío. Los valores anteriores corresponden a un conjunto de evaluación no descrito, por lo que no son directamente comparables con resultados publicados en literatura.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB de pesos más activaciones; en la práctica, unos 3-4 GB para batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB de pesos; unos 2-3 GB con activaciones para batch pequeño.
- VRAM estimada en int8: aproximadamente 0,6 GB de pesos; viable en GPUs consumer de gama baja.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en batch pequeño; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para throughput alto, A100/H100 o L4.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y similares; también en CPUs para inferencia de baja concurrencia.
- Opciones de despliegue: transformers con pipeline de `text-classification`, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), ONNX Runtime, TorchScript, o servidores propios con FastAPI. No se documenta soporte de vLLM ni llama.cpp (no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia arquitectónica, un encoder de 560 M de parámetros procesa secuencias de 512 tokens en decenas de milisegundos por lote en una GPU moderna, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanmorc/xlmr-sarcasmo-bs32 | 559,9 M | 512 tokens (límite del base) | Clasificación de sarcasmo (presunta) | MIT | Hugging Face, 25 descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe (MLM) | MIT | Hugging Face, ampliamente usado |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens | Análisis de sentimiento multilingüe | MIT | Hugging Face, muy descargado |
| roberta-large-mnli (varios autores) | ~355 M | 512 tokens | Inferencia de lenguaje natural | MIT | Hugging Face |

La comparación con alternativas de detección de sarcasmo específicas no está disponible en la información proporcionada. El modelo base XLM-RoBERTa-large es la referencia natural para evaluar la ganancia del ajuste fino, pero no se han publicado métricas comparativas en este repositorio.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento y evaluación no está documentado ("unknown dataset"), lo que impide evaluar la representatividad, el idioma y el dominio del modelo.
- El accuracy de 0,9364 procede de un conjunto de evaluación no descrito; no es verificable de forma independiente y puede reflejar sobreajuste al dominio de origen.
- El modelo base XLM-RoBERTa-large se preentrenó con datos web multilingües, por lo que puede heredar sesgos de género, etnia, religión y nacionalidad presentes en esos datos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en textos irónicos que no son sarcásticos o en sarcasmo sutil dependiente de contexto cultural.
- El límite de 512 tokens del encoder trunca entradas largas; conversaciones o documentos extensos deben dividirse en fragmentos, lo que puede perder el contexto necesario para detectar ironía.
- No se declaran idiomas soportados; aunque el modelo base es multilingüe, el ajuste fino puede haber degradado el rendimiento fuera del idioma de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- El repositorio tiene muy poca tracción (25 descargas, 0 likes) y no hay paper, demo ni discusión asociada; conviene tratarlo como artefacto experimental.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), lo que dificulta la auditoría del modelo.
- No se especifica el número de etiquetas ni su semántica exacta; antes de usarlo en producción hay que inspeccionar `config.json` y validar la salida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/juanmorc/xlmr-sarcasmo-bs32
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
- Documentación de transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
