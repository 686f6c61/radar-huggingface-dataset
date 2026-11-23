# 1aurent/resnext50_32x4d.tiatoolbox-pcam

## Resumen

El modelo `resnext50_32x4d.tiatoolbox-pcam` es un clasificador de imagenes de histologia basado en la arquitectura ResNeXt-D, entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre parches del dataset Patch Camelyon (PCam). Se distribuye a traves de Hugging Face dentro del ecosistema de TIAToolbox, la libreria de codigo abierto para analisis de imagenes de tejidos desarrollada por el mismo centro. El modelo esta pensado para la deteccion de metastasis en ganglios linfaticos a partir de parches de 96x96 pixeles, una tarea clasica de patologia computacional.

Con 23.052.226 parametros (23,1 M), se trata de un modelo compacto y ligero, adecuado para inferencia en hardware modesto y para su integracion en pipelines de analisis de imagenes histologicas a gran escala. El repositorio ocupa apenas 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados. La licencia CC0-1.0 (dominio publico) elimina practicamente cualquier restriccion de uso comercial, lo que lo hace atractivo para entornos de investigacion traslacional y productos clinicos.

Su relevancia actual radica en que forma parte de una familia de modelos de referencia para la comunidad de patologia digital, con pesos compatibles con `timm` y con la libreria TIAToolbox, y con un pipeline de clasificacion de imagenes estandar. No es un modelo generativo ni un modelo de lenguaje: es un backbone convolucional de vision especializado en una tarea biomedica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNeXt-D (ResNeXt50 con cardinalidad 32 y ancho 4d) |
| Parametros totales | 23.052.226 (23,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 96x96x3) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repositorio; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | CC0-1.0 (Creative Commons Zero v1.0 Universal) |
| Formato de pesos | safetensors (libreria `timm`) |
| Tamano del repositorio | 0,1 GB |
| Tamano de imagen de entrada | 96 x 96 x 3 |
| Dataset de entrenamiento | Patch Camelyon (PCam) |
| Pipeline | image-classification |
| Tarea secundaria | feature-extraction (backbone de caracteristicas) |

## Arquitectura y entrenamiento

La arquitectura es una ResNeXt-D, variante de las redes residuales de Aggregated Residual Transformations. En concreto, `resnext50_32x4d` emplea 50 capas con 32 grupos (cardinalidad) y 4 canales por grupo, lo que reduce el numero de parametros respecto a una ResNet equivalente manteniendo capacidad representacional. La implementacion concreta es la de la libreria `timm`, que expone el modelo como un backbone de clasificacion y de extraccion de caracteristicas.

El entrenamiento se realizo sobre parches de 96x96 pixeles del dataset Patch Camelyon (PCam), un conjunto de referencia en patologia computacional para la deteccion de metastasis en ganglios linfaticos. La model card no proporciona detalles sobre el numero exacto de tokens o imagenes de entrenamiento, la composicion del dataset, el regimen de aumentacion de datos, la funcion de perdida ni si se aplicaron tecnicas de ajuste fino adicionales. Tampoco se documentan innovaciones tecnicas especificas como atencion lineal o decodificacion especulativa, ya que se trata de una CNN estandar.

El modelo se distribuye como pesos preentrenados listos para usar con `timm.create_model(model_name="hf-hub:1aurent/resnext50_32x4d.tiatoolbox-pcam", pretrained=True)`. La model card incluye ejemplos de uso tanto para clasificacion como para extraccion de embeddings (con `num_classes=0`), lo que confirma su doble uso como clasificador y como extractor de caracteristicas.

## Capacidades

- Clasificacion de imagenes de parches histologicos de 96x96 pixeles, orientada a la deteccion de metastasis en ganglios linfaticos (dataset PCam).
- Extraccion de embeddings o caracteristicas de imagenes histologicas mediante `num_classes=0`, util para tareas downstream como recuperacion, clustering o clasificacion con cabezas personalizadas.
- Integracion nativa con `timm` para carga, transformaciones de normalizacion y redimensionado mediante `timm.data.resolve_model_data_config` y `timm.data.create_transform`.
- Compatibilidad con TIAToolbox, la libreria end-to-end del TIA Centre para pipelines de analisis de imagenes de tejidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de vision.
- No tiene capacidades multilingues ni de procesamiento de lenguaje.
- No dispone de modo "thinking", vision generativa, audio ni otras capacidades multimodales mas alla de la clasificacion de imagenes.

## Casos de uso

- **Deteccion de metastasis en ganglios linfaticos**: el modelo clasifica parches de 96x96 pixeles de tejido histologico para identificar regiones con metastasis, lo que permite construir mapas de probabilidad a nivel de imagen completa (WSI) combinando las predicciones por parche. Es su caso de uso principal y el motivo por el que fue entrenado sobre PCam.

- **Extraccion de caracteristicas para pipelines downstream**: usando `num_classes=0`, el modelo actua como backbone para generar embeddings de parches histologicos que alimentan clasificadores, modelos de recuperacion o analisis de clustering en estudios de patologia computacional.

- **Preprocesado y control de calidad en TIAToolbox**: al ser parte del ecosistema TIAToolbox, puede integrarse en pipelines de analisis de imagenes de tejidos para tareas de segmentacion, deteccion de tejido y clasificacion de parches dentro de flujos mas amplios.

- **Prototipado rapido en investigacion biomedica**: su tamano reducido (23,1 M de parametros, 0,1 GB) y su licencia CC0 permiten usarlo como linea base en experimentos academicos sin coste de licencia ni requisitos de hardware elevados.

- **Sistemas de triaje asistido en anatomia patologica**: el modelo puede servir como componente de un sistema que priorice laminas o regiones sospechosas para revision por parte de patologos, reduciendo el tiempo de lectura en entornos de alta carga.

- **Aumentacion de datasets y generacion de etiquetas debiles**: las predicciones del modelo sobre parches no etiquetados pueden usarse para preetiquetar grandes volumenes de imagenes histologicas, acelerando la creacion de datasets supervisados en proyectos de patologia digital.

- **Despliegue en entornos con recursos limitados**: gracias a su bajo numero de parametros y a su formato safetensors, puede ejecutarse en GPUs de gama media o incluso en CPU para inferencia por lotes, lo que facilita su uso en laboratorios sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como exactitud, AUC, F1 ni comparaciones con otros modelos sobre Patch Camelyon u otros conjuntos de datos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 23,1 M de parametros (aproximadamente 92 MB en fp32 y 46 MB en fp16), la VRAM necesaria es muy reducida, del orden de unos pocos cientos de MB incluyendo activaciones para lotes pequenos.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; no se requiere una A100 ni H100. Una NVIDIA RTX 3060, RTX 4090, T4 o incluso una GPU integrada pueden ejecutar el modelo sin problemas.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs de generaciones anteriores con poca memoria.
- **Opciones de despliegue**: `timm` (carga directa desde Hugging Face), TIAToolbox, y exportacion a ONNX u otros formatos mediante las utilidades de `timm`. No se documentan variantes GGUF ni soporte nativo en llama.cpp u Ollama, al no ser un modelo de lenguaje.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada. Dado el reducido tamano del modelo y la entrada de 96x96, se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/resnext50_32x4d.tiatoolbox-pcam` | 23,1 M | Imagen 96x96x3 | Clasificacion de parches PCam | CC0-1.0 | Hugging Face (`timm`) |
| ResNet50 (ImageNet, `timm`) | ~25,6 M | Imagen 224x224x3 | Clasificacion generica de imagenes | Licencia de `timm` / pesos originales | Hugging Face (`timm`) |
| Otros backbones de TIAToolbox | no disponible | no disponible | Patologia computacional | no disponible | Repositorio TIAToolbox |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, entrada y licencia. Cualquier comparacion de exactitud o AUC requeriria resultados de benchmarks que no se han publicado en la model card.

## Limitaciones y advertencias

- **Especializacion estrecha**: el modelo esta entrenado exclusivamente sobre parches de Patch Camelyon (96x96) para deteccion de metastasis en ganglios linfaticos; su rendimiento fuera de ese dominio (otros tejidos, otras tinciones, otras resoluciones) no esta garantizado y probablemente se degrade.
- **Riesgo de alucinacion en sentido amplio**: como todo clasificador, puede producir falsos positivos y falsos negativos con alta confianza; no debe usarse como unico criterio en decision clinica.
- **Sesgos del dataset**: Patch Camelyon procede de un conjunto limitado de fuentes y centros; el modelo puede heredar sesgos de adquisicion, tincion y poblacion de esos datos.
- **Sin datos de calibracion ni metricas publicadas**: la model card no reporta exactitud, AUC ni curvas de calibracion, lo que dificulta evaluar su fiabilidad en produccion.
- **No es un modelo de lenguaje**: no soporta texto, tool calling ni agentes; cualquier uso en esos ambitos es inadecuado.
- **Licencia permisiva pero sin garantias**: CC0-1.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias de idoneidad clinica; el uso en entornos regulados (por ejemplo, diagnostico medico) requiere validacion adicional y cumplimiento normativo.
- **Entrada fija de 96x96**: el modelo espera parches de ese tamano; imagenes de mayor resolucion deben dividirse en parches, lo que anade complejidad al pipeline.
- **Mantenimiento**: el modelo fue creado en noviembre de 2023 y actualizado en noviembre de 2026; no se documenta un plan de mantenimiento ni versionado mas alla del repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/resnext50_32x4d.tiatoolbox-pcam
- Dataset Patch Camelyon (PCam): https://github.com/basveeling/pcam/
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Articulo TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del articulo: https://doi.org/10.1038/s43856-022-00186-5
- Imagen de ejemplo usada en la model card: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
- Licencia CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/legalcode
