# Danish-777/kcat-km-esm-xgb

## Resumen

kcat-km-esm-xgb es un predictor de parámetros cinéticos enzimáticos desarrollado por el usuario Danish-777 y publicado en HuggingFace bajo licencia MIT. A partir de una secuencia de aminoácidos y un SMILES de sustrato, estima log10(kcat) y log10(Km), es decir, la constante catalítica y la constante de Michaelis. No es un modelo generativo ni un LLM: es un ensemble de tres regresores XGBoost cuyas predicciones se combinan promediando rangos, y está diseñado para ejecutarse únicamente en CPU.

El sistema combina dos bloques de features. El primero es puramente químico y composicional: composición de aminoácidos y dipéptidos, fingerprint de Morgan, descriptores de RDKit y medias suavizadas de features de sustrato. El segundo añade embeddings de ESM-2 (variantes de 8M y 35M parámetros) con mean pooling, emparejados con las mismas features de sustrato. La validación se hizo con validación cruzada de 5 folds agrupada por familias enzimáticas (clusters MMseqs2 al 40 % de identidad), de modo que ninguna enzima retenida tiene un pariente cercano en entrenamiento.

Su relevancia es acotada pero concreta: cubre un hueco práctico en biología sintética e ingeniería metabólica, donde medir kcat y Km experimentalmente es caro y lento. El repositorio ocupa 0,2 GB, no tiene descargas ni likes en el momento de la consulta y el autor no publica métricas de error ni comparativas numéricas, por lo que debe tratarse como una herramienta reproducible y auditable, no como un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres regresores XGBoost combinados por promedio de rangos, sobre features hand-crafted + embeddings ESM-2 |
| Parametros totales | No disponible (no se documenta el numero de arboles ni de nodos); los backbones ESM-2 usados son de 8M y 35M parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de regresion sobre features; no gestiona contexto conversacional) |
| Tipos de cuantizacion | No disponible; no aplica cuantizacion de pesos en el sentido de LLM (los arboles XGBoost se sirven en su formato nativo) |
| Idiomas soportados | No aplica; la entrada es secuencia proteica (aminoacidos) y SMILES quimico |
| Licencia | MIT |
| Formato de pesos | Repositorio de 0,2 GB con tag `safetensors`; incluye artefactos XGBoost y script `predict.py` (el autor no detalla el empaquetado exacto de cada componente) |

## Arquitectura y entrenamiento

El pipeline tiene tres vías predictivas que se agregan por rank averaging. Las features de entrada son: composición de aminoácidos y dipéptidos de la secuencia, fingerprint de Morgan del sustrato, descriptores calculados con RDKit y medias suavizadas de features de sustrato. Sobre esa base se entrena un primer XGBoost. Los otros dos añaden embeddings de ESM-2 con mean pooling, en las tallas de 8M y 35M parámetros, concatenados con las mismas features de sustrato. El resultado final para log10(kcat) y log10(Km) es la media de los rangos asignados por cada uno de los tres modelos, una estrategia de blending robusta frente a diferencias de escala entre predictores.

El autor no detalla el volumen del conjunto de entrenamiento, la composición del dataset, la procedencia de las medidas experimentales ni si hubo etapas de ajuste fino sobre ESM-2 (lo más probable es que los embeddings se usen congelados, extraídos del modelo preentrenado). Tampoco se especifica la función de pérdida ni el esquema de hiperparámetros. La innovación metodológica declarada es la prevención de fuga de información: la validación cruzada agrupa por clusters de MMseqs2 al 40 % de identidad, lo que evita que enzimas homólogas aparezcan simultáneamente en train y test, un problema habitual en la literatura de predicción de kcat. El tag `leak-curber` del repositorio apunta en la misma dirección.

## Capacidades

- Predicción de log10(kcat) para un par enzima-sustrato a partir de secuencia proteica y SMILES.
- Predicción de log10(Km) en las mismas condiciones de entrada.
- Inferencia en CPU, sin requisito de GPU ni de CUDA.
- Procesamiento por lotes: el script acepta un fichero Parquet de entrada y genera un CSV de predicciones.
- Representación de sustratos mediante Morgan fingerprints y descriptores de RDKit, lo que cubre moléculas pequeñas representables en SMILES.
- Uso de información evolutiva proteica vía embeddings ESM-2 (8M y 35M), sin necesidad de estructura 3D experimental.
- Ensemble con blending por rangos, que reduce la sensibilidad a outliers de un único modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Priorización de paneles enzimáticos en ingeniería metabólica: dado un conjunto de enzimas candidatas y un sustrato intermediario de una ruta, el modelo estima kcat y Km para cada par y permite ordenar qué enzimas merecen caracterización experimental, reduciendo el número de ensayos in vitro.
- Diseño de librerías de mutantes: para variantes generadas computacionalmente de una enzima, se predicen los dos parámetros cinéticos y se seleccionan las variantes con mayor kcat y menor Km antes de expresar y purificar.
- Curación y enriquecimiento de bases de datos de cinética enzimática: el modelo puede rellenar huecos de kcat y Km en registros incompletos, marcando las predicciones como estimaciones para revisión manual.
- Selección de sustrato en biotransformaciones industriales: evaluar rápidamente qué sustratos de una familia química son cinéticamente más favorables para una enzima ya elegida, útil en química verde y síntesis de intermedios.
- Baseline reproducible en investigación metodológica: al estar validado con splits agrupados por identidad de secuencia, sirve como referencia honesta (libre de fuga) contra la que comparar modelos deep learning multimodales.
- Docencia y prototipado en bioinformática: al ejecutarse solo en CPU y con licencia MIT, es viable en portátiles y aulas para ilustrar pipelines feature engineering + boosting en biología computacional.
- Filtrado previo en pipelines de diseño de enzimas generativas: descartar candidatos con cinética predicha desfavorable antes de pasar a modelos de estructura o a simulación molecular, ahorrando cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor describe el protocolo de validación (validación cruzada de 5 folds agrupada por clusters MMseqs2 al 40 % de identidad) pero no incluye métricas numéricas como RMSE, MAE, R², ni comparaciones cuantitativas con otros predictores de kcat/Km.

## Requisitos de hardware

- Inferencia en CPU exclusivamente, según indica la model card; no requiere GPU.
- VRAM: no aplica. No hay pesos neuronales que sirvan en VRAM más allá de los embeddings ESM-2 si se extraen en GPU.
- RAM estimada: del orden de 2 a 4 GB para cargar ESM-2 35M en fp32 (unos 140 MB de pesos), ESM-2 8M (unos 32 MB), los artefactos XGBoost y las dependencias de RDKit (estimación propia; el autor no publica cifras).
- GPU recomendadas: ninguna imprescindible. Opcionalmente, cualquier GPU consumer (por ejemplo RTX 3060 o superior) acelera la extracción de embeddings ESM-2 si se procesan lotes grandes.
- Cabe en cualquier equipo de consumo: el repositorio completo pesa 0,2 GB y el cuello de botella es el cálculo de descriptores con RDKit y la extracción de embeddings, no la memoria.
- Opciones de despliegue: script CLI `python predict.py --input INPUT.parquet --output predictions.csv`; contenedores Docker propios; integración como paso de batch en workflows de Snakemake o Nextflow. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo.
- Latencia y throughput: no disponibles. Cualquier estimación depende del tamaño del lote y de si se cachean embeddings de secuencia, que son reutilizables entre distintos sustratos para una misma enzima.

## Comparativa con modelos similares

| Modelo | Enfoque | Salidas | Licencia | Disponibilidad | Datos que faltan |
|---|---|---|---|---|---|
| kcat-km-esm-xgb (Danish-777) | XGBoost x3 + features RDKit + ESM-2 8M/35M, blending por rangos | log10(kcat), log10(Km) | MIT | Pesos en HuggingFace, 0,2 GB, CPU | Metricas, tamano del dataset |
| esmKCat (silveraru) | Deep learning multimodal: ChemBERTa + GINE para sustrato, ESM para secuencia, GINE para estructura 3D | kcat | No disponible | Repositorio GitHub | Parametros, contexto, licencia |
| EZKinetics (le-yuan) | XGBoost con ESM3 y ChemBERTa-77M-MLM para el par kcat/Km | kcat y Km | No disponible | Repositorio GitHub | Parametros, metricas, licencia |
| Modelos de Boltzmann Labs | Modelos dedicados de kcat y Km; el autor declara que superan a CatPred en todas las evaluaciones out-of-distribution | kcat y Km | No disponible | No se indica publicacion de pesos | Pesos, arquitectura, licencia |
| CatPred | Referencia de comparacion citada en la busqueda; predictor de parametros cineticos | kcat y Km | No disponible en la informacion | No disponible en la informacion | Todo lo demas |

La diferencia práctica de kcat-km-esm-xgb frente a esmKCat y EZKinetics es que declara explícitamente el control de fuga por identidad de secuencia y que su inferencia es CPU-only con licencia MIT, lo que facilita su reproducción; a cambio, no publica métricas que permitan situarlo frente a esos competidores.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: sin RMSE, MAE ni R² no es posible saber si las predicciones son utilizables en un rango de valores concreto.
- Cero descargas y cero likes en el momento de la consulta: no hay validación independiente por parte de la comunidad ni informes de terceros.
- El propio autor no documenta el tamaño ni la procedencia del dataset de entrenamiento, lo que impide evaluar la cobertura del espacio químico y de familias enzimáticas.
- Riesgo de extrapolación: enzimas sin parientes en los clusters de entrenamiento y sustratos poco representados en SMILES pueden producir predicciones con error elevado y no cuantificado.
- Los parámetros kcat y Km dependen de condiciones experimentales (pH, temperatura, fuerza iónica, concentración de cofactores) que el modelo no recibe como entrada; las predicciones deben interpretarse como valores en condiciones no especificadas.
- No se documentan intervalos de confianza ni estimaciones de incertidumbre, algo crítico si las predicciones se usan para decidir qué experimentos financiar.
- No modela cofactores, iones metálicos ni modificaciones postraduccionales de forma explícita en la información disponible.
- Almacenamiento de los embeddings ESM-2 y de los modelos XGBoost: el repositorio no detalla versiones de dependencias, lo que puede complicar la reproducibilidad exacta a medio plazo.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero sin garantía alguna; conviene citar al autor y conservar el aviso de licencia.
- No es un modelo generativo: no admite prompts, diálogo, tool calling ni razonamiento multi-paso; cualquier uso en ese sentido es un error de categoría.

## Enlaces

- HuggingFace: https://huggingface.co/Danish-777/kcat-km-esm-xgb
- esmKCat (GitHub, referencia de predictor multimodal de kcat): https://github.com/silveraru/esmKCat
- EZKinetics, rama XGBoost con ESM3 y ChemBERTa-77M-MLM (GitHub): https://github.com/le-yuan/EZKinetics/tree/main/model/KCAT_KM/XGBoost/ESM3%26ChemBERTa-77M-MLM
- Repositorio EZKinetics (GitHub): https://github.com/le-yuan/EZKinetics
- Articulo de bioRxiv con contexto sobre la familia ESM (ESM-2, ESMFold, ESM-1v, ESM-IF1), SaProt y ProSST: https://www.biorxiv.org/content/biorxiv/early/2026/03/30/2026.03.29.715152/DC1/embed/media-1.docx
- Boltzmann Labs, modelos dedicados de kcat y Km y comparacion con CatPred (LinkedIn): https://www.linkedin.com/pulse/from-sequence-kinetics-boltzmann-labs-develops-dedicated-bs0we/
- Catalogo de modelos de HuggingFace (contexto de busqueda): https://huggingface.co/models?library
