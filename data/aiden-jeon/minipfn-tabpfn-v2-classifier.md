# aiden-jeon/minipfn-tabpfn-v2-classifier

## Resumen

minipfn TabPFN v2 classifier es una reimplementación desde cero del clasificador TabPFN v2 descrito por Hollmann et al. en *Nature* (2025). Lo desarrolla Aiden-Jeon como parte del proyecto de código abierto minipfn y se distribuye con licencia Apache-2.0. No es el checkpoint oficial de PriorLabs: usa código y pesos propios, entrenados sobre el prior sintético abierto de TabICL.

El modelo resuelve el problema de la clasificación tabular en conjuntos de datos pequeños mediante aprendizaje en contexto (in-context learning). En lugar de entrenar pesos con los datos del usuario, el modelo recibe las filas de entrenamiento como contexto en el propio prompt y predice directamente sobre las filas de test. Esto elimina la necesidad de ajuste fino y reduce el coste computacional en escenarios con pocas muestras.

Técnicamente es un transformer de 12 capas y 7.244.746 parámetros, con atención alternada sobre características y sobre filas, que admite hasta 10 clases, cualquier número de características y hasta 2.048 filas de entrenamiento. Su relevancia radica en que reproduce, con recursos modestos (unas 370 H100-horas), un modelo fundacional tabular publicado en *Nature*, y en que publica de forma transparente las curvas de entrenamiento, los resultados por dataset y las limitaciones observadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer TabPFN v2 (atención sobre características y sobre filas) |
| Parámetros totales | 7.244.746 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2.048 filas de entrenamiento y hasta 160 características (entrenamiento); en inferencia, cualquier número de filas y características según la model card |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo tabular, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 12 capas con dimensión de embedding 192, 6 cabezas de atención y MLP de 4× la dimensión de embedding. Cada capa aplica primero atención entre características y después atención entre filas, con post-LayerNorm sin parámetros afines. Cada token representa 2 características. La salida cubre hasta 10 clases.

El entrenamiento usa el prior de grafos SCM de TabICL con las reglas de tamaño de tabla del paper: filas de entrenamiento uniformes entre 1 y 2.048 más 128 filas reservadas, número de características muestreado de una Beta(0,95; 8,0) escalada a 1–160, menos de 75.000 celdas por tabla y, en el 30 % de las tablas, valores ausentes al azar con tasa 0–30 %. Se entrenaron 500.000 pasos con batch de 64 tablas, Adam con lr 2e-4, 10.000 pasos de warmup y schedule coseno sobre 2M pasos, en bf16 y con clipping de gradiente 1,0. El cómputo fue de 8×H100 para los pasos 0–300k y 16×H100 para 300k–500k, unas 35 horas de reloj y aproximadamente 370 H100-horas. La pérdida colapsó cuatro veces y un guard automático reanudó desde estados sanos guardados 2k–4k pasos antes. La cross-entropy de validación final es 0,740.

En inferencia se usa un ensemble de 4 miembros según los valores por defecto del paper: cada miembro baraja características y clases, añade una columna aleatoria de identificador de fila y alterna entre características por cuantiles más componentes SVD y una transformación de potencia Yeo-Johnson. La temperatura del softmax es 0,9.

## Capacidades

- Clasificación tabular supervisada con hasta 10 clases.
- Aprendizaje en contexto: `fit` no entrena pesos, solo ajusta el preprocesado de cada miembro del ensemble sobre las filas de entrenamiento.
- Soporte de cualquier número de características y de filas en inferencia (el entrenamiento cubrió hasta 160 características y 2.048 filas).
- Manejo de valores ausentes, ya que el 30 % de las tablas de entrenamiento incluían missing values al azar.
- Acepta DataFrames de pandas con columnas categóricas.
- Salida de probabilidades por clase mediante `predict_proba`, con columnas en el orden de `clf.classes_`.
- No soporta regresión: el regresor es un modelo separado.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Clasificación de clientes en tablas pequeñas de CRM: con unas pocas miles de filas y decenas de variables, el modelo predice la probabilidad de conversión o abandono sin entrenamiento adicional, usando las filas históricas como contexto.
- Triaje clínico preliminar sobre datos tabulares de pacientes: adecuado cuando el conjunto es pequeño y contiene valores ausentes, gracias al entrenamiento con missing values al azar y a la ventana de 2.048 filas.
- Detección de fraude en transacciones con pocas muestras etiquetadas: el aprendizaje en contexto permite obtener probabilidades calibradas sin reentrenar y sin GPU de gran tamaño, dado el reducido número de parámetros.
- Clasificación de riesgo crediticio en entidades con datos limitados: el modelo produce `predict_proba` directamente utilizable para umbrales de decisión, con soporte de variables categóricas vía pandas.
- Prototipado rápido en ciencia de datos: sustituye el ciclo de entrenamiento y validación por un `fit` que solo ajusta el preprocesado, lo que acelera la experimentación sobre los 29 datasets de AMLB.
- Evaluación comparativa de pipelines tabulares: al replicar el benchmark del paper con `scripts/eval_tabpfn_v2.py`, sirve como referencia reproducible para contrastar preprocesados y estrategias de imputación.
- Clasificación de imágenes representadas como características tabulares agregadas (por ejemplo, descriptores de forma o textura), siempre que el número de características no supere el rango de entrenamiento.

## Benchmarks y rendimiento

Evaluación sobre los 29 datasets de clasificación de AMLB, con ROC AUC media sobre los 10 folds de OpenML:

| Checkpoint | ROC AUC media |
|---|---|
| 100k pasos | 0,9169 |
| 200k pasos | 0,9222 |
| 300k pasos | 0,9203 |
| 400k pasos | 0,9196 |
| 500k pasos (este modelo) | 0,9235 |
| Paper (TabPFN v2) | 0,9323 |

Brecha por dataset frente al paper:

| Dataset | Brecha |
|---|---|
| philippine (5.832 filas × 308 características) | −0,105 |
| GesturePhaseSegmentationProcessed | −0,047 |
| wine-quality-white | −0,025 |

Excluyendo philippine, GesturePhaseSegmentationProcessed, wine-quality-white, kc1 y first-order-theorem-proving, la brecha media es de −0,002.

## Requisitos de hardware

- El modelo tiene 7,2 M de parámetros, por lo que los pesos en fp32 ocupan unos 29 MB y en bf16 unos 14 MB; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada para inferencia: menos de 1 GB para los pesos; el consumo real depende del tamaño de la tabla de contexto (hasta 2.048 filas × 160 características) y del ensemble de 4 miembros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; para tablas grandes se recomienda una RTX 4090, A100 o H100 por margen y velocidad.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Despliegue: el paquete `minipfn` se instala con `uv pip install "minipfn @ git+https://github.com/Aiden-Jeon/minipfn"`; la inferencia se hace vía `minipfn.tabpfn_v2.hub.from_pretrained` y `TabPFNv2Classifier`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / filas | ROC AUC AMLB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minipfn TabPFN v2 classifier (este) | 7,2 M | hasta 2.048 filas, 160 características | 0,9235 | Apache-2.0 | HuggingFace + GitHub |
| TabPFN v2 oficial (PriorLabs) | no disponible | no disponible | 0,9323 | no disponible en la información | GitHub PriorLabs/TabPFN |
| TabICL | no disponible | no disponible | no disponible | BSD-3-Clause (prior) | GitHub soda-inria/tabicl |

## Limitaciones y advertencias

- El dataset philippine queda unas 0,10 por debajo del paper en todos los checkpoints de 100k a 500k; limitar columnas (500, 300 o 160) o filas de entrenamiento (4.096 o 2.048) no corrige la brecha y la causa es desconocida.
- El comportamiento puede variar entre checkpoints: en mfeat-factors, los checkpoints de 300k y 400k puntúan 0,94 en los 10 folds, mientras que 200k y 500k puntúan 1,00.
- La atención entre filas se vuelve muy concentrada durante el entrenamiento, con cabezas que asignan casi todo el peso a una sola fila (attention sink); es la causa probable de los cuatro colapsos de pérdida.
- Solo clasificación; la regresión requiere un modelo separado.
- No es el checkpoint oficial de TabPFN v2 y no usa código ni pesos oficiales, por lo que los resultados no son directamente intercambiables con los de PriorLabs.
- El modelo no maneja texto ni otros dominios no tabulares; no hay capacidades multilingües ni de generación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas en tablas fuera de la distribución de entrenamiento (más de 160 características, más de 2.048 filas o más de 10 clases).
- Licencia Apache-2.0: permite uso comercial, pero el prior de entrenamiento procede de TabICL (BSD-3-Clause), sin que se incluya código de TabICL en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/aiden-jeon/minipfn-tabpfn-v2-classifier
- Repositorio de código: https://github.com/Aiden-Jeon/minipfn
- Paper TabPFN v2 (Nature): https://doi.org/10.1038/s41586-024-08328-6
- TabPFN oficial (PriorLabs): https://github.com/PriorLabs/TabPFN
- Prior TabICL: https://github.com/soda-inria/tabicl
