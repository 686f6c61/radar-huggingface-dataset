# pyaging/thompson

## Resumen

El modelo `thompson` es un reloj epigenético de envejecimiento para ratón (_Mus musculus_) desarrollado por el equipo de `pyaging`, una librería especializada en relojes de envejecimiento basados en datos ómicos. Se trata de un modelo de regresión elástica net que estima la edad cronológica a partir de los niveles de metilación de ADN en 582 sitios CpG, entrenado sobre 1.147 muestras de diez tejidos distintos y múltiples cepas de ratón. Fue publicado originalmente en 2018 por Thompson et al. en la revista _Aging (Albany NY)_.

Su relevancia radica en que permite estudiar el envejecimiento biológico en modelos murinos con una cobertura multi-tejido completa a lo largo de toda la vida del animal, y además puede detectar aceleración de la edad asociada a intervenciones (por ejemplo, fármacos o dietas) o a variantes genotípicas. A diferencia de los modelos de lenguaje, no genera texto ni procesa lenguaje natural; su entrada son matrices de metilación de ADN y su salida es una estimación de edad en unidades de tiempo. Está diseñado para integrarse en flujos de análisis con la librería `pyaging` y se distribuye bajo licencia BSD-3-Clause.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elástica net (combinación de regularización L1 y L2) |
| Parametros totales | No disponible (modelo lineal con 582 sitios CpG como características) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no es un modelo neuronal con pesos cuantizables) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (se distribuye a través de la librería `pyaging`, probablemente como coeficientes de regresión) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión elástica net, una técnica de regresión lineal regularizada que combina las penalizaciones L1 (lasso) y L2 (ridge). Esta elección permite seleccionar automáticamente un subconjunto de características relevantes (en este caso, sitios CpG) mientras maneja la multicolinealidad típica de los datos de metilación. El entrenamiento se realizó sobre 1.147 muestras de metilación de ADN obtenidas mediante secuenciación RRBS (Reduced Representation Bisulfite Sequencing), abarcando diez tejidos: tejido adiposo, sangre, cerebelo, corteza cerebral, corazón, riñón, hígado, pulmón, músculo esquelético y bazo. Se incluyeron múltiples cepas de ratón para capturar variabilidad genética. El modelo final utiliza 582 sitios CpG y fue ajustado para predecir la edad cronológica de forma directa. No se emplearon técnicas de RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Predicción de edad cronológica en ratones a partir de datos de metilación de ADN.
- Detección de aceleración de la edad asociada a intervenciones (farmacológicas, dietéticas) o a variantes genotípicas.
- Funcionamiento multi-tejido: cubre diez tejidos diferentes, lo que permite análisis comparativos entre tejidos.
- Compatibilidad con la librería `pyaging` mediante la función `pya.pred.predict_age(adata, ["thompson"])`.
- Entrenado sobre múltiples cepas de ratón, lo que mejora su generalización dentro de la especie.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Estudios de envejecimiento en modelos murinos: el modelo permite estimar la edad biológica de ratones a partir de muestras de tejido, facilitando la monitorización de trayectorias de envejecimiento en cohortes longitudinales.
- Evaluación de intervenciones anti-envejecimiento: al detectar aceleración o desaceleración de la edad, se puede cuantificar el efecto de fármacos, restricción calórica u otras terapias sobre el ritmo de envejecimiento.
- Análisis de variantes genéticas asociadas al envejecimiento: permite comparar la edad epigenética entre cepas o genotipos distintos para identificar factores genéticos que modulan el envejecimiento.
- Investigación en biomarcadores epigenéticos: sirve como herramienta de referencia para validar nuevos relojes epigenéticos o explorar la relación entre metilación y longevidad.
- Toxicología y seguridad farmacológica: puede usarse para evaluar si un compuesto acelera el envejecimiento celular en estudios preclínicos.
- Estudios de reprogramación celular o regeneración: al comparar la edad epigenética de tejidos antes y después de tratamientos, se puede medir el impacto de terapias regenerativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo fue descrito en el artículo original de Thompson et al. (2018), pero no se proporcionan métricas de rendimiento (como error absoluto medio o correlación) en la model card de HuggingFace. Se recomienda consultar la publicación citada para obtener datos de validación.

## Requisitos de hardware

- No requiere GPU: al ser un modelo de regresión lineal con 582 coeficientes, la inferencia es extremadamente ligera y se ejecuta en CPU sin problemas.
- Memoria RAM: inferior a 1 GB para la carga del modelo y los datos de entrada típicos.
- Almacenamiento: el tamaño del repositorio es de 0.0 GB, lo que indica que el modelo ocupa un espacio despreciable.
- Despliegue: se integra directamente en `pyaging` (Python), sin necesidad de infraestructura especializada como vLLM, llama.cpp u Ollama.
- Latencia: del orden de milisegundos por muestra, dependiendo del número de sitios CpG proporcionados.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros relojes epigenéticos de ratón comparables en la model card. Existen relojes alternativos como el de Horvath para ratón o el de Petkovich et al., pero no se han incluido datos cuantitativos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Específico de ratón: no debe aplicarse a datos de otras especies, incluyendo humanos, sin recalibración.
- Dependencia del tipo de datos: requiere datos de metilación obtenidos mediante RRBS con una cobertura compatible con los 582 sitios CpG seleccionados; otros métodos (como microarrays) pueden no ser directamente utilizables.
- Sesgo por tejido y cepa: aunque el modelo es multi-tejido, el rendimiento puede variar según el tejido de origen y la cepa del ratón; es recomendable validar en la población de interés.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; sin embargo, como todo modelo estadístico, puede producir estimaciones erróneas si los datos de entrada están fuera del rango de entrenamiento.
- Limitaciones de interpretación: la aceleración de edad detectada puede estar influida por factores técnicos (calidad de la secuenciación, normalización) que deben controlarse.
- Restricciones de licencia: la licencia BSD-3-Clause permite uso comercial con atribución, pero se debe citar el artículo original de Thompson et al. (2018) en publicaciones derivadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pyaging/thompson
- Documentación de pyaging: https://pyaging.readthedocs.io
- Artículo original: Thompson, M. J., Chwiałkowska, K., Rubbi, L. et al. A multi-tissue full lifespan epigenetic clock for mice. Aging (Albany NY) 10, 2832–2854 (2018). https://doi.org/10.18632/aging.101590
