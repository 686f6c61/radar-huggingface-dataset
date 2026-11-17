# anurag6557/battery-rul-itransformer-v2

## Resumen

`battery-rul-itransformer-v2` es un conjunto de pesos publicados por el usuario anurag6557 en Hugging Face para la predicción del estado de salud (SOH) y de la vida útil restante (RUL, *remaining useful life*) de celdas de batería. El modelo se apoya en una arquitectura iTransformer de un solo canal, adaptada a series temporales de degradación electroquímica, y combina cabezas de regresión cuantílica multi-horizonte con regresión cuantílica conformalizada (CQR) para producir intervalos de predicción con cobertura nominal del 90 %.

El modelo se ha entrenado sobre celdas agrupadas de los conjuntos NASA, CALCE y Toyota/MIT-Stanford, reservando celdas de calibración que nunca se usaron en el entrenamiento. El repositorio incluye los pesos en PyTorch (`forecast.pt`, `rul.pt`), exportaciones ONNX con preprocesado y postprocesado integrados, y metadatos de despliegue (`deploy_meta.json`) con las correcciones CQR, estadísticos de detección de out-of-distribution y la traza de procedencia.

Es relevante para investigadores y desarrolladores que trabajan en mantenimiento predictivo de sistemas de almacenamiento de energía, ya que ofrece una vía reproducible (licencia MIT, exportación ONNX) para estimar RUL con incertidumbre cuantificada. No obstante, el propio autor lo declara como demostración de investigación: los intervalos solo se sostienen para celdas parecidas a las del entrenamiento, y la RUL para químicas o protocolos no vistos es poco fiable. El repositorio no contiene datos de benchmarks ni de idiomas, y el tamaño del repo es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | iTransformer de un solo canal (transformer sobre series temporales con atención invertida), con cabezas de regresión cuantílica multi-horizonte y CQR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: historial de SOH y resúmenes causales de SOH) |
| Tipos de cuantizacion | no disponible (pesos PyTorch y ONNX en precisión original) |
| Idiomas soportados | no disponible (modelo numérico de series temporales, sin componente de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`forecast.pt`, `rul.pt`) y ONNX (`forecast.onnx`, `rul.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea una variante iTransformer de un solo canal: la entrada es el historial de SOH junto con resúmenes causales de SOH, y la salida se produce mediante cabezas de regresión cuantílica directa multi-horizonte para horizontes de 1, 10, 25, 50 y 100 ciclos (tarea `forecast`) y para el número de ciclos hasta el 80 % de SOH (tarea `rul`). La cuantificación de incertidumbre se realiza mediante regresión cuantílica conformalizada (CQR) con intervalos objetivo del 90 %, cuyas correcciones quedan registradas en `deploy_meta.json`.

El entrenamiento se realizó sobre celdas agrupadas de NASA, CALCE y Toyota/MIT-Stanford, con celdas de calibración excluidas del entrenamiento. La cobertura empírica en el conjunto de calibración tras aplicar CQR es de aproximadamente 0.9000 en todas las cabezas (por ejemplo, 0.9000378 para el horizonte de 1 ciclo en `forecast` y 0.9000733 para `rul`), lo que indica que la calibración conformal alcanza la cobertura nominal. No se especifican en la información disponible el número de tokens, la composición detallada del dataset, ni si hubo RLHF o DPO (procedimientos no aplicables a este tipo de modelo).

## Capacidades

- Predicción de SOH multi-horizonte a 1, 10, 25, 50 y 100 ciclos.
- Predicción de RUL: número de ciclos hasta alcanzar el 80 % de SOH.
- Cuantificación de incertidumbre mediante intervalos conformales al 90 % (CQR).
- Detección de out-of-distribution mediante estadísticos registrados en `deploy_meta.json`.
- Exportación ONNX con preprocesado y postprocesado integrados para servir el modelo en producción.
- Entrada numérica de series temporales; no dispone de capacidades de texto, visión, audio, tool calling ni agentes.

## Casos de uso

- Mantenimiento predictivo de flotas de baterías: estimar la RUL de cada celda a partir del historial de SOH y priorizar su sustitución antes de degradar por debajo del 80 % de SOH.
- Planificación de garantías y contratos de servicio: usar los intervalos conformales al 90 % para acotar la vida útil esperada y dimensionar coberturas con incertidumbre explícita.
- Gestión de energía en sistemas estacionarios: programar la reserva de capacidad y las ventanas de recarga en función de la SOH proyectada a 1, 10 y 25 ciclos.
- Investigación en envejecimiento de celdas: comparar curvas de degradación entre químicas y protocolos, usando la cobertura conformal como criterio de validez de las predicciones.
- Integración en pipelines de telemetría: servir `forecast.onnx` y `rul.onnx` con pre/postprocesado integrado para inferencia de baja latencia en entornos con PyTorch u ONNX Runtime.
- Detección de celdas anómalas en producción: emplear los estadísticos OOD de `deploy_meta.json` para marcar celdas cuya distribución no se parece a la del entrenamiento y derivarlas a revisión manual.
- Evaluación de modelos de RUL: usar las celdas de calibración excluidas del entrenamiento como referencia reproducible para comparar alternativas bajo la misma licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la cobertura empírica en el conjunto de calibración tras CQR:

| Tarea | Horizonte | Cobertura observada (objetivo 0.90) |
|---|---|---|
| forecast | 1 | 0.9000378 |
| forecast | 10 | 0.9000680 |
| forecast | 25 | 0.9000476 |
| forecast | 50 | 0.9000713 |
| forecast | 100 | 0.9000758 |
| rul | 0 | 0.9000733 |

No se proporcionan métricas de error (MAE, RMSE, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo es de 0.0 GB y no se especifica el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al tratarse de un transformer pequeño orientado a series temporales, es probable que quepa en GPU de consumo, pero la información proporcionada no lo confirma.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: PyTorch (`forecast.pt`, `rul.pt`) y ONNX Runtime (`forecast.onnx`, `rul.onnx` con pre/postprocesado integrado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye alternativas comparables de la misma categoría (predicción de RUL con iTransformer y CQR), ni datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Uso previsto declarado como demostración de investigación; no está validado para producción crítica.
- Los intervalos conformales solo se sostienen para celdas parecidas a las del entrenamiento.
- La RUL para químicas o protocolos no vistos es poco fiable, según el propio autor.
- Riesgo de alucinación no aplicable en el sentido de lenguaje, pero sí de extrapolación incorrecta fuera de distribución.
- Sesgos conocidos: no disponibles; el modelo está entrenado sobre NASA, CALCE y Toyota/MIT-Stanford, por lo que puede estar sesgado hacia esas químicas y protocolos de ciclado.
- Sin datos de idiomas ni de contexto de texto; es un modelo numérico de series temporales.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantía de exactitud ni de idoneidad para un propósito concreto.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado, lo que indica ausencia de validación comunitaria.
- No se dispone de información sobre parámetros, contexto, cuantizaciones ni latencia, lo que dificulta el dimensionamiento de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anurag6557/battery-rul-itransformer-v2
- Demo Space: https://huggingface.co/spaces/anurag6557/battery-rul-itransformer-v2
- Repositorio de código, benchmark y limitaciones: https://github.com/anuragjha6557/battery-rul-transformers
