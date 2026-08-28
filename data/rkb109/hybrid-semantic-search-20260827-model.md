# RKB109/hybrid-semantic-search-20260827-model

## Resumen

El modelo `RKB109/hybrid-semantic-search-20260827-model` es un prototipo ligero y transparente de búsqueda semántica híbrida, desarrollado por el usuario RKB109. Está diseñado para entornos empresariales donde se necesita una calidad de recuperación explicable y no se dispone de APIs de embeddings (por coste, restricciones o indisponibilidad). El modelo combina pesos de tokens por etiqueta con recuperación de evidencia ponderada por IDF, ofreciendo una línea base reproducible sin depender de un LLM alojado.

Se trata de un modelo de tipo léxico, no neuronal, generado con datos sintéticos para demostraciones de arquitectura y comparaciones de referencia. Su tamaño es mínimo (el archivo del modelo ocupa 13,2 kB) y su licencia es MIT, lo que facilita su uso en entornos de desarrollo y evaluación. Aunque no es un modelo de deep learning, cubre tareas de similitud de frases, extracción de características, ranking de texto y respuesta a preguntas, según su ficha en Hugging Face.

La relevancia actual de este modelo radica en su papel como línea base transparente para validar pipelines de búsqueda híbrida, especialmente en contextos donde la explicabilidad y la reproducibilidad son prioritarias frente al rendimiento bruto. Su naturaleza sintética y su tamaño reducido lo hacen adecuado para prototipado rápido, integración en CI y experimentación educativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo léxico basado en pesos de tokens e IDF (no neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (formato propio, según la model card) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni redes neuronales. Se trata de un sistema de recuperación léxica que asigna pesos a cada token en función de la etiqueta o categoría a la que pertenece, y combina estos pesos con la frecuencia inversa de documento (IDF) para recuperar evidencia relevante. Este enfoque permite obtener resultados explicables, ya que cada decisión de ranking puede rastrearse hasta los pesos de los tokens y las estadísticas del corpus.

El entrenamiento se realizó sobre un dataset sintético generado por el propio autor (`RKB109/hybrid-semantic-search-20260827-dataset`). No se especifican detalles sobre el proceso de entrenamiento (número de épocas, optimizador, etc.), pero la model card indica que el proceso es reproducible mediante un repositorio de GitHub que incluye `train.py`, la división exacta del dataset y el código de evaluación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, dado que no es un modelo generativo.

## Capacidades

- Recuperación de documentos y ranking basado en similitud léxica ponderada por IDF.
- Similitud entre frases (sentence-similarity) mediante comparación de vectores de pesos de tokens.
- Extracción de características (feature-extraction) en forma de representaciones dispersas de tokens.
- Ranking de texto (text-ranking) para ordenar resultados según relevancia.
- Respuesta a preguntas (question-answering) en modo recuperativo, seleccionando pasajes relevantes.
- Búsqueda explicable: cada resultado puede justificarse mediante los pesos de tokens y las estadísticas IDF.
- Funcionamiento sin GPU ni dependencias de servicios externos, al ser un modelo puramente léxico.

## Casos de uso

- Prototipado de arquitecturas de búsqueda: permite validar rápidamente un pipeline de recuperación híbrida antes de integrar modelos de embeddings más complejos.
- Integración en pipelines de CI/CD: al ser ligero y determinista, puede ejecutarse en pruebas automatizadas para verificar la calidad de la recuperación en cada commit.
- Comparación de líneas base: sirve como referencia para medir la mejora de modelos basados en embeddings o cross-encoders en un mismo corpus.
- Evaluación de datasets sintéticos: útil para comprobar la coherencia de datos generados artificialmente antes de usarlos en entrenamiento de modelos más grandes.
- Experimentación educativa: permite a estudiantes y desarrolladores comprender los fundamentos de la búsqueda híbrida (combinación de BM25 e IDF) sin necesidad de infraestructura avanzada.
- Auditoría de sistemas de búsqueda: al ser transparente, facilita la revisión de decisiones de ranking en entornos regulados donde se requiere explicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta una evaluación interna sobre 4 ejemplos sintéticos retenidos, con una accuracy de 1,0. Las métricas previstas son `retrieval_accuracy`, `recall_at_3` y `mean_reciprocal_rank`, pero no se proporcionan valores numéricos adicionales. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo léxico de tamaño mínimo (13,2 kB), no requiere GPU ni hardware especializado.
- Puede ejecutarse en cualquier CPU, incluso en entornos embebidos o contenedores con recursos limitados.
- El consumo de memoria es despreciable (inferior a 1 MB en RAM).
- No necesita bibliotecas de deep learning; basta con un intérprete de Python y manejo de JSON.
- Opciones de despliegue: puede integrarse como un módulo Python en servicios web, funciones serverless o scripts de línea de comandos.
- La latencia es del orden de microsegundos por consulta, al tratarse de operaciones de diccionario y cálculo de IDF.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (líneas base léxicas para búsqueda híbrida). Aunque existen enfoques clásicos como BM25 o TF-IDF, no se han proporcionado datos concretos de comparación con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es sintético y muy pequeño (4 ejemplos de evaluación), por lo que el modelo no es representativo de datos reales.
- No debe utilizarse para decisiones consecuentes (por ejemplo, en entornos médicos, legales o financieros) sin una evaluación exhaustiva con datos representativos y revisión experta.
- Es una línea base léxica; su rendimiento será inferior al de modelos basados en embeddings o cross-encoders en tareas de búsqueda semántica compleja.
- No es un modelo generativo: no produce texto nuevo, solo recupera y ordena documentos existentes.
- No se especifican idiomas soportados; al ser un modelo léxico, su funcionamiento depende del vocabulario presente en el dataset sintético, que probablemente esté en inglés (por la región `us`).
- No se han documentado sesgos específicos, pero al entrenarse con datos sintéticos puede heredar sesgos de los datos generados.
- La licencia MIT permite uso comercial, pero la ausencia de garantías y la naturaleza experimental del modelo deben tenerse en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/hybrid-semantic-search-20260827-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20260827-dataset
