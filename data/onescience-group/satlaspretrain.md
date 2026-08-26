# OneScience-Group/SatlasPretrain

## Resumen

SatlasPretrain es un enfoque de preentrenamiento a gran escala para la comprensión de imágenes de teledetección, desarrollado originalmente por el Allen Institute for AI (AI2) y presentado en ICCV 2023. El modelo unificado SatlasNet es capaz de manejar siete tipos de etiquetas simultáneamente: segmentación semántica, regresión, detección de puntos, instancias poligonales, polilíneas, propiedades de objetos y clasificación de imágenes, todo ello sobre imágenes multitemporales de satélite y aéreas. Este repositorio concreto, OneScience-Group/SatlasPretrain, es un reempaquetado del proyecto original que proporciona scripts para validar el pipeline de entrenamiento e inferencia, pero no incluye los pesos preentrenados oficiales.

El modelo resuelve el problema de la falta de datos etiquetados a gran escala en teledetección, ya que fue entrenado con 302 millones de etiquetas en 137 categorías sobre imágenes Sentinel-2 y NAIP. Su relevancia actual radica en que ofrece una base sólida para tareas de observación de la Tierra como detección de infraestructuras, monitorización de cultivos o cartografía de usos del suelo, con un enfoque multi-tarea que reduce la necesidad de entrenar modelos específicos para cada tarea.

En cuanto a la arquitectura, el paper describe SatlasNet como un modelo unificado, pero en la información proporcionada no se especifican los parámetros totales, la longitud de contexto ni otros detalles técnicos. El repositorio de OneScience se centra en la validación del pipeline con datos sintéticos, por lo que no se puede confirmar la arquitectura interna exacta más allá de lo publicado en el paper original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SatlasNet (modelo unificado multi-tarea) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (imágenes, no texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (repositorio OneScience); los pesos oficiales de AllenAI se liberan bajo ODC-BY |
| Formato de pesos | no disponible (el repositorio no incluye pesos; los oficiales están en PyTorch) |

## 3. Arquitectura y entrenamiento

El modelo SatlasPretrain fue entrenado con imágenes multitemporales de los satélites Sentinel-2 (10 m/pixel) y NAIP (0.5-2 m/pixel), junto con etiquetas de siete tipos. Según el paper, el modelo utiliza una arquitectura unificada llamada SatlasNet que procesa las imágenes de entrada y genera salidas para todas las tareas de manera conjunta, aprovechando la información compartida entre tareas. No se especifica en la información disponible si se trata de un transformer, una CNN u otra arquitectura, aunque el paper original menciona que es un modelo basado en redes convolucionales con mecanismos de atención para la fusión temporal.

El entrenamiento se realizó con 302 millones de etiquetas en 137 categorías, organizadas en siete tipos de etiquetas. Los datos provienen del dataset SatlasPretrain publicado por AllenAI, que incluye imágenes y etiquetas en formato Web-Mercator. El repositorio de OneScience incluye scripts para entrenar con datos sintéticos (NPZ) que validan el pipeline, pero no reproduce los resultados del paper. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que es un modelo de visión por computadora, no de lenguaje.

## 4. Capacidades

- Segmentación semántica de imágenes satelitales y aéreas, identificando categorías como edificios, carreteras, vegetación, agua, etc.
- Regresión densa para predecir variables continuas, como la altura de edificios o la densidad de vegetación.
- Detección de puntos de interés, como turbinas eólicas o instalaciones solares.
- Detección de instancias poligonales, delimitando contornos de objetos individuales (por ejemplo, campos agrícolas o edificios).
- Detección de polilíneas, para trazar carreteras, ríos o líneas de transporte.
- Predicción de propiedades de objetos, como el número de plantas o el tipo de tejado.
- Clasificación de imágenes completas, asignando etiquetas globales a escenas.
- Soporte de imágenes multitemporales, procesando varias imágenes de la misma zona en momentos distintos para capturar cambios.
- No soporta tool calling ni agentes; es un modelo de visión, no de lenguaje.
- No tiene capacidades de generación de texto ni razonamiento lingüístico.

## 5. Casos de uso

- Detección de infraestructuras energéticas: el modelo puede identificar paneles solares, turbinas eólicas y plataformas offshore en imágenes satelitales, lo que facilita el inventario de energías renovables y la planificación de redes eléctricas. Su entrenamiento con datos multitemporales permite distinguir instalaciones nuevas de las existentes.
- Monitorización de usos del suelo y cambios de cobertura: mediante segmentación semántica y clasificación de escenas, se puede cartografiar la expansión urbana, la deforestación o la evolución de cultivos en el tiempo.
- Gestión de emergencias y desastres: el modelo puede analizar imágenes de una zona antes y después de un desastre natural (inundaciones, incendios) para detectar daños en edificios y carreteras, ayudando a la coordinación de equipos de rescate.
- Planificación urbana: la detección de polígonos de edificios y polilíneas de carreteras permite actualizar mapas urbanos de manera automática, reduciendo el trabajo manual en catastros y sistemas de información geográfica.
- Agricultura de precisión: la regresión densa y la clasificación de cultivos permiten estimar la salud de los cultivos y predecir rendimientos, optimizando el riego y la fertilización en explotaciones agrícolas.
- Análisis de recursos naturales: el modelo puede detectar y clasificar elementos como bosques, humedales o masas de agua, lo que es útil para la gestión de espacios protegidos y la evaluación de impacto ambiental.

## 6. Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original reporta métricas en el conjunto de validación de SatlasPretrain, pero no se han incluido en la información proporcionada. Se recomienda consultar el paper para conocer los valores concretos de F1, MAE, etc. en cada tarea.

## 7. Requisitos de hardware

- No se especifica en el repositorio la VRAM necesaria para inferencia o entrenamiento.
- El modelo es de visión por computadora con entrada de imágenes, por lo que el consumo de memoria depende del tamaño de las imágenes y del lote, así como de la resolución de entrada.
- Se recomienda una GPU o DCU para un uso razonable; el entrenamiento completo en CPU es inviable en la práctica.
- No se indica si es compatible con GPUs de consumo (como RTX 4090) o solo con GPUs de datacenter (A100, H100).
- Para el despliegue, se pueden usar los scripts proporcionados en el repositorio, pero no se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- En cuanto a la latencia, no hay datos disponibles.

## 8. Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente con SatlasPretrain. Existen otros modelos de teledetección como seganos, pero no se han proporcionado datos para una comparativa. Se sugiere revisar el paper original para ver la comparación con otros métodos de pre-training en el campo.

## 9. Limitaciones y advertencias

- El repositorio OneScience-Group/SatlasPretrain no incluye los pesos preentrenados oficiales; solo proporciona scripts para validar el pipeline con datos sintéticos. Para uso real, es necesario descargar los pesos oficiales de AllenAI desde su repositorio.
- La licencia Apache-2.0 del repositorio OneScience no se aplica a los pesos originales de AllenAI, que se liberan bajo ODC-BY. Es importante revisar la licencia correspondiente antes de usar los modelos en producción.
- El modelo está entrenado específicamente para imágenes de teledetección y no es adecuado para otras tareas de visión como reconocimiento de objetos en fotografías generales.
- No se han documentado sesgos específicos, pero al ser entrenado con imágenes de ciertas regiones (principalmente EE.UU. y Europa), puede tener un rendimiento inferior en otras regiones del mundo.
- La falta de información sobre el tamaño del modelo dificulta la estimación de requisitos de memoria y rendimiento.
- El repositorio de OneScience indica que los scripts generan datos sintéticos que no representan el formato original del dataset SatlasPretrain, por lo que los resultados de entrenamiento con estos datos no son comparables con el modelo oficial.

## 10. Enlaces

- Repositorio HuggingFace de OneScience: https://huggingface.co/OneScience-Group/SatlasPretrain
- Paper original (arXiv): https://arxiv.org/abs/2211.15660
- Página web oficial del proyecto: https://satlas-pretrain.allen.ai/
- Dataset original en HuggingFace: https://huggingface.co/datasets/allenai/satlas-pretrain
- Repositorio GitHub de modelos preentrenados de AllenAI: https://github.com/allenai/satlaspretrain_models
- Modelo en ModelScope: https://www.modelscope.cn/models/allenai/satlas-pretrain/summary

Nota: la información técnica detallada (parámetros, arquitectura exacta, cuantización) no está disponible en la información proporcionada; se recomienda consultar el paper original para obtener esos datos.</think>## Resumen

SatlasPretrain es un modelo de preentrenamiento a gran escala para la comprensión de imágenes de teledetección, desarrollado por el Allen Institute for AI (AI2) y presentado en ICCV 2023. Su arquitectura unificada, denominada SatlasNet, procesa imágenes multitemporales de satélite y aéreas para resolver simultáneamente siete tipos de tareas: segmentación semántica, regresión densa, detección de puntos, instancias poligonales, polilíneas, propiedades de objetos y clasificación de imágenes. El modelo fue entrenado con 302 millones de etiquetas en 137 categorías sobre imágenes Sentinel-2 y NAIP, lo que lo convierte en una base sólida para aplicaciones de observación de la Tierra.

Este repositorio concreto, OneScience-Group/SatlasPretrain, es un reempaquetado del proyecto original que incluye scripts de código para validar el pipeline completo (entrenamiento, inferencia, evaluación y visualización) con datos sintéticos, pero no contiene los pesos preentrenados oficiales. La relevancia actual del modelo radica en su capacidad multi-tarea y multitemporal, que permite abordar problemas complejos de teledetección sin necesidad de entrenar modelos específicos para cada tarea.

En cuanto a la arquitectura, el paper original describe SatlasNet como un modelo de redes neuronales convolucionales con una cabeza de salida para cada tipo de tarea, pero no se especifican el número total de parámetros, la longitud de contexto (al tratarse de imágenes, no de texto) ni otros detalles técnicos en la información disponible. La licencia del repositorio es Apache-2.0, aunque los pesos oficiales de AllenAI se liberan bajo la licencia ODC-BY.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SatlasNet (modelo unificado multi-tarea) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes, no texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (repositorio OneScience); ODC-BY (pesos oficiales de AllenAI) |
| Formato de pesos | no disponible (el repositorio no incluye pesos; los oficiales están en formato PyTorch) |

## Arquitectura y entrenamiento

SatlasPretrain fue entrenado sobre imágenes multitemporales de los satélites Sentinel-2 (resolución de 10-20 m/píxel) y NAIP (0.5-2 m/píxel), junto con etiquetas de siete tipos. La arquitectura SatlasNet procesa las imágenes de entrada y genera salidas para todas las tareas de manera conjunta, aprovechando la información compartida entre tareas mediante una cabeza común y cabezas específicas para cada tipo de etiqueta. El paper original indica que se trata de una red convolucional con un mecanismo de fusión temporal para manejar las imágenes multitemporales, aunque no se especifican detalles como el número de capas, la dimensión de los canales o el tamaño de los kernels.

El entrenamiento se realizó con el dataset SatlasPretrain, que contiene 302 millones de etiquetas en 137 categorías, organizadas en los siete tipos de tareas mencionados. No se menciona el uso de técnicas de alineamiento como RLHF o DPO, ya que es un modelo de visión por computadora. El repositorio de OneScience incluye scripts que generan datos sintéticos en formato NPZ para validar el pipeline, pero estos datos no representan el formato original del dataset y los resultados obtenidos con ellos no son comparables con los del modelo oficial.

## Capacidades

- Segmentación semántica de imágenes satelitales y aéreas, clasificando cada píxel en categorías como edificios, carreteras, vegetación, agua, etc.
- Regresión densa para predecir variables continuas, como la altura de los edificios o la densidad de vegetación.
- Detección de puntos de interés, como turbinas eólicas o paneles solares.
- Detección de instancias poligonales, delimitando contornos de objetos individuales (p. ej., campos de cultivo o edificios).
- Detección de polilíneas para trazar carreteras, ríos o líneas de transmisión eléctrica.
- Predicción de propiedades de objetos, como el número de plantas de un edificio o el tipo de tejado.
- Clasificación de imágenes completas, asignando una etiqueta global a la escena (p. ej., zona urbana, bosque, agua).
- Soporte de imágenes multitemporales, procesando varias imágenes de la misma zona en diferentes fechas para capturar cambios temporales.

## Casos de uso

- Inventario de infraestructuras energéticas: el modelo detecta y localiza paneles solares, turbinas eólicas y plataformas offshore en imágenes satelitales, lo que facilita la elaboración de mapas de energía renovable y la planificación de redes eléctricas. Su capacidad multitemporal permite distinguir instalaciones nuevas de las existentes.
- Monitorización de cambios de cobertura del suelo: mediante segmentación semántica y clasificación de escenas, el modelo puede cartografiar la expansión urbana, la deforestación o la evolución de cultivos a lo largo del tiempo, útil para estudios ambientales y de ordenación del territorio.
- Gestión de emergencias y desastres: al comparar imágenes antes y después de un evento (inundación, incendio, terremoto), el modelo identifica daños en edificios y carreteras, ayudando a los equipos de rescate y a las agencias de protección civil a priorizar sus actuaciones.
- Planificación urbana y actualización de mapas: la detección de polígonos de edificios y polilíneas de carreteras permite actualizar automáticamente los mapas urbanos, reduciendo el trabajo manual en los sistemas de información geográfica.
- Agricultura de precisión: el modelo puede estimar el estado de los cultivos y predecir rendimientos a partir de imágenes multitemporales, ayudando a los agricultores a optimizar el riego, la fertilización y la cosecha.
- Conservación de recursos naturales: la clasificación y segmentación de masas de agua, bosques y humedales permite monitorizar el estado de ecosistemas y evaluar el impacto de actividades humanas, lo que resulta útil para organismos de conservación y estudios de biodiversidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original reporta métricas de evaluación para cada una de las siete tareas en el conjunto de validación de SatlasPretrain, pero estos datos no se incluyen en la información proporcionada. Se recomienda consultar el paper (arXiv:2211.15660) para conocer los valores de F1, MAE, precisión, etc. en cada tarea.

## Requisitos de hardware

- El repositorio no especifica la VRAM necesaria para el entrenamiento o la inferencia, ya que depende de la resolución de las imágenes, el tamaño del lote y el número de tareas activas.
- Se recomienda el uso de una GPU o DCU; el entrenamiento completo en CPU es inviable en la práctica.
- No se indica si es compatible con GPU de consumo (p. ej., RTX 4090) o si requiere GPU de datacenter (A100, H100). Dado que se trata de un modelo de visión de tamaño no especificado, es probable que una GPU con al menos 24 GB de VRAM pueda manejar inferencia con imágenes de tamaño moderado.
- Para el despliegue, el repositorio ofrece scripts en PyTorch y soporta entrenamiento distribuido con `torchrun`. No se mencionan herramientas como vLLM, Ollama o TGI, porque no es un modelo de lenguaje.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente en la información proporcionada. En el campo de la teledetección existen otros modelos de pre-training, como los basados en MAE (Masked Autoencoder) o SimCLR, pero no se han encontrado datos de comparativa con SatlasPretrain en esta búsqueda. Se sugiere consultar el paper original para ver una comparación con otros métodos de pre-training en el contexto de la teledetección.

## Limitaciones y advertencias

- El repositorio OneScience-Group/SatlasPretrain no incluye los pesos preentrenados oficiales; los scripts generan datos sintéticos que solo validan el pipeline, no producen modelos útiles. Para uso real, es necesario descargar los pesos del repositorio oficial de AllenAI.
- La licencia Apache-2.0 del repositorio no cubre los pesos oficiales de AllenAI, que se liberan bajo la licencia ODC-BY. Es obligatorio revisar la licencia aplicable antes de utilizar los modelos en proyectos comerciales o de producción.
- El modelo está diseñado exclusivamente para imágenes de teledetección; no es adecuado para tareas de visión general (por ejemplo, detección de objetos en fotos de calle) y no tiene capacidades de lenguaje natural.
- El entrenamiento se realizó principalmente con imágenes de regiones de Estados Unidos y Europa, por lo que el rendimiento puede degradarse en otras zonas geográficas con diferentes tipos de paisaje o condiciones atmosféricas.
- No se documentan sesgos específicos, pero al tratarse de un modelo entrenado con datos etiquetados por humanos, existe el riesgo de que las etiquetas reflejen sesgos geográficos o culturales.
- La falta de información sobre el tamaño de la arquitectura dificulta la planificación de recursos de computación y la estimación de tiempos de inferencia.

## Enlaces

- Repositorio HuggingFace de OneScience: https://huggingface.co/OneScience-Group/SatlasPretrain
- Paper original (arXiv): https://arxiv.org/abs/2211.15660
- Página oficial del proyecto: https://satlas-pretrain.allen.ai/
- Dataset original en HuggingFace: https://huggingface.co/datasets/allenai/satlas-pretrain
- Repositorio GitHub de modelos preentrenados de AllenAI: https://github.com/allenai/satlaspretrain_models
- Modelo en ModelScope: https://www.modelscope.cn/models/allenai/satlas-pretrain/summary
