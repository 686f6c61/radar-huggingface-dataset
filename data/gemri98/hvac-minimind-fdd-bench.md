# GeMri98/hvac-minimind-fdd-bench

## Resumen

MiniMind 64M fine-tuned on HVAC-FDD-Bench v1 es un conjunto de tres modelos de lenguaje de 64 millones de parámetros entrenados desde pesos aleatorios con el framework MiniMind (commit 96de892) y ajustados para la detección y diagnóstico de fallos (FDD, fault detection and diagnosis) en sistemas HVAC. Lo publica el usuario GeMri98 junto con un benchmark abierto, hvac-fdd-bench, que compara los modelos con alternativas tabulares clásicas (gradient boosting, random forest, MLP, regresión logística, k-NN) sobre datos simulados de un edificio.

El interés del artefacto es metodológico más que de rendimiento: el autor mide si un LLM pequeño entrenado desde cero puede competir con modelos tabulares en una tarea de clasificación de series temporales de climatización. El mejor modelo MiniMind (B1, preentrenamiento de dominio más SFT) alcanza un 67,0 % de diagnósticos correctos con un 25,5 % de falsas alarmas en días sanos, por debajo del gradient boosting con log y residuos (77,5 %) y del random forest (71,9 %), pero por encima de la línea base de clase mayoritaria (28,6 %).

La relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible para FDD en HVAC con intervalos de confianza; por otro, documenta con transparencia las limitaciones de usar LLMs de 64M en datos tabulares y series temporales, incluyendo el coste en falsos positivos. Los datos proceden de un único edificio simulado, un clima y un año meteorológico, y no se han validado en un edificio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (framework MiniMind, commit 96de892) |
| Parametros totales | 64 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 0,6 GB) |

## Arquitectura y entrenamiento

Los tres modelos son instancias de MiniMind de 64M de parámetros, una arquitectura transformer decoder-only entrenada desde pesos aleatorios (no derivada de un modelo preentrenado mayor). El autor describe dos variantes de entrenamiento: (A) SFT directo desde cero y (B1, B2) preentrenamiento de dominio seguido de SFT. Las entradas son representaciones de la señal de registro (log) y de los residuos del modelo de referencia del sistema HVAC, y la salida es el diagnóstico de fallo.

El benchmark se construyó sobre un edificio simulado con un único clima y un año meteorológico. La evaluación reporta el porcentaje de diagnósticos correctos con intervalos de confianza del 95 % a nivel de día y de semana, el porcentaje de falsas alarmas en días sanos, el porcentaje de días con fallo detectados y el macro-F1 por tipo de fallo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación y diagnóstico de fallos en sistemas HVAC a partir de logs y residuos de un modelo de referencia.
- Detección binaria de días con fallo (faulty days detected) con tasas superiores al 97 % en la variante B1.
- Clasificación multietiqueta por tipo de fallo (macro-F1 de hasta 83,9 % en B1).
- Entrenamiento desde cero con preentrenamiento de dominio sobre datos de climatización.
- No se documentan capacidades de tool calling, function calling, agentes, multimodalidad ni multilingüismo.
- No se documenta un modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Monitorización de plantas enfriadoras en edificios terciarios: el modelo puede clasificar el estado de la máquina a partir de los residuos del modelo de referencia y emitir un diagnóstico por día; su utilidad real depende de reducir el 25,5 % de falsas alarmas de la variante B1.
- Investigación reproducible en FDD: el benchmark hvac-fdd-bench y los tres checkpoints permiten comparar nuevas arquitecturas contra líneas base tabulares con intervalos de confianza publicados.
- Detección de fallos en cadenas de suministro de aire (AHU): la variante B1 detecta el 97,3 % de los días con fallo, lo que la hace adecuada como capa de alerta temprana combinada con un umbral de falsas alarmas.
- Clasificación del tipo de fallo para priorizar mantenimiento: el macro-F1 de 83,9 % en B1 permite enrutar órdenes de trabajo según la categoría de avería detectada.
- Estudio de destilación y modelos pequeños: sirve como referencia de hasta dónde llega un transformer de 64M frente a gradient boosting en datos tabulares y series temporales.
- Docencia y prototipado: el tamaño de 0,6 GB del repositorio facilita desplegar el modelo en entornos de laboratorio y reproducir el pipeline de preentrenamiento de dominio más SFT.
- Evaluación de falsos positivos en producción: el benchmark mide explícitamente las falsas alarmas en días sanos, lo que permite calibrar el coste operativo antes de un despliegue.

## Benchmarks y rendimiento

Resultados del leaderboard publicado por el autor (diagnóstico correcto % con IC 95 % a nivel de día):

| Puesto | Modelo | Tipo | Entrada | Diagnóstico correcto % | Falsas alarmas % | Días con fallo detectados % | Macro-F1 % |
|---|---|---|---|---|---|---|---|
| 1 | Gradient boosting, log + residuos | Tabular | log + residuos | 77,5 [74,4; 80,7] | 10,9 | 93,8 | 87,9 |
| 2 | MLP (64-64) | Tabular | residuos | 72,3 [68,9; 75,6] | 15,1 | 94,4 | 84,8 |
| 3 | Random forest | Tabular | residuos | 71,9 [68,3; 75,3] | 3,6 | 86,5 | 86,9 |
| 7 | MiniMind 64M, preentrenamiento de dominio + SFT (B1) | LLM desde cero | log + residuos | 67,0 [63,2; 70,7] | 25,5 | 97,3 | 83,9 |
| 10 | MiniMind 64M, desde cero, SFT (A) | LLM desde cero | log + residuos | 53,4 [49,7; 57,3] | 40,6 | 98,3 | 81,2 |
| 11 | MiniMind 64M, preentrenamiento de dominio + SFT (B2) | LLM desde cero | log | 51,5 [47,3; 55,4] | 48,4 | 85,6 | 66,1 |
| 12 | Clase mayoritaria | Tabular | residuos | 28,6 [25,3; 31,8] | 0,0 | 0,0 | 7,4 |

Solo el random forest, el gradient boosting con umbral sano y el gradient boosting con residuos cumplen el criterio de "usable" del autor (falsas alarmas ≤ 10 %). Ninguna variante MiniMind lo cumple.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 64M de parámetros, en fp16 el peso ronda los 0,13 GB, pero el formato de pesos no está documentado.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: muy probablemente sí por tamaño, pero no hay requisitos publicados que lo confirmen.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Diagnóstico correcto % | Falsas alarmas % | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMind 64M FDD (B1) | 64M | no disponible | 67,0 | 25,5 | Apache 2.0 | Hugging Face |
| Gradient boosting (log + residuos) | no aplica | no aplica | 77,5 | 10,9 | no disponible | Línea base del benchmark |
| Random forest | no aplica | no aplica | 71,9 | 3,6 | no disponible | Línea base del benchmark |
| MLP (64-64) | no aplica | no aplica | 72,3 | 15,1 | no disponible | Línea base del benchmark |

La comparación relevante no es con otros LLM, sino con los modelos tabulares del propio benchmark, que superan al MiniMind en precisión y en tasa de falsas alarmas.

## Limitaciones y advertencias

- Los resultados provienen de un edificio simulado, un único clima y un año meteorológico; no hay validación en edificios reales.
- La variante B1 presenta un 25,5 % de falsas alarmas en días sanos, muy por encima del umbral del 10 % que el propio autor considera usable.
- No se documentan sesgos conocidos, pero al entrenarse desde cero sobre datos simulados puede no generalizar a otras plantas, climas o regímenes de operación.
- Riesgo de alucinación no evaluado en la información disponible; el modelo se usa como clasificador, no como generador de texto libre.
- No se documentan idiomas soportados ni longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación en campo desaconseja su uso en producción sin una evaluación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeMri98/hvac-minimind-fdd-bench
- Leaderboard del benchmark: https://huggingface.co/datasets/GeMri98/hvac-fdd-bench
