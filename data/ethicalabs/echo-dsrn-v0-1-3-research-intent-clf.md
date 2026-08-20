# ethicalabs/Echo-DSRN-v0.1.3-Research-Intent-CLF

## Resumen

Echo-DSRN-v0.1.3-Research-Intent-CLF es un clasificador de intenciones de articulos cientificos desarrollado por ethicalabs como parte de su participacion en el OpenAIRE AI Hackathon 2026. El modelo lee el titulo y el resumen de un articulo de investigacion y predice una de cinco categorias: Methodology, Dataset, Review, Applied o Theoretical. Esta disenado para aplicaciones de streaming donde no se dispone de GPU, ya que la inferencia puede ejecutarse en CPU.

El modelo se basa en la arquitectura Echo-DSRN, una red neuronal recurrente hibrida de aproximadamente 98 millones de parametros, entrenada sobre una unica GPU AMD Radeon AI Pro R9700 usando ROCm 7.2. Es un fine-tuning del modelo base Echo-DSRN-114M-v0.1.2 sobre el dataset curado ethicalabs/Research-Intent-Curated, que incluye registros de PubMed, Semantic Scholar, Papers With Code y arXiv. Se distribuye bajo licencia Apache 2.0 y esta disponible en formato safetensors.

La relevancia de este modelo reside en su papel como componente central de una plataforma de clasificacion en tiempo real que consume metadatos del OpenAIRE Graph API, combinando la prediccion del modelo con un pipeline de validacion LLM-as-a-Judge que emplea once modelos de lenguaje distintos. Tras el hackathon, el modelo se reentrenara con las anotaciones humanas recopiladas y se publicara como version v0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Echo-DSRN (Red Neuronal Recurrente hibrida) |
| Parametros totales | 98.266.629 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Echo-DSRN es una arquitectura recurrente hibrida disenada para despliegue eficiente en tareas estrechas y bien definidas como clasificacion de intenciones, NER o clasificacion semantica. El modelo de clasificacion de secuencias consta de 8 bloques DSRN con dimension oculta de 512 y 4 cabezas de atencion, con un vocabulario de 32.017 tokens. Segun la documentacion del proyecto, la familia Echo-DSRN explora implementaciones descentralizadas de estado continuo con huellas de memoria O(1), abarcando de 98M a 2.0B de parametros para despliegue en entornos edge.

El entrenamiento se realizo como fine-tuning del modelo base Echo-DSRN-114M-v0.1.2 sobre el dataset curado Research-Intent-Curated, que incluye registros de PubMed, Semantic Scholar, Papers With Code y arXiv. El entrenamiento se ejecuto en una unica GPU AMD Radeon AI Pro R9700 con ROCm 7.2. No se especifica si se emplearon tecnicas de RLHF o DPO; la informacion disponible indica un fine-tuning supervisado convencional para clasificacion de secuencias.

## Capacidades

- Clasificacion de intenciones de articulos cientificos en cinco categorias: Methodology, Dataset, Review, Applied y Theoretical.
- Inferencia eficiente en CPU, adecuada para aplicaciones de streaming sin GPU.
- Procesamiento de titulo y resumen de articulos como entrada de texto.
- Integracion con el ecosistema Hugging Face Transformers mediante codigo personalizado (trust_remote_code=True).
- Soporte de precision bfloat16 para inferencia.
- Clasificacion binaria de intenciones con salida de probabilidades por clase.
- Disenado para tareas de enrutamiento de intenciones y clasificacion semantica en dominios cientificos.

## Casos de uso

- Clasificacion automatica de articulos en repositorios institucionales: el modelo puede procesar el flujo de nuevos articulos del OpenAIRE Graph API y etiquetarlos automaticamente por tipo de contribucion, facilitando la organizacion de colecciones cientificas.

- Filtrado de literatura para revisiones sistematicas: investigadores pueden pre-clasificar los resultados de busquedas bibliograficas en categorias como Review o Methodology, reduciendo el esfuerzo manual de seleccion de articulos relevantes.

- Deteccion de contribuciones de datasets y benchmarks: el modelo identifica articulos que introducen nuevos datasets, lo que permite a plataformas como Papers With Code o Kaggle indexar automaticamente nuevas contribuciones de datos.

- Enrutamiento de articulos en pipelines editoriales: revistas cientificas y conferencias pueden usar el modelo para asignar articulos a editores o revisores segun el tipo de contribucion (aplicada, teorica, metodologica).

- Analisis de tendencias de investigacion: agregando las predicciones del modelo sobre grandes volumenes de articulos, se pueden generar estadisticas sobre la distribucion de tipos de contribucion en diferentes campos y periodos temporales.

- Construccion de grafos de conocimiento cientifico: el modelo puede etiquetar nodos de articulos en grafos de conocimiento, permitiendo consultas semanticas como "muestrame todos los articulos de metodologia sobre aprendizaje profundo en 2024".

- Validacion cruzada en pipelines LLM-as-a-Judge: el modelo actua como clasificador base cuyas predicciones se contrastan con el consenso de once modelos de lenguaje, proporcionando una senal independiente y economica en el pipeline de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision o recall sobre conjuntos de validacion estandar, ni comparaciones cuantitativas con otros clasificadores de intenciones cientificas.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse en CPU, lo que lo hace adecuado para entornos sin aceleradores GPU.
- VRAM estimada: al ser un modelo de 98M de parametros en bfloat16, el uso de memoria en GPU seria inferior a 1 GB, aunque no se proporcionan cifras oficiales.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM podria ejecutar el modelo sin problemas, aunque no es necesario para inferencia.
- Opciones de despliegue: el modelo se integra con Hugging Face Transformers mediante codigo personalizado, y la documentacion menciona compatibilidad con vLLM. Tambien se puede ejecutar con PyTorch directamente.
- Latencia y throughput: no se proporcionan datos oficiales de latencia o throughput, pero el tamano del modelo sugiere tiempos de inferencia de pocos milisegundos por muestra en CPU moderna.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de intenciones cientificas con especificaciones equivalentes (mismo tamano, misma tarea y misma licencia) que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos potenciales en los datos de entrenamiento: el modelo se entreno sobre registros curados de PubMed, Semantic Scholar, Papers With Code y arXiv, que tienen una sobrerrepresentacion de ciertas disciplinas (biomedicina, informatica) y una infrarrepresentacion de otras (humanidades, ciencias sociales).
- Riesgo de alucinacion en clasificacion: al ser un clasificador de secuencias, el modelo puede asignar categorias incorrectas a articulos con titulos o resumenes ambiguos, especialmente en campos interdisciplinares.
- Limitaciones de idioma: el modelo solo soporta ingles, lo que excluye la clasificacion de articulos en otros idiomas.
- Dependencia de codigo personalizado: el modelo requiere trust_remote_code=True para cargarse, lo que implica ejecutar codigo arbitrario del repositorio y debe usarse con precaucion en entornos de produccion.
- Estado de desarrollo: el modelo es una version v0.1.3 creada para un hackathon, con una version v0.1.4 ya publicada como sucesora, lo que sugiere que esta version puede tener limitaciones de robustez.
- Longitud de contexto no documentada: no se especifica la longitud maxima de texto que el modelo puede procesar, lo que puede causar errores con resumenes muy extensos.
- Restricciones de datos: los datos del OpenAIRE Graph API se distribuyen bajo CC BY 4.0, lo que puede imponer requisitos de atribucion en aplicaciones derivadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ethicalabs/Echo-DSRN-v0.1.3-Research-Intent-CLF)
- [Repositorio GitHub de Echo-DSRN](https://github.com/ethicalabs-ai/Echo-DSRN/)
- [Demo en vivo](https://openaire-2026.ethicalabs.ai/)
- [Pagina de investigacion de Echo-DSRN](https://www.ethicalabs.ai/research/echo-dsrn/)
- [Repositorio del proyecto OpenAIRE AI Research Evaluator](https://github.com/ethicalabs-ai/OpenAIRE-AI-Research-Evaluator)
- [Pagina del OpenAIRE AI Hackathon 2026](https://innovation.openaire.eu/component/content/article/openaire-ai-hackathon.html)
- [OpenAIRE Graph API](https://graph.openaire.eu)
- [Dataset de entrenamiento Research-Intent-Curated](https://huggingface.co/datasets/ethicalabs/Research-Intent-Curated)
- [Modelo base Echo-DSRN-114M-v0.1.2](https://huggingface.co/ethicalabs/Echo-DSRN-114M-v0.1.2)
