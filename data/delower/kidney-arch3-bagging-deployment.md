# Delower/kidney-arch3-bagging-deployment

## Resumen

El modelo `Delower/kidney-arch3-bagging-deployment` es un clasificador binario de toxicidad renal (nefrotoxicidad) desarrollado por el autor Delower dentro de un programa QSAR de predicción de seguridad de compuestos químicos. Estima la probabilidad de que una molécula pertenezca a la clase tóxica a partir de su estructura química, codificada mediante huellas moleculares y descriptores. Se publica como artefacto de despliegue listo para producción, no como modelo fundacional: es un `BaggingClassifier` de scikit-learn con hiperparámetros por defecto.

El modelo forma parte de un par de despliegue junto con `Delower/kidney-arch5-ensemble-deployment`; la lectura de mayor preocupación se obtiene cuando ambos modelos marcan un compuesto. Este artefacto es el reajuste de despliegue del brazo Arch3 del programa (el barrido de LazyPredict), uno de los dos ganadores seleccionados sobre un benchmark regulatorio bloqueado. La relevancia práctica está en su perfil de alta sensibilidad: recupera el 100 % de los fármacos retirados y de los fallos clínicos del benchmark, a costa de una especificidad baja.

No es un modelo de lenguaje ni una red neuronal: es un pipeline clásico de aprendizaje automático con 1.402 características de entrada (Morgan 1024 bits + MACCS 167 claves + 211 descriptores RDKit) y un umbral de decisión fijado en probabilidad ≥ 0,5. Su licencia es MIT y el artefacto se empaqueta como bundle `joblib`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BaggingClassifier` de scikit-learn (10 estimadores base de árbol de decisión por defecto, bootstrap, `random_state=42`) |
| Parametros totales | no disponible (modelo de árboles, no paramétrico en el sentido de redes neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: una molécula por inferencia, vector de 1.402 características) |
| Tipos de cuantizacion | no aplica (pesos en coma flotante dentro de `model.joblib`) |
| Idiomas soportados | no aplica (modelo químico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (bundle joblib con clasificador, `DescPrep` y nombre de clase ganadora) |

## Arquitectura y entrenamiento

El pipeline es un clasificador de ensamble por bagging sobre árboles de decisión, con los valores por defecto de scikit-learn tal como los instancia el brazo: 10 remuestreos bootstrap, estimador base de árbol de decisión por defecto y `random_state=42`. La entrada es un bloque de características `fp_desc` de 1.402 columnas: 1024 bits de huella Morgan, 167 claves MACCS y 211 descriptores RDKit (de 217 candidatos, preparados por el objeto `DescPrep` del programa, que se reajusta sobre el pool completo y se incluye dentro del bundle). No hay reajuste de hiperparámetros más allá del propio barrido de LazyPredict que seleccionó la clase ganadora.

El conjunto de entrenamiento de despliegue contiene 1.805 compuestos únicos (915 positivos / 890 negativos), ensamblados por deduplicación de conectividad InChIKey del compuesto padre estandarizado, con las etiquetas del benchmark prevaleciendo en conflictos. La composición es: benchmarks regulatorios corregidos (169), benchmarks v1 (0 nuevos, superconjunto), test interno (327), pool de entrenamiento enriquecido (1.309) y conjunto de entrenamiento bloqueado (0 nuevos). Se descartaron 1.307 filas duplicadas y no hubo conflictos de etiqueta. Antes de cualquier entrenamiento se ejecutó una compuerta dura que verificó compuesto a compuesto la presencia en la matriz de entrenamiento: benchmark corregido con retirados 16/16, fallos clínicos 7/7 y PASS 146/146; benchmark v1 con retirados 12/12, fallos clínicos 5/5 y PASS 146/146; cero ausencias en todos los conjuntos. La única excepción documentada es una sustancia adicional por archivo de retirados (17.ª corregida / 13.ª v1) sin estructura resoluble, que no puede entrar en ninguna matriz de características y queda excluida de los denominadores.

Una precisión de nomenclatura relevante: en la ola bloqueada, el ganador del barrido de este brazo fue `NearestCentroid`, y es ese modelo el que sustenta las puntuaciones de benchmark publicadas. El reajuste de despliegue volvió a ejecutar el mismo procedimiento sobre el pool de despliegue (que absorbe el benchmark) y allí el ganador fue `BaggingClassifier`. Mismo brazo, mismo procedimiento, distinto pool, distinta clase ganadora.

## Capacidades

- Clasificación binaria de nefrotoxicidad de compuestos químicos a partir de su estructura (SMILES), devolviendo una probabilidad de clase tóxica.
- Featurización integrada: el bundle incluye `DescPrep`, por lo que la entrada es directamente un SMILES y el pipeline aplica Morgan, MACCS y descriptores RDKit de forma consistente con la pantalla de despliegue.
- Predicción por lotes mediante `predict_many([...])` además de la predicción individual `predict(smiles)`.
- Determinismo verificado: la validación reproducible sobre 8 leads DPP-4 alcanza desviación máxima 0 con tolerancia 1e-6.
- Lectura dual con `Delower/kidney-arch5-ensemble-deployment`: la marca conjunta de ambos modelos es el indicador de mayor preocupación.
- Perfil de alta sensibilidad: recupera el 100 % de fármacos retirados y fallos clínicos del benchmark regulatorio.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos: el modelo puntúa cada compuesto candidato por probabilidad de nefrotoxicidad y permite descartar o priorizar series antes de ensayos in vitro, aprovechando su alta sensibilidad para no perder señales de retirada.
- Triaje de bibliotecas químicas grandes: con `predict_many` se procesan lotes de SMILES y se ordenan por probabilidad; en la pantalla de despliegue del programa se puntuaron 4.898 compuestos de la unión potente, con 3.041 marcados (62,1 %).
- Priorización de leads en programas de inhibidores DPP-4: aplicado a los 1.113 leads del cuaderno del programa, marcó 626 (56,2 %), útil para decidir qué compuestos requieren ensayo de toxicidad renal.
- Segunda opinión en un par de modelos: combinado con Arch5, la marca de ambos (419 de 1.113 leads, 2.195 de 4.898 compuestos) identifica el subconjunto de mayor preocupación y reduce el ruido de una marca individual.
- Enriquecimiento de paneles de seguridad preclínica: el modelo aporta una señal QSAR barata y determinista que se puede ejecutar en cada iteración de diseño molecular sin coste de GPU.
- Documentación regulatoria interna: el bundle incluye `gate_verification.json`, `training_manifest.json` y `absorbed_compounds.csv`, lo que facilita la trazabilidad del conjunto de entrenamiento y la reproducibilidad de la compuerta dura en auditorías.
- Integración en pipelines CI/CD de quimioinformática: al ser un artefacto joblib con `predict.py` y `validate.py` ejecutables, se puede incorporar como paso de validación automática en flujos de generación de moléculas.

## Benchmarks y rendimiento

Las puntuaciones publicadas corresponden al modelo de la ola bloqueada (`NearestCentroid`), no al `BaggingClassifier` desplegado, que absorbe el benchmark y nunca se puntúa sobre él. Base agrupada v1 con 163 compuestos puntuados (12 retirados + 5 fallos clínicos + 146 PASS):

| Metrica | Valor |
|---|---|
| AUROC regulatorio agrupado | 0,568 |
| Exactitud balanceada agrupada | 0,620 |
| Farmacos retirados detectados | 12/12 |
| Fallos clinicos detectados | 5/5 |
| Compuestos PASS correctos | 35/146 (0,240) |

Señal de selección interna del barrido de despliegue (no es puntuación de benchmark, sino señal sobre datos absorbidos): MCC de validación 0,282 y AUROC 0,695 en el pliegue de entrenamiento.

Resultados de pantalla de despliegue (marca = probabilidad ≥ 0,5):

| Conjunto | Compuestos | Marcados por este modelo | Marcados por Arch5 | Marcados por ambos |
|---|---|---|---|---|
| Leads DPP-4 del cuaderno | 1.113 | 626 (56,2 %) | 668 (60,0 %) | 419 |
| Union potente completa | 4.898 | 3.041 (62,1 %) | 3.219 (65,7 %) | 2.195 |

## Requisitos de hardware

- Inferencia en CPU: el modelo es un ensamble de 10 árboles de decisión sobre 1.402 características; no requiere GPU.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo de consumo, incluidos portátiles básicos y contenedores con poca memoria.
- Opciones de despliegue: Python con scikit-learn y joblib; el bundle requiere que `deployment_common.py` sea importable al deserializar. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; el determinismo y la naturaleza del pipeline (featurización RDKit + votación de 10 árboles) implican latencias de milisegundos por compuesto y buen paralelismo por lotes, aunque no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Perfil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Delower/kidney-arch3-bagging-deployment` | BaggingClassifier (sklearn) | SMILES → 1.402 características | Alta sensibilidad, AUROC 0,568, balanced accuracy 0,620 | MIT | Hugging Face |
| `Delower/kidney-arch5-ensemble-deployment` | Ensamble (sklearn) | Mismo bloque `fp_desc` | Marca el 60,0 % de leads y el 65,7 % de la unión; se usa en par con Arch3 | no disponible | Hugging Face |
| `Delower` kidney arch3 (ola bloqueada) | NearestCentroid | Mismo bloque `fp_desc` | Sustenta las puntuaciones de benchmark del brazo | no disponible | No publicado como artefacto independiente |

No se dispone de información sobre otros modelos QSAR de nefrotoxicidad comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Especificidad baja: solo el 24,0 % de los compuestos PASS del benchmark se clasifican correctamente; una marca individual tiene poca información y la lectura recomendada es la marca dual con Arch5.
- Las puntuaciones de benchmark publicadas corresponden al modelo `NearestCentroid` de la ola bloqueada, no al `BaggingClassifier` desplegado; no deben atribuirse al artefacto de despliegue.
- El modelo de despliegue absorbe el benchmark regulatorio y nunca se puntúa sobre él, por lo que no existe una estimación independiente de su rendimiento en ese conjunto.
- El AUROC agrupado de 0,568 es modesto y próximo al azar; el valor del modelo está en la sensibilidad, no en la discriminación global.
- Riesgo de falsos positivos elevado: tasas de marca del 56–66 % en los conjuntos de pantalla del programa.
- Una sustancia de cada archivo de retirados carece de estructura resoluble y queda sin puntuar en todas las olas; no puede evaluarse con este pipeline.
- Dependencia estricta del entorno: la deserialización requiere `deployment_common.py` importable, y la featurización depende de las versiones de RDKit y scikit-learn usadas en el reajuste.
- Dominio acotado a nefrotoxicidad de compuestos químicos; no es aplicable a texto, código ni otras modalidades.
- Licencia MIT permite uso comercial, pero no se documentan garantías de validez regulatoria ni calibración de probabilidades fuera del dominio de entrenamiento.
- No se documentan sesgos demográficos ni lingüísticos por la naturaleza química del modelo, pero sí un posible sesgo de dominio derivado de la composición del pool de entrenamiento (predominio de benchmarks regulatorios y leads DPP-4).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Delower/kidney-arch3-bagging-deployment
- Modelo par de despliegue: https://huggingface.co/Delower/kidney-arch5-ensemble-deployment
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
