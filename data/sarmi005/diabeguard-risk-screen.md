# Sarmi005/diabeguard-risk-screen

## Resumen

DiabeGuard research risk screen v0.1 es un modelo de clasificación tabular publicado en Hugging Face por el usuario Sarmi005. Su función es estimar el riesgo combinado de prediabetes o diabetes a partir de siete variables autoinformadas: hipertensión, estado general de salud (escala 1-5), colesterol alto, grupo de edad, enfermedad o ataque cardíaco, IMC y dificultad para caminar. No es un modelo de lenguaje ni una red neuronal profunda de propósito general, sino un clasificador supervisado entrenado sobre datos de encuesta poblacional.

El modelo se entrenó con la encuesta CDC BRFSS 2021 (subida a Kaggle), tras eliminar duplicados. Los datos son estadounidenses y autoinformados, lo que condiciona tanto la distribución de entrada como la tasa base de positivos. El autor lo etiqueta explícitamente como prototipo de investigación y advierte de que no está validado clínicamente ni sirve como diagnóstico.

Su relevancia es limitada y acotada al ámbito de la experimentación: ejemplifica un pipeline de cribado tabular de bajo coste con métricas publicadas (ROC-AUC 0,793, PR-AUC 0,435, sensibilidad 0,80, especificidad 0,63, precisión 0,31) y con advertencias explícitas sobre sus límites. No dispone de descargas ni de interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular (tipo concreto no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 7 variables tabulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entradas categóricas y numéricas, sin procesamiento de texto libre) |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la familia de modelo empleada (regresión logística, gradient boosting, random forest o red neuronal tabular). Se trata de un clasificador supervisado que toma siete características: presión arterial alta, salud general en escala 1-5, colesterol alto, grupo de edad, enfermedad o ataque cardíaco, IMC y dificultad para caminar. La salida es una probabilidad de pertenecer a la clase combinada de prediabetes o diabetes.

El conjunto de entrenamiento procede de la encuesta CDC BRFSS 2021 en su versión subida a Kaggle, con eliminación de duplicados. No se especifican el número de muestras, la partición train/test, el balanceo de clases ni si hubo calibración de probabilidades. Tampoco se documenta ninguna técnica de regularización, búsqueda de hiperparámetros o validación cruzada. El autor indica que el conjunto de test se usó una sola vez, lo que sugiere una evaluación honesta pero sin validación externa.

## Capacidades

- Clasificación binaria de riesgo combinado de prediabetes o diabetes a partir de siete preguntas.
- Entrada tabular con variables numéricas (edad por grupos, IMC, salud general 1-5) y binarias (hipertensión, colesterol, enfermedad cardíaca, dificultad para caminar).
- Salida de probabilidad o puntuación de riesgo utilizable para definir bandas de riesgo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No incorpora modo de razonamiento, visión ni audio.
- No separa de forma fiable la prediabetes de la diabetes ni de otras clases.

## Casos de uso

- Cribado exploratorio en cuadernos de investigación: usar el modelo para generar bandas de riesgo sobre subconjuntos de BRFSS y estudiar la relación entre factores autoinformados y riesgo metabólico, siempre con revisión estadística posterior.
- Docencia en salud pública y ciencia de datos: ejemplo didáctico de pipeline tabular completo, desde la limpieza de duplicados hasta la evaluación con ROC-AUC, PR-AUC, sensibilidad y especificidad.
- Prototipado de cuestionarios de triaje: integrar las siete preguntas en una aplicación de demo para ilustrar cómo un cuestionario breve puede priorizar la recomendación de una analítica de glucosa.
- Comparación de modelos tabulares: servir como línea base reproducible para contrastar regresión logística, gradient boosting u otras técnicas sobre el mismo subconjunto de BRFSS 2021.
- Análisis de calibración y umbrales: estudiar cómo varían sensibilidad (0,80) y especificidad (0,63) al mover el umbral de decisión, útil para discutir el compromiso entre falsos positivos y falsos negativos en cribado.
- Simulación de flujos de derivación: generar puntuaciones de riesgo para estudiar cuántas derivaciones a prueba de glucosa se producirían con distintas bandas, sin uso clínico real.
- Auditoría de sesgos por subgrupos: analizar el rendimiento diferencial por grupo de edad o IMC, dado que el modelo se entrenó con datos autoinformados de EE. UU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,793 |
| PR-AUC | 0,435 |
| Sensibilidad | 0,80 |
| Especificidad | 0,63 |
| Precisión | 0,31 |

Resultados sobre conjunto de test reservado y usado una sola vez, según la model card. No se publican comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia sobre CPU: al tratarse de un clasificador tabular de siete variables, la inferencia es de coste muy bajo y no requiere GPU.
- VRAM estimada: no aplica en la práctica; cualquier GPU consumer podría alojarlo, pero no es necesario.
- GPU recomendadas: no aplica; CPU estándar es suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: el formato de pesos no está disponible, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso). El despliegue dependería de la librería con la que se serializó el modelo, dato no documentado.
- Latencia y throughput: no disponibles; por la naturaleza del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Variables de entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiabeGuard risk screen v0.1 | Clasificador tabular | 7 | no aplica | other | Hugging Face, 0 descargas |
| Modelos de riesgo de diabetes tipo FINDRISC | Cuestionario clínico validado | 8 | no aplica | uso clínico según país | Validado en población general |
| Clasificadores tabulares sobre BRFSS (genéricos) | Gradient boosting / regresión | variable | no aplica | variable | Repositorios públicos |

No se dispone de comparaciones directas publicadas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Prototipo de investigación: no es un diagnóstico y no está validado clínicamente.
- Entrenado con datos de encuesta de EE. UU. autoinformados; no validado para población india ni para otras poblaciones.
- No separa de forma fiable la prediabetes de la diabetes ni de otras clases.
- La precisión de 0,31 implica una proporción elevada de falsos positivos; los porcentajes reflejan la tasa base de la encuesta estadounidense y deben presentarse como bandas de riesgo, no como probabilidades individuales.
- Riesgo de sesgo por autoinforme: hipertensión, colesterol, enfermedad cardíaca y dificultad para caminar dependen de lo que declara el encuestado.
- Licencia "other": no se especifican condiciones de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Sin descargas ni validación externa conocida; madurez y mantenimiento inciertos.
- No sustituye una prueba de glucosa en sangre ni la opinión de un profesional sanitario; cualquier uso debe derivar a confirmación analítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sarmi005/diabeguard-risk-screen
- CDC BRFSS 2021 (fuente de datos): https://www.cdc.gov/brfss/annual_data/annual_2021.html
