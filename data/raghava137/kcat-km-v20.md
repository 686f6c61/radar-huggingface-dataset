# raghava137/kcat-km-v20

## Resumen

kcat-km-v20 es un modelo de predicción de parámetros cinéticos enzimáticos desarrollado por el usuario raghava137 y publicado en Hugging Face bajo licencia CC BY 4.0. No se trata de un modelo de lenguaje generativo, sino de un sistema de ensemble (comité) especializado en predecir dos magnitudes bioquímicas clave para una enzima y un sustrato dados: la constante catalítica kcat y la constante de Michaelis-Menten Km, ambas en escala logarítmica (log10). El modelo resuelve el problema de estimar experimentalmente estos parámetros sin necesidad de realizar ensayos de laboratorio, lo que resulta relevante para aplicaciones de biología sintética, diseño de enzimas y metabolómica.

La arquitectura combina múltiples componentes heterogéneos: modelos de gradient boosting (LightGBM y CatBoost), redes de fusión y una red de atención regional que operan sobre embeddings de proteína generados por ESM2-35M (primeros 510 residuos, media más 32 regiones) y características de sustrato derivadas de MoLFormer-XL, Morgan y RDKit. Las redes neuronales se ejecutan en NumPy en inferencia, mientras que ESM2 y MoLFormer se ejecutan mediante ONNX Runtime. El modelo está diseñado para funcionar exclusivamente en CPU, con un tiempo de inferencia de aproximadamente 4 minutos sobre 2 CPUs.

El repositorio ocupa 0.9 GB y la versión documentada en la model card corresponde a la iteración v16, aunque el identificador del modelo es v20. La información disponible no especifica el número de parámetros totales ni la longitud de contexto en el sentido habitual de modelos de lenguaje, ya que se trata de un sistema especializado en una tarea de regresión bioquímica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de gradient boosting (LightGBM, CatBoost), redes de fusión y red de atención regional sobre embeddings ESM2-35M y MoLFormer-XL; inferencia en NumPy y ONNX Runtime |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa primeros 510 residuos de proteína) |
| Tipos de cuantización | no disponible (PCA-128 con int8 en bloques de anotación; no se documentan cuantizaciones estándar) |
| Idiomas soportados | no disponible (modelo especializado, no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX, NumPy, modelos LightGBM/CatBoost (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un comité (ensemble) que combina miembros de gradient boosting y redes neuronales. Para kcat, el comité incluye LightGBM con regularización L2 y L1, CatBoost, dos redes de fusión y una red de atención regional que operan sobre embeddings de proteína ESM2-35M (primeros 510 residuos, media más 32 regiones) y características de sustrato de MoLFormer-XL, Morgan y RDKit. Los miembros se promedian en el espacio de etiquetas. Para Km, se utiliza la misma salida del comité, compartiendo una pasada de ESM2 y una de MoLFormer para ambos objetivos. Se añaden miembros extra: un clasificador LightGBM sobre 10 bins de orden de magnitud (valor esperado para ambos objetivos) y un LightGBM solo de sustrato (solo Km).

Los datos de entrenamiento incluyen el split de entrenamiento de la competición, filas públicas de CatPred-DB (Boorla & Maranas 2025, CC BY 4.0) y DLKcat (Li et al. 2022) con peso 0.5, y filas de tipo wild-type de EnzyExtractDB (Wei et al. 2025, minadas de literatura) con peso 0.25. Se eliminaron todas las filas públicas cuya enzima fuera una enzima de validación o compartiera un clúster de 5-meros (coseno > 0.08) con una, para evitar filtración de respuestas de validación.

La versión v13 introduce un "leak guard": en tiempo de predicción, cada enzima de entrada se compara con todas las enzimas de datos públicos usadas en entrenamiento; las filas de enzimas relacionadas se predicen con un comité entrenado solo con datos de la competición (weights/refc_safe). La versión v14 añade dos miembros LightGBM con embeddings de proteína de modelos más grandes (ProtT5-XL-U50 y ESM-C 600M) consultados por secuencia exacta en tablas públicas de Swiss-Prot, reducidos a 256 dimensiones PCA; las enzimas no presentes en Swiss-Prot reciben un embedding predicho desde su media ESM2-35M mediante una red entrenada con ~385k proteínas Swiss-Prot. También se añade un ajuste intra-enzima que acerca las predicciones a la media de la enzima (kcat x0.5, Km x0.7) y un pequeño LightGBM intra-enzima que añade 0.2 veces su desviación centrada. La versión v16 incorpora cuatro miembros LightGBM adicionales con bloques de anotación (289 columnas: 10 proteínas Swiss-Prot más cercanas en espacio ESM2-35M, con shares de reino, filo, clases EC y familias Pfam) y de reacción (1033 columnas: reacción Rhea de las 5 proteínas Swiss-Prot más cercanas que mejor coincide con el sustrato, codificada como fingerprint DRFP de 1024 bits).

## Capacidades

- Predicción de kcat (constante catalítica) y Km (constante de Michaelis-Menten) en escala log10 para pares enzima-sustrato.
- Procesamiento de proteínas mediante embeddings ESM2-35M (primeros 510 residuos) y de sustratos mediante MoLFormer-XL, Morgan y RDKit.
- Inferencia exclusiva en CPU, sin necesidad de GPU.
- Ejecución mediante comando: `python /app/predict.py --input X.parquet --output Y.csv` con columnas `id, log10_kcat, log10_km`.
- Integración de anotaciones de proteínas Swiss-Prot (reino, filo, clases EC, familias Pfam) y reacciones Rhea mediante bloques de características.
- Mecanismo de leak guard para evitar filtración de etiquetas públicas en enzimas relacionadas con el conjunto de test.
- Ajuste intra-enzima para mejorar el ordenamiento de sustratos dentro de una misma enzima.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Predicción de parámetros cinéticos para enzimas sin caracterización experimental: dado un par enzima-sustrato, el modelo estima log10_kcat y log10_km, lo que permite priorizar candidatos en proyectos de biología sintética sin realizar ensayos de laboratorio.
- Diseño de enzimas y ingeniería de proteínas: el modelo puede evaluar mutantes o variantes de una enzima comparando las predicciones de kcat y Km frente a la wild-type, gracias a los bloques de anotación y reacción que capturan la identidad funcional de la enzima.
- Anotación funcional en metabolómica: integración en pipelines que procesan datos de metabolómica para asignar parámetros cinéticos a reacciones enzimáticas, usando las predicciones como entrada en modelos metabólicos a escala genómica.
- Filtrado en bases de datos de cinética enzimática: el modelo puede usarse para validar o priorizar entradas en bases de datos como BRENDA o CatPred-DB, detectando pares enzima-sustrato con valores atípicos.
- Selección de sustratos en rutas biosintéticas: el ajuste intra-enzima permite ordenar los sustratos de una misma enzima según su kcat y Km predichos, útil para elegir el sustrato más eficiente en una ruta metabólica diseñada.
- Investigación en catálisis enzimática: el modelo sirve como herramienta de exploración para generar hipótesis sobre qué reacciones Rhea y familias Pfam se asocian con mayores valores de kcat, gracias a los bloques de anotación y reacción.
- Despliegue en entornos sin GPU: al ejecutarse solo en CPU con ~4 minutos de inferencia en 2 CPUs, es adecuado para servidores modestos o contenedores en la nube sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras relativas en validación cruzada por folds (por ejemplo, +0.017 / +0.007 en kcat y +0.015 / +0.004 en Km para la versión v15, y +0.001 / +0.007 en kcat y +0.007 / +0.004 en Km para la v16), pero no se proporcionan valores absolutos de métricas como RMSE, MAE o R², ni comparaciones con otros modelos en tablas de benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para ejecutarse exclusivamente en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en consumer GPU: no aplica (no usa GPU).
- Opciones de despliegue: ejecución mediante script Python (`predict.py`) con ONNX Runtime para ESM2 y MoLFormer, y NumPy para las redes neuronales; los modelos LightGBM y CatBoost se ejecutan en CPU.
- Latencia y throughput: aproximadamente 4 minutos de inferencia en 2 CPUs para el conjunto de entrada, según la model card.
- Tamaño del repositorio: 0.9 GB, lo que incluye pesos ONNX, modelos de boosting y tablas de embeddings.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v20 (raghava137) | Ensemble de boosting + embeddings proteicos | no disponible | no disponible | CC BY 4.0 | Hugging Face |
| CatPred-DB (Boorla & Maranas 2025) | Base de datos de cinética enzimática | no aplica | no aplica | CC BY 4.0 | Pública |
| DLKcat (Li et al. 2022) | Modelo de predicción de kcat | no disponible | no disponible | no disponible | Pública |
| ESM2-35M | Modelo de lenguaje proteico | 35M | 510 residuos (en este uso) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre kcat-km-v20 y estos sistemas en la información proporcionada. La comparativa se limita a aspectos de tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en predicción de kcat y Km; no es un modelo de lenguaje general y no soporta generación de texto, código, visión ni audio.
- La model card documenta la versión v16, mientras que el identificador del repositorio es v20; no se dispone de información sobre los cambios entre v16 y v20.
- El rendimiento se ha evaluado principalmente mediante folds de validación cruzada sobre datos de competición; no se han publicado métricas absolutas en benchmarks estándar.
- El leak guard mitiga pero no elimina el riesgo de filtración de etiquetas públicas; su eficacia depende de la similitud de 5-meros (coseno > 0.08) como criterio de relación.
- La inferencia requiere 4 minutos en 2 CPUs, lo que puede ser limitante para aplicaciones de alto throughput.
- El modelo depende de tablas de embeddings de Swiss-Prot y de anotaciones Rhea y Pfam; enzimas ausentes de estas bases de datos reciben embeddings predichos, lo que puede introducir error.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales sobre los datos de entrenamiento de terceros (CatPred-DB, DLKcat, EnzyExtractDB, Swiss-Prot, Rhea).
- No se documentan sesgos específicos, pero al entrenarse con datos públicos de cinética enzimática, puede heredar sesgos de cobertura taxonómica y de familias proteicas sobrerrepresentadas.
- Riesgo de alucinación en el sentido de predicciones fuera de rango para enzimas o sustratos muy alejados de la distribución de entrenamiento; no se documentan intervalos de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/raghava137/kcat-km-v20
- CatPred-DB (Boorla & Maranas 2025): no disponible en la información proporcionada
- DLKcat (Li et al. 2022): no disponible en la información proporcionada
- EnzyExtractDB (Wei et al. 2025): no disponible en la información proporcionada
- DRFP (Probst, Schwaller & Reymond 2022): no disponible en la información proporcionada
- Protein Dimension DB 2.0 (pitagoras-alves): no disponible en la información proporcionada
- Swiss-Prot (UniProt): no disponible en la información proporcionada
- Rhea: no disponible en la información proporcionada
