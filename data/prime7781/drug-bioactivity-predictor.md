# prime7781/drug-bioactivity-predictor

## Resumen

El modelo `prime7781/drug-bioactivity-predictor` es un clasificador de aprendizaje automático diseñado para predecir si un compuesto químico representado como SMILES será activo o inactivo frente al receptor EGFR (Epidermal Growth Factor Receptor), un objetivo terapéutico relevante en oncología. Lo desarrolla el usuario prime7781 y se distribuye bajo licencia MIT. El modelo combina descriptores moleculares de RDKit y huellas dactilares de Morgan (Morgan fingerprints) como características de entrada, y utiliza un clasificador Random Forest de scikit-learn para la clasificación binaria.

El problema que resuelve es la priorización de compuestos en etapas tempranas del descubrimiento de fármacos: dado un SMILES, el modelo asigna una probabilidad de actividad (IC50 ≤ 1000 nM) frente a EGFR, lo que permite filtrar librerías químicas antes de realizar ensayos experimentales costosos. El modelo se entrenó con un conjunto curado de 13 577 compuestos procedentes de ChEMBL (target CHEMBL203), con un umbral de actividad de 1000 nM. No es un modelo de lenguaje ni una red neuronal profunda; es un modelo tabular clásico, ligero y fácil de desplegar en entornos de producción con recursos mínimos.

La relevancia actual radica en que ofrece una alternativa reproducible y de código abierto para la predicción de bioactividad, con métricas sólidas (ROC-AUC de 0,9512 en división aleatoria y 0,9118 en división por scaffolds), y está empaquetado como un archivo `joblib` listo para usar. Su tamaño es despreciable (el repositorio ocupa 0,0 GB), lo que lo hace adecuado para integración en pipelines de quimioinformática sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Classifier (scikit-learn) |
| Parametros totales | no disponible (ensemble de arboles de decision, sin parametros neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: cadena SMILES, no texto libre) |
| Tipos de cuantizacion | no aplica (modelo clasico, sin cuantizacion de pesos) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; solo SMILES) |
| Licencia | MIT |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un Random Forest Classifier implementado con scikit-learn. Cada molécula de entrada se convierte mediante RDKit en un vector de características de 2056 dimensiones: 8 descriptores moleculares (peso molecular, LogP, donadores de enlaces de hidrógeno, aceptores de enlaces de hidrógeno, enlaces rotables, área de superficie polar topológica, número de anillos y número de átomos pesados) más 2048 bits de huella dactilar de Morgan (radio 2). El clasificador binario distingue entre compuestos activos (IC50 ≤ 1000 nM) e inactivos (IC50 > 1000 nM) frente a EGFR.

El conjunto de datos final contiene 13 577 compuestos, con una distribución de clases desequilibrada: 9142 activos (67,33 %) y 4435 inactivos (32,67 %). El pipeline de curado incluye eliminación de mediciones inválidas, filtrado de IC50, normalización de unidades, manejo de valores faltantes, validación de SMILES, eliminación de duplicados y agregación a nivel de compuesto. Se evaluaron tres modelos (regresión logística, Random Forest y XGBoost) y se seleccionó Random Forest por su mayor ROC-AUC. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de bioactividad: predice si un compuesto es activo o inactivo frente a EGFR a partir de su SMILES.
- Generación de probabilidad de actividad: devuelve una probabilidad estimada para la clase predicha (por ejemplo, 0,874 para un compuesto activo).
- Procesamiento de descriptores moleculares: utiliza 8 descriptores fisicoquímicos de RDKit.
- Generación de huellas dactilares de Morgan: 2048 bits con radio 2, capturando entornos circulares de los átomos.
- Validación con división por scaffolds: evalúa la generalización a estructuras químicamente distintas mediante división Bemis-Murcko.
- Integración sencilla en Python: se puede cargar con `joblib` y usar con un wrapper de predicción.
- No soporta tool calling, agentes, visión ni audio; es un modelo puramente tabular.

## Casos de uso

- Priorización de compuestos en screening virtual: dado un conjunto de SMILES de una librería química, el modelo puede filtrar los compuestos con mayor probabilidad de actividad frente a EGFR, reduciendo el número de candidatos para ensayos experimentales.
- Filtrado de resultados de docking molecular: tras un docking virtual, se pueden aplicar las predicciones del modelo para seleccionar las moléculas con mayor probabilidad de bioactividad antes de comprarlas o sintetizarlas.
- Optimización de cabezas de serie (hit-to-lead): los químicos medicinales pueden usar el modelo para evaluar rápidamente análogos de un compuesto líder y priorizar modificaciones estructurales que mantengan o mejoren la actividad predicha.
- Enriquecimiento de bases de datos químicas: el modelo puede anotar bases de datos internas de compuestos con una etiqueta de actividad predicha, facilitando búsquedas y análisis retrospectivos.
- Educación e investigación en quimioinformática: sirve como ejemplo reproducible de un pipeline completo de predicción de bioactividad, desde la curación de datos hasta la validación por scaffolds, útil para cursos y proyectos académicos.
- Integración en pipelines de descubrimiento de fármacos: al ser un archivo `joblib` ligero, puede integrarse en flujos de trabajo de automatización (por ejemplo, con Streamlit para una interfaz web) sin requisitos de hardware especiales.

## Benchmarks y rendimiento

El modelo se evaluó con dos estrategias de división de datos. La siguiente tabla resume los resultados reportados en la model card:

| Metrica | Random split | Scaffold split |
|---|---:|---:|
| Accuracy | 0,8921 | 0,8401 |
| Precision | 0,9364 | 0,8760 |
| Recall | 0,9010 | 0,8884 |
| F1 | 0,9184 | 0,8822 |
| ROC-AUC | 0,9512 | 0,9118 |
| PR-AUC | 0,9743 | 0,9551 |

Además, se realizó una validación cruzada de cinco pliegues con división aleatoria, obteniendo una media de ROC-AUC de 0,9478 con desviación estándar de 0,0054. La brecha de generalización entre la división aleatoria y la de scaffolds es de 0,0394 en ROC-AUC, lo que indica una ligera pérdida de rendimiento ante estructuras químicas novedosas. También se comparó con regresión logística y XGBoost en la división aleatoria:

| Modelo | Accuracy | Precision | Recall | F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|---:|
| Logistic Regression | 0,8384 | 0,8913 | 0,8655 | 0,8782 | 0,8776 | 0,9193 |
| Random Forest | 0,8921 | 0,9364 | 0,9010 | 0,9184 | 0,9512 | 0,9743 |
| XGBoost | 0,8840 | 0,9079 | 0,9213 | 0,9145 | 0,9410 | 0,9690 |

## Requisitos de hardware

- El modelo es extremadamente ligero: el repositorio ocupa 0,0 GB y el archivo `bioactivity_model.joblib` es un ensemble de árboles de decisión de scikit-learn, típicamente de pocos megabytes.
- Inferencia en CPU: no requiere GPU. Cualquier procesador moderno puede ejecutar predicciones en milisegundos por compuesto.
- Memoria RAM: menos de 1 GB es suficiente para cargar el modelo y procesar lotes de SMILES.
- GPU recomendada: ninguna. El modelo no se beneficia de aceleración por GPU.
- Opciones de despliegue: se puede integrar en cualquier entorno Python con scikit-learn y RDKit. Para servicios web, se puede envolver con FastAPI o Flask, o usar Streamlit para una interfaz interactiva. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones formales, pero dado el tamaño del modelo, se espera una latencia inferior a 10 ms por predicción en CPU moderna y un throughput de cientos de predicciones por segundo.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos de predicción de bioactividad contra EGFR con las mismas características y métricas comparables. Sin embargo, la model card incluye una comparación interna con dos alternativas de la misma categoría (modelos de clasificación tabular sobre los mismos datos):

| Modelo | ROC-AUC | Precision | Recall | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Random Forest (este modelo) | 0,9512 | 0,9364 | 0,9010 | MIT | HuggingFace (joblib) |
| Logistic Regression | 0,8776 | 0,8913 | 0,8655 | MIT | no publicada |
| XGBoost | 0,9410 | 0,9079 | 0,9213 | MIT | no publicada |

No se han encontrado modelos comparables de otros autores en la información disponible.

## Limitaciones y advertencias

- Uso exclusivo para investigación: la model card indica explícitamente que el modelo no es una herramienta de diagnóstico clínico y no debe usarse para decisiones médicas, terapéuticas, regulatorias o de cuidado de pacientes.
- Sesgo de clase: el conjunto de datos está desequilibrado (67,33 % activos), lo que puede inflar la precisión y el recall para la clase mayoritaria y afectar la calibración de probabilidades.
- Umbral de actividad arbitrario: la definición de activo (IC50 ≤ 1000 nM) es una regla de clasificación del proyecto, no una definición biológica universal. Compuestos con IC50 cercano al umbral pueden clasificarse incorrectamente.
- Generalización limitada a scaffolds novedosos: la división por scaffolds muestra una caída de ROC-AUC de 0,9512 a 0,9118, lo que indica que el modelo puede tener un rendimiento inferior ante compuestos con estructuras químicas muy diferentes a las del entrenamiento.
- Dependencia de RDKit: la generación de características requiere RDKit instalado y versiones compatibles; cambios en la versión de RDKit pueden alterar los descriptores y las huellas dactilares.
- Sin soporte para otros objetivos: el modelo está entrenado exclusivamente para EGFR; no es transferible a otros targets sin reentrenamiento.
- Sin datos de incertidumbre calibrada: aunque se proporciona una probabilidad, no se ha validado la calibración de las probabilidades frente a la frecuencia observada de actividad.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prime7781/drug-bioactivity-predictor
- Repositorio de referencia (no oficial, proyecto similar): https://github.com/Axiomaa/bioactivity-prediction
- No se han encontrado papers, blogs o demos adicionales específicos de este modelo en la información disponible.
