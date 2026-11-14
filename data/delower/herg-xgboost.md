# Delower/herg-xgboost

## Resumen

hERG XGBoost es un conjunto de cuatro modelos de *gradient boosting* (XGBoost) entrenados para predecir cardiotoxicidad mediada por el canal hERG (Kv11.1), una de las principales causas de retirada de fármacos en fases regulatorias. Lo desarrolla el usuario Delower y se publica bajo licencia MIT. No es un modelo de lenguaje: es un modelo de predicción molecular supervisada que opera sobre descriptores y huellas moleculares derivadas de SMILES mediante RDKit.

El paquete incluye dos tareas (clasificador de bloqueador y regresor de pIC50), cada una en dos protocolos de partición (aleatoria y por *scaffold*). Las versiones por *scaffold* se presentan como las principales porque evalúan la generalización a química novedosa. Los modelos se entrenaron sobre un conjunto curado y descontaminado de datos públicos de hERG procedentes de ChEMBL, BindingDB y PubChem.

La relevancia práctica está en su utilidad como filtro temprano en *screening* virtual y en el diseño de pipelines de descubrimiento de fármacos, aunque el propio autor advierte que la sensibilidad sobre compuestos novedosos es baja (~0,33) y que no debe usarse como única barrera de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (XGBoost) sobre descriptores moleculares |
| Parámetros totales | no disponible (no aplica; modelo de árboles) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica; entrada SMILES) |
| Licencia | MIT |
| Formato de pesos | Pickles de Python (`.pkl`) con estado de preprocesado incluido |

## Arquitectura y entrenamiento

El modelo no es una red neuronal sino un ensamblado XGBoost que consume bloques de características calculados con RDKit: huellas Morgan/ECFP/FCFP (binarias y de conteo), claves MACCS, 217 descriptores RDKit, descriptores fisicoquímicos, bloques específicos de hERG y farmacóforos 2D. El bloque CDK/PaDEL se descartó. Cada pickle contiene el modelo, la tarea, los bloques de características, los hiperparámetros, los estados de preprocesado y el protocolo de entrenamiento.

Los datos de entrenamiento son 12.702 compuestos para clasificación y 8.657 para regresión (solo IC50 funcional; Ki no se agrupó en la regresión principal), deduplicados por conectividad canónica. Antes del entrenamiento se eliminaron 1.738 compuestos únicos que cubrían todos los conjuntos de evaluación (InChIKey), verificándose solapamiento cero tras el bloqueo. Los modelos finales son reajustes sobre las claves de entrenamiento y validación del protocolo, con el preprocesado ajustado solo sobre esas claves. El umbral de decisión está fijado en 10 µM (pIC50 ≥ 5,0) para la llamada de bloqueador.

## Capacidades

- Clasificación binaria de bloqueador de hERG a partir de SMILES, con probabilidad calibrada.
- Regresión de pIC50 para estimar potencia de bloqueo.
- Cálculo de características moleculares end-to-end solo con RDKit (`feature_extraction.py`).
- Inferencia por lotes desde CSV (`predict_herg.py`).
- Dos protocolos de evaluación (partición aleatoria y por *scaffold*) seleccionables.
- Salida de llamada derivada a 10 µM y umbral secundario a 1 µM en la evaluación del proyecto.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un predictor tabular.

## Casos de uso

- Filtrado temprano en *screening* virtual: pasar una biblioteca de SMILES por `predict_herg.py` para descartar candidatos con alta probabilidad de bloqueo antes de ensayos in vitro.
- Priorización de compuestos en descubrimiento: usar el regresor de pIC50 para ordenar series químicas por potencia de bloqueo estimada y decidir qué sintetizar.
- Análisis de riesgo regulatorio: evaluar compuestos de desarrollo con el clasificador por *scaffold* como señal complementaria en la evaluación de cardiotoxicidad.
- Enriquecimiento de datasets internos: etiquetar compuestos no medidos con probabilidad de bloqueo para construir conjuntos de entrenamiento ampliados.
- Integración en pipelines de quimioinformática: el script de inferencia y el extractor de características son reutilizables en flujos Python existentes con RDKit.
- Docencia y validación metodológica: el paquete incluye resultados de validación honestos y una muestra de inferencia sobre fallos regulatorios, útil para ilustrar límites de generalización.
- *Triaje* previo a ensayos de patch-clamp: reducir el número de compuestos que pasan a electrofisiología manual usando la probabilidad como criterio de corte.

## Benchmarks y rendimiento

Clasificación (umbral 10 µM):

| Modelo | Test interno ACC / MCC | hERG-70 ACC / MCC | Compuestos nuevos ACC / MCC (SEN) | Errores panel FDA /36 |
|---|---|---|---|---|
| XGB cls random | 0,816 / 0,623 | 0,760 / 0,537 | 0,515 / 0,202 (0,331) | 4 |
| XGB cls scaffold | 0,783 / 0,549 | 0,751 / 0,519 | 0,505 / 0,168 (0,331) | 2 |

Regresión (pIC50):

| Modelo | Test interno RMSE / MAE | hERG-70 RMSE / MAE | Compuestos nuevos RMSE / R² | MAE FDA |
|---|---|---|---|---|
| XGB reg random | 0,540 / 0,379 | 0,816 / 0,581 | 0,807 / −0,052 | 0,811 |
| XGB reg scaffold | 0,640 / 0,464 | 0,812 / 0,588 | 0,821 / −0,091 | 0,827 |

En el conjunto de fallos regulatorios, los clasificadores aciertan 2/5 en compuestos con IC50 etiquetado (vanoxerine y sematilide correctos; almokalant, AZD1305 y tedisamil subestimados). Las llamadas derivadas de la regresión aciertan 5/5, aunque la potencia de almokalant se subestima en ~2,3 unidades logarítmicas.

## Requisitos de hardware

- Inferencia en CPU: los modelos XGBoost con unos pocos miles de árboles se ejecutan en CPU sin GPU; no se especifica el número exacto de árboles.
- Memoria RAM: no disponible con precisión; el paquete de modelos y el estado de preprocesado caben holgadamente en unos pocos GB.
- GPU: no necesaria; XGBoost puede usar CUDA opcionalmente, pero no se documenta.
- Despliegue: script Python con RDKit y dependencias fijadas en `requirements.txt`; no hay integración con vLLM, llama.cpp, Ollama ni TGI (no aplica).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| hERG XGBoost (este) | XGBoost sobre descriptores RDKit | Clasificación y regresión hERG | MIT | Hugging Face |
| Alternativas de la literatura hERG | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; el autor menciona un modelo de alta sensibilidad como complemento, pero sin identificar ni enlazar.

## Limitaciones y advertencias

- Sensibilidad sobre compuestos novedosos de ~0,33: en 967 compuestos ausentes de UnihERG_DB solo detecta un tercio de los bloqueadores reales. No debe usarse como única barrera de seguridad.
- Las llamadas de "no bloqueador" sobre química novedosa son evidencia débil.
- El regresor tiene R² negativo en el segmento de compuestos nuevos; está cerca del ruido experimental de los datos públicos de hERG (σ ≈ 0,68 unidades log).
- Las probabilidades pueden diferir en el segundo decimal si la versión de RDKit no coincide con `requirements.txt`, aunque las llamadas no cambian en la verificación.
- La regresión principal excluye datos de Ki; solo usa IC50 funcional.
- El modelo no modela cinética, metabolismo ni exposición plasmática: predice bloqueo intrínseco, no riesgo clínico.
- La licencia MIT permite uso comercial, pero no se documentan garantías ni validación regulatoria.
- No se especifican sesgos por quimiotipo ni cobertura de idiomas (no aplica).

## Enlaces

- Hugging Face: https://huggingface.co/Delower/herg-xgboost
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
