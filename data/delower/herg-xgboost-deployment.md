# Delower/herg-xgboost-deployment

## Resumen

hERG XGBoost — deployment refits es un artefacto de inferencia publicado en Hugging Face por el usuario Delower. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un conjunto de cuatro bundles de XGBoost (dos tareas × dos protocolos de partición) entrenados para predecir bloqueo del canal de potasio hERG a partir de la estructura química de un compuesto, expresada como SMILES. El repositorio está orientado a despliegue en cribado farmacológico de producción, no a investigación metodológica.

La particularidad de esta publicación es que los modelos se han reentrenado ("refit") sobre todo el corpus etiquetado disponible, incluyendo conjuntos regulatorios y externos que en el benchmark original estaban reservados como test. El autor lo declara explícitamente y advierte de que las métricas obtenidas sobre esos conjuntos absorbidos son in-sample por construcción y no sirven como validación. Los benchmarks honestos de las mismas arquitecturas, con los conjuntos externos bloqueados, residen en un repositorio separado (Delower/herg-xgboost).

El interés práctico es doble: por un lado, ofrece un clasificador binario (bloqueador/no bloqueador con umbral de 10 µM) y un regresor de pIC50 listos para uso con un script de inferencia autónomo; por otro, ilustra un patrón habitual pero delicado en la publicación de modelos de quimioinformática, donde el artefacto de producción y el artefacto de evaluación se separan en repositorios distintos. El repositorio ocupa 0,0 GB según los metadatos, no tiene descargas ni likes, y la model card no proporciona información sobre licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (XGBoost, método `hist`) |
| Parámetros totales | no disponible (no aplicable a modelos de árboles; el número de hojas y nodos depende del ajuste) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entrada = vector de características extraídas de SMILES) |
| Tipos de cuantización | no aplicable (no se publican pesos en formato de red neuronal) |
| Idiomas soportados | no disponible (la entrada es SMILES, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | bundles de XGBoost dentro de `models/` (formato binario propio de XGBoost); scripts Python auxiliares |

Hiperparámetros declarados (idénticos a los finalistas del benchmark con pool bloqueado): `n_estimators` 900, `learning_rate` 0,03, `max_depth` 8, `subsample` 0,8, `colsample_bytree` 0,8, `tree_method` `hist`, semilla 42. Umbral de clasificación: bloqueador si pIC50 ≥ 5,0 (es decir, 10 µM); decisión binaria con probabilidad ≥ 0,5.

## Arquitectura y entrenamiento

El modelo es un ensemble de árboles de decisión potenciados por gradiente (XGBoost) sobre características moleculares extraídas mediante el bloque de características de la "Phase-5" del benchmark original, implementado en `feature_extraction.py`. No hay transformer, ni atención, ni embeddings aprendidos de extremo a extremo: la representación de entrada es un vector de descriptores calculado de forma determinista a partir del SMILES.

Los datos de entrenamiento son el corpus etiquetado completo: 14.441 compuestos para la tarea de clasificación (`cls_alldata.csv`) y 10.370 para la de regresión (`reg_alldata.csv`). El refit absorbe los conjuntos regulatorios y externos: hERG-70, new-compounds 967, panel FDA de 36 compuestos y REGFAIL. El autor indica que verificó por conectividad InChIKey que cada compuesto externo o regulatorio estuviera realmente presente en los ficheros de entrenamiento antes de entrenar, y que los recuentos figuran en `validation_results.json`. Se publican cuatro bundles (clasificación/regresión × partición scaffold/random), pero el autor señala que, al entrenar con todos los datos, la distinción entre protocolos desaparece y ambos envuelven el mismo booster ajustado; el resultado principal ("headline") es el de scaffold.

No se documenta en la model card el uso de validación cruzada, calibración de probabilidades, búsqueda de hiperparámetros adicional ni técnicas de regularización más allá de los parámetros indicados.

## Capacidades

- Predicción binaria de bloqueo del canal hERG a partir de un SMILES, con umbral operativo de 10 µM (pIC50 ≥ 5,0) y corte de decisión en probabilidad 0,5.
- Predicción de regresión de pIC50 (potencia de bloqueo) para el mismo compuesto.
- Inferencia autónoma mediante `predict_herg.py`, que acepta SMILES y devuelve probabilidad de bloqueador o pIC50.
- Extracción de características reproducible mediante `feature_extraction.py`, correspondiente al bloque exacto de la Phase-5.
- Generación de predicciones de demostración sobre compuestos del panel FDA (`regulatory_inference_sample.csv`), etiquetadas explícitamente como in-sample.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Cribado virtual temprano de cardiotoxicidad: dado un lote de SMILES candidatos, `predict_herg.py` devuelve probabilidad de bloqueo hERG y permite descartar compuestos con riesgo alto antes de ensayos in vitro, reduciendo coste experimental.
- Priorización de compuestos en química médica: el regresor de pIC50 ordena los candidatos por potencia de bloqueo estimada, lo que permite seleccionar series con margen terapéutico amplio frente al canal hERG.
- Filtro de alertas estructurales en pipelines de generación molecular: integrado como paso de post-procesado, descarta moléculas generadas que superen el umbral de 10 µM.
- Análisis de series químicas internas: al estar reentrenado sobre todo el corpus etiquetado, incluidos conjuntos regulatorios, es adecuado para puntuar compuestos de dominios químicos cercanos a los datos regulatorios absorbidos, siempre que no se use para estimar rendimiento.
- Reproducción de un flujo de inferencia completo: los scripts `feature_extraction.py` y `predict_herg.py` permiten reconstruir la cadena SMILES → características → predicción en un entorno propio.
- Referencia de despliegue en producción frente al benchmark: sirve para comparar el comportamiento del artefacto de producción con el del repositorio de benchmark (Delower/herg-xgboost), que conserva la separación de conjuntos externos.
- Auditoría de fugas de datos: el par de repositorios (refit vs. benchmark) permite estudiar el efecto de absorber conjuntos regulatorios en las métricas reportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas (AUC, precisión, recall, RMSE, R²) ni tablas comparativas; remite a `validation_results.json` para los recuentos de verificación de compuestos y al repositorio Delower/herg-xgboost para los benchmarks externos honestos de las mismas arquitecturas. Cualquier cifra de rendimiento sobre los conjuntos absorbidos (hERG-70, new-compounds 967, panel FDA, REGFAIL) sería in-sample por construcción y no debe presentarse como benchmark.

## Requisitos de hardware

- Inferencia en CPU: XGBoost con 900 árboles y profundidad 8 es ligero; no requiere GPU. Un único núcleo moderno basta para puntuar lotes moderados de compuestos.
- VRAM estimada: no aplicable en el caso habitual (CPU). Si se fuerza GPU, el modelo cabe holgadamente en cualquier GPU con unos pocos GB de memoria, incluidas GTX 1650 o RTX 3050.
- GPU recomendadas: no necesarias; opcionalmente cualquier GPU compatible con XGBoost (por ejemplo, A100, H100, RTX 4090) para lotes muy grandes, sin que se documenten ganancias de throughput.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, aunque el despliegue natural es CPU.
- Opciones de despliegue: scripts Python del propio repositorio (`predict_herg.py`), la API nativa de XGBoost, o servir el booster desde un microservicio (FastAPI, Flask) o un job por lotes.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de características, del tamaño del lote y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Delower/herg-xgboost-deployment | XGBoost refit sobre todo el corpus | 14.441 (clasificación) / 10.370 (regresión) compuestos, con conjuntos regulatorios absorbidos | Vector de características de SMILES | no disponible | Hugging Face, 0 descargas |
| Delower/herg-xgboost | XGBoost con conjuntos externos bloqueados | Corpus con hERG-70, new-compounds 967, panel FDA y REGFAIL excluidos del entrenamiento | Vector de características de SMILES | no disponible | Hugging Face (referenciado en la model card) |
| Otros predictores hERG públicos (p. ej. basados en GNN o fingerprints + RF) | Variable | Variable | SMILES o fingerprints | Variable | no disponible en la información proporcionada |

La comparación relevante es interna al propio autor: el repositorio de deployment y el de benchmark comparten arquitectura e hiperparámetros, y solo difieren en la inclusión de los conjuntos externos en el entrenamiento. No se dispone de datos para comparar con alternativas de terceros.

## Limitaciones y advertencias

- Los conjuntos regulatorios y externos (hERG-70, new-compounds 967, panel FDA 36, REGFAIL) están incluidos en el entrenamiento: cualquier métrica calculada sobre ellos es in-sample y sobreestima el rendimiento real. No validar sobre esos conjuntos.
- El autor advierte explícitamente de que no se validen estos modelos en los conjuntos absorbidos; los benchmarks honestos están en Delower/herg-xgboost.
- Licencia no especificada: no hay garantía de uso comercial; debe contactarse con el autor antes de integrarlo en un producto.
- Sin información sobre sesgos del corpus: no se documenta la distribución química de los datos, el balance de clases ni la cobertura de dominios químicos, lo que limita la estimación de generalización fuera de la distribución de entrenamiento.
- Riesgo de falsos negativos y positivos en química novedosa: al ser un modelo de árboles sobre descriptores fijos, su capacidad de extrapolación a scaffolds no representados es limitada.
- Umbral fijado a 10 µM (pIC50 ≥ 5,0) y corte de probabilidad 0,5: no se documenta calibración de probabilidades, por lo que la probabilidad no debe interpretarse como riesgo absoluto sin recalibración.
- Modelo de una sola diana (hERG): no predice toxicidad global ni interacciones con otros canales; su uso aislado puede dar una visión incompleta de la seguridad cardíaca.
- Repositorio sin descargas ni likes y con tamaño declarado de 0,0 GB: conviene verificar la integridad de los ficheros antes de desplegarlo.
- No es un modelo de lenguaje: no admite prompts en texto natural, tool calling ni razonamiento; cualquier uso fuera de la predicción sobre SMILES es inadecuado.

## Enlaces

- Repositorio de deployment: https://huggingface.co/Delower/herg-xgboost-deployment
- Repositorio de benchmark con conjuntos externos bloqueados (referenciado en la model card): https://huggingface.co/Delower/herg-xgboost
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios de código adicionales.
