# geek4freak/leak-curber-enzyme-retrieval-v6

## Resumen

Leak CURBER enzyme retrieval v6 es un sistema de predicción de números EC (Enzyme Commission, la clasificación jerárquica de enzimas) a partir de la representación SMILES de una reacción química. Lo desarrolla el usuario geek4freak y se distribuye bajo licencia MIT. No es un modelo de lenguaje generativo, sino un ensemble de clasificadores y recuperadores especializados en un dominio muy concreto de la química computacional: asignar la clase funcional enzimática (EC) que corresponde a una reacción dada.

El sistema combina varias vistas de representación de la reacción (fingerprints de Morgan dirigidos, atom-pair, diferencias de subestructuras ganadas y perdidas, TF-IDF de n-gramas de caracteres y embeddings de un BERT de reacciones) con nueve clasificadores MLP residuales y varios recuperadores kNN por similitud de coseno. Las predicciones se combinan mediante pesos ajustados sobre un holdout de validación agrupado por similitud, lo que reduce el riesgo de sobreajuste y de fuga de información entre reacciones parecidas.

La relevancia práctica es la inferencia en CPU: el modelo se ejecuta con un script `predict.py` sin necesidad de GPU, lo que lo hace desplegable en entornos modestos. El repositorio ocupa 0,7 GB y los pesos se distribuyen en formato ONNX. Es una herramienta de nicho orientada a pipelines de anotación enzimática, no a propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: 9 clasificadores MLP residuales + BERT de reacciones (rxnfp, ONNX) + recuperadores kNN (coseno) sobre múltiples vistas de fingerprint |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; la entrada es una cadena SMILES de reacción) |
| Tipos de cuantizacion | no disponible (inferencia en CPU, pesos ONNX) |
| Idiomas soportados | no disponible (dominio químico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (bert_0.onnx, bert_1.onnx) y componentes de fingerprint/MLP en el repositorio |

## Arquitectura y entrenamiento

El sistema se articula en tres capas. Primero, la representación: fingerprint de Morgan dirigido sobre la reacción (reactivos, productos y subestructuras ganadas y perdidas, con diferencia desplegada y luego plegada), además de vistas rsplit y atom-pair, TF-IDF de n-gramas de caracteres 3-5 y embeddings de un BERT de reacciones (rxnfp) afinado. Segundo, los clasificadores: nueve MLP residuales sobre las vistas de fingerprint, entrenados con objetivos multi-EC suaves (1/n) y cabezas auxiliares L3/L2/L1, donde la cabeza L3 se emplea para el re-ranking. Tercero, la recuperación: kNN por coseno sobre el fingerprint, el centro de reacción, el TF-IDF de caracteres y los embeddings del MLP y del BERT.

El entrenamiento incorpora normalización de cargas dentro del fingerprinting (neutralización y eliminación de [H+]) sin alterar las cadenas de entrada, y aumentación con reacciones invertidas. Los pesos del ensemble se ajustan sobre un holdout construido para imitar el split de la competición, con agrupamiento por similitud y reponderación a las entradas públicas de validación sin usar etiquetas. Los pesos finales dan preponderancia al BERT (3.0), al MLP de Morgan (2.0) y a los kNN de diferencia (1.0), con umbrales de similitud (taus) por componente. El vocabulario EC proviene de ExPASy ENZYME release 02-Sep-2026.

## Capacidades

- Predicción de un número EC por reacción SMILES, con jerarquía L4/L3/L2/L1.
- Clasificación multi-etiqueta suave durante el entrenamiento (objetivos 1/n) y re-ranking mediante la cabeza L3.
- Recuperación por similitud sobre múltiples vistas (fingerprint, centro de reacción, TF-IDF, embeddings).
- Inferencia exclusiva en CPU mediante `python /app/predict.py --input IN --output OUT`.
- Normalización interna de cargas y eliminación de [H+] en el fingerprint, sin modificar la entrada.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es un clasificador de dominio específico.

## Casos de uso

- Anotación enzimática en pipelines de química: dado un conjunto de reacciones SMILES, el modelo asigna una clase EC por reacción, útil para enriquecer bases de datos metabólicas o de biotransformaciones.
- Curación de datos de reacción: filtrar o etiquetar reacciones con EC desconocido en repositorios internos, aprovechando la inferencia en CPU y el bajo coste de despliegue.
- Priorización en descubrimiento de enzimas: clasificar candidatos de reacción antes de validación experimental, usando la jerarquía L1-L4 para decidir el nivel de confianza requerido.
- Integración en entornos sin GPU: al ejecutarse solo en CPU, encaja en servidores modestos, contenedores o estaciones de trabajo de laboratorio.
- Enseñanza y prototipado en química computacional: permite explorar la relación entre estructura de reacción y clase enzimática con un modelo reproducible y de código abierto.
- Preprocesado para modelos downstream: usar la salida EC como característica adicional en modelos de predicción de función proteica o de viabilidad de rutas metabólicas.
- Auditoría de datasets: detectar discrepancias entre la EC anotada y la predicha para revisión manual.

## Benchmarks y rendimiento

El autor publica una estimación sobre un holdout local construido para imitar el split de la competición, con puntuaciones cruzadas (pesos ajustados en una mitad y evaluados en la otra):

| Nivel | Puntuación |
|---|---|
| L4 | 0,6418 |
| L3 | 0,8603 |
| L2 | 0,8992 |
| L1 | 0,9337 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- Inferencia exclusiva en CPU; no requiere GPU.
- VRAM estimada: no aplica (0 GB de VRAM).
- GPU recomendadas: no aplica; el autor indica CPU-only.
- Cabe en cualquier equipo consumer; el repositorio ocupa 0,7 GB, por lo que la memoria RAM necesaria es moderada (no cuantificada en la información disponible).
- Opciones de despliegue: script `predict.py` con entrada/salida por fichero; pesos ONNX ejecutables con ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Leak CURBER v6 | Ensemble MLP + BERT rxnfp + kNN | SMILES de reacción | MIT | Hugging Face, CPU |
| rxnfp (Schwaller et al., 2021) | BERT de reacciones | SMILES de reacción | MIT | Público |
| BEC-Pred (Qian et al., 2024) | Predicción de EC | Reacción | no disponible | Referencia en model card |
| CLIPZyme (Mikhael et al., ICML 2024) | Recuperación enzima-reacción | Reacción/enzima | no disponible | Referencia en model card |
| Horizyn (Rocks et al., PNAS 2026) | Recuperación | Reacción/enzima | no disponible | Referencia en model card |

No se dispone de comparaciones numéricas de rendimiento entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo predice números EC a partir de reacciones SMILES; no es un modelo de lenguaje ni admite otras tareas.
- Las puntuaciones publicadas son una estimación local sobre un holdout construido para imitar el leaderboard; el autor advierte que la puntuación real puede diferir.
- El rendimiento a nivel L4 (0,6418) es moderadamente bajo; conviene tratar las predicciones L4 con cautela y usar la jerarquía superior (L1-L3) cuando sea suficiente.
- Riesgo de sobreajuste al split de validación, mitigado parcialmente por el ajuste cruzado de pesos, pero no eliminado.
- Dependencia del vocabulario EC de ExPASy ENZYME release 02-Sep-2026; clases nuevas o revisadas posteriores no estarán cubiertas.
- No se documentan sesgos ni cobertura de idiomas (no aplica en sentido lingüístico), pero la cobertura química depende de la distribución del entrenamiento.
- Licencia MIT permite uso comercial, pero no se especifican garantías ni limitaciones adicionales en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/geek4freak/leak-curber-enzyme-retrieval-v6
- rxnfp (Schwaller et al., Nat. Mach. Intell. 2021): referencia citada en la model card
- BEC-Pred (Qian et al., J. Cheminform. 2024): referencia citada en la model card
- CLIPZyme (Mikhael et al., ICML 2024): referencia citada en la model card
- Horizyn (Rocks et al., PNAS 2026): referencia citada en la model card
- CARE/CREEP (Yang et al., 2025): referencia citada en la model card
- DRFP (Probst et al., 2022): referencia citada en la model card
- ExPASy ENZYME (SIB, CC BY 4.0): vocabulario EC utilizado
