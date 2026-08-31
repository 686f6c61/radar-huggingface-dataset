# JunYoungLee/ut-depth-probe-artifacts

## Resumen

Este repositorio no contiene un modelo de lenguaje en sí, sino un conjunto de artefactos crudos de investigación: activaciones y estados ocultos registrados al ejecutar un modelo de lenguaje recurrente en profundidad (*depth-recurrent*, también llamado *looped transformer* o *universal transformer*) muy por encima del número de recurrencias con el que fue entrenado. El modelo base es `ByteDance/Ouro-1.4B`, un transformer de 24 capas decodificadoras que se aplican repetidamente sobre el mismo flujo residual, con un total de pasos de recurrencia entrenado de 4. Los artefactos empujan ese número hasta 20 y conservan todos los estados intermedios.

El autor, JunYoungLee, publica estos datos como material de investigación para estudiar qué ocurre internamente cuando un modelo de este tipo extrapola su profundidad de recurrencia. La medición principal muestra que la precisión en GSM8K y MATH-500 alcanza su máximo en el bucle 4 (la profundidad entrenada) y luego cae de forma monótona, sin meseta ni segundo pico, hasta degenerar en repetición cerca del bucle 20. El repositorio incluye los scripts que generaron cada grupo de datos y un protocolo fijado para garantizar la comparabilidad entre archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador aplicado recurrentemente (looped/depth-recurrent) sobre el modelo base ByteDance/Ouro-1.4B |
| Parametros totales | No disponible (el repositorio contiene activaciones, no pesos; el modelo base tiene 1.4B) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica; el modelo base tiene una ventana estándar, pero los artefactos no la documentan) |
| Tipos de cuantizacion | No disponible (los tensores se almacenan en formato nativo, probablemente bfloat16 según el protocolo de generación) |
| Idiomas soportados | No disponible (no se indican en la model card; el modelo base es multilingüe pero no se detalla) |
| Licencia | other (no especificada) |
| Formato de pesos | No aplica (son tensores de activación en archivos `.npz`; el repositorio también incluye scripts y resultados) |

## Arquitectura y entrenamiento

El modelo subyacente es `ByteDance/Ouro-1.4B`, un transformer con 24 capas decodificadoras que se aplican repetidamente al mismo flujo residual, un diseño conocido como *depth-recurrent* o *looped transformer*. En este paradigma, los mismos pesos se reutilizan en cada paso de recurrencia, lo que permite en principio profundizar el razonamiento sin aumentar el número de parámetros. El modelo fue entrenado con `total_ut_steps = 4`, es decir, cada token pasa por las 24 capas 4 veces. Los artefactos aquí publicados extienden ese número hasta 20 pasos por token, conservando los estados ocultos de cada bucle.

El entrenamiento del modelo base no se documenta en esta model card; se asume que sigue el procedimiento estándar de Ouro (preentrenamiento autoregresivo, posiblemente con fases de ajuste). Lo relevante de este repositorio es el experimento de extrapolación: se fuerza una recurrencia mayor que la entrenada y se registran las activaciones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación en la información disponible.

## Capacidades

- No es un modelo generativo: no se puede usar para generar texto, responder preguntas ni realizar tareas de razonamiento.
- Contiene activaciones de capas intermedias (estados ocultos) para cada paso de recurrencia (1 a 20) sobre conjuntos de evaluación GSM8K, MATH-500 y AIME24.
- Incluye scripts de reproducción para cada grupo de datos (`loopedtransformer_probe`, `loopedtransformer_forced_depth`, `loopedtransformer_analysis`).
- Proporciona un protocolo fijado (revisión del modelo, dtype, presupuesto de generación, caché de prefijo desactivada) para garantizar comparaciones válidas entre archivos.
- Los datos permiten analizar la degradación del rendimiento con la profundidad de recurrencia, incluyendo la pérdida de terminación y la degeneración en repetición.

## Casos de uso

- Investigación en interpretabilidad mecanicista: los tensores de activación permiten estudiar cómo se distribuye la información a lo largo de los bucles recurrentes y por qué el rendimiento cae al superar la profundidad entrenada.
- Análisis de extrapolación en modelos recurrentes: los datos de precisión frente a profundidad (bucle 1 a 20) sirven para validar teorías sobre el límite de profundidad efectiva en transformers con pesos compartidos.
- Desarrollo de métodos de diagnóstico de degeneración: las secuencias que dejan de terminar y caen en repetición pueden usarse para entrenar detectores de fallos de generación.
- Reproducción de experimentos de *looped transformers*: los scripts incluidos permiten regenerar la curva de precisión en minutos por profundidad, facilitando la verificación de resultados.
- Estudio de la relación entre profundidad de razonamiento y exactitud en tareas matemáticas: la curva GSM8K y MATH-500 muestra un pico en el bucle 4 y una caída posterior, útil para investigar el equilibrio entre profundidad y estabilidad.
- Evaluación de protocolos de comparación en investigación: el repositorio documenta explícitamente qué condiciones deben coincidir para comparar archivos (revisión del modelo, presupuesto de generación, etc.), sirviendo como referencia metodológica.

## Benchmarks y rendimiento

La model card incluye una tabla de precisión frente a profundidad de recurrencia forzada, con el protocolo indicado (bfloat16, greedy, temperatura 0, sin caché de prefijo, presupuestos de generación específicos). Los resultados son los siguientes:

| Bucles | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **GSM8K** (exact_match, flexible-extract) | 0.2032 | 0.6346 | 0.7589 | 0.7900 | 0.7756 | 0.7415 | 0.7293 | 0.7074 | 0.6717 | 0.5914 | 0.5133 | 0.4253 | 0.2555 | 0.1077 | 0.0167 |
| **MATH-500** (math_verify, none) | 0.2440 | 0.6120 | 0.7120 | 0.7320 | 0.7160 | 0.7200 | 0.6900 | 0.6700 | 0.6280 | 0.5340 | 0.4060 | 0.2860 | 0.1480 | — | — |
| **AIME24** (exact_match, none) | 0.0000 | 0.0000 | 0.1000 | 0.1000 | 0.0333 | 0.0667 | 0.1000 | 0.0667 | 0.0333 | 0.0333 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |

El pico de rendimiento en GSM8K y MATH-500 se produce en el bucle 4 (la profundidad entrenada) y decae de forma monótona después. En AIME24 (solo 30 documentos) la curva es mayormente cero y aporta poca información. No se proporcionan comparaciones con otros modelos en estos datos.

## Requisitos de hardware

- El repositorio ocupa 162 GB en disco, por lo que se necesita almacenamiento suficiente para descargarlo y procesarlo.
- Los tensores de activación se generaron con GPU (horas de cómputo), pero el análisis posterior puede realizarse en CPU si se cargan selectivamente.
- Para reproducir la barrida de profundidad (precisión frente a bucles) se requieren minutos por profundidad en una GPU moderna (por ejemplo, A100, RTX 4090 o similar).
- El grupo `loopedtransformer_probe` es el más costoso: contiene los estados ocultos por bucle y requiere horas de GPU para regenerarse.
- No se indican requisitos mínimos de VRAM; al tratarse de activaciones, el consumo dependerá del tamaño de los lotes y de si se cargan en memoria completa o de forma incremental.
- Los scripts incluidos permiten un procesamiento por lotes para evitar pérdidas de datos en entornos con pods efímeros.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otras alternativas; es un conjunto de artefactos de investigación asociados a un experimento específico sobre un modelo base concreto (ByteDance/Ouro-1.4B). No se han publicado comparaciones con otros conjuntos de activaciones o experimentos de recurrencia en la información disponible.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos entrenados ni puede generar texto; solo activaciones y resultados de evaluación.
- Los artefactos se publican "as-is" (tal cual), sin curado ni garantías de calidad; el autor lo indica explícitamente.
- Hay dos archivos de tensores conocidos como corruptos en una colección anterior (bucles=6): `probe-math500-100-loops6-full/tensors/doc94.npz` (BadZipFile) y `probe-aime24-loops6-full/tensors/doc3.npz` (falla CRC al leer). El código de análisis debe detectarlos y reducir la `n` en lugar de fallar silenciosamente.
- La licencia es "other" sin especificar, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar al autor antes de usarlo en proyectos con fines lucrativos.
- Los resultados de rendimiento solo son válidos bajo el protocolo fijado (revisión del modelo, presupuesto de generación, caché de prefijo desactivada). Comparar archivos de diferentes condiciones invalida las conclusiones.
- La extrapolación a profundidades superiores a 4 muestra una degradación severa; no debe interpretarse como una capacidad de "pensar más" del modelo.
- No se documentan sesgos ni alucinaciones del modelo base, pero al ser un artefacto de investigación no se recomienda su uso en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JunYoungLee/ut-depth-probe-artifacts
