# OneScience-Group/Earthformer

## Resumen

Earthformer es un modelo de predicción meteorológica y del sistema terrestre basado en arquitectura Transformer, propuesto originalmente por investigadores de Amazon Web Services (AWS) en colaboración con la Universidad de Ciencia y Tecnología de Hong Kong. Su principal contribución es el mecanismo de atención denominado *Cuboid Attention*, diseñado para reducir el coste computacional que los Transformers convencionales sufren al procesar datos geofísicos de alta dimensionalidad (espacio y tiempo). La versión alojada en HuggingFace es una reproducción del proyecto OneScience, que implementa el entrenamiento, inferencia y evaluación del modelo sobre el conjunto de datos SEVIR (simulaciones de radar meteorológico). Este modelo es relevante porque aborda un problema práctico en ciencia del clima y meteorología: la predicción espacio-temporal a partir de datos de radar, con una arquitectura eficiente que puede escalar a resoluciones altas. La model card indica soporte para entrenamiento en GPU y DCU (procesadores de aceleración de Hygon), así como uso con PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer espacio-temporal con Cuboid Attention |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende de la configuracion espaciotemporal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas de la model card; el modelo no es de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint `.pt`) |

## Arquitectura y entrenamiento

Earthformer se basa en una arquitectura Transformer adaptada a datos espacio-temporales. Su núcleo es el mecanismo *Cuboid Attention*, que descompone el campo de entrada en bloques (cuboides) y aplica atención sobre ellos, reduciendo la complejidad cuadrática frente al número de posiciones espaciotemporales. Esto permite procesar datos de alta resolución con menos coste computacional que un Transformer estándar. El modelo se entrena sobre el conjunto de datos SEVIR (datos de radar meteorológico simulados) para predicción de precipitación y otros fenómenos. La reproducción de OneScience no especifica el número de tokens, composición exacta del dataset ni técnicas de entrenamiento como RLHF o DPO (al no ser un modelo de lenguaje). El entrenamiento parte de inicialización aleatoria y guarda pesos en `data/checkpoint/earthformer.pt`. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Predicción espacio-temporal de variables meteorológicas (por ejemplo, precipitación) a partir de secuencias de datos de radar.
- Procesamiento de datos geofísicos de alta dimensionalidad (por ejemplo, campos de 384x384 píxeles) gracias al mecanismo de atención cubo.
- Entrenamiento y evaluación sobre el dataset SEERSE con scripts de Python y PyTorch.
- Soporte de entrenamiento multi-GPU mediante `torchrun` con backend NCCL.
- Compatibilidad con hardware DCU (procesadores de Huawei) mediante DTK.
- No se trata de un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling ni agentes.

## Casos de uso

- Predicción meteorológica a corto plazo (nowcasting): el modelo puede utilizarse para anticipar precipitaciones en los próximos minutos/horas a partir de secuencias de radar. Su atención cuboid permite procesar campos de gran tamaño y capturar correlaciones espaciales y temporales.
- Investigación en ciencia del clima: para estudiar fenómenos como tormentas o frentes mediante la predicción de evolución de variables geofísicas.
- Verificación de sistemas de datos: el script `fake_data.py` genera datos sintéticos para validar el pipeline de carga, entrenamiento e inferencia sin necesidad de datos reales.
- Formación de modelos en infraestructuras heterogéneas: al soportar GPU y DCU, puede desplegarse en clústeres con diferentes aceleradores.
- Evaluación de calidad de predicción: el script `result.py` permite visualizar y comparar las predicciones del modelo contra los datos de prueba.
- Reproducción de resultados de investigación: la implementación sigue el paper original de Earthformer, por lo que sirve como base para reproducir experimentos o extender la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como RMSE, MAE, CSI ni comparaciones con otros modelos. Los datos de rendimiento cuantitativo no se pueden aportar sin inventar cifras.

## Requisitos de hardware

- Entrenamiento e inferencia requieren una GPU o DCU reconocida por PyTorch. La CPU solo se puede usar para generar datos sintéticos y verificar la configuración, pero no para ejecutar los scripts de entrenamiento o inferencia.
- Se recomienda una GPU con VRAM suficiente para los datos de alta resolución (p. ej., 384x384 píxeles), aunque no se especifica el valor exacto.
- Para entrenamiento multi-GPU se utiliza NCCL, por lo que se necesita un entorno con drivers y bibliotecas compatibles.
- Los usuarios de DCU deben instalar DTK 25.04.2 o superior.
- No se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.) en la documentación.
- No se indican opciones de despliegue como vLLM o llama.cpp; el uso previsto es a través de scripts de Python con PyTorch.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Earthformer se enmarca dentro de los modelos de predicción espacio-temporal basados en Transformer, como pueden ser otros enfoques como el de la predicción de precipitación con U-Net o los modelos de predicción global (p. ej., GraphCast o PanguWeather). Sin embargo, no se aportan métricas comparativas en la model card, por lo que no es posible elaborar una tabla de rendimiento.

## Limitaciones y advertencias

- Es un modelo de investigación: no se ha demostrado su validez operativa en producción meteorológica real.
- Los datos sintéticos generados con `fake_data.py` no representan datos reales de SEERSE ni la calidad de las predicciones reales.
- El modelo está entrenado con un conjunto de datos específico (SEERSE) y no se garantiza generalización a otros dominios o regiones.
- No se documentan sesgos específicos, pero al ser un modelo de datos geofísicos, puede heredar sesgos de los datos de entrenamiento (p. ej., distribución geográfica limitada).
- La licencia Apache 2.0 permite uso comercial, pero el uso de los datos SEERSE está sujeto a su propia licencia.
- Los pesos del modelo se indican como "se subirán pronto" en la model card; actualmente no están disponibles (el repositorio solo contiene scripts y código).
- No se ha evaluado la latencia ni el throughput en diferentes hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/Earthformer
- Paper original (arXiv): https://arxiv.org/abs/2207.05833
- Repositorio principal de OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
