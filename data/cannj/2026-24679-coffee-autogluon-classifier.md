# cannj/2026-24679-coffee-autogluon-classifier

## Resumen

El modelo `cannj/2026-24679-coffee-autogluon-classifier` es un clasificador tabular binario creado con AutoGluon Tabular 1.6.1 que predice si una bolsa de café de venta al público tiene un precio premium a partir de siete atributos del envase (origen, altitud declarada, método de procesado, nivel de tueste, peso, formato de molienda y si se declara altitud). Lo firma Can Jin (usuario `cannj`) como entrega de la tarea 2 del curso 24-679 de la Universidad Carnegie Mellon, y se apoya en el conjunto de datos `ssg1/coffee-bags-tabular`, compuesto por 34 productos originales recopilados de forma independiente y repartidos a partes iguales entre 17 estándar y 17 premium.

No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `WeightedEnsemble_L2` de AutoGluon, es decir, un ensemble ponderado sobre algoritmos clásicos de aprendizaje automático tabular, seleccionado por precisión balanceada sobre un conjunto de validación de solo 5 filas. Su relevancia es fundamentalmente didáctica y metodológica: ilustra un flujo completo de AutoML con separación estricta de particiones, aumento de datos trazable mediante identificadores de parentesco y exclusión explícita de columnas con fuga de información (precio en dólares, precio por onza, marca e identificadores).

El repositorio no publica pesos en formatos de inferencia genéricos ni métricas numéricas finales, y su tamaño declarado en Hugging Face es de 0,0 GB. La licencia es MIT, pero el propio autor restringe el uso previsto a docencia, demostraciones de AutoML y experimentos a pequeña escala, y desaconseja explícitamente su uso para decisiones comerciales de precios o despliegues sin datos independientes adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble ponderado (`WeightedEnsemble_L2`) generado por AutoGluon Tabular 1.6.1 sobre modelos clásicos de aprendizaje tabular; no es un transformer ni una red neuronal |
| Parámetros totales | no disponible (la model card no identifica los modelos base del ensemble ni su número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (la entrada es una fila tabular con 7 características; no hay ventana de contexto) |
| Tipos de cuantización | no aplica (no se publican pesos en punto flotante ni formatos GGUF, GPTQ o AWQ) |
| Idiomas soportados | no disponible (la entrada es tabular; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio es un artefacto de AutoGluon cargable con `TabularPredictor.load()`. Tamaño del repo en Hugging Face: 0,0 GB |
| Tarea | Clasificación binaria tabular (`pipeline_tag`: tabular-classification) |
| Variable objetivo | `is_premium` (0 = precio estándar, 1 = precio premium; clase positiva = 1) |
| Características de entrada | 7: `origin` (categórica), `altitude_masl` (numérica, metros), `altitude_stated` (binaria), `processing` (categórica), `roast_level` (categórica), `weight_g` (numérica, gramos), `grind` (categórica) |
| Métrica de selección | Precisión balanceada (balanced accuracy) sobre la partición de validación |
| Métricas declaradas | accuracy, balanced_accuracy, precision, recall, f1 (valores no publicados) |
| Framework | AutoGluon Tabular 1.6.1 |
| Dataset de origen | `ssg1/coffee-bags-tabular` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo no entrena una arquitectura propia: AutoGluon Tabular explora un espacio de modelos clásicos de aprendizaje supervisado (familias de árboles potenciados, modelos lineales y variantes de vecinos, entre otras) y combina los candidatos mediante un ensemble ponderado de nivel 2 (`WeightedEnsemble_L2`). La configuración documentada usa el preset `medium_quality`, un presupuesto máximo de entrenamiento de 300 segundos y, de forma destacable, desactiva el bagging (0 pliegues) y el apilamiento (0 niveles), por lo que el ensemble final se apoya en la selección directa de modelos más un peso aprendido para la combinación. La semilla del cuaderno es 24679 y la selección del modelo se hizo maximizando la precisión balanceada sobre las 5 filas de validación. El preprocesado manual se limita a cargar las particiones publicadas, verificar tipos y ausencia de valores faltantes, comprobar que las particiones de validación y prueba no contienen registros aumentados y que los grupos de parentesco no cruzan entre particiones, y eliminar identificadores, metadatos de aumento, marca y columnas de precio. La codificación de categóricas, la transformación de características y el preprocesado específico de cada modelo los realiza AutoGluon internamente, sin ajustar escaladores o codificadores con datos de validación o prueba.

En cuanto a los datos, el conjunto original contiene 34 productos minoristas (17 estándar y 17 premium). La partición de entrenamiento publicada tiene 23 filas originales más 322 filas aumentadas, 345 en total; la de validación, 5 filas originales; y la de prueba, 6 filas originales sin aumentar. El aumento lo generó el autor del dataset, no este cuaderno, aplicando ruido gaussiano aditivo y escalado multiplicativo sobre valores numéricos seleccionados, heredando las categorías y la etiqueta binaria del registro padre. La etiqueta `is_premium` se define en el dataset de origen en relación con la mediana del precio por onza, por lo que representa un criterio de precio relativo dentro de esa muestra y no una definición universal de café premium. Se excluyeron explícitamente `source_id`, `parent_id`, `augmentation`, `is_augmented`, `brand`, `price_usd`, `price_per_oz` e `is_premium` para evitar fuga directa del objetivo; la marca se excluyó además para impedir la memorización de precios asociados a marcas concretas. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Clasificación binaria tabular: asigna una etiqueta 0 o 1 a cada fila de producto a partir de las siete características de envase, y puede devolver la probabilidad de la clase positiva al ser un predictor de AutoGluon.
- Tratamiento conjunto de variables categóricas (`origin`, `processing`, `roast_level`, `grind`) y numéricas (`altitude_masl`, `weight_g`), con codificación interna gestionada por el framework.
- Uso de una variable binaria auxiliar (`altitude_stated`) que distingue si el producto declara altitud de cultivo, lo que permite modelar la ausencia de ese dato sin imputación manual.
- Inferencia sobre datos estructurados de pequeña dimensionalidad, apta para ejecutarse en CPU.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: no procesa texto libre.
- No dispone de capacidades especiales de visión, audio, modo de pensamiento ni generación de texto.
- No se documenta en la información disponible ningún mecanismo de explicabilidad más allá de lo que AutoGluon ofrece por defecto (por ejemplo, importancia de características), ni se publican salidas de ese análisis.

## Casos de uso

- Docencia de AutoML en cursos universitarios: el repositorio sirve como ejemplo reproducible de un flujo completo de AutoGluon (carga de particiones, verificación de ausencia de valores faltantes, exclusión de columnas con fuga y selección de modelo por precisión balanceada) con un presupuesto de entrenamiento acotado a 300 segundos.
- Demostración práctica de prevención de fuga de datos: el listado explícito de columnas excluidas (`price_usd`, `price_per_oz`, `brand`, identificadores y metadatos de aumento) lo convierte en un caso de estudio para auditar pipelines tabulares y comprobar que el objetivo derivado del precio no se filtra a las entradas.
- Prototipado rápido de clasificación tabular en dominios de producto: con siete atributos de envase y un ensemble clásico, se puede usar como plantilla para construir un clasificador de gamas o segmentos en catálogos minoristas antes de invertir en ingeniería de características más compleja.
- Trazabilidad de datos aumentados: dado que el dataset de origen documenta ruido gaussiano aditivo y escalado multiplicativo con identificadores de parentesco padre-hijo, el modelo sirve para estudiar cómo el aumento de datos afecta a la selección de modelos y a la estimación de métricas.
- Práctica de documentación de modelos: la model card y el cuaderno asociado cubren propósito, uso previsto, particiones, características, columnas excluidas y configuración de AutoML, lo que lo hace útil como referencia para redactar fichas técnicas de modelos tabulares.
- Despliegue de referencia en MLOps ligero: al ser un artefacto de AutoGluon ejecutable en CPU, puede empaquetarse en un contenedor pequeño con una API HTTP para probar flujos de carga de predictor, versionado de artefactos y monitorización, siempre que no se use para decisiones de precios reales.
- Evaluación metodológica de métricas con clases balanceadas: el dataset original tiene 17 ejemplos por clase, lo que permite ilustrar el cálculo y la interpretación de exactitud, precisión balanceada, precisión, exhaustividad y F1 en un contexto controlado.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card declara únicamente los nombres de las métricas utilizadas (accuracy, balanced_accuracy, precision, recall, f1), sin sus valores, y no ofrece comparaciones con otros modelos ni con líneas base externas.

| Métrica | Conjunto de evaluación | Valor |
|---|---|---|
| Accuracy | Test (6 filas originales) | no disponible |
| Balanced accuracy | Validación (5 filas) y test (6 filas) | no disponible |
| Precision (clase 1) | Test | no disponible |
| Recall (clase 1) | Test | no disponible |
| F1 (clase 1) | Test | no disponible |

## Requisitos de hardware

- VRAM: no se requiere GPU. El modelo es un conjunto de estimadores tabulares clásicos sobre 7 características y 345 filas de entrenamiento efectivas; la inferencia se realiza en CPU.
- GPU recomendadas: ninguna. La información disponible no documenta uso de aceleración por GPU ni de frameworks de inferencia con soporte CUDA.
- Compatibilidad con GPU de consumo: no aplica, ya que no necesita GPU; cualquier portátil con CPU moderna y suficiente memoria para el entorno de AutoGluon puede ejecutar la inferencia.
- Memoria del sistema: no disponible de forma explícita. El repositorio declarado en Hugging Face ocupa 0,0 GB, por lo que los artefactos son de tamaño reducido.
- Opciones de despliegue: carga mediante `TabularPredictor.load()` de AutoGluon Tabular; exposición como servicio HTTP ligero (por ejemplo FastAPI o Flask) o ejecución dentro de un contenedor. La información disponible no documenta exportación a ONNX, TorchScript ni otros formatos de inferencia independientes del framework.
- Latencia y throughput: no documentados. Dado el tamaño del problema (7 características por fila y un ensemble tabular), la latencia por fila en CPU cabría esperar que estuviera en el orden de submilisegundos a pocos milisegundos, y el throughput en lotes podría alcanzar miles de filas por segundo, pero estas cifras son estimaciones derivadas de la naturaleza del problema y no han sido verificadas ni publicadas por el autor.

## Comparativa con modelos similares

La model card no identifica qué modelos base componen el `WeightedEnsemble_L2` ni publica métricas comparativas, por lo que no es posible establecer una comparación numérica rigurosa. La tabla siguiente contrasta el modelo con las familias de algoritmos tabulares clásicos que suelen aparecer como alternativas directas en este tipo de tareas; los datos de rendimiento de las alternativas no proceden de la información proporcionada y se marcan como no disponibles.

| Modelo | Tipo | Licencia | Disponibilidad | Rendimiento en este dataset |
|---|---|---|---|---|
| `cannj/2026-24679-coffee-autogluon-classifier` (este modelo) | Ensemble ponderado de AutoGluon 1.6.1 | MIT | Repositorio de Hugging Face, 0 descargas y 0 likes | no disponible (métricas declaradas sin valores) |
| XGBoost | Árboles potenciados por gradiente | Apache 2.0 (conocimiento general, no figura en la model card) | Biblioteca de amplia adopción; no se publica una versión entrenada sobre este dataset | no disponible |
| LightGBM | Árboles potenciados por gradiente con crecimiento por hojas | MIT (conocimiento general, no figura en la model card) | Biblioteca de amplia adopción; no se publica una versión entrenada sobre este dataset | no disponible |
| CatBoost | Árboles potenciados con soporte nativo de categóricas | Apache 2.0 (conocimiento general, no figura en la model card) | Biblioteca de amplia adopción; no se publica una versión entrenada sobre este dataset | no disponible |

## Limitaciones y advertencias

- Tamaño muestral muy reducido: el conjunto original tiene 34 productos, y la partición de prueba solo 6 filas. Cualquier métrica calculada sobre esas 6 filas tiene una varianza enorme y no es extrapolable a un catálogo real.
- Aumento de datos concentrado en el entrenamiento: 322 de las 345 filas de entrenamiento son hijas aumentadas de 23 productos originales. Los registros aumentados comparten categorías y etiqueta con su padre, por lo que la diversidad efectiva es mucho menor que el recuento de filas sugiere.
- Definición relativa de la etiqueta: `is_premium` se deriva de la mediana del precio por onza dentro de este dataset concreto, no de un criterio de mercado universal. Un producto etiquetado como premium aquí podría no serlo en otro contexto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreajuste y de predicciones mal calibradas fuera de la distribución de los 34 productos originales.
- Sesgos potenciales: aunque se excluyó `brand` para evitar memorización de precios de marca, variables como `origin`, `processing` o `roast_level` pueden correlacionar con el segmento de precio y actuar como proxies de factores comerciales no medidos.
- Cobertura temporal y geográfica limitada: los datos describen productos minoristas recopilados en un momento concreto y no incluyen información de mercado, canal de venta ni promociones.
- Restricciones de uso declaradas por el autor: la model card indica que el modelo no está pensado para decisiones comerciales de precios, decisiones financieras, clasificaciones de calidad de producto, afirmaciones sobre el sabor del café ni despliegues sin datos independientes adicionales.
- Licencia: MIT permite uso comercial desde el punto de vista legal, pero el uso previsto declarado se limita a docencia, demostraciones educativas de AutoML, experimentos tabulares a pequeña escala y práctica de evaluación y documentación. Cualquier uso en producción debería ir acompañado de una validación independiente y de una revisión de cumplimiento.
- Validación externa nula: el repositorio registra 0 descargas y 0 likes, y su tamaño es de 0,0 GB, lo que indica que no ha sido reproducido ni auditado por terceros.
- Configuración de AutoML limitada: el preset `medium_quality`, el presupuesto de 300 segundos y la desactivación de bagging y apilamiento implican que el espacio de modelos explorado fue acotado y que la selección final se hizo con solo 5 filas de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cannj/2026-24679-coffee-autogluon-classifier
- Dataset de origen: https://huggingface.co/datasets/ssg1/coffee-bags-tabular
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes al modelo: devuelven exclusivamente fichas de reparto y páginas de una película, sin relación con AutoGluon, aprendizaje tabular ni el conjunto de datos de café. No se dispone por tanto de papers, blogs, repositorios adicionales ni demos verificables sobre este modelo.
