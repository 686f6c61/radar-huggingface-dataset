# general-forecast/kumo-tabular-small-classifier

## Resumen

`general-forecast/kumo-tabular-small-classifier` es una conversión a safetensors de los pesos del clasificador `small/classifier.pt` del modelo `nvidia/Kumo-Tabular` de NVIDIA, publicada por el proyecto general-forecast para su uso con la librería `gfi`. No se trata de un modelo de lenguaje: es un modelo para datos tabulares que emite probabilidades de clase sobre un máximo de 10 clases, orientado a tareas de clasificación supervisada sobre tablas. La model card es explícita en que los pesos no han sido modificados respecto al original; el único trabajo realizado es la conversión de formato y el empaquetado de la configuración.

El interés de esta ficha es acotado pero relevante para quien trabaja con machine learning tabular: permite reutilizar los pesos de NVIDIA en un formato (`safetensors`) integrable directamente en el ecosistema `gfi`, sin necesidad de cargar el checkpoint original de PyTorch. Con 27.458.378 parámetros totales y un repositorio de 0,1 GB, es un modelo pequeño, desplegable en CPU y en cualquier GPU de consumo.

La información pública disponible es muy limitada: la model card del repositorio es un breve documento de conversión y las búsquedas web no devuelven documentación técnica adicional sobre arquitectura, datos de entrenamiento, benchmarks o requisitos de despliegue. Por tanto, buena parte de las secciones siguientes queda marcada explícitamente como no disponible, y las estimaciones derivadas del recuento de parámetros se señalan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; los tags indican aprendizaje en contexto sobre datos tabulares) |
| Parametros totales | 27.458.378 |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no aplica / no disponible (modelo para datos tabulares, no tratamiento de lenguaje natural) |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`), heredada de los pesos originales de NVIDIA |
| Formato de pesos | safetensors (`model.safetensors`), bajo los nombres de parámetro del modelo PyTorch original |

## Arquitectura y entrenamiento

La model card no proporciona ninguna descripción de la arquitectura interna. Lo único verificable es que se trata de una conversión directa y sin cambios de los pesos del fichero `small/classifier.pt` de `nvidia/Kumo-Tabular`, en la revisión `3c3e10bbdb590ace29e7026847f92db3c603096d`, con los tamaños indicados en `MODEL_KWARGS["small"]` del repositorio `NVIDIA/structured-data-models`. El fichero `config.json` del repositorio conserva el campo `architecture_name` y el bloque `config` con las dimensiones del modelo original, que es donde habría que consultar los detalles estructurales. No se dispone de información sobre número de capas, dimensión oculta, mecanismo de atención ni tipo de codificación de las columnas tabulares.

Tampoco hay datos sobre el entrenamiento: se desconoce el volumen de datos, la composición del conjunto de entrenamiento, si hubo ajuste por refuerzo o preferencias, y qué innovaciones técnicas incorpora el modelo original. La única pista funcional es la etiqueta `in-context-learning`, que sugiere que el modelo resuelve la predicción tabular condicionando sobre ejemplos incluidos en la propia entrada en lugar de requerir reentrenamiento por tarea, un planteamiento habitual en los clasificadores tabulares de tipo prior-fitted. La model card confirma únicamente el contrato de salida: el modelo emite probabilidades de clase para un máximo de 10 clases.

## Capacidades

- Clasificación tabular supervisada con salida de probabilidades de clase (hasta 10 clases), según se indica literalmente en la model card.
- Aprendizaje en contexto sobre datos tabulares, de acuerdo con la etiqueta `in-context-learning` del repositorio.
- Integración con la librería `gfi`, que es el motivo declarado de la conversión a safetensors.
- Reutilización de los pesos originales de NVIDIA sin modificaciones, lo que permite reproducir exactamente el comportamiento del checkpoint `small/classifier.pt`.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles y, por la naturaleza tabular del modelo, no aplicables.
- No se documenta ningún modo especial (thinking mode, decodificación especulativa o similar).

## Casos de uso

- Clasificación de registros tabulares en pipelines de datos: el modelo recibe una tabla con columnas numéricas y categóricas y devuelve probabilidades sobre hasta 10 clases, lo que permite integrarlo como etapa de scoring dentro de un ETL o de un job por lotes.
- Prototipado rápido de tareas de clasificación sin reentrenamiento: gracias al planteamiento de aprendizaje en contexto, el equipo puede evaluar el modelo sobre un conjunto de datos nuevo aportando ejemplos en la entrada, sin ajustar pesos.
- Segmentación de clientes o scoring de riesgo en entornos con pocos datos etiquetados, donde el coste de entrenar un modelo específico no está justificado y se prefiere un clasificador preentrenado sobre tablas.
- Detección de fraude o anomalías formulada como clasificación binaria, aprovechando que el modelo admite hasta 10 clases y devuelve probabilidades calibradas sobre las que fijar un umbral de decisión.
- Triaje de tickets o incidencias clasificadas a partir de metadatos estructurados (categoría, prioridad, antigüedad, canal), en lugar de sobre el texto libre del ticket.
- Clasificación de resultados de laboratorio o de registros clínicos estructurados, siempre que se cumplan los requisitos regulatorios aplicables y se valide el modelo en el dominio concreto.
- Ejecución en entornos con recursos limitados: con 27,5 millones de parámetros, el modelo puede correr en CPU o en GPU integrada, lo que habilita inferencia local en dispositivos sin acelerador dedicado.
- Comparación de referencia frente a modelos tabulares propios: al ser una conversión fiel de los pesos de NVIDIA, sirve como línea base reproducible en experimentos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de exactitud, AUC, F1 ni comparaciones con otros clasificadores tabulares, y las búsquedas web realizadas no han devuelto documentación técnica asociada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 110 MB solo para los pesos, más el estado de activaciones y el coste de los datos de entrada (estimación propia a partir de los 27.458.378 parámetros).
- VRAM estimada en fp16 o bf16: aproximadamente 55 MB para los pesos (estimación propia). El repositorio no documenta variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria disponible es sobradamente suficiente; no se requiere A100, H100 ni RTX 4090 para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida suficiente).
- Cabe en CPU: sí, y es previsiblemente el escenario de despliegue más habitual dado el tamaño. No se dispone de cifras oficiales de latencia en CPU.
- Opciones de despliegue: la model card solo contempla la librería `gfi`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que el modelo no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No hay datos publicados en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| general-forecast/kumo-tabular-small-classifier | 27.458.378 | no disponible | no disponible | OpenMDW 1.1 | HuggingFace, safetensors, librería `gfi` |
| nvidia/Kumo-Tabular (`small/classifier.pt`) | mismos pesos (es el origen de la conversión) | no disponible | no disponible | OpenMDW 1.1 | HuggingFace, PyTorch |
| Otras alternativas de clasificación tabular (TabPFN, TabDPT y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada con certeza es con el checkpoint original de NVIDIA, del que este repositorio es una conversión de formato sin cambios en los pesos: el comportamiento funcional debería ser idéntico. No se dispone de datos verificados de otros clasificadores tabulares en la información proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Información técnica mínima: la model card no documenta arquitectura, datos de entrenamiento, hiperparámetros ni métricas, lo que dificulta evaluar su idoneidad antes de probarlo.
- Sesgos conocidos: no disponibles. Al no publicarse la composición del dataset de entrenamiento, no es posible auditar sesgos por subgrupo, dominio o distribución de clases.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el riesgo habitual de predicciones mal calibradas fuera de la distribución de entrenamiento tabular.
- Límite funcional duro: la salida está restringida a un máximo de 10 clases. Problemas de clasificación con más clases no son abordables con este modelo tal cual.
- Calidad de las columnas: el rendimiento dependerá críticamente del esquema de la tabla (tipos, valores ausentes, cardinalidad de las categóricas), y no hay guía publicada sobre preprocesamiento recomendado.
- Idiomas: no procede; es un modelo tabular, no lingüístico. Cualquier expectativa de uso multilingüe o de generación de texto es infundada.
- Licencia: OpenMDW 1.1 es una licencia con `license_name` personalizado y etiquetada como `other` en HuggingFace. Antes de un uso comercial o de redistribuir los pesos conviene revisar el fichero `LICENSE` del repositorio y el aviso de copyright de NVIDIA que se conserva en él. No se puede asumir automáticamente que los términos coincidan con los de licencias estándar tipo Apache 2.0 o MIT.
- Procedencia de los pesos: la responsabilidad sobre los pesos originales recae en NVIDIA; este repositorio solo realiza la conversión. Cualquier problema de calidad del modelo es heredado del checkpoint `small/classifier.pt`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que aporten experiencia de uso.
- Ausencia de benchmarks: no es posible afirmar que el modelo sea competitivo frente a alternativas sin ejecutar una evaluación propia sobre el conjunto de datos de interés.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/general-forecast/kumo-tabular-small-classifier
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio de NVIDIA con los modelos de datos estructurados: https://github.com/NVIDIA/structured-data-models
- Librería gfi: https://github.com/generalforecast/gfi
