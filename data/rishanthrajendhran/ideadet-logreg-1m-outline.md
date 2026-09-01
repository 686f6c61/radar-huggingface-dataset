# rishanthrajendhran/ideadet-logreg-1m-outline

## Resumen

`rishanthrajendhran/ideadet-logreg-1m-outline` es un detector de texto generado por IA a nivel de ideas, desarrollado por Rishanth Rajendhran. A diferencia de los detectores convencionales que analizan la superficie textual (estilo, estadísticas de tokens), este modelo intenta determinar **de quién son las ideas** contenidas en un documento, no quién tecleó las frases. Forma parte de la familia "ideadet" del mismo autor, que incluye también una variante basada en un adaptador LoRA sobre NVIDIA Nemotron 30B.

La variante `logreg` utiliza un modelo de regresión logística, lo que la convierte en una solución extremadamente ligera en comparación con la alternativa basada en LLM. Según la información del modelo hermano (`ideadet-nemotron30b-1m-outline`), el enfoque consiste en entrenar sobre un corpus de un millón de lecturas y, en inferencia, procesar un outline del documento con roles etiquetados y parafraseado (de-leaked). La puntuación se obtiene comparando las log-probabilidades del siguiente token entre las etiquetas `human` y `ai`, normalizadas bidireccionalmente para obtener P(human), y el detector se activa cuando esta probabilidad cae por debajo de un umbral calibrado.

El modelo está publicado bajo licencia Apache 2.0, pero su acceso está **restringido** (gated) en HuggingFace, por lo que es necesario aceptar condiciones antes de poder descargarlo. El repositorio tiene un tamaño de 0.0 GB, coherente con el peso reducido de un modelo de regresión logística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (logreg) |
| Parametros totales | no disponible (pesos de regresion logistica, repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es una regresion logistica, no un transformer ni una red neuronal profunda. Esto implica que las características de entrada deben ser precomputadas por un pipeline externo (probablemente el mismo pipeline de "outline" con roles etiquetados descrito en la variante Nemotron). El entrenamiento se realiza sobre un corpus de un millón de lecturas (1m reads), aunque no se detalla la composición exacta del dataset ni el proceso de etiquetado.

En inferencia, el pipeline espera un outline del documento original, parafraseado para eliminar fugas de estilo superficial (de-leaked), con los roles de las ideas etiquetados. La puntuación se basa en la comparación de log-probabilidades entre los tokens `human` y `ai`, normalizadas para obtener una probabilidad P(human). El detector se activa cuando P(human) cae por debajo de un umbral calibrado. No se ha publicado información sobre el uso de RLHF, DPO u otras técnicas de alineación, ya que al tratarse de un clasificador lineal, estas no aplican directamente.

## Capacidades

- Detección de autoría de ideas: determina si las ideas de un documento provienen de un humano o de un modelo de IA, en lugar de analizar el estilo superficial.
- Clasificación binaria: produce una probabilidad P(human) con un umbral calibrado para decidir si el documento es "IA" o "humano".
- Resistencia a parafraseo: al operar sobre outlines parafraseados, reduce la fuga de estilo superficial que explotan otros detectores.
- Ligereza computacional: al ser regresión logística, la inferencia es prácticamente instantánea y no requiere GPU.
- Integración en pipelines de detección: puede combinarse con el pipeline de extracción de outlines con roles etiquetados para producir un detector completo.

## Casos de uso

- **Verificación de autoría académica**: un profesor o editor puede pasar el outline de un ensayo por el detector para comprobar si las ideas centrales fueron generadas por un LLM, incluso si el texto final ha sido parafraseado o reescrito.
- **Auditoría de contenido editorial**: medios de comunicación y agencias pueden verificar si los artículos recibidos contienen ideas generadas por IA, más allá de detectar texto copiado literalmente.
- **Filtrado en pipelines de generación**: empresas que generan contenido con LLMs pueden integrar el detector como validación de calidad para asegurar que las ideas finales sean revisadas o validadas por humanos antes de su publicación.
- **Investigación en detección de IA**: sirve como baseline ligero y reproducible para comparar con detectores basados en LLMs como la variante Nemotron 30B del mismo autor.
- **Análisis forense de documentos**: en contextos legales o de cumplimiento, permite evaluar si un documento contiene ideas originales humanas o derivadas de un modelo de IA, cuando el texto ha sido editado o mezclado.
- **Evaluación de datos de entrenamiento**: investigadores que construyen datasets pueden filtrar documentos con ideas generadas por IA para evitar contaminación en el entrenamiento de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión, recall, AUC ni comparaciones con otros detectores. La ausencia de descargas y la falta de documentación adicional impiden verificar el rendimiento real del modelo.

## Requisitos de hardware

- Inferencia en CPU: al ser una regresión logística, la inferencia se ejecuta en microsegundos en cualquier CPU moderna, sin necesidad de GPU.
- Memoria RAM: el peso del modelo es mínimo (repo de 0.0 GB), por lo que cabe en cualquier sistema, incluso en dispositivos embebidos.
- GPU: no requerida.
- Dependencias: se necesita el pipeline de extracción de outlines (no incluido en el repo aparentemente) para preprocesar los documentos antes de la inferencia.
- Opciones de despliegue: cualquier servidor HTTP ligero (FastAPI, Flask) o incluso funciones serverless (AWS Lambda, Cloud Functions) es suficiente para servir el modelo.
- Latencia: despreciable en la clasificación; el cuello de botella estaría en el preprocesado del outline.

## Comparativa con modelos similares

| Modelo | Enfoque | Params | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| ideadet-logreg-1m-outline | Regresión logística sobre outlines | no disponible | no disponible | Apache 2.0 | Gated |
| ideadet-nemotron30b-1m-outline | LoRA sobre Nemotron 30B A3B | ~30B (MoE, 3B activos) | no disponible | no disponible | no disponible |
| Detectores clásicos (GPTZero, Originality.ai) | Clasificadores sobre embeddings | no publicado | no aplica | Propietaria | Comercial |

La comparativa directa con otros detectores de IA (como GPTZero o Turnitin) no es posible con los datos disponibles, ya que esos productos no publican sus arquitecturas ni métricas. La diferencia clave de la familia ideadet es que opera a nivel de ideas, no de superficie textual.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptar condiciones en HuggingFace antes de su descarga; no es directamente accesible.
- **Documentación insuficiente**: no se han publicado detalles sobre las características de entrada, el formato exacto del outline, el umbral calibrado ni el proceso de entrenamiento.
- **Sin benchmarks publicados**: no es posible evaluar la precisión ni compararla con otros detectores.
- **Cobertura de idiomas desconocida**: no se especifica qué idiomas soporta el pipeline de outlines.
- **Riesgo de falsos positivos**: como cualquier detector de IA, puede clasificar texto humano como IA si las ideas son formuladas de manera muy estructurada o "plantilla", y viceversa.
- **Dependencia del pipeline externo**: el modelo por sí solo no funciona; requiere el preprocesado de outlines que no está documentado ni incluido en el repositorio.
- **Fecha de creación futura**: el modelo está fechado en septiembre de 2026, lo que sugiere que puede ser un artefacto experimental o de investigación sin validación en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rishanthrajendhran/ideadet-logreg-1m-outline
- Modelo hermano (variante Nemotron 30B): https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-1m-outline
- Perfil de GitHub del autor: https://github.com/RishanthRajendhran/
- Página personal del autor: https://rishanthrajendhran.github.io/
- Endpoint de inferencia de FriendliAI para la variante Nemotron: https://friendli.ai/models/rishanthrajendhran/ideadet-nemotron30b-1m-outline
