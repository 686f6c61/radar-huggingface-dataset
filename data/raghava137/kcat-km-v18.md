# raghava137/kcat-km-v18

## Resumen

kcat-km-v18 es un modelo de prediccion de parametros de cinetica enzimatica (kcat y Km) distribuido como repositorio ONNX de 0,8 GB por el usuario raghava137 en Hugging Face. No es un modelo de lenguaje generativo, sino un ensemble de aprendizaje automatico tabular y de regresion que combina LightGBM, CatBoost, redes de fusion y una red de atencion regional sobre embeddings de proteinas (ESM2-35M, ProtT5-XL-U50, ESM-C 600M) y de sustratos (MoLFormer-XL, Morgan, RDKit). Su proposito es predecir, a partir de la secuencia de una enzima y de la estructura de un sustrato, el logaritmo decimal de la constante catalitica (log10_kcat) y de la constante de Michaelis (log10_km).

La variante v18 corresponde a la iteracion "FULL PUBLIC DATA variant v3" de la model card, que segun el autor incorpora una capa de consulta de valores publicos (public-value lookup layer v2) con datos de CatPred-DB, BRENDA 2026.1, DLKcat y EnzyExtractDB, ademas de un leak guard y de un comite entrenado solo con datos de competicion para entradas relacionadas con enzimas publicas. El modelo esta disenado para ejecutarse solo en CPU mediante `python /app/predict.py --input X.parquet --output Y.csv`, con un tiempo de inferencia declarado de unos 4 minutos en 2 CPUs.

Es relevante ahora porque automatiza una tarea de anotacion enzimatica que tradicionalmente requiere experimentos de laboratorio, y porque su model card documenta de forma explicita el riesgo de fuga de datos (data leakage) en benchmarks de cinetica enzimatica, un problema metodologico recurrente en la literatura de prediccion de kcat y Km.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (L2 y L1), CatBoost, dos redes de fusion, red de atencion regional sobre ESM2-35M; clasificador LightGBM de bins por ordenes de magnitud; LightGBM solo-sustrato (Km); dos miembros LightGBM con embeddings de proteinas grandes (ProtT5-XL-U50, ESM-C 600M) por lookup en tablas Swiss-Prot; capa de lookup de valores publicos con LightGBM |
| Parametros totales | no disponible (ensemble de modelos tabulares y de embedding; el tamano del repo es de 0,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; usa los primeros 510 residuos de la proteina y 32 regiones) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ejecutado con ONNX Runtime); redes neuronales en NumPy en inferencia |

## Arquitectura y entrenamiento

El modelo es un ensemble por comite que promedia en el espacio de etiquetas. Para kcat combina LightGBM con perdidas L2 y L1, CatBoost, dos redes de fusion y una red de atencion regional que opera sobre embeddings de proteina ESM2-35M (primeros 510 residuos, media mas 32 regiones) y sobre caracteristicas de sustrato derivadas de MoLFormer-XL, Morgan y RDKit. Para Km se usa la misma salida del comite, aprovechando una unica pasada de ESM2 y otra de MoLFormer para ambos objetivos. Se anaden miembros extra: un clasificador LightGBM sobre 10 bins de ordenes de magnitud (valor esperado para ambos objetivos) y un LightGBM solo-sustrato para Km. Las redes neuronales se ejecutan en NumPy en inferencia, mientras que ESM2 y MoLFormer se ejecutan mediante ONNX Runtime.

Los datos de entrenamiento son el split de entrenamiento de la competicion mas filas publicas de CatPred-DB (Boorla & Maranas 2025, CC BY 4.0) y DLKcat (Li et al. 2022) a mitad de peso, y filas de tipo wild-type de EnzyExtractDB (Wei et al. 2025, minado de literatura) a un cuarto de peso. Antes del entrenamiento se eliminan las filas publicas cuya enzima es una enzima de validacion o comparte un cluster de 5-meros (coseno > 0,08) con una. La v14 incorpora dos miembros LightGBM cuyo bloque de proteina no es ESM2-35M sino un modelo mayor, sin ejecutarlo: los embeddings se buscan por secuencia exacta en tablas publicas de Swiss-Prot (ProtT5-XL-U50 de UniProt, CC BY 4.0; ESM-C 600M de Protein Dimension DB 2.0, MIT), reducidos a 256 dimensiones PCA; las enzimas ausentes reciben un embedding predicho desde su media ESM2-35M por una red entrenada con unas 385 000 proteinas de Swiss-Prot. La v14 tambien aplica un ajuste intra-enzima (atraccion hacia la media de la enzima, kcat x0,5 y Km x0,7, mas 0,2 veces la desviacion centrada de un LightGBM intra-enzima). La v15 refuerza el comite solo-competicion (weights/refc_safe) con los mismos miembros extra. La v2 de la capa de lookup devuelve el valor publicado cuando el par exacto (secuencia de enzima, InChIKey de sustrato) existe en CatPred-DB, BRENDA 2026.1, DLKcat o EnzyExtractDB; para kcat combina el valor publico con la prediccion del comite v15 mediante un LightGBM que aprende, entre otras cosas, el deslizamiento de unidades de x3600 en algunas entradas de kcat de SABIO-RK.

## Capacidades

- Prediccion de log10_kcat y log10_km a partir de secuencia de enzima y estructura de sustrato, con salida en columnas `id, log10_kcat, log10_km`.
- Ejecucion solo en CPU mediante el script `predict.py` con entrada y salida en formato Parquet/CSV.
- Extraccion de caracteristicas de proteina con ESM2-35M (primeros 510 residuos, media y 32 regiones) y de sustrato con MoLFormer-XL, Morgan y RDKit.
- Lookup exacto de embeddings de proteinas grandes (ProtT5-XL-U50, ESM-C 600M) en tablas Swiss-Prot, con prediccion de embedding para enzimas ausentes.
- Capa de consulta de valores publicos de cinetica (CatPred-DB, BRENDA 2026.1, DLKcat, EnzyExtractDB) con correccion de unidades aprendida.
- Leak guard que detecta enzimas de entrada relacionadas (coseno de 5-meros > 0,08) con enzimas publicas de entrenamiento y redirige esas filas a un comite entrenado solo con datos de competicion.
- Ajuste intra-enzima para mejorar el ordenamiento de sustratos de una misma enzima.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Anotacion de parametros de cinetica en pipelines de biologia computacional: dado un conjunto de pares enzima-sustrato en Parquet, el modelo devuelve log10_kcat y log10_km en unos 4 minutos en 2 CPUs, lo que permite filtrar candidatos antes de ensayos experimentales.
- Priorizacion de experimentos de laboratorio: ordenar sustratos candidatos de una enzima por kcat y Km predichos para seleccionar que combinaciones merece la pena medir in vitro.
- Construccion de modelos metabolicos a escala genomica: rellenar huecos de parametros cineticos en modelos de redes metabolicas cuando no hay valores medidos para una enzima concreta.
- Ingenieria de proteinas y diseno de enzimas: estimar el efecto de variantes de secuencia sobre kcat y Km usando el bloque de embeddings ESM2 y el ajuste intra-enzima para comparar sustratos de una misma variante.
- Auditoria de bases de datos de cinetica: la capa de lookup y la correccion de unidades permiten detectar discrepancias (por ejemplo, el deslizamiento de x3600 en entradas de SABIO-RK) comparando el valor publicado con la prediccion del comite.
- Investigacion metodologica sobre fuga de datos: el diseno con leak guard y comite solo-competicion sirve para cuantificar cuanto infla la puntuacion el uso de datos publicos filtrados, un caso de estudio replicable en benchmarks de cinetica enzimatica.
- Ensenanza y prototipado en entornos sin GPU: al ejecutarse solo en CPU y en ONNX Runtime, se puede desplegar en portatiles o contenedores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras relativas en validacion cruzada por folds de cluster (+0,017 / +0,007 en kcat y +0,015 / +0,004 en Km al reforzar el comite solo-competicion), pero no se proporcionan valores absolutos de metricas ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia solo en CPU; la model card indica unos 4 minutos en 2 CPUs para un lote de entrada.
- VRAM: no aplica (ejecucion en CPU); no se documenta requisito de GPU.
- GPU recomendadas: no disponible; el modelo no requiere GPU.
- Cabe en cualquier maquina consumer con CPU suficiente y aproximadamente 0,8 GB de disco para los pesos; no se especifica RAM necesaria.
- Opciones de despliegue: script `predict.py` con ONNX Runtime y NumPy; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 4 minutos en 2 CPUs segun el autor; no se detalla el tamano de lote ni el throughput por fila.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v18 (raghava137) | Ensemble LightGBM/CatBoost + embeddings ESM2/MoLFormer, ONNX, CPU | no disponible (repo 0,8 GB) | no aplica | CC BY 4.0 | Hugging Face |
| CatPred (Boorla & Maranas 2025) | Prediccion de kcat/Km con aprendizaje profundo | no disponible en la informacion | no aplica | CC BY 4.0 (datos citados) | no disponible |
| DLKcat (Li et al. 2022) | Prediccion de kcat con red neuronal sobre grafos | no disponible en la informacion | no aplica | no disponible | no disponible |
| EnzyExtractDB (Wei et al. 2025) | Base de datos de cinetica minada de literatura | no aplica | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- La propia model card advierte: "Not for submission". La variante v3 esta entrenada con todos los datos publicos, incluidos los de enzimas de validacion y sus parientes (alrededor del 63 % de las filas de validacion tienen coincidencia publica exacta), sin filtro de fuga, y solo sirve para medir cuanto infla la puntuacion el leakage.
- El leak guard de la v13 mitiga, pero no elimina, el riesgo de que las bases publicas contengan pares del split de test oculto, ya que las entradas de test no son publicas y no se pueden eliminar de antemano.
- La capa de lookup de valores publicos puede devolver directamente valores de bases de datos con errores conocidos (por ejemplo, el deslizamiento de unidades de x3600 en algunas entradas de kcat de SABIO-RK); la correccion es aprendida y no garantiza exactitud.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso; cualquier uso fuera de la prediccion de kcat y Km no esta soportado.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto en el sentido habitual; el modelo opera sobre secuencias de proteina (primeros 510 residuos) y estructuras de sustrato, por lo que proteinas mas largas se truncan.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero los datos de terceros incorporados (CatPred-DB, BRENDA 2026.1, DLKcat, EnzyExtractDB, ProtT5-XL-U50, ESM-C 600M) tienen sus propias condiciones que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta pipeline ni idiomas; la validacion externa por la comunidad es practicamente inexistente.
- El rendimiento en enzimas sin parientes en las bases publicas ni en Swiss-Prot depende del comite solo-competicion y del embedding predicho, con precision no cuantificada en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/raghava137/kcat-km-v18
- CatPred-DB (Boorla & Maranas 2025): no disponible (referencia citada en la model card, sin URL)
- DLKcat (Li et al. 2022): no disponible (referencia citada en la model card, sin URL)
- EnzyExtractDB (Wei et al. 2025): no disponible (referencia citada en la model card, sin URL)
- BRENDA 2026.1: no disponible (referencia citada en la model card, sin URL)
- ProtT5-XL-U50 (UniProt): no disponible (referencia citada en la model card, sin URL)
- ESM-C 600M (Protein Dimension DB 2.0, pitagoras-alves): no disponible (referencia citada en la model card, sin URL)
