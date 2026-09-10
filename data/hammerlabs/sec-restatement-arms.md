# hammerlabs/sec-restatement-arms

## Resumen

`SEC Restatement Arms` es un recurso de investigación financiera publicado por `hammerlabs`, no un modelo de lenguaje. Se trata de nueve modelos de aprendizaje automático clásicos entrenados para clasificar reexpresiones financieras (restatements) en los archivos de la SEC, concretamente sobre la ventana de 2021 del dataset `sec-restatement-8k-402`. El proyecto combina tres conjuntos de características —presencia de etiquetas XBRL, bolsa de palabras (bag-of-words) y embeddings de frases— con tres algoritmos: random forest, histogram gradient boosting y regresión logística con regularización L2.

El recurso es relevante porque aborda un problema metodológico poco discutido: la selección del umbral de decisión en problemas de coste asimétrico. Los modelos se distribuyen deliberadamente sin un umbral ajustado, y el trabajo que los acompaña demuestra que elegir el umbral sobre los datos de entrenamiento puede inflar el coste de prueba hasta 5,5 veces, afectando más a los modelos más potentes. No es un modelo generativo: no tiene ventana de contexto, ni parámetros de red neuronal, ni soporte de herramientas. Es una colección de pickles de scikit-learn con sus mapas de características para garantizar la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de aprendizaje automatico clasicos de scikit-learn (random forest, histogram gradient boosting y regresion logistica L2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo con ventana de contexto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato pickle de scikit-learn) |
| Idiomas soportados | no disponible (no declarado; los documentos SEC estan en ingles, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | pickle (scikit-learn) |

## Arquitectura y entrenamiento

No se trata de una arquitectura de red neuronal generativa ni de un transformer. `SEC Restatement Arms` está compuesto por nueve estimadores independientes que surgen de combinar tres conjuntos de características con tres algoritmos de scikit-learn. Los conjuntos de características son: presencia de etiquetas XBRL (`numeric`), bolsa de palabras (`words`) y embeddings de frases (`embed`). Los algoritmos son random forest, histogram gradient boosting y regresión logística con regularización L2. Todos los modelos se ajustan sobre la ventana temporal de 2021 del dataset `sec-restatement-8k-402`.

La innovación técnica del recurso no reside en la arquitectura, sino en el tratamiento del umbral de decisión. Cada pickle incluye el estimador y su mapa de características, porque un modelo sin su vocabulario no es reproducible. El estudio que acompaña la publicación investiga el efecto de elegir un umbral de clasificación en problemas con coste asimétrico. Los autores concluyen que seleccionar el umbral sobre las filas con las que se entrenó el modelo infla el coste de prueba hasta 5,5 veces, y que este fenómeno está gobernado por lo completamente que el modelo memoriza su conjunto de entrenamiento, no por la calidad del modelo. Además, señalan que la calibración no puede reparar este problema, porque una transformación monótona no cambia qué filas selecciona un umbral. Por ello, los modelos se distribuyen sin umbral, recomendando al usuario elegir el suyo fuera de la muestra (out-of-fold o en un bloque reservado).

## Capacidades

- Clasificación binaria de reexpresiones financieras (SEC restatements) en documentos regulatorios.
- Acepta tres representaciones de entrada: presencia de etiquetas XBRL (`numeric`), bolsa de palabras (`words`) y embeddings de frases (`embed`).
- Cada modelo va acompañado de su mapa de características, lo que permite reproducir la transformación de entrada.
- No es un modelo generativo: no produce texto, no razona ni tiene capacidades de conversación.
- No soporta tool calling, function calling, ni integración con agentes.
- No tiene capacidades de visión ni de audio.
- El soporte multilingüe no está declarado, aunque el dataset de entrenamiento proviene de archivos de la SEC en inglés.
- Los modelos están entrenados específicamente para el contexto regulatorio estadounidense.

## Casos de uso

- Priorización de revisiones de auditoría: los modelos pueden ordenar los archivos 10-K según la probabilidad de que contengan una reexpresión, permitiendo a los equipos de auditoría centrarse en los documentos más arriesgados. Son adecuados porque funcionan con características XBRL y texto, que están disponibles de forma nativa en los archivos SEC.
- Investigación académica en contabilidad: los nueve modelos sirven como benchmark para comparar el rendimiento de distintas representaciones (XBRL, bag-of-words y embeddings) en la predicción de reexpresiones financieras. El recurso es valioso porque distribuye los mapas de características, lo que facilita la reproducibilidad de experimentos.
- Evaluación de costes asimétricos en clasificación: los modelos son útiles para estudiar el efecto de la selección de umbrales en escenarios donde una omisión (no detectar una reexpresión) es mucho más costosa que una falsa alarma. El proyecto proporciona las herramientas y el código (en el repositorio de GitHub) para medir esa sensibilidad.
- Análisis de riesgo de cumplimiento normativo: puede integrarse en un pipeline de análisis de documentos SEC para generar alertas tempranas de posibles irregularidades contables. Aunque los autores advierten de que no superan una línea base trivial bajo coste asimétrico, el modelo puede utilizarse como un componente más dentro de un sistema de puntuación de riesgo.
- Enseñanza de machine learning aplicado a finanzas: los pickles y el código asociado permiten a estudiantes y docentes explorar conceptos como cost-sensitive learning, memorización y selección de umbrales en datos reales de la SEC. Es un ejemplo práctico y reproducible de estos conceptos.
- Validación de datos XBRL: la variante `numeric` utiliza solo la presencia de etiquetas XBRL, lo que permite comprobar si la estructura de etiquetas de un documento ofrece señales predictivas de reexpresiones. Esto puede ser útil para auditores que necesitan una primera pasada automatizada sobre lotes grandes de archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card indica que, bajo un coste asimétrico donde una omisión vale diez falsas alarmas, ninguno de los modelos supera la línea base trivial de marcar todos los archivos como reexpresiones. Los autores recomiendan evaluar con `precision@k` a una capacidad de revisión determinada, en lugar de usar una métrica dependiente del ratio de costes.

| Benchmark | Resultado |
|---|---|
| MMLU | no publicado |
| HumanEval | no publicado |
| GSM8K | no publicado |
| Precisión bajo coste asimétrico (miss = 10 x falsa alarma) | los modelos no superan la línea base de predecir todo como positivo |

## Requisitos de hardware

- Los modelos son estimadores de scikit-learn y se ejecutan por completo en CPU. No requieren GPU ni VRAM para la inferencia.
- El tamaño del repositorio en HuggingFace se indica como 0.0 GB, lo que sugiere que los pickles son muy ligeros y pueden cargarse en cualquier máquina moderna con Python.
- No se ha especificado la memoria RAM mínima; al tratarse de modelos clásicos, es probable que sea inferior a 1 GB.
- Opciones de despliegue: se pueden cargar directamente en Python mediante `joblib.load` o `pickle.load`. No son compatibles con vLLM, Ollama, TGI ni llama.cpp, ya que no son modelos de lenguaje.
- Latencia y throughput: no disponibles. La inferencia con estos modelos debería ser casi instantánea en un CPU moderno, pero no se aportan medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría en las fuentes proporcionadas. El modelo es específico para la detección de reexpresiones de la SEC y no se han encontrado alternativas publicadas con características idénticas. La única referencia comparable es el propio dataset `sec-restatement-8k-402`, del que derivan los modelos. Por tanto, la comparación se limita a indicar "no disponible".

## Limitaciones y advertencias

- Los modelos se distribuyen sin un umbral de decisión. El usuario debe seleccionarlo fuera de la muestra de entrenamiento, preferiblemente de forma out-of-fold o en un bloque reservado. Usar un umbral ajustado sobre los datos de entrenamiento puede inflar el coste de prueba hasta 5,5 veces.
- Bajo coste asimétrico (una omisión vale diez falsas alarmas), ninguno de los nueve modelos supera la línea base trivial de marcar todos los documentos como reexpresiones. Esto es un hallazgo del estudio, no un defecto de los pesos, pero limita su utilidad como clasificador autónomo en ese escenario.
- Los modelos están entrenados únicamente sobre la ventana de 2021 del dataset. No hay evidencia de que generalicen a otros periodos ni a otras jurisdicciones.
- El conjunto de datos es específico de la SEC y del contexto regulatorio estadounidense. El modelo puede fallar en documentos de otros formatos o de otros países.
- No es un modelo generativo y no ofrece explicaciones en lenguaje natural de sus predicciones. La interpretabilidad depende de las características seleccionadas y de la inspección de los estimadores.
- Los pickles de scikit-learn pueden ejecutar código arbitrario al cargarse. Se recomienda cargarlos únicamente desde fuentes de confianza y evitar entornos de producción con datos sensibles sin medidas de seguridad adicionales.
- La licencia MIT permite el uso comercial, pero el proyecto se enmarca como material de investigación y los autores no garantizan su aptitud para producción.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/hammerlabs/sec-restatement-arms
- Dataset de entrenamiento: https://huggingface.co/datasets/hammerlabs/sec-restatement-8k-402
- Repositorio de código, resultados y paper: https://github.com/hmmrlabs/cost-functions
