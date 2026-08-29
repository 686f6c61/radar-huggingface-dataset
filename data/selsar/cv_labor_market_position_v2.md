# selsar/cv_labor_market_position_v2

## Resumen

El modelo `selsar/cv_labor_market_position_v2` es un clasificador de texto basado en la arquitectura DeBERTa-v2, publicado por el usuario de Hugging Face selsar (Selma Sarenkapa). Su nombre sugiere que está diseñado para predecir la posición de un currículum vitae en el mercado laboral, probablemente asignando una categoría o nivel profesional a partir del texto del CV. Sin embargo, la model card oficial está completamente vacía: no incluye descripción, datos de entrenamiento, licencia ni métricas de evaluación, por lo que toda funcionalidad concreta debe considerarse no confirmada.

El modelo tiene 278.810.882 parámetros y un tamaño de repositorio de 1,1 GB en formato safetensors, lo que lo sitúa en la gama de modelos transformer de tamaño medio. Está etiquetado para clasificación de texto y es compatible con la librería `transformers` y con Text Embeddings Inference (TEI). A pesar de su potencial utilidad en tareas de selección de personal o análisis de CVs, la ausencia total de documentación y de resultados de evaluación limita seriamente su uso en producción sin una validación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer con attention disentangled) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DeBERTa-v2, un transformer que introduce el mecanismo de *disentangled attention*: en lugar de depender únicamente de las posiciones absolutas, modela por separado las relaciones de contenido y de posición relativa entre tokens. Esta variante ha demostrado mejoras en tareas de comprensión del lenguaje natural frente a BERT y RoBERTa. El modelo concreto tiene 278 millones de parámetros, un tamaño intermedio entre las versiones base y large de DeBERTa-v2.

No se dispone de ninguna información sobre el proceso de entrenamiento: ni el conjunto de datos utilizado, ni el número de tokens, ni si se aplicó fine-tuning sobre un checkpoint previo, ni el régimen de entrenamiento (fp16, bf16, etc.). La model card no menciona ningún procedimiento de ajuste ni hiperparámetros. Tampoco se indica si hubo etapas de alineación como RLHF o DPO, algo poco habitual en modelos de clasificación de este tipo.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo asigna una o varias etiquetas a un texto de entrada.
- Posible clasificación de posición laboral: el nombre del modelo sugiere que está entrenado para categorizar CVs según su posición en el mercado laboral (por ejemplo, nivel de seniority, sector, o tipo de ocupación), pero esta funcionalidad no está documentada.
- Compatibilidad con Text Embeddings Inference (TEI): el tag `text-embeddings-inference` indica que puede desplegarse con esta herramienta para servir inferencias de forma eficiente.
- No se conocen capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

Dado que la documentación es inexistente, los siguientes casos de uso son hipotéticos, basados únicamente en el nombre del modelo y en el dominio de aplicación que sugiere. Deben validarse empíricamente antes de cualquier uso real.

- Filtrado automático de currículums: el modelo podría integrarse en un pipeline de selección de personal para clasificar CVs en categorías predefinidas (por ejemplo, perfil junior, mid-level, senior) y priorizar candidaturas según la posición laboral detectada.
- Análisis de ofertas y demanda laboral: aplicado a descripciones de empleo o a CVs anonimizados, podría ayudar a mapear la distribución de perfiles profesionales en un mercado concreto.
- Enriquecimiento de bases de datos de talento: en plataformas de empleo, el modelo podría etiquetar automáticamente los perfiles de los usuarios para mejorar la búsqueda y el emparejamiento con ofertas.
- Estudios sociolaborales: investigadores podrían usar el modelo para clasificar grandes volúmenes de CVs y analizar tendencias de movilidad profesional, siempre que se valide su precisión.
- Sistemas de recomendación de formación: si el modelo identifica la posición laboral actual, podría sugerir cursos o reciclaje profesional orientado a la siguiente categoría.
- Automatización de informes de recursos humanos: integrado en herramientas de gestión de personal, podría generar resúmenes automáticos de la posición de los empleados dentro de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de exactitud, F1, AUC ni comparaciones con otros modelos en la model card ni en el repositorio. Cualquier afirmación sobre el rendimiento del modelo carece de respaldo empírico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parámetros, en fp32 el modelo ocupa aproximadamente 1,1 GB en memoria (coincide con el tamaño del repositorio). En fp16 ocuparía unos 557 MB, y en int8 unos 279 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 sin problemas. Una RTX 3060, RTX 4060 o superior sería suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo de tamaño moderado que cabe en GPUs de gama media.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, Hugging Face TGI, o mediante Text Embeddings Inference (TEI) según los tags. También es posible usarlo con `pipeline` de transformers en Python.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, una inferencia de clasificación sobre un texto corto debería completarse en decenas de milisegundos, pero esto es una estimación general, no un dato del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene documentación ni benchmarks, y no se conocen otros modelos del mismo autor con los que comparar directamente. Se podría comparar con otros DeBERTa-v2 fine-tuned para clasificación de texto, pero no hay datos públicos de rendimiento de este modelo concreto. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no proporciona información sobre el entrenamiento, los datos, la licencia ni el uso previsto. Esto impide conocer los sesgos, el dominio de aplicación y las condiciones legales de uso.
- Licencia no especificada: al no indicarse licencia, no está claro si el modelo puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Sesgos desconocidos: sin datos de entrenamiento, es imposible evaluar sesgos de género, raza, edad o nacionalidad que puedan estar presentes en el modelo, especialmente en un dominio tan sensible como la selección de personal.
- Riesgo de alucinación en clasificación: aunque es un modelo discriminativo, la falta de validación puede llevar a clasificaciones erróneas que afecten a decisiones de contratación.
- Idiomas no especificados: no se sabe si el modelo funciona solo en inglés, español u otros idiomas. Su uso con textos fuera del idioma de entrenamiento probablemente degrade el rendimiento.
- Sin garantías de precisión: al no existir benchmarks, no hay evidencia de que el modelo funcione correctamente para la tarea que su nombre sugiere.
- Fecha de creación futura: el modelo está fechado el 28 de agosto de 2026, lo que resulta anómalo y podría indicar un error en los metadatos o un modelo generado automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selsar/cv_labor_market_position_v2
- Perfil del autor: https://huggingface.co/selsar
- Modelo relacionado del mismo autor: https://huggingface.co/selsar/socio-economic_position
- Otros modelos del autor: https://huggingface.co/selsar/nli-multilabel-professionsalstatus-new
