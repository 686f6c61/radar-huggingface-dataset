# OneScience-Group/MeteoNorm-RF

## Resumen

MeteoNorm-RF es una reproducción de ingeniería independiente publicada por OneScience-Group en HuggingFace que implementa el método de normalización meteorológica mediante bosques aleatorios (random forests) descrito en el artículo «Assessing the impact of clean air action on air quality trends in Beijing using a machine learning technique» (Atmospheric Chemistry and Physics, 2019), firmado por equipos de la Universidad de Birmingham, la Academia China de Ciencias e instituciones colaboradoras. No es un modelo de lenguaje ni una red neuronal: es un modelo tabular de regresión con seis salidas que estima concentraciones de contaminantes normalizadas meteorológicamente a partir de observaciones horarias de 12 estaciones nacionales de monitorización de Pekín y de datos meteorológicos del aeropuerto.

El problema que aborda es la separación del efecto de la meteorología respecto de las tendencias de emisión a largo plazo, de forma que pueda evaluarse si las políticas de aire limpio han reducido realmente la contaminación. Para ello remuestrea condiciones meteorológicas dentro de horas coincidentes y ventanas estacionales cercanas, generando conjuntos normalizados, y aplica después un análisis de tendencia robusto de Theil-Sen. El método conserva además las diferencias estacionales, diurnas y entre estaciones.

Su relevancia actual es doble: por un lado, es un caso de reproducción abierta para AI4S (IA aplicada a la ciencia) dentro del ecosistema OneScience, orientado a validación de ingeniería (datos sintéticos, entrenamiento multi-GPU con `torchrun`, métricas de calidad del aire y visualización); por otro, sirve de plantilla metodológica para replicar estudios de atribución de políticas ambientales en otras redes de monitorización. El repositorio no incluye pesos preentrenados, ya que el artículo original no los publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest (bosque aleatorio) de regresión con seis salidas; modelo tabular, no neuronal. Framework de ejecución: PyTorch |
| Parametros totales | No disponible (no aplica en el sentido de redes neuronales; el README indica 12 arboles por defecto frente a los cientos del articulo, sin especificar profundidad ni numero de hojas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: entradas tabulares de 21 caracteristicas, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (no aplica: el checkpoint es un bosque serializado, no pesos de precision reducida) |
| Idiomas soportados | en (etiqueta declarada del repositorio; las entradas y salidas son numericas, no linguisticas) |
| Licencia | Apache 2.0 (codigo del repositorio); el articulo original se distribuye bajo CC BY 4.0 |
| Formato de pesos | Pickle (`result/checkpoints/meteonorm_rf.pkl`); no se distribuyen pesos (`weight/` vacio) |
| Variables de entrada | 21 caracteristicas temporales, meteorologicas y de estacion |
| Variables de salida | Concentraciones de seis contaminantes |
| Resolucion temporal | Horaria |
| Estaciones | 12 estaciones de monitorizacion |
| Frameworks y entorno | PyTorch; `onescience[earth-gpu]` / `onescience[earth-dcu]`; Python 3.11 |

## Arquitectura y entrenamiento

La arquitectura es un bosque aleatorio de regresión con seis salidas simultáneas, entrenado sobre datos tabulares con 21 características de entrada (temporales, meteorológicas y de estación), 12 estaciones de monitorización, seis contaminantes y frecuencia horaria. El entrenamiento emplea una partición fija 70/30 y soporta paralelismo a nivel de proceso sobre los árboles, además de ejecución distribuida mediante `torchrun` (`--nproc_per_node=8`). Los artefactos se guardan en `result/checkpoints/meteonorm_rf.pkl` y `result/training/metrics.json`. No se emplean técnicas de alineación tipo RLHF o DPO, que no aplican a este tipo de modelo.

La innovación metodológica no reside en la arquitectura, sino en el preprocesado y el análisis posterior: la normalización meteorológica se obtiene remuestreando condiciones meteorológicas dentro de horas coincidentes y ventanas estacionales cercanas, lo que permite construir conjuntos normalizados comparables entre años, y las tendencias se calculan con el estimador de Theil-Sen, robusto frente a valores atípicos. El repositorio incluye un generador de datos sintéticos (`scripts/fake_data.py`) que reproduce el número real de estaciones, contaminantes, características y frecuencia horaria, pero reduce el periodo a 30 días; estos datos sirven exclusivamente para validar el pipeline de entrenamiento, inferencia y evaluación, y no representan observaciones oficiales ni la escala del entrenamiento original. El artículo original no publica pesos preentrenados y el repositorio no incluye ninguno.

## Capacidades

- Predicción de concentraciones de seis contaminantes a partir de características temporales, meteorológicas y de estación.
- Normalización meteorológica mediante remuestreo de condiciones atmosféricas en horas coincidentes y ventanas estacionales próximas.
- Cálculo de tendencias a largo plazo con el estimador de Theil-Sen para los seis contaminantes.
- Conservación de diferencias estacionales, diurnas y entre estaciones en las series normalizadas.
- Evaluación con un conjunto amplio de métricas de calidad del aire: RMSE, R², FAC2, MB, MGE, NMB, NMGE, COE e IOA.
- Generación de comparativas visuales entre concentraciones observadas y normalizadas (`result/evaluation/comparison.png`).
- Entrenamiento distribuido multi-GPU y multi-DCU mediante `torchrun`, con flujos de trabajo de checkpoint.
- Validación de conectividad en CPU con la configuración de muestra pequeña.
- No dispone de tool calling ni function calling: no aplica a un modelo tabular de regresión.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de políticas de aire limpio: el modelo permite estimar qué parte de la reducción de contaminantes en Pekín se debe a cambios de emisión y qué parte a variaciones meteorológicas, aplicando normalización y tendencia de Theil-Sen sobre series horarias de 12 estaciones.
- Normalización meteorológica de series históricas: dado un conjunto de observaciones horarias con meteorología asociada, el modelo genera concentraciones normalizadas comparables entre periodos, lo que facilita comparaciones interanuales sin el sesgo de años meteorológicamente benignos o adversos.
- Análisis de tendencias robustas por contaminante y estación: con las predicciones normalizadas se calculan tendencias Theil-Sen desagregadas para cada uno de los seis contaminantes y cada una de las 12 estaciones, útil para informes regulatorios.
- Reproducción y validación de estudios científicos: el repositorio funciona como referencia ejecutable para verificar los resultados del artículo de 2019, con métricas de evaluación ya implementadas y comparación gráfica observado frente a normalizado.
- Validación de pipelines distribuidos en clústeres GPU/DCU: el flujo con `torchrun` y el paralelismo por árboles sirven para comprobar el rendimiento de tareas de entrenamiento distribuidas y la gestión de checkpoints en infraestructura OneScience.
- Adaptación a otras redes de monitorización: el esquema tabular (características temporales, meteorológicas y de estación) es reutilizable en otras ciudades o países sustituyendo el conjunto de datos, siempre que se mantenga la estructura de características y la resolución horaria.
- Docencia y formación en AI4S: el par de scripts de datos sintéticos y entrenamiento permite ilustrar el ciclo completo de un experimento científico reproducible sin necesidad de acceder a datos oficiales restringidos.
- Análisis contrafactual de episodios meteorológicos: al remuestrear condiciones meteorológicas, es posible estimar qué concentración se habría observado bajo un régimen meteorológico distinto al registrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio define un conjunto de métricas de evaluación (RMSE, R², FAC2, MB, MGE, NMB, NMGE, COE e IOA) y guarda los resultados en `result/evaluation/metrics.json`, pero el propio README advierte de que los datos utilizados son sintéticos y que los resultados de esa validación de ingeniería no representan el rendimiento formal del artículo.

| Conjunto de evaluacion | Metricas calculadas | Valores publicados |
|---|---|---|
| Datos sinteticos (30 dias) | RMSE, R², FAC2, MB, MGE, NMB, NMGE, COE, IOA | No disponibles |
| Observaciones oficiales (articulo 2019) | No detalladas en la informacion proporcionada | No disponibles |

## Requisitos de hardware

- GPU o DCU recomendada para el flujo completo de entrenamiento e inferencia; la CPU es suficiente para validación de conectividad con la configuración de muestra pequeña.
- Usuarios de DCU deben instalar DTK previamente; se recomienda DTK 25.04.2 o posterior, o la versión sugerida por OneScience para el clúster en uso.
- VRAM estimada: no disponible. Al tratarse de un bosque aleatorio tabular de 12 árboles por defecto, las necesidades de memoria son muy inferiores a las de un modelo neuronal de tamaño comparable, por lo que cabe con holgura en cualquier GPU de consumo, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. El README únicamente indica que se recomienda GPU o DCU y que el entrenamiento distribuido de referencia se lanza con 8 procesos (`torchrun --nproc_per_node=8`).
- Entornos soportados: `onescience[earth-gpu]` y `onescience[earth-dcu]`, sobre Python 3.11 (con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12` en el caso de GPU).
- Opciones de despliegue: script de inferencia local (`scripts/inference.py`) que carga el checkpoint pickle y escribe `result/output/predictions.npz`. No hay integración documentada con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables con especificaciones publicadas. La referencia metodológica directa es la implementación del artículo original de 2019, escrita en R con el paquete `randomForest`, de la que este repositorio es una reproducción independiente en Python/PyTorch, pero no se ofrecen datos comparativos de parámetros, contexto, rendimiento ni disponibilidad entre ambas.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeteoNorm-RF (este repositorio) | No disponible (12 arboles por defecto) | No aplica | Sin valores publicados | Apache 2.0 | HuggingFace, sin pesos |
| Implementacion original del articulo (R, randomForest) | No disponible | No aplica | No disponible en la informacion proporcionada | Articulo CC BY 4.0 | Referencia bibliografica |
| Otros modelos de normalizacion meteorologica | No disponible | No disponible | No disponible | No disponible | No disponibles |

## Limitaciones y advertencias

- Los datos incluidos en el repositorio son sintéticos y cubren solo 30 días; los resultados de entrenamiento y evaluación obtenidos con ellos validan la ingeniería, no el comportamiento científico del modelo.
- El repositorio no incluye pesos preentrenados (`weight/` está vacío) y el artículo original tampoco los publica, por lo que cualquier uso real exige entrenar desde cero con datos propios.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso, pese a que la ficha de HuggingFace lo etiquete como modelo al uso.
- Ámbito geográfico y temporal limitado: el diseño metodológico se validó con 12 estaciones de Pekín y meteorología del aeropuerto; extrapolarlo a otras regiones sin reentrenamiento puede introducir sesgos sistemáticos.
- La reducción por defecto de cientos de árboles a 12 disminuye la capacidad del bosque y puede degradar la estabilidad de las predicciones normalizadas si se usa tal cual.
- Riesgo de sobreajuste al esquema de partición fija 70/30 si el conjunto de datos propio es pequeño o poco representativo de la variabilidad estacional.
- Riesgo de interpretación incorrecta: las concentraciones normalizadas son estimaciones contrafactuales, no observaciones, y no deben presentarse como mediciones.
- Idiomas: la documentación está únicamente en inglés y las entradas son numéricas, por lo que no hay soporte multilingüe que evaluar.
- Licencia: el código se distribuye bajo Apache 2.0, lo que permite uso comercial con atribución; el artículo original está bajo CC BY 4.0. La model card queda truncada al describir las condiciones de los datos oficiales («the paper, official observ…»), por lo que deben verificarse por separado los términos de uso de las observaciones originales antes de cualquier aplicación en producción.
- No hay resultados de benchmarks publicados ni métricas de latencia o rendimiento, lo que impide estimar el coste operativo en un despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/MeteoNorm-RF
- Articulo de referencia (DOI): https://doi.org/10.5194/acp-19-11303-2019
- Entorno OneCode de programacion AI4S: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Repositorio principal OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio principal OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; unicamente aparecieron perfiles personales de redes sociales sin relacion con el proyecto, por lo que no se incluyen como enlaces.
