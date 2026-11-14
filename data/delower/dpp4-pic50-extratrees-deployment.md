# Delower/dpp4-pic50-extratrees-deployment

## Resumen

DPP-4 pIC50 ExtraTrees (deployment refit) es un modelo de regresión QSAR publicado por el usuario Delower en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de scikit-learn compuesto por un `ColumnTransformer` con imputación por media y estandarización sobre 1.030 características, seguido de un `ExtraTreesRegressor` de 100 árboles con `random_state=42`. Su objetivo es predecir el pIC50 (potencia inhibitoria en escala logarítmica) de compuestos frente a la enzima DPP-4, diana terapéutica de los fármacos gliptinas empleados en diabetes tipo 2.

La versión publicada es un reajuste de despliegue (deployment refit) del pipeline de referencia `Delower/dpp4-pic50-extra-trees`, entrenado ahora sobre el 100 % de los datos etiquetados: 10.096 filas, resultado de reunir las 10.085 filas curadas de DPP-4 y añadir 11 gliptinas regulatorias de la FDA con sus valores experimentales de pIC50. Las características son un fingerprint de Morgan de radio 2 con 1.024 bits más seis descriptores fisicoquímicos (MolWt, MolLogP, TPSA, NumHDonors, NumHAcceptors, NumRotatableBonds).

Es relevante ahora porque documenta un patrón habitual en proyectos de descubrimiento de fármacos: separar una versión de benchmark evaluable de una versión de despliegue reentrenada con todos los datos, advirtiendo explícitamente de que las métricas del benchmark no son aplicables a esta última. El repositorio ocupa 0,1 GB e incluye el pipeline serializado, scripts de inferencia y artefactos de verificación de integridad de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline sklearn: ColumnTransformer (SimpleImputer media + StandardScaler) + ExtraTreesRegressor (100 árboles) |
| Parametros totales | no disponible (no aplica; modelo basado en árboles, no en pesos neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (entrada tabular de 1.030 características por molécula) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.pkl` (pickle de scikit-learn, 54,7 MB) |

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de árboles extremadamente aleatorizados (`ExtraTreesRegressor`) con 100 estimadores y `random_state=42`, alimentado por un `ColumnTransformer` que aplica imputación por media y estandarización a las 1.030 columnas de entrada (`feature_0` a `feature_1029`). Las características se generan a partir de la estructura molecular: un fingerprint de Morgan de radio 2 con 1.024 bits más seis descriptores fisicoquímicos calculados con RDKit (peso molecular, MolLogP, TPSA, donantes y aceptores de enlaces de hidrógeno y enlaces rotables). No hay entrenamiento neuronal, RLHF ni ajuste por preferencias; el ajuste es puramente supervisado sobre pares molécula–pIC50.

El reajuste se realizó con idénticas características e hiperparámetros que la versión de benchmark, pero sobre 10.096 filas: las 10.085 filas curadas de DPP-4 (`combined_curated_smiles.csv`, todas las particiones reunidas) más 11 gliptinas regulatorias de la FDA con sus valores de pIC50 experimentales (linagliptina 9,85; teneligliptina 9,40; evogliptina 9,18; trelagliptina 8,89; saxagliptina 8,82; omarigliptina 8,80; anagliptina 8,42; alogliptina 8,12; gemigliptina 7,80; sitagliptina 7,74; vildagliptina 7,47). Gosogliptina se excluyó por carecer de IC50/pIC50 experimental en la tabla maestra regulatoria. Antes del reajuste se verificó la fidelidad de la receta: un clon del pipeline de benchmark ajustado sobre su propia partición de entrenamiento (8.068 filas) reprodujo exactamente el RMSE de test publicado de 0,444906 (diferencia 0,00e+00). El recuento de muestras en la raíz de los árboles ajustados es 10.096, coincidente con el fichero de entrenamiento, y la verificación por InChIKey completo confirmó 11/11 compuestos regulatorios presentes y 0 ausentes.

## Capacidades

- Predicción de pIC50 frente a DPP-4 a partir de la estructura molecular (SMILES), mediante featurización con fingerprint de Morgan y descriptores fisicoquímicos.
- Regresión supervisada sobre datos tabulares de 1.030 dimensiones; no genera texto, código ni razonamiento simbólico.
- Inferencia por lotes mediante el script `infer.py`, que incluye un shim de deserialización (`_RemainderColsList`) para versiones recientes de scikit-learn.
- Verificación de integridad de datos de entrenamiento mediante artefactos (`training_manifest.csv`, `gate_verification.json`) con identificadores InChIKey.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Filtrado virtual de quimiotecas: aplicar el pipeline sobre grandes colecciones de SMILES para priorizar compuestos con pIC50 predicho alto frente a DPP-4 antes de ensayos in vitro, reduciendo el coste de cribado experimental.
- Priorización en programas de diabetes tipo 2: usar las predicciones como señal preliminar para seleccionar candidatos análogos a gliptinas conocidas y decidir qué series químicas merecen síntesis.
- Análisis de relación estructura-actividad (SAR): comparar predicciones entre variantes estructurales de un mismo esqueleto para identificar fragmentos que incrementan la potencia predicha.
- Reproducibilidad y auditoría de modelos QSAR: el repositorio incluye manifiesto de entrenamiento y verificación por InChIKey, lo que permite auditar qué compuestos exactos se usaron y reproducir el ajuste.
- Línea base en proyectos de modelado molecular: servir como referencia clásica (árboles + fingerprints) frente a la que comparar modelos de grafos neuronales o transformers químicos.
- Docencia y prototipado rápido: el pipeline es ligero (54,7 MB), se ejecuta en CPU y permite demostrar un flujo completo de featurización, entrenamiento y predicción sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks aplicables a esta versión. La model card indica explícitamente que las métricas de benchmark no aplican al refit de despliegue y que este no ha sido ni debe ser evaluado sobre los conjuntos absorbidos. El único dato numérico disponible es el RMSE de test de la versión de benchmark (`Delower/dpp4-pic50-extra-trees`) sobre su propia partición: 0,444906, reproducido exactamente en la verificación de receta, pero no atribuible a este modelo.

| Metrica | Version benchmark | Esta version (refit) |
|---|---|---|
| RMSE test (particion propia) | 0,444906 | no aplica (no evaluado por diseño) |
| Filas de entrenamiento | 8.068 | 10.096 |
| Evaluacion sobre conjunto regulatorio | no realizada | no realizada (prohibida por diseño) |

## Requisitos de hardware

- Inferencia en CPU: el pipeline ocupa 54,7 MB y no requiere GPU; cualquier máquina con Python y scikit-learn puede ejecutarlo.
- VRAM estimada: 0 GB (no usa aceleración por GPU de forma nativa).
- GPU recomendadas: no aplica; no hay soporte CUDA en el pipeline serializado.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos sin GPU.
- Opciones de despliegue: script `infer.py` del repositorio, serialización pickle con scikit-learn, o envoltorio propio (FastAPI, Flask) para servicio HTTP.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un ensamblado de 100 árboles sobre 1.030 características, la inferencia es de milisegundos por molécula en CPU, pero no se aporta medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delower/dpp4-pic50-extratrees-deployment | ExtraTrees + fingerprints | no aplica (100 árboles) | no aplica | MIT | Hugging Face |
| Delower/dpp4-pic50-extra-trees | ExtraTrees + fingerprints (benchmark) | no aplica (100 árboles) | no aplica | no disponible | Hugging Face |
| Modelos QSAR neuronales (GNN, Chemprop) | Redes de grafos | variable | no aplica | variable | Depende del proyecto |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Las métricas de benchmark no son aplicables a esta versión: fue reajustada sobre el 100 % de los datos y no ha sido evaluada sobre los conjuntos absorbidos; usarla como si rindiera como el benchmark es un error metodológico.
- Riesgo de fuga de información (data leakage) en cualquier evaluación externa que incluya compuestos del conjunto de entrenamiento, ya que el modelo ha visto todas las filas etiquetadas.
- Los 11 compuestos regulatorios ya estaban presentes en el conjunto curado por conectividad (9 de 11 por InChIKey completo), con valores de ensayo distintos; la absorción añade filas con valores wet-lab, no compuestos nuevos, lo que puede introducir duplicados con etiquetas inconsistentes.
- Dominio de aplicación restringido a inhibidores de DPP-4 y al espacio químico cubierto por los datos curados; las predicciones fuera de ese dominio no están validadas.
- Modelo de regresión tabular: no procesa texto, no razona y no debe presentarse como un modelo de lenguaje ni integrarse en pipelines conversacionales.
- Sesgos potenciales derivados de la composición del dataset (fuentes ChEMBL/parquet, predominio de gliptinas conocidas) y de los valores de ensayo heterogéneos entre fuentes.
- Licencia MIT: permite uso comercial y modificación, pero no exime de validar experimentalmente las predicciones antes de cualquier aplicación terapéutica.
- No apto para producción clínica ni para decisiones regulatorias sin validación prospectiva independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Delower/dpp4-pic50-extratrees-deployment
- Versión de benchmark: https://huggingface.co/Delower/dpp4-pic50-extra-trees
- Repositorio de scikit-learn (dependencia): https://scikit-learn.org
- RDKit (featurización de fingerprints y descriptores): https://www.rdkit.org
