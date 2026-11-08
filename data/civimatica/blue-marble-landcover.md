# Civimatica/blue-marble-landcover

## Resumen

Blue Marble Landcover es un modelo de segmentación de imágenes orientado a la observación de la Tierra, publicado en Hugging Face por Civimatica bajo el identificador `Civimatica/blue-marble-landcover`. Está diseñado para la clasificación y segmentación de coberturas del suelo (LULC, *Land Use / Land Cover*) a partir de imágenes satelitales Sentinel-2, y se distribuye en formatos ONNX y safetensors con variantes cuantizadas a int8, lo que indica un enfoque explícito hacia el despliegue en entornos de borde (*edge AI*) y en pipelines de teledetección con requisitos de latencia y recursos acotados.

El modelo se enmarca en la línea de producto de Civimatica, empresa que declara construir modelos de IA física para espacio urbano y los dispositivos de sensorización sobre los que se ejecutan. La ficha pública del repositorio es extremadamente escasa: no se especifican arquitectura, número de parámetros, longitud de contexto de entrada (resolución de parche), composición del dataset de entrenamiento ni resultados de benchmarks. La información disponible se limita a los metadatos de Hugging Face y a las descripciones genéricas del sitio web del autor.

Su relevancia actual reside en la combinación de tres factores: la tarea (segmentación semántica de cobertura del suelo, con aplicaciones directas en planificación urbana, monitorización ambiental y análisis de infraestructura), el origen de los datos (Sentinel-2, con acceso abierto y revisita de aproximadamente cinco días) y el formato de distribución (ONNX int8), que facilita su integración en herramientas de inferencia estándar sin dependencias de frameworks propietarios. No obstante, la ausencia de documentación técnica publicada limita seriamente cualquier evaluación rigurosa previa a su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (variante cuantizada publicada); resto no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 (según tag del repositorio); el campo de licencia de la ficha figura como no disponible |
| Formato de pesos | ONNX y safetensors |
| Tarea (pipeline) | image-segmentation |
| Modalidad de entrada | imagen satelital (Sentinel-2, según tags) |
| Dominio | observación de la Tierra / teledetección |
| Región declarada | US |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. Los tags del repositorio (`onnx`, `safetensors`, `edge-ai`, `int8`) sugieren una red de segmentación de imagen optimizada para inferencia eficiente, pero no permiten determinar si se trata de una CNN (por ejemplo, una U-Net o variante), de un transformer de visión o de una arquitectura híbrida. Tampoco se especifica la resolución de parche de entrada, el número de bandas Sentinel-2 utilizadas ni el esquema de clases de cobertura del suelo.

Respecto al entrenamiento, no hay datos publicados sobre volumen de tokens o imágenes, composición del dataset, procedencia de las anotaciones (etiquetas oficiales tipo CORINE o ESA WorldCover, anotación manual o destilación), ni sobre si se aplicaron técnicas de aumento de datos, ajuste fino supervisado o algún tipo de alineamiento posterior. La única información contextual proviene del sitio web del autor, que menciona el uso de datos de calle medidos por la propia empresa y entornos de validación en vía pública, aunque sin vincular explícitamente esos datos a este modelo concreto.

## Capacidades

- Segmentación semántica de imágenes: el pipeline declarado es `image-segmentation`, orientado a asignar una clase de cobertura del suelo a cada píxel.
- Procesamiento de imágenes satelitales Sentinel-2, según los tags del repositorio.
- Inferencia en formato ONNX, lo que permite ejecución con ONNX Runtime y otras herramientas compatibles.
- Distribución de pesos en safetensors, además del grafo ONNX.
- Variante cuantizada a int8 para despliegue con requisitos reducidos de memoria y cómputo.
- Orientación a *edge AI*: el tag sugiere viabilidad de ejecución en dispositivos de borde, aunque no se publican cifras de latencia ni de consumo.
- No se documenta soporte de *tool calling*, razonamiento multi-paso, capacidades multilingües, visión general (más allá de la segmentación), audio ni modo de razonamiento explícito.

## Casos de uso

- Monitorización de cobertura del suelo a escala regional: el modelo puede aplicarse sobre mosaicos Sentinel-2 para generar mapas de clases LULC de forma periódica, aprovechando la revisita del satélite y el formato ONNX para estandarizar la inferencia en distintos entornos.
- Planificación urbana y análisis de expansión: la segmentación de superficies impermeables, vegetación y agua permite cuantificar cambios en el suelo urbano a lo largo del tiempo, un caso alineado con el enfoque de ciudad física declarado por Civimatica.
- Despliegue en dispositivos de borde para teledetección distribuida: la variante int8 y el formato ONNX facilitan ejecutar la inferencia en estaciones terrestres o hardware de campo con recursos limitados, reduciendo la necesidad de transmitir imágenes completas a la nube.
- Preprocesado para pipelines de análisis geoespacial: la salida de segmentación puede alimentar sistemas de información geográfica (QGIS, PostGIS) como capa raster de coberturas, sirviendo de base para cálculos de índices de vegetación, impermeabilización o riesgo de inundación.
- Seguimiento ambiental y agrícola: la clasificación de cultivos y superficies naturales sobre series temporales Sentinel-2 permite detectar cambios de uso del suelo y apoyar la monitorización de políticas de uso del territorio.
- Integración en plataformas de observación de la Tierra como componente de segmentación preentrenado: al distribuirse en safetensors y ONNX, puede incorporarse a servicios de inferencia existentes (por ejemplo, ONNX Runtime Server) sin reentrenamiento desde cero.
- Validación y control de calidad de datasets geoespaciales: el modelo puede usarse como generador de etiquetas preliminares para revisión humana en flujos de anotación de imágenes satelitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de mIoU, precisión por clase, F1, latencia ni throughput en la ficha del repositorio ni en los resultados de búsqueda consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros ni la resolución de entrada, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. La orientación a *edge AI* y la variante int8 sugieren que el modelo puede ejecutarse en hardware modesto, pero no se confirma con cifras.
- Compatibilidad con GPU de consumo: no confirmada. La existencia de pesos int8 y ONNX es un indicio favorable, pero no constituye evidencia suficiente.
- Opciones de despliegue: ONNX Runtime (formato ONNX publicado); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no son aplicables a un modelo de segmentación de imágenes y no se documentan alternativas específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: no se conocen los parámetros, la arquitectura ni los resultados del modelo. Se indican a continuación alternativas del mismo dominio, sin datos comparativos verificados.

| Modelo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Civimatica/blue-marble-landcover | Segmentación LULC sobre Sentinel-2 | ONNX, safetensors | Apache 2.0 (según tag) | Hugging Face |
| Alternativas de segmentación LULC de código abierto (por ejemplo, modelos basados en U-Net o SegFormer entrenados sobre Sentinel-2) | Segmentación LULC | safetensors, ONNX | variable | Hugging Face, GitHub |
| Modelos de cobertura del suelo de agencias (por ejemplo, ESA WorldCover) | Clasificación LULC global | productos raster | variable | portales institucionales |

No se dispone de datos de rendimiento del modelo Civimatica que permitan compararlo con estas alternativas.

## Limitaciones y advertencias

- Documentación técnica prácticamente inexistente: no se publican arquitectura, parámetros, resolución de entrada, esquema de clases ni proceso de entrenamiento, lo que impide evaluar su idoneidad antes de desplegarlo.
- Ausencia total de benchmarks: no hay evidencia publicada de precisión, mIoU ni robustez frente a condiciones atmosféricas, estacionalidad o distintas regiones geográficas.
- Riesgo de sesgo geográfico desconocido: al no documentarse la composición del dataset, no puede descartarse un sesgo hacia las regiones donde se recogieron las imágenes de entrenamiento.
- Riesgo de error en clases minoritarias: en segmentación LULC es habitual el desequilibrio de clases (agua, humedales, infraestructura), y no hay información sobre cómo se ha tratado.
- Licencia: el tag del repositorio indica Apache 2.0, pero el campo de licencia de la ficha figura como no disponible; conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- Idiomas: no aplica como modelo de visión, pero tampoco se documenta el ámbito geográfico de las etiquetas, lo que puede afectar a la nomenclatura de clases.
- Estado del repositorio: cero descargas y cero *likes* en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026), un posible error de registro que conviene contrastar con el autor.
- Para producción: se recomienda validar el modelo sobre un conjunto de test propio y representativo del área de despliegue antes de integrarlo en cualquier flujo operativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Civimatica/blue-marble-landcover
- Página de modelos de Civimatica: https://www.civimatica.com/models
- Sitio web de Civimatica: https://www.civimatica.com/
