# MikaeelT/toxic-comment-classifier

## Resumen

El toxic-comment-classifier de MikaeelT es un modelo de clasificación de texto multietiqueta construido mediante el ajuste fino de `answerdotai/ModernBERT-base` sobre el conjunto de datos Jigsaw Toxic Comment Classification Challenge. Su propósito es detectar de forma simultánea seis categorías de toxicidad en comentarios en inglés: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult` e `identity_hate`. Se trata de un modelo de moderación de contenido, no generativo, pensado para integrarse en pipelines de filtrado automático.

El modelo emplea la arquitectura ModernBERT, una evolución del transformer encoder clásico que incorpora atención con rotación posicional (RoPE), alternancia entre atención local y global y un contexto nativo ampliado respecto a BERT original. Con 149,6 millones de parámetros, se sitúa en la misma escala que BERT-base pero con mejoras de eficiencia y ventana de contexto. La salida es un vector de seis logits que deben transformarse con sigmoid y compararse con umbrales por etiqueta.

Es relevante por su licencia MIT, su reducido tamaño (0,6 GB en safetensors) y su naturaleza discriminativa, que lo hace desplegable en hardware modesto para tareas de moderación en producción. No obstante, el autor lo describe como un proyecto de fin de asignatura (AIC354 Machine Learning Fundamentals, COMSATS University Islamabad), lo que conviene tener en cuenta al evaluar su madurez para entornos críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | 149.609.478 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base` y se ajusta como clasificador multietiqueta: se añade una cabeza de clasificación que proyecta la representación del token `[CLS]` (o equivalente) a seis logits, uno por categoría. ModernBERT incorpora innovaciones respecto a BERT clásico como embeddings posicionales rotatorios (RoPE), capas de atención que alternan entre ventanas locales y atención global, y una mayor eficiencia en secuencias largas. El modelo base tiene 149 millones de parámetros, coherente con el recuento del safetensors.

El entrenamiento se realizó sobre el dataset `tcapelle/jigsaw-toxic-comment-classification-challenge`, derivado del conocido reto de Jigsaw y Google. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de reequilibrado de clases, aunque la naturaleza multietiqueta y el fuerte desbalanceo del corpus Jigsaw hacen probable el uso de umbrales ajustados por etiqueta (el autor publica un `thresholds.json` para la inferencia). No se documenta el uso de RLHF ni DPO, algo esperable en un modelo discriminativo. La evaluación se realizó sobre 63.978 comentarios de test.

## Capacidades

- Clasificación multietiqueta de toxicidad en seis categorías: `toxic`, `severe_toxic`, `obscene`, `threat`, `insult`, `identity_hate`.
- Detección simultánea de múltiples categorías en un mismo comentario (un texto puede ser a la vez obsceno e insultante, por ejemplo).
- Salida de logits por etiqueta que, tras aplicar sigmoid y umbrales por etiqueta, permiten calibrar la sensibilidad del filtro.
- Moderación de contenido en inglés: filtrado de comentarios en plataformas, foros y sistemas de comentarios.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Moderación de comentarios en foros y plataformas: el modelo clasifica cada comentario entrante en las seis categorías y, aplicando los umbrales de `thresholds.json`, permite bloquear o marcar comentarios para revisión humana antes de su publicación.
- Filtrado previo en sistemas de comentarios de medios de comunicación: al ser un modelo de 149 millones de parámetros y 0,6 GB, puede ejecutarse en CPU o GPU modesta para prefiltrar grandes volúmenes de comentarios y reducir la carga de los moderadores humanos.
- Detección de discurso de odio en redes sociales: la etiqueta `identity_hate` permite identificar ataques dirigidos a colectivos, útil para sistemas de escalado y análisis de tendencias.
- Análisis de toxicidad en datasets de investigación: investigadores pueden usar el modelo para etiquetar corpus en inglés y estudiar la prevalencia de distintas formas de toxicidad, aprovechando la salida multietiqueta.
- Enrutamiento inteligente de quejas y reportes: en un sistema de atención al usuario, el modelo puede clasificar reportes de abuso y derivarlos al equipo adecuado según la categoría detectada (amenaza frente a insulto, por ejemplo).
- Auditoría de contenido generado por usuarios en comunidades técnicas: integrado como paso previo en pipelines de revisión, marca comentarios tóxicos antes de que lleguen a herramientas de análisis o a la vista pública.
- Señal auxiliar en sistemas de confianza y seguridad: combinado con otras señales (reputación del usuario, historial), el modelo aporta una puntuación de toxicidad por categoría que alimenta políticas de moderación configurables.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 63.978 comentarios de test:

| Métrica | Valor |
|---|---|
| Macro-F1 | 0,6137 |
| Micro-F1 | 0,6811 |
| ROC-AUC media | 0,9848 |

No se han publicado en la información disponible comparaciones directas con otros modelos de moderación (por ejemplo, variantes de BERT ajustadas al mismo dataset) ni resultados por etiqueta individual.

## Requisitos de hardware

- VRAM estimada: en fp32, aproximadamente 0,6 GB para los pesos (149,6 M de parámetros); en fp16, alrededor de 0,3 GB. Con overhead de activaciones y batch, un despliegue típico requiere menos de 2 GB de VRAM para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece buen throughput. Para altos volúmenes, A10G o L4 son adecuadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 2060 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI) para clasificación, ONNX Runtime, o exportación a GGUF no documentada. vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en lote), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MikaeelT/toxic-comment-classifier | 149,6 M | no disponible | Clasificación multietiqueta de toxicidad (6 etiquetas) | MIT | Hugging Face |
| BERT-base ajustado a Jigsaw | ~110 M | 512 tokens (BERT estándar) | Clasificación multietiqueta de toxicidad | variable según ajuste | Múltiples variantes en Hugging Face |
| RoBERTa-base ajustado a Jigsaw | ~125 M | 512 tokens | Clasificación multietiqueta de toxicidad | variable según ajuste | Múltiples variantes en Hugging Face |
| Detoxify (unitary/toxic-bert) | ~110 M | 512 tokens | Clasificación de toxicidad (6 etiquetas Jigsaw) | Apache 2.0 | Hugging Face, pip |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y las alternativas en la información proporcionada; los datos de Macro-F1 y ROC-AUC del modelo solo pueden contrastarse ejecutando las alternativas sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Jigsaw contiene sesgos demográficos y de anotación documentados en la literatura; el modelo puede sobrerreaccionar a determinadas variedades dialectales o a menciones de colectivos, especialmente en la etiqueta `identity_hate`.
- Riesgo de falsos positivos y falsos negativos: el Macro-F1 de 0,6137 indica un rendimiento moderado; las etiquetas minoritarias (`threat`, `severe_toxic`) probablemente tienen un rendimiento inferior, aunque no se publican métricas por etiqueta.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza; se recomienda calibrar los umbrales con datos propios.
- Limitación de idioma: solo inglés; no debe usarse con textos en castellano u otros idiomas sin reevaluación.
- Longitud de contexto: no documentada; los comentarios muy largos pueden truncarse y perder señal.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo se presenta como proyecto académico sin garantías de mantenimiento ni validación en producción.
- Caveat para producción: es un proyecto de asignatura con 0 descargas y 0 likes en el momento de la ficha; conviene validarlo exhaustivamente con datos propios y considerar alternativas con historial de uso en producción antes de desplegarlo en sistemas críticos de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MikaeelT/toxic-comment-classifier
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/tcapelle/jigsaw-toxic-comment-classification-challenge
- Paper de ModernBERT: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
