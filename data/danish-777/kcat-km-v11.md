# Danish-777/kcat-km-v11

## Resumen

kcat-Km model v11 es un sistema de prediccion de parametros cineticos enzimaticos desarrollado por el usuario Danish-777 y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje ni de una red neuronal unica, sino de un ensemble heterogeneo que combina tres modelos XGBoost (sobre caracteristicas manuales de enzima, sobre embeddings ESM-2 de 35M y sobre embeddings ESM-2 de 150M), una pequena red neuronal MLP sobre el embedding de 35M y una capa final de mezcla por promediado de rangos. El objetivo concreto es predecir log10(kcat) y log10(Km) a partir de una secuencia de enzima y un SMILES de sustrato, una tarea central en biocatalisis y diseno de enzimas.

El modelo se presenta como participante en un contexto de leaderboard (etiquetas `leaderboard`, `leak-curber`, `kcat`, `km`) y esta disenado para ejecutarse exclusivamente en CPU. Su entrenamiento combina el `train.parquet` de la tarea con la base de datos publica CatPred-DB (Boorla y Maranas, Nature Communications 2025), que a su vez agrega datos de BRENDA y SABIO-RK. El repositorio ocupa 0,7 GB y contiene pesos en formato safetensors, aunque la mayor parte del peso corresponde probablemente a los embeddings y artefactos de los modelos tabulares.

La caracteristica mas relevante —y la mas problematica— es la inclusion explicita de una capa de lookup de valores publicados: si un par enzima-sustrato aparece en `train.parquet`, en CatPred-DB o en DLKcat (Li et al., Nature Catalysis 2022), el sistema devuelve el valor medido en lugar de la prediccion del modelo. El autor lo declara abiertamente en la model card, advirtiendo que las puntuaciones sobre pares presentes en bases de datos reflejan cobertura de la base y no capacidad predictiva. La version v11 anade coincidencia robusta de sustratos mediante InChIKey sin letra de protonacion y bloque de conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 3 x XGBoost + MLP pequena sobre embeddings ESM-2, mezcla por promediado de rangos |
| Parametros totales | No disponible (el componente neuronal es ESM-2 35M y ESM-2 150M; el resto son modelos de arboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; se usan los primeros 256 residuos de la secuencia de enzima |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; ejecucion en CPU) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 0,7 GB) |

## Arquitectura y entrenamiento

El sistema es un ensemble de modelos tabulares y de representacion. Los componentes son: (1) XGBoost entrenado sobre caracteristicas manuales de enzima (referidas como "D" en la model card); (2) XGBoost sobre embeddings ESM-2 35M; (3) XGBoost sobre embeddings ESM-2 150M, con dos variantes de profundidad (depth 7 y depth 8); y (4) una red neuronal pequena (MLP) sobre el embedding de 35M. Las predicciones se combinan promediando rangos, con un "time guard" que no se detalla en la informacion disponible. Los embeddings se calculan sobre los primeros 256 residuos de la secuencia.

Los datos de entrenamiento incluyen el `train.parquet` de la tarea, la totalidad de CatPred-DB (Boorla y Maranas, Nature Communications 2025) —coleccion publica de kcat/Km derivada de BRENDA y SABIO-RK— y, para el lookup, DLKcat (Li et al., Nature Catalysis 2022). La validacion se realizo mediante validacion cruzada de 5 folds agrupada por familias enzimaticas, usando clustering MMseqs2 al 40% de identidad, excluyendo de cada fold las filas externas con al menos 40% de identidad respecto a las familias retenidas. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo.

La innovacion declarada en v11 es la ampliacion del lookup: ademas de la coincidencia directa, se prueba el InChIKey sin la letra de protonacion y despues el bloque de conectividad del InChIKey, aceptando cada nivel solo si concuerda con las etiquetas de entrenamiento.

## Capacidades

- Prediccion de log10(kcat) y log10(Km) a partir de una secuencia de enzima y un SMILES de sustrato.
- Ejecucion exclusiva en CPU, sin requisito de GPU.
- Ensemble de modelos heterogeneos con mezcla por rangos para robustez frente a escalas dispares.
- Lookup de valores medidos publicados para pares enzima-sustrato presentes en `train.parquet`, CatPred-DB o DLKcat.
- Coincidencia robusta de sustratos mediante InChIKey (sin letra de protonacion y bloque de conectividad) en v11.
- Interfaz de linea de comandos: `python predict.py --input INPUT.parquet --output predictions.csv`.
- No soporta tool calling, agentes, razonamiento multi-step, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Priorizacion de enzimas candidatas en biocatalisis: dado un sustrato de interes industrial, predecir kcat y Km para un panel de enzimas y ordenar candidatas antes de validacion experimental, reduciendo el numero de ensayos.
- Ingenieria de proteinas asistida por ML: usar las predicciones como funcion objetivo aproximada en bucles de diseno dirigido, filtrando variantes con Km desfavorable antes de sintetizarlas.
- Curacion y analisis de bases de datos cineticas: contrastar valores medidos de BRENDA o SABIO-RK con las predicciones del ensemble para detectar entradas anomalas o inconsistencias.
- Docencia e investigacion en enzimologia computacional: disponer de una linea base reproducible en CPU para comparar con modelos mas complejos como DLKcat o CatPred.
- Filtrado temprano en pipelines de descubrimiento de enzimas: integrar el script `predict.py` en un pipeline por lotes que procese ficheros Parquet de pares enzima-sustrato y genere CSV con predicciones.
- Analisis de sensibilidad sustrato-enzima: evaluar como varia la prediccion al modificar el SMILES del sustrato manteniendo la enzima, para explorar especificidad.
- Benchmarking interno de modelos cineticos: usar el ensemble como referencia tabular frente a modelos deep learning, teniendo en cuenta la advertencia sobre el lookup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el esquema de validacion (5-fold agrupada por familias con MMseqs2 al 40% de identidad y exclusion de filas externas relacionadas), sin cifras de MAE, RMSE, R2 ni correlaciones de Spearman o Pearson para kcat o Km. Tampoco se ofrecen comparaciones numericas con DLKcat o CatPred.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- Memoria RAM: no disponible de forma explicita; el repositorio ocupa 0,7 GB y los embeddings ESM-2 150M sobre 256 residuos son el componente mas costoso, por lo que se recomienda al menos 8-16 GB de RAM para lotes moderados.
- GPU recomendadas: no aplica (el autor especifica CPU only).
- Cabe en cualquier equipo de consumo; no depende de GPUs como A100, H100 o RTX 4090.
- Opciones de despliegue: script `predict.py` incluido en el repositorio, invocado por linea de comandos sobre ficheros Parquet. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Datos de entrenamiento | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-Km v11 (Danish-777) | Ensemble XGBoost + MLP sobre ESM-2, con lookup | train.parquet + CatPred-DB + lookup DLKcat | Secuencia (primeros 256 residuos) + SMILES | MIT | Hugging Face |
| DLKcat (Li et al., 2022) | Red neuronal sobre representacion de sustrato y enzima | Datos de BRENDA curados | Secuencia + SMILES | No disponible en la informacion | Publicado en Nature Catalysis |
| CatPred (Boorla y Maranas, 2025) | Modelos deep learning para kcat, Km y Ki | CatPred-DB (BRENDA, SABIO-RK) | Secuencia + SMILES | No disponible en la informacion | Publicado en Nature Communications |

No se dispone de cifras de rendimiento comparables en la informacion proporcionada, por lo que la comparativa se limita a enfoque, datos y licencia.

## Limitaciones y advertencias

- El lookup de valores publicados invalida las metricas sobre pares presentes en las bases de datos: las puntuaciones reflejan cobertura, no capacidad predictiva. Cualquier evaluacion debe realizarse sobre pares fuera de `train.parquet`, CatPred-DB y DLKcat.
- Riesgo de fuga de datos (data leakage) en benchmarks y leaderboards si no se excluyen explicitamente los pares cubiertos por el lookup.
- Solo se usan los primeros 256 residuos de la enzima; enzimas largas pueden perder informacion relevante de dominios cataliticos situados mas alla de ese limite.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, vision ni audio.
- Idiomas soportados no aplicables; la interfaz y documentacion estan en ingles.
- Sesgos conocidos: no documentados, pero la cobertura desigual de BRENDA y SABIO-RK puede favorecer familias enzimaticas y sustratos sobrerrepresentados.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de predicciones poco fiables fuera de la distribucion de entrenamiento (enzimas o sustratos quimicamente novedosos).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento predictivo ni sobre la idoneidad para decisiones experimentales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones ni formatos alternativos de pesos mas alla de safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/Danish-777/kcat-km-v11
- CatPred-DB / CatPred (Boorla y Maranas, Nature Communications 2025): no disponible enlace directo en la informacion proporcionada
- DLKcat (Li et al., Nature Catalysis 2022): no disponible enlace directo en la informacion proporcionada
- BRENDA: no disponible enlace directo en la informacion proporcionada
- SABIO-RK: no disponible enlace directo en la informacion proporcionada
- ESM-2 (Meta): no disponible enlace directo en la informacion proporcionada
- MMseqs2: no disponible enlace directo en la informacion proporcionada
