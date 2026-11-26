# sangjin99/Self-Training-for-Plant-Disease-Analysis

## Resumen

El repositorio `sangjin99/Self-Training-for-Plant-Disease-Analysis`, desarrollado por Kim Yong-Min, Jung Minah y Go Sangjin, es un conjunto de implementaciones de modelos y codigo de analisis para fenotipado vegetal y deteccion de enfermedades en hojas mediante segmentacion de imagenes y clasificacion. El pipeline cubre tres tareas: segmentacion de hoja a nivel de pixel, clasificacion de especie y enfermedad en un marco de 13 clases, y segmentacion de lesiones dentro de la hoja. El modelo se distribuye como un repositorio de codigo y pesos orientado a experimentacion reproducible, no como un checkpoint unico con una arquitectura declarada de forma explicita.

La relevancia del trabajo reside en su enfoque metodologico: combina aprendizaje supervisado, aumento de datos, optimizacion de hiperparametros con Optuna y aprendizaje semisupervisado mediante self-training con imagenes etiquetadas y no etiquetadas. Ademas, incluye evaluacion comparativa con conjuntos de datos externos de segmentacion vegetal, lo que permite reproducir y contrastar arquitecturas de vision para analisis de cultivos.

El modelo esta entrenado principalmente sobre PlantVillage, con incorporaciones puntuales de otras fuentes (Mendeley Data y AI-Hub) para determinadas clases. Su licencia es CC BY-SA 4.0 y su tamano de repositorio es de 0,1 GB. Esta pensado como herramienta de investigacion, no como sustituto del diagnostico de un fitopatologo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de implementaciones de segmentacion y clasificacion; no se declara una arquitectura unica) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ko |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El repositorio no declara una arquitectura unica, sino un pipeline de tres tareas implementadas con modelos de vision por computador: segmentacion de hoja, clasificacion de especie y enfermedad en 13 clases, y segmentacion de lesiones. El entrenamiento combina aprendizaje supervisado, aumento de datos, optimizacion de hiperparametros mediante Optuna y aprendizaje semisupervisado con self-training, aprovechando imagenes etiquetadas y no etiquetadas. Tambien se incluyen scripts de evaluacion comparativa con conjuntos de datos externos de segmentacion vegetal.

Los datos de entrenamiento provienen mayoritariamente de PlantVillage (Mohanty et al., 2016), con imagenes de hojas individuales sobre fondos uniformes y condiciones controladas. Se incorporan imagenes de patata sana del conjunto de Tilahun (Mendeley Data, 2020) y de calabaza (sana y con oidio) de AI-Hub (NIA, 2021). No se especifican en la informacion disponible el numero de tokens ni detalles de RLHF/DPO, al tratarse de un modelo de vision.

## Capacidades

- Segmentacion de hoja a nivel de pixel en imagenes de plantas.
- Clasificacion de especie y enfermedad en un marco de 13 clases.
- Segmentacion de lesiones enfermas dentro de la hoja.
- Aprendizaje semisupervisado y self-training con imagenes etiquetadas y no etiquetadas.
- Aumento de datos y optimizacion de hiperparametros con Optuna.
- Evaluacion comparativa con conjuntos de datos externos de segmentacion vegetal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: etiquetas en en y ko, sin procesamiento de lenguaje natural.
- Capacidades especiales (modo thinking, vision, audio): vision por computador para analisis de imagenes de plantas.

## Casos de uso

- Investigacion en fenotipado vegetal: el pipeline permite segmentar hojas y lesiones para cuantificar la extension de la enfermedad en experimentos controlados, gracias a la segmentacion a nivel de pixel.
- Deteccion temprana de enfermedades en invernadero: la clasificacion en 13 clases permite identificar especie y patologia en imagenes capturadas en condiciones controladas, adecuadas para invernaderos con fondos homogeneos.
- Evaluacion comparativa de arquitecturas de vision: los scripts de benchmark con conjuntos externos permiten contrastar modelos de segmentacion de hojas y lesiones de forma reproducible.
- Investigacion en aprendizaje semisupervisado: el pipeline de self-training sirve para estudiar el aprovechamiento de imagenes no etiquetadas en dominios agricolas con escasez de anotaciones.
- Automatizacion de conteo y medicion de lesiones: la segmentacion de lesiones permite calcular areas afectadas y generar metricas cuantitativas de severidad para informes agronomicos.
- Docencia y reproducibilidad: el repositorio incluye scripts de entrenamiento, evaluacion, visualizacion y analisis que facilitan la replicacion de experimentos en cursos y publicaciones.
- Preprocesado para pipelines agronomicos: la segmentacion de hoja puede actuar como paso previo para aislar la region de interes antes de otros analisis de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de la arquitectura concreta de cada tarea, no declarada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (el repositorio proporciona codigo de entrenamiento y evaluacion, no instrucciones de servido).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El repositorio no declara una arquitectura unica y no proporciona resultados de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La mayoria de las imagenes provienen de PlantVillage, capturadas en condiciones controladas con hojas individuales sobre fondos uniformes; el rendimiento puede degradarse en imagenes de campo con fondos complejos, iluminacion variable u oclusiones.
- Las imagenes de calabaza sana y con oidio provienen de AI-Hub, una fuente distinta al resto de clases, lo que puede introducir diferencias especificas de fuente en las caracteristicas de las imagenes.
- La clasificacion esta limitada a las 13 clases de especie y enfermedad presentes en los datos de entrenamiento; no se soportan especies o enfermedades fuera de ese conjunto.
- Los modelos son herramientas de investigacion y no sustituyen el diagnostico de fitopatologos o expertos agronomicos.
- Por la politica de redistribucion de AI-Hub, las imagenes originales de calabaza sana y con oidio no se redistribuyen; solo se proporcionan las anotaciones, y el usuario debe obtener las imagenes directamente de AI-Hub, donde puede requerirse registro y aprobacion.
- Se recomienda validar los modelos con datos representativos del entorno objetivo antes de extraer conclusiones, especialmente en imagenes de campo o invernadero.
- No se dispone de informacion sobre sesgos adicionales, riesgo de alucinacion (no aplica a un modelo de vision) ni restricciones especificas de la licencia CC BY-SA 4.0 mas alla de las inherentes a dicha licencia (atribucion y compartir igual).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sangjin99/Self-Training-for-Plant-Disease-Analysis
- Conjunto de datos en Zenodo: https://doi.org/10.5281/zenodo.23941775
- PlantVillage (Mohanty et al., 2016): https://doi.org/10.3389/fpls.2016.01419
- Potato Leaf (Healthy and Late Blight), Mendeley Data: https://doi.org/10.17632/v4w72bsts5.1
- AI-Hub, imagenes de diagnostico de enfermedades en cultivos de instalaciones: https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=153
- AI-Hub, imagenes de diagnostico de enfermedades en cultivos de campo abierto: https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=147
