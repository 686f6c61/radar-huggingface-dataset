# pyaging/phenoage

## Resumen

El modelo `pyaging/phenoage` es un reloj de envejecimiento biológico desarrollado por Levine et al. en 2018, implementado en la librería `pyaging` para Python. Su función principal es estimar la "edad fenotípica" de un individuo combinando su edad cronológica con nueve biomarcadores sanguíneos seleccionados mediante regresión de riesgos penalizados. Esta edad fenotípica expresa el riesgo de mortalidad equivalente en años, lo que permite cuantificar el envejecimiento biológico de forma más precisa que la edad cronológica.

A diferencia de los modelos de lenguaje, este es un modelo estadístico clásico: una regresión de riesgos proporcionales penalizada (tipo Cox) con calibración mediante distribución de Gompertz. Está diseñado para datos tabulares de biomarcadores clínicos, no para texto, y se distribuye bajo licencia BSD-3-Clause, lo que permite uso comercial y modificación. Su relevancia actual radica en su aplicación en estudios de longevidad, epidemiología y evaluación de intervenciones antienvejecimiento, donde se utiliza como biomarcador compuesto de salud y riesgo de mortalidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión de riesgos penalizados (tipo Cox) con calibración Gompertz |
| Parametros totales | No disponible (modelo estadístico, no neuronal) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 9 biomarcadores + edad) |
| Tipos de cuantizacion | No aplica (modelo no neuronal) |
| Idiomas soportados | No aplica (entrada numérica) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (implementado en `pyaging`, probablemente coeficientes en formato interno) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión de riesgos proporcionales penalizada (elastic net o similar) sobre la edad cronológica y nueve biomarcadores sanguíneos: albúmina, creatinina, glucosa, proteína C reactiva, porcentaje de linfocitos, volumen corpuscular medio, ancho de distribución eritrocitaria, fosfatasa alcalina y recuento de glóbulos blancos. La selección de estos biomarcadores se realizó mediante regresión de Cox penalizada sobre datos de mortalidad de la cohorte NHANES, y posteriormente se calibró el riesgo predicho a una escala de "edad equivalente" usando una distribución de Gompertz. El entrenamiento se realizó con datos de mortalidad a largo plazo, optimizando la discriminación del riesgo. No se trata de un modelo de aprendizaje profundo, sino de un modelo estadístico clásico con coeficientes lineales, lo que lo hace altamente interpretable y ligero.

## Capacidades

- Predicción de edad fenotípica (edad biológica equivalente) a partir de 9 biomarcadores sanguíneos y edad cronológica.
- Estimación de riesgo de mortalidad relativo, expresado como edad equivalente.
- Uso como biomarcador compuesto de salud en estudios poblacionales.
- Integración con la librería `pyaging` para análisis de datos de expresión y metilación, aunque el modelo en sí es independiente.
- No tiene capacidades de generación de texto, código, visión ni razonamiento, al ser un modelo tabular.
- No soporta tool calling ni agentes.

## Casos de uso

- Evaluación de intervenciones antienvejecimiento: investigadores pueden medir la edad fenotípica antes y después de una intervención (dieta, fármacos, ejercicio) para cuantificar su efecto sobre el envejecimiento biológico.
- Estratificación de riesgo en medicina preventiva: clínicas de longevidad usan el modelo para identificar pacientes con envejecimiento acelerado y priorizar seguimiento.
- Análisis epidemiológico: estudios de cohortes pueden usar la edad fenotípica como variable de resultado en asociaciones con factores ambientales o genéticos.
- Validación de nuevos biomarcadores: se puede comparar la capacidad predictiva de nuevos marcadores frente a la edad fenotípica establecida.
- Control de calidad en biobancos: evaluar la integridad de muestras sanguíneas mediante la coherencia entre edad cronológica y fenotípica.
- Investigación traslacional en gerociencia: el modelo sirve como endpoint intermedio en ensayos clínicos de fármacos antienvejecimiento, donde la mortalidad real es poco práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original reporta en el paper de Levine et al. (2018) una discriminación de mortalidad con un área bajo la curva (AUC) de aproximadamente 0.78 en la cohorte NHANES, pero estos datos no están incluidos en la ficha de HuggingFace y no se pueden verificar de forma independiente.

## Requisitos de hardware

- El modelo es extremadamente ligero al ser una regresión lineal con pocos coeficientes. Se puede ejecutar en cualquier CPU, incluso en un microcontrolador.
- No requiere GPU ni memoria VRAM significativa.
- La inferencia es instantánea para una sola muestra; el coste principal está en la preparación de los datos de entrada (9 biomarcadores).
- Despliegue sencillo: se integra como función en Python mediante `pyaging`, sin necesidad de servidores de inferencia como vLLM u Ollama.
- Para procesamiento por lotes en estudios grandes, se puede ejecutar en paralelo con NumPy o pandas sin problemas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables. Existen otros relojes de envejecimiento (por ejemplo, PhenoAge original, GrimAge, Hannum), pero no se dispone de datos en la ficha para comparar parámetros, rendimiento o licencias.

## Limitaciones y advertencias

- El modelo fue entrenado con datos de una cohorte estadounidense (NHANES) y puede no ser generalizable a otras poblaciones con diferentes distribuciones étnicas o socioeconómicas.
- Requiere los nueve biomarcadores exactos y con unidades estandarizadas; desviaciones en las mediciones de laboratorio pueden afectar la precisión.
- La edad fenotípica es una estimación de riesgo de mortalidad, no un diagnóstico clínico. No debe usarse para decisiones médicas individuales sin supervisión profesional.
- No tiene capacidad de manejar datos faltantes; si falta algún biomarcador, el modelo no puede generar una predicción.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar el trabajo original (Levine et al., 2018) en publicaciones derivadas.
- Al ser un modelo estadístico fijo, no se actualiza con nuevos datos; su validez depende de la población original.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/phenoage
- Paper original: Levine, M. E., et al. "An epigenetic biomarker of aging for lifespan and healthspan." Aging 10.4 (2018): 573-591. DOI: https://doi.org/10.18632/aging.101414
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
