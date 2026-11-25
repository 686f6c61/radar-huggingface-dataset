# feathery23333/jigsaw-toxic-comment-deberta-v3-base

## Resumen

jigsaw-toxic-comment-deberta-v3-base es un modelo de clasificación de texto multi-etiqueta desarrollado por el usuario feathery23333 como parte de un proyecto de curso universitario. Se trata de un ajuste fino (fine-tuning) del modelo base microsoft/deberta-v3-base sobre el conjunto de datos Jigsaw Toxic Comment Classification Challenge, orientado a detectar toxicidad en comentarios en inglés. El modelo produce seis puntuaciones independientes mediante sigmoide para las categorías toxic, severe_toxic, obscene, threat, insult e identity_hate.

El modelo resuelve un problema clásico de moderación de contenido: la identificación automática de comentarios tóxicos en plataformas de discusión. Su relevancia radica en que reproduce, con un único modelo, parte del trabajo de un ensemble original del proyecto de curso, alcanzando un ROC-AUC medio de 0,98812 en el conjunto de validación retenido. El repositorio incluye los pesos entrenados, los scripts de entrenamiento y predicción, aunque no el ensemble original ni los checkpoints previos.

Con 184,4 millones de parámetros y un tamaño de repositorio de 0,7 GB, es un modelo de tamaño medio que puede desplegarse en hardware de consumo. La longitud máxima de entrada utilizada en entrenamiento es de 256 tokens, con una estrategia de truncamiento que conserva el inicio y el final de los comentarios largos. El modelo está entrenado únicamente en inglés y no se ha publicado información sobre su licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (DeBERTa-v3-base) |
| Parámetros totales | 184.426.758 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento; la arquitectura base soporta hasta 512) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3-base de Microsoft, un transformer encoder con atención desenredada (disentangled attention) y mecanismo de atención relativa. Sobre esta base se añadió una cabeza de clasificación multi-etiqueta con seis salidas independientes, activadas mediante función sigmoide y entrenadas con pérdida de entropía cruzada binaria (binary cross-entropy) para cada etiqueta.

El ajuste fino se realizó durante una sola época sobre el conjunto de entrenamiento original de Jigsaw, accedido a través del espejo público Heliosoph/Jigsaw-Toxic-Comments. Se aplicó una división aleatoria 90/10 con semilla 42, resultando en 143.613 comentarios de entrenamiento y 15.958 de validación. La longitud máxima se fijó en 256 tokens, reteniendo el inicio y el final de los comentarios más largos mediante una estrategia de truncamiento cabeza-cola. El entrenamiento se llevó a cabo en una única GPU NVIDIA A100, con tamaño de lote 8 y tasa de aprendizaje 2e-5. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Clasificación multi-etiqueta de toxicidad en comentarios en inglés, con seis categorías independientes: toxic, severe_toxic, obscene, threat, insult e identity_hate.
- Producción de puntuaciones continuas mediante sigmoide, que permiten umbrales ajustables según el caso de uso (aunque el autor no proporciona umbrales optimizados).
- Manejo de comentarios largos mediante truncamiento cabeza-cola que preserva información del inicio y del final del texto.
- Capacidad de detectar múltiples etiquetas simultáneas en un mismo comentario (por ejemplo, un comentario puede ser a la vez obsceno e insultante).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; es exclusivamente un clasificador.
- Capacidades multilingües limitadas al inglés; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Moderación de comentarios en foros y wikis: el modelo puede puntuar cada comentario con las seis etiquetas de toxicidad y priorizar la revisión humana de aquellos con puntuaciones altas en categorías graves como threat o identity_hate. Es adecuado por su entrenamiento específico en texto de páginas de discusión de Wikipedia.
- Filtrado previo en plataformas de noticias o blogs: integrado en un pipeline de ingestión de comentarios, puede descartar automáticamente contenido con alta puntuación en obscene o severe_toxic antes de la publicación, reduciendo la carga de moderadores.
- Análisis de toxicidad en investigación social: investigadores pueden usar las seis dimensiones para estudiar la prevalencia de distintos tipos de toxicidad en corpus de comentarios en inglés, aunque deben tener en cuenta que las puntuaciones no están calibradas.
- Sistemas de alerta temprana para comunidades online: el modelo puede ejecutarse por lotes sobre comentarios históricos para identificar patrones de toxicidad y generar informes agregados por categoría, útil para administradores de comunidades.
- Componente de un ensemble de moderación: dado su carácter de modelo único, puede combinarse con otros clasificadores o con reglas heurísticas para mejorar la precisión en producción, especialmente en las etiquetas raras como threat.
- Evaluación comparativa de modelos de toxicidad: sirve como referencia base para experimentos académicos que comparen arquitecturas DeBERTa con otros transformers en tareas de clasificación multi-etiqueta, gracias a sus métricas de validación publicadas.
- Preprocesamiento en pipelines de anotación: puede utilizarse para pre-etiquetar grandes volúmenes de comentarios y acelerar el trabajo de anotadores humanos, que revisarían y corregirían las predicciones del modelo.

## Benchmarks y rendimiento

| Etiqueta | ROC-AUC (validación) |
|---|---|
| toxic | 0,98916 |
| severe_toxic | 0,99140 |
| obscene | 0,99468 |
| threat | 0,98508 |
| insult | 0,99066 |
| identity_hate | 0,97777 |
| **Media de las seis etiquetas** | **0,98812** |

Estas cifras provienen del 10% retenido del conjunto de entrenamiento (15.958 comentarios) y no de la prueba oficial de Kaggle ni del leaderboard. El autor advierte que las estimaciones para etiquetas raras pueden variar según la división y que el modelo no ha sido evaluado de forma independiente en el conjunto de prueba oficial en esta ejecución. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 184 millones de parámetros, en precisión FP32 requiere aproximadamente 0,74 GB solo para los pesos; en FP16, unos 0,37 GB. Con overhead de activaciones y tokens de entrada (256), el consumo total puede situarse en torno a 1-2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. Una NVIDIA A100 o H100 no son necesarias para inferencia; se usaron en entrenamiento. GPU de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas modernas pueden manejar la inferencia sin problemas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con más de 2 GB de VRAM. También puede ejecutarse en CPU con latencia aceptable para lotes pequeños.
- Opciones de despliegue: el repositorio incluye un script `predict.py` que requiere las dependencias de `requirements.txt`. Al ser un modelo DeBERTa-v3, es compatible con la librería Transformers de Hugging Face y puede servirse con Text Generation Inference (TGI) o con un pipeline de `text-classification`. No se menciona soporte para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo y la longitud de secuencia de 256 tokens, se espera una latencia de milisegundos por comentario en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| feathery23333/jigsaw-toxic-comment-deberta-v3-base | 184,4 M | 256 tokens (entrenamiento) | Clasificación multi-etiqueta de toxicidad (6 etiquetas) | no disponible | Hugging Face |
| microsoft/deberta-v3-base | 184,4 M | 512 tokens | Modelo base (no ajustado para toxicidad) | MIT | Hugging Face |
| unitary/toxic-bert | ~110 M | 512 tokens | Clasificación multi-etiqueta de toxicidad (6 etiquetas) | Apache 2.0 | Hugging Face |
| facebook/roberta-base | ~125 M | 512 tokens | Modelo base (no ajustado para toxicidad) | MIT | Hugging Face |

La comparativa se limita a modelos de tamaño similar o de la misma tarea. No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de benchmarks. El modelo de unitary/toxic-bert es el referente más directo en la tarea, pero sus métricas no se incluyen aquí para no inventar datos.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se realizó sobre comentarios de páginas de discusión de Wikipedia en inglés, por lo que el modelo puede tener sesgos hacia ese dominio y estilo de escritura. El autor advierte que el rendimiento puede cambiar en otras plataformas, idiomas, grupos o contextos, incluyendo citas, sátira y lenguaje reclamado.
- Riesgo de alucinación: al ser un clasificador, no genera texto y por tanto no alucina en el sentido generativo; sin embargo, las puntuaciones pueden ser erróneas o poco fiables en casos ambiguos, especialmente en etiquetas raras como threat o identity_hate.
- Limitaciones de contexto o idioma: la longitud máxima de entrenamiento es de 256 tokens, con truncamiento cabeza-cola; comentarios más largos pueden perder información intermedia. El modelo solo está entrenado en inglés y no se ha evaluado en otros idiomas.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si permite uso comercial. Se recomienda contactar con el autor o consultar el repositorio antes de un despliegue comercial.
- Caveats para producción: las puntuaciones no están calibradas como probabilidades y no se proporciona un umbral de decisión optimizado. Las métricas reportadas provienen de una división de validación propia, no del conjunto de prueba oficial de Kaggle, y el modelo no ha sido evaluado de forma independiente. Las seis salidas pueden solaparse y deben revisarse en contexto antes de usarse para moderación. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feathery23333/jigsaw-toxic-comment-deberta-v3-base
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset espejo: https://huggingface.co/datasets/Heliosoph/Jigsaw-Toxic-Comments
- Competición original de Kaggle: https://www.kaggle.com/c/jigsaw-toxic-comment-classification-challenge
