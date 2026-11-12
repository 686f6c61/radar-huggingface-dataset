# igorlimamillis/diabetes-readmission-logistic

## Resumen

`diabetes-readmission-logistic` es un modelo de clasificación tabular publicado en Hugging Face por el autor independiente Igor Millis (usuario `igorlimamillis`). Estima la probabilidad de que un ingreso hospitalario de un paciente diabético vaya seguido de un reingreso en un plazo de 30 días. No es una red neuronal ni un modelo de lenguaje: es un `Pipeline` de scikit-learn basado en una regresión logística con expansión de características mediante B-splines cúbicos, serializado en formato `skops`.

El modelo se entrena sobre el conjunto de datos público *Diabetes 130-US Hospitals for Years 1999–2008* (Strack et al., 2014) del repositorio UCI, que contiene encuentros hospitalarios codificados con ICD-9 en centros de Estados Unidos. La propuesta técnica del autor es deliberadamente conservadora: un modelo lineal bien calibrado que retiene aproximadamente el 94 % de la ganancia sobre el azar de un LightGBM ajustado, con menos de 10 000 encuentros de entrenamiento y un coste computacional mínimo.

Su relevancia es doble. Por un lado, sirve como referencia reproducible de evaluación rigurosa en datos clínicos tabulares (validación agrupada por paciente, calibración, intervalos de confianza por bootstrap). Por otro, ejemplifica un patrón de despliegue ligero con `skops` que evita la dependencia de frameworks de deep learning. El propio autor lo etiqueta explícitamente como modelo educativo y de portfolio, **no apto para uso clínico**.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística L2 (`C=0.01`) sobre pipeline scikit-learn con B-splines cúbicos y one-hot encoding |
| Parámetros totales | no disponible (modelo lineal; número de coeficientes no declarado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de una fila por encuentro) |
| Tipos de cuantización | no aplica (pesos en coma flotante dentro del serializado `skops`) |
| Idiomas soportados | no aplica (entrada tabular; etiquetas y códigos ICD-9 en inglés) |
| Licencia | MIT |
| Formato de pesos | `.skops` (serialización segura de scikit-learn) |
| Librería | scikit-learn `1.9.*` |
| Tarea (pipeline) | `tabular-classification` |
| Dataset de entrenamiento | UCI *Diabetes 130-US Hospitals for Years 1999–2008* |

## Arquitectura y entrenamiento

El modelo es un `Pipeline` de scikit-learn con tres etapas encadenadas. La primera es un `FunctionTransformer` sin estado ajustable que aplica `readmission.features.engineer`, una función de ingeniería de características fila a fila: convierte los rangos de edad en años, agrupa los códigos ICD-9 en nueve capítulos, agrupa los identificadores de admisión y alta, cuenta medicaciones y conserva el nivel "no medido" como categoría propia. La segunda etapa es un `ColumnTransformer` que trata las variables numéricas con `log1p`, las expande con B-splines cúbicos de cinco nudos y las estandariza, mientras que las categóricas pasan por one-hot encoding agrupando niveles raros (frecuencia inferior a 50). La tercera etapa es la `LogisticRegression` con regularización L2 y `C=0.01`, hiperparámetro seleccionado mediante validación cruzada de 5 pliegues agrupada por paciente y optimizando log loss.

El entrenamiento se realizó sobre el conjunto UCI original, excluyendo los encuentros que terminan en fallecimiento u hospitalización en cuidados paliativos. La evaluación se hizo sobre 19 773 encuentros de 13 998 pacientes nunca vistos en entrenamiento, con intervalos de confianza calculados por bootstrap a nivel de paciente. No se emplearon técnicas de RLHF, DPO ni ajuste por refuerzo: es un modelo supervisado clásico. La innovación técnica destacable es la combinación de splines cúbicos para capturar no linealidades en variables numéricas con una regresión logística fuertemente regularizada, lo que produce un modelo calibrado de forma nativa y con muy pocos parámetros.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de reingreso a 30 días a partir de una fila de variables clínicas y administrativas del encuentro hospitalario.
- Calibración de probabilidades: pendiente de calibración 1,04 e intercepto −0,001, con ECE de 0,007 por deciles de riesgo.
- Ingeniería de características integrada: transforma automáticamente los campos crudos del dataset UCI (rangos de edad, códigos ICD-9, identificadores de admisión y alta, recuentos de medicación) en variables numéricas y categóricas procesadas.
- Manejo explícito de valores ausentes codificados como `?` en el dataset original, conservándolos como nivel "no medido".
- Serialización segura: carga mediante `skops.io.load` con revisión previa de tipos no confiables.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto. No es un modelo de lenguaje.

## Casos de uso

- **Docencia y formación en evaluación de modelos clínicos**: sirve como caso de referencia para enseñar validación agrupada por paciente, calibración, Brier score y bootstrap de intervalos de confianza. Su bajo coste permite ejecutar experimentos completos en un portátil.
- **Línea base en proyectos de reingreso hospitalario**: cualquier equipo que aborde el problema de predicción de reingreso en el dataset UCI puede usarlo como *baseline* reproducible antes de probar modelos más complejos como LightGBM o XGBoost.
- **Prototipado rápido de un servicio de scoring tabular**: el pipeline se carga con `skops` y `scikit-learn` sin GPU ni servidor de inferencia especializado, lo que permite exponerlo como endpoint HTTP en minutos para demos internas.
- **Auditoría de calibración en modelos de salud**: al estar bien calibrado y ser lineal, permite estudiar cómo se comportan las probabilidades predichas frente a la prevalencia real (0,113) y sirve de contraste frente a modelos más opacos.
- **Análisis de asociaciones en datos clínicos**: los coeficientes del modelo describen asociaciones entre variables del encuentro y riesgo de reingreso, útiles en exploración inicial (nunca como inferencia causal).
- **Comparación de técnicas de ingeniería de características**: el uso de splines cúbicos frente a codificación lineal directa permite medir el impacto de la expansión de base en un modelo lineal sobre datos tabulares clínicos.
- **Pruebas de integración de pipelines `skops` en MLOps**: sirve para validar flujos de serialización segura, revisión de tipos no confiables y versionado de dependencias (`scikit-learn==1.9.*`) en un entorno controlado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). Evaluación sobre 19 773 encuentros de 13 998 pacientes no vistos en entrenamiento.

| Métrica | Valor |
|---|---|
| ROC AUC (held-out patients) | 0,670 [0,656; 0,683] (bootstrap a nivel de paciente) |
| PR AUC (prevalencia 0,113) | 0,219 |
| Brier score | 0,0962 |
| Log loss | 0,3347 |
| Pendiente / intercepto de calibración | 1,04 / −0,001 |
| ECE (deciles de riesgo) | 0,007 |
| Hosmer–Lemeshow (p) | 0,077 |
| Recall en el 20 % de mayor riesgo | 38,8 % (lift 1,94×) |
| Umbral 0,131 (F1 óptimo out-of-fold) | recall 0,475 · precision 0,206 · F1 0,287 · MCC 0,174 |

Comparación declarada por el autor frente a LightGBM ajustado:

| Modelo | ROC AUC | ΔAUC frente a logística |
|---|---|---|
| Regresión logística con splines | 0,670 | — |
| LightGBM ajustado | 0,681 | +0,011 [+0,006; +0,016] |

El autor indica que la regresión logística retiene aproximadamente el 94 % de la ganancia sobre el azar del LightGBM, está igual de bien calibrada y supera al modelo de árboles cuando el conjunto de entrenamiento baja de 10 000 encuentros. Se menciona un `results.json` con más de 40 métricas de 8 modelos, pero no se incluyen en la información disponible.

## Requisitos de hardware

- **VRAM**: no requiere GPU. La inferencia se ejecuta en CPU con un consumo de memoria del orden de decenas de megabytes (serializado `skops` de tamaño despreciable; el repositorio ocupa 0,0 GB).
- **GPU recomendadas**: ninguna. El modelo no se beneficia de aceleración por GPU.
- **Compatibilidad con GPU de consumo**: irrelevante; funciona en cualquier CPU moderna, incluidos portátiles de gama baja y entornos sin acelerador.
- **Opciones de despliegue**: Python con `scikit-learn==1.9.*`, `skops` y `scipy`; se puede envolver en FastAPI, Flask, BentoML o un job batch. No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI`, al no ser un modelo generativo.
- **Latencia y throughput**: no declarados en la model card. Por la naturaleza del modelo (transformación de una fila + producto escalar con pocos cientos de coeficientes), la latencia esperada es de microsegundos a milisegundos por fila en CPU, pero no se dispone de medidas publicadas.
- **Dependencia crítica**: el pipeline referencia `readmission.features.engineer` en tiempo de carga, por lo que es necesario añadir la ruta del repositorio a `sys.path` antes de deserializar.

## Comparativa con modelos similares

| Modelo | Tipo | ROC AUC | Calibración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diabetes-readmission-logistic` (este) | Regresión logística con splines | 0,670 | Brier 0,0962; pendiente 1,04 | MIT | Hugging Face + GitHub |
| LightGBM ajustado (declarado por el autor) | Gradient boosting | 0,681 | igual de bien calibrado según el autor | no disponible en la información | no disponible como artefacto |
| Otros modelos del estudio del autor (`results.json`, 8 modelos) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos públicos comparables sobre el mismo dataset con métricas verificables en la información proporcionada.

## Limitaciones y advertencias

- **No apto para uso clínico**: el propio autor lo declara modelo educativo y de portfolio. No debe emplearse para decisiones médicas, triaje ni gestión de camas.
- **Sesgo temporal y geográfico**: datos de EE. UU. entre 1999 y 2008 con codificación ICD-9. La distribución de prácticas clínicas, códigos y poblaciones ha cambiado sustancialmente desde entonces.
- **Subregistro de la etiqueta**: solo se observan reingresos al mismo sistema hospitalario; los reingresos en otros centros no se registran, por lo que la prevalencia real está infraestimada.
- **Exclusión de encuentros terminales**: los ingresos que terminan en fallecimiento u hospicio se excluyeron del entrenamiento; no deben puntuarse con este modelo.
- **Discriminación desigual por edad**: AUC de 0,63 en pacientes de 70 años o más frente a 0,71 en menores de 50. El rendimiento se degrada en el subgrupo de mayor edad.
- **Asociación, no causalidad**: los coeficientes describen correlaciones en los datos, no efectos causales de intervenciones clínicas.
- **Rendimiento modesto en términos absolutos**: ROC AUC de 0,670 y PR AUC de 0,219 sobre una prevalencia del 11,3 % implican una precisión baja en umbrales operativos (0,206 con recall 0,475).
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede producir probabilidades mal calibradas si la distribución de entrada se aleja de la del entrenamiento (por ejemplo, con códigos ICD-10 o variables nuevas).
- **Licencia MIT**: permite uso comercial y modificación, pero el dataset UCI subyacente tiene licencia CC BY 4.0 y requiere atribución; conviene revisar las condiciones de uso de datos clínicos derivados.
- **Dependencia de versión**: requiere `scikit-learn==1.9.*`; cambios de versión pueden romper la deserialización.
- **Carga con código no confiable**: el pipeline referencia una función del repositorio (`readmission.features.engineer`), por lo que es imprescindible revisar los tipos no confiables con `skops.io.get_untrusted_types` antes de cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igorlimamillis/diabetes-readmission-logistic
- Repositorio de código y experimentos: https://github.com/Igor-Millis/diabetes-readmission-logistic
- Artículo del autor: https://igor-millis.github.io/work/diabetes-readmission/
- Dataset UCI: https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008
- DOI del dataset: https://doi.org/10.24432/C5230J
- Artículo de referencia del dataset (Strack et al., 2014): *BioMed Research International*, 2014, 781670
