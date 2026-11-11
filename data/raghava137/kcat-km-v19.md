# raghava137/kcat-km-v19

## Resumen

kcat-km-v19 es un modelo predictivo de parámetros de cinética enzimática (kcat y Km) desarrollado por el usuario de Hugging Face raghava137. No es un modelo de lenguaje generativo, sino un ensemble de aprendizaje automático que combina modelos de gradient boosting (LightGBM, CatBoost) con redes neuronales sobre embeddings de proteínas (ESM2-35M, ProtT5-XL-U50, ESM-C 600M) y de sustratos (MoLFormer-XL, Morgan, RDKit) para predecir la constante catalítica (kcat) y la constante de Michaelis (Km) de pares enzima-sustrato.

El modelo se distribuye como un paquete ONNX de aproximadamente 0,9 GB y está diseñado para ejecutarse únicamente en CPU mediante un script `predict.py` que consume un fichero Parquet con identificadores y devuelve predicciones en escala log10. La variante v19 (documentada internamente como v4 del "public-value lookup layer") incorpora capas de búsqueda de valores publicados en bases de datos como BRENDA 2026.1, CatPred-DB, DLKcat y EnzyExtractDB, además de mecanismos de "leak guard" para evitar filtrar etiquetas públicas en la ruta de predicción.

Es relevante ahora porque la predicción computacional de parámetros cinéticos es un cuello de botella en biología sintética, ingeniería metabólica y diseño de enzimas. El autor declara explícitamente que esta variante "no es para envío" a competición, sino una herramienta para medir cuánto infla la puntuación la filtración de datos públicos, lo que la convierte en un artefacto de investigación más que en un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (L2, L1), CatBoost, redes de fusión, red de atención regional, clasificador de bins, miembros de lookup de embeddings proteicos; embeddings ESM2-35M, ProtT5-XL-U50, ESM-C 600M, MoLFormer-XL, Morgan, RDKit |
| Parámetros totales | no disponible (ensemble de varios modelos; tamaño del repo 0,9 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo predictivo, no generativo); usa los primeros 510 residuos de la proteína |
| Tipos de cuantización | no disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ejecución vía ONNX Runtime) y NumPy para las redes neuronales |

## Arquitectura y entrenamiento

El modelo es un ensemble heterogéneo. Para kcat se combina un comité con LightGBM (pérdidas L2 y L1), CatBoost, dos redes de fusión y una red de atención regional que operan sobre embeddings de proteína ESM2-35M (primeros 510 residuos, media más 32 regiones) y sobre características de sustrato derivadas de MoLFormer-XL, Morgan y RDKit. Los miembros se promedian en el espacio de etiquetas. Para Km se reutiliza la misma pasada de ESM2 y MoLFormer, con un LightGBM específico de sustrato y un modelo de reserva sobre características manuales. En la versión v14 se añadieron miembros que consultan embeddings de proteínas mayores (ProtT5-XL-U50 desde UniProt y ESM-C 600M desde Protein Dimension DB 2.0) por coincidencia exacta de secuencia en tablas de Swiss-Prot, reducidos a 256 dimensiones PCA, con un pequeño predictor para enzimas ausentes de Swiss-Prot entrenado sobre ~385.000 proteínas. También se incorporó un ajuste intra-enzima que atrae las predicciones hacia la media de cada enzima (kcat ×0,5, Km ×0,7) y suma un 0,2 de la desviación centrada de un LightGBM intra-enzima.

Los datos de entrenamiento incluyen el split de competición, filas públicas de CatPred-DB (Boorla & Maranas 2025, CC BY 4.0) y DLKcat (Li et al. 2022) a medio peso, y filas de tipo salvaje de EnzyExtractDB (Wei et al. 2025) a un cuarto de peso. Se eliminaron las filas públicas cuyas enzimas fueran de validación o compartieran clúster de 5-meros (coseno > 0,08). La capa de lookup público (v2/v4) acepta coincidencias exactas de (secuencia, InChIKey) y, en su defecto, coincidencias por esqueleto de InChIKey (estereoquímica y protonación), con Spearman de 0,80 en kcat y 0,93 en Km sobre filas de entrenamiento. El "leak guard" enruta las enzimas relacionadas con datos públicos a un comité entrenado solo con datos de competición (weights/refc_safe).

## Capacidades

- Predicción de log10_kcat y log10_km para pares enzima-sustrato a partir de secuencia proteica e identificador de sustrato (InChIKey).
- Procesamiento por lotes mediante fichero Parquet de entrada y CSV de salida.
- Ejecución exclusiva en CPU (aproximadamente 4 minutos en 2 CPUs según el autor).
- Integración de embeddings de proteínas de varios modelos (ESM2-35M, ProtT5-XL-U50, ESM-C 600M) y de sustratos (MoLFormer-XL, Morgan, RDKit).
- Capa de lookup de valores publicados en BRENDA 2026.1, CatPred-DB, DLKcat y EnzyExtractDB.
- Mecanismo de leak guard para enrutar enzimas relacionadas con datos públicos a un comité entrenado solo con datos de competición.
- Ajuste intra-enzima para ordenar sustratos de una misma enzima.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Priorización de enzimas en ingeniería metabólica: dado un conjunto de candidatos enzima-sustrato, el modelo estima kcat y Km para descartar combinaciones con baja actividad catalítica antes de ensayos húmedos, reduciendo el espacio experimental.
- Anotación de genomas y metagenomas: para enzimas recién identificadas sin caracterización experimental, el modelo proporciona una estimación inicial de parámetros cinéticos que orienta la selección de dianas.
- Análisis de sensibilidad en modelos cinéticos a escala de red: los valores predichos pueden alimentar modelos metabólicos (por ejemplo, FBA con restricciones enzimáticas) cuando faltan parámetros medidos.
- Detección de inconsistencias en bases de datos: la capa de lookup y el comité permiten comparar valores publicados con predicciones y señalar entradas anómalas (el autor menciona el deslizamiento de unidades ×3600 en algunas entradas de SABIO-RK para kcat).
- Estudio de filtración de datos en benchmarks de cinética: la variante está diseñada explícitamente para medir cuánto infla la puntuación el uso de datos públicos filtrados, útil para auditar metodologías de competición.
- Filtrado previo en pipelines de diseño de enzimas: integrado como paso de cribado computacional antes de simulaciones de dinámica molecular o docking, gracias a su ejecución en CPU y bajo coste computacional.
- Docencia e investigación en bioinformática: al ser un paquete ONNX autocontenido con licencia CC BY 4.0, puede usarse en cursos y reproducir experimentos sobre representaciones proteicas y de sustrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta métricas internas de validación cruzada por folds de clúster (por ejemplo, mejoras de +0,017/+0,007 en kcat y +0,015/+0,004 en Km para el comité de leak guard en v15, y +0,013/+0,018 en kcat y +0,005/+0,007 en Km para las mejoras de lookup en v4), pero no se proporcionan valores absolutos de MMLU, HumanEval, GSM8K ni métricas estándar comparables, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; el autor indica aproximadamente 4 minutos en 2 CPUs para un lote de entrada.
- VRAM estimada: no aplica (no requiere GPU).
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- Cabe en cualquier equipo consumer: el paquete ONNX ocupa 0,9 GB y el modelo no necesita GPU dedicada.
- Opciones de despliegue: script `predict.py` con ONNX Runtime y NumPy; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: aproximadamente 4 minutos en 2 CPUs según el autor; no se proporcionan más cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v19 (raghava137) | Ensemble ML + embeddings | no disponible (repo 0,9 GB) | no aplica | CC BY 4.0 | Hugging Face |
| CatPred-DB (Boorla & Maranas 2025) | Base de datos de cinética | no aplica | no aplica | CC BY 4.0 | Fuente citada por el autor |
| DLKcat (Li et al. 2022) | Predictor de kcat con GNN | no disponible | no disponible | no disponible | Fuente citada por el autor |
| EnzyExtractDB (Wei et al. 2025) | Base de datos minada de literatura | no aplica | no aplica | no disponible | Fuente citada por el autor |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explícitamente que la variante "no es para envío" a competición: está entrenada con datos públicos que incluyen filas de enzimas de validación y sus parientes (aproximadamente el 63% de las filas de validación tienen coincidencia pública exacta), lo que infla artificialmente la puntuación.
- No dispone de filtro de filtración ni de leak guard en la ruta de datos públicos; el leak guard solo protege la ruta de predicción de enzimas relacionadas, no corrige el sesgo de entrenamiento.
- Riesgo de alucinación en sentido figurado: al ser un modelo predictivo, puede producir estimaciones plausibles pero incorrectas para enzimas o sustratos alejados de la distribución de entrenamiento.
- La cobertura de la capa de lookup depende de las bases de datos citadas (BRENDA 2026.1, CatPred-DB, DLKcat, EnzyExtractDB); pares no presentes recaen en el comité completo.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- Idiomas soportados no disponibles (no aplica).
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero el autor no garantiza idoneidad para producción y recomienda precaución por el sesgo de filtración.
- El ajuste intra-enzima y la capa de lookup se validaron en folds de retención de la competición, no en datos externos independientes.
- No se documentan sesgos demográficos ni de otro tipo; el riesgo principal es de validez científica por filtración de datos.

## Enlaces

- Hugging Face: https://huggingface.co/raghava137/kcat-km-v19
- CatPred-DB (Boorla & Maranas 2025): no disponible (citado en la model card sin URL)
- DLKcat (Li et al. 2022): no disponible (citado en la model card sin URL)
- EnzyExtractDB (Wei et al. 2025): no disponible (citado en la model card sin URL)
- BRENDA 2026.1: no disponible (citado en la model card sin URL)
- Protein Dimension DB 2.0 (pitagoras-alves): no disponible (citado en la model card sin URL)
- UniProt (ProtT5-XL-U50): no disponible (citado en la model card sin URL)
