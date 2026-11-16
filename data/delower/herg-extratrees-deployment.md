# Delower/herg-extratrees-deployment

## Resumen

hERG ExtraTrees (comprehensive features) — Deployment refits es un modelo de machine learning clásico, no una red neuronal, orientado a la predicción de bloqueo del canal hERG (human Ether-à-go-go-Related Gene) a partir de la estructura química de compuestos. Lo desarrolla el usuario Delower y se publica como un repositorio de despliegue con artefactos ya reentrenados sobre el corpus completo de datos etiquetados, incluyendo los conjuntos regulatorios y externos. El objetivo es el cribado temprano de cardiotoxicidad en descubrimiento de fármacos, un filtro crítico porque el bloqueo de hERG es una causa habitual de retirada de candidatos por riesgo de prolongación del intervalo QT.

El modelo se apoya en un ensamblado ExtraTrees (300 árboles, semilla 42) sobre bloques de características químicas: Morgan, MACCS, descriptores, physchem-extra, hERG y farmacóforo, con 2.499 características tras el preprocesado para la tarea de clasificación. Se ofrecen dos tareas: clasificación (bloqueador si pIC50 >= 5,0, es decir, corte de 10 uM, con umbral de decisión 0,5) y regresión de pIC50. El repositorio ocupa 1,3 GB e incluye scripts de inferencia y extracción de características.

La relevancia de esta publicación es doble. Por un lado, el autor declara que esta variante es el mejor modelo único (no fusión) del benchmark Phase-5 con pool bloqueado. Por otro, el reentrenamiento sobre todos los datos absorbidos implica que las métricas sobre los conjuntos regulatorios incluidos son in-sample por construcción, y el autor lo advierte explícitamente: no deben usarse para validación externa. Las cifras honestas que reporta son ACC 0,760 y MCC 0,543 en hERG-70 para clasificación con refit scaffold, 4 errores en FDA y 4/5 en Tier-1 de REGFAIL, y RMSE 0,838 en hERG-70 para regresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de árboles ExtraTrees (300 árboles, semilla 42) sobre características químicas |
| Parametros totales | no disponible (modelo basado en árboles, no aplica recuento de parámetros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: SMILES o descriptores moleculares) |
| Tipos de cuantizacion | no aplica (modelo de árboles; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (bundles en `models/`; el repo incluye `predict_herg.py`, `feature_extraction.py`, `config.json`, `validation_results.json`) |

## Arquitectura y entrenamiento

El modelo es un ensamblado ExtraTrees con 300 árboles y semilla 42, el mismo recetario que los finales del pool bloqueado de la fase 5. La entrada no es texto sino representaciones moleculares: para clasificación se combinan bloques Morgan, MACCS, descriptores, physchem-extra, hERG y farmacóforo, resultando en 2.499 características tras el preprocesado; para regresión se combinan Morgan, descriptores, hERG y farmacóforo. La clasificación define bloqueador como pIC50 >= 5,0 (corte de 10 uM) y emite llamada positiva con probabilidad >= 0,5.

El entrenamiento de estos bundles de despliegue se realizó sobre todo el corpus etiquetado: 14.441 compuestos para clasificación (`cls_alldata.csv`) y 10.370 para regresión (`reg_alldata.csv`), incluyendo los conjuntos regulatorios y externos hERG-70, new-compounds 967, FDA panel 36 y REGFAIL. El autor aplica una compuerta dura: cada compuesto externo o regulatorio se verificó presente tanto en los ficheros de entrenamiento como en las matrices de entrenamiento ajustadas mediante conectividad InChIKey (hERG-70 462/462, new-compounds 967/967, FDA 36/36, REGFAIL 7/7, hERG-60 249/249, Test-1 43/43 en clasificación y 17/43 en regresión). Los cuatro bundles (clasificación/regresión x scaffold/random) envuelven el mismo modelo ajustado, ya que el protocolo de partición pierde sentido al entrenar con todos los datos; el resultado principal que se destaca es el de scaffold.

## Capacidades

- Predicción de bloqueo del canal hERG a partir de SMILES, devolviendo probabilidad de bloqueador (clasificación) o pIC50 (regresión).
- Clasificación binaria con corte operativo de 10 uM (bloqueador si pIC50 >= 5,0) y umbral de probabilidad 0,5.
- Regresión cuantitativa de pIC50 para priorizar compuestos por potencia de bloqueo.
- Extracción de características reproducible mediante `feature_extraction.py`, con los bloques exactos de la fase 5.
- Inferencia autónoma mediante `predict_herg.py` (SMILES -> probabilidad de bloqueador / pIC50).
- Integración en flujos de cribado junto a modelos hermanos del mismo autor (hERG XGBoost y hERG CardioGenAI) para triaje por consenso: un compuesto marcado por los tres se considera de máxima preocupación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Filtrado temprano de cardiotoxicidad en cribado virtual: se pasa cada compuesto candidato por `predict_herg.py` y se descartan o priorizan según la probabilidad de bloqueo, reduciendo el coste de ensayos experimentales de hERG.
- Triaje por consenso con modelos hermanos: combinar las salidas de este ExtraTrees con `Delower/herg-xgboost-deployment` y `Delower/herg-cardiogenai-deployment`; un compuesto marcado por los tres se trata como clase de máxima preocupación en el cribado de líderes de DPP-4.
- Priorización en química medicinal: usar la regresión de pIC50 para ordenar series de compuestos y decidir qué análogos sintetizar antes, en lugar de una señal binaria.
- Enriquecimiento de paneles regulatorios internos: aplicar el modelo a listas de compuestos propios y contrastar con los conjuntos FDA/REGFAIL para documentar decisiones de seguridad en informes internos.
- Reproducibilidad de pipelines: reutilizar `feature_extraction.py` para garantizar que las características de producción coinciden exactamente con las del entrenamiento, evitando desviaciones por preprocesado.
- Docencia y evaluación de métodos: servir como referencia de modelo único no fusión con métricas honestas publicadas (MCC 0,543 en hERG-70), útil para comparar frente a enfoques de deep learning en tareas de toxicidad.
- Despliegue ligero en entornos sin GPU: al ser un ensamblado de árboles, la inferencia no requiere aceleradores y puede ejecutarse en CPU dentro de contenedores de cribado por lotes.

## Benchmarks y rendimiento

El autor publica en `config.json` y `validation_results.json` las puntuaciones del benchmark honesto con pool bloqueado (`honest_locked_benchmark_scores`), es decir, con los conjuntos externos excluidos del entrenamiento:

| Tarea | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Clasificacion | hERG-70 (refit scaffold) | ACC | 0,760 |
| Clasificacion | hERG-70 (refit scaffold) | MCC | 0,543 (mejor modelo unico) |
| Clasificacion | FDA | Errores | 4 |
| Clasificacion | REGFAIL Tier-1 | Aciertos | 4/5 |
| Regresion | hERG-70 | RMSE | 0,838 |

No se han publicado en la informacion disponible resultados de benchmarks frente a modelos comparables (MMLU, HumanEval, GSM8K u otros), ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un ensamblado de árboles y no requiere GPU.
- GPU recomendadas: no necesarias; la inferencia puede ejecutarse en CPU.
- Cabe en cualquier equipo convencional: el repositorio ocupa 1,3 GB, pero los bundles de modelo son una fracción de ese tamaño y se cargan en memoria RAM.
- Opciones de despliegue: ejecución directa con `predict_herg.py` y las dependencias de Python del autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de árboles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hERG ExtraTrees (comprehensive features) — Deployment refits | ExtraTrees, 300 arboles | no aplica | no aplica | MCC 0,543 en hERG-70 (clasificacion); RMSE 0,838 (regresion) | no disponible | Hugging Face (Delower) |
| Delower/herg-xgboost-deployment | XGBoost | no disponible | no aplica | no disponible | no disponible | Hugging Face (Delower) |
| Delower/herg-cardiogenai-deployment | no disponible | no disponible | no aplica | no disponible | no disponible | Hugging Face (Delower) |

No se dispone de datos publicados de otros modelos comparables de prediccion de hERG en la informacion proporcionada.

## Limitaciones y advertencias

- Los conjuntos regulatorios y externos (hERG-70, new-compounds 967, FDA panel 36, REGFAIL, hERG-60, Test-1) estan absorbidos en el entrenamiento: cualquier metrica calculada sobre ellos es in-sample por construccion y no sirve como validacion externa. El propio autor lo advierte.
- Las predicciones de `regulatory_inference_sample.csv` son demostraciones in-sample sobre compuestos REGFAIL y estan etiquetadas como tales; no deben presentarse como evidencia de rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No hay informacion sobre sesgos del modelo, dominios quimicos cubiertos ni rendimiento fuera de la distribucion de entrenamiento.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- El umbral de clasificacion (0,5) y el corte de 10 uM son decisiones de diseno del autor; variarlos cambia la sensibilidad y especificidad del cribado.
- El repositorio tiene 0 descargas y 0 likes, y no se documentan validaciones independientes por terceros.
- La fecha de creacion indicada (2026-11-16) debe tratarse con cautela; no se dispone de informacion adicional que la confirme.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Delower/herg-extratrees-deployment
- Modelo hermano XGBoost: https://huggingface.co/Delower/herg-xgboost-deployment
- Modelo hermano CardioGenAI: https://huggingface.co/Delower/herg-cardiogenai-deployment
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
