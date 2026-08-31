# sarkarghya/olmoearth-v1.2-energy-multitask-v3

## Resumen

OlmoEarth v1.2 Energy Multi-Task V3 es un modelo de segmentación de imágenes de teledetección desarrollado por sarkarghya (Arghya Sarkar), especializado en el análisis de infraestructura energética a partir de imágenes Sentinel-2 L2A. Se trata de un fine-tuning del modelo base `allenai/OlmoEarth-v1_2-Base`, un modelo fundacional de observación de la Tierra de Allen Institute for AI, y está orientado exclusivamente al territorio de Estados Unidos. El modelo realiza predicción densa multi-tarea en una sola pasada del encoder: detecta presencia de plantas de energía, clasifica el tipo de combustible, genera máscaras de candidatos solares y eólicos, estima variables de regresión renovable (factor de capacidad, LCOE, densidad de capacidad y densidad de generación) y produce canales de probabilidad de fuentes de energía para centros de datos, además de un tipo de geometría auxiliar.

El modelo tiene 126,6 millones de parámetros y acepta chips de 128×128 píxeles a 10 metros de resolución, con 12 bandas de Sentinel-2. Su relevancia radica en que combina múltiples tareas de percepción remota en un único modelo, lo que permite un análisis eficiente de la red eléctrica y las energías renovables a escala regional. Sin embargo, el autor lo presenta explícitamente como un checkpoint de investigación exploratoria, no como una herramienta operativa de auditoría energética, y advierte que los canales de centros de datos son probabilidades sin calibrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en OlmoEarth v1.2 Base (encoder de visión por satélite) con múltiples cabezas densas de salida |
| Parametros totales | 126.634.365 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 128×128 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de texto) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OlmoEarth-v1_2-Base`, un modelo fundacional de observación de la Tierra desarrollado por el Allen Institute for AI. OlmoEarth v1.2 introduce mejoras de eficiencia que reducen los costes de entrenamiento e inferencia en comparación con la versión anterior, manteniendo el rendimiento en tareas de embedding de teledetección. Sobre esta base, el autor añade seis cabezas densas de predicción: presencia de plantas de energía (sigmoid), tipo de combustible (softmax de 8 clases), máscaras de renovables (5 canales independientes), regresión renovable (4 canales), canales de energía de centros de datos (8 canales) y tipo de geometría de centros de datos (3 clases auxiliares).

El entrenamiento se realizó mediante fine-tuning supervisado sobre tres datasets propios: `sarkarghya/power-plant-olmoearth-segmentation`, `sarkarghya/im3-datacenter-olmoearth-segmentation` y `sarkarghya/wind-and-solar-candidate-olmoearth-segmentation`. No se especifican detalles sobre el número de tokens, composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La entrada requiere valores de reflectancia armonizados de Sentinel-2 L2A en formato uint16, con un orden de bandas específico (B02, B03, B04, B08, B05, B06, B07, B8A, B11, B12, B01, B09) y una única pasada del encoder para todas las tareas.

## Capacidades

- Segmentación de presencia de plantas de energía: produce un mapa de probabilidad binaria de infraestructura eléctrica.
- Clasificación de tipo de combustible de plantas de energía: 8 clases de combustible mediante softmax.
- Generación de máscaras de candidatos solares y eólicos: 5 canales independientes con activación sigmoide.
- Regresión de variables renovables: factor de capacidad, LCOE, densidad de capacidad y densidad de generación, con escalado robusto.
- Estimación de fuentes de energía de centros de datos: 8 canales de probabilidad independientes, pensados para agregarse solo dentro de regiones de interés (ROI) conocidas.
- Clasificación auxiliar de tipo de geometría de centros de datos: 3 clases sin clase de fondo, no es un detector de centros de datos.
- Procesamiento de imágenes Sentinel-2 L2A con normalización interna automática, sin necesidad de dividir los DN por 10 000.

## Casos de uso

- Monitorización de infraestructura eléctrica regional: el modelo puede identificar la ubicación de plantas de energía en imágenes Sentinel-2, lo que permite actualizar mapas de infraestructura en áreas de Estados Unidos sin depender de censos manuales.
- Planificación de energías renovables: las máscaras de candidatos solares y eólicos, junto con las variables de regresión (factor de capacidad, LCOE), ayudan a preseleccionar zonas con potencial para nuevos proyectos de generación renovable.
- Análisis de la huella energética de centros de datos: los canales de probabilidad de fuentes de energía pueden agregarse dentro de ROI de centros de datos conocidos para estudiar patrones de abastecimiento, aunque el autor advierte que no son mediciones reales de consumo.
- Evaluación de carteras de activos energéticos: combinando la detección de plantas y la clasificación de combustible, se puede caracterizar la mezcla de generación de una región (carbón, gas, nuclear, etc.) para análisis de mercado o políticas públicas.
- Detección de cambios en infraestructura: al comparar predicciones de diferentes fechas, se pueden identificar nuevas construcciones de plantas o expansiones de parques solares y eólicos.
- Investigación académica en teledetección aplicada: sirve como punto de partida para experimentos de multi-tarea en dominios de observación de la Tierra, dado que es un checkpoint abierto con código de inferencia de ejemplo.

## Benchmarks y rendimiento

El autor no publica métricas estándar como IoU, F1 o AUPRC sobre un conjunto de validación congelado. En su lugar, reporta las pérdidas de validación efímeras utilizadas para la selección del checkpoint, que no deben interpretarse como métricas de despliegue:

| Familia de validación | Pérdida (menor es mejor) |
|---|---:|
| Power | 1,1537 |
| Renewable | 0,7230 |
| Data center | 0,9545 |
| Compuesta | 2,8312 |

El autor indica que la versión V3 mejoró la pérdida compuesta de validación efímera en un 4,4 % respecto a V2, pero no se proporcionan comparaciones con otros modelos de segmentación de teledetección. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Se recomienda una GPU CUDA y Python 3.11, según las instrucciones de instalación.
- El modelo tiene 126,6 millones de parámetros, lo que sugiere que puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en precisión bfloat16, aunque no se especifican requisitos exactos de VRAM.
- No se proporcionan datos de latencia ni throughput.
- El ejemplo de inferencia utiliza `torch.autocast` con bfloat16, lo que reduce el consumo de memoria.
- No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje; la inferencia se realiza mediante el script `example_inference.py` incluido en el repositorio.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. El modelo es un fine-tuning de OlmoEarth v1.2 Base, por lo que la comparación natural sería con el propio modelo base, que está diseñado para tareas de embedding y clasificación de teledetección, pero no para la multi-tarea energética específica. Tampoco se mencionan alternativas como otros modelos de segmentación de infraestructura energética. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación exploratoria, no una herramienta operativa de auditoría energética.
- Los canales de energía de centros de datos son probabilidades sin calibrar derivadas del contexto de observación de la Tierra; no representan porcentajes reales de compra, generación o consumo eléctrico.
- Los canales de centros de datos solo deben agregarse dentro de ROI conocidos; los píxeles de fondo arbitrarios no están restringidos y pueden producir valores sin sentido.
- La salida `dc_geometry_type` no tiene clase de fondo y no debe usarse como detector de centros de datos.
- La clasificación de combustible de plantas de energía solo debe informarse después de que la presencia de energía supere un umbral de detección validado; no se debe calcular un promedio de combustible en toda la cuadrícula.
- No se ha completado la calibración con un conjunto de validación congelado ni la selección de umbrales específicos por tarea.
- Los datos de entrenamiento y el fine-tuning están centrados en Estados Unidos; el rendimiento fuera de este país no está verificado.
- La licencia es "other" y no se especifican los términos exactos, por lo que el uso comercial debe consultarse con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarkarghya/olmoearth-v1.2-energy-multitask-v3
- Modelo base OlmoEarth v1.2: https://huggingface.co/allenai/OlmoEarth-v1_2-Base
- Paper de OlmoEarth v1.2: https://arxiv.org/abs/2605.20804
- Sitio web de OlmoEarth: https://olmoearth.allenai.org/
- Colección de OlmoEarth en HuggingFace: https://huggingface.co/collections/allenai/olmoearth
- Aplicación de demostración (mapa): https://sarkarghya--olmoearth-energy-grid-demo-web.modal.run
