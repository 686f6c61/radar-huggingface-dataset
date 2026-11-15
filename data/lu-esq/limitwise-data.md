# Lu-esq/limitwise-data

## Resumen

LimitWise v2 es un modelo de clasificación tabular basado en regresión logística, publicado por Lu-esq en Hugging Face bajo el identificador `Lu-esq/limitwise-data`. Se presenta como un artefacto educativo del "AI Governance Practicum" (Track 1) y simula el sistema de alerta temprana de impago de una entidad ficticia, Corvana Bank. El modelo no es una red neuronal ni un modelo de lenguaje: es un pipeline de scikit-learn serializado en formato pickle que predice la probabilidad de impago en el siguiente ciclo de facturación de cuentas de tarjeta abiertas.

La relevancia del repositorio no reside en su rendimiento predictivo, sino en su función como ejemplar de gobernanza de IA: incluye una model card completa, hashes de integridad de los artefactos, un registro de mitigación de sesgo mediante Fairlearn y una justificación documentada de las decisiones de aprobación. Está pensado para que estudiantes de gobernanza lo sustituyan por su propia versión.

El modelo se entrena sobre el dataset público `drdavidprivacy/limitwise-data` y se sirve a través de un Space de Hugging Face. Su licencia es CC-BY-4.0 y el autor declara explícitamente que es de uso educativo y no apto para decisiones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), con pipeline de preprocesado: imputación por mediana, CorrelationRemover de Fairlearn, escalado e calibración isotónica |
| Parámetros totales | No disponible (modelo lineal; el número de coeficientes depende de las 93 columnas de entrada de v2) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (modelo tabular; los campos categóricos están codificados numéricamente) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle de scikit-learn (`limitwise_v2.pkl`, 18.636 bytes; `limitwise_v2_recalibrated.pkl`, 89.015 bytes) y CSV legible con pesos e intercepto (`limitwise_v2_Inside.csv`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización C = 0.1, pesos de clase balanceados y entradas escaladas. La versión v1 se ajusta sobre 27 variables codificadas en 98 columnas; la v2 se ajusta sobre 93 columnas tras eliminar cuatro campos demográficos (sexo, edad, estado civil y educación). El pipeline de producción debe reproducir cuatro pasos ajustados: la imputación por mediana de la ratio de pago para las 3.175 cuentas sin saldo previo, el CorrelationRemover de Fairlearn, el escalador y la recalibración isotónica (curva monótona ajustada sobre las predicciones de validación cruzada de las filas de entrenamiento).

La mitigación de sesgo se realiza con `CorrelationRemover` de Fairlearn 0.15.0, ajustado sobre las filas de entrenamiento contra sexo, edad, estado civil y educación: elimina de cada variable de entrada la parte que covaría con esos cuatro campos y después los descarta, de modo que el modelo nunca los ve. El entrenamiento se realizó con scikit-learn 1.9.1 y el modelo no carga en otra versión de la librería, por diseño. No se especifican en la información disponible el número de tokens ni la composición detallada del dataset más allá de su origen público.

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de impago de pago en el siguiente ciclo de facturación para cuentas de tarjeta abiertas.
- Ranking de cuentas por riesgo dentro de un ciclo de facturación, para priorizar la revisión humana.
- Calibración de probabilidades mediante regresión isotónica, con una comprobación de calibración documentada en la sección 7 de la model card.
- Mitigación de sesgo por grupo demográfico mediante eliminación de correlación (Fairlearn).
- Trazabilidad de artefactos: hashes SHA-256 para los ficheros pickle y pesos legibles en CSV.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo tabular, no un modelo de lenguaje.

## Casos de uso

- Alerta temprana de impago en tarjetas de crédito: el modelo puntúa cada cuenta abierta al cierre de ciclo para que el equipo de cobros pueda priorizar las llamadas de contacto antes de que el impago se materialice, un ciclo antes de lo que detecta el scorecard de comportamiento.
- Priorización de ofertas de hardship: los agentes de atención al cliente usan el ranking para decidir a qué titulares ofrecer planes de pago o renegociaciones, con revisión humana de cada contacto.
- Auditoría de gobernanza de IA: el repositorio sirve como plantilla de model card, registro de mitigación y control de versiones para equipos que necesitan documentar un modelo en producción conforme a marcos de gobernanza.
- Docencia en fairness y calibración: el pipeline completo (CorrelationRemover, calibración isotónica, comprobación de calibración) es un ejemplo reproducible para cursos de IA responsable.
- Validación de pipelines de scikit-learn: el requisito de versión exacta (1.9.1) y los hashes de integridad permiten practicar la reproducibilidad de artefactos en MLOps.
- Pruebas de concepto de scoring crediticio: sirve para prototipar un flujo de puntuación tabular con separación de grupos protegidos antes de invertir en un modelo más complejo.
- Simulación de comités de aprobación: el documento incluye roles (Chief AI Officer, AI Governance Lead, modeling team) y puertas de uso, útil para ensayar procesos de sign-off.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comprobación de calibración que pasa en la sección 7 del cuaderno de evaluación, pero no incluye métricas numéricas (AUC, F1, Brier score) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresión logística de menos de 100 KB en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el cuello de botella es la carga del pipeline de scikit-learn, no el cálculo.
- Opciones de despliegue: serialización pickle cargada con scikit-learn 1.9.1 (versión obligatoria), servicio vía el Space `drdavidprivacy/limitwise`, o reimplementación de los pesos del CSV `limitwise_v2_Inside.csv` en cualquier runtime.
- Latencia y throughput estimados: no disponibles; para un modelo lineal de este tamaño la inferencia por lote es del orden de microsegundos a milisegundos por fila en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LimitWise v2 | Regresión logística tabular | No disponible (lineal) | No aplica | CC-BY-4.0 | Hugging Face (repo + Space) |
| Scorecards de crédito comerciales | Modelos propietarios tabulares | No disponible | No aplica | Propietaria | No públicos |
| Modelos de gradient boosting (XGBoost, LightGBM) | Árboles tabulares | Configurable | No aplica | Apache 2.0 / MIT | Amplia |
| fairlearn CorrelationRemover + estimador base | Pipeline de mitigación | Depende del estimador | No aplica | MIT | PyPI |

No se dispone de datos de rendimiento comparativo entre LimitWise v2 y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente educativo: el autor declara que la organización, el sistema y las personas son ficticios y que el modelo no debe usarse para decisiones reales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir probabilidades mal calibradas si la comprobación de calibración no se ejecuta sobre la versión firmada; la propia model card advierte que una puntuación no es la probabilidad de impago del titular hasta que esa comprobación pase.
- Dependencia estricta de versión: el pickle no carga en versiones de scikit-learn distintas de 1.9.1, lo que limita la portabilidad y complica el despliegue en entornos con otras dependencias.
- Sesgos conocidos: aunque se eliminan cuatro campos demográficos mediante CorrelationRemover, la model card no reporta métricas de paridad ni de igualdad de oportunidades por grupo; la eficacia de la mitigación no está cuantificada en el texto disponible.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero el aviso del autor restringe el uso a fines educativos; conviene verificar la compatibilidad antes de cualquier uso productivo.
- Limitaciones de contexto e idioma: al ser un modelo tabular, no hay soporte multilingüe ni ventana de contexto; los campos categóricos están codificados numéricamente y cualquier cambio en la codificación invalida el pipeline.
- Caveat de producción: el uso gate está cerrado hasta que pasen la comprobación de calibración, la de cobertura de razones y la lista de vigilancia de la semana 2, y hasta que la capacidad de contacto esté escrita en el fichero del programa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Lu-esq/limitwise-data
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/limitwise-data
- Paquetes de casos del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostración: https://huggingface.co/spaces/drdavidprivacy/limitwise
