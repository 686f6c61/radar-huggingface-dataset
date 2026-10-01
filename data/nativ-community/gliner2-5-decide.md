# nativ-community/GLiNER2.5-Decide

## Resumen

GLiNER2.5-Decide es un modelo de clasificación de texto basado en la arquitectura GLiNER 2.5 y publicado por el usuario nativ-community. Se trata de una conversión del modelo original fastino/GLiNER2.5-Decide a formato MLX-VLM, pensada para ejecutarse sobre Apple Silicon. El artefacto conserva únicamente las cabezas de decisión del modelo original (preguntas de tipo `choice` y `multi_label`) y omite las cabezas de span y de conteo, que no son necesarias para tareas de clasificación.

El modelo cuenta con 436.022.273 parámetros (unos 436 millones) y un repositorio de 1,7 GB, lo que sugiere que los pesos se distribuyen sin cuantizar. La configuración del encoder está embebida en el `config` raíz con `model_type: gliner2_5` y los pesos emplean los nombres de parámetro de MLX-VLM. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni datos de entrenamiento en la documentación proporcionada.

Su relevancia es práctica: permite integrar un clasificador de decisión ligero y de licencia Apache 2.0 en flujos que ya trabajan con MLX sobre hardware de Apple, sin necesidad de recurrir a PyTorch. Al ser una conversión de pesos de un modelo upstream, su calidad depende enteramente del modelo base fastino/GLiNER2.5-Decide.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer para clasificación (GLiNER 2.5, `model_type: gliner2_5`); número de capas y dimensiones no disponibles |
| Parametros totales | 436.022.273 (unos 436 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los dtypes originales se preservan sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con nombres de parámetro de MLX-VLM; configuración del encoder embebida en el `config` raíz |
| Librería | mlx-vlm |
| Pipeline | text-classification |
| Modelo base | fastino/GLiNER2.5-Decide (revisión `5a7adf72a23b4d311abae6ce050d7f0012bb3416`) |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La información disponible describe un encoder transformer cuya configuración se incorpora en el `config` raíz bajo `model_type: gliner2_5`. La arquitectura GLiNER está diseñada para formular tareas de extracción y clasificación como preguntas de decisión, de modo que el modelo responde a esquemas declarativos como `{"department": {"type": "choice", "criteria": ["billing", "technical", "sales"]}}`. Esta conversión concreta conserva las cabezas que resuelven preguntas de tipo `choice` y `multi_label` a través de la API de decisión compartida, y descarta las cabezas de span y de conteo del modelo upstream por no ser relevantes para clasificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de ajuste. Tampoco se detallan innovaciones técnicas adicionales más allá del propio enfoque de decisión de GLiNER. La conversión a MLX se validó con un test de humo: los 394 tensores cargados coinciden exactamente con la fuente preparada, cinco casos de decisión producen salidas idénticas antes y después de la conversión, y la comparación frente a los resultados de referencia de PyTorch guardados arroja un error máximo de puntuación de 0,001157. El propio autor advierte que estas comprobaciones son un test de conversión y no una evaluación de calidad de tarea.

## Capacidades

- Clasificación de texto mediante preguntas de decisión declarativas.
- Preguntas de tipo `choice`: selección de una categoría entre un conjunto de criterios (por ejemplo, departamentos o etiquetas mutuamente excluyentes).
- Preguntas de tipo `multi_label`: asignación de varias etiquetas simultáneas a un mismo texto.
- Configuración flexible de esquemas en tiempo de inferencia: las categorías y sus criterios se definen en la propia llamada, sin reentrenamiento.
- Ejecución nativa en MLX sobre Apple Silicon mediante la librería mlx-vlm.
- No se han documentado capacidades de generación de texto libre, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Capacidades multilingües: no disponible.
- No se ha documentado un modo de razonamiento (thinking) ni capacidades especiales adicionales.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada mensaje entrante en departamentos como facturación, soporte técnico o ventas mediante una pregunta de tipo `choice`, tal y como muestra el ejemplo oficial con la consulta "Please refund my duplicate charge".
- Análisis de sentimiento: definir criterios como positivo, neutro y negativo y obtener una etiqueta por reseña o comentario en un pipeline de monitorización de opiniones.
- Moderación de contenido multi-etiqueta: aplicar una pregunta de tipo `multi_label` para marcar simultáneamente categorías como toxicidad, spam y contenido fuera de tema en un mismo texto.
- Etiquetado de documentación interna: clasificar correos, informes o artículos en taxonomías corporativas definidas ad hoc en cada llamada, sin necesidad de reentrenar el modelo.
- Detección de intención en asistentes conversacionales: identificar la intención del usuario (consulta de estado, cancelación, cambio de plan) como paso previo al enrutado hacia el servicio correspondiente.
- Triaje de formularios y encuestas: clasificar respuestas abiertas en categorías predefinidas para su posterior análisis agregado.
- Filtrado de leads comerciales: asignar etiquetas de cualificación a formularios de contacto según criterios de sector, tamaño o interés declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única verificación documentada es un test de humo de la conversión, cuyos datos se recogen a continuación:

| Verificación | Resultado |
|---|---|
| Tensores cargados coincidentes con la fuente | 394 de 394 |
| Casos de decisión con salida idéntica pre/post conversión | 5 |
| Error máximo de puntuación frente a la referencia PyTorch | 0,001157 |

Estas cifras corresponden a un test de conversión y no deben interpretarse como una medida de calidad de clasificación.

## Requisitos de hardware

- El repositorio ocupa 1,7 GB, un tamaño coherente con 436 M de parámetros en precisión de 32 bits (436.022.273 × 4 bytes ≈ 1,74 GB). La VRAM necesaria para inferencia se sitúa en torno a esa cifra, más el espacio adicional para activaciones.
- Al estar empaquetado para MLX-VLM, el despliegue está pensado para Apple Silicon (chips de la familia M). No se ha validado su uso en GPU NVIDIA o AMD a partir de este artefacto.
- GPU recomendadas: no disponible. El requisito es un Mac con chip Apple Silicon y memoria unificada suficiente; no se especifica una cantidad mínima de memoria unificada.
- Encaje en GPU de consumo: no disponible para GPU dedicadas. En Mac, el modelo es lo bastante pequeño para ejecutarse en equipos con memoria unificada de gama media, aunque no se aporta una cifra oficial.
- Opciones de despliegue: mlx-vlm, y en concreto la rama de decisión GLiNER del repositorio (https://github.com/Blaizzy/mlx-vlm/tree/stack/gliner-decision), necesaria hasta que el soporte se fusione en la rama principal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/GLiNER2.5-Decide | 436 M | no disponible | safetensors (MLX-VLM) | apache-2.0 | HuggingFace, ejecución en Apple Silicon vía mlx-vlm |
| fastino/GLiNER2.5-Decide | no disponible | no disponible | no disponible | apache-2.0 (según el artefacto derivado) | HuggingFace |
| Otras alternativas de la familia GLiNER | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni tamaño de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado en clasificación: no genera texto libre ni resuelve tareas de razonamiento, código o matemáticas.
- Depende de una rama específica de MLX-VLM (gliner-decision) que aún no está fusionada en la rama principal; hasta que se integre, el despliegue requiere usar dicha rama.
- La validación publicada es un test de conversión, no una evaluación de calidad. No hay métricas de precisión, recall o F1 sobre tareas reales.
- Se han omitido las cabezas de span y de conteo del modelo upstream, por lo que este artefacto no puede usarse para extracción de entidades ni para tareas de conteo.
- Sesgos conocidos: no disponible. Al derivar de fastino/GLiNER2.5-Decide, hereda los sesgos de sus datos de entrenamiento, que no se documentan aquí.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o de asignación de etiquetas fuera del criterio esperado.
- Limitaciones de contexto e idioma: no disponible; se desconoce la ventana máxima y los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene verificar las condiciones del modelo base fastino/GLiNER2.5-Decide antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 30 de septiembre de 2026, por lo que carece de validación por parte de la comunidad.
- Para producción conviene convertir o servir el modelo base en PyTorch si el entorno destino no es Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Rama de MLX-VLM con soporte de decisión GLiNER: https://github.com/Blaizzy/mlx-vlm/tree/stack/gliner-decision
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a entidades homónimas sin relación.
