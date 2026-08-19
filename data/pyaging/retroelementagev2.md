# pyaging/retroelementagev2

## Resumen

retroelementagev2 es un reloj epigenético de envejecimiento desarrollado por el equipo de pyaging, que estima la edad cronológica de un individuo a partir de los niveles de metilación del ADN en sangre completa. Se basa en la extensión del trabajo original "Retro-age" (Ndhlovu et al., 2024), que utiliza los estados de metilación de retroelementos como biomarcador del envejecimiento. La versión 2 amplía la anotación de retroelementos para ser compatible con las plataformas de arrays de metilación EPIC v1.0 y v2.0, lo que facilita su uso en estudios con datos generados por ambas tecnologías.

El modelo se implementa como una regresión elastic net con validación cruzada de 10 pliegues, una técnica estadística robusta para seleccionar variables y regularizar coeficientes en problemas de alta dimensionalidad. Está diseñado para integrarse en el ecosistema pyaging, una librería de Python especializada en relojes de envejecimiento, y se distribuye bajo licencia BSD-3-Clause. Su relevancia radica en ofrecer una herramienta accesible y reproducible para la investigación del envejecimiento biológico, con un enfoque específico en la contribución de los retroelementos al proceso de envejecimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net (modelo lineal regularizado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo de coeficientes numericos) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en la libreria pyaging) |

## Arquitectura y entrenamiento

El modelo es una regresion elastic net, que combina las penalizaciones L1 y L2 para seleccionar un subconjunto de sitios CpG relevantes y evitar el sobreajuste en datos de alta dimensionalidad. El entrenamiento se realizo mediante validacion cruzada de 10 pliegues, un metodo estandar para estimar el rendimiento del modelo y ajustar los hiperparametros de regularizacion. Los datos de entrada son niveles de metilacion de ADN en sangre completa de individuos humanos, y la variable objetivo es la edad cronologica. La innovacion principal radica en el uso de anotaciones de retroelementos, que son secuencias repetitivas del genoma cuya metilacion se ha asociado con el envejecimiento celular. La version 2 amplia estas anotaciones para cubrir los sitios CpG presentes en los arrays EPIC v1.0 y v2.0, garantizando compatibilidad con los datos generados por ambas plataformas.

No se dispone de informacion detallada sobre el numero total de muestras de entrenamiento, el numero de sitios CpG seleccionados o los hiperparametros exactos de la regresion. El modelo se distribuye como parte de la libreria pyaging, que proporciona una interfaz unificada para cargar y aplicar multiples relojes de envejecimiento.

## Capacidades

- Prediccion de edad cronologica a partir de datos de metilacion de ADN de sangre completa.
- Compatibilidad con datos de arrays de metilacion EPIC v1.0 y v2.0.
- Uso de anotaciones de retroelementos como caracteristicas predictivas, ofreciendo una perspectiva especifica sobre el envejecimiento epigenetico.
- Integracion con el ecosistema pyaging, que permite comparar multiples relojes y evaluar su rendimiento en un mismo conjunto de datos.
- Modelo ligero y de inferencia rapida, adecuado para su aplicacion en estudios con miles de muestras.
- No soporta generacion de texto, razonamiento, codigo, vision ni funciones de agente, al ser un modelo estadistico tabular.

## Casos de uso

- Investigacion biomedica del envejecimiento: permite cuantificar la edad biologica en cohortes de individuos y estudiar su asociacion con enfermedades relacionadas con la edad, como cancer, enfermedades cardiovasculares o neurodegenerativas.
- Estudios longitudinales: se puede aplicar a muestras de sangre recolectadas en multiples puntos temporales para monitorizar la tasa de envejecimiento individual y evaluar el efecto de intervenciones (dieta, ejercicio, farmacos).
- Validacion de biomarcadores: sirve como herramienta de referencia para comparar nuevos relojes epigeneticos o para evaluar la contribucion especifica de los retroelementos al envejecimiento.
- Analisis de datos publicos de metilacion: dado que es compatible con EPIC v1.0 y v2.0, puede aplicarse a conjuntos de datos disponibles en repositorios como GEO o TCGA sin necesidad de re-anotar los CpGs.
- Desarrollo de paneles de diagnostico: en un contexto clinico, podria integrarse en pipelines de analisis de metilacion para estimar la edad biologica de pacientes, aunque se requiere validacion adicional en poblaciones diversas.
- Educacion y formacion: como parte de pyaging, es util para ensenar conceptos de relojes epigeneticos y regresion penalizada en cursos de bioinformatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de rendimiento como correlacion con la edad cronologica, error absoluto medio (MAE) o coeficiente de determinacion (R2). El articulo original de Retro-age (Ndhlovu et al., 2024) reporta resultados, pero no se han incluido en la model card ni en la informacion facilitada.

## Requisitos de hardware

- Al ser un modelo de regresion lineal con un numero reducido de coeficientes, no requiere GPU. La inferencia se realiza en CPU en milisegundos.
- Memoria RAM minima: menos de 1 GB para cargar los coeficientes y procesar una muestra individual.
- Para aplicaciones a gran escala (miles de muestras), se recomienda un equipo con al menos 8 GB de RAM, aunque el modelo en si no es el cuello de botella; el procesamiento de los datos de metilacion (normalizacion, imputacion) es lo que consume recursos.
- No se requiere despliegue en servidores especializados; puede ejecutarse en cualquier maquina con Python y la libreria pyaging instalada.
- No se dispone de datos de latencia o throughput especificos, pero dado el tamano del modelo, se espera un rendimiento superior a miles de predicciones por segundo en un CPU moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros relojes epigeneticos en la informacion proporcionada. Existen alternativas conocidas como el reloj de Horvath (basado en 353 CpGs), PhenoAge (basado en 513 CpGs) o GrimAge, pero no se han incluido sus resultados en la model card. Se recomienda consultar el articulo original de Retro-age para comparaciones con estos metodos. La principal diferencia de retroelementagev2 es su enfoque en retroelementos y su compatibilidad con EPIC v2.0, mientras que muchos relojes clasicos se desarrollaron para arrays anteriores (450K o EPIC v1.0).

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos de sangre completa de Homo sapiens; su aplicacion a otros tejidos o especies puede producir predicciones poco fiables.
- La metilacion del ADN varia con factores como la composicion celular de la sangre, el tabaquismo o la edad cronologica real, lo que puede introducir sesgos en la estimacion de la edad biologica.
- No se han publicado metricas de rendimiento en la informacion disponible, por lo que se desconoce su precision absoluta y su comportamiento en poblaciones no caucasicas o con enfermedades.
- La licencia BSD-3-Clause permite uso comercial, pero se debe citar adecuadamente el trabajo original en publicaciones cientificas.
- Al ser un modelo estadistico, no captura efectos no lineales complejos; si el envejecimiento epigenetico sigue patrones no lineales, la regresion elastic net podria subestimar o sobreestimar en edades extremas.
- La compatibilidad con EPIC v2.0 se menciona en la descripcion, pero no se especifica si se han validado los CpGs anotados en ambas plataformas con datos reales de ambos arrays.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/retroelementagev2
- Documentacion de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Articulo original (DOI): https://doi.org/10.1111/acel.14288
