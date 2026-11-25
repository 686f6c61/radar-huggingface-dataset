# kadi4655/lahjti-intent

## Resumen

`kadi4655/lahjti-intent` es un modelo de clasificación de texto publicado en Hugging Face por el usuario kadi4655. Según los metadatos del repositorio, se trata de un modelo basado en arquitectura BERT con 109.085.958 parámetros totales, empaquetado tanto en formato safetensors como ONNX, y orientado a la tarea de clasificación de texto (probablemente detección de intenciones, a juzgar por el sufijo "intent" del identificador). El repositorio ocupa 0,5 GB e incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con los endpoints de inferencia de Hugging Face.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con 0 descargas y 0 "likes", y su model card es la plantilla autogenerada por Hugging Face sin ningún campo completado. No se dispone de información sobre el desarrollador, el conjunto de datos de entrenamiento, el procedimiento de ajuste fino ni los resultados de evaluación. El único dato técnico verificable es el recuento de parámetros extraído de los pesos en safetensors y la arquitectura declarada en las etiquetas (BERT).

Por tanto, esta ficha debe interpretarse como una descripción estructural del artefacto publicado, no como una evaluación de sus capacidades reales. Cualquier uso en producción requeriría una validación empírica propia, dado que el autor no ha documentado el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, según etiqueta `bert`) |
| Parametros totales | 109.085.958 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La etiqueta `bert` del repositorio indica que el modelo sigue la arquitectura transformer encoder de BERT, con 109 millones de parámetros totales. Este recuento es coherente con la familia BERT-base (aproximadamente 110 millones de parámetros), aunque no se puede confirmar si se trata de un checkpoint derivado de `bert-base` o de una variante con vocabulario o cabecera de clasificación modificados. La presencia de una cabecera de clasificación de texto es consistente con el pipeline declarado (`text-classification`) y con el sufijo "intent" del nombre, que apunta a una tarea de detección de intenciones en diálogo.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, el régimen de precisión (fp32, fp16, bf16), la existencia de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card es la plantilla por defecto de Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]". El repositorio incluye una exportación a ONNX además de los pesos en safetensors, lo que facilita el despliegue en entornos de inferencia optimizados, pero no se documenta el proceso de exportación ni las opsets utilizadas.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la salida esperada es una distribución de probabilidad sobre un conjunto de etiquetas definido por el autor (no documentado).
- Detección de intenciones: el identificador del modelo sugiere un uso previsto para clasificar la intención de una consulta o turno de diálogo, aunque no se especifica el conjunto de etiquetas ni el dominio.
- Compatibilidad con Text Embeddings Inference: la etiqueta `text-embeddings-inference` indica que el modelo puede servirse mediante el stack TEI de Hugging Face, aunque para clasificación la integración habitual es a través de `transformers` o de endpoints de inferencia.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede desplegarse en los Inference Endpoints gestionados de Hugging Face.
- Generación de texto: no disponible; el modelo es un encoder de clasificación, no un modelo generativo.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo podría emplearse para etiquetar el turno de un usuario con una intención predefinida (por ejemplo, consulta de saldo, cancelación, información), siempre que se valide previamente el conjunto de etiquetas y el dominio con datos propios, dado que el autor no los documenta.
- Enrutamiento de tickets de soporte: integrado en un pipeline de atención al cliente, el clasificador podría dirigir cada ticket al equipo correspondiente; requiere una evaluación previa sobre el corpus real de la organización porque se desconoce el dominio de entrenamiento.
- Filtrado y moderación de contenido: como clasificador binario o multiclase, podría etiquetar mensajes según categorías de riesgo, aunque la ausencia de documentación sobre sesgos y datos de entrenamiento hace imprescindible una auditoría propia.
- Preprocesado en pipelines RAG: el modelo podría clasificar la consulta del usuario antes de la recuperación para seleccionar la fuente de conocimiento adecuada, aprovechando su reducido tamaño (109 M de parámetros) para mantener baja la latencia.
- Extracción de intención en analítica de producto: para agregar y etiquetar grandes volúmenes de feedback de usuarios (reseñas, encuestas) y construir métricas por categoría, con la ventaja de que el modelo cabe en CPU y puede procesar lotes grandes.
- Despliegue en el edge o en contenedores ligeros: gracias a su tamaño y a la exportación ONNX, puede ejecutarse en entornos con recursos limitados (por ejemplo, funciones serverless o dispositivos con CPU), siempre que se acepte el riesgo de un modelo sin documentación.
- Base para ajuste fino adicional: al ser un checkpoint BERT de ~109 M de parámetros, puede servir como punto de partida para un ajuste fino supervisado en una tarea de clasificación concreta, aunque se desconoce su procedencia exacta y conviene comparar con `bert-base-uncased` como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 109 M de parámetros ocupan aproximadamente 0,44 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más; en fp16, el peso se reduce a unos 0,22 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan A100, H100 o L4 por su throughput, pero el modelo no las requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (por la exportación incluida), Text Embeddings Inference (etiqueta declarada), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y `optimum` para la ruta ONNX.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. A modo orientativo, un BERT-base en una GPU moderna procesa cientos de secuencias por segundo en lotes, pero esta cifra no está confirmada para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kadi4655/lahjti-intent | 109.085.958 | no disponible | Clasificación de texto | no disponible | Hugging Face (0 descargas) |
| google-bert/bert-base-uncased | ~110 M | 512 tokens |Encoder base, ajustable | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert/distilbert-base-uncased | ~66 M | 512 tokens | Encoder base, ajustable | Apache 2.0 | Hugging Face, ampliamente usado |
| FacebookAI/roberta-base | ~125 M | 512 tokens | Encoder base, ajustable | MIT | Hugging Face, ampliamente usado |

La comparación se limita a alternativas de la misma familia (encoders BERT-like de tamaño similar) porque no se dispone de información sobre el rendimiento del modelo evaluado. Frente a `bert-base-uncased`, el modelo de kadi4655 no documenta licencia ni datos de entrenamiento, lo que supone una desventaja clara para uso comercial; frente a `distilbert-base-uncased`, es aproximadamente un 65 % más grande sin que se conozca una mejora de rendimiento que lo justifique.

## Limitaciones y advertencias

- Model card vacía: todos los campos de la documentación están sin completar, incluidos desarrollador, datos de entrenamiento, evaluación y consideraciones de sesgo.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara para producción.
- Idiomas no declarados: se desconoce si el modelo está entrenado en inglés, castellano u otros idiomas, lo que impide garantizar su comportamiento fuera del dominio original.
- Dominio y etiquetas desconocidos: no se especifica el conjunto de etiquetas ni la tarea exacta, por lo que cualquier uso requiere inspeccionar la cabecera de clasificación (`config.json`) y validar con datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o sobreconfiadas en entradas fuera de distribución.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento, no se pueden evaluar sesgos de género, raza o dominio.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican ausencia de revisión por parte de la comunidad; no hay evidencia independiente de su calidad.
- Procedencia incierta: no se indica el checkpoint base del que deriva, lo que dificulta la trazabilidad y la reproducibilidad.
- Fecha de creación futura: los metadatos indican 2026-11-25, lo que puede reflejar un error de reloj o una fecha artificial; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadi4655/lahjti-intent
- Paper de referencia citado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de Inference Endpoints: https://huggingface.co/docs/inference-endpoints
