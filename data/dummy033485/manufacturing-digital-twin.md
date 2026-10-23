# dummy033485/manufacturing-digital-twin

## Resumen

`dummy033485/manufacturing-digital-twin` no es un modelo de lenguaje: es un artefacto de investigación reproducible publicado en HuggingFace que contiene un estimador de desgaste de herramienta (Random Forest entrenado con scikit-learn), un gemelo digital de eventos discretos construido con SimPy y los datos derivados de un estudio de políticas de mantenimiento sobre el NASA PCoE Milling Data Set (UC Berkeley BEST Lab: 16 casos, 167 pasadas, 6 canales de sensor por pasada, desgaste de flanco VB medido). Lo firma Zain, autor con perfil de Ingeniería Mecánica + IA, y se enmarca en las líneas de investigación del MOSAIC Lab (Dr. Michail Katsigiannis, Department of Mechanical Engineering, University of South Carolina): sensórica de planta, simulación para operaciones en tiempo real, gemelos digitales y soporte a la decisión.

El problema que aborda es concreto: estimar el desgaste VB por corte a partir de características extraídas de señales de sensor y cuantificar, mediante simulación, cuánto mejora una política de mantenimiento basada en condición frente a run-to-failure o intervalo fijo en una línea fresado → inspección → ensamblaje. El resultado transferible no es el rendimiento absoluto (datos de laboratorio con desgaste acelerado), sino el ranking de políticas: el mantenimiento basado en condición elimina las paradas no planificadas y reduce el scrap a menos de la mitad, a cambio de más cambios de herramienta planificados.

Es relevante ahora por su valor como base reproducible y como caso de estudio honesto sobre el coste del ruido del estimador: el autor publica tanto los RMSE de validación cruzada por caso y por condición como el análisis de sensibilidad al reducir la sigma del estimador a la mitad. El repositorio ocupa menos de 0,1 GB según HuggingFace, tiene licencia MIT, 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal generativa: ensemble de Random Forest (scikit-learn) para regresión de desgaste VB + gemelo digital de eventos discretos en SimPy (3 etapas: fresado, inspección, ensamblaje) |
| Parámetros totales | No disponible (el autor no publica número de árboles, profundidad ni recuento de nodos de `wear_rf.pkl`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de secuencia) |
| Tipos de cuantización | No aplica (no hay pesos neuronales que cuantizar) |
| Idiomas soportados | No disponible (no es un modelo lingüístico; el código y la documentación están en inglés) |
| Licencia | MIT |
| Formato de pesos | Pickle de scikit-learn (`wear_rf.pkl`) + JSON (`twin_report.json`, `wear_model.json`) + CSV (`milling_runs.csv`) |
| Dataset de origen | NASA PCoE Milling Data Set: 16 casos, 167 pasadas, 6 canales de sensor, VB de flanco medido |
| Entradas del estimador | Media, desviación típica, RMS, máximo, curtosis y asimetría por señal + profundidad de corte (DOC), avance, material y número de corte |
| Cortes medidos usados en el ajuste | 146 |
| Tamaño del repositorio | 0,0 GB reportado por HuggingFace (menos de 0,1 GB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El módulo 1 es un regresor tabular: dos variantes, Random Forest y MLP, alimentadas con seis estadísticos por canal de sensor (media, desviación típica, RMS, máximo, curtosis, asimetría) más las variables de proceso DOC, avance, material y número de corte, sobre 146 cortes con VB medido. La validación es exigente y bien planteada: *leave-one-case-out* y *leave-one-condition-out*, comparadas contra una línea base sin sensores basada en la curva de desgaste empírica. El RF obtiene RMSE 0,192 mm en leave-one-case-out (MLP 0,218; línea base 0,218) y 0,197 mm en leave-one-condition-out (MLP 0,292; línea base 0,243), lo que indica que la señal de sensor aporta información incremental sobre el mero conteo de cortes, especialmente al generalizar a condiciones no vistas. No se documentan en la información disponible el número de árboles, la búsqueda de hiperparámetros ni el preprocesado exacto de las señales crudas.

El modelo de desgaste asociado es empírico por condición: incrementos de VB por corte de 0,039–0,155 mm/cut, con una vida nominal hasta VB = 0,45 mm de solo ~4–16 cortes, coherente con un régimen de desgaste acelerado de laboratorio. Los módulos 2 y 3 componen el gemelo digital en SimPy y el estudio de políticas: 20 turnos × 30 replicaciones, con un controlador basado en condición que solo ve la estimación del modelo de ML y cuyo ruido se calibra con el RMSE medido entre condiciones (0,197 mm). El controlador aplica filtrado EMA, lo que explica que reducir a la mitad el error del estimador recupere solo parte de la brecha de rendimiento. El scrap en función de VB se modela como una función escalón declarada explícitamente en el código.

## Capacidades

- Estimación de desgaste de flanco VB por corte a partir de características estadísticas de señales de sensor y parámetros de proceso.
- Generalización controlada a casos y a condiciones no vistas, con métricas publicadas para ambos escenarios de validación.
- Simulación de una línea de producción de tres etapas (fresado, inspección, ensamblaje) con tiempos de ciclo estocásticos.
- Evaluación comparativa de políticas de mantenimiento: run-to-failure, intervalo fijo y basado en condición.
- Análisis de sensibilidad del lazo de decisión al ruido del estimador (escenario sigma/2).
- Extracción reproducible de características por pasada a partir de las señales crudas, publicada como `milling_runs.csv`.
- No soporta tool calling ni function calling, no tiene modo agente, no hace razonamiento multi-paso generativo, no procesa visión, audio ni texto libre, y no tiene capacidades multilingües.

## Casos de uso

- **Prototipado de mantenimiento basado en condición antes de invertir en sensórica adicional:** el repositorio permite reproducir el lazo estimador → política → métricas de planta y estimar el retorno esperado de mejorar el modelo de desgaste antes de comprar hardware.
- **Justificación económica de una política de sustitución de herramienta:** la tabla de resultados cuantifica el intercambio entre piezas buenas, porcentaje de scrap y paradas no planificadas para dos combinaciones material/condición, lo que sirve de base para una discusión de coste por pieza.
- **Priorización de esfuerzo en modelado:** el escenario sigma/2 muestra cuánto se recupera al reducir el error del estimador, lo que ayuda a decidir si conviene invertir en más datos etiquetados o en un controlador más robusto.
- **Banco de pruebas docente:** el par Scikit-learn + SimPy es ligero y ejecutable en portátil, adecuado para asignaturas de gemelos digitales, prognostics o investigación operativa.
- **Comparación de extractores de características:** `milling_runs.csv` permite que otros equipos evalúen sus propios descriptores de señal contra el mismo protocolo de validación leave-one-case-out y leave-one-condition-out.
- **Integración en un gemelo digital más amplio:** las definiciones de política y el modelo de desgaste en JSON son reutilizables como componente de desgaste dentro de una simulación mayor de planta.
- **Referencia metodológica para calibrar ruido de estimadores en simulaciones:** usar el RMSE medido entre condiciones como sigma del controlador es una práctica directamente replicable en otros dominios de prognostics.

## Benchmarks y rendimiento

Módulo 1 — estimación de VB (RMSE en mm; menor es mejor):

| Validación | Random Forest | MLP | Línea base sin sensores |
|---|---|---|---|
| Leave-one-case-out | **0,192** | 0,218 | 0,218 |
| Leave-one-condition-out | **0,197** | 0,292 | 0,243 |

Módulos 2+3 — política de mantenimiento (20 turnos × 30 replicaciones):

| Condición | Política | Piezas buenas | Scrap | Paradas no planificadas |
|---|---|---|---|---|
| DOC 1,5 / avance 0,5 / fundición | run-to-failure | 1253 | 13,9 % | 148,3 |
| DOC 1,5 / avance 0,5 / fundición | intervalo fijo | 2231 | 15,6 % | 11,2 |
| DOC 1,5 / avance 0,5 / fundición | basada en condición | 1862 | **3,9 %** | **0,0** |
| DOC 1,5 / avance 0,5 / fundición | basada en condición, sigma/2 | 1922 | **3,4 %** | **0,0** |
| DOC 0,75 / avance 0,25 / acero | run-to-failure | 831 | 16,4 % | 168,8 |
| DOC 0,75 / avance 0,25 / acero | intervalo fijo | 1636 | 13,7 % | 4,2 |
| DOC 0,75 / avance 0,25 / acero | basada en condición | 1524 | **8,5 %** | **0,2** |
| DOC 0,75 / avance 0,25 / acero | basada en condición, sigma/2 | 1551 | **7,9 %** | **0,0** |

Lectura relevante: en la condición de fundición, la política de intervalo fijo bien ajustada supera en piezas buenas (2231 frente a 1862) a la basada en condición, que sin embargo reduce el scrap de 15,6 % a 3,9 % y elimina las paradas no planificadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este artefacto.

## Requisitos de hardware

- No requiere GPU: la inferencia del Random Forest y la simulación SimPy se ejecutan en CPU.
- VRAM estimada para inferencia: 0 GB (no aplica).
- RAM estimada: no disponible; el repositorio completo ocupa menos de 0,1 GB según HuggingFace y los ficheros de modelo son un único pickle de scikit-learn más dos JSON de pocos kilobytes.
- GPU recomendadas: ninguna; A100, H100 o RTX 4090 son innecesarias para este artefacto.
- Cabe en cualquier portátil de consumo; el cuello de botella es el número de replicaciones de SimPy, no el modelo.
- Opciones de despliegue: Python 3 con scikit-learn y SimPy; carga del modelo vía `pickle`/`joblib`. vLLM, llama.cpp, Ollama o TGI no aplican.
- Latencia y throughput: no disponibles. No se publican tiempos de ejecución por corte ni por turno simulado.

## Comparativa con modelos similares

Comparativa interna publicada por el autor (misma tarea, mismos datos):

| Enfoque | RMSE leave-one-case-out | RMSE leave-one-condition-out | Naturaleza |
|---|---|---|---|
| Random Forest (este artefacto) | 0,192 mm | 0,197 mm | Ensemble de árboles sobre características estadísticas |
| MLP (mismo estudio) | 0,218 mm | 0,292 mm | Red neuronal densa sobre las mismas entradas |
| Línea base curva de desgaste sin sensores | 0,218 mm | 0,243 mm | Modelo empírico basado solo en número de corte |

Alternativas externas de la misma categoría (estimación de desgaste en fresado sobre NASA PCoE, gemelos digitales de planta): no disponible en la información proporcionada. No se aportan referencias, métricas ni repositorios comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Los datos son de desgaste acelerado en laboratorio: los valores absolutos de producción (piezas buenas, scrap, paradas) no son extrapolables a una planta real; el autor indica explícitamente que el resultado transferible es el ranking de políticas, no el throughput.
- Solo dos combinaciones condición/material evaluadas en la simulación (DOC 1,5 / avance 0,5 / fundición y DOC 0,75 / avance 0,25 / acero); el espacio de condiciones está poco cubierto.
- El dataset de origen es pequeño (16 casos, 167 pasadas, 146 cortes medidos), lo que limita la robustez de las estimaciones y hace que el RMSE de validación cruzada sea sensible a la partición.
- La relación scrap-VB es una función escalón modelada, no medida; los tiempos de ciclo son supuestos estocásticos. Cualquier conclusión económica depende de estos supuestos.
- El controlador basado en condición no es óptimo en throughput bruto: puede quedar por debajo de un intervalo fijo bien ajustado, y reducir el ruido del estimador solo recupera parte de la brecha.
- No hay información sobre sesgos, porque no es un modelo entrenado con datos humanos ni genera texto; los sesgos relevantes serían de cobertura del dataset (un material, un centro de mecanizado, un régimen de desgaste).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de sobreinterpretación de las cifras de simulación como predicciones de planta.
- La carga de `wear_rf.pkl` implica deserialización de pickle: no debe hacerse desde fuentes no confiables. El repositorio lo publica el propio autor, pero conviene auditar antes de integrarlo en producción.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No se declara patente asociada.
- No se documentan hiperparámetros, semillas ni versión exacta de scikit-learn, lo que puede comprometer la reproducibilidad bit a bit.
- No consta revisión por pares en la información disponible; el artefacto se presenta como estudio de un autor individual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dummy033485/manufacturing-digital-twin
- Demo en vivo (HuggingFace Space): https://huggingface.co/spaces/dummy033485/manufacturing-twin-demo
- NASA PCoE Milling Data Set: referenciado en la model card (UC Berkeley BEST Lab); no se proporciona URL en la información disponible.
- MOSAIC Lab, Department of Mechanical Engineering, University of South Carolina: mencionado como marco de investigación; no se proporciona URL.
- Ficheros del repositorio: `wear_rf.pkl`, `twin_report.json`, `wear_model.json`, `milling_runs.csv`.
- Paper, blog o repositorio adicionales: no disponibles.
