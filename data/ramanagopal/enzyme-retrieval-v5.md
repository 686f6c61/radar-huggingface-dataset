# Ramanagopal/enzyme-retrieval-v5

## Resumen

Enzyme Retrieval v5 es un sistema híbrido de predicción de números EC (Enzyme Commission) desarrollado por el usuario Ramanagopal y publicado en HuggingFace. A diferencia de un modelo de lenguaje generativo, se trata de un pipeline de clasificación especializado que combina recuperación por texto, recuperación aproximada de conectividad molecular, un ranker de EC basado en gradient boosting (heredado de la versión V4) y un clasificador neuronal con dos capas ocultas. Su objetivo es asignar un número EC completo y único a cada reacción química expresada como SMILES.

El modelo es relevante en el contexto de anotación enzimática automatizada: permite predecir la clase funcional de una enzima a partir de la reacción que cataliza, sin necesidad de conexión de red, GPU ni ficheros de entrenamiento externos durante la inferencia. Todos los pesos e índices de recuperación están incluidos en el repositorio, lo que facilita su despliegue reproducible en contenedores.

La arquitectura no es un transformer: se apoya en features hasheadas de caracteres y de conectividad, TF-IDF ajustado en entrenamiento y representaciones ocultas normalizadas de 128 dimensiones sobre las que se aplica KNN. El modelo se distribuye en formato joblib con un tamaño de repositorio de 0,3 GB. No se han publicado datos de licencia, idiomas ni pipeline en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: recuperación de texto y conectividad (V4) + ranker gradient-boosted + clasificador neuronal denso (256/128 ReLU) + KNN sobre representaciones ocultas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre cadenas SMILES) |
| Tipos de cuantización | no disponible (pesos en joblib, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (`weights/model.joblib` y assets asociados) |

## Arquitectura y entrenamiento

El sistema combina cuatro componentes. Primero, la recuperación de texto y conectividad aproximada de V4 junto con su ranker de EC basado en gradient boosting. Segundo, un clasificador neuronal con dos capas ocultas de 256 y 128 unidades ReLU, cuyas entradas combinan 16.384 features hasheadas de caracteres con 12.288 features hasheadas de conectividad y cambios de reacción, usando TF-IDF ajustado durante el entrenamiento. Tercero, un KNN sobre las representaciones ocultas normalizadas de 128 dimensiones del modelo neuronal, cuyos votos de EC complementan las probabilidades del clasificador y las puntuaciones de candidatos de V4. Cuarto, un esquema de mezcla con pesos congelados mediante el primer holdout local y verificado con un segundo holdout.

Las features de conectividad emplean el mismo parser ligero que V4: aproximan vecindades atómicas, ignoran la estereoquímica y no implementan un saneamiento completo de SMILES. El agrupamiento se realiza sobre cadenas de entrada exactas, sin fusionar representaciones químicamente equivalentes. El preentrenamiento neuronal usa una partición fija de cadenas de reacción únicas exactas (semilla 105), excluyendo dos holdouts de 5.500 reacciones cada uno. La época del checkpoint y los ajustes de mezcla se seleccionaron sobre el holdout A. Las reacciones públicas con múltiples etiquetas EC aportan un registro ponderado por etiqueta. Tras la selección, el checkpoint se afina durante ocho épocas sobre todas las reacciones públicas cuyas etiquetas están en el vocabulario del clasificador, conservando el escalado de features ajustado. Las EC ausentes de ese vocabulario siguen disponibles mediante la recuperación de V4. El índice KNN neuronal final incluye todas las reacciones públicas de entrenamiento y no se usan etiquetas de validación del leaderboard.

## Capacidades

- Predicción de un número EC completo y único por cada reacción SMILES de entrada.
- Recuperación de candidatos mediante texto y conectividad molecular aproximada.
- Clasificación neuronal con features hasheadas de caracteres y de cambios de reacción.
- Votación por vecinos KNN sobre representaciones ocultas normalizadas de 128 dimensiones.
- Fusión de puntuaciones de múltiples componentes con pesos congelados y validados en dos holdouts locales.
- Inferencia totalmente offline: no requiere conexión de red, GPU ni ficheros de entrenamiento externos.
- Procesamiento por lotes desde Parquet con salida JSONL, preservando el primer ID original y el orden de entrada.
- Deduplicación por cadena de entrada exacta: una salida por reacción distinta.

## Casos de uso

- Anotación funcional de enzimas en pipelines bioinformáticos: dado un conjunto de reacciones en SMILES, el sistema asigna un EC completo por reacción, lo que permite enriquecer bases de datos metabólicas sin intervención manual.
- Clasificación masiva de reacciones en estudios de metabolómica: el procesamiento por lotes desde Parquet y la salida JSONL facilitan la integración en flujos existentes de análisis de datos.
- Preetiquetado para curación experta: las predicciones sirven como propuesta inicial que revisores humanos validan, reduciendo el coste de anotación en proyectos de biología computacional.
- Despliegue en entornos aislados o air-gapped: al no requerir red ni GPU, el modelo puede ejecutarse en contenedores Docker dentro de infraestructuras restringidas, como laboratorios con requisitos de confidencialidad.
- Evaluación comparativa de pipelines de anotación enzimática: el script `verify_submission.py` mide la predicción local y comprueba IDs, orden, etiquetas, tamaño de salida y el límite de 900 segundos, lo que permite validar instalaciones antes de enviar resultados.
- Reproducibilidad de experimentos: los scripts `train.py`, `fit_hybrid.py` y `fit_neural.py` permiten reconstruir todos los assets desde el fichero público de entrenamiento, útil para auditorías y replicación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que la versión V4 enviada por el usuario obtuvo una puntuación de 0,48190864095689834 en el leaderboard, mientras que v5 no tiene puntuación oficial todavía. Las mejoras medidas en holdouts locales no garantizan una mejora en el leaderboard. Los detalles de puntuaciones locales, tiempo de ejecución, memoria y tamaño de salida se remiten a `VALIDATION.md` y `validation.json`, no incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema no requiere GPU según la model card.
- GPU recomendadas: no aplica; la inferencia está diseñada para ejecutarse sin GPU.
- Compatibilidad con GPU de consumo: no relevante, al no necesitar aceleración gráfica.
- Opciones de despliegue: ejecución directa con `python predict.py --input ... --output ...`; construcción de imagen Docker con dependencias fijadas y copia de pesos preentrenados (el build no entrena).
- Dependencias: la lista de dependencias y la imagen base son las mismas que en V4; no se añade PyTorch ni ninguna dependencia de transformer.
- Latencia y throughput: no disponibles de forma numérica; la model card menciona un límite de predicción de 900 segundos verificado por `verify_submission.py`, sin incluir el tiempo de descarga de la imagen del contenedor.
- Tamaño del repositorio: 0,3 GB, incluyendo pesos e índices de recuperación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de predicción de números EC comparables, ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede confirmarse el uso comercial ni la redistribución.
- El parser de conectividad es aproximado: ignora estereoquímica y no implementa un saneamiento completo de SMILES, lo que puede afectar a la calidad de las features en entradas complejas.
- El agrupamiento se hace por cadena de entrada exacta; cadenas químicamente equivalentes no se fusionan, lo que puede generar predicciones separadas para la misma molécula expresada de forma distinta.
- Las mejoras medidas en holdouts locales no garantizan mejoras en el leaderboard; v5 no tiene puntuación oficial.
- Las EC ausentes del vocabulario del clasificador neuronal solo pueden recuperarse mediante V4, lo que limita la cobertura del componente neuronal.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas; el modelo no es lingüístico y opera sobre SMILES.
- El entrenamiento se realiza antes de la subida; el build de Docker solo instala dependencias y copia pesos, por lo que no se reentrena en despliegue.
- No se especifican requisitos de memoria ni límites de tamaño de lote más allá del límite de 900 segundos por predicción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ramanagopal/enzyme-retrieval-v5
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
