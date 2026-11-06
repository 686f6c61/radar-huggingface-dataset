# raghava137/kcat-km-v17

## Resumen

kcat-km-v17 es un ensemble de modelos de aprendizaje automatico para la prediccion de parametros de cinetica enzimatica: la constante catalitica (kcat) y la constante de Michaelis (Km). Lo desarrolla el usuario raghava137 y se distribuye como un artefacto ONNX de aproximadamente 0,7 GB. No es un modelo de lenguaje generativo, sino un sistema de regresion supervisada que combina arboles potenciados (LightGBM, CatBoost) con redes neuronales sobre representaciones de proteinas y sustratos. Su relevancia radica en la utilidad de estimar parametros cineticos a escala para enzimas sin caracterizacion experimental, un cuello de botella habitual en biologia sintetica y diseno de enzimas.

El modelo se presenta explicitamente como una variante de "datos publicos completos" y su model card advierte de que no debe usarse para envio a competicion, ya que fue construido para medir cuanto infla la puntuacion la fuga de datos publicos (alrededor del 63 % de las filas de validacion tienen una coincidencia publica exacta). Incorpora mecanismos de proteccion contra fuga ("leak guard") en sus versiones v13-v15, aunque la model card mezcla la descripcion de la variante principal con las sucesivas iteraciones.

La inferencia esta disenada para ejecutarse solo en CPU, con un tiempo declarado de unos 4 minutos en 2 nucleos. No se proporcionan datos de benchmarks, idiomas ni pipeline de Hugging Face. La licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (L2 y L1), CatBoost, dos redes de fusion, red de atencion regional y modelos auxiliares, sobre embeddings ESM2-35M y MoLFormer-XL |
| Parametros totales | no disponible (ensemble de arboles y redes; tamano del repo 0,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresion tabular/embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; redes neuronales en NumPy en inferencia) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ejecutado con ONNX Runtime); redes en NumPy; modelos de arboles en formato propio de LightGBM/CatBoost |

## Arquitectura y entrenamiento

El sistema es un comite de modelos que promedia en el espacio de etiquetas (log10 de kcat y log10 de Km). Los miembros principales son dos LightGBM (objetivos L2 y L1), un CatBoost, dos redes de fusion y una red de atencion regional que operan sobre embeddings de proteina ESM2-35M (primeros 510 residuos, media mas 32 regiones) y caracteristicas de sustrato derivadas de MoLFormer-XL, Morgan y RDKit. Las versiones v12-v15 anaden un clasificador LightGBM sobre 10 bins de orden de magnitud, un miembro LightGBM solo de sustrato para Km y dos miembros adicionales basados en embeddings de proteinas grandes (ProtT5-XL-U50 y ESM-C 600M) consultados por secuencia exacta en tablas publicas de Swiss-Prot, reducidos a 256 dimensiones PCA. Las redes neuronales se ejecutan en NumPy y los codificadores ESM2 y MoLFormer mediante ONNX Runtime.

Los datos de entrenamiento combinan el split de entrenamiento de la competicion con filas publicas de CatPred-DB (Boorla & Maranas 2025, CC BY 4.0) y DLKcat (Li et al. 2022) a peso 0,5, y filas de tipo salvaje de EnzyExtractDB (Wei et al. 2025) a peso 0,25. Se eliminaron las filas publicas cuya enzima fuera de validacion o compartiera un cluster de 5-meros (coseno > 0,08). La v13 introduce un "leak guard" que, en tiempo de prediccion, compara cada enzima de entrada con las enzimas publicas de entrenamiento y enruta las filas relacionadas a un comite entrenado solo con datos de competicion. La v14 anade un ajuste intra-enzima (contraccion hacia la media de la enzima, kcat x0,5 y Km x0,7, mas una desviacion de un LightGBM intra-enzima) y la v15 amplia el comite de seguridad con los mismos miembros extra. Todas las decisiones de la v14 se validaron en dos folds de cluster reservados.

## Capacidades

- Prediccion de log10_kcat y log10_km a partir de pares enzima-sustrato.
- Procesamiento por lotes: entrada en formato Parquet con columnas `id`, y salida CSV con `id, log10_kcat, log10_km`.
- Uso de embeddings de proteina (ESM2-35M; ProtT5-XL-U50 y ESM-C 600M por consulta exacta en Swiss-Prot) y de sustrato (MoLFormer-XL, Morgan, RDKit).
- Mecanismo de proteccion contra fuga de datos que redirige predicciones de enzimas relacionadas con datos publicos a un comite entrenado solo con datos de competicion.
- Ajuste intra-enzima para mejorar el orden relativo de sustratos de una misma enzima.
- Modelo de respaldo (fallback) LightGBM sobre caracteristicas construidas a mano.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Priorizacion de enzimas en biologia sintetica: estimar kcat y Km para cientos de candidatos enzima-sustrato antes de validacion experimental, usando el ensemble sobre embeddings como filtro inicial.
- Ingenieria de proteinas y diseno de enzimas: evaluar mutantes o variantes de una enzima comparando sus predicciones de kcat y Km frente a la forma salvaje, apoyandose en el ajuste intra-enzima para ordenar sustratos.
- Anotacion de bases de datos metabolicas: rellenar parametros cineticos ausentes en modelos a escala genomica (GEM) donde no existen mediciones experimentales, ejecutando el modelo en CPU sobre lotes Parquet.
- Docencia y evaluacion de metodologias: la variante de "datos publicos completos" sirve para cuantificar el impacto de la fuga de datos en benchmarks de cinetica enzimatica, comparando la ruta con y sin leak guard.
- Analisis de sensibilidad de sustratos: usar el miembro solo de sustrato y las caracteristicas RDKit/Morgan para estudiar como varia Km segun la estructura quimica del sustrato con una enzima fija.
- Despliegue en entornos sin GPU: al ejecutarse solo en CPU (unos 4 minutos en 2 nucleos), encaja en servidores modestos o pipelines de laboratorio donde no hay aceleradores disponibles.
- Reproducibilidad de experimentos de cinetica: generar predicciones de referencia para conjuntos publicos y comparar con mediciones experimentales, aprovechando la trazabilidad de las fuentes de datos declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mejoras relativas en dos folds reservados para la ruta entrenada solo con datos de competicion: +0,017 / +0,007 (kcat) y +0,015 / +0,004 (Km) al ampliar el comite de seguridad en la v15, sin especificar la metrica absoluta ni los valores de partida.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- Tiempo de inferencia declarado: aproximadamente 4 minutos en 2 nucleos de CPU para el conjunto de entrada.
- Memoria: no se especifica; el repositorio ocupa 0,7 GB y se ejecutan ESM2-35M y MoLFormer-XL mediante ONNX Runtime, por lo que se recomienda al menos 8-16 GB de RAM (estimacion no confirmada por el autor).
- Despliegue mediante el script `predict.py` (`python /app/predict.py --input X.parquet --output Y.csv`), con ONNX Runtime y NumPy como dependencias principales.
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Throughput y latencia por fila: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v17 | Ensemble de arboles + redes sobre embeddings | no disponible (repo 0,7 GB) | no aplica | CC BY 4.0 | Hugging Face (ONNX) |
| DLKcat (Li et al. 2022) | Red neuronal sobre grafos y secuencias | no disponible en la informacion | no aplica | no disponible | publico (fuente de datos citada) |
| CatPred (Boorla & Maranas 2025) | Modelo de prediccion de parametros cineticos | no disponible en la informacion | no aplica | CC BY 4.0 (base de datos citada) | publico (fuente de datos citada) |

No se dispone de datos comparativos de rendimiento entre estos sistemas en la informacion proporcionada; la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- La variante esta marcada explicitamente como "NOT FOR SUBMISSION": fue entrenada con datos publicos que solapan con el conjunto de validacion (alrededor del 63 % de filas con coincidencia exacta), por lo que sus puntuaciones estan infladas y no son comparables con un modelo sin fuga.
- La model card mezcla la descripcion de la variante principal con las iteraciones v12-v15; no queda claro que version corresponde exactamente a los pesos publicados.
- El leak guard depende de la deteccion de enzimas relacionadas mediante similitud de 5-meros (coseno > 0,08); enzimas del test oculto no pueden eliminarse de antemano, por lo que persiste riesgo residual de fuga.
- Los miembros basados en ProtT5-XL-U50 y ESM-C 600M usan tablas de embeddings de Swiss-Prot; las enzimas ausentes reciben un embedding predicho por una red auxiliar, lo que introduce error adicional.
- Riesgo de extrapolacion: el modelo se entrena con datos de cinetica publicos y de competicion, con cobertura limitada de familias enzimaticas y sustratos; las predicciones fuera de esa distribucion no estan validadas.
- No se documentan sesgos, cobertura de idiomas ni evaluacion de calibracion; al no ser un modelo linguistico, no aplican sesgos de lenguaje, pero si posibles sesgos de muestreo en las bases de datos de cinetica.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero las fuentes de datos subyacentes (CatPred-DB, DLKcat, EnzyExtractDB, Swiss-Prot, Protein Dimension DB) tienen sus propias condiciones que deben respetarse.
- Sin pipeline declarado en Hugging Face, sin descargas ni likes, y sin resultados de benchmarks publicados: la madurez y el soporte del artefacto son limitados.
- No apto para generacion de texto, codigo, vision ni tareas de agente.

## Enlaces

- Hugging Face: https://huggingface.co/raghava137/kcat-km-v17
- CatPred-DB (Boorla & Maranas 2025): no disponible enlace directo en la informacion
- DLKcat (Li et al. 2022): no disponible enlace directo en la informacion
- EnzyExtractDB (Wei et al. 2025): no disponible enlace directo en la informacion
- ProtT5-XL-U50 (UniProt, CC BY 4.0): no disponible enlace directo en la informacion
- Protein Dimension DB 2.0 (pitagoras-alves, Hugging Face, MIT): no disponible enlace directo en la informacion
