# Finhaven/limitwise-data

## Resumen

LimitWise v2 es un modelo de clasificación tabular basado en regresión logística, publicado por el usuario Finhaven en Hugging Face bajo el identificador `Finhaven/limitwise-data`. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un clasificador lineal entrenado con scikit-learn para predecir el riesgo de impago de pago en el siguiente ciclo de extracto en cuentas de tarjeta abiertas. El modelo se enmarca en un ejercicio educativo de gobernanza de IA (AI Governance Practicum, Track 1) de una organización ficticia, Corvana Bank, con datos públicos reales.

El artefacto principal es un pipeline serializado en formato pickle (`limitwise_v2.pkl`, 18.636 bytes) que reproduce todos los pasos de ajuste: imputación por mediana, eliminación de correlación con variables demográficas mediante `CorrelationRemover` de Fairlearn, escalado y recalibración isotónica. Existe además una versión recalibrada (`limitwise_v2_recalibrated.pkl`, 89.015 bytes) y una exportación legible de coeficientes en CSV.

Su relevancia es fundamentalmente documental y formativa: ilustra cómo se documenta un modelo de riesgo crediticio con criterios de equidad, calibración y trazabilidad de artefactos, más que por su rendimiento predictivo. La organización, el sistema y las personas son ficticios; el uso es exclusivamente educativo y no apto para decisiones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn), regularización C = 0.1, class weights balanceados, entradas escaladas |
| Parámetros totales | 93 coeficientes más intercepto (v2); 98 columnas en v1 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | No disponible (no aplica; artefacto pickle de scikit-learn) |
| Idiomas soportados | No disponible (modelo tabular; las etiquetas de campos están en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Pickle de scikit-learn (`.pkl`) y CSV de coeficientes (`limitwise_v2_Inside.csv`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (C = 0.1) y ponderación de clases balanceada. La versión v1 se ajustó sobre 27 variables de entrada codificadas en 98 columnas; la v2 opera sobre 93 columnas tras eliminar cuatro campos demográficos (sexo, edad, estado civil y educación). El pipeline incluye imputación por mediana de la ratio de pago para las 3.175 cuentas sin saldo previo, un `CorrelationRemover` de Fairlearn ajustado sobre las filas de entrenamiento contra esos cuatro campos demográficos, escalado de entradas y una recalibración isotónica (curva monótona ajustada sobre predicciones de validación cruzada).

La mitigación de sesgo se realiza en preprocesado: `CorrelationRemover` elimina de cada variable predictora la parte que covaría con sexo, edad, estado civil y educación, y después descarta esos cuatro campos, de modo que el modelo nunca los ve. Los datos provienen del dataset público `drdavidprivacy/limitwise-data`, derivado a su vez de `drdavidprivacy/practicum-case-packs`. El modelo está fijado a scikit-learn 1.9.1 y fairlearn 0.15.0, y por diseño no carga en otras versiones de scikit-learn.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de impago de pago en el siguiente ciclo de extracto para cuentas de tarjeta abiertas.
- Ranking de cuentas por riesgo dentro de un ciclo de extracto, para priorizar revisiones humanas.
- Inferencia determinista y reproducible a partir de un pipeline serializado con pasos de preprocesado fijos.
- Exportación interpretable de coeficientes e intercepto a CSV para auditoría.
- Recalibración isotónica de probabilidades para alinear las salidas con frecuencias observadas.
- Mitigación de sesgo por grupo (sexo, edad, estado civil, educación) mediante eliminación de correlación en preprocesado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Señalización temprana de impago en tarjetas: el modelo puntúa cada cuenta abierta al cierre del ciclo para que el equipo de outreach detecte dificultades un ciclo antes que el scorecard conductual, siempre con revisión humana de cada contacto.
- Priorización de colas de atención: ordena las cuentas por probabilidad estimada de impago para que los agentes de cobranza aborden primero los casos de mayor riesgo, dado el bajo coste computacional del modelo lineal.
- Auditoría de equidad en producción: el pipeline documenta explícitamente la eliminación de variables demográficas y permite verificar con Fairlearn que las métricas por grupo se mantienen dentro de umbrales antes de habilitar cualquier contacto.
- Docencia y formación en gobernanza de IA: sirve como caso de referencia completo (model card, hashes de integridad, linaje de datos, criterios de firma) para enseñar documentación de modelos de riesgo.
- Validación de calibración: la versión recalibrada permite comparar curvas de fiabilidad y demostrar el paso de la comprobación de calibración exigida antes de interpretar la salida como probabilidad real de impago.
- Reproducción de pipelines regulados: al fijar versiones exactas de scikit-learn y fairlearn y publicar hashes SHA-256, el artefacto sirve para practicar la reproducibilidad exigible en entornos financieros regulados.
- Pruebas de integración de artefactos: el par de pickles (v1 y v2) y el CSV de coeficientes permiten ensayar procesos de control de versiones de modelos y de promoción de campeón a retador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona comprobaciones internas de calibración y de cobertura de razones (secciones 7 y siguientes del cuaderno de evaluación de la semana 6), pero no se proporcionan métricas numéricas (AUC, F1, Brier, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresión logística de 93 coeficientes y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier hardware consumer: el artefacto ocupa 18.636 bytes (v2) y 89.015 bytes (recalibrado); puede ejecutarse en un portátil convencional o en un contenedor de pocos cientos de MB.
- Opciones de despliegue: serialización pickle cargada con scikit-learn 1.9.1 y fairlearn 0.15.0; el autor indica que el modelo no carga en otras versiones de scikit-learn. Se sirve mediante el Space `drdavidprivacy/limitwise`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (inferencia lineal sobre 93 columnas) la latencia esperada es de microsegundos a milisegundos por fila en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores tabulares de riesgo crediticio con mitigación de equidad) ni datos de rendimiento que permitan una comparación cuantitativa. La única comparación interna documentada es entre LimitWise v1 (98 columnas, 6.432 bytes) y v2 (93 columnas tras eliminar campos demográficos, 18.636 bytes), donde v2 es la versión recomendada para firma por incorporar la mitigación de Fairlearn y la recalibración isotónica.

## Limitaciones y advertencias

- Modelo educativo: la organización (Corvana Bank), el sistema y las personas son ficticios; el uso es exclusivamente educativo y no debe emplearse para decisiones reales sobre personas.
- Riesgo de alucinación no aplica en el sentido generativo, pero la salida solo es interpretable como probabilidad de impago si la comprobación de calibración pasa en la versión firmada; en caso contrario, es únicamente una puntuación de ranking.
- Dependencia estricta de versiones: el modelo no carga en versiones de scikit-learn distintas de 1.9.1, lo que limita su portabilidad y exige fijar el entorno en producción.
- Sesgos conocidos: aunque se eliminan las variables demográficas y se aplica `CorrelationRemover`, la model card no aporta métricas por grupo que cuantifiquen el sesgo residual; la equidad debe verificarse con Fairlearn antes de cualquier uso.
- Limitaciones de alcance: el modelo está diseñado solo para la fase preventiva (llamadas de outreach y ofertas de hardship con revisión humana); no se ha aprobado ninguna fase en la que la puntuación derive en reducción de línea, bloqueo de autorización o cierre de cuenta.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero el propio autor declara el artefacto como educativo y no apto para decisiones reales, lo que desaconseja su uso en producción crediticia.
- Caveat de producción: la compuerta de uso (permiso del Chief AI Officer) permanece cerrada hasta que pasen la comprobación de calibración, la de cobertura de razones y la lista de vigilancia de la semana 2, y hasta que la capacidad de outreach esté escrita en el expediente del programa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Finhaven/limitwise-data
- Dataset de linaje: https://huggingface.co/datasets/drdavidprivacy/limitwise-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostración: https://huggingface.co/spaces/drdavidprivacy/limitwise
