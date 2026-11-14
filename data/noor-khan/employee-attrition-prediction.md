# Noor-Khan/employee-attrition-prediction

## Resumen

`Noor-Khan/employee-attrition-prediction` es un modelo de clasificación tabular binaria publicado en Hugging Face que predice si un empleado abandonará una organización (etiquetas `Left` / `Stay`). No es un modelo de lenguaje ni una red neuronal: se trata de una regresión logística de scikit-learn entrenada sobre 23 características tabulares de recursos humanos (experiencia, edad, ubicación, historial de promociones, ajuste al rol, fuente de contratación, estado civil, grupo de empleado, función, antigüedad y género). Lo firma Noorullah Zamindar como proyecto de aprendizaje.

El modelo resuelve un problema clásico de analítica de RR. HH. (predicción de rotación) sobre un conjunto de datos pequeño y muy específico: 895 empleados tras la limpieza, procedentes de una única empresa no identificada con oficinas en la India. La salida es una etiqueta y una probabilidad de abandono, pensada para integrarse en un formulario web (Flask) más que para un pipeline de producción a gran escala.

Su relevancia es limitada y de carácter didáctico: sirve como ejemplo reproducible de un flujo completo de machine learning tabular (limpieza, codificación de variables, entrenamiento, evaluación y despliegue web), pero no como componente serio para decisiones reales de RR. HH. El repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la model card es inusualmente transparente sobre sus limitaciones y sobre los errores de la aplicación Flask que lo acompaña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn `LogisticRegression(max_iter=1000)`, C=1.0, penalizacion L2, solver lbfgs) |
| Parametros totales | 23 coeficientes + intercept (24 parametros aprendidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (pesos en coma flotante de precision estandar de scikit-learn) |
| Idiomas soportados | No disponible (las etiquetas de clase son cadenas en ingles: `Left` / `Stay`) |
| Licencia | MIT |
| Formato de pesos | `model.pkl` (pickle de scikit-learn); script `train.py` para reproducir el entrenamiento |

## Arquitectura y entrenamiento

El modelo es una regresión logística lineal estándar de scikit-learn, sin capas ocultas ni mecanismos de atención. Se entrenó con `LogisticRegression(max_iter=1000)` y los valores por defecto del resto de hiperparámetros (C=1.0, penalización L2, solver lbfgs), sobre las 23 características **sin escalado**, tal como hace la celda final del cuaderno original. Las clases son las cadenas `'Left'` (índice 0) y `'Stay'` (índice 1), de modo que `predict_proba(X)[:, 0]` devuelve la probabilidad de abandono.

Las características se construyen con codificaciones manuales: la ubicación se mapea a un rango entero por frecuencia (Chennai 7, Noida 6, Bangalore 5, Hyderabad 4, Pune 3, Madurai 2, Lucknow 1, cualquier otra 0); la promoción y el ajuste al rol son binarias; la fuente de contratación, la función, el grupo de antigüedad y el género se codifican one-hot; el estado civil conserva `Marr.`/`Single` y agrupa el resto en `other status`; el grupo de empleado conserva B1/B2/B3 y agrupa B0/B4/B5/B6/B7/C3/D2 en `other group`. Se descartan nombre, teléfono, id de tabla y antigüedad.

Los datos de entrenamiento provienen de `Table_1.csv`, una tabla de 902 filas crudas que tras la limpieza (eliminación de la primera fila y de 6 filas con valores faltantes en experiencia y ajuste al rol) queda en 895 empleados: 592 `Stay` y 303 `Left`. La partición es 80/20 estratificada con `random_state=42`, resultando en 716 de entrenamiento y 179 de test. El CSV original no estaba en el repositorio y se recuperó de un espejo público (`RajHarsh03/Employee-Attrition-Prediction/Dataset/Table_1.csv`); la model card documenta que el reentrenamiento reproduce el `model.pkl` original con una diferencia máxima de coeficientes de 0.0066 y de intercept de 0.0159, atribuida a la versión de scikit-learn (1.6.1 original frente a 1.9.1 en la reproducción). El conjunto de datos procede de una guía de Analytics Vidhya.

## Capacidades

- Clasificación binaria tabular: devuelve `Left` o `Stay` para un empleado descrito por las 23 características.
- Estimación de probabilidad de abandono mediante `predict_proba(X)[:, 0]`.
- Inferencia sobre una única fila de características (no por lotes en el diseño original, aunque scikit-learn admite lotes).
- Integración con una aplicación web Flask que recoge los datos mediante formulario y muestra la predicción.
- Reproducibilidad completa del entrenamiento mediante `train.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües más allá de las etiquetas de clase en inglés.

## Casos de uso

- **Demostración didáctica de un pipeline de ML tabular**: el repositorio sirve para ilustrar el ciclo completo (limpieza, codificación one-hot, partición estratificada, entrenamiento, evaluación con matriz de confusión y despliegue Flask) en cursos o talleres introductorios.
- **Prototipo de formulario de RR. HH. en Flask**: la aplicación del repositorio permite introducir los atributos de un empleado y obtener una predicción con probabilidad, útil como maqueta de interfaz antes de sustituir el modelo por uno más robusto.
- **Reproducción de experimentos académicos**: `train.py` y la documentación de la partición (`random_state=42`, estratificada) permiten replicar exactamente los resultados y verificar la afirmación de accuracy del 89.94 % sobre los 179 empleados de test.
- **Comparación de codificaciones de variables categóricas**: el modelo ejemplifica el impacto de decisiones de codificación (rango por frecuencia para ubicación, agrupación de categorías raras) sobre un modelo lineal, útil como caso de estudio metodológico.
- **Punto de partida para modelos basados en árboles**: dado que la regresión logística no captura interacciones, el mismo conjunto de datos y partición permite comparar con `RandomForest` o `GradientBoosting` para medir la mejora en la clase minoritaria.
- **Auditoría de sesgos en datos de RR. HH.**: el modelo permite discutir cómo la codificación de ubicación, género y estado civil puede introducir sesgos geográficos y demográficos, y por qué no debería usarse para decisiones reales.

## Benchmarks y rendimiento

Resultados medidos sobre los 179 empleados de test (118 `Stay`, 61 `Left`):

| Metrica | Valor |
|---|---|
| Accuracy en test | 0.8994 (161/179 correctos) |
| ROC-AUC (clase `Left`) | 0.9329 |
| Precision clase `Left` | 0.8413 |
| Recall clase `Left` | 0.8689 |
| F1 clase `Left` | 0.8548 |
| F1 macro | 0.8890 |
| Matriz de confusion (filas = real, columnas = predicho; orden Left, Stay) | [[53, 8], [10, 108]] |

La model card advierte explícitamente de que no se reutilizan dos cifras del cuaderno original (0.8659 sin escalado y 0.8883 con escalado) porque usaban otra partición (`random_state=4`, sin estratificar) y, en el caso sin escalado, una característica filtrada (el índice de fila del CSV). El 0.8994 corresponde a una medición nueva sobre la partición propia del modelo final. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo es un `model.pkl` de unos pocos kilobytes que se ejecuta en CPU.
- GPU recomendadas: no aplica; scikit-learn ejecuta la regresión logística en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (portátiles, contenedores ligeros, Raspberry Pi).
- Opciones de despliegue: scikit-learn en Python, servidor Flask (como en el repositorio original), o exportación a ONNX si se necesita servir en otro runtime. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza del modelo, la inferencia sobre una fila es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Noor-Khan/employee-attrition-prediction` | Regresion logistica tabular | 24 | No aplica | Accuracy 0.8994, ROC-AUC 0.9329 en su test de 179 filas | MIT | Hugging Face |
| `RajHarsh03/Employee-Attrition-Prediction` | Proyecto de analisis de attrition (origen del CSV espejo) | No disponible | No aplica | No disponible | No disponible | Hugging Face (dataset) |
| Modelos de arboles (RandomForest / GradientBoosting) sobre el mismo dataset | Ensemble tabular | No disponible | No aplica | No disponible (no medido en la informacion proporcionada) | No aplica | Implementaciones en scikit-learn |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como "no disponible".

## Limitaciones y advertencias

- Conjunto de datos de enseñanza muy pequeño (895 empleados) y de una única empresa no identificada con oficinas en la India; no es representativo de ninguna plantilla real y no debe usarse para decisiones reales de RR. HH.
- La ubicación se codifica como rango por frecuencia (Chennai=7 … Lucknow=1), lo que incorpora la geografía de esa empresa concreta y no transfiere a otras compañías o países.
- Las características no están escaladas y el modelo es lineal: no captura interacciones (por ejemplo, baja experiencia *y* ausencia de promoción) que un modelo de árboles sí podría capturar.
- El balance de clases es aproximadamente 2:1 (`Stay`:`Left`) y la clase de abandono es la más difícil: se escapa aproximadamente 1 de cada 8 abandonos y cerca de 1 de cada 6 alertas de "probable abandono" es una falsa alarma.
- Las columnas de nombre y teléfono son marcadores de posición ("sid", 9876544345) en todas las filas, por lo que el modelo no contiene información de identidad individual.
- La aplicación Flask del repositorio original tiene un fallo documentado: compara la predicción con el entero `1` (`pred == 1`, siempre falso) y lee `predict_proba(X)[0][1]` como probabilidad de abandono cuando el índice 1 corresponde a P(`Stay`). El modelo del repositorio de Hugging Face es correcto; para usarlo hay que emplear `predict(X)` para la etiqueta y `predict_proba(X)[:, 0]` para P(abandono).
- La licencia MIT permite uso comercial, pero las limitaciones estadísticas y de representatividad hacen desaconsejable cualquier uso en producción sin un conjunto de datos propio y un modelo recalibrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/employee-attrition-prediction
- Codigo fuente y aplicacion Flask: https://github.com/NoorullahZamindar-007/Employee-Attrition-Prediction-Web-App
- Espejo del dataset `Table_1.csv`: https://huggingface.co/RajHarsh03/Employee-Attrition-Prediction
- Guia de Analytics Vidhya de referencia: https://www.analyticsvidhya.com/blog/2021/11/employee-attrition-prediction-a-comprehensive-guide/
- Paper: no disponible
- Blog del autor: no disponible
- Demo publica: no disponible
