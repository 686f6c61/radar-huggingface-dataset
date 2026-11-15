# efe-T/nasa-same-model-c

## Resumen

SAME / SAME-R model C es un clasificador tabular desarrollado por el usuario efe-T que predice si la dispersión registrada por los detectores de humo de la ISS (experimentos PSI-102 y PSI-101 de la NASA) alcanza el umbral de 2,0 V a partir de un material de prueba y cinco condiciones controladas (flujo de aire, ratio de resistencia, tiempo de calentamiento, tiempo de envejecimiento y tiempo de mezcla). No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn serializado con joblib, entrenado sobre datos tabulares reales de microgravedad.

El modelo se enmarca en la investigación sobre detección de humo en entornos de microgravedad y su etiqueta objetivo es una respuesta umbral derivada experimentalmente, no una alarma operativa grabada ni una predicción de tiempo hasta la alarma. El conjunto de datos combinado contiene 17 registros primarios de SAME y 67 de SAME-R (61 por encima del umbral y 23 por debajo), más 50 registros secundarios de envejecimiento retenidos solo para visualización.

Su relevancia actual es metodológica: el autor documenta de forma explícita que la identidad del material explica la mayor parte de la puntuación principal, y publica una evaluación de seguimiento que matiza el resultado original. Es un ejemplo de ficha reproducible con validación anidada agrupada, pruebas automatizadas y contrato de inferencia en CPU sin GPU ni API de pago.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random forest de 100 árboles con profundidad 3, dentro de un pipeline de scikit-learn con codificadores y escaladores ajustados |
| Parámetros totales | no disponible (modelo de árboles; no aplica el recuento de parámetros de una red neuronal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 6 campos) |
| Tipos de cuantización | no disponible (no aplica; serialización joblib) |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | Apache 2.0 (los datasets originales de la NASA conservan CC0-1.0) |
| Formato de pesos | pipeline de scikit-learn serializado con joblib, acompañado de `domain.json` y sumas de comprobación |

## Arquitectura y entrenamiento

El modelo final es un random forest de 100 árboles y profundidad máxima 3, seleccionado mediante validación cruzada anidada agrupada de 5 folds entre cuatro candidatos: una línea base de mayoría, un árbol de profundidad 2, una regresión logística regularizada y un bosque superficial. El pipeline incluye codificación de la variable categórica `material` y escalado de las variables numéricas. La selección se realizó dentro de cada fold externo, de modo que la estimación reportada evalúa el procedimiento completo de selección interna.

Los datos provienen exclusivamente de registros reales de los experimentos PSI-102 y PSI-101 de la NASA, con verificación de checksums SHA256 de los ficheros originales. El autor reporta 81 grupos de validación conservadores derivados de 82 muestras físicas primarias, con una identidad ambigua (muestra secundaria 51a) que enlaza dos grupos. No se documenta uso de RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo generativo. La innovación destacable es la trazabilidad: evaluación de seguimiento separada, pruebas (44 superadas localmente y en una descarga limpia del Hub) y registro explícito del estado de verificación (`TESTED_LOCALLY`, no `COLAB_VERIFIED`).

## Capacidades

- Clasificación binaria tabular: predice si la dispersión del detector alcanza 2,0 V (clase 0 = por debajo, clase 1 = al menos 2,0 V).
- Entrada estructurada de seis campos: `material` (categórico: Kapton, Lampwick, Pyrell, entre otros), `airflow_cm_s`, `resistance_ratio`, `heating_s`, `aging_s` y `mixing_s`, con unidades declaradas.
- Detección de valores fuera de distribución (OOD) mediante distancia al vecino más cercano y umbral empírico (`ood_threshold` = 9,321957129180966).
- Salida interpretable con `predicted_alarm_level_reached`, `value_kind="predicted"`, `model_version="1.0.0"`, `ood`, `nearest_distance`, vecino de test más cercano e `uncertainty`.
- Inferencia exclusiva en CPU, sin GPU ni API de pago.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Análisis de sensibilidad de materiales en microgravedad: dado un material y condiciones de flujo, resistencia y tiempos, el modelo estima si la dispersión registrada superaría el umbral de 2,0 V, útil para priorizar ensayos físicos en campañas de detección de humo.
- Filtro previo en pipelines de experimentación: integrado como paso de scikit-learn, permite descartar combinaciones de condiciones con baja probabilidad de superar el umbral antes de ejecutar pruebas costosas.
- Docencia y reproducción científica: el notebook de Colab y las instrucciones de `python -m model_c.train` permiten reproducir el entrenamiento completo y las comprobaciones de fórmulas científicas con paquetes fijados.
- Validación de metodología de evaluación: sirve como referencia de validación cruzada anidada agrupada con línea base de mayoría y evaluación de seguimiento separada, aplicable a otros clasificadores tabulares pequeños.
- Monitorización de dominio en producción: el campo `ood` y `nearest_distance` permiten rechazar entradas fuera del dominio de entrenamiento antes de emitir una predicción.
- Cuadros de mando de datos de envejecimiento secundario: los 50 registros secundarios se retienen solo para visualización medida/derivada, no para entrenamiento, lo que permite construir paneles de seguimiento sin contaminar el modelo.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Exactitud balanceada, CV anidada agrupada de 5 folds | 0,870152 ± 0,076360 |
| Línea base de mayoría | 0,500000 ± 0,000000 |
| Mejora pareada frente a la línea base | 0,370152 ± 0,076360 |
| Línea base de mayoría por material (solo folds de entrenamiento) | 0,891342 ± 0,048823 |
| Bosque fijo (evaluación retrospectiva) | 0,900433 ± 0,056572 |
| Diferencia pareada bosque fijo frente a línea base por material | media 0,009091 ± 0,020328; diferencias [0, 0, 0, 0, 0,045455] |

Las cifras son media y desviación típica muestral de los folds, no intervalos de confianza. El autor señala que la ventaja numérica del bosque fijo queda empatada bajo la regla original de una desviación típica por fold y no establece valor predictivo adicional de las condiciones controladas. La comparación del bosque fijo es retrospectiva y no constituye una nueva métrica principal libre de sesgo de selección.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere GPU ni API de pago.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y las dependencias críticas están fijadas en el directorio del artefacto.
- Despliegue: pipeline estándar de scikit-learn serializado con joblib, cargado mediante `predict_model_c` del paquete `model_c`; requiere Python 3.12 o 3.13 y verificación de checksums antes de cargar.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un bosque de 100 árboles de profundidad 3, la inferencia es de milisegundos por muestra en CPU convencional.
- Entorno reproducible: `requirements.txt` y `requirements-lock-local.txt`; el notebook funciona en Google Colab estándar con Runtime → Run all.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Métrica principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAME / SAME-R model C | Random forest (scikit-learn) | 6 campos tabulares | Exactitud balanceada 0,870152 ± 0,076360 | Apache 2.0 | Hugging Face, 0 descargas, 1 like |
| Línea base de mayoría por material | Regla trivial | Material | 0,891342 ± 0,048823 | no aplica | Incluida en la evaluación del propio autor |
| Bosque fijo (evaluación retrospectiva) | Random forest | 6 campos tabulares | 0,900433 ± 0,056572 | Apache 2.0 | Incluida en `reports/evaluation_followup.md` |

No se dispone de información sobre otros modelos públicos comparables de detección de humo en microgravedad con datos PSI-101/PSI-102; indíquese como no disponible.

## Limitaciones y advertencias

- La etiqueta objetivo es una respuesta umbral derivada experimentalmente, no una alarma operativa grabada, una predicción de tiempo hasta la alarma ni una puntuación de riesgo de incendio.
- La identidad del material explica la puntuación principal: la línea base por material (0,891342) supera la métrica principal original (0,870152), por lo que el valor predictivo de las condiciones controladas no está demostrado.
- El tamaño muestral es muy reducido (17 registros SAME y 67 SAME-R primarios); las estimaciones tienen alta varianza y las cifras son medias y desviaciones típicas de folds, no intervalos de confianza.
- Solo es aplicable a los materiales y rangos documentados en `domain.json`; las entradas fuera de dominio se marcan con `ood=true` y deben rechazarse.
- El campo `uncertainty` puede ser `null` en las salidas, como en el ejemplo de inferencia del autor.
- La evaluación de seguimiento tiene estado `TESTED_LOCALLY`, no `COLAB_VERIFIED`; el notebook original pasó 36 pruebas en Colab y la suite completa 44.
- Riesgo de seguridad en la carga: solo deben usarse bundles joblib de confianza, ya que la deserialización de joblib puede ejecutar código.
- Licencia Apache 2.0 permite uso comercial del código y artefactos, pero los datasets originales de la NASA conservan CC0-1.0 y las publicaciones de referencia mantienen sus propios términos (véase `NOTICE`).
- No debe ejecutarse `model_c.train` al reproducir la evaluación de seguimiento, porque ese comando reentrena y exporta un modelo nuevo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efe-T/nasa-same-model-c
- Evaluación de seguimiento: `reports/evaluation_followup.md` (en el repositorio del modelo)
- Model card extendida: `MODEL_CARD.md` (en el repositorio del modelo)
- Métricas de candidatos y selecciones por fold: `reports/metrics.json` (en el repositorio del modelo)
- Ejemplo completo de petición/respuesta: `reports/sample_inference.json` (en el repositorio del modelo)
- Estado de verificación y almacenamiento: `STATUS.json` (en el repositorio del modelo)
- Salida de pruebas desde descarga del Hub: `logs/pytest-hub-download.txt` (en el repositorio del modelo)
- Notebook reproducible: `notebooks/model_c.ipynb` y `notebooks/model_c_output.ipynb` (en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
