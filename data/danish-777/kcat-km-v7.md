# Danish-777/kcat-km-v7

## Resumen

kcat-Km v7 es un modelo de prediccion de parametros cineticos enzimaticos desarrollado por el usuario Danish-777 y publicado en Hugging Face. No es un modelo de lenguaje generativo, sino un ensemble de aprendizaje automatico que predice los valores log10(kcat) y log10(Km) a partir de una secuencia de enzima y un sustrato representado como SMILES. El modelo combina tres componentes: XGBoost sobre caracteristicas enzimaticas artesanales, XGBoost sobre embeddings ESM-2 de 35M de parametros y XGBoost sobre embeddings ESM-2 de 150M (limitados a los primeros 256 residuos), mas una pequena red neuronal sobre el embedding de 35M, todo fusionado mediante promedio de rangos con una guarda temporal.

La version v7 mantiene el diseno de v4 pero amplia los datos de entrenamiento con CatPred-DB, una coleccion publica de valores kcat/Km derivada de BRENDA y SABIO-RK publicada por Boorla y Maranas en Nature Communications en 2025. El modelo esta disenado para ejecutarse exclusivamente en CPU, lo que lo hace accesible sin GPU. La validacion se realizo con validacion cruzada de 5 folds agrupada por familias enzimaticas (clusters MMseqs2 al 40% de identidad), excluyendo de cada fold las filas externas relacionadas con las familias retenidas.

El modelo es relevante para el campo de la enzimologia computacional y el diseno de proteinas, donde la prediccion de kcat y Km es un cuello de botella para el cribado de mutantes y la optimizacion de vias metabolicas. Su enfoque de ensemble sobre embeddings ESM-2 con datos publicos adicionales lo posiciona como una alternativa ligera a modelos especializados mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: XGBoost (caracteristicas artesanales) + XGBoost (embeddings ESM-2 35M) + XGBoost (embeddings ESM-2 150M, primeros 256 residuos) + MLP sobre embedding 35M; fusion por promedio de rangos |
| Parametros totales | no disponible (el componente ESM-2 150M aporta ~150M; el resto son modelos tabulares) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; secuencias truncadas a los primeros 256 residuos para el componente ESM-2 150M |
| Tipos de cuantizacion | no disponible (pesos en safetensors; inferencia en CPU) |
| Idiomas soportados | no aplica (modelo de prediccion numerica, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 0.6 GB) |

## Arquitectura y entrenamiento

El modelo es un ensemble heterogeneo orientado a regresion. El componente principal son tres modelos XGBoost entrenados sobre representaciones distintas: caracteristicas enzimaticas artesanales (denominadas "D" en la model card), embeddings ESM-2 de 35M de parametros y embeddings ESM-2 de 150M restringidos a los primeros 256 residuos de la secuencia. A estos se suma una red neuronal pequena (MLP) sobre el embedding de 35M. Las predicciones de todos los componentes se combinan promediando sus rangos, con una guarda temporal que presumiblemente evita fugas de informacion entre folds o particiones.

Los datos de entrenamiento combinan el `train.parquet` de la tarea original con CatPred-DB (Boorla y Maranas, Nature Communications 2025), una coleccion publica de valores kcat/Km extraida de BRENDA y SABIO-RK. Se aplico un filtrado de fugas: se eliminaron las filas de CatPred cuya enzima presenta al menos 90% de identidad con una enzima de validacion, y se descartaron los pares ya presentes en `train.parquet`. La validacion emplea validacion cruzada de 5 folds agrupada por familias enzimaticas mediante clusters MMseqs2 al 40% de identidad, excluyendo de cada fold las filas externas relacionadas (al menos 40% de identidad) con las familias retenidas. No se menciona uso de RLHF ni DPO, lo cual es coherente con un modelo de regresion supervisada.

## Capacidades

- Prediccion de log10(kcat) a partir de una secuencia de enzima y un sustrato en formato SMILES.
- Prediccion de log10(Km) bajo las mismas entradas.
- Extraccion de representaciones proteicas mediante ESM-2 en dos escalas (35M y 150M).
- Ejecucion exclusiva en CPU, sin necesidad de GPU.
- Interfaz de linea de comandos: `python predict.py --input INPUT.parquet --output predictions.csv`.
- Procesamiento por lotes de pares enzima-sustrato en formato Parquet.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de vision.

## Casos de uso

- Cribado de mutantes enzimaticos: dado un conjunto de variantes de una enzima y un sustrato de interes, el modelo predice kcat y Km para cada variante, permitiendo priorizar experimentalmente las mutantes con mayor actividad catalitica o menor afinidad.
- Optimizacion de vias metabolicas: al estimar parametros cineticos de enzimas candidatas, se pueden alimentar modelos cineticos de vias (por ejemplo, analisis de control metabolico) sin necesidad de medir experimentalmente cada par enzima-sustrato.
- Anotacion funcional de proteinas: para enzimas de funcion desconocida con sustrato hipotetico, el modelo aporta una estimacion cuantitativa de su capacidad catalitica que orienta la validacion experimental.
- Diseno de enzimas de novo: integrado en pipelines de diseno computacional, el modelo actua como filtro de segundo nivel tras la generacion de secuencias, descartando candidatas con kcat predicho bajo o Km desfavorable.
- Priorizacion en bases de datos: aplicado por lotes sobre BRENDA, SABIO-RK o UniProt, permite enriquecer registros con estimaciones cineticas y detectar entradas anomalas que requieran revision.
- Docencia e investigacion en enzimologia: al ejecutarse en CPU y con licencia MIT, sirve como herramienta reproducible para practicas de laboratorio seco y para comparar con mediciones experimentales en cursos de bioinformatica.
- Benchmarking de modelos cineticos: su diseno de ensemble con ESM-2 lo convierte en una linea base util para evaluar nuevos enfoques de prediccion de kcat/Km en competiciones tipo leaderboard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe la metodologia de validacion (validacion cruzada de 5 folds agrupada por familias enzimaticas con MMseqs2 al 40% de identidad y exclusion de filas externas relacionadas), pero no reporta valores de RMSE, MAE, R2 ni correlaciones de Spearman o Pearson para kcat ni para Km.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- RAM estimada: no disponible con precision; el repo pesa 0.6 GB y los pesos de ESM-2 150M dominan el consumo, por lo que se recomienda al menos 4-8 GB de RAM para cargar los modelos y procesar lotes.
- GPU recomendadas: no aplica; el autor indica explicitamente "CPU only".
- Cabe en cualquier portatil convencional con CPU moderna.
- Opciones de despliegue: script `predict.py` proporcionado por el autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. Dependen del tamano del lote y de la CPU; el componente ESM-2 150M es el cuello de botella previsible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-Km v7 (Danish-777) | Ensemble XGBoost + ESM-2 + MLP | ESM-2 150M + tabulares | Secuencias truncadas a 256 residuos | MIT | Hugging Face (0 descargas) |
| CatPred | Modelo de prediccion cinetica (referencia en la model card) | no disponible | no disponible | no disponible | Publicado en Nature Communications 2025 |
| ESM-2 (Meta) | Modelo de lenguaje proteico | 8M a 15B | 1024 residuos tipicamente | MIT (segun version) | Hugging Face |
| UniKP | Framework de prediccion de kcat/Km | no disponible | no disponible | no disponible | Publicado en Nature Communications |

La comparativa con CatPred y UniKP es cualitativa: la model card solo cita CatPred-DB como fuente de datos, no como modelo comparable en rendimiento. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de regresion supervisada, no un LLM: no genera texto, no razona y no admite instrucciones en lenguaje natural.
- Predice valores en escala log10; la transformacion inversa a unidades lineales puede amplificar errores en predicciones altas.
- El componente ESM-2 150M solo considera los primeros 256 residuos, por lo que enzimas largas pueden perder informacion relevante de dominios cataliticos situados en posiciones posteriores.
- La cobertura depende de la similitud con las familias enzimaticas presentes en entrenamiento y validacion; enzimas con baja identidad respecto a los clusters MMseqs2 usados pueden tener predicciones poco fiables.
- No se reportan metricas de error (RMSE, MAE, R2) en la informacion disponible, lo que impide evaluar su precision real frente a alternativas.
- El filtrado de fugas se aplico a nivel de identidad de secuencia (90% y 40%), pero no se documenta el tratamiento de sustratos novedosos fuera de la distribucion de entrenamiento.
- Riesgo de sobreajuste a los sustratos mas representados en BRENDA y SABIO-RK, que estan sesgados hacia enzimas y reacciones bien estudiadas.
- Al ser un ensemble con promedio de rangos, las predicciones son relativas dentro del lote procesado; la escala absoluta puede no ser directamente comparable entre ejecuciones con lotes distintos.
- Licencia MIT: permite uso comercial, pero no se ofrece garantia alguna sobre la idoneidad de las predicciones para decisiones experimentales o industriales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por terceros.
- No se especifican los idiomas ni la procedencia geografica de los datos, lo que limita la evaluacion de sesgos de cobertura taxonomica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Danish-777/kcat-km-v7
- CatPred-DB (Boorla y Maranas, Nature Communications 2025): no disponible en la informacion proporcionada
- ESM-2 (Meta AI): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
