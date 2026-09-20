# gcouzzi/jurisclass-legalbertpt

## Resumen

JurisClass LegalBert-pt es un clasificador de documentos jurídicos brasileños desarrollado por Gabriel de Salles Mapeli Couzzi como parte de su trabajo de fin de carrera. El repositorio no contiene un único modelo, sino cinco clasificadores independientes resultantes de una validación cruzada, cada uno almacenado en su propia subcarpeta `fold_N/best_model/` en formato Transformers/Safetensors. Se trata de un ajuste fino del modelo base `raquelsilveira/legalbertpt_fp`, sin preentrenamiento desde cero.

La tarea resuelve una clasificación por página en cinco categorías del sistema judicial brasileño: Acórdão de segunda instancia (`acordao_de_2_instancia`), Agravo em Recurso Extraordinário (`agravo_em_recurso_extraordinario`), Despacho de admisibilidad (`despacho_de_admissibilidade`), Petición de Recurso Extraordinario (`peticao_do_RE`) y Sentencia (`sentenca`). La categoría residual `outros`/Others se excluyó del entrenamiento, por lo que el modelo es un clasificador cerrado de cinco clases, no un detector de anomalías.

Su relevancia es acotada y muy específica: se orienta a investigación y a triaje documental con revisión humana, en un dominio (portugués jurídico brasileño) con pocos recursos públicos etiquetados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia propia más allá de la del modelo base (OpenRAIL, según la ficha de este en el Hub).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (heredada de `raquelsilveira/legalbertpt_fp`), con cabeza de clasificación de secuencia de 5 clases |
| Parametros totales | No disponible de forma explícita; cada fold ocupa aproximadamente 440 MB (2,2 GB de repositorio / 5 folds), magnitud coherente con una arquitectura BERT-base (~110 M de parámetros en fp32). Cifra no confirmada en la información disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, incluidos los tokens especiales; el tokenizador trunca la entrada a ese límite |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin cuantizar |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | No disponible en la ficha del repositorio; el modelo base declara licencia OpenRAIL en su ficha del Hub y el autor indica que no presume ninguna licencia adicional para estos pesos derivados |
| Formato de pesos | Safetensors, formato Transformers (`AutoModelForSequenceClassification`), cinco subcarpetas `fold_N/best_model/` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `raquelsilveira/legalbertpt_fp`, un encoder transformer tipo BERT adaptado al portugués jurídico, sobre el que se añade una cabeza de clasificación de secuencia con cinco etiquetas de salida. No hubo preentrenamiento desde cero: el ajuste se realizó sobre los pesos del modelo base. La entrada se limpia previamente con el script `backend/preprocessing.py` del proyecto, que elimina secuencias decorativas repetidas, normaliza saltos de línea, sustituye caracteres no permitidos y reduce espacios repetidos, preservando acentuación y mayúsculas; se recomienda rechazar entradas con menos de 50 caracteres tras la limpieza.

El ajuste fino usó cinco épocas, tasa de aprendizaje 5e-5, lote efectivo 16 y 500 pasos de calentamiento, con búsqueda en rejilla para la selección de hiperparámetros. Los folds se estratificaron por página y sin agrupamiento por proceso, lo que implica que un mismo expediente puede aparecer repartido entre entrenamiento y validación. No se documenta uso de RLHF, DPO ni ninguna otra fase de alineación, algo esperable en un clasificador. La innovación técnica destacable es, precisamente, el esquema de ensemble: para reproducirlo hay que cargar los cinco folds, verificar que comparten el mismo orden de etiquetas y promediar aritméticamente las cinco distribuciones softmax; un pipeline que cargue un solo fold no equivale al ensemble.

## Capacidades

- Clasificación de texto por página en cinco clases jurídicas brasileñas, con distribución softmax sobre las cinco etiquetas.
- Ensamble por promedio aritmético de las salidas de los cinco folds, con mejora medida en F1-macro y exactitud frente al fold individual.
- Funcionamiento como extractor de características o encoder (la cabeza de clasificación puede sustituirse, al ser un modelo Transformers estándar).
- Integración con el ecosistema `transformers` a través de `AutoTokenizer` y `AutoModelForSequenceClassification`, con carga por subcarpeta y revisión (commit hash) fijada.
- No soporta tool calling ni function calling: no es un modelo generativo ni un modelo de instrucciones.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento explícitos.
- No tiene capacidades de visión, audio ni generación de texto libre.
- Cobertura multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Triaje documental en juzgados y tribunales: clasificar automáticamente páginas de expedientes electrónicos en las cinco categorías y enrutarlas a la cola de trabajo correspondiente, siempre con revisión humana posterior.
- Pre-anotación para equipos de etiquetado: usar el ensemble para generar etiquetas iniciales sobre grandes volúmenes de páginas y reducir el coste de anotación manual en corpus jurídicos en portugués.
- Auditoría y control de calidad de expedientes: detectar páginas cuya categoría no coincide con la estructura esperada del proceso, como apoyo a revisiones internas.
- Filtrado previo a pipelines de extracción de información: separar páginas de decisiones y despachos antes de aplicar extracción de entidades, resúmenes o indexación de texto completo.
- Indexación y búsqueda jurídica: asignar una etiqueta de tipo documental a cada página para permitir búsquedas facetadas por tipo de acto procesal en repositorios de jurisprudencia.
- Investigación académica en procesamiento de lenguaje jurídico: servir como línea base reproducible de clasificación por página en portugués jurídico, con métricas publicadas y particiones de validación cruzada definidas.
- Estimación de volúmenes procesales: agregar las predicciones a nivel de expediente para aproximar la composición documental de un tribunal (proporción de sentencias, despachos, recursos) con fines estadísticos exploratorios.
- Despliegue en sistemas de gestión documental: integrar el clasificador como microservicio detrás de una API para etiquetar documentos en el momento de su incorporación al sistema.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta una evaluación propia sobre 10.105 páginas del conjunto de test preprocesado, restringida a las cinco clases conocidas y sin abstención:

| Configuracion | Exactitud | F1-macro |
|---|---:|---:|
| Fold 5 | 0,918555 | 0,905572 |
| Ensemble de los cinco folds | 0,926670 | 0,912941 |

Notas sobre estas cifras: no miden la identificación de la clase `Others`, excluida del entrenamiento. En un piloto exploratorio con 32 páginas de tipo Others tomadas de validación, 29 obtuvieron una puntuación superior a 0,90 en el fold 5; el autor advierte que este piloto no estima la tasa final y no valida ningún umbral. La muestra principal de rechazo queda pendiente. La mejora global del ensemble no se extendió a la clase Despacho.

## Requisitos de hardware

- VRAM estimada: aproximadamente 440 MB por fold en fp32 y unos 220 MB en fp16 para los pesos; con activaciones y lotes pequeños, alrededor de 1 GB por fold y del orden de 2-3 GB para cargar los cinco folds del ensemble simultáneamente. Estimaciones derivadas del tamaño del repositorio, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090). Aceleradores como A100 o H100 no son necesarios para inferencia individual, aunque permiten lotes grandes y mayor throughput en procesamiento masivo.
- Inferencia en CPU: viable para volúmenes moderados, al tratarse de un encoder de 512 tokens; en CPU conviene usar ONNX Runtime o cuantización dinámica para reducir latencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, incluso en modelos con 4-6 GB de VRAM.
- Opciones de despliegue: pipeline de `transformers` (referencia del autor), ONNX Runtime o TorchScript para optimización de latencia, TorchServe, Triton Inference Server o BentoML para servir el ensemble. Las herramientas orientadas a modelos generativos (vLLM, TGI, llama.cpp, Ollama) no son la vía natural para un encoder de clasificación y no se documentan en la información disponible.
- Latencia y throughput: no publicados en la información disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gcouzzi/jurisclass-legalbertpt | Clasificación de páginas jurídicas en 5 clases (portugués) | 512 tokens | No disponible (base OpenRAIL) | Hub, 5 folds en safetensors; 0 descargas |
| raquelsilveira/legalbertpt_fp | Encoder de dominio jurídico portugués (modelo base) | No disponible | OpenRAIL según su ficha en el Hub | Hub, pesos abiertos |
| neuralmind/bert-base-portuguese-cased (BERTimbau base) | Encoder general en portugués | 512 tokens (típico de BERT-base) | No verificada en la información disponible | Hub, ampliamente utilizado |
| Modelos generativos multilingües o en portugués (por ejemplo, familias tipo Llama o Sabiá ajustadas) | Generación y clasificación zero-shot mediante prompt | Mayor que 512 tokens | Variable según modelo | Hub; requieren mucho más hardware |

La comparación cuantitativa de parámetros y rendimiento entre estas alternativas no está disponible en la información proporcionada. Como referencia cualitativa, la ventaja de JurisClass es su especialización en las cinco clases procesales brasileñas y su bajo coste de inferencia frente a alternativas generativas; su desventaja es que no generaliza fuera de esas cinco clases y que su licencia derivada no está definida explícitamente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente. Los folds internos pueden contener páginas del mismo proceso repartidas entre entrenamiento y validación, lo que puede inflar las métricas reportadas.
- Riesgo de alucinación en sentido estricto: no aplica (no es generativo), pero sí hay riesgo de falsa confianza: el modelo puede asignar confianza elevada a tipos de documento que no ha aprendido.
- Calibración: las puntuaciones softmax no son probabilidades calibradas de acierto; el ejemplo de umbral 0,60 mencionado por el autor no constituye una configuración validada.
- Clase residual: la categoría `Others` se excluyó del entrenamiento y los resultados publicados no miden su identificación. El piloto de 32 páginas no permite estimar una tasa de rechazo ni fijar un umbral.
- Granularidad: el entrenamiento y la evaluación son por página. Clasificar el inicio de un PDF no equivale a comprender el documento completo.
- Clase Despacho: la mejora del ensemble frente al fold individual no se extendió a esta clase, por lo que su rendimiento relativo es peor.
- Preprocesado obligatorio: se debe replicar la limpieza de `backend/preprocessing.py` y rechazar entradas de menos de 50 caracteres; usar otro preprocesado puede degradar los resultados.
- Integración: cargar solo un fold mediante un pipeline estándar no reproduce el ensemble, que requiere promediar las cinco distribuciones softmax.
- Licencia: el repositorio no declara licencia propia; el autor indica que los pesos derivados quedan sujetos a los términos del modelo base (OpenRAIL) y de los datos de ajuste, y recomienda consultar antes de redistribuir bajo nuevos términos. No hay confirmación de uso comercial.
- Validación externa: no hubo evaluación de productividad, usabilidad ni impacto jurídico real. El uso previsto es investigación y apoyo al triaje con revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcouzzi/jurisclass-legalbertpt
- Modelo base: https://huggingface.co/raquelsilveira/legalbertpt_fp
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de soporte de YouTube y artículos sobre la marca de bicicletas YT Industries), por lo que no se incluye ningún enlace adicional. No se dispone de paper, blog, repositorio de código ni demo del proyecto.
