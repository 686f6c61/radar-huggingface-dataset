# Delower/kidney-arch5-ensemble-deployment

## Resumen

`kidney-arch5-ensemble-deployment` es un clasificador binario de nefrotoxicidad (toxicidad renal) publicado por el usuario Delower en Hugging Face. No es un modelo de lenguaje: es un ensemble clásico de aprendizaje automático construido con scikit-learn, LightGBM y ExtraTrees que estima la probabilidad de que un compuesto químico, representado por su SMILES, pertenezca a la clase tóxica a nivel renal. Se enmarca en el ámbito QSAR (relación cuantitativa estructura-actividad) y está pensado como herramienta de cribado temprano en programas de descubrimiento de fármacos.

Técnicamente es un "deployment refit": la receta ganadora de una fase de benchmark bloqueada se ha reajustado sobre el conjunto completo de datos etiquetados del programa (1.805 compuestos únicos, 915 positivos y 890 negativos), sin reajustar hiperparámetros. Combina tres bloques de características: LightGBM sobre bits de huella Morgan, ExtraTrees sobre descriptores RDKit más MACCS y Morgan count, y LightGBM sobre embeddings de ChemBERTa-77M más descriptores fisicoquímicos. Los pesos del ensemble se derivan de la MCC de validación de cada componente.

Su relevancia es doble: por un lado, documenta con transparencia inusual las métricas reales del modelo de benchmark congelado (AUROC agrupado de 0,701, pero solo 6 de 146 compuestos limpios correctamente clasificados a umbral 0,5); por otro, se despliega en pareja con `Delower/kidney-arch3-bagging-deployment`, de modo que la señal de decisión es el doble flag de ambos modelos. El repositorio pesa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres componentes: LightGBM (Morgan bits) + ExtraTrees (descriptores RDKit, MACCS, Morgan count) + LightGBM (embeddings ChemBERTa-77M + fisicoquímicos) |
| Parametros totales | no disponible (modelos de árboles; el componente C usa el encoder ChemBERTa-77M como extractor de características congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = una molécula SMILES) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib) |
| Idiomas soportados | no disponible (no aplica; no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (bundle joblib con los tres componentes, pesos del ensemble y dos objetos `DescPrep`) |

## Arquitectura y entrenamiento

El modelo es un ensemble ponderado de tres clasificadores entrenados sobre bloques de características distintos. El componente A es un LightGBM (`num_leaves=63`, `learning_rate=0.06`, `n_estimators=300`, `min_child_samples=20`, `subsample=1.0`, `colsample_bytree=0.8`, `reg_lambda=1.0`) sobre 1.024 bits de huella Morgan de radio 2, con peso 0,1473. El componente B es un ExtraTrees de 600 árboles (`max_features=0.5`, `class_weight="balanced"`) sobre 1.402 columnas: 211 descriptores RDKit preparados, 167 claves MACCS y una huella Morgan count de 1.024, con peso 0,3739. El componente C es un LightGBM (`num_leaves=31`, `learning_rate=0.06`, `n_estimators=600`, `min_child_samples=10`, `subsample=0.8`, `colsample_bytree=1.0`, `reg_lambda=5.0`) sobre 768 dimensiones de embeddings ChemBERTa-77M (`seyonec/ChemBERTa-zinc-base-v1`, mean-pooled, solo encoder preentrenado) más 13 descriptores fisicoquímicos preparados, con peso 0,4788.

Los pesos se derivan proporcionalmente a la MCC de validación de cada componente según la regla del brazo, sobre una partición scaffold con semilla 42 del pool de despliegue; después, componentes y preprocesado se reajustan sobre el pool completo. Los hiperparámetros se tomaron literalmente del brazo bloqueado, sin reajuste. El conjunto de entrenamiento se ensambló por deduplicación de conectividad InChIKey del compuesto padre estandarizado, con las etiquetas del benchmark regulador imponiéndose en conflictos: 1.805 compuestos únicos (915/890), con 1.307 filas duplicadas descartadas y 0 conflictos de etiqueta. Se aplicó una compuerta dura que verificó compuesto a compuesto la presencia en la matriz de entrenamiento real de todos los compuestos del benchmark regulador (retirados 16/16, fallos clínicos 7/7, PASS 146/146 en el benchmark corregido; 12/12, 5/5 y 146/146 en el v1), con una excepción declarada: una sustancia por archivo de retirados sin estructura resoluble, excluida de los denominadores de la compuerta.

## Capacidades

- Clasificación binaria de nefrotoxicidad a partir de SMILES: devuelve probabilidad de clase tóxica con umbral de flag en 0,5 (convención del programa).
- Cribado QSAR de alto rendimiento sobre librerías de compuestos, con puntuación por lote mediante `predict_many([...])`.
- Extracción de características químicas integrada: huellas Morgan (bits y count), claves MACCS, descriptores RDKit preparados y embeddings ChemBERTa-77M calculados en el momento de la predicción.
- Lectura de decisión en pareja: el doble flag con `Delower/kidney-arch3-bagging-deployment` constituye la señal de mayor preocupación del programa.
- Determinismo verificado: `validate.py` reproduce las probabilidades sobre 8 leads cribados con tolerancia 1e-6 y desviación máxima 0 en la verificación local.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Cribado temprano de nefrotoxicidad en descubrimiento de fármacos: se pasa una librería de candidatos en SMILES por `predict_many` y se ordena por probabilidad; el modelo está entrenado para maximizar la recuperación de fármacos retirados por toxicidad renal, lo que lo hace útil como filtro de primera pasada antes de ensayos in vitro.
- Priorización de leads en programas de química médica: aplicado a los 1.113 leads potentes del programa DPP-4, el modelo marcó el 60,0 % y el doble flag con Arch3 redujo la señal a 419 compuestos, un subconjunto manejable para revisión experta.
- Triaje de uniones potentes a gran escala: sobre las 4.898 moléculas de la unión potente completa, el modelo marcó el 65,7 % y el doble flag dejó 2.195, lo que permite descartar candidatos de baja preocupación y concentrar recursos en los de señal concordante.
- Filtro de seguridad en pipelines de selección de compuestos: integrable como paso programático en Python (joblib + scikit-learn) dentro de flujos existentes de quimioinformática, ya que el repositorio incluye el módulo de featurización compartido `deployment_common.py` y el punto de entrada `predict.py`.
- Análisis de concordancia entre modelos: al desplegarse en pareja con Arch3, permite estudiar discrepancias entre dos recetas distintas (ensemble Arch5 frente a bagging Arch3) sobre el mismo compuesto, útil para calibrar la confianza del cribado.
- Reproducibilidad y auditoría regulatoria: los archivos `gate_verification.json`, `training_manifest.json` y `absorbed_compounds.csv` documentan la composición exacta del entrenamiento y la verificación de la compuerta, lo que facilita la revisión por parte de equipos de toxicología y asuntos regulatorios.
- Docencia e investigación en QSAR: sirve como ejemplo completo y reproducible de ensemble con múltiples bloques de características, incluidos embeddings de un transformer químico congelado, con métricas honestas publicadas.

## Benchmarks y rendimiento

Las métricas publicadas corresponden al modelo de benchmark congelado de la misma receta (benchmark excluido del entrenamiento, exclusión verificada con 0 fugas; base agrupada v1 con 163 compuestos puntuados: 12 retirados, 5 fallos clínicos y 146 PASS). El refit de despliegue absorbió el benchmark regulador y nunca se puntúa sobre él.

| Metrica | Valor |
|---|---|
| AUROC regulador agrupado | 0,701 |
| Exactitud balanceada agrupada | 0,521 |
| Fármacos retirados detectados | 12/12 |
| Fallos clínicos detectados | 5/5 |
| Compuestos PASS correctos | 6/146 (0,041) |

Resultados del cribado de despliegue (flag = probabilidad ≥ 0,5):

| Conjunto | Puntuados | Marcados por este modelo | Marcados por Arch3 | Marcados por ambos | Por cualquiera | Pasan ambos |
|---|---|---|---|---|---|---|
| Leads del libro DPP-4 | 1.113/1.113 | 668 (60,0 %) | 626 (56,2 %) | 419 | 875 | 238 |
| Unión potente completa | 4.898/4.898 | 3.219 (65,7 %) | 3.041 (62,1 %) | 2.195 | 4.065 | 833 |

No se han publicado resultados de benchmarks comparativos con otros modelos QSAR de nefrotoxicidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un bundle joblib de modelos de árboles y un encoder ChemBERTa-77M de 77 millones de parámetros usado solo en inferencia, por lo que la huella es de CPU y memoria RAM, no de GPU dedicada.
- GPU recomendadas: no disponible; no se requiere GPU. El cálculo de embeddings ChemBERTa puede acelerarse con cualquier GPU consumer, pero el modelo card no especifica requisitos.
- Cabe en GPU consumer: sí, en la práctica, dado el tamaño del encoder (77M) y la naturaleza de árboles del resto del ensemble; no se documentan cifras concretas.
- Opciones de despliegue: Python con scikit-learn, LightGBM y joblib; el repositorio incluye `predict.py`, `deployment_common.py` y `validate.py`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Delower/kidney-arch5-ensemble-deployment` | Ensemble LightGBM + ExtraTrees + embeddings ChemBERTa | no disponible (árboles + encoder 77M) | no aplica | MIT | Hugging Face, 0 descargas |
| `Delower/kidney-arch3-bagging-deployment` | Bagging (receta Arch3), pareja de despliegue | no disponible | no aplica | no disponible en la información | Hugging Face |
| Otros modelos QSAR de nefrotoxicidad | no disponible | no disponible | no aplica | no disponible | no disponible |

La única comparación documentada es con Arch3, el otro ganador del benchmark bloqueado, desplegado como pareja: sobre los 1.113 leads DPP-4, Arch5 marcó el 60,0 % frente al 56,2 % de Arch3, y el doble flag fue de 419 compuestos.

## Limitaciones y advertencias

- Baja especificidad: a umbral 0,5 solo acierta 6 de 146 compuestos PASS (4,1 %), por lo que como cribado independiente es casi no informativo sobre compuestos limpios; es un modelo de ranking antes que un clasificador calibrado.
- Tasas de flag del 56-66 %: el perfil del programa es de alta sensibilidad y baja especificidad, de modo que un flag de un solo modelo aporta poca información; la lectura de decisión es el doble flag con Arch3.
- El refit de despliegue absorbió todos los compuestos del benchmark regulador, por lo que no puede evaluarse de forma independiente sobre ese conjunto; las métricas publicadas provienen del modelo de benchmark congelado, no del artefacto desplegado.
- Una sustancia de cada archivo de retirados carece de estructura resoluble y queda sin puntuar en todas las fases; debe tenerse en cuenta al interpretar recuentos de cobertura.
- Sesgos conocidos: no documentados en la información disponible; el conjunto de entrenamiento procede de datos regulatorios e internos del programa, lo que puede limitar la generalización a quimiotipos fuera de esa distribución.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos negativos y positivos en la predicción; la validación con `validate.py` solo cubre 8 compuestos de ejemplo.
- Dependencia de reproducibilidad: deserializar `model.joblib` exige que `deployment_common.py` sea importable y que las versiones de scikit-learn, LightGBM, RDKit y el encoder ChemBERTa sean compatibles; no se documentan versiones fijadas.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantía ni validación regulatoria del modelo como herramienta de decisión clínica.
- Idiomas y contexto: no aplica; la entrada es una molécula en SMILES y no se admiten entradas de texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/kidney-arch5-ensemble-deployment
- Modelo pareja (Arch3 bagging deployment): https://huggingface.co/Delower/kidney-arch3-bagging-deployment
- Encoder ChemBERTa utilizado: https://huggingface.co/seyonec/ChemBERTa-zinc-base-v1
- Archivos incluidos en el repositorio: `model.joblib`, `config.json`, `deployment_common.py`, `predict.py`, `validate.py`, `examples.json`, `gate_verification.json`, `training_manifest.json`, `absorbed_compounds.csv`
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada.
