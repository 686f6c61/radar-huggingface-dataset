# renefransfs/neostream-churn-classifier

## Resumen

Neostream Churn Classifier (v2) es un modelo de clasificación tabular desarrollado por Rene Francisco Ferreira Santos como proyecto académico de la asignatura de Machine Learning del Instituto Infnet (Brasil). No se trata de un modelo de lenguaje, sino de un pipeline de Scikit-learn que predice la probabilidad de cancelación (churn) de suscriptores de un servicio de streaming ficticio llamado NeoStream, a partir de seis variables tabulares (tres numéricas y tres categóricas).

El modelo es relevante como ejemplo didáctico de un problema muy común en producción: el desbalanceo extremo de clases. La versión 1 optimizaba accuracy y, con un churn del 17,5 %, aprendió a predecir casi siempre "no churn" (recall del 1 % en la clase minoritaria). La versión 2 corrige esto cambiando el objetivo de optimización a F1 y aplicando `class_weight="balanced"` en la regresión logística, sacrificando accuracy (de 0,825 a 0,590) a cambio de un recall del 64 % en la clase churn.

Arquitectura: `ColumnTransformer` (StandardScaler para numéricas + OneHotEncoder con `handle_unknown="ignore"` para categóricas) seguido de una `LogisticRegression`. Los pesos se distribuyen en formato joblib y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de Scikit-learn: ColumnTransformer (StandardScaler + OneHotEncoder) + LogisticRegression |
| Parámetros totales | no disponible (coeficientes de regresión logística, no aplicable el conteo tipo LLM) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | pt-br (etiquetado; las features usan nombres en portugués) |
| Licencia | MIT |
| Formato de pesos | joblib (pipeline serializado: `pipeline_final_churn_v2.joblib`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística binaria envuelta en un único pipeline de Scikit-learn. El preprocesamiento va serializado junto al estimador: las variables numéricas (`tempo_assinatura_meses`, `uso_medio_semanal_horas`, `numero_reclamacoes`) se estandarizan con `StandardScaler`, y las categóricas (`plano`, `metodo_pagamento`, `dispositivo_principal`) se codifican con `OneHotEncoder` usando `handle_unknown="ignore"`, lo que evita fallos en inferencia ante categorías no vistas en entrenamiento. Este diseño de pipeline único elimina el riesgo de data leakage y la divergencia entre entornos de entrenamiento y producción.

El entrenamiento se realizó sobre una base sintética de 12.000 suscriptores con aproximadamente un 17,5 % de churn, dividida en 9.600 muestras de entrenamiento y 2.400 de test mediante split estratificado 80/20 con `random_state=42`. La selección de hiperparámetros se hizo con `GridSearchCV` de 5 folds sobre el parámetro de regularización C ∈ {0.01, 0.1, 1, 10, 100}, usando F1 como métrica de scoring. No hay RLHF ni técnicas propias de deep learning; el tratamiento del desbalanceo se realiza en la función de coste (`class_weight="balanced"`) y no mediante remuestreo del dataset.

## Capacidades

- Clasificación binaria de churn sobre datos tabulares crudos, devolviendo tanto la clase predicha (`predict`) como la probabilidad de la clase positiva (`predict_proba`).
- Preprocesamiento automático integrado: acepta un DataFrame de pandas con las columnas originales sin transformación manual previa.
- Tolerancia a categorías desconocidas en producción gracias a `handle_unknown="ignore"` del OneHotEncoder.
- Salida probabilística interpretable, adecuada para calibrar umbrales de decisión según el coste de negocio.
- No soporta texto libre, tool calling, agentes, ni capacidades multimodales: es un clasificador tabular puro.

## Casos de uso

- Detección temprana de churn en servicios de suscripción: el modelo estima la probabilidad de cancelación a partir de uso medio semanal, antigüedad y quejas, permitiendo priorizar campañas de retención.
- Segmentación de clientes para retención: al priorizar recall (0,64) sobre precisión, es adecuado cuando el coste de perder un cliente supera el coste de contactar a uno que no iba a cancelar.
- Plantilla didáctica de MLOps: el pipeline serializado con joblib muestra cómo empaquetar preprocesamiento y modelo para desplegar en producción sin divergencias entre entornos.
- Ejemplo de tratamiento de clases desbalanceadas: útil como referencia para comparar estrategias de optimización (accuracy frente a F1 con pesos de clase balanceados) en cursos y talleres.
- Prototipado de APIs de scoring: el ejemplo de la model card se adapta directamente a un endpoint FastAPI o Flask que reciba un JSON con las seis features y devuelva la probabilidad de churn.
- Base para ajuste de umbrales de negocio: la salida probabilística permite usar `precision_recall_curve` para elegir el punto de operación según el coste de falsos positivos frente a falsos negativos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (split de test, 2.400 muestras, clase churn):

| Métrica | v1 (optimiza accuracy) | v2 (optimiza F1, class_weight balanced) |
|---|---|---|
| Accuracy (test) | 0,825 | 0,5896 |
| Precisión (churn) | 0,56 | 0,24 |
| Recall (churn) | 0,01 | 0,64 |
| F1 (churn) | 0,02 | 0,35 |

No se han publicado comparaciones con otros modelos ni validación cruzada anidada con intervalos de confianza.

## Requisitos de hardware

- VRAM: no aplicable; es un modelo clásico de Scikit-learn que se ejecuta en CPU sin necesidad de GPU.
- Memoria: el tamaño del repositorio es de 0,0 GB según Hugging Face; el pipeline serializado en joblib ocupa unos pocos kilobytes o megabytes, ejecutable en cualquier máquina.
- Consumer GPU: no necesaria; cualquier portátil o servidor modesto es suficiente.
- Despliegue: cualquier entorno con Python, Scikit-learn y joblib; se integra fácilmente en APIs REST (FastAPI, Flask), batch jobs o plataformas como Hugging Face Spaces. No requiere vLLM, llama.cpp, Ollama ni TGI (herramientas específicas para LLM).
- Latencia: no publicada, pero una regresión logística sobre una fila de entrada se ejecuta en microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Clases desbalanceadas | Métricas publicadas | Licencia |
|---|---|---|---|---|
| neostream-churn-classifier v2 | Regresión logística (Scikit-learn) | Sí, vía class_weight balanced | Accuracy 0,59 / Recall churn 0,64 / F1 0,35 | MIT |
| neostream-churn-classifier v1 (misma familia) | Regresión logística (Scikit-learn) | No tratado | Accuracy 0,825 / Recall churn 0,01 / F1 0,02 | MIT |
| Alternativas externas comparables | no disponible | — | — | — |

No existen comparaciones directas publicadas con otros clasificadores de churn en Hugging Face; el único punto de referencia disponible es la propia versión anterior del mismo autor.

## Limitaciones y advertencias

- Datos sintéticos: las métricas no son transferibles a bases de clientes reales; el modelo no debe usarse en producción con datos reales sin reentrenamiento.
- Precisión baja en la clase churn (0,24): aproximadamente tres de cada cuatro alertas de churn serán falsos positivos; es imprescindible calibrar el umbral de decisión con `precision_recall_curve` según el coste de retención.
- Métricas evaluadas en un único split con seed fija (`random_state=42`); faltan intervalos de confianza mediante validación cruzada anidada o múltiples seeds.
- Las features están definidas en portugués y el dominio es específico (streaming); reutilizarlo en otro sector exige rediseñar las variables.
- Sesgos: al tratarse de datos sintéticos, no hay sesgos demográficos conocidos, pero tampoco garantía de ausencia de sesgos ante datos reales.
- Riesgo de alucinación: no aplicable (no es un modelo generativo).
- Licencia MIT: sin restricciones para uso comercial, aunque el proyecto es académico y la model card lo declara como ejercicio de curso.
- El enlace al repositorio de código de la model card contiene un marcador de posición (`SEU_USERNAME`), por lo que el enlace puede estar roto.

## Enlaces

- Hugging Face: https://huggingface.co/renefransfs/neostream-churn-classifier
- Repositorio de código: https://github.com/SEU_USERNAME/neostream-churn-classifier (enlace con marcador de posición según la model card; puede no estar operativo)
