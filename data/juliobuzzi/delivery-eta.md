# JulioBuzzi/delivery-eta

## Resumen

`delivery-eta` es un conjunto de modelos de regresión tabular basados en LightGBM que predicen el tiempo de entrega de pedidos de comida y calculan el plazo prometido al cliente con una garantía de puntualidad del 90%. Lo desarrolla JulioBuzzi y se publica bajo licencia MIT en Hugging Face. No es un modelo de lenguaje: es un artefacto de ML supervisado para un problema operativo concreto de logística de última milla.

La innovación principal es la combinación de regresión cuantílica (dos boosters, uno para el cuantil 0,5 y otro para el 0,9) con predicción conformal en línea. El plazo prometido se obtiene como `q90(pedido) + ajuste`, donde el ajuste conformal se recalcula cada hora con las entregas completadas en las últimas 24 horas. Esto permite calibrar la cobertura empírica sin reentrenar el modelo base.

El modelo se entrena y evalúa sobre el dataset público *DoorDash ETA Prediction* (197 mil entregas de enero y febrero de 2015 en seis mercados de EE. UU., con ruido añadido por la empresa). El autor lo presenta explícitamente como referencia metodológica, no como solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM) con dos cabezas de regresión cuantílica (q0,5 y q0,9) más calibración conformal |
| Parametros totales | no disponible (modelos de árboles; el número de hojas y árboles no se detalla en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular con un conjunto fijo de features definido en `config.json`) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como texto plano de LightGBM, `lgb_q50.txt` y `lgb_q90.txt`) |
| Idiomas soportados | portugués (etiqueta de idioma del repositorio; el modelo en sí procesa features tabulares, no texto libre) |
| Licencia | MIT |
| Formato de pesos | ficheros de texto de LightGBM (`lgb_q50.txt`, `lgb_q90.txt`) más `config.json` con features, categorías, ajuste conformal inicial y métricas de test |

## Arquitectura y entrenamiento

El sistema se compone de dos boosters de LightGBM entrenados con pérdida de regresión cuantílica: `lgb_q50.txt` estima la mediana del tiempo de entrega y `lgb_q90.txt` estima el cuantil 0,9, que sirve de base para el plazo prometido. La predicción final añade un ajuste conformal calculado sobre las entregas recientes, de modo que la cobertura empírica se mantiene cerca del 90% aunque la distribución de tiempos derive con el tiempo. El ajuste se recalcula cada hora con las entregas concluidas en las últimas 24 horas (función `conformal_online` del repositorio).

El entrenamiento utiliza el dataset *DoorDash ETA Prediction*, un test técnico público con 197 mil entregas entre el 21 de enero y el 18 de febrero de 2015 en seis mercados estadounidenses, al que DoorDash añadió ruido. La semana de test empleada en la evaluación va del 12 al 18 de febrero de 2015 y contiene 50.210 entregas sin ninguna decisión tomada con esos datos. La información proporcionada no detalla el número de árboles, la profundidad, el learning rate ni el esquema de validación interna de los boosters.

## Capacidades

- Predicción puntual del tiempo de entrega (mediana) a partir de features tabulares del pedido, definidas en `config.json`.
- Estimación del cuantil 0,9 del tiempo de entrega, usada como base del plazo prometido.
- Calibración conformal en línea para mantener la puntualidad objetivo del 90% con datos de las últimas 24 horas.
- Cálculo del plazo prometido al cliente mediante `q90(pedido) + ajuste`.
- Evaluación de puntualidad por franjas de pedido, útil para detectar segmentos con peor cobertura.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio: es un regresor tabular especializado.
- No procesa lenguaje natural; la etiqueta de idioma portugués refleja el idioma de la documentación del repositorio.

## Casos de uso

- Cálculo del plazo prometido en una plataforma de reparto: el sistema recibe las features del pedido y devuelve `q90 + ajuste` conformal, de forma que aproximadamente el 90% de las entregas llegan dentro del plazo mostrado al cliente.
- Monitorización de puntualidad por franjas: la evaluación del autor desglosa la puntualidad por rangos de pedido, lo que permite identificar segmentos donde la cobertura cae (por ejemplo, pedidos con peor desempeño en la regla base, que pasan del 70,6% al 89,1% con este modelo).
- Recalibración horaria en producción: el ajuste conformal se actualiza cada hora con las entregas de las últimas 24 horas, lo que absorbe deriva operativa (tráfico, clima, carga de repartidores) sin reentrenar los boosters.
- Sustitución de reglas heurísticas basadas en estimaciones de plataforma más margen fijo: el modelo reduce el plazo medio de 69,8 a 66,4 minutos y el porcentaje de atrasos superiores a 10 minutos del 5,6% al 4,1% en la semana de test.
- Estimación de mediana para planificación de capacidad: el booster `q50` ofrece una predicción puntual con MAE de 10,3 minutos frente a 12,9 de la regla base, útil para dimensionar turnos de repartidores.
- Referencia metodológica para equipos que quieran replicar el patrón cuantil + conformal en otros dominios tabulares (logística, seguros, demanda), dado que el código y los notebooks están publicados en GitHub.
- Evaluación comparativa de políticas de promesa: al disponer de dos cabezas (mediana y cuantil 0,9) y de un ajuste conformal separado, se pueden simular distintos niveles de servicio ajustando el cuantil o el margen.

## Benchmarks y rendimiento

Evaluación sobre la semana del 12 al 18 de febrero de 2015, con 50.210 entregas:

| Método | Puntualidad (meta 90%) | Plazo medio | Atraso > 10 min | En plazo, peor franja de pedido |
|---|---|---|---|---|
| Regla (estimaciones de la plataforma + margen) | 88,7% | 69,8 min | 5,6% | 70,6% |
| LightGBM mediana + margen | 89,8% | 65,9 min | 4,4% | 86,5% |
| LightGBM cuantílico + conformal (este modelo) | 89,8% | 66,4 min | 4,1% | 89,1% |

El MAE de la mediana es de 10,3 minutos, frente a 12,9 minutos de la regla base. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: LightGBM con dos boosters es ligero; el autor no publica cifras de VRAM ni de RAM, pero por la naturaleza del artefacto (ficheros de texto de árboles) el despliegue es viable en CPU sin GPU.
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles; no son necesarias para la inferencia.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; no se dispone de cifras concretas de modelos de tarjeta.
- Opciones de despliegue: la librería `lightgbm` de Python es la vía documentada (`lgb.Booster(model_file=...)` y `predict`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| delivery-eta (este modelo) | LightGBM cuantílico + conformal | no disponible | no aplica (tabular) | Puntualidad 89,8%, MAE 10,3 min, atraso > 10 min 4,1% | MIT | Hugging Face, GitHub y Space |
| Regla de la plataforma + margen (baseline del autor) | Heurística | no aplica | no aplica | Puntualidad 88,7%, MAE 12,9 min, atraso > 10 min 5,6% | no aplica | Referencia interna del dataset |
| LightGBM mediana + margen (variante del autor) | LightGBM puntual | no disponible | no aplica (tabular) | Puntualidad 89,8%, atraso > 10 min 4,4% | MIT | Mismo repositorio |
| Otros modelos de ETA públicos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas de terceros comparables en la misma tarea y dataset.

## Limitaciones y advertencias

- Entrenado con datos de 2015 de una única plataforma (DoorDash) y con ruido añadido por la empresa; el autor indica explícitamente que debe usarse como referencia de método, no en producción.
- La garantía de puntualidad es en media y presupone que las próximas horas se parecen a las últimas 24 horas; cambios bruscos de distribución (clima extremo, huelgas, picos anómalos) pueden romper la cobertura del 90%.
- El ajuste conformal depende de un flujo horario de entregas completadas; sin ese flujo o con retrasos en la telemetría, el plazo prometido queda descalibrado.
- Es un modelo tabular específico del dominio: no generaliza a otros idiomas, textos ni tareas fuera de la predicción de tiempos de entrega.
- No se publican análisis de sesgo por mercado, tipo de restaurante ni franja horaria más allá de la peor franja agregada; la equidad entre segmentos no está caracterizada.
- Riesgo de alucinación no aplica (no genera texto), pero sí de sobreconfianza si se usa el cuantil 0,9 sin el ajuste conformal.
- Licencia MIT: permite uso comercial y modificación con atribución; no se especifican restricciones adicionales en la información proporcionada.
- Los ficheros de pesos son texto plano de LightGBM, sin versionado de features más allá de `config.json`; cambios en el esquema de features del pipeline (`eta.features.build`) requieren reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JulioBuzzi/delivery-eta
- Repositorio de código, notebooks y evaluación: https://github.com/JulioBuzzi/delivery-eta
- Demo (Space de Hugging Face): https://huggingface.co/spaces/JulioBuzzi/delivery-eta
