# rhs2/prodrome-clock

## Resumen

prodrome-clock es un modelo de clasificación tabular para la alerta temprana horaria de sepsis en unidades de cuidados intensivos (UCI). Ha sido desarrollado por rhs2 como parte del pipeline de código abierto Prodrome, y se ha entrenado exclusivamente con los datos del sistema hospitalario A del corpus PhysioNet/CinC Challenge 2019. Su principal valor reside en la evaluación externa sobre el sistema hospitalario B, que nunca vio durante el entrenamiento, lo que permite medir la capacidad de transferencia entre hospitales.

El modelo procesa 205 características clínicas horarias, incluyendo medidas fisiológicas, órdenes de pruebas, variables de proceso y marcadores temporales. A diferencia de los grandes modelos de lenguaje, no es un transformer generativo, sino un clasificador tabular especializado en series temporales clínicas. Incorpora predicción conforme (conformal prediction) para ofrecer garantías estadísticas sobre la tasa de alertas y la precisión entre pacientes alertados.

Es importante subrayar que se trata de un artefacto de investigación, no de un dispositivo médico. No ha sido aprobado por ningún regulador y no debe utilizarse para informar decisiones clínicas. Su utilidad radica en la reproducción de resultados, la comparación de métodos de alerta temprana y el estudio de la transferencia entre centros hospitalarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular para series temporales horarias (no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas temporales horarias, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (modelo de la libreria prodrome) |

## Arquitectura y entrenamiento

El modelo se integra en el pipeline Prodrome, que gestiona la preparación de datos, el entrenamiento, la calibración y la evaluación. La arquitectura concreta no se detalla en la documentación, pero por el tipo de tarea (clasificación tabular con características clínicas horarias) se trata de un modelo supervisado que combina variables fisiológicas, de proceso y temporales. El entrenamiento se realizó sobre el sistema hospitalario A del corpus PhysioNet/CinC 2019, compuesto por registros de pacientes en UCI con sepsis y controles.

La innovación técnica más destacable es el uso de predicción conforme para seleccionar un umbral de alerta. El umbral no es un valor por defecto: se elige sobre pacientes de calibración reservados como el corte más bajo cuya precisión, en su límite inferior exacto de Clopper-Pearson, supera el mínimo exigido por el operador y cuya tasa de alertas se mantiene dentro del presupuesto. Cuando ningún umbral cumple los requisitos, el modelo opta por no alertar en absoluto, en lugar de ofrecer una garantía que no puede respaldar.

Las ablaciones revelan que el modelo depende sustancialmente de las variables de proceso y del reloj. La combinación de ambas alcanza el 87% de la utilidad del modelo completo, mientras que la fisiología por sí sola solo llega al 47%. Esto indica que el modelo está leyendo en gran medida el patrón de órdenes de pruebas clínicas, que codifica la sospecha del clínico, más que el estado fisiológico del paciente.

## Capacidades

- Predicción horaria de sospecha de sepsis en pacientes de UCI, con una ventana de alerta de seis horas antes del registro clínico de la sospecha.
- Clasificación tabular de series temporales clínicas, con 205 características que incluyen valores fisiológicos, órdenes de laboratorio, variables de proceso y marcadores temporales.
- Predicción conforme con garantías estadísticas: con probabilidad al menos del 95% sobre el sorteo de calibración, se garantiza un máximo de 4.0 alertas por paciente-día y una precisión mínima del 30% entre pacientes alertados.
- Calibración de umbral adaptativa, que puede abstenerse de alertar si no puede sostener la garantía solicitada.
- Evaluación externa sobre un sistema hospitalario nunca visto, demostrando capacidad de transferencia entre centros.
- Detección de casos de sepsis con una mediana de antelación de 45.5 horas en el sitio externo y 30.5 horas en el interno.
- No incluye capacidades de generación de texto, código, visión ni herramientas (tool calling), al ser un modelo tabular clínico.

## Casos de uso

- Investigación académica sobre detección temprana de sepsis: el modelo permite reproducir los resultados reportados y comparar nuevos métodos de alerta temprana sobre un corpus con licencia abierta.
- Estudio de transferencia entre hospitales: al haber sido evaluado en un sistema hospitalario distinto al de entrenamiento, sirve como referencia para investigar la generalización de modelos clínicos entre centros.
- Desarrollo de sistemas de alerta con abstinencia calibrada: la predicción conforme permite estudiar cómo un modelo puede abstenerse de alertar cuando no puede sostener las garantías de precisión y tasa de alertas solicitadas.
- Educación en modelado clínico: el pipeline Prodrome ofrece un flujo reproducible (init, data fetch, data prepare, train, calibrate, eval) ideal para enseñar buenas prácticas en el desarrollo de modelos de salud.
- Comparación de baselines en el corpus PhysioNet/CinC 2019: el modelo proporciona un punto de referencia medido, incluyendo un baseline de solo reloj que alcanza la misma utilidad, útil para contextualizar resultados.
- Análisis de sesgos por subgrupos: la desagregación de resultados por unidad, edad y sexo permite estudiar el rendimiento diferencial del modelo en poblaciones específicas.

## Benchmarks y rendimiento

| Metrica | Sitio B (externo) | Sitio A (interno) |
|---|---|---|
| Utilidad (funcion del challenge) | 0.2413 | 0.2938 |
| AUPRC | 0.047 | 0.080 |
| AUROC | 0.628 | 0.642 |
| Deteccion (ever) | 0.347 | 0.369 |
| Deteccion (in window) | 0.065 | 0.101 |
| Mediana de antelacion | 45.5 h | 30.5 h |
| Alertas por paciente-dia | 0.04 | 0.04 |
| Precision entre alertados | 0.346 | 0.506 |
| Error de calibracion | 0.097 | 0.090 |

Resultados de ablaciones en el sitio B (externo):

| Ablacion | Caracteristicas | Utilidad | Share del total | AUROC | AUPRC | In window | Alertas/pt-dia |
|---|---|---|---|---|---|---|---|
| Completo | 205 | 0.2468 | 100% | 0.8016 | 0.0724 | 0.153 | 0.11 |
| Solo fisiologia | 125 | 0.1159 | 47% | 0.7697 | 0.0604 | 0.117 | 0.08 |
| Solo proceso | 75 | 0.2159 | 87% | 0.7263 | 0.0523 | 0.109 | 0.09 |
| Solo reloj | 3 | 0.2428 | 98% | 0.6656 | 0.0488 | 0.074 | 0.06 |
| Solo trabajo clinico | 72 | 0.2119 | 86% | 0.7539 | 0.0520 | 0.115 | 0.10 |
| Sin indice temporal | 202 | 0.2316 | 94% | 0.7937 | 0.0707 | 0.156 | 0.14 |

Rendimiento por subgrupos en el sitio externo:

| Dimension | Grupo | Pacientes | Septicos | Utilidad | AUROC | Tasa de deteccion |
|---|---|---|---|---|---|---|
| Unidad | MICU | 6,923 | 390 | 0.1658 | 0.542 | 0.251 |
| Edad | 80+ | 2,322 | 129 | 0.1949 | 0.598 | 0.279 |
| Edad | 50-64 | 6,278 | 351 | 0.2268 | 0.612 | 0.316 |
| Edad | <50 | 4,818 | 276 | 0.2351 | 0.610 | 0.341 |
| Sexo | Masculino | 10,732 | 647 | 0.2357 | 0.628 | 0.342 |
| Sexo | Femenino | 9,268 | 495 | 0.2486 | 0.627 | 0.354 |
| Unidad | SICU | 6,982 | 428 | 0.2720 | 0.689 | 0.393 |
| Edad | 65-79 | 6,582 | 386 | 0.2736 | 0.665 | 0.402 |
| Unidad | Desconocida | 6,095 | 324 | 0.2888 | 0.649 | 0.401 |

## Requisitos de hardware

- El modelo es un clasificador tabular de tamaño reducido, por lo que no requiere GPU para inferencia. Puede ejecutarse en CPU convencional.
- No se ha publicado información sobre VRAM estimada ni requisitos específicos de GPU.
- El pipeline completo (descarga de datos, preparación, entrenamiento, calibración y evaluación) puede ejecutarse en un portátil o en una máquina de desarrollo estándar.
- Las opciones de despliegue se limitan al pipeline Prodrome, que se instala mediante `pip install prodrome` y utiliza comandos CLI (`prodrome init`, `prodrome data fetch`, `prodrome train`, `prodrome calibrate`, `prodrome eval`).
- No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia de modelos de lenguaje, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Evaluacion externa | Prediccion conforme |
|---|---|---|---|---|---|
| prodrome-clock | Clasificador tabular clinico | Series temporales horarias | Apache 2.0 | Si (sitio B) | Si |
| Otros modelos del challenge PhysioNet/CinC 2019 | Variados (regresion, arboles, redes) | No especificado | Variable | No especificado | No especificado |
| Modelos de alerta temprana de sepsis en la literatura | Variados | Variable | Variable | No especificado | No especificado |

No se dispone de información suficiente para comparar con modelos concretos de la misma categoría. Los datos proporcionados solo permiten comparar el modelo con su propio baseline de reloj de tres características, que alcanza la misma utilidad (0.2413), y con las variantes de ablación.

## Limitaciones y advertencias

- Este modelo es un artefacto de investigación. No es un dispositivo médico y no ha sido aprobado por ningún regulador. No debe utilizarse para informar decisiones clínicas, triaje ni asignación de recursos.
- Predice una sospecha clínica registrada, no un evento biológico. La etiqueta se activa seis horas antes de que un clínico documente sospecha de infección junto con un aumento en la puntuación SOFA.
- Un baseline que alerta únicamente en función del tiempo de estancia en la UCI alcanza el 100% de la utilidad del modelo completo. La utilidad del modelo se refleja en el ranking, la detección dentro de la ventana y la calibración, no en la puntuación global.
- El modelo depende en gran medida del patrón de órdenes de pruebas clínicas y del reloj. Esto introduce un sesgo de indicación: las pruebas se solicitan en función de la sospecha clínica, por lo que el modelo puede estar codificando la sospecha del clínico en lugar de un estado fisiológico independiente.
- La transferencia solo se ha demostrado entre dos sistemas hospitalarios de un mismo país. No hay evidencia de validez en otros países, poblaciones o entornos clínicos.
- Los tiempos de antelación reportados son generosos y pueden ser engañosos. Una mediana larga refleja en gran medida pacientes marcados temprano en una estancia prolongada, por lo que se reporta también la tasa de detección dentro de la ventana, mucho más estricta.
- El rendimiento es desigual entre subgrupos. En el sitio externo, la utilidad en la unidad MICU es notablemente inferior (0.1658) que en la SICU (0.2720), y el grupo de edad de 80 años o más muestra la utilidad más baja (0.1949) y una tasa de detección del 27.9%.
- El riesgo de alucinación no aplica en el sentido de generación de texto, pero existe riesgo de falsos positivos y falsos negativos en la clasificación clínica. La precisión entre pacientes alertados en el sitio externo es del 34.6%, frente a una tasa base de sepsis de aproximadamente el 7%.
- La licencia Apache 2.0 permite uso comercial, pero la documentación del modelo establece explícitamente que cualquier uso clínico está fuera de alcance.

## Enlaces

- HuggingFace: https://huggingface.co/rhs2/prodrome-clock
- Repositorio del pipeline Prodrome: https://github.com/rhs2/prodrome
- Corpus PhysioNet/CinC Challenge 2019: no se proporciona URL directa en la información disponible.
