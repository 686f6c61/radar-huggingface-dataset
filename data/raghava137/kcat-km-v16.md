# raghava137/kcat-km-v16

## Resumen

kcat-km-v16 es un modelo predictivo de cinética enzimática desarrollado por el usuario raghava137 y publicado en Hugging Face. No se trata de un modelo de lenguaje, sino de un comité (ensemble) de modelos de gradient boosting y redes neuronales ligeras que predice dos constantes cinéticas fundamentales: la constante catalítica (kcat) y la constante de Michaelis-Menten (Km), a partir de la secuencia de la enzima y de la identidad del sustrato. Su salida son dos columnas, `log10_kcat` y `log10_km`, en formato CSV.

El modelo es una variante "competition-data-only" de la versión v15: todas las predicciones provienen de un comité entrenado exclusivamente con el conjunto de entrenamiento de una competición (aparentemente un reto de predicción de parámetros cinéticos), sin usar datos públicos de cinética (CatPred-DB, DLKcat, EnzyExtractDB) que sí emplean otras variantes de la misma familia. Esto lo hace especialmente seguro frente a fugas de datos del conjunto de test oculto.

Técnicamente, combina LightGBM (pérdidas L2 y L1), CatBoost, dos redes de fusión y una red de atención regional sobre embeddings de proteínas de ESM2-35M (primeros 510 residuos) y características de sustrato de MoLFormer-XL, Morgan y RDKit. Está diseñado para ejecutarse solo en CPU (ONNX Runtime y NumPy), con una inferencia completa de unos 4 minutos en 2 CPUs. Su licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Comité (ensemble): LightGBM (L2/L1), CatBoost, 2 redes de fusión, red de atención regional sobre embeddings ESM2-35M, clasificador LightGBM de bins, LightGBM solo-sustrato, miembros con embeddings ProtT5-XL-U50 y ESM-C 600M por lookup |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo denso único; usa ESM2-35M y MoLFormer-XL como extractores vía ONNX) |
| Longitud de contexto | no disponible (procesa los primeros 510 residuos de cada proteína) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada: secuencias proteicas y descriptores químicos) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ESM2 y MoLFormer) y pesos propios en NumPy; tamaño del repositorio 0,7 GB |

## Arquitectura y entrenamiento

El comité principal para kcat está formado por LightGBM con pérdidas L2 y L1, CatBoost, dos redes de fusión y una red de atención regional que opera sobre embeddings de ESM2-35M (primeros 510 residuos, con media global y 32 regiones) combinados con descriptores del sustrato obtenidos de MoLFormer-XL, huellas de Morgan y RDKit. Los miembros se promedian en el espacio de etiquetas. A partir de la v12 se añadieron un clasificador LightGBM sobre 10 bins de orden de magnitud (con valor esperado como salida, para ambos objetivos) y un LightGBM solo-sustrato para Km. En la v14 se incorporaron dos miembros adicionales que usan embeddings de modelos proteicos grandes (ProtT5-XL-U50 y ESM-C 600M) recuperados por secuencia exacta desde tablas públicas de Swiss-Prot, reducidos a 256 dimensiones PCA; las enzimas ausentes en Swiss-Prot reciben un embedding predicho desde la media de ESM2-35M mediante una pequeña red entrenada con ~385k proteínas de Swiss-Prot sin etiquetas de cinética. Cada uno de estos miembros cuenta doble en el promedio.

El entrenamiento de esta variante v16 usa exclusivamente el split de entrenamiento de la competición; ninguna fila pública de CatPred-DB (Boorla & Maranas 2025, CC BY 4.0), DLKcat (Li et al. 2022) o EnzyExtractDB (Wei et al. 2025) participa en él. Se aplicó una protección anti-fugas: se eliminó toda fila pública cuya enzima fuera una enzima de validación o compartiera clúster de 5-meros con ella (coseno > 0,08). Adicionalmente, en tiempo de inferencia, cada enzima de entrada se compara con todas las enzimas de los datos públicos; si está relacionada, la predicción la realiza el comité entrenado solo con datos de la competición. Las decisiones de la v14 se tomaron sobre dos folds de clúster retenidos del split de entrenamiento. También incluye un ajuste intra-enzima: las predicciones de los sustratos de una misma enzima se contraen hacia la media de la enzima (kcat x0,5, Km x0,7) más un 0,2 de la desviación centrada de un LightGBM intra-enzima, manteniendo inalteradas las medias por enzima.

## Capacidades

- Predicción de log10(kcat) a partir de secuencia de enzima y sustrato.
- Predicción de log10(Km) con el mismo comité y las mismas pasadas de ESM2 y MoLFormer (una sola pasada de cada modelo sirve para ambos objetivos).
- Procesamiento de secuencias proteicas hasta 510 residuos mediante ESM2-35M con atención regional (media + 32 regiones).
- Caracterización de sustratos mediante embeddings de MoLFormer-XL, huellas de Morgan y descriptores RDKit.
- Clasificación de orden de magnitud (10 bins) con valor esperado para ambos objetivos.
- Ajuste intra-enzima que mejora el ordenamiento relativo de sustratos de una misma enzima.
- Protección anti-fugas en inferencia: enrutamiento automático a un comité "seguro" cuando la enzima de entrada está relacionada con datos públicos de entrenamiento.
- Ejecución solo en CPU mediante ONNX Runtime y NumPy, con interfaz de línea de comandos (`predict.py --input X.parquet --output Y.csv`).
- Mecanismo de fallback: un pequeño LightGBM sobre características construidas a mano para Km.

## Casos de uso

- Predicción de parámetros cinéticos para modelado metabólico: permite estimar kcat y Km de enzimas no caracterizadas experimentalmente para alimentar modelos de flujos metabólicos a escala genómica (por ejemplo, en kinetic models tipo GECKO), donde faltan miles de constantes.
- Anotación de bases de datos enzimáticas: procesamiento por lotes de pares enzima-sustrato en formato Parquet para anotar entradas de genomas recién secuenciados con estimaciones de eficiencia catalítica.
- Priorización de experimentos de caracterización enzimática: dado un panel de enzimas candidatas, el modelo ordena por kcat esperado qué enzimas merecen ensayos experimentales, ahorrando coste de laboratorio.
- Diseño de rutas biosintéticas: comparación de enzimas alternativas (homólogos) para un mismo paso de reacción usando las medias por enzima del comité, que son robustas entre sustratos.
- Participación verificable en competiciones científicas: la variante competition-data-only garantiza que no se han usado etiquetas públicas relacionadas con el test oculto, útil cuando se exige trazabilidad frente a fugas.
- Estudios de especificidad de sustrato: el ajuste intra-enzima y el LightGBM intra-enzima permiten comparar sustratos dentro de una misma enzima de forma más fiable que predicciones independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona mejoras relativas internas del comité sobre dos folds retenidos del propio split de entrenamiento (por ejemplo, +0,017 / +0,007 en kcat y +0,015 / +0,004 en Km al añadir miembros extra al comité anti-fugas de la v15), sin métricas absolutas ni comparación con otros modelos.

## Requisitos de hardware

- Ejecución diseñada solo para CPU: la inferencia completa tarda aproximadamente 4 minutos en 2 CPUs.
- No se requiere GPU: ESM2-35M y MoLFormer-XL se ejecutan vía ONNX Runtime optimizado para CPU, y las redes neuronales restantes corren en NumPy.
- Memoria: no se especifica explícitamente; el repositorio pesa 0,7 GB, por lo que una máquina con varios GB de RAM debería bastar (estimación, no dato oficial).
- Despliegue: script de línea de comandos en Python (`/app/predict.py`) con entrada Parquet y salida CSV, pensado para contenedores o pipelines por lotes.
- No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables: no es un modelo de lenguaje generativo).
- Latencia y throughput: ~4 minutos en 2 CPUs para el conjunto de inferencia de referencia; no se detalla el tamaño de ese conjunto.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Datos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| raghava137/kcat-km-v16 | Comité LightGBM/CatBoost/redes + ESM2-35M y MoLFormer-XL | Secuencia de enzima + sustrato | log10_kcat, log10_km | Solo split de competición | CC BY 4.0 |
| DLKcat (Li et al. 2022) | Red neuronal (GNN + embeddings de secuencia) | Secuencia de enzima + sustrato (SMILES) | kcat | DLKcat database (~decenas de miles de pares) | no disponible |
| CatPred (Boorla & Maranas 2025) | Modelos de aprendizaje automático con incertidumbre | Secuencia de enzima + sustrato | kcat, Km, Ki con intervalos de confianza | CatPred-DB | CC BY 4.0 (datos) |

La diferencia clave de kcat-km-v16 frente a DLKcat y CatPred es su disciplina anti-fugas: excluye deliberadamente datos públicos relacionados con las enzimas de validación/test y enruta las predicciones de enzimas cercanas a datos públicos por un comité "limpio", a costa de prescindir de esos datos como señal de entrenamiento.

## Limitaciones y advertencias

- Alcance restringido a los primeros 510 residuos de cada proteína: enzimas con regiones relevantes más allá de ese corte pueden perder información.
- El modelo es específico de la distribución de la competición para la que se construyó; su rendimiento en enzimas o sustratos muy alejados de esa distribución no está documentado.
- No se publican métricas absolutas de precisión (R2, MAE, etc.), lo que dificulta evaluarlo frente a alternativas sin reproducir la validación.
- El lookup de embeddings grandes (ProtT5-XL-U50, ESM-C 600M) depende de coincidencia exacta de secuencia en Swiss-Prot; enzimas ausentes usan un embedding predicho, de calidad menor no cuantificada.
- El ajuste intra-enzima contrae las predicciones hacia la media de cada enzima (kcat x0,5, Km x0,7), lo que reduce la varianza entre sustratos de una misma enzima y puede infraestimar diferencias reales de especificidad.
- El mecanismo anti-fugas compara por similitud de 5-meros con umbral coseno 0,08; enzimas del test oculto no relacionadas con datos públicos usan el comité completo, pero la robustez de ese umbral no está auditada externamente.
- Licencia CC BY 4.0: permite uso comercial con obligación de atribución al autor y citación de las fuentes de datos (CatPred-DB, DLKcat, EnzyExtractDB, UniProt/ProtT5, Protein Dimension DB).
- Descargas registradas: 0; se trata de un modelo muy reciente y sin adopción ni revisión comunitaria conocida.
- No está diseñado para interpretación biológica directa: las salidas son log10 de los parámetros, no valores con intervalos de incertidumbre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raghava137/kcat-km-v16
- CatPred-DB (Boorla & Maranas 2025): no disponible (no se incluye URL en la model card)
- DLKcat (Li et al. 2022): no disponible (no se incluye URL en la model card)
- EnzyExtractDB (Wei et al. 2025): no disponible (no se incluye URL en la model card)
- ProtT5-XL-U50 (UniProt): no disponible (no se incluye URL en la model card)
- Protein Dimension DB 2.0 (pitagoras-alves en Hugging Face): no disponible (no se incluye URL en la model card)
