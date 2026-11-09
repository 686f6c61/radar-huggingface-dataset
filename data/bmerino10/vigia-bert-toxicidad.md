# bmerino10/vigia-bert-toxicidad

## Resumen

vigia-bert-toxicidad es un modelo de clasificación de toxicidad publicado por el usuario bmerino10 en Hugging Face. Se trata de un fine-tuning de BERT con 109.483.778 parámetros totales, distribuidos en un repositorio de 0,4 GB en formato safetensors. El modelo está etiquetado con la arquitectura bert y licencia CC0-1.0, lo que permite su uso sin restricciones de atribución.

El problema que aborda es la detección automática de contenido tóxico en texto, una tarea habitual en moderación de comunidades, filtrado de comentarios y salvaguardas de sistemas generativos. La elección de BERT como base es coherente con este tipo de tarea: un encoder bidireccional de ~110 millones de parámetros ofrece un coste de inferencia bajo y buen rendimiento en clasificación de secuencias cortas, en línea con referentes del ecosistema como unitary/toxic-bert.

La relevancia del modelo es limitada por su estado incipiente: no registra descargas ni likes, la model card pública está prácticamente vacía y no se han publicado resultados de benchmarks ni detalles de entrenamiento. Por tanto, debe evaluarse como un artefacto experimental que requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, según tag del repositorio) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a FP16/INT8 posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 109.483.778 parámetros, lo que corresponde al tamaño estándar de BERT-base (~110M). El modelo está orientado a clasificación de secuencias (toxicidad), aunque el pipeline no está declarado en la ficha de Hugging Face. El recuento de parámetros coincide con el de un checkpoint BERT-base con cabeza de clasificación.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de las clases, si hubo balanceo, ni si se aplicaron técnicas de mitigación de sesgo (por ejemplo, las estrategias de aumento de datos descritas en trabajos sobre toxic-bert para evitar asociar identidades frecuentemente atacadas con toxicidad). Tampoco se documentan hiperparámetros, epochs ni métricas de validación. La model card pública solo contiene la licencia.

## Capacidades

- Clasificación de texto orientada a detección de toxicidad, presumiblemente mediante una cabeza de clasificación sobre el encoder BERT.
- Procesamiento de secuencias cortas o medias de texto (límite exacto de tokens no disponible).
- Inferencia ligera en CPU o GPU de gama baja gracias a su tamaño de ~110M de parámetros.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades generativas.

## Casos de uso

- Moderación de comentarios en foros y comunidades: el modelo puede puntuar cada mensaje entrante y marcar aquellos con alta probabilidad de toxicidad para revisión humana, con un coste de inferencia bajo al ser un encoder de ~110M de parámetros.
- Filtrado previo en pipelines de contenido generado: actuar como clasificador de salvaguarda antes de publicar respuestas de un LLM, descartando o reescribiendo salidas tóxicas.
- Análisis de sentimiento y toxicidad en redes sociales: procesamiento por lotes de grandes volúmenes de publicaciones gracias a la eficiencia de BERT-base en GPU consumer.
- Investigación académica sobre sesgos en clasificación de toxicidad: al ser CC0-1.0, permite reproducir experimentos y comparar con modelos como unitary/toxic-bert sin restricciones de licencia.
- Prototipado rápido de APIs de moderación: despliegue con FastAPI o similar sobre CPU, sin necesidad de GPUs dedicadas.
- Evaluación comparativa de fine-tunings de BERT: sirve como checkpoint de referencia en estudios sobre detección de discurso de odio en castellano, siempre que se valide previamente su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~0,44 GB de pesos, más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- En FP16: ~0,22 GB de pesos; en INT8: ~0,11 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) y también en CPU para inferencia de baja latencia en textos cortos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Hugging Face TGI (si se configura como clasificador), o exportación a GGUF para llama.cpp/Ollama si se convierte el checkpoint.
- Latencia y throughput estimados: no disponibles; para BERT-base en GPU moderna se suele hablar de milisegundos por secuencia, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bmerino10/vigia-bert-toxicidad | 109,5M | no disponible | CC0-1.0 | Hugging Face, 0 descargas | Sin benchmarks ni model card sustantiva |
| unitary/toxic-bert | ~110M (BERT-base) | 512 tokens (estándar BERT) | no disponible en la información recogida | Hugging Face, ampliamente utilizado | Referente de toxicidad en inglés, con documentación y uso extendido |
| ChaitanyaMaripi/toxic-bert (GitHub) | ~110M (BERT-base) | 512 tokens (estándar BERT) | no disponible | GitHub | Fine-tuning de BERT para toxicidad, con discusión sobre sesgos de identidad |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, métricas, dataset ni instrucciones de uso, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de sesgos de identidad: los clasificadores de toxicidad basados en BERT tienden a asociar nombres de identidades frecuentemente atacadas con toxicidad, un problema documentado en la literatura y en proyectos como toxic-bert.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin validación empírica.
- Longitud de contexto no especificada; los textos largos pueden truncarse de forma no documentada.
- Licencia CC0-1.0: permite uso comercial sin restricciones, pero ello no exime de responsabilidad legal ni ética sobre las decisiones automatizadas que se tomen con el modelo.
- Sin descargas ni likes: no hay evidencia de uso en la comunidad ni de validación por terceros.
- No apto para producción sin una evaluación previa sobre un conjunto de datos propio y con revisión humana en el circuito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bmerino10/vigia-bert-toxicidad
- Referencia unitary/toxic-bert: https://huggingface.co/unitary/toxic-bert
- Repositorio GitHub toxic-bert (ChaitanyaMaripi): https://github.com/ChaitanyaMaripi/toxic-bert
