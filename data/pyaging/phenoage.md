# pyaging/phenoage

## Resumen

PhenoAge es un reloj biológico de envejecimiento clínico que estima la edad fenotípica de un individuo a partir de su edad cronológica y nueve biomarcadores sanguíneos. Fue desarrollado originalmente por Levine et al. (2018) y este repositorio lo empaqueta para su uso dentro de la librería Python `pyaging`, que actúa como catálogo unificado de relojes de envejecimiento. No se trata de un modelo de lenguaje ni de una red neuronal: es un modelo estadístico de regresión de riesgos penalizada con calibración de Gompertz, entrenado sobre datos clínicos de población adulta.

El interés actual del modelo radica en su utilidad como medida de envejecimiento acelerado o decelerado en estudios biomédicos y epidemiológicos. A diferencia de los relojes epigenéticos, PhenoAge solo requiere analíticas sanguíneas rutinarias (albúmina, creatinina, glucosa, proteína C reactiva, linfocitos, volumen corpuscular medio, distribución eritrocitaria, fosfatasa alcalina y recuento leucocitario), lo que lo hace mucho más accesible que las firmas de metilación de ADN.

La versión empaquetada en este repositorio corrige un error de calibración presente en `pyaging` 0.6.1, donde la inclusión de un término erróneo en el logaritmo comprimía las puntuaciones cerca de 141,50 años. La ecuación de Kuo et al. (2021) restaura la escala de edad preservando el ordenamiento de mortalidad, y requiere `pyaging >= 0.6.2`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión de riesgos penalizada con calibración de Gompertz |
| Parámetros totales | no disponible (modelo estadístico, no red neuronal) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible |
| Licencia | MIT (software); los pesos retienen los términos de los autores originales |
| Formato de pesos | no disponible (integrado en la librería `pyaging`) |

## Arquitectura y entrenamiento

PhenoAge no es un transformer ni un modelo generativo. Se construye mediante regresión de riesgos penalizada (penalized hazards regression) sobre datos de mortalidad y morbilidad, seguida de una calibración de Gompertz que convierte la puntuación de riesgo en una escala de edad fenotípica en años. La ecuación de conversión de edad empleada en esta versión sigue la corrección publicada por Kuo et al. (2021), sección 4.3.

El modelo original fue entrenado por Levine et al. (2018) sobre datos del estudio NHANES (National Health and Nutrition Examination Survey) de EE. UU., combinando edad cronológica con nueve biomarcadores clínicos. La verificación de calibración reportada en la model card se realizó sobre 5.645 adultos de NHANES 2009–2010, donde el 98,2 % de las puntuaciones de la versión 0.6.1 caían dentro de 0,1 años de 141,50, evidenciando el problema de compresión corregido en 0.6.2. Un detalle técnico relevante: la proteína C reactiva debe suministrarse en mg/dL en bruto, y `pyaging` la trunca a un mínimo de 0,01 mg/dL antes de aplicar el logaritmo natural.

## Capacidades

- Predicción de edad fenotípica (en años) a partir de edad cronológica y nueve biomarcadores sanguíneos.
- Estimación del envejecimiento acelerado o decelerado comparando edad fenotípica con edad cronológica.
- Asociación con riesgo de mortalidad y morbilidad, preservada tras la corrección de calibración.
- Integración directa con el ecosistema `pyaging` mediante `pya.pred.predict_age(adata, ["phenoage"])`.
- Aplicable a datos en formato AnnData, lo que facilita su uso en flujos de análisis bioinformático en Python.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo predictivo univariante.
- Capacidades multilingües: no aplica.

## Casos de uso

- Estudios epidemiológicos de envejecimiento: calcular la edad fenotípica de cohortes con analíticas sanguíneas disponibles para comparar el ritmo de envejecimiento entre subpoblaciones, sin necesidad de datos epigenéticos.
- Investigación clínica sobre intervenciones: evaluar si una intervención (dieta, ejercicio, fármacos) reduce la diferencia entre edad fenotípica y cronológica en ensayos longitudinales.
- Análisis de biobancos: procesar grandes cohortes tipo UK Biobank o NHANES en las que ya existen los nueve biomarcadores requeridos, aprovechando la integración con AnnData y `pyaging`.
- Medicina preventiva y estratificación de riesgo: usar la edad fenotípica como variable de riesgo adicional en modelos de predicción de mortalidad, dado que el modelo preserva el ordenamiento de mortalidad del original.
- Reproducibilidad de estudios previos: recalcular puntuaciones de PhenoAge con la calibración corregida (Kuo et al. 2021) para verificar resultados publicados con versiones anteriores de `pyaging`.
- Docencia y formación en bioestadística: ejemplo práctico de regresión de riesgos con calibración de Gompertz y de gestión de erratas en modelos publicados.
- Comparación de relojes biológicos: usar PhenoAge junto con relojes epigenéticos del catálogo de `pyaging` para analizar la concordancia entre medidas de envejecimiento de distinta naturaleza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la verificación de calibración sobre 5.645 adultos de NHANES 2009–2010, donde el 98,2 % de las puntuaciones de `pyaging` 0.6.1 caían dentro de 0,1 años de 141,50, lo que motivó la corrección introducida en 0.6.2.

## Requisitos de hardware

- No requiere GPU: es un modelo estadístico de regresión, no una red neuronal.
- Se ejecuta en CPU en milisegundos por muestra; el coste dominante es la carga de datos y el preprocesado.
- Cabe en cualquier máquina con Python y `pyaging >= 0.6.2` instalado.
- El tamaño del repositorio es de 0,0 GB, lo que indica que los coeficientes ocupan un espacio despreciable.
- Despliegue: directamente como función de `pyaging` (`pya.pred.predict_age`); no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita, pero al tratarse de una regresión sobre nueve variables, el cálculo es prácticamente instantáneo.

## Comparativa con modelos similares

| Modelo | Tipo de dato | Predictor | Licencia | Disponibilidad |
|---|---|---|---|---|
| PhenoAge (este) | Biomarcadores clínicos | Regresión de riesgos penalizada + Gompertz | MIT (software) | Hugging Face / `pyaging` |
| Relojes epigenéticos (p. ej. Horvath, Hannum) | Metilación de ADN | Regresión penalizada sobre CpGs | Varía según implementación | Catálogo `pyaging` |
| Otros relojes de `pyaging` | Varía (transcriptómica, proteómica, clínica) | Varía | Varía | Catálogo `pyaging` |

No se dispone en la información proporcionada de cifras comparativas de rendimiento frente a estos modelos. La ventaja diferencial de PhenoAge es que solo necesita analíticas rutinarias, mientras que los relojes epigenéticos requieren datos de metilación, más costosos de obtener.

## Limitaciones y advertencias

- Sesgos poblacionales: el modelo se entrenó con datos de NHANES (EE. UU.); su calibración puede no transferirse a otras poblaciones o grupos étnicos sin revalidación.
- La versión 0.6.1 de `pyaging` contenía un error de calibración que comprimía las puntuaciones cerca de 141,50 años; es imprescindible usar `pyaging >= 0.6.2` para obtener resultados válidos.
- La proteína C reactiva debe introducirse en mg/dL en bruto; `pyaging` la trunca a 0,01 mg/dL antes del logaritmo, lo que afecta a valores muy bajos.
- Requiere los nueve biomarcadores completos; la ausencia de alguno impide el cálculo.
- No es un modelo generativo: no produce texto, código ni razonamiento, por lo que no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia: el software es MIT, pero los pesos retienen los términos de los autores originales; el uso comercial debe verificarse contra dichos términos.
- Riesgo de mala interpretación clínica: la edad fenotípica es una medida de investigación, no un diagnóstico médico validado para uso individual.
- Idiomas soportados y formato de pesos no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/pyaging/phenoage
- Catálogo de relojes de pyaging: https://pyaging.readthedocs.io
- Artículo original (Levine et al., 2018): https://doi.org/10.18632/aging.101414
- Corrección de calibración (Kuo et al., 2021): https://doi.org/10.1111/acel.13376
