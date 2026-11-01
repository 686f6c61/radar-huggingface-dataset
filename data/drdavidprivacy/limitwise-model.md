# drdavidprivacy/limitwise-model

## Resumen

LimitWise v2 es un modelo de clasificación tabular basado en regresión logística, publicado por el usuario drdavidprivacy en HuggingFace. No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de scikit-learn orientado a la predicción de impago de pagos en el siguiente ciclo de facturación de tarjetas de crédito, dentro de un caso práctico educativo de gobernanza de IA (AI Governance Practicum, Track 1). El modelo se entrenó sobre un conjunto de datos público y se documenta con una model card de ejemplo (exemplar) atribuida a un analista ficticio, Tom Becker, en una organización ficticia, Corvana Bank.

El interés técnico del artefacto no reside en su capacidad predictiva, sino en cómo ejemplifica un flujo completo de gobernanza: mitigación de sesgo con Fairlearn (CorrelationRemover sobre sexo, edad, estado civil y educación), calibración isotónica, eliminación de campos demográficos del conjunto de entrada (de 98 a 93 columnas) y trazabilidad mediante hashes SHA-256 de los artefactos. Está pensado exclusivamente para uso educativo y no para decisiones reales.

El repositorio es de tamaño despreciable (0.0 GB) y contiene únicamente los ficheros `.pkl` del modelo, una tabla CSV con los pesos ajustados y la model card en PDF. No se han publicado resultados de benchmarks ni métricas de rendimiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), regularización C = 0.1, class weights balanceados, entradas escaladas |
| Parámetros totales | No disponible (coeficientes por columna en `limitwise_v2_Inside.csv`; el artefacto pesa 18.636 bytes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.pkl` (pickle de scikit-learn); CSV con pesos e intercept; PDF de model card |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (C = 0.1), pesos de clase balanceados y entradas estandarizadas. La versión v2 se ajusta sobre 93 columnas tras eliminar cuatro campos demográficos (sexo, edad, estado civil y educación) de las 98 columnas originales de v1. El pipeline de producción incluye cuatro pasos que deben reproducirse: imputación con la mediana de entrenamiento del ratio de pago para las 3.175 cuentas sin saldo previo, un `CorrelationRemover` de Fairlearn 0.15.0 ajustado sobre las filas de entrenamiento contra esos cuatro campos demográficos, un escalador y una recalibración isotónica (curva monótona ajustada sobre predicciones de validación cruzada en las filas de entrenamiento).

El entrenamiento se realizó sobre el fichero de trabajo remediado del dataset `drdavidprivacy/limitwise-data`, que a su vez enlaza al fichero original en `drdavidprivacy/practicum-case-packs`. Las dependencias están fijadas por diseño: scikit-learn 1.9.1 y fairlearn 0.15.0; el modelo no carga en otra versión de scikit-learn. Existen dos artefactos: `limitwise_v2.pkl` (18.636 bytes, SHA-256 `9010c6ff9746c5dbf9cebff4c746832864c4f2321d016cc5f3b226847882f705`) y `limitwise_v2_recalibrated.pkl` (89.015 bytes, SHA-256 `b6508dfcc69ca108e3f08fc2be0843dab1d2517355970b8e622e52a34127ca37`).

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de impago de pago en el siguiente ciclo de facturación para cuentas de tarjeta abiertas.
- Ranking de cuentas por riesgo dentro de un ciclo de facturación, para priorizar la revisión humana.
- Mitigación de sesgo integrada: el `CorrelationRemover` elimina de cada entrada la parte que covaría con sexo, edad, estado civil y educación, y después descarta esos cuatro campos.
- Calibración de probabilidades mediante regresión isotónica, verificada en la comprobación de calibración de la sección 7 de la model card.
- Trazabilidad de artefactos: hashes SHA-256 documentados para cada fichero `.pkl`.
- Auditabilidad: exportación de todos los coeficientes ajustados e intercepto a CSV legible por personas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia en gobernanza de IA: el repositorio sirve como plantilla completa de model card para estudiantes del AI Governance Practicum, que deben sustituir el exemplar por su propia versión. Es adecuado porque incluye todas las secciones exigidas (detalles del modelo, uso previsto, factores, métricas, evaluación, mitigación y limitaciones) con referencias cruzadas a memorandos y notebooks.
- Demostración de mitigación de sesgo con Fairlearn: un equipo puede reproducir el pipeline `CorrelationRemover` + escalado + calibración sobre el dataset público para estudiar cómo cambia la equidad entre grupos (sexo, banda de edad, estado civil, educación) al eliminar los campos demográficos.
- Auditoría de calibración de probabilidades: la curva isotónica ajustada sobre predicciones de validación cruzada permite ilustrar por qué una probabilidad sin calibrar no debe interpretarse como probabilidad real de impago.
- Revisión de cumplimiento y trazabilidad: los hashes SHA-256 y la tabla de pesos en CSV permiten enseñar cómo verificar la integridad de un artefacto y cómo reconstruir una decisión a partir de los coeficientes.
- Diseño de controles de uso (use gate): el caso documenta un control explícito (permiso del Chief AI Officer) que permanece cerrado hasta que pasan las comprobaciones de calibración y cobertura de razones, útil como ejemplo de diseño de controles previos al despliegue.
- Evaluación de riesgo de crédito en entornos simulados: con datos sintéticos o públicos, el modelo puede usarse para comparar un scorecard conductual con un modelo de alerta temprana de una sola variable objetivo, siempre fuera de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comprobación de calibración que "pasa" en la sección 7 del notebook de evaluación, pero no se proporcionan valores numéricos (AUC, F1, Brier score, etc.) en los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto pesa 18.636 bytes (modelo base) y 89.015 bytes (recalibrado). Cabe en cualquier CPU.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: sí, aunque no es necesario; el cuello de botella es la CPU y la memoria del proceso de Python.
- Opciones de despliegue: el modelo se sirve mediante el Space `drdavidprivacy/limitwise`; también puede cargarse con `pickle` en un entorno Python con scikit-learn 1.9.1 y fairlearn 0.15.0. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; para una regresión logística sobre 93 columnas la inferencia es del orden de microsegundos a milisegundos por fila en CPU, pero no se ha publicado una medición.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimitWise v2 | Regresión logística tabular (scikit-learn) | No disponible (coeficientes en CSV) | No aplica | CC-BY-4.0 | HuggingFace, Space de demo |
| LimitWise v1 | Regresión logística tabular (scikit-learn) | No disponible | No aplica | No disponible | Referenciado en el notebook, no publicado como artefacto independiente |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (clasificación tabular de riesgo de crédito con mitigación de sesgo y calibración documentadas).

## Limitaciones y advertencias

- Uso exclusivamente educativo: la propia model card indica "Educational use only, not for real decisions". La organización, el sistema y las personas son ficticios; los datos son públicos.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de interpretar las probabilidades como probabilidades reales de impago si no se ha verificado la calibración sobre la versión firmada.
- Dependencia estricta de versiones: el modelo no carga en otra versión de scikit-learn distinta de 1.9.1, por diseño. Esto limita la portabilidad y complica el despliegue en entornos con dependencias fijadas.
- Sesgos conocidos: la model card documenta la mitigación con `CorrelationRemover` sobre sexo, edad, estado civil y educación, pero no publica métricas de paridad ni de equidad por grupo en la información disponible.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero la finalidad declarada es educativa; el uso en decisiones reales de crédito queda explícitamente desaconsejado por el autor.
- Caveat de producción: el control de uso (use gate) está cerrado hasta que pasen la comprobación de calibración y la de cobertura de razones, y hasta que la capacidad de outreach esté escrita en el fichero del programa. Un score no debe interpretarse como probabilidad de impago hasta que la calibración pase en la versión firmada.
- Ausencia de métricas publicadas: no hay AUC, F1, Brier score ni métricas de equidad numéricas en la información disponible, lo que impide evaluar su rendimiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drdavidprivacy/limitwise-model
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/limitwise-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostración: https://huggingface.co/spaces/drdavidprivacy/limitwise
