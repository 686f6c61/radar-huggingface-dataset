# neiderolaya26/credit-risk-lending-club

## Resumen

El modelo `neiderolaya26/credit-risk-lending-club` no es un modelo de lenguaje, sino un conjunto de modelos tabulares de riesgo de crédito empaquetados con `joblib` y serializados a partir de la librería LightGBM. Lo publica el desarrollador neiderolaya26 como artefacto del repositorio `credit-risk-agent-lab`, un sistema de decisión de crédito de extremo a extremo construido exclusivamente con datos públicos de Lending Club. Resuelve un problema concreto: estimar la probabilidad de impago (PD) a 36 meses, la probabilidad de prepago y la severidad económica de un préstamo, y combinarlas en un motor de decisión con política y razones.

El repositorio contiene cuatro artefactos: `campeon.joblib` (preprocesador + LightGBM de PD a 36 meses con recalibración logit), `prepago_c_supervivencia.joblib` (modelo de supervivencia en tiempo discreto para el prepago), `severidad_b_economica.joblib` (pérdida económica en caso de impago) y `referencia_tasa.joblib` (tasa de mercado del perfil, recalibrada con datos de enero a junio de 2015). La relevancia actual es acotada: es un artefacto de investigación y demostración, no un modelo de producción, y su valor está en mostrar un pipeline completo de scoring crediticio con validación fuera de tiempo.

El modelo se entrenó con préstamos a 36 meses de Lending Club entre septiembre de 2012 y 2014, con validación fuera de tiempo en 2015. Solo usa variables de la solicitud (sin tasa ni score de Lending Club, sin identificadores, texto libre ni código postal). El AUC reportado en 2015 es de 0,6823, ligeramente superior al del score implícito en la tasa de Lending Club (0,6784), con un intervalo de confianza del 95 % de la diferencia de [+0,0016; +0,0063].

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM) con preprocesador y recalibración logit |
| Parametros totales | no disponible (no se reporta el número de árboles, hojas ni parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (artefactos `joblib`, no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto libre; solo variables tabulares de la solicitud) |
| Licencia | MIT |
| Formato de pesos | `joblib` (pickle de Python); requiere el paquete `credit_lab` del repositorio para cargar las clases |
| Pipeline | `tabular-classification` |
| Métrica declarada | `roc_auc` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Fecha de creación | 2026-11-13 |
| Fecha de actualización | 2026-11-13 |

## Arquitectura y entrenamiento

La arquitectura es un conjunto de modelos LightGBM (gradient boosting sobre árboles de decisión) para clasificación tabular binaria, acompañados de un preprocesador y de un desplazamiento logit de recalibración. El modelo principal, `campeon.joblib`, estima la probabilidad de impago a 36 meses con la variable objetivo `malo` = Charged Off o Default. El ajuste de hiperparámetros se hizo con Optuna (TPE) usando dos cortes temporales dentro del periodo de entrenamiento, lo que introduce una validación temporal interna además de la validación fuera de tiempo en 2015.

Los datos de entrenamiento cubren préstamos a 36 meses de Lending Club desde septiembre de 2012 hasta 2014, con validación fuera de tiempo en 2015. Solo se emplean variables disponibles en la solicitud: se excluyen la tasa y el score de Lending Club, los identificadores, el texto libre y el código postal. Además del modelo de PD, el repositorio incluye un modelo de supervivencia en tiempo discreto para el prepago (`prepago_c_supervivencia.joblib`, RMSE 0,0497) y un modelo de severidad económica para la pérdida en caso de impago (`severidad_b_economica.joblib`). La tasa de mercado del perfil se recalibró con datos de enero a junio de 2015 (`referencia_tasa.joblib`).

No se documenta en la información disponible el número de árboles, la profundidad, el número de hojas, la tasa de aprendizaje ni el número de iteraciones de Optuna. Tampoco se detalla la composición exacta del dataset (número de préstamos, proporción de impagos, tratamiento de valores faltantes).

## Capacidades

- Clasificación binaria tabular: estimación de probabilidad de impago (PD) a 36 meses a partir de variables de solicitud de préstamo.
- Modelado de supervivencia en tiempo discreto para la probabilidad de prepago condicionada a que el préstamo salga bueno.
- Modelado de severidad económica: estimación de la pérdida económica en caso de impago.
- Recalibración de probabilidades mediante desplazamiento logit, con calibración reportada a ±0,7 puntos porcentuales de la mora real por grupo de vivienda y región (julio a diciembre de 2015).
- Generación de razones de decisión a través del motor `Motor` del repositorio `credit-risk-agent-lab` (política de decisión, economía y explicabilidad).
- Referencia de tasa de mercado del perfil, recalibrada con datos de enero a junio de 2015.
- No soporta tool calling, function calling, agentes multi-step, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.
- No procesa texto libre ni variables no estructuradas.

## Casos de uso

- Investigación académica sobre scoring crediticio: el modelo sirve como referencia reproducible de un pipeline completo (PD, prepago, severidad y política) entrenado solo con datos públicos de Lending Club, útil para comparar metodologías de validación fuera de tiempo.
- Demostración docente de un motor de decisión de crédito: el repositorio incluye una demo en Streamlit que permite recorrer el flujo completo desde las variables de solicitud hasta la decisión y las razones, adecuada para formación en riesgo de crédito.
- Evaluación de recalibración de probabilidades: el desplazamiento logit y la calibración por grupos de vivienda y región permiten estudiar técnicas de calibración en modelos de PD con datos desbalanceados.
- Análisis de prepago con supervivencia en tiempo discreto: el artefacto `prepago_c_supervivencia.joblib` (RMSE 0,0497) se puede usar para estudiar la dinámica temporal del prepago en carteras de préstamos al consumo.
- Modelado de severidad económica: `severidad_b_economica.joblib` permite estimar la pérdida esperada combinando PD, prepago y severidad en un marco de pérdida esperada (EL = PD × LGD × EAD).
- Estudio de sesgo y proxies: la model card documenta que la antigüedad crediticia actúa como proxy de edad y cuantifica el coste de eliminarla (−0,0032 de AUC), lo que sirve para analizar compromisos entre equidad y rendimiento en modelos de crédito.
- Benchmark de referencia frente a modelos propios: el AUC de 0,6823 en 2015 y el del score de Lending Club (0,6784) permiten situar un modelo nuevo respecto a una línea base pública.

## Benchmarks y rendimiento

Resultados reportados en la model card para validación fuera de tiempo en 2015:

| Métrica | Valor |
|---|---|
| AUC del campeón (PD a 36 meses, 2015) | 0,6823 |
| AUC del score de Lending Club (su tasa) | 0,6784 |
| IC 95 % de la diferencia (bootstrap) | [+0,0016; +0,0063] |
| Calibración por grupo de vivienda y región (jul–dic 2015) | PD media a ±0,7 pts de la mora real |
| Supervivencia (prepago), RMSE | 0,0497 |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco se reportan métricas adicionales de clasificación (precisión, recall, F1, KS, Gini) ni resultados del modelo de severidad económica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo LightGBM serializado con `joblib`, la inferencia es en CPU y el consumo de memoria depende del número de árboles y hojas, que no se documenta.
- GPU recomendadas: no aplica para inferencia; LightGBM puede entrenar con GPU, pero la inferencia de estos artefactos es típicamente en CPU.
- ¿Cabe en GPU consumer? No aplica como requisito de VRAM; el artefacto se carga en memoria del proceso Python. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere artefactos pequeños.
- Opciones de despliegue: carga directa con `joblib` y el paquete `credit_lab` del repositorio; el motor `Motor` lee el directorio `modelos/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos tabulares).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito de seguridad: al ser archivos pickle (`joblib`), deben cargarse solo desde una fuente de confianza, tal como advierte el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neiderolaya26/credit-risk-lending-club` | LightGBM tabular (PD, prepago, severidad) | no aplica | AUC 0,6823 (2015, fuera de tiempo) | MIT | Hugging Face + GitHub |
| Score implícito en la tasa de Lending Club | Score propietario de plataforma | no aplica | AUC 0,6784 (2015) | Propietaria | Solo como referencia en la model card |
| Modelos de PD genéricos de la literatura (p. ej. regresión logística o XGBoost sobre Lending Club) | Tabular | no aplica | no disponible | Variable | no disponible |

No se dispone de comparaciones con otros modelos públicos de PD sobre Lending Club en la información proporcionada. La única comparación cuantitativa documentada es frente al score de Lending Club, con una mejora de AUC de +0,0039 (IC 95 % [+0,0016; +0,0063]).

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación y demostración; el autor indica explícitamente que **no** está pensado para decidir créditos reales.
- Sesgo de selección: solo incluye préstamos que Lending Club aprobó entre 2012 y 2015; no hay solicitudes rechazadas ni datos de aceptación de ofertas, por lo que el modelo no es válido para decisiones de admisión sobre población no filtrada.
- El efecto causal de la tasa en la mora no se pudo identificar: la PD no reacciona a la tasa y el escenario de estrés es un supuesto, no una estimación causal.
- Equidad: los datos no incluyen atributos protegidos. La antigüedad crediticia actúa como proxy de edad; no se usa como razón y eliminarla cuesta −0,0032 de AUC, lo que evidencia un compromiso entre equidad y rendimiento.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación fuera de la distribución de 2012–2015 y de sobreajuste a las variables de solicitud disponibles.
- Limitación temporal y geográfica: entrenado y validado solo con datos de Lending Club en EE. UU. entre 2012 y 2015; no se garantiza su validez en otras carteras, países o periodos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el uso previsto del autor y las limitaciones metodológicas desaconsejan su uso en producción sin reentrenamiento y validación independiente.
- Seguridad de carga: los artefactos son pickles de Python; deben cargarse solo desde fuentes de confianza y requieren el paquete `credit_lab` para resolver las clases.
- Ausencia de métricas adicionales: no se publican precisión, recall, F1, KS, Gini ni resultados del modelo de severidad, lo que limita la evaluación completa del sistema.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neiderolaya26/credit-risk-lending-club
- Repositorio del proyecto: https://github.com/neiderolaya26/credit-risk-agent-lab
- Demo en Streamlit: https://github.com/neiderolaya26/credit-risk-agent-lab/tree/main/demo
- Fichas completas del modelo y del agente: https://github.com/neiderolaya26/credit-risk-agent-lab/blob/main/docs/fichas.md
- Documentación de LightGBM: https://lightgbm.readthedocs.io/
- Documentación de Optuna: https://optuna.readthedocs.io/
- Documentación de joblib: https://joblib.readthedocs.io/
