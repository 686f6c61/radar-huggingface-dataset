# rhs2/prodrome-lgbm

## Resumen

`prodrome-lgbm` es un modelo de alerta temprana horaria para sepsis en unidades de cuidados intensivos, desarrollado por `rhs2` como parte del pipeline de código abierto [Prodrome](https://github.com/rhs2/prodrome). El modelo se entrena sobre el sistema hospitalario A del corpus PhysioNet/CinC 2019 y se evalúa en el sistema B, que nunca vio durante el entrenamiento, lo que permite medir su capacidad de transferencia entre hospitales. Está diseñado como un artefacto de investigación para reproducir resultados, comparar métodos y estudiar la predicción conforme aplicada a la medicina clínica.

Se trata de un modelo de clasificación tabular basado en LightGBM (gradient boosting con árboles de decisión), que procesa series temporales de pacientes de la UCI con 205 características que incluyen medidas fisiológicas, variables de proceso clínico (pedidos de pruebas, antigüedad de las mediciones) y un índice temporal. No es un modelo de lenguaje ni un sistema de visión, por lo que conceptos como longitud de contexto o cuantización no aplican. La etiqueta que predice no es un evento biológico, sino una sospecha clínica registrada: se activa seis horas antes de que un clínico documente sospecha de infección junto con un aumento en la puntuación SOFA. El modelo incorpora un mecanismo de predicción conforme que ofrece garantías estadísticas sobre la precisión y la tasa de alertas, lo que lo diferencia de muchos modelos clínicos convencionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no de texto) |
| Tipos de cuantizacion | No disponible (modelo tabular, no de red neuronal) |
| Idiomas soportados | No disponible (modelo tabular, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |
| Número de características | 205 |
| Pipeline | tabular-classification |
| Librería | prodrome |

## Arquitectura y entrenamiento

El modelo utiliza LightGBM, un framework de gradient boosting basado en árboles de decisión que crece los árboles de forma leaf-wise, lo que lo hace eficiente para datos tabulares de alta dimensionalidad. En este caso, se aplica a series temporales horarias de pacientes ingresados en la UCI, donde cada registro de paciente se convierte en un vector de características que incluye valores fisiológicos, variables de proceso (por ejemplo, si se ha solicitado una prueba de lactato, y cuánto tiempo ha pasado desde la última medición) y un índice temporal que codifica la duración de la estancia. El entrenamiento se realiza con el corpus PhysioNet/CinC 2019, concretamente con los datos del hospital A, y la evaluación externa se lleva a cabo en el hospital B, que nunca se utilizó durante el entrenamiento.

La etiqueta se define como el momento en que un clínico documenta sospecha de infección junto con un aumento en la puntuación SOFA, activándose seis horas antes de ese evento. Esta definición hace que la etiqueta sea un proxy de la sospecha clínica, no un marcador biológico objetivo. El entrenamiento no incluye RLHF ni DPO, ya que no es un modelo de lenguaje. La innovación técnica más destacable es el uso de predicción conforme (conformal prediction) para seleccionar un umbral de decisión que garantice, con una probabilidad del 95% sobre el conjunto de calibración, que la tasa de alertas se mantiene por debajo de un presupuesto y que la precisión entre pacientes alertados supera un mínimo fijado por el operador. Cuando ningún umbral cumple esas condiciones, la política del modelo es no alertar en absoluto, evitando garantías que no puede sostener.

## Capacidades

- Clasificación tabular de series temporales horarias para la detección temprana de sepsis en la UCI.
- Predicción conforme con garantías estadísticas sobre la tasa de alertas por paciente-día y la precisión entre pacientes alertados.
- Evaluación de transferencia entre hospitales: el modelo se entrena en un centro y se evalúa en otro, lo que permite medir su generalización.
- Análisis de ablaciones de características: puede descomponerse el rendimiento según el tipo de información utilizada (fisiología, proceso, reloj, trabajo clínico).
- Soporte de tool calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no tiene visión ni audio; está especializado en datos tabulares clínicos con series temporales.

## Casos de uso

- Investigación en sistemas de alerta temprana: el modelo permite reproducir los resultados reportados sobre el corpus PhysioNet/CinC 2019, sirviendo como baseline medible para nuevos métodos de detección de sepsis en series temporales clínicas.
- Estudio de transferencia entre hospitales: al entrenar en el hospital A y evaluar en el B, el modelo es útil para investigar cómo se comportan los sistemas de alerta temprana cuando se aplican a poblaciones distintas, un problema crítico para la adopción de modelos clínicos.
- Comparación de métodos de predicción conforme: la implementación de Prodrome ofrece un marco para estudiar cómo se pueden establecer umbrales con garantías de precisión y tasa de alertas, y para comparar distintas estrategias de abstinencia calibrada.
- Educación en informática médica: el modelo y sus ablaciones permiten ilustrar cómo las variables de proceso (pedidos de pruebas, antigüedad de las mediciones) codifican la sospecha clínica, un concepto clave en el diseño de sistemas de apoyo a la decisión.
- Análisis de sesgos por subgrupos: el desglose de rendimiento por edad, sexo y tipo de unidad (MICU, SICU) permite estudiar dónde falla el modelo, como en pacientes mayores de 80 años o en la unidad médica, y diseñar mitigaciones.
- Evaluación de metodologías de calibración: el modelo reporta el error de calibración en la evaluación externa, lo que lo convierte en un caso de estudio para técnicas de calibración de probabilidades en clasificadores tabulares clínicos.
- Desarrollo de pipelines de ML para salud: el repositorio Prodrome proporciona una referencia práctica de cómo estructurar un pipeline reproducible para datos clínicos, desde la descarga del corpus hasta el entrenamiento, la calibración y la evaluación.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los reportados por el autor en la model card, medidos con `prodrome eval` sobre el corpus `ef46d3e6ec24` con split seed 7. No se han publicado comparaciones con otros modelos en la información disponible.

Resultados principales:

| Evaluado en | Utilidad | AUPRC | AUROC | Detección (alguna vez) | Detección (en ventana) | Mediana de antelación | Alertas por paciente-día | Precisión entre alertados | Error de calibración |
|---|---|---|---|---|---|---|---|---|---|
| Sitio B (externo, nunca entrenado) | 0.2468 | 0.072 | 0.802 | 0.456 | 0.153 | 33.0 h | 0.11 | 0.305 | 0.003 |
| Sitio A (interno) | 0.3338 | 0.109 | 0.834 | 0.573 | 0.207 | 23.0 h | 0.17 | 0.332 | 0.004 |

Ablaciones de características (medidas en el sitio B externo):

| Ablación | N.º de características | Utilidad | Share de utilidad | AUROC | AUPRC | Detección en ventana | Alertas por paciente-día |
|---|---|---|---|---|---|---|---|
| Completo | 205 | 0.2468 | 100% | 0.8016 | 0.0724 | 0.153 | 0.11 |
| Solo fisiología | 125 | 0.1159 | 47% | 0.7697 | 0.0604 | 0.117 | 0.08 |
| Solo proceso | 75 | 0.2159 | 87% | 0.7263 | 0.0523 | 0.109 | 0.09 |
| Solo reloj | 3 | 0.2428 | 98% | 0.6656 | 0.0488 | 0.074 | 0.06 |
| Solo trabajo clínico | 72 | 0.2119 | 86% | 0.7539 | 0.0520 | 0.115 | 0.10 |
| Sin índice temporal | 202 | 0.2316 | 94% | 0.7937 | 0.0707 | 0.156 | 0.14 |

Desglose por subgrupos en el sitio externo:

| Dimensión | Grupo | Pacientes | Sépticos | Utilidad | AUROC | Tasa de detección |
|---|---|---|---|---|---|---|
| Unidad | MICU | 6,923 | 390 | 0.2002 | 0.787 | 0.433 |
| Edad | 80+ | 2,322 | 129 | 0.2016 | 0.814 | 0.403 |
| Edad | 50-64 | 6,278 | 351 | 0.2274 | 0.800 | 0.427 |
| Edad | Menos de 50 | 4,818 | 276 | 0.2356 | 0.788 | 0.457 |
| Sexo | Masculino | 10,732 | 647 | 0.2407 | 0.797 | 0.456 |
| Unidad | Desconocida | 6,095 | 324 | 0.2499 | 0.818 | 0.426 |
| Sexo | Femenino | 9,268 | 495 | 0.2548 | 0.807 | 0.457 |
| Unidad | SICU | 6,982 | 428 | 0.2855 | 0.810 | 0.500 |
| Edad | 65-79 | 6,582 | 386 | 0.2867 | 0.809 | 0.500 |

## Requisitos de hardware

- No requiere VRAM: al ser un modelo tabular basado en LightGBM, se ejecuta completamente en CPU.
- El corpus de datos utilizado pesa aproximadamente 42 MB, por lo que los requisitos de memoria son muy modestos.
- Cualquier CPU moderna es suficiente para entrenar, calibrar y evaluar el modelo con el pipeline `prodrome`.
- Opciones de despliegue: la interfaz principal es la CLI de `prodrome` (comandos `init`, `data fetch`, `data prepare`, `train`, `calibrate`, `eval`), además de la integración directa en Python.
- Latencia y throughput: no disponemos de mediciones publicadas, pero al tratarse de un clasificador LightGBM, la inferencia es extremadamente rápida en comparación con modelos de redes neuronales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de alerta temprana de sepsis, ni con otros clasificadores tabulares clínicos. El autor presenta resultados internos y de transferencia, pero no una comparativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación. No es un dispositivo médico, no ha sido aprobado por ningún regulador y no debe utilizarse para tomar decisiones clínicas.
- La etiqueta predice una sospecha clínica documentada, no un evento biológico. La etiqueta se activa seis horas antes de que un clínico registre sospecha de infección junto con un aumento del SOFA, lo que la convierte en un proxy.
- Un modelo de solo tres características basado en el tiempo de estancia alcanza el 98% de la utilidad del modelo completo (0.2428 vs 0.2468). Esto sugiere que el valor añadido del modelo es limitado y que la métrica de utilidad del challenge recompensa la duración de la estancia.
- El modelo se apoya en gran medida en el trabajo clínico (pedidos de pruebas) y en el reloj, no en la fisiología. Las ablaciones muestran que las variables de proceso y el reloj alcanzan el 87% de la utilidad, mientras que la fisiología sola solo llega al 47%. Esto implica que el modelo está leyendo la sospecha clínica codificada en los pedidos, no necesariamente el estado del paciente.
- La validación externa se limita a dos sistemas hospitalarios de un mismo país. No se puede generalizar a otras poblaciones ni entornos.
- Las antelaciones reportadas son generosas: la mediana de 33 horas en el sitio B refleja en gran medida pacientes detectados temprano en estancias largas. La tasa de detección en ventana estricta es solo del 15.3%, un dato que debe leerse junto con la mediana.
- El rendimiento es peor en pacientes mayores de 80 años (utilidad 0.2016) y en la unidad MICU (0.2002), lo que indica sesgos por edad y tipo de unidad.
- Queda fuera de alcance cualquier uso clínico, cualquier despliegue que informe el cuidado de pacientes, cualquier triaje o asignación de recursos, y cualquier afirmación sobre poblaciones diferentes a las del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rhs2/prodrome-lgbm
- Repositorio de Prodrome: https://github.com/rhs2/prodrome
