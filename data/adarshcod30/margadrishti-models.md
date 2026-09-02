# adarshcod30/margadrishti-models

## Resumen

MargaDrishti Models es un conjunto de artefactos de aprendizaje automático entrenados para el sistema MargaDrishti, un sistema de predicción espacio-temporal sobre datos de violaciones de aparcamiento y eventos de tráfico en Bengaluru (India), entre noviembre de 2023 y abril de 2024. El autor, adarshcod30, publica estos modelos bajo licencia MIT con el objetivo de estimar la demanda de enforcement (patrullaje y capturas) y varios indicadores operativos de gestión de tráfico, como la duración de despeje de incidentes, la probabilidad de cierre de carreteras o la causa de un evento a partir de texto.

El repositorio incluye dos módulos de predicción: el módulo A (intensidad de aparcamiento, detección de hotspots y rechazo de capturas) y el módulo B (duración de despeje, cierre de carretera, prioridad de corredor y causa desde texto). Los modelos son mayoritariamente ensembles de árboles (RandomForest, XGBoost, CatBoost) y una regresión logística con n-gramas para texto. Se distribuyen en formato ONNX para facilitar su integración en producción, junto con ficheros de características y un panel de control en HuggingFace Spaces.

La relevancia de este proyecto radica en su transparencia: incluye una auditoría de sesgo de enforcement que concluye con nivel de preocupación ALTO, y publica los resultados completos en lugar de ocultarlos. Esto lo convierte en un caso de estudio útil para equipos que trabajan en movilidad urbana y en sistemas de decisión con impacto social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensembles de arboles (RandomForest, XGBoost, CatBoost) y regresion logistica con n-gramas para texto |
| Parametros totales | no disponible (modelos clasicos sin conteo de parametros publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (los artefactos ONNX no indican cuantizacion) |
| Idiomas soportados | no disponible (aunque el modelo B4 procesa texto en ingles y kannada, no es un modelo de lenguaje general) |
| Licencia | MIT |
| Formato de pesos | ONNX (ficheros .onnx) y ficheros auxiliares JSON de orden de caracteristicas |

## Arquitectura y entrenamiento

El sistema no emplea una unica arquitectura de red neuronal, sino un conjunto de modelos clasicos de ensemble entrenados sobre una base compartida de celdas H3 hexagonales y bins horarios. Cada modulo (A y B) agrupa varios objetivos de regresion o clasificacion. Los modelos principales son RandomForest, XGBoost y CatBoost, seleccionados por su rendimiento en validacion cronologica. Para la clasificacion de causa a partir de texto (B4) se utiliza una regresion logistica con caracteristicas de n-gramas a nivel de caracter.

El entrenamiento sigue una particion cronologica estricta (nunca aleatoria) con semilla 42. Los datos provienen de registros publicos anonimizados de violaciones de aparcamiento y eventos de trafico en Bengaluru. No se menciona el uso de tecnicas como RLHF o DPO, al tratarse de aprendizaje supervisado clasico. Una innovacion destacable es la conversion a ONNX mediante skl2onnx, que garantiza una conversion exacta para RandomForest (error maximo 1.0e-06, y el clasificador es bit-exacto), mientras que onnxmltools introduce divergencias de hasta 0.09 en algunos casos con LightGBM, por lo que se descarto este ultimo.

## Capacidades

- Prediccion de intensidad de aparcamiento (A1): estima la demanda de enforcement por celda y hora, con una desviancia de Poisson de 0.5014 (mejor familia: XGBoost).
- Deteccion de hotspots (A2): identifica zonas de alta concentracion de infracciones, con PR-AUC de 0.1438 (CatBoost), aproximadamente 49 veces la tasa base.
- Estimacion de duracion de despeje de incidentes (B1): predice el tiempo necesario para despejar un evento, con error absoluto medio de 0.4990 (XGBoost).
- Probabilidad de cierre de carretera (B2): clasifica si un evento provocara cierre, con PR-AUC de 0.3615 (CatBoost).
- Clasificacion de causa a partir de texto (B4): asigna una causa a partir de descripciones textuales, con macro-F1 de 0.478 (regresion logistica con n-gramas).
- Prioridad de corredor (B3): clasifica si un corredor tiene prioridad alta, aunque este objetivo es una regla recuperada (99.84% de precision) y no una prediccion real.
- Capacidad multilingue limitada: el modelo B4 muestra una diferencia minima entre ingles (0.483) y kannada (0.472) en macro-F1, lo que indica un comportamiento equitativo entre ambos idiomas en ese campo.

## Casos de uso

- Planificacion de patrullas de enforcement: el modulo A1 permite asignar recursos de inspeccion a las celdas y horas con mayor demanda prevista, optimizando el despliegue de agentes sobre el terreno.
- Gestion de incidentes de trafico: con B1 y B2, los centros de control pueden estimar cuanto tiempo tardara en despejarse un incidente y si provocara un cierre de via, mejorando la comunicacion a conductores y la coordinacion de servicios de emergencia.
- Analisis de equidad en politicas de aparcamiento: la auditoria de sesgo publicada permite a los responsables municipales evaluar si el sistema reproduce sesgos de patrullaje historico y ajustar las politicas en consecuencia.
- Clasificacion automatica de partes de incidentes: B4 puede procesar descripciones textuales de eventos (en ingles o kannada) y asignar una causa estandarizada, reduciendo el trabajo manual de los operadores.
- Priorizacion de intervenciones en corredores: B3, aunque es una regla, puede integrarse en un sistema de alerta para senalar corredores con prioridad alta segun la normativa vigente.
- Investigacion en movilidad urbana: los datos y modelos publicados sirven como referencia para estudiar la relacion entre patrullaje, capturas y distribucion espacial de infracciones, asi como para comparar metodologias de prediccion espacio-temporal.

## Benchmarks y rendimiento

La model card publica los siguientes resultados principales, comparados con la mejor linea base de cada objetivo:

| Objetivo | Mejor familia | Metrica | Resultado | vs linea base |
|---|---|---|---|---|
| A1 · intensidad de aparcamiento | XGBoost | Desviancia de Poisson | 0.5014 | +42.9% |
| A2 · hotspot | CatBoost | PR-AUC | 0.1438 | ~49x tasa base (0.29%) |
| A3 · rechazo de capturas | XGBoost | PR-AUC | 0.3088 | no respondible |
| B1 · duracion de despeje | XGBoost | Error absoluto medio | 0.4990 ± 0.128 | +27.7% |
| B2 · cierre de carretera | CatBoost | PR-AUC | 0.3615 ± 0.071 | ~4x (prevalencia 8.3%) |
| B4 · causa desde texto | Char n-gram + logreg | Macro-F1 | 0.478 | 10.8x |

No se han publicado resultados de benchmarks comparativos con otros modelos externos en la informacion disponible.

## Requisitos de hardware

- Los modelos son de tamano reducido (ensembles de arboles y regresion logistica), por lo que no requieren GPU para inferencia.
- Se pueden ejecutar en CPU con normalidad; un equipo con 4-8 GB de RAM es suficiente para cargar todos los artefactos.
- No se ha estimado VRAM porque no es necesario.
- Despliegue recomendado: ONNX Runtime para los ficheros .onnx, o bien cargar los modelos originales con scikit-learn, XGBoost o CatBoost segun corresponda.
- Tambien se puede integrar en pipelines de datos con Apache Spark o en servicios REST mediante FastAPI o Flask.
- La latencia es del orden de milisegundos por prediccion en CPU, aunque no se han publicado mediciones formales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente en la misma categoria (prediccion de enforcement de aparcamiento y eventos de trafico con datos espacio-temporales). El proyecto se presenta como un caso unico por su enfoque en la auditoria de sesgo y su publicacion abierta. Por tanto, la comparativa con alternativas no esta disponible.

## Limitaciones y advertencias

- Sesgo de enforcement: los modelos predicen demanda de enforcement, no la ubicacion real de infracciones. La correlacion entre horas de patrullaje y capturas es de 0.967, lo que explica el 94% de la varianza en recuentos por celda. Cualquier uso debe tener en cuenta que los hotspots pueden reflejar simplemente donde se patrulla mas.
- Auditoria de sesgo: el informe de equidad del proyecto concluye con nivel de preocupacion ALTO. Ningun hotspot Getis-Ord sobrevive al ajuste por exposicion, lo que indica que los resultados pueden estar fuertemente influenciados por la actividad de patrullaje historica.
- Objetivo A3 (rechazo de capturas) no es fiable: el proceso de revision cambio de regimen a mitad de la ventana de datos (febrero de 2024, rechazo de 0.790 frente a ~0.28), por lo que todos los modelos de esta familia estan mal calibrados.
- Objetivo B3 (prioridad) es una regla recuperada, no una prediccion: el estado del corredor predice prioridad alta con un 99.84% de precision (13 excepciones en 8,173 eventos). Las metricas cercanas a 1.0 reflejan esa regla, no capacidad predictiva.
- Riesgo de alucinacion: no aplica al ser modelos tabulares, pero si existe riesgo de sobreajuste a los sesgos de los datos historicos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero los datos fuente son publicaciones anonimizadas sujetas a sus propios terminos originales.
- Limitaciones de contexto: al ser modelos tabulares, no procesan secuencias largas ni dialogos; su uso se limita a las caracteristicas definidas en los ficheros .features.json.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/adarshcod30/margadrishti-models
- Panel de control en HuggingFace Spaces: https://huggingface.co/spaces/adarshcod30/margadrishti
- Repositorio GitHub del proyecto: https://github.com/adarshcod30/MargaDrishti
- Auditoria de sesgo de enforcement: https://github.com/adarshcod30/MargaDrishti/blob/main/reports/fairness_audit.md
