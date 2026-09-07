# nilsleh/tsvit

## Resumen

El modelo `nilsleh/tsvit` es una implementación de referencia del ViT para series temporales de imágenes satelitales (ViTs for SITS), propuesto por Tarasiou, Chavez y Zafeiriou en CVPR 2023. Se trata de un Vision Transformer adaptado al dominio de la teledetección, diseñado para procesar secuencias de imágenes multiespectrales y resolver tareas de clasificación y segmentación semántica sobre parcelas agrícolas. El modelo fue entrenado con el dataset PASTIS, un conjunto de referencia para clasificación de cultivos a partir de imágenes Sentinel-2, y su relevancia radica en que aprovecha la dimensión temporal de las observaciones satelitales. En esta ficha, la arquitectura se reconoce como un ViT para series temporales; no se han publicado en la información disponible detalles sobre el número de parámetros ni sobre la longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para series temporales de imágenes satelitales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Vision Transformer adaptada para manejar series temporales de imágenes satelitales, un enfoque presentado en el paper «ViTs for SITS: Vision Transformers for Satellite Image Time Series». A diferencia de un ViT estándar, este modelo procesa secuencias de imágenes multiespectrales capturadas en distintas fechas, por lo que está pensado para explotar la variabilidad temporal de las observaciones. Según la información disponible, el entrenamiento se realizó con el dataset PASTIS, recopilado por Sainte-Fare Garnot y Landrieu, que contiene anotaciones de parcelas agrícolas a partir de imágenes Sentinel-2. El repositorio de referencia en GitHub indica que este checkpoint fue extraído de un archivo de validación cruzada de 5 particiones sobre PASTIS24. No se han reportado en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO; al tratarse de un modelo de visión, estas técnicas no aplican.

## Capacidades

- Clasificación de parcelas agrícolas a partir de series temporales de imágenes Sentinel-2.
- Segmentación semántica en el dominio agrícola, empleando el dataset PASTIS como referencia.
- Extracción de características espacio-temporales para tareas de teledetección.
- Análisis de secuencias de imágenes multiespectrales, con capacidad de modelar la evolución temporal de la cubierta del suelo.
- No soporta generación de texto, tool calling, funciones de agente ni razonamiento multilingüe; es exclusivamente un modelo de visión.

## Casos de uso

- Agricultura de precisión: el modelo puede integrarse en pipelines de cartografía de cultivos para clasificar tipos de cultivo a partir de series temporales de Sentinel-2, lo que permite generar mapas de parcelas actualizados a lo largo de la campaña agrícola.
- Monitorización de anomalías en cultivos: utilizando la dimensión temporal, puede detectar desviaciones en los patrones de evolución de las parcelas, por ejemplo, para alertar sobre estrés hídrico o posibles plagas.
- Cartografía de uso del suelo: es adecuado para producir mapas de cobertura del suelo en regiones agrícolas, ya que su entrenamiento con PASTIS incluye múltiples clases de cultivos y coberturas no vegetales.
- Seguimiento de cambios temporales: permite identificar cambios en la ocupación del suelo a lo largo de la temporada, como la conversión de parcelas agrícolas a otros usos.
- Investigación agronómica: las representaciones espacio-temporales extraídas por el modelo pueden usarse como entrada de modelos estadísticos o de aprendizaje automático para estimar rendimientos de cosecha.
- Evaluación de políticas agrícolas: puede generar estadísticas de áreas cultivadas a partir de clasificaciones satelitales, sirviendo de apoyo a inventarios agrícolas y a la toma de decisiones públicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware en la información disponible.
- El repositorio de HuggingFace no contiene pesos (tamaño 0.0 GB), por lo que la inferencia requiere descargar los checkpoints originales desde el repositorio de GitHub de DeepSatModels.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no se han documentado para este modelo; se recomienda consultar el entorno original de DeepSatModels para conocer los requisitos de ejecución.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El repositorio de HuggingFace en `nilsleh/tsvit` no contiene pesos ni un pipeline definido, lo que limita su uso directo; es necesario obtener los checkpoints desde el repositorio original de GitHub.
- No se han publicado benchmarks ni métricas de rendimiento en la información disponible, por lo que no es posible evaluar su calidad relativa.
- Es un modelo especializado en series temporales de imágenes satelitales y no está diseñado para tareas de lenguaje natural, generación de texto ni interacción conversacional.
- Sus capacidades están condicionadas al dominio agrícola y al dataset PASTIS; puede requerir reentrenamiento o adaptación para otras regiones, sensores o tipos de cobertura del suelo.
- Aunque la licencia Apache 2.0 permite uso comercial, deben respetarse los términos de atribución del paper original y del dataset PASTIS, cuya licencia no se detalla en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilsleh/tsvit
- Paper original (arXiv): https://arxiv.org/abs/2301.04944
- Código y checkpoints originales: https://github.com/michaeltrs/DeepSatModels
- Documentación específica de TSViT en el repositorio: https://github.com/michaeltrs/DeepSatModels/blob/main/README_TSVIT.md
- Dataset de entrenamiento PASTIS (Zenodo): https://zenodo.org/records/5012942
