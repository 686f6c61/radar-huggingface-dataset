# OneScience-Group/FuXi

## Resumen

FuXi es un modelo fundacional de predicción meteorológica global desarrollado conjuntamente por la Universidad de Fudan y otras instituciones, presentado en el artículo «FuXi: A cascade machine learning forecasting system for 15-day global weather forecast» (arXiv:2306.12873). Se trata del primer framework de aprendizaje automático de extremo a extremo capaz de realizar de forma independiente asimilación de datos y predicción cíclica, integrando ambas tareas en un único sistema entrenable.

El modelo se entrena mediante un enfoque en cascada de tres etapas (corto, medio y largo plazo) utilizando datos de reanálisis ERA5. Su arquitectura está diseñada para generar pronósticos meteorológicos de hasta 15 días, cubriendo un rango temporal que los modelos físicos tradicionales manejan con alta incertidumbre. La relevancia actual de FuXi radica en su capacidad para combinar asimilación de datos y predicción en un pipeline unificado, lo que reduce la dependencia de sistemas híbridos y abre la puerta a aplicaciones operativas de bajo coste computacional frente a los modelos numéricos clásicos.

El repositorio de HuggingFace incluye el código de entrenamiento e inferencia, así como pesos entrenados sobre 39 años de datos ERA5 (aunque los archivos de pesos se anuncian como «próximamente»). La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en entornos de investigación y producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema en cascada de tres etapas (short, medium, long) con asimilación de datos integrada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo meteorológico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (idiomas de la documentación, no del modelo en sí) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (framework PyTorch, formato de archivo no especificado) |

## Arquitectura y entrenamiento

La arquitectura de FuXi se basa en un enfoque en cascada de tres etapas que se entrenan secuencialmente: la etapa «short» se entrena desde cero y produce predicciones a corto plazo; sus resultados se utilizan como entrada para entrenar la etapa «medium», y esta a su vez alimenta la etapa «long». Este diseño permite que el modelo aprenda progresivamente escalas temporales más largas, manteniendo la coherencia física entre etapas. Además, el sistema integra un módulo de asimilación de datos que permite incorporar observaciones en el ciclo de predicción, una característica poco común en modelos puramente basados en ML.

El entrenamiento utiliza exclusivamente datos de reanálisis ERA5, proporcionados por el dataset OneScience/ERA5 (una versión reducida en el repositorio actual). No se especifica el número total de tokens ni la composición exacta del dataset, pero se menciona que los pesos incluidos se entrenaron con 39 años de datos ERA5. No hay información sobre técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en la arquitectura en cascada y la integración de asimilación de datos, que permite un ciclo de predicción autocontenido sin depender de sistemas externos.

## Capacidades

- Predicción meteorológica global a corto, medio y largo plazo (hasta 15 días).
- Asimilación de datos integrada, capaz de incorporar observaciones en el ciclo de pronóstico.
- Entrenamiento y inferencia en tres etapas independientes, con posibilidad de ejecutar cada etapa por separado.
- Soporte para entrenamiento multi-GPU mediante `torchrun`.
- Generación de resultados de inferencia en formato de archivos (guardados en `result/output/<stage>/`).
- Evaluación y visualización de resultados mediante scripts dedicados (`scripts/result.py`).
- Compatibilidad con GPUs y DCUs (aceleradores chinos), con soporte para entornos DTK.
- Capacidad de ejecución en entornos OneCode/ModelScope para programación AI4S.

## Casos de uso

- Investigación en predicción meteorológica: FuXi permite a investigadores experimentar con un sistema de pronóstico de extremo a extremo sin necesidad de integrar módulos de asimilación externos. Su arquitectura en cascada facilita el estudio de la propagación de errores entre escalas temporales.
- Desarrollo de sistemas operativos de alerta temprana: al generar pronósticos de hasta 15 días, puede utilizarse para anticipar eventos meteorológicos extremos (olas de calor, tormentas, sequías) con una antelación mayor que los modelos de corto plazo.
- Planificación agrícola: los pronósticos de medio y largo plazo permiten a agricultores y cooperativas optimizar calendarios de siembra, riego y cosecha basándose en tendencias climáticas estacionales.
- Gestión de recursos energéticos: empresas de energía solar y eólica pueden usar las predicciones de FuXi para estimar la producción futura y ajustar la oferta y demanda en redes eléctricas.
- Educación y formación en IA para ciencias de la Tierra: el código abierto y la documentación en inglés y chino lo convierten en un recurso didáctico para cursos de machine learning aplicado a meteorología.
- Evaluación de modelos climáticos: los resultados de FuXi pueden compararse con salidas de modelos físicos (como los del ECMWF) para evaluar la fiabilidad de los enfoques basados en ML en diferentes regiones y estaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2306.12873) podría contener métricas de precisión (como RMSE, MAE, etc.) comparadas con modelos de referencia, pero no se incluyen en la model card de HuggingFace. Por lo tanto, no se pueden presentar tablas de rendimiento sin riesgo de inventar datos.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos. La CPU puede utilizarse para pruebas de conectividad a pequeña escala, pero el rendimiento será muy lento.
- Para DCU, se requiere DTK 25.04.2 o superior (o la versión recomendada por OneScience para el clúster).
- El entrenamiento multi-GPU se realiza con `torchrun`, soportando múltiples nodos y procesos (ejemplo: `--nproc_per_node=8`).
- No se especifican requisitos mínimos de VRAM ni modelos de GPU concretos. Dado que es un modelo meteorológico con datos de alta resolución, es probable que requiera GPUs con al menos 16-32 GB de VRAM para entrenamiento, pero este dato no está disponible.
- Opciones de despliegue: el repositorio incluye scripts de entrenamiento e inferencia en Python, y puede ejecutarse en entornos OneCode/ModelScope. No se mencionan integraciones con vLLM, Ollama u otros frameworks de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

Existen otros modelos de predicción meteorológica basados en ML, como Pangu-Weather (Huawei), GraphCast (DeepMind) y FourCastNet (NVIDIA). Sin embargo, la información proporcionada no incluye datos comparativos de rendimiento ni especificaciones técnicas detalladas de estos modelos. Por lo tanto, no se puede realizar una comparativa cuantitativa fiable. Se recomienda consultar el paper de FuXi para ver comparaciones con estos sistemas, pero no se dispone de esos datos en la model card.

## Limitaciones y advertencias

- No se han documentado sesgos específicos ni riesgos de alucinación en la información disponible. Al ser un modelo meteorológico, los errores pueden manifestarse como predicciones inexactas en regiones con datos escasos o durante eventos extremos.
- La dependencia exclusiva de datos ERA5 puede limitar la generalización a otras fuentes de datos o a condiciones climáticas no representadas en el periodo de entrenamiento (39 años).
- Los pesos entrenados no están disponibles actualmente en el repositorio (se indica que se subirán próximamente), lo que impide una validación inmediata del modelo preentrenado.
- El entrenamiento en cascada requiere ejecutar las etapas en orden estricto (short → medium → long), lo que puede ser un proceso largo y costoso computacionalmente.
- La documentación está principalmente en inglés y chino, lo que puede suponer una barrera para usuarios de otros idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, no se especifican garantías de precisión ni responsabilidades por uso operativo en sistemas de alerta temprana.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/FuXi
- Paper: https://arxiv.org/abs/2306.12873
- Dataset ERA5: https://huggingface.co/datasets/OneScience-Group/ERA5 (referenciado en la model card)
- Repositorio principal OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorios espejo en Gitee: https://gitee.com/onescience-ai/onescience y https://gitee.com/onescience-ai/oneskills
