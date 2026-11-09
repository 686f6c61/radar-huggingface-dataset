# marco1988/saudescope-hipertensao

## Resumen

SaúdeScope — Triagem de risco de hipertensão es un modelo de clasificación tabular publicado por el usuario marco1988 en Hugging Face, desarrollado en el marco del Proyecto Integrador SaúdeScope del curso de Ciencia de Datos de la UNIVESP. Estima la probabilidad de que una persona adulta o mayor del Estado de São Paulo tenga un diagnóstico autorreferido de hipertensión arterial a partir de 14 variables sociodemográficas y antropométricas derivadas de los microdatos de la Pesquisa Nacional de Saúde (PNS) 2019 del IBGE.

No es un modelo de lenguaje ni una red neuronal: se trata de una regresión logística implementada con scikit-learn 1.8.0 y serializada en formato joblib, con un pipeline de clasificación tabular. El modelo se entrena y evalúa con el peso muestral de la PNS, lo que lo hace metodológicamente relevante para estudios epidemiológicos de base poblacional, aunque su alcance es estrictamente de triaje y planificación, no de diagnóstico clínico individual.

Su interés actual radica en que ejemplifica el uso de modelos estadísticos interpretables y ligeros para salud pública, con un umbral de decisión ajustado (0,3037) para priorizar el recall en la detección de casos, y con una documentación explícita de limitaciones, algo poco habitual en modelos tabulares de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn 1.8.0), pipeline de clasificación tabular |
| Parametros totales | no disponible (coeficientes de regresión logística; el autor no publica el número exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, 14 variables de entrada) |
| Tipos de cuantizacion | no disponible (no aplica; modelo de precisión completa en joblib) |
| Idiomas soportados | pt (portugués; etiquetas y variables en portugués) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle de scikit-learn) más un scaler separado en joblib |

## Arquitectura y entrenamiento

El modelo es una regresión logística binaria con 14 variables de entrada: `idade`, `imc`, `imc_ausente`, cuatro dummies de sexo y raza/cor (`sexo_Mulher`, `cor_raca_Branca`, `cor_raca_Indígena`, `cor_raca_Parda`, `cor_raca_Preta`) y seis dummies de escolaridad. Las variables numéricas `idade` e `imc` se estandarizan con un `StandardScaler` serializado aparte (`scaler_features_numericas.joblib`). Las categorías de referencia son hombre, raza/cor amarela y escolaridad fundamental completa.

Los datos de entrenamiento proceden de los microdatos de la PNS 2019 del IBGE, restringidos al Estado de São Paulo, a entrevistas realizadas y a personas de 18 años o más que respondieron a la pregunta sobre hipertensión: 5.908 registros, de los cuales aproximadamente el 29 % tenían diagnóstico autorreferido. La división es de 4.431 registros para entrenamiento y 1.477 para test, estratificada por la variable objetivo y ponderada con el peso muestral de la PNS (`sample_weight`). Cuando el IMC no está disponible, se imputa la mediana (26,99) y se marca con `imc_ausente = 1`. No se documenta uso de RLHF, DPO ni técnicas de aumento de datos.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de diagnóstico autorreferido de hipertensión a partir de 14 variables.
- Salida probabilística calibrada de forma implícita por la regresión logística, con umbral recomendado de 0,3037 para priorizar recall.
- Interpretabilidad directa mediante coeficientes de regresión logística (no se publican explícitamente en la model card).
- Manejo explícito de valores ausentes de IMC mediante variable indicadora `imc_ausente`.
- Integración con el ecosistema scikit-learn y pandas; predicción mediante `predict_proba`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no aplica; las variables y etiquetas están en portugués.

## Casos de uso

- Triaje poblacional en unidades básicas de salud: el modelo permite estimar qué proporción de un grupo etario y sociodemográfico presenta riesgo elevado de hipertensión y priorizar campañas de medición de presión arterial, usando el umbral 0,3037 para maximizar la captación de casos.
- Planificación de servicios sanitarios: agregando predicciones por segmentos de edad, sexo, raza/cor y escolaridad se pueden dimensionar consultas, pruebas y derivaciones en el Estado de São Paulo, aprovechando que el modelo está entrenado con pesos muestrales de la PNS.
- Investigación epidemiológica: sirve como línea base interpretable para comparar con modelos más complejos (gradient boosting, random forest) en estudios sobre determinantes sociales de la hipertensión.
- Docencia y formación en ciencia de datos aplicada a salud: el pipeline completo (scaler, dummies, umbral ajustado, pesos muestrales) es un ejemplo reproducible de buenas prácticas en clasificación con datos de encuestas complejas.
- Sistemas de alerta temprana en registros administrativos: si se dispone de edad, IMC y variables sociodemográficas de pacientes, el modelo puede integrarse en un script de scoring por lotes para señalar subgrupos que requieran rastreo activo.
- Evaluación de equidad en salud: al incluir raza/cor y escolaridad, permite analizar si las probabilidades predichas difieren entre grupos y detectar posibles sesgos en la priorización de recursos.
- Prototipado rápido en entornos con recursos limitados: al ser una regresión logística en joblib, se ejecuta en CPU sin GPU y con latencia de milisegundos, adecuada para integraciones en notebooks o APIs ligeras.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (1.477 registros, métricas ponderadas por el peso muestral de la PNS):

| Medida | Valor |
|---|---|
| AUC-ROC | 0,80 |
| Umbral recomendado | 0,3037 |
| Recall en el umbral recomendado | 0,73 |
| Precisión en el umbral recomendado | 0,53 |
| F1 en el umbral recomendado | 0,61 |
| Exactitud en el umbral recomendado | 0,74 |
| Recall con umbral 0,50 | ~0,40 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el coste computacional es despreciable.
- Opciones de despliegue: scripts de Python con scikit-learn 1.8.0 y joblib, notebooks Jupyter, APIs ligeras (FastAPI, Flask) o integración en pipelines de pandas.
- Latencia y throughput estimados: no disponibles de forma oficial; por la naturaleza del modelo (regresión logística con 14 variables) la inferencia es del orden de microsegundos a milisegundos por registro en CPU.
- Requisito crítico: usar scikit-learn 1.8.0 para cargar los archivos `.joblib` y evitar avisos de incompatibilidad.

## Comparativa con modelos similares

| Modelo | Tipo | Variables de entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaúdeScope hipertensión (este modelo) | Regresión logística | 14 variables tabulares | no aplica | MIT | Hugging Face, joblib |
| Modelos de riesgo cardiovascular tipo Framingham o SCORE | Ecuaciones de riesgo clínico | Variables clínicas y de laboratorio | no aplica | Variable según fuente | Publicaciones y calculadoras |
| Gradient boosting sobre la misma PNS 2019 | Árboles de decisión | Variables tabulares | no aplica | no disponible | No publicado por el autor |

No se dispone de información sobre modelos comparables publicados con las mismas variables y el mismo recorte poblacional en la información proporcionada.

## Limitaciones y advertencias

- El recorte es exclusivamente el Estado de São Paulo; la PNS no permite desagregación municipal, por lo que no debe aplicarse a otras regiones sin reentrenamiento.
- No es un instrumento de diagnóstico: no sustituye consulta, medición de presión arterial ni juicio clínico, y no debe usarse para decisiones sobre una persona concreta.
- La variable objetivo es autorreferida, lo que introduce sesgo de notificación y de acceso al sistema sanitario.
- La edad concentra la mayor parte del poder predictivo; el resto de variables solo refinan la estimación dentro de una franja de edad.
- El IMC aferido solo existe para un subconjunto de la muestra; en la mayoría de registros se imputó la mediana (26,99), lo que reduce la fiabilidad de esa variable.
- El coeficiente de la categoría "Indígena" es inestable por el tamaño muestral muy reducido en São Paulo.
- El rendimiento se evaluó en un único conjunto de test, sin validación externa.
- El umbral 0,3037 prioriza recall (0,73) a costa de precisión (0,53), generando un volumen alto de falsos positivos.
- Los archivos `.joblib` usan formato pickle: deben cargarse solo desde fuentes de confianza por riesgo de ejecución de código arbitrario.
- Licencia MIT permite uso comercial, pero el uso clínico o sanitario requiere validación adicional y cumplimiento normativo local.
- No se documentan análisis de sesgo por subgrupos más allá de la inestabilidad de la categoría "Indígena".

## Enlaces

- Hugging Face: https://huggingface.co/marco1988/saudescope-hipertensao
- Repositorio del proyecto (código, notebooks y informes): https://github.com/MarcoCostaSilva/saudescope
- Fuente de datos: IBGE, Pesquisa Nacional de Saúde 2019 — https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html
